---
id: mcq-home
title: "CompilerSutra MCQ Hub"
slug: /mcq
description: "CompilerSutra MCQ hub for C++, interview prep, compiler design, systems programming, GPU programming, embedded systems, and HPC."
keywords:
  - mcq
  - programming mcq
  - compiler mcq
  - c++ mcq
  - system programming mcq
  - gpu programming mcq
  - opencl mcq
  - cpp interview questions
  - compiler design quiz
  - systems interview questions
  - embedded systems mcq
  - hpc mcq
tags:
  - MCQs
  - Compiler Design
  - Systems Programming
  - GPU Programming
  - Embedded Systems
  - Performance Engineering
displayed_sidebar: domainMcqSidebar
---

import AdBanner from '@site/src/components/AdBanner';
import Link from '@docusaurus/Link';

# CompilerSutra MCQ Hub



📩 Interested in deep dives like pipelines, cache, and compiler optimizations?

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: '#fff',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>

<div style={{position: 'relative', overflow: 'hidden', borderRadius: '28px', padding: '2rem', marginBottom: '1.5rem', border: '1px solid var(--ifm-color-emphasis-200)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(251, 191, 36, 0.10)), var(--ifm-background-surface-color)', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)'}}>
  <div style={{position: 'absolute', inset: 'auto -5% -35% auto', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.12)', filter: 'blur(8px)'}} />
  <p style={{margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '0.78rem', color: 'var(--ifm-color-primary)'}}>Practice by topic</p>
  <h1 style={{marginTop: '0.45rem', marginBottom: '0.85rem', fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.05}}>MCQs for compiler engineers, systems builders, and serious learners</h1>
  <p style={{maxWidth: '760px', fontSize: '1.03rem', color: 'var(--ifm-color-emphasis-800)'}}>
    This hub collects the MCQ sections that actually match CompilerSutra: C++ foundations, interview prep,
    compiler design, systems programming, GPU programming, embedded systems, and HPC-oriented performance topics.
  </p>
  <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem'}}>
    <Link className="button button--lg button--primary" to="/docs/mcq/cpp_mcqs">Start with C++ MCQs</Link>
    <Link className="button button--lg button--secondary" to="/docs/mcq/questions/domain/compilers">Jump to Compiler MCQs</Link>
  </div>
</div>

<div>
    <AdBanner />
</div>

## Main Tracks

<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', marginBottom: '1.75rem'}}>
  <Link to="/docs/mcq/cpp_mcqs" style={{display: 'block', padding: '1.1rem', borderRadius: '22px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.12), rgba(15, 23, 42, 0.45))'}}>
    <div style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd'}}>Foundation</div>
    <h3 style={{marginTop: '0.45rem', marginBottom: '0.45rem'}}>C++ MCQs</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Basic to advanced questions across core C++ language, STL, memory, concurrency, and interview prep.</p>
  </Link>
  <Link to="/docs/mcq/interview_question/cpp_interview_mcqs" style={{display: 'block', padding: '1.1rem', borderRadius: '22px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.14), rgba(15, 23, 42, 0.45))'}}>
    <div style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fcd34d'}}>Interview</div>
    <h3 style={{marginTop: '0.45rem', marginBottom: '0.45rem'}}>C++ Interview Questions</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Targeted question sets for placements, interviews, and high-frequency C++ concepts.</p>
  </Link>
  <Link to="/docs/mcq/questions/domain/compilers" style={{display: 'block', padding: '1.1rem', borderRadius: '22px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'linear-gradient(180deg, rgba(52, 211, 153, 0.14), rgba(15, 23, 42, 0.45))'}}>
    <div style={{fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6ee7b7'}}>Compiler Core</div>
    <h3 style={{marginTop: '0.45rem', marginBottom: '0.45rem'}}>Compiler MCQs</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Compilers, LLVM, MLIR, AI in compilers, and compilers in AI, all under one master page.</p>
  </Link>
</div>

## Domain MCQ Sets

<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem'}}>
  <Link to="/docs/mcq/questions/domain/system-programming" style={{display: 'block', padding: '1rem', borderRadius: '20px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginBottom: '0.4rem'}}>System Programming</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Processes, threads, scheduling, virtual memory, IPC, and Unix fundamentals.</p>
  </Link>
  <Link to="/docs/mcq/questions/domain/gpu-programming" style={{display: 'block', padding: '1rem', borderRadius: '20px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginBottom: '0.4rem'}}>GPU Programming</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Kernels, work-groups, memory hierarchy, coalescing, divergence, and occupancy.</p>
  </Link>
  <Link to="/docs/mcq/questions/domain/embedded" style={{display: 'block', padding: '1rem', borderRadius: '20px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginBottom: '0.4rem'}}>Embedded Systems</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Interrupts, DMA, buses, watchdogs, timers, real-time basics, and bootloaders.</p>
  </Link>
  <Link to="/docs/mcq/questions/domain/data-science-hpc" style={{display: 'block', padding: '1rem', borderRadius: '20px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginBottom: '0.4rem'}}>HPC and Performance</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Parallel scaling, MPI, cache behavior, data movement, and throughput-oriented reasoning.</p>
  </Link>
  <Link to="/docs/mcq/questions/domain/competitive-programming" style={{display: 'block', padding: '1rem', borderRadius: '20px', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginBottom: '0.4rem'}}>Competitive Programming</h3>
    <p style={{marginBottom: 0, color: 'var(--ifm-color-emphasis-700)'}}>Algorithmic thinking and problem-solving oriented MCQs for coding rounds.</p>
  </Link>
</div>

## Best Way To Use This Hub

<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem'}}>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <strong>1. Learn first</strong>
    <p style={{margin: '0.5rem 0 0', color: 'var(--ifm-color-emphasis-700)'}}>Read the track or article before using MCQs as reinforcement.</p>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <strong>2. Practice by domain</strong>
    <p style={{margin: '0.5rem 0 0', color: 'var(--ifm-color-emphasis-700)'}}>Choose compiler, systems, GPU, or HPC instead of random mixed questions.</p>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <strong>3. Revisit weak spots</strong>
    <p style={{margin: '0.5rem 0 0', color: 'var(--ifm-color-emphasis-700)'}}>Use wrong answers to decide which tutorial or track to revisit next.</p>
  </div>
</div>

## Pair These MCQs With Your Reading

| If you are studying | Use these MCQs |
| --- | --- |
| Compiler Fundamentals or LLVM | [Compiler MCQs](/docs/mcq/questions/domain/compilers), [C++ MCQs](/docs/mcq/cpp_mcqs) |
| GPU and OpenCL | [GPU Programming](/docs/mcq/questions/domain/gpu-programming), [HPC and Performance](/docs/mcq/questions/domain/data-science-hpc) |
| Linux, systems, low-level runtime behavior | [System Programming](/docs/mcq/questions/domain/system-programming), [Embedded Systems](/docs/mcq/questions/domain/embedded) |
| Interview preparation | [C++ Interview Questions](/docs/mcq/interview_question/cpp_interview_mcqs), [C++ MCQs](/docs/mcq/cpp_mcqs) |

<div>
    <AdBanner />
</div>
