# Angel menu management

## What is implemented

The existing Next.js 16.3.5 App Router site and brown/gold design remain in place. `/admin` adds an access screen, overview, searchable menu table, reusable create/edit form, image uploads, confirmation dialog, analytics configuration/reporting links and settings. Public `/menu`, its JSON-LD, and the homepage dish showcase use the database. `/about` and `/contact` retain their existing redirects to `/story` and `/visit`.

The immutable migration snapshot is `db/original-menu.json`: **84 dishes, eight sections, six course filters, seven Chef Specials and eight previously featured plates**. Original names, prices, full-menu descriptions, dietary flags and separate featured descriptions are preserved. The two kulchas without individual photography use the existing illustrative kulcha photograph; replace these in the admin when photography is available. A regular dish can retain an existing featured image; ordinary regular dishes need none.

## Local setup

Use Node 24 LTS (minimum 22.18, for [native TypeScript script execution](https://nodejs.org/download/release/v22.18.0/docs/api/typescript.html)). Copy `.env.example` to `.env.local` and set `ADMIN_ACCESS_KEY` to at least 32 unpredictable characters. Generate a value with a password manager, or `node -p "require('node:crypto').randomBytes(32).toString('hex')"`. Never commit that value.

Set `MONGODB_URI` to an Atlas development connection string locally (or pull it
from Vercel), and leave Blob variables empty if you do not need upload testing.
Then run:

```sh
npm install
npm run db:migrate
npm run db:seed
npm run db:verify
npm run dev
```

Visit `/admin` and enter the configured key. Missing/short keys disable access; there is no default password or public development bypass. Menu data persists in MongoDB Atlas; local uploads persist in `.data/uploads` and are served through a filename-validated route when Blob is not configured.

Seed records its completion in the `migrations` collection. Re-running it does not overwrite edits or resurrect deleted dishes. `db:verify` compares original content, so run it immediately after initial migration, before restaurant edits. Do not edit the archived snapshot to manage the menu.

## Production setup

Provision MongoDB Atlas through the Vercel Marketplace and a public Vercel Blob
store. Atlas injects `MONGODB_URI` into the selected Vercel environments. No
cloud resources, accounts or deployments were created by this implementation.

Set these server environment variables before enabling the deployment:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Atlas connection string, injected by the Vercel MongoDB Atlas integration |
| `MONGODB_DB` | Optional database name; defaults to `angel-restaurant` |
| `ADMIN_ACCESS_KEY` | Temporary shared administrator key, minimum 32 random characters |
| `BLOB_READ_WRITE_TOKEN` | Server-only token for the public Blob store |
| `ADMIN_ORIGIN` | Optional canonical admin origin for reverse proxies; otherwise the incoming request URL origin is checked |
| `NEXT_PUBLIC_SITE_URL` | Existing public canonical domain |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional existing GA4 property ID |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Private dining notification email. Enquiries are always saved to the `enquiries` collection (see `/admin/enquiries`) even when these are unset; the email is best-effort |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Ask Angel chat assistant (server-only). `CHAT_DAILY_LIMIT` optionally changes the site-wide daily message cap (default 2000) |
| `DB_POOL_MAX` | Optional MongoDB connection pool size per instance; defaults to 3 |

Run `npm run db:migrate`, `npm run db:seed`, and `npm run db:verify` against the production database **before** switching traffic. The migration creates collection indexes, including the TTL index used for temporary login rate limits. No schema writes or seeding occur during visitor requests or builds.

MongoDB is required in every environment; there is no SQLite fallback. Vercel always requires MongoDB Atlas for menu and administrator data.

The database uses the official `mongodb` driver with `@vercel/functions` pool lifecycle support. `@vercel/blob` provides durable image storage and `sharp` performs image validation/re-encoding. There is no ORM or authentication provider.

## Data and publishing

MongoDB collections (types in `lib/database.ts`, indexes created by `npm run db:migrate` in `scripts/database.mts`): `categories`, `menu_items`, `media`, `enquiries` (private dining requests), `rate_limits` (TTL counters shared by admin login, chat and the enquiry form) and `migrations`. Prices are integer cents. Each menu item references its category by `categoryId`; the original vegetarian/non-vegetarian section distinctions are kept. Menu records include timestamps, sort order, regular/Chef Special type, publishing flags, image reference and dietary labels. `updatedAt` is used for optimistic concurrency checks. Rules such as "vegan implies vegetarian" and "Chef Specials need an image" are enforced in `lib/menu-validation.ts`, not by the database.

Flow: admin form → same-origin, server-authorized route → validation → database mutation → route revalidation → refreshed admin list/public server render. Create IDs prevent accidental duplicate submissions. Conflicting updates/deletes ask the editor to reload. Public records always require both `visible` and `available`; this applies to featured cards, homepage and structured data. Public menu reads are request-time, with React memoization only within a render, so there is no persistent stale menu cache. Previously open menu/homepage tabs refresh when they become visible; no constant polling is used.

## Images

Uploads go through the protected `/api/admin/uploads` endpoint. JPEG, PNG and WebP are limited to 4 MiB and 40 megapixels, decoded, oriented, stripped of metadata, resized to at most 1600×1600 and re-encoded as WebP. SVG and other formats are rejected. This limit stays below Vercel's server-upload request limit ([Vercel server uploads](https://vercel.com/docs/vercel-blob/server-upload)).

The immutable image URL is stored in `media`, and only registered URLs may be attached to dishes. Next Image continues to optimize presentation; remote access is restricted to public Vercel Blob URLs under `/menu/`. No separate Blob hostname setting is needed at build time. Replacing an image creates a new URL, preventing stale image-cache reuse. A failed upload leaves the previous selection intact. Preview/remove changes are published only when the dish is saved. Chef Specials and explicitly featured regular dishes require an image.

Old/replaced and abandoned uploads are retained rather than deleting a file that another editor may still be using. Storage garbage collection is an operational follow-up; URLs are not secrets, and hiding a dish does not revoke its public image URL.

## Analytics

The existing Vercel Analytics and optional GA4 are retained. `lib/analytics.ts` provides `trackEvent`; menu filters and homepage dish previews call it, and delegated link tracking captures reservation/directions/contact/call/WhatsApp clicks. Search terms, email addresses, telephone numbers and query strings are not sent. Admin routes are excluded, including after client-side navigation. Production collection respects Do Not Track; development dispatches `angel:analytics` DOM events for QA without sending provider traffic.

`/admin/analytics` honestly shows configuration states and links to provider reports. It does **not** claim to import traffic totals or historical records. Enable Web Analytics in Vercel; custom events may require the applicable Vercel plan. Configure GA4 and verify production events in its DebugView/realtime reports. Provider reporting APIs/credentials are needed to bring daily/weekly visitor counts, trends and device reports into this workspace. Browser blocking or privacy settings can prevent delivery; local event dispatch cannot establish provider receipt.

## Tomorrow's authentication work

Replace the temporary session implementation in `lib/admin-access.ts` and `/api/admin/session` with the chosen provider's session/role checks. All private reads and mutations use the shared authorization seam; replacing it does not require rewriting the menu system. Add administrator identities, restaurant roles, recovery, MFA and per-user auditing. Public visitors continue to need no account.

Temporary protection uses an eight-hour session: a random token in an HTTP-only, same-site cookie whose hash is stored in the `admin_sessions` collection (so signing out revokes it, and the login key is not used as a signing secret); secure cookies in production; constant-time key comparison; database-backed login throttling (HTTP 429); same-origin checks on mutations; and no secret in client code. Rotating the key blocks new logins, but existing sessions live until they expire or are signed out; to revoke all of them at once, empty the `admin_sessions` collection. Administrator actions (sign-ins, failed sign-ins, dish create/update/delete, uploads, enquiry status changes) are written to the `audit_log` collection and shown under Settings → Recent activity. A deleted dish's full record is kept in its audit entry so it can be re-created by hand. Image uploads are limited to 30 per hour. This is a temporary gate, not a finalized account system. Without Vercel's trusted client-IP header the login throttle deliberately uses a shared bucket.

## Verification and files

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Unit/integration tests cover validation, MongoDB migration fidelity and seed idempotence. MongoDB integration and Playwright tests require `TEST_MONGODB_URI` for a dedicated non-production Atlas cluster; each run uses a randomly named database. Playwright uses `.next-e2e` on port 3100. Tests use installed Microsoft Edge (`msedge`); change the channel or install that browser on CI. Browser tests cover public routes, responsive navigation, admin access, origin rejection, regular/Chef Special lifecycles, uploads/replacement and event dispatch. Screenshots/traces go to ignored `test-results`.

Main implementation groups:

- `app/admin`, `components/admin`: workspace routes, navigation, forms, list, dialog, states and styles.
- `app/api/admin`, `app/api/media`: protected mutations, temporary session, uploads and local image serving.
- `lib/database.ts`, `lib/menu-repository.ts`, `lib/menu-types.ts`, `lib/menu-validation.ts`, `lib/admin-access.ts`: data/access boundaries.
- `db/original-menu.json`, `scripts/database.mts`: preserved snapshot, index migration and seed commands.
- `lib/enquiry.ts`, `lib/enquiry-store.ts`, `lib/rate-limit.ts`, `app/admin/(workspace)/enquiries`: private dining enquiries, storage, inbox and shared rate limiting.
- `app/menu/page.tsx`, `app/page.tsx`, `components/menu-explorer.tsx`, `components/dish-showcase.tsx`: public data integration.
- `components/site-chrome.tsx`, `components/analytics-*`, `lib/analytics.ts`: public/admin shell separation and existing analytics integration.

Known deployment limitations: MongoDB Atlas and Vercel Blob need real credentials and live smoke tests; provider analytics delivery/import needs deployment verification; permanent authentication and upload garbage collection remain separate work. Category management is intentionally deferred.
