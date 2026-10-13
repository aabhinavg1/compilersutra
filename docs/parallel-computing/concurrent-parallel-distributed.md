---title: "Concurrent, Parallel, and Distributed"
description: "Understand the structural differences between concurrency, parallelism, and distributed execution to design correct compiler optimizations and runtime schedulers."
keywords:
  - concurrent vs parallel
  - distributed computing
  - compiler optimization
  - runtime scheduler
  - shared memory
  - message passing
  - thread scheduling
  - instruction stream
  - memory models
  - hardware cores
  - distributed memory
  - task overlapping
  - execution context
  - synchronization barrier
  - cache coherence
  - network latency
  - MPI
  - OpenMP
  - task parallelism
  - data parallelism
  - out of order execution
  - compiler transformations
  - process isolation
  - virtual memory
  - scheduling latency
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/concurrent-parallel-distributed
---

import AdBanner from '@site/src/components/AdBanner';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Concurrent, Parallel, and Distributed

Concurrency is a property of the program structure where execution lifetimes overlap, whereas parallelism and distributed execution are properties of the physical hardware target. For compiler and runtime engineers, distinguishing these concepts determines whether a program requires thread-safe scheduling, hardware-level synchronization, or explicit network message passing.

:::tip Read these first
Before diving into execution models, review how parallelism differs from clock speed in [What is Parallel Computing?](/docs/parallel-computing/fundamentals/what-is-parallel-computing) and how the operating system maps logical units of execution in [Program, Process, Thread, Core](/docs/parallel-computing/fundamentals/program-process-thread-core).
:::

:::important What you should leave with
Verify whether your runtime scheduler is treating concurrent logical tasks as if they have parallel execution guarantees, which risks deadlock when tasks depend on each other's progress.
:::

:::note
Concurrency is about *structure* (managing multiple tasks at once). Parallelism is about *execution* (executing multiple tasks simultaneously on separate physical resources). Distributed computing is about *isolation* (executing tasks across separate physical address spaces connected by a network).
:::

:::caution
Assuming that concurrent threads will run in parallel on separate cores can lead to permanent deadlocks if one thread spins waiting for another that has not been scheduled on the single available core.
:::

