---
title: "6.9 Vulkan"
description: "Vulkan compute runs a pipeline."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.9 Vulkan

## What you'll learn

- Vulkan compute runs a pipeline.
- The compiler emits SPIR-V. The driver compiles that for the device.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

The work is still a kernel over the list. The host builds a compute pipeline: a SPIR-V module, descriptor layouts, and a command buffer that copies, dispatches, and copies back. Vulkan is the page for readers who care what the compiler emits. It is the same sum, with a heavier launch contract.

## Picture

```text
source, SPIR-V, pipeline, device.
```

## Hands-on

Name the object that holds the compiled shader, and the buffer that holds the six numbers.

## What changed the time

Pipeline creation is paid up front. The dispatch is the step that runs the adds.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.8 OpenCL](./opencl/)

Next: [6.10 GPU project](./gpu-project/)
