---
title: "Learning Types"
description: "Supervised, unsupervised, self-supervised, and reinforcement learning, and the frozen forward model an AI compiler actually compiles."
slug: /ml-compilers/learning-types/
hide_table_of_contents: true
displayed_sidebar: mlChapter3Sidebar
sidebar_position: 4
keywords:
  - supervised learning
  - unsupervised learning
  - self-supervised learning
  - reinforcement learning
  - classification and regression
  - frozen model inference
---

import AdBanner from '@site/src/components/AdBanner';

# Learning Types

The way a model is trained changes the signal that updates the weights. The compiler later sees the forward computation those weights sit inside. This chapter is the map of those signals, kept short on purpose.


## Supervised learning {#supervised-learning}

Each example arrives as an input paired with the output you wanted.

```text
input + intended output
          |
          v
       training
```

Image classification, spam detection, and a price prediction are the same pattern. The input differs. The intended output differs. The pairing is the definition.

## Classification and regression {#classification-and-regression}

Classification asks for a category. A picture goes to "cat" or "dog". A message goes to "spam" or "not spam". Several categories, such as cat, dog, horse, and bird, are still classification. The model usually returns a score per category. Chapter 4 turns the scores into the category.

Regression asks for a number. A house goes to a price. A sensor goes to a temperature. The compiler sees a numeric tensor either way. The name of the task does not change the MatMul.

## Unsupervised learning {#unsupervised-learning}

The examples have inputs and no attached answer. The procedure looks for structure: groups of similar rows, or a shorter set of directions that still describe the rows.

Clustering is the version that assigns each row to a group. The result can still be a function you run on a new row. When that function is a fixed numeric graph, it is compiler input.

## Self-supervised learning {#self-supervised-learning}

The data supplies its own target. Hide part of an input and ask the model to recover it. For text, the usual form is next-token prediction: the preceding tokens are the input, and the following token is the target the data already contained.

The training signal was constructed. The artifact you ship is still a model with weights. Token by token, inference is a forward computation a compiler can lower.

## Reinforcement learning {#reinforcement-learning}

The loop is a situation, an action, an environment, and a reward.

```text
state -> action -> environment -> reward -> update
```

The update uses the reward. There is no label sitting next to the state in the supervised sense. A deployed policy can still be a network that maps a state to scores over actions. Compiling that network is the same problem as compiling a classifier. The training loop around it is a different system.

## The frozen forward model {#the-frozen-forward-model}

| Type | Signal | What you can compile afterward |
|---|---|---|
| Supervised | Input paired with an intended output | The forward function |
| Unsupervised | The inputs alone | A fixed scoring or grouping function, when one was produced |
| Self-supervised | A target built from the data | The forward function |
| Reinforcement | A reward from interaction | The policy network's forward function |

This track compiles that forward function after the weights are written. [Training Writes the Weights](/docs/ml-compilers/training-writes-the-weights/) shows the write. [Inference Is the Computation](/docs/ml-compilers/inference-is-the-computation/) shows the run the compiler is aimed at.

## What To Read Next

- [From Score to Action](/docs/ml-compilers/from-score-to-action/)
- [Training Writes the Weights](/docs/ml-compilers/training-writes-the-weights/)
- [What AI Is](/docs/ml-compilers/what-ai-is/)

<div>
  <AdBanner />
</div>
