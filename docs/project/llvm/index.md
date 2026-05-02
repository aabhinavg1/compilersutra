---
title: "LLVM Projects"
description: "A practical project hub for building LLVM-based compiler projects, starting with VELOX and extending into IR, optimization, backend, and tooling ideas."
displayed_sidebar: llvmProjectsSidebar
keywords:
  - LLVM projects
  - compiler projects
  - VELOX compiler
  - LLVM IR projects
  - compiler engineering
  - RISC-V backend
  - LLVM tutorial projects
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LLVM Projects

If you want to build real compiler projects on top of LLVM, this is the right place to start.

This folder is organized around one main idea:

- build a custom frontend for `VELOX`
- lower it into LLVM IR
- use LLVM tools to optimize and generate code
- run the output on `QEMU`

:::important
This is not just a theory section. Each project here is meant to help you understand how real compiler pipelines are built.
:::

## Table of Contents

- [Featured Project: VELOX](#featured-project-velox)
- [Suggested Learning Order](#suggested-learning-order)
- [Why This Folder Exists](#why-this-folder-exists)

## Featured Project: VELOX

<Tabs groupId="llvm-projects" className="rounded-tabs">

<TabItem value="velox" label="VELOX">

`VELOX` is our main compiler project.

It is a compute-focused language project designed to teach:

- frontend design
- AST construction
- LLVM IR generation
- IR optimization
- RISC-V code generation
- binary execution with `QEMU`

You can read the full series here:

- [VELOX Compiler Project](./VELOX/)

:::note
This is the first project you should build if your goal is to understand the full compiler pipeline end to end.
:::

</TabItem>

<TabItem value="ideas" label="Other LLVM Ideas">

Once VELOX is clear, you can build more LLVM-based projects to strengthen your compiler understanding.

| Project | What You Learn | Level |
| --- | --- | --- |
| LLVM IR Visualizer | How basic blocks, instructions, and control flow look in IR | Beginner |
| Constant Folding Playground | How optimization passes simplify programs | Beginner |
| Tiny Expression Compiler | How to go from source text to LLVM IR quickly | Beginner |
| Mini JIT Engine | How runtime compilation works with LLVM | Intermediate |
| RISC-V Codegen Demo | How LLVM lowers IR into target assembly | Intermediate |
| Custom Optimization Pass | How to inspect and transform LLVM IR | Intermediate |
| Loop Optimization Study | How `opt` transforms loops and control flow | Intermediate |
| Toy Language Frontend | How to build a parser and AST for a new language | Intermediate |
| Compiler Debugger Toolkit | How to inspect IR, assembly, and emitted binaries | Advanced |
| Backend Experiments | How target-specific lowering changes code generation | Advanced |

:::tip
If you are still a beginner, do not start with backend-heavy work. Build the frontend first, then move into IR and optimization.
:::

</TabItem>

</Tabs>

:::tip
If you are still a beginner, do not start with backend-heavy work. Build the frontend first, then move into IR and optimization.
:::

## Suggested Learning Order

1. Start with VELOX.
2. Understand the AST and frontend.
3. Learn how LLVM IR represents the program.
4. Study optimization with `opt`.
5. Look at assembly generation with `llc`.
6. Run the binary in `QEMU`.
7. Then try one of the smaller LLVM projects above.

## Why This Folder Exists

This folder keeps LLVM learning organized.

Instead of jumping between unrelated docs, you can stay inside one project family and move from theory to implementation in a clean order.

## Next Step

Start with the VELOX compiler project:

- [VELOX Compiler Project](./VELOX/)
