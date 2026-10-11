---title: "Calling Conventions and the Application Binary Interface (ABI)"
description: "How function contracts govern register ownership, stack argument passing, return values, and red zones across compiler backends."
keywords:
  - calling conventions
  - application binary interface
  - ABI
  - caller-saved registers
  - callee-saved registers
  - volatile registers
  - non-volatile registers
  - register allocation
  - stack frame layout
  - frame pointer
  - stack pointer
  - red zone
  - shadow space
  - argument passing
  - return value location
  - System V AMD64 ABI
  - AAPCS
  - x86-64 calling convention
  - ARM64 ABI
  - function prologue
  - function epilogue
  - calling convention attribute
  - stack alignment
  - parameter passing
  - variadic functions
  - tail call optimization
  - frame pointer elimination
  - ABI compliance
  - backend code generation
  - target lowering
displayed_sidebar: coasidebar
slug: /coa/calling-conventions-and-abi
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Calling Conventions and the ABI

Hardware processors do not understand abstract language concepts like function calls, parameters, or return values; they only execute branch instructions and manipulate memory or registers. An Application Binary Interface (ABI) bridges this gap by establishing a strict contract on how software boundaries pass data, manage registers, and align the stack across separate compilation units.

:::tip Read these first
- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Computer Architecture vs Computer Organization: ISA is the contract; organization is the implementation.
- [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) — Architectural registers and register allocation mechanics.
:::

:::important What you should leave with
- The exact divide between caller-saved (scratch) and callee-saved (preserved) registers and how register allocators navigate this boundary.
- How stack frames, alignment rules, integer/floating-point argument registers, and return registers are defined by the target platform ABI.
- The mechanism and safety constraints of optimization features like the red zone and frame pointer elimination.
- Why cross-module boundaries require rigid adherence to the target ABI, whereas internal static functions permit custom calling conventions.
:::

:::caution Who this is not for
If you are looking for general assembly instruction syntax or basic register usage, consult [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) first.
:::

