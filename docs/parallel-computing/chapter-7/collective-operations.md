---
title: "7.4 Collective operations"
description: "Every rank calls a collective."
displayed_sidebar: parallelChapter7Sidebar
---

# 7.4 Collective operations

## What you'll learn

- Every rank calls a collective.
- A broadcast or a reduction is a tree, not a loop of sends from rank 0 to everyone.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

An `MPI_Reduce` of the partial sums is the distributed form of the private-sum add. Each rank contributes its partial sum. One rank receives 28. A broadcast would be how rank 0 hands the whole list out. The tree matters because a loop of sends from one rank gets slower as ranks are added.

## Picture

```text
partial sums up a tree to one total.
```

## Hands-on

With four ranks, sketch a binary tree that reduces four partial sums. Count the steps. A star from rank 0 is a different picture.

## What changed the time

The reduce moves less data than gathering every element back to one rank.

## Quiz

[Chapter 7: Distributed Computing quiz](/docs/mcq/questions/domain/parallel/chapter-7/quiz/)

Previous: [7.3 Send and receive](./send-and-receive/)

Next: [7.5 Distributed project](./distributed-project/)
