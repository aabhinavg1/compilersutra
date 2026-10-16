---
title: "What an Operator Means"
description: "Dense layers, activations, convolution, attention, and the split between an operator contract and one loop implementation."
slug: /ml-compilers/what-an-operator-means/
hide_table_of_contents: true
displayed_sidebar: mlChapter8Sidebar
sidebar_position: 9
keywords:
  - neural network operators
  - matmul contract
  - relu softmax convolution
  - batchnorm inference
  - operator semantics
  - elementwise reshape transpose
---

import AdBanner from '@site/src/components/AdBanner';

# What an Operator Means

An operator is a contract: inputs, attributes, and an output. A triple loop is one way to meet a contract. The compiler's freedom starts at that split.


## Weighted sum and a dense layer {#weighted-sum-and-a-dense-layer}

One unit computes `y = w1*x1 + w2*x2 + b`. A dense layer computes that for many outputs at once, which is a matrix product plus a bias. The weights and the bias are parameters from training. The inputs are activations from the previous layer, or the model's input.

## Activations {#activations}

ReLU replaces a negative number with zero and leaves a positive number alone. Sigmoid and tanh squash a number into a bounded range. Each is an elementwise function. Elementwise means each output element depends on one input element, which is why these ops fuse onto the producer that just computed that element.

## Softmax {#softmax}

Softmax turns a vector of scores into a vector that sums to one. The usual stable form subtracts the max, exponentiates, sums, and divides by that sum.

The sum is a reduction. Every output element depends on every input element in the vector. That dependence is why a fused softmax kernel has a different shape from a fused ReLU, and why a different association of the sum can change bits. [Correctness Across Lowering](/docs/ml-compilers/correctness-across-lowering/) returns to those bits.

## Convolution and pooling {#convolution-and-pooling}

A convolution slides a small weight tensor across a spatial input and writes a weighted sum at each position. Kernel size, stride, and padding are attributes. They are part of the contract, and they are integers on the operator.

Pooling reduces a neighborhood to one value, often the max or the average. It is a local reduction. Both operators care about layout, because "the next pixel" is an address computation.

## Normalization {#normalization}

A normalization computes a mean and a variance over some axes, rescales the values, and then applies a learned scale and shift.

At inference, BatchNorm's mean and variance are constants computed during training. The scale and shift are constants too. Those four constants fold into the previous MatMul or convolution as a change of that layer's weights. [Compiler Transformations](/docs/ml-compilers/compiler-transformations/) includes that fold, because it deletes an entire operator from the inference graph.

## Attention and the transformer {#attention-and-the-transformer}

Attention, at this altitude, is a comparison of vectors. Queries and keys produce scores. Softmax turns the scores into weights. Those weights mix the values. A transformer block stacks attention with a small dense network, plus the normalizations around them.

The compiler-facing inventory is the operators inside that story: MatMul, softmax, Add, layer norm. The name "transformer" is the architecture. The graph is the program.

## Embeddings {#embeddings}

An embedding maps an integer id to a vector. The vectors are a weight table. The forward op is a gather. The table can be large, so the gather is often limited by memory traffic. It is still a contract with one index input and one vector output.

## Elementwise, reshape, transpose, reduce {#elementwise-reshape-transpose-reduce}

Four families show up in almost every graph, and fusion and layout passes exist because of them.

Add and Mul are elementwise. They broadcast when the shapes differ in a way the rule allows. Reshape and transpose keep the values and change the index map. A reduce, such as sum or max, collapses one or more axes.

Reshape and transpose are cheap as meaning and costly when they become copies. A good layout pass sinks them into the next kernel so the copy never runs.

## MatMul as a contract {#matmul-as-a-contract}

MatMul reads two tensors and writes one. For matrices, the contract includes the shape rule `[M, K]` by `[K, N]` produces `[M, N]`. The `K` axes match, or the graph is illegal.

The contract does not say "three nested loops". It does not say "call a BLAS library". Both can satisfy it. [One MatMul, Many Implementations](/docs/ml-compilers/one-matmul-many-implementations/) is the catalog.

## The triple loop {#the-triple-loop}

This is one implementation:

```text
for i in 0..M:
  for j in 0..N:
    acc = 0
    for k in 0..K:
      acc += A[i, k] * B[k, j]
    C[i, j] = acc
```

It matches the contract for a contiguous row-major pair of matrices, in real arithmetic. A compiler may emit it, tile it, vectorize it, or replace it with a library call. The next chapter puts operators like this one into a graph.

## What To Read Next

- [The Computation Graph](/docs/ml-compilers/the-computation-graph/)
- [One MatMul, Many Implementations](/docs/ml-compilers/one-matmul-many-implementations/)
- [Fusion: MatMul, Add, ReLU](/docs/ml-compilers/fusion-matmul-add-relu/)

<div>
  <AdBanner />
</div>
