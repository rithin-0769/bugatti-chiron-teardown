import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import "./CTASection.css";

/* Animated counting number */
function CountUp({ to, suffix = "", delay = 0 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0.1, 0.5], [0, to]);
  const smooth = useSpring(raw, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    return smooth.on("change", (v) => {
      setDisplay(Number.isInteger(to) ? Math.floor(v) : parseFloat(v.toFixed(1)));
    });
  }, [smooth, to]);

  return <span ref={ref}>{to === "∞" ? "∞" : `${display}${suffix}`}</span>;
}

export default function CTASection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Parallax layers */
  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.7]);

  const stats = [
    { label: "1-of-1 existence",       to: "∞", suffix: "" },
    { label: "Engine assembly weeks",  to: 7,   suffix: "" },
    { label: "Years of Bugatti legacy",to: 42,  suffix: "" },
  ];

  return (
    <section className="cta" id="cta" ref={sectionRef}>
      {/* Parallax background */}
      <motion.div className="cta-bg" style={{ y: bgY }} aria-hidden="true" />

      <motion.div className="cta-inner" style={{ y: contentY, opacity }}>
        {/* Eyebrow */}
        <motion.span
          className="cta-eyebrow"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          One of One
        </motion.span>

        {/* Word-by-word headline */}
        <h2 className="cta-headline" aria-label="Experience the Machine">
          {["Experience", "the", "Machine"].map((word, i) => (
            <span key={i} className="cta-word-wrap">
              <motion.span
                className="cta-word"
                initial={{ y: "110%", opacity: 0 }}
                whileInView={{ y: "0%", opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.85,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* Sub */}
        <motion.p
          className="cta-sub"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.65 }}
        >
          The Chiron Profilee is the rarest Bugatti ever built.
          <br />
          Scroll through its full 3D engineering teardown below.
        </motion.p>

        {/* Actions */}
        <motion.div
          className="cta-actions"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.a
            href="#teardown"
            className="cta-btn cta-btn--primary"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            View 3D Teardown
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </motion.a>
          <motion.a
            href="#specs"
            className="cta-btn cta-btn--ghost"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            View Full Specs
          </motion.a>
        </motion.div>

        {/* Scroll-counted stats */}
        <motion.div
          className="cta-stats"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.65, duration: 0.65 }}
        >
          {stats.map((s, i) => (
            <div key={i} className="cta-stat">
              <span className="cta-stat__value">
                <CountUp to={s.to} suffix={s.suffix} delay={i * 0.1} />
              </span>
              <span className="cta-stat__label">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
