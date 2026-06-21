# Listings-First Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the site so real listings lead the experience (Derrick's own first, then Real Broker Ontario's), surface buyer/seller info on the page, modernize the dark "Evolved Midnight" visual system with purposeful motion, add live client-side filtering + a real map, and give every listing an on-site detail page.

**Architecture:** Static Astro site. A site-wide design-token + motion refresh, then a listings-first homepage, a client-hydrated listings browser (filter/sort/search/map over a build-time inline JSON index), and `getStaticPaths`-over-all-listings detail pages. Pure logic lives in tested `src/lib/*.js` modules; presentation lives in focused `.astro` components that port the approved mockups.

**Tech Stack:** Astro 4, vanilla CSS custom properties, `@fontsource` self-hosted fonts (add Space Grotesk), Leaflet (+ markercluster) for the map, Vitest for unit tests, existing CREA DDF data pipeline.

**Spec:** `docs/superpowers/specs/2026-06-20-listings-first-redesign-design.md`
**Visual source of truth:** `docs/superpowers/mockups/{homepage,listings,direction}.html` (see that dir's README).

---

## Token-mapping (mockup hex → token) — used by every presentational task

| Mockup value | Token |
|---|---|
| `#0e0e10` (page bg) | `var(--color-bg)` |
| `#0b0b0d` (deep band) | `var(--color-bg-2)` |
| `#16161a` (panel) | `var(--color-panel)` |
| `#1b1b21`/`#1b1c1f` (panel 2) | `var(--color-panel-2)` |
| `#f4efe6` (ink) | `var(--color-ink)` |
| `#c8c2b5` (text) | `var(--color-text)` |
| `#948e80`/`#9a9384` (muted) | `var(--color-muted)` |
| `#c6a15b` (gold) | `var(--color-accent)` |
| `#e7c987` (bright gold) | `var(--color-accent-bright)` |
| `#15130f` (ink on gold) | `var(--color-accent-ink)` |
| `rgba(198,161,87,.18/.2)` | `var(--color-line)` |
| `rgba(198,161,87,.36/.4)` | `var(--color-line-strong)` |
| `rgba(255,255,255,.07)` | `var(--hair)` |
| `'Space Grotesk'` | `var(--font-ui)` |
| `'Marcellus'` | `var(--font-display)` |
| `'Inter'` (mockup body) | `var(--font-sans)` (Source Sans 3 — do NOT add Inter) |

When a task says "port mockup §X," copy that section's markup + CSS, apply this mapping, delete the mockup's `<script>`/`onerror` demo glue, and wire real data/props as the task specifies.

## File structure

**Create:**
- `src/styles/motion.css` — reveal (moved), nav-scroll, progress bar, counters, lightbox, reduced-motion gates
- `src/scripts/enhance.ts` — global progressive-enhancement JS (nav scrolled, progress bar, counters); imported once by BaseLayout
- `src/lib/listings-view.js` + `src/lib/listings-view.test.js` — pure filter/sort/city/stats helpers (TDD)
- `src/components/listings/ListingsBrowser.astro` — filter bar + chips + results + grid/map slots (server-rendered, hydrated)
- `src/components/listings/ListingsMap.astro` — Leaflet island (browse map + single-marker detail map)
- `src/scripts/listings-browser.ts` — client logic for ListingsBrowser (filter/sort/search/favorites/view toggle)
- `src/components/listings/Gallery.astro` — detail photo gallery + lightbox
- `src/components/listings/ContactCard.astro` — detail sidebar agent contact form
- `src/components/home/Hero.astro`, `src/components/home/StatBar.astro`, `src/components/home/MortgageMini.astro`, `src/components/home/AreaGrid.astro` — homepage sections
- `src/components/DerrickListings.astro` — conditional "Derrick's Listings" band (home + browse)

**Modify:**
- `src/styles/tokens.css` — Evolved Midnight palette + new tokens
- `src/styles/global.css` — import motion.css, button/util tweaks
- `src/layouts/BaseLayout.astro` — Space Grotesk font, theme-color, progress-bar element, import enhance.ts
- `src/components/Header.astro` — flattened glassy nav (Listings · Sell · Home Value · Calculators · Areas · About + phone + Book a Call)
- `src/components/Footer.astro` — restyle, Real Broker + DG logos, NAP, compliance
- `src/components/ListingCard.astro` — internal `detailHref` for all, tags, favorite, hover zoom
- `src/data/listings.ts` — add `IN_MARKETS`, `derrickFirst`, `toIndexRecord`, re-export helpers
- `src/pages/listings/index.astro` — new browse page
- `src/pages/listings/[id].astro` — detail pages for ALL listings
- `src/pages/listings/derrick.astro` — 301 → `/listings`
- `src/pages/index.astro` — full homepage rebuild
- `package.json` — add deps
- `TODO.md`, `CLAUDE.md` — content task + status

**Reuse unchanged:** `PoweredByRealtor.astro`, `TrademarkStatement.astro`, `ListingSchema.astro`, `src/lib/mortgage-math.js`, `LeadForm.astro`, `src/lib/crea-analytics.js`.

---

## PHASE A — Design system foundation

### Task A1: Evolve design tokens

**Files:** Modify `src/styles/tokens.css`

- [ ] **Step 1: Replace the `:root` block** with the evolved palette (keep `--color-fg`/`--color-muted` values that are already AA-proven; brighten accent; add new tokens):

```css
:root {
  /* Evolved Midnight — text tokens AA-verified on #0e0e10 (>= the prior #121212 ratios). */
  --color-bg: #0e0e10;
  --color-bg-2: #0b0b0d;            /* deeper band backgrounds */
  --color-panel: #16161a;
  --color-panel-2: #1b1b21;
  --color-ink: #f4efe6;            /* headings */
  --color-fg: #f4efe6;             /* legacy alias used by existing components */
  --color-text: #c8c2b5;          /* body */
  --color-muted: #9a9486;         /* secondary — proven AA, do NOT darken for text */
  --color-accent: #c6a15b;        /* gold, brightened (higher contrast on #0e0e10 than legacy #b08d57) */
  --color-accent-bright: #e7c987; /* emphasis / large display only — verify AA before small-text use */
  --color-accent-ink: #15130f;    /* text on gold */
  --color-line: rgba(198, 161, 91, .20);
  --color-line-strong: rgba(198, 161, 91, .40);
  --hair: rgba(255, 255, 255, .07);
  --font-display: 'Marcellus', 'Times New Roman', serif;
  --font-sans: 'Source Sans 3', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-ui: 'Space Grotesk', var(--font-sans);
  --maxw: 1200px;
  --space: 1rem;
  --radius: 3px;                  /* sharp corners — luxury direction */
  --section-pad: clamp(3.2rem, 7vw, 5.5rem);
  --ease: cubic-bezier(.2, .7, .2, 1);
  --dur: .6s;
}
```

- [ ] **Step 2: Verify AA contrast** for the changed tokens. Run:

```bash
node -e "function L(h){h=h.replace('#','');var r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255;[r,g,b]=[r,g,b].map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4));return .2126*r+.7152*g+.0722*b}function C(a,b){var l1=L(a),l2=L(b);return ((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)).toFixed(2)}for(const [n,c] of [['ink','#f4efe6'],['text','#c8c2b5'],['muted','#9a9486'],['accent','#c6a15b'],['accent-bright','#e7c987']])console.log(n, C(c,'#0e0e10'))"
```

Expected: every ratio ≥ 4.5 (ink ~15, text ~11, muted ~6.4, accent ~6.6, accent-bright ~10). If any < 4.5, lighten that token until it passes before continuing.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css && git commit -m "feat(design): evolve Midnight tokens (deeper bg, brighter gold, ui font + motion tokens)"
```

### Task A2: Add Space Grotesk + motion stylesheet

**Files:** Modify `package.json`, `src/styles/global.css`; Create `src/styles/motion.css`

- [ ] **Step 1: Add the font dependency**

```bash
pnpm add @fontsource/space-grotesk
```

- [ ] **Step 2: Create `src/styles/motion.css`** — reveal (moved from global.css), plus nav-scroll, progress, counters, lightbox. All motion gated by `prefers-reduced-motion` and `html.js`:

```css
/* Progress bar + sticky-nav blur live on the elements; these are the motion-only bits. */
.progress-bar { position: fixed; top: 0; left: 0; height: 2px; width: 0;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-bright)); z-index: 1000; }

