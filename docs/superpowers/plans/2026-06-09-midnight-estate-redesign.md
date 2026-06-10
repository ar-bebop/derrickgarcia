# Midnight Estate Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Midnight Estate" dark redesign + parity pages (Sell, Home Valuation, Rent to Own, Reviews) + Guides hub per `docs/superpowers/specs/2026-06-09-midnight-estate-redesign-design.md`.

**Architecture:** Token-level dark restyle (existing components consume CSS vars, so `tokens.css`/`global.css` carry most of it), rewritten Header/Footer/BaseLayout shell, new full-bleed page layouts (BaseLayout's `<main>` loses `.container`; pages own their containers), 4 new landing pages + an Astro content collection for guides, meta-refresh stubs for legacy Lofty URLs.

**Tech Stack:** Astro 4, vanilla CSS custom properties, `@fontsource/marcellus` + `@fontsource/source-sans-3`, Vitest (untouched math module), pnpm.

**Verification commands (used throughout):** `pnpm build` · `pnpm test` · `pnpm check`

**Conventions:** Commit after each task; **never push**. Commit trailer:
`Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`. NAP byte-identical everywhere.

---

### Task 1: Fonts + design tokens + global stylesheet

**Files:**
- Modify: `package.json` (deps via pnpm)
- Rewrite: `src/styles/tokens.css`
- Rewrite: `src/styles/global.css`

- [ ] **Step 1: Install self-hosted fonts**

```bash
pnpm add @fontsource/marcellus @fontsource/source-sans-3
```

- [ ] **Step 2: Replace `src/styles/tokens.css`**

```css
:root {
  /* Midnight Estate palette — all text tokens AA-verified on #121212 (see spec §2.1) */
  --color-bg: #121212;
  --color-panel: #1a1a1a;
  --color-ink: #f3efe7;           /* headings  ~15.9:1 */
  --color-fg: #f3efe7;            /* legacy alias used by existing components */
  --color-text: #c9c3b8;          /* body      ~10.9:1 */
  --color-muted: #9a9486;         /* secondary ~6.3:1 — do NOT go darker for text */
  --color-accent: #b08d57;        /* gold (Real Broker emblem) ~6.2:1 */
  --color-accent-ink: #15130f;    /* text on gold */
  --color-line: rgba(176, 141, 87, .25);
  --color-line-strong: rgba(176, 141, 87, .45);
  --font-display: 'Marcellus', 'Times New Roman', serif;
  --font-sans: 'Source Sans 3', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --maxw: 1100px;
  --space: 1rem;
  --radius: 2px;                  /* sharp corners — luxury direction */
  --section-pad: clamp(3rem, 7vw, 5rem);
}
```

- [ ] **Step 3: Replace `src/styles/global.css`**

```css
@import './tokens.css';

* { box-sizing: border-box; }
html { scroll-behavior: smooth; color-scheme: dark; }
body { margin: 0; font-family: var(--font-sans); color: var(--color-text);
  background: var(--color-bg); line-height: 1.65; }

h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 400;
  color: var(--color-ink); line-height: 1.15; letter-spacing: .01em; }
h1 { font-size: clamp(2.4rem, 5vw, 3.4rem); }
h2 { font-size: clamp(1.6rem, 3vw, 2rem); }

img { max-width: 100%; height: auto; display: block; }
a { color: var(--color-accent); text-underline-offset: 3px; }
a:hover { color: #c8a76e; }

.container { max-width: var(--maxw); margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2rem); }
.section { padding-block: var(--section-pad); }
.section--line { border-top: 1px solid var(--color-line); }

.kicker { color: var(--color-accent); font-size: .6875rem; font-weight: 600;
  letter-spacing: .28em; text-transform: uppercase; margin: 0 0 .9rem; }

.btn { display: inline-block; padding: .85rem 1.7rem; border-radius: var(--radius);
  background: var(--color-accent); color: var(--color-accent-ink); font-weight: 600;
  font-size: .8125rem; letter-spacing: .08em; text-transform: uppercase;
  text-decoration: none; border: 0; cursor: pointer; font-family: var(--font-sans);
  transition: background .2s ease, color .2s ease, border-color .2s ease; }
.btn:hover { background: #c8a76e; color: var(--color-accent-ink); }
.btn--ghost { background: transparent; border: 1px solid rgba(243, 239, 231, .45); color: var(--color-ink); }
.btn--ghost:hover { background: transparent; border-color: var(--color-accent); color: var(--color-accent); }

.card { border: 1px solid var(--color-line); border-radius: var(--radius);
  padding: 1.5rem; background: transparent; transition: border-color .2s ease; }
.card:hover { border-color: var(--color-accent); }

input, select, textarea {
  background: var(--color-panel); color: var(--color-text);
  border: 1px solid var(--color-line); border-radius: var(--radius); font: inherit;
}
input:focus, select:focus, textarea:focus { border-color: var(--color-accent); outline: none; }

.prose { max-width: 70ch; }
.prose h2 { margin-top: 2.5rem; }
.prose li { margin-block: .4rem; }

:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.skip-link { position: absolute; left: -9999px; top: 0; z-index: 100;
  background: var(--color-accent); color: var(--color-accent-ink); padding: .6rem 1rem; }
.skip-link:focus { left: 0; }

/* Scroll reveal — JS-gated (html.js) and motion-gated; no-JS users see everything */
@media (prefers-reduced-motion: no-preference) {
  html.js .reveal { opacity: 0; transform: translateY(12px);
    transition: opacity .5s ease, transform .5s ease; }
  html.js .reveal.is-in { opacity: 1; transform: none; }
}
```

- [ ] **Step 4: Verify build still green**

Run: `pnpm build` — Expected: success (pages look half-styled; fixed by later tasks).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/styles/
git commit -m "feat: Midnight Estate design tokens, global styles, self-hosted fonts"
```

---

### Task 2: Photos + credits

**Files:**
- Create: `src/assets/photos/toronto-skyline-night.jpg`
- Create: `src/assets/photos/toronto-skyline-sunset.jpg`
- Create: `src/assets/photos/toronto-island-park.jpg`
- Create: `src/assets/photos/CREDITS.md`

- [ ] **Step 1: Download the three visually-verified Unsplash photos (already confirmed genuine Toronto)**

```bash
cd src/assets/photos
curl -sL -o toronto-skyline-night.jpg  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=2000&q=80&fm=jpg"
curl -sL -o toronto-skyline-sunset.jpg "https://images.unsplash.com/photo-1507992781348-310259076fe0?w=2000&q=80&fm=jpg"
curl -sL -o toronto-island-park.jpg    "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=2000&q=80&fm=jpg"
file *.jpg   # all three must say "JPEG image data"
```

- [ ] **Step 2: Visually re-verify each downloaded full-res file with the Read tool** (CN Tower must be visible; guard against CDN serving something else at new params).

- [ ] **Step 3: Create `src/assets/photos/CREDITS.md`**

```markdown
# Photo credits & licenses

All photos: Unsplash License (free for commercial use, no attribution required,
must not be resold unmodified). Downloaded + self-hosted 2026-06-09; visually
verified as genuine Toronto (CN Tower visible).

| File | Source | Used on |
|---|---|---|
| toronto-skyline-night.jpg | https://unsplash.com/photos/1486325212027-8081e485255e | Home hero, 404 |
| toronto-skyline-sunset.jpg | https://unsplash.com/photos/1507992781348-310259076fe0 | Sell, Home Valuation, Home sell-split |
| toronto-island-park.jpg | https://unsplash.com/photos/1517090504586-fde19ea6066f | Contact-CTA band, About hero |

Headshots (`../profile/`) and Real Broker logos (`../branding/`) are the client's
own real assets. Old Lofty stock banners remain banned (unknown license).
```

- [ ] **Step 4: Commit**

```bash
git add src/assets/photos/
git commit -m "feat: verified self-hosted Toronto photography + license credits"
```

---

### Task 3: BaseLayout shell (fonts, skip link, reveal script, full-bleed main)

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Rewrite `src/layouts/BaseLayout.astro`**

Keep: meta/OG/canonical/favicons/analytics exactly as-is. Change: font imports, theme-color,
skip-link class, `<main>` loses `.container` (pages own containers), reveal script.

```astro
---
import '@fontsource/marcellus';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { SITE } from '../data/site.ts';
import { CONFIG } from '../data/config.ts';

const { title, description, ogImage = '/og-default.png', noindex = false } = Astro.props;
const canonical = new URL(Astro.url.pathname, SITE.url).href;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#121212" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex" />}
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL(ogImage, SITE.url).href} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <script is:inline>document.documentElement.classList.add('js');</script>
    <slot name="head" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <Header />
    <main id="main"><slot /></main>
    <Footer />
    <script is:inline>
      if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
          });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
      } else {
        document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
      }
    </script>
    {CONFIG.cloudflareAnalyticsToken && (
      <script is:inline defer src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${CONFIG.cloudflareAnalyticsToken}"}`}></script>
    )}
  </body>
