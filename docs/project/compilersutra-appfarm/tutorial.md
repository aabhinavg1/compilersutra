---
title: "Tutorial"
sidebar_label: "Tutorial"
description: "Hands-on AppFarm path: flags, tier-1 batch, and paper_eval evidence tables."
displayed_sidebar: csfarmSidebar
keywords:
  - csfarm tutorial
  - tier-1
  - paper_eval
---

# Tutorial

Assume you completed [Getting started](/docs/project/compilersutra-appfarm/getting-started/).

## 1. Compose flags

Presets live in farm config (`baseline`, `optimize`, `sanitize`, `fastmath`, `lto`).

```bash
csfarm plan compression/zstd@1.5.6 --flags optimize
csfarm run  compression/zstd@1.5.6 --flags optimize --skip-perf
```

`optimize` is `-O3`. Use `fastmath` when you explicitly want `-ffast-math` (can break apps such as Redis under clang).

## 2. Tier-1 trusted core

Prefer the tier-1 set over claiming the whole catalog:

```bash
python3 scripts/batch_run.py --tier1 --toolchain clang --flags baseline --skip-perf
```

CI-sized subset:

```bash
python3 scripts/batch_run.py --tier1 --ci --flags baseline --skip-perf
```

## 3. Evidence tables

```bash
python3 scripts/paper_eval.py --run
# optional: sanitize differential + Docker table
python3 scripts/paper_eval.py --include-sanitize
./scripts/docker_tier1.sh ubuntu clang baseline
python3 scripts/paper_eval.py --docker-report results/batch/tier1-docker-clang-baseline.json
```

Output: `docs/paper-tables.md` in the AppFarm repo (C1 gate PASS/FAIL).

## 4. Timing (honest)

```bash
python3 scripts/paper_eval.py --timing
```

Every timing row must keep `tool: csfarm` (wall-clock) or `csperf` if hardware counters were used. See [methodology](/docs/project/compilersutra-appfarm/methodology/).
