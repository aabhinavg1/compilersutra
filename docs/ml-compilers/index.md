---
title: ML Compilers
description: Explore ML compilers, staged lowering, graph and tensor compilation, and the systems used to deploy machine learning workloads efficiently.
slug: /ml-compilers/
displayed_sidebar: mlCompilersSidebar
sidebar_position: 1
keywords:
  - ML compilers
  - AI compilers
  - MLIR
  - TVM
  - XLA
  - tensor compiler
---

import Link from '@docusaurus/Link';
import AdBanner from '@site/src/components/AdBanner';

# ML Compilers

ML compilers sit between machine learning models and real hardware. They transform graphs, tensor programs, and high-level operators into forms that can be scheduled, lowered, optimized, and executed efficiently on CPUs, GPUs, and accelerators.

<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem'}}>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>Start Here</h3>
    <p>Begin with the first core article on what ML compilers are and how to learn them.</p>
    <Link to="/docs/ml-compilers/introduction-roadmap">Open article</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>ML Compilers Track</h3>
    <p>Follow the guided path through MLIR, TVM, lowering, and hardware-aware compilation.</p>
    <Link to="/docs/tracks/ml-compilers">Open track</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>MLIR</h3>
    <p>Learn why multi-level IRs matter in modern compiler stacks.</p>
    <Link to="/docs/MLIR/intro">Open MLIR</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)'}}>
    <h3 style={{marginTop: 0}}>TVM</h3>
    <p>See how scheduling and deployment fit into the ML compiler workflow.</p>
    <Link to="/docs/tvm/intro-to-tvm">Open TVM</Link>
  </div>
</div>

<AdBanner />

## What This Topic Covers

- model graphs, tensor programs, and domain-specific IRs
- staged lowering from high-level operators to hardware-friendly code
- scheduling, fusion, layout changes, and memory planning
- hardware-aware compilation for CPUs, GPUs, and accelerators
- systems such as MLIR, TVM, and adjacent ML compiler stacks

## Best Entry Points

- [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack)
- [ML Compilers Track](/docs/tracks/ml-compilers)
- [MLIR Intro](/docs/MLIR/intro)
- [TVM Intro](/docs/tvm/intro-to-tvm)
- [GPU Compilers Track](/docs/tracks/gpu-compilers)

## Master Article Table

| Article | Type | Focus | Best For |
|---|---|---|---|
| [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap) | Foundation | End-to-end mental model for ML compiler stacks | Readers starting from zero or mapping the field |
| [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack) | Systems Walkthrough | Triton -> TTIR -> TTGIR -> LLVM IR -> AMD ISA -> HSACO | Readers who want to see the stack materialize on real hardware |
| [MLIR Intro](/docs/MLIR/intro) | Infrastructure | Why multi-level IR exists and how MLIR structures staged lowering | Readers moving from LLVM into MLIR |
| [TVM Intro](/docs/tvm/intro-to-tvm) | Deployment + Scheduling | Scheduling, model lowering, and deployment workflow | Readers exploring model compilation in practice |
| [GPU Compilers Track](/docs/tracks/gpu-compilers) | Adjacent Track | GPU execution model, kernels, and hardware-aware compilation | Readers who need stronger GPU compiler intuition |

## Recommended Reading Order

1. [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
2. [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack)
3. [MLIR Intro](/docs/MLIR/intro)
4. [TVM Intro](/docs/tvm/intro-to-tvm)
5. [GPU Compilers Track](/docs/tracks/gpu-compilers)

## How It Differs From Other Topics

- [Compilers](/docs/compilers/) teaches the general compiler foundation.
- [MLIR](/docs/MLIR/) focuses on one important infrastructure layer.
- ML Compilers connects the end-to-end workflow for machine learning workloads.
