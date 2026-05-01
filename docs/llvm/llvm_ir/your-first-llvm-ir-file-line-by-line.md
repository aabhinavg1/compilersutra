---
title: "Your First LLVM IR File, Line by Line"
description: "Read one real LLVM IR file from Clang and understand exactly why each line exists, from target datalayout to ret."
keywords:
  - llvm ir line by line
  - how to read llvm ir
  - llvm ir explained
  - clang emit llvm
  - llvm alloca load store
  - nsw meaning
  - target datalayout
  - target triple
  - llvm o0 vs o2
  - llvm file explained
  - first llvm ir file
  - understanding llvm ir
  - llvm ir tutorial for beginners
  - llvm ir basics
  - what is llvm ir
  - llvm ir syntax
  - llvm ir ssa
  - llvm ir virtual registers
  - llvm ir phi node
  - llvm ir getelementptr
  - llvm ir basic blocks
  - llvm ir function definition
  - llvm ir attributes
  - llvm ir metadata
  - llvm ir opaque pointers
  - llvm ir poison values
  - llvm ir nsw nuw exact
  - llvm ir inbounds
  - llvm ir unreachable
  - llvm ir select vs branch
  - llvm ir mem2reg
  - llvm ir alloca optimization
  - clang o0 vs o2 ir
  - read llvm ll file
  - llvm ir for compiler engineers
  - llvm ir dso_local
  - llvm ir noundef
  - llvm ir ret instruction
  - llvm ir add instruction
  - llvm backend ir
  - llvm
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

📩 Interested in deep dives like pipelines, cache, and compiler optimizations?

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: '#fff',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>



# Your First LLVM IR File, Line by Line

Most developers open a `.ll` file, see `define`, `alloca`, and `nsw`, and assume the file is for compiler engineers only.

That is the wrong reaction.

LLVM itself is an umbrella name, not just one compiler. In practice, it usually means the IR, the optimizer, and the backend working together as one toolchain.

This post reads one real IR file line by line, using the exact command and the exact output from this machine.

If you came from [How Clang Converts C/C++ Source Into LLVM IR](/docs/llvm/llvm_ir/clang-to-llvm-ir), this is the concrete follow-through: one real file, one real command, one real output.

If you can read this file, you can do three useful things:

- debug compiler output without guessing
- compare source-shaped IR with optimized IR
- understand why a backend made a choice

> LLVM IR is not assembly.
> LLVM IR is the contract between source meaning and machine code.

The same `add` function becomes a useful teaching file because it shows the full lowering path without hiding behind compiler complexity.

<AdBanner />

## Table of Contents

