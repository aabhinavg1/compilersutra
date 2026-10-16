---
title: "2.5 Mutex"
description: "A mutex lets one thread into a section at a time."
displayed_sidebar: parallelChapter2Sidebar
---

# 2.5 Mutex

## What you'll learn

- A mutex lets one thread into a section at a time.
- The lock has to cover the shared update, not the whole loop.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

If each add takes the mutex, the total stays correct, and the threads mostly wait. The private-sum version needs no lock inside the loop. A lock around the final add of two private sums is enough, and often the main thread just waits until both are done.

## Picture

```text
Loop with a lock on every add. Loop with private sums and one join.
```

## Hands-on

On the sketch, draw the lock only around the shared update. Leave the walk of each half outside it.

## What changed the time

A lock on every element can make two cores slower than one.

## Quiz

[Chapter 2: CPU Parallelism quiz](/docs/mcq/questions/domain/parallel/chapter-2/quiz/)

Previous: [2.4 Race conditions](./race-conditions/)

Next: [2.6 Atomics](./atomics/)
