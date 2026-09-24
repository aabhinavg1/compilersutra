import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import { FaArrowRight, FaEnvelope } from 'react-icons/fa';
import Heading from '@theme/Heading';
import Hero from '@site/src/components/hero/Hero';
import styles from './index.module.css';

const NEWSLETTER_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform';

const CONTACT_URL = 'https://www.linkedin.com/in/abhinavcompilerllvm/';
const CONTACT_EMAIL = 'mailto:osc@compilersutra.com';

const BUCKETS = [
  {
    label: 'Learn',
    title: 'Tracks & tutorials',
    text: 'Compiler fundamentals, LLVM, GPU, MLIR, C++, architecture.',
    to: '/docs/tracks/',
    cta: 'Browse Learn',
  },
  {
    label: 'Practice',
    title: 'Labs, DSA, MCQs',
    text: 'Hands-on labs, interview practice, and algorithm tracks.',
    to: '/docs/labs',
    cta: 'Browse Practice',
  },
  {
    label: 'Tools',
    title: 'Inspect & explore',
    text: 'Clang flags, ABI explorer, LLVM pass tracker.',
    to: '/docs/tools',
    cta: 'Browse Tools',
  },
  {
    label: 'Read',
    title: 'Articles & papers',
    text: 'Benchmarks, how-tos, books, and the paper library.',
    to: '/docs/articles',
    cta: 'Browse Read',
  },
];

const FEATURED_PATHS = [
  {
    title: 'Compiler Fundamentals',
    description: 'Source → IR → binary. Best first choice if you are unsure.',
    tag: 'Best first choice',
    to: '/docs/tracks/compiler-fundamentals',
    cta: 'Start Fundamentals',
  },
  {
    title: 'LLVM and IR',
    description: 'Architecture, SSA, passes, and IR reasoning.',
    tag: 'Most popular',
    to: '/docs/tracks/llvm-and-ir',
    cta: 'Start LLVM',
  },
  {
    title: 'DSA Academy',
    description: 'Separate guided product for data structures and algorithms.',
    tag: 'Practice track',
    to: '/dsa',
    cta: 'Start DSA',
  },
];

const FIRST_READS = [
  {
    title: 'How Source Code Becomes Binary',
    description: 'A clean bridge from high-level code into machine-level execution.',
    to: '/docs/compilers/sourcecode_to_executable',
    tag: 'Core',
  },
  {
    title: 'Intro to LLVM',
    description: 'Guided LLVM sequence instead of random docs hopping.',
    to: '/docs/llvm/intro-to-llvm',
    tag: 'LLVM',
  },
  {
    title: 'Memory Hierarchy for Compiler Engineers',
    description: 'Why cache and locality dominate real performance.',
    to: '/docs/coa/memory-hierarchy',
    tag: 'Performance',
  },
  {
    title: 'GCC vs Clang Benchmark Report',
    description: 'Evidence-driven compiler comparison you can learn from.',
    to: '/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter',
    tag: 'Benchmarks',
  },
];

const PACK_ITEMS = [
  {
    title: 'LLVM IR reading starter',
    hint: 'How to read IR without getting lost',
    to: '/docs/llvm/llvm_ir/intro_to_llvm_ir',
  },
  {
    title: 'Compiler engineer roadmap',
    hint: 'One clear path from foundations up',
    to: '/docs/start-here',
  },
  {
    title: 'Best first reads',
    hint: 'LLVM, MLIR, GPU, and performance picks',
    to: '/docs/tracks/compiler-fundamentals',
  },
];

