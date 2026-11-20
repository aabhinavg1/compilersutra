---
title: "Floating Point on the Device"
description: "Why parallel floating-point operations produce different bit patterns across execution configurations, compiler flags, and reduction trees."
keywords:
  - cuda floating point
  - IEEE 754 gpu
  - floating point associativity
  - non-associative sum
  - parallel reduction floating point
  - warp reduction rounding
  - FMA fused multiply-add
  - fast-math compiler flag
  - compiler reassociation
  - bit-exact floating point
  - catastrophic cancellation
  - GPU rounding modes
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/device-floating-point
---

GPU hardware implements IEEE 754 floating-point operations, but parallel execution paths introduce non-deterministic ordering into reductions and accumulations. Because floating-point addition is not associative, changing block shapes, scheduling, or accumulator layout alters the low-order bits of floating-point results.

:::tip Read these first
- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads) for CUDA execution hierarchy semantics.
- [/docs/parallel-computing/openmp-reduction-and-dependence](/docs/parallel-computing/openmp-reduction-and-dependence) for the mechanics of parallel reduction trees.
:::

:::important What you should leave with
Never test GPU floating-point outputs using strict bitwise equality or ungrounded exact tolerances against sequential host loops. Define error bounds based on numerical precision analysis rather than hardware identity.
:::

## Why you should care

Consider a kernel that sums array elements across a grid. On a single CPU thread, the sum accumulates sequentially from index `0` to `N-1`. On a GPU, thousands of threads accumulate elements using block-level reduction trees, warp shuffle instructions, or atomic addition into global memory.

```cpp
// Serial execution on CPU
float serial_sum = 0.0f;
for (int i = 0; i < N; ++i) {
    serial_sum += data[i];
}

// Parallel execution on GPU (Atomic addition approach)
__global__ void sum_atomic(const float* data, float* result, int N) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        atomicAdd(result, data[idx]);
    }
}
```

Running `sum_atomic` twice on the same GPU with identical input can yield different bit patterns in `result`. The exact order in which atomic memory transactions complete depends on thread warp scheduling, memory controller contention, and hardware cache updates. 

When floating-point additions change order, the low-order mantissa bits shift due to exponent alignment during intermediate steps.

## The mechanism

Floating-point numbers in IEEE 754 representation consist of a sign bit, exponent bits, and mantissa (significand) bits. Single-precision `float` uses 1 sign bit, 8 exponent bits, and 23 mantissa bits (24 bits of precision with the implicit leading 1).

### The non-associative nature of floating-point addition

Mathematical real addition is associative: $(a + b) + c = a + (b + c)$. Floating-point addition is not:

$$
(a \oplus b) \oplus c \neq a \oplus (b \oplus c)
$$

Before two floating-point numbers can be added, their exponents must match. The hardware shifts the mantissa of the smaller operand to the right until its exponent equals the larger operand's exponent. Bits shifted beyond the precision boundary are discarded or rounded.

Consider three values in single precision:
- $a = 1.0 \times 10^8$ (binary representation has large exponent)
- $b = -1.0 \times 10^8$
- $c = 1.0$

Evaluating $(a + b) + c$:
1. $a + b = 1.0 \times 10^8 + (-1.0 \times 10^8) = 0.0$
2. $0.0 + c = 1.0$

Evaluating $a + (b + c)$:
1. $b + c = -1.0 \times 10^8 + 1.0$. Aligning exponents requires shifting $1.0$ right by 26 binary positions. In 24-bit single precision, $1.0$ drops off the right end. $b + c \approx -1.0 \times 10^8$.
2. $a + (b + c) = 1.0 \times 10^8 + (-1.0 \times 10^8) = 0.0$.

The order of operations produces two different results: `1.0` versus `0.0`.

### Reduction trees vs sequential loops

A sequential CPU loop accumulates terms into a single floating-point scalar:

```text
Step 1: (((d0 + d1) + d2) + d3) + d4 ...
```

A parallel GPU reduction builds a tree structure across warp lanes and thread blocks:

