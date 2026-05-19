import React, { useEffect, useRef, useState } from 'react';

const ADSENSE_SELECTOR =
  'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';
const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3213090090375658';

function getPageKey() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  return window.location.pathname || '/';
}

function isMobileViewport() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 768px)').matches
  );
}

function getPageLimit(pathname) {
  const mobile = isMobileViewport();

  if (pathname.startsWith('/docs/')) {
    return mobile ? 1 : 3;
  }

  if (pathname === '/') {
    return 1;
  }

  return mobile ? 1 : 2;
}

function getMinTopOffset(pathname) {
  if (isMobileViewport()) {
    if (pathname === '/') {
      return 1200;
    }

    return 1100;
  }

  if (pathname.startsWith('/docs/mcq')) {
    return 0;
  }

  return pathname === '/' ? 1400 : 900;
}

function claimAdSlot(pathname) {
  if (typeof window === 'undefined') {
    return true;
  }

  const key = `__csAdsSeen:${pathname}`;
  const current = Number(window.sessionStorage.getItem(key) || '0');
  const limit = getPageLimit(pathname);

  if (current >= limit) {
    return false;
  }

  window.sessionStorage.setItem(key, String(current + 1));
  return true;
}

function waitForAdsense(maxAttempts = 20) {
  return new Promise((resolve) => {
    let attempts = 0;

    const check = () => {
      const hasScript = document.querySelector(ADSENSE_SELECTOR);
      const hasAdsObject =
        typeof window.adsbygoogle !== 'undefined' &&
        typeof window.adsbygoogle.push === 'function';

      if (hasScript && hasAdsObject) {
        resolve(true);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        resolve(false);
        return;
      }

      window.setTimeout(check, 250);
    };

    check();
  });
}

function ensureAdsenseScript() {
  if (typeof document === 'undefined') {
    return Promise.resolve(false);
  }

  const existing = document.querySelector(`script[src="${ADSENSE_SRC}"]`);
  if (existing) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = ADSENSE_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default function AdBanner({
  slot = '5928991162',
  format = 'fluid',
  layout = 'in-article',
  className = '',
  minHeight = 220,
}) {
  // Ads are intentionally disabled here. Keep the component in place so
  // existing markdown imports do not need to change.
  return null;

  // Original AdSense slot rendering is intentionally left commented out.
  // return (
  //   <div
  //     className={`cs-ad-slot ${className}`.trim()}
  //     aria-label="Advertisement"
  //     data-ad-status="loading"
  //     data-device={mobileViewport ? 'mobile' : 'desktop'}
  //     style={{
  //       '--cs-ad-min-height': `${minHeight}px`,
  //       '--cs-ad-mobile-min-height': `${Math.min(minHeight, 120)}px`,
  //     }}
  //   >
  //     <span className="cs-ad-slot__label">Advertisement</span>
  //     <ins
  //       ref={adRef}
  //       className="adsbygoogle"
  //       style={{ display: 'block' }}
  //       data-ad-layout={layout}
  //       data-ad-format={format}
  //       data-ad-client="ca-pub-3213090090375658"
  //       data-ad-slot={slot}
  //       data-full-width-responsive="true"
  //     />
  //   </div>
  // );
}
