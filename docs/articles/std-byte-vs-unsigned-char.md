---
title: "std::byte vs unsigned char: Do Modern Compilers Optimize Them Differently?"
description: "A compiler-oriented investigation of how Clang/LLVM and GCC treat std::byte versus unsigned char in IR, alias analysis, vectorization, and generated assembly."
keywords:
  - std::byte aliasing rules
  - unsigned char aliasing c++
  - std::byte llvm ir
  - std::byte assembly output
  - std::byte vs uint8_t
  - uint8_t vs std::byte optimization
  - raw byte access optimization
  - byte level optimization c++
  - compiler alias analysis c++
  - llvm memoryssa byte access
  - llvm omnipotent char tbaa
  - clang tbaa raw memory
  - gcc tree dump byte analysis
  - gimple raw byte access
  - llvm loop vectorizer byte loops
  - clang vectorization diagnostics
  - gcc vectorization report
  - simd byte processing c++
  - avx2 byte xor loop
  - vectorized memory loops
  - raw storage semantics c++
  - object representation aliasing
  - strict aliasing raw memory
  - char pointer aliasing rules
  - low level memory optimization
  - compiler optimization investigation
  - backend optimization analysis
  - llvm backend byte operations
  - compiler generated assembly comparison
  - std::byte raw storage api
  - c++ raw memory abstractions
  - byte oriented programming c++
  - systems level c++ optimization
  - modern compiler optimization behavior
  - clang vs gcc optimization comparison
  - llvm optimization passes memory
  - memory dependence analysis llvm
  - dependence analysis byte buffers
  - loop optimization raw buffers
  - byte buffer vectorization
  - compiler treatment of std::byte
  - llvm load i8 optimization
  - gcc optimized tree dump analysis
  - compiler ir investigation
  - c++ memory model raw bytes
  - raw memory access semantics
  - optimizer conservative aliasing
  - tbaa omnipotent char explanation
  - low level c++ compiler analysis
  - compiler explorer std::byte
  - godbolt std::byte vs unsigned char
  - byte buffer performance analysis
  - std::byte readability vs performance
  - c++ byte type comparison
  - machine code equivalence c++
  - llvm instruction selection bytes
  - gcc byte vectorization
  - cache friendly byte loops
  - high performance byte processing
  - byte span optimization c++
  - std::span std::byte performance
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AdBanner from '@site/src/components/AdBanner';


# std::byte vs unsigned char: Do Modern Compilers Optimize Them Differently?

## Contents

