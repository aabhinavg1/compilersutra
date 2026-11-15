const handAuthored = require('./handAuthoredSitemapPaths.json');

const PATH_SET = new Set(handAuthored.paths || []);

function normalizePathname(pathname) {
  if (!pathname) return '';
  let p = String(pathname).split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p += '/';
  return p;
}

/** Hub + explorer stay indexable even when individual stubs are not. */
const ALWAYS_INDEXABLE = new Set(['/tools/clang-flags/', '/tools/clang-flags/index/']);

function isHandAuthoredClangFlagPath(pathname) {
  const p = normalizePathname(pathname);
  if (ALWAYS_INDEXABLE.has(p)) return true;
  if (!p.startsWith('/tools/clang-flags/')) return false;
  return PATH_SET.has(p);
}

function shouldIndexClangFlagPath(pathname) {
  const p = normalizePathname(pathname);
  if (!p.startsWith('/tools/clang-flags/')) return true;
  return isHandAuthoredClangFlagPath(p);
}

function listHandAuthoredClangFlagPaths() {
  return [...PATH_SET];
}

module.exports = {
  isHandAuthoredClangFlagPath,
  shouldIndexClangFlagPath,
  listHandAuthoredClangFlagPaths,
  HAND_AUTHORED_CLANG_FLAG_COUNT: PATH_SET.size,
};
