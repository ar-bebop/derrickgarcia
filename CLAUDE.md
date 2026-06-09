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

**Planning complete; implementation not started.** No application code exists yet — the next step is
executing the Phase 1 plan. What's in the repo:

- `docs/superpowers/specs/2026-06-09-derrickgarcia-static-site-design.md` — the approved design
- `docs/superpowers/specs/2026-06-09-brainstorm-research-appendix.md` — research detail, incl. the
  **Canadian mortgage math** the calculators need (semi-annual compounding, stress test, CMHC, GDS/TDS, LTT)
- `docs/superpowers/plans/2026-06-09-derrickgarcia-static-site-phase1.md` — **the executable plan (19 tasks)**
- `src/assets/` — real headshots + Real Broker logos (already committed)
- `extracted/` — reference snapshot of the OLD Lofty site (24 pages, assets, CSS) + the scripts used to
  capture it. **Plan Task 18 deletes this** once the build is green; nothing in `src/` depends on it.

## How to implement

Read the spec, then execute the plan task-by-task with **superpowers:subagent-driven-development**
(fresh agent per task, recommended) or **superpowers:executing-plans** (inline with checkpoints). The plan
is self-contained: exact files, full code, TDD steps, and verify commands.

Once Task 1 runs, the toolchain exists:
- `npm run dev` · `npm run build` · `npm run preview`
- `npm test` (Vitest — unit tests for `src/lib/mortgage-math.js`)

## Architecture & decisions (locked)

- **Stack:** Astro + vanilla CSS (custom properties) → GitHub Pages via GitHub Actions. One shared
  `BaseLayout` + `Header`/`Footer`. Calculators are client-side islands over a tested pure-function math module.
- **Listings:** no IDX/MLS hosted (licensed feed). "Search Homes" / agent profiles **link out** to
  realtor.ca / Real Broker.
- **Blog:** dropped.
- **Forms:** Web3Forms (free; honeypot + hCaptcha). **Booking:** TidyCal (free; two-way **iCloud** sync —
  Derrick uses Apple Calendar). **Analytics:** Cloudflare Web Analytics (free, **cookieless → no cookie banner**).
- **Budget:** free-first; upgrade only when a free tier is outgrown.
- **MVP pages (Phase 1):** Home · About/Team · Contact · Mortgage / Affordability / Land-Transfer-Tax
  calculators · Privacy · Accessibility · 404. **Phase 2 (later, separate plan):** Reviews, Home-Evaluation,
  Sell, Rent-to-Own landings; optional live Google-reviews widget.

## Conventions & gotchas

- **Commits:** allowed; **never `git push`** (user runs pushes). End commit messages with the
  `Co-Authored-By: Claude Opus 4.8` trailer.
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
- **Lofty anti-bot:** the old site sits behind a SHA-1 proof-of-work. To re-pull pages, use
  `extracted/pow-solver.js` + `extracted/crawl.js` (until `extracted/` is deleted; then see the research appendix).

## Pre-go-live inputs still needed (not derivable from the old site)

Web3Forms access key · TidyCal booking URL · Cloudflare Analytics token · realtor.ca + Real Broker profile
URLs (per agent) · Google Business Profile URL. Optional: real brand favicon, licensed hero photo, Voula's
full bio, real testimonials (Phase 2).
