---
title: "4.4 Matrix multiplication"
description: "One output element is a dot product of a row and a column."
displayed_sidebar: parallelChapter4Sidebar
---

# 4.4 Matrix multiplication

## What you'll learn

- One output element is a dot product of a row and a column.
- That output can be owned by one worker.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

C[i][j] does not need C[i][j+1]. Workers can split the outputs. They all read A and B. The split is over who writes which outputs, which keeps the writes private.

## Picture

```text
one C[i][j], one worker.
```

## Hands-on

For a 2 by 2 product, write which worker owns which of the four outputs.

## What changed the time

The reads of A and B are shared. The writes of C are not, if each output has one owner.

## Quiz

[Chapter 4: Parallel Algorithms quiz](/docs/mcq/questions/domain/parallel/chapter-4/quiz/)

Previous: [4.3 Histogram](./histogram/)

Next: [4.5 Stencil](./stencil/)
