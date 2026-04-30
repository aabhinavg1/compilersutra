---
title: Seeing the ML Compiler Stack Live on AMD GPU
description: Dump Triton IR, Triton GPU IR, LLVM IR, AMD GCN assembly, and HSACO on a real AMD GPU to see the ML compiler pipeline stage by stage.
slug: /ml-compilers/mlcompilerstack/
displayed_sidebar: mlCompilersSidebar
sidebar_position: 2
keywords:
- ml compiler  
- ml compiler stack  
- deep learning compiler  
- ai compiler  
- gpu kernel fusion  
- operator fusion  
- pytorch compiler  
- torch compile  
- kernel fusion gpu  
- computation graph  
- graph optimization  
- execution plan  
- kernel execution  
- gpu execution model  
- tensor operations  
- intermediate representation  
- lowering in compilers  
- compiler optimization  
- 3 kernels vs 1 kernel  
- gpu kernel profiling  
- pytorch profiler cuda  
- kernel launch overhead  
- fused kernel example  
- elementwise fusion gpu  
- ml compiler example  
- triton tutorial
- pytorch triton example
- gpu kernel explained
- llvm ir gpu
- amdgcn tutorial
- rocm kernel debugging
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AdBanner from '@site/src/components/AdBanner';

# Seeing the ML Compiler Stack Live on AMD GPU

![Seeing the ML Compiler Stack Live on AMD GPU](/img/ml-compiler-stack-amd-gpu.jpeg)

## Pipeline at a Glance

| Stage | What changes here |
|-------|-------------------|
| Python kernel | write the computation in Triton |
| ↓ TTIR | preserve the math, shapes, masks, and pointer logic |
| ↓ TTGIR | choose thread layout, waves, and GPU execution structure |
| ↓ LLVM IR | express the kernel with AMDGPU intrinsics, vectors, and address spaces |
| ↓ AMDGCN | emit the actual instructions the GPU will execute |
| ↓ HSACO | package the machine code into the binary ROCm launches |

### Same Kernel Across Layers

:::tip Mental Model

```python
Python:        a + b
TTIR:          tensor add
TTGIR:         threads + layout
LLVM IR:       intrinsics + vectors
AMDGCN:        instructions
HSACO:         binary

Same idea
    ↓
more commitment
    ↓
less abstraction
```
:::

*This article is a direct continuation of [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap). That article explained the theory: Python -> Graph -> Optimized Plan -> Kernels -> Hardware. This one makes every stage visible on a real machine.*

If you need the dedicated conceptual pipeline walkthrough first, read [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline). This page stays focused on inspectable Triton, LLVM IR, AMDGCN, and HSACO artifacts rather than re-explaining the whole stack from scratch.

After enough time reading theory, one thing becomes obvious. <br/>
The diagrams make sense.<br/>
The pipeline makes sense.<br/>
And then you sit in front of a terminal and realize you have never actually *seen* it.<br/>
Not inferred it. Only read about it. But have never implemented it.

:::caution Now the question arises
- how can i see every IR stage?
- how can i see every lowering step?
- how can i understand every compiler decision?
- how will  every instruction your GPU will execute, and how can i inspect them .?
:::

> ***That is what this article does.***

We will take a single vector addition kernel, compile it with Triton on an AMD RX 9060 XT, and dump every stage of the compiler pipeline to disk. By the end, you will have five files representing five different compiler stages, and you will know what each one means.

This article is not about memorizing syntax in TTIR or LLVM IR.

:::tip It is about building the habit of asking the right question at each stage:

- What does the compiler still know here?
- What has it already decided?
- What is still abstract?
- What is now hardware-specific?
:::

If you can answer those four questions at each stage, the whole stack starts feeling much less mysterious.

<div>
  <AdBanner />
</div>


## Table of Contents

