---
title: "No language for those units"
description: "Before dedicated compute APIs, general-purpose computation required disguising arrays as textures and loops as fragment shaders."
keywords:
  - GPGPU
  - graphics shader APIs
  - OpenGL shading language
  - fragment shader
  - texture memory
  - offscreen framebuffer
  - scatter store
  - gather load
  - render target
  - data parallel mapping
  - GPU compute compiler
  - register allocation
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/no-language-for-those-units
---

In Chapter 3, we explore what the computing industry lacked before dedicated GPU programming models emerged. In the previous subchapter, we examined hardware with massive arithmetic throughput that was strictly coupled to a graphics pipeline. This section covers the software gap: how programmers drove those units through graphics APIs before a general compute language existed, and why compiler backends had no clean abstractions for arbitrary memory reads and writes.

:::tip Read these first
- [/docs/parallel-computing/alus-that-could-only-draw](/docs/parallel-computing/alus-that-could-only-draw) — Thousands of arithmetic units that could only draw
- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — SIMT hardware runs many lanes on one instruction stream
:::

:::important What you should leave with
Before compute-specific languages existed, programmers had to encode input arrays as 2D RGBA textures and loop iterations as fragment shader executions on offscreen rectangles. A compiler could not expose flat pointers or arbitrary scatter stores because the hardware pipeline enforced destination locations based on rasterized pixel coordinates.
:::

## Why you should care

Suppose you want to compute element-wise addition on two large floating-point arrays: $C[i] = A[i] + B[i]$. On a CPU, you allocate contiguous buffers, iterate over an index $i$, and write to $C[i]$.

Before general compute APIs like CUDA or OpenCL existed, programmable graphics hardware possessed enormous throughput, but the driver exposed no flat memory addresses, no kernel dispatch calls, and no scatter store instructions. To perform array addition on the GPU, a programmer had to:

1. Copy array $A$ into a 2D floating-point texture memory object.
2. Copy array $B$ into a second 2D floating-point texture memory object.
3. Configure an offscreen Framebuffer Object (FBO) attached to a destination texture representing array $C$.
4. Pass a fragment shader containing the arithmetic logic to the graphics pipeline.
5. Draw a full-screen quad (a rectangle covering the exact pixel dimensions of the texture) to trigger the hardware rasterizer.

The rasterizer generated one fragment (pixel target) for every destination array element. The fragment shader read values from the two input textures using normalized UV coordinates, performed the addition, and emitted the floating-point result to the designated pixel coordinate.

```c
// Pre-compute API approach: General math disguised as graphics rendering
// 1. Inputs are encoded as textures
glBindTexture(GL_TEXTURE_2D, textureA);
glBindTexture(GL_TEXTURE_2D, textureB);

// 2. Output target is an offscreen render target (Framebuffer)
glBindFramebuffer(GL_FRAMEBUFFER, fboC);

// 3. Bind shader program with arithmetic logic
glUseProgram(vectorAddProgram);

// 4. Trigger execution by drawing a geometric primitive (a rectangle)
glBegin(GL_QUADS);
    glTexCoord2f(0.0f, 0.0f); glVertex2f(-1.0f, -1.0f);
    glTexCoord2f(1.0f, 0.0f); glVertex2f( 1.0f, -1.0f);
    glTexCoord2f(1.0f, 1.0f); glVertex2f( 1.0f,  1.0f);
    glTexCoord2f(0.0f, 1.0f); glVertex2f(-1.0f,  1.0f);
glEnd();
```

This workaround allowed raw mathematical throughput on graphics cards. However, it placed an immense burden on the programmer and made general compilation impossible.

---

## The mechanism

The primary challenge of early general-purpose GPU (GPGPU) programming was mapping general compute abstractions onto the fixed graphics rendering pipeline.



To see why this pipeline was restrictive, compare general array semantics with graphics shader contracts across four critical axes:

| Concept | General Compute Standard | Graphics API Workaround |
| :--- | :--- | :--- |
| **Addressing** | Flat pointers or linear integer indices (`buf[i]`) | 2D/3D Texture coordinates (`u, v`) normalized from `[0.0, 1.0]` |
| **Memory Writes** | Arbitrary memory stores (`scatter` to any location) | Output restricted strictly to the current fragment location |
| **Data Types** | 32-bit integers, bitwise operations, byte pointers | 4-element vectors (`vec4`) of floats (RGBA colors) |
| **Thread Model** | Explicit N-dimensional grid of threads | Implicit pixel threads spawned by primitive rasterization |

### The Scatter Store Problem

The most fundamental technical barrier was the lack of arbitrary memory writes (**scatter**). 

In standard programming languages, a thread can compute an index `dest` dynamically and write to that address: `array[dest] = val`.

In graphics hardware of that era, the fragment shader executed per pixel. The pipeline hardware decided where the output of a fragment shader would be written based on the fragment's screen-space coordinate $(X, Y)$ determined by the geometry rasterizer. The fragment shader program could calculate complex arithmetic, but its single output value (`gl_FragColor`) was routed unconditionally to the fixed target pixel coordinate $(X, Y)$ in the framebuffer.

Gather reads were supported (a shader could fetch from dynamic texture coordinates `texture2D(sampler, coord)`), but scatter writes were impossible. Algorithms that required histograms, dynamic sorting, or pointer-chasing graphs could not be cleanly mapped to the hardware.

