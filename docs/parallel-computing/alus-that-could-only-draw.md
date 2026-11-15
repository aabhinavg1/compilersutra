---
title: "Thousands of Arithmetic Units That Could Only Draw"
description: "Why early graphics hardware had immense floating-point throughput locked behind a rigid fixed-function pipeline, invisible to general-purpose programming compilers."
keywords:
  - fixed-function pipeline
  - graphics hardware
  - general loop
  - vertex processing
  - rasterization
  - fragment processing
  - pixel processing
  - general-purpose computing
  - arithmetic logic units
  - hardware execution units
  - specialized data path
  - graphics API abstraction
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/alus-that-could-only-draw
---

By the late 1990s, graphics processors contained vastly more floating-point arithmetic units than CPU dies contained. Compiler and runtime engineers could not use these units for general workloads because the hardware exposed no program counter, no stack, and no instructions for arbitrary memory addresses.

:::tip Read these first
- [/docs/parallel-computing/the-cpu-ran-out-of-cheap-speed](/docs/parallel-computing/the-cpu-ran-out-of-cheap-speed) — how single-core frequency limits forced hardware design changes
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — the basic execution model of graphics devices
:::

:::important What you should leave with
A hardware execution unit is useless to a general compiler unless the hardware provides an instruction set, an addressable memory space, and an unconstrained control flow path.
:::

## Why you should care

Suppose you need to evaluate a simple vector addition over one million elements in C:

```c
void add_vectors(const float *a, const float *b, float *c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}
```

A standard CPU compiler targets this loop by loading values into vector registers, performing arithmetic, and storing the result to memory addresses managed by pointers.

Before general device architectures existed, graphics accelerators contained hundreds of parallel Floating-Point Units (FPUs) capable of computing billions of operations per second. However, a C compiler could not target them for `add_vectors`. 

The hardware lacked a mechanism to read from arbitrary pointer `a`, write to pointer `c`, or execute an iteration variable `i`. The arithmetic units were hardwired into a rigid spatial pipeline designed solely to transform geometric vertices and compute pixel colors.

```
+-------------------------------------------------------------------+
|                     EARLY GRAPHICS HARDWARE                       |
|                                                                   |
|   Geometric       Vertex        Rasterization       Fragment      |
|    Vertices  -->  Shader   -->   Interpolation -->   Shader  --> Framebuffer
|   (Position)     (Transform)                       (Color FPUs)
|                                                                   |
|   [ NO Arbitrary Pointer Reads ]   [ NO Random Writes / Dynamic Loops ]
+-------------------------------------------------------------------+
```

## The mechanism

The fixed graphics hardware operated as a streaming, specialized data path rather than an instruction-fetch-decode loop. Hardware stages were connected by dedicated hardware queues.



To run arithmetic, data entered the hardware through rigid steps:

1. **Vertex Fetch:** The host placed multi-attribute vertex structures into fixed memory regions.
2. **Transform & Lighting:** Fixed-function hardware multiplied coordinate vectors by matrix constants to produce screen positions.
3. **Rasterization:** A non-programmable stage interpolated output values across 2D triangles to create fragment pixels.
4. **Fragment Shading:** Arithmetic units multiplied color vectors by texture values.
5. **Output Blending:** Results were written to fixed offsets in a dedicated frame buffer display memory.

The hardware had three architectural limits that prevented general execution:

- **No Scatter Memory Writes:** A fragment arithmetic unit could only write its computed vector to its assigned 2D screen coordinate $(x, y)$. It could not write to an arbitrary address in memory.
- **No Indirection or Dynamic Branching:** Operations were hardwired per stage. There were no instruction registers, loop counters, or conditional execution units.
- **Fixed Input Formatting:** Input data had to be converted into visual attributes (such as 2D textures, color channels, or spatial coordinates).

## A worked example

Before general compute interfaces existed, early researchers forced scientific computations onto graphics hardware by disguising data arrays as 2D image textures and arithmetic as rendering passes.

Compare standard C loop execution to the fake graphics pipeline pass required to execute vector addition on early graphics chips:

```c
/* Standard CPU General Loop: Direct Memory Access & Unconstrained Execution */
void add_cpu(const float *a, const float *b, float *c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i]; /* Random memory access, simple scalar/SIMD loop */
    }
}
```

To achieve the same addition on an early graphics chip, programmers had to invoke host graphics APIs:

