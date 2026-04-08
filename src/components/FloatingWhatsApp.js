import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import styles from "./FloatingWhatsApp.module.css";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/C5lBzje4CjvLTZBhS0O92x";
const COLLAPSED_KEY = "compilersutra-whatsapp-community-collapsed";

export default function FloatingWhatsApp() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "true");
    setMounted(true);
  }, []);

  const setCollapsedState = (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COLLAPSED_KEY, String(value));
    }
    setCollapsed(value);
  };

  if (!mounted) {
    return null;
  }

  if (collapsed) {
    return (
      <button
        type="button"
        className={styles.placeholder}
        onClick={() => setCollapsedState(false)}
        aria-label="Open WhatsApp community link"
      >
        <FaWhatsapp className={styles.placeholderIcon} />
      </button>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.close}
        onClick={() => setCollapsedState(true)}
        aria-label="Hide WhatsApp community prompt"
      >
        ×
      </button>
      <a
        href={WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join CompilerSutra on WhatsApp"
        className={styles.floatingLink}
        onClick={() => setCollapsedState(true)}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <FaWhatsapp className={styles.icon} />
        </span>
        <span className={styles.textWrap}>
          <span className={styles.label}>Join WhatsApp</span>
          <span className={styles.subLabel}>CompilerSutra community</span>
        </span>
      </a>
    </div>
  );
}
