# Design: derrickgarcia.ca — static rebuild

**Date:** 2026-06-09
**Status:** Draft for review
**Author:** Claude + ar-bebop

## 1. Goal

Rebuild realtor **Derrick Garcia**'s website (currently on crm.lofty.com, expensive, CRM
features unused) as a **static site hosted on GitHub Pages** at the existing domain
**derrickgarcia.ca**. Cut recurring cost to ~$0/mo (domain renewal only), keep the marketing
value of the site, and drop everything that depended on the Lofty CRM/IDX platform.

Reference snapshot of the old site lives in `extracted/` (see `extracted/SITE-MAP.md`,
`extracted/ASSETS.md`).

## 2. Decisions locked in (from brainstorming)

- **Listings/IDX:** No MLS/IDX feed hosted (licensed, can't rehost). Listings = **link-out** to
  Derrick's realtor.ca agent profile + Real Broker.
- **Budget:** Free-first. $0/mo target; pay only when a free tier is outgrown (clean upgrade path required).
- **Blog:** Dropped. No blog on the new site.
- **Scope:** Lean MVP first; remaining pages in later phases.
- **Stack:** **Astro** + vanilla CSS, deployed to **GitHub Pages via GitHub Actions**.
- **Booking:** **TidyCal** (free, two-way iCloud/CalDAV sync — Derrick uses Apple Calendar).
- **Land Transfer Tax calculator:** Included in MVP (third calculator).

## 3. Architecture

### 3.1 Stack
- **Astro** static site generator. Rationale: one shared `BaseLayout` + `Header`/`Footer`
  (no copy-paste across pages), ships zero JS except where we opt in (calculator islands),
  `.astro` files read like HTML for future non-expert edits.
- **Vanilla CSS** with custom properties for the brand palette/typography (extract variables
  from the captured `extracted/css/styleAndTheme.css`). No Tailwind, no CSS framework.
- **No backend.** All dynamic behavior is either client-side JS (calculators) or a third-party
  embed/endpoint (forms, booking, analytics).

### 3.2 Hosting & deploy
- **GitHub Pages**, built by **GitHub Actions** (`withastro/action` → `actions/deploy-pages`).
  Settings → Pages → Source = GitHub Actions. Never commit `dist/`.
- `astro.config.mjs`: `site: 'https://derrickgarcia.ca'`. **Do NOT set `base`** to a repo name —
  apex custom domain serves from root; wrong `base` breaks all asset paths.
- `CNAME` file (`derrickgarcia.ca`) lives in **`public/`** so the build doesn't wipe it.
- Enforce HTTPS once DNS verifies (GitHub provisions Let's Encrypt).

### 3.3 Repo structure
```
derrickgarcia/                     (repo root)
├─ .github/workflows/deploy.yml
├─ astro.config.mjs
├─ package.json
├─ public/
│  ├─ CNAME                        # derrickgarcia.ca
│  ├─ favicon.svg + favicon set    # NEW — Lofty default dropped
│  ├─ robots.txt
│  └─ sitemap.xml                  # (or Astro-generated)
├─ src/
│  ├─ layouts/BaseLayout.astro     # <head>, header, footer, meta, analytics — ONE place
│  ├─ components/
│  │  ├─ Header.astro  Footer.astro
│  │  ├─ AgentCard.astro
│  │  ├─ LeadForm.astro            # reusable Web3Forms form
│  │  ├─ MortgageCalculator.astro
│  │  ├─ AffordabilityCalculator.astro
│  │  └─ LandTransferTaxCalculator.astro
│  ├─ lib/mortgage-math.js         # shared Canadian finance math (named, dated constants)
│  ├─ data/agents.ts               # name, bio, headshot, realtor.ca + Real Broker links
│  ├─ pages/                       # file = route (see §4)
│  └─ styles/global.css
└─ src/assets/                     # Astro-optimized images (headshots, logos)
```
- `extracted/` stays as **reference only**, excluded from the build (not part of the site).

## 4. Site structure

### MVP (Phase 1)
| Route | Page | Notes |
|---|---|---|
| `/` | Home | hero, value prop, featured agents, listings CTA, contact CTA |
| `/about` | About / Our Team | Derrick + Pina Marrella + Voula Spingos (AgentCard) |
| `/contact` | Contact | Web3Forms lead form + NAP + booking embed |
| `/mortgage-calculator` | Mortgage calculator | Canadian math |
| `/affordability-calculator` | Affordability calculator | GDS/TDS |
| `/land-transfer-tax` | LTT calculator | ON + Toronto + FTB rebates |
| `/privacy` | Privacy policy | forms/PII + CASL (not cookies) |
| `/accessibility` | Accessibility statement | WCAG 2.1 AA |
| `/404` | Not found | — |

- **Listings** are not a page — nav "Listings" / "Search Homes" links out (new tab) to
  realtor.ca search + Derrick's agent profile. Each AgentCard also links to that agent's
  realtor.ca / Real Broker profile.

### Later phases (out of MVP scope)
Reviews/testimonials page, Home Evaluation landing, Sell landing, Rent-to-Own landing,
live Google-reviews widget, optional hand-curated featured-listings section.

## 5. Feature replacements

### 5.1 Lead forms — Web3Forms
- One **Web3Forms access key per form** (Contact, and later Valuation/Seller/Rent-to-Own),
  each with a distinct `subject` so Gmail filters act as a free lead pipeline.
- **Delivery:** email notification to Derrick + autoresponder to the lead. (Email is the system
  of record — free tier retains submissions only 30 days.)
- **Spam:** honeypot + time-trap on every form; **hCaptcha** (free, built in) on Contact.
- **Consent/PII:** consent checkbox + short privacy note near each form (PIPEDA; data processed
  by Web3Forms + hCaptcha on US servers — disclosed in the privacy policy).
- **Upgrade trigger:** Web3Forms Pro ($18/mo) when submissions approach ~200/mo OR Derrick wants
  leads pushed to Google Sheets / Airtable / Telegram instead of email.

### 5.2 Calculators — custom, client-side (Canadian math)
Shared `src/lib/mortgage-math.js`. All regulatory numbers are **named constants with
`// verify: <source>, last checked 2026-06-09` comments** (they change by regulation).

- **Mortgage:** semi-annual compounding (fixed): `i = (1 + r/2)^(1/6) − 1` for monthly — **not**
  `r/12`. Payment frequencies incl. **accelerated bi-weekly**. Amortization schedule. Optional
  **CMHC** premium when down payment < 20% (financed into principal). Down-payment minimums
  (5% / 5%+10% / 20% over $1.5M insurability cap).
- **Affordability:** **GDS/TDS** ratios (≈39% / 44%), heating estimate + **50% of condo fees**,
  qualifying payment at the **stress-test rate** `max(rate + 2%, 5.25% MQR)`; invert to max purchase price.
- **Land Transfer Tax:** Ontario provincial brackets + **Toronto municipal** brackets (incl.
  high-value tiers) + **first-time-buyer rebates** (ON $4,000 / Toronto $4,475), `min(rebate, tax)`.
- Every calculator carries an **"estimates only, not financial advice / not a pre-approval"** disclaimer.
- Full math reference: brainstorm report (calculators) — semi-annual compounding is the critical correctness item.

### 5.3 Booking — TidyCal
- TidyCal free tier, iCloud connected via Apple **app-specific password**, two-way CalDAV sync.
- Inline/iframe embed on `/contact` (and Home CTA). Note ~30–45 min iCloud sync latency.
- **Swappable** with Koalendar (free, similar) or Cal.com (open-source, multiple meeting types,
  branding removal paid). Upgrade: TidyCal one-time ~$29 lifetime to remove badge.

### 5.4 Reviews & social
- **Reviews:** MVP = **hand-curated testimonial cards** (real quotes, first name + last initial).
  Later: Featurable (free, uncapped) live Google-reviews widget if an auto-updating badge is wanted.
- **Social:** styled icon links to Instagram (@derrickgarcia__) + Facebook (DerrickGarciaRealtor).
  No live feed widgets (break often, paid).

### 5.5 Analytics, privacy, SEO
- **Analytics:** **Cloudflare Web Analytics** — free, cookieless, JS beacon in `BaseLayout`.
- **Cookie banner:** **none** — stay strictly cookieless (no GA4, no pixels; `youtube-nocookie.com`
  for any future video). Re-evaluate only if a marketing pixel is ever added.
- **Privacy policy:** forms/PII + CASL document (not a cookie policy). Written fresh (don't reuse
  Lofty's). **Accessibility** statement carried over (WCAG 2.1 AA; AODA-appropriate).
- **SEO:** unique `<title>`/`<meta description>`/`canonical` per page; Open Graph + Twitter cards;
  **new favicon set** + `site.webmanifest`; `robots.txt` → `sitemap.xml`. Remove the 5 stale Lofty
  `google-site-verification` tags; add our own once Search Console is claimed.
- **Structured data (JSON-LD):** `RealEstateAgent` (home, shared `@id`, full NAP + `sameAs` →
  IG/FB/Google Business Profile), `Person` per agent, `BreadcrumbList`.
- **Local SEO:** one canonical NAP string (`Derrick Garcia — Real Broker Ontario LTD`,
  `130 King St W, Unit 1800B, Toronto, ON M5X 1E3`, `+1 416-684-7370`) reused everywhere; link/claim
  Google Business Profile.

## 6. Assets

- **Reuse (from `extracted/images/`):** 3 headshots (Derrick, Pina, Voula) + 2 Real Broker logos
  (wordmark + gold emblem). Copy real ones into `src/assets/`; Astro `<Image>`/`<Picture>` optimizes.
- **Replace:** all hero/banner imagery — the captured banners are generic template **stock**
  (do not reuse). Need owned or licensed photography. New **favicon** (Lofty's default dropped).
- **Do not migrate:** MLS listing photos (licensed) or hotlinked editorial/stock from the old site.

## 7. Domain cutover plan

1. Build + deploy to the temporary `*.github.io` URL; verify the whole site there first.
2. **Lower TTL** on current Lofty DNS records to 300s a day before cutover.
3. Replace Lofty's web records with GitHub Pages: apex **A** (185.199.108–111.153) + **AAAA**
   (2606:50c0:8000–8003::153); `www` **CNAME** → `<user>.github.io`. Set custom domain in Pages,
   wait for green check, enable Enforce HTTPS.
4. **Keep the MX records** (and any mail SPF/DKIM/TXT) untouched — only swap A/AAAA/CNAME, or
   `info@derrickgarcia.ca` email breaks. Remove only the old Lofty **web** records.
5. Decommission Lofty after HTTPS is green and propagation confirmed (`dig` from a few locations).

## 8. Out of scope / YAGNI

- IDX/MLS search, individual listing pages, saved searches, favourites, user accounts/login —
  all dropped (CRM features).
- Blog and blog pipeline.
- Live social feed widgets, paid review widgets, image CDNs, Tailwind, SPA routing.

## 9. Open items (need input/lookup before or during build)

1. **realtor.ca agent profile URLs** for Derrick, Pina, Voula (numeric IDs — must be looked up,
   can't guess) + Real Broker (`onereal.com/profile/...`) profile links.
2. **Real testimonials** to display (or approval to pull from Google Business Profile later).
3. **New favicon / brand mark** decision (use Real Broker emblem, or a personal mark?).
4. **Licensed hero photography** to replace the stock banners.
5. **Bios** for the About page (extract from `extracted/pages/agent-*.html`, confirm current).
6. **Booking tool confirm:** TidyCal vs Koalendar vs Cal.com.
7. **Google Business Profile** URL + confirm ownership/claim status.

## 10. Phasing

- **Phase 1 (MVP):** stack scaffold + deploy pipeline + domain cutover + Home, About, Contact
  (form + booking), 3 calculators, Privacy, Accessibility, 404, SEO/schema/analytics baseline.
- **Phase 2:** Reviews page, Home Evaluation + Sell + Rent-to-Own landings (with lead forms),
  optional live Google-reviews widget, optional hand-curated featured listings.