</html>
```

**Note:** every existing page currently relies on `<main class="container">`. They go full-width
until their tasks below wrap them — expected interim state. Do all tasks in order; site is only
"done" after Task 14.

- [ ] **Step 2: `pnpm check` — expect 0 errors. Commit:**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: dark BaseLayout shell — self-hosted fonts, skip link, reveal observer, full-bleed main"
```

---

### Task 4: Header rewrite (dropdown nav + mobile panel)

**Files:**
- Rewrite: `src/components/Header.astro`

- [ ] **Step 1: Rewrite `src/components/Header.astro`**

`<details>`-based dropdowns (native keyboard/touch), small script for only-one-open +
outside-click/ESC close + hamburger toggle.

```astro
---
import { SITE } from '../data/site.ts';
const dropdowns = [
  { label: 'Sell', items: [
    { href: '/sell', label: 'Sell My Home' },
    { href: '/home-valuation', label: 'Home Valuation' },
  ]},
  { label: 'Tools', items: [
    { href: '/mortgage-calculator', label: 'Mortgage Calculator' },
    { href: '/affordability-calculator', label: 'Affordability Calculator' },
    { href: '/land-transfer-tax', label: 'Land Transfer Tax' },
  ]},
  { label: 'About', items: [
    { href: '/about', label: 'Meet the Team' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/contact', label: 'Contact' },
  ]},
];
---
<header class="site-header">
  <div class="container site-header__inner">
    <a href="/" class="brand">DERRICK <span>GARCIA</span></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">
      <span class="visually-hidden">Menu</span>
      <span class="nav-toggle__bar" aria-hidden="true"></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Primary">
      <ul>
        <li>
          <details class="dd">
            <summary>Sell</summary>
            <ul class="dd__menu">
              {dropdowns[0].items.map((i) => <li><a href={i.href}>{i.label}</a></li>)}
            </ul>
          </details>
        </li>
        <li><a href="/rent-to-own">Rent to Own</a></li>
        <li>
          <details class="dd">
            <summary>Tools</summary>
            <ul class="dd__menu">
              {dropdowns[1].items.map((i) => <li><a href={i.href}>{i.label}</a></li>)}
            </ul>
          </details>
        </li>
        <li><a href="/guides">Guides</a></li>
        <li>
          <details class="dd">
            <summary>About</summary>
            <ul class="dd__menu">
              {dropdowns[2].items.map((i) => <li><a href={i.href}>{i.label}</a></li>)}
            </ul>
          </details>
        </li>
        <li><a class="tel" href={SITE.phoneHref}>416-684-7370</a></li>
      </ul>
    </nav>
  </div>
</header>
<script>
  const header = document.querySelector('.site-header')!;
  const btn = header.querySelector('.nav-toggle') as HTMLButtonElement;
  btn.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', String(open));
  });
  const allDetails = () => header.querySelectorAll<HTMLDetailsElement>('.site-nav details');
  allDetails().forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) allDetails().forEach((o) => { if (o !== d) o.removeAttribute('open'); });
  }));
  document.addEventListener('click', (e) => {
    allDetails().forEach((d) => { if (d.open && !d.contains(e.target as Node)) d.removeAttribute('open'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      allDetails().forEach((d) => d.removeAttribute('open'));
      header.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
</script>
<style>
  .site-header { border-bottom: 1px solid var(--color-line); background: var(--color-bg);
    position: sticky; top: 0; z-index: 50; }
  .site-header__inner { display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; padding-block: .9rem; }
  .brand { font-family: var(--font-display); color: var(--color-ink); font-size: 1.05rem;
    letter-spacing: .18em; text-decoration: none; white-space: nowrap; }
  .brand span { color: var(--color-accent); }

  .site-nav ul { display: flex; gap: 1.4rem; align-items: center; list-style: none; margin: 0; padding: 0; }
  .site-nav a, .site-nav summary { color: var(--color-text); text-decoration: none;
    font-size: .85rem; letter-spacing: .05em; cursor: pointer; }
  .site-nav a:hover, .site-nav summary:hover { color: var(--color-accent); }
  .site-nav .tel { color: var(--color-accent); font-weight: 600; }

  .dd { position: relative; }
  .dd summary { list-style: none; }
  .dd summary::-webkit-details-marker { display: none; }
  .dd summary::after { content: ' ▾'; color: var(--color-muted); font-size: .7em; }
  .dd__menu { position: absolute; top: calc(100% + .9rem); left: -1rem; min-width: 13rem;
    background: var(--color-panel); border: 1px solid var(--color-line-strong);
    padding: .5rem 0; margin: 0; display: block; z-index: 60; }
  .dd__menu li { list-style: none; }
  .dd__menu a { display: block; padding: .55rem 1.1rem; }

  .nav-toggle { display: none; background: none; border: 1px solid var(--color-line);
    border-radius: var(--radius); padding: .55rem .65rem; cursor: pointer; }
  .nav-toggle__bar { display: block; width: 1.2rem; height: 2px; background: var(--color-ink);
    box-shadow: 0 -5px 0 var(--color-ink), 0 5px 0 var(--color-ink); }

  @media (max-width: 860px) {
    .nav-toggle { display: block; }
    .site-nav { display: none; }
    .nav-open .site-nav { display: block; position: fixed; inset: 3.4rem 0 0 0;
      background: var(--color-bg); overflow-y: auto; padding: 1.5rem; z-index: 49; }
    .nav-open .site-nav > ul { flex-direction: column; align-items: stretch; gap: 0; }
    .nav-open .site-nav > ul > li { border-bottom: 1px solid var(--color-line); }
    .nav-open .site-nav a, .nav-open .site-nav summary { display: block; padding: 1rem .2rem; font-size: 1.05rem; }
    .nav-open .dd__menu { position: static; border: 0; padding: 0 0 .5rem 1rem; }
  }
</style>
```

- [ ] **Step 2: `pnpm check` 0 errors; `pnpm build` green. Commit:**

```bash
git add src/components/Header.astro
git commit -m "feat: dark header — Marcellus brand, dropdown nav, mobile panel"
```

---

### Task 5: Footer rewrite (4 columns + legal row)

**Files:**
- Rewrite: `src/components/Footer.astro`

- [ ] **Step 1: Rewrite `src/components/Footer.astro`**

