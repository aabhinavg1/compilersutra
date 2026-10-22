---
title: "Instruction-level parallelism"
description: "How independent instructions overlap execution and how dependence chains restrict instructions per cycle."
keywords:
  - instruction level parallelism
  - ILP
  - data dependence
  - true dependence
  - RAW hazard
  - anti dependence
  - WAR hazard
  - output dependence
  - WAW hazard
  - loop carried dependence
  - critical path length
  - instructions per cycle
displayed_sidebar: coasidebar
slug: /coa/instruction-level-parallelism
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Instruction-level parallelism

Instruction-level parallelism (ILP) is a measure of how many operations in a instruction stream can be executed simultaneously because they do not depend on each other's results. A compiler backend restructures code to expose independent operations so the underlying hardware can maximize instructions per cycle (IPC).

:::tip Read these first
- [/docs/coa/pipeline-hazards](/docs/coa/pipeline-hazards) — Pipeline hazards: data, control, and structural
- [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) — Superscalar execution: multiple instructions per cycle when ILP exists
:::

:::important What you should leave with
- True data dependences (RAW) form hard latency limits that hardware cannot bypass without speculative techniques or algorithmic reassociation.
- False dependences (WAR and WAW) are constraints imposed by limited architectural register names, which hardware renaming or compiler register allocation can eliminate.
- Loop-carried dependences force sequential execution across loop iterations, creating a long critical path that limits IPC unless unrolled, reassociated, or vectorised.
- Compiler instruction scheduling exposes existing ILP, but pipeline transformations (like loop unrolling and accumulator expansion) create new ILP.
:::

:::caution Who this is not for
If you are looking for structural pipeline hazards or execution unit resource limits, review [/docs/coa/pipeline-hazards](/docs/coa/pipeline-hazards) and [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) first.
:::

