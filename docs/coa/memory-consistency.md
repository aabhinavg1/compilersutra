---
title: "Memory consistency: Hardware guarantees and compiler reordering"
description: "Learn how modern hardware memory consistency models interlock with language memory models and backend optimization passes."
keywords:
  - memory consistency
  - memory consistency model
  - sequential consistency
  - total store order
  - TSO
  - relaxed memory model
  - weak memory ordering
  - acquire release semantics
  - store buffer
  - store forwarding
  - memory fence
  - memory barrier
displayed_sidebar: coasidebar
slug: /coa/memory-consistency
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Memory consistency: Hardware guarantees and compiler reordering

Hardware memory consistency defines the legal ordering of shared memory reads and writes across multiple CPU cores, whereas the language memory model defines what optimizations an optimizing compiler may perform across threads. For a backend compiler engineer, understanding the boundaries between compiler instruction reordering, microarchitectural execution buffer behavior, and explicit memory fences is essential to emitting correct, high-performance concurrency primitives.

:::tip Read these first
- Learn about the hardware instruction pipeline in [Instruction flow in a modern CPU](/docs/coa/instruction_flow_modern_cpu).
- Understand memory primitives and memory access mechanics in [Load-store architecture](/docs/coa/load-store-architecture).
:::

:::important What you should leave with
- The architectural memory model is a hardware contract; the language memory model is a software contract; microarchitectural execution (such as out-of-order execution and store buffering) implements the former.
- Compilers may freely reorder memory operations unless prohibited by language acquire/release semantics or explicit memory barriers.
- Weak hardware memory models allow load/store operations to complete out of architectural order unless explicit fence instructions are emitted into the instruction stream.
- Cache coherence guarantees a single global ordering per individual memory location; memory consistency specifies ordering rules across different memory locations.
:::

:::caution Who this is not for
If you are looking for an introduction to single-threaded hazard detection or pipeline stalls, read [Pipeline hazards: data, control, and structural](/docs/coa/pipeline-hazards) first.
:::

:::note
Memory consistency instructions (fences and atomic ops) enforce sequence constraints across cores, but they do not alter the physical cache geometry, line sizes, or cache-line transfer latencies.
:::

<div>
  <AdBanner />
</div>

