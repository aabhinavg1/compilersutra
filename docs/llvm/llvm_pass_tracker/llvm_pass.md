---
title: "LLVM Passes Explained With Real Examples"
description: "What does an LLVM pass do? Learn the pass flow, track optimization steps, and read results more clearly."
keywords:
  - LLVM passes
  - LLVM pass manager
  - compiler optimization passes
  - LLVM infrastructure evolution
  - legacy pass manager
  - new pass manager
  - LLVM transformation passes
  - LLVM analysis passes
  - compiler architecture
  - LLVM version history
  - pass dependency management
  - LLVM API changes
  - compiler optimization pipeline
  - LLVM 1.0 to 22.0
  - pass registration
  - analysis preservation
  - LLVM performance optimization
  - compiler development
  - static analysis passes
  - LLVM code transformation
  - modular compiler design
  - LLVM pass dependencies
  - compilation pipeline
  - LLVM intermediate representation
  - compiler engineering
  - LLVM project evolution
  - pass execution order
  - LLVM optimization levels
  - compiler backend passes
  - LLVM target-specific passes
  - instrumentation passes
  - LLVM scalar optimizations
  - vectorization passes
  - loop optimization passes
  - interprocedural optimization
  - LLVM memory analysis
  - alias analysis passes
  - dominator tree analysis
  - LLVM verifier pass
  - pass manager comparison
  - LLVM migration guide
  - compiler testing infrastructure
  - LLVM debugging passes
  - profile-guided optimization
  - LLVM machine passes
  - code generation passes
  - LLVM register allocation
  - instruction scheduling
  - LLVM pass statistics
  - compilation performance
  - LLVM modular design
  - compiler research infrastructure
  - academic compiler projects
  - industrial compiler systems
  - LLVM in production
  - Apple Xcode LLVM
  - Android NDK LLVM
  - NVIDIA CUDA compiler
  - GCC vs LLVM architecture
  - compiler pass orchestration
  - LLVM analysis groups
  - immutable passes
  - function passes
  - module passes
  - LLVM loop passes
  - region passes
  - call graph SCC passes
  - LLVM pass pipeline
  - optimization sequence
  - -O1 -O2 -O3 pipelines
  - LLVM pass debugging
  - opt tool evolution
  - LLVM pass instrumentation
  - custom pass development
  - third-party LLVM passes
  - academic research passes
  - LLVM community contributions
  - pass naming conventions
  - historical LLVM versions
  - compiler infrastructure design
  - software engineering evolution
  - large-scale C++ projects
  - open-source compiler development
  - LLVM foundation years
  - UIUC compiler research
  - Chris Lattner LLVM
  - modern compiler construction
  - compiler optimization theory
  - data flow analysis
  - control flow analysis
  - LLVM SSA form
  - memory SSA
  - global value numbering
  - instruction combining
  - loop invariant code motion
  - dead code elimination
  - constant propagation
  - common subexpression elimination
  - partial redundancy elimination
  - loop unrolling
  - loop vectorization
  - superword-level parallelism
  - interprocedural constant propagation
  - whole-program analysis
  - link-time optimization
  - thinLTO
  - fullLTO
  - LLVM pass manager redesign
  - compilation memory usage
  - parallel compilation
  - incremental compilation
  - distributed compilation
  - cloud compilation services
  - future compiler architectures
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { ComicQA } from '../../mcq/interview_question/Question_comics';



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

<div>
  <AdBanner />
</div>



# The Complete Evolution of LLVM Pass Infrastructure

## Introduction.

