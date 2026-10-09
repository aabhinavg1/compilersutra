---
title: "Inference Is the Computation"
description: "Frozen weights, the forward pass, and why an AI compiler is given a fixed graph even when a dimension is still a symbol."
slug: /ml-compilers/inference-is-the-computation/
hide_table_of_contents: true
displayed_sidebar: mlChapter6Sidebar
sidebar_position: 7
keywords:
  - inference
  - frozen weights
  - forward pass
  - training versus inference
  - fixed computation graph
  - dynamic batch size
---

import AdBanner from '@site/src/components/AdBanner';

# Inference Is the Computation

Training changes the model. Inference uses the model. The compiler in this track is aimed at the second sentence.


## Weights are frozen {#weights-are-frozen}

At inference time the assignment from training does not run. The weight tensors are loaded and then read. A kernel may read a weight millions of times. It does not write a new weight back.

That is the fact fusion and constant folding rely on. A weight is a constant input to the graph. [The Computation Graph](/docs/ml-compilers/the-computation-graph/) stores it that way.

## The forward pass is the computation {#the-forward-pass-is-the-computation}

The forward pass is the sequence of operators from the model's input to its score. MatMul, Add, ReLU, convolution, softmax: whatever the architecture listed, in an order that respects data dependence.

Hardware runs those operators, or kernels that implement several of them together. Hardware does not run the word "model". The rest of the track is the translation from the word to the kernels.

## Two workloads {#two-workloads}

Training and inference stress different parts of a system.

Training writes weights, stores activations for the backward program, and moves a large batch because the update wants many examples. Inference reads weights, can drop activations after the consumer has run, and often cares about one request's wait time.

A kernel that is a good training kernel can be a poor inference kernel, and the other way around. The compiler's goals in [What an AI Compiler Is](/docs/ml-compilers/what-an-ai-compiler-is/) are stated for the inference run unless a lesson says otherwise.

## A fixed graph and fixed weights {#a-fixed-graph-and-fixed-weights}

The compiler is given two stable objects: the operator graph, and the weight values. Passes rewrite the graph. They may fold a weight into another constant. They are given the graph as the program to compile.

This is why export formats exist. [ONNX and the Operator Graph](/docs/ml-compilers/onnx-and-the-operator-graph/) is one way to hand those two objects to a compiler that did not train the model.

## A dimension can still be a symbol {#a-dimension-can-still-be-a-symbol}

Fixed weights do not imply a fixed input shape. A service might compile a vision model whose batch size depends on how many requests arrived. The graph is fixed. The weight file is fixed. `batch` is a symbol until runtime.

[Shapes, Types, and Dynamic Dimensions](/docs/ml-compilers/shapes-types-and-dynamic-dimensions/) is the chapter for that symbol: guards, specialized variants, and what tiling is allowed to assume. The next chapter, [Tensors for Compilers](/docs/ml-compilers/tensors-for-compilers/), names the objects those shapes describe.

## What To Read Next

- [Tensors for Compilers](/docs/ml-compilers/tensors-for-compilers/)
- [Shapes, Types, and Dynamic Dimensions](/docs/ml-compilers/shapes-types-and-dynamic-dimensions/)
- [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline/)

<div>
  <AdBanner />
</div>
