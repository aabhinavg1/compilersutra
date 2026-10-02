---
title: "RISC vs CISC: What the Compiler Actually Feels"
description: "How a compiler backend feels the difference between a load-store ISA and a register-memory ISA, once the chip has cracked complex instructions into simpler internal ops."
keywords:
  - RISC vs CISC
  - RISC vs CISC for compiler engineers
  - load-store architecture
  - register-memory instructions
  - instruction selection
  - instruction folding
  - micro-operations
  - uops
  - variable-length decode
  - fixed-length instructions
  - decode and the compiler
  - instruction count vs work per instruction
  - LLVM instruction selection
  - why LLVM IR looks RISC-shaped
  - register pressure
  - code size and the instruction cache
  - macro-fusion and scheduling
  - compare and branch adjacency
  - x86-64 memory operand
  - AArch64 load-store
  - RISC-V load-store
  - compiler backend lowering
  - CPI and instruction count
  - CPU performance equation
  - what the compiler cannot change
  - ISA vs microarchitecture
  - internal simple ops
  - instruction cache footprint
displayed_sidebar: coasidebar
slug: /coa/risc-vs-cisc
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

# RISC vs CISC: What the Compiler Actually Feels

You care about RISC versus CISC when the same C statement becomes two instructions on one machine and four on another, and you need to know which difference is real. A RISC instruction usually does one simple thing and names only registers. A CISC instruction can name a memory operand in the same instruction as the arithmetic. The compiler still emits the ISA, not the internal ops the chip cracks that instruction into.

:::tip Read these first
- [What is an Instruction Set Architecture?](/docs/coa/what-is-an-isa) — the contract the compiler is allowed to rely on.
- [Computer Organization vs Computer Architecture](/docs/coa/intro_to_coa) — organization is how a chip implements that contract.
:::

:::important What you should leave with
- The backend selects ISA instructions. A later crack into internal ops is microarchitecture, and the allocator does not see it.
- A load-store target spends instructions, and registers, on loads and stores that a register-memory target can fold into one instruction.
- Folding lowers instruction count and code size. It does not let the compiler set the cycle time, or the size of any decoded-op cache.
- Schedule a fusion pair only when that target documents the pair. Adjacency the chip does not recognize does nothing.
:::

:::caution Who this is not for
If the fetch, decode, and execute steps are still blurry, read [fetch–decode–execute](/docs/coa/cpu_execution) first. This page starts from that cycle and asks what the backend can change.
:::

:::note
Two chips can implement one ISA and crack the same instruction differently. Correctness is the contract. The internal schedule is not.
:::

<div>
  <AdBanner />
</div>

## Table of Contents

