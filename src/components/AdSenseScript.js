import React, { useEffect } from 'react';

const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3213090090375658';

export default function AdSenseScript() {
  // AdSense is intentionally disabled. Keep the component as a no-op so
  // existing imports do not need to change.
  useEffect(() => {
    return undefined;
  }, []);

  return null;
}