1. [Exact Command](#exact-command)
2. [Source Code](#source-code)
3. [Full LLVM IR](#full-llvm-ir)
4. [The One-Line Mental Model](#the-one-line-mental-model)
5. [The Most Important Idea: SSA](#the-most-important-idea-ssa)
6. [Why This Matters](#why-this-matters)
7. [Read the File Line by Line](#read-the-file-line-by-line)
8. [`-O0` vs `-O2`](#o0-vs-o2)
9. [What to Read Next](#what-to-read-next)
10. [References](#references)
11. [Appendix: More IR Patterns](#appendix-more-ir-patterns)
12. [Opaque Pointers](#opaque-pointers)

## Exact Command

This is the exact command used to produce the IR in this post:

```bash
clang -S -emit-llvm -O0 /tmp/first-llvm-ir.c -o /tmp/first-llvm-ir.ll
```

I ran it with this Clang build:

```bash
clang --version
```

Output:

```text
Ubuntu clang version 18.1.3 (1ubuntu1)
Target: x86_64-pc-linux-gnu
Thread model: posix
InstalledDir: /usr/bin
```

## Source Code

The source is intentionally boring:

```c
int add(int a, int b) {
  return a + b;
}
```

## Full LLVM IR

Here is the full `.ll` file Clang produced:

```llvm
; ModuleID = '/tmp/first-llvm-ir.c'
source_filename = "/tmp/first-llvm-ir.c"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"
target triple = "x86_64-pc-linux-gnu"

; Function Attrs: noinline nounwind optnone uwtable
define dso_local i32 @add(i32 noundef %0, i32 noundef %1) #0 {
  %3 = alloca i32, align 4
  %4 = alloca i32, align 4
  store i32 %0, ptr %3, align 4
  store i32 %1, ptr %4, align 4
  %5 = load i32, ptr %3, align 4
  %6 = load i32, ptr %4, align 4
  %7 = add nsw i32 %5, %6
  ret i32 %7
}

attributes #0 = { noinline nounwind optnone uwtable "frame-pointer"="all" "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }

!llvm.module.flags = !{!0, !1, !2, !3, !4}
!llvm.ident = !{!5}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 8, !"PIC Level", i32 2}
!2 = !{i32 7, !"PIE Level", i32 2}
!3 = !{i32 7, !"uwtable", i32 2}
!4 = !{i32 7, !"frame-pointer", i32 2}
!5 = !{!"Ubuntu clang version 18.1.3 (1ubuntu1)"}
```

## The One-Line Mental Model

Before you read the lines, keep this model in mind:

```text
arguments -> memory -> compute -> return
```

That is the whole story at `-O0`.

Clang keeps the lowering source-shaped on purpose, so you can trace the program without first learning the optimizer's entire vocabulary.

Under the hood, the `%` values are still virtual registers, not CPU registers. LLVM can create and rewrite those freely before it decides how they map onto real hardware.

You can also think about the file as a pipeline:

```text
C arguments
  -> stack slots
  -> loads
  -> arithmetic
  -> return value
```

That is why the `-O0` version feels verbose. It is showing the compiler's intermediate bookkeeping, not just the final intent.

## The Most Important Idea: SSA

LLVM IR is built on Static Single Assignment, or SSA.

The rule is simple:

- each value is assigned once
- values do not get overwritten
- new results get new names

That is why the file uses `%3`, `%4`, `%5`, `%6`, and `%7` instead of mutating one variable over and over.

These are not variables in the C sense.

They are values flowing through the program.

Once you see that, the file stops looking like stack-based bookkeeping and starts looking like a value graph.

In this example:

- `%3` and `%4` are stack slots, not the values themselves
- `%5` and `%6` are the loaded values
- `%7` is the final computed result

The key point is that `%5` does not change into something else later.

If the compiler needs a different value, it creates a new SSA name.

That is the core discipline LLVM uses to make optimization simpler.

Here is the simplest SSA shape to remember:

<img
  src="/img/ssa.png"
  alt="Non-SSA versus SSA form showing value renaming and phi nodes"
  style={{
    width: '100%',
    maxWidth: '900px',
    height: 'auto',
    display: 'block',
    margin: '20px auto',
    padding: '0 10px',
    boxSizing: 'border-box'
  }}
/>

That figure does the important part visually:

It shows the entire SSA idea in one glance:

- values enter the function
- Clang puts them in memory at `-O0`
- LLVM loads them back as values
- the arithmetic happens on SSA values
- the result is returned

The formal rule for merging SSA values across control flow is the `phi` instruction. LLVM documents that directly in the [phi instruction section of the LangRef](https://llvm.org/docs/LangRef.html#phi-instruction).

If you want the gentler explanation, the appendix below shows how `phi` works in a loop.

If you want more SSA material from this site, read:

- [Static Single Assignment](/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment)
- [Understanding Basic Blocks(LLVM)](/docs/compilers/basic_block_in_compiler)

Those pages go deeper into the compiler-side reasoning behind SSA, CFGs, and why values move through blocks instead of mutating in place.

## Why This Matters

<Tabs>
  <TabItem value="debug" label="Debug compiler output">
    If a compiler bug shows up, IR is where you start separating frontend lowering from optimizer behavior. Assembly is the end of the story; IR shows you the decisions that led there.
  </TabItem>
  <TabItem value="perf" label="Understand performance">
    `-O0` and `-O2` are not just "slower" and "faster". They show you whether the compiler is still preserving source shape or has already stripped away the scaffolding.
  </TabItem>
  <TabItem value="llvm" label="Work on compilers">
    LLVM IR is the contract between source-level meaning and target-specific code generation. If you work on LLVM, Clang, Rust, or another frontend, this is the layer you keep returning to.
  </TabItem>
  <TabItem value="gpu" label="GPU and backend work">
    GPU compilers and backend pipelines still start from IR-like representations. If the IR is shaped badly, the backend may spill more values to slower memory, miss vectorization opportunities, and fail to match simpler instruction-selection patterns.
  </TabItem>
</Tabs>

Two lines worth remembering:

> LLVM IR is not assembly.
> It is a typed, optimization-friendly contract.

> `-O0` keeps the source shape.
> `-O2` removes the shape that the optimizer no longer needs.

## Read the File Line by Line

The table below does not skip the boring lines, because the boring lines are where the compiler tells you what machine and ABI assumptions it is making.

The article's goal is not to memorize every flag. It is to train your eye to separate:

- source-shape lowering
- target assumptions
- optimization hints
- module metadata

### Visual first

The whole function fits this shape:

```text
arguments
  -> alloca
  -> store
  -> load
  -> add
  -> ret
```

If you remember one thing from the file, remember that sequence.

### Line-by-line table

| IR line | Plain English | Why it exists |
|---|---|---|
| `; ModuleID = '/tmp/first-llvm-ir.c'` | This is the module label for the IR file. | LLVM uses it to identify the compilation unit. |
| `source_filename = "/tmp/first-llvm-ir.c"` | This records the original source file path. | Debug info and diagnostics use it to point back to the source. |
| `target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"` | This describes how data is laid out in memory on the target. The first useful piece is `e`, which means little-endian. `i64:64` means 64-bit integers are aligned to 64 bits. | LLVM needs this before it can decide sizes, alignments, and pointer behavior correctly. |
| `target triple = "x86_64-pc-linux-gnu"` | This says the target is 64-bit x86 on Linux with GNU tooling. | Code generation uses it to pick the right ABI and backend behavior. |
| blank line | Separates module metadata from the function body. | It makes the file easier to scan. |
| `; Function Attrs: noinline nounwind optnone uwtable` | This is the attribute summary for the function. | It tells you the compiler is keeping the function unoptimized and debug-friendly at `-O0`. |
| `define dso_local i32 @add(i32 noundef %0, i32 noundef %1) #0 {` | This starts the function definition. It returns `i32`, takes two `i32` arguments, and `#0` links to the attribute bundle below. | LLVM needs the full signature and attributes before it can lower or optimize the function. |
| `%3 = alloca i32, align 4` | Allocate stack space for the first local slot. | At `-O0`, Clang uses stack memory so the IR stays close to the original C source. |
| `%4 = alloca i32, align 4` | Allocate stack space for the second local slot. | Same reason: debug-friendly lowering, not minimal lowering. |
| `store i32 %0, ptr %3, align 4` | Copy the first argument into stack memory. | This gives the variable a memory location that later loads can read from. |
| `store i32 %1, ptr %4, align 4` | Copy the second argument into stack memory. | Same idea for the second parameter. |
| `%5 = load i32, ptr %3, align 4` | Read the first value back from stack memory. | LLVM now has a value it can use in the actual computation. |
| `%6 = load i32, ptr %4, align 4` | Read the second value back from stack memory. | Same for the second operand. |
| `%7 = add nsw i32 %5, %6` | Add the two values. `nsw` means `no signed wrap`. | LLVM can assume signed overflow does not happen here, which matches the source language contract and gives optimizers more freedom. |
| `ret i32 %7` | Return the computed sum. | This is the function exit point. |
| `}` | End of the function body. | Marks the end of the function definition. |
| blank line | Separates the function body from the attribute bundle. | Keeps the file readable. |
| `attributes #0 = { noinline nounwind optnone uwtable "frame-pointer"="all" "min-legal-vector-width"="0" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cmov,+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" }` | This is the full attribute set for the function. | It records optimization, debug, and target-specific assumptions in one place. |
| blank line | Separates function attributes from module metadata. | This is just structure in the file. |
| `!llvm.module.flags = !{!0, !1, !2, !3, !4}` | This points to module-level metadata entries. | LLVM uses module flags to carry ABI and codegen settings. |
| `!llvm.ident = !{!5}` | This records the compiler identity. | It makes the output traceable back to the tool that produced it. |
| blank line | Separates metadata references from the metadata payloads. | It keeps the file readable. |
| `!0 = !{i32 1, !"wchar_size", i32 4}` | The platform uses 4-byte `wchar_t`. | ABI-relevant information must be stable across the module. |
| `!1 = !{i32 8, !"PIC Level", i32 2}` | The file was built with PIC level 2. | LLVM and the backend use this when generating position-independent code. |
| `!2 = !{i32 7, !"PIE Level", i32 2}` | The file was built with PIE level 2. | This affects executable relocation behavior. |
| `!3 = !{i32 7, !"uwtable", i32 2}` | Unwind tables are enabled. | Debugging and exception-related code generation need this information. |
| `!4 = !{i32 7, !"frame-pointer", i32 2}` | Frame-pointer handling is recorded here. | Backend code generation may use it for stack traces and debugging. |
| `!5 = !{!"Ubuntu clang version 18.1.3 (1ubuntu1)"}` | This is the compiler identity string. | It tells you exactly which Clang version produced the file. |

### The stack-slot pattern

The `alloca -> store -> load` chain is not random noise. It is Clang choosing a memory-shaped lowering so the file stays easy to debug.

Think of it like this:

```text
input arguments
  -> reserve stack slots
  -> write values into those slots
  -> read values back
  -> compute the result
  -> return it
```

At `-O0`, this is intentional. Clang is not trying to be clever yet. It is trying to preserve the source shape.

That matters because the same function at `-O2` is not a different program. It is the same meaning after the compiler has removed the scaffolding it no longer needs.

## `-O0` vs `-O2`

At `-O2`, the same source collapses into a much smaller shape:

```bash
clang -S -emit-llvm -O2 /tmp/first-llvm-ir.c -o /tmp/first-llvm-ir-O2.ll
```

```llvm
define dso_local i32 @add(i32 noundef %0, i32 noundef %1) local_unnamed_addr #0 {
  %3 = add nsw i32 %1, %0
  ret i32 %3
}
```

What disappears:

- the stack slots disappeared
- the stores disappeared
- the loads disappeared
- the function now works directly on the arguments
- the optimizer added more useful attributes

The reason is simple:

- `-O0` is for readability and debugging
- `-O2` is for cleanup and optimization

## What to Read Next

- Read [How Clang Converts C/C++ Source Into LLVM IR](/docs/llvm/llvm_ir/clang-to-llvm-ir) first if you want the frontend story behind this file.
- Run `clang -Xclang -ast-dump -fsyntax-only` on the same `add` function and compare the AST to the IR.
- Repeat the same example with `-O0` and `-O2` and compare the file shape yourself.
- If you want another explanation style, compare this post with [A Gentle Introduction to LLVM IR](https://mcyoung.xyz/2023/08/01/llvm-ir/), [Modern Intermediate Representations (IR)](https://llvm.org/devmtg/2017-06/1-Davis-Chisnall-LLVM-2017.pdf), and [Journey to understanding LLVM IR](https://un-devs.github.io/low-level-exploration/journey-to-understanding-llvm-ir/#n).

## References

These are good companion reads if you want a broader view of LLVM IR:

- [A Gentle Introduction to LLVM IR](https://mcyoung.xyz/2023/08/01/llvm-ir/)
- [Modern Intermediate Representations (IR)](https://llvm.org/devmtg/2017-06/1-Davis-Chisnall-LLVM-2017.pdf)
- [Journey to understanding LLVM IR](https://un-devs.github.io/low-level-exploration/journey-to-understanding-llvm-ir/#n)

## Appendix: More IR Patterns

These are the patterns you will hit once you move past toy examples.

The main body of this post was built around one tiny C function because that makes the first read manageable.

This appendix goes wider on purpose. It does not repeat the same story for decoration. It adds the other patterns you will run into as soon as you move from toy examples to real compiler output.

### A tiny vocabulary

If you can read the tokens below, you can already read a surprising amount of LLVM IR:

| Token | Meaning | Why you care |
|---|---|---|
| `define` | Starts a function body. | This is where executable IR begins. |
| `declare` | Announces an external function. | You need this for functions defined elsewhere. |
| `@name` | A global symbol or function. | Globals live at module scope. |
| `%name` | A local value or SSA register. | These are the values that flow inside functions. |
| `i1` | Boolean. | Used by branches and comparisons. |
| `i32` | 32-bit integer. | The workhorse integer type in many examples. |
| `ptr` | Pointer. | LLVM uses opaque pointers now. |
| `label` | Basic block label type. | You only see this in control-flow-related positions. |
| `phi` | Merge value from predecessor blocks. | This is how loops and joins become SSA-friendly. |
| `alloca` | Stack slot allocation. | Common in `-O0` lowering. |
| `load` | Read from memory. | The value comes back into SSA form. |
| `store` | Write to memory. | This is how Clang models mutable locals before optimization. |
| `br` | Branch. | LLVM's basic jump instruction. |
| `ret` | Return. | Ends a function. |
| `call` | Function call. | Lowers direct and indirect calls. |
| `icmp` | Integer comparison. | Produces `i1` results for control flow. |
| `select` | Value-level conditional choice. | Looks like a ternary operator. |
| `getelementptr` | Compute an address offset. | Essential for arrays, structs, and pointer arithmetic. |
| `bitcast` | Reinterpret bits without changing them. | Useful for same-width conversions. |
| `unreachable` | A path LLVM assumes cannot happen. | Important for UB and optimization. |

### LLVM uses virtual registers first

The `%` names in LLVM IR are not hardware registers.

They are virtual registers, or SSA values, inside an abstract machine that LLVM reasons about before target lowering.

That is why LLVM IR can feel like assembly and still be very different from assembly:

- the values are typed
- the values are not tied to real machine registers yet
- the compiler can invent as many of them as it needs

You can think of that as “infinite registers” for the IR stage.

The real CPU only appears later, after instruction selection and register allocation.

That is one of the core reasons LLVM IR is useful: it separates meaning from the final physical register file.

### Opaque Pointers

Older LLVM IR used typed pointers like `i32*` and `i8*`.

Modern LLVM IR uses opaque pointers, written as `ptr`.

That sounds like a small syntax change, but it is actually a big design shift.

The old style looked like this:

```llvm
; old style
%v = load i64, i64* %p
```

The modern style looks like this:

```llvm
; opaque pointer style
%v = load i64, ptr %p
```

What changed:

- the pointer no longer carries the pointee type
- the load instruction itself says what type is being loaded
- the pointer is now just “a pointer”

Why LLVM wanted this:

- pointee types were not really carrying semantics
- many optimizations had to strip pointer casts anyway
- typed pointers created extra bitcasts that cluttered IR
- frontends were already responsible for knowing what the memory meant

The mental model is simple:

- the pointer says where the memory is
- the instruction says how to interpret the memory

That division is one of the reasons the IR is easier for LLVM itself to optimize now.

Opaque pointers did not remove address spaces.

If LLVM needs to distinguish different kinds of pointers for lowering, it still can:

- `ptr` is the default opaque pointer
- `ptr addrspace(N)` is the opaque pointer form in a non-default address space

That matters on targets where data pointers and function pointers, or different memory spaces, do not behave the same way.

You can see the same idea in these instructions:

- `load i64, ptr %p`
- `store i64 %x, ptr %p`
- `getelementptr i32, ptr %p, i64 1`
- `call i32 @foo(ptr %p)`

The element type lives on the instruction, not on the pointer.

That is why this post uses `ptr` everywhere, even when the source language would have had a more specific type in mind.

If you want the official background, LLVM documents this transition in [Opaque Pointers](https://llvm.org/docs/OpaquePointers.html).

#### Why this matters for readers

Opaque pointers show up in real compiler output, so you need to recognize them quickly.

They matter because:

- they remove a layer of fake type safety
- they reduce no-op bitcasts
- they make the IR less noisy
- they push more responsibility onto the load/store/GEP/call sites, which is where the real meaning already lived

#### Why this matters for compiler engineers

If you are writing or reading LLVM passes, you cannot assume the pointer type tells you the access type anymore.

You have to inspect the instruction:

- for a load, look at the loaded type
- for a store, look at the stored value type
- for GEP, look at the source element type
- for calls, look at the function type or ABI-affecting attributes

That is the real migration lesson.

#### A concrete before-and-after

```llvm
; typed pointer world
define i8* @test(i8* %p) {
  %p2 = getelementptr i8, i8* %p, i64 1
  ret i8* %p2
}
```

```llvm
; opaque pointer world
define ptr @test(ptr %p) {
  %p2 = getelementptr i8, ptr %p, i64 1
  ret ptr %p2
}
```

The shape is the same.

The pointer syntax is cleaner.

The type information moved where it belongs: into the instructions that use the pointer.

### Why `define` and `declare` are different

`define` gives you a body.

`declare` gives you a name and a signature, but no body.

That distinction matters because LLVM does not need to know where a function lives before it can reason about how to call it.

```llvm
declare i32 @external_add(i32, i32)

define i32 @use_external(i32 %x, i32 %y) {
  %z = call i32 @external_add(i32 %x, i32 %y)
  ret i32 %z
}
```

What this shows:

- `declare` is how the current module learns about something defined somewhere else.
- `call` can target that declaration immediately.
- optimization can still reason about the call site even if the body is not visible.

### Small functions still reveal the rules

```llvm
define void @do_nothing() {
  ret void
}
```

This is boring on purpose.

There is no hidden state, no hidden stack, and no hidden return value.

Why it matters:

- it shows the smallest possible function shape
- it shows that LLVM IR is strongly typed all the way down
- it shows that function bodies are made of instructions, not free-form text

```llvm
define void @do_not_call() {
  unreachable
}
```

This one is just as important.

`unreachable` does not mean “the program will print an error”.

It means LLVM is allowed to assume the path never happens.

That is why the instruction matters to optimizers: it is a proof statement, not a runtime error message.

### Scalar arithmetic is still a contract

The simplest arithmetic IR looks harmless:

```llvm
define i32 @square(i32 %x) {
  %1 = mul i32 %x, %x
  ret i32 %1
}
```

Why this version is useful:

- `i32` tells LLVM exactly how wide the math is.
- `%x` is a value, not a mutable variable.
- `mul` is pure at the IR level unless some extra rule says otherwise.

If you want a wider result, you have to ask for it:

```llvm
define i64 @square_wide(i32 %x) {
  %1 = sext i32 %x to i64
  %2 = mul i64 %1, %1
  ret i64 %2
}
```

What changed:

- the input is sign-extended to 64 bits first
- the multiplication happens in `i64`
- the function no longer depends on 32-bit wraparound behavior

This is why LLVM IR is not just “lower-level C”.

It forces you to state the exact arithmetic model you want.

### Signedness is explicit where it matters

LLVM does not use separate signed and unsigned integer types.

It uses operations and flags that carry the signedness meaning.

That is why you see instructions like:

- `sdiv`
- `udiv`
- `srem`
- `urem`
- `ashr`
- `lshr`

The choice matters because the same bit pattern can mean different things depending on interpretation.

Example:

```llvm
%a = sdiv i32 %x, %y
%b = udiv i32 %x, %y
```

These are not interchangeable.

The first reads the bits as signed integers.
The second reads them as unsigned integers.

That distinction is one reason LLVM IR can carry language semantics more precisely than machine assembly.

### `select` is not a branch

`select` feels like a compact `if`.

It is not a branch.

```llvm
define i64 @safe_div_select(i64 %n, i64 %d) {
  %is_zero = icmp eq i64 %d, 0
  %div = udiv i64 %n, %d
  %result = select i1 %is_zero, i64 -1, i64 %div
  ret i64 %result
}
```

Why this is dangerous for division:

- `select` evaluates both values conceptually.
- `udiv` by zero is not a harmless alternate branch.
- LLVM cannot pretend the bad path never happened if the bad value was already produced.

That is why real lowering for control flow usually uses `br`.

### `br` creates control flow, not a value choice

```llvm
define i64 @safe_div_br(i64 %n, i64 %d) {
  %is_zero = icmp eq i64 %d, 0
  br i1 %is_zero, label %zero, label %nonzero

zero:
  ret i64 -1

nonzero:
  %div = udiv i64 %n, %d
  ret i64 %div
}
```

This is the shape LLVM likes when the branch condition actually changes which instructions execute.

The important difference is not syntactic.

The important difference is semantic:

- `select` chooses a value
- `br` chooses a path

That difference affects whether LLVM is allowed to speculate work.

### Basic blocks are the real unit of control flow

A basic block is a straight-line sequence of instructions with one exit at the end.

That means the function body is not just “a list of lines”.

It is a graph.

In practice:

- each block has one entry
- each block ends in a terminator
- a terminator decides where execution goes next

This is why CFGs matter.

Once you see blocks as nodes and branches as edges, many compiler transforms become simpler to reason about.

### `switch` is a structured branch table

```llvm
switch i32 %value, label %default [
  i32 0, label %if_zero
  i32 1, label %if_one
  i32 2, label %if_two
]
```

Why LLVM has a separate instruction for this:

- it exposes the shape of the decision tree
- it helps jump-table lowering
- it avoids spelling the same logic as a chain of nested branches

For a compiler engineer, that is useful because the source-level `switch` and the IR-level `switch` remain structurally visible.

### `alloca`, `store`, and `load` model source-shaped locals

The `-O0` style lowering below is deliberately verbose:

```llvm
define i32 @sum_with_stack(i32 %x, i32 %y) {
  %x.addr = alloca i32, align 4
  %y.addr = alloca i32, align 4
  store i32 %x, ptr %x.addr, align 4
  store i32 %y, ptr %y.addr, align 4
  %x.load = load i32, ptr %x.addr, align 4
  %y.load = load i32, ptr %y.addr, align 4
  %sum = add i32 %x.load, %y.load
  ret i32 %sum
}
```

Read it like this:

- the inputs are placed in stack slots
- the compiler reads them back when needed
- the final calculation happens on SSA values

Why Clang does this at `-O0`:

- it keeps the mapping to the source code obvious
- it makes debugging easier
- it avoids committing to an optimized shape too early

### The `mem2reg` idea is simple to say and powerful to use

The memory-to-register promotion pass turns stack-shaped variables into SSA values.

That is the point at which `alloca` starts disappearing.

The optimizer sees that the stack slot is only acting as a storage placeholder and replaces it with `phi` nodes and SSA values where possible.

The practical takeaway:

- `alloca` is often a temporary lowering choice
- `phi` is often the optimized form of a variable that crosses basic blocks
- if you see both, you are looking at the compiler in the middle of simplifying your program

### `phi` means “which value came in from which block?”

```llvm
define i32 @loop_counter() {
entry:
  br label %loop

loop:
  %i = phi i32 [0, %entry], [%next, %body]
  %done = icmp eq i32 %i, 10
  br i1 %done, label %exit, label %body

body:
  %next = add i32 %i, 1
  br label %loop

exit:
  ret i32 %i
}
```

What the `phi` means:

- if control came from `entry`, `%i` is `0`
- if control came from `body`, `%i` is `%next`

This is not a mutable variable.

It is a merge point for values flowing through the graph.

That distinction is the heart of SSA.

### A loop is just a graph with a back-edge

The easiest mental model for a loop in LLVM IR is this:

```text
entry -> loop -> body -> loop
                 \-> exit
```

Once you accept that loops are graphs, `phi` nodes stop feeling like magic and start feeling like plumbing.

### `getelementptr` is pointer arithmetic with structure awareness

```llvm
%field = getelementptr { i32, i64 }, ptr %p, i32 0, i32 1
```

What this says:

- start at pointer `%p`
- step through the aggregate type `{ i32, i64 }`
- select field `1`
- produce a pointer to that field

Why this exists instead of raw integer pointer arithmetic:

- LLVM needs to know the shape of the memory object
- field offsets can be computed safely using type information
- optimizers can reason about aliasing and layout more precisely

### Arrays and structs are different on purpose

```llvm
%ArrayType = type [4 x i32]
%StructType = type { i32, i32, i32 }
```

These are not interchangeable.

Arrays imply repeated elements.

Structs imply fixed positions with potentially different meaning per field.

That distinction matters for:

- layout
- indexing
- `getelementptr`
- load/store reasoning

### Packed structures remove padding

```llvm
%Packed = type <{ i8, i32 }>
```

Packed structs are useful when you want exact byte layout.

Why that matters:

- ABI decisions become explicit
- layout matches certain protocol or binary formats more closely
- the compiler has less freedom to insert padding

### Vectors are not arrays

```llvm
%v = <4 x i32> <i32 1, i32 2, i32 3, i32 4>
```

This looks like an array, but it behaves like a vector type.

Why you care:

- vector types model SIMD-friendly operations
- LLVM can lower them to target-specific vector instructions
- they sit closer to machine execution than arrays do

### Function calls bring more than one line of meaning

```llvm
%r = call i32 @my_func(i32 %x)
```

This is the obvious part.

The less obvious part is that a call also carries information about:

- calling convention
- side effects
- attributes
- exception behavior

That is why real IR dumps with calls get noisy fast.

The noise is not accidental.

The compiler is carrying enough information to make optimization and lowering decisions later.

### `invoke` is a call that may unwind

You do not need `invoke` for every compiler backend article.

You do need to recognize it when it shows up.

It means:

- the call may not return normally
- the compiler has to preserve the exceptional path
- C++ code tends to expose this more often than plain C

### `atomic` and `volatile` are not the same thing

```llvm
%v = load atomic i32, ptr %p acquire
```

Atomic means concurrency semantics matter.

Volatile means the load or store has visibility constraints the optimizer must preserve.

They are related, but they solve different problems:

- atomics define synchronization behavior
- volatile defines compiler-visible side effects

### `cmpxchg` and `atomicrmw` are the building blocks of lock-free code

You do not need to memorize every memory ordering to read compiler output.

You do need to know why these instructions exist:

- they model compare-and-swap
- they model atomic read-modify-write
- they are how higher-level concurrency primitives are lowered

That is why compiler IR is often the first place to look when concurrency code behaves strangely.

### `bitcast` only changes interpretation, not representation

```llvm
%bits = bitcast double %fp to i64
```

This says:

- keep the same bits
- reinterpret them as another same-width type

Why this matters:

- it is the IR equivalent of a same-size reinterpretation
- it is not a computation
- it can be optimized away if the compiler proves the cast is just a view change

### `ptrtoint` and `inttoptr` are where provenance gets tricky

These conversions are real, but they are not the place to be casual.

They matter because:

- pointer identity is not just a numeric address
- optimizers care about provenance
- backends and frontends have to agree on what transformations are valid

For most readers, the useful mental model is simple:

- avoid inventing conversions unless the language semantics really need them
- treat them as low-level escape hatches

### `unreachable` is an optimization statement

```llvm
define void @boom() {
  unreachable
}
```

This does not say “print a warning”.

It says:

- LLVM may assume this path never needs to be executed
- if execution gets here, the program has already broken the language rules
- optimizations may use that fact aggressively

That is why `unreachable` has to be understood as part of the compiler's reasoning model, not just as a weird terminator.

### Poison is not the same as immediate failure

Poison is one of the most important ideas in LLVM IR.

The short version:

- some instructions can create poison
- poison is dangerous only when it gets used in the wrong place
- that lets LLVM preserve optimization freedom without modeling every bad state as a hard trap

Examples that can create poison:

- signed overflow with `nsw`
- certain out-of-bounds pointer computations with `inbounds`
- exact division that does not divide evenly

Why this exists:

- it gives optimizers room to simplify
- it keeps the IR closer to a pure expression model
- it supports aggressive reasoning without losing all connection to source semantics

### `nsw` is a promise, not a decoration

```llvm
%sum = add nsw i32 %a, %b
```

`nsw` means `no signed wrap`.

That means the compiler can assume signed overflow does not happen.

Why this matters:

- if overflow would happen, the result becomes poison instead of wrapping silently
- optimizers can use the promise to remove checks or simplify code
- language frontends only attach it when the source rules permit it

This is one of the easiest IR flags to misunderstand if you only read the mnemonic and not the semantics behind it.

### `nuw` plays the same role for unsigned arithmetic

`nuw` means `no unsigned wrap`.

Same idea, different arithmetic rule.

It exists because different source languages and different transformations care about different overflow contracts.

### `exact` is the same kind of promise for division and shifts

```llvm
%q = udiv exact i32 %x, %y
```

This is only valid when the compiler knows the operation has no remainder in the way LLVM requires.

Why it matters:

- the instruction carries extra semantic information
- that extra information enables stronger optimization
- if the promise is false, the instruction can become poison

### `inbounds` makes pointer arithmetic more restrictive

`getelementptr inbounds` is not just a prettier `getelementptr`.

It means the compiler is making a stronger claim about the validity of the pointer arithmetic.

Why this matters:

- it gives LLVM more optimization room
- it narrows the legal range of pointer math
- it makes the operation closer to C-like source restrictions

### Frontends are allowed to be smarter than LLVM IR

This is easy to miss.

Clang and Rust do not merely lower into LLVM IR and stop thinking.

They also perform frontend-specific simplifications while lowering.

That means:

- some source-level improvements happen before LLVM sees the code
- different languages can expose different IR shapes for equivalent source intent
- backend behavior can differ even when the high-level algorithm looks the same

### Rust debug mode and panic paths make IR look bigger

When a language has overflow checks or panic semantics, the IR gets more moving parts:

- helper intrinsics
- branch prediction hints
- panic functions
- metadata and constants

That noise is normal.

The point is not to panic when you see the noise.

The point is to identify the small core of the logic beneath it.

### A readable workflow for real IR dumps

Use this sequence when you open a real `.ll` file:

1. Find the module header.
2. Find the function definitions.
3. Identify the basic blocks.
4. Find the terminators.
5. Trace the value flow.
6. Look for annotations like `nsw`, `inbounds`, `exact`, `noundef`, and `nonnull`.
7. Only then worry about metadata and attributes.

That order is usually faster than reading every line top to bottom like a textbook.

### Debugging checklist

When a compiler output looks weird, ask:

- Is the frontend changing the shape?
- Is the optimizer removing scaffolding?
- Is the target ABI changing layout?
- Is the source language promising more than the code actually does?
- Is the difference at `-O0` or only at `-O2`?

Those five questions solve a large fraction of “why does the IR look like that?” moments.

### A second concrete reading exercise

Take this tiny loop:

```c
int sum_to_n(int n) {
  int s = 0;
  for (int i = 0; i <= n; ++i) {
    s += i;
  }
  return s;
}
```

Now ask yourself:

- where would Clang place `alloca` at `-O0`?
- where would a later pass introduce `phi`?
- which part of the loop becomes the back-edge?
- which instruction tells the compiler whether the loop exits?

If you can answer those four questions, you are already reading IR instead of merely looking at it.

### Why the long appendix exists

This appendix is intentionally broader than the main walkthrough.

The main walkthrough teaches the first file.

The appendix teaches the surrounding grammar:

- how to recognize more instruction families
- how to classify common lowering shapes
- how to connect `-O0` output to optimizer output
- how to separate source meaning from IR bookkeeping

That is the bridge from “I can decode one tiny example” to “I can read compiler output in the wild”.

### A compact summary to keep

If you only keep five ideas from this appendix, keep these:

- LLVM IR is typed.
- LLVM IR is SSA.
- `alloca` is often a temporary lowering choice.
- `phi` merges values across control flow.
- `nsw`, `inbounds`, and `exact` are promises that unlock optimization.

Those five ideas explain a large part of what you will see in real dumps.

### Mini FAQ

**Why start with `-O0`?**

Because `-O0` shows the compiler's bookkeeping instead of hiding it. That makes it easier to connect the IR back to source code before optimization changes the shape.

**Why does the file include metadata?**

Because LLVM is not just storing instructions. It is also storing target assumptions, compiler identity, ABI details, and optimization hints.

**Why does the same source look so different at `-O2`?**

Because `-O2` is allowed to remove the source-shaped scaffolding once the optimizer has enough information to preserve the same meaning more directly.

**What should I practice next?**

Try a function with a branch, then a loop, then a struct field access. That sequence forces you to see `br`, `phi`, and `getelementptr` in the places where they actually matter.

<AdBanner />
