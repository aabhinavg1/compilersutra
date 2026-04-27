---
title: "What Problem ML Compilers Solve Beyond LLVM"
description: "A very beginner-friendly introduction to why ML compilers exist beyond LLVM. Learn the problem in simple language: tensors, shapes, fusion, layouts, kernels, and hardware-aware execution."
slug: /ml-compilers/what-problem-ml-compilers-solve-beyond-llvm/
displayed_sidebar: mlCompilersSidebar
sidebar_position: 2
keywords:
- what is ml compiler  
- ml compiler explained  
- machine learning compiler basics  
- ai compiler explained  
- ml compiler for beginners  
- tensor compiler basics  
- deep learning compiler explained  
- why ml compilers exist  
- why llvm is not enough for ml  
- ml compiler vs llvm  
- difference between llvm and ml compiler  
- limitations of llvm for machine learning  
- llvm vs ai compiler  
- what problem ml compilers solve  
- what do ml compilers do  
- ml compiler use cases  
- how ml models run on hardware  
- how pytorch model runs on gpu  
- how tensorflow model executes  
- model to hardware pipeline  
- model to kernel compilation  
- neural network to machine code  
- tensor graph to execution  
- ml model compilation steps  
- graph lowering in ml compilers  
- tensor lowering pipeline  
- execution plan in ml compilers  
- operator fusion ml compiler  
- tensor layout optimization  
- memory planning in ml compilers  
- kernel generation ml compiler  
- device partitioning ml models  
- cpu gpu npu execution ml  
- heterogeneous execution ml compiler  
- mlir explained simply  
- tvm compiler explained  
- xla compiler explained  
- tensorrt explained  
- mlir vs llvm  
- tvm vs xla vs mlir  
- ai compiler stack explained  
- ml compiler architecture  
- compiler for neural networks  
- deep learning model optimization compiler  
- how ai compilers work  
- ml compiler pipeline explained  
- beginner guide to ml compilers  
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# What Problem ML Compilers Solve Beyond LLVM

If LLVM already lowers programs to hardware, why did the ML world build another layer of compilers on top?

Because ML workloads usually do not arrive in the low-level shape that LLVM is best at handling.
They begin as tensor operations, graph structure, shape information, layout choices, and device-placement questions that are still unresolved.
Before you can generate efficient low-level code, you often have to decide what work should exist, how it should be grouped, and which hardware should run it.

That is the gap ML compilers fill.

No assumption here that you already know MLIR, TVM, XLA, or TorchInductor.
The goal is simpler: explain what problem appears before LLVM is the main tool.

