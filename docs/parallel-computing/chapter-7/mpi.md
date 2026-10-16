---
title: "7.2 MPI"
description: "A rank is one process in the MPI job."
displayed_sidebar: parallelChapter7Sidebar
---

# 7.2 MPI

## What you'll learn

- A rank is one process in the MPI job.
- Ranks do not share the list unless you send it.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

MPI starts a set of processes. Each has a rank, a number from 0 upward. Rank 0 can hold the list and send halves, or each rank can already own its half. Printing 28 belongs on one rank after it has both partial sums.

## Picture

```text
rank 0 and rank 1, each with a half.
```

## Hands-on

Give each rank its three numbers. Write the partial sum it can compute without help.

## What changed the time

Starting many ranks on one laptop shares that laptop's cores. It does not create a second machine.

## Quiz

[Chapter 7: Distributed Computing quiz](/docs/mcq/questions/domain/parallel/chapter-7/quiz/)

Previous: [7.1 Why a cluster](./why-a-cluster/)

Next: [7.3 Send and receive](./send-and-receive/)
