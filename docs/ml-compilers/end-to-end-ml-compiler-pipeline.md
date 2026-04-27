---
title: "The End-to-End ML Compiler Pipeline"
description: "Follow the full ML compiler pipeline from model input to graph capture, optimization, lowering, kernel generation, runtime launch, and execution on hardware."
slug: /ml-compilers/end-to-end-pipeline/
displayed_sidebar: mlCompilersSidebar
sidebar_position: 3
keywords:
  - end to end ml compiler pipeline
  - model to hardware pipeline
  - ml model to gpu execution
  - how ml compilers work end to end
  - model graph lowering
  - kernel generation for ml
  - ml compiler execution flow
  - pytorch to hardware
  - onnx to runtime pipeline
  - mlir llvm gpu pipeline
---


import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# The End-to-End ML Compiler Pipeline

When people say "the model runs on the GPU," they usually skip the most important part.

The GPU does not execute the model file directly.
It executes kernels produced by a compiler stack.

So the real question is:

> how does a model become hardware work?

This article answers that exact path, starting from a model and ending at execution on CPU, GPU, or accelerator hardware.

This page is the conceptual walkthrough for the ML compiler section.
If you want study order, use [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap).
If you want a hardware-specific artifact dump, use [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack).

If you want the papers behind this article, use the internal library shelves: [Machine Learning Library](/library/topic?topic=machine-learning) and [MLIR Library](/library/topic?topic=mlir).

## Inspect And Run On This Machine

Before reading the compiler pipeline, verify what this machine actually exposes.

:::note
   This article is verified on the AMD machine. Installation details can be handled separately.
:::

## GPU Commands Worth Knowing

These are the most useful first commands for this article's workflow.

| Command | What It Tells You | Verified Here |
|---|---|---|
| `rocm-smi --showproductname --showdriverversion --showvbios --showid` | GPU model, driver version, VBIOS, and gfx target | Yes |
| `rocminfo` | HSA agents, wavefront size, workgroup limits, and target ISA names | Yes |
| `python -c "import torch; print(torch.cuda.is_available())"` | whether PyTorch can see the GPU runtime | Yes |
| `python -c "import torch; print(torch.cuda.get_device_name(0))"` | device name visible to PyTorch | Yes |
| `python -c "import torch; print(torch.cuda.get_device_properties(0).gcnArchName)"` | ROCm architecture name seen by PyTorch | Yes |
| `python -c "import torch; print(torch.cuda.device_count())"` | how many devices PyTorch sees | Yes |
| `python -c "..."` matmul run on `cuda:0` | whether real compute launches on the GPU | Yes |
| `python - <<'PY' ... torch.export ... PY` | graph capture / export in an inspectable form | Yes |
| `cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp && /home/aitr/riscv_implementation/llvm/llvm-project/build/bin/llvm-objdump -d stage5_hsaco.bin` | disassemble the final HSACO binary back to ISA | Yes |

All verified generated outputs for this article are stored under:

```text
/home/aitr/compilersutra/FixIt_Compilersutra/tmp
```

<Tabs>
<TabItem value="system" label="System GPU Checks" default>

Use these commands to inspect the AMD GPU stack directly from the system:

```bash
rocm-smi --showproductname --showdriverversion --showvbios --showid
rocminfo
```

<details>
<summary>Code explanation</summary>

- `rocm-smi` is the fastest high-level check. It tells you whether the driver stack can see the AMD GPUs at all, what product names they report, and what `gfx` target they expose.
- `rocminfo` is lower-level and more detailed. It shows the HSA agents, supported ISAs, wavefront size, workgroup limits, and memory capabilities.
- In this article, `rocm-smi` answers "what GPU is this machine using?" and `rocminfo` answers "what execution target and limits will the compiler/backend care about?"

</details>

Useful things confirmed on this machine:

```text
GPU[0]: AMD Radeon RX 9060 XT
GFX Version: gfx1200
Driver version: 6.17.0-22-generic
```

`rocminfo` also shows `gfx1200` as a real HSA GPU target, which matters because the backend eventually lowers kernels for that target.

</TabItem>
<TabItem value="pytorch" label="PyTorch GPU Checks">

For Python-side GPU checks, first enter the same environment used for the verified runs in this article:

```bash
akhi_env
```

Then move into the directory where the verified outputs for this article are stored:

```bash
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
```

Then ask PyTorch what it sees:

```bash
akhi_env
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
python -c "
import torch
print('torch', torch.__version__)
print('cuda_available', torch.cuda.is_available())
print('device_name', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'N/A')
print('arch', getattr(torch.cuda.get_device_properties(0), 'gcnArchName', 'N/A') if torch.cuda.is_available() else 'N/A')
print('vram_gb', round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1) if torch.cuda.is_available() else 'N/A')
"
```

<details>
<summary>Code explanation</summary>

- `torch.__version__` confirms which PyTorch build you are actually using.
- `torch.cuda.is_available()` answers the first practical question: can PyTorch talk to the ROCm GPU runtime at all?
- `torch.cuda.get_device_name(0)` tells you the visible device name from the framework side, not just from the driver side.
- `gcnArchName` gives the ROCm architecture name such as `gfx1200`, which matters because many backend decisions are target-specific.
- `total_memory` is a quick sanity check that PyTorch is seeing the expected device properties.

This command is useful because it bridges the gap between "the system has a GPU" and "the framework I care about can actually use it."

</details>

Observed here:

```text
torch 2.11.0.dev20260206+rocm7.0
cuda_available True
device_name AMD Radeon RX 9060 XT
arch gfx1200
vram_gb 17.1
```

To list every device visible inside this environment:

```bash
akhi_env
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
python -c "
import torch
for i in range(torch.cuda.device_count()):
    props = torch.cuda.get_device_properties(i)
    print(i, torch.cuda.get_device_name(i), getattr(props, 'gcnArchName', 'N/A'))
"
```

<details>
<summary>Code explanation</summary>

- `torch.cuda.device_count()` tells you how many devices the current runtime exposes to PyTorch.
- `get_device_properties(i)` lets you inspect each visible device one by one.
- Printing `device_name` and `gcnArchName` together is useful because it shows both the marketing name and the backend-facing target name.

This matters in multi-device systems because one visible device may be the discrete GPU you want, while another may be an integrated GPU or a different compute target.

