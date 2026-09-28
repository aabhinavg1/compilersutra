---title: "What is an Instruction Set Architecture (ISA)?"
description: "Understand the ISA as the functional contract between the compiler and the processor, defining registers, instructions, and memory models."
keywords:
  - instruction set architecture
  - ISA
  - compiler contract
  - microarchitecture
  - architectural state
  - register allocation
  - memory consistency model
  - total store order
  - weak ordering
  - instruction selection
  - instruction scheduling
  - calling convention
  - application binary interface
  - ABI
  - register renaming
  - physical registers
  - architectural registers
  - x86-64
  - RISC-V
  - AArch64
  - memory barriers
  - instruction encoding
  - addressing modes
  - machine code
  - compiler backend
displayed_sidebar: coasidebar
slug: /coa/what-is-an-isa
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# What is an Instruction Set Architecture (ISA)?

An Instruction Set Architecture (ISA) is the abstract model of a processor that defines its supported data types, registers, memory model, and instruction behavior. For a compiler engineer, the ISA is the ultimate legal contract: it defines the exact boundary of what the hardware guarantees to execute correctly, leaving the microarchitectural implementation as a black box.

:::tip Read these first
- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Computer Architecture vs Computer Organization: ISA is the contract; organization is the implementation
- [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa) — Basic Terminology in COA: shared vocabulary for cycles, hazards, and memory
:::

:::important What you should leave with
- The ISA guarantees functional correctness, not performance.
- Compilers target architectural registers and state, while the hardware maps these to physical resources.
- Memory consistency models in the ISA dictate where a compiler must emit fences to ensure multi-threaded correctness.
- Instruction selection and scheduling must respect the ISA constraints while optimizing for the underlying microarchitecture.
:::

:::caution Who this is not for
If you do not yet understand the difference between a CPU cycle and an instruction, read [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa) first.
:::

