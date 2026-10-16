---
title: "From Score to Action"
description: "A model returns numbers. A threshold turns a score into an action, and that decision sits outside the compiled graph."
slug: /ml-compilers/from-score-to-action/
hide_table_of_contents: true
displayed_sidebar: mlChapter4Sidebar
sidebar_position: 5
keywords:
  - model score
  - classification threshold
  - cost of a wrong action
  - inference decision
  - model output versus action
---

import AdBanner from '@site/src/components/AdBanner';

# From Score to Action

The compiled program ends at a number, or at a vector of numbers. The product decision is the next line of ordinary code. Keeping those two steps apart is what makes the compiler's correctness check well defined.


## The model returns numbers {#the-model-returns-numbers}

A classifier with two categories often returns one score. A value near 0 leans one way. A value near 1 leans the other. A classifier with four categories returns four scores. A regression model returns the number it was trained to estimate.

None of those outputs is the action. "Hold this message" is an action. `0.91` is a score.

## A threshold turns a score into an action {#a-threshold-turns-a-score-into-an-action}

The smallest decision rule is a comparison.

```text
if score >= 0.8:
    action = hold
else:
    action = deliver
```

The model computed `score`. The `if` is ordinary code. You can change the threshold without compiling the model again. You can compile the model without knowing which threshold the product will ship.

## The cost of a wrong action {#the-cost-of-a-wrong-action}

The two mistakes are different. Holding a real message annoys a person. Delivering a malicious message can be expensive. When the second mistake costs more, the threshold moves so that "hold" happens at a lower score.

That move is a product decision. It uses the same scores. A compiler pass that changes the score by a large amount will change which side of the threshold you land on. A pass that preserves the score, within the tolerance in [Correctness Across Lowering](/docs/ml-compilers/correctness-across-lowering/), leaves the decision rule alone.

## The decision sits outside the graph {#the-decision-sits-outside-the-graph}

Draw the boundary on purpose.

```text
input -> compiled model -> score
                              |
                              v
                    threshold in the application
                              |
                              v
                           action
```

The graph contains MatMul, Add, ReLU, and the rest. The threshold is a comparison in the application. Fusing the threshold into the kernel is possible later. The default split keeps the compiler honest: it is responsible for the score.

## The same ending in Chapter 26 {#the-same-ending-in-chapter-26}

The end-to-end chapter runs one small model down to a score and then applies this rule. If the lowered program and the reference disagree on the score, the bug is in the compiler. If they agree on the score and the action still looks wrong, the bug is in the threshold. [One Model, End to End](/docs/ml-compilers/one-model-end-to-end/) is that walk. [Training Writes the Weights](/docs/ml-compilers/training-writes-the-weights/) is how the score's weights got there.

## What To Read Next

- [Training Writes the Weights](/docs/ml-compilers/training-writes-the-weights/)
- [One Model, End to End](/docs/ml-compilers/one-model-end-to-end/)
- [Learning Types](/docs/ml-compilers/learning-types/)

<div>
  <AdBanner />
</div>
