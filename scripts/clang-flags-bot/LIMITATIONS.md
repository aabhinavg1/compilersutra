# Limitations

1. **Site sync gap.** After syncing from `upstream/main`, FixIt has **27** `HAND_AUTHORED` pages. Bot state still lists **3** published flags that remain stubs here: `-ffast-math`, `-fno-exceptions`, `-fPIC` (likely open/unmerged PRs). Prefer finishing those publishes before `MODE=improve` on them.

2. **Default evidence workload is tiny.** `gather-evidence.mjs` uses a short `sample.c` for IR/asm smoke tests. Do **not** publish PerfReport from that alone. Point `--workload` at a real file under `docs/tools/clang-flags-workloads/` for Category A claims.

3. **csperf metrics depend on host support.** With `--no-perf`, you still get wall time; hardware counters need Linux perf/PAPI as documented in CompilerSutraPerf. Energy backends are optional.

4. **Heuristic classification.** Categories A–E are semantics heuristics, not Options.td ground truth. Review before forcing csperf on Category D/E flags.

5. **No automatic mass rewrite.** `MODE=improve` changes **one** article per run and still opens a PR for human approval.

6. **AI rewrite still required for deepen step.** Inventory/audit/evidence run without AI keys; `improve-flag.mjs` / `write-flag.mjs` need the existing Jenkins AI credentials.

7. **csperf path.** Use `/home/aitr/projects/CompilerSutraPerfTool` (0.3.0). The copy under `compilersutra/tools/` is stale (0.1.0).
