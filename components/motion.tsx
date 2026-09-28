"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// data-reveal values with their own declarative CSS (word rise, photo wipe,
// map draw, rule draw) just need the .is-revealed class; everything else
// (plain data-reveal lists/blocks) keeps the generic WAAPI translate-in.
const NAMED_REVEALS = new Set(["words", "photo", "map", "line"]);

// Content stays visible without JavaScript. Only offscreen sections receive a
// short, eased entrance, with no continuous scroll or pointer animation work.
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    // Never replay an entrance over already-readable above-the-fold content on
    // load; content that mounts later (`late`) is new to the visitor, so it
    // enters even when it lands inside the viewport.
    const scan = (late = false) => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        if (seen.has(element)) return;
        if (element.closest("[data-motion-pending]:not([data-motion-hydrated])")) return;
        if (late || element.getBoundingClientRect().top >= innerHeight) observer?.observe(element);
        else seen.add(element);
      });
    };
    const rescan = () => scan();
    const stop = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const sync = () => {
      stop();
      if (preference.matches) { observer = null; return; }
      observer = new IntersectionObserver(entries => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          observer?.unobserve(target);
          if (seen.has(target)) return;
          seen.add(target);
          const value = (target as HTMLElement).dataset.reveal;
          if (value && NAMED_REVEALS.has(value)) {
            target.classList.add("is-revealed");
            return;
          }
          const targets = target.hasAttribute("data-stagger-children") ? Array.from(target.children) : [target];
          // The chef site's `enter`: a 28px rise over 1.1s, 80ms between siblings.
          targets.forEach((element, index) => {
            const animation = element.animate(
              [{ translate: "0 28px", opacity: 0 }, { translate: "0 0", opacity: 1 }],
              { duration: 1100, delay: Math.min(index * 80, 400), easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
            );
            animations.add(animation);
            animation.onfinish = () => animations.delete(animation);
          });
        });
      });
      scan();
    };
    sync();
    // Content a client component mounts later on the same page (a filtered
    // menu list re-keying, for example) gets observed too, one frame later.
    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; scan(true); });
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("angel:motion-ready", rescan);
    preference.addEventListener("change", sync);
    return () => {
      stop();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      document.removeEventListener("angel:motion-ready", rescan);
      preference.removeEventListener("change", sync);
    };
  }, [pathname]);

  // One delegated pointermove listener drives every pointer-reactive surface
  // (photo tilt, magnetic buttons, the spotlight glow, the hero pointer-spot).
  // Nothing runs while the pointer is idle; each branch only writes CSS
  // custom properties that existing transition/animation rules already read.
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const TILT_MAX = 6;
    const MAGNET_MAX = 6;
    let tiltEl: HTMLElement | null = null;
    let magnetEl: HTMLElement | null = null;
    let spotEl: HTMLElement | null = null;

    const clearTilt = () => { tiltEl?.style.removeProperty("--rx"); tiltEl?.style.removeProperty("--ry"); tiltEl = null; };
    const clearMagnet = () => { magnetEl?.style.removeProperty("--mx"); magnetEl?.style.removeProperty("--my"); magnetEl = null; };
    const clearSpot = () => { spotEl?.style.removeProperty("--sx"); spotEl?.style.removeProperty("--sy"); spotEl = null; };
    const clearAll = () => { clearTilt(); clearMagnet(); clearSpot(); };

    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType !== "mouse") return;
      const target = event.target as Element | null;

      const tilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilt !== tiltEl) { clearTilt(); tiltEl = tilt; }
      if (tilt) {
        const rect = tilt.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        tilt.style.setProperty("--ry", `${(px * TILT_MAX * 2).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${(py * -TILT_MAX * 2).toFixed(2)}deg`);
      }

      const magnet = target?.closest<HTMLElement>(".button-primary, .header-actions .button") ?? null;
      if (magnet !== magnetEl) { clearMagnet(); magnetEl = magnet; }
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        magnet.style.setProperty("--mx", `${(((event.clientX - rect.left) / rect.width - 0.5) * MAGNET_MAX).toFixed(2)}px`);
        magnet.style.setProperty("--my", `${(((event.clientY - rect.top) / rect.height - 0.5) * MAGNET_MAX).toFixed(2)}px`);
      }

      const spot = target?.closest<HTMLElement>("[data-spotlight]") ?? null;
      if (spot !== spotEl) { clearSpot(); spotEl = spot; }
      if (spot) {
        const rect = spot.getBoundingClientRect();
        spot.style.setProperty("--sx", `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
        spot.style.setProperty("--sy", `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      }

      const hero = document.querySelector<HTMLElement>(".hero");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
          if (hero.dataset.pointer !== "true") hero.dataset.pointer = "true";
          hero.style.setProperty("--px", `${((event.clientX / window.innerWidth) * 100).toFixed(2)}vw`);
          hero.style.setProperty("--py", `${((event.clientY / window.innerHeight) * 100).toFixed(2)}vh`);
        }
      }
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", clearAll);
    return () => {
      clearAll();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", clearAll);
    };
  }, []);

  return null;
}
