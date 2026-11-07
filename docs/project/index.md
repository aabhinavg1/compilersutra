---
title: "Projects"
description: "Catalogue of CompilerSutra projects — tools, LLVM labs, C++ ideas, and automation workspaces."
displayed_sidebar: projectSidebar
keywords:
  - CompilerSutra projects
  - project catalogue
  - CompilerSutraPerf
  - CompilerSutra AppFarm
  - csfarm
  - LLVM projects
  - VELOX
  - C++ project ideas
  - Python automation
---

# Projects

This is the **project catalogue**. Each entry below is a separate workspace with its own docs. Use this page to pick a project; do not dump new material into one shared file.

:::tip How this section grows
Add a new row to the catalogue when you start a project. Keep long write-ups under that project's folder (`docs/project/<name>/`), not on this page.
:::

## Project Catalogue

| Project | What it is | Status | Start here |
| --- | --- | --- | --- |
| [CompilerSutraPerf](/docs/project/compilersutra-perf/) | `csperf` — release-first docs; compile, run, profile, compare · [PyPI](https://pypi.org/project/compilersutra-perf/) | Active · Alpha 0.2.0 | [0.2.0 release](/docs/project/compilersutra-perf/releases/0.2.0/) |
| [CompilerSutra AppFarm](/docs/project/compilersutra-appfarm/) | `csfarm` — typed OSS app farm; fetch → build → test → measure for toolchain/flag regressions | Active · Alpha 0.1.2 | [Getting started](/docs/project/compilersutra-appfarm/getting-started/) |
| [LLVM Projects](./llvm/) | Guided LLVM labs, starting with the VELOX compiler | Active | [VELOX](./llvm/VELOX/) |
| [C++ Project Ideas](./cpp-project-ideas) | Domain-specific C++ project ideas by skill level | Reference | [Browse ideas](./cpp-project-ideas) |
| [Python Automation](./python_automation/python_automation) | Automation scripts and productivity projects | Active | [Python Automation](./python_automation/python_automation) |

## Featured Projects

### CompilerSutraPerf

Performance experimentation CLI (**CompilerSutraPerf** / `csperf`) for C/C++, HIP, OpenCL, and Vulkan — with an observatory roadmap for honest compiler research.

- Install from PyPI, profile with Linux `perf`, export JSON/HTML reports
- Hub: [CompilerSutraPerf](/docs/project/compilersutra-perf/) · [0.2.0](/docs/project/compilersutra-perf/releases/0.2.0/) · [Tutorial](/docs/project/compilersutra-perf/tutorial/) · [Observatory](/docs/project/compilersutra-perf/observatory/)
- Package: [PyPI — `compilersutra-perf`](https://pypi.org/project/compilersutra-perf/)

### CompilerSutra AppFarm

Open typed **application farm** (`csfarm`) for compiler and flag regression testing — pick an app/version, compose overlays, then fetch → build → test → measure.

- Trust the **tier-1** core; do not claim the full catalog as validated
- Hub: [CompilerSutra AppFarm](/docs/project/compilersutra-appfarm/) · [Tutorial](/docs/project/compilersutra-appfarm/tutorial/) · [Claims](/docs/project/compilersutra-appfarm/methodology/)
- Repo: [github.com/compilersutra/CompilerSutraAppFarm](https://github.com/compilersutra/CompilerSutraAppFarm) (`v0.1.2`)
- Pairs with [CompilerSutraPerf](/docs/project/compilersutra-perf/) when you need real counters

### LLVM Projects

Build real compiler pipelines on LLVM — frontend → IR → optimize → backend → QEMU.

- Featured series: [VELOX](./llvm/VELOX/)
- Hub: [LLVM Projects](./llvm/)

### C++ Project Ideas

Large list of beginner → advanced C++ project ideas across systems, AI, games, networking, and compilers.

- [C++ Project Ideas](./cpp-project-ideas)

### Python Automation

Automation-focused projects and walkthroughs.

- [Python Automation](./python_automation/python_automation)
- Example: [System Specs Collector](./python_automation/automate_boring_stuff/system-specs-collector/system_spec_collector)

## Related Hubs (not projects)

These live outside `/docs/project/` but are often used with the work above:

| Hub | Link |
| --- | --- |
| Articles | [Articles catalogue](/docs/articles) |
| Labs | [Labs](/docs/labs) |
| Tools | [Tools](/docs/tools) |

## Adding a New Project

1. Create `docs/project/<slug>/index.md` (hub page).
2. Add a row to the **Project Catalogue** table on this page.
3. Register the hub in `sidebars/site.js` under `projectSidebar` (and a dedicated sidebar if the project has many pages).
4. Keep article-length content in that folder — not on this catalogue page.
