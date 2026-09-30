import { PageIntro, Reservation } from "@/components/editorial";
import { MenuExplorer } from "@/components/menu-explorer";
import { SignaturePlates } from "@/components/signature-plates";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";
import { getPublicMenu } from "@/lib/menu-repository";
import type { PublicSection } from "@/lib/menu-types";
import { MenuRefresh } from "@/components/menu-refresh";
import { MotionReady } from "@/components/motion-ready";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Menu: Tandoori, Biryani & Curries in Jackson Heights",
  description: "Explore our current dishes and prices: tandoori chicken, dum biryani, Amritsari kulcha, vegetarian and vegan curries. 100% halal Indian food in Jackson Heights, Queens.",
  path: "/menu",
});
const breadcrumbs = breadcrumbList([{ name: "The menu", path: "/menu" }]);
// Structured data uses the same published records as the visible menu.
const menuJsonLd = (menu: PublicSection[]) => ({
  "@context": "https://schema.org",
  "@type": "Menu",
  name: "Angel Indian Restaurant menu",
  inLanguage: "en-US",
  hasMenuSection: menu.map((section) => ({
    "@type": "MenuSection",
    name: section.kicker ? `${section.title} — ${section.kicker}` : section.title,
    hasMenuItem: section.items.map((dish) => ({
      "@type": "MenuItem",
      name: dish.name,
      description: dish.description,
      offers: { "@type": "Offer", price: dish.price.replace(/[^0-9.]/g, ""), priceCurrency: "USD" },
      suitableForDiet: [
        dish.vegan && "https://schema.org/VeganDiet",
        dish.vegetarian && "https://schema.org/VegetarianDiet",
        // The published claim is "100% halal food", so drinks are not labelled.
        section.id !== "drinks" && "https://schema.org/HalalDiet",
      ].filter(Boolean),
    })),
  })),
});

export default async function MenuPage() {
  const { sections, specials, categories, items } = await getPublicMenu();
  const dishCount = items.length;
  return (
    <main id="main-content" tabIndex={-1} data-motion-pending>
      <MotionReady />
      <JsonLd data={breadcrumbs} />
      <JsonLd data={menuJsonLd(sections.filter(section => section.items.length))} />
      <MenuRefresh />
      <PageIntro
        eyebrow="The Angel menu · 100% halal food"
        title="A little spice."
        italic="A lot of soul."
        description="From the clay oven to the comfort of a slow-cooked curry. Find your favorite, or discover something new."
        image={{ name: "tandoori-aceva", alt: "Tandoori chicken and kebabs coming out of the clay oven" }}
        mark="Menu"
      />
      <SignaturePlates specials={specials} categories={categories} dishCount={dishCount} />
      <section className="surface-dark tone-dark section" aria-label="The full menu">
        <div className="container-shell menu-section"><MenuExplorer menu={sections} categories={["All dishes", ...new Set(categories.map(category => category.filter))]} /></div>
      </section>
      <Reservation />
    </main>
  );
}
