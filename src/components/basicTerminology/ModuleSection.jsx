import React from 'react';
import TopicCard from './TopicCard';
import styles from './basicTerminology.module.css';

export default function ModuleSection({ module, topics }) {
  if (!topics.length) return null;
  return (
    <section className={styles.module} id={module.id} aria-labelledby={`${module.id}-title`}>
      <div className={styles.moduleHead}>
        <span className={styles.moduleNum}>Module {module.num}</span>
        <h3 id={`${module.id}-title`}>{module.title}</h3>
        <span className={styles.moduleMeta}>
          {module.level} · {topics.length} topic{topics.length === 1 ? '' : 's'}
        </span>
      </div>
      <p className={styles.moduleDesc}>{module.description}</p>
      <div className={styles.cardGrid}>
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
