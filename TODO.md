# TODO — derrickgarcia.ca

Phase 1 MVP **and the Phase 2 "Midnight Estate" redesign** are built and green
(`pnpm build`, `pnpm test`, `pnpm check` all pass). Phase 2 added the dark visual system,
Sell / Home Valuation / Rent to Own / Reviews pages, the Guides hub, and legacy-URL redirects
(spec: `docs/superpowers/specs/2026-06-09-midnight-estate-redesign-design.md`).
What remains is external configuration + the production go-live, plus optional polish.
Nothing below blocks local development or the build — the site ships today with graceful
call/email fallbacks wherever an external service is not yet configured.

## 1. External service keys — fill before launch

All centralized; empty values render a graceful fallback (never a broken widget).

| Value | File | Empty-state behavior |
|-------|------|----------------------|
| ~~`web3formsAccessKey`~~ ✅ filled | `src/data/config.ts` | **Go-live:** key delivers to aribeir4@gmail.com (testing); relink to `info@derrickgarcia.ca` first |
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

- **Guide content review before go-live** — regulatory figures (MQR, CMHC, GDS/TDS, LTT
  brackets/rebates, FHSA/HBP) and the Oliver's RTO program facts in `src/content/guides/`.
- **Real testimonials** → `TESTIMONIALS` in `src/data/config.ts` (Reviews page + Home teaser
  render automatically; ships with honest Google link-out empty state).
- **Stats review** — Home value strip uses bio-sourced figures (99.9% list-to-sell, 21 yrs
  licensed, 3 languages) in `src/data/site.ts`; confirm or replace with Derrick's preferred numbers.
- ~~**Deposit Lending**~~ ✅ resolved (2026-06-11) — built as `/deposit-lending` (on-site explainer →
  money2close.com). Derrick confirmed: no referral relationship (current copy + plain link correct;
  do NOT add `rel="sponsored"`), framings approved, and the old site had a single "Deposit Lending"
  nav item (no separate Lending target exists).
- Voula Spingos' full bio (source site had none — currently a brief honest one-liner).
- **Area pages fact review (Phase 3)** — the five `/areas/` pages ship evergreen,
  verifiable facts only; review flagged characterizations before go-live:
  - Caledon: Greenbelt scarcity "underpins long-term value" framing.
  - Bolton: "walkable main-street amenities" in the village core.
  - Orangeville: "Broadway is a working downtown" framing; GO-bus-to-Brampton service
    (re-verify schedules at go-live); the $4,000 FTB rebate is a regulatory constant —
    re-check periodically.
  - Brampton: "one of Canada's largest and youngest big cities"; Mount Pleasant
    "commuter-first"; Bramalea "renovators look for"; Springdale/Castlemore
    "executive homes".
  - Mississauga: condos "typically at a discount to comparable Toronto product";
    the status-certificate/reserve-fund review workflow claim (confirm team practice);
    Hazel McCallion LRT is described as **under construction** — update the copy when
    it opens (2028–29 per Metrolinx).
  - About page: "We work where we live" lede line implies team-wide residency across the
    five towns — only Derrick's Caledon base is bio-verifiable; confirm he's comfortable.
  - New towns later: one at a time, never templated batches (anti-doorway rules in
    docs/superpowers/specs/2026-06-10-location-pages-design.md).

## 3b. Optional / later

- Replace the `DG` placeholder favicon with a real brand mark (OG image now dark-brand,
  regenerate via `node scripts/og-image.mjs`).
- Licensed hero photography if Derrick buys any (current heroes are verified, credited
  free-license Toronto photos — see `src/assets/photos/CREDITS.md`).
- **Listings/DDF integration** (deferred, own plan): CREA REALTOR.ca DDF® feed is free for
  members — Derrick applies via CREA → feed credentials → nightly GitHub Action bakes a
  featured-listings page (compliance: "Powered by REALTOR.ca" logo + link-back). Paid
  alternative: Repliers API for true live search.
- Optional live Google-reviews widget.
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
