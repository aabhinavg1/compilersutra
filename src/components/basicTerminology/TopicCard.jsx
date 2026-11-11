import React from 'react';
import Link from '@docusaurus/Link';
import ResourceLinks from './ResourceLinks';
import styles from './basicTerminology.module.css';

export default function TopicCard({ topic }) {
  const primary = topic.resources?.blog;
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.badge}>Beginner</span>
        {topic.minutes ? <span className={styles.badge}>{topic.minutes} min</span> : null}
      </div>
      <h4>
        {primary ? <Link to={primary}>{topic.title}</Link> : topic.title}
      </h4>
      <p>{topic.description}</p>
      <ResourceLinks resources={topic.resources} />
    </article>
  );
}
