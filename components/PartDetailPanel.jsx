import React from "react";
import { motion } from "framer-motion";
import "./PartDetailPanel.css";

export default function PartDetailPanel({ part, onClose }) {
  return (
    <motion.div
      className="detail-panel"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "110%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 35 }}
      role="dialog"
      aria-label={`Details for ${part.name}`}
    >
      {/* Header */}
      <div className="detail-panel__header">
        <div className="detail-panel__title-group">
          <span
            className="detail-panel__dot"
            style={{ background: part.color, boxShadow: `0 0 12px ${part.color}` }}
          />
          <div>
            <p className="detail-panel__category">Component Detail</p>
            <h3 className="detail-panel__title">{part.name}</h3>
          </div>
        </div>
        <button className="detail-panel__close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Stat callout */}
      <div className="detail-panel__stat-hero" style={{ "--col": part.color }}>
        <span className="detail-panel__stat-value">{part.stat}</span>
        <span className="detail-panel__stat-label">{part.statLabel}</span>
      </div>

      {/* Description */}
      <p className="detail-panel__description">{part.description}</p>

      {/* Material */}
      <div className="detail-panel__material">
        <span className="detail-panel__material-label">Material</span>
        <span className="detail-panel__material-value">{part.material}</span>
      </div>

      {/* Footer brand line */}
      <div className="detail-panel__brand">
        <span className="section-label" style={{ fontSize: "0.6rem" }}>Bugatti Automobiles S.A.S.</span>
      </div>
    </motion.div>
  );
}
