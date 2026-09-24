---
title: "LLVM Roadmap: A Step-by-Step Curriculum from Beginner to Advanced"
description: "Follow a structured LLVM roadmap covering compiler basics, LLVM IR, passes, optimization, backend concepts, and practical learning order."
slug: /llvm/intro-to-llvm/
keywords:
  - LLVM roadmap
  - learn LLVM
  - LLVM curriculum
  - LLVM IR tutorial
  - LLVM passes
  - compiler engineering
---

import Link from '@docusaurus/Link';

# LLVM Curriculum (Beginner → Advanced)

This is the **full learning roadmap** for LLVM — what exists today, and what is still coming.

If you want a shorter click-through checklist of published lessons only, use the [LLVM and IR Track](/docs/tracks/llvm-and-ir/).  
Need compiler basics first? Start with [Compiler Fundamentals](/docs/tracks/compiler-fundamentals/).

:::tip How to use this page
1. Start from the lowest level you do not fully understand yet.  
2. Open linked articles when they exist.  
3. **Coming Soon** means that topic is planned — skip ahead only if you already know it.  
4. Use this as a study map, not a one-sitting read.
:::

LLVM is a large ecosystem. Beginners often jump straight into pass writing, IR syntax, `opt`, `llc`, or backend internals — then get lost because the pieces do not connect yet.

This curriculum is organized into **progressive levels**: foundations → IR → passes → codegen → advanced topics.

## Quick start (published now)

| Goal | Open |
| --- | --- |
| What LLVM is | [LLVM Explained](/docs/llvm/llvm_basic/intro-to-llvm/) |
| Architecture | [High-Level LLVM Architecture](/docs/llvm/llvm_basic/LLVM_Architecture/) |
| Guided track | [LLVM and IR Track](/docs/tracks/llvm-and-ir/) |
| Section hub | [LLVM Home](/docs/llvm/) |

---

## LEVEL 0 — Compiler-specific DSA foundations

Before heavy LLVM, know the data structures compilers actually use.

| Phase | Core DSA / algorithms | Article |
| --- | --- | --- |
| Compiler phases overview | Phase-by-phase structures | [Compiler Data Structures by Phase](/docs/llvm/llvm_Curriculum/level0/Compiler_Data_Structures_By_Phase/) |
| Lexical analysis | NFA / DFA | [DFA and NFA in Modern Compiler Design](/docs/llvm/llvm_Curriculum/level0/DFA_and_NFA_in_Modern_Compiler_Design/) |
| Lexical analysis | Hash tables, tries, string matching | Coming Soon |
| Syntax analysis | Parse trees, AST, LL/LR stacks, CFG | Coming Soon · see also [AST vs Parse Tree](/docs/compilers/parsers/abstract-syntax-tree-vs-parse-tree/) |
| Semantic analysis | Symbol tables, attribute grammars, union-find | Coming Soon |
| Intermediate code | DAG, TAC | Coming Soon |
| Intermediate code | SSA | [SSA Part 1](/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment/) · [SSA Part 2](/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment_part2/) |
| Optimization | Dominator trees | [Dominators & Dominance Frontiers](/docs/llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier/) |
| Optimization | Data-flow graphs, worklists, DP, graph coloring | Coming Soon |
| Code generation | Expression trees, interference graphs, scheduling | Coming Soon |

Level hub: [Curriculum Level 0](/docs/llvm/llvm_Curriculum/level0/)

---

## LEVEL 1 — Basics: compiler & LLVM introduction

| # | Title | Link |
| --- | --- | --- |
| 1 | What is a Compiler? Phases of Compilation | [Know Your Compiler](/docs/compilers/compiler/) · [Inside a Compiler](/docs/compilers/intro/) |
| 2 | LLVM Overview: Architecture and Design | [LLVM Explained](/docs/llvm/llvm_basic/intro-to-llvm/) · [Architecture](/docs/llvm/llvm_basic/LLVM_Architecture/) · [Why LLVM?](/docs/llvm/llvm_basic/Why_LLVM/) |
| 3 | Compiler Toolchain: Frontend, Optimizer, Backend | [From Source Code to Binary](/docs/compilers/sourcecode_to_executable/) · Coming Soon (LLVM-specific deep dive) |
| 4 | First Hands-on with Clang & LLVM IR | [Clang → LLVM IR](/docs/llvm/llvm_ir/clang-to-llvm-ir/) · [First IR File Line by Line](/docs/llvm/llvm_ir/your-first-llvm-ir-file-line-by-line/) |
| 5 | Using `opt` and `llc` | [LLVM Tools](/docs/llvm/llvm_tools/llvm_tools/) · Coming Soon (`llc` focused guide) |
| 6 | Build LLVM + manage versions | [Build Instructions](/docs/llvm/llvm_basic/Build/) · [Manage Versions](/docs/llvm/llvm_extras/manage_llvm_version/) |

