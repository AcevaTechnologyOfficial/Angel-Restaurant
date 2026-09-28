"use client";

import Image from "next/image";
import { useSlideAdvance } from "@/lib/use-slide-advance";

type Slide = { name: string; alt: string };

export function CinematicSlideshow({
  slides,
  className = "",
  label,
  priority = false,
}: {
  slides: Slide[];
  className?: string;
  label: string;
  priority?: boolean;
}) {
  const { active, setActive, paused, setPaused, reducedMotion } = useSlideAdvance(slides.length);

  return (
    <figure className={`cinematic-slideshow editorial-photo ${className}`} aria-label={label} data-paused={paused || reducedMotion}>
      <div className="cinematic-frames">
        {slides.map((slide, index) => (
          <div
            className={`cinematic-frame ${index === active ? "is-active" : ""}`}
            aria-hidden={index !== active}
            key={slide.name}
          >
            {index === active && <Image
              src={`/angel/${slide.name}.webp`}
              alt={index === active ? slide.alt : ""}
              fill
              sizes="(max-width: 767px) 100vw, 60vw"
              // Next 16: `loading="eager"` (not `preload`) is what the LCP heuristic
              // checks on the rendered <img>, so only the real first slide gets it.
              loading={priority && index === 0 ? "eager" : undefined}
            />}
          </div>
        ))}
      </div>
      <div className="cinematic-controls">
        <div className="cinematic-progress" role="group" aria-label="Choose photograph">
          {slides.map((slide, index) => (
            <button
              type="button"
              aria-label={`Show photograph ${index + 1}: ${slide.alt}`}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              key={slide.name}
            ><span /></button>
          ))}
        </div>
        {!reducedMotion && (
          <button
            type="button"
            className="cinematic-pause"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >{paused ? "Play" : "Pause"} <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span></button>
        )}
      </div>
    </figure>
  );
}
