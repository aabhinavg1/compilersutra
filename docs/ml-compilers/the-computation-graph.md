---
title: "The Computation Graph"
description: "Nodes, edges, weights, attributes, producers, a legal order, and the export that turns a framework model into the program a compiler reads."
slug: /ml-compilers/the-computation-graph/
hide_table_of_contents: true
displayed_sidebar: mlChapter9Sidebar
sidebar_position: 10
keywords:
  - computation graph
  - producers and consumers
  - topological order
  - operator attributes
  - model export
  - graph as a program
---

import AdBanner from '@site/src/components/AdBanner';

# The Computation Graph

The graph is the program. Source code in Python is how a person wrote the model. The graph is what a pass rewrites.


## Nodes and edges {#nodes-and-edges}

A node is an operator, or a constant, or an input. An edge is a value flowing from the node that produces it to the node that reads it.

```text
input x ----+
            +--> MatMul --> y --> Add --> z --> ReLU --> o
weight W ---+                 ^
                              |
bias b -----------------------+
```

`y`, `z`, and `o` are values. They occupy memory if a later kernel needs them to, and they occupy nothing but a register if fusion keeps them on chip. The graph records the dependence either way.

## Inputs, weights, and outputs {#inputs-weights-and-outputs}

Inputs arrive when the compiled program is launched. Weights are constants loaded with the model. Outputs are the values the caller asked to keep. Everything else is an intermediate.

A constant can be folded. An input cannot, because the compiler does not know the number yet. Marking weights as constants is what lets [Compiler Transformations](/docs/ml-compilers/compiler-transformations/) precompute a scale or a transposed packing of `W`.

## Attributes {#attributes}

Kernel size, stride, padding, and the axis of a reduction are attributes. They are integers or enums stored on the operator. They are part of the contract.

A pass that changes a stride has changed the operator. A pass that changes a weight tensor has changed a constant. The two edits are checked differently, because one changes control of the address math and the other changes a numeric input.

## Producers and consumers {#producers-and-consumers}

Each value has one producer in the usual graph, and zero or more consumers. Fusion asks a local question: can the consumer run inside the producer's kernel before the value is stored? Dead code asks another: does any consumer remain?

[Memory and Data Movement](/docs/ml-compilers/memory-and-data-movement/) asks a third: after the last consumer has run, the buffer can be reused.

## A legal execution order {#a-legal-execution-order}

A legal order runs a node after every value it reads has a producer that already ran. That is a topological order of the graph. Many orders are legal. Scheduling picks one, and then picks how each node runs. The order of independent nodes is a freedom. The order of a value and its consumer is a constraint.

## The graph is the program {#the-graph-is-the-program}

Give a compiler the graph, the shapes, the dtypes, and the constants, and it has a program. Names from the framework are comments. A pass is a function from a legal graph to another legal graph with the same outputs, inside the tolerance you accepted.

## An export produces the graph {#an-export-produces-the-graph}

Frameworks store models as Python, or as their own graph. An export walks that representation and writes a graph another compiler can read. ONNX is one such file: a versioned list of operators, edges, and constants. [ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/) is that file. [Inside torch.compile](/docs/ml-compilers/inside-torch-compile/) is a different capture path that builds a graph by tracing a Python function.

## What To Read Next

- [Shapes, Types, and Dynamic Dimensions](/docs/ml-compilers/shapes-types-and-dynamic-dimensions/)
- [ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/)
- [Inside torch.compile](/docs/ml-compilers/inside-torch-compile/)

<div>
  <AdBanner />
</div>
