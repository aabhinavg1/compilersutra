---
title: "Hybrid MPI and OpenMP"
description: "How to combine distributed-memory processes and shared-memory threads by requesting thread support levels in MPI and mapping ranks to physical nodes."
keywords:
  - hybrid mpi openmp
  - mpi_init_thread
  - mpi thread support levels
  - mpi_thread_single
  - mpi_thread_funneled
  - mpi_thread_serialized
  - mpi_thread_multiple
  - distributed shared memory
  - process pinning
  - thread affinity
  - rank per node
  - mpi collective inside threads
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/hybrid-mpi-openmp
---

Hybrid MPI and OpenMP programs combine process-based distributed memory across nodes with thread-based shared memory inside each node. A runtime or compiler engineer must ensure that the MPI library's thread support level matches how OpenMP threads call communication routines, and that CPU cores are shared rather than oversubscribed.

:::tip Read these first
- [/docs/parallel-computing/what-a-cluster-is](/docs/parallel-computing/what-a-cluster-is) — Nodes, interconnects, and why processes cannot share address spaces across machines.
- [/docs/parallel-computing/openmp-reduction-and-dependence](/docs/parallel-computing/openmp-reduction-and-dependence) — Shared-memory parallel loops, private variables, and reduction contracts.
:::

:::important What you should leave with
Always initialize MPI using `MPI_Init_thread` instead of `MPI_Init` when OpenMP is present, and verify that the provided support level matches or exceeds the level your thread structure requires.
:::

## Why you should care

When scaling a pure MPI application to thousands of cores across multi-socket nodes, the flat process model runs into physical resource constraints. Each MPI rank maintains its own message buffers, page tables, and intra-node communication structures. If a 64-core node runs 64 MPI ranks, substantial DRAM is consumed by duplicated runtime state, and all-to-all communication primitives scale their memory overhead with the process count squared.

Conversely, a pure OpenMP application cannot cross the network boundary of a single node. 

The standard solution is a hybrid model: run a smaller number of MPI ranks per node (often one per CPU socket or NUMA domain) and spawn OpenMP threads inside each rank to fill the remaining physical cores. However, combining them naively creates subtle runtime bugs:

```c
// Broken hybrid example: multiple threads call MPI concurrently without checking support
#include <mpi.h>
#include <omp.h>
#include <stdio.h>

int main(int argc, char** argv) {
    // Standard init does not guarantee thread-safe MPI execution
    MPI_Init(&argc, &argv);

    #pragma omp parallel
    {
        int tid = omp_get_thread_num();
        int rank;
        MPI_Comm_rank(MPI_COMM_WORLD, &rank);

        // DANGER: Concurrent MPI calls from arbitrary threads
        // cause data races inside MPI runtime buffers if unsupported.
        int val = rank * 100 + tid;
        MPI_Send(&val, 1, MPI_INT, 0, 0, MPI_COMM_WORLD);
    }

    MPI_Finalize();
    return 0;
}
```

If the underlying MPI runtime only guarantees single-threaded operation, concurrent `MPI_Send` calls from OpenMP threads result in memory corruption, corrupted sequence numbers inside the network transport, or deadlocks.

## The mechanism

The hybrid programming model divides the computing cluster into a two-level hierarchy:

1. **Inter-node (MPI):** Independent processes execute in separate virtual address spaces across nodes connected by a network fabric. Communication occurs via explicit message passing (`MPI_Send`, `MPI_Recv`, `MPI_Bcast`).
2. **Intra-node (OpenMP):** Multiple threads run inside the address space of a single MPI rank, communicating through shared memory reads and writes.



### Core allocation and oversubscription

Physical CPU cores must be assigned explicitly between ranks and threads. If a dual-socket node contains 32 physical cores, the total number of worker threads and ranks running on that node must not exceed 32.

If an job launcher (`mpirun` or `srun`) spawns 32 MPI ranks on a 32-core node, and each rank creates 32 OpenMP threads via `OMP_NUM_THREADS=32`, the operating system schedules $32 \times 32 = 1024$ threads across 32 cores. Thread context switching overhead degrades performance drastically.

To correctly configure a hybrid job:
- **Ranks per node ($N_\{\text\{rank\}\}$):** Typically set to the number of NUMA domains or sockets.
- **Threads per rank ($N_\{\text\{thread\}\}$):** Set to $\frac\{\text\{Cores per Node\}\}\{N_\{\text\{rank\}\}\}$.

