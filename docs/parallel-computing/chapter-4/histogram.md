---
title: "4.3 Histogram"
description: "A histogram counts how often each key appears."
displayed_sidebar: parallelChapter4Sidebar
---

# 4.3 Histogram

## What you'll learn

- A histogram counts how often each key appears.
- Bins race when two threads increment the same bin.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

If the list is keys and the output is a count per key, two threads that see the same key both update one bin. A private histogram per thread, added at the end, is the same idea as a private sum.

## Picture

```text
bin[key] += 1, from two threads.
```

## Hands-on

Take the list 2, 7, 1, 8, 2, 8. The bins for 2 and 8 are the ones that would race.

## What changed the time

A shared bin array with a lock per add is correct and can be slow if one bin is hot.

## Quiz

[Chapter 4: Parallel Algorithms quiz](/docs/mcq/questions/domain/parallel/chapter-4/quiz/)

Previous: [4.2 Reduce](./reduce/)

Next: [4.4 Matrix multiplication](./matrix-multiplication/)
