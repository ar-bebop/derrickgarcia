# derrickgarcia.ca Static Site — Phase 1 (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the Phase 1 MVP of derrickgarcia.ca as a static Astro site on GitHub Pages — Home, About/Team, Contact (Web3Forms + TidyCal), three Canadian real-estate calculators, Privacy, Accessibility, 404 — with cookieless analytics, SEO, and JSON-LD, at $0/mo.

**Architecture:** Astro SSG with one shared `BaseLayout` + `Header`/`Footer`. Pure-function finance math in `src/lib/mortgage-math.js` (unit-tested with Vitest) consumed by client-side calculator islands. Forms POST to Web3Forms; booking is a TidyCal embed; analytics is a Cloudflare beacon. No backend.

**Tech Stack:** Astro, vanilla CSS (custom properties), Vitest (unit tests for math), `@astrojs/sitemap`, GitHub Actions → GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-06-09-derrickgarcia-static-site-design.md`
**Research detail (esp. Canadian math):** `docs/superpowers/specs/2026-06-09-brainstorm-research-appendix.md`

---

## Conventions

- Run all commands from the repo root `/home/bebop/projects/public/derrickgarcia`.
- Node 20 (`.nvmrc`). Use `npm`.
- Commit after each task (frequent commits). **Never `git push`** (per user).

### Real content is already in the repo — no fabricated placeholders
- The **real headshots + Real Broker logos** are already committed at `src/assets/profile/` and
  `src/assets/branding/` (copied out of `extracted/`). Tasks below consume them directly; nothing reads
  from `extracted/` at build time. `extracted/` is deleted in Task 18.
- **Real bios** (Derrick, Pina), the **real accessibility statement**, and the **real brand colours**
  are inlined in the tasks below (sourced from the old site).

### External go-live config (the only values not yet known)
These live in **one file, `src/data/config.ts`**, as empty strings. Each related feature renders a
**graceful fallback** (call/email, or analytics simply absent) when its value is empty — so the site
never ships broken placeholder widgets. Fill them in at go-live (Task 19):
- `web3formsAccessKey` — Web3Forms access key (forms)
- `tidycalUrl` — TidyCal booking page URL
- `cloudflareAnalyticsToken` — Cloudflare Web Analytics beacon token
- per-agent `realtorCaUrl` / `realBrokerUrl` in `src/data/agents.ts` (empty → link hidden)
- `SITE.social.googleBusiness` in `src/data/site.ts` (empty → omitted from schema)

## File structure (created across the tasks below)

```
.nvmrc  package.json  astro.config.mjs  vitest.config.js  tsconfig.json
.github/workflows/deploy.yml
public/  CNAME  robots.txt  favicon.svg  site.webmanifest  (favicon set)  og-default.png
src/
  lib/        mortgage-math.js  mortgage-math.test.js
  styles/     tokens.css  global.css
  layouts/    BaseLayout.astro
  components/  Header.astro  Footer.astro  AgentCard.astro  LeadForm.astro
              MortgageCalculator.astro  AffordabilityCalculator.astro  LandTransferTaxCalculator.astro
              RealEstateAgentSchema.astro  AgentSchema.astro
  data/       site.ts  config.ts  agents.ts
  pages/      index.astro  about.astro  contact.astro  thanks.astro
              mortgage-calculator.astro  affordability-calculator.astro  land-transfer-tax.astro
              privacy.astro  accessibility.astro  404.astro
  assets/     profile/{derrick-garcia,pina-marrella,voula-spingos}.webp   (already committed)
              branding/{real-wordmark-white,real-emblem-gold}.png         (already committed)
```

---

## Task 1: Scaffold Astro project, Vitest, and deploy pipeline

**Files:**
- Create: `package.json`, `.nvmrc`, `astro.config.mjs`, `vitest.config.js`, `tsconfig.json`
- Create: `.github/workflows/deploy.yml`, `public/CNAME`, `public/robots.txt`
- Create: `src/pages/index.astro` (temporary smoke page)

- [ ] **Step 1: Create `.nvmrc`**

```
20
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "derrickgarcia-ca",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^4.15.0",
    "@astrojs/sitemap": "^3.2.0"
  },
  "devDependencies": {
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create `astro.config.mjs`** (note: NO `base` — apex custom domain serves from root)

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://derrickgarcia.ca',
  integrations: [sitemap()],
});
```

- [ ] **Step 4: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.js'], environment: 'node' },
});
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict" }
```

- [ ] **Step 6: Create `public/CNAME`**

```
derrickgarcia.ca
```

- [ ] **Step 7: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://derrickgarcia.ca/sitemap-index.xml
```

- [ ] **Step 8: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 20
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 9: Create temporary `src/pages/index.astro`** (replaced in Task 13)

```astro
---
---
<html lang="en">
  <head><meta charset="utf-8" /><title>derrickgarcia.ca</title></head>
  <body><h1>Scaffold OK</h1></body>
</html>
```

- [ ] **Step 10: Install and verify build + test runner**

Run: `npm install && npm run build && npm test`
Expected: `astro build` completes writing `dist/`; `vitest run` reports "No test files found" (exit 0) OR passes. Build must succeed.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project, Vitest, and Pages deploy workflow"
```

---

## Task 2: Finance math — periodic rate, payment, frequencies (TDD)

**Files:**
- Create: `src/lib/mortgage-math.js`
- Test: `src/lib/mortgage-math.test.js`

- [ ] **Step 1: Write failing tests**

```js
// src/lib/mortgage-math.test.js
import { describe, it, expect } from 'vitest';
import { periodicRate, payment, paymentForFrequency } from './mortgage-math.js';

describe('periodicRate (Canadian semi-annual compounding)', () => {
  it('converts 5% nominal to the monthly effective rate (NOT r/12)', () => {
    const i = periodicRate(0.05, 12);
    expect(i).toBeCloseTo(0.004124, 5);     // (1.025)^(1/6) - 1
    expect(i).toBeLessThan(0.05 / 12);       // must be below the naive US rate
  });
  it('returns 0 for a 0% rate', () => {
    expect(periodicRate(0, 12)).toBe(0);
  });
});

describe('payment', () => {
  it('computes a $500k / 25yr / 5% monthly payment ~ $2,908', () => {
    expect(Math.abs(payment(500000, 0.05, 25, 12) - 2908.13)).toBeLessThan(1.0);
  });
  it('handles 0% as straight-line principal/n', () => {
    expect(payment(120000, 0, 25, 12)).toBeCloseTo(120000 / 300, 6);
  });
});

describe('paymentForFrequency', () => {
  it('accelerated bi-weekly equals monthly / 2', () => {
    const monthly = payment(500000, 0.05, 25, 12);
    expect(paymentForFrequency(500000, 0.05, 25, 'acceleratedBiweekly')).toBeCloseTo(monthly / 2, 6);
  });
  it('regular bi-weekly is less than monthly/2', () => {
    const monthly = payment(500000, 0.05, 25, 12);
    expect(paymentForFrequency(500000, 0.05, 25, 'biweekly')).toBeLessThan(monthly / 2);
  });
  it('throws on an unknown frequency', () => {
    expect(() => paymentForFrequency(1, 0.05, 25, 'nope')).toThrow();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm test`
Expected: FAIL — cannot import from `./mortgage-math.js`.

- [ ] **Step 3: Implement the module**

