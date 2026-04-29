---
title: "GCC vs Clang Benchmarks: 10 Real C++ Cases"
description: "See GCC vs Clang benchmarks across 10 real C++ cases with runtime patterns, perf-counter context, and links to deeper assembly analysis."
keywords:
  - gcc vs clang benchmark 2026
  - gcc vs clang performance comparison linux
  - gcc vs clang o3 performance benchmark
  - gcc vs clang which is faster c++
  - real world c++ compiler benchmark gcc vs clang
  - g++ vs clang++ performance comparison
  - clang vs gcc performance on amd cpu
  - c++ compiler optimization benchmark o3
  - compiler performance comparison c++ linux
  - gcc vs clang branch prediction performance
  - gcc vs clang cache performance benchmark
  - ipc and instruction count compiler analysis
  - hardware performance counters perf linux c++
  - linux perf benchmark gcc vs clang
  - compiler optimization impact on ipc and cache
  - csperf compiler benchmark tool gcc vs clang
  - compilersutra perf tool benchmark
  - compiler_diff_batch gcc vs clang workflow
  - stencil vs branch workload compiler performance
  - memory bound vs compute bound compiler benchmark

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Head from '@docusaurus/Head';



📩 Interested in deep dives like pipelines, cache, and compiler optimizations?

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: '#fff',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>

import AdBanner from '@site/src/components/AdBanner';

<Head>
  <meta name="description" content="See GCC vs Clang benchmarks across 10 real C++ cases with runtime patterns, perf-counter context, and links to deeper assembly analysis." />
</Head>

# GCC vs Clang Benchmarks: 10 Real C++ Cases

>>> **How to read this report**

This article is structured to be both **quick to scan** and **deep to explore**, depending on what you need.

>> ***This GCC vs Clang performance comparison benchmark (2026) analyzes real C++ workloads using -O3 and hardware performance counters.***
- If you want the **headline result**, jump to the **Runtime results** and **Final takeaway** sections.
- If you care about **methodology and credibility**, read the **benchmark setup**, **batch workflow**, <br/>
  and **artifact sections**.
- If you are making an **engineering decision**, focus on:
  - which workloads show **clear wins**
  - which ones are **practical ties**
  - and how those patterns map to your own code

:::caution This is not 
a single-number benchmark.  
It is a **workload-by-workload comparison**, and it should be read that way.
:::
The goal is not to declare a universal winner, but to help you understand:
> *where each compiler performs well, and how to reason about that in practice.*

:::important How this report was created (AI + manual effort)

This benchmark report was created using a combination of **manual engineering work** and **AI-assisted writing**.

- **Benchmark design, workload selection, and execution:** 100% manual  
- **Tooling (CompilerSutraPerfTool, batch workflow, perf integration):** fully designed and implemented manually  
- **Data collection and validation (runtime + perf counters):** manual and reproducible  
- **Analysis and interpretation of results:** manual reasoning based on observed data  
:::

AI was used primarily for:
- refining phrasing
- improving readability
- structuring explanations

> The measurements, methodology, and conclusions are based on actual runs and engineering judgment, not AI-generated assumptions.

:::tip In short:
- **Core work (benchmark + analysis): ~80–90% manual**
- **Presentation and wording: ~10–20% AI-assisted**
:::

If you're building or experimenting with compilers, feel free to connect or reach out
 to discuss benchmarking and performance analysis.

