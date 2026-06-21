# TODO — derrickgarcia.ca

Phase 1 MVP **and the Phase 2 "Midnight Estate" redesign** are built and green
(`pnpm build`, `pnpm test`, `pnpm check` all pass). Phase 2 added the dark visual system,
Sell / Home Valuation / Rent to Own / Reviews pages, the Guides hub, and legacy-URL redirects
(spec: `docs/superpowers/specs/2026-06-09-midnight-estate-redesign-design.md`).
What remains is external configuration + the production go-live, plus optional polish.
Nothing below blocks local development or the build — the site ships today with graceful
call/email fallbacks wherever an external service is not yet configured.

**Listings-first redesign (2026-06-21, branch `worktree-redesign-listings-first`, not yet merged):**
an "Evolved Midnight" visual refresh + listings-first homepage, a live `/listings` browser
(filter/sort/search + interactive Leaflet map), and on-site detail pages for all ~805 Real Broker
Ontario listings (`pnpm build|check|test` green; spec + plan in `docs/superpowers/`).
**New content input needed:** free-licensed photos of the GTA areas (Toronto, Mississauga, Brampton,
Caledon, Bolton, Orangeville) for the homepage Areas grid — add to `src/assets/photos/` + credit in
`src/assets/photos/CREDITS.md`. Until sourced, the area cards use tasteful gradient tiles (no broken images).

## 1. External service keys — fill before launch

All centralized; empty values render a graceful fallback (never a broken widget).

| Value | File | Empty-state behavior |
|-------|------|----------------------|
| ~~`web3formsAccessKey`~~ ✅ done | `src/data/config.ts` | Delivers to **`info@derrickgarcia.ca`** (destination set in the Web3Forms dashboard) |
| ~~`tidycalUrl`~~ ✅ filled | `src/data/config.ts` | **Go-live:** confirm TidyCal account is Derrick's (primary cal = his iCloud, bookings land there); slug `3ezo9wz` is auto-generated — optional custom username |
| ~~`cloudflareAnalyticsToken`~~ ✅ filled | `src/data/config.ts` | Dashboard registers data only post-cutover (beacon reports by hostname) |
| ~~per-agent `realtorCaUrl` / `realBrokerUrl`~~ ✅ all filled | `src/data/agents.ts` | realtor.ca + onereal.ca ×3; socials/personal sites/GBPs in per-agent `sameAs` JSON-LD |
| ~~`SITE.social.googleBusiness`~~ ✅ filled | `src/data/site.ts` | kgmid knowledge-panel URL. Derrick should still claim the GBP (panel showed "Suggest an edit") |

After filling: `pnpm build` and confirm the real form, booking iframe, analytics beacon,
agent links, and GBP `sameAs` now render.

## 2. Production go-live runbook (manual — do WITH the user; email continuity is the top risk)

1. Fill the config above; rebuild; commit.
2. Push repo (user action) → repo Settings → Pages → Source = **GitHub Actions**.
   Confirm the workflow is green and verify the whole site on the temporary `*.github.io` URL
   **before touching DNS.**
3. Lower DNS TTL on current Lofty records to 300s, ~24h before cutover.
4. Cut over DNS at the `.ca` registrar — **keep MX/SPF/DKIM/TXT untouched** (protects
   `info@derrickgarcia.ca`); replace only web records:
   - A `@` → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
   - AAAA `@` → `2606:50c0:8000::153` … `8003::153`
   - CNAME `www` → `<github-username>.github.io`
   - Remove old Lofty A/CNAME web records.
5. Settings → Pages → Custom domain = `derrickgarcia.ca`; wait for green check; enable **Enforce HTTPS**.
6. Post-cutover: `dig +short derrickgarcia.ca A` (four GitHub IPs); HTTPS serves new site;
   **send a test email to `info@derrickgarcia.ca` and confirm it arrives**; submit the contact
   form → confirm lead email; confirm Cloudflare Analytics registers the visit.
