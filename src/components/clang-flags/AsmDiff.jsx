import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { GitCompareArrows } from 'lucide-react';
import styles from './clangFlags.module.css';

function diffLines(before, after) {
  const a = String(before ?? '').replace(/\n$/, '').split('\n');
  const b = String(after ?? '').replace(/\n$/, '').split('\n');
  const aCount = a.length;
  const bCount = b.length;

  const lcs = Array.from({ length: aCount + 1 }, () => new Array(bCount + 1).fill(0));
  for (let i = aCount - 1; i >= 0; i--) {
    for (let j = bCount - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const aStatus = new Array(aCount).fill('same');
  const bStatus = new Array(bCount).fill('same');
  let i = 0;
  let j = 0;
  while (i < aCount && j < bCount) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      aStatus[i] = 'removed';
      i += 1;
    } else {
      bStatus[j] = 'added';
      j += 1;
    }
  }
  while (i < aCount) {
    aStatus[i] = 'removed';
    i += 1;
  }
  while (j < bCount) {
    bStatus[j] = 'added';
    j += 1;
  }

  return {
    a,
    b,
    aStatus,
    bStatus,
    removed: aStatus.filter((s) => s === 'removed').length,
    added: bStatus.filter((s) => s === 'added').length,
  };
}

function DiffPanel({ title, badge, lines, statuses, side }) {
  return (
    <div className={clsx(styles.asmDiffPanel, side === 'after' ? styles.asmDiffPanelAfter : styles.asmDiffPanelBefore)}>
      <div className={styles.asmDiffHeader}>
        <div className={styles.asmDiffHeaderLeft}>
          <span className={styles.asmDiffTitle}>{title}</span>
          <span className={clsx(styles.asmDiffBadge, side === 'after' ? styles.asmDiffBadgeAdd : styles.asmDiffBadgeRemove)}>
            {badge}
          </span>
        </div>
        <span className={styles.asmDiffLineCount}>{lines.length} lines</span>
      </div>
      <div className={styles.asmDiffPreWrap}>
        <pre className={styles.asmDiffPre}>
          <code>
            {lines.map((line, index) => {
              const status = statuses[index];
              const marker = status === 'added' ? '+' : status === 'removed' ? '−' : ' ';
              return (
                <div
                  key={`${side}-${index}-${line}`}
                  className={clsx(
                    styles.asmDiffLine,
                    status === 'added' && styles.asmDiffLineAdd,
                    status === 'removed' && styles.asmDiffLineRemove,
                    status === 'same' && styles.asmDiffLineSame,
                  )}
                >
                  <span className={styles.asmDiffGutter}>{String(index + 1).padStart(2, ' ')}</span>
                  <span className={styles.asmDiffMarker} aria-hidden="true">{marker}</span>
                  <span className={styles.asmDiffCode}>{line || ' '}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default function AsmDiff({
  before,
  after,
  beforeTitle = 'Without flag',
  afterTitle = 'With flag',
  beforeBadge = 'before',
  afterBadge = 'after',
  note,
}) {
  const { a, b, aStatus, bStatus } = useMemo(() => diffLines(before, after), [before, after]);
  const [view, setView] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches ? 'after' : 'both'
  ));

  return (
    <div className={styles.asmDiff}>
      <div className={styles.asmDiffTop}>
        <div className={styles.asmDiffTopCopy}>
          <GitCompareArrows size={16} strokeWidth={2.2} className={styles.asmDiffTopIcon} aria-hidden="true" />
          <div>
            <div className={styles.asmDiffTopTitle}>Assembly comparison</div>
            {note ? <div className={styles.asmDiffTopMeta}>{note}</div> : null}
          </div>
        </div>

        <div className={styles.asmDiffToolbar} role="tablist" aria-label="Assembly comparison views">
          {[
            { key: 'before', label: 'Before' },
            { key: 'after', label: 'After' },
            { key: 'both', label: 'Compare' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={view === item.key}
              className={clsx(styles.asmDiffTab, view === item.key && styles.asmDiffTabActive)}
              onClick={() => setView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={clsx(styles.asmDiffGrid, view !== 'both' && styles.asmDiffGridSingle)}>
        {view === 'before' || view === 'both' ? (
          <DiffPanel title={beforeTitle} badge={beforeBadge} lines={a} statuses={aStatus} side="before" />
        ) : null}
        {view === 'after' || view === 'both' ? (
          <DiffPanel title={afterTitle} badge={afterBadge} lines={b} statuses={bStatus} side="after" />
        ) : null}
      </div>
    </div>
  );
}
