import React, { useState, useEffect } from "react";
import { FaYoutube } from "react-icons/fa";
import styles from "./FloatingSubscribe.module.css";

const COLLAPSED_KEY = "compilersutra-floating-subscribe-collapsed";
const SHOW_DELAY_MS = 60000;
const SHOW_SCROLL_RATIO = 0.6;

export default function FloatingSubscribe() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(max-width: 768px)");
    const updateViewport = () => setMobileViewport(media.matches);
    updateViewport();
    media.addEventListener?.("change", updateViewport);
    media.addListener?.(updateViewport);

    setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "true");

    const showPrompt = () => {
      setVisible(true);
    };

    const maybeShowFromScroll = () => {
      const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const viewportHeight = window.innerHeight || 1;
      const maxScrollable = Math.max(pageHeight - viewportHeight, 1);
      const progress = scrollTop / maxScrollable;

      if (progress >= SHOW_SCROLL_RATIO) {
        showPrompt();
      }
    };

    maybeShowFromScroll();

    const timer = window.setTimeout(showPrompt, SHOW_DELAY_MS);
    window.addEventListener("scroll", maybeShowFromScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", maybeShowFromScroll);
      media.removeEventListener?.("change", updateViewport);
      media.removeListener?.(updateViewport);
    };
  }, []);

  const setCollapsedState = (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COLLAPSED_KEY, String(value));
    }
    setCollapsed(value);
    setVisible(true);
  };

  if (!visible) return null;

  if (collapsed && mobileViewport) {
    return null;
  }

  if (collapsed) {
    return (
      <button
        type="button"
        className={styles.placeholder}
        onClick={() => setCollapsedState(false)}
        aria-label="Open subscription prompt"
      >
        <FaYoutube className={styles.placeholderIcon} />
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.close}
        onClick={() => setCollapsedState(true)}
        aria-label="Close subscription prompt"
      >
        ✕
      </button>

      <div className={styles.content}>
        <div>
          <h4 className={styles.title}>🚀 Learn Compilers & GPU</h4>
          <p className={styles.desc}>Join CompilerSutra on YouTube</p>
        </div>

        <a
          href="https://youtube.com/@compilersutra"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
          onClick={() => setCollapsedState(true)}
        >
          ▶ Subscribe
        </a>
      </div>
    </div>
  );
}
