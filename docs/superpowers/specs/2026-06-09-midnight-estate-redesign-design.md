# derrickgarcia.ca — "Midnight Estate" redesign + functional parity (Phase 2)

**Date:** 2026-06-09 · **Status:** approved (user) · **Builds on:** Phase 1 MVP
(`2026-06-09-derrickgarcia-static-site-design.md`), which stays authoritative for
hosting, forms, booking, analytics, DNS, and calculator math.

## 1. Goal

Phase 1 shipped a functional but visually bare site. This phase delivers:

1. A full visual redesign — direction **"Midnight Estate"** (dark, quiet-luxury), chosen by the
   user from three mocked directions in the visual companion.
2. Functional parity with the old Lofty site **minus listings/IDX and minus the blog**:
   new **Sell**, **Home Valuation**, **Rent to Own**, and **Reviews** pages.
3. A **Guides** hub (4 evergreen articles) replacing the old dated blog posts (user judged
   them filler; agreed replacement).

**Out of scope (deferred, documented in §10):** DDF/MLS listings integration; Deposit/Lending
nav targets; real testimonials/stats (slots built, content pending Derrick).

## 2. Visual design system — "Midnight Estate"

Dark, quiet luxury. Near-black surfaces, hairline gold rules, roman serif display type,
generous spacing, restrained motion. The brand gold is sampled from the Real Broker emblem.

### 2.1 Color tokens (`src/styles/tokens.css` — replaces light palette)

All pairs verified ≥ 4.5:1 (WCAG AA, normal text) against their intended backgrounds.

| Token | Value | Role | Contrast on `#121212` |
|---|---|---|---|
| `--color-bg` | `#121212` | page background | — |
| `--color-panel` | `#1a1a1a` | cards/panels | — |
| `--color-ink` | `#f3efe7` | headings | ~15.9:1 |
| `--color-text` | `#c9c3b8` | body | ~10.9:1 |
| `--color-muted` | `#9a9486` | secondary/captions (smallest text) | ~6.3:1 |
| `--color-accent` | `#b08d57` | gold — links, kickers, CTAs | ~6.2:1 |
| `--color-accent-ink` | `#15130f` | text on gold buttons | ~6.1:1 on gold |
| `--color-line` | `rgba(176,141,87,.25)` | hairline borders | decorative only |
| `--color-line-strong` | `rgba(176,141,87,.45)` | emphasized rules | decorative only |

Do **not** ship text in the mockup's faintest gray (`#6f6a61`, ~3.5:1 — fails AA); use
`--color-muted` instead. Gold-on-panel (`#1a1a1a`) is ~5.6:1 — acceptable.

### 2.2 Typography

- **Display:** Marcellus (400 only) — headings, stat numbers, blockquotes, logo wordmark.
- **Body:** Source Sans 3 (400/600) — everything else.
- **Self-hosted** via `@fontsource/marcellus` + `@fontsource/source-sans-3` (woff2,
  `font-display: swap`). No Google Fonts CDN (privacy + performance on GitHub Pages).
- Scale: hero `clamp(2.4rem, 5vw, 3.4rem)`; section heads `clamp(1.6rem, 3vw, 2rem)`;
  body 1rem/1.65; kickers 0.6875rem uppercase, letter-spacing `.28em`, gold.

### 2.3 Components (shared, in `global.css` or small `.astro` components)

- **Kicker** — gold uppercase label above headings.
- **Buttons** — `.btn` gold fill / ink text, uppercase, letter-spaced; `.btn--ghost`
  transparent, 1px ivory-45% border; hover: subtle lightening + 0.2s ease; visible
  `:focus-visible` gold outline (existing rule kept).
- **Card** — `--color-panel` or transparent with `--color-line` border; hover border →
  solid gold.
- **Section** — consistent block padding (`clamp(3rem, 7vw, 5rem)`), max-width 1100px
  container (existing `--maxw`).
- **Hairline dividers** — gold-alpha borders, as in approved mockups.

### 2.4 Motion

- One pattern: fade-up reveal on scroll (IntersectionObserver adding a class; CSS
  transition 0.5s ease, 12px translate). Tiny inline script in `BaseLayout`.
- All animation wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Hover transitions on borders/buttons only. No parallax, no autoplaying anything.

### 2.5 Imagery

- **Verified Toronto photos (Unsplash, already visually confirmed CN-Tower-genuine):**
  - `photo-1486325212027-8081e485255e` — night skyline → **Home hero**
  - `photo-1507992781348-310259076fe0` — sunset over water → **Sell / Valuation**
  - `photo-1517090504586-fde19ea6066f` — island park view → **Contact-CTA band / About**
- Additional pages (Rent to Own, Guides, Reviews) may add free-license photos under the
  same process: download from Unsplash/Pexels → **visually verify** → self-host.
- All photos: downloaded into `src/assets/photos/`, optimized through Astro `<Image>`
  (webp, responsive widths), dark gradient overlays for text contrast.
- **`src/assets/photos/CREDITS.md`** records source URL + license for every photo
  (Unsplash License: free commercial use, no attribution required; credit anyway).
