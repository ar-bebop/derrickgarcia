# Plan: MLS Listings via CREA DDF — nightly fetch + on-site display

**Created:** 2026-06-20 · **Status:** ready to execute (not started)
**Execute with:** superpowers `subagent-driven-development` (fresh agent per task) or `executing-plans`.
**Related:** `docs/superpowers/specs/2026-06-09-midnight-estate-redesign-design.md` (§Listings, deferred),
`docs/superpowers/specs/2026-06-09-brainstorm-research-appendix.md` (Canadian RE / DDF research),
memory `ddf-listings-feasibility.md` (auth model, verified credentials path).

---

## Context

derrickgarcia.ca is a $0 static Astro site on GitHub Pages, rebuilt off Lofty. We have a **working,
self-operated CREA DDF Member Website Feed** (credentials verified live, stored in gitignored `.env`
at repo root: `CREA_DDF_CLIENT_ID/SECRET/SCOPE/TOKEN_URL/API_BASE`). This feature adds MLS listings:
a nightly GitHub Action pulls listings from the DDF Web API and the build renders them, in two views —
**all active listings** and **Derrick's own listings**.

### Verified facts (probed live against the API 2026-06-19/20 — trust these)
- API: `https://ddfapi.realtor.ca/odata/v1/Property`; OAuth2 client_credentials → POST
  `https://identity.crea.ca/connect/token` (form `grant_type=client_credentials`, `client_id`,
  `client_secret`, `scope=DDFApi_Read`); Bearer token, `expires_in` 3600.
- **806 active listings** in the feed (all Real Broker Ontario offices, province-wide).
  **Derrick's own = 0 right now** — his `MemberKey`/`ListAgentKey` = `2088980` (confirmed via the
  `Member` resource, filter `MemberLastName eq 'GARCIA'`).
- `Property` has 259 fields; `$select` the lean set we need. **`Media` is an INLINE array** (NOT
  `$expand`-able): each item `{MediaURL, Order, PreferredPhotoYN, MediaCategory}`. Photos live on
  **`ddfcdn.realtor.ca`**, are **public + hotlinkable** (verified `200`, `image/jpeg`, no hotlink
  protection even with a foreign Referer) with **CREA's watermark baked in**.
- Each record has `ListingURL` (realtor.ca deep link; needs `https://` prefix) and **`ListOfficeName`**
  (brokerage name — required for compliance; a Property field, so no Office-resource join needed —
  but smoke-test that CREA populates it, see Verification).
- Real sample for fixtures: ListingKey `28705430`, ListingId `X12331537`, ListPrice `650000`,
  City `"Peterborough (Northcrest Ward 5)"`, Beds 6, Baths 2, PropertySubType `"Single Family"`,
  PhotosCount 5; MediaURL e.g. `https://ddfcdn.realtor.ca/listing/TS.../highres/7/x12331537_1.jpg`.
- Pagination: standard OData — `@odata.count` + `@odata.nextLink` (or `$top`/`$skip`). 806 → ≈9 pages
  of 100 (fast). `Property?$filter=...&$count=true&$top=0` returns a count cheaply.

### Decisions locked (confirmed with the user)
- **Scope:** the "all listings" view shows **Derrick's markets only** (GTA + the `/areas` towns), not
  all 806 province-wide. **Filter at the page level** (keep the full dataset; choice is reversible).
  The realtor.ca search link still covers all of Ontario.
- **Depth:** **Hybrid** — Derrick's **own** listings get rich, indexable on-site detail pages
  (0 now → honest empty state); **all other** listings are cards that open on realtor.ca. No 806 thin
  pages → no doorway/thin-content risk, no `noindex` needed.

### CLAUDE.md note this updates
`CLAUDE.md` currently says "MLS listing photos are licensed — do not host." That predates the DDF
license. We do not *host/copy* photos, but under DDF we *display* them by **hotlinking** unmodified
watermarked `ddfcdn` URLs. This plan revises that line (see §F).

---

## Architecture / data flow

```
nightly cron (GitHub Actions)
  → pnpm install --frozen-lockfile
  → pnpm fetch:listings:ci   (secrets as env) → src/lib/ddf.js → writes src/data/generated/*.json (gitignored)
  → pnpm build               (astro reads JSON, filters to markets, renders)
  → upload-pages-artifact → deploy-pages
```
Data is **ephemeral** (CI-generated, gitignored, never committed). Every deploy ships data fetched
seconds earlier → structurally satisfies CREA's 24-hour refresh / stale-removal rule.

---

## Implementation

### A. Data pipeline

