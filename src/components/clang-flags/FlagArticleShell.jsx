import React, { useEffect, useMemo, useRef, useState } from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import { BookOpenText, Check, ChevronDown, Code2, Copy, ExternalLink, FileText, Layers3, LayoutList } from 'lucide-react';
import Badge from './Badge';
import CodeBlock from './CodeBlock';
import { resolveFlagPathValue, buildFlagArticlePath } from './flagRoutes';
import { buildPipelineTrail, buildImplementationTrail } from './flagTrails';
import { findFlagOption, getPublicFlag, joinList, uniqueValues } from './utils';
import styles from './clangFlags.module.css';

function buildHeadingId(text, index) {
  const base = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || `section-${index}`;
}

function isH2Element(child) {
  if (!child || typeof child !== 'object') {
    return false;
  }
  if (typeof child.type === 'string') {
    return child.type === 'h2';
  }
  const props = child.props || {};
  return props.level === 2 || props.as === 'h2';
}

function groupArticleSections(children) {
  const items = React.Children.toArray(children).filter(Boolean);
  const sections = [];
  let current = null;

  items.forEach((child) => {
    if (isH2Element(child)) {
      if (current) {
        sections.push(current);
      }
      current = { heading: child, body: [] };
    } else if (current) {
      current.body.push(child);
    } else {
      current = { heading: null, body: [child] };
      sections.push(current);
      current = null;
    }
  });

  if (current) {
    sections.push(current);
  }

  return sections;
}

function buildTocItems(root) {
  if (!root) {
    return [];
  }
  const headings = Array.from(root.querySelectorAll('h2, h3'));
  return headings.map((heading, index) => {
    const text = heading.textContent ? heading.textContent.trim() : '';
    if (!heading.id) {
      heading.id = buildHeadingId(text, index);
    }
    return {
      id: heading.id,
      text,
      level: heading.tagName === 'H3' ? 3 : 2,
    };
  });
}

function ArticleSection({ icon: Icon, title, note, children }) {
  return (
    <section className={styles.articleSection}>
      <div className={styles.articleSectionHeader}>
        <div className={styles.articleSectionTitleWrap}>
          {Icon ? <Icon size={16} strokeWidth={2} className={styles.sectionIcon} /> : null}
          <div>
            <h2 className={styles.articleSectionTitle}>{title}</h2>
            {note ? <p className={styles.articleSectionNote}>{note}</p> : null}
          </div>
        </div>
      </div>
      <div className={styles.articleSectionBody}>{children}</div>
    </section>
  );
}

function normalizeIncomingData(data) {
  if (!data || !Array.isArray(data.options)) {
    return { options: [], groups: [] };
  }
  return data;
}

function buildToolLabels(flag) {
  const labels = [];
  const visibility = flag.visibility || [];

  if (visibility.includes('CLOption')) labels.push('clang-cl');
  if (visibility.includes('DXCOption')) labels.push('dxc');
  if (visibility.includes('FlangOption')) labels.push('flang');
  if (visibility.includes('FC1Option')) labels.push('flang -fc1');
  if (visibility.includes('CC1AsOption')) labels.push('clang -cc1as');
  if (visibility.includes('CC1Option')) labels.push('clang -cc1');
  if (visibility.includes('ClangOption')) labels.push(flag.category === 'Linker' ? 'clang++' : 'clang');

  if (!labels.length) {
    labels.push('clang');
  }

  return uniqueValues(labels);
}

function buildStatus(flag) {
  if (flag.deprecated) return 'Deprecated';
  if (flag.experimental) return 'Experimental';
  return 'Stable';
}

function isFramePointerFlag(flag) {
  const name = String(flag?.flag || '').toLowerCase();
  return name.includes('frame-pointer');
}

