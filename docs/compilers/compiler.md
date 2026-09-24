---
id: Compiler
title: Know Your Compiler
description: Learn what a compiler is, how it is structured, how it differs from interpreters and assemblers, and where Clang, GCC, and LLVM fit — a clear first lesson for compiler engineering.
keywords:
  - what is a compiler
  - compiler basics
  - compiler phases
  - clang gcc llvm
  - compiler frontend backend
  - know your compiler
---

import Link from '@docusaurus/Link';

A **compiler** turns human-written source code into a form a machine can run — usually through several clear stages, not one magic step.

This page is **lesson 1** of the [Compiler Fundamentals](/docs/tracks/compiler-fundamentals/) track. Stay here until the big picture is clear, then move to the next lesson.

## What a compiler actually does

Given source like C or C++, a compiler:

1. **Reads** the text and checks that it is legal for that language
2. **Understands** structure and meaning (types, names, control flow)
3. **Rewrites** the program into intermediate forms that are easier to analyze
4. **Optimizes** when asked (for speed, size, or other goals)
5. **Emits** target code — often assembly or machine code for a CPU/GPU ISA

You usually invoke this with a driver such as `clang` or `g++`. The driver runs the full toolchain for you (preprocess, compile, assemble, link), but the **compiler proper** is the part that turns source into assembly/object code.

```text
source.c  →  [preprocessor]  →  [compiler]  →  [assembler]  →  [linker]  →  binary
                 .i file           .s / .o         .o file         executable
```

## Compiler vs related tools

| Tool | Job | Example |
| --- | --- | --- |
| **Compiler** | Language → IR / assembly / object | `clang -S`, `g++ -c` |
| **Assembler** | Assembly → object code | `as`, `clang -c` on `.s` |
| **Linker** | Objects + libs → executable / shared lib | `ld`, `clang` link step |
| **Interpreter** | Executes source (or bytecode) without a full ahead-of-time binary | Python, some JS engines |
| **JIT** | Compiles hot code at runtime | JVM, V8, many ML runtimes |

A single command like `clang hello.c -o hello` **orchestrates** several of these. Knowing which stage failed (parse error vs link error) is the first practical skill.

## The three big layers

Almost every production compiler is split like this:

```mermaid
flowchart LR
  A[Frontend] --> B[Middle end]
  B --> C[Backend]
```

- **Frontend** — language rules  
- **Middle end** — IR and optimizations  
- **Backend** — machine code

### Frontend (language-facing)

- Lexing (tokens)
- Parsing (structure / AST)
- Semantic checks (types, names, validity)
- Lowering to an IR

Different languages need different frontends. One backend can serve many languages if they share IR.

### Middle end (IR-facing)

- Works on **Intermediate Representation**
- Runs analyses and optimizations (DCE, inlining, loop opts, …)
- Mostly language-independent

### Backend (machine-facing)

- Instruction selection
- Register allocation
- Scheduling and target quirks
- Emits assembly or object code for an ISA

**Why this split matters:** you can add a new language (new frontend) or a new CPU (new backend) without rewriting the whole compiler.

## Where Clang, GCC, and LLVM fit

People often say “LLVM compiler” casually. Be precise:

| Name | What it is |
| --- | --- |
| **Clang** | A C/C++/Obj-C **frontend** (and driver) that targets LLVM |
| **LLVM** | Compiler **infrastructure**: IR, passes, backends, tools |
| **GCC** | A full compiler collection with its own IR pipeline (GIMPLE → RTL) |

So:

- **Clang vs GCC** = two compilers/toolchains you can install and run
- **LLVM** = the shared engine Clang (and many others) build on

For a deeper comparison later: [Clang vs GCC vs LLVM](/docs/compilers/clang-vs-gcc-vs-llvm/).

## A tiny mental model (one function)

Take:

```c
int add(int a, int b) {
  return a + b;
}
```

Roughly:

1. **Lexer** sees keywords, identifiers, operators
2. **Parser** builds a tree: function → params → return → add
3. **Semantics** confirms `a` and `b` are `int`, `+` is valid
4. **IR** represents the add in a simpler, explicit form
5. **Opts** may simplify or inline this at `-O2`
6. **Backend** picks machine instructions (`add`, register moves, ret)

You do not need to memorize every pass yet. You need this **stage map**.

## What “knowing your compiler” means in practice

For day-to-day engineering, “know your compiler” means you can answer:

- Which **stage** produced this error (frontend diagnostic vs linker)?
- What does **`-O0` vs `-O2`** change, roughly?
- How do I **inspect** IR or assembly when performance looks wrong?
- Is this a **language** issue, an **ABI** issue, or a **codegen** issue?

Those questions show up in debugging, performance work, and LLVM learning.

## Common beginner mistakes

1. **Treating the compiler as one blob** — then every failure looks the same  
2. **Jumping to LLVM passes too early** — without IR / CFG intuition  
3. **Confusing compile errors with link errors** — different tools, different fixes  
4. **Assuming `-O2` always wins** — opts change codegen; measure on real workloads  

## Hands-on (5 minutes)

Save `add.c` with the function above, then try:

```bash
# Stop after preprocessing (expanded source)
clang -E add.c -o add.i

# Emit assembly (no link)
clang -S add.c -o add.s

# Emit LLVM IR (Clang/LLVM)
clang -S -emit-llvm add.c -o add.ll

# Compile only to object file
clang -c add.c -o add.o
```

Open `add.s` and `add.ll`. You are already looking *inside* the pipeline.

## What to read next (Fundamentals track)

Follow this order — do not skip around:

1. **You are here** — Know Your Compiler  
2. [From Source Code to Binary](/docs/compilers/sourcecode_to_executable/) — full toolchain story  
3. [Inside a Compiler: Source Code to Assembly](/docs/compilers/intro/) — stage-by-stage with Clang & GCC flags  
4. [Why IR Matters](/docs/compilers/ir_in_compiler/)  
5. Then frontend → backend → flags → [build a tiny compiler](/docs/compilers/build_your_compiler/)

Or open the full path: [Compiler Fundamentals Track](/docs/tracks/compiler-fundamentals/).

## Related hubs

- [Compilers section home](/docs/compilers/)
- [Start Here](/docs/start-here/)
- [LLVM and IR track](/docs/tracks/llvm-and-ir/) (after fundamentals)
