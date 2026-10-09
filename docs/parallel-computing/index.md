---
title: Parallel Computing
description: Fundamentals first, then OpenMP, MPI, CUDA, ROCm, OpenCL, and Vulkan. Written pages are linked. The rest is the order they will be added.
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
    <p className={styles.eyebrow}>Learning track · Parallel computing</p>
    <h1 className={styles.title}>Parallel Computing</h1>
    <p className={styles.subtitle}>
      Read the fundamentals first. They are the pages that exist. Everything under "Still to write" is the order the rest will be added: threads and OpenMP on one machine, MPI when the job spans a cluster, then CUDA, ROCm, OpenCL, and Vulkan.
    </p>
    <p className={styles.subtitle}>
      Extra cores showed up because raising the clock got expensive. A GPU is a later machine for the same kind of problem, with a different programming model. The CPU pages come first so the GPU pages have something to compare against.
    </p>

    <div className={styles.heroMeta}>
      <span>Free</span>
      <span>8 chapters</span>
      <span>Start here through projects</span>
    </div>

    <div className={styles.heroActions}>
      <Link className={styles.primaryCta} to="/docs/parallel-computing/start-here/">
        Start here
        <span aria-hidden="true">→</span>
      </Link>
      <Link className={styles.secondaryCta} to="#syllabus">
        Syllabus
      </Link>
    </div>
  </header>

  <ParallelCurriculum />

  <div>
    <AdBanner />
  </div>

  <p className={styles.subtitle}>
    Questions and corrections: <Link to="https://discord.gg/d7jpHrhTap">Discord</Link>
    {' · '}
    <Link to="https://www.youtube.com/@compilersutra">YouTube</Link>
  </p>
</div>
