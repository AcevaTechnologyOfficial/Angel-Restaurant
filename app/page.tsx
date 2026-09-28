import Link from "next/link";
import { MotionReady } from "@/components/motion-ready";
import type { CSSProperties } from "react";
import { Photo, Reservation } from "@/components/editorial";
import { VisitSection } from "@/components/neighborhood-map";
import { Words } from "@/components/split-text";
import { Badge, Embers } from "@/components/badge";
import { SectionHead, ScrollWords } from "@/components/section-head";
import { DishShowcase } from "@/components/dish-showcase";
import { GalleryRail } from "@/components/gallery-rail";
import { press } from "@/lib/press";
import { CinematicSlideshow } from "@/components/cinematic-slideshow";
import { HeroVideo } from "@/components/hero-video";
import { restaurant } from "@/lib/restaurant";
import { pageMetadata } from "@/lib/seo";
import { getPublicMenu } from "@/lib/menu-repository";
import { MenuRefresh } from "@/components/menu-refresh";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: { absolute: "Angel Indian Restaurant | Indian Food in Jackson Heights, Queens" },
  description:
    "Punjabi-rooted Indian cooking by Chef Amrit Pal Singh at 75-18 37th Avenue, Jackson Heights. Michelin Bib Gourmand recognition, 100% halal food, full bar. Tuesday–Sunday, 12 PM–10 PM.",
  path: "/",
});

const arrow = <span className="button-icon" aria-hidden="true">↗</span>;
const order = (index: number) => ({ "--i": index } as CSSProperties);

// Copy on this page is the client-approved wording from the previous build; only
// the presentation and motion are new. Do not reword or add claims here.
const signature = [
  { name: "tandoori-aceva", alt: "Tandoori chicken and kebabs from the clay oven", caption: "01 / FIRE & SPICE", title: "From the tandoor" },
  { name: "lamb-curry-aceva", alt: "Lamb rogan josh, cooked in a tomato and onion sauce", caption: "02 / SLOW & SOULFUL", title: "A little comfort" },
  { name: "dal-naan-aceva", alt: "Dal makhni, garlic naan and basmati rice", caption: "03 / MADE TO SHARE", title: "The familiar favorites" },
];