---

## A worked example

Below is a complete example showing how an element-wise vector addition had to be written in OpenGL Shading Language (GLSL) during the GPGPU era, contrasted with a modern compute kernel.

### The Fragment Shader (GPGPU Era)

```glsl
// Vector addition fragment shader (GLSL 1.20 style)
// Executed once per pixel fragment over an offscreen quad.

uniform sampler2D texA; // Input array A disguised as a 2D float texture
uniform sampler2D texB; // Input array B disguised as a 2D float texture

void main() {
    // 1. Retrieve the rasterized texture coordinate for this fragment
    vec2 st = gl_TexCoord[0].st;

    // 2. Sample input floating-point values from both textures
    vec4 valA = texture2D(texA, st);
    vec4 valB = texture2D(texB, st);

    // 3. Compute vector addition
    vec4 sum = valA + valB;

    // 4. Output result to the fixed render target pixel
    gl_FragColor = sum;
}
```

### Explanation of lines

1. **`uniform sampler2D texA, texB;`**: Input memory buffers must be passed as sampler objects representing 2D image structures rather than linear memory pointers.
2. **`vec2 st = gl_TexCoord[0].st;`**: Thread position is derived from texture coordinate interpolators passed down from the primitive rasterizer.
3. **`vec4 valA = texture2D(texA, st);`**: Memory loads are performed via hardware texture lookup units. Addresses must be mapped from array offsets into two-dimensional floating-point coordinates.
4. **`gl_FragColor = sum;`**: The output cannot be written to an arbitrary address. It can only be assigned to `gl_FragColor`, which the rasterization pipeline writes strictly to the fragment's assigned location in the bound offscreen framebuffer.

---

## What the compiler and runtime can and cannot do

Understanding the limits of graphics compilers during this era reveals why new abstractions were necessary:

### What the graphics driver compiler COULD do
* **Instruction Scheduling & Vectorization**: The driver compiler excelled at vectorizing floating-point operations across the 4-component (`RGBA`) vector registers native to graphics hardware.
* **Texture Fetch Optimization**: The compiler could optimize read-only texture samplers, leveraging hardware spatial caching designed for image textures.

### What the graphics driver compiler COULD NOT do
* **Synthesize Scatter Memory Accesses**: No IR transformation or compiler pass could generate arbitrary writes because the underlying GPU target architecture did not expose write-addressing lines to the execution units.
* **Provide Bitwise and Integer Guarantees**: Early graphics GPUs lacked native integer ALUs. Integers were approximated using floating-point hardware. Compilers could not offer guaranteed 32-bit integer wrapping or bitwise operations required for cryptography, hashing, or modern index math.
* **Expose Standard Intermediate Representations**: Driver compilers took high-level shading languages (HLSL/GLSL) or low-level assembly strings (`ARB_fragment_program`) and produced opaque hardware binaries. There was no unified IR (like SPIR-V or NVVM/LLVM) for non-graphics compute.

---

## Common misconceptions

### Misconception 1: "GPUs were always general-purpose microprocessors that just lacked C compilers."
**Correction**: Early GPUs lacked general load/store hardware paths. Execution units were hardwired to read from specialized texture samplers and write to fixed framebuffer output registers. The physical execution pipeline lacked memory translation units for general scatter stores.

### Misconception 2: "GPGPU was slower than CPUs for all data-parallel algorithms."
**Correction**: For structured algorithms matching gather-only patterns—such as matrix multiplication, dense linear algebra, and image filtering—GPGPU techniques delivered multi-fold throughput increases over contemporary CPUs despite the overhead of graphics API calls.

### Misconception 3: "Fragment shaders had full access to system RAM pointers."
**Correction**: Graphics APIs intentionally isolated execution units from memory management. Texture memory addresses were managed entirely by the driver and GPU memory management unit, with no concept of unified pointer addresses.

---

## Where this leaves you

The era of driving compute through graphics APIs demonstrated that GPU hardware possessed massive data-parallel compute capabilities. However, forcing arithmetic logic through rasterization pipelines created significant engineering friction:

1. Data structures had to be flattened and encoded into 2D floating-point textures.
2. Control flow was constrained by fragment-processing rules without arbitrary memory writes.
3. Compilers were locked behind graphics driver interfaces, preventing direct code generation for general algorithm targets.

To unlock the full potential of this parallel hardware, the industry required a missing software layer: a language and runtime system that replaced textures with flat arrays, fragment shaders with compute kernels, and rasterization grids with explicit parallel thread grids.

---

## What To Read Next

- [/docs/gpu/what_is_gpu](/docs/gpu/what_is_gpu) — SIMT hardware runs many lanes on one instruction stream
- [/docs/gpu/opencl/basic/what_is_opencl](/docs/gpu/opencl/basic/what_is_opencl) — A portable kernel language with an explicit platform and memory model
- [/docs/parallel-computing/the-cpu-ran-out-of-cheap-speed](/docs/parallel-computing/the-cpu-ran-out-of-cheap-speed) — The CPU ran out of cheap speed

---

![Diagram](/img/parallel/no-language-for-those-units.svg)

## References

- David Kirk and Wen-mei Hwu, *Programming Massively Parallel Processors*.
- Mark Harris, *General-Purpose Computation on GPUs (GPGPU)*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/no-language-for-those-units/)