```astro
---
import { Image } from 'astro:assets';
import { SITE } from '../data/site.ts';
import realWordmark from '../assets/branding/real-wordmark-white.png';
---
<footer class="site-footer">
  <div class="container">
    <div class="grid">
      <div>
        <p class="brand">DERRICK <span>GARCIA</span></p>
        <p class="nap">{SITE.brokerage}<br />{SITE.address.street}<br />
          {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
        <p class="nap"><a href={SITE.phoneHref}>{SITE.phoneDisplay}</a><br />
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
        <Image src={realWordmark} alt="Real Broker" width={90} class="wordmark" />
      </div>
      <nav aria-label="Explore">
        <h2>Explore</h2>
        <a href="/sell">Sell My Home</a>
        <a href="/home-valuation">Home Valuation</a>
        <a href="/rent-to-own">Rent to Own</a>
        <a href="/reviews">Reviews</a>
        <a href={SITE.listingsSearchUrl} target="_blank" rel="noopener noreferrer">Search Homes ↗</a>
      </nav>
      <nav aria-label="Tools">
        <h2>Tools</h2>
        <a href="/mortgage-calculator">Mortgage Calculator</a>
        <a href="/affordability-calculator">Affordability Calculator</a>
        <a href="/land-transfer-tax">Land Transfer Tax</a>
        <a href="/guides">Guides</a>
      </nav>
      <nav aria-label="Connect">
        <h2>Connect</h2>
        <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="/contact">Book a Call</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
    <div class="legal">
      <span>© {new Date().getFullYear()} {SITE.legalName}. Not intended to solicit buyers or sellers currently under contract.</span>
      <span><a href="/privacy">Privacy</a> · <a href="/accessibility">Accessibility</a></span>
    </div>
  </div>
</footer>
<style>
  .site-footer { border-top: 1px solid var(--color-line); margin-top: var(--section-pad);
    padding-block: 3rem 1.5rem; }
  .grid { display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .brand { font-family: var(--font-display); color: var(--color-ink); letter-spacing: .18em; margin: 0 0 .8rem; }
  .brand span { color: var(--color-accent); }
  .nap { font-size: .85rem; line-height: 1.9; margin: 0 0 .8rem; }
  .nap a { color: var(--color-text); text-decoration: none; }
  .nap a:hover { color: var(--color-accent); }
  .wordmark { opacity: .6; margin-top: .4rem; }
  .site-footer nav { display: flex; flex-direction: column; gap: .45rem; }
  .site-footer nav h2 { font-family: var(--font-sans); color: var(--color-accent);
    font-size: .6875rem; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; margin: 0 0 .5rem; }
  .site-footer nav a { color: var(--color-text); text-decoration: none; font-size: .85rem; }
  .site-footer nav a:hover { color: var(--color-accent); }
  .legal { border-top: 1px solid var(--color-line); margin-top: 2.2rem; padding-top: 1.2rem;
    display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
    color: var(--color-muted); font-size: .78rem; }
  .legal a { color: var(--color-muted); }
</style>
```

- [ ] **Step 2: Build + commit:**

```bash
git add src/components/Footer.astro
git commit -m "feat: four-column dark footer with NAP block and Real Broker wordmark"
```

---

### Task 6: Data/config additions (testimonials, stats, guides collection)

**Files:**
- Modify: `src/data/config.ts`
- Modify: `src/data/site.ts`
- Create: `src/content/config.ts`

- [ ] **Step 1: Append to `src/data/config.ts` (inside CONFIG stays unchanged; add export below)**

```ts
// Real client testimonials. Ships empty — old site had none. When Derrick supplies
// reviews, add them here; the Reviews page and Home teaser render automatically.
export interface Testimonial { quote: string; name: string; source: string; location?: string }
export const TESTIMONIALS: Testimonial[] = [];
```

- [ ] **Step 2: Add real, bio-sourced stats to `src/data/site.ts`** (before closing `};` of SITE)

```ts
  // Real facts sourced from the team bios in agents.ts — never invent numbers here.
  stats: [
    { value: '99.9%', label: 'List-to-sell ratio' },        // Derrick's bio
    { value: '21 yrs', label: 'Licensed experience' },      // Pina's bio
    { value: '3', label: 'Languages spoken' },              // EN · FR · IT (Pina's bio)
  ],
```

- [ ] **Step 3: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),          // "2026-06-09" — shown as "reviewed" date
    order: z.number(),
    readTime: z.string(),      // "6 min read"
    calculator: z.object({ label: z.string(), href: z.string() }).optional(),
  }),
});

export const collections = { guides };
```

- [ ] **Step 4: `pnpm check` (collection without entries is fine until Task 11). Commit:**

```bash
git add src/data/config.ts src/data/site.ts src/content/config.ts
git commit -m "feat: testimonials slot, real bio-sourced stats, guides collection schema"
```

---

### Task 7: Home page rebuild (11 approved sections)

**Files:**
- Rewrite: `src/pages/index.astro`

- [ ] **Step 1: Rewrite `src/pages/index.astro`** — sections per approved mockup. Uses
`<Image>` heroes, `SITE.stats` strip, team headshots via existing `AGENTS`, testimonial
teaser only when `TESTIMONIALS.length > 0`, guides teaser hardcoded to the 4 slugs.

```astro
---
import { Image } from 'astro:assets';
import BaseLayout from '../layouts/BaseLayout.astro';
import RealEstateAgentSchema from '../components/RealEstateAgentSchema.astro';
import { AGENTS } from '../data/agents.ts';
import { SITE } from '../data/site.ts';
import { TESTIMONIALS } from '../data/config.ts';
import heroNight from '../assets/photos/toronto-skyline-night.jpg';
import sunset from '../assets/photos/toronto-skyline-sunset.jpg';
import park from '../assets/photos/toronto-island-park.jpg';
const images = import.meta.glob<{ default: ImageMetadata }>('../assets/profile/*.webp', { eager: true });
import type { ImageMetadata } from 'astro';
const guides = [
  { href: '/guides/first-time-buyer-toronto', title: 'First-Time Buyer Guide (Toronto)' },
  { href: '/guides/mortgage-stress-test', title: 'The Mortgage Stress Test, Explained' },
  { href: '/guides/toronto-land-transfer-tax', title: "Toronto's Double Land Transfer Tax" },
  { href: '/guides/rent-to-own-explained', title: 'Rent-to-Own: How It Actually Works' },
];
---
<BaseLayout title="Derrick Garcia — Toronto & GTA Real Estate Broker | Real Broker Ontario"
  description="Buy or sell with Derrick Garcia, Toronto & GTA real estate broker at Real Broker Ontario. Calculators, home valuations, rent-to-own, and a team that picks up the phone.">
  <RealEstateAgentSchema slot="head" />

  <section class="hero">
    <Image src={heroNight} alt="" class="hero__bg" widths={[800, 1400, 2000]} sizes="100vw" loading="eager" />
    <div class="container hero__inner">
      <p class="kicker">Real Broker Ontario · Toronto &amp; GTA</p>
      <h1>A higher standard for Toronto real estate.</h1>
      <p class="hero__sub">Buy and sell with a broker who treats your move like the investment
        it is — backed by a team that knows every corner of the GTA.</p>
      <div class="hero__ctas">
        <a class="btn" href="/contact">Work With Us</a>
        <a class="btn btn--ghost" href={SITE.listingsSearchUrl} target="_blank" rel="noopener noreferrer">Search Homes ↗</a>
      </div>
    </div>
  </section>

  <section class="stats" aria-label="Track record">
    <div class="container stats__grid">
      {SITE.stats.map((s) => (
        <div class="stats__item reveal"><span class="stats__value">{s.value}</span>
          <span class="stats__label">{s.label}</span></div>
      ))}
    </div>
  </section>

  <section class="section container">
    <p class="kicker">Plan your purchase</p>
    <h2>Know your numbers before you offer.</h2>
    <div class="tools">
      <a class="card reveal" href="/mortgage-calculator"><h3>Mortgage Calculator</h3>
        <p>Payments computed the Canadian way — semi-annual compounding, CMHC included.</p><span class="card__cta">Open →</span></a>
      <a class="card reveal" href="/affordability-calculator"><h3>Affordability</h3>
        <p>Stress test and GDS/TDS limits. Your true ceiling, no surprises.</p><span class="card__cta">Open →</span></a>
      <a class="card reveal" href="/land-transfer-tax"><h3>Land Transfer Tax</h3>
        <p>Ontario plus Toronto's double LTT, with first-time buyer rebates.</p><span class="card__cta">Open →</span></a>
    </div>
  </section>

  <section class="section section--line">
    <div class="container sell">
      <div class="reveal">
        <p class="kicker">Selling?</p>
        <h2>What is your home worth today?</h2>
        <p>Get a no-obligation valuation grounded in real comparables — not an algorithm's
          guess. We'll walk you through pricing, prep, and timing.</p>
        <p><a class="btn" href="/home-valuation">Get a Home Valuation</a></p>
      </div>
      <Image src={sunset} alt="Toronto skyline at sunset over Lake Ontario" class="sell__img reveal"
        widths={[600, 1200]} sizes="(max-width: 760px) 100vw, 50vw" />
    </div>
  </section>

  <section class="rto">
    <div class="container rto__inner">
      <div><h2>Not mortgage-ready yet? Rent to own.</h2>
        <p>A structured path from renting to owning — see if the program fits you.</p></div>
      <a class="btn rto__btn" href="/rent-to-own">How It Works</a>
    </div>
  </section>

  <section class="section container">
    <p class="kicker">Who you'll work with</p>
    <h2>Meet the team.</h2>
    <div class="team">
      {AGENTS.map((agent) => {
        const img = images[`../assets/${agent.photo}`]?.default;
        return (
          <a class="agent reveal" href="/about">
            {img && <Image src={img} alt={`${agent.name}, ${agent.title}`} width={500} height={550} />}
            <span class="agent__name">{agent.name}</span>
            <span class="agent__role">{agent.title}</span>
          </a>
        );
      })}
    </div>
  </section>

  {TESTIMONIALS.length > 0 && (
    <section class="section section--line">
      <div class="container quote reveal">
        <p class="quote__stars" aria-hidden="true">★★★★★</p>
        <blockquote>“{TESTIMONIALS[0].quote}”</blockquote>
        <p class="quote__who">{TESTIMONIALS[0].name} · {TESTIMONIALS[0].source}</p>
        <p><a href="/reviews">Read more reviews →</a></p>
      </div>
    </section>
  )}

  <section class="section section--line container">
    <p class="kicker">Guides</p>
    <h2>Understand the market before you move.</h2>
    <ul class="guides">
      {guides.map((g) => (
        <li class="reveal"><a href={g.href}>{g.title}<span aria-hidden="true"> →</span></a></li>
      ))}
    </ul>
  </section>

  <section class="cta">
    <Image src={park} alt="" class="cta__bg" widths={[800, 1600]} sizes="100vw" />
    <div class="container cta__inner reveal">
      <p class="kicker">Ready when you are</p>
      <h2>Let's talk about your move.</h2>
      <p>Book a call, send a note, or just phone — no pressure, no spam.</p>
      <p><a class="btn" href="/contact">Get in Touch</a></p>
    </div>
  </section>