```js
// src/lib/mortgage-math.js
// Canadian mortgage / affordability / land-transfer-tax math.
// Regulatory constants are named + dated — verify against source before production reliance.
// last checked: 2026-06-09

export const MIN_QUALIFYING_RATE = 0.0525; // OSFI minimum qualifying rate (MQR). verify: Dept of Finance/OSFI
export const STRESS_TEST_BUFFER = 0.02;    // contract rate + 2%

// Convert a nominal annual rate to a per-period effective rate for Canadian
// FIXED-rate mortgages (semi-annual compounding — NOT annualRate/12).
export function periodicRate(annualRate, periodsPerYear = 12) {
  if (annualRate === 0) return 0;
  return Math.pow(1 + annualRate / 2, 2 / periodsPerYear) - 1;
}

// Standard annuity payment for `periodsPerYear` payments.
export function payment(principal, annualRate, amortYears, periodsPerYear = 12) {
  const n = amortYears * periodsPerYear;
  const i = periodicRate(annualRate, periodsPerYear);
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

export const FREQUENCIES = {
  monthly:             { periodsPerYear: 12, accelerated: false },
  semimonthly:         { periodsPerYear: 24, accelerated: false },
  biweekly:            { periodsPerYear: 26, accelerated: false },
  acceleratedBiweekly: { periodsPerYear: 26, accelerated: true, divisor: 2 },
  weekly:              { periodsPerYear: 52, accelerated: false },
  acceleratedWeekly:   { periodsPerYear: 52, accelerated: true, divisor: 4 },
};

// Payment for a named frequency. Accelerated = the monthly payment split, paid
// more often (≈ one extra monthly payment/year → faster payoff).
export function paymentForFrequency(principal, annualRate, amortYears, freqKey) {
  const f = FREQUENCIES[freqKey];
  if (!f) throw new Error(`unknown frequency: ${freqKey}`);
  if (f.accelerated) return payment(principal, annualRate, amortYears, 12) / f.divisor;
  return payment(principal, annualRate, amortYears, f.periodsPerYear);
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mortgage-math.js src/lib/mortgage-math.test.js
git commit -m "feat: Canadian periodic-rate + payment + frequency math (TDD)"
```

---

## Task 3: Stress test + CMHC premium (TDD)

**Files:**
- Modify: `src/lib/mortgage-math.js`, `src/lib/mortgage-math.test.js`

- [ ] **Step 1: Append failing tests**

```js
// add to src/lib/mortgage-math.test.js
import { qualifyingRate, cmhcPremiumRate, cmhcPremium } from './mortgage-math.js';

describe('qualifyingRate (stress test)', () => {
  it('uses contract + 2% when that exceeds the 5.25% floor', () => {
    expect(qualifyingRate(0.05)).toBeCloseTo(0.07, 10);
  });
  it('uses the 5.25% floor when contract + 2% is lower', () => {
    expect(qualifyingRate(0.02)).toBeCloseTo(0.0525, 10);
  });
});

describe('cmhcPremiumRate by loan-to-value', () => {
  it('5% down (95% LTV) → 4.00%', () => { expect(cmhcPremiumRate(0.95)).toBe(0.040); });
  it('10% down (90% LTV) → 3.10%', () => { expect(cmhcPremiumRate(0.90)).toBe(0.031); });
  it('15% down (85% LTV) → 2.80%', () => { expect(cmhcPremiumRate(0.85)).toBe(0.028); });
  it('20% down (80% LTV) → 0%', () => { expect(cmhcPremiumRate(0.80)).toBe(0); });
});

describe('cmhcPremium', () => {
  it('5% down on a $500k home → $19,000', () => {
    expect(cmhcPremium(475000, 500000)).toBeCloseTo(19000, 2);
  });
});
```

- [ ] **Step 2: Run tests, verify the new ones fail**

Run: `npm test`
Expected: FAIL — `qualifyingRate`/`cmhcPremiumRate`/`cmhcPremium` not exported.

- [ ] **Step 3: Implement**

```js
// add to src/lib/mortgage-math.js
export function qualifyingRate(contractRate) {
  return Math.max(contractRate + STRESS_TEST_BUFFER, MIN_QUALIFYING_RATE);
}

// CMHC default-insurance premium rate by loan-to-value. verify: CMHC premium schedule
export function cmhcPremiumRate(ltv) {
  if (ltv > 0.90) return 0.040;
  if (ltv > 0.85) return 0.031;
  if (ltv > 0.80) return 0.028;
  return 0; // >= 20% down: conventional, not insured
}

// Premium in dollars (financed onto the principal).
export function cmhcPremium(loan, price) {
  return loan * cmhcPremiumRate(loan / price);
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mortgage-math.js src/lib/mortgage-math.test.js
git commit -m "feat: stress-test qualifying rate + CMHC premium (TDD)"
```

---

## Task 4: Affordability (GDS/TDS) (TDD)

**Files:**
- Modify: `src/lib/mortgage-math.js`, `src/lib/mortgage-math.test.js`

- [ ] **Step 1: Append failing tests**

```js
// add to src/lib/mortgage-math.test.js
import { maxAffordability, GDS_LIMIT, TDS_LIMIT } from './mortgage-math.js';

describe('maxAffordability (Canadian GDS/TDS at the qualifying rate)', () => {
  const base = {
    grossAnnualIncome: 120000, downPayment: 100000, monthlyDebts: 500,
    contractRate: 0.05, amortYears: 25, monthlyPropertyTax: 300,
    monthlyHeating: 150, monthlyCondoFees: 0,
  };
  it('qualifies at contract + 2% (= 7%)', () => {
    expect(maxAffordability(base).qualifyingRate).toBeCloseTo(0.07, 10);
  });
  it('caps monthly housing at min(GDS, TDS)', () => {
    const r = maxAffordability(base), gm = 120000 / 12;
    expect(r.maxMonthlyHousing).toBeLessThanOrEqual(GDS_LIMIT * gm + 1e-6);
    expect(r.maxMonthlyHousing).toBeLessThanOrEqual(TDS_LIMIT * gm - 500 + 1e-6);
  });
  it('returns a plausible max mortgage (~$490k for these inputs)', () => {
    const r = maxAffordability(base);
    expect(r.maxMortgage).toBeGreaterThan(485000);
    expect(r.maxMortgage).toBeLessThan(500000);
  });
  it('max price = max mortgage + down payment', () => {
    const r = maxAffordability(base);
    expect(r.maxPrice).toBeCloseTo(r.maxMortgage + 100000, 4);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm test`
Expected: FAIL — `maxAffordability`/`GDS_LIMIT`/`TDS_LIMIT` not exported.

- [ ] **Step 3: Implement**

```js
// add to src/lib/mortgage-math.js
export const GDS_LIMIT = 0.39;          // gross debt service (insured). verify: CMHC
export const TDS_LIMIT = 0.44;          // total debt service (insured). verify: CMHC
export const DEFAULT_HEATING_MONTHLY = 150;
export const CONDO_FEE_INCLUSION = 0.5; // 50% of condo fees count toward GDS/TDS

export function maxAffordability({
  grossAnnualIncome, downPayment, monthlyDebts = 0, contractRate,
  amortYears = 25, monthlyPropertyTax = 0,
  monthlyHeating = DEFAULT_HEATING_MONTHLY, monthlyCondoFees = 0,
}) {
  const grossMonthly = grossAnnualIncome / 12;
  const maxHousingGDS = GDS_LIMIT * grossMonthly;
  const maxHousingTDS = TDS_LIMIT * grossMonthly - monthlyDebts;
  const maxMonthlyHousing = Math.min(maxHousingGDS, maxHousingTDS);
  const otherHousing = monthlyPropertyTax + monthlyHeating + CONDO_FEE_INCLUSION * monthlyCondoFees;
  const maxMortgagePmt = Math.max(0, maxMonthlyHousing - otherHousing);

  const qr = qualifyingRate(contractRate);
  const i = periodicRate(qr, 12);
  const n = amortYears * 12;
  const maxMortgage = i === 0 ? maxMortgagePmt * n
    : (maxMortgagePmt * (1 - Math.pow(1 + i, -n))) / i;

  return {
    grossMonthly, maxMonthlyHousing, maxMortgagePmt,
    qualifyingRate: qr, maxMortgage, maxPrice: maxMortgage + downPayment,
    bindingRatio: maxHousingGDS <= maxHousingTDS ? 'GDS' : 'TDS',
  };
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mortgage-math.js src/lib/mortgage-math.test.js
git commit -m "feat: GDS/TDS affordability at qualifying rate (TDD)"
```

