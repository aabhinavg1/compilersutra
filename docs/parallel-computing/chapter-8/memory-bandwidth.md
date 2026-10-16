---
title: "8.3 Memory bandwidth"
description: "Bandwidth is how many bytes the machine can move per second."
displayed_sidebar: parallelChapter8Sidebar
---

# 8.3 Memory bandwidth

## What you'll learn

- Bandwidth is how many bytes the machine can move per second.
- A sum of a huge list is often waiting on those bytes.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Each number has to be loaded. Once the list is large, the adds are cheap next to the loads. More threads help until they are all waiting on memory. SIMD and threads do not create extra bandwidth. They can use what is there.

## Picture

```text
bytes in, a thin stream of adds.
```

## Hands-on

Estimate the bytes read to sum N integers. Compare that feeling with the six-number list, which fits in a register file after the first load.

## What changed the time

A kernel or loop that moves a lot and computes a little is bandwidth-bound. The roofline page in the GPU track is the picture for device code.

## Quiz

[Chapter 8: Measuring quiz](/docs/mcq/questions/domain/parallel/chapter-8/quiz/)

Previous: [8.2 Cache and false sharing](./cache-and-false-sharing/)

Next: [8.4 Load balancing](./load-balancing/)
