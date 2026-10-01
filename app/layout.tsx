import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AnalyticsProviders } from "@/components/analytics-providers";
import "./globals.css";
import "./site.css";
import "./pages.css";
import { SiteChrome } from "@/components/site-chrome";
import { Footer } from "@/components/editorial";
import { restaurant } from "@/lib/restaurant";

const editorial = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin.woff2", weight: "300 600", style: "normal" },
    { path: "./fonts/cormorant-garamond-italic-latin.woff2", weight: "300 600", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const functional = localFont({
  src: "./fonts/manrope-latin.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

const description =
  "Authentic Indian cooking by Chef Amrit Pal Singh in Jackson Heights, Queens. Michelin Bib Gourmand recognition, 100% halal food, full bar. Tuesday–Sunday, 12 PM–10 PM.";

const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(restaurant.siteUrl),
  title: {
    default: "Angel Indian Restaurant | Jackson Heights, Queens",
    template: "%s | Angel Indian Restaurant",
  },
  description,
  keywords: [
    "Angel Indian Restaurant",
    "Indian restaurant Jackson Heights",
    "Indian restaurant Queens",
    "Indian restaurant Jackson Heights",
    "halal Indian food Queens",
    "tandoori chicken Queens",
    "biryani Jackson Heights",
  ],
  applicationName: restaurant.name,
  authors: [{ name: restaurant.name }],
  category: "restaurant",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: restaurant.name,
    title: "Angel Indian Restaurant | Jackson Heights, Queens",
    description,
  },
  // Deliberately just the card type here: leaving title/description off lets
  // Next's metadata resolver auto-fill twitter:title/description/image from
  // each page's own openGraph fields (see resolve-metadata.js `postProcessMetadata`).
  // Setting them here would be inherited by every route and block that auto-fill.
  twitter: {
    card: "summary_large_image",
  },
  // Only rendered when the env var is set (Search Console verification via a
  // meta tag). Verifying the domain via a DNS TXT record instead needs no code.
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f130d",
  colorScheme: "dark",
};

// Restaurant schema, sourced only from CONTENT_REFERENCE.md's verified facts.
// Do not add ratings, price range, payment methods, or menu items here without
// client confirmation — see CONTENT_REFERENCE.md "Client Information Required"
// for the specific old-site values (priceRange "$$", paymentAccepted, geo pin)
// awaiting sign-off.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: restaurant.name,
  url: restaurant.siteUrl,
  telephone: `+1${restaurant.phoneHref}`,
  email: restaurant.email,
  image: new URL("/angel/room-long-table.webp", restaurant.siteUrl).toString(),
  hasMenu: new URL("/menu", restaurant.siteUrl).toString(),
  servesCuisine: ["Indian"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "75-18 37th Avenue",
    addressLocality: "Jackson Heights",
    addressRegion: "NY",
    postalCode: "11372",
    addressCountry: "US",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "12:00",
      closes: "22:00",
    },
  ],
  acceptsReservations: true,
  potentialAction: {
    "@type": "ReserveAction",
    target: { "@type": "EntryPoint", urlTemplate: restaurant.resy, actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"] },
    result: { "@type": "Reservation", name: "Reserve a table" },
  },
  sameAs: [restaurant.instagram, restaurant.resy],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${editorial.variable} ${functional.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <a className="skip-link button button-primary" href="#main-content">
          Skip to content
        </a>
        <SiteChrome footer={<Footer />} analytics={isProduction && <AnalyticsProviders gaId={gaId} />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
