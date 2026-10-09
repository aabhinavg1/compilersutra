---
title: "6.6 CUDA"
description: "CUDA names the host, the device, the copy, and the kernel for NVIDIA GPUs."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.6 CUDA

## What you'll learn

- CUDA names the host, the device, the copy, and the kernel for NVIDIA GPUs.
- The copy moves the list. The kernel does the adds.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

A CUDA run of this sum allocates device memory, copies the list over, launches a kernel, copies the total back, and frees the device memory. The CUDA track already on the site is the longer path. This page is that sequence on the six numbers.

## Picture

```text
cudaMemcpy to device, kernel, cudaMemcpy to host.
```

## Hands-on

List those steps in order. Circle the step that moves bytes, and the step that adds.

## What changed the time

Time the copy and the kernel separately when you have a device. The short list may be all copy.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.5 GPU memory](./gpu-memory/)

Next: [6.7 HIP and ROCm](./hip-and-rocm/)
