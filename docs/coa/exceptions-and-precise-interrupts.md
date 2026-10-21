---
title: "Exceptions and Precise Interrupts"
description: "How a compiler ensures that only completed instructions retire when an exception or interrupt occurs"
keywords:
  - exceptions
  - precise exceptions
  - interrupts
  - precise interrupts
  - retirement
  - program order
  - out-of-order execution
  - speculative execution
  - architectural state
  - microarchitectural state
  - exception handling
  - interrupt handling
displayed_sidebar: coasidebar
slug: /coa/exceptions-and-precise-interrupts
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Exceptions and Precise Interrupts

In modern CPUs, a *precise* exception means that all instructions that were issued before the faulting instruction have retired, while any instruction issued after the faulting instruction has not yet retired. A compiler must emit code that respects this contract so that the program state after an exception is exactly the same as if the faulting instruction had never executed.

:::tip Read these first
- [/docs/coa/instruction_flow_modern_cpu](https://example.com/docs/coa/instruction_flow_modern_cpu)
- [/docs/coa/types_of_execution](https://example.com/docs/coa/types_of_execution)
:::

:::important What you should leave with
- Understand the definition of a precise exception and why retirement order matters.
- Know the hardware mechanisms that enforce precision (retirement, exception windows, and exception handling state).
- Recognize the compiler responsibilities: exception-safe code generation, stack frame layout, and handler entry/exit sequences.
:::

:::caution Who this is not for
If you have not read [/docs/coa/instruction_flow_modern_cpu] yet, start there first.
:::

:::note
The discussion focuses on the architectural contract; it does not cover microarchitectural optimizations such as microcode or speculative execution details beyond what is required for precision.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tl-dr)
2. [The Mechanism](#the-mechanism)
3. [Diagram: Precise Exception Flow](#diagram-precise-exception-flow)
4. [A Worked Example](#a-worked-example)
5. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
6. [Common Misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
<div>
  <AdBanner />
</div>

## TL;DR
- A precise exception guarantees that only instructions *before* the faulting one have retired.
- The hardware enforces this by flushing the pipeline after the faulting instruction and rolling back architectural state to the last retired instruction.
- The compiler must generate exception handlers that preserve the architectural state and use the correct stack frame layout.
- Interrupts are handled similarly; the hardware guarantees that the interrupted context is restored exactly as if the interrupt had not occurred.
- The compiler cannot control microarchitectural details like speculative execution, but it can influence instruction count and the ordering of exception-related instructions.

## The Mechanism

| Situation | What the hardware does | What the compiler can change |
|-----------|------------------------|------------------------------|
| Faulting instruction issued | The pipeline is flushed after the faulting instruction; architectural state is rolled back to the last retired instruction | Emit a faulting instruction that is known to trap (e.g., `div` by zero) or a software trap (`int 3`) |
| Exception window | The window of instructions that may be in flight but not yet retired is bounded by the exception window size | Arrange code so that the exception window is small; avoid long unrolled loops that keep many instructions in flight |
| Exception handler entry | The hardware saves the current PC, processor flags, and other architectural registers on a dedicated stack or registers | Generate a handler prologue that saves non-volatile registers and establishes a stack frame per ABI |
| Exception return | The hardware restores architectural state from the handler stack and resumes execution at the instruction after the faulting one | Emit the correct return instruction (`iret`, `iretq`, `ret`, or architecture‑specific) and ensure the stack pointer is correct |

### Key points

- **Retirement order**: Only retired instructions affect architectural state. Precise exceptions rely on this order.
- **Exception window size**: The hardware defines how many instructions can be in flight. The compiler can influence this by controlling instruction scheduling and avoiding long pipelines.
- **Handler stack**: The ABI specifies how the stack frame is laid out. The compiler must follow it to preserve registers and return correctly.
- **Exception return**: The return instruction must restore the exact architectural state, including the program counter and flags.

## Diagram: Precise Exception Flow

![Precise Exception Flow](https://example.com/img/coa/exceptions-and-precise-interrupts.svg)

*Diagram: The faulting instruction is issued, the pipeline is flushed, architectural state is rolled back, the handler is entered, and upon return execution continues after the faulting instruction.*



## A Worked Example

```c
// C code that triggers a divide‑by‑zero exception
int foo(int a, int b) {
    int c = a / b;   // faulting instruction if b == 0
    return c + 1;
}
```

1. **Instruction Issue**: `div eax, ebx` is issued. If `b` is zero, the hardware detects a fault.
2. **Pipeline Flush**: All instructions after `div` are discarded; no further instructions are retired.
3. **State Rollback**: The architectural registers are restored to the state after the last retired instruction (here, before `div`).
4. **Handler Entry**: The hardware pushes the faulting PC and flags onto the exception stack and jumps to the handler.
5. **Handler Execution**: The handler may log the fault, adjust the stack, or provide a recovery value.
6. **Exception Return**: The handler executes `iret` (or architecture‑specific return), restoring the PC to the instruction after `div` and the architectural state to what it was before the fault.
7. **Resume**: Execution continues with `return c + 1;` where `c` has been set by the handler or the exception mechanism.

The compiler must generate the handler prologue and epilogue according to the ABI, ensuring that all non‑volatile registers are saved and restored. It also must emit the correct return instruction (`iret`, `ret`, etc.) so that the architectural state is exactly as if the faulting instruction had never executed.

## What the Compiler Can and Cannot Do

| Lever | What the compiler can do | What the compiler cannot do |
|-------|--------------------------|-----------------------------|
| Instruction selection | Choose an instruction that will trap (e.g., `div` vs `idiv`) | Cannot change the hardware's fault detection timing |
| Scheduling | Place the faulting instruction at a point where the exception window is minimal | Cannot control the hardware's pipeline depth or flush latency |
| Register allocation | Allocate registers so that the handler can restore them efficiently | Cannot control the size of the physical register file or rename logic |
| ABI compliance | Emit correct stack frame layout and handler entry/exit sequences | Cannot alter the hardware's exception return mechanism |
| Exception handling code | Generate minimal code to recover or unwind | Cannot guarantee that the handler will not itself fault |

The CPU performance equation (CPU time = instruction count × CPI × cycle time) shows that the compiler can influence instruction count and, indirectly, CPI by reducing the number of instructions that need to be flushed or re‑executed after an exception. It has no control over cycle time or the microarchitectural details that determine how many instructions are in flight.

## Common Misconceptions

1. **“Precise exceptions mean the CPU never re‑executes any instruction.”**  
   *Reality*: Only instructions that have retired are guaranteed to remain correct; instructions in flight may be re‑executed after the exception is handled.

2. **“The compiler can choose the exception return instruction.”**  
   *Reality*: The return instruction is dictated by the ABI and the hardware; the compiler must emit the correct one but cannot change its semantics.

3. **“Interrupts are handled the same as exceptions.”**  
   *Reality*: While both use a similar mechanism, interrupts may be masked, have priority, and can be pending; the compiler must respect the interrupt controller’s requirements.

4. **“If the handler restores registers, the program state is always correct.”**  
   *Reality*: The handler must also restore the program counter and flags; missing any of these can lead to subtle bugs.

## What To Read Next

- [/docs/coa/exception_handling_in_llvm](https://example.com/docs/coa/exception_handling_in_llvm) – how LLVM emits exception handling code
- [/docs/coa/interrupt_handling_in_riscv](https://example.com/docs/coa/interrupt_handling_in_riscv) – interrupt handling specifics for RISC‑V
- [/docs/coa/exception_handling_in_c](https://example.com/docs/coa/exception_handling_in_c) – C language exception safety

<div>
  <AdBanner />
</div>

![Diagram](/img/coa/exceptions-and-precise-interrupts.svg)

## References
- L. Hennessy and D. Patterson, *Computer Architecture: A Quantitative Approach*, 6th ed.
- M. L. Scott, *Programming Language Pragmatics*, 4th ed.
- RISC‑V Foundation, *RISC‑V Instruction Set Manual*, 2023.
- LLVM Project, *Exception Handling in LLVM*, 2024.
