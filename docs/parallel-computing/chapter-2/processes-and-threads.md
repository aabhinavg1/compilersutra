---
title: "2.2 Processes and threads"
description: "A process is a running program with its own memory."
displayed_sidebar: parallelChapter2Sidebar
---

# 2.2 Processes and threads

## What you'll learn

- A process is a running program with its own memory.
- A thread is a worker inside that process.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Two processes do not see each other's variables. Two threads in one process do. The adding program wants threads when the half-sums should be visible without a message. Creating a thread is the hands-on below, not a separate lecture.

## Picture

```text
One process box. Two threads inside it. One total they can both name.
```

## Hands-on

Sketch one process and two threads. Write which variables sit inside the process, where both threads can read them.

## What changed the time

Starting a thread costs more than one add. A thread per number is a bad trade on this list.

## Quiz

[Chapter 2: CPU Parallelism quiz](/docs/mcq/questions/domain/parallel/chapter-2/quiz/)

Previous: [2.1 CPU cores](./cpu-cores/)

Next: [2.3 Shared memory](./shared-memory/)
