# Location ("Areas") Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Five town pages (Caledon, Bolton, Orangeville, Brampton, Mississauga) plus an `/areas/` hub, targeting local organic queries without doorway-page risk.

**Architecture:** New `areas` Astro content collection mirroring the existing `guides` pattern: free-form markdown bodies (uniqueness by construction) + zod frontmatter feeding a shared town template and per-page `areaServed` JSON-LD. Inbound links added to header, footer, About, the LTT calculator page, and two guides.

**Tech Stack:** Astro 4 content collections, zod, vanilla CSS (existing Midnight Estate tokens). No new dependencies. **pnpm, not npm.**

**Spec:** `docs/superpowers/specs/2026-06-10-location-pages-design.md` — read it first; the accuracy rules and anti-doorway constraints there govern every content task.

**Conventions that bind every task:**
- Commit after each task; **never `git push`**. End commit messages with the
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` trailer (or the running model's standard trailer).
- The 22 existing unit tests must stay green (`pnpm test`).
- Page copy is final, reviewed prose — do not "improve" it while implementing. If a fact looks wrong, stop and flag it; do not invent a replacement.

---

### Task 1: `areas` content collection schema

**Files:**
- Modify: `src/content/config.ts`

- [ ] **Step 1: Replace the entire file with:**

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

const areas = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),         // on-page H1 (the <title> tag is built from `town` in the template)
    description: z.string(),   // meta description
    teaser: z.string(),        // 2–3 sentence hub-page teaser
    town: z.string(),          // "Caledon"
    region: z.string(),        // "Peel Region" | "Dufferin County"
    order: z.number(),         // hub + nav ordering
    date: z.string(),          // last-reviewed date
    geo: z.object({ lat: z.number(), lng: z.number() }),
    // Drives the LTT callout: every launch town is outside Toronto, so 'provincial-only'.
    // 'toronto' exists so a future Toronto page can't render a false savings claim.
    ltt: z.enum(['provincial-only', 'toronto']),
    heroPhoto: z.string().optional(),  // existing credited free-license photos only
  }),
});

export const collections = { guides, areas };
```

- [ ] **Step 2: Verify**

Run: `pnpm check`
Expected: `0 errors` (warnings about an empty `areas` collection are fine at this point)

Run: `pnpm build`
Expected: `24 page(s) built`, exit 0

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(areas): content collection schema for town pages"
```

---

### Task 2: Caledon content (flagship)

**Files:**
- Create: `src/content/areas/caledon.md`

- [ ] **Step 1: Create the file with exactly this content:**

```markdown
---
title: "Real estate in Caledon"
description: "Country properties, estate lots, and village living in Peel's rural third — with a broker who lives here and knows how rural homes are built."
teaser: "Derrick's home turf. Rural properties, estate subdivisions, and villages from Belfountain to Palgrave — a market where wells, septic, and the Greenbelt are half the conversation."
town: "Caledon"
region: "Peel Region"
order: 1
date: "2026-06-10"
geo: { lat: 43.8667, lng: -79.8667 }
ltt: provincial-only
---

Caledon is the rural third of Peel — the region's largest municipality by land area and,
by design, its least built-up. While Brampton and Mississauga grew into cities, Caledon's
hills, farms, and villages stayed largely as they were. That is not an accident of
geography; it is planning policy, and understanding it is the difference between buying
well here and buying blind.

## A town that is really a dozen places

Caledon is not one market. Bolton, its largest community, is a genuine commuter town and
has [its own page](/areas/bolton). Caledon East and Caledon Village offer serviced
small-town streets; Alton, Belfountain, Cheltenham, Inglewood, and Palgrave are hamlets
where character homes sit next to working farms; and between them lie the rural roads
where estate lots and country properties live. Prices, due diligence, and even what your
mortgage lender wants to see differ across all of these.

## What the Greenbelt means when you buy

Large parts of Caledon fall under Ontario's Greenbelt Plan, the Oak Ridges Moraine
Conservation Plan, or the Niagara Escarpment Plan. Two practical consequences. First,
land that can be developed is permanently scarce, which underpins long-term value here.
Second, what you can do with a rural property — sever a lot, add a structure, change a
use — is a planning question with a real answer, not a guess. We check before you offer,
not after.

