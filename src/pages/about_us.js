import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Heading from '@theme/Heading';
import { FaArrowRight, FaYoutube, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import styles from './about_us.module.css';

const COMPILER_LAYER = [
  ['C', 'Code We Write', 'Every system starts with intent turned into expression.'],
  ['O', 'Optimize What We Write', 'Performance is a discipline, not an afterthought.'],
  ['M', 'Build Modular Systems', 'Good architecture survives the next engineer.'],
  ['P', 'Measure & Improve Performance', 'If you can\'t measure it, you can\'t improve it.'],
  ['I', 'Instrument to Understand', 'Observability is the lens through which systems reveal themselves.'],
  ['L', 'Link the Full Flow', 'From source to binary — every link in the chain matters.'],
  ['E', 'Execute Efficiently', 'The machine doesn\'t care about your intentions. Only your instructions.'],
  ['R', 'Ensure Reliability', 'Correctness is the foundation. Everything else is noise.'],
];

const SUTRA_LAYER = [
  ['S', 'Scale with Simplicity & Security', 'Systems that endure are those built with clarity.'],
  ['U', 'Understand Before Building', 'Clarity of thought precedes clarity of code.'],
  ['T', 'Tooling that Evolves', 'Great tools compound. Invest in them early.'],
  ['R', 'Refine Through Iteration', 'The first version is a hypothesis. Ship it, learn, improve.'],
  ['A', 'Architecture First', 'Structure outlasts syntax. Design to withstand time.'],
];

const SOCIAL_LINKS = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@compilersutra',
    icon: FaYoutube,
    description: 'Deep-dives into compilers, LLVM & GPU systems',
    colorClass: styles.socialYoutube,
  },
  {
    label: 'WhatsApp Community',
    href: 'https://chat.whatsapp.com/C5lBzje4CjvLTZBhS0O92x',
    icon: FaWhatsapp,
    description: 'Join our engineers\' community chat',
    colorClass: styles.socialWhatsapp,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61577245012547',
    icon: FaFacebook,
    description: 'Follow updates, articles & announcements',
    colorClass: styles.socialFacebook,
  },
];

const STATS = [
  { value: '50+', label: 'In-depth modules' },
  { value: 'LLVM', label: 'Core focus' },
  { value: 'GPU', label: 'Execution layer' },
  { value: '∞', label: 'Curiosity required' },
];

