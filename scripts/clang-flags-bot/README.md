# Clang flag bot — audit / improve artifacts

This directory stores **inventory and audit outputs** for the existing Jenkins bot at:

`/home/aitr/compilersutra/jenkins_pipeline/scripts/clang-flags-daily/`

Bot entrypoint: `run-all.sh` with `MODE=publish|audit|improve`.

## Regenerated reports

| File | Meaning |
| --- | --- |
| `inventory.json` | Full inventory of bot-managed / HAND_AUTHORED articles |
| `AUDIT_REPORT.md` | Human-readable audit summary + priority batch |
| `CLASSIFICATION.md` | Category A–E grouping |
| `PRIORITY_PLAN.md` | Batched improvement plan |
| `evidence-O2.json` | Sample evidence pack (`-O0` vs `-O2`, clang 18 + csperf diff) |
| `LIMITATIONS.md` | Known limits |

Local authoring prompts under `prompts/` are gitignored. The Jenkins bot falls back to `jenkins_pipeline/prompts/`. Gold article shape: Cursor skill `compilersutra-clang-flags` + twin refs `-fomit-frame-pointer` / `-fno-vectorize`.

## Refresh inventory

```bash
node /home/aitr/compilersutra/jenkins_pipeline/scripts/clang-flags-daily/inventory.mjs \
  --site /home/aitr/compilersutra/FixIt_Compilersutra \
  --state /home/aitr/compilersutra/jenkins_pipeline/state/clang-flags-daily.json \
  --out scripts/clang-flags-bot/inventory.json
```

## Improve one article (Jenkins or local)

```bash
export CSPERF=/home/aitr/projects/CompilerSutraPerfTool/.venv/bin/csperf   # 0.3.0
MODE=improve IMPROVE_FLAG=-O2 CLANG_FLAG_CSPERF=1 \
  DRY_RUN=true PUBLISH=false \
  bash /home/aitr/compilersutra/jenkins_pipeline/scripts/clang-flags-daily/run-all.sh
```

Do not use `compilersutra/tools/CompilerSutraPerfTool` (stale 0.1.0).
