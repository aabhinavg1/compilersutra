---
title: "Pthreads: Create, Join, Mutex, and Barrier"
description: "How pthread_create, pthread_join, mutexes, and barriers enforce parallel execution boundaries, mutual exclusion, and phase synchronization in C."
keywords:
  - POSIX threads
  - pthreads
  - pthread_create
  - pthread_join
  - pthread_mutex_t
  - pthread_barrier_t
  - thread life cycle
  - parallel regions
  - race conditions
  - mutual exclusion
  - barrier synchronization
  - concurrent execution
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/pthreads-mutex-and-barrier
---

POSIX threads provide explicitly managed shared-memory concurrency for standard C and C++ runtimes. A compiler or runtime engineer must understand how `pthread_create`, `pthread_join`, mutexes, and barriers interact with the OS scheduler and memory subsystem to ensure safe parallel execution.

:::tip Read these first
- [/docs/parallel-computing/program-process-thread-core](/docs/parallel-computing/program-process-thread-core) — Program, Process, Thread, Core: a thread is the unit you schedule; a core is the hardware that runs it.
- [/docs/parallel-computing/cache-coherence-and-false-sharing](/docs/parallel-computing/cache-coherence-and-false-sharing) — Cache Coherence and False Sharing: shared data writes require synchronization across cache lines.
:::

:::important What you should leave with
`pthread_create` spawns an execution context with shared memory, `pthread_join` reclaims it and guarantees memory visibility, `pthread_mutex` serializes updates to shared variables, and `pthread_barrier` aligns phase execution across threads.
:::

## Why you should care

When multiple execution contexts access shared memory concurrently, data races occur unless synchronized explicitly. Consider a shared counter incremented across four parallel threads:

```c
// Incorrect concurrent update without synchronization
void* worker(void* arg) {
    int* counter = (int*)arg;
    for (int i = 0; i < 100000; i++) {
        (*counter)++; // Read-modify-write race condition
    }
    return NULL;
}
```

Because `(*counter)++` compiles into separate load, increment, and store instructions, interleaved execution across CPU cores results in lost updates and unpredictable final counts. POSIX threads (`pthreads`) provide lower-level primitives to structure parallel lifecycles, protect critical sections, and align multi-threaded execution phases.

## The mechanism

The POSIX threads API exposes four explicit primitives for workflow management and synchronization:

1. **Thread Lifecycle (`pthread_create` and `pthread_join`)**: `pthread_create` requests the operating system kernel to allocate a new thread execution stack and schedule the target function. `pthread_join` blocks the calling thread until the target thread finishes execution, reclaiming stack resources and forming a memory visibility barrier.
2. **Mutual Exclusion (`pthread_mutex_t`)**: A mutex ensures that at most one thread executes inside a critical section at any given time. Locking a mutex acquires exclusive access; unlocking releases it and flushes pending writes to shared memory.
3. **Phase Synchronization (`pthread_barrier_t`)**: A barrier forces $N$ participating threads to halt at a specified synchronization point until all $N$ threads have called `pthread_barrier_wait`.



When threads call `pthread_mutex_lock`, only one thread acquires the lock; all other contenders enter a sleeping or spinning wait state until `pthread_mutex_unlock` is executed. At a `pthread_barrier_wait`, threads sleep until the full count of declared participants arrives.

## A worked example

The following C program demonstrates thread creation, mutually exclusive accumulation into a global counter, phase synchronization using a barrier, and final joining.

```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define NUM_THREADS 4
#define ITERATIONS 100000

typedef struct {
    int thread_id;
    int* shared_counter;
    pthread_mutex_t* mutex;
    pthread_barrier_t* barrier;
} thread_arg_t;

void* worker(void* arg) {
    thread_arg_t* t_data = (thread_arg_t*)arg;

    // Phase 1: Mutually exclusive counter update
    for (int i = 0; i < ITERATIONS; i++) {
        pthread_mutex_lock(t_data->mutex);
        (*(t_data->shared_counter))++;
        pthread_mutex_unlock(t_data->mutex);
    }

    printf("Thread %d finished Phase 1 updates.\n", t_data->thread_id);

    // Phase 2: Barrier synchronization
    int rc = pthread_barrier_wait(t_data->barrier);
    if (rc == PTHREAD_BARRIER_SERIAL_THREAD) {
        printf("Thread %d (designated leader) resetting phase state.\n", t_data->thread_id);
    }

    // Phase 3: Post-barrier work
    printf("Thread %d starting Phase 3.\n", t_data->thread_id);

    return NULL;
}

int main(void) {
    pthread_t threads[NUM_THREADS];
    thread_arg_t args[NUM_THREADS];
    int counter = 0;

    pthread_mutex_t mutex;
    pthread_barrier_t barrier;

    pthread_mutex_init(&mutex, NULL);
    pthread_barrier_init(&barrier, NULL, NUM_THREADS);

    for (int i = 0; i < NUM_THREADS; i++) {
        args[i].thread_id = i;
        args[i].shared_counter = &counter;
        args[i].mutex = &mutex;
        args[i].barrier = &barrier;
        pthread_create(&threads[i], NULL, worker, &args[i]);
    }

    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    printf("Final shared counter value: %d (Expected: %d)\n", counter, NUM_THREADS * ITERATIONS);

    pthread_mutex_destroy(&mutex);
    pthread_barrier_destroy(&barrier);

    return 0;
}
```

