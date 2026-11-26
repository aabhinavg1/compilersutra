import React, { useEffect, useMemo, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import FlagArticle from '@site/src/components/clang-flags/FlagArticle';
import { resolveFlagPathValue } from '@site/src/components/clang-flags/flagRoutes';
import { loadFlagArticleData } from '@site/src/components/clang-flags/loadFlagCatalog';
import { findFlagOption } from '@site/src/components/clang-flags/utils';

export default function FlagArticlePage({ flagPath }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const baseUrl = useBaseUrl('/');
  const requestedFlag = resolveFlagPathValue(flagPath);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      if (!requestedFlag) {
        return;
      }
      try {
        const result = await loadFlagArticleData({
          baseUrl,
          requestedFlag,
        });
        if (alive) {
          setData(result.data);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Failed to load compiler flag data.');
        }
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [baseUrl, requestedFlag]);

  const options = data?.options ?? [];
  const selectedFlag = useMemo(
    () => findFlagOption(options, requestedFlag),
    [options, requestedFlag],
  );

  if (error) {
    return <main style={{ padding: '2rem', color: 'var(--cf-text)' }}>{error}</main>;
  }

  if (!data || !requestedFlag) {
    return null;
  }

  if (!selectedFlag) {
    return (
      <main style={{ padding: '2rem', color: 'var(--cf-text)' }}>
        <p>Flag not found: {requestedFlag}</p>
      </main>
    );
  }

  return (
    <FlagArticle
      flag={selectedFlag}
      meta={data}
      allFlags={options}
      onCopyFlag={() => {
        try {
          navigator.clipboard.writeText(selectedFlag.flag);
        } catch {
          // Ignore clipboard failures.
        }
      }}
    />
  );
}