### Thread safety contract: `MPI_Init_thread`

Standard `MPI_Init` makes no commitments regarding multithreaded behavior. Applications using OpenMP must call `MPI_Init_thread` to declare the requested level of thread safety and receive the runtime's granted level.

The four levels of thread support, defined in increasing order of capability, are:

1. `MPI_THREAD_SINGLE`: Only one thread of execution exists in the process. OpenMP parallel regions must not be used.
2. `MPI_THREAD_FUNNELED`: The process may be multithreaded, but **only the main thread** (the thread that called `MPI_Init_thread`) is permitted to make MPI calls. All MPI calls inside OpenMP regions must be restricted to `#pragma omp master` or executed outside parallel regions.
3. `MPI_THREAD_SERIALIZED`: Multiple threads may call MPI routines, but **not concurrently**. The application must guarantee that no two threads execute MPI functions simultaneously (for example, using `#pragma omp critical` or explicit locks).
4. `MPI_THREAD_MULTIPLE`: Multiple threads may call MPI routines concurrently without restriction. The MPI implementation internal state is protected by mutexes or lock-free data structures.

The application requests a level, and the MPI runtime returns the level it actually supports:

```c
int required = MPI_THREAD_FUNNELED;
int provided;
MPI_Init_thread(&argc, &argv, required, &provided);

if (provided < required) {
    // Runtime cannot support the requested threading model
    MPI_Abort(MPI_COMM_WORLD, 1);
}
```

## A comparison

The choice of thread support level dictates the synchronization required in application code and affects the performance of the underlying MPI transport layer.

| Support Level | Concurrent MPI Calls Allowed? | Required Thread Guard | Runtime Overhead |
| :--- | :--- | :--- | :--- |
| `MPI_THREAD_SINGLE` | No | None (Single-threaded) | Lowest (No internal locking) |
| `MPI_THREAD_FUNNELED` | No | `#pragma omp master` | Low (No internal locking) |
| `MPI_THREAD_SERIALIZED` | No (Serialized) | `#pragma omp critical` | Low (User-level locking) |
| `MPI_THREAD_MULTIPLE` | Yes | None | Higher (Internal MPI locks/atomics) |

Higher levels of thread support (`MPI_THREAD_MULTIPLE`) force the MPI runtime to acquire internal locks when inspecting channel buffers, updating request queues, and polling network adapters. This adds fixed overhead to every message operation, even if only one thread is actively calling MPI at a given moment.

## A worked example

The following program computes a parallel vector dot product across multiple cluster nodes. Each rank processes a subset of the dataset using OpenMP loop construct, and the results are aggregated using `MPI_Allreduce`. The main thread handles communication using the `MPI_THREAD_FUNNELED` level.

```c
#include <mpi.h>
#include <omp.h>
#include <stdio.h>
#include <stdlib.h>

#define ARRAY_SIZE 10000000

int main(int argc, char** argv) {
    int required = MPI_THREAD_FUNNELED;
    int provided;

    // Line 1: Declare requested thread support level and initialize MPI
    MPI_Init_thread(&argc, &argv, required, &provided);

    if (provided < required) {
        fprintf(stderr, "Error: MPI runtime does not support MPI_THREAD_FUNNELED\n");
        MPI_Abort(MPI_COMM_WORLD, 1);
    }

    int rank, num_ranks;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &num_ranks);

    // Line 2: Allocate local data for each rank
    double *a = (double*)malloc(ARRAY_SIZE * sizeof(double));
    double *b = (double*)malloc(ARRAY_SIZE * sizeof(double));

    for (size_t i = 0; i < ARRAY_SIZE; i++) {
        a[i] = 1.0;
        b[i] = 2.0;
    }

    double local_dot = 0.0;

    // Line 3: Parallelize the intra-node computation with OpenMP
    #pragma omp parallel for reduction(+:local_dot) schedule(static)
    for (size_t i = 0; i < ARRAY_SIZE; i++) {
        local_dot += a[i] * b[i];
    }

    double global_dot = 0.0;

    // Line 4: Perform inter-node communication strictly on the main thread
    // Under MPI_THREAD_FUNNELED, this call is safe because it runs outside
    // the OpenMP parallel region where only the main thread executes.
    MPI_Allreduce(&local_dot, &global_dot, 1, MPI_DOUBLE, MPI_SUM, MPI_COMM_WORLD);

    if (rank == 0) {
        printf("Global dot product sum: %f\n", global_dot);
    }

    free(a);
    free(b);

    MPI_Finalize();
    return 0;
}
```

