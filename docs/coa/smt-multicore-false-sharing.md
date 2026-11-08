---
title: "SMT, Multicore, and False Sharing"
description: "Learn how simultaneous multithreading and multicore hardware share cache hierarchies, why false sharing triggers invalidation traffic across cores, and how compilers prevent line ping-ponging through data layout and transformation."
keywords:
  - simultaneous multithreading
  - smt
  - hyperthreading
  - multicore architecture
  - false sharing
  - cache coherence
  - mesis protocol
  - cache line ping pong
  - cache line invalidation
  - cohrence traffic
  - hardware threads
  - logical cores
displayed_sidebar: coasidebar
slug: /coa/smt-multicore-false-sharing
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# SMT, Multicore, and False Sharing

Hardware threads on the same physical core share execution pipelines and low-level caches, while separate cores maintain independent execution units connected through a hardware cache coherence protocol. A compiler backend or runtime system that places distinct, concurrently written variables onto the same cache line causes hardware to repeatedly invalidate and transfer that entire line across cores, turning parallel code into serial memory traffic.

:::tip Read these first
- [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy) — Memory hierarchy: locality and miss cost dominate compiler output
- [/docs/coa/memory-consistency](/docs/coa/memory-consistency) — Memory consistency: architectural ordering guarantees vs hardware execution
:::

:::important What you should leave with
- Simultaneous Multithreading (SMT) duplicates architectural state while sharing hardware pipelines and L1 caches; multicore duplicates physical pipelines and L1 caches while sharing down-tree caches.
- False sharing occurs when independent threads update logically unrelated variables that reside on the same physical cache line.
- Hardware cache coherence operates strictly at cache-line granularity (typically 64 bytes), ignorant of language-level variable boundaries.
- Compilers eliminate false sharing by applying explicit alignment attributes, inserting padding, replacing shared memory writes with thread-local reduction accumulators, or adjusting array memory layouts.
:::

:::caution Who this is not for
If you are looking for high-level distributed systems clustering or software message passing, read standard distributed computing literature instead. This lesson focuses on hardware hardware-thread sharing and hardware cache invalidation protocols inside shared-memory CPUs.
:::

