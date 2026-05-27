---
title: "ANN Bottleneck Analysis on AMD CPUs"
description: "A measured report on HNSW, FAISS Flat, and FAISS IVF bottlenecks on an AMD Ryzen 7 9700X system."
displayed_sidebar: benchmarkingSidebar
keywords:

  - ann benchmark amd cpu
  - hnsw benchmark
  - faiss benchmark
  - perf profiling linux
  - cache bottleneck analysis
  - ipc analysis amd
  - approximate nearest neighbor performance
  - amd zen 5 architecture
  - ryzen 7 9700x cache hierarchy
  - memory bandwidth bottleneck
  - tlb miss rate
  - load-to-store forwarding
  - simd utilization
  - avx2 avx-512
  - front-end stalls
  - back-end stalls
  - hnsw graph traversal overhead
  - faiss flat o(n) scaling
  - ivf nprobe tuning
  - recall-speed tradeoff
  - quantization effects pq sq
  - distance computation l2 inner product
  - perf stat cycles instructions ipc
  - perf top
  - perf record call graph
  - llc last level cache miss ratio
  - branch misprediction rate
  - cpu frequency scaling p-states
  - numa effects
  - memory-bound compute-bound classification
  - single-threaded multi-threaded scaling
---

# ANN Bottleneck Analysis on AMD CPUs

## Table of Contents

