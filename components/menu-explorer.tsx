"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import type { PublicSection } from "@/lib/menu-types";
import { trackEvent } from "@/lib/analytics";
import { SectionHead } from "@/components/section-head";

// Measures the pressed button in a filter group (via the container ref the
// caller owns) and returns a style for an absolutely-positioned sibling pill
// to slide/resize onto it, so switching courses or diets moves one shared
// indicator instead of instantly recoloring each button. Re-measures on the
// active value changing and on resize/wrap. Both axes are tracked (not just
// X) so the indicator still lands on the right button when a long list of
// courses wraps onto a second line.
function useFilterPill(containerRef: RefObject<HTMLDivElement | null>, activeValue: string) {
  const [style, setStyle] = useState<CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const active = container.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!active) return;
      const containerRect = container.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      setStyle({ transform: `translate(${rect.left - containerRect.left}px, ${rect.top - containerRect.top}px)`, width: rect.width, opacity: 1 });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, activeValue]);

  return style;
}

const order = (index: number) => ({ "--i": index } as CSSProperties);

const diets = [
  { id: "all", label: "Everything" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
] as const;

type Diet = (typeof diets)[number]["id"];

export function MenuExplorer({ menu, categories }: { menu: PublicSection[]; categories: string[] }) {
  const [category, setCategory] = useState("All dishes");
  const [diet, setDiet] = useState<Diet>("all");
  const [query, setQuery] = useState("");
  const categoryGroupRef = useRef<HTMLDivElement>(null);
  const dietGroupRef = useRef<HTMLDivElement>(null);
  const categoryPillStyle = useFilterPill(categoryGroupRef, category);
  const dietPillStyle = useFilterPill(dietGroupRef, diet);

  const sections = useMemo(() => {
    const search = query.trim().toLowerCase();
    return menu
      .filter((section) => category === "All dishes" || section.filter === category)
      .map((section) => ({
        ...section,
        // A diet badge only earns its place where the section is mixed; "Vegan" always does.
        mixed: section.items.some((item) => !item.vegetarian),
        items: section.items.filter((item) => {
          if (diet === "vegetarian" && !item.vegetarian) return false;
          if (diet === "vegan" && !item.vegan) return false;
          if (!search) return true;
          return `${item.name} ${item.description ?? ""}`.toLowerCase().includes(search);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [category, diet, query, menu]);

  const count = sections.reduce((total, section) => total + section.items.length, 0);
  const dietLabel = diet === "vegan" ? "Vegan" : "Vegetarian";

  return (
    <div className="menu-explorer">
      <div aria-live="polite">
        <SectionHead
          label={`${count} ${count === 1 ? "dish" : "dishes"}`}
          title={category}
          aside={diet !== "all" && <span className="chip chip-solid">{dietLabel}</span>}
        />
      </div>

      <div className="menu-controls">
        <div className="menu-categories" aria-label="Filter dishes by course" ref={categoryGroupRef}>
          <span className="filter-pill" style={categoryPillStyle} aria-hidden="true" />
          {categories.map((name) => (
            <button key={name} type="button" aria-pressed={category === name} onClick={() => { setCategory(name); trackEvent("menu_filter", { category: name }); }}>
              {name}
            </button>
          ))}
        </div>
        <div className="menu-filters">
          <div className="diet-filter" role="group" aria-label="Filter dishes by diet" ref={dietGroupRef}>
            <span className="filter-pill" style={dietPillStyle} aria-hidden="true" />
            {diets.map((option) => (
              <button key={option.id} type="button" aria-pressed={diet === option.id} onClick={() => { setDiet(option.id); trackEvent("menu_filter", { diet: option.id }); }}>
                {option.label}
              </button>
            ))}
          </div>
          <div className="menu-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" value={query} aria-label="Search the menu" placeholder="Search a dish" onChange={(event) => setQuery(event.target.value)} />
          </div>
        </div>
      </div>

      {/* Keyed on the filters so every change replays the arrival, the way .dish-feature-tile does. */}
      <div className="menu-list" key={`${category}-${diet}-${query}`}>
        {sections.map((section, index) => (
          <section className="menu-list-section" key={section.id} aria-labelledby={`${section.id}-title`}>
            <header className="menu-list-head" data-reveal>
              <span className="menu-list-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.kicker && <p className="type-eyebrow">{section.kicker}</p>}
              <span className="apricot-rule menu-list-rule" data-reveal="line" aria-hidden="true" />
            </header>
            <ul className="menu-items" data-reveal data-stagger-children>
              {section.items.map((item, position) => (
                <li className="menu-item" style={order(position)} key={item.id}>
                  <div className="menu-item-head">
                    <span className="menu-item-num" aria-hidden="true">{String(position + 1).padStart(2, "0")}</span>
                    <h3>
                      {item.name}
                      {item.tag && <span className="menu-item-note"> ({item.tag})</span>}
                    </h3>
                    <span className="menu-item-leader" aria-hidden="true" />
                    <span className="menu-item-price">{item.price}</span>
                  </div>
                  {item.description && <p>{item.description}</p>}
                  {item.vegan && <span className="menu-item-diet">Vegan</span>}
                  {!item.vegan && item.vegetarian && section.mixed && <span className="menu-item-diet">Vegetarian</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {count === 0 && <p className="empty-menu">Nothing matches that yet. Try another course, or clear the search.</p>}

      <p className="menu-note type-caption">
        If you have a food allergy or a special dietary requirement, please tell us before placing your order. Prices and availability may change.
      </p>
    </div>
  );
}
