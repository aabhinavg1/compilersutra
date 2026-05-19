import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {
  FaArrowRight,
  FaCheck,
  FaCode,
  FaCopy,
  FaRocket,
  FaStar,
} from 'react-icons/fa';
// import AdBanner from '@site/src/components/AdBanner';
import { fireConfetti } from './confetti';
import { PHASES, PREREQUISITES, ROLES } from './roadmapData';
import useMouseSpotlight from './useMouseSpotlight';
import useParticleSystem from './useParticleSystem';
import useRevealAnimations from './useRevealAnimations';
import useRoadmapProgress from './useRoadmapProgress';
import styles from './RoadmapExperience.module.css';

function getDifficultyClass(label) {
  return {
    Foundation: styles.foundation,
    Intermediate: styles.intermediate,
    Advanced: styles.advanced,
    Expert: styles.expert,
  }[label];
}

function TypeQuote({ text }) {
  const [visibleText, setVisibleText] = useState('');
  const [start, setStart] = useState(false);
  const ref = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window === 'undefined') {
      return undefined;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisibleText(text);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [text]);

  useEffect(() => {
    if (!start) {
      return undefined;
    }

    if (hasAnimatedRef.current) {
      return undefined;
    }
    hasAnimatedRef.current = true;

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setVisibleText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, 18);

    return () => window.clearInterval(interval);
  }, [start, text]);

  return (
    <p ref={ref} className={styles.typeQuote} aria-label={text}>
      {visibleText || '\u00a0'}
      <span className={styles.typeCaret} aria-hidden="true" />
    </p>
  );
}

function CopySnippet() {
  const snippet = `main.velox
fn main() {
  print(2 + 2);
}`;
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={styles.snippetCard} data-reveal>
      <div>
        <p className={styles.snippetLabel}>Source file</p>
        <p className={styles.snippetMeta}>`main.velox` example</p>
        <code className={styles.snippetCode}>{snippet}</code>
      </div>
      <button type="button" className={styles.copyButton} onClick={onCopy}>
        {copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <span className={clsx(styles.toast, copied && styles.toastVisible)} role="status" aria-live="polite">
        <FaCheck aria-hidden="true" />
        Copied to clipboard
      </span>
    </div>
  );
}

