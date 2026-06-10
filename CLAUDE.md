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

## Current status (2026-06-09)

**Phase 1 MVP + Phase 2 "Midnight Estate" redesign built and green.**
`pnpm build`, `pnpm test` (22 unit tests), and `pnpm check` (`astro check`, 0 errors) all pass.
Phase 2 delivered the dark visual system (Marcellus/Source Sans 3 self-hosted, gold #b08d57,
AA-verified tokens), Sell / Home-Valuation / Rent-to-Own / Reviews pages, a Guides content
collection (4 evergreen articles), legacy-URL redirects, and verified free-license Toronto
photography (`src/assets/photos/CREDITS.md`). `extracted/` was removed (recoverable from git
history at `7ff5c76^`). **What remains: the manual production go-live** (external keys + DNS
cutover) plus content inputs from Derrick — all captured in `TODO.md`.

- `docs/superpowers/specs/2026-06-09-derrickgarcia-static-site-design.md` — Phase 1 design (hosting/forms/booking/analytics still authoritative)
- `docs/superpowers/specs/2026-06-09-midnight-estate-redesign-design.md` — Phase 2 redesign spec (visual system, parity pages, guides; alternates B/C archived for client)
- `docs/superpowers/specs/2026-06-09-brainstorm-research-appendix.md` — research detail, incl. the
  **Canadian mortgage math** the calculators need (semi-annual compounding, stress test, CMHC, GDS/TDS, LTT)
- `docs/superpowers/plans/2026-06-09-derrickgarcia-static-site-phase1.md` — executed Phase 1 plan
- `docs/superpowers/plans/2026-06-09-midnight-estate-redesign.md` — executed Phase 2 plan (17 tasks)
- `TODO.md` — **remaining work**: external config keys, go-live runbook, Derrick's content inputs, deferred DDF listings
- `src/` — the implemented site (layout, pages, calculators, tested math module, guides collection)

**Toolchain note:** this environment has **pnpm, not npm** (`pnpm install|build|test|check`).
`@astrojs/sitemap` is pinned to `3.2.1` (3.7.x needs Astro 5); `sharp` is an explicit dep (pnpm
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
- **Listings:** no IDX/MLS hosted (licensed feed). "Search Homes" / agent profiles **link out** to
  realtor.ca / Real Broker.
- **Blog:** dropped.
- **Forms:** Web3Forms (free; honeypot + hCaptcha). **Booking:** TidyCal (free; two-way **iCloud** sync —
  Derrick uses Apple Calendar). **Analytics:** Cloudflare Web Analytics (free, **cookieless → no cookie banner**).
- **Budget:** free-first; upgrade only when a free tier is outgrown.
- **Pages (Phases 1+2, built):** Home · About/Team · Contact · 3 calculators · Sell · Home-Valuation ·
  Rent-to-Own · Reviews (config-driven, ships with honest empty state) · Guides (4 articles) ·
  Privacy · Accessibility · 404 · legacy-URL redirect stubs. **Phase 3 (built):** `/areas/` hub +
  5 town pages (Caledon · Bolton · Orangeville · Brampton · Mississauga) — local-SEO content,
  anti-doorway rules in the 2026-06-10 spec. **Deferred (own plan):** DDF/MLS listings
  integration; optional live Google-reviews widget.

## Conventions & gotchas

- **Commits:** allowed; **never `git push`** (user runs pushes). End commit messages with the
  standard Claude Code `Co-Authored-By` trailer for whichever model is running.
- **No fabricated placeholders.** Real content (bios, accessibility text, brand colours) is inlined. The only
  blanks are genuinely-external go-live values, centralized in `src/data/config.ts` (+ `agents.ts`, `site.ts`)
  with **graceful call/email fallbacks** so nothing ships broken.
- **Canadian calculator math is correctness-critical:** fixed-rate mortgages compound **semi-annually**
  (`(1+r/2)^(1/6)-1`, NOT `r/12`). Stress test = `max(rate+2%, 5.25%)`. Keep all regulatory constants named
  and date-commented (they change). The math module is unit-tested first (TDD).
- **Assets:** only the 3 headshots + Real Broker logos are real/reusable. The old site's hero/banner images
  are generic **stock** — do not reuse. MLS listing photos are licensed — do not host.
- **Astro on Pages:** do NOT set `base` (apex domain serves from root); `CNAME` lives in `public/`.
- **DNS cutover:** when repointing off Lofty, swap only A/AAAA/CNAME — **keep MX/SPF/DKIM** or
  `info@derrickgarcia.ca` email breaks. Lower TTL first; stage on `*.github.io` before touching DNS.
- **Lofty anti-bot:** the old site sits behind a SHA-1 proof-of-work. The PoW solver + crawler
  lived in `extracted/` (now deleted — recover from git history at `7ff5c76^`, or see the research appendix).

## Pre-go-live inputs still needed (not derivable from the old site)

Web3Forms access key · TidyCal booking URL · Cloudflare Analytics token · realtor.ca + Real Broker profile
URLs (per agent) · Google Business Profile URL. Optional: real brand favicon, licensed hero photo, Voula's
full bio, real testimonials. `TODO.md` is the authoritative, detailed version of this list.
