---
title: "1.3 Sequential and parallel"
description: "Sequential: one worker, the whole list."
displayed_sidebar: parallelChapter1Sidebar
---

# 1.3 Sequential and parallel

## What you'll learn

- Sequential: one worker, the whole list.
- Parallel: the list is split, and more than one core does a piece at the same time.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Sequential adding walks every box itself. Parallel adding gives one worker the first half and another worker the second half, then adds those two half-sums. Both workers have to finish before the final add.

## Picture

```text
Worker A: 2+7+1. Worker B: 8+2+8. Then 10+18.
```

## Hands-on

Split the six numbers into two groups of three. Add each group. Add the two group totals. You should still get 28.

## What changed the time

Two people can finish the paper sum sooner. The last add still waits for both groups.

## Quiz

[Chapter 1: Parallel Thinking quiz](/docs/mcq/questions/domain/parallel/chapter-1/quiz/)

Previous: [1.2 Why one core stops being enough](./why-one-core-stops-being-enough/)

Next: [1.4 Concurrent, parallel, and distributed](./concurrent-parallel-and-distributed/)
