"use client";

import { useEffect, useState } from "react";

// Shared by every image index/slideshow on the site (CinematicSlideshow,
// DishShowcase, DishIndex): advances `active` on a fixed interval unless
// paused, reduced motion is on, the tab is hidden, or there's nothing to
// advance through. Callers that let this drive visible motion for more than
// a few seconds unattended must expose a visible way to pause it (WCAG 2.2
// SC 2.2.2) — CinematicSlideshow's Play/Pause button is the reference.
export function useSlideAdvance(length: number, { intervalMs = 5200, autoplay = true }: { intervalMs?: number; autoplay?: boolean } = {}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(!autoplay);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, length, intervalMs]);

  return { active, setActive, paused, setPaused, reducedMotion };
}
