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
    <p>Begin with the most beginner-friendly article on why ML compilers exist beyond LLVM in the first place.</p>
    <Link to="/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm">Open article</Link>
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
    <Link to="/docs/tvm-for-beginners">Open TVM</Link>
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

- [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm)
- [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline)
- [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
- [Inside torch.compile: Dynamo -> AOTAutograd -> Inductor -> Triton Explained](/docs/ml-compilers/inside-torch-compile)
- [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack)
- [ML Compilers Track](/docs/tracks/ml-compilers)
- [MLIR Intro](/docs/MLIR/intro)
- [TVM Intro](/docs/tvm-for-beginners)
- [GPU Compilers Track](/docs/tracks/gpu-compilers)

## Master Article Table

| Article | Type | Focus | Best For |
|---|---|---|---|
| [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm) | Beginner Foundation | Why ML workloads need extra compiler layers before normal low-level codegen | Readers starting from zero and asking why LLVM alone is not the whole answer |
| [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline) | Conceptual Pipeline | Model input -> graph capture -> lowering -> kernels -> runtime -> hardware | Readers who want one clean model-to-hardware walkthrough |
| [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap) | Foundation | End-to-end mental model for ML compiler stacks | Readers starting from zero or mapping the field |
| [Inside torch.compile: Dynamo -> AOTAutograd -> Inductor -> Triton Explained](/docs/ml-compilers/inside-torch-compile) | System Walkthrough | PyTorch graph capture, backward preparation, backend lowering, and GPU kernel generation | Readers who want one concrete modern compiler stack instead of only theory |
| [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack) | Systems Walkthrough | Triton -> TTIR -> TTGIR -> LLVM IR -> AMD ISA -> HSACO | Readers who want to see the stack materialize on real hardware |
| [MLIR Intro](/docs/MLIR/intro) | Infrastructure | Why multi-level IR exists and how MLIR structures staged lowering | Readers moving from LLVM into MLIR |
| [TVM Intro](/docs/tvm-for-beginners) | Deployment + Scheduling | Scheduling, model lowering, and deployment workflow | Readers exploring model compilation in practice |
| [GPU Compilers Track](/docs/tracks/gpu-compilers) | Adjacent Track | GPU execution model, kernels, and hardware-aware compilation | Readers who need stronger GPU compiler intuition |

## Recommended Reading Order

1. [What Problem ML Compilers Solve Beyond LLVM](/docs/ml-compilers/what-problem-ml-compilers-solve-beyond-llvm)
2. [The End-to-End ML Compiler Pipeline](/docs/ml-compilers/end-to-end-pipeline)
3. [Introduction to ML Compilers + Roadmap](/docs/ml-compilers/introduction-roadmap)
4. [Inside torch.compile: Dynamo -> AOTAutograd -> Inductor -> Triton Explained](/docs/ml-compilers/inside-torch-compile)
5. [Seeing the ML Compiler Stack Live on AMD GPU](/docs/ml-compilers/mlcompilerstack)
6. [MLIR Intro](/docs/MLIR/intro)
7. [TVM Intro](/docs/tvm-for-beginners)
8. [GPU Compilers Track](/docs/tracks/gpu-compilers)

## How It Differs From Other Topics

- [Compilers](/docs/compilers/) teaches the general compiler foundation.
- [MLIR](/docs/MLIR/) focuses on one important infrastructure layer.
- ML Compilers connects the end-to-end workflow for machine learning workloads.
