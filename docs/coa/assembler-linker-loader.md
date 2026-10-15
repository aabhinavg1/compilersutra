---
title: "Assembler, linker, and loader"
description: "How an object file becomes a running process: sections, symbols, relocation, and the loader."
keywords:
  - assembler
  - linker
  - loader
  - object file
  - relocation
  - symbol table
  - static linking
  - dynamic linking
  - position independent code
displayed_sidebar: coasidebar
slug: /coa/assembler-linker-loader
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Assembler, Linker, and Loader

The assembler turns ISA‑level source into machine‑code sections; the linker stitches those sections together, resolves symbols, and applies relocation; the loader maps the final image into memory and starts execution.  
A compiler engineer must understand how the object file format, relocation entries, and symbol tables cooperate so that the generated code can be linked and loaded correctly.

:::tip Read these first
- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa)
- [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa)
:::

:::important What you should leave with
- The three distinct phases: assembly, linking, loading, and what each phase changes.
- The structure of an object file: sections, symbol tables, relocation tables.
- The difference between static and dynamic linking and the role of the dynamic linker.
:::

:::caution Who this is not for
If you have not yet read the basic COA terminology lesson, start there first.
:::

:::note
This lesson focuses on the mechanics of relocation and symbol resolution, not on the performance impact of linking choices.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The three‑stage pipeline](#the-three-stage-pipeline)
3. [Object file layout](#object-file-layout)
4. [Relocation mechanics](#relocation-mechanics)
5. [Linker strategies](#linker-strategies)
6. [Loader responsibilities](#loader-responsibilities)
7. [Worked example](#worked-example)
8. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
9. [Common misconceptions](#common-misconceptions)
10. [What to read next](#what-to-read-next)
11. [References](#references)

## TL;DR
- **Assembler** emits sections, symbol tables, and relocation entries; it does not know final addresses.  
- **Linker** resolves symbols, applies relocations, and produces a relocatable or executable image.  
- **Loader** maps the image into virtual memory, performs final relocations, and transfers control to the entry point.  
- Static linking resolves everything at link time; dynamic linking defers some resolutions to runtime via the dynamic linker.  
- The compiler can influence relocation by choosing the right relocation model (e.g., `-fPIC` vs. `-fPIE`) but cannot control the loader’s memory layout.

## The three‑stage pipeline

| Stage | What the compiler sees | What the toolchain does | What the hardware sees |
|-------|------------------------|-------------------------|------------------------|
| **Assembly** | ISA‑level source | Assembler emits machine code, section headers, symbol tables, relocation tables | None yet |
| **Linking** | Object files, libraries | Linker resolves symbols, applies relocations, produces a final image | None yet |
| **Loading** | Final image | Loader maps segments, performs final relocations, starts the program | CPU begins fetching from the entry point |

:::tip Note
The assembler and linker are separate tools, but many compilers bundle them. The compiler’s job ends with emitting object files; the rest is handled by the toolchain.
:::

## Object file layout

Object files are defined by a format (ELF, COFF, Mach‑O). They share a common set of concepts:

- **Sections** (`.text`, `.data`, `.bss`, `.rodata`, etc.) hold raw bytes or symbolic placeholders.
- **Segment headers** describe how sections map to memory (size, permissions).
- **Symbol table**: each entry has a name, value (offset within a section), size, type, and binding (local, global, weak).
- **Relocation table**: each entry records a relocation type, offset within a section, and the symbol it refers to.

The assembler creates these tables; the linker consumes them.

:::warning
A symbol’s value in an object file is *relative* to its section, not an absolute virtual address. The linker must add the section’s base address to compute the final value.
:::

### Relocation entry format (simplified)

| Field | Meaning |
|-------|---------|
| `offset` | Where in the section the relocation applies |
| `type` | How to adjust the value (e.g., absolute 32‑bit, PC‑relative 32‑bit) |
| `symbol` | The symbol that will be resolved |
| `addend` | Optional constant added before relocation |

The assembler may emit a relocation entry for every instruction that references a symbol whose address is not known at assembly time.

## Relocation mechanics

When the linker processes a relocation entry, it performs:

1. **Symbol resolution**: find the final address of the referenced symbol (could be in another object or library).
2. **Base addition**: add the section’s base address to the symbol’s value.
3. **Addend application**: add the relocation’s addend.
4. **Adjustment**: apply the relocation type (e.g., sign‑extend, shift, mask).

The result is written back into the section at the specified offset.

### Example: PC‑relative call in RISC‑V

```
call foo
```

Assembler emits:

- A relocation entry of type `R_RISCV_CALL` at the instruction’s immediate field.
- The instruction contains a placeholder (often zero).

During linking, the linker replaces the placeholder with the signed offset from the instruction to `foo`’s final address.

:::caution
If the relocation type is wrong (e.g., using an absolute relocation for a PC‑relative instruction), the program will crash or misbehave.
:::

## Linker strategies

| Strategy | When used | What the linker does | Compiler hint |
|----------|-----------|----------------------|---------------|
| **Static linking** | No dynamic libraries | Resolve all symbols, produce a single executable | `-static` |
| **Dynamic linking (shared libraries)** | Runtime resolution | Leave unresolved symbols for the dynamic linker | `-shared`, `-fPIC` |
| **Position‑Independent Executable (PIE)** | Security (ASLR) | Generate relocatable code that can be loaded at any address | `-fPIE` |

### Static vs. dynamic

Static linking embeds all code into the final binary, eliminating runtime symbol resolution but increasing binary size. Dynamic linking defers some resolution to the dynamic linker, which performs relocations at load time.

:::tip Note
The compiler can choose `-fPIC` to generate code that uses relative addressing, making it suitable for shared libraries. This changes the relocation types emitted by the assembler.
:::

## Loader responsibilities

The loader performs the final mapping:

1. **Segment mapping**: allocate virtual memory pages with the permissions specified in the segment headers.
2. **Final relocations**: for dynamic executables, the dynamic linker applies relocations that depend on the actual load address (e.g., `R_X86_64_RELATIVE`).
3. **Thread‑local storage**: allocate TLS blocks if needed.
4. **Entry point**: transfer control to the program’s entry point.

The loader must honor the ABI’s expectations about stack layout, register state, and the format of the dynamic section.

:::note
The loader does not perform instruction decoding or scheduling; it only prepares memory and starts execution.
:::

## Worked example

```c
/* foo.c */
int bar(int x) { return x + 1; }
int main() { return bar(42); }
```

Compile with `gcc -c foo.c -o foo.o`. The assembler emits:

- `.text` section with two functions.
- Symbol table entries:
  - `bar` (global, value 0x0, size 0x8)
  - `main` (global, value 0x8, size 0x8)
- Relocation entry for the `call bar` instruction in `main`:
  - offset 0x9 (immediate field)
  - type `R_X86_64_PC32`
  - symbol `bar`
  - addend 0

Link with `gcc foo.o -o foo`. The linker:

1. Places `.text` at virtual address 0x401000.
2. Resolves `bar` to 0x401000 + 0x0 = 0x401000.
3. The `call` starts at 0x401014. On x86-64 the PC used by `R_X86_64_PC32` is the next instruction, 0x401019.
4. Displacement = 0x401000 − 0x401019 = −0x19. That signed value is what the linker writes into the immediate.

The loader maps the executable at 0x401000, performs no further relocations for this static binary, and jumps to `main`.

:::warning
If the linker had used a wrong relocation type (e.g., absolute instead of PC‑relative), the call would jump to the wrong address, causing a crash.
:::

## What the compiler can and cannot do

| Lever | Effect on relocation | Example |
|-------|----------------------|---------|
| **Instruction selection** | Chooses instructions that emit specific relocation types | `lea` vs. `jmp` |
| **Code layout** | Determines section ordering and alignment | `-ffunction-sections` |
| **PIC/PIE flags** | Controls whether relocations are relative or absolute | `-fPIC` |
| **Linker script** | Influences final addresses of sections | `ld -T script.ld` |
| **ABI compliance** | Ensures correct symbol visibility and calling convention | `extern` vs. `static` |

The compiler cannot:

- Force the loader to place a segment at a particular virtual address (except via linker scripts).
- Change the hardware’s relocation handling (e.g., how the CPU fetches a PC‑relative address).
- Reduce the number of relocations beyond what the ISA and ABI allow.

:::caution
Assuming the loader will always map the executable at the same address leads to fragile code. Use position‑independent code or guard against absolute addresses.
:::

## Common misconceptions

1. **“Relocation is only for dynamic linking.”**  
   Relocation is needed for any symbol whose address is not known at assembly time, including static linking where the linker must adjust addresses for each section.

2. **“The compiler can choose any relocation type.”**  
   The relocation type is dictated by the instruction encoding and the ISA. The compiler can only influence it by selecting the instruction or by emitting a different assembly form.

3. **“Linker scripts are unnecessary.”**  
   For simple programs they may be omitted, but for complex binaries (e.g., embedded systems, OS kernels) linker scripts control memory layout and are essential.

4. **“Dynamic linker performs all relocations.”**  
   The dynamic linker only handles relocations that depend on the load address. Static relocations are resolved by the static linker.

## What to read next

- [/docs/coa/calling-conventions-and-abi](/docs/coa/calling-conventions-and-abi)
- [/docs/coa/superscalar_execution](/docs/coa/superscalar_execution)
- [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy)

<div>
  <AdBanner />
</div>

![Diagram](/img/coa/assembler-linker-loader.svg)

## References
- Hennessy and Patterson, *Computer Architecture: A Quantitative Approach*, the section on translating and starting a program.
- The ELF gABI relocation and symbol-table chapters.
- GCC's `-fPIC` / `-fPIE` documentation.

<AdBanner />
