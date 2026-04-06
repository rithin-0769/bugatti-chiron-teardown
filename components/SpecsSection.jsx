import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { chironSpecs } from "../data/parts";
import "./SpecsSection.css";

function AnimatedNumber({ target, duration = 2000 }) {
  const [current, setCurrent] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    const isFloat = String(target).includes(".");
    const end = parseFloat(target);
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = end * eased;
      setCurrent(isFloat ? parseFloat(val.toFixed(1)) : Math.floor(val));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [inView, target, duration]);

  return <span ref={ref}>{current}</span>;
}

export default function SpecsSection() {
  return (
    <section className="specs-section" id="specs">
      <div className="specs-divider">
        <span className="specs-divider__line" />
        <span className="specs-divider__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              stroke="var(--bugatti-blue)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </span>
        <span className="specs-divider__line" />
      </div>

      <div className="specs-container">
        <div className="specs-header">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            Technical Specifications
          </motion.span>
          <motion.h2
            className="specs-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Numbers That Defy Physics
          </motion.h2>
          <motion.p
            className="specs-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            The Chiron Profilee is not merely an automobile — it is a statement
            of absolute engineering supremacy.
          </motion.p>
        </div>

        <div className="specs-grid">
          {chironSpecs.map((spec, i) => (
            <motion.div
              key={spec.label}
              className="spec-card"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="spec-card__glow" />
              <div className="spec-card__value">
                <AnimatedNumber
                  target={spec.value}
                  duration={1800 + i * 150}
                />
                <span className="spec-card__unit"> {spec.unit}</span>
              </div>
              <div className="spec-card__label">{spec.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.blockquote
          className="specs-quote"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p>
            "The Chiron Profilee is an automotive manifesto. It exists because
            beauty and speed are not opposites — they are the same force,
            expressed differently."
          </p>
          <cite>
            — Stephan Winkelmann, President, Bugatti Automobiles S.A.S.
          </cite>
        </motion.blockquote>
      </div>
    </section>
  );
}
