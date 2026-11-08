---
title: "Overlap Communication with Computation"
description: "Hide network latency in distributed applications by initiating nonblocking transfers, executing independent local work, and synchronizing before buffer reuse."
keywords:
  - MPI_Isend
  - MPI_Irecv
  - MPI_Wait
  - MPI_Waitall
  - nonblocking communication
  - latency hiding
  - halo exchange
  - boundary exchange
  - overlap communication and computation
  - asynchronous progress
  - MPI request handle
  - buffer ownership
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/overlap-communication-and-computation
---

Nonblocking communication calls return control to the host application before data transfer completes. This enables a CPU core to hide network latency by executing useful work while the network interface transfers data.

:::tip Read these first
- [/docs/parallel-computing/communication-cost-and-granularity](/docs/parallel-computing/communication-cost-and-granularity) — Understanding startup latency, transfer cost, and message sizes.
- [/docs/parallel-computing/mpi-send-receive-matching](/docs/parallel-computing/mpi-send-receive-matching) — Point-to-point message matching semantics and point-to-point buffer rules.
:::

:::important What you should leave with
A nonblocking transfer transfers buffer ownership to the message-passing runtime until you call a completion routine such as `MPI_Wait`. Modifying or reading a buffer during an active nonblocking operation invalidates the correctness of the overlap.
:::

## Why you should care

In a standard stencil operation on a distributed grid, every process (rank) updates a local sub-grid. To update boundary points, a rank must exchange boundary elements (halos) with its neighbors. 

If a rank uses synchronous blocking calls, the CPU sits idle waiting for network round-trips before it starts updating any grid cells:

```c
// Blocking approach: CPU waits idle while network transfers halo data
MPI_Send(send_buf, count, MPI_DOUBLE, right_rank, tag, MPI_COMM_WORLD);
MPI_Recv(recv_buf, count, MPI_DOUBLE, left_rank,  tag, MPI_COMM_WORLD, MPI_STATUS_IGNORE);

// Computation is delayed until message fully arrives
compute_entire_grid(grid, recv_buf);
```

When network latency is high relative to local computation, blocking communication limits scaling. By splitting the grid computation into **interior elements** (which do not depend on neighboring halos) and **boundary elements** (which require neighboring halos), you can hide the communication delay entirely behind interior grid computation.

## The mechanism

Nonblocking communications split a message operation into two distinct phases: **initiation** and **completion**.

1. **Initiation (`MPI_Irecv` / `MPI_Isend`)**: Registers the buffer memory address with the runtime and returns immediately with an opaque `MPI_Request` handle.
2. **Independent Local Work**: The process updates data structures that do *not* overlap with the active send or receive buffers.
3. **Completion (`MPI_Wait` / `MPI_Waitall`)**: Blocks until the network hardware or runtime finishes reading from the send buffer or writing into the receive buffer.

```
Blocking Execution:
Rank 0: [-- Send/Recv Wait --][-- Compute Interior --][-- Compute Boundary --]

Overlapped Execution:
Rank 0: [-- Start Isend/Irecv --][-- Compute Interior --][-- MPI_Wait --][-- Compute Boundary --]
         \______________________ Overlapped Window _____________________/
```



### The Buffer Ownership Contract

When you pass a buffer pointer to `MPI_Isend` or `MPI_Irecv`:

- **For `MPI_Isend`**: The buffer is locked for **reads**. The application must not write to or mutate any element in that memory region until `MPI_Wait` completes.
- **For `MPI_Irecv`**: The buffer is locked for **writes**. The application must not read from or write to that memory region until `MPI_Wait` completes.

If local computation reads from an active `MPI_Irecv` buffer before calling `MPI_Wait`, it will read stale, partially overwritten, or uninitialized memory. This constitutes **fake overlap** and introduces race conditions.

## A worked example

This example demonstrates 1D domain decomposition where each process updates a local grid array. The computation is split so that interior points are computed while boundary points are in transit over the network.

