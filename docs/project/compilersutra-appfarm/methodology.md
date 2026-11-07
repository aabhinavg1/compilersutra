---
title: "Claims & methodology"
sidebar_label: "Claims & methodology"
description: "What AppFarm may claim: tier-1 correctness, tagged runners, honest timing — and what it must not."
displayed_sidebar: csfarmSidebar
keywords:
  - csfarm claims
  - tier-1
  - methodology
---

# Claims & methodology

AppFarm is useful only if claims stay falsifiable. Upstream detail lives in the repo (`docs/CLAIMS.md`, `docs/PERF.md`, `docs/VISION.md`).

## Claim ladder (short)

| Rung | You may say | Evidence |
| --- | --- | --- |
| C0 | Open typed farm exists | Public repo + `csfarm` |
| C1 | Tier-1 builds/tests under clang/gcc × baseline/optimize | `paper_eval` T1 green |
| C1b | Flag presets matter | Sanitize / fastmath differentials |
| C2 | Multi-runner honesty | Separate host vs Docker tables |
| C3 | Publishable timing | PERF protocol; `tool` on every number |

## Do not claim

- Full-catalog (115) upstream correctness
- Host green ⇒ Docker / QEMU / silicon green
- Wall-clock or QEMU ⇒ hardware performance counters
- Production 1.0 support

## Timing

Without `csperf`, AppFarm writes wall-clock samples tagged `tool: csfarm`. With [CompilerSutraPerf](/docs/project/compilersutra-perf/), recipes may hand off real counter collection — only then claim hardware counters.
