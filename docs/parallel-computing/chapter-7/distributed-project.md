---
title: "7.5 Distributed project"
description: "Two ranks, two partial sums, one printed 28."
displayed_sidebar: parallelChapter7Sidebar
---

# 7.5 Distributed project

## What you'll learn

- Two ranks, two partial sums, one printed 28.
- OpenMP can run inside a rank. MPI runs between ranks.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Use two ranks. Each adds its half. One reduction or one send produces 28. If you also turn on OpenMP inside the rank, that is hybrid: threads share the rank's memory, and the message crosses ranks. Keep the totals equal to the serial 28.

## Picture

```text
rank, threads inside the rank, one message between ranks.
```

## Hands-on

Run with two ranks. Print the final total from one rank only, so you do not count 28 twice.

## What changed the time

Write the rank count and, if you used threads, the thread count. Oversubscribing both onto the same cores is a common way to get a slower correct answer.

## Quiz

[Chapter 7: Distributed Computing quiz](/docs/mcq/questions/domain/parallel/chapter-7/quiz/)

Previous: [7.4 Collective operations](./collective-operations/)
