# iSard — Technical SEO, GEO & CRO Audit

**Site:** https://www.isard.app · **Audited:** 2026-08-07 · **Stack:** static site (`public/`) on Vercel; per-race pages + sitemap generated at build time by `scripts/build-races.js`.

This document separates **[DONE]** changes already implemented in this branch from **[REC]** recommendations that need product/content/design decisions. Evidence is drawn from the repository and the live deployment.

---

## 1. Executive summary

iSard is a **pre-launch** iOS outdoor-sports app (waitlist via a Brevo iframe; `/get` still uses a placeholder App Store URL — `isard.app`) paired with an already-substantial **race directory** (1,675 future events across Spain + Andorra, 3 languages). The engineering foundation is unusually good for a pre-launch site: **race-detail pages are server-rendered with valid `SportsEvent` JSON-LD, canonicals, OG and H1s.** That is the hard part and it is already right.

The value is being lost at three chokepoints:

1. **The two most linkable pages — the homepage and the race calendar — were nearly invisible to crawlers and AI engines.** The homepage was thin (an English `<title>` on a `lang="es"` page, no canonical/OG/schema, only an iframe) and the calendar was an empty `<div id="rc-root">` with no server-rendered content, heading, canonical or schema. Both are now fixed in this branch.
2. **Host duplication:** both `isard.app` and `www.isard.app` returned `200`, splitting signals; canonicals/sitemap used non-www while the footer used www. Now unified on **www** with a 308 redirect.
3. **Trust/freshness signals for the directory are not yet surfaced** (`lastVerifiedAt` is empty across records; most events are `announced`/`unverified`). This is the single biggest lever for both Google trust and AI citeability, and it is a data/editorial task, not a code task.

The strategy is not to mass-produce URLs. It is to make the ~5 hub pages excellent, surface verification/freshness, and add a handful of high-intent sport/location hubs on top of the existing (good) event pages.

---

## 2. Current technical baseline (verified)

| Area | Finding | Source |
|---|---|---|
| Framework | None. Static HTML in `public/`, vanilla JS. Build = `node scripts/build-races.js`. | `package.json`, `vercel.json` |
| Rendering | Race **detail** pages: SSR HTML + JSON-LD. Homepage: thin + iframe. Calendar: **empty client-rendered root**. | live `curl`, `public/race-calendar/index.html` |
| Host | `isard.app` **and** `www.isard.app` both returned `200` (no canonical host). HTTP→HTTPS 308 OK. | live `curl -I` |
| Nav / internal links | Header nav (incl. the only link to `/race-calendar`) is **injected by `header.js`** → invisible to non-JS crawlers. | `public/js/header.js` |
| Sitemap | Single flat file, 1,680 URLs, **no `lastmod`**, non-www host. | live `/sitemap.xml` |
| Data | 1,675 races, scope `2026-08-01 → 2028-02-29`, ES+AD. Rich model: `status`, `dateStatus`, `confidence.verification`, `seriesId`, `updatedAt`, `lastVerifiedAt` (empty), `popularity`. Status split: announced 1289 / confirmed 377 / registration_open 9. | `public/data/*`, `manifest.json` |
| Structured data | `SportsEvent` valid on race pages. No `Organization`/`WebSite`/`MobileApplication`, no `Breadcrumb`, no calendar schema. | `scripts/build-races.js` |
| i18n | ES/CA/EN via client-side JS + `?lang=` + localStorage. No independent server-rendered localized URLs. `hreflang` points at `?lang=` variants whose canonical points back to the clean URL (conflicting). | `public/js/i18n.js`, build `altLinks()` |
| App status | Pre-launch, iOS. Homepage = waitlist. | `public/index.html`, `public/get/` |

---

## 3. Prioritized issue table

