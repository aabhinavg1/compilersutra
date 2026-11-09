---
title: Parallel Computing
description: One problem. Several machines. Follow the same computation from one CPU core to threads, OpenMP, SIMD, a GPU, and MPI.
slug: /parallel-computing/
displayed_sidebar: parallelComputingSidebar
hide_title: true
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

import Link from '@docusaurus/Link';
import AdBanner from '@site/src/components/AdBanner';
import styles from '../tracks/track.module.css';
import ParallelCurriculum from './ParallelCurriculum';

<div className={`${styles.page} ${styles.pageWide}`}>
  <header className={styles.hero}>
    <p className={styles.eyebrow}>Learning track · Parallel programming</p>
    <h1 className={styles.title}>Parallel Computing</h1>
    <p className={styles.lead}>One problem. Several machines.</p>
    <p className={styles.subtitle}>
      Take the same computation from one CPU core to threads, OpenMP, SIMD, a GPU, and a cluster.
      Keep the result correct. Understand the execution model. Measure what actually changed.
    </p>

    <div className={styles.heroMeta}>
      <span>Free</span>
      <span>52 lessons</span>
      <span>8 chapters</span>
      <span>Projects</span>
    </div>

    <div className={styles.heroActions}>
      <Link className={styles.primaryCta} to="/docs/parallel-computing/start-here/how-to-use-this-course/">
        Start the course
        <span aria-hidden="true">→</span>
      </Link>
      <Link className={styles.secondaryCta} to="#roadmap">
        Course roadmap
      </Link>
    </div>
  </header>

  <section className={styles.section} id="course-idea">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>Course idea</span>
      <h2 className={styles.sectionTitle}>One problem. Several machines.</h2>
      <p className={styles.sectionDesc}>
        Start with a simple list of integers and compute its total. The problem stays the same
        while the machine and execution model change.
      </p>
    </div>
    <ol className={styles.progression} aria-label="Execution models in order">
      <li>Serial</li>
      <li>Threads</li>
      <li>OpenMP</li>
      <li>SIMD</li>
      <li>GPU</li>
      <li>MPI</li>
    </ol>
  </section>

  <section className={styles.section} id="problem">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>What you&apos;ll build</span>
      <h2 className={styles.sectionTitle}>The same list of numbers</h2>
      <p className={styles.sectionDesc}>
        Begin with a serial sum. Later you express the same computation with CPU threads,
        OpenMP, SIMD, GPU kernels, and MPI — without changing the answer you must get.
      </p>
    </div>
    <pre className={styles.codeBlock}><code>{`int total = 0;

for (int x : numbers)
    total += x;`}</code></pre>
    <p className={styles.sectionDesc}>
      <strong>The problem stays constant. The execution model changes.</strong>
    </p>
  </section>

  <section className={styles.section} id="why">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>Audience</span>
      <h2 className={styles.sectionTitle}>Why this matters</h2>
      <p className={styles.sectionDesc}>
        Compilers and runtimes eventually schedule real work onto real hardware. Ideas like
        loop parallelization, vectorization, GPU offloading, task scheduling, reductions, and
        memory movement make more sense when you have already seen what the hardware executes.
      </p>
      <p className={styles.sectionDesc}>
        This track is for programmers, compiler and runtime engineers, performance engineers,
        and students learning systems programming — not a generic coding tutorial.
      </p>
    </div>
  </section>

  <section className={styles.section} id="prerequisites">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>Before you start</span>
      <h2 className={styles.sectionTitle}>Prerequisites</h2>
    </div>
    <div className={styles.prereqRow}>
      <article className={styles.infoCard}>
        <h2>You should know</h2>
        <ul>
          <li>Basic C/C++</li>
          <li>Loops and functions</li>
          <li>Compiling and running a program</li>
          <li>Basic command-line usage</li>
        </ul>
      </article>
      <article className={styles.infoCard}>
        <h2>You do not need</h2>
        <ul>
          <li>CUDA experience</li>
          <li>OpenMP experience</li>
          <li>GPU experience</li>
          <li>MPI experience</li>
          <li>Compiler-internals knowledge</li>
        </ul>
      </article>
    </div>
  </section>

  <section className={styles.section} id="by-the-end">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>Outcomes</span>
      <h2 className={styles.sectionTitle}>By the end</h2>
    </div>
    <ul className={styles.capabilityList}>
      <li>
        <strong>Split work</strong>
        <span>Divide shared-memory work without introducing races.</span>
      </li>
      <li>
        <strong>Choose a model</strong>
        <span>Shared memory, SIMD, device offload, or message passing.</span>
      </li>
      <li>
        <strong>Write parallel programs</strong>
        <span>C++, threads, OpenMP, SIMD, GPU APIs, and MPI.</span>
      </li>
      <li>
        <strong>Check correctness</strong>
        <span>Compare parallel output with a serial reference.</span>
      </li>
      <li>
        <strong>Measure performance</strong>
        <span>Calculate speedup and efficiency.</span>
      </li>
      <li>
        <strong>Explain results</strong>
        <span>Understand why a program became faster, or why it did not.</span>
      </li>
    </ul>
  </section>

  <ParallelCurriculum />

  <section className={styles.section} id="gpu-apis">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>Inside Chapter 6</span>
      <h2 className={styles.sectionTitle}>Same GPU problem, several APIs</h2>
      <p className={styles.sectionDesc}>
        CUDA, ROCm/HIP, OpenCL, and Vulkan are implementations of the same host–device pattern.
        Learn the execution model first; treat the API as a way to express it.
      </p>
    </div>
    <div className={styles.gpuFamily}>
      <p className={styles.gpuFamilyRoot}>Same GPU problem</p>
      <div className={styles.gpuFamilyGrid}>
        <Link className={styles.gpuFamilyItem} to="/docs/gpu/platforms/cuda/">
          <strong>CUDA</strong>
          <span>NVIDIA GPU programming model</span>
        </Link>
        <Link className={styles.gpuFamilyItem} to="/docs/gpu/platforms/rocm/">
          <strong>ROCm / HIP</strong>
          <span>AMD-oriented GPU stack</span>
        </Link>
        <Link className={styles.gpuFamilyItem} to="/docs/gpu/opencl/basic/what_is_opencl/">
          <strong>OpenCL</strong>
          <span>Portable compute model</span>
        </Link>
        <Link className={styles.gpuFamilyItem} to="/docs/gpu/platforms/vulkan/">
          <strong>Vulkan</strong>
          <span>Explicit cross-vendor API</span>
        </Link>
      </div>
    </div>
  </section>

