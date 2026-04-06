import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-eb">EB</span>
          </div>
          <div>
            <p className="footer__brand-name">Bugatti Automobiles S.A.S.</p>
            <p className="footer__brand-location">
              Château Saint Jean · Molsheim · Alsace · France
            </p>
          </div>
        </div>

        {/* Links */}
        <nav className="footer__nav">
          <div className="footer__nav-group">
            <p className="footer__nav-heading">Explore</p>
            <a href="#hero" className="footer__nav-link">Overview</a>
            <a href="#features" className="footer__nav-link">Engineering</a>
            <a href="#teardown" className="footer__nav-link">3D Teardown</a>
            <a href="#specs" className="footer__nav-link">Specifications</a>
          </div>
          <div className="footer__nav-group">
            <p className="footer__nav-heading">Vehicle</p>
            <a href="#" className="footer__nav-link">Chiron Profilee</a>
            <a href="#" className="footer__nav-link">W16 Engine</a>
            <a href="#" className="footer__nav-link">Active Aero</a>
            <a href="#" className="footer__nav-link">Configure</a>
          </div>
        </nav>
      </div>

      {/* Divider */}
      <div className="footer__rule" />

      {/* Bottom bar */}
      <div className="footer__bottom">
        <p className="footer__disclaimer">
          Fan-made engineering showcase. All specs sourced from publicly available information.
          Bugatti® is a registered trademark of Bugatti International S.A.
        </p>
        <p className="footer__built">
          Built with React · React Three Fiber · Framer Motion
        </p>
      </div>
    </footer>
  );
}
