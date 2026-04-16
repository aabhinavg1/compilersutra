import React from 'react';
import styles from './CompilerSutraIntro.module.css';

const aboutLines = [
  'Not just syntax. Not just frameworks.',
  'But what happens inside the compiler, the CPU, and the GPU when your code executes.',
  'From source code -> compiler -> machine code -> hardware execution.',
  'We break down the full pipeline.',
];

const compilerLines = [
  ['C', 'Code with clarity'],
  ['O', 'Optimize with intent'],
  ['M', 'Modularize for scale'],
  ['P', 'Performance through measurement'],
  ['I', 'Instrument to understand'],
  ['L', 'Link the full system'],
  ['E', 'Execute efficiently'],
  ['R', 'Ensure reliability'],
  ['S', 'Scale with simplicity & security'],
];

const sutraLines = [
  ['S', 'Systems First'],
  ['U', 'Understand Before Building'],
  ['T', 'Tooling that Evolves'],
  ['R', 'Refine Continuously'],
  ['A', 'Architecture & Adaptability'],
];

export default function AboutSection() {
  return (
    <section className={styles.aboutSection} aria-labelledby="compilersutra-about-title">
      <div className={styles.sectionDivider} aria-hidden="true" />

      <div className={styles.contentShell}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Execution View</p>
          <h2 id="compilersutra-about-title" className={styles.sectionTitle}>
            A system coming alive.
          </h2>
        </header>

        <div className={styles.aboutCopy}>
          {aboutLines.map((line, index) => (
            <p
              key={line}
              className={styles.aboutLine}
              style={{ '--delay': `${index * 160}ms` }}
            >
              {line}
            </p>
          ))}
        </div>

        <div className={styles.dualPanel}>
          <section className={styles.compilerPanel} aria-labelledby="compilers-label">
            <div className={styles.panelHeader}>
              <p className={styles.panelEyebrow}>Execution Layer</p>
              <h3 id="compilers-label" className={styles.panelTitle}>
                COMPILERS
              </h3>
            </div>

            <div className={styles.pipelineList}>
              {compilerLines.map(([letter, text], index) => (
                <div
                  key={letter}
                  className={styles.pipelineItem}
                  style={{ '--delay': `${index * 120}ms` }}
                >
                  <span className={styles.pipelineLetter}>{letter}</span>
                  <span className={styles.pipelineText}>{text}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sutraPanel} aria-labelledby="sutra-label">
            <div className={styles.panelHeader}>
              <p className={styles.panelEyebrow}>Philosophy Layer</p>
              <h3 id="sutra-label" className={styles.panelTitle}>
                SUTRA
              </h3>
            </div>

            <div className={styles.sutraList}>
              {sutraLines.map(([letter, text], index) => (
                <div
                  key={letter}
                  className={styles.sutraItem}
                  style={{ '--delay': `${200 + index * 140}ms` }}
                >
                  <span className={styles.sutraLetter}>{letter}</span>
                  <span className={styles.sutraText}>{text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