**`src/lib/ddf.js`** (NEW) — pure-ish ESM, native `fetch`, **no new deps**; model structure + test
style on `src/lib/mortgage-math.js`. Network fns take injectable `fetchImpl = fetch` so tests never
hit the network.
- `getToken()` → `{token, expiresAt}` (client_credentials POST; 60s expiry skew).
- `buildListingsUrl({filter, select, top})`, `activeFilter()`, `derrickFilter()` — pure URL builders.
- `fetchJsonWithRetry(url,{token})` — 1 token refresh on 401; ≤3 retries on 429/5xx with backoff+jitter.
- `fetchAllListings({filter})` — follow `@odata.nextLink` to exhaustion; return raw records + count.
- `normalizeListing(raw)` + helpers `primaryPhoto` (PreferredPhotoYN→lowest Order→[0]),
  `sortedPhotoUrls` (filter photo MediaCategory, sort by Order, map MediaURL), `normalizeListingUrl`
  (https-prefix; null if blank), `formatPrice` (`Intl.NumberFormat('en-CA',{currency:'CAD',
  maximumFractionDigits:0})`), `isDerrickListing` (any of `ListAgentKey`/`CoListAgentKey{,2,3}` ===
  `2088980`).
- `buildDatasets()` — **one** active-filter paginated pass; normalize all; derive `derrick` via
  `filter(isDerrickListing)` in memory (cheaper + keeps the two sets consistent).

`$select`: `ListingKey, ListingId, ListingURL, UnparsedAddress, City, StateOrProvince, PostalCode,
ListPrice, BedroomsTotal, BathroomsTotalInteger, PropertySubType, ListAgentKey, CoListAgentKey,
CoListAgentKey2, CoListAgentKey3, ListOfficeKey, ListOfficeName, StandardStatus, PublicRemarks, Media,
PhotosCount, ModificationTimestamp, Latitude, Longitude`.

Normalized shape (render contract): `id`(ListingKey), `mlsNumber`(ListingId), `url`(https realtor.ca),
`address`, `city`, `province`, `postalCode`, `price`(num), `priceFormatted`, `beds`, `baths`,
`propertyType`, `primaryPhoto`, `photos[]`(hotlinked), `photosCount`, `description`(PublicRemarks),
`brokerage`(ListOfficeName — **compliance-required**), `isDerrick`, `lat`, `lng`,
`updatedAt`(ModificationTimestamp).

**`scripts/fetch-listings.mjs`** (NEW) — CLI wrapper modeled on `scripts/og-image.mjs`. Runs
`buildDatasets()`, writes `src/data/generated/listings.json` + `listings-derrick.json`
(`{generatedAt,count,listings}`). **Graceful failure:** on throw or 0 records → log GitHub
`::warning::`, write empty datasets, **exit 0** (never break the build). Local env via Node
`--env-file=.env`; CI gets secrets as real env vars.

**`scripts/ensure-listings.mjs`** (NEW) — tiny `prebuild`/`predev` guard: writes empty stub JSON if
the generated files are absent, so `import` never breaks for a contributor building without creds.

**`src/data/listings.ts`** (NEW) — typed accessor (mirror `src/data/agents.ts`): exports `LISTINGS`,
`DERRICK_LISTINGS`, `LISTINGS_GENERATED_AT`, `RELEVANT_MARKETS` (GTA + `/areas` town allowlist), and
`inDerricksMarkets(listing)`. Matcher normalizes `City` (strip `(...)` qualifier, uppercase, compare
leading municipality token to the allowlist). **During build, sample the distinct `City` values across
the 806 to tune `RELEVANT_MARKETS`** (DDF cities look like `"Toronto (Waterfront Communities)"`,
`"Caledon (Bolton)"`). Starter allowlist: Toronto (+ Etobicoke/North York/Scarborough/East York/York),
Mississauga, Brampton, Caledon, Bolton, Orangeville, Vaughan, Markham, Richmond Hill, Oakville,
Burlington, Milton, Halton Hills/Georgetown, Ajax, Pickering, Whitby, Oshawa, Newmarket, Aurora, King.

**`package.json`** scripts: `"fetch:listings":"node --env-file=.env scripts/fetch-listings.mjs"`,
`"fetch:listings:ci":"node scripts/fetch-listings.mjs"`, `"prebuild":"node scripts/ensure-listings.mjs"`,
`"predev":"node scripts/ensure-listings.mjs"`. **`.gitignore`:** add `src/data/generated/`.

### B. CI/CD — `.github/workflows/deploy.yml` (EDIT)

