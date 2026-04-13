---
title: "Memory Hierarchy for Compiler Engineers: Why Your Code Misses Cache"
description: "A compiler- and systems-focused guide to memory hierarchy: latency, set conflict, write-allocate traffic, false sharing, TLB reach, prefetching, and memory-level parallelism."
keywords:
- memory hierarchy levels explained
- memory access latency comparison
- cache vs ram vs disk speed
- cpu memory access time breakdown
- memory bandwidth vs latency
- dram vs sram difference
- storage hierarchy in computer architecture
- latency numbers every programmer should know
- cache hit vs miss explained
- cache miss types compulsory capacity conflict
- cache replacement policies lru fifo random
- cache line size explained
- spatial vs temporal locality examples
- cache coherence protocol mesi
- inclusive vs exclusive cache hierarchy
- cache eviction policy explained
- virtual memory to physical memory translation
- page table walkthrough
- tlb miss penalty explained
- tlb reach and performance
- paging vs segmentation difference
- huge pages performance benefits
- write back vs write through performance
- write allocate vs no write allocate difference
- dirty bit in cache explained
- store buffer and write buffer explained
- memory alignment and padding performance
- false sharing performance issue explained
- numa architecture explained with example
- memory locality optimization techniques
- loop tiling cache optimization example
- prefetching hardware vs software
- compiler memory optimization techniques
- out of order execution memory latency hiding
- memory level parallelism explained
- cache aware vs cache oblivious algorithms
- pointer chasing performance issue
- stride access pattern cache performance
- sequential vs random memory access speed
- branch prediction vs memory latency interaction
- performance tuning memory bottlenecks
- systems performance engineering memory optimization
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AdBanner from '@site/src/components/AdBanner';

# Memory Hierarchy for Compiler Engineers: Why Your Code Misses Cache

If you work on compilers, runtimes, kernels, storage engines, or low-level application code, the useful question is not "what is cache?" The useful question is "what kind of miss did I just create, what hardware can hide it, and what code shape would have avoided it?"

This article assumes you already know the basic layers. The goal here is to connect those layers to the constraints that actually shape generated code and observed performance: cache hit latency, **set conflict**, **write-allocate** traffic, cache-line granularity, **TLB reach**, prefetch behavior, and the amount of latency the core can hide with out-of-order execution and memory-level parallelism.

## Measurement Host Used In This Article

The concrete numbers below were rerun on this machine, not copied from generic examples:

- CPU: `AMD Ryzen 7 9700X 8-Core Processor`
- OS: `Ubuntu 24.04`, Linux `6.17.0-20-generic`
- Compiler: `g++ 13.3.0` with `-O3 -march=native`
- Topology: `8` cores, `16` threads, `1` socket, `1` NUMA node
- Cache geometry from `lscpu -C`: `48 KiB` L1D per core, `1 MiB` L2 per core, `32 MiB` shared L3, `64 B` line size
- Method: single-thread runs pinned to one core where relevant; multithreaded false-sharing run used `8` threads
- Limitation: this host blocks unprivileged hardware perf events (`perf_event_paranoid=4`), so the article now reports measured time and TSC-derived cycles instead of fake cache-miss counters

## TL;DR for Busy Engineers

- Memory cost is roughly `latency x misses x lack of parallelism`.
- The machine pays by cache line, not by source-level variable.
- `L1 -> L3` is already about a `10x` slowdown, and `L3 -> DRAM` is often another `10x`.
- **TLB reach** can dominate runtime even when the data-cache footprint looks healthy.
- The best optimization is usually a better access pattern, not a fancier instruction.

:::tip this article
If you are new to the surrounding COA material, read these first:

- [Computer Organization vs Computer Architecture](/docs/coa/intro_to_coa)
- [Basic Terminology in Computer Organization and Architecture](/docs/coa/basic_terminology_in_coa)
- [How CPUs Execute Binary: Fetch–Decode–Execute Explained](/docs/coa/cpu_execution)
- [From Concepts to Reality: Measuring Throughput, Cache Misses, and CPU Behavior in C++](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp)

:::

<div>
  <AdBanner />
</div>

## Table of Contents

