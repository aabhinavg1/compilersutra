import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import {
  FaArrowRight,
  FaBookOpen,
  FaEnvelope,
} from 'react-icons/fa';
import Heading from '@theme/Heading';
import Hero from '@site/src/components/hero/Hero';
import styles from './index.module.css';

const NEWSLETTER_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform';

const START_PATHS = [
  {
    title: 'Compiler Fundamentals',
    description:
      'Start with source to binary, IR, control flow, data flow, and why compiler transformations matter.',
    tag: 'Best for beginners',
    to: '/docs/tracks/compiler-fundamentals',
    cta: 'Start Fundamentals',
    tone: 'fundamentals',
    coverLabel: 'Source -> IR -> Binary',
    chips: ['Frontend', 'IR', 'Control Flow'],
  },
  {
    title: 'LLVM Track',
    description:
      'Go from LLVM architecture into IR, passes, SSA, analysis, and backend reasoning.',
    tag: 'Most popular',
    to: '/docs/tracks/llvm-and-ir',
    cta: 'Start LLVM',
    tone: 'llvm',
    coverLabel: 'IR, SSA, Passes',
    chips: ['LLVM IR', 'Analysis', 'Backend'],
  },
  {
    title: 'COA / Performance',
    description:
      'Understand how processors execute code, how memory hierarchy shapes speed, and why compiler decisions show up on real hardware.',
    tag: 'Systems-focused',
    to: '/docs/coa',
    cta: 'Start COA',
    tone: 'coa',
    coverLabel: 'Pipelines, Cache, Memory',
    chips: ['Execution', 'Latency', 'Throughput'],
  },
  {
    title: 'MLIR / ML Compilers',
    description:
      'Move into MLIR, staged lowering, and the compiler stack behind modern AI systems.',
    tag: 'Advanced path',
    to: '/docs/tracks/ml-compilers',
    cta: 'Start MLIR',
    tone: 'mlir',
    coverLabel: 'Dialects and Lowering',
    chips: ['MLIR', 'Dialects', 'Lowering'],
  },
  {
    title: 'GPU / Parallel Programming',
    description:
      'Study GPU execution, memory hierarchy, OpenCL, and hardware-aware optimization.',
    tag: 'Parallel path',
    to: '/docs/tracks/gpu-compilers',
    cta: 'Start GPU',
    tone: 'gpu',
    coverLabel: 'Parallel work at scale',
    chips: ['SIMT', 'OpenCL', 'Memory'],
  },
  {
    title: 'C++ for Systems',
    description:
      'Build the C++ foundation needed for systems work, compiler internals, and performance-oriented programming.',
    tag: 'Implementation base',
    to: '/docs/c++/CppTutorial',
    cta: 'Start C++',
    tone: 'cpp',
    coverLabel: 'Language for implementation',
    chips: ['C++', 'Memory', 'Tooling'],
  },
];

const CATALOGUE_ITEMS = [
  {
    title: 'Latest Articles',
    description:
      'Read the newest deep dives, explainers, and technical writeups across compilers, LLVM, MLIR, GPU, and systems topics.',
    to: '/docs/articles',
    cta: 'See Latest Articles',
    tag: 'Read',
  },
  {
    title: 'Benchmark Reports',
    description:
      'Explore performance-focused benchmark reports, compiler comparisons, and evidence-driven analysis.',
    to: '/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter',
    cta: 'View Benchmarks',
    tag: 'Measure',
  },
  {
    title: 'Research Papers',
    description:
      'Go deeper with curated research papers across LLVM, MLIR, GPU systems, compiler design, and computer architecture.',
    to: '/library',
    cta: 'Browse Papers',
    tag: 'Research',
  },
  {
    title: 'Books',
    description:
      'Use curated books and long-form references when you want structured, deeper study.',
    to: '/books',
    cta: 'Browse Books',
    tag: 'Study',
  },
  {
    title: 'MCQs / Practice',
    description:
      'Practice what you learned with topic-based MCQs and quizzes. Good for revision, interviews, and checking whether concepts actually stuck.',
    to: '/docs/mcq/questions/domain/coa',
    cta: 'Start Practice',
    tag: 'Practice',
  },
];

