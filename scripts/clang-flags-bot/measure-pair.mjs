#!/usr/bin/env node
/**
 * Run two csperf configs and emit trial wall_time_ms arrays for PerfReport.
 * Usage:
 *   node measure-pair.mjs --input file.c \
 *     --before=-O2 --after=-O2 --after-flag=-fomit-frame-pointer \
 *     --label-before="-O2" --label-after="-O2 -fomit-frame-pointer" \
 *     --out report.json
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function arg(name, fallback = "") {
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function collectFlags(prefix) {
  // --before=-O2 or repeated --before-flag=-fPIC
  const out = [];
  for (let i = 0; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === `--${prefix}` || a === `--${prefix}-flag`) {
      out.push(process.argv[i + 1]);
    } else if (a.startsWith(`--${prefix}=`)) {
      out.push(a.slice(`--${prefix}=`.length));
    } else if (a.startsWith(`--${prefix}-flag=`)) {
      out.push(a.slice(`--${prefix}-flag=`.length));
    }
  }
  return out.filter(Boolean);
}

const csperf =
  process.env.CSPERF || "/home/aitr/projects/CompilerSutraPerfTool/.venv/bin/csperf";
const input = arg("--input");
const outPath = arg("--out") || "measure.json";
const warmup = arg("--warmup", "1");
const repeats = arg("--repeats", "5");
const labelBefore = arg("--label-before", "before");
const labelAfter = arg("--label-after", "after");
const beforeFlags = collectFlags("before");
const afterFlags = collectFlags("after");

if (!input || !beforeFlags.length || !afterFlags.length) {
  console.error(
    "Usage: measure-pair.mjs --input file.c --before=-O2 --after=-O2 --after-flag=-fsanitize=address --out out.json",
  );
  process.exit(2);
}

const work = fs.mkdtempSync(path.join("/tmp", "csperf-flag-"));
function run(label, flags) {
  const output = path.join(work, `${label}.json`);
  const args = [
    "run",
    "--input",
    path.resolve(input),
    "--backend",
    "cpu",
    "--cpu-affinity",
    "0",
    "--warmup-runs",
    warmup,
    "--repeat-runs",
    repeats,
    "--no-perf",
    "--output",
    output,
    ...flags.map((f) => `--compiler-flag=${f}`),
  ];
  const r = spawnSync(csperf, args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error(r.stdout);
    console.error(r.stderr);
    throw new Error(`csperf failed for ${label}: status=${r.status}`);
  }
  return JSON.parse(fs.readFileSync(output, "utf8"));
}

function trialMs(result) {
  const trials =
    result?.execution?.trial_results ||
    result?.execution?.trials ||
    result?.trials ||
    [];
  const times = trials
    .map((t) => Number(t.wall_time_ms ?? t.execution_time_ms ?? t.duration_ms))
    .filter((n) => Number.isFinite(n));
  if (times.length) return times.map((n) => Math.round(n * 1000) / 1000);
  const mean = Number(result?.metrics?.execution_time_ms ?? result?.execution?.wall_time_ms);
  if (Number.isFinite(mean)) return Array.from({ length: Number(repeats) }, () => mean);
  throw new Error("No trial wall times in csperf JSON");
}

const before = run("before", beforeFlags);
const after = run("after", afterFlags);
const report = {
  generated_at: new Date().toISOString(),
  csperf,
  input: path.resolve(input),
  clang: "clang (csperf default)",
  before: { label: labelBefore, flags: beforeFlags, trials_ms: trialMs(before) },
  after: { label: labelAfter, flags: afterFlags, trials_ms: trialMs(after) },
  repro: {
    before: `${csperf} run --input ${input} --backend cpu --cpu-affinity 0 --warmup-runs ${warmup} --repeat-runs ${repeats} --no-perf ${beforeFlags.map((f) => `--compiler-flag=${f}`).join(" ")}`,
    after: `${csperf} run --input ${input} --backend cpu --cpu-affinity 0 --warmup-runs ${warmup} --repeat-runs ${repeats} --no-perf ${afterFlags.map((f) => `--compiler-flag=${f}`).join(" ")}`,
  },
};

fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
