---
title: "5.2 Vectorization"
description: "The compiler can widen a loop when iterations are independent."
displayed_sidebar: parallelChapter5Sidebar
---

# 5.2 Vectorization

## What you'll learn

- The compiler can widen a loop when iterations are independent.
- A carried dependence, or a trip the compiler cannot see, keeps the loop scalar.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Vectorization is the compiler choosing SIMD for a loop you wrote as scalar. A reduction can be vectorized with care. A loop where `a[i]` depends on `a[i-1]` is a poor candidate. AVX on x86 and NEON on ARM are two spellings of the registers. The idea on this page is the widening, not a new algorithm per ISA.

## Picture

```text
scalar loop in, vector adds out.
```

## Hands-on

Look at the map loop from 4.1 and the scan from 4.6. Say which one a compiler can widen more directly.

## What changed the time

A widened loop still has to load and store. If the data is not contiguous, the loads dominate.

## Quiz

[Chapter 5: SIMD quiz](/docs/mcq/questions/domain/parallel/chapter-5/quiz/)

Previous: [5.1 What SIMD is](./what-simd-is/)

Next: [5.3 SIMD and threads](./simd-and-threads/)
