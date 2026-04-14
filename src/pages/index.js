import React, { lazy, Suspense } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import {
  FaArrowRight,
  FaCodeBranch,
  FaCompass,
  FaMicrochip,
  FaQuestionCircle,
  FaRocket,
  FaSitemap,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const HomepageFeatures = lazy(() => import('@site/src/components/HomepageFeatures'));

const STATS = [
  { value: '4', label: 'Structured tracks' },
  { value: 'Docs + labs', label: 'Practical format' },
  { value: 'LLVM to GPU', label: 'Coverage arc' },
  { value: 'Free core', label: 'Open access' },
];

const ENTRY_POINTS = [
  {
    title: 'Start with the roadmap',
    description:
      'Use the guided entry path if you want the site to tell you what to learn next.',
    to: '/docs/start-here',
  },
  {
    title: 'Go deep on LLVM and IR',
    description:
      'Jump into SSA, passes, analysis flow, and toolchain internals when you already know the basics.',
    to: '/docs/tracks/llvm-and-ir',
  },
  {
    title: 'Follow the GPU compiler path',
    description:
      'Move from GPU execution fundamentals into OpenCL, heterogeneous systems, and performance reasoning.',
    to: '/docs/tracks/gpu-compilers',
  },
];

const HERO_PILLARS = [
  {
    icon: <FaCodeBranch aria-hidden="true" />,
    title: 'IR and passes',
    text: 'Understand what the compiler is transforming, not just which flag to type.',
  },
  {
    icon: <FaMicrochip aria-hidden="true" />,
    title: 'GPU and systems',
    text: 'Connect compiler decisions to execution models, memory behavior, and hardware realities.',
  },
  {
    icon: <FaSitemap aria-hidden="true" />,
    title: 'Tracks that sequence the work',
    text: 'Learn in deliberate layers instead of getting lost in an unstructured docs tree.',
  },
];

const ABOUT_POINTS = [
  {
    title: 'Structured learning over random article hopping',
    description:
      'CompilerSutra is organized to help learners move from fundamentals into LLVM, GPU systems, and performance reasoning without losing the thread.',
  },
  {
    title: 'Systems intuition stays in the loop',
    description:
      'The site treats compilers as part of a larger execution story, so hardware behavior, IR decisions, and tooling are explained together.',
  },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBackdrop} aria-hidden="true">
        <div className={styles.heroGlowA} />
        <div className={styles.heroGlowB} />
        <div className={styles.heroMesh} />
      </div>

      <div className={clsx('container', styles.heroShell)}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Compiler engineering for serious builders</div>

          <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
            {siteConfig.title}
          </Heading>

          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
            Learn compiler engineering through roadmaps, LLVM and IR tracks,
            GPU compiler material, tools, labs, and benchmark-driven writing.
          </p>

          <p className={styles.heroLead}>
            The homepage should route you quickly: start from fundamentals,
            branch into LLVM or GPU systems, then reinforce the theory with
            labs, tooling, and performance-oriented articles.
          </p>

          <div className={styles.heroActions}>
            <Link
              className={clsx('button button--lg', styles.primaryButton)}
              to="/docs/start-here"
            >
              <FaRocket aria-hidden="true" />
              Start the roadmap
            </Link>

            <Link className={clsx('button button--lg', styles.secondaryButton)} to="/docs/tracks">
              Explore tracks
            </Link>
          </div>

          <div className={styles.socialRow}>
            <Link to="/docs/tools" className={styles.inlineLink}>
              Tools
            </Link>
            <Link to="/docs/labs" className={styles.inlineLink}>
              Labs
            </Link>
            <Link
              to="https://compilersutra.quora.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              <FaQuestionCircle aria-hidden="true" />
              Ask
            </Link>
            <Link
              to="https://twitter.com/CompilerSutra"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              <FaTwitter aria-hidden="true" />
              Follow
            </Link>
            <Link
              to="https://www.youtube.com/@compilersutra"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.inlineLink}
            >
              <FaYoutube aria-hidden="true" />
              Watch
            </Link>
          </div>
        </div>

        <div className={styles.heroPanels}>
          <aside className={styles.signalPanel}>
            <p className={styles.panelEyebrow}>How to use the site</p>
            <div className={styles.entryList}>
              {ENTRY_POINTS.map((item) => (
                <Link key={item.title} to={item.to} className={styles.entryCard}>
                  <div>
                    <h2 className={styles.entryTitle}>{item.title}</h2>
                    <p className={styles.entryText}>{item.description}</p>
                  </div>
                  <FaArrowRight aria-hidden="true" className={styles.entryIcon} />
                </Link>
              ))}
            </div>
          </aside>

          <aside className={styles.frameworkPanel}>
            <p className={styles.panelEyebrow}>Why this feels different</p>
            <div className={styles.pillarList}>
              {HERO_PILLARS.map((pillar) => (
                <article key={pillar.title} className={styles.pillarCard}>
                  <span className={styles.pillarIcon}>{pillar.icon}</span>
                  <div>
                    <h2 className={styles.pillarTitle}>{pillar.title}</h2>
                    <p className={styles.pillarText}>{pillar.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>

        <div className={styles.stats}>
          {STATS.map(({ value, label }) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function AboutSection() {
  return (
    <section className={styles.aboutSection}>
      <div className={clsx('container', styles.aboutShell)}>
        <div className={styles.aboutIntro}>
          <p className={styles.aboutEyebrow}>About CompilerSutra</p>
          <Heading as="h2" className={styles.aboutTitle}>
            Built for learners who want compilers explained like engineering, not trivia.
          </Heading>
          <p className={styles.aboutText}>
            CompilerSutra focuses on compiler engineering, LLVM, GPU systems, and
            performance-oriented learning paths. The aim is to make hard topics feel
            navigable by sequencing the material, keeping execution context visible, and
            connecting theory to real tools and artifacts.
          </p>

          <Link className={styles.aboutLink} to="/about_us">
            <FaCompass aria-hidden="true" />
            Read the full story
          </Link>
        </div>

        <div className={styles.aboutCards}>
          {ABOUT_POINTS.map((item) => (
            <article key={item.title} className={styles.aboutCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
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
      'Master LLVM, MLIR, TVM and compiler development with structured tutorials, hands-on projects, and expert-backed lessons.',
    about: [
      'LLVM',
      'MLIR',
      'TVM',
      'Compiler Design',
      'GPU Programming',
      'Systems Programming',
    ],
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: socialImage,
    },
  };

  return (
    <Layout
      title="CompilerSutra | LLVM, MLIR, TVM & Compiler Tutorials"
      description="Learn compiler engineering through roadmaps, LLVM and IR tracks, GPU compiler tutorials, tools, labs, and benchmark-driven articles."
    >
      <Head>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <meta
          property="og:title"
          content="CompilerSutra | LLVM, MLIR, TVM & Compiler Tutorials"
        />
        <meta
          property="og:description"
          content="Master LLVM, MLIR, TVM and compiler development with structured tutorials and hands-on projects."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:alt" content="CompilerSutra home page preview" />
        <meta
          name="twitter:title"
          content="CompilerSutra | LLVM, MLIR, TVM & Compiler Tutorials"
        />
        <meta
          name="twitter:description"
          content="Master LLVM, MLIR, TVM and compiler development. Free tutorials, projects, and community."
        />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content="CompilerSutra home page preview" />
      </Head>
      <HomepageHeader />
      <main>
        <AboutSection />
        <Suspense fallback={null}>
          <HomepageFeatures />
        </Suspense>
      </main>
    </Layout>
  );
}