</BaseLayout>
<style>
  .hero { position: relative; overflow: hidden; }
  .hero__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }
  .hero::before { content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(12,12,14,.45), rgba(12,12,14,.9)); }
  .hero__inner { position: relative; padding-block: clamp(4rem, 12vw, 7.5rem) clamp(3rem, 8vw, 5rem); }
  .hero h1 { max-width: 14ch; margin: 0 0 1rem; }
  .hero__sub { max-width: 46ch; font-size: 1.05rem; margin: 0 0 1.8rem; }
  .hero__ctas { display: flex; gap: .9rem; flex-wrap: wrap; }

  .stats { border-block: 1px solid var(--color-line); }
  .stats__grid { display: grid; grid-template-columns: repeat(3, 1fr); }
  .stats__item { padding: 1.4rem 1rem; border-right: 1px solid var(--color-line);
    display: flex; flex-direction: column; gap: .15rem; }
  .stats__item:last-child { border-right: 0; }
  .stats__value { font-family: var(--font-display); color: var(--color-accent); font-size: 1.6rem; }
  .stats__label { color: var(--color-muted); font-size: .7rem; letter-spacing: .18em; text-transform: uppercase; }
  @media (max-width: 640px) { .stats__grid { grid-template-columns: 1fr; }
    .stats__item { border-right: 0; border-bottom: 1px solid var(--color-line); }
    .stats__item:last-child { border-bottom: 0; } }

  .tools { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 1.8rem; }
  .tools .card { text-decoration: none; display: flex; flex-direction: column; gap: .5rem; }
  .tools h3 { margin: 0; font-size: 1.15rem; }
  .tools p { color: var(--color-muted); font-size: .9rem; margin: 0; flex: 1; }
  .card__cta { color: var(--color-accent); font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; }

  .sell { display: grid; gap: 2.5rem; grid-template-columns: 1fr 1fr; align-items: center; }
  .sell__img { border: 1px solid var(--color-line-strong); aspect-ratio: 16/10; object-fit: cover; }
  @media (max-width: 760px) { .sell { grid-template-columns: 1fr; } }

  .rto { background: var(--color-accent); }
  .rto__inner { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;
    flex-wrap: wrap; padding-block: 1.8rem; }
  .rto h2 { color: var(--color-accent-ink); font-size: 1.4rem; margin: 0; }
  .rto p { color: rgba(21, 19, 15, .75); margin: .3rem 0 0; font-size: .95rem; }
  .rto__btn { background: var(--color-accent-ink); color: #ecd9b8; }
  .rto__btn:hover { background: #000; color: #ecd9b8; }

  .team { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-top: 1.8rem; }
  .agent { border: 1px solid var(--color-line); text-decoration: none; transition: border-color .2s ease; }
  .agent:hover { border-color: var(--color-accent); }
  .agent img { width: 100%; height: auto; object-fit: cover; filter: saturate(.88); }
  .agent__name { display: block; font-family: var(--font-display); color: var(--color-ink);
    font-size: 1.05rem; padding: .8rem 1rem 0; }
  .agent__role { display: block; color: var(--color-accent); font-size: .7rem;
    letter-spacing: .16em; text-transform: uppercase; padding: .15rem 1rem .9rem; }

  .quote { text-align: center; max-width: 640px; }
  .quote__stars { color: var(--color-accent); letter-spacing: 6px; margin: 0; }
  .quote blockquote { font-family: var(--font-display); color: var(--color-ink);
    font-size: 1.35rem; line-height: 1.45; margin: 1rem 0; }
  .quote__who { color: var(--color-muted); font-size: .8rem; letter-spacing: .1em; text-transform: uppercase; }

  .guides { list-style: none; margin: 1.8rem 0 0; padding: 0; display: grid;
    gap: 0 2.5rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .guides li { border-bottom: 1px solid var(--color-line); }
  .guides a { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem .2rem;
    font-family: var(--font-display); color: var(--color-ink); text-decoration: none; font-size: 1.05rem; }
  .guides a:hover { color: var(--color-accent); }

  .cta { position: relative; overflow: hidden; margin-top: var(--section-pad); }
  .cta__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }
  .cta::before { content: ''; position: absolute; inset: 0; background: rgba(14, 14, 15, .93); }
  .cta__inner { position: relative; text-align: center; padding-block: clamp(3rem, 8vw, 4.5rem); }
  .cta__inner p { max-width: 44ch; margin-inline: auto; }
</style>
```

- [ ] **Step 2: `pnpm build` + `pnpm check` green (guides links 404 until Task 11 — fine, static strings). Commit:**

```bash
git add src/pages/index.astro
git commit -m "feat: rebuild homepage to approved Midnight Estate structure"
```

---

### Task 8: Sell My Home page

**Files:**
- Create: `src/pages/sell.astro`

- [ ] **Step 1: Create `src/pages/sell.astro`** — real copy + the old site's real 6-step plan.

```astro
---
import { Image } from 'astro:assets';
import BaseLayout from '../layouts/BaseLayout.astro';
import sunset from '../assets/photos/toronto-skyline-sunset.jpg';
const steps = [
  ['Marketing Analysis & Pricing', 'We study recent comparable sales and current competition to price your home to sell — without leaving money on the table.'],
  ['Home Preparation & Staging', 'Honest advice on what to fix, what to skip, and how to present every room so buyers see the value.'],
  ['Marketing & Showings', 'Professional listing, broad exposure, and showings managed around your schedule.'],
  ['Offers & Negotiation', 'Every offer reviewed together; sharp negotiation backed by a 99.9% list-to-sell track record.'],
  ['Contract & Paperwork', 'Conditions, clauses, and deadlines handled precisely, so nothing surprises you later.'],
  ['Closing & Beyond', 'From sold sign to key handover — and we stay reachable after closing.'],
];
---
<BaseLayout title="Sell My Home — Derrick Garcia | Real Broker Ontario"
  description="Sell your Toronto or GTA home with Derrick Garcia. A clear six-step plan: pricing, staging, marketing, negotiation, paperwork, closing.">
  <section class="hero">
    <Image src={sunset} alt="" class="hero__bg" widths={[800, 1600]} sizes="100vw" loading="eager" />
    <div class="container hero__inner">
      <p class="kicker">Sell My Home</p>
      <h1>We love working with sellers.</h1>
      <p class="hero__sub">Our team will be with you every step of the way — from preparing
        your home for sale to handing the keys to the new buyer.</p>
    </div>
  </section>

  <section class="section container">
    <p class="kicker">The plan</p>
    <h2>Six steps, no guesswork.</h2>
    <ol class="steps">
      {steps.map(([title, body], i) => (
        <li class="card reveal">
          <span class="steps__n">{String(i + 1).padStart(2, '0')}</span>
          <h3>{title}</h3><p>{body}</p>
        </li>
      ))}
    </ol>
  </section>

  <section class="section section--line container ctas reveal">
    <h2>Start with the number that matters.</h2>
    <p>Find out what your home is worth today — free, no obligation.</p>
    <p><a class="btn" href="/home-valuation">Get a Home Valuation</a>
       <a class="btn btn--ghost" href="/contact">Talk to Derrick</a></p>
  </section>
</BaseLayout>
<style>
  .hero { position: relative; overflow: hidden; }
  .hero__bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }
  .hero::before { content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(12,12,14,.55), rgba(12,12,14,.9)); }
  .hero__inner { position: relative; padding-block: clamp(3.5rem, 9vw, 5.5rem); }
  .hero__sub { max-width: 52ch; font-size: 1.05rem; }
  .steps { list-style: none; margin: 1.8rem 0 0; padding: 0; display: grid; gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .steps__n { font-family: var(--font-display); color: var(--color-accent); font-size: 1.5rem; }
  .steps h3 { font-size: 1.1rem; margin: .4rem 0 .4rem; }
  .steps p { color: var(--color-muted); font-size: .9rem; margin: 0; }
  .ctas .btn { margin-right: .6rem; }
</style>
```

- [ ] **Step 2: Build + commit:**

```bash
git add src/pages/sell.astro
git commit -m "feat: Sell My Home page with original six-step plan"
```

---

### Task 9: Home Valuation page + LeadForm valuation variant

**Files:**
- Modify: `src/components/LeadForm.astro`
- Create: `src/pages/home-valuation.astro`

- [ ] **Step 1: Extend `src/components/LeadForm.astro`** — add a `valuation` prop that renders
property fields; everything else (key gating, honeypot, consent, fallback) unchanged:

Replace line 4 (`const { subject = ... } = Astro.props;`) with:

```astro
const { subject = '🏠 New website lead — Contact', formName = 'Contact', valuation = false } = Astro.props;
```

Insert immediately **before** `<div class="lead-form__grid">`:

```astro
    {valuation && (
      <>
        <label>Property address<input type="text" name="address" required autocomplete="street-address" /></label>
        <div class="lead-form__grid">
          <label>Property type
            <select name="property_type">
              <option>Detached</option><option>Semi-detached</option><option>Townhouse</option>
              <option>Condo apartment</option><option>Other</option>
            </select>
          </label>
          <label>Bedrooms<input type="number" name="beds" min="0" max="20" /></label>
          <label>Bathrooms<input type="number" name="baths" min="0" max="20" /></label>
          <label>When do you plan to sell?
            <select name="timeframe">
              <option>As soon as possible</option><option>1–3 months</option>
              <option>3–6 months</option><option>Just curious</option>
            </select>
          </label>
        </div>
      </>
    )}
```

Change the message label line to make the message optional for valuations:

```astro
    <label>{valuation ? 'Anything else we should know? (optional)' : 'How can we help?'}
      <textarea name="message" rows="4" required={!valuation}></textarea></label>
```

And the submit button:

```astro
    <button type="submit" class="btn">{valuation ? 'Request my valuation' : 'Send message'}</button>
```

- [ ] **Step 2: Create `src/pages/home-valuation.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import LeadForm from '../components/LeadForm.astro';
import { SITE } from '../data/site.ts';
---
<BaseLayout title="Home Valuation — What's Your Home Worth? | Derrick Garcia"
  description="Free, no-obligation home valuation for Toronto & GTA. Real comparables prepared personally by Derrick Garcia — not an algorithm's guess.">
  <section class="head container">
    <p class="kicker">Home Valuation</p>
    <h1>What's your home worth? Find out fast and free.</h1>
    <p class="dek">Derrick prepares every valuation personally, from real comparable sales —
      not an automated estimate. No obligation, no follow-up pressure.</p>
  </section>
  <section class="container form-wrap">
    <LeadForm valuation subject="🏠 Home valuation request" formName="Home Valuation" />
    <p class="alt">Prefer to talk? Call <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a> or email
      <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
  </section>
</BaseLayout>
<style>
  .head { padding-block: clamp(2.5rem, 7vw, 4rem) 1rem; }
  .head h1 { max-width: 24ch; }
  .dek { max-width: 56ch; font-size: 1.05rem; }
  .form-wrap { max-width: 760px; margin-inline: auto; padding-bottom: var(--section-pad); }
  .alt { color: var(--color-muted); margin-top: 1.5rem; }
</style>
```

- [ ] **Step 3: Verify both form variants build; fallback path renders when key empty
(`pnpm build` then grep `dist/home-valuation/index.html` for "Call +1 416-684-7370"). Commit:**

```bash
git add src/components/LeadForm.astro src/pages/home-valuation.astro
git commit -m "feat: home valuation page with extended lead form variant"
```

---

### Task 10: Rent to Own + Reviews pages

**Files:**
- Create: `src/pages/rent-to-own.astro`
- Create: `src/pages/reviews.astro`

- [ ] **Step 1: Create `src/pages/rent-to-own.astro`** — old site's real program copy,
spelling corrected, **facts preserved exactly** ($200,000+ GTA / $80,000+ outside; ~5% down
used as deposit; budget ≈ 4–4.5× household income; 12+ years; disclaimer):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const who = [
  'Those with a consumer proposal or bankruptcy history',
  'Individuals with poor payment records or excessive debt',
  'Self-employed professionals and new Canadians seeking a fresh start',
  'Divorced individuals and millennials facing a high cost of living',
  'Anyone with limited job history that doesn\'t meet the banks\' requirements',
];
---
<BaseLayout title="Rent to Own — A Path to Your Dream Home | Derrick Garcia"
  description="Oliver's Rent to Own program with RTO-certified realtor Derrick Garcia: who qualifies, income requirements, down payment, and how to start.">
  <section class="head container">
    <p class="kicker">Rent to Own</p>
    <h1>A path to your dream home.</h1>
    <p class="dek">Oliver's Rent to Own program has been helping families achieve their
      homeownership dreams for over 12 years, alongside RTO-certified realtors like Derrick.
      The mission is simple: assist families in securing a place they can call home.</p>
  </section>

  <section class="section container two-col">
    <div class="reveal">
      <h2>Who can benefit?</h2>
      <p>Rent to Own is designed for individuals and families who might find it challenging
        to obtain a mortgage through traditional means, such as banks. That includes:</p>
      <ul>{who.map((w) => <li>{w}</li>)}</ul>
    </div>
    <div class="reveal">
      <h2>Financial considerations</h2>
      <dl class="facts">
        <div><dt>Income requirements</dt>
          <dd>Depending on your location, a combined household income of <strong>$200,000+</strong> (in
          the GTA) or <strong>$80,000+</strong> (outside the GTA) is needed.</dd></div>
        <div><dt>Down payment</dt>
          <dd>A minimum of <strong>5%</strong> of the purchase price is recommended, typically used
          as a deposit during the purchase offer process.</dd></div>
        <div><dt>Budgeting</dt>
          <dd>Aim for a purchase price of approximately <strong>4 to 4.5×</strong> your household
          income as a maximum.</dd></div>
      </dl>
    </div>
  </section>

  <section class="section section--line container reveal">
    <h2>Ready to take the first step toward homeownership?</h2>
    <p>Contact Derrick today to learn whether Rent to Own fits your situation.</p>
    <p><a class="btn" href="/contact">Contact Derrick</a>
       <a class="btn btn--ghost" href="/guides/rent-to-own-explained">Read the guide</a></p>
    <p class="disclaimer">This information is provided for general purposes only. Consumers are
      strongly encouraged to conduct their own due diligence and seek professional advice before
      entering any rent-to-own agreement.</p>
  </section>
</BaseLayout>
<style>
  .head { padding-block: clamp(2.5rem, 7vw, 4rem) 0; }
  .dek { max-width: 60ch; font-size: 1.05rem; }
  .two-col { display: grid; gap: 2.5rem; grid-template-columns: 1fr 1fr; align-items: start; }
  @media (max-width: 760px) { .two-col { grid-template-columns: 1fr; } }
  .facts div { border-top: 1px solid var(--color-line); padding-block: .9rem; }
  .facts dt { font-family: var(--font-display); color: var(--color-accent); margin-bottom: .25rem; }
  .facts dd { margin: 0; }
  .disclaimer { color: var(--color-muted); font-size: .8rem; max-width: 70ch; margin-top: 2rem; }
  .btn { margin-right: .6rem; }
</style>
```

- [ ] **Step 2: Create `src/pages/reviews.astro`** — config-driven; honest empty state:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { TESTIMONIALS } from '../data/config.ts';
import { SITE } from '../data/site.ts';
const gbp = SITE.social.googleBusiness;
---
<BaseLayout title="Reviews — Derrick Garcia | Real Broker Ontario"
  description="What clients say about working with Derrick Garcia and the team across Toronto & the GTA.">
  <section class="head container">
    <p class="kicker">Reviews</p>
    <h1>What clients say.</h1>
  </section>
  <section class="container body">
    {TESTIMONIALS.length > 0 ? (
      <div class="grid">
        {TESTIMONIALS.map((t) => (
          <figure class="card reveal">
            <p class="stars" aria-hidden="true">★★★★★</p>
            <blockquote>“{t.quote}”</blockquote>
            <figcaption>{t.name}{t.location ? ` · ${t.location}` : ''} <span>via {t.source}</span></figcaption>
          </figure>
        ))}
      </div>
    ) : (
      <p class="empty">Our reviews live on Google — read what past clients say, straight from
        the source.</p>
    )}
    <p class="ctas">
      {gbp && <a class="btn" href={gbp} target="_blank" rel="noopener noreferrer">Read our Google reviews ↗</a>}
      {gbp && <a class="btn btn--ghost" href={gbp} target="_blank" rel="noopener noreferrer">Leave a review ↗</a>}
      {!gbp && <a class="btn" href={SITE.phoneHref}>Call {SITE.phoneDisplay}</a>}
      {!gbp && <a class="btn btn--ghost" href={`mailto:${SITE.email}`}>Email us</a>}
    </p>
  </section>
</BaseLayout>
<style>
  .head { padding-block: clamp(2.5rem, 7vw, 4rem) 1rem; }
  .body { padding-bottom: var(--section-pad); }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  figure { margin: 0; }
  .stars { color: var(--color-accent); letter-spacing: 5px; margin: 0 0 .6rem; }
  blockquote { font-family: var(--font-display); color: var(--color-ink); font-size: 1.1rem;
    line-height: 1.5; margin: 0 0 .8rem; }
  figcaption { color: var(--color-muted); font-size: .85rem; }
  .empty { max-width: 56ch; font-size: 1.05rem; }
  .ctas { margin-top: 1.6rem; }
  .ctas .btn { margin-right: .6rem; }
</style>
```

**Note:** no Review/AggregateRating JSON-LD while TESTIMONIALS is empty (spec §4.5 — never fabricate).

- [ ] **Step 3: Build + commit:**

```bash
git add src/pages/rent-to-own.astro src/pages/reviews.astro
git commit -m "feat: rent-to-own page (real program facts) and config-driven reviews page"
```

---

### Task 11: Guides — 4 articles + index + detail page

**Files:**
- Create: `src/content/guides/first-time-buyer-toronto.md`
- Create: `src/content/guides/mortgage-stress-test.md`
- Create: `src/content/guides/toronto-land-transfer-tax.md`
- Create: `src/content/guides/rent-to-own-explained.md`
- Create: `src/pages/guides/index.astro`
- Create: `src/pages/guides/[slug].astro`

- [ ] **Step 1: Read `src/lib/mortgage-math.js` first.** Every regulatory number in the
articles MUST match the constants there (MQR floor, CMHC tiers, GDS/TDS, LTT brackets,
rebate caps, min-down rules). If a number differs, the **module wins** (it was TDD'd from
the research appendix).

- [ ] **Step 2: Write the four articles.** Frontmatter exactly as below; prose written at
execution following the listed facts (~450–650 words each, plain language, no hype, every
regulatory number stated with "as of June 2026", each article ends with a contact CTA
paragraph linking `/contact`):

`first-time-buyer-toronto.md` — frontmatter:
```yaml
title: "First-Time Buyer Guide: Toronto & the GTA"
description: "Down payments, deposits, closing costs, and the rebates first-time buyers actually get in Toronto — explained in plain language."
date: "2026-06-09"
order: 1
readTime: "7 min read"
calculator: { label: "Affordability Calculator", href: "/affordability-calculator" }
```
Facts to cover: minimum down payment tiers (5% of first $500k, 10% of the portion $500k–$1.5M,
20% at $1.5M+; insured cap $1.5M); deposit ≠ down payment (deposit due ~24h after acceptance,
counts toward down payment); CMHC insurance required under 20% down (premium added to the
mortgage); closing costs ≈ 1.5–4% (legal, title insurance, adjustments, LTT); first-time-buyer
rebates: Ontario LTT rebate up to $4,000 + Toronto MLTT rebate up to $4,475; FHSA ($8,000/yr,
$40,000 lifetime) and RRSP Home Buyers' Plan ($60,000 withdrawal); link Affordability + LTT
calculators inline.

`mortgage-stress-test.md` — frontmatter:
```yaml
title: "The Mortgage Stress Test, Explained"
description: "Why you qualify at a higher rate than you'll pay: Canada's minimum qualifying rate, who it applies to, and what it does to your budget."
date: "2026-06-09"
order: 2
readTime: "5 min read"
calculator: { label: "Mortgage Calculator", href: "/mortgage-calculator" }
```
Facts: MQR = max(contract rate + 2%, 5.25%) as of June 2026; applies to federally regulated
lenders (insured + uninsured); GDS/TDS limits 39%/44% for insured mortgages; worked example —
contract 5.0% → qualify at 7.0%; consequence: budget ≈ 20% lower than naive estimate; Canadian
fixed-rate semi-annual compounding note; link Mortgage + Affordability calculators.

`toronto-land-transfer-tax.md` — frontmatter:
```yaml
title: "Toronto's Double Land Transfer Tax"
description: "Buying in Toronto means paying land transfer tax twice — provincial and municipal. The brackets, the first-time-buyer rebates, and a worked example."
date: "2026-06-09"
order: 3
readTime: "5 min read"
calculator: { label: "Land Transfer Tax Calculator", href: "/land-transfer-tax" }
```
Facts: Ontario LTT marginal brackets (0.5% to $55k; 1% to $250k; 1.5% to $400k; 2% to $2M;
2.5% above — residential); Toronto MLTT mirrors these within the city (plus luxury tiers above
$3M); first-time-buyer rebates Ontario $4,000 / Toronto $4,475; worked example on an $800,000
Toronto home (compute with the math module's brackets during writing; state both taxes and
total); note: applies on closing, can't be mortgaged; link LTT calculator.

`rent-to-own-explained.md` — frontmatter:
```yaml
title: "Rent-to-Own: How It Actually Works"
description: "Option fees, monthly credits, and the buy-back — how rent-to-own programs work in Ontario and who they genuinely help."
date: "2026-06-09"
order: 4
readTime: "6 min read"
calculator: { label: "Affordability Calculator", href: "/affordability-calculator" }
```
Facts: general mechanics (program partner buys the home, you lease it with a locked-in future
purchase price and a savings component building your down payment); who it helps (mirror
/rent-to-own list); Derrick's program facts ($200k+/$80k+ income, ~5% initial deposit, 4–4.5×
income budget, 12+ years operating); risks to weigh (you must complete the purchase or may
forfeit credits; get independent legal advice); link /rent-to-own + Affordability calculator.

- [ ] **Step 3: Create `src/pages/guides/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title="Guides — Toronto & GTA Real Estate | Derrick Garcia"
  description="Evergreen guides to buying and selling in Toronto: down payments, the stress test, land transfer tax, and rent-to-own — written to stay accurate.">
  <section class="head container">
    <p class="kicker">Guides</p>
    <h1>Understand the market before you move.</h1>
    <p class="dek">No hot takes, no market-timing predictions — just the rules, numbers, and
      processes that actually decide what you can buy or net from a sale.</p>
  </section>
  <section class="container list">
    {guides.map((g) => (
      <a class="row reveal" href={`/guides/${g.slug}`}>
        <div>
          <h2>{g.data.title}</h2>
          <p>{g.data.description}</p>
        </div>
        <span class="meta">{g.data.readTime} →</span>
      </a>
    ))}
  </section>
</BaseLayout>
<style>
  .head { padding-block: clamp(2.5rem, 7vw, 4rem) 1.5rem; }
  .dek { max-width: 58ch; font-size: 1.05rem; }
  .list { padding-bottom: var(--section-pad); }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 2rem;
    border-top: 1px solid var(--color-line); padding-block: 1.5rem; text-decoration: none; }
  .row:last-child { border-bottom: 1px solid var(--color-line); }
  .row h2 { font-size: 1.3rem; margin: 0 0 .4rem; }
  .row:hover h2 { color: var(--color-accent); }
  .row p { color: var(--color-muted); margin: 0; font-size: .95rem; max-width: 64ch; }
  .meta { color: var(--color-accent); font-size: .8rem; letter-spacing: .1em;
    text-transform: uppercase; white-space: nowrap; }
