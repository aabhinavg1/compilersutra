---
title: "7.3 Send and receive"
description: "A send matches a receive by rank and tag."
displayed_sidebar: parallelChapter7Sidebar
---

# 7.3 Send and receive

## What you'll learn

- A send matches a receive by rank and tag.
- If both sides send first and the buffer cannot hold the message, they can deadlock.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Rank 0 sends its partial sum to rank 1, and rank 1 receives it, adds its own partial sum, and prints. If both ranks call a blocking send and neither has reached the receive, both sit. One order that finishes is: the receiver posts the receive, the sender posts the send. On two ranks, one of them should receive.

## Picture

```text
send arrow, matching receive.
```

## Hands-on

Write the two calls for this sum so one rank sends and the other receives. Then write the pair of sends that waits forever.

## What changed the time

A deadlocked pair does not print 28 and does not print a time.

## Quiz

[Chapter 7: Distributed Computing quiz](/docs/mcq/questions/domain/parallel/chapter-7/quiz/)

Previous: [7.2 MPI](./mpi/)

Next: [7.4 Collective operations](./collective-operations/)
