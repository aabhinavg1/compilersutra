---
title: "MLIR and Three Exits"
description: "Why dialects exist, the ladder from tensor ops to loops, and the three exits: LLVM, SPIR-V, and a vendor API."
slug: /ml-compilers/mlir-and-three-exits/
hide_table_of_contents: true
displayed_sidebar: mlChapter13Sidebar
sidebar_position: 14
keywords:
  - MLIR dialects
  - LLVM exit
  - SPIR-V
  - vendor library backend
  - staged lowering
  - multi level IR
---

import AdBanner from '@site/src/components/AdBanner';

# MLIR and Three Exits

MLIR is infrastructure for several representations in one compiler. LLVM is one exit from that infrastructure. A GPU binary format and a vendor library call are exits too. Each one can be a finished compilation.


## Why dialects exist {#why-dialects-exist}

A dialect is a family of operations and types aimed at one level of the program. Tensor ops say what the contraction is. Loop ops say the trip counts. A GPU dialect says which loops are thread dimensions. The LLVM dialect says which instruction the backend will lower further.

One dialect for all of that would force every pass to ignore facts it does not understand, or to run before those facts exist. Separate dialects let a pass declare the level it reads.

## The dialect ladder {#the-dialect-ladder}

A typical walk, named so you can look for it in a dump:

```text
ONNX or tensor ops
        |
        v
structured tensor ops
        |
        v
loops
        |
        v
GPU dialect, or the LLVM dialect
```

Importers such as the ONNX and PyTorch front ends land on the top rung. [Introduction to MLIR](/docs/MLIR/intro/) is the longer introduction to how a dialect is defined. This page is the rung diagram those definitions sit on.

## SSA, blocks, regions {#ssa-blocks-regions}

Values in these dialects are usually in static single assignment form: one definition, many uses. A basic block is a straight-line sequence. A region is a nested container, which is how a dialect holds a loop body or a function without flattening it too early.

You need the vocabulary so a dump is readable. You do not need to write a dialect to follow the rest of the track.

## Shape and layout kept {#shape-and-layout-kept}

On the upper rungs, a value still has a shape and a layout. A fusion pass reads them. A buffer planner reads them. The lowering into loops is the step that replaces "a tensor of this shape" with "index variables and an address". After that step, a pass that wanted the tensor name is too late. [Lowering](/docs/ml-compilers/lowering/) is that consumption, one fact at a time.

## Exit 1: LLVM {#exit-1-llvm}

The LLVM dialect is the last MLIR level when the target is an LLVM backend: a CPU, or a GPU path LLVM already lowers, such as the AMD GPU path dumped in [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack/). LLVM then schedules instructions, allocates registers, and emits the ISA. It receives a program whose algorithm, tile, and layout were chosen above it.

## Exit 2: SPIR-V {#exit-2-spir-v}

SPIR-V is a binary IR for GPU-style devices. A pipeline can lower a GPU dialect to SPIR-V and stop. The device driver consumes SPIR-V. That pipeline has a compiled artifact. It does not need an LLVM module to be finished.

## Exit 3: vendor API {#exit-3-vendor-api}

A backend can emit a call to a vendor library or a vendor engine. The "code" is the call, plus the arguments: pointers, shapes, and the algorithm the library selected. cuBLAS-style calls and TensorRT-style engines are this exit. [One MatMul, Many Implementations](/docs/ml-compilers/one-matmul-many-implementations/) shows it beside the generated-kernel path.

## Each exit is a finished compilation {#each-exit-is-a-finished-compilation}

```text
                 MLIR
                   |
          +--------+---------+
          |        |         |
          v        v         v
        LLVM     SPIR-V   vendor API
          |        |         |
          v        v         v
     CPU / LLVM    GPU     accelerator
        GPU
```

LLVM is the exit for LLVM backends. SPIR-V is the exit for that GPU path. A vendor API is the exit when the implementation already exists as a library. A stack that uses one of them has completed lowering for that target.

## What To Read Next

- [One MatMul, Many Implementations](/docs/ml-compilers/one-matmul-many-implementations/)
- [Introduction to MLIR](/docs/MLIR/intro/)
- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack/)

<div>
  <AdBanner />
</div>