---

## LEVEL 2 — Pass development

| # | Title | Link |
| --- | --- | --- |
| 1 | What are LLVM Passes? | [Understanding LLVM Passes](/docs/llvm/Intermediate/What_Is_LLVM_Passes/) |
| 2 | Writing a Function Pass | Coming Soon · related: [Create Pass as Plugin](/docs/llvm/llvm_basic/pass/Create_LLVM_Pass_As_A_Plugin/) |
| 3 | Writing a Module Pass | Coming Soon |
| 4 | Analyzing Functions and Instructions | Coming Soon · related: [Function Count Pass](/docs/llvm/llvm_basic/pass/Function_Count_Pass/) · [Instruction Count Pass](/docs/llvm/llvm_basic/pass/Instruction_Count_Pass/) |
| 5 | Basic Optimizations (DCE, Folding) | Coming Soon |
| 6 | Running and Debugging Your Custom Pass | [Understanding LLVM Pass](/docs/llvm/llvm_basic/pass/Understanding_LLVM_Pass/) · Coming Soon (debug deep dive) |
| 7 | Pass Pipelines & `-O1` / `-O2` | [Pass Tracker / Examples](/docs/llvm/llvm_pass_tracker/llvm_pass/) · [Pass Timing](/docs/llvm/llvm_extras/LLVM_Pass_Timing/) |

---

## LEVEL 3 — IR mastery

| # | Title | Link |
| --- | --- | --- |
| 1 | Deep Dive into LLVM IR | [LLVM IR Explained](/docs/llvm/llvm_ir/intro_to_llvm_ir/) |
| 2 | IR Hierarchy (Module → Instruction) | [IR Hierarchy](/docs/llvm/llvm_ir/hierarchy_of_llvm_ir/) |
| 3 | Compiler Data Structures by Phase | [Data Structures by Phase](/docs/llvm/llvm_Curriculum/level0/Compiler_Data_Structures_By_Phase/) |
| 4 | DFA, NFA, and Lexer Generation | [DFA and NFA](/docs/llvm/llvm_Curriculum/level0/DFA_and_NFA_in_Modern_Compiler_Design/) |
| 5 | Understanding SSA Form | [SSA Part 1](/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment/) · [SSA Part 2](/docs/llvm/llvm_Curriculum/level0/Static_Single_Assignment_part2/) |
| 6 | Control Flow Graphs and Dominators | [Dominators & PHI Nodes](/docs/llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier/) |
| 7 | Peephole Optimizations in IR | Coming Soon |
| 8 | Loop Transformations at IR Level | Coming Soon |

---

## LEVEL 4 — Code generation basics

| # | Title | Link |
| --- | --- | --- |
| 1 | Instruction Selection | Coming Soon |
| 2 | Register Allocation | Coming Soon |
| 3 | Calling Conventions & ABI in LLVM | Related: [ABI Explorer](/abi/) · Coming Soon (LLVM ABI article) |
| 4 | Machine IR (MIR) Basics | Coming Soon · related: [Backend hub](/docs/llvm/Intermediate/backend/backend/) |
| 5 | Emitting Assembly with `llc` | Coming Soon · related: [LLVM Tools](/docs/llvm/llvm_tools/llvm_tools/) |

---

## LEVEL 5 — Analysis & optimizations

| # | Title | Link |
| --- | --- | --- |
| 1 | Data Flow Analysis in LLVM | Coming Soon |
| 2 | Dominator Trees and Liveness Analysis | [Dominators article](/docs/llvm/llvm_Curriculum/level0/Dominator_Tree_And_Dominance_Frontier/) · Coming Soon (liveness-focused) |
| 3 | Constant Propagation & Folding | Coming Soon |
| 4 | Loop Unrolling & Invariant Hoisting | Coming Soon |
| 5 | Function Inlining | Related: [Inliner notes](/docs/llvm/llvm_pass_tracker/transformpass/inliner_llvm_v1/) · Coming Soon |

