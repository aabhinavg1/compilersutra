import React, { useMemo } from 'react';
import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight, Timer } from 'lucide-react';
import styles from './clangFlags.module.css';

function summarize(values) {
  const nums = (values || []).map(Number).filter((v) => Number.isFinite(v));
  const count = nums.length;
  if (!count) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mean = nums.reduce((a, b) => a + b, 0) / count;
  const median = sorted[Math.floor(count / 2)];
  const min = sorted[0];
  const max = sorted[count - 1];
  const variance = nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / count;
  const stdev = Math.sqrt(variance);
  return { count, mean, median, min, max, stdev };
}

function formatMs(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)} ms`;
}

function formatDelta(before, after) {
  if (!Number.isFinite(before) || !Number.isFinite(after) || before === 0) return null;
  return ((after - before) / before) * 100;
}

const METRICS = [
  { key: 'mean', label: 'Mean' },
  { key: 'median', label: 'Median' },
  { key: 'min', label: 'Min' },
  { key: 'max', label: 'Max' },
  { key: 'stdev', label: 'Std dev' },
];

/**
 * @param {object} props
 * @param {boolean} [props.withinNoise] Force a neutral “observed difference / measurement noise”
 *   presentation — never “% faster” / “% slower”, and never green/red win styling.
 * @param {string} [props.verdictLabel] Optional override for the verdict headline when withinNoise.
 */
export default function PerfReport({
  beforeTitle = 'Without flag',
  afterTitle = 'With flag',
  without,
  with: withData,
  note,
  withinNoise = false,
  verdictLabel,
}) {
  const beforeSummary = useMemo(() => summarize(without), [without]);
  const afterSummary = useMemo(() => summarize(withData), [withData]);

  const meanDelta = useMemo(
    () => formatDelta(beforeSummary?.mean, afterSummary?.mean),
    [beforeSummary, afterSummary],
  );

  const treatAsNoise = withinNoise || (meanDelta !== null && Math.abs(meanDelta) < 0.5);
  const slower = !treatAsNoise && meanDelta !== null && meanDelta > 0.05;
  const faster = !treatAsNoise && meanDelta !== null && meanDelta < -0.05;
  const maxMean = Math.max(beforeSummary?.mean || 0, afterSummary?.mean || 0) || 1;

  const noiseHeadline =
    verdictLabel ||
    (meanDelta === null
      ? 'Timing data unavailable'
      : `Observed difference — within measurement noise (~${Math.abs(meanDelta).toFixed(2)}%)`);

  return (
    <section className={styles.perfReport}>
      <div className={styles.perfHero}>
        <div className={styles.perfHeroCopy}>
          <div className={styles.perfHeroLabel}>Wall-clock comparison</div>
          <div className={styles.perfHeroValues}>
            <div className={styles.perfHeroCard}>
              <span className={styles.perfHeroCardLabel}>{beforeTitle}</span>
              <strong className={styles.perfHeroCardValue}>{formatMs(beforeSummary?.mean)}</strong>
              <span className={styles.perfHeroCardHint}>mean · {beforeSummary?.count ?? 0} trials</span>
            </div>
            <div className={styles.perfHeroArrow} aria-hidden="true">→</div>
            <div className={clsx(styles.perfHeroCard, !treatAsNoise && styles.perfHeroCardAccent)}>
              <span className={styles.perfHeroCardLabel}>{afterTitle}</span>
              <strong className={styles.perfHeroCardValue}>{formatMs(afterSummary?.mean)}</strong>
              <span className={styles.perfHeroCardHint}>mean · {afterSummary?.count ?? 0} trials</span>
            </div>
          </div>
        </div>

        <div
          className={clsx(
            styles.perfVerdict,
            treatAsNoise
              ? styles.perfVerdictNeutral
              : slower
                ? styles.perfVerdictSlow
                : faster
                  ? styles.perfVerdictFast
                  : styles.perfVerdictNeutral,
          )}
        >
          {meanDelta === null ? (
            <span>Timing data unavailable</span>
          ) : treatAsNoise ? (
            <>
              <Timer size={18} strokeWidth={2.2} />
              <div>
                <strong>{noiseHeadline}</strong>
                <p>
                  {formatMs(beforeSummary?.mean)} → {formatMs(afterSummary?.mean)} mean wall time
                  {meanDelta !== null ? ` (Δ ${meanDelta > 0 ? '+' : ''}${meanDelta.toFixed(2)}%)` : ''}
                  . Do not treat either configuration as faster.
                </p>
              </div>
            </>
          ) : (
            <>
              {slower ? <ArrowDownRight size={18} strokeWidth={2.4} /> : faster ? <ArrowUpRight size={18} strokeWidth={2.4} /> : <Timer size={18} strokeWidth={2.2} />}
              <div>
                <strong>
                  {slower
                    ? `+${meanDelta.toFixed(2)}% slower`
                    : faster
                      ? `${Math.abs(meanDelta).toFixed(2)}% faster`
                      : 'No meaningful change'}
                </strong>
                <p>
                  {formatMs(beforeSummary?.mean)} → {formatMs(afterSummary?.mean)} mean wall time
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.perfBars}>
        <div className={styles.perfBarRow}>
          <span className={styles.perfBarLabel}>{beforeTitle}</span>
          <div className={styles.perfBarTrack}>
            <div
              className={styles.perfBarFillBefore}
              style={{ width: `${Math.max(8, ((beforeSummary?.mean || 0) / maxMean) * 100)}%` }}
            />
          </div>
          <span className={styles.perfBarValue}>{formatMs(beforeSummary?.mean)}</span>
        </div>
        <div className={styles.perfBarRow}>
          <span className={styles.perfBarLabel}>{afterTitle}</span>
          <div className={styles.perfBarTrack}>
            <div
              className={clsx(
                styles.perfBarFillAfter,
                !treatAsNoise && slower && styles.perfBarFillSlow,
                !treatAsNoise && faster && styles.perfBarFillFast,
              )}
              style={{ width: `${Math.max(8, ((afterSummary?.mean || 0) / maxMean) * 100)}%` }}
            />
          </div>
          <span className={styles.perfBarValue}>{formatMs(afterSummary?.mean)}</span>
        </div>
      </div>

      <div className={styles.perfTableWrap}>
        <table className={styles.perfTable}>
          <thead>
            <tr>
              <th>Metric</th>
              <th>{beforeTitle}</th>
              <th>{afterTitle}</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map(({ key, label }) => {
              const before = beforeSummary?.[key];
              const after = afterSummary?.[key];
              const delta = formatDelta(before, after);
              // Never paint stdev (or any metric under withinNoise) as a performance win/loss.
              const allowTone = !treatAsNoise && key === 'mean';
              const worse = allowTone && delta !== null && delta > 0.05;
              const better = allowTone && delta !== null && delta < -0.05;
              return (
                <tr key={key}>
                  <td>{label}</td>
                  <td><code>{formatMs(before)}</code></td>
                  <td><code>{formatMs(after)}</code></td>
                  <td>
                    {delta === null ? (
                      <span className={styles.perfDeltaChipNeutral}>—</span>
                    ) : (
                      <span
                        className={clsx(
                          styles.perfDeltaChip,
                          worse && styles.perfDeltaChipSlow,
                          better && styles.perfDeltaChipFast,
                          !worse && !better && styles.perfDeltaChipNeutral,
                        )}
                      >
                        {delta > 0 ? '+' : ''}{delta.toFixed(2)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>Trials</td>
              <td><code>{beforeSummary?.count ?? '—'}</code></td>
              <td><code>{afterSummary?.count ?? '—'}</code></td>
              <td><span className={styles.perfDeltaChipNeutral}>same set</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.perfFooter}>
        <div className={styles.perfFooterMeta}>
          <Timer size={15} strokeWidth={2} className={styles.perfFooterIcon} />
          <span className={styles.perfFooterTitle}>
            Measured with{' '}
            <a href="/docs/project/compilersutra-perf/">CompilerSutraPerf</a>
            {' '}(
            <a href="https://pypi.org/project/compilersutra-perf/" rel="noopener noreferrer">
              PyPI
            </a>
            )
          </span>
        </div>
        {note ? <p className={styles.perfNote}>{note}</p> : null}
      </div>
    </section>
  );
}
