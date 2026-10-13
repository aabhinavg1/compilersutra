---
title: "Shared memory versus distributed memory"
description: "How uniform address spaces and disjoint rank namespaces dictate lowering choices, pointer representations, and runtime communication protocols in parallel compilers."
keywords:
  - shared memory architecture
  - distributed memory architecture
  - global address space
  - rank local namespace
  - openmp memory model
  - mpi address spaces
  - cache coherence protocols
  - message passing interface
  - virtual memory mapping
  - pointer dereference cost
  - NUMA awareness
  - explicit message passing
  - PGAS partition global address space
  - compiler lowering strategies
  - thread communication cost
  - rank isolation
  - remote direct memory access
  - runtime network transport
  - hardware memory buses
  - distributed memory runtime
  - shared memory compiler runtime
  - inter-process communication
  - pointer serialization
  - page fault overhead
  - hardware interconnect latency
  - dynamic load balancing constraints
  - memory hierarchy translation
  - cross-rank pointer validity
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/shared-versus-distributed-memory
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Shared memory versus distributed memory

A shared-memory architecture presents a single unified address space to all executing execution contexts, whereas a distributed-memory system divides state across distinct process namespaces that cannot directly resolve each other's memory addresses. For compiler and runtime engineers, this hardware-level boundary determines whether variable access lowers into simple memory dereferences guarded by coherence protocols or into explicit network payload construction and non-blocking transport calls.

:::tip Read these first
- [/docs/parallel-computing/fundamentals/program-process-thread-core](/docs/parallel-computing/fundamentals/program-process-thread-core) to review how threads share address spaces within a process while processes enforce virtual memory isolation.
- [/docs/parallel-computing/fundamentals/memory-models](/docs/parallel-computing/fundamentals/memory-models) to understand hardware coherence, consistency rules, and atomic synchronization.
:::

:::important What you should leave with
A pointer valid on one rank in a distributed-memory system is completely meaningless on another rank, whereas in shared memory, any pointer value can be safely dereferenced by any core given correct synchronization.
:::

:::note
Shared memory models abstract communication behind hardware cache-coherence protocols, while distributed memory models require explicit programmer or runtime software directives to exchange data across network boundaries.
:::

:::caution
Attempting to dereference a local address passed from a remote rank in a distributed environment causes an immediate segmentation fault or garbage access, as virtual memory translation tables are local to each operating system process.
:::

:::warning
Compilers cannot automatically transform arbitrary pointer-heavy serial code into a distributed-memory program without either explicit global address space abstractions or static proof of alias-free data ownership boundaries.
:::

## Table of Contents

