---
title: "CUDA grids, blocks, and threads"
description: "Map data parallel work onto CUDA grids and thread blocks while enforcing block-level synchronization constraints."
keywords:
  - CUDA kernel launch
  - grid geometry
  - thread block
  - blockIdx
  - threadIdx
  - blockDim
  - gridDim
  - syncthreads
  - CUDA execution model
  - intra-block synchronization
  - inter-block synchronization
  - GPU thread mapping
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/cuda-grids-blocks-threads
---

This lesson is part of Chapter 4: The GPU (Subchapter 4.2: CUDA). A CUDA kernel launch organizes execution into a 1D, 2D, or 3D grid of thread blocks, where each block contains a group of threads. Threads within the same block can synchronize using `__syncthreads()`, but threads in different blocks cannot synchronize with each other until the entire kernel completes.

:::tip Read these first
- [/docs/parallel-computing/cuda-host-device-copy](/docs/parallel-computing/cuda-host-device-copy): how data transfers between host and device memory before and after a kernel execution
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu): how SIMT hardware executes multiple threads across vector lanes
:::

:::important What you should leave with
Always structure kernel operations assuming thread blocks execute in arbitrary order. Use `__syncthreads()` strictly for coordination within a block, and split work into separate kernel launches whenever all threads across the entire grid must reach a global barrier.
:::

## Why you should care

When offloading loops to a GPU, you must map loop iterations onto thousands of hardware threads. Unlike standard CPU thread pools, CUDA requires you to group threads into blocks.

Consider a simple prefix sum or block-wide smoothing filter:

```cpp
// INCORRECT: Expecting cross-block synchronization inside a single kernel
__global__ void global_dependent_kernel(float *data, int N) {
    int gtid = blockIdx.x * blockDim.x + threadIdx.x;
    if (gtid >= N) return;

    // Step 1: Compute initial value
    data[gtid] = data[gtid] * 2.0f;

    // Attempting to wait for ALL blocks in the grid before Step 2
    // CUDA DOES NOT provide a grid-wide synchronization barrier here!
    // __syncthreads() ONLY synchronizes threads inside the SAME block.

    // Step 2: Read data written by another thread in a DIFFERENT block
    int neighbor = (gtid + 1024) % N;
    float val = data[neighbor]; // Race condition: neighbor block may not have run Step 1!
    data[gtid] = val + 1.0f;
}
```

If you assume `__syncthreads()` acts as a global barrier across the entire GPU, your code will fail with random race conditions or deadlocks. The hardware scheduler reserves the right to execute blocks in any order, concurrently or sequentially, depending on available resources.

## The mechanism

CUDA structures execution using a two-level hierarchy:

1. **Grid**: The full execution domain launched by a kernel call `kernel<<<gridDim, blockDim>>>(...)`.
2. **Block**: A collection of up to 1024 threads scheduled onto a single Streaming Multiprocessor (SM).
3. **Thread**: The individual execution path running on SIMT hardware lanes.



### Hardware scheduling and independence

When you launch a kernel, the CUDA runtime places blocks into a scheduling queue. The GPU distributes blocks to available Hardware Streaming Multiprocessors (SMs).

- A single block runs entirely within **one SM**. It can never span across multiple SMs.
- Multiple blocks can run concurrently on the same SM if register and shared memory resources permit.
- If the hardware does not have enough capacity to run all blocks at once, remaining blocks wait until active blocks finish.

Because block scheduling order is non-deterministic, **blocks must be executable independently**. If Block 1 relies on output produced by Block 3, and Block 3 is queued behind Block 1 waiting for execution slots, the device will deadlock.

### Built-in variable mapping

Every thread calculates its identity using four built-in runtime struct variables (`dim3`):

| Variable | Type | Description |
| :--- | :--- | :--- |
| `gridDim` | `dim3` | Dimensions of the grid (number of blocks per grid dimension). |
| `blockIdx` | `dim3` | Block index within the grid (`0` to `gridDim - 1`). |
| `blockDim` | `dim3` | Dimensions of each block (number of threads per block dimension). |
| `threadIdx` | `dim3` | Thread index within the block (`0` to `blockDim - 1`). |

