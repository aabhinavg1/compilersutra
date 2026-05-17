---
title: "Validating Language Energy Efficiency Claims in C, C++, and Rust"
description: "A systems-level validation note for reproducing the energy-efficiency claim across C, C++, and Rust with fixed algorithms, perf counters, and power measurement."
keywords:
  - language energy efficiency benchmark
  - c c++ rust performance comparison
  - programming language energy validation
  - perf rapl benchmark methodology
  - systems compiler benchmarking
  - cache misses branch misses energy
  - language runtime compiler backend effects
---

import AdBanner from '@site/src/components/AdBanner';

# Validating Language Energy Efficiency Claims in C, C++, and Rust

I read the paper and then ran a local smoke test on this machine to see how far the claim actually holds in practice.

It is intentionally narrower than a generic "which language is best" post.
The goal is to test one claim carefully:

> once execution time, runtime behavior, core usage, and memory activity are controlled, language labels themselves should not explain much of the remaining energy difference.

That is the central conclusion of *It's Not Easy Being Green: On the Energy Efficiency of Programming Languages*.

## What the paper is saying

The paper argues that prior language-energy comparisons were often confounded by:

- different algorithms or different implementation quality
- different levels of parallelism
- runtime/JIT warmup
- garbage collection
- weak memory proxies
- treating language labels as if they were the same thing as implementations

Its main conclusion is that once you control those factors, the remaining language-specific energy effect mostly disappears and energy tracks execution time much more closely than earlier rankings suggested.

That means the benchmark question is not "which language wins globally?".
It is:

> if we force the same algorithm, same work, same core count, same warmup policy, and comparable compiler/runtime settings, do C, C++, Rust, Go, Java, and Python still separate in a meaningful way beyond runtime?

## How I made the numbers trustworthy

This is the part that turns benchmark content into benchmarking research.

For a result to be valid, the article should define each measured quantity operationally:

- `execution time`: wall-clock time for the steady-state interval only
- `energy`: integrated package / device energy over the same interval
- `memory traffic`: LLC misses and, where available, memory-controller traffic
- `cache misses`: LLC misses plus selected L1/L2 events
- `branch mispredicts`: retired branch miss events from the PMU
- `warmup complete`: a detectable steady state, not just a fixed number of iterations
- `runtime stable`: no further tier shifts, code replacement, or major GC-induced shape change during the measured window

That matters because a benchmark can be repeatable without being valid.

### Warmup is not a fixed number

A serious validity rule should not say "run 5 warmups" and stop there.
It should say how steady state is detected.

A practical policy is:

- run until the last `k` windows of runtime have low variance
- require JIT tier stabilization when the runtime supports it
- require allocation / GC rate to stabilize before measurement
- discard windows that show profile invalidation or recompilation spikes
- separate startup cost from steady-state execution cost

For JITted runtimes, the measured phase should begin only after:

- tiered compilation has reached the steady tier
- hot methods are no longer being recompiled
- GC pauses have settled to the expected steady pattern

For interpreters, warmup mostly means:

- import time is excluded
- caches and internal dispatch structures are primed
- any native extension initialization is excluded from the measured window

### A concrete steady-state rule

One defensible rule is:

- split the run into fixed-duration windows
- compute runtime and counter variance over a rolling suffix
- declare convergence only when the coefficient of variation is below a threshold, for example `1%` to `3%`, for several consecutive windows
- require correctness output to remain identical across the windows used for measurement

For Java, the convergence check should also watch:

- JIT compilation logs
- tier transitions
- GC logs
- safepoint activity

For Python, the same logic should watch:

- import and module initialization
- native-extension startup
- allocator activity

This is stricter than "warm up for N iterations", and that is the point.

## How to separate causes

The difficult part is not collecting counters.
The difficult part is identifying which layer caused the difference.

A useful causal decomposition is:

- language semantics
- runtime system
- compiler backend
- allocator / GC policy
- data structure and implementation quality
- hardware state

The benchmark should isolate these by design, not by post-hoc explanation.

### Backend control strategy

Treat language and backend as separate variables.

| Language | Primary backend to test | Secondary backend / variant |
| --- | --- | --- |
| C | GCC, Clang | different optimization levels, LTO on/off |
| C++ | GCC, Clang | different standard library / allocator combinations |
| Rust | rustc + LLVM | different LLVM codegen options, allocator choice |
| Java | HotSpot C2 | tiered vs steady-state, GC variants |
| Go | gc compiler | GC pacing, `GOMAXPROCS`, inlining / escape behavior |
| Python | CPython | PyPy, native-extension variants |

That distinction is essential.
If the article does not say which backend is used, it is not comparing languages. It is comparing backend ecosystems.

### SIMD policy

This must be explicit.

The benchmark should state whether SIMD is:

- enabled by default
- explicitly disabled
- forced to a target ISA
- allowed to differ by runtime

