---
title: "2.6 Atomics"
description: "An atomic update finishes as one step to other threads."
displayed_sidebar: parallelChapter2Sidebar
---

# 2.6 Atomics

## What you'll learn

- An atomic update finishes as one step to other threads.
- An atomic on the wrong variable does not fix a logic race.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

An atomic add on `total` keeps the read-modify-write from splitting. The result matches the serial sum. Threads still contend on that one address. Atomics are the tool when many updates must hit one location. They are a poor tool when each thread could have kept a private sum.

## Picture

```text
One address. Atomic adds queue on it. Private sums do not.
```

## Hands-on

Say which variable would be atomic in the shared-total version. Say why the private sums do not need it.

## What changed the time

Contention on one atomic can show up as time spent waiting, with a correct answer.

## Quiz

[Chapter 2: CPU Parallelism quiz](/docs/mcq/questions/domain/parallel/chapter-2/quiz/)

Previous: [2.5 Mutex](./mutex/)

Next: [2.7 Waiting, and deadlock](./waiting-and-deadlock/)