@media (prefers-reduced-motion: no-preference) {
  html.js .reveal { opacity: 0; transform: translateY(18px); transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease); }
  html.js .reveal.is-in { opacity: 1; transform: none; }
  html.js .reveal-2 { transition-delay: .08s; }
  html.js .reveal-3 { transition-delay: .16s; }
}

/* Lightbox (detail gallery) */
.lightbox { position: fixed; inset: 0; z-index: 1200; background: rgba(6,6,8,.95);
  display: none; align-items: center; justify-content: center; flex-direction: column; gap: 1rem; padding: 2rem; }
.lightbox.is-open { display: flex; }
.lightbox img { max-width: 92vw; max-height: 80vh; object-fit: contain; border-radius: var(--radius); }
.lightbox__close { position: absolute; top: 1.2rem; right: 1.4rem; color: var(--color-ink);
  font-family: var(--font-ui); font-size: 1.4rem; cursor: pointer; background: none; border: 0; }
.lightbox__cap { color: var(--color-muted); font-family: var(--font-ui); font-size: .8rem; text-align: center; }
```

- [ ] **Step 3: In `src/styles/global.css`** replace the existing reveal block (lines ~53–58) with `@import './motion.css';` at the top (after `@import './tokens.css';`), and add a UI-font utility + button-ghost-on-dark tweak:

```css
@import './tokens.css';
@import './motion.css';
/* …existing base styles stay… */
.ui { font-family: var(--font-ui); }
```

(Remove the old `@media (prefers-reduced-motion…) html.js .reveal {…}` block — it now lives in motion.css.)

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: build succeeds, no missing-import errors.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/styles/global.css src/styles/motion.css && git commit -m "feat(design): add Space Grotesk + motion stylesheet"
```

### Task A3: Global enhancement script (progress bar, nav-scrolled, counters)

**Files:** Create `src/scripts/enhance.ts`; Modify `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create `src/scripts/enhance.ts`** — runs on every page; no-op-safe when elements are absent:

```ts
// Progressive enhancement shared across pages. Motion is gated; no-JS users are unaffected.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sticky-nav scrolled state + scroll-progress bar
const header = document.querySelector('.site-header');
const bar = document.querySelector<HTMLElement>('.progress-bar');
function onScroll() {
  const st = window.scrollY || document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (header) header.classList.toggle('is-scrolled', st > 40);
  if (bar) bar.style.width = h > 0 ? `${(100 * st) / h}%` : '0';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Count-up for [data-count] when its container scrolls into view
const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
if (counters.length && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      const to = Number(el.dataset.count) || 0;
      if (reduce) { el.textContent = to.toLocaleString(); obs.unobserve(el); return; }
      let t0: number | null = null;
      const step = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / 1100, 1);
        el.textContent = Math.floor(p * to).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => obs.observe(c));
}
```

- [ ] **Step 2: In `BaseLayout.astro`** make four edits:
  1. Add the font import near the top frontmatter: `import '@fontsource/space-grotesk/400.css';` `import '@fontsource/space-grotesk/500.css';` `import '@fontsource/space-grotesk/600.css';`
  2. Change `<meta name="theme-color" content="#121212" />` → `content="#0e0e10"`.
  3. After `<body>` and before `<a class="skip-link"…>`, add: `<div class="progress-bar" aria-hidden="true"></div>`.
  4. Add once, before `</body>`: `<script>import '../scripts/enhance.ts';</script>` (Astro bundles it). Keep the existing reveal `<script is:inline>` as-is.

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm check`
Expected: 0 errors. Manually `pnpm dev` and confirm the gold progress bar tracks scroll and the header gains `is-scrolled` past 40px (the visual style for `.is-scrolled` is added in Task A4).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/enhance.ts src/layouts/BaseLayout.astro && git commit -m "feat(design): global enhance script — progress bar, nav-scrolled, counters"
```

### Task A4: Restyle Header (glassy sticky, flattened nav, Book-a-Call)

**Files:** Modify `src/components/Header.astro`
**Reference:** mockup nav in `docs/superpowers/mockups/homepage.html` (the `.nav` block).

- [ ] **Step 1: Replace the nav markup** (the `<nav class="site-nav">` list) with the flattened primary nav — keep the existing `dgMark` Image brand and the mobile `nav-toggle` button + script. Brand gets a "Real Broker Ontario" sub-label. Links: Listings `/listings`, Sell `/sell`, Home Value `/home-valuation`, Calculators `/mortgage-calculator`, Areas `/areas`, About `/about`; then `tel` phone and a `.book` CTA → `/contact`. Keep `<details>` dropdowns only if desired for Sell/About; the mockup uses flat links — match the mockup (flat). Preserve all existing nav JS (toggle/escape) and the `aria-label="Primary"`.

- [ ] **Step 2: Replace the `<style>`** porting the mockup `.nav` styles via the token map. Required behaviors:
  - `.site-header` sticky, transparent border by default; `.site-header.is-scrolled` → `background: rgba(12,12,14,.82); backdrop-filter: blur(14px); border-bottom-color: var(--hair);` (the `is-scrolled` class is toggled by `enhance.ts`).
  - brand sub-label `.brand em` in `var(--font-ui)`, `.58rem`, `letter-spacing:.2em`, `var(--color-muted)`.
  - `.book` = gold pill (`var(--color-accent)` bg, `var(--color-accent-ink)` text).
  - Keep the existing 860px mobile hamburger behavior; restyle the open panel to the new tokens.

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm check`
Expected: 0 errors. `pnpm dev`: nav is transparent at top, blurs on scroll, phone + Book-a-Call visible, hamburger works < 860px.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro && git commit -m "feat(design): glassy sticky header with flattened nav + Book-a-Call"
```

### Task A5: Restyle Footer (logos, NAP, compliance)

**Files:** Modify `src/components/Footer.astro`
**Reference:** mockup `footer` block in `docs/superpowers/mockups/homepage.html`.

- [ ] **Step 1: Rebuild the footer** with: a brand column using `astro:assets` `Image` for `src/assets/branding/dg-logo-text-light.png`, the NAP (pull from `SITE`: `SITE.legalName` / `SITE.address.*` / `SITE.phoneDisplay` / `SITE.email` — byte-identical), the Real Broker wordmark `src/assets/branding/real-wordmark-white.png`; Explore / Tools / Connect link columns (use existing routes from current Footer); and a legal bar with the REALTOR®/MLS® trademark statement + Privacy/Accessibility links. Use `SITE.social.instagram` / `SITE.social.facebook`.

- [ ] **Step 2: Port the mockup footer `<style>`** via the token map.

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm check`
Expected: 0 errors; NAP string matches the existing site exactly.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro && git commit -m "feat(design): restyle footer with logos, NAP, compliance"
```

> **Phase A checkpoint:** `pnpm build && pnpm check && pnpm test` all green. The whole site now wears Evolved Midnight; other pages inherit it automatically.

---

## PHASE B — Data view-layer + listing card

### Task B1: Pure listings view helpers (TDD)

**Files:** Create `src/lib/listings-view.js`, `src/lib/listings-view.test.js`

- [ ] **Step 1: Write the failing test** `src/lib/listings-view.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { municipality, displayCity, median, filterListings, sortListings, toIndexRecord } from './listings-view.js';

