---
title: "MPI send, receive, and matching"
description: "How message matching rules work in MPI and why point-to-point send and receive calls deadlock when rank dependencies are cyclic."
keywords:
  - MPI_Send
  - MPI_Recv
  - message matching
  - MPI rank
  - MPI communicator
  - MPI tag
  - blocking send
  - point-to-point communication
  - distributed memory deadlock
  - MPI_COMM_WORLD
  - MPI status
  - message passing interface
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/mpi-send-receive-matching
---

Message matching in MPI is governed by strict rules: a received message must match the source rank, message tag, and communicator expected by the caller. Because a compiler compiling code for one rank cannot see or analyze the execution path of another rank, it cannot restructure or reorder cross-rank communication to prevent deadlocks.

:::tip Read these first
- [/docs/parallel-computing/shared-versus-distributed-memory](/docs/parallel-computing/shared-versus-distributed-memory)
- [/docs/parallel-computing/what-a-cluster-is](/docs/parallel-computing/what-a-cluster-is)
:::

:::important What you should leave with
Verify that every blocking point-to-point communication exchange between ranks has matching complementary operations (`MPI_Send` paired with `MPI_Recv`) and that message tags, source/destination ranks, and communicators match exactly to avoid runtime deadlocks.
:::

## Why you should care

In shared-memory programming, a compiler or runtime can sometimes inspect global memory accesses or use hardware synchronization mechanisms to protect data dependencies. In distributed-memory systems, each rank runs in its own process address space. 

Consider a classic two-rank token exchange where both processes attempt to send data to each other using blocking operations before receiving:

```c
#include <mpi.h>
#include <stdio.h>

int main(int argc, char** argv) {
    MPI_Init(&argc, &argv);

    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    if (size < 2) {
        MPI_Finalize();
        return 0;
    }

    int send_val = rank;
    int recv_val = -1;
    int target_rank = (rank == 0) ? 1 : 0;
    int tag = 100;

    // BAD PATTERN: Both ranks initiate a blocking send first
    printf("Rank %d attempting blocking send to %d...\n", rank, target_rank);
    MPI_Send(&send_val, 1, MPI_INT, target_rank, tag, MPI_COMM_WORLD);
    
    printf("Rank %d attempting blocking receive from %d...\n", rank, target_rank);
    MPI_Recv(&recv_val, 1, MPI_INT, target_rank, tag, MPI_COMM_WORLD, MPI_STATUS_IGNORE);

    printf("Rank %d successfully received %d\n", rank, recv_val);

    MPI_Finalize();
    return 0;
}
```

If the underlying MPI runtime implementation does not provide sufficient system buffering for `MPI_Send`, both rank 0 and rank 1 will block indefinitely waiting for the other to issue a matching `MPI_Recv`. The program hangs.

## The mechanism

Point-to-point communication in MPI requires precise matching between a sending operation on one rank and a receiving operation on another.



### The 4 tuple matching rule

A message sent from process $A$ is successfully matched with a receive call on process $B$ if and only if all four conditions hold:

1. **Communicator**: Both calls reference the same communicator context (e.g., `MPI_COMM_WORLD`). Communicators isolate message domains.
2. **Source Rank**: The source rank specified in `MPI_Recv` matches the rank of process $A$, or the receiver specifies wildcard `MPI_ANY_SOURCE`.
3. **Tag**: The integer tag passed to `MPI_Recv` matches the integer tag specified in `MPI_Send`, or the receiver specifies wildcard `MPI_ANY_TAG`.
4. **Buffer Data Type**: The data type declared at the receiver must be compatible with the type sent, and the destination buffer must be large enough to hold the incoming data.

### Message ordering guarantees

MPI guarantees **non-overtaking** ordering for messages with identical source, destination, communicator, and tag. If rank 0 sends message $M_1$ to rank 1 and then sends message $M_2$ to rank 1 with identical envelopes:

- Rank 1 will always receive $M_1$ before $M_2$ if it posts matching receives.
- Messages sent on different communicators or with different tags/sources do not have strict ordering guarantees relative to each other.

### Blocking semantics

`MPI_Send` is *blocking*. It returns only when the application buffer supplied to the call can be safely modified without overwriting the message payload. 
- If the MPI implementation copies the message into an internal system buffer, `MPI_Send` may return before a matching `MPI_Recv` is posted on the destination rank.
- If the message payload is large or system buffers are exhausted, `MPI_Send` blocks until the receiver posts a matching `MPI_Recv` and the transfer completes.

Because standard `MPI_Send` behavior depends on buffer availability, relying on implicit system buffering introduces non-deterministic deadlocks.

## A worked example