Why this matters:

- C and C++ can be vectorized by GCC or Clang
- Rust inherits LLVM vectorization behavior
- Java C2 may auto-vectorize in ways that look like "language speed"
- Go may have weaker vectorization in the same shape of loop
- Python often delegates SIMD to native libraries such as NumPy or BLAS, which means the measured work may not be Python at all

So every workload should record:

- whether vector instructions were emitted
- which SIMD width was actually used
- whether vectorization was from the compiler, the runtime, or a native library

### Assembly-level validation

For compiler-facing claims, the benchmark should not stop at counters.
It should inspect the generated code.

At minimum, record for each implementation:

- emitted vector instructions
- branch structure
- loop unrolling
- load/store shape
- aliasing assumptions
- inlining decisions

That lets you distinguish:

- `Rust is faster`
- from `LLVM produced better code for this loop`
- from `the implementation used a better data layout`

If the article does not show that distinction, a reviewer can reasonably dismiss the comparison as machine-code drift rather than language effect.

### Runtime isolation

For managed runtimes and interpreters, you need a decomposition of runtime cost.

For Java, separate:

- class loading and startup
- JIT compilation
- steady-state execution
- GC cost
- safepoint / synchronization overhead

For Go, separate:

- startup
- stack growth
- GC pacing
- goroutine scheduling

For Python, separate:

- interpreter dispatch
- import overhead
- reference counting
- native extension calls

For ML or array workloads in Python, also explicitly state whether the hot loop is:

- pure Python
- NumPy / SciPy / BLAS
- custom C extension
- GPU offload

Otherwise the article risks benchmarking the wrong layer.

### Counter interpretation

Counters are not conclusions.
They need interpretation.

Use them like this:

- high `branch-misses` with low IPC usually implies control-flow pressure
- high `cache-misses` with low IPC usually implies memory-bound behavior
- high instructions with similar wall time can mean more bookkeeping, not necessarily less efficiency
- high cycles with modest instructions often means stalled execution or backend inefficiency

The article should explicitly connect the counter pattern to the likely bottleneck class.

## Hardware disclosure requirements

Every serious run should publish the machine state.

Record:

- CPU model and stepping
- microarchitecture generation
- cache sizes
- memory topology and DRAM frequency
- socket and NUMA topology
- SMT status
- kernel version
- compiler/runtime versions
- microcode version if available
- governor / frequency policy
- turbo boost / boost state
- thermal / power management settings
- mitigation state for speculative-execution protections

Without this, another engineer cannot reproduce the run or reason about the power envelope.

## OS noise control

The system must be quiet enough that the counters mean something.

At minimum:

- pin the benchmark with `taskset` or equivalent
- keep the measured core(s) isolated from unrelated activity
- avoid background daemons during the measurement window
- prefer a dedicated host over a shared desktop
- record whether IRQ affinity was adjusted
- record whether turbo / boost was fixed
- record whether ASLR was left on or disabled for the run

If the benchmark is multicore, also state:

- which cores were used
- whether sibling SMT threads were reserved or disabled
- whether NUMA placement was fixed

## Statistical design

This needs to be explicit.

For each workload and implementation:

- run multiple independent trials
- randomize trial order
- report median and spread, not just mean
- report confidence intervals or bootstrap intervals
- flag outliers and explain whether they were discarded
- use the same aggregation rule for all languages

A reasonable reporting scheme is:

- median wall time
- median energy
- median of counters
- bootstrap 95% interval for the primary metric
- coefficient of variation for the steady-state windows

If one implementation is much noisier, that is itself a result and should be reported.

## What this repo can already support

This repository already has a strong home for compiler-performance articles under:

- [`docs/articles.md`](/docs/articles.md)
- [`docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter.md`](/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter.md)
- [`docs/articles/gcc_vs_clang_assembly_part2a.md`](/docs/articles/gcc_vs_clang_assembly_part2a.md)
- [`docs/articles/gcc_vs_clang_stencil_ir_passes_part2b.md`](/docs/articles/gcc_vs_clang_stencil_ir_passes_part2b.md)

Those articles already establish the site pattern for:

- workload-by-workload comparison
- perf-counter evidence
- source, IR, and assembly analysis
- linked artifacts and reproducibility

This is the right place to add a language-energy article because it fits the same technical style.

## What is true here right now

At the moment, this repo has a fully developed C++ compiler benchmark trail, but it does **not** yet contain a matched C, C++, and Rust energy dataset.

So the current state is:

- C++: supported by the existing GCC vs Clang articles and artifacts
- C: present in the repo as examples, but not yet as a matched energy benchmark suite
- Rust: not yet present as a matched benchmark suite

That means the paper's claim cannot be directly validated from the current artifacts alone.

What can be done here is:

