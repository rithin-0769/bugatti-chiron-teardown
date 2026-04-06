import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import "./Hero.css";

const TOTAL_FRAMES = 160;
const FRAME_PATH = (n) =>
  `/hero_frames/ezgif-frame-${String(n).padStart(3, "0")}.png`;

/* Pre-load all frames into Image objects so drawing is instant */
function usePreloadFrames() {
  const images = useRef([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let count = 0;
    images.current = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        count++;
        if (count === TOTAL_FRAMES) setLoaded(true);
      };
      img.onerror = () => { count++; if (count === TOTAL_FRAMES) setLoaded(true); };
      images.current[i - 1] = img;
    }
  }, []);

  return { images: images.current, loaded };
}

/* Canvas frame player — scroll drives the frame index */
function ScrollCanvas({ images, loaded }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(0);
  const rafRef    = useRef(null);

  // Draw a specific frame
  const drawFrame = useCallback((idx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = images[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    const ctx = canvas.getContext("2d");
    // Maintain aspect ratio and cover the canvas
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale, sh = ih * scale;
    const ox = (cw - sw) / 2, oy = (ch - sh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, ox, oy, sw, sh);
  }, [images]);

  // Handle resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawFrame(frameRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // Scroll → frame index mapping
  const handleScroll = useCallback(() => {
    const section = document.getElementById("hero");
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (section.offsetHeight - window.innerHeight)));
    const idx = Math.min(Math.round(progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);
    frameRef.current = idx;
  }, []);

  // Smooth rAF loop — draws current frame every animation frame
  useEffect(() => {
    if (!loaded) return;
    let lastIdx = -1;
    const loop = () => {
      if (frameRef.current !== lastIdx) {
        drawFrame(frameRef.current);
        lastIdx = frameRef.current;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // set initial frame
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loaded, drawFrame, handleScroll]);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas"
      aria-label="Bugatti Chiron exploded view animation"
    />
  );
}

/* Loading shimmer while frames pre-load */
function LoadingShimmer() {
  return (
    <div className="hero-canvas-loading">
      <div className="hero-canvas-shimmer" />
      <p className="hero-canvas-loading__text">Loading animation…</p>
    </div>
  );
}

/* Metric pill */
function MetricPill({ value, label, delay }) {
  return (
    <motion.div
      className="hero-pill"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="hero-pill__value">{value}</span>
      <span className="hero-pill__label">{label}</span>
    </motion.div>
  );
}

export default function Hero() {
  const { images, loaded } = usePreloadFrames();

  return (
    /* Tall sticky section — scroll drives the animation */
    <section className="hero" id="hero">
      {/* Sticky frame (stays visible while user scrolls through height) */}
      <div className="hero-sticky">
        {/* Subtle top-left overlay content */}
        <div className="hero-overlay">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Molsheim · Alsace · 2022
          </motion.div>

          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Bugatti<br />
            <span className="hero-headline--thin">Chiron</span>
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            Engineering Excellence
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.55 }}
          >
            <a href="#features" className="hero-btn hero-btn--primary">
              Explore Engineering
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#teardown" className="hero-btn hero-btn--ghost">
              3D Teardown
            </a>
          </motion.div>
        </div>

        {/* Metric pills — bottom left */}
        <motion.div
          className="hero-pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          <MetricPill value="1,479" label="Horsepower"    delay={1.1} />
          <MetricPill value="420"   label="km/h Top Speed" delay={1.2} />
          <MetricPill value="2.3s"  label="0–100 km/h"    delay={1.3} />
          <MetricPill value="W16"   label="Engine"         delay={1.4} />
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="hero-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <div className="hero-scroll-cue__track">
            <div className="hero-scroll-cue__dot" />
          </div>
          <span>Scroll to disassemble</span>
        </motion.div>

        {/* Canvas — full viewport background */}
        {loaded ? (
          <ScrollCanvas images={images} loaded={loaded} />
        ) : (
          <LoadingShimmer />
        )}
      </div>
    </section>
  );
}