## Wells, septic, and the questions city buyers forget

Outside the serviced villages, many Caledon homes run on a private well and septic
system. That is entirely normal here — but it changes the inspection list: water
potability and flow, septic age and condition, and heating that is often propane or oil
rather than gas. None of it should scare you off; all of it should be priced and
verified before closing.

## A broker who builds

Derrick lives in Caledon and spent over a decade in construction before real estate.
On rural and older properties that matters: he reads structure, drainage, and renovation
quality first-hand instead of guessing from the listing photos. If you are weighing a
century farmhouse against a new estate build, that is the conversation to have —
[start it here](/contact).
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: exit 0 (the file is validated against the schema even before a page consumes it)

- [ ] **Step 3: Commit**

```bash
git add src/content/areas/caledon.md
git commit -m "feat(areas): Caledon flagship page content"
```

---

### Task 3: JSON-LD component + town template

**Files:**
- Create: `src/components/AreaSchema.astro`
- Create: `src/pages/areas/[slug].astro`

- [ ] **Step 1: Create `src/components/AreaSchema.astro`:**

```astro
---
import { SITE } from '../data/site.ts';
const { area } = Astro.props;
const data = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: SITE.name,
  url: `${SITE.url}/areas/${area.slug}`,
  telephone: SITE.phoneDisplay,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
  areaServed: {
    '@type': 'Place',
    name: `${area.data.town}, Ontario`,
    geo: { '@type': 'GeoCoordinates', latitude: area.data.geo.lat, longitude: area.data.geo.lng },
  },
};
---
<script type="application/ld+json" is:inline set:html={JSON.stringify(data)} />
```

- [ ] **Step 2: Create `src/pages/areas/[slug].astro`:**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import AreaSchema from '../../components/AreaSchema.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const areas = await getCollection('areas');
  return areas.map((a) => ({ params: { slug: a.slug }, props: { area: a } }));
}
const { area } = Astro.props;
const { Content } = await area.render();
const { town, region, title, description, date, ltt } = area.data;
---
<BaseLayout title={`Real Estate Agent in ${town} — Derrick Garcia | Real Broker`} description={description}>
  <AreaSchema slot="head" area={area} />
  <article class="container article">
    <header>
      <p class="kicker"><a href="/areas">Areas</a> · {region}</p>
      <h1>{title}</h1>
      <p class="dek">{description}</p>
      <p class="dated">Reviewed {date}</p>
    </header>
    <div class="prose"><Content /></div>
    {ltt === 'provincial-only' && (
      <aside class="ltt reveal">
        <h2>One land transfer tax, not two</h2>
        <p>{town} is outside the City of Toronto, so Toronto's municipal land transfer tax
          does not apply here — buyers pay Ontario's provincial LTT only. On a typical
          detached purchase that is a five-figure difference.</p>
        <p><a class="btn" href="/land-transfer-tax">Calculate your land transfer tax</a></p>
      </aside>
    )}
    <section class="cta">
      <h2>Thinking about {town}?</h2>
      <p>Tell us what you're planning — buying, selling, or just weighing options.</p>
      <p><a class="btn" href="/contact">Get in Touch</a>
        <a class="btn btn--ghost" href="/home-valuation">What's My Home Worth?</a></p>
    </section>
  </article>
