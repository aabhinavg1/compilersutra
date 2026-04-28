---
title: "Inside torch.compile: Dynamo → AOTAutograd → Inductor → Triton Explained"
description: "Understand how torch.compile works internally: TorchDynamo captures graphs, AOTAutograd prepares backward graphs, TorchInductor optimizes execution, and Triton generates GPU kernels."
slug: /ml-compilers/inside-torch-compile/
displayed_sidebar: mlCompilersSidebar
sidebar_position: 5
keywords:
  - torch compile explained
  - how torch.compile works
  - torchdynamo explained
  - aotautograd explained
  - torchinductor explained
  - triton explained
  - pytorch compiler stack
  - torch compile dynamo aotautograd inductor triton
  - how pytorch models become kernels
  - pytorch compiler for beginners
  - torch compile under the hood
  - torch compile tutorial
  - pytorch graph capture
  - graph breaks torch compile
  - guards torch compile
  - triton kernel generation
  - gpu kernel compilation pytorch
  - ml compiler stack pytorch
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Inside torch.compile: Dynamo → AOTAutograd → Inductor → Triton Explained

You write PyTorch.

The GPU does not run PyTorch source code.

It runs kernels.

So if you call `torch.compile(model)`, something important has to happen in the middle:

- Python execution has to be observed
- tensor operations have to be captured into graphs
- forward and backward work may need to be restructured
- the graph has to be lowered into executable kernels
- and those kernels still have to match the target hardware

That middle path is what this article explains.

This page is the practical follow-up to:

- [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm)
- [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline)
- [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)

If those articles answered why ML compilers exist, this one answers a narrower question:

> what specifically happens inside PyTorch's modern compile stack?

## Who This Is For

This article is for you if:

- you can already read simple PyTorch code
- you have seen `torch.compile(...)` before
- you want to know what happens after that call
- you do not want deep compiler theory first

The goal here is not to explain every internal detail.

The goal is to give you one clear beginner picture of the stack.

If that basic picture becomes clear, the deeper compiler details become much easier later.

## Four Simple Terms First

Before the main explanation, keep these four words in mind:

- **graph**: a structured list of tensor operations like `matmul`, `add`, and `relu`
- **lowering**: turning a high-level form into a lower-level form that is closer to execution
- **backend**: the part of the system that turns a captured graph into runnable code
- **guard**: a runtime check that decides whether compiled code is still safe to reuse

You do not need to memorize them.
You only need a rough feel for them while reading.

## Inspect And Verify On Your Machine

Before going deeper into the stack, verify what your local environment actually exposes.

:::note
The commands below were verified in a Python virtual environment on this machine. In your own setup, activate your environment with either:

- `source /path/to/your/env/bin/activate`
- or your own shell alias, for example `akhi_env`, if you use one
:::

<Tabs>
<TabItem value="env" label="Environment Checks" default>

Use these commands first:

```bash
source /path/to/your/env/bin/activate
python -c "
import sys, torch
print('python', sys.version.split()[0])
print('torch', torch.__version__)
print('has_compile', hasattr(torch, 'compile'))
print('cuda_available', torch.cuda.is_available())
"
```

Observed here:

```text
python 3.12.3
torch 2.11.0.dev20260206+rocm7.0
has_compile True
cuda_available True
```

Now inspect the visible GPU target:

```bash
source /path/to/your/env/bin/activate
python -c "
import torch
print('device_count', torch.cuda.device_count())
print('device0', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'N/A')
print('arch0', getattr(torch.cuda.get_device_properties(0), 'gcnArchName', 'N/A') if torch.cuda.is_available() else 'N/A')
"
```

Observed here:

```text
device_count 2
device0 AMD Radeon RX 9060 XT
arch0 gfx1200
```

If you want to verify the Triton layer is installed too:

```bash
source /path/to/your/env/bin/activate
python -c "import triton; print('triton', triton.__version__)"
```

Observed here:

```text
triton 3.6.0
```

</TabItem>
<TabItem value="capture" label="Graph Capture Check">

The fastest way to prove that PyTorch is moving from Python model code toward an explicit graph is to export a tiny module and inspect the resulting graph:

