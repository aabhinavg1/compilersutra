---
title: CompilerSutra Live Plan
keywords:
- compilers
- compiler toolchain
- source code to binary
- compiler vs toolchain
- preprocessing compilation linking
- gcc clang toolchain
- llvm compiler
- llvm ir
- intermediate representation
- why ir is needed
- static single assignment
- ssa form
- control flow graph
- data flow analysis
- compiler frontend
- compiler backend
- instruction selection
- register allocation
- instruction scheduling
- compiler optimizations
- optimization passes
- dead code elimination
- common subexpression elimination
- loop optimizations
- inlining
- vectorization
- performance engineering
- performance modeling
- cpu compiler
- gpu compiler
- shader compiler
- vulkan compiler
- opencl compiler
- cuda compiler
- mlir
- mlir dialects
- multi level ir
- lowering pipeline
- mlir to llvm
- iree compiler
- onnx compiler
- machine learning compiler
- ai compiler
- ai accelerators
- npu compiler
- tpu compiler
- hardware accelerators
- heterogeneous compilation
- cpu gpu ai co design
- real world compiler systems
- compiler debugging
- reading compiler output
- understanding assembly
- beginner friendly compilers
- practical compiler learning
- compilersutra
---

# CompilerSutra Talks



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

**CompilerSutra Talks** is a structured, long-running technical talk series focused on **compilers, LLVM, MLIR, GPU compilers, and machine learning systems**.

The goal is simple:

> Make real-world compilers understandable without dumbing them down.

These talks are designed for:

* Software engineers who want to *truly* understand compilation
* Students preparing for compiler / systems interviews
* GPU, ML, and performance engineers
* Developers transitioning into **compiler or ML compiler roles**

---

## What Makes These Talks Different

Each talk is:

* **Concept-first** – we always start with *why* something exists
* **Toolchain-grounded** – everything is tied to real compilers (Clang, LLVM, MLIR)
* **Incremental** – each session builds strictly on previous ones
* **Industry-aligned** – topics map to how compilers are built and used today

No black-box explanations. No hand-wavy diagrams.



## Live Schedule

* **Live session:** Every Sunday
* **Start date:** 18 January 2026
* **Time:** 20:00 IST
* **Duration:** 60–90 minutes
* **Format:**

  * Conceptual explanation
  * Live examples (code / IR / diagrams)
  * Open Q&A

Each live session is later converted into:

* Recorded video
* Slides (PPT)
* A detailed written article


## How to Use This Roadmap

* Beginners should follow the phases **in order**
* Experienced engineers can jump directly to LLVM / MLIR / ML compiler phases
* Articles and recordings are self-contained but reference earlier concepts



## Phase 0: Absolute Foundations (New)

> For people who have coded but never thought about how systems work underneath.

<table>
<thead><tr><th>#</th><th>Topic</th><th>Video</th><th>Slides</th><th>Article</th></tr></thead>
<tbody>
<tr><td>0.1</td><td>Programs, Processes, and Executables: What Really Runs?</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>0.2</td><td>What Happens When You Run a Program?</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>0.3</td><td>Why Hardware Cannot Run Source Code Directly</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
</tbody>
</table>



## Phase 1: Compiler Toolchain Basics

> Everyone must start here no exceptions.

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Topic</th>
      <th>Video</th>
      <th>Slides</th>
      <th>Article</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>How Source Code Becomes a Binary (Compiler vs Toolchain)</td>
      <td>
        <a href="https://www.youtube.com/watch?v=abmavT3McUE&t=12s" target="_blank">link</a>
      </td>
      <td>
        <a href="/ppt/live/sourcetobinary.pdf" target="_blank">slide</a>
      </td>
      <td>Coming Soon</td>
    </tr>

    <tr>
      <td>2</td>
      <td>What Is a Toolchain? Preprocessor, Compiler, Assembler, Linker</td>
      <td>
        <a href="https://www.youtube.com/watch?v=abmavT3McUE&t=12s" target="_blank">link</a>
      </td>
      <td>
        <a href="/ppt/live/sourcetobinary.pdf" target="_blank">slide</a>
      </td>
      <td>
        <a href="https://www.compilersutra.com/docs/c++/basic/c++_compilers/" target="_blank">
         C++ Compilers
       </a>
      </td>
    </tr>
    <tr>
      <td>3</td>
      <td>What Is a Compiler? Semantic Equivalence Explained Simply</td>
      <td>
        <a href="https://www.youtube.com/watch?v=abmavT3McUE&t=12s" target="_blank">link</a>
      </td>
      <td>
        <a href="/ppt/live/sourcetobinary.pdf" target="_blank">slide</a>
      </td>
      <td>Coming Soon</td>
    </tr>

    <tr>
      <td>4</td>
      <td>Preprocessing Explained: Macros, Headers, and Conditionals</td>
      <td>
        <a href="https://www.youtube.com/watch?v=abmavT3McUE&t=12s" target="_blank">link</a>
      </td>
      <td>
        <a href="/ppt/live/sourcetobinary.pdf" target="_blank">slide</a>
      </td>
      <td>Coming Soon</td>
    </tr>

    <tr>
      <td>5</td>
      <td>Compilation Stages Using GCC and Clang (-E, -S, -c)</td>
      <td>
        <a href="https://www.youtube.com/watch?v=abmavT3McUE&t=12s" target="_blank">link</a>
      </td>
      <td>
        <a href="/ppt/live/sourcetobinary.pdf" target="_blank">slide</a>
      </td>
      <td>Coming Soon</td>
    </tr>

    <tr>
      <td>6</td>
      <td>Compiler Front Middle Back End </td>
      <td>
        <a href="https://www.youtube.com/watch?v=Pq8Vj6KtwVc" target="_blank">link</a>
      </td>
      <td>
        <a href="/ppt/live/compiler_inside_part1.pdf" target="_blank">slide</a>
      </td>
      <td>Coming Soon</td>
    </tr>
    
    <tr>
    <td>7</td>
    <td>Why Compiler Need IR</td>
    <td>
      <a href="https://www.youtube.com/live/LIJlop0-UFw" target="_blank">link</a>
    </td>
    <td>
      <a href="/ppt/live/compiler_inside_part1.pdf" target="_blank">slide</a>
    </td>
    <td>Coming Soon</td>
    </tr>

  
  </tbody>