function ExploreSection() {
  return (
    <section className={styles.sectionBlock}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Where everything lives</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Four places. Same as the top menu.
          </Heading>
          <p className={styles.sectionText}>
            Learn paths, practice, tools, or reading — pick the mode you need right now.
            All material on this site is free.
          </p>
        </div>

        <div className={styles.bucketGrid}>
          {BUCKETS.map((item) => (
            <Link key={item.label} to={item.to} className={styles.bucketCard}>
              <span className={styles.bucketLabel}>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className={styles.pathLink}>
                {item.cta}
                <FaArrowRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedPathsSection() {
  return (
    <section className={styles.sectionBlockAlt}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Start with one path</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Three strong entry points
          </Heading>
          <p className={styles.sectionText}>
            Unsure? Open{' '}
            <Link to="/docs/start-here">Start Here</Link> for the full map. Otherwise pick one
            path below and stay on it.
          </p>
        </div>

        <div className={styles.featuredPathGrid}>
          {FEATURED_PATHS.map((item) => (
            <Link key={item.title} to={item.to} className={styles.simplePathCard}>
              <span className={styles.pathTag}>{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className={styles.pathLink}>
                {item.cta}
                <FaArrowRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FirstReadsSection() {
  return (
    <section className={styles.sectionBlock}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Worth opening first</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Four informative reads
          </Heading>
        </div>

        <div className={styles.resourceGridCompact}>
          {FIRST_READS.map((item) => (
            <Link key={item.title} to={item.to} className={styles.resourceCard}>
              <span className={styles.resourceTag}>{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StarterPackSection() {
  return (
    <section className={styles.sectionBlockAlt}>
      <div className={clsx('container', styles.leadMagnetShell)}>
        <div className={styles.starterPack}>
          <div className={styles.starterPackMain}>
            <div className={styles.starterPackBadges}>
              <span className={styles.freeBadge}>100% free</span>
              <span className={styles.openBadge}>No paywall</span>
            </div>

            <p className={styles.sectionEyebrow}>Starter Pack</p>
            <Heading as="h2" className={styles.sectionTitle}>
              Free starting resources
            </Heading>
            <p className={styles.sectionText}>
              Tutorials, tracks, tools, and guides stay free. Begin with these three, then keep going.
            </p>

            <div className={styles.packGrid}>
              {PACK_ITEMS.map((item) => (
                <Link key={item.title} to={item.to} className={styles.packCard}>
                  <strong>{item.title}</strong>
                  <span>{item.hint}</span>
                </Link>
              ))}
            </div>

            <div className={styles.starterPackActions}>
              <Link className={styles.starterPrimary} to="/docs/start-here">
                Open free Start Here
                <FaArrowRight aria-hidden="true" />
              </Link>
              <Link
                className={styles.starterGhost}
                to={NEWSLETTER_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaEnvelope aria-hidden="true" />
                Optional weekly notes
              </Link>
            </div>
            <p className={styles.formNote}>
              No spam — practical compiler notes and curated resources only.
            </p>
          </div>

          <aside className={styles.guidancePanel}>
            <p className={styles.guidanceLabel}>Personal guidance</p>
            <h3 className={styles.guidanceTitle}>Materials are free. Guidance is on request.</h3>
            <p className={styles.guidanceText}>
              Want help choosing a path or going deeper on LLVM / performance? Reach out.
            </p>
            <div className={styles.guidanceActions}>
              <Link
                className={styles.guidancePrimary}
                href={CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact on LinkedIn
              </Link>
              <Link className={styles.guidanceSecondary} href={CONTACT_EMAIL}>
                Email osc@compilersutra.com
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const pageUrl = 'https://www.compilersutra.com/';
  const socialImage = 'https://www.compilersutra.com/img/compilersutra-social-card.png';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CompilerSutra',
    url: pageUrl,
    description:
      'Learn compiler engineering through guided paths across LLVM, MLIR, GPU systems, and performance-focused programming.',
    about: ['LLVM', 'MLIR', 'Compiler Design', 'GPU Programming', 'Systems Programming'],
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: socialImage,
    },
  };

  return (
    <Layout
      title="CompilerSutra | Learn LLVM, Compilers, MLIR & GPU Programming"
      description="Learn compiler engineering through guided paths across LLVM, MLIR, GPU systems, and performance-focused programming."
    >
      <Head>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <meta
          property="og:title"
          content="CompilerSutra | Learn LLVM, Compilers, MLIR & GPU Programming"
        />
        <meta
          property="og:description"
          content="Guided learning paths for LLVM, compilers, MLIR, GPU programming, and performance engineering."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:alt" content="CompilerSutra home page preview" />
        <meta
          name="twitter:title"
          content="CompilerSutra | Learn LLVM, Compilers, MLIR & GPU Programming"
        />
        <meta
          name="twitter:description"
          content="Guided learning paths for LLVM, compilers, MLIR, GPU programming, and performance engineering."
        />
        <meta name="twitter:image" content={socialImage} />
      </Head>

      <Hero />
      <main>
        <ExploreSection />
        <FeaturedPathsSection />
        <FirstReadsSection />
        <StarterPackSection />
      </main>
    </Layout>
  );
}
