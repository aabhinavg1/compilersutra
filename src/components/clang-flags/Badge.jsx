import React from 'react';
import clsx from 'clsx';
import styles from './clangFlags.module.css';

const TONE_TO_CLASS = {
  neutral: styles.badgeNeutral,
  info: styles.badgeInfo,
  success: styles.badgeSuccess,
  warning: styles.badgeWarning,
  danger: styles.badgeDanger,
  accent: styles.badgeAccent,
};

export default function Badge({ children, tone = 'neutral', className, title, ...rest }) {
  return (
    <span
      className={clsx(styles.badge, TONE_TO_CLASS[tone] || styles.badgeNeutral, className)}
      title={title}
      {...rest}
    >
      {children}
    </span>
  );
}