</details>

Observed here:

```text
0 AMD Radeon RX 9060 XT gfx1200
1 AMD Ryzen 7 9700X 8-Core Processor gfx1036
```

You can also verify graph capture directly:

```bash
akhi_env
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
python - <<'PY'
import torch

class Tiny(torch.nn.Module):
    def forward(self, x, w, b):
        return torch.relu(x @ w + b)

m = Tiny().eval()
x = torch.randn(4, 4)
w = torch.randn(4, 4)
b = torch.randn(4)

ep = torch.export.export(m, (x, w, b))
print(ep.graph_module.code)
PY
```

<details>
<summary>Code explanation</summary>

- `Tiny` is a deliberately small model so that the captured graph stays readable.
- `forward(self, x, w, b)` computes `relu(x @ w + b)`, which is just enough structure to show capture, operator boundaries, and tensor flow.
- `m = Tiny().eval()` creates a stable inference-style module.
- `x`, `w`, and `b` are example tensors used only to drive export.
- `torch.export.export(...)` asks PyTorch to turn the model execution into an explicit graph representation.
- `ep.graph_module.code` prints the captured graph in a form you can actually inspect.

What you should notice in the output is that Python-level model code has become explicit operator calls such as `aten.matmul`, `aten.add`, and `aten.relu`. That is exactly the transition Stage 1 is trying to explain.

</details>

Observed here:

```python
def forward(self, x, w, b):
    matmul = torch.ops.aten.matmul.default(x, w);  x = w = None
    add = torch.ops.aten.add.Tensor(matmul, b);  matmul = b = None
    relu = torch.ops.aten.relu.default(add);  add = None
    return (relu,)
```

</TabItem>
<TabItem value="run" label="Run Work On GPU">

For this Python-side run, use the same environment first:

```bash
akhi_env
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
```

Now run a small compute workload on the GPU itself:

```bash
akhi_env
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
python -c "
import torch
device = 'cuda:0'
x = torch.randn(4096, 4096, device=device)
y = torch.randn(4096, 4096, device=device)
z = x @ y
torch.cuda.synchronize()
print(z.shape, z.device)
"
```

<details>
<summary>Code explanation</summary>

- `device = 'cuda:0'` selects the first ROCm-visible GPU from the PyTorch side.
- `torch.randn(..., device=device)` allocates the tensors directly on the GPU.
- `z = x @ y` launches a real matrix multiply, not just a metadata query.
- `torch.cuda.synchronize()` forces the host to wait until the GPU work is complete, which makes this a real execution check rather than a lazy enqueue.
- `print(z.shape, z.device)` confirms that the output tensor exists on the GPU and has the expected shape.

This command matters because it proves actual compute dispatch. It is stronger evidence than only checking `torch.cuda.is_available()`.

</details>

This verifies:

- tensors are allocated on the GPU
- work is dispatched to `cuda:0`
- the runtime can synchronize after GPU execution

That is the practical checkpoint before you start inspecting compiler IR, generated kernels, or backend codegen.

</TabItem>
</Tabs>

## Table of Contents

