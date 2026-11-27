---
title: "SYCL: Single-Source C++ to Device Kernels"
description: "How SYCL compilers separate C++ lambda captures into host control logic and outlined accelerator kernels via queues, handlers, and accessors."
keywords:
  - SYCL
  - SYCL queue
  - command group handler
  - SYCL accessor
  - SYCL buffer
  - kernel outlining
  - single source C++
  - device compilation
  - device kernel
  - SYCL lambda
  - host runtime
  - dependency graph
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/sycl-for-accelerators
---

SYCL presents heterogeneous host and device execution as a single, standard C++ source program. For compiler and runtime engineers, SYCL transforms standard C++ lambdas into device-side intermediate representations while managing implicit execution graph dependencies through accessors and queues.

:::tip Read these first
- [/docs/gpu/opencl/basic/what_is_opencl](/docs/gpu/opencl/basic/what_is_opencl) — the portable driver and memory abstraction that SYCL builds upon.
- [/docs/parallel-computing/opencl-next-to-cuda](/docs/parallel-computing/opencl-next-to-cuda) — how explicit host API calls and string kernels differ from CUDA.
:::

:::important What you should leave with
The compiler separates a SYCL program into host standard C++ and an outlined device kernel function; the runtime uses accessors passed to the command group handler to construct an execution graph that orders memory transfers and kernel submission.
:::

## Why you should care

Writing separate kernel files in target-specific assembly or runtime-compiled string literals obscures static type checking across the host-device boundary. Single-source C++ solves this by letting standard template signatures describe both host coordination and device execution.

Consider a simple vector addition expressed in SYCL:

```cpp
#include <sycl/sycl.hpp>
#include <vector>

void vector_add(const std::vector<float>& a, const std::vector<float>& b, std::vector<float>& c) {
    sycl::queue q;
    
    sycl::range<1> num_items{a.size()};
    sycl::buffer<float, 1> buf_a(a.data(), num_items);
    sycl::buffer<float, 1> buf_b(b.data(), num_items);
    sycl::buffer<float, 1> buf_c(c.data(), num_items);

    q.submit([&](sycl::handler& cgh) {
        sycl::accessor acc_a(buf_a, cgh, sycl::read_only);
        sycl::accessor acc_b(buf_b, cgh, sycl::read_only);
        sycl::accessor acc_c(buf_c, cgh, sycl::write_only);

        cgh.parallel_for(num_items, [=](sycl::id<1> idx) {
            acc_c[idx] = acc_a[idx] + acc_b[idx];
        });
    });
    
    q.wait();
}
```

The host code creates a queue, wraps host vectors in buffers, submits a command group lambda taking a handler, and executes a `parallel_for` lambda. To the host compiler, this is ordinary C++. To the SYCL compiler, the inner lambda must be outlined into a standalone device kernel (such as SPIR-V or PTX), while the outer constructs register nodes and edges in an asynchronous execution graph.

## The mechanism

SYCL relies on three core objects to bridge host C++ and device execution:

1. **`sycl::queue`**: The submission portal to an execution context (CPU, GPU, or FPGA). Submitting work to a queue is non-blocking by default.
2. **`sycl::handler`**: The command group context passed into a submission scope. It records the memory access requirements and schedules the kernel launch.
3. **`sycl::accessor`**: The target-aware view into a `sycl::buffer`. Accessors communicate data dependencies and access permissions (`read_only`, `write_only`, `read_write`) to the runtime scheduler.



### Single-Source Outlining

During compilation, a SYCL toolchain (such as Clang/LLVM under DPC++) performs a split compilation pass:

1. **Host Compilation Pass**: The host C++ compiler parses the translation unit, instantiates host structures, treats the kernel lambda body as ordinary C++ code, and emits standard host object code.
2. **Device Compilation Pass**: The compiler identifies callable entities marked with kernel attributes (such as the lambda passed to `parallel_for`). It outlines this inner lambda into a device function signature. Captures are mapped to device kernel parameters. The body is lowered to an intermediate language like SPIR-V or direct target assembly (PTX/AMDGPU).

```
   Host C++ Source Program
             │
      ┌──────┴──────┐
      ▼             ▼
 Host Frontend   Device Outlining
 (Host CPU O/S)  (SPIR-V / PTX Target)
      │             │
      ▼             ▼
 Host Object     Device Binary
      └──────┬──────┘
             ▼
    Unified Executable / Runtime Load
```

The runtime links the outlined device binary with the host executable, embedding metadata so that `q.submit` can locate and load the compiled device entry point at runtime.

## A worked example

Here is a complete program demonstrating buffer initialization, queue targeting, accessor execution, and implicit host synchronization via buffer destruction:

