---
title: "6.10 GPU project"
description: "Print the serial total and the device total."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.10 GPU project

## What you'll learn

- Print the serial total and the device total.
- Separate the copy time from the kernel time if the API lets you.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

Use whichever track you can compile: CUDA, HIP, OpenCL, or Vulkan. The list sums to 28 on the host and on the device. Write down the times your machine reports. A laptop with no GPU can stop after the step list and come back when a device is available.

## Picture

```text
host 28, device 28, copy time, kernel time.
```

## Hands-on

Run it twice. Keep the second run's times if the first run includes one-time setup.

## What changed the time

Say which part was larger on your machine. That sentence is the result.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.9 Vulkan](./vulkan/)