```text
Warp Level Tree:
Step 1:  (d0 + d1),  (d2 + d3),  (d4 + d5),  (d6 + d7)
Step 2:  ((d0 + d1) + (d2 + d3)), ((d4 + d5) + (d6 + d7))
Step 3:  Final block-level sum
```



Because intermediate operands in the tree are added pair-wise rather than accumulated sequentially into a growing scalar, exponent scale shifts happen at different steps. The bit output of Pattern A rarely equals Pattern B.

## Non-determinism in atomic ops vs shuffle trees

Different GPU accumulation strategies exhibit varying levels of non-determinism:

| Sum Strategy | Determinism Level | Cause of Bit Variance |
| :--- | :--- | :--- |
| **Global `atomicAdd`** | **Non-Deterministic** | Dynamic warp scheduling and DRAM/L2 latency order. |
| **Static Tree (Shuffle)** | **Deterministic per grid config** | Fixed binary tree topology; changes if block configuration changes. |
| **Kahan / Compensated Sum** | **Deterministic per grid config** | Tracks truncated low bits, bounds accumulated rounding error. |

## A worked example

This kernel demonstrates three distinct sum mechanisms: atomic reduction, block shuffle reduction, and Kahan compensated summation.

```cpp
#include <cuda_runtime.h>
#include <stdio.h>

// 1. Unordered Non-Deterministic Atomic Reduction
__global__ void reduce_atomic(const float* __restrict__ input, float* __restrict__ output, int N) {
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    if (tid < N) {
        atomicAdd(output, input[tid]);
    }
}

// 2. Deterministic Block-Level Tree Reduction using Warp Shuffles
__inline__ __device__ float warp_reduce_sum(float val) {
    for (int offset = 16; offset > 0; offset /= 2) {
        val += __shfl_down_sync(0xffffffff, val, offset);
    }
    return val;
}

__global__ void reduce_tree(const float* __restrict__ input, float* __restrict__ output, int N) {
    float sum = 0.0f;
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    int stride = blockDim.x * gridDim.x;

    // Grid-stride loop
    for (int i = tid; i < N; i += stride) {
        sum += input[i];
    }

    // Warp tree reduction
    sum = warp_reduce_sum(sum);

    // Block tree reduction using shared memory
    __shared__ float shared_sums[32];
    int lane = threadIdx.x % 32;
    int wid = threadIdx.x / 32;

    if (lane == 0) {
        shared_sums[wid] = sum;
    }
    __syncthreads();

    // Final reduction inside first warp
    sum = (threadIdx.x < blockDim.x / 32) ? shared_sums[lane] : 0.0f;
    if (wid == 0) {
        sum = warp_reduce_sum(sum);
    }

    // Single atomic per block to global output
    if (threadIdx.x == 0) {
        atomicAdd(output, sum);
    }
}

// 3. Compensated Kahan Summation Kernel Fragment (Warp-level)
__device__ float2 kahan_add(float2 accumulator, float value) {
    // accumulator.x = sum, accumulator.y = compensation (c)
    float y = value - accumulator.y;
    float t = accumulator.x + y;
    accumulator.y = (t - accumulator.x) - y;
    accumulator.x = t;
    return accumulator;
}
```

### Key implementations explained

1. **`atomicAdd` path**: Lines 5–10 issue atomic floating-point adds directly to global memory. The order in which thread warps complete their atomic operations varies across runs depending on memory controller contention. This causes variance in the final bit pattern.
2. **`warp_reduce_sum` path**: Lines 13–18 use `__shfl_down_sync` to perform a deterministic pair-wise reduction tree across 32 lanes in a warp. Lane 0 accumulates sums from lanes 1, 2, 4, 8, and 16 in a fixed sequence.
3. **`kahan_add` helper**: Lines 48–55 maintain a two-element vector (`float2`) holding the running sum (`x`) and accumulated error compensation (`y`). The expression `(t - accumulator.x) - y` captures bits lost during exponent alignment and reintroduces them in subsequent steps.

## What the compiler and runtime can and cannot do

Compilers alter floating-point semantics based on optimization flags:

### Fused Multiply-Add (FMA)

