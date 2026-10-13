---
title: "Load-Store Architecture: Compiler Pipeline Simplification"
description: "How restricting arithmetic instructions to registers simplifies instruction scheduling, register allocation, and hazard detection in compiler backends."
keywords:
  - load store architecture
  - register register architecture
  - memory operand
  - instruction scheduling
  - register allocation
  - software pipelining
  - compiler backend
  - hazard detection
  - structural hazard
  - memory dependency
  - spill code
  - instruction selection
  - addressing modes
  - latency asymmetry
  - load hit latency
  - alias analysis
  - execution pipeline
  - register pressure
  - machine description
  - target instruction set
  - operand constraints
  - memory latency
  - dynamic instruction count
  - code size
  - microarchitectural execution
displayed_sidebar: coasidebar
slug: /coa/load-store-architecture
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Load-Store Architecture: Compiler Pipeline Simplification

A load-store architecture strictly separates memory access from computation: instructions either transfer data between memory and registers or perform arithmetic and logical operations on registers alone. For a compiler engineer, this strict structural boundary eliminates multi-cycle memory stalls inside arithmetic execution stages, simplifying register allocation, instruction scheduling, and dependency analysis.

:::tip Read these first
- [/docs/coa/risc-vs-cisc](/docs/coa/risc-vs-cisc) — RISC vs CISC: what the compiler actually feels
- [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) — Registers and addressing modes
:::

:::important What you should leave with
- How restricting arithmetic instructions to register operands simplifies instruction scheduling and pipeline hazard detection.
- Why explicit load and store operations lower register allocator complexity while increasing register pressure.
- How memory-operand architectures force compilers to handle asymmetric execution latencies inside instruction selection.
- How load-store constraints isolate memory dependencies, allowing safer code motion during optimization.
:::

:::caution Who this is not for
If you need a refresher on how instructions pass through pipeline stages or how memory addresses are formed, read [/docs/coa/cpu_execution](/docs/coa/cpu_execution) and [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) first.
:::

