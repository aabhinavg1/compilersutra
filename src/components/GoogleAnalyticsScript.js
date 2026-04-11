import React, { useEffect } from 'react';

const ALLOWED_HOSTS = new Set(['www.compilersutra.com', 'compilersutra.com']);
const GA_SRC = 'https://www.googletagmanager.com/gtag/js?id=G-CJDGBRKJ5W';

export default function GoogleAnalyticsScript() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    if (!ALLOWED_HOSTS.has(window.location.hostname)) {
      return undefined;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };

    if (!document.querySelector(`script[src="${GA_SRC}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = GA_SRC;
      document.head.appendChild(script);
    }

    window.gtag('js', new Date());
    window.gtag('config', 'G-CJDGBRKJ5W');
    window.gtag('config', 'G-4PW5BRLTHD');

    return undefined;
  }, []);

  return null;
}
