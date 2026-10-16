---
title: "Tensors for Compilers"
description: "Scalar, vector, matrix, tensor, layout, strides, and the dtypes a compiler stores. Quantization is a later decision."
slug: /ml-compilers/tensors-for-compilers/
hide_table_of_contents: true
displayed_sidebar: mlChapter7Sidebar
sidebar_position: 8
keywords:
  - tensor shape
  - tensor rank
  - NHWC NCHW
  - tensor strides
  - FP32 FP16 BF16 INT8
  - tensor layout
---

import AdBanner from '@site/src/components/AdBanner';

# Tensors for Compilers

A tensor is the value an operator reads and writes. Layout and dtype are facts about how that value sits in memory. They are part of the program the compiler schedules.


## Scalar, vector, matrix, tensor {#scalar-vector-matrix-tensor}

A scalar is one number. A vector is a list of numbers. A matrix is a table of numbers. A tensor is the same idea with as many axes as the operator needs.

An image batch is a tensor. A weight matrix is a tensor. A bias vector is a tensor. The compiler's type system treats them as one family so a pass can talk about shape, layout, and element type without a special case per rank.

## Shape and rank {#shape-and-rank}

Rank is the number of axes. Shape is the length of each axis. A matrix of 128 rows and 64 columns has rank 2 and shape `[128, 64]`. A single image stored as height, width, and channels might have shape `[224, 224, 3]` and rank 3.

Rank tells you how many index loops a lowering might introduce. Shape tells you the trip counts, when the trip counts are known.

## Memory layout {#memory-layout}

Layout is the order of axes in memory. Row-major stores a matrix one row at a time. For images, NCHW stores one channel plane at a time. NHWC stores the channels of one pixel together.

The values can be identical and the addresses different. A convolution kernel written for NCHW reads a different address pattern than a kernel written for NHWC. [Choosing a Schedule](/docs/ml-compilers/choosing-a-schedule/) and [Memory and Data Movement](/docs/ml-compilers/memory-and-data-movement/) are where that pattern becomes a performance choice. The operator's meaning often leaves the layout unspecified. The implementation has to pick one.

## Strides and contiguity {#strides-and-contiguity}

A stride is the number of elements you skip to move one step along an axis. In a contiguous row-major matrix of shape `[M, N]`, the row stride is `N` and the column stride is `1`.

A transpose can be a new view with the strides swapped, and no copy. A kernel that assumes contiguity will read the wrong neighbors if you hand it that view. Layout rewrites in [Compiler Transformations](/docs/ml-compilers/compiler-transformations/) exist so the kernel and the strides agree.

## dtypes as storage {#dtypes-as-storage}

The dtype is the encoding of one element.

| dtype | What the bits hold |
|---|---|
| FP32 | A 32-bit floating-point value |
| FP16 | A 16-bit floating-point value, with a smaller exponent range |
| BF16 | A 16-bit floating-point value that keeps FP32's exponent range and spends fewer bits on the fraction |
| INT8 | An 8-bit integer |

Storage is the topic of this section. Mapping a floating-point model onto INT8, with a scale and a zero point, is [Quantization](/docs/ml-compilers/quantization/).

## Where dtype and layout are consumed {#where-dtype-and-layout-are-consumed}

Dialects keep both facts until a pass uses them. A layout rewrite reads the layout. A vectorized kernel reads the dtype, because the vector width is a count of elements of that dtype. An INT8 accelerator path reads the dtype and refuses the graph until quantization has produced integers.

[MLIR and Three Exits](/docs/ml-compilers/mlir-and-three-exits/) is why those facts survive more than one pass. The next page, [What an Operator Means](/docs/ml-compilers/what-an-operator-means/), is the contract those tensors flow through.

## What To Read Next

- [What an Operator Means](/docs/ml-compilers/what-an-operator-means/)
- [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm/)
- [Quantization](/docs/ml-compilers/quantization/)

<div>
  <AdBanner />
</div>
