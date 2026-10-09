---
title: "8.1 Speedup and Amdahl"
description: "Speedup is serial time divided by parallel time, on the same work."
displayed_sidebar: parallelChapter8Sidebar
---

# 8.1 Speedup and Amdahl

## What you'll learn

- Speedup is serial time divided by parallel time, on the same work.
- The part you did not split stays on one worker.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

If the serial list takes time T and the parallel run takes time P, the speedup is T/P. Use your own times from the OpenMP project. Amdahl's observation is that a leftover serial fraction caps that ratio. The final add of two partial sums is a small serial piece. A serial print, a serial allocation, or a copy can be a larger one. The longer Amdahl page already on the site derives the formula.

## Picture

```text
a parallel middle, a serial tail on one worker.
```

## Hands-on

From your two times, compute T/P. Name one step in your program that was still serial.

## What changed the time

A speedup without the serial baseline is incomplete. Keep both times.

## Quiz

[Chapter 8: Measuring quiz](/docs/mcq/questions/domain/parallel/chapter-8/quiz/)

Next: [8.2 Cache and false sharing](./cache-and-false-sharing/)
