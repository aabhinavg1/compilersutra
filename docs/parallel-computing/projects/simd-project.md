---
title: "Project 2: SIMD"
description: "A scalar loop and a widened loop, or a compiler vectorization report."
displayed_sidebar: parallelProjectsSidebar
---

# Project 2: SIMD

## What you'll learn

- A scalar loop and a widened loop, or a compiler vectorization report.
- Same results, element by element.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Start from the map `out[i] = in[i] + 1`. Build it scalar. Then turn on the compiler's vectorizer, or write the wide add if you want to spell AVX or NEON yourself. Check the outputs match. The report or the instruction listing is the evidence, not a claimed speedup.

## Picture

```text
scalar adds beside wide adds.
```

## Hands-on

Show one listing or compiler note that the loop vectorized, or show the intrinsics you wrote. Include a diff of the outputs. It should be empty.

## What changed the time

If you time it, keep both times. A six-element list may not show a difference.

## Quiz

[Projects quiz](/docs/mcq/questions/domain/parallel/projects/quiz/)

Previous: [Project 1: CPU](./cpu-project/)

Next: [Project 3: GPU](./gpu-project/)
