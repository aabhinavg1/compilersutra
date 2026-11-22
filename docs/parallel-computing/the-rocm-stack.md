---
title: "The ROCm Stack"
description: "Understand the layers of AMD's ROCm ecosystem, from the HIP language frontend down through LLVM code generation and the HSA runtime to the GPU driver."
keywords:
  - ROCm stack architecture
  - HIP programming model
  - hipcc compiler workflow
  - AMDGPU LLVM backend
  - HSA runtime architecture
  - ROCR runtime driver
  - host device memory copies
  - HIP kernel launch mechanism
  - offloading compiler pipeline
  - GPU dispatch queues
  - heterogeneous system architecture
  - ROCm runtime API
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/the-rocm-stack
---

The AMD ROCm ecosystem separates the programming model from the hardware through distinct software layers: an language frontend (HIP), an LLVM-based compiler infrastructure, a user-mode runtime (ROCR/HSA), and a kernel-mode driver. For compiler and runtime engineers, understanding these boundaries is essential for diagnosing launch overhead, optimizing code generation, and target-specific intermediate representations.

:::tip Read these first
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — GPU execution model and SIMT architecture
- [/docs/parallel-computing/cuda-host-device-copy](/docs/parallel-computing/cuda-host-device-copy) — Host and device memory spaces and copies
:::

:::important What you should leave with
Know which layer owns a given operation: HIP handles host source abstractions, Clang/LLVM lowers kernels to ISA code objects, ROCR enqueues work packets into hardware queues, and the kernel driver manages GPU page tables and hardware interrupts.
:::

## Why you should care

When high-performance device code fails, stalls, or generates slow assembly, the defect rarely sits in isolation within the kernel source. A host program targeting AMD GPUs relies on a execution stack that lowers single-source C++ down to machine instructions and signals hardware dispatch queues.

Consider a minimal vector addition program written for the ROCm environment:

```cpp
#include <hip/hip_runtime.h>
#include <iostream>
#include <vector>

__global__ void vector_add(const float* a, const float* b, float* c, int n) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < n) {
        c[idx] = a[idx] + b[idx];
    }
}

int main() {
    constexpr int N = 1024;
    constexpr size_t bytes = N * sizeof(float);

    std::vector<float> h_a(N, 1.0f);
    std::vector<float> h_b(N, 2.0f);
    std::vector<float> h_c(N, 0.0f);

    float *d_a = nullptr, *d_b = nullptr, *d_c = nullptr;
    hipMalloc(&d_a, bytes);
    hipMalloc(&d_b, bytes);
    hipMalloc(&d_c, bytes);

    hipMemcpy(d_a, h_a.data(), bytes, hipMemcpyHostToDevice);
    hipMemcpy(d_b, h_b.data(), bytes, hipMemcpyHostToDevice);

    constexpr int threadsPerBlock = 256;
    constexpr int blocks = (N + threadsPerBlock - 1) / threadsPerBlock;

    hipLaunchKernelGGL(vector_add, dim3(blocks), dim3(threadsPerBlock), 0, 0, d_a, d_b, d_c, N);

    hipMemcpy(h_c.data(), d_c, bytes, hipMemcpyDeviceToHost);

    std::cout << "Result [0]: " << h_c[0] << std::endl;

    hipFree(d_a);
    hipFree(d_b);
    hipFree(d_c);
    return 0;
}
```

To execute this program, `hipcc` does not merely translate HIP syntax to C++: it splits the compilation into host and device passes, embeds compiled device ISA binaries (Code Objects) into the host executable, and links against runtime libraries that write Architectural Task Descriptors directly into hardware-visible memory.

## The mechanism

The ROCm stack is organized into four distinct tiers:



### 1. High-Level Language & HIP API
The HIP API sits at the top. HIP provides host side functions (`hipMalloc`, `hipMemcpy`, `hipLaunchKernelGGL`) and kernel side language extensions (`__global__`, `__device__`, `threadIdx`). At compile time, HIP syntax maps directly onto target device representations.

### 2. Clang / LLVM Device Compiler Pass
The compilation driver (`hipcc`) invokes Clang to perform split compilation:
- **Host Pass:** Compiles C++ code for the CPU architecture (e.g., x86_64). High-level launch macros are transformed into ROCm runtime API calls (`hipModuleLaunchKernel` or lower-level runtime invocations).
- **Device Pass:** Compiles compute kernels down to LLVM Intermediate Representation (IR), optimizes device code, and runs the `AMDGPU` LLVM backend target. The backend generates target machine ISA assembly and links it using `lld` to produce a binary executable block called an **HSA Code Object** (`.hsaco`).

The host compiler embeds this binary Code Object as a data array into the host object file.

### 3. ROCR (HSA User-Space Runtime)
The ROCm Runtime (`ROCR`) implements the Heterogeneous System Architecture (HSA) runtime standard. Instead of routing kernel dispatches through the kernel space OS driver for every call, ROCR creates user-mode ring buffers called **Architectural Task Processor (AQL) Queues**. 

When `hipLaunchKernelGGL` runs on the host:
1. The host program grabs a memory slot in the user-space AQL ring buffer.
2. It formats a dispatch packet containing kernel argument pointers, grid dimensions, and block dimensions.
3. It updates a doorbell register (via user-space mapped memory), informing the hardware Command Processor directly that new work is ready.

