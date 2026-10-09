---
title: "2.7 Waiting, and deadlock"
description: "A thread can wait for another thread to finish."
displayed_sidebar: parallelChapter2Sidebar
---

# 2.7 Waiting, and deadlock

## What you'll learn

- A thread can wait for another thread to finish.
- Deadlock is a wait that nobody can end.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Joining a worker waits until that worker is done. That wait is useful: the final add needs both half-sums. Deadlock is different. Thread A holds lock 1 and waits for lock 2, while thread B holds lock 2 and waits for lock 1. Condition variables are the way a thread waits for a condition instead of spinning. On this list you need a join, not two locks.

## Picture

```text
A waits for B's lock. B waits for A's lock.
```

## Hands-on

Write the order of two locks that deadlocks, and one order that does not.

## What changed the time

A deadlocked program does not report a time. It sits.

## Quiz

[Chapter 2: CPU Parallelism quiz](/docs/mcq/questions/domain/parallel/chapter-2/quiz/)

Previous: [2.6 Atomics](./atomics/)