:::tip Read This First If You Want The Bigger Track
- [ML Compilers Home](/docs/ml-compilers)
- [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
:::

:::important What You Should Leave With
- LLVM is very good at lowering normal programs toward machine code
- ML workloads bring extra problems earlier in the stack
- Those problems involve tensors, shapes, fusion, layouts, memory planning, and hardware-specific execution strategy
- ML compilers exist because a lot of the important optimization decisions happen before LLVM is the right tool
- **LLVM decides how to execute; ML compilers decide what to execute.**
:::

<div style={{textAlign: 'center', margin: '1.5rem 0'}}>
  <img
    src="/img/ml-compiler-comparison-v2.png"
    alt="Comparison of model execution without an ML compiler versus with an ML compiler"
    style={{
      width: '100%',
      maxWidth: '680px',
      borderRadius: '16px',
      border: '1px solid var(--ifm-color-emphasis-200)',
      background: '#fff',
    }}
  />
</div>

This diagram shows the core difference in one glance.
Without an ML compiler layer, the model is pushed toward backend lowering too early, so important choices about fusion, layout, and execution strategy stay weak or implicit.
With an ML compiler layer, the stack first plans the computation at the graph and tensor level, then lowers a better-shaped program to the backend.
The math is the same in both cases, but the execution plan is usually much better in the second path.

📩 Interested in deep dives like kernels, MLIR, TVM, and hardware-aware compilation?

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: '#fff',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>

<Tabs>
  <TabItem value="social" label="📣 Social Media" default>

  - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
  - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
  - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
  - [💬 Join the CompilerSutra Discord](https://discord.gg/d7jpHrhTap)

  </TabItem>
</Tabs>

<div>
  <AdBanner />
</div>

## Table of Contents

1. [Start From The Compiler Idea You Already Know](#start-from-the-compiler-idea-you-already-know)
2. [Tensors Are Shaped Numeric Data](#tensors-are-shaped-numeric-data)
3. [Compiler Input Comes From The Framework](#compiler-input-comes-from-the-framework)
4. [ML Workloads Start Higher Up](#ml-workloads-start-higher-up)
5. [Where LLVM Fits And Where It Does Not](#what-llvm-is-good-at)
6. [The Planning Gap ML Compilers Fill](#the-exact-gap-ai-compilers-fill)
7. [Keep The Boundary Clear](#keep-the-boundary-clear)
8. [Papers That Match This Article](#papers-that-match-this-article)
9. [What To Read Next](#what-to-read-next)

## Start From The Compiler Idea You Already Know

Let us begin with the simplest version of what a compiler does.

A compiler takes a program written in one language or representation, called the **source language**, and translates it into another language or representation, called the **target language**, while preserving the meaning of the program.

In simple words:

```text
source language -> compiler -> target language
```

The target language is usually closer to the machine that will finally run the program.

Examples:

- C/C++ → Assembly → Machine Code (binary)
- Rust → LLVM IR → Assembly → Machine Code
- Go → Assembly → Machine Code
- Swift → LLVM IR → Machine Code

That basic model is correct.

Now make one term precise: **target**.

Here, target means:

- the hardware that will run the program
- the instruction set or execution model that hardware understands
- sometimes the runtime environment around that hardware

In the usual compiler example, the target is simple and predictable:

- your program runs on one CPU
- that CPU has one main ISA
- the compiler mostly needs to emit machine code for that CPU

That is why the standard picture feels clean:

```text
source program -> compiler -> machine code for one CPU target
```

AI systems break that simplicity.

The same network may need to run on:

- a CPU for debugging or fallback execution
- a GPU for training
- an NPU or TPU for deployment
- a vendor accelerator with its own supported operator set
- a mixed system where some work runs on CPU and some on accelerator

So "target" no longer means only:

- generate instructions for one CPU backend

It may also mean:

- decide which device should run which part
- decide whether an operation is even supported on that device
- change the operation into another equivalent form if the target needs that
- choose a memory layout that suits that hardware
- decide whether the work should become one kernel or many kernels

So the compiler problem is no longer only:

> How do I translate this into lower-level code?

It is also:

> What is the right execution plan for this hardware target, and what form should the computation take before low-level code generation even begins?

That is the shift.

**The hard part is not only generating code. It is choosing the shape of the work before code generation starts.**

## Tensors Are Shaped Numeric Data

A tensor is numeric data arranged in a shape.
That is the shortest useful definition.

If an image is turned into pixel values, those values might be stored in a shape such as `1 x 224 x 224 x 3`.
If text is tokenized, the tokens become numeric IDs in another shape.
The compiler cares because shape is not just metadata: it affects kernels, memory planning, and which optimizations make sense.

## Compiler Input Comes From The Framework

Another beginner confusion is:

> do I personally write the input for the AI compiler?

Usually, not in the way you write C or C++ for a normal compiler.

Most of the time, you write or load a model in a framework such as PyTorch or TensorFlow.
Then one of these happens:

- the framework traces the model
- the framework exports the model
- the framework captures a graph of tensor operations
- the framework hands an intermediate representation to the compiler stack

So the compiler usually does **not** start from raw user input like:

```text
image of a cat
```

And it usually does **not** start from a fully low-level program either.

It more often starts from something like:

```text
input tensor -> conv -> relu -> matmul -> softmax
```

or:

```text
model graph + tensor shapes + data types + target choice
```

That is the important distinction:

- the **model input** is the real data at runtime, such as an image, prompt, or audio sample
- the **compiler input** is usually a graph, tensor program, or exported model representation

So there are really two different "inputs" in the full story:

1. **runtime input**
   The actual data the user wants the model to process.
2. **compiler input**
   The representation of the model computation that the compiler will analyze and lower.

You can keep the whole pipeline in your head like this:

```text
real-world data -> tensor -> model representation -> AI compiler -> executable form -> hardware runs it
```

This is why AI compilers feel different from normal language compilers.
The compiler is often not compiling your handwritten source code directly.
It is compiling a captured computation produced by an ML framework.

## ML Workloads Start Higher Up

The main difference is not just that ML uses more math.
It is that ML compilation starts from a representation with more unresolved structure than a normal backend usually sees.

Normal compiler thinking often begins with code that already looks like a program:

- control flow
- loops
- scalar values
- instructions that will later become lower-level instructions

ML workloads often begin in a different shape.

They often look like:

- tensor operations
- model graphs
- matrix multiply
- convolution
- reshape
- transpose
- activation functions

That means the compiler has to reason about:

- shapes
- tensor layouts
- intermediate buffers
- kernel boundaries
- hardware-specific execution style

This is exactly where beginners get stuck.

They think:

"I already have LLVM. Why not just send the tensor computation there?"

But the computation is still high-level in the wrong way.

LLVM becomes useful later.
The hard ML decisions start earlier.

## What LLVM Is Good At

LLVM is a general-purpose compiler infrastructure.

Very roughly, it is very good at tasks like:

- representing lower-level program structure
- running classic compiler optimizations
- lowering toward machine code
- supporting many target backends

If you already have a fairly normal low-level program shape, LLVM is a powerful place to optimize and lower it.

That is why LLVM matters so much in normal compiler stacks.

For example, if you already know:

- control flow
- scalar values
- loops
- instructions
- target machine details

then LLVM gives you a strong environment for later-stage compilation.

LLVM is very strong at the "closer to machine code" part of the story.

## What LLVM Does Not Solve Early Enough

LLVM is not the problem here.
The real issue is where LLVM enters the pipeline.

LLVM is most useful after the work has already been broken down into something much closer to machine-level steps.

In a traditional compiler, the input is usually a structured program.
That program may contain things like:

- `if` / `else`
- loops
- functions
- classes
- objects
- variables and expressions

So the compiler is starting from code that already looks like a normal program.

In AI compilation, the starting point is often very different.
Instead of beginning from a program shaped mainly around control flow and language constructs, the compiler may begin from:

- tensor operations
- graph structure
- matrix multiply
- convolution
- reshape
- transpose

So the question is no longer only:

> how do I lower this program?

It also becomes:

> what exact form should this tensor computation take before low-level code generation even starts?

At the beginning, the hard questions are often:

- should these operations stay separate?
- should some of them be fused together?
- what tensor layout fits this hardware best?
- which part should run on CPU, GPU, or accelerator?
- does this target support this operation directly, or does it need rewriting?

These are not small finishing touches.
They decide what work the backend will receive in the first place.

That is why LLVM alone is not the full story for ML systems.

The tabs below show the gap more concretely.

<Tabs>
  <TabItem value="fusion" label="1. Fusion" default>

  Suppose the computation is:

  ```text
  matmul -> add -> relu
  ```

  Here, we are trying to compute a common ML pattern:

  - first multiply the input by weights with `matmul`
  - then add a bias term with `add`
  - then apply a nonlinearity with `relu`

  In simple words, we want the correct final output, but we also want to produce it in a way that wastes as little memory movement and execution overhead as possible.

  This may look like one small line of math, but the machine does not automatically see it that way.
  The system still has to decide how this work should be broken up when it runs on real hardware.

  One possibility is to treat each step as a separate piece of work:

  - run `matmul`
  - write its result to memory
  - run `add`
  - write its result to memory
  - run `relu`
  - write its result to memory

  In that version, each operation finishes, stores an intermediate result, and then the next operation reads that result back again.

  So even though the math is simple, the execution may look wasteful:

  - `matmul` produces an output tensor
  - that tensor is written out to memory
  - `add` reads it back, does its work, and writes a new tensor
  - `relu` reads that new tensor back and writes yet another result

  Another possibility is to combine some of that work so fewer intermediate results go back to memory.
  For example, the stack may decide that once part of the `matmul` result is available, it can apply the `add` and `relu` logic without treating every step as a completely separate handoff through memory.

  ```text
  without fusion:
    t0 = matmul(x, w)
    t1 = add(t0, b)
    y  = relu(t1)

  with fusion:
    y = fused_matmul_add_relu(x, w, b)
  ```

  The exact implementation depends on the hardware and compiler stack, but the big idea is simple:

  - fewer writes to memory
  - fewer reads back from memory
  - fewer temporary results living as separate tensors
  - fewer kernel boundaries

  That decision matters because separate execution may create:

  - extra memory traffic
  - extra temporary buffers
  - extra kernel launches

  And those costs are often a large part of real ML performance.
  In a chain as small as `matmul -> add -> relu`, treating each step separately can easily create about `2x` to `3x` more intermediate memory traffic than a fused path, because full tensors get written out and read back instead of staying closer to registers or on-chip memory.

  In many workloads, arithmetic is not the only bottleneck.
  Moving data around is expensive too.

  So if the compiler can avoid repeatedly writing and rereading intermediate tensors, execution may become much faster even though the math itself has not changed at all.

  So the important question is not only:

  can LLVM generate code for these operations?
                                                                          
  It is:

  should these operations remain separate at all?

  That is an earlier planning question.

  LLVM becomes more useful after that choice has already been made.
  First the stack decides the shape of the work.
  Then lower-level compilation can optimize and lower that chosen form.

  </TabItem>
  <TabItem value="layout" label="2. Layout">

  A tensor is not just a bunch of values.
  Those values have to be stored in memory in some order.

  That storage pattern is called the layout.

  This matters because hardware does not only care about what numbers exist.
  It also cares about how easily those numbers can be read and processed.

  For example, imagine image data.
  You may have the same pixels, but you can store them in different ways.
  One layout may place color channels together.
  Another may place all values of one channel together.

  A very common example is:

  ```text
  NCHW = batch, channel, height, width
  NHWC = batch, height, width, channel
  ```

  Many GPU kernels and vendor libraries prefer one of these orders because it matches their memory-access patterns better.
  Some CPU and mobile paths prefer the other because it lines up better with vectorization or operator libraries.

  The math is still the same.
  But the way the hardware reads memory can become very different.

  The best layout may depend on:

  - CPU vectorization needs
  - GPU memory access patterns
  - accelerator operator requirements

  So the problem is not only:

  do I have the right numbers?

  It is also:

  are those numbers arranged in the way this target can use efficiently?

  If you choose a layout that does not fit the target well, the program may still be correct, but execution may be slower because the hardware keeps reading data in an awkward way.

  So the question becomes:

  what layout should this computation use before final code generation?

  That choice often has to happen early, because once later lowering begins, the compiler is already working with a more concrete version of the computation.

  So again, this is part of the AI-compiler job:
  decide the right shape of the work before LLVM is the main tool in the story.

  </TabItem>
  <TabItem value="rewrite" label="3. Rewriting Ops">

  Sometimes the target hardware does not support the computation exactly as it appears at the start.

  Then the stack may need to:

  - replace one operator with another equivalent form
  - break one operator into several simpler ones
  - quantize values
  - change the graph structure into something the target can actually run

  This is still compilation.
  But it is not the late-stage question of:

  how do I emit efficient machine code for an already-fixed program?

  It is the earlier question of:

  what supported form should this computation take on this target?

  </TabItem>
  <TabItem value="partition" label="4. Device Split">

  In many ML systems, one device does not run everything.

  A realistic execution may look like:

  - one part on CPU
  - one part on GPU
  - one part on an accelerator

  That means the compiler stack may need to decide:

  - what runs where
  - how data moves between devices
  - which pieces stay together
  - which pieces must fall back to CPU

  This usually happens for concrete reasons, not arbitrary ones.
  A GPU may be ideal for large dense operators such as `matmul`, while a CPU may handle control-heavy logic, unsupported operators, small fallback paths, or memory-sensitive glue code more easily.

  That is a full execution-planning problem.
  It is larger than the narrow backend job of lowering one already-chosen program to one already-chosen target.

  </TabItem>
  <TabItem value="shapes" label="5. Shapes">

  In ML workloads, shapes are not a side detail.

  Things like:

  - static shapes
  - dynamic shapes
  - partially known shapes

  can affect:

  - kernel structure
  - buffer planning
  - memory use
  - which optimization strategy even makes sense

  A simple example is batch size.
  If a model always runs with batch size `1`, the compiler may choose a small specialized kernel and tighter buffer plan.
  If batch size is dynamic and may change between `1`, `8`, and `32`, the compiler may need a more general kernel shape, different tiling choices, or extra guards and buffer sizing to stay correct across cases.

  So shape reasoning is not just extra metadata.
  It changes the execution plan itself.

  </TabItem>
</Tabs>

## The Exact Gap AI Compilers Fill

A very plain way to say it is this:

AI compilers sit in the gap between:

- **high-level computation**

and

- **hardware-ready execution**

That gap includes work such as:

- graph capture
- operator rewriting
- fusion
- layout selection
- buffer planning
- scheduling
- target-aware lowering
- device-specific kernel formation

Keep this pipeline in your head:

```text
tensor computation -> graph -> plan -> lowering -> LLVM -> hardware
```

That is the simplest useful pipeline to keep in your head.

The computation gives intent.
The graph exposes structure.
The plan decides execution strategy.
Lowering makes that plan concrete.
LLVM handles the later low-level part.
Hardware finally runs the result.

So if you ask:

what problem do AI compilers solve beyond LLVM?

the answer is:

they solve the higher-level execution-planning problem that must happen before ordinary low-level code generation is enough

## Why One Hardware Target Is Not Enough

A common beginner mistake is to imagine one final target and one final lowering path.

But real ML deployments may need:

- training on GPU
- inference on CPU
- edge deployment on NPU
- another deployment on a vendor accelerator

The same high-level model may therefore need:

- different operator lowering
- different layout decisions
- different scheduling choices
- different quantization choices
- different runtime packaging

That is why the compiler story becomes broader than:

```text
source language -> one target ISA
```

It becomes closer to:

```text
tensor computation -> graph/tensor program -> target-aware execution plan -> backend lowering -> hardware binary
```

<div>
  <AdBanner />
</div>

## AI Compilers Existed Before MLIR

This is worth stating clearly:

MLIR is important.
But AI compilers did **not** begin with MLIR.

Before MLIR became the common infrastructure conversation, people were already building AI / deep-learning compiler stacks and deployment compilers.

Examples include systems and directions such as:

- XLA
- TVM
- TensorRT
- Glow
- nGraph
- vendor deployment compilers
- framework-specific graph compilers

So the historical story is not:

```text
LLVM -> MLIR -> AI compilers
```

It is closer to:

```text
AI compilers already existed
MLIR later became a very useful infrastructure way to organize multi-level lowering
```

That distinction matters because beginners often think MLIR invented the whole field.
It did not.

MLIR helped provide a cleaner infrastructure story for some of these problems.
The actual need for AI compilers was already there.

## Where LLVM Still Fits

LLVM still matters a lot.

Once the computation has been lowered far enough, LLVM becomes extremely useful for:

- lower-level IR optimization
- target-specific lowering
- backend code generation
- machine-level optimization infrastructure

So the right beginner picture is not:

```text
AI compilers replace LLVM
```

It is:

```text
AI compilers solve earlier ML-specific planning problems
LLVM can still solve later lower-level backend problems
```

That is the cleanest way to think about it.

## Keep The Boundary Clear

This page is intentionally narrower than the full pipeline article.

Its job is to establish one boundary:

> LLVM is important, but many decisive ML compilation choices happen before the problem is reduced to LLVM's preferred level.

If you want the full staged walkthrough, read [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline).

If you want the taxonomy of MLIR, TVM, XLA, TorchInductor, and related systems, read [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap).

If you want live stage dumps and binaries, read [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/seeing-the-ml-compiler-stack-live-on-amd-gpu).

<div>
  <AdBanner />
</div>

## Papers That Match This Article

If you want papers behind the claims in this article, use this section as a map instead of a dump of links.

- for **why ML compilers exist beyond LLVM**, start with TVM, Glow, and nGraph
- for **how multi-level lowering is organized**, read MLIR and Glow
- for **graph rewriting and execution planning**, read TASO and the XLA material
- for **tensor-kernel generation and search-based optimization**, read Tensor Comprehensions and Ansor

<Tabs>
  <TabItem value="foundations" label="Foundational Systems" default>

  - [TVM: An Automated End-to-End Optimizing Compiler for Deep Learning](https://arxiv.org/pdf/1802.04799)
    A foundational paper on graph-level and operator-level optimization for diverse hardware targets.
  - [Glow: Graph Lowering Compiler Techniques for Neural Networks](https://arxiv.org/abs/1805.00907)
    Useful for understanding graph lowering, multi-stage IR design, and why lowering reduces backend complexity.
  - [Intel nGraph: An Intermediate Representation, Compiler, and Executor for Deep Learning](https://arxiv.org/abs/1801.08058)
    Good reference for the framework-plus-backend explosion problem and the role of an intermediate compiler layer.
  - [DLVM: A Modern Compiler Infrastructure for Deep Learning Systems](https://openreview.net/forum?id=ryG6xZ-RZ)
    A research-oriented compiler infrastructure view with linear algebra IR and compiler-based differentiation.
  - [Tensor Comprehensions: Framework-Agnostic High-Performance Machine Learning Abstractions](https://arxiv.org/abs/1802.04730)
    Helpful for understanding tensor-level abstractions, polyhedral compilation, specialization, and autotuning.

  </TabItem>
  <TabItem value="infrastructure" label="IR And Infrastructure">

  - [MLIR: A Compiler Infrastructure for the End of Moore's Law](https://arxiv.org/abs/2002.11054)
    The key MLIR paper for multi-level IR, extensible dialects, and staged lowering across abstraction levels.
  - [XLA: Optimizing Compiler for Machine Learning](https://openxla.org/xla/tf2xla)
    Official XLA documentation rather than a single canonical research paper; useful for understanding graph capture, fusion, HLO-level lowering, and generated LLVM IR in practice.

  </TabItem>
  <TabItem value="optimization" label="Graph And Tensor Optimization">

  - [TASO: Optimizing Deep Learning Computation with Automatic Generation of Graph Substitutions](https://theory.stanford.edu/~aiken/publications/papers/sosp19.pdf)
    Shows that graph rewrites and substitution search can be automated instead of hand-writing huge rule sets.
  - [Ansor: Generating High-Performance Tensor Programs for Deep Learning](https://www.amazon.science/publications/ansor-generating-high-performance-tensor-programs-for-deep-learning)
    A strong reference for auto-scheduling and search-based tensor-program generation across hardware targets.
  - [Optimal Kernel Orchestration for Tensor Programs](https://arxiv.org/pdf/2406.09465)
    A newer paper that directly connects to the article's discussion of fusion, kernel boundaries, and memory traffic.

  </TabItem>
</Tabs>

## What To Read Next

If this article made sense, continue in this order:

1. [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
2. [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/seeing-the-ml-compiler-stack-live-on-amd-gpu)
3. [MLIR Intro](/docs/MLIR/intro)
4. [TVM Intro](/docs/tvm/intro-to-tvm)




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
