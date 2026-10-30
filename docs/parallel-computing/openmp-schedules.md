---
title: "OpenMP schedules"
description: "How static, dynamic, and guided OpenMP loop schedules distribute work iterations across threads, their runtime overheads, and why scheduling cannot eliminate loop-carried dependencies."
keywords:
  - OpenMP schedules
  - static schedule
  - dynamic schedule
  - guided schedule
  - OMP_SCHEDULE
  - loop work imbalance
  - thread load balancing
  - chunk size
  - OpenMP runtime overhead
  - loop-carried dependence
  - work distribution
  - loop scheduling clause
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/openmp-schedules
---

Loop scheduling dictates how a parallel runtime divides loop iterations among executing threads. Choosing the wrong schedule can stall threads on imbalanced workloads or flood the runtime with dispatch synchronization overhead.

:::tip Read these first
- [/docs/parallel-computing/pthreads-mutex-and-barrier](/docs/parallel-computing/pthreads-mutex-and-barrier) — Pthreads: create, join, mutex, and barrier
- [/docs/parallel-computing/openmp-reduction-and-dependence](/docs/parallel-computing/openmp-reduction-and-dependence) — OpenMP regions, reductions, and loop-carried dependence
:::

:::important What you should leave with
A schedule only controls work assignment to threads; it does not resolve or eliminate data dependencies between loop iterations.
:::

## Why you should care

When loop iterations perform varying amounts of computation, assigning an equal number of contiguous iterations to each thread creates a work imbalance. The total execution time of the parallel region becomes dictated by the single thread that receives the heaviest iterations, while other threads sit idle at the implicit barrier at the end of the loop.

Consider a triangular array computation where iteration `i` performs `i` operations:

```c
#include <omp.h>
#include <stdio.h>
#include <math.h>

#define N 8000

void compute_triangular(double *matrix) {
    #pragma omp parallel for schedule(static)
    for (int i = 0; i < N; i++) {
        for (int j = 0; j <= i; j++) {
            matrix[i * N + j] = sin(i) * cos(j);
        }
    }
}
```

Under `schedule(static)`, thread 0 processes iterations `0` to `N/P - 1`, performing relatively few operations. Thread `P-1` processes iterations `(P-1)N/P` to `N - 1`, executing millions more floating-point operations. Thread 0 finishes quickly and waits at the implicit loop barrier while Thread `P-1` continues executing alone.

To fix this imbalance without rewriting the algorithm, OpenMP provides loop scheduling clauses that alter how iterations map to execution threads.

## The mechanism

The OpenMP standard defines four primary loop scheduling kinds: `static`, `dynamic`, `guided`, and `runtime`. Each makes a distinct trade-off between runtime distribution overhead and workload load balancing.

```
Iter:  [ 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 ]

STATIC (chunk=2):
  Thread 0: [ 0 | 1 ]          [ 4 | 5 ]
  Thread 1:          [ 2 | 3 ]          [ 6 | 7 ]
  (Pre-assigned before loop starts)

DYNAMIC (chunk=1):
  Thread 0: [ 0 ]     [ 2 ]     [ 5 ]
  Thread 1:     [ 1 ]     [ 3 | 4 ]     [ 6 | 7 ]
  (Requested at runtime from shared queue)
```

### Static schedule

With `schedule(static, chunk_size)`, the runtime or compiler divides the iteration space into chunks of size `chunk_size` and distributes them to threads in a round-robin order prior to loop execution. If `chunk_size` is omitted, the iteration space is divided into roughly equal chunks such that each thread receives exactly one chunk.

Because work assignments are predetermined, `static` scheduling incurs minimal runtime overhead. The compiler can generate simple loop bounds calculations directly inside the thread body. Furthermore, `static` schedule preserves spatial memory locality across multiple loop executions if threads operate on the same array elements.

### Dynamic schedule

With `schedule(dynamic, chunk_size)`, the runtime maintains an internal thread-safe queue of iteration chunks. When a thread finishes its assigned chunk, it requests another chunk from the runtime queue. If `chunk_size` is omitted, it defaults to `1`.

`dynamic` scheduling adapts to non-uniform iteration costs. However, fetching chunks requires thread synchronization (such as an atomic fetch-and-add or lock) within the OpenMP runtime runtime library. Small chunk sizes increase the frequency of runtime requests, causing lock contention and bus traffic that can erode parallel performance.

### Guided schedule

With `schedule(guided, chunk_size)`, the runtime hands out chunks of decreasing size as the loop progresses. The size of each allocated chunk is proportional to the number of unassigned iterations divided by the number of participating threads. The chunk size decreases exponentially down to the specified minimum `chunk_size` (which defaults to `1`).

`guided` scheduling reduces synchronization overhead relative to `dynamic` scheduling because large initial chunks amortize runtime lock requests. As the computation nears completion, smaller chunks allow active threads to pull remaining work without leaving threads idle near the barrier.

### Runtime schedule

With `schedule(runtime)`, the compiler defers the choice of schedule and chunk size to runtime environment variables. The schedule is specified externally at execution time using the `OMP_SCHEDULE` environment variable (for example, `export OMP_SCHEDULE="guided,4"`).



## A comparison

