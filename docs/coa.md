---
title: "Computer Architecture Roadmap (For Compiler Engineers)"
description: "A reading path from ISA and pipelines to caches and SIMD, written for people who generate code, not only for people who design CPUs."
keywords:
  - Computer Architecture Roadmap
  - Computer Architecture for Compiler Engineers
  - ISA Explained
  - CPU Pipeline
  - Cache Memory
  - Branch Prediction
  - Superscalar Processors
  - SIMD
  - LLVM Backend
---

import AdBanner from '@site/src/components/AdBanner';

# Computer Architecture for Compiler Engineers

A compiler does not run in a vacuum. Every instruction it emits has to survive a pipeline, a cache, and a limited set of execution ports. This track is the hardware side of that job: what the machine actually does with the code you generate.

Read the eight pages below in order. Later sections are the rest of the map. They are listed so you can see what is next, not so you have to wait on them.

## Read this first

1. [Computer organization vs computer architecture](/docs/coa/intro_to_coa) — the ISA is the contract; the microarchitecture is one implementation of it.
2. [Basic terminology](/docs/coa/basic_terminology_in_coa) — cycles, hazards, locality, and the words the rest of the track uses.
3. [Fetch, decode, execute](/docs/coa/cpu_execution) — one instruction, one simple pipeline.
4. [How an instruction flows through a modern CPU](/docs/coa/how-an-instruction-actually-flows-through-a-modern-cpu) — rename, schedule, execute, retire.
5. [From sequential to speculative execution](/docs/coa/types_of_execution) — pipeline, out-of-order, speculation, SIMD, multicore, in one picture.
6. [Superscalar execution](/docs/coa/superscalar-execution) — more than one instruction per cycle, and when that fails.
7. [Memory hierarchy](/docs/coa/memory-hierarchy) — why a correct loop can still miss cache.
8. [Measure it](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — cycles, IPC, cache misses, and branch misses on a real machine.

:::caution
A legal instruction stream can still stall the pipeline, miss the cache, or defeat the branch predictor. Seeing that difference is what separates a compiler that emits correct code from one that emits fast code.
:::

<AdBanner />

## Who this is for

LLVM backend work, instruction selection, scheduling, and people who already have a slow loop and want the hardware reason. The pages stay on the compiler side of the line: what the machine charges for, and what a pass can change.

## What is already covered

| Topic | Where |
| --- | --- |
| Organization vs architecture | [intro](/docs/coa/intro_to_coa) |
| Shared vocabulary | [terminology](/docs/coa/basic_terminology_in_coa) |
| Instruction cycle and a basic pipeline | [fetch–decode–execute](/docs/coa/cpu_execution) |
| Rename, ROB, retire | [instruction flow](/docs/coa/how-an-instruction-actually-flows-through-a-modern-cpu) |
| Sequential through speculative, SIMD, multicore | [execution models](/docs/coa/types_of_execution) |
| Issue width and ILP | [superscalar](/docs/coa/superscalar-execution) |
| Caches, locality, false sharing, prefetch | [memory hierarchy](/docs/coa/memory-hierarchy) |
| perf, IPC, misses | [measuring](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) |

## The rest of the map

These pages are not written yet. Each one is linked here when it lands.

### ISA and the backend

- What is Instruction Set Architecture (ISA)?
- RISC vs CISC Architecture
- Registers and Addressing Modes
- Calling Conventions and ABI
- Load-Store Architecture
- Instruction Formats and Encoding
- ISA Design Tradeoffs
- ISA Impact on Compiler Backend

### Pipeline

- Pipeline Hazards (Data, Control, Structural)
- Pipeline Stalls and Bubbles
- Instruction-Level Parallelism (ILP)
- Compiler Scheduling vs Pipeline

### Cache, branches, SIMD

- Cache Mapping (Direct, Set-Associative, Fully Associative)
- Static vs Dynamic Branch Prediction
- Misprediction Penalty
- SIMD Basics and Vector Registers

### Later

- Multicore and memory ordering
- Scoreboarding
- Profile-guided layout
- Hardware performance counters beyond the measuring page

## After this track

- [How source becomes a binary](/docs/compilers/sourcecode_to_executable)
- [Intro to LLVM](/docs/llvm/intro-to-llvm)
- [MLIR introduction](/docs/MLIR/intro)

Questions and corrections: [Discord](https://discord.gg/d7jpHrhTap) · [YouTube](https://www.youtube.com/@compilersutra)

<AdBanner />
