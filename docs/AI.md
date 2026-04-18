---
title: AI Systems
description: Learn how AI systems work from mathematics and tensors to ONNX, MLIR, LLVM, and CPU or GPU execution.
displayed_sidebar: techblogSidebar
tags:
  - AI Systems
  - Machine Learning Systems
  - Tensors
  - ONNX
  - MLIR
  - LLVM
  - GPU
  - Compiler Engineering
keywords:
  - AI systems
  - machine learning systems
  - tensors to GPUs
  - PyTorch ONNX MLIR LLVM
  - AI systems learning path
  - mathematical foundations for AI
  - AI compiler stack
---

import Link from '@docusaurus/Link';
import AdBanner from '@site/src/components/AdBanner';
import RevealOnScroll from '@site/src/components/RevealOnScroll';

# AI Systems

<RevealOnScroll>
<div style={{padding: '1.4rem', borderRadius: '24px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-primary) 14%, var(--ifm-background-surface-color)) 0%, color-mix(in srgb, var(--ifm-color-primary) 6%, var(--ifm-background-color)) 100%)', color: 'var(--ifm-font-color-base)', marginBottom: '1.5rem', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.10)'}}>
  <p style={{margin: '0 0 0.5rem 0', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.78rem', color: 'var(--ifm-color-emphasis-700)'}}>CompilerSutra Master Topic</p>
  <h2 style={{margin: '0 0 0.75rem 0', fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.05}}>From Mathematical Intent to Real Hardware</h2>
  <div style={{display: 'grid', gap: '0.75rem', marginBottom: '1rem'}}>
    <div style={{padding: '0.9rem 1rem', borderRadius: '16px', background: 'color-mix(in srgb, var(--ifm-color-primary) 16%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <p style={{margin: 0, fontSize: '1.08rem', fontWeight: 700}}>Most AI engineers don’t know what happens after PyTorch.</p>
    </div>
    <div style={{padding: '0.9rem 1rem', borderRadius: '16px', background: 'color-mix(in srgb, var(--ifm-color-success) 15%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'}}>
      <p style={{margin: 0, fontSize: '1.08rem', fontWeight: 700}}>Your model doesn’t run on GPUs. Compilers make it run.</p>
    </div>
  </div>
  <p style={{margin: '0 0 1rem 0', maxWidth: '760px', fontSize: '1.02rem', lineHeight: 1.65, color: 'var(--ifm-color-emphasis-800)'}}>
    Most AI engineers stop at frameworks like PyTorch or TensorFlow. But real performance, real deployment, and real understanding happen below that layer, inside compilers and hardware. This page shows that full path.
  </p>
  <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginBottom: '1rem'}}>
    <span style={{padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'color-mix(in srgb, var(--ifm-color-primary) 8%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)'}}>Math</span>
    <span style={{padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'color-mix(in srgb, var(--ifm-color-primary) 8%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)'}}>Tensors</span>
    <span style={{padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'color-mix(in srgb, var(--ifm-color-primary) 8%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)'}}>ONNX</span>
    <span style={{padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'color-mix(in srgb, var(--ifm-color-primary) 8%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)'}}>MLIR</span>
    <span style={{padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'color-mix(in srgb, var(--ifm-color-primary) 8%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)'}}>LLVM</span>
    <span style={{padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'color-mix(in srgb, var(--ifm-color-primary) 8%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)'}}>CPU/GPU</span>
  </div>
  <div style={{padding: '0.9rem 1rem', borderRadius: '16px', background: 'color-mix(in srgb, var(--ifm-color-emphasis-100) 30%, var(--ifm-background-color))', border: '1px solid var(--ifm-color-emphasis-300)', fontFamily: 'var(--ifm-font-family-monospace)', fontSize: '0.98rem', overflowX: 'auto'}}>
    Math -&gt; Tensors -&gt; ONNX/Graphs -&gt; MLIR/LLVM -&gt; CPU/GPU
  </div>
</div>
</RevealOnScroll>

<RevealOnScroll delay={80}>
<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', marginBottom: '1.5rem'}}>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-primary) 10%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <p style={{margin: '0 0 0.35rem 0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ifm-color-emphasis-700)'}}>Best For</p>
    <strong>People who want the whole stack</strong>
    <p style={{margin: '0.5rem 0 0 0'}}>Use this page when you want one curated entry point instead of jumping between disconnected AI, compiler, and hardware material.</p>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-success) 10%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <p style={{margin: '0 0 0.35rem 0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ifm-color-emphasis-700)'}}>What You Get</p>
    <strong>Articles, books, and papers in one path</strong>
    <p style={{margin: '0.5rem 0 0 0'}}>The goal is not just explanation. It is progression: read the article, open the paper, and then go deeper into the book shelf.</p>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-warning) 12%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <p style={{margin: '0 0 0.35rem 0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ifm-color-emphasis-700)'}}>Reading Style</p>
    <strong>Move from intuition to systems</strong>
    <p style={{margin: '0.5rem 0 0 0'}}>Start with shapes and tensor reasoning, then follow how that computation gets represented, lowered, optimized, and executed.</p>
  </div>