const L = (o) => ({ id:'1', mlsNumber:'X1', address:'1 A St', city:'Toronto (Roncesvalles)', province:'Ontario',
  price:800000, priceFormatted:'$800,000', beds:2, baths:1, propertyType:'Single Family', primaryPhoto:'p.jpg',
  photos:['p.jpg'], photosCount:1, brokerage:'REAL BROKER ONTARIO LTD.', isDerrick:false, lat:43.6, lng:-79.4,
  updatedAt:'2026-05-01T00:00:00Z', ...o });

describe('municipality/displayCity', () => {
  it('strips the parenthetical area', () => {
    expect(municipality('Toronto (Roncesvalles)')).toBe('Toronto');
    expect(municipality('Caledon (Bolton)')).toBe('Caledon');
    expect(municipality('Milton')).toBe('Milton');
    expect(municipality(null)).toBe('');
  });
  it('formats neighbourhood, municipality', () => {
    expect(displayCity('Toronto (Roncesvalles)')).toBe('Roncesvalles, Toronto');
    expect(displayCity('Milton')).toBe('Milton');
  });
});

describe('median', () => {
  it('handles odd/even/empty', () => {
    expect(median([3,1,2])).toBe(2);
    expect(median([4,1,2,3])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});

describe('filterListings', () => {
  const list = [L({id:'a',city:'Toronto (X)',price:600000,beds:1,propertyType:'Single Family'}),
                L({id:'b',city:'Milton',price:950000,beds:3,propertyType:'Single Family'}),
                L({id:'c',city:'Mississauga',price:1700000,beds:3,propertyType:'Multi-family'})];
  it('filters by municipality', () => { expect(filterListings(list,{municipality:'Milton'}).map(x=>x.id)).toEqual(['b']); });
  it('filters by maxPrice', () => { expect(filterListings(list,{maxPrice:700000}).map(x=>x.id)).toEqual(['a']); });
  it('filters by minBeds', () => { expect(filterListings(list,{minBeds:3}).map(x=>x.id)).toEqual(['b','c']); });
  it('filters by propertyType', () => { expect(filterListings(list,{propertyType:'Multi-family'}).map(x=>x.id)).toEqual(['c']); });
  it('filters savedOnly', () => { expect(filterListings(list,{savedOnly:true,savedIds:['c']}).map(x=>x.id)).toEqual(['c']); });
  it('empty filter returns all', () => { expect(filterListings(list,{}).length).toBe(3); });
});

describe('sortListings', () => {
  const list = [L({id:'a',price:600000,updatedAt:'2026-01-01T00:00:00Z'}),
                L({id:'b',price:900000,updatedAt:'2026-05-01T00:00:00Z'})];
  it('lo = price asc', () => expect(sortListings(list,'lo').map(x=>x.id)).toEqual(['a','b']));
  it('hi = price desc', () => expect(sortListings(list,'hi').map(x=>x.id)).toEqual(['b','a']));
  it('new = updatedAt desc', () => expect(sortListings(list,'new').map(x=>x.id)).toEqual(['b','a']));
});

describe('toIndexRecord', () => {
  it('keeps only browse fields', () => {
    expect(toIndexRecord(L({}))).toEqual({ id:'1', price:800000, priceFormatted:'$800,000', beds:2, baths:1,
      propertyType:'Single Family', municipality:'Toronto', displayCity:'Roncesvalles, Toronto',
      primaryPhoto:'p.jpg', lat:43.6, lng:-79.4, isDerrick:false, address:'1 A St', updatedAt:'2026-05-01T00:00:00Z' });
  });
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `pnpm test -- listings-view`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Implement `src/lib/listings-view.js`**:

```js
// Pure, framework-free helpers over the Listing shape (see src/data/listings.ts).
// Tested in listings-view.test.js. No Astro/DOM imports — safe to import on server or client.

export function municipality(city) {
  if (!city) return '';
  const i = city.indexOf('(');
  return (i >= 0 ? city.slice(0, i) : city).trim();
}

export function neighbourhood(city) {
  if (!city) return '';
  const m = city.match(/\(([^)]+)\)/);
  return m ? m[1].trim() : '';
}

export function displayCity(city) {
  const muni = municipality(city);
  const nb = neighbourhood(city);
  return nb ? `${nb}, ${muni}` : muni;
}

export function median(nums) {
  const a = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n)).sort((x, y) => x - y);
  if (!a.length) return 0;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

export function filterListings(list, opts = {}) {
  const { municipality: muni, maxPrice, minBeds, propertyType, savedOnly, savedIds = [] } = opts;
  const saved = new Set(savedIds);
  return list.filter((l) => {
    if (muni && municipality(l.city) !== muni) return false;
    if (maxPrice && (l.price == null || l.price > maxPrice)) return false;
    if (minBeds && (l.beds == null || l.beds < minBeds)) return false;
    if (propertyType && l.propertyType !== propertyType) return false;
    if (savedOnly && !saved.has(l.id)) return false;
    return true;
  });
}

export function sortListings(list, sort) {
  const a = [...list];
  if (sort === 'lo') return a.sort((x, y) => (x.price ?? Infinity) - (y.price ?? Infinity));
  if (sort === 'hi') return a.sort((x, y) => (y.price ?? -Infinity) - (x.price ?? -Infinity));
  // 'new' (default): updatedAt desc, nulls last
  return a.sort((x, y) => (y.updatedAt ?? '').localeCompare(x.updatedAt ?? ''));
}

// Lean record shipped to the browser for client filter/sort/map.
export function toIndexRecord(l) {
  return {
    id: l.id, price: l.price, priceFormatted: l.priceFormatted, beds: l.beds, baths: l.baths,
    propertyType: l.propertyType, municipality: municipality(l.city), displayCity: displayCity(l.city),
    primaryPhoto: l.primaryPhoto, lat: l.lat, lng: l.lng, isDerrick: l.isDerrick,
    address: l.address, updatedAt: l.updatedAt,
  };
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test -- listings-view`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/listings-view.js src/lib/listings-view.test.js && git commit -m "feat(listings): tested view helpers (filter/sort/city/median/index record)"
```

### Task B2: Listings accessors for Derrick-first + in-markets + stats

**Files:** Modify `src/data/listings.ts`

- [ ] **Step 1: Append accessors** that build on the existing `LISTINGS`, `DERRICK_LISTINGS`, `inDerricksMarkets`:

```ts
import { municipality, displayCity, median, toIndexRecord } from '../lib/listings-view.js';

// Real Broker listings in Derrick's markets (the default browse set).
export const IN_MARKETS: Listing[] = LISTINGS.filter(inDerricksMarkets);

// Build-time stats for the homepage (never hardcode counts).
export const LISTING_STATS = {
  total: LISTINGS.length,
  inMarkets: IN_MARKETS.length,
  median: median(IN_MARKETS.map((l) => l.price).filter((p): p is number => p != null)),
  marketCount: RELEVANT_MARKETS.length,
};

// Lean index for the client browser (all listings → reachable detail pages; default filter is in-markets).
export const LISTINGS_INDEX = LISTINGS.map(toIndexRecord);

// Detail URL for any listing.
export const detailHref = (l: Pick<Listing, 'id'>): string => `/listings/${l.id}`;

// re-export display helpers for templates
export { municipality, displayCity };
```

- [ ] **Step 2: Verify types**

Run: `pnpm check`
Expected: 0 errors (note `municipality`/`displayCity` imported from a `.js` module — Astro/TS allows this; if check complains about implicit any, add `// @ts-expect-error`-free JSDoc types already present is fine since functions return `string`/`number`).

- [ ] **Step 3: Commit**

```bash
git add src/data/listings.ts && git commit -m "feat(listings): IN_MARKETS, LISTING_STATS, LISTINGS_INDEX, detailHref accessors"
```

### Task B3: Canonical ListingCard (global classes, internal-for-all, tags, favorite, hover)

**Files:** Modify `src/components/ListingCard.astro`, `src/styles/global.css`; Create `src/styles/listing-card.css`
**Reference:** `.lcard` in `docs/superpowers/mockups/homepage.html`.
**Why global:** the listings browser (Task C2) re-renders cards client-side from the index. So server- and client-rendered cards must be byte-identical — the card markup uses **global `.lcard*` classes** in `src/styles/listing-card.css`, and the client (C2) emits the same markup.

- [ ] **Step 1: Create `src/styles/listing-card.css`** — port `.lcard` to global classes (`.lcard` hover lift; `.lcard__ph` overflow-hidden; `.lcard__img` `scale(1.06)` on `.lcard:hover`; `.lcard__tag`/`.lcard__tag--d`; `.lcard__fav`/`.lcard__fav.is-on`; `.lcard__b`, `.lcard__price` gold `var(--font-display)`, `.lcard__meta`, `.lcard__addr`, `.lcard__sub`, `.lcard__foot`/`.lcard__go`) via the token map. **Include the "No CSS filter on the photo — CREA watermark must not be modified" comment + rule.** Add `@import './listing-card.css';` to `global.css`.

- [ ] **Step 2: Rewrite `ListingCard.astro`** to emit this exact structure (whole card is the detail link; no per-card `PoweredByRealtor` — page-level + footer compliance cover it; brokerage shown as text):

```astro
---
import type { Listing } from '../data/listings.ts';
import { detailHref, displayCity } from '../data/listings.ts';
const { listing, tag } = Astro.props as { listing: Listing; tag?: string };
const href = detailHref(listing);
const meta = [listing.beds!=null?`${listing.beds} bd`:null, listing.baths!=null?`${listing.baths} ba`:null, listing.propertyType].filter(Boolean).join(' · ');
---
<a class="lcard" href={href}>
  <div class="lcard__ph">
    {tag && <span class={`lcard__tag${tag==="Derrick's Listing"?' lcard__tag--d':''}`}>{tag}</span>}
    <button class="lcard__fav" data-fav={listing.id} aria-label="Save listing" aria-pressed="false">♡</button>
    {listing.primaryPhoto
      ? <img class="lcard__img" src={listing.primaryPhoto} alt={`Photo of ${listing.address}`} loading="lazy" decoding="async" width="400" height="300" />
      : <div class="lcard__empty" aria-hidden="true">No photo</div>}
  </div>
  <div class="lcard__b">
    <div class="lcard__price">{listing.priceFormatted ?? 'Price on request'}</div>
    {meta && <div class="lcard__meta">{meta}</div>}
    <div class="lcard__addr">{listing.address}</div>
    <div class="lcard__sub">{displayCity(listing.city)}</div>
    <div class="lcard__foot"><span>Real Broker Ontario</span><span class="lcard__go">View details →</span></div>
  </div>
</a>
```

The favorite `<button>` sits inside the `<a>`; the browser script (C2) calls `preventDefault()` on `[data-fav]` clicks. On the homepage (no browser script) it is inert/decorative — acceptable.

- [ ] **Step 3: Verify** `pnpm build && pnpm check` → 0 errors (hrefs are strings until Phase D builds the pages).

- [ ] **Step 4: Commit**

```bash
git add src/components/ListingCard.astro src/styles/listing-card.css src/styles/global.css && git commit -m "feat(listings): canonical global ListingCard (internal link, tags, favorite, hover)"
```

### Task B4: DerrickListings band component

**Files:** Create `src/components/DerrickListings.astro`

- [ ] **Step 1: Create the component** — renders nothing when empty (the conditional-hide rule):

```astro
---
import ListingCard from './ListingCard.astro';
import { DERRICK_LISTINGS } from '../data/listings.ts';
const { heading = "Derrick's Listings", limit } = Astro.props as { heading?: string; limit?: number };
const items = limit ? DERRICK_LISTINGS.slice(0, limit) : DERRICK_LISTINGS;
---
{items.length > 0 && (
  <section class="section derrick">
    <div class="container">
      <div class="eyebrow"><h2>{heading}</h2><a class="link ui" href="/listings">All of Derrick's →</a></div>
      <div class="dgrid">
        {items.map((l) => <ListingCard listing={l} tag="Derrick's Listing" />)}
      </div>
    </div>
  </section>
)}
<style>
  .eyebrow { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; margin-bottom:1.4rem; flex-wrap:wrap; }
  .eyebrow .link { color: var(--color-accent); font-size:.82rem; }
  .dgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.3rem; }
</style>
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: success; renders nothing today (DERRICK_LISTINGS empty), confirming the hide rule.

- [ ] **Step 3: Commit**

```bash
git add src/components/DerrickListings.astro && git commit -m "feat(listings): conditional Derrick's-Listings band (hides when empty)"
```

> **Phase B checkpoint:** `pnpm build && pnpm check && pnpm test` green.

---

## PHASE C — Listings browse + interactive map

### Task C1: Add Leaflet + the map island

**Files:** Modify `package.json`; Create `src/components/listings/ListingsMap.astro`

- [ ] **Step 1: Add deps**

```bash
pnpm add leaflet leaflet.markercluster && pnpm add -D @types/leaflet
```

- [ ] **Step 2: Create `src/components/listings/ListingsMap.astro`** — a client island that reads the same inline index and renders clustered pins. Props: `selector` (id of the JSON script), `single` (lat/lng for a one-marker detail map). Use Carto dark tiles (free, theme-matching). Markup:

```astro
---
const { single } = Astro.props as { single?: { lat:number; lng:number; label?:string } };
---
<div class="lmap" data-single={single ? JSON.stringify(single) : undefined}></div>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>.lmap{ width:100%; height:100%; min-height:360px; border-radius:var(--radius); overflow:hidden; z-index:0; }
  :global(.leaflet-container){ background:#0d0e12; font-family:var(--font-ui); }
  :global(.leaflet-popup-content-wrapper),:global(.leaflet-popup-tip){ background:var(--color-panel); color:var(--color-text); }</style>
<script>
  import L from 'leaflet';
  import 'leaflet.markercluster';
  const el = document.querySelector('.lmap');
  if (el) {
    const tiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const attr = '&copy; OpenStreetMap &copy; CARTO';
    const single = el.getAttribute('data-single');
    if (single) {
      const s = JSON.parse(single);
      const map = L.map(el as HTMLElement, { scrollWheelZoom:false }).setView([s.lat, s.lng], 14);
      L.tileLayer(tiles, { attribution: attr }).addTo(map);
      L.marker([s.lat, s.lng]).addTo(map);
    } else {
      const data = JSON.parse(document.getElementById('listings-index')!.textContent || '[]');
      const map = L.map(el as HTMLElement).setView([43.72, -79.45], 9);
      L.tileLayer(tiles, { attribution: attr }).addTo(map);
      // @ts-ignore markercluster augments L
      const cluster = L.markerClusterGroup();
      data.filter((d:any)=>d.lat&&d.lng).forEach((d:any) => {
        const m = L.marker([d.lat, d.lng]);
        m.bindPopup(`<b>${d.priceFormatted ?? ''}</b><br>${d.address}<br><a href="/listings/${d.id}">View details →</a>`);
        cluster.addLayer(m);
      });
      map.addLayer(cluster);
      if (data.length) map.fitBounds(cluster.getBounds().pad(0.1));
      window.addEventListener('listings:filtered', (e:any) => {
        cluster.clearLayers();
        e.detail.forEach((d:any) => { if(d.lat&&d.lng){ const m=L.marker([d.lat,d.lng]); m.bindPopup(`<b>${d.priceFormatted??''}</b><br>${d.address}<br><a href="/listings/${d.id}">View details →</a>`); cluster.addLayer(m);} });
      });
    }
  }
</script>
```

- [ ] **Step 3: Verify** the dependency resolves and a single-marker map builds.

Run: `pnpm build`
Expected: success (the map only initializes client-side; SSR just emits the div).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/listings/ListingsMap.astro && git commit -m "feat(listings): Leaflet map island (clustered pins + single-marker mode)"
```

### Task C2: Listings browser client logic

**Files:** Create `src/scripts/listings-browser.ts`
**Reference:** the `<script>` in `docs/superpowers/mockups/listings.html` (filter/sort/chips/view toggle) — adapt to read the real inline index and the real filter fields (municipality / minBeds / maxPrice / propertyType, NOT the mockup's house/condo demo).

- [ ] **Step 1: Create `src/scripts/listings-browser.ts`** importing the tested helpers, reading `#listings-index`, rendering cards into `#listings-grid`, syncing the map via a `listings:filtered` event, and persisting favorites in `localStorage`:

```ts
import { filterListings, sortListings } from '../lib/listings-view.js';

const dataEl = document.getElementById('listings-index');
if (dataEl) {
  const all = JSON.parse(dataEl.textContent || '[]');
  const grid = document.getElementById('listings-grid')!;
  const countEl = document.getElementById('listings-count');
  const FAV_KEY = 'dg:favs';
  const favs = new Set<string>(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
  const state: any = { municipality: '', maxPrice: 0, minBeds: 0, propertyType: '', savedOnly: false, sort: 'new', ontarioWide: false };

  // Emits the SAME global `.lcard*` markup as ListingCard.astro (Task B3) so SSR + client cards match.
  function cardHTML(d: any) {
    const tag = d.isDerrick ? `<span class="lcard__tag lcard__tag--d">Derrick's Listing</span>` : `<span class="lcard__tag">For Sale</span>`;
    const on = favs.has(d.id);
    const photo = d.primaryPhoto
      ? `<img class="lcard__img" src="${d.primaryPhoto}" loading="lazy" decoding="async" width="400" height="300" alt="Photo of ${d.address}">`
      : `<div class="lcard__empty" aria-hidden="true">No photo</div>`;
    const meta = [d.beds!=null?d.beds+' bd':null, d.baths!=null?d.baths+' ba':null, d.propertyType].filter(Boolean).join(' · ');
    return `<a class="lcard" href="/listings/${d.id}"><div class="lcard__ph">${tag}`+
      `<button class="lcard__fav ${on?'is-on':''}" data-fav="${d.id}" aria-label="Save listing" aria-pressed="${on}">${on?'♥':'♡'}</button>${photo}</div>`+
      `<div class="lcard__b"><div class="lcard__price">${d.priceFormatted ?? 'Price on request'}</div>`+
      `${meta?`<div class="lcard__meta">${meta}</div>`:''}<div class="lcard__addr">${d.address}</div><div class="lcard__sub">${d.displayCity}</div>`+
      `<div class="lcard__foot"><span>Real Broker Ontario</span><span class="lcard__go">View details →</span></div></div></a>`;
  }

  function apply() {
    const base = state.ontarioWide ? all : all.filter((d: any) => IN_MARKET_MUNIS.has(d.municipality));
    const filtered = sortListings(filterListings(base, {
      municipality: state.municipality, maxPrice: state.maxPrice || undefined, minBeds: state.minBeds || undefined,
      propertyType: state.propertyType || undefined, savedOnly: state.savedOnly, savedIds: [...favs],
    }), state.sort);
    grid.innerHTML = filtered.map(cardHTML).join('') || `<p class="ui muted">No listings match those filters.</p>`;
    if (countEl) countEl.textContent = String(filtered.length);
    window.dispatchEvent(new CustomEvent('listings:filtered', { detail: filtered }));
  }

  // The 26 in-markets municipalities, emitted by the page into a data attribute on #listings-index.
  const IN_MARKET_MUNIS = new Set<string>(JSON.parse(dataEl.dataset.markets || '[]'));

  document.querySelectorAll<HTMLElement>('[data-filter]').forEach((el) => {
    el.addEventListener('change', () => { (state as any)[el.dataset.filter!] = (el as HTMLInputElement).value === '' ? '' : isNaN(Number((el as HTMLInputElement).value)) ? (el as HTMLInputElement).value : Number((el as HTMLInputElement).value); apply(); });
  });
  document.querySelectorAll<HTMLElement>('[data-chip]').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-chip]').forEach((c) => c.classList.remove('is-on'));
      chip.classList.add('is-on');
      const [k, v] = (chip.dataset.chip || 'municipality:').split(':');
      state.municipality = ''; state.maxPrice = 0; state.propertyType = '';
      if (k === 'municipality') state.municipality = v;
      if (k === 'maxPrice') state.maxPrice = Number(v);
      if (k === 'propertyType') state.propertyType = v;
      apply();
    });
  });
  const sortSel = document.getElementById('listings-sort') as HTMLSelectElement | null;
  sortSel?.addEventListener('change', () => { state.sort = sortSel.value; apply(); });
  const wide = document.getElementById('ontario-wide') as HTMLInputElement | null;
  wide?.addEventListener('change', () => { state.ontarioWide = wide.checked; apply(); });

  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.fav!;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    btn.classList.toggle('is-on'); btn.textContent = favs.has(id) ? '♥' : '♡';
  });

  // Grid/Map view toggle
  document.querySelectorAll<HTMLElement>('[data-view]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.view;
    document.getElementById('view-grid')!.hidden = v !== 'grid';
    document.getElementById('view-map')!.hidden = v !== 'map';
    document.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('is-on', x === b));
  }));

  apply();
}
```

- [ ] **Step 2: Verify it type-checks** after the page (Task C3) provides the elements. Defer the run to C3.
- [ ] **Step 3: Commit**

```bash
git add src/scripts/listings-browser.ts && git commit -m "feat(listings): client browser logic (filter/sort/chips/favorites/view toggle)"
```

### Task C3: Build the listings browse page

**Files:** Modify `src/pages/listings/index.astro`; Create `src/components/listings/ListingsBrowser.astro`
**Reference:** `docs/superpowers/mockups/listings.html` (browse view: filter bar, chips, results, grid, map, compliance).

- [ ] **Step 1: Create `ListingsBrowser.astro`** — server-renders the filter bar (selects with `data-filter="municipality|minBeds|maxPrice|propertyType"`, chips with `data-chip="municipality:Toronto"` etc.), the Grid/Map segmented toggle (`data-view`), a results count (`#listings-count`), `#view-grid` containing `#listings-grid` server-pre-rendered with the in-markets cards (SEO/no-JS), and `#view-map` (hidden) containing `<ListingsMap />`. Emit the index + markets:

