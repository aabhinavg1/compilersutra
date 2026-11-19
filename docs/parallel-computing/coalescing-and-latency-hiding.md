---
title: "Coalescing and Latency Hiding"
description: "How adjacent thread indexing forms single memory bursts and how warp schedulers overlap execution to hide global memory latency."
keywords:
  - coalescing
  - latency hiding
  - global memory
  - warp scheduler
  - memory transaction
  - memory stride
  - CUDA memory access
  - GPU occupancy
  - warp execution
  - SIMT memory access
  - memory alignment
  - memory bandwidth
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/coalescing-and-latency-hiding
---

# Coalescing and Latency Hiding

In GPU architectures, global memory latency spans hundreds of clock cycles. High throughput depends on two hardware behaviors: coalescing thread memory requests into unified hardware transactions, and switching warps to hide memory stalls.

:::tip Read these first
- [/docs/parallel-computing/cuda-memory-spaces](/docs/parallel-computing/cuda-memory-spaces): global, shared, and local memory hardware abstractions.
- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads): how threads organize into warps and execution blocks.
:::

:::important What you should leave with
Verify that thread indices map linearly to contiguous memory addresses within each warp, and maintain sufficient ready warps per SM to issue independent instructions while memory requests are in flight.
:::

## Why you should care

When threads in a warp access global memory, the memory interface does not service each thread individually. Instead, hardware detects the pattern of addresses requested across all 32 threads in a warp and attempts to fulfill them using the fewest aligned memory transactions possible.

Consider a simple matrix transpose or image channel operation where data is organized as a 2D grid. The choice between reading row-major vs. column-major layout within a warp radically alters execution time:

```cpp
// Bad pattern: adjacent threads read down a column with stride STRIDE
__global__ void strided_read(const float *src, float *dst, int stride) {
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    // Thread 0 reads src[0], Thread 1 reads src[stride], Thread 2 reads src[2*stride]...
    dst[tid] = src[tid * stride]; 
}

// Good pattern: adjacent threads read consecutive elements in a row
__global__ void coalesced_read(const float *src, float *dst) {
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    // Thread 0 reads src[0], Thread 1 reads src[1], Thread 2 reads src[2]...
    dst[tid] = src[tid]; 
}
```

In `strided_read`, each thread in the warp targets an address spaced `stride` elements apart. If `stride` is large, every single thread requires a distinct cache line or memory transaction segment. The GPU hardware spends significant time servicing dozens of redundant memory requests for a single warp, stalling thread execution and saturating the memory bus.

## The mechanism

GPU hardware reads global memory in fixed-size, naturally aligned memory segments (typically 32, 64, or 128 bytes depending on the generation and memory hierarchy level).

### 1. Memory Coalescing

When a warp executes an instruction that loads or stores global memory, the GPU hardware evaluates the requested addresses across all active threads in the warp.

- **Coalesced Access:** If thread 0 through thread 31 request consecutive 4-byte values starting at an aligned 128-byte boundary, the hardware merges these 32 individual requests into a single 128-byte DRAM/L2 transaction segment.
- **Strided Access:** If thread 0 through thread 31 request 4-byte values spaced apart (e.g., stride 32 floats), the addresses span 32 different 128-byte memory segments. The hardware must issue 32 distinct memory transactions to satisfy the single instruction.



### 2. Latency Hiding

Global memory access carries a latency penalty (often hundreds of clock cycles). Unlike CPU cores, which use deep cache hierarchies and branch prediction to minimize instruction stalls, GPUs use hardware multithreading to tolerate memory latency.

- **Warp Schedulers:** Each Streaming Multiprocessor (SM) contains warp schedulers that check the readiness of resident warps every cycle.
- **Warp State:** A warp is *eligible* if all operands for its next instruction are available and functional units are ready.
- **Context Switching:** Switching execution between resident warps costs zero cycles because each thread’s register state remains in the physical register file on the SM.
- **The Condition:** Latency hiding succeeds only if there are enough eligible warps ready to run while other warps wait for memory transactions to settle.

If hardware resource constraints—such as register usage per thread or shared memory usage per block—limit the number of resident warps (low occupancy), the warp scheduler runs out of ready warps. The SM then sits idle, exposing full global memory latency.

## A comparison

The performance impact of memory coalescing depends directly on the access stride across threads of a warp.

| Access Pattern | Thread `i` Address Formula | Transactions per 32 Threads (4-byte floats) | Bus Efficiency |
| :--- | :--- | :--- | :--- |
| **Coalesced** | `base + threadIdx.x` | 1 segment (128 bytes) | High (100% payload bytes used) |
| **Strided (Stride 2)** | `base + threadIdx.x * 2` | 2 segments (2 x 128 bytes) | Medium (50% payload bytes used) |
| **Strided (Stride 32)** | `base + threadIdx.x * 32` | 32 segments (32 x 128 bytes) | Low (~3.1% payload bytes used) |
| **Unaligned** | `base + threadIdx.x + 1` | 2 segments (split over cache lines) | Moderate (depends on boundary split) |

When bus efficiency drops, global memory bandwidth is consumed largely by unneeded bytes within fetched cache lines, limiting execution speed.

## A worked example

Below is a complete CUDA kernel demonstrating how to transpose a matrix using shared memory to convert a strided global memory access pattern into a coalesced pattern.

