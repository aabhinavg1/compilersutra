import React from 'react';
import Link from '@docusaurus/Link';
import styles from './basicTerminology.module.css';

function isExternal(url) {
  return /^https?:\/\//.test(url);
}

function ResourceAnchor({ href, children }) {
  if (!href) return null;
  if (isExternal(href)) {
    return (
      <a className={styles.resourceLink} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className={styles.resourceLink} to={href}>
      {children}
    </Link>
  );
}

export default function ResourceLinks({ resources }) {
  if (!resources) return null;
  const { blog, youtube, pdf, mcq } = resources;
  if (!blog && !youtube && !pdf && !mcq) return null;

  return (
    <div className={styles.resources}>
      {blog ? <ResourceAnchor href={blog}>Read</ResourceAnchor> : null}
      {youtube ? <ResourceAnchor href={youtube}>Watch</ResourceAnchor> : null}
      {pdf ? <ResourceAnchor href={pdf}>PDF</ResourceAnchor> : null}
      {mcq ? <ResourceAnchor href={mcq}>MCQ</ResourceAnchor> : null}
    </div>
  );
}
