---
title: "C++ Parallel Algorithms: Execution Policies and Race Conditions"
description: "Understand the C++ standard execution policies std::execution::par and par_unseq, how algorithms schedule work, and why callables must remain race-free."
keywords:
  - C++ parallel algorithms
  - std::execution::par
  - std::execution::par_unseq
  - std::execution::seq
  - std::for_each
  - std::reduce
  - C++ standard library
  - parallel computing
  - shared memory race
  - vectorization
  - loop-carried dependence
  - callables
displayed_sidebar: parallelComputingSidebar
slug: /parallel-computing/cpp-parallel-algorithms
---

Standard execution policies in C++ permit the runtime to partition data and execute algorithm steps concurrently or out of order. They do not rewrite unsafe lambda functions or insert synchronizations for shared variables.

:::tip Read these first
- [/docs/parallel-computing/openmp-reduction-and-dependence](/docs/parallel-computing/openmp-reduction-and-dependence) — OpenMP regions, reductions, and loop-carried dependence
- [/docs/parallel-computing/cpp-atomics-and-memory-order](/docs/parallel-computing/cpp-atomics-and-memory-order) — C++ atomics and memory order
:::

:::important What you should leave with
Passing `std::execution::par` or `std::execution::par_unseq` grants permissions to the standard library implementation; it does not protect state accessed inside your lambda. If a element access or state mutation races, the program has undefined behavior.
:::

## Why you should care

Standard library algorithms like `std::for_each` and `std::reduce` accept execution policies that signal to the runtime that work can be spread across threads or vectorized. However, passing an execution policy to a function containing state mutations creates data races unless explicit thread safety is designed into the callable.

```cpp
#include <vector>
#include <algorithm>
#include <execution>
#include <iostream>

int main() {
    std::vector<int> data(1000, 1);
    int unsafe_counter = 0;

    // INCORRECT: Data race on unsafe_counter.
    // The policy permits parallel execution of the lambda, but the compiler 
    // and standard runtime will not synthesize a lock for unsafe_counter.
    std::for_each(std::execution::par, data.begin(), data.end(), [&](int val) {
        unsafe_counter += val; 
    });

    std::cout << "Unsafe Total: " << unsafe_counter << "\n";
    return 0;
}
```

Compiling and executing this code will yield unpredictable total values because multiple worker threads attempt un-synchronized read-modify-write operations on `unsafe_counter`. The compiler expects you to manage shared state explicit synchronization or choose an appropriate algorithm designed for state combination, such as `std::reduce`.

## The mechanism

C++ standard algorithms support four primary execution policies defined in `<execution>`:

1. `std::execution::seq`: Execution must be sequential within the calling thread.
2. `std::execution::unseq`: Execution may be vectorized (unsequenced relative to each other on a single thread). Callables must not allocate memory, acquire locks, or use non-reentrant operations.
3. `std::execution::par`: Execution may be distributed across multiple OS or runtime threads. Callables must avoid unsynchronized access to shared non-atomic data.
4. `std::execution::par_unseq`: Execution may be distributed across multiple threads **and** vectorized within each thread. Callables cannot acquire locks or rely on thread-local ordering.

```
std::execution::par (Multi-threaded execution)
 Thread 0:  [ Element 0..249   ] ----> Lambda
 Thread 1:  [ Element 250..499 ] ----> Lambda
 Thread 2:  [ Element 500..749 ] ----> Lambda
 Thread 3:  [ Element 750..999 ] ----> Lambda

std::execution::par_unseq (Multi-threaded + SIMD vectorization)
 Thread 0:  [ SIMD Lane 0..3 ] [ SIMD Lane 4..7 ] ...
 Thread 1:  [ SIMD Lane 0..3 ] [ SIMD Lane 4..7 ] ...
```

The algorithm delegates execution partitioning to an underlying concurrency runtime (such as Intel TBB, OpenMP, or OS-native thread pools). 

### Policy Requirements on Callables

| Policy | Inter-thread parallelism | SIMD / Vectorization | Lock acquisition permitted in callable? |
| :--- | :--- | :--- | :--- |
| `seq` | No | No | Yes |
| `unseq` | No | Yes | **No** (Risk of deadlock if interrupted) |
| `par` | Yes | No | Yes |
| `par_unseq` | Yes | Yes | **No** (Risk of deadlock if vector lane blocked) |