const RELATED_HELP_FALLBACKS = {
  '-fomit-frame-pointer': 'Request omission of the frame pointer where permitted by the target/backend.',
  '-fno-omit-frame-pointer': 'Request keeping a frame pointer where permitted by the target/backend.',
  '-mframe-pointer=': 'Select FP policy: all, non-leaf, reserved, or none.',
  '-momit-leaf-frame-pointer': 'Prefer omitting frame-pointer setup in leaf functions.',
  '-mno-omit-leaf-frame-pointer': 'Prefer keeping frame-pointer setup in leaf functions.',
};

function shortenCategoryLabel(category) {
  const value = String(category || '').trim();
  if (!value) return 'General';
  return value
    .replace(/^Target-Specific Code Generation$/i, 'Target codegen')
    .replace(/^Target-independent compilation options$/i, 'Target-sensitive')
    .replace(/^Code Generation$/i, 'Codegen')
    .replace(/^Optimization$/i, 'Opt');
}

function relatedFlagSummary(item) {
  const fromData = String(item?.help || item?.documentation || '').trim();
  if (fromData && fromData.toLowerCase() !== 'no help text available.') {
    return fromData;
  }
  return RELATED_HELP_FALLBACKS[item?.flag] || RELATED_HELP_FALLBACKS[item?.publicFlag] || 'Adjacent Clang frame-pointer option.';
}

function buildArchitecture(flag) {
  const haystack = [flag.flag, flag.help, flag.groupLabel, flag.category].filter(Boolean).join(' ').toUpperCase();
  if (haystack.includes('AARCH64')) {
    return 'AArch64';
  }
  // Frame-pointer policy is target- and version-sensitive; do not label it as a
  // universal / ABI-independent option just because Options.td uses f_Group.
  if (isFramePointerFlag(flag)) {
    return 'Target-sensitive codegen';
  }
  if (flag.groupLabel) {
    return String(flag.groupLabel).replace(/^AARCH64$/, 'AArch64');
  }
  return 'Clang';
}

function buildPipelineLabel(flag) {
  const haystack = [flag.flag, flag.help, flag.groupLabel].filter(Boolean).join(' ').toLowerCase();
  if (isFramePointerFlag(flag)) return 'Backend / Code generation';
  if (flag.category === 'Warning') return 'Frontend';
  if (flag.category === 'Preprocessor') return 'Frontend';
  if (flag.category === 'Optimization' || /^-o/.test(String(flag.flag || '').toLowerCase())) return 'Optimization';
  if (flag.category === 'Sanitizer') return 'Backend';
  if (flag.category === 'Linker') return 'Linker';
  return 'Backend';
}

function buildImpact(flag) {
  const name = String(flag.flag || '').toLowerCase();
  if (/fcall-(saved|used)-/.test(name) || /-f(fixed|reserve)-/.test(name)) return 'Register allocation / ABI';
  if (name.includes('frame-pointer')) return 'Frame-pointer policy / stack layout';
  if (flag.category === 'Warning') return 'Diagnostics';
  if (flag.category === 'Preprocessor') return 'Preprocessing';
  if (flag.category === 'Linker') return 'Linking';
  if (flag.category === 'Sanitizer') return 'Instrumentation';
  if (flag.category === 'Optimization') return 'Code generation';
  return buildPipelineLabel(flag);
}

function buildRisk(flag) {
  const name = String(flag.flag || '').toLowerCase();
  if (/fcall-(saved|used)-/.test(name) || /-f(fixed|reserve)-/.test(name)) return 'ABI-affecting';
  if (flag.deprecated) return 'Deprecated';
  if (flag.experimental) return 'Experimental';
  return 'Low';
}

function buildReportIssueUrl(flag) {
  const displayFlag = getPublicFlag(flag);
  const title = encodeURIComponent('Clang flag article: ' + displayFlag);
  const body = encodeURIComponent([
    'Flag: ' + displayFlag,
    'Source: ' + (flag.sourceUrl || 'Not available'),
    'Article: ' + buildFlagArticlePath(displayFlag),
    '',
    'Describe the issue here.',
  ].join('\n'));

  return 'https://github.com/aabhinavg1/compilersutra/issues/new?title=' + title + '&body=' + body;
}

