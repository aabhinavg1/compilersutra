import React, { lazy, Suspense } from "react";
import Head from "@docusaurus/Head";
import OriginalLayout from "@theme-original/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import AdSenseScript from "@site/src/components/AdSenseScript";
import { getSocialImageForPath, SOCIAL_IMAGE_VERSION } from "@site/src/utils/socialImage";
import { SpeedInsights } from "@vercel/speed-insights/react";

const FloatingSubscribe = lazy(() => import("@site/src/components/FloatingSubscribe"));
const FloatingWhatsApp = lazy(() => import("@site/src/components/FloatingWhatsApp"));

export default function Layout(props) {
  const location = useLocation();
  const isReaderRoute = location.pathname.startsWith("/library/read");
  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url.replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}${location.pathname}`;
  const socialImageConfig = getSocialImageForPath(location.pathname);
  const pageTitle = props.title
    ? props.title.includes(siteConfig.title)
      ? props.title
      : `${props.title} | ${siteConfig.title}`
    : siteConfig.title;
  const pageDescription =
    props.description ||
    siteConfig.tagline ||
    "Compiler engineering tutorials covering LLVM, MLIR, TVM, GPU programming, and systems internals.";
  const socialImage = `${siteUrl}${socialImageConfig.image}?v=${SOCIAL_IMAGE_VERSION}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.title,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/img/logo.svg`,
      },
      sameAs: [
        "https://twitter.com/CompilerSutra",
        "https://www.youtube.com/@compilersutra",
        "https://github.com/aabhinavg1/FixIt",
        "https://www.linkedin.com/in/abhinavcompilerllvm/",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.title,
      url: siteUrl,
      description: pageDescription,
      publisher: {
        "@type": "Organization",
        name: siteConfig.title,
      },
    },
  ];

  return (
    <>
      <Head>
        <html lang="en" />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="CompilerSutra" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:alt" content={socialImageConfig.alt} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content={socialImageConfig.alt} />
        <script id="compilersutra-layout-schema" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>
      <OriginalLayout
        {...props}
        noNavbar={isReaderRoute || props.noNavbar}
        noFooter={isReaderRoute || props.noFooter}
      />
      <SpeedInsights />
      {!isReaderRoute && (
        <BrowserOnly fallback={null}>
          {() => (
            <Suspense fallback={null}>
              <AdSenseScript />
              <FloatingWhatsApp />
              <FloatingSubscribe />
            </Suspense>
          )}
        </BrowserOnly>
      )}
    </>
  );
}
