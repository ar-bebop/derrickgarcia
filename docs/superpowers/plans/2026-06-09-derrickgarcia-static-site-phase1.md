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
- **User-supplied config** (Web3Forms access key, TidyCal URL, Cloudflare token, realtor.ca/Real Broker
  profile URLs, Google Business Profile URL) are spec **open items**. Where a real value isn't yet known,
  use the named placeholder constant indicated and leave the documented `TODO(open-item-N)` marker. The
  build must succeed with placeholders; these are swapped when the user provides them.

## File structure (created across the tasks below)

```
.nvmrc                         package.json            astro.config.mjs       vitest.config.js
.github/workflows/deploy.yml
public/  CNAME  robots.txt  favicon.svg  (favicon set)  og-default.png
src/
  lib/        mortgage-math.js  mortgage-math.test.js
  styles/     tokens.css  global.css
  layouts/    BaseLayout.astro
  components/  Header.astro  Footer.astro  AgentCard.astro  LeadForm.astro
              MortgageCalculator.astro  AffordabilityCalculator.astro  LandTransferTaxCalculator.astro
              AgentSchema.astro  RealEstateAgentSchema.astro
  data/       site.ts  agents.ts
  pages/      index.astro  about.astro  contact.astro
              mortgage-calculator.astro  affordability-calculator.astro  land-transfer-tax.astro
              privacy.astro  accessibility.astro  404.astro  thanks.astro
  assets/     profile/*  branding/*
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
  test: {
    include: ['src/**/*.test.js'],
    environment: 'node',
  },
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

- [ ] **Step 9: Create temporary `src/pages/index.astro`** (replaced in Task 8)

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
Expected: `astro build` completes writing `dist/`; `vitest run` reports "No test files found" (exit 0 — acceptable at this point) OR passes. Build must succeed.

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
import {
  periodicRate, payment, paymentForFrequency,
} from './mortgage-math.js';

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
    const pmt = payment(500000, 0.05, 25, 12);
    expect(Math.abs(pmt - 2908.13)).toBeLessThan(1.0);
  });
  it('handles 0% as straight-line principal/n', () => {
    expect(payment(120000, 0, 25, 12)).toBeCloseTo(120000 / 300, 6);
  });
});

describe('paymentForFrequency', () => {
  it('accelerated bi-weekly equals monthly / 2', () => {
    const monthly = payment(500000, 0.05, 25, 12);
    expect(paymentForFrequency(500000, 0.05, 25, 'acceleratedBiweekly'))
      .toBeCloseTo(monthly / 2, 6);
  });
  it('regular bi-weekly is less than monthly/2 (26 vs ~26 payments, full amortization)', () => {
    const monthly = payment(500000, 0.05, 25, 12);
    const biweekly = paymentForFrequency(500000, 0.05, 25, 'biweekly');
    expect(biweekly).toBeLessThan(monthly / 2);
  });
  it('throws on an unknown frequency', () => {
    expect(() => paymentForFrequency(1, 0.05, 25, 'nope')).toThrow();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npm test`
Expected: FAIL — cannot import from `./mortgage-math.js` (module/exports missing).

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

