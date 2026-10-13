---
title: "Instruction Formats and Encoding: Constant Materialization"
description: "Learn how hardware instruction encoding limits immediate widths and how compilers synthesize large constants and offsets."
keywords:
  - instruction encoding
  - instruction formats
  - immediate field
  - immediate materialization
  - opcode
  - register fields
  - fixed-width instruction
  - variable-width instruction
  - RISC-V encoding
  - ARM64 encoding
  - x86-64 encoding
  - constant synthesis
  - literal pool
  - PC-relative
  - code density
  - instruction cache
  - instruction fetch
  - decode overhead
  - sign extension
  - zero extension
  - displacement
  - offset
  - branch target
  - jump target
  - register allocation
  - instruction selection
displayed_sidebar: coasidebar
slug: /coa/instruction-formats-and-encoding
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Instruction Formats and Encoding: Constant Materialization

Instruction sets must fit their operations, register specifiers, and immediate values into a compact binary representation. Because physical instruction sizes are constrained to optimize instruction fetch and decode pipelines, compilers cannot directly load arbitrary 32-bit or 64-bit constants within a single standard instruction.

This guide explains how instruction formats limit immediate widths, how the compiler works around these limits to materialize constants, and the trade-offs between code size, instruction count, and decode complexity.

:::tip Read these first
* [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — The distinction between the ISA contract and microarchitectural organization.
* [/docs/coa/risc-vs-cisc](/docs/coa/risc-vs-cisc) — How fixed-width and variable-width instructions alter compiler decisions.
* [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) — How operands are specified in the instruction stream.
:::

:::important What you should leave with
* The mathematical limit that instruction width places on immediate operand sizes.
* The algorithm compilers use to adjust high-immediate values when the low-immediate instruction performs sign extension.
* The trade-offs between inline constant synthesis, literal pools, and direct memory loading.
* How variable-width instructions trade decode complexity for denser immediate encoding.
:::

:::caution Who this is not for
If you are not yet familiar with how a CPU fetches, decodes, and executes a single instruction, read [/docs/coa/cpu_execution](/docs/coa/cpu_execution) before continuing.
:::

:::note
This lesson focuses on general-purpose integer architectures. Vector and SIMD architectures use distinct, specialized mechanisms (such as broadcast loads) to populate wide registers.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The Encoding Constraint](#the-encoding-constraint)
3. [Constant Materialization Strategies](#constant-materialization-strategies)
4. [A Worked Example: The Sign-Extension Gotcha](#a-worked-example-the-sign-extension-gotcha)
5. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
6. [Common Misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## TL;DR
* **Immediates are limited by bit-budgeting:** In a fixed 32-bit instruction, allocating bits for the opcode and register specifiers leaves only a small fraction (typically 12 to 16 bits) for immediate values.
* **Large constants require synthesis:** To load a 32-bit or 64-bit value on a RISC architecture, the compiler must emit a sequence of instructions (e.g., shift-and-add, or high-immediate load followed by an addition) or load the value from a PC-relative literal pool.
* **Sign extension alters the high bits:** When the lower immediate instruction sign-extends its operand, the compiler must pre-compensate by adding `1` to the upper immediate instruction if the sign bit of the lower immediate is set.
* **Code density impacts the I-cache:** Variable-width instructions allow small constants to take up less space, reducing instruction cache footprint at the expense of more complex, power-hungry hardware decoders.

---

## The Encoding Constraint

Every instruction must pack several pieces of information into a single bitstring:
1. **Opcode:** What operation to perform.
2. **Destination Register ($r_d$):** Where to write the result.
3. **Source Registers ($r_s1, r_s2$):** Where to read the inputs.
4. **Immediate / Displacement:** Inlined constant data.

In a fixed-width 32-bit ISA, these fields must compete for the same 32 bits. If an architecture supports 32 general-purpose registers, each register specifier requires $\log_2(32) = 5$ bits. An instruction with one destination and two sources consumes 15 bits just for register selection, leaving only 17 bits for the opcode and any immediate values.

| Situation | Hardware Constraint | Compiler Workaround |
| :--- | :--- | :--- |
| **Immediate fits in field** (e.g., `x = x + 4`) | Hardware decodes and executes in a single cycle. | Select the immediate-variant instruction (e.g., `addi`). |
| **Immediate exceeds field** (e.g., `x = x + 0x12345678`) | No single instruction can hold the 32-bit constant. | Split the constant into high and low parts, or load from a literal pool. |
| **Branch target out of range** | Branch offset field is too small for the jump distance. | Invert the branch condition to jump over a long-range unconditional jump. |

The figure below illustrates how a fixed 32-bit instruction format forces a trade-off between register addressability and immediate field width, and how this split requires the compiler to use multiple instructions to construct a full 32-bit constant.

![Instruction format layout and constant synthesis split](/img/coa/instruction-formats-and-encoding.svg)

*Diagram: A comparison of RISC-V I-type and U-type instruction layouts, showing how a 32-bit constant must be split into a 20-bit upper immediate and a 12-bit lower immediate.*

:::tip Note
Variable-width architectures (like x86-64) do not have a fixed bit budget per instruction. They can append a full 32-bit or 64-bit immediate to the end of an instruction prefix and opcode. However, this increases the complexity of the instruction length decoder, which must determine where the instruction ends before it can dispatch it to the pipeline.
:::

---

## Constant Materialization Strategies

When a compiler encounters a constant that exceeds the immediate field width of the target instruction format, it must select an alternative strategy based on the ISA design.

<Tabs>
  <TabItem value="riscv" label="RISC-V Two-Instruction Synthesis" default>

RISC-V splits 32-bit constants using a 20-bit upper immediate instruction (`lui` - Load Upper Immediate) and a 12-bit immediate instruction (`addi` - Add Immediate). 

Because `addi` sign-extends its 12-bit immediate, the compiler must inspect bit 11 of the lower 12 bits. If bit 11 is `1`, the hardware will sign-extend the value, effectively subtracting $2^\{12\}$ ($4096$) from the upper portion. To counteract this, the compiler must add `1` to the high 20-bit value loaded by `lui`.

```assembly
# Goal: Load 0x12345F00 into a0
# 0x12345F00 split:
# High 20 bits: 0x12345 -> but low 12 bits (0xF00) have bit 11 set (0x1)
# Compiler adjusts high 20 bits: 0x12345 + 1 = 0x12346
lui  a0, 0x12346        # a0 = 0x12346000
addi a0, a0, -256       # a0 = 0x12346000 + 0xFFFFF000 = 0x12345F00
```

  </TabItem>
  <TabItem value="arm64" label="ARM64 Move Wide" default>

ARM64 uses 32-bit fixed-width instructions but provides a different mechanism: `movz` (Move with Zero) and `movk` (Move with Keep). These instructions can load a 16-bit immediate into any of the four 16-bit quarters of a 64-bit register, either zeroing the remaining bits (`movz`) or keeping them intact (`movk`).

This design avoids the sign-extension math of RISC-V but can require up to four instructions to materialize an arbitrary 64-bit constant.

```assembly
# Goal: Load 0x123456789ABC into x0
movz x0, #0x9abc, lsl #0   # x0 = 0x0000000000009ABC
movk x0, #0x5678, lsl #16  # x0 = 0x0000000056789ABC
movk x0, #0x1234, lsl #32  # x0 = 0x0000123456789ABC
```

  </TabItem>
  <TabItem value="literal" label="Literal Pools" default>

For architectures where instruction synthesis requires too many instructions (such as loading a 64-bit constant on a 32-bit ARM or RISC-V target), compilers use **literal pools**. 

The compiler places the constant in a read-only data section close to the function code and emits a single PC-relative load instruction.

```assembly
# Goal: Load a 64-bit constant on a 32-bit target
ldr  r0, [pc, #8]       # Load value from PC + 8 bytes
b    .Lcontinue         # Jump over the literal pool data
.quad 0x123456789ABCDEF0 # Constant stored in the instruction stream
.Lcontinue:
```
*Trade-off:* This reduces instruction count but introduces a data cache access and consumes space in the instruction cache for non-executable data.

  </TabItem>
</Tabs>

---

## A Worked Example: The Sign-Extension Gotcha

Let us look at a concrete C function that uses a specific 32-bit constant, and trace how a RISC-V compiler generates the assembly.

```c
unsigned int get_mask() {
    return 0x12345F00;
}
```

If the compiler did not account for sign extension, it might naively split `0x12345F00` into:
* High 20 bits: `0x12345`
* Low 12 bits: `0xF00`

Let us trace what the hardware would do with that naive split:

```assembly
# Naive (Incorrect) Generation
lui  a0, 0x12345        # a0 = 0x12345000
addi a0, a0, 0xF00      # 0xF00 is sign-extended!
                        # 0xF00 as a 12-bit signed integer is -256 (0xFFFFF000)
                        # a0 = 0x12345000 + 0xFFFFF000 = 0x12344F00 (WRONG)
```

To prevent this, the compiler's code generator runs an adjustment algorithm during instruction selection:

1. Extract the lower 12 bits of the constant: `0x12345F00 & 0xFFF = 0xF00`.
2. Check if bit 11 of the lower 12 bits is set: `0xF00` in binary is `1111 0000 0000`. Bit 11 is `1`.
3. Because bit 11 is set, the `addi` instruction will sign-extend `0xF00` to `0xFFFFF000` (which is $-256$ in decimal).
4. To compensate, add `1` to the upper 20 bits: `0x12345 + 1 = 0x12346`.
5. Emit the corrected sequence:

```assembly
# Correct Compiler Output
lui  a0, 0x12346        # a0 = 0x12346000
addi a0, a0, -256       # a0 = 0x12346000 - 0x100 = 0x12345F00 (CORRECT)
```

:::warning
If a compiler backend developer forgets to implement this compensation step in the target-specific instruction selector, the compiler will generate silent data corruption for any constant where bit 11 of the lower 12 bits is set.
:::

---

## What the Compiler Can and Cannot Do

The compiler's decisions directly impact the CPU performance equation:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$$

### What the compiler strongly influences
* **Instruction Count:** By choosing between inline synthesis (multiple instructions) and literal pools (one instruction + one memory load), the compiler balances instruction count against memory access overhead.
* **Instruction Cache Footprint:** The compiler can choose to reuse registers containing common constants rather than materializing them repeatedly. This reduces code size and improves instruction cache hit rates (see [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy)).
* **Instruction Selection:** The compiler can replace expensive constant multiplications with sequences of shifts and adds (strength reduction) that fit within immediate fields.

### What the compiler cannot control
* **Immediate Field Widths:** These are hardwired into the ISA. The compiler cannot force a 12-bit immediate field to accept a 13-bit value.
* **Hardware Sign-Extension Logic:** The compiler cannot disable sign extension for specific instructions; it must work around the hardware's behavior.
* **Decoder Width:** The compiler cannot change how many instructions the hardware can decode per cycle (see [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution)).

---

## Common Misconceptions

### Misconception 1: Variable-width instructions are always faster because they use fewer instructions to load constants
While variable-width encodings (like x86-64) can load a 64-bit immediate in a single instruction, this does not guarantee higher performance. 
* Variable-width instructions make it difficult for the hardware fetch unit to find instruction boundaries quickly. 
* This increases decode latency and power consumption.
* In contrast, fixed-width instructions are trivial to decode in parallel, allowing modern out-of-order engines to easily process multiple instructions per cycle (see [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu)).

### Misconception 2: The compiler should always use literal pools for 64-bit constants
Loading a constant from a literal pool requires a memory read. If the target cache line is not in the L1 data cache, this load will stall the pipeline (see [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa)). 
* Synthesizing a constant using 3 or 4 arithmetic instructions is often faster than a cache miss.
* Inline synthesis also avoids polluting the data cache with constant values.

### Misconception 3: Sign extension only matters for negative numbers
Sign extension is a hardware mechanism triggered purely by the most significant bit of the immediate field (e.g., bit 11 in a 12-bit field). The hardware does not know if the programmer intended the value to be signed or unsigned; it simply replicates that bit across the upper position. The compiler must always compensate for this behavior, regardless of the high-level language variable type.

---

## What To Read Next
* [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — How synthesized instructions are renamed and scheduled.
* [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution) — How hardware decodes multiple instructions in parallel.
* [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy) — The cost of literal pool cache misses.

<div>
  <AdBanner />
</div>

## References
* Patterson, D. A., & Hennessy, J. L. *Computer Organization and Design: The Hardware/Software Interface*.
* Waterman, A., & Asanović, K. *The RISC-V Reader: An Open Architecture Atlas*.
