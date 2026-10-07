---
title: "Why a parallel program is a different program"
description: "A serial sum is one list of steps. Splitting that list across workers adds a plan the serial source does not contain, and a serial tail that still runs on one worker."
keywords:
  - parallel program vs serial program
  - why parallel programming is different
  - serial tail
  - loop carried dependence
  - reduction clause
  - who owns the total
  - splitting a loop across workers
  - compiler will not invent parallelism
  - OpenMP reduction
  - private partial sum
  - fork and join
  - work the clock no longer carries
  - one list of steps
  - parallel algorithm
  - data race on a shared total
  - sequential fraction
  - start and collect
  - parallel computing for beginners
  - shared memory sum
  - what a compiler can parallelize
  - what a runtime cannot invent
  - teaching example sum to 28
  - serial loop beside split workers
  - parallel program structure
  - dependence chain
  - joining partial results
  - programmer writes the split
  - CompilerSutra parallel lesson
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/why-parallel-programs
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Why a parallel program is a different program

Take the list `2, 7, 1, 8, 2, 8`. Add the numbers in that order. The total is 28. A single core can do that with one loop: read a number, add it to a running total, read the next number. That program is one list of steps. A parallel version of the same total is a different program. It still has to produce 28, but the source now has to say who receives which number, where each partial sum lives, and how those partial sums become one answer. The compiler does not invent that plan from the serial loop.

:::tip Read these first

- [What is Parallel Computing?](/docs/parallel-computing/fundamentals/what-is-parallel-computing) — the words this page uses for work that overlaps in time
- [Program, Process, Thread, Core](/docs/parallel-computing/fundamentals/program-process-thread-core) — the four nouns behind "a worker"
- [Amdahl's Law and Gustafson's Law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law) — the bound that appears once a serial tail is left in the program

:::

:::important What you should leave with

- A serial program is one ordered list. The next step may use the result of the previous step.
- Splitting the list adds a plan the serial source does not contain: ownership, a meeting point, and a leftover serial tail.
- The tail is the work that still runs on one worker: starting the job, handing out pieces, and collecting the answers.
- You write that plan. Marking a loop as a wish is not the same as writing the contract the compiler and the runtime can follow.

:::

:::caution Who this is not for

This page does not report a speedup, a device model, or a cycle count. If you want a measurement method, use [Measuring Parallel Performance](/docs/parallel-computing/fundamentals/measuring-parallel-performance) after the program actually has a split you can time.

:::

:::note

`2 + 7 + 1 + 8 + 2 + 8 = 28` is a teaching list. It is short enough to draw. The same shape shows up in a long array: one running total, then a decision about whether that total may be split.

:::

:::warning

A `parallel for` without a reduction, an atomic, or a private total is a data race on this loop. The program can drop additions. Do not treat one lucky return value of 28 as proof that the split is correct.

:::

## Table of Contents

