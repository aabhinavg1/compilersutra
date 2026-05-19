import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {
  FaArrowRight,
  FaEnvelope,
  FaGithub,
  FaHeart,
  FaShieldAlt,
  FaTools,
} from 'react-icons/fa';
import styles from './support.module.css';

const RAZORPAY_URL = 'https://razorpay.me/@compilersutra';
const GITHUB_SPONSOR_URL = 'https://github.com/sponsors/aabhinavg1';

const TRUST_POINTS = [
  'Support is handled through official Razorpay and GitHub Sponsors pages',
  'CompilerSutra never stores card details or payment credentials',
  'The educational content stays public and free to read',
  'You can still reach the project owner directly by email',
];

const SUPPORT_PATHS = [
  {
    label: 'Primary',
    title: 'Razorpay',
    text: 'Best for Indian supporters using a hosted INR checkout.',
    href: RAZORPAY_URL,
    cta: 'Support via Razorpay',
    note: 'International visitors may see INR and India-style phone fields here.',
    icon: FaShieldAlt,
    featured: true,
  },
  {
    label: 'Secondary',
    title: 'GitHub Sponsors',
    text: 'Best for international supporters and recurring sponsorships in a global checkout flow.',
    href: GITHUB_SPONSOR_URL,
    cta: 'Sponsor on GitHub',
    icon: FaGithub,
  },
];

const WHAT_SUPPORTS = [
  'Research-backed tutorials and explainers',
  'Benchmarks, experiments, and lab work',
  'Small tools, utilities, and learning aids',
  'Hosting, maintenance, and site infrastructure',
  'Open educational content with low friction access',
  'Regular updates across compiler and GPU topics',
];

const SUPPORT_CONTACTS = [
  {
    label: 'Email',
    value: 'osc@compilersutra.com',
    href: 'mailto:osc@compilersutra.com',
  },
  {
    label: 'LinkedIn',
    value: 'Abhinav Compiler LLVM',
    href: 'https://www.linkedin.com/in/abhinavcompilerllvm/',
  },
];

