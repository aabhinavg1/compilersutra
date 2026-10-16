---
title: "ONNX and the Operator Graph"
description: "ONNX as a versioned operator graph, opsets, graph passes, execution providers, and why a missing kernel becomes a new provider."
slug: /ml-compilers/onnx-and-the-operator-graph/
hide_table_of_contents: true
displayed_sidebar: mlChapter12Sidebar
sidebar_position: 13
keywords:
  - ONNX
  - ONNX opset
  - ONNX Runtime execution provider
  - operator graph interchange
  - graph fallback
  - model export format
---

import AdBanner from '@site/src/components/AdBanner';

# ONNX and the Operator Graph

ONNX is a file of named operators and tensor edges. It is the interchange a frontend reads. It is a compiler stack only after a runtime or a lowering pipeline is attached, and those two attachments behave differently.


## A versioned operator graph {#a-versioned-operator-graph}

An ONNX model lists inputs, outputs, initializers (the constants, including weights), and nodes. Each node names an operator and points at value edges. PyTorch and TensorFlow can both write this file. A second tool can read it without importing the training framework.

The file has no loop nest, no tile size, and no thread binding. Those are implementation choices. The file stopped at the contract.

## Opsets and versions {#opsets-and-versions}

Operators are versioned as a set. An exporter may emit `AveragePool` at one opset. A runtime may implement that operator at another. When the sets disagree, the load fails or a converter rewrites the node into operators both sides share. Version skew is a frontend problem, and it shows up before any kernel runs.

## Graph passes {#graph-passes}

A runtime can rewrite the ONNX graph in place. Constant folding, a small set of fusions, and a layout insert are typical. These passes edit nodes and edges. They do not invent a schedule. After they finish, each remaining node still needs an implementation.

## Execution providers {#execution-providers}

ONNX Runtime partitions the graph across execution providers. A CUDA provider, a TensorRT provider, an OpenVINO provider, or a CPU provider claims the subgraph it can run. The partition is a compile step in the wide sense: the runtime chooses who executes which nodes.

## The generic fallback {#the-generic-fallback}

A node the chosen provider does not implement can fall back to a generic runner, often on the CPU. The model still loads. The score can still match. The partition is now part of the performance story, because a value may cross devices for one unsupported operator. [When the Result Is Wrong](/docs/ml-compilers/when-the-result-is-wrong/) tells you to look at this split when a model is correct and unexpectedly slow, and also when a fallback uses a different numeric path.

## A new device is a new provider {#a-new-device-is-a-new-provider}

Supporting another chip, in this design, means writing another provider and the kernels behind it. Fusion written inside one provider stays in that provider. There is no shared lowering from Conv to loops to an ISA that the next provider inherits.

That design ships inference without a progressive IR. It also repeats kernel work per device. [MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/) is the alternative: one pipeline, several exits, with shape and layout still attached between them.

## The operator contract {#the-operator-contract}

ONNX names the operation and the tensor edges. `MatMul` in that file means the contract from [What an Operator Means](/docs/ml-compilers/what-an-operator-means/). A later compiler decides the loops, the library call, or the fused kernel. Jumping from the ONNX node straight into LLVM IR drops the tensor, and the graph passes no longer have a place to run.

## What To Read Next

- [ONNX Runtime](/docs/ml-compilers/onnx-runtime/)
- [MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/)
- [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline/)
- [What an AI Compiler Is](/docs/ml-compilers/what-an-ai-compiler-is/)

<div>
  <AdBanner />
</div>
