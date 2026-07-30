# Setup Guide

End-to-end steps to take this project from a fresh clone to a live, indexable site — entirely on free tiers.

## 1. Firebase project (Spark / free plan)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project. The **Spark plan is the default** for new projects — do not upgrade to Blaze; nothing in this app needs it.
2. **Firestore**: in the left sidebar, go to *Build → Firestore Database → Create database*. Choose *Start in production mode* and pick a region close to your users. Production mode is fine because our security is enforced two ways: the `firestore.rules` file in this repo (public read of published articles only, all writes denied to clients), and the fact that all admin writes go through server-side API routes using the Admin SDK, which bypasses rules entirely.
3. **Deploy the security rules**: either paste the contents of [`firestore.rules`](firestore.rules) into *Firestore Database → Rules* in the console and click *Publish*, or install the Firebase CLI (`npm install -g firebase-tools`, `firebase login`, `firebase init firestore` pointing at this repo, then `firebase deploy --only firestore:rules`).
4. **Authentication**: go to *Build → Authentication → Get started*, and enable the **Email/Password** sign-in provider only. Do not enable any other provider, and never add a public sign-up form to this app (there isn't one) — this is what keeps the admin panel to a single account.
5. **Create your admin user**: in *Authentication → Users → Add user*, enter your own email and a strong password. This is the only account that will ever be able to log into `/admin`. There is no self-serve signup path in the app.
6. **Web app config** (for the public client SDK, used only for the admin login page): *Project settings (gear icon) → General → Your apps → Add app → Web*. Copy the `apiKey`, `authDomain`, `projectId`, and `appId` into `NEXT_PUBLIC_FIREBASE_*` env vars.
7. **Service account** (for `firebase-admin`, used server-side for everything else): *Project settings → Service accounts → Generate new private key*. This downloads a JSON file containing `project_id`, `client_email`, and `private_key`. Map these to `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`.
   - Keep the `\n` sequences in the private key literal when you paste it into `.env.local` or Netlify's env var UI (wrap the value in quotes) — the app converts them back to real newlines at runtime (`src/lib/firebase-admin.ts`).
   - **Never commit this file or its contents.** `.env*` is already gitignored.

## 2. Gemini API key (free tier)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in with a Google account.
2. Create an API key. This project uses the `gemini-1.5-flash` model, which has a generous free-tier quota - the pipeline is deliberately sequential with a delay between requests (`GEMINI_CALL_DELAY_MS` in `src/config/rss-feeds.ts`) to stay under free-tier rate limits.
3. Set `GEMINI_API_KEY` to this value.

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

- All `NEXT_PUBLIC_FIREBASE_*` values come from step 1.6.
- All `FIREBASE_ADMIN_*` values come from step 1.7.
- `GEMINI_API_KEY` comes from step 2.
- `CRON_SECRET`: make up a long random string (e.g. `openssl rand -hex 32`). This protects `/api/cron/fetch` from being triggered by anyone else.
- `NEXT_PUBLIC_SITE_URL`: your production URL once you have one (e.g. `https://learnaboutai.netlify.app` or your custom domain). Used in canonical URLs, JSON-LD, sitemap, and the RSS feed.
- `INDEXNOW_KEY`: make up another random string (e.g. `openssl rand -hex 16`). No manual key file is needed - `src/app/[indexnowFile]/route.ts` automatically serves this value at `/{INDEXNOW_KEY}.txt`, which is what IndexNow requires to verify ownership.

## 4. Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` to sign in with the admin user you created in step 1.5.

## 5. Deploy to Netlify (primary host)

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In the [Netlify dashboard](https://app.netlify.com), *Add new site → Import an existing project*, and pick this repo.
3. Netlify auto-detects Next.js and uses `@netlify/plugin-nextjs` (already declared in `netlify.toml` and installed as a dev dependency) to handle SSR/ISR/API routes on its free tier - no extra configuration needed.
4. Add every variable from `.env.local` under *Site configuration → Environment variables*. Set `NEXT_PUBLIC_SITE_URL` to the Netlify-assigned URL (or your custom domain, once connected).
5. Deploy. Netlify's free tier covers this project's traffic and build-minute needs comfortably for a new site.
6. **On-demand revalidation**: when you click *Publish* in `/admin`, the app calls `revalidatePath()` directly (see `src/app/api/admin/articles/[id]/publish/route.ts`) - Netlify's Next.js runtime supports this natively, so a full rebuild is never required just to publish an article.

### Backup host: Cloudflare Pages

If you ever need an alternative to Netlify:

1. Cloudflare Pages needs the [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) adapter to run a full Next.js app (SSR/ISR/API routes) rather than a static export - install it as a dev dependency and set the build command to `npx @cloudflare/next-on-pages`.
2. Set the same environment variables as in step 5.4 under *Workers & Pages → your project → Settings → Environment variables*.
3. Cloudflare Pages' free tier is generous (unlimited requests, 500 builds/month) and works well as a fallback if Netlify's limits ever become a concern.

## 6. Schedule the content pipeline

Pick **one** of the two options below (not both, to avoid double-processing a single run):

### Option A: cron-job.org (recommended, zero code)

1. Create a free account at [cron-job.org](https://cron-job.org).
2. Create a new cron job:
   - URL: `https://<your-site>/api/cron/fetch?secret=<your CRON_SECRET>`
   - Schedule: every 6 hours
   - Request method: GET
3. Save and enable it. Check the job's execution history after the first run to confirm a `200` response.

### Option B: GitHub Actions

This repo includes [`.github/workflows/fetch-cron.yml`](.github/workflows/fetch-cron.yml), which calls the same endpoint every 6 hours via `cron:`, plus supports manual triggering from the Actions tab.

1. In your GitHub repo, go to *Settings → Secrets and variables → Actions* and add:
   - `SITE_URL`: your deployed site URL (no trailing slash)
   - `CRON_SECRET`: the same value as your `CRON_SECRET` env var
2. The workflow runs automatically on its schedule once merged to the default branch. You can also trigger it manually via *Actions → Content Pipeline Cron → Run workflow*.

Either way, you can also trigger the pipeline manually any time from the **"Fetch now"** button on the `/admin` dashboard.

## 7. Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console) and add a property.
   - If you're using a custom domain, prefer the **Domain** property type (verifies the whole domain via a DNS TXT record you add at your registrar).
   - If you're on the Netlify-provided subdomain, use the **URL prefix** type instead, and verify via the HTML tag method (add the provided `<meta>` tag to `src/app/layout.tsx`'s `metadata.verification` field) or by uploading the provided HTML file into `public/`.
2. Once verified, go to *Sitemaps* in the left sidebar and submit: `https://<your-site>/sitemap.xml`.
3. Google will begin crawling on its own schedule; the `/{INDEXNOW_KEY}.txt` route and the automatic IndexNow ping on publish (`src/lib/indexnow.ts`) accelerate discovery for Bing/Yandex/other IndexNow-participating engines, but Search Console's sitemap submission is still the main lever for Google specifically.

## 8. Connect a custom domain

1. In Netlify: *Site configuration → Domain management → Add a domain*.
2. Follow Netlify's DNS instructions (either delegate the domain's nameservers to Netlify, or add the CNAME/A records it shows at your existing registrar).
3. Netlify provisions a free HTTPS certificate automatically once DNS propagates.
4. Update `NEXT_PUBLIC_SITE_URL` to the new domain and redeploy (or trigger a redeploy from Netlify) so canonical URLs, JSON-LD, sitemap, and RSS all reference the final domain.

## 9. Known non-blocking items

- `npm audit` reports vulnerabilities only in transitive/build-tooling dependencies (inside `firebase-admin`'s Google Cloud client libraries, and Next.js's own bundled dev tooling) - every suggested fix is a breaking major-version downgrade (e.g. Next.js 16 → 9), so none have been applied. Worth re-checking with `npm audit` periodically as upstream packages update.
- A real Lighthouse audit hasn't been run against this codebase (no Chrome available in the dev environment it was built in). Run `npx lighthouse https://<your-site> --view` once deployed, or use Chrome DevTools' Lighthouse panel, and address anything it flags - the codebase already follows the main practices it checks for (optimized fonts via `next/font`, `next/image` everywhere with explicit sizing to avoid layout shift, and server-rendered public pages with no client-side fetch waterfalls).

## 10. AdSense readiness checklist

See the "AdSense pre-application checklist" section in [README.md](README.md) for the full list of criteria to satisfy before applying.
