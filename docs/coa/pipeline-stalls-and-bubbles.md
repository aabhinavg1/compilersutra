---
title: "Pipeline Stalls and Bubbles: Compiler Scheduling and Load-Use Delays"
description: "How instruction pipeline stalls and bubbles insert lost issue slots, impact CPI in the CPU performance equation, and how compiler instruction scheduling mitigates load-use delays."
keywords:
  - pipeline stalls
  - pipeline bubbles
  - load use delay
  - branch delay
  - clock cycles per instruction
  - CPI equation
  - CPU performance equation
  - instruction count
  - cycle time
  - instruction scheduling
  - static scheduling
  - issue slots
displayed_sidebar: coasidebar
slug: /coa/pipeline-stalls-and-bubbles
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Pipeline Stalls and Bubbles: Compiler Scheduling and Load-Use Delays

When an instruction in a pipelined processor cannot execute on time due to unresolved data, control, or resource dependencies, the execution pipeline freezes one or more stages and passes empty operation slots down the remaining stages. Compiler backend engineers must structure assembly instructions to fill these wasted slots with useful, non-dependent work before hardware intervention forces pipeline bubbles.

:::tip Read these first
- [/docs/coa/cpu_execution](/docs/coa/cpu_execution) — Fetch–Decode–Execute: how instructions walk hardware stages.
- [/docs/coa/pipeline-hazards](/docs/coa/pipeline-hazards) — Pipeline hazards: data, control, and structural conditions that freeze execution.
:::

:::important What you should leave with
- A **pipeline stall** holds earlier pipeline stages stationary while allowing downstream stages to proceed, which manifests as a **pipeline bubble** (a lost issue slot).
- Load-use delays occur when an instruction immediately consumes the result of a memory load; even with hardware data forwarding, memory latency requires at least one delay slot.
- In the CPU performance equation ($\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$), pipeline bubbles directly increase the average Cycles Per Instruction (CPI).
- Instruction scheduling in the compiler reorganizes independent operations into load-use and branch delay gaps without altering program semantics.
:::

:::caution Who this is not for
If you are looking for high-level hazard classifications without hardware pipeline stage mechanics, review [/docs/coa/pipeline-hazards](/docs/coa/pipeline-hazards) before reading this lesson.
:::