```bash
source /path/to/your/env/bin/activate
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

Observed here:

```python
def forward(self, x, w, b):
    matmul = torch.ops.aten.matmul.default(x, w);  x = w = None
    add = torch.ops.aten.add.Tensor(matmul, b);  matmul = b = None
    relu = torch.ops.aten.relu.default(add);  add = None
    return (relu,)
```

What this proves:

- the original Python expression has become explicit ATen ops
- the graph boundary is much clearer than the original Python source
- we are already in a compiler-friendly representation long before hardware codegen

You do not need to read every line of the printed graph.

The main thing to notice is simple:

- `matmul` is visible
- `add` is visible
- `relu` is visible

So the original Python expression has been turned into a structured operation list that the compiler can work with more easily.

</TabItem>
<TabItem value="compiled" label="Real torch.compile Run">

This is the smallest useful proof that `torch.compile` is not just an API label:

```bash
source /path/to/your/env/bin/activate
python - <<'PY'
import torch

def f(x, y, b):
    return torch.relu(x @ y + b)

compiled_f = torch.compile(f)
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'

x = torch.randn(512, 512, device=device)
y = torch.randn(512, 512, device=device)
b = torch.randn(512, device=device)

out = compiled_f(x, y, b)
if device.startswith('cuda'):
    torch.cuda.synchronize()

print('device', out.device)
print('shape', tuple(out.shape))
print('dtype', out.dtype)
print('sum', float(out.sum().item()))
PY
```

Observed here:

```text
device cuda:0
shape (512, 512)
dtype torch.float32
sum 2359674.0
```

You may see backend warnings around MIOpen or TF32 depending on your setup. Those warnings are not the main point. The important part is that the compiled function ran successfully on the GPU target.

</TabItem>
<TabItem value="backward" label="Compiled Backward Check">

To justify the AOTAutograd discussion, run a tiny training-style example:

```bash
source /path/to/your/env/bin/activate
python - <<'PY'
import torch

