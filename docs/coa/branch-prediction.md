---
title: "Static vs Dynamic Branch Prediction: Hardware Tables and Compiler Control"
description: "How CPU control hazards force branch prediction, how dynamic branch history tables beat static direction hints, and how compilers restructure control flow using profile-guided optimization."
keywords:
  - branch prediction
  - control hazard
  - static branch prediction
  - dynamic branch prediction
  - branch target buffer
  - pattern history table
  - branch directional prediction
  - speculative execution
  - pipeline flush
  - misprediction penalty
  - profile-guided optimization
  - basic block layout
displayed_sidebar: coasidebar
slug: /coa/branch-prediction
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Static vs Dynamic Branch Prediction: Hardware Tables and Compiler Control

A branch instruction creates a control dependency because the hardware cannot know the next Program Counter (PC) until the branch condition is evaluated and the target address is computed. A compiler backend restructures control flow, annotates probabilities, and leverages profile data to ensure the hardware's branch predictor correctly steers speculative execution down the hot path.

:::tip Read these first
- [/docs/coa/pipeline-hazards](/docs/coa/pipeline-hazards) — Data, control, and structural hazards in pipelined execution.
- [/docs/coa/compiler-scheduling-vs-pipeline](/docs/coa/compiler-scheduling-vs-pipeline) — How the compiler arranges instructions to reduce execution latency.
:::

:::important What you should leave with
- Hardware dynamic predictors track branch outcomes using runtime execution history, outperforming static direction heuristics for complex control structures.
- A branch misprediction requires flushing speculatively fetched instructions from the pipeline, causing severe latency overheads.
- Attributes like `[[likely]]` or `__builtin_expect` primarily influence compiler basic block layout, code alignment, and instruction cache locality rather than directly driving modern dynamic hardware predictors.
- Profile-Guided Optimization (PGO) provides the compiler with true runtime branch probabilities, enabling aggressive basic block reordering that minimizes taken branches on hot paths.
:::

:::caution Who this is not for
If you are new to hardware pipelines, read [/docs/coa/cpu_execution](/docs/coa/cpu_execution) first to understand how instructions progress through fetch, decode, execute, and writeback stages.
:::

