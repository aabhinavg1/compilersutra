---
title: "Getting started"
sidebar_label: "Getting started"
description: "Install CompilerSutra AppFarm and run your first csfarm job."
displayed_sidebar: csfarmSidebar
keywords:
  - csfarm install
  - csfarm getting started
---

# Getting started

## Requirements

- Linux host with `clang` and/or `gcc`
- Python 3.11+
- Network for first fetch of app sources

## Install

```bash
git clone https://github.com/compilersutra/CompilerSutraAppFarm.git
cd CompilerSutraAppFarm
git checkout v0.1.2
python3 -m venv .venv && source .venv/bin/activate
pip install -e '.[dev]'
csfarm doctor
csfarm list | head
```

## First run

```bash
csfarm plan database/sqlite@3.53 --flags baseline
csfarm run  database/sqlite@3.53 --flags baseline --skip-perf
```

Results land under `results/run/.../run.json` with `runner`, `isa`, and `emulated` tags.

## Next

- [Tutorial](/docs/project/compilersutra-appfarm/tutorial/) — tier-1 matrix and `paper_eval`
- [Claims & methodology](/docs/project/compilersutra-appfarm/methodology/) — honest claim ladder
- Optional timing: install [CompilerSutraPerf](/docs/project/compilersutra-perf/) so recipes can hand off to `csperf`