### Walkthrough

- **Lines 35–36**: `pthread_mutex_init` prepares the lock structure. `pthread_barrier_init` configures the barrier to hold calling threads until exactly `NUM_THREADS` (4) reach `pthread_barrier_wait`.
- **Line 44**: `pthread_create` spawns each worker thread, giving it a unique ID and pointers to shared primitives.
- **Lines 19–21**: Inside `worker`, `pthread_mutex_lock` forces serial execution of the increment. `pthread_mutex_unlock` permits the next waiting thread to enter.
- **Line 27**: `pthread_barrier_wait` blocks until all 4 threads finish their iteration loops.
- **Lines 28–30**: Exactly one thread receives `PTHREAD_BARRIER_SERIAL_THREAD` from `pthread_barrier_wait`, allowing single-threaded housekeeping before resuming execution.
- **Lines 47–49**: `pthread_join` blocks `main` until each child thread terminates, ensuring all memory writes are committed and readable by `main`.

## What the compiler and runtime can and cannot do

- **Compiler instruction reordering**: Compilers treat `pthread_mutex_lock`, `pthread_mutex_unlock`, and `pthread_barrier_wait` as opaque system calls acting as memory barriers. The compiler cannot reorder reads and writes across these function calls.
- **Granularity trade-offs**: A mutex around a tiny operation (like a single addition) incurs significant locking overhead relative to useful work. Runtimes cannot automatically convert fine-grained mutexes into thread-local accumulations; software engineers or specialized compiler passes must restructure the code.
- **Deadlock detection**: The POSIX runtime does not automatically break deadlocks (e.g., acquiring two mutexes in opposite order across threads). Deadlock avoidance remains the developer's structural responsibility.

## Common misconceptions

### `pthread_create` runs immediately and synchronously
`pthread_create` submits a scheduling request to the OS kernel. The caller thread continues executing concurrently; there is no guarantee whether the parent or newly created child runs first.

### Mutexes guarantee fair FIFO ordering
Standard POSIX mutexes (`PTHREAD_MUTEX_DEFAULT`) do not guarantee strict first-come, first-served queueing. A recently unlocked thread on a warm core may re-acquire the lock before a sleeping thread wakes up.

### `pthread_join` is optional
Failing to call `pthread_join` (or `pthread_detach`) leaks kernel thread descriptors and stack memory upon thread termination.

## Where this leaves you

Inspect multi-threaded code paths to verify that shared mutable state is protected by a mutex or replaced with thread-local storage, and ensure every non-detached thread created with `pthread_create` is paired with `pthread_join`.

## What To Read Next

- [/docs/parallel-computing/decomposition-tasks-and-mapping](/docs/parallel-computing/decomposition-tasks-and-mapping) — Decomposition, Tasks, and Mapping: how to divide problems into independent units before introducing mutexes and barriers.
- [/docs/parallel-computing/communication-cost-and-granularity](/docs/parallel-computing/communication-cost-and-granularity) — Communication Cost and Granularity: balancing synchronization frequency against computation workload.

![Diagram](/img/parallel/pthreads-mutex-and-barrier.svg)

## References

- Pacheco, Peter. *An Introduction to Parallel Programming*. Morgan Kaufmann.
- Grama, Ananth, Anshul Gupta, George Karypis, and Vipin Kumar. *Introduction to Parallel Computing*. Addison-Wesley.
- *IEEE Std 1003.1-2017 (POSIX.1-2017) System Interfaces: pthreads*. Open Group.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/pthreads-mutex-and-barrier/)
