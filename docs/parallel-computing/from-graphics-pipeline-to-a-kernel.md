---
title: "From the graphics pipeline to a processor you can program"
description: "How hardwired graphics hardware evolved into programmable unified processors where a compute kernel launch replaces the fixed draw call."
keywords:
  - GPU hardware evolution
  - graphics pipeline
  - programmable shading
  - unified shader architecture
  - compute kernel
  - draw call vs kernel launch
  - vertex shading
  - fragment shading
  - GPGPU execution
  - host device memory model
  - memory dispatch
  - hardware rasterizer
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/from-graphics-pipeline-to-a-kernel
---

This lesson belongs to **Chapter 4: The GPU** in subchapter **4.1: The turn**.

Graphics hardware transitioned from fixed-function rendering pipelines into unified parallel processors executing arbitrary compute kernels. For compiler and runtime engineers, this shift changed the target model from a hardwired state machine into an instruction-driven execution engine dispatched by a compute runtime.

:::tip Read these first
- [/docs/parallel-computing/alus-that-could-only-draw](/docs/parallel-computing/alus-that-could-only-draw) — Thousands of arithmetic units that could only draw
- [/docs/parallel-computing/no-language-for-those-units](/docs/parallel-computing/no-language-for-those-units) — The mapping hacks developers used before compute-native APIs
:::

:::important What you should leave with
A compute kernel replaces a draw call by executing user code across arbitrary linear memory locations, bypassing the fixed rasterization and framebuffer writing steps entirely.
:::

## Why you should care

In early GPU computing, running an array addition required packing floating-point numbers into RGB textures, binding those textures to geometry primitives, triggering a draw call, and reading pixels back from an off-screen buffer.

```c
// Early GPGPU hack: Vector addition masked as a 2D quad render call
// The CPU sets up viewport geometry and triggers rasterization.
glBindTexture(GL_TEXTURE_2D, texture_input_A);
glBindTexture(GL_TEXTURE_2D, texture_input_B);
glBegin(GL_QUADS);
    glVertex2f(-1.0f, -1.0f);
    glVertex2f( 1.0f, -1.0f);
    glVertex2f( 1.0f,  1.0f);
    glVertex2f(-1.0f,  1.0f);
glEnd(); // Draw call forces the pipeline to process pixels to run math
```

This model forced general-purpose code to conform to graphics concepts. The hardware had separate execution stages, fixed memory paths, and no mechanism for arbitrary pointer writes. 

Understanding how graphics hardware unified its functional units into general-purpose execution blocks reveals why modern GPU runtimes look like host-device kernel launchers rather than graphics renderers.

## The mechanism

The transition from a fixed graphics pipeline to a compute runtime occurred in three main architectural steps:

1. **Fixed-Function Pipeline:** Hardwired hardware blocks processed vertices, triangles, and pixels. The compiler could not output custom instructions; it only configured hardware flags.
2. **Programmable Shaders:** Hardware introduced small programmable stages (vertex shaders, fragment shaders) interspersed between fixed hardware blocks like the rasterizer. However, memory access was strictly constrained: vertex shaders could only read vertex attributes, and fragment shaders could only write to pre-allocated framebuffers at their assigned pixel location.
3. **Unified Architecture and Kernels:** Hardware vendors combined the separate vertex and fragment compute units into a single pool of unified processors. Simultaneously, runtime APIs replaced the graphics engine interface with direct compute dispatch commands.



When the runtime replaces a draw call with a compute launch, it bypasses the entire fixed graphics hardware:

| Step | Graphics Draw Call | Compute Kernel Launch |
| :--- | :--- | :--- |
| **Work Setup** | Quad primitives, viewports, textures | Linear buffer pointers, 1D/2D/3D work domain |
| **Pipeline Hardware** | Rasterizers, depth testing, blenders | Direct compute engine work distribution |
| **Execution Path** | Fixed vertex -> raster -> fragment path | Arbitrary function body across pooled ALUs |
| **Memory Output** | Fixed fragment coordinate in target render buffer | Scatter/gather writes to arbitrary memory addresses |

## A worked example

To demonstrate the structural difference between early shader-based general compute and a clean compute dispatch, consider a raw compute runtime abstraction written in C.

This model bypasses geometry assembly and rasterization entirely, operating directly on memory pointers and work item counts.