```astro
---
import ListingCard from '../ListingCard.astro';
import ListingsMap from './ListingsMap.astro';
import { IN_MARKETS, LISTINGS_INDEX, RELEVANT_MARKETS } from '../../data/listings.ts';
import { sortListings } from '../../lib/listings-view.js';
const initial = sortListings(IN_MARKETS, 'new');
---
<script type="application/json" id="listings-index" set:html={JSON.stringify(LISTINGS_INDEX)} data-markets={JSON.stringify(RELEVANT_MARKETS)}></script>
<!-- filter bar, chips, toggle … (port mockup .filterbar / .chips / .seg) -->
<div id="view-grid">
  <div class="results ui"><span><b id="listings-count">{initial.length}</b> listings</span>
    <select id="listings-sort" aria-label="Sort"><option value="new">Newest</option><option value="lo">Price ↑</option><option value="hi">Price ↓</option></select></div>
  <div id="listings-grid" class="lgrid">{initial.map((l) => <ListingCard listing={l} />)}</div>
</div>
<div id="view-map" hidden style="height:74vh"><ListingsMap /></div>
<!-- compliance: PoweredByRealtor + brokerage + TrademarkStatement -->
<style>.lgrid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:1.3rem; } /* + port .filterbar/.chips/.seg/.results */</style>
<script>import '../../scripts/listings-browser.ts';</script>
```

