---
title: "6.1 Why GPUs"
description: "A GPU has a great many simple arithmetic units."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.1 Why GPUs

## What you'll learn

- A GPU has a great many simple arithmetic units.
- The list has to be copied to the device before those units can add it.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Extra CPU cores were the first response when clocks stopped being the easy win. A GPU is a later machine for the same kind of problem, built from many small workers that were originally for drawing. Your adding loop does not run there until the data and the kernel are on the device.

## Picture

```text
CPU: a few large cores. GPU: many small workers. A copy between them.
```

## Hands-on

Write the serial sum again and name the array that would have to move if a GPU did the adds.

## What changed the time

On a short list, the copy can take longer than the adds.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Next: [6.2 GPU architecture](./gpu-architecture/)