const FIRST_READS = [
  {
    title: 'LLVM Roadmap',
    description: 'Best first stop if you want a guided LLVM sequence instead of random docs hopping.',
    to: '/docs/llvm/intro-to-llvm',
    tag: 'Beginner',
  },
  {
    title: 'How Source Code Becomes Binary',
    description: 'A clean bridge from high-level code into machine-level execution.',
    to: '/docs/compilers/sourcecode_to_executable',
    tag: 'Best First Read',
  },
  {
    title: 'How Modern Processors Execute Code',
    description: 'See how sequential, pipelined, speculative, SIMD, and multicore execution fit together.',
    to: '/docs/coa/types_of_execution',
    tag: 'Performance',
  },
  {
    title: 'Memory Hierarchy for Compiler Engineers',
    description: 'Understand why cache, locality, and memory behavior dominate real performance.',
    to: '/docs/coa/memory-hierarchy',
    tag: 'Deep Dive',
  },
  {
    title: 'GCC vs Clang Benchmark Report',
    description: 'Benchmark-driven analysis that connects compiler behavior to generated performance.',
    to: '/docs/articles/gcc_vs_clang_real_benchmarks_2026_reporter',
    tag: 'Popular',
  },
  {
    title: 'Seeing the ML Compiler Stack Live on AMD GPU',
    description: 'A concrete way to connect ML compilers, GPU execution, and the broader toolchain.',
    to: '/docs/ml-compilers/seeing-the-ml-compiler-stack-live-on-amd-gpu',
    tag: 'ML Compilers',
  },
];

const RETURN_PATHS = [
  {
    title: 'Continue with LLVM',
    description: 'Pick up from architecture into IR, SSA, passes, and analysis flow.',
    to: '/docs/tracks/llvm-and-ir',
  },
  {
    title: 'Go deeper on performance',
    description: 'Move from execution models into cache, memory behavior, and benchmarking.',
    to: '/docs/coa',
  },
  {
    title: 'Browse the paper library',
    description: 'Use curated shelves when you want references, papers, and deeper reading.',
    to: '/library',
  },
];

const WHY_STAY = [
  {
    title: 'Guided paths',
    description: 'Choose a direction and keep going instead of bouncing through a docs maze.',
  },
  {
    title: 'Real engineering depth',
    description: 'LLVM, IR, optimization, execution models, and benchmark-driven writing.',
  },
  {
    title: 'Practical references',
    description: 'Tracks, papers, books, benchmarks, and MCQs stay connected instead of living in separate corners.',
  },
];

function HomepageHeader() {
  return <Hero newsletterUrl={NEWSLETTER_URL} />;
}

