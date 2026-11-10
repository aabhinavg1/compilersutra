import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, FileCode2 } from 'lucide-react';
import Badge from './Badge';
import styles from './clangFlags.module.css';

export default function SourceCode({ file, flag, language = 'c', code, note }) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef(null);

  useEffect(() => () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
  }, []);

  const copyText = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      return true;
    }
    if (typeof document === 'undefined') {
      throw new Error('Clipboard is unavailable');
    }
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand?.('copy');
    document.body.removeChild(textarea);
    if (!success) {
      throw new Error('Copy command failed');
    }
    return true;
  };

  const handleCopy = async () => {
    try {
      await copyText();
      setCopied(true);
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const fileLabel = file || 'source';

  return (
    <section className={styles.sourceCodeBlock}>
      <div className={styles.codeHeader} role="toolbar" aria-label={`${fileLabel} toolbar`}>
        <div className={styles.sourceCodeFileWrap}>
          <FileCode2 size={15} strokeWidth={2} className={styles.sourceCodeFileIcon} aria-hidden="true" />
          <span className={styles.codeTitle}>{fileLabel}</span>
          {language ? (
            <span className={styles.codeLanguage} aria-hidden="true">{language}</span>
          ) : null}
        </div>
        <div className={styles.sourceCodeHeaderRight}>
          {flag ? (
            <Badge
              tone="accent"
              className={styles.sourceCodeFlagBadge}
              title={`Example context: compiled with ${flag}`}
              aria-label={`Example context flag ${flag}`}
            >
              <span className={styles.sourceCodeFlagLabel} aria-hidden="true">with</span>
              <span className={styles.sourceCodeFlagValue}>{flag}</span>
            </Badge>
          ) : null}
          <button
            type="button"
            className={styles.copyButton}
            onClick={handleCopy}
            aria-label={copied ? `Copied ${fileLabel}` : `Copy ${fileLabel} to clipboard`}
            aria-live="polite"
          >
            {copied ? <Check size={14} strokeWidth={2.25} aria-hidden="true" /> : <Copy size={14} strokeWidth={2.25} aria-hidden="true" />}
            <span className={styles.copyButtonLabel} aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <pre className={styles.codePre}>
        <code>{code}</code>
      </pre>
      {note ? <p className={styles.sourceCodeNote}>{note}</p> : null}
    </section>
  );
}
