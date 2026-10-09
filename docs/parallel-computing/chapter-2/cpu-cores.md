---
title: "2.1 CPU cores"
description: "Each core can walk its own instruction stream."
displayed_sidebar: parallelChapter2Sidebar
---

# 2.1 CPU cores

## What you'll learn

- Each core can walk its own instruction stream.
- Extra cores help this list only after the work is split.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

A core has its own program counter. Two cores can add different parts of the list in the same moment. They still share the machine's memory, which is the subject of the next pages.

## Picture

```text
Core 0's program counter on the left half. Core 1's program counter on the right half.
```

## Hands-on

Run the serial loop. Then read the core count again. The serial loop's structure did not change.

## What changed the time

A second core changes the time after the loop is split, not before.

## Quiz

[Chapter 2: CPU Parallelism quiz](/docs/mcq/questions/domain/parallel/chapter-2/quiz/)

Next: [2.2 Processes and threads](./processes-and-threads/)
