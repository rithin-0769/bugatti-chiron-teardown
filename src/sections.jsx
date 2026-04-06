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
   Returns { imgsRef (stable ref), rdy (boolean) }
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
   Fixed:
   • Accepts + applies style prop (was silently dropped)
   • ResizeObserver uses requestAnimationFrame to defer
     canvas size change → breaks the observer loop
   • frameRef keeps current frame without triggering
     stale closure issues
───────────────────────────────────────────────────── */
function FrameCanvas({ imgsRef, frame, style }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(frame);

  // Track latest frame in a ref so the rAF callback always reads fresh
  useEffect(() => { frameRef.current = frame; }, [frame]);

  // Size + redraw on resize — deferred with rAF to avoid RO loop
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const syncAndDraw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (!w || !h) return;
      // Only update if actually changed to avoid extra clears
      if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
        el.width  = Math.round(w * dpr);
        el.height = Math.round(h * dpr);
      }
      drawImg(el, imgsRef.current[frameRef.current]);
    };

    let rafId;
    const ro = new ResizeObserver(() => {
      // Defer the canvas mutation outside the RO callback → no loop
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(syncAndDraw);
    });
    ro.observe(el);
    // Initial draw
    rafId = requestAnimationFrame(syncAndDraw);
    return () => { ro.disconnect(); cancelAnimationFrame(rafId); };
  }, []); // runs once — imgsRef/frameRef are stable refs

  // Redraw whenever frame changes
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
   24-FPS LOOP HOOK
   Returns current frame index, advances at exactly 24fps
