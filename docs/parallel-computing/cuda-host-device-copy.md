---
title: "CUDA: Host, Device, and the Copy"
description: "How CUDA separates CPU host memory from GPU device memory, requires explicit pointers, and manages data movement across the PCIe bus."
keywords:
  - CUDA programming model
  - cudaMalloc
  - cudaMemcpy
  - cudaFree
  - host and device memory
  - GPU host memory
  - GPU device memory
  - PCIe data transfer
  - GPU memory allocation
  - CUDA kernel launch
  - host memory vs device memory
  - CUDA memory management
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/cuda-host-device-copy
---

In CUDA, the host (CPU) and the device (GPU) maintain separate memory address spaces. A kernel executing on the GPU cannot dereference host pointers, and CPU code cannot dereference GPU device pointers.

:::tip Read these first
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — What is a GPU?: SIMT hardware runs many lanes on one instruction stream
- [/docs/parallel-computing/from-graphics-pipeline-to-a-kernel](/docs/parallel-computing/from-graphics-pipeline-to-a-kernel) — From the graphics pipeline to a processor you can program
:::

:::important What you should leave with
Before launching a kernel, verify that every pointer passed to `__global__` functions points to device memory allocated via the CUDA runtime (such as `cudaMalloc`), not host memory allocated via `malloc` or `new`.
:::

## Why you should care

In standard C or C++, passing a pointer to a function gives that function direct access to the referenced memory. On a heterogeneous system with a discrete GPU, the CPU and GPU have physically distinct DRAM pools connected over a bus such as PCIe.

If you pass a CPU host pointer directly to a CUDA kernel, the GPU hardware will attempt to dereference an address that does not exist in its memory subsystem. Depending on the architecture and operating system, this results in an invalid device memory access, corrupted data, or a runtime crash.

```cpp
// INCORRECT: Passing host pointers directly to a CUDA kernel
void run_faulty_kernel(float* host_in, float* host_out, int N) {
    // host_in and host_out live in CPU RAM.
    // Calling a kernel with these pointers will fail at runtime on the device.
    vector_add_kernel<<<1, 256>>>(host_in, host_out, N); 
}
```

To execute a computation on the GPU, the compiler and runtime require an explicit pattern: allocate memory on the device, copy inputs from the host to the device, launch the kernel using device pointers, copy results back to the host, and free the device memory.

## The mechanism

The host-device execution cycle divides responsibility between the CPU execution environment and the GPU execution environment:

1. **Host Allocation**: The host allocates system RAM for its own data using standard functions like `malloc` or `std::vector`.
2. **Device Allocation**: The host calls `cudaMalloc()` to request a region of high-bandwidth device memory (VRAM) managed by the GPU runtime.
3. **Host-to-Device Copy**: The host calls `cudaMemcpy()` with `cudaMemcpyHostToDevice` to copy data across the system bus into VRAM.
4. **Kernel Launch**: The host issues an asynchronous kernel launch (`<<<...>>>`), passing the device pointers. The GPU executes the kernel threads against VRAM.
5. **Device-to-Host Copy**: The host calls `cudaMemcpy()` with `cudaMemcpyDeviceToHost`, which blocks host execution until the GPU finishes writing its outputs and copies the data back into CPU memory.
6. **Device Deallocation**: The host frees VRAM using `cudaFree()`.

```
Host (CPU) Memory                       Device (GPU) Memory
+-----------------+                     +-----------------+
|  host_a, host_b | -- cudaMemcpy H2D ->|  dev_a, dev_b   |
|                 |    (PCIe Bus)       |                 |
|                 |                     | [Kernel Execution]
|                 |                     |        |        |
|  host_c         | <- cudaMemcpy D2H --|      dev_c      |
+-----------------+                     +-----------------+
```

Because host and device addresses belong to different spaces, passing a host pointer to a kernel causes a hardware fault on the GPU when a warp attempts to load or store to that address.

## A worked example

The following runnable C++ program illustrates the mandatory lifecycle of data movement between the host and device.