```cpp
#include <sycl/sycl.hpp>
#include <iostream>
#include <vector>

int main() {
    constexpr size_t N = 1024;
    std::vector<int> host_data(N, 1);

    {
        // 1. Target device selection (default_selector selects GPU or host CPU fallback)
        sycl::queue q{sycl::default_selector_v};

        // 2. Wrap host memory in a 1D SYCL buffer
        sycl::buffer<int, 1> buf(host_data.data(), sycl::range<1>(N));

        // 3. Command group submission
        q.submit([&](sycl::handler& cgh) {
            // 4. Request write access for the kernel
            sycl::accessor dev_acc(buf, cgh, sycl::write_only, sycl::no_init);

            // 5. Submit parallel range execution
            cgh.parallel_for(sycl::range<1>(N), [=](sycl::id<1> item) {
                dev_acc[item] *= 2;
            });
        });
        
        // 6. Scope exit triggers sycl::buffer destructor
    } 

    // 7. Host memory updated back synchronously upon buffer destruction
    std::cout << "Element 0: " << host_data[0] << std::endl; // Prints 2
    return 0;
}
```

### Line-by-Line Explanation

- **Line 10**: `sycl::queue q{sycl::default_selector_v};` creates an asynchronous command queue linked to an automatically selected device.
- **Line 13**: `sycl::buffer<int, 1> buf(...)` defines managed device tracking for `host_data`. The host pointer is stored, but data is not copied immediately.
- **Line 16**: `q.submit(...)` enqueues a command group lambda. Execution on the host continues asynchronously immediately after submission unless explicitly waited upon.
- **Line 18**: `sycl::accessor dev_acc(...)` registers a write access dependency on `buf`. The runtime inspects all pending accessors across submitted command groups to establish correct execution dependencies without explicit lock calls.
- **Line 21**: `cgh.parallel_for(...)` identifies the kernel execution boundary. The SYCL device compiler extracts the `[=](sycl::id<1> item)` closure and generates the target device entry point.
- **Line 26**: The closing brace ends the lifetime of `buf`. The `sycl::buffer` destructor blocks the host thread until all kernel writes complete and copies the modified memory back into `host_data.data()`.

## What the compiler and the runtime can and cannot do

### What the compiler can do
- **Automate kernel signature generation**: The compiler inspects the lambda capture list, determines sizes and alignments, and constructs implicit kernel parameter structures.
- **Type-check host and device types**: Standard C++ type rules apply across host code and device lambdas, preventing type mismatches at interface boundaries.
- **Emit multi-target binaries**: A single compiler invocation can target host x86/ARM code alongside SPIR-V or target-native assembly formats.

### What the compiler cannot do
- **Convert arbitrary C++ host features**: Virtual function calls, dynamic allocation (`new`/`malloc`), host system calls, and non-blittable pointers inside the device lambda cannot be transformed to device assembly automatically.
- **Eliminate memory synchronization overhead**: If accessors specify redundant dependencies or incorrect access modes (e.g., `read_write` when `read_only` suffices), the device compiler cannot remove the resulting runtime queue stalls.

### What the runtime handles
- **Execution graph construction**: The runtime builds a Directed Acyclic Graph (DAG) of commands. Tasks with disjoint memory access requirements run concurrently; overlapping writes enforce dependencies.
- **Lazy data migration**: Data is only transferred to a device when an accessor requests it inside a submitted command group.

## Common misconceptions

### MISCONCEPTION: `q.submit` blocks host execution until the kernel finishes
**Correction**: `q.submit` returns immediately after appending the command group node to the runtime task graph. Execution on the host runs concurrently with the GPU unless `q.wait()` or explicit host-access blocking occurs.

### MISCONCEPTION: SYCL accessors copy memory during their host constructor call
**Correction**: Constructing an accessor inside a command group lambda only records an access requirement in the task graph. Actual memory copy operations occur asynchronously when the runtime schedules the command group for execution.

### MISCONCEPTION: Unified Shared Memory (USM) eliminates the need for graph synchronization
**Correction**: USM replaces `sycl::buffer` and `sycl::accessor` syntax with raw pointer access, but it removes automatic dependency tracking. When using USM, developers must manually submit depend events (`sycl::event`) to the queue to prevent data races.

## Where this leaves you

Inspect your SYCL device kernels for host-side C++ allocations or function pointers captured in the lambda signature. Verify that every accessor explicitly states its minimal access mode (`read_only` or `write_only` instead of defaulting to `read_write`) to allow the runtime graph scheduler to overlap execution streams effectively.

## What To Read Next

- [/docs/parallel-computing/fundamentals/memory-models](/docs/parallel-computing/fundamentals/memory-models) — memory ordering contracts across heterogeneous processors.
- [/docs/gpu/opencl/basic/what_is_opencl](/docs/gpu/opencl/basic/what_is_opencl) — underlying low-level device runtime execution principles.
- [/docs/compilers/techblog/register-pressure-on-gpu/](/docs/compilers/techblog/register-pressure-on-gpu/) — how device code transformation impacts thread occupancy.

![Diagram](/img/parallel/sycl-for-accelerators.svg)

## References

- Standard C++ Foundation, *SYCL 2020 Specification*, Khronos Group.
- Grama, A., Gupta, A., Karypis, G., and Kumar, V., *Introduction to Parallel Computing*.
- Kirk, D. B., and Hwu, W. W., *Programming Massively Parallel Processors: A Hands-on Approach*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/sycl-for-accelerators/)