1. [Latency Numbers That Matter](#latency-numbers-that-matter)
2. [The Hierarchy the Core Actually Sees](#the-hierarchy-the-core-actually-sees)
3. [Rule 1: Fits in Cache Does Not Mean Runs Fast](#rule-1-fits-in-cache-does-not-mean-runs-fast)
4. [Rule 2: The Machine Charges for Invisible Work](#rule-2-the-machine-charges-for-invisible-work)
5. [Rule 3: Translation Is Part of Memory Access](#rule-3-translation-is-part-of-memory-access)
6. [Rule 4: Prefetch Only Helps If the Pattern Gives It Time](#rule-4-prefetch-only-helps-if-the-pattern-gives-it-time)
7. [Code Example 1: Loop Tiling and Blocking](#code-example-1-loop-tiling-and-blocking)
8. [Code Example 2: False Sharing in Multithreaded Code](#code-example-2-false-sharing-in-multithreaded-code)
9. [Code Example 3: Small Locality Win, Not the Main Event](#code-example-3-small-locality-win-not-the-main-event)
10. [Code Example 4: Prefetch Failure Case](#code-example-4-prefetch-failure-case)
11. [FAQ for Working Engineers](#faq-for-working-engineers)
12. [Debugging Memory Bottlenecks](#debugging-memory-bottlenecks)
13. [Decision Framework for Compiler Engineers](#decision-framework-for-compiler-engineers)

## Latency Numbers That Matter

These rows were measured on the Ryzen `9700X` host above using a pinned benchmark harness. The cache rows come from randomized pointer chasing at working-set sizes chosen to fit roughly within one cache level. They are machine-specific, but they are far more honest than the placeholder values this article previously used.

| Event on this host | Measured cycles | Measured nanoseconds |
| --- | ---: | ---: |
| Register dependency chain | `3.55` | `0.94 ns` |
| L1-fit pointer chase (`16 KiB`) | `4.45` | `1.17 ns` |
| L2-fit pointer chase (`256 KiB`) | `11.77` | `3.10 ns` |
| L3-fit pointer chase (`8 MiB`) | `47.98` | `12.63 ns` |
| DRAM-like pointer chase (`128 MiB`) | `307.43` | `80.90 ns` |
| Storage random read | not measured here | outside the scope of this CPU-focused rerun |

Two points matter for compiler and systems work:

- The step from `L1` to `L3` is already an order-of-magnitude event. You do not need to hit DRAM before memory becomes the dominant cost.
- Translation can become part of the memory problem. A load that misses in the data TLB and then walks page tables is not "just a cache miss."

Key insight:

- On this host, `L1-fit -> L3-fit` was about `10.8x` slower.
- On this host, `L3-fit -> DRAM-like` was about `6.4x` slower.

Meaning:

- One bad memory access can wipe out the useful work of many instructions.
- A loop can look computationally cheap and still be dominated by one miss.

When people say a loop is "memory-bound," they usually mean one of three things:

1. It misses the fast cache levels often enough that data latency dominates issue bandwidth.
2. It streams enough data that sustained bandwidth, not latency, becomes the ceiling.
3. It generates enough outstanding misses or page-walk activity that the core spends its reorder-buffer budget waiting for memory.

## The Hierarchy the Core Actually Sees

The core does not see a single flat memory. It sees a filtered pipeline of increasingly expensive structures:

- register file
- load/store queues
- L1 data cache
- L2 cache
- LLC or L3
- memory controller and DRAM
- page tables during translation
- storage only when the operating system must bring data in or flush it out

That matters because different optimizations target different layers.

- Scalar replacement and register allocation target register reuse.
- Loop interchange, fusion, tiling, and layout transforms target cache locality.
- Huge pages and layout tuning can improve TLB behavior.
- Software prefetching and scheduling try to overlap miss latency with independent work.

The common mistake is to reason only in terms of total bytes touched. Hardware does not charge only by byte count. It charges by cache line, set pressure, translation footprint, outstanding miss count, coherence traffic, and access regularity.

The flow for the rest of the article is deliberate:

`latency -> cache -> conflict -> stores -> coherence -> TLB -> prefetch -> MLP`

Each step answers a deeper version of the same question: why did the machine refuse to make your "optimized" loop fast?

![Memory hierarchy for compiler engineers diagram showing registers, L1 cache, L2 cache, L3 cache, local DRAM, remote DRAM, storage, and the TLB translation path](/img/coa/memory-hierarchy-for-compiler-engineers-diagram.png)

*Diagram: a memory access is shaped not only by which layer you hit, but also by translation cost, placement, and coherence overhead before the data arrives.*

Interpretation:

- The core never sees "memory" as one flat pool.
- Every optimization chooses which layer pays for each access.
- The same loop can be limited by cache, translation, coherence, or bandwidth.

## Rule 1: Fits in Cache Does Not Mean Runs Fast

:::warning
You think your data fits in cache?

You are probably wrong.

Why:

- Cache capacity is not the whole story.
- Hardware evicts by set, not by your mental model of "total bytes."
- A loop can fit in aggregate size and still thrash because the hot lines collide in the same sets.
:::

A cache is divided into cache lines and sets. A physical address maps to one set; the cache can hold only a fixed number of lines for that set. Associativity describes how many candidate slots a line has once the set is chosen.

Reference for the cache-set and associativity model above:
- [Computer Architecture: A Quantitative Approach](https://books.google.com/books/about/Computer_Architecture.html?id=cM8mDwAAQBAJ), memory hierarchy chapter. Use this for the cache-line / set / associativity model.
- [What Every Programmer Should Know About Memory](https://www.akkadia.org/drepper/cpumemory.pdf), cache chapters and memory-layout discussion. Use this for the practical programmer view.

### Direct-mapped

Each address maps to exactly one line in exactly one set. Hit latency can be low, but conflict misses are brutal: two hot addresses mapping to the same set will evict each other continuously.

### Set-associative

Each address maps to one set, but the set contains multiple ways, commonly `4`, `8`, `12`, or `16`. This is the usual design point because it dramatically reduces conflict misses without the cost of fully-associative lookup.

### Fully-associative

Any line can go anywhere. This minimizes conflicts but is expensive to implement at useful sizes. In practice you mostly see it in small structures such as some TLB levels, not in large data caches.

Reason:

- Cache capacity is global, but eviction happens locally by set.
- A footprint can fit in total bytes and still thrash because too many lines map to the same set.

Example:

"The working set fits in L1" is incomplete. What matters is whether it fits **per set** under the actual indexing function.

Pathological example:

- L1D size: `48 KiB`
- line size: `64 B`
- associativity: `12-way`
- number of sets: `48 KiB / (64 B * 12) = 64`

If your loop strides by `4096 B`, every touched address has the same low 12 bits. Depending on the index bits used, many of those accesses can hammer the same small subset of sets. The aggregate footprint may be small enough to "fit in L1," but the set-local footprint can exceed eight lines and thrash anyway.

Consequence in compiler work:

- Unrolling can help or hurt depending on whether it increases useful independent work or amplifies set pressure.
- Structure layout and field packing change address alignment and therefore set mapping.
- A padding byte in the right place can outperform a heroic instruction-selection tweak.

## Rule 2: The Machine Charges for Invisible Work

The source code makes loads, stores, and scalar expressions visible. The machine charges for other things too:

- store ownership traffic
- cache-line granularity
- coherence transfers
- whether misses can overlap or must serialize

Those hidden costs are where a lot of "mysterious" performance loss comes from.

### Stores Are Not Free Just Because They Are Sequential

Loads get most of the teaching attention, but store behavior matters just as much for generated code.

Reference for write-through, write-back, write-allocate, and ownership traffic:
- [Computer Architecture: A Quantitative Approach](https://books.google.com/books/about/Computer_Architecture.html?id=cM8mDwAAQBAJ), memory hierarchy chapter.
- [Intel Optimization Reference Manual](https://www.intel.com/content/www/us/en/content-details/821612/intel-64-and-ia-32-architectures-optimization-reference-manual-volume-1.html), v50, Volume 1. Use this for store traffic, cache behavior, and tuning context.

For this article, the only point that matters is practical: a store miss can trigger **read-for-ownership** traffic, and a single-byte store still dirties a whole `64 B` line. If your kernel writes a destination once and does not reread it soon, non-temporal stores may beat filling cache with dead lines; if you want the policy details, use the Intel manual rather than treating this article as a substitute for measured store-path analysis.

### The Cache Line Is the Unit That Fights You

Cache coherence operates at cache-line granularity, not variable granularity. On most mainstream CPUs, the line is `64 B`. Two independent variables that happen to share one line are not independent to the coherence protocol.

Reference for cache-line granularity, coherence, and false sharing:
- [What Every Programmer Should Know About Memory](https://www.akkadia.org/drepper/cpumemory.pdf), sections on cache lines, coherence, and NUMA.
- [std::hardware_destructive_interference_size](https://en.cppreference.com/w/cpp/thread/hardware_destructive_interference_size). Use this for the portable C++ alignment constant in the snippet below.

False sharing occurs when:

- thread A writes one field in a line
- thread B writes a different field in the same line
- the line keeps bouncing between cores in modified or exclusive states

No logical data race is required. The cost comes from ownership transfer of the line itself.

This has direct implications for compiler and runtime work:

- Adjacent array elements updated by different threads may serialize through coherence traffic.
- Per-thread counters stored contiguously often scale terribly.
- Vectorized stores can aggravate the problem by touching more bytes of a shared line at once.

The fix is almost always line-aware layout:

- pad each thread-local object to cache-line size
- use per-core or per-thread sharding
- aggregate locally, then reduce later

```text
False sharing on one 64 B cache line

Before:

Core 0 writes counter[0]  -> [ counter0 | counter1 | counter2 | counter3 ]
Core 1 writes counter[1]  -> [ counter0 | counter1 | counter2 | counter3 ]
                                ^ same physical line keeps changing owner

Result:
line ping-pongs between cores -> coherence traffic -> stalled stores

After padding:

Core 0 writes [ counter0 | padding................................. ]
Core 1 writes [ counter1 | padding................................. ]

Result:
distinct lines -> ownership stays local
```

Failure story:

- A loop that looked perfectly vectorizable slowed down after a "helpful" widening because it touched more of a shared line and increased false-sharing traffic.

Consequence in compiler work:

- Parallel scheduling, data layout, and vector store width all interact with cache-line ownership, not just total bytes moved.

### Miss Cost Depends on How Much the Core Can Overlap

A single `200-cycle` DRAM miss is not always a `200-cycle` stall. Modern out-of-order cores try to overlap independent cache misses and unrelated computation.

Reference for out-of-order overlap, memory-level parallelism, and latency hiding:
- [Computer Architecture: A Quantitative Approach](https://books.google.com/books/about/Computer_Architecture.html?id=cM8mDwAAQBAJ), chapter on instruction-level parallelism and memory hierarchy interactions.
- [Intel Optimization Reference Manual](https://www.intel.com/content/www/us/en/content-details/821612/intel-64-and-ia-32-architectures-optimization-reference-manual-volume-1.html), v50, Volume 1.
- [Agner Fog's optimization manuals](https://www.agner.org/optimize/), for cycle-level and pipeline-aware performance explanations.

Two ideas matter:

#### Memory-level parallelism

MLP is the number of misses the machine can have outstanding at once. If the code exposes independent loads, the core can overlap them. If the code is a strict pointer chain where each address depends on the previous load, MLP collapses toward one.

#### Out-of-order execution

The core can issue later independent instructions while an earlier miss is in flight, constrained by:

- available independent instructions
- register dependencies
- reorder buffer size
- load/store queue capacity
- miss status holding registers and related tracking structures

This is why two loops with the same miss rate can have very different runtime:

- one loop exposes enough independent work to hide part of the latency
- the other is serialized by dependencies

Compilers influence this directly through unrolling, scheduling, software pipelining, vectorization, and layout transforms that increase independent in-flight memory operations.

Key point:

- The machine does not charge only for "how many misses."
- It also charges for whether the misses can overlap.

## Rule 3: Translation Is Part of Memory Access

Every load and store uses a virtual address. Before the data cache lookup can complete, the machine needs a physical address, or at least enough translation state to proceed. That is what the TLB caches: recent virtual-to-physical translations.

Reference for TLBs, page walks, and translation behavior:
- [Intel 64 and IA-32 Architectures SDM, Volume 3A, Chapter 4 "Paging"](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html). Use this for paging structures, translation, and page-walk definitions.
- [AMD64 Architecture Programmer's Manual, Volume 2: System Programming](https://www.amd.com/content/dam/amd/en/documents/processor-tech-docs/programmer-references/24593.pdf), Rev. 3.42, March 2024. For direct navigation, use Chapter 5, "Page Translation and Protection", especially Section 5.3 "Long-Mode Page Translation" (pp. 139-149 in the AMD TOC extract) and Section 5.5 "Translation-Lookaside Buffer (TLB)" (p. 157).
- [Computer Systems: A Programmer's Perspective, 3rd ed., Chapter 9 "Virtual Memory"](https://csapp.cs.cmu.edu/3e/students.html). Use this when you want the systems-programmer explanation instead of architecture-manual detail.

Important consequences:

- Good data-cache locality does not guarantee good translation locality.
- A data structure that spans many pages may thrash the TLB even when its per-page working set is small.
- Large pages increase TLB reach because one entry covers more memory.

For example, with `4 KiB` pages and `64` L1 DTLB entries, the first-level TLB covers only about `256 KiB` of sparse page footprint. If the same workload uses `2 MiB` huge pages, the reach increases dramatically.

When a TLB miss happens, the processor performs a page walk. If the relevant page-table entries are hot, the walk may be absorbed by cache. If not, translation itself becomes a multi-load memory operation. In pointer-heavy or graph workloads, page-walk cost can rival data-fetch cost.

Reason:

- A hot cache line is not enough if every access first pays for a cold translation.

Example:

- With `4 KiB` pages and `64` L1 DTLB entries, sparse traversal can burn through TLB coverage long before it burns through LLC capacity.

Consequence in compiler work:

- Blocking by bytes is incomplete. You also need to reason about pages, page walks, and **TLB reach**.

## Rule 4: Prefetch Only Helps If the Pattern Gives It Time

### Hardware prefetchers

Modern cores detect simple patterns such as:

- linear forward streams
- sometimes backward streams
- fixed-stride patterns

When the access pattern is regular enough, hardware can fetch future lines before the demand load arrives. This is why a sequential scan can approach bandwidth limits even though raw DRAM latency is hundreds of cycles.

Reference for hardware prefetch behavior and practical limits:
- [Intel Optimization Reference Manual](https://www.intel.com/content/www/us/en/content-details/821612/intel-64-and-ia-32-architectures-optimization-reference-manual-volume-1.html), v50, Volume 1. Use this for Intel’s optimization guidance on latency hiding and prefetching behavior.
- [Agner Fog's optimization manuals](https://www.agner.org/optimize/), especially the microarchitecture guide, for a practical cross-generation performance view.

### Compiler-directed prefetching

When the pattern is not simple enough for hardware prefetchers, the compiler or programmer can sometimes issue an explicit hint:

```cpp
__builtin_prefetch(ptr + 64, 0, 1);
```

The three arguments are:

- address to prefetch
- read/write intent, `0` for read and `1` for write
- locality hint, where higher values typically imply higher expected reuse

Software prefetching is delicate:

- too near and the data still arrives late
- too far and the line may be evicted before use
- too many prefetches can consume bandwidth and fill buffers without helping

It tends to help most in regular pointer-chasing or indirect-access loops with enough independent work between prefetch and use.

Reference for software prefetching tradeoffs:
- [Intel Optimization Reference Manual](https://www.intel.com/content/www/us/en/content-details/821612/intel-64-and-ia-32-architectures-optimization-reference-manual-volume-1.html), v50, Volume 1.
- [Agner Fog's optimization manuals](https://www.agner.org/optimize/). Use these when you want to reason about why a prefetch helps, does nothing, or actively hurts.

Reason:

- Prefetch does not remove latency. It only tries to start the miss earlier.

Example:

- In a strict pointer chain, a prefetch can still arrive too late. In a batched indirect-access loop, the same hint may hide much of the latency.

Consequence in compiler work:

- Prefetch distance, unroll factor, and software pipeline shape must cooperate. A hint without enough lead time is just overhead.

<div>
  <AdBanner />
</div>


## Code Example 1: Loop Tiling and Blocking

This is the first example because it is the clearest proof in the article that memory hierarchy changes the performance class of a loop.
<Tabs>
  <TabItem value="overview-1" label="What / Why" default>
    <ul>
      <li>A naive matrix multiply and a blocked matrix multiply using the same arithmetic.</li>
      <li>This is the right opening example because the data reuse story is obvious and the measured effect is large.</li>
    </ul>
  </TabItem>
  <TabItem value="expect-1" label="Expectation">
    <ul>
      <li>The blocked version should win heavily because it reuses <code>A</code>, <code>B</code>, and <code>C</code> while they are still resident.</li>
      <li>It also turns the hot inner loop into a contiguous access pattern the hardware can support well.</li>
    </ul>
  </TabItem>
  <TabItem value="result-1" label="What Happened">
    <ul>
      <li>On this host, the blocked version jumped from <code>0.75 GFLOP/s</code> to <code>26.81 GFLOP/s</code>.</li>
    </ul>
  </TabItem>
  <TabItem value="surprise-1" label="Surprise">
    <ul>
      <li>The speedup is so large that it can look like a different algorithm.</li>
      <li>It is not. The arithmetic is unchanged; the memory schedule is what changed.</li>
    </ul>
  </TabItem>
</Tabs>

<Tabs>
  <TabItem value="naive-matmul" label="Naive Code" default>

```cpp
void matmul_naive(const float* A, const float* B, float* C, int n) {
  for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
      float sum = 0.0f;
      for (int k = 0; k < n; ++k) {
        sum += A[(size_t)i * n + k] * B[(size_t)k * n + j];
      }
      C[(size_t)i * n + j] = sum;
    }
  }
}
```

The problem is `B[k][j]`, which walks a column of `B` in row-major layout.

  </TabItem>
  <TabItem value="blocked-matmul" label="Blocked Code">

```cpp
void matmul_blocked(const float* A, const float* B, float* C, int n) {
  constexpr int BS = 64;
  for (int ii = 0; ii < n; ii += BS) {
    for (int kk = 0; kk < n; kk += BS) {
      for (int jj = 0; jj < n; jj += BS) {
        int i_end = std::min(ii + BS, n);
        int k_end = std::min(kk + BS, n);
        int j_end = std::min(jj + BS, n);
        for (int i = ii; i < i_end; ++i) {
          for (int k = kk; k < k_end; ++k) {
            float a = A[(size_t)i * n + k];
            for (int j = jj; j < j_end; ++j) {
              C[(size_t)i * n + j] += a * B[(size_t)k * n + j];
            }
          }
        }
      }
    }
  }
}
```

Blocking changes the memory schedule so the inner loop becomes cache-friendlier.

  </TabItem>
</Tabs>

Measured on this host for `n = 1024`, single thread, `g++ 13.3.0 -O3 -march=native`:

| Version | Time | GFLOP/s | TSC cycles |
| --- | ---: | ---: | ---: |
| Naive | `2.85 s` | `0.75` | `10,825,613,052` |
| Blocked `BS=64` | `80.11 ms` | `26.81` | `304,411,806` |

Why tiling helps:

- It reuses a block of `A`, `B`, and `C` while they are still resident in cache.
- It converts repeated long-latency misses into a smaller number of amortized line fills.
- It gives the compiler a more vectorization-friendly inner loop with predictable contiguous accesses.

This is the core memory-hierarchy lesson in one benchmark: same math, different data movement, radically different runtime.

## Code Example 2: False Sharing in Multithreaded Code
<Tabs>
  <TabItem value="overview-2" label="What / Why" default>
    <ul>
      <li>Two multithreaded counter updates with the same logical work but different memory layout.</li>
      <li>This example isolates coherence cost: no algorithmic trick changes, only line ownership behavior changes.</li>
    </ul>
  </TabItem>
  <TabItem value="expect-2" label="Expectation">
    <ul>
      <li>The padded version should be faster because each thread mostly owns its own cache line.</li>
    </ul>
  </TabItem>
  <TabItem value="result-2" label="What Happened">
    <ul>
      <li>On this host, the padded version was about <code>9.8x</code> faster in wall-clock time.</li>
      <li>It also crossed <code>2.24B</code> updates per second.</li>
    </ul>
  </TabItem>
  <TabItem value="surprise-2" label="Surprise">
    <ul>
      <li>The speedup is much larger than in the matrix-locality example.</li>
      <li>False sharing is not a mild cache effect; it can completely dominate runtime.</li>
    </ul>
  </TabItem>
</Tabs>

<Tabs>
  <TabItem value="packed-counter" label="Packed Layout" default>

```cpp
#include <atomic>
#include <thread>
#include <vector>

struct Counter {
  std::atomic<long long> value;
};

int main() {
  constexpr int T = 8;
  constexpr long long N = 100'000'000;
  std::vector<Counter> counters(T);
  std::vector<std::thread> threads;

  for (int t = 0; t < T; ++t) {
    threads.emplace_back([&, t] {
      for (long long i = 0; i < N; ++i) {
        counters[t].value.fetch_add(1, std::memory_order_relaxed);
      }
    });
  }
  for (auto& th : threads) th.join();
}
```

Each thread updates its own counter, but adjacent counters usually land on the same cache line.

  </TabItem>
  <TabItem value="padded-counter" label="Padded Layout">

```cpp
#include <atomic>
#include <thread>
#include <vector>

struct alignas(64) PaddedCounter {
  std::atomic<long long> value;
  char pad[64 - sizeof(std::atomic<long long>)];
};

int main() {
  constexpr int T = 8;
  constexpr long long N = 100'000'000;
  std::vector<PaddedCounter> counters(T);
  std::vector<std::thread> threads;

  for (int t = 0; t < T; ++t) {
    threads.emplace_back([&, t] {
      for (long long i = 0; i < N; ++i) {
        counters[t].value.fetch_add(1, std::memory_order_relaxed);
      }
    });
  }
  for (auto& th : threads) th.join();
}
```

This version gives each thread one hot counter per line.

  </TabItem>
</Tabs>

Measured on this host with `8` threads pinned across the eight physical cores:

| Version | Time | Throughput | TSC cycles | Notes |
| --- | ---: | ---: | ---: | --- |
| Packed counters | `3.51 s` | `228M updates/s` | `13,319,555,218` | severe line ping-pong |
| `alignas(64)` padded | `0.36 s` | `2.24B updates/s` | `1,356,478,666` | ownership traffic mostly removed |

Portable C++ snippet when you want to express the intent without hard-coding a cache-line guess:

```cpp
#include <atomic>
#include <new>

struct CounterPair {
  alignas(std::hardware_destructive_interference_size)
  std::atomic<long long> a;

  alignas(std::hardware_destructive_interference_size)
  std::atomic<long long> b;
};
```

This is often a better teaching snippet than raw `alignas(64)`, because it tells the reader the real goal: avoid destructive interference between hot fields.

Why the fix helps:

- Each thread mostly writes to a distinct line.
- Coherence transitions drop sharply.
- Store buffers and write-back behavior now work with the thread instead of against it.

Failure story:

- A loop optimized with vectorization slowed down because the wider stores increased cache-line pressure and turned a mild sharing pattern into repeat L1 thrashing and ownership transfer.

## Code Example 3: Small Locality Win, Not the Main Event

This example stays in the article for one reason: it calibrates expectations after the dramatic cases above.
<Tabs>
  <TabItem value="overview-3" label="What / Why" default>
    <ul>
      <li>Two ways to sum the same large matrix.</li>
      <li>This example is here to show that access order can matter even when the win is real but modest.</li>
    </ul>
  </TabItem>
  <TabItem value="expect-3" label="Expectation">
    <ul>
      <li>The blocked version should usually win because it keeps a smaller active region hot in cache.</li>
      <li>The gap may stay modest because both versions still read the same total data and the recursive version is not catastrophically bad.</li>
    </ul>
  </TabItem>
  <TabItem value="result-3" label="What Happened">
    <ul>
      <li>On this host, blocking won by about <code>4.5%</code>.</li>
    </ul>
  </TabItem>
  <TabItem value="surprise-3" label="Surprise">
    <ul>
      <li>After the matmul and false-sharing examples, this result feels small.</li>
      <li>That is the point: not every locality rewrite changes the performance class of the code.</li>
    </ul>
  </TabItem>
</Tabs>

<Tabs>
  <TabItem value="recursive-sum" label="Recursive Code" default>

```cpp
double sum_recursive(const double* a, int n,
                     int r0, int r1, int c0, int c1) {
  if ((r1 - r0) * (c1 - c0) <= 4096) {
    double s = 0.0;
    for (int i = r0; i < r1; ++i) {
      for (int j = c0; j < c1; ++j) {
        s += a[(size_t)i * n + j];
      }
    }
    return s;
  }

  if ((r1 - r0) >= (c1 - c0)) {
    int mid = (r0 + r1) / 2;
    return sum_recursive(a, n, r0, mid, c0, c1) +
           sum_recursive(a, n, mid, r1, c0, c1);
  } else {
    int mid = (c0 + c1) / 2;
    return sum_recursive(a, n, r0, r1, c0, mid) +
           sum_recursive(a, n, r0, r1, mid, c1);
  }
}
```

This is cache-oblivious because it does not hard-code `L1` or `L2` sizes.

  </TabItem>
  <TabItem value="blocked-sum" label="Blocked Code">

```cpp
double sum_blocked(const double* a, int n) {
  constexpr int B = 64;  // 64x64 doubles = 32 KiB
  double s = 0.0;
  for (int ii = 0; ii < n; ii += B) {
    for (int jj = 0; jj < n; jj += B) {
      int i_end = std::min(ii + B, n);
      int j_end = std::min(jj + B, n);
      for (int i = ii; i < i_end; ++i) {
        for (int j = jj; j < j_end; ++j) {
          s += a[(size_t)i * n + j];
        }
      }
    }
  }
  return s;
}
```

This is cache-aware because the tile size is chosen deliberately.

  </TabItem>
</Tabs>

### Measured on this host

System: `4096 x 4096` `double` matrix, `g++ 13.3.0 -O3 -march=native`, single thread pinned to one core on the Ryzen `9700X`.

| Version | Time | TSC cycles | Comment |
| --- | ---: | ---: | --- |
| Recursive cache-oblivious | `10.30 ms` | `39,137,226` | slightly slower on this host |
| Fixed blocked cache-aware | `9.84 ms` | `37,398,916` | about `4.5%` faster here |

Why the blocked version wins here:

- It eliminates recursion overhead and improves branch predictability.
- The chosen tile size aligns well with row-major layout and L1/L2 reuse.
- The working set inside the tile is more regular for hardware prefetchers.

Why the cache-oblivious version is still interesting:

- It adapts across cache sizes without architecture-specific constants.
- For divide-and-conquer kernels such as transpose or recursive matrix multiply, it often generalizes better than one fixed block size.

## Code Example 4: Prefetch Failure Case

This is deliberately framed as a failure case, not as a general demonstration of prefetch "working."
<Tabs>
  <TabItem value="overview-4" label="What / Why" default>
    <ul>
      <li>A linked-list walk with and without an explicit prefetch hint.</li>
      <li>This example shows a bad shape for software prefetch: a strict dependency chain with almost no room to hide latency.</li>
    </ul>
  </TabItem>
  <TabItem value="expect-4" label="Expectation">
    <ul>
      <li>You might expect the prefetch version to help because the loop is latency-bound.</li>
      <li>That intuition is exactly what this example is meant to challenge.</li>
    </ul>
  </TabItem>
  <TabItem value="result-4" label="What Happened">
    <ul>
      <li>On this host, it was slightly slower: <code>666.89 ms</code> with prefetch versus <code>661.84 ms</code> baseline.</li>
    </ul>
  </TabItem>
  <TabItem value="surprise-4" label="Surprise">
    <ul>
      <li>This does not prove that prefetch is useless.</li>
      <li>It proves this particular loop is the wrong shape for prefetch to help.</li>
    </ul>
  </TabItem>
</Tabs>

<Tabs>
  <TabItem value="baseline-prefetch" label="Baseline Code" default>

```cpp
struct Node {
  Node* next;
  double value;
};

double sum_list(Node* p) {
  double s = 0.0;
  while (p) {
    s += p->value;
    p = p->next;
  }
  return s;
}
```

This version simply follows the dependency chain.

  </TabItem>
  <TabItem value="hinted-prefetch" label="Prefetch Code">

```cpp
double sum_list_prefetch(Node* p) {
  double s = 0.0;
  while (p) {
    if (p->next) {
      __builtin_prefetch(p->next->next, 0, 1);
    }
    s += p->value;
    p = p->next;
  }
  return s;
}
```

This version tries to start the next miss earlier with an explicit hint, but the dependency chain leaves very little useful lead time.

  </TabItem>
</Tabs>

Measured on this host for an `8,000,000`-node randomized list:

| Version | Time | Cycles per node | Comment |
| --- | ---: | ---: | --- |
| Baseline | `661.84 ms` | `314.36` | strict dependency chain |
| With prefetch | `666.89 ms` | `316.76` | slightly slower on this host |

What this result does and does not prove:

- The loop is still dependency-constrained.
- Prefetch only helps if there is enough distance between hint and use.
- On this machine, the added prefetch instruction cost slightly outweighed any latency hiding in this exact form.
- It does **not** prove that software prefetch is broadly useless.
- It does show that a strict pointer chain is a poor flagship example for successful prefetching.
- A successful prefetch case would need a different loop shape: regular enough to predict, but with enough independent work between hint and use to create real lead time.

## FAQ for Working Engineers

**How do I choose a tile size without turning the code into microarchitecture-specific folklore?**

Start from footprint, not superstition. Compute the live data in the innermost block, compare it with effective cache capacity rather than nominal capacity, then benchmark a small neighborhood of candidate sizes. Effective capacity is smaller because you also need room for other streams, metadata, and set-associativity slack. The best tile is often one of several nearby values, not a magical constant.

**When should a compiler emit software prefetch instructions automatically?**

Only when the access pattern is predictable enough that the compiler can place the hint at a useful distance and when the extra instructions do not crowd out the useful work. Streaming loops that hardware already prefetches well rarely benefit. Irregular indirect accesses with moderate independent work are the more plausible target.

**How do I tell whether a slowdown is cache capacity, conflict, or TLB related?**

Use this triage order:

1. Change only the working-set size.
If runtime rises smoothly as footprint grows, you are probably seeing capacity pressure.

2. Keep the total bytes similar, but change stride or alignment.
If runtime spikes only at specific strides or base alignments, suspect set conflict rather than pure capacity.

3. Keep the bytes similar, but change the number of pages touched.
If runtime tracks page count more than byte count, suspect TLB pressure or page walks.

Useful counter patterns:

- High `LLC` misses with modest `DTLB` misses: more likely cache capacity or conflict.
- Low `LLC` misses but high `DTLB` misses/page walks: more likely translation pressure.
- A dramatic slowdown only at certain powers-of-two strides: classic conflict-miss smell.

Simple disambiguation experiments:

- Add padding to break a pathological stride: if the slowdown disappears, it was likely conflict-related.
- Use larger pages or reduce sparse page footprint: if the slowdown drops sharply, TLB reach was likely part of the problem.
- Reduce the working set without changing the access pattern: if the slowdown drops smoothly, capacity was likely the main issue.

**Why does my loop still stall even though I see multiple outstanding misses?**

Because MLP is necessary but not sufficient. You may still be bottlenecked by reorder-buffer occupancy, load queue pressure, miss tracking capacity, memory bandwidth, or dependent uses that serialize retirement. Hiding part of a `200-cycle` miss is useful, but it does not turn a bad access pattern into a good one.

**When do huge pages materially help?**

When the working set spans enough pages that TLB miss and page-walk overhead become visible, especially in large in-memory databases, analytics engines, VM runtimes, and graph workloads. Huge pages are not free: allocation becomes less flexible, fragmentation concerns increase, and not every workload benefits.

## Debugging Memory Bottlenecks

Use counters as a decision aid, not as decoration:

- High `LLC` misses: check blocking, reuse distance, and whether the access pattern defeated locality.
- High `DTLB` misses or page walks: check page footprint, sparse traversal, and **TLB reach**.
- Low `IPC` plus high backend stalls: suspect latency-bound execution.
- High bandwidth usage with stable throughput: suspect streaming behavior rather than isolated misses.
- Many misses but decent runtime: the core may be hiding them with MLP; do not optimize the wrong bottleneck.
- Poor scaling across sockets: this article does not measure that case, so treat it as a separate placement problem rather than a conclusion from the benchmarks here.

Useful first-pass commands when perf access is available:

```bash
perf stat -e cycles,instructions,cache-references,cache-misses ./your_binary
perf stat -e dTLB-loads,dTLB-load-misses ./your_binary
perf stat -d ./your_binary
```

When you need call stacks instead of totals:

```bash
perf record -g ./your_binary
perf report
```

This machine blocked unprivileged hardware perf events while I measured the examples in this article, which is why the tables above use runtime and TSC-derived cycles instead of invented cache-miss counts.

## Decision Framework for Compiler Engineers

When a transformed loop gets slower, ask these questions in order:

1. Did I increase reuse or just move the same bytes around differently?
Matmul blocking is the positive case in this article: same arithmetic, much better reuse, massive gain.

2. Did I create hidden work the source does not show?
False sharing and store ownership traffic live here. The source may show "independent counters" while the machine sees one contested line.

3. Did I change page footprint as well as cache footprint?
A transform can reduce LLC misses and still lose if it wakes up too many pages and pays in TLB misses and page walks.

4. Did I expose more independent misses, or did I serialize them?
If the access pattern is a dependency chain, prefetching and out-of-order execution have very little room to help.

5. Is this a performance-class change or just a local cleanup?
The matrix-sum example matters because it keeps expectations honest. Some locality fixes buy a few percent. Others change the entire runtime profile.

Use that as a diagnosis checklist:

- If one loop order is `35x` faster, start with reuse and layout.
- If threading scales terribly, check cache-line ownership before blaming the scheduler.
- If slowdown appears only at certain strides or alignments, suspect set conflict.
- If byte footprint looks fine but runtime tracks pages touched, suspect translation.
- If the loop is a dependency chain, do not expect prefetch to save it.

That is the practical compiler lesson: do not ask only "what instructions did I emit?" Ask "what extra hardware work did this transform create, and at which layer does the machine start paying for it?"



## What To Read Next

- [Computer Architecture Roadmap](/docs/coa)
- [Computer Architecture vs Computer Organization](/docs/coa/intro_to_coa)
- [Basic Terminology in Computer Organization and Architecture](/docs/coa/basic_terminology_in_coa)
- [How CPUs Execute Binary: Fetch–Decode–Execute Explained](/docs/coa/cpu_execution)

<Tabs>
  <TabItem value="map" label="Reference Map" default>
    <ul>
      <li><a href="https://books.google.com/books/about/Computer_Architecture.html?id=cM8mDwAAQBAJ" target="_blank" rel="noopener noreferrer">Computer Architecture: A Quantitative Approach</a>: use the memory-hierarchy chapters for locality, cache organization, bandwidth-vs-latency tradeoffs, and the framing behind Rules 1 through 7.</li>
      <li><a href="https://csapp.cs.cmu.edu/3e/students.html" target="_blank" rel="noopener noreferrer">Computer Systems: A Programmer&apos;s Perspective, 3rd ed.</a>: use Chapter 6 &quot;Cache Memories&quot; and Chapter 9 &quot;Virtual Memory&quot;.</li>
      <li><a href="https://www.akkadia.org/drepper/cpumemory.pdf" target="_blank" rel="noopener noreferrer">What Every Programmer Should Know About Memory</a>: this is the closest match to the article&apos;s practical tone on cache behavior, translation, and real memory bottlenecks.</li>
      <li><a href="https://doi.org/10.1145/2071379.2071383" target="_blank" rel="noopener noreferrer">Cache-Oblivious Algorithms</a>: this is specifically why Example 1 includes the recursive cache-oblivious version at all.</li>
      <li><a href="https://en.cppreference.com/w/cpp/thread/hardware_destructive_interference_size" target="_blank" rel="noopener noreferrer">std::hardware_destructive_interference_size</a>: this is the direct source behind the portable false-sharing snippet and the advice to avoid magic `64` where possible.</li>
      <li><a href="https://www.intel.com/content/www/us/en/content-details/821612/intel-64-and-ia-32-architectures-optimization-reference-manual-volume-1.html" target="_blank" rel="noopener noreferrer">Intel Optimization Reference Manual, v50, Volume 1</a>: use this for prefetching, latency hiding, overlap, and tuning rules.</li>
      <li><a href="https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html" target="_blank" rel="noopener noreferrer">Intel 64 and IA-32 Architectures SDM</a>: for paging and translation, go to Volume 3A, Chapter 4, &quot;Paging&quot;.</li>
      <li><a href="https://www.amd.com/content/dam/amd/en/documents/processor-tech-docs/programmer-references/24593.pdf" target="_blank" rel="noopener noreferrer">AMD64 Architecture Programmer&apos;s Manual, Volume 2: System Programming, Rev. 3.42, March 2024</a>: for translation, go to Chapter 5, especially Section 5.3 &quot;Long-Mode Page Translation&quot; and Section 5.5 &quot;Translation-Lookaside Buffer (TLB)&quot;.</li>
      <li><a href="https://www.agner.org/optimize/" target="_blank" rel="noopener noreferrer">Agner Fog&apos;s optimization manuals</a>: use this when the question becomes instruction-level, microarchitecture-specific, or cycle-accounting-heavy.</li>
    </ul>
  </TabItem>

  <TabItem value="by-section" label="Used For">
    <ul>
      <li><strong>Latency and hierarchy framing:</strong> Hennessy/Patterson, CS:APP, Drepper.</li>
      <li><strong>Associativity, set conflict, and locality reasoning:</strong> Hennessy/Patterson, Drepper, Agner Fog.</li>
      <li><strong>False sharing and cache-line-aware C++:</strong> cppreference for interference size, plus Drepper for coherence context.</li>
      <li><strong>Cache-oblivious example:</strong> Frigo-Leiserson-Prokop-Ramachandran.</li>
      <li><strong>Prefetching and overlap discussion:</strong> Intel Optimization Manual, Agner Fog.</li>
      <li><strong>TLB, paging, and translation path:</strong> Intel SDM Volume 3A Chapter 4, AMD64 APM Volume 2 Chapter 5, CS:APP 3e Chapter 9.</li>
      <li><strong>Machine-specific follow-up for the measured host:</strong> AMD64 APM Volume 2 plus Zen-family optimization references.</li>
    </ul>
  </TabItem>

  <TabItem value="deep-dive" label="If You Want More">
    <ul>
      <li>If you want the most practical long-form read, start with <a href="https://www.akkadia.org/drepper/cpumemory.pdf" target="_blank" rel="noopener noreferrer">Drepper</a>.</li>
      <li>If you want the strongest architecture textbook treatment, start with <a href="https://books.google.com/books/about/Computer_Architecture.html?id=cM8mDwAAQBAJ" target="_blank" rel="noopener noreferrer">Hennessy and Patterson</a>.</li>
      <li>If you want systems code plus machine behavior, use <a href="https://csapp.cs.cmu.edu/3e/students.html" target="_blank" rel="noopener noreferrer">CS:APP</a>, especially Chapter 6 &quot;Cache Memories&quot; and Chapter 9 &quot;Virtual Memory&quot;.</li>
      <li>If you want vendor tuning detail, use the <a href="https://www.intel.com/content/www/us/en/content-details/821612/intel-64-and-ia-32-architectures-optimization-reference-manual-volume-1.html" target="_blank" rel="noopener noreferrer">Intel optimization manual</a> and the <a href="https://www.amd.com/content/dam/amd/en/documents/processor-tech-docs/programmer-references/24593.pdf" target="_blank" rel="noopener noreferrer">AMD64 System Programming manual</a>.</li>
      <li>If you want language-level portable C++ guidance for false sharing, use <a href="https://en.cppreference.com/w/cpp/thread/hardware_destructive_interference_size" target="_blank" rel="noopener noreferrer">cppreference</a>.</li>
    </ul>
  </TabItem>

  <TabItem value="snippets" label="Snippets">
    <p>Keep these nearby when you debug memory behavior:</p>

```bash
lscpu
lscpu -C
numactl --hardware
```

```cpp
alignas(std::hardware_destructive_interference_size)
std::atomic<long long> counter;
```

```bash
perf stat -e cycles,instructions,cache-references,cache-misses ./your_binary
```
  </TabItem>
</Tabs>