### 4. AMDKFD and AMDGPU DRM Driver
The Linux kernel infrastructure consists of `amdkfd` (AMD Kernel Fusion Driver) and `amdgpu` (Direct Rendering Manager driver):
- `amdkfd` handles process isolation, user-space queue mapping, GPU page allocation, inter-process communication, and system interrupts.
- `amdgpu` manages clock gating, display output, power domain states, and memory management via standard Linux subsystem interfaces.

## A worked example: Lowering vector addition

Let's examine how the ROCm stack lowers the host launch macro `hipLaunchKernelGGL(vector_add, ...)` into an execution sequence.

```cpp
// 1. Compilation Stage (hipcc driver invocation)
// Behind the scenes, hipcc executes:
// clang++ -x hip --offload-arch=gfx90a vector_add.cpp -o vector_add

// 2. Kernel launch macro in host code:
hipLaunchKernelGGL(
    vector_add,              // Function pointer to host stub
    dim3(blocks),            // Grid dimensions (blocks)
    dim3(threadsPerBlock),   // Block dimensions (threads)
    0,                       // Shared memory bytes
    0,                       // Stream ID
    d_a, d_b, d_c, N         // Kernel arguments
);
```

### What happens step-by-step:

1. **Compilation Stub Generation:**  
   During compilation, Clang replaces the `vector_add` reference in host code with a host-side stub function. It embeds the GCN/CDNA ISA code object into a hidden global ELF section (`.hip_fatbin`).

2. **Module Initialization (Runtime Load):**  
   When `main()` begins, the HIP runtime initializes ROCR (`hsa_init()`). ROCR locates the embedded `.hsaco` section, registers the memory pages, and asks the AMDGPU driver to validate memory protection for the device.

3. **Argument Setup & AQL Packet Formation:**  
   When execution reaches `hipLaunchKernelGGL`, HIP allocates a tiny buffer for host arguments (`d_a`, `d_b`, `d_c`, `N`). HIP then formats an HSA AQL kernel dispatch packet:

   ```c
   hsa_kernel_dispatch_packet_t packet;
   packet.header = HSA_PACKET_TYPE_KERNEL_DISPATCH;
   packet.workgroup_size_x = 256;
   packet.grid_size_x = 1024;
   packet.kernel_object = kernel_symbol_address;
   packet.kernarg_address = argument_buffer_address;
   ```

4. **Doorbell Signal:**  
   The host writes this packet into memory shared with the GPU's command processor and writes to the memory-mapped doorbell register. The CPU kernel driver is completely bypassed during this launch step, keeping overhead low.

5. **Hardware Execution:**  
   The GPU hardware Command Processor reads the packet from the ring buffer, fetches the target instructions from device memory, allocates register space across Compute Units, and starts scheduling SIMD wavefronts.

## What the compiler and runtime can and cannot do

Understanding layer boundaries clarifies which component controls performance and correctness:

| Task | Responsible Layer | Capability / Constraint |
| :--- | :--- | :--- |
| **Instruction Selection & Register Allocation** | Compiler Backend (`AMDGPU`) | Maps LLVM IR into device assembly instructions. Decides vector register usage (`v0-v255`) and scalar register usage (`s0-s105`). |
| **Grid Mapping & Block Scheduling** | Runtime (`ROCR`) & HW CP | Assigns blocks to Compute Units based on available resources. The compiler cannot force blocks onto specific hardware units at compile time. |
| **User Queue Ring Buffers** | Runtime (`ROCR`) | Enqueues launch packets directly in user space without kernel context switches. |
| **Page Table & Physical Memory Mapping** | Kernel Driver (`AMDKFD`) | Handles virtual memory allocations, page faults, and physical mapping between CPU and GPU system buses. |

## Common misconceptions

### 1. HIP is an emulation layer or wrapper that converts code to CUDA at runtime
**Correction:** HIP is a C++ runtime and language API header layer. When compiling for an AMD GPU using `hipcc`, code is compiled directly into AMDGPU assembly using Clang/LLVM. No CUDA libraries, tools, or translation passes execute at runtime.

### 2. Enqueueing a kernel launch requires an expensive Linux kernel system call
**Correction:** The HSA hardware architecture specifies user-mode queues. ROCR allocates ring buffers mapped directly into host virtual memory and updates hardware registers (doorbells) in user space. The OS kernel driver (`amdkfd`) configures the queue memory at setup time but stays out of the path of individual kernel launches.

### 3. The high-level language compiler optimizes memory layout on the chip dynamically
**Correction:** Clang compiles code statically into a fixed binary code object (`.hsaco`). The runtime loads this code object directly into memory. Physical hardware allocation—such as binding SIMD lanes to wavefront execution units—happens dynamically at hardware runtime based on the static register and local memory requirements specified inside the code object header.

## Where this leaves you

When analyzing GPU execution bottlenecks or compiler errors on ROCm:
- Use `rocprof` or `rocprofv2` to profile AQL packet creation and launch latency overhead managed by ROCR.
- Inspect compiled machine code using `llvm-objdump -d` on generated `.hsaco` objects to evaluate register spill behavior emitted by the `AMDGPU` backend.

## What To Read Next

- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — GPU execution model and hardware pipelines
- [/docs/parallel-computing/cuda-host-device-copy](/docs/parallel-computing/cuda-host-device-copy) — Host and device memory allocations and transfer dynamics
- [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/) — How register bounds in the compiler backend limit hardware thread occupancy

![Diagram](/img/parallel/the-rocm-stack.svg)

## References

- David Kirk and Wen-mei Hwu, *Programming Massively Parallel Processors: A Hands-on Approach*.
- HSA Foundation, *HSA Platform System Architecture Specification*.