export default async function Home() {
  const { specials, categories, sections } = await getPublicMenu();
  const showcase = specials.filter(dish => dish.image).map(dish => ({ ...dish, note: categories.find(category => category.id === dish.categoryId)?.title || "" }));
  // The bar chapter lists the real Drinks course from the published menu; no drinks are hard-coded here.
  const drinks = sections.find(section => section.filter === "Drinks" || section.title === "Drinks");
  // The recognition quote is the press line already published on /press, never new copy.
  const pressQuote = press.find(item => item.note?.startsWith("“") || item.note?.startsWith("\""));
  return (
    <main id="main-content" tabIndex={-1} data-motion-pending>
      <MotionReady />
      <MenuRefresh />
      {/* Hero */}
      <section className="hero tone-dark" id="top" aria-label="Introduction">
        <HeroVideo src="/videos/hero-loop.mp4" poster="/angel/feast-aceva.webp" posterAlt="A generous spread of Indian curries and biryani from Angel’s editorial collection" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-spot" aria-hidden="true" />
        <Embers count={18} />
        <div className="container-shell hero-content">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-rule"><span>Punjab at heart. New York in spirit.</span></p>
              <h1 className="display-xl">
                <Words text="Some places" /><br /><Words text="feed you." from={2} /><br />
                <em><Words text="Others stay" from={4} /><br /><Words text="with you." from={6} /></em>
              </h1>
              <p className="hero-tagline text-shimmer">Indian cooking with soul.<br />A warm welcome in Queens.</p>
              <div className="button-row">
                <a className="button button-primary" href={restaurant.resy}><span>Reserve a table</span>{arrow}</a>
                <a className="button button-outline" href="#welcome"><span>A little taste of Angel</span><span className="button-icon" aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div className="hero-aside">
              <Badge text="MICHELIN · Bib Gourmand · Jackson Heights · NY · " size="11rem" />
              <div className="scroll-cue" aria-hidden="true"><span className="eyebrow">EST. 2019 / JACKSON HEIGHTS</span><span className="scroll-cue-line"><i /></span></div>
            </div>
          </div>
          <ul className="hero-stats">
            <li className="frame frame-soft"><p className="eyebrow">MICHELIN</p><strong>Bib Gourmand</strong></li>
            <li className="frame frame-soft"><p className="eyebrow">100% HALAL FOOD</p><strong>Full bar</strong></li>
            <li className="frame frame-soft"><p className="eyebrow">EST. 2019</p><strong>Jackson Heights · NY</strong></li>
          </ul>
        </div>
      </section>

      <section className="certificate-highlight tone-dark" aria-labelledby="certificate-title">
        <div className="container-shell certificate-highlight-inner">
          <div className="certificate-highlight-copy">
            <p className="eyebrow eyebrow-rule">A place worth discovering</p>
            <h2 id="certificate-title">Recognized by the <em>MICHELIN Guide.</em></h2>
            <p>Angel Indian Restaurant · Jackson Heights, New York</p>
          </div>
          <div className="certificate-highlight-mark" aria-label="Michelin Bib Gourmand recognition">
            <span>MICHELIN</span>
            <strong>Bib Gourmand</strong>
            <span>RECOGNITION</span>
          </div>
        </div>
      </section>

      {/* Welcome: the heading lights up word by word as it scrolls through */}
      <section id="welcome" className="manifesto section surface-dark tone-dark" aria-label="Welcome">
        <div className="manifesto-bg" aria-hidden="true">
          <div className="grid-pattern" style={{ position: "absolute", inset: 0 }} />
          <span className="orb orb-gold" style={{ left: "-10%", top: "-10%", width: "46vw", maxWidth: "720px", aspectRatio: "1", opacity: .6 }} />
          <span className="orb orb-ivory orb-slow" style={{ left: "35%", bottom: "-20%", width: "30vw", maxWidth: "480px", aspectRatio: "1", opacity: .35 }} />
        </div>
        <div className="container-shell manifesto-inner">
          <p className="eyebrow eyebrow-rule is-centered">Good food. Full hearts.</p>
          <h2 className="manifesto-text display-lg" data-scroll-words>
            <ScrollWords segments={[{ text: "From a family kitchen in Punjab to a table in" }, { text: "Jackson Heights.", em: true }]} />
          </h2>
          <div className="welcome-bottom" data-reveal data-stagger-children>
            <span className="editorial-star" aria-hidden="true">✳</span>
            <p>At Angel, it begins with the food. Honest ingredients, the warmth of the tandoor, and the kind of cooking that brings people together. Chef Amrit Pal Singh’s story is ours to share.</p>
            <Link href="/story" className="button button-glass"><span>Meet Angel</span>{arrow}</Link>
          </div>
        </div>
      </section>

      {/* 01 · From our kitchen */}
      <section id="kitchen" data-chapter="From our kitchen" className="section surface-gold tone-gold section-space">
        <span className="hairline section-hairline" aria-hidden="true" />
        <div className="container-shell">
          <SectionHead number="01" label="From our kitchen" title="Deeply rooted." italic="Distinctly Angel." cta={<Link className="button button-glass" href="/menu"><span>Explore the menu</span>{arrow}</Link>} />
          <div className="signature-grid">
            {signature.map((card, index) => (
              <Link href="/menu" className="frame frame-strong frame-hover signature-card tone-dark" data-reveal="photo" data-tilt style={order(index)} key={card.title}>
                <Photo name={card.name} alt={card.alt} className="signature-photo" sizes="(max-width: 767px) 100vw, 33vw" />
                <div className="signature-body"><span className="eyebrow">{card.caption}</span><h3>{card.title}</h3><span className="circle-btn" aria-hidden="true">↗</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 02 · The heart behind Angel */}
      <section id="story" data-chapter="The heart behind Angel" className="section surface-dark tone-dark section-space">
        <span className="hairline section-hairline" aria-hidden="true" />
        <div className="container-shell chef-grid">
          <div className="chef-portrait" data-reveal="photo">
            <div className="photo-frame chef-photo"><CinematicSlideshow label="The food and place behind Chef Amrit Pal Singh’s story" slides={[{ name: "thali-aceva", alt: "An Indian meal served in traditional dishes, Angel editorial collection" }, { name: "interior-aceva", alt: "Angel’s dining room on 37th Avenue" }, { name: "feast-aceva", alt: "A generous table of Indian dishes at Angel" }]} /></div>
            <div className="chip-float chip-float-tr frame frame-strong"><p className="eyebrow">A generous spirit, in every detail.</p></div>
            <Photo name="tandoori-aceva" alt="Tandoori chicken from the clay oven, a closer look" className="story-image-accent photo-frame" sizes="200px" />
          </div>
          <div className="chef-copy" data-reveal="words">
            <p className="eyebrow eyebrow-rule rise">The heart behind Angel</p>
            <h2 className="display-lg"><Words text="“Simple" /><br /><em><Words text="but good.”" from={1} /></em></h2>
            <p className="lede rise rise-late">A philosophy. A family story.<br />A restaurant named for a daughter.</p>
            <p className="rise rise-late">From Pathankot to Australia, and then New York. After cooking at Rahi and Adda, Chef Amrit Pal Singh opened Angel in 2019. His belief is simple: let the true taste of each ingredient shine.</p>
            <div className="button-row rise rise-late"><Link className="button button-primary" href="/story"><span>Our story</span>{arrow}</Link></div>
          </div>
        </div>
      </section>

      {/* 03 · Recognition */}
      <section id="recognition" data-chapter="Recognition" className="section surface-brown tone-dark section-space">
        <span className="hairline section-hairline" aria-hidden="true" />
        <div className="grid-pattern" style={{ position: "absolute", inset: 0 }} aria-hidden="true" />
        <div className="container-shell" style={{ position: "relative" }}>
          <SectionHead number="03" label="Recognized in New York & beyond" title="Cooking with soul." italic="Celebrated with distinction." lede="Honored with the Michelin Bib Gourmand, and featured by leading voices in food and culture." centered />
          {pressQuote && (
            <figure className="press-quote" data-reveal="words">
              <span className="press-quote-mark" aria-hidden="true">“</span>
              <blockquote className="display-md rise"><span>{pressQuote.note?.replace(/^[“"]|[”"]$/g, "")}</span></blockquote>
              <figcaption className="rise rise-late"><span className="eyebrow">{pressQuote.outlet}</span><span>{pressQuote.title}</span></figcaption>
            </figure>
          )}
          <div className="recognition-cards" aria-label="Press recognition" data-reveal data-stagger-children>
            {["The New Yorker", "Eater New York", "Condé Nast Traveller", "Resy"].map((name) => <div className="frame frame-strong recognition-card" key={name}><strong>{name}</strong></div>)}
          </div>
        </div>
      </section>

      {/* Stay a little longer: pinned room scene, footage sharpens as you scroll */}
      <section className="plating tone-dark" aria-labelledby="room-title">
        <div className="plating-sticky">
          <div className="plating-media"><Photo name="interior-aceva" alt="Angel’s dining room on 37th Avenue, editorially relit" sizes="100vw" /></div>
          <div className="plating-veil" aria-hidden="true" />
          <div className="container-shell plating-copy">
            <div className="plating-steps is-single">
              <div className="plating-step">
                <p className="eyebrow eyebrow-rule">Stay a little longer</p>
                <h2 className="display-lg" id="room-title">The food brings you in.<br /><em>The feeling brings you back.</em></h2>
                <p>A full bar. A warm room. Good company.</p>
                <div className="button-row"><Link href="/gallery" className="button button-primary"><span>Step inside</span>{arrow}</Link></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 · Life around the table */}
      <section id="gallery" data-chapter="Little moments" className="section surface-gold tone-gold section-space">
        <span className="hairline section-hairline" aria-hidden="true" />
        <div className="container-shell">
          <SectionHead number="04" label="Little moments, lasting memories" title="Life around" italic="the table." cta={<Link className="button button-glass" href="/gallery"><span>View gallery</span>{arrow}</Link>} />
          <DishShowcase dishes={showcase} />
        </div>
        <GalleryRail />
      </section>

      {/* 05 · Full bar: approved wording only (hero stat, FAQ answer) plus the published Drinks course */}
      {drinks && drinks.items.length > 0 && (
        <section id="bar" data-chapter="Full bar" className="section surface-dark tone-dark section-space bar-section" aria-labelledby="bar-title">
          <span className="hairline section-hairline" aria-hidden="true" />
          <div className="grid-pattern" style={{ position: "absolute", inset: 0 }} aria-hidden="true" />
          <div className="bar-bg" aria-hidden="true">
            <span className="orb orb-gold" style={{ right: "-12%", top: "-18%", width: "44vw", maxWidth: "700px", aspectRatio: "1", opacity: .5 }} />
            <span className="orb orb-ember orb-slow" style={{ left: "-10%", bottom: "-22%", width: "36vw", maxWidth: "560px", aspectRatio: "1", opacity: .45 }} />
          </div>
          <div className="container-shell bar-grid" style={{ position: "relative" }}>
            <div className="bar-media" data-reveal="photo" data-tilt>
              <Photo name="interior-aceva" alt="Angel’s dining room on 37th Avenue" className="photo-frame bar-photo" sizes="(max-width: 767px) 100vw, 45vw" />
              <div className="chip-float chip-float-bl frame frame-strong"><p className="eyebrow">100% halal food</p><strong>Full bar</strong></div>
            </div>
            <div className="bar-copy">
              <SectionHead number="05" label="Full bar" title="Does Angel have a bar?" italic="Yes. Angel has a full bar." lede="A full bar. A warm room. Good company." id="bar-title" />
              <ul className="bar-chips rise" data-reveal data-stagger-children aria-label="At a glance">
                {["100% halal food", "Full bar", "MICHELIN · Bib Gourmand", "Jackson Heights · NY"].map(fact => <li className="chip" key={fact}>{fact}</li>)}
              </ul>
              <div className="frame frame-strong bar-card" data-reveal="words">
                <div className="bar-card-head rise"><p className="eyebrow">{drinks.title}{drinks.kicker ? ` · ${drinks.kicker}` : ""}</p><span className="apricot-rule" data-reveal="line" aria-hidden="true" /></div>
                <ol className="bar-list rise rise-late">
                  {drinks.items.map((item, index) => (
                    <li className="bar-row" key={item.id}>
                      <span className="bar-row-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <span className="bar-row-name">{item.name}{item.tag && <span className="bar-row-tag"> · {item.tag}</span>}</span>
                      <span className="menu-item-leader" aria-hidden="true" />
                      <span className="menu-item-price">{item.price}</span>
                    </li>
                  ))}
                </ol>
                <div className="bar-card-foot rise rise-late">
                  <p className="eyebrow">Prices and availability may change.</p>
                  <Link className="circle-btn" href="/menu" aria-label="Explore the menu"><span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <VisitSection number="06" />
      <Reservation />
    </main>
  );
}
