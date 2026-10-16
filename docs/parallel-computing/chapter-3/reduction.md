---
title: "3.2 reduction"
description: "A reduction gives each thread a private copy, then combines them."
displayed_sidebar: parallelChapter3Sidebar
---

# 3.2 reduction

## What you'll learn

- A reduction gives each thread a private copy, then combines them.
- The combine for this list is addition.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

`reduction(+:total)` is the private-sum pattern from 1.5, written as a clause. Each thread adds into its own total. At the end of the region the runtime adds those copies into `total`. The serial result is still 28.

## Picture

```text
thread totals, then one +.
```

## Hands-on

Write the clause next to the loop. Print `total` and compare it with 28.

## What changed the time

Time this against the locked shared total. The reduction should do less waiting.

## Quiz

[Chapter 3: OpenMP quiz](/docs/mcq/questions/domain/parallel/chapter-3/quiz/)

Previous: [3.1 parallel and for](./parallel-and-for/)

Next: [3.3 sections and synchronization](./sections-and-synchronization/)
