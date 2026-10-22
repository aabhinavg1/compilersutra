---
title: "Pipeline Hazards: Data, Control, and Structural"
description: "How CPU pipeline hazards force stalls or bypasses, and why instruction scheduling in the compiler remains critical for IPC."
keywords:
  - pipeline hazards
  - data hazard
  - control hazard
  - structural hazard
  - read after write
  - write after write
  - write after read
  - raw hazard
  - instruction scheduling
  - forwarding path
  - bypass network
  - pipeline stall
displayed_sidebar: coasidebar
slug: /coa/pipeline-hazards
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pipeline Hazards: Data, Control, and Structural

A CPU pipeline increases instruction throughput by overlapping the execution of multiple instructions, but overlapping operations creates situations where the next instruction cannot execute in its designated clock cycle. A compiler writer must understand these hardware hazard conditions because unhandled hazards force the microarchitecture to insert stall cycles or rely on expensive hardware resolution mechanisms.

:::tip Read these first
- [/docs/coa/cpu_execution](/docs/coa/cpu_execution) — Fetch–Decode–Execute: how instructions advance through basic pipeline stages.
- [/docs/coa/types_of_execution](/docs/coa/types_of_execution) — Sequential to speculative execution: instruction-level parallelism and pipeline fundamentals.
:::

:::important What you should leave with
- The exact hardware definitions for Data (RAW, WAR, WAW), Control, and Structural hazards.
- How operand forwarding bypasses stalls for arithmetic data dependencies but cannot eliminate load-use delays.
- Why modern out-of-order execution hides many hazards dynamically, yet instruction scheduling in the compiler still yields higher instruction throughput and lower register pressure.
- How compiler instruction scheduling reorganizes independent operations to fill latent pipeline bubbles without altering program semantics.
:::

:::caution Who this is not for
If you are looking for basic terminology regarding clock cycles or fundamental memory structures, start with [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa) before reading this article.
:::