## Table of Contents
1. [TL;DR](#tldr)
2. [The mechanism](#the-mechanism)
3. [Memory consistency models compared](#memory-consistency-models-compared)
4. [A worked example: Peterson's Lock and Acquire-Release](#a-worked-example-petersons-lock-and-acquire-release)
5. [What the compiler can and cannot do](#what-the-compiler-can-and-cannot-do)
6. [Common misconceptions](#common-misconceptions)
7. [What To Read Next](#what-to-read-next)
8. [References](#references)

---

## TL;DR
- **Distinguish coherence from consistency**: Coherence dictates that all cores agree on a single modification order for *one* address; consistency dictates the visible order of operations across *multiple* addresses.
- **Match language models to hardware models**: Strong hardware models like Total Store Order (TSO) prevent Load-Load, Load-Store, and Store-Store reorderings in hardware, but the compiler backend must still enforce ordering at compile time to stop optimization passes from reordering code.
- **Use acquire-release pairs for synchronizing data**: A store-release on a writing core paired with a load-acquire on a reading core creates a strict happens-before edge without paying the full performance penalty of sequentially consistent global fences.
- **Do not rely on single-core program order**: Microarchitectural store buffers allow local cores to read their own pending stores early (store forwarding) before those stores become visible to external cores.

---

## The mechanism

Memory consistency dictates how memory accesses across different memory locations appear to execute to other threads or hardware cores. While single-core execution models enforce program order through hardware register renaming and reorder buffers (as detailed in [Instruction flow in a modern CPU](/docs/coa/instruction_flow_modern_cpu)), multi-threaded execution exposes the hidden queues, buffers, and interconnect topologies of modern chips.

When a thread issues a write instruction, the data does not instantly commit to shared L2/L3 caches or main memory. Instead, to prevent execution stalls, the core writes the data to a local, core-private store buffer. While the local core can read back its own pending updates via store forwarding, remote cores cannot inspect this store buffer. Remote cores only observe the update when the store buffer drains into the shared cache hierarchy via the cache coherence protocol.

:::tip Note
Cache coherence (such as MESI/MOESI protocols) ensures that all processors observe the same value for a *single* memory location at any given instant. Memory consistency governs the permitted interleavings and visible completion order of accesses across *distinct* memory locations.
:::

| Access Pattern / Situation | Hardware Execution Reality | Compiler Optimization Lever |
| :--- | :--- | :--- |
| **Store followed by Load (Different Locations)** | Store buffer holds pending store; load reads L1 cache or drains early. Stores may appear delayed to remote cores. | Compiler can reorder non-atomic stores and loads across code blocks if no aliases or atomic flags exist. |
| **Load followed by Load (Different Locations)** | Out-of-order engine speculatively executes loads out of program sequence. | Compiler reorders loads to increase Instruction-Level Parallelism (ILP) and maximize register usage. |
| **Store followed by Store (Different Locations)** | Store buffers may coalesce or drain out-of-order in weakly-ordered architectures. | Compiler reorders stores to optimize cache-line writes or dead-store elimination. |
| **Atomic Store-Release / Load-Acquire** | Execution engine inserts bus/cache locks or architectural barrier instructions (`dmb`, `fence`). | Compiler suppresses instruction reordering across the atomic point and emits proper hardware fence encodings. |

```
 Thread 1 (Core 0)                      Thread 2 (Core 1)
+-----------------------+              +-----------------------+
| Store A = 1           |              | Load B                |
+-----------+-----------+              +-----------+-----------+
            |                                      |
            v                                      v
+-----------------------+              +-----------------------+
| Core 0 Store Buffer   |              | Core 1 Load Speculation|
| (Private to Core 0)   |              | (Speculative Read)    |
+-----------+-----------+              +-----------+-----------+
            | Drains over                          | Reads Shared
            | Coherence Bus                        | Cache Line
            v                                      v
+--------------------------------------------------------------+
|             Interconnect & Shared Cache (L2 / L3)           |
+--------------------------------------------------------------+
```

![Overview of multi-core store buffers and load speculation impacting visibility](/img/coa/memory-consistency.svg)

*Diagram: Store buffers delay visibility of updates to external cores, while load speculative execution can fetch stale shared cache values unless hardware barriers enforce ordering.*

:::warning
Failing to understand the difference between compiler-level reordering and hardware-level reordering leads to broken synchronization primitives. A `compiler_barrier()` macro prevents the compiler from moving instructions across a point in the source code, but it emits zero hardware instructions, leaving the hardware free to reorder accesses at runtime on weak-memory architectures.
:::

---

## Memory consistency models compared

Different processor architectures guarantee different operational constraints. Hardware models range from strict Sequential Consistency down to Weak or Relaxed Memory Ordering.

<Tabs>
<TabItem value="sc" label="Sequential Consistency (SC)" default>

### Sequential Consistency (SC)
Defined by Leslie Lamport in 1979, Sequential Consistency guarantees that the result of any execution is the same as if the operations of all processors were executed in some sequential order, and the operations of each individual processor appear in this sequence in the order specified by its program.

- **Hardware behavior**: No reordering of any load or store relative to any other load or store is permitted. Store buffers must drain immediately or appear to drain synchronously to all cores.
- **Compiler implications**: The compiler cannot swap any memory references across program statements.
- **Performance impact**: High hardware overhead; disables critical speculative optimizations and load-store reordering mechanisms. Virtually no modern high-performance general-purpose processor enforces pure SC in hardware without explicit barrier instructions.

</TabItem>
<TabItem value="tso" label="Total Store Order (TSO)">

### Total Store Order (TSO)
Used by architectures such as x86-64. TSO maintains program order for Load-Load, Load-Store, and Store-Store operations. However, it permits **Store-Load reordering**.

- **Hardware behavior**: Stores are written to a FIFO store buffer. A core can read its own pending stores via store forwarding. Remote cores see stores only when they drain to the cache. This allows a load to execute before an earlier store to a *different* memory location has become globally visible.
- **Compiler implications**: The compiler knows the hardware will not reorder Load-Load, Load-Store, or Store-Store operations. However, to guarantee Sequential Consistency for language-level operations, the compiler must emit a full fence (such as `MFENCE` or `LOCK`-prefixed operations) when a Store-Load order must be strictly preserved.
- **Reorder Matrix**:
  - Load-Load reordered? **No**
  - Load-Store reordered? **No**
  - Store-Store reordered? **No**
  - Store-Load reordered? **Yes**

</TabItem>
<TabItem value="weak" label="Weak / Relaxed Memory Model">

### Weak / Relaxed Memory Model
Used by architectures such as ARMv8 (AArch64) and RISC-V. In these architectures, **all four memory access combinations** (Load-Load, Load-Store, Store-Store, Store-Load) can be reordered by the hardware unless explicit barrier instructions or annotated memory access operations are provided.

- **Hardware behavior**: Cores feature out-of-order speculative load execution, non-FIFO store buffers, and invalidate queues. Stores can become visible to different cores in different orders unless separated by hardware fences.
- **Compiler implications**: The backend must explicitly emit acquire-release instructions (such as ARMv8 `LDAR`/`STLR`) or dedicated memory barrier instructions (`DMB ISH`, `FENCE`) when translating language-level atomic operations.
- **Reorder Matrix**:
  - Load-Load reordered? **Yes**
  - Load-Store reordered? **Yes**
  - Store-Store reordered? **Yes**
  - Store-Load reordered? **Yes**

</TabItem>
</Tabs>

---

## A worked example: Peterson's Lock and Acquire-Release

Consider a multi-threaded scenario where Thread 0 publishes data to Thread 1. We inspect both the high-level C++ synchronization intent, the LLVM IR representation, and the resulting low-level assembly sequence.

### Source Code: Data Publication Pattern

```c
// Shared variables across cores
// Address 0x1000: data_payload (uint32_t)
// Address 0x1004: ready_flag   (atomic uint32_t)

// Thread 0: Writer
void publish_data(uint32_t *data_payload, _Atomic uint32_t *ready_flag) {
    *data_payload = 42; // Regular store
    __atomic_store_n(ready_flag, 1, __ATOMIC_RELEASE); // Store-Release
}

// Thread 1: Reader
uint32_t consume_data(uint32_t *data_payload, _Atomic uint32_t *ready_flag) {
    while (__atomic_load_n(ready_flag, __ATOMIC_ACQUIRE) == 0) {
        // Spin wait
    }
    return *data_payload; // Regular load
}
```

### Step-by-Step Lowering into LLVM IR

The frontend translates the source into LLVM IR using `atomic` attributes.

```llvm
; Thread 0: Writer IR
define void @publish_data(ptr %data_payload, ptr %ready_flag) {
entry:
  ; Regular store to payload (0x1000)
  store i32 42, ptr %data_payload, align 4
  
  ; Store-release to flag (0x1004)
  store atomic i32 1, ptr %ready_flag release, align 4
  ret void
}

; Thread 1: Reader IR
define i32 @consume_data(ptr %data_payload, ptr %ready_flag) {
entry:
  br label %loop

loop:
  ; Load-acquire from flag (0x1004)
  %flag = load atomic i32, ptr %ready_flag acquire, align 4
  %cmp = icmp eq i32 %flag, 0
  br i1 %cmp, label %loop, label %exit

exit:
  ; Regular load from payload (0x1000)
  %val = load i32, ptr %data_payload, align 4
  ret i32 %val
}
```

### Hardware Instruction Generation Comparison

Let's observe how target instruction selectors map these LLVM IR acquire/release semantics onto different hardware memory models.

```assembly
; Target: x86-64 (TSO Hardware Model)
; Thread 0 (Writer)
publish_data:
    mov l42, (%rdi)          ; Store payload (Hardware guarantees no Store-Store reordering)
    movl $1, (%rsi)          ; Store-release flag (Plain MOV is sufficient under TSO!)
    ret

; Thread 1 (Reader)
consume_data:
.Lloop:
    movl (%rsi), %eax        ; Load-acquire flag (Plain MOV is sufficient under TSO!)
    testl %eax, %eax
    jz .Lloop
    movl (%rdi), %eax        ; Load payload
    ret
```

Under x86-64's TSO model, regular hardware stores and loads already prevent Load-Load, Load-Store, and Store-Store reordering. Therefore, the compiler emits standard `mov` instructions for acquire-release semantics!

Now look at target lowering under a weak hardware model:

```assembly
; Target: ARMv8-A / AArch64 (Weak Hardware Model)
; Thread 0 (Writer)
publish_data:
    mov w2, #42
    str w2, [x0]             ; Store payload to [x0]
    stlr wzr, [x1]           ; STLR (Store-Release Register): Enforces that store to [x0]
                             ; must complete and become visible BEFORE store to [x1]
    ret

; Thread 1 (Reader)
consume_data:
.Lloop:
    ldar w2, [x1]            ; LDAR (Load-Acquire Register): Enforces that load from [x1]
                             ; completes BEFORE any subsequent loads (such as [x0]) can execute
    cbz w2, .Lloop
    ldr w0, [x0]             ; Load payload from [x0]
    ret
```

:::caution
If the ARM backend omitted `stlr` and `ldar`, and instead emitted standard `str` and `ldr` instructions:
1. Thread 0's core could flush the store to `ready_flag` (`[x1]`) to the interconnect *before* the store to `data_payload` (`[x0]`) drains from its store buffer.
2. Thread 1's out-of-order execution engine could speculatively read `data_payload` (`[x0]`) *before* reading `ready_flag` (`[x1]`).
3. Thread 1 would observe `ready_flag == 1` but read uninitialized/stale garbage from `data_payload`!
:::

---

## What the compiler can and cannot do

Understanding the boundary of compiler control relative to hardware capabilities prevents bugs and avoids over-constraining the instruction scheduler.

```
       CPU Performance Equation: Time = Instruction Count * CPI * Clock Cycle Time
                                              |              |
 Compiler Levers:                             v              v
  - Reordering / Scheduling              (Influences)   (Indirectly
  - Vectorization / Selection                           Influences)
  - Fence & Barrier Insertion
```

### Compiler Levers and Optimizations

1. **Instruction Selection for Atomics**:
   The backend maps high-level memory order constraints (e.g., C++11 `memory_order_seq_cst`, `memory_order_acquire`, `memory_order_relaxed`) to specific target instructions. For instance, `memory_order_seq_cst` stores on x86-64 require an `XCHG` instruction or an `MFENCE` instruction to block Store-Load reordering, whereas `memory_order_release` needs only a basic `MOV`.

2. **Pass Interlocking (Optimization Barriers)**:
   Optimization passes like Dead Store Elimination (DSE), Loop-Invariant Code Motion (LICM), and Global Value Numbering (GVN) treat atomic operations as barriers. The compiler cannot host an atomic load out of a loop or remove a store-release that appears redundant within a single thread context.

3. **Fence Minimization**:
   A smart compiler can eliminate redundant memory barriers. If two acquire fences occur back-to-back without intervening memory reads, the backend can coalesce them into a single barrier.

### Hardware Control Boundaries

- **Architectural vs. Physical Registers**: The compiler manages architectural registers (e.g., `%rax`, `x0`). The hardware physical register file and register alias table (RAT) operate dynamically during execution (see [Registers and addressing modes](/docs/coa/registers-and-addressing-modes)).
- **Store Buffer Draining**: The compiler cannot directly force hardware store buffers to drain faster; it can only issue execution-stopping barrier instructions (e.g., `DSB`, `MFENCE`) that stall core pipelines until store buffers are fully committed.
- **Cache-Line Invalidation Latencies**: The compiler has no mechanism to bypass cache coherence messages. If Core 1 holds a line in Exclusive state, Core 0 must wait for invalidation acknowledgments regardless of how optimal the compiled instruction sequence is.

```
+-----------------------------------------------------------------------+
| Language Memory Model Contract (C++ / Rust / Java)                    |
| - Specifies happens-before guarantees                                  |
| - Prohibits data races                                                |
+-----------------------------------------------------------------------+
                                   |
                       Compiler Translation Layer
                                   v
+-----------------------------------------------------------------------+
| Target ISA Memory Consistency Contract (x86 TSO, ARM Weak, RISC-V)    |
| - Hardware guarantees for load/store ordering                         |
| - Explicit architectural barrier instructions                         |
+-----------------------------------------------------------------------+
                                   |
                    Microarchitectural Implementation
                                   v
+-----------------------------------------------------------------------+
| Hardware Components (Store Buffers, Invalidate Queues, MESI Protocol) |
| - Speculative load engines, out-of-order retirement logic             |
+-----------------------------------------------------------------------+
```

---

## Common misconceptions

### Misconception 1: "The `volatile` keyword in C/C++ guarantees multi-threaded memory consistency."
**Correction**: In standard C/C++, `volatile` informs the compiler that a memory location can be modified outside the compiler's control (e.g., memory-mapped I/O hardware registers). It prevents the compiler from optimizing away reads or writes within a single thread. However, `volatile` does **not** emit hardware memory barriers, does **not** generate acquire/release atomic instructions, and does **not** prevent out-of-order execution engines on weakly-ordered hardware from reordering accesses across threads.

### Misconception 2: "Hardware store buffers are identical to compiler write buffers."
**Correction**: Compiler optimizations (like store coalescing) occur entirely at compile time by altering instruction sequences. Hardware store buffers are physical SRAM structures inside the processor core that hold committed or speculatively executed stores waiting to acquire cache ownership via the bus coherence protocol.

### Misconception 3: "x86 processors do not require memory fences because x86 uses TSO."
**Correction**: While x86-64 hardware prevents Load-Load, Load-Store, and Store-Store reordering, it **does** permit Store-Load reordering. Algorithms relying on full Sequential Consistency (such as Dekker's or Peterson's algorithm for mutual exclusion) fail on x86-64 unless a store followed by a load across different addresses is separated by an `MFENCE` or an atomic instruction like `LOCK XADD` or `XCHG`.

### Misconception 4: "Acquire-release ordering acts as a global fence across all system cores."
**Correction**: Acquire-release semantics establish ordering *only* between threads that synchronize on the *same* atomic variable. A store-release on Core 0 paired with a load-acquire on Core 1 creates a local happens-before edge. It does not force a global pipeline flush across unrelated cores (Core 2 and Core 3), unlike sequentially consistent hardware barriers.

---

## What To Read Next

- Explore overall execution mechanisms in [Sequential to speculative execution](/docs/coa/types_of_execution).
- Learn how pipelines handle execution dependencies in [Instruction-level parallelism](/docs/coa/instruction-level-parallelism).
- Study compiler-driven loop and memory alignment transformations in [Cache optimizations the compiler can do](/docs/coa/cache-optimizations-the-compiler-can-do).

<div>
  <AdBanner />
</div>

## References

- Lamport, L. (1979). *How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs*. IEEE Transactions on Computers, C-28(9), 690-691.
- Adve, S. V., & Gharachorloo, K. (1996). *Shared Memory Consistency Models: A Tutorial*. IEEE Computer, 29(12), 66-76.
- Sewell, P., Sarkar, S., Owens, S., Zappa Nardelli, F., & Myreen, M. O. (2010). *x86-TSO: a rigorous and usable programmer's model for x86 multiprocessors*. Communications of the ACM, 53(7), 89-97.
- Hennessy, J. L., & Patterson, D. A. *Computer Architecture: A Quantitative Approach* (6th ed.). Morgan Kaufmann.
- ISO/IEC 14882:2020 *Programming Languages — C++ (Language Memory Model Section)*.
