import Image from "next/image";
import { PageIntro, Reservation } from "@/components/editorial";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";
import { press } from "@/lib/press";

export const metadata = pageMetadata({
  title: "Press & Recognition",
  description:
    "Michelin Bib Gourmand and coverage of Angel Indian Restaurant in The New Yorker, Eater NY, The Infatuation, Condé Nast Traveller and more.",
  path: "/press",
});
const breadcrumbs = breadcrumbList([{ name: "Press", path: "/press" }]);

function formatDate(item: (typeof press)[number]) {
  if (item.precision === "none") return null;
  const options: Intl.DateTimeFormatOptions =
    item.precision === "year" ? { year: "numeric" }
    : item.precision === "day" ? { month: "long", day: "numeric", year: "numeric" }
    : { month: "long", year: "numeric" };
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(item.date));
}

export default function PressPage() {
  const sorted = [...press].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro eyebrow="In the press" title="A citywide" italic="conversation." description="Michelin recognition, and coverage from The New Yorker, Eater NY, The Infatuation, Condé Nast Traveller and more." mark="Press" />
      <section className="surface-dark tone-dark section" aria-label="Press coverage">
        <div className="container-shell press-recognition" data-reveal>
          <div className="press-recognition-heading">
            <p className="eyebrow eyebrow-rule">Framed recognition</p>
            <h2 className="display-lg">Featured <em>by the city.</em></h2>
          </div>
          <div className="press-certificate-grid">
            <figure className="press-certificate frame frame-strong">
              <a href="/Certificates/Certificate01.jpeg" target="_blank" rel="noopener noreferrer" aria-label="View the Thrillist recognition full size">
                <Image src="/Certificates/Certificate01.jpeg" alt="Framed Thrillist feature naming Angel Indian Restaurant among the 15 best Indian restaurants in NYC, October 2022" width={1083} height={1600} sizes="(max-width: 767px) calc(100vw - 4rem), 26rem" />
              </a>
              <figcaption><span>Thrillist</span><span>October 2022</span></figcaption>
            </figure>
            <figure className="press-certificate frame frame-strong">
              <a href="/Certificates/Certificate02.jpeg" target="_blank" rel="noopener noreferrer" aria-label="View the Eater recognition full size">
                <Image src="/Certificates/Certificate02.jpeg" alt="Framed Eater feature, The Best Indian Restaurants in NYC, September 2024" width={679} height={1024} sizes="(max-width: 767px) calc(100vw - 4rem), 26rem" />
              </a>
              <figcaption><span>Eater</span><span>September 2024</span></figcaption>
            </figure>
          </div>
        </div>
        <div className="container-shell press-list">
          <ol data-reveal data-stagger-children>
            {sorted.map((item, index) => (
              <li className="frame frame-strong frame-hover" key={item.url + item.title}>
                <article>
                  <span className="press-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="type-caption">
                      {item.outlet}
                      {formatDate(item) && <> · <time dateTime={item.precision === "year" ? item.date.slice(0, 4) : item.precision === "day" ? item.date : item.date.slice(0, 7)}>{formatDate(item)}</time></>}
                    </p>
                    <h2>
                      <a href={item.url}>{item.title} <span aria-hidden="true">↗</span></a>
                    </h2>
                    {item.note && <p>{item.note}</p>}
                    {item.brief && <div className="press-brief"><div><p>{item.brief}</p></div></div>}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Reservation />
    </main>
  );
}
