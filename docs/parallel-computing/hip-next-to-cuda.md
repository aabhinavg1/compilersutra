---
title: "HIP Next to CUDA"
description: "Understand how HIP abstracts CUDA kernel syntax into a portable runtime API, what the compiler lowers to AMD and NVIDIA targets, and where platform differences persist."
keywords:
  - HIP
  - CUDA
  - ROCm
  - Portable kernel language
  - Heterogeneous-compute Interface for Portability
  - hipcc
  - nvcc
  - GPU compilers
  - AMD ISA
  - PTX lowering
  - Wavefront vs Warp
  - GPU runtime drivers
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/hip-next-to-cuda
---

In Chapter 4 (The GPU), we look at how different platform environments expose massively parallel execution units. In Subchapter 4.3 (ROCm), we examine AMD's open runtime and toolchain ecosystem.

HIP (Heterogeneous-compute Interface for Portability) allows host and kernel C++ code to be written in a single API that compiles for both AMD and NVIDIA devices. While kernel source text and launch configurations are source-compatible, the underlying driver, ISA target, instruction scheduler, and low-level runtime binaries remain distinct for each hardware target.

:::tip Read these first
- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads) — Grids, blocks, and execution syntax in CUDA.
- [/docs/parallel-computing/the-rocm-stack](/docs/parallel-computing/the-rocm-stack) — The ROCm hardware interface, driver, and runtime structure.
:::

:::important What you should leave with
Source-level API mapping does not erase hardware target differences. You can write a single HIP kernel source, but warp versus wavefront size, register file pressure, and vendor-specific math libraries are determined at lower compile and runtime steps.
:::

## Why you should care

When maintaining GPU compilers, runtimes, or high-performance libraries across vendor platforms, duplicating core kernel code creates severe maintenance overhead. Developers often want a single kernel definition and host launch sequence that compiles to run on different GPU hardware targets.

Consider a baseline CUDA kernel for vector addition:

```cpp
// cuda_vecadd.cu
#include <cuda_runtime.h>
#include <stdio.h>

__global__ void vec_add(const float* a, const float* b, float* c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main() {
    int n = 1024;
    size_t bytes = n * sizeof(float);

    float *d_a, *d_b, *d_c;
    cudaMalloc(&d_a, bytes);
    cudaMalloc(&d_b, bytes);
    cudaMalloc(&d_c, bytes);

    // Launch: 4 blocks of 256 threads
    vec_add<<<4, 256>>>(d_a, d_b, d_c, n);

    cudaFree(d_a);
    cudaFree(d_b);
    cudaFree(d_c);
    return 0;
}
```

If you compile this directly with an AMD toolchain, compilation fails. The target compiler expects different headers, types, and launch macros unless a translation layer or uniform runtime interface is applied.

## The mechanism

HIP solves this by providing a C++ dialect and runtime API that maps nearly 1:1 to CUDA syntax, but lowers to target-specific LLVM IR or vendor compiler pipelines based on flags passed to the compiler driver (`hipcc`).



When targets are selected:
1. **AMD Target**: `hipcc` invokes `clang` with the AMDGPU target backend. Headers define `hipMalloc` directly to ROCm driver calls (`hipLaunchKernelGGL`, ROCr runtime).
2. **NVIDIA Target**: `hipcc` includes macro header maps (`hip_runtime.h`) that substitute HIP function names with their CUDA counterparts (e.g., `#define hipMalloc cudaMalloc`) and compiles using `nvcc` or `clang` targeting NVPTX.

The API layer is uniform, but compilation paths split early into distinct target machine codegen paths.

## A comparison

The structural syntax between CUDA and HIP maps directly at source level, but diverges in default runtime execution behaviors and hardware execution parameters:

| Component / Feature | CUDA Native | HIP (AMD Target) | HIP (NVIDIA Target) |
| :--- | :--- | :--- | :--- |
| **Header** | `<cuda_runtime.h>` | `<hip/hip_runtime.h>` | `<hip/hip_runtime.h>` |
| **Launch Syntax** | `kernel<<<g, b, mem, stream>>>(args)` | `hipLaunchKernelGGL(...)` or `<<<g, b, mem, stream>>>` | `<<<g, b, mem, stream>>>` |
| **Hardware Warp/Wavefront Size** | 32 threads | 32 or 64 threads (hardware dependent) | 32 threads |
| **Driver Backend** | libcuda.so | libamdhip64.so / libhsa-runtime64.so | libcuda.so |
| **BLAS Library Equivalent** | cuBLAS | rocBLAS | cuBLAS (via hipBLAS wrapper) |
| **Compiler Toolchain** | NVCC / Clang NVPTX | Clang / LLVM AMDGPU | NVCC |

## A worked example

Here is a complete, runnable vector addition program written in HIP. It compiles cleanly on both platform targets without changing kernel code.

