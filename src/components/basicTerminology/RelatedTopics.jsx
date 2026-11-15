import React from 'react';
import Link from '@docusaurus/Link';
import { getTopicById } from '@site/src/data/basicTerminology/topics';
import styles from './basicTerminology.module.css';

export default function RelatedTopics({ topicIds = [] }) {
  const topics = topicIds.map((id) => getTopicById(id)).filter(Boolean);
  if (!topics.length) return null;
  return (
    <aside className={styles.nextSteps} aria-label="Related topics">
      <h2>Related topics</h2>
      <ul>
        {topics.map((topic) => {
          const href = topic.resources?.blog;
          return (
            <li key={topic.id}>
              {href ? <Link to={href}>{topic.title}</Link> : topic.title}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
