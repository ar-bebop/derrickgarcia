# Listings-First Redesign — Design Spec

**Date:** 2026-06-20
**Status:** Draft for review
**Branch / worktree:** `worktree-redesign-listings-first`
**Supersedes (visually):** parts of `2026-06-09-midnight-estate-redesign-design.md` (the dark visual system is *evolved*, not replaced)
**Validated via:** interactive browser mockups during brainstorming (aesthetic direction, full homepage, listings browse + detail). Mockups live in this session's `.superpowers/brainstorm/.../content/` (`direction.html`, `homepage.html`, `listings.html`).

---

## 1. Summary

Rework the site so it reads, immediately, as **a realtor's site**: real property listings are the first thing a visitor sees and the spine of the experience. Surface the information a buyer or seller actually wants on the pages themselves instead of behind navigation, and modernize the visual system with purposeful motion and a few real features (live filtering, an interactive map, a live calculator).

Three concrete user-driven goals:

1. **Listings front-and-center.** The homepage leads with listings. **Derrick's own listings appear first** (and the section is *hidden* when he has none — true today), followed by **his company's listings** (Real Broker Ontario).
2. **Nothing useful hidden behind a button.** Phone number, a working listing search, a live calculator, a valuation prompt, Derrick's profile, area links, reviews, and full contact details all live on the page.
3. **Modern, animated, "go all out."** A refined dark-luxury system ("Evolved Midnight") with scroll motion, an interactive map, live client-side filtering/sort/search, a photo-gallery lightbox, and an inline mortgage calculator — all respecting `prefers-reduced-motion`.

This pass covers the **shared design system + Header/Footer**, the **homepage**, the **listings browse page**, and **listing detail pages**. Other content pages (sell, calculators, guides, areas, about, contact, reviews) inherit the refreshed tokens/nav/footer automatically; deep per-page redesign of those is a follow-up.

## 2. Why (UX critique of the current site)

- The homepage shows **zero listings** — the hero is text-only, and properties are two clicks away at `/listings`. For a realtor's site this buries the lede.
- Most client-relevant content is **linked-out**: calculators are cards that navigate away, the team is a preview → `/about`, guides are titles → separate pages, reviews → external, contact info → footer/`/contact`.
- The visual system is intentionally minimal with a single fade-up animation; it's tasteful but reads as "static brochure," not "modern, alive."
- Listing detail pages exist **only for Derrick's own listings** (currently zero), so every property card sends visitors **off-site** to realtor.ca.

## 3. Decisions locked in brainstorming

| # | Decision | Choice |
|---|----------|--------|
| D1 | Visual direction | **A · Evolved Midnight** — keep Real Broker's dark charcoal + gold brand equity, modernized (cinematic imagery, depth, motion). Not a light/editorial flip. |
| D2 | Branding | **Use Derrick's real assets** — headshot/profile, DG mark + full logo, Real Broker wordmark + emblem. |
| D3 | Detail pages | **On-site detail for ALL listings** (~805). Cards link internally to `/listings/[id]`; realtor.ca becomes a secondary "official source" link on the detail page. |
| D4 | Map | **Real interactive map** — Leaflet + free tiles (OSM/Carto), clustered pins from listing `lat`/`lng`. |
| D5 | Photography | **Real photos.** Toronto image(s) behind the hero (existing licensed assets) **plus GTA-area photos — Brampton and surrounding markets** for the Areas section. New imagery must be sourced free-licensed with credits (see §10). |
| D6 | Scope | **Design system + Home + Listings/Detail** this pass; other pages inherit the refreshed look. |
| D7 | "Nightly" messaging | **Removed.** No "updated nightly / updated from MLS" copy — it implies staleness/lag. |

## 4. Visual system — "Evolved Midnight"

Evolve the existing AA-verified dark system (`src/styles/tokens.css`); do not start from scratch. Every token change must **re-pass WCAG AA** against the new background.

