---
title: "Integer and Floating-Point Computer Arithmetic for Compiler Engineers"
description: "Understand hardware integer and IEEE 754 floating-point representation, why floating-point addition fails associativity, and how compiler fast-math transformations alter semantics."
keywords:
  - floating point non associativity
  - integer representation twos complement
  - IEEE 754 encoding
  - compiler arithmetic optimizations
  - fast math flags LLVM
  - floating point precision loss
  - catastrophic cancellation
  - signed integer overflow
  - unsigned integer wrapping
  - sign extension zero extension
  - vectorization loop unrolling arithmetic
  - hardware floating point unit
displayed_sidebar: coasidebar
slug: /coa/integer-and-floating-point
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Integer and Floating Point

Hardware arithmetic units process fixed-width bit patterns according to explicit circuit definitions, which do not always map cleanly to pure mathematical properties. A compiler backend must strictly preserve these hardware representation rules and language semantics before applying transformations like reassociation, vectorization, or constant folding.

:::tip Read these first
- [Computer Architecture vs Computer Organization](/docs/coa/intro_to_coa) — how the ISA contract separates language intent from microarchitectural execution.
- [How the ISA Shapes the Compiler Backend](/docs/coa/isa-and-the-compiler-backend) — how instructions, registers, and flags constrain lowering decisions.
:::

:::important What you should leave with
- Signed integers use two's complement where overflow produces modulo arithmetic at the hardware level, but higher-level languages like C treat signed overflow as undefined behavior, allowing optimizations represented in LLVM IR as `nsw` (no signed wrap) flags.
- Floating-point representations under IEEE 754 use sign, exponent, and significand fields, introducing non-real concepts such as signed zeros, infinities, subnormal values, and NaNs.
- Floating-point addition and multiplication are non-associative: $(a + b) + c \neq a + (b + c)$ in standard IEEE rounding modes due to finite significand truncation and alignment shifts.
- Compilers cannot reorder floating-point reductions or tree-balance floating-point expressions unless explicitly permitted by flags like `-ffast-math` or IR attributes like `reassoc`.
:::

:::caution Who this is not for
If you need an introduction to registers, basic opcode formats, or assembly syntax, read [Registers and Addressing Modes](/docs/coa/registers-and-addressing-modes) before reading this guide.
:::

