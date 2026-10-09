---
title: "1.4 Concurrent, parallel, and distributed"
description: "Concurrent: the work overlaps in time."
displayed_sidebar: parallelChapter1Sidebar
---

# 1.4 Concurrent, parallel, and distributed

## What you'll learn

- Concurrent: the work overlaps in time.
- Parallel: more than one core is doing it. Distributed: separate machines, and a message between them.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Two tasks can take turns on one core. That overlaps in time, and it is concurrent. It is parallel when two cores each advance their own piece together. It is distributed when the pieces sit in different memories and the only way to exchange a total is a message. OpenMP does not cross that gap. MPI is the later chapter for it.

## Picture

```text
One core, two tasks taking turns. Two cores, two tasks together. Two machines, one message.
```

## Hands-on

Point at the paper split from 1.3. That one is parallel if two people write at the same time. It is distributed only if they cannot see each other's paper and have to say the half-sum out loud.

## What changed the time

No timer on the vocabulary. The difference shows up when a message replaces a shared total.

## Quiz

[Chapter 1: Parallel Thinking quiz](/docs/mcq/questions/domain/parallel/chapter-1/quiz/)

Previous: [1.3 Sequential and parallel](./sequential-and-parallel/)

Next: [1.5 Your first parallel problem](./your-first-parallel-problem/)