:::warning
The compiler cannot automatically transform a shared-memory parallel program into a distributed-memory program because it cannot synthesize network communication or resolve separate address spaces without explicit developer intent.
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
9. [References](#references)

## Why you should care

To understand why these distinctions matter, consider a simple task-processing loop. In this program, a queue receives incoming packets, and a worker processes them:

```cpp
void process_queue(Queue* q) {
    while (true) {
        Packet p = q->pop(); // Blocks if empty
        p.apply_transform();
        p.write_to_disk();
    }
}
```

If you run this code on a single thread, the program is serial. If you instantiate two instances of `process_queue` on a system, the behavior changes fundamentally depending on how the runtime and hardware execute them:

1. **On a single-core CPU (Concurrency):** The operating system or runtime scheduler time-slices the two threads. Thread A runs for a few milliseconds, is paused, and Thread B runs. The lifetimes of the tasks overlap, but they never execute at the exact same physical instant.
2. **On a multi-core CPU (Parallelism):** Thread A runs on Core 0, and Thread B runs on Core 1. They execute at the exact same physical instant. If they access a shared queue, they will physically contend for the same cache lines, requiring hardware-level cache coherence protocols to resolve the state.
3. **On separate servers (Distributed):** Thread A runs on Server 1, and Thread B runs on Server 2. They do not share physical memory. The queue cannot be a simple pointer; it must be a network service, and packets must be serialized into byte streams and sent over a network interface.

For a developer writing parallel programs, these differences dictate how you handle state and synchronization. For a compiler or runtime engineer, the consequences are even more profound:

### For the application developer
* **Synchronization selection:** You must use locks or lock-free structures for parallel execution, but you must use network protocols or message-passing libraries (like MPI) for distributed execution.
* **Performance tuning:** In a parallel system, your bottleneck is often memory bandwidth or cache contention. In a distributed system, your bottleneck is network latency and serialization overhead.
* **Failure recovery:** If a thread crashes in a parallel program, the entire process usually dies. In a distributed system, you must write code to handle the partial failure of individual nodes while the rest of the system continues running.

### For the compiler and runtime engineer
* **Memory model enforcement:** The compiler must know if memory is shared (parallel) to avoid unsafe optimizations, such as hoisting a read out of a loop when another thread might write to that memory. See [Memory Models](/docs/parallel-computing/fundamentals/memory-models) for details.
* **Thread scheduling:** The runtime scheduler must decide whether to spin-wait (efficient when a parallel core is about to release a lock) or yield the CPU (efficient when concurrent threads are time-sliced on a single core).
* **Code generation:** The compiler can generate vector instructions or parallel loop constructs for shared-memory systems, but it must rely on runtime libraries to marshal data across distributed nodes.

---

## The mechanism

To understand how these execution models differ, we must separate the **language contract** (what the programmer writes), the **runtime scheduler** (how tasks are mapped), and the **hardware architecture** (how instructions are executed).



### Concurrency (Overlapping Lifetimes)
Concurrency is a software design pattern. It is the decomposition of a program into discrete, out-of-order executable tasks. A program is concurrent if it can handle more than one task active at the same time, even if only one task is physically executing at any given cycle.

*   **The Contract:** The programmer declares that tasks are independent enough to be interleaved. The language runtime is free to pause task $T_1$ at any arbitrary point to run task $T_2$.
*   **The Runtime:** The scheduler uses time-slicing (preemptive or cooperative) to simulate simultaneous execution.
*   **The Hardware:** A single CPU core executes instructions sequentially. It relies on hardware interrupts and context switches to swap the program counter, registers, and stack pointers.

### Parallelism (Simultaneous Execution)
Parallelism is a hardware execution model. It requires multiple physical execution units (such as CPU cores, vector lanes, or execution units) to run multiple instructions at the exact same physical instant.

*   **The Contract:** The program structure allows multiple operations to occur simultaneously without violating data dependency rules.
*   **The Runtime:** The scheduler maps active threads directly to separate physical execution units.
*   **The Hardware:** Multiple physical cores run separate instruction streams. They share a physical memory interconnect and must coordinate cache states using protocols like MESI (Modified, Exclusive, Shared, Invalid) to maintain a coherent view of memory. See [Parallel Hardware Overview](/docs/parallel-computing/fundamentals/parallel-hardware-overview) for details on the interconnect.

### Distributed Execution (Disjoint Address Spaces)
Distributed execution is an architectural model where the system consists of multiple independent computers (nodes), each with its own private memory space, connected by a network.

*   **The Contract:** Tasks cannot access each other's memory directly. All coordination must occur via explicit message passing. Pointers are strictly local and cannot be shared across nodes.
*   **The Runtime:** Runtimes like MPI (Message Passing Interface) manage process launching, rank assignment, and network transport layers.
*   **The Hardware:** Separate motherboards, CPUs, and RAM modules communicate over physical network interfaces (such as Ethernet or InfiniBand). There is no hardware-level cache coherence across nodes.

---

## A comparison

The table below contrasts how these three execution paradigms behave across key system dimensions.

| Dimension | Concurrent (Single Core) | Parallel (Multi-Core) | Distributed (Multi-Node) |
| :--- | :--- | :--- | :--- |
| **Address Space** | Shared (Single Virtual Address Space) | Shared (Single Virtual Address Space) | Disjoint (Separate Virtual Address Spaces) |
| **Primary Synchronization** | Mutexes, Semaphores, Coroutine Yields | Atomics, Memory Barriers, Spinlocks | Network Messages, TCP/IP, MPI Collectives |
| **Hardware Coherence** | Guaranteed by single-core execution | Maintained by hardware cache coherence | None (Software must manage data consistency) |
| **Failure Domain** | Single process crash terminates all tasks | Single process crash terminates all tasks | Individual node failure can be isolated |
| **Primary Bottleneck** | Context-switch overhead, scheduling latency | Memory bus bandwidth, cache line bouncing | Network latency, serialization, packet loss |
| **Compiler Strategy** | Register allocation, instruction reordering | Memory fence insertion, loop vectorization | Code generation for serialization, RPCs |

---

## A worked example

To see how these concepts change the code we write, let us look at a work-sharing pattern implemented in two different paradigms: a shared-memory parallel model (using OpenMP) and a distributed-memory model (using MPI).

Both programs perform the same task: they initialize an array of data and apply a transformation to each element.

<Tabs>
<TabItem value="openmp" label="Shared-Memory Parallel (OpenMP)">

```cpp
#include <iostream>
#include <vector>
#include <omp.h>

void process_data_parallel(std::vector<double>& data) {
    int n = data.size();
    
    // The compiler outlines this loop into a parallel helper function.
    // The runtime maps iterations to threads sharing the same memory.
    #pragma omp parallel for
    for (int i = 0; i < n; ++i) {
        // Every thread can read and write to the 'data' vector directly
        // because they share the same virtual address space.
        data[i] = data[i] * 2.0 + 1.0;
    }
}

int main() {
    std::vector<double> data(1000, 1.5);
    process_data_parallel(data);
    std::cout << "Element 0: " << data[0] << std::endl;
    return 0;
}
```

</TabItem>
<TabItem value="mpi" label="Distributed-Memory (MPI)">

```cpp
#include <iostream>
#include <vector>
#include <mpi.h>

int main(int argc, char** argv) {
    MPI_Init(&argc, &argv);

    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    int total_elements = 1000;
    int local_elements = total_elements / size;
    
    // Each node allocates its own private memory.
    // Node 0 has its own 'local_data', Node 1 has its own, etc.
    std::vector<double> local_data(local_elements, 1.5);

    // No shared pointers are used here.
    for (int i = 0; i < local_elements; ++i) {
        local_data[i] = local_data[i] * 2.0 + 1.0;
    }

    // If Node 0 needs to collect results from all other nodes,
    // it must perform an explicit network communication.
    std::vector<double> global_data;
    if (rank == 0) {
        global_data.resize(total_elements);
    }

    // This collective operation copies data across separate address spaces
    // over the physical network.
    MPI_Gather(local_data.data(), local_elements, MPI_DOUBLE,
               global_data.data(), local_elements, MPI_DOUBLE,
               0, MPI_COMM_WORLD);

    if (rank == 0) {
        std::cout << "Element 0 on Root: " << global_data[0] << std::endl;
    }

    MPI_Finalize();
    return 0;
}
```

</TabItem>
</Tabs>

### Code Walkthrough

#### The OpenMP (Parallel) Code:
1.  **Line 9 (`#pragma omp parallel for`):** The compiler parses this directive and restructures the loop. It generates an outlined function containing the loop body and inserts a call to the OpenMP runtime library (e.g., `GOMP_parallel_loop_start`).
2.  **Line 11 (`data[i] = ...`):** The threads read and write directly to the `data` vector. The compiler relies on the hardware's cache coherence protocol to ensure that if Thread 0 writes to `data[0]` and Thread 1 writes to `data[100]`, the physical L1/L2 caches remain synchronized. No explicit serialization or copying is required.

#### The MPI (Distributed) Code:
1.  **Line 17 (`std::vector<double> local_data(...)`):** Each process runs in its own isolated OS process with its own virtual memory space. If Rank 1 attempts to dereference a pointer pointing to memory owned by Rank 0, it will cause a segmentation fault or access completely different physical memory.
2.  **Line 31 (`MPI_Gather(...)`):** Because the memory is disjoint, the data must be explicitly copied. The MPI runtime serializes the local buffers on each node, transmits them over the network interface cards (NICs), and deserializes them into the `global_data` buffer on the root node (Rank 0).

---

## What the compiler and the runtime can and cannot do

Understanding the boundaries of compiler optimization and runtime scheduling prevents you from expecting the system to solve architectural mismatches automatically.

### What the compiler can do
* **Instruction Reordering inside a thread:** The compiler can reorder memory operations to hide latency, provided it does not violate the single-thread dependency rules.
* **Auto-vectorization:** The compiler can transform scalar loops into SIMD (Single Instruction, Multiple Data) instructions, which is a form of data-level parallelism on a single core.
* **Register Promotion:** The compiler can keep a shared variable in a register to avoid slow memory accesses, but it must stop doing this if the variable is marked `volatile` or accessed within a synchronized block.

### What the compiler cannot do
* **Bridge disjoint address spaces:** The compiler cannot take a standard C++ program with shared pointers and compile it to run across a distributed cluster. It cannot automatically synthesize network serialization or message-passing protocols.
* **Detect semantic race conditions:** The compiler can warn about some simple data races, but it cannot prove that a complex, multi-threaded program is free of race conditions or deadlocks.

### What the runtime can do
* **Dynamic Load Balancing:** The runtime scheduler (like the one in Go or Intel TBB) can use work-stealing algorithms to move tasks from overloaded physical cores to idle ones.
* **Thread Mapping:** The runtime can pin threads to specific physical cores (thread affinity) to maximize cache locality and reduce cache line bouncing.

### What the runtime cannot do
* **Guarantee progress on single-core concurrent systems:** If a program uses a spinlock without a yield point, a concurrent runtime running on a single core cannot force the spinning thread to yield unless the OS scheduler preempts it.

---

## Common misconceptions

### "Writing concurrent code guarantees my program runs faster"
Concurrency is about program structuring, not execution speed. In fact, running a concurrent program with many threads on a single-core machine is almost always slower than running a serial version due to the overhead of context switching, thread creation, and scheduling latency. Concurrency is designed to handle latency (such as waiting for disk I/O or network packets) by letting other tasks run in the meantime, but it does not speed up CPU-bound computation. Refer to [Measuring Parallel Performance](/docs/parallel-computing/fundamentals/measuring-parallel-performance) for how to establish a true baseline.

### "A parallel program will run correctly on a single-core machine without modification"
While a parallel program can run on a single-core machine via time-sliced concurrency, it can easily deadlock if it relies on lock-free algorithms that assume hardware-level progress. For example, if Thread A spins in a `while(!ready)` loop waiting for Thread B to set `ready = true`, a single-core concurrent scheduler might never schedule Thread B if Thread A never yields the CPU, resulting in a permanent hang.

### "Distributed memory is just parallel programming with slower latency"
Distributed memory changes the programming model entirely. In a shared-memory parallel system, you can pass pointers between threads. In a distributed-memory system, pointers are meaningless across node boundaries. You must design your algorithms around data partitioning, serialization, and explicit communication protocols. An algorithm that is highly efficient on a shared-memory parallel system (like a fine-grained lock-free queue) can be incredibly slow or impossible to implement efficiently on a distributed system.

---

## Where this leaves you

When designing or debugging a parallel system, always map your execution model to the physical hardware. If your tasks share an address space, ensure your compiler optimizations do not violate your target memory model. If your tasks run across separate address spaces, eliminate all pointer sharing and design your system around explicit data serialization.

## What To Read Next

- [What is Parallel Computing?](/docs/parallel-computing/fundamentals/what-is-parallel-computing)
- [Program, Process, Thread, Core](/docs/parallel-computing/fundamentals/program-process-thread-core)
- [Memory Models](/docs/parallel-computing/fundamentals/memory-models)

<AdBanner />

![Diagram](/img/parallel/concurrent-parallel-distributed.svg)

## References

* Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann. Chapter 1: "Why Parallel Computing?" and "Concurrent, Parallel, and Distributed Computing."
* Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*. Addison-Wesley. Chapter 1: "Introduction to Parallel Computing."