---

## LEVEL 6 — Advanced backend engineering

| # | Title | Link |
| --- | --- | --- |
| 1 | LLVM Backend Overview: Target Descriptions | Coming Soon · [Backend hub](/docs/llvm/Intermediate/backend/backend/) |
| 2 | TableGen and Instruction Patterns | Coming Soon |
| 3 | Instruction Selection (ISel) Advanced | Coming Soon |
| 4 | Advanced Register Allocation | Coming Soon |
| 5 | Lowering High-Level Constructs to Machine Code | Coming Soon |

---

## LEVEL 7 — JIT compilation

| # | Title | Link |
| --- | --- | --- |
| 1 | Introduction to MCJIT and ORC JIT | Coming Soon |
| 2 | Writing a Simple JIT with LLVM | Coming Soon |
| 3 | Lazy / On-Demand Compilation | Coming Soon |
| 4 | JIT Optimizations | Coming Soon |
| 5 | JIT for Dynamic Languages | Coming Soon |

---

## LEVEL 8 — LLVM tools & ecosystem

| # | Title | Link |
| --- | --- | --- |
| 1 | Clang: Frontend for LLVM | [Clang → IR](/docs/llvm/llvm_ir/clang-to-llvm-ir/) · Coming Soon (Clang deep dive) |
| 2 | LLD: The LLVM Linker | Coming Soon |
| 3 | Polly: Loop Optimizer for LLVM | Coming Soon |
| 4 | MLIR: Multi-Level IR | [MLIR Intro](/docs/MLIR/intro/) · [ML Compilers Track](/docs/tracks/ml-compilers/) |
| 5 | Integrating LLVM into Other Projects | [Unlocking the Power of LLVM](/docs/llvm/llvm_extras/More_About_LLVM/) · Coming Soon |

---

## LEVEL 9 — Research & advanced topics

| # | Title | Link |
| --- | --- | --- |
| 1 | Parallelism and Vectorization in LLVM | Coming Soon |
| 2 | Profile-Guided Optimizations (PGO) | Coming Soon |
| 3 | Hardware-Specific Optimizations (CPU/GPU) | [GPU Compilers Track](/docs/tracks/gpu-compilers/) · Coming Soon |
| 4 | Security & Sanitizers in LLVM | Coming Soon |
| 5 | Compiler Research Areas with LLVM | Coming Soon |

---

## LEVEL 10 — Real-world compiler engineering

| # | Title | Link |
| --- | --- | --- |
| 1 | Creating a Custom Language with LLVM | Related: [Build Your First Compiler](/docs/compilers/build_your_compiler/) · Coming Soon |
| 2 | Industry Case Studies (Swift, Rust, Julia) | Coming Soon |
| 3 | Contributing to LLVM Open Source | Coming Soon |
| 4 | Debugging Large Compiler Projects | Coming Soon |
| 5 | LLVM in AI & GPU Compiler Frameworks | [ML Compilers](/docs/tracks/ml-compilers/) · [GPU Compilers](/docs/tracks/gpu-compilers/) |

---

## LLVM Live

| Episode | Description | Watch | Read |
| --- | --- | --- | --- |
| Episode 1: LLVM Architecture Overview | Frontend → IR → passes → backend → MIR → assembly | [YouTube](https://www.youtube.com/watch?v=0MVe0wGG1Ns) | [Architecture article](/docs/llvm/llvm_basic/LLVM_Architecture/) |

---

## Practical progression

A useful real-world path looks like this:

1. Frontend-to-IR pipeline  
2. Read small LLVM IR examples  
3. Observe optimization passes on simple programs  
4. Build a small custom pass  
5. Connect experiments back to a full compiler workflow  

That beats memorizing every subsystem up front.

## Related articles

- [How Clang Converts C/C++ Into LLVM IR](/docs/llvm/llvm_ir/clang-to-llvm-ir/)
- [LLVM IR Explained](/docs/llvm/llvm_ir/intro_to_llvm_ir/)
- [Manage LLVM Versions](/docs/llvm/llvm_extras/manage_llvm_version/)
- [LLVM Pass Tracker](/docs/llvm/llvm_pass_tracker/llvm_pass/)
- [LLVM Explained (What is LLVM)](/docs/llvm/llvm_basic/intro-to-llvm/)
- [LLVM and IR Track](/docs/tracks/llvm-and-ir/)
