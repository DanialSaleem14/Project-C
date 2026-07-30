# Learn About AI — Implementation Plan

A production-ready AI news website with a semi-automatic content pipeline, built entirely on free-tier services.

## 0. Ground rules

- **Every service is free tier.** Firebase Spark, Gemini API free tier, Netlify free tier, cron-job.org, GitHub Actions (public repo), IndexNow (free), Google Search Console (free).
- **No Cloud Functions, no Firebase Storage.** All server logic lives in Next.js API routes (Netlify Functions under the hood), using `firebase-admin` for privileged Firestore access. Images are URL-only (source article image or Unsplash URL) — never uploaded/stored as files.
- **TypeScript strict, no `any`.**
- Each phase ends with a working `npm run build` (and where relevant, a manual smoke test) before moving to the next phase.
- This repo will be initialized as its own git repository scoped to this project folder (not the home directory, which currently has an unrelated top-level `.git`). I'll do `git init` here only — I will not touch anything outside this folder.

---

## 1. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Data | Firestore (Firebase Spark/free plan) |
| Auth | Firebase Auth (email/password), admin-only |
| Server logic | Next.js Route Handlers (`app/api/**`) using `firebase-admin` |
| LLM | Gemini API free tier, `gemini-1.5-flash` (or current flash alias) |
| RSS parsing | `rss-parser` |
| Markdown | `react-markdown` + `remark-gfm` for render; `react-md-editor` (or similar) for admin live preview |
| Sitemap | `next-sitemap` |
| Hosting | Netlify (primary), Cloudflare Pages (documented backup) |
| Scheduling | cron-job.org hitting a secured API route; GitHub Actions workflow as alternative |
| Indexing | IndexNow ping on publish; Google Search Console manual setup (documented) |

---

## 2. Firestore data model

### `articles` collection
```
{
  id: string (doc id = slug)
  title: string
  slug: string
  excerpt: string
  markdown: string
  category: "llms" | "ai-tools" | "research" | "business" | "tutorials"
  tags: string[]
  seoTitle: string
  metaDescription: string
  featuredImageUrl: string
  sourceUrl: string          // original article link, for attribution
  sourceName: string         // e.g. "TechCrunch"
  status: "draft" | "reviewed" | "published" | "rejected"
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt: Timestamp | null
  readingTimeMinutes: number
  urlHash: string            // sha256 of source URL, for dedupe
  titleNormalized: string    // lowercased/stripped, for fuzzy dedupe
}
```

### `fetchQueue` collection (retry/failure tracking)
```
{
  id: string
  sourceUrl: string
  sourceName: string
  rawTitle: string
  rawSummary: string
  urlHash: string            // sha256 of source URL, so a failed item is updated in place on retry
  status: "pending" | "processing" | "failed" | "done"
  attempts: number
  lastError: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `fetchRuns` collection (observability for dashboard "fetched today")
```
{
  id: string (auto)
  startedAt: Timestamp
  finishedAt: Timestamp | null
  itemsFound: number
  itemsNew: number
  itemsFailed: number
  trigger: "cron" | "manual"
}
```

### `siteMeta` collection (singleton doc `config`)
```
{
  indexNowKey: string
  lastSitemapPing: Timestamp | null
}
```

---

## 3. Firestore security rules (`firestore.rules`)

- Public read: `articles` where `status == "published"` only (all other statuses/collections unreadable publicly).
- All writes (any collection): denied to public; only the Admin SDK (server-side, using a service account, which bypasses rules entirely) can write. Client-side Firebase Auth is used only for the admin panel's login UI — the actual privileged reads/writes for admin pages go through **API routes** authenticated via a verified Firebase ID token, not direct client Firestore writes. So rules can be simple and safe by default-denying all client writes.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /articles/{articleId} {
      allow read: if resource.data.status == 'published';
      allow write: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 4. Environment variables (`.env.example`)

```
# Firebase client (public, safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase admin (server only, secret)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Gemini
GEMINI_API_KEY=

# Cron security
CRON_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=https://learnaboutai.example.com

