# Complete Automatic SEO Master Project — Implementation Report

**Site:** https://radhekrishanacab.com
**Project:** Radhe Krishna Cab (Next.js 16 App Router + Prisma + PostgreSQL)
**Date:** 23 November 2026
**Status:** Implemented in the existing project. Build + type-check pass (`npm run build` → exit 0, `npx tsc --noEmit` → exit 0).

> This report documents what was **actually implemented in code**. Nothing about the business
> (domain, WhatsApp number, prices, distances, reviews, ratings, locations) was invented or changed.
> Search-volume / competition / ranking numbers are **not** stated anywhere, because those require a
> keyword tool or Search Console access — they are flagged as "needs your data" instead.

---

## A. Website Audit (completed)

### What was found

| # | Problem found | Impact |
|---|---|---|
| 1 | Brand name inconsistent: `Radhe Krishana Cabs & Taxi Service` vs `Radhe Krishna Cab` in `layout.tsx`, `settings-service.ts`, DB seed defaults | Weak/duplicate brand entity signals |
| 2 | `metadataBase` not set | Relative OG images & canonicals resolved incorrectly |
| 3 | Canonical tags present on only 2 dynamic routes | Duplicate-content risk on all other pages |
| 4 | **Sitemap bug:** city pages were mapped to `/routes/{slug}` (wrong URL) and **every one of the ~13,110 route pages was missing** from the sitemap | Large searchable section effectively invisible to Google |
| 5 | No `og:*` / `twitter:*` tags at page level; no Twitter card type | Poor social/WhatsApp share previews |
| 6 | **Zero structured data** anywhere on the site | No rich results eligibility |
| 7 | No `googleBot` directives; no per-page `robots` | No control over snippet/image previews; no noindex capability |
| 8 | FAQ accordion removed answer text from the DOM when collapsed | FAQ content invisible to crawlers; FAQPage schema would be invalid |
| 9 | Admin `SeoSettings` table was write-only — nothing read it | Admin could "save SEO" but it had **no effect** on the live pages |

### What was fixed

All nine items above were fixed in code (details in sections F–I).

---

## B. Competitor Research (framework — needs your input for live numbers)

The named competitors were **CabBazar, Savaari, MakeMyTrip**. Their public pages cannot be scraped
reliably from this environment, and fabricating their metrics would be worthless to you, so this is
delivered as an executable comparison framework you (or I, with your approval + access) can fill in:

Collect per competitor (manual review of 5–10 of their Gujarat route pages):
1. **Title pattern** — e.g. `Taxi from {A} to {B} | Fare ₹X | {Brand}`; note length.
2. **H1/H2 structure** — do they use one H1 (route name) + H2s (fare table, why book, FAQ)?
3. **Route page depth** — distance, duration, fare table, vehicle list, FAQ count, word count.
4. **Local landing pages** — which cities get dedicated pages (Ahmedabad/Surat/Vadodara/Rajkot...).
5. **Schema types** used (view source → search `application/ld+json`).
6. **Internal linking** — related routes, city hub links, breadcrumbs.
7. **Content freshness** — blog cadence, dateModified.

**Where our site already matches or beats them:** dedicated route pages with fare tables, generated
travel guides, FAQ blocks, breadcrumbs, and (new) full structured data + sitemaps. **Where they may
lead:** brand-page depth, review volume, and inbound links — those are off-site and need your GSC/backlink data.

---

## C. Keyword Research Engine (implemented)

A working keyword system now exists in the admin, backed by the database:

- `SeoSettings` (page-level, `pageKey` unique) and `Route.seoKeywords` (route-level) store keywords.
- **SEO Settings screen** (`/admin/seo`): edit keywords per page and per route, with title/description
  character counters (green/amber/red) and a live Google preview.
- **Bulk SEO Generator**: generates unique route keywords for all eligible routes at once.
- **Export CSV** (`/api/admin/seo/export`, new): downloads every page + route SEO record
  (key, label, title, description, keywords, canonical, OG fields) — feed this straight into a keyword tool.
- **SEO Health panel** (new): automatically flags missing metadata, over/under-length titles &
  descriptions, and **duplicate page/route titles and descriptions** — i.e. live cannibalization detection.

