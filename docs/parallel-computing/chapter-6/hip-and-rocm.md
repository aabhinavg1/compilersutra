---
title: "6.7 HIP and ROCm"
description: "ROCm is the AMD stack: compiler, runtime, and libraries."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.7 HIP and ROCm

## What you'll learn

- ROCm is the AMD stack: compiler, runtime, and libraries.
- HIP is a kernel language close to CUDA, aimed at that stack.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

The programming model does not change because the vendor changes. You still have a host, a device, a copy, and a kernel. HIP is the spelling. The ISA and the driver are not the CUDA ones. Do not expect a time from one vendor to carry over.

## Picture

```text
one kernel text, two lowering paths.
```

## Hands-on

Take the CUDA step list from 6.6 and rename the copy and the launch with HIP's names, once you are on the ROCm track.

## What changed the time

Compare a HIP time with a CUDA time only when you measured both. Otherwise report the run you have.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.6 CUDA](./cuda/)

Next: [6.8 OpenCL](./opencl/)