# IndexNow
INDEXNOW_KEY=
```

---

## 5. Phase-by-phase build order

**Phase 1 — Scaffold & config**
Next.js + TS + Tailwind init, folder structure, ESLint, `.env.example`, Firebase client + admin SDK init modules, `firestore.rules`, README skeleton. Build check: `npm run build` succeeds on a blank home page.

**Phase 2 — Public site core (SEO-critical)**
Layout, Home (SSG/ISR latest articles grid), `/news/[slug]` article page (SSG + ISR, JSON-LD NewsArticle, OG/Twitter cards, canonical, reading time, related articles), `/category/[name]` pages. Ad-slot placeholder components (empty, clearly marked). Static pages: About, Contact, Privacy, Terms (full real copy). Test against a few manually-seeded Firestore docs.

**Phase 3 — Admin auth & shell**
Firebase Auth email/password client login page at `/admin/login`, protected `/admin` layout (client-side guard + server-side ID-token verification on API routes), documented steps to create the one admin user via Firebase Console. No public signup path anywhere.

**Phase 4 — Admin content management**
Dashboard (counts by status, fetched-today from `fetchRuns`), drafts queue table with status filters, markdown editor with live preview, save/update article, Publish action (sets `publishedAt`, triggers ISR revalidation + sitemap ping + IndexNow ping).

**Phase 5 — Content pipeline**
`lib/rss-config.ts` (editable feed list), `/api/cron/fetch` route (secret-protected): fetch feeds → dedupe (URL hash + fuzzy title match against Firestore) → sequential Gemini calls with delay/backoff → strict JSON parsing/validation → save as `draft`, failures to `fetchQueue` for retry. Manual "Fetch now" button in admin calls the same route. GitHub Actions workflow (`.github/workflows/fetch-cron.yml`) as alternative scheduler, plus cron-job.org setup docs.

**Phase 6 — Indexing/SEO infra**
`next-sitemap` config (dynamic articles included via server-side sitemap generation, since content is in Firestore not the filesystem), `robots.txt`, IndexNow key file + ping-on-publish, `/feed.xml` RSS route.

**Phase 7 — Polish & production readiness**
Lighthouse pass (image optimization, font loading, CLS checks), error boundaries/404, final `npm run build` + `next-sitemap` postbuild verification, Netlify config (`netlify.toml`, `@netlify/plugin-nextjs`), Cloudflare Pages notes.

**Phase 8 — Docs**
`SETUP.md` (Firebase project creation on Spark plan, Firestore + Auth setup, admin user creation, env vars, Netlify deploy, cron-job.org config, Search Console verification + sitemap submission, domain connection) and an AdSense pre-application checklist appended to README.

---

## 6. Key technical decisions worth flagging

1. **Sitemap with dynamic Firestore content**: `next-sitemap`'s default static-route crawl won't see Firestore articles. I'll use its `additionalPaths`/server-side sitemap hook (calling Firestore at build/ISR time) so published articles are included without needing Cloud Functions.
2. **Revalidation on publish**: Using on-demand ISR (`revalidatePath`) from the publish API route rather than a rebuild, since Netlify + Next.js App Router supports on-demand revalidation without extra infra.
3. **Admin writes never go client → Firestore directly.** All admin mutations go through Next.js API routes that verify a Firebase ID token server-side then use `firebase-admin`. This lets Firestore rules stay locked-down (`allow write: if false`) while still supporting a normal-feeling admin UI.
4. **Gemini rate limits**: process RSS items strictly sequentially per cron run with a delay between calls (configurable, default a few seconds), cap items per run, and route failures to `fetchQueue` with attempt counts for later retry rather than blocking the whole run.
5. **Dedupe**: exact dedupe via SHA-256 hash of the canonical source URL; fuzzy dedupe via normalized-title comparison (lowercase, strip punctuation, compare token overlap) against recent articles, to catch the same story re-published across multiple feeds.

---

## 7. Open questions for you

Nothing blocking — I made reasonable calls above (documented in §6) rather than stall on them. Flagging in case you want to redirect before I start:

- Site domain / brand name to bake into SEO defaults, OG images, etc. — placeholder for now, easy to swap later.
- Any preference on markdown editor library for the admin panel (I'll default to `@uiw/react-md-editor`, MIT-licensed, no paid tier)?

Once you approve this plan, I'll start Phase 1.
