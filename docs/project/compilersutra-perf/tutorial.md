---
title: "Tutorial"
sidebar_label: "Tutorial"
description: "Demonstrate CompilerSutraPerf through example runs — compile, count, and read structured results on Linux-first workflows."
displayed_sidebar: csperfSidebar
keywords:
  - csperf tutorial
  - perfwiki
  - perf stat
  - compilersutra-perf
---

# Tutorial

CompilerSutraPerf is a performance experimentation tool for Linux-first workflows that abstracts compile, run, and profile steps for C/C++ programs and GPU kernels (OpenCL, HIP, Vulkan shaders) behind a simple command-line interface. It orchestrates existing toolchains (Clang, GCC, hipcc, and others) and, on Linux, builds on the kernel `perf_events` interface via `perf` (with optional PAPI fallback) so hardware differences are handled by the same counting path you would use with `perf stat`. The CLI entry point is `csperf` ([PyPI: `compilersutra-perf`](https://pypi.org/project/compilersutra-perf/)). This article demonstrates CompilerSutraPerf through example runs. Commands target the **0.3.0** Alpha line (`pip install 'compilersutra-perf==0.3.0'`). For readability, some output and paths are abbreviated with ellipsis (`[...]`).

:::note Prerequisites
- Linux recommended (CPU + `perf` path)  
- Python 3.11+  
- Release notes: [0.3.0](/docs/project/compilersutra-perf/releases/0.3.0/)  
:::

```python
pip install 'compilersutra-perf==0.3.0'
csperf doctor
```

---

## Introduction

CompilerSutraPerf accepts a source file, selects a backend, plans or executes a compile-and-run pipeline, and writes structured JSON/CSV artifacts (optional HTML/PDF reports). On the CPU path it is not a separate profiler implementation: timed trials go through a native runner, and hardware counts are collected with Linux `perf` when available. The CLI (`csperf`) is subcommand-based, reminiscent of `git` and of `perf` itself: one tool, several commands (`run`, `profile`, `diff`, …).

It does not replace vendor compilers or `perf`. It sequences them and records provenance so later comparisons know what was measured.

---

## Commands

List what your install knows:

```python
csperf --help
csperf list-backends
```

The commands you will use most in this tutorial:

| Command | Role (perfwiki analogue) |
| --- | --- |
| `doctor` | Sanity check tools (`perf`, compilers, …) |
| `quickstart` | One-shot smoke: doctor + example + report |
| `run` | Compile + execute + optional counters (**like `perf stat`**) |
| `profile` | Summarize a saved JSON |
| `diff` | Compare two result files (**like comparing two `perf` runs**) |
| `visualize` | HTML/PDF report from JSON |
| `list-devices` | What CPU/GPU targets exist |
| `list-energy-backends` | What power collectors are available |
| `list-experiments` | Built-in compile-macro experiments |

Get help for one command the same way as `perf stat -h`:

```python
csperf run --help
```

---

## Events

Before measuring, know **what** you are counting. The perfwiki tutorial splits events into sources; `csperf` inherits the same ideas when it wraps `perf`.

| Kind | Meaning | Examples |
| --- | --- | --- |
| **Software** | Kernel counters | context-switches, page-faults |
| **Hardware / PMU** | CPU Performance Monitoring Unit | cycles, instructions, branch-misses |
| **Generic names** | Portable aliases mapped to a real PMU event *if present* | `cycles`, `instructions`, `branches` |
| **Energy / power** | Package or device power domains | RAPL `power/energy-pkg/`, `rocm-smi` |

Common hardware names you will see:

| Event | Tutorial meaning |
| --- | --- |
| `cycles` | Total cycles (frequency scaling can confuse interpretation) |
| `ref-cycles` | Cycles not affected by frequency scaling |
| `instructions` | Retired instructions |
| `branches` | Retired branches |
| `branch-misses` | Mispredicted branches |
| `cache-references` / `cache-misses` | Usually LLC-oriented; use as a pair for miss rate |

Derived metrics (like the `# IPC` line in `perf stat`) include **IPC** and **branch-miss rate**. `csperf profile` surfaces those when the artifact has the raw counts.

:::caution
Hardware events are **CPU-specific**. A name that works on one machine may be unavailable or mapped differently on another. Always check `execution.metrics_availability` / `profiling_status` in the JSON.
:::

---

## Counting with `csperf run`

In counting mode, `perf` aggregates events over a run and prints them at the end (`perf stat`). `csperf run` does the same idea, but also **compiles** first and writes JSON.

### 1. Smoke path (no thinking required)

```python
csperf quickstart --output-dir results/quickstart
```

This runs `doctor`, a bundled CPU example, a profile summary, and (when possible) an HTML report. If this fails, fix the environment before continuing ([Troubleshooting](/docs/project/compilersutra-perf/troubleshooting/)).

### 2. Your first timed run

```python
csperf run --input examples/cpp/matrix_traversal.cpp --backend cpu \
  --warmup-runs 1 --repeat-runs 3 \
  --output results/cpu.json

csperf profile results/cpu.json
```

What you should look for (same discipline as reading `perf stat` output):

1. **Did it execute?** — status / trial results  
2. **How long?** — `metrics.execution_time_ms`  
3. **Were counters collected?** — `execution.profiling_status`, `metrics_availability`  
4. **Same process as the timer?** — `execution.measurement.same_execution`  
5. **Can I reproduce?** — `commands`, compiler flags, `tool_version`, `hardware`

### 3. Time only (no counters)

Like `perf stat -n` (null run) in spirit — skip hardware counters:

```python
csperf run --input examples/cpp/matrix_traversal.cpp --backend cpu \
  --no-perf --no-energy \
  --warmup-runs 1 --repeat-runs 3 \
  --output results/time-only.json
```

Use this when `perf` is blocked or you only care about wall time.

### 4. Pin a CPU (reduce noise)

`perf` can restrict CPUs with `-C`. On Linux, pin the workload:

```python
csperf run --input examples/cpp/matrix_traversal.cpp --backend cpu \
  --cpu-affinity 0 \
  --warmup-runs 1 --repeat-runs 5 \
  --output results/cpu-pinned.json
```

`--cpu-affinity` is **Linux-only** (rejected on macOS).

---

## Options that control what you measure

### Compiler and flags

Default CPU compiler is `clang++` / `clang` unless overridden. **`CXXFLAGS` is not read.**

```python
csperf run --input program.cpp --compiler g++ --output results/gcc.json
csperf run --input program.cpp --compiler clang++ --output results/clang.json

csperf run --input program.cpp \
  --compiler-flag=-O2 \
  --compiler-flag=-march=native \
  --output results/o2.json
```

Default optimization is `-O3` unless you pass another `-O*`.

### Profiler choice

```python
csperf run --input program.cpp --backend cpu --cpu-profiler auto
csperf run --input program.cpp --backend cpu --cpu-profiler perf
csperf run --input program.cpp --backend cpu --cpu-profiler papi
```

| Mode | Notes |
| --- | --- |
| `auto` | Try `perf`, fall back to PAPI if broken |
| `perf` | Prefer for same-execution Linux counters |
| `papi` / `papi-native` | Alternate paths — see [Methodology](/docs/project/compilersutra-perf/methodology/) |
| `--no-perf` | Disable all hardware counters |

### Energy (optional, independent of `perf`)

```python
csperf list-energy-backends
csperf run --input examples/cpp/matrix_traversal.cpp --backend cpu \
  --energy-backend amd-cpu --output results/cpu-energy.json
csperf run --input program.cpp --backend cpu --no-energy
```

Package RAPL energy is **not** per-process joules. Details: [Energy & reports](/docs/project/compilersutra-perf/energy-and-reports/).

### See the plan without running

```python
csperf run --input program.cpp --backend cpu --plan-only
```

---

## Multiplexing and “is this count real?”

The perfwiki tutorial emphasizes: if you ask for **more events than hardware counters**, the kernel **multiplexes** and later **scales** counts:

```text
final_count ≈ raw_count × (time_enabled / time_running)
```

That is an **estimate**. `csperf` inherits this when it asks `perf` for many events.

Rules of thumb (same as perfwiki):

1. Prefer a **small** event set for a claim (e.g. branches + branch-misses).  
2. Prefer `same_execution: true` in the JSON.  
3. Use enough repeats to see variance.  
4. Never mix `perf` counters with PAPI / powermetrics as if they were one series.

Full write-up: [Methodology](/docs/project/compilersutra-perf/methodology/).

---

## Repeated measurement

`perf stat -r 5` runs the workload several times and reports mean ± spread. In `csperf`:

```python
csperf run --input examples/cpp/matrix_traversal.cpp --backend cpu \
  --warmup-runs 1 --repeat-runs 5 \
  --output results/cpu-r5.json
csperf profile results/cpu-r5.json
```

- **Warmup** trials are discarded from the primary timing summary.  
- **Repeat** trials populate `execution.trial_results` and summary stats (min / mean / …).  

Defaults without overrides are higher (`warmup-runs 3`, `repeat-runs 15`). Start small while learning.

### Opt-level sweep (built-in)

```python
csperf run --input examples/cpp/matrix_traversal.cpp \
  --diff-optimize --no-perf --report-format both
```

Runs `-O0`…`-O3`, writes per-level results under `results/optimize/`, and a comparison report.

---

## Compare two runs

Like looking at two `perf` experiments side by side:

```python
csperf run --input program.cpp --compiler g++ --output results/gcc.json
csperf run --input program.cpp --compiler clang++ --output results/clang.json
csperf diff results/gcc.json results/clang.json --csv results/gcc-vs-clang.csv
```

`diff` warns when profiler sources or availability differ. Empty or skipped metrics are better than fake zeros.

---

## GPU path (short)

Same command shape; different middle step:

```python
csperf list-devices --backend gpu

csperf run --input path/to/kernel.hip --backend hip \
  --device-index 0 --warmup-runs 1 --repeat-runs 3 \
  --output results/hip.json
```

| Backend | Today |
| --- | --- |
| HIP / OpenCL | Experimental execute |
| Vulkan | Validate shader only (`status: partial`) — **not** a full kernel benchmark |

Do not compare unmatched CPU vs GPU workloads.

---

## How to read a result file

Open `results/cpu.json` (or use `csperf profile`) and ask, in order:

| Question | Field |
| --- | --- |
| How long? | `metrics.execution_time_ms` |
| Trial spread? | `execution.trial_results` |
| Same-exec counters? | `execution.measurement.same_execution` |
| What was counted? | metrics + `perf_source` |
| Why missing? | `execution.perf_error`, `profiling_status`, `metrics_availability` |
| Reproduce? | `commands`, flags, `hardware`, `tool_version` |

That is the same habit as reading a `perf stat` block: elapsed time → counts → derived ratios → caveats.

---

## Common mistakes

| Mistake | Fix |
| --- | --- |
| `list-devices --backend` with no value | Always pass `cpu` / `gpu` / `hip` / … |
| Treating scaled / separate-execution counts as continuous same-exec truth | Check `same_execution` |
| Publishing OpenCL times without `--opencl-measure` | State the measure mode |
| Vulkan “success” as a speedup | Validation ≠ dispatch |
| Assuming `device-index 0` is the same GPU everywhere | Re-list per backend |
| Package RAPL as “this binary used X J” | Package ≠ process |

---

## Checklist

- [ ] `csperf doctor` / `quickstart` OK  
- [ ] One own `results/*.json` from `csperf run`  
- [ ] You can explain wall time vs counters in that file  
- [ ] You checked `same_execution` before quoting branch/cache numbers  
- [ ] You used repeats (or `--diff-optimize`) before claiming a compiler win  

---

## Next

| Goal | Page |
| --- | --- |
| Flag reference | [Usage](/docs/project/compilersutra-perf/usage/) |
| Events, scaling, publish rules | [Methodology](/docs/project/compilersutra-perf/methodology/) |
| Layers / phases | [Architecture](/docs/project/compilersutra-perf/architecture/) |
| Research vision | [Observatory](/docs/project/compilersutra-perf/observatory/) |
| Failures | [Troubleshooting](/docs/project/compilersutra-perf/troubleshooting/) |
| External deep dive | [perfwiki tutorial](https://perfwiki.github.io/main/tutorial/) |
