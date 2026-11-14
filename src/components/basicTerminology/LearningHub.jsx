import React, { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import {
  HUB_META,
  MODULES,
  ENRICHED_TOPICS,
  topicCount,
  topicsForModule,
  getStartTopic,
  getTopicById,
  recommendedTopics,
} from '@site/src/data/basicTerminology/topics';
import ConceptPipeline from './ConceptPipeline';
import LearningPath from './LearningPath';
import ModuleSection from './ModuleSection';
import useBasicTerminologyProgress from './useBasicTerminologyProgress';
import styles from './basicTerminology.module.css';

export default function LearningHub() {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const topicIds = useMemo(() => ENRICHED_TOPICS.map((t) => t.id), []);
  const progress = useBasicTerminologyProgress(topicIds);

  const normalized = query.trim().toLowerCase();
  const startTopic = getStartTopic();
  const startHref = startTopic?.resources?.blog || HUB_META.overviewBlog;

  const lastVisited = progress.isHydrated
    ? getTopicById(progress.lastVisitedId)
    : null;
  const continueTopic = lastVisited || startTopic;
  const continueHref = continueTopic?.resources?.blog || startHref;

  const filteredBySearch = useMemo(() => {
    let list = ENRICHED_TOPICS;
    if (normalized) {
      list = list.filter((topic) => {
        const queries = (topic.searchQueries || []).join(' ');
        const hay = `${topic.title} ${topic.description} ${topic.id} ${queries}`.toLowerCase();
        return hay.includes(normalized);
      });
    }
    if (difficultyFilter !== 'all') {
      list = list.filter((t) => t.level === difficultyFilter);
    }
    if (resourceFilter === 'article') {
      list = list.filter((t) => t.resources?.blog);
    } else if (resourceFilter === 'lab') {
      list = list.filter((t) => t.lab);
    } else if (resourceFilter === 'pdf') {
      list = list.filter((t) => t.resources?.pdf);
    }
    return list;
  }, [normalized, difficultyFilter, resourceFilter]);

  const recommended = useMemo(() => recommendedTopics().slice(0, 10), []);

  const visibleModules = useMemo(() => {
    return MODULES.filter((module) => {
      if (moduleFilter !== 'all' && module.id !== moduleFilter) return false;
      return topicsForModule(module.id).some((topic) =>
        filteredBySearch.some((t) => t.id === topic.id),
      );
    });
  }, [filteredBySearch, moduleFilter]);

  const onToggleComplete = (topicId, complete) => {
    if (complete) progress.markCompleted(topicId);
    else progress.markIncomplete(topicId);
  };

  return (
    <div className={styles.hub}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{HUB_META.trackLabel}</p>
        <h1>{HUB_META.title}</h1>
        <p className={styles.lead}>
          <strong>{HUB_META.subtitle}</strong>
          <br />
          {HUB_META.blurb}
        </p>
        <ul className={styles.metaRow}>
          <li className={styles.metaChip}>
            <strong>{topicCount()}</strong>&nbsp;core concepts
          </li>
          <li className={styles.metaChip}>
            <strong>{MODULES.length}</strong>&nbsp;learning modules
          </li>
          <li className={styles.metaChip}>
            <strong>0</strong>&nbsp;prerequisites
          </li>
          <li className={styles.metaChip}>{HUB_META.level}</li>
          {progress.isHydrated && progress.completedCount > 0 ? (
            <li className={styles.metaChip}>
              <strong>{progress.completedCount}</strong>/{progress.totalCount} completed
            </li>
          ) : null}
        </ul>

        <div className={styles.objectivePanel}>
          <h2 className={styles.objectiveHeading}>Your learning objective</h2>
          <p>{HUB_META.learningObjective}</p>
        </div>

        <div className={styles.heroCta}>
          <div className={styles.startCard}>
            <p className={styles.startLabel}>Start your learning journey</p>
            <p className={styles.startModule}>
              Module {MODULES[0].num} · {MODULES[0].title}
            </p>
            <h3 className={styles.startTitle}>
              {startTopic ? (
                <Link to={startHref} onClick={() => progress.markVisited(startTopic.id)}>
                  {startTopic.title}
                </Link>
              ) : (
                'Begin'
              )}
            </h3>
            <p className={styles.startMeta}>
              {startTopic?.minutes ? `${startTopic.minutes} minutes` : 'Self-paced'} · Beginner · No
              prerequisites
            </p>
            <Link
              className={styles.primaryAction}
              to={startHref}
              onClick={() => startTopic && progress.markVisited(startTopic.id)}
            >
              Start learning
            </Link>
          </div>

          <div className={styles.continueCard}>
            <p className={styles.startLabel}>Continue learning</p>
            {progress.isHydrated && lastVisited ? (
              <>
                <p className={styles.startMeta}>Last visited</p>
                <h3 className={styles.startTitle}>
                  <Link
                    to={continueHref}
                    onClick={() => progress.markVisited(continueTopic.id)}
                  >
                    {continueTopic.title}
                  </Link>
                </h3>
                <Link
                  className={styles.secondaryAction}
                  to={continueHref}
                  onClick={() => progress.markVisited(continueTopic.id)}
                >
                  Resume
                </Link>
              </>
            ) : (
              <>
                <p className={styles.startMeta}>
                  Progress is saved in this browser only. Mark concepts complete as you go.
                </p>
                <Link className={styles.secondaryAction} to={startHref}>
                  Begin with Module 01
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <LearningPath moduleCompletion={progress.moduleCompletion} />
      <ConceptPipeline />

      <h2 className={styles.sectionTitle}>Recommended concepts</h2>
      <p className={styles.sectionHint}>
        Curated starters for this track — not a search-analytics ranking. Prefer dedicated Basic
        Terminology pages when they exist.
      </p>
      <ul className={styles.recommendList}>
        {recommended.map((topic) => {
          const href = topic.resources?.blog || '/docs/basic-terminology/';
          return (
            <li key={topic.id}>
              <Link
                className={styles.recommendChip}
                to={href}
                onClick={() => progress.markVisited(topic.id)}
              >
                {topic.title}
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className={styles.sectionTitle}>Learning modules</h2>
      <p className={styles.sectionHint}>
        Search and filter concepts. Only real articles, videos, and PDFs are shown — no placeholder
        resources.
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
            All modules
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
        <div className={styles.filters} role="group" aria-label="Filter by resource">
          {[
            ['all', 'Any resource'],
            ['article', 'Has article'],
            ['lab', 'Has lab'],
            ['pdf', 'Has PDF'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`${styles.filterBtn} ${resourceFilter === id ? styles.filterBtnActive : ''}`}
              onClick={() => setResourceFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.filters} role="group" aria-label="Filter by difficulty">
          <button
            type="button"
            className={`${styles.filterBtn} ${
              difficultyFilter === 'all' ? styles.filterBtnActive : ''
            }`}
            onClick={() => setDifficultyFilter('all')}
          >
            All levels
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${
              difficultyFilter === 'beginner' ? styles.filterBtnActive : ''
            }`}
            onClick={() => setDifficultyFilter('beginner')}
          >
            Beginner
          </button>
        </div>
      </div>

      {visibleModules.length === 0 ? (
        <div className={styles.empty}>No concepts match those filters. Try clearing a filter.</div>
      ) : (
        visibleModules.map((module) => {
          const topics = topicsForModule(module.id).filter((topic) =>
            filteredBySearch.some((t) => t.id === topic.id),
          );
          const pct = progress.moduleCompletion(topicsForModule(module.id).map((t) => t.id));
          return (
            <ModuleSection
              key={module.id}
              module={module}
              topics={topics}
              statusFor={progress.statusFor}
              onVisit={progress.markVisited}
              onToggleComplete={onToggleComplete}
              completionPercent={pct}
            />
          );
        })
      )}

      <aside className={styles.nextSteps}>
        <h2>Recommended next steps</h2>
        <p className={styles.sectionHint}>
          Layer 01 is Basic Terminology. Next: Compiler Fundamentals and engineering labs (LLVM,
          debugging, benchmarking).
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
            <Link to="/docs/basic-terminology/what-is-an-ast/">What Is an AST?</Link>
          </li>
          <li>
            <Link to="/docs/basic-terminology/what-is-ir/">
              What Is Intermediate Representation (IR)?
            </Link>
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