- [ ] **Step 2: Rewrite `src/pages/listings/index.astro`** to use `BaseLayout` + page header (kicker/h1/lede), `<DerrickListings />`, `<ListingsBrowser />`, and a compliance footer block (`PoweredByRealtor` + brokerage line + `TrademarkStatement`). Add the "Show all Real Broker Ontario (Ontario-wide)" checkbox `#ontario-wide` near the filter bar.

- [ ] **Step 3: Verify**

Run: `pnpm build && pnpm check`
Expected: 0 errors. `pnpm dev` → `/listings`: grid shows in-markets cards; chips/selects/sort filter live; Grid/Map toggle reveals the clustered map; favorites persist on reload; Ontario-wide toggle expands the set.

- [ ] **Step 4: Commit**

```bash
git add src/pages/listings/index.astro src/components/listings/ListingsBrowser.astro && git commit -m "feat(listings): listings-first browse page with live filter/sort + map"
```

### Task C4: Redirect `/listings/derrick`

**Files:** Modify `src/pages/listings/derrick.astro`
**Reference:** existing `src/components/Redirect.astro` (used by `/blog`).

- [ ] **Step 1: Replace the page body** with the project's redirect stub → `/listings` (use the same `Redirect` component/pattern `/blog` uses; 301 semantics via meta-refresh + canonical as the codebase already does).
- [ ] **Step 2: Verify** `pnpm build` emits `/listings/derrick/` that points to `/listings`.
- [ ] **Step 3: Commit**

