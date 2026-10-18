---
title: "Decomposition, Tasks, and Mapping"
description: "Before choosing OpenMP, MPI, or CUDA, a parallel program must be decomposed into tasks, evaluated for dependencies, and mapped onto execution units."
keywords:
  - decomposition
  - domain decomposition
  - functional decomposition
  - task dependency graph
  - mapping
  - static mapping
  - dynamic mapping
  - load balancing
  - task granularity
  - parallel design
  - runtime scheduling
  - work distribution
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/decomposition-tasks-and-mapping
---

In this section of Chapter 2 (CPU Parallel Programming: Design and Cost), we examine the foundational design pipeline for any parallel algorithm: decomposition, dependency analysis, and mapping. Parallel algorithm design begins long before choosing a specific library or target API—it starts by structuring work into tasks and controlling their interactions.

:::tip Read these first
- [/docs/parallel-computing/fundamentals/program-process-thread-core](/docs/parallel-computing/fundamentals/program-process-thread-core) — Threads are the execution units scheduled onto CPU hardware.
- [/docs/parallel-computing/shared-versus-distributed-memory](/docs/parallel-computing/shared-versus-distributed-memory) — The physical memory structure dictates the cost of communication between tasks.
:::

:::important What you should leave with
Identify your program's tasks and their dependency edges before selecting a parallel framework. Mapping choices (static vs. dynamic) trade off scheduling overhead against load balance.
:::

## Why you should care

Writing parallel code without explicit decomposition and mapping often leads to unbalanced workloads or excessive synchronization overhead. Consider a simple matrix-vector processing pipeline where different rows or regions require unequal amounts of computation (for example, sparse or triangular matrices):

```c
// Naive static iteration without considering task cost distribution
void process_rows_naive(double **A, double *x, double *y, int n, int num_threads) {
    // Arbitrary naive assignment: Thread i gets a fixed block of rows
    // If lower rows do significantly more work, thread execution times diverge sharply.
    #pragma omp parallel for schedule(static)
    for (int i = 0; i < n; i++) {
        double sum = 0.0;
        for (int j = 0; j <= i; j++) { // Triangular computation: row i does i+1 ops
            sum += A[i][j] * x[j];
        }
        y[i] = sum;
    }
}
```

If we map loop iterations uniformly across threads without analyzing the computation cost per iteration, lower-numbered threads finish early and sit idle while higher-numbered threads perform the bulk of the arithmetic. To fix this, we must formally break the work down into discrete tasks, analyze how tasks depend on one another, and map them strategically to hardware resources.

---

## The mechanism

Designing a parallel program consists of three consecutive phases:

1. **Decomposition**: Dividing the total problem into smaller units of computation called *tasks*.
2. **Dependency Analysis**: Identifying which tasks must complete before others can start (defining data and control dependencies).
3. **Mapping**: Assigning tasks to physical processing elements (threads, cores, or nodes).



### Types of Decomposition

- **Domain (Data) Decomposition**: The input data, intermediate data, or output data is partitioned into sub-domains. Each task performs similar computational operations on its assigned fraction of data. Examples include image processing blocks or matrix slicing.
- **Functional Decomposition**: The computation itself is divided into distinct functions or operations. Tasks execute different operations on shared or streamed datasets, such as in pipeline architectures or signal processing stages.

### Tasks and Interactions

A **task** is an atomic unit of computation that can run concurrently with other tasks subject to dependency constraints.
When tasks must share intermediate results, communicate across hardware domains, or enforce explicit execution order, an **interaction** (or edge) exists between them.
The collection of tasks and their directed dependency edges forms a **Directed Acyclic Graph (DAG)**. The length of the longest path through this DAG defines the *critical path*, which sets the lower bound on execution time regardless of thread availability.

### Mapping Strategies

Mapping places individual tasks onto logical threads or hardware execution units.

| Mapping Style | Mechanism | Trade-off |
| :--- | :--- | :--- |
| **Static Mapping** | Tasks are assigned to workers *before* execution based on predictable heuristics or fixed patterns. | Zero runtime scheduling overhead; vulnerable to severe load imbalances if task execution times vary dynamically. |
| **Dynamic Mapping** | Tasks are placed in a queue or pool, and threads retrieve work *during* execution as they become idle. | Excellent load balancing; introduces runtime synchronization overhead and potential loss of cache locality. |

---

## A worked example

The following C program demonstrates decomposition and dynamic mapping using a thread pool and task queue to execute a dynamic task dependency graph.

