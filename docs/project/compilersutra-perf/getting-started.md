---
title: "Getting started"
description: "Install compilersutra-perf and run your first CPU or GPU workload with csperf."
displayed_sidebar: csperfSidebar
keywords:
  - csperf tutorial
  - compilersutra-perf install
---

# Getting started

Short path to a first JSON with **CompilerSutraPerf**. Full walkthrough: [Tutorial](/docs/project/compilersutra-perf/tutorial/). Aligned with **[0.3.0](/docs/project/compilersutra-perf/releases/0.3.0/)**. Package: [PyPI: `compilersutra-perf`](https://pypi.org/project/compilersutra-perf/).

## 1. Install

```python
pip install compilersutra-perf
pip install 'compilersutra-perf[excel,pdf,visualize]'
csperf doctor
csperf quickstart --output-dir results/quickstart
```

`quickstart` = doctor + bundled CPU example + profile summary + HTML report (when available).

```python
csperf doctor --install
csperf doctor --install --all
```

Need **Python 3.11+**. Prefer a venv. YAML policy files need `pip install pyyaml`.

### Editable install (if you have a local tree)

```python
# local checkout of the package sources
cd /path/to/compilersutra-perf
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev,pdf,visualize]'
csperf doctor
csperf quickstart
```

Prefer the published package when possible: [PyPI: `compilersutra-perf`](https://pypi.org/project/compilersutra-perf/).

Native runners build on first use, or:

```python
cmake -S native/runtime -B build/native && cmake --build build/native
```

## 2. Energy and reports (optional)

```python
csperf list-energy-backends
csperf run --input examples/cpp/matrix_traversal.cpp --backend cpu \
  --energy-backend amd-cpu --output results/cpu-energy.json
csperf list-report-formats
csperf visualize results/cpu-energy.json --format both --output results/report
```

Opt-level sweep with comparison report:

```python
csperf run --input examples/cpp/matrix_traversal.cpp \
  --diff-optimize --no-perf --report-format both
# → results/optimize/*.json + optimize_report.html
```

Details: [Energy & reports](/docs/project/compilersutra-perf/energy-and-reports/).

## 3. List devices

```python
csperf list-devices --backend gpu
csperf gpuinfo
csperf deviceinfo

csperf list-devices --backend cpu
csperf list-devices --backend hip
csperf list-devices --backend opencl
csperf list-devices --backend vulkan
csperf list-devices --backend opencl --vendor amd
```

Use the reported `device_index` for GPU runs.  
Note: `csperf list-devices --backend` **without a value** is invalid.

### Policy config (optional)

```json
{
  "vendor": "amd",
  "opencl": { "device_policy": "vendor" },
  "vulkan": { "queue_policy": "compute", "library_policy": "default" }
}
```

```python
csperf run --input path/to/kernel.cl --backend opencl \
  --policy-config configs/policy_config.sample.json \
  --device-index 0 --output results/my-opencl.json
```

CLI flags override the policy file.

## 4. Run your C / C++ file

```python
csperf run --input path/to/my_benchmark.cpp --backend cpu \
  --warmup-runs 1 --repeat-runs 3 --output results/my-cpp.json

csperf profile results/my-cpp.json
```

Pin a core (Linux):

```python
csperf run --input path/to/my_benchmark.cpp --backend cpu \
  --cpu-affinity 0 --warmup-runs 1 --repeat-runs 5 \
  --output results/my-cpp.json
```

JSON records `execution.host_platform` (`linux` / `macos`) and `execution.metrics_availability`.

Defaults without overrides: `--warmup-runs 3`, `--repeat-runs 15`.

## 5. macOS CPU (experimental)

```python
csperf cpuinfo
csperf run --input path/to/program.cpp --backend cpu --no-perf \
  --output results/macos-cpu.json
```

`powermetrics` needs passwordless `sudo` and is **not** the same process as timed trials. `--cpu-affinity` is rejected on macOS. Metal is not implemented. See [Methodology](/docs/project/compilersutra-perf/methodology/).

## 6. GPU workloads

**HIP**

```python
csperf run --input path/to/my_kernel.hip --backend hip \
  --device-index 0 --warmup-runs 1 --repeat-runs 3 \
  --output results/my-hip.json
```

**OpenCL** (simple)

```python
csperf run --input path/to/my_kernel.cl --backend opencl \
  --device-index 0 --warmup-runs 1 --repeat-runs 3 \
  --output results/my-opencl.json
```

**OpenCL** (explicit args)

```python
csperf run \
  --input path/to/my_kernel.cl \
  --backend opencl \
  --device-index 0 \
  --kernel-name my_kernel \
  --global-size 4096 \
  --local-size 64 \
  --kernel-arg buffer:float:read:4096:1.0 \
  --kernel-arg buffer:float:write:4096:0.0 \
  --readback-arg 1 \
  --output results/my-opencl.json
```

**Vulkan** — prefers CompilerSutraRun (`csrun`) execute when available; without `csrun`, compile + validate only (`status: partial`):

```python
csperf run --input path/to/my_shader.comp --backend vulkan \
  --device-index 0 --output results/my-vulkan.json
```

## 7. Compare CPU vs GPU results

```python
csperf visualize results/my-cpu.json results/my-hip.json \
  --output results/my-cpu-vs-gpu.html
csperf dashboard results/my-cpu.json results/my-hip.json
```

Only compare matched workloads.

## Recommended workflow

1. Small input that compiles quickly  
2. One backend first → save JSON  
3. Change compiler, flags, or device  
4. Compare with `profile` / `diff` / `visualize`  
5. Read [Methodology](/docs/project/compilersutra-perf/methodology/) before publishing  

## Common mistakes

- `list-devices --backend` with no value  
- Inactive venv on a source checkout  
- Treating unmatched CPU/GPU runs as equivalent  
- Expecting Vulkan validation = full kernel benchmark  
- Assuming `device-index 0` is the same GPU on every backend  
- Treating package RAPL joules as per-process energy  

## Success checklist

- [ ] `doctor` / `quickstart` OK  
- [ ] Your own `results/*.json` exists  
- [ ] `csperf profile` shows timing  

## Next

| Goal | Page |
| --- | --- |
| Flags, manifests, profilers | [Usage](/docs/project/compilersutra-perf/usage/) |
| Trust numbers | [Methodology](/docs/project/compilersutra-perf/methodology/) |
| Research vision | [Observatory](/docs/project/compilersutra-perf/observatory/) |
| Failures | [Troubleshooting](/docs/project/compilersutra-perf/troubleshooting/) |
