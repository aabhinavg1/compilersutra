---
title: "Compiler Scheduling vs the Pipeline"
description: "How static instruction scheduling and loop unrolling hide load-use delays and hardware execution stalls even on out-of-order cores."
keywords:
  - compiler instruction scheduling
  - out-of-order execution limit
  - load-use delay hazard
  - loop unrolling ILP
  - reorder buffer window exhaustion
  - instruction latency vs execution pipeline
  - software pipelining
  - register pressure
  - static schedule vs dynamic schedule
  - dependency graph scheduling
  - list scheduling algorithm
  - register renaming pressure
displayed_sidebar: coasidebar
slug: /coa/compiler-scheduling-vs-pipeline
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Compiler Scheduling vs the Pipeline

Hardware pipelines execute instructions according to dependency graphs, but physical resources like reorder buffer (ROB) capacity and execution unit availability limit how far an out-of-order core can look ahead. A compiler that rearranges instructions and unrolls loops exposes independent operations across iterations, directly hiding load-use delays that dynamic hardware scheduling cannot eliminate on its own.

:::tip Read these first
- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Learn how instructions flow through rename, schedule, execute, and retire stages.
- [/docs/coa/instruction-level-parallelism](/docs/coa/instruction-level-parallelism) — Understand dependency graphs, data hazards, and instruction-level parallelism limits.
:::

:::important What you should leave with
- Out-of-order hardware has a finite window size; long memory latencies or tall dependency chains exhaust instruction windows and stall the pipeline.
- Static compiler instruction scheduling rearranges operations within basic blocks to place independent instructions between producer loads and consumer instructions.
- Loop unrolling exposes cross-iteration data independence, providing the scheduler with a larger pool of operations to fill latency gaps.
- Over-scheduling or aggressive unrolling increases register pressure, forcing spills to memory that negate instruction-level parallelism gains.
:::

:::caution Who this is not for
If you are looking for low-level pipeline hazard fundamentals such as raw data hazards or control bubbles, start with [/docs/coa/pipeline-hazards](/docs/coa/pipeline-hazards) and [/docs/coa/pipeline-stalls-and-bubbles](/docs/coa/pipeline-stalls-and-bubbles) first.
:::