:::note
While modern out-of-order execution cores dynamically reorder instructions to hide short stalls, compiler scheduling remains critical because out-of-order scheduler windows are finite and cannot absorb long or dense dependency stalls.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The Mechanism: Stalls vs Bubbles](#the-mechanism-stalls-vs-bubbles)
3. [The CPU Performance Equation and CPI Impact](#the-cpu-performance-equation-and-cpi-impact)
4. [Types of Pipeline Delays](#types-of-pipeline-delays)
5. [A Worked Example: Load-Use Delay and Scheduling](#a-worked-example-load-use-delay-and-scheduling)
6. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
7. [Common Misconceptions](#common-misconceptions)
8. [What To Read Next](#what-to-read-next)
9. [References](#references)

---

## TL;DR
- **Separate architectural intent from pipeline stalls:** A stall is a control signals mechanism that holds program counter updates and instruction registers stationary while downstream stages complete.
- **Identify bubble creation:** Replacing an issue slot with a no-operation condition (NOP bubble) propagates an empty operation through the pipeline, consuming a cycle without completing work.
- **Target load-use latency:** Hard memory access delays mean forwarding paths cannot deliver load data in time for an immediately following dependent operation; compilers must interleave independent instructions.
- **Optimize for CPI:** Compilers cannot alter hardware clock cycle duration, but instruction scheduling minimizes CPI penalty cycles caused by stalls.

---

## The Mechanism: Stalls vs Bubbles

A hardware instruction pipeline operates by shifting instructions from one processing stage to the next on every clock cycle. When an instruction in the decode or execute stage requires a result that is not yet ready, or a required execution unit is busy, the pipeline controller triggers a **stall signal**. 

During a stall:
1. The **Fetch** and **Decode** stages freeze: their state registers hold their current instruction values, and the Program Counter (PC) is prevented from incrementing.
2. The stage immediately following the point of congestion receives a microarchitectural no-operation (a **NOP** signal), creating a **bubble**.
3. Downstream stages continue advancing normally, executing instructions that were fetched before the stall occurred.

| Pipeline Situation | Hardware Mechanism | Compiler Remediation |
| :--- | :--- | :--- |
| **Load-Use Data Dependency** | Freezes decode stage; injects 1+ NOP bubbles into execute stage. | Schedule independent arithmetic or control instructions between load and use. |
| **Branch/Control Delay** | Flushes speculative instructions in fetch/decode; fills pipeline stages with bubbles. | Schedule branch instructions early; optimize branch predictions and branch hints. |
| **Structural Resource Hazard** | Holds instruction in decode stage until execution unit or memory bus frees up. | Interleave instruction types to balance functional unit pipeline usage. |

The diagram below illustrates how an unresolved dependency in Stage 2 (Decode) holds back earlier instructions while pushing an empty bubble slot downstream toward Writeback.

![Pipeline stall mechanism showing frozen fetch/decode stages and a bubble propagating to execution](/img/coa/pipeline-stalls-and-bubbles.svg)

*Diagram: A hardware pipeline stall freezes upstream registers and propagates a NOP bubble through execution stages.*

:::tip Note
A bubble in the execution pipeline occupies the exact same temporal slot as an explicitly encoded `nop` instruction, but it is generated entirely by hardware control logic during execution rather than residing in binary code.
:::

---

## The CPU Performance Equation and CPI Impact

To evaluate how stalls impact overall program speed, compiler engineers rely on the fundamental CPU Performance Equation:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$$

where:
- **Instruction Count ($\text\{IC\}$):** The total number of machine instructions executed for a given program run.
- **Cycles Per Instruction ($\text\{CPI\}$):** The average number of clock cycles required to execute a single instruction.
- **Cycle Time ($T_c$):** The duration of one hardware clock period.

In an ideal $N$-stage pipelined architecture executing continuous independent instructions, one instruction completes every single clock cycle, yielding an ideal base $\text\{CPI\}_\{\text\{ideal\}\} = 1.0$ (or $\text\{CPI\}_\{\text\{ideal\}\} = \frac\{1\}\{\text\{Issue Width\}\}$ on a superscalar machine). 

When hardware stalls occur, additional stall cycles are added to the execution timeline. The actual $\text\{CPI\}$ is calculated as:

$$\text\{CPI\}_\{\text\{actual\}\} = \text\{CPI\}_\{\text\{ideal\}\} + \text\{CPI\}_\{\text\{stall\_data\}\} + \text\{CPI\}_\{\text\{stall\_control\}\} + \text\{CPI\}_\{\text\{stall\_structural\}\}$$

Every pipeline bubble directly adds $1.0$ to the total execution cycle count without increasing the completed instruction count ($\text\{IC\}$). Consequently, bubbles directly inflate the $\text\{CPI\}_\{\text\{actual\}\}$ term in the performance equation.

<Tabs>
<TabItem value="ideal" label="Ideal Execution (No Stalls)">

  Assuming a 5-stage pipeline executing 4 independent instructions without hazards:

  - **Instruction Count ($\text\{IC\}$):** 4
  - **Total Cycles:** 8 (4 cycles to fill pipeline + 4 completion cycles)
  - **Effective CPI:** 
    $$\text\{CPI\} = \frac\{\text\{Total Cycles\}\}\{\text\{IC\}\} = \frac\{8\}\{4\} = 2.0 \quad (\text\{approaches \} 1.0 \text\{ as \} \text\{IC\} \to \infty)$$

  All pipeline slots are populated with architectural work.

</TabItem>
<TabItem value="stalled" label="Stalled Execution (2 Bubbles)">

  Assuming the same 4 instructions, but Instruction 2 experiences a 2-cycle load-use hazard:

  - **Instruction Count ($\text\{IC\}$):** 4
  - **Total Cycles:** 10 (8 base cycles + 2 bubble cycles)
  - **Effective CPI:** 
    $$\text\{CPI\} = \frac\{\text\{Total Cycles\}\}\{\text\{IC\}\} = \frac\{10\}\{4\} = 2.5$$

  The 2 bubble cycles directly inflate overall CPU time by $25\%$.

</TabItem>
</Tabs>

:::caution
While compiler transformations like loop unrolling or instruction scheduling may slightly alter total Instruction Count ($\text\{IC\}$), their primary objective in backend code generation is reducing total pipeline stall penalty cycles to push $\text\{CPI\}_\{\text\{actual\}\}$ as close as possible to $\text\{CPI\}_\{\text\{ideal\}\}$.
:::

---

## Types of Pipeline Delays

Pipeline delays stem from three distinct microarchitectural conditions. Understanding these mechanisms allows the backend compiler to structure code that avoids stalls.

### 1. Load-Use Data Delays
Even when a processor implements hardware data forwarding (bypassing), data retrieved from the memory subsystem or L1 data cache is unavailable until late in the load instruction's execution memory stage. If the immediately following instruction requires that loaded register value inside its own execution stage, data forwarding cannot bridge the temporal gap backward in time.

```
Cycle 1: LOAD  r1, [r0]   [Fetch -> Decode -> Memory -> Writeback]
Cycle 2: ADD   r2, r1, r3 [Fetch -> Decode (STALL) -> Wait -> Execute]
```

The processor must stall the consumer instruction for at least one clock cycle, inserting a bubble into the pipeline slot where execution would have occurred.

### 2. Control Delays (Branch Penalties)
When a conditional or unconditional branch instruction is decoded, the target address or the branch condition outcome (taken vs. not-taken) may not be resolved until later stages. If the hardware cannot accurately predict the target stream, instructions fetched immediately after the branch must be discarded (flushed). The flushed pipeline stages become bubbles.

### 3. Structural Resource Delays
Structural hazards occur when two distinct pipeline stages attempt to access the same physical hardware resource simultaneously. Examples include:
- A single-ported cache memory being accessed concurrently by an Instruction Fetch stage and a Data Memory Access stage.
- Multiple execution pipelines contending for a single non-pipelined floating-point divider unit.

In such cases, the hardware arbiter stalls the younger instruction, inserting a bubble into the corresponding execution slot until the shared unit becomes available.

:::warning
Do not confuse hardware execution stalls with software thread context switches or operating system yields. A pipeline stall is a low-level microarchitectural pause lasting from one to a few dozen clock cycles, governed entirely by hardware control logic.
:::

---

## A Worked Example: Load-Use Delay and Scheduling

Consider a C loop processing array elements, where each iteration loads a value from memory, performs an addition, and stores the result back to another array address.

### Unoptimized Assembly Sequence

Below is the raw, un-scheduled assembly sequence emitted without latency-aware register placement or instruction reordering. Addresses and pointers are tracked explicitly across registers:

```assembly
; Loop Header
; r0 = pointer to array A (source)
; r1 = pointer to array B (destination)
; r2 = scalar additive constant
; r3 = element loop counter

.Lloop_body:
    ldr   r4, [r0]          ; Load array A element into r4
    add   r5, r4, r2        ; Dependent operation on r4 (LOAD-USE HAZARD!)
    str   r5, [r1]          ; Store result to array B
    add   r0, r0, #4        ; Increment source pointer
    add   r1, r1, #4        ; Increment destination pointer
    subs  r3, r3, #1        ; Decrement loop counter
    bne   .Lloop_body       ; Loop branch if r3 != 0
```

#### Step-by-Step Execution Analysis

1. `ldr r4, [r0]`: The load instruction enters the pipeline. The memory system begins fetching data into register `r4`.
2. `add r5, r4, r2`: The decode stage reads instruction `add` and detects a register dependency on `r4`. Because `r4` will not be available until the `ldr` completes its Memory stage, the hardware pipeline controller stalls `add r5, r4, r2`.
3. **Hardware Stall Cycle:** A bubble (NOP slot) is pushed into the Execute stage for one clock cycle. The `add` instruction remains frozen in the Decode stage.
4. `str r5, [r1]`: Dependent on `r5` produced by the `add`. Once the `add` finishes execution, `r5` is bypassed directly to the store unit without further stalls.
5. `add r0, r0, #4`, `add r1, r1, #4`, `subs r3, r3, #1`: Non-dependent pointer and counter arithmetic instructions execute smoothly.

### Optimized Assembly Sequence (Compiler Scheduled)

By analyzing the Dependency DAG (Directed Acyclic Graph) of the loop body, a compiler's list scheduler identifies that pointer adjustments (`r0` and `r1`) do not depend on the loaded value in `r4`. The backend scheduler reorders independent instructions into the load-use delay gap:

```assembly
.Lloop_body_optimized:
    ldr   r4, [r0]          ; Load array A element into r4
    add   r0, r0, #4        ; Independent work: Increment source pointer
    add   r1, r1, #4        ; Independent work: Increment dest pointer
    add   r5, r4, r2        ; Consumer of r4: Executed 2 cycles after load!
    str   r5, [r1, #-4]     ; Store result (using adjusted offset)
    subs  r3, r3, #1        ; Decrement loop counter
    bne   .Lloop_body_optimized
```

#### Step-by-Step Optimized Execution Analysis

1. `ldr r4, [r0]`: Memory load initiated for `r4`.
2. `add r0, r0, #4`: Executes immediately in the cycle following the load. No register overlap with `r4`. **No pipeline stall.**
3. `add r1, r1, #4`: Executes in the next cycle. No overlap with `r4`. **No pipeline stall.**
4. `add r5, r4, r2`: By the time this instruction reaches the Execute stage, the memory load of `r4` has completed and the value is available on the hardware forwarding path.
5. **Result:** The load-use hazard is completely covered by useful work. The pipeline executes without generating a single NOP bubble, directly reducing the loop's CPI.

---

## What the Compiler Can and Cannot Do

When optimizing code to eliminate stalls, a compiler operates within precise boundaries governed by the target Architecture's Application Binary Interface (ABI) and hardware microarchitecture.

```
+-------------------------------------------------------------------+
|                        Compiler Control                           |
|  - Instruction Selection    - Instruction Scheduling (DAG)        |
|  - Register Allocation      - Loop Unrolling & Interleaving       |
+-------------------------------------------------------------------+
                                  │
                                  ▼
+-------------------------------------------------------------------+
|                       Hardware Microarchitecture                   |
|  - Memory Latency           - Clock Cycle Duration                |
|  - Physical Register Size   - Functional Unit Execution Times     |
+-------------------------------------------------------------------+
```

### What the Compiler CAN Influence
1. **Instruction Selection and Scheduling:** A compiler list-scheduler constructs an Instruction Dependency Graph (DAG) for each basic block. It calculates latency weights for each node (e.g., Load = 2 cycles, Multiply = 3 cycles, ALU = 1 cycle) and schedules non-dependent instructions into delay slots.
2. **Register Allocation and Renaming:** To prevent false data hazards (Write-After-Read and Write-After-Write hazards), the compiler allocates distinct architectural registers, eliminating unnecessary dependencies that would otherwise block scheduling.
3. **Loop Unrolling and Interleaving:** Unrolling loops exposes instructions from adjacent iterations, giving the scheduler a wider pool of independent operations to interleave between memory loads and dependent uses.

### What the Compiler CANNOT Change
1. **Hardware Memory Latency:** If an L1 cache miss occurs and data must be fetched from main DRAM, the hundreds of cycles of delay cannot be completely hidden by static instruction scheduling.
2. **Clock Cycle Time ($T_c$):** The compiler selects valid instruction combinations but has zero influence over hardware silicon clock rates or physical transit times across execution units.
3. **Physical Register File Size:** The compiler can only assign instructions to the fixed architectural registers defined by the ISA contract. Physical register renaming is managed dynamically by out-of-order execution hardware.

---

## Common Misconceptions

### Misconception 1: "Modern Out-of-Order (OoO) CPUs make static compiler instruction scheduling obsolete."
**Fact:** While out-of-order execution hardware uses dynamic scheduling reservation stations to find independent instructions at runtime, these hardware queues have finite instruction window sizes (e.g., 64 to 512 entries). If a compiler places long-latency loads immediately before their dependent consumers, dynamic reservation stations quickly fill up with stalled dependent instructions, blocking further dispatch. Proper compiler instruction scheduling reduces pressure on hardware reservation stations and improves overall execution window efficiency.

### Misconception 2: "Inserting explicit `nop` instructions in assembly is how compilers handle pipeline stalls."
**Fact:** Modern pipelined ISAs handle data hazard stalls entirely through hardware Interlocking control logic (as in MIPS-ISA extensions and ARM/x86 architectures). Compilers do not emit explicit `nop` instructions to handle load-use hazards unless target architectures lack hardware interlocking mechanisms (such as early VLIW or classic un-interlocked RISC architectures). The compiler simply reorders real, functional instructions to cover latencies.

### Misconception 3: "A pipeline bubble increases both cycle count and instruction count."
**Fact:** A bubble is an internal microarchitectural state where execution stage control signals are disabled (effectively doing no work). It consumes one clock cycle, directly inflating the total clock cycle count and raising the CPI metric. However, because no architectural state is updated, a bubble **does not** increment the retired Instruction Count ($\text\{IC\}$).

---

## What To Read Next

Continue exploring computer organization and compiler optimizations through these related architectural lessons:

- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Computer Architecture vs Computer Organization: ISA contract vs implementation decisions.
- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Instruction flow in a modern CPU: rename, schedule, execute, and retire.
- [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) — Superscalar execution: managing parallel instruction issue slots and multiple pipelines.
- [/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — Measuring throughput and stalls using hardware performance counters (`perf`).

<div>
  <AdBanner />
</div>

## References

- Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*. Morgan Kaufmann.
- Cooper, K. D., & Torczon, L. *Engineering a Compiler*. Morgan Kaufmann.
- Muchnick, S. S. *Advanced Compiler Design and Implementation*. Morgan Kaufmann.
