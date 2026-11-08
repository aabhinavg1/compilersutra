---
title: "SIMD Basics and Vector Registers"
description: "How vector registers, SIMD instructions, alignment constraints, scalar remainder loops, and cross-iteration loop dependencies dictate compiler auto-vectorization."
keywords:
  - SIMD basics
  - vector registers
  - auto-vectorization
  - vector width
  - loop unrolling
  - remainder loop
  - epilogue loop
  - scalar epilogue
  - alignment requirements
  - unaligned memory access
  - gather store
  - scatter store
displayed_sidebar: coasidebar
slug: /coa/simd-basics
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SIMD Basics and Vector Registers

Vector registers allow a single instruction to operate on multiple uniform data elements packed into wide architectural storage. Compiler writers rely on this data-level parallelism to reduce instruction count and maximize ALU throughput, but hardware constraints on memory alignment, non-contiguous indexing, and loop-carried data dependencies frequently block automatic vectorization.

:::tip Read these first
- [/docs/coa/types_of_execution](/docs/coa/types_of_execution) — Sequential, out-of-order, speculative, SIMD, and multicore execution models.
- [/docs/coa/isa-and-the-compiler-backend](/docs/coa/isa-and-the-compiler-backend) — How ISA contracts dictate architectural register files and instruction selection.
:::

:::important What you should leave with
- How vector registers pack multiple scalar lanes into a single architectural register and how wide operations alter the CPU performance equation.
- Why modern compilers must generate prologue, vector, and epilogue loops (strip mining) to handle unknown loop trip counts and pointer alignment.
- How memory access patterns (contiguous vs. gather/scatter) determine whether vectorization yields a net performance win under the compiler's cost model.
- Why loop-carried dependencies prevent vector execution without cross-iteration transformations or reductions.
:::

:::caution Who this is not for
If you are still developing intuition for basic instruction flow, pipeline hazard management, or standard register files, read [/docs/coa/basic_terminology_in_coa](/docs/coa/basic_terminology_in_coa) and [/docs/coa/registers-and-addressing-modes](/docs/coa/registers-and-addressing-modes) first.
:::

