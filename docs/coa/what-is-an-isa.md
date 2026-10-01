---
title: "What is an Instruction Set Architecture (ISA)?"
description: "Learn what an Instruction Set Architecture (ISA) is, how it differs from microarchitecture, and how instructions, registers, memory models, and addressing modes define the software–hardware interface."
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
  - ISA vs ABI
  - ISA vs microarchitecture
displayed_sidebar: coasidebar
slug: /coa/what-is-an-isa
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# What is an Instruction Set Architecture (ISA)?

An Instruction Set Architecture (ISA) is the specification of the instructions, registers, memory behavior, and other programmer-visible features that software can rely on when running on a processor.

**ISA = what the processor exposes. Microarchitecture = how a particular processor implements it.**

For a compiler engineer, the ISA is the ultimate legal contract: it defines the exact boundary of what the hardware guarantees to execute correctly, leaving the microarchitectural implementation as a black box.

```text
Program
   ↓
Compiler / Assembler
   ↓
ISA
   ↓
CPU implementation
   ↓
Execution
```

:::tip Read these first
- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Computer Architecture vs Computer Organization: ISA is the contract; organization is the implementation
- [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa) — Basic Terminology in COA: shared vocabulary for cycles, hazards, and memory
:::

:::important What you should leave with
- The ISA guarantees functional correctness, not performance.
- Compilers target architectural registers and state, while the hardware maps these to physical resources.
- Memory consistency models in the ISA dictate where a compiler must emit fences to ensure multi-threaded correctness.
- Instruction selection and scheduling must respect the ISA constraints while optimizing for the underlying microarchitecture.
- The ISA and the ABI are separate layers: the ISA defines what the hardware executes; the ABI defines how compiled programs agree to use it.
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
2. [ISA in one sentence](#isa-in-one-sentence)
3. [What does an ISA define?](#what-does-an-isa-define)
4. [ISA vs Microarchitecture](#isa-vs-microarchitecture)
5. [How the Compiler Uses the ISA](#how-the-compiler-uses-the-isa)
6. [Registers: Architectural vs Physical](#registers-architectural-vs-physical)
7. [Memory Models](#memory-models)
8. [A worked example](#a-worked-example)
9. [ISA vs ABI](#isa-vs-abi)
10. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
11. [Common misconceptions](#common-misconceptions)
12. [What To Read Next](#what-to-read-next)
13. [References](#references)

---

## TL;DR
- Target the lowest common denominator ISA extension unless compiling with target-specific flags (e.g., `-march`).
- Respect the memory model: do not reorder memory operations across acquire/release boundaries, even if the local CPU seems to allow it.
- Use the ABI-defined register roles to minimize register saving/restoring overhead in function prologues and epilogues.
- Do not assume instruction count correlates directly with execution time; microarchitectural fusion and execution ports break this assumption.
- The ISA guarantees correctness, not performance. Two CPUs can implement the same ISA with completely different performance.

---

## ISA in one sentence

An ISA is the contract between software and hardware: it defines what instructions exist, what state is visible, and what behavior is guaranteed — nothing more.

| Term | Meaning | Example |
| :--- | :--- | :--- |
| **ISA** | Software-visible instruction and execution contract | x86-64, AArch64, RISC-V |
| **Microarchitecture** | Internal implementation of an ISA | Pipeline, cache, branch predictor |
| **CPU** | Physical processor implementing an ISA | Intel Core, AMD Ryzen, Apple CPU |
| **ABI** | Binary interface used by compiled programs | System V AMD64, AAPCS64 |

Two CPUs can implement the same ISA while having completely different microarchitectures. The ISA is the contract; the microarchitecture is one implementation of that contract.

---

## What does an ISA define?

An ISA is not just "the set of instructions." It is a complete specification of the programmer-visible machine:

- **Instructions**: The valid operations (opcodes), their operands, and their semantics.
- **Register state**: General-purpose, floating-point, vector, and control registers visible to the programmer.
- **Data types and operand sizes**: What widths are supported (8, 16, 32, 64 bits) and how they are interpreted.
- **Memory addressing**: Address space size, byte ordering (endianness), alignment requirements, and addressing modes.
- **Instruction encoding**: How instructions are represented in binary.
- **Exceptions and traps**: What happens on errors, interrupts, and system calls.
- **Atomic operations**: Which operations are guaranteed to be indivisible.
- **Memory ordering**: The consistency model that governs how memory operations from different threads become visible to each other.
- **Privilege and system-level behavior**: User vs kernel mode, virtual memory, and protection.

Concepts commonly associated with an ISA — such as the ABI, OS interfaces, and device interfaces — are separate layers built on top.

| Feature | x86-64 | AArch64 | RISC-V |
| :--- | :--- | :--- | :--- |
| General-purpose registers | 16 | 31 | 32, including a hardwired zero |
| Typical instruction encoding | Variable length | Fixed 32-bit | Base ISA fixed 32-bit |
| Memory model | Relatively strong (TSO) | Weak | Weak (RVWMO) |
| Register-register arithmetic | Yes | Yes | Yes |
| Vector extension | AVX family | NEON and SVE | V extension |
| Acquire/release in the ISA | Yes | Yes (`LDAR` / `STLR`) | Yes (`.aq` / `.rl`, plus fences) |

The counts and extensions above are the base contracts a compiler usually targets. A particular chip may implement more, and a binary only sees the extensions it was compiled for.

---

## ISA vs Microarchitecture

The most important idea in this article:

**Same ISA ≠ same performance.**

```text
Same ISA
    │
    ├── CPU A
    │   └── 4-wide OoO, large cache
    │
    ├── CPU B
    │   └── 6-wide OoO, different predictor
    │
    └── CPU C
        └── in-order / embedded implementation
```

All three can execute the same binary correctly. Their performance need not match. The ISA guarantees correctness; the microarchitecture determines performance.

The ISA acts as a strict interface layer separating the software (compiler, ABI, application) from the hardware (pipeline, execution units, physical registers).

![ISA as a contract](/img/coa/what-is-an-isa.svg)

*Diagram: The ISA serves as the boundary of functional abstraction, isolating compiler optimizations from the physical execution pipeline.*

:::tip Note
While the compiler targets the ISA, it must also be aware of the microarchitecture (the physical implementation of the ISA) to generate optimal code. However, microarchitectural optimizations must never violate the functional guarantees of the ISA.
:::

---

## How the Compiler Uses the ISA

The compiler is the consumer of the ISA contract. It must produce code that is valid for the target ISA while optimizing for the underlying microarchitecture.

| Compiler task | What the ISA constrains | What the microarchitecture influences |
| :--- | :--- | :--- |
| **Instruction selection** | Which instructions and operand forms are valid | Which sequences execute fastest on the target |
| **Register allocation** | How many architectural registers exist | How many physical registers are available for renaming |
| **Instruction scheduling** | What dependencies the ISA defines | How the pipeline, execution ports, and latencies behave |
| **Code generation** | The binary encoding of instructions | Instruction fetch, decode, and cache behavior |

The compiler must select instructions and operands that are valid for the target ISA. The assembler or compiler's machine-code emitter then encodes those instructions according to the ISA's binary format.

---

## Registers: Architectural vs Physical

The number and types of architectural registers constrain the set of registers available to generated code. If register demand exceeds the available architectural registers, the compiler may need to spill values to memory.

The compiler does not allocate directly into physical registers. Modern out-of-order CPUs use register renaming to map a small set of architectural registers to a much larger pool of physical registers to eliminate false dependencies (WAR and WAW hazards).

```text
Compiler sees:

x0 x1 x2 x3 ...   ← architectural registers

CPU internally:

P0 P1 P2 P3 ... P127   ← physical registers
```

The compiler allocates into architectural registers. The hardware renames them to physical registers at runtime. A binary written for 31 architectural registers stays correct on a chip whose rename file is much larger.

---

## Memory Models

One of the most critical aspects of the ISA contract is the memory consistency model. It defines the rules for how memory operations (reads and writes) from different threads or cores become visible to each other.

The compiler must generate instructions whose architectural memory-ordering semantics satisfy the language-level memory model. The hardware is then allowed to execute those instructions aggressively, provided the architectural guarantees are preserved.

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
      In a weakly ordered memory model, the architecture permits fewer ordering guarantees between memory operations than a stronger model such as x86-64 TSO. Hardware may therefore make memory operations become observable in an order different from program order, subject to the dependencies and ordering guarantees defined by the ISA.
    </p>
    <p>
      <strong>Compiler Action:</strong> The compiler must emit explicit memory barriers (fences) or use acquire/release instructions to ensure correct execution order in multi-threaded code.
    </p>
  </TabItem>
</Tabs>

:::warning
Failing to emit the correct memory barriers on a weakly ordered ISA can produce subtle, intermittent synchronization bugs that may be difficult to reproduce.
:::

---

## A worked example

Consider a simple C function that implements a thread-safe flag update using atomic operations:

```c
void writer(int* flag, int* data) {
    *data = 42;
    __atomic_store_n(flag, 1, __ATOMIC_RELEASE);
}

void reader(int* flag, int* data) {
    while (__atomic_load_n(flag, __ATOMIC_ACQUIRE) == 0)
        ;
    // Safe to observe data
    assert(*data == 42);
}
```

The compiler must emit a release store for `flag` so that a thread which acquires that flag can also observe `data == 42`. That is a happens-before edge, not a promise that every other core sees the stores in a global instant. Each ISA spells the edge differently.

### Case 1: x86-64 (Strongly Ordered)

On x86-64, the memory model guarantees that stores are not reordered with other stores. Therefore, a standard store instruction is sufficient to implement release semantics.

```assembly
# rdi = flag, rsi = data
mov edx, 42
mov dword ptr [rsi], edx  # Store data
mov dword ptr [rdi], 1    # Store flag (a plain store is a release store)
ret
```

A plain x86-64 store is enough for release, because the ISA does not reorder a store with an older store from the same core. A sequentially consistent store can still need `xchg` or a fence. Release is the weaker of the two.

### Case 2: AArch64 (Weakly Ordered)

On AArch64, the hardware is allowed to reorder the two stores. To prevent this, the compiler must use an atomic instruction with release semantics.

```assembly
# x0 = flag, x1 = data
mov  w2, #42
str  w2, [x1]             # Store data
mov  w3, #1
stlr w3, [x0]             # Store-Release to flag
ret
```

`STLR` ensures that a thread performing a matching acquire cannot observe the release store without also being able to observe the writes that happened before it. It does not mean the hardware is forbidden from executing other work aggressively. It means an observer who sees the flag also sees `data == 42`.

The reader uses a matching acquire load:

```assembly
# x0 = flag, x1 = data
ldar  w3, [x0]            # Load-Acquire: observes the release
ldr   w4, [x1]            # Safe to read data
```

This makes the **release → acquire → happens-before** relationship concrete: the acquiring load that observes the release store also observes all writes that happened before it.

### Case 3: RISC-V (Weakly Ordered)

On RISC-V, the hardware is allowed to reorder the two stores. To prevent this, the compiler must insert a memory barrier or use an atomic instruction with release annotations.

```assembly
# a0 = flag, a1 = data
li      a2, 42
sw      a2, 0(a1)         # Store data
fence   w, w              # Order this write before the flag write
li      t0, 1
sw      t0, 0(a0)         # Store flag
ret
```

Alternatively, using RISC-V's atomic instructions (if the `A` extension is present):

```assembly
# a0 = flag, a1 = data
li      a2, 42
sw      a2, 0(a1)         # Store data
li      t0, 1
amoswap.w.rl zero, t0, (a0) # Atomic swap with release (.rl) semantics
ret
```

The compiler uses its knowledge of the ISA's memory model to decide whether to emit a `fence` or rely on the implicit guarantees of the hardware.

---

## ISA vs ABI

The ISA does not define everything software needs to agree on. The ABI is a separate layer built on top of the ISA.

```text
ISA
├── Instructions
├── Registers
├── Memory semantics
├── Exceptions
└── Addressing behavior

ABI
├── Calling convention
├── Argument registers
├── Return registers
├── Stack layout
├── Register preservation
└── Binary/object conventions
```

For example, the ISA may define registers such as `x0–x30`, but the ABI determines which registers carry function arguments, which registers must be preserved across calls, and where return values are placed.

The hardware does not know or care about caller-saved or callee-saved registers; it merely executes the instructions. The compiler must adhere to the ABI to ensure interoperability between different compiled translation units.

---

## What the compiler can and cannot do

To analyze how a compiler optimizes code within the boundaries of an ISA, we use the classic CPU performance equation:

$$\text{CPU Time} = \text{Instruction Count} \times \text{CPI} \times \text{Cycle Time}$$

The compiler **strongly influences** instruction count through instruction selection and optimization. It **indirectly influences** CPI through scheduling, register pressure, and code layout. Cycle time is primarily determined by the processor's hardware implementation and operating conditions, rather than by individual compiler decisions.

On modern out-of-order CPUs, hardware scheduling often dominates instruction scheduling, although compiler ordering, instruction selection, register pressure, and code layout can still affect observed CPI.

### What the compiler can do:
- **Instruction Selection**: The compiler maps high-level operations to the most efficient ISA instructions. For example, it can replace a division instruction with a sequence of shifts and additions.
- **Register Allocation**: The compiler maps an arbitrary number of local variables to the limited set of architectural registers defined by the ISA.
- **Instruction Scheduling**: The compiler reorders instructions to avoid pipeline hazards (such as data dependencies or load latencies) while preserving the sequential execution semantics guaranteed by the ISA.

### What the compiler cannot do:
- **Exceed Architectural Registers**: If an ISA defines 16 general-purpose registers (like x86-64), the compiler cannot use 17. It must spill excess variables to the stack, even when the chip renames those 16 names onto a larger physical file.
- **Bypass Memory Semantics**: The compiler cannot reorder memory operations past an ISA-defined barrier, even if it knows the underlying hardware could execute them faster out-of-order without violating correctness in the common case.
- **Invent an instruction the target does not implement**: If the encoded instruction is not part of the selected ISA or extension, the CPU may raise an illegal-instruction exception. The compiler's lever is a different instruction sequence, a library routine, or a lower ISA target. Microcode inside a CPU that does implement the instruction is not the same thing as software emulation.

:::caution
Do not confuse architectural registers with physical registers. Modern out-of-order CPUs use register renaming to map a small set of architectural registers to a much larger pool of physical registers to eliminate false dependencies (WAR and WAW hazards).
:::

---

## Common misconceptions

### 1. "Fewer instructions always mean faster execution."
This is false. A single complex ISA instruction (e.g., `string` operations on x86) may be decoded by the hardware into dozens of micro-operations ($\mu$ops), stalling the decoder and execution pipelines. Conversely, a sequence of three simple instructions might execute in parallel across multiple execution ports, resulting in a lower overall cycle count.

### 2. "The compiler can ignore memory ordering on single-core systems."
While a single core always observes its own memory operations in program order, ignoring memory barriers is a violation of the ISA contract. If the code is ever run on a multi-core system, or if it interacts with memory-mapped I/O (MMIO) devices, the lack of proper fences will cause subtle, non-deterministic failures.

### 3. "The ABI is part of the hardware ISA."
The Application Binary Interface (ABI) is a software convention (defining register usage, stack alignment, and calling conventions) built *on top* of the ISA. The hardware does not know or care about caller-saved or callee-saved registers; it merely executes the instructions. The compiler must adhere to the ABI to ensure interoperability between different compiled translation units.

### 4. "More architectural registers always result in faster code."
More architectural registers can reduce register pressure and spills, but they are not automatically faster. More registers can increase encoding requirements and architectural state, while performance also depends heavily on instruction width, register-file design, compiler quality, and microarchitecture.

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
