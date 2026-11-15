import React, { useMemo } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import styles from './clangFlags.module.css';

function legacyItems({
  args,
  accepts,
  stage,
  negated,
  definedIn,
  acceptingTargets,
  flangSupport,
  negation,
}) {
  const rows = [];
  if (args) rows.push({ label: 'Arguments', value: args, icon: 'info' });
  if (accepts) rows.push({ label: 'Accepted by', value: accepts, icon: 'check' });
  if (acceptingTargets) rows.push({ label: 'Targets', value: acceptingTargets, icon: 'info' });
  if (stage) rows.push({ label: 'Stage', value: stage, icon: 'info' });
  if (negated || negation) rows.push({ label: 'Negated by', value: negated || negation, icon: 'check' });
  if (flangSupport) rows.push({ label: 'Flang', value: flangSupport, icon: 'info' });
  if (definedIn) rows.push({ label: 'Defined in', value: definedIn, icon: 'info' });
  return rows;
}

export default function KeyFacts({
  items,
  args,
  accepts,
  stage,
  negated,
  definedIn,
  acceptingTargets,
  flangSupport,
  negation,
}) {
  const resolved = useMemo(() => {
    if (items?.length) return items;
    return legacyItems({
      args,
      accepts,
      stage,
      negated,
      definedIn,
      acceptingTargets,
      flangSupport,
      negation,
    });
  }, [items, args, accepts, stage, negated, definedIn, acceptingTargets, flangSupport, negation]);

  if (!resolved.length) {
    return null;
  }

  return (
    <div className={styles.keyFactsGrid}>
      {resolved.map((item) => {
        const Icon = item.icon === 'check' ? CheckCircle2 : Info;
        return (
          <div key={item.label} className={styles.keyFactCard}>
            <div className={styles.keyFactTop}>
              <Icon size={14} strokeWidth={2.25} className={styles.keyFactIcon} />
              <div className={styles.keyFactLabel}>{item.label}</div>
            </div>
            <div className={styles.keyFactValue}>{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