```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define NUM_TASKS 8
#define NUM_THREADS 2

typedef struct {
    int id;
    int duration_ms;
    int cost;
} Task;

typedef struct {
    Task tasks[NUM_TASKS];
    int current_index;
    pthread_mutex_t lock;
} TaskQueue;

TaskQueue queue;

void* worker_thread(void* arg) {
    long thread_id = (long)arg;

    while (1) {
        Task current_task;
        
        // Dynamic mapping step: acquire lock and take next work unit
        pthread_mutex_lock(&queue.lock);
        if (queue.current_index >= NUM_TASKS) {
            pthread_mutex_unlock(&queue.lock);
            break; // No more work remaining
        }
        current_task = queue.tasks[queue.current_index];
        queue.current_index++;
        pthread_mutex_unlock(&queue.lock);

        // Execute task work outside critical section
        int result = 0;
        for (int i = 0; i < current_task.cost; i++) {
            result += (i * current_task.id);
        }

        printf("Worker Thread %ld executed Task %d (Cost: %d, Result: %d)\n",
               thread_id, current_task.id, current_task.cost, result);
    }
    return NULL;
}

int main(void) {
    // 1. Decomposition: Initialize tasks with non-uniform workloads
    for (int i = 0; i < NUM_TASKS; i++) {
        queue.tasks[i].id = i;
        queue.tasks[i].cost = (i % 2 == 0) ? 100000 : 500000; // Variable computational weight
    }
    queue.current_index = 0;
    pthread_mutex_init(&queue.lock, NULL);

    pthread_t threads[NUM_THREADS];

    // 2. Mapping: Launch worker threads to pull dynamically from queue
    for (long i = 0; i < NUM_THREADS; i++) {
        pthread_create(&threads[i], NULL, worker_thread, (void*)i);
    }

    // Wait for all workers to complete
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    pthread_mutex_destroy(&queue.lock);
    return 0;
}
```

### Line-by-Line Breakdown

- `queue.tasks[i].cost = (i % 2 == 0) ? 100000 : 500000;`: **Decomposition phase**. Work is explicitly segmented into distinct task items with non-uniform computation lengths.
- `pthread_mutex_lock(&queue.lock);` ... `queue.current_index++;`: **Dynamic mapping step**. Instead of statically allocating `NUM_TASKS / NUM_THREADS` to each worker, workers dynamically claim the next task from the shared queue when free.
- `pthread_mutex_unlock(&queue.lock);`: The queue mutex is released *before* the computation loop runs. This minimizes the critical section size, preventing worker threads from serializing on queue access.
- `for (int i = 0; i < current_task.cost; i++)`: The worker executes the core task logic independently without holding locks, allowing fully parallel execution.

---

## What the compiler and runtime can and cannot do

- **What compilers can do**: Compilers can automatically decompose simple counted loops (`#pragma omp parallel for`) into static chunk ranges or invoke runtime library schedulers.
- **What runtimes can do**: Runtimes (such as the OpenMP runtime or Intel TBB) manage dynamic task pools, execute work-stealing algorithms, and balance queue workloads automatically when tasks are defined using task directives (`#pragma omp task`).
- **What compilers and runtimes cannot do**: Neither can automatically deduce domain-level algorithm invariants or infer missing task dependencies across complex global pointer graphs. If data dependencies between decomposed tasks are obscured or undeclared, the compiler cannot safely parallelize them without risking data races.

---

## Common misconceptions

### "Task decomposition and domain decomposition are mutually exclusive."
Domain decomposition splits data; task decomposition splits computational units. In practice, domain decomposition almost always generates individual tasks (processing chunk $i$ of domain $D$). They are complementary design perspectives rather than mutually exclusive models.

### "Dynamic mapping is always superior to static mapping."
Dynamic mapping requires synchronization (locks, atomic fetch-add, or queue locks) each time a worker retrieves work. For lightweight uniform tasks, the scheduling overhead of dynamic mapping can exceed the execution time of the actual computational work. Static mapping remains optimal for uniform workloads with predictable task weights.

### "More fine-grained decomposition always yields higher performance."
Dividing a problem into millions of microscopic tasks increases the total concurrency available, but it drastically inflates scheduling overhead and weakens cache locality. Optimal performance requires tuning task granularity so that task execution time significantly dominates mapping overhead.

---

## Where this leaves you

Evaluate your application's workload distribution before writing platform code:
1. Break down the core algorithm into logical tasks and draft its dependency graph.
2. If tasks are uniform and independent, choose static block/cyclic mapping to avoid runtime overhead.
3. If task computational costs are variable or unpredictable, choose dynamic task queue mapping or work stealing to maintain balanced thread utilization.

---

## What To Read Next

- [/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law) — Understand how dependency critical paths limit overall speedup.
- [/docs/parallel-computing/fundamentals/measuring-parallel-performance](/docs/parallel-computing/fundamentals/measuring-parallel-performance) — Measure load balance efficiency across varying thread mappings.

---

![Diagram](/img/parallel/decomposition-tasks-and-mapping.svg)

## References

- Ananth Grama, Anshul Gupta, George Karypis, and Vipin Kumar, *Introduction to Parallel Computing*.
- Peter Pacheco, *An Introduction to Parallel Programming*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/decomposition-tasks-and-mapping/)
