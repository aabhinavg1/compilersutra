---
title: "CUDA Memory Spaces: Registers, Shared, Local, and Global Memory"
description: "Learn how CUDA maps variables to registers, local memory, shared memory, and global memory, and how these memory spaces impact runtime performance and compiler code generation."
keywords:
  - CUDA memory spaces
  - registers
  - local memory
  - shared memory
  - global memory
  - GPU memory hierarchy
  - register spilling
  - block shared memory
  - thread local storage
  - GPU bandwidth
  - compiler memory mapping
  - GPU runtime scheduling
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/cuda-memory-spaces
---

CUDA presents hardware memory as distinct memory spaces with differing scopes, lifetimes, and performance characteristics. For compiler authors and runtime developers, understanding how source variables map to registers, shared memory, local memory, and global memory is fundamental to target device execution efficiently.

:::tip Read these first
- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads): How CUDA organizes execution into grids, blocks, and threads.
- [/docs/gpu/optimizations](/docs/gpu/optimizations): Fundamental hardware levers including occupancy, coalescing, and memory reuse.
:::

:::important What you should leave with
Always check variable declarations and access patterns to ensure high-frequency variables reside in registers or block-scoped shared memory, while reserving high-latency global memory for inter-block data exchange and host-device interaction.
:::

## Why you should care

In a GPU execution model, reading data from off-chip global memory requires hundreds of clock cycles. Relying entirely on global memory inside a computational loop quickly starves the execution units, dropping performance regardless of how many parallel threads are scheduled.

Consider a simple 1D array smoothing operation where each output element depends on its adjacent neighbors. If every thread reads directly from global memory, neighboring threads repeatedly fetch identical memory addresses from DRAM:

```cpp
__global__ void smooth_kernel_naive(const float* __restrict__ input, float* output, int N) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx > 0 && idx < N - 1) {
        // Each thread reads input[idx-1], input[idx], and input[idx+1] from global memory
        output[idx] = (input[idx - 1] + input[idx] + input[idx + 1]) * 0.333333f;
    }
}
```

This implementation generates redundant, high-latency global memory transactions across threads in the same thread block. By placing transient values in registers and reusing shared thread-block memory, memory traffic to off-chip DRAM drops dramatically.

## The mechanism

CUDA partitions device memory into four primary spaces based on scope and hardware location.



### 1. Registers
Registers are local to an individual thread. They reside directly on the streaming multiprocessor (SM) register file and offer single-cycle access latency. Scalar variables declared inside a CUDA kernel without explicit qualifiers map to registers by default.

### 2. Local Memory
Local memory is scoped per thread, but it is not physically on-chip register space. When a kernel exceeds available register bounds, or when a thread dynamically indexes an array whose offsets cannot be resolved at compile time, the compiler spills variables to local memory. Local memory resides physically in off-chip DRAM, incurring high global-memory latency.

### 3. Shared Memory
Shared memory is declared using the `__shared__` qualifier. It is shared among all threads residing in the same thread block. Shared memory lives on-chip on the SM, providing low-latency access comparable to L1 cache. It serves as a user-managed cache to exchange data between threads of a single block.

### 4. Global Memory
Global memory is accessible by all threads across all grids and by the host CPU (via driver API copy commands or unified memory structures). It lives in off-chip DRAM. Reads and writes to global memory traverse L2 cache (and optionally SM-level L1 cache), making un-cached or non-coalesced accesses costly.

| Memory Space | Scope | Lifetime | Hardware Location | Relative Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Register** | Thread | Thread | On-Chip Register File | Lowest (1x) |
| **Local** | Thread | Thread | Off-Chip DRAM | High (100x+) |
| **Shared** | Block | Block | On-Chip SRAM / L1 | Low (1x - 5x) |
| **Global** | Grid + Host | Application | Off-Chip DRAM | High (100x+) |

## A worked example

This kernel implements a 1D tile smoothing algorithm. It uses shared memory to load data once per block, eliminating redundant global memory reads for boundary values.

