---
title: "What AI Is"
description: "The vocabulary the rest of the ML compiler track uses: artificial intelligence, machine learning, features, labels, a model, and why the compiler sees inference math."
slug: /ml-compilers/what-ai-is/
hide_table_of_contents: true
displayed_sidebar: mlChapter2Sidebar
sidebar_position: 3
keywords:
  - artificial intelligence
  - machine learning
  - deep learning
  - features and labels
  - what is a model
  - inference math
---

import AdBanner from '@site/src/components/AdBanner';

# What AI Is

This chapter names the words the rest of the track uses. The destination is still the compiler. The compiler reads a model, so the model has to be a concrete object before any IR shows up.


## An aim, and the ways under it {#an-aim-and-the-ways-under-it}

Artificial intelligence is the aim: a machine that perceives, predicts, decides, or plans.

Several techniques sit under that aim.

```text
Artificial intelligence
        |
        |-- rule-based systems
        |-- machine learning
        |-- deep learning
        `-- other techniques
```

A chess program that searches a hand-written evaluation is pursuing the aim with rules. A decision tree trained on examples is machine learning, and it can be shallow. A network with many layers is a deep network. Deep learning is that family of models. A shallow network is still a neural network. The three names nest. They are different widths of the same conversation.

## Examples, a procedure, a model {#examples-a-procedure-a-model}

Hand-written rules look like this: rules plus an input produce an output.

Machine learning keeps the input and the output and changes where the rules come from.

```text
examples
   |
   v
learning procedure
   |
   v
model
```

The examples include the answers you wanted. The procedure adjusts the model until those answers are close. The model is what you keep.

## Features and labels {#features-and-labels}

A feature is a number the model is allowed to see. A label is the answer attached to an example.

A house might be described by area, bedroom count, location encoded as a number, and age. Those four numbers are the features. The sale price is the label when the task is to predict a price.

An email mapped to "spam" or "not spam" is the same shape. The features are whatever you measured on the message. The label is the category.

## Architecture plus parameters {#architecture-plus-parameters}

Two different facts get called "the model" in casual speech. Split them.

The architecture is the shape of the math: how many inputs, how they combine, which operations sit in which order. The parameters are the numbers inside that shape. Training writes the parameters. The architecture is chosen before that write happens.

A compiler can see both. The architecture becomes the graph. The parameters become constants on that graph.

## Prediction and generalization {#prediction-and-generalization}

Prediction is one run of the model on an input. Generalization is the requirement that a new input, one that was not used to update the parameters, still produces a useful output.

A model that only repeats the training examples has memorized a table. The compiler can still compile it. The result is a fast table. The learning chapter is where that distinction is made. The compiler's job is the computation either way.

## Neuron, layer, a deep stack {#neuron-layer-a-deep-stack}

One unit computes a weighted sum and then a simple function of that sum. A layer is many units that read the same input. A network is a stack of layers. The output of one layer is the input of the next.

"Deep" means the stack has many layers. The compiler does not need a separate theory for depth. More layers means a longer graph and more weights.

## The compiler reads the inference math {#the-compiler-reads-the-inference-math}

After training, the model is a function from numbers to numbers. That function is addition, multiplication, and a few other numeric operations, arranged in a graph, with the weights stored as constants.

The training recipe, the dataset, and the optimizer are how the constants were obtained. The compiler transforms the function that runs afterward. [Learning Types](/docs/ml-compilers/learning-types/) is the next vocabulary page. [What an AI Compiler Is](/docs/ml-compilers/what-an-ai-compiler-is/) is where that function enters a pipeline.

## What To Read Next

- [Learning Types](/docs/ml-compilers/learning-types/)
- [Programs as Rules](/docs/ml-compilers/programs-as-rules/)
- [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm/)

<div>
  <AdBanner />
</div>
