---
title: "6.5 GPU memory"
description: "Registers are private to one thread."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.5 GPU memory

## What you'll learn

- Registers are private to one thread.
- Shared memory is for the block. Global memory is the large array everyone can name.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

The list starts in global memory. A private sum can live in a register. A partial total for the block can live in shared memory, then one thread writes the block's result back to global memory. Putting the whole list in shared memory is not the goal. Shared memory is small.

## Picture

```text
registers, shared memory, global memory.
```

## Hands-on

Say where the six numbers live, and where one thread's running add lives.

## What changed the time

A global load is the expensive one. A register add is the cheap one.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.4 SIMT](./simt/)

Next: [6.6 CUDA](./cuda/)
