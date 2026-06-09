# Lofty site export — reference snapshot

Reference material for rebuilding **derrickgarcia.ca** as a static site.
Captured from the live Lofty (crm.lofty.com) site on **2026-06-09**. Reference only — not the new site.

## Contents
- **`SITE-MAP.md`** — every page, nav structure, what to keep/strip, business info, rebuild gotchas. *Start here.*
- **`ASSETS.md`** — image inventory (what's real vs. stock) + CSS notes.
- **`pages/`** — raw HTML of all 24 real pages (SSR; full text content incl. blog articles & agent bios).
- **`images/`** — `profile/` (headshots), `branding/` (logos), `site/` (stock banners — reference only).
- **`css/`** — `styleAndTheme.css` (theme vars) + `css/modules/` (Lofty component CSS).
- **`pow-solver.js`** — solves Lofty's anti-bot, prints a cookie.
- **`crawl.js`** — crawls the page list using that cookie; saves HTML + `pages/_crawl-summary.json`.

## Why the scripts exist
Lofty serves a SHA-1 **proof-of-work anti-bot** before the real page; plain `wget`/`curl` only
get a JS shell. The scripts solve it (node, built-in `crypto`), get a cookie (valid ~2 h), then fetch.

## Re-run / pull more pages
```bash
cd extracted
node crawl.js                       # re-fetch all listed pages
node pow-solver.js https://derrickgarcia.ca/SOME/PATH   # prints COOKIE=… for ad-hoc wget
```
Add routes by editing the `PAGES` map in `crawl.js`.

## Key takeaways for the rebuild
1. **Strip** all IDX/MLS listing pages (licensed feed) + CRM/login. Replace search with an IDX widget or link-out.
2. **Reusable assets = 3 headshots + Real Broker logos only.** All banners are template stock → replace.
3. **Rewrite** the home CTA (leftover "Colorado Luxury Real Estate" template text).
4. **Rewire forms** (contact, evaluation) to a static handler — Formspree / Netlify Forms / email.
