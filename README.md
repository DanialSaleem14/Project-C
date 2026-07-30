# Learn About AI

A production-ready AI news website with a semi-automatic content pipeline, built entirely on free-tier services: Next.js (App Router) + TypeScript + Tailwind, Firebase Spark plan (Firestore + Auth), Gemini API free tier for article generation, and Netlify free tier for hosting.

See [PLAN.md](PLAN.md) for the original implementation plan and phase breakdown, and **[SETUP.md](SETUP.md) for the full step-by-step deployment guide** (Firebase project setup, env vars, Netlify deploy, cron scheduling, Search Console, custom domain).

## Getting started (local dev)

```bash
npm install
cp .env.example .env.local   # fill in real values - see SETUP.md
npm run dev
```

Public site: `http://localhost:3000` · Admin login: `http://localhost:3000/admin/login`

## How it works

- **Public site** (`src/app/(public)`): SSR pages for Home, `/news/[slug]`, and `/category/[name]`, plus static About/Contact/Privacy/Terms pages. Every article page ships full JSON-LD `NewsArticle` schema, Open Graph/Twitter cards, a canonical URL, reading time, and related articles.
- **Admin panel** (`src/app/admin`, protected by Firebase Auth): dashboard with live counts, a drafts queue, a markdown editor with live preview, and one-click Publish (which revalidates affected pages and pings IndexNow).
- **Content pipeline** (`src/lib/pipeline.ts`): pulls RSS feeds (`src/config/rss-feeds.ts`), dedupes by URL hash + fuzzy title match, then generates original 600–900 word articles via Gemini, sequentially with rate-limit-friendly delays. Failed generations land in a retry queue. Runs via `/api/cron/fetch` (secret-protected, called by cron-job.org or the included GitHub Actions workflow) or the admin "Fetch now" button.
- All Firestore writes go through Next.js API routes using `firebase-admin` - `firestore.rules` denies all client writes, so there's no path for a compromised browser session to write to the database directly.

## Google Search Console setup

Full steps are in [SETUP.md § Google Search Console](SETUP.md#7-google-search-console): verify the property (domain or URL-prefix), then submit `https://<your-site>/sitemap.xml`. The site also auto-pings IndexNow on every publish for faster discovery by IndexNow-participating search engines.

## AdSense pre-application checklist

Work through this before submitting an AdSense application:

- [ ] **25+ published articles** live on the site (not drafts) - AdSense reviewers expect a real content library, not a shell site.
- [ ] All required static pages are complete with real copy: [About](src/app/(public)/about/page.tsx), [Contact](src/app/(public)/contact/page.tsx), [Privacy Policy](src/app/(public)/privacy/page.tsx), [Terms of Service](src/app/(public)/terms/page.tsx).
- [ ] A **custom domain** is connected (see [SETUP.md § 8](SETUP.md#8-connect-a-custom-domain)) - AdSense is stricter about approving free subdomains.
- [ ] The site has been **live and indexed** for some time (submitted to Search Console, with at least some pages showing as indexed) before applying - a brand-new, uncrawled site is a common rejection reason.
- [ ] Site navigation works cleanly on mobile (this site is mobile-first by default) and there's no broken imagery - every image goes through `next/image` with a real URL, never a broken/empty `src`.
- [ ] No placeholder/lorem-ipsum content anywhere - every static page in this repo already has real, complete copy for this reason.
- [ ] Empty ad-slot components (`src/components/ads/AdSlot.tsx`) are reserved but contain no fake ad content - fill them with real AdSense `<ins>` tags only after approval, using the correct dimensions already reserved for `leaderboard`, `in-article`, and `sidebar` variants.
- [ ] Privacy Policy discloses use of cookies/third-party advertising (already covered in the Privacy Policy's "Advertising and Google AdSense" section) - update it if you add other ad networks or analytics providers later.

## Known non-blocking items

- `npm audit` flags a few transitive dependencies (inside `firebase-admin`'s Google Cloud client libraries and Next.js's own bundled tooling) whose only "fix" is a breaking major-version downgrade - not applied. See [SETUP.md § 9](SETUP.md#9-known-non-blocking-items).
- No live Lighthouse run has been done yet (no Chrome available in the dev environment this was built in) - run one against your deployed URL and address anything it flags.