| # | Issue | Impact | Effort | Status |
|---|---|---|---|---|
| 1 | No canonical host (`www` vs non-`www` both 200) | Critical | S | **[DONE]** 308 redirect → www + all URLs unified |
| 2 | Homepage: `lang=es` + English title/desc, no canonical/OG/schema, thin | Critical | S | **[DONE]** |
| 3 | Race calendar: empty client-rendered root, no SSR content/H1/canonical/schema | Critical | M | **[DONE]** SSR heading+intro+noscript, canonical/OG, CollectionPage+Breadcrumb |
| 4 | Internal nav injected by JS only (no crawlable link graph from homepage) | High | S | **[DONE]** real `<a>` links to calendar + alerts added to homepage body |
| 5 | Sitemap has no `lastmod` | High | S | **[DONE]** per-race `lastmod` from `updatedAt` |
| 6 | Race pages: no `BreadcrumbList`, no `description`/`inLanguage`/`eventAttendanceMode` in schema | High | S | **[DONE]** |
| 7 | `hreflang` targets `?lang=` URLs that self-canonicalize elsewhere (conflicting signals) | High | L | **[REC]** move to `/es//ca//en/` server-rendered dirs (Phase 2) |
| 8 | No freshness/verification surfaced (`lastVerifiedAt` empty; most `unverified`) | High | M | **[REC]** data/editorial — see §7 |
| 9 | No sport/location hub pages (running/trail/cycling/hiking × region) | High | M | **[REC]** — see §6, §13, §14 |
| 10 | `/race-alerts` does a client-side `localStorage` redirect (cloaking-ish, flstyle) | Medium | M | **[REC]** serve one canonical page; localize in place |
| 11 | OG image is the app icon (no per-page share image) | Medium | M | **[REC]** generate race/hub OG images (Phase 3) |
| 12 | No breadcrumbs UI on race pages (only schema) | Medium | S | **[REC]** render visible breadcrumb (uses existing back-link) |
| 13 | Thin/near-duplicate race pages (aggregated distances, unverified) risk indexation bloat | Medium | M | **[REC]** indexing thresholds — see §7 |
| 14 | No `Organization`/`WebSite`/`MobileApplication` entity graph | Medium | S | **[DONE]** on homepage |
| 15 | Consent iframe + Brevo form are the LCP/CLS risk on homepage | Low | M | **[REC]** lazy-load iframe below the fold, reserve height |

---

## 4. Top 10 highest-impact technical fixes

1. **[DONE] Enforce one host.** `vercel.json` now 308-redirects `isard.app/*` → `https://www.isard.app/*`; `SITE` constant, sitemap, robots, canonicals and JSON-LD all use www.
2. **[DONE] Make the homepage indexable & coherent.** Spanish `<title>`/description matching `lang="es"`, self-canonical, full OG/Twitter, and an `Organization + WebSite + MobileApplication` `@graph`.
3. **[DONE] Server-render the calendar.** Persistent `<h1>` + intro + `<noscript>` above `#rc-root`, plus `CollectionPage` + `BreadcrumbList` JSON-LD and canonical/OG.
4. **[DONE] Give crawlers a link graph.** Real `<a href="/race-calendar">` / `/race-alerts` in the homepage body (previously nav was JS-only).
5. **[DONE] Sitemap `lastmod`** from each race's `updatedAt` (and build date for hubs).
6. **[DONE] Breadcrumb + richer `SportsEvent`** (`description`, `inLanguage`, `eventAttendanceMode`, `image`) on every generated race page.
7. **[REC] Real localized URLs** `/es/`, `/ca/`, `/en/` with reciprocal `hreflang` + `x-default`, replacing the `?lang=` scheme (§8).
8. **[REC] Sport & location hub pages** server-rendered from the same data pipeline (§7, §13, §14).
9. **[REC] Segment the sitemap** into a sitemap index (`sitemap-races.xml`, `sitemap-hubs.xml`, `sitemap-static.xml`) once hubs exist; keep only indexable, above-threshold URLs.
10. **[REC] Fix `/race-alerts` rendering** — replace the JS `localStorage` redirect with one canonical page localized in place (avoid soft-cloaking + redirect chains).

---

