---
title: Compiler Tech Blog
displayed_sidebar: compilerTechblogSidebar
description: Practical compiler-engineering articles on LLVM, optimization tradeoffs, hardware performance, and code generation.
slug: /compilers/techblog/
keywords:
  - compiler tech blog
  - LLVM performance
  - compiler optimization
  - hardware performance
  - code generation
---

import Link from '@docusaurus/Link';
import AdBanner from '@site/src/components/AdBanner';

# Compiler Tech Blog

This is the master hub for compiler articles on CompilerSutra.

Use this page to navigate the current GPU register-pressure series and the earlier compiler-performance series. The focus is practical: how compiler decisions change generated code, occupancy, spills, and runtime.

<div>
  <AdBanner />
</div>

## All Articles

<table>
  <caption>All compiler articles in reading order, grouped by series.</caption>
  <thead>
    <tr>
      <th>Series</th>
      <th>Part</th>
      <th>Article</th>
      <th>What It Covers</th>
      <th>Video</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th colSpan="5" style={{textAlign: 'left', background: 'var(--ifm-table-stripe-background)', fontWeight: 700}}>
        GPU Register Pressure Series
      </th>
    </tr>
    <tr>
      <td>Register Pressure</td>
      <td>Part 1</td>
      <td><Link to="/docs/compilers/techblog/register-pressure-on-gpu/">Why Kernels Fail</Link></td>
      <td>Why register pressure makes kernels slow, spill, or lose occupancy.</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>Register Pressure</td>
      <td>Part 2</td>
      <td><Link to="/docs/compilers/techblog/register-pressure-on-gpu/how-to-calculate-it/">How to Calculate It</Link></td>
      <td>How to estimate register pressure and occupancy from compiler output.</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>Register Pressure</td>
      <td>Part 3</td>
      <td><Link to="/docs/compilers/techblog/register-pressure-on-gpu/how-to-reduce-it/">How to Reduce It</Link></td>
      <td>How to shorten live ranges and recover throughput.</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <th colSpan="5" style={{textAlign: 'left', background: 'var(--ifm-table-stripe-background)', fontWeight: 700}}>
        Compiler Decisions Series
      </th>
    </tr>
    <tr>
      <td>Compiler Decisions</td>
      <td>Part 1</td>
      <td><Link to="/docs/compilers/techblog/how-compiler-decisions-affect-hardware-performance/">Why Compiler Decisions Affect Hardware Performance</Link></td>
      <td>How compiler choices show up in runtime behavior.</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>Compiler Decisions</td>
      <td>Part 2</td>
      <td><Link to="/docs/compilers/techblog/how-compiler-decisions-affect-hardware-performance/how-developers-influence-compiler-decisions/">How Developers Influence Compiler Decisions</Link></td>
      <td>How source shape and coding style change backend decisions.</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>Compiler Decisions</td>
      <td>Part 3</td>
      <td><Link to="/docs/compilers/techblog/how-compiler-decisions-affect-hardware-performance/practical-compiler-control/">Practical Compiler Control</Link></td>
      <td>Video walkthrough of practical compiler control for performance tuning.</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>

## What You Will Find Here

- GPU register pressure and why it matters
- How occupancy and register usage interact
- How to estimate register pressure from compiler output
- How to reduce spills and recover throughput
- Practical compiler-engineering commentary grounded in GPU behavior

## How To Use This Page

1. Read the current register-pressure series first if you want the clearest introduction.
2. Use Part 2 when you want the math and resource model.
3. Use Part 3 when you want the practical tuning workflow.
4. Use the earlier compiler-performance series for the broader context.

## Back to Compiler Hub

- [Compiler home](/docs/compilers/)
- [LLVM roadmap](/docs/llvm/)
- [Compiler articles hub](/docs/articles)
- [Compiler Tech Blog](/docs/compilers/techblog/)
