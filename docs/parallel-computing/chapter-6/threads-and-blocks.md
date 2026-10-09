---
title: "6.3 Threads and blocks"
description: "Threads are grouped into a block."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.3 Threads and blocks

## What you'll learn

- Threads are grouped into a block.
- Threads in one block can wait for each other. Threads in different blocks wait by ending the kernel.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

You pick an index for each thread so it owns one element, or one output. A block is the group that can share a small memory and a barrier. The whole launch is a grid of those blocks.

## Picture

```text
grid of blocks, one block opened, indexes on the list.
```

## Hands-on

Give each of the six numbers a thread index. Say which indexes would sit in one block if the block size is 3.

## What changed the time

A barrier inside a block does not order threads that are in another block.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.2 GPU architecture](./gpu-architecture/)

Next: [6.4 SIMT](./simt/)
