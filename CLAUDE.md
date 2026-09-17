# CLAUDE.md — derrickgarcia.ca

Project memory for Claude Code. Read this first.

## What this is

Rebuilding **Derrick Garcia**'s realtor website as a **static site on GitHub Pages** at the existing
domain **derrickgarcia.ca**. He's currently on crm.lofty.com — expensive, and the CRM features are
unused. Goal: a fast, $0/month static site that keeps the marketing value and drops everything that
depended on the Lofty CRM/IDX platform.

**Business (use exactly — NAP must stay byte-identical everywhere):**
- Derrick Garcia · Real Broker Ontario LTD (Derrick = Broker; team: Pina Marrella, Voula Spingos — both Agents)
- +1 416-684-7370 · info@derrickgarcia.ca
- 130 King St W, Unit 1800B, Toronto, ON M5X 1E3
- Instagram @derrickgarcia__ · Facebook DerrickGarciaRealtor

## Current status (2026-09-17)

**Phase 1 MVP + Phase 2 "Midnight Estate" redesign built and green.**
**The site is LIVE at derrickgarcia.ca** (GitHub Pages, nightly rebuild).
`pnpm build` (806 pages), `pnpm test` (91 unit tests), and `pnpm check` (`astro check`, 0 errors) all pass.
Phase 2 delivered the dark visual system (Marcellus/Source Sans 3 self-hosted, gold #b08d57,
AA-verified tokens), Sell / Home-Valuation / Rent-to-Own / Reviews pages, a Guides content
collection (4 evergreen articles), legacy-URL redirects, and verified free-license Toronto
photography (`src/assets/photos/CREDITS.md`). `extracted/` was removed (recoverable from git
history at `7ff5c76^`). Go-live is DONE (external keys + DNS cutover); what remains is content
inputs from Derrick — see `TODO.md`.