function PipelineStrip() {
  const stages = [
    { label: 'Source', edge: 'tokens', hint: '.velox' },
    { label: 'Lexer', edge: 'AST', hint: 'tokens' },
    { label: 'Parser / AST', edge: 'IR', hint: 'syntax tree' },
    { label: 'LLVM IR + opt / llc', edge: 'asm', hint: 'post-IR tools' },
    { label: 'RISC-V asm', edge: 'binary', hint: 'lowering' },
    { label: 'Binary -> QEMU', edge: '', hint: 'runtime' },
  ];

  return (
    <div className={styles.pipelineStrip} data-reveal>
      {stages.map((stage, index) => (
        <React.Fragment key={stage.label}>
          <div className={styles.pipelineNode}>
            <span className={styles.pipelineHint}>{stage.hint}</span>
            <strong>{stage.label}</strong>
          </div>
          {index < stages.length - 1 ? (
            <div className={styles.pipelineArrow}>
              <span className={styles.pipelineEdge}>{stage.edge}</span>
              <FaArrowRight aria-hidden="true" />
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}

function PhaseCard({ phase, completed, active, onToggleComplete }) {
  const cardRef = useRef(null);

  const onComplete = () => {
    const nextValue = onToggleComplete(phase);
    if (nextValue) {
      fireConfetti(cardRef.current, phase.accent);
    }
  };

  return (
    <section
      id={phase.id}
      ref={cardRef}
      className={clsx(styles.phaseCard, active && styles.phaseActive)}
      data-phase-id={phase.id}
      data-reveal
      style={{ '--phase-accent': phase.accent }}
    >
      <div className={styles.phaseDot} aria-hidden="true" />

      <header className={styles.phaseHeader}>
        <div>
          <h2 className={styles.phaseTitle}>
            <span className={styles.phaseStepBadge}>{phase.step}</span>
            <span className={styles.phaseGlyph} aria-hidden="true">
              <FaCode />
            </span>
            {phase.title}
            <span className={clsx(styles.difficultyBadge, getDifficultyClass(phase.difficulty))}>
              {phase.difficulty}
            </span>
          </h2>
        </div>

        <label className={styles.completeToggle}>
          <input type="checkbox" checked={completed} onChange={onComplete} />
          <span>{completed ? 'Completed' : 'Mark complete'}</span>
        </label>
      </header>

      <div className={styles.phaseGrid}>
        <div className={styles.phaseColumn}>
          <div className={styles.copySection}>
            <div data-reveal>
              <p className={styles.subheading}>What you will learn</p>
              <p>{phase.learn}</p>
            </div>

            <div data-reveal>
              <p className={styles.subheading}>Why it matters</p>
              <p>{phase.why}</p>
            </div>

            <div className={styles.quickWin} data-reveal>
              <p className={styles.subheading}>⚡ Quick Win</p>
              <p>{phase.quickWin}</p>
            </div>

            <details className={styles.proTip} data-reveal>
              <summary>💡 Pro Tip</summary>
              <p>{phase.proTip}</p>
            </details>
          </div>
        </div>

        <div className={styles.phaseColumn}>
          <div data-reveal>
            <p className={styles.subheading}>Key topics</p>
            <ul className={styles.topicList}>
              {phase.topics.map((topic, index) => (
                <li
                  key={topic}
                  className={styles.taskItem}
                  data-reveal
                  style={{ '--reveal-delay': `${index * 70}ms` }}
                >
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal>
            <p className={styles.subheading}>Mini tasks and projects</p>
            <ul className={styles.projectList}>
              {phase.projects.map((project, index) => (
                <li
                  key={project.title}
                  className={styles.projectItem}
                  data-reveal
                  style={{ '--reveal-delay': `${index * 80}ms` }}
                >
                  <span>{project.title}</span>
                  {project.portfolio ? (
                    <span className={styles.portfolioBadge} title={project.tooltip}>
                      <FaStar aria-hidden="true" />
                      Portfolio-Worthy
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.corePagesWrap} data-reveal>
        <p className={styles.subheading}>Core pages</p>
        <div className={styles.corePageGrid}>
          {phase.corePages.map((page, index) => (
            <Link
              key={page.to}
              to={page.to}
              className={styles.corePageLink}
              data-reveal
              style={{ '--reveal-delay': `${index * 85}ms` }}
            >
              <span>{page.label}</span>
              <FaArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.cardProgress} aria-hidden="true">
        <span className={clsx(completed && styles.cardProgressDone)} />
      </div>
    </section>
  );
}

export default function RoadmapExperience() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activePhaseId, setActivePhaseId] = useState(PHASES[0].id);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [glitching, setGlitching] = useState(true);
  const {
    isHydrated,
    readiness,
    phaseState,
    prerequisiteState,
    togglePhase,
    togglePrerequisite,
  } = useRoadmapProgress(PHASES, PREREQUISITES);

  const timelineProgress = useRevealAnimations(
    containerRef,
    {
      reveal: '[data-reveal]',
      phase: '[data-phase-id]',
      timeline: '[data-timeline]',
    },
    setActivePhaseId,
  );
  useParticleSystem(canvasRef);
  useMouseSpotlight(containerRef, {
    hero: '[data-hero]',
    spotlightCard: '[data-phase-id], [data-tilt-card]',
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setHeroLoaded(true);
    if (!reduced) {
      const timeout = window.setTimeout(() => setGlitching(false), 1200);
      return () => window.clearTimeout(timeout);
    }

    setGlitching(false);
    return undefined;
  }, []);

  const onAnchorClick = (event, id) => {
    event.preventDefault();
    if (typeof document === 'undefined') {
      return;
    }
    const target = document.getElementById(id);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onTogglePhase = (phase) => togglePhase(phase.id);

  const readinessSummary = useMemo(() => {
    if (readiness === 100) {
      return 'You are ready to start the roadmap at full pace.';
    }
    if (readiness >= 60) {
      return 'You have enough base knowledge to begin, but keep shoring up the weak spots as you go.';
    }
    return 'Spend a little time closing the prerequisites first. It will make every later phase easier.';
  }, [readiness]);

  return (
    <div
      ref={containerRef}
      className={clsx(styles.roadmap, heroLoaded && styles.roadmapReady)}
    >
      <div className={clsx(styles.skeletonOverlay, heroLoaded && styles.skeletonGone)} aria-hidden="true">
        <div className={styles.skeletonHero} />
        <div className={styles.skeletonGrid}>
          <span />
          <span />
          <span />
        </div>
      </div>

      <section className={styles.hero} data-hero>
        <canvas ref={canvasRef} className={styles.heroCanvas} aria-hidden="true" />
        <div className={styles.heroSpotlight} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroCopy} data-reveal>
            <p className={styles.eyebrow}>CompilerSutra learning roadmap</p>
            <h1 className={clsx(styles.heroTitle, glitching && styles.glitch)} data-text="Become a Compiler Engineer">
              Become a Compiler Engineer
            </h1>
            <p className={styles.heroLead}>
              This is the path from systems fundamentals to LLVM, backend thinking,
              GPU execution, and production-grade compiler depth.
            </p>
            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={(event) => onAnchorClick(event, 'complete-roadmap')}
              >
                <FaRocket aria-hidden="true" />
                Start Now
              </button>
              <Link className={styles.secondaryButton} to="/docs/tracks/compiler-fundamentals/">
                Open Core Track
              </Link>
              <Link className={styles.secondaryButton} to="/docs/tracks/llvm-and-ir/">
                Go to LLVM Path
              </Link>
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroStatGrid} data-reveal>
              <article className={styles.statCard}>
                <strong>LLVM</strong>
                <span>Passes, IR, and compiler infrastructure</span>
              </article>
              <article className={styles.statCard}>
                <strong>GPU</strong>
                <span>Parallel systems and backend instincts</span>
              </article>
              <article className={styles.statCard}>
                <strong>Projects</strong>
                <span>Build proof, not just familiarity</span>
              </article>
              <article className={styles.statCard}>
                <strong>Depth</strong>
                <span>Serious path for serious engineers</span>
              </article>
            </div>

            <CopySnippet />
          </div>
        </div>

        <div className={styles.heroFooter} data-reveal>
          <TypeQuote text="Curiosity killed the cat. A lack of curiosity kills the engineer. Stay curious. Stay alive." />
        </div>
      </section>

      <section className={styles.section} data-reveal>
        <details className={styles.prereqCard} open>
          <summary>
            <div>
              <p className={styles.eyebrow}>Before you start</p>
              <h2>Prerequisites checklist</h2>
            </div>
            <div className={styles.readyDial}>
              <strong>{readiness}%</strong>
              <span>Ready</span>
            </div>
          </summary>
          <div className={styles.prereqBody}>
            <p>{readinessSummary}</p>
            <div className={styles.checkGrid}>
              {PREREQUISITES.map((item) => (
                <label key={item.id} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={Boolean(prerequisiteState[item.id])}
                    onChange={() => togglePrerequisite(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </details>
      </section>

      <section className={styles.section} data-reveal>
        <div className={styles.quickStartGrid}>
          <article className={styles.quickCard}>
            <p className={styles.eyebrow}>Quick start</p>
            <h3>New to compilers</h3>
            <p>Start from the full sequence. Do not skip the fundamentals if IR and passes still feel abstract.</p>
            <Link className={styles.inlineButton} to="/docs/tracks/compiler-fundamentals/">
              Start foundations
            </Link>
          </article>
          <article className={styles.quickCard}>
            <p className={styles.eyebrow}>Quick start</p>
            <h3>Already strong in C++</h3>
            <p>Move faster into LLVM, SSA, passes, and optimization flow without wandering through the docs tree.</p>
            <Link className={styles.inlineButton} to="/docs/tracks/llvm-and-ir/">
              Go to LLVM and IR
            </Link>
          </article>
          <article className={styles.quickCard}>
            <p className={styles.eyebrow}>Quick start</p>
            <h3>Targeting GPU or backend roles</h3>
            <p>Use the compiler path, then branch into GPU execution, kernels, backend tradeoffs, and performance work.</p>
            <Link className={styles.inlineButton} to="/docs/tracks/gpu-compilers/">
              Open GPU track
            </Link>
          </article>
        </div>
      </section>

      <section className={styles.section} data-reveal>
        <div className={styles.pipelineSection}>
          <p className={styles.eyebrow}>Compiler flow at a glance</p>
          <h2>Source, AST, IR, optimization, backend, binary, execution</h2>
          <PipelineStrip />
        </div>
      </section>

      {/* <AdBanner /> */}

      <div id="complete-roadmap" className={styles.anchor} />

      {/* <AdBanner /> */}

      <section className={styles.section}>
        <div className={styles.guideCard} data-reveal>
          <div>
            <p className={styles.eyebrow}>How to use this page</p>
            <h2>Pick a phase, finish the core pages, then build one visible project.</h2>
          </div>
          <p>
            Progress comes from sequence and repetition, not content hoarding.
            Finish one stage properly, check it off, and then move forward.
          </p>
        </div>

        <div className={styles.trackGrid} data-reveal>
          <Link className={styles.trackLink} to="/docs/tracks/compiler-fundamentals/">Compiler Fundamentals</Link>
          <Link className={styles.trackLink} to="/docs/coa/">Computer Architecture</Link>
          <Link className={styles.trackLink} to="/docs/tracks/llvm-and-ir/">LLVM and IR</Link>
          <Link className={styles.trackLink} to="/docs/tracks/gpu-compilers/">GPU Compilers</Link>
          <Link className={styles.trackLink} to="/docs/tracks/ml-compilers/">ML Compilers</Link>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.timelineWrap} data-timeline>
          <div className={styles.timelineBase} aria-hidden="true" />
          <div
            className={styles.timelineFill}
            aria-hidden="true"
            style={{ transform: `scaleY(${timelineProgress})` }}
          />

          {PHASES.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              completed={Boolean(phaseState[phase.id])}
              active={activePhaseId === phase.id}
              onToggleComplete={onTogglePhase}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.outcomeCard} data-reveal>
          <p className={styles.eyebrow}>Real-world outcome</p>
          <h2>You are no longer asking whether compilers are for you.</h2>
          <p>
            You are building proof that they are. Each phase compounds. Each project
            hardens your identity. Each week reduces the distance between you and real compiler work.
          </p>
        </div>

        <div className={styles.rolesCard} data-reveal>
          <div>
            <p className={styles.eyebrow}>Related roles</p>
            <h2>This roadmap prepares you for</h2>
          </div>
          <div className={styles.roleGrid}>
            {ROLES.map((role) => (
              <span key={role} className={styles.roleBadge}>
                {role}
              </span>
            ))}
          </div>
        </div>

        <article className={styles.finalCard} data-tilt-card data-reveal>
          <div className={styles.finalCopy}>
            <p className={styles.eyebrow}>Final CTA</p>
            <h2>Start now. Build the skill stack that changes your career.</h2>
            <p>
              Most developers stay at the surface. Very few learn how code is parsed,
              lowered, optimized, and made fast. This roadmap is for the few who do.
            </p>
          </div>
          <div className={styles.finalActions}>
            <Link className={styles.primaryButton} to="/docs/tracks/compiler-fundamentals/">
              Start the roadmap
            </Link>
            <Link className={styles.secondaryButton} to="/docs/project/">
              Build projects
            </Link>
            <Link className={styles.secondaryButton} to="/docs/tools/">
              Use the tools
            </Link>
          </div>
        </article>
      </section>

      <span className={styles.srOnly} aria-live="polite">
        {isHydrated ? `Roadmap readiness ${readiness} percent.` : ''}
      </span>
    </div>
  );
}
