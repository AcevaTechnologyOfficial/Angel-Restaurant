import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@/lib/restaurant";
import { Words } from "@/components/split-text";
import { Badge, Embers } from "@/components/badge";

export function Photo({ name, alt, className = "", priority = false, sizes = "(max-width: 767px) 100vw, 60vw" }: { name: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  // Next 16: `loading="eager"` (not `preload`) is what the LCP heuristic checks on the rendered <img>.
  return <div className={`editorial-photo ${className}`}><Image src={`/angel/${name}.webp`} alt={alt} fill sizes={sizes} loading={priority ? "eager" : undefined} /></div>;
}

// Secondary-page opener. With `image` it is a full-bleed photographic hero in the
// chef-site register (parallax frame, side scrim, light type, gold italic, an
// outlined `mark` word behind the headline); without one it is the gold field
// used by the text pages. The copy passed in is the approved page copy.
export function PageIntro({
  eyebrow,
  title,
  italic,
  description,
  image,
  mark,
}: {
  eyebrow: string;
  title: string;
  italic: string;
  description?: string;
  image?: { name: string; alt: string };
  mark?: string;
}) {
  return (
    <section className={`page-intro${image ? " page-intro--photo tone-dark" : " surface-gold tone-gold"}`}>
      {image && (
        <>
          <div className="page-intro-media" aria-hidden="true"><Photo name={image.name} alt={image.alt} priority sizes="100vw" /></div>
          <div className="page-intro-scrim" aria-hidden="true" />
          <Embers count={12} />
        </>
      )}
      {mark && <span className="page-intro-mark" aria-hidden="true">{mark}</span>}
      <div className="container-shell page-intro-inner">
        <p className="eyebrow eyebrow-rule">{eyebrow}</p>
        <h1 className="display-xl" data-reveal="words">
          <Words text={title} /> <em><Words text={italic} from={title.split(" ").length} /></em>
        </h1>
        {description && <p className="lede page-intro-lede">{description}</p>}
      </div>
    </section>
  );
}

// Closing call to action: a large spotlight frame on the deep-brown surface.
export function Reservation() {
  return (
    <section id="reserve" className="section surface-dark tone-dark section-space book" aria-labelledby="book-title">
      <div className="book-bg" aria-hidden="true"><Photo name="thali-aceva" alt="" sizes="100vw" /></div>
      <div className="book-scrim" aria-hidden="true" />
      <div className="container-shell">
        <div className="frame frame-strong spotlight book-card" data-spotlight data-reveal="words">
          <p className="eyebrow eyebrow-rule rise">There’s a place for you here</p>
          <h2 className="display-xl" id="book-title"><Words text="Come hungry." /><br /><em><Words text="Leave happy." from={2} /></em></h2>
          <div className="button-row rise rise-late">
            <a className="button button-primary" href={restaurant.resy}><span>Reserve a table</span><span className="button-icon" aria-hidden="true">↗</span></a>
          </div>
          <p className="type-caption rise rise-late">Tuesday–Sunday · 12 PM–10 PM</p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer tone-dark">
      <span className="hairline footer-hairline" aria-hidden="true" />
      <div className="footer-photo" aria-hidden="true"><Photo name="interior-aceva" alt="" sizes="100vw" /></div>
      <div className="footer-bg" aria-hidden="true">
        <span className="orb orb-gold" style={{ left: "-10%", top: "-10%", width: "46vw", maxWidth: "720px", aspectRatio: "1", opacity: .5 }} />
        <span className="orb orb-ember orb-slow" style={{ right: "-12%", top: "30%", width: "40vw", maxWidth: "640px", aspectRatio: "1", opacity: .5 }} />
      </div>
      <Embers count={12} />
      <div className="container-shell footer-top">
        <div className="footer-lead" data-reveal="words">
          <Link href="/" className="footer-brand rise"><span className="monogram" aria-hidden="true">A</span><span className="brand-name">angel <em>INDIAN RESTAURANT</em></span></Link>
          <h2 className="display-lg"><Words text="Rooted in Punjab." /><br /><em><Words text="At home in Queens." from={3} /></em></h2>
        </div>
        <Badge text="MICHELIN · Bib Gourmand · Jackson Heights · NY · " size="12rem" />
      </div>
      <div className="container-shell footer-grid" data-reveal data-stagger-children>
        <div className="frame frame-strong footer-card">
          <div className="footer-card-head"><span className="eyebrow">Find us</span><span className="circle-btn" aria-hidden="true">✦</span></div>
          <div className="footer-contact">
            <address>75-18 37th Avenue<br />Jackson Heights, NY 11372</address>
            <a href={restaurant.directions}>Get directions ↗</a>
          </div>
        </div>
        <div className="frame frame-strong footer-card">
          <div className="footer-card-head"><span className="eyebrow">Join us</span><span className="circle-btn" aria-hidden="true">✦</span></div>
          <div className="footer-contact">
            <p>Tuesday–Sunday · 12 PM–10 PM<br />Monday · Closed</p>
            <a href={restaurant.resy}>Reserve on Resy ↗</a>
          </div>
        </div>
        <div className="frame frame-strong footer-card">
          <div className="footer-card-head"><span className="eyebrow">Say hello</span><span className="circle-btn" aria-hidden="true">✦</span></div>
          <div className="footer-contact">
            <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a>
            <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
            <a href={restaurant.instagram}>Instagram ↗</a>
          </div>
        </div>
        <nav className="frame frame-strong footer-card" aria-label="Footer">
          <div className="footer-card-head"><span className="eyebrow">Explore</span><span className="circle-btn" aria-hidden="true">↗</span></div>
          <ol className="footer-links">
            {[["/menu", "Menu"], ["/private-dining", "Private dining"], ["/press", "Press"], ["/faq", "Questions & answers"], ["/visit", "Visit Angel"]].map(([href, label], index) => <li key={href}><Link href={href}><small>0{index + 1}</small>{label}<i aria-hidden="true">↗</i></Link></li>)}
          </ol>
        </nav>
      </div>
      <div className="container-shell footer-mark" aria-hidden="true"><span className="footer-wordmark">angel</span></div>
      <div className="container-shell footer-bottom">
        <div className="footer-bottom-left"><span>© {new Date().getFullYear()} Angel Indian Restaurant</span><span>100% halal food · Full bar · Queens, New York</span></div>
        <div className="footer-bottom-right"><Link href="/privacy">Privacy &amp; terms</Link><a className="circle-btn" href="#top" aria-label="Back to top">↑</a></div>
      </div>
    </footer>
  );
}
