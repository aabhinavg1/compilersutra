---
title: "8.4 Load balancing"
description: "Balance means the workers finish near the same time."
displayed_sidebar: parallelChapter8Sidebar
---

# 8.4 Load balancing

## What you'll learn

- Balance means the workers finish near the same time.
- The worker with the most work sets the time.

## Video

The recording for this page is not up yet. These notes are the script for that recording and for the short slide deck.

## Concept

If one thread gets five of the six adds and the other gets one, the first thread sets the time. A static split by equal index ranges is fine when every item costs the same, as in this sum. It is a poor split when some items do much more work. Dynamic scheduling hands out the next chunk when a thread goes idle. It does not remove a dependence.

## Picture

```text
equal chunks. one long chunk beside an idle worker.
```

## Hands-on

Split six equal adds two ways: 3 and 3, then 5 and 1. Say which worker the second split waits on.

## What changed the time

Idle time is part of the parallel time. The answer can still be 28.

## Quiz

[Chapter 8: Measuring quiz](/docs/mcq/questions/domain/parallel/chapter-8/quiz/)

Previous: [8.3 Memory bandwidth](./memory-bandwidth/)

Next: [8.5 Profiling](./profiling/)
