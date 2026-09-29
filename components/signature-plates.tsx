import Image from "next/image";
import type { CSSProperties } from "react";
import { SectionHead } from "@/components/section-head";
import type { Category, MenuItem } from "@/lib/menu-types";
import { money } from "@/lib/menu-types";

type Plate = { name: string; price: string; description: string; section?: string; image: string; vegetarian: boolean; stock: boolean };

const order = (index: number) => ({ "--i": index } as CSSProperties);

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
}

// "Where to start": every chef's-special dish that has photography, as
// large, asymmetric hero tiles (one wide portrait plus two stacked
// secondaries per group of three, repeating). A few of these photos are
// supplied stock shots of uneven quality rather than the restaurant's own,
// so the dishes the restaurant actually photographed are ordered first —
// they tend to land in the larger slot of each group — but every dish gets
// the same tile design regardless of which photo it carries.
export function SignaturePlates({ specials, categories, dishCount }: { specials: MenuItem[]; categories: Category[]; dishCount: number }) {
  const plates: Plate[] = specials.filter(dish => dish.image).map(dish => ({
    name: dish.name,
    price: money(dish.priceCents),
    description: dish.featuredDescription || dish.description,
    section: categories.find(category => category.id === dish.categoryId)?.title,
    image: dish.image,
    vegetarian: dish.vegetarian,
    stock: dish.image.includes("-stock"),
  })).sort((a, b) => Number(a.stock) - Number(b.stock));
  if (plates.length === 0) return null;

  const groups = chunk(plates, 3);

  return (
    <section className="surface-gold tone-gold section" aria-label="Signature plates">
      <div className="container-shell section-space">
        <SectionHead label="Where to start" title="The plates people" italic="come back for." />

        <div className="dish-feature">
          {groups.map((group, groupIndex) => (
            <div className={`dish-feature-row${group.length === 1 ? " is-solo" : ""}`} key={group[0].name}>
              <DishTile dish={group[0]} index={groupIndex * 3} large eager={groupIndex === 0} />
              {group.length > 1 && (
                <div className="dish-feature-stack">
                  {group.slice(1).map((dish, i) => (
                    <DishTile dish={dish} index={groupIndex * 3 + i + 1} key={dish.name} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="menu-note type-caption dish-feature-close">
          <p>Some photographs are illustrative; presentation may vary.</p>
          <p>All {dishCount} dishes in full below</p>
        </div>
      </div>
    </section>
  );
}

function DishTile({ dish, index, large, eager }: { dish: Plate; index: number; large?: boolean; eager?: boolean }) {
  return (
    <article className={`dish-feature-tile${large ? " is-large" : ""}`} data-reveal="photo" data-tilt style={order(index)}>
      <div className="dish-feature-image">
        <Image
          src={dish.image}
          alt={dish.stock ? `${dish.name} — illustrative food photograph` : dish.name}
          fill
          sizes={large ? "(max-width: 767px) 100vw, (max-width: 1023px) 60vw, 40vw" : "(max-width: 767px) 100vw, (max-width: 1023px) 30vw, 20vw"}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
        />
        {dish.vegetarian && <span className="chip chip-solid dish-tag">Vegetarian</span>}
      </div>
      <div className="dish-feature-copy">
        <span className="dish-feature-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <div className="dish-feature-head">
          <h3>{dish.name}</h3>
          <span className="dish-feature-line" aria-hidden="true" />
          <span className="dish-feature-price">{dish.price}</span>
        </div>
        <p>{dish.description}</p>
        {dish.section && <span className="dish-feature-section">{dish.section}</span>}
      </div>
    </article>
  );
}
