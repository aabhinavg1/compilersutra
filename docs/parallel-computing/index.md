---
title: Parallel Computing
description: Fundamentals first, then OpenMP, MPI, CUDA, ROCm, OpenCL, and Vulkan. Written pages are linked. The rest is the order they will be added.
slug: /parallel-computing/
displayed_sidebar: parallelComputingSidebar
keywords:
  - parallel computing
  - OpenMP
  - MPI
  - CUDA
  - ROCm
  - OpenCL
  - Vulkan
  - GPU programming
---

import AdBanner from '@site/src/components/AdBanner';

# Parallel Computing

Read the fundamentals first. They are the pages that exist. Everything under "Still to write" is the order the rest will be added: threads and OpenMP on one machine, MPI when the job spans a cluster, then CUDA, ROCm, OpenCL, and Vulkan.

Extra cores showed up because raising the clock got expensive. A GPU is a later machine for the same kind of problem, with a different programming model. The CPU pages come first so the GPU pages have something to compare against.

<AdBanner />

## Already written

| Topic | Page |
| --- | --- |
| What a parallel program is | [What is parallel computing?](/docs/parallel-computing/fundamentals/what-is-parallel-computing) |
| Process, thread, core | [Program, process, thread, core](/docs/parallel-computing/fundamentals/program-process-thread-core) |
| Hardware picture | [Parallel hardware](/docs/parallel-computing/fundamentals/parallel-hardware-overview) |
| Amdahl and Gustafson | [Amdahl's and Gustafson's laws](/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law) |
| How to measure a run | [Measuring parallel performance](/docs/parallel-computing/fundamentals/measuring-parallel-performance) |
| Memory models | [Memory models](/docs/parallel-computing/fundamentals/memory-models) |
| GPU, in one page | [What is a GPU?](/docs/gpu/what_is_gpu) |
| NVIDIA | [CUDA](/docs/gpu/platforms/cuda) |
| AMD | [ROCm](/docs/gpu/platforms/rocm) |
| Portable kernel language | [OpenCL](/docs/gpu/opencl/basic/what_is_opencl) |
| Cross-vendor compute | [Vulkan](/docs/gpu/platforms/vulkan) |
| Occupancy, memory, divergence | [GPU optimizations](/docs/gpu/optimizations) |
| Register pressure | [Why GPU kernels fail](/docs/compilers/techblog/register-pressure-on-gpu/) |
| C++ threads | [Threads](/docs/c++/advanced/threads) |
| OpenCL on AMD | [Getting started on AMDGPU](/docs/gpu/opencl/basic/getting_started_with_opencl_on_amdgpu) |

The CUDA, ROCm, OpenCL, and Vulkan links above are existing tracks. The matching lines below are still separate lessons.

## Still to write

A line here turns into a link when that lesson is published.

### Why

- Why a parallel program is a different program
- Concurrent, parallel, and distributed

### The machine you already have

- One core, made busier
- SIMD, MIMD, and the interconnect
- Shared memory versus distributed memory
- Cache coherence and false sharing
- Decomposition, tasks, and mapping
- Communication cost and granularity
- Speedup, efficiency, and scalability

### OpenMP and threads

OpenMP in this section is the CPU version. Offload to a device is listed with the GPU lessons.

- Pthreads: create, join, mutex, and barrier
- OpenMP regions, reductions, and loop-carried dependence
- OpenMP schedules
- OpenMP tasks and sections
- C++ atomics and memory order
- C++ parallel algorithms
- Thread pools, work stealing, and oneTBB

### A cluster

OpenMP ends at the node. MPI is the library the nodes use to talk.

- What a cluster is
- MPI send, receive, and matching
- Broadcast and reduction as a tree
- MPI collectives
- Overlap communication with computation
- Hybrid MPI and OpenMP

### Before a GPU could run your loop

### Daily lessons

| # | Topic | 📝 MCQ | 📄 PDF | 📊 PPT | 📺 YouTube |
|---|-------|--------|--------|--------|-----------|
| 1 | [Why a parallel program is a different program](why-parallel-programs.md) | Coming Soon | Coming Soon | Coming Soon | Coming Soon |

### 02 — CPU Shared-Memory Parallelism

### CUDA

- From the graphics pipeline to a processor you can program
- CUDA: host, device, and the copy
- CUDA grids, blocks, and threads
- CUDA memory spaces
- Coalescing and latency hiding
- Floating point on the device
- Decomposition for a GPU

### ROCm

- The ROCm stack
- HIP next to CUDA

### OpenCL, Vulkan, SYCL

- OpenCL next to CUDA
- Vulkan compute and SPIR-V
- SYCL
- OpenMP target offload

### After you have a number

- A profile, not a guess

### Same example, two machines

- Matrix-vector, by rows and by columns
- Odd-even transposition sort
- Parallel search, and speedup that lies
- n-body: all pairs and the reduced force
- FFT communication: exchange versus transpose

## Also on the site

- [GPU programming overview](/docs/gpu/gpu_programming/gpu_programming_toc)
- [GPU platforms](/docs/gpu/platforms/)

Questions and corrections: [Discord](https://discord.gg/d7jpHrhTap) · [YouTube](https://www.youtube.com/@compilersutra)
