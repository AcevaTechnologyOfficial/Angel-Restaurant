import type { MetadataRoute } from "next";
import { restaurant } from "@/lib/restaurant";

// Vercel sets VERCEL_ENV to "production" only for the production deployment;
// preview/branch deployments get "preview" and local dev is undefined. Keeping
// previews out of the index prevents duplicate-content and unfinished-content
// leaks (the previous preview URL was publicly reachable — see plan finding S5).
const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin", "/api/chat"] },
    sitemap: new URL("/sitemap.xml", restaurant.siteUrl).toString(),
  };
}