export default function AboutUsPage() {
  const pageUrl = 'https://www.compilersutra.com/about_us/';
  const socialImage = 'https://www.compilersutra.com/img/compilersutra-social-card.png';
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('[data-observe]');
    if (!cards) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <Layout
      title="About CompilerSutra"
      description="CompilerSutra is where deep systems understanding meets practical compiler engineering."
    >
      <Head>
        <meta property="og:title" content="About CompilerSutra" />
        <meta property="og:description" content="Learn compilers, LLVM, GPU systems, and performance engineering with a systems-first mindset." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={socialImage} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <main className={styles.page} ref={gridRef}>

        {/* ── AMBIENT NOISE LAYER ── */}
        <div className={styles.noise} aria-hidden="true" />

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <section className={styles.hero}>
          <div className={styles.heroGlowA} aria-hidden="true" />
          <div className={styles.heroGlowB} aria-hidden="true" />
          <div className={styles.heroGlowC} aria-hidden="true" />
          <div className={styles.lightBeam} aria-hidden="true" />

          {/* Scanline grid */}
          <div className={styles.heroGrid} aria-hidden="true" />

          <div className={clsx('container', styles.heroShell)}>
            <div className={styles.heroCopy}>
              <div className={styles.badge}>
                <span className={styles.badgeDot} />
                About CompilerSutra
              </div>

              <Heading as="h1" className={styles.title}>
                Built for engineers who care about how{' '}
                <span className={styles.titleAccent}>code actually runs.</span>
              </Heading>

              <p className={styles.lead}>
                Learn how code transforms into real execution — from compiler pipelines
                to CPU and GPU behavior, at every layer of the stack.
              </p>

              <p className={styles.pipeline}>
                <span>Source</span>
                <span className={styles.pipelineArrow}>→</span>
                <span>Compiler</span>
                <span className={styles.pipelineArrow}>→</span>
                <span>Machine Code</span>
                <span className={styles.pipelineArrow}>→</span>
                <span>Hardware</span>
              </p>

              <div className={styles.actions}>
                <Link className={styles.primaryAction} to="/docs/start-here">
                  Start learning <FaArrowRight />
                </Link>
                <Link className={styles.secondaryAction} to="/docs/tracks">
                  Explore tracks
                </Link>
              </div>
            </div>

            {/* Stat cluster */}
            <aside className={styles.heroStats}>
              {STATS.map(({ value, label }) => (
                <div key={label} className={styles.statBlock}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
              <div className={styles.statDivider} />
              <p className={styles.statTagline}>
                Not just syntax.<br />
                Not just frameworks.<br />
                What happens <em>inside</em> the machine.
              </p>
            </aside>
          </div>
        </section>

        {/* ══════════════════════════════
            MANIFESTO BAND
        ══════════════════════════════ */}
        <div className={styles.manifestoBand}>
          <div className={clsx('container', styles.manifestoInner)}>
            <div className={styles.manifestoBlock}>
              <span className={styles.manifestoWord}>COMPILER</span>
              <span className={styles.manifestoSub}>Engineering Layer</span>
            </div>
            <div className={styles.manifestoDivider} aria-hidden="true" />
            <div className={styles.manifestoBlock}>
              <span className={styles.manifestoWord}>SUTRA</span>
              <span className={styles.manifestoSub}>Philosophy Layer</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            COMPILER SECTION
        ══════════════════════════════ */}
        <section className={styles.section}>
          <div className={clsx('container', styles.sectionShell)}>
            <header className={styles.sectionHeader} data-observe>
              <span className={styles.kicker}>C · O · M · P · I · L · E · R · S</span>
              <Heading as="h2" className={styles.sectionTitle}>
                The engineering foundation<br />behind every system.
              </Heading>
              <p className={styles.sectionDesc}>
                Each letter isn't decoration — it's a principle we teach, practice, and refine.
              </p>
            </header>

            <div className={styles.acronymGrid}>
              {COMPILER_LAYER.map(([letter, title, desc], index) => (
                <article
                  key={letter}
                  className={styles.acronymCard}
                  style={{ '--i': index }}
                  data-observe
                >
                  <div className={styles.letterWrap}>
                    <span className={styles.letter}>{letter}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <strong className={styles.cardTitle}>{title}</strong>
                    <p className={styles.cardDesc}>{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            SUTRA SECTION
        ══════════════════════════════ */}
        <section className={clsx(styles.section, styles.sutraSection)}>
          <div className={styles.sutraBgGlow} aria-hidden="true" />
          <div className={clsx('container', styles.sectionShell)}>
            <header className={styles.sectionHeader} data-observe>
              <span className={styles.kicker}>S · U · T · R · A</span>
              <Heading as="h2" className={styles.sectionTitle}>
                The philosophy behind<br />how we build.
              </Heading>
              <p className={styles.sectionDesc}>
                A sutra is a thread — the guiding principle that runs through everything we create.
              </p>
            </header>

            <div className={styles.sutraGrid}>
              {SUTRA_LAYER.map(([letter, title, desc], index) => (
                <article
                  key={letter}
                  className={styles.sutraCard}
                  style={{ '--i': index }}
                  data-observe
                >
                  <span className={styles.sutraLetter}>{letter}</span>
                  <div className={styles.sutraBody}>
                    <strong className={styles.sutraTitle}>{title}</strong>
                    <p className={styles.sutraDesc}>{desc}</p>
                  </div>
                  <div className={styles.sutraLine} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            COMMUNITY / SOCIAL
        ══════════════════════════════ */}
        <section className={clsx(styles.section, styles.communitySection)}>
          <div className={clsx('container', styles.sectionShell)}>
            <header className={styles.sectionHeader} data-observe>
              <span className={styles.kicker}>Community</span>
              <Heading as="h2" className={styles.sectionTitle}>
                Learn together. Build together.
              </Heading>
              <p className={styles.sectionDesc}>
                Join engineers across the world who are serious about systems.
              </p>
            </header>

            <div className={styles.socialGrid}>
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, description, colorClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(styles.socialCard, colorClass)}
                  data-observe
                >
                  <div className={styles.socialIconWrap}>
                    <Icon className={styles.socialIcon} />
                  </div>
                  <div className={styles.socialBody}>
                    <strong className={styles.socialLabel}>{label}</strong>
                    <p className={styles.socialDesc}>{description}</p>
                  </div>
                  <FaArrowRight className={styles.socialArrow} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            CLOSING CTA
        ══════════════════════════════ */}
        <section className={clsx(styles.section, styles.closingSection)}>
          <div className={styles.closingGlow} aria-hidden="true" />
          <div className={clsx('container', styles.closingShell)}>
            <p className={styles.kicker}>Start Here</p>
            <Heading as="h2" className={styles.closingTitle}>
              CompilerSutra is where<br />
              <span className={styles.titleAccent}>code meets execution.</span>
            </Heading>
            <p className={styles.closingLead}>
              From LLVM internals to GPU execution models — we focus on real systems,
              real performance, and real understanding.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} to="/docs/start-here">
                Start learning <FaArrowRight />
              </Link>
              <a
                href="https://www.youtube.com/@compilersutra"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(styles.secondaryAction, styles.youtubeAction)}
              >
                <FaYoutube /> Watch on YouTube
              </a>
            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
}