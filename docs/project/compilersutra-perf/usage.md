---
title: "Usage"
description: "How-to guides and CLI reference for CompilerSutraPerf (csperf) 0.3.0."
displayed_sidebar: csperfSidebar
keywords:
  - csperf CLI
  - compiler comparison
  - workload manifest
---

# Usage

Task recipes and flags for **CompilerSutraPerf** **0.3.0** ([PyPI](https://pypi.org/project/compilersutra-perf/)). First install: [Getting started](/docs/project/compilersutra-perf/getting-started/) · [Tutorial](/docs/project/compilersutra-perf/tutorial/).

## Support level (summary)

- **CPU:** Python orchestrates compile; native C++ runner executes; optional Linux `perf` / PAPI  
- **`--backend gpu`:** `.hip` → HIP, `.cl` → OpenCL, shaders → Vulkan  
- **HIP:** `hipcc` + ROCm; rocprofv3 → v2 → v1; `kernel_time_ms` ≠ `hip_profiler_*`  
- **OpenCL:** build, launch, argument binding, warmup/repeat  
- **Vulkan:** prefers `csrun` execute when available; else GLSL → SPIR-V + shader-module validate (`partial`)  
- **CUDA / Metal:** planned, not executable  
- **macOS CPU:** experimental; use `--no-perf`; powermetrics needs passwordless `sudo`  


## How do I…

### …run a CPU workload

```python
csperf run --input program.cpp --backend cpu \
  --warmup-runs 1 --repeat-runs 5 --output results/cpu.json
csperf profile results/cpu.json
```

### …choose a compiler

Order: `CXX_COMPILER` / `C_COMPILER` → `CXX` / `CC` → default `clang++` / `clang`.  
HIP always uses `hipcc` when available. **`CXXFLAGS` / `CFLAGS` are not read.**

```python
csperf run --input program.cpp --compiler g++ --output results/gcc.json
CC=gcc CXX=g++ csperf run --input program.cpp --output results/gcc-env.json
CXX=g++-13 csperf run --input program.cpp --output results/gpp13.json
```

### …pass flags

`-O3` is default unless you pass another `-O*`:

```python
csperf run --input program.cpp --backend cpu \
  --compiler-flag=-march=native \
  --compiler-flag=-funroll-loops \
  --output results/optimized.json
```

### …compare two compilers

```python
csperf run --input program.cpp --compiler g++ --output results/gcc.json
csperf run --input program.cpp --compiler clang++ --output results/clang.json
csperf diff results/gcc.json results/clang.json \
  --csv results/gcc-vs-clang.csv \
  --derived-config configs/derived_metrics.sample.json
```

### …sweep `-O0`…`-O3`

```python
csperf run --input examples/cpp/matrix_traversal.cpp \
  --diff-optimize --no-perf --report-format both
```

### …use a manifest

```json
{
  "schema_version": 1,
  "source": "solver.cpp",
  "backend": "cpu",
  "compiler": "g++",
  "compiler_flags": ["-O3", "-march=native"],
  "program_args": ["--iterations", "1000000"],
  "stdin_file": "input.txt",
  "execution_timeout_s": 30,
  "warmup_runs": 1,
  "repeat_runs": 5,
  "use_perf": true,
  "use_energy": true,
  "energy_backends": "auto"
}
```

```python
csperf run --manifest workloads/solver.json --output results/solver.json
```

### …pick a CPU profiler

```python
csperf run --input program.cpp --backend cpu --cpu-profiler auto
csperf run --input program.cpp --backend cpu --cpu-profiler perf
csperf run --input program.cpp --backend cpu --cpu-profiler papi
csperf run --input program.cpp --backend cpu --cpu-profiler papi-native
```

| Mode | Notes |
| --- | --- |
| `auto` | `perf` first; fall back to PAPI if broken |
| `perf` | Prefer for same-execution counters |
| `papi` | Often separate execution |
| `papi-native` | Same-execution when runner built with PAPI |
| `--no-perf` | Disables all hardware counters |

### …run OpenCL / HIP / Vulkan

```python
csperf run --input examples/opencl/saxpy.cl --backend opencl --device-index 0 \
  --kernel-name saxpy \
  --kernel-arg buffer:float:read:4096:1.0 \
  --kernel-arg scalar:uint32:4096 \
  --readback-arg 2

csperf run --input kernel.hip --backend hip --device-index 0 --output results/hip.json

csperf run --input examples/shaders/vector_add.comp --backend vulkan \
  --device-index 0 --output results/vulkan.json
```

State `--opencl-measure` (`setup` / `steady_state` / `end_to_end`) when publishing OpenCL times.

### …inspect without executing

```python
csperf run --input program.cpp --backend cpu --plan-only
```

### …list hardware

```python
csperf list-backends
csperf list-experiments
csperf list-energy-backends
csperf list-report-formats
csperf cpuinfo
csperf gpuinfo
csperf deviceinfo
csperf list-devices --backend gpu
```

## CLI cheat sheet

| Flag | Purpose |
| --- | --- |
| `--warmup-runs N` | default `3` |
| `--repeat-runs N` | default `15` |
| `--no-perf` | skip hardware counters |
| `--plan-only` | print commands only |
| `--build-dir PATH` | binary / IR output dir |
| `--cpu-affinity 0,1` | Linux only |
| `--device-index N` | GPU device |
| `--backend gpu` | auto-select by file type |
| `--compiler=PATH` | CPU compiler |
| `--compiler-flag=FLAG` | repeatable |
| `--program-arg ARG` | workload argv |
| `--stdin-file PATH` | workload stdin |
| `--execution-timeout SECONDS` | bounds **run**, not compile |
| `--diff-optimize` | `-O0`…`-O3` + report |
| `--energy` / `--no-energy` | energy on by default when available |
| `--energy-backend KEY` | `auto`, `amd-cpu`, `amd-gpu`, … |
| `--cpu-profiler` | `auto` \| `perf` \| `papi` \| `papi-native` |
| `--json` | machine-readable stdout |
| `--version` | package version |

## Experiments

```python
csperf list-experiments
csperf run --input examples/cpp/matrix_traversal.cpp --experiment row-major
csperf run --input examples/cpp/tiled_matmul.cpp --experiment tiled --tile-size 32
```

Macros: `row-major` → `-DCSPERF_ROW_MAJOR=1`, `column-major` → `-DCSPERF_COLUMN_MAJOR=1`, `tiled` → `-DCSPERF_TILE_SIZE=N`.

## Result files

Each run writes `results/<name>.json` and `.csv` (`.xlsx` with `[excel]`).

Stable sections: `pipeline`, `commands`, `hardware`, `metrics`, `execution`, `artifacts`, optional `power`.  
Metadata: `schema_version`, `tool_version`, `generated_at_utc`.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | `executed`, `partial`, or `planned` |
| `1` | failed / fatal |
| `2` | usage error |

Incomplete counters can still exit `0` — check `execution.profiling_status` and `metrics_availability`.

## Batch compiler folder diff

With a local checkout that includes the script:

```python
python scripts/compiler_diff_batch.py examples/cpp \
  --config1 configs/compiler_gcc.sample.json \
  --config2 configs/compiler_clang.sample.json
```

## Next

- [Methodology](/docs/project/compilersutra-perf/methodology/)  
- [Observatory](/docs/project/compilersutra-perf/observatory/)  
- [Energy & reports](/docs/project/compilersutra-perf/energy-and-reports/)  
- [Troubleshooting](/docs/project/compilersutra-perf/troubleshooting/)  