1. add a new article page for the paper
2. define the benchmark methodology
3. add matching C, C++, and Rust implementations of the same workloads
4. run them under the same measurement harness
5. compare time, counters, and energy only after the controls are in place

## Exact Local Run

I also ran a local smoke test on this machine to validate the measurement path.

### Machine

- CPU: AMD Ryzen 7 9700X 8-Core Processor
- GPU: AMD Radeon RX 9060 XT visible through ROCm
- OS shell: `zsh`
- `perf`: installed
- `gcc`: installed
- `clang`: installed
- `rustc`: installed
- `go`: installed
- `python3`: installed
- `java`: installed
- `javac`: not installed

### Tooling Notes

On this host:

- `perf_event_paranoid` was initially too restrictive for hardware counters.
- I temporarily lowered it with:

```bash
printf 'compilersutra\n' | sudo -S sysctl kernel.perf_event_paranoid=-1
```

- CPU package energy via `power/energy-pkg/` was not usable on this machine.
- AMD GPU power reporting through `rocm-smi` was only partially readable.

That means this machine can validate timing and CPU counters, but not a full end-to-end energy claim without additional system support.

### Workload Used

For the local validation, I used one identical integer kernel across languages:

- `bitmix`
- same arithmetic
- same iteration count
- same pinned core
- same command-line input

This is not the full paper workload suite.
It is a controlled smoke test that answers whether the local toolchain and runtime stack can reproduce the basic "same algorithm, different implementation" pattern without the setup falling apart.

### Exact Commands

I created temporary sources under `/tmp/lang_energy_bench/` and compiled them as follows:

```bash
gcc -O3 -march=native -o /tmp/lang_energy_bench/bitmix_c /tmp/lang_energy_bench/bitmix.c
g++ -O3 -march=native -o /tmp/lang_energy_bench/bitmix_cpp /tmp/lang_energy_bench/bitmix.cpp
rustc -O -C target-cpu=native -o /tmp/lang_energy_bench/bitmix_rust /tmp/lang_energy_bench/bitmix.rs
go build -o /tmp/lang_energy_bench/bitmix_go /tmp/lang_energy_bench/bitmix.go
```

The runner used the same iteration count and core pinning for each language:

```bash
taskset -c 0 /tmp/lang_energy_bench/bitmix_c 50000000
taskset -c 0 /tmp/lang_energy_bench/bitmix_cpp 50000000
taskset -c 0 /tmp/lang_energy_bench/bitmix_rust 50000000
taskset -c 0 env GOMAXPROCS=1 GOGC=off /tmp/lang_energy_bench/bitmix_go 50000000
taskset -c 0 python3 /tmp/lang_energy_bench/bitmix.py 50000000
taskset -c 0 java -Xms256m -Xmx256m -XX:+UseSerialGC /tmp/lang_energy_bench/Bitmix.java 50000000
```

For counters, I used:

```bash
perf stat -x, -e task-clock,cycles,instructions,branch-misses,cache-misses taskset -c 0 /tmp/lang_energy_bench/bitmix_c 50000000
perf stat -x, -e task-clock,cycles,instructions,branch-misses,cache-misses taskset -c 0 /tmp/lang_energy_bench/bitmix_cpp 50000000
perf stat -x, -e task-clock,cycles,instructions,branch-misses,cache-misses taskset -c 0 /tmp/lang_energy_bench/bitmix_rust 50000000
perf stat -x, -e task-clock,cycles,instructions,branch-misses,cache-misses taskset -c 0 env GOMAXPROCS=1 GOGC=off /tmp/lang_energy_bench/bitmix_go 50000000
perf stat -x, -e task-clock,cycles,instructions,branch-misses,cache-misses taskset -c 0 python3 /tmp/lang_energy_bench/bitmix.py 50000000
perf stat -x, -e task-clock,cycles,instructions,branch-misses,cache-misses taskset -c 0 java -Xms256m -Xmx256m -XX:+UseSerialGC /tmp/lang_energy_bench/Bitmix.java 50000000
```

### Local Results

The observed results on this host were:

| Language | Wall time | Cycles | Instructions | Branch misses | Cache misses |
| --- | ---: | ---: | ---: | ---: | ---: |
| C | 0.15 s | 653,276,215 | 754,234,284 | 19,797 | 49,464 |
| C++ | 0.15 s | 654,086,866 | 756,498,725 | 24,716 | 56,618 |
| Rust | 0.15 s | 653,484,969 | 629,669,476 | 21,514 | 55,706 |
| Go | 0.12 s | 656,085,711 | 907,890,960 | 33,394 | 86,384 |
| Python | 10.64 s | 55,095,697,020 | 316,264,268,656 | 29,728,571 | 628,207 |
| Java | 0.46 s | 2,588,082,571 | 3,764,914,131 | 23,486,094 | 25,608,319 |

### What These Results Mean

The local smoke test supports three practical observations:

