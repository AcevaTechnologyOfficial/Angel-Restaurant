import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const isPreview = process.env.VERCEL_ENV === "preview";

// Static (no-nonce) CSP: a nonce-based policy forces every page to render
// dynamically (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md),
// which this brochure site does not need. 'unsafe-inline' on script-src is required
// because Next emits inline RSC payload scripts on every page, and app/layout.tsx
// ships an inline Restaurant JSON-LD script.
// Do not add script hashes alongside 'unsafe-inline' — browsers drop 'unsafe-inline'
// the moment any hash or nonce is present, which would break Next's own inline scripts.
const previewToolbar = isPreview ? " https://vercel.live" : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com${previewToolbar}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://www.google-analytics.com https://www.googletagmanager.com${previewToolbar}`,
  `font-src 'self'${previewToolbar}`,
  "media-src 'self'",
  `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com${previewToolbar}`,
  `frame-src ${isPreview ? "https://vercel.live" : "'none'"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// TODO: this ships as Content-Security-Policy-Report-Only for the first deploy.
// After a browsing pass with no console violations (see plan verification steps),
// rename the header key below to "Content-Security-Policy" to enforce it.
const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  // Isolated browser runs use fresh databases and do not need a persistent compiler cache.
  ...(process.env.ANGEL_TEST_BUILD === "true" ? { experimental: { turbopackFileSystemCacheForDev: false } } : {}),
  distDir: process.env.ANGEL_TEST_BUILD === "true" ? ".next-e2e" : ".next",
  serverExternalPackages: ["mongodb", "sharp"],
  images: {
    // Optimized variants are re-generated from stable source files; keep them for 30 days.
    minimumCacheTTL: 2592000,
    // Vercel creates BLOB_READ_WRITE_TOKEN automatically, but does not provide a
    // build-time hostname. Keep optimization limited to public menu uploads.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/menu/**" }],
  },
  poweredByHeader: false,
  async headers() {
    // Files in public/ keep stable names, so they are cached for 30 days and revalidated
    // in the background rather than marked immutable; replace a file under a new name to
    // force an immediate change. Vercel's default for these is max-age=0 (recheck every visit).
    const staticCache = [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/angel/:path*", headers: staticCache },
      { source: "/videos/:path*", headers: staticCache },
    ];
  },
  async redirects() {
    return [
      // Old site (www.angelindianrestaurant.com) indexed URLs this build does not
      // reproduce 1:1. 308s (permanent: true) so search engines treat them as
      // permanent. See CONTENT_REFERENCE.md for provenance of each old route.
      { source: "/about", destination: "/story", permanent: true },
      { source: "/contact", destination: "/visit", permanent: true },
      { source: "/reservations", destination: "/visit#reserve", permanent: true },
      { source: "/37th-ave", destination: "/", permanent: true },
      { source: "/terms", destination: "/privacy", permanent: true },
      { source: "/full-bar-launch", destination: "/press", permanent: true },
    ];
  },
};

export default nextConfig;
