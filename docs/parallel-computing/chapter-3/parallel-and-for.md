---
title: "3.1 parallel and for"
description: "`parallel` starts a team of threads."
displayed_sidebar: parallelChapter3Sidebar
---

# 3.1 parallel and for

## What you'll learn

- `parallel` starts a team of threads.
- `for` splits the loop iterations across that team.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

OpenMP is how you ask the compiler to outline the split you did by hand in Chapter 1. A loop is safe to split when iteration i does not need a value iteration i-1 wrote. The adding loop's iterations are independent if each iteration writes a private place.

## Picture

```text
iterations 0,1,2 on thread 0. iterations 3,4,5 on thread 1.
```

## Hands-on

Compile a small C file with `-fopenmp`. Put the list loop in a parallel for only after each iteration writes a private slot, or after you have read the reduction page.

## What changed the time

The first OpenMP run is worth timing against the serial loop from 1.1, on this same list.

## Quiz

[Chapter 3: OpenMP quiz](/docs/mcq/questions/domain/parallel/chapter-3/quiz/)

Next: [3.2 reduction](./reduction/)
