import { buildClangFlagPayloadPath } from './flagRoutes';

function normalizeIncomingData(data) {
  if (!data || !Array.isArray(data.options)) {
    return { options: [], groups: [] };
  }
  return data;
}

/**
 * Prefer slim per-flag payload for article pages.
 * Fall back to full catalog only if the payload is missing (legacy / partial deploy).
 */
export async function loadFlagArticleData({ baseUrl, requestedFlag, fetchImpl = fetch }) {
  const join = (path) => {
    const root = String(baseUrl || '').replace(/\/$/, '');
    const rel = String(path || '').replace(/^\//, '');
    return `${root}/${rel}`;
  };

  const payloadPath = buildClangFlagPayloadPath(requestedFlag);
  if (payloadPath) {
    const payloadUrl = join(payloadPath);
    const response = await fetchImpl(payloadUrl);
    if (response.ok) {
      const payload = normalizeIncomingData(await response.json());
      return { data: payload, source: 'payload', url: payloadUrl };
    }
    if (response.status !== 404) {
      throw new Error(`Failed to load ${payloadUrl} (${response.status})`);
    }
  }

  const catalogUrl = join('/data/clang-flags.json');
  const response = await fetchImpl(catalogUrl);
  if (!response.ok) {
    throw new Error(`Failed to load ${catalogUrl} (${response.status})`);
  }
  const payload = normalizeIncomingData(await response.json());
  return { data: payload, source: 'catalog', url: catalogUrl };
}