:::note
Branch prediction mechanisms predict both the **direction** (taken vs. not-taken) and the **target address** (where execution jumps). Modern processors use separate structures like Branch Target Buffers (BTB) to resolve target addresses early in the fetch stage.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The Control Flow Problem](#the-control-flow-problem)
3. [The Mechanism: Static vs Dynamic Prediction](#the-mechanism-static-vs-dynamic-prediction)
4. [A Worked Example: Basic Block Layout and Branch Outcomes](#a-worked-example-basic-block-layout-and-branch-outcomes)
5. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
6. [Common Misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

## TL;DR
- **Control hazards force speculation**: Without prediction, the hardware must stall pipeline fetch cycles until the execute stage computes the branch target and condition.
- **Dynamic prediction dominates**: Hardware uses runtime branch history tables and path correlations to predict outcomes, making simple static hints obsolete for hardware direction decisions.
- **Compiler hints alter code layout**: Pragmas and attributes (`likely`/`unlikely`) guide the compiler to place hot paths sequentially in memory, reducing taken-branch penalties and improving instruction cache utilization.
- **PGO yields maximum pipeline efficiency**: Real execution profiles allow the compiler to align basic blocks, eliminate redundant unconditional jumps, and optimize branch density across the control flow graph.

## The Control Flow Problem

In a pipelined CPU, instruction fetch occurs before the current instruction is decoded or executed. When the fetch unit encounters a conditional branch, it faces two immediate unknowns:
1. **The Branch Condition**: Is the branch Taken (T) or Not-Taken (NT)?
2. **The Branch Target Address**: What is the address of the next instruction if taken?

Waiting for the Execute stage to resolve these values creates a **control hazard**. If the hardware stalls fetch until execution completes, empty pipeline slots—known as bubbles—are introduced into the pipeline.

Recall the standard CPU performance equation:

$$ \text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\} $$

Control hazard stalls raise the average Cycles Per Instruction ($\text\{CPI\}$). To keep $\text\{CPI\}$ close to 1.0 (or below 1.0 on superscalar cores), hardware speculatively fetches instructions down the predicted execution path. If the prediction is correct, execution continues without interruption. If the prediction is wrong, the hardware must cancel all speculatively fetched instructions—a **pipeline flush**—and restart fetch at the correct target address.

:::tip Note
The cost of a misprediction scales with pipeline depth. Deeper pipelines require more cycles between the Fetch stage and the Execute/Commit stage where branch resolutions occur, making mispredictions progressively more expensive.
:::

## The Mechanism: Static vs Dynamic Prediction

Hardware and compiler techniques for predicting branch behavior fall into two broad categories: **Static** (determined before program execution) and **Dynamic** (tracked at runtime by hardware).

| Situation | Hardware Action | Compiler Lever |
| :--- | :--- | :--- |
| **No Predictor Hardware** | Stalls pipeline until target address and condition resolve. | Restructure code to reduce total branch instruction count. |
| **Static Prediction (e.g., Backward Taken, Forward Not Taken)** | Predicts backward branches (loops) as Taken, forward branches (if/else) as Not-Taken. | Arrange hot paths as forward non-branching code, cold paths as forward target blocks. |
| **Dynamic Prediction (1-Bit / 2-Bit Counters)** | Tracks past outcomes of specific branch instruction addresses using hardware tables. | Simplify branch conditions; rely on hardware execution history. |
| **Dynamic Prediction (Correlated / Two-Level / Path-Based)** | Combines global execution history registers with branch addresses to predict pattern-dependent branches. | Structure control flow to avoid unpredictable, chaotic condition evaluation patterns. |

<Tabs>
<TabItem value="static" label="Static Prediction Mechanics" default>

Static prediction strategies do not alter their prediction based on execution history. Early microarchitectures relied on fixed rules embedded in the hardware or static branch hint bits in the instruction encoding.

- **Backward Taken, Forward Not-Taken (BTFN)**: Loops iterate back to lower memory addresses, so backward branches are predicted as Taken. Conditional forward branches jump past code blocks, so they are predicted as Not-Taken.
- **Static Hint Bits**: Some ISAs allow instruction encodings to specify a static hint bit set by the compiler indicating expected outcome.

Static mechanisms fail when program execution paths are highly dynamic or data-dependent, leading to systematic mispredictions in nested structures or non-loop conditions.

</TabItem>
<TabItem value="dynamic" label="Dynamic Prediction Mechanics">

Dynamic hardware predictors maintain dedicated memory tables indexed by the lower bits of the branch instruction's Program Counter (PC).

- **2-Bit Saturating Counter**: Each entry in a Pattern History Table (PHT) uses a 2-bit state machine (Strongly Taken, Weakly Taken, Weakly Not-Taken, Strongly Not-Taken). It requires two consecutive wrong predictions to change the directional bias, preventing single loop-exit anomalies from breaking the prediction pattern.
- **Two-Level Adaptive Predictors (e.g., Gshare)**: Combines a Global History Register (GHR)—a shift register tracking the last $N$ branch outcomes across the whole program—XORed with the PC address. This captures correlation between neighboring branches.

```
       Global History Register (GHR)        Branch Instruction Address (PC)
             [ 1 0 1 1 0 1 ]                      [ 0 1 1 0 1 0 ]
                    \                                  /
                     \---> [ Bitwise XOR Logic ] <----/
                                    |
                                    v
                       Pattern History Table Index
                                    |
                                    v
                   [ Entry: 2-bit Saturating Counter ]
                                    |
                                    v
                      Prediction: Taken / Not-Taken
```

Modern dynamic predictors achieve high prediction accuracy (often exceeding 95% on general integer workloads), making static hardware direction bits largely obsolete in high-performance processors.

</TabItem>
</Tabs>

![Diagram showing instruction fetch flow splitting into predicted path vs pipeline flush upon misprediction](/img/coa/branch-prediction.svg)

*Diagram: An instruction stream enters the branch predictor; correct predictions maintain continuous execution, while mispredictions force a pipeline flush and recovery.*

## A Worked Example: Basic Block Layout and Branch Outcomes

Consider the following source code containing a conditional branch inside a performance-critical function:

```c
void process_buffer(int *data, int size, int check_bounds) {
    for (int i = 0; i < size; ++i) {
        if (check_bounds && i >= size) {
            // Unlikely error handling path
            handle_error();
        }
        data[i] *= 2;
    }
}
```

When compiled without basic block optimization, a naive compiler might emit the following control flow graph representation:

```assembly
; Function Entry: r0 = data, r1 = size, r2 = check_bounds, r3 = i (starts at 0)
.L_loop_head:
    CMP     r3, r1              ; Loop condition check (i < size)
    BGE     .L_loop_exit        ; If i >= size, exit loop

    CMP     r2, #0              ; Check if check_bounds is non-zero
    BEQ     .L_process          ; If check_bounds == 0, jump to normal processing
    CMP     r3, r1              ; Check if i >= size
    BLT     .L_process          ; If i < size, jump to normal processing

    BL      handle_error        ; Cold error path placed inline

.L_process:
    LSL     r4, r3, #2          ; Byte offset = i * 4
    LDR     r5, [r0, r4]        ; Load data[i]
    LSL     r5, r5, #1          ; data[i] *= 2
    STR     r5, [r0, r4]        ; Store data[i]

    ADD     r3, r3, #1          ; ++i
    B       .L_loop_head        ; Jump back to loop head

.L_loop_exit:
    RET
```

### Analysis of the Naive Layout
1. **Excessive Taken Branches**: The primary execution path (`.L_process`) frequently executes jumps (`BEQ .L_process`, `BLT .L_process`, and `B .L_loop_head`). Taken branches disrupt the linear fetch stream in the hardware's instruction pipeline.
2. **Instruction Cache Fragmentation**: The cold path (`BL handle_error`) sits directly in between the branch checks and the primary processing block. This wastes cache lines with cold code that is rarely executed.

### Compiler-Optimized Layout (Profile-Guided / Static Hints)
By informing the compiler that `check_bounds` is rarely active or that `i >= size` inside the loop body is false, the compiler reorders the basic blocks using a fall-through structure:

```assembly
; Optimized Layout: Hot path is fall-through
.L_loop_head:
    CMP     r3, r1              ; r3 = i, r1 = size
    BGE     .L_loop_exit        ; Loop termination (predicted taken by loop hardware after warm-up)

    CMP     r2, #0              ; Is check_bounds active?
    BNE     .L_check_error      ; Branch AWAY to cold code if active (Forward Taken = Cold)

.L_hot_path:
    LSL     r4, r3, #2          ; Compute byte offset
    LDR     r5, [r0, r4]        ; Load data[i]
    LSL     r5, r5, #1          ; Multiply by 2
    STR     r5, [r0, r4]        ; Store data[i]
    ADD     r3, r3, #1          ; ++i
    CMP     r3, r1              ; Check loop condition inline
    BLT     .L_hot_path         ; Branch back (Backward Taken = Loop)

.L_loop_exit:
    RET

; Out-of-line Cold Block
.L_check_error:
    CMP     r3, r1
    BLT     .L_hot_path         ; Return to hot path if check passes
    BL      handle_error        ; Error handling
    B       .L_hot_path
```

In this optimized layout:
- The common execution path (`.L_hot_path`) executes sequentially in memory.
- Instruction prefetchers fill cache lines containing purely hot instructions.
- Unlikely error checks branch away to physically separate memory sections, leaving the sequential pipeline stream intact.

:::caution
Do not overwrite a pointer or register tracking loop indices before its final use in conditional branches. In the trace above, `r3` serves as index `i` throughout loop bounds evaluation.
:::

## What the Compiler Can and Cannot Do

The compiler cannot alter the fundamental hardware architecture of the dynamic branch predictor, nor can it dynamically resize physical hardware state tables like the BTB or PHT. However, the compiler has direct control over instruction layout and architectural control flow structures.

```
+-------------------------------------------------------------------+
|                        Compiler Control                           |
|  - Basic block layout and placement                               |
|  - Converting branches to conditional moves (cmov / csel)         |
|  - Loop unrolling and loop vectorization                          |
|  - Function inlining and cold code splitting                      |
+-------------------------------------------------------------------+
                                  |
                                  v  Emits Architectural Instructions
+-------------------------------------------------------------------+
|                       Hardware Control                            |
|  - Dynamic branch prediction state machines (Gshare/TAGE)         |
|  - Branch Target Buffer (BTB) address resolution                  |
|  - Speculative execution and pipeline flushing                    |
|  - Physical register allocation and out-of-order execution        |
+-------------------------------------------------------------------+
```

### 1. Basic Block Reordering and Layout
Compilers use branch probability estimates (derived from static heuristics or dynamic profiling) to align the primary control flow path continuously in memory. Fall-through paths eliminate taken-branch penalties in instruction fetch units.

### 2. Branch Elimination (Predication)
When a branch condition is difficult for hardware to predict (for example, random data filtering), the compiler can eliminate the branch entirely using conditional instructions:

```assembly
; Branch-based sequence (prone to mispredictions on random data)
    CMP     r1, r2
    BLT     .L_skip
    MOV     r1, r2
.L_skip:

; Branchless sequence using conditional selection (predication)
    CMP     r1, r2
    CSEL    r1, r2, r1, GE      ; Conditional Select: r1 = (r1 >= r2) ? r2 : r1
```
This converts a control hazard into a data dependency, completely avoiding pipeline flush risks at the expense of executing both paths' computations or unconditional select instructions.

### 3. Profile-Guided Optimization (PGO)
PGO operates in a two-pass compilation model:
1. **Instrumentation Build**: The compiler inserts execution counters into each basic block of the Control Flow Graph (CFG).
2. **Profiling Run**: The workload runs with representative data, populating edge execution counts.
3. **Optimized Build**: The compiler ingests profile data, replacing static heuristics with accurate branch probabilities ($P(\text\{Taken\})$ vs $P(\text\{Not-Taken\})$).

PGO directly drives unrolling decisions, function inlining, basic block placement, and out-of-line code splitting.

:::warning
Using non-representative training data during profiling can degrade performance. If execution paths in production diverge heavily from the profiling dataset, basic block layouts will prioritize cold paths, increasing taken branches and pipeline flushes on hot code.
:::

## Common Misconceptions

### Misconception 1: Attributes like `[[likely]]` tell the CPU hardware how to predict branches
**Reality**: High-performance x86 and ARM processors largely ignore static direction hints encoded in instruction formats or compiler hints during dynamic branch execution. Modern dynamic predictors rely entirely on internal state tables (e.g., TAGE or Gshare predictors). The `[[likely]]` and `[[unlikely]]` attributes guide the **compiler** to reorder basic blocks, moving cold code away from the sequential instruction stream to maximize cache utilization and fall-through fetch rates.

### Misconception 2: Branch prediction overhead is fixed regardless of pipeline depth
**Reality**: The penalty for a branch misprediction is proportional to the pipeline depth between Instruction Fetch and Branch Resolution (Commit/Execute). Deeper, wider pipelines must flush dozens of in-flight instructions upon a misprediction, making predictable branch behavior increasingly vital on modern high-performance microarchitectures.

### Misconception 3: Eliminating every branch using conditional moves (`cmov`/`csel`) always improves performance
**Reality**: Converting branches to conditional moves replaces control dependencies with data dependencies. If the branch is almost always taken or almost always not-taken, the dynamic hardware branch predictor will predict it with nearly 100% accuracy at zero latency overhead. Replacing a highly predictable branch with a sequence of conditional instructions adds unnecessary latency chains to the execution units.

## What To Read Next
- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Learn how speculative instructions flow through rename, schedule, execute, and retire.
- [/docs/coa/types_of_execution](/docs/coa/types_of_execution) — Understand hardware speculative execution and execution recovery mechanisms.
- [/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — Use hardware performance counters (`perf`) to measure branch mispredictions and pipeline stalls.

<div>
  <AdBanner />
</div>

## References
- Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*. Morgan Kaufmann.
- Stallings, W. *Computer Organization and Architecture*. Pearson.
- Yeh, T. Y., & Patt, Y. N. (1991). "Two-Level Adaptive Training Branch Prediction". *Proceedings of the 24th annual international symposium on Microarchitecture (MICRO 24)*. [ACM Digital Library](https://dl.acm.org/doi/10.1145/123465.123475).



<AdBanner />
