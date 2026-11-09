---
title: "MPI Collectives: Broadcast, Scatter, Gather, and Reduce"
description: "Why MPI collective operations require participation from every rank in a communicator and how runtime matching differs from compiler-driven loop optimization."
keywords:
  - MPI collectives
  - MPI_Bcast
  - MPI_Scatter
  - MPI_Gather
  - MPI_Reduce
  - MPI_Allreduce
  - MPI communicator
  - collective communication
  - rank synchronization
  - parallel runtime
  - cluster programming
  - distributed memory
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/mpi-collectives
---

An MPI collective operation coordinates data transfer across every process in a communicator using a single logical interface. For compilers and runtimes, collective calls carry dynamic matching constraints that prevent transforming them into independent point-to-point calls or hoisting them out of rank-specific control flow.

:::tip Read these first
- [/docs/parallel-computing/mpi-send-receive-matching](/docs/parallel-computing/mpi-send-receive-matching) — Message matching, tags, and deadlock risks in point-to-point communication.
- [/docs/parallel-computing/broadcast-and-reduction-trees](/docs/parallel-computing/broadcast-and-reduction-trees) — How tree structures reduce message steps in distributed algorithms.
:::

:::important What you should leave with
Every rank in an MPI communicator must invoke a collective call in the same relative sequence, with matching data types and roots, or the program can lock up at runtime.
:::

## Why you should care

In shared-memory parallel programming, a compiler can hoist a loop-invariant memory read or sink an unreferenced store across iteration boundaries. In distributed-memory programming with MPI, collective operations look like standard function calls, but they enforce global matching semantics across distinct process address spaces.

Consider a runtime program where rank 0 decides to broadcast a configuration structure, but all other ranks skip the broadcast call because of a local state check:

```c
// Incorrect: Rank 0 calls MPI_Bcast, while other ranks skip it.
if (rank == 0) {
    read_config_file(&config);
    MPI_Bcast(&config, sizeof(Config), MPI_BYTE, 0, MPI_COMM_WORLD);
} else {
    // Rank 1..N-1 skip the collective call and proceed directly to computation.
    do_work_with_default_config();
}
```

This code deadlocks or fails with a runtime error. Rank 0 enters `MPI_Bcast` and waits for matching communication routines from all other ranks in `MPI_COMM_WORLD`. The runtime cannot proceed because rank 1 through rank $N-1$ never enter the call. 

A traditional compiler optimization pass cannot fix this issue. The compiler sees only the local control flow graph of one process and cannot prove whether other processes will execute matching collective statements.

## The mechanism

MPI collectives operate over a communicator (such as `MPI_COMM_WORLD`). The communicator defines the complete group of processes participating in the call. 

Unlike point-to-point operations (`MPI_Send` and `MPI_Recv`), collective operations:
1. Do not use message tags for matching.
2. Match strictly by the call sequence encountered by each process within a given communicator.
3. Require participation from all ranks in the communicator.

The primary collective operations serve four core data-movement patterns:

1. **Broadcast (`MPI_Bcast`)**: Replicates data from one root process to every process in the communicator.
2. **Scatter (`MPI_Scatter`)**: Splits an array from the root process into contiguous chunks and sends chunk $i$ to rank $i$.
3. **Gather (`MPI_Gather`)**: Collects a contiguous chunk of data from each rank and concatenates them in rank order on the root process.
4. **Reduce (`MPI_Reduce`)**: Combines data from all ranks using an associative operator (such as sum, min, or max) and places the final scalar or array result on the root rank.
5. **Allreduce (`MPI_Allreduce`)**: Performs a reduction and distributes the final combined result to every rank.

### Buffer and Memory Layout Transformations

The table below illustrates how memory layouts change across a 4-rank communicator for the main collective calls.

| Operation | Input Layout (per rank) | Output Layout (per rank) | Data Movement Pattern |
| :--- | :--- | :--- | :--- |
| **Broadcast** | Rank 0: `[A, B]`<br />Ranks 1..3: `[ , ]` | Rank 0..3: `[A, B]` | $1 \to N$ (One buffer replicated everywhere) |
| **Scatter** | Rank 0: `[D0, D1, D2, D3]`<br />Ranks 1..3: `[ ]` | Rank 0: `[D0]`, Rank 1: `[D1]`<br />Rank 2: `[D2]`, Rank 3: `[D3]` | $1 \to N$ (One array partitioned across ranks) |
| **Gather** | Rank 0: `[D0]`, Rank 1: `[D1]`<br />Rank 2: `[D2]`, Rank 3: `[D3]` | Rank 0: `[D0, D1, D2, D3]`<br />Ranks 1..3: `[ ]` | $N \to 1$ (Rank arrays concatenated at root) |
| **Reduce** | Rank 0: `[1]`, Rank 1: `[2]`<br />Rank 2: `[3]`, Rank 3: `[4]` | Rank 0: `[10]` (using `MPI_SUM`)<br />Ranks 1..3: `[ ]` | $N \to 1$ (Values combined at root via operator) |
| **Allreduce** | Rank 0: `[1]`, Rank 1: `[2]`<br />Rank 2: `[3]`, Rank 3: `[4]` | Rank 0..3: `[10]` (using `MPI_SUM`) | $N \to N$ (Values combined and sent everywhere) |

## A worked example

The following program distributes an array using `MPI_Scatter`, computes local squared sums, and collects the combined global sum across all ranks using `MPI_Allreduce`.

