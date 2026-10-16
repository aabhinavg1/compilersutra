---
title: "4.2 Reduce"
description: "Reduce combines every item into one value."
displayed_sidebar: parallelChapter4Sidebar
---

# 4.2 Reduce

## What you'll learn

- Reduce combines every item into one value.
- The combining step is where the private results meet.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

The sum of the list is a reduce. Map produces many results. Reduce produces one. The combining operation for a sum is addition, and it needs to be safe when the partial sums meet.

## Picture

```text
many numbers, one total.
```

## Hands-on

Identify the map and the reduce in: square each value, then add the squares.

## What changed the time

The combine is usually the short part. It still has to wait for the partial results.

## Quiz

[Chapter 4: Parallel Algorithms quiz](/docs/mcq/questions/domain/parallel/chapter-4/quiz/)

Previous: [4.1 Map](./map/)

Next: [4.3 Histogram](./histogram/)
