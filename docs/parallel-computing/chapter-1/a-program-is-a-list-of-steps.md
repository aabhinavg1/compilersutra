---
title: "1.1 A program is a list of steps"
description: "A program is steps in an order."
displayed_sidebar: parallelChapter1Sidebar
---

# 1.1 A program is a list of steps

## What you'll learn

- A program is steps in an order.
- Serial means one step finishes before the next one starts.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

A core reads an instruction, does it, then reads the next one. Adding the list looks like this: start at 0, add 2, add 7, add 1, and so on, until the list ends. Nothing else is happening to that total while one step runs.

## Picture

```text
worker: [2] then [7] then [1] then [8] then [2] then [8]
```

## Hands-on

Write a loop that sets total to 0 and adds each value. Run it. The printed total is 28.

## What changed the time

This page has one way to do the work, so there is no second time to compare.

## Quiz

[Chapter 1: Parallel Thinking quiz](/docs/mcq/questions/domain/parallel/chapter-1/quiz/)

Next: [1.2 Why one core stops being enough](./why-one-core-stops-being-enough/)