:::note
An ISA cannot prevent performance pathologies caused by microarchitectural quirks like port contention or cache line bouncing.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The mechanism](#the-mechanism)
3. [Memory Consistency Models](#memory-consistency-models)
4. [A worked example](#a-worked-example)
5. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
6. [Common misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## TL;DR
- Target the lowest common denominator ISA extension unless compiling with target-specific flags (e.g., `-march`).
- Respect the memory model: do not reorder memory operations across acquire/release boundaries, even if the local CPU seems to allow it.
- Use the ABI-defined register roles to minimize register saving/restoring overhead in function prologues and epilogues.
- Do not assume instruction count correlates directly with execution time; microarchitectural fusion and execution ports break this assumption.

---

## The mechanism

The ISA defines the interface between the software and the hardware. It consists of several components that the compiler must manipulate to produce valid machine code:

1. **Instructions & Encoding**: The set of valid operations (opcodes), their operands, and how they are represented in binary.
2. **Architectural State**: The set of registers (general-purpose, floating-point, vector, and control registers) and the program counter (PC) visible to the programmer.
3. **Memory Model**: The address space size, byte ordering (endianness), alignment requirements, and memory consistency rules.
4. **System/ABI Interface**: Privilege levels, system call interfaces, and calling conventions that govern how functions pass arguments and return values.

| Situation | What the Hardware Does | What the Compiler Can Change |
| :--- | :--- | :--- |
| **Register pressure** | Renames architectural registers to a larger physical register file. | Allocates variables to minimize spills and respects caller/callee-saved bounds. |
| **Memory access** | Executes loads out-of-order but retires them sequentially. | Inserts memory barriers to enforce the ISA's memory consistency model. |
| **Control flow** | Predicts branch targets and speculatively executes instructions. | Arranges basic blocks to favor the fall-through path and uses conditional moves. |
| **Instruction selection** | Decodes complex instructions into simpler micro-operations ($\mu$ops). | Chooses the sequence of instructions that minimizes total latency or code size. |

The ISA acts as a strict interface layer separating the software (compiler, ABI, application) from the hardware (pipeline, execution units, physical registers).

![ISA as a contract](/img/coa/what-is-an-isa.svg)

*Diagram: The ISA serves as the boundary of functional abstraction, isolating compiler optimizations from the physical execution pipeline.*

:::tip Note
While the compiler targets the ISA, it must also be aware of the microarchitecture (the physical implementation of the ISA) to generate optimal code. However, microarchitectural optimizations must never violate the functional guarantees of the ISA.
:::

---

## Memory Consistency Models

One of the most critical aspects of the ISA contract is the memory consistency model. It defines the rules for how memory operations (reads and writes) from different threads or cores become visible to each other.

<Tabs>
  <TabItem value="tso" label="Total Store Order (TSO)" default>
    <h3>Total Store Order (TSO)</h3>
    <p>
      In a TSO model (such as x86-64), the hardware guarantees that stores from a single core are not reordered with other stores, and loads are not reordered with other loads. However, a load may be reordered with an earlier store to a different memory location (Store-Load reordering).
    </p>
    <p>
      <strong>Compiler Action:</strong> The compiler rarely needs to insert explicit memory fences for standard thread synchronization, except when a strict Store-Load barrier is required (e.g., in lock-free algorithms).
    </p>
  </TabItem>
  <TabItem value="weak" label="Weakly Ordered (Relaxed)">
    <h3>Weakly Ordered (Relaxed)</h3>
    <p>
      In a weakly ordered model (such as ARM AArch64 or RISC-V), the hardware is free to reorder any memory operations (Load-Load, Load-Store, Store-Store, Store-Load) as long as data dependencies within a single thread are respected.
    </p>
    <p>
      <strong>Compiler Action:</strong> The compiler must aggressively emit explicit memory barriers (fences) or use acquire/release instructions to ensure correct execution order in multi-threaded code.
    </p>
  </TabItem>
</Tabs>

:::warning
Failing to emit the correct memory barriers on a weakly ordered ISA will lead to intermittent, hard-to-debug concurrency bugs that may not manifest on strongly ordered hardware.
:::

---

## A Worked Example

Consider a simple C function that implements a thread-safe flag update using atomic operations:

```c
void set_flag(int* flag, int* data, int value) {
    *data = value;
    __atomic_store_n(flag, 1, __ATOMIC_RELEASE);
}
```

The compiler must ensure that the write to `data` is visible to other threads *before* the write to `flag` becomes visible. Let us look at how different ISAs handle this contract.

### Case 1: x86-64 (Strongly Ordered)

On x86-64, the memory model guarantees that stores are not reordered with other stores. Therefore, a standard store instruction is sufficient to implement release semantics.

```assembly
# rdi = flag, rsi = data, edx = value
mov dword ptr [rsi], edx  # Store data
mov dword ptr [rdi], 1    # Store flag (implicitly acts as a release store)
ret
```

The compiler does not need to emit any fence instructions because the x86-64 ISA guarantees that these stores will be observed in program order by other cores.

### Case 2: RISC-V (Weakly Ordered)

On RISC-V, the hardware is allowed to reorder the two stores. To prevent this, the compiler must insert a memory barrier or use an atomic instruction with release annotations.

```assembly
# a0 = flag, a1 = data, a2 = value
sw      a2, 0(a1)         # Store data
fence   w, w              # Fence: Ensure previous writes finish before subsequent writes
li      t0, 1
sw      t0, 0(a0)         # Store flag
ret
```

Alternatively, using RISC-V's atomic instructions (if the `A` extension is present):

```assembly
# a0 = flag, a1 = data, a2 = value
sw      a2, 0(a1)         # Store data
li      t0, 1
amoswap.w.rl zero, t0, (a0) # Atomic swap with Release (.rl) semantics
ret
```

The compiler uses its knowledge of the ISA's memory model to decide whether to emit a `fence` or rely on the implicit guarantees of the hardware.

---

## What the compiler can and cannot do

To analyze how a compiler optimizes code within the boundaries of an ISA, we use the classic CPU performance equation:

$$\text{CPU Time} = \text{Instruction Count} \times \text{CPI} \times \text{Cycle Time}$$

The compiler can directly manipulate **Instruction Count** and heavily influence **CPI (Cycles Per Instruction)**, but it has no control over **Cycle Time** (which is determined by the hardware manufacturing process and clock frequency).

### What the compiler can do:
- **Instruction Selection**: The compiler maps high-level operations to the most efficient ISA instructions. For example, it can replace a division instruction with a sequence of shifts and additions.
- **Register Allocation**: The compiler maps an arbitrary number of local variables to the limited set of architectural registers defined by the ISA.
- **Instruction Scheduling**: The compiler reorders instructions to avoid pipeline hazards (such as data dependencies or load latencies) while preserving the sequential execution semantics guaranteed by the ISA.

### What the compiler cannot do:
- **Exceed Architectural Registers**: If an ISA defines 16 general-purpose registers (like x86-64), the compiler cannot use 17. It must spill excess variables to the stack, even if the underlying microarchitecture has 180 physical registers.
- **Bypass Memory Semantics**: The compiler cannot reorder memory operations past an ISA-defined barrier, even if it knows the underlying hardware could execute them faster out-of-order without violating correctness in the common case.

:::caution
Do not confuse architectural registers with physical registers. Modern out-of-order CPUs use register renaming to map a small set of architectural registers to a much larger pool of physical registers to eliminate false dependencies (WAR and WAW hazards).
:::

---

## Common misconceptions

### 1. "Fewer instructions always mean faster execution."
This is false. A single complex ISA instruction (e.g., `string` operations on x86) may be decoded by the hardware into dozens of micro-operations ($\mu$ops), stalling the decoder and execution pipelines. Conversely, a sequence of three simple instructions might execute in parallel across multiple execution ports, resulting in a lower overall cycle count.

### 2. "The compiler can ignore memory ordering on single-core systems."
While a single core always observes its own memory operations in program order, ignoring memory barriers is a violation of the ISA contract. If the code is ever run on a multi-core system, or if it interacts with memory-mapped I/O (MMIO) devices, the lack of proper fences will cause catastrophic, non-deterministic failures.

### 3. "The ABI is part of the hardware ISA."
The Application Binary Interface (ABI) is a software convention (defining register usage, stack alignment, and calling conventions) built *on top* of the ISA. The hardware does not know or care about caller-saved or callee-saved registers; it merely executes the instructions. The compiler must adhere to the ABI to ensure interoperability between different compiled translation units.

---

## What To Read Next
- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Computer Architecture vs Computer Organization
- [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Instruction flow in a modern CPU
- [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) — Superscalar execution and instruction-level parallelism

<div>
  <AdBanner />
</div>

## References
- Patterson, D. A., & Hennessy, J. L. *Computer Organization and Design: The Hardware/Software Interface*.
- Stallings, W. *Computer Organization and Architecture*.
- RISC-V International. *The RISC-V Instruction Set Manual, Volume I: Unprivileged ISA*.



<div>
  <AdBanner />
</div>
