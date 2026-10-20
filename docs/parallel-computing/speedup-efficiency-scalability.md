---
title: "Speedup, Efficiency, and Scalability"
description: "How to measure parallel performance against a true serial baseline, compute parallel efficiency, and evaluate strong versus weak scalability."
keywords:
  - speedup metric
  - parallel efficiency
  - strong scalability
  - weak scalability
  - serial baseline
  - execution time ratio
  - Amdahl law limit
  - thread overhead
  - workload scaling
  - parallel runtime cost
  - thread count mapping
  - speedup saturation
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/speedup-efficiency-scalability
---

Speedup measures how much faster a parallel execution runs compared to the best sequential algorithm on a single worker. Evaluating speedup against a true serial baseline prevents misinterpreting runtime scaling as hardware efficiency.

:::tip Read these first
* [/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law) — The serial fraction bounds speedup; a bigger problem changes the fraction.
* [/docs/parallel-computing/fundamentals/measuring-parallel-performance](/docs/parallel-computing/fundamentals/measuring-parallel-performance) — Report speedup against a real baseline, not a thread count.
:::

:::important What you should leave with
Always measure speedup against the fastest unthreaded serial implementation running on one core. Measuring speedup relative to a single worker running parallelized code hides synchronization overhead and inflates efficiency metrics.
:::

## Why you should care

Evaluating speedup requires an absolute serial benchmark. If you evaluate a multi-threaded execution against a 1-thread run of the *parallel* program, the single-thread run still incurs thread management, work-stealing, or lock overhead. This makes the 1-thread parallel execution slower than a pure sequential algorithm, producing an artificially high speedup ratio when scaling to multiple workers.

Consider a runtime component or program that processes an array of data. Below is a minimal C benchmark setup comparing a sequential reduction baseline to a multi-threaded implementation.

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <omp.h>

// Serial baseline using a direct, unthreaded loop
double serial_reduction(const double *data, size_t n) {
    double sum = 0.0;
    for (size_t i = 0; i < n; ++i) {
        sum += data[i];
    }
    return sum;
}

// Parallel implementation using OpenMP
double parallel_reduction(const double *data, size_t n, int num_threads) {
    double sum = 0.0;
    #pragma omp parallel for num_threads(num_threads) reduction(+:sum) schedule(static)
    for (size_t i = 0; i < n; ++i) {
        sum += data[i];
    }
    return sum;
}
```

If `parallel_reduction` with 1 thread takes $0.15$ seconds due to runtime pool initialization, but `serial_reduction` takes $0.10$ seconds, using the 1-thread parallel run as your baseline skews all performance ratios. Measuring against $0.10$ seconds reveals the true speedup and efficiency of the system.

## The mechanism

Speedup ($S_p$) and parallel efficiency ($E_p$) are defined using execution times on a given problem size $n$ and worker count $p$:

$$S_p = \frac\{T_1\}\{T_p\}$$

$$E_p = \frac\{S_p\}\{p\} = \frac\{T_1\}\{p \cdot T_p\}$$

Where:
* $T_1$ is the execution time of the optimal sequential algorithm on 1 core.
* $T_p$ is the execution time of the parallel algorithm on $p$ cores.
* $S_p$ is speedup.
* $E_p$ is parallel efficiency, reflecting the fraction of useful work performed per worker.

As $p$ increases, communication overhead, lock contention, memory bus saturation, and unparallelized serial sections ($f$) limit speedup. 



Scalability evaluates how well a parallel system maintains efficiency as workers or workload sizes grow:

1. **Strong Scalability**: Problem size $n$ remains fixed while worker count $p$ increases. Efficiency typically declines rapidly as $p$ grows because fixed serial overheads dominate.
2. **Weak Scalability**: Problem size $n$ increases proportionally with worker count $p$ (constant workload per worker). Efficiency remains higher because memory access patterns and heavy compute scale alongside processing power.

## A comparison

Different scaling modes serve distinct runtime and algorithmic objectives:

| Dimension | Strong Scaling | Weak Scaling |
| :--- | :--- | :--- |
| **Fixed Variable** | Problem size $n$ | Problem size per worker ($n / p$) |
| **Primary Goal** | Minimize latency for a fixed task | Maximize throughput/problem size in fixed time |
| **Dominant Bottleneck** | Serial fraction $f$, lock contention, runtime latency | Interconnect bandwidth, memory capacity, global barriers |
| **Efficiency Trend** | Decreases rapidly as $p$ increases | Stays relatively constant if memory access is localized |

## A worked example

The following program benchmarks the serial baseline against parallel execution, computing speedup and efficiency metrics.

```c
#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

