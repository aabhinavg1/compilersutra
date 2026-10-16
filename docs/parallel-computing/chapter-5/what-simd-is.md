---
title: "5.1 What SIMD is"
description: "SIMD is one instruction applied to several values."
displayed_sidebar: parallelChapter5Sidebar
---

# 5.1 What SIMD is

## What you'll learn

- SIMD is one instruction applied to several values.
- Those values are lanes in one register.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

A scalar add does one pair of numbers. A SIMD add does several pairs with one instruction. The lanes share that instruction. They are not threads, and they do not have their own program counters.

## Picture

```text
one add, four lanes.
```

## Hands-on

Take four additions from the list. Write them as four scalar adds, then as one wide add.

## What changed the time

The wide add issues once. A branch that some lanes fail can still hold the others.

## Quiz

[Chapter 5: SIMD quiz](/docs/mcq/questions/domain/parallel/chapter-5/quiz/)

Next: [5.2 Vectorization](./vectorization/)