- [One core, made busier](one-core-made-busier.md)
- SIMD, MIMD, and the interconnect
- [Shared memory versus distributed memory](shared-versus-distributed-memory.md)
- Cache coherence and false sharing
- [Decomposition, tasks, and mapping](decomposition-tasks-and-mapping.md)
- [Cache coherence and false sharing](cache-coherence-and-false-sharing.md)
- Decomposition, tasks, and mapping
- Communication cost and granularity
- [Speedup, efficiency, and scalability](speedup-efficiency-scalability.md)
- [Communication cost and granularity](communication-cost-and-granularity.md)
- Speedup, efficiency, and scalability

  <section className={styles.section} id="practice">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>How to practice</span>
      <h2 className={styles.sectionTitle}>Practice</h2>
      <p className={styles.sectionDesc}>
        Each lesson should leave you with something small to run, measure, or explain.
      </p>
    </div>

    <article className={styles.practiceBlock}>
      <h3 className={styles.subTitle}>Find the race</h3>
      <pre className={styles.codeBlock}><code>{`int total = 0;

- [Pthreads: create, join, mutex, and barrier](pthreads-mutex-and-barrier.md)
- OpenMP regions, reductions, and loop-carried dependence
- [OpenMP schedules](openmp-schedules.md)
- OpenMP tasks and sections
- C++ atomics and memory order
- C++ parallel algorithms
- Thread pools, work stealing, and oneTBB

    <article className={styles.practiceBlock}>
      <h3 className={styles.subTitle}>Fix it</h3>
      <p className={styles.sectionDesc}>Use an appropriate reduction mechanism.</p>
    </article>

    <article className={styles.practiceBlock}>
      <h3 className={styles.subTitle}>Measure it</h3>
      <p className={styles.sectionDesc}>
        Compare 1, 2, 4, 8, and 16 threads. Record time, speedup, and efficiency.
      </p>
    </article>

- [What a cluster is](what-a-cluster-is.md)
- [MPI send, receive, and matching](mpi-send-receive-matching.md)
- Broadcast and reduction as a tree
- [MPI collectives](mpi-collectives.md)
- [Overlap communication with computation](overlap-communication-and-computation.md)
- Hybrid MPI and OpenMP

  <section className={styles.section} id="daily-lessons">
    <div className={styles.sectionHead}>
      <span className={styles.sectionStep}>Standalone</span>
      <h2 className={styles.sectionTitle}>Daily lessons</h2>
      <p className={styles.sectionDesc}>
        Short, focused lessons for one mechanism at a time. The <strong>course</strong> is the
        structured path above. <strong>Daily lessons</strong> are standalone deep-dives you can
        open without following chapter order.
      </p>
    </div>
    <div className={styles.stepList}>
      <Link className={styles.stepRow} to="/docs/parallel-computing/why-parallel-programs/">
        <span className={styles.stepNum}>01</span>
        <span className={styles.stepCopy}>
          <strong>Why a parallel program is a different program</strong>
        </span>
        <span className={styles.stepGo} aria-hidden="true">→</span>
      </Link>
      <Link className={styles.stepRow} to="/docs/parallel-computing/concurrent-parallel-distributed/">
        <span className={styles.stepNum}>02</span>
        <span className={styles.stepCopy}>
          <strong>Concurrent, Parallel, and Distributed</strong>
        </span>
        <span className={styles.stepGo} aria-hidden="true">→</span>
      </Link>
      <Link className={styles.stepRow} to="/docs/parallel-computing/one-core-made-busier/">
        <span className={styles.stepNum}>03</span>
        <span className={styles.stepCopy}>
          <strong>One core, made busier</strong>
        </span>
        <span className={styles.stepGo} aria-hidden="true">→</span>
      </Link>
      <Link className={styles.stepRow} to="/docs/parallel-computing/simd-mimd-and-the-interconnect/">
        <span className={styles.stepNum}>04</span>
        <span className={styles.stepCopy}>
          <strong>SIMD, MIMD, and the Interconnect</strong>
        </span>
        <span className={styles.stepGo} aria-hidden="true">→</span>
      </Link>
      <Link className={styles.stepRow} to="/docs/parallel-computing/shared-versus-distributed-memory/">
        <span className={styles.stepNum}>05</span>
        <span className={styles.stepCopy}>
          <strong>Shared memory versus distributed memory</strong>
        </span>
        <span className={styles.stepGo} aria-hidden="true">→</span>
      </Link>
      <Link className={styles.stepRow} to="/docs/parallel-computing/cache-coherence-and-false-sharing/">
        <span className={styles.stepNum}>06</span>
        <span className={styles.stepCopy}>
          <strong>Cache Coherence and False Sharing</strong>
        </span>
        <span className={styles.stepGo} aria-hidden="true">→</span>
      </Link>
    </div>
  </section>

  <section className={styles.nextCard} id="next">
    <p className={styles.nextLabel}>Where do you go next?</p>
    <h2 className={styles.nextTitle}>Keep going on related tracks</h2>
    <div className={styles.nextGrid}>
      <Link className={styles.nextItem} to="/docs/gpu/gpu_programming/gpu_programming_toc/">
        <strong>GPU Programming</strong>
        <span>Go deeper into GPU APIs and kernels.</span>
      </Link>
      <Link className={styles.nextItem} to="/docs/tracks/gpu-compilers/">
        <strong>GPU Compilers</strong>
        <span>Understand how compilers transform GPU programs.</span>
      </Link>
      <Link className={styles.nextItem} to="/docs/tracks/ml-compilers/">
        <strong>ML Compilers</strong>
        <span>Follow the same hardware through the ML compiler stack.</span>
      </Link>
      <Link className={styles.nextItem} to="/docs/gpu/optimizations/">
        <strong>Performance Engineering</strong>
        <span>Measurement, profiling, cache behavior, and bottlenecks.</span>
      </Link>
    </div>
  </section>

  <div>
    <AdBanner />
  </div>
</div>
