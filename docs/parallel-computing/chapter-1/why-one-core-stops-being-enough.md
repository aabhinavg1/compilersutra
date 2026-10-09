---
title: "1.2 Why one core stops being enough"
description: "A core is the part of the chip that walks the steps."
displayed_sidebar: parallelChapter1Sidebar
---

# 1.2 Why one core stops being enough

## What you'll learn

- A core is the part of the chip that walks the steps.
- A laptop has several cores. This loop uses one of them.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

For years, chips got faster because the clock got faster. That got expensive, in power and in heat. The machines on desks gained more cores instead. A program that still walks the list as one loop leaves the other cores idle.

## Picture

```text
Core 0: busy with the list. Core 1, Core 2, Core 3: idle.
```

## Hands-on

Find how many cores the machine reports. On Linux, `nproc` prints that count. The adding loop from 1.1 still uses one of them.

## What changed the time

The loop's time does not drop just because the machine has more cores.

## Quiz

[Chapter 1: Parallel Thinking quiz](/docs/mcq/questions/domain/parallel/chapter-1/quiz/)

Previous: [1.1 A program is a list of steps](./a-program-is-a-list-of-steps/)

Next: [1.3 Sequential and parallel](./sequential-and-parallel/)
