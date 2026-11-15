import React from 'react';
import Link from '@docusaurus/Link';
import { CONCEPT_PIPELINE } from '@site/src/data/basicTerminology/curriculumMeta';
import { getTopicById } from '@site/src/data/basicTerminology/topics';
import styles from './basicTerminology.module.css';

export default function ConceptPipeline() {
  return (
    <section className={styles.pipeline} aria-labelledby="bt-pipeline-title">
      <h2 id="bt-pipeline-title" className={styles.sectionTitle}>
        From code to execution
      </h2>
      <p className={styles.sectionHint}>
        Recommended dependency order for the compiler story. Prerequisites are guidance — not locks.
      </p>
      <ol className={styles.pipelineTrack}>
        {CONCEPT_PIPELINE.map((step, index) => {
          const topic = getTopicById(step.id);
          const href = topic?.resources?.blog;
          return (
            <li key={step.id} className={styles.pipelineStep}>
              {index > 0 ? <span className={styles.pipelineArrow} aria-hidden="true">→</span> : null}
              {href ? (
                <Link className={styles.pipelineLink} to={href}>
                  {step.label}
                </Link>
              ) : (
                <span className={styles.pipelineLink}>{step.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
