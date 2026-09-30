import { PageIntro, Reservation } from "@/components/editorial";
import { DishIndex } from "@/components/dish-index";
import { Words } from "@/components/split-text";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, breadcrumbList } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Our Story: Chef Amrit Pal Singh", description: "How Chef Amrit Pal Singh brought India’s family kitchens to Jackson Heights, Queens, and opened Angel Indian Restaurant in 2019.", path: "/story" });
const breadcrumbs = breadcrumbList([{ name: "Our story", path: "/story" }]);

export default function StoryPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <JsonLd data={breadcrumbs} />
      <PageIntro eyebrow="Our story" title="India in our roots." italic="Queens in our heart." image={{ name: "thali-aceva", alt: "A generous Indian meal served in traditional dishes" }} mark="Story" />
      <section className="surface-gold tone-gold section" aria-labelledby="chef-title">
        <div className="container-shell story-feature">
          <div className="story-media" data-reveal="photo">
            <DishIndex layout="stacked" priority label="Hover or tap a dish from Chef Amrit Pal Singh’s kitchen to preview it" slides={[{ name: "thali-aceva", alt: "A generous Indian meal from Angel’s editorial collection", title: "The Angel Thali" }, { name: "tandoori-aceva", alt: "Food cooking in the tandoor at Angel", title: "From the Tandoor" }, { name: "feast-aceva", alt: "A table filled with Indian dishes at Angel", title: "A Generous Feast" }]} />
          </div>
          <div data-reveal="words">
            <p className="eyebrow eyebrow-rule rise">Chef Amrit Pal Singh</p>
            <h2 className="display-lg" id="chef-title"><Words text="It began in" /><br /><em><Words text="a family kitchen." from={3} /></em></h2>
            <p className="rise rise-late">In Pathankot, India, Amrit Pal Singh grew up around food and family. His journey took him to culinary training in Australia, then to the kitchens of Rahi and Adda in New York.</p>
            <p className="rise rise-late">In October 2019, he invested his savings in a restaurant of his own in Jackson Heights. He named it Angel, after his young daughter.</p>
            <p className="rise rise-late">The approach has stayed close to home: preserve the true taste of each ingredient. Give it care, rather than hiding it behind excess cream or spice.</p>
          </div>
        </div>
      </section>
      <section className="surface-dark tone-dark section section-space story-quote" data-reveal="words">
        <span className="story-quote-mark" aria-hidden="true">“</span>
        <div className="container-shell">
          <p className="eyebrow eyebrow-rule is-centered rise">From Chef Amrit Pal Singh</p>
          <blockquote><Words text="“My family and my customers" /><br /><em><Words text="eat the same food.”" from={5} /></em></blockquote>
        </div>
      </section>
      <section className="surface-gold tone-gold section" aria-labelledby="home-title">
        <div className="container-shell story-feature is-flipped">
          <div data-reveal="words">
            <p className="eyebrow eyebrow-rule rise">At home in Jackson Heights</p>
            <h2 className="display-lg" id="home-title"><Words text="A neighborhood table." /><br /><em><Words text="A warm welcome." from={3} /></em></h2>
            <p className="rise rise-late">A Michelin Bib Gourmand, rooted in Queens. Angel brings Indian cooking, a full bar, and warm hospitality together on 37th Avenue.</p>
            <p className="rise rise-late">Come for lunch. Settle in for dinner. Share a few favorites and make yourself at home.</p>
          </div>
          <div className="story-media" data-reveal="photo">
            <DishIndex layout="stacked" label="Hover or tap to preview Angel at home in Jackson Heights" slides={[{ name: "room-long-table", alt: "Angel’s dining room on 37th Avenue", title: "The Dining Room" }, { name: "feast-aceva", alt: "A generous table at Angel in Jackson Heights", title: "A Table to Share" }, { name: "dal-naan-aceva", alt: "Dal makhni, naan and rice made for sharing", title: "Dal Makhni & Naan" }]} />
          </div>
        </div>
      </section>
      <Reservation />
    </main>
  );
}
