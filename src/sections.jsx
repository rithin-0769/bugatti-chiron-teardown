import React, { useEffect, useRef, useState } from "react";

const PAD = (n) => String(n).padStart(3, "0");
const SRC = (n) => `/hero_frames/ezgif-frame-${PAD(n)}.png`;

/* ─────────────────────────────────────────────────────
   DRAW  — works entirely in canvas buffer pixels
───────────────────────────────────────────────────── */
function drawImg(canvas, img) {
  if (!img || !img.complete || !img.naturalWidth) return;
  const cw = canvas.width;
  const ch = canvas.height;
  if (!cw || !ch) return;
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const sw = img.naturalWidth  * scale;
  const sh = img.naturalHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
}

/* ─────────────────────────────────────────────────────
   PRELOAD HOOK
───────────────────────────────────────────────────── */
function useFrames(from, to) {
  const imgsRef = useRef([]);
  const [rdy, setRdy] = useState(false);

  useEffect(() => {
    const arr = [];
    let done = 0;
    const count = to - from + 1;
    setRdy(false);
    for (let i = from; i <= to; i++) {
      const img = new Image();
      img.src = SRC(i);
      img.onload = img.onerror = () => {
        done++;
        if (done === count) setRdy(true);
      };
      arr.push(img);
    }
    imgsRef.current = arr;
    return () => { imgsRef.current = []; };
  }, [from, to]);

  return { imgsRef, rdy };
}

/* ─────────────────────────────────────────────────────
   FRAME CANVAS
───────────────────────────────────────────────────── */
function FrameCanvas({ imgsRef, frame, style }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(frame);

  useEffect(() => { frameRef.current = frame; }, [frame]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const syncAndDraw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
        el.width  = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
      }
      drawImg(el, imgsRef.current[frameRef.current]);
    };

    let rafId;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(syncAndDraw);
    });
    ro.observe(el);
    rafId = requestAnimationFrame(syncAndDraw);
    return () => { ro.disconnect(); cancelAnimationFrame(rafId); };
  }, []); 

  useEffect(() => {
    const el = canvasRef.current;
    if (el) drawImg(el, imgsRef.current[frame]);
  }, [frame, imgsRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", ...style }}
    />
  );
}

/* ─────────────────────────────────────────────────────
   SCROLL SCRUB HOOK
───────────────────────────────────────────────────── */
function useScrollScrub(count, secRef) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!secRef.current) return;
    const update = () => {
      const el = secRef.current;
      const rect = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      setFrame(Math.min(Math.round(progress * (count - 1)), count - 1));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [count, secRef]);

  return frame;
}

/* ═══════════════════════════════════════════════════
   HERO SECTION — Original 160 frames, scroll-scrubbed
═══════════════════════════════════════════════════ */
export function HeroSection() {
  const { imgsRef, rdy } = useFrames(1, 160);
  const secRef = useRef(null);
  const frame = useScrollScrub(160, secRef);

  return (
    <section id="hero" ref={secRef} style={S.heroScroll}>
      <div style={S.heroSticky}>
        {rdy ? (
          <FrameCanvas
            imgsRef={imgsRef}
            frame={frame}
            style={S.fillAbs}
          />
        ) : (
          <div style={{ ...S.fillAbs, background: "#f0f0ee" }} />
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════ */
export function FooterSection() {
  return (
    <footer style={S.footer}>
      <div style={S.footerInner}>
        <p style={S.footerCredit}>Made by Rithin Ravoori</p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   RESPONSIVE <style> tag
═══════════════════════════════════════════════════ */
export function GlobalResponsive() {
  return (
    <style>{`
      body {
        margin: 0;
        padding: 0;
        background: #f4f4f2;
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────────
   STYLE TOKENS 
───────────────────────────────────────────────────── */
const S = {
  fillAbs: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  heroScroll: {
    position: "relative",
    width: "100%",
    height: "400vh", /* tall container for scroll progress */
  },
  heroSticky: {
    position: "sticky",
    top: 0,
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    background: "#f4f4f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    background: "#ffffff",
    padding: "40px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTop: "1px solid #f0f0ee",
  },
  footerInner: {
    maxWidth: "1040px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footerCredit: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.76rem",
    color: "#888",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: 0,
  },
};