void compute_workload(double *array, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        array[i] = array[i] * 1.000001 + 0.0001;
    }
}

int main(void) {
    const size_t N = 50000000;
    double *data = (double *)malloc(N * sizeof(double));
    for (size_t i = 0; i < N; ++i) data[i] = 1.0;

    // 1. Measure true serial baseline
    double t_start = omp_get_wtime();
    compute_workload(data, N);
    double t_serial = omp_get_wtime() - t_start;

    printf("Serial baseline (T1): %f seconds\n", t_serial);

    // 2. Measure parallel execution across worker counts
    int thread_counts[] = {1, 2, 4, 8};
    int num_runs = sizeof(thread_counts) / sizeof(thread_counts[0]);

    for (int i = 0; i < num_runs; ++i) {
        int threads = thread_counts[i];

        t_start = omp_get_wtime();
        #pragma omp parallel for num_threads(threads) schedule(static)
        for (size_t j = 0; j < N; ++j) {
            data[j] = data[j] * 1.000001 + 0.0001;
        }
        double t_parallel = omp_get_wtime() - t_start;

        // Calculate metrics using true serial time t_serial
        double speedup = t_serial / t_parallel;
        double efficiency = speedup / threads;

        printf("Threads: %2d | Time: %f s | Speedup: %5.2fx | Efficiency: %5.2f\n",
               threads, t_parallel, speedup, efficiency);
    }

    free(data);
    return 0;
}
```

### Line-by-line explanation

* **Lines 13–15**: Measures $T_1$ using a sequential loop with no OpenMP pragmas or runtime thread pool overhead.
* **Line 26**: Executes the loop across varying thread counts ($p$).
* **Line 31**: Computes $T_p$ for the active worker allocation.
* **Line 34**: Computes speedup $S_p = \frac\{T_1\}\{T_p\}$ relative to the sequential baseline $T_1$, rather than the 1-thread parallel runtime.
* **Line 35**: Computes parallel efficiency $E_p = \frac\{S_p\}\{p\}$. An efficiency value significantly below $1.0$ at low thread counts indicates scheduling overhead or memory bandwidth limitations.

## What the compiler and the runtime can and cannot do

Compilers and parallel runtimes optimize loop scheduling, but physical limits bound efficiency:

* **What the compiler can do**:
  * Autovectorize loop iterations within each worker thread (SIMD).
  * Eliminate redundant synchronization calls when thread local regions are proven isolated.
  * Adjust static loop chunk sizes to minimize scheduling overhead.

* **What the runtime can do**:
  * Balance dynamic workloads across workers using work-stealing schedulers.
  * Reuse worker threads in thread pools to avoid creation and destruction costs.

* **What neither can do**:
  * Overcome physical memory bus saturation when all worker cores contend for dynamic RAM bandwidth.
  * Eliminate intrinsic serial dependencies inherent in the mathematical formulation of an algorithm.

## Common misconceptions

### 1-thread parallel runtime speedup equals true speedup
Measuring speedup as $T_\{parallel, 1\} / T_\{parallel, p\}$ artificially masks overheads introduced by multithreading constructs. Always compare $T_p$ against an optimized sequential execution $T_1$.

### Parallel efficiency remains constant as core count scales
Efficiency almost always decreases as worker count increases under fixed problem sizes (strong scaling). Serial regions, cache coherence invalidations, and lock contention consume a larger percentage of total execution time as $p$ grows.

### Superlinear speedup ($S_p > p$) violates conservation laws
Superlinear speedup occasionally occurs when subdividing a dataset allows the working set of each thread to fit entirely within high-speed L1/L2 hardware caches, dramatically reducing main memory latency relative to the single-threaded baseline.

## Where this leaves you

Measure baseline time using a single-threaded implementation without parallel runtime initialization overhead. Calculate both speedup $S_p$ and efficiency $E_p$ across target core allocations to identify whether performance saturation stems from memory bandwidth bounds or serial software bottlenecks.

## What To Read Next

* [/docs/parallel-computing/why-parallel-programs](/docs/parallel-computing/why-parallel-programs) — Why a parallel program is a different program.
* [/docs/parallel-computing/communication-cost-and-granularity](/docs/parallel-computing/communication-cost-and-granularity) — Communication cost and granularity.
* [/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law) — How serial bottlenecks dictate upper limits on theoretical speedup.

![Diagram](/img/parallel/speedup-efficiency-scalability.svg)

## References

* Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann.
* Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*. Addison-Wesley.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/speedup-efficiency-scalability/)