1. [Why you should care](#why-you-should-care)
2. [TL;DR](#tldr)
3. [The mechanism](#the-mechanism)
4. [The same IR, two lowerings](#the-same-ir-two-lowerings)
5. [A worked example](#a-worked-example)
6. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
7. [Common misconceptions](#common-misconceptions)
8. [Where this leaves you](#where-this-leaves-you)
9. [What To Read Next](#what-to-read-next)
10. [References](#references)

## Why you should care

Start from a line you have already written.

```c
*dst += *src;
```

A compiler has to turn that into instructions the CPU will accept. On a load-store machine (AArch64, RISC-V) the add itself cannot touch memory, so the compiler emits a load of `*src`, a load of `*dst`, an add of those registers, and a store. On a register-memory machine (x86-64) the add is allowed to name memory, so the compiler can emit a load of `*src` and then one add that updates `*dst` in place. Both programs mean the same thing. The assembly does not look the same, and a backend that copies one form onto the other machine will not assemble.

That is the whole reason this page exists. The names RISC and CISC are old slogans. Reduced means "each instruction does little, and memory traffic is its own instruction." Complex means "one instruction may both compute and touch memory, and instructions are not all the same length." You do not need the slogans to do the work. You need the rule: **which operands is this instruction allowed to name?**

If you are new to this, three consequences follow, and they are enough to read the rest of the page.

1. **Fewer instructions is not automatically faster.** The short x86 form still has to load and store. It only looks smaller in the listing. The chip may split that one instruction into the same load, add, and store the other machine wrote out loud.
2. **The compiler can run out of registers.** On a load-store machine every value from memory sits in a register until you store it. If the function already uses those registers, the compiler spills: it stores a value to the stack and loads it back. That spill is extra memory traffic you did not write in C.
3. **An instruction is either legal or it is not.** `add` with a memory destination is an x86 instruction. It is not an AArch64 instruction. Wanting it to be one does not make a missed optimization. The assembler rejects it.

If you already work on a backend, the slogan that usually gets in the way is "modern CISC is just RISC on the inside." The execution core of a current x86 chip does run simple internal ops. That fact does not change what you are allowed to emit, and it does not remove three jobs that only show up because the ISA is register-memory:

- **Instruction selection has something to search for.** LLVM IR is already load-store shaped: a `load`, an `add`, a `store`. On AArch64 that is almost the machine code. On x86-64 a good selector notices that the load of `*dst`, the add, and the store to `*dst` are one instruction, and only when nothing else still needs the loaded value. A second use of that load means you cannot fold it away.
- **The add destroys a register.** An x86 `add` overwrites one of its inputs. The IR add does not: it writes a new value and leaves both inputs live. The register allocator inserts copies the C program did not ask for, so that the destroyed register is a scratch. Those copies are real instructions. They are why "we folded it, so the code got shorter" is something you measure, not something you assume.
- **You still schedule the ISA, not the internal ops.** You can place two instructions next to each other so a documented fusion rule can merge them. You cannot assign the temporary registers inside the crack. Those are part of one chip's implementation, and the next stepping can crack the same ISA instruction differently.

So a first reading should leave with the operand rule and the three consequences. A backend reading should leave knowing when a fold is illegal, why a destructive add inserts copies, and why "RISC inside" is not a license to ignore the ISA you actually emit.

## TL;DR

- Keep the pointer registers live. A memory operand is not a reason to overwrite the address you still need.
- Fold a load and an arithmetic op into one instruction only on a target whose ISA allows that operand. On a load-store ISA, emit the load.
- Treat instruction count and code size as the levers you hold. Treat the crack into internal ops as a cost the chip decides.
- Put two instructions next to each other for fusion only when the target's optimization notes name that pair.

## The mechanism

Two words are doing the work, and they are easy to mix up.

The **ISA** is the contract: the instructions that exist, and which operands each one may name. The compiler emits that contract. The **microarchitecture** is how this particular chip fetches, decodes, and executes it. A register-memory chip can decode one ISA instruction into simpler internal operations. The core schedules those. The compiler allocates **architectural registers**, the names in the ISA (`w2`, `eax`). It does not allocate the physical registers inside the chip. That split is [how an instruction flows](/docs/coa/how-an-instruction-actually-flows-through-a-modern-cpu): rename is behind the contract.

**Load-store** (the usual RISC shape) means the add reads and writes registers only. Memory traffic is a `load` or a `store`. Instructions are often a fixed length, so the decoder finds the next one at a fixed stride and can look at several at once.

**Register-memory** (the usual CISC shape) means an add may name a memory operand. Instructions are not all the same length, so the front end has to discover where the next instruction starts before it can feed several decoders. That length work is real. Do not invent a decode width for "the" CISC chip. Different implementations of the same ISA do this differently, which is the note at the top of the page.

| Situation | Load-store ISA | Register-memory ISA | Compiler lever |
| --- | --- | --- | --- |
| Add a value in memory to a register | A load, then an add | One instruction may name the memory operand | Instruction selection |
| Add a register into a memory destination | Load, add, store | One instruction may be the whole update | Fold or leave split |
| Where the next instruction starts | Fixed stride | Depends on this instruction's length | Code size and alignment, not the decoder hardware |
| Register pressure | Loads occupy architectural registers | A memory operand can avoid a temporary | Register allocation |
| Two ops the chip might fuse | Only if that ISA documents a pair | Only if that ISA documents a pair | Scheduling, and only for a documented pair |

![CISC bytes pass through a length decode before they become simple internal ops. Fixed-length RISC words can be decoded side by side.](/img/coa/risc-vs-cisc.svg)

*Diagram: the compiler emits the boxes on the left of each row. The length-decode step exists only on the variable-length path, and the compiler does not schedule it.*

:::tip Note
A shorter instruction stream can help the instruction cache, which is the point of [the memory hierarchy](/docs/coa/memory-hierarchy). Smaller code is not a promise of a lower cycle count. The core still has to perform the loads and the adds.
:::

## The same IR, two lowerings

LLVM IR is three-address and names memory with `load` and `store`. A load-store target often lowers one IR op to one instruction. An x86 target spends selection looking for folds.

<Tabs>
<TabItem value="load-store" label="Load-store (AArch64 or RISC-V)">

The selector cannot hide the memory operand inside the add. `%dst` and `%src` stay pointers. The loads use fresh registers.

```llvm
define void @add_val(ptr %dst, ptr %src) {
  %a = load i32, ptr %src
  %b = load i32, ptr %dst
  %s = add i32 %b, %a
  store i32 %s, ptr %dst
  ret void
}
```

```armasm
ldr w2, [x1]        // *src, pointer x1 stays live
ldr w3, [x0]        // *dst, pointer x0 stays live
add w3, w3, w2
str w3, [x0]
```

Pressure comes from the loads. There is no memory-destination add to select.

</TabItem>
<TabItem value="reg-mem" label="Register-memory (x86-64)">

The same IR can fold the load of `*dst`, the add, and the store into one instruction. `%src` is still a separate load. Under the System V ABI, `rdi` holds `dst` and `rsi` holds `src`. Neither pointer is overwritten.

```x86asm
mov eax, dword ptr [rsi]    ; *src -> eax, rsi stays the pointer
add dword ptr [rdi], eax    ; *dst += eax, rdi stays the pointer
```

The selector folds. The allocator keeps `rdi` and `rsi` live. The chip may then crack the memory-destination add into a load, an add, and a store. That crack is not an instruction the compiler emitted, and it is not the same on every implementation.

</TabItem>
</Tabs>

:::warning
Folding is legal only when the ISA allows the memory operand and the addressing mode. Emitting the x86 form on AArch64 is not a missed optimization. It is not an instruction.
:::

## A worked example

Same update as the opening. Walk both listings. The pointers stay live in both.

```c
void add_val(int *dst, int *src) {
    *dst += *src;
}
```

On x86-64, System V puts `dst` in `rdi` and `src` in `rsi`.

```x86asm
mov eax, dword ptr [rsi]    ; load *src. rsi is still the pointer.
add dword ptr [rdi], eax    ; *dst += eax. rdi is still the pointer.
```

Line by line: the `mov` reads memory through `rsi` and writes `eax`. It does not change `rsi`. The `add` reads `*dst` through `rdi`, adds `eax`, and writes `*dst`. It does not change `rdi`. A later instruction in this function can still use either pointer. The failure mode is `mov rdi, [rdi]`: after that, `rdi` holds the loaded integer and the address is gone, so the `add` would update the wrong place.

The chip may crack `add dword ptr [rdi], eax` into a load, an add, and a store. That crack is not a third instruction you emitted. It also is not the same on every x86 implementation. What you know from the ISA is the architectural result: `*dst` changes, `eax` is unchanged, `rdi` is unchanged.

On AArch64, `dst` arrives in `x0` and `src` in `x1`. The add cannot name memory, so none of these four is optional.

```armasm
ldr w2, [x1]     ; *src -> w2. x1 stays the pointer.
ldr w3, [x0]     ; *dst -> w3. x0 stays the pointer.
add w3, w3, w2   ; registers only
str w3, [x0]     ; store back through the pointer you still have
```

The two loads can stall. They do not carry a cycle count you can copy onto another chip. x86 used fewer architected instructions. The memory-destination add still loads and stores. The gain is a shorter encoding, which is instruction-cache pressure, not free execution.

Now the case where folding is the bug. The loaded `*dst` has a second user.

```c
void add_and_keep(int *dst, int *src, int *saved) {
    *saved = *dst;
    *dst += *src;
}
```

`*dst` must be saved and then updated. A fold of the load into `add dword ptr [rdi], eax` performs the update and throws away the old value, so `*saved` is wrong. The legal x86 shape keeps the load in a register:

```x86asm
mov eax, dword ptr [rsi]    ; *src
mov ecx, dword ptr [rdi]    ; *dst, kept because saved needs it
mov dword ptr [rdx], ecx    ; *saved = *dst
add dword ptr [rdi], eax    ; *dst += *src. rdi still holds dst.
```

`rdx` is `saved`. `rdi` is still `dst` at the add. The pattern "fold every load that feeds an add" ships this bug. The match has to prove the loaded value has no other use. On AArch64 you were going to emit the load anyway. The extra store is `str w3, [x2]` after `ldr w3, [x0]`, and the add still uses `w3`. The second user is obvious because the load was not hidden inside another instruction. That is the beginner and the backend looking at one fact: a value with two users cannot be folded away.

:::caution
Do not "save" a register by reusing the pointer register for the loaded value unless this is the last use of the address. The next load or store in the same statement still needs it.
:::

## What the compiler can and cannot do

<BlockMath>{String.raw`\text{CPU Time} = \text{Instruction Count} \times \text{CPI} \times \text{Cycle Time}`}</BlockMath>

This is the same split as [Means and Amdahl's law](/docs/coa/means-and-amdahl). Put the opening question on it.

Instruction count is the lever you actually hold. Folding `*dst += *src` removes architected instructions on x86 and cannot remove them on AArch64. CPI moves only indirectly: a spill you did not need adds loads and stores, a hot loop that no longer fits the instruction cache misses, and a documented fusion pair can combine two ISA instructions if you left them adjacent. Cycle time does not move. No pass sets the clock.

What you can do, as a reader new to backends and as the person writing the pass:

- Select a memory operand where the ISA has one, and emit the load where it does not. The operand rule from the first section is the whole of instruction selection for this example.
- Keep every pointer live until its last use. The allocator's copies exist because x86 `add` destroys an input and the IR add does not. Count those copies before you call the fold a win.
- Refuse the fold when the loaded value has another user, as in `add_and_keep`.
- Keep a documented fusion pair adjacent, often a compare and a branch, and only when that target's notes name the pair. [Superscalar issue](/docs/coa/superscalar-execution) is how many independent ops can be in flight. It is not a fusion you invent.

What you cannot do:

- Change cycle time, or the capacity of a decoded-op cache if the chip has one.
- Publish one internal-op count that sends every implementation into a slow decoder. Read that target's notes.
- Schedule a variable-length front end into a fixed-length one. You can shorten the bytes it parses. You cannot change the fact that it must find lengths.

## Common misconceptions

### "CISC instructions are always slower because they are complex."

Not as a rule. A register-memory add can crack into a load, an add, and a store, which is the work the load-store sequence names explicitly. Latency still depends on the hit and on how this chip cracks the instruction. One ISA instruction is not one unit of work inside the core.

### "A RISC backend is a simpler compiler."

Selection is often simpler, because there are fewer legal folds. Allocation is often harder, because every memory value occupies an architectural register until you store it. Simpler selection does not mean a simpler compiler.

### "Code size stopped mattering once DRAM got large."

The instruction cache is still small next to DRAM. A denser encoding can hold a hot loop. A longer load-store expansion can miss. Density is a reason to fold, not a reason to ignore the loads.

### "The compiler schedules uops."

It schedules ISA instructions. Rename and the crack into uops sit under the contract. A pass that assigns physical registers is modeling one chip, not compiling for the ISA.

## Where this leaves you

Take `*dst += *src` to the machine you compile for. If the add cannot name memory, you will see two loads, an add, and a store, and the registers those loads occupy are the pressure. If the add can name memory, check two things before you trust the short form: the pointers are still in their registers, and any value you also needed later is still in a register of its own. Then stop. The internal crack, the clock, and the size of a decoded-op cache are not yours to set.

## What To Read Next

- [What is an Instruction Set Architecture?](/docs/coa/what-is-an-isa) — the contract this page kept calling "which operands are legal."
- [How an instruction actually flows](/docs/coa/how-an-instruction-actually-flows-through-a-modern-cpu) — rename and retire, which the allocator does not see.
- [Memory hierarchy](/docs/coa/memory-hierarchy) — why a shorter instruction stream can matter even when the internal work looks similar.

<AdBanner />

## References

- Hennessy and Patterson, *Computer Architecture: A Quantitative Approach*. Instruction set principles, for the load-store versus register-memory split. Not quoted here.
- Intel 64 and IA-32 Architectures Optimization Reference Manual. The chapters on instruction decoding and on which pairs fuse, read as a target note, not as a universal rule.
- The AArch64 and RISC-V instruction references, for the load-store forms used above.