:::note
This lesson focuses on the microarchitectural hazard conditions present in pipelined execution models and how static code generation decisions directly alter hardware pipeline behavior.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The three pipeline hazard types](#the-three-pipeline-hazard-types)
3. [Hazard handling: Stalls vs Forwarding](#hazard-handling-stalls-vs-forwarding)
4. [A worked example](#a-worked-example)
5. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
6. [Common misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## TL;DR
- **Data hazards** occur when an instruction depends on the result of a prior instruction that has not yet completed writeback; static instruction scheduling hides this latency by interleaveing independent instructions.
- **Control hazards** arise from conditional and unconditional branches because the pipeline does not know the target instruction address until the branch instruction is decoded or evaluated.
- **Structural hazards** occur when two or more concurrent instructions demand access to the exact same physical hardware resource during the same cycle.
- **Hardware bypass paths** solve many Data (RAW) hazards directly in silicon, but cannot completely eliminate load-to-use delays, leaving pipeline bubbles that static compiler scheduling must fill.

---

## The three pipeline hazard types

An instruction pipeline operates like an assembly line. When an instruction in an earlier stage requires a value, target address, or functional unit that is not yet ready, execution stalls or produces incorrect results unless the microarchitecture or compiler intervenes. Hardware hazards are strictly categorized into three structural families.

| Hazard Type | Cause | Hardware Action | Compiler Action |
| :--- | :--- | :--- | :--- |
| **Data Hazard** | Register dependency between adjacent/nearby instructions. | Insert bubbles (stall) or forward operand via bypass network. | Reorder independent instructions to separate dependent pairs. |
| **Control Hazard** | Pipeline fetch stage needs branch outcome/target not yet computed. | Flush speculatively fetched pipeline stages or stall fetch. | Place branch hints, reorder code layout, or use conditional selects (cmov). |
| **Structural Hazard** | Hardware resource limit (e.g., single memory port, shared multiplier). | Stall the younger requesting instruction until hardware is freed. | Avoid scheduling instructions that require identical resources back-to-back. |

### Data hazards (RAW, WAR, WAW)
Data dependencies reflect logical relationships in program execution. When instructions are executed concurrently in a pipeline, these logical data dependencies can manifest as microarchitectural data hazards:

1. **Read-After-Write (RAW) / True Dependency:** Instruction $B$ attempts to read a register before Instruction $A$ writes its result to that register.
2. **Write-After-Read (WAR) / Anti-Dependency:** Instruction $B$ attempts to write to a register before Instruction $A$ reads its original value.
3. **Write-After-Write (WAW) / Output Dependency:** Instruction $B$ attempts to write to a register before Instruction $A$ writes its result to the same register.

In an in-order pipeline, WAR and WAW hazards rarely stall execution because registers are read in early pipeline stages and written in strict program order in late pipeline stages. However, RAW hazards happen frequently in real code.

### Control hazards
Control hazards occur because the hardware fetches new instructions sequentially long before a conditional branch evaluates its condition or computes its target instruction address. If the branch resolves as taken, instructions already fetched into the early stages of the pipeline must be discarded (flushed), generating empty cycles called pipeline bubbles.

### Structural hazards
Structural hazards occur when hardware resource constraints prevent two instructions from occupying their required functional units in the same clock cycle. For instance, if an architecture shares a single read/write memory port between instruction fetch and memory data access (a classic Princeton/Von Neumann bus conflict), a load instruction in the Execute stage and a fresh instruction in the Fetch stage cannot execute simultaneously.

:::tip Note
Architectural correctness requires that hazards never produce incorrect calculation results. A hardware pipeline uses hazard detection units to hold back instructions (stalling), while compilers emit instruction sequences that explicitly avoid resource or dependency collisions.
:::

<Tabs>
<TabItem value="raw" label="RAW (Data Hazard)" default>

```text
Instruction A: ADD R1, R2, R3    ; R1 = R2 + R3 (Writes to R1)
Instruction B: SUB R4, R1, R5    ; R4 = R1 - R5 (Reads from R1)
```

Instruction $B$ requires the updated value of register `R1`. If Instruction $B$ reads `R1` from the register file before Instruction $A$ writes its completed execution result back into `R1`, Instruction $B$ operates on stale data.
</TabItem>
<TabItem value="control" label="Control Hazard">

```text
Instruction A: BEQ R1, R2, Target ; Branch if R1 == R2
Instruction B: ADD R3, R4, R5    ; Next sequential instruction in fetch
```

The pipeline fetches `Instruction B` in the cycle immediately following `Instruction A`. However, until `Instruction A` reaches the execution/comparison stage, the hardware does not know whether execution should proceed to `Instruction B` or jump to `Target`.
</TabItem>
<TabItem value="structural" label="Structural Hazard">

```text
Instruction A: LOAD R1, [R2]     ; Requests Memory Read Port in MEM stage
Instruction B: FETCH Instruction ; Requests Memory Read Port in FETCH stage
```

If the underlying hardware design contains only a single shared memory bus without separate L1 Instruction and L1 Data caches (a unified single-port memory structure), both operations attempt to access memory concurrently, creating a structural conflict.
</TabItem>
</Tabs>

---

## Hazard handling: Stalls vs Forwarding

To maintain execution correctness when a RAW hazard occurs, the processor microarchitecture can employ two distinct primary mechanisms: **pipeline stalls** or **operand forwarding**.

### Pipeline Stalls (Hardware Bubbles)
When the hardware hazard detection unit detects an unresolvable register dependency, it inserts stall cycles. To insert a stall, the processor:
1. Prevents the Program Counter (PC) and the Fetch/Decode pipeline registers from updating.
2. Sends zeroed control signals (a `NOP` or bubble) down the remaining execution pipeline stages.

This holds the dependent instruction in the Decode stage while allowing the precedent instruction to proceed toward Writeback. While simple, pipeline stalls directly increase the Average Cycles Per Instruction (CPI).

### Operand Forwarding (Bypassing)
Rather than waiting for an instruction to write its result back into the physical register file during the final pipeline stage, **operand forwarding** routes computed results directly from the output of execution functional units (or memory load buffers) back to the input multiplexers of execution units in subsequent stages.

![Pipeline Hazard Forwarding vs Stalling](/img/coa/pipeline-hazards.svg)

*Diagram: Forwarding routes completed results directly from execution stages to dependent instructions, avoiding stalls, whereas memory load latencies require hardware stall bubbles.*

Even with full forwarding hardware, a specific pattern known as a **load-use data hazard** cannot be completely eliminated without stalling. A memory load instruction does not obtain its data until the end of its Memory stage. If the immediately following instruction requires that loaded value in its Execute stage, operand forwarding cannot travel backward in time. Consequently, a load-use dependency forces the hardware to stall for at least one clock cycle.

:::caution
Hardware operand forwarding networks add multiplexers, routing wires, and control logic directly to critical path execution paths. Adding excessive bypass paths increases chip area and can negatively impact the maximum operable processor clock frequency.
:::

---

## A worked example

Consider a scalar pipeline with five classical stages: **Fetch (IF)**, **Decode (ID)**, **Execute (EX)**, **Memory (MEM)**, and **Writeback (WB)**.

Assume the hardware features a complete register-to-register forwarding network. However, because memory data is only available after the **MEM** stage, a load instruction followed immediately by an arithmetic instruction reading that same register produces a mandatory one-cycle load-use hazard stall.

### Unoptimized Instruction Sequence
The following sequence processes an array element by loading a value from memory, performing arithmetic, and storing a result back to memory:

```assembly
; Pointer in R2, increment value in R3, output pointer in R4
LOAD  R1, 0(R2)      ; Line 1: R1 = Memory[R2 + 0]
ADD   R5, R1, R3     ; Line 2: R5 = R1 + R3 (DEPENDS ON R1 - LOAD USE HAZARD)
SUB   R6, R7, R8     ; Line 3: R6 = R7 - R8 (Independent instruction)
STORE R5, 0(R4)      ; Line 4: Memory[R4 + 0] = R5 (DEPENDS ON R5)
```

#### Line-by-Line Microarchitectural Analysis

1. `LOAD R1, 0(R2)`:
   - Enters **IF**, advances to **ID**, then **EX** (computes memory address `R2 + 0`), and enters **MEM** (reads memory value into internal load buffer).
2. `ADD R5, R1, R3`:
   - Decoded while `LOAD` is in **EX**.
   - Requires `R1` at the beginning of its own **EX** stage.
   - However, when `ADD` is ready for **EX**, `LOAD` is only in **MEM**. The loaded value is not ready until the *end* of the **MEM** stage.
   - **Hazard Event**: The hardware hazard detection unit detects a **load-use hazard** on register `R1`.
   - **Hardware Action**: The control unit freezes the PC and holds `ADD` in the **ID** stage for one cycle, inserting a 1-cycle bubble into the **EX** stage.
   - Once `LOAD` finishes the **MEM** stage, the memory result is forwarded directly from the **MEM/WB** register to the **EX** stage input of `ADD`.
3. `SUB R6, R7, R8`:
   - An independent operation.
   - It is delayed by one cycle in the pipeline pipeline flow purely because of the stall bubble created above it.
4. `STORE R5, 0(R4)`:
   - `STORE` reads `R5` to send its value to memory.
   - `ADD` produces `R5` at the end of its **EX** stage.
   - When `STORE` reaches its **MEM** stage, `ADD` is in its **WB** stage.
   - **Forwarding Action**: The hardware forwards `R5` directly from the **EX/MEM** pipeline register of `ADD` to the memory data input of `STORE`. No stall cycle occurs here.

### Optimized Instruction Sequence (Compiler Rescheduled)
A static compiler instruction scheduler detects the load-use hazard on `R1` between Line 1 and Line 2. It searches the available basic block instructions for an independent operation (`SUB R6, R7, R8`) and places it into the delay slot immediately following the load:

```assembly
; Reordered instruction sequence emitted by the compiler backend
LOAD  R1, 0(R2)      ; Line 1: R1 = Memory[R2 + 0]
SUB   R6, R7, R8     ; Line 3: Interleaved independent operation
ADD   R5, R1, R3     ; Line 2: R5 = R1 + R3 (R1 is now ready in MEM/WB!)
STORE R5, 0(R4)      ; Line 4: Memory[R4 + 0] = R5
```

#### Microarchitectural Execution of the Scheduled Code
- While `LOAD` transitions from **EX** to **MEM**, `SUB` executes in the **EX** stage.
- During the next clock cycle, `LOAD` completes **MEM** and moves to **WB**.
- Concurrently, `ADD` enters the **EX** stage. The value of `R1` is successfully forwarded from `LOAD`'s **MEM/WB** boundary straight into `ADD`'s **EX** unit without inserting a single stall bubble.
- The load-use delay is completely hidden through static instruction reordering.

:::warning
When static compilers reorder instructions across basic block boundaries to hide pipeline hazards, they must strictly preserve exception safety. Moving a load instruction above a conditional branch could trigger an illegal memory access fault (e.g., dereferencing a null pointer) on a execution path that was never meant to run.
:::

---

## What the compiler can and cannot do

The compiler backend plays a primary role in maximizing instruction throughput by generating hazard-free machine code. Its impact can be evaluated directly using the classic **CPU Performance Equation**:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Clock Cycle Time\}$$

```
                          CPU Execution Time
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
 Instruction Count               CPI                Clock Cycle Time
 (Target Architecture &    (Pipeline Hazards &      (Silicon Process &
   Compiler Code Gen)      Instruction Latency)      Circuit Topology)
         │                        │                        │
         ├── High Influence       ├── Strong Influence     └── Minimal Influence
         │   (ISA Selection,      │   (Instruction          │   (Set by hardware
         │    Optimization)       │    Scheduling)          │    frequency)
```

- **Instruction Count**: Directly determined by compiler optimizations (e.g., dead code elimination, loop unrolling) and the target ISA.
- **Cycles Per Instruction (CPI)**: Strongly influenced by how effectively compiler instruction schedulers eliminate pipeline hazard stalls.
- **Clock Cycle Time**: Controlled strictly by semiconductor technology, hardware synthesis, and timing closure; the compiler has virtually no direct influence over cycle time.

### What the Compiler Can Do
1. **Instruction Scheduling / List Scheduling**: The backend instruction scheduler builds a Directed Acyclic Graph (DAG) of basic block operations. Nodes represent instructions, and edges represent data dependencies labeled with unit execution latencies. The compiler schedules independent DAG nodes to fill hardware latency gaps.
2. **Loop Unrolling & Vectorization**: Creates larger scheduling windows containing multiple independent iterations, giving the scheduler wider options to hide memory and arithmetic latencies.
3. **Register Allocation & Renaming**: Allocates distinct architectural registers to independent value lifetimes, eliminating artificial anti-dependencies (WAR) and output dependencies (WAW).
4. **Branch Elimination (Predication)**: Replaces high-risk conditional control branches with conditional execution instructions (e.g., ARM `csel` or x86 `cmov`), converting unpredictable Control hazards into straight-line Data hazards that pipelines handle smoothly.

### What the Compiler Cannot Do
1. **Dynamic Memory Latencies**: The static compiler cannot know with certainty whether a load instruction will result in an L1 cache hit or an L3/DRAM cache miss. It schedules for the common case (L1 hit latency), relying on dynamic hardware out-of-order execution mechanisms to handle variable memory stalls.
2. **Eliminate Physical Dependency Latencies**: If a fundamental algorithm forms a long, strictly sequential chain of dependent computations (e.g., calculating a pointer chase chain `p = p->next`), the compiler cannot insert independent work where none exists in the source logic.
3. **Control Out-of-Order Physical Register Allocation**: In modern out-of-order execution engines, architectural registers emitted by the compiler are mapped to a much larger pool of physical registers dynamically. The hardware reorders instructions on the fly inside register reservation stations.

:::tip Note
While modern out-of-order hardware dynamically reorders instructions to mitigate pipeline hazards, static compiler scheduling remains vital: pre-scheduled code consumes fewer dynamic reservation station entries and reduces power consumption by avoiding costly hardware dependency stalls.
:::

---

## Common misconceptions

### 1. Out-of-order processors make compiler instruction scheduling obsolete
**Correction**: While out-of-order (OoO) hardware uses dynamic instruction schedulers and register renaming to bypass stalls dynamically, its instruction window (reservation station capacity) is strictly finite. If the compiler presents an instruction stream riddled with immediate load-use dependencies and tight control hazards, the hardware instruction window quickly fills up with stalled operations. Static compiler scheduling ensures instructions arrive ready for execution, freeing dynamic hardware resources for unpredictable runtime latency events.

### 2. Forwarding paths completely eliminate all data hazards in hardware
**Correction**: Forwarding paths bypass hazards caused by register-to-register arithmetic execution delays. They cannot bypass data that does not yet exist in the hardware pipeline. As demonstrated in load-use hazards, memory access takes finite cycles. Operand forwarding cannot supply loaded data to an execution stage before that data is physically returned by L1 cache circuits, necessitating structural or temporal stall cycles unless filled by the compiler.

### 3. A pipeline stall alters the functional result of an execution thread
**Correction**: Pipeline hazards impact execution performance (CPI), but never affect functional correctness. The microarchitectural hazard detection unit guarantees software transparency: when a hazard cannot be resolved immediately, the hardware enforces a stall or flush to preserve precise program execution state. The exact same output state is computed regardless of how many stall bubbles occur.

---

## What To Read Next

Continue exploring computer architecture and compiler interactions across the CompilerSutra COA track:

- [/docs/coa](/docs/coa) — Main track index for Computer Organization and Architecture.
- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Instruction flow in a modern CPU: explore rename, reservation stations, and reorder buffers.
- [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) — Superscalar execution: handling pipeline hazards across multiple instruction execution ports per cycle.
- [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy) — Memory hierarchy: understanding how cache miss penalties interact with pipeline stalls.

---

## References

1. Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach* (6th ed.). Morgan Kaufmann.
2. Patterson, D. A., & Hennessy, J. L. *Computer Organization and Design: The Hardware/Software Interface*. Morgan Kaufmann.
3. Stallings, W. *Computer Organization and Architecture: Designing for Performance*. Pearson.
4. LLVM Compiler Infrastructure Documentation: *Target Machine Instruction Scheduling*. [llvm.org](https://llvm.org/docs/CodeGenerator.html)

<div>
  <AdBanner />
</div>
