import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { parts } from "../data/parts";
import PartDetailPanel from "./PartDetailPanel";
import "./ExplosionScene.css";

gsap.registerPlugin(ScrollTrigger);

// Bugatti Chiron SVG silhouette paths
const CarSVG = () => (
  <svg
    viewBox="0 0 800 340"
    className="car-base-svg"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="400" cy="320" rx="320" ry="12" fill="rgba(0,0,0,0.4)" />

    {/* Main body */}
    <path
      d="M120 220 C120 200 130 175 160 165 L220 148 C250 138 280 128 330 122 L420 118 C460 116 500 116 540 120 L590 128 C620 134 640 145 660 158 L700 175 C720 185 725 200 720 215 L720 240 C720 250 715 255 705 255 L120 255 C110 255 105 250 105 240 Z"
      fill="#0d1520"
      stroke="rgba(0,180,230,0.15)"
      strokeWidth="1"
    />

    {/* Windshield */}
    <path
      d="M300 148 C310 128 325 118 345 115 L430 113 C450 113 465 120 475 135 L490 155 L290 158 Z"
      fill="rgba(0,180,230,0.08)"
      stroke="rgba(0,180,230,0.2)"
      strokeWidth="1"
    />

    {/* Rear window */}
    <path
      d="M490 155 L510 142 C525 132 548 128 565 128 L595 130 C610 132 622 140 630 152 L640 165 L490 165 Z"
      fill="rgba(0,180,230,0.06)"
      stroke="rgba(0,180,230,0.15)"
      strokeWidth="1"
    />

    {/* Side stripe */}
    <path
      d="M135 215 L705 215"
      stroke="rgba(0,180,230,0.12)"
      strokeWidth="1"
    />

    {/* Front lights */}
    <path
      d="M118 198 C118 190 122 185 129 185 L152 185 C158 185 162 189 162 195 L162 210 C162 215 158 218 152 218 L129 218 C123 218 118 214 118 208 Z"
      fill="rgba(0,180,230,0.15)"
      stroke="rgba(0,180,230,0.4)"
      strokeWidth="1.5"
    />
    <line x1="125" y1="195" x2="155" y2="195" stroke="rgba(0,180,230,0.6)" strokeWidth="1" />
    <line x1="125" y1="200" x2="155" y2="200" stroke="rgba(0,180,230,0.4)" strokeWidth="1" />
    <line x1="125" y1="205" x2="155" y2="205" stroke="rgba(0,180,230,0.6)" strokeWidth="1" />

    {/* Rear lights */}
    <path
      d="M698 198 L698 215 C698 218 703 222 708 220 L720 215 L720 198 C720 194 716 190 712 190 L703 190 C700 190 698 194 698 198 Z"
      fill="rgba(180,20,20,0.3)"
      stroke="rgba(255,50,50,0.5)"
      strokeWidth="1.5"
    />
    <line x1="703" y1="198" x2="717" y2="198" stroke="rgba(255,80,80,0.6)" strokeWidth="1" />
    <line x1="703" y1="204" x2="717" y2="204" stroke="rgba(255,80,80,0.4)" strokeWidth="1" />
    <line x1="703" y1="210" x2="717" y2="210" stroke="rgba(255,80,80,0.6)" strokeWidth="1" />

    {/* Front wheel arch */}
    <path
      d="M165 255 C165 255 148 248 140 235 C134 225 134 215 140 205 C148 195 160 192 172 195 C172 195 178 210 178 230 C178 248 172 258 165 255 Z"
      fill="#0a0f18"
      stroke="rgba(0,180,230,0.15)"
      strokeWidth="1"
    />

    {/* Rear wheel arch */}
    <path
      d="M600 255 C600 255 614 248 622 235 C628 225 628 215 622 205 C614 195 602 192 590 195 C590 195 584 210 584 230 C584 248 590 258 600 255 Z"
      fill="#0a0f18"
      stroke="rgba(0,180,230,0.15)"
      strokeWidth="1"
    />

    {/* Underbody */}
    <rect x="160" y="252" width="440" height="5" rx="2" fill="rgba(0,180,230,0.06)" />

    {/* Front splitter lines */}
    <path
      d="M120 240 C118 248 118 256 122 260 L165 262"
      stroke="rgba(0,180,230,0.2)"
      strokeWidth="1"
    />
    <path
      d="M600 262 L680 260 C684 258 686 250 685 242"
      stroke="rgba(0,180,230,0.15)"
      strokeWidth="1"
    />
  </svg>
);

