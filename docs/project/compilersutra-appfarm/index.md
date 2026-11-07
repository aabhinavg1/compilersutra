---
title: "CompilerSutra AppFarm"
sidebar_label: "Overview"
description: "Open typed application farm for toolchain and flag regression testing — csfarm fetch → build → test → measure."
displayed_sidebar: csfarmSidebar
keywords:
  - CompilerSutra AppFarm
  - csfarm
  - compiler testing
  - application farm
  - toolchain regression
---

# CompilerSutra AppFarm

**CompilerSutra AppFarm** (`csfarm`) is an open, typed corpus of OSS applications plus a scriptable **fetch → build → test → measure** pipeline for compiler and flag experiments.

Repo: [github.com/compilersutra/CompilerSutraAppFarm](https://github.com/compilersutra/CompilerSutraAppFarm) · pin **v0.1.2**

Sibling tool: [CompilerSutraPerf (`csperf`)](/docs/project/compilersutra-perf/) for hardware-oriented timing when installed. Without it, AppFarm records honest wall-clock samples (`tool: csfarm`).

## Status

| Item | Value |
| --- | --- |
| Release | **0.1.2** alpha |
| Trust for claims | **Tier-1** functional set (not the full catalog) |
| Host matrix | clang/gcc × baseline/optimize — see project evidence docs |

## Docs

| Page | Role |
| --- | --- |
| [Getting started](/docs/project/compilersutra-appfarm/getting-started/) | Install → first `csfarm run` |
| [Tutorial](/docs/project/compilersutra-appfarm/tutorial/) | Walkthrough: plan, run, tier-1, paper_eval |
| [Claims & methodology](/docs/project/compilersutra-appfarm/methodology/) | What you may and may not claim |

## Quick start

```bash
git clone https://github.com/compilersutra/CompilerSutraAppFarm.git
cd CompilerSutraAppFarm
git checkout v0.1.2
python3 -m venv .venv && source .venv/bin/activate
pip install -e '.[dev]'
csfarm doctor
csfarm run database/sqlite@3.53 --flags baseline --skip-perf
```

Regenerate evidence tables:

```bash
python3 scripts/paper_eval.py --run
```

Part of the [Projects catalogue](/docs/project/).
