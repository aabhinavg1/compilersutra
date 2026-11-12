import React from 'react';
import { LEARNING_PATH } from '@site/src/data/basicTerminology/topics';
import styles from './basicTerminology.module.css';

export default function LearningPath() {
  return (
    <section aria-labelledby="bt-learning-path">
      <h2 id="bt-learning-path" className={styles.sectionTitle}>
        Your learning path
      </h2>
      <p className={styles.sectionHint}>
        A beginner should see why one concept comes before another.
      </p>
      <ol className={styles.pathList}>
        {LEARNING_PATH.map((item) => (
          <li key={item.step} className={styles.pathItem}>
            <span className={styles.pathNum}>{String(item.step).padStart(2, '0')}</span>
            <div>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