To fix the cyclic dependency deadlock shown earlier, ranks can alternate execution order based on their rank ID, ensuring that a send always meets a posted receive.

```c
#include <mpi.h>
#include <stdio.h>

int main(int argc, char** argv) {
    MPI_Init(&argc, &argv);

    int rank, size;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &size);

    if (size < 2) {
        MPI_Finalize();
        return 0;
    }

    int send_val = rank * 10;
    int recv_val = -1;
    int target_rank = (rank == 0) ? 1 : 0;
    int tag = 200;

    if (rank == 0) {
        // Line 23: Rank 0 sends first, then receives
        MPI_Send(&send_val, 1, MPI_INT, target_rank, tag, MPI_COMM_WORLD);
        MPI_Recv(&recv_val, 1, MPI_INT, target_rank, tag, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
    } else if (rank == 1) {
        // Line 27: Rank 1 receives first, then sends
        MPI_Recv(&recv_val, 1, MPI_INT, target_rank, tag, MPI_COMM_WORLD, MPI_STATUS_IGNORE);
        MPI_Send(&send_val, 1, MPI_INT, target_rank, tag, MPI_COMM_WORLD);
    }

    printf("Rank %d received value %d from Rank %d\n", rank, recv_val, target_rank);

    MPI_Finalize();
    return 0;
}
```

### Explanation of key calls

- **Lines 23–24 (`rank == 0`)**: Rank 0 issues `MPI_Send` to Rank 1. Because Rank 1 is concurrently executing `MPI_Recv` on line 27, the message payload matches immediately. Once the send completes, Rank 0 proceeds to `MPI_Recv`.
- **Lines 27–28 (`rank == 1`)**: Rank 1 posts `MPI_Recv` expecting a message from Rank 0 with tag `200` on `MPI_COMM_WORLD`. It blocks until Rank 0's send arrives. Once consumed, it proceeds to send its payload back to Rank 0.
- **`MPI_STATUS_IGNORE`**: Used when message metadata (such as exact source rank or tag when wildcards are used, or actual count of elements received) is not required by the application.

An alternative combined operation is `MPI_Sendrecv`, which safely executes a concurrent send and receive within a single call without manual rank branch management.

## What the compiler and runtime can and cannot do

| Feature / Responsibility | Compiler | MPI Runtime | Application Developer |
| :--- | :--- | :--- | :--- |
| **Detecting Deadlocks** | Cannot analyze cross-process program state | Cannot predict future call sequences | Must structure execution to avoid cyclic blocking dependencies |
| **Message Matching** | Inactive | Matches envelope (comm, tag, source) upon arrival | Must specify correct matching parameters |
| **Buffer Safety** | Ensures local variables do not violate language rules | Manages internal network send/receive queues | Must not modify send buffers until call completes |
| **Optimization Across Ranks** | Cannot reorder library calls across nodes | Optimizes network transport layer (e.g., shared memory vs InfiniBand) | Must group or pack small messages to reduce latency overhead |

## Common misconceptions

### "MPI_Send always blocks until the receiver calls MPI_Recv"
Standard `MPI_Send` is permitted to return early if the MPI library buffers the message internally. However, applications must not rely on system buffering for correctness; if the message size exceeds the system buffer limit, `MPI_Send` will block until a receive is posted.

### "Matching tags alone is sufficient to pair a message"
A matching tag is not enough. The communicator and source rank must also match. If two processes use the same tag but reside in different communicators, their messages will never match.

### "The compiler can optimize away deadlocks by reordering MPI routines"
Compilers treat library calls like `MPI_Send` and `MPI_Recv` as opaque function calls with potential side effects. A C or C++ compiler cannot reorder MPI calls across rank boundaries or inspect distant process flows.

## Where this leaves you

- Audit your point-to-point communication calls for cyclic dependencies where all ranks wait on a blocking `MPI_Send`.
- Replace manual rank-ordered send and receive blocks with `MPI_Sendrecv` or non-blocking operations (`MPI_Isend`, `MPI_Irecv`) when bi-directional exchange is needed.

## What To Read Next

- [/docs/parallel-computing/what-a-cluster-is](/docs/parallel-computing/what-a-cluster-is)
- [/docs/parallel-computing/communication-cost-and-granularity](/docs/parallel-computing/communication-cost-and-granularity)
- [/docs/parallel-computing/shared-versus-distributed-memory](/docs/parallel-computing/shared-versus-distributed-memory)

![Diagram](/img/parallel/mpi-send-receive-matching.svg)

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann.
- Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*. Addison-Wesley.
- Message Passing Interface Forum. *MPI: A Message-Passing Interface Standard*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/mpi-send-receive-matching/)