7. Search Console: claim property, submit `https://derrickgarcia.ca/sitemap-index.xml`.
   Decommission Lofty only after all the above pass.

## 3. Content inputs from Derrick (Phase 2 built the slots; he supplies the substance)

- ~~**Guide content review**~~ ✅ approved by client (2026-06-11).
- **Real testimonials** → `TESTIMONIALS` in `src/data/config.ts` (Reviews page + Home teaser
  render automatically; ships with honest Google link-out empty state).
- ~~**Stats review**~~ ✅ resolved (2026-06-11) — stats strip removed from the homepage entirely
  per client; `SITE.stats` deleted.
- ~~**Deposit Lending**~~ ✅ resolved (2026-06-11) — built as `/deposit-lending` (on-site explainer →
  money2close.com). Derrick confirmed: no referral relationship (current copy + plain link correct;
  do NOT add `rel="sponsored"`), framings approved, and the old site had a single "Deposit Lending"
  nav item (no separate Lending target exists).
- ~~Voula Spingos' full bio~~ ✅ resolved (2026-06-11) — written from her Google Business bio
  (EN/EL bilingual, realtor + stager); in `src/data/agents.ts`.
- ~~**Area pages fact review (Phase 3)**~~ ✅ approved by client (2026-06-11). Standing
  maintenance notes that survive the review:
  - Mississauga: Hazel McCallion LRT is described as **under construction** — update the
    copy when it opens (2028–29 per Metrolinx).
  - The $4,000 FTB rebate (Orangeville page + guides) is a regulatory constant — re-check
    periodically alongside the §3b mortgage-math constants.
  - New towns later: one at a time, never templated batches (anti-doorway rules in
    docs/superpowers/specs/2026-06-10-location-pages-design.md).

## 3b. Optional / later

- ~~Replace the `DG` placeholder favicon with a real brand mark~~ ✅ done (2026-06-11): client
  supplied the gold DG mark — now the favicon set (`public/favicon.{svg,ico}`,
  `apple-touch-icon.png`), the header brand, and the OG image (regenerate via
  `node scripts/og-image.mjs`). Master transparent mark: `src/assets/branding/dg-mark.png`;
  light-background lockup (dark text — unusable on the dark site, kept for print/email):
  `src/assets/branding/dg-logo-text-light.png`.
- Licensed hero photography if Derrick buys any (current heroes are verified, credited
  free-license Toronto photos — see `src/assets/photos/CREDITS.md`).