---

## Task 5: Land Transfer Tax (Ontario + Toronto + FTB rebates) (TDD)

**Files:**
- Modify: `src/lib/mortgage-math.js`, `src/lib/mortgage-math.test.js`

- [ ] **Step 1: Append failing tests**

```js
// add to src/lib/mortgage-math.test.js
import { landTransferTax } from './mortgage-math.js';

describe('landTransferTax', () => {
  it('Ontario LTT on $500k = $6,475', () => {
    expect(landTransferTax({ price: 500000 }).ontario).toBeCloseTo(6475, 2);
  });
  it('in Toronto, provincial + municipal on $500k = $12,950', () => {
    const r = landTransferTax({ price: 500000, inToronto: true });
    expect(r.toronto).toBeCloseTo(6475, 2);
    expect(r.total).toBeCloseTo(12950, 2);
  });
  it('first-time buyer in Toronto gets both rebates (capped)', () => {
    const r = landTransferTax({ price: 500000, inToronto: true, firstTimeBuyer: true });
    expect(r.rebate).toBeCloseTo(4000 + 4475, 2);
    expect(r.total).toBeCloseTo(12950 - 8475, 2);
  });
  it('rebate never exceeds tax owed (cheap home)', () => {
    const r = landTransferTax({ price: 300000, firstTimeBuyer: true });
    expect(r.rebate).toBeLessThanOrEqual(r.ontario + 1e-9);
    expect(r.total).toBeGreaterThanOrEqual(0);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm test`
Expected: FAIL — `landTransferTax` not exported.

- [ ] **Step 3: Implement**

```js
// add to src/lib/mortgage-math.js
// Marginal brackets {upTo, rate}. verify: ON Land Transfer Tax Act / City of Toronto MLTT schedule
export const ONTARIO_LTT_BRACKETS = [
  { upTo: 55000, rate: 0.005 }, { upTo: 250000, rate: 0.010 },
  { upTo: 400000, rate: 0.015 }, { upTo: 2000000, rate: 0.020 },
  { upTo: Infinity, rate: 0.025 },
];
// Toronto MLTT mirrors provincial for the common range + added luxury tiers >$3M.
export const TORONTO_LTT_BRACKETS = [
  { upTo: 55000, rate: 0.005 }, { upTo: 250000, rate: 0.010 },
  { upTo: 400000, rate: 0.015 }, { upTo: 2000000, rate: 0.020 },
  { upTo: 3000000, rate: 0.025 }, { upTo: 4000000, rate: 0.035 },
  { upTo: 5000000, rate: 0.045 }, { upTo: 10000000, rate: 0.055 },
  { upTo: 20000000, rate: 0.065 }, { upTo: Infinity, rate: 0.075 },
];
export const FTB_REBATE_ONTARIO = 4000;  // verify
export const FTB_REBATE_TORONTO = 4475;  // verify

export function bracketTax(price, brackets) {
  let tax = 0, lower = 0;
  for (const b of brackets) {
    if (price <= lower) break;
    tax += (Math.min(price, b.upTo) - lower) * b.rate;
    lower = b.upTo;
  }
  return tax;
}

export function landTransferTax({ price, inToronto = false, firstTimeBuyer = false }) {
  const ontario = bracketTax(price, ONTARIO_LTT_BRACKETS);
  const toronto = inToronto ? bracketTax(price, TORONTO_LTT_BRACKETS) : 0;
  let rebate = 0;
  if (firstTimeBuyer) {
    rebate += Math.min(FTB_REBATE_ONTARIO, ontario);
    if (inToronto) rebate += Math.min(FTB_REBATE_TORONTO, toronto);
  }
  return { ontario, toronto, rebate, total: ontario + toronto - rebate };
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm test`
Expected: PASS (all suites green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/mortgage-math.js src/lib/mortgage-math.test.js
git commit -m "feat: Ontario + Toronto land transfer tax with FTB rebates (TDD)"
```

---

## Task 6: Site data, config, design tokens, global CSS, BaseLayout, Header, Footer

**Files:**
- Create: `src/data/site.ts`, `src/data/config.ts`, `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Create `src/data/site.ts`** (single source of truth for NAP + links; `listingsSearchUrl` is a real public realtor.ca URL)

```ts
export const SITE = {
  name: 'Derrick Garcia',
  brokerage: 'Real Broker Ontario LTD',
  legalName: 'Derrick Garcia — Real Broker Ontario LTD',
  phoneDisplay: '+1 416-684-7370',
  phoneHref: 'tel:+14166847370',
  email: 'info@derrickgarcia.ca',
  address: {
    street: '130 King St W, Unit 1800B',
    city: 'Toronto', region: 'ON', postalCode: 'M5X 1E3', country: 'CA',
  },
  url: 'https://derrickgarcia.ca',
  social: {
    instagram: 'https://www.instagram.com/derrickgarcia__/',
    facebook: 'https://www.facebook.com/DerrickGarciaRealtor',
    googleBusiness: '', // fill at go-live → added to schema sameAs when present
  },
  // Public realtor.ca Toronto search (no IDX licence needed).
  listingsSearchUrl: 'https://www.realtor.ca/on/toronto/real-estate',
};
```

- [ ] **Step 2: Create `src/data/config.ts`** (the only unknown values; empty → graceful fallback)

```ts
// External go-live configuration. Fill these in before launch (plan Task 19).
// Empty values make the related feature render a graceful fallback instead of a broken widget.
export const CONFIG = {
  web3formsAccessKey: '',        // forms — https://web3forms.com  (empty → contact form shows call/email)
  tidycalUrl: '',                // booking — e.g. https://tidycal.com/derrickgarcia (empty → call/email block)
  cloudflareAnalyticsToken: '',  // analytics beacon token (empty → no analytics script)
};
```

- [ ] **Step 3: Create `src/styles/tokens.css`** (REAL brand colours from the old theme: near-black `#191919`, gray text `#505050`, light-gray `#a8a8a8`, white; gold accent from the Real Broker emblem)

```css
:root {
  --color-bg: #ffffff;
  --color-fg: #191919;          /* --g-primary-color from old theme (headings/primary) */
  --color-text: #505050;        /* --g-text-color (body) */
  --color-muted: #a8a8a8;       /* --g-tip-color (secondary) */
  --color-accent: #b08d57;      /* gold — sampled from Real Broker emblem */
  --color-accent-ink: #191919;
  --color-line: #e6e6e6;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --maxw: 1100px;
  --space: 1rem;
  --radius: 10px;
}
```

- [ ] **Step 4: Create `src/styles/global.css`**

```css
@import './tokens.css';
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-sans); color: var(--color-text);
  background: var(--color-bg); line-height: 1.55; }
h1, h2, h3 { color: var(--color-fg); line-height: 1.2; }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; }
.container { max-width: var(--maxw); margin-inline: auto; padding-inline: var(--space); }
.btn { display: inline-block; padding: .7rem 1.2rem; border-radius: var(--radius);
  background: var(--color-fg); color: #fff; font-weight: 600; text-decoration: none; border: 0; cursor: pointer; }
.btn:hover { background: var(--color-accent); color: var(--color-accent-ink); }
.btn--ghost { background: transparent; border: 1px solid var(--color-line); color: var(--color-fg); }
:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
```

- [ ] **Step 5: Create `src/components/Header.astro`**

```astro
---
import { SITE } from '../data/site.ts';
const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: SITE.listingsSearchUrl, label: 'Search Homes', external: true },
  { href: '/mortgage-calculator', label: 'Mortgage' },
  { href: '/affordability-calculator', label: 'Affordability' },
  { href: '/land-transfer-tax', label: 'Land Transfer Tax' },
  { href: '/contact', label: 'Contact' },
];
---
<header class="site-header">
  <div class="container site-header__inner">
    <a href="/" class="site-header__brand">{SITE.name}<span> · {SITE.brokerage}</span></a>
    <nav aria-label="Primary">
      <ul>
        {nav.map((i) => (
          <li>
            <a href={i.href} {...(i.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {i.label}{i.external ? ' ↗' : ''}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </div>
</header>
<style>
  .site-header { border-bottom: 1px solid var(--color-line); }
  .site-header__inner { display: flex; gap: 1rem; align-items: center; justify-content: space-between;
    padding-block: .8rem; flex-wrap: wrap; }
  .site-header__brand { font-weight: 700; text-decoration: none; color: var(--color-fg); }
  .site-header__brand span { color: var(--color-muted); font-weight: 400; }
  nav ul { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
  nav a { text-decoration: none; color: var(--color-text); }
  nav a:hover { color: var(--color-accent); }
</style>
```

- [ ] **Step 6: Create `src/components/Footer.astro`**

```astro
---
import { SITE } from '../data/site.ts';
---
<footer class="site-footer">
  <div class="container site-footer__grid">
    <div>
      <strong>{SITE.legalName}</strong>
      <p>{SITE.address.street}<br />{SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}</p>
      <p><a href={SITE.phoneHref}>{SITE.phoneDisplay}</a><br /><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
    </div>
    <nav aria-label="Footer">
      <a href="/about">About</a><a href="/contact">Contact</a>
      <a href="/privacy">Privacy</a><a href="/accessibility">Accessibility</a>
    </nav>
    <div class="site-footer__social">
      <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
      <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
    </div>
  </div>
  <p class="container site-footer__legal">© {new Date().getFullYear()} {SITE.legalName}. Not intended to solicit buyers or sellers currently under contract.</p>
</footer>
<style>
  .site-footer { border-top: 1px solid var(--color-line); margin-top: 3rem; padding-block: 2rem; }
  .site-footer__grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); }
  .site-footer nav { display: flex; flex-direction: column; gap: .3rem; }
  .site-footer nav a { text-decoration: none; }
  .site-footer__social { display: flex; gap: 1rem; }
  .site-footer__legal { color: var(--color-muted); font-size: .85rem; margin-top: 1.5rem; }
</style>
```

- [ ] **Step 7: Create `src/layouts/BaseLayout.astro`** (per-page SEO + analytics in ONE place; analytics renders only when a token is configured)

```astro
---
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
    <slot name="head" />
  </head>
  <body>
    <a class="visually-hidden" href="#main">Skip to content</a>
    <Header />
    <main id="main" class="container"><slot /></main>
    <Footer />
    {CONFIG.cloudflareAnalyticsToken && (
      <script is:inline defer src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${CONFIG.cloudflareAnalyticsToken}"}`}></script>
    )}
  </body>
