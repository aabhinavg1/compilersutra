---
id: llvm_pass_timing
title: "How to See Time of Each Pass in LLVM"
description: "Learn how to analyze LLVM optimization pass timings stored in metadata files and why it is essential for performance tuning."
keywords:
  - LLVM pass timing
  - LLVM metadata analysis
  - LLVM optimization profiling
  - performance analysis
  - LLVM debugging
  - LLVM pass execution time
  - LLVM performance profiling
  - LLVM metadata timing analysis
  - LLVM optimization pass time tracking
  - LLVM IR pass timing
  - LLVM compiler performance analysis
  - LLVM debug metadata
  - LLVM profiling tools
  - Analyze LLVM pass timings
  - LLVM optimization benchmarking
tags:
  - LLVM
  - Performance
  - Profiling
  - Metadata
  - Optimization
  - Compiler Performance
  - LLVM Pass Manager
  - LLVM IR
  - Debugging
  - Benchmarking
  - Code Optimization
  - Clang
  - LLVM Development
  - Compiler Engineering
  - Open Source Compiler
  - Machine Learning in LLVM
  - Code Analysis
  - Static Analysis

---
import LlvmSeoBooster from '@site/src/components/llvm/LlvmSeoBooster';

# How to See Time of Each Pass in LLVM



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

## Why Analyze LLVM Pass Timings?

Think of a scenario where yor team is at an AI research lab, where your team work is to  ``optimizing deep learning models`` for a ``high-performance`` GPU accelerator. Your team is developing a custom compiler backend or want to improve already implemented backend whose aim is to generate optimized machine code for AI workloads, ensuring that models run efficiently on ``specialized hardware``.  
:::note  
If your **compiler stack is based on LLVM**, ``obviously `yes` it should be based oon LLVM if not please discuss with your team why not?`` `` analyzing **LLVM pass timings** becomes essential.  

### Why is it essential?  
- **Identifying Performance Bottlenecks**: LLVM optimization passes such as analysis or transform may take excessive time, impacting overall compilation speed.  
- **Reducing Unnecessary Optimizations**: Certain passes might not contribute significantly to AI workload performance and can be skipped or reordered.  
- **Improving Just-In-Time (JIT) Compilation**: Many AI workloads depend on JIT compilation, where slow LLVM passes can introduce runtime delays.  
- **Enhancing Hardware-Specific Optimizations**: GPUs and CPUs require different code transformations. Understanding pass timings helps fine-tune optimizations for the target hardware.  
- **Optimizing Large-Scale Deployments**: In large AI inference/training clusters, reducing compile times leads to faster model iteration and deployment cycles.  
:::

However, as your deep learning models grow in complexity—introducing new tensor operations, larger batch sizes, and mixed-precision computations—**if you dont want to optimize it the compilation times skyrocket**. A simple model update that once took seconds to compile now takes minutes or even hours. This bottleneck disrupts development cycles, slowing down research iterations and delaying model deployment.  

If your **compiler stack is based on LLVM**, analyzing **LLVM pass timings** becomes essential. Many AI compilers rely on LLVM for **both GPU and CPU optimizations**, including:  

- **MLIR (Multi-Level IR)**: Used in TensorFlow, PyTorch, and other AI frameworks to optimize tensor operations before lowering to LLVM IR.  
- **TVM**: A deep learning compiler stack that converts high-level models into efficient **GPU/CPU code** using LLVM as a backend.  
- **Triton**: A specialized AI compiler for writing high-performance GPU kernels with LLVM IR optimizations.  
- **LLVM AMDGPU & NVPTX Backends**: Used for generating optimized machine code for AMD and NVIDIA GPUs.  
- **XLA (Accelerated Linear Algebra)**: A compiler used in TensorFlow that lowers deep learning models to optimized LLVM-based execution on both CPUs and GPUs.  

### Why Does Compilation Time Matter?  

In **GPU and CPU computing for AI**, compiler performance is critical because:  