// Payment for a given named frequency. Accelerated = the monthly payment split,
// paid more often (≈ one extra monthly payment per year → faster payoff).
export function paymentForFrequency(principal, annualRate, amortYears, freqKey) {
  const f = FREQUENCIES[freqKey];
  if (!f) throw new Error(`unknown frequency: ${freqKey}`);
  if (f.accelerated) return payment(principal, annualRate, amortYears, 12) / f.divisor;
  return payment(principal, annualRate, amortYears, f.periodsPerYear);
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `npm test`
Expected: PASS (all `periodicRate`, `payment`, `paymentForFrequency` tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/mortgage-math.js src/lib/mortgage-math.test.js
git commit -m "feat: Canadian periodic-rate + payment + frequency math (TDD)"
```

---

## Task 3: Stress test + CMHC premium (TDD)

**Files:**
- Modify: `src/lib/mortgage-math.js`
- Modify: `src/lib/mortgage-math.test.js`

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
  it('20% down (80% LTV) → 0% (not insured)', () => { expect(cmhcPremiumRate(0.80)).toBe(0); });
});

describe('cmhcPremium', () => {
  it('5% down on a $500k home → $19,000 premium', () => {
    expect(cmhcPremium(475000, 500000)).toBeCloseTo(19000, 2);
  });
});
```

- [ ] **Step 2: Run tests, verify the new ones fail**

Run: `npm test`
Expected: FAIL — `qualifyingRate`/`cmhcPremiumRate`/`cmhcPremium` are not exported.

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
- Modify: `src/lib/mortgage-math.js`
- Modify: `src/lib/mortgage-math.test.js`

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
  it('qualifies at contract + 2% (= 7%), not the contract rate', () => {
    expect(maxAffordability(base).qualifyingRate).toBeCloseTo(0.07, 10);
  });
  it('caps monthly housing at min(GDS, TDS) of gross monthly income', () => {
    const r = maxAffordability(base);
    const gm = 120000 / 12;
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
  const maxMortgage = i === 0
    ? maxMortgagePmt * n
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
- Modify: `src/lib/mortgage-math.js`
- Modify: `src/lib/mortgage-math.test.js`

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

## Task 6: Design tokens, global CSS, BaseLayout, Header, Footer

**Files:**
- Create: `src/data/site.ts`, `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Create `src/data/site.ts`** (single source of truth for NAP + links)

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
    googleBusiness: 'https://www.google.com/maps', // TODO(open-item-7): real GBP URL
  },
  // TODO(open-item-1): real realtor.ca search + Derrick's agent profile URL
  listingsSearchUrl: 'https://www.realtor.ca/on/toronto/real-estate',
  agentProfileUrl: 'https://www.realtor.ca/on/toronto/real-estate',
};
```

- [ ] **Step 2: Create `src/styles/tokens.css`** (brand palette — Real Broker black/gold; refine against `extracted/css/styleAndTheme.css`)

```css
:root {
  --color-bg: #ffffff;
  --color-fg: #1a1a1a;
  --color-muted: #5b5b5b;
  --color-accent: #c8a04e;     /* Real "gold" — verify against extracted theme */
  --color-accent-ink: #0f0f0f;
  --color-line: #e6e6e6;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --maxw: 1100px;
  --space: 1rem;
  --radius: 10px;
}
```

- [ ] **Step 3: Create `src/styles/global.css`**

```css
@import './tokens.css';
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: var(--font-sans); color: var(--color-fg);
  background: var(--color-bg); line-height: 1.55; }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; }
.container { max-width: var(--maxw); margin-inline: auto; padding-inline: var(--space); }
.btn { display: inline-block; padding: .7rem 1.2rem; border-radius: var(--radius);
  background: var(--color-accent); color: var(--color-accent-ink); font-weight: 600;
  text-decoration: none; border: 0; cursor: pointer; }
.btn--ghost { background: transparent; border: 1px solid var(--color-line); color: var(--color-fg); }
:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
```

- [ ] **Step 4: Create `src/components/Header.astro`**

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
  .site-header__inner { display: flex; gap: 1rem; align-items: center;
    justify-content: space-between; padding-block: .8rem; flex-wrap: wrap; }
  .site-header__brand { font-weight: 700; text-decoration: none; }
  .site-header__brand span { color: var(--color-muted); font-weight: 400; }
  nav ul { display: flex; gap: 1rem; list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
  nav a { text-decoration: none; }
  nav a:hover { color: var(--color-accent); }
</style>
```

- [ ] **Step 5: Create `src/components/Footer.astro`**

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
  .site-footer__social { display: flex; gap: 1rem; }
  .site-footer__legal { color: var(--color-muted); font-size: .85rem; margin-top: 1.5rem; }
</style>
```

- [ ] **Step 6: Create `src/layouts/BaseLayout.astro`** (per-page SEO + analytics in ONE place)

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { SITE } from '../data/site.ts';

const {
  title, description,
  ogImage = '/og-default.png',
  noindex = false,
} = Astro.props;
const canonical = new URL(Astro.url.pathname, SITE.url).href;
const CF_ANALYTICS_TOKEN = ''; // TODO(open-item): Cloudflare Web Analytics token
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
    {CF_ANALYTICS_TOKEN && (
      <script is:inline defer src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={`{"token": "${CF_ANALYTICS_TOKEN}"}`}></script>
    )}
  </body>
</html>
```

- [ ] **Step 7: Replace `src/pages/index.astro` with a real smoke page using the layout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Derrick Garcia — Toronto Real Estate Agent" description="Toronto & GTA real estate with Derrick Garcia, Real Broker Ontario.">
  <h1>Derrick Garcia</h1>
  <p>Layout smoke test.</p>
</BaseLayout>
```

- [ ] **Step 8: Verify build + content**

Run: `npm run build`
Expected: build succeeds.
Run: `grep -r "site-header__brand" dist/index.html && grep -r "canonical" dist/index.html`
Expected: both found (header rendered, canonical present).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: design tokens, global CSS, BaseLayout, Header, Footer"
```

---

## Task 7: Migrate real assets (headshots + logos)

**Files:**
- Create: `src/assets/profile/*`, `src/assets/branding/*` (copied from `extracted/`)

- [ ] **Step 1: Copy the real (non-stock) assets into the build tree**

```bash
mkdir -p src/assets/profile src/assets/branding
cp extracted/images/profile/derrick-garcia.webp src/assets/profile/
cp extracted/images/profile/pina-marrella.webp src/assets/profile/
cp extracted/images/profile/voula-spingos.webp src/assets/profile/
cp extracted/images/branding/real-wordmark-white.png src/assets/branding/
cp extracted/images/branding/real-emblem-gold.png src/assets/branding/
```

- [ ] **Step 2: Verify files exist**

Run: `ls src/assets/profile src/assets/branding`
Expected: 3 profile webp files + 2 branding png files.
(Note: hero/banner stock images are intentionally NOT migrated — spec §6. Licensed hero photography is open-item-4.)

- [ ] **Step 3: Commit**

```bash
git add src/assets
git commit -m "chore: migrate real headshots + Real Broker logos into src/assets"
```

---

## Task 8: About / Team page (agents data + AgentCard)

**Files:**
- Create: `src/data/agents.ts`, `src/components/AgentCard.astro`, `src/pages/about.astro`

- [ ] **Step 1: Create `src/data/agents.ts`** (bios are open-item-5; placeholders flagged)

```ts
export interface Agent {
  slug: string; name: string; title: string;
  photo: string;          // path under src/assets
  bio: string;
  realtorCaUrl: string; realBrokerUrl: string;
}
// TODO(open-item-5): confirm bios from extracted/pages/agent-*.html
// TODO(open-item-1): real realtor.ca + Real Broker profile URLs per agent
export const AGENTS: Agent[] = [
  { slug: 'derrick-garcia', name: 'Derrick Garcia', title: 'Real Estate Agent',
    photo: 'profile/derrick-garcia.webp',
    bio: 'Toronto & GTA real estate agent with Real Broker Ontario.',
    realtorCaUrl: 'https://www.realtor.ca/', realBrokerUrl: 'https://onereal.com/' },
  { slug: 'pina-marrella', name: 'Pina Marrella', title: 'Real Estate Agent',
    photo: 'profile/pina-marrella.webp',
    bio: 'Real estate agent on the Derrick Garcia team.',
    realtorCaUrl: 'https://www.realtor.ca/', realBrokerUrl: 'https://onereal.com/' },
  { slug: 'voula-spingos', name: 'Voula Spingos', title: 'Real Estate Agent',
    photo: 'profile/voula-spingos.webp',
    bio: 'Real estate agent on the Derrick Garcia team.',
    realtorCaUrl: 'https://www.realtor.ca/', realBrokerUrl: 'https://onereal.com/' },
];
```

- [ ] **Step 2: Create `src/components/AgentCard.astro`**

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
  <p class="agent-card__links">
    <a href={agent.realtorCaUrl} target="_blank" rel="noopener noreferrer">Listings on realtor.ca ↗</a>
  </p>
</article>
<style>
  .agent-card { border: 1px solid var(--color-line); border-radius: var(--radius); padding: 1rem; }
  .agent-card img { border-radius: var(--radius); aspect-ratio: 1; object-fit: cover; }
  .agent-card__title { color: var(--color-accent); font-weight: 600; margin: .2rem 0; }
</style>
```

- [ ] **Step 3: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AgentCard from '../components/AgentCard.astro';
import { AGENTS } from '../data/agents.ts';
---
<BaseLayout title="About Our Team — Derrick Garcia, Real Broker Ontario"
  description="Meet Derrick Garcia and the team serving Toronto & the GTA with Real Broker Ontario.">
  <h1>Our Team</h1>
  <div class="team-grid">
    {AGENTS.map((agent) => <AgentCard agent={agent} />)}
  </div>
</BaseLayout>
<style>
  .team-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); }
</style>
```

- [ ] **Step 4: Verify build + content**

Run: `npm run build && grep -l "Pina Marrella" dist/about/index.html`
Expected: build succeeds; `dist/about/index.html` contains all three agent names.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: About/Team page with AgentCard and agents data"
```

---

## Task 9: Mortgage calculator (island + page)

**Files:**
- Create: `src/components/MortgageCalculator.astro`, `src/pages/mortgage-calculator.astro`

- [ ] **Step 1: Create `src/components/MortgageCalculator.astro`** (imports the tested math; runs in the browser)

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
  .calc__out { display: block; margin-top: 1.5rem; padding: 1rem; border: 1px solid var(--color-line);
    border-radius: var(--radius); font-size: 1.1rem; }
  .calc__out strong { font-size: 1.5rem; color: var(--color-accent-ink); }
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

- [ ] **Step 3: Verify build + that the page bundles the island script**

Run: `npm run build`
Expected: succeeds.
Run: `test -f dist/mortgage-calculator/index.html && grep -q "per payment\|m-price" dist/mortgage-calculator/index.html && echo OK`
Expected: `OK` (page exists with calculator markup; Astro bundles the `<script>` import).

- [ ] **Step 4: Manual smoke (dev server)**

Run: `npm run dev` then open `/mortgage-calculator`; change price/rate → output updates live; set down payment to 10% of price → "CMHC premium" line appears. Stop the server.

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
  .calc__out strong { font-size: 1.5rem; color: var(--color-accent-ink); }
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
  .calc__out strong { font-size: 1.5rem; color: var(--color-accent-ink); }
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

## Task 12: Contact page — Web3Forms lead form + TidyCal booking

**Files:**
- Create: `src/components/LeadForm.astro`, `src/pages/contact.astro`, `src/pages/thanks.astro`

- [ ] **Step 1: Create `src/components/LeadForm.astro`** (honeypot + time-trap + hCaptcha hook; access key is open-item config)

```astro
---
const {
  formName = 'Contact',
  subject = '🏠 New website lead — Contact',
  accessKey = 'YOUR_WEB3FORMS_ACCESS_KEY', // TODO(open-item): Web3Forms access key per form
} = Astro.props;
---
<form action="https://api.web3forms.com/submit" method="POST" class="lead-form">
  <input type="hidden" name="access_key" value={accessKey} />
  <input type="hidden" name="subject" value={subject} />
  <input type="hidden" name="from_name" value={formName} />
  <input type="hidden" name="redirect" value="https://derrickgarcia.ca/thanks" />
  <!-- honeypot: bots fill this; humans never see it -->
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
  <!-- hCaptcha (free via Web3Forms): add the widget div when enabling. TODO(open-item): enable hCaptcha -->
  <button type="submit" class="btn">Send message</button>
</form>
<style>
  .lead-form__grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); }
  .lead-form label { display: flex; flex-direction: column; gap: .3rem; font-weight: 600; margin-bottom: 1rem; }
  .lead-form input, .lead-form textarea { padding: .55rem; border: 1px solid var(--color-line); border-radius: var(--radius); font: inherit; }
  .lead-form__consent { flex-direction: row; align-items: flex-start; gap: .5rem; font-weight: 400; }
</style>
```

- [ ] **Step 2: Create `src/pages/contact.astro`** (TidyCal embed URL is open-item config)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import LeadForm from '../components/LeadForm.astro';
import { SITE } from '../data/site.ts';
const TIDYCAL_URL = 'https://tidycal.com/'; // TODO(open-item-6): Derrick's TidyCal booking URL
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
      <iframe src={TIDYCAL_URL} title="Book a meeting with Derrick Garcia" loading="lazy"
        style="width:100%;min-height:600px;border:1px solid var(--color-line);border-radius:var(--radius)"></iframe>
    </section>
  </div>
</BaseLayout>
<style>
  .contact-grid { display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); }
</style>
```

- [ ] **Step 3: Create `src/pages/thanks.astro`** (Web3Forms redirect target)

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

- [ ] **Step 4: Verify build**

Run: `npm run build && grep -q "api.web3forms.com" dist/contact/index.html && test -f dist/thanks/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: contact page with Web3Forms lead form and TidyCal booking"
```

---

## Task 13: Home page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AgentCard from '../components/AgentCard.astro';
import { AGENTS } from '../data/agents.ts';
import { SITE } from '../data/site.ts';
---
<BaseLayout title="Derrick Garcia — Toronto & GTA Real Estate Agent | Real Broker Ontario"
  description="Buy or sell with Derrick Garcia, a Toronto & GTA real estate agent with Real Broker Ontario. Search homes, estimate your mortgage, and get in touch.">
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

- [ ] **Step 2: Verify build**

Run: `npm run build && grep -q "Search homes" dist/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: home page (hero, tools, team)"
```

---

## Task 14: Privacy, Accessibility, 404

**Files:**
- Create: `src/pages/privacy.astro`, `src/pages/accessibility.astro`, `src/pages/404.astro`

- [ ] **Step 1: Create `src/pages/privacy.astro`** (forms/PII + CASL, not cookies — see `extracted/pages/privacy-terms.html` for reference)

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
  <p>Form submissions are processed by Web3Forms and delivered to us by email. Spam protection is provided by
    hCaptcha. These services may process data on servers outside Canada.</p>
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

- [ ] **Step 2: Create `src/pages/accessibility.astro`** (carry over the old statement; reference `extracted/pages/accessibility.html`)

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../data/site.ts';
---
<BaseLayout title="Accessibility — Derrick Garcia" description="Our commitment to an accessible website (WCAG 2.1 Level AA).">
  <h1>Accessibility</h1>
  <p>We are committed to making this website accessible and conforming to WCAG 2.1 Level AA. We continually
    work to improve the experience for everyone and apply relevant accessibility standards.</p>
  <p>If you have difficulty accessing any part of this site, or need information in an alternate format, contact
    us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
    and we will help.</p>
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

Run: `npm run build && test -f dist/privacy/index.html && test -f dist/accessibility/index.html && test -f dist/404.html && echo OK`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: privacy, accessibility, and 404 pages"
```

---

## Task 15: JSON-LD structured data (RealEstateAgent + Person)

**Files:**
- Create: `src/components/RealEstateAgentSchema.astro`, `src/components/AgentSchema.astro`
- Modify: `src/pages/index.astro`, `src/pages/about.astro`

- [ ] **Step 1: Create `src/components/RealEstateAgentSchema.astro`**

```astro
---
import { SITE } from '../data/site.ts';
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
  sameAs: [SITE.social.instagram, SITE.social.facebook, SITE.social.googleBusiness],
};
---
<script type="application/ld+json" is:inline set:html={JSON.stringify(data)} />
```

- [ ] **Step 2: Create `src/components/AgentSchema.astro`**

```astro
---
import { SITE } from '../data/site.ts';
const { agent } = Astro.props;
const data = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: agent.name,
  jobTitle: agent.title,
  worksFor: { '@type': 'Organization', name: SITE.brokerage },
  url: `${SITE.url}/about`,
  sameAs: [agent.realtorCaUrl, agent.realBrokerUrl],
};
---
<script type="application/ld+json" is:inline set:html={JSON.stringify(data)} />
```

- [ ] **Step 3: Add the agent schema to `src/pages/index.astro`**

Add the import under the existing imports:
```astro
import RealEstateAgentSchema from '../components/RealEstateAgentSchema.astro';
```
Add inside `<BaseLayout>` (anywhere in the default slot, e.g. right after the opening tag):
```astro
  <RealEstateAgentSchema slot="head" />
```
(Note: `BaseLayout` already renders `<slot name="head" />` in `<head>`.)

- [ ] **Step 4: Add Person schema to `src/pages/about.astro`**

Add the import:
```astro
import AgentSchema from '../components/AgentSchema.astro';
```
Render one per agent in the `<head>` slot — add above `<h1>Our Team</h1>`:
```astro
  {AGENTS.map((agent) => <AgentSchema slot="head" agent={agent} />)}
```

- [ ] **Step 5: Verify build + JSON-LD present**

Run: `npm run build && grep -q "RealEstateAgent" dist/index.html && grep -q '"@type":"Person"' dist/about/index.html && echo OK`
Expected: `OK`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: JSON-LD RealEstateAgent + Person structured data"
```

---

## Task 16: Favicon set, web manifest, default OG image

**Files:**
- Create: `public/favicon.svg`, `public/site.webmanifest`
- Create (binary, from logo): `public/favicon.ico`, `public/apple-touch-icon.png`, `public/og-default.png`

- [ ] **Step 1: Create a placeholder `public/favicon.svg`** (replace with the real brand mark — open-item-3)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0f0f0f"/>
  <text x="32" y="43" font-family="system-ui, sans-serif" font-size="34" font-weight="700"
    text-anchor="middle" fill="#c8a04e">DG</text>
</svg>
```

- [ ] **Step 2: Create `public/site.webmanifest`**

```json
{
  "name": "Derrick Garcia — Real Broker Ontario",
  "short_name": "Derrick Garcia",
  "icons": [
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ],
  "theme_color": "#0f0f0f",
  "background_color": "#ffffff",
  "display": "browser"
}
```

- [ ] **Step 3: Generate raster icons + OG image from the SVG/logo**

Generate `favicon.ico` (32px), `apple-touch-icon.png` (180×180), and a `og-default.png` (1200×630, brand + name). Use the Real Broker emblem (`src/assets/branding/real-emblem-gold.png`) or the placeholder SVG. Any tool is fine, e.g. with ImageMagick if available:
```bash
command -v convert && convert -background none public/favicon.svg -resize 180x180 public/apple-touch-icon.png \
  && convert -background none public/favicon.svg -resize 32x32 public/favicon.ico || \
  echo "TODO(open-item-3): generate favicon.ico, apple-touch-icon.png, og-default.png from the real brand mark"
```
If ImageMagick is unavailable, leave the `TODO(open-item-3)` note; the SVG favicon still works in modern browsers and the build does not fail. Provide a temporary 1200×630 `public/og-default.png` (solid brand color with the name) so social cards aren't broken.

- [ ] **Step 4: Verify build**

Run: `npm run build && test -f dist/favicon.svg && test -f dist/site.webmanifest && echo OK`
Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: favicon set, web manifest, default OG image (placeholder brand mark)"
```

---

## Task 17: Full-site verification

**Files:** none (verification only)

- [ ] **Step 1: Run the unit tests**

Run: `npm test`
Expected: PASS — all `mortgage-math` suites green.

- [ ] **Step 2: Clean build**

Run: `rm -rf dist && npm run build`
Expected: succeeds with no errors.

- [ ] **Step 3: Verify all routes built**

Run:
```bash
for p in index about contact mortgage-calculator affordability-calculator land-transfer-tax privacy accessibility thanks; do
  test -f "dist/$p/index.html" -o -f "dist/$p.html" && echo "ok $p" || echo "MISSING $p"
done
test -f dist/404.html && echo "ok 404" || echo "MISSING 404"
test -f dist/sitemap-index.xml && echo "ok sitemap" || echo "MISSING sitemap"
```
Expected: every line prints `ok ...`.

- [ ] **Step 4: Verify SEO essentials present on the home page**

Run: `grep -c -e 'rel="canonical"' -e 'og:title' -e 'application/ld+json' dist/index.html`
Expected: ≥ 3 (canonical, OG, JSON-LD all present).

- [ ] **Step 5: Preview locally and click through**

Run: `npm run preview` → visit every route; confirm calculators update live, the contact form renders, nav works, no console errors. Stop the server.

- [ ] **Step 6: Commit (if any fixups were needed)**

```bash
git add -A
git commit -m "test: full-site Phase 1 verification" --allow-empty
```

---

## Task 18: Production go-live runbook (manual — requires the user)

> **This task is operational, not code.** It changes live DNS and depends on spec open items. Do it WITH the
> user; do not automate DNS. Email continuity is the top risk.

- [ ] **Step 1: Resolve remaining open items** before go-live: Web3Forms access key(s); TidyCal booking URL;
  Cloudflare Web Analytics token; realtor.ca + Real Broker profile URLs (Derrick, Pina, Voula); Google Business
  Profile URL; real testimonials (Phase 2); licensed hero photo; final brand mark/favicon. Swap each
  `TODO(open-item-N)` placeholder and rebuild.

- [ ] **Step 2: Enable GitHub Pages** — push the repo to GitHub (user action), repo Settings → Pages →
  Source = **GitHub Actions**. Confirm the `Deploy to GitHub Pages` workflow runs green and the site is live
  on the temporary `*.github.io` URL. **Verify the whole site there before touching DNS.**

- [ ] **Step 3: Lower DNS TTL** on the current Lofty records to 300s at the registrar, ~24h before cutover.

- [ ] **Step 4: Cut over DNS** at the `.ca` registrar — keep MX/SPF/DKIM/TXT untouched (protect
  `info@derrickgarcia.ca`); replace only web records:
  - A `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - AAAA `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
  - CNAME `www` → `<github-username>.github.io`
  - Remove the old Lofty A/CNAME web records.

- [ ] **Step 5: Set custom domain + HTTPS** — repo Settings → Pages → Custom domain = `derrickgarcia.ca`;
  wait for the green check; enable **Enforce HTTPS**.

- [ ] **Step 6: Post-cutover verification**

Run (after propagation): `dig +short derrickgarcia.ca A` (expect the four GitHub IPs); confirm
`https://derrickgarcia.ca` serves the new site with a valid cert; **send a test email to
`info@derrickgarcia.ca` and confirm it still arrives**; submit the contact form and confirm the lead email +
autoresponder arrive; confirm Cloudflare Analytics registers the visit.

- [ ] **Step 7: Claim Google Search Console** for the new property, submit `https://derrickgarcia.ca/sitemap-index.xml`,
  and add the GSC verification. Decommission the Lofty site only after all of the above pass.

---

## Self-review (completed by plan author)

- **Spec coverage:** Astro+Pages+Actions (T1), layout/CSS/header/footer (T6), Canadian calculators incl. LTT
  (T2–T5, T9–T11), Web3Forms + TidyCal (T12), About/agents + listings link-out (T8, Header in T6), Home (T13),
  privacy/accessibility/404 (T14), JSON-LD/SEO/analytics/favicon/sitemap/robots (T6 head, T15, T16, T1),
  assets migration (T7), domain cutover keeping MX (T18). All spec §3–§7 + §10 Phase 1 items mapped.
- **Out of scope (correctly absent):** reviews page, evaluation/sell/rent-to-own landings, live reviews widget
  (spec Phase 2); IDX/blog (dropped).
- **Placeholders:** only genuine user-supplied config remains, each tagged `TODO(open-item-N)` with the build
  succeeding on placeholders (Web3Forms key, TidyCal URL, Cloudflare token, profile URLs, GBP, brand mark).
- **Type consistency:** `mortgage-math.js` exports used by islands match definitions — `paymentForFrequency`,
  `payment`, `cmhcPremium`, `maxAffordability`, `landTransferTax`; `SITE`/`AGENTS` shapes consistent across
  components.
```
