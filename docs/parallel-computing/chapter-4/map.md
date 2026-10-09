---
title: "4.1 Map"
description: "Map applies one function to each item, independently."
displayed_sidebar: parallelChapter4Sidebar
---

# 4.1 Map

## What you'll learn

- Map applies one function to each item, independently.
- Each item can be finished alone.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Adding a constant to every element is a map. No element reads another. That is the easiest split: one iteration, one output.

## Picture

```text
in[i] -> out[i] for every i.
```

## Hands-on

Write a loop that sets `out[i] = in[i] + 1`. Decide whether any iteration reads another iteration's write.

## What changed the time

A pure map has no combining step, so there is no shared total to race on.

## Quiz

[Chapter 4: Parallel Algorithms quiz](/docs/mcq/questions/domain/parallel/chapter-4/quiz/)

Next: [4.2 Reduce](./reduce/)
