import React, { useMemo } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from '../reaserchpaper.module.css';
import { BOOK_TOPICS, getBookTopic, getBooksByTopic, groupBooksByCategory } from '@site/src/data/books';
import LibraryTopicHero from '@site/src/components/library/LibraryTopicHero';
import BookTopicShelf from '@site/src/components/books/BookTopicShelf';

function TopicPageContent() {
  const topicId = useMemo(() => new URLSearchParams(window.location.search).get('topic') || '', []);
  const topic = getBookTopic(topicId) || BOOK_TOPICS[0];
  const items = getBooksByTopic(topic.id);
  const groupedBooks = groupBooksByCategory(items);
  const groupedEntries = Object.entries(groupedBooks);

  return (
    <div className={styles.simpleLibraryShell}>
      <LibraryTopicHero topic={topic} itemCount={items.length} shelfCount={groupedEntries.length} />

      <section className={styles.simpleTopicSection}>
        <div className={styles.simpleTopicSectionHeader}>
          <p className={styles.simpleTopicEyebrow}>Books</p>
          <h2 className={styles.simpleTopicSectionTitle}>Available Books</h2>
        </div>

        <div className={styles.simpleTopicGroups}>
          {groupedEntries.length > 0 ? (
            groupedEntries.map(([groupName, groupItems]) => (
              <BookTopicShelf
                key={groupName}
                groupName={groupName}
                items={groupItems}
                showHeader={groupedEntries.length > 1}
              />
            ))
          ) : (
            <div className={styles.status}>
              Free PDF books for this topic are not listed yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function BooksTopicPage() {
  return (
    <Layout
      title="Books Topic"
      description="Browse books and official references for a specific CompilerSutra topic."
    >
      <Head>
        <meta property="og:title" content="CompilerSutra Books Topic" />
        <meta
          property="og:description"
          content="Browse books for COA, compilers, DSA, Linux, GPU, and LLVM."
        />
      </Head>

      <main className={styles.page}>
        <BrowserOnly
          fallback={
            <div className={styles.simpleLibraryShell}>
              <section className={styles.simpleTopicSection}>
                <div className={styles.status}>Loading topic…</div>
              </section>
            </div>
          }
        >
          {() => <TopicPageContent />}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