| Schedule | Chunk Assignment Time | Runtime Overhead | Work Load Balancing | Memory Locality Preservation |
| :--- | :--- | :--- | :--- | :--- |
| `static` | Compiler / Loop Entry | Extremely Low | Poor for uneven loops | High |
| `static, N` | Loop Entry | Very Low | Moderate | High |
| `dynamic, N` | Runtime execution | High | Excellent | Low |
| `guided, N` | Runtime execution | Moderate | Very Good | Moderate |
| `runtime` | Application Startup | Low to High | Configurable via environment | Depends on `OMP_SCHEDULE` |

## A worked example

The following program benchmarks the behavior of different OpenMP schedules on an uneven, workload-imbalanced loop.

```c
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <omp.h>

#define N 16000

double work_item(int i) {
    // Artificial workload that grows non-linearly with index i
    double val = 0.0;
    int iterations = (i % 100) * 1000;
    for (int k = 0; k < iterations; k++) {
        val += sin(k + i) * cos(k - i);
    }
    return val;
}

void execute_schedules(double *results) {
    // 1. Static Schedule
    double start = omp_get_wtime();
    #pragma omp parallel for schedule(static)
    for (int i = 0; i < N; i++) {
        results[i] = work_item(i);
    }
    double t_static = omp_get_wtime() - start;

    // 2. Dynamic Schedule with small chunk size
    start = omp_get_wtime();
    #pragma omp parallel for schedule(dynamic, 16)
    for (int i = 0; i < N; i++) {
        results[i] = work_item(i);
    }
    double t_dynamic = omp_get_wtime() - start;

    // 3. Guided Schedule
    start = omp_get_wtime();
    #pragma omp parallel for schedule(guided, 16)
    for (int i = 0; i < N; i++) {
        results[i] = work_item(i);
    }
    double t_guided = omp_get_wtime() - start;

    printf("Static time:  %f s\n", t_static);
    printf("Dynamic time: %f s\n", t_dynamic);
    printf("Guided time:  %f s\n", t_guided);
}

int main(void) {
    double *results = (double *)malloc(N * sizeof(double));
    if (!results) return 1;

    execute_schedules(results);

    free(results);
    return 0;
}
```

### Source Walkthrough

1. `work_item(int i)`: Computes a loop bound proportional to `i % 100`. Nearby iterations vary wildly in cost, creating imbalance.
2. `#pragma omp parallel for schedule(static)`: Divides `N` into equal chunks statically. Threads assigned lightweight iterations finish early and stall at the implicit barrier.
3. `#pragma omp parallel for schedule(dynamic, 16)`: Assigns work in units of 16 iterations. Threads that process light chunks immediately fetch new chunks from the shared work queue, mitigating load imbalance.
4. `#pragma omp parallel for schedule(guided, 16)`: Starts with large initial chunks, rapidly reducing chunk sizes down to 16. This minimizes lock contention on the global runtime queue early in the execution while preserving balance near the end of the loop.

## What the compiler and the runtime can and cannot do

### What the compiler can do

- Transform static loop schedules into simple lower and upper bounds computations directly in thread functions without inserting library calls.
- Lower `#pragma omp parallel for schedule(runtime)` into calls to standard OpenMP library dispatches (such as `__kmpc_dispatch_init` or `GOMP_loop_runtime_start`).

### What the runtime can do

- Maintain runtime lock structures, work queues, and stealing mechanisms to distribute dynamic and guided chunks across thread pools.
- Read environment variables like `OMP_SCHEDULE` during startup to configure dynamically bound loops.

### What the runtime and compiler CANNOT do

- **A schedule cannot remove or resolve a loop-carried data dependence.** If iteration `i` reads data written by iteration `i - 1`, changing the schedule from `static` to `dynamic` will not fix the data race or produce correct output.
- **A schedule cannot prevent false sharing.** If two threads receive adjacent memory addresses in distinct dynamic chunks, cache line bouncing will degrade memory performance.

## Common misconceptions

### A dynamic schedule always runs faster than a static schedule

Incorrect. For uniform loops where every iteration performs identical work, `schedule(dynamic)` adds lock synchronization and runtime queue access overhead to every chunk dispatch. `schedule(static)` incurs zero runtime synchronization overhead after loop initialization.

### Guided scheduling eliminates all load imbalances

Incorrect. If the final iteration of a loop contains an extreme computational outlier, the thread that receives that single iteration will still block all other threads at the loop barrier.

### Setting a schedule clause makes a loop thread-safe

Incorrect. Schedule clauses govern *when* and *to whom* iterations are assigned, not *how* shared memory is synchronized. Read/write hazards across iterations must be resolved using reductions, atomics, or explicit locks regardless of the chosen schedule.

## Where this leaves you

Profile your parallel loops before changing schedules. Use `schedule(static)` when iterations have uniform work and predictable array access patterns. Switch to `schedule(guided)` or `schedule(dynamic, chunk_size)` when iteration workloads vary significantly across the domain.

## What To Read Next

- [/docs/parallel-computing/openmp-reduction-and-dependence](/docs/parallel-computing/openmp-reduction-and-dependence) — OpenMP regions, reductions, and loop-carried dependence
- [/docs/parallel-computing/decomposition-tasks-and-mapping](/docs/parallel-computing/decomposition-tasks-and-mapping) — Decomposition, tasks, and mapping
- [/docs/parallel-computing/fundamentals/what-is-parallel-computing](/docs/parallel-computing/fundamentals/what-is-parallel-computing) — What is Parallel Computing?

![Diagram](/img/parallel/openmp-schedules.svg)

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann.
- OpenMP Architecture Review Board. *OpenMP Application Programming Interface Specification*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/openmp-schedules/)
