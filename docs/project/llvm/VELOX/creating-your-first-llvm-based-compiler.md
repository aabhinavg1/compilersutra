---
title: "Creating Your First LLVM-Based Compiler"
description: "A practical compiler series that starts with theory, builds a VELOX frontend, lowers to LLVM IR, emits RISC-V code, and runs the result in QEMU."
displayed_sidebar: veloxSidebar
keywords:
  - LLVM compiler tutorial
  - compiler frontend
  - LLVM IR
  - RISC-V backend
  - compiler architecture
  - AST
  - code generation
  - compiler project
  - VELOX language
  - QEMU
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating Your First LLVM-Based Compiler

Modern software performance depends heavily on compilers, yet most developers never see how source code is transformed into optimized machine instructions.

In this series, we will go beyond theory and build a real compiler pipeline from scratch, understanding not just how compilers work, but how they optimize real programs. VELOX, short for Vector Execution Language for Optimization and Experimentation, is the project we will use to make that pipeline concrete.

This series is designed for developers who want to understand how compilers think, not just how to use them.

To create your first compiler, you need to build a frontend and then lower your program to LLVM IR.

If your goal is to support a new programming language, you need to develop a frontend that converts your language into LLVM IR.

If your goal is to support new hardware, you need to use LLVM's backend support to generate machine code for that target architecture.

At each stage of the compiler, we will use industry-standard tools similar to those used in LLVM and Clang.

We will not build everything from scratch. Instead, we will rely on proven tools for building and structuring the compiler:

<Tabs groupId="toolchain" className="rounded-tabs">

<TabItem value="build" label="Build System">

- `CMake`
- Used to manage compilation, dependencies, and project structure
- Same approach used across LLVM projects

</TabItem>

<TabItem value="frontend" label="Language Implementation">

- Custom lexer and parser
- Handwritten and educational
- Inspired by how real compilers structure parsing

</TabItem>

<TabItem value="llvm" label="LLVM Toolchain">

- `clang` as a reference for frontend behavior
- `llc` for LLVM IR to target assembly
- `opt` for optimization passes

</TabItem>

<TabItem value="exec" label="Target Execution">

- `QEMU` for running RISC-V binaries without hardware

</TabItem>

</Tabs>

:::important
Instead of reinventing build systems or toolchains, we will follow the same ecosystem approach used by real-world compilers.
:::

:::note
You are not using Clang internally. You are building your own frontend for `VELOX`, but you are using LLVM infrastructure to lower, optimize, and emit code.
:::

:::tip Pipeline at a glance
```text
VELOX source
  ↓ tokens
Lexer
  ↓ AST
Parser / AST
  ↓ LLVM IR
Middle-end
  ↓ optimized IR
opt
  ↓ RISC-V assembly
llc
  ↓ binary
Linker
  ↓ execution
QEMU
```

- Frontend: the lexer and parser turn VELOX source into an AST.
- Middle-end: the AST is lowered into LLVM IR, a representation that is easier to analyze and transform.
- Optimization: `opt` runs passes that simplify and improve the IR before code generation.
- Backend: `llc` lowers optimized IR into target assembly for RISC-V.
- Execution: the final binary is run in QEMU so the full flow can be validated without target hardware.
:::

## Table of Contents