<Tabs>
  <TabItem value="social" label="📣 Social Media">

            - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
            - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
            - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
            - [💬 Join the CompilerSutra Discord for discussions](https://discord.gg/DXJFhvzz3K)

  </TabItem>
</Tabs>


## Table of Contents

- [Why this benchmark is more credible](#why-this-benchmark-is-more-credible)
- [What this benchmark is measuring](#what-this-benchmark-is-measuring)
- [Benchmark setup](#benchmark-setup)
- [The local benchmark suite](#the-local-benchmark-suite)
- [What each case is actually checking](#what-each-case-is-actually-checking)
- [The batch workflow used](#the-batch-workflow-used)
- [Where the artifacts are](#where-the-artifacts-are)
- [Runtime results](#runtime-results)
- [How to read this table](#how-to-read-this-table)
- [First reading: overall win count](#first-reading-overall-win-count)
- [Second reading: where the strong wins happened](#second-reading-where-the-strong-wins-happened)
- [Third reading: which results are basically ties](#third-reading-which-results-are-basically-ties)
- [Which results matter most](#which-results-matter-most)
- [What the suite suggests](#what-the-suite-suggests)
- [How I would use this benchmark in practice](#how-i-would-use-this-benchmark-in-practice)
- [Why the branch result matters](#why-the-branch-result-matters)
- [Why the stencil result matters](#why-the-stencil-result-matters)
- [Why the batch script improves the quality of the article](#why-the-batch-script-improves-the-quality-of-the-article)
- [How to reproduce this on another machine](#how-to-reproduce-this-on-another-machine)
- [What to inspect next if one testcase matches your workload](#what-to-inspect-next-if-one-testcase-matches-your-workload)
- [Important caveats](#important-caveats)
- [Final takeaway](#final-takeaway)

Most `GCC vs Clang` comparisons on the internet are too small to be useful and too confident to be trusted.

Usually the pattern is the same. Someone writes one tiny loop, compiles it twice, posts one number, and jumps straight to a conclusion like "GCC is faster" or "Clang generates better code." That kind of post is quick to publish, but it does not help much if you actually build systems software, work on compilers, or care about performance behavior beyond a toy example.

:::tip This article takes a better route.
:::
Instead of benchmarking one loop, I created a folder of **10 small local C++ cases** inside this repo and ran them through the batch comparison flow in `CompilerSutraPerfTool`. The files are intentionally compact. I did not want giant synthetic benchmark sources whose size makes them look important without making them easier to interpret. I wanted files that are small enough to inspect directly but still represent distinct code shapes that compilers often optimize differently.

So this article is not trying to answer:

> Which compiler is universally better?

That would be a bad question.

It is trying to answer something narrower and much more useful:

> On this machine, with these exact compiler versions, using only `-O3`, across 10 local C++ workload shapes, how did `g++` compare to `clang++`?

That is a question worth benchmarking because it maps much more closely to how developers actually compare compilers in practice.

:::info TL;DR - What This Benchmark Found

Based on 10 local C++ workloads, batch-compared with GCC 13.3 and Clang 18.1 using only `-O3`:

| Category | Finding |
| --- | --- |
| Significant wins (>5%) | Clang on branch-heavy loop (`21.34%`) and small sort (`9.61%`); GCC on 2D stencil (`24.25%`) |
| Moderate wins (2-5%) | GCC on strided access and column-major traversal; Clang on indirect gather |
| Weak win / near tie | Rolling hash is a weak GCC lead; row-major traversal, prefix sum, and bit mix are practical ties |
| Overall split | GCC won `6 / 10`; Clang won `4 / 10` |
| Bottom line | No universal winner. GCC looked stronger on several memory-structured cases, while Clang looked stronger on branch-heavy and sort-heavy work. |

:::

## Continue Reading

- [Part 2A: Assembly Deep-Dive on 3 Key Benchmark Cases](/docs/articles/gcc_vs_clang_assembly_part2a)

<div>
    <AdBanner />
</div>

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good way to benchmark GCC vs Clang?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use the same source, the same optimization flags, repeated runs, and inspect runtime, perf counters, and generated assembly rather than relying on a single timing number.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why do GCC and Clang trade wins in benchmarks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Different workloads stress different optimizer and code generation decisions, so branch-heavy, memory-heavy, and vectorization-heavy cases do not produce the same winner.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why is one benchmark not enough for compiler comparison?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A single benchmark often reflects one code shape only. A meaningful compiler comparison needs multiple workloads that expose different optimization behaviors.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is an example of a realistic GCC vs Clang benchmark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A realistic benchmark suite includes branch-heavy loops, memory-structured traversal, sort behavior, and numeric kernels compiled with the same flags and measured repeatedly.',
          },
        },
      ],
    }),
  }}
/>

## Why this benchmark is more credible

There are a few reasons this comparison is stronger than the usual single-loop article.

First, it does not rely on one pattern. A compiler can look great on one loop and ordinary on another. That is not a flaw in the compiler or in the benchmark. That is just how optimization works. Different code shapes stress different parts of code generation.

Second, the benchmark files live in this repo. That means the cases are inspectable, attachable, and easy to rerun. The article is not asking the reader to trust an invisible benchmark suite.

Third, the workflow itself is batch-oriented. Instead of a pile of manually assembled runs, the suite was processed by the tool that was built for exactly this kind of folder-level comparison.

Fourth, the artifacts are saved. There is a `summary.csv`, a `summary.xlsx`, and per-file diff outputs. That matters because a benchmark article becomes much more useful when it leaves behind evidence instead of just a conclusion.

## What this benchmark is measuring

This article measures **runtime of the generated executable**.

It does **not** measure:

- compile-time speed
- frontend parsing speed
- diagnostics quality
- object file size
- final binary size
- debug info quality
- assembly readability

Those are real topics, but they are separate topics. Here the question is specifically about runtime behavior of the code emitted by the two compilers.

<div>
  <AdBanner />
</div>


## Benchmark setup

These measurements were taken on:

- **Date:** March 22, 2026
- **CPU:** AMD Ryzen 7 9700X 8-Core Processor
- **Platform:** Linux `6.17.0-19-generic`
- **Runner:** `csperf` native CPU runner
- **Warmup runs:** `1`
- **Measured runs:** `5`

### Compiler versions used

The benchmark used these compiler versions:

- **GCC:** `g++ (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0`
- **Clang:** `Ubuntu clang version 18.1.3 (1ubuntu1)`
- **Target:** `x86_64-pc-linux-gnu`
- **Thread model:** `posix`
- **InstalledDir:** `/usr/bin`

### Optimization mode used

This benchmark was intentionally kept simple.

**We used just `-O3`.**

**No extra architecture-specific flags or hand-tuned compiler options were added.**

This keeps the comparison focused on the default optimized code generation path of each compiler.

It also keeps the benchmark closer to the practical question that many developers actually ask first:

> What happens if I compile the same code with `g++ -O3` versus `clang++ -O3`?

That is a clean baseline question. Once you start mixing in `-march=native`, target-specific scheduling tweaks, or compiler-specific extra flags, you are asking a different question. That follow-up can be useful too, but it should be treated as a separate experiment.

### Exact version output

<details>
<summary>Show exact compiler version output</summary>

```bash
g++ --version
g++ (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0
Copyright (C) 2023 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

clang++ --version
Ubuntu clang version 18.1.3 (1ubuntu1)
Target: x86_64-pc-linux-gnu
Thread model: posix
InstalledDir: /usr/bin 
```

</details>

## The local benchmark suite

All benchmark sources used in this article live here:

The suite contains ten files:

| Case | File | Main pattern |
| --- | --- | --- |
| Branch-heavy loop | <a href="/files/articles/gcc_vs_clang_cases/branch_threshold.cpp" target="_blank">branch_threshold.cpp</a> | branch prediction and simple control flow |
| Strided access | <a href="/files/articles/gcc_vs_clang_cases/stride_access.cpp" target="_blank">stride_access.cpp</a> | cache-unfriendly memory access |
| Rolling hash | <a href="/files/articles/gcc_vs_clang_cases/rolling_hash.cpp" target="_blank">rolling_hash.cpp</a> | text scan style integer work |
| Row-major traversal | <a href="/files/articles/gcc_vs_clang_cases/row_sum.cpp" target="_blank">row_sum.cpp</a> | contiguous memory walk |
| Column-major traversal | <a href="/files/articles/gcc_vs_clang_cases/column_sum.cpp" target="_blank">column_sum.cpp</a> | poor locality over row-major storage |
| Small sort | <a href="/files/articles/gcc_vs_clang_cases/small_sort.cpp" target="_blank">small_sort.cpp</a> | compare-heavy sort path |
| Prefix sum | <a href="/files/articles/gcc_vs_clang_cases/prefix_sum.cpp" target="_blank">prefix_sum.cpp</a> | loop-carried dependency chain |
| Bit mixing | <a href="/files/articles/gcc_vs_clang_cases/bit_mix.cpp" target="_blank">bit_mix.cpp</a> | integer arithmetic and shifts |
| Indirect gather | <a href="/files/articles/gcc_vs_clang_cases/indirect_index.cpp" target="_blank">indirect_index.cpp</a> | indexed loads and pointer-like access |
| 2D stencil | <a href="/files/articles/gcc_vs_clang_cases/stencil_2d.cpp" target="_blank">stencil_2d.cpp</a> | local neighborhood |

These are still compact corner-case benchmarks. I want to be very clear about that. They are not pretending to be a production renderer, a database engine, or a compiler pipeline. But that does not make them useless. In fact, short focused files are often easier to reason about, easier to rerun, and easier to use as a comparison suite than bigger synthetic sources that mix too many effects together.

## What each case is actually checking

The benchmark table becomes much easier to trust when the reader understands what each file is doing.

### `branch_threshold.cpp`

This is the branch-heavy case. It repeatedly evaluates threshold-based conditions and updates an accumulator. The important part is not the arithmetic. The important part is that the hot loop is dominated by control flow shape.

This is useful because compilers do not just differ on vectorization or arithmetic throughput. They can also differ on how they structure branches, schedule compares, and generate code for small decision-heavy kernels.

### `stride_access.cpp`

This case intentionally walks memory in a less cache-friendly pattern. That makes it useful for observing how the compilers perform when the access pattern itself is already working against locality.

Real code is not always row-major and friendly. Strided access shows up in real systems, and it is exactly the kind of case a benchmark suite should include.

### `rolling_hash.cpp`

This is a compact text-scan style loop. It processes bytes, updates a rolling hash, and resets state when a delimiter appears.

That makes it interesting because it combines:

- sequential scanning
- integer state updates
- dependency on previous loop state
- delimiter-triggered branching

This kind of pattern is much closer to tokenization and scan-heavy systems code than a trivial arithmetic loop is.

### `row_sum.cpp` and `column_sum.cpp`

These two belong together.

`row_sum.cpp` is the cache-friendly traversal case.
`column_sum.cpp` is the locality-unfriendly variant over the same kind of row-major storage.

Together they tell a much better story than either one alone because they show how the result changes when the broad workload stays similar but the memory access order changes.

### `small_sort.cpp`

Sorting is worth including because compare-heavy code stresses a different set of compiler choices than simple traversal or arithmetic loops do.

A compiler comparison that never includes sort-style work misses a real and common class of hot path behavior.

### `prefix_sum.cpp`

This case matters because it contains a loop-carried dependency chain. That means it is not just an "easy vectorize this" benchmark.

Some real loops are limited by dependency structure, and compilers still have to make good decisions around instruction scheduling, loop organization, and generated code quality even when the optimization space is narrower.

### `bit_mix.cpp`

This is the integer-heavy arithmetic case. It leans on shifts, xors, multiplies, and accumulation.

That makes it useful for testing a different class of code than branchy logic or memory traversal. Integer-heavy kernels show up in hashing, ID mixing, checksums, and low-level utilities.

### `indirect_index.cpp`

This brings indirection into the suite.

Instead of a simple direct walk, it accesses data through an index mapping. That matters because indexed and gather-style access patterns often behave differently from clean linear loops.

### `stencil_2d.cpp`

This is the structured neighborhood update case.

Stencil-style code is useful in benchmark suites because it combines:

- arithmetic
- structured loop nests
- repeated nearby loads
- memory reuse
- regular but non-trivial access

That makes it a much richer benchmark than a simple one-dimensional sum.

## The batch workflow used

The benchmark was run through the batch comparison script in `CompilerSutraPerfTool`.

The exact command used to run the full suite:

```bash
python3 /home/aitr/projects/CompilerSutraPerfTool/scripts/compiler_diff_batch.py \
  ./gcc_vs_clang_cases \
  --config1 /home/aitr/projects/CompilerSutraPerfTool/configs/compiler_gcc.sample.json \
  --config2 /home/aitr/projects/CompilerSutraPerfTool/configs/compiler_clang.sample.json \
  --results-dir ./gcc_vs_clang_cases/batch_results \
  --warmup-runs 1 \
  --repeat-runs 5
```

The run completed successfully:


:::tip What happens internally
:::

Although the command above invokes a Python script, the execution pipeline goes deeper:

* The script calls **`csperf` (CompilerSutraPerfTool CLI)** for each source file
* `csperf` compiles the code using the selected compiler (`g++` or `clang++`) with `-O3`
* The compiled binary is then executed multiple times (warmup + measured runs)
* During execution, **Linux `perf`** is used to collect hardware performance counters

These counters include:

* CPU cycles and instructions (for IPC)
* cache references and misses
* branch instructions and mispredictions
* frontend stall cycles

This means the benchmark is not just measuring wall-clock time, but also capturing **low-level CPU behavior** via hardware PMU (Performance Monitoring Unit) counters.

As a result, the comparison reflects both:

* actual runtime performance
* underlying microarchitectural differences between compilers

That is important because it means the article is built on a folder-level workflow and not on a manually assembled comparison.

:::caution What is csperf?
## What is csperf?

`csperf` is the benchmarking tool used for this report. It acts as a unified wrapper:

- **Linux:** Uses `perf` for hardware counters (cycles, instructions, cache misses, branches)
- **macOS:** Uses `powermetrics` for power and performance data
- **Cross-platform:** Same CLI, same workflow, different underlying profilers

The batch script automated the entire comparison:

```bash
compiler_diff_batch.py ./gcc_vs_clang_cases --config1 gcc.json --config2 clang.json
```
:::
## Where the artifacts are

The generated outputs live here:

```text
./gcc_vs_clang_cases/batch_results
```

That directory contains:

- per-file GCC result JSON and CSV
- per-file Clang result JSON and CSV
- per-file GCC vs Clang diff JSON and CSV
- per-file derived diff JSON and CSV
- one batch `summary.csv`
- one batch `summary.xlsx`

This is a real advantage over the typical benchmark blog post. If one result looks odd, you can inspect the corresponding per-file artifact instead of treating the article as the only layer of information.

### Download summary files

- <a href="/files/articles/gcc_vs_clang_cases/batch_results/summary.xlsx" target="_blank">summary.xlsx</a>

:::tip note
The summary.xlsx file provides a metric-level breakdown of each workload, while the runtime 
table in this article presents the aggregated outcome.

The former explains why results differ,
 while the latter shows which compiler ultimately performs better.
:::

If you want the fastest way to review the whole benchmark, start with `summary.csv`. If you want something easier to open in spreadsheet tools, use `summary.xlsx`.

### Per-testcase result files

Each testcase also has its own compiler outputs and diff files. That means readers can inspect one benchmark in isolation instead of only relying on the aggregate table.

| Test case | GCC result | Clang result | Diff CSV | Diff JSON |
| --- | --- | --- | --- | --- |
| Branch-heavy loop | <a href="/files/articles/gcc_vs_clang_cases/batch_results/branch_threshold-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/branch_threshold-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/branch_threshold-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/branch_threshold-gcc-vs-clang.json" target="_blank">json</a> |
| Strided access | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stride_access-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stride_access-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stride_access-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stride_access-gcc-vs-clang.json" target="_blank">json</a> |
| Rolling hash | <a href="/files/articles/gcc_vs_clang_cases/batch_results/rolling_hash-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/rolling_hash-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/rolling_hash-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/rolling_hash-gcc-vs-clang.json" target="_blank">json</a> |
| Row-major traversal | <a href="/files/articles/gcc_vs_clang_cases/batch_results/row_sum-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/row_sum-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/row_sum-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/row_sum-gcc-vs-clang.json" target="_blank">json</a> |
| Column-major traversal | <a href="/files/articles/gcc_vs_clang_cases/batch_results/column_sum-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/column_sum-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/column_sum-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/column_sum-gcc-vs-clang.json" target="_blank">json</a> |
| Small sort | <a href="/files/articles/gcc_vs_clang_cases/batch_results/small_sort-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/small_sort-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/small_sort-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/small_sort-gcc-vs-clang.json" target="_blank">json</a> |
| Prefix sum | <a href="/files/articles/gcc_vs_clang_cases/batch_results/prefix_sum-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/prefix_sum-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/prefix_sum-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/prefix_sum-gcc-vs-clang.json" target="_blank">json</a> |
| Bit mixing | <a href="/files/articles/gcc_vs_clang_cases/batch_results/bit_mix-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/bit_mix-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/bit_mix-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/bit_mix-gcc-vs-clang.json" target="_blank">json</a> |
| Indirect gather | <a href="/files/articles/gcc_vs_clang_cases/batch_results/indirect_index-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/indirect_index-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/indirect_index-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/indirect_index-gcc-vs-clang.json" target="_blank">json</a> |
| 2D stencil | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stencil_2d-gcc.json" target="_blank">gcc</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stencil_2d-clang.json" target="_blank">clang</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stencil_2d-gcc-vs-clang.csv" target="_blank">csv</a> | <a href="/files/articles/gcc_vs_clang_cases/batch_results/stencil_2d-gcc-vs-clang.json" target="_blank">json</a> |

## Runtime results

The batch diff used:

- `config1 = g++`
- `config2 = clang++`

Below is the runtime table, preserved exactly from the measured batch results.

| Workload | GCC Mean (ms) | Clang Mean (ms) | Winner | Lead |
| --- | ---: | ---: | --- | ---: |
| Branch-heavy loop | `15.2734` | `12.0140` | Clang | `21.34%` |
| Strided access | `73.3656` | `76.4150` | GCC | `4.16%` |
| Rolling hash | `49.5588` | `50.5464` | GCC | `1.99%` |
| Row-major traversal | `17.0486` | `17.0928` | GCC | `0.26%` |
| Column-major traversal | `147.9998` | `152.7346` | GCC | `3.20%` |
| Small sort | `75.7906` | `68.5092` | Clang | `9.61%` |
| Prefix sum | `27.9534` | `28.0234` | GCC | `0.25%` |
| Bit mix | `352.9750` | `352.4404` | Clang | `0.15%` |
| Indirect gather | `17.1246` | `16.6402` | Clang | `2.83%` |
| 2D stencil | `9.0740` | `11.2740` | GCC | `24.25%` |

### All 10 workloads graph

The chart below compares the mean runtime for all ten workloads in one place.

![GCC vs Clang across all 10 workloads](/files/articles/gcc_vs_clang_cases/graphs/all_workloads.svg)

### How to interpret the runtime graphs

- Shorter bars are better because lower runtime wins.
- The combined chart is useful for comparing overall workload shape differences.
- The per-testcase graphs are more useful for checking run-to-run consistency across the 5 measured runs.
- If two bars are very close, the classification table matters more than visual intuition.

## Measurement stability

All workloads were executed `5` times after `1` warmup run. The table below shows the coefficient of variation:

```text
CV = stdev / mean * 100
```

Lower CV means a more stable measurement. Very low CV values suggest a clean benchmark signal. Higher CV values do not invalidate the measurement, but they do mean the row should be interpreted with a little more care.

| Workload | GCC CV | Clang CV | Stability |
| --- | ---: | ---: | --- |
| Branch-heavy loop | `1.42%` | `9.01%` | Mixed |
| Strided access | `0.38%` | `0.22%` | Excellent |
| Rolling hash | `8.53%` | `0.79%` | Mixed |
| Row-major traversal | `1.59%` | `3.64%` | Good / Variable |
| Column-major traversal | `0.71%` | `0.43%` | Excellent |
| Small sort | `0.94%` | `0.76%` | Excellent |
| Prefix sum | `1.55%` | `0.68%` | Good / Excellent |
| Bit mix | `7.33%` | `0.34%` | Mixed |
| Indirect gather | `2.56%` | `2.51%` | Moderate |
| 2D stencil | `3.02%` | `3.09%` | Moderate |

The important point here is that the biggest wins are still large relative to the observed run-to-run noise. The near-tie rows remain near ties, and the strongest rows remain strong enough to matter.

## Performance counter summary

Beyond wall-clock time, the batch outputs also capture low-level hardware behavior through `perf`. Looking at the diff files case by case gives a cleaner view of *why* some results moved the way they did.

| Workload | Instructions | IPC | Cache Misses | Branch Mispredictions |
| --- | --- | --- | --- | --- |
| Branch-heavy loop | `3.06%` better on GCC | `36.74%` better on Clang | `4.74%` lower on Clang | `99.15%` lower on GCC |
| Strided access | `35.02%` better on GCC | `38.65%` better on GCC | `32.92%` lower on Clang | `30.27%` lower on Clang |
| Rolling hash | `14.36%` better on Clang | `0.44%` better on Clang | `4.09%` lower on Clang | `99.79%` lower on GCC |
| Row-major traversal | `28.24%` better on GCC | `28.90%` better on GCC | `9.24%` lower on Clang | `35.88%` lower on GCC |
| Column-major traversal | `30.24%` better on GCC | `32.18%` better on GCC | `22.69%` lower on Clang | `11.97%` lower on GCC |
| Small sort | `19.33%` better on GCC | `9.42%` better on GCC | `30.31%` lower on GCC | `0.64%` lower on GCC |
| Prefix sum | `31.40%` better on GCC | `31.16%` better on GCC | `8.80%` lower on GCC | `27.96%` lower on GCC |
| Bit mix | `6.25%` better on GCC | `9.55%` better on GCC | `8.30%` lower on Clang | `2.00%` lower on Clang |
| Indirect gather | `30.39%` better on GCC | `25.69%` better on GCC | `17.00%` lower on GCC | `40.42%` lower on GCC |
| 2D stencil | `0.94%` better on Clang | `20.74%` better on GCC | `3.16%` lower on GCC | `30.73%` lower on GCC |

These counter rows are not a substitute for deeper assembly or microarchitectural inspection, but they are very useful for pattern recognition:

- Clang’s biggest runtime win came in a branch-heavy case, which fits the idea of smoother control-flow handling.
- GCC’s strongest runtime win came in the stencil case, where its IPC and branch behavior look meaningfully stronger.
- In several rows, one compiler retires fewer instructions while the other wins on runtime. That is a reminder that instruction count alone is not the full story.

:::tip Does Instruction Count Explain Performance?
Instruction count alone was not a reliable predictor of performance. 
Differences in IPC and branch behavior frequently outweighed reductions in retired instructions.
:::

A simple example is **loop unrolling**.

When a compiler unrolls a loop, it often **increases the total instruction count** because the loop body is duplicated multiple times. At first glance, this looks worse if you only look at instruction count.

However, performance can still improve significantly because:

- **Fewer branches:** The loop control (compare + jump) happens less frequently, reducing branch overhead and misprediction risk.
- **Higher IPC:** With more independent instructions in the window, the CPU can issue and execute more instructions in parallel.
- **Better pipeline utilization:** The processor spends less time stalling on control flow and can keep execution units busy.

So even though the program retires **more instructions overall**, it may complete faster because:
> the CPU is doing more useful work per cycle and wasting less time on control flow.

This is exactly why instruction count alone is not sufficient — it ignores *how efficiently those instructions are executed*.

### Counter graphs

These graphs summarize the same counter categories across all 10 workloads:

#### IPC graph

![IPC across all workloads](/files/articles/gcc_vs_clang_cases/graphs/ipc_all_workloads.svg)

#### Instruction count graph

![Instruction count across all workloads](/files/articles/gcc_vs_clang_cases/graphs/instruction_count_all_workloads.svg)

#### Cache misses graph

![Cache misses across all workloads](/files/articles/gcc_vs_clang_cases/graphs/cache_misses_all_workloads.svg)

#### Branch mispredictions graph

![Branch mispredictions across all workloads](/files/articles/gcc_vs_clang_cases/graphs/branch_mispredictions_all_workloads.svg)

## Classifying the runtime differences

Using the measured runtime delta magnitudes, the results can be grouped more usefully than a simple win count:

| Workload | GCC Mean | Clang Mean | Delta | Classification |
| --- | ---: | ---: | ---: | --- |
| Branch-heavy loop | `15.2734` | `12.0140` | `21.34%` | Significant Clang win |
| Strided access | `73.3656` | `76.4150` | `4.16%` | Moderate GCC win |
| Rolling hash | `49.5588` | `50.5464` | `1.99%` | Weak GCC win |
| Row-major traversal | `17.0486` | `17.0928` | `0.26%` | Tie |
| Column-major traversal | `147.9998` | `152.7346` | `3.20%` | Moderate GCC win |
| Small sort | `75.7906` | `68.5092` | `9.61%` | Significant Clang win |
| Prefix sum | `27.9534` | `28.0234` | `0.25%` | Tie |
| Bit mix | `352.9750` | `352.4404` | `0.15%` | Tie |
| Indirect gather | `17.1246` | `16.6402` | `2.83%` | Moderate Clang win |
| 2D stencil | `9.0740` | `11.2740` | `24.25%` | Significant GCC win |

Classification used here:

- **Significant win**: `> 5%`
- **Moderate win**: `2% to 5%`
- **Weak win**: `1% to 2%`
- **Tie**: `< 1%`

This classification is easier to reason about than just saying one compiler won more rows than the other.

## Weighted summary

If you weight the results by magnitude instead of just counting wins, the picture becomes more balanced and more informative.

### Significant wins

| Winner | Workload | Advantage |
| --- | --- | ---: |
| Clang | Branch-heavy loop | `21.34%` |
| Clang | Small sort | `9.61%` |
| GCC | 2D stencil | `24.25%` |

### Moderate wins

| Winner | Workload | Advantage |
| --- | --- | ---: |
| GCC | Strided access | `4.16%` |
| GCC | Column-major traversal | `3.20%` |
| Clang | Indirect gather | `2.83%` |

### Weak win or practical tie

| Workload | Delta | Verdict |
| --- | ---: | --- |
| Rolling hash | `1.99%` | Weak GCC advantage |
| Row-major traversal | `0.26%` | Tie |
| Prefix sum | `0.25%` | Tie |
| Bit mix | `0.15%` | Tie |

This is a more useful summary than a plain `6 vs 4` split because it shows that the suite contains:

- `3` clearly strong wins
- `3` moderate wins
- `4` weak or tie-level rows

That is a more mature interpretation of the dataset.

## Strongest wins at a glance

If you want the shortest visual read of the benchmark, these are the most important rows:

| Type | Compiler | Workload | Lead |
| --- | --- | --- | ---: |
| Strongest overall GCC win | GCC | 2D stencil | `24.25%` |
| Strongest overall Clang win | Clang | Branch-heavy loop | `21.34%` |
| Second strong Clang win | Clang | Small sort | `9.61%` |
| Strongest moderate GCC win | GCC | Strided access | `4.16%` |
| Strongest moderate Clang win | Clang | Indirect gather | `2.83%` |

These rows are the most actionable ones in the whole report because the margins are large enough to matter and the testcase patterns are easy to relate to real code.

## Winner heatmap

This heatmap compresses the runtime outcome of all 10 workloads into one quick visual summary.

![Winner heatmap across all workloads](/files/articles/gcc_vs_clang_cases/graphs/winner_heatmap.svg)

## Per-testcase graphs

The following graphs show the five measured runs for GCC and Clang for each testcase, along with the mean runtime and the winner for that specific file.

### Branch-heavy loop

![Branch-heavy loop graph](/files/articles/gcc_vs_clang_cases/graphs/branch_threshold.svg)

### Strided access

![Strided access graph](/files/articles/gcc_vs_clang_cases/graphs/stride_access.svg)

### Rolling hash

![Rolling hash graph](/files/articles/gcc_vs_clang_cases/graphs/rolling_hash.svg)

### Row-major traversal

![Row-major traversal graph](/files/articles/gcc_vs_clang_cases/graphs/row_sum.svg)

### Column-major traversal

![Column-major traversal graph](/files/articles/gcc_vs_clang_cases/graphs/column_sum.svg)

### Small sort

![Small sort graph](/files/articles/gcc_vs_clang_cases/graphs/small_sort.svg)

### Prefix sum

![Prefix sum graph](/files/articles/gcc_vs_clang_cases/graphs/prefix_sum.svg)

### Bit mix

![Bit mix graph](/files/articles/gcc_vs_clang_cases/graphs/bit_mix.svg)

### Indirect gather

![Indirect gather graph](/files/articles/gcc_vs_clang_cases/graphs/indirect_index.svg)

### 2D stencil

![2D stencil graph](/files/articles/gcc_vs_clang_cases/graphs/stencil_2d.svg)

## How to read this table

There are two common mistakes people make with compiler benchmark tables.

The first is to look only at the win count. That gives some signal, but it misses the difference between a `24.25%` lead and a `0.15%` lead.

The second is to treat every testcase as equally representative of real software. That is also a mistake. Some rows are strong directional signals. Others are better understood as controlled spot checks.

A better reading strategy is:

- separate **clear wins** from **near ties**
- note **which code patterns** favored each compiler
- compare those patterns to the real hot paths you care about

That gives a much more useful interpretation than reducing the article to one headline winner.

## First reading: overall win count

If you count the cases:

- **GCC won 6 out of 10**
- **Clang won 4 out of 10**

That means GCC came out ahead more often in this benchmark run.

That is a valid observation and it should not be softened.

But a good benchmark report should not stop at the scorecard. The scorecard is only the first layer. The more important question is where the wins happened and how large they were.

## Second reading: where the strong wins happened

The strongest **Clang** result in this suite was:

- **Branch-heavy loop**, where Clang led by `21.34%`

The strongest **GCC** result in this suite was:

- **2D stencil**, where GCC led by `24.25%`

Those are not tiny margins.
Those are clear workload-level differences.

Clang also had a meaningful win in the sort case:

- **Small sort**, where Clang led by `9.61%`

GCC, on the other hand, looked stronger in several memory-oriented or traversal-sensitive cases:

- `stride_access`
- `column_sum`
- `stencil_2d`

That immediately tells us this suite is not describing one compiler as universally better. It is describing a workload-dependent pattern.

## Third reading: which results are basically ties

Some rows are close enough that the winner label should not be over-interpreted.

That is especially true for:

- `row_sum` at `0.26%`
- `prefix_sum` at `0.25%`
- `bit_mix` at `0.15%`

These are legitimate measured differences, but they are not the kind of gaps where I would make a big claim about one compiler being clearly superior for that code shape.

This is where many benchmark articles get sloppy. They treat every row the same, even when some rows are near ties and some rows are decisive. A professional benchmark report should separate those two situations.

## Which results matter most

If I had to weight the rows instead of treating them equally, I would give the most attention to the cases where:

- the margin is clearly non-trivial
- the pattern maps to real code people actually write
- the result is consistent with what the code is stressing

In this suite, that especially points to:

- `branch_threshold`
- `small_sort`
- `stencil_2d`

Those rows are more informative than the near-tie rows because the compiler difference is large enough to shape a real engineering decision.

By contrast, rows like `row_sum`, `prefix_sum`, and `bit_mix` are still worth reporting, but they should be treated with more restraint.

## What the suite suggests

The useful conclusion is not simply that GCC won `6/10`, and it is also not that "workload shape alone decides everything."

What this suite really shows is that the result is sensitive to code shape, compiler version, target machine, and the exact optimization setup. In this dataset, some patterns clearly leaned toward Clang, others leaned toward GCC, and a few were close enough that they should be treated as practical ties.

Clang looked better on:

- branch-heavy logic
- sort-heavy code
- indirect gather access

GCC looked better on:

- strided memory access
- column-style traversal
- the stencil case
- some scan/traversal cases

That is a better engineering answer than pretending one compiler is categorically better. The mature conclusion is not "X always wins" or "the workload is the only winner." It is that benchmark evidence needs to be taken case by case, and without running the real code path it is difficult to say which compiler will be best for a given project.

## How I would use this benchmark in practice

If I were evaluating compilers for a real codebase, I would not use this article as the final decision. I would use it as a filter.

For example:

- If the hottest path in my code looked branch-heavy, I would take Clang more seriously and inspect that path first.
- If the hot path looked like structured traversal or stencil-style memory reuse, I would take GCC more seriously.
- If the relevant code resembled one of the near-tie cases, I would assume the compiler difference might be small enough that build system, tooling, diagnostics, or ecosystem concerns could matter more.

That is the right use of a benchmark suite like this. It narrows the search space. It does not replace benchmarking the real application.


<div>
  <AdBanner />
</div>



## Why the branch result matters

The branch-heavy case is one of the most interesting rows in the table because the gap is large and the code shape is realistic.

A lot of real systems code is not dominated by giant vector loops. It is dominated by:

- thresholds
- dispatch decisions
- validation logic
- state-machine transitions
- parsing and protocol logic

If Clang is meaningfully stronger on a branch-shaped kernel like this one, that is worth noticing. It does not prove a universal law, but it does suggest that branch-heavy code paths deserve careful benchmarking instead of relying on compiler folklore.

## Why the stencil result matters

The 2D stencil result is equally important on the GCC side.

Stencil-like kernels are common in:

- numerical code
- image-style transforms
- simulation updates
- neighborhood-based processing

The fact that GCC led by `24.25%` here is not a trivial detail. That is a real and meaningful result. If a larger production kernel resembled this pattern, GCC would deserve serious attention in that environment.

## Why the batch script improves the quality of the article

Using `compiler_diff_batch.py` changes the quality of the workflow.

Without it, this article would be much weaker because it would just be a list of one-off commands. With it, the comparison becomes:

- folder-based
- repeatable
- structured
- scalable
- artifact-backed

That is how a real benchmark workflow should look. If more cases are added later, the methodology does not need to be reinvented. You add files to the folder and rerun the batch comparison.

## How to reproduce this on another machine

If you want to reproduce or extend this benchmark, the workflow is straightforward:

1. Keep the testcase folder unchanged.
2. Verify the compiler versions you want to compare.
3. Keep the optimization mode fixed.
4. Run the batch script against the folder.
5. Open `summary.csv` first, then drill into the per-case diff files.

The important part is consistency.

If you change compiler version, CPU model, kernel version, optimization flags, or repeat count, then you are running a different experiment. That is perfectly fine, but it should be treated as a new dataset rather than as the same benchmark with a different conclusion.

### Reproducibility checklist

To verify these results on another machine:

- [ ] Record your compiler versions
- [ ] Record your CPU model with `lscpu`
- [ ] Record your kernel version with `uname -r`
- [ ] Keep the optimization mode fixed at `-O3`
- [ ] Run the batch command exactly as shown
- [ ] Open `summary.csv` and compare the runtime directions first
- [ ] Check the CV values to confirm your local measurements are stable enough

If your results differ, the most likely reasons are:

- different CPU microarchitecture
- different compiler patch version
- system load or background activity
- power management differences
- kernel or perf environment differences

## What to inspect next if one testcase matches your workload

If one row in this article looks especially close to your real code, the next step is not to argue from the table alone.

The better next step is:

- open the matching per-case diff JSON
- look at execution time first
- then inspect cycles, instructions, IPC, branch behavior, and cache-related fields
- compare that back to what the source code is actually stressing

That is how you move from an interesting benchmark result to a useful compiler choice.

## Important caveats

This benchmark does **not** prove:

- that GCC is always faster than Clang
- that Clang is always worse on memory-heavy code
- that these results will reproduce unchanged on different CPUs
- that these same rankings will hold in your production codebase

It also does not mean you can infer the best compiler choice from benchmark category names alone.
A branch-heavy microbenchmark, a stencil kernel, and a real application module may share some traits, but they are still not the same thing.

What it **does** show is narrower and more useful:

> On this machine, with these exact compiler versions, using only `-O3`, GCC won more cases overall,
>> but Clang still had strong wins on specific patterns, and several results were close enough that
>> the real answer still requires benchmarking the actual workload.

That is the kind of conclusion a benchmark report should aim for: useful, bounded, and defensible.

## Final takeaway

If you want the shortest honest summary of this report, it is this:

- **GCC won more cases overall:** `6 / 10`
- **Clang still had strong wins:** especially in the branch-heavy and sort-heavy cases
- **the biggest GCC lead** was in the stencil case
- **the biggest Clang lead** was in the branch-heavy loop
- **some results were clear wins, while others were close enough that they should not be overstated**
- **without running the difficult or business-critical parts of your own code, it is hard to say which compiler will actually be best**

So if someone asks:

> GCC or Clang, which one is faster?

The correct answer from this benchmark is:

> In this 10-case `-O3` batch comparison, GCC came out ahead more often, but Clang was clearly better in some important cases, several rows were effectively near ties, and the safest conclusion is still to benchmark the real code you care about before choosing a winner.

That is not as dramatic as a one-line internet verdict, but it is much closer to the truth.

And that is what a good benchmark article should optimize for.

<div>
  <AdBanner />
</div>

## FAQ

### Which compiler won overall in this benchmark?

GCC won more cases overall in this report, but not by enough to justify a blanket claim that GCC is always faster. The workload pattern still mattered case by case.

### What was Clang strongest at?

Clang looked strongest on the branch-heavy loop and also showed strong results in the sort-heavy style workload.

### What was GCC strongest at?

GCC looked strongest in the stencil case and also held up well in several memory- and arithmetic-oriented workloads.

### Can I use this report to choose a compiler for production code?

Use it as a guide, not as a final decision. The report is useful for forming hypotheses, but the final choice should still be validated against your own hot paths.

### Why include raw JSON, CSV, and source-file links?

Because benchmark credibility improves when readers can inspect the exact artifacts behind the conclusions instead of only reading a summary table.

### Why was `-O3` used instead of `-march=native` or other flags?

This benchmark intentionally used only `-O3` to keep the comparison focused on default optimization behavior. Adding architecture-specific flags would introduce another variable and turn this into a different experiment.



### Does instruction count directly correlate with performance?

Not always. In several cases, one compiler retired fewer instructions but still ran slower. Factors like IPC, branch behavior, and memory access patterns often had a stronger impact on runtime.

### How stable are these measurements?

Each workload was run multiple times, and coefficient of variation (CV) was calculated. Most cases showed low variability, indicating stable and reliable measurements, while a few required more cautious interpretation.


### Can these results change on a different CPU?

Yes. Compiler performance can vary significantly across microarchitectures. Results on AMD CPUs may differ from Intel or ARM systems due to differences in cache design, branch predictors, and execution pipelines.



### Why not include larger real-world applications?

This report focuses on small, inspectable workloads to isolate specific optimization behaviors. Larger applications introduce multiple overlapping effects, making it harder to attribute performance differences to specific compiler decisions.



### What role did hardware performance counters play?

Hardware counters (via `perf`) helped explain *why* performance differed. They provided insights into IPC, cache behavior, and branch prediction, which are not visible from runtime alone.



### Are these results reproducible?

Yes, provided the same environment is used. Changes in compiler version, CPU, kernel, or system load can lead to different results, so reproducibility depends on controlling these variables.



### Why are some results labeled as ties?

Differences below ~1% were treated as practical ties. Such small gaps are often within noise or too small to meaningfully impact real-world performance decisions.



### Should I always benchmark before choosing a compiler?

Yes, especially for performance-critical code. Even well-designed benchmark suites cannot fully replace testing on your actual workload and deployment environment.



### Does this benchmark reflect compile-time performance?

No. This report focuses only on runtime performance of generated binaries. Compile time, diagnostics, and tooling experience are separate considerations.



### More Article

- [how LLVM solve MXN Problem](https://www.compilersutra.com/docs/llvm/llvm_basic/Why_What_Is_LLVM)
- [How to  Understand LLVM IR](https://www.compilersutra.com/docs/llvm/llvm_basic/markdown-features)
- [LLVM Tools](https://www.compilersutra.com/docs/llvm/llvm_extras/manage_llvm_version)
- [learn LLVM Step By Step](https://www.compilersutra.com/docs/llvm/llvm_extras/translate-your-site)
- [Power of the LLVM](https://www.compilersutra.com/docs/llvm/llvm_extras/llvm-guide)
- [How to disable LLVM Pass](https://www.compilersutra.com/docs/llvm/llvm_extras/disable_pass)
- [see time of each pass LLVM](https://www.compilersutra.com/docs/llvm/llvm_extras/llvm_pass_timing)
- [Learn LLVM step by Step](https://www.compilersutra.com/docs/llvm/intro-to-llvm)
- [Create LLVM Pass](https://www.compilersutra.com/docs/llvm/llvm_basic/pass/Function_Count_Pass)

<Tabs>
  <TabItem value="docs" label="📚 Documentation">
             - [CompilerSutra Home](https://compilersutra.com)
                - [CompilerSutra Homepage (Alt)](https://compilersutra.com/)
                - [Getting Started Guide](https://compilersutra.com/get-started)
                - [Skip to Content (Accessibility)](https://compilersutra.com#__docusaurus_skipToContent_fallback)


  </TabItem>

  <TabItem value="tutorials" label="📖 Tutorials & Guides">

        - [AI Documentation](https://compilersutra.com/docs/Ai)
        - [DSA Overview](https://compilersutra.com/docs/DSA/)
        - [DSA Detailed Guide](https://compilersutra.com/docs/DSA/DSA)
        - [MLIR Introduction](https://compilersutra.com/docs/MLIR/intro)
        - [TVM for Beginners](https://compilersutra.com/docs/tvm-for-beginners)
        - [Python Tutorial](https://compilersutra.com/docs/python/python_tutorial)
        - [C++ Tutorial](https://compilersutra.com/docs/c++/CppTutorial)
        - [C++ Main File Explained](https://compilersutra.com/docs/c++/c++_main_file)
        - [Compiler Design Basics](https://compilersutra.com/docs/compilers/compiler)
        - [OpenCL for GPU Programming](https://compilersutra.com/docs/gpu/opencl)
        - [LLVM Introduction](https://compilersutra.com/docs/llvm/intro-to-llvm)
        - [Introduction to Linux](https://compilersutra.com/docs/linux/intro_to_linux)

  </TabItem>

  <TabItem value="assessments" label="📝 Assessments">

        - [C++ MCQs](https://compilersutra.com/docs/mcq/cpp_mcqs)
        - [C++ Interview MCQs](https://compilersutra.com/docs/mcq/interview_question/cpp_interview_mcqs)

  </TabItem>

  <TabItem value="projects" label="🛠️ Projects">

            - [Project Documentation](https://compilersutra.com/docs/Project)
            - [Project Index](https://compilersutra.com/docs/project/)
            - [Graphics Pipeline Overview](https://compilersutra.com/docs/The_Graphic_Rendering_Pipeline)
            - [Graphic Rendering Pipeline (Alt)](https://compilersutra.com/docs/the_graphic_rendering_pipeline/)

  </TabItem>

  <TabItem value="resources" label="🌍 External Resources">

            - [LLVM Official Docs](https://llvm.org/docs/)
            - [Ask Any Question On Quora](https://compilersutra.quora.com)
            - [GitHub: FixIt Project](https://github.com/aabhinavg1/FixIt)
            - [GitHub Sponsors Page](https://github.com/sponsors/aabhinavg1)

  </TabItem>

  <TabItem value="social" label="📣 Social Media">

            - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
            - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
            - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
            - [💬 Join the CompilerSutra Discord for discussions](https://discord.gg/DXJFhvzz3K)

  </TabItem>
</Tabs>
