---
title: "7.1 Why a cluster"
description: "A cluster is several machines, each with its own memory."
displayed_sidebar: parallelChapter7Sidebar
---

# 7.1 Why a cluster

## What you'll learn

- A cluster is several machines, each with its own memory.
- OpenMP stops at one machine.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

When the list, or a larger array, does not fit in one memory, the pieces live on different nodes. A thread cannot name another node's variable. Something has to send the partial sum. That something is a message.

## Picture

```text
two machines, two memories, one message with a partial sum.
```

## Hands-on

Split the six numbers across two imagined machines. Write the message each must send so a third step can print 28. One machine can receive both.

## What changed the time

The message cost is large next to six adds. The pattern matters more on a list that does not fit.

## Quiz

[Chapter 7: Distributed Computing quiz](/docs/mcq/questions/domain/parallel/chapter-7/quiz/)

Next: [7.2 MPI](./mpi/)