function StartHereSection() {
  return (
    <section className={styles.sectionBlock}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Start Here</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Choose your learning path
          </Heading>
          <p className={styles.sectionText}>
            Pick one path and go deeper. CompilerSutra should guide you to the right starting point, then keep you moving.
          </p>
        </div>

        <div className={styles.pathGrid}>
          {START_PATHS.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className={clsx(styles.pathCard, styles.revealItem)}
              data-track={item.cta}
              data-reveal
            >
              <div className={clsx(styles.cardCover, styles[`tone${item.tone.charAt(0).toUpperCase()}${item.tone.slice(1)}`])}>
                <div className={styles.cardCoverInner}>
                  <span className={styles.cardCoverEyebrow}>{item.coverLabel}</span>
                  <div className={styles.cardChipRow}>
                    {item.chips.map((chip) => (
                      <span key={chip} className={styles.cardChip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
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

function WhyStaySection() {
  return (
    <section className={styles.sectionBlockAlt}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Why People Stay</p>
          <Heading as="h2" className={styles.sectionTitle}>
            A cleaner way to keep learning
          </Heading>
        </div>

        <div className={styles.whyGrid}>
          {WHY_STAY.map((item) => (
            <article key={item.title} className={clsx(styles.whyCard, styles.revealItem)} data-reveal>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogueSection() {
  return (
    <section className={styles.sectionBlockAlt}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Browse CompilerSutra</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Pick how you want to learn
          </Heading>
          <p className={styles.sectionText}>
            You can start with a guided path, read a deep article, explore benchmarks, study papers, or practice with MCQs.
          </p>
        </div>

        <div className={styles.catalogueGrid}>
          {CATALOGUE_ITEMS.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className={clsx(styles.catalogueCard, styles.revealItem)}
              data-track={item.title}
              data-reveal
            >
              <span className={styles.catalogueTag}>{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className={styles.catalogueLink}>
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

function PopularResourcesSection() {
  return (
    <section className={styles.sectionBlock}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Best First Reads</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Start with what readers open most
          </Heading>
          <p className={styles.sectionText}>
            These are the strongest starting pages if you want a quick way into the site.
          </p>
        </div>

        <div className={styles.resourceGrid}>
          {FIRST_READS.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className={clsx(styles.resourceCard, styles.revealItem)}
              data-track={item.title}
              data-reveal
            >
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

function LeadMagnetSection() {
  return (
    <section className={styles.sectionBlockAlt}>
      <div className={clsx('container', styles.leadMagnetShell)}>
        <div className={styles.leadMagnetCard}>
          <div className={styles.leadMagnetCopy}>
            <p className={styles.sectionEyebrow}>Starter Pack</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Get the CompilerSutra Starter Pack
          </Heading>
          <p className={styles.sectionText}>
            Get the best starting resources for LLVM, compiler engineering, and performance-focused systems learning.
          </p>
            <ul className={styles.leadMagnetList}>
              <li>LLVM IR reading starter guide</li>
              <li>Compiler engineer roadmap</li>
              <li>Best first reads across LLVM, MLIR, GPU, and performance</li>
            </ul>
          </div>

          <div className={styles.leadMagnetAction}>
            <Link
              className={clsx('button button--lg', styles.primaryButton)}
              to={NEWSLETTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-track="starter_pack_cta"
            >
              <FaEnvelope aria-hidden="true" />
              Send Me the Pack
            </Link>
            <p className={styles.formNote}>
              No spam. Just practical compiler notes, new articles, and curated resources.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReturnPathSection() {
  return (
    <section className={styles.sectionBlock}>
      <div className={clsx('container', styles.sectionShell)}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Come Back Deeper</p>
          <Heading as="h2" className={styles.sectionTitle}>
            Come back when you want to go deeper
          </Heading>
          <p className={styles.sectionText}>
            Use the homepage as a re-entry point into tracks, deep dives, and the paper library.
          </p>
        </div>

        <div className={styles.returnGrid}>
          {RETURN_PATHS.map((item) => (
            <Link key={item.title} to={item.to} className={clsx(styles.returnCard, styles.revealItem)} data-reveal>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <FaArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StickyCta() {
  return (
    <div className={styles.stickyCta}>
      <Link to="/docs/tracks/llvm-and-ir" className={styles.stickyPrimary}>
        <FaBookOpen aria-hidden="true" />
        Start LLVM
      </Link>
      <Link
        to={NEWSLETTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.stickySecondary}
      >
        <FaEnvelope aria-hidden="true" />
        Get Starter Pack
      </Link>
    </div>
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

      <HomepageHeader />
      <main>
        <StartHereSection />
        <WhyStaySection />
        <CatalogueSection />
        <PopularResourcesSection />
        <LeadMagnetSection />
        <ReturnPathSection />
      </main>
      <StickyCta />
    </Layout>
  );
}
