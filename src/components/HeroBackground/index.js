import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './styles.module.css';

const cpuPaths = [
  'path("M -120 180 C 60 180, 160 150, 320 150 S 560 248, 760 248 S 1020 154, 1320 154")',
  'path("M -120 580 C 60 580, 190 616, 338 616 S 588 506, 792 506 S 1048 612, 1326 612")',
];

const gpuPaths = [
  'path("M 1020 116 C 1168 138, 1280 174, 1428 192 S 1570 206, 1730 188")',
  'path("M 1000 164 C 1144 188, 1262 224, 1410 242 S 1556 256, 1730 238")',
  'path("M 984 212 C 1130 238, 1252 274, 1400 292 S 1548 306, 1730 288")',
  'path("M 968 260 C 1112 288, 1238 324, 1388 342 S 1544 356, 1730 338")',
  'path("M 958 500 C 1102 472, 1230 436, 1382 418 S 1538 402, 1734 420")',
  'path("M 972 548 C 1120 520, 1246 484, 1396 466 S 1548 450, 1738 468")',
  'path("M 996 596 C 1146 568, 1268 532, 1418 514 S 1568 498, 1740 516")',
  'path("M 1028 644 C 1170 616, 1290 580, 1442 562 S 1586 546, 1740 564")',
];

const connectorPaths = [
  'path("M 340 148 C 516 154, 634 198, 774 246 S 958 314, 1120 298")',
  'path("M 362 616 C 534 608, 648 566, 792 510 S 972 440, 1124 456")',
];

export default function HeroBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className={styles.background} aria-hidden="true">
      <svg
        className={styles.canvas}
        viewBox="0 0 1600 760"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="cpuGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
            <stop offset="45%" stopColor="#00F0FF" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gpuGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0" />
            <stop offset="50%" stopColor="#8A2BE2" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
          </linearGradient>
          <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <g className={styles.cpuLayer}>
          <path className={styles.cpuPath} d="M-120 180 C 60 180, 160 150, 320 150 S 560 248, 760 248 S 1020 154, 1320 154" />
          <path className={styles.cpuPath} d="M-120 580 C 60 580, 190 616, 338 616 S 588 506, 792 506 S 1048 612, 1326 612" />
        </g>

        <g className={styles.gpuLayer} filter="url(#softBlur)">
          <path className={styles.gpuPath} d="M1020 116 C 1168 138, 1280 174, 1428 192 S 1570 206, 1730 188" />
          <path className={styles.gpuPath} d="M1000 164 C 1144 188, 1262 224, 1410 242 S 1556 256, 1730 238" />
          <path className={styles.gpuPath} d="M984 212 C 1130 238, 1252 274, 1400 292 S 1548 306, 1730 288" />
          <path className={styles.gpuPath} d="M968 260 C 1112 288, 1238 324, 1388 342 S 1544 356, 1730 338" />
          <path className={styles.gpuPath} d="M958 500 C 1102 472, 1230 436, 1382 418 S 1538 402, 1734 420" />
          <path className={styles.gpuPath} d="M972 548 C 1120 520, 1246 484, 1396 466 S 1548 450, 1738 468" />
          <path className={styles.gpuPath} d="M996 596 C 1146 568, 1268 532, 1418 514 S 1568 498, 1740 516" />
          <path className={styles.gpuPath} d="M1028 644 C 1170 616, 1290 580, 1442 562 S 1586 546, 1740 564" />
        </g>

        <g className={styles.connectorLayer}>
          <path className={styles.connectorPath} d="M340 148 C 516 154, 634 198, 774 246 S 958 314, 1120 298" />
          <path className={styles.connectorPath} d="M362 616 C 534 608, 648 566, 792 510 S 972 440, 1124 456" />
        </g>
      </svg>
      <div className={styles.particleLayer}>
        {cpuPaths.map((path, index) => (
          <motion.span
            key={`cpu-${path}`}
            className={`${styles.particle} ${styles.cpuParticle}`}
            style={{ offsetPath: path }}
            animate={
              reduceMotion
                ? { opacity: 0.12 }
                : { offsetDistance: ['0%', '100%'], opacity: [0, 0.16, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 9 + index * 1.4,
                    delay: index * 1.2,
                    ease: 'linear',
                    repeat: Infinity,
                  }
            }
          />
        ))}

        {gpuPaths.map((path, index) => (
          <motion.span
            key={`gpu-${path}`}
            className={`${styles.particle} ${styles.gpuParticle}`}
            style={{ offsetPath: path }}
            animate={
              reduceMotion
                ? { opacity: 0.1 }
                : {
                    offsetDistance: ['0%', '100%'],
                    opacity: [0, 0.12, 0.18, 0],
                    scale: [0.85, 1, 0.9],
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 6 + (index % 4) * 0.55,
                    delay: index * 0.42,
                    ease: 'linear',
                    repeat: Infinity,
                  }
            }
          />
        ))}

        {connectorPaths.map((path, index) => (
          <motion.span
            key={`connector-${path}`}
            className={`${styles.particle} ${styles.connectorParticle}`}
            style={{ offsetPath: path }}
            animate={
              reduceMotion
                ? { opacity: 0.08 }
                : { offsetDistance: ['0%', '100%'], opacity: [0, 0.1, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 7.8,
                    delay: index * 2.1,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }
            }
          />
        ))}
      </div>
      <div className={styles.edgeGlowLeft} />
      <div className={styles.edgeGlowRight} />
      <div className={styles.centerFade} />
    </div>
  );
}