## 5. Top 10 GEO / AI-search opportunities

AI engines (ChatGPT, Claude, Perplexity, Gemini, AI Overviews, Copilot) reward **server-rendered, chunked, dated, attributed** facts and clear entity identity. iSard's advantage is structured, verifiable event data.

1. **[DONE] Entity clarity** — the homepage now states, in plain server-rendered HTML, what iSard is, what sports it covers, and how the app + calendar relate (a direct-answer block + `Organization`/`MobileApplication` schema).
2. **[REC] Per-race "answer" facts** — render a short server-side summary sentence per race ("*{name} is a {sport} race in {municipality}, {province}, on {date}, distances {…}. Registration: {status}.*") so models can extract one clean chunk.
3. **[REC] Surface provenance** — a visible "Source: {source} · Last checked: {date}" line per race (data exists as `firstSeenAt`/`updatedAt`; add `lastVerifiedAt`). Provenance + dates are the strongest citeability signals.
4. **[REC] `/about` + `/methodology`** pages: who maintains the calendar, where data comes from, how events are verified, how often. This is what AI engines cite as the "trust" source.
5. **[REC] Sport/location hub pages** answer the exact prompts you listed ("trail races in Catalonia", "cycling events this month") with a server-rendered list + intro.
6. **[REC] `EventSeries` pages** — annual editions grouped under one stable entity so "the {race} 2027" resolves to a durable URL that updates each edition.
7. **[REC] Consistent naming** — expose `canonicalName` + official-language name; keep official race names untranslated (already modeled via `names`/`canonicalName`).
8. **[REC] Visible, minimal FAQ** on hubs only where it genuinely answers ("When is registration open?", "How verified is this list?") → `FAQPage` on those.
9. **[REC] `llms.txt`: low priority.** It has no confirmed retrieval benefit at any major engine today; a clean XML sitemap + server-rendered HTML + schema does more. If added, treat it as a courtesy index, not a ranking lever. **Do not** invest here before §7/§8.
10. **[DONE, partial] Machine-readable locale** — `inLanguage` added to schema; complete once real `/es//ca//en/` URLs exist so each locale is independently retrievable.

---

## 6. Top 10 content opportunities

Threshold rule for every hub: **index only if it has ≥ ~8 upcoming, dated events** and a unique intro; otherwise `noindex,follow` (still linked, not in sitemap).

| # | Cluster | Intent | ES / CA / EN keyword | Page type | Funnel | CTA |
|---|---|---|---|---|---|---|
| 1 | Running calendar Spain | trans | "carreras populares España" / "curses populars" / "running races Spain" | Sport hub | ToFu | → alerts |
| 2 | Trail running Catalonia | trans | "carreras trail Cataluña" / "curses de muntanya Catalunya" / "trail races Catalonia" | Sport×Loc hub | ToFu | → alerts |
| 3 | Cycling events Spain | trans | "marchas cicloturistas" / "marxes cicloturistes" / "gran fondo Spain" | Sport hub | ToFu | → alerts |
| 4 | Hiking marches Catalonia | trans | "caminadas populares" / "caminades populars" | Sport×Loc hub | ToFu | → alerts |
| 5 | Races in Andorra | trans | "carreras Andorra" / "curses Andorra" / "races Andorra" | Loc hub | ToFu | → alerts |
| 6 | Distance hubs (5K/10K/half/marathon/ultra) | trans | "media maratón {mes}" / "mitja marató" / "half marathon Spain" | Distance hub | MoFu | → alerts |
| 7 | Registration-open now | comm | "carreras inscripciones abiertas" | Filtered hub | MoFu | → external reg |
| 8 | This weekend / this month | trans | "carreras este fin de semana" | Freshness hub | MoFu | → alerts |
| 9 | Province / city pages | trans | "carreras Barcelona" / "curses Girona" | Loc hub | ToFu | → alerts |
| 10 | How-to (record a run / hiking route / 3D route video / share routes) | info | "cómo grabar una ruta GPS" / "com gravar una ruta" / "how to make a 3D route video" | Guide | ToFu→app | → waitlist |

