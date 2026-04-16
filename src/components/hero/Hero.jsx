import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { FaEnvelope, FaRocket, FaArrowRight, FaMicrochip, FaCode, FaChartLine } from 'react-icons/fa';
import styles from './Hero.module.css';

export default function Hero({ newsletterUrl }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`${styles.hero} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.background} aria-hidden="true">
        {/* SVG Circuit Lines */}
        <svg className={styles.canvas} viewBox="0 0 1600 760" preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id="heroCpu" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0" />
              <stop offset="30%" stopColor="#00F0FF" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#00F0FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroGpu" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0" />
              <stop offset="40%" stopColor="#8A2BE2" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#00F0FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#8A2BE2" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.12" />
            </linearGradient>
            <filter id="heroBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id="heroBlurStrong" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <rect width="1600" height="760" fill="url(#heroGlow)" />

          {/* CPU Wires - Top section */}
          <g className={styles.cpuGroup} opacity="0.6">
            {/* Main CPU bus lines */}
            <path className={styles.cpuPath} d="M -50 150 C 100 150, 200 130, 350 140 S 600 160, 800 150 S 1000 130, 1200 140 S 1350 160, 1450 150" />
            <path className={styles.cpuPath} d="M -50 250 C 120 250, 220 230, 370 240 S 620 260, 820 250 S 1020 230, 1220 240 S 1370 260, 1470 250" />
            <path className={styles.cpuPath} d="M -50 350 C 140 350, 240 330, 390 340 S 640 360, 840 350 S 1040 330, 1240 340 S 1390 360, 1490 350" />
            <path className={styles.cpuPath} d="M -50 450 C 160 450, 260 430, 410 440 S 660 460, 860 450 S 1060 430, 1260 440 S 1410 460, 1510 450" />
            
            {/* Vertical connectors */}
            <path className={styles.cpuPath} d="M 350 140 L 350 440" />
            <path className={styles.cpuPath} d="M 550 155 L 550 445" />
            <path className={styles.cpuPath} d="M 750 148 L 750 448" />
            <path className={styles.cpuPath} d="M 950 145 L 950 445" />
            <path className={styles.cpuPath} d="M 1150 145 L 1150 445" />
            <path className={styles.cpuPath} d="M 1350 155 L 1350 445" />
            
            {/* CPU chip nodes */}
            <circle cx="350" cy="290" r="8" className={styles.cpuNode} />
            <circle cx="550" cy="300" r="6" className={styles.cpuNode} />
            <circle cx="750" cy="298" r="7" className={styles.cpuNode} />
            <circle cx="950" cy="295" r="6" className={styles.cpuNode} />
            <circle cx="1150" cy="295" r="8" className={styles.cpuNode} />
            <circle cx="1350" cy="305" r="6" className={styles.cpuNode} />
          </g>

          {/* GPU Wires - Bottom section */}
          <g className={styles.gpuGroup} filter="url(#heroBlur)" opacity="0.5">
            {/* GPU parallel lanes */}
            <path className={styles.gpuPath} d="M 900 520 C 1000 530, 1100 550, 1250 540 S 1400 520, 1550 530" />
            <path className={styles.gpuPath} d="M 900 560 C 1020 570, 1120 590, 1270 580 S 1420 560, 1570 570" />
            <path className={styles.gpuPath} d="M 900 600 C 1040 610, 1140 630, 1290 620 S 1440 600, 1590 610" />
            <path className={styles.gpuPath} d="M 900 640 C 1060 650, 1160 670, 1310 660 S 1460 640, 1610 650" />
            <path className={styles.gpuPath} d="M 900 680 C 1080 690, 1180 710, 1330 700 S 1480 680, 1630 690" />
            
            {/* GPU vertical connections */}
            <path className={styles.gpuPath} d="M 1050 530 L 1050 690" />
            <path className={styles.gpuPath} d="M 1200 540 L 1200 700" />
            <path className={styles.gpuPath} d="M 1350 530 L 1350 690" />
            <path className={styles.gpuPath} d="M 1500 540 L 1500 690" />
            
            {/* GPU cores */}
            <rect x="1040" y="580" width="20" height="20" rx="3" className={styles.gpuCore} />
            <rect x="1190" y="590" width="20" height="20" rx="3" className={styles.gpuCore} />
            <rect x="1340" y="580" width="20" height="20" rx="3" className={styles.gpuCore} />
            <rect x="1490" y="590" width="20" height="20" rx="3" className={styles.gpuCore} />
            
            {/* Data particles on GPU lanes */}
            <circle cx="1050" cy="560" r="4" className={styles.gpuParticleNode} style={{ animationDelay: '0s' }} />
            <circle cx="1200" cy="600" r="4" className={styles.gpuParticleNode} style={{ animationDelay: '0.5s' }} />
            <circle cx="1350" cy="560" r="4" className={styles.gpuParticleNode} style={{ animationDelay: '1s' }} />
            <circle cx="1500" cy="600" r="4" className={styles.gpuParticleNode} style={{ animationDelay: '1.5s' }} />
          </g>

          {/* Animated data pulses */}
          <g className={styles.pulseGroup}>
            <circle cx="200" cy="300" r="3" className={styles.dataPulse} style={{ animationDelay: '0s' }} />
            <circle cx="400" cy="300" r="3" className={styles.dataPulse} style={{ animationDelay: '0.8s' }} />
            <circle cx="600" cy="300" r="3" className={styles.dataPulse} style={{ animationDelay: '1.6s' }} />
            <circle cx="800" cy="300" r="3" className={styles.dataPulse} style={{ animationDelay: '2.4s' }} />
            <circle cx="1000" cy="300" r="3" className={styles.dataPulse} style={{ animationDelay: '3.2s' }} />
          </g>

          {/* Floating nodes */}
          <g className={styles.floatingNodes}>
            {[...Array(20)].map((_, idx) => (
              <circle
                key={`node-${idx}`}
                cx={100 + Math.random() * 1400}
                cy={100 + Math.random() * 560}
                r={2 + Math.random() * 4}
                fill={idx % 2 === 0 ? '#00F0FF' : '#8A2BE2'}
                opacity={0.15 + Math.random() * 0.25}
                className={styles.floatingNode}
                style={{
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </g>
        </svg>

        {/* Animated particles moving along paths */}
        <div className={styles.particleField}>
          {/* CPU particles */}
          <div className={styles.particleTrack} style={{ top: '140px', left: '0px', right: '0px' }}>
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '0s' }} />
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '2s' }} />
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '4s' }} />
          </div>
          <div className={styles.particleTrack} style={{ top: '240px', left: '0px', right: '0px' }}>
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '1s' }} />
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '3s' }} />
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '5s' }} />
          </div>
          <div className={styles.particleTrack} style={{ top: '340px', left: '0px', right: '0px' }}>
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '0.5s' }} />
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '2.5s' }} />
            <div className={`${styles.particle} ${styles.cpuParticle}`} style={{ animationDelay: '4.5s' }} />
          </div>
          
          {/* GPU particles */}
          <div className={styles.particleTrack} style={{ top: '540px', left: '900px', right: '0px' }}>
            <div className={`${styles.particle} ${styles.gpuParticle}`} style={{ animationDelay: '0.3s' }} />
            <div className={`${styles.particle} ${styles.gpuParticle}`} style={{ animationDelay: '2.3s' }} />
          </div>
          <div className={styles.particleTrack} style={{ top: '580px', left: '900px', right: '0px' }}>
            <div className={`${styles.particle} ${styles.gpuParticle}`} style={{ animationDelay: '0.8s' }} />
            <div className={`${styles.particle} ${styles.gpuParticle}`} style={{ animationDelay: '2.8s' }} />
          </div>
          <div className={styles.particleTrack} style={{ top: '620px', left: '900px', right: '0px' }}>
            <div className={`${styles.particle} ${styles.gpuParticle}`} style={{ animationDelay: '1.3s' }} />
            <div className={`${styles.particle} ${styles.gpuParticle}`} style={{ animationDelay: '3.3s' }} />
          </div>
        </div>

        <div className={styles.edgeGlowLeft} />
        <div className={styles.edgeGlowRight} />
        <div className={styles.centerCalm} />
        
        {/* Code snippet overlay */}
        <div className={styles.codeOverlay}>
          <div className={styles.codeWindow}>
            <div className={styles.codeHeader}>
              <span className={styles.codeDot} style={{ background: '#ff5f56' }} />
              <span className={styles.codeDot} style={{ background: '#ffbd2e' }} />
              <span className={styles.codeDot} style={{ background: '#27c93f' }} />
              <span className={styles.codeTitle}>llvm-build · zsh</span>
            </div>
            <div className={styles.codeContent}>
              <span className={styles.codePrompt}>$</span>
              <span className={styles.codeCommand}>clang -O2 -emit-llvm hello.c -o hello.bc</span>
            </div>
            <div className={styles.codeOutput}>
              <span className={styles.codePrompt}>IR → ASM</span>
              <span className={styles.codeCommand}>BACKEND LOWERING</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.shell}>
        <div className={styles.content}>
          <div className={styles.badgeGroup}>
            <span className={styles.badge}>AI Compilers</span>
            <span className={styles.badge}>LLVM</span>
            <span className={styles.badge}>MLIR STABLE</span>
          </div>
          
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}>⚡</span>
            Master LLVM, Compilers & MLIR
          </p>
          
          <h1 className={styles.title}>
            Source to Silicon
            <span className={styles.titleBreak}>
              Full Stack Compiler Engineering
              <span className={styles.titleCursor}>_</span>
            </span>
          </h1>
          
          <p className={styles.subtitle}>
            Structured paths through compiler internals, execution models, GPU systems & performance engineering – 
            the full stack from source code to hardware.
          </p>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <FaMicrochip className={styles.statIcon} />
              <span className={styles.statLabel}>LLVM</span>
            </div>
            <div className={styles.stat}>
              <FaCode className={styles.statIcon} />
              <span className={styles.statLabel}>MLIR Stable</span>
            </div>
            <div className={styles.stat}>
              <FaChartLine className={styles.statIcon} />
              <span className={styles.statLabel}>Performance Focus</span>
            </div>
          </div>
          
          <div className={styles.actions}>
            <Link className={styles.primaryAction} to="/docs/start-here">
              <FaRocket aria-hidden="true" />
              Start Learning
              <FaArrowRight className={styles.actionIcon} />
            </Link>
            <Link
              className={styles.secondaryAction}
              to={newsletterUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaEnvelope aria-hidden="true" />
              Weekly Compiler Notes
            </Link>
          </div>
          
          <div className={styles.terminalHint}>
            <span className={styles.terminalPrompt}>$</span>
            <span className={styles.terminalText}>compilersutra --path llvm --depth expert</span>
            <span className={styles.terminalBlink}>█</span>
          </div>
        </div>
      </div>
      
      <div className={styles.scrollIndicator}>
        <span className={styles.scrollText}>Scroll to explore</span>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
      </div>
    </header>
  );
}