```c
/* Early GPU Execution Hack: Disguise Data as Rendered Pixels */
void add_gpu_legacy_hack(const float *a, const float *b, int width, int height) {
    /* Step 1: Pack arrays into 2D RGB/RGBA Floating-Point Texture Maps */
    GLuint tex_a = create_2d_texture(a, width, height);
    GLuint tex_b = create_2d_texture(b, width, height);
    
    /* Step 2: Set up a 1:1 Orthographic Camera Projection */
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluOrtho2D(0, width, 0, height);
    
    /* Step 3: Bind multi-texture sampling units */
    glActiveTexture(GL_TEXTURE0); glBindTexture(GL_TEXTURE_2D, tex_a);
    glActiveTexture(GL_TEXTURE1); glBindTexture(GL_TEXTURE_2D, tex_b);
    
    /* Step 4: Render a 2D Quad covering the viewport to trigger fragment ALUs */
    glBegin(GL_QUADS);
        glTexCoord2f(0.0f, 0.0f); glVertex2f(0.0f, 0.0f);
        glTexCoord2f(1.0f, 0.0f); glVertex2f(width, 0.0f);
        glTexCoord2f(1.0f, 1.0f); glVertex2f(width, height);
        glTexCoord2f(0.0f, 1.0f); glVertex2f(0.0f, height);
    glEnd();
    
    /* Step 5: Read back frame buffer pixels to CPU host memory */
    glReadPixels(0, 0, width, height, GL_RGBA, GL_FLOAT, output_array);
}
```

Here is how each step maps to hardware constraints:

- **Line 4–5:** Data input was coerced into 2D RGBA texture memory because the fragment units could only sample textures.
- **Line 8–10:** Coordinate system transformations were forced onto the pipeline to ensure each element maps to exactly one rendered pixel.
- **Line 16–21:** A geometric rectangle (`GL_QUADS`) was rendered. The hardware rasterizer generated one fragment work item per pixel.
- **Line 24:** Memory output could only be retrieved by reading back the pixel values of the offscreen frame buffer.

This transformation was inefficient for arbitrary routines, carried heavy host API overhead, and broke down completely if algorithms required pointers or dynamic control branches.

## What the compiler and runtime can and cannot do

| Feature / Hardware Capability | Early Graphics Pipeline (Fixed-Function API) | Modern GPU Kernel Runtime |
| :--- | :--- | :--- |
| **Memory Writes** | Fixed frame buffer locations ($x, y$ pixel slot only) | Arbitrary pointer scatter (`ptr[i] = val`) |
| **Control Flow** | Fixed stage sequence; no instructions or loops | Arbitrary loops, branching, and dynamic bounds |
| **Input Format** | Geometric primitives, texture buffers, vertex arrays | Primitive types, pointers, structured memory |
| **Compiler Target** | No byte-code/ISA target; API configuration state only | Explicit ISA / Parallel Bytecode compilation target |

### What the compiler could not do

Compilers could not generate machine code directly for the arithmetic units because there was no unified instruction set architecture (ISA) exposed by the vendor. The hardware expected API state commands, not instruction streams.

### What the compiler was forced to do

Early GPGPU compilers (such as early shading systems) were forced to generate host-side API calls (`glDrawPixels`, `glTexImage2D`) to trick the graphics driver into launching work.

## Common misconceptions

### False: Early graphics pipelines lacked high raw floating-point performance
Fixed graphics hardware possessed enormous aggregate floating-point bandwidth. The limitation was entirely in hardware addressability and execution control, not arithmetic capacity.

### False: Early graphics hardware could execute general-purpose C code with a runtime wrapper
A runtime wrapper cannot compensate for missing hardware primitives. Without general load/store instructions, indirect pointer arithmetic, and programmable control flow, standard sequential languages cannot be translated to the hardware.

### False: Textures were standard array pointers under a different name
Textures were opaque, multi-dimensional structures bound to specific filtering hardware. They lacked flat byte-addressable indexing and required host API calls to manage or update.

## Where this leaves you

When evaluating legacy architectures or domain-specific hardware accelerators:

- Check whether the target hardware exposes an explicit program counter, an addressable flat memory space, and general store operations.
- If an accelerator only accepts hardwired stage configurations or streaming pipeline graphs without pointer indirection, general compiler IRs cannot target it directly without intermediate host-driven transformations.

## What To Read Next

- [/docs/parallel-computing/simd-mimd-and-the-interconnect](/docs/parallel-computing/simd-mimd-and-the-interconnect) — taxonomy of parallel instruction and data streams
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — how GPUs evolved into programmable SIMT machines
- [/docs/parallel-computing/what-is-parallel-computing](/docs/parallel-computing/what-is-parallel-computing) — basic execution trade-offs between serial clock speed and parallel scale

![Diagram](/img/parallel/alus-that-could-only-draw.svg)

## References

- Kirk, D. B., & Hwu, W. W. *Programming Massively Parallel Processors: A Hands-on Approach*. Morgan Kaufmann.
- Grama, A., Gupta, A., Karypis, G., & Kumar, V. *Introduction to Parallel Computing*. Addison-Wesley.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/alus-that-could-only-draw/)