## A worked example

To safely transform and aggregate data using standard parallel algorithms, use elements independently or pass combination operations to standard reduction algorithms.

```cpp
#include <vector>
#include <numeric>
#include <algorithm>
#include <execution>
#include <iostream>
#include <cmath>

int main() {
    std::vector<double> input(1'000'000, 2.0);
    std::vector<double> output(input.size());

    // 1. Parallel element-wise transformation (No shared state modified)
    std::transform(std::execution::par_unseq, 
                   input.begin(), input.end(), 
                   output.begin(), 
                   [](double x) {
                       return std::sqrt(x) * 3.14159;
                   });

    // 2. Parallel reduction using std::reduce
    // std::reduce permits reordering and grouping of addition operations.
    double sum = std::reduce(std::execution::par,
                             output.begin(), output.end(),
                             0.0,
                             std::plus<double>());

    std::cout << "Computed total: " << sum << "\n";
    return 0;
}
```

### Walkthrough

- **Line 12**: `std::transform` is called with `std::execution::par_unseq`. This informs the standard library runtime that elements can be processed in parallel across threads *and* using vector processing within each thread lane.
- **Line 15–17**: The lambda acts purely on its input parameter `x` and returns a value. Because there is no access to shared out-of-scope variables, it contains no data races and satisfies the vectorization safety contract (no lock acquisitions).
- **Line 20**: `std::reduce` replaces `std::accumulate`. While `std::accumulate` requires strict left-to-right sequential evaluation, `std::reduce` assumes the operator (`std::plus`) is associative and commutative, allowing partial results to be combined out of order across worker threads.

## What the compiler and the runtime can and cannot do

- **The runtime CAN** split iterator ranges into chunk partitions, balance work across thread pools, and vectorize inner iteration steps under `par_unseq`.
- **The runtime CANNOT** analyze a lambda body to detect data races on captured references or global state.
- **The compiler CAN** optimize instructions inside the lambda using SIMD registers when `unseq` or `par_unseq` policies are supplied.
- **The compiler CANNOT** introduce synchronization primitives (locks or atomics) automatically to make user-defined side-effects safe.

## Common misconceptions

### `std::execution::par` acts like an automatic parallelizing compiler for any loop
Passing `std::execution::par` to an algorithm does not analyze loop-carried dependencies. If iteration $N$ depends on state computed in iteration $N-1$, using a parallel policy results in undefined behavior or corrupt data.

### `std::reduce` is just a parallel alias for `std::accumulate`
`std::accumulate` guarantees strict left-to-right evaluation order. `std::reduce` explicitly permits out-of-order and grouped evaluation. Because floating-point addition is non-associative, `std::reduce` can yield slightly different numerical outputs than `std::accumulate`.

### Atomic operations inside `par_unseq` lambdas are always safe
While atomic operations protect against data races across threads (`par`), acquiring locks or performing blocking atomic operations inside a `par_unseq` section can cause deadlocks if a thread execution lane is suspended while middle-way through a SIMD vector evaluation.

## Where this leaves you

- Select algorithms like `std::reduce` or `std::transform_reduce` when aggregating values, rather than capturing non-atomic accumulators in `std::for_each`.
- Reserve `std::execution::par_unseq` for callables that are mathematically pure, allocate no memory, and hold no locks.

## What To Read Next

- [/docs/parallel-computing/openmp-schedules](/docs/parallel-computing/openmp-schedules) — Compare standard C++ work partitioning with OpenMP loop scheduling strategies.
- [/docs/parallel-computing/cpp-atomics-and-memory-order](/docs/parallel-computing/cpp-atomics-and-memory-order) — Memory ordering constraints when shared mutation is necessary.

## References

- ISO/IEC 14882:2020 (C++20 Standard Language Specifications, Execution Policies & Algorithms).
- Bjarne Stroustrup, *The C++ Programming Language*, 4th Edition, Addison-Wesley.

## Quiz

- [Quiz](/docs/mcq/questions/domain/parallel/daily/cpp-parallel-algorithms/)