export default function FlagArticleShell({ flagPath, children, summary }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tocItems, setTocItems] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [copiedFlag, setCopiedFlag] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const dataUrl = useBaseUrl('/data/clang-flags.json');
  const requestedFlag = resolveFlagPathValue(flagPath);
  const articleRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function loadData() {
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`Failed to load ${dataUrl} (${response.status})`);
        }
        const payload = await response.json();
        if (alive) {
          setData(normalizeIncomingData(payload));
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Failed to load compiler flag data.');
        }
      }
    }

    loadData();
    return () => {
      alive = false;
    };
  }, [dataUrl]);

  const options = data?.options ?? [];
  const meta = data ?? {};
  const flag = useMemo(
    () => findFlagOption(options, requestedFlag),
    [options, requestedFlag],
  );

  useEffect(() => {
    if (!flag) {
      setTocItems([]);
      return;
    }
    const items = buildTocItems(articleRef.current);
    setTocItems(items);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-88px 0px -70% 0px', threshold: 0 },
    );

    items.forEach((item) => {
      const node = articleRef.current?.querySelector(`#${CSS.escape(item.id)}`);
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [flag]);

  useEffect(() => {
    const handleScroll = () => {
      if (!tocItems.length || typeof document === 'undefined') {
        return;
      }
      const positions = tocItems
        .map((item) => {
          const node = document.getElementById(item.id);
          return node ? { item, top: node.getBoundingClientRect().top } : null;
        })
        .filter(Boolean);
      if (!positions.length) {
        return;
      }
      const offset = window.innerHeight * 0.32;
      const current = positions
        .filter(({ top }) => top - 88 <= offset)
        .sort((a, b) => b.top - a.top)[0];
      setActiveSection(current ? current.item.id : positions[0].item.id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const heroSummary = useMemo(() => {
    if (summary) return summary;
    if (flag?.documentation) return flag.documentation;
    if (flag?.help) return flag.help;
    return 'Reference entry for a Clang compiler flag.';
  }, [flag, summary]);

  const toolLabels = useMemo(() => (flag ? buildToolLabels(flag) : []), [flag]);
  const status = useMemo(() => (flag ? buildStatus(flag) : 'Stable'), [flag]);
  const architecture = useMemo(() => (flag ? buildArchitecture(flag) : 'Clang'), [flag]);
  const pipeline = useMemo(() => (flag ? buildPipelineLabel(flag) : 'Backend'), [flag]);
  const impact = useMemo(() => (flag ? buildImpact(flag) : 'Code generation'), [flag]);
  const risk = useMemo(() => (flag ? buildRisk(flag) : 'Low'), [flag]);
  const pipelineTrail = useMemo(() => (flag ? buildPipelineTrail(flag) : []), [flag]);
  const implementationTrail = useMemo(() => (flag ? buildImplementationTrail(flag) : []), [flag]);
  const sourceLabel = useMemo(() => {
    if (!flag?.sourcePath) return 'Unknown source';
    if (flag.flag === '-fexperimental-bounds-safety' || flag.flag === '-fno-experimental-bounds-safety') {
      return `${flag.sourcePath}:2070–2076 (commit debad832)`;
    }
    return flag.sourceLine ? `${flag.sourcePath}:${flag.sourceLine}` : flag.sourcePath;
  }, [flag]);

  const heroBadges = useMemo(() => {
    if (!flag) return [];
    return [architecture, status, pipeline, flag.category || 'General', 'LLVM Snapshot'];
  }, [flag, architecture, status, pipeline]);

  const heroMetaCards = useMemo(() => {
    if (!flag) return [];
    return [
      { label: 'Architecture', value: architecture },
      { label: 'Category', value: flag.category || 'General' },
      { label: 'Optimization', value: impact },
      { label: 'Risk', value: risk },
      { label: 'Pipeline', value: pipeline },
      { label: 'Driver', value: flag.cc1 ? 'clang -cc1' : 'clang' },
      { label: 'Tool', value: joinList(toolLabels) || 'clang' },
      { label: 'Status', value: status },
    ];
  }, [flag, architecture, pipeline, impact, risk, toolLabels, status]);

  const related = useMemo(() => {
    if (!flag) return [];
    if (flag.relatedFlags?.length) {
      return flag.relatedFlags
        .map((item) => options.find((candidate) => candidate.flag === item))
        .filter(Boolean)
        .slice(0, 6);
    }
    return options
      .filter((candidate) => candidate.flag !== flag.flag && candidate.category === flag.category)
      .slice(0, 6);
  }, [flag, options]);

  if (error) {
    return <main style={{ padding: '2rem', color: 'var(--cf-text)' }}>{error}</main>;
  }

  if (!data || !requestedFlag) {
    return null;
  }

  if (!flag) {
    return (
      <main style={{ padding: '2rem', color: 'var(--cf-text)' }}>
        <p>Flag not found: {requestedFlag}</p>
      </main>
    );
  }

  const reportIssueUrl = buildReportIssueUrl(flag);
  const displayFlag = getPublicFlag(flag);
  const sourcePreviewFlag = flag.publicFlag && flag.publicFlag !== flag.flag ? flag.flag : displayFlag;
  const sourcePreviewLine =
    flag.flag === '-fexperimental-bounds-safety' || flag.flag === '-fno-experimental-bounds-safety'
      ? '2070–2076'
      : flag.sourceLine;

  const copyFlag = async () => {
    try {
      await navigator.clipboard.writeText(displayFlag);
      setCopiedFlag(true);
      window.setTimeout(() => setCopiedFlag(false), 1400);
    } catch {
      setCopiedFlag(false);
    }
  };

  return (
    <>
      <Head>
        <meta name="description" content={heroSummary} />
      </Head>

      <main className={styles.articlePageShell}>
        <section className={styles.articleHero}>
          <div className={styles.articleHeroTopline}>
            <div className={styles.articleBreadcrumbs}>
              <Link to="/tools/clang-flags/">Clang Flags</Link>
              <span>/</span>
              <span>Flag reference</span>
            </div>
            <span className={styles.articleHeroEyebrow}>Compiler option · {architecture}</span>
          </div>
          <div className={styles.articleHeroCopy}>
            <div className={styles.articleHeroTitleRow}>
              <div className={styles.articleHeroTitleMark} aria-hidden="true">$</div>
              <h1 className={styles.articleHeroTitle}>{displayFlag}</h1>
            </div>
            <p className={styles.articleHeroSummary}>{heroSummary}</p>
            <div className={styles.heroBadgeRow}>
              {heroBadges.map((badge) => (
                <Badge
                  key={badge}
                  tone={badge === 'LLVM Snapshot' ? 'accent' : badge === 'Stable' ? 'success' : badge === 'Backend' || badge === 'ABI' ? 'info' : 'neutral'}
                >
                  {badge}
                </Badge>
              ))}
            </div>
            <div className={styles.articleHeroMetaGrid}>
              {heroMetaCards.map((item) => (
                <div key={item.label} className={styles.articleHeroMetaCard}>
                  <div className={styles.articleHeroMetaLabel}>{item.label}</div>
                  <div className={styles.articleHeroMetaValue}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className={styles.articleHeroActions}>
              <button type="button" className={styles.heroActionButton + ' ' + styles.heroActionButtonPrimary} onClick={copyFlag}>
                {copiedFlag ? <Check size={14} strokeWidth={2.25} /> : <Copy size={14} strokeWidth={2} />}
                <span>{copiedFlag ? 'Copied flag' : 'Copy flag'}</span>
              </button>
              {flag.sourceUrl ? (
                <Link className={styles.heroActionButton + ' ' + styles.heroActionButtonSecondary} href={flag.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} strokeWidth={2} />
                  <span>View Source</span>
                </Link>
              ) : (
                <button type="button" className={styles.heroActionButton + ' ' + styles.heroActionButtonSecondary} disabled>
                  <ExternalLink size={14} strokeWidth={2} />
                  <span>View Source</span>
                </button>
              )}
              <Link className={styles.heroActionButton + ' ' + styles.heroActionButtonDanger} href={reportIssueUrl} target="_blank" rel="noreferrer">
                <FileText size={14} strokeWidth={2} />
                <span>Report Issue</span>
              </Link>
            </div>
          </div>
        </section>

        <div className={styles.articleLayout}>
          <article className={styles.articleMain} ref={articleRef}>
            {tocItems.length > 0 ? (
              <div className={styles.mobileToc}>
                <button
                  type="button"
                  className={styles.mobileTocToggle}
                  aria-expanded={mobileTocOpen}
                  onClick={() => setMobileTocOpen((value) => !value)}
                >
                  <LayoutList size={15} strokeWidth={2.1} aria-hidden="true" />
                  <span>On this page</span>
                  <ChevronDown
                    size={14}
                    strokeWidth={2.2}
                    className={clsx(styles.mobileTocChevron, mobileTocOpen && styles.mobileTocChevronOpen)}
                    aria-hidden="true"
                  />
                </button>
                {mobileTocOpen ? (
                  <nav className={styles.mobileTocNav} aria-label="Page sections">
                    {tocItems.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={clsx(
                          styles.mobileTocLink,
                          item.level === 3 && styles.mobileTocLinkSub,
                          activeSection === item.id && styles.mobileTocLinkActive,
                        )}
                        onClick={(event) => {
                          event.preventDefault();
                          setMobileTocOpen(false);
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                ) : null}
              </div>
            ) : null}

            {flag.exampleClang || flag.exampleGCC ? (
              <ArticleSection icon={Code2} title="Quick usage" note="A runnable command that shows the flag in action.">
                <div className={styles.quickUsageGrid}>
                  {flag.exampleClang ? <CodeBlock title="clang++" language="shell" code={flag.exampleClang} /> : null}
                  {flag.exampleGCC ? <CodeBlock title="gcc / g++" language="shell" code={flag.exampleGCC} /> : null}
                </div>
              </ArticleSection>
            ) : null}

            <ArticleSection icon={Layers3} title="Pipeline" note="Where this option takes effect in the Clang compilation pipeline.">
              <div className={styles.pipelineFlow}>
                {pipelineTrail.map((step, index) => (
                  <React.Fragment key={step.title}>
                    <div className={styles.pipelineStep}>
                      <div className={styles.pipelineStepTitle}>{step.title}</div>
                      <div className={styles.pipelineStepNote}>{step.note}</div>
                    </div>
                    {index < pipelineTrail.length - 1 ? <div className={styles.pipelineArrow}>→</div> : null}
                  </React.Fragment>
                ))}
              </div>
              {isFramePointerFlag(flag) ? (
                <p className={styles.bodyCopy} style={{ marginTop: '0.85rem' }}>
                  This flag sets <strong>frame-pointer policy</strong> for codegen. It does not insert sanitizer
                  instrumentation or bind a sanitizer runtime. Backend <code>hasFP()</code> may still keep a frame
                  pointer for VLAs, EH helpers, or ABI constraints, and unwind tables remain a separate knob.
                </p>
              ) : null}
            </ArticleSection>

            {groupArticleSections(children).map((section, index) => (
              <section
                key={section.heading?.key || `md-section-${index}`}
                className={styles.mdSection}
              >
                {section.heading}
                <div className={styles.mdSectionBody}>{section.body}</div>
              </section>
            ))}

            <div className={styles.detailSplitGrid}>
              <ArticleSection icon={FileText} title="Source preview" note="Where the option is defined in the Clang source tree.">
                <div className={styles.sourcePreview}>
                  <div className={styles.sourcePreviewHeader}>
                    <span>{flag.sourcePath || 'Options.td'}</span>
                    {sourcePreviewLine ? <span>Lines {sourcePreviewLine}</span> : null}
                  </div>
                  <div className={styles.sourcePreviewBody}>
                    <code>{sourcePreviewFlag}</code>
                    <span>Open the GitHub source to inspect the surrounding definition and implementation context.</span>
                  </div>
                </div>
              </ArticleSection>

              <ArticleSection icon={FileText} title="Definition" note="The precise source location and link.">
                <div className={styles.definitionBlock}>
                  <div className={styles.definitionLabel}>Defined in</div>
                  <div className={styles.definitionValue}>{sourceLabel}</div>
                  {flag.sourceUrl ? (
                    <Link className={styles.sourceLink} href={flag.sourceUrl} target="_blank" rel="noreferrer">
                      View source on GitHub
                      <ExternalLink size={14} strokeWidth={2} />
                    </Link>
                  ) : null}
                </div>
              </ArticleSection>
            </div>

            <ArticleSection icon={Layers3} title="Implementation" note="How the flag flows from the driver through to code generation.">
              <div className={styles.timeline}>
                {implementationTrail.map((step) => (
                  <div key={step.title} className={styles.timelineItem}>
                    <div className={styles.timelineLabel}>{step.title}</div>
                    <div className={styles.timelineValue}>{step.value}</div>
                    <div className={styles.timelineNote}>{step.note}</div>
                  </div>
                ))}
              </div>
            </ArticleSection>

            <div id="related-flags">
              <ArticleSection icon={BookOpenText} title="Related Flags" note="Move through adjacent flags without losing the article context.">
                {related.length > 0 ? (
                  <div className={styles.relatedGrid}>
                    {related.map((item) => {
                      const relatedDisplayFlag = getPublicFlag(item);
                      const tools = joinList(buildToolLabels(item)) || 'clang';
                      return (
                      <Link key={item.flag} className={styles.relatedArticleCard} to={buildFlagArticlePath(relatedDisplayFlag)}>
                        <div className={styles.relatedArticleTop}>
                          <div className={styles.relatedArticleFlag}>{relatedDisplayFlag}</div>
                          <Badge tone="info" className={styles.relatedArticleBadge}>
                            {shortenCategoryLabel(item.category)}
                          </Badge>
                        </div>
                        <div className={styles.relatedArticleSummary}>{relatedFlagSummary(item)}</div>
                        <div className={styles.relatedArticleMeta}>
                          <span>{item.kind || 'Flag'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{tools}</span>
                        </div>
                      </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.bodyCopy}>No adjacent flags were identified in the current dataset.</p>
                )}
              </ArticleSection>
            </div>

            <div id="source-references">
              <ArticleSection icon={BookOpenText} title="Source References" note="The most important provenance links for the article.">
                <div className={styles.referenceList}>
                  {flag.sourceUrl ? <a href={flag.sourceUrl} target="_blank" rel="noreferrer">LLVM source for this option</a> : null}
                  {meta?.sourceBaseUrl ? <a href={meta.sourceBaseUrl} target="_blank" rel="noreferrer">LLVM source snapshot</a> : null}
                  <a href="https://llvm.org/docs/" target="_blank" rel="noreferrer">LLVM documentation</a>
                  <a href="/tools/clang-flags-explorer/">CompilerSutra flags explorer</a>
                </div>
              </ArticleSection>
            </div>
          </article>

          <aside className={styles.articleToc} aria-label="On this page">
            <div className={styles.articleTocInner}>
              <div className={styles.articleTocKicker}>On this page</div>
              <nav className={styles.articleTocNav}>
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={clsx(
                      styles.articleTocLink,
                      item.level === 3 && styles.articleTocLinkSub,
                      activeSection === item.id && styles.articleTocLinkActive,
                    )}
                    onClick={(event) => {
                      event.preventDefault();
                      const target = document.getElementById(item.id);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
