import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * Returns { ref, isInView } — use ref on the element you want to watch.
 * Triggers once when the element enters the viewport.
 */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: options.margin ?? "-80px",
    amount: options.amount ?? 0.15,
  });
  return { ref, isInView };
}
