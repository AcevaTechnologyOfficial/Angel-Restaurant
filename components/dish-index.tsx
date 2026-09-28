"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSlideAdvance } from "@/lib/use-slide-advance";

type Slide = { name: string; alt: string; title: string };

const pad = (index: number) => String(index + 1).padStart(2, "0");

export function DishIndex({
  slides,
  className = "",
  label,
  priority = false,
  layout = "split",
}: {
  slides: Slide[];
  className?: string;
  label: string;
  priority?: boolean;
  layout?: "split" | "stacked";
}) {
  const { active, setActive, setPaused, reducedMotion } = useSlideAdvance(slides.length);
  const [manualPaused, setManualPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  useEffect(() => { setPaused(manualPaused || hovering); }, [manualPaused, hovering, setPaused]);
  const current = slides[active];

  return (
    <div className={`dish-index dish-index--${layout} ${className}`} role="group" aria-label={label}>
      <figure className="dish-index-preview cinematic-slideshow editorial-photo">
        <div className="cinematic-frames">
          {slides.map((slide, index) => (
            <div
              className={`cinematic-frame ${index === active ? "is-active" : ""}`}
              aria-hidden={index !== active}
              key={slide.name}
            >
              {index === active && <Image
                src={`/angel/${slide.name}.webp`}
                alt={slide.alt}
                fill
                sizes="(max-width: 767px) 100vw, 55vw"
                // Next 16: `loading="eager"` is what the LCP heuristic reads on the
                // rendered <img>, so only the real first slide gets it.
                loading={priority && index === 0 ? "eager" : undefined}
              />}
            </div>
          ))}
        </div>
        <figcaption className="dish-index-caption" aria-live="polite">
          <span className="dish-index-caption-num" aria-hidden="true">{pad(active)}</span>
          <span className="dish-index-caption-name">{current.title}</span>
        </figcaption>
        {!reducedMotion && slides.length > 1 && (
          <button
            type="button"
            className="cinematic-pause dish-index-pause"
            aria-pressed={manualPaused}
            onClick={() => setManualPaused((value) => !value)}
          >{manualPaused ? "Play" : "Pause"} <span aria-hidden="true">{manualPaused ? "▷" : "Ⅱ"}</span></button>
        )}
      </figure>
      <ul
        className="dish-index-list"
        role="list"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovering(false); }}
      >
        {slides.map((slide, index) => (
          <li key={slide.name}>
            <button
              type="button"
              className={`dish-index-item ${index === active ? "is-active" : ""}`}
              aria-pressed={index === active}
              aria-label={`Preview ${slide.title}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span className="dish-index-num" aria-hidden="true">{pad(index)}</span>
              <span className="dish-index-name">{slide.title}</span>
              <span className="dish-index-mark" aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