</div>
</RevealOnScroll>

## Reference Shelves

Use these two shelves alongside the articles on this page. The books shelf is for structured long-form study. The paper shelf is for seminal models and system-shaping research.

<RevealOnScroll delay={120}>
<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '1.5rem'}}>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-primary) 9%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <h3 style={{marginTop: 0}}>Book References</h3>
    <p>Use the AI books shelf for structured reading across math, deep learning, probabilistic ML, RL, and NLP.</p>
    <Link to="/books/topic?topic=ai">Open AI books</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-success) 8%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <h3 style={{marginTop: 0}}>Research Papers</h3>
    <p>Use the AI paper shelf for foundational model papers, transformer-era work, and efficiency-focused systems reading.</p>
    <Link to="/library/topic?topic=ai">Open AI research shelf</Link>
  </div>
</div>
</RevealOnScroll>

## Direct PDF Book References

These are direct PDF links for books that are freely available in full-text form. For books that do not have a legitimate free PDF, use the broader [AI books shelf](/books/topic?topic=ai).

<RevealOnScroll delay={140}>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>PDF</th>
      <th>Notes</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>Deep Learning</td>
      <td>[pdf](https://aikosh.indiaai.gov.in/static/Deep+Learning+Ian+Goodfellow.pdf)</td>
      <td>Goodfellow, Bengio, Courville</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Dive into Deep Learning</td>
      <td>[pdf](https://en.d2l.ai/d2l-en.pdf)</td>
      <td>Zhang, Lipton, Li, Smola</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Mathematics for Machine Learning</td>
      <td>[pdf](https://mml-book.github.io/book/mml-book.pdf)</td>
      <td>Math foundation for tensors and ML</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Probabilistic Machine Learning: An Introduction</td>
      <td>[pdf](https://github.com/probml/pml-book/releases/latest/download/book1.pdf)</td>
      <td>Kevin P. Murphy</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Probabilistic Machine Learning: Advanced Topics</td>
      <td>[pdf](https://github.com/probml/pml2-book/releases/latest/download/book2.pdf)</td>
      <td>Kevin P. Murphy</td>
    </tr>
    <tr>
      <td>6</td>
      <td>The Elements of Statistical Learning</td>
      <td>[pdf](https://hastie.su.domains/Papers/ESLII.pdf)</td>
      <td>Hastie, Tibshirani, Friedman</td>
    </tr>
    <tr>
      <td>7</td>
      <td>Reinforcement Learning: An Introduction</td>
      <td>[pdf](http://incompleteideas.net/book/RLbook2020.pdf)</td>
      <td>Sutton, Barto</td>
    </tr>
    <tr>
      <td>8</td>
      <td>Speech and Language Processing</td>
      <td>[pdf](https://web.stanford.edu/~jurafsky/slp3/ed3book.pdf)</td>
      <td>Jurafsky, Martin</td>
    </tr>
  </tbody>
</table>
</RevealOnScroll>

📩 Interested in deep dives like pipelines, cache, and compiler optimizations?

<RevealOnScroll delay={160}>
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
</RevealOnScroll>

<RevealOnScroll delay={180}>
<div style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem'}}>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-primary) 8%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <h3 style={{marginTop: 0}}>ML Compilers</h3>
    <p>See how machine learning workloads move through lowering, scheduling, and deployment.</p>
    <Link to="/docs/ml-compilers/">Open topic</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-info) 8%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <h3 style={{marginTop: 0}}>MLIR</h3>
    <p>Learn why multi-level IR matters in modern AI and compiler stacks.</p>
    <Link to="/docs/MLIR/intro">Open article</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-success) 8%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <h3 style={{marginTop: 0}}>LLVM</h3>
    <p>Follow the path from lowered IR to machine-oriented optimization and codegen.</p>
    <Link to="/docs/llvm/intro-to-llvm">Open article</Link>
  </div>
  <div style={{padding: '1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-300)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--ifm-color-warning) 10%, var(--ifm-background-surface-color)) 0%, var(--ifm-background-surface-color) 100%)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'}}>
    <h3 style={{marginTop: 0}}>GPU</h3>
    <p>Connect AI computation to parallel hardware, kernels, and execution behavior.</p>
    <Link to="/docs/gpu/">Open topic</Link>
  </div>
</div>
</RevealOnScroll>

<AdBanner />

## Curated Scope

- mathematical structure behind tensor computation
- frameworks and tensor programming intuition
- graph and model representation layers such as ONNX
- staged lowering through MLIR and LLVM
- execution on CPUs, GPUs, and adjacent runtimes

## Recommended Reading Order

1. Mathematics foundation
2. Tensors and frameworks
3. Model representation
4. Compiler layer
5. Execution and hardware

<RevealOnScroll delay={120}>
<div style={{padding: '1rem 1.1rem', borderRadius: '18px', border: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-background-surface-color)', margin: '1.25rem 0 1.5rem 0'}}>
  <p style={{margin: '0 0 0.45rem 0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ifm-color-emphasis-700)'}}>How To Use This Page</p>
  <p style={{margin: 0}}>
    If you are new, read top to bottom. If you already know frameworks, jump straight to <strong>Model Representation</strong> and <strong>Compiler Layer</strong>. If you care about performance, treat <strong>Execution and Hardware</strong> as the payoff section and use the linked GPU and ML compiler material as your second pass.
  </p>
</div>
</RevealOnScroll>

## 1. Mathematics Foundation

This section builds the intuition required for shapes, indexing, layout, and matrix-based reasoning. Without this layer, tensor operations feel like memorization instead of structured computation.

<RevealOnScroll>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Article</th>
      <th>Video</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>Linear Algebra for AI Systems</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Shapes, Indexing, and Data Layout</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>3</td>
      <td>How Mathematical Operations Become Programs</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>
</RevealOnScroll>

## 2. Tensors and Frameworks

This section is where mathematical ideas become programmable tensor operations. The focus is on tensor creation, reshape, transpose, broadcasting, and how frameworks express compute.

<RevealOnScroll>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Article</th>
      <th>Video</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>Introduction to Tensors for Programmers</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>2</td>
      <td>PyTorch Tensors: Shape, Reshape, and Broadcasting</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>3</td>
      <td>TensorFlow Tensors and Execution Basics</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>
</RevealOnScroll>

## 3. Model Representation

Framework code is not the final form of a model. This section explains how computation graphs and exchange formats make models portable across tools and runtimes.

<RevealOnScroll>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Article</th>
      <th>Video</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>What Is ONNX and Why Model Formats Matter</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Computation Graphs and Operators</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>3</td>
      <td>From Framework Graphs to Portable Models</td>
      <td>Coming Soon</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>
</RevealOnScroll>

## 4. Compiler Layer

This is where AI systems connect directly to compiler engineering. Models and tensor programs are represented, lowered, transformed, and optimized into machine-oriented forms.

<RevealOnScroll>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Article</th>
      <th>Video</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>Introduction to ML Compilers + Roadmap</td>
      <td>[link](/docs/ml-compilers/introduction-roadmap)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>2</td>
      <td>MLIR Introduction</td>
      <td>[link](/docs/MLIR/intro)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Introduction to LLVM</td>
      <td>[link](/docs/llvm/intro-to-llvm)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>4</td>
      <td>Seeing the ML Compiler Stack Live on AMD GPU</td>
      <td>[link](/docs/ml-compilers/mlcompilerstack)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>5</td>
      <td>Introduction to TVM</td>
      <td>[link](/docs/tvm-for-beginners)</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>
</RevealOnScroll>

## 5. Execution and Hardware

At the end of the stack, computation has to run on real machines. This section connects kernels, memory movement, throughput, and CPU or GPU execution behavior.

<RevealOnScroll>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Article</th>
      <th>Video</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>GPU Introduction</td>
      <td>[link](/docs/The_Graphic_Rendering_Pipeline)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>2</td>
      <td>What Is GPU?</td>
      <td>[link](/docs/gpu/what_is_gpu)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>3</td>
      <td>CPU vs GPU</td>
      <td>[link](/docs/gpu/CPU_Vs_GPU)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>4</td>
      <td>OpenCL Roadmap</td>
      <td>[link](/docs/gpu/opencl)</td>
      <td>Coming Soon</td>
    </tr>
    <tr>
      <td>5</td>
      <td>GPU Compilers Track</td>
      <td>[link](/docs/tracks/gpu-compilers)</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>
</RevealOnScroll>

## Related AI Reading

This section captures adjacent AI ecosystem reading that does not sit directly in the systems learning path but still matters for readers exploring modern models and tooling.

<RevealOnScroll>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Article</th>
      <th>Video</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>1</td>
      <td>Is ChatGPT Open Source? Understanding OpenAI’s Models and Open Alternatives</td>
      <td>[link](/docs/AI/is_gpt_is_opensource)</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>
</RevealOnScroll>