</style>
```

- [ ] **Step 4: Create `src/pages/guides/[slug].astro`** — with Article + BreadcrumbList JSON-LD:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
import { SITE } from '../../data/site.ts';

export async function getStaticPaths() {
  const guides = await getCollection('guides');
  return guides.map((g) => ({ params: { slug: g.slug }, props: { guide: g } }));
}
const { guide } = Astro.props;
const { Content } = await guide.render();
const url = `${SITE.url}/guides/${guide.slug}`;
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', headline: guide.data.title, description: guide.data.description,
      datePublished: guide.data.date, author: { '@type': 'Person', name: 'Derrick Garcia' },
      mainEntityOfPage: url },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Guides', item: `${SITE.url}/guides` },
      { '@type': 'ListItem', position: 2, name: guide.data.title, item: url },
    ]},
  ],
};
---
<BaseLayout title={`${guide.data.title} | Derrick Garcia`} description={guide.data.description}>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} slot="head" />
  <article class="container article">
    <header>
      <p class="kicker"><a href="/guides">Guides</a> · {guide.data.readTime}</p>
      <h1>{guide.data.title}</h1>
      <p class="dek">{guide.data.description}</p>
      <p class="dated">Reviewed {guide.data.date} — regulatory figures are date-stamped in the text.</p>
    </header>
    <div class="prose"><Content /></div>
    {guide.data.calculator && (
      <p class="calc-cta"><a class="btn" href={guide.data.calculator.href}>Try the {guide.data.calculator.label}</a></p>
    )}
  </article>
</BaseLayout>
<style>
  .article { padding-block: clamp(2.5rem, 7vw, 4rem) var(--section-pad); max-width: 820px; }
  .article h1 { max-width: 22ch; }
  .dek { font-size: 1.1rem; max-width: 58ch; }
  .dated { color: var(--color-muted); font-size: .8rem; border-bottom: 1px solid var(--color-line);
    padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
  .kicker a { color: inherit; text-decoration: none; }
  .calc-cta { margin-top: 2.5rem; }
</style>
```