Keyword *volumes and difficulty* are intentionally absent — add them from Keyword Planner / GSC in the CSV.

---

## D. Seed Keyword Expansion (implemented as deterministic patterns)

Instead of hand-typing keys, keywords are generated from the **real site structure** (route
origin/destination pairs, city names, vehicle names) via `src/lib/content-generator.ts`:
`generateRouteContent()` produces `seoTitle`, `seoDescription`, `seoKeywords`, route description,
travel guide, "why choose us" points and 6 route-specific FAQs — all derived from real route data
(distance, fares, vehicle names), never invented values.

Expansion patterns used (grounded in what the site actually offers):
`one way taxi {A} to {B}`, `{A} to {B} cab fare`, `{A} to {B} taxi service`, `outstation cab {city}`,
`airport taxi {city}`, `{vehicle} booking {city}`, `{city} taxi service`, `round trip cab {city}`.

---

## E. Keyword → Page Mapping (anti-cannibalization rules)

Rules applied so pages don't compete with each other:

1. **One primary intent per URL.** City hub = `taxi from {city}`; route page = `{A} to {B} taxi`;
   fleet page = `{vehicle} booking`; service page = service-type terms.
2. **Hub → spoke linking.** Route pages link up to their city hub (`/routes/city/{slug}`) and across to
   sibling routes ("More Cabs from {A}") — a crawlable, non-orphan structure.
3. **Duplicate detection is automated.** The SEO Health panel surfaces duplicate titles/descriptions so
   two pages can't silently target the same keyword set.
4. **Service × location pages are the focus** (airport transfer / outstation / one-way per served city) —
   the classic pattern that wins local taxi queries.
5. **No doorway/fake-location pages.** Only cities/routes that exist in the database get pages.

---

## F. On-Page SEO (implemented)

### New central module — `src/lib/site.ts`
Single source of truth: `SITE_URL`, `SITE_NAME` (`Radhe Krishna Cab`), phone/WhatsApp/email constants,
`absoluteUrl()`, `jsonLdHtml()` (escapes `<`), `pageMetadata()` (title + description + canonical +
keywords + Open Graph + Twitter + optional noindex), `PAGE_SEO_DEFAULTS` (canonical metadata for the 7
admin-managed pages), and JSON-LD builders (`organizationJsonLd`, `websiteJsonLd`, `localBusinessJsonLd`,
`breadcrumbJsonLd`, `faqJsonLd`, `serviceJsonLd`, `articleJsonLd`) plus `HOME_FAQS`.

### Every page now has
unique title + meta description, **canonical**, keywords, Open Graph, Twitter card, `index,follow`
(or controlled noindex), correct H1, and breadcrumbs.

### Admin-driven metadata is live — `src/lib/seo.ts`
`buildPageMetadata(pageKey, defaults)` reads the admin's `SeoSettings` row and overlays title /
description / keywords / OG / Twitter over the hard-coded defaults, falling back safely if the row is
missing or the DB is unreachable. The 7 managed pages (`/`, `/about`, `/services`, `/vehicles`,
`/routes`, `/faq`, `/contact`) were converted to `generateMetadata()` + `revalidate = 3600` (ISR — edits
appear within an hour without a rebuild, and pages stay cached for Core Web Vitals).

### Pages touched
`layout.tsx`, `page.tsx`, `about`, `services`, `vehicles`, `routes`, `faq`, `contact`, `blog`,
`blog/[slug]`, `routes/[routeSlug]`, `routes/city/[citySlug]`,
`explore-india/[stateSlug]/[districtSlug]/[placeSlug]`, `terms`, `privacy-policy`,
`components/home/FAQSection.tsx`, `lib/services/settings-service.ts`.

---

## G. Route SEO for ~13,110 Routes (automatic classification)

Rather than deleting anything, each route page is classified **at request time**:

| Class | Rule | Action |
|---|---|---|
| **Index** | Has a distance, or any vehicle fare, or an admin-written description | Full metadata, canonical, Service schema, FAQ schema, FAQ block |
| **Noindex** | No distance **and** no fare **and** no admin description (truly thin) | `robots: noindex, follow` — still crawlable, still linked, kept out of the index to avoid bloat |

