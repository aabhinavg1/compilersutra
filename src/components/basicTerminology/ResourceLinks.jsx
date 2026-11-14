import React from 'react';
import Link from '@docusaurus/Link';
import styles from './basicTerminology.module.css';

function isExternal(url) {
  return /^https?:\/\//.test(url);
}

/** Channel homepage is not a concept video — omit Watch. */
function isSpecificVideo(url) {
  if (!url) return false;
  if (/youtube\.com\/@[^/?#]+\/?$/i.test(url)) return false;
  return /(?:youtube\.com\/watch|youtu\.be\/)/i.test(url);
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

export default function ResourceLinks({ resources, hasLab }) {
  if (!resources && !hasLab) return null;
  const blog = resources?.blog;
  const youtube = isSpecificVideo(resources?.youtube) ? resources.youtube : null;
  const pdf = resources?.pdf;
  const mcq = resources?.mcq;
  if (!blog && !youtube && !pdf && !mcq && !hasLab) return null;

  return (
    <div className={styles.resources}>
      {blog ? <ResourceAnchor href={blog}>Article</ResourceAnchor> : null}
      {youtube ? <ResourceAnchor href={youtube}>Watch</ResourceAnchor> : null}
      {pdf ? <ResourceAnchor href={pdf}>PDF</ResourceAnchor> : null}
      {mcq ? <ResourceAnchor href={mcq}>Quiz</ResourceAnchor> : null}
      {hasLab ? <span className={styles.resourceTag}>Terminal lab</span> : null}
    </div>
  );
}
