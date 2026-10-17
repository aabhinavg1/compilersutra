---
title: "ONNX Runtime graph partitioning explained: why your model still runs on CPU"
description: "Learn how ONNX Runtime splits an ONNX model across execution providers, with a toy graph, Python examples, Case A vs Case B copies, debugging steps, and what Microsoft, vendors, and IREE are changing."
slug: /weekly-problems/2026-W42-ort-ep-graph-partitioning
displayed_sidebar: weeklyProblemsSidebar
keywords:
  - ONNX Runtime graph partitioning
  - ONNX Runtime execution provider explained
  - why ONNX Runtime uses CPU with CUDA
  - GetCapability Compile ONNX Runtime
  - GPU CPU fallback copy inference
  - InferenceSession providers order
  - TensorRT vs CUDAExecutionProvider
  - IREE ONNX Runtime EP
  - debug ONNX Runtime which nodes on CPU
  - ONNX Runtime for beginners
  - weekly problem brief compilers
  - AI inference compiler runtime
---

# 2026-W42: Why part of your ONNX model still runs on the CPU

You exported a model to ONNX. You installed a GPU build of ONNX Runtime. You passed `CUDAExecutionProvider` into `InferenceSession`. The outputs match your reference. The latency still disappoints you.

In many real projects the missing piece is not “the MatMul kernel is slow.” It is that **ONNX Runtime never put the whole graph on the GPU**. One or more operators stayed on `CPUExecutionProvider`. Tensors crossed the boundary. The score stayed correct. The timeline filled with copies and syncs.

That assignment is decided when the session is created. Official docs call the step **graph partitioning**. This article explains it from first principles, walks a five-node toy graph, shows Python you can run, and ends with a debugging checklist used in compiler and inference work.

## Who this is for

- Beginners who know Python and have heard of ONNX but not “execution providers”
- Engineers who already call `session.run` and need to reason about CPU islands
- People comparing CUDA, TensorRT, OpenVINO, CoreML, QNN, or an IREE-based EP

You do not need to have written an EP. You do need one ONNX file and a working ORT install (CPU-only is enough to learn the API; GPU makes Case B visible in profiles).

## The five terms that unlock the rest

| Term | What it is | What it is not |
| --- | --- | --- |
| **ONNX file** | A portable list of operators, tensors, and weights | A finished GPU program |
| **Operator / node** | One step (`MatMul`, `Relu`, `Softmax`, …) | A CUDA kernel by itself |
| **ONNX Runtime (ORT)** | Loads the file, rewrites it, partitions it, runs it | Your training framework |
| **Execution provider (EP)** | A backend that can implement some nodes on some hardware | A guarantee that every node runs there |
| **Graph partition** | Cutting the graph into subgraphs and assigning each to an EP | Something that re-runs on every `session.run` |

Hold onto one sentence: **the ONNX file states what to compute; the partition states who computes each piece.**

## Where partitioning sits in the pipeline

A typical path looks like this:

```text
PyTorch / TF / other exporter
        |
        v
   model.onnx   (operators + weights)
        |
        v
  InferenceSession(...)
        |-- graph optimizations (constant fold, some fusions, …)
        |-- partition across EPs (this article)
        |-- each EP prepares its subgraph (kernels, or a compile)
        v
   session.run(feeds)   # uses the plan; does not re-partition
```

Two timing facts follow from that diagram:

1. **Session creation is a compile step** in the wide sense. Heavy EPs (TensorRT engine build, IREE compile) may spend most of their time here or on the first run.
2. **`session.run` reuses the plan.** Timing only warm runs tells you about steady inference. Timing only the first call mixes compile and execute.

## A five-node toy graph

Forget accuracy. Watch placement.

```text
input x
   |
   v
[1] MatMul
   |
   v
[2] Relu
   |
   v
[3] NonZero     # stand-in for "op this GPU EP will not take"
   |
   v
[4] MatMul
   |
   v
[5] Softmax
   |
   v
output y
```

`NonZero` is a teaching choice. In production the hole is often a custom op, an opset the EP does not implement, a dynamic-shape edge case, or a control-flow construct. The **shape** of the problem is the same: a gap in the middle of a device chain.

### Create a session (provider order matters)

```python
import onnxruntime as ort

providers = [
    "CUDAExecutionProvider",  # asked first
    "CPUExecutionProvider",   # completeness backstop
]

session = ort.InferenceSession("toy.onnx", providers=providers)
print(session.get_providers())
```

