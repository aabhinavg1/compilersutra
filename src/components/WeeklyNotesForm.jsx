import React from 'react';
import Link from '@docusaurus/Link';
import { FaEnvelope } from 'react-icons/fa';
import styles from '@site/src/pages/index.module.css';

const NEWSLETTER_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform';

export default function WeeklyNotesForm() {
  return (
    <div className={styles.notesForm}>
      <Link
        className={styles.starterGhost}
        to={NEWSLETTER_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaEnvelope aria-hidden="true" />
        Optional weekly notes
      </Link>
      <p className={styles.formNote}>
        No spam — practical compiler notes and curated resources only.
      </p>
    </div>
  );
}