- [ ] **Step 5: `pnpm build` — all 4 guide pages + index render; `pnpm check` 0 errors. Commit:**

```bash
git add src/content/ src/pages/guides/
git commit -m "feat: guides hub — 4 evergreen articles, index, detail page with Article schema"
```

---

### Task 12: Restyle About + Contact

**Files:**
- Modify: `src/pages/about.astro` (wrap in container, hero treatment; bios/AgentSchema unchanged)
- Modify: `src/components/AgentCard.astro` (dark portrait card)
- Modify: `src/pages/contact.astro` (panel layout)

- [ ] **Step 1: Update `src/components/AgentCard.astro`** styles + width (keep all logic/props):
image `width={500} height={550}`, remove border-radius on img, card padding 0 with inner
`.agent-card__body` padding `1.2rem 1.4rem`; name in Marcellus via h3 (inherits); role kicker-style:

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';
const { agent } = Astro.props;
const images = import.meta.glob<{ default: ImageMetadata }>('../assets/profile/*.webp', { eager: true });
const img = images[`../assets/${agent.photo}`]?.default;
---
<article class="agent-card">
  {img && <Image src={img} alt={`${agent.name}, ${agent.title}`} width={500} height={550} />}
  <div class="agent-card__body">
    <h3>{agent.name}</h3>
    <p class="agent-card__title">{agent.title}</p>
    <p class="agent-card__bio">{agent.bio}</p>
    {agent.realtorCaUrl && (
      <p class="agent-card__links">
        <a href={agent.realtorCaUrl} target="_blank" rel="noopener noreferrer">Listings on realtor.ca ↗</a>
      </p>
    )}
  </div>