```bash
git add src/pages/listings/derrick.astro && git commit -m "feat(listings): 301 /listings/derrick -> /listings"
```

> **Phase C checkpoint:** `pnpm build && pnpm check && pnpm test` green; `/listings` is the full interactive browse experience.

---

## PHASE D — Detail pages for all listings

### Task D1: Gallery component (thumbnails + lightbox)

**Files:** Create `src/components/listings/Gallery.astro`
**Reference:** `.gallery` + lightbox in `docs/superpowers/mockups/listings.html`.

- [ ] **Step 1: Create `Gallery.astro`** — props `photos: string[]`, `place: string`. Renders a main image + up-to-N thumbnails (server-rendered) and a hidden `.lightbox` (from motion.css). Client `<script>`: clicking a thumb swaps the main `src`; clicking the main opens the lightbox; Esc/✕/backdrop closes. **Photos hotlinked, `object-fit` only, NO filters** (compliance — keep the comment).

- [ ] **Step 2: Verify** `pnpm build` with a sample (temporary import) renders; remove the temp import.
- [ ] **Step 3: Commit** `git add … && git commit -m "feat(listings): photo gallery + lightbox"`

### Task D2: Contact card + detail page for ALL listings

**Files:** Modify `src/pages/listings/[id].astro`; Create `src/components/listings/ContactCard.astro`
**Reference:** detail view in `docs/superpowers/mockups/listings.html`.

