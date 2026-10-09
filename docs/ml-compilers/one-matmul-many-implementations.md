---
title: "One MatMul, Many Implementations"
description: "Follow one MatMul from an ONNX contract through structured ops, tiles, loops, a CPU kernel, a GPU kernel, a library call, and a fused kernel."
slug: /ml-compilers/one-matmul-many-implementations/
hide_table_of_contents: true
displayed_sidebar: mlChapter14Sidebar
sidebar_position: 15
keywords:
  - matmul lowering
  - library call versus generated kernel
  - GPU matmul mapping
  - structured matmul
  - vendor BLAS
  - kernel generation
---

import AdBanner from '@site/src/components/AdBanner';

# One MatMul, Many Implementations

Take one operator and walk it until the walk splits. The contract stays a MatMul. The artifacts are a CPU kernel, a GPU kernel, a library call, or one kernel fused with the ops that follow.


## The ONNX contract {#the-onnx-contract}

The file says `MatMul`, names two inputs and one output, and carries shapes. That is the whole frontend fact. [ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/) is why the file stops there.

## Structured MatMul {#structured-matmul}

The next representation still says "contraction" and still carries `M`, `N`, and `K`. Indexing maps are explicit enough for a pass to see which axes are parallel and which axis is the reduction. The operator name from ONNX can already be gone. The tensor facts are still there. This is the rung [MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/) called structured tensor ops.

## A tiled form {#a-tiled-form}

Tiling partitions `M`, `N`, and `K` into blocks. One block is the working set a kernel tries to keep close to the arithmetic. The tile sizes are a schedule choice. [Choosing a Schedule](/docs/ml-compilers/choosing-a-schedule/) owns how 16, 32, or 64 gets picked. This page only records that a tiled form is still the same MatMul.

## A loop nest {#a-loop-nest}

Lowering the structured op produces loops. The contraction is now trip counts and an accumulator. Shape is no longer a type on the value. It is the bounds of those loops, plus the address math. [Lowering](/docs/ml-compilers/lowering/) is the general rule this step is an instance of.

## A vectorized CPU kernel {#a-vectorized-cpu-kernel}

On a CPU the inner loop becomes vector instructions, the tile respects the cache, and the result is a kernel the runtime can call. The exit is LLVM if that is the backend you chose. The meaning is still `C = A @ B`.

## The GPU path {#the-gpu-path}

The same structured MatMul can lower to a GPU dialect. Parallel axes become thread and block dimensions. The reduction axis becomes a loop inside the kernel, with a strategy for combining partial sums. The artifact is a GPU kernel. [Devices and Mapping](/docs/ml-compilers/devices-and-mapping/) names the hardware words. [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack/) shows one real dump of a later stage of this kind of path.

## The library path {#the-library-path}

The compiler emits a call. The callee is a BLAS library or a vendor MatMul kernel. The compiler's generated code is the call sequence and the layout conversion around it, if the library demands a layout the graph did not have.

## The fused path {#the-fused-path}

If Add and ReLU consume the MatMul, the compiler can keep the accumulator and apply both before the store. That is one kernel. [Fusion: MatMul, Add, ReLU](/docs/ml-compilers/fusion-matmul-add-relu/) is the worked case. A library call that returns the MatMul to memory makes that fusion someone else's problem, or impossible.

## When the library call is the result {#when-the-library-call-is-the-result}

The library call is the compiled result when the shape, the layout, and the operator are ones that library was built to run. The vendor has already spent the schedule work. Emitting the call reuses it.

## When the generated kernel is the result {#when-the-generated-kernel-is-the-result}

The generated kernel is the compiled result when the shape is unusual, the layout is specialized, the hardware has an instruction the library does not use, the workload is small enough that a separate launch dominates, or the following operators can share the result in registers. Those are engineering conditions. [Choosing a Schedule](/docs/ml-compilers/choosing-a-schedule/) is how a cost model or a measurement picks between them.

## What To Read Next

- [Fusion: MatMul, Add, ReLU](/docs/ml-compilers/fusion-matmul-add-relu/)
- [Lowering](/docs/ml-compilers/lowering/)
- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack/)

<div>
  <AdBanner />
</div>