```c
// System setup: A clean host abstraction representing a GPU Compute Dispatch
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

// Represents an arbitrary linear memory buffer on the hardware device
typedef struct {
    float *data;
    size_t count;
} DeviceBuffer;

// Execution configuration: replaces viewport dimensions and raster states
typedef struct {
    uint32_t total_work_items;
    uint32_t items_per_group;
} LaunchGrid;

// Simulated Compute Kernel: Executes pure math on arbitrary linear memory addresses
void add_vectors_kernel(const float *a, const float *b, float *c, uint32_t global_id) {
    // Unlike a fragment shader, output location is computed directly from memory address
    c[global_id] = a[global_id] + b[global_id];
}

// Host Runtime Launch Function: replaces glDrawArrays / glDrawElements
void dispatch_compute_kernel(LaunchGrid grid, DeviceBuffer buf_a, DeviceBuffer buf_b, DeviceBuffer buf_c) {
    // The runtime dispatches work items across available unified cores
    for (uint32_t id = 0; id < grid.total_work_items; ++id) {
        if (id < buf_c.count) {
            add_vectors_kernel(buf_a.data, buf_b.data, buf_c.data, id);
        }
    }
}

int main(void) {
    const size_t N = 1024;
    
    // Allocate device buffers directly without creating graphics textures
    DeviceBuffer buf_a = { (float*)malloc(N * sizeof(float)), N };
    DeviceBuffer buf_b = { (float*)malloc(N * sizeof(float)), N };
    DeviceBuffer buf_c = { (float*)malloc(N * sizeof(float)), N };

    for (size_t i = 0; i < N; ++i) {
        buf_a.data[i] = (float)i;
        buf_b.data[i] = (float)(i * 2);
    }

    // Configure grid bounds instead of quad geometry coordinates
    LaunchGrid grid = { .total_work_items = 1024, .items_per_group = 64 };

    // Trigger the kernel launch (replacing draw call)
    dispatch_compute_kernel(grid, buf_a, buf_b, buf_c);

    printf("Result at index 512: %f\n", buf_c.data[512]); // Should print 1536.000000

    free(buf_a.data);
    free(buf_b.data);
    free(buf_c.data);
    return 0;
}
```

### Walkthrough of key lines

1. **`DeviceBuffer` definition:** Standard memory pointers replace texture handles and framebuffers. The runtime treats data as contiguous bytes rather than 2D pixel grids.
2. **`add_vectors_kernel` declaration:** Memory indexing uses explicit element indices (`global_id`). The function does not output to predefined hardware color targets.
3. **`c[global_id] = a[global_id] + b[global_id];`:** Scatter operations (writing to arbitrary memory addresses) are permitted. In graphics pipelines, fragment shaders could only write to their assigned pixel coordinate.
4. **`LaunchGrid` configuration:** Defines the problem bounds as a domain of threads, removing the concept of screen resolution or geometry primitives.
5. **`dispatch_compute_kernel` call:** Submits an execution packet directly to the hardware command queue without setting up state tables for blending, depth tests, or rasterization.

## What the compiler and the runtime can and cannot do

### The Compiler

* **Can** optimize compute kernels like standard procedural code: inline functions, unroll loops, reorder instructions, and manage register allocation.
* **Can** emit flat memory read/write instructions (load/store) rather than specialized texture-fetch primitives.
* **Cannot** infer global thread boundaries or work-group dimensions at compile time unless explicitly passed as static templates or constant values.

### The Runtime

* **Can** map arbitrary execution domains onto available physical compute blocks regardless of graphics pipeline state.
* **Can** schedule compute workloads concurrently with transfer operations or separate graphics operations.
* **Cannot** eliminate hardware memory bounds checking or pointer aliasing risks without help from the compiler and language model.

## Common misconceptions

### "Unified architecture means GPUs removed all specialized hardware"
Unified hardware merged vertex and pixel shader logic units into flexible arithmetic logic units (ALUs). Modern GPUs still include specialized fixed-function hardware (such as hardware rasterizers, ray-tracing cores, and matrix-multiplication blocks), but general compute execution can bypass them entirely.

### "Compute kernels are just fragment shaders without color output"
Fragment shaders execute within fixed-function raster constraints; their execution count and spatial coordinates depend on quad geometry and window clipping. A compute kernel executes independently of geometry, rasterization, or rendering state, receiving explicit index boundaries directly from the runtime.

### "Draw calls and kernel launches carry identical driver overhead"
Draw calls require validating rasterization state, viewport settings, depth-stencil states, and blend modes. Kernel launches bypass state validation for these rendering stages, allowing the driver to submit commands with a simpler setup path.

## Where this leaves you

When analyzing GPU execution, verify that your workload bypasses graphics abstractions:
* Inspect host code to ensure data structures are allocated as raw linear memory buffers rather than textures or framebuffers.
* Ensure launch calls supply direct index boundaries to the hardware scheduler instead of issuing render passes or screen-space quads.

## What To Read Next

* [/docs/parallel-computing/fundamentals/parallel-hardware-overview](/docs/parallel-computing/fundamentals/parallel-hardware-overview) — Cores, caches, and memory layouts across processing models
* [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — SIMT execution models and hardware compute units

![Diagram](/img/parallel/from-graphics-pipeline-to-a-kernel.svg)

## References

* Kirk, David B., and Wen-mei W. Hwu. *Programming Massively Parallel Processors: A Hands-on Approach*.
* Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/from-graphics-pipeline-to-a-kernel/)