```c
#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char** argv) {
    MPI_Init(&argc, &argv);

    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    const int elements_per_rank = 4;
    int total_elements = elements_per_rank * size;

    double* global_data = NULL;
    if (rank == 0) {
        global_data = (double*)malloc(total_elements * sizeof(double));
        for (int i = 0; i < total_elements; i++) {
            global_data[i] = (double)(i + 1);
        }
    }

    double* local_data = (double*)malloc(elements_per_rank * sizeof(double));

    // 1. Distribute contiguous data blocks from rank 0 to all ranks
    MPI_Scatter(
        global_data,          // sendbuf (read only on root)
        elements_per_rank,    // sendcount
        MPI_DOUBLE,           // sendtype
        local_data,           // recvbuf
        elements_per_rank,    // recvcount
        MPI_DOUBLE,           // recvtype
        0,                    // root rank
        MPI_COMM_WORLD        // communicator
    );

    // 2. Perform local computation independently
    double local_sq_sum = 0.0;
    for (int i = 0; i < elements_per_rank; i++) {
        local_sq_sum += local_data[i] * local_data[i];
    }

    // 3. Combine local results and make global result available to all ranks
    double global_sq_sum = 0.0;
    MPI_Allreduce(
        &local_sq_sum,        // sendbuf
        &global_sq_sum,       // recvbuf
        1,                    // count
        MPI_DOUBLE,           // datatype
        MPI_SUM,              // op
        MPI_COMM_WORLD        // communicator
    );

    printf("Rank %d calculated local sum = %.2f, global sum = %.2f\n",
           rank, local_sq_sum, global_sq_sum);

    free(local_data);
    if (rank == 0) {
        free(global_data);
    }

    MPI_Finalize();
    return 0;
}
```

### Line-by-line explanation

- **Line 6–10**: Initializes the environment and obtains the process identity (`rank`) and total count (`size`).
- **Line 15–20**: Allocates and populates the source array `global_data` only on rank 0. Other ranks keep `global_data` set to `NULL`.
- **Line 22**: Allocates `local_data` on all processes to hold `elements_per_rank` values.
- **Lines 25–34**: Calls `MPI_Scatter`. Every rank in `MPI_COMM_WORLD` executes this call concurrently. Rank 0 provides the input array; every rank receives four elements into its local buffer.
- **Lines 37–40**: Computes `local_sq_sum` locally inside each address space. No network communication happens during this loop.
- **Lines 43–51**: Calls `MPI_Allreduce`. Every rank supplies its `local_sq_sum`. The MPI runtime aggregates these values using `MPI_SUM` and populates `global_sq_sum` on all ranks.
- **Line 57–60**: Frees allocated memory conditionally based on rank ownership.

## What the compiler and runtime can and cannot do

Understanding the division of labor between the compiler and the MPI runtime prevents costly application bugs:

### What the compiler cannot do
- **Cannot reorder or sink collective calls out of conditionals**: A compiler operating on a single translation unit cannot determine whether another process will execute a matching collective call. Branching around a collective call on some ranks but not others breaks the collective contract.
- **Cannot optimize communication types across address spaces**: The C compiler cannot verify that the `sendtype` specified on rank 0 matches the `recvtype` expected on rank 1.

### What the MPI runtime can do
- **Choose algorithm topologies dynamically**: The runtime dynamically selects hardware-optimized communication paths (such as binomial trees, ring topologies, or shared-memory copies) based on message size and network interconnect topology.
- **Pipeline and vectorize network operations**: Modern MPI runtimes perform internal pipelining to overlap compute and data movement across node bounds.

## Common misconceptions

### "MPI collective calls automatically act as full barriers"
While collective calls synchronize data exchange, they do not guarantee that all ranks exit the call simultaneously. A rank that finishes receiving its segment early may return from `MPI_Scatter` before another rank has completed its transfer, unless an explicit `MPI_Barrier` is invoked.

### "Collective calls can be safely replaced by a loop of point-to-point calls"
Replacing `MPI_Bcast` with a loop of `MPI_Send` and `MPI_Recv` calls degrades algorithm performance from $O(\log N)$ to $O(N)$ steps and removes the runtime's ability to utilize underlying hardware multicast hardware or optimized tree algorithms.

### "Send and receive buffer pointers can overlap"
Unless an MPI call explicitly supports in-place operations using `MPI_IN_PLACE`, passing the same memory buffer as both input and output to a collective function produces undefined behavior under the MPI standard.

## Where this leaves you

When writing or analyzing distributed applications:
1. Verify that every rank within a communicator reaches identical sequences of collective calls.
2. Match `sendcount` and `recvcount` per-rank layout specs strictly.
3. Use `MPI_Allreduce` when every rank requires the result, avoiding an explicit `MPI_Reduce` followed by an `MPI_Bcast`.

## What To Read Next

- [/docs/parallel-computing/what-a-cluster-is](/docs/parallel-computing/what-a-cluster-is) — How independent nodes interact over high-speed networks.
- [/docs/parallel-computing/mpi-send-receive-matching](/docs/parallel-computing/mpi-send-receive-matching) — Direct message passing protocols and deadlock prevention.
- [/docs/parallel-computing/broadcast-and-reduction-trees](/docs/parallel-computing/broadcast-and-reduction-trees) — Theoretical bounds of tree algorithms in collective communication.

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*.
- Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*.
- Message Passing Interface Forum. *MPI: A Message-Passing Interface Standard*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/mpi-collectives/)
