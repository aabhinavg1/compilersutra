import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import styles from '../reaserchpaper.module.css';
import { BOOK_TOPICS, getBooksByTopic, getBooksOverviewStats } from '@site/src/data/books';
import BookTopicCard from '@site/src/components/books/BookTopicCard';

export default function BooksPage() {
  const { topicCount, totalBookCount } = getBooksOverviewStats();

  return (
    <Layout
      title="Books"
      description="Browse CompilerSutra books and official PDF references by topic."
    >
      <Head>
        <meta property="og:title" content="CompilerSutra Books" />
        <meta
          property="og:description"
          content="Topic-wise books for COA, compilers, DSA, Linux, GPU, and LLVM."
        />
      </Head>

      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={`${styles.hero} ${styles.masterHero} ${styles.libraryLanding}`}>
            <p className={styles.eyebrow}>Books</p>
            <h1 className={styles.title}>CompilerSutra Books</h1>
            <p className={styles.lead}>
              Browse topic-wise shelves for COA, compilers, DSA, Linux, GPU, and LLVM with verified books, PDFs, and official references.
            </p>
            <div className={styles.meta}>
              <span className={styles.pill}>{topicCount} categories</span>
              <span className={styles.pill}>{totalBookCount} books</span>
            </div>
          </section>

          <section className={`${styles.catalogueSection} ${styles.libraryShelfSection}`}>
            <div className={styles.catalogueHeader}>
              <p className={styles.libraryEyebrow}>Categories</p>
              <h2 className={styles.catalogueTitle}>Choose a topic</h2>
              <p className={styles.catalogueText}>
                Each topic groups the strongest starter picks first, followed by deeper books and official references.
              </p>
            </div>

            <div className={styles.catalogueGrid}>
              {BOOK_TOPICS.map((topic) => {
                const itemCount = getBooksByTopic(topic.id).length;
                return <BookTopicCard key={topic.id} topic={topic} itemCount={itemCount} />;
              })}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
