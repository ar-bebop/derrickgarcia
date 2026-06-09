# TODO — derrickgarcia.ca

Phase 1 MVP is **built and green** (`pnpm build`, `pnpm test`, `pnpm check` all pass).
What remains is external configuration + the production go-live, plus optional polish.
Nothing below blocks local development or the build — the site ships today with graceful
call/email fallbacks wherever an external service is not yet configured.

## 1. External service keys — fill before launch

All centralized; empty values render a graceful fallback (never a broken widget).

| Value | File | Empty-state behavior |
|-------|------|----------------------|
| `web3formsAccessKey` | `src/data/config.ts` | Contact form → call/email card |
| `tidycalUrl` | `src/data/config.ts` | Booking → call/email block |
| `cloudflareAnalyticsToken` | `src/data/config.ts` | No analytics script emitted |
| per-agent `realtorCaUrl` / `realBrokerUrl` | `src/data/agents.ts` | "Listings on realtor.ca" link hidden |
| `SITE.social.googleBusiness` | `src/data/site.ts` | Omitted from `sameAs` JSON-LD |

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

## 3. Optional / Phase 2

- Replace the `DG` placeholder favicon + OG image with a real brand mark (currently
  generated from a simple SVG in `public/`).
- Licensed hero photography (old site's banners were generic stock — not migrated).
- Voula Spingos' full bio (source site had none — currently a brief honest one-liner).
- Real testimonials → Reviews page; Home-Evaluation / Sell / Rent-to-Own landings;
  optional live Google-reviews widget. (Separate Phase 2 plan.)
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