</html>
```

- [ ] **Step 8: Replace `src/pages/index.astro` with a layout smoke page** (becomes the real home in Task 13)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Derrick Garcia — Toronto Real Estate Agent" description="Toronto & GTA real estate with Derrick Garcia, Real Broker Ontario.">
  <h1>Derrick Garcia</h1>
  <p>Layout smoke test.</p>
</BaseLayout>
```

- [ ] **Step 9: Verify build + content**

Run: `npm run build && grep -q "site-header__brand" dist/index.html && grep -q "canonical" dist/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: site data, config, brand tokens, global CSS, BaseLayout, Header, Footer"
```

---

## Task 7: Verify real assets are present

**Files:** none (the headshots + logos are already committed at `src/assets/`)

- [ ] **Step 1: Confirm the committed assets exist**

Run:
```bash
ls src/assets/profile/derrick-garcia.webp src/assets/profile/pina-marrella.webp \
   src/assets/profile/voula-spingos.webp src/assets/branding/real-emblem-gold.png \
   src/assets/branding/real-wordmark-white.png
```
Expected: all five paths list without error. (These were copied from the old site and committed already;
nothing reads from `extracted/`. Generic stock banners were intentionally NOT migrated — licensed hero
photography is a go-live item.)

- [ ] **Step 2: No commit needed** (assets already committed). Proceed to Task 8.

---

## Task 8: About / Team page (real bios)

**Files:**
- Create: `src/data/agents.ts`, `src/components/AgentCard.astro`, `src/pages/about.astro`

- [ ] **Step 1: Create `src/data/agents.ts`** (REAL bios from the old site; Voula had no source bio — honest one-liner; profile URLs empty until provided)

```ts
export interface Agent {
  slug: string; name: string; title: string;
  photo: string;          // path under src/assets
  bio: string;
  realtorCaUrl: string; realBrokerUrl: string;  // empty → link hidden (fill at go-live)
}

export const AGENTS: Agent[] = [
  {
    slug: 'derrick-garcia', name: 'Derrick Garcia', title: 'Broker',
    photo: 'profile/derrick-garcia.webp',
    bio: "A trusted real estate professional who brings a unique edge to the industry. Based in Caledon and deeply familiar with the Peel region and Orangeville, Derrick has built a reputation for delivering exceptional results, backed by his 99.9% list-to-sell ratio. With over a decade of experience in the construction industry, Derrick possesses a keen eye for design, architecture, and market trends — he understands not just how a home looks, but how it's built, giving his clients an advantage when buying or selling. Known for his honest advice, sharp negotiation skills, and deep market knowledge, Derrick ensures his clients make informed decisions with confidence. When he's not working, you'll likely find him at his daughter's soccer games, exploring new architectural designs, or walking his dog, Maverick, in the community he proudly calls home.",
    realtorCaUrl: '', realBrokerUrl: '',
  },
  {
    slug: 'pina-marrella', name: 'Pina Marrella', title: 'Agent',
    photo: 'profile/pina-marrella.webp',
    bio: "A seasoned real estate agent fluent in French, English, and Italian (with basic Spanish), Pina brings 21 years of licensing expertise to the table. Partnering with a top-ranking agent group, she excels at maximizing home prices, facilitating smooth transitions, and providing personalized advice — and connects clients with a trusted network of professionals such as lawyers and mortgage brokers. Her business ethos revolves around lasting relationships, whether you're a first-time buyer or a seasoned investor. If you seek a dedicated, honest, and attentive realtor committed to exceptional service and results, she will guide you through every step of your real estate journey.",
    realtorCaUrl: '', realBrokerUrl: '',
  },
  {
    slug: 'voula-spingos', name: 'Voula Spingos', title: 'Agent',
    photo: 'profile/voula-spingos.webp',
    // Source site had no bio for Voula; brief accurate statement until a full bio is provided.
    bio: 'Real estate agent on the Derrick Garcia team at Real Broker Ontario, serving Toronto and the Greater Toronto Area.',
    realtorCaUrl: '', realBrokerUrl: '',
  },
];
```

- [ ] **Step 2: Create `src/components/AgentCard.astro`** (profile link renders only when a URL is set)

```astro
---
import { Image } from 'astro:assets';
const { agent } = Astro.props;
const images = import.meta.glob('../assets/profile/*.webp', { eager: true });
const img = images[`../assets/${agent.photo}`]?.default;
---
<article class="agent-card">
  {img && <Image src={img} alt={`${agent.name}, ${agent.title}`} width={300} height={300} />}
  <h3>{agent.name}</h3>
  <p class="agent-card__title">{agent.title}</p>
  <p>{agent.bio}</p>
  {agent.realtorCaUrl && (
    <p class="agent-card__links">
      <a href={agent.realtorCaUrl} target="_blank" rel="noopener noreferrer">Listings on realtor.ca ↗</a>
    </p>
  )}
</article>
<style>
  .agent-card { border: 1px solid var(--color-line); border-radius: var(--radius); padding: 1rem; }
  .agent-card img { border-radius: var(--radius); aspect-ratio: 1; object-fit: cover; }
  .agent-card__title { color: var(--color-accent); font-weight: 600; margin: .2rem 0; }
</style>
```

