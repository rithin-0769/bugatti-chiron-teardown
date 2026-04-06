import React from "react";
import { motion } from "framer-motion";
import "./Navbar.css";

export default function Navbar() {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="#hero" className="navbar__brand">
        <div className="navbar__logo">
          <span className="navbar__logo-eb">EB</span>
        </div>
        <span className="navbar__name">BUGATTI</span>
      </a>

      <nav className="navbar__links">
        <a href="#features" className="navbar__link">Engineering</a>
        <a href="#teardown" className="navbar__link">Teardown</a>
        <a href="#specs" className="navbar__link">Specs</a>
      </nav>

      <button className="navbar__cta">Configure</button>
    </motion.nav>
  );
}
