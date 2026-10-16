---
title: "1.5 Your first parallel problem"
description: "A shared total, updated by two workers, can lose adds."
displayed_sidebar: parallelChapter1Sidebar
---

# 1.5 Your first parallel problem

## What you'll learn

- A shared total, updated by two workers, can lose adds.
- Give each worker a private sum, then add the private sums once.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Data parallelism means the same add, on different items. Task parallelism means different jobs. This list is data parallelism. A dependence is a step that needs an earlier result. The final add depends on both half-sums. It must wait. If both workers do `total = total + x` on one shared total, one update can be lost. That is a race. Private sums remove it.

## Picture

```text
Shared total: both workers write 28's slot. Private sums: 10 and 18, then one add.
```

## Hands-on

On paper, have two people erase and rewrite the same total line. Then do it again with two private totals and one final add. Only the second way is calm.

## What changed the time

A race shows up as a wrong total. Get 28 on paper before you care about the clock.

## Quiz

[Chapter 1: Parallel Thinking quiz](/docs/mcq/questions/domain/parallel/chapter-1/quiz/)

Previous: [1.4 Concurrent, parallel, and distributed](./concurrent-parallel-and-distributed/)