class TinyTrain(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.lin = torch.nn.Linear(16, 16)

    def forward(self, x):
        return torch.relu(self.lin(x)).sum()

model = TinyTrain().to('cuda:0' if torch.cuda.is_available() else 'cpu')
compiled_model = torch.compile(model)
device = next(model.parameters()).device

x = torch.randn(8, 16, device=device)
loss = compiled_model(x)
loss.backward()

if str(device).startswith('cuda'):
    torch.cuda.synchronize()

print('device', device)
print('loss', float(loss.item()))
print('grad_norm', float(model.lin.weight.grad.norm().item()))
PY
```

Observed here:

```text
device cuda:0
loss 28.30371856689453
grad_norm 32.956520080566406
```

This does not expose every internal partitioning decision directly, but it does prove that a compiled forward-and-backward flow is functioning in the environment used for this article.

</TabItem>
</Tabs>

<AdBanner />

## Table of Contents

1. [The One-Line Picture](#the-one-line-picture)
2. [Where `torch.compile` Sits In The Stack](#where-torchcompile-sits-in-the-stack)
3. [Stage 1: TorchDynamo Captures Graphs](#stage-1-torchdynamo-captures-graphs)
4. [Stage 2: AOTAutograd Prepares Backward Work](#stage-2-aotautograd-prepares-backward-work)
5. [Stage 3: TorchInductor Decides How The Work Should Run](#stage-3-torchinductor-decides-how-the-work-should-run)
6. [Stage 4: Triton Generates Many GPU Kernels](#stage-4-triton-generates-many-gpu-kernels)
7. [How This Connects To The Broader ML Compiler Story](#how-this-connects-to-the-broader-ml-compiler-story)
8. [Common Failure Points](#common-failure-points)
9. [What `torch.compile` Is Not](#what-torchcompile-is-not)
10. [What To Read Next](#what-to-read-next)

## The One-Line Picture

The simplest accurate understanding is:

```python
PyTorch code
  -> Dynamo captures tensor-heavy regions
  -> AOTAutograd prepares backward graphs when needed
  -> Inductor optimizes and lowers the work
  -> Triton often emits GPU kernels
  -> the runtime launches hardware-specific code
```

That is the shape.

But each arrow hides a different compiler problem.

| Layer | Main Job | Main Question |
|---|---|---|
| `TorchDynamo` | capture PyTorch operations from Python execution | what tensor work can be turned into a graph? |
| `AOTAutograd` | build ahead-of-time backward graphs for training flows | what gradient work should be compiled too? |
| `TorchInductor` | optimize and lower the captured graph | how should this work be arranged for the backend? |
| `Triton` | generate many GPU kernels | what exact GPU program should run? |

The biggest mistake beginners make is to think all four layers do the same job.

They do not.

Each layer solves a different part of the problem.

## Where `torch.compile` Sits In The Stack

You can place `torch.compile` inside the broader ML compiler picture like this:

```text
Python model
  -> framework execution
  -> graph capture
  -> graph / backward restructuring
  -> kernel-level lowering
  -> GPU code generation
  -> runtime launch
```

That means `torch.compile` is not one small optimization pass.

It is a stack of steps that begins near Python execution and ends much closer to hardware execution.

One way to say it cleanly is:

- **Dynamo answers:** what PyTorch work can be captured?
- **AOTAutograd answers:** what backward computation should be compiled with it?
- **Inductor answers:** what optimized execution plan should exist?
- **Triton answers:** what GPU kernel should actually run?

## Stage 1: TorchDynamo Captures Graphs

This is the first major step.

PyTorch programs are written in Python, but Python is full of things that do not map cleanly to graph compilation:

- arbitrary control flow
- side effects
- object mutation
- data-dependent branching
- libraries the compiler does not understand

TorchDynamo sits at the Python execution boundary and tries to extract regions that are mostly tensor computation.

In current PyTorch documentation, Dynamo is described as a Python-level JIT compiler that hooks into CPython's frame evaluation API and rewrites bytecode to extract PyTorch operations into an FX graph.

That wording matters.

It means Dynamo is not starting from a static source file the way a normal C++ compiler does.
It is observing Python execution at runtime and trying to carve out graphable regions.

The graph export check above is the cleanest local proof of this transition.
We start with Python:

```python
torch.relu(x @ w + b)
```

and we observe explicit graph-level ATen ops:

```python
torch.ops.aten.matmul.default
torch.ops.aten.add.Tensor
torch.ops.aten.relu.default
```

That is exactly the kind of representation shift Dynamo exists to enable.

### What Dynamo Produces

The output is usually not machine code and not GPU code.

It is a higher-level graph representation of tensor operations.

Think in terms like:

```text
matmul
  -> add
  -> relu
```

instead of:

```text
thread 37 loads address X
thread 37 executes instruction Y
```

Dynamo is still very far from the hardware.

Its job is mainly:

- identify graphable regions
- preserve tensor semantics
- split around unsupported parts
- create guards so the compiled result is reused only when assumptions still hold

### Graph Breaks And Guards

Two Dynamo terms matter a lot:

- **graph break**
- **guard**

A graph break means Dynamo could not keep compiling through a region, so execution falls back to eager Python for that part.

A guard is a runtime assumption attached to a compiled region.
If those assumptions stop being true, recompilation may happen.

This is why `torch.compile` sometimes feels magical and sometimes feels fragile.

It is not enough to capture a graph once.
The compiler also has to know when that compiled version is still valid.

## Stage 2: AOTAutograd Prepares Backward Work

If you only think about inference, it is easy to miss why this layer exists.

But training changes the problem.

Now the system needs:

- the forward graph
- the backward graph
- saved state between them
- and a good partition of what should be compiled together

This is where AOTAutograd enters.

PyTorch's current documentation explains that `torch.compile` supports training by using AOTAutograd to generate backward graph segments for forward segments captured by Dynamo.

That makes AOTAutograd important for a simple reason:

> training is not just "compile the forward and hope autograd figures it out later."

The backward itself becomes part of the compiler problem.

### What AOTAutograd Contributes

AOTAutograd helps by:

- tracing backward computation ahead of time
- pairing forward and backward segments
- optionally partitioning them
- reducing the amount of state that has to be saved between forward and backward

This matters because the expensive part of training is not only arithmetic.

It is also:

- activation storage
- memory traffic
- recomputation tradeoffs
- and how much of the training step stays inside compiled regions

So AOTAutograd is not a random extra stage.

It is the part that turns "autograd happens somehow" into "backward is now explicit compiler-managed work too."

### A Small Mental Picture

The easiest beginner-friendly way to understand this stage is to think in terms of two related computations:

```text
forward:
  x -> linear -> relu -> loss

backward:
  loss -> relu backward -> linear backward -> parameter gradients
```

In eager PyTorch, the backward work is discovered dynamically from the autograd history created during the forward pass.

In compiled training, the system wants something more explicit.
It wants to understand the backward work as compiler-managed work too, not just as a dynamic follow-up that gets interpreted later.

So the mental shift is:

```text
eager training:
  run forward
  record autograd history
  execute backward from that history

compiled training:
  capture forward region
  derive backward graph for that region
  compile both into a more stable path
```

That is the main reason AOTAutograd exists as its own stage.

### Tiny Pseudocode Version

You can think about the training case like this:

```text
user code:
  loss = model(x)
  loss.backward()

compiler-oriented view:
  forward_graph = capture(model(x))
  backward_graph = derive_gradients(forward_graph)
  compiled_forward = compile(forward_graph)
  compiled_backward = compile(backward_graph)
```

The real system does more than this:

- it partitions work into segments
- it decides what tensors must be saved
- it may trade recomputation against memory

But even this simplified picture already makes the stage feel concrete:
backward is no longer just "something autograd does later."
It becomes part of the compilation story.

The compiled training example above is the practical reason this stage matters.
Once the forward is compiled, the training path also needs:

- gradient-producing backward work
- saved activations or recomputation decisions
- a stable compiled boundary around training-relevant graph segments

That is where AOTAutograd belongs in the stack.

### A Useful Boundary To Keep Clear

- **Dynamo** decides what forward Python regions are captured.
- **AOTAutograd** takes those captured regions and prepares compiled backward graphs when training requires them.

That boundary is easy to blur, but you should keep it sharp.

## Stage 3: TorchInductor Decides How The Work Should Run

After graph capture, someone still has to make optimization and lowering decisions.

That is the job of TorchInductor.

TorchInductor is the default `torch.compile` backend in modern PyTorch.
Its role is much closer to the core ML compiler problem:

- fuse operations where profitable
- reduce unnecessary memory movement
- choose backend codegen paths
- lower the graph toward actual executable kernels

This is the point where the compiler stops mostly asking:

> what operations happened?

and starts asking:

> what is the best executable shape for those operations on this target?

The real `torch.compile` run shown earlier is the simplest local proof that this backend stage is active.
We define:

```python
torch.relu(x @ y + b)
```

and the compiled function executes successfully on `cuda:0`.

That alone does not reveal every fusion and scheduling choice, but it does prove that we have moved beyond plain eager execution and into an optimized backend path.

### A Concrete Example: Why Inductor Matters

Take this small expression:

```python
torch.relu(x @ y + b)
```

At a very naive level, you could imagine it running as three separate steps:

```text
1. matmul kernel
2. add kernel
3. relu kernel
```

That would mean:

- one kernel produces the matrix multiply result
- another kernel reads that result and adds `b`
- another kernel reads that new result and applies `relu`

This can create extra memory traffic and extra kernel launches.

Inductor tries to improve that situation.
It looks at the graph and asks whether some of that work can be grouped into a better execution plan.

A simplified picture is:

```text
before optimization:
  matmul -> add -> relu
  3 separate stages

after better planning:
  matmul + add + relu
  fewer stages, less intermediate traffic
```

This is exactly why Inductor sits between graph capture and Triton code generation.
It is not just passing the graph through.
It is trying to shape the work into something more efficient before the backend emits kernels.

### What Inductor Optimizes For

At a high level, Inductor tries to produce a better execution plan by improving things such as:

- operator fusion
- loop-level structure
- intermediate memory usage
- launch granularity
- backend-specific lowering choices

This is why Inductor matters even if Triton gets all the attention.

Triton is often the visible GPU kernel layer.
Inductor is the part deciding what kernel-worthy work should exist in the first place.

### CPU And GPU Are Not The Same Path

Another important nuance:

Inductor does not always lower to Triton.

For GPUs, Triton is often the interesting path.
For CPUs, Inductor can generate C++ and OpenMP code.

So a cleaner statement is:

> Inductor is the optimizing backend; Triton is one major GPU codegen target it uses.

That phrasing is much more accurate than saying "`torch.compile` equals Triton."

## Stage 4: Triton Generates Many GPU Kernels

By the time Triton becomes important, much of the high-level uncertainty is already gone.

The compiler now knows much more clearly:

- what computation should exist
- what shapes and layouts matter
- what fused region should become a kernel
- and that the target is a GPU path worth lowering through Triton

Triton then expresses GPU kernels in a much more hardware-oriented form than the original PyTorch graph.

It is still not "Python model code."
It is now kernel code.

This is the layer most people instinctively imagine when they hear "GPU compiler," but it is only one stage of the larger stack.

### Why Triton Fits So Well Here

Triton is useful because it gives the stack a programmable way to emit optimized GPU kernels without forcing users to hand-write everything in CUDA or HIP.

That makes it a very natural backend when the compiler has already decided:

- which operations should be fused
- how work should be grouped
- and that GPU execution is the right target

If you want to see what happens after Triton on a real AMD system, go straight to:

- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack)

That article follows a Triton kernel down through:

- TTIR
- TTGIR
- LLVM IR
- AMDGCN assembly
- HSACO binary

So this page explains the stack boundary.
That page shows the artifact trail.

Also keep the boundary clear here:

- this article proves the stack is available and working through local commands
- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack) is the page that shows the lower compiler artifacts directly

The two pages are meant to complement each other rather than duplicate each other.

## How This Connects To The Broader ML Compiler Story

At this point the big picture should become clearer.

`torch.compile` is one concrete instance of the same layered compiler logic your other ML compiler pages describe:

- computation starts at a high abstraction level
- the stack captures a graph
- optimization decisions are made before final code generation
- backend code is produced only after the work is reshaped

That is why this topic belongs in your ML compiler section rather than being treated as just a PyTorch trick.

It is really a modern ML compiler stack disguised as a friendly API.

## Common Failure Points

Most `torch.compile` pain comes from one of these:

### 1. Graph Breaks

The compiler cannot keep a tensor-heavy region in one compiled graph because some part of the Python code is unsupported or too dynamic.

### 2. Guards And Recompilation

The original compiled graph was specialized under assumptions that stop being true later, so recompilation happens.

### 3. Dynamic Shapes

Real workloads do not always arrive in one fixed shape.
That makes specialization, caching, and reuse much harder.

### 4. Training Complexity

Backward capture, saved tensors, partitioning, and memory tradeoffs all make the training case harder than "compile inference."

### 5. Kernel-Level Reality

Even if graph capture succeeds, the final generated kernels may still be slower than expected because the target hardware path is hard.

This is one reason you should treat `torch.compile` as a compiler stack, not as a one-line speed button.

## What `torch.compile` Is Not

It helps to remove a few bad assumptions directly.

`torch.compile` is not:

- a single compiler pass
- just a Triton wrapper
- a guarantee that the whole model becomes one fused kernel
- a promise that Python disappears completely
- a replacement for understanding graph breaks, guards, and backend behavior

It is better thought of as:

> a staged compiler pipeline attached to PyTorch execution.

That is the right level of seriousness to bring to it.

## What To Read Next

If you want one natural next step after this page, the best continuation is [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack), because it shows what the lower part of the stack looks like once Triton starts lowering toward real GPU artifacts.

## Primary References

These are the main references behind the stack descriptions in this article:

- [PyTorch `torch.compiler` guide](https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/torch.compiler.html)
- [TorchDynamo overview](https://docs.pytorch.org/docs/main/user_guide/torch_compiler/torch.compiler_dynamo_overview.html)
- [PyTorch compiler FAQ](https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/torch.compiler_faq.html)
- [PyTorch backward semantics / AOTAutograd note](https://docs.pytorch.org/docs/stable/user_guide/torch_compiler/torch.compiler_backward.html)
- [Triton tutorials](https://triton-lang.org/main/getting-started/tutorials/index.html)

The local command outputs in the earlier tabs are what tie those references back to a concrete runnable environment.
