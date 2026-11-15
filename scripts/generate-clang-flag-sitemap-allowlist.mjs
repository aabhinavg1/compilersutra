#!/usr/bin/env node
/**
 * Build allowlist of HAND_AUTHORED clang-flag page paths for sitemap + indexing.
 * Stub/GENERATED pages stay crawlable but should be noindex + omitted from sitemap.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flagsDir = path.join(root, 'src/pages/tools/clang-flags/flags');
const outFile = path.join(root, 'src/data/clang-flags/handAuthoredSitemapPaths.json');

function normalizeSlug(slug) {
  let s = String(slug || '').trim();
  if (!s) return null;
  if (!s.startsWith('/')) s = `/${s}`;
  if (!s.endsWith('/')) s += '/';
  return s;
}

const authored = [];
for (const name of fs.readdirSync(flagsDir)) {
  if (!name.endsWith('.mdx')) continue;
  const text = fs.readFileSync(path.join(flagsDir, name), 'utf8');
  if (!text.includes('HAND_AUTHORED')) continue;
  const m = text.match(/^slug:\s*["']([^"']+)["']/m);
  const slug = normalizeSlug(m?.[1]);
  if (slug) authored.push(slug);
}

const unique = [...new Set(authored)].sort();
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
  outFile,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: unique.length,
      paths: unique,
    },
    null,
    2,
  )}\n`,
);
console.log(`Wrote ${unique.length} HAND_AUTHORED paths → ${path.relative(root, outFile)}`);
