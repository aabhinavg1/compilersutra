import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import {
  HUB_META,
  MODULES,
  TOPICS,
  topicCount,
  topicsForModule,
} from '@site/src/data/basicTerminology/topics';
import LearningPath from './LearningPath';
import ModuleSection from './ModuleSection';
import styles from './basicTerminology.module.css';

const OBJECTIVES = [
  { title: 'Computer fundamentals', detail: 'Understand the machine.' },
  { title: 'Programming basics', detail: 'Understand programs and code.' },
  { title: 'Program execution', detail: 'Understand how code runs.' },
  { title: 'Computer architecture', detail: 'Understand hardware.' },
];

export default function LearningHub() {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const normalized = query.trim().toLowerCase();

  const filteredBySearch = useMemo(() => {
    if (!normalized) return TOPICS;
    return TOPICS.filter((topic) => {
      const hay = `${topic.title} ${topic.description} ${topic.id}`.toLowerCase();
      return hay.includes(normalized);
    });
  }, [normalized]);

  const visibleModules = useMemo(() => {
    return MODULES.filter((module) => {
      if (moduleFilter !== 'all' && module.id !== moduleFilter) return false;
      return topicsForModule(module.id).some((topic) =>
        filteredBySearch.some((t) => t.id === topic.id),
      );
    });
  }, [filteredBySearch, moduleFilter]);

  return (
    <div className={styles.hub}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Start here · Beginner level</p>
        <h1>{HUB_META.title}</h1>
        <p className={styles.lead}>
          <strong>{HUB_META.subtitle}</strong>
          <br />
          {HUB_META.blurb}
        </p>
        <ul className={styles.metaRow}>
          <li className={styles.metaChip}>{HUB_META.level}</li>
          <li className={styles.metaChip}>{topicCount()} concepts</li>
          <li className={styles.metaChip}>Self-paced</li>
          <li className={styles.metaChip}>{MODULES.length} modules</li>
        </ul>
        <div className={styles.objectives} aria-label="What you will learn">
          {OBJECTIVES.map((item) => (
            <div key={item.title} className={styles.objective}>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </header>

      <LearningPath />

      <h2 className={styles.sectionTitle}>Modules</h2>
      <p className={styles.sectionHint}>
        Search concepts or filter by module. Only real resources are shown — no placeholder links.
      </p>

      <div className={styles.controls}>
        <label className={styles.srOnly} htmlFor="bt-search">
          Search concepts
        </label>
        <input
          id="bt-search"
          className={styles.searchInput}
          type="search"
          placeholder="Search concepts (compiler, RAM, thread…)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles.filters} role="group" aria-label="Filter by module">
          <button
            type="button"
            className={`${styles.filterBtn} ${moduleFilter === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setModuleFilter('all')}
          >
            All
          </button>
          {MODULES.map((module) => (
            <button
              key={module.id}
              type="button"
              className={`${styles.filterBtn} ${
                moduleFilter === module.id ? styles.filterBtnActive : ''
              }`}
              onClick={() => setModuleFilter(module.id)}
            >
              {module.num} {module.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {visibleModules.length === 0 ? (
        <div className={styles.empty}>No concepts match that search. Try a shorter word.</div>
      ) : (
        visibleModules.map((module) => {
          const topics = topicsForModule(module.id).filter((topic) =>
            filteredBySearch.some((t) => t.id === topic.id),
          );
          return <ModuleSection key={module.id} module={module} topics={topics} />;
        })
      )}

      <aside className={styles.nextSteps}>
        <h2>Recommended next steps</h2>
        <p className={styles.sectionHint}>
          After Module 02, go deeper into compilers. After Module 05–06, open COA or Parallel Computing.
        </p>
        <ul>
          <li>
            <Link to="/docs/basic-terminology/what-is-a-computer-program/">
              What Is a Computer Program?
            </Link>
          </li>
          <li>
            <Link to="/docs/basic-terminology/what-is-a-compiler/">What Is a Compiler?</Link>
          </li>
          <li>
            <Link to="/docs/compilers/sourcecode_to_executable/">From Source Code to Binary</Link>
          </li>
          <li>
            <Link to="/docs/coa/basic_terminology_in_coa/">Basic Terminology in COA</Link>
          </li>
          <li>
            <Link to="/docs/parallel-computing/">Parallel Computing course</Link>
          </li>
        </ul>
      </aside>
    </div>
  );
}