:::note
An ABI covers binary layouts, alignment, and C++ name mangling alongside calling conventions. This lesson focuses on the calling convention subset: register ownership, parameter passing, return values, and stack frame structure.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The mechanism](#the-mechanism)
3. [Comparing platform ABIs](#comparing-platform-abis)
4. [A worked example](#a-worked-example)
5. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
6. [Common misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## TL;DR

- **Caller-saved registers are scratch state:** Callers must spill active caller-saved registers to their stack frame before a `call` instruction if those values are live across the call site.
- **Callee-saved registers are preserved state:** A function must restore all modified callee-saved registers before returning, preserving their state for the caller.
- **Stack alignment is mandatory:** Most 64-bit ABIs mandate 16-byte stack pointer alignment at call sites to support vector instructions (such as SSE/AVX or NEON); breaking alignment leads to hardware traps or fault conditions.
- **Red zones enable leaf-function optimization:** System V AMD64 permits a 128-byte region below the stack pointer for leaf functions to store temporary data without adjusting `%rsp`, avoiding prologue and epilogue stack pointer math.

---

## The mechanism

When software branches to a target address via a call instruction, the hardware updates the instruction pointer and optionally pushes a return address. The ISA provides architectural registers, but it does not specify which registers hold function arguments, which registers survive function boundaries, or how parameter lists longer than the available register file are passed. The ABI enforces these decisions.

| Situation | Hardware behavior | What the compiler controls |
| :--- | :--- | :--- |
| **Function Entry** | Executes `call` or `BL`, updates PC/LR, modifies stack pointer on CISC architectures. | Emits a prologue to allocate stack space, preserve modified callee-saved registers, and set up a frame pointer if required. |
| **Passing Arguments** | Reads values from designated registers or stack memory offsets. | Places arguments into standard architectural registers (or spills extra arguments to stack memory) before the call instruction. |
| **Preserving Registers** | Offers no hardware-enforced protection over general-purpose registers across jump targets. | Allocates live variables across calls into callee-saved registers, or generates spill/reload code around call sites for caller-saved registers. |
| **Function Exit** | Executes `ret` or `RET`, restoring PC from stack or link register. | Emits an epilogue to restore callee-saved registers, clean up the stack frame (if callee-cleaned), and return the result in designated return registers. |

The calling convention partitions the architectural register file into caller-saved (scratch/volatile) registers and callee-saved (preserved/non-volatile) registers.

![Stack frame layout and call boundary](/img/coa/calling-conventions-and-abi.svg)

*Diagram: Stack frame architecture showing parameter passing, saved registers, local stack allocations, and the red zone below the current stack pointer.*

:::tip Note
Architectural registers are the named registers specified by the ISA and used by the calling convention. The underlying microarchitecture renames these architectural registers to a larger pool of physical registers at runtime. The ABI contract operates strictly at the architectural register level.
:::

---

## Comparing platform ABIs

Different architecture and operating system pairings specify unique register mappings, alignment constraints, and frame attributes.

<Tabs>
  <TabItem value="sysv" label="System V AMD64 (Linux / macOS x86-64)">

### Key Attributes
- **Integer/Pointer Arguments:** Passed in `%rdi`, `%rsi`, `%rdx`, `%rcx`, `%r8`, `%r9` (first 6).
- **Floating-Point Arguments:** Passed in `%xmm0` through `%xmm7` (first 8).
- **Return Registers:** `%rax` (low/integer), `%rdx` (high/second integer), `%xmm0` / `%xmm1` (floating-point).
- **Caller-Saved Registers:** `%rax`, `%rcx`, `%rdx`, `%rsi`, `%rdi`, `%r8`, `%r9`, `%r10`, `%r11`, plus SIMD registers `%xmm0`–`%xmm15`.
- **Callee-Saved Registers:** `%rbx`, `%rsp`, `%rbp`, `%r12`, `%r13`, `%r14`, `%r15`.
- **Stack Alignment:** `%rsp` + 8 must be a multiple of 16 at function entry (meaning `%rsp` is 16-byte aligned *before* the 8-byte return address is pushed by `call`).
- **Red Zone:** 128 bytes below `%rsp`. Safe from asynchronous signal and interrupt handlers for leaf functions.

  </TabItem>

  <TabItem value="win64" label="Microsoft x64 (Windows x86-64)">

### Key Attributes
- **Integer/Pointer Arguments:** Passed in `%rcx`, `%rdx`, `%r8`, `%r9` (first 4).
- **Floating-Point Arguments:** Passed in `%xmm0` through `%xmm3` (first 4, overlapping positional slots with integer registers).
- **Return Registers:** `%rax` for integers/pointers; `%xmm0` for floating-point.
- **Caller-Saved Registers:** `%rax`, `%rcx`, `%rdx`, `%r8`, `%r9`, `%r10`, `%r11`, `%xmm0`–`%xmm5`, upper parts of YMM/ZMM registers.
- **Callee-Saved Registers:** `%rbx`, `%rbp`, `%rdi`, `%rsi`, `%r12`, `%r13`, `%r14`, `%r15`, `%xmm6`–`%xmm15`.
- **Shadow Space (Home Space):** Mandatory 32-byte allocation on the stack by the caller immediately before `call`, reserved for the callee to dump its four register parameters if needed.
- **Red Zone:** None. Asynchronous handlers can overwrite memory below `%rsp` at any time.

  </TabItem>

  <TabItem value="aapcs64" label="AAPCS64 (ARM64 / AArch64)">

### Key Attributes
- **Integer/Pointer Arguments:** Passed in `x0` through `x7` (first 8).
- **Floating-Point/SIMD Arguments:** Passed in `v0` through `v7` (first 8).
- **Return Registers:** `x0`–`x1` for integers; `v0`–v1` for floating-point/vector results.
- **Caller-Saved Registers:** `x0`–`x17`, `x18` (platform reserved), `v0`–`v7`, `v16`–`v31`.
- **Callee-Saved Registers:** `x19`–`x28`, `x29` (Frame Pointer), `x30` (Link Register), `v8`–`v15` (only lower 64 bits are preserved).
- **Stack Alignment:** Stack pointer (`sp`) must always remain 16-byte aligned when accessed for memory operations.
- **Red Zone:** Optional 16-byte area (or platform dependent, e.g., Apple ARM64 specifies a 128-byte red zone).

  </TabItem>
</Tabs>

:::caution
Mixing calling conventions in the same executable—such as calling a Windows DLL function from System V target code without an explicit target attribute like `__attribute__((ms_abi))`—causes silent register corruption and stack misalignment.
:::

---

## A worked example

Consider a non-leaf function `compute` that takes 7 integer arguments, performs operations using both temporary and preserved variables, and calls a helper function `external_func`.

```c
// C source signature
long external_func(long a, long b);

long compute(long a1, long a2, long a3, long a4, long a5, long a6, long a7) {
    long local_preserved = a1 + a2 + a3; // keep across call site
    long scratch_temp = a4 * a5;        // safe to evaluate immediately
    long call_result = external_func(scratch_temp, a6);
    return local_preserved + call_result + a7;
}
```

Below is the lowered assembly targeting System V AMD64, demonstrating prologue setup, argument extraction, caller/callee register preservation, stack passing for the 7th argument, and epilogue teardown:

```assembly
    .global compute
    .type compute, @function
compute:
    # --- Function Prologue ---
    # Current stack state upon entry: return address is at (%rsp).
    # %rsp is offset by 8 bytes (misaligned by 16-byte standard).
    pushq   %rbp                    # Save caller's frame pointer (aligns %rsp to 16 bytes)
    movq    %rsp, %rbp              # Establish new frame pointer base
    pushq   %r12                    # Preserve callee-saved register %r12
    pushq   %r13                    # Preserve callee-saved register %r13 (misaligns %rsp)
    subq    $8, %rsp                # Allocate 8 bytes padding to re-align %rsp to 16 bytes

    # --- Argument Unpacking & Computation ---
    # Register Mapping on Entry:
    # %rdi = a1, %rsi = a2, %rdx = a3, %rcx = a4, %r8 = a5, %r9 = a6
    # 7th parameter (a7) was pushed by caller to memory at 16(%rbp)
    
    # Calculate local_preserved and hold it in callee-saved %r12 across the upcoming call
    addq    %rsi, %rdi              # %rdi = a1 + a2
    addq    %rdx, %rdi              # %rdi = a1 + a2 + a3
    movq    %rdi, %r12              # %r12 = local_preserved (survives external_func call)

    # Calculate 7th arg (a7) and keep in callee-saved %r13 across the call
    movq    16(%rbp), %r13          # Load a7 from caller stack frame into %r13

    # Calculate scratch_temp into %rdi for arg1 of external_func
    imulq   %r8, %rcx               # %rcx = a4 * a5
    
    # --- Prepare Arguments for External Call ---
    movq    %rcx, %rdi              # Arg1 = scratch_temp
    movq    %r9, %rsi               # Arg2 = a6
    
    # --- Issue Inter-Module Call ---
    # Stack is 16-byte aligned here. call instruction pushes 8-byte return address.
    call    external_func@PLT       # Result returned in %rax

    # --- Post-Call Assembly & Epilogue ---
    # %rax contains call_result
    addq    %r12, %rax              # %rax = call_result + local_preserved
    addq    %r13, %rax              # %rax = call_result + local_preserved + a7

    # --- Function Epilogue ---
    addq    $8, %rsp                # Restore stack allocation padding
    popq    %r13                    # Restore saved %r13
    popq    %r12                    # Restore saved %r12
    popq    %rbp                    # Restore caller's frame pointer
    ret                             # Return to caller with result in %rax
```

### Walkthrough of the Contract
1. **Prologue Alignment:** Upon entry, the hardware `call` instruction pushed an 8-byte return address. Pushing `%rbp` restores 16-byte alignment. Pushing `%r12` and `%r13` changes alignment by 16 bytes total, requiring an explicit `subq $8, %rsp` adjustment to ensure the subsequent `call external_func@PLT` occurs on a strict 16-byte boundary.
2. **Preservation Allocation:** Variable `local_preserved` must live across the nested function call. The register allocator assigns it to `%r12` (a callee-saved register). The compiler pays a push/pop pair in the prologue/epilogue, but avoids spilling `%r12` around the `call` instruction.
3. **Stack Parameter Access:** The primary six parameters fit into `%rdi`, `%rsi`, `%rdx`, `%rcx`, `%r8`, and `%r9`. Parameter `a7` exceeds the register allocation quota and is passed on the stack by the caller at memory address `16(%rbp)` (above the return address and saved frame pointer).
4. **Epilogue Clean-up:** The callee restores `%r13`, `%r12`, and `%rbp` in reverse push order, restoring the stack pointer back to the exact return address location before executing `ret`.

---

## What the compiler can and cannot do

Understanding ABI constraints helps clarify where a compiler backend possesses optimization freedom and where its hands are tied by binary specifications.

```
+-----------------------------------------------------------------------+
|                       CPU Performance Equation                        |
|                                                                       |
|  CPU Time = Instruction Count  x  CPI  x  Clock Cycle Time            |
|                (Compiler)       (Both)        (Hardware)              |
+-----------------------------------------------------------------------+
```

The compiler strongly influences instruction count and indirectly influences cycles per instruction (CPI). Calling conventions impact both terms.

### What the Compiler Can Do

1. **Custom Internal Conventions:** For static or link-time-optimized (LTO) functions not exported across library boundaries, the compiler can bypass the target ABI entirely. It can pass parameters in non-standard registers or vector registers, keep parameters live across custom register banks, or skip stack frame creation.
2. **Frame Pointer Elimination (`-fomit-frame-pointer`):** When debug requirements or unwind table rules permit, the compiler can omit saving and setting `%rbp` / frame pointer registers. This frees up an extra callee-saved register for general allocation and reduces prologue/epilogue instruction counts.
3. **Red Zone Allocation:** On targets supporting a red zone (such as System V AMD64), leaf functions requiring local stack space can offset local variables directly from `%rsp` (e.g., `-8(%rsp)`) without executing `subq $N, %rsp`. This eliminates stack allocation and deallocation instructions entirely.
4. **Caller-Saved vs. Callee-Saved Choice:** The register allocator computes live ranges across call sites. If a variable's lifetime spans multiple calls, the compiler assigns it to a callee-saved register. If a variable's lifetime ends before a call, the compiler prefers a caller-saved register to avoid prologue push/pop instructions.
5. **Tail Call Optimization (TCO):** If a function call occurs as the final statement before returning, the compiler transforms the `call` followed by `ret` into a stack-frame-teardown followed by a direct `jmp`. The callee reuses the caller's stack frame, reducing instruction count and stack depth.

:::warning
Tail call optimization requires that the caller and callee have compatible calling conventions and argument stack sizes. If the callee requires more stack-passed parameter space than the caller's frame provided, or if cleanup semantics mismatch, the compiler cannot safely perform tail call transformation.
:::

### What the Compiler Cannot Do

1. **Alter Public ABI Boundaries:** For exported symbols or function pointers accessible outside the current compilation unit, the compiler cannot alter parameter register assignments, stack alignment rules, or register preservation rules.
2. **Bypass Vector Stack Alignment Restrictions:** If an ABI dictates 16-byte (or 32/64-byte for AVX/AVX-512) stack alignment, the compiler cannot emit unaligned vector spill instructions (`movaps`) unless it emits alignment adjustment code in the prologue. Violating this alignment causes hardware general protection faults.
3. **Control Microarchitectural Register Renaming:** The compiler allocates architectural registers according to the calling convention. It has no direct control over how the CPU microarchitecture renames those registers to physical registers or how the hardware scheduler executes instructions.

---

## Common misconceptions

### Misconception 1: "Callee-saved registers are inherently faster than caller-saved registers."

**Correction:** Callee-saved and caller-saved registers execute at identical hardware speeds; both refer to standard architectural registers backed by the same physical register file. The difference lies entirely in *who* incurs the cost of preserving them. Using a callee-saved register requires pushing and popping it in the function prologue and epilogue, even if internal execution branches skip the code path using that register. Conversely, caller-saved registers require spilling only across active call sites.

### Misconception 2: "The compiler must always allocate a stack frame with a frame pointer."

**Correction:** Modern compilers default to frame pointer elimination (`-fomit-frame-pointer`) for optimized builds on architectures with robust unwind table standards (DWARF). The compiler tracks stack offsets relative to the stack pointer (`%rsp` / `sp`) dynamically at compile time, eliminating frame pointer setup code and freeing the frame pointer register for general register allocation.

### Misconception 3: "A leaf function can use the red zone to call other helper functions."

**Correction:** A function using the red zone **cannot** call any other function without adjusting its stack pointer first. A standard `call` instruction pushes a return address onto the stack, which immediately overwrites the top 8 bytes of the red zone. Furthermore, the called function is free to write to its own red zone, corrupting the caller's unallocated stack data.

---

## What To Read Next

- [/docs/coa](/docs/coa) — Compiler Architecture Track Overview.
- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Computer Architecture vs Computer Organization.
- [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) — Register files and addressing modes.
- [/docs/coa/instruction-formats-and-encoding](/docs/coa/instruction-formats-and-encoding) — Machine instruction encoding and layout rules.

<div>
  <AdBanner />
</div>

## References

- System V Application Binary Interface: AMD64 Architecture Processor Supplement (Draft Version 1.0).
- Procedure Call Standard for the Arm 64-bit Architecture (AArch64) — AAPCS64.
- Microsoft x64 Software Conventions and Calling Convention documentation.
- Aho, A. V., Lam, M. S., Sethi, R., & Ullman, J. D. *Compilers: Principles, Techniques, and Tools* (2nd Edition). Addison-Wesley (Register allocation and procedure call mechanisms).