</BaseLayout>
<style>
  .article { padding-block: clamp(2.5rem, 7vw, 4rem) var(--section-pad); max-width: 820px; }
  .article h1 { max-width: 22ch; }
  .dek { font-size: 1.1rem; max-width: 58ch; }
  .dated { color: var(--color-muted); font-size: .8rem; border-bottom: 1px solid var(--color-line);
    padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
  .kicker a { color: inherit; text-decoration: none; }
  .ltt { border: 1px solid var(--color-line); padding: 1.5rem 1.7rem; margin-top: 2.5rem; }
  .ltt h2 { margin-top: 0; font-size: 1.25rem; }
  .cta { border-top: 1px solid var(--color-line); margin-top: 2.5rem; padding-top: 2rem; }
  .cta h2 { font-size: 1.4rem; }
</style>
```

- [ ] **Step 3: Verify**

Run: `pnpm build`
Expected: `25 page(s) built` (24 + caledon)

Run: `grep -c 'areaServed' dist/areas/caledon/index.html`
Expected: `1`

Run: `grep -c 'One land transfer tax, not two' dist/areas/caledon/index.html`
Expected: `1`

Run: `pnpm check`
Expected: `0 errors`

- [ ] **Step 4: Commit**

```bash
git add src/components/AreaSchema.astro src/pages/areas/
git commit -m "feat(areas): town template with areaServed JSON-LD and LTT callout"
```

---

### Task 4: Bolton content

**Files:**
- Create: `src/content/areas/bolton.md`

- [ ] **Step 1: Create the file with exactly this content:**

```markdown
---
title: "Bolton real estate"
description: "Caledon's commuter village: the Humber valley core, the hill subdivisions, and what the Highway 427 extension changed about getting to work."
teaser: "Caledon's largest community and its true commuter base — a historic village core in the Humber valley, family subdivisions on the hills, and Vaughan and Pearson within practical reach."
town: "Bolton"
region: "Peel Region"
order: 2
date: "2026-06-10"
geo: { lat: 43.8758, lng: -79.7306 }
ltt: provincial-only
---

Bolton is where Caledon stops being rural. It is the town's largest community by far —
a real commuter centre with subdivisions, schools, and a main street, surrounded on
every side by the countryside that the rest of [Caledon](/areas/caledon) is known for.
If you want Caledon's address and a conventional family neighbourhood, Bolton is
usually where the search lands.

## A village that became a commuter town

The old village core sits down in the Humber River valley, and the newer Bolton grew
up the hills on either side. That history still shapes the market: character homes and
walkable main-street amenities below, larger family subdivisions above. The two feel
different, price differently, and suit different buyers — worth deciding which Bolton
you are shopping for before you book showings.

## The commute, honestly

Bolton has no GO train. The practical commute is Highway 50 south, and it improved
meaningfully when the Highway 427 extension opened — Vaughan's employment lands and
the Pearson airport area are now a more direct drive than they used to be. If your
work is downtown Toronto, be honest about the drive-then-train math; if it is in
Vaughan, Woodbridge, or around the airport, Bolton's case gets strong.

## Bolton or the rest of Caledon?

The trade is straightforward: Bolton gives you services, neighbours, and a five-minute
grocery run; rural Caledon gives you land and quiet, with [well-and-septic due
diligence](/areas/caledon) as part of the deal. We work both daily — if you are torn,
[talk it through with us](/contact) before you anchor on either.
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: `26 page(s) built`

Run: `grep -c 'areaServed' dist/areas/bolton/index.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/content/areas/bolton.md
git commit -m "feat(areas): Bolton page content"
```

---

### Task 5: Orangeville content

**Files:**
- Create: `src/content/areas/orangeville.md`

- [ ] **Step 1: Create the file with exactly this content:**

```markdown
---
title: "Real estate in Orangeville"
description: "The value play just past Peel: a real main street, first-time-buyer-friendly math, and what commuting from Dufferin County actually looks like."
teaser: "Dufferin's county seat and the classic move for buyers priced out of Peel — a genuine downtown on Broadway, and purchase math that is kinder to first-time buyers."
town: "Orangeville"
region: "Dufferin County"
order: 3
date: "2026-06-10"
geo: { lat: 43.9199, lng: -80.0943 }
ltt: provincial-only
---

Keep driving north on Highway 10 past Caledon and you reach Orangeville, the seat of
Dufferin County. For years it has been the pragmatic answer for buyers who want a
detached house and a yard without Peel pricing — close enough to keep your job, far
enough to change your mortgage.

## The value case

Orangeville has historically offered more house per dollar than Peel's communities to
its south. That gap is the whole reason many buyers look here, and it compounds with
the tax math below. The honest counterweight is the commute — so weigh both, not one.

## A real main street

This is not a subdivision with a plaza. Broadway is a working downtown — shops,
restaurants, Theatre Orangeville — and Island Lake Conservation Area sits on the
town's edge. The housing stock runs from century homes near the core to newer
subdivisions at the edges, which keeps the market interesting at several price points.

## Commuting from Dufferin

Be clear-eyed: the commute is Highway 10 south toward Brampton and the 410, and GO bus
service connects Orangeville to Brampton's transit network. There is no GO train. For
hybrid and remote workers the math has improved dramatically; for a five-day downtown
commute, it is a real cost to price in.

## First home? The math is friendlier here

Two structural advantages for first-time buyers: Orangeville charges only Ontario's
provincial land transfer tax (no Toronto municipal tax), and the provincial first-time
buyer rebate of up to $4,000 stretches further on Orangeville prices. Run your numbers
through the [affordability calculator](/affordability-calculator) and read the
[first-time buyer guide](/guides/first-time-buyer-toronto) — then
[come talk](/contact) about what is actually listing here.
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: `27 page(s) built`

Run: `grep -c 'areaServed' dist/areas/orangeville/index.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/content/areas/orangeville.md
git commit -m "feat(areas): Orangeville page content"
```

---

### Task 6: Brampton content

**Files:**
- Create: `src/content/areas/brampton.md`

- [ ] **Step 1: Create the file with exactly this content:**

```markdown
---
title: "Real estate in Brampton"
description: "Peel's volume market: distinct neighbourhood characters, three GO stations on the Kitchener line, and budgets that live or die on the stress test."
teaser: "One of Canada's youngest, fastest-growing big cities. Three GO stations, neighbourhoods from heritage downtown to new transit-built suburbs — and a market where the stress test decides budgets."
town: "Brampton"
region: "Peel Region"
order: 4
date: "2026-06-10"
geo: { lat: 43.6850, lng: -79.7600 }
ltt: provincial-only
---

Brampton is Peel's volume market — one of Canada's largest and youngest big cities,
where more first homes and move-up purchases happen than anywhere else we work. The
scale cuts both ways: there is always inventory, and there is always competition.

## Pick your Brampton

The city's neighbourhoods genuinely differ, and the right one depends on what you are
optimizing for. Mount Pleasant in the northwest was built around its GO station —
newer stock, commuter-first. Downtown around Gage Park holds the heritage homes and
the oldest streets. Bramalea offers mature lots and 60s–70s housing that renovators
look for. Springdale and Castlemore run to larger, newer family and executive homes.
Treat "Brampton" as five searches, not one.

## Three GO stations

Mount Pleasant, Brampton (downtown), and Bramalea all sit on the Kitchener GO line
into Union Station, and Brampton Transit's Züm bus rapid transit network feeds them.
For a downtown-Toronto commute, proximity to one of the three stations is a real
pricing factor — and a real resale factor when you sell.

## Budget first, neighbourhood second

In a market this competitive, the buyers who win are the ones who know their ceiling
before they bid. Canada's mortgage stress test qualifies you at your contract rate
plus 2% (with a 5.25% floor) — run the [mortgage calculator](/mortgage-calculator)
and the [stress test guide](/guides/mortgage-stress-test) before you fall in love
with a street. Then [tell us what you found](/contact) and we will tell you if it
matches what homes are actually trading at.
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: `28 page(s) built`

Run: `grep -c 'areaServed' dist/areas/brampton/index.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/content/areas/brampton.md
git commit -m "feat(areas): Brampton page content"
```

---

### Task 7: Mississauga content

**Files:**
- Create: `src/content/areas/mississauga.md`

- [ ] **Step 1: Create the file with exactly this content:**

```markdown
---
title: "Real estate in Mississauga"
description: "Two markets in one city: the Square One condo cluster and the freehold villages — plus the GO lines and LRT that change the commute math."
teaser: "A condo skyline around Square One and freehold villages like Port Credit and Streetsville — two different markets sharing one city, tied together by two GO lines and the new LRT."
town: "Mississauga"
region: "Peel Region"
order: 5
date: "2026-06-10"
geo: { lat: 43.5890, lng: -79.6441 }
ltt: provincial-only
---

Mississauga is one of Canada's largest cities, and it behaves like two markets wearing
one name. Around Square One stands a true high-rise condo district; spread across the
rest of the city are established freehold neighbourhoods that predate the skyline.
Buyers who treat them as one market mis-shop both.

## The City Centre condo market

The towers around Square One offer the closest thing Peel has to downtown-Toronto
condo living — and typically at a discount to comparable Toronto product. For
first-time buyers and downsizers it is a serious option. Condo diligence matters
here: we review the status certificate, the reserve fund, and the fee history before
you firm up, because a low list price with troubled finances is not a deal.

## The freehold villages

Port Credit on the lake, Streetsville's main street, Clarkson, Erin Mills, Meadowvale —
Mississauga's freehold neighbourhoods each grew around their own core and still feel
like it. Lakefront-village walkability and 1970s family streets are different products
at different prices; the common thread is land, which the condo market cannot offer.

## Transit that actually changes the math

Two GO lines serve the city — Lakeshore West through Port Credit and Clarkson, and the
Milton line through Cooksville, Erindale, Streetsville, Meadowvale, and Lisgar — and
the Hazel McCallion LRT line runs along the Hurontario corridor. Proximity to any of
these is priced in, and worth paying for if you commute: it holds value when you sell.

## Toronto or Mississauga?

The classic comparison: a Toronto address against more space — or newer build — in
Mississauga, with only the provincial land transfer tax to pay on this side of the
border. The callout below shows what that one difference is worth;
[the rest of the comparison](/contact) is a conversation we have weekly.
```

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: `29 page(s) built`

Run: `grep -c 'areaServed' dist/areas/mississauga/index.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/content/areas/mississauga.md
git commit -m "feat(areas): Mississauga page content"
```

---

### Task 8: Areas hub page

**Files:**
- Create: `src/pages/areas/index.astro`

- [ ] **Step 1: Create the file:**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
const areas = (await getCollection('areas')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title="Areas We Serve — Caledon, Bolton, Orangeville, Brampton, Mississauga | Derrick Garcia"
  description="Where the Derrick Garcia team actually works: Caledon, Bolton, Orangeville, Brampton, and Mississauga — with a local page on what matters in each market.">
  <section class="head container">
    <p class="kicker">Areas</p>
    <h1>Where we work.</h1>
    <p class="dek">We don't claim every postal code in Ontario. These are the markets we know
      street by street — each page covers what actually decides a purchase or sale there.</p>
  </section>
  <section class="container list">
    {areas.map((a) => (
      <a class="row reveal" href={`/areas/${a.slug}`}>
        <div>
          <h2>{a.data.town}</h2>
          <p>{a.data.teaser}</p>
        </div>
        <span class="meta">{a.data.region} →</span>
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

- [ ] **Step 2: Verify**

Run: `pnpm build`
Expected: `30 page(s) built`

Run: `grep -o 'href="/areas/[a-z]*"' dist/areas/index.html | sort -u`
Expected: five hrefs (bolton, brampton, caledon, mississauga, orangeville)

- [ ] **Step 3: Commit**

```bash
git add src/pages/areas/index.astro
git commit -m "feat(areas): hub page listing the five towns"
```

---

### Task 9: Header dropdown + footer column

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: In `Header.astro`, add an Areas entry to the `dropdowns` array.** After the `Tools` entry (ends `]},` with the Land Transfer Tax item) and before the `About` entry, insert:

```ts
  { label: 'Areas', items: [
    { href: '/areas/caledon', label: 'Caledon' },
    { href: '/areas/bolton', label: 'Bolton' },
    { href: '/areas/orangeville', label: 'Orangeville' },
    { href: '/areas/brampton', label: 'Brampton' },
    { href: '/areas/mississauga', label: 'Mississauga' },
    { href: '/areas', label: 'All Areas' },
  ]},
```

**Index shift warning:** `About` is now `dropdowns[3]`. In the nav markup, the About `<details>` block maps `dropdowns[2].items` — change it to `dropdowns[3].items`.

- [ ] **Step 2: In `Header.astro` nav markup, insert the Areas dropdown** between `<li><a href="/guides">Guides</a></li>` and the About `<li>`:

```astro
        <li>
          <details class="dd">
            <summary>Areas</summary>
            <ul class="dd__menu">
              {dropdowns[2].items.map((i) => <li><a href={i.href}>{i.label}</a></li>)}
            </ul>
          </details>
        </li>
```

(`dropdowns[2]` is now Areas given the insertion position in Step 1; About becomes `dropdowns[3]`.)

- [ ] **Step 3: In `Footer.astro`, insert an Areas column** between the `Tools` nav and the `Connect` nav:

```astro
      <nav aria-label="Areas">
        <h2>Areas</h2>
        <a href="/areas/caledon">Caledon</a>
        <a href="/areas/bolton">Bolton</a>
        <a href="/areas/orangeville">Orangeville</a>
        <a href="/areas/brampton">Brampton</a>
        <a href="/areas/mississauga">Mississauga</a>
        <a href="/areas">All Areas</a>
      </nav>
```

- [ ] **Step 4: Verify**

Run: `pnpm build`
Expected: `30 page(s) built`

Run: `grep -c 'href="/areas/caledon"' dist/index.html`
Expected: `2` (header dropdown + footer)

Run: `grep -o '<summary>[A-Za-z]*</summary>' dist/index.html`
Expected: `Sell`, `Tools`, `Areas`, `About` (in that order)

Manually check `pnpm dev`: desktop dropdown opens, mobile panel shows Areas group.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro
git commit -m "feat(areas): header dropdown and footer column"
```

---

### Task 10: Inbound internal links (About, LTT calculator, two guides)

**Files:**
- Modify: `src/pages/about.astro:13-14`
- Modify: `src/pages/land-transfer-tax.astro:15-16`
- Modify: `src/content/guides/toronto-land-transfer-tax.md` (final paragraph)
- Modify: `src/content/guides/first-time-buyer-toronto.md` (final paragraph)

- [ ] **Step 1: `about.astro` — extend the lede.** Replace:

```astro
    <p class="lede">We are committed to maintaining the standard for excellence and leadership. Our primary
      goal is to provide the highest level of service to our clients through integrity.</p>
```

with:

```astro
    <p class="lede">We are committed to maintaining the standard for excellence and leadership. Our primary
      goal is to provide the highest level of service to our clients through integrity.
      We work where we live: <a href="/areas">Caledon, Bolton, Orangeville, Brampton, and Mississauga</a>.</p>
```

- [ ] **Step 2: `land-transfer-tax.astro` — extend the footer note.** Replace:

```astro
    <p class="more">Why does Toronto charge it twice?
      Read <a href="/guides/toronto-land-transfer-tax">the double land transfer tax guide</a>.</p>
```

with:

```astro
    <p class="more">Why does Toronto charge it twice?
      Read <a href="/guides/toronto-land-transfer-tax">the double land transfer tax guide</a> —
      or see <a href="/areas">the areas we serve</a>, all outside Toronto, where only the
      provincial tax applies.</p>
```

- [ ] **Step 3: `toronto-land-transfer-tax.md` — link the towns in the closing paragraph.** Replace the final paragraph:

```markdown
Weighing a Toronto address against a 905 alternative? [Ask Derrick](/contact) — the tax
difference is real money, and it should be part of the conversation, not a closing-day
surprise.
```

with:

```markdown
Weighing a Toronto address against a 905 alternative? Every community we serve —
[Caledon](/areas/caledon), [Bolton](/areas/bolton), [Orangeville](/areas/orangeville),
[Brampton](/areas/brampton), and [Mississauga](/areas/mississauga) — charges only the
provincial tax. [Ask Derrick](/contact) — the difference is real money, and it should be
part of the conversation, not a closing-day surprise.
```

- [ ] **Step 4: `first-time-buyer-toronto.md` — add the Orangeville cross-link.** In the final "Talk it through" paragraph, replace:

```markdown
Every situation has wrinkles — gifted down payments, variable income, condo fees. If you
want a straight answer about yours, [contact Derrick](/contact). No pressure, no spam —
just the numbers as they apply to you.
```

with:

```markdown
Every situation has wrinkles — gifted down payments, variable income, condo fees. If you
want a straight answer about yours, [contact Derrick](/contact). No pressure, no spam —
just the numbers as they apply to you. And if the Toronto numbers will not work, look at
[Orangeville](/areas/orangeville) — the same rebates stretch further there.
```

- [ ] **Step 5: Verify**

Run: `pnpm build`
Expected: `30 page(s) built`

Run: `grep -c 'href="/areas' dist/about/index.html dist/land-transfer-tax/index.html dist/guides/toronto-land-transfer-tax/index.html dist/guides/first-time-buyer-toronto/index.html`
Expected: every file ≥ 1 beyond the header/footer baseline (spot-check the body links render)

- [ ] **Step 6: Commit**

```bash
git add src/pages/about.astro src/pages/land-transfer-tax.astro src/content/guides/
git commit -m "feat(areas): inbound links from About, LTT calculator, and guides"
```

---

### Task 11: Docs, Derrick-review checklist, final verification

**Files:**
- Modify: `TODO.md` (§3)
- Modify: `CLAUDE.md` (pages list)

- [ ] **Step 1: `TODO.md` — add to §3 (content inputs from Derrick):**

```markdown
- **Area pages fact review (Phase 3)** — the five `/areas/` pages ship evergreen,
  verifiable facts only, but Derrick should confirm the local characterizations before
  go-live: Bolton core-vs-hills framing; Brampton neighbourhood sketches (Mount Pleasant /
  downtown–Gage Park / Bramalea / Springdale–Castlemore); Mississauga freehold-village
  list; Orangeville "more house per dollar than Peel" framing; Caledon hamlet list.
  Also his call: add towns later one at a time (never in batches — see the spec's
  anti-doorway rules, docs/superpowers/specs/2026-06-10-location-pages-design.md).
```

- [ ] **Step 2: `CLAUDE.md` — update the built-pages list.** In `## Architecture & decisions (locked)`, replace:

```markdown
- **Pages (Phases 1+2, built):** Home · About/Team · Contact · 3 calculators · Sell · Home-Valuation ·
  Rent-to-Own · Reviews (config-driven, ships with honest empty state) · Guides (4 articles) ·
  Privacy · Accessibility · 404 · legacy-URL redirect stubs. **Deferred (own plan):** DDF/MLS
  listings integration; optional live Google-reviews widget.
```

with:

```markdown
- **Pages (Phases 1+2, built):** Home · About/Team · Contact · 3 calculators · Sell · Home-Valuation ·
  Rent-to-Own · Reviews (config-driven, ships with honest empty state) · Guides (4 articles) ·
  Privacy · Accessibility · 404 · legacy-URL redirect stubs. **Phase 3 (built):** `/areas/` hub +
  5 town pages (Caledon · Bolton · Orangeville · Brampton · Mississauga) — local-SEO content,
  anti-doorway rules in the 2026-06-10 spec. **Deferred (own plan):** DDF/MLS listings
  integration; optional live Google-reviews widget.
```

- [ ] **Step 3: Full verification suite**

```bash
pnpm build    # 30 page(s) built
pnpm check    # 0 errors
pnpm test     # 22 passed
grep -c '/areas/' dist/sitemap-0.xml          # ≥ 6 (hub + 5 towns)
for t in caledon bolton orangeville brampton mississauga; do
  grep -c 'areaServed' "dist/areas/$t/index.html"; done   # 1 ×5
```

- [ ] **Step 4: Swap-the-town-name spot check (manual).** Open any two town pages in `pnpm preview`; confirm no shared section skeleton and that swapping town names would break each page's content.

- [ ] **Step 5: Commit**

```bash
git add TODO.md CLAUDE.md
git commit -m "docs: record Phase 3 area pages; Derrick fact-review checklist"
```

---

## Self-review notes (already applied)

- Spec coverage: schema ✓ (T1), 5 town bodies with distinct theses ✓ (T2,4–7), template + LTT callout + CTA ✓ (T3), `areaServed` JSON-LD ✓ (T3), hub with teasers ✓ (T8), header/footer ✓ (T9), About/guides/calculator inbound links ✓ (T10), measurement note + review checklist ✓ (T11). Heat-map/measurement itself is post-launch Search Console work — no task needed.
- Type consistency: `area.data.{town,region,title,description,date,ltt,geo,teaser,order}` matches the zod schema in T1 everywhere; `area.slug` is Astro's built-in collection slug.
- Header index shift (`dropdowns[2]` → Areas, `dropdowns[3]` → About) is called out explicitly in T9 — it is the one trap in this plan.
```