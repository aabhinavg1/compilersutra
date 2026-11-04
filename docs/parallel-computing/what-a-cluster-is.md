---
title: "What a cluster is"
description: "Understand the execution model of a cluster: independent memory spaces, node boundaries, and how MPI bridges processes where OpenMP cannot cross."
keywords:
  - cluster architecture
  - distributed memory
  - high performance computing
  - MPI vs OpenMP
  - address space boundaries
  - inter-node communication
  - process boundary
  - message passing interface
  - network latency
  - cluster nodes
  - multi-node scheduling
  - compiler optimization limits
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/what-a-cluster-is
---

In a cluster, every process executes inside its own virtual address space on a physical node. OpenMP directives and hardware cache coherence stop at the node boundary because one node cannot load or store directly to another node's physical RAM.

:::tip Read these first
- [/docs/parallel-computing/shared-versus-distributed-memory](/docs/parallel-computing/shared-versus-distributed-memory)
- [/docs/parallel-computing/openmp-reduction-and-dependence](/docs/parallel-computing/openmp-reduction-and-dependence)
:::

:::important What you should leave with
Before calling any message-passing function, verify whether the memory address being accessed lives in the current process's address space or on a remote node. Shared-memory runtime constructs cannot dereference remote pointers.
:::

## Why you should care

Consider an OpenMP loop designed to sum array elements across multiple hardware cores:

```c
#include <stdio.h>
#include <omp.h>

void compute_sum(double *data, size_t n, double *total) {
    double sum = 0.0;
    #pragma omp parallel for reduction(+:sum)
    for (size_t i = 0; i < n; i++) {
        sum += data[i];
    }
    *total = sum;
}
```

This code works as long as all threads execute within a single operating system process on one machine. The threads share the pointer `data` and can read any index from physical memory.

If you scale this workload across ten physical servers (nodes) connected by an Ethernet or InfiniBand network, OpenMP cannot help you share memory between nodes. A process on Node 0 issuing `data[i]` cannot read physical RAM located on Node 1. The hardware lacks a unified hardware-managed cache coherence protocol or shared address space across the network. 

Attempting to pass pointers between nodes yields invalid reads or segmentation faults. To cross the node boundary, you must introduce explicit software message passing.

## The mechanism

A cluster consists of independent compute nodes connected by a network fabric (such as InfiniBand or Ethernet). Each compute node operates its own kernel, operating system, and memory controller.

```
+------------------------------------+       +------------------------------------+
|            Compute Node 0          |       |            Compute Node 1          |
|  +------------------------------+  |       |  +------------------------------+  |
|  |       Process (Rank 0)       |  |       |  |       Process (Rank 1)       |  |
|  |  [OpenMP Threads / Memory]   |  |       |  |  [OpenMP Threads / Memory]   |  |
|  +--------------+---------------+  |       |  +--------------+---------------+  |
|                 |                  |       |                 |                  |
|          Memory Controller         |       |          Memory Controller         |
+-----------------+------------------+       +-----------------+------------------+
                  |                                            |
                  +-------------------+    +-------------------+
                                      |    |
                               +------+----+------+
                               | Network Switch   |
                               +------------------+
```

### 1. Address space isolated processes

When an application starts on a cluster under a manager like `mpirun`, the system creates distinct OS processes on designated nodes.
- **Node-Local Access:** Process 0 reads its local DRAM at native hardware memory access speed.
- **Remote Isolation:** Process 0 cannot access Process 1's DRAM through standard CPU load/store instructions (e.g., `MOV` or `LDR`).

### 2. The role of OpenMP vs. MPI

- **OpenMP:** Works *inside* a node. It schedules threads within a single process address space.
- **MPI (Message Passing Interface):** Works *between* nodes (and can work between processes on the same node). It explicitly serializes, packets, sends, and unpacks data over the network network interface card (NIC).

## A worked example

To bridge the address space gap, we convert our shared-memory reduction into a distributed-memory program using MPI.