1. [Why you should care](#why-you-should-care)
2. [The mechanism](#the-mechanism)
3. [A comparison](#a-comparison)
4. [A worked example](#a-worked-example)
5. [What the compiler and the runtime can and cannot do](#what-the-compiler-and-the-runtime-can-and-cannot-do)
6. [Common misconceptions](#common-misconceptions)
7. [Where this leaves you](#where-this-leaves-you)
8. [What To Read Next](#what-to-read-next)

---

## Why you should care

Consider a basic loop that updates an array element based on its neighbor:

```c
for (int i = 1; i < N; i++) {
    A[i] = A[i] + B[i - 1];
}
```

When executing this kernel across multiple execution contexts, the physical distribution of array `B` dictates the code a compiler can emit. If `A` and `B` reside in a shared memory space, every hardware thread can evaluate `B[i - 1]` by emitting a standard load instruction. The hardware system bus and L1/L2/L3 cache coherence machinery handle bringing the cache line holding `B[i - 1]` to the execution core. The primary concern for the runtime is memory consistency and false sharing.

If this same loop is split across a distributed-memory cluster, `B[i - 1]` might live in the RAM module attached to a physically distinct server rack node. Thread 0 running on Rank 0 cannot execute `mov rax, [rbx + rcx]` to fetch data attached to Rank 1. The operating system page tables on Rank 0 do not contain hardware mappings for Rank 1's physical DRAM.

For runtime and compiler engineers, this fundamental split drives every architectural decision:
1. **Lowering Strategy:** Shared-memory directives (such as OpenMP parallel loops) lower into thread-spawning calls, stack frame pointers, and shared pointer passes. Distributed-memory models (such as MPI or PGAS) lower into rank identification, explicit buffer allocations, pack/unpack serialization routines, and network device driver hooks.
2. **Pointer Semantics:** In shared memory, a 64-bit integer pointer is a universal identifier for a location in the virtual address space. In distributed memory, an address is valid only within its originating process namespace. A remote address requires a tuple consisting of `(Rank ID, Local Offset)`.
3. **Failure Domains and Latency:** Memory access in shared system architectures spans tens to hundreds of nanoseconds via NUMA interconnects. Remote access in distributed architectures involves network protocol stacks, serializing controllers, and packet transit times measured in microseconds.

Understanding this hardware dichotomy prevents subtle runtime errors and informs how middle-end IR passes structure loop transformations, data partitioning, and communication injection.

---

## The mechanism

The fundamental distinction between shared and distributed systems lies in how hardware exposes physical memory modules to the CPU's execution pipeline and how the operating system configures virtual address translation.

In a **Shared Memory Machine**, multiple CPU cores access one or more physical DRAM banks over a unified bus or interconnect (such as AMD Infinity Fabric or Intel UPI). Every core shares a single virtual address space or mapped execution context. Although physical access times may vary (Non-Uniform Memory Access or NUMA), any hardware core can construct a memory address, issue a load or store instruction, and read or write that byte. Cache coherence protocols (such as MESI or MOESI) ensure that cache lines replicated across core-local L1/L2 caches maintain a unified state across the system.

In a **Distributed Memory Machine**, the architecture consists of independent nodes joined by a network fabric (such as InfiniBand or Ethernet). Each node possesses its own distinct CPU, local memory controllers, and isolated physical DRAM. There is no central hardware mechanism to keep caches coherent across nodes. Node 0's operating system manages its virtual page table independently of Node 1's operating system. As a result, Virtual Address `0x7fff5fbff010` on Node 0 points to a physical frame in Node 0's local DRAM and bears no relationship to Virtual Address `0x7fff5fbff010` on Node 1.



When a compiler transforms a loop for shared memory, it uses threads that inherit or share page tables. OpenMP constructs, for example, lower into runtime function calls (e.g., `GOMP_parallel` in GCC or `__kmpc_fork_call` in LLVM/Clang) that pass stack pointers to worker threads. Data transfer requires no explicit buffer copies; data movement is governed entirely by hardware cache line invalidations.

In contrast, when compiling or targeting a distributed memory abstraction (such as MPI or PGAS languages like Chapel or UPC++), data cannot move without programmatic runtime intervention. The runtime must issue calls to network APIs (such as libfabrics, UCX, or MPI inner layers) to explicitly push or pull data payloads across physical network interfaces using sockets or Remote Direct Memory Access (RDMA).

---

## A comparison

The distinction between shared and distributed systems manifests in execution abstractions, memory representations, compiler transformations, and failure models:

| Dimension | Shared Memory System | Distributed Memory System |
| :--- | :--- | :--- |
| **Address Space Abstraction** | Single unified virtual address space shared across all active execution contexts. | Disjoint address spaces isolated within distinct OS processes (ranks). |
| **Data Access Primitives** | Standard native CPU instructions (`MOV`, `LOAD`, `STORE`, atomic ops). | Explicit API calls (`MPI_Send`, `MPI_Recv`, `UPC++ rput/rget`). |
| **Synchronization Overhead** | Low-latency hardware atomic operations, cache line locks, memory barriers (~10–100 ns). | Network-level barrier messages, handshakes, collective operations (~1–100 µs). |
| **Programming Models** | OpenMP, pthreads, C++ std::thread, Intel TBB. | MPI, SHMEM, PGAS (Chapel, Coarray Fortran), Erlang distribution. |
| **Pointer Validity Scope** | Global: Any valid pointer can be passed across threads and safely dereferenced. | Process-local: A raw pointer is invalid when transmitted to another rank. |
| **Scalability Limit** | Physical system bus saturation, NUMA socket counts, cache coherence traffic limit. | Scalable to hundreds of thousands of independent compute nodes. |
| **Hardware Hardware Controller** | Integrated memory controller, inter-socket coherent interconnects (UPI, Infinity Fabric). | Network Interface Cards (NICs), switches, PCI Express buses, RDMA engines. |
| **Compiler Lowering Output** | Spawns POSIX threads, outlines functions, passes raw pointers in shared structs. | Injects rank-checks, pack/unpack serialization routines, and network driver runtime calls. |

---

## A worked example

To understand how the compiler and runtime manage shared versus distributed environments, compare a parallel vector addition implemented in both OpenMP (shared memory) and MPI (distributed memory).

<Tabs>
<TabItem value="omp" label="OpenMP (Shared Memory)">

```c
#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

void vector_add_shared(double *A, double *B, double *C, int N) {
    // The compiler lowers this loop by outlining the body into a subfunction.
    // The memory buffers A, B, and C are passed as shared pointers across threads.
    #pragma omp parallel for shared(A, B, C) schedule(static)
    for (int i = 0; i < N; i++) {
        C[i] = A[i] + B[i];
    }
}

int main() {
    int N = 1000000;
    double *A = (double *)malloc(N * sizeof(double));
    double *B = (double *)malloc(N * sizeof(double));
    double *C = (double *)malloc(N * sizeof(double));

    for (int i = 0; i < N; i++) {
        A[i] = 1.0;
        B[i] = 2.0;
    }

    // Single unified memory allocation accessed directly by all OpenMP threads
    vector_add_shared(A, B, C, N);

    printf("Shared Result C[0] = %f\n", C[0]);
    free(A); free(B); free(C);
    return 0;
}
```

</TabItem>
<TabItem value="mpi" label="MPI (Distributed Memory)">

```c
#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>

void vector_add_distributed(int N, int rank, int size) {
    // Each rank computes its own local slice size and allocates isolated memory.
    int local_N = N / size;
    double *local_A = (double *)malloc(local_N * sizeof(double));
    double *local_B = (double *)malloc(local_N * sizeof(double));
    double *local_C = (double *)malloc(local_N * sizeof(double));

    double *global_A = NULL;
    double *global_B = NULL;
    double *global_C = NULL;

    if (rank == 0) {
        global_A = (double *)malloc(N * sizeof(double));
        global_B = (double *)malloc(N * sizeof(double));
        global_C = (double *)malloc(N * sizeof(double));
        for (int i = 0; i < N; i++) {
            global_A[i] = 1.0;
            global_B[i] = 2.0;
        }
    }

    // Explicit network transfers: Scatter data from Rank 0's address space to all ranks
    MPI_Scatter(global_A, local_N, MPI_DOUBLE, local_A, local_N, MPI_DOUBLE, 0, MPI_COMM_WORLD);
    MPI_Scatter(global_B, local_N, MPI_DOUBLE, local_B, local_N, MPI_DOUBLE, 0, MPI_COMM_WORLD);

    // Execution proceeds entirely in local, isolated address spaces
    for (int i = 0; i < local_N; i++) {
        local_C[i] = local_A[i] + local_B[i];
    }

    // Gather results back over the network to Rank 0's isolated memory
    MPI_Gather(local_C, local_N, MPI_DOUBLE, global_C, local_N, MPI_DOUBLE, 0, MPI_COMM_WORLD);

    if (rank == 0) {
        printf("Distributed Result C[0] = %f\n", global_C[0]);
        free(global_A); free(global_B); free(global_C);
    }

    free(local_A); free(local_B); free(local_C);
}

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);
    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    vector_add_distributed(1000000, rank, size);

    MPI_Finalize();
    return 0;
}
```

</TabItem>
</Tabs>

### Line-by-Line Code Analysis

#### OpenMP (Shared Memory Execution Model)
1. `#pragma omp parallel for shared(A, B, C) schedule(static)`: The compiler front-end intercepts this pragma and extracts the loop body into an outlined helper function, e.g., `vector_add_shared_omp_fn(void *omp_data)`.
2. `shared(A, B, C)`: Addresses pointing to the heap allocations `A`, `B`, and `C` are packed into a single structure of pointers passed to the runtime thread pool manager (`__kmpc_fork_call`).
3. `C[i] = A[i] + B[i]`: During execution, worker threads calculate their iteration ranges using their thread ID. Every thread issues standard hardware load instructions directly to memory addresses within the process address space.

#### MPI (Distributed Memory Execution Model)
1. `MPI_Init(&argc, &argv)`: The operating system launches distinct OS processes (ranks) on target nodes. Each rank allocates its own private page table, heap, and execution environment.
2. `local_N = N / size`: Rank 0 and all participating worker ranks calculate their localized iteration count. There is no single master pointer array shared across ranks.
3. `MPI_Scatter(...)`: Because Rank 0 holds the initial data in its private memory array `global_A`, it must initiate network packets via the MPI runtime. The runtime copies bytes from Rank 0's memory into network buffers, sends them across PCI Express buses and switches, and writes them into `local_A` on each remote rank.
4. `local_C[i] = local_A[i] + local_B[i]`: The CPU on each rank operates strictly within its local memory region. No cache coherence hardware is involved across nodes.
5. `MPI_Gather(...)`: To aggregate the complete dataset back to a single process context, an explicit network collection protocol is executed, reversing the distribution path.

---

## What the compiler and the runtime can and cannot do

Understanding the compiler and runtime boundary is essential when building parallel languages or optimizing parallel transformations.

### What the Compiler and Runtime CAN Do

1. **Automatic Outlining for Shared Memory:** For constructs targeting shared memory (like OpenMP loops), the compiler easily transforms a block of sequential code into an outlined function and emits runtime invocation calls to distribute iterations among threads.
2. **Injecting Packing Routines for High-Level Distributed Models:** In PGAS frameworks or domain-specific languages (DSLs), compilers can identify remote field accesses, generate static serialization/deserialization stubs, and lower array indexing operations into non-blocking RDMA put/get runtime calls.
3. **NUMA-Aware Memory Binding:** Modern runtimes can bind worker threads to specific CPU cores and allocate physical memory pages on the local NUMA node using OS calls like `mbind()` or `numactl`, preventing cross-socket interconnect latency in shared memory systems.
4. **Coalescing Network Communication:** For distributed memory targets, high-level compiler passes can analyze loops to merge multiple scalar remote variable fetches into a single bulk network message.

### What the Compiler and Runtime CANNOT Do

1. **Automatically Resolve Arbitrary Distributed Pointers:** A C/C++ compiler cannot automatically transform pointer-heavy code (like linked lists or graph data structures with raw native pointers) to run across a distributed memory cluster. Raw 64-bit pointers cannot be automatically converted to remote rank/offset representations without runtime tracking wrappers.
2. **Eliminate Distributed Memory Network Latency:** While a compiler can hoist, coalesce, or overlap network calls using non-blocking primitives, it cannot eliminate physical network interconnect latency. A network traversal across InfiniBand switches will take hundreds of nanoseconds to microseconds, regardless of compiler optimizations.
3. **Guarantee Coherence in Distributed Software Systems:** Compilers cannot synthesize hardware-level cache coherence across separate nodes without substantial performance overhead. Software-distributed shared memory (DSM) runtimes must rely on page fault handling (`mprotect`), which introduces huge latency penalties relative to native hardware cache coherence.
4. **Detect Low-Level Data Races Across Network Endpoints:** Static analysis passes inside compilers struggle to verify race conditions across distributed asynchronous communication protocols (such as non-blocking `MPI_Irecv` calls paired with local operations), relying instead on dynamic validation tools.

---

## Common misconceptions

### Misconception 1: "Shared memory means all threads access physical DRAM with identical, uniform latency."

**Correction:** Modern shared memory machines are almost exclusively Non-Uniform Memory Access (NUMA) systems. While every thread can address any memory location in the unified address space, accessing DRAM directly attached to a remote socket's memory controller takes significantly longer than reading from local socket DRAM. Shared memory provides functional addressability, not uniform access timing.

### Misconception 2: "Distributed memory models cannot run on a single multi-core shared-memory machine."

**Correction:** Distributed memory software frameworks (such as MPI) run routinely on single multi-core nodes. The runtime accomplishes this by spawning separate OS processes for each rank. Communication between these processes on the same machine utilizes shared-memory IPC channels or loopback memory buffers, bypassing actual physical network hardware while preserving isolated process address spaces.

### Misconception 3: "A compiler can automatically vectorizing and parallelize any loop for a distributed cluster if given appropriate pragmas."

**Correction:** Automatic distributed-memory code generation requires strict static guarantees about memory allocation and access patterns. Pragmas can guide loop decomposition, but if the loop contains arbitrary pointer indirection, dynamic heap mutations, or implicit global state, the compiler cannot automatically emit valid network data-exchange routines without risk of incorrect execution.

---

## Where this leaves you

When writing parallel algorithms, designing compiler passes, or building runtimes, evaluate your memory access mechanics first:

1. **Check your pointer scope:** If your language construct or data structure relies on direct raw pointer dereferences across execution contexts, it must execute within a shared memory domain (or under a explicit Global Address Space runtime abstraction).
2. **Check your data access locality:** If building for distributed architectures, explicitly isolate computation to local rank buffers, using structured, coarse-grained communication phases to exchange state across remote namespaces.

---

## What To Read Next

Continue exploring CPU parallel architecture and execution mechanisms across these related compiler and runtime tracks:

- [/docs/parallel-computing/fundamentals/program-process-thread-core](/docs/parallel-computing/fundamentals/program-process-thread-core) — Lower-level thread abstraction models, process memory spaces, and OS scheduling.
- [/docs/parallel-computing/fundamentals/memory-models](/docs/parallel-computing/fundamentals/memory-models) — Sequential consistency, relaxed memory ordering, acquire-release semantics, and atomic hardware operations.
- [/docs/parallel-computing/simd-mimd-and-the-interconnect](/docs/parallel-computing/simd-mimd-and-the-interconnect) — Hardware instruction execution models and physical interconnect design.

<AdBanner />

![Diagram](/img/parallel/shared-versus-distributed-memory.svg)

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann, 2011. (Chapter 2: Parallel Hardware and Parallel Software).
- Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*. 2nd Edition, Addison-Wesley, 2003. (Chapter 2: Parallel Programming Platforms).
- OpenMP Architecture Review Board. *OpenMP Application Programming Interface*, Version 5.2.
- Message Passing Interface Forum. *MPI: A Message-Passing Interface Standard*, Version 4.0.
