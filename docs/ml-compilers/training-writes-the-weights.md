---
title: "Training Writes the Weights"
description: "Loss, a gradient step, the forward and backward programs, and the batch dimension the compiler meets again as a symbol."
slug: /ml-compilers/training-writes-the-weights/
hide_table_of_contents: true
displayed_sidebar: mlChapter5Sidebar
sidebar_position: 6
keywords:
  - training loop
  - loss function
  - gradient descent
  - forward and backward pass
  - batch dimension
  - learned weights
---

import AdBanner from '@site/src/components/AdBanner';

# Training Writes the Weights

Training is the process that fills in the numbers. This track compiles the program that uses those numbers. You need one clear picture of the write, including the second program that training builds and this book leaves alone.


## Data and labels {#data-and-labels}

A supervised update reads an input and the output that input was supposed to produce. The input becomes a tensor. The label becomes a tensor. The model's current parameters are the third ingredient. Change the parameters and the same input produces a different output.

## Loss {#loss}

The loss is a number that measures the gap between the model's output and the label. A smaller loss means a closer match on the examples in this step. The loss is itself a computation: it reads the prediction and the label and reduces them to one value.

That computation is a graph too. Training compilers lower it. This track's inference compilers see the prediction graph, and they see the loss only when you are studying the training stack on purpose.

## Gradient descent {#gradient-descent}

One picture is enough. The gradient is the direction in which each weight nudges the loss. Subtract a small step along that direction and the loss on this batch tends to fall.

```text
weights = weights - step_size * gradient
```

The step size and the exact optimizer are training choices. The compiler-facing fact is the assignment. After enough assignments, the weights are a file of numbers.

## Training writes the weights {#training-writes-the-weights}

The output of training, for this track, is a set of constants. Architecture stayed as you wrote it. Parameters changed. Save the parameters and you can run the forward function without the dataset.

Inference loads those constants and does not perform the assignment above. [Inference Is the Computation](/docs/ml-compilers/inference-is-the-computation/) is that run.

## Forward and backward {#forward-and-backward}

The forward program reads inputs and weights and produces the prediction. The backward program reads the loss and produces a gradient for each weight.

They are two programs. The backward program is larger, because each forward operation contributes a gradient operation. A training compiler lowers both. The lessons from Chapter 11 onward compile the forward program. When a sentence in those chapters says "the model", it means the forward function with its weights.

## A batch {#a-batch}

A batch is many examples stacked into one tensor. One image might have shape `[1, 224, 224, 3]`. A batch of eight has shape `[8, 224, 224, 3]`. The leading dimension counts examples that share one launch.

That dimension is why later graphs say `batch` instead of a fixed integer. [Shapes, Types, and Dynamic Dimensions](/docs/ml-compilers/shapes-types-and-dynamic-dimensions/) is where a compiler treats `batch` as a symbol. The symbol starts here, as "how many examples are in this run".

## What To Read Next

- [Inference Is the Computation](/docs/ml-compilers/inference-is-the-computation/)
- [Shapes, Types, and Dynamic Dimensions](/docs/ml-compilers/shapes-types-and-dynamic-dimensions/)
- [From Score to Action](/docs/ml-compilers/from-score-to-action/)

<div>
  <AdBanner />
</div>
