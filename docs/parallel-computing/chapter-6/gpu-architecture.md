---
title: "6.2 GPU architecture"
description: "The host is the CPU side. The device is the GPU."
displayed_sidebar: parallelChapter6Sidebar
---

# 6.2 GPU architecture

## What you'll learn

- The host is the CPU side. The device is the GPU.
- A kernel is the function the device runs.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

The host launches the kernel and usually owns the list first. The device runs the kernel over many workers. The existing page What is a GPU? is the longer picture. This page is the host, the device, and the kernel, using the same list.

## Picture

```text
host list -> device list -> kernel -> device total -> host.
```

## Hands-on

Label host and device on the sketch. The final 28 has to come back if the host prints it.

## What changed the time

Launches and copies are part of the time, not a footnote under the kernel.

## Quiz

[Chapter 6: GPU Programming quiz](/docs/mcq/questions/domain/parallel/chapter-6/quiz/)

Previous: [6.1 Why GPUs](./why-gpus/)

Next: [6.3 Threads and blocks](./threads-and-blocks/)