</article>
<style>
  .agent-card { border: 1px solid var(--color-line); transition: border-color .2s ease; }
  .agent-card:hover { border-color: var(--color-accent); }
  .agent-card img { width: 100%; height: auto; object-fit: cover; filter: saturate(.88); }
  .agent-card__body { padding: 1.2rem 1.4rem 1.4rem; }
  .agent-card h3 { margin: 0; font-size: 1.2rem; }
  .agent-card__title { color: var(--color-accent); font-size: .7rem; letter-spacing: .16em;
    text-transform: uppercase; font-weight: 600; margin: .25rem 0 .8rem; }
  .agent-card__bio { color: var(--color-text); font-size: .92rem; margin: 0; }
</style>
```

- [ ] **Step 2: Update `src/pages/about.astro`** — keep frontmatter (AGENTS, AgentSchema, etc.)
and all real bio content; new shell: kicker head section ("Meet the team." h1 + one-line dek,
`padding-block: clamp(2.5rem,7vw,4rem) 1.5rem`), then `<div class="container team-grid">` with
the existing `AGENTS.map` AgentCard loop (grid `repeat(auto-fit, minmax(300px, 1fr))`, gap 1rem,
`padding-bottom: var(--section-pad)`), then a `section--line` CTA band: "Want this team on your
side?" + Contact btn. Page-level styles only — no content edits.

- [ ] **Step 3: Update `src/pages/contact.astro`** — keep LeadForm/TidyCal/fallback logic
identical; wrap in head section (kicker "Contact", h1 "Let's talk about your move.") +
`.contact-grid` of two `.card` panels ("Send a message" / "Book a meeting"), NAP block under
form panel:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import LeadForm from '../components/LeadForm.astro';
import { SITE } from '../data/site.ts';
import { CONFIG } from '../data/config.ts';
---
<BaseLayout title="Contact Derrick Garcia — Real Broker Ontario"
  description="Contact Derrick Garcia for Toronto & GTA real estate. Call, email, or book a meeting.">
  <section class="head container">
    <p class="kicker">Contact</p>
    <h1>Let's talk about your move.</h1>
  </section>
  <div class="container contact-grid">
    <section class="card">
      <h2>Send a message</h2>
      <LeadForm />
      <p class="nap"><strong>Call:</strong> <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a><br />
         <strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a><br />
         <strong>Office:</strong> {SITE.address.street}, {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
    </section>
    <section class="card">
      <h2>Book a meeting</h2>
      {CONFIG.tidycalUrl ? (
        <iframe src={CONFIG.tidycalUrl} title="Book a meeting with Derrick Garcia" loading="lazy"
          style="width:100%;min-height:600px;border:1px solid var(--color-line);border-radius:var(--radius)"></iframe>
      ) : (
        <p>To book a meeting, call <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a> or email
           <a href={`mailto:${SITE.email}`}> {SITE.email}</a>.</p>
      )}
    </section>
  </div>
</BaseLayout>
<style>
  .head { padding-block: clamp(2.5rem, 7vw, 4rem) 1.5rem; }
  .contact-grid { display: grid; gap: 1.2rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    padding-bottom: var(--section-pad); align-items: start; }
  .contact-grid h2 { font-size: 1.3rem; margin-top: 0; }
  .nap { border-top: 1px solid var(--color-line); padding-top: 1rem; margin-top: 1.5rem;
    font-size: .92rem; line-height: 1.9; }
</style>
```