- [ ] **Step 3: Create `src/pages/about.astro`** (real team tagline from the old site)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AgentCard from '../components/AgentCard.astro';
import { AGENTS } from '../data/agents.ts';
---
<BaseLayout title="About Our Team — Derrick Garcia, Real Broker Ontario"
  description="Meet Derrick Garcia and the team serving Toronto & the GTA with Real Broker Ontario.">
  <h1>Our Team</h1>
  <p class="lede">We are committed to maintaining the standard for excellence and leadership. Our primary
    goal is to provide the highest level of service to our clients through integrity.</p>
  <div class="team-grid">
    {AGENTS.map((agent) => <AgentCard agent={agent} />)}
  </div>
</BaseLayout>
<style>
  .lede { font-size: 1.15rem; color: var(--color-text); max-width: 60ch; }
  .team-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); margin-top: 1.5rem; }
</style>
```

- [ ] **Step 4: Verify build + content**

Run: `npm run build && grep -q "Pina Marrella" dist/about/index.html && grep -q "99.9% list-to-sell" dist/about/index.html && echo OK`
Expected: `OK` (all three agents + Derrick's real bio present).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: About/Team page with real agent bios"
```

---

## Task 9: Mortgage calculator (island + page)

**Files:**
- Create: `src/components/MortgageCalculator.astro`, `src/pages/mortgage-calculator.astro`

- [ ] **Step 1: Create `src/components/MortgageCalculator.astro`**

```astro
---
---
<form class="calc" id="mortgage-calc" novalidate>
  <div class="calc__grid">
    <label>Home price ($)<input type="number" id="m-price" value="800000" min="0" step="1000" /></label>
    <label>Down payment ($)<input type="number" id="m-down" value="160000" min="0" step="1000" /></label>
    <label>Interest rate (%)<input type="number" id="m-rate" value="5.0" min="0" step="0.01" /></label>
    <label>Amortization (years)
      <select id="m-amort"><option>25</option><option>30</option><option>20</option><option>15</option></select>
    </label>
    <label>Payment frequency
      <select id="m-freq">
        <option value="monthly">Monthly</option>
        <option value="acceleratedBiweekly">Accelerated bi-weekly</option>
        <option value="biweekly">Bi-weekly</option>
        <option value="weekly">Weekly</option>
      </select>
    </label>
  </div>
  <output class="calc__out" id="m-out" aria-live="polite"></output>
  <p class="calc__note">Estimate only — not financial advice or a mortgage pre-approval. Canadian fixed-rate
    (semi-annual compounding). CMHC premium is added when the down payment is under 20%.</p>
</form>
<script>
  import { paymentForFrequency, payment, cmhcPremium } from '../lib/mortgage-math.js';
  const $ = (id) => document.getElementById(id);
  const money = (n) => n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  const money2 = (n) => n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 });
  function recalc() {
    const price = +$('m-price').value, down = +$('m-down').value;
    const rate = (+$('m-rate').value) / 100, amort = +$('m-amort').value, freq = $('m-freq').value;
    let loan = Math.max(0, price - down);
    const ltv = price > 0 ? loan / price : 0;
    const premium = ltv > 0.80 ? cmhcPremium(loan, price) : 0;
    loan += premium;
    const pay = paymentForFrequency(loan, rate, amort, freq);
    const monthly = payment(loan, rate, amort, 12);
    $('m-out').innerHTML = `
      <strong>${money2(pay)}</strong> per payment (${freq.replace(/([A-Z])/g,' $1').toLowerCase()})
      <div>Equivalent monthly: ${money2(monthly)}</div>
      <div>Mortgage amount${premium ? ' (incl. CMHC)' : ''}: ${money(loan)}</div>
      ${premium ? `<div>CMHC premium: ${money(premium)}</div>` : ''}`;
  }
  document.getElementById('mortgage-calc').addEventListener('input', recalc);
  recalc();
</script>
<style>
  .calc__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); }
  .calc label { display: flex; flex-direction: column; gap: .3rem; font-weight: 600; }
  .calc input, .calc select { padding: .55rem; border: 1px solid var(--color-line); border-radius: var(--radius); font: inherit; }
  .calc__out { display: block; margin-top: 1.5rem; padding: 1rem; border: 1px solid var(--color-line); border-radius: var(--radius); font-size: 1.1rem; }
  .calc__out strong { font-size: 1.5rem; color: var(--color-fg); }
  .calc__note { color: var(--color-muted); font-size: .85rem; margin-top: 1rem; }
</style>
```

- [ ] **Step 2: Create `src/pages/mortgage-calculator.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import MortgageCalculator from '../components/MortgageCalculator.astro';
---
<BaseLayout title="Mortgage Calculator (Canadian) — Derrick Garcia"
  description="Estimate Canadian mortgage payments with correct semi-annual compounding, accelerated payment options, and CMHC insurance.">
  <h1>Mortgage Calculator</h1>
  <MortgageCalculator />
</BaseLayout>
```

- [ ] **Step 3: Verify build**

Run: `npm run build && test -f dist/mortgage-calculator/index.html && grep -q "m-price" dist/mortgage-calculator/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `npm run dev` → open `/mortgage-calculator`; change price/rate → output updates live; set down payment to 10% of price → "CMHC premium" line appears. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Canadian mortgage calculator (island + page)"
```

---

## Task 10: Affordability calculator (island + page)

**Files:**
- Create: `src/components/AffordabilityCalculator.astro`, `src/pages/affordability-calculator.astro`

- [ ] **Step 1: Create `src/components/AffordabilityCalculator.astro`**

```astro
---
---
<form class="calc" id="afford-calc" novalidate>
  <div class="calc__grid">
    <label>Gross annual income ($)<input type="number" id="a-income" value="120000" min="0" step="1000" /></label>
    <label>Down payment ($)<input type="number" id="a-down" value="100000" min="0" step="1000" /></label>
    <label>Monthly debts ($)<input type="number" id="a-debts" value="500" min="0" step="50" /></label>
    <label>Interest rate (%)<input type="number" id="a-rate" value="5.0" min="0" step="0.01" /></label>
    <label>Amortization (years)<select id="a-amort"><option>25</option><option>30</option></select></label>
    <label>Property tax ($/mo)<input type="number" id="a-tax" value="350" min="0" step="10" /></label>
    <label>Condo fees ($/mo)<input type="number" id="a-condo" value="0" min="0" step="10" /></label>
  </div>
  <output class="calc__out" id="a-out" aria-live="polite"></output>
  <p class="calc__note">Estimate only — not financial advice or a pre-approval. Uses Canadian GDS/TDS limits
    qualified at the stress-test rate (greater of your rate + 2% or 5.25%). Heating estimated at $150/mo;
    50% of condo fees counted.</p>
</form>
<script>
  import { maxAffordability } from '../lib/mortgage-math.js';
  const $ = (id) => document.getElementById(id);
  const money = (n) => n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  function recalc() {
    const r = maxAffordability({
      grossAnnualIncome: +$('a-income').value, downPayment: +$('a-down').value,
      monthlyDebts: +$('a-debts').value, contractRate: (+$('a-rate').value) / 100,
      amortYears: +$('a-amort').value, monthlyPropertyTax: +$('a-tax').value,
      monthlyCondoFees: +$('a-condo').value,
    });
    $('a-out').innerHTML = `
      You may afford up to <strong>${money(r.maxPrice)}</strong>
      <div>Maximum mortgage: ${money(r.maxMortgage)}</div>
      <div>Max monthly housing budget: ${money(r.maxMonthlyHousing)} (${r.bindingRatio}-limited)</div>
      <div>Qualified at: ${(r.qualifyingRate * 100).toFixed(2)}% (stress test)</div>`;
  }
  document.getElementById('afford-calc').addEventListener('input', recalc);
  recalc();
</script>
<style>
  .calc__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); }
  .calc label { display: flex; flex-direction: column; gap: .3rem; font-weight: 600; }
  .calc input, .calc select { padding: .55rem; border: 1px solid var(--color-line); border-radius: var(--radius); font: inherit; }
  .calc__out { display: block; margin-top: 1.5rem; padding: 1rem; border: 1px solid var(--color-line); border-radius: var(--radius); font-size: 1.1rem; }
  .calc__out strong { font-size: 1.5rem; color: var(--color-fg); }
  .calc__note { color: var(--color-muted); font-size: .85rem; margin-top: 1rem; }
</style>
```

