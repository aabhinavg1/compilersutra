---
title: "8.5 Profiling"
description: "A profile is a measurement from a tool."
displayed_sidebar: parallelChapter8Sidebar
---

# 8.5 Profiling

## What you'll learn

- A profile is a measurement from a tool.
- The hot line is the one the tool spent time in, not the one you guess.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

On the CPU, a sampler such as `perf` can show the summing loop. On an NVIDIA GPU, Nsight Systems can show the copy and the kernel as separate spans. On AMD, rocprof is the matching kind of tool. This page does not include a sample trace. When you run a tool, paste your own spans.

## Picture

```text
a timeline: copy, kernel, copy back.
```

## Hands-on

If you have none of those tools, use the two clock reads around the serial loop and around the parallel region. That is already a profile of two regions.

## What changed the time

Write the region name and the time from the run you did. Leave the other tools unnamed until you run them.

## Quiz

[Chapter 8: Measuring quiz](/docs/mcq/questions/domain/parallel/chapter-8/quiz/)

Previous: [8.4 Load balancing](./load-balancing/)