:::note
This lesson focuses on fixed-width single-instruction, multiple-data (SIMD) hardware and vector execution primitives. Predicated vector-lengthagnostic architectures (such as ARM SVE or RISC-V Vector) share identical data-dependency constraints but alter how remainder loops are structured at the ISA layer.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [The SIMD Mechanism](#the-simd-mechanism)
2. [Strip Mining: Scalar Epilogues and Alignment](#strip-mining-scalar-epilogues-and-alignment)
3. [A Worked Example: Auto-Vectorization and Epilogue Loops](#a-worked-example-auto-vectorization-and-epilogue-loops)
4. [Why Auto-Vectorization Fails](#why-auto-vectorization-fails)
5. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
6. [Common Misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## The SIMD Mechanism

Single Instruction, Multiple Data (SIMD) is an architectural model where a single instruction operates concurrently on an array of data values called *lanes*. Instead of executing $N$ distinct scalar instructions to process $N$ array elements, the ISA provides wide vector registers (for example, 128-bit, 256-bit, or 512-bit wide) and instructions that execute identical operations across all lanes in parallel.

Architecturally, the software contract sees a flat wide register partitioned into elements of a specific size (such as eight 32-bit integers in a 256-bit register). Microarchitecturally, the underlying execution units may process all lanes in a single clock cycle or split wide registers across narrower functional units over multiple cycles depending on internal bus widths.

```
Scalar Register (32-bit):
[         Value 0         ]

Vector Register (256-bit wide, 8 x 32-bit elements):
[ Lane 7 ][ Lane 6 ][ Lane 5 ][ Lane 4 ][ Lane 3 ][ Lane 2 ][ Lane 1 ][ Lane 0 ]
```

The table below summarizes hardware behavior across common memory and compute situations, along with the corresponding transformations a compiler backend must apply.

| Situation | Hardware Behavior | Compiler Transformation |
| :--- | :--- | :--- |
| **Contiguous Array Operations** | Loads/stores full vector width in a single memory transaction. | Emits vector load/store instructions using scalar base address plus vector byte stride. |
| **Unaligned Memory Access** | May cross cache lines or page boundaries, triggering performance penalties or alignment faults. | Generates runtime alignment checks, peel loops (prologues), or unaligned load intrinsics. |
| **Non-Contiguous Indexing (Strided/Gather)** | Requires multiple scalar reads or specialized gather hardware units that serialize cache accesses. | Evaluates cost model; falls back to scalar loops or emits gather/scatter instructions if profitable. |
| **Branching inside Loop Body** | Hardware cannot diverge individual lanes; all lanes execute the same instruction stream. | Applies mask-based vectorization (predication), executing both branch paths and selecting results via bitmasks. |

---

## Strip Mining: Scalar Epilogues and Alignment

When a program loops over $N$ scalar iterations, the compiler must map these iterations onto vector execution units of width $VF$ (Vectorization Factor, representing the number of lanes). Because $N$ is frequently unknown at compile time or is not an exact multiple of $VF$, the compiler uses a technique called **strip mining**.

The compiler divides execution into three potential stages:
1. **Prologue Loop (Peel Loop):** Processes initial scalar iterations until the base memory addresses reach the target hardware vector alignment boundary (e.g., a 32-byte boundary).
2. **Vector Loop:** Processes chunks of $VF$ elements per instruction using wide SIMD operations.
3. **Epilogue Loop (Remainder Loop):** Processes the remaining $N \pmod\{VF\}$ scalar iterations that cannot fill a complete vector register.

![Diagram showing loop strip mining into prologue, vector main body, and scalar epilogue loop.](/img/coa/simd-basics.svg)

*Diagram: Strip mining splits a scalar loop of arbitrary iteration count into an optional alignment prologue, a vectorized main loop processing full SIMD register widths, and a scalar epilogue handling leftover iterations.*

The choice of memory access strategy impacts performance. Compilers evaluate pointer alignment and stride mechanics when deciding how to structure vector memory loops.

<Tabs>
<TabItem value="aligned" label="Aligned Access" default>
    When memory addresses are guaranteed to align with the hardware vector width (for example, 32-byte alignment for 256-bit registers), the load and store units complete memory transfers with minimal cache-line splits. The compiler emits explicit aligned memory instructions, omitting runtime alignment checks and peel loops.
</TabItem>
<TabItem value="unaligned" label="Unaligned Access">
    Modern processor ISAs generally support unaligned vector loads and stores, but crossing a 64-byte cache line boundary can double memory access latency for that operation. When pointers cannot be proven aligned, the compiler either emits unaligned instructions directly or generates a scalar peel loop that steps forward until the primary pointer reaches a aligned boundary.
</TabItem>
<TabItem value="strided" label="Strided / Non-Contiguous Access">
    When access strides exceed 1 element (e.g., reading every second or fourth element), contiguous vector loads cannot be used directly. The compiler must issue multiple scalar loads followed by register permutation (shuffle/pack) instructions, or issue explicit hardware gather instructions. This overhead frequently negates the performance advantage of vector arithmetic.
</TabItem>
</Tabs>

:::tip Note
Alignment requirements affect memory pipeline efficiency, not execution unit arithmetic throughput. Executing a SIMD vector add on unaligned registers takes the same ALU latency as on aligned registers; the penalty occurs entirely in the load/store pipeline when crossing cache lines or page boundaries.
:::

---

## A Worked Example: Auto-Vectorization and Epilogue Loops

Consider a simple loop in C that adds two floating-point arrays:

```c
void add_floats(float * restrict a, float * restrict b, float * restrict c, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[i] + b[i];
    }
}
```

The `restrict` keyword guarantees to the compiler that arrays `a`, `b`, and `c` do not overlap in memory (no pointer aliasing). Assuming a vector width of 4 single-precision floats (128-bit SIMD registers), the compiler generates a vector loop accompanied by a scalar epilogue.

```assembly
; Input: rdi = a, rsi = b, rdx = c, ecx = n
; Assumes 128-bit vector registers holding 4 x 32-bit floats

    test    ecx, ecx
    jle     .L_done                 ; Exit if n <= 0

    mov     eax, ecx
    shr     eax, 2                  ; eax = n / 4 (vector iteration count)
    test    eax, eax
    je      .L_epilogue_prep        ; If n < 4, skip vector loop entirely

    xor     r8d, r8d                ; r8d = byte offset = 0
    mov     r9d, eax                ; Loop counter for vector body

.L_vector_loop:
    vmovups xmm0, [rdi + r8]        ; Load 4 floats from array 'a' (unaligned)
    vmovups xmm1, [rsi + r8]        ; Load 4 floats from array 'b' (unaligned)
    vaddps  xmm0, xmm0, xmm1        ; Add 4 pairs of floats concurrently
    vmovups [rdx + r8], xmm0        ; Store 4 floats into array 'c'
    add     r8, 16                  ; Advance byte offset by 16 (4 floats * 4 bytes)
    dec     r9d                     ; Decrement vector loop count
    jnz     .L_vector_loop

.L_epilogue_prep:
    mov     eax, ecx
    and     eax, ~3                 ; eax = number of elements processed by vector loop
    cmp     eax, ecx
    je      .L_done                 ; If n % 4 == 0, skip epilogue

.L_epilogue_loop:
    ; Scalar remainder loop processes iterations [n - (n % 4) ... n - 1]
    movss   xmm0, [rdi + rax*4]     ; Load scalar float from 'a'
    addss   xmm0, [rsi + rax*4]     ; Add scalar float from 'b'
    movss   [rdx + rax*4], xmm0     ; Store scalar float to 'c'
    inc     rax                     ; Move to next scalar element
    cmp     eax, ecx
    jl      .L_epilogue_loop

.L_done:
    ret
```

### Trace of Execution
1. **Vector Header Check:** The compiler calculates `n / 4` via right shift. If $N = 10$, `n / 4` is 2. The code enters `.L_vector_loop`.
2. **Iteration 1 (Vector):** `r8` = 0. Loads `a[0..3]` into `xmm0` and `b[0..3]` into `xmm1`. Computes sums in parallel and writes to `c[0..3]`. `r8` becomes 16.
3. **Iteration 2 (Vector):** `r8` = 16. Loads `a[4..7]` into `xmm0` and `b[4..7]` into `xmm1`. Computes sums and writes to `c[4..7]`. `r8` becomes 32. Vector loop terminates.
4. **Epilogue Setup:** Calculates elements processed: $10 \mathbin\{\&\} \sim 3 = 8$. Sets scalar index `rax` = 8.
5. **Iteration 1 (Epilogue):** Reads `a[8]`, `b[8]`, adds them, stores to `c[8]`. `rax` increments to 9.
6. **Iteration 2 (Epilogue):** Reads `a[9]`, `b[9]`, adds them, stores to `c[9]`. `rax` increments to 10. `rax == ecx`, loop exits.

Without the scalar epilogue, processing $N = 10$ elements with 4-element vectors would either read/write out of bounds (over-reading 2 elements past the array boundary) or under-process the dataset by missing the last 2 elements.

---

## Why Auto-Vectorization Fails

Compilers apply static analysis to determine if vectorization is legally valid and economically profitable. Two primary microarchitectural and logical barriers cause auto-vectorization to fail: non-contiguous memory access patterns (gather/scatter) and loop-carried data dependencies.

### 1. Gather and Scatter Memory Access Patterns

When array elements are accessed through indirection (e.g., `c[i] = a[b[i]]`), memory operations become non-contiguous.

```c
// Indirect memory lookup (Gather)
void gather_example(float * restrict c, float * restrict a, int * restrict b, int n) {
    for (int i = 0; i < n; i++) {
        c[i] = a[b[i]]; // b[i] contains arbitrary index values
    }
}
```

Standard vector loads require a contiguous memory block matching the vector register byte size. To execute `a[b[i]]` in vector mode, the hardware must perform a **gather** operation:
- The CPU loads a vector of indices from array `b`.
- The execution unit splits the single vector instruction into multiple individual memory accesses across different cache lines.
- Each cache line must be accessed, validated by the TLB, and aligned before merging back into a single vector register.

On modern CPUs, gather latency is significantly higher than sequential vector loads. If the access pattern lacks spatial locality, cache line misses accumulate rapidly. The compiler's cost model evaluates the overhead of loading non-contiguous indices and packing them into vector registers against sequential scalar execution; when the gathering overhead exceeds scalar execution latency, the compiler rejects auto-vectorization.

### 2. Loop-Carried Dependencies

A loop-carried dependency occurs when an iteration $i$ reads data modified by an earlier iteration $i - k$ (where $k > 0$).

:::caution
Vectorization alters the execution order of operations within a block of $VF$ iterations. In scalar execution, iteration $i$ finishes completely (including its store to memory) before iteration $i+1$ reads from memory. In vector execution, all reads for iterations $i \dots i+VF-1$ occur simultaneously, followed by simultaneous computes and writes.
:::

#### Read-After-Write (RAW) Dependency

```c
// Loop-carried Read-After-Write (RAW) dependency
void raw_dependency(float *a, int n) {
    for (int i = 1; i < n; i++) {
        a[i] = a[i - 1] + 1.0f; // Iteration i reads result written by iteration i - 1
    }
}
```

If the compiler attempts to vectorize this loop with $VF = 4$:
- Iteration 1 needs `a[0]` (written by scalar step prior).
- Iteration 2 needs `a[1]` (written by iteration 1).
- Iteration 3 needs `a[2]` (written by iteration 2).
- Iteration 4 needs `a[3]` (written by iteration 3).

Under SIMD execution, all 4 input elements (`a[0..3]`) would be loaded into a SIMD register at the start of the loop vector body. However, `a[1]`, `a[2]`, and `a[3]` have not been calculated yet. Vectorizing this loop directly alters program logic, producing incorrect results.

#### Distance Vector and Alias Analysis

To verify dependency safety, compilers calculate the **distance vector** $D = i_\{\text\{write\}\} - i_\{\text\{read\}\}$.
- If $D = 0$, the dependency is intra-iteration (safe for SIMD; data flows within the same vector lane).
- If $D \ge VF$, the distance is larger than the vector width. The value written by iteration $i$ will not be read until $VF$ iterations later, which lands in a subsequent vector loop iteration. This is **safe to vectorize**.
- If $0 < D < VF$, vectorization violates correctness because a read in the current SIMD vector bundle relies on a write that occurs within the same SIMD execution step.

```c
// Distance D = 4. Safe for VF = 4, unsafe for VF = 8.
void distance_example(float *a, int n) {
    for (int i = 4; i < n; i++) {
        a[i] = a[i - 4] + 2.0f;
    }
}
```

Without explicit assertions like C's `restrict` keyword or pragmas, the compiler must also assume potential pointer aliasing (`a` and `b` pointing to overlapping memory locations), forcing it to generate defensive runtime alias checks or default to scalar code.

:::warning
Floating-point math is non-associative: $(a + b) + c \neq a + (b + c)$ in IEEE-754 arithmetic. Consequently, vectorizing reduction loops (e.g., summing array elements into a single scalar accumulator) changes the order of operations, altering rounding errors. Compilers will not auto-vectorize floating-point reductions unless fast-math or relaxed floating-point reassociation flags are explicitly enabled.
:::

---

## What the Compiler Can and Cannot Do

The compiler plays a major role in exploiting hardware SIMD units, but its influence is constrained by static language rules and hardware architecture limits.

We can analyze the compiler's leverage through the CPU performance equation:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$$

```
                +-------------------------------------------------------+
                |                    CPU Performance                    |
                |   Time = Instruction Count  x  CPI  x  Cycle Time     |
                +-------------------------------------------------------+
                                   |               |          |
         +-------------------------+               |          +------------------+
         |                                         |                             |
         v                                         v                             v
+------------------+                    +--------------------+        +--------------------+
| Instruction      |                    | Cycles Per         |        | Cycle Time         |
| Count            |                    | Instruction (CPI)  |        | (Clock Frequency)  |
| (Compiler Level) |                    | (Shared Level)     |        | (Hardware Level)   |
+------------------+                    +--------------------+        +--------------------+
| - Converts N     |                    | - SIMD reduces total|       | - Set by micro-    |
|   scalar ops to  |                    |   instruction count|       |   architecture     |
|   N / VF vector  |                    |   but may increase |       |   design and silicon|
|   instructions   |                    |   CPI if gathers   |       |   process node     |
| - Generates      |                    |   cause cache      |       | - Unaffected by    |
|   epilogue/peel  |                    |   misses           |       |   compiler optimization|
|   loops          |                    |                    |        |                    |
+------------------+                    +--------------------+        +--------------------+
```

### What the compiler strongly influences
- **Instruction Count Reduction:** By packing $VF$ scalar operations into a single vector instruction, the compiler reduces the total instruction footprint of the loop by up to a factor of $VF$. This reduces pressure on the hardware instruction fetch and decode pipelines (refer to [/docs/coa/cpu_execution](/docs/coa/cpu_execution)).
- **Loop Restructuring (Strip Mining & Unrolling):** The compiler generates peel loops to satisfy byte-alignment constraints and scalar epilogues to process non-multiple trip counts.
- **Register Allocation:** Maps loop variables directly into wide architectural vector registers, eliminating redundant stack spills and reloads.

### What the compiler indirectly influences
- **Cycles Per Instruction (CPI):** Vector instructions often carry higher latency than simple scalar integer operations. If the compiler emits gather instructions or unaligned accesses that cross cache line boundaries, pipeline stalls increase, raising the effective CPI (see [/docs/coa/pipeline-stalls-and-bubbles](/docs/coa/pipeline-stalls-and-bubbles)).
- **Memory Latency Hiding:** The compiler can interleave independent vector instructions to expose Instruction-Level Parallelism (ILP, see [/docs/coa/instruction-level-parallelism](/docs/coa/instruction-level-parallelism)), helping modern out-of-order schedulers cover memory load delays (see [/docs/coa/instruction_flow_modern_cpu](/docs/coa/instruction_flow_modern_cpu)).

### What the compiler cannot do
- **Alter Hardware Cycle Time:** The fundamental clock frequency of the processor is fixed by silicon characteristics and power limits; compiler SIMD optimizations cannot change cycle time.
- **Exceed Hardware Alignment or Width Limits:** A 256-bit SIMD unit cannot execute 512 bits of data in one instruction step; the compiler must break larger vectors into native hardware register sizes.
- **Bypass Hardware Memory Ports:** If the hardware load unit only supports two 256-bit loads per clock cycle, the compiler cannot issue three concurrent loads, regardless of loop unrolling depth.

---

## Common Misconceptions

### Misconception 1: "Vectorization always increases execution speed by a factor equal to the vector width."
**Reality:** Achieving an $N\times$ speedup with an $N$-lane SIMD vector unit assumes ideal conditions: zero memory bandwidth bottlenecks, perfectly aligned addresses, and complete elimination of loop overhead. In practice, speedup is limited by:
- Memory bandwidth limits (the CPU cannot feed the vector units fast enough).
- Scalar epilogue overhead on short loop trip counts.
- Instruction latency differences between SIMD and scalar ALUs.

### Misconception 2: "Modern compilers automatically vectorize any loop without loop-carried dependencies."
**Reality:** Absence of a loop-carried dependency is a necessary condition, but not a sufficient one. Auto-vectorization can still fail if:
- Pointer aliasing cannot be statically disproven and runtime checks are deemed too expensive.
- The loop body contains complex control flow that cannot be efficiently converted to vector masks.
- Non-contiguous memory accesses (gather/scatter) cause the compiler's internal cost model to reject vectorization as unprofitable compared to scalar execution.

### Misconception 3: "SIMD vectorization is identical to standard multi-core thread parallelism."
**Reality:** Multi-core execution uses Multiple Instructions, Multiple Data (MIMD), where each core has its own instruction pointer, execution pipeline, and control flow. SIMD operates inside a *single* CPU core across a *single* instruction stream. All lanes in a SIMD register execute the exact same instruction simultaneously on different data slots.

---

## What To Read Next

Explore the architecture track to learn how ISA contracts dictate backend execution:

- [/docs/coa/types_of_execution](/docs/coa/types_of_execution) — Detailed comparison of sequential, pipelined, speculative, SIMD, and MIMD hardware models.
- [/docs/coa/instruction-level-parallelism](/docs/coa/instruction-level-parallelism) — How out-of-order execution, superscalar dispatch, and SIMD pipelines intersect.
- [/docs/coa/cache-optimizations-the-compiler-can-do](/docs/coa/cache-optimizations-the-compiler-can-do) — Prefetching, loop tiling, and memory transformations that keep vector hardware saturated.

<div>
  <AdBanner />
</div>

## References

- Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*. (6th ed.). Morgan Kaufmann. (Data-Level Parallelism in Vector, SIMD, and GPU Architectures).
- Allen, R., & Kennedy, K. *Optimizing Compilers for Modern Architectures: A Dependence-based Approach*. Morgan Kaufmann. (Vectorization, distance vectors, and loop transformations).
- Intel Corporation. *Intel 64 and IA-32 Architectures Optimization Reference Manual*. (Vector layout, alignment rules, and gather/scatter cost dynamics).
- LLVM Compiler Infrastructure. *Vectorization Vectorizer Documentation* (`https://llvm.org/docs/Vectorizers.html`).