Implemented in `src/app/routes/[routeSlug]/page.tsx`. **Nothing is deleted, redirected by guesswork, or
removed blindly.** Route pages that already carry real fare/distance data remain fully indexable.

> To produce the exact **counts per class** (Index / Improve / Noindex) you need a DB connection — see
> "Needs your action". The classification code itself is already deployed.

---

## H. Local SEO (implemented for real locations only)

- `localBusinessJsonLd()` uses `@type: ["LocalBusiness","TaxiService"]` with the real business phone,
  `priceRange: "₹₹"`, address country `IN`/region Gujarat, and `parentOrganization` → Organization.
- `AREA_SERVED` covers the cities the site actually markets: Ahmedabad, Surat, Vadodara, Rajkot, Bhuj,
  Dwarka, Somnath, Gujarat.
- City hub pages (`/routes/city/{slug}`) emit `Service` schema with `areaServed: [city]` and a
  city-specific title/description/H1/breadcrumb.
- **No fake offices, coordinates, or per-city LocalBusiness entities were created** — that would be
  doorway-page behaviour and is explicitly disallowed.

---

## I. Technical SEO, Structured Data, GSC, Admin System, Testing

### Technical SEO
- **Sitemap index:** `/sitemap.xml` (static pages + city hubs) plus dedicated sitemaps:
  `/routes/sitemap.xml` (~13k routes), `/blog/sitemap.xml`, `/explore-india/sitemap.xml`.
  All are `lastModified`-aware and wrapped so a DB outage returns `[]` instead of failing the build.
- **Sitemap bug fixed** (city pages correctly point to `/routes/city/{slug}`; route pages now included).
- **robots.txt:** `Disallow: /admin, /admin/, /api/`; `Sitemap:` lists all four sitemaps; `host` set.
- **Canonicals:** every page self-canonicalises via `pageMetadata()`.
- **Status codes:** unknown routes call `notFound()` (404); `/explore-india` **is now a real, indexable hub page** (it previously issued a bare `redirect('/routes')`, which orphaned the entire tourist-place cluster — every link to it landed on a redirect).
- **Mobile-first & crawlable links:** existing responsive layout kept; all navigation is real `<Link>` anchors.
- **Images:** `next/image` used; the OG/social image comes from the existing brand asset.

### Structured data (only what's eligible — no fake reviews/ratings)
- `Organization` + `WebSite` + `LocalBusiness/TaxiService` site-wide (in `layout.tsx`).
- `BreadcrumbList` on every key page; `Service` on services / route / city pages (`offers` built from
  **real** fares only); `BlogPosting` on blog posts; `FAQPage` on home, FAQ page and route pages
  (real Q&A only); `TouristAttraction` on tourist-place pages; `ItemList` on the `/explore-india` hub.

