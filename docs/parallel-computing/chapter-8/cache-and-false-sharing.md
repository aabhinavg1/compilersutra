---
title: "8.2 Cache and false sharing"
description: "Cores keep recently used memory in cache lines."
displayed_sidebar: parallelChapter8Sidebar
---

# 8.2 Cache and false sharing

## What you'll learn

- Cores keep recently used memory in cache lines.
- Two threads writing different variables on the same line bounce that line.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

False sharing is a correct program that gets slower. The threads do not share a variable. They share a cache line because their variables sit next to each other. The line moves between cores on every write. Padding the variables onto separate lines, or giving each thread a private sum that is combined once, removes the bounce.

## Picture

```text
one cache line, two counters, the line moving.
```

## Hands-on

Place two counters next to each other in a struct. Place them again with a gap large enough for a typical 64-byte line. The answers stay equal. The times may not.

## What changed the time

If you time this, report both layouts from your machine. The lesson is the bounce, not a universal ratio.

## Quiz

[Chapter 8: Measuring quiz](/docs/mcq/questions/domain/parallel/chapter-8/quiz/)

Previous: [8.1 Speedup and Amdahl](./speedup-and-amdahl/)

Next: [8.3 Memory bandwidth](./memory-bandwidth/)
