---
title: "Thread Pools, Work Stealing, and oneTBB"
description: "How task-based runtime systems use persistent thread pools and work-stealing double-ended queues to balance dynamic workloads with minimal synchronisation overhead."
keywords:
  - thread pool
  - work stealing
  - dynamic load balancing
  - task parallelism
  - double ended queue
  - lock free queue
  - task scheduling
  - oneTBB
  - Intel TBB
  - thread building blocks
  - task group
  - parallel for
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/thread-pools-and-onetbb
---

Creating an OS thread for every dynamic task destroys execution efficiency through kernel context switches and allocation overhead. Task-based runtimes like oneTBB solve this by hosting work items on a fixed pool of persistent threads and distributing execution dynamically via work stealing.

:::tip Read these first
- [/docs/parallel-computing/decomposition-tasks-and-mapping](/docs/parallel-computing/decomposition-tasks-and-mapping) — Task decomposition, execution graphs, and dynamic mapping strategies.
- [/docs/parallel-computing/openmp-tasks-and-sections](/docs/parallel-computing/openmp-tasks-and-sections) — Dynamic work generation using runtime-managed task queues.
:::

:::important What you should leave with
Work stealing balances dynamic workloads by having idle threads steal coarse-grained tasks from the top of another thread's deque while the owner pushes and pops fine-grained tasks from the bottom.
:::

## Why you should care

Consider a recursive divide-and-conquer function such as quicksort or tree processing. Spawning a kernel thread for every subtree invocation rapidly overwhelms the operating system thread scheduler:

```cpp
// Naive implementation: creating OS threads per dynamic task
void parallel_quicksort_naive(int* array, int low, int high) {
    if (low < high) {
        int pivot = partition(array, low, high);

        // BAD: Creating OS threads per recursive call destroys performance
        std::thread left(parallel_quicksort_naive, array, low, pivot - 1);
        std::thread right(parallel_quicksort_naive, array, pivot + 1, high);

        left.join();
        right.join();
    }
}
```

Creating thousands of `std::thread` instances incurs severe overhead:
1. Memory overhead: Each thread reserves its own stack (often 1 MB to 8 MB per thread).
2. OS scheduler churn: Context switching thousands of threads across a few physical CPU cores dominates execution time.
3. Cache coldness: Tasks execute on arbitrary cores, invalidating instruction and data caches.

To make task-based programming scale, the runtime must reuse a persistent set of worker threads matched to the available CPU cores and distribute tasks without central lock contention.

## The mechanism

Task-based execution engines decouple work specification (tasks) from work execution (threads). The runtime engine uses two main structures: a persistent **thread pool** and per-worker **double-ended queues (deques)**.



### The Work-Stealing Algorithm

Each worker thread manages its own lock-free work deque using a specific discipline:

