import React from 'react';
import styles from './CompilerSutraIntro.module.css';

export default function HeroSection() {
  return (
    <section className={styles.heroSection} aria-labelledby="compilersutra-hero-title">
      <div className={styles.heroBackdrop} aria-hidden="true">
        <div className={styles.lightBeam} />
        <div className={styles.heroGlowLeft} />
        <div className={styles.heroGlowRight} />
      </div>

      <div className={styles.heroShell}>
        <p className={styles.heroEyebrow}>CompilerSutra</p>
        <h1 id="compilersutra-hero-title" className={styles.heroTitle}>
          <span className={styles.heroTitleCore}>CompilerSutra</span>
        </h1>
        <p className={styles.heroTagline}>
          Learn LLVM, compilers, MLIR, and GPU systems
          <span className={styles.heroTaglineBreak}>and understand how your code actually runs.</span>
        </p>
      </div>
    </section>
  );
}