For a 1D linear array, the global 1D thread ID is calculated as:

$$\text\{gtid\} = \text\{blockIdx.x\} \times \text\{blockDim.x\} + \text\{threadIdx.x\}$$

For a 2D matrix (e.g., image processing), the global 2D coordinate is:

$$\text\{x\} = \text\{blockIdx.x\} \times \text\{blockDim.x\} + \text\{threadIdx.x\}$$
$$\text\{y\} = \text\{blockIdx.y\} \times \text\{blockDim.y\} + \text\{threadIdx.y\}$$

## A worked example

The following runnable C++/CUDA application demonstrates intra-block reduction and synchronization. It calculates the sum of array elements within each block using `__syncthreads()` and writes each block's local total back to host memory.

```cpp
#include <iostream>
#include <vector>
#include <cuda_runtime.h>

#define CUDA_CHECK(err) \
    if (err != cudaSuccess) { \
        std::cerr << "CUDA Error: " << cudaGetErrorString(err) << " at line " << __LINE__ << std::endl; \
        exit(EXIT_FAILURE); \
    }

// Kernel: Per-block sum reduction using shared memory and block barriers
__global__ void block_sum_kernel(const float *in, float *out, int N) {
    // 1. Allocate static shared memory visible ONLY to threads inside this block
    __shared__ float sdata[256];

    int gtid = blockIdx.x * blockDim.x + threadIdx.x;
    int tid  = threadIdx.x;

    // 2. Load data from Global Memory to Shared Memory (or zero if out-of-bounds)
    if (gtid < N) {
        sdata[tid] = in[gtid];
    } else {
        sdata[tid] = 0.0f;
    }

    // Barrier: Ensure all threads in this block completed writing to sdata
    __syncthreads();

    // 3. Tree reduction inside shared memory
    for (unsigned int s = blockDim.x / 2; s > 0; s >>= 1) {
        if (tid < s) {
            sdata[tid] += sdata[tid + s];
        }
        // Synchronize every reduction step before reading values written by peers
        __syncthreads();
    }

    // 4. Thread 0 writes the block result to global output array
    if (tid == 0) {
        out[blockIdx.x] = sdata[0];
    }
}

int main() {
    const int N = 1024;
    const int threadsPerBlock = 256;
    const int blocksPerGrid = (N + threadsPerBlock - 1) / threadsPerBlock;

    std::vector<float> h_in(N, 1.0f); // 1024 elements initialized to 1.0
    std::vector<float> h_out(blocksPerGrid, 0.0f);

    float *d_in = nullptr;
    float *d_out = nullptr;

    CUDA_CHECK(cudaMalloc(&d_in, N * sizeof(float)));
    CUDA_CHECK(cudaMalloc(&d_out, blocksPerGrid * sizeof(float)));

    CUDA_CHECK(cudaMemcpy(d_in, h_in.data(), N * sizeof(float), cudaMemcpyHostToDevice));

    // Launch configuration: Grid of 4 blocks, each with 256 threads
    block_sum_kernel<<<blocksPerGrid, threadsPerBlock>>>(d_in, d_out, N);
    CUDA_CHECK(cudaGetLastError());
    CUDA_CHECK(cudaDeviceSynchronize());

    CUDA_CHECK(cudaMemcpy(h_out.data(), d_out, blocksPerGrid * sizeof(float), cudaMemcpyDeviceToHost));

    std::cout << "Block sums calculated:" << std::endl;
    for (int i = 0; i < blocksPerGrid; ++i) {
        std::cout << "Block " << i << " sum = " << h_out[i] << std::endl;
    }

    CUDA_CHECK(cudaFree(d_in));
    CUDA_CHECK(cudaFree(d_out));

    return 0;
}
```

### Walkthrough of critical lines

1. `__shared__ float sdata[256];`  
   Allocates fast, low-latency shared memory on the SM. All 256 threads within the block access this dynamic memory region, but threads in other blocks cannot see or alter it.

