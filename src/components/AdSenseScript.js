import React, { useEffect } from 'react';

const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3213090090375658';

export default function AdSenseScript() {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const existing = document.querySelector(`script[src="${ADSENSE_SRC}"]`);
    if (existing) {
      return undefined;
    }

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = ADSENSE_SRC;
    document.head.appendChild(script);

    return undefined;
  }, []);

  return null;
}