:::note
Hardware thread scheduling, operating system affinity decisions, and core-to-core interconnect topologies are managed by hardware and software schedulers outside the compiler; compiler passes control data layout, structure padding, stack frame construction, and loop privatization.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The Mechanism: SMT vs Multicore Core Structures](#the-mechanism-smt-vs-multicore-core-structures)
3. [Cache Coherence and False Sharing](#cache-coherence-and-false-sharing)
4. [Coherence Protocol Transitions: MESI Spectrum](#coherence-protocol-transitions-mesi-spectrum)
5. [A Worked Example: Counter Ping-Ponging](#a-worked-example-counter-ping-ponging)
6. [What the Compiler Can and Cannot Do](#what-the-compiler-can-and-cannot-do)
7. [Common Misconceptions](#common-misconceptions)
8. [What To Read Next](#what-to-read-next)
9. [References](#references)

---

## TL;DR

- Align distinct, concurrently modified mutable state to hardware cache-line boundaries (64 bytes on modern architectures) to prevent false-sharing invalidations.
- Transform parallel reduction loops so threads accumulate into local scalar registers or stack-allocated variables before writing to global memory arrays.
- Recognize that SMT threads compete for execution resource units, renaming slots, and L1 cache capacity, whereas multicore execution competes primarily for shared L2/L3 bandwidth and interconnect bus transactions.
- Never rely on language-level field separation to prevent memory bouncing; coherence operates exclusively on physical cache lines, regardless of variable boundaries.

---

## The Mechanism: SMT vs Multicore Core Structures

Modern CPUs extract execution parallelism across two hardware tiers: Simultaneous Multithreading (SMT) within a single physical core, and separate physical cores within a processor socket. Understanding where resource sharing occurs dictates how compilers organize code and layout structures.

```
       +-------------------------------------------------------+
       |                    Physical Core                      |
       |  +--------------------+       +--------------------+  |
       |  | Logical Thread 0   |       | Logical Thread 1   |  |
       |  | Architectural Regs |       | Architectural Regs |  |
       |  +---------+----------+       +---------+----------+  |
       |            |                            |             |
       |            +--------------+-------------+             |
       |                           v                           |
       |             Shared Fetch / Decode / Rename            |
       |                           |                           |
       |                           v                           |
       |             Shared Scheduler / Out-of-Order           |
       |             Execution Pipelines & ALU Array           |
       |                           |                           |
       |                           v                           |
       |                   Shared L1 Cache                     |
       +---------------------------+---------------------------+
                                   |
                                   v
                       Shared L2 / L3 Interconnect
```

On an SMT core, two or more logical processors (architectural states) share the physical fetch engine, register rename pools, execution units, and L1 instruction/data caches. Hardware dynamically partitions or shares these resources cycle by cycle. When one SMT thread stalls on a memory access, the micro-architecture allows the second thread to issue instructions into the shared functional units.

In a multicore configuration without SMT (or across separate SMT physical cores), each core possesses its own independent pipelines, instruction decoders, execution units, and private level-1 (and often level-2) caches. Cores do not share functional units cycle by cycle; instead, they communicate through a hardware cache coherence network connected to a shared L3 cache or system memory interconnect.

| Thread / Workload Context | Hardware Mechanism | Hardware Action | Compiler / Software Lever |
| :--- | :--- | :--- | :--- |
| **Two SMT threads on one physical core** | Shared L1/L2 caches, shared ALU pipelines, separate register state | Dynamically schedules instructions from both threads onto shared execution ports | Maximize instruction diversity; avoid issuing identical port-heavy SIMD sequences concurrently |
| **Two independent cores writing separate lines** | Separate L1 caches, hardware cache coherence protocol | Keeps both lines in Modified state in respective private L1s | Maintain high spatial locality per core; align datasets to line boundaries |
| **Two independent cores writing same line (False Sharing)** | Write-invalidate cache coherence over interconnect | Interconnect revokes line ownership, invalidating peer private caches on every store | Pad structures to cache-line boundaries (e.g., 64B); substitute local scalar accumulators |

---

## Cache Coherence and False Sharing

Hardware cache coherence maintains a single unified memory model across multiple private caches. When a physical core needs to write to a memory address, the coherence hardware must acquire **exclusive access** (ownership) of the physical cache line containing that address.

If Core 0 and Core 1 write to two completely independent variables (`var_a` and `var_b`) that happen to reside within the same 64-byte physical cache line:

1. **Core 0 issues a store to `var_a`**: The coherence mechanism sends an invalidation request over the interconnect to clear Core 1's local copy of the cache line. Core 0 promotes the line to an Exclusive/Modified state in its L1 cache and performs the store.
2. **Core 1 issues a store to `var_b`**: Core 1 experiences a cache miss because its local line was invalidated. Core 1 must issue a coherence request, forcing Core 0 to write back its modified line and downgrade or invalidate its local copy.
3. **Repeated store sequence**: Every subsequent write from either core forces the entire 64-byte line to transition across the interconnect between private L1 caches.

This condition is called **false sharing**. Although there is no software data race or logic conflict between `var_a` and `var_b`, the hardware operates strictly on full cache lines. Software thread execution serializes on interconnect transfers.

:::note
Cache coherence protocols operate entirely at the resolution of cache line blocks (typically 64 bytes on x86-64 and ARM64). The hardware has no visibility into variable layout, struct field boundaries, or software data structures.
:::

---

## Coherence Protocol Transitions: MESI Spectrum

Cache lines transition through states governed by coherence protocols such as **MESI** (Modified, Exclusive, Shared, Invalid) or its variants (MOESI, MESIF). 

<Tabs>
<TabItem value="mesi" label="MESI Protocol" default>

- **Modified (M)**: Line is present only in the current cache and is dirty relative to main memory. Current core has exclusive write permissions.
- **Exclusive (E)**: Line is present only in the current cache and is clean relative to main memory. Current core can transition to Modified without bus transactions.
- **Shared (S)**: Line is present in current cache and potentially other private caches; line is clean relative to main memory. Cores have read-only permissions.
- **Invalid (I)**: Line does not contain valid data. Any access forces a cache miss.

</TabItem>
<TabItem value="false_sharing_trace" label="False Sharing State Cycles">

Consider two cores writing to adjacent bytes inside the same 64-byte line:

1. **Initial**: Core 0 reads `var_a` (State: **Shared**). Core 1 reads `var_b` (State: **Shared**).
2. **Core 0 stores `var_a`**: Core 0 broadcasts an invalidation. Core 1's line transitions from **Shared** to **Invalid**. Core 0 transitions line to **Modified**.
3. **Core 1 stores `var_b`**: Core 1 suffers a cache miss (**Invalid** state). Core 1 broadcasts a read-with-intent-to-modify. Core 0 writes back modified data, invalidates its own copy (**Invalid**). Core 1 receives line, stores `var_b`, and transitions to **Modified**.
4. **Result**: The interconnect is saturated with invalidate messages and line state toggles (ping-ponging).

</TabItem>
</Tabs>

:::warning
False sharing destroys parallel speedup without throwing runtime errors or memory sanitizer faults. Performance degrades dramatically while code logic remains completely correct.
:::

---

## A Worked Example: Counter Ping-Ponging

The following C loop demonstrates an un-padded array of thread-local worker counters. Each thread index writes to its assigned element in `threads_counters`.

```c
// Incorrect: Adjacent 8-byte uint64_t counters share a single 64-byte cache line.
// 8 counters fit into one 64-byte line!
typedef struct {
    uint64_t counter;
} ThreadData;

void worker_loop(ThreadData *threads_counters, int thread_id, int iterations) {
    for (int i = 0; i < iterations; ++i) {
        // Every store invalidates the shared cache line for all neighboring threads (thread_id +- 7)
        threads_counters[thread_id].counter++;
    }
}
```

Below is the assembly instruction sequence generated for the inner loop body on a 64-bit architecture:

```assembly
.LBB0_2:                                 ; Loop header
        movq    (%rdi,%rax,8), %rdx     ; Read counter value into temporary register %rdx
        incq    %rdx                    ; Increment register value
        movq    %rdx, (%rdi,%rax,8)     ; Store updated value back to memory array
        decq    %rsi                    ; Decrement iteration counter
        jnz     .LBB0_2                 ; Loop back if iterations remaining
```

### Trace Walkthrough

1. **Line Layout**: `threads_counters[0]` sits at offset `0x00`. `threads_counters[1]` sits at offset `0x08`. Both live on cache line starting at physical address `0x1000`.
2. **Thread 0 (Core 0)**: Executes `movq` (store) to `0x1000`. Core 0 sends a bus/interconnect invalidation signal. Core 0 obtains the line in **Modified** state.
3. **Thread 1 (Core 1)**: Executes `movq` (load) from `0x1008`. The line at `0x1000` is currently **Invalid** in Core 1's L1 cache.
4. **Stall Event**: Core 1 stalls execution waiting for Core 0 to flush/transfer the line `0x1000` across the interconnect.
5. **Thread 1 Store**: Core 1 executes `movq` (store) to `0x1008`. It sends an invalidation back to Core 0, forcing Core 0's copy of `0x1000` to become **Invalid**.
6. **Execution Bottleneck**: The pipeline stalls indefinitely on memory sub-system invalidation roundtrips, reducing parallel execution to serialized bus operations.

### Correct Compiler Alignment & Scalar Transformation

To resolve this issue, the compiler or software engineer applies alignment padding or scalar replacement:

```c
// Correct Solution A: Pad structure to hardware cache line size (64 bytes)
typedef struct {
    uint64_t counter;
    uint8_t  padding[56]; // Guarantees next element starts on a distinct cache line
} __attribute__((aligned(64))) PaddedThreadData;

// Correct Solution B: Scalar replacement (Accumulate locally, store once)
void worker_loop_optimized(ThreadData *threads_counters, int thread_id, int iterations) {
    uint64_t local_accumulator = 0; // Stack register storage
    for (int i = 0; i < iterations; ++i) {
        local_accumulator++;
    }
    // Single write upon completion avoids inter-core false sharing during processing
    threads_counters[thread_id].counter = local_accumulator;
}
```

```assembly
; Assembly of optimized scalar replacement loop:
.LBB1_2:                                 ; Scalar loop body
        incq    %rcx                    ; Increment local register %rcx (no memory access!)
        decq    %rsi                    ; Decrement loop count
        jnz     .LBB1_2                 ; Continue loop
        
        movq    %rcx, (%rdi,%rax,8)     ; Final write to memory after loop completion
```

---

## What the Compiler Can and Cannot Do

Analyzing performance using the **CPU Performance Equation**:

$$\text\{CPU Time\} = \text\{Instruction Count\} \times \text\{CPI\} \times \text\{Cycle Time\}$$

False sharing does **not** increase the instruction count. Instead, it causes severe hardware stalls that massively inflate the average **Cycles Per Instruction (CPI)**.

```
+-------------------------------------------------------------------------+
|                    Compiler Optimization Levers                          |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ Data Layout & Struct Padding ]                                       |
|  Insert 64-byte alignment attributes to split global arrays onto        |
|  separate physical cache lines.                                         |
|                                                                         |
|  [ Scalar Replacement ]                                                 |
|  Promote global array modifications inside loops into register          |
|  scalars, deferring memory stores to post-loop execution.               |
|                                                                         |
|  [ Loop Chunking & Tiling ]                                             |
|  Transform parallel iteration spaces so threads process contiguous       |
|  blocks large enough to dominate single line boundaries.                |
|                                                                         |
+-------------------------------------------------------------------------+
```

### What the compiler CAN do:
1. **Automatic Field Padding**: When generating global/static data allocations or synthetic structs, backend passes can force structure alignments to 64 bytes (or the target's cache-line byte boundary).
2. **Scalar Replacement of Aggregates**: Static analysis tools identify thread-private iterations and hoist writes to global pointers out of inner loops, accumulating results in local architectural registers.
3. **Loop Privatization**: Automatic loop parallelizers (e.g., OpenMP auto-vectorization/parallelization passes) allocate thread-local reduction arrays with padded stride offsets.

### What the compiler CANNOT do:
1. **Control Dynamic Heap Allocations**: If a C/C++ program calls `malloc(sizeof(int))` in parallel threads, the runtime memory allocator decides pointer addresses. If the allocator places two heap chunks on the same 64-byte line, the compiler cannot dynamically prevent hardware false sharing without heap runtime support.
2. **Detect Opaque Pointer Aliasing Across Translation Units**: If two functions receive external pointers (`int *a, int *b`), the compiler cannot determine at compile time whether `a` and `b` will reside on the same line at runtime without whole-program Link-Time Optimization (LTO) or profile-guided checks.
3. **Control Hardware Cache Line Size Dynamically**: Cache line size is fixed by hardware architecture (typically 64 bytes on modern x86/ARM, 128 bytes on certain IBM POWER architectures). Compilers must target explicit platform ABI assumptions.

---

## Common Misconceptions

### Misconception 1: "False sharing causes software data races and memory corruption."
**Fact**: False sharing is exclusively a **performance hazard**, not a correctness bug. The hardware cache coherence protocol guarantees memory consistency and correctness. Software logical data remains strictly separated, but hardware latency degrades due to line invalidations.

### Misconception 2: "Language-level `volatile` or atomic variables prevent false sharing."
**Fact**: Declaring variables `volatile` or using atomic instructions (`std::atomic`) **exacerbates** false sharing. Atomic instructions force immediate store buffer flushes and bus lock acquisitions, triggering faster cache line invalidation cycles across core interconnects.

### Misconception 3: "SMT hardware threads avoid false sharing because they reside on the same physical core."
**Fact**: SMT threads share the L1 data cache, so they do not trigger inter-core interconnect invalidation messages. However, SMT threads still experience **L1 cache line thrashing and store buffer contention** if they concurrently update adjacent bytes, forcing execution pipelines to serialize memory access ordering.

---

## What To Read Next

- [/docs/coa/intro_to_coa](/docs/coa/intro_to_coa) — Computer Architecture vs Computer Organization: ISA contract vs implementation
- [/docs/coa/memory-hierarchy](/docs/coa/memory-hierarchy) — Memory hierarchy, spatial locality, and miss latencies
- [/docs/coa/memory-consistency](/docs/coa/memory-consistency) — Memory consistency, acquire/release semantics, and memory barriers

<div>
  <AdBanner />
</div>

![Diagram](/img/coa/smt-multicore-false-sharing.svg)

## References

1. Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach*. 6th Edition, Morgan Kaufmann. (Chapter 5: Multiprocessors and Thread-Level Parallelism).
2. Stallings, W. *Computer Organization and Architecture: Designing for Performance*. Pearson. (Multicore and Cache Coherence mechanisms).
3. Linux Kernel Documentation. *Memory Barriers and Cache Line Alignment*. (`include/linux/cache.h`).
4. Intel® 64 and IA-32 Architectures Optimization Reference Manual. (Section on Optimization for Hyper-Threading Technology and Cache Line Bouncing).
