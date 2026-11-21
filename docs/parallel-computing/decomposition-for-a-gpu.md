---
title: "Decomposition for a GPU"
description: "Structure GPU kernels by mapping one independent output element to each thread to eliminate inter-thread communication and synchronization."
keywords:
  - GPU decomposition
  - CUDA thread mapping
  - output domain decomposition
  - input-centric vs output-centric
  - grid-stride loop
  - atomic collision
  - kernel synchronization
  - data parallelism
  - CUDA kernel design
  - memory coalescing
  - reduction bottleneck
  - work distribution
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/decomposition-for-a-gpu
---

GPU performance relies on decomposing a problem so each thread can compute its output without talking to neighboring threads. When threads share state or update a common global value, the hardware's massive parallel capacity collapses into memory serialized by atomic lockouts and synchronization barriers.

:::tip Read these first
- [/docs/parallel-computing/decomposition-tasks-and-mapping](/docs/parallel-computing/decomposition-tasks-and-mapping): Task and data domain decomposition on CPUs.
- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads): Mapping physical threads to global array indexes in CUDA.
:::

:::important What you should leave with
Before writing a CUDA kernel, assign every global work thread ownership of a single, independent output element rather than pushing input values into shared destinations.
:::

## Why you should care

Consider building a simple array scale-and-histogram calculation. A naive decomposition focuses on the input: each thread takes an input element and updates a global counter array (a scatter approach).

```cpp
// Naive Input-Centric Decomposition: Causes heavy atomic contention
__global__ void count_bincounts_input_centric(const int* __restrict__ input,
                                              int* __restrict__ bins,
                                              int N) {
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    if (tid < N) {
        int bin_idx = input[tid];
        // High contention: thousands of threads try to update the same memory location simultaneously
        atomicAdd(&bins[bin_idx], 1);
    }
}
```

If millions of input items map to only a few bin locations, thousands of GPU threads attempt `atomicAdd` on the same memory addresses at once. The GPU runtime must serialize these writes, stalling warps and destroying throughput.

If we instead structure the work around an output-centric model—where every thread owns a distinct output item and reads all necessary inputs—we eliminate atomic locks and global inter-thread communication entirely.

## The mechanism

The primary decision when targeting a GPU execution model is whether to choose an input-centric or output-centric strategy:

1. **Input-Centric (Scatter / Push):** Threads process input elements and write outputs to locations determined at runtime. Because multiple threads can push results to the same output location, synchronization mechanisms like `atomicAdd` or warp-level shuffles become mandatory.
2. **Output-Centric (Gather / Pull):** Each thread is assigned a unique index in the output buffer. The thread reads whichever inputs are needed, performs its calculations in private registers, and writes a single final result to its assigned output index.



When outputs are fully independent, the runtime schedules warps without memory barriers or lock arbitration. When reductions or global dependencies cannot be avoided, the computation must be decomposed into multiple steps:
1. **Local independent phase:** Threads process local chunks and produce thread- or block-local outputs.
2. **Synchronized reduction phase:** Block-level reductions run using shared memory and tree-based sweeps, minimizing global communication until the final stage.

## A worked example

Here is a 1D Stencil operation. Stencils show why an output-centric decomposition succeeds: each output element depends on a window of input values. If threads pushed input values to output arrays, multiple threads would attempt writes to identical neighbors. By having each thread pull its required inputs to calculate its assigned output index, output writes are strictly independent.