- **Kernel Compilation for GPUs**: AI workloads rely on optimized GPU kernels for matrix multiplications, convolutions, and activation functions. Slow compilation affects performance tuning and deployment.  
- **Just-In-Time (JIT) Compilation**: AI frameworks like TensorFlow XLA and PyTorch TorchScript rely on JIT compilers to optimize models at runtime. A slow LLVM backend can lead to excessive overhead during execution.  
- **Auto-Tuning and Code Generation**: AI compilers dynamically generate optimized GPU and CPU code. Analyzing LLVM pass timings helps identify inefficiencies and speed up compilation.  
- **CI/CD for AI Models**: Continuous training and deployment pipelines require frequent recompilation of AI models. Slow compilation disrupts the iteration cycle and reduces hardware utilization efficiency.  
- **Heterogeneous Computing**: AI workloads often switch between **CPU and GPU execution**, requiring efficient code generation for both architectures. LLVM pass analysis helps balance optimization strategies across different hardware.  

By profiling **LLVM pass timings**, engineers can pinpoint which optimization passes are slowing down GPU and CPU compilation. Redundant or expensive passes can be reordered, optimized, or disabled based on workload-specific needs. This leads to **faster model training, quicker inference optimizations, and overall better resource utilization** across both GPUs and CPUs.  

In the race for AI acceleration or where performance tuning is crutial their, every millisecond counts—not just in execution, but also in compilation. 🚀  
## Steps to Extract LLVM Pass Timings 

LLVM provides a way to track pass execution. Follow these steps to analyze it:

:::note
Let's take an example of opencl workload.
For the clang opencl support is their for more detail to know for the support of clang with opencl please visit [clang-opencl](https://clang.llvm.org/docs/OpenCLSupport.html)
The experiment was done on the mac 

```rust
Hardware:

    Hardware Overview:
      Chip: Apple M1 Pro
      Total Number of Cores: 10 (8 performance and 2 efficiency)
      Memory: 16 GB
      System Firmware Version: 10151.101.3
      OS Loader Version: 10151.101.3
```
```rust
Graphics/Displays:

    Apple M1 Pro:

      Chipset Model: Apple M1 Pro
      Type: GPU
      Bus: Built-In
      Total Number of Cores: 16
      Vendor: Apple (0x106b)
      Metal Support: Metal 3
      Displays:
        Color LCD:
          Display Type: Built-in Liquid Retina XDR Display
          Resolution: 3024 x 1964 Retina
          Main Display: Yes
          Mirror: Off
          Online: Yes
          Automatically Adjust Brightness: Yes
          Connection Type: Internal
```
```rust
clang --version
Homebrew Clang Version: 19.1.6
Target: arm64-apple-darwin23.4.0
Thread Model: posix
Installed Directory: /opt/homebrew/Cellar/llvm/19.1.6/bin
Configuration File: /opt/homebrew/etc/clang/arm64-apple-darwin23.cfg
```
:::

The testcase for which we are calculating the timing is 
```cpp
__kernel void matmul(
    __global float* A,
    __global float* B,
    __global float* C,
    int N) {

    int row = get_global_id(0);
    int col = get_global_id(1);

    float sum = 0.0;
    for (int k = 0; k < N; k++) {
        sum += A[row * N + k] * B[k * N + col];
    }
    C[row * N + col] = sum;
}
```
### 1. Enable Pass Timing from clang 
When running ``clang`` just include the flag as 

```rust
clang -Xclang  -cl-std=CL2.0 -O2 -emit-llvm -S ../test/matrix_mul.cl -o matrix_mul.ll -ftime-report
```
| **Flag** | **Explanation** |
|----------|----------------|
| `-Xclang` | Passes an argument directly to the Clang compiler frontend. |
| `-cl-std=CL2.0` | Specifies OpenCL 2.0 as the standard for compilation. |
| `-O2` | Enables level 2 optimizations for performance. |
| `-emit-llvm` | Generates LLVM IR instead of machine code. |
| `-S` | Produces an LLVM IR file instead of a binary output. |
| `-ftime-report` | Reports the time taken by each compiler pass. |

The output you will get will be in the form
```rust
| **User Time** | **System Time** | **User+System** | **Wall Time** | **Instr** | **Pass Name** | **Explanation** |
|-------------|---------------|----------------|--------------|----------|--------------|----------------|
| 0.0001 (2.7%) | 0.0005 (7.0%) | 0.0006 (6.1%) | 0.0028 (7.8%) | 2844087 | `SROAPass` | Scalar Replacement of Aggregates (SROA) replaces aggregate types (like structs) with individual scalar values to improve memory access. |
| 0.0001 (2.9%) | 0.0005 (7.4%) | 0.0006 (6.4%) | 0.0024 (6.7%) | 2920150 | `IPSCCPPass` | Interprocedural Sparse Conditional Constant Propagation (IPSCCP) optimizes constants across function calls. |
| 0.0003 (13.0%) | 0.0005 (6.5%) | 0.0007 (7.9%) | 0.0024 (6.6%) | 4444581 | `SLPVectorizerPass` | Superword-Level Parallelism (SLP) vectorizes independent instructions that can be packed into vector operations. |
| 0.0000 (1.8%) | 0.0003 (4.2%) | 0.0003 (3.7%) | 0.0014 (3.9%) | 1680303 | `EarlyCSEPass` | Early Common Subexpression Elimination (CSE) removes redundant calculations early in the pipeline. |
| 0.0000 (1.1%) | 0.0004 (5.2%) | 0.0004 (4.3%) | 0.0014 (3.8%) | 1858791 | `LoopIdiomRecognizePass` | Recognizes and optimizes common loop patterns (idioms), such as memset and memcpy. |
| 0.0002 (8.7%) | 0.0003 (3.7%) | 0.0005 (4.8%) | 0.0013 (3.7%) | 2433381 | `IndVarSimplifyPass` | Simplifies induction variables in loops to enable further loop optimizations. |
| 0.0000 (0.9%) | 0.0002 (2.7%) | 0.0002 (2.3%) | 0.0013 (3.6%) | 1160931 | `ConstraintEliminationPass` | Eliminates unnecessary constraints in expressions to simplify computations. |
| 0.0001 (2.6%) | 0.0002 (2.2%) | 0.0002 (2.3%) | 0.0009 (2.4%) | 1111886 | `GVNPass` | Global Value Numbering (GVN) eliminates redundant calculations by reusing computed values. |
| 0.0000 (1.8%) | 0.0002 (2.7%) | 0.0002 (2.5%) | 0.0008 (2.3%) | 1099930 | `LoopRotatePass` | Rotates loops to expose more optimization opportunities, often improving instruction scheduling. |
| 0.0001 (3.7%) | 0.0002 (2.9%) | 0.0003 (3.0%) | 0.0008 (2.2%) | 1411212 | `PrintModulePass` | Debugging pass that prints the LLVM module's current state after optimizations. |
| 0.0000 (1.0%) | 0.0001 (1.3%) | 0.0001 (1.2%) | 0.0005 (1.4%) | 567768 | `LICMPass` | Loop-Invariant Code Motion (LICM) moves computations out of loops when they don't change inside the loop. |
| 0.0000 (1.2%) | 0.0001 (1.4%) | 0.0001 (1.4%) | 0.0005 (1.4%) | 695560 | `InferFunctionAttrsPass` | Infers function attributes to improve function inlining and optimizations. |
| 0.0000 (0.7%) | 0.0001 (0.8%) | 0.0001 (0.7%) | 0.0004 (1.2%) | 425165 | `LCSSAPass` | Converts loops into a form where all loop variables are in SSA (Static Single Assignment) form. |
| 0.0000 (1.1%) | 0.0001 (0.9%) | 0.0001 (0.9%) | 0.0003 (0.9%) | 481102 | `PostOrderFunctionAttrsPass` | Analyzes functions to determine their attributes based on post-order traversal. |
| 0.0000 (0.5%) | 0.0000 (0.6%) | 0.0001 (0.6%) | 0.0003 (0.9%) | 293810 | `RequireAnalysisPass<llvm::GlobalsAA, llvm::Module, llvm::AnalysisManager<Module>>` | Requires alias analysis for global variables, helping optimizations that rely on memory access patterns. |
```
:::tip Summary of LLVM Pass Profiling
- The **most time-consuming pass** is `SimplifyCFGPass`, taking **16.1% of the total wall time**. This is expected, as control flow simplifications often involve restructuring large parts of the IR.  
- `InstCombinePass` also consumes significant time (**13.9% wall time**), as it aggressively removes redundant operations and simplifies expressions.  
- `LoopVectorizePass` and `SLPVectorizerPass` show notable execution time, highlighting the compiler’s efforts in **loop optimizations** and **instruction-level parallelism**.  
- Passes like `PrintModulePass` are used mainly for **debugging and analysis**, rather than direct optimization.  
- The total compilation time of **0.0095 seconds** suggests an efficient optimization pipeline, with most passes executing quickly.  

### 🔍 Insights:
- Identifying the most **expensive passes** helps in tuning LLVM optimizations for performance improvements.  
- Depending on the **target architecture and workload**, tweaking pass order or selectively disabling costly passes may enhance compilation efficiency.  
:::

_______________________________________________________________________________________
### 2. Enable Pass Timing from opt 

When running ``opt`` just include the flag as 

```rust
opt -O2 -time-passes -O2  matrix_mul.ll
```
```rust
| Flag             | Description |
|-----------------|-------------|
| `opt`           | The LLVM optimizer tool, used to run optimization passes on LLVM IR files. |
| `-O2`           | Optimization level 2: Enables a set of optimizations that balance performance and compilation time. |
| `-time-passes`  | Reports the time taken by each optimization pass. Useful for performance profiling. |
| `matrix_mul.ll` | The input LLVM IR file representing the matrix multiplication code. |
```

:::note 
if you are not aware of opt please visit [opt](https://llvm.org/docs/CommandGuide/opt.html)
:::
The output of the ``opt`` will be similar to as ``clang`` 
This report provides a breakdown of the execution time spent on various LLVM optimization passes when running `opt -O2 -time-passes`.

## Summary
this is similar to the ``clang``

- **Total Execution Time:** 0.0121 seconds (0.0308 wall clock)
- **User Time:** CPU time spent in user mode.
- **System Time:** CPU time spent in system (kernel) mode.
- **User+System:** Combined user and system time.
- **Wall Time:** Actual elapsed time.
- **Instr:** Number of instructions processed.
- **Name:** Name of the LLVM pass executed.

## Detailed Breakdown

| **Pass Name**                     | **User Time (%)** | **System Time (%)** | **User+System (%)** | **Wall Time (%)** | **Instructions** |
|-----------------------------------|-----------------|-----------------|----------------|----------------|--------------|
| **InstCombinePass**               | 11.7%           | 14.5%           | 14.0%          | 14.6%          | 6,111,704    |
| **SimplifyCFGPass**               | 16.3%           | 12.4%           | 13.2%          | 13.7%          | 7,170,748    |
| **LoopVectorizePass**             | 9.2%            | 10.1%           | 9.9%           | 10.0%          | 4,033,901    |
| **SROAPass**                      | 2.4%            | 7.1%            | 6.2%           | 8.4%           | 2,550,940    |
| **IPSCCPPass**                    | 2.8%            | 7.1%            | 6.2%           | 7.5%           | 2,473,221    |
| **SLPVectorizerPass**             | 11.4%           | 6.4%            | 7.5%           | 7.3%           | 4,194,702    |
| **EarlyCSEPass**                  | 1.9%            | 4.5%            | 4.0%           | 4.9%           | 1,576,514    |
| **LoopIdiomRecognizePass**        | 1.3%            | 5.4%            | 4.6%           | 4.5%           | 1,750,246    |
| **IndVarSimplifyPass**            | 8.1%            | 3.7%            | 4.6%           | 3.4%           | 2,147,609    |
| **ConstraintEliminationPass**     | 1.2%            | 4.5%            | 3.8%           | 3.2%           | 916,064      |
| **PrintModulePass**               | 4.2%            | 3.4%            | 3.6%           | 3.0%           | 1,396,790    |
| **LoopRotatePass**                | 2.2%            | 2.8%            | 2.6%           | 2.0%           | 930,240      |
| **GVNPass**                       | 2.9%            | 2.0%            | 2.2%           | 1.7%           | 885,388      |
| **LICMPass**                      | 1.4%            | 1.3%            | 1.3%           | 1.0%           | 468,582      |
| **CorrelatedValuePropagationPass**| 1.5%            | 1.3%            | 1.4%           | 1.0%           | 562,717      |
| **ReassociatePass**               | 0.8%            | 1.0%            | 1.0%           | 0.9%           | 381,469      |
| **WarnMissedTransformationsPass** | 0.2%            | 0.3%            | 0.2%           | 0.9%           | 122,316      |
| **PostOrderFunctionAttrsPass**    | 1.3%            | 0.8%            | 0.9%           | 0.8%           | 423,211      |
| **ADCEPass**                      | 0.6%            | 1.1%            | 1.0%           | 0.8%           | 378,686      |
| **SimpleLoopUnswitchPass**        | 0.2%            | 0.5%            | 0.4%           | 0.8%           | 180,387      |
| **MergedLoadStoreMotionPass**     | 0.0%            | 0.3%            | 0.2%           | 0.8%           | 116,930      |
| **GlobalsAA Analysis Pass**       | 0.6%            | 0.5%            | 0.5%           | 0.8%           | 238,467      |

:::tip Summary of LLVM Pass Profiling

1. **InstCombinePass (14.6% wall time, 6.1M instructions)**  
   - A significant portion of the execution time is spent in the `InstCombinePass`, which simplifies and combines instructions.  
2. **SimplifyCFGPass (13.7% wall time, 7.1M instructions)**  
   - Another major contributor, focusing on simplifying control flow graphs.
3. **Vectorization Passes (`LoopVectorizePass` and `SLPVectorizerPass`)**  
   - Combined, these take about **17.3% of wall time**, indicating that vectorization is a critical part of the optimization process.
4. **SROA and IPSCCP**  
   - **SROAPass** (Scalar Replacement of Aggregates) and **IPSCCPPass** (Interprocedural Sparse Conditional Constant Propagation) contribute to **14.7%** of total execution time.
5. **Smaller Passes**  
   - Passes like **GVNPass (Global Value Numbering)** and **LICMPass (Loop-Invariant Code Motion)** have minimal execution times but still contribute to overall optimization.
:::

______________________________________________________________________________________
### 3. Enable Pass Timing from llc 

To know more about [llc](https://llvm.org/docs/CommandGuide/llc.html)

Since `llc` does not support the OpenCL backend directly, we first convert our OpenCL C code to AMD LLVM IR using `clang`:  
```rust
bin/clang -Xclang -finclude-default-header -Dcl_clang_storage_class_specifiers \
    -I /System/Library/Frameworks/OpenCL.framework/Headers \
    -framework OpenCL \
    -target amdgcn-amd-amdhsa -S -emit-llvm -O2 ../test/matrix_mul.cl -o matrix_mul.ll -nogpulib
```
| Flag | Description |
|------|------------|
| `-Xclang` | Passes the following argument directly to the Clang frontend. |
| `-finclude-default-header` | Ensures OpenCL built-in function headers are included automatically. |
| `-Dcl_clang_storage_class_specifiers` | Defines a macro to enable Clang-specific storage class specifiers for OpenCL. |
| `-I /System/Library/Frameworks/OpenCL.framework/Headers` | Specifies the include path for OpenCL headers. |
| `-framework OpenCL` | Links the OpenCL framework on macOS. |
| `-target amdgcn-amd-amdhsa` | Sets the target architecture to AMD GPU (GCN) for ROCm/HSA execution. |
| `-S` | Outputs assembly instead of an object file. |
| `-emit-llvm` | Generates LLVM IR rather than a machine-specific binary. |
| `-O2` | Optimizes the output at level 2 for a balance of performance and compilation time. |
| `-nogpulib` | Prevents linking with GPU runtime libraries, useful for standalone OpenCL kernel compilation. |

The llc output will be similar to clang and opt but more backend passes name you can see as

| User Time (s) | System Time (s) | User+System (s) | Wall Time (s) | Instructions | Name |
|--------------|---------------|----------------|--------------|-------------|--------------------------|
| 0.0007 (18.9%) | 0.0035 (29.8%) | 0.0042 (27.3%) | 0.0133 (31.0%) | 18,864,828 | AMDGPU DAG->DAG Pattern Instruction Selection |
| 0.0003 (8.4%) | 0.0016 (13.5%) | 0.0019 (12.3%) | 0.0067 (15.7%) | 7,702,242 | Expand large div/rem |
| 0.0001 (3.2%) | 0.0007 (6.2%) | 0.0008 (5.5%) | 0.0025 (5.9%) | 3,819,517 | AMDGPU Assembly Printer |
| 0.0001 (1.6%) | 0.0007 (5.6%) | 0.0007 (4.7%) | 0.0021 (5.0%) | 2,605,954 | Straight line strength reduction |
| 0.0001 (1.8%) | 0.0005 (4.1%) | 0.0006 (3.6%) | 0.0021 (4.9%) | 2,640,178 | Finalize ISel and expand pseudo-instructions |
| 0.0000 (1.1%) | 0.0005 (4.3%) | 0.0005 (3.6%) | 0.0018 (4.2%) | 2,039,671 | Early CSE |
| 0.0002 (4.9%) | 0.0004 (3.5%) | 0.0006 (3.8%) | 0.0015 (3.6%) | 2,319,550 | Loop Strength Reduction |
| 0.0000 (0.6%) | 0.0002 (1.4%) | 0.0002 (1.2%) | 0.0009 (2.1%) | 879,917 | SI Fix SGPR copies |
| 0.0000 (0.4%) | 0.0001 (1.3%) | 0.0002 (1.1%) | 0.0007 (1.7%) | 753,333 | Branch relaxation pass |
| 0.0001 (2.1%) | 0.0002 (1.9%) | 0.0003 (1.9%) | 0.0007 (1.5%) | 1,093,349 | Nary reassociation |
| 0.0000 (1.4%) | 0.0002 (2.1%) | 0.0003 (1.9%) | 0.0006 (1.4%) | 994,486 | CodeGen Prepare |
| 0.0000 (0.3%) | 0.0001 (1.0%) | 0.0001 (0.9%) | 0.0005 (1.2%) | 621,775 | Control Flow Optimizer |
| 0.0000 (0.6%) | 0.0001 (1.2%) | 0.0002 (1.1%) | 0.0005 (1.1%) | 617,916 | AMDGPU Lower Kernel Arguments |
| 0.0000 (0.3%) | 0.0001 (1.0%) | 0.0001 (0.9%) | 0.0004 (1.0%) | 471,760 | Uniformity Analysis |
| 0.0002 (6.6%) | 0.0002 (1.3%) | 0.0004 (2.5%) | 0.0004 (0.9%) | 2,128,605 | Machine Instruction Scheduler |
| 0.0000 (1.0%) | 0.0001 (0.8%) | 0.0001 (0.8%) | 0.0004 (0.9%) | 553,649 | Structurize control flow |
| 0.0000 (0.1%) | 0.0001 (0.7%) | 0.0001 (0.6%) | 0.0004 (0.8%) | 317,526 | AMDGPU IR optimizations |
| 0.0000 (0.2%) | 0.0001 (0.6%) | 0.0001 (0.5%) | 0.0004 (0.8%) | 299,831 | Scalar Evolution Analysis |
| 0.0000 (0.2%) | 0.0001 (0.9%) | 0.0001 (0.7%) | 0.0003 (0.8%) | 454,859 | Natural Loop Information |
| 0.0001 (2.3%) | 0.0001 (0.8%) | 0.0002 (1.2%) | 0.0003 (0.6%) | 914,293 | Greedy Register Allocator |
| 0.0000 (1.2%) | 0.0001 (0.5%) | 0.0001 (0.6%) | 0.0003 (0.6%) | 592,858 | Live Interval Analysis |
| 0.0001 (1.8%) | 0.0001 (0.6%) | 0.0001 (0.8%) | 0.0002 (0.6%) | 652,390 | Register Coalescer |
| 0.0002 (5.8%) | 0.0000 (0.3%) | 0.0002 (1.5%) | 0.0002 (0.5%) | 1,730,634 | Live Variable Analysis |
| 0.0000 (0.1%) | 0.0000 (0.2%) | 0.0000 (0.2%) | 0.0002 (0.5%) | 128,437 | Fixup each natural loop to have a single exit block |


:::tip Summary of LLVM Pass Profiling

## Execution Overview
- **Total Execution Time:** 0.0153 seconds (0.0428 wall clock)
- **Major contributors to execution time:**
  - DAG->DAG Pattern Instruction Selection
  - Expand large div/rem
  - Assembly Printing
  - Strength Reduction
  - Finalize ISel & Expand Pseudo-Instructions

## Key Passes & Their Impact

| Pass Name | Impact Summary |
|-----------|---------------|
| **DAG->DAG Pattern Instruction Selection** | Converts LLVM DAG nodes to machine instructions, optimizing instruction patterns. |
| **Expand Large Div/Rem** | Replaces costly division/remainder operations with optimized sequences, improving performance. |
| **AMDGPU Assembly Printer** | Converts intermediate representation into AMDGPU assembly for execution. |
| **Straight Line Strength Reduction** | Optimizes arithmetic expressions to use fewer instructions and registers. |
| **Finalize ISel & Expand Pseudo-Instructions** | Replaces pseudo-instructions with real machine instructions before register allocation. |
| **Early CSE (Common Subexpression Elimination)** | Eliminates redundant calculations, reducing computation overhead. |
| **Loop Strength Reduction** | Transforms expensive loop operations into simpler ones, improving efficiency. |
| **SI Fix SGPR Copies** | Ensures correct usage of scalar registers on AMD GPUs, avoiding performance penalties. |
| **Branch Relaxation** | Optimizes jump instructions to reduce unnecessary control flow overhead. |
| **Nary Reassociation** | Reorders associative operations to improve numerical stability and performance. |
| **CodeGen Prepare** | Prepares IR for efficient code generation by performing various optimizations. |
| **Control Flow Optimizer** | Simplifies control flow graphs to enhance performance. |
| **Lower Kernel Arguments** | Optimizes kernel argument handling for efficient memory access. |
| **Uniformity Analysis** | Determines if operations can be optimized for parallel execution. |
| **Machine Instruction Scheduler** | Schedules instructions for better execution efficiency. |
| **Structurize Control Flow** | Converts irregular control flow into structured constructs for better GPU execution. |
| **IR Optimizations** | Applies various AMDGPU-specific optimizations to improve performance. |
| **Scalar Evolution Analysis** | Analyzes loop behavior to assist in optimization. |
| **Greedy Register Allocator** | Assigns registers efficiently to minimize spills. |
| **Live Interval Analysis** | Tracks variable lifetimes to optimize register usage. |
| **Register Coalescer** | Reduces register move instructions to optimize execution. |
| **Live Variable Analysis** | Determines which variables are used at different points to aid optimization. |
| **Loop Exit Block Fixup** | Ensures loops have a single exit block, simplifying optimization. |

These LLVM passes collectively improve execution efficiency by optimizing instruction selection, register allocation, and control flow.

:::

### Summary of LLVM Pass Profiling

 Summary of LLVM Pass Profiling

## Execution Overview
- **Total Execution Time:** 0.0153 seconds (0.0428 wall clock)
- **Major contributors to execution time:**
  - DAG->DAG Pattern Instruction Selection
  - Expand large div/rem
  - Assembly Printing
  - Strength Reduction
  - Finalize ISel & Expand Pseudo-Instructions

## Key Passes & Their Impact

| Pass Name | Impact Summary |
|-----------|---------------|
| **DAG->DAG Pattern Instruction Selection** | Converts LLVM DAG nodes to machine instructions, optimizing instruction patterns. |
| **Expand Large Div/Rem** | Replaces costly division/remainder operations with optimized sequences, improving performance. |
| **AMDGPU Assembly Printer** | Converts intermediate representation into AMDGPU assembly for execution. |
| **Straight Line Strength Reduction** | Optimizes arithmetic expressions to use fewer instructions and registers. |
| **Finalize ISel & Expand Pseudo-Instructions** | Replaces pseudo-instructions with real machine instructions before register allocation. |
| **Early CSE (Common Subexpression Elimination)** | Eliminates redundant calculations, reducing computation overhead. |
| **Loop Strength Reduction** | Transforms expensive loop operations into simpler ones, improving efficiency. |
| **SI Fix SGPR Copies** | Ensures correct usage of scalar registers on AMD GPUs, avoiding performance penalties. |
| **Branch Relaxation** | Optimizes jump instructions to reduce unnecessary control flow overhead. |
| **Nary Reassociation** | Reorders associative operations to improve numerical stability and performance. |
| **CodeGen Prepare** | Prepares IR for efficient code generation by performing various optimizations. |
| **Control Flow Optimizer** | Simplifies control flow graphs to enhance performance. |
| **Lower Kernel Arguments** | Optimizes kernel argument handling for efficient memory access. |
| **Uniformity Analysis** | Determines if operations can be optimized for parallel execution. |
| **Machine Instruction Scheduler** | Schedules instructions for better execution efficiency. |
| **Structurize Control Flow** | Converts irregular control flow into structured constructs for better GPU execution. |
| **IR Optimizations** | Applies various AMDGPU-specific optimizations to improve performance. |
| **Scalar Evolution Analysis** | Analyzes loop behavior to assist in optimization. |
| **Greedy Register Allocator** | Assigns registers efficiently to minimize spills. |
| **Live Interval Analysis** | Tracks variable lifetimes to optimize register usage. |
| **Register Coalescer** | Reduces register move instructions to optimize execution. |
| **Live Variable Analysis** | Determines which variables are used at different points to aid optimization. |
| **Loop Exit Block Fixup** | Ensures loops have a single exit block, simplifying optimization. |

## Comparison of `opt`, `clang`, and `llc`

| Tool | Purpose | Usage |
|------|---------|-------|
| **opt** | Optimizes LLVM IR | `opt -O3 input.ll -o optimized.ll` |
| **clang** | Compiles high-level source code to LLVM IR and machine code | `clang -O3 input.c -S -emit-llvm -o output.ll` |
| **llc** | Converts LLVM IR to assembly | `llc input.ll -o output.s` |

## Comparison of `-time-passes` Behavior Across Tools

| Tool  | Behavior with `-time-passes` |
|-------|-----------------------------|
| **opt**  | Reports optimization passes and their execution time at the LLVM IR level. |
| **llc**  | Reports lower-level code generation passes, including instruction selection and register allocation. |
| **clang** | Typically uses `-ftime-report` instead for a broader view of frontend and backend compilation times. |

### Conclusion

LLVM passes play a crucial role in optimizing code for execution, especially for GPU architectures. By leveraging optimizations such as **instruction selection, register allocation, and control flow analysis**, the compiler can produce highly efficient machine code. 

- **`opt`** is useful for analyzing and applying optimizations at the LLVM IR level.
- **`clang`** provides a seamless front-end that generates LLVM IR from source code.
- **`llc`** translates the optimized LLVM IR into assembly, fine-tuning it for the target architecture.

Understanding these tools and LLVM passes helps in improving code performance and ensuring efficient execution on different hardware platforms.

If you have any queries, mail to: [info@compilersutra.com](mailto:info@compilersutra.com)

<LlvmSeoBooster topic="pass-timing" />






