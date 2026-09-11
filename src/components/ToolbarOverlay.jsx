import React from "react";
import "./ToolbarOverlay.css";

const COLORS = [
  { name: "French Racing Blue", hex: "#0055ff" },
  { name: "Matte Black", hex: "#111111" },
  { name: "Liquid Silver", hex: "#e0e4e8" },
  { name: "Carbon Red", hex: "#880000" },
];

export default function ToolbarOverlay({ 
  carColor, setCarColor, 
  isXRayMode, setIsXRayMode, 
  isTourMode, setIsTourMode 
}) {
  return (
    <div className="toolbar-overlay">
      <div className="toolbar-section">
        <h4>Paint Configurator</h4>
        <div className="color-picker">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              className={`color-swatch ${carColor === c.hex ? "active" : ""}`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
              onClick={() => setCarColor(c.hex)}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h4>Visual Modes</h4>
        <button 
          className={`toggle-btn ${isXRayMode ? "active" : ""}`}
          onClick={() => setIsXRayMode(!isXRayMode)}
        >
          {isXRayMode ? "X-Ray: ON" : "X-Ray: OFF"}
        </button>
      </div>

      <div className="toolbar-section">
        <h4>Experience</h4>
        <button 
          className={`toggle-btn ${isTourMode ? "active" : ""}`}
          onClick={() => setIsTourMode(!isTourMode)}
        >
          {isTourMode ? "Stop Tour" : "Start Guided Tour"}
        </button>
      </div>
    </div>
  );
}