- [ ] **Step 4: Build + commit:**

```bash
git add src/pages/about.astro src/pages/contact.astro src/components/AgentCard.astro
git commit -m "refactor: restyle About and Contact into Midnight Estate system"
```

---

### Task 13: Restyle calculator pages (math untouched)

**Files:**
- Modify: `src/pages/mortgage-calculator.astro`, `src/pages/affordability-calculator.astro`, `src/pages/land-transfer-tax.astro` (page shells)
- Modify: `src/components/MortgageCalculator.astro`, `src/components/AffordabilityCalculator.astro`, `src/components/LandTransferTaxCalculator.astro` (style blocks ONLY)

- [ ] **Step 1: Page shells.** Each calculator page keeps its existing copy/disclaimers, gains
the standard head pattern (kicker "Tools" / h1 / dek) and wraps content in
`<div class="container calc-wrap">` with `max-width: 820px; padding-bottom: var(--section-pad)`.
**Do not touch the `<script>` blocks or any `id` attributes** — islands bind by id.

- [ ] **Step 2: Component `<style>` blocks only.** In each of the three calculator components,
update only the style block: result `output` gets `background: var(--color-panel)`;
`strong` value color → `var(--color-accent)`; labels stay 600-weight; inputs inherit global
dark styles (Task 1) — remove now-redundant border/background declarations that fight them.
**No changes above the `<style>` tag.**

- [ ] **Step 3: Behavior check.** `pnpm test` (22 green), `pnpm build`, then in
`pnpm preview` enter price 800000 / down 160000 / 5.0% / 25y monthly in the mortgage
calculator → expect the same payment value as before restyle (≈ $3,733/mo class of value —
must equal pre-change output exactly; compare against a `git stash` run if unsure).

- [ ] **Step 4: Commit:**

```bash
git add src/pages/*calculator*.astro src/pages/land-transfer-tax.astro src/components/*Calculator.astro
git commit -m "refactor: dark restyle of calculator pages — math and bindings untouched"
```

---

### Task 14: Legal pages, 404, thanks + accessibility statement update

**Files:**
- Modify: `src/pages/privacy.astro`, `src/pages/accessibility.astro`, `src/pages/404.astro`, `src/pages/thanks.astro`

- [ ] **Step 1: Privacy + Accessibility:** wrap existing content in
`<article class="container prose">` with the standard head pattern (kicker + h1). Content
unchanged **except** append to the accessibility statement:

> This site uses a dark colour scheme. All text colours are chosen to meet WCAG 2.1 AA
> contrast (4.5:1 or better) against their backgrounds. Animations are disabled automatically
> when your device requests reduced motion (`prefers-reduced-motion`).

- [ ] **Step 2: 404:** night-skyline hero treatment (same pattern as Home hero, smaller
padding), h1 "This page has moved on.", links to `/`, `/guides`, `/contact`, plus
"Search Homes ↗". **Thanks:** standard head pattern + "What happens next" line ("Derrick or
a team member will reply within one business day") + btn home. Both keep existing
titles/noindex props if present.

- [ ] **Step 3: Build + commit:**

```bash
git add src/pages/privacy.astro src/pages/accessibility.astro src/pages/404.astro src/pages/thanks.astro
git commit -m "refactor: restyle legal/404/thanks pages; document dark-theme accessibility"
```

---

### Task 15: Dark OG image

**Files:**
- Create: `scripts/og-image.mjs`
- Replace: `public/og-default.png`

- [ ] **Step 1: Create `scripts/og-image.mjs`** (sharp is already a dependency):

```js
import sharp from 'sharp';
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#121212"/>
  <rect x="0" y="0" width="1200" height="6" fill="#b08d57"/>
  <text x="80" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="72"
    fill="#f3efe7" letter-spacing="8">DERRICK GARCIA</text>
  <text x="80" y="370" font-family="Georgia, 'Times New Roman', serif" font-size="30"
    fill="#b08d57" letter-spacing="6">REAL BROKER ONTARIO LTD</text>
  <text x="80" y="440" font-family="Arial, sans-serif" font-size="24"
    fill="#9a9486" letter-spacing="2">Toronto &amp; GTA Real Estate · derrickgarcia.ca</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/og-default.png');
console.log('og-default.png written');
```

- [ ] **Step 2: Run + visually verify with Read tool, then commit:**

```bash
node scripts/og-image.mjs
git add scripts/og-image.mjs public/og-default.png
git commit -m "feat: dark-brand default OG image"
```

---

### Task 16: Legacy URL redirect stubs

**Files:**
- Create: `src/components/Redirect.astro`
- Create: `src/pages/evaluation.astro`, `src/pages/myteam.astro`, `src/pages/mortgage-calculator-1.astro`, `src/pages/affordability-calculator-1.astro`, `src/pages/blog.astro`

- [ ] **Step 1: Create `src/components/Redirect.astro`**

```astro
---
import { SITE } from '../data/site.ts';
const { to } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Moved — Derrick Garcia</title>
    <meta http-equiv="refresh" content={`0;url=${to}`} />
    <link rel="canonical" href={`${SITE.url}${to}`} />
    <meta name="robots" content="noindex" />
  </head>
  <body><p>This page has moved to <a href={to}>derrickgarcia.ca{to}</a>.</p></body>
</html>
```

- [ ] **Step 2: Five stub pages**, each exactly (with its own target):

```astro
---
import Redirect from '../components/Redirect.astro';
---
<Redirect to="/home-valuation" />
```

Targets: `evaluation.astro` → `/home-valuation` · `myteam.astro` → `/about` ·
`mortgage-calculator-1.astro` → `/mortgage-calculator` · `affordability-calculator-1.astro`
→ `/affordability-calculator` · `blog.astro` → `/guides`.

- [ ] **Step 3: Build; confirm `dist/evaluation/index.html` contains the meta refresh. Commit:**

```bash
git add src/components/Redirect.astro src/pages/evaluation.astro src/pages/myteam.astro src/pages/mortgage-calculator-1.astro src/pages/affordability-calculator-1.astro src/pages/blog.astro
git commit -m "feat: meta-refresh redirects for legacy Lofty URLs"
```

---

### Task 17: Full verification + docs update

**Files:**
- Modify: `TODO.md`, `CLAUDE.md`

- [ ] **Step 1: Full gates:** `pnpm test` (22 pass) · `pnpm check` (0 errors) · `pnpm build` (green).

- [ ] **Step 2: Manual `pnpm preview` pass:** every page, desktop + 375px; nav dropdowns +
mobile panel + ESC; valuation + contact forms show fallback (keys empty); reviews page shows
Google-link empty state (GBP empty → call/email); calculators interactive with unchanged
outputs; no fabricated content anywhere (stats trace to bios; quotes only behind TESTIMONIALS).

- [ ] **Step 3: NAP integrity check:**

```bash
grep -rn "684-7370" dist/ | grep -v "tel:+14166847370" | grep -v "416-684-7370" ; echo "---"
grep -rln "130 King St W" dist/ | head
```
Expected: first grep empty (no malformed phone), address present on contact/footer pages.

- [ ] **Step 4: Update `TODO.md`** — add to §3: "Derrick reviews guide content (regulatory
figures + RTO program facts) before go-live"; "Deposit/Lending nav links — need Derrick's
target URLs"; "real testimonials → TESTIMONIALS in src/data/config.ts"; "real stats reviewed
(value strip uses bio-sourced figures)". Add to §1 table: no new keys (valuation form reuses
web3formsAccessKey). Update `CLAUDE.md` Current status: Phase 2 (Midnight Estate redesign +
parity pages + guides) built; reference both spec docs.

- [ ] **Step 5: Final commit:**

```bash
git add TODO.md CLAUDE.md
git commit -m "docs: mark Midnight Estate redesign built; update go-live TODO"
```
