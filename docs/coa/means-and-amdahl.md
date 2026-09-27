---
title: "Summarizing Performance: Means and Amdahl's Law"
description: "How compiler engineers use mathematical means and Amdahl's law to evaluate optimization passes across benchmark suites."
keywords:
  - Amdahl's law
  - geometric mean
  - harmonic mean
  - compiler optimization evaluation
  - benchmark speedup
displayed_sidebar: coasidebar
slug: /coa/means-and-amdahl
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Summarizing Performance: Means and Amdahl's Law

The physical CPU executes instructions over time, but a compiler engineer evaluates optimizations across entire suites of programs. Understanding how to mathematically summarize these results and calculate the theoretical limits of an optimization prevents wasting months of engineering effort on passes that cannot yield measurable gains.

:::tip Read these first
- [Measuring Throughput, Cache Misses, and CPU Behavior](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — where the raw times and rates on this page come from
- [Computer Organization vs Computer Architecture](/docs/coa/intro_to_coa) — the split between the ISA contract and the machine that runs it
:::

:::important What you should leave with
- Use the geometric mean for speedup ratios. Swapping the baseline does not change the answer.
- Use the harmonic mean for rates such as IPC. The arithmetic mean of rates does not match total time.
- Use the arithmetic mean only for raw times of a workload that runs each program once.
- Amdahl's law caps the whole-program speedup by the fraction of time your pass actually touches.
:::

:::caution Who this is not for
If you have not measured a program yet, start with the measuring lesson. This page assumes you already have times or rates and need to summarize them without lying to yourself.
:::

:::note
A formula here is a check on a compiler pass, not a hardware spec. The compiler can change instruction count and CPI. It cannot change the cycle time of the chip.
:::

<div>
  <AdBanner />

## References

### Academic papers

- Gene M. Amdahl, "Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities," AFIPS Conference Proceedings, 1967. https://dl.acm.org/doi/10.1145/1465482.1465560
- Philip J. Fleming and John J. Wallace, "How Not to Lie with Statistics: The Correct Way to Summarize Benchmark Results," Communications of the ACM, 1986. https://dl.acm.org/doi/10.1145/5666.5673

### Benchmark rules

- SPEC CPU 2017 reports a geometric mean of ratios, not an arithmetic mean of run times. https://www.spec.org/cpu2017/Docs/overview.html

### Textbooks

- John L. Hennessy and David A. Patterson, *Computer Architecture: A Quantitative Approach*
- David A. Patterson and John L. Hennessy, *Computer Organization and Design*
- William Stallings, *Computer Organization and Architecture*

### Practical tools

- Linux `perf`, for the fraction of time a region actually takes
- LLVM `llvm-mca`, for whether a loop is a dependence chain or independent work
</div>

## Table of Contents

1. [TL;DR](#tldr)
2. [The mechanism](#the-mechanism)
3. [A worked example](#a-worked-example)
4. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
5. [Common misconceptions](#common-misconceptions)
6. [What To Read Next](#what-to-read-next)
7. [References](#references)

## TL;DR
*   **Decide on Geometric Mean** when summarizing speedup ratios relative to a baseline compiler to ensure consistent relative improvements regardless of which run is chosen as the baseline.
*   **Decide on Harmonic Mean** when averaging rates (such as IPC or throughput metrics) to maintain a direct, proportional relationship with total execution time.
*   **Decide on Arithmetic Mean** only when summarizing total raw execution times of a workload where each benchmark runs exactly once in sequence.
*   **Decide to profile execution hotness ($f$)** before writing an optimization pass, applying Amdahl's Law to determine if the maximum possible speedup justifies the complexity of the compiler transformation.

## The mechanism

To evaluate a compiler optimization, we must measure its impact on execution time. The fundamental equation of computer performance is the CPU performance equation:

$$\text{CPU Time} = \text{Instruction Count} \times \text{CPI} \times \text{Cycle Time}$$

A compiler can directly change two terms in this equation:
1.  **Instruction Count (IC)**: Reduced by optimizations like dead code elimination, common subexpression elimination, and instruction selection.
2.  **Cycles Per Instruction (CPI)**: Reduced by instruction scheduling (to avoid pipeline hazards), loop vectorization, and register allocation (to minimize memory stalls).

The compiler cannot change the physical **Cycle Time** of the hardware.

When evaluating these changes across a benchmark suite, we must summarize the results. Choosing the wrong mathematical tool leads to incorrect engineering decisions.

| Situation | Mathematical Behavior | What the Compiler Engineer Must Do |
| :--- | :--- | :--- |
| Summarizing absolute execution times of a fixed workload | Arithmetic mean preserves the sum of times; total time is directly proportional to the mean. | Use Arithmetic Mean. Ensure the workload represents the actual execution sequence. |
| Summarizing speedup ratios ($Time_{\text{old}} / Time_{\text{new}}$) across multiple benchmarks | Geometric mean maintains the property $GM(A/B) = 1/GM(B/A)$. It does not reward inflating a single benchmark's ratio. | Use Geometric Mean. Never use the arithmetic mean on ratios, as it biases results toward the benchmark used as the normalization base. |
| Summarizing execution rates (e.g., IPC, MIPS, or throughput) | Harmonic mean relates directly to total time because it sums the reciprocals of rates (which are proportional to time). | Use Harmonic Mean. Using the arithmetic mean on rates yields a value that does not correspond to actual total time spent. |
| Evaluating a targeted optimization (e.g., vectorizing a specific intrinsic) | Amdahl's Law limits overall speedup based on the execution fraction ($f$) of the targeted code. | Profile the workload first. If the target loop consumes only 2% of execution time ($f=0.02$), even an infinite speedup ($s=\infty$) yields a maximum 2.04% overall gain. |

### The Mathematics of Means

The **Arithmetic Mean** of $n$ values is:

$$\text{AM} = \frac{1}{n} \sum_{i=1}^{n} X_i$$

The **Geometric Mean** of $n$ values is:

$$\text{GM} = \sqrt[n]{\prod_{i=1}^{n} X_i}$$

The **Harmonic Mean** of $n$ values is:

$$\text{HM} = \frac{n}{\sum_{i=1}^{n} \frac{1}{X_i}}$$

<Tabs>
  <TabItem value="arithmetic" label="Arithmetic mean" default>
    <p>Use this on raw times of a fixed workload, when each program runs once and the total is what you care about. The mean stays proportional to the sum of the times.</p>
  </TabItem>
  <TabItem value="geometric" label="Geometric mean">
    <p>Use this on speedup ratios. Swapping which compiler is the baseline takes the reciprocal of the mean. The arithmetic mean of those same ratios does not.</p>
  </TabItem>
  <TabItem value="harmonic" label="Harmonic mean">
    <p>Use this on rates such as IPC, when the amount of work is what you hold fixed. It matches total time. The arithmetic mean of the rates does not.</p>
  </TabItem>
</Tabs>

:::tip Note
The geometric mean of speedups stays the same when you swap which compiler is the baseline. The arithmetic mean does not. That is why a benchmark suite reports a geometric mean.
:::

### Amdahl's Law

When an optimization improves only a fraction of a program, the overall speedup is governed by Amdahl's Law:

$$\text{Speedup}_{\text{overall}} = \frac{1}{(1 - f) + \frac{f}{s}}$$

Where:
*   $f$ is the fraction of execution time in the original program that is affected by the optimization.
*   $s$ is the speedup achieved for that fraction.

:::note
$f$ is a fraction of the original execution time, not a fraction of the source. A loop that is half the file can be 2% of the time.
:::

## A worked example

Consider the following C function that processes two arrays. It contains a sequential bottleneck and a vectorizable portion:

```c
void process_data(double *restrict a, double *restrict b, double *restrict c, int n, double *sum) {
    double local_sum = *sum;

    // Part 1: Sequential dependency (cannot be easily vectorized)
    for (int i = 0; i < n; i++) {
        local_sum = (local_sum + a[i]) * b[i]; // Loop-carried dependency
    }
    *sum = local_sum;

    // Part 2: Independent operations (fully vectorizable)
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i]; // No dependencies
    }
}
```

Let us analyze how a compiler optimization pass affects this code using the CPU performance equation and Amdahl's Law.

### Step 1: Analyzing the Hardware and Code Behavior

The two loops are not the same kind of work. Open the one you are about to change.

<Tabs>
  <TabItem value="sequential" label="Sequential chain" default>
    <p><code>local_sum = (local_sum + a[i]) * b[i]</code> carries a dependence from one iteration to the next. Under strict IEEE-754 rules the compiler cannot vectorize it. The loop stalls on the latency of the floating-point add and multiply.</p>
    <p><code>-ffast-math</code> is the lever that allows reassociation. Without that flag, the chain stays a chain.</p>
  </TabItem>
  <TabItem value="independent" label="Independent adds">
    <p><code>c[i] = a[i] + b[i]</code> has no carried dependence. A vectorizer can turn it into one SIMD add and cut the instruction count of that loop.</p>
    <p>That cut does not touch the sequential chain above it. Amdahl's law is what turns a faster second loop into a smaller whole-program speedup.</p>
  </TabItem>
</Tabs>

### Step 2: Applying Amdahl's Law

Assume a profiler shows that in our baseline run:
*   Total execution time is 100 seconds.
*   Part 1 (Sequential) takes 80 seconds ($f_{\text{seq}} = 0.80$).
*   Part 2 (Vectorizable) takes 20 seconds ($f_{\text{vec}} = 0.20$).

A compiler engineer writes an aggressive loop vectorization pass that targets Part 2. The pass successfully vectorizes the loop, reducing its execution time from 20 seconds to 5 seconds. This represents a speedup of $s = 4$ for Part 2.

Let us calculate the overall speedup using Amdahl's Law:

$$\text{Speedup}_{\text{overall}} = \frac{1}{(1 - 0.20) + \frac{0.20}{4}} = \frac{1}{0.80 + 0.05} = \frac{1}{0.85} \approx 1.176$$

The overall program speedup is **17.6%**, even though the vectorized portion was sped up by **400%** ($4\times$).

What if we spend another six months optimizing the vectorizer to achieve an infinite speedup ($s = \infty$) on Part 2?

$$\text{Speedup}_{\text{overall}} = \frac{1}{(1 - 0.20) + \frac{0.20}{\infty}} = \frac{1}{0.80 + 0} = 1.25$$

The absolute maximum speedup we can ever achieve by optimizing Part 2 is **25%**. This is the Amdahl limit. It tells the compiler engineer that further optimization of Part 2 has diminishing returns, and engineering effort should instead be redirected to Part 1 (e.g., by attempting to break the dependency chain using fast-math reassociation).

:::caution The limit is on the whole program
A 4× speedup on the vectorized loop is not a 4× speedup of the program. The sequential 80% is still there.
:::

:::warning
Do not invent a cycle count to make the speedup look precise. Use the measured fraction $f$ and the measured time of that region.
:::

## What the compiler can and cannot do

A compiler engineer must understand where the compiler has levers to change performance metrics and where the hardware or mathematical limits override compiler control.

<Tabs>
  <TabItem value="can" label="What the compiler can change" default>
    <p><strong>Instruction selection and scheduling.</strong> The compiler chooses the instructions and their order, so it changes instruction count and CPI. Scheduling the sequential chain to hide latency is the useful move. Shortening a cold path is not.</p>
    <p><strong>Profile-guided optimization.</strong> A profile gives the fraction <em>f</em> of each path. Unrolling and inlining belong on the hot path, where that fraction is large.</p>
    <p><strong>Loop tiling, fission, and fusion.</strong> These change how the loop touches memory, which changes stall cycles and therefore CPI. They do not change the cycle time of the chip.</p>
  </TabItem>
  <TabItem value="cannot" label="What it cannot change">
    <p><strong>A strict dependence.</strong> If the language rules forbid reassociation, the compiler cannot vectorize the carried chain. The hardware still waits on the add and the multiply.</p>
    <p><strong>Memory latency.</strong> A prefetch can overlap a miss. It cannot make DRAM faster when the working set does not fit.</p>
    <p><strong>The Amdahl limit of the algorithm.</strong> A general-purpose compiler does not turn a sequential reduction into a different parallel algorithm. If the hot fraction is the chain, the chain is the limit.</p>
  </TabItem>
</Tabs>

## Common misconceptions

### 1. "The arithmetic mean of speedups is a valid way to report average compiler performance."

This is false and highly misleading. If you use the arithmetic mean to summarize speedup ratios, your results will change depending on which compiler you choose as the baseline.

Consider two benchmarks, B1 and B2, evaluated on Compiler X and Compiler Y:

| Benchmark | Compiler X Time | Compiler Y Time | Speedup of Y over X ($Time_X / Time_Y$) | Speedup of X over Y ($Time_Y / Time_X$) |
| :--- | :--- | :--- | :--- | :--- |
| B1 | 10s | 5s | $2.0\times$ | $0.5\times$ |
| B2 | 5s | 10s | $0.5\times$ | $2.0\times$ |

*   If we calculate the **Arithmetic Mean of the speedups of Y over X**:
    $$\text{AM} = \frac{2.0 + 0.5}{2} = 1.25\times \text{ (suggesting Y is 25\% faster than X)}$$
*   If we calculate the **Arithmetic Mean of the speedups of X over Y**:
    $$\text{AM} = \frac{0.5 + 2.0}{2} = 1.25\times \text{ (suggesting X is 25\% faster than Y)}$$

This is a physical contradiction. Both compilers cannot be 25% faster than each other.

If we use the **Geometric Mean**:
*   Geometric Mean of Y over X: $\sqrt{2.0 \times 0.5} = 1.0\times$
*   Geometric Mean of X over Y: $\sqrt{0.5 \times 2.0} = 1.0\times$

The geometric mean correctly shows that the overall performance of the two compilers is identical.

### 2. "To find the average IPC of a suite of benchmarks, I should average their individual IPCs using the arithmetic mean."

This is incorrect because IPC (Instructions Per Cycle) is a rate. Averaging rates with the arithmetic mean overestimates performance because it does not account for the different number of cycles each benchmark runs.

Suppose we have two benchmarks, each executing $10^9$ instructions:
*   Benchmark 1 runs at $2.0$ IPC. It takes $0.5 \times 10^9$ cycles.
*   Benchmark 2 runs at $1.0$ IPC. It takes $1.0 \times 10^9$ cycles.

Total instructions executed = $2.0 \times 10^9$.
Total cycles consumed = $1.5 \times 10^9$.
The true overall IPC of the combined run is:

$$\text{True IPC} = \frac{2.0 \times 10^9 \text{ instructions}}{1.5 \times 10^9 \text{ cycles}} \approx 1.33 \text{ IPC}$$

*   If we use the **Arithmetic Mean** of the IPCs:
    $$\text{AM} = \frac{2.0 + 1.0}{2} = 1.5 \text{ IPC (incorrect, overestimates performance)}$$
*   If we use the **Harmonic Mean** of the IPCs:
    $$\text{HM} = \frac{2}{\frac{1}{2.0} + \frac{1}{1.0}} = \frac{2}{0.5 + 1.0} = \frac{2}{1.5} \approx 1.33 \text{ IPC (correct)}$$

The harmonic mean must always be used when averaging rates where the numerator (instructions, in this case) is constant across the measurements.

### 3. "Amdahl's law only applies to multi-core parallelization."

This is a common misunderstanding. Amdahl's law applies to *any* optimization that targets a subset of a program's execution.

If you write a compiler pass that optimizes 64-bit integer division by replacing it with a multiplication-by-inverse sequence, Amdahl's law dictates your limit. If division instructions only account for 3% of the program's total execution time, your optimization can never speed up the program by more than 3%, even if you reduce the latency of division to zero cycles. You must always measure the fraction of execution time ($f$) your optimization targets before committing to complex implementation details.

## What To Read Next

*   [Computer Architecture vs Computer Organization](/docs/coa/intro_to_coa) — Understanding the boundary between the ISA contract and the physical implementation.
*   [Measuring Throughput and Cache Misses](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — How to collect the raw performance counters needed to calculate $f$ and $s$ in real workloads.
*   [Basic Terminology in COA](/docs/coa/basic_terminology_in_coa) — A shared vocabulary for cycles, hazards, and memory stalls.

<AdBanner />