- [ ] **Step 1: Change `getStaticPaths`** to build every listing:

```ts
import { LISTINGS, IN_MARKETS, displayCity, detailHref } from '../../data/listings.ts';
export async function getStaticPaths() {
  return LISTINGS.map((listing) => ({ params: { id: listing.id }, props: { listing } }));
}
```

- [ ] **Step 2: Create `ContactCard.astro`** — Derrick's headshot (`astro:assets` `Image` of `src/assets/profile/derrick-garcia.webp`), name/role, and a Web3Forms request-a-showing form (reuse `LeadForm.astro` patterns + `CONFIG.web3formsAccessKey`, prefilled subject with the address) + `SITE.phoneDisplay`.

- [ ] **Step 3: Rebuild the detail template** (port mockup detail): breadcrumb (`Listings` → `/listings`, then `displayCity(listing.city)`), `<Gallery photos={listing.photos} place={place} />`, price/specs header, description prose, key-facts grid, `<ListingsMap single={listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined} />` (only when coords exist), `<ContactCard listing={listing} />`, a "similar listings" rail (`IN_MARKETS` minus this id, sliced to 4), and the compliance trio (`PoweredByRealtor url={listing.url}` + `Listed by {listing.brokerage}` + `TrademarkStatement` + keep the secondary `View on REALTOR.ca ↗` link). Keep `ListingSchema` and the existing gated `reportListingView` script. Update the breadcrumb link from `/listings/derrick` to `/listings`.

- [ ] **Step 4: Verify**

Run: `pnpm build && pnpm check`
Expected: ~805 `/listings/<id>/` pages built, 0 errors. `pnpm dev` → open a listing: gallery + lightbox work, mini-map shows the marker, contact card renders, compliance present, photos unfiltered.

- [ ] **Step 5: Commit**

```bash
git add src/pages/listings/\[id\].astro src/components/listings/ContactCard.astro && git commit -m "feat(listings): on-site detail pages for all listings (gallery, map, contact, compliance)"
```

> **Phase D checkpoint:** `pnpm build && pnpm check && pnpm test` green; every card reaches a rich on-site page.

---

## PHASE E — Listings-first homepage

### Task E1: Hero + search + stat bar

**Files:** Create `src/components/home/Hero.astro`, `src/components/home/StatBar.astro`
**Reference:** `.hero` + `.herostats` in `docs/superpowers/mockups/homepage.html`.

- [ ] **Step 1: `Hero.astro`** — port the hero over a **real licensed Toronto photo** via `astro:assets` `Image` (`src/assets/photos/toronto-skyline-night.jpg`) behind the dark gradient + gold glow (gradient-only fallback if removed). Headline/lede (no "nightly" copy). A search form that GETs `/listings` (location/price/beds are decorative-but-real links to `/listings`). An agent chip with Derrick's headshot (`src/assets/profile/derrick-garcia.webp`) + "Brokered by Derrick Garcia · Broker, Real Broker Ontario."
- [ ] **Step 2: `StatBar.astro`** — props from `LISTING_STATS`; render `<span data-count={stats.inMarkets}>0</span>` etc. so `enhance.ts` animates them; median formatted as `$NNNK`. Markets = `stats.marketCount`.
- [ ] **Step 3: Verify** `pnpm build && pnpm check` → 0 errors; counters animate.
- [ ] **Step 4: Commit** `git add src/components/home/Hero.astro src/components/home/StatBar.astro && git commit -m "feat(home): hero + animated stat bar (build-derived counts)"`

### Task E2: Live mortgage mini-calculator

**Files:** Create `src/components/home/MortgageMini.astro`
**Reference:** `.calc` in `docs/superpowers/mockups/homepage.html`; reuse `payment()` from `src/lib/mortgage-math.js` (signature `payment(principal, annualRate, amortYears, periodsPerYear=12)` — Canadian semi-annual compounding already correct).

