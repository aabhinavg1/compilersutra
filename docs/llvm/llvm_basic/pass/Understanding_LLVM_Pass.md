---
title: "Understanding LLVM Passes"
description: "Comprehensive guide to LLVM passes, including their types, functions, and how they work with LLVM Intermediate Representation (IR) to optimize and analyze programs."
keywords:
  - LLVM Passes
  - LLVM Intermediate Representation
  - Compiler Optimization
  - Code Transformation
  - LLVM Analysis
author: "Abhinav Tiwari"
tags:
  - LLVM
  - Compiler
  - Code Optimization
  -  Writing LLVM Pass
  - LLVM tutorial
  - LLVM tutorial on the pass
---

import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';

# Understanding LLVM Passes



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

## What is an LLVM Pass?

An **LLVM pass** is a small, self-contained module of code that is used to analyze or transform the LLVM Intermediate Representation (IR) of a program. LLVM IR is a low-level programming language used by the LLVM compiler to represent source code after it has been parsed but before it is translated into machine code. The role of passes is crucial because they help optimize, analyze, and transform this IR, improving the performance, efficiency, and quality of the compiled program.

## Why Do We Need LLVM Passes?

LLVM passes serve multiple purposes within the compiler:

### 1. **Optimization**
   - Optimization passes modify the IR to improve the performance of the program. These can include tasks like:
     - **Inlining functions**: Replacing function calls with the function body itself to reduce overhead.
     - **Dead code elimination**: Removing code that does not affect the program's output, such as unreachable code.
     - **Loop unrolling**: Unrolling loops to reduce iteration overhead.
   - The goal is to make the program run faster or use fewer resources.

### 2. **Analysis**
   - Analysis passes do not modify the IR but gather useful information about the program. These include:
     - **Control flow analysis**: Understanding the paths that the program takes during execution.
     - **Dependency analysis**: Finding dependencies between instructions, which is essential for parallelization.
     - **Profiling**: Gathering statistics to understand performance bottlenecks, memory usage, etc.

### 3. **Transformation**
   - Transformation passes modify the program's IR to make it more suitable for specific tasks or hardware. For example:
     - **Target-specific transformations**: Modifying the code to be more efficient on a specific processor or hardware platform.
     - **Intermediate representation transformations**: Converting the IR into a form that can be more easily optimized or further processed.

In essence, LLVM passes enable developers to fine-tune their programs by either enhancing performance, gathering insights, or transforming the code to meet specific requirements.

## Types of LLVM Passes

LLVM passes can operate at different levels of the IR. These levels correspond to different scopes or granularity in the program:

1. **Module Passes**: 
   - These passes work on the entire program module (which may consist of multiple functions or files). Module passes can make optimizations or analyses that affect the whole program.
   - **Example**: Dead Code Elimination (DCE) is a module pass that can remove functions or code segments that are never called or used in the program.

2. **Function Passes**: 
   - These passes focus on individual functions within the program. They optimize or analyze specific functions independently.
   - **Example**: Function inlining, where a function's body is inserted directly at the call site, eliminating the need for a function call.

3. **Loop Passes**: 
   - These passes specifically target loops in the program to optimize them. Loop optimization is critical for improving performance, as loops are often a source of inefficiency.
   - **Example**: Loop unrolling, which reduces the overhead of loop control by duplicating the loop body multiple times.

## How Does an LLVM Pass Work?

Each pass operates on the LLVM IR, which is a low-level intermediate representation of the program. The IR is structured as a graph of instructions, functions, and modules, and each pass can traverse and manipulate this graph to achieve its goal.

Here’s a simplified flow of how LLVM passes work:

1. **Frontend Generation:**
   - The process starts with the source code of a program (e.g., a C or C++ file). This source code is then processed by the **frontend** of the compiler (e.g., Clang). The frontend translates the source code into **LLVM IR**, which is a language-independent representation of the program.
   - Example:
     ```bash
     clang -emit-llvm -c program.c -o program.bc
     ```
     This command tells the compiler (Clang) to generate LLVM IR (`program.bc`) from the C source code (`program.c`).

2. **Pass Execution:**
   - The generated LLVM IR is passed through various optimization and analysis passes. Each pass modifies or analyzes the IR, depending on its purpose. This step can involve multiple passes in sequence, each applying specific transformations or gathering insights about the program.
   - Example:
     - An **optimization pass** could perform a transformation like function inlining.
     - An **analysis pass** could calculate how many times a certain function is called to identify potential bottlenecks.

3. **Backend Generation:**
   - After all passes have been applied to the IR, the final modified IR is then sent to the backend, where it is converted into machine code or another target format for execution.
   - This is the final step, where the optimized or transformed program is ready for execution on a specific machine or hardware platform.

## Example Workflow of LLVM Passes

Here’s how the whole process might look for a simple C program:

1. **Write a C Program:**
   ```c
   // program.c
   int add(int a, int b) {
       return a + b;
   }
   
   int main() {
       int result = add(5, 3);
       return 0;
   }
   ```

2. **Generate LLVM IR:**
   ```bash
   clang -emit-llvm -c program.c -o program.bc
   ```
   This command generates the LLVM IR from the C program.

3. **Run Passes on the IR:**
   ```bash
   opt -O2 program.bc -o optimized.bc
   ```
   This command runs optimization passes (level O2) on the IR and outputs the optimized version.

4. **Convert Back to Machine Code:**
   ```bash
   llc optimized.bc -o program.s
   ```
   This command converts the optimized IR to machine-specific assembly code.

## Diagram: LLVM Compilation Workflow

```
+-----------+        +------------+       +----------------+
| Frontend  | -----> | LLVM IR    | --->  | Optimized IR   |
| (e.g.,    |        |            |       |  (opt)         |
| Clang)    |        |            |       |                |
+-----------+        +------------+       +----------------+
                                                 |
                                                 v
                                             +----------------+
                                            |  Backend        |
                                            |  (e.g., llc)    |
                                            +----------------+
                                                 |
                                                 v
                                            +----------------+
                                            | Machine Code   |
                                            +----------------+
```

<LlvmSeoBooster topic="understanding-pass" />