The how-to cluster (#10) is where the **app** (not the calendar) converts, and where iSard can own distinctive queries (3D route-replay video) that Strava/Wikiloc/Komoot don't target directly.

---

## 7. Recommended race-page lifecycle & indexing policy

Drive this from existing fields (`status`, `dateStatus`, `date`, `endDate`, `confidence.verification`, `seriesId`). Emit a `robots` meta + sitemap-inclusion flag per state:

| State (derive from data) | `<meta robots>` | In sitemap? | Canonical / action |
|---|---|---|---|
| Confirmed future, verified | index,follow | ✅ | self |
| Future, date TBC (`dateStatus!=confirmed`) | index,follow | ✅ | self; show "date to be confirmed" |
| **Unverified & thin** (`confidence.verification=unverified` AND no links/organizer/distances) | **noindex,follow** | ❌ | self; keep crawlable, exclude until enriched |
| Postponed | index,follow | ✅ | self; `eventStatus=EventPostponed`, add `previousStartDate` |
| Cancelled | index,follow | ✅ | self; `eventStatus=EventCancelled`, keep page (users still search it) |
| Sold out | index,follow | ✅ | self; `offers.availability=SoldOut` |
| Recently completed (≤ ~90 days) | index,follow | ✅ | self; add results link if present, link to next edition |
| Historic edition (older) | index,follow | ❌ (or in an archive sitemap) | canonical to the **series** page if one exists; else self as archive |
| Duplicate record (same `seriesId`+date, variant spelling) | noindex | ❌ | canonical → the preferred duplicate |
| Permanently discontinued | — | ❌ | `410 Gone` (only if it never returns); else keep as archive |

**Never auto-delete historic URLs.** Prefer: update to next edition → preserve edition archive under a series page → `noindex` → `410` only for truly dead events. Implement all of this in `scripts/build-races.js` (template-level), never by hand-editing generated pages.

**Minimum threshold to index a race page:** has a real `date` (or credible `expectedYear`) **and** at least one of {official/registration link, organizer, ≥1 distance}. Everything else stays `noindex,follow` until enriched.

---

## 8. Recommended multilingual URL architecture

> **[DONE — race pages + homepage + calendar]** The build emits `/{es,ca,en}/races/{slug}/` **and** localized `/{es,ca,en}/` (homepage) + `/{es,ca,en}/race-calendar` — each server-rendered in-language (translated headings/content, `<html lang>`, localized `SportsEvent`/`BreadcrumbList`, localized `<title>`/description/OG), self-canonical, reciprocal `hreflang` + `x-default → /es/`. The homepage/calendar are localized by transforming their existing source HTML at build time (inline CSS/markup preserved; only head SEO tags, `<html lang>`, `/race-calendar` links and `[data-i18n]` leaf text rewritten). Legacy `/races/{slug}/`, `/` and `/race-calendar` are kept (no 404s for indexed URLs / inbound links) but canonicalise to their `/es` version. All client JS is **path-aware** (`?lang` → path prefix → localStorage → es) so localized pages hydrate in-language instead of reverting to Spanish; the **header nav** links home + calendar with the current locale prefix (active-state is prefix-tolerant); the calendar links to language-prefixed race URLs; and both the race-page and calendar language switchers **navigate to the sibling locale URL**. Sitemap lists every locale URL with `<xhtml:link>` alternates (races + homepage + calendar); legacy URLs excluded. **Still [REC]:** localize the utility/funnel pages (`/contact`, `/privacy` — 155 nested-HTML `data-i18n` nodes; `/race-alerts` — its own variant system) into the prefix scheme, then flip legacy `/races/*`, `/` and `/race-calendar` to `301 → /es/*` as the final cutover. Verified: build (6,700 race pages + 6 localized static, 2.2s), per-locale HTML, no duplicate hreflang, valid JSON-LD, balanced sitemap (5,034 URLs), and browser hydration of `/ca/` home + `/en/race-calendar` with correct nav, in-language list, working language-switch navigation, and 0 console errors.

**Move from `?lang=` to path prefixes.** Recommended: `/es/…`, `/ca/…`, `/en/…` sub-directories (not subdomains — cheaper authority consolidation), each **server-rendered** by the build.

- `x-default` → `/es/` (primary market) or a language-selector landing.
- Reciprocal `hreflang` between the three real URLs; each self-canonical.
- Race pages become `/{lang}/races/{slug}` generated in the existing loop (the render module already takes a `lang` argument — low incremental cost).
- Keep the current clean URLs as `/es/` (301 old → new, or serve `/` = `/es/`), so no history is lost.

Why now vs later: the `?lang=` `hreflang` currently conflicts with the self-canonical, so Google ignores it. This is **Phase 2** (needs a redirect map + regenerating the tree). Until then, the code keeps a single canonical per URL (correct) and the `?lang=` alternates do no harm.

Migration safety: generate the new tree behind the same build, add 301s from old → `/es/…`, submit updated sitemaps, keep the old sitemap live for ~30 days.

> **[CUTOVER DONE — race pages + homepage + calendar]** `vercel.json` now 301-redirects the legacy URLs onto their canonical locale versions: `/ → /es/`, `/race-calendar → /es/race-calendar`, `/races/:slug* → /es/races/:slug*` (all `permanent`, on top of the existing `isard.app → www` host redirect). Legacy `/races/{slug}` pages are **no longer generated** (the build removes the old `public/races/` tree); the redirects consolidate old inbound links and indexed URLs onto the localized pages. Internal links were repointed to final URLs to avoid redirect hops and language mismatches: the race-page **back-link** and **breadcrumb JSON-LD** now use `/{lang}/race-calendar` and `/{lang}/`, and the calendar's `CollectionPage`/breadcrumb JSON-LD URLs are localized. The homepage/calendar source files are retained (they're the build's transform source) but shadowed by the `/` and `/race-calendar` redirects. Verified: build (5,025 race + 6 static, 2.1s), legacy tree removed, sitemap balanced (5,034 URLs, 0 legacy), valid localized JSON-LD, and browser hydration of `/ca/races/…` with a correct `/ca/race-calendar` back-link, 0 console errors. **Note:** the `/ → /es/` redirect is permanent and treats `/es/` as the homepage (x-default); revisit if geo/Accept-Language detection at the root is ever wanted (needs edge middleware, not available in this static setup). Redirects can't be exercised on the local static server — they apply on Vercel. **Remaining [REC]:** localize `/contact`, `/privacy`, `/race-alerts` (then add their 301s too).

---

## 9. Recommended structured-data architecture

| Page | Types (implement at template level) |
|---|---|
| Homepage | `Organization` + `WebSite` + `MobileApplication` **[DONE]** |
| Race calendar | `CollectionPage` + `BreadcrumbList` **[DONE]**; add `ItemList` of the *server-rendered* visible items once the top N are SSR'd |
| Race detail | `SportsEvent` (+`Place`,`PostalAddress`,`GeoCoordinates`,`Offer`) **[DONE, enriched]** + `BreadcrumbList` **[DONE]** |
| Sport/Loc hub | `CollectionPage` + `ItemList` (SSR items) + `BreadcrumbList` + optional `FAQPage` |
| Event series | `EventSeries` linking editions via `subEvent`/`superEvent` |

**Rules:** never emit schema for values you don't have (omit > invent); only `FAQPage` where the FAQ is visible; `ItemList` must reflect server-rendered items, not JS-only ones. Distinguish *valid Schema.org* (all the above) from *Google rich-result eligible* (`SportsEvent`, `Breadcrumb`, `FAQPage` are; `MobileApplication`/`CollectionPage` are understood but not rich-result types).

---

## 10. Example homepage title & meta (implemented ES; CA/EN for the `/ca//en/` variants)

- **ES [DONE]** — Title: `iSard — App de running, senderismo y ciclismo + carreras` · Desc: `iSard es la app para registrar running, trail, senderismo y ciclismo por GPS, crear tarjetas y vídeos 3D de tus rutas, y descubrir carreras en España y Andorra.`
- **CA [REC]** — Title: `iSard — App de running, senderisme i ciclisme + curses` · Desc: `iSard és l'app per registrar running, trail, senderisme i ciclisme per GPS, crear targetes i vídeos 3D de les teves rutes, i descobrir curses a Espanya i Andorra.`
- **EN [REC]** — Title: `iSard — Running, hiking & cycling tracker + race calendar` · Desc: `iSard records your running, trail, hiking and cycling by GPS, creates shareable cards and 3D route-replay videos, and helps you discover races across Spain and Andorra.`

## 11. Example improved homepage copy (implemented, no invented claims)

H1 kept as brand entity **iSard App**; added a server-rendered "¿Qué es iSard?" block with four factual feature bullets (GPS recording; shareable cards; 3D route-replay videos; race calendar + alerts) and two real internal links. No ratings, prices, testimonials or launch claims — the app is pre-launch and the copy says only what is true.

## 12–14. Example templates (patterns to implement in the build)

**Race detail** (already ~this): `H1 = official name` · eyebrow `sport · format` · date + place · Distances · Registration (status/price) · Links · Organizer · Map. Add: visible breadcrumb, "Last checked {date}", "Next edition" link when past. Schema: `SportsEvent` + `BreadcrumbList` **[DONE]**.

**Sport hub** (`/es/carreras/trail`): `H1 = "Carreras de trail running en España"` · 2–3 sentence server-rendered intro · SSR list of the next N events (each linking to its page) · filters (progressive enhancement) · FAQ · `CollectionPage+ItemList+BreadcrumbList`. Title: `Carreras de trail running en España {año} | iSard`.

**Location hub** (`/es/carreras/cataluna`): `H1 = "Carreras en Cataluña"` · intro naming comarcas/provinces · SSR next-N list · sub-links to province/city hubs · related sport hubs · same schema.

## 15. Example JSON-LD (race detail — as now generated)

```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "46a CURSA DE SANT ANDREU",
  "url": "https://www.isard.app/races/cursa-de-sant-andreu-barcelona",
  "image": "https://www.isard.app/iSard_icon.png",
  "inLanguage": "es",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "description": "…",
  "sport": "Road running",
  "startDate": "2026-11-…",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": { "@type": "Place", "name": "…",
    "address": { "@type": "PostalAddress", "addressLocality": "Barcelona",
      "addressRegion": "Barcelonès", "addressCountry": "ES" },
    "geo": { "@type": "GeoCoordinates", "latitude": 41.4, "longitude": 2.2 } },
  "offers": { "@type": "Offer", "url": "…", "availability": "https://schema.org/InStock" }
}
```
Plus a sibling `BreadcrumbList` (iSard → Carreras → race). **[DONE]** Add `organizer`, `previousStartDate` (postponed), and real `offers.price` only where present.

## 16. Internal-linking model

`Home → Calendar → Sport hubs / Location hubs → Race detail → Series`. Every race links **up** to its sport hub + location hub + series (not just a back-link to the calendar). Hubs cross-link to sibling hubs (trail↔running, province↔community). Home links to calendar + alerts **[DONE]**. Target crawl depth ≤ 3 from home to any race. This is what turns 1,675 orphan-ish event pages into a topical graph.

## 17. Sitemap architecture

Now: single `sitemap.xml` with `lastmod` **[DONE]**. When hubs land, split into a **sitemap index**: `sitemap-static.xml`, `sitemap-hubs.xml`, `sitemap-races.xml` (chunk at 50k). Include **only** indexable, above-threshold canonical URLs (exclude `noindex` races per §7, exclude `?lang=` and filter URLs). Keep `lastmod` accurate — it's the freshness signal that gets a 1,600-page directory recrawled.

## 18. Roadmap

**30 days (Phase 1 — mostly [DONE] this branch):** host redirect; homepage head+content+schema; calendar SSR+schema; crawlable internal links; sitemap `lastmod`; race breadcrumb+richer schema. **Remaining P1 [REC]:** add visible breadcrumbs UI; lazy-load the homepage iframe (reserve height for CLS); ship `/about` + `/methodology`; implement the §7 indexing thresholds in the build.

**60 days (Phase 2):** real `/es//ca//en/` server-rendered URLs + reciprocal hreflang + redirect map; sport & location hubs (with thresholds); sitemap index; surface "last checked / source" (requires populating `lastVerifiedAt`).

**90 days (Phase 3):** `EventSeries` pages; per-page OG images; how-to/app content cluster; results pages for completed events; entity/backlink outreach (federations, race organizers, local media).

For each: measure with Search Console (impressions/clicks by page-type + `SportsEvent`/`Breadcrumb` rich-result reports), Bing Webmaster, and periodic AI-citation spot-checks on the target questions in §5.

## 19. Files changed (this branch)

- `vercel.json` — added `redirects`: `isard.app/*` → `https://www.isard.app/*` (308).
- `scripts/build-races.js` — `SITE` → www; `SportsEvent` enriched (`description`, `inLanguage`, `eventAttendanceMode`, `image`); new `breadcrumbLd()` + second JSON-LD `<script>`; sitemap now emits `<lastmod>` per URL.
- `public/index.html` — Spanish coherent title/description; canonical, OG, Twitter, `og:locale`; `Organization+WebSite+MobileApplication` JSON-LD; server-rendered "¿Qué es iSard?" block with feature list + real links to `/race-calendar` and `/race-alerts`; CA/EN translations for the new strings.
- `public/race-calendar/index.html` — keyword-rich title/description; canonical, OG, Twitter; `CollectionPage+BreadcrumbList` JSON-LD; persistent SSR `<h1>`+intro (localized via existing `heading`/`subtitle` keys) + `<noscript>` fallback above `#rc-root`.
- `public/robots.txt` — sitemap URL → www host.

_(Generated `public/races/**` and `public/sitemap.xml` are git-ignored and rebuilt by the build command — not committed.)_

## 20. Tests & validation performed

- `npm run build` → 1,675 pages + sitemap regenerated, 0 errors.
- Parsed **every** JSON-LD block: homepage (`Organization/WebSite/MobileApplication`), calendar (`CollectionPage/BreadcrumbList`), race page (`SportsEvent/BreadcrumbList`) — all valid JSON.
- Verified generated race page: canonical + hreflang now on **www**; two JSON-LD scripts present.
- Sitemap: host = www, `<lastmod>` present per URL (race `updatedAt`, hubs build date).
- Live host check: `isard.app` & `www.isard.app` both `200` **before** fix (redirect ships with next deploy).
- Browser preview: homepage renders new title/content/links, 0 console errors; calendar renders SSR `<h1>` + intro **and** JS still populates filters + 1,533 cards, 0 console errors, no visual regression.

## 21. Remaining decisions for the product owner

1. **Language architecture** — approve `/es//ca//en/` path migration (recommended) vs staying on `?lang=` (Phase 2 gate).
2. **Verification pipeline** — who/what populates `lastVerifiedAt` and `source`, and how often. Gates §5.3, §7, and AI citeability.
3. **Indexing thresholds** — confirm the "≥8 events per hub" and "verified/linked to index a race" thresholds in §7.
4. **App Store URL** — replace the `/get` placeholder (`isard.app`) at launch; add real App Store badge + `MobileApplication` `installUrl`/screenshots then.
5. **`/race-alerts` rendering** — approve replacing the client-side `localStorage` redirect with one canonical, in-place-localized page.
6. **Hub scope** — which sport×location hubs to launch first (recommend: trail Catalonia, running Spain, races Andorra, cycling Spain).