1. [Inspect And Run On This Machine](#inspect-and-run-on-this-machine)
2. [Traditional Compiler Analogy First](#traditional-compiler-analogy-first)
3. [One-Line Mental Model](#one-line-mental-model)
4. [ML Compiler Stages With Input And Output](#ml-compiler-stages-with-input-and-output)
5. [If You Want A `.i`-Style Question For ML](#if-you-want-a-i-style-question-for-ml)
6. [Start Point: The Model](#start-point-the-model)
7. [Stage 1: Graph Capture Or Export](#stage-1-graph-capture-or-export)
8. [Stage 2: Graph-Level Optimization](#stage-2-graph-level-optimization)
9. [Stage 3: Operator Lowering](#stage-3-operator-lowering)
10. [Stage 4: Intermediate Representations](#stage-4-intermediate-representations)
11. [Stage 5: Scheduling And Memory Planning](#stage-5-scheduling-and-memory-planning)
12. [Stage 6: Kernel Generation](#stage-6-kernel-generation)
13. [Stage 7: Backend Code Generation](#stage-7-backend-code-generation)
14. [Stage 8: Runtime Launch](#stage-8-runtime-launch)
15. [Worked Artifact Inspection](#worked-artifact-inspection)
16. [Failure Modes By Stage](#failure-modes-by-stage)
17. [Stage 9: Hardware Execution](#stage-9-hardware-execution)
18. [Why This Matters In Numbers](#why-this-matters-in-numbers)
19. [One Concrete End-To-End Example](#one-concrete-end-to-end-example)
20. [One Real Stack Path](#one-real-stack-path)
21. [Compiler Versus Runtime Boundary](#compiler-versus-runtime-boundary)
22. [Generated Kernel Versus Library Dispatch](#generated-kernel-versus-library-dispatch)
23. [Fallbacks And Recompilation Paths](#fallbacks-and-recompilation-paths)
24. [What To Inspect At Each Stage](#what-to-inspect-at-each-stage)
25. [Papers And References](#papers-and-references)
26. [How Real Systems Differ](#how-real-systems-differ)
27. [Dynamic Shapes And Library Dispatch](#dynamic-shapes-and-library-dispatch)
28. [Autotuning And Search](#autotuning-and-search)
29. [What You Should Now Be Able To Do](#what-you-should-now-be-able-to-do)
31. [FAQ](#faq)
30. [What To Read Next](#what-to-read-next)

## How To Use This Article

If you are reading end to end, start with the mental model and stage table.
If you are here to find one specific thing quickly, use this map first:

| If you want... | Jump to... |
|---|---|
| the shortest pipeline summary | [One-Line Mental Model](#one-line-mental-model) |
| the whole stage map on one screen | [ML Compiler Stages With Input And Output](#ml-compiler-stages-with-input-and-output) |
| what graph capture does | [Stage 1: Graph Capture Or Export](#stage-1-graph-capture-or-export) |
| what lowering means | [Stage 3: Operator Lowering](#stage-3-operator-lowering) |
| what multi-level IRs are for | [Stage 4: Intermediate Representations](#stage-4-intermediate-representations) |
| where scheduling decisions happen | [Stage 5: Scheduling And Memory Planning](#stage-5-scheduling-and-memory-planning) |
| how runtime differs from compilation | [Compiler Versus Runtime Boundary](#compiler-versus-runtime-boundary) |
| when the system emits kernels vs calls libraries | [Generated Kernel Versus Library Dispatch](#generated-kernel-versus-library-dispatch) |
| what to inspect while debugging | [What To Inspect At Each Stage](#what-to-inspect-at-each-stage) |
| how real artifact dumps look | [Worked Artifact Inspection](#worked-artifact-inspection) |

## Foundations

## Traditional Compiler Analogy First

If you already understand a CPU compiler, the easiest way to understand  it:

```text
C/C++ source
  ->
preprocessor
  -> .i
compiler frontend + middle-end
  -> IR / optimized IR
backend
  -> assembly
assembler + linker
  -> executable
CPU runs it
```

In that world, it feels natural to ask:

- what is the input to this stage?
- what transformation happens here?
- what is the output?

Use the same method for ML compilers.

The only difference is that the input is not usually a `.c` file.
It is a model, graph, tensor program, or exported representation.

## One-Line Mental Model

```text
Model -> graph capture/export -> compiler IR -> graph optimization -> operator lowering -> kernel generation -> runtime launch -> hardware execution
```

That is the end-to-end pipeline.

Different systems use different names, but the job stays similar.
If you want the beginner motivation for why this extra pipeline exists at all, read [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm.md) alongside this article.

## ML Compiler Stages With Input And Output

| Stage | Input | What Happens | Output |
|---|---|---|---|
| 1. Model / Program Input | PyTorch model, TensorFlow graph, ONNX file, Triton kernel | The system takes model-level computation as the starting point | framework program or exported model |
| 2. Capture / Export | model code or exported model | Trace, export, or capture explicit operators, shapes, and edges | graph IR |
| 3. Graph Optimization | graph IR | fusion, constant folding, simplification, partitioning | optimized graph IR |
| 4. Lowering | optimized graph IR | high-level operators become tensor, loop, or schedule-oriented forms | lowered IR |
| 5. Scheduling / Memory Planning | lowered IR | choose tiling, layout, buffers, thread shape, memory movement | scheduled IR |
| 6. Backend Lowering | scheduled IR | convert to LLVM IR, Triton GPU IR, or target-facing backend form | backend IR |
| 7. Code Generation | backend IR | emit ISA, device binary, or CPU machine code | executable kernels or machine code |
| 8. Runtime Launch | compiled kernels plus input buffers | allocate memory, set arguments, dispatch work | running kernels |
| 9. Hardware Execution | dispatched work on CPU/GPU/NPU | hardware executes the final lowered work | output tensors |

## If You Want A `.i`-Style Question For ML

In a traditional compiler, you may ask:

> after preprocessing, what file do I get?

For ML compilers, ask the same kind of question at every boundary:

> after graph capture, what representation do I get?

Usually the answer is:

- a graph of operators
- tensor shapes and dtypes
- explicit dataflow edges
- enough structure for fusion and lowering passes

Then ask:

> after lowering, what do I get?

Usually:

- loop-like structure
- tensor-level operations
- schedule-friendly representation
- target-aware IR closer to code generation

Then ask:

> after backend codegen, what do I get?

Usually:

- LLVM IR
- target assembly
- HSACO or other device binary
- CPU machine code

That is the clearest way to make the idea concrete.

## Core Pipeline

## Start Point: The Model

The input to the ML compiler pipeline is usually one of these:

- a framework model in PyTorch or TensorFlow
- an exported model such as ONNX
- a traced or captured computation graph
- a tensor program written in a compiler-facing system such as Triton or TVM

At this stage, the computation is still expressed in model terms:

- `matmul`
- `conv2d`
- `layernorm`
- `relu`
- `softmax`

This is still too high-level for direct hardware execution.

The model says **what** to compute.
The compiler pipeline decides **how** to run it.

This is not just a teaching simplification. In the literature, the gap between model semantics and executable work is exactly why ML systems introduce additional compiler layers. The [TVM paper](https://www.usenix.org/system/files/osdi18-chen.pdf) and the [MLIR paper](https://arxiv.org/pdf/2002.11054) both frame this as a representation and lowering problem before it becomes a backend code-generation problem.

## Stage 1: Graph Capture Or Export

> Quick scan: input is framework model code, the main job is to make computation explicit, and the output is graph IR.

The first step is to convert framework-level model code into a representation the compiler can actually analyze.

:::caution Why is this needed?
An ML model is not just one operator.

It is usually a chain of many tensor operations such as `matmul`, `conv2d`, `add`, `relu`, `layernorm`, `softmax`, reshape, transpose, slice, and reduction operations.

When you write the model in a framework, those operations are often buried inside Python code, module definitions, framework runtime behavior, and sometimes dynamic control flow.

That form is convenient for the model author.
It is not convenient for the compiler.
:::

:::tip What problem does graph capture or export solve?
A compiler developer cannot optimize efficiently if the real computation is still hidden inside framework execution and Python-level structure.

The compiler needs the model to become explicit:

- which operators exist
- in what order they run
- which tensors flow between them
- what the tensor shapes and data types are
- where dependencies exist

That is why graph capture or export exists.
It is the step that turns model-writing form into compiler-analysis form.
:::

Examples:

- PyTorch graph capture
- TensorFlow graph extraction
- ONNX export
- TorchInductor / XLA style graph formation

Why this matters:

- Python control flow is not what the GPU runs
- the compiler needs explicit operations and tensor edges
- shapes, dtypes, and dependencies must become visible

After this step, the system has something closer to a computation graph than a user program.

This is also the role of representations such as [ONNX](https://onnx.ai/onnx/intro/concepts.html), which make operators, tensors, and dataflow edges explicit enough for compiler analysis.

This need is visible in research systems too. The [Relay paper](https://arxiv.org/pdf/1810.00952) is a good reference because it shows why ML compilation needs an explicit high-level representation for tensor operators, dataflow, and type or shape reasoning before later lowering stages can do useful work.

### Stage 1 Output

Think of this as the first major visible output of the ML compiler pipeline:

```text
input:  model code
output: graph IR
```

This is not yet machine code.
It is closer to the compiler finally seeing the real computation clearly.

## Stage 2: Graph-Level Optimization

> Quick scan: input is graph IR, the main job is to rewrite computation before low-level lowering, and the output is optimized graph IR.

Now the compiler starts improving the computation before low-level code generation.

Typical decisions here:

- fuse compatible operators
- remove redundant operations
- fold constants
- simplify subgraphs
- choose better dataflow boundaries
- partition work across devices if needed

Example:

```text
matmul -> add -> relu
```

may stay as three separate operations logically, but the compiler may decide to implement them as one fused kernel.

This stage matters because performance is often lost here, long before LLVM or machine code enters the picture.

That point is central in the [TVM paper](https://www.usenix.org/system/files/osdi18-chen.pdf), where graph-level optimization and operator-level optimization are treated as first-class performance decisions.

### Stage 2 Output

```text
input:  graph IR
output: optimized graph IR
```

This is similar to asking whether the compiler cleaned up or reorganized the program before backend lowering.

## Stage 3: Operator Lowering

> Quick scan: input is optimized graph IR, the main job is to decompose high-level operators into more schedulable forms, and the output is lowered tensor or loop-oriented IR.

High-level ML operators are still too abstract.

The compiler lowers them into forms that are easier to schedule and map to hardware.

Examples:

- `conv2d` may become tiled loop structure plus memory movement
- `layernorm` may become reduction + normalization + elementwise steps
- `attention` may be decomposed into multiple tensor-level operations

This is where many ML compilers differ from traditional compilers.
They must reason about tensors, layouts, shapes, reductions, and hardware-friendly decomposition before final codegen.

The [Relay paper](https://arxiv.org/pdf/1810.00952) and [TensorIR paper](https://arxiv.org/pdf/2207.04296) are especially useful if you want to study why these intermediate forms need to stay richer than one late backend IR.

### Stage 3 Output

```text
input:  optimized graph IR
output: lowered tensor / loop / schedule-oriented IR
```

## Stage 4: Intermediate Representations

> Quick scan: input is lowered IR, the main job is to preserve the right information at the right abstraction level, and the output is a stack of progressively more concrete IRs.

Most real ML compiler stacks use multiple IR levels.

A common shape looks like this:

```text
Model Graph
   ->
Tensor / Graph IR
   ->
Schedule / Lowered IR
   ->
LLVM IR or backend IR
   ->
Machine code or device binary
```

Examples of systems that appear in this zone:

- ONNX IR
- Relay
- MLIR dialects
- Triton IR
- LLVM IR

This stage matters because one representation is rarely enough.

If you keep the whole stack too high-level, backend code generation does not know enough about layout, tiling, or memory behavior.
If you lower too early, you lose the model structure that makes fusion, shape reasoning, and graph simplification possible.

That is why ML compilers keep multiple IR levels alive for different jobs:

- early IRs keep model semantics, tensor shapes, and operator boundaries visible
- middle IRs expose decomposition choices such as loop structure, tensor indexing, and memory movement
- late IRs commit to target details such as address spaces, vectors, instructions, and binary formats

So Stage 4 is not just "the compiler has many IRs."
It is the mechanism that lets the stack delay the irreversible decisions until the right information is available.

That multi-level idea is exactly the argument of [MLIR](https://arxiv.org/pdf/2002.11054): one compiler stack often needs several abstraction levels rather than a single universal IR.

### Stage 4 Output

```text
input:  lowered IR
output: a stack of progressively more concrete IRs
```

## Stage 5: Scheduling And Memory Planning

> Quick scan: input is lowered IR, the main job is to choose execution shape and data movement strategy, and the output is scheduled IR.

Now the compiler has to decide how work is actually organized.

Typical questions:

- how should tensors be tiled?
- what data should stay in registers, shared memory, or cache?
- what memory layout is best for this target?
- how many threads, warps, waves, or blocks should be used?
- where should temporary buffers be allocated?

This stage is critical because the same math can run very differently depending on schedule and memory behavior.

Two kernels can compute the same answer while having completely different runtime.

This is one of the biggest differences from a classical CPU compiler mental model.
In a normal compiler course, you often think of optimization as instruction selection, register allocation, loop optimization, and code generation.
In ML compilers, the schedule can decide whether the workload is even shaped in a hardware-friendly way before those later backend steps matter.

For example, scheduling decisions can determine:

- whether data is reused from shared memory or reloaded from global memory
- whether a reduction is split across threads or done serially
- whether a convolution is tiled for cache locality or left bandwidth-heavy
- whether multiple operators can share intermediate values without storing them back to memory

Memory planning matters for the same reason.
Large models do not just need fast arithmetic. They need the compiler to manage buffer lifetime, reuse temporary storage, and avoid unnecessary reads and writes.

This is why Stage 5 is not a side detail.
For many ML workloads, this stage is where the difference between "correct" and "fast" starts becoming dramatic.

This is why systems such as [Apache TVM](https://tvm.apache.org/docs/) and [OpenXLA](https://openxla.org/) spend so much effort on scheduling and backend-aware lowering instead of treating code generation as the only serious step.

### Stage 5 Output

```text
input:  lowered IR
output: scheduled IR with concrete layout and execution choices
```

## Stage 6: Kernel Generation

> Quick scan: input is scheduled IR, the main job is to turn an execution plan into concrete work units, and the output is one or more kernels.

Once the execution plan is concrete enough, the compiler generates kernels.

On GPUs, that often means:

- one or more device kernels
- launch configuration
- buffer access logic
- masked loads/stores
- target-specific instructions after backend lowering

On CPUs, it may mean:

- vectorized loops
- threaded loops
- cache-aware blocking
- calls into optimized libraries when appropriate

This is the point where "model execution" becomes real executable work units.

If you want to inspect this kernel-centric view more directly, [Triton](https://triton-lang.org/main/index.html) is one of the clearest practical systems to study.

### Stage 6 Output

```text
input:  scheduled IR
output: one or more kernels
```

## Stage 7: Backend Code Generation

> Quick scan: input is backend-facing kernel IR, the main job is target-specific code emission, and the output is machine code, ISA, or device binary.

The lowered representation now goes through a backend.

Common backend outcomes:

- LLVM IR -> CPU machine code
- LLVM IR -> GPU target ISA
- vendor backend -> accelerator binary
- runtime library calls into cuDNN, rocBLAS, oneDNN, or similar stacks

This is where target-specific code finally appears.

The backend now cares about:

- instructions
- registers
- vector width
- address spaces
- calling conventions
- device binary format

### Stage 7 Output

```text
input:  kernels in backend IR
output: machine code, target ISA, or device binary
```

## Stage 8: Runtime Launch

> Quick scan: input is compiled kernels plus buffers and arguments, the main job is dispatch, and the output is running work on the target.

Compiled code still does not execute by itself.
The runtime must prepare and launch it.

Runtime responsibilities usually include:

- allocate buffers
- move data if needed
- set kernel arguments
- choose launch dimensions
- coordinate CPU and accelerator execution
- synchronize results

So the full system is not just "compiler" in the narrow sense.
It is compiler plus runtime.

For backend-oriented readers, [LLVM](https://llvm.org/docs/) still matters here, but by this point many important ML-specific decisions have already been made earlier in the pipeline.

## Inspection And Debugging

## Worked Artifact Inspection

This is the single highest-value habit to build: do not stop at the stage names. Look at the artifacts.

<Tabs>
<TabItem value="graph" label="Graph / Export" default>

Start by forcing the model into something explicit enough to inspect.

```bash
akhi_env
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
python - <<'PY'
import torch

class Tiny(torch.nn.Module):
    def forward(self, x, w, b):
        return torch.relu(x @ w + b)

m = Tiny().eval()
x = torch.randn(4, 4)
w = torch.randn(4, 4)
b = torch.randn(4)

ep = torch.export.export(m, (x, w, b))
print(ep.graph_module.code)
PY
```

<details>
<summary>Code explanation</summary>

- This is the same graph-capture workflow as above, but here the purpose is different: not just environment validation, but stage inspection.
- The output is the first concrete compiler-facing artifact in the end-to-end pipeline.
- If you compare the printed graph with the original model code, you can see the semantic structure preserved while the framework-level surface syntax disappears.

This is the point where the pipeline stops being "a model written in Python" and starts becoming "a graph that a compiler can reason about."

</details>

What you are looking for is not pretty formatting. You are looking for the computation becoming explicit:

```python
def forward(self, x, w, b):
    matmul = torch.ops.aten.matmul.default(x, w)
    add = torch.ops.aten.add.Tensor(matmul, b)
    relu = torch.ops.aten.relu.default(add)
    return (relu,)
```

If you export through ONNX, the same lesson applies. The important shift is that the model stops being "Python behavior" and becomes a graph of named operators and tensor edges.

</TabItem>
<TabItem value="ir" label="IR / GPU Stages">

For a full machine-visible stage dump on this AMD GPU, the verified run for this article was executed in:

```text
/home/aitr/compilersutra/FixIt_Compilersutra/tmp
```

using:

```bash
akhi_env
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
python vector_add.py
```

That path writes:

```text
/home/aitr/compilersutra/FixIt_Compilersutra/tmp/stage1_ttir.txt
/home/aitr/compilersutra/FixIt_Compilersutra/tmp/stage2_ttgir.txt
/home/aitr/compilersutra/FixIt_Compilersutra/tmp/stage3_llir.txt
/home/aitr/compilersutra/FixIt_Compilersutra/tmp/stage4_amdgcn.txt
/home/aitr/compilersutra/FixIt_Compilersutra/tmp/stage5_hsaco.bin
```

Representative snippets from those stages:

`TTIR`:

```rust
tt.func public @vector_add_kernel(...)
  %mask_3 = arith.cmpi slt, %offsets_2, %mask : tensor<1024xi32>
  %a_5 = tt.load %a_4, %mask_3 : tensor<1024x!tt.ptr<f32>>
  %2   = arith.addf %a_5, %b_7 : tensor<1024xf32>
  tt.store %1, %2, %mask_3 : tensor<1024x!tt.ptr<f32>>
```

<details>
<summary>Code explanation</summary>

- `tt.func` is the Triton IR function that represents the kernel in compiler form.
- `arith.cmpi slt` is the mask comparison that protects the tail of the vector when the total element count is not a perfect multiple of the block size.
- `tt.load` and `tt.store` are still abstract memory operations. They are lower than Python code, but not yet final hardware instructions.
- `arith.addf` is the floating-point add at the tensor IR level.

This snippet is valuable because it shows that the computation is already explicit, typed, and SSA-based, but not yet committed to a final GPU execution strategy.

</details>

`TTGIR`:

```rust
#blocked = #ttg.blocked<{sizePerThread = [4], threadsPerWarp = [32], warpsPerCTA = [4], order = [0]}>
module attributes {
  "ttg.num-warps" = 4 : i32,
  ttg.target = "hip:gfx1200",
  "ttg.threads-per-warp" = 32 : i32
}
```

<details>
<summary>Code explanation</summary>

- `sizePerThread = [4]` means each thread handles 4 elements of the logical tile.
- `threadsPerWarp = [32]` tells you this lowering is targeting wave32 execution on this machine.
- `warpsPerCTA = [4]` tells you how much thread-level parallel structure is bundled into one block/workgroup.
- `ttg.target = "hip:gfx1200"` shows that this is no longer target-agnostic. The compiler is now lowering with AMD GPU specifics in mind.

This is the stage where "what the kernel computes" turns into "how the machine will divide the work."

</details>

`LLVM IR`:

```rust
target triple = "amdgcn-amd-amdhsa"
%7  = tail call i32 @llvm.amdgcn.workgroup.id.x()
%19 = tail call <4 x float> @llvm.amdgcn.raw.ptr.buffer.load.v4f32(...)
```

<details>
<summary>Code explanation</summary>

- `target triple = "amdgcn-amd-amdhsa"` tells you the backend is fully inside the AMDGPU/ROCm world now.
- `workgroup.id.x` is the low-level notion of which workgroup is running.
- `buffer.load.v4f32` shows that the compiler has chosen a vector memory operation that loads 4 floats at once.

This snippet is useful because the tensor abstraction is fading here. The IR is now talking in terms of backend intrinsics, workgroup identity, and vector memory transactions.

</details>

These are not toy abstractions. They are the actual intermediate artifacts that show what the compiler still knows and what it has already committed to.

</TabItem>
<TabItem value="binary" label="Assembly / Binary">

Once the backend has emitted target code, inspect the last two steps:

```bash
cd /home/aitr/compilersutra/FixIt_Compilersutra/tmp
sed -n '1,80p' stage4_amdgcn.txt
/home/aitr/riscv_implementation/llvm/llvm-project/build/bin/llvm-objdump -d stage5_hsaco.bin | sed -n '1,80p'
```

<details>
<summary>Code explanation</summary>

- `stage4_amdgcn.txt` is the readable text form of the generated AMD assembly.
- `stage5_hsaco.bin` is the packaged binary object that the runtime can actually load.
- `llvm-objdump -d` disassembles the HSACO back into readable ISA so you can compare it with the stage-4 dump.

The purpose of these commands is not to admire assembly for its own sake. It is to verify that the final binary still contains the kernel body you think the compiler produced.

</details>

The useful question here is not "can I read every instruction?"

It is:

- do I see the same kernel body survive packaging?
- do the vector loads and stores I expected actually appear?
- did the final binary keep the execution shape implied by the earlier IR?

Representative instructions from the existing AMD GPU run:

```text
s_load_b96
s_load_b128
v_cmp_gt_i32_e32
buffer_load_b128
v_dual_add_f32
buffer_store_b128
```

That is the point where the abstract pipeline stops being an idea and becomes an inspectable machine artifact chain.

</TabItem>
</Tabs>

## Failure Modes By Stage

This is where real debugging time goes.

| Stage | Typical Failure | What You Notice |
|---|---|---|
| Capture / Export | dynamic Python control flow does not capture cleanly | export fails, graph breaks, fallback to eager execution |
| Graph Optimization | invalid fusion or unsupported rewrite | wrong results, compilation crash, or optimization silently skipped |
| Lowering | shapes, layouts, or decomposition assumptions break | shape mismatch, unsupported op form, odd fallback behavior |
| Scheduling | correct program but bad execution strategy | kernel is correct but slow, poor occupancy, heavy memory traffic |
| Backend Lowering | target-specific issue | LLVM/backend error, illegal target combination, missing intrinsic lowering |
| Runtime Launch | buffer/dispatch mismatch | launch failure, wrong arguments, synchronization bugs |
| Hardware Execution | numerical, race, or mask issue | wrong output, intermittent failure, device-specific divergence |

One practical point: a "correct but slow" kernel is not a minor problem in ML systems. It is often the dominant problem.

## Stage 9: Hardware Execution

> Quick scan: input is dispatched work, the main job is physical execution on the target device, and the output is final tensors.

Only now does the hardware actually run the work.

Depending on the target, that may mean:

- CPU cores executing vectorized loops
- GPU compute units executing kernels
- an NPU running supported operator blocks
- heterogeneous execution across multiple devices

At this stage, performance depends on whether the earlier compiler decisions were good:

- fusion quality
- memory traffic
- layout choices
- kernel boundaries
- launch overhead
- target suitability

### Stage 8 And Stage 9 Output

```text
input:  compiled kernels + runtime arguments
output: executed work + final output tensors
```

## Why This Matters In Numbers

The easiest place to see the cost is extra memory traffic.

Take a simple post-matmul pattern:

```text
y = relu(x @ w + b)
```

Suppose the activation tensor is `4096 x 4096` in `float32`.

- element count: `16,777,216`
- bytes per tensor: about `64 MiB`

If `add` and `relu` run as separate kernels, you usually pay for:

| Case | Extra temporary write | Extra temporary read | Kernel launches |
|---|---|---|---|
| unfused `add` then `relu` | ~64 MiB | ~64 MiB | 2 |
| fused `add + relu` | 0 extra temp write | 0 extra temp read | 1 |

That is around `128 MiB` of avoidable traffic for just that intermediate activation.

This is why the pipeline matters.
Fusion, scheduling, and memory planning are not academic polish. They directly change how much data moves and how many kernels run.

## One Concrete End-To-End Example

Take this model expression:

```text
y = relu(matmul(x, w) + b)
```

Now track it like a normal compiler pipeline:

```text
Stage 1 input:
  model code

Stage 1 output:
  graph IR
  matmul -> add -> relu

Stage 2 output:
  optimized graph IR
  maybe fuse add + relu

Stage 3 output:
  lowered tensor / loop form
  tiles, reductions, loads, stores become explicit

Stage 4/5 output:
  schedule-friendly backend IR
  thread/block/workgroup structure becomes clearer

Stage 6/7 output:
  GPU kernels + target binary

Stage 8 output:
  runtime launches those kernels

Stage 9 output:
  final tensor y on the target device
```

That is the ML compiler version of asking:

- what is my `.i`?
- what is my IR?
- what is my assembly?
- what is my final executable?

## Real-World Behavior

## One Real Stack Path

The generic stage names get easier to trust once you map them onto one real stack.

One practical path looks like this:

```text
PyTorch module
  ->
torch.export / FX-style captured graph
  ->
graph rewrites and partitioning
  ->
TorchInductor lowering
  ->
Triton kernel generation or library dispatch
  ->
backend codegen / packaged binary
  ->
runtime launch on GPU
```

For a small expression such as:

```python
y = torch.relu(x @ w + b)
```

one plausible outcome is:

| Stack Layer | What It May Do |
|---|---|
| PyTorch frontend | define the model and run/export it |
| capture/export layer | make `matmul`, `add`, and `relu` explicit |
| graph optimizer | decide whether some boundaries should be fused or rewritten |
| TorchInductor | lower the graph into backend-oriented work units |
| Triton or library path | emit a custom pointwise kernel, a reduction kernel, or call into a tuned library |
| backend/runtime | compile, load, and dispatch the final work |

This is not the only valid path.
It is one concrete way to connect the abstract pipeline to a modern production-facing stack.

The main lesson is not the brand names.
It is that a real system still passes through the same core questions:

- what is the explicit computation?
- what should be fused or rewritten?
- what kernels or library calls should exist?
- what binary or launchable work reaches the device?

## Compiler Versus Runtime Boundary

One persistent source of confusion is treating the compiler and runtime as the same thing.

They cooperate, but they do different jobs.

| Layer | Typical Responsibility |
|---|---|
| compiler | capture, rewrite, lower, schedule, choose kernel form, emit code or library calls |
| runtime | allocate buffers, bind arguments, launch kernels, synchronize, move data when required |
| driver / loader | load device binaries, interface with the target execution environment |
| hardware | execute the final dispatched work |

Another way to say it:

- the compiler decides what executable work should exist
- the runtime decides when and with which buffers that work should run
- the driver and hardware handle the final target-specific execution path

If a kernel is slow, the cause may be a bad compiler decision.
If a launch fails, the cause may be a runtime or driver issue.
If the model recompiles too often, the boundary problem is often between capture assumptions and runtime reality.

## Generated Kernel Versus Library Dispatch

Not every important operation ends as a freshly generated custom kernel.

Many systems choose between two paths:

- generate custom kernels
- dispatch into tuned operator libraries

That choice is often operator-dependent.

| Situation | More Likely Outcome |
|---|---|
| large standard GEMM / convolution with a strong vendor implementation available | library dispatch such as `rocBLAS`, `cuDNN`, or `oneDNN` |
| fused pointwise chain or unusual operator boundary | custom generated kernel |
| target-specific epilogue or layout-sensitive post-op | hybrid path: library for the heavy op, generated kernel around it |
| unsupported or novel operator pattern | compiler-generated lowering if the stack supports it, otherwise fallback |

What drives the choice:

- operator kind
- tensor shape and layout
- target hardware
- expected performance of vendor libraries
- whether fusion would be lost by dispatching too early
- backend support maturity

:::note This matters because the inspection path changes.

If the compiler generated a custom kernel, you inspect IR, codegen, and the emitted binary.
If it dispatched into a library, the most important question becomes whether the compiler chose the right library boundary, layout, and surrounding kernels.
:::

## Fallbacks And Recompilation Paths

Real systems do not always stay on one clean compile path.

Common breakpoints include:

- graph break back to eager execution
- unsupported operator fallback
- dynamic-shape guard failure followed by recompilation
- mixed device placement where part of the model runs elsewhere
- library fallback when a custom codegen path is not available or not profitable

Typical symptoms:

| Failure Mode | What You Notice |
|---|---|
| graph break | only part of the model is compiled, with unexpected eager execution around it |
| unsupported op | compilation stops, falls back, or partitions the graph |
| shape-guard miss | recompilation, cache misses, or latency spikes |
| device partition | CPU/GPU handoff costs or surprising copies |
| backend fallback | fewer fused kernels than expected or a different execution path than you assumed |

This is why the pipeline is better pictured as a mainline path with exit ramps rather than as one perfectly straight arrow.

## What To Inspect At Each Stage

If you are debugging or learning, do not just ask "what stage am I on?"
Ask "what can I still verify here before the next stage hides it?"

| Stage | What To Inspect |
|---|---|
| model / export | graph breaks, explicit operators, shapes, dtypes, constants |
| graph optimization | fusion boundaries, removed work, partition decisions, simplified subgraphs |
| lowering | loop-like structure, decomposition of complex ops, memory movement becoming explicit |
| scheduling / memory planning | tile sizes, thread or block shape, temporary buffer lifetime, layout choices |
| backend IR | target triple, address spaces, vector ops, backend intrinsics |
| assembly / binary | expected loads/stores, execution shape, instruction mix, target packaging |
| runtime launch | kernel count, launch order, copies, synchronization points, device placement |

A good habit is to ask one blunt question at every layer:

> what information is still visible here, and what information has already been committed or lost?

## Papers And References

This article is easier to trust if you pair the stage descriptions with both research papers and production documentation.

### If You Read Only Three Things First

- [TVM: An Automated End-to-End Optimizing Compiler for Deep Learning](https://www.usenix.org/system/files/osdi18-chen.pdf)
  Read this first if you want the cleanest end-to-end systems view. It connects graph optimization, operator optimization, and hardware portability in one stack.
- [MLIR: A Compiler Infrastructure for the End of Moore's Law](https://arxiv.org/pdf/2002.11054)
  Read this next if you want to understand why multi-level IRs exist and why one IR is usually not enough for modern ML compiler pipelines.
- [Relay: A New IR for Machine Learning Frameworks](https://arxiv.org/pdf/1810.00952)
  Read this if Stage 1 and Stage 3 still feel abstract. It is a good paper for understanding why explicit high-level model representations matter.

## How Real Systems Differ

The pipeline shape is shared, but the emphasis changes across systems.

| System | Strongest Identity | What It Emphasizes |
|---|---|---|
| `torch.compile` + TorchInductor | framework-integrated compiler path | graph capture close to PyTorch, fusion, lowering, practical deployment inside the PyTorch workflow |
| TVM | end-to-end research and deployment stack | graph optimization, tensor scheduling, hardware portability, auto-tuning |
| XLA / OpenXLA | large production compiler stack | whole-graph optimization, HLO-style IR, backend lowering for accelerators and large training/inference stacks |
| Triton | kernel-level control | direct control of GPU kernels and easier visibility into later compilation stages |

So do not expect every system to expose the same artifacts at the same layer.
Some live higher in the stack. Some live lower. Some span almost the whole path.

## Dynamic Shapes And Library Dispatch

Two important realities are easy to miss if you only read idealized pipelines.

First, dynamic shapes complicate several stages:

- graph capture may need guards or recompilation paths
- scheduling may no longer assume one fixed tile or one fixed memory plan
- backend specialization may need multiple compiled variants

That is why dynamic shapes show up as a hard problem in real systems, not a small edge case.

Second, compilers do not always generate every kernel themselves.
For common heavy operators, the pipeline often uses optimized libraries instead of emitting custom code:

- `cuDNN`
- `rocBLAS`
- `oneDNN`
- similar vendor/operator libraries

So the pipeline can end in two different ways:

- generate a custom kernel
- dispatch into a tuned operator library

That is not a failure of the compiler.
It is often the correct engineering choice.

## Autotuning And Search

One more practical detail belongs in this story: many stacks do not pick one schedule or kernel configuration purely from fixed rules.

They often search.

That search may cover:

- tile sizes
- block or warp configuration
- vectorization choices
- memory layout variants
- alternative kernel templates
- algorithm variants for the same operator

So Stage 5 is sometimes not just:

> choose a schedule

It is:

> search over several legal schedules and keep the best one for this target and workload

This can happen through:

- heuristic selection
- offline autotuning
- online profiling and cache-based reuse
- search-based systems such as auto-schedulers

That matters because "the compiler chose this" sometimes really means:

- the compiler generated candidates
- measured or estimated them
- cached a preferred variant

If you ignore that layer, some performance behavior looks random when it is actually the result of a search policy.

### Research Papers

- [TVM: An Automated End-to-End Optimizing Compiler for Deep Learning](https://www.usenix.org/system/files/osdi18-chen.pdf)
- [MLIR: A Compiler Infrastructure for the End of Moore's Law](https://arxiv.org/pdf/2002.11054)
- [Glow: Graph Lowering Compiler Techniques for Neural Networks](https://arxiv.org/pdf/1805.00907)
- [Relay: A New IR for Machine Learning Frameworks](https://arxiv.org/pdf/1810.00952)
- [TensorIR: An Abstraction for Automatic Tensorized Program Optimization](https://arxiv.org/pdf/2207.04296)
- [Ansor: Generating High-Performance Tensor Programs for Deep Learning](https://www.usenix.org/system/files/osdi20-zheng.pdf)

### Official Documentation

- [ONNX Concepts](https://onnx.ai/onnx/intro/concepts.html)
- [MLIR Documentation](https://mlir.llvm.org/docs/)
- [LLVM Documentation](https://llvm.org/docs/)
- [Apache TVM Documentation](https://tvm.apache.org/docs/)
- [OpenXLA Documentation](https://openxla.org/)
- [Triton Documentation](https://triton-lang.org/main/index.html)
- [PyTorch `torch.compile` Documentation](https://pytorch.org/docs/stable/torch.compiler.html)
- [ROCm Documentation](https://rocm.docs.amd.com/)

### Internal Reading

- [Machine Learning Library Shelf](/library/topic?topic=machine-learning)
- [MLIR Library Shelf](/library/topic?topic=mlir)
- [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack)

## Wrap-Up

## What You Should Now Be Able To Do

If the article did its job, you should leave with a different debugging and reasoning habit, not just with a longer vocabulary list.

You should now be able to:

- separate model meaning from execution strategy
- explain why graph capture, lowering, scheduling, and runtime launch are distinct stages
- recognize that LLVM is often an important backend component, but not the whole ML compilation story
- reason about why two implementations of the same math can differ wildly in memory traffic and kernel count
- inspect a graph dump, IR dump, assembly dump, or runtime trace and ask what decision became visible there
- distinguish custom kernel generation from library dispatch
- recognize fallback paths such as graph breaks, recompilation, and mixed-device partitioning

That is the real value of the pipeline view.

Before this mental model, a system often looks like:

```text
Python model
  ->
something opaque
  ->
GPU work
```

After this mental model, the opaque middle stops being one mystery blob.
It becomes a chain of representations and decisions you can inspect stage by stage:

- what computation became explicit?
- what got fused or partitioned?
- what execution shape was chosen?
- what code or library call was emitted?
- what did the runtime actually launch?

That shift is why this topic matters.
The pipeline is not just academic structure. It is the difference between guessing and being able to localize where performance, correctness, or portability started to go wrong.

## FAQ

**Do I need to install everything before understanding this article?**

No.
This article is for familiarity first, not for gatekeeping.
The main concepts here are stage boundaries, representations, and decision points.
You can understand those without having a full ROCm, Triton, or PyTorch compiler stack working locally.

What installation gives you is not the right to understand the article.
It gives you the ability to reproduce the checks, inspect the artifacts directly, and confirm how a real machine behaves.

**Do I need `akhi_env` for the whole article?**

No.
It is only relevant for the Python-side commands in this article, especially the PyTorch checks, export examples, and local script runs.
The system-level inspection commands such as `rocm-smi` and `rocminfo` do not depend on that environment.

Conceptually, this is another small example of the compiler/runtime split:

- system commands tell you what the machine and driver stack expose
- Python-side commands tell you what the framework and compiler path can actually see and use

**Is an ML compiler just LLVM for AI?**

No, and this article should leave you with a precise reason for that.

LLVM is usually most useful once the computation has already been made concrete enough to look like backend work:

- target-specific IR
- address spaces
- vector operations
- low-level code generation

But many decisive ML questions arise earlier:

- what graph is actually being compiled?
- which operators should be fused?
- what layout should be preserved or transformed?
- should this become a custom kernel or a library call?
- how should dynamic shapes or device partitioning be handled?

So LLVM often remains important, but it usually arrives after some of the most ML-specific decisions have already been made.

**What is the ML equivalent of the `.i` file idea?**

There is no single exact equivalent, and that is part of the point.
Traditional preprocessors often produce one especially visible intermediate file.
ML stacks usually expose several meaningful boundaries instead of one canonical "here is the intermediate result" artifact.

The closest mindset is:

- after capture/export, you get graph IR
- after lowering, you get more concrete tensor or loop-oriented IR
- after backend codegen, you get target IR, assembly, or device binary

So the right habit is not "find the one ML `.i` file."
It is "ask what artifact becomes visible after each major stage."

**Why does this pipeline look longer than a traditional CPU compiler pipeline?**

Because the system has to solve more of the execution problem before ordinary backend code generation is even meaningful.

In a traditional CPU compiler, a large part of the work can be deferred until the program is already in a relatively uniform IR and headed toward one target ISA.
In ML systems, that is often too late.
The stack has to make earlier decisions about the shape of the work itself, not just the instructions that will encode it.

That includes questions such as:

- tensor shapes
- operator fusion
- memory layout
- schedule shape
- target device placement

So the pipeline looks longer because more of the hard work happens before "emit low-level code" is even the right question.
The extra stages are not ceremony.
They exist because model semantics are too far from efficient hardware execution to collapse directly into one backend pass.

**What should I focus on first as a beginner?**

Focus on three habits before you focus on tool names.

First, learn to ask these four questions at every stage:

1. What is the input to this stage?
2. What decision is made here?
3. What is the output of this stage?
4. What became more concrete after this step?

Second, pick one small operator chain such as `matmul -> add -> relu` and follow it through the stack instead of trying to memorize every system at once.

Third, inspect artifacts whenever possible.
Do not let the whole topic remain a blur of names like XLA, TVM, MLIR, Triton, and TorchInductor.
Those names only become useful once you can place them against concrete pipeline stages.

If you can build those habits, the rest of the ML compiler landscape becomes much easier to reason about.

## What To Read Next

- [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm)
- [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack)
- [MLIR Intro](/docs/MLIR/intro)
- [TVM for Beginners](/docs/tvm-for-beginners)

<AdBanner />