:::note
This lesson focuses on standard two's complement binary integers and IEEE 754 binary floating-point representations. Hardware decimal floating-point, custom ISA fixed-point encodings, and arbitrary-precision software math libraries follow different constraint profiles.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The Mechanism: Bit Representations and Hardware Execution](#the-mechanism-bit-representations-and-hardware-execution)
3. [Integer Semantics: Wrapping, Flags, and Extension](#integer-semantics-wrapping-flags-and-extension)
4. [IEEE 754 Floating-Point Anatomy](#ieee-754-floating-point-anatomy)
5. [The Breakdown of Real Algebra: Why Float Addition Is Non-Associative](#the-breakdown-of-real-algebra-why-float-addition-is-non-associative)
6. [A Worked Example: Loop Reduction and Fast-Math Flags](#a-worked-example-loop-reduction-and-fast-math-flags)
7. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
8. [Common Misconceptions](#common-misconceptions)
9. [What To Read Next](#what-to-read-next)
10. [References](#references)

---

## TL;DR

- Two's complement integer arithmetic wraps deterministically on $N$-bit boundaries in hardware, but language standards permit compilers to assume signed overflow never occurs to enable loop transformations.
- IEEE 754 floating-point operations require exact rounding at each step, making floating-point arithmetic non-associative, non-distributive, and non-transitive.
- Automatic vectorization of floating-point reduction loops requires reassociating operations, which changes output bits and is prohibited under strict IEEE 754 standards.
- Fine-grained IR flags (`reassoc`, `nnan`, `ninf`, `nsz`, `contract`) allow optimizer passes to break specific IEEE rules without enabling dangerous global fast-math flags.

---

## The Mechanism: Bit Representations and Hardware Execution

Hardware Arithmetic Logic Units (ALUs) and Floating-Point Units (FPUs) process binary inputs of fixed width. The table below compares how hardware execution units process common arithmetic scenarios and where compiler intervention alters behavior:

| Arithmetic Situation | Hardware Action | Compiler Control / IR Attribute |
| :--- | :--- | :--- |
| **Signed Integer Overflow** | Wraps modulo $2^N$; sets overflow flag in CPU status register. | LLVM IR `nsw` (No Signed Wrap) allows optimizer to assume overflow is unreachable. |
| **Unsigned Integer Overflow** | Wraps modulo $2^N$; sets carry flag in CPU status register. | LLVM IR `nuw` (No Unsigned Wrap) enables range-based optimizations. |
| **Integer Sign Extension** | Copies MSB across higher bits during loading or widening. | Emits explicit extension instructions (`SEXT` / `MOVSX`). |
| **Floating-Point Rounding** | Aligns exponents, adds significands, rounds to active IEEE rounding mode. | Respects strict order unless `reassoc` or `-ffast-math` is active. |
| **Subnormal Execution** | Triggers microcode trap or flush-to-zero depending on CPU mode. | Controls hardware mode registers (e.g., setting `FTZ`/`DAZ` status bits). |
| **Fused Multiply-Add (FMA)** | Computes $(a \times b) + c$ with a single rounding step at the end. | Emits FMA instructions only if `contract` flag or target ISA allows intermediate rounding variation. |

The execution pipeline routes integer and floating-point data through distinct physical execution units because integer arithmetic operates on fixed-point bit slices, while floating-point units require exponent comparison, significand alignment shifts, mantissa addition, and normalization steps.

![Integer vs Floating Point Data Path Breakdown](/img/coa/integer-and-floating-point.svg)

*Diagram: Data path split between two's complement integer arithmetic units and multi-stage IEEE 754 floating-point alignment and normalization pipelines.*

---

## Integer Semantics: Wrapping, Flags, and Extension

Modern ISAs implement integer arithmetic using **two's complement** notation. For an $N$-bit binary integer, a negative value $-X$ is encoded as the bitwise negation $\sim X + 1$. This representation ensures that addition and subtraction circuits use identical bitwise logic regardless of whether operands are signed or unsigned.

### Overflow Contracts: Language vs. Hardware

Hardware registers have fixed bit-widths (e.g., 32-bit or 64-bit). When an operation yields a result larger than $2^{N}-1$ (unsigned) or outside $[-2^{N-1}, 2^{N-1}-1]$ (signed), the hardware truncates the result to the lower $N$ bits.

1. **Unsigned Arithmetic:** Always operates as pure modulo $2^N$ arithmetic. This behavior is well-defined in both hardware and high-level language standards like C/C++.
2. **Signed Arithmetic:** In hardware, two's complement overflow wraps modulo $2^N$. However, in ISO C and C++, signed integer overflow triggers **Undefined Behavior (UB)**.

Because signed integer overflow is UB in C/C++, a compiler can assume overflow never occurs in valid code. In LLVM IR, this contract is expressed using the `nsw` (No Signed Wrap) flag on operations like `add nsw i32 %a, %b`.

```llvm
; LLVM IR showing nsw flag behavior
%val = add nsw i32 %i, 1
%cmp = icmp sgt i32 %val, %i
```

If `%val` has the `nsw` flag, the optimizer can rewrite `%cmp` directly to `true` constant, eliminating a branch. If `nsw` were omitted, the compiler would be forced to account for hardware wrapping (where `2147483647 + 1 = -2147483648`, making `%val > %i` false) and preserve the hardware register comparison.

### Zero and Sign Extension

When converting smaller integer types to larger ones (e.g., 8-bit to 32-bit), the compiler must select the correct hardware extension sequence:
- **Zero Extension (`zext`):** Fills higher bits with zeros. Used for unsigned types.
- **Sign Extension (`sext`):** Replicates the Most Significant Bit (MSB) across all higher bits. Used for signed types to preserve negative two's complement values across operand widening.

---

## IEEE 754 Floating-Point Anatomy

IEEE 754 standardizes floating-point representation using three bit-fields:
1. **Sign bit ($S$):** 1 bit (0 for positive, 1 for negative).
2. **Biased Exponent ($E$):** $e$ bits representing an offset exponent ($E = \text{Unbiased Exponent} + \text{Bias}$).
3. **Significand / Fraction ($F$):** $m$ bits representing the fractional part of the normalized mantissa ($1.F$).

$$\text{Value} = (-1)^S \times 2^{E - \text{Bias}} \times (1.F)_2$$

<Tabs>
  <TabItem value="single" label="Single Precision (32-bit)" default>

- **Sign ($S$):** 1 bit
- **Exponent ($E$):** 8 bits (Bias = 127)
- **Significand ($F$):** 23 bits (24 bits of implicit precision)
- **Dynamic Range:** Approximately $\pm 1.18 \times 10^{-38}$ to $\pm 3.40 \times 10^{38}$
- **Precision:** $\sim 7$ decimal digits

  </TabItem>
  <TabItem value="double" label="Double Precision (64-bit)">

- **Sign ($S$):** 1 bit
- **Exponent ($E$):** 11 bits (Bias = 1023)
- **Significand ($F$):** 52 bits (53 bits of implicit precision)
- **Dynamic Range:** Approximately $\pm 2.23 \times 10^{-308}$ to $\pm 1.79 \times 10^{308}$
- **Precision:** $\sim 15\text{--}17$ decimal digits

  </TabItem>
  <TabItem value="half" label="Half Precision (16-bit FP16)">

- **Sign ($S$):** 1 bit
- **Exponent ($E$):** 5 bits (Bias = 15)
- **Significand ($F$):** 10 bits (11 bits of implicit precision)
- **Dynamic Range:** Approximately $\pm 6.10 \times 10^{-5}$ to $\pm 65504$
- **Precision:** $\sim 3\text{--}4$ decimal digits

  </TabItem>
</Tabs>

### Special Bit Patterns in IEEE 754

IEEE 754 reserves specific exponent patterns to represent values outside normalized real numbers:

- **Zeros ($+0.0$ and $-0.0$):** Exponent $E = 0$, Significand $F = 0$. Sign bit distinguishes sign.
- **Subnormal (Denormal) Numbers:** Exponent $E = 0$, Significand $F \neq 0$. Value is $(-1)^S \times 2^{1 - \text{Bias}} \times (0.F)_2$. Allows gradual underflow near zero, but historically degrades hardware execution throughput.
- **Infinities ($+\infty$ and $-\infty$):** Exponent $E = \text{All 1s}$, Significand $F = 0$. Produced by overflow or division by zero.
- **Not-a-Number (NaN):** Exponent $E = \text{All 1s}$, Significand $F \neq 0$.
  - **Quiet NaN (qNaN):** MSB of significand is set. Propagates through calculations without hardware exceptions.
  - **Signaling NaN (sNaN):** MSB of significand is clear. Triggers an invalid-operation exception when accessed.

---

## The Breakdown of Real Algebra: Why Float Addition Is Non-Associative

In real mathematics, addition is associative: $(a + b) + c = a + (b + c)$. In IEEE 754 floating-point arithmetic, **addition is not associative**.

$$\text{IEEE 754: } (a \oplus b) \oplus c \neq a \oplus (b \oplus c)$$

### Microarchitectural Reason for Non-Associativity

When two floating-point numbers are added in hardware, the FPU executes three sequential steps:
1. **Exponent Alignment:** The significand of the operand with the smaller exponent is shifted right by $\Delta E = |E_1 - E_2|$ bits. Bits shifted past the low-order register boundary are dropped (or kept in guard/round/sticky bits).
2. **Significand Addition:** The aligned significands are added or subtracted.
3. **Normalization and Rounding:** The result is shifted to restore the implicit leading bit format ($1.F$), and rounded according to the active IEEE rounding mode (e.g., Round-to-Nearest, Ties-to-Even).

Because finite significand registers drop bits during alignment shifts, changing the order of operations shifts different bits out of precision limits.

### Mathematical Proof of Non-Associativity

Consider single-precision float numbers ($24$ bits of mantissa precision):
- Let $a = 2^{24} = 16777216.0$
- Let $b = -2^{24} = -16777216.0$
- Let $c = 1.0$

**Evaluation Order 1: $((a + b) + c)$**
1. $a + b = 16777216.0 + (-16777216.0) = 0.0$
2. $0.0 + c = 0.0 + 1.0 = \mathbf{1.0}$

**Evaluation Order 2: $(a + (b + c))$**
1. Evaluate $(b + c) = -16777216.0 + 1.0$:
   - Binary representation of $16777216.0$: $2^{24}$ ($1.00000000000000000000000_2 \times 2^{24}$)
   - Binary representation of $1.0$: $2^0$ ($1.00000000000000000000000_2 \times 2^0$)
   - Align $1.0$ to exponent $24$: Shift significand right by $24$ positions.
   - The value $1.0$ shifts completely out of the 24-bit precision window.
   - Under IEEE Round-to-Nearest, $-16777216.0 + 1.0 = \mathbf{-16777216.0}$
2. Evaluate $a + (b + c) = 16777216.0 + (-16777216.0) = \mathbf{0.0}$

Since $\mathbf{1.0} \neq \mathbf{0.0}$, floating-point reassociation alters numerical results.

:::caution Catastrophic Cancellation
Subtracting two nearly equal floating-point numbers yields a result where leading significand bits cancel out, leaving low-order bits (which contain rounding errors) shifted into high-significand positions. Reordering calculations changes when cancellation occurs.
:::

---

## A Worked Example: Loop Reduction and Fast-Math Flags

Consider a loop calculating a floating-point sum over an array of floats:

```c
float sum_array(const float *arr, int count) {
    float total = 0.0f;
    for (int i = 0; i < count; ++i) {
        total += arr[i];
    }
    return total;
}
```

### Line-by-Line Execution Analysis under Strict IEEE 754 Rules

1. `float total = 0.0f;`: Accumulator initialized to positive zero.
2. `total += arr[i];`: Forces sequential evaluation: $(((total + arr[0]) + arr[1]) + arr[2]) + \dots$
3. **Pipeline Bottleneck:** Each iteration depends directly on the result of the previous iteration's addition. On modern hardware where floating-point addition latency is multiple cycles, the CPU pipeline stalls waiting for the scalar register dependency chain to resolve.
4. **Vectorization Block:** The compiler **cannot** unroll and vectorise this loop into 4-wide or 8-wide SIMD accumulators because tree-reducing parallel accumulators changes the evaluation order, violating strict IEEE precision standards.

```llvm
; LLVM IR generated under strict compliance (-fno-fast-math)
for.body:
  %i.04 = phi i64 [ 0, %entry ], [ %inc, %for.body ]
  %total.03 = phi float [ 0.000000e+00, %entry ], [ %add, %for.body ]
  %arrayidx = getelementptr inbounds float, ptr %arr, i64 %i.04
  %0 = load float, ptr %arrayidx, align 4
  ; Strict scalar float add: preserves strict loop dependency chain
  %add = fadd float %total.03, %0
  %inc = add nuw nsw i64 %i.04, 1
  %exitcond.not = icmp eq i64 %inc, %wide.trip.count
  br i1 %exitcond.not, label %for.end, label %for.body
```

### Transformation under `reassoc` / `-ffast-math`

When compiled with `-ffast-math` or individual flags like `-fassociative-math`, the compiler attaches fine-grained fast-math flags to the IR instructions:

```llvm
; LLVM IR generated with reassociation permitted
%add = fadd reassoc float %total.03, %0
```

With `reassoc` enabled, the compiler restructures the loop into vector accumulators:

```c
// Transformation performed by compiler backend with reassoc active
float4 vec_sum = {0.0f, 0.0f, 0.0f, 0.0f};
for (int i = 0; i < count; i += 4) {
    vec_sum += load_float4(&arr[i]); // 4 parallel additions per cycle
}
float total = vec_sum[0] + vec_sum[1] + vec_sum[2] + vec_sum[3];
```

This vectorization breaks the scalar loop dependency latency chain, enabling multiple vector execution pipelines in hardware to execute simultaneously.

:::warning Precision Delta Warning
The output of the vectorized `reassoc` code will not match the bitwise output of the strict scalar loop. While the vectorized sum is often mathematically *more* accurate due to smaller partial accumulators, software relying on exact bit parity across architectures will fail assertions.
:::

---

## What the Compiler Can and Cannot Do

The standard CPU Performance Equation governs execution runtime:

$$\text{CPU Time} = \text{Instruction Count} \times \text{CPI} \times \text{Clock Cycle Time}$$

```
                ┌─────────────────────────────────────────┐
                │          CPU Performance Equation       │
                │  CPU Time = Instr Count × CPI × Cycle   │
                └────────────────────┬────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────┐                           ┌──────────────────────┐
│ Strongly Influenced  │                           │ Indirectly Influenced│
│    by Compiler       │                           │    by Compiler       │
├──────────────────────┤                           ├──────────────────────┤
│ - Instruction Count  │                           │ - CPI (Cycles Per    │
│ - ISA Selection      │                           │   Instruction)       │
│ - Fast-Math Trees    │                           │ - Microarchitectural │
│ - Unrolling Vector   │                           │   Stalls             │
└──────────────────────┘                           └──────────────────────┘
```

The compiler **strongly influences Instruction Count** (by selecting optimal instructions, unrolling, and vectorizing) and **indirectly influences CPI** (by scheduling instructions to conceal latency and maximize Instruction-Level Parallelism). The compiler **has no direct control over Clock Cycle Time or hardware FP pipeline stages**.

### LLVM Fast-Math Flag Taxonomy

Rather than relying on global `-ffast-math`, modern production compilers use targeted fast-math attributes:

| LLVM IR Flag | Compiler Permission Granted | Microarchitectural Impact |
| :--- | :--- | :--- |
| `reassoc` | Allow reassociating floating-point expressions. | Enables vector reduction loops and tree-balancing expression structures. |
| `nnan` | Assume inputs and results are never NaN. | Eliminates checks and canonicalization instructions for NaN propagation. |
| `ninf` | Assume inputs and results are never Infinity. | Enables simplifications like `x / x => 1.0`. |
| `nsz` | Treat sign of zero as immaterial ($-0.0 \equiv +0.0$). | Enables simplifications like `x - 0.0 => x` and vector sign-bit masking. |
| `arcp` | Allow reciprocal approximations ($x / y \Rightarrow x \times (1 / y)$). | Replaces expensive hardware FP division circuits with fast reciprocal estimates and Newton-Raphson refinement steps. |
| `contract` | Allow merging floating-point operations into FMA instructions. | Replaces separate `FMUL` + `FADD` sequence with single `FMA` instruction, improving latency and eliminating intermediate rounding. |
| `fast` | Enables all of the above flags simultaneously. | Maximize optimization freedom, completely abandoning standard IEEE 754 compliance. |

:::tip Note
Fused Multiply-Add (FMA) instructions compute $a \times b + c$ with a single rounding step at the end. While FMA is more precise mathematically than separate multiply and add steps, it produces different bits than two separate rounded steps, requiring explicit `contract` permissions in standard-compliant modes.
:::

---

## Common Misconceptions

### 1. Two's complement integer overflow can be safely ignored in C because modern CPUs wrap integers anyway.
**Correction:** While physical CPU registers wrap hardware bits deterministically, C and C++ language standards declare signed integer overflow as Undefined Behavior. Compilers leverage UB to optimize loops and range comparisons, assuming overflow never occurs. An overflowed signed loop variable can lead to deleted boundary checks or infinite loops prior to machine code emission.

### 2. Floating-point reassociation changes accuracy, so `-ffast-math` is always mathematically worse.
**Correction:** Reassociating floating-point calculations changes the bitwise result, but it is not inherently less accurate. Parallel vector tree reductions often accumulate smaller partial sums, which reduces exponent divergence and alignment truncation compared to serial accumulators. However, it violates bit-for-bit reproducability across builds.

### 3. A modern out-of-order CPU eliminates the latency of floating-point reduction loops automatically.
**Correction:** Hardware Out-of-Order (OoO) execution engines can reorder independent instructions, but they cannot bypass true read-after-write (RAW) data dependencies. In a scalar reduction loop where iteration $N+1$ depends on the result of iteration $N$, the execution engine must wait for the full FADD latency chain to resolve every single iteration unless the compiler changes the algebraic instruction structure.

---

## What To Read Next

- [Instruction Flow in a Modern CPU](/docs/coa/instruction_flow_modern_cpu) — how execution units process pipeline stages and register renames.
- [Calling Conventions and the ABI](/docs/coa/calling-conventions-and-abi) — how integer and floating-point arguments are passed in physical hardware registers.
- [Measuring Throughput, Cache Misses, and CPU Behavior in C++](/docs/coa/measuring_throughput_cache_misses_cpu_behavior_cpp) — profiling hardware pipeline stalls caused by FP execution units.

<div>
  <AdBanner />
</div>

## References

- IEEE Computer Society. *IEEE Standard for Floating-Point Arithmetic (IEEE Std 754-2019)*. IEEE, 2019.
- Goldberg, David. *What Every Computer Scientist Should Know About Floating-Point Arithmetic*. ACM Computing Surveys (CSUR), 1991.
- Hennessy, John L., and Patterson, David A. *Computer Architecture: A Quantitative Approach*. 6th Edition, Morgan Kaufmann, 2017.
- LLVM Project. *LLVM Language Reference Manual: Fast-Math Flags*. [https://llvm.org/docs/LangRef.html#fast-math-flags](https://llvm.org/docs/LangRef.html#fast-math-flags)
