#!/usr/bin/env node
/**
 * Emit slim per-flag JSON payloads for FlagArticleShell / FlagArticlePage.
 * Explorer keeps loading static/data/clang-flags.json; article pages must not.
 *
 * Output: static/data/clang-flags/by-flag/<utf8-hex>.json
 * Stem uses publicFlag || flag (same as generate-clang-flag-pages.mjs).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const dataPath = path.join(repoRoot, 'static', 'data', 'clang-flags.json');
const outDir = path.join(repoRoot, 'static', 'data', 'clang-flags', 'by-flag');

function toFileStem(flag) {
  return Buffer.from(String(flag ?? '').trim(), 'utf8').toString('hex');
}

function getPageFlag(option) {
  return option.publicFlag || option.flag;
}

function scoreOption(option) {
  let score = 0;
  if (option?.category === 'CL Compatibility' || option?.group === 'cl_Group') {
    score -= 40;
  }
  if ((option?.visibility || []).includes('ClangOption')) {
    score += 5;
  }
  if (option?.group === 'O_Group' || option?.category === 'Optimization') {
    score += 8;
  }
  if (option?.documentation) score += 2;
  if (option?.help) score += 1;
  return score;
}

function loadCatalog() {
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!raw || !Array.isArray(raw.options)) {
    throw new Error(`Invalid clang flag dataset at ${dataPath}`);
  }
  return raw;
}

function pickPreferred(options) {
  return options
    .slice()
    .sort((a, b) => scoreOption(b) - scoreOption(a))[0];
}

function buildPayload(catalog, option, byExactFlag) {
  const relatedNames = Array.isArray(option.relatedFlags) ? option.relatedFlags : [];
  const relatedOptions = relatedNames
    .map((name) => byExactFlag.get(name))
    .filter(Boolean);

  const options = [option];
  for (const item of relatedOptions) {
    if (!options.some((existing) => existing.flag === item.flag)) {
      options.push(item);
    }
  }

  if (!relatedNames.length) {
    const sameCategory = catalog.options
      .filter((item) => item.flag !== option.flag && item.category === option.category)
      .slice(0, 6);
    for (const item of sameCategory) {
      if (!options.some((existing) => existing.flag === item.flag)) {
        options.push(item);
      }
    }
  }

  return {
    generatedAt: catalog.generatedAt ?? null,
    llvmSource: catalog.llvmSource ?? null,
    llvmCommit: catalog.llvmCommit ?? null,
    sourceRepository: catalog.sourceRepository ?? null,
    sourceBaseUrl: catalog.sourceBaseUrl ?? null,
    payloadKind: 'clang-flag-article',
    primaryFlag: getPageFlag(option),
    options,
  };
}

function main() {
  const catalog = loadCatalog();
  const byExactFlag = new Map();
  for (const option of catalog.options) {
    const existing = byExactFlag.get(option.flag);
    if (!existing || scoreOption(option) > scoreOption(existing)) {
      byExactFlag.set(option.flag, option);
    }
  }

  // One payload per article page stem (publicFlag || flag), matching MDX generation.
  const byPageFlag = new Map();
  for (const option of catalog.options) {
    const pageFlag = getPageFlag(option);
    const bucket = byPageFlag.get(pageFlag) || [];
    bucket.push(option);
    byPageFlag.set(pageFlag, bucket);
  }

  fs.mkdirSync(outDir, { recursive: true });
  for (const entry of fs.readdirSync(outDir)) {
    if (entry.endsWith('.json')) {
      fs.unlinkSync(path.join(outDir, entry));
    }
  }

  let written = 0;
  let bytes = 0;
  for (const [pageFlag, bucket] of byPageFlag.entries()) {
    const option = pickPreferred(bucket);
    const stem = toFileStem(pageFlag);
    if (!stem) continue;
    const payload = buildPayload(catalog, option, byExactFlag);
    const text = `${JSON.stringify(payload)}\n`;
    fs.writeFileSync(path.join(outDir, `${stem}.json`), text, 'utf8');
    written += 1;
    bytes += Buffer.byteLength(text);
  }

  const catalogBytes = fs.statSync(dataPath).size;
  console.log(
    `clang-flag payloads: wrote ${written} files under ${path.relative(repoRoot, outDir)} ` +
      `(${(bytes / 1e6).toFixed(2)} MB total vs catalog ${(catalogBytes / 1e6).toFixed(2)} MB; ` +
      `${catalog.options.length} catalog options)`,
  );
}

main();
