import { PageIntro, Reservation } from "@/components/editorial";
import { GalleryRail } from "@/components/gallery-rail";
import { GalleryLightbox } from "@/components/gallery-lightbox";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Gallery: The Dining Room & Dishes", description: "A glimpse of the dining room, the tandoor, and the table at Angel Indian Restaurant in Jackson Heights, Queens.", path: "/gallery" });
const breadcrumbs = breadcrumbList([{ name: "The experience", path: "/gallery" }]);
const photos = [{ name: "room-long-table", label: "A room to settle into" }, { name: "tandoori-aceva", label: "Straight from the tandoor" }, { name: "dal-naan-aceva", label: "The comfort of familiar flavors" }, { name: "lamb-curry-aceva", label: "A little spice, a little soul" }, { name: "feast-aceva", label: "Better when shared" }, { name: "thali-aceva", label: "An invitation to linger" }];

export default function GalleryPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro eyebrow="The Angel experience" title="Come for the food." italic="Stay for the feeling." description="A glimpse of the room, the table, and the flavors that bring us together." image={{ name: "room-long-table", alt: "Angel’s dining room on 37th Avenue" }} mark="Angel" />
      <section className="surface-gold tone-gold section" aria-label="A glimpse of Angel"><GalleryRail /></section>
      <section className="surface-dark tone-dark section" aria-label="Angel photo collection">
        <GalleryLightbox photos={photos}>
          <p className="type-caption gallery-disclosure">From Angel’s existing editorial collection, including relit imagery. Select a photograph to view it larger.</p>
        </GalleryLightbox>
      </section>
      <Reservation />
    </main>
  );
}
