---
title: "Shapes, Types, and Dynamic Dimensions"
description: "Shape and type inference, broadcasting, static and symbolic shapes, constraints, guards, and compiled variants."
slug: /ml-compilers/shapes-types-and-dynamic-dimensions/
hide_table_of_contents: true
displayed_sidebar: mlChapter10Sidebar
sidebar_position: 11
keywords:
  - shape inference
  - type inference
  - broadcasting
  - dynamic shapes
  - symbolic dimensions
  - kernel variants
---

import AdBanner from '@site/src/components/AdBanner';

# Shapes, Types, and Dynamic Dimensions

Shape is why a compiler keeps tensor information around. Tiling, memory planning, and code generation read whatever is known. A dimension that is still a symbol is a real compile-time problem, and it has a runtime answer.


## A MatMul shape rule {#a-matmul-shape-rule}

```text
MatMul
A: [M, K]
B: [K, N]
      |
      v
C: [M, N]
```

The rule is local. It reads the input shapes and writes the output shape. Every later pass that asks "how big is C" is reading the result of rules like this one.

## Shape inference {#shape-inference}

Shape inference walks the graph in a legal order and applies each operator's rule. After the walk, intermediates have shapes, or they have shapes with symbols still in them. A fusion pass uses those shapes to decide whether the intermediate fits in registers. A memory planner uses them to size buffers.

## Type inference {#type-inference}

Element type travels with the value. If `A` and `B` are FP16, the MatMul's output type is part of the contract, often FP16 or FP32 depending on the accumulation rule you stated. A pass that changes the dtype has to state that rule. Silent mixes are how a graph becomes illegal halfway through a pipeline.

## Broadcasting {#broadcasting}

A bias of shape `[N]` adds to a result of shape `[M, N]` when the rule says the missing axis repeats. The output shape is `[M, N]`. The bias is not stored `M` times in the file. The kernel repeats it.

Broadcasting is a contract, like MatMul's `K` match. An Add whose shapes disagree with the rule is an illegal graph, and the front end should reject it before scheduling.

## Static shapes {#static-shapes}

`[1, 224, 224, 3]` is fully known when the compiler runs. Every trip count, every buffer size, and every tile boundary can be a constant in the generated code. Specialization in [Choosing a Schedule](/docs/ml-compilers/choosing-a-schedule/) is the extreme form: the kernel is compiled for these exact numbers.

## Symbolic shapes {#symbolic-shapes}

`[batch, height, width, channels]` leaves `batch` as a symbol. The compiler can still check that two uses of `batch` are the same symbol. It cannot unroll a loop `batch` times, and it cannot size a buffer as a constant unless it picks a value and guards it.

The question to ask on purpose: what is the generated program allowed to assume if `batch` is unknown at compile time?

## Constraints {#constraints}

`K` on the left of a MatMul matches `K` on the right, or the graph is illegal. A reshape's element count matches the surrounding value, or the graph is illegal. Constraints are the predicates inference either proves or leaves for a guard.

## Compile time {#compile-time}

```text
shape information
      |
      v
optimization
      |
      v
tiling
      |
      v
memory planning
      |
      v
code generation
```

Each of those steps reads the shapes that are already known and leaves the symbols for later. Inventing a concrete `batch` in the middle of this chain, with no guard, compiles a program that is right for one arrival and wrong for the next.

## Guards {#guards}

A guard is a runtime check. "This kernel was compiled for `batch = 1`" becomes a comparison when the request arrives. If the comparison holds, the runtime launches that kernel. If it fails, the runtime selects another variant or compiles one.

[Compiler and Runtime](/docs/ml-compilers/compiler-and-runtime/) is where the check actually runs. The compiler's job is to emit the check with the variant.

## Variants {#variants}

One MatMul contract can become several compiled programs: one for `batch = 1`, one for a small set of batch sizes, one generic program whose loops use the runtime value. Dispatch picks among them. The meaning stays the MatMul. The implementations are specialized. That split is [Choosing a Schedule](/docs/ml-compilers/choosing-a-schedule/).

## What To Read Next

- [What an AI Compiler Is](/docs/ml-compilers/what-an-ai-compiler-is/)
- [Choosing a Schedule](/docs/ml-compilers/choosing-a-schedule/)
- [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline/)

<div>
  <AdBanner />
</div>