```c
#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>

#define N 1000  // Local elements per rank

void update_interior(double *grid_new, const double *grid_old, int size) {
    // Update elements that do NOT depend on external halos (indices 2 to size-3)
    for (int i = 2; i < size - 2; i++) {
        grid_new[i] = 0.5 * grid_old[i] + 0.25 * (grid_old[i - 1] + grid_old[i + 1]);
    }
}

void update_boundary(double *grid_new, const double *grid_old, 
                     double left_halo, double right_halo, int size) {
    // Update boundary element 1 using left_halo
    grid_new[1] = 0.5 * grid_old[1] + 0.25 * (left_halo + grid_old[2]);

    // Update boundary element size-2 using right_halo
    grid_new[size - 2] = 0.5 * grid_old[size - 2] + 
                         0.25 * (grid_old[size - 3] + right_halo);
}

int main(int argc, char **argv) {
    MPI_Init(&argc, &argv);

    int rank, num_ranks;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &num_ranks);

    int left_neighbor  = (rank == 0) ? MPI_PROC_NULL : rank - 1;
    int right_neighbor = (rank == num_ranks - 1) ? MPI_PROC_NULL : rank + 1;

    double *grid_old = (double *)calloc(N, sizeof(double));
    double *grid_new = (double *)calloc(N, sizeof(double));

    double send_left = grid_old[1];
    double send_right = grid_old[N - 2];
    double recv_left = 0.0;
    double recv_right = 0.0;

    MPI_Request reqs[4];

    // Line 39-42: Initiate nonblocking halo exchanges
    MPI_Irecv(&recv_left,  1, MPI_DOUBLE, left_neighbor,  0, MPI_COMM_WORLD, &reqs[0]);
    MPI_Irecv(&recv_right, 1, MPI_DOUBLE, right_neighbor, 1, MPI_COMM_WORLD, &reqs[1]);
    MPI_Isend(&send_left,  1, MPI_DOUBLE, left_neighbor,  1, MPI_COMM_WORLD, &reqs[2]);
    MPI_Isend(&send_right, 1, MPI_DOUBLE, right_neighbor, 0, MPI_COMM_WORLD, &reqs[3]);

    // Line 45: Compute interior elements while messages travel across the network
    update_interior(grid_new, grid_old, N);

    // Line 48: Complete all network transfers before accessing receive buffers
    MPI_Waitall(4, reqs, MPI_STATUSES_IGNORE);

    // Line 51: Compute boundary points using freshly received halo values
    update_boundary(grid_new, grid_old, recv_left, recv_right, N);

    free(grid_old);
    free(grid_new);
    MPI_Finalize();
    return 0;
}
```

### Walkthrough

- **Lines 39–42**: `MPI_Irecv` and `MPI_Isend` post intent to transfer boundary scalars. The application retains execution control immediately without waiting for hardware acknowledgment.
- **Line 45**: `update_interior` works strictly on array elements `[2 ... N-3]`. It does not read `recv_left` or `recv_right`, nor does it mutate `send_left` or `send_right`.
- **Line 48**: `MPI_Waitall` blocks until all 4 nonblocking requests finish. This enforces synchronization before reading received data.
- **Line 51**: `update_boundary` safely reads `recv_left` and `recv_right` to finish updating the sub-grid boundaries.

## What the compiler and runtime can and cannot do

### What the compiler can and cannot do
- **Cannot reorder across MPI calls automatically**: Standard C/C++ compilers treat `MPI_Isend` and `MPI_Wait` as opaque library functions. The compiler cannot automatically inspect your domain geometry to split loops into interior and boundary passes.
- **May reorder memory accesses**: If pointers alias or compiler optimizations hoist memory reads, a compiler might reorder reads to `recv_left` above `MPI_Waitall` unless memory barriers or opaque library call boundaries prevent it.

### What the runtime and hardware can and cannot do
- **Hardware RDMA Offload**: Modern fabrics (e.g., InfiniBand) can perform zero-copy Direct Memory Access (DMA) transfers entirely in network hardware while CPU cores run computation loops.
- **Asynchronous Progress Threads**: If network hardware does not support full offload, some MPI runtimes spawn a background progress thread. If progress threads are disabled, message transfer might only actually make progress when the host CPU enters an explicit MPI runtime call (like `MPI_Wait`).

## Common misconceptions

### Nonblocking calls speed up total data transfer bandwidth
Nonblocking transfers do not increase link bandwidth or lower fundamental network latency. They merely permit the CPU to execute independent instructions while data is in transit.

### Calling `MPI_Isend` immediately frees the send buffer for reuse
`MPI_Isend` initiates a request; it does not duplicate the buffer unless small-message eager limits internally copy it. Overwriting the buffer before calling `MPI_Wait` can cause corrupted outgoing messages.

### Any nonblocking call guarantees background data movement
If the underlying network interface lacks RDMA offload and the runtime does not utilize background progress threads, message progress may pause until the application invokes `MPI_Wait`.

## Where this leaves you

Inspect distributed mesh or stencil kernels in your codebase:

1. Identify the boundary dependencies for local computations.
2. Separate grid iterations into **independent interior loops** and **dependent boundary loops**.
3. Post nonblocking transfers (`MPI_Irecv` / `MPI_Isend`) before the interior loop, and place `MPI_Waitall` immediately before the boundary loop.

## What To Read Next

- [/docs/parallel-computing/mpi-collectives](/docs/parallel-computing/mpi-collectives) — Collective operations and nonblocking collective variants like `MPI_Iallreduce`.
- [/docs/parallel-computing/broadcast-and-reduction-trees](/docs/parallel-computing/broadcast-and-reduction-trees) — Tree structures in collective operations.
- [/docs/parallel-computing/what-a-cluster-is](/docs/parallel-computing/what-a-cluster-is) — Physical interconnect topology and latency properties of distributed clusters.

![Diagram](/img/parallel/overlap-communication-and-computation.svg)

## References

- Ananth Grama, Anshul Gupta, George Karypis, and Vipin Kumar, *Introduction to Parallel Computing*.
- Message Passing Interface Forum, *MPI: A Message-Passing Interface Standard*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/overlap-communication-and-computation/)
