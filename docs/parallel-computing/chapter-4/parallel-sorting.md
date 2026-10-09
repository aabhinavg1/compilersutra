---
title: "4.7 Parallel sorting"
description: "Some pairs can be swapped at the same time."
displayed_sidebar: parallelChapter4Sidebar
---

# 4.7 Parallel sorting

## What you'll learn

- Some pairs can be swapped at the same time.
- A pair that shares an item with another pair cannot.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Odd-even sort swaps positions (0,1), then (2,3), and so on, then the even pairs. Pairs in one phase do not share an index, so they can proceed together. The next phase waits until this phase's swaps are visible.

## Picture

```text
phase odd, phase even, on one row.
```

## Hands-on

Write one odd phase and one even phase for a four-element row.

## What changed the time

The phases are the barrier. Skipping the wait compares values that have not swapped yet.

## Quiz

[Chapter 4: Parallel Algorithms quiz](/docs/mcq/questions/domain/parallel/chapter-4/quiz/)

Previous: [4.6 Scan](./scan/)
