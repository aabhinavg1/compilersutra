#!/usr/bin/env node
/**
 * End-to-end checks for slim clang-flag article payloads.
 * Run after: node scripts/generate-clang-flag-payloads.mjs
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, 'static', 'data', 'clang-flags.json');
const payloadDir = path.join(repoRoot, 'static', 'data', 'clang-flags', 'by-flag');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`OK: ${message}`);
}

function toStem(flag) {
  return Buffer.from(String(flag).trim(), 'utf8').toString('hex');
}

function getPageFlag(option) {
  return option.publicFlag || option.flag;
}

function buildPayloadPath(flag) {
  return `/data/clang-flags/by-flag/${toStem(flag)}.json`;
}

async function loadFlagArticleData({ baseUrl, requestedFlag, fetchImpl }) {
  const join = (p) => `${String(baseUrl).replace(/\/$/, '')}/${String(p).replace(/^\//, '')}`;
  const payloadUrl = join(buildPayloadPath(requestedFlag));
  const payloadRes = await fetchImpl(payloadUrl);
  if (payloadRes.ok) {
    return { data: await payloadRes.json(), source: 'payload', url: payloadUrl };
  }
  if (payloadRes.status !== 404) {
    throw new Error(`Failed to load ${payloadUrl} (${payloadRes.status})`);
  }
  const catalogUrl = join('/data/clang-flags.json');
  const catalogRes = await fetchImpl(catalogUrl);
  if (!catalogRes.ok) {
    throw new Error(`Failed to load ${catalogUrl} (${catalogRes.status})`);
  }
  return { data: await catalogRes.json(), source: 'catalog', url: catalogUrl };
}

async function main() {
  if (!fs.existsSync(payloadDir)) {
    fail(`payload dir missing: ${payloadDir}`);
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const pageFlags = new Set(catalog.options.map(getPageFlag));
  const files = fs.readdirSync(payloadDir).filter((name) => name.endsWith('.json'));

  if (files.length !== pageFlags.size) {
    fail(`payload count ${files.length} != unique page flags ${pageFlags.size}`);
  } else {
    ok(`payload count matches unique page flags (${files.length})`);
  }

  const samples = [
    '-fomit-frame-pointer',
    '-O2',
    '-save-temps',
    '-c',
    ...[...pageFlags].slice(0, 1),
    [...pageFlags][Math.floor(pageFlags.size / 2)],
    [...pageFlags][pageFlags.size - 1],
  ].filter(Boolean);

  let maxBytes = 0;
  let sumBytes = 0;
  let n = 0;
  for (const flag of new Set(samples)) {
    const file = path.join(payloadDir, `${toStem(flag)}.json`);
    if (!fs.existsSync(file)) {
      fail(`missing payload for ${flag}`);
      continue;
    }
    const raw = fs.readFileSync(file);
    maxBytes = Math.max(maxBytes, raw.length);
    sumBytes += raw.length;
    n += 1;
    const payload = JSON.parse(raw.toString('utf8'));
    if (payload.payloadKind !== 'clang-flag-article') {
      fail(`${flag}: bad payloadKind`);
    }
    if (!Array.isArray(payload.options) || !payload.options.length) {
      fail(`${flag}: empty options`);
    }
    const hit = payload.options.some(
      (item) => item.flag === flag || item.publicFlag === flag || getPageFlag(item) === flag,
    );
    if (!hit) {
      fail(`${flag}: primary flag not in options`);
    }
    if (raw.length > 200_000) {
      fail(`${flag}: payload too large (${raw.length} bytes)`);
    } else {
      ok(`${flag}: ${raw.length} bytes, ${payload.options.length} options`);
    }
  }

  const catalogBytes = fs.statSync(catalogPath).size;
  const avgSample = sumBytes / Math.max(n, 1);
  if (avgSample >= catalogBytes * 0.05) {
    fail(`sample payloads not slim enough (avg ${avgSample} vs catalog ${catalogBytes})`);
  } else {
    ok(`sample payloads slim vs catalog (avg ${Math.round(avgSample)} << ${catalogBytes})`);
  }
  ok(`max sample payload ${maxBytes} bytes`);

  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const filePath = path.join(repoRoot, 'static', urlPath.replace(/^\//, ''));
    if (!filePath.startsWith(path.join(repoRoot, 'static')) || !fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('missing');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(fs.readFileSync(filePath));
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/`;

  try {
    for (const flag of ['-fomit-frame-pointer', '-O2', '-c']) {
      const result = await loadFlagArticleData({
        baseUrl,
        requestedFlag: flag,
        fetchImpl: fetch,
      });
      if (result.source !== 'payload') {
        fail(`${flag}: expected source=payload got ${result.source}`);
      } else {
        ok(`${flag}: loader used payload (${result.url})`);
      }
    }

    const missing = await loadFlagArticleData({
      baseUrl,
      requestedFlag: '--this-flag-does-not-exist-zzz',
      fetchImpl: fetch,
    });
    if (missing.source !== 'catalog') {
      fail(`expected catalog fallback, got ${missing.source}`);
    } else {
      ok('missing payload falls back to full catalog');
    }
  } finally {
    server.close();
  }

  // MDX pages that exist should have a payload for their flagPath.
  const flagsDir = path.join(repoRoot, 'src', 'pages', 'tools', 'clang-flags', 'flags');
  const mdxFiles = fs.readdirSync(flagsDir).filter((name) => name.endsWith('.mdx')).slice(0, 50);
  let checked = 0;
  for (const name of mdxFiles) {
    const text = fs.readFileSync(path.join(flagsDir, name), 'utf8');
    const match = text.match(/flagPath="([^"]+)"/) || text.match(/flagPath=\{"([^"]+)"\}/);
    if (!match) continue;
    let flagPath = match[1];
    try {
      flagPath = decodeURIComponent(flagPath);
    } catch {
      // keep raw
    }
    const payloadFile = path.join(payloadDir, `${toStem(flagPath)}.json`);
    if (!fs.existsSync(payloadFile)) {
      fail(`MDX ${name} flagPath=${flagPath} missing payload`);
    } else {
      checked += 1;
    }
  }
  ok(`checked ${checked} MDX flagPath → payload mappings`);

  if (process.exitCode) {
    console.error('clang-flag payload tests FAILED');
  } else {
    console.log('clang-flag payload tests PASSED');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