- [Why a compiler has to be built in stages](#why-a-compiler-has-to-be-built-in-stages)
- [Compiler Build Plan](#compiler-build-plan)
- [Series Breakdown](#series-breakdown)
- [Final Toolchain](#final-toolchain)
- [Why This Structure Matters](#why-this-structure-matters)
- [Closing Line](#closing-line)

To keep this journey structured, we will divide the series into multiple parts.

## Why a Compiler Has to Be Built in Stages

:::caution
A compiler is not one single program. It is a pipeline of smaller systems, and each stage solves a different problem.
:::

For a beginner, the easiest way to understand a compiler is to break it into six stages:

1. Read the source code.
2. Convert source code into tokens using a lexer.
3. Turn tokens into an AST with a parser.
4. Lower the AST into LLVM IR, where the program becomes easier to analyze and transform.
5. Use LLVM tools like `opt` and `llc` to optimize the IR and generate target assembly.
6. Link and run the final binary in `QEMU` to verify the full toolchain.

:::tip
Once you understand these stages, compiler development becomes much less mysterious.
:::

## Compiler Build Plan

Here is the order we will follow in this series.

| Stage | What We Build | Main Topics |
| --- | --- | --- |
| Frontend | Turns VELOX source code into an AST | Lexer, parser, tokens, AST, symbol table |
| Middle End | Turns AST into LLVM IR | IR generation, basic blocks, SSA, verification |
| Backend | Turns LLVM IR into RISC-V assembly | Code generation, instruction selection, lowering |
| Optimization | Improves the generated IR | `opt`, constant folding, dead code elimination, CFG cleanup |
| Binary + Execution | Turns assembly into a runnable program | Linking, binary generation, QEMU |
| Testing and Correctness | Makes the compiler reliable | Unit tests, IR checks, assembly checks, regression tests |

:::note
This order is intentional. We first make the compiler understand the language, then we teach it how to represent the language in LLVM IR, then we generate machine code, and finally we make the output correct and optimized.
:::

## Series Breakdown

### Part 1: Master Overview

This is the foundation part.

In this part, we will cover:

- What a compiler is at a high level
- Compiler architecture: frontend vs backend
- The role of LLVM IR as the bridge
- How modern compilers like LLVM work internally
- What we are going to build in this series
- Tools, setup, and prerequisites

Final goal:

`VELOX -> AST -> LLVM IR -> Optimized IR -> RISC-V Assembly -> Binary -> QEMU`

This part gives complete clarity before writing any code.

### Part 2: VELOX Design and Frontend Implementation

This part defines the language and builds the frontend.

In this part, we will design `VELOX v1.0`, including:

- Language philosophy: compute and optimization focused
- Supported types:
  - `i32`
  - optional `f32`
- Core language features:
  - variables with `let`
  - expressions
  - [functions with `pulse`](./index#what-is-a-pulse)
  - loops with `for`
  - conditionals with `if-else`
- Example programs
- Lexer design for tokenizing VELOX source
- Parser design for building the AST
- AST structure for expressions, statements, and functions
- Symbol table handling for names and scope

By the end of this part, we will have a working frontend that understands VELOX source code.

### Part 3: Middle End and LLVM IR

This part lowers the frontend into LLVM IR.

In this part, we will:

- Map AST nodes to LLVM IR
- Create functions, basic blocks, and instructions
- Handle expressions and variables
- Build control flow with branches and loops
- Verify that the generated IR is valid

This is where VELOX becomes real LLVM IR.

### Part 4: Backend Implementation

This part turns LLVM IR into target-specific machine code.

In this part, we will cover:

- RISC-V backend structure
- Instruction selection
- Register allocation
- Lowering IR to assembly
- Target-specific emission through LLVM

### Part 5: Optimization Passes

This part improves the compiler output.

In this part, we will cover:

- Constant folding
- Common subexpression elimination
- Dead code elimination
- Loop-invariant code motion
- SimplifyCFG and related LLVM passes
- A minimal loop-focused pass set that prepares code for better optimization and parallelism

:::note
In practice, `opt` and `llc` sit close together in the post-IR flow. `opt` reshapes the IR, and `llc` lowers the result into target assembly.
:::

### Part 6: Binary Emission and QEMU

This part makes the output runnable.

In this part, we will cover:

- Object file generation
- Linking steps
- Runtime entry points
- Calling conventions
- Loading the binary in QEMU
- Running generated programs
- Checking execution output
- Debugging runtime issues

### Part 7: Testing and Correctness

This part makes the compiler trustworthy.

In this part, we will cover:

- Golden IR tests
- Parser tests
- Code generation tests
- Assembly inspection
- Regression protection

### Part 8: VELOX Extensions

This part is for future growth.

In this part, we can extend VELOX with:

- Arrays and memory access
- User-defined types
- Better control flow
- Standard library support
- Error handling

### Part 9: Performance and Compiler Quality

This part improves the compiler itself.

In this part, we will cover:

- Better diagnostics
- Faster parsing
- Safer IR generation
- Optimization-aware frontend design
- Benchmarking the compiler

## Final Toolchain

Here is the exact toolchain flow we want to follow:

| Stage | What Happens | Tool |
| --- | --- | --- |
| Source code | VELOX program is written | `VELOX` |
| Frontend | Lexer, parser, and AST are built | Custom frontend |
| Middle layer | Program is lowered into LLVM IR | LLVM IR |
| Post-IR toolchain | IR is optimized and then lowered to assembly | `opt` + `llc` |
| Linking | Assembly becomes a binary | Linker |
| Execution | Binary is run without hardware | `QEMU` |

:::tip
This is the same style of ecosystem thinking used in real compiler projects: a custom frontend on top of LLVM, not a fully reinvented compiler stack.
:::

## Final Goal

By the end of this series, the pipeline should look like this:

`VELOX -> AST -> LLVM IR -> Optimized IR -> RISC-V Assembly -> Binary -> QEMU`

That gives us both sides of LLVM:

- a frontend that supports a new language
- a backend that targets new hardware

## Why This Structure Matters

This split keeps the learning path clean and mirrors how real compiler systems are organized.

- Part 1 explains the architecture
- Part 2 defines the language
- Part 3 starts implementation
- Later parts deepen code generation, optimization, backend work, and QEMU validation

If you follow the series in order, you will understand not only how to build a compiler, but also why each layer exists and how the data moves between them.

## Closing Line


Let’s begin with Part 1 and first understand the theory and overall architecture of the compiler we are going to build.
