export function buildFlagArticlePath(flag) {
  const value = String(flag ?? '').trim();
  if (!value) {
    return '/tools/clang-flags/';
  }
  return `/tools/clang-flags/${encodeURIComponent(value)}/`;
}

export function resolveFlagPathValue(value) {
  const raw = String(value ?? '').replace(/^\/+|\/+$/g, '');
  if (!raw) {
    return '';
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** UTF-8 hex stem — matches scripts/generate-clang-flag-pages.mjs / payloads. */
export function toClangFlagFileStem(flag) {
  const value = String(flag ?? '').trim();
  if (!value) {
    return '';
  }
  const bytes = typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(value)
    : Buffer.from(value, 'utf8');
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/** Slim per-flag article payload (not the full explorer catalog). */
export function buildClangFlagPayloadPath(flag) {
  const stem = toClangFlagFileStem(flag);
  if (!stem) {
    return '';
  }
  return `/data/clang-flags/by-flag/${stem}.json`;
}