LLVM’s pass infrastructure is one of the most significant architectural ideas to come out of modern compiler research. Introduced during LLVM’s early development at the [University of Illinois Urbana-Champaign in 2000](https://en.wikipedia.org/wiki/University_of_Illinois_Urbana-Champaign), it established a modular way of building compilers: instead of monolithic optimizers, LLVM breaks the workflow into small, independent units called **passes**. Each pass performs a specific analysis or transformation on the shared intermediate representation (IR).
This modularity is what makes LLVM flexible, extensible, and easy to maintain—even as it grows to support new languages, new hardware, and new optimization techniques.

:::tip **Purpose of This Article**
The goal of this page is to **document how LLVM’s pass infrastructure has evolved over time**—from the early academic versions to the modern, production-grade system used today.
By tracing these changes, readers will understand how LLVM became the optimization engine behind tools such as Apple’s Xcode, Google’s Android NDK, and NVIDIA’s CUDA toolchain.
:::

If you want, I can also rewrite it in a more academic, more casual, or more engineer-to-engineer tone.

<details>
<summary><strong>2000–2003: Academic Prototype</strong></summary>

LLVM began as a research project aimed at exploring the design of a flexible, retargetable compiler. Early passes focused on basic optimizations, such as constant propagation and dead code elimination, primarily for academic experimentation. The **Legacy Pass Manager** was introduced to schedule and coordinate these passes, providing a framework for pass dependencies and execution order.

 - **Paper Link**
[LLVM: A Compilation Framework for Lifelong Program Analysis & Transformation](https://llvm.org/pubs/2004-01-30-CGO-LLVM.pdf)
</details>

<details>
<summary><strong>2010–2015: Modular Redesign and Production Use</strong></summary>

As LLVM gained adoption in industry, its pass infrastructure underwent significant redesigns. 
- The New Pass Manager (NPM) was conceptualized to replace the Legacy Pass Manager, offering improved performance, better memory usage, and a more modular interface. 
- Passes were increasingly decoupled, supporting parallel execution and more precise dependency tracking. 
- During this time, LLVM became the backbone of production compilers for AMD,Intel, Google’s Android NDK,NVDIA ,ARM and other major platforms.
</details>

<details>
<summary><strong>2015–Present: Robust, Scalable, and Extensible </strong></summary>

LLVM's pass infrastructure continues to evolve, with a focus on scalability, maintainability, and integration with advanced analyses like alias analysis, vectorization, and GPU-targeted optimizations. 

:::note Today
 LLVM supports a wide range of domains from **CPU** and **GPU code generation** to ***high-performance computing frameworks*** and serves as the foundation for industry grade compilers toolchain.
:::
</details>

:::caution By clearly tracking these milestones
This article fulfills its aim: providing a comprehensive overview of how LLVM’s pass infrastructure evolved from a simple academic experiment to a versatile, production-ready system that underpins modern software compilation.
:::


:::caution ⚠️ AI & Human Collaboration Notice
The formatting of this document was assisted by AI tools.  
All content is research-based, written and reviewed by humans to ensure accuracy and clarity.
:::

<div>
  <AdBanner />
</div>

## Table of Contents

1. [Introduction to LLVM Pass Architecture](#introduction-to-llvm-pass-architecture)
2. [Why LLVM Pass Are Important](#why-llvm-passes-are-important)
3. [List of LLVM Pass](#list-of-llvm-pass)
   - [Analysis Passes](#analysis-passes--definition)
   - [Transformation Passes](#transform-passes--categorized-with-links)
   - [Code clean up](#1️⃣-code-cleanup--dead-code-elimination)
   - [Inlining](#2️⃣-inlining--function-optimizations)
   - [Loop Optimizations](#3️⃣-loop-optimizations)
   - [Memory and Global Optimization](#4️⃣-memory--global-optimizations)
   - [Control Flow CFG](#5️⃣-control-flow--cfg-transformations)
   - [Instruction Level Optimizatio](#6️⃣-instruction-level-optimizations)
   - [Target-Specific Passes](#target-specific-passes)
   - [Utility Passes](#utility-passes)
   - [Vector Optimizations](#vector-optimizations)
4. [Closing note](#closing-note)

<div>
  <AdBanner />
</div>

## Introduction to LLVM Pass Architecture

### What Are LLVM Passes?

LLVM passes are the fundamental units of transformation and analysis in the LLVM compiler infrastructure. Each pass performs a specific operation on the LLVM Intermediate Representation (IR), such as optimizing code, analyzing properties, or transforming representations. 

> ***The pass-based architecture enables compiler developers to build complex optimization pipelines.
To understand more about it visit [compilersutra.com](https://www.compilersutra.com/docs/llvm/intermediate/what_is_llvm_passes/).***

:::tip In short,
The compilation process typically follows this conceptual pipeline:
```python
 Source Code → Abstract Syntax Tree (AST) → Intermediate Representation (IR) → Optimized IR → Machine Code (Assembly).
```
:::caution What Happen when Source Code Parsed Into AST?

Once the ***source code*** has been parsed into an ***AST*** and ***lowered to LLVM's Intermediate Representation (IR)***, the core work of the compiler begins: 
> ***modifying, optimizing, and validating this IR until it is ready to be translated into efficient machine code.***
 
 :::important LLVM Passes
The components responsible for these ***transformations and analyses*** are called LLVM Passes.
:::

## Why LLVM Passes Are Important

The importance of LLVM passes stems from their role as the fundamental orchestrators of code analysis and transformation. They transform the LLVM compiler from a static translator into a dynamic, adaptable, and powerful system for program manipulation.

LLVM passes act as specialized components that each tackle a specific task within the compilation pipeline. This modular design is critical for several reasons, which are explored in the following sections.

:::tip Core Enablers of Modern Compilation
LLVM passes provide the essential building blocks for the modern compilation and optimization process, enabling key capabilities that would be difficult or impossible to achieve with a monolithic architecture.
:::

The importance of passes is further highlighted by the ongoing evolution of the infrastructure that manages them. The transition from the [**Legacy Pass Manager**](https://llvm.org/docs/WritingAnLLVMPass.html) to the **New Pass Manager (NPM)**(https://llvm.org/docs/NewPassManager.html) addresses critical limitations. The NPM, now the default for the optimization pipeline, provides more efficient analysis caching, finer-grained dependency tracking, and better support for pass managers within pass managers. This evolution underscores that the pass model is not static; it continuously improves to handle larger codebases, more complex optimizations, and emerging parallel compilation needs. Understanding the differences between these managers is essential for anyone writing or maintaining [LLVM passes](https://llvm.org/docs/NewPassManager.html#status-of-the-new-and-legacy-pass-managers) today.

Some of them  are 
<details>
<summary><strong>Enabling Modular and Composable Optimizations</strong></summary>

 The single most important feature of the pass system is modularity. 
 - Each pass is a self-contained unit with a specific, well-defined purpose,
   such as eliminating dead code or analyzing memory aliasing. 
 - This allows compiler engineers and researchers to develop, test, and combine transformations independently. 
 - Complex optimization pipelines (like `-O2` or `-O3`) are simply pre-defined sequences of these modular passes. 

>***This composition model is far more flexible and maintainable than a large, intertwined codebase.***

</details>

<details>
<summary><strong>Separating Analysis from Transformation</strong></summary>

- The infrastructure cleanly distinguishes between **Analysis Passes**, which gather 
 information about the code (e.g., a dominator tree or alias analysis results), and 
**Transform Passes**, which modify the code based on that information. 

- This separation is a classic software engineering principle that prevents analysis 
  logic from being duplicated across transformations and allows expensive analyses to be 
  computed once and reused by many subsequent passes.

</details>

<details>
<summary><strong>Managing Complexity Through Scoped Execution</strong></summary>

- Passes are categorized by the scope of code they operate on
    >**Module**, **Function**, **Loop**, or **Basic Block**. 
- This granularity allows the Pass Manager to apply optimizations 
  efficiently and in the correct order. For example, a **FunctionPass**
  can safely transform each function in isolation without worrying about 
  interactions with others, simplifying both the pass logic and the overall pipeline scheduling.
</details>

<details>
<summary><strong>The Engine of Performance and Correctness</strong></summary>

***Beyond structural benefits, passes are the direct mechanism through which compilers achieve their primary goals: 
generating fast, correct, and specialized code.***


<details>
<summary><strong>Driving Performance Optimizations</strong></summary>

The vast majority of performance gains in compiled code come from passes.
- Key transformations include **Global Value Numbering (GVN)** to eliminate 
  redundant computations, **Loop Unrolling** to expose instruction-level parallelism, 
  and **Inlining** to reduce function call overhead. 
- These passes directly translate high-level code patterns into more efficient low-level sequences.
</details>

<details>
<summary><strong>Ensuring Code Safety and Sanitization*</strong></summary>

- Passes are not only for optimization. 
- Instrumentation passes like **AddressSanitizer (ASan)** and **MemorySanitizer (MSan)** 
  inject runtime checks to detect ***memory corruption***, ***use-after-free***, and ***reads of uninitialized memory***. 
  These passes are crucial for modern software development, shifting the detection of elusive bugs from 
  production to the testing phase.
</details>


<details>
<summary><strong>Facilitating Target-Specific Code Generation</strong></summary>

- While middle-end passes are largely target-independent, the backend heavily relies on passes 
  to generate quality machine code. Passes for **instruction selection**, **register allocation**, 
  and **instruction scheduling** are tailored to the specifics of CPU architectures (x86, ARM, RISC-V) 
  and accelerators (GPUs). This allows LLVM to support a wide range of hardware from a common IR.
</details>
</details>

:::caution Apart from this
The LLVM pass infrastructure transforms the compiler into a versatile platform for research and proprietary tooling by enabling custom plugins and structured APIs, while simultaneously serving as the critical foundation for advanced ***compilation techniques like Link-Time Optimization (LTO) and Profile-Guided Optimization (PGO)*** by orchestrating whole-program analysis and feedback-driven transformations.

:::note In Summary
In summary, LLVM passes are important because they provide the **modular units of work**, the **structured framework for interaction**, and the **extensible plugin interface** that collectively make LLVM a versatile, high-performance, and adaptable compiler infrastructure used from academia to industry.

I hope this detailed explanation helps solidify your understanding of LLVM's core architecture. Would you like me to elaborate on any of these points, such as the practical differences between writing a pass for the Legacy vs. the New Pass Manager?
:::

<div>
  <AdBanner />
</div>



## List of LLVM Pass

> This section presents a **high-level overview of LLVM passes name**, refered from the official [LLVM Passes Documentation](https://llvm.org/docs/Passes.html). 
> The purpose of this list is to give readers a **broad understanding of the available analysis passes**, their scope, and their role in the LLVM optimization pipeline.
 Each pass listed here will be explored in a **dedicated article**, where we will cover its functionality, practical usage, and evolution from LLVM version 1.0 to the present.
>
:::tip ⚡ **Key Point:** 
This overview is intended to serve as a reference guide. 
- This Passes form the foundation for many ***transformation passes***, enabling ***safe and effective optimizations***
  >while preserving the ***correctness of the IR***.
- By studying them individually, readers can gain a deeper understanding of how LLVM performs 
  >sophisticated ***program analyses across versions.***
:::
##### Analysis Passes — Definition

Analysis passes are compiler passes that inspect the LLVM Intermediate Representation (IR) **without modifying it**. Their primary purpose is to collect information that other transformation passes can use to make optimization decisions.

⚡ **Key Point:** Analysis passes never modify IR; they only provide insights for subsequent transformations.

| Pass Name                | Flag                       | Description                                                          | Link          |
| ------------------------ | -------------------------- | -------------------------------------------------------------------- | ------------- |
| AA Eval                  | `-aa-eval`                 | Exhaustive Alias Analysis Precision Evaluator                        | *Coming Soon* |
| Basic AA                 | `-basic-aa`                | Stateless alias analysis                                             | *Coming Soon* |
| Basic CG                 | `-basiccg`                 | Basic Call Graph construction                                        | *Coming Soon* |
| Dependence Analysis      | `-da`                      | Memory and instruction dependence analysis                           | *Coming Soon* |
| Dominance Frontier       | `-domfrontier`             | Computes dominance frontier for basic blocks                         | *Coming Soon* |
| Dominator Tree           | `-domtree`                 | Builds dominator tree to represent dominance relations in a function | *Coming Soon* |
| DOT Call Graph           | `-dot-callgraph`           | Outputs call graph in `.dot` format for visualization                | *Coming Soon* |
| DOT CFG                  | `-dot-cfg`                 | Outputs function’s Control Flow Graph (CFG) to `.dot` file           | *Coming Soon* |
| DOT CFG Only             | `-dot-cfg-only`            | Outputs CFG structure only, without function bodies                  | *Coming Soon* |
| DOT Dominator Tree       | `-dot-dom`                 | Outputs dominator tree to `.dot` file                                | *Coming Soon* |
| DOT Dominator Only       | `-dot-dom-only`            | Outputs dominator tree structure only                                | *Coming Soon* |
| DOT Post-Dominator       | `-dot-post-dom`            | Outputs post-dominator tree to `.dot` file                           | *Coming Soon* |
| DOT Post-Dominator Only  | `-dot-post-dom-only`       | Outputs post-dominator tree structure only                           | *Coming Soon* |
| Globals AA               | `-globals-aa`              | Simple alias/mod-ref analysis for global variables                   | *Coming Soon* |
| Instruction Count        | `-instcount`               | Counts LLVM IR instruction types                                     | *Coming Soon* |
| Induction Variable Users | `-iv-users`                | Identifies users of induction variables                              | *Coming Soon* |
| Kernel Info              | `-kernel-info`             | Reports GPU kernel-related information                               | *Coming Soon* |
| Lazy Value Info          | `-lazy-value-info`         | Performs lazy value analysis                                         | *Coming Soon* |
| Lint                     | `-lint`                    | Static lint checks for LLVM IR correctness                           | *Coming Soon* |
| Loops                    | `-loops`                   | Detects natural loops and loop nesting                               | *Coming Soon* |
| Memory Dependence        | `-memdep`                  | Analyzes dependencies between memory operations                      | *Coming Soon* |
| Print Module Debug Info  | `-print<module-debuginfo>` | Decodes and prints module-level debug info                           | *Coming Soon* |
| Post-Dominator Tree      | `-postdomtree`             | Constructs post-dominator tree                                       | *Coming Soon* |
| Print Alias Sets         | `-print-alias-sets`        | Prints sets of aliasing pointers or memory references                | *Coming Soon* |
| Print Call Graph         | `-print-callgraph`         | Prints program/module call graph                                     | *Coming Soon* |
| Print Call Graph SCCs    | `-print-callgraph-sccs`    | Prints strongly connected components of the call graph               | *Coming Soon* |
| Print CFG SCCs           | `-print-cfg-sccs`          | Prints SCCs for each function CFG                                    | *Coming Soon* |
| Print Function           | `-print-function`          | Prints LLVM IR for each function                                     | *Coming Soon* |
| Print Module             | `-print-module`            | Prints the entire LLVM IR module                                     | *Coming Soon* |
| Regions                  | `-regions`                 | Detects single-entry single-exit (SESE) regions in CFG               | *Coming Soon* |



##### Transform Passes — Categorized (with Links)

Transform passes are compiler passes that modify the ***LLVM Intermediate Representation (IR)*** to optimize the program, improve performance, or prepare it for code generation. 
They perform concrete transformations such as eliminating dead code, inlining functions, simplifying control flow, or optimizing loops and memory usage.

⚡⚡ **Key Point:** Unlike analysis passes, transform passes actively change IR to improve efficiency or canonicalize the code.

###### 1️⃣ **Code Cleanup & Dead Code Elimination**

| Pass Name                        | Flag                    | Description                                   | Link          |
| -------------------------------- | ----------------------- | --------------------------------------------- | ------------- |
| Aggressive Dead Code Elimination | `adce`                  | Removes dead instructions aggressively        | *Coming Soon* |
| Dead Code Elimination            | `dce`                   | Removes instructions that have no effect      | *Coming Soon* |
| Dead Argument Elimination        | `deadargelim`           | Eliminates unused function arguments          | *Coming Soon* |
| Dead Store Elimination           | `dse`                   | Removes stores to memory locations never read | *Coming Soon* |
| Global Dead Code Elimination     | `globaldce`             | Removes unused global variables               | *Coming Soon* |
| Strip Symbols                    | `strip`                 | Removes all symbols from a module             | *Coming Soon* |
| Strip Dead Debug Info            | `strip-dead-debug-info` | Removes debug info for unused symbols         | *Coming Soon* |
| Strip Dead Prototypes            | `strip-dead-prototypes` | Removes unused function prototypes            | *Coming Soon* |
| Strip Non-Debug Symbols          | `strip-nondebug`        | Removes all symbols except debug symbols      | *Coming Soon* |

---

###### 2️⃣ **Inlining & Function Optimizations**

| Pass Name                     | Flag              | Description                                        | Link          |
| ----------------------------- | ----------------- | -------------------------------------------------- | ------------- |
| Always Inline                 | `always-inline`   | Inlines functions marked `always_inline`           | *Coming Soon* |
| Function Inlining             | `inline`          | Integrates small functions into call sites         | [Inline](./transformpass/inliner_llvm_v1.md) |
| Partial Inliner               | `partial-inliner` | Performs partial function inlining                 | *Coming Soon* |
| Merge Functions               | `mergefunc`       | Merges identical functions                         | *Coming Soon* |
| Merge Return Nodes            | `mergereturn`     | Unifies multiple function exit points              | *Coming Soon* |
| Function Attributes Deduction | `function-attrs`  | Infers attributes for functions (e.g., `readonly`) | *Coming Soon* |

---

###### 3️⃣ **Loop Optimizations**

| Pass Name                  | Flag                   | Description                                             | Link          |
| -------------------------- | ---------------------- | ------------------------------------------------------- | ------------- |
| Loop-Closed SSA Form       | `lcssa`                | Converts loops to LCSSA form                            | *Coming Soon* |
| Loop Invariant Code Motion | `licm`                 | Moves loop-invariant computations outside loops         | *Coming Soon* |
| Loop Deletion              | `loop-deletion`        | Deletes loops that are proven dead                      | *Coming Soon* |
| Loop Extraction            | `loop-extract`         | Extracts loops into separate functions                  | *Coming Soon* |
| Loop Strength Reduction    | `loop-reduce`          | Optimizes multiplication/division by constants in loops | *Coming Soon* |
| Loop Rotation              | `loop-rotate`          | Rotates loops to improve performance                    | *Coming Soon* |
| Loop Simplify              | `loop-simplify`        | Canonicalizes natural loops                             | *Coming Soon* |
| Loop Unroll                | `loop-unroll`          | Unrolls loops to reduce overhead                        | *Coming Soon* |
| Loop Unroll and Jam        | `loop-unroll-and-jam`  | Unrolls nested loops to improve parallelism             | *Coming Soon* |
| Simple Loop Unswitch       | `simple-loop-unswitch` | Unswitches loops based on branch conditions             | *Coming Soon* |

---

###### 4️⃣ **Memory & Global Optimizations**

| Pass Name                        | Flag           | Description                                           | Link          |
| -------------------------------- | -------------- | ----------------------------------------------------- | ------------- |
| Argument Promotion               | `argpromotion` | Promotes ‘by reference’ arguments to scalars          | *Coming Soon* |
| Promote Memory to Register       | `mem2reg`      | Promotes stack variables to SSA registers             | *Coming Soon* |
| MemCpy Optimization              | `memcpyopt`    | Optimizes memory copy operations                      | *Coming Soon* |
| Scalar Replacement of Aggregates | `sroa`         | Breaks aggregates into scalar components              | *Coming Soon* |
| Global Optimizer                 | `globalopt`    | Optimizes global variables                            | *Coming Soon* |
| Internalize Globals              | `internalize`  | Marks global symbols as internal if unused externally | *Coming Soon* |
| Demote Registers to Memory       | `reg2mem`      | Moves SSA values back to memory                       | *Coming Soon* |

---

###### 5️⃣ **Control Flow & CFG Transformations**

| Pass Name                       | Flag                         | Description                                                    | Link          |
| ------------------------------- | ---------------------------- | -------------------------------------------------------------- | ------------- |
| Break Critical Edges            | `break-crit-edges`           | Breaks critical edges in the CFG                               | *Coming Soon* |
| Jump Threading                  | `jump-threading`             | Simplifies branches by threading jumps                         | *Coming Soon* |
| Normalize                       | `normalize`                  | Transforms IR into canonical form for easier diffing           | *Coming Soon* |
| Simplify CFG                    | `simplifycfg`                | Simplifies the control flow graph                              | *Coming Soon* |
| Block Placement                 | `block-placement`            | Profile-Guided Basic Block Placement                           | *Coming Soon* |
| Lower Global Destructors        | `lower-global-dtors`         | Converts global destructors to runtime calls                   | *Coming Soon* |
| Lower Atomic                    | `lower-atomic`               | Lowers atomic operations to non-atomic form                    | *Coming Soon* |
| Lower Invoke                    | `lower-invoke`               | Converts `invoke` instructions to calls for unwindless targets | *Coming Soon* |
| Lower Switch                    | `lower-switch`               | Converts switch statements to conditional branches             | *Coming Soon* |
| Reassociate Expressions         | `reassociate`                | Reassociates expressions to enable better constant folding     | *Coming Soon* |
| Code Sinking                    | `sink`                       | Moves computations to more optimal locations                   | *Coming Soon* |
| Relative Lookup Table Converter | `rel-lookup-table-converter` | Converts relative lookup tables                                | *Coming Soon* |
| Tail Call Elimination           | `tailcallelim`               | Eliminates tail calls to optimize recursion                    | *Coming Soon* |

---

###### 6️⃣ **Instruction-Level Optimizations**

| Pass Name                                               | Flag                     | Description                                       | Link          |
| ------------------------------------------------------- | ------------------------ | ------------------------------------------------- | ------------- |
| Instruction Combination                                 | `instcombine`            | Combines redundant or trivial instructions        | *Coming Soon* |
| Aggressive Instruction Combination                      | `aggressive-instcombine` | Combines complex expression patterns aggressively | *Coming Soon* |
| Interprocedural Sparse Conditional Constant Propagation | `ipsccp`                 | Propagates constants across function boundaries   | *Coming Soon* |
| Sparse Conditional Constant Propagation                 | `sccp`                   | Propagates known constants to eliminate dead code | *Coming Soon* |


---

##### Target-Specific Passes {#target-specific-passes}

Target-specific passes are tied to a backend, subtarget, or machine-level lowering pipeline. They adapt generic IR or machine code generation to the realities of a concrete architecture.

##### Utility Passes — Definition {#utility-passes}

Utility passes are compiler passes that **help developers inspect, debug, or verify LLVM IR**. They generally **do not perform optimizations** but provide tools for analysis, visualization, and debugging. Some are intended **only for internal or debugging purposes**.

⚡ **Key Point:** Utility passes are mostly diagnostic; some (like `deadarghaX0r`) are experimental or meant for LLVM developers and should not be used in production code.

| Pass Name                | Flag                 | Description                                                        | Link          |
| ------------------------ | -------------------- | ------------------------------------------------------------------ | ------------- |
| Dead Argument Hacking    | `deadarghaX0r`       | BUGPOINT USE ONLY; manipulates dead arguments (internal/debug use) | *Coming Soon* |
| Extract Basic Blocks     | `extract-blocks`     | Extracts basic blocks from a module (for bugpoint debugging)       | *Coming Soon* |
| Instruction Namer        | `instnamer`          | Assigns names to anonymous instructions                            | *Coming Soon* |
| Module Verifier          | `verify`             | Verifies IR for correctness and consistency                        | *Coming Soon* |
| View CFG                 | `view-cfg`           | Displays the Control Flow Graph of a function                      | *Coming Soon* |
| View CFG Only            | `view-cfg-only`      | Displays CFG without function bodies                               | *Coming Soon* |
| View Dominator Tree      | `view-dom`           | Displays the dominator tree of a function                          | *Coming Soon* |
| View Dominator Only      | `view-dom-only`      | Displays dominator tree structure only                             | *Coming Soon* |
| View Post-Dominator Tree | `view-post-dom`      | Displays post-dominator tree of a function                         | *Coming Soon* |
| View Post-Dominator Only | `view-post-dom-only` | Displays post-dominator tree structure only                        | *Coming Soon* |
| Transform Warning        | `transform-warning`  | Reports missed or forced transformations                           | *Coming Soon* |

---

##### Vector Optimizations {#vector-optimizations}

Vector-oriented passes focus on widening scalar work, reshaping loops, and improving SIMD utilization when the target architecture and dependency structure allow it.

---


## Closing Note

This list is a **high-level overview of the LLVM passes**, compiled using the official LLVM documentation as a reference. 
The goal here is not to explain every pass in depth, but to serve as a **central index** for developers, students, and compiler engineers
 who want to understand the structure of the LLVM pass ecosystem.

I will be publishing **individual deep-dive articles** for **each pass—one by one—from the earliest LLVM versions to the latest**.
Each dedicated article will cover:

* What the pass does
* Why it exists
* Internal algorithms
* Historical evolution (legacy PM → new PM)
* Example IR before/after
* Practical usage (`opt`/`clang` flags)
* Real GPU/CPU compiler impacts

All passes in this list will eventually be linked to their detailed standalone articles as they are published.

Stay tuned — the full pass-by-pass exploration of LLVM is coming soon. 

Explore More artilce
Follow continuation articles in this LLVM series on CompilerSutra.


<Tabs>
  <TabItem value="docs" label="📚 Documentation">
             - [CompilerSutra Home](https://compilersutra.com)
                - [CompilerSutra Homepage (Alt)](https://compilersutra.com/)
                - [Getting Started Guide](https://compilersutra.com/get-started)
                - [Skip to Content (Accessibility)](https://compilersutra.com#__docusaurus_skipToContent_fallback)


  </TabItem>

  <TabItem value="tutorials" label="📖 Tutorials & Guides">

        - [AI Documentation](https://compilersutra.com/docs/Ai)
        - [DSA Overview](https://compilersutra.com/docs/DSA/)
        - [DSA Detailed Guide](https://compilersutra.com/docs/DSA/DSA)
        - [MLIR Introduction](https://compilersutra.com/docs/MLIR/intro)
        - [TVM for Beginners](https://compilersutra.com/docs/tvm-for-beginners)
        - [Python Tutorial](https://compilersutra.com/docs/python/python_tutorial)
        - [C++ Tutorial](https://compilersutra.com/docs/c++/CppTutorial)
        - [C++ Main File Explained](https://compilersutra.com/docs/c++/c++_main_file)
        - [Compiler Design Basics](https://compilersutra.com/docs/compilers/compiler)
        - [OpenCL for GPU Programming](https://compilersutra.com/docs/gpu/opencl)
        - [LLVM Introduction](https://compilersutra.com/docs/llvm/intro-to-llvm)
        - [Introduction to Linux](https://compilersutra.com/docs/linux/intro_to_linux)

  </TabItem>

  <TabItem value="assessments" label="📝 Assessments">

        - [C++ MCQs](https://compilersutra.com/docs/mcq/cpp_mcqs)
        - [C++ Interview MCQs](https://compilersutra.com/docs/mcq/interview_question/cpp_interview_mcqs)

  </TabItem>

  <TabItem value="projects" label="🛠️ Projects">

            - [Project Documentation](https://compilersutra.com/docs/Project)
            - [Project Index](https://compilersutra.com/docs/project/)
            - [Graphics Pipeline Overview](https://compilersutra.com/docs/The_Graphic_Rendering_Pipeline)
            - [Graphic Rendering Pipeline (Alt)](https://compilersutra.com/docs/the_graphic_rendering_pipeline/)

  </TabItem>

  <TabItem value="resources" label="🌍 External Resources">

            - [LLVM Official Docs](https://llvm.org/docs/)
            - [Ask Any Question On Quora](https://compilersutra.quora.com)
            - [GitHub: FixIt Project](https://github.com/aabhinavg1/FixIt)
            - [GitHub Sponsors Page](https://github.com/sponsors/aabhinavg1)

  </TabItem>

  <TabItem value="social" label="📣 Social Media">

            - [🐦 Twitter - CompilerSutra](https://twitter.com/CompilerSutra)
            - [💼 LinkedIn - Abhinav](https://www.linkedin.com/in/abhinavcompilerllvm/)
            - [📺 YouTube - CompilerSutra](https://www.youtube.com/@compilersutra)
            - [💬 Join the CompilerSutra Discord for discussions](https://discord.com/invite/ty5xKCkyRP)

  </TabItem>
</Tabs>

