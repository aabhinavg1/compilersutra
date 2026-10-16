---
title: "6.8 OpenCL"
description: "OpenCL finds a platform and a device, then builds a kernel."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.8 OpenCL

## What you'll learn

- OpenCL finds a platform and a device, then builds a kernel.
- A queue is where you submit the copy and the launch.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

The kernel can look like the CUDA kernel. The host code is longer, because you choose the platform, the device, and the context, and you compile the kernel source at runtime. The OpenCL pages already on the site cover that setup. Here the queue order is still: write the buffer, run the kernel, read the total.

## Picture

```text
platform, device, queue, kernel.
```

## Hands-on

Order the queue operations for the sum. The read of the total comes after the kernel.

## What changed the time

Runtime compilation is part of the first-run cost. A later launch can reuse the built kernel.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.7 HIP and ROCm](./hip-and-rocm/)

Next: [6.9 Vulkan](./vulkan/)
