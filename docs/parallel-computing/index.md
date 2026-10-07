---
title: Parallel Computing
description: A complete parallel computing curriculum — fundamentals, OpenMP, C++ Parallel STL, TBB, MPI, GPU programming with CUDA/OpenCL/Vulkan/SYCL, and the current hardware and software landscape.
slug: /parallel-computing/
displayed_sidebar: parallelComputingSidebar
keywords:
  - parallel computing
  - parallel programming
  - multi-threading
  - OpenMP
  - MPI
  - CUDA
  - OpenCL
  - Vulkan compute
  - SYCL
  - process thread core
  - Amdahl's law
  - GPU programming
  - high performance computing
---

import Link from '@docusaurus/Link';
import AdBanner from '@site/src/components/AdBanner';

# Parallel Computing

Parallel computing is how modern software scales. From the CPU cores in your laptop to the GPU clusters training large models, understanding parallelism is essential for systems programmers, compiler engineers, and performance-minded developers.

This curriculum takes you from the absolute fundamentals — what a process, thread, and core actually are — through shared-memory and distributed-memory CPU programming, into GPU programming with CUDA, OpenCL, Vulkan, and SYCL, and finally to the current state of the parallel hardware and software landscape.

## Best Entry Points

<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem'}}>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>Start Here</h3>
    <p>No background in parallel computing? Begin with the fundamentals article.</p>
    <Link to="/docs/parallel-computing/fundamentals/what-is-parallel-computing">What is Parallel Computing?</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>Fundamentals</h3>
    <p>Six articles: threads, memory models, speedup laws, hardware, and performance measurement.</p>
    <Link to="/docs/parallel-computing/fundamentals/program-process-thread-core">Program, Process, Thread, Core</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>Speedup Laws</h3>
    <p>The two laws that bound every parallel program — before you write one line of code.</p>
    <Link to="/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law">Amdahl's and Gustafson's Laws</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>Related: GPU</h3>
    <p>Existing GPU and OpenCL content that this section builds on.</p>
    <Link to="/docs/gpu/gpu_programming/gpu_programming_toc">GPU Programming Overview</Link>
  </div>
</div>

<AdBanner />

## What This Curriculum Covers

- **CPU shared-memory parallelism** — OpenMP, C++ Parallel STL, thread pools and TBB
- **CPU distributed-memory parallelism** — MPI point-to-point, collectives, hybrid MPI+OpenMP
- **GPU programming** — CUDA, OpenCL, Vulkan compute, SYCL, memory optimization, multi-GPU
- **Current state** — hardware landscape, software trends, and parallel computing in the AI era

## Curriculum Roadmap

### 01 — Fundamentals

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | [What is Parallel Computing?](fundamentals/what-is-parallel-computing.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 2 | [Program, Process, Thread, Core](fundamentals/program-process-thread-core.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 3 | [Memory Models](fundamentals/memory-models.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 4 | [Amdahl's Law and Gustafson's Law](fundamentals/amdahls-and-gustafsons-law.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 5 | [Parallel Hardware Overview](fundamentals/parallel-hardware-overview.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 6 | [Measuring Parallel Performance](fundamentals/measuring-parallel-performance.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

### Daily lessons

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | [Why a parallel program is a different program](why-parallel-programs.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

### 02 — CPU Shared-Memory Parallelism

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | OpenMP — parallel for, sections, tasks, reduction, synchronization | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 2 | C++ Parallel STL — `std::execution::par`, `std::for_each`, `std::reduce` | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 3 | Thread Pools and Work Stealing | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 4 | TBB / oneTBB — Task-Based Parallelism | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

### 03 — CPU Distributed-Memory Parallelism

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | MPI — Point-to-Point Communication | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 2 | MPI — Collective Operations (broadcast, scatter, gather, reduce) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 3 | Hybrid MPI+OpenMP Programming | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

### 04 — GPU Programming

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | [GPU Architecture Overview — SIMT, Warps, Memory Hierarchy](../gpu/what_is_gpu.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 2 | CUDA — Kernels, Grid/Block/Thread, Memory Types | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 3 | [OpenCL — Platform Model, Kernels, Memory](../gpu/opencl/basic/what_is_opencl.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 4 | Vulkan Compute — SPIR-V, Compute Pipelines | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 5 | SYCL — C++ Standard Parallelism for Accelerators | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 6 | [GPU Optimizations — Occupancy, Coalescing, Shared Memory](../gpu/optimizations.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

### 05 — Advanced Topics

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | Atomics and Memory Ordering in C++ | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 2 | [GPU Register Pressure](../compilers/techblog/register-pressure-on-gpu/) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 3 | Performance Profiling — nsys, rocprof, roofline analysis | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

### 06 — Current State

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | Hardware Landscape — NVIDIA, AMD, Intel, Apple Silicon | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 2 | Software Trends — CUDA vs SYCL vs Vulkan vs OpenMP Target Offload | Coming Soon | Coming Soon | Coming Soon | Coming Soon |
| 3 | Parallel Computing in the AI Era | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

## Prerequisites

- Basic C++ proficiency (pointers, functions, memory)
- Familiarity with the command line
- For GPU sections: basic understanding of how a computer works

## Related Sections on This Site

- [C++ Threads and Concurrency](../c++/advanced/threads.md) — `std::thread`, mutexes, async/futures
- [GPU Programming Overview](../gpu/gpu_programming/gpu_programming_toc.md) — Full GPU learning path
- [OpenCL Guide](../gpu/opencl/basic/getting_started_with_opencl_on_amdgpu.md) — Getting started with OpenCL
- [HPC MCQs](../mcq/questions/domain/data-science-hpc/parallel-models.mdx) — Test your parallel computing knowledge
