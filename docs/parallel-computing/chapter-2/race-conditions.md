---
title: "2.4 Race conditions"
description: "A race is two threads using one location, and at least one of them writes."
displayed_sidebar: parallelChapter2Sidebar
---

# 2.4 Race conditions

## What you'll learn

- A race is two threads using one location, and at least one of them writes.
- The printed total can change from run to run.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

`total = total + x` is a read, an add, and a write. If both threads read 10 before either writes, both write 10 plus their own value, and one add disappears. The source looks sequential. The machine is not.

## Picture

```text
Both threads read 10. One writes 12. The other writes 11. The 12 is gone.
```

## Hands-on

Point at the read and the write in `total = total + x`. That pair is the race when two threads run it.

## What changed the time

A racy run is not a benchmark. Fix the race before you trust a time.

## Quiz

[Chapter 2: CPU Parallelism quiz](/docs/mcq/questions/domain/parallel/chapter-2/quiz/)

Previous: [2.3 Shared memory](./shared-memory/)

Next: [2.5 Mutex](./mutex/)
