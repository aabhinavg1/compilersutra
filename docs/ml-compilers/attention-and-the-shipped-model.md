---
title: "Attention and the Shipped Model"
description: "Fused attention, the KV cache, paged serving, and the GGUF path on laptops and phones."
slug: /ml-compilers/attention-and-the-shipped-model/
hide_table_of_contents: true
displayed_sidebar: mlChapter32Sidebar
sidebar_position: 20
keywords:
  - fused attention
  - KV cache
  - paged attention
  - GGUF
  - GGML
  - llama.cpp
---

import AdBanner from '@site/src/components/AdBanner';

# Attention and the Shipped Model

[What an Operator Means](/docs/ml-compilers/what-an-operator-means/#attention-and-the-transformer) describes attention once. The compiler receives several operators: MatMuls, a scale, a softmax, and a mask. This chapter is what changes when that pattern is the model you ship.


## The score matrix {#the-score-matrix}

Attention builds a score between tokens, then a weighted sum of values. The score tensor grows with the square of the sequence length. Writing it out is a trip to memory and a trip back, for a value the next MatMul consumes immediately.

## Fusion keeps the tile {#fusion-keeps-the-tile}

A fused attention kernel computes a tile of scores, updates the running softmax, and accumulates the output row. The full score matrix is never stored. That is Chapter 15 applied to the softmax from Chapter 8: the reduction stays close to the arithmetic, and several kernel launches become one.

A profile often names that fused kernel directly. The contract is still the attention operator.

## The KV cache {#the-kv-cache}

The next token needs the keys and values of the tokens already seen. Recomputing them repeats the same MatMuls. The runtime stores those tensors and appends the new token's key and value. The compiled graph reads the cache as an input and writes the new rows as an output.

The cache is state between runs. It is not a weight. Weights stay frozen, as in Chapter 6. The cache grows with the sequence.

## Paging is a runtime {#paging-is-a-runtime}

A serving runtime can keep that cache in fixed-size pages so many requests share one pool of device memory. The allocator sits above the kernel. The compiler still sees a read of keys and values and a write of the new rows.

Choosing which requests share a step is the same kind of decision. It changes the batch. It does not replace the lowering.

## GGUF on the machine in front of you {#gguf-on-the-machine-in-front-of-you}

GGML, used by llama.cpp, stores a quantized model in a GGUF file and runs it on a laptop CPU, a laptop GPU, or a phone. The quantization format and the kernels belong to that runtime. The idea matches Chapter 20 and [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/): integer weights, a small runtime, and no Python on the device.

The compiler in that project is smaller than IREE or XLA. The file you ship is the GGUF.

## The forward graph is still the program {#the-forward-graph-is-still-the-program}

Each new token runs the frozen forward graph once. The model returns scores over the vocabulary. The decision in Chapter 4 picks a token from those scores. A training step that updates weights is still the other program, from Chapter 5.

## What To Read Next

- [The Stack Map](/docs/ml-compilers/the-stack-map/)
- [Edge and the NPU](/docs/ml-compilers/edge-and-the-npu/)
- [What an Operator Means](/docs/ml-compilers/what-an-operator-means/#attention-and-the-transformer)

<div>
  <AdBanner />
</div>
