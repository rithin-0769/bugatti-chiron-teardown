import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";

const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Sync Lenis with Framer Motion's scroll by dispatching native scroll events
    lenis.on("scroll", ({ scroll }) => {
      // Keep native scroll position in sync (needed for Framer Motion useScroll)
      window.dispatchEvent(new Event("scroll"));
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Anchor link smooth scroll
    const handleAnchor = (e) => {
      const href = e.currentTarget.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) lenis.scrollTo(target, { offset: -60, duration: 1.6 });
      }
    };
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", handleAnchor)
    );

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.querySelectorAll('a[href^="#"]').forEach((a) =>
        a.removeEventListener("click", handleAnchor)
      );
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef}>
      {children}
    </LenisContext.Provider>
  );
}
