---
title: "2.3 Shared memory"
description: "Threads in one process share the address space."
displayed_sidebar: parallelChapter2Sidebar
---

# 2.3 Shared memory

## What you'll learn

- Threads in one process share the address space.
- A variable both threads name is shared.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

The list and a single `total` live in the process. Both threads can load and store them. A private variable, created inside one thread, is not the other thread's name. Shared is convenient, and it is also how races happen.

## Picture

```text
list[] and total in the process. sum_a inside thread A. sum_b inside thread B.
```

## Hands-on

Mark each name in the sketch: shared or private.

## What changed the time

Sharing the list is cheap to read. Sharing the total is where the writes collide.

## Quiz

[Chapter 2: CPU Parallelism quiz](/docs/mcq/questions/domain/parallel/chapter-2/quiz/)

Previous: [2.2 Processes and threads](./processes-and-threads/)

Next: [2.4 Race conditions](./race-conditions/)