ORT walks the provider list in order. Each EP reports the nodes it can take. The CPU EP is last so the session can always finish the graph.

If CUDA is not installed or fails to load, ORT may fall back and `get_providers()` will not show what you expected. Always print it before you argue about performance.

### Case A — one device island

Suppose CUDA claims nodes 1–5.

```text
[1] MatMul   CUDA
[2] Relu     CUDA
[3] NonZero  CUDA
[4] MatMul   CUDA
[5] Softmax  CUDA
```

Activations can stay in GPU memory between steps. Host ↔ device traffic is mostly inputs and outputs (unless you also mishandle bindings). This is the path people assume they bought when they wrote `"CUDAExecutionProvider"`.

### Case B — a hole in the middle

Suppose CUDA claims 1, 2, 4, 5 but not 3.

```text
[1] MatMul   CUDA  ┐ island 1
[2] Relu     CUDA  ┘
                 >> move / layout to CPU
[3] NonZero  CPU
                 >> move / layout to GPU
[4] MatMul   CUDA  ┐ island 2
[5] Softmax  CUDA  ┘
```

```text
Case A:  GPU ─ GPU ─ GPU ─ GPU ─ GPU
Case B:  GPU ─ GPU ═copy═ CPU ═copy═ GPU ─ GPU
```

Same numerics are possible. The timeline is not. A hole at the **end** of the graph often costs one egress copy. A hole in the **middle** splits a long GPU region into two and pays the bridge twice per run.

That is the core engineering problem behind this week’s brief: **maximal useful subgraphs on the fast EP, without copy-heavy cuts.**

## What ORT does in the constructor (mapped to APIs)

