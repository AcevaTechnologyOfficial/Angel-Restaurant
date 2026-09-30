import Link from "next/link";
import { PageIntro, Reservation } from "@/components/editorial";
import { VisitSection } from "@/components/neighborhood-map";
import { Words } from "@/components/split-text";
import { restaurant } from "@/lib/restaurant";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Hours, Address & Directions", description: "Angel Indian Restaurant, 75-18 37th Ave, Jackson Heights, NY 11372. Open Tue–Sun 12–10 PM. 74 St–Broadway (7/E/F/M/R). Call 347-848-0098.", path: "/visit" });
const breadcrumbs = breadcrumbList([{ name: "Visit us", path: "/visit" }]);

export default function VisitPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro eyebrow="Make your way to Angel" title="A table worth" italic="coming together for." image={{ name: "storefront", alt: "Angel Indian Restaurant’s storefront at 75-18 37th Avenue, Jackson Heights" }} mark="Queens" />
      <VisitSection />
      <section className="surface-dark tone-dark section section-space" aria-labelledby="contact-title">
        <div className="container-shell">
          <div className="frame frame-strong contact-section" data-reveal="words">
            <div><p className="eyebrow eyebrow-rule rise">A question before your visit?</p><h2 className="display-lg" id="contact-title"><Words text="Let’s" /> <em><Words text="talk." from={1} /></em></h2></div>
            <div>
              <a className="rise rise-late" href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a>
              <a className="rise rise-late" href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
              <p className="rise rise-late">For parking, access, or dietary questions, please contact our team before your visit.</p>
              <p className="rise rise-late">Planning an event? <Link className="text-link" href="/private-dining#enquiry">Send an enquiry ↗</Link></p>
              <Link className="text-link rise rise-late" href="/faq">Frequently asked questions ↗</Link>
            </div>
          </div>
        </div>
      </section>
      <Reservation />
    </main>
  );
}