:::note
A pure load-store architecture regulates the target instruction set contract (the ISA). Out-of-order hardware implementation microcode may decompose complex memory-register instructions into micro-operations, but it does so after instruction decode, leaving the compiler responsible for explicit pipeline scheduling on load-store targets.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [The Load-Store Constraint](#the-load-store-constraint)
2. [Impact on the Compiler Pipeline](#impact-on-the-compiler-pipeline)
3. [TL;DR](#tldr)
4. [Instruction Scheduling and Latency Asymmetry](#instruction-scheduling-and-latency-asymmetry)
5. [A Worked Example: Register vs. Memory Operands](#a-worked-example-register-vs-memory-operands)
6. [Register Allocation and Spill Overhead](#register-allocation-and-spill-overhead)
7. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
8. [Common Misconceptions](#common-misconceptions)
9. [What To Read Next](#what-to-read-next)
10. [References](#references)

---

## The Load-Store Constraint

In a pure load-store architecture (often called a register-register architecture), computational instructions such as arithmetic, logical, and shift operations accept operands exclusively from architectural registers and write their results back to an architectural register. Access to main memory is restricted to dedicated load and store instructions.

In contrast, architectures that allow memory operands permit ALU operations to read directly from, or write directly to, memory addresses inside a single instruction encoding.

| Feature | Pure Load-Store Architecture | Memory-Operand Architecture |
| :--- | :--- | :--- |
| **ALU Operands** | Architectural registers only | Registers or memory addresses |
| **Memory Operations** | Dedicated `LOAD` and `STORE` operations | Embedded within arithmetic/logical instructions |
| **Pipeline Stage Determinism** | Fixed fixed-stage location for memory operations | Variable execution path depending on operand type |
| **Addressing Modes** | Simple (base + offset, register offset) | Complex (multi-level indirect, scaled index with offset) |
| **Instruction Encoding Length** | Typically fixed (32-bit or 16-bit compressed) | Variable (1 to 15 bytes) |
| **Compiler Phase Impact** | Clear boundary between memory and compute phases | Blended memory-compute phase in instruction selection |

This architectural rule fundamentally shapes how hardware handles execution pipelines and how compiler backends plan code generation. When memory operations are cleanly separated from computation, the hardware execution path becomes deterministic with respect to where memory stalls can occur.

---

## Impact on the Compiler Pipeline

The presence or absence of memory-operand instructions directly affects three major phases of a compiler's backend:

1. **Instruction Selection:** A load-store architecture reduces the tree-matching complexity in target lowerings. An abstract syntax tree (AST) or Intermediate Representation (IR) node performing arithmetic on memory pointers maps directly to a discrete sequence: load value, perform arithmetic, store result. A memory-operand target requires the instruction selector to match combined pattern trees (such as `add [r1 + r2*4], r3`) into single complex instructions.
2. **Instruction Scheduling:** In a load-store architecture, memory latency is isolated to explicit load instructions. The instruction scheduler can reorder independent computation between a load and its subsequent use without worrying that an arithmetic operation might silently induce a multi-cycle cache miss stall.
3. **Register Allocation:** Because computational operations require register operands, register pressure is inherently higher in load-store architectures. The register allocator must keep values in registers longer, but it benefits from fixed operand constraints during graph coloring or linear-scan allocation.

:::tip Note
While memory-operand architectures offer higher code density by collapsing loads, operations, and stores into single instructions, they increase the complexity of compiler instruction schedulers, which must account for unpredictable multi-cycle latencies attached to seemingly simple arithmetic operations.
:::

---

## TL;DR

- **Load-store separation creates deterministic latency profiles for arithmetic operations**, simplifying compile-time dependency DAG creation and instruction scheduling.
- **Explicit load operations expose memory latencies directly to the compiler**, allowing software pipelining and list scheduling to fill load-delay slots efficiently.
- **Architectures with memory operands reduce register pressure** by allowing computational results to be directly written to or read from stack frames or heap locations.
- **Target ISAs dictate the optimization trade-off**: load-store ISAs require more architectural registers and generate higher instruction counts, but enable simpler backend transformations.

---

## Instruction Scheduling and Latency Asymmetry

In a simple pipeline, an ALU operation using register operands completes its execution stage in a known, uniform number of clock cycles (typically 1 cycle). However, when memory operands are permitted in arithmetic instructions, the execution timing of an arithmetic pipeline stage becomes asymmetric and dynamic.

Consider an addition instruction. If its operands are in registers, the hazard check is straightforward. If one operand is a memory address, the pipeline stage must calculate the effective address, issue a memory request, wait for data from the cache hierarchy, and then pass the result to the arithmetic unit.

The diagram below illustrates how a load-store architecture isolates memory access into a single dedicated pipeline phase, compared to a pipeline supporting memory-operand arithmetic:

![Load-Store vs Memory-Operand Pipeline Stages](/img/coa/load-store-architecture.svg)

*Diagram: Structural pipeline comparison showing how load-store architectures restrict memory execution to specific load/store operations, whereas memory-operand architectures introduce variable-latency memory reads directly into computational execution stages.*

:::warning
When scheduling instructions for in-order execution units, failing to model memory latency inside combined memory-arithmetic operations leads to unexpected execution pipeline stalls. Load-store architectures force the compiler to confront memory latency explicitly by exposing every load as an independent dependency root in the scheduling graph.
:::

To understand how scheduling differs between target architectures, consider how instruction dependency graphs treat execution options:

<Tabs>
  <TabItem value="load-store" label="Load-Store Architecture" default>

  Memory access is explicit. The instruction scheduler sees distinct DAG nodes for load, calculate, and store operations:

  ```
  t0 = Load [AddrA]      ; Latency: N cycles (Cache Hit)
  t1 = Load [AddrB]      ; Latency: N cycles
  t2 = Add t0, t1        ; Latency: 1 cycle (Register ALU)
  Store t2, [AddrC]      ; Latency: Store buffer fill
  ```

  The scheduler can easily insert independent work between `Load [AddrA]` and `Add t0, t1` to cover memory latency.

  </TabItem>
  <TabItem value="mem-operand" label="Memory-Operand Architecture">

  Memory operations are implicit in computation. The DAG node combines memory fetch and computation:

  ```
  Add [AddrC], [AddrA], [AddrB]  ; Combined Load-ALU-Store operation
  ```

  The scheduler cannot easily insert independent operations *inside* this instruction. If `[AddrA]` results in a cache miss, the entire execution unit stalls unless the CPU features an out-of-order execution pipeline capable of decomposing the instruction into micro-operations dynamically.

  </TabItem>
</Tabs>

---

## A Worked Example: Register vs. Memory Operands

Let us analyze how a compiler maps a simple C loop body across a pure load-store architecture versus a target that supports arithmetic on memory operands.

### Source C Code

```c
void add_arrays(int *a, int *b, int *c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}
```

### Case 1: Load-Store Execution Model (Register-Register)

```assembly
; Pointer registers: r0 = a, r1 = b, r2 = c, r3 = n
; Index / loop count: r4 = i
.LOOP:
    cmp     r4, r3          ; Compare loop index i with n
    bge     .EXIT           ; Exit if i >= n
    
    lsl     r5, r4, #2      ; r5 = i * 4 (byte offset)
    add     r6, r0, r5      ; r6 = &a[i]
    add     r7, r1, r5      ; r7 = &b[i]
    
    ldr     r8, [r6]        ; Load a[i] into r8
    ldr     r9, [r7]        ; Load b[i] into r9
    
    add     r10, r8, r9     ; r10 = a[i] + b[i] (Pure ALU)
    
    add     r11, r2, r5     ; r11 = &c[i]
    str     r10, [r11]      ; Store result to c[i]
    
    add     r4, r4, #1      ; i++
    b       .LOOP
.EXIT:
```

**Walkthrough:**
- Lines 9-10 issue two explicit memory reads (`ldr`). The values land in temporaries `r8` and `r9`.
- Line 12 performs the addition entirely within the register file (`add r10, r8, r9`). If `r8` or `r9` suffer a cache miss, only the dependent `add` instruction stalls.
- Line 15 writes the result back via an explicit store (`str`).
- **Compiler Benefit:** The compiler can easily reschedule `ldr r9` or loop control updates (`add r4, r4, #1`) between `ldr r8` and `add r10` to hide load hit latency.

### Case 2: Memory-Operand Execution Model

```assembly
; Pointer registers: rbx = a, rdx = b, rcx = c, rsi = n
; Index / loop count: rax = i
.LOOP:
    cmp     rax, rsi        ; Compare loop index i with n
    jge     .EXIT           ; Exit if i >= n
    
    mov     r8d, dword ptr [rbx + rax*4]   ; Load a[i]
    add     r8d, dword ptr [rdx + rax*4]   ; Load b[i] AND add to a[i]
    mov     dword ptr [rcx + rax*4], r8d   ; Store result to c[i]
    
    inc     rax                            ; i++
    jmp     .LOOP
.EXIT:
```

**Walkthrough:**
- The second instruction (`add r8d, dword ptr [rdx + rax*4]`) reads memory directly during execution.
- If the pointer `[rdx + rax*4]` misses in L1 cache, the execution stage performing the addition freezes until data arrives.
- **Compiler Overhead:** To optimize this, an in-order target's instruction scheduler must split combined operands into explicit load operations during early IR transformations—effectively transforming a memory-operand ISA back into a virtual load-store ISA internally.

---

## Register Allocation and Spill Overhead

Because pure load-store architectures require all operands to reside in registers, they experience higher **register pressure**. If a loop requires more variables than available physical registers, the register allocator must insert **spill code**—pushing values out to stack frames using explicit store instructions, and reloading them later.

To analyze how the target model impacts performance, state, and execution, consider the standard CPU performance equation:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$$

Using this model, we can evaluate the systemic impact of architecture constraints on compiler optimization:

```
              CPU Performance Equation Impact
  +-------------------------------------------------------+
  |  Target Architecture  |  Instruction Count  |   CPI   |
  +-----------------------+---------------------+---------+
  | Pure Load-Store       |      Higher         |  Lower  |
  | Memory-Operand        |      Lower          |  Higher |
  +-------------------------------------------------------+
```

1. **Instruction Count:** Load-store architectures generate higher dynamic instruction counts because every memory access requires a distinct `LOAD` or `STORE` opcode, along with register-based address calculations.
2. **Cycles Per Instruction (CPI):** Load-store targets achieve lower, more consistent CPI values because pipeline stages do not stall unpredictably on complex embedded memory read/write cycles.
3. **Cycle Time:** By simplifying decode logic and execution paths (avoiding combined address-generation/ALU/memory stages), load-store hardware enables higher core clock rates.

:::tip
Compilers targeting load-store architectures rely on large register files (typically 32 general-purpose registers or more) to offset higher register pressure and prevent spill code from consuming memory bandwidth.
:::

---

## What the Compiler Can and Cannot Do

Understanding the boundaries of load-store optimizations allows compiler writers to structure IR passes effectively:

### What the Compiler CAN Do
- **Software Pipelining:** Rearrange memory loads from future loop iterations into current iterations to fully mask cache read latencies.
- **Redundant Load Elimination / Load Freezing:** Store values in registers across long basic block sequences, knowing that explicit load operations will not execute unless explicitly emitted.
- **Pointer Alias Disambiguation:** Alias analysis can determine whether two register loads overlap; if non-aliasing is proved, the compiler can safely move memory operations past each other in the scheduling graph.

### What the Compiler CANNOT Do
- **Override Hard Hardware Latencies:** A load instruction missing L2 or L3 cache will stall dependent instruction execution regardless of how well the backend schedules independent register instructions.
- **Reduce Architectural Register Demands Beyond Register Graph Limits:** If the live-range count exceeds physical register capacity, the backend *must* spill registers to memory, adding explicit load and store instructions to the pipeline.
- **Expand Pipeline Width Hardware Execution Bounds:** The compiler can present optimal ILP (Instruction-Level Parallelism), but superscalar execution bounds remain limited by physical decode width and execution port availability (see [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution)).

---

## Common Misconceptions

### 1. "Load-store architectures are always faster because they emit cleaner instructions."
**Incorrect.** While individual instructions execute with lower CPI, pure load-store targets often require higher total instruction counts to complete the same work. Overall throughput depends on the target's pipeline design, cache hierarchy latency, and memory bandwidth (refer to [/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp)).

### 2. "Memory-operand architectures avoid software load scheduling entirely."
**Incorrect.** On modern microarchitectures, complex memory-operand instructions are often decoded into multiple underlying micro-operations (uops)—such as `uop0: Load`, `uop1: ALU`, `uop2: Store`. While the hardware scheduler can reorder these uops out-of-order, improper software scheduling still risks filling issue queues with waiting micro-operations.

### 3. "Compilers for load-store targets do not need alias analysis."
**Incorrect.** Alias analysis is essential for load-store architectures. If the compiler cannot prove that `Store [r1]` and `Load [r2]` write to distinct memory locations, it cannot reorder the `Load` above the `Store`, stalling execution pipelines.

---

## What To Read Next

Continue exploring Computer Organization and Architecture for compiler engineers:

- [/docs/coa/risc-vs-cisc](/docs/coa/risc-vs-cisc) — RISC vs CISC: what the compiler actually feels
- [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) — Registers and addressing modes
- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Instruction flow in a modern CPU
- [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy) — Memory hierarchy: locality and miss cost dominate compiler output

<div>
  <AdBanner />
</div>

## References

- Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*. 6th Edition.
- Cooper, K. D., & Torczon, L. *Engineering a Compiler*. 2nd Edition.
- Muchnick, S. S. *Advanced Compiler Design and Implementation*.