:::note
Static instruction scheduling cannot predict runtime cache misses; it schedules based on baseline architectural latencies, relying on hardware out-of-order execution to absorb variable memory delays.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [The TL;DR](#tldr)
2. [The mechanism](#the-mechanism)
3. [Comparing Static vs Dynamic Latency Hiding](#comparing-static-vs-dynamic-latency-hiding)
4. [A worked example](#a-worked-example)
5. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
6. [Common misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## TL;DR

- **Do not rely solely on out-of-order execution to hide latencies.** Modern out-of-order engines can only reorder instructions within a finite execution window; long load-use delays quickly stall execution when dependent instructions block execution reservation stations.
- **Rearrange dependent instructions statically.** Compiler list scheduling uses target machine execution latencies to interleave independent operations between a load instruction and its dependent arithmetic.
- **Unroll loops to break iteration barriers.** Combining loop bodies provides independent operations from subsequent iterations to fill latency gaps that are unavailable within a single loop body.
- **Balance instruction schedule depth against register pressure.** Moving load instructions higher up in the basic block lengthens register live ranges, which can trigger register spilling and degrade overall performance.

---

## The mechanism

Every hardware implementation defines latency for each instruction class, representing the number of cycles required before the output operand is valid for downstream consumer instructions. When a consumer instruction immediately follows a producer instruction, the pipeline must stall unless forwarding paths or dynamic reordering can bridge the gap.

While an out-of-order (OoO) pipeline dynamically scans an instruction window for independent operations, its view is constrained by hardware queue limits. If the execution window fills with instructions waiting on an unresolved load, fetch and decode stall upstream. Static compiler scheduling shifts independent work into these delay slots during compilation, ensuring that when instructions reach the hardware scheduler, their data dependencies are already satisfied or near completion.

| Situation | What the Hardware Does | What the Compiler Can Change |
| :--- | :--- | :--- |
| **Immediate Load-Use Dependency** | Stalls execution unit or holds instruction in reservation station until data arrives from memory/cache. | Moves independent instructions (e.g., pointer increments, unrelated math) between the load and consumer. |
| **Tight Loop Dependency Chain** | Exposes few independent instructions per iteration, filling the reorder buffer with blocked consumers. | Unrolls the loop, exposing operations from iteration $N+1$ to interleave into iteration $N$'s delay slots. |
| **High Register Allocation Demand** | Renames architectural registers to physical registers to eliminate false (WAW/WAR) dependencies. | Controls live ranges; avoids aggressive instruction hoisting that causes architectural register spilling to stack. |
| **Unpredictable Cache Miss** | Dynamic scheduler attempts to execute non-dependent instructions around the stalled load. | Static scheduler optimizes for hitting cache latencies (L1 hit latency) to avoid bloat, leaving cache miss stalls to OoO hardware. |

The relationship between compiler list scheduling, register allocation, and execution unit allocation forms a direct feedback pipeline:

![Compiler Scheduling vs Hardware Pipeline](/img/coa/compiler-scheduling-vs-pipeline.svg)

*Diagram: The compiler transforms dependency graphs via unrolling and scheduling before register allocation, passing ordered machine instructions to the hardware fetch and execute pipeline.*

---

## Comparing Static vs Dynamic Latency Hiding

To evaluate how instructions flow through a hardware pipeline under different transformation strategies, consider three ways to compile a vector processing loop.

<Tabs>
<TabItem value="baseline" label="1. Baseline Schedule" default>

```text
Loop:
  LDR   R1, [R0]        ; Load value from array A
  ADD   R2, R1, #1      ; Load-use stall! R1 is not ready
  STR   R2, [R3]        ; Store result to array B
  ADD   R0, R0, #4      ; Increment source pointer
  ADD   R3, R3, #4      ; Increment destination pointer
  CMP   R0, R4          ; Check loop bound
  BNE   Loop            ; Branch to next iteration
```

**Pipeline Behavior:**
The `ADD R2, R1, #1` instruction depends directly on `R1` loaded by `LDR`. In a simple execution pipeline, execution stalls waiting for the memory operand to resolve through the data cache hit path. The out-of-order engine must hold `ADD R2` in a reservation station. Because each iteration contains only a few instructions, the dynamic scheduler rapidly runs out of independent work within a single iteration context.

</TabItem>
<TabItem value="scheduled" label="2. Statically Scheduled">

```text
Loop:
  LDR   R1, [R0]        ; Load value from array A
  ADD   R0, R0, #4      ; Interleaved: update source pointer (independent)
  ADD   R3, R3, #4      ; Interleaved: update destination pointer (independent)
  ADD   R2, R1, #1      ; Data R1 is now ready; stall eliminated
  STR   R2, [R3, #-4]   ; Store result using offset adjustment
  CMP   R0, R4          ; Check loop bound
  BNE   Loop            ; Branch
```

**Pipeline Behavior:**
The static scheduler hoisted `ADD R0` and `ADD R3` into the delay slot between the load `LDR` and its user `ADD R2`. By the time `ADD R2` reaches execution, `R1` has traversed the load pipeline and bypass network. The instruction stream reaches execution units with fewer hazards, preserving space in hardware reservation stations for hiding unpredictable memory delays.

</TabItem>
<TabItem value="unrolled" label="3. Unrolled & Scheduled">

```text
Loop:
  LDR   R1, [R0]        ; Load iteration 0
  LDR   R5, [R0, #4]    ; Load iteration 1 (independent load)
  ADD   R2, R1, #1      ; Process iteration 0
  ADD   R6, R5, #1      ; Process iteration 1
  STR   R2, [R3]        ; Store iteration 0
  STR   R6, [R3, #4]    ; Store iteration 1
  ADD   R0, R0, #8      ; Increment source pointer by two elements
  ADD   R3, R3, #8      ; Increment destination pointer by two elements
  CMP   R0, R4          ; Check loop bound
  BNE   Loop
```

**Pipeline Behavior:**
Loop unrolling combines two iterations into one basic block. Interleaving `LDR` operations from consecutive iterations hides the memory latency of the first load using the address generation and fetch of the second load. The execution units operate at maximum throughput because data dependencies are decoupled across parallel execution tracks, substantially lowering cycles per instruction (CPI).

</TabItem>
</Tabs>

---

## A worked example

Consider a scalar memory loop written in C that processes an array of pointers, reading structure fields and writing back calculated updates:

```c
typedef struct Node {
    int value;
    int factor;
} Node;

void process_nodes(Node *nodes, int *results, int count) {
    for (int i = 0; i < count; ++i) {
        int v = nodes[i].value;
        int f = nodes[i].factor;
        results[i] = (v * f) + v;
    }
}
```

When converted to an unoptimized architectural intermediate assembly representation, the loop body manifests tight dependency chains:

```text
.LBB0_1:
  LDR   R3, [R0]        ; Load nodes[i].value (Producer 1)
  LDR   R4, [R0, #4]    ; Load nodes[i].factor (Producer 2)
  MUL   R5, R3, R4      ; Dependent on Producer 1 and 2! Load-use hazard
  ADD   R5, R5, R3      ; Dependent on MUL result! Execution hazard
  STR   R5, [R1]        ; Store result to results[i]
  ADD   R0, R0, #8      ; Advance nodes pointer
  ADD   R1, R1, #4      ; Advance results pointer
  SUBS  R2, R2, #1      ; Decrement count
  BNE   .LBB0_1         ; Loop back
```

### Trace of Execution and Hazards

1. **`LDR R3, [R0]`**: Issues a memory access to retrieve `value`. Architectural execution requires multiple cycles before `R3` is available in the register file or forwarding path.
2. **`LDR R4, [R0, #4]`**: Can issue concurrently if memory ports allow, but `R4` is pending.
3. **`MUL R5, R3, R4`**: Tries to execute immediately following `LDR`. The pipeline stalls execution of `MUL` because `R3` and `R4` are still traversing data cache fill hardware.
4. **`ADD R5, R5, R3`**: Must wait in the reservation station until `MUL` completes execution (multi-cycle execution latency).
5. **`STR R5, [R1]`**: Blocked waiting for the `ADD` result to commit.

### Optimized Transformation by the Compiler

To resolve this bottleneck, the compiler unrolls the loop twice and reorders operations across iterations. It interleaves memory access and calculation steps to decouple producers from consumers:

```text
.LBB0_1_Optimized:
  ; --- Block Load Phase ---
  LDR   R3, [R0]        ; Iteration N: value
  LDR   R4, [R0, #4]    ; Iteration N: factor
  LDR   R6, [R0, #8]    ; Iteration N+1: value
  LDR   R7, [R0, #12]   ; Iteration N+1: factor

  ; --- Interleaved Compute Phase ---
  MUL   R5, R3, R4      ; Iteration N MUL (R3, R4 ready from early load)
  MUL   R8, R6, R7      ; Iteration N+1 MUL (R6, R7 ready)

  ADD   R5, R5, R3      ; Iteration N ADD (R5 ready)
  ADD   R8, R8, R6      ; Iteration N+1 ADD (R8 ready)

  ; --- Store & Pointer Update Phase ---
  STR   R5, [R1]        ; Iteration N Store
  STR   R8, [R1, #4]    ; Iteration N+1 Store
  ADD   R0, R0, #16     ; Advance nodes pointer by 2 structs (16 bytes)
  ADD   R1, R1, #8      ; Advance results pointer by 2 ints (8 bytes)
  SUBS  R2, R2, #2      ; Decrement loop count by 2
  BNE   .LBB0_1_Optimized
```

By placing independent loads for `Iteration N+1` between the loads and multiply of `Iteration N`, the compiler hides the memory latency of the first load pair. The hardware pipeline receives an instruction stream free of immediate load-use stalls, maximizing functional unit utilization.

---

## What the compiler can and cannot do

Understanding the bounds of static optimization requires viewing the compiler's influence through the lens of the **CPU Performance Equation**:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$$

```
                +------------------------------------+
                |        CPU Performance Time        |
                +------------------------------------+
                                  |
         +------------------------+------------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
| Instruction Count|     |       CPI        |     |    Cycle Time    |
+------------------+     +------------------+     +------------------+
| Compiler Lever:  |     | Compiler Lever:  |     | Compiler Lever:  |
| - Unrolling      |     | - Scheduling     |     | - Hardware Fixed |
| - Inlining       |     | - Latency Hiding |     | - No Control     |
| - Direct Control |     | - Indirect Mod   |     |                  |
+------------------+     +------------------+     +------------------+
```

### What the Compiler CAN Control
- **Instruction Count**: Unrolling loops reduces loop overhead branch instructions and pointer arithmetic steps, directly modifying total instructions.
- **Cycles Per Instruction (CPI)**: Static instruction scheduling fills execution pipeline slots and load-use delays, reducing stall cycles per instruction.
- **Register Allocation and Pressure**: The compiler determines live ranges for architectural registers. By choosing when to schedule loads, it manages architectural register pressure before code generation.

:::caution Register Pressure Hazard
Hoisting loads too high to hide extreme latencies expands register live ranges. When live ranges exceed available architectural registers, the compiler generates stack spill code (`STR`/`LDR` pair to stack), adding extra memory instructions and destroying performance.
:::

### What the Compiler CANNOT Control
- **Clock Cycle Time**: Dictated entirely by modern semiconductor process nodes and hardware clock networks.
- **Dynamic Memory Latencies**: The compiler cannot predict whether a specific load instruction will hit L1 cache, hit L3 cache, or miss to DRAM. It schedules based on assumed L1 cache hits.
- **Physical Register File Size**: While the compiler allocates architectural registers (e.g., 16 ARM or 16 x86-64 registers), the hardware out-of-order engine renames them to a larger physical register file unknown to software.
- **Dynamic Reorder Buffer Window Size**: If a execution bottleneck occurs due to a real cache miss, hardware ROB structures buffer instructions until capacity is exhausted; compiler static ordering cannot enlarge hardware queues.

---

## Common misconceptions

### Misconception 1: Out-of-order CPUs render compiler instruction scheduling obsolete.
**Correction:** Out-of-order execution windows are strictly finite (typically ranging from tens to a few hundred micro-operations). A long latency event like a memory access can quickly consume all reorder buffer entries if the instruction stream contains immediate consumers. Compiler scheduling rearranges instructions across larger code blocks, presenting the OoO engine with an already optimized instruction stream that fits cleanly within its window.

### Misconception 2: Loop unrolling always improves execution speed.
**Correction:** Unrolling increases code size, which can increase L1 Instruction Cache miss rates. Furthermore, unrolling multiplies register usage across loop iterations. If register demands exceed architectural availability, the compiler spills values to stack memory, transforming a loop bottleneck into a memory bandwidth problem.

:::warning
Unrolling high-iteration loops without checking register pressure or loop bounds can cause code size explosion and instruction cache thrashing.
:::

### Misconception 3: The compiler can schedule around runtime cache misses.
**Correction:** Compilers schedule code based on static execution models that assume fixed instruction latencies (typically assuming L1 data cache hits). The compiler cannot predict dynamic runtime conditions like cache conflicts, TLB misses, or bus contention. Hardware out-of-order execution complements static scheduling by dynamically handling runtime variations that static schedulers cannot anticipate.

---

## What To Read Next

- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Learn how physical register renaming and instruction retirement operate in modern CPUs.
- [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) — Understand hardware instruction issue limitations, execution ports, and pipeline throughput bounds.
- [/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — Measure pipeline stalls, cache misses, and CPI using performance counters.

<div>
  <AdBanner />
</div>

## References

- John L. Hennessy and David A. Patterson. *Computer Architecture: A Quantitative Approach*. Sixth Edition, Morgan Kaufmann, 2017.
- Steven S. Muchnick. *Advanced Compiler Design and Implementation*. Morgan Kaufmann, 1997.
- LLVM Machine Instruction Scheduler Documentation. [LLVM Machine Scheduler](https://llvm.org/docs/Vectorizers.html).