**LIVE INCIDENT — DDF listings feed, 2026-07-24 → 2026-09-17 (fixed):** the site published an
empty listings grid ("Our live listings feed is temporarily unavailable") for eight weeks. CREA
removed `StandardStatus` from the DDF Web API's **filterable** property set, so the nightly fetch's
`$filter=StandardStatus eq 'Active'` started returning `400 "The property 'StandardStatus' cannot be
used in the $filter query option."` — which fails the WHOLE query → 0 listings. The fetch script's
never-break-the-build design then wrote empty datasets and exited 0, so **57 nightly deploys stayed
green** while the site shipped no listings. Fix: `activeFilter()` now returns `null` (no server-side
status filter), `buildListingsUrl` omits `$filter` when falsy, and `isActiveListing` enforces status
in memory in `buildDatasets`. Plus `alert-on-empty-listings` in `deploy.yml` — a post-deploy job that
FAILS the run when 0 listings shipped, so silent empties can't recur. Verified live: 773 listings
(3 Derrick's), 806 pages, 91 unit tests.

**Listings-first redesign (2026-06-21, now merged to `main` and live):**
an "Evolved Midnight" evolution of the visual system + a listings-first homepage, a client-side
`/listings` browser (filter/sort/search + a real Leaflet map, lazy-loaded), and on-site detail pages
for **all** ~805 Real Broker Ontario listings (gallery+lightbox, location mini-map, contact card,
compliance furniture). Spec:
`docs/superpowers/specs/2026-06-20-listings-first-redesign-design.md`; plan:
`docs/superpowers/plans/2026-06-20-listings-first-redesign.md`; approved mockups in
`docs/superpowers/mockups/`. New content input: GTA-area photos (see `TODO.md`).

- `docs/superpowers/specs/2026-06-09-derrickgarcia-static-site-design.md` — Phase 1 design (hosting/forms/booking/analytics still authoritative)
- `docs/superpowers/specs/2026-06-09-midnight-estate-redesign-design.md` — Phase 2 redesign spec (visual system, parity pages, guides; alternates B/C archived for client)
- `docs/superpowers/specs/2026-06-09-brainstorm-research-appendix.md` — research detail, incl. the
  **Canadian mortgage math** the calculators need (semi-annual compounding, stress test, CMHC, GDS/TDS, LTT)
- `docs/superpowers/plans/2026-06-09-derrickgarcia-static-site-phase1.md` — executed Phase 1 plan
- `docs/superpowers/plans/2026-06-09-midnight-estate-redesign.md` — executed Phase 2 plan (17 tasks)
- `TODO.md` — **remaining work**: external config keys, go-live runbook, Derrick's content inputs, deferred DDF listings
- `src/` — the implemented site (layout, pages, calculators, tested math module, guides collection)

**Toolchain note:** this environment has **pnpm, not npm** (`pnpm install|build|test|check`).
Stack as of 2026-09-17: **Astro 7.3.2**, vitest 4.1.11, sharp 0.35.4, @astrojs/sitemap 3.7.4,
@astrojs/check 0.9.10, TypeScript 5.9.3, Node 22 (`.nvmrc` + CI). `astro.config.mjs` sets
**`compressHTML: true`** — Astro 7's `'jsx'` default strips whitespace between inline elements and
this site's CSS relies on that spacing (see the config comment before changing it). Content
collections use the **Content Layer API** (`src/content.config.ts`, `loader: glob()`), and `z` is
imported from `astro/zod`, not `astro:content` (deprecated since Astro 6).
`@astrojs/sitemap` tracks `^3.7.4` (the old `3.2.1` pin is gone); `sharp` is an explicit dep (pnpm
strict-linking); `pnpm-workspace.yaml` whitelists esbuild/sharp build scripts. See `TODO.md` §4.

## Commands

```bash
pnpm install                 # deps (pnpm-workspace.yaml whitelists esbuild/sharp build scripts)
pnpm dev                     # dev server
pnpm build                   # production build → dist/
pnpm preview                 # serve dist/
pnpm test                    # Vitest — 22 unit tests for src/lib/mortgage-math.js
pnpm check                   # astro check (0 errors expected)
node scripts/og-image.mjs    # regenerate the default OG image
```

Future feature work (e.g. the deferred DDF listings) follows the superpowers workflow: spec + plan
in `docs/superpowers/`, then execute with **superpowers:subagent-driven-development** (fresh agent
per task, recommended) or **superpowers:executing-plans** (inline with checkpoints).

## Architecture & decisions (locked)

- **Stack:** Astro + vanilla CSS (custom properties) → GitHub Pages via GitHub Actions. One shared
  `BaseLayout` + `Header`/`Footer`. Calculators are client-side islands over a tested pure-function math module.
- **Listings:** hybrid. MLS listings come from a self-operated CREA **DDF** feed (nightly GitHub Action →
  build-time render): `/listings` (GTA markets; cards link out to realtor.ca) + Derrick's own get on-site
  `/listings/[id]` detail pages. "Search Homes" / agent profiles still **link out** to realtor.ca / Real Broker.
  Required compliance furniture per listing/detail: "Powered by REALTOR.ca" badge + brokerage name (DDF Office
  resource) + MLS®/REALTOR® trademark statement on listings pages.
- **Blog:** dropped. **"My App" QR:** dropped — it was Lofty's white-label "Closely" app keyed to
  Derrick's paid agent ID; attribution/leads die when the Lofty subscription ends.
- **Forms:** Web3Forms (free; honeypot + hCaptcha). **Booking:** TidyCal (free; two-way **iCloud** sync —
  Derrick uses Apple Calendar). **Analytics:** Cloudflare Web Analytics (free, **cookieless → no cookie banner**).
- **Budget:** free-first; upgrade only when a free tier is outgrown.
- **Pages (Phases 1+2, built):** Home · About/Team · Contact · 3 calculators · Sell · Home-Valuation ·
  Rent-to-Own · Reviews (config-driven, ships with honest empty state) · Guides (4 articles) ·
  Privacy · Accessibility · 404 · legacy-URL redirect stubs. **Phase 3 (built):** `/areas/` hub +
  5 town pages (Caledon · Bolton · Orangeville · Brampton · Mississauga) — local-SEO content,
  anti-doorway rules in the 2026-06-10 spec. **DDF/MLS listings (built):** nightly DDF fetch + the three
  `/listings` routes + compliance furniture — only the manual go-live inputs remain (`TODO.md`). **Still
  deferred (own plan):** optional live Google-reviews widget.

## Conventions & gotchas

- **Commits:** allowed; **never `git push`** (user runs pushes). End commit messages with the
  standard Claude Code `Co-Authored-By` trailer for whichever model is running.
- **No fabricated placeholders.** Real content (bios, accessibility text, brand colours) is inlined. The only
  blanks are genuinely-external go-live values, centralized in `src/data/config.ts` (+ `agents.ts`, `site.ts`)
  with **graceful call/email fallbacks** so nothing ships broken.
- **Canadian calculator math is correctness-critical:** fixed-rate mortgages compound **semi-annually**
  (`(1+r/2)^(1/6)-1`, NOT `r/12`). Stress test = `max(rate+2%, 5.25%)`. Keep all regulatory constants named
  and date-commented (they change). The math module is unit-tested first (TDD).
- **CREA DDF API contracts change without notice — and the failure is SILENT.** Two field-level
  landmines found the hard way: `ListOfficeName` does not exist on `Property` (selecting it 400s the
  whole query — brokerage comes from the separate `Office` resource), and `StandardStatus` is
  returnable in `$select` but **NOT usable in `$filter`** (removed 2026-07-24; see the incident
  above). Any 400 on the Property query yields **zero** listings, not a partial result. So: filter
  server-side only on fields probed live, prefer in-memory filtering for anything optional, and never
  trust a green CI run as evidence listings shipped — check the listings count.
- **Assets:** only the 3 headshots + Real Broker logos are real/reusable. The old site's hero/banner images
  are generic **stock** — do not reuse. MLS listing photos are licensed — do not host/copy; under the DDF
  license we **display** them by hotlinking the **unmodified, watermarked** `ddfcdn.realtor.ca` URLs
  (no crop/overlay/recompress/filter).
- **Astro on Pages:** do NOT set `base` (apex domain serves from root); `CNAME` lives in `public/`.
- **DNS cutover:** when repointing off Lofty, swap only A/AAAA/CNAME — **keep MX/SPF/DKIM** or
  `info@derrickgarcia.ca` email breaks. Lower TTL first; stage on `*.github.io` before touching DNS.
- **Lofty anti-bot:** the old site sits behind a SHA-1 proof-of-work. The PoW solver + crawler
  lived in `extracted/` (now deleted — recover from git history at `7ff5c76^`, or see the research appendix).

## Pre-go-live inputs (status as of 2026-09-17)

**Done / live:** Web3Forms access key (inbox `info@derrickgarcia.ca`) · TidyCal booking URL ·
Cloudflare Analytics token · DNS cutover (Porkbun: ALIAS → GitHub Pages, Google Workspace MX/SPF/DMARC) ·
CREA DDF credentials (in GitHub Actions Secrets).
**Still outstanding:** realtor.ca + Real Broker profile URLs (per agent) · Google Business Profile URL ·
GTA-area photos. Optional: real brand favicon, licensed hero photo, Voula's full bio, real testimonials.
`TODO.md` is the authoritative, detailed version of this list.