2. `int gtid = blockIdx.x * blockDim.x + threadIdx.x;`  
   Computes the global index of the element to process. `blockIdx.x` selects the block slot, and `threadIdx.x` selects the offset within that block.

3. `__syncthreads();`  
   Forms an execution barrier. No thread in the block can proceed past this line until every thread in the block has executed it. This prevents race conditions where a thread attempts to read `sdata[tid + s]` before the peer thread finished populating `sdata[tid]`.

4. `out[blockIdx.x] = sdata[0];`  
   Because grid-wide synchronization inside a kernel does not exist, thread `0` writes the single combined block result out to global memory indexed by `blockIdx.x`. A secondary host launch (or subsequent kernel) aggregates these block sums.

## What the compiler and runtime can and cannot do

Understanding execution boundaries clarifies optimization limits:

### What the runtime CAN do
- **Dynamic Block Scheduling**: The runtime maps blocks to any free SM depending on hardware capabilities.
- **Concurrency Scaling**: A machine with 80 SMs executes more blocks simultaneously than a machine with 12 SMs, using the exact same kernel invocation.
- **Resource Rejection**: If a kernel requests more shared memory or registers than an SM possesses, the launch fails immediately at runtime with `cudaErrorLaunchOutOfResources`.

### What the compiler and runtime CANNOT do
- **Cross-Block Synchronization inside standard kernels**: The hardware does not provide grid-level barrier instructions for arbitrary launches. You cannot pause all blocks across the device inside a standard kernel without kernel completion.
- **Conditional `__syncthreads()` Safety**: If a call to `__syncthreads()` sits inside a divergent branch (`if (threadIdx.x < 10)`), the hardware hangs indefinitely if not all threads in the block enter the same branch.
- **Automatic Grid Sizing**: The compiler cannot infer the ideal grid size for custom bounds without programmer directives; configuring proper block and grid dimensions remains host responsibility.

## Common misconceptions

### Misconception 1: `__syncthreads()` acts as a GPU-wide global barrier
**Correction**: `__syncthreads()` synchronizes *only* the threads belonging to the host block calling it. Threads in Block 0 cannot wait for or signal threads in Block 1 using this intrinsic. To synchronize the entire grid, end the kernel launch and return control to the host stream, or use Cooperative Groups grid sync on supported devices with specific launch APIs.

### Misconception 2: Block dimensions must always equal 1024 threads
**Correction**: While 1024 is the maximum thread limit per block on modern architectures, choosing maximum block size often starves the SM of available registers and reduces overall active warps (occupancy). Block sizes of 128, 256, or 512 threads usually balance register allocation and execution efficiency better.

### Misconception 3: Threads in a block execute sequentially unless specified
**Correction**: Threads inside a block execute concurrently in warps of 32 threads. Warps are scheduled dynamically by hardware schedulers. Never assume thread `threadIdx.x = 0` runs before or after thread `threadIdx.x = 31` without explicit barrier synchronization.

## Where this leaves you

- Review your kernel global indexing logic to confirm that every access uses correct `blockIdx`, `blockDim`, and `threadIdx` calculations.
- Check all `__syncthreads()` invocations to ensure they execute uniform paths across every thread in the block.
- If your algorithm requires global synchronization across all elements, split your processing into multiple sequential kernel launches on the host.

## What To Read Next

- [/docs/gpu/optimizations](/docs/gpu/optimizations): Optimizing occupancy, memory coalescing, and shared memory usage.
- [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/): How register footprint impacts warp occupancy and block scaling.
- [/docs/gpu/opencl/basic/what_is_opencl](/docs/gpu/opencl/basic/what_is_opencl): How OpenCL maps the same hierarchical execution model to work-groups and work-items.

![Diagram](/img/parallel/cuda-grids-blocks-threads.svg)

## References

- David Kirk and Wen-mei Hwu. *Programming Massively Parallel Processors: A Hands-on Approach*.
- NVIDIA Corporation. *CUDA C++ Programming Guide*.
