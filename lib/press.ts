export type PressItem = {
  outlet: string;
  title: string;
  url: string;
  /** YYYY-MM-DD, used for ordering. The old site gave only month/year for most items; those use the 1st. */
  date: string;
  /** How much of `date` is real. Defaults to "month"; "day" shows the full date, "year" and "none" avoid showing a day or month nobody published. */
  precision?: "day" | "month" | "year" | "none";
  kind: "award" | "review" | "feature" | "guide" | "listing" | "video";
  note?: string;
  /** Short summary of what the source says about Angel, taken from the linked page itself; shown when the item is hovered or focused. */
  brief?: string;
};

// Captured from www.angelindianrestaurant.com's /press page (first on
// 18 September 2026, re-extracted in full on 30 September 2026; see
// CONTENT_REFERENCE.md). This is a preservation record, not independent
// verification of any claim, rating, or quote below — confirm before reuse.
// The old site's separate "Michelin Bib Gourmand (2021)" award line is not
// reproduced as a press item here; it belongs in the Restaurant JSON-LD's
// `award` field (app/layout.tsx) once the client confirms it, not as an article.
// "The New Yorker" appears only as a recognition name on the old homepage and
// in its full-bar press release; the old site gives no article link for it.
export const press: PressItem[] = [
  {
    outlet: "Angel Indian Restaurant",
    title: "Full Bar Service Launches at Angel Indian Restaurant",
    // The old site's own press release (/full-bar-launch); there is no equivalent page on this site yet.
    url: "https://www.angelindianrestaurant.com/full-bar-launch",
    brief: "Announces full bar service at 75-18 37th Avenue: wines, craft cocktails, beers and non-alcoholic options alongside the restaurant's 100% halal food.",
    date: "2026-01-02",
    precision: "day",
    kind: "feature",
    note: "Chef Amrit Pal Singh: “The addition of our full bar allows us to complete the dining experience. We're excited to offer our guests carefully selected beverages that complement our cuisine.”",
  },
  {
    outlet: "Resy Blog",
    title: "NYC Restaurants Where We Want to Be Regulars",
    url: "https://blog.resy.com/2025/12/nyc-restaurants-where-we-want-to-be-regulars/",
    brief: "“This spot from an Adda veteran is definitely heaven-sent, with its soulful biryani, vindaloos, samosa chaat, and Punjabi lassis.” The guide advises letting the staff steer you beyond butter chicken and garlic naan.",
    date: "2025-12-01",
    kind: "guide",
  },
  {
    outlet: "Yahoo Local",
    title: "Restaurant Relocation Announcement",
    url: "https://local.yahoo.com/info-239661510-angel-indian-restaurant-jackson-heights",
    brief: "Business listing for 75-18 37th Ave. One guest review reads: “It is definitely a more elevated take on Indian cuisine.”",
    date: "2025-10-01",
    kind: "feature",
  },
  {
    outlet: "Resy Blog",
    title: "NYC Restaurants - September 2025",
    url: "https://blog.resy.com/2025/01/nyc-restaurants-sept-2025/",
    brief: "“The food at Angel is seemingly simple and homespun, yet so complex and thrilling in the flavors that it yields.” Listed #11 on Resy's Hit List.",
    date: "2025-09-01",
    kind: "guide",
  },
  {
    outlet: "Indian Food Times",
    title: "Angel Indian Restaurant Opens New Branch in Jackson Heights, New York - A Michelin Recognized Culinary Dream by Chef Amrit",
    url: "https://indianfoodtimes.com/angel-indian-restaurant-opens-new-branch-in-jackson-heights-new-york-a-michelin-recognized-culinary-dream-by-chef-amrit",
    brief: "Chef Vikas Khanna, who inaugurated the new branch, said: “Angel is not just a restaurant — it's a dream brought to life with love, courage, and relentless passion.”",
    date: "2025-07-01",
    kind: "feature",
  },
  {
    outlet: "Resy Blog",
    title: "Best New Restaurant Openings - New York",
    url: "https://blog.resy.com/2025/06/best-new-restaurant-openings-new-york/",
    date: "2025-06-01",
    kind: "guide",
  },
  {
    outlet: "Condé Nast Traveller India",
    title: "12 Indian Michelin Guide Restaurants in the US",
    url: "https://www.cntraveller.in/story/12-indian-michelin-guide-restaurants-in-the-us/",
    date: "2024-01-01",
    precision: "year",
    kind: "guide",
    note: "“Plate after plate will demonstrate the real magic of going meatless.”",
  },
  {
    outlet: "Uber Eats",
    title: "Customer Reviews & Ratings",
    url: "https://www.ubereats.com/store/angel-indian-restaurant/Rh_eT--MTNOUr5P0-T1LCg",
    date: "2025-01-01",
    precision: "none",
    kind: "review",
    note: "“Food is always so fresh and flavorful and always hits the spot.” 4.7 stars (2,000+ ratings, 51 reviews).",
  },
  {
    outlet: "Hell Gate NYC",
    title: "Angel Indian Restaurant Review",
    url: "https://hellgatenyc.com/angel-indian-jackson-heights-review/",
    brief: "Chef Singh recalls living in Jackson Heights when “we did not have any quality food here.” Angel opened in fall 2019, named after his daughter; the critic's pick is the goat dum biryani.",
    date: "2024-01-01",
    precision: "year",
    kind: "review",
  },
  {
    outlet: "Medium",
    title: "Chef Amrit Pal Singh",
    url: "https://medium.com/@sameerkhan166/chef-amrit-pal-singh-f00befd85fa5",
    date: "2024-01-01",
    precision: "year",
    kind: "feature",
  },
  {
    outlet: "TrustTheCrowd",
    title: "Customer Reviews & Ratings",
    url: "https://trustthecrowd.com/food/us/new-york/angel-67672",
    date: "2024-01-01",
    precision: "year",
    kind: "review",
  },
  {
    outlet: "MapQuest",
    title: "Restaurant Listing & Reviews",
    url: "https://www.mapquest.com/us/new-york/angel-indian-restaurant-790156513",
    date: "2024-01-01",
    precision: "year",
    kind: "listing",
    note: "4.5 stars (25 reviews).",
  },
  {
    outlet: "The Infatuation",
    title: "Angel Indian Restaurant Review",
    url: "https://www.theinfatuation.com/new-york/reviews/angel-indian-restaurant",
    brief: "Rated 8.6. On the goat dum biryani: “That biryani alone is worth the hassle.” The tandoori dishes have “that distinctive smoky flavor and charr”.",
    date: "2024-01-01",
    precision: "year",
    kind: "review",
    note: "8.6 rating — standout goat dum biryani",
  },
  {
    outlet: "Time Out New York",
    title: "Best Indian Food in NYC",
    // The old site links this item to the TripExpert listing below; the Time Out article itself was not linked.
    url: "https://www.tripexpert.com/new-york-city/restaurants/angel-indian-restaurant",
    brief: "Aggregator listing showing a Google rating of 4.8 stars (3,209 reviews) and the Michelin Guide's Bib Gourmand entry: “The signature order is dum biryani.”",
    date: "2024-01-01",
    precision: "year",
    kind: "guide",
    note: "“No-frills-yet-beloved restaurant.”",
  },
  {
    outlet: "Chowhound",
    title: "Best Indian Food Restaurants in NYC",
    url: "https://www.chowhound.com/1935451/best-indian-food-restaurants-in-nyc/",
    brief: "Notes Angel's two Jackson Heights branches and its 2021 Michelin Bib Gourmand. The dishes are “bold and comforting”, and the goat dum biryani arrives “in a show-stopping manner”.",
    date: "2024-01-01",
    precision: "year",
    kind: "guide",
  },
  {
    outlet: "TripExpert",
    title: "Angel Indian Restaurant Listing",
    url: "https://www.tripexpert.com/new-york-city/restaurants/angel-indian-restaurant",
    brief: "Aggregator listing showing a Google rating of 4.8 stars (3,209 reviews) and the Michelin Guide's Bib Gourmand entry: “The signature order is dum biryani.”",
    date: "2024-01-01",
    precision: "year",
    kind: "listing",
  },
  {
    outlet: "Restaurantji",
    title: "Customer Reviews & Ratings",
    url: "https://www.restaurantji.com/ny/jackson-heights/angel-/",
    brief: "“Angel Indian restaurant is a top-notch Indian dining experience, offering an authentic atmosphere and exceptional service.”",
    date: "2024-01-01",
    precision: "year",
    kind: "review",
    note: "4.2 stars (497 reviews).",
  },
  {
    outlet: "Eater NY",
    title: "Best Jackson Heights Restaurants",
    url: "https://ny.eater.com/maps/best-jackson-heights-restaurants-food-queens-nyc/",
    date: "2024-01-01",
    precision: "year",
    kind: "guide",
  },
  {
    outlet: "Atly",
    title: "Angel Indian Restaurant Location Review",
    url: "https://www.atly.com/location/Angel",
    brief: "Rated 9.0 for North Indian food in Jackson Heights. One guest wrote: “I thought this food was the best Indian food I had ever tasted.”",
    date: "2024-01-01",
    precision: "none",
    kind: "listing",
  },
  {
    outlet: "Wheree.com",
    title: "Restaurant Listing & Information",
    url: "https://angel-2.wheree.com/",
    date: "2024-01-01",
    precision: "none",
    kind: "listing",
  },
  {
    outlet: "Eater NY",
    title: "NYC Best Dishes - March 2023",
    url: "https://ny.eater.com/2023/3/6/23617224/nyc-best-dishes-eater-march-2023",
    date: "2023-03-06",
    kind: "guide",
  },
  {
    outlet: "Culinary Backstreets",
    title: "Angel Indian Restaurant Feature - Queens",
    url: "https://culinarybackstreets.com/cities-category/queens/2022/angel-indian-restaurant/",
    brief: "Chef-owner Amrit Pal Singh's philosophy is captured in the phrase “simple but good.” Angel is one of two Indian restaurants with Michelin distinction in Queens.",
    date: "2022-01-01",
    precision: "year",
    kind: "feature",
  },
  {
    outlet: "YouTube",
    title: "Is This the Best Indian Food in Queens, NYC? (Angel, Jackson Heights)",
    url: "https://www.youtube.com/watch?v=amumrB9Fqzg",
    date: "2022-01-01",
    precision: "none",
    kind: "video",
  },
];
