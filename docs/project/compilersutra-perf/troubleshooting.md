---
title: "Troubleshooting"
description: "Fix common compilersutra-perf failures: doctor, perf, RAPL, GPU, WSL2."
displayed_sidebar: csperfSidebar
keywords:
  - csperf troubleshooting
  - perf symbol lookup
---

# Troubleshooting

Common first-run issues for **CompilerSutraPerf** 0.3.0 ([PyPI: `compilersutra-perf`](https://pypi.org/project/compilersutra-perf/)).

## First check

```python
csperf doctor
csperf quickstart --output-dir results/quickstart
csperf doctor --install
```

`quickstart` = doctor + example + profile + HTML report.

## `perf` symbol lookup (Ubuntu / AMD)

**Symptom:** `LLVMInitializeVETargetMC` or `symbol lookup error`.

```python
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}
csperf doctor
```

On aarch64 use `/usr/lib/aarch64-linux-gnu`.

Or:

```python
csperf run --input program.cpp --backend cpu --cpu-profiler papi
```

## RAPL / energy unavailable

```python
sudo sysctl kernel.perf_event_paranoid=-1
csperf list-energy-backends
```

Wall time only:

```python
csperf run --input program.cpp --backend cpu --no-perf --no-energy
```

Energy is separate from `--no-perf` — use `--no-energy` when you only want timing.

## No OpenCL / HIP devices

```python
csperf list-devices --backend gpu
csperf doctor --all
```

CPU-only work does not need GPU packages.

## Compile vs run timeout

`--execution-timeout` bounds **workload execution**, not compilation (compile keeps a ~60s floor).

## PDF missing

```python
pip install 'compilersutra-perf[pdf]'
csperf list-report-formats
```

## Windows

Native Windows is unsupported. Use **WSL2**, install Python 3.11+ and a toolchain there, then `pip install compilersutra-perf`. Open JSON/HTML on Windows if you want.

## macOS

- `--no-perf` for CPU timing  
- powermetrics needs passwordless `sudo`  
- `--cpu-affinity` rejected  
- Metal not implemented  

## Still stuck?

1. `csperf --version` / `pip show compilersutra-perf`  
2. Re-run `doctor`  
3. Check `execution.perf_error`, `profiling_status`, `metrics_availability`  
4. [Methodology](/docs/project/compilersutra-perf/methodology/)  

## See also

- [Getting started](/docs/project/compilersutra-perf/getting-started/)  
- [Energy & reports](/docs/project/compilersutra-perf/energy-and-reports/)  
- [Usage](/docs/project/compilersutra-perf/usage/)  
