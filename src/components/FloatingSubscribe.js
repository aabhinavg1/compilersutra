import React, { useState, useEffect } from "react";
import { FaYoutube } from "react-icons/fa";
import styles from "./FloatingSubscribe.module.css";

const COLLAPSED_KEY = "compilersutra-floating-subscribe-collapsed";

export default function FloatingSubscribe() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "true");

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, []);

  const setCollapsedState = (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COLLAPSED_KEY, String(value));
    }
    setCollapsed(value);
    setVisible(true);
  };

  if (!visible) return null;

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
