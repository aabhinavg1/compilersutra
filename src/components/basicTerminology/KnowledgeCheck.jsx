import React from 'react';
import Link from '@docusaurus/Link';
import styles from './basicTerminology.module.css';

/** Links to a real MCQ page when available — never invents quizzes. */
export default function KnowledgeCheck({ href, label = 'Test your understanding' }) {
  if (!href) return null;
  return (
    <div className={styles.nextSteps}>
      <h2>Knowledge check</h2>
      <p className={styles.sectionHint}>Practice with existing CompilerSutra MCQs for this area.</p>
      <p>
        <Link className="button button--outline button--primary" to={href}>
          {label}
        </Link>
      </p>
    </div>
  );
}