```c
#include <stdio.h>
#include <stdlib.h>
#include <mpi.h>
#include <omp.h>

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);

    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    size_t local_n = 1000000;
    double *local_data = (double *)malloc(local_n * sizeof(double));

    // Initialize local data for each rank
    for (size_t i = 0; i < local_n; i++) {
        local_data[i] = 1.0;
    }

    // Step 1: Thread-level reduction inside the node using OpenMP
    double local_sum = 0.0;
    #pragma omp parallel for reduction(+:local_sum)
    for (size_t i = 0; i < local_n; i++) {
        local_sum += local_data[i];
    }

    // Step 2: Process-level reduction across nodes using MPI
    double global_sum = 0.0;
    MPI_Reduce(&local_sum, &global_sum, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);

    if (rank == 0) {
        printf("Global Sum: %f\n", global_sum);
    }

    free(local_data);
    MPI_Finalize();
    return 0;
}
```

### Walkthrough of critical lines

1. **`MPI_Init(&argc, &argv);`**  
   Initializes the distributed execution environment. The operating system launcher starts copies of this process across the cluster nodes.

2. **`MPI_Comm_rank(MPI_COMM_WORLD, &rank);`**  
   Assigns a unique identifier (`rank`) to each isolated process. Rank 0 lives on Node 0; Rank 1 lives on Node 1.

3. **`#pragma omp parallel for reduction(+:local_sum)`**  
   Executes intra-node parallelism. OpenMP spawns threads that share `local_data` *only* within the local address space of that single rank.

4. **`MPI_Reduce(&local_sum, &global_sum, 1, MPI_DOUBLE, MPI_SUM, 0, MPI_COMM_WORLD);`**  
   Crosses the node boundary. Rank 0 and Rank 1 cannot directly read each other's `local_sum`. This call forces the network interface card to package `local_sum`, transport it across the interconnect switch, and combine the results into `global_sum` on Rank 0.

## What the compiler and runtime can and cannot do

### What the compiler can do
- The compiler can vectorize loop structures inside a single node's process space.
- It can optimize local OpenMP pragmas, generating thread dispatch constructs (like `gomp_team_start` or `kmpc_fork_call`).

### What the compiler cannot do
- The compiler cannot automatically convert load instructions into network transfers. It does not replace an invalid pointer access with an inter-node network message.
- It cannot maintain cache coherence across physical nodes. Software must explicitly define communication points.

### What the runtime handles
- The MPI runtime uses hardware-optimized communication paths (such as RDMA over InfiniBand or shared memory IPC for ranks residing on the same node).
- The cluster scheduler (such as Slurm) maps binary execution instances to physical hardware sockets and manages remote process lifecycles.

## Common misconceptions

### 1. OpenMP can run across multiple cluster nodes if configured correctly
**False.** OpenMP relies on shared memory within a single operating system process image. It cannot cross the boundary between separate machines with distinct memory architectures without unified hardware distributed shared memory (DSM) layers.

### 2. MPI replaces the need for OpenMP entirely
**Incomplete.** While you can run one MPI process per CPU core (pure MPI), hybrid models (MPI across nodes, OpenMP within a node) often reduce memory overhead and minimize network message frequency.

### 3. Shared memory IPC can transparently replace distributed communication
**False.** Inter-Process Communication (IPC) techniques work within a single OS kernel instance. Moving across physical servers requires network transactions via dedicated hardware (NICs).

## Where this leaves you

When building cluster applications:
- Treat node boundaries as strict isolation barriers.
- Use thread-based parallelism (such as OpenMP or C++ threads) to saturate cores inside a node.
- Use explicit message passing (such as MPI) to exchange data across nodes over the network interconnect.

## What To Read Next

- [/docs/parallel-computing/shared-versus-distributed-memory](/docs/parallel-computing/shared-versus-distributed-memory) — The foundational comparison of hardware memory architectures.
- [/docs/parallel-computing/communication-cost-and-granularity](/docs/parallel-computing/communication-cost-and-granularity) — Understanding network latency and throughput constraints in cluster nodes.

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann.
- Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*. Addison-Wesley.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/what-a-cluster-is/)