- C, C++, and Rust are very close on this CPU-bound kernel when pinned to one core.
- Rust retired fewer instructions than C and C++, but wall time stayed the same, which is why instruction count is not the same thing as energy or performance.
- Go is in the same general runtime band on this tiny kernel, but it retires more instructions than the native trio.
- Python is dominated by interpreter overhead, while Java sits in the middle because runtime/JIT cost is real but still much lower than pure interpretation.

This is consistent with the paper's general direction:

- the implementation matters more than the language label alone
- execution time dominates energy once the workload is controlled
- runtime behavior can be a larger effect than syntax or surface language design

## What Is Still Missing

To turn this into a paper-grade validation, the following still need to be added:

- a proper Java build path with `javac`, not just source-file mode
- a real energy counter path for CPU package energy
- GPU-side energy measurement that is actually reliable on this host
- the full benchmark family from the methodology:
  - matrix multiplication
  - graph traversal
  - parsers
  - web server request handling
  - compression
  - ML inference
  - memory-bound kernels
- warmup and steady-state collection for JITted runtimes
- repeated runs with confidence intervals
- cold-cache and warm-cache variants
- allocator/GC variants where relevant

## Benchmark Failure Modes To Avoid

These are the common mistakes that create fake language rankings:

- comparing different algorithms and calling them equivalent
- giving one language a native library while another uses a hand-rolled loop
- comparing JIT warmup against native steady-state
- letting different thread counts slip in across languages
- ignoring allocator differences
- using RSS as a proxy for memory activity
- ignoring SIMD differences
- treating compiler backend quality as language semantics
- measuring only one tiny kernel and generalizing globally
- ignoring the fact that energy often tracks execution time after controls are applied

## What A Stronger Conclusion Should Say

The current conclusion is intentionally careful, but it can be sharper.

Instead of saying:

> language labels themselves should not explain much of the remaining energy difference

say something closer to:

> many previously reported language-energy gaps shrink substantially once runtime behavior, backend quality, allocation behavior, vectorization, core count, and execution time are controlled.

That is more defensible because it leaves room for real differences that come from runtime systems or code generation, not from the abstract language label alone.

## Why This Is A Systems Question

The fundamental ambiguity is that "language" rarely maps cleanly to a single execution stack.

Examples:

- C and C++ can run through GCC or Clang
- Rust is usually LLVM-backed
- Java is HotSpot or another JVM
- Go is its own compiler/runtime stack
- Python often delegates hot loops to native extensions or GPU libraries

So the research question is really:

> what is the energy cost of a full execution stack that happens to be reached through a given language?

That is the right framing for a compiler- and systems-level benchmark.

## Where to add the actual benchmark work

If you want to turn this into a reproducible benchmark series, the most natural layout would be:

- `docs/articles/language_energy_efficiency_validation.md` for the writeup
- `docs/articles/language_energy_efficiency_cases/` for the reference workloads
- `docs/articles/language_energy_efficiency_cases/results/` for raw measurements
- `docs/articles/language_energy_efficiency_cases/graphs/` for plots

That mirrors the existing GCC vs Clang article layout and keeps code, results, and narrative together.

If this grows into a full benchmark article, the structure should be:

- `docs/articles/language_energy_efficiency_validation.md` for the narrative
- `docs/articles/language_energy_efficiency_cases/` for source code
- `docs/articles/language_energy_efficiency_cases/results/` for raw data
- `docs/articles/language_energy_efficiency_cases/graphs/` for charts

That would mirror the existing GCC vs Clang article series and keep the reproducibility story clean.

## What the benchmark must control

For a valid C vs C++ vs Rust comparison, the article should require:

- the same algorithm and the same input corpus
- identical compiler optimization policy per language
- a fixed warmup policy for JITted or adaptive runtimes
- fixed thread count and CPU affinity
- allocator and GC behavior reported explicitly
- cache state separated into warm-cache and cold-cache runs
- I/O isolated from compute
- power measured independently from wall time

## What should be measured

The article should record:

- wall time
- CPU energy via RAPL or powercap where available
- GPU power only if the workload is actually GPU-backed
- LLC misses as a proxy for memory activity
- branch misses
- a stable estimate of active core usage

## Suggested workloads

The workloads should cover distinct hardware behaviors:

- matrix multiplication
- graph traversal
- parsing
- compression
- ML inference
- memory-bound kernels
- server-style request processing

That spread is important because one benchmark family cannot separate backend quality from runtime cost or memory behavior.

## Bottom line

This repo already has the right article slot.
The place to add this paper is the `Articles` section, and the new page should live under `docs/articles/`.

The current evidence in the repo is enough to support a methodology article and a C++ case study.
It is not yet enough to claim that the paper's conclusion has been experimentally validated for C, C++, and Rust as a group.

<div>
  <AdBanner />
</div>