</table>




## Phase 2: How Compilers Understand Code

> This phase explains *internal compiler thinking*.

<table>
<thead><tr><th>#</th><th>Topic</th><th>Video</th><th>Slides</th><th>Article</th></tr></thead>
<tbody>
<tr><td>6</td><td>Lexing and Parsing: Turning Text into Structure</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>7</td><td>AST, CFG, and IR: Different Views of the Same Program</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>8</td><td>Semantic Analysis: Types, Scopes, and Meaning</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>9</td><td>Error Detection vs Error Recovery in Compilers</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>10</td><td>Why Compilers Use Intermediate Representation (IR)</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
</tbody>
</table>


## Phase 3: SSA and Optimization Fundamentals

> Where compilers become *powerful*.

<table>
<thead><tr><th>#</th><th>Topic</th><th>Video</th><th>Slides</th><th>Article</th></tr></thead>
<tbody>
<tr><td>11</td><td>Life Without SSA: Why Naive IR Fails</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>12</td><td>Static Single Assignment (SSA) Explained Visually</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>13</td><td>Phi Nodes Explained Without Fear</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>14</td><td>Common Optimizations: DCE, CSE, LICM</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>15</td><td>Mem2Reg, SROA, and SSA Construction in LLVM</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
</tbody>
</table>


## Phase 4: LLVM in Practice

> Industry-grade compiler infrastructure.

<table>
<thead><tr><th>#</th><th>Topic</th><th>Video</th><th>Slides</th><th>Article</th></tr></thead>
<tbody>
<tr><td>16</td><td>LLVM Architecture: Frontend, Middle-end, Backend</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>17</td><td>Understanding LLVM IR by Reading Real Examples</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>18</td><td>LLVM Pass Pipeline: What Actually Runs and When</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>19</td><td>From LLVM IR to Machine Code</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>20</td><td>Limitations of LLVM IR</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
</tbody>
</table>


## Phase 5: MLIR and Multi-Level Compilation

> Modern compiler design for complex domains.

<table>
<thead><tr><th>#</th><th>Topic</th><th>Video</th><th>Slides</th><th>Article</th></tr></thead>
<tbody>
<tr><td>21</td><td>Why MLIR Was Created</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>22</td><td>MLIR Core Concepts: Operations, Regions, Dialects</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>23</td><td>Tensor, Linalg, Affine Dialects Explained</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>24</td><td>Lowering Strategy in MLIR</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>25</td><td>MLIR vs LLVM IR: Roles and Tradeoffs</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
</tbody>
</table>



## Phase 6: Machine Learning and AI Compilers

> Where compilers meet modern AI systems.

<table>
<thead><tr><th>#</th><th>Topic</th><th>Video</th><th>Slides</th><th>Article</th></tr></thead>
<tbody>
<tr><td>26</td><td>What Is an ML Compiler?</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>27</td><td>How ML Models Execute on Real Hardware</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>28</td><td>ONNX, XLA, TVM, IREE: Ecosystem Overview</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>29</td><td>Kernel Fusion, Scheduling, and Memory Planning</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>30</td><td>CPU vs GPU vs AI Accelerators: Compiler Perspective</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
</tbody>
</table>


## Phase 7: Advanced and Research Topics (Optional)

<table>
<thead><tr><th>#</th><th>Topic</th><th>Video</th><th>Slides</th><th>Article</th></tr></thead>
<tbody>
<tr><td>31</td><td>GPU Compilers: Threads, Warps, and Waves</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>32</td><td>Performance Modeling and Cost Models</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>33</td><td>Reading Compiler Research Papers Practically</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
<tr><td>34</td><td>How New Hardware Shapes Compiler Design</td><td>Coming Soon</td><td>Coming Soon</td><td>Coming Soon</td></tr>
</tbody>
</table>


## Recommended Starting Path

If you are new to compilers, start with:

1. Programs, Processes, and Executables
2. How Source Code Becomes a Binary
3. What Is a Toolchain?

Articles and recordings for these topics are released first.



## Long-Term Goal

By the end of this series, you should be able to:

* Read and understand compiler IR
* Reason about optimizations
* Understand ML and GPU compiler stacks
* Confidently approach compiler codebases and papers

This is not a crash course.

This is **compiler literacy**.


osc@compilersutra.com

## Linux Home

Return to [Linux Home](/docs/linux/) for the section map and command starter pack.
