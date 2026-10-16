---
title: "Registers and addressing modes"
description: "Learn how compilers choose between register and memory operands and how addressing modes affect instruction count and register pressure."
keywords:
  - register allocation
  - addressing modes
  - base plus offset
  - immediate addressing
  - displacement addressing
  - register indirect
  - scaled index
  - effective address calculation
  - load store architecture
  - register operands
  - memory operands
  - instruction selection
  - instruction encoding
  - register pressure
  - spill code
  - address generation unit
  - AGU
  - architectural registers
  - physical registers
  - register renaming
  - CISC addressing modes
  - RISC addressing modes
  - memory-register instructions
  - instruction count
  - CPI
  - compiler backend
  - LLVM DAGToDAG
  - machine instruction
displayed_sidebar: coasidebar
slug: /coa/registers-and-addressing-modes
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Registers and addressing modes

CPU architectures expose a small, fast set of architectural registers alongside a set of rules for calculating memory addresses. A compiler backend must constantly decide whether to keep a value in a register or access it in memory, and which addressing mode minimizes both instruction count and address-calculation overhead.

This choice directly impacts how the hardware schedules instructions, how many memory cycles are consumed, and how much pressure is placed on the register renaming hardware.

:::tip Read these first
* [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Learn the boundary between the ISA contract and microarchitectural implementation.
* [/docs/coa/risc-vs-cisc](/docs/coa/risc-vs-cisc) — Understand how load-store architectures differ from register-memory architectures.
:::

:::important What you should leave with
* How the Address Generation Unit (AGU) calculates effective addresses in parallel with the main execution pipeline.
* The trade-offs between folding address calculations into complex addressing modes versus exposing them as explicit register arithmetic.
* How register pressure forces the compiler to emit spill code, and how addressing modes can mitigate or worsen this pressure.
* The difference between architectural registers allocated by the compiler and physical registers managed by the hardware renamer.
:::

:::caution Who this is not for
If you are not yet familiar with the basic fetch-decode-execute cycle, read [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa) first.
:::

:::note
This lesson focuses on general-purpose integer registers and standard memory addressing modes. Vector registers and specialized hardware addressing (such as circular buffers in DSPs) follow different allocation and scheduling constraints.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The Mechanism of Address Generation](#the-mechanism-of-address-generation)
3. [Comparing Addressing Modes](#comparing-addressing-modes)
4. [A Worked Example: Array Access Patterns](#a-worked-example-array-access-patterns)
5. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
6. [Common Misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## TL;DR
* **Fold address math early:** On CISC architectures, use complex addressing modes (like scaled index) to perform addition and shifting inside the AGU without consuming execution ALU cycles.
* **Expose invariants on RISC:** On RISC architectures, decompose complex address calculations so the loop-invariant portions can be hoisted out of loops by the optimizer.
* **Manage register pressure:** When the compiler runs out of architectural registers, it must emit spill code (stores and loads). Choosing compact base-plus-offset addressing modes minimizes the instruction footprint of these spills.
* **Respect immediate limits:** Immediates avoid memory accesses but have strict bit-width limits. Exceeding these limits forces the compiler to emit multi-instruction sequences to construct constants in registers.

---

## The Mechanism of Address Generation

To read or write memory, the processor must calculate an **Effective Address (EA)**. This calculation is performed by specialized hardware known as the **Address Generation Unit (AGU)**. The AGU operates in parallel with the main Arithmetic Logic Unit (ALU), allowing the CPU to calculate the next memory address while executing arithmetic on the current data.

The compiler's choice of addressing mode determines which inputs are sent to the AGU:

| Situation | What the Hardware Does | What the Compiler Can Change |
| :--- | :--- | :--- |
| **Immediate Operand** | Embeds the constant value directly within the instruction stream. No memory access or AGU calculation is required. | The size and value of the constant, matching the instruction format's bit-width limits. |
| **Register Direct** | Reads or writes data directly from/to an architectural register. | The selection of the register to minimize register-to-register moves. |
| **Base + Offset (Displacement)** | Adds a constant displacement to the value stored in a base register. | The choice of base register and the offset value (often used for stack frames and struct fields). |
| **Indexed (Base + Index * Scale)** | Adds a base register to a scaled index register (multiplied by 1, 2, 4, or 8) plus an optional displacement. | The mapping of array indices and element sizes directly to the hardware scaling factors. |

The diagram below shows how the AGU processes these inputs to produce the final address sent to the memory management unit (MMU) or L1 cache.

![AGU pipeline flow showing inputs combining to form the effective address](/img/coa/registers-and-addressing-modes.svg)

*Diagram: The Address Generation Unit (AGU) combines base registers, index registers (shifted by a scale factor), and immediate displacements to compute the Effective Address (EA) independently of the main ALU.*

:::tip Note
Because the AGU is physically separate from the ALU on modern out-of-order execution engines, calculations performed inside an addressing mode (such as `[rax + rbx * 4]`) do not compete for ALU execution ports. This makes complex addressing modes highly efficient when the hardware supports them.
:::

---

## Comparing Addressing Modes

The compiler must choose the addressing mode that balances instruction size, execution latency, and register usage.

<Tabs>
<TabItem value="immediate" label="Immediate Addressing" default>

### Immediate Addressing
The operand is a constant value embedded directly inside the instruction encoding.

* **Pros:** Zero latency for address calculation; does not consume a register; avoids a cache lookup.
* **Cons:** The constant value is limited by the instruction's field width (e.g., 12 bits on ARM, 8/16/32 bits on x86). Large constants must be loaded into a register first using multiple instructions.
* **Compiler Decision:** Use for small loop increments, small offsets, and common constants (like 0, 1, or -1).

</TabItem>
<TabItem value="register" label="Register Direct">

### Register Direct
The operand resides entirely in an architectural register.

* **Pros:** Fastest access time; no memory latency; high bandwidth via the register file.
* **Cons:** Limited by the number of architectural registers defined by the ISA (e.g., 16 on x86-64, 32 on AArch64). High register usage leads to register pressure and spill code.
* **Compiler Decision:** Keep heavily reused variables (like loop counters and local accumulators) in registers throughout their entire lifetime.

</TabItem>
<TabItem value="base_offset" label="Base + Offset">

### Base + Offset (Displacement)
The effective address is the sum of a register's contents and an immediate constant.

* **Pros:** Perfect for accessing local variables on the stack frame or fields within a struct.
* **Cons:** Requires one register to hold the base pointer. The offset size is limited by the instruction encoding.
* **Compiler Decision:** Group related variables into structs or contiguous stack locations to maximize the reuse of a single base pointer (e.g., the stack pointer `rsp` or frame pointer `rbp`).

</TabItem>
</Tabs>

---

## A Worked Example: Array Access Patterns

Consider a simple C loop that scales elements of an integer array:

```c
void scale_array(int *array, int factor, int length) {
    for (int i = 0; i < length; i++) {
        array[i] *= factor;
    }
}
```

Let us look at how a compiler translates the memory access `array[i]` on two different architectures: x86-64 (CISC) and AArch64 (RISC).

### Case 1: x86-64 (Complex Addressing Mode)

On x86-64, the compiler can fold the array index calculation, the element size scaling, and the memory load into a single instruction using **Base + Index * Scale** addressing.

```assembly
.Lloop:
    # rdi = array base pointer
    # rsi = factor
    # rdx = loop counter (i)
    # rcx = length
    
    mov     eax, DWORD PTR [rdi + rdx*4]   # Load array[i] (Scale = 4 bytes)
    imul    eax, esi                       # eax = array[i] * factor
    mov     DWORD PTR [rdi + rdx*4], eax   # Store back to array[i]
    inc     rdx                            # i++
    cmp     rdx, rcx                       # Compare i with length
    jl      .Lloop                         # Loop if i < length
```

* **Analysis:** The instruction `mov eax, DWORD PTR [rdi + rdx*4]` uses a single instruction to calculate the address ($rdi + rdx \times 4$), issue the load, and write to the destination register. The AGU handles the multiplication by 4 and the addition in hardware.

### Case 2: AArch64 (Load-Store Architecture)

AArch64 does not support arbitrary scale factors or memory-to-memory arithmetic. It must load the value into a register, perform the arithmetic, and store it back. However, it does support shifted register addressing modes.

```assembly
.Lloop:
    # x0 = array base pointer
    # w1 = factor
    # x2 = loop counter (i)
    # x3 = length
    
    ldr     w4, [x0, x2, lsl #2]           # Load w4 = *(x0 + (x2 << 2))
    mul     w4, w4, w1                     # w4 = w4 * w1
    str     w4, [x0, x2, lsl #2]           # Store *(x0 + (x2 << 2)) = w4
    add     x2, x2, #1                     # i++
    cmp     x2, x3                         # Compare i with length
    b.lt    .Lloop                         # Loop if i < length
```

* **Analysis:** AArch64 uses `lsl #2` (logical shift left by 2, which multiplies by 4) embedded inside the load (`ldr`) and store (`str`) instructions. While it cannot perform the multiplication in-place in memory like x86, its AGU still calculates the offset on the fly during the load/store operations, saving explicit shift instructions.

:::warning
If the array element size were 12 bytes (e.g., a struct of three integers), neither architecture's AGU could scale the index directly, because 12 is not a power of two. The compiler would be forced to emit an explicit multiplication or shift-and-add sequence in the loop body to calculate the offset before issuing the load.
:::

---

## What the Compiler Can and Cannot Do

To understand how addressing modes affect performance, we look at the CPU performance equation:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$$

### What the Compiler Influences
* **Instruction Count:** By selecting complex addressing modes, the compiler can fold multiple address-calculation instructions (shifts, additions) into a single load or store instruction.
* **CPI (Cycles Per Instruction):** If the compiler generates too many memory accesses due to poor register allocation (spilling), the average CPI will rise because of cache latency and memory port contention.
* **Register Allocation:** The compiler's register allocator maps an infinite number of temporary variables in the intermediate representation (IR) to a finite set of architectural registers. If it manages this resource well, it minimizes the need for memory-based addressing modes.

### What the Compiler Cannot Control
* **Physical Register File Size:** Modern out-of-order CPUs use **Register Renaming** to map architectural registers to a much larger pool of physical registers (to eliminate Write-After-Read and Write-After-Write hazards). The compiler only sees the architectural limit.
* **AGU Latency and Throughput:** The compiler cannot change how many cycles the AGU takes to compute a complex address, nor can it change the number of memory ports available on the chip.

---

## Common Misconceptions

### 1. "Complex addressing modes are always slower because they perform more math."
**False.** The AGU is dedicated hardware designed to perform additions and shifts in parallel with the execution pipeline. Folding a shift and an addition into a load instruction (e.g., `mov eax, [rdi + rsi*4]`) is almost always faster and more compact than emitting separate `shl` and `add` instructions before a simple load.

### 2. "Using as many registers as possible always improves performance."
**Not always.** While keeping values in registers avoids memory latency, utilizing every architectural register can increase the overhead of function calls. The ABI (Application Binary Interface) dictates which registers must be saved and restored by the caller or callee. Overusing registers forces the compiler to emit prologue and epilogue save/restore instructions, which can slow down small, frequently called functions.

### 3. "The compiler should always fold address calculations into loads and stores."
**False.** If the same calculated address is used multiple times (for example, reading multiple fields from the same array element), folding the calculation into every single load results in redundant AGU work. In such cases, it is better to calculate the address once into a temporary register and reuse it via simple register-indirect addressing.

---

## What To Read Next
* [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu) — Learn how registers are renamed and scheduled in out-of-order engines.
* [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy) — Discover what happens when an addressing mode points to data that is not in the L1 cache.

<div>
  <AdBanner />
</div>

---

## References
* Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*.
* Cooper, K. D., & Torczon, L. *Engineering a Compiler*.
