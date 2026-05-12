import React, { useEffect, useRef, useState } from 'react';

const ADSENSE_SELECTOR =
  'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

function getPageKey() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  return window.location.pathname || '/';
}

function getPageLimit(pathname) {
  const isMobile =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 768px)').matches;

  if (pathname.startsWith('/docs/')) {
    return isMobile ? 1 : 3;
  }

  if (pathname === '/') {
    return 1;
  }

  return isMobile ? 1 : 2;
}

function getMinTopOffset(pathname) {
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

export default function AdBanner({
  slot = '5928991162',
  format = 'fluid',
  layout = 'in-article',
  className = '',
  minHeight = 220,
}) {
  const adRef = useRef(null);
  const [suppressed, setSuppressed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const node = adRef.current;
    if (!node) {
      return undefined;
    }

    const pathname = getPageKey();
    const nodeTop = node.getBoundingClientRect().top + window.scrollY;
    if (nodeTop < getMinTopOffset(pathname)) {
      setSuppressed(true);
      return undefined;
    }

    if (!claimAdSlot(pathname)) {
      setSuppressed(true);
      return undefined;
    }

    let cancelled = false;
    let observer;
    let retryTimer;

    const initializeAd = async () => {
      if (cancelled || node.dataset.adInitialized === 'true') {
        return;
      }

      const ready = await waitForAdsense();
      if (!ready || cancelled || node.dataset.adInitialized === 'true') {
        if (!ready) {
          setSuppressed(true);
        }
        return;
      }

      const pushAd = () => {
        if (cancelled || node.dataset.adInitialized === 'true') {
          return;
        }

        if (node.offsetWidth === 0) {
          retryTimer = window.setTimeout(pushAd, 250);
          return;
        }

        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          node.dataset.adInitialized = 'true';
          node.parentElement?.setAttribute('data-ad-status', 'ready');
        } catch (error) {
          const message = String(error?.message || error).toLowerCase();
          if (message.includes('already have ads')) {
            node.dataset.adInitialized = 'true';
            node.parentElement?.setAttribute('data-ad-status', 'ready');
            return;
          }
          retryTimer = window.setTimeout(pushAd, 500);
        }
      };

      pushAd();
    };

    if ('IntersectionObserver' in window) {
      observer = new window.IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              observer.disconnect();
              initializeAd();
            }
          });
        },
        { rootMargin: '250px 0px' }
      );

      observer.observe(node);
    } else {
      initializeAd();
    }

    return () => {
      cancelled = true;
      if (observer) {
        observer.disconnect();
      }
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  if (suppressed) {
    return null;
  }

  return (
    <div
      className={`cs-ad-slot ${className}`.trim()}
      aria-label="Advertisement"
      data-ad-status="loading"
      style={{ '--cs-ad-min-height': `${minHeight}px` }}
    >
      <span className="cs-ad-slot__label">Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-layout={layout}
        data-ad-format={format}
        data-ad-client="ca-pub-3213090090375658"
        data-ad-slot={slot}
        data-full-width-responsive="true"
      />
    </div>
  );
}