- Headshots + Real Broker logos: existing real assets, unchanged.
- Old Lofty stock banners remain banned (license unknown).

### 2.6 Accessibility

- All text tokens AA-verified (table above). Focus outlines kept. Semantic landmarks
  (`header/nav/main/footer`), skip link in `BaseLayout` if not present.
- `prefers-reduced-motion` respected (§2.4). Form labels explicit. Mobile nav is a real
  disclosure (`button[aria-expanded]`), focus-trapped not required (simple panel, ESC closes).
- Update `/accessibility` statement to describe the dark theme, contrast guarantees, and
  reduced-motion support.

## 3. Information architecture

```
Header (dark, hairline gold bottom border)
  Logo: "DERRICK GARCIA" (Marcellus, GARCIA in gold) → /
  Sell ▾        → Sell My Home (/sell) · Home Valuation (/home-valuation)
  Rent to Own   → /rent-to-own
  Tools ▾       → Mortgage (/mortgage-calculator) · Affordability (/affordability-calculator) · Land Transfer Tax (/land-transfer-tax)
  Guides        → /guides
  About ▾       → Team (/about) · Reviews (/reviews) · Contact (/contact)
  tel link (gold): 416-684-7370
Mobile: hamburger → full-screen dark panel, flat list (submenu items inlined), ESC/✕ closes.
```

- "Search Homes ↗" remains a **link-out** (realtor.ca per `SITE.listingsSearchUrl`) in hero
  + footer; no Buy dropdown (nothing to put under it without IDX).
- Dropped from old nav: Deposit, Lending (targets unknown — restore when Derrick supplies
  URLs, see §10), Register/Sign In (CRM), All/Featured/Sold Listings (IDX).
- Footer (4 columns, as approved mockup): NAP block (byte-identical) · Explore · Tools ·
  Connect (Instagram, Facebook, Book a Call, Contact) + legal row (Privacy · Accessibility
  · © line). Small Real Broker wordmark.

## 4. Pages

### 4.1 Home (`/`) — rebuilt to approved mockup (11 sections)

1. Nav 2. Hero (night skyline; kicker "Real Broker Ontario · Toronto & GTA"; H1
"A higher standard for Toronto real estate."; sub; CTAs **Work With Us** → /contact,
**Search Homes ↗**) 3. Value strip (3 value props; upgrades to real stats when supplied —
slot in `src/data/site.ts`) 4. Tools (3 calculator cards) 5. Sell split (valuation CTA +
sunset photo) 6. Rent-to-own gold band 7. Team (3 real headshots, names/roles, Derrick's
phone/email) 8. Review teaser (renders **only if** `TESTIMONIALS` non-empty; else section
hidden) 9. Guides teaser (4 links) 10. Contact CTA band (Book a Call → TidyCal fallback
pattern; Contact) 11. Footer.

### 4.2 Sell My Home (`/sell`) — new

