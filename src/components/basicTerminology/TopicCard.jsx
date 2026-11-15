import React from 'react';
import Link from '@docusaurus/Link';
import { getTopicById, getModuleById } from '@site/src/data/basicTerminology/topics';
import ResourceLinks from './ResourceLinks';
import styles from './basicTerminology.module.css';

const STATUS_LABEL = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export default function TopicCard({ topic, status = 'not-started', onVisit, onToggleComplete }) {
  const primary = topic.resources?.blog;
  const module = getModuleById(topic.moduleId);
  const prereqTitles = (topic.prerequisites || [])
    .map((id) => getTopicById(id)?.title)
    .filter(Boolean);

  const handleOpen = () => {
    if (onVisit) onVisit(topic.id);
  };

  return (
    <article
      className={`${styles.card} ${
        status === 'completed'
          ? styles.cardCompleted
          : status === 'in-progress'
            ? styles.cardInProgress
            : ''
      }`}
    >
      <div className={styles.cardTop}>
        <span className={styles.badge}>Beginner</span>
        {topic.minutes ? <span className={styles.badge}>{topic.minutes} min</span> : null}
        {module ? <span className={styles.badge}>Module {module.num}</span> : null}
        <span
          className={`${styles.statusBadge} ${
            status === 'completed'
              ? styles.statusCompleted
              : status === 'in-progress'
                ? styles.statusInProgress
                : styles.statusNotStarted
          }`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
      <h4>
        {primary ? (
          <Link to={primary} onClick={handleOpen}>
            {topic.title}
          </Link>
        ) : (
          topic.title
        )}
      </h4>
      <p>{topic.description}</p>

      {topic.learnings?.length ? (
        <div className={styles.cardBlock}>
          <strong>You will learn</strong>
          <ul>
            {topic.learnings.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {prereqTitles.length ? (
        <p className={styles.cardMeta}>
          <strong>Prerequisites:</strong> {prereqTitles.join(', ')}
        </p>
      ) : (
        <p className={styles.cardMeta}>
          <strong>Prerequisites:</strong> None
        </p>
      )}

      {topic.lab ? (
        <p className={styles.cardMeta}>
          <strong>Practical lab:</strong> {topic.lab.title}
        </p>
      ) : null}

      {topic.outcome ? (
        <p className={styles.cardMeta}>
          <strong>Learning outcome:</strong> {topic.outcome}
        </p>
      ) : null}

      <ResourceLinks resources={topic.resources} hasLab={Boolean(topic.lab)} />

      <div className={styles.cardActions}>
        {primary ? (
          <Link className={styles.primaryAction} to={primary} onClick={handleOpen}>
            Explore concept
          </Link>
        ) : null}
        {onToggleComplete ? (
          <button
            type="button"
            className={styles.progressBtn}
            onClick={() => onToggleComplete(topic.id, status !== 'completed')}
          >
            {status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
          </button>
        ) : null}
      </div>
    </article>
  );
}