- [ ] **Step 1: Create `MortgageMini.astro`** — four range sliders + value spans + result, ids `mm-price/mm-dp/mm-rate/mm-amort` (with `mm-*-v` spans), `mm-out` (result), `mm-note` (caption); plus quick links to `/affordability-calculator`, `/land-transfer-tax`, `/rent-to-own`, `/deposit-lending`. Port `.calc` markup/styles via the token map. Client `<script>`:

```ts
import { payment } from '../../lib/mortgage-math.js';
const $ = (id: string) => document.getElementById(id) as HTMLInputElement;
const out = document.getElementById('mm-out')!, note = document.getElementById('mm-note')!;
function calc() {
  const price = +$('mm-price').value, dp = +$('mm-dp').value, rate = +$('mm-rate').value, amort = +$('mm-amort').value;
  const principal = price * (1 - dp / 100);
  const monthly = payment(principal, rate / 100, amort, 12);
  const f = (n: number) => '$' + Math.round(n).toLocaleString();
  $('mm-price-v').textContent = f(price);
  $('mm-dp-v').textContent = dp + '% · ' + f(price * dp / 100);
  $('mm-rate-v').textContent = rate.toFixed(2) + '%';
  $('mm-amort-v').textContent = amort + ' yrs';
  out.textContent = f(monthly) + '/mo';
  note.textContent = `On ${f(principal)} financed at ${rate.toFixed(2)}% over ${amort} years${dp < 20 ? ' · CMHC insurance applies under 20% down' : ''}.`;
}
['mm-price','mm-dp','mm-rate','mm-amort'].forEach((id) => $(id).addEventListener('input', calc));
calc();
```

- [ ] **Step 2: Verify** `pnpm build && pnpm check`; dragging sliders updates the payment.
- [ ] **Step 3: Commit** `git add src/components/home/MortgageMini.astro && git commit -m "feat(home): live mortgage mini-calculator (reuses tested math)"`

### Task E3: Areas grid

**Files:** Create `src/components/home/AreaGrid.astro`

- [ ] **Step 1: Create `AreaGrid.astro`** — cards for Toronto, Mississauga, Brampton, Caledon, Bolton, Orangeville → `/areas/<slug>` (and `/areas` for "all"), each with a build-derived count (`IN_MARKETS.filter((l)=>municipality(l.city)===name).length`). Background photo per area via `astro:assets` **when the asset exists**; otherwise a gradient tile (no broken images). Add a `// TODO: GTA area photos` note referencing the content task.
- [ ] **Step 2: Verify** `pnpm build && pnpm check`.
- [ ] **Step 3: Commit** `git add src/components/home/AreaGrid.astro && git commit -m "feat(home): areas grid with build-derived counts + photo/gradient tiles"`

### Task E4: Assemble the homepage

**Files:** Modify `src/pages/index.astro`
**Reference:** full `docs/superpowers/mockups/homepage.html`.

- [ ] **Step 1: Rebuild `index.astro`** as `BaseLayout` + ordered sections, each wrapped in `.reveal`: `<Hero/>`, `<StatBar/>`, `<DerrickListings/>`, **Featured listings** (port `.feat` — `IN_MARKETS` newest 6 via `ListingCard`, "View all → /listings"), **Map teaser** (static `.map` graphic → links to `/listings` map; do NOT load Leaflet on home), `<MortgageMini/>`, **Sell/valuation** band (address field → `/home-valuation`), **Meet Derrick** (`AGENTS[0]` headshot/bio + Pina & Voula via `astro:assets`), `<AreaGrid/>`, **Reviews** (render from `TESTIMONIALS`; section hidden when empty), **Guides** (4 cards → `/guides/*`), final CTA → `/contact`.
- [ ] **Step 2: Verify**

Run: `pnpm build && pnpm check`
Expected: 0 errors. `pnpm dev` → `/`: listings appear above the fold area, all motion works, reduced-motion shows content statically, no-JS still shows everything.

- [ ] **Step 3: Commit** `git add src/pages/index.astro && git commit -m "feat(home): listings-first homepage assembled"`

> **Phase E checkpoint:** `pnpm build && pnpm check && pnpm test` green; the homepage matches the approved mockup.

---

## PHASE F — Accessibility, polish, docs

### Task F1: Accessibility + reduced-motion + no-JS pass

**Files:** touch-ups across new components

- [ ] **Step 1:** Verify keyboard operability: filter bar, chips, Grid/Map toggle, gallery thumbs, lightbox (Esc closes), map controls reachable; visible `:focus-visible` rings; the favorite button has `aria-pressed`. Add `aria-label`s where missing.
- [ ] **Step 2:** With `prefers-reduced-motion: reduce` (DevTools rendering emulation), confirm: no reveal animation, counters jump to final, no parallax, hero static. With JS disabled, confirm `/listings` shows the full server-rendered grid and the homepage shows all sections.
- [ ] **Step 3:** Run `pnpm build && pnpm check && pnpm test`. Expected: all green.
- [ ] **Step 4: Commit** any fixes: `git commit -am "fix(a11y): keyboard, focus, reduced-motion, no-JS pass"`

### Task F2: Update project docs

**Files:** Modify `TODO.md`, `CLAUDE.md`

- [ ] **Step 1:** Add to `TODO.md` a content task: "Source free-licensed GTA-area photos (Toronto, Mississauga, Brampton, Caledon, Bolton, Orangeville); add to `src/assets/photos/` + credit in `CREDITS.md`. Until then AreaGrid uses gradient tiles."
- [ ] **Step 2:** Update `CLAUDE.md` "Current status" to note the listings-first redesign (Evolved Midnight v2, on-site detail for all listings, interactive map) is built; reference this plan + spec.
- [ ] **Step 3: Commit** `git add TODO.md CLAUDE.md && git commit -m "docs: record listings-first redesign + GTA photo content task"`

> **Final checkpoint:** `pnpm build && pnpm check && pnpm test` all green. Optional: Lighthouse on `/`, `/listings`, a detail page — no regression vs baseline; Leaflet/index load only on `/listings`.

---

## Self-review

Run after implementing: confirm each spec section (§4 design system, §5 nav/footer, §6 homepage, §7 browse, §8 detail-for-all, §9 data/index, §10 photos, §12 compliance, §13 a11y/perf) maps to a task above. The compliance trio (PoweredByRealtor + brokerage + TrademarkStatement) must appear on `/listings` (Task C3) and every detail page (Task D2). Counts must be build-derived (Tasks B2/E1), never hardcoded.