Hero (sunset photo, dark overlay) · intro (old site's real copy, cleaned: "We love working
with sellers…") · **the real 6-step plan** from the old site as a numbered process grid:
Marketing Analysis & Pricing / Home Preparation & Staging / Marketing & Showings / Offers &
Negotiation / Contract & Paperwork / Closing & Beyond (one honest sentence each) · CTA pair
(Home Valuation, Contact).

### 4.3 Home Valuation (`/home-valuation`) — new

Headline (old site's real hook, recased: "What's your home worth? Find out fast and free.")
· explainer ("real comparables, not an algorithm — Derrick prepares it personally, no
obligation") · **valuation form** = `LeadForm` extended via props with fields: address
(required), property type (select), beds, baths, timeframe-to-sell (select), name/email/phone,
notes. Posts to Web3Forms with `subject: "Home valuation request"`; honeypot+hCaptcha as
existing. **Fallback:** no `web3formsAccessKey` → call/email card (existing pattern). ·
Below form: "prefer to talk?" → tel/booking links.

### 4.4 Rent to Own (`/rent-to-own`) — new

Real program copy from old site, **spelling corrected, facts preserved**: Oliver's Rent To
Own program intro (12+ years, RTO-certified realtors incl. Derrick) · "Who benefits" list
(consumer proposal/bankruptcy history; poor payment record/excess debt; self-employed; new
Canadians; divorced; limited job history) · Financial considerations (income $200,000+ GTA /
$80,000+ outside; ~5% down used as deposit; budget ≈ 4–4.5× household income) · the
original disclaimer (cleaned) · CTA: contact Derrick. No stock graphics — typographic
layout with gold rules.

### 4.5 Reviews (`/reviews`) — new

Driven by `TESTIMONIALS: { quote, name, source, location? }[]` in `src/data/config.ts`
(ships **empty** — old site had zero real reviews). Empty state: honest "Read our reviews
on Google" + "Leave a review" CTAs (render only when `SITE.social.googleBusiness` set;
else call/email card). Non-empty: quote cards (Marcellus blockquotes) + the same Google
CTAs. `Review`/`AggregateRating` JSON-LD **only when real reviews exist** (never fabricate).

### 4.6 Guides (`/guides`, `/guides/<slug>`) — new

Astro **content collection** (`src/content/guides/`, 4 Markdown articles, schema:
title/description/date/calculator?/order):

1. `first-time-buyer-toronto` — programs, deposits vs down payment, closing costs, LTT
   rebates (links Affordability + LTT calculators).
2. `mortgage-stress-test` — MQR `max(rate+2%, 5.25%)`, why it exists, worked example
   (links Mortgage + Affordability calculators).
3. `toronto-land-transfer-tax` — Ontario + Toronto double LTT, brackets, FTB rebates,
   worked example (links LTT calculator).
4. `rent-to-own-explained` — how RTO works generally + Derrick's program specifics
   (links /rent-to-own).

Content rules: factual Canadian content consistent with `mortgage-math.js` constants and
the research appendix; every regulatory number date-stamped in prose ("as of 2026");
**Derrick reviews before go-live** (added to TODO). Each guide ends with a contact CTA.
Index = simple editorial list (title + dek + read time). `Article` + `BreadcrumbList`
JSON-LD per guide.

### 4.7 Restyled existing pages

- **About** (`/about`): dark redesign; larger portrait treatment; existing real bios
  unchanged; per-agent realtor.ca/Real Broker link slots unchanged.
- **Contact** (`/contact`): redesign; LeadForm + TidyCal + NAP card unchanged in behavior.
- **Calculators** (3 pages): same islands + tested math, restyled — dark inputs/cards,
  gold result highlights; form controls get explicit dark styling (`color-scheme: dark`).
- **Privacy / Accessibility / 404 / Thanks**: restyle; accessibility text updated (§2.6);
  404 gets night-skyline treatment + helpful links.

## 5. Data & config additions

- `src/data/config.ts`: `TESTIMONIALS` (empty array).
- `src/data/site.ts`: optional `stats?: { value, label }[]` (empty → value-prop strip).
- `src/content/config.ts`: guides collection schema.
- No changes to Phase 1 keys/fallback patterns.

## 6. Technical approach

- Astro 4 + vanilla CSS custom properties (no framework/Tailwind change). Astro 5 upgrade
  stays out of scope.
- New deps: `@fontsource/marcellus`, `@fontsource/source-sans-3` only.
- Header/Footer/BaseLayout rewritten once; all pages consume the shared system.
- Existing JSON-LD components kept; add Article/Breadcrumb for guides.
- Per-page meta/OG retained; regenerate OG default image to match dark brand (simple SVG →
  PNG, same pipeline as Phase 1 favicon).
- Performance: self-hosted woff2 ×2 weights + optimized images; no JS beyond existing
  islands + nav toggle + reveal observer (~1 KB inline).
- **Legacy URL continuity:** meta-refresh + canonical redirect stubs for old Lofty routes
  that have new equivalents: `/evaluation` → `/home-valuation`, `/myteam` → `/about`,
  `/mortgage-calculator-1` → `/mortgage-calculator`, `/affordability-calculator-1` →
  `/affordability-calculator`, `/blog` → `/guides`. (IDX/listing routes get none — gone.)

## 7. Error handling / empty states

Everything keeps Phase 1's rule: **missing external value → graceful, honest fallback**
(call/email card; section hidden; link omitted). New surfaces: valuation form (key),
reviews (testimonials + GBP URL), stats strip (stats array). No broken widgets, ever.

## 8. Testing & verification

- `pnpm test` (22 unit tests) must stay green — math untouched.
- `pnpm check` (astro check) 0 errors; `pnpm build` green.
- Manual pass on `pnpm preview`: every page in desktop + ~375px mobile; nav dropdowns +
  mobile panel; both forms' fallback states; calculators produce identical numbers
  pre/post restyle (spot-check against current site).
- Contrast spot-check of rendered pages against §2.1 table.

## 9. Alternate directions (archived for client pitch)

- **B — "Gallery Light":** warm ivory editorial; Fraunces + Public Sans; asymmetric hero,
  sculpted photo shapes, pill buttons. Approachable/modern.
- **C — "Skyline Classic":** light conventional realtor layout; DM Serif Display + Nunito
  Sans; full-bleed photo hero, centered headline, action bar where the old IDX search sat.
- Mockups preserved at `.superpowers/brainstorm/2296534-1781060101/content/direction.html`
  (gitignored — copy out if the client wants them).

## 10. Deferred (carry to TODO)

1. **Listings (DDF):** recommended path = CREA **REALTOR.ca DDF®** feed (free for members):
   Derrick applies via CREA → feed credentials; nightly GitHub Action pulls listings →
   static featured-listings page; compliance = "Powered by REALTOR.ca" logo + link-back +
   trademark statement. Alternative: Repliers API (paid, true live search, needs key proxy).
   Own design+plan when credentials exist.
2. **Deposit / Lending** nav items — need Derrick's target URLs.
3. **Real stats** (value strip upgrade) + **real testimonials** (Reviews) + Voula's full bio.
4. **Derrick's review of guide content** before go-live (regulatory numbers, RTO program facts).