- [ ] **Step 2: Create `src/pages/affordability-calculator.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AffordabilityCalculator from '../components/AffordabilityCalculator.astro';
---
<BaseLayout title="Home Affordability Calculator (Canadian) — Derrick Garcia"
  description="See how much home you can afford in Ontario using Canadian GDS/TDS ratios and the mortgage stress test.">
  <h1>Affordability Calculator</h1>
  <AffordabilityCalculator />
</BaseLayout>
```

- [ ] **Step 3: Verify build**

Run: `npm run build && test -f dist/affordability-calculator/index.html && grep -q "a-income" dist/affordability-calculator/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: affordability calculator (island + page)"
```

---

## Task 11: Land Transfer Tax calculator (island + page)

**Files:**
- Create: `src/components/LandTransferTaxCalculator.astro`, `src/pages/land-transfer-tax.astro`

- [ ] **Step 1: Create `src/components/LandTransferTaxCalculator.astro`**

```astro
---
---
<form class="calc" id="ltt-calc" novalidate>
  <div class="calc__grid">
    <label>Purchase price ($)<input type="number" id="l-price" value="800000" min="0" step="1000" /></label>
    <label class="calc__check"><input type="checkbox" id="l-toronto" /> Property is in the City of Toronto</label>
    <label class="calc__check"><input type="checkbox" id="l-ftb" /> First-time home buyer</label>
  </div>
  <output class="calc__out" id="l-out" aria-live="polite"></output>
  <p class="calc__note">Estimate only — verify with your lawyer. Ontario charges land transfer tax; properties
    in the City of Toronto pay an additional municipal land transfer tax. First-time buyer rebates applied where eligible.</p>
</form>
<script>
  import { landTransferTax } from '../lib/mortgage-math.js';
  const $ = (id) => document.getElementById(id);
  const money = (n) => n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 });
  function recalc() {
    const r = landTransferTax({
      price: +$('l-price').value, inToronto: $('l-toronto').checked, firstTimeBuyer: $('l-ftb').checked,
    });
    $('l-out').innerHTML = `
      Total land transfer tax: <strong>${money(r.total)}</strong>
      <div>Ontario: ${money(r.ontario)}</div>
      ${r.toronto ? `<div>Toronto municipal: ${money(r.toronto)}</div>` : ''}
      ${r.rebate ? `<div>First-time buyer rebate: −${money(r.rebate)}</div>` : ''}`;
  }
  document.getElementById('ltt-calc').addEventListener('input', recalc);
  recalc();
</script>
<style>
  .calc__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); }
  .calc label { display: flex; flex-direction: column; gap: .3rem; font-weight: 600; }
  .calc__check { flex-direction: row; align-items: center; gap: .5rem; }
  .calc input[type=number] { padding: .55rem; border: 1px solid var(--color-line); border-radius: var(--radius); font: inherit; }
  .calc__out { display: block; margin-top: 1.5rem; padding: 1rem; border: 1px solid var(--color-line); border-radius: var(--radius); font-size: 1.1rem; }
  .calc__out strong { font-size: 1.5rem; color: var(--color-fg); }
  .calc__note { color: var(--color-muted); font-size: .85rem; margin-top: 1rem; }
</style>
```

- [ ] **Step 2: Create `src/pages/land-transfer-tax.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import LandTransferTaxCalculator from '../components/LandTransferTaxCalculator.astro';
---
<BaseLayout title="Ontario + Toronto Land Transfer Tax Calculator — Derrick Garcia"
  description="Estimate your Ontario and Toronto municipal land transfer tax, including first-time buyer rebates.">
  <h1>Land Transfer Tax Calculator</h1>
  <LandTransferTaxCalculator />
</BaseLayout>
```

- [ ] **Step 3: Verify build**

Run: `npm run build && test -f dist/land-transfer-tax/index.html && grep -q "l-toronto" dist/land-transfer-tax/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Ontario + Toronto land transfer tax calculator (island + page)"
```

---

## Task 12: Contact page — Web3Forms lead form + TidyCal booking (graceful fallbacks)

**Files:**
- Create: `src/components/LeadForm.astro`, `src/pages/contact.astro`, `src/pages/thanks.astro`

- [ ] **Step 1: Create `src/components/LeadForm.astro`** (renders the real form when a key is set; otherwise a call/email fallback — never a broken form)

```astro
---
import { CONFIG } from '../data/config.ts';
import { SITE } from '../data/site.ts';
const { subject = '🏠 New website lead — Contact', formName = 'Contact' } = Astro.props;
const key = CONFIG.web3formsAccessKey;
---
{key ? (
  <form action="https://api.web3forms.com/submit" method="POST" class="lead-form">
    <input type="hidden" name="access_key" value={key} />
    <input type="hidden" name="subject" value={subject} />
    <input type="hidden" name="from_name" value={formName} />
    <input type="hidden" name="redirect" value="https://derrickgarcia.ca/thanks" />
    <input type="checkbox" name="botcheck" class="visually-hidden" tabindex="-1" autocomplete="off" />
    <div class="lead-form__grid">
      <label>Name<input type="text" name="name" required autocomplete="name" /></label>
      <label>Email<input type="email" name="email" required autocomplete="email" /></label>
      <label>Phone<input type="tel" name="phone" autocomplete="tel" /></label>
    </div>
    <label>How can we help?<textarea name="message" rows="4" required></textarea></label>
    <label class="lead-form__consent">
      <input type="checkbox" name="consent" required />
      I agree to be contacted about my inquiry. See our <a href="/privacy">privacy policy</a>.
    </label>
    <button type="submit" class="btn">Send message</button>
  </form>
) : (
  <div class="lead-form__fallback">
    <p>Reach Derrick directly:</p>
    <p><a class="btn" href={SITE.phoneHref}>Call {SITE.phoneDisplay}</a>
       <a class="btn btn--ghost" href={`mailto:${SITE.email}`}>Email {SITE.email}</a></p>
  </div>
)}
<style>
  .lead-form__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); }
  .lead-form label { display: flex; flex-direction: column; gap: .3rem; font-weight: 600; margin-bottom: 1rem; }
  .lead-form input, .lead-form textarea { padding: .55rem; border: 1px solid var(--color-line); border-radius: var(--radius); font: inherit; }
  .lead-form__consent { flex-direction: row; align-items: flex-start; gap: .5rem; font-weight: 400; }
  .lead-form__fallback .btn { margin-right: .5rem; }
</style>
```

- [ ] **Step 2: Create `src/pages/contact.astro`** (TidyCal iframe when configured; otherwise a call/email card)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import LeadForm from '../components/LeadForm.astro';
import { SITE } from '../data/site.ts';
import { CONFIG } from '../data/config.ts';
---
<BaseLayout title="Contact Derrick Garcia — Real Broker Ontario"
  description="Contact Derrick Garcia for Toronto & GTA real estate. Call, email, or book a meeting.">
  <h1>Contact</h1>
  <div class="contact-grid">
    <section>
      <h2>Send a message</h2>
      <LeadForm />
      <p><strong>Call:</strong> <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a><br />
         <strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
    </section>
    <section>
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
  .contact-grid { display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); }
</style>
```

- [ ] **Step 3: Create `src/pages/thanks.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Thank you — Derrick Garcia" description="Your message has been sent." noindex={true}>
  <h1>Thank you</h1>
  <p>Your message was sent — Derrick will be in touch soon.</p>
  <p><a class="btn" href="/">Back to home</a></p>
</BaseLayout>
```

- [ ] **Step 4: Verify build** (fallbacks render while config is empty)

Run: `npm run build && grep -q "Reach Derrick directly" dist/contact/index.html && test -f dist/thanks/index.html && echo OK`
Expected: `OK` (with empty config the call/email fallback shows; after the key is set in Task 19 the real form renders).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: contact page with Web3Forms form + TidyCal booking (graceful fallbacks)"
```

