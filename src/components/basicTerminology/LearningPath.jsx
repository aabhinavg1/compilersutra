import React from 'react';
import Link from '@docusaurus/Link';
import { LEARNING_PATH, getModuleById, topicsForModule } from '@site/src/data/basicTerminology/topics';
import styles from './basicTerminology.module.css';

export default function LearningPath({ moduleCompletion }) {
  return (
    <section aria-labelledby="bt-learning-path">
      <h2 id="bt-learning-path" className={styles.sectionTitle}>
        Learning roadmap
      </h2>
      <p className={styles.sectionHint}>
        Follow this sequence so each idea builds on the last — program before compiler, process after
        executable.
      </p>
      <ol className={styles.pathList}>
        {LEARNING_PATH.map((item) => {
          const mod = getModuleById(item.moduleId);
          const pct =
            typeof moduleCompletion === 'function'
              ? moduleCompletion(topicsForModule(item.moduleId).map((t) => t.id))
              : 0;
          return (
            <li key={item.step} className={styles.pathItem}>
              <span className={styles.pathNum}>{String(item.step).padStart(2, '0')}</span>
              <div>
                <strong>
                  {mod ? (
                    <Link to={`#${mod.id}`}>
                      Module {mod.num} · {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </strong>
                <span>{item.detail}</span>
                {pct > 0 ? (
                  <span className={styles.pathProgress}>{pct}% concepts marked complete</span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