- [The Setup](#the-setup)
- [Installation Paths](#installation-paths)
- [Get the Basics First](#get-the-basics-first)
- [The Kernel](#the-kernel)
- [A Simple Pipeline Summary](#a-simple-pipeline-summary)
- [Running and Dumping Every Stage](#running-and-dumping-every-stage)
- [Stage 1 — Triton IR (`ttir`)](#stage-1--triton-ir-ttir)
- [Stage 2 — Triton GPU IR (`ttgir`)](#stage-2--triton-gpu-ir-ttgir)
- [Stage 3 — LLVM IR (`llir`)](#stage-3--llvm-ir-llir)
- [Stage 4 — gfx1200 Assembly (`amdgcn`)](#stage-4--gfx1200-assembly-amdgcn)
- [Stage 5 — HSACO Binary (`hsaco`)](#stage-5--hsaco-binary-hsaco)
- [What to Expect Before Opening Files](#what-to-expect-before-opening-files)
- [If You Feel Lost, Read This](#if-you-feel-lost-read-this)
- [Where the Important Decisions Happened](#where-the-important-decisions-happened)
- [Useful Commands for Exploration](#useful-commands-for-exploration)
- [What the Compiler Did for You](#what-the-compiler-did-for-you)
- [What Comes Next](#what-comes-next)
- [Final Thought](#final-thought)
- [FAQ](#faq)

## The Setup

Before we touch IR, we need one boring but important thing: a setup that is actually healthy. If the runtime stack is wrong, the rest of the article becomes noise because you will be staring at failures instead of compiler stages.

Validated on this machine:

- **OS:** Ubuntu 24.04.4 LTS
- **Kernel:** Linux 6.17.0-20-generic
- **CPU:** AMD Ryzen 7 9700X 8-Core Processor
- **GPU:** AMD Radeon RX 9060 XT (`gfx1200`, RDNA 4)
- **VRAM:** 17.1 GB visible to PyTorch
- **ROCm:** 7.0.2 (`/opt/rocm/.info/version`)
- **Python:** 3.12.3
- **PyTorch:** 2.11.0.dev20260206+rocm7.0
- **Triton:** 3.6.0

:::important ROCm Version Note

Official ROCm 7.2.1 (released March 2026) offers improved stability and support for the RX 9060 XT (`gfx1200`). This machine used ROCm 7.0.2, which still worked well for generating the dumps in this article. Your exact ISA output or Triton cache behavior may differ slightly on ROCm 7.2.1.
:::

If your setup differs, the pipeline stages and lowering concepts remain the same.

## Installation Paths

This article is AMD-specific, so the setup section stays focused on the exact ROCm path used for the dumps shown below.

Before the setup details, one plain-English definition helps:

**Triton is a GPU-focused programming language and compiler developed by OpenAI.** In practice, that means you write small GPU programs in Python-like code, and Triton lowers them into optimized code that real GPUs can execute.

<Tabs>
<TabItem value="amd" label="AMD" default>

This is the path used in this article.

- Install ROCm for your distro and GPU generation.
- Check AMD's official [supported GPUs list](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html#supported-gpus) first so you know your GPU is officially supported by the ROCm release you plan to use.
- Follow AMD's official [Install Triton for ROCm](https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/docs/install/installrad/native_linux/install-triton.html) guide. AMD's guide lists the prerequisites, recommends a ROCm-ready PyTorch environment first, and then installs the Triton-compatible Python stack.
- Verify that PyTorch sees the GPU and reports the correct `gcnArchName`.

Typical software stack:

- ROCm
- PyTorch for ROCm
- Triton
- AMD GPU target such as `gfx11xx` or `gfx12xx`

For this article, the compiler path ends in:

`TTIR -> TTGIR -> LLVM IR -> AMDGCN -> HSACO`

</TabItem>
</Tabs>

Verify your stack is healthy before continuing:

On this machine, I ran these steps inside:

```bash
source ~/venv/bin/activate
```

Then verified the stack with:

```python
python3 -c "
import torch
print('PyTorch:', torch.__version__)
print('GPU:', torch.cuda.get_device_name(0))
print('VRAM:', round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1), 'GB')
print('Arch:', torch.cuda.get_device_properties(0).gcnArchName)
"
```

Expected output on this setup:

```python
PyTorch: 2.11.0.dev20260206+rocm7.0
GPU: AMD Radeon RX 9060 XT
VRAM: 17.1 GB
Arch: gfx1200
```

Quick commands you can run now to double-check:

```python
# 1. Full ROCm version info
ls -l /opt/rocm
cat /opt/rocm/.info/version
7.0.2


# 3. Check what the driver actually installed
rocm-smi --showdriverversion

============================ ROCm System Management Interface ============================
============================== Version of System Component ===============================
Driver version: 6.17.0-20-generic

```



If this fails, stop there. Compiler output is only meaningful once the runtime stack is actually working.

One concrete failure case is worth seeing because it tells you **where** the pipeline stops.

If the ROCm runtime or PyTorch build is wrong, a simple check like this:

```python
python3 -c "
import torch
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))
"
```

often fails with an error such as:

```python
RuntimeError: No HIP GPUs are available
```


That failure happens **before Stage 1 (`ttir`) even exists**. Triton never gets a healthy device, so there is no kernel launch, no cache entry, and nothing to dump. That is useful diagnostically: if the setup probe fails, do not debug TTIR or LLVM IR yet. Fix the runtime first.



<div>
  <AdBanner />
</div>

## Get the Basics First

Before opening TTIR or LLVM IR, it helps to have a few connected ideas in place.

The article gets much easier if these small terms are clear first.

- [**Triton**](https://triton-lang.org/main/index.html): a GPU programming language and compiler. You write a kernel in Python-like code, and Triton lowers it into code that a GPU can execute. Developed by [OpenAI](https://openai.com/index/triton/)
- **Kernel**: a small function that runs on the GPU.
- **Array**: a collection of values stored in memory.
- **Vector**: in this article, a 1D array. We call it a vector because we are working with a single straight line of values such as `a[0], a[1], a[2]`.

So yes, the vectors in this article are arrays. More specifically, they are one-dimensional arrays, which is why the word **vector** fits.

The example kernel here does **vector addition**, which just means adding matching positions from two 1D arrays.

```python
a = [1, 2, 3]
b = [4, 5, 6]

output = [5, 7, 9]
```

The rule is:

`output[i] = a[i] + b[i]`

That is all the math you need for this article.

Two more words matter before the code:

Suppose the input has 1024 numbers.

If we decide that one GPU program should handle 256 numbers at a time, then:

- 256 numbers is **one block**
- 1024 numbers becomes 4 blocks
- those 4 blocks together are the **grid**

So:

- **Block** means one small chunk of the full input
- **Grid** means all the chunks together that must be processed

**Block vs Grid**

```python
Full input: 1024 numbers

[ Block 0: 0-255 ] [ Block 1: 256-511 ] [ Block 2: 512-767 ] [ Block 3: 768-1023 ]

One block = one chunk
Grid      = all 4 blocks together
```

If you point at only `Block 2`, you are talking about one block.

If you point at `Block 0 + Block 1 + Block 2 + Block 3`, you are talking about the grid.

Triton does not send the whole vector to one GPU worker. It starts many small GPU workers, and each one handles one block.

Each program instance:

- gets an ID
- uses that ID to figure out which block of the vector it owns
- computes the element positions for that block
- loads values, adds them, and stores the result

In the code, these names matter:

- `pid`: short for program ID, meaning which program instance this is
- `offsets`: the exact element positions this program instance should touch
- `mask`: a safety check that prevents reading or writing past the end of the array

So the mental model for the whole kernel is:

1. take one long vector
2. split it into blocks
3. launch a grid of program instances
4. let each program instance handle one block
5. combine all the blocks into one final output vector

That is why this example is useful. The computation is simple, so when the later dumps become more detailed, most of what you are seeing is the compiler's work rather than difficult math.

## Acronym Glossary

:::note Acronym Map

If the names start blending together, come back to this table. The article gets much easier once these labels stop feeling like noise.
:::

| Acronym | Meaning |
|---------|---------|
| `TTIR` | Triton IR |
| `TTGIR` | Triton GPU IR |
| `LLIR` | LLVM IR |
| `AMDGCN` | AMD GPU assembly / ISA view |
| `HSACO` | HSA Code Object |
| `CTA` | Cooperative Thread Array, basically a thread block |
| `HSA` | Heterogeneous System Architecture |

## The Kernel

With the environment verified, we can pick the smallest useful kernel. This choice matters more than it seems because the right kernel makes the compiler visible instead of burying it under algorithmic complexity.

We use vector addition. Not because it is exciting, but because it is simple.

A complex kernel has too many moving parts. You end up studying the algorithm instead of studying the compiler. Vector addition has almost no algorithmic complexity, which means the interesting things you see in the dumps mostly come from the compiler, not the math.

That makes it the right microscope.

## Before We Implement It

Before writing the kernel, be clear about the job.

We are trying to do two things at once:

1. write the smallest useful GPU kernel
2. make sure that kernel is simple enough that we can follow it through every compiler stage

The kernel itself is easy: load values from `a`, load values from `b`, add them, and store the result.

The harder part is everything around it:

- the GPU runtime must be working
- PyTorch must see the AMD GPU
- Triton must compile for the right target
- the first launch must succeed so the compiled stages appear in Triton's cache

Those are the main places where beginners usually get stuck.

Here is the practical checklist:

- If `torch.cuda.is_available()` is `False`, stop and fix the runtime first.
- If `torch.cuda.get_device_name(0)` or `gcnArchName` fails, the problem is still setup, not TTIR or LLVM IR.
- If the kernel runs but no stages appear, inspect `compiled.asm.keys()` and confirm that `ttir`, `ttgir`, `llir`, `amdgcn`, and `hsaco` are actually present.
- If the math result is wrong, verify the kernel with `ref = a + b` before reading any IR.

So the order of attack is:

1. make the runtime healthy
2. make the kernel correct
3. make sure compilation happened
4. only then start reading the dumps

That order saves a lot of wasted time. Otherwise it is easy to debug compiler stages when the real problem is just that the GPU launch never worked.

```python
import torch
import triton
import triton.language as tl

# Prefer the high-precision matmul path when Triton/PyTorch use it.
torch.set_float32_matmul_precision('high')

# `@triton.jit` tells Triton to compile this Python-like function for the GPU.
@triton.jit
def vector_add_kernel(
    ptr_a, ptr_b, ptr_out, n_elements,   # input A, input B, output, total size
    BLOCK: tl.constexpr,                 # how many elements one GPU worker handles
):
    # Which GPU worker is this along axis 0?
    pid = tl.program_id(axis=0)
    # Build the element positions handled by this worker.
    offsets = pid * BLOCK + tl.arange(0, BLOCK)
    # Keep only valid positions near the end of the input.
    mask = offsets < n_elements
    # Read values from A and B for these positions.
    a = tl.load(ptr_a + offsets, mask=mask)
    b = tl.load(ptr_b + offsets, mask=mask)
    # Add the values and write the result back to output.
    tl.store(ptr_out + offsets, a + b, mask=mask)
```

Six lines of actual logic.

Read them like this:

- `pid` decides which chunk of work this GPU program instance owns.
- `offsets` builds the positions this instance should process.
- `mask` prevents reading past the end of the array.
- `tl.load` reads values from the two input arrays.
- `a + b` adds matching values.
- `tl.store` writes the result back out.

That is enough for the compiler to build IR, assign thread layout, vectorize memory operations, lower to LLVM, select AMD GPU instructions, and produce a final executable code object.

That is the core lesson already: **small kernels can still have rich compiler pipelines**.

## A Simple Pipeline Summary

Before we run the script, it helps to pin down the story arc once in plain language. Otherwise the five output files can feel like unrelated compiler debris.

Before we run anything, keep this diagram in mind:

```python
Python Triton kernel
    ↓
TTIR
    ↓
TTGIR
    ↓
LLVM IR
    ↓
AMDGCN assembly
    ↓
HSACO binary
    ↓
ROCm runtime loads and launches on GPU
```

A slightly more useful interpretation is this:

```python
What to compute
    ↓
How GPU threads should share the work
    ↓
How LLVM models the work
    ↓
What hardware instructions execute
    ↓
What binary ROCm actually launches
```

Each stage is answering the same kernel in a more concrete language.

## Same Code Across Five Stages

This is the compact mental model to keep in your head:

| Stage | What the same idea looks like |
|-------|-------------------------------|
| Python | `a + b` |
| TTIR | tensor add |
| TTGIR | threads + layout |
| LLVM IR | intrinsics + vectors |
| AMDGCN | instructions |
| HSACO | binary |

Same idea, less abstraction, more commitment.

## Running and Dumping Every Stage

Now we are ready to make the pipeline concrete. The script below does two jobs: it forces compilation, and then it writes the generated artifacts to disk.

On this Triton 3.6.0 setup, a more stable way to get the compiled stages is to use `warmup(..., grid=grid)` and read the returned `CompiledKernel`. That is safer than reaching into `device_caches[0]`, which is more version-dependent.

```python
import torch
import triton
import triton.language as tl

# Prefer the high-precision matmul path when Triton/PyTorch use it.
torch.set_float32_matmul_precision('high')

# `@triton.jit` tells Triton to compile this Python-like function for the GPU.
@triton.jit
def vector_add_kernel(
    ptr_a, ptr_b, ptr_out, n_elements,   # input A, input B, output, total size
    BLOCK: tl.constexpr,                 # how many elements one GPU worker handles
):
    # Which GPU worker is this along axis 0?
    pid = tl.program_id(axis=0)
    # Build the element positions handled by this worker.
    offsets = pid * BLOCK + tl.arange(0, BLOCK)
    # Keep only valid positions near the end of the input.
    mask = offsets < n_elements
    # Read values from A and B for these positions.
    a = tl.load(ptr_a + offsets, mask=mask)
    b = tl.load(ptr_b + offsets, mask=mask)
    # Add the values and write the result back to output.
    tl.store(ptr_out + offsets, a + b, mask=mask)

# Create inputs directly on the GPU — avoids a CPU→GPU copy
a = torch.rand(1024 * 1024, device='cuda', dtype=torch.float32)
b = torch.rand(1024 * 1024, device='cuda', dtype=torch.float32)
out = torch.empty_like(a)

n = a.numel()
BLOCK = 1024
grid = (triton.cdiv(n, BLOCK),)

# Compile first and keep the returned CompiledKernel object.
compiled = vector_add_kernel.warmup(a, b, out, n, BLOCK=BLOCK, grid=grid)

print(f"\nTarget:  {compiled.metadata.target}")
print(f"Available stages: {list(compiled.asm.keys())}")

# Launch the real kernel after compilation.
vector_add_kernel[grid](a, b, out, n, BLOCK=BLOCK)

# Verify correctness
ref = a + b
print("Max error:", (out - ref).abs().max().item())  # should be 0.0

# Write each stage to its own file
asm = compiled.asm

with open("stage1_ttir.txt", "w") as f:
    f.write(asm.get('ttir', 'not available'))

with open("stage2_ttgir.txt", "w") as f:
    f.write(asm.get('ttgir', 'not available'))

with open("stage3_llir.txt", "w") as f:
    f.write(asm.get('llir', 'not available'))

with open("stage4_amdgcn.txt", "w") as f:
    f.write(asm.get('amdgcn', 'not available'))

with open("stage5_hsaco.bin", "wb") as f:
    hsaco = asm.get('hsaco', b'')
    if isinstance(hsaco, str):
        hsaco = hsaco.encode()
    f.write(hsaco)

print("\nWritten:")
print("  stage1_ttir.txt    — Triton IR")
print("  stage2_ttgir.txt   — Triton GPU IR")
print("  stage3_llir.txt    — LLVM IR")
print("  stage4_amdgcn.txt  — gfx1200 assembly")
print("  stage5_hsaco.bin   — executable binary")
```

If you want Triton to recompile every time while you experiment, you can still use:

```python
TRITON_ALWAYS_COMPILE=1 python3 vector_add.py
```

That flag is useful for forcing recompilation, but it does **not** replace the extraction step by itself. The reliable part here is that `warmup(..., grid=grid)` returns the `CompiledKernel` object with `.asm`.

Run it:

```python
python3 vector_add.py
```

You should see:

```python
Max error: 0.0
Target:  GPUTarget(backend='hip', arch='gfx1200', warp_size=32)
Available stages: ['source', 'ttir', 'ttgir', 'llir', 'amdgcn', 'hsaco']

Written:
  stage1_ttir.txt    — Triton IR
  stage2_ttgir.txt   — Triton GPU IR
  stage3_llir.txt    — LLVM IR
  stage4_amdgcn.txt  — gfx1200 assembly
  stage5_hsaco.bin   — executable binary
```

Five files. Five stages. One kernel.

Now the abstract "ML compiler stack" becomes something you can inspect directly.

## Stage 1 — Triton IR (`ttir`)

This is the last stage that still feels close to your source. Read it as the algorithm rewritten into compiler form, before Triton has fully committed to a GPU execution plan.

```python
cat stage1_ttir.txt
```

This is the highest-level IR. It still looks like your Python kernel, just expressed as an SSA module.

Key things to read in your output:

```mlir
tt.func public @vector_add_kernel(...)
  %pid = tt.get_program_id x : i32
  %offsets_2 = arith.addi %offsets_1, %offsets_0 : tensor<1024xi32>
  %mask_3 = arith.cmpi slt, %offsets_2, %mask : tensor<1024xi32>
  %a_5 = tt.load %a_4, %mask_3 : tensor<1024x!tt.ptr<f32>>
  %2   = arith.addf %a_5, %b_7 : tensor<1024xf32>
  tt.store %1, %2, %mask_3 : tensor<1024x!tt.ptr<f32>>
```

What this stage still knows:

- The tensor shape: `tensor<1024xf32>` — operations are explicitly typed with size
- The masking logic: `arith.cmpi slt` is your `mask = offsets < n_elements`
- The memory ops: `tt.load` and `tt.store` — abstract memory operations, not hardware-specific yet
- The pointer arithmetic: address computation is already explicit

What this stage has not committed to yet:

- exactly how threads are grouped
- how the work is distributed across waves/warps
- whether accesses will become vector loads
- which AMD instructions will execute this

The important shift is simple: TTIR still knows the math, but it has not yet nailed down the GPU execution strategy. That is what changes in TTGIR.

## Stage 2 — Triton GPU IR (`ttgir`)

TTGIR is where the article stops being about "a kernel exists" and starts being about "the compiler has chosen an execution strategy." This is usually the first stage where serious learners begin to see why ML compiler stacks need more than one IR.

TTGIR is where Triton turns the kernel into a GPU execution plan. TTIR says what the kernel computes; TTGIR adds how threads and waves are going to share the work.

```python
cat stage2_ttgir.txt
```

This is where the compiler makes its first major execution decisions. Read the header:

```mlir
#blocked = #ttg.blocked<{sizePerThread = [4], threadsPerWarp = [32], warpsPerCTA = [4], order = [0]}>
module attributes {
  "ttg.num-warps" = 4 : i32,
  ttg.target = "hip:gfx1200",
  "ttg.threads-per-warp" = 32 : i32
}
```

### Decode This Layout Decision

| Field | Value | Meaning |
|-------|-------|---------|
| `sizePerThread` | 4 | each thread handles 4 elements |
| `threadsPerWarp` | 32 | AMD wave32 mode on this target |
| `warpsPerCTA` | 4 | 4 warps per thread block / CTA |
| `ttg.target` | `hip:gfx1200` | this lowering is now targeting AMD GPU backend |

How to read `#blocked` without memorizing it:

1. start with `sizePerThread`
2. multiply by `threadsPerWarp`
3. multiply by `warpsPerCTA`
4. treat the result as the size of one execution slice

For this example:

`4 × 32 × 4 = 512`

That is the first number you should compute whenever you see a blocked layout like this.

Now do the arithmetic, because it matters here:

`4 elements/thread × 32 threads/warp × 4 warps = 512 elements`

But the kernel was launched with `BLOCK=1024`, and the TTGIR value type is still `tensor<1024xf32, #blocked>`.

Think of TTGIR as describing how one slice of the work runs, not the entire tile at once.

So where did the other 512 elements go?

The most important clarification is this:

**do not expect `sizePerThread × threadsPerWarp × warpsPerCTA` to equal `BLOCK`.**  
The layout describes how work is distributed in one execution slice. The logical tile can be larger than that slice.

In this case:

- logical tile size: `BLOCK = 1024`
- one blocked execution slice: `4 × 32 × 4 = 512`
- so the 1024-element tile is covered as **two 512-element slices**

For this local run, the later lowering makes that concrete. In LLVM IR, the compiler forms two offsets:

- `%12` for the first 512-element slice
- `%13 = %12 | 512` for the second 512-element slice

Then it emits two sets of vector loads and stores:

- loads using `%18`
- more loads using `%25`
- one store using `%18`
- another store using `%25`

So here the compiler does not present the extra 512 elements as a visible loop. It materializes two address streams and two sets of vector-width memory operations.

That is why the numbers are not actually inconsistent:

- `BLOCK=1024` is the logical tile size the kernel is responsible for.
- `sizePerThread × threadsPerWarp × warpsPerCTA = 512` is the amount of work described by one blocked execution slice.
- The compiler covers the 1024-element tile with two such slices under the same layout.

A useful way to sanity-check that reading is to keep an eye on the later ISA. You will see repeated `buffer_load_b128` instructions rather than one single 1024-element hardware transaction. In the local run, that shows up as two loads for `a`, two loads for `b`, and matching stores for the output.

That is the first place in the article where "logical program tile" and "physical execution slice" visibly diverge, and it is worth noticing rather than glossing over.

### Blocked Layout Visual

```python
One program instance owns 1024 logical elements:

0 ------------------------------------------------------------------ 1023
|----------------------- Slice 0 ----------------------|---------------------- Slice 1 ----------------------|
0                                                    511                                                   1023

Each slice is distributed as:
4 elements/thread × 32 threads/wave × 4 waves = 512 elements

So TTGIR is not saying "one 1024-wide hardware action".
It is saying "the 1024-element tile is executed as two 512-element blocked slices".
```

Also notice the ops changed:

```mlir
%a = amdg.buffer_load %ptr_a[%offsets_2], %mask_3 : tensor<1024xf32, #blocked>
%b = amdg.buffer_load %ptr_b[%offsets_2], %mask_3 : tensor<1024xf32, #blocked>
amdg.buffer_store %0, %ptr_out[%offsets_2], %mask_3 : tensor<1024xf32, #blocked>
```

The key change is compact:

- `amdg.buffer_load` means the load is now expressed in AMD-aware GPU memory terms
- `#blocked` means the tensor value now carries an execution layout, not just a shape

What TTGIR is deciding:

- how elements are grouped for execution
- how threads cooperate on the tensor
- what layout best matches the target backend
- which memory access style should be used for AMD

This is the first stage where the compiler is clearly answering not just what the kernel computes, but how the GPU will divide the work. That is why TTGIR matters so much.

👉 Pause here.

If you understood:

- blocked layout
- slice vs tile

You already understand more than 90% of people using GPUs.

## Stage 3 — LLVM IR (`llir`)

LLVM IR is where the Triton-specific view gives way to a lower-level compiler IR. The tensor abstraction fades, and address spaces, intrinsics, and vector-width memory operations become explicit.

If TTGIR felt okay but LLVM looks scary:

Ignore 90% of the file.

Just look for:

- `workgroup.id`
- `buffer.load`
- vector width

That is enough for now.

```python
head -60 stage3_llir.txt
```

The target triple tells you exactly where you are:

```llvm
target triple = "amdgcn-amd-amdhsa"
```

You are now fully inside LLVM’s AMDGPU pipeline.

Key intrinsics to recognize:

```llvm
%7  = tail call i32 @llvm.amdgcn.workgroup.id.x()
%9  = tail call i32 @llvm.amdgcn.workitem.id.x()
%16 = tail call ptr addrspace(8) @llvm.amdgcn.make.buffer.rsrc.p8.p1(...)
%19 = tail call <4 x float> @llvm.amdgcn.raw.ptr.buffer.load.v4f32(...)
```

### Intuition for These Intrinsics

| Intrinsic | What it means |
|-----------|---------------|
| `workgroup.id.x` | which thread block/workgroup is running this code |
| `workitem.id.x` | which lane/thread inside that block |
| `make.buffer.rsrc` | build the descriptor the GPU uses to access VRAM buffers |
| `buffer.load.v4f32` | load 4 floats at once as a vector |

Two of these are especially important for beginners:

- `workgroup.id.x`: this is the lower-level descendant of your logical program index
- `buffer.load.v4f32`: this means the compiler is already thinking in terms of wider memory transactions, not scalar loads

The `<4 x float>` type is the vectorizer at work.

Your Triton code looked scalar-ish:

```python
a = tl.load(ptr_a + offsets, mask=mask)
```

But LLVM has decided that moving four floats together is profitable, so it emits vector operations.

- which low-level intrinsics model the GPU execution
- how buffer access is expressed
- how vectorization should look
- how address spaces are represented

This is where you start seeing decisions that were not present in the source code at all: vector loads, explicit AMD buffer resource descriptors, and workitem intrinsics.

### Load Evolution

| Stage | What the load looks like |
|-------|---------------------------|
| Triton source | `tl.load(ptr_a + offsets, mask=mask)` |
| TTIR | `tt.load ... %mask_3` |
| TTGIR | `amdg.buffer_load ... %mask_3` |
| LLVM IR | `@llvm.amdgcn.raw.ptr.buffer.load.v4f32(...)` |
| AMDGCN | `buffer_load_b128 ...` |

The same load survives all five stages, but it becomes progressively more specific about masking, address calculation, vector width, and the exact AMD memory path.

## Stage 4 — gfx1200 Assembly (`amdgcn`)

By this point, the compiler has already made almost all of the interesting structural decisions. The assembly is where you stop asking "what did the compiler mean?" and start asking "what will the hardware actually do?"

This is the first stage where you are looking at the instruction stream the GPU will actually execute. At this point, abstractions have turned into registers, compares, buffer operations, and control bits.

```python
cat stage4_amdgcn.txt
```

Read the first few instructions:

```rust
s_clause 0x1
s_load_b96  s[4:6], s[0:1], 0x10
s_load_b128 s[0:3], s[0:1], 0x0
```

### Intuition for These Instructions

- `s_` means **scalar**: one shared value for the whole wavefront
- these are usually used for kernel arguments, descriptors, constants, and launch metadata

In other words: values that every lane agrees on go into scalar registers.

That is one of the most important architectural patterns to notice on AMD GPUs.

Then you will see vector instructions:

```rust
v_lshl_or_b32 v0, v0, 2, s7
v_or_b32_e32  v1, 0x200, v0
```

### Intuition for Vector Ops

- `v_` means **vector**: one value per active lane
- these instructions are doing per-lane work, like computing addresses or offsets
- even if the instruction appears once in text, conceptually it is producing one result per lane

That is why GPU ISA can look strange at first: one instruction often means "do this in parallel across the wave."

Now look at masking:

```rust
v_cmp_gt_i32_e32 vcc_lo, s6, v0
v_cndmask_b32_e32 v16, 0x80000000, v2, vcc_lo
```

### Intuition for the Mask Lowering

This is the hardware version of:

```python
mask = offsets < n_elements
```

What is happening here:

- `v_cmp_gt_i32_e32`: compare per-lane offsets against the valid bound
- `vcc_lo`: stores a lane-wise condition mask
- `v_cndmask_b32_e32`: choose one value or another depending on that mask

So your nice high-level boolean mask has turned into:

- per-lane comparison
- hardware condition bits
- per-lane select behavior

That is normal. That is what lowering means.

Then the loads:

```rust
buffer_load_b128 v[0:3], v16, s[8:11], null offen
buffer_load_b128 v[4:7], v17, s[8:11], null offen
```

### Intuition for `buffer_load_b128`

- `buffer_load`: use AMD’s buffer memory path
- `b128`: load 128 bits at a time
- `v[0:3]`: the result spans several vector registers

This is the moment where you can clearly see that the compiler has extracted wide memory operations from a simple source kernel.

At this point, something important should click:

You wrote:

`a + b`

The GPU executes:

- compare instructions
- masked execution
- 128-bit memory loads
- per-lane arithmetic

That gap is the compiler.

### Instruction Mix From This Run

From the local `stage4_amdgcn.txt` generated on this machine:

- scalar-prefixed instructions (`s_`): `23`
- vector-prefixed instructions (`v_`): `12`
- `buffer_load_b128`: `4`
- `buffer_store_b128`: `2`

That mix already tells you something useful:

- there is a noticeable scalar setup phase for descriptors, constants, and launch state
- the hot data path is still vector work
- the repeated `buffer_load_b128` instructions say this kernel is heavily memory-oriented

On this RDNA 4 GPU, wave32 matters here too. TTGIR already told us the target is using 32 threads per wave, and the AMDGCN metadata confirms `.amdhsa_wavefront_size32 1`. That means the lane-wise vector instructions you see are operating in wave32 mode, which is exactly the execution shape the compiler chose for this kernel.

Wave32 vs wave64 is a tradeoff between occupancy and instruction-level parallelism. For a memory-oriented kernel like this one, wave32 is often a good fit because it keeps the active group smaller and can reduce the cost of divergence. For more compute-heavy kernels, wave64 can sometimes be better if the machine benefits from the wider wave. On this `gfx1200` run, the compiler chose wave32 for the generated kernel, and you can verify that decision directly in the metadata with `.amdhsa_wavefront_size32 1`.

For performance intuition, the heavy use of `buffer_load_b128` is the clue to care about first. Vector add does very little arithmetic per element, so if those buffer loads become inefficient, the whole kernel slows down quickly. This is why the memory path is more important than the math for this example.

- how to split uniform vs per-lane work
- how to represent the mask in hardware terms
- how wide memory loads should be
- what exact instruction sequence executes the kernel

### Mask Evolution

| Stage | What the mask looks like |
|-------|---------------------------|
| Triton source | `mask = offsets < n_elements` |
| TTIR | `arith.cmpi slt` |
| TTGIR | masked `amdg.buffer_load` / `amdg.buffer_store` |
| AMDGCN | `v_cmp_gt_i32_e32` + `v_cndmask_b32_e32` |

This is one of the best things to trace across the article because the idea stays the same while the vocabulary becomes more hardware-specific.

## Stage 5 — HSACO Binary (`hsaco`)

The final step is less about readability and more about closure. The compiler is no longer trying to explain itself to you. It is handing the runtime a packaged artifact it can load and launch.

HSACO is the final deliverable of the compilation pipeline: not just assembly text, but the runtime-loadable code object ROCm actually launches.

### Inspect the File

```python
wc -c stage5_hsaco.bin   # 5552 bytes on this machine
file stage5_hsaco.bin    # ELF shared object
```

HSACO (HSA Code Object) is the final binary the ROCm runtime loads onto the GPU. It is an ELF-format shared object containing:

- the compiled kernel code in gfx1200 machine code
- metadata: register counts, shared memory usage, argument layout
- debug information, if present
- enough structure for the runtime loader to understand what kernel exists and how to invoke it

You can inspect the ELF headers:

```python
readelf -h stage5_hsaco.bin     # ELF header
readelf -S stage5_hsaco.bin     # section list
llvm-objdump -d stage5_hsaco.bin  # disassemble back to ISA
```

That last command is the interesting one, because it lets you ask a better question than "is HSACO readable?"

Ask this instead:

**if I disassemble the packaged binary, do I get back the same instruction stream I saw in `stage4_amdgcn.txt`?**

On this machine, the answer was: **yes for the kernel body, with extra ELF/disassembly presentation around it**.

You should see the same structure reappear:

- scalar setup instructions such as `s_load_*`
- lane-wise compare and mask handling such as `v_cmp_*`
- AMD buffer memory ops such as `buffer_load_b128`
- the arithmetic body, which in this run includes `v_dual_add_f32`

What usually differs is not the core instruction story. The differences are things like:

- disassembler formatting
- symbol names and labels
- ELF/code object directives and metadata
- trailing padding and terminators such as repeated `s_code_end` lines in the disassembly view

In the local run here, the first real kernel instructions matched in the way you would hope: `s_load_b96`, `s_load_b128`, `v_cmp_gt_i32_e32`, `buffer_load_b128`, `v_dual_add_f32`, and `buffer_store_b128` all reappeared in the HSACO disassembly. That comparison is what makes the HSACO stage worth keeping: `stage4_amdgcn.txt` is the readable ISA view, and `stage5_hsaco.bin` is the packaged runtime object that still contains that same kernel body.

If you want to test this directly, disassemble the HSACO and compare the first few non-directive lines with `stage4_amdgcn.txt`:

```python
llvm-objdump -d stage5_hsaco.bin | sed -n '1,80p'
sed -n '1,80p' stage4_amdgcn.txt
```

Here is the kind of before/after comparison you should expect:

```python
Stage 4 AMDGCN text dump:
  s_load_b96 ...
  s_load_b128 ...
  v_cmp_gt_i32_e32 ...
  buffer_load_b128 ...
  v_dual_add_f32 ...
  buffer_store_b128 ...

HSACO disassembled with llvm-objdump:
  s_load_b96 ...
  s_load_b128 ...
  v_cmp_gt_i32_e32 ...
  buffer_load_b128 ...
  v_dual_add_f32 ...
  buffer_store_b128 ...
```

The useful point is not that the text is byte-for-byte identical. It is that the same kernel body survives packaging. The HSACO file is not hiding a different program. It is carrying the same instruction stream in a runtime-loadable form.

After this point, the runtime takes over: load the code object, prepare kernel arguments, bind buffers, launch the kernel, and synchronize with the host.


<div>
  <AdBanner />
</div>

## What to Expect Before Opening Files

Before stepping back for the full picture, it helps to set expectations correctly for how to read the dumps.

You are **not** going to read these files linearly from top to bottom and understand everything immediately. That is not how this works, even for experienced compiler engineers.

Instead:

- each file is a snapshot of the kernel at a different level of abstraction
- each stage preserves some information and discards other information
- you only need to notice a few important features in each dump
- the goal is not "read everything"
- the goal is "spot what changed, and understand why"

That shift matters.

If you open any file expecting it to "look readable," you will feel lost.

If you open it expecting to answer "how did my mask turn into hardware instructions?" you will make progress.

So throughout the article, keep narrowing attention.

- find the shape
- find the memory ops
- find the mask
- find the thread mapping
- find the vectorization
- find where abstraction disappeared

That is the right way to read compiler output.

## If You Feel Lost, Read This

If at any point the IR starts to feel dense, come back to this mental anchor:

**Every stage is the same kernel, just described with different vocabulary.**

The kernel is always doing the same thing:

1. figure out which chunk of data this program instance owns
2. compute offsets
3. guard out-of-bounds lanes with a mask
4. load `a`
5. load `b`
6. add them
7. store the result

That never changes.

What changes is how explicitly the compiler describes it.

- In Triton IR, it still looks like tensor math.
- In Triton GPU IR, thread layout becomes explicit.
- In LLVM IR, machine-oriented intrinsics appear.
- In AMDGCN, everything becomes registers, instructions, and control bits.
- In HSACO, even the readable text disappears and you are left with the runtime-loadable binary.

Same kernel. Different levels of commitment.

## Where the Important Decisions Happened

At this point, the more interesting summary is not another stage list. It is: **where did the consequential decisions actually happen?**

- **TTIR:** the computation is still recognizable, but the important choices are mostly still pending.
- **TTGIR:** this is the first major commitment point. Thread layout, blocked execution structure, and AMD-aware memory ops show up here.
- **LLVM IR:** this is where backend-facing modeling becomes explicit. Address spaces, AMDGPU intrinsics, and vector-width memory behavior stop being implicit and start being spelled out.
- **AMDGCN:** this is where the cost model becomes tangible. You can count scalar setup, vector ALU work, compare instructions, and wide loads directly.
- **HSACO:** there is usually less new algorithmic information here, but it closes the loop by proving that the ISA was not just a textual compiler dump. It became the code object the runtime will actually launch.

If you are reading the article as a performance engineer rather than as a tourist, TTGIR and AMDGCN are usually the two stages to stare at the longest:

- TTGIR tells you how the compiler decided to map the problem onto the machine.
- AMDGCN tells you what that decision cost in real instructions.

## What Changes If You Change `BLOCK`?

One of the best ways to make the article concrete is to change one parameter and compare all five outputs.

For example, change:

- `BLOCK=512`
- `BLOCK=1024`

Then compare what changes in each file:

| File | What usually changes |
|------|----------------------|
| `stage1_ttir.txt` | tensor widths, ranges, and mask shapes |
| `stage2_ttgir.txt` | how the logical tile relates to the blocked execution slice |
| `stage3_llir.txt` | offset math, vector memory operations, and how many distinct address streams appear |
| `stage4_amdgcn.txt` | instruction mix, especially `buffer_load_b128`, compares, and address-building ops |
| `stage5_hsaco.bin` | final binary size and the packaged kernel body |

Use that comparison to ask a very practical question:

**what changed because the problem changed, and what stayed the same because the execution strategy stayed the same?**

A simple diff workflow is:

```python
diff -u block512/stage2_ttgir.txt block1024/stage2_ttgir.txt
diff -u block512/stage3_llir.txt block1024/stage3_llir.txt
diff -u block512/stage4_amdgcn.txt block1024/stage4_amdgcn.txt
```

That turns the article's main question, "what changed?", into something you can inspect line by line.

## Useful Commands for Exploration

Once you stop treating the dumps as sacred text and start interrogating them, simple shell commands become surprisingly powerful. The goal here is not fancy tooling. The goal is to ask focused questions quickly.

Once you have the files, these commands let you dig into each stage without drowning in detail.

```python
# Count instruction types in the ISA — see what the GPU actually spends time on
grep -oP "^\s+\K[a-z_]+" stage4_amdgcn.txt | sort | uniq -c | sort -rn | head -20
```

This is useful because it forces you to stop thinking in source-code terms and start looking at instruction mix.

```python
# Find all memory operations
grep -E "buffer_load|buffer_store|global_load|global_store" stage4_amdgcn.txt
```

If you want to understand whether the kernel is memory-oriented, this is a good place to start.

```python
# Find all vector ALU ops
grep -E "^        v_" stage4_amdgcn.txt | head -20
```

A quick way to see the per-lane work being done.

```python
# Check how many scalar vs vector instructions
echo "Scalar:"; grep -c "^        s_" stage4_amdgcn.txt
echo "Vector:"; grep -c "^        v_" stage4_amdgcn.txt
```

A nice sanity check for whether the kernel is dominated by uniform setup or lane-wise work.

```python
# Find where your Python line numbers map to in the ISA
grep "vector_add.py" stage4_amdgcn.txt
```

Useful if debug mappings are present.

```python
# Check register pressure in LLVM IR
grep "define amdgpu_kernel" stage3_llir.txt
```

A small but useful anchor point when you start exploring low-level kernel definitions.

## What the Compiler Did for You

This is the part worth pausing on.

In six lines of Triton, you wrote:

- compute offsets
- build a mask
- load two arrays
- add them
- store the result

You did **not** explicitly write:

- wave32 execution behavior
- blocked layout metadata
- AMD buffer resource construction
- LLVM AMDGPU intrinsics
- per-lane condition-code handling
- 128-bit load instructions
- code object packaging

The compiler created all of that.

From your simple source kernel, you got:

- **automatic vectorization:** scalar-looking loads became wide memory transactions
- **masked memory safety:** out-of-bounds lanes became hardware-level guarded behavior
- **thread-layout assignment:** Triton mapped abstract work onto an AMD execution structure
- **buffer-based VRAM access:** LLVM and AMDGPU lowering set up the right memory access form
- **a runnable GPU binary:** ROCm received a code object, not just text assembly

That is the practical meaning of a compiler stack: not just translation, but staged decision-making under hardware constraints.

## Why This Matters for Performance

The IR is interesting only if it connects back to what the hardware actually spent time doing.

I profiled the same local vector-add kernel with PyTorch Profiler on this machine. The key numbers from one run were:

- `vector_add_kernel`: `104.840us` of GPU time
- `hipModuleLaunchKernel`: `18.460us` of CPU-side launch overhead
- `hipDeviceSynchronize`: `646.532us` of self CPU time

Important measurement note:

- this profiling script explicitly calls `torch.cuda.synchronize()` inside the profiled region
- PyTorch Profiler also introduces its own measurement overhead
- so the `hipDeviceSynchronize` number is **not** the intrinsic runtime cost of the kernel body by itself

:::note Profiling Caveat

Read `hipDeviceSynchronize` here as measurement methodology, not as the kernel's own raw runtime. The more reliable number to connect back to the IR is the kernel's reported GPU time.
:::

Read that line as a measurement artifact of "host waits for GPU work to finish so the profiler can report a stable result", not as "this kernel naturally spends 646us in synchronization every time."

That tells you two practical things immediately:

- the kernel body itself is short and bandwidth-oriented
- host-side synchronization and profiling overhead can dominate the observed CPU-side time for tiny kernels

That lines up with the IR and ISA we just saw. In the local AMDGCN dump, the kernel body contains:

- `4 × buffer_load_b128`
- `2 × buffer_store_b128`
- a small arithmetic core built around `v_dual_add_f32`

That is exactly the shape of a memory-oriented kernel: a lot of wide data movement, a little arithmetic, then stores. So the useful profiler number to connect back to the IR is the kernel's own GPU time, about `104.840us`, not the larger `hipDeviceSynchronize` CPU-side wait. The real lesson is methodological: tiny kernels often make synchronization and profiling overhead very visible, so you have to separate "kernel time" from "measurement time."

## What Comes Next

If you want to keep exploring, the best follow-ups are the ones that produce a small, inspectable change in the dumps.

### 1. Change the tile size and watch TTGIR answer differently

Run the same script with `BLOCK=512` and then `BLOCK=2048`.

Compare:

- the `#ttg.blocked<...>` header in `stage2_ttgir.txt`
- the count of `buffer_load_b128` and `v_cmp_*` instructions in `stage4_amdgcn.txt`

The concrete question to ask is:

**when the logical tile gets bigger or smaller, which part changes first: the layout metadata, the memory width, or the masking cost?**

That turns tuning into something you can inspect rather than guess.

### 2. Force a partial tile and watch the mask propagate

Change the input size so the last program instance is only partly full:

```python
a = torch.rand(1024 * 1024 + 13, device='cuda', dtype=torch.float32)
b = torch.rand(1024 * 1024 + 13, device='cuda', dtype=torch.float32)
```

Then look for the same idea at three stages:

- `arith.cmpi slt` in `stage1_ttir.txt`
- the masked `amdg.buffer_load` / `amdg.buffer_store` in `stage2_ttgir.txt`
- `v_cmp_*` and conditional lane behavior in `stage4_amdgcn.txt`

This is a good experiment because almost nothing else changes. It isolates one question: how does a high-level mask survive all the way down to hardware condition bits?

### 3. Disassemble the HSACO and compare it with Stage 4

Run:

```python
llvm-objdump -d stage5_hsaco.bin > stage5_disassembled.txt
```

Then compare `stage5_disassembled.txt` with `stage4_amdgcn.txt`.

Do not try to diff every line. Look for just three recurring motifs:

- scalar setup instructions
- vector compare/mask instructions
- `buffer_load_b128` / `buffer_store_*`

The question here is simple: **how much of Stage 4 survives packaging unchanged?**

That experiment makes the HSACO stage feel much less abstract.

### 4. Add one more input and look for fusion

Keep the experiment small. Change the kernel from `a + b` to `a + b + c`, then dump the same five stages again.

This is a better next step than jumping straight to matmul, because the kernel still stays easy to read while the compiler work becomes slightly richer.

What to compare:

- whether TTGIR introduces one more load but still keeps the same blocked layout
- whether LLVM IR shows one more vector load and one more add
- whether AMDGCN grows by one more memory stream and a little more arithmetic

The useful question is:

**did the compiler keep the whole expression inside one fused kernel, or did the structure become more fragmented?**

## Final Thought

Most people use GPUs without ever seeing what runs.

Now you have seen it.

Not as an abstraction.
Not as a diagram.

But as code that exists, changes, and can be inspected.

That changes how you debug.
That changes how you optimize.
That changes how you think about performance.

## FAQ

**Do I need to understand every line in every dump?**

No. The productive way to read these files is to track a few recurring ideas: offsets, masks, loads, stores, thread layout, and where each abstraction disappears.

**Which stage should I inspect first if I am confused?**

Start with `stage1_ttir.txt`, then `stage2_ttgir.txt`. Those two stages usually make the later LLVM and ISA output much easier to interpret.

**Which stage usually contains the most important compiler decision?**

For this article, TTGIR is usually the first major turning point because that is where work distribution and blocked layout become explicit. AMDGCN is where you can see the cost of that decision in real instructions.

**Why use vector addition instead of a more interesting kernel?**

Because the algorithm is intentionally simple. That keeps the article focused on the compiler pipeline instead of on the math of the kernel itself.

**What should I change first if I want to experiment?**

Change one variable at a time. `BLOCK` size and input length are the two best first experiments because they produce visible differences without changing the whole structure of the kernel.

---

*Part of the [ML Compilers Track](/docs/tracks/ml-compilers) on CompilerSutra.*

*Next: Writing a Tiled Matmul Kernel on AMD GPU — LDS, autotuning, and measuring memory bandwidth.*

<div>
  <AdBanner />
</div>



<Tabs>
  <TabItem value="docs" label="📚 Documentation">
             - [CompilerSutra Home](https://compilersutra.com)
                - [CompilerSutra Homepage (Alt)](https://compilersutra.com/)
                - [Getting Started Guide](https://compilersutra.com/get-started)
                - [Skip to Content (Accessibility)](https://compilersutra.com#__docusaurus_skipToContent_fallback)


  </TabItem>

  <TabItem value="tutorials" label="📖 Tutorials & Guides">

        - [AI Documentation](https://compilersutra.com/docs/Ai)
        - [DSA Overview](https://compilersutra.com/docs/DSA/)
        - [DSA Detailed Guide](https://compilersutra.com/docs/DSA/DSA)
        - [MLIR Introduction](https://compilersutra.com/docs/MLIR/intro)
        - [TVM for Beginners](https://compilersutra.com/docs/tvm-for-beginners)
        - [Python Tutorial](https://compilersutra.com/docs/python/python_tutorial)
        - [C++ Tutorial](https://compilersutra.com/docs/c++/CppTutorial)
        - [C++ Main File Explained](https://compilersutra.com/docs/c++/c++_main_file)
        - [Compiler Design Basics](https://compilersutra.com/docs/compilers/compiler)
        - [OpenCL for GPU Programming](https://compilersutra.com/docs/gpu/opencl)
        - [LLVM Introduction](https://compilersutra.com/docs/llvm/intro-to-llvm)
        - [Introduction to Linux](https://compilersutra.com/docs/linux/intro_to_linux)

  </TabItem>

  <TabItem value="assessments" label="📝 Assessments">

        - [C++ MCQs](https://compilersutra.com/docs/mcq/cpp_mcqs)
        - [C++ Interview MCQs](https://compilersutra.com/docs/mcq/interview_question/cpp_interview_mcqs)

  </TabItem>

  <TabItem value="projects" label="🛠️ Projects">

            - [Project Documentation](https://compilersutra.com/docs/Project)
            - [Project Index](https://compilersutra.com/docs/project/)
            - [Graphics Pipeline Overview](https://compilersutra.com/docs/The_Graphic_Rendering_Pipeline)
            - [Graphic Rendering Pipeline (Alt)](https://compilersutra.com/docs/the_graphic_rendering_pipeline/)

  </TabItem>

  <TabItem value="resources" label="🌍 External Resources">

            - [LLVM Official Docs](https://llvm.org/docs/)
            - [Ask Any Question On Quora](https://compilersutra.quora.com)
            - [GitHub: FixIt Project](https://github.com/aabhinavg1/FixIt)
            - [GitHub Sponsors Page](https://github.com/sponsors/aabhinavg1)

  </TabItem>

  <TabItem value="social" label="📣 Social Media">

            - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
            - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
            - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
            - [💬 Join the CompilerSutra Discord for discussions](https://discord.gg/DXJFhvzz3K)

  </TabItem>
</Tabs>