### Google Search Console (steps)
1. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<your-token>` (already wired — `layout.tsx` emits the meta tag when present).
2. In GSC: **Add property → URL prefix → https://radhekrishanacab.com**.
3. Verify (HTML tag auto-emitted, or DNS).
4. Submit all four sitemaps under **Sitemaps**.
5. Use **URL Inspection → Request Indexing** for the homepage, top city hubs and key routes.
6. Watch **Pages**, **Core Web Vitals**, and **Enhancements** (Breadcrumbs/FAQ/Service).
7. Once you have impressions data, export queries and copy them into the SEO CSV (`keywords` column) to enrich the mapping in section E.

### Admin SEO Management System
`/admin/seo` (session-guarded; changes require an authenticated admin):
- **SEO Health** panel (new) — missing metadata, title/description length issues, duplicate page &
  route metadata.
- **Page SEO** manager (title, description, keywords, OG title/description) with counters + Google preview + auto-canonical display.
- **Bulk Route SEO Generator** and **Individual Route SEO** editor.
- **Export CSV** (new) — full SEO inventory for keyword work.
- Every save goes through `PATCH /api/admin/seo` behind the admin-session guard (`requireAdmin`).

### Testing performed
- `npx tsc --noEmit` → **exit 0**.
- `npm run build` → **exit 0**; verified output includes `/sitemap.xml`, `/routes/sitemap.xml`,
  `/blog/sitemap.xml`, `/explore-india/sitemap.xml`, `/robots.txt`; static pages show `Revalidate 1h`.
- Build was also run with the database offline: pages still rendered using the hard-coded fallback
  metadata (proves the resilience path), and the build still succeeded.

---

## J. Second implementation batch (tourist cluster, sitemaps, mobile)

A follow-up pass focused on the user's items "optimize every … tourist destination page" and
"improve … internal linking / mobile performance".

| # | Change | Why it matters |
|---|---|---|
| 1 | **Restored `/explore-india` as a real page** — server component with `generateMetadata`, `revalidate = 3600`, data from `explore-service.ts`, and `ExploreIndiaClient` props wired (`places`, `states`, `categories`, filters) | The page previously only did `redirect('/routes')`, so the entire tourist-place section was **orphaned** — place-detail breadcrumbs and hub links all resolved to a redirect |
| 2 | Facet URLs (`?state=`, `?category=`, `?search=`, `?page=`) emit `robots: noindex, follow`; the clean `/explore-india` URL is self-canonical | Prevents thin duplicate facet pages while keeping them crawlable for link discovery |
| 3 | Added `ItemList` schema on the hub and `TouristAttraction` schema on every place page | Better entity understanding; places previously emitted only breadcrumbs |
| 4 | Added `/explore-india` to the **root sitemap**; added **"Tourist Places"** and **"Travel Blog"** to the footer quick links | The hub is now discoverable from every page (it had no site-wide internal link) |
| 5 | **Aligned `/routes/sitemap.xml` with the on-page classification** — only routes with a distance, description or an active fare are listed | Listing `noindex` URLs in a sitemap sends Google contradictory signals |
| 6 | Added a **`viewport`** export (`width`, `initialScale`, `themeColor`, `colorScheme`) in `layout.tsx` | Explicit mobile viewport + brand theme color |
| 7 | Added `revalidate = 3600` to the blog listing | New/edited posts appear without a rebuild, consistent with the other pages |
| 8 | Footer brand aligned to `Radhe Krishna Cab` (logo `alt` + copyright) | One canonical brand string across header, footer and structured data |

Verified after this batch: `npx tsc --noEmit` → **exit 0**, `npm run build` → **exit 0**, all four sitemaps
and `/explore-india` present in the build output.

---

## Needs your action (external access genuinely required)

| # | Item | Why it needs you |
|---|---|---|
| 1 | **Database reachability** — `npm run db:push` failed (`P1001: Can't reach database server ...neon.tech:5432`) | The Neon Postgres host is not reachable from this environment. Needed to: (a) run `npm run db:push` if you want a DB-editable **canonical override** column (schema change prepared but reverted until the DB is reachable, to avoid breaking queries on a missing column), and (b) produce the exact **13,110-route classification counts** in section G. |
| 2 | **Google Search Console** | Requires your Google account. Steps above; the verification tag is already wired via env var. |
| 3 | **Keyword volumes / difficulty** | Requires Keyword Planner / Ahrefs / GSC. The CSV export gives you the exact rows to fill. |
| 4 | **Deploy** | The changes are in the repo and build clean; pushing to production is yours to trigger. |

---

## Files changed

**New**
- `src/lib/site.ts`
- `src/app/routes/sitemap.ts`, `src/app/blog/sitemap.ts`, `src/app/explore-india/sitemap.ts`
- `src/app/api/admin/seo/export/route.ts`

**Modified**
- `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`
- `src/app/page.tsx`, `about/page.tsx`, `services/page.tsx`, `vehicles/page.tsx`, `routes/page.tsx`,
  `faq/page.tsx`, `contact/page.tsx`, `blog/page.tsx`, `blog/[slug]/page.tsx`,
  `routes/[routeSlug]/page.tsx`, `routes/city/[citySlug]/page.tsx`,
  `explore-india/page.tsx` (redirect → real hub page),
  `explore-india/[stateSlug]/[districtSlug]/[placeSlug]/page.tsx`, `terms/page.tsx`, `privacy-policy/page.tsx`
- `src/components/home/FAQSection.tsx`, `src/components/admin/SeoManager.tsx`, `src/components/layout/Footer.tsx`
- `src/app/admin/(dashboard)/seo/page.tsx`, `src/app/api/admin/seo/route.ts`
- `src/lib/seo.ts`, `src/lib/services/settings-service.ts`
