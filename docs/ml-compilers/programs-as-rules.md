---
title: "Programs as Rules"
description: "Start from a normal program: input, a choice, a rule list, and the point where the cases are too many to write by hand."
slug: /ml-compilers/programs-as-rules/
hide_table_of_contents: true
displayed_sidebar: mlChapter1Sidebar
sidebar_position: 2
keywords:
  - what is a program
  - rules in code
  - decision trees
  - when hand written rules break
  - learning from examples
  - ai compiler prerequisites
---

import AdBanner from '@site/src/components/AdBanner';

# Programs as Rules



An AI compiler eventually lowers a model. The model is still a program. This chapter starts from the kind of program you can already read: input, steps, and an output a person chose.


## Input, steps, output {#input-steps-output}

Every program you already trust has the same shape. Something arrives. The program does a fixed sequence of steps. Something leaves.

A thermostat reads a temperature. It compares that number with a setpoint. It turns a heater on or leaves it off. The steps are the program. The temperature is the input. The heater command is the output.

An AI compiler does not replace this shape. Later chapters put a model in the middle of it. The model still receives an input and still produces an output. The difference is where the steps came from.

## A choice in code {#a-choice-in-code}

Most useful programs branch. A condition is a comparison. The branch is the path that comparison selects.

```text
if temperature < setpoint:
    heater = on
else:
    heater = off
```

Nested conditions are the same idea with more paths. `if` the message contains a known phrase, and `if` the sender is on a list, then mark it. Each added condition is another case a person wrote down.

## Situation and action {#situation-and-action}

Call the inputs the situation. Call the output the action.

The situation for a spam filter might be the sender, the subject, and a few words in the body. The action is "deliver" or "hold". The situation for a photo tool is the pixels. The action is a label, a crop, or a score.

Once you name it this way, a model and a hand-written program are doing the same job at the boundary. Both map a situation to an action. Chapter 4 stays on that boundary. The compiler chapters start after the score exists.

## Rules, trees, and tables {#rules-trees-and-tables}

People encode that mapping in three ordinary ways.

A rule list is a sequence of conditions. A decision tree is the same list drawn as branches. A lookup table stores the action next to each situation you decided to recognize.

All three are explicit. A reader can point at the line that fired. A compiler for ordinary code can compile that line because the meaning is written in the source.

## A list that covers the cases {#a-list-that-covers-the-cases}

A rule list is a good program when the cases you care about are known and few.

A parser for a small configuration language belongs here. A protocol decoder belongs here. A build system that maps a file extension to a tool belongs here. You can finish the list, review it, and test every row.

## Too many interacting cases {#too-many-interacting-cases}

The list stops being a program a person can finish when the cases interact.

A photo is not a handful of flags. Two pictures of the same object differ by light, angle, and crop. An email can be spam without any phrase you put on the list. Adding one more `if` fixes one example and leaves the rest.

The failure is the size of the case list. The program shape is still input, steps, and output.

## Behavior from examples {#behavior-from-examples}

The next move is to keep the input and the output, and to obtain the steps from examples instead of writing every case.

You collect situations whose actions you already know. A learning procedure produces a model. The model is the program that will later run on a new situation. [What AI Is](/docs/ml-compilers/what-ai-is/) names that procedure. The compiler, much later, compiles the model that procedure left behind.

## What To Read Next

- [What AI Is](/docs/ml-compilers/what-ai-is/)
- [From Score to Action](/docs/ml-compilers/from-score-to-action/)
- [ML Compilers Track](/docs/tracks/ml-compilers/)

<div>
  <AdBanner />
</div>

📩 Interested in deep dives like pipelines, cache, and compiler optimizations?

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: 'var(--ifm-background-surface-color)',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>
