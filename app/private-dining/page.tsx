import { PageIntro } from "@/components/editorial";
import { EnquiryForm } from "@/components/enquiry-form";
import { CinematicSlideshow } from "@/components/cinematic-slideshow";
import { Words } from "@/components/split-text";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Private Dining & Events in Jackson Heights", description: "Book birthdays, family gatherings, meetings and company dinners at Angel Indian Restaurant, Jackson Heights, Queens. Send an event enquiry.", path: "/private-dining" });
const breadcrumbs = breadcrumbList([{ name: "Private dining", path: "/private-dining" }]);

export default function PrivateDiningPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro eyebrow="Private dining & gatherings" title="Your people." italic="Our table." description="Birthdays, family gatherings, and company dinners. Bring your occasion to Angel." image={{ name: "feast-aceva", alt: "A generous table of Indian dishes ready to share" }} mark="Celebrate" />
      <section className="surface-dark tone-dark section">
        <div className="container-shell private-dining">
          <div>
            <div className="photo-frame private-media" data-reveal="photo">
              <CinematicSlideshow className="private-cinema" priority label="Private dining atmosphere at Angel" slides={[{ name: "room-guests", alt: "Guests dining together in Angel’s dining room" }, { name: "room-long-table", alt: "A long table set for a group along the banquette at Angel" },{ name: "feast-aceva", alt: "A table of Indian dishes ready to share" }, { name: "thali-aceva", alt: "A generous Indian meal for a gathering" }]} />
            </div>
            <div className="private-copy" data-reveal="words">
              <p className="eyebrow eyebrow-rule rise">Good company deserves good food</p>
              <h2 className="display-lg"><Words text="Something" /><br /><em><Words text="to celebrate." from={1} /></em></h2>
              <p className="rise rise-late">Tell us your date, party size, and occasion. Our team will discuss availability, space options, and pricing with you.</p>
              <p className="rise rise-late">Spaces and capacities are confirmed directly with our team. An enquiry is not a confirmed reservation.</p>
            </div>
          </div>
          <EnquiryForm />
        </div>
      </section>
    </main>
  );
}