```cpp
#include <cuda_runtime.h>
#include <stdio.h>

#define BLOCK_SIZE 256

__global__ void smooth_kernel_shared(const float* __restrict__ input, float* output, int N) {
    // 1. Thread-private scalar stored in a REGISTER
    int tid = threadIdx.x;
    int gtid = blockIdx.x * blockDim.x + tid;

    // 2. Shared memory allocation visible to all threads in this block
    __shared__ float s_data[BLOCK_SIZE + 2];

    // 3. Coalesced load from GLOBAL memory into REGISTER, then into SHARED memory
    if (gtid < N) {
        s_data[tid + 1] = input[gtid];
    } else {
        s_data[tid + 1] = 0.0f;
    }

    // 4. Handle boundary halo elements for the block
    if (tid == 0) {
        s_data[0] = (gtid > 0) ? input[gtid - 1] : 0.0f;
    }
    if (tid == BLOCK_SIZE - 1) {
        s_data[BLOCK_SIZE + 1] = (gtid + 1 < N) ? input[gtid + 1] : 0.0f;
    }

    // 5. Block barrier to ensure shared memory reads complete before computation
    __syncthreads();

    // 6. Computation reading exclusively from fast SHARED memory
    if (gtid > 0 && gtid < N - 1) {
        float result = (s_data[tid] + s_data[tid + 1] + s_data[tid + 2]) * 0.333333f;
        output[gtid] = result;
    }
}
```

### Execution Walkthrough

1. **Lines 8–9**: `tid` and `gtid` are thread-private scalar variables. The compiler assigns these directly to hardware registers.
2. **Line 12**: `__shared__ float s_data[...]` allocates array space inside the SM's on-chip shared memory for the duration of the thread block execution.
3. **Lines 15–19**: Threads perform a single global memory read to populate their main array element in shared memory.
4. **Lines 22–27**: Threads at boundary index `0` and `BLOCK_SIZE - 1` load the extra halo elements into shared memory from global memory.
5. **Line 30**: `__syncthreads()` acts as a execution barrier. It forces all threads in the block to wait until shared memory writes complete, ensuring no thread reads uninitialized memory.
6. **Lines 33–36**: The computational loop reads neighbor elements entirely from `s_data` (on-chip shared memory) and stores the result back to global memory.

## What the compiler and runtime can and cannot do

- **The compiler CAN** automatically place scalar local variables into registers and inline simple structure accesses.
- **The compiler CAN** emit local memory access instructions (`LDG`/`LDL`) automatically when register allocation exceeds SM capacity or when dynamically-indexed arrays cannot be proven static.
- **The compiler CANNOT** automatically introduce `__shared__` memory staging across generic linear operations without explicit programmer directives or structural annotations.
- **The runtime CAN** statically or dynamically allocate shared memory pool dimensions requested by kernel launch configurations.
- **The runtime CANNOT** bypass physical DRAM access latency when threads generate divergent, non-coalesced access patterns to global or local memory spaces.

## Common misconceptions

### 1. Local memory lives on-chip because it is thread-private
Local memory is thread-private in scope, but it physically resides in off-chip DRAM. A variable spilled to local memory incurs full global memory access latency.

### 2. All thread variables default to shared memory
Variables declared inside a kernel without a qualifier default to thread-private register storage. `__shared__` must be declared explicitly to allocate on-chip block memory.

### 3. Registers are unlimited per thread
Hardware register files have strict per-SM limits. If a kernel uses too many registers per thread, the compiler either spills variables to local memory or the hardware scheduler reduces active block occupancy on the SM. Refer to [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/) for register pressure implications.

## Where this leaves you

Examine kernel assembly (PTX/SASS) or compilation warnings (`-ptxas-options=-v`) to confirm register allocation counts and rule out unintended local memory spills (`0 bytes stack frame, 0 bytes spill stores`).

## What To Read Next

- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads): Grid and block mapping fundamentals.
- [/docs/gpu/optimizations](/docs/gpu/optimizations): Optimizing coalesced memory access and shared memory bank conflicts.
- [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/): How compiler register allocation impacts occupancy.

![Diagram](/img/parallel/cuda-memory-spaces.svg)

## References

- Kirk, D. B., & Hwu, W. W. *Programming Massively Parallel Processors: A Hands-on Approach*. Academic Press.
- NVIDIA Corporation. *CUDA C++ Programming Guide*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/cuda-memory-spaces/)
