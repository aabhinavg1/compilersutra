---
title: "Virtual memory and the TLB"
description: "How TLB misses stall the pipeline even when the cache looks fine"
keywords:
  - virtual memory
  - translation lookaside buffer
  - TLB miss
  - page table walk
  - page fault
  - memory hierarchy
  - compiler backend
  - address translation
  - page size
  - page table entry
  - page offset
  - page table walk latency
displayed_sidebar: coasidebar
slug: /coa/virtual-memory-and-the-tlb
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Virtual memory and the TLB

A TLB miss forces a page‑table walk that stalls the pipeline, even if the data cache hit rate is perfect.  
Compilers can influence the frequency of TLB misses by arranging data and code locality, but they cannot change the hardware’s walk latency.

:::tip Read these first
- [/docs/coa/memory-hierarchy](https://example.com/docs/coa/memory-hierarchy)
- [/docs/coa/cache-optimizations-the-compiler-can-do](https://example.com/docs/coa/cache-optimizations-the-compiler-can-do)
:::

:::important What you should leave with
- A TLB miss incurs a page‑table walk that dominates cache latency.
- The compiler can reduce TLB pressure by grouping related accesses into the same page or by aligning data structures.
- TLB shootdowns are an OS‑level cost that compilers must respect but cannot eliminate.
:::

:::caution Who this is not for
If you have not read [/docs/coa/memory-hierarchy](https://example.com/docs/coa/memory-hierarchy), start there first.
:::

:::note
The TLB is a small, fast cache of virtual‑to‑physical translations; its size is fixed by the hardware.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tl-dr)
2. [The mechanism](#the-mechanism)
3. [A worked example](#a-worked-example)
4. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
5. [Common misconceptions](#common-misconceptions)
6. [What To Read Next](#what-to-read-next)

## TL;DR
- TLB misses trigger a page‑table walk that stalls the pipeline for many cycles.
- Aligning data and code to page boundaries reduces TLB pressure.
- The compiler can emit hints (e.g., `#pragma pack`) but cannot change the walk latency.
- TLB shootdowns are an OS cost; the compiler should avoid frequent page‑table updates.

## The mechanism

| Situation | What the hardware does | What the compiler can change |
|-----------|------------------------|------------------------------|
| Accessing a virtual address not in the TLB | Triggers a page‑table walk; the CPU stalls until the translation is loaded | Arrange accesses so that multiple references hit the same page; align data structures |
| Accessing a virtual address that is in the TLB | Fast translation; proceeds to cache lookup | Use `__builtin_assume_aligned` to help the compiler keep data in one page |
| Page‑table walk misses a page table entry (e.g., page not present) | Generates a page fault; OS handles it | Avoid allocating sparse arrays that leave large gaps between used pages |
| TLB shootdown after a page‑table update | Invalidate all TLB entries that map the affected pages; pipeline stalls | Minimize the number of page‑table updates; use `mprotect` sparingly |

![TLB and page table walk diagram](/img/coa/virtual-memory-and-the-tlb.svg)

*Diagram: a virtual address is translated by the TLB; on miss, a walk through the page tables occurs, then the TLB is updated.*

### Diagram (SVG)



## A worked example

```c
// C code that accesses a large array
void sum(const int *a, int n, int *out) {
    int sum = 0;
    for (int i = 0; i < n; ++i)
        sum += a[i];
    *out = sum;
}
```

Assume `int` is 4 bytes, the array `a` has 1 M elements, and the page size is 4 KiB.

1. **First iteration** (`i = 0`):  
   - Virtual address `a[0]` maps to page 0.  
   - TLB miss → page‑table walk (≈ 100 cycles).  
   - TLB updated; data cache lookup proceeds.

2. **Subsequent iterations** (`i = 1 … 1023`):  
   - Addresses stay within page 0.  
   - TLB hit; only cache lookup is needed.

3. **When `i = 1024`**:  
   - Address crosses into page 1.  
   - TLB miss again → another walk.  
   - Stalls until translation is loaded.

Thus, every 1024 accesses incur a TLB miss, regardless of cache behavior. The compiler can reduce this by aligning the array to a page boundary and ensuring that the loop processes whole pages before moving to the next, but it cannot shorten the walk itself.

### Compiler‑level hint

```c
#pragma pack(push, 1)
struct alignas(4096) PageAlignedArray {
    int data[1024];
};
#pragma pack(pop)
```

The `alignas(4096)` ensures the array starts on a page boundary, but the compiler still cannot change the walk latency.

## What the compiler can and cannot do

| Lever | Effect on TLB behavior | Notes |
|-------|------------------------|-------|
| **Data layout** | Reduces TLB pressure by keeping related data in the same page | Use `__attribute__((aligned))` or `alignas` |
| **Loop tiling** | Keeps loop iterations within a page | Tiling size must match page size |
| **Pointer aliasing** | Avoids unnecessary page‑table updates | Use `restrict` or `__builtin_assume_aligned` |
| **Code placement** | Keeps hot code in a small number of pages | `#pragma code_seg` or linker scripts |
| **Page‑table updates** | Cannot be avoided; OS decides | Compiler can reduce by minimizing `mprotect` or `munmap` |

The CPU performance equation, `CPU time = instruction count × CPI × cycle time`, shows that the compiler strongly influences instruction count and indirectly CPI, but has little control over cycle time. A TLB miss adds a large CPI penalty that dominates the cycle count.

## Common misconceptions

1. **“TLB misses are the same as cache misses.”**  
   TLB misses involve a page‑table walk that is orders of magnitude slower than a cache miss; they stall the pipeline for many cycles.

2. **“If the cache hit rate is 99 %, TLB misses are irrelevant.”**  
   Even with perfect cache behavior, a TLB miss forces a walk that can cost hundreds of cycles, dominating performance.

3. **“Compilers can make the TLB larger.”**  
   The TLB size is fixed by the microarchitecture; the compiler can only arrange data to fit into the existing TLB.

4. **“TLB shootdowns are caused by the compiler.”**  
   Shootdowns are triggered by OS page‑table updates (e.g., `mprotect`); the compiler can only minimize the frequency of such updates.

## What To Read Next

- [/docs/coa/memory-hierarchy](https://example.com/docs/coa/memory-hierarchy)
- [/docs/coa/cache-optimizations-the-compiler-can-do](https://example.com/docs/coa/cache-optimizations-the-compiler-can-do)
- [/docs/coa/branch-prediction](https://example.com/docs/coa/branch-prediction)

<div>
  <AdBanner />
</div>

## References
- Stallings, W. *Operating Systems: Internals and Design Principles*, 9th ed. 2018.
- Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*, 6th ed. 2017.
- “Page Table Walk Latency.” *Intel® 64 and IA‑32 Architectures Software Developer’s Manual*, vol. 3. 2023.
- “TLB Shootdown.” *Linux Kernel Documentation*, 2024.

<AdBanner />