───────────────────────────────────────────────────── */
function use24fps(count, active) {
  const [frame, setFrame] = useState(0);
  const rafRef  = useRef(null);
  const lastRef = useRef(null);
  const idxRef  = useRef(0);

  useEffect(() => {
    if (!active || count === 0) return;
    const INTERVAL = 1000 / 24;
    lastRef.current = null;

    const loop = (t) => {
      if (!lastRef.current) lastRef.current = t;
      const delta = t - lastRef.current;
      if (delta >= INTERVAL) {
        idxRef.current = (idxRef.current + 1) % count;
        setFrame(idxRef.current);
        lastRef.current = t - (delta % INTERVAL);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, count]);

  return frame;
}

/* ─────────────────────────────────────────────────────
   SCROLL SCRUB HOOK
   Returns current frame based on scroll progress through ref
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
   HERO SECTION — 160 frames, scroll-scrubbed
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
   FEATURES SECTION — 3 static frames, scroll reveal
═══════════════════════════════════════════════════ */
const FEATURES = [
  {
    frameNum: 20,
    label: "Aesthetics",
    text: "A masterclass in proportions. The signature Bugatti line sweeps seamlessly, tracing the perfect balance between elegance and aggression.",
  },
  {
    frameNum: 60,
    label: "Aerodynamics",
    text: "A silhouette born of purpose. Every curve channeling air, generating immense downforce while minimizing drag at unprecedented speeds.",
  },
  {
    frameNum: 100,
    label: "Structure",
    text: "An unimaginably rigid carbon fiber monocoque forms the core. It ensures safety and absolute handling purity under extreme rotational forces.",
  },
  {
    frameNum: 130,
    label: "Performance",
    text: "1,479 horsepower. 420 km/h. Numbers that exist beyond the boundaries of rational thought, delivered with relentless surge.",
  },
  {
    frameNum: 145,
    label: "Digital Teardown",
    text: "Scroll through an interactive 3D chassis breakdown and inspect every major system in motion.",
  },
  {
    frameNum: 160,
    label: "Engineering",
    text: "A W16 engine assembled by one pair of hands over seven weeks. Absolute precision from the center-lock wheels to the titanium exhausts.",
  },
  {
    frameNum: 160,
    label: "Performance Data",
    text: "Key metrics, aerodynamics, and architecture brought together to help you understand the car from both art and engineering perspectives.",
  },
];

function FeatureBlock({ feat, index }) {
  const { imgsRef, rdy } = useFrames(feat.frameNum, feat.frameNum);
  const blockRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delay = `${index * 0.16}s`;

  return (
    <div
      ref={blockRef}
      style={{
        ...S.featBlock,
        opacity:   vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.9s ${delay} ease, transform 0.9s ${delay} cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      {/* Image — 16:9 wrapper with canvas inside */}
      <div style={S.featImgWrap}>
        {rdy ? (
          <FrameCanvas
            imgsRef={imgsRef}
            frame={0}
            style={S.fillAbs}
          />
        ) : (
          <div style={{ ...S.fillAbs, background: "#ebebea" }} />
        )}
      </div>

      <p style={S.featLabel}>{feat.label}</p>
      <p style={S.featText}>{feat.text}</p>
    </div>
  );
}

export function FeaturesSection() {
  const secRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.08 }
    );
    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="features" ref={secRef} style={S.features}>
      <p style={{
        ...S.featHeading,
        opacity:   vis ? 1 : 0,
        transform: vis ? "none" : "translateY(16px)",
        transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}>
        The anatomy of perfection
      </p>

      <div style={S.featGrid}>
        {FEATURES.map((f, i) => (
          <FeatureBlock key={f.label} feat={f} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SPECS SECTION — key performance metrics
═══════════════════════════════════════════════════ */
const SPECS = [
  { label: "Top Speed", value: "420 km/h" },
  { label: "Acceleration", value: "0–100 km/h in 2.4s" },
  { label: "Horsepower", value: "1,479 HP" },
  { label: "Torque", value: "1,180 lb-ft" },
  { label: "Engine", value: "8.0L W16" },
  { label: "Transmission", value: "7-speed DSG" },
  { label: "Weight", value: "1,995 kg" },
  { label: "Drag Coefficient", value: "0.36 Cd" },
];

export function SpecsSection() {
  const secRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.15 }
    );
    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="specs" ref={secRef} style={S.specs}>
      <p style={{
        ...S.specsHeading,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(16px)",
        transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}>
        By The Numbers
      </p>
      <div style={S.specsGrid}>
        {SPECS.map((spec, i) => (
          <div key={i} className="spec-card" style={{
            ...S.specCard,
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.6s ${i * 0.05}s ease, transform 0.6s ${i * 0.05}s cubic-bezier(0.22,1,0.36,1)`,
          }}>
            <div style={{
              width: "100%",
              height: "3px",
              background: "#00d9ff",
              borderRadius: "2px",
              marginBottom: "12px",
            }} />
            <p style={S.specLabel}>{spec.label}</p>
            <p style={S.specValue}>{spec.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   TECH SECTION — engineering highlights
═══════════════════════════════════════════════════ */
const TECH_HIGHLIGHTS = [
  {
    title: "Carbon Fiber Monocoque",
    desc: "50,000 Nm/° torsional stiffness. Lighter. Stronger. Stiffer than an LMP1 race car.",
  },
  {
    title: "Quad Turbochargers",
    desc: "Four massive turbos working in concert to deliver peak boost at every RPM. No lag. Pure response.",
  },
  {
    title: "Active Aerodynamics",
    desc: "Adaptive wing and splitter systems that adjust in real-time based on speed and driving conditions.",
  },
  {
    title: "Michelin Pilot Sport Tires",
    desc: "Custom 20-inch wheels. Grip beyond measure. Handcrafted to specifications for the Chiron alone.",
  },
  {
    title: "7-Speed DSG",
    desc: "Lightning-fast shifts. Seamless power delivery from idle to redline. Predictable. Relentless.",
  },
  {
    title: "Ceramic Brakes",
    desc: "Eight-piston calipers front and rear. Can decelerate from 400 km/h to 0 in under 10 seconds.",
  },
];

export function TechSection() {
  const secRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.1 }
    );
    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="tech" ref={secRef} style={S.tech}>
      <p style={{
        ...S.techHeading,
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(16px)",
        transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}>
        Engineering Excellence
      </p>
      <div style={S.techGrid}>
        {TECH_HIGHLIGHTS.map((tech, i) => (
          <div key={i} style={{
            ...S.techCard,
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(24px)",
            transition: `opacity 0.6s ${i * 0.06}s ease, transform 0.6s ${i * 0.06}s cubic-bezier(0.22,1,0.36,1)`,
          }}>
            <h3 style={S.techTitle}>{tech.title}</h3>
            <p style={S.techDesc}>{tech.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CTA / INFO SECTION — more content about the car
═══════════════════════════════════════════════════ */
export function CTASection() {
  const secRef = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.25 }
    );
    if (secRef.current) io.observe(secRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="final" ref={secRef} style={S.ctaInfo}>
      <div style={{
        ...S.ctaInfoBlock,
        opacity:   vis ? 1 : 0,
        transform: vis ? "none" : "translateY(24px)",
        transition: "opacity 1.1s 0.1s ease, transform 1.1s 0.1s cubic-bezier(0.22,1,0.36,1)",
      }}>
        <h2 style={S.ctaInfoTitle}>The pinnacle of modern performance</h2>
        <div style={S.ctaInfoGrid}>
          <p style={S.ctaInfoText}>
            Every element of the Chiron serves the pursuit of absolute speed and stability. 
            From the titanium exhausts that handle temperatures exceeding 1000°C to the bespoke 
            active aero system, there is no margin for error or compromise.
          </p>
          <p style={S.ctaInfoText}>
            The carbon fiber monocoque is as stiff as an LMP1 racing car, while the interior 
            remains an oasis of pure analog luxury, utilizing only the finest leathers and machined aluminum.
          </p>
        </div>
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
      @media (max-width: 768px) {
        .bugatti-hero-text { padding: 24px 28px !important; }
      }
      
      /* Vibrant poppy spec card effects */
      .spec-card {
        position: relative;
      }
      
      .spec-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
        border-radius: 16px;
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
        z-index: -1;
      }
      
      .spec-card:hover {
        transform: translateY(-8px) scale(1.05);
        border-width: 2px;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
      }
      
      .spec-card:hover::after {
        opacity: 1;
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────────
   STYLE TOKENS (all inline — no CSS files needed)
───────────────────────────────────────────────────── */
const S = {
  /* Utility */
  fillAbs: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },

  /* Hero */
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
  /* Features */
  features: {
    background: "#ffffff",
    padding: "130px 48px 150px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "80px",
  },
  featHeading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 300,
    fontSize: "clamp(1.4rem, 3vw, 2.1rem)",
    color: "#bbb",
    letterSpacing: "0.04em",
    textAlign: "center",
  },
  featGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "56px 48px",
    maxWidth: "1040px",
    width: "100%",
  },
  featBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  featImgWrap: {
    position: "relative",
    width: "100%",
    paddingBottom: "56.25%", /* 16:9 */
    overflow: "hidden",
    background: "#ebebea",
  },
  featLabel: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: "0.62rem",
    letterSpacing: "0.32em",
    color: "#bbb",
    textTransform: "uppercase",
  },
  featText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: "1.08rem",
    lineHeight: 1.7,
    color: "#444",
    letterSpacing: "0.01em",
  },

  /* Info Section (Replacing old CTA) */
  ctaInfo: {
    background: "#f4f4f2",
    padding: "160px 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaInfoBlock: {
    maxWidth: "880px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "48px",
    textAlign: "center",
  },
  ctaInfoTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 300,
    fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
    letterSpacing: "0.02em",
    color: "#0f0f0f",
    lineHeight: 1.1,
  },
  ctaInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "40px",
    textAlign: "left",
  },
  ctaInfoText: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 300,
    fontSize: "0.95rem",
    lineHeight: 1.8,
    color: "#555",
    letterSpacing: "0.01em",
  },

  /* Specs Section */
  specs: {
    background: "#0a0a0a",
    padding: "120px 48px 140px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "80px",
  },
  specsHeading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 300,
    fontSize: "clamp(2rem, 5vw, 3rem)",
    color: "#f0f0f0",
    letterSpacing: "0.06em",
    textAlign: "center",
  },
  specsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    width: "100%",
  },
  specCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    padding: "32px 24px",
    background: "#111",
    borderRadius: "16px",
    border: "2px solid #00d9ff",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    position: "relative",
    overflow: "hidden",
  },
  specLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#00d9ff",
    margin: 0,
    fontWeight: 600,
  },
  specValue: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    textAlign: "center",
  },

  /* Tech Section */
  tech: {
    background: "#ffffff",
    padding: "100px 48px 120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "60px",
  },
  techHeading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
    fontWeight: 300,
    fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
    color: "#999",
    letterSpacing: "0.04em",
    textAlign: "center",
  },
  techGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "40px",
    maxWidth: "1080px",
    width: "100%",
  },
  techCard: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "32px",
    background: "#f8f6f3",
    borderRadius: "4px",
    border: "1px solid #ebe7e0",
  },
  techTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#111",
    margin: 0,
  },
  techDesc: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem",
    lineHeight: 1.7,
    color: "#555",
    margin: 0,
  },

  /* Footer */
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