// Front wheel SVG
const WheelSVG = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className="wheel-svg">
    <circle cx="50" cy="50" r="46" fill="#0d1520" stroke="rgba(180,188,200,0.4)" strokeWidth="2" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(180,188,200,0.2)" strokeWidth="1" />
    <circle cx="50" cy="50" r="10" fill="#1a1f2e" stroke="rgba(0,180,230,0.5)" strokeWidth="2" />
    {[0,60,120,180,240,300].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 + 10 * Math.cos(rad);
      const y1 = 50 + 10 * Math.sin(rad);
      const x2 = 50 + 35 * Math.cos(rad);
      const y2 = 50 + 35 * Math.sin(rad);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(180,188,200,0.35)" strokeWidth="5" strokeLinecap="round" />;
    })}
    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(100,100,120,0.5)" strokeWidth="8" />
    <circle cx="50" cy="50" r="5" fill="rgba(0,180,230,0.8)" />
  </svg>
);

export default function ExplosionScene() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [exploded, setExploded] = useState(false);
  const sectionRef = useRef(null);
  const partRefs = useRef({});

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Explode animation on scroll
      parts.forEach((part) => {
        const el = partRefs.current[part.id];
        if (!el) return;
        gsap.fromTo(
          el,
          { x: 0, y: 0, opacity: 1 },
          {
            x: part.explodeX * 5,
            y: part.explodeY * 5,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 60%",
              end: "center 30%",
              scrub: 1.2,
              onUpdate: (self) => {
                setExploded(self.progress > 0.5);
              },
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handlePartClick = (part) => {
    setSelectedPart((prev) => (prev?.id === part.id ? null : part));
  };

  return (
    <section id="explosion-section" className="explosion-section" ref={sectionRef}>
      {/* Section header */}
      <div className="explosion-header">
        <motion.span
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Engineering Teardown
        </motion.span>
        <motion.h2
          className="explosion-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Every Part. Every Detail.
        </motion.h2>
        <motion.p
          className="explosion-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Scroll to disassemble the Chiron Profilee. Click any component to explore its engineering.
        </motion.p>
      </div>

      {/* The exploded scene */}
      <div className="explosion-stage">
        {/* Car base */}
        <div className="car-base">
          <CarSVG />

          {/* Wheels (not exploded, but they animate separately) */}
          <div className="wheel wheel--front">
            <WheelSVG size={90} />
          </div>
          <div className="wheel wheel--rear">
            <WheelSVG size={90} />
          </div>
        </div>

        {/* Explodable parts */}
        {parts.map((part) => (
          <div
            key={part.id}
            ref={(el) => (partRefs.current[part.id] = el)}
            className={`part-marker part-marker--${part.size || "medium"}`}
            style={{
              left: `${part.x}%`,
              top: `${part.y}%`,
            }}
            onClick={() => handlePartClick(part)}
            role="button"
            tabIndex={0}
            aria-label={`View ${part.name}`}
            onKeyDown={(e) => e.key === "Enter" && handlePartClick(part)}
          >
            {/* Dot */}
            <div
              className={`part-dot ${selectedPart?.id === part.id ? "part-dot--active" : ""}`}
              style={{ "--part-color": part.color }}
            />

            {/* Label (shows when exploded) */}
            <AnimatePresence>
              {exploded && (
                <motion.div
                  className="part-label"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="part-label__name">{part.shortLabel}</span>
                  <span className="part-label__stat" style={{ color: part.color }}>
                    {part.stat}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Instruction */}
      <motion.p
        className="explosion-hint"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <span className="explosion-hint__icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
        </span>
        Scroll to explode · Click parts to inspect
      </motion.p>

      {/* Parts grid — always visible */}
      <div className="parts-grid">
        {parts.map((part, i) => (
          <motion.button
            key={part.id}
            className={`parts-grid__item ${selectedPart?.id === part.id ? "parts-grid__item--active" : ""}`}
            style={{ "--part-color": part.color }}
            onClick={() => handlePartClick(part)}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="parts-grid__dot" />
            <span className="parts-grid__name">{part.shortLabel}</span>
            <span className="parts-grid__stat">{part.stat}</span>
          </motion.button>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedPart && (
          <PartDetailPanel
            part={selectedPart}
            onClose={() => setSelectedPart(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
