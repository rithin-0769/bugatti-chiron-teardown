import React, { useEffect } from "react";
import Lenis from "lenis";
import {
  HeroSection,
  FeaturesSection,
  CTASection,
  FooterSection,
  GlobalResponsive,
} from "./sections";
import Scene3DSection from "./components/Scene3D.jsx";

export default function App() {
  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.4,
      overscroll: false,
    });

    let raf;
    const tick = (t) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  return (
    <>
      <GlobalResponsive />
      <HeroSection />
      <FeaturesSection />
      <Scene3DSection />
      <CTASection />
      <FooterSection />
    </>
  );
}