GPU hardware provides single-cycle Fused Multiply-Add (`fmaf` in C++ / `fma.rn.f32` in PTX). An FMA computes $(a \times b) + c$ with a single rounding step at the end, rather than rounding the product $a \times b$ before adding $c$.

```cpp
float result = a * b + c;
```

- By default, NVCC compiles this expression to an hardware FMA instruction.
- An FMA instruction yields higher numerical precision than separate multiply and add instructions.
- However, if the CPU target does not execute FMA instructions for its sequential loop, CPU and GPU results will diverge due to differing intermediate rounding steps.
- Passing `-fmad=false` to NVCC forces the compiler to generate separate multiply (`fmul`) and add (`fadd`) instructions, retaining strict intermediate rounding at the cost of execution performance.

### Compiler Fast-Math Flags

When compiling with `--use_fast_math` (or `-ffast-math` in GCC/Clang):
- NVCC sets `-ftz=true` (flush denormalized numbers to zero).
- NVCC sets `-prec-div=false` (replaces exact floating-point division $a / b$ with reciprocal approximation $a \times \frac\{1\}\{b\}$).
- NVCC sets `-prec-sqrt=false` (uses reciprocal square root approximations).
- The compiler reserves the right to re-associate arithmetic expressions $(a + b) + c \rightarrow a + (b + c)$.

The runtime cannot guarantee bit-exact reproducibility across distinct hardware generations (e.g., passing between different compute capabilities) because hardware functional unit configurations, atomic routing pipelines, and scheduling topologies change between architecture iterations.

## Common misconceptions

### Floating-point arithmetic on GPUs is imprecise or non-compliant
GPU floating-point units fully implement IEEE 754 precision, rounding modes (round-to-nearest-even, round-toward-zero, round-up, round-down), and subnormal handling. Divergence between host and device results stems from reduction order, FMA contraction, and compiler flags—not hardware hardware inaccuracies.

### Setting the same random seed guarantees bit-exact GPU results across different thread topologies
Fixing random seeds controls pseudo-random data generation, but changing thread block dimensions (e.g., switching from 256 to 512 threads per block) restructures the block reduction tree topology. Different tree topologies change the order of intermediate sum pairs, altering the trailing bits of the final result.

### Atomic operations on floating-point variables are broken because they fluctuate
`atomicAdd` on floating-point types in CUDA performs valid IEEE additions. The fluctuation across runs occurs because atomic updates arrive in non-deterministic order. The operation is sound; the sequence of execution is non-deterministic.

## Where this leaves you

When writing and verifying device code:

1. **Avoid bitwise assertions**: Never use `memcmp` or `assert(gpu_res == cpu_res)` on floating-point outputs.
2. **Use relative error tolerances**: Compare results using relative epsilon checks:
   $$\frac\{|y_\{gpu\} - y_\{ref\}|\}\{|y_\{ref\}|\} < \epsilon$$
   where $\epsilon$ is derived from numerical stability requirements (e.g., $10^\{-5\}$ for single-precision IEEE 754 floats).
3. **Fix execution topology for regression tests**: If deterministic output is required for debugging, use a fixed block size, avoid dynamic atomics, and disable fast-math optimizations (`--fmad=false`, `-prec-div=true`).

## What To Read Next

- [/docs/parallel-computing/cuda-grids-blocks-threads](/docs/parallel-computing/cuda-grids-blocks-threads) — How block configuration changes grid execution mapping.
- [/docs/parallel-computing/cuda-memory-spaces](/docs/parallel-computing/cuda-memory-spaces) — Shared memory usage in deterministic block reductions.
- [/docs/gpu/optimizations](/docs/gpu/optimizations) — Balancing numerical precision against warp execution throughput.

![Diagram](/img/parallel/device-floating-point.svg)

## References

- Kirk, D. B., & Hwu, W. W. *Programming Massively Parallel Processors: A Hands-on Approach*. Morgan Kaufmann.
- IEEE Computer Society. *IEEE Standard for Floating-Point Arithmetic (IEEE Std 754-2019)*.
- NVIDIA Corporation. *CUDA C++ Programming Guide: Floating-Point Reporting*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/device-floating-point/)