The [high-level design](https://onnxruntime.ai/docs/reference/high-level-design.html) describes the sequence as:

1. Load the ONNX graph into ORT’s in-memory IR.
2. Run **provider-independent** graph optimizations.
3. **Partition** into subgraphs using each EP’s capability.
4. Call the EP’s **`Compile`** (or equivalent) on the subgraphs it owns.
5. Leave unmatched nodes to the default CPU EP so the model remains runnable.

Capability is the EP saying “these nodes are mine” (`GetCapability` in the C++ EP interface). Partitioning prefers **maximal** subgraphs per provider in registration order. That is a greedy heuristic, not a global minimizer of copy cost. Understanding the heuristic explains Case B: one rejected node breaks an otherwise long CUDA chain.

When the EP is itself a compiler, costs stack. Example: the [IREE ONNX Runtime EP](https://github.com/iree-org/onnxruntime-ep-iree) receives the subgraphs **ORT already assigned**, lowers them through MLIR, and may cache VMFB/IRPA artifacts. IREE cannot “heal” a bad ORT cut; it only compiles the fragments it was given.

## Python: run, warm up, and stop fooling yourself on timings

```python
import time
import numpy as np
import onnxruntime as ort

so = ort.SessionOptions()
# Optional: raise graph optimization level when you know you want ORT rewrites
# so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

session = ort.InferenceSession(
    "model.onnx",
    sess_options=so,
    providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
)

assert "CUDAExecutionProvider" in session.get_providers(), session.get_providers()

feeds = {"input": np.random.randn(1, 8).astype(np.float32)}  # names from your model

# Cold: may include EP compile / engine build
t0 = time.perf_counter()
_ = session.run(None, feeds)
cold_ms = (time.perf_counter() - t0) * 1e3

# Warm: steadier view of the partitioned plan
times = []
for _ in range(50):
    t0 = time.perf_counter()
    _ = session.run(None, feeds)
    times.append((time.perf_counter() - t0) * 1e3)

warm_ms = sorted(times)[len(times) // 2]
print(f"cold_ms={cold_ms:.2f}  warm_median_ms={warm_ms:.2f}")
print("providers:", session.get_providers())
```

Notes that save hours:

- **`get_providers()` ≠ node assignment.** It lists active EPs, not “Softmax is on CUDA.”
- **Node-level placement** needs a profiler, vendor tools, or newer ORT APIs that record EP graph assignment ([PR #26781](https://github.com/microsoft/onnxruntime/pull/26781) — enable `session.record_ep_graph_assignment_info` when your build has it, then query which nodes each EP received).
- **IO binding** is a separate lever: if inputs start on host every call, you pay ingress even in Case A. Partitioning fixes middle-of-graph holes; binding fixes repeated host/device copies at the edges. See [ONNX Runtime](/docs/ml-compilers/onnx-runtime/) on the site for that distinction.

## Provider order and “I added TensorRT, why did nothing change?”

```python
# Preference order: TensorRT first, then CUDA, then CPU
providers = [
    "TensorRTExecutionProvider",
    "CUDAExecutionProvider",
    "CPUExecutionProvider",
]
```

TensorRT may build an engine for the subgraph **it** claims. Nodes it refuses can fall through to CUDA, then CPU. You can end up with three kinds of islands. Fusions are also **per EP**: a fusion inside TensorRT does not automatically exist for the CUDA EP. That is why “enable TensorRT” is not a synonym for “the whole graph is one engine.”

On edge stacks the same pattern appears under other names: CoreML, QNN, OpenVINO. The file is still ONNX (or a converted sibling). The **capability answer** still decides the cut. [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/) covers that path on CompilerSutra.

## How this shows up at work (and in search)

People type queries like:

- “onnxruntime cuda still using cpu”
- “onnxruntime execution provider not used”
- “tensorrt ep fallback to cuda”
- “onnxruntime graph partition”

Those are usually partition or provider-load problems, not missing `import torch`. The sensible debug order is:

1. Confirm the EP actually loaded (`get_providers()`).
2. Separate cold vs warm time.
3. Find **which op types** remain on CPU.
4. Ask whether those ops sit in the middle of a hot chain (Case B) or only at the boundary.
5. Fix the hole (export, replace op, custom EP kernel, different EP, accept the copy) before micro-tuning MatMul alone.

## Who is investing in this problem

| Actor | Surface | What they optimize |
| --- | --- | --- |
| **Microsoft + ORT contributors** | Session, `GraphPartitioner`, EP API | Correct maximal subgraphs; observability of assignment ([PR #26781](https://github.com/microsoft/onnxruntime/pull/26781)) |
| **NVIDIA / Intel / Qualcomm / Apple / …** | CUDA, TensorRT, OpenVINO, QNN, CoreML, … | Broader `GetCapability` coverage; faster `Compile` |
| **IREE / iree-org** | [onnxruntime-ep-iree](https://github.com/iree-org/onnxruntime-ep-iree) | MLIR compile of **already partitioned** fragments; artifact cache |

The shared problem statement is not “run ONNX.” It is: **assign large, cheap-to-bridge subgraphs to the right backend, and make the assignment inspectable.**

## Common misconceptions

**“I passed CUDA, so every node is on CUDA.”**  
Only the nodes CUDA claimed. The rest are CPU (or another EP).

**“Outputs match, so the GPU path is healthy.”**  
Correctness does not measure copies. Case B can match Case A numerically.

**“First run was 800 ms, we cannot ship.”**  
Measure warm median separately if the EP compiles. Ship the warm number for steady traffic; budget cold start if sessions are short-lived.

**“A compiling EP will fix a bad partition.”**  
It compiles what it receives. ORT’s cut still stands.

**“Graph optimization level replaces partitioning.”**  
Optimizations rewrite the ONNX-level graph. Partitioning assigns the remaining nodes to EPs. Both matter; they are not the same pass.

## Checklist for this week

1. Load your real `model.onnx` with device EP + `CPUExecutionProvider`.
2. Print `session.get_providers()` and fail fast if the device EP is missing.
3. Record cold time and warm median separately.
4. Identify one CPU-resident op type (assignment API, profiler, or vendor tooling).
5. Draw its position: edge vs middle. If middle, treat it like `NonZero` in the toy graph.
6. Decide a fix: change export, replace the op, extend EP support, change provider order, or consciously accept the bridge cost.
7. Only then profile individual GEMMs.

## What to watch next

- [ONNX Runtime high-level design](https://onnxruntime.ai/docs/reference/high-level-design.html) — optimize → partition → execute.
- [ORT PR #26781](https://github.com/microsoft/onnxruntime/pull/26781) — read EP assignment from the session.
- [iree-org/onnxruntime-ep-iree](https://github.com/iree-org/onnxruntime-ep-iree) — compiling EP on top of ORT partitions.

## Read on CompilerSutra

- [ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/) — what the file guarantees.
- [ONNX Runtime](/docs/ml-compilers/onnx-runtime/) — session, optimization levels, fallback copies, IO binding.
- [MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/) — why a subgraph still needs a finished backend.
- [IREE](/docs/ml-compilers/iree/) — one lowering pipeline, several device exits.
- [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/) — providers on phones and NPUs.
- [One MatMul, Many Implementations](/docs/ml-compilers/one-matmul-many-implementations/) — what happens after a node is assigned to a device.