- [Introduction](#introduction)
- [TL;DR - What this benchmark found](#tldr---what-this-benchmark-found)
- [Methodology](#methodology)
- [Workload Shape and Microarchitecture](#workload-shape-and-microarchitecture)
- [Zen 5 Specific Notes](#zen-5-specific-notes)
- [Reference Frame](#reference-frame)
- [Benchmark Setup](#benchmark-setup)
- [Results](#results)
- [Repeatability](#repeatability)
- [Parameter Sweep](#parameter-sweep)
- [HNSW Analysis](#hnsw-analysis)
- [FAISS Flat Analysis](#faiss-flat-analysis)
- [FAISS IVF Analysis](#faiss-ivf-analysis)
- [Cross-cutting Notes](#cross-cutting-notes)
- [Potential Optimizations](#potential-optimizations)
- [Caveats](#caveats)
- [Final Takeaway](#final-takeaway)
- [References](#references)

## Introduction

ANN means approximate nearest neighbor search: return the closest vectors without checking every candidate exactly. On this AMD Ryzen 7 9700X, the search shape matters as much as the distance math.

This article compares three cases:

- HNSW, which walks a graph
- FAISS Flat, which scans everything exactly
- FAISS IVF, which prunes the search first and then scans fewer candidates

These workloads stress the CPU in different ways: HNSW is branchy, Flat is regular, and IVF sits between the two.

## TL;DR - What this benchmark found

Based on the latest exact perf run on an AMD Ryzen 7 9700X:

| Category | Finding |
| --- | --- |
| HNSW | Branchy graph traversal plus queue work dominated the profile. `perf` showed `8.75%` branch misses and `perf report` centered on `searchBaseLayer` and priority-queue operations. |
| FAISS Flat | The exact scan path stayed the cleanest control-flow case. It showed `4.79` IPC and spent most of its time in the distance kernel. |
| FAISS IVF | The approximate scan stayed close to HNSW on the latest perf run and landed at `112,921 qps` with `0.857` recall at `nprobe=8`. |
| Main lesson | ANN performance on this CPU is determined by search structure. HNSW is branch-heavy, Flat is compute-dense, and IVF is the approximate path that needs repeatability checks before any broad speed claim.[^perf-zen] |



## Methodology

The benchmark is split into three parts:

- measured results: `perf stat`, `perf report`, timing, recall, and disassembly
- interpretation: what the counters say about branches, cache, and SIMD
- next steps: what to test if the bottleneck needs to move

The main point is simple: faster query time does not always mean better CPU use. The search structure itself decides a lot of the outcome.

## Workload Shape and Microarchitecture

ANN workloads mix branching, pointer chasing, and tight arithmetic loops, but the three cases stress the core differently:

- HNSW walks a graph, so each step depends on the last one and the front end has to recover from more control-flow churn.
- FAISS Flat scans every vector, so the loop is regular, predictable, and able to keep the core busy.
- FAISS IVF prunes first, then scans a smaller set, so it keeps some orchestration overhead while still feeding the backend useful work.

That is why the counters split the way they do. HNSW is branch-heavy and queue-heavy, Flat is compute-dense, and IVF sits in the middle. Branch prediction, cache behavior, SIMD execution, and memory locality all matter, but they matter in different proportions for each workload.

## Zen 5 Specific Notes

The Ryzen 7 9700X is a Zen 5 part, so the core is wide enough that regular scans can look very good once the compiler gives it a clean loop. That matters here because Flat and the dense parts of IVF can keep the machine busy, while HNSW spends more time on dependent loads and branch decisions.

A practical reading of Zen 5 in this report is:

- sequential or clustered access patterns tend to benefit from the hardware prefetchers
- pointer-heavy graph traversal is much less predictable for the front end
- generic `perf stat` events should be treated as directional evidence, not as a perfect hardware oracle

The takeaway is simple: the chip rewards stable control flow and contiguous access, which is exactly why the Flat result looks so clean and the HNSW result looks so noisy.

## Reference Frame

Three common ANN benchmark patterns are useful here:

- recall versus queries-per-second
- fixed setup and repeatable runs
- clear tradeoffs between recall, latency, and throughput

Those patterns keep the report focused on one question: what does each search setting buy, and what does it cost? In this article, that becomes a three-way comparison: HNSW shows the cost of traversal, Flat shows the cost of exactness, and IVF shows the cost of approximation.

## Benchmark Setup

The benchmark code lives in the ANN CPU bottleneck workspace.

The measurements were taken with the same CPU affinity and the same machine state for the run that produced the data in this report.

The report uses runtime, IPC, branch misses, cache misses, and `perf report` hotspots. Scope is narrow by design: one host, one dataset scale, one query shape, and three ANN implementations.

### Build and reproduce

The benchmark binaries in this report came from that workspace.

Use this flow to reproduce the run from the repository root.
The next subsection explains every command line by line so the setup is easy to follow even if you have not used this workspace before.

### Line-by-line walkthrough

1. Bootstrap the machine-specific prerequisites.

```bash
sudo apt update
sudo apt install -y   git cmake ninja-build build-essential   python3 python3-pip   zlib1g-dev libzstd-dev libxml2-dev libedit-dev   libncurses-dev swig   numactl linux-tools-common linux-tools-generic   libomp-dev   libopenblas-dev   liblapack-dev

mkdir -p benchmarks results perf asm mca flamegraph src build external

cat > env.sh <<'EOF'
#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export ANN_ROOT="$SCRIPT_DIR"

export LLVM_DIR="$ANN_ROOT/external/llvm-project"
export FAISS_DIR="$ANN_ROOT/external/faiss"
export HNSW_DIR="$ANN_ROOT/external/hnswlib"
export TOOLS_DIR="$ANN_ROOT/tools"
export OPENMP_DIR="$TOOLS_DIR/openmp"
export OPENMP_BUILD_DIR="$TOOLS_DIR/openmp-build"

export LLVM_BUILD_DIR="$LLVM_DIR/build"

export PATH="$LLVM_BUILD_DIR/bin:$PATH"

export CC=clang
export CXX=clang++

export PERF_DIR="$ANN_ROOT/perf"
export RESULT_DIR="$ANN_ROOT/results"
export ASM_DIR="$ANN_ROOT/asm"
export MCA_DIR="$ANN_ROOT/mca"
export FLAMEGRAPH_DIR="$ANN_ROOT/flamegraph"
EOF

source ./env.sh
```

Line by line:

- `sudo apt update`
  - refreshes the package index before installing dependencies
- `sudo apt install -y ...`
  - installs the Linux packages the benchmark expects on Ubuntu-style systems
  - includes the compiler, build, profiling, and BLAS/LAPACK dependencies used by the article
- `mkdir -p benchmarks results perf asm mca flamegraph src build external`
  - creates the workspace directories used by the benchmark pipeline
- `cat > env.sh <<'EOF' ... EOF`
  - writes the environment variables that point the benchmark at the local toolchain and output directories
- `source ./env.sh`
  - loads those environment variables into the current shell

The article records these exported values in `env.sh`:

- `ANN_ROOT`
- `LLVM_DIR`
- `FAISS_DIR`
- `HNSW_DIR`
- `OPENMP_DIR`
- the `clang` toolchain variables

2. Fetch and build the dependencies.

```bash
mkdir -p external
cd external

if [ ! -d "$LLVM_DIR" ]; then
  git clone https://github.com/llvm/llvm-project.git "$LLVM_DIR"
else
  git -C "$LLVM_DIR" pull --ff-only
fi

cmake -S "$LLVM_DIR/llvm" -B "$LLVM_DIR/build" -G Ninja   -DLLVM_ENABLE_PROJECTS="clang;lld;clang-tools-extra"   -DCMAKE_BUILD_TYPE=Release   -DLLVM_TARGETS_TO_BUILD="X86;AMDGPU"   -DLLVM_ENABLE_ASSERTIONS=ON
ninja -C "$LLVM_DIR/build" -j"$(nproc)"

mkdir -p "$TOOLS_DIR"
rm -rf "$OPENMP_BUILD_DIR" "$OPENMP_DIR"
cmake -S "$LLVM_DIR/runtimes" -B "$OPENMP_BUILD_DIR" -G Ninja   -DCMAKE_BUILD_TYPE=Release   -DCMAKE_INSTALL_PREFIX="$OPENMP_DIR"   -DLLVM_BINARY_DIR="$LLVM_DIR/build"   -DLLVM_ENABLE_RUNTIMES="openmp"   -DCMAKE_C_COMPILER="$LLVM_DIR/build/bin/clang"   -DCMAKE_CXX_COMPILER="$LLVM_DIR/build/bin/clang++"   -DOPENMP_ENABLE_LIBOMPTARGET=OFF   -DOPENMP_ENABLE_OMPT_TOOLS=OFF   -DLLVM_INCLUDE_TESTS=OFF   -DLLVM_INCLUDE_DOCS=OFF
ninja -C "$OPENMP_BUILD_DIR" -j"$(nproc)"
ninja -C "$OPENMP_BUILD_DIR" install

if [ ! -d "$FAISS_DIR" ]; then
  git clone https://github.com/facebookresearch/faiss.git "$FAISS_DIR"
else
  git -C "$FAISS_DIR" pull --ff-only
fi

rm -rf "$FAISS_DIR/build"
LIBOMP_LIBRARY="$(find "$OPENMP_DIR" -path '*/libomp.so' -print -quit)"
LIBOMP_INCLUDE_DIR="$(find "$OPENMP_DIR" -path '*/include/omp.h' -print -quit)"
LIBOMP_INCLUDE_DIR="$(dirname "$LIBOMP_INCLUDE_DIR")"
cmake -S "$FAISS_DIR" -B "$FAISS_DIR/build" -G Ninja   -DFAISS_ENABLE_GPU=OFF   -DFAISS_ENABLE_PYTHON=OFF   -DFAISS_ENABLE_C_API=OFF   -DFAISS_ENABLE_ROCM=OFF   -DFAISS_ENABLE_CUVS=OFF   -DFAISS_OPT_LEVEL=avx2   -DBUILD_TESTING=OFF   -DBUILD_SHARED_LIBS=OFF   -DCMAKE_BUILD_TYPE=Release   -DBLA_VENDOR=OpenBLAS   -DOpenMP_CXX_FLAGS="-fopenmp"   -DOpenMP_CXX_LIB_NAMES="omp"   -DOpenMP_omp_LIBRARY="$LIBOMP_LIBRARY"   -DCMAKE_CXX_FLAGS="-O3 -g -mavx2 -mfma -mf16c -mpopcnt -isystem $LIBOMP_INCLUDE_DIR"
ninja -C "$FAISS_DIR/build" -j"$(nproc)"

if [ ! -d "$HNSW_DIR" ]; then
  git clone https://github.com/nmslib/hnswlib.git "$HNSW_DIR"
else
  git -C "$HNSW_DIR" pull --ff-only
fi
```

Line by line:

- `mkdir -p external` and `cd external`
  - move into the local dependency checkout area
- `git clone` / `git pull --ff-only`
  - fetch or refresh LLVM, FAISS, and `hnswlib`
- `cmake ...` and `ninja ...`
  - build LLVM/Clang, then build and install OpenMP into the local tool directory
- `cmake ...` and `ninja ...` for FAISS
  - build FAISS CPU against the local OpenMP install and OpenBLAS
- the `find` commands
  - locate `libomp.so` and `omp.h` so the FAISS build can link against the local OpenMP install

The result is a local dependency tree that the benchmark binaries can link against without relying on a system-wide install.

What gets built:

- LLVM/Clang, `lld`, and `clang-tools-extra`
- the OpenMP runtime into `tools/openmp`
- FAISS CPU with OpenBLAS and OpenMP
- `hnswlib`

3. Run the benchmark suite.

```bash
mkdir -p "$ANN_ROOT/build" "$ANN_ROOT/results" "$ANN_ROOT/perf" "$ANN_ROOT/asm" "$ANN_ROOT/mca"

clang++ -O3 -march=native -g -std=c++20 -pthread   -I"$HNSW_DIR"   "$ANN_ROOT/src/hnsw_bench.cpp"   -o "$ANN_ROOT/build/hnsw_bench"

taskset -c 0 "$ANN_ROOT/build/hnsw_bench"   --dims "${HNSW_DIMS:-16,32}"   --sizes "${HNSW_SIZES:-1000,5000}"   --queries "${HNSW_QUERIES:-100}"   --ef "${HNSW_EF:-16,32}"   --mode "${HNSW_MODE:-smoke}"   > "$ANN_ROOT/results/hnsw.csv"

clang++ -O3 -march=native -g   -I"$FAISS_DIR"   -I"$FAISS_DIR/build"   -I"$OPENMP_DIR/include"   "$ANN_ROOT/src/faiss_flat_bench.cpp"   "$FAISS_DIR/build/faiss/libfaiss.a"   -L"$OPENMP_DIR/lib"   -Wl,-rpath,"$OPENMP_DIR/lib"   -fopenmp=libomp   -lblas -llapack   -o "$ANN_ROOT/build/faiss_flat_bench"

taskset -c 0 "$ANN_ROOT/build/faiss_flat_bench"   --dims "${FAISS_FLAT_DIMS:-16,32}"   --sizes "${FAISS_FLAT_SIZES:-1000,5000}"   --queries "${FAISS_FLAT_QUERIES:-100}"   --mode "${FAISS_FLAT_MODE:-smoke}"   > "$ANN_ROOT/results/faiss_flat.csv"

clang++ -O3 -march=native -g   -I"$FAISS_DIR"   -I"$FAISS_DIR/build"   -I"$OPENMP_DIR/include"   "$ANN_ROOT/src/faiss_ivf_bench.cpp"   "$FAISS_DIR/build/faiss/libfaiss.a"   -L"$OPENMP_DIR/lib"   -Wl,-rpath,"$OPENMP_DIR/lib"   -fopenmp=libomp   -lblas -llapack   -o "$ANN_ROOT/build/faiss_ivf_bench"

taskset -c 0 "$ANN_ROOT/build/faiss_ivf_bench"   --dims "${FAISS_IVF_DIMS:-16,32}"   --sizes "${FAISS_IVF_SIZES:-1000,5000}"   --queries "${FAISS_IVF_QUERIES:-100}"   --nprobe "${FAISS_IVF_NPROBE:-1,4,8}"   --mode "${FAISS_IVF_MODE:-smoke}"   > "$ANN_ROOT/results/faiss_ivf.csv"
```

Line by line:

- `clang++ ... hnsw_bench.cpp`
  - builds the HNSW benchmark binary with the local header path
- `taskset -c 0 ... hnsw_bench`
  - pins the run to CPU 0 and produces the HNSW benchmark CSV
- `clang++ ... faiss_flat_bench.cpp`
  - builds the FAISS Flat benchmark against the local FAISS and OpenMP installs
- `taskset -c 0 ... faiss_flat_bench`
  - runs the Flat benchmark and writes its CSV output
- `clang++ ... faiss_ivf_bench.cpp`
  - builds the FAISS IVF benchmark with the same local dependencies
- `taskset -c 0 ... faiss_ivf_bench`
  - runs the IVF benchmark and writes its CSV output

The default benchmark settings are small so the smoke run finishes quickly:

- HNSW smoke: `dims=16,32`, `sizes=1000,5000`, `queries=100`, `ef=16,32`, `target_recall=0.99`
- FAISS Flat smoke: `dims=16,32`, `sizes=1000,5000`, `queries=100`, `target_recall=1.0`
- FAISS IVF smoke: `dims=16,32`, `sizes=1000,5000`, `queries=100`, `nprobe=1,4,8`, `target_recall=0.90`

The perf path is also small by default and uses the single-run settings from the commands above:

- HNSW perf: `dims=16`, `sizes=1000`, `queries=100`, `ef=16`
- FAISS Flat perf: `dims=16`, `sizes=1000`, `queries=100`
- FAISS IVF perf: `dims=16`, `sizes=1000`, `queries=100`, `nprobe=8`

If you want the deeper 10k/5000 snapshot used later in this article, set the perf variables before running the commands.

```bash
HNSW_PERF_DIMS=16 HNSW_PERF_SIZES=10000 HNSW_PERF_QUERIES=5000 HNSW_PERF_EF=32   taskset -c 0 "$ANN_ROOT/build/hnsw_bench" --mode perf
FAISS_FLAT_PERF_DIMS=16 FAISS_FLAT_PERF_SIZES=10000 FAISS_FLAT_PERF_QUERIES=5000   taskset -c 0 "$ANN_ROOT/build/faiss_flat_bench" --mode perf
FAISS_IVF_PERF_DIMS=16 FAISS_IVF_PERF_SIZES=10000 FAISS_IVF_PERF_QUERIES=5000 FAISS_IVF_PERF_NPROBE=8   taskset -c 0 "$ANN_ROOT/build/faiss_ivf_bench" --mode perf
```

Line by line:

- the `HNSW_PERF_*`, `FAISS_FLAT_PERF_*`, and `FAISS_IVF_PERF_*` prefixes
  - override the benchmark parameters for the deeper perf run
- `taskset -c 0 ... --mode perf`
  - runs each workload in its perf configuration and keeps CPU affinity fixed

4. Aggregate the generated outputs.

```bash
SUMMARY_CSV="$ANN_ROOT/results/summary.csv"
: > "$SUMMARY_CSV"
echo "benchmark,row_type,mode,dim,size,queries,param,build_ms,query_ms,qps,recall" | tee -a "$SUMMARY_CSV"

awk -F, -v benchmark="hnsw" '
  NR > 1 && $1 == "summary" {
    print benchmark "," $1 "," $2 "," $3 "," $4 "," $5 "," $6 "," $7 "," $8 "," $9 "," $10
  }' "$ANN_ROOT/results/hnsw.csv" | tee -a "$SUMMARY_CSV"

awk -F, -v benchmark="faiss_flat" '
  NR > 1 && $1 == "summary" {
    print benchmark "," $1 "," $2 "," $3 "," $4 "," $5 ",-," $6 "," $7 "," $8 "," $9
  }' "$ANN_ROOT/results/faiss_flat.csv" | tee -a "$SUMMARY_CSV"

awk -F, -v benchmark="faiss_ivf" '
  NR > 1 && $1 == "summary" {
    print benchmark "," $1 "," $2 "," $3 "," $4 "," $5 "," $6 "," $7 "," $8 "," $9 "," $10
  }' "$ANN_ROOT/results/faiss_ivf.csv" | tee -a "$SUMMARY_CSV"

TUNING_CSV="$ANN_ROOT/results/tuning.csv"
: > "$TUNING_CSV"
echo "benchmark,mode,dim,size,queries,param,target_recall,build_ms,query_ms,qps,recall" > "$TUNING_CSV"
for tuning in "$ANN_ROOT/results/hnsw_tuning.csv" "$ANN_ROOT/results/faiss_flat_tuning.csv" "$ANN_ROOT/results/faiss_ivf_tuning.csv"; do
  awk 'NR > 1' "$tuning" >> "$TUNING_CSV"
done

cat "$TUNING_CSV"
```

Line by line:

- the `SUMMARY_CSV` block
  - builds the consolidated summary table from the per-workload CSV files
- the `TUNING_CSV` block
  - concatenates the recall-aware tuning reports into one table
- `cat "$TUNING_CSV"`
  - prints the merged tuning table

For the deeper hotspot analysis, use:

```bash
perf report -i "$ANN_ROOT/perf/hnsw.data" --stdio
perf report -i "$ANN_ROOT/perf/faiss_flat.data" --stdio
perf report -i "$ANN_ROOT/perf/faiss_ivf.data" --stdio
llvm-objdump -d --no-show-raw-insn "$ANN_ROOT/build/hnsw_bench"
```

Line by line:

- `perf report -i ...`
  - opens the profiling data in text mode
  - lets you inspect the symbol-level hotspots
- `llvm-objdump -d --no-show-raw-insn ...`
  - disassembles the HNSW binary
  - helps connect the counter data to the actual control flow in the binary

That is the exact workflow the article is based on.

### Commands run

The measured run used the same binary set, CPU pinning, and `perf stat` event list shown above.

This run answers one question: what bottleneck shape does each ANN workload expose on this AMD CPU?

### Host

These measurements were taken on:

- **CPU:** AMD Ryzen 7 9700X 8-Core Processor
- **Kernel:** `Linux 6.17.0-29-generic`
- **Compiler:** `clang++ 18.1.3`
- **perf:** `6.17.13`
- **NUMA:** single socket, CPUs `0-15`
- **Affinity used:** `taskset -c 0`
- **Build flags:** `-O3 -march=native -DNDEBUG`; the HNSW build also uses `-pthread`, and the FAISS IVF build links with `libomp`, BLAS, and LAPACK

## Reproducibility Check

To confirm the benchmark path without depending on the deeper perf slice, I reran the smaller built-in configuration. It keeps the article aligned with the current project state while staying close to the smoke-run defaults. In that check, the perf rows were:

| Benchmark | Dim | Size | Queries | Param | Build ms | Query ms | QPS | Recall |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HNSW | 16 | 1000 | 100 | 16 | 36.253 | 0.396 | 252373.573 | 1.000 |
| FAISS Flat | 16 | 1000 | 100 | - | 0.010 | 0.212 | 471524.628 | 1.000 |
| FAISS IVF | 16 | 1000 | 100 | 8 | 0.740 | 0.140 | 712611.078 | 0.900 |

The qualitative ranking holds:

- HNSW still pays for graph traversal and queue work
- FAISS Flat still behaves like an exact SIMD scan
- FAISS IVF still uses pruning to reduce work, but its exact speed ranking should stay tied to repeatability data

The smaller slice fits in cache, so it is a good fit for the control-flow and SIMD discussion. It is also the easiest way to verify that the published numbers still reflect the current code path.

## Results

| Workload | Build ms | Query ms | QPS | Recall | IPC | Branch miss % | Cache miss % | Main hot path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HNSW | 1017.504 | 43.310 | 115446.315 | 1.000 | 1.40 | 8.75% | 10.08% | `searchBaseLayer`, queue ops, `L2SqrSIMD16ExtAVX512` |
| FAISS Flat | 0.348 | 265.762 | 18813.800 | 1.000 | 4.79 | 0.01% | 0.40% | `fvec_L2sqr`, `exhaustive_L2sqr_seq` |
| FAISS IVF | 36.796 | 44.279 | 112921.073 | 0.857 | 4.35 | 0.22% | 1.05% | `fvec_L2sqr`, `IVFFlatScanner`, BLAS helper work |

## Repeatability

A three-run wall-clock pass on the same binaries and inputs, run without `perf` overhead, produced:

| Workload | Mean query ms | Std dev | Mean qps |
| --- | ---: | ---: | ---: |
| HNSW | 43.256 | 0.296 | 115597.507 |
| FAISS Flat | 118.967 | 1.858 | 42038.931 |
| FAISS IVF | 15.734 | 1.698 | 321833.624 |

The repeatability pass is why the article avoids a blanket fastest claim. The bottleneck shape is stable, but the exact ordering can move between runs. These numbers are not directly comparable to the `perf stat` rows above because `perf` changes the measurement path.

<img src="/img/articles/ann-bottleneck-summary.svg" alt="ANN bottleneck shape and repeatability chart" style={{ width: '100%', height: 'auto', marginTop: '1rem' }} />

## Parameter Sweep

A sweep is more useful than a single point. It shows how the search parameters move the throughput/accuracy balance.

### HNSW `ef` sweep

| `ef` | Mean query ms | Std dev | Mean qps | Recall |
| --- | ---: | ---: | ---: | ---: |
| 8 | 13.796 | 0.749 | 363519.457 | 1.000 |
| 16 | 22.919 | 0.621 | 218317.111 | 1.000 |
| 32 | 43.456 | 0.621 | 115082.085 | 1.000 |

### IVF `nprobe` sweep

| `nprobe` | Mean query ms | Std dev | Mean qps | Recall |
| --- | ---: | ---: | ---: | ---: |
| 1 | 2.671 | 0.003 | 1871723.899 | 0.347 |
| 4 | 8.303 | 1.298 | 615705.602 | 0.697 |
| 8 | 14.143 | 1.189 | 355903.939 | 0.857 |
| 16 | 28.805 | 0.896 | 173743.425 | 0.963 |

A curve is more useful than one number. It shows the tradeoff at the target recall.

<img src="/img/articles/ann-tradeoff-sweep.svg" alt="ANN tradeoff sweep for HNSW ef and IVF nprobe" style={{ width: '100%', height: 'auto', marginTop: '1rem' }} />

## HNSW Analysis

The sections below unpack the three-way result in the same order the data suggests it: HNSW first, then Flat, then IVF.

HNSW is the clearest branch-heavy case in this run.

Measured counters:

- `3527792659` cycles
- `4921685624` instructions
- `1.40` IPC
- `684944517` branches
- `59926948` branch misses, or `8.75%`
- `116275338` cache references
- `11719820` cache misses, or `10.08%`
- `96931442` L1 data cache load misses

Top `perf report` symbols:

- `hnswlib::HierarchicalNSW<float>::searchBaseLayer(unsigned int, void const*, int)`
- `std::priority_queue<...>::pop()`
- `std::priority_queue<...>::emplace()`
- `hnswlib::L2SqrSIMD16ExtAVX512(void const*, void const*, void const*)`

The actual `perf report` screenshot is below. It shows the same hotspot ordering as the text summary above.

<img src="/img/articles/ann-perf-report.png" alt="Screenshot of perf report showing the HNSW hotspot ranking" style={{ width: '100%', height: 'auto', marginTop: '1rem' }} />

Measured facts:

- HNSW does not spend its time in one clean arithmetic loop
- the hot path is split across graph traversal, queue maintenance, and repeated distance checks
- the branch miss rate is high enough to matter
- the IPC is low enough to show that the machine is not being fed efficiently

Interpretation:

- branchy graph search and queue work dominate the control path
- low IPC matches frontend disruption and speculation loss
- the SIMD distance kernel helps, but it sits inside a noisier traversal envelope

HNSW is bottlenecked more by graph traversal and queue work than by raw floating-point throughput.

### Assembly evidence

The branch-heavy behavior is visible in the binary, not just in the counters.

In `llvm-objdump -d --no-show-raw-insn` output for `hnsw_bench`, `searchBaseLayer` contains a control-flow pattern like this:

```asm
testb $0x1, 0x2(%rcx,%rsi)
je    ...
callq ...priority_queue...emplace...
vucomiss %xmm0, %xmm1
jbe   ...
cmpq  %rsi, %rbp
jl    ...
```

That is the shape you expect from graph traversal:

- a test on metadata
- a conditional jump
- a queue insertion
- another compare
- another jump
- a loop back-edge

The heap maintenance itself is also branchy. The `priority_queue` path shows repeated compare-and-jump logic around the heap boundary:

```asm
cmpq 0x10(%rdi), %rbp
je   ...
cmpq $0x2, %rbx
jl   ...
vucomiss ...
jbe  ...
jne  ...
```

That is why the profile does not look like a single arithmetic kernel. The CPU keeps switching between traversal decisions, queue updates, and distance checks.

For source-to-assembly, `perf annotate` is the next step after `perf report` on the same binary.

The actual `perf annotate` screenshot is below. It shows the source line, disassembly, and hot control-flow edges for `searchBaseLayer`.

<img src="/img/articles/ann-perf-annotate.png" alt="Screenshot of perf annotate showing HNSW source and assembly" style={{ width: '100%', height: 'auto', marginTop: '1rem' }} />

The SIMD part is there too, but it is not the only story. The distance kernel uses AVX-512 in a tight loop:

```asm
vmovups (%rdi), %zmm1
vsubps  (%rsi), %zmm1, %zmm1
vmulps  %zmm1, %zmm1, %zmm1
vaddps  %zmm1, %zmm0, %zmm0
cmpq    %rax, %rdi
jb      ...
```

So the right reading is not “HNSW has no SIMD.” It is “HNSW mixes a decent SIMD kernel with a much noisier control-flow envelope around it.”

## FAISS Flat Analysis

FAISS Flat behaves like an exact scan.

Measured counters:

- `1283301059` cycles
- `6144175658` instructions
- `4.79` IPC
- `1317992530` branches
- `160034` branch misses, or `0.01%`
- `103912792` cache references
- `412920` cache misses, or `0.40%`
- `99975175` L1 data cache load misses

Top `perf report` symbols:

- `float faiss::fvec_L2sqr<(faiss::SIMDLevel)0>(float const*, float const*, unsigned long)`
- `faiss::(anonymous namespace)::exhaustive_L2sqr_seq<...>`

Measured facts:

- the control flow is regular
- branch misses are almost irrelevant
- the kernel is dominated by distance calculations
- the high IPC matches dense, predictable work

Flat is slower than IVF here because it scans the full search space.

Interpretation:

- the loop is regular enough to keep the core busy
- the work is dominated by distance computation rather than traversal overhead
- the hot path has very little branching

## FAISS IVF Analysis

FAISS IVF uses pruning to reduce the amount of work per query.

Measured counters:

- `799086776` cycles
- `3479304330` instructions
- `4.35` IPC
- `745893374` branches
- `1658249` branch misses, or `0.22%`
- `64019749` cache references
- `674190` cache misses, or `1.05%`
- `58955437` L1 data cache load misses

Top `perf report` symbols:

- `float faiss::fvec_L2sqr<(faiss::SIMDLevel)0>(float const*, float const*, unsigned long)`
- `faiss::(anonymous namespace)::exhaustive_L2sqr_seq<...>`
- `faiss::IVFFlatScanner<...>::scan_codes(...)`
- `faiss::knn_L2sqr(...)`
- `sgemm_`
- `sgemm_kernel_COOPERLAKE`

Measured query result:

- `44.279 ms` query time
- `112921.073` qps
- `0.857` recall at `nprobe=8`

Measured facts:

- the profile still includes the L2 distance kernel
- the search shape is what changes
- the recall drop is the cost of the throughput gain
- the exact speed ordering still needs repeatability data before it becomes a headline claim

IVF does not touch every vector the way Flat does. It picks clusters first, then scans a smaller set.

Interpretation:

- the search is pruned before the dense kernel runs
- IPC stays strong because the backend still gets steady work
- the lower recall is the tradeoff for the smaller candidate set

## Cross-cutting Notes

The three profiles line up cleanly: HNSW is branch-bound, FAISS Flat is compute-bound, and FAISS IVF sits between them. IPC, branch misses, and the assembly all point in the same direction.

The memory story is narrower. Similar L1 miss counts do not mean the workloads stress memory in the same way. The next useful data would be L3 hit ratios and DRAM bandwidth; on Zen 5, generic `perf` counters should be treated as directional evidence rather than absolute truth.[^perf-zen]

## Potential Optimizations

These are hypotheses, not measured wins. If the next round of work is done, the obvious levers are prefetching graph and inverted-list metadata, batching more than one query through the SIMD path, and reducing queue and heap overhead in graph search. Those are the knobs the current profile suggests, but they still need actual measurement.

## Caveats

One run on one host only. The exact ordering can move with dataset size, `ef`, and `nprobe`, and larger datasets are still needed before saying much about DRAM-bound behavior. `perf` event quality also varies by host, so the counters here should be read as strong evidence about shape, not as a universal hardware truth.

## Final Takeaway

HNSW pays for traversal, Flat keeps the cleanest control flow, and IVF buys throughput by pruning the search space before the dense kernel runs. That is the result the counters support.

## References

- [ANN overview](https://en.wikipedia.org/wiki/Nearest_neighbor_search)
- [HNSW paper: *Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs*](https://arxiv.org/abs/1603.09320)
- [FAISS GitHub README](https://github.com/facebookresearch/faiss)
- [FAISS wiki: getting started](https://github.com/facebookresearch/faiss/wiki/getting-started)
- [FAISS paper: *Billion-scale similarity search with GPUs*](https://arxiv.org/abs/1702.08734)

The HNSW paper defines the graph-search structure behind the branch-heavy behavior. The FAISS README and wiki document the index families and the exact-vs-approximate split. The FAISS paper is GPU-focused, but it is still the foundational reference for the library.