```cpp
// hip_vecadd.cpp
#include <hip/hip_runtime.h>
#include <iostream>
#include <vector>

// Device Kernel
__global__ void vec_add(const float* a, const float* b, float* c, int n) {
    int idx = hipBlockIdx_x * hipBlockDim_x + hipThreadIdx_x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main() {
    int n = 1024;
    size_t bytes = n * sizeof(float);

    std::vector<float> h_a(n, 1.0f);
    std::vector<float> h_b(n, 2.0f);
    std::vector<float> h_c(n, 0.0f);

    float *d_a = nullptr, *d_b = nullptr, *d_c = nullptr;

    // Allocate device memory using HIP runtime API
    hipMalloc(&d_a, bytes);
    hipMalloc(&d_b, bytes);
    hipMalloc(&d_c, bytes);

    // Copy host host buffers to device
    hipMemcpy(d_a, h_a.data(), bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_b, h_b.data(), bytes, hipMemcpyHostToDevice);

    // Launch configuration
    int threads_per_block = 256;
    int blocks_per_grid = (n + threads_per_block - 1) / threads_per_block;

    // Launch using HIP syntax macro/function
    hipLaunchKernelGGL(vec_add, 
                       dim3(blocks_per_grid), 
                       dim3(threads_per_block), 
                       0, // shared memory bytes
                       0, // stream ID
                       d_a, d_b, d_c, n);

    // Copy result back to host
    hipMemcpy(h_c.data(), d_c, bytes, hipMemcpyDeviceToHost);

    // Verify first element
    std::cout << "h_c[0] = " << h_c[0] << std::endl;

    // Free resources
    hipFree(d_a);
    hipFree(d_b);
    hipFree(d_c);

    return 0;
}
```

### Walkthrough of critical lines

- **`#include <hip/hip_runtime.h>`**: Pulls in HIP runtime typedefs, device keywords (`__global__`), and API function signatures.
- **`hipBlockIdx_x`, `hipBlockDim_x`, `hipThreadIdx_x`**: Built-in variables defined by HIP. On CUDA builds, these expand directly to `blockIdx.x`, `blockDim.x`, and `threadIdx.x`.
- **`hipMalloc` and `hipMemcpy`**: Direct functional equivalents to `cudaMalloc` and `cudaMemcpy`. Return type is `hipError_t`.
- **`hipLaunchKernelGGL(...)`**: An explicit C-style macro for launching kernels. It accepts the kernel function name, grid dimensions, block dimensions, dynamic shared memory bytes, stream, and kernel arguments. (Standard `<<<g, b>>>` execution configuration syntax is also supported by `hipcc`).

To compile for an AMD target GPU:
```bash
hipcc -O3 hip_vecadd.cpp -o hip_vecadd
```

To compile for an NVIDIA target GPU:
```bash
hipcc --offload-arch=sm_80 hip_vecadd.cpp -o hip_vecadd
```

## What the compiler and runtime can and cannot do

### What the compiler can do
- **Source translation**: The compiler easily transforms kernel signatures, device built-in variables, and host runtime calls between platforms.
- **Intrinsic abstraction**: Functions like `__shfl_down` map automatically to target warp or wavefront reduction primitives across architectures.

### What the compiler cannot do
- **Hide wavefront execution width differences**: AMD architectures often use a 64-thread wavefront execution width by default (or 32 in modern RDNA variants), whereas NVIDIA hard-codes a 32-thread warp width. Hard-coded warp assumptions in warp-level primitives (like `__shfl_sync` assuming mask size `0xffffffff`) can fail or execute incorrectly if compiled without considering the hardware wavefront width.
- **Equalize register pressure**: A HIP kernel compiling cleanly does not guarantee identical register usage across targets. Target-specific ISA backends generate different machine code that can spill registers on one device while fitting cleanly into another.

## Common misconceptions

### "HIP is a translation layer that slows down execution on CUDA"
On NVIDIA targets, HIP headers wrap CUDA driver and runtime calls directly via zero-overhead macros. The generated binary links against native CUDA runtime libraries. There is no interpreter or translation overhead at runtime.

### "Code ported to HIP executes identically on AMD and NVIDIA hardware"
While the API syntax matches, divergent hardware behaviors—such as memory coalescing bounds, warp versus wavefront sizes, and shared memory bank structures—require tuning to achieve optimal performance on each device target.

## Where this leaves you

Check your codebase for hardcoded target assumptions before relying on source portability:
1. Replace explicit hardware constants like `32` in thread index math with API queries or build constants (`warpSize`).
2. Verify that library invocations use target abstraction wrappers (such as `hipBLAS` or `hipFFT`) instead of calling vendor libraries (`cuBLAS`, `rocBLAS`) directly inside generic kernels.

## What To Read Next

- [/docs/parallel-computing/the-rocm-stack](/docs/parallel-computing/the-rocm-stack) — The underlying hardware interface drivers that receive HIP instructions.
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — Fundamentals of SIMT execution and hardware lane mapping.
- [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/) — Understanding how register consumption changes occupancy across targets.

![Diagram](/img/parallel/hip-next-to-cuda.svg)

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*.
- Kirk, David B., and Wen-mei W. Hwu. *Programming Massively Parallel Processors: A Hands-on Approach*.
- Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*.