**Surfaces & ink (proposed; finalize with AA check):**
- `--color-bg` `#0e0e10` (deepened from `#121212`)
- `--color-panel` `#16161a`, add `--color-panel-2` `#1b1b21` for layered surfaces
- `--color-ink` `#f4efe6`, `--color-text` `#c8c2b5`, `--color-muted` `#948e80`
- `--color-accent` (gold) keep in the brand family — `#c6a15b` (slightly brighter than `#b08d57` for vibrancy on the darker bg)
- add `--color-accent-bright` `#e7c987` for emphasis/large display only (verify AA for any small text use)
- `--color-accent-ink` `#15130f` (text on gold)
- hairlines: `--color-line` `rgba(198,161,91,.18)`, `--color-line-strong` `rgba(198,161,91,.36)`, neutral `--hair` `rgba(255,255,255,.07)`

**Type:** keep self-hosted **Marcellus** (display/serif) + **Source Sans 3** (body). Add a geometric/grotesk UI face for labels, kickers, buttons, and numerals — **Space Grotesk** (self-hosted via `@fontsource`, consistent with the project's font strategy). Display scale grows for cinematic heroes (`clamp` up to ~5rem on the homepage hero).

**Shape & depth:** keep sharp `--radius` (2–4px). Introduce subtle elevation on hover (translateY + soft shadow), gold focus rings, and gold radial "glow" accents on dark heroes.

**Motion language (new) — codify as reusable tokens/utilities; all gated behind `prefers-reduced-motion: no-preference`:**
- **Reveal on scroll** — fade + 16–22px rise via `IntersectionObserver` (extend the existing `.reveal` mechanism in `BaseLayout.astro`).
- **Sticky nav** — translucent blur + condense after 40px scroll; thin gold **scroll-progress bar**.
- **Hero parallax** — gentle translate on the background glow/photo.
- **Animated counters** — hero stats count up once on first view.
- **Card hover** — lift + 4:3 image zoom (`scale(1.06)`).
- **Gallery lightbox** — fullscreen overlay with caption/attribution.
- **Map pin hover** — scale + raise.
- Reduced-motion users get the final state immediately (no animation), and no-JS users get content fully visible (progressive enhancement, matching today's `.reveal` no-JS fallback).

## 5. Information architecture & navigation

- **Header:** DG mark + "Derrick Garcia" wordmark with a small "Real Broker Ontario" sub-label; primary links — **Listings · Sell · Home Value · Calculators · Areas · About**; always-visible **phone** `416-684-7370` and a **Book a Call** CTA. Glassy/blur sticky behavior. Mobile keeps the existing hamburger pattern, restyled.
- **Footer:** full **NAP** (Derrick Garcia · Real Broker Ontario LTD · 130 King St W, Unit 1800B, Toronto, ON M5X 1E3 · +1 416-684-7370 · info@derrickgarcia.ca), Explore/Tools/Connect columns, Instagram `@derrickgarcia__` + Facebook, **Real Broker wordmark + DG logo**, and the legal bar with the REALTOR®/MLS® trademark statement + "Powered by REALTOR.ca." NAP must stay byte-identical to existing usage.

## 6. Homepage design (top → bottom)

All counts/stats are **computed at build time from the live data**, never hardcoded.

1. **Hero** — cinematic dark hero over a **real licensed Toronto photo** + dark gradient overlay + gold glow (gradient/skyline fallback if no photo). Kicker "Real Broker Ontario · Toronto & GTA," large Marcellus headline, one-line lede (no "nightly" copy). A **working listing search bar** (location / price / beds → routes to `/listings` with query). **Animated stat row** derived from data (e.g., # listings in Derrick's markets, median price, # markets = 26). An **agent chip** with Derrick's headshot: "Brokered by Derrick Garcia · Broker, Real Broker Ontario." Scroll cue.
2. **Derrick's Listings** *(conditional)* — renders **only when `DERRICK_LISTINGS` is non-empty**, immediately below the hero, above company listings. Gold "Derrick's Listing" tag; cards link to on-site detail. Hidden entirely when empty (today → page opens into company listings).
3. **Featured company listings** — "Real Broker Ontario" — a grid/rail of recent listings in Derrick's markets, each card → `/listings/[id]`. "View all listings →" → `/listings`.
4. **Map teaser** — "Browse the GTA by map" → the real map on `/listings` (mini static teaser on the homepage to keep it light; full Leaflet map on the listings page).
5. **Plan your purchase (live tools)** — an **inline, live mortgage calculator** (correct Canadian semi-annual compounding: `i = (1 + r/2)^(1/6) − 1`) plus quick links to Affordability, Land Transfer Tax, Rent-to-Own readiness, Deposit Lending. Surfaces a real estimate on the page.
6. **Sell / valuation** — "What's your home worth today?" with an **inline address field** (lead capture) → valuation flow.
7. **Meet Derrick** — real headshot, Broker role, short real bio, Real Broker emblem, Book-a-call + phone, and **Pina & Voula** (Agents) with real headshots.
8. **Areas** — GTA markets grid with **real area photos (Toronto, Mississauga, Brampton, Caledon, Bolton, Orangeville)** and build-derived listing counts → area pages.
9. **Reviews** — social-proof cards; **auto-hides when none configured** (honest empty state); swaps to Derrick's real Google reviews when available.
10. **Guides** — the four evergreen guides as cards.
11. **Final CTA + footer** — full NAP, social, logos, compliance.

## 7. Listings browse page (`/listings`)

- **Header + sticky filter bar:** location, price, beds, type, **sort** (newest / price ↑ / price ↓), and a **Grid ⇄ Map** segmented toggle. Quick **filter chips** (Toronto, Mississauga, Brampton, Milton, Richmond Hill, Houses, Condos, Under $X). Result **count updates live**.
- **Derrick's band first** (conditional, as on the homepage), then the **company grid** of listings in Derrick's markets (`LISTINGS` filtered by `inDerricksMarkets`).
- **Filtering/sort/search are client-side** over a build-time JSON index (see §9). No-JS users get the full server-rendered grid (SEO-safe), matching today's progressive-enhancement approach.
- **Map view:** real **Leaflet** map, clustered pins from `lat`/`lng`, click pin → card popup → detail; synced scrollable side-list.
- **Compliance furniture** at the foot of the listings: "Powered by REALTOR.ca" badge + brokerage (Real Broker Ontario LTD.) + REALTOR®/MLS® trademark statement.
- **Included (lightweight):** "Saved" favorites via `localStorage` (no account) — heart toggle on cards + a "Saved" filter. No backend; degrades gracefully without JS.

## 8. Listing detail page (`/listings/[id]`) — for ALL listings

Extend the **existing** `[id].astro` (which already handles compliance correctly) from Derrick-only to all listings:

- **`getStaticPaths` over `LISTINGS`** (all ~805) instead of `DERRICK_LISTINGS`. ~805 static pages; acceptable for Astro. Photos are **hotlinked** (not downloaded) → no asset bloat.
- **Layout:** breadcrumb (Listings · City), address/price/specs header, **photo gallery with thumbnail swap + lightbox** ("View all N photos"), description prose, a **key-facts table**, **similar listings** rail.
- **Sticky contact card:** Derrick's headshot + "Broker · Real Broker Ontario," a request-a-showing form (Web3Forms), and the phone number.
- **Mini-map** of the listing location (Leaflet single marker) when `lat`/`lng` present.
- **Compliance (mandatory, reuse existing components):** `PoweredByRealtor`, brokerage name, `TrademarkStatement`, `ListingSchema` (JSON-LD). **Keep the secondary "View on REALTOR.ca ↗" link** as the official source. **Photos must remain unmodified** — hotlink the watermarked `ddfcdn.realtor.ca` URLs; CSS `object-fit` for layout is fine, but **no filters/overlays/recompression** (preserve the existing "no CSS filter on listing photos" rule).
- **CREA DDF analytics:** keep the gated `reportListingView` call (inert until `creaAnalyticsKey` is set) — now firing for all detail pages. Confirm DDF reporting expectations for displayed listings during implementation.
- The legacy `/listings/derrick` route: **301 → `/listings`** (Derrick's listings are surfaced there via the Derrick-first band); keep a redirect stub for legacy URLs.

## 9. Data & client-side architecture

- **Source of truth unchanged:** the nightly DDF fetch pipeline (`src/lib/ddf.js` + scripts) writes `src/data/generated/listings.json` (+ `listings-derrick.json`), exposed via `src/data/listings.ts` (`LISTINGS`, `DERRICK_LISTINGS`, `RELEVANT_MARKETS`, `inDerricksMarkets`, `Listing` type with `lat/lng/isDerrick/photos`).
- **Build-time rendering** of all cards/detail pages (SEO + no-JS). 
- **Client-side interactivity** (filter/sort/search/map/favorites) hydrates over a **compact JSON index** emitted at build — only the fields needed for browse (id, price, beds, baths, type, city, lat, lng, primaryPhoto, isDerrick). **Ship the full ~805 index** but **default the browse filter to Derrick's markets (~322)**, with a **"Show all Real Broker Ontario (Ontario-wide)" toggle** so every detail page stays reachable. Keep the index lean; the island/script loads only on `/listings`.
- **Map:** Leaflet (+ marker-cluster) with free raster tiles (OSM or Carto Positron/dark to match the theme). Pin the in-markets listings; popups link to detail.
- **Counts/medians/market-count** computed at build from the data and passed to templates (no hardcoded "805/780K").

## 10. Photography & content needs

- **Hero:** reuse existing free-licensed `src/assets/photos/toronto-skyline-*.jpg` behind the overlay.
- **Areas (new):** source free-licensed photos for **Toronto, Mississauga, Brampton, Caledon, Bolton, Orangeville** (Unsplash/Pexels/Wikimedia with permissive licenses). Add each to `src/assets/photos/` and record attribution in `src/assets/photos/CREDITS.md` (existing pattern). **This is a content task to flag in `TODO.md`.** Until sourced, area cards fall back to tasteful gradient tiles (no broken images, no fabricated credits).
- Optional later: licensed lifestyle/agent photography; real testimonials; Voula's full bio (already tracked in `TODO.md`).

## 11. Components (new / changed)

- **New:** `ListingsBrowser` (client island: filter/sort/search state, grid+map toggle), `ListingsMap` (Leaflet island), `Gallery`/`Lightbox`, `MortgageMini` (homepage live calc island), `StatCounter`, `Reveal` utility, `SearchBar` (hero), `AreaCard`, `DerrickListings` band, `ContactCard` (detail sidebar).
- **Changed:** `Header`, `Footer`, `ListingCard` (internal link + tags + favorite), `BaseLayout` (motion tokens + reveal), `index.astro` (full rebuild), `listings/index.astro` (browse + map + Derrick-first), `listings/[id].astro` (all listings + gallery/lightbox/mini-map/contact card), `tokens.css`/`global.css` (evolved system).
- **Reuse as-is:** `PoweredByRealtor`, `TrademarkStatement`, `ListingSchema`, the calculators' math module (`src/lib/mortgage-math.js`), `LeadForm`/Web3Forms.

## 12. Compliance (CREA DDF) — non-negotiable

On every listings/detail surface: **"Powered by REALTOR.ca"** badge + **listing brokerage name** (DDF Office resource → "Real Broker Ontario LTD.") + **REALTOR®/MLS® trademark statement**. Display **unmodified, watermarked** `ddfcdn.realtor.ca` photos via hotlink — no crop-to-file/overlay/recompress/filter (CSS `object-fit` for layout is acceptable). Keep CREA DDF analytics gated/inert until keyed.

## 13. Accessibility & performance

- WCAG **AA** contrast for all evolved tokens; visible focus rings; keyboard-operable filter bar, map, gallery/lightbox; `prefers-reduced-motion` fully honored; respects no-JS (content visible, listings rendered).
- Keep the site fast: hero photo responsive/optimized via Astro assets; Leaflet + cluster + the JSON index load **only on `/listings`**; homepage stays light (static teaser, not full map). Lazy-load listing images. Target: no regression vs current Lighthouse.

## 14. Out of scope (this pass) / follow-ups

- Deep per-page redesign of sell/calculators/guides/areas/about/contact/reviews (they inherit the new system now).
- Live Google-reviews widget (separate deferred plan).
- Go-live config (Web3Forms key, TidyCal, Cloudflare token, profile URLs) — already tracked in `TODO.md`.
- Sourcing GTA-area photography — flagged as a `TODO.md` content task.

## 15. Resolved details (considered & decided)

- **Favorites:** included as a lightweight `localStorage` heart toggle + "Saved" filter (no backend).
- **Index breadth:** ship the full ~805 index; browse defaults to Derrick's markets (~322) with an Ontario-wide toggle, so every detail page is reachable.
- **`/listings/derrick`:** 301 → `/listings` (the Derrick-first band covers it); redirect stub retained for legacy URLs.
- **Token values:** the §4 palette is a starting point — final hex values are confirmed against WCAG AA in the first implementation task.
