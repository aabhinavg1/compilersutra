import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Heading from '@theme/Heading';
import {
  FaArrowRight,
  FaBookOpen,
  FaCodeBranch,
  FaLayerGroup,
  FaMicrochip,
  FaUsers,
} from 'react-icons/fa';
import styles from './about_us.module.css';

const PRINCIPLES = [
  {
    icon: <FaBookOpen aria-hidden="true" />,
    title: 'Teach the why, not just the syntax',
    text:
      'CompilerSutra is built for engineers who want mental models, not copy-paste fragments. The material aims to explain why a concept matters before asking you to memorize tooling.',
  },
  {
    icon: <FaCodeBranch aria-hidden="true" />,
    title: 'Connect theory to real compiler workflows',
    text:
      'We move from IR, passes, and analysis into concrete artifacts, examples, and performance discussions so the learning path feels like engineering work instead of isolated notes.',
  },
  {
    icon: <FaMicrochip aria-hidden="true" />,
    title: 'Tie software abstractions back to hardware',
    text:
      'A lot of compiler learning becomes clearer once execution models, memory behavior, and system constraints are part of the explanation. That systems view is a core part of the site.',
  },
];

const COVERAGE = [
  'Compiler fundamentals and core terminology',
  'LLVM, IR structure, passes, and tooling',
  'GPU programming, OpenCL, and heterogeneous systems',
  'ML compiler paths including MLIR and TVM-oriented material',
  'Labs, benchmark-driven articles, and practical references',
  'Structured tracks that reduce random wandering through docs',
];

const AUDIENCE = [
  'Students moving from programming into systems and compilers',
  'C++ or backend engineers who want to understand optimization more deeply',
  'GPU developers who need clearer bridges between execution and compiler behavior',
  'Self-learners who prefer sequenced material over fragmented tutorials',
];

export default function AboutUsPage() {
  const pageUrl = 'https://www.compilersutra.com/about_us/';
  const socialImage = 'https://www.compilersutra.com/img/compilersutra-social-card.png';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About CompilerSutra',
    url: pageUrl,
    description:
      'Learn what CompilerSutra is building, who it is for, and why the platform focuses on structured compiler engineering education.',
  };

  return (
    <Layout
      title="About CompilerSutra"
      description="CompilerSutra is a structured learning platform for compiler engineering, LLVM, GPU systems, ML compilers, and performance-oriented programming."
    >
      <Head>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <meta property="og:title" content="About CompilerSutra" />
        <meta
          property="og:description"
          content="Structured compiler engineering education for LLVM, GPU systems, ML compilers, and performance-focused developers."
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={socialImage} />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={clsx('container', styles.heroShell)}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>About CompilerSutra</p>
              <Heading as="h1" className={styles.title}>
                A learning platform for people who want to understand compilers as systems.
              </Heading>
              <p className={styles.lead}>
                CompilerSutra exists to make compiler engineering more legible. The goal is not
                just to collect articles, but to organize a path through LLVM, IR, GPU systems,
                performance reasoning, and adjacent tools in a way that helps serious learners
                build intuition step by step.
              </p>

              <div className={styles.actions}>
                <Link className={styles.primaryAction} to="/docs/start-here">
                  Start learning
                  <FaArrowRight aria-hidden="true" />
                </Link>
                <Link className={styles.secondaryAction} to="/docs/tracks">
                  Explore tracks
                </Link>
              </div>
            </div>

            <aside className={styles.summaryPanel}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryIcon}>
                  <FaLayerGroup aria-hidden="true" />
                </span>
                <h2>What we optimize for</h2>
                <p>
                  Clear sequencing, practical examples, and explanations that keep execution
                  models, hardware behavior, and real toolchains in view.
                </p>
              </div>

              <div className={styles.summaryGrid}>
                <div className={styles.miniCard}>
                  <strong>LLVM to GPU</strong>
                  <span>Coverage across modern compiler workflows</span>
                </div>
                <div className={styles.miniCard}>
                  <strong>Roadmaps first</strong>
                  <span>Less random browsing, more deliberate progression</span>
                </div>
                <div className={styles.miniCard}>
                  <strong>Docs plus labs</strong>
                  <span>Theory reinforced with practical material</span>
                </div>
                <div className={styles.miniCard}>
                  <strong>Open access</strong>
                  <span>Core material meant to stay broadly reachable</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={clsx('container', styles.sectionShell)}>
            <div className={styles.sectionHeader}>
              <p className={styles.kicker}>Why it exists</p>
              <Heading as="h2" className={styles.sectionTitle}>
                The site is designed to reduce the usual friction in learning compilers.
              </Heading>
              <p className={styles.sectionLead}>
                A lot of compiler material is either too abstract, too fragmented, or too focused
                on syntax without enough systems context. CompilerSutra tries to close that gap.
              </p>
            </div>

            <div className={styles.principles}>
              {PRINCIPLES.map((item) => (
                <article key={item.title} className={styles.principleCard}>
                  <span className={styles.principleIcon}>{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.detailBand)}>
          <div className={clsx('container', styles.dualGrid)}>
            <article className={styles.listPanel}>
              <p className={styles.kicker}>What you will find here</p>
              <Heading as="h2" className={styles.sectionTitle}>
                Coverage built around connected topics, not isolated keywords.
              </Heading>
              <ul className={styles.list}>
                {COVERAGE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className={styles.listPanel}>
              <p className={styles.kicker}>Who this is for</p>
              <Heading as="h2" className={styles.sectionTitle}>
                Learners who want a more engineering-driven path into the field.
              </Heading>
              <ul className={styles.list}>
                {AUDIENCE.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={clsx('container', styles.communityPanel)}>
            <div>
              <p className={styles.kicker}>Community</p>
              <Heading as="h2" className={styles.sectionTitle}>
                CompilerSutra grows through ongoing writing, discussion, and iteration.
              </Heading>
              <p className={styles.sectionLead}>
                If the material helps, the best next step is simple: use the roadmaps, share the
                site with another engineer, ask better questions, and keep building depth over
                time.
              </p>
            </div>

            <div className={styles.communityActions}>
              <Link className={styles.primaryAction} to="https://www.youtube.com/@compilersutra">
                Watch on YouTube
              </Link>
              <Link className={styles.ghostAction} to="mailto:tiwariabhinavak@gmail.com">
                Contact CompilerSutra
              </Link>
              <Link className={styles.ghostAction} to="https://compilersutra.quora.com/">
                Join Q&amp;A
              </Link>
              <div className={styles.communityBadge}>
                <FaUsers aria-hidden="true" />
                <span>Built for independent learners and working engineers</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
