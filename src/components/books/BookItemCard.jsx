import React from 'react';
import styles from '@site/src/pages/reaserchpaper.module.css';

export default function BookItemCard({ item }) {
  const actionLabel = item.buttonLabel || (item.thumbnailLabel === 'PDF' ? 'Open PDF' : 'Open Resource');

  return (
    <article className={styles.simpleTopicItem}>
      <div className={`${styles.simpleTopicThumb} ${styles[item.coverTone]}`}>
        <span className={styles.simpleTopicThumbLabel}>{item.thumbnailLabel || 'PDF'}</span>
      </div>

      <div className={styles.simpleTopicItemBody}>
        <p className={styles.simpleTopicItemMeta}>
          {item.featured ? <span className={styles.simpleTopicFeatured}>{item.featuredLabel || 'Best Pick'}</span> : null}
          {item.author} · {item.year}
        </p>
        <h3 className={styles.simpleTopicItemTitle}>{item.title}</h3>
        <p className={styles.simpleTopicItemNote}>{item.note}</p>
      </div>

      <div className={styles.simpleTopicItemActions}>
        <a
          className={styles.simpleTopicPrimaryAction}
          href={item.file}
          target="_blank"
          rel="noreferrer"
        >
          {actionLabel}
        </a>
      </div>
    </article>
  );
}