`withastro/action@v3` runs install+build internally with no seam for a pre-build fetch, so **replace it
with explicit steps** (keep the existing `deploy` job, permissions, concurrency):
`actions/checkout@v4 → pnpm/action-setup@v4 (version 11.3.0) → actions/setup-node@v4 (node 20, cache
pnpm) → pnpm install --frozen-lockfile → fetch step (secrets as env) → pnpm build →
actions/upload-pages-artifact@v3 (path ./dist)`. Add `schedule: - cron: '10 8 * * *'` (≈03:10 ET,
off-peak, inside the 24h window; `:10` dodges top-of-hour congestion). Keep `push:[main]` +
`workflow_dispatch`.

**GitHub repo Secrets** to add (Settings → Secrets and variables → Actions), same values as `.env`:
`CREA_DDF_CLIENT_ID`, `CREA_DDF_CLIENT_SECRET`, `CREA_DDF_SCOPE`, `CREA_DDF_TOKEN_URL`,
`CREA_DDF_API_BASE`. **User must add these** (the agent can't push secrets).

### C. Frontend

Routes:
- **`src/pages/listings/index.astro`** (NEW) — "all listings" hub: grid filtered via
  `inDerricksMarkets`, sorted most-recent (`updatedAt`). Cards link OUT to realtor.ca. Empty-state
  safety (fetch failure / filter zeroes out) via the `src/pages/reviews.astro:14` ternary.
  **Phase 1:** bound DOM weight with a simple "show N / Load more" (vanilla-JS island, progressive
  enhancement — no-JS shows all).
- **`src/pages/listings/derrick.astro`** (NEW) — Derrick's own grid; **honest empty state now**
  (reuse `reviews.astro` pattern: message + buttons to `/listings`, realtor.ca search, call/email from
  `SITE`). Auto-populates when his listings appear — no code change.
- **`src/pages/listings/[id].astro`** (NEW) — on-site detail page; `getStaticPaths` over **Derrick's
  own only** (model `src/pages/areas/[slug].astro`). 0 paths now → 0 pages built (consistent with
  "no fabricated placeholders").

Components (`src/components/`):
- **`ListingCard.astro`** — photo via **plain `<img loading="lazy" decoding="async" width height
  src={primaryPhoto}>`** (NOT `astro:assets` — keep the watermark unmodified + avoid build-time remote
  fetches), price, beds·baths·type, address, city, **brokerage name**, and the PoweredByRealtor badge.
  Optional `detailHref` prop → renders internal "View details" for the Derrick variant. Reuse
  `AgentCard.astro` markup/CSS + the `reviews.astro:40` grid (`repeat(auto-fit,minmax(280px,1fr))`).
- **`PoweredByRealtor.astro`** — required badge: CREA "Powered by REALTOR.ca" logo (**≥90px wide,
  1:1**) wrapped in `<a href={listing.url} target=_blank rel="noopener noreferrer">`. On every card
  AND every detail page.
- **`TrademarkStatement.astro`** — required MLS®/REALTOR® statement; rendered on listings pages only
  (NOT the global Footer).
- **`ListingSchema.astro`** — `RealEstateListing` JSON-LD, on `/listings/[id]` only; model the
  `<script is:inline type="application/ld+json" set:html slot="head">` pattern of
  `src/components/AreaSchema.astro`.
- **Nav:** add a "Listings" item to `src/components/Header.astro` (All Listings → `/listings`,
  Derrick's Listings → `/listings/derrick`, Search realtor.ca ↗ → `SITE.listingsSearchUrl`). Keep the
  existing realtor.ca "Search Homes" buttons in `Footer.astro` / `index.astro`.

Visual (dark "Midnight Estate" theme, gold `#b08d57`, Marcellus/Source Sans 3 — reuse `global.css`
tokens): card = photo (`aspect-ratio:4/3; object-fit:cover`) → price (Marcellus, largest) → beds·baths·
type meta line → address + city → "Listed by {brokerage}" → PoweredByRealtor badge. Page = kicker+H1
(match `reviews.astro`/`areas/index.astro`) → grid (`.reveal` for scroll-in) → TrademarkStatement →
CTA band. Don't apply a CSS filter over the watermarked photo unless confirmed acceptable.

### D. Compliance furniture (CREA DDF Rules — self-operator owns these)
- Powered-by-REALTOR.ca logo → each listing's realtor.ca page (`PoweredByRealtor.astro`).
- Brokerage name per listing (`brokerage` = ListOfficeName).
- CREA photo watermarks preserved by hotlinking unmodified ddfcdn images (no crop/overlay/recompress).
- MLS®/REALTOR® trademark statement on listings pages (`TrademarkStatement.astro`).
- 24h refresh + stale removal — nightly cron + ephemeral data (structural).
- **Analytics Web Service API (Rule 5c)** — spec not public. Ship a **gated, inert stub**
  `src/lib/crea-analytics.js` wired on listing views, gated by a `CONFIG.creaAnalyticsKey`-style empty
  fallback (matches `src/data/config.ts` convention). Implement when CREA supplies the spec.

### E. SEO / indexing
All listings routes **indexable** (hub, Derrick's grid, own detail pages); canonical = self. No
`noindex` (no thin pages exist). `@astrojs/sitemap` auto-include stays as-is — expired `/listings/[id]`
URLs drop from the sitemap on the next nightly build. Per-listing JSON-LD only on Derrick's own detail
pages.

### F. Docs
- `CLAUDE.md` — revise "MLS listing photos are licensed — do not host" to: do not *host/copy*, but
  under the DDF license *display* via hotlinking unmodified watermarked ddfcdn URLs; note the required
  Powered-by-REALTOR.ca logo + brokerage name + trademark statement. Update the "Listings: link out"
  architecture note to reflect the hybrid.
- `TODO.md` — add go-live inputs (below) to the deferred-listings section (now in progress).

---

## Verification
1. **Unit tests** `src/lib/ddf.test.js` (vitest; `src/**/*.test.js`; node; inject `fetchImpl` — no
   network). Fixture `src/lib/__fixtures__/ddf-sample.json` from the verified sample (incl. a
   `PreferredPhotoYN:true` Media item with non-1 Order, a seeded `2088980` record, a 2-page
   `@odata.nextLink` set). Assert: normalize fields/price/url-prefix/brokerage; `primaryPhoto` honors
   PreferredPhotoYN then Order; `sortedPhotoUrls` order + empty handling; pagination concatenates +
   stops; retry on 429/401; `isDerrickListing`; `buildListingsUrl` includes the filter + all select
   fields. `pnpm test`.
2. **Smoke test** (one authed call) before finalizing `$select`: confirm CREA populates `ListOfficeName`
   (`Property?$top=1&$select=ListOfficeName&$filter=StandardStatus eq 'Active'`). If ever empty, fall
   back to an `Office` resource join keyed on `ListOfficeKey` — never invent a brokerage name.
3. **Local build:** `pnpm fetch:listings` → `pnpm build` → `pnpm preview`. Verify `/listings` shows the
   market-filtered grid with photos + Powered-by-REALTOR.ca links + trademark statement; `/listings/
   derrick` shows the empty state. `pnpm check` (0 errors).
4. **CI dry run:** add the secrets, trigger via `workflow_dispatch`, confirm the fetch step logs the
   count and Pages deploys green. Confirm graceful path: temporarily-bad creds → build still green +
   empty state (warning annotation visible).

---

## Phasing
- **Phase 1 (this plan):** pipeline + CI cron + the two views + Derrick detail route + compliance
  furniture + tests + docs. Market-filtered grid with "Load more".
- **Phase 2 (later):** `ListingFilters.astro` (client-side city/price/beds/type over the baked array),
  real pagination, optional map (lat/lng), legacy Lofty `/listings/*` redirect stubs (`Redirect.astro`
  pattern), and the live CREA Analytics integration once the spec is in hand.

## Flagged external inputs (Derrick / CREA — needed before full go-live)
- Add the 5 GitHub Actions Secrets (blocks the nightly action).
- CREA's official "Powered by REALTOR.ca" logo asset + dark-bg usage rules → `src/assets/branding/`.
- Exact current CREA MLS®/REALTOR® trademark statement wording.
- CREA Analytics Web Service API spec (Rule 5c) — to replace the inert stub.

## Files
**NEW:** `src/lib/ddf.js`, `src/lib/ddf.test.js`, `src/lib/__fixtures__/ddf-sample.json`,
`scripts/fetch-listings.mjs`, `scripts/ensure-listings.mjs`, `src/data/listings.ts`,
`src/pages/listings/index.astro`, `src/pages/listings/derrick.astro`, `src/pages/listings/[id].astro`,
`src/components/{ListingCard,PoweredByRealtor,TrademarkStatement,ListingSchema}.astro`,
`src/lib/crea-analytics.js` (inert stub). CI-generated, gitignored: `src/data/generated/*.json`.
**EDIT:** `.github/workflows/deploy.yml`, `package.json`, `.gitignore`,
`src/components/Header.astro`, `CLAUDE.md`, `TODO.md`.