- [1. Introduction](#1-introduction)
- [2. What `std::byte` Actually Changes](#2-what-stdbyte-actually-changes)
- [3. Why Runtime Alone Is Not Enough](#3-why-runtime-alone-is-not-enough)
- [4. Benchmark Design](#4-benchmark-design)
- [5. Clang/LLVM Investigation](#5-clangllvm-investigation)
- [6. GCC Investigation](#6-gcc-investigation)
- [7. Why the Compiler Treats Them the Same](#7-why-the-compiler-treats-them-the-same)
- [8. Local Run](#8-local-run)
- [9. What We Found](#9-what-we-found)
- [10. Practical Guidance](#10-practical-guidance)
- [11. Conclusion](#11-conclusion)

## 1. Introduction

If you work with raw bytes in C and C++, you will usually see `unsigned char`. C++17 also gives you `std::byte`. Both represent byte-sized data, but they communicate different intent.

`std::byte` is mainly a readability and safety type. It is not a faster byte type.

### Which Type Means What

| Type | What it is | Why it matters here |
| --- | --- | --- |
| `char` | A character type | Common for text and object-representation access |
| `signed char` | A character type that may be negative | Useful as a side note, but not the main raw-byte API type |
| `unsigned char` | A character type for raw byte work | The closest practical comparator for `std::byte` in this article |
| `std::byte` | A scoped enum with underlying type `unsigned char` | Expresses raw storage intent without becoming a character type |

### Why `unsigned char` is the main comparator

For raw-memory and aliasing discussions, `char`, `signed char`, and `unsigned char` are the ordinary character types in C++. `std::byte` is different: it is a scoped enum with underlying type `unsigned char`, so it is not itself a character type.

That is why this article compares `std::byte` mainly against `unsigned char`. `signed char` can be mentioned as a side note, but it is not the main byte-buffer comparator here.

The compiler question is simple:

> Do modern compilers optimize `std::byte` differently from `unsigned char`?

Short answer: in the examples below, `std::byte` does not give a clear speed advantage over `unsigned char`.

### Quick Terminology Table

| Term | Very Simple Meaning | Why It Matters | Example |
| --- | --- | --- | --- |
| `char` | A byte usually used for text | Common for strings and text data | `'A'`, `"Hello"` |
| `signed char` | A small number that can be negative | Useful when values may go below 0 | `-5`, `20` |
| `unsigned char` | A small number that cannot be negative | Often used for binary/raw data | Image bytes, file bytes |
| `std::byte` | A type for raw memory data | Makes it clear the data is memory, not a number | Network packet buffer |
| Raw memory | Data stored inside computer memory | Low-level systems code works directly with it | Memory buffer, binary file |
| Alias analysis | Compiler checking if two pointers use the same memory | Helps the compiler optimize safely | Two pointers writing to same array |
| TBAA | Compiler rules for understanding memory types | Helps reorder or optimize memory operations | `int*` and `float*` accesses |
| Vectorization | Doing many operations together | Makes loops run faster using SIMD | Adding many array elements at once |

## 2. What `std::byte` Actually Changes

`std::byte` is a C++17 type for raw bytes. It is useful when you want to show that something is storage, not a number.

```cpp
#include <cstddef>
#include <cstdint>

std::byte b{0xA5};
auto low  = b & std::byte{0x0F};
auto high = b >> 4;

std::uint8_t x = std::to_integer<std::uint8_t>(b);
std::byte mask = std::byte{0xFF} ^ std::byte{0x3C};
```

The point is simple: the type makes raw-storage intent obvious and makes accidental numeric use harder.

`unsigned char` still works well for low-level code, especially when:

- the API boundary already uses byte pointers
- the codebase is interoperating with C
- the data is already treated numerically
- you want less conversion noise in hot-path code

So the difference is mostly about meaning, not speed.

## 3. Why Runtime Alone Is Not Enough

A timing number by itself is not enough for this kind of investigation.

Two loops can take the same time for very different reasons. Cache effects, compiler choices, and benchmark noise can hide the real story.

The real question is not "which version happened to win once?" It is whether the source type changes what the compiler can safely assume about memory.

If two versions use the same algorithm, the compiler may lower both versions to almost the same machine code. That is why this article checks compiler output instead of trusting the type name.

## 4. Benchmark Design

<Tabs>
  <TabItem value="fair" label="Fair comparison">

To compare `unsigned char` and `std::byte` fairly, keep the algorithm the same and change only the byte type.

Useful workloads include:

- memory scanning
- binary buffer reduction
- memcpy-like copying
- serialization and deserialization
- packet parsing
- SIMD-friendly transform loops
- allocator-style linear memory walks

The key design rules are simple:

- keep the hot loop `noinline`
- use the same control flow for both versions
- keep the buffers large enough
- make sure the compiler cannot remove the work
- compile both versions with the same flags

That gives the compiler a fair shot at showing whether the type spelling matters at all.

  </TabItem>
  <TabItem value="harness" label="Benchmark harness">

### Benchmark harness

```cpp
#include <cstddef>
#include <cstdint>
#include <chrono>
#include <iostream>
#include <span>
#include <vector>

static volatile std::uint64_t g_sink = 0;

template <class F>
std::uint64_t time_kernel(F&& f, int iters) {
    auto start = std::chrono::steady_clock::now();
    std::uint64_t accum = 0;
    for (int i = 0; i < iters; ++i) {
        accum += f();
    }
    g_sink = accum;
    auto end = std::chrono::steady_clock::now();
    return std::chrono::duration_cast<std::chrono::nanoseconds>(end - start).count();
}

[[gnu::noinline]]
std::uint64_t scan_uchar(std::span<const unsigned char> buf) {
    std::uint64_t sum = 0;
    for (unsigned char c : buf) {
        sum += c;
    }
    return sum;
}

[[gnu::noinline]]
std::uint64_t scan_byte(std::span<const std::byte> buf) {
    std::uint64_t sum = 0;
    for (std::byte b : buf) {
        sum += std::to_integer<unsigned>(b);
    }
    return sum;
}

[[gnu::noinline]]
std::uint32_t parse_uchar(const unsigned char* p) {
    return (std::uint32_t(p[0]) << 24) |
           (std::uint32_t(p[1]) << 16) |
           (std::uint32_t(p[2]) << 8)  |
            std::uint32_t(p[3]);
}

[[gnu::noinline]]
std::uint32_t parse_byte(const std::byte* p) {
    return (std::uint32_t(std::to_integer<unsigned>(p[0])) << 24) |
           (std::uint32_t(std::to_integer<unsigned>(p[1])) << 16) |
           (std::uint32_t(std::to_integer<unsigned>(p[2])) << 8)  |
            std::uint32_t(std::to_integer<unsigned>(p[3]));
}

[[gnu::noinline]]
void xor_uchar(unsigned char* dst, const unsigned char* src, std::size_t n) {
    for (std::size_t i = 0; i < n; ++i) {
        dst[i] = src[i] ^ 0x5a;
    }
}

[[gnu::noinline]]
void xor_byte(std::byte* dst, const std::byte* src, std::size_t n) {
    for (std::size_t i = 0; i < n; ++i) {
        dst[i] = src[i] ^ std::byte{0x5a};
    }
}

int main() {
    constexpr std::size_t n = 1u << 20;
    constexpr int iters = 200;

    std::vector<unsigned char> u(n);
    std::vector<unsigned char> uout(n);
    std::vector<std::byte> b(n);
    std::vector<std::byte> bout(n);

    for (std::size_t i = 0; i < n; ++i) {
        u[i] = static_cast<unsigned char>(i);
        b[i] = std::byte{static_cast<unsigned char>(i)};
    }

    auto scan_u_ns = time_kernel([&] { return scan_uchar(u); }, iters);
    auto scan_b_ns = time_kernel([&] { return scan_byte(b); }, iters);
    auto xor_u_ns = time_kernel([&] {
        xor_uchar(uout.data(), u.data(), n);
        return static_cast<std::uint64_t>(uout[0]);
    }, iters);
    auto xor_b_ns = time_kernel([&] {
        xor_byte(bout.data(), b.data(), n);
        return static_cast<std::uint64_t>(std::to_integer<unsigned>(bout[0]));
    }, iters);

    std::cout << scan_u_ns << '\n'
              << scan_b_ns << '\n'
              << xor_u_ns << '\n'
              << xor_b_ns << '\n'
              << g_sink << '\n';
    return 0;
}
```

  </TabItem>
</Tabs>

The only intended difference is the byte type. The vectorized XOR example below uses `-march=x86-64-v3`, so AVX2-style instructions appear in the output.

:::important Proof snapshot
If the source changes only by `unsigned char` versus `std::byte`, and the compiler output stays the same, that is the proof this article is using.
:::

<Tabs>
  <TabItem value="source" label="Source code">

```cpp
[[gnu::noinline]]
std::uint64_t scan_uchar(std::span<const unsigned char> buf) {
    std::uint64_t sum = 0;
    for (unsigned char c : buf) {
        sum += c;
    }
    return sum;
}

[[gnu::noinline]]
std::uint64_t scan_byte(std::span<const std::byte> buf) {
    std::uint64_t sum = 0;
    for (std::byte b : buf) {
        sum += std::to_integer<unsigned>(b);
    }
    return sum;
}
```

  </TabItem>
  <TabItem value="llvm" label="LLVM IR">

```llvm
%18 = load i8, ptr %16, align 1, !tbaa !5
%19 = zext i8 %18 to i64
%20 = add i64 %15, %19
%21 = getelementptr inbounds i8, ptr %16, i64 1
```

:::note What this means
LLVM is reading one byte and widening it. The IR does not show a special fast path for `std::byte`.
:::

  </TabItem>
  <TabItem value="gcc" label="GCC dump">

```text
vect_b_7.76 = MEM <const vector(16) unsigned char> [(const unsigned char &)_16];
c_66 = MEM[(const unsigned char &)SR.19_29 + 1];
c_72 = MEM[(const unsigned char &)SR.19_29 + 2];
```

:::caution What not to assume
The source type is still `std::byte`, but GCC is treating the memory access like ordinary raw bytes.
:::

  </TabItem>
  <TabItem value="asm" label="Assembly">

```asm
vpbroadcastb    ymm1, xmm1
.L5:
    vpxor   ymm0, ymm1, YMMWORD PTR [rsi+rdx]
    vmovdqu YMMWORD PTR [rcx+rdx], ymm0
    add     rdx, 32
    cmp     rdx, rax
    jne     .L5
```

:::tip Why this matters
This is the machine code you actually run. The loop shape is what matters, not the byte spelling in the source.
:::

  </TabItem>
</Tabs>


<div>
  <AdBanner />
</div>



## 5. Clang/LLVM Investigation

Use these commands:

```bash
clang++ -O3 -std=c++20 -march=x86-64-v3 -S -masm=intel std_byte_vs_uchar_bench.cpp -o std_byte_vs_uchar_bench.s
clang++ -O3 -std=c++20 -march=x86-64-v3 -emit-llvm -S std_byte_vs_uchar_bench.cpp -o std_byte_vs_uchar_bench.ll
clang++ -O3 -std=c++20 -march=x86-64-v3 -Rpass=loop-vectorize -Rpass-analysis=loop-vectorize -Rpass-missed=loop-vectorize -c std_byte_vs_uchar_bench.cpp
```

For this local run, the compiler versions are:

- Clang 18.1.3
- GCC 13.3.0

<Tabs>
  <TabItem value="clang-ir" label="Clang IR">

### LLVM IR

For a scan loop, Clang lowers both `unsigned char` and `std::byte` to the same byte-sized load pattern in IR.

Representative excerpt:

```llvm
%18 = load i8, ptr %16, align 1, !tbaa !5
%19 = zext i8 %18 to i64
%20 = add i64 %15, %19
%21 = getelementptr inbounds i8, ptr %16, i64 1
```

The `scan_uchar` and `scan_byte` functions in the same translation unit lower to the same structure. The important part is not the function name. It is that both versions load a byte and then widen it the same way.

The TBAA metadata is the same escape-hatch byte bucket:

```llvm
!5 = !{!6, !6, i64 0}
!6 = !{!"omnipotent char", !7, i64 0}
!7 = !{!"Simple C++ TBAA"}
```

That is what you would expect when the compiler treats the access as raw bytes rather than as a structured object.

  </TabItem>
  <TabItem value="clang-vec" label="Clang vectorization">

### Clang vectorization diagnostics

For the simple reduction above, Clang’s cost model on this machine says vectorization is not profitable for either form:

```text
remark: the cost-model indicates that vectorization is not beneficial
remark: the cost-model indicates that interleaving is not beneficial
```

That matters because it shows the decision is the same for both types. The byte spelling did not change the vectorizer’s decision.

  </TabItem>
  <TabItem value="clang-asm" label="Clang assembly">

### Assembly

For a plain store kernel, Clang emits identical assembly for `unsigned char*` and `std::byte*`:

```asm
mov     byte ptr [rdi], 7
mov     dword ptr [rsi], 42
ret
```

For the XOR transform, Clang produces a vectorized loop on x86-64-v3, and the `std::byte` and `unsigned char` forms are code-shape equivalents. Representative vectorized body:

```asm
vbroadcastss    ymm0, dword ptr [rip + .LCPI0_2]
.LBB0_6:
    vxorps  ymm1, ymm0, ymmword ptr [rsi + rcx]
    vxorps  ymm2, ymm0, ymmword ptr [rsi + rcx + 32]
    vxorps  ymm3, ymm0, ymmword ptr [rsi + rcx + 64]
    vxorps  ymm4, ymm0, ymmword ptr [rsi + rcx + 96]
    vmovups ymmword ptr [rdi + rcx], ymm1
    vmovups ymmword ptr [rdi + rcx + 32], ymm2
    vmovups ymmword ptr [rdi + rcx + 64], ymm3
    vmovups ymmword ptr [rdi + rcx + 96], ymm4
    add     rcx, 128
    cmp     rax, rcx
    jne     .LBB0_6
```

The exact instruction selection is a backend detail. The important point is that both byte types reach the same vectorized class of loop.

  </TabItem>
  <TabItem value="gcc-vector" label="GCC vectorization">

## 6. GCC Investigation

Use these commands:

```bash
g++ -O3 -std=c++20 -march=x86-64-v3 -S -masm=intel std_byte_vs_uchar_bench.cpp -o std_byte_vs_uchar_bench.s
g++ -O3 -std=c++20 -march=x86-64-v3 -fdump-tree-optimized -c std_byte_vs_uchar_bench.cpp
g++ -O3 -std=c++20 -march=x86-64-v3 -fopt-info-vec-optimized -c std_byte_vs_uchar_bench.cpp
```

### GCC vectorization report

For the scan kernel, GCC reports both loops as vectorized:

```text
optimized: loop vectorized using 16 byte vectors
```

That report appears for both the `unsigned char` and `std::byte` versions.

This is the cleanest GCC result in the article: the scan loop gets the same vectorization treatment either way, and the optimized tree dump later shows GCC normalizing `std::byte` back to raw unsigned-char-style byte traffic.

  </TabItem>
  <TabItem value="gcc-gimple" label="GCC dump">

### GIMPLE / tree dump

The interesting part of the GCC dump is that `std::byte` does not stay special inside the optimizer. GCC turns it into the same kind of raw-byte memory access it uses for normal byte loops.

Excerpt from the optimized dump:

```text
;; Function scan_byte (scan_byte, funcdef_no=847, decl_uid=21626, cgraph_uid=209, symbol_order=330)

uint64_t scan_byte (struct span buf)
{
  vector(16) unsigned char vect_b_7.76;
  const byte * SR.33;
  const byte * const buf;
  byte b;
  ...
  vect_b_7.76 = MEM <const vector(16) unsigned char> [(const unsigned char &)_16];
  ...
  c_66 = MEM[(const unsigned char &)SR.19_29 + 1];
  c_72 = MEM[(const unsigned char &)SR.19_29 + 2];
```

That is the compiler’s internal answer: the source type stays `byte`, but the memory access is handled like ordinary raw bytes.

  </TabItem>
  <TabItem value="gcc-asm" label="GCC assembly">

### Assembly

For the store kernel, GCC also emits identical code for both forms:

```asm
mov     BYTE PTR [rdi], 7
mov     DWORD PTR [rsi], 42
ret
```

For the XOR transform, GCC emits a vectorized loop using the same basic strategy for both byte types. Representative vector body:

```asm
mov     r8d, 90
vmovd   xmm1, r8d
vpbroadcastb    ymm1, xmm1
.L5:
    vpxor   ymm0, ymm1, YMMWORD PTR [rsi+rdx]
    vmovdqu YMMWORD PTR [rcx+rdx], ymm0
    add     rdx, 32
    cmp     rdx, rax
    jne     .L5
```

GCC and Clang choose different instruction mnemonics here, but the generated loop class is the same: wide vector XOR with unaligned vector stores.

  </TabItem>
</Tabs>

## 7. Why the Compiler Treats Them the Same

This is the section that actually decides the optimization story.

<Tabs>
  <TabItem value="alias" label="Aliasing">

### Why `char*` is special

In C and C++, character types are the sanctioned way to inspect object representation. That is why `char*`, `signed char*`, and `unsigned char*` are treated with unusual care by optimizers. They are effectively escape hatches for raw memory.

Compilers therefore cannot assume that a byte-oriented access is independent of unrelated object accesses. That conservative rule protects correctness when a program reads the underlying bytes of some other object.

### Where `std::byte` fits

`std::byte` was introduced to make byte-oriented intent explicit without pretending that the data is numeric or textual.

From the compiler’s point of view, that usually means:

- the frontend still lowers the access as byte-sized memory traffic
- TBAA typically collapses it into the same conservative raw-memory bucket
- alias analysis does not gain magical extra separation
- vectorization legality remains driven by proven independence, not the source spelling of the byte type

In LLVM, that shows up as `i8` loads and the omnipotent-char TBAA node in the examples above. In GCC, the tree dump canonicalizes the access back to unsigned-char-style memory references.

### TBAA

Type-based alias analysis is where the important distinction would have to appear if one existed.

If `std::byte` had better alias information than `unsigned char`, you would expect:

- more precise TBAA tags
- fewer may-alias edges
- more load/store reordering
- potentially easier vectorization or LICM

That does not happen in the common byte-buffer cases shown here. The compiler keeps the byte access conservative because raw memory is raw memory.

### MemorySSA and dependence analysis

MemorySSA builds def-use chains over memory effects. If an access may alias anything, it anchors the chain more strongly and reduces motion opportunities.

That matters for:

- LICM
- GVN
- dead store elimination
- partial redundancy elimination
- loop vectorization legality

But again, `std::byte` does not automatically turn into a stronger disambiguation signal. It is still a raw byte access, so MemorySSA and dependence analysis see the same broad shape.

### Alias scopes and noalias

If you actually want the optimizer to prove more, the levers are things like:

- `restrict`-style annotations
- noalias function arguments
- better object boundaries
- narrower lifetimes
- data layout that isolates hot fields

`std::byte` does not create alias scopes by itself. It improves source clarity, but it does not add ownership or provenance information.

  </TabItem>
  <TabItem value="why-it-matters" label="Why this still matters">

This is why the exact byte type is usually not where the speed win comes from. The compiler still sees raw memory, so the analysis usually ends up the same.

The optimizer usually cares more about:

- whether pointers might overlap
- whether a value stays the same across the loop
- whether the loop length is known
- whether the memory access pattern is regular
- whether the CPU can vectorize it cheaply

So the real question is not "which byte type is faster?"

It is:

> Did the frontend hand the optimizer more useful dependence information?

Usually the answer is no.

  </TabItem>
  <TabItem value="local-run" label="Local run">

## 8. Local Run

I also ran the probe locally on this machine on 2026-05-16.

### Machine

<Tabs>
  <TabItem value="machine" label="Machine facts">

<ul>
  <li>CPU: AMD Ryzen 7 9700X 8-Core Processor</li>
  <li>Kernel: Linux 6.17.0-23-generic</li>
  <li>Shell: <code>zsh</code></li>
  <li>Clang: 18.1.3</li>
  <li>GCC: 13.3.0</li>
  <li><code>perf</code>: enabled locally after setting <code>kernel.perf_event_paranoid = -1</code></li>
</ul>

  </TabItem>
  <TabItem value="commands" label="Commands">

```bash
clang++ -O3 -std=c++20 -march=x86-64-v3 /tmp/std_byte_vs_uchar_bench.cpp -o /tmp/std_byte_vs_uchar_clang
g++ -O3 -std=c++20 -march=x86-64-v3 /tmp/std_byte_vs_uchar_bench.cpp -o /tmp/std_byte_vs_uchar_gcc
/tmp/std_byte_vs_uchar_clang
/tmp/std_byte_vs_uchar_gcc
perf stat true
```

  </TabItem>
</Tabs>

So the data below is a local wall-clock smoke test from the benchmark harness above, compiled with `-O3 -std=c++20 -march=x86-64-v3` and run 5 times per compiler.

The samples are small, so the right thing to report is mean and variability rather than pretending the raw single-run number is decisive.

<Tabs>
  <TabItem value="clang" label="Clang 18.1.3">
<ul>
  <li><code>scan_uchar</code>: mean <code>22.81 ms</code>, std dev <code>0.50 ms</code>, CV <code>2.2%</code></li>
  <li><code>scan_byte</code>: mean <code>22.59 ms</code>, std dev <code>0.26 ms</code>, CV <code>1.1%</code></li>
  <li><code>xor_uchar</code>: mean <code>25.38 ms</code>, std dev <code>1.07 ms</code>, CV <code>4.2%</code></li>
  <li><code>xor_byte</code>: mean <code>27.06 ms</code>, std dev <code>1.06 ms</code>, CV <code>3.9%</code></li>
</ul>

The scan case is effectively tied. The XOR case is separated by only a few milliseconds over 50 iterations, and the spread is still in the same rough range as the measured delta. That is not enough evidence to claim a real type-level performance effect.

  </TabItem>
  <TabItem value="gcc" label="GCC 13.3.0">
<ul>
  <li><code>scan_uchar</code>: mean <code>51.64 ms</code>, std dev <code>0.53 ms</code>, CV <code>1.0%</code></li>
  <li><code>scan_byte</code>: mean <code>51.86 ms</code>, std dev <code>0.77 ms</code>, CV <code>1.5%</code></li>
  <li><code>xor_uchar</code>: mean <code>24.32 ms</code>, std dev <code>1.10 ms</code>, CV <code>4.5%</code></li>
  <li><code>xor_byte</code>: mean <code>26.86 ms</code>, std dev <code>1.00 ms</code>, CV <code>3.7%</code></li>
</ul>

Again, the scan numbers are effectively tied. The XOR gap is visible, but not yet strong enough to separate a compiler effect from residual benchmark variance.

  </TabItem>
</Tabs>

### Counter snapshot

I also captured a single `perf stat` run on each binary after enabling hardware counters.

| Binary | Cycles | Instructions | IPC | Branches | Branch misses | Cache misses | Elapsed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Clang build | 36,157,660 | 46,503,357 | 1.29 | 4,981,242 | 20,961 | 1,101,380 | 0.008657610 s |
| GCC build | 184,654,971 | 509,199,925 | 2.76 | 27,921,867 | 26,209 | 1,155,734 | 0.043572629 s |

The counter snapshot shows the Clang and GCC binaries taking different total work per run on this specific benchmark harness, but it still does not change the main point: the byte type itself is not the reason to expect a speed win.

The XOR gap is still unresolved on purpose. A single run with counters is not enough to explain a 1.5-2.5 ms difference, especially when the scan case is effectively tied.

To close that gap properly, I would want a stronger harness with:

- more repeated runs
- pinned CPU affinity
- controlled frequency or turbo settings
- separate timing for each kernel
- multiple `perf stat` samples per kernel

Without that, the right conclusion is simply that the XOR gap is suggestive but not proved.

The useful takeaway is smaller than "one type wins":

- `std::byte` does not show a stable speed advantage here.
- the differences are small enough that noise and surrounding code matter more than the byte spelling.
- the compiler evidence still says the same thing: `std::byte` is mainly a readability improvement, not a speed trick.

</TabItem>
<TabItem value="findings" label="What we found">

## 9. What We Found

The practical result is simple.

<Tabs>
  <TabItem value="compiler" label="Compiler view">
<ul>
  <li>LLVM IR: <code>std::byte</code> and <code>unsigned char</code> both lower to <code>i8</code> memory traffic in the scan example.</li>
  <li>TBAA: Clang uses the same omnipotent-char-style raw-memory bucket.</li>
  <li>Clang diagnostics: the scan reduction gets the same vectorization decision for both types.</li>
  <li>GCC GIMPLE: GCC normalizes <code>std::byte</code> access back to unsigned-char-style byte memory references.</li>
  <li>Assembly: the store kernel is identical in Clang and GCC.</li>
  <li>SIMD loop: the XOR transform vectorizes in both compilers with the same broad loop shape.</li>
</ul>

  </TabItem>
  <TabItem value="runtime" label="Runtime view">
<ul>
  <li>Any difference is usually noise, surrounding code, or a benchmark artifact rather than the byte type itself.</li>
  <li>The local smoke test did not show a stable throughput win for <code>std::byte</code>.</li>
  <li>When a spread appears, it is small enough that I would want hardware counters and a stronger harness before attributing causality.</li>
</ul>

  </TabItem>
</Tabs>

That is what you would expect from mature compilers.

There can still be subtle differences, but they are usually indirect:

<ul>
  <li>the byte type changes overload resolution</li>
  <li>the byte type changes whether arithmetic is explicit</li>
  <li>the byte type changes whether template code instantiates a different path</li>
  <li>the byte type changes how human readers structure the surrounding code</li>
</ul>

Those are important, but they are not the same thing as a direct optimization win.

  </TabItem>
  <TabItem value="use" label="Practical guidance">

<div>
  <AdBanner />
</div>

## 10. Practical Guidance

The practical choice is mostly about clear APIs.

Use `std::byte` when the code is clearly about raw storage:

<ul>
  <li>binary protocols</li>
  <li>serialization code</li>
  <li>GPU upload buffers</li>
  <li>memory allocators</li>
  <li>packet parsing</li>
  <li>any API where accidental math on bytes would be a bug</li>
</ul>

Use `unsigned char` when the surrounding code already uses C-style byte pointers:

<ul>
  <li>legacy APIs</li>
  <li>C interop</li>
  <li>existing systems code</li>
  <li>places where the byte is really being used as a number</li>
</ul>

In other words, `std::byte` is usually the nicer choice for new raw-memory APIs. `unsigned char` is still fine when you need compatibility with existing code.

Three practical rules:

- use `std::byte` at API boundaries where you want to signal "raw storage"
- keep `unsigned char` when you need a plain byte type that already fits existing code or tools
- do not switch to `std::byte` expecting a direct optimization win

If you need performance, look for the real levers: aliasing, layout, loop shape, data locality, and whether the compiler can prove non-overlap.

  </TabItem>
  <TabItem value="conclusion" label="Conclusion">

## 11. Conclusion

`std::byte` is mainly a readability and safety improvement, not a speed trick.

In the Clang 18.1.3 and GCC 13.3.0 probes above:

<ul>
  <li>the IR for raw byte access is effectively the same</li>
  <li>the aliasing story stays conservative</li>
  <li>vectorization decisions are driven by loop shape, not by the byte spelling</li>
  <li>the final assembly is usually identical or functionally equivalent</li>
</ul>

The most interesting part of the comparison is not runtime benchmarking. It is seeing how the compiler lowers the type and reasons about memory.

So the conservative, evidence-based conclusion is:

> `std::byte` is a cleaner type for raw memory, but modern compilers usually do not make it faster than `unsigned char`.

If you want a real answer, inspect the IR and assembly. The type name by itself is not the story.

  </TabItem>
</Tabs>


<div>
  <AdBanner />
</div>