```cpp
#include <cuda_runtime.h>
#include <stdio.h>

#define RADIUS 2
#define BLOCK_SIZE 256

// Output-centric 1D stencil kernel
__global__ void stencil_1d_output_centric(const float* __restrict__ in,
                                          float* __restrict__ out,
                                          int N) {
    // 1. Calculate unique output index for this thread
    int out_idx = blockIdx.x * blockDim.x + threadIdx.x;

    // 2. Guard against out-of-bounds execution
    if (out_idx >= N) return;

    // 3. Gather inputs locally into registers (no communication between threads needed)
    float result = 0.0f;
    for (int offset = -RADIUS; offset <= RADIUS; ++offset) {
        int in_idx = out_idx + offset;
        
        // Clamp boundary conditions to the edge elements
        if (in_idx < 0) in_idx = 0;
        if (in_idx >= N) in_idx = N - 1;
        
        result += in[in_idx];
    }

    // 4. Write directly to unique, independent output index
    out[out_idx] = result;
}

int main() {
    const int N = 1024 * 1024;
    size_t bytes = N * sizeof(float);

    float *h_in = (float*)malloc(bytes);
    float *h_out = (float*)malloc(bytes);

    for (int i = 0; i < N; ++i) h_in[i] = 1.0f;

    float *d_in, *d_out;
    cudaMalloc(&d_in, bytes);
    cudaMalloc(&d_out, bytes);

    cudaMemcpy(d_in, h_in, bytes, cudaMemcpyHostToDevice);

    int threadsPerBlock = BLOCK_SIZE;
    int blocksPerGrid = (N + threadsPerBlock - 1) / threadsPerBlock;

    stencil_1d_output_centric<<<blocksPerGrid, threadsPerBlock>>>(d_in, d_out, N);

    cudaMemcpy(h_out, d_out, bytes, cudaMemcpyDeviceToHost);

    printf("out[100] = %f (expected 5.0)\n", h_out[100]);

    cudaFree(d_in);
    cudaFree(d_out);
    free(h_in);
    free(h_out);

    return 0;
}
```

### Walkthrough of important lines

- **Line 12:** `int out_idx = blockIdx.x * blockDim.x + threadIdx.x;` maps each CUDA thread directly to a single element of the `out` array.
- **Line 15:** `if (out_idx >= N) return;` guarantees threads past the boundary terminate safely without corrupting memory.
- **Lines 18–26:** The thread gathers neighboring values from `in`. Even if multiple threads read overlapping elements of `in`, concurrent reads never require lock-outs or atomic operations.
- **Line 29:** `out[out_idx] = result;` performs an independent write. Because no two threads share an `out_idx`, this instruction runs at full DRAM bandwidth without data races.

## What the compiler and runtime can and cannot do

- **The compiler can:**
  - Unroll static input-gather loops (such as the `RADIUS` loop above) into unrolled load instructions.
  - Reorder independent global reads to increase instruction-level parallelism and hide memory latency.

- **The compiler cannot:**
  - Automatically transform an input-centric kernel using global `atomicAdd` instructions into an output-centric gather kernel without changing algorithm semantics.
  - Guarantee global synchronization across distinct thread blocks inside a single kernel launch.

- **The runtime can:**
  - Schedule thread blocks across hardware Streaming Multiprocessors (SMs) in any arbitrary order.

- **The runtime cannot:**
  - Resolve deadlocks caused by inter-block dependencies or custom spinlocks waiting on other blocks in the grid.

## Common misconceptions

### "Using atomics is acceptable if my GPU is fast enough"
Atomics targeting the same memory location serialize hardware execution. Even on high-throughput architectures, thousands of threads competing for a single address execute sequentially, effectively reducing the GPU's compute capability to that of a single core.

### "Grid-level reductions can be computed in a single kernel step without atomics"
CUDA lacks a lightweight global synchronization barrier across all blocks in a grid during execution. Global reductions across an entire machine require either multiple kernel launches or multi-pass tree-based atomic reductions.

### "Input-centric algorithms map better to memory because input arrays are accessed sequentially"
While input arrays may be read linearly, writing to arbitrary scattered locations destroys write memory coalescing. Output-centric algorithms ensure that output writes are perfectly coalesced across adjacent thread IDs in a warp.

## Where this leaves you

Audit your GPU kernels for global array writes. If threads compute indices dynamically and write to shared target buffers using atomics, refactor the algorithm to assign one thread per destination element, gathering input values as needed.

## What To Read Next

- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads): Grid indexing structures for 1D, 2D, and 3D output spaces.
- [/docs/parallel-computing/coalescing-and-latency-hiding](/docs/parallel-computing/coalescing-and-latency-hiding): Structuring global memory transactions for peak throughput.
- [/docs/gpu/optimizations](/docs/gpu/optimizations): Memory access optimization patterns on graphics devices.

![Diagram](/img/parallel/decomposition-for-a-gpu.svg)

## References

- Kirk, D. B., & Hwu, W. W. *Programming Massively Parallel Processors: A Hands-on Approach*. Morgan Kaufmann.
- Grama, A., Gupta, A., Karypis, G., & Kumar, V. *Introduction to Parallel Computing*. Addison-Wesley.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/decomposition-for-a-gpu/)
