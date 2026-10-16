---
title: "6.4 SIMT"
description: "SIMT runs one instruction across a small group of threads."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.4 SIMT

## What you'll learn

- SIMT runs one instruction across a small group of threads.
- If those threads take different branches, the group serializes the paths.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

SIMD lanes share a register and one thread of control. SIMT threads look like separate threads, and a scheduler still issues one instruction to a group of them. Divergence is that group taking two paths. The hardware runs one path, then the other.

## Picture

```text
a group of threads, one branch, two paths one after the other.
```

## Hands-on

Write a branch that half the six indexes would take. Those threads are the divergent ones if they share a group.

## What changed the time

Divergence costs extra steps inside the group. It is not a second core.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.3 Threads and blocks](./threads-and-blocks/)

Next: [6.5 GPU memory](./gpu-memory/)
