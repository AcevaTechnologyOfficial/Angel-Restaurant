# Angel Indian Restaurant

Dynamic menu/admin setup, deployment variables, migration commands and verification are documented in [ADMIN_SETUP.md](./ADMIN_SETUP.md).

Complete restaurant website built with Next.js App Router, TypeScript, and Tailwind 4. It includes the homepage, menu, story, experience gallery, private dining, visit, FAQ, and privacy & terms routes.

Before implementing components, read [DESIGN_SPEC.md](./DESIGN_SPEC.md). Restaurant content and unresolved facts are preserved in [CONTENT_REFERENCE.md](./CONTENT_REFERENCE.md). Global tokens and reusable styles live in `app/globals.css`; fonts are configured through `next/font` in `app/layout.tsx`.

Validation: `npm run lint`, `npm run build`, then `npx tsc --noEmit`. The site's licensed font files are stored in `app/fonts` and served locally. Every future route should provide `main#main-content` for the root skip link. The private-dining form is delivered server-side via a Server Action and Resend (see `app/private-dining/actions.ts`, `lib/enquiry.ts`); it falls back to a prepared email only if delivery fails or `RESEND_API_KEY` is unset. See `.env.example` for required environment variables.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Ask Angel chatbot

A server-side Gemini assistant at `/api/chat`. Set `GEMINI_API_KEY` in the deployment
environment; it is read only on the server and must never be given a `NEXT_PUBLIC_`
prefix. Answers are closed-world: the route composes them from the authoritative
knowledge base in `lib/chat/kb.ts` plus the current public menu, blocks out-of-scope,
profane and unintelligible input before the model is called, and routes ordinary table
reservations to the canonical Resy listing in `lib/restaurant.ts`.

`lib/chat/kb.ts` is the single canonical knowledge base (v1.8). The gate that reads it
runs on the server only, so the knowledge base never reaches the browser; see SQA.md
for the bundle check that enforces this.
