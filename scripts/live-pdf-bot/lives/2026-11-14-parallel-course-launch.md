% Parallel Programming Course Launch
% CompilerSutra Weekly Live
% Saturday, 14 November 2026 · 19:00 IST

# Parallel Programming Course Launch

**Curriculum walkthrough: one problem, several machines**

- **Series:** CompilerSutra Weekly Live
- **When:** Saturday, 14 November 2026 · 19:00 IST
- **Duration:** ~45 minutes
- **Host:** CompilerSutra
- **Audience:** Students and engineers learning parallel / HPC programming

## Why this live

This session launches the free **Parallel Computing** course on CompilerSutra and walks the full curriculum:
one problem, carried across CPU threads, OpenMP, SIMD, GPU, and MPI — with correctness and measurement kept in frame.

## Live agenda

1. Why this course exists (one problem across many machines)
2. How the curriculum is structured (8 chapters, 52 lessons)
3. Chapter tour: Thinking → CPU → OpenMP → Algorithms → SIMD → GPU → MPI → Measuring
4. How to study: read one page, do the exercise, take the quiz
5. Q&A and next Saturday preview

## Talking points

- The course keeps one running example (a list of integers) while the execution model changes.
- Correctness comes first: races, shared memory, and measurement are not optional side topics.
- OpenMP, SIMD, GPU, and MPI are different machines for the same idea — not separate unrelated courses.
- Every chapter has lessons + a quiz; projects lock the idea in.

## Course at a glance

**Parallel Computing** — One problem. Several machines.

Take the same computation from one CPU core to threads, OpenMP, SIMD, a GPU, and a cluster. Keep the result correct. Understand the execution model. Measure what actually changed.

- **Lessons:** 52
- **Chapters:** 8
- **Price:** Free

## Curriculum roadmap

### Start here

- **S1 How to use this course** — Read one page, then do the short exercise on that page.
- **S2 The list of numbers we keep reusing** — One list of integers is the example for the whole course.

### Chapters

| Ch | Topic | Guiding question | Covers |
| -: | :--- | :--- | :--- |
| 1 | Parallel Thinking | What does it mean to run work at the same time? | Sequential execution, concurrency, parallelism, races. |
| 2 | CPU | How does a CPU run multiple pieces of work? | Threads, cores, mutexes, atomics, barriers. |
| 3 | OpenMP | How do we parallelize loops without manually managing every thread? | Parallel regions, worksharing, reductions, scheduling. |
| 4 | Algorithms | Which algorithms are naturally parallel? | Map, reduce, histogram, stencil, scan, sort. |
| 5 | SIMD | What if one instruction processes several values? | Vector lanes, vectorization, alignment, SIMD + threads. |
| 6 | GPU | What changes when thousands of workers execute on a device? | GPU execution, memory, kernels, CUDA, ROCm, OpenCL, Vulkan. |
| 7 | Distributed | What happens when workers do not share memory? | Processes, ranks, communication, collectives, MPI. |
| 8 | Measuring | Did we actually make the program faster? | Timing, speedup, efficiency, Amdahl's law, bandwidth, cache, profiling. |

### Lesson map

**Chapter 1 · Parallel Thinking**

A program is a list of steps, Why one core stops being enough, Sequential and parallel, Concurrent, parallel, and distributed, Your first parallel problem

**Chapter 2 · CPU**

CPU cores, Processes and threads, Shared memory, Race conditions, Mutex, Atomics, Waiting, and deadlock

**Chapter 3 · OpenMP**

parallel and for, reduction, sections and synchronization, OpenMP project

**Chapter 4 · Algorithms**

Map, Reduce, Histogram, Matrix multiplication, Stencil, Scan, Parallel sorting

**Chapter 5 · SIMD**

What SIMD is, Vectorization, SIMD and threads

**Chapter 6 · GPU**

Why GPUs, GPU architecture, Threads and blocks, SIMT, GPU memory, CUDA, HIP and ROCm, OpenCL, Vulkan, GPU project

**Chapter 7 · Distributed**

Why a cluster, MPI, Send and receive, Collective operations, Distributed project

**Chapter 8 · Measuring**

Speedup and Amdahl, Cache and false sharing, Memory bandwidth, Load balancing, Profiling

## Links

- [Course hub](https://www.compilersutra.com/docs/parallel-computing/)
- [Start here](https://www.compilersutra.com/docs/parallel-computing/start-here/how-to-use-this-course/)
- [Chapter 1](https://www.compilersutra.com/docs/parallel-computing/chapter-1/)

## After the live

1. Open the course: https://www.compilersutra.com/docs/parallel-computing/
2. Read **Start here → How to use this course**
3. Finish Chapter 1 before next Saturday

*Start the free course after the live*

Generated for CompilerSutra Weekly Live · https://www.compilersutra.com