- [Why you should care](#why-you-should-care)
- [The mechanism](#the-mechanism)
- [A comparison](#a-comparison)
- [A worked example](#a-worked-example)
- [What the compiler and the runtime can and cannot do](#what-the-compiler-and-the-runtime-can-and-cannot-do)
- [Common misconceptions](#common-misconceptions)
- [Where this leaves you](#where-this-leaves-you)
- [What To Read Next](#what-to-read-next)
- [References](#references)

## Why you should care

Compiler engineers meet this the first time a loop "looks parallel" and the generated code is still one instruction stream. The source says `total = total + a[i]`. That statement is a chain. Iteration `i + 1` reads the total written by iteration `i`. A second core cannot run iteration `i + 1` until that write is visible, and even then both cores would be fighting over one location. Adding cores does not delete the chain. Someone has to change the program so the chain is broken into private pieces and joined again at a place the source names.

That change is the whole subject of parallel programming, before any API. OpenMP, threads, CUDA, and MPI are spellings of the same plan. This lesson stays on the plan. The spelling can wait until the words are ordinary: a list of steps, a worker, a private sum, and a join.

For a long time a faster clock made the serial loop finish sooner. The clock stopped carrying the work. More speed, on the machines people ship now, means more workers. A faster clock and more workers are different offers. The first one runs the same list of steps in less time per step. The second one asks for a different list.

## The mechanism

Walk the serial program on the teaching list. One worker owns `total`, which starts at 0.

1. Add 2. `total` is 2.
2. Add 7. `total` is 9.
3. Add 1. `total` is 10.
4. Add 8. `total` is 18.
5. Add 2. `total` is 20.
6. Add 8. `total` is 28.

Each line reads the previous total. The loop-carried dependence is that read. If you delete the dependence without putting a join in its place, you no longer have a sum. You have several numbers that happen to sit near each other.

A parallel plan for the same six numbers can hand them out in pairs:

- Worker A owns 2 and 7, and a private sum that becomes 9.
- Worker B owns 1 and 8, and a private sum that becomes 9.
- Worker C owns 2 and 8, and a private sum that becomes 10.

Those three private sums can be computed at the same time, because none of them reads another worker's total. The program is not finished. 9, 9, and 10 are not 28 until something adds them. That last addition, and the work of creating the workers and giving each one its pair, is the serial tail. It still runs in an order. It still sits on a worker that can see every partial result, or on a tree of joins the program wrote down. The tail is small on this list. On a real program it is whatever you could not, or did not, split: reading the input, the first and last iteration of a stencil that touches a shared edge, a printf of the answer, a memory allocator call, the join itself.

The picture below is the same loop twice. The left column is one worker and one total. The right column is three workers with private sums, and a tail that adds 9 + 9 + 10 on one worker.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 420" role="img" aria-labelledby="splitTitle splitDesc">
  <title id="splitTitle">A serial sum beside the same sum split across workers</title>
  <desc id="splitDesc">Left: one worker adds 2, 7, 1, 8, 2, 8 into one total and gets 28. Right: three workers keep private sums 9, 9, and 10. A serial tail on one worker adds those private sums to 28.</desc>
  <rect width="760" height="420" rx="12" fill="#f7f5f2"/>
  <rect x="24" y="56" width="320" height="340" rx="10" fill="#fff" stroke="#1f2933" stroke-width="1.5"/>
  <rect x="400" y="56" width="336" height="220" rx="10" fill="#fff" stroke="#1f2933" stroke-width="1.5"/>
  <rect x="400" y="292" width="336" height="104" rx="10" fill="#fff7ed" stroke="#9a3412" stroke-width="1.5"/>
  <text x="40" y="36" font-family="Georgia, serif" font-size="18" fill="#1f2933">One list of steps</text>
  <text x="416" y="36" font-family="Georgia, serif" font-size="18" fill="#1f2933">The same list, split</text>
  <text x="40" y="88" font-family="ui-sans-serif, sans-serif" font-size="14" fill="#1f2933">Worker 1 owns total</text>
  <text x="40" y="124" font-family="ui-monospace, monospace" font-size="15" fill="#1f2933">+2 → 2</text>
  <text x="40" y="152" font-family="ui-monospace, monospace" font-size="15" fill="#1f2933">+7 → 9</text>
  <text x="40" y="180" font-family="ui-monospace, monospace" font-size="15" fill="#1f2933">+1 → 10</text>
  <text x="40" y="208" font-family="ui-monospace, monospace" font-size="15" fill="#1f2933">+8 → 18</text>
  <text x="40" y="236" font-family="ui-monospace, monospace" font-size="15" fill="#1f2933">+2 → 20</text>
  <text x="40" y="264" font-family="ui-monospace, monospace" font-size="15" fill="#1f2933">+8 → 28</text>
  <text x="40" y="320" font-family="ui-sans-serif, sans-serif" font-size="14" fill="#1f2933">Each step reads the previous total.</text>
  <text x="416" y="88" font-family="ui-sans-serif, sans-serif" font-size="14" fill="#1f2933">A: 2+7 = 9, private</text>
  <text x="416" y="116" font-family="ui-sans-serif, sans-serif" font-size="14" fill="#1f2933">B: 1+8 = 9, private</text>
  <text x="416" y="144" font-family="ui-sans-serif, sans-serif" font-size="14" fill="#1f2933">C: 2+8 = 10, private</text>
  <text x="416" y="184" font-family="ui-sans-serif, sans-serif" font-size="14" fill="#1f2933">A, B, and C do not read each other.</text>
  <text x="416" y="324" font-family="ui-sans-serif, sans-serif" font-size="14" fill="#9a3412">Serial tail, one worker</text>
  <text x="416" y="352" font-family="ui-monospace, monospace" font-size="15" fill="#9a3412">9 + 9 + 10 = 28</text>
  <text x="416" y="378" font-family="ui-sans-serif, sans-serif" font-size="13" fill="#9a3412">Start, hand out, collect.</text>
</svg>
```

The right-hand program has more text than the left-hand program. That extra text is the parallel program. The numbers did not become parallel by themselves.

## A comparison

| | Serial sum | Split sum |
| --- | --- | --- |
| Source | One loop, one `total` | A private sum per worker, plus a join |
| Who may write `total` | The one worker running the loop | Each worker writes only its private sum; the tail writes the final total |
| Meeting point | There is none. The loop is the whole program | The tail, after every worker has finished its pair |
| What a dependence checker sees | A read of `total` after a write of `total` in the previous iteration | No cross-worker read inside the pairs; a dependence only at the join |
| What you had to write | The loop | The split, the private locations, and the join |

The two rows compute the same 28. They are not the same program. A reviewer who only checks the final number will miss the difference. A reviewer who reads the source will see a new owner for each piece and a new order constraint at the join.

## A worked example

The serial function is the left column of the picture. The OpenMP function is one spelling of the right column. The pragma is the contract: this region may run on a team, and `total` is a reduction with `+`, not a free-for-all store.

<Tabs>
  <TabItem value="serial" label="Serial loop" default>

```cpp
int sum_serial(const int* a, int n) {
  int total = 0;
  for (int i = 0; i < n; ++i) {
    total = total + a[i];
  }
  return total;
}
```

  </TabItem>
  <TabItem value="split" label="Split with a reduction">

```cpp
int sum_split(const int* a, int n) {
  int total = 0;
  #pragma omp parallel for reduction(+:total)
  for (int i = 0; i < n; ++i) {
    total = total + a[i];
  }
  return total;
}
```

  </TabItem>
</Tabs>

Line by line, on the teaching list `a = {2, 7, 1, 8, 2, 8}` and `n = 6`:

- `int total = 0` in the serial function creates the only location the loop will update. Every iteration reads it and writes it.
- The serial `for` walks `i` from 0 to 5. There is one trip count, one order, and one `total`.
- `total = total + a[i]` is the dependence. Drop any iteration and the returned value is no longer 28.
- In the split function, the same statement appears in the source. The pragma changes the contract around it.
- `parallel for` asks the OpenMP runtime to create a team and to partition the iteration space. The source does not name the partition. The clause says a partition is allowed.
- `reduction(+:total)` says each worker gets a private stand-in for `total`, initialized for `+` (zero), and that those stand-ins are combined with `+` after the team finishes. That combine step is the tail in the picture: 9 + 9 + 10, or whatever partition the runtime chose.
- `return total` in the split function reads the combined value, after the join. Reading it inside the loop, from another worker's private stand-in, is a different program again and is not what this clause does.

For this list the serial return value is 28. The split return value is also 28 if the reduction is honored. The intermediate states differ. After the workers have run and before the tail runs, the serial program has one `total` and the split program has several private sums. Code that prints `total` from inside the parallel loop is not inspecting "the" total. Each worker would print its own stand-in, and the program would be racing if it printed the shared name without the reduction semantics.

A useful bug to stare at is the same loop with the reduction clause removed and `total` left shared:

```cpp
int total = 0;
#pragma omp parallel for
for (int i = 0; i < n; ++i) {
  total = total + a[i];
}
```

That is a data race. Two workers can read the same old `total`, add different `a[i]`, and both write back. One write survives. The other addition is lost. The function can return a number smaller than 28, and it can return a different number on the next run. The `parallel for` did not supply a missing algorithm. It only removed the one-worker rule. The algorithm still has to say how the additions are combined.

## What the compiler and the runtime can and cannot do

**What the compiler can do**

- It can refuse to vectorize or parallelize the serial loop, because the dependence on `total` is real.
- It can outline an OpenMP parallel region into a function the runtime calls once per worker.
- It can implement `reduction(+:total)` by giving each worker a private integer and by emitting the combine after the worksharing loop.
- It can, in some serial loops with no carried dependence at all, auto-parallelize or vectorize. A loop that writes `b[i] = a[i] * a[i]` does not read a value produced by the previous iteration. That loop is a different case from the sum.

**What the runtime can do**

- It can create the team, hand each worker a slice of `i`, and wait until those workers return.
- It can add the private sums in an order it chooses. Addition on integers of this width is associative enough for this lesson's exact total; a floating-point sum is a different contract, and this page does not pretend the parallel order matches the serial order bit for bit.
- It can put the combine on one worker or fold it in a tree. Both are still a tail: a part of the program that is ordered with respect to the workers' private work.

**What they cannot do**

- They cannot look at `sum_serial` and know that you wanted a parallel sum rather than a serial checksum that is required to follow that exact order.
- They cannot invent the private sums if you did not write a reduction, an atomic, or a private variable yourself.
- They cannot decide that a race is harmless. Lost updates are lost updates.
- They cannot remove the tail. Starting the team and combining the partials is program text, even when a pragma hides the text in the compiler's outline.

So the sentence to keep is narrow. A compiler will not invent that split. You write the workers, what each one owns, and how the results meet. In OpenMP the pragma is that writing. It is short, and it is still part of the program. Leaving it out leaves the serial function in place.

## Common misconceptions

### A parallel program is the serial program, run on more cores

The serial function on more cores still has one `total` and one loop, unless something in the toolchain changes the contract. More cores with the serial binary are idle cores. The work is still one list.

### The compiler always parallelizes a for loop

That heading is the false claim. The serial `for` carries a dependence through `total`. A correct compiler keeps it serial unless a later pass can prove a transform that preserves the observable result, and even then the transform is that compiler's choice on that loop, not a promise about every `for` you write. The OpenMP program is parallel because the pragma says so, and only inside the rules of that pragma.

### More workers remove the serial tail

More workers change how the pairs are cut. They do not add 9 + 9 + 10 for you without a combine. A program with a large tail stays limited by that tail no matter how many workers take the pairs. [Amdahl's Law and Gustafson's Law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law) is the page that turns that observation into a bound. This page only asks you to see the tail in the source.

### The final value is enough to show the programs match

Both functions can return 28 on this list. The racy version can also return 28 on a lucky schedule and a smaller number on the next one. A single returned total does not certify the split. You certify it by reading who is allowed to write which location.

## Where this leaves you

You can now point at a serial loop and say whether it is one list or a split list. The test is the dependence, not the number of cores in the machine. If the next iteration must read what this iteration wrote, you either keep the loop serial or you write a new plan: private pieces and a join.

The teaching list is finished once the tail has produced 28. The next lessons on this site name the workers more carefully, then name the bound, then name how to time a program that actually has a split:

- [Program, Process, Thread, Core](/docs/parallel-computing/fundamentals/program-process-thread-core) — what "worker" is allowed to mean
- [Amdahl's Law and Gustafson's Law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law) — what the tail costs you as a fraction of the whole run
- [Measuring Parallel Performance](/docs/parallel-computing/fundamentals/measuring-parallel-performance) — how to time the program you wrote, instead of inventing a speedup for the one you did not

## What To Read Next

- [What is Parallel Computing?](/docs/parallel-computing/fundamentals/what-is-parallel-computing)
- [Program, Process, Thread, Core](/docs/parallel-computing/fundamentals/program-process-thread-core)
- [Memory Models](/docs/parallel-computing/fundamentals/memory-models) — the rules a shared `total` has to obey once more than one worker can see it
- [Amdahl's Law and Gustafson's Law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law)
- [Measuring Parallel Performance](/docs/parallel-computing/fundamentals/measuring-parallel-performance)

<div>
  <AdBanner />

## References

The idea on this page is the usual motivation for parallel programming: the clock stopped carrying the work, and a split program still has a serial tail. The wording and the diagram are ours. The citations below are where that motivation is developed at book length. This page does not quote them.

- Peter Pacheco, *An Introduction to Parallel Programming*. The opening chapter on why parallel computing, including the argument that a parallel program is written as a parallel program.
- Ananth Grama, Anshul Gupta, George Karypis, and Vipin Kumar, *Introduction to Parallel Computing*. The chapter on motivating parallelism, including the split between work that can overlap and work that stays ordered.
- OpenMP Application Programming Interface, the `reduction` clause on a worksharing loop. https://www.openmp.org/spec-html/5.2/openmpsu107.html
- [CompilerSutra: What is Parallel Computing?](/docs/parallel-computing/fundamentals/what-is-parallel-computing)
- [CompilerSutra: Amdahl's Law and Gustafson's Law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law)
