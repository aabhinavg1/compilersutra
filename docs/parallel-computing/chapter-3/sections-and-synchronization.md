---
title: "3.3 sections and synchronization"
description: "Sections are a fixed split into different blocks."
displayed_sidebar: parallelChapter3Sidebar
---

# 3.3 sections and synchronization

## What you'll learn

- Sections are a fixed split into different blocks.
- A barrier is where the team waits until every thread arrives.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

A section is task parallelism: this block of code, and that block of code, at the same time. The adding list does not need sections. It needs a split loop. A barrier matters when later work uses every thread's result. The end of a parallel region already waits for the team.

## Picture

```text
section A and section B, then a barrier, then the final add.
```

## Hands-on

Name one place in the summing program where a wait is required. Name one place where a barrier inside the loop would only slow it down.

## What changed the time

An extra barrier adds waiting. Put it where the next step reads other threads' results.

## Quiz

[Chapter 3: OpenMP quiz](/docs/mcq/questions/domain/parallel/chapter-3/quiz/)

Previous: [3.2 reduction](./reduction/)

Next: [3.4 OpenMP project](./openmp-project/)