```cpp
#include <iostream>
#include <vector>
#include <cuda_runtime.h>

// CUDA Kernel running on the GPU device
__global__ void add_vectors(const float* a, const float* b, float* c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

// Helper for checking CUDA API errors
#define CHECK_CUDA(call) \
    do { \
        cudaError_t err = call; \
        if (err != cudaSuccess) { \
            std::cerr << "CUDA Error: " << cudaGetErrorString(err) \
                      << " at line " << __LINE__ << std::endl; \
            exit(EXIT_FAILURE); \
        } \
    } while (0)

int main() {
    const int N = 10000;
    const size_t bytes = N * sizeof(float);

    // 1. Allocate and initialize host memory
    std::vector<float> h_a(N, 1.0f);
    std::vector<float> h_b(N, 2.0f);
    std::vector<float> h_c(N, 0.0f);

    // 2. Declare device pointers and allocate device memory
    float *d_a = nullptr;
    float *d_b = nullptr;
    float *d_c = nullptr;

    CHECK_CUDA(cudaMalloc(&d_a, bytes));
    CHECK_CUDA(cudaMalloc(&d_b, bytes));
    CHECK_CUDA(cudaMalloc(&d_c, bytes));

    // 3. Copy inputs from Host memory to Device memory
    CHECK_CUDA(cudaMemcpy(d_a, h_a.data(), bytes, cudaMemcpyHostToDevice));
    CHECK_CUDA(cudaMemcpy(d_b, h_b.data(), bytes, cudaMemcpyHostToDevice));

    // 4. Launch kernel on the device
    int threadsPerBlock = 256;
    int blocksPerGrid = (N + threadsPerBlock - 1) / threadsPerBlock;
    add_vectors<<<blocksPerGrid, threadsPerBlock>>>(d_a, d_b, d_c, N);

    // Check for launch errors
    CHECK_CUDA(cudaGetLastError());

    // 5. Copy result back from Device memory to Host memory
    CHECK_CUDA(cudaMemcpy(h_c.data(), d_c, bytes, cudaMemcpyDeviceToHost));

    // Verify results on the host
    std::cout << "h_c[0] = " << h_c[0] << " (Expected 3.0)" << std::endl;
    std::cout << "h_c[N-1] = " << h_c[N - 1] << " (Expected 3.0)" << std::endl;

    // 6. Free device memory
    CHECK_CUDA(cudaFree(d_a));
    CHECK_CUDA(cudaFree(d_b));
    CHECK_CUDA(cudaFree(d_c));

    return 0;
}
```

### Line-by-line explanation

- **`__global__ void add_vectors(...)`**: Declares a kernel function executing on the device, callable from the host.
- **`cudaMalloc(&d_a, bytes)`**: Allocates `bytes` of memory on the GPU. The function writes the resulting device address into the host pointer variable `d_a`.
- **`cudaMemcpy(d_a, h_a.data(), bytes, cudaMemcpyHostToDevice)`**: Synchronously transfers `bytes` from host address `h_a.data()` to device address `d_a`.
- **`add_vectors<<<blocksPerGrid, threadsPerBlock>>>(d_a, d_b, d_c, N)`**: Launches the GPU kernel asynchronously. The execution arguments inside `<<< >>>` specify grid and block dimensions.
- **`cudaMemcpy(h_c.data(), d_c, bytes, cudaMemcpyDeviceToHost)`**: Transfers results back. This call acts as a synchronization barrier: the CPU blocks until all preceding GPU work in the default stream completes and data arrives in host memory.
- **`cudaFree(d_a)`**: Releases the GPU memory back to the device runtime.

## What the compiler and runtime can and cannot do

### What the runtime handles
- **Virtual Memory Tracking**: The CUDA driver maintains mapping tables tracking which device pointers belong to which active context.
- **Synchronized Copy Scheduling**: `cudaMemcpy` handles staging through host intermediate buffers if the host memory is unpinned (pageable).

### What the runtime and compiler CANNOT do
- **Automatic Host-Device Dereference Checking**: The C++ host compiler (like `g++` or `clang`) treats GPU pointers as standard raw pointers (`T*`). It cannot detect at compile time if you pass a host pointer to a GPU kernel or a GPU pointer to a C library function like `printf` on the CPU.
- **Automatic Transfer Optimization**: The runtime cannot infer when data is no longer needed on the device. Omitting `cudaFree` leads to device memory leaks until the host process exits.

## Common misconceptions

### 1. Unified Memory removes the need to understand explicit transfers
Unified Memory (`cudaMallocManaged`) allows a single pointer to be accessed on both CPU and GPU by triggering automatic page faults across the bus. However, underlying hardware execution still transfers pages over PCIe. Understanding host and device memory distinctions remains essential for performance tuning and tracking memory movement cost.

### 2. `cudaMemcpy` executes asynchronously relative to the CPU by default
Standard `cudaMemcpy` calls are blocking transfers. The CPU thread stops executing until the entire memory transfer finishes. Only specialized calls like `cudaMemcpyAsync` return control to the CPU immediately.

### 3. Kernel launches wait for `cudaMemcpy` to finish
Kernel execution syntax `<<<...>>>` is asynchronous to the host CPU. However, inside the default execution stream, the CUDA driver executes commands sequentially. A kernel launched after a blocking `cudaMemcpy` will wait for that copy to finish before executing on the hardware.

## Where this leaves you

When building or debugging GPU pipelines, audit memory allocations to ensure that:
1. Pointers passed to `<<<...>>>` kernel launches were allocated by device runtime functions (e.g., `cudaMalloc`).
2. CPU algorithms do not attempt to read from or write to `d_` device pointers directly.

## What To Read Next

- [/docs/parallel-computing/fundamentals/memory-models](/docs/parallel-computing/fundamentals/memory-models) — Memory Models: shared memory still has an ordering contract
- [/docs/gpu/optimizations](/docs/gpu/optimizations) — GPU Optimizations: occupancy, coalescing, and shared memory are the levers after the kernel is correct
- [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/) — GPU Register Pressure: too many live values spills a kernel and cuts occupancy

## References

- Kirk, D. B., & Hwu, W. W. *Programming Massively Parallel Processors: A Hands-on Approach*. Morgan Kaufmann.
- NVIDIA Corporation. *CUDA C++ Programming Guide*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/cuda-host-device-copy/)