:::note
ILP is an inherent property of a specific execution trace and program state, bounded by program dataflow. Hardware features like out-of-order execution dynamically discover ILP, while compilers statically transform code to expand it.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [The mechanism](#the-mechanism)
2. [Types of data dependencies](#types-of-data-dependencies)
3. [Loop-carried dependencies and the critical path](#loop-carried-dependencies-and-the-critical-path)
4. [A worked example](#a-worked-example)
5. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
6. [Common misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

## The mechanism

Instruction-level parallelism exists when instructions within an execution stream share no data or control flow dependencies, allowing them to proceed through execution units concurrently. 

The theoretical IPC achievable by a processor is bounded by the program's data dependency graph. The longest path through this graph—the critical path—determines the minimum number of cycles required to complete the sequence, regardless of how many execution units or issue slots the hardware provides.

| Dependency Type | Cause | Hardware Action | Compiler Transformation |
| :--- | :--- | :--- | :--- |
| **True Dependence (RAW)** | Result of one instruction is consumed by a later instruction. | Forwards data or stalls consumers in reservation stations. | Reorder independent instructions to fill latency gaps; reassociate operations. |
| **Anti-Dependence (WAR)** | Later instruction overwrites a location read by an earlier instruction. | Maps architectural register to a fresh physical register (register renaming). | Allocate distinct architectural registers; schedule writes after reads. |
| **Output Dependence (WAW)** | Two instructions write to the same location in sequence. | Renames destination physical register; retires writes in program order. | Eliminate redundant stores/writes; reassign register targets. |
| **Control Dependence** | Execution of an instruction depends on a branch decision. | Predicts branch outcome; executes speculatively. | Branch elimination, tail duplication, conditional moves (`cmov`). |

The diagram below illustrates how a software dependency graph limits hardware execution schedules.

![Instruction dependence graph showing critical path and parallel execution paths](/img/coa/instruction-level-parallelism.svg)

*Diagram: True dependencies enforce strict sequential ordering along the critical path (left), while independent instruction streams can be scheduled concurrently across available execution hardware (right).*

:::tip Note
Hardware instruction windows (out-of-order execution buffers) dynamically discover independent instructions across a small window of execution. However, if the compiler presents a single linear chain of dependent operations, the hardware reservation stations will starve, causing IPC to drop to $1 / \text\{latency\}$.
:::

## Types of data dependencies

To exploit ILP, the compiler must distinguish between real data flow and register name collisions.

<Tabs>
<TabItem value="raw" label="Read-After-Write (RAW)">

```text
i1: R1 = R2 + R3   ; Produces R1
i2: R4 = R1 * R5   ; Consumes R1 (True Dependence)
```

A Read-After-Write (RAW) hazard represents a **true dependence**. The value produced by instruction `i1` is an input to `i2`. No hardware renaming or register allocation reordering can alter this fundamental flow of data. The execution of `i2` must wait for `i1` to produce its result and forward or write it back.

</TabItem>
<TabItem value="war" label="Write-After-Read (WAR)">

```text
i1: R4 = R1 * R5   ; Reads R1
i2: R1 = R2 + R3   ; Overwrites R1 (Anti-Dependence)
```

A Write-After-Read (WAR) hazard is an **anti-dependence**. Instruction `i2` overwrites register `R1` which is needed as an input by `i1`. This is a name dependence, not a true data flow dependence. If `i2` writes to `R1` before `i1` reads it, `i1` receives incorrect data. Modern OoO hardware resolves this via register renaming, mapping `i2`'s `R1` to a new physical register.

</TabItem>
<TabItem value="waw" label="Write-After-Write (WAW)">

```text
i1: R1 = R2 + R3   ; Overwritten by i2
i2: R1 = R4 * R5   ; Output Dependence
```

A Write-After-Write (WAW) hazard is an **output dependence**. Both instructions target the same destination location `R1`. The final state must preserve `i2`'s output. Like WAR dependencies, WAW dependencies are name dependencies created by limited register naming space. Reallocated architectural registers or physical register renaming eliminate WAW constraints.

</TabItem>
</Tabs>

:::caution
While physical register renaming in hardware resolves WAR and WAW hazards dynamically, it relies on a finite physical register file. Excessively tight register assignment by the compiler can exhaust physical registers or pipeline allocation width, causing front-end stalls.
:::

## Loop-carried dependencies and the critical path

Loop execution is often the primary source of ILP in high-performance applications. However, dependencies that span across loop iterations—**loop-carried dependencies**—create sequential execution bottlenecks.

Consider a simple reduction accumulator:

$$ S = \sum_\{i=0\}^\{N\} A[i] $$

If implemented sequentially, iteration $k$ cannot compute $S_k = S_\{k-1\} + A[k]$ until iteration $k-1$ produces $S_\{k-1\}$. The operation forms a chain where every addition depends directly on the result of the previous addition.

:::warning
Floating-point addition is non-associative due to rounding rules ($ (a + b) + c \neq a + (b + c) $). The compiler cannot break a floating-point loop-carried dependency chain by default unless flags like `-ffast-math` or explicit tree-reduction flags are enabled.
:::

To break loop-carried dependencies, compilers use **accumulator expansion** (creating multiple parallel partial sums) and **loop unrolling**.

## A worked example

Consider the following C function computing an array sum:

```c
double array_sum(const double *arr, int count) {
    double sum = 0.0;
    for (int i = 0; i < count; ++i) {
        sum += arr[i];
    }
    return sum;
}
```

When compiled directly without loop unrolling or reassociation, the inner loop produces an assembly sequence resembling this:

```assembly
.LBB0_1:
    vaddsd  (%rdi,%rax,8), %xmm0, %xmm0  ; sum += arr[i]
    addq    $1, %rax                    ; i++
    cmpq    %rsi, %rax                  ; check bounds
    jne     .LBB0_1
```

### Analysis of the scalar loop
1. **Dependency Analysis**: `vaddsd` reads `%xmm0` and writes its result back to `%xmm0`.
2. **Critical Path**: Every iteration's `vaddsd` depends on the output of the `vaddsd` from the preceding cycle. If `vaddsd` has an execution latency of 3–5 cycles, the loop can execute at most one iteration every 3–5 cycles, regardless of how many execution units are idle.
3. **Execution Bottleneck**: The compiler has generated a latency-bound loop with an IPC near 1 (or lower), leaving available superscalar execution bandwidth unused.

### Optimization: Accumulator Expansion and Unrolling
By unrolling the loop by a factor of 2 and using two independent accumulator registers (`%xmm0` and `%xmm1`), the compiler breaks the true dependency chain:

```assembly
.LBB0_2:
    vaddsd  (%rdi,%rax,8), %xmm0, %xmm0     ; acc0 += arr[i]
    vaddsd  8(%rdi,%rax,8), %xmm1, %xmm1    ; acc1 += arr[i+1]
    addq    $2, %rax                        ; i += 2
    cmpq    %rcx, %rax                      ; check bounds
    jne     .LBB0_2
    vaddsd  %xmm1, %xmm0, %xmm0             ; combine accumulators
```

### Analysis of the unrolled loop
1. **Dependency Analysis**: The two `vaddsd` instructions inside the loop are completely independent of each other. 
2. **ILP Utilization**: The hardware can issue the second `vaddsd` in the very next cycle (or same cycle on a multi-issue execution port) without waiting for the first `vaddsd` to compute its result.
3. **Critical Path**: The execution time is halved because two independent dependency chains run in parallel, effectively hiding the operation latency.

## What the compiler can and cannot do

The compiler strongly influences instruction count and can affect CPI by shaping program dataflow and instruction schedules. However, it operates under explicit bounds.

Recall the standard CPU performance equation:

$$ \text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\} $$

### What the compiler CAN do:
- **Expose ILP via Instruction Scheduling**: Reorder instructions so that independent operations separate a long-latency instruction (like a load or floating-point multiply) from its consumer.
- **Transform Loops**: Perform loop unrolling, software pipelining, and loop vectorization to eliminate loop-carried dependencies.
- **Reassociate Expressions**: Restructure associative mathematical operations (e.g., transforming $a + b + c + d$ into $(a + b) + (c + d)$) to shorten the critical path length from 3 step latencies to 2.
- **Eliminate False Dependencies**: Perform register allocation that avoids unnecessary reuse of architectural register names in overlapping live ranges.

### What the compiler CANNOT do:
- **Control Hardware Cycle Time**: Clock frequencies and pipeline stage lengths are fixed properties of the hardware manufacturing and organization.
- **Override Strict Language Semantics**: Without explicit relaxed floating-point flags, the compiler cannot reassociate floating-point calculations that change precision or rounding behavior.
- **Predict Dynamic Memory Latencies**: A compiler can schedule for an expected cache hit latency, but if a load results in a main memory cache miss, the compiler cannot prevent hardware stalls unless software prefetching or multi-threading mitigates the latency.
- **Expand Physical Register File**: The compiler allocates architectural registers (e.g., 16 in x86-64, 32 in AArch64). The dynamic hardware physical register file size remains invisible to software.

## Common misconceptions

### Misconception 1: Out-of-order processors make compiler instruction scheduling obsolete
**Fact:** While OoO hardware dynamically reorders instructions within an execution window, that window is finite. If a compiler schedules a long chain of dependent instructions continuously, the OoO window quickly fills with blocked instructions waiting on the long dependency chain, preventing the processor from discovering downstream independent work. Compiler scheduling maximizes the effectiveness of the hardware window.

### Misconception 2: Unrolling a loop always increases ILP and performance
**Fact:** Loop unrolling increases instruction count and code size (which can increase I-cache misses and branch predictor pressure). Furthermore, if a loop is unrolled without using multiple independent accumulators or pointers, the unrolled iterations still share a single true dependency chain, providing zero additional ILP while increasing register pressure.

### Misconception 3: WAR and WAW hazards prevent hardware from executing instructions concurrently
**Fact:** WAR and WAW hazards are false dependencies caused by architectural register name reuse. Modern superscalar out-of-order processors resolve WAR and WAW hazards completely using register renaming in the front-end, mapping architectural registers to available physical registers before dispatching instructions to reservation stations.

## What To Read Next
- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Instruction flow in a modern CPU: rename, schedule, execute, retire
- [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) — Superscalar execution: multiple instructions per cycle when ILP exists
- [/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — Measuring throughput and cache misses: perf counters beat guesses

<div>
  <AdBanner />
</div>

## References

- Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*. 6th Edition, Morgan Kaufmann, 2017.
- Allen, R., & Kennedy, K. *Optimizing Compilers for Modern Architectures: A Dependent-based Approach*. Morgan Kaufmann, 2001.
- Fog, A. *Optimizing subroutines in assembly language: An optimization guide for x86 platforms*. Copenhagen University College of Engineering.