function Reveal({ as: Tag = 'div', className = '', delay = 0, style, children, ...rest }) {
  return (
    <Tag
      className={`${styles.reveal} ${className}`.trim()}
      style={{ '--delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function SupportOptionCard({ item, index }) {
  return (
    <article
      className={`${styles.optionCard} ${item.featured ? styles.optionCardFeatured : ''}`.trim()}
      style={{ '--delay': `${220 + index * 120}ms` }}
    >
      <div className={styles.optionHeader}>
        <div className={styles.optionLabelRow}>
          <span className={styles.optionLabel}>{item.label}</span>
          {item.featured ? <span className={styles.badge}>Recommended</span> : null}
        </div>
        <h3 className={styles.optionTitle}>
          <item.icon aria-hidden="true" className={styles.optionIcon} />
          <span>{item.title}</span>
        </h3>
      </div>

      <p className={styles.optionText}>{item.text}</p>
      {item.note ? <p className={styles.optionNote}>{item.note}</p> : null}

      <a
        className={item.featured ? styles.primaryAction : styles.secondaryAction}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.cta}
        <FaArrowRight aria-hidden="true" />
      </a>
    </article>
  );
}

export default function Support() {
  return (
    <Layout
      title="Support Us"
      description="Support CompilerSutra through a hosted Razorpay page or GitHub Sponsors."
    >
      <Head>
        <meta name="robots" content="index, follow" />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.shell}>
            <div className={styles.heroLayout}>
              <div className={styles.heroCopy}>
                <Reveal as="p" className={styles.eyebrow} delay={0}>
                  Support the project
                </Reveal>
                <Reveal as="h1" className={styles.title} delay={60}>
                  Support CompilerSutra
                </Reveal>
                <Reveal as="p" className={styles.lede} delay={140}>
                  CompilerSutra publishes practical education on compilers, LLVM, GPU systems, OpenCL,
                  C++, and low-level software engineering.
                </Reveal>
                <Reveal as="p" className={styles.impact} delay={220}>
                  Support keeps the content independent, the examples current, and the technical work
                  focused on clear explanations instead of ads or unnecessary friction.
                </Reveal>

                <div className={styles.actions} aria-label="Primary page actions">
                  <a className={styles.primaryAction} href="#support-options">
                    Choose a support option
                    <FaArrowRight aria-hidden="true" />
                  </a>
                  <Link className={styles.textAction} to="/">
                    Back to home
                  </Link>
                </div>

                <div className={styles.microcopyRow} aria-label="Support assurances">
                  <span className={styles.microcopyPill}>Hosted checkout</span>
                  <span className={styles.microcopyPill}>No card storage</span>
                  <span className={styles.microcopyPill}>Public learning content</span>
                </div>
              </div>

              <aside className={styles.heroPanel} aria-label="Why support matters">
                <Reveal as="p" className={styles.panelLabel} delay={120}>
                  What support covers
                </Reveal>
                <ul className={styles.panelList}>
                  {WHAT_SUPPORTS.slice(0, 4).map((item, index) => (
                    <Reveal as="li" key={item} className={styles.panelItem} delay={180 + index * 80}>
                      <FaTools aria-hidden="true" className={styles.panelIcon} />
                      <span>{item}</span>
                    </Reveal>
                  ))}
                </ul>
                <Reveal as="p" className={styles.panelNote} delay={520}>
                  The checkout happens on Razorpay or GitHub Sponsors, so CompilerSutra stays focused on
                  educational content and never handles sensitive payment data itself.
                </Reveal>
              </aside>
            </div>
          </div>
        </section>

        <section id="support-options" className={styles.section}>
          <div className={styles.shell}>
            <div className={styles.sectionHeader}>
              <Reveal as="p" className={styles.sectionEyebrow} delay={80}>
                Support options
              </Reveal>
              <Reveal as="h2" className={styles.sectionTitle} delay={140}>
                Choose the path that fits how you want to help.
              </Reveal>
              <Reveal as="p" className={styles.sectionText} delay={200}>
                Both options lead to official checkout pages. Pick the one that is simplest for you.
              </Reveal>
            </div>

            <div className={styles.contentGrid}>
              <div className={styles.optionsColumn}>
                <div className={styles.optionsGrid}>
                  {SUPPORT_PATHS.map((item, index) => (
                    <SupportOptionCard key={item.title} item={item} index={index} />
                  ))}
                </div>
              </div>

              <aside className={styles.sideColumn}>
                <div className={styles.trustPanel}>
                  <Reveal as="p" className={styles.sideTitle} delay={160}>
                    Support details
                  </Reveal>
                  <ul className={styles.trustList}>
                    {TRUST_POINTS.map((item, index) => (
                      <Reveal as="li" key={item} className={styles.trustItem} delay={220 + index * 70}>
                        <FaShieldAlt aria-hidden="true" className={styles.trustIcon} />
                        <span>{item}</span>
                      </Reveal>
                    ))}
                  </ul>
                </div>

                <div className={styles.contactPanel}>
                  <Reveal as="p" className={styles.sideTitle} delay={520}>
                    Mail an article topic
                  </Reveal>
                  <Reveal as="p" className={styles.contactText} delay={600}>
                    Mail the topic or article idea you want covered, and I’ll take it from there.
                  </Reveal>
                  <ul className={styles.contactList}>
                    {SUPPORT_CONTACTS.map((item, index) => {
                      const isExternal = item.href.startsWith('http');
                      return (
                        <Reveal as="li" key={item.label} className={styles.contactItem} delay={680 + index * 90}>
                          <FaEnvelope aria-hidden="true" className={styles.contactIcon} />
                          <span className={styles.contactLabel}>{item.label}</span>
                          <a
                            className={styles.contactLink}
                            href={item.href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                          >
                            {item.value}
                          </a>
                        </Reveal>
                      );
                    })}
                  </ul>
                </div>

                <div className={styles.supportUses}>
                  <Reveal as="p" className={styles.sideTitle} delay={860}>
                    Education areas supported
                  </Reveal>
                  <ul className={styles.supportUsesList}>
                    {WHAT_SUPPORTS.slice(4).map((item, index) => (
                      <Reveal as="li" key={item} className={styles.supportUsesItem} delay={920 + index * 80}>
                        <FaHeart aria-hidden="true" className={styles.supportUsesIcon} />
                        <span>{item}</span>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
