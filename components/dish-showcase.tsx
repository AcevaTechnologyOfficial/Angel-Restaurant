"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { MenuItem } from "@/lib/menu-types";
import { trackEvent } from "@/lib/analytics";
import { useSlideAdvance } from "@/lib/use-slide-advance";

const pad = (index: number) => String(index + 1).padStart(2, "0");

export function DishShowcase({ dishes }: { dishes: (MenuItem & { note: string })[] }) {
  const { active, setActive, setPaused, reducedMotion } = useSlideAdvance(dishes.length);
  const [manualPaused, setManualPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  useEffect(() => { setPaused(manualPaused || hovering); }, [manualPaused, hovering, setPaused]);

  if (!dishes.length) return <p>Explore our current dishes on the full menu.</p>;
  const activeIndex = Math.min(active, dishes.length - 1);
  return (
    <div className="dish-showcase">
      <ul
        className="dish-list"
        data-reveal
        data-stagger-children
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setHovering(false); }}
      >
        {dishes.map((dish, index) => (
          <li key={dish.id}>
            <button
              type="button"
              className={`dish-item${index === activeIndex ? " is-active" : ""}`}
              aria-pressed={index === activeIndex}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => { setActive(index); trackEvent(dish.type === "chef-special" ? "chef_special_click" : "menu_item_click", { itemId: dish.id, itemName: dish.name, category: dish.note }); }}
            >
              <span className="dish-num" aria-hidden="true">{pad(index)}</span>
              <span><span className="dish-name">{dish.name}</span><span className="dish-note">{dish.note}</span></span>
              <span className={`circle-btn${index === activeIndex ? " is-active" : ""}`} aria-hidden="true">↗</span>
            </button>
          </li>
        ))}
      </ul>
      <figure className="frame frame-strong dish-preview" data-reveal="photo" data-tilt data-paused={manualPaused || hovering || reducedMotion}>
        {dishes.map((dish, index) => (
          <div className={`dish-preview-frame${index === activeIndex ? " is-active" : ""}`} aria-hidden={index !== activeIndex} key={dish.id}>
            {index === activeIndex && <Image src={dish.image} alt={dish.name} fill sizes="(max-width: 767px) 100vw, 50vw" />}
            <span className="dish-preview-num" aria-hidden="true">{pad(index)}</span>
            <div className="dish-preview-copy" aria-hidden="true">
              <p className="eyebrow">{dish.note}</p>
              <h3>{dish.name}</h3>
              {(dish.featuredDescription || dish.description) && <p>{dish.featuredDescription || dish.description}</p>}
              <div className="dish-badges">
                {dish.vegan ? <span title="Vegan">VG</span> : dish.vegetarian && <span title="Vegetarian">V</span>}
                <span title="100% halal food">H</span>
              </div>
            </div>
          </div>
        ))}
        {/* Re-keyed on the active dish so the fill restarts with every advance. */}
        <span className="dish-preview-progress" aria-hidden="true" key={activeIndex} />
        {!reducedMotion && dishes.length > 1 && (
          <button
            type="button"
            className="cinematic-pause dish-preview-pause"
            aria-pressed={manualPaused}
            onClick={() => setManualPaused((value) => !value)}
          >{manualPaused ? "Play" : "Pause"} <span aria-hidden="true">{manualPaused ? "▷" : "Ⅱ"}</span></button>
        )}
      </figure>
    </div>
  );
}
