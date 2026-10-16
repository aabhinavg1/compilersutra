---
title: "The Stack Map"
description: "Graph compilers, kernel compilers, the front doors into them, the dialects they use, and the file each stack ships."
slug: /ml-compilers/the-stack-map/
hide_table_of_contents: true
displayed_sidebar: mlChapter28Sidebar
sidebar_position: 16
keywords:
  - ai compiler stack
  - ONNX Runtime
  - IREE
  - XLA
  - StableHLO
  - TVM Relax
  - TensorRT
  - Triton
---

import AdBanner from '@site/src/components/AdBanner';

# The Stack Map

Chapters 11–14 describe one pipeline. A job asks which program that pipeline is. This chapter names the programs. The next three chapters take ONNX Runtime, IREE, and the edge path apart.


## Two layers {#two-layers}

A graph compiler reads the model. It decides which operators fuse, which layout they use, and which device runs each piece.

A kernel compiler, or a library, implements one of those pieces: the loops, the tile, or a call into a routine that already exists.

ONNX Runtime, IREE, XLA, TVM, and TensorRT are graph compilers. Triton, TorchInductor's GPU path, CUTLASS, cuDNN, oneDNN, and MIOpen sit on the kernel layer. [One MatMul, Many Implementations](/docs/ml-compilers/one-matmul-many-implementations/) is that split on a single operator.

## Three front doors {#three-front-doors}

`torch.export` captures a PyTorch function as a graph. JAX and TensorFlow lower into StableHLO. An ONNX file is the third door, from [ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/).

[Inside torch.compile](/docs/ml-compilers/inside-torch-compile/) is the capture that also builds a backward graph. This course compiles the frozen forward graph from [Inference Is the Computation](/docs/ml-compilers/inference-is-the-computation/).

## Who compiles the graph {#who-compiles-the-graph}

ONNX Runtime loads the ONNX file, rewrites it, and splits it across execution providers. [ONNX Runtime](/docs/ml-compilers/onnx-runtime/) is that session.

IREE lowers Torch, StableHLO, or TOSA through MLIR and emits a module its VM runs. [IREE](/docs/ml-compilers/iree/) is that compiler.

XLA compiles StableHLO for CPU, GPU, and TPU. OpenXLA publishes StableHLO so another compiler can import the same operators.

TVM's graph IR is Relax. Schedules and autotuning are the work of Chapters 19 and the [TVM](/docs/tvm-for-beginners/) articles. Relay is the older graph IR. [TVM Relay](/docs/tvm/intermediate/relay/) describes that older form.

TensorRT builds an engine. Tactic search picks an implementation for each node. A plugin is how a custom operator enters the engine. The serialized engine is the vendor-API exit in [MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/).

## Who writes the kernel {#who-writes-the-kernel}

Triton is a language for a GPU kernel. Inductor often emits Triton, and the [AMD GPU walk](/docs/ml-compilers/mlcompilerstack/) follows one Triton kernel down to ISA.

CUTLASS, cuDNN, and cuBLAS are NVIDIA libraries. oneDNN is Intel's library for CPU and GPU. MIOpen is AMD's library for convolution and pooling. A graph compiler calls one of them when the shape and the layout match a routine that library ships. That call is [the library path](/docs/ml-compilers/one-matmul-many-implementations/#the-library-path).

## Dialects by name {#dialects-by-name}

[MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/) drew the ladder. These are the names on the rungs.

- TOSA is a short legal operator set. Edge compilers lower into it. [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/) is that use.
- StableHLO is the portable operator set from OpenXLA.
- `linalg` names a structured contraction while the shapes are still attached.
- `vector` is the SIMD step.
- `gpu` binds threads and blocks.
- `spirv` is the SPIR-V exit.
- `llvm` is the LLVM exit.

IREE inserts `flow`, `stream`, and `hal` between the import and those exits.

## The file you ship {#the-file-you-ship}

The runtime chapter describes load and launch. These are the files that load.

- An ONNX file, or ONNX Runtime's flatbuffer, loads in an ONNX Runtime session.
- A `.vmfb` loads in IREE's VM.
- A TensorRT engine loads in TensorRT's runtime.
- A LiteRT flatbuffer loads in the LiteRT interpreter.
- An ExecuTorch `.pte` loads in ExecuTorch.
- A TVM module loads in the TVM runtime.
- A GGUF file loads in GGML and llama.cpp. [Attention and the Shipped Model](/docs/ml-compilers/attention-and-the-shipped-model/) covers that path.

## Cases the toy graph hides {#cases-the-toy-graph-hides}

Chapter 26's model is a straight line of MatMul, Add, and ReLU. Exports in the wild also carry these.

- `If`, `Loop`, and `Scan`. The compiler lowers the body, or it leaves a call the runtime interprets.
- A custom operator. It needs a kernel or a plugin. Otherwise the load fails.
- `QuantizeLinear` and `DequantizeLinear` wrapped around a float operator. That pair is the quantized graph Chapter 20 consumes.
- A rank that stays unknown until runtime. Chapter 10's symbol is one unknown dimension. A fully dynamic rank is a stricter contract, and some backends reject it.

## Where training compilers live {#where-training-compilers-live}

XLA and `torch.compile` also compile the backward pass. A profile that includes a gradient step is that compiler's program. The forward kernels in this course are a separate program.

## What To Read Next

- [ONNX Runtime](/docs/ml-compilers/onnx-runtime/)
- [IREE](/docs/ml-compilers/iree/)
- [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/)
- [Attention and the Shipped Model](/docs/ml-compilers/attention-and-the-shipped-model/)

<div>
  <AdBanner />
</div>