1. **Local Access (LIFO)**: The thread owning the deque pushes newly spawned child tasks onto the **bottom** of its deque and pops work from the **bottom** when executing tasks.
   - *Why LIFO?* The most recently generated task has high data locality (its data is likely still in the core's L1/L2 cache). Furthermore, recursive tasks at the bottom of the stack are smaller, finer-grained execution units.
2. **Stealing Access (FIFO)**: When a worker thread runs out of local tasks, it becomes a thief. It selects a victim thread at random and attempts to steal a task from the **top** of the victim's deque.
   - *Why FIFO?* Tasks at the top of the deque are the oldest. In divide-and-conquer algorithms, older tasks represent high-level tree splits containing larger chunks of un-executed work. Stealing from the top yields coarse-grained parallelism, reducing future stealing attempts.
3. **Synchronization Overhead**: Because the owner operates on the bottom while thieves steal from the top, structural contention occurs only when the deque contains a single element or during pointer updates.

## A worked example

oneTBB (`oneAPI Thread Building Blocks`) implements this work-stealing mechanism in standard C++. Developers submit tasks using high-level construct wrappers like `tbb::parallel_for` or explicit task groups via `tbb::task_group`.

```cpp
#include <tbb/parallel_for.h>
#include <tbb/blocked_range.h>
#include <tbb/task_group.h>
#include <vector>
#include <cmath>

// Example 1: High-level parallel loop using oneTBB
void process_array_tbb(std::vector<double>& data) {
    // oneTBB automatically splits blocked_range into tasks across worker threads
    tbb::parallel_for(
        tbb::blocked_range<size_t>(0, data.size()),
        [&](const tbb::blocked_range<size_t>& range) {
            for (size_t i = range.begin(); i != range.end(); ++i) {
                data[i] = std::sin(data[i]) * std::cos(data[i]);
            }
        }
    );
}

// Example 2: Explicit dynamic task graph with tbb::task_group
void parallel_quicksort_tbb(int* array, int low, int high, tbb::task_group& g) {
    if (low < high) {
        if (high - low < 1000) {
            // Cutoff to sequential algorithm for small grain size
            std::sort(array + low, array + high + 1);
            return;
        }

        int pivot = partition(array, low, high);

        // Spawn left task asynchronously onto the local worker's deque
        g.run([=, &g]() {
            parallel_quicksort_tbb(array, low, pivot - 1, g);
        });

        // Run right task directly on the current thread (continuation)
        parallel_quicksort_tbb(array, pivot + 1, high, g);

        // Wait for spawned tasks in this scope to complete
        g.wait();
    }
}
```

### Line-by-Line Walkthrough

- **`tbb::parallel_for(...)`**: The runtime queries the persistent thread pool size, allocates a root range task, and places it into the executing worker thread's deque.
- **`tbb::blocked_range<size_t>(0, data.size())`**: Defines the iteration domain. The oneTBB partitioner dynamically recursively splits (`range.split()`) this domain into sub-ranges based on worker availability and queue states.
- **`g.run(...)`**: Wraps the lambda function into a lightweight task structure and pushes it to the **bottom** of the current worker thread's deque. It does not spawn an OS thread.
- **`parallel_quicksort_tbb(array, pivot + 1, high, g)`**: Executed immediately on the current thread as a continuation. This minimizes allocation and keeps local thread context warm.
- **`g.wait()`**: Blocks the logical execution of the current context. Instead of sitting idle, the worker thread enters the runtime task loop: it pops tasks from its own deque or steals tasks from other workers until the condition is met.

## What the compiler and runtime can and cannot do

| Feature / Responsibility | Handled by Runtime / Compiler | Handled by Application Developer |
| :--- | :--- | :--- |
| **OS Thread Allocation** | Runtime initializes persistent worker threads matching CPU hardware topology once at program launch. | Developer creates no manual `std::thread` instances for task work. |
| **Load Balancing** | Work-stealing engine dynamically redistributes unbalanced tasks across idle threads. | Developer exposes sufficient task granularity so stealing can occur effectively. |
| **Granularity Control** | Partioner (`tbb::auto_partitioner`) adjusts chunk sizes automatically during execution. | Developer must set a reasonable minimum threshold (sequential fallback) to avoid task creation overhead dominating execution time. |
| **Data Race Detection** | The compiler and runtime **cannot** detect data races or un-synchronized shared state across stolen tasks automatically. | Developer must supply thread-safe access models, atomics, or mutexes for shared data structures. |

## Common misconceptions

### "Thread pools eliminate all task creation overhead"
While task allocation is far cheaper than spawning OS threads, instantiating millions of trivial tasks (e.g., executing 2 instructions per task) still incurs allocation, deque manipulation, and scheduling overhead. A sequential fallback cutoff (grain size) is necessary for fine-grained algorithms.

### "Work stealing means threads wait for a central queue lock"
Work stealing uses per-thread double-ended queues. A worker accesses its local queue using lock-free atomic operations. Stealing occurs only when a thread becomes idle, meaning lock contention on a central bottleneck does not exist.

### "oneTBB task_group.wait() pauses the CPU core"
`wait()` does not put the underlying OS thread to sleep. The calling thread actively participates in the task pool, executing other pending tasks from its queue or stealing work from peers until the waited task completes.

## Where this leaves you

Inspect existing multithreaded systems to ensure that thread lifetime is decoupled from task execution:

1. Replace explicit per-task `std::thread` allocations with task-based dynamic runtime primitives such as `tbb::task_group` or `tbb::parallel_for`.
2. Check dynamic task partitioning: verify that task breakdown includes an appropriate sequential threshold cutoff to keep task allocation overhead under 5% of execution time.

## What To Read Next

- [/docs/parallel-computing/cpp-parallel-algorithms](/docs/parallel-computing/cpp-parallel-algorithms) — Standard C++ execution policies and their relationship to runtime task schedulers.
- [/docs/parallel-computing/openmp-schedules](/docs/parallel-computing/openmp-schedules) — Dynamic and guided schedule mechanisms in compiler-directed OpenMP loops.

![Diagram](/img/parallel/thread-pools-and-onetbb.svg)

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*.
- Intel Corporation. *oneAPI Thread Building Blocks (oneTBB) Architecture Guide*.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/thread-pools-and-onetbb/)
