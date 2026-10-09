---
title: "What an AI Compiler Is"
description: "The traditional pipeline, the AI pipeline, the facts a tensor compiler carries, and the six questions every later chapter answers."
slug: /ml-compilers/what-an-ai-compiler-is/
hide_table_of_contents: true
displayed_sidebar: mlChapter11Sidebar
sidebar_position: 12
keywords:
  - what is an ai compiler
  - ml compiler pipeline
  - frontend middle end backend
  - tensor compiler
  - staged lowering
  - compiler and runtime
---

import AdBanner from '@site/src/components/AdBanner';

# What an AI Compiler Is

A traditional compiler lowers source to machine code. An AI compiler lowers a model graph to kernels, and it keeps shape, layout, and operator identity while it does that. This chapter is the map for every chapter after it.


## Traditional pipeline {#traditional-pipeline}

```text
source
  |
  v
IR
  |
  v
optimization
  |
  v
machine code
```

The source names variables and control flow. The IR is simpler than the source and richer than machine code. Passes rewrite the IR. The backend emits instructions for one ISA. [LLVM and IR](/docs/tracks/llvm-and-ir/) is that pipeline in detail.

## The AI pipeline {#the-ai-pipeline}

```text
model
  |
  v
graph
  |
  v
IR
  |
  v
optimization
  |
  v
lowering
  |
  v
hardware
```

The source is a model. The first IR is often the graph itself. Lowering is a sequence of representations, because a tensor contraction still has structure that machine instructions do not. [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm/) is the long form of why that sequence exists.

## Frontend, middle end, backend {#frontend-middle-end-backend}

The frontend imports a model and produces a graph with types and shapes. The middle end rewrites that graph and lowers it through intermediate dialects. The backend emits a kernel, a library call, or a target binary.

The names match a traditional compiler. The objects in each box are tensor programs.

## Facts a tensor compiler carries {#facts-a-tensor-compiler-carries}

While the program is still a tensor program, the IR carries:

- the operator, or the structured form that replaced it
- the shape, including symbols
- the element type
- the layout
- the axes that are parallel

A pass that needs one of those facts has to run before the lowering that consumes it. That is the whole argument for multiple levels.

## Goals {#goals}

The compiled program produces the same prediction, within a stated tolerance. It takes less time, or less memory, or it runs on another device. [Correctness Across Lowering](/docs/ml-compilers/correctness-across-lowering/) owns the first goal. [Measuring Inference](/docs/ml-compilers/measuring-inference/) owns the evidence for the others.

## The six questions {#the-six-questions}

Every later chapter answers these, in this order.

| Question | Ask |
|---|---|
| Meaning | What does this operation compute? |
| Representation | What facts are still written down? |
| Transformation | Which rewrite keeps the meaning? |
| Lowering | Which facts does this step consume? |
| Hardware | Which execution strategy fits this target? |
| Measurement | Does the result still match, and did the change help? |

If a lesson cannot say which question it is answering, it is a definition with nowhere to go.

## Compiler emits, runtime launches {#compiler-emits-runtime-launches}

The compiler writes the program: the kernels, the variants, and the guards. The runtime loads that program, checks the guards, picks a variant, and asks the driver to start it. [Compiler and Runtime](/docs/ml-compilers/compiler-and-runtime/) draws the split in full. The next chapter stays on the frontend's most common file format.

## What To Read Next

- [ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/)
- [The Stack Map](/docs/ml-compilers/the-stack-map/)
- [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm/)
- [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline/)

<div>
  <AdBanner />
</div>
