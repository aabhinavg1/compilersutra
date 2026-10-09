---
title: "5.3 SIMD and threads"
description: "Lanes share one instruction stream."
displayed_sidebar: parallelChapter5Sidebar
---

# 5.3 SIMD and threads

## What you'll learn

- Lanes share one instruction stream.
- Threads can be in different places in the program.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

You can have threads, and each thread can use SIMD on its own slice. That is the usual CPU shape: a few cores, each with vector registers. SIMD does not replace the split across cores. It shortens the work inside one core's slice.

## Picture

```text
two threads, each with a wide add on its half.
```

## Hands-on

Draw the list split across two threads, and each half grouped into lanes.

## What changed the time

SIMD cuts instructions inside a slice. Threads are still how two cores both stay busy.

## Quiz

[Chapter 5: SIMD quiz](/docs/mcq/questions/domain/parallel/chapter-5/quiz/)

Previous: [5.2 Vectorization](./vectorization/)
