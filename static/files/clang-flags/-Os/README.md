# Clang `-Os` experiment bundle

Reproducible IR, assembly, size, and CompilerSutraPerf (`csperf`) measurements
backing the [Clang Flags Explorer `-Os` page](/tools/clang-flags/-Os/).

## Layout

| Path | Contents |
| --- | --- |
| `process_buffer.cpp` | Inspection kernel (no `main`) |
| `benchmarks/process_buffer_bench.cpp` | Timed workload for `compiler_diff_batch.py` |
| `configs/clang_{O2,Os,Oz}.json` | Sample-schema compiler configs |
| `generated/` | Measured `.ll` / `.s` / excerpts / environment / size logs |
| `results/O2-vs-Os/` | csperf JSON/CSV for `-O2` vs `-Os` |
| `results/O2-vs-Oz/` | csperf JSON/CSV for `-O2` vs `-Oz` |

## Regenerate

Requires Clang on `PATH` and a local [CompilerSutraPerfTool](https://github.com/aabhinavg1/CompilerSutraPerfTool) checkout with `.venv`.

```bash
ROOT=static/files/clang-flags/-Os
CSP=/path/to/CompilerSutraPerfTool

clang++ -O2 -S -emit-llvm "$ROOT/process_buffer.cpp" -o "$ROOT/generated/loop-O2.ll"
# … same for -Os / -Oz and -S -masm=intel …

"$CSP/.venv/bin/python" "$CSP/scripts/compiler_diff_batch.py" \
  "$ROOT/benchmarks" \
  --config1 "$ROOT/configs/clang_O2.json" \
  --config2 "$ROOT/configs/clang_Os.json" \
  --results-dir "$ROOT/results/O2-vs-Os" \
  --warmup-runs 2 --repeat-runs 10 --skip-derived
```

Do not invent performance numbers. Replace tables only after a fresh run on your machine.
