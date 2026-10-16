---
title: "IREE"
description: "How IREE imports Torch, StableHLO, and TOSA, then lowers through flow, stream, and HAL to a vmfb."
slug: /ml-compilers/iree/
hide_table_of_contents: true
displayed_sidebar: mlChapter30Sidebar
sidebar_position: 18
keywords:
  - IREE
  - IREE flow dialect
  - IREE HAL
  - vmfb
  - StableHLO
  - TOSA
---

import AdBanner from '@site/src/components/AdBanner';

# IREE

IREE is an MLIR compiler and a runtime. It takes a graph, lowers it through its own dialects, and emits a module. That module is a concrete answer to the runtime in Chapter 23.


## What it imports {#what-it-imports}

The front ends accept Torch, StableHLO, and TOSA. Torch comes from a PyTorch export. StableHLO is the OpenXLA operator set. TOSA is the short operator set used on the edge. All three become one internal graph. The importer is the frontend from [What an AI Compiler Is](/docs/ml-compilers/what-an-ai-compiler-is/).

## Flow {#flow}

The flow dialect forms dispatch regions. A dispatch region is the group of operators that will become one kernel. Fusion from Chapter 15 happens here. MatMul, Add, and ReLU can share a region when the values they produce stay local. Operators that cannot share a region stay separate dispatches.

Work is also divided here. The region carries the tile of the iteration space that one invocation will own.

## Stream {#stream}

The stream dialect places those dispatches in order. It inserts copies between host and device, and it records which dispatches may overlap. Chapter 22.7, the decision to keep intermediate tensors on the device, is a stream decision. Two dispatches that share a tensor wait. Two that do not can run together.

## HAL {#hal}

HAL is the device layer. A command buffer records launches. An executable is the kernel binary for one backend. The stream above HAL can target another backend without a rewrite of the flow graph.

## The VM and the vmfb {#the-vm-and-the-vmfb}

IREE emits a VM bytecode module, stored as a `.vmfb` file. The runtime interprets that bytecode and submits the HAL commands. The kernels travel inside the module as executables. The file you ship is the `.vmfb`, not the Python model.

## The backends {#the-backends}

- `llvm-cpu` is the LLVM exit. The CPU program comes out of LLVM.
- `vulkan-spirv` is the SPIR-V exit. Vulkan loads the result.
- `cuda` and `rocm` are GPU backends with their own device code.
- A reference backend runs on the host so a numerical check from Chapter 18 has a place to land when no GPU is present.

Each backend is a finished compilation. That is the rule in [MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/).

## Where the chapters land {#where-the-chapters-land}

Import holds the graph and the shapes from Chapters 9 and 10. Flow holds fusion and layout. Stream holds the host and device copies. A HAL executable is the kernel and the launch. The VM is the runtime that loads the module and dispatches work.

[Introduction to MLIR](/docs/MLIR/intro/) is the dialect vocabulary. This page is one compiler that uses that vocabulary from import to launch.

## What To Read Next

- [The Stack Map](/docs/ml-compilers/the-stack-map/)
- [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/)
- [MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/)

<div>
  <AdBanner />
</div>