---

## Task 13: Home page

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/components/RealEstateAgentSchema.astro`

- [ ] **Step 1: Create `src/components/RealEstateAgentSchema.astro`** (empty `sameAs` entries filtered out)

```astro
---
import { SITE } from '../data/site.ts';
const sameAs = [SITE.social.instagram, SITE.social.facebook, SITE.social.googleBusiness].filter(Boolean);
const data = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  '@id': `${SITE.url}/#agent`,
  name: SITE.legalName,
  url: SITE.url,
  telephone: SITE.phoneDisplay,
  email: SITE.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  areaServed: ['Toronto', 'Greater Toronto Area', 'Ontario'],
  sameAs,
};
---
<script type="application/ld+json" is:inline set:html={JSON.stringify(data)} />
```

- [ ] **Step 2: Replace `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AgentCard from '../components/AgentCard.astro';
import RealEstateAgentSchema from '../components/RealEstateAgentSchema.astro';
import { AGENTS } from '../data/agents.ts';
import { SITE } from '../data/site.ts';
---
<BaseLayout title="Derrick Garcia — Toronto & GTA Real Estate Agent | Real Broker Ontario"
  description="Buy or sell with Derrick Garcia, a Toronto & GTA real estate broker with Real Broker Ontario. Search homes, estimate your mortgage, and get in touch.">
  <RealEstateAgentSchema slot="head" />
  <section class="hero">
    <h1>Toronto & GTA real estate, done right</h1>
    <p>Derrick Garcia · {SITE.brokerage}</p>
    <div class="hero__cta">
      <a class="btn" href="/contact">Get in touch</a>
      <a class="btn btn--ghost" href={SITE.listingsSearchUrl} target="_blank" rel="noopener noreferrer">Search homes ↗</a>
    </div>
  </section>

  <section>
    <h2>Plan your purchase</h2>
    <ul class="tools">
      <li><a href="/mortgage-calculator">Mortgage calculator →</a></li>
      <li><a href="/affordability-calculator">Affordability calculator →</a></li>
      <li><a href="/land-transfer-tax">Land transfer tax →</a></li>
    </ul>
  </section>

  <section>
    <h2>Meet the team</h2>
    <div class="team-grid">{AGENTS.map((agent) => <AgentCard agent={agent} />)}</div>
    <p><a class="btn btn--ghost" href="/about">About our team</a></p>
  </section>
</BaseLayout>
<style>
  .hero { padding-block: 3rem 2rem; }
  .hero h1 { font-size: clamp(2rem, 5vw, 3.2rem); margin-bottom: .3rem; }
  .hero__cta { display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; }
  .tools { list-style: none; padding: 0; display: grid; gap: .8rem; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); }
  .tools a { display: block; padding: 1rem; border: 1px solid var(--color-line); border-radius: var(--radius); text-decoration: none; font-weight: 600; }
  .team-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); }
</style>
```

- [ ] **Step 3: Verify build**

Run: `npm run build && grep -q "Search homes" dist/index.html && grep -q "RealEstateAgent" dist/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: home page (hero, tools, team) + RealEstateAgent schema"
```

---

## Task 14: Privacy, Accessibility, 404 (real accessibility text)

**Files:**
- Create: `src/pages/privacy.astro`, `src/pages/accessibility.astro`, `src/pages/404.astro`

- [ ] **Step 1: Create `src/pages/privacy.astro`** (forms/PII + CASL — authored fresh; the old Lofty page had no real policy text)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../data/site.ts';
---
<BaseLayout title="Privacy Policy — Derrick Garcia" description="How Derrick Garcia collects and uses information submitted through this website.">
  <h1>Privacy Policy</h1>
  <p>This website collects personal information only when you submit it through a form (name, email, phone,
    and your message). We use it solely to respond to your inquiry. We do not sell your information.</p>
  <h2>How forms are processed</h2>
  <p>Form submissions are processed by Web3Forms and delivered to us by email. These services may process
    data on servers outside Canada.</p>
  <h2>Analytics</h2>
  <p>We use privacy-friendly, cookieless analytics (Cloudflare Web Analytics) that measure aggregate page
    visits only. No cookies are set and you are not individually tracked.</p>
  <h2>Email (CASL)</h2>
  <p>If you ask us to follow up, you consent to being contacted about your inquiry. You can ask us to stop at
    any time by replying or emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
  <h2>Access & questions</h2>
  <p>To access, correct, or delete information you've submitted, contact <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
    or call <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>.</p>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/accessibility.astro`** (REAL statement carried over from the old site)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../data/site.ts';
---
<BaseLayout title="Accessibility — Derrick Garcia" description="Our commitment to an accessible website (WCAG 2.1 Level AA).">
  <h1>Accessibility</h1>
  <p>We actively work to maintain a website with content that is accessible to all visitors. This site is
    updated on a regular basis in order for it to be as accessible as possible. To the extent possible, we aim
    to meet the Level AA Success Criteria found in the Web Content Accessibility Guidelines 2.1 (WCAG 2.1).</p>
  <p>If you are in need of assistance to navigate this website or access real estate information and property
    data, please contact us using any of the options below and we will make every reasonable effort to assist
    you. Please provide as much information as possible so that we can address your specific needs:</p>
  <ul>
    <li>Phone: <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a></li>
    <li>Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
  </ul>
</BaseLayout>
```

- [ ] **Step 3: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Page not found — Derrick Garcia" description="The page you were looking for could not be found." noindex={true}>
  <h1>Page not found</h1>
  <p>Sorry, that page doesn't exist. <a href="/">Return home</a> or <a href="/contact">contact us</a>.</p>
</BaseLayout>
```

- [ ] **Step 4: Verify build**

Run: `npm run build && grep -q "WCAG 2.1" dist/accessibility/index.html && test -f dist/privacy/index.html && test -f dist/404.html && echo OK`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: privacy, accessibility (real statement), and 404 pages"
```

---

## Task 15: Per-agent Person JSON-LD

**Files:**
- Create: `src/components/AgentSchema.astro`
- Modify: `src/pages/about.astro`

- [ ] **Step 1: Create `src/components/AgentSchema.astro`** (empty profile URLs filtered out of `sameAs`)

```astro
---
import { SITE } from '../data/site.ts';
const { agent } = Astro.props;
const sameAs = [agent.realtorCaUrl, agent.realBrokerUrl].filter(Boolean);
const data = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: agent.name,
  jobTitle: agent.title,
  worksFor: { '@type': 'Organization', name: SITE.brokerage },
  url: `${SITE.url}/about`,
  ...(sameAs.length ? { sameAs } : {}),
};
---
<script type="application/ld+json" is:inline set:html={JSON.stringify(data)} />
```

- [ ] **Step 2: Add Person schema to `src/pages/about.astro`**

Add this import to the existing frontmatter imports:
```astro
import AgentSchema from '../components/AgentSchema.astro';
```
Add this line immediately after the opening `<BaseLayout ...>` tag (before `<h1>Our Team</h1>`):
```astro
  {AGENTS.map((agent) => <AgentSchema slot="head" agent={agent} />)}
```

- [ ] **Step 3: Verify build + JSON-LD present**

Run: `npm run build && grep -q '"@type":"Person"' dist/about/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: per-agent Person JSON-LD on About page"
```

---

## Task 16: Favicon set, web manifest, default OG image

**Files:**
- Create: `public/favicon.svg`, `public/site.webmanifest`
- Create (raster, from logo): `public/favicon.ico`, `public/apple-touch-icon.png`, `public/og-default.png`

- [ ] **Step 1: Create `public/favicon.svg`** (simple brand mark; replace with the real one if/when provided)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#191919"/>
  <text x="32" y="43" font-family="system-ui, sans-serif" font-size="32" font-weight="700"
    text-anchor="middle" fill="#b08d57">DG</text>
</svg>
```