- **Listings/DDF integration** ✅ **built** (in progress to go-live): self-operated CREA DDF feed →
  nightly GitHub Action bakes `/listings` (all GTA-market listings; cards link out to realtor.ca),
  `/listings/derrick` (Derrick's own — honest empty state now), and `/listings/[id]` (on-site detail
  pages, Derrick's own only). Photos hotlinked unmodified from `ddfcdn.realtor.ca`. Compliance furniture
  in place (Powered-by-REALTOR.ca badge, brokerage name, MLS®/REALTOR® trademark statement). Go-live inputs:
  - [ ] **Add the 5 GitHub Actions Secrets** `CREA_DDF_CLIENT_ID`, `CREA_DDF_CLIENT_SECRET`,
    `CREA_DDF_SCOPE`, `CREA_DDF_TOKEN_URL`, `CREA_DDF_API_BASE` (Settings → Secrets and variables →
    Actions; same values as local `.env`). **Blocks the nightly action** — until then the listings grid
    builds empty (graceful).
  - [ ] After adding secrets, run a **`workflow_dispatch` dry-run** to confirm fetch+build+deploy works
    end-to-end; confirm the fetch step logs a listings count and Pages deploys green.
  - [x] ~~Obtain **CREA's official "Powered by REALTOR.ca" logo asset**~~ — DONE: official SVG
    (`powered_by_realtor.svg`, native 125×60) now served as a static file from `public/powered-by-realtor.svg`
    and rendered by `src/components/PoweredByRealtor.astro` (links to the listing on REALTOR.ca, ≥90px wide,
    native ratio, displayed unmodified). Source: CREA DDF forum / `realtor.ca/images/en-ca/powered_by_realtor.svg`.
  - [ ] Confirm the **exact current CREA MLS®/REALTOR® trademark statement wording** against CREA member
    rules; update `src/components/TrademarkStatement.astro` if it differs.
  - [ ] Obtain the **CREA Analytics Web Service API spec (DDF Rule 5c)** and implement it in the inert stub
    `src/lib/crea-analytics.js` (currently gated by empty `CONFIG.creaAnalyticsKey`).
  - [ ] **Data-quality flag (raise with CREA/client):** ~45 of ~805 active listings (incl. ~32 Toronto)
    reference brokerage offices ABSENT from the DDF Office resource (9 office keys return no Office record),
    so those cards show no brokerage name (we never invent one). Verify whether the Office feed is fully
    provisioned, or whether those listings legitimately belong to offices outside this member feed.
  - [ ] **Compliance review:** confirm whether the `/listings/derrick` empty-state page (which currently
    omits the trademark statement since it shows no listings) needs the MLS®/REALTOR® statement under CREA
    member website rules.
  - Paid alternative (not pursued): Repliers API for true live search.
- **Live Google-reviews widget** (researched 2026-06-11; client wants this — post-launch project).
  Prerequisite for every viable route: **Derrick claims his GBP** (already a §1 note).
  Rule regardless of route: bake reviews at build time via nightly GitHub Action → static
  output; never client-side third-party JS (protects cookieless/no-banner + page speed).
  - **Option A — official Places API (New):** reviews field = Place Details Pro SKU
    ($17/1k, 5k calls/mo free → one nightly call is free forever). Hard cap: **5 reviews**,
    Google-chosen, no pagination (decade-old limitation). Needs Google Cloud billing
    account (card on file). Most durable; cap acceptable while reviews are few.
  - **Option B — Google Business Profile API:** ALL reviews (100/page), free; but formal
    access application (3–10+ business days, business justification), GBP verified 60+ days,
    OAuth refresh-token plumbing in CI. The "right" route at scale; overkill at 2 reviews.
  - **Option C — Featurable (freemium middleman over GBP API):** free, unlimited views,
    all reviews; connect the Google account that owns the GBP; has a REST endpoint we can
    call from the Action (avoids their JS embed). Zero Google paperwork; risk = reliance
    on a startup's lifetime-free promise.
  - **Rejected — Elfsight-style embeds:** free tier 200 views/mo then the widget shuts off,
    branding, third-party JS on every page; paid tiers violate $0 budget.
  - Interim (ships now): curated `TESTIMONIALS` + live "Read our Google reviews ↗" buttons.
- Verify the dated regulatory constants in `src/lib/mortgage-math.js` against source before
  relying on calculator output in production (CMHC rates, LTT brackets, FTB rebates, MQR).

## 4. Toolchain notes (deviations from the plan, forced by environment)

- **pnpm, not npm** — `npm` is not installed here. `pnpm install` / `pnpm build` / `pnpm test`
  / `pnpm check`. `pnpm-workspace.yaml` whitelists `esbuild` + `sharp` build scripts.
  `withastro/action@v3` auto-detects pnpm from `pnpm-lock.yaml` in CI.
- **`@astrojs/sitemap` pinned to `3.2.1`** — 3.7.x requires Astro 5's `routes:resolved` hook
  and crashes on Astro 4. Revisit if/when upgrading to Astro 5.
- **`sharp` is an explicit dependency** — Astro's image optimization can't resolve it through
  pnpm's strict linking otherwise.
- `pnpm check` (`astro check`) was added for the type-check; not in the original plan.