```cpp
#include <cuda_runtime.h>
#include <stdio.h>

#define TILE_DIM 32
#define BLOCK_ROWS 8

// Transpose kernel using shared memory to achieve coalesced reads AND writes
__global__ void transposeCoalesced(const float *in, float *out, int width, int height) {
    // Allocate shared memory tile with padding to prevent shared memory bank conflicts
    __shared__ fillTile[TILE_DIM][TILE_DIM + 1];

    int x = blockIdx.x * TILE_DIM + threadIdx.x;
    int y = blockIdx.y * TILE_DIM + threadIdx.y;

    // Line 12: Coalesced read from global memory into shared memory
    for (int j = 0; j < TILE_DIM; j += BLOCK_ROWS) {
        if ((x < width) && ((y + j) < height)) {
            tile[threadIdx.y + j][threadIdx.x] = in[(y + j) * width + x];
        }
    }

    // Line 18: Synchronize threads so the full tile is present before writing
    __syncthreads();

    // Line 21: Re-calculate global memory target coordinates for transposed write
    x = blockIdx.y * TILE_DIM + threadIdx.x; 
    y = blockIdx.x * TILE_DIM + threadIdx.y;

    // Line 25: Coalesced write to global memory from shared memory
    for (int j = 0; j < TILE_DIM; j += BLOCK_ROWS) {
        if ((x < height) && ((y + j) < width)) {
            out[(y + j) * height + x] = tile[threadIdx.x][threadIdx.y + j];
        }
    }
}
```

### Walkthrough of critical lines

1. **Shared Memory Definition (`__shared__ tile...`)**: Shared memory acts as an intermediate scratchpad residing directly on the SM hardware, offering high bandwidth and low access latency.
2. **Line 14 (`tile[threadIdx.y + j][threadIdx.x] = in[(y + j) * width + x]`)**:
   - `threadIdx.x` varies continuously across adjacent threads in a warp.
   - The expression `(y + j) * width + x` increases by 1 for each increment of `threadIdx.x`.
   - This creates a **coalesced read** from `in`.
3. **Line 19 (`__syncthreads()`)**:
   - Ensures all threads in the thread block finish loading data into `tile` before any thread reads from it for the write-out phase.
4. **Lines 21-22**:
   - Swaps block coordinates (`blockIdx.y` and `blockIdx.x`) to change layout orientation.
5. **Line 26 (`out[(y + j) * height + x] = tile[threadIdx.x][threadIdx.y + j]`)**:
   - Reads from shared memory using transposed indices `tile[threadIdx.x][threadIdx.y + j]`.
   - Writes to `out[(y + j) * height + x]`, where `threadIdx.x` is again the linear stride term.
   - This turns what would have been a strided write into a **coalesced write** to global memory.

## What the compiler and runtime can and cannot do

Understanding where responsibility lies between hardware, compiler, and software developer prevents performance bottlenecks.

### What the compiler can do
- **Structure Vectorization:** Compilers can reorder independent instructions within a thread to issue memory loads earlier, increasing instruction-level parallelism (ILP).
- **Auto-Vectorization:** In simple loops, the compiler may attempt to emit `LDG.E.128` (128-bit vector load instructions) if data pointers are marked non-aliased and properly aligned.

### What the runtime and hardware can do
- **Dynamic Merging:** Hardware memory controllers coalesce active thread addresses within a single warp on the fly for each executed memory instruction.
- **Warp Scheduling:** Hardware warp schedulers select ready warps for execution every clock cycle without software overhead.

### What the compiler and runtime CANNOT do
- **Fix Data Layouts:** Neither compiler nor runtime can automatically alter global matrix storage representations (e.g., changing Array-of-Structures to Structure-of-Arrays) across external system allocations.
- **Guarantee Occupancy under Register Pressure:** If a kernel requests excessive registers per thread, hardware cannot host as many resident warps per SM. See [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/) for details on register pressure.

## Common misconceptions

### 1. High occupancy always guarantees high performance
Occupancy is the ratio of active warps per SM to the maximum warps the hardware can support. High occupancy provides more potential warps to hide memory latency. However, if memory access patterns are severely uncoalesced, total bandwidth becomes saturated by redundant transactions, and high occupancy cannot eliminate the execution bottleneck.

### 2. Global memory accesses must start at address 0 to coalesce
Hardware coalescing requires that addresses fall within naturally aligned 32-, 64-, or 128-byte segments. The start address does not need to be zero; it only needs to meet alignment rules for the requested access size.

### 3. Strided access affects only memory read speed
Strided stores behave identically to strided loads at the memory controller interface. Non-contiguous writes cause partial cache line writes and multiple DRAM write bursts, incurring bandwidth penalties identical to non-contiguous reads.

## Where this leaves you

Inspect the indexing calculations across threads in your CUDA kernels:

1. Confirm that `threadIdx.x` maps directly to contiguous memory offsets in your inner data access loops.
2. If strided accesses are required by matrix or tensor geometry, stage data into shared memory using coalesced reads first, synchronize, and then access data from shared memory.
3. Check kernel resource usage (registers and shared memory per block) to confirm that SM warp schedulers maintain enough eligible warps to mask memory access latency.

## What To Read Next

- [/docs/gpu/optimizations](/docs/gpu/optimizations) — Practical GPU optimization levers including coalescing, shared memory tiling, and occupancy balance.
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — The execution model behind SIMT cores and hardware warps.
- [/docs/parallel-computing/cuda-memory-spaces](/docs/parallel-computing/cuda-memory-spaces) — Memory hierarchies, shared memory banks, and lifetime scopes.

![Diagram](/img/parallel/coalescing-and-latency-hiding.svg)

## References

- Kirk, D. B., & Hwu, W. W. *Programming Massively Parallel Processors: A Hands-on Approach*. Morgan Kaufmann.
- NVIDIA Corporation. *CUDA C++ Programming Guide*. Memory Hierarchy and Performance Guidelines.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/coalescing-and-latency-hiding/)
