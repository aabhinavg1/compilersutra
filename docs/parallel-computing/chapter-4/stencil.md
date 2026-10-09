---
title: "4.5 Stencil"
description: "A stencil computes one cell from its neighbors."
displayed_sidebar: parallelChapter4Sidebar
---

# 4.5 Stencil

## What you'll learn

- A stencil computes one cell from its neighbors.
- The read is shared. The write goes to a new array.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Each cell looks left and right, or at a small neighborhood. If you write back into the same array, a neighbor might already be the new value. Write into a second array, then the reads stay on the old values.

## Picture

```text
old[i-1], old[i], old[i+1] -> new[i].
```

## Hands-on

Pick one cell in a short row and list the cells it reads.

## What changed the time

Two arrays use more memory. They also keep the neighbor values stable for the whole pass.

## Quiz

[Chapter 4: Parallel Algorithms quiz](/docs/mcq/questions/domain/parallel/chapter-4/quiz/)

Previous: [4.4 Matrix multiplication](./matrix-multiplication/)

Next: [4.6 Scan](./scan/)