### Walkthrough of key lines

1. **`MPI_Init_thread(&argc, &argv, required, &provided)`**: Passes `MPI_THREAD_FUNNELED` to the library. The runtime inspects its internal build flags and capability masks, returning the granted level in `provided`. The code verifies `provided >= required` before executing any OpenMP constructs.
2. **`malloc(ARRAY_SIZE * sizeof(double))`**: Allocates memory within the address space of this MPI process. Threads in this rank share access to arrays `a` and `b`.
3. **`#pragma omp parallel for reduction(+:local_dot)`**: Spawns worker threads up to `OMP_NUM_THREADS`. Work items are divided static-block style across worker threads. Thread local partial sums are accumulated back into `local_dot` without lock contention upon region exit.
4. **`MPI_Allreduce(...)`**: Executes outside of the `#pragma omp parallel` region. By design, only the main thread executes this statement. This strictly respects the `MPI_THREAD_FUNNELED` contract, avoiding any need for thread synchronization locks inside the MPI runtime layer.

## What the compiler and runtime can and cannot do

- **The compiler** can optimize shared memory accesses inside the OpenMP region (vectorizing inner loops, hoisting invariants). It cannot automatically insert MPI thread locks or verify that your binary satisfies the `MPI_Init_thread` level.
- **The MPI runtime** can select optimized intra-node memory transfer primitives (such as Linux cross-memory attach or shared memory segments) when processes share a node. It cannot prevent data races if user code invokes MPI calls concurrently across OpenMP threads under `MPI_THREAD_FUNNELED` or `MPI_THREAD_SERIALIZED`.
- **The job scheduler (Slurm, PBS)** can pin MPI ranks and set CPU binding masks (`taskset`). It cannot dynamically adjust `OMP_NUM_THREADS` inside your application code if environment flags are missing or configured incorrectly.

## Common misconceptions

### "Every OpenMP thread can call MPI functions as long as I compile with `-fopenmp`"
Compiling with `-fopenmp` enables OpenMP directives but does not configure the MPI implementation's internal thread safety mode. If threads call MPI without initializing with `MPI_THREAD_MULTIPLE`, internal runtime structures may corrupt.

### "Setting `MPI_THREAD_MULTIPLE` everywhere is always the optimal choice"
`MPI_THREAD_MULTIPLE` forces the MPI library to insert mutexes around internal hardware queues, memory pools, and message tracking structures. This introduces execution overhead for every MPI call. `MPI_THREAD_FUNNELED` or process-level communication outside parallel regions is often more performant.

### "Running 1 rank per core is identical to 1 rank per node with N threads per core"
Pure MPI applications duplicate shared structures across processes, increasing memory footprints and cache footprint. Hybrid execution lowers process count, allows shared memory communication inside a node without copying data through socket structures, and consolidates inter-node network messages into fewer, larger packets.

## Where this leaves you

1. Initialize MPI with `MPI_Init_thread` and assert that the returned `provided` thread level is sufficient for your application design.
2. Structure communication so that only the main thread calls MPI (`MPI_THREAD_FUNNELED`), avoiding internal library locking overhead whenever possible.
3. Configure launcher options (such as `srun --cpus-per-task=$N`) and `OMP_NUM_THREADS` to ensure the product of ranks per node and threads per rank exactly equals physical core availability.

## What To Read Next

- [/docs/parallel-computing/what-a-cluster-is](/docs/parallel-computing/what-a-cluster-is) — Physical structure of compute nodes, sockets, and cluster interconnects.
- [/docs/parallel-computing/mpi-collectives](/docs/parallel-computing/mpi-collectives) — Collective communications operations across MPI processes.
- [/docs/parallel-computing/overlap-communication-and-computation](/docs/parallel-computing/overlap-communication-and-computation) — Non-blocking primitives and asynchronous thread execution models.

![Diagram](/img/parallel/hybrid-mpi-openmp.svg)

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann.
- Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*. Addison-Wesley.
- Message Passing Interface Forum. *MPI: A Message-Passing Interface Standard*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/hybrid-mpi-openmp/)
