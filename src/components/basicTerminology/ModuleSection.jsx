import React, { useState } from 'react';
import TopicCard from './TopicCard';
import ModuleCheck from './ModuleCheck';
import styles from './basicTerminology.module.css';

export default function ModuleSection({
  module,
  topics,
  statusFor,
  onVisit,
  onToggleComplete,
  completionPercent = 0,
}) {
  const [showLab, setShowLab] = useState(false);

  if (!topics.length) return null;

  return (
    <section className={styles.module} id={module.id} aria-labelledby={`${module.id}-title`}>
      <div className={styles.moduleHead}>
        <span className={styles.moduleNum}>Module {module.num}</span>
        <h3 id={`${module.id}-title`}>{module.title}</h3>
        <span className={styles.moduleMeta}>
          {module.level} · {topics.length} topic{topics.length === 1 ? '' : 's'}
          {completionPercent > 0 ? ` · ${completionPercent}% done` : ''}
        </span>
      </div>
      <p className={styles.moduleDesc}>{module.description}</p>
      {module.objective ? (
        <p className={styles.moduleObjective}>
          <strong>Objective:</strong> {module.objective}
        </p>
      ) : null}

      {module.labSummary ? (
        <div className={styles.moduleLab}>
          <button
            type="button"
            className={styles.labToggle}
            aria-expanded={showLab}
            onClick={() => setShowLab((v) => !v)}
          >
            {showLab ? 'Hide' : 'Show'} module lab
          </button>
          {showLab ? (
            <div className={styles.labPanel}>
              <p>{module.labSummary}</p>
              {module.labCommands?.length ? (
                <pre className={styles.labCode}>
                  <code>{module.labCommands.join('\n')}</code>
                </pre>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.cardGrid}>
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            status={statusFor ? statusFor(topic.id) : 'not-started'}
            onVisit={onVisit}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>

      <ModuleCheck moduleId={module.id} />
    </section>
  );
}
