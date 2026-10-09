---
title: "4.6 Scan"
description: "A scan produces a running total at every position."
displayed_sidebar: parallelChapter4Sidebar
---

# 4.6 Scan

## What you'll learn

- A scan produces a running total at every position.
- Position i needs the total from the left.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Unlike the plain sum, a scan keeps every prefix. Item i cannot be finished until the prefix before it is known. The work can still be split into partial scans, then fixed up with those partial totals. The dependence does not disappear.

## Picture

```text
prefixes: 2, 9, 10, 18, 20, 28.
```

## Hands-on

Compute the prefixes of 2, 7, 1, 8, 2, 8 by hand. Mark which output needs the previous one.

## What changed the time

The fix-up step is serial in the prefixes even when the local scans run side by side.

## Quiz

[Chapter 4: Parallel Algorithms quiz](/docs/mcq/questions/domain/parallel/chapter-4/quiz/)

Previous: [4.5 Stencil](./stencil/)

Next: [4.7 Parallel sorting](./parallel-sorting/)