- [ ] **Step 2: Create `public/site.webmanifest`**

```json
{
  "name": "Derrick Garcia — Real Broker Ontario",
  "short_name": "Derrick Garcia",
  "icons": [{ "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }],
  "theme_color": "#191919",
  "background_color": "#ffffff",
  "display": "browser"
}
```

- [ ] **Step 3: Generate the raster icons + OG image**

Generate `favicon.ico` (32px), `apple-touch-icon.png` (180×180), and `og-default.png` (1200×630, brand + name).
If ImageMagick is available:
```bash
convert -background none public/favicon.svg -resize 180x180 public/apple-touch-icon.png
convert -background none public/favicon.svg -resize 32x32 public/favicon.ico
convert -size 1200x630 xc:'#191919' -gravity center -fill '#b08d57' \
  -pointsize 64 -annotate +0+0 'Derrick Garcia\nReal Broker Ontario' public/og-default.png
```
If ImageMagick is unavailable, create a simple 1200×630 `public/og-default.png` by any means (the SVG
favicon already works in modern browsers). The build must not fail for lack of these.

- [ ] **Step 4: Verify build**

Run: `npm run build && test -f dist/favicon.svg && test -f dist/site.webmanifest && test -f dist/og-default.png && echo OK`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: favicon set, web manifest, default OG image"
```

---

## Task 17: Full-site verification

**Files:** none (verification only)

- [ ] **Step 1: Unit tests**

Run: `npm test`
Expected: PASS — all `mortgage-math` suites green.

- [ ] **Step 2: Clean build**

Run: `rm -rf dist && npm run build`
Expected: succeeds, no errors.

- [ ] **Step 3: All routes built**

Run:
```bash
for p in index about contact mortgage-calculator affordability-calculator land-transfer-tax privacy accessibility thanks; do
  test -f "dist/$p/index.html" -o -f "dist/$p.html" && echo "ok $p" || echo "MISSING $p"
done
test -f dist/404.html && echo "ok 404" || echo "MISSING 404"
test -f dist/sitemap-index.xml && echo "ok sitemap" || echo "MISSING sitemap"
```
Expected: every line prints `ok ...`.

- [ ] **Step 4: SEO essentials on the home page**

Run: `grep -c -e 'rel="canonical"' -e 'og:title' -e 'application/ld+json' dist/index.html`
Expected: ≥ 3.

- [ ] **Step 5: Preview + click-through**

Run: `npm run preview` → visit every route; confirm calculators update live, the contact page renders
(call/email fallbacks until config is filled), nav works, no console errors. Stop the server.

- [ ] **Step 6: Commit (fixups if any)**

```bash
git add -A
git commit -m "test: full-site Phase 1 verification" --allow-empty
```

---

## Task 18: Remove the extracted/ reference snapshot

> The site no longer depends on `extracted/` — all needed assets and content are now in `src/`. Per the
> project decision, delete the snapshot once the build is green.

- [ ] **Step 1: Confirm nothing in `src/` references `extracted/`**

Run: `! grep -rn "extracted/" src/ && echo "clean"`
Expected: `clean` (no references).

- [ ] **Step 2: Remove the snapshot**

```bash
git rm -r extracted/
```

- [ ] **Step 3: Rebuild to confirm nothing broke**

Run: `npm run build && npm test`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remove extracted/ reference snapshot (assets + content migrated into src/)"
```

(Note: the snapshot remains recoverable from git history and the bypass scripts are documented in the
research appendix, should a future re-pull be needed.)

---

## Task 19: Production go-live runbook (manual — requires the user)

> **Operational, not code.** Changes live DNS; depends on the external config. Do it WITH the user.
> Email continuity is the top risk.

- [ ] **Step 1: Fill external config** — set in `src/data/config.ts`: `web3formsAccessKey`, `tidycalUrl`,
  `cloudflareAnalyticsToken`. Set per-agent `realtorCaUrl`/`realBrokerUrl` in `src/data/agents.ts` and
  `SITE.social.googleBusiness` in `src/data/site.ts`. Rebuild (`npm run build`) and confirm the real form,
  booking iframe, analytics beacon, agent listing links, and GBP `sameAs` now render. Commit.

- [ ] **Step 2: Enable GitHub Pages** — push the repo (user action), repo Settings → Pages → Source =
  **GitHub Actions**. Confirm the workflow runs green and the site works on the temporary `*.github.io` URL.
  **Verify the whole site there before touching DNS.**

- [ ] **Step 3: Lower DNS TTL** on the current Lofty records to 300s, ~24h before cutover.

- [ ] **Step 4: Cut over DNS** at the `.ca` registrar — keep MX/SPF/DKIM/TXT untouched (protect
  `info@derrickgarcia.ca`); replace only the web records:
  - A `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - AAAA `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
  - CNAME `www` → `<github-username>.github.io`
  - Remove old Lofty A/CNAME web records.

- [ ] **Step 5: Custom domain + HTTPS** — Settings → Pages → Custom domain = `derrickgarcia.ca`; wait for the
  green check; enable **Enforce HTTPS**.

- [ ] **Step 6: Post-cutover verification** — `dig +short derrickgarcia.ca A` (expect the four GitHub IPs);
  `https://derrickgarcia.ca` serves the new site with a valid cert; **send a test email to
  `info@derrickgarcia.ca` and confirm it still arrives**; submit the contact form → confirm lead email +
  autoresponder; confirm Cloudflare Analytics registers the visit.

- [ ] **Step 7: Search Console** — claim the property, submit `https://derrickgarcia.ca/sitemap-index.xml`,
  add the verification. Decommission Lofty only after all the above pass.

---

## Pre-go-live checklist (the only outstanding inputs)

These cannot come from the old site; gather before Task 19:
1. **Web3Forms access key** → `config.ts`
2. **TidyCal booking URL** → `config.ts`
3. **Cloudflare Web Analytics token** → `config.ts`
4. **realtor.ca + Real Broker profile URLs** for Derrick, Pina, Voula → `agents.ts`
5. **Google Business Profile URL** → `site.ts`
6. *(optional)* Real brand mark/favicon to replace the `DG` placeholder mark
7. *(optional)* Licensed hero photography (Phase 2 visual polish)
8. *(optional)* Voula's full bio
9. *(Phase 2)* Real testimonials

---

## Self-review (completed by plan author)

- **Spec coverage:** Astro+Pages+Actions (T1); math incl. LTT (T2–T5); data/config/tokens/layout/header/footer
  (T6); assets verified (T7); About + real bios (T8); calculators (T9–T11); Contact w/ Web3Forms + TidyCal (T12);
  Home + RealEstateAgent schema (T13); privacy/accessibility/404 (T14); Person schema (T15);
  favicon/manifest/OG (T16); SEO meta + sitemap + robots + cookieless analytics (T1, T6); verification (T17);
  extracted/ removal (T18); domain cutover keeping MX (T19). All spec §3–§7 + §10 Phase 1 items mapped.
- **No fabricated placeholders:** real bios/accessibility text/brand colours inlined; the only blanks are the
  genuinely-external go-live values, centralized in `config.ts`/`agents.ts`/`site.ts` with graceful fallbacks,
  listed in the pre-go-live checklist.
- **Type/name consistency:** `mortgage-math.js` exports (`periodicRate`, `payment`, `paymentForFrequency`,
  `qualifyingRate`, `cmhcPremium`, `cmhcPremiumRate`, `maxAffordability`, `landTransferTax`,
  `GDS_LIMIT`, `TDS_LIMIT`) match every island import. `SITE`, `CONFIG`, `AGENTS`/`Agent` shapes consistent
  across components. CSS variables (`--color-bg/-fg/-text/-muted/-accent/-accent-ink/-line`) defined once in
  `tokens.css` and used everywhere.
- **Out of scope (correctly absent):** reviews page, evaluation/sell/rent-to-own landings, live reviews widget
  (Phase 2); IDX/blog (dropped).
```
