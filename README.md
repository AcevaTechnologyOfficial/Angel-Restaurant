# Angel Indian Restaurant

Restaurant website built with Next.js (App Router), TypeScript and Tailwind 4, with a MongoDB Atlas-backed menu and a private admin workspace. Routes: homepage, menu, story, gallery, private dining, visit, FAQ, press and privacy & terms, plus `/admin`.

## Documents

- [DESIGN_SPEC.md](./DESIGN_SPEC.md): read before building components. Global tokens and reusable styles live in `app/globals.css`.
- [CONTENT_REFERENCE.md](./CONTENT_REFERENCE.md): restaurant content and unresolved facts preserved from the previous site.
- [SQA.md](./SQA.md): speed, accessibility and security targets, plus dated inspection notes.
- [ADMIN_SETUP.md](./ADMIN_SETUP.md): menu/admin setup, environment variables, migrations and verification.
- `.env.example`: every environment variable the site reads.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI and ADMIN_ACCESS_KEY
npm run db:migrate           # creates indexes
npm run db:seed              # loads the original menu once
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Unit tests (`node --test`) |
| `npm run test:e2e` | Playwright browser tests; need `TEST_MONGODB_URI` and Microsoft Edge (see ADMIN_SETUP.md) |
| `npm run build` | Production build |
| `npm run db:migrate`, `db:seed`, `db:verify` | MongoDB indexes, one-time seed, verification against the original snapshot |

Fonts (Cormorant Garamond and Manrope) are self-hosted in `app/fonts` via `next/font/local`. Every route should provide `main#main-content` for the root skip link.

## Private dining enquiries

The form on `/private-dining` posts to a Server Action (`app/private-dining/actions.ts`). Each valid enquiry is saved to the `enquiries` collection first (`lib/enquiry-store.ts`) and reviewed in `/admin/enquiries`; a notification email is then sent through Resend when `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are set. If both saving and email fail, the form offers a prepared email instead. Submissions are rate limited per visitor through MongoDB (`lib/rate-limit.ts`).

## Ask Angel chatbot

A server-side Gemini assistant at `/api/chat`. Set `GEMINI_API_KEY` in the deployment environment; it is read only on the server and must never be given a `NEXT_PUBLIC_` prefix. Answers are closed-world: the route composes them from the knowledge base in `lib/chat/kb.ts` plus the current public menu, blocks out-of-scope, profane and unintelligible input before the model is called, and routes ordinary table reservations to the Resy listing in `lib/restaurant.ts`. Requests are limited per visitor per minute and per day, with a site-wide daily cap (`CHAT_DAILY_LIMIT`).

The gate and knowledge base run on the server only and are not meant to reach the browser bundle.

## Deploying

The site deploys on Vercel with MongoDB Atlas and Vercel Blob. See the production section of [ADMIN_SETUP.md](./ADMIN_SETUP.md) for required variables and the migration order.
