# Location ("Areas") Pages — Design

**Date:** 2026-06-10 · **Status:** approved (brainstorm with client rep)
**Phase:** 3 — local-SEO content. Decoupled from go-live; ships before or after DNS cutover.

## Goal

Rank in organic results (below the map pack) for town-scoped buyer/seller queries
("realtor caledon", "orangeville real estate agent", "selling a home in bolton") across
Derrick's actual selling area, without endangering the branded-query ranking the site
already holds. The map pack itself is a GBP problem (reviews, service-area settings) and
is out of scope here.

## Hard constraint: no doorway pages

Google's spam policies target near-duplicate town pages created to rank rather than to
help. The design enforces uniqueness by construction:

- Each town page is **free-form markdown** with a distinct thesis (below) — no shared
  section skeleton, no swap-the-town-name copy.
- The litmus test applied at review: *if the town name were swapped, the page must break.*
- Five pages at launch, written individually; future towns added one at a time, never in
  templated batches.

## Decisions (locked in brainstorm)

| Decision | Choice |
|----------|--------|
| Towns | Caledon, Bolton, Orangeville, Brampton, Mississauga |
| Content flow | Claude drafts from verifiable evergreen facts; Derrick reviews before launch |
| Market data | None. No prices, DOM, school ranks — nothing that rots on a static site |
| URLs | `/areas/` hub + `/areas/<town>/` |
| Architecture | New `areas` content collection mirroring `guides` |

## Architecture

```
src/content/config.ts            — add `areas` collection (zod schema below)
src/content/areas/caledon.md     — flagship
src/content/areas/bolton.md
src/content/areas/orangeville.md
src/content/areas/brampton.md
src/content/areas/mississauga.md
src/pages/areas/index.astro      — "Where we work" hub
src/pages/areas/[slug].astro     — town template
src/components/AreaSchema.astro  — per-town JSON-LD
```

No new dependencies. Existing `BaseLayout`, CTA components, and Midnight Estate tokens
throughout; no new visual system.

### Frontmatter schema (zod)

```ts
const areas = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),         // page H1, e.g. "Real estate in Caledon"
    description: z.string(),   // meta description
    town: z.string(),          // "Caledon"
    region: z.string(),        // "Peel Region" | "Dufferin County"
    order: z.number(),         // hub + nav ordering (Caledon first)
    date: z.string(),          // last-reviewed, same convention as guides
    geo: z.object({ lat: z.number(), lng: z.number() }),  // → schema areaServed
    ltt: z.enum(['provincial-only', 'toronto']),  // drives LTT callout copy + calc link
    heroPhoto: z.string().optional(),  // existing credited free-license photos only
  }),
});
```

All five launch towns are `ltt: 'provincial-only'`. The enum exists so a future
Toronto-proper page renders the correct callout instead of a false savings claim.

## Town template anatomy (`[slug].astro`)

1. Kicker: `Areas · {region}` → H1 ({title}) → reviewed date
2. Markdown body (the unique content)
3. **LTT callout** (when `provincial-only`): no Toronto municipal land-transfer tax
   applies in {town} — provincial LTT only — deep link to `/land-transfer-tax` calculator.
   Math claim is backed by the tested `mortgage-math.js` module.
4. CTA band: contact + home-valuation links, same components as existing pages
5. `AreaSchema` in head

The `<title>` tag is built in the template from `town` — pattern:
`Real Estate Agent in {town} — Derrick Garcia | Real Broker` (town-first to match query
order). Frontmatter `title` is only the on-page H1 and may differ.

## Per-town content briefs (each body's thesis)

- **caledon.md — flagship.** Derrick lives and is based here (bio-sourced). Rural vs.
  estate-subdivision split; well/septic due diligence on rural properties; Greenbelt
  designation and what it means for lot use; his construction background as the
  differentiator for older/rural housing stock. Longest page.
- **bolton.md — Caledon's commuter village.** Explicitly framed as part of Caledon
  (cross-link, no duplication): Highway 50 corridor, family subdivisions vs. village
  core, commute reality to Vaughan/Pearson employment. Cannibalization is the risk;
  the thesis split (rural estate vs. commuter village) is the mitigation.
- **orangeville.md — the value play.** Dufferin County prices vs. Peel; what a
  Toronto-condo budget buys; first-time-buyer angle → links affordability calculator +
  first-time-buyer guide.
- **brampton.md — the volume market.** Neighbourhood variety, GO corridors
  (Kitchener/GO bus network), commuter math → links mortgage calculator + stress-test guide.
- **mississauga.md — condo/freehold split.** Square One condo market vs. established
  freehold neighbourhoods; GO lines + Hurontario LRT; downtown-Toronto-vs-Mississauga
  trade-off.

### Accuracy rules (extends the repo's no-fabrication convention)

- Permitted without flagging: facts verifiable from authoritative public sources —
  LTT jurisdiction, Greenbelt status, existing transit lines/highways, municipal
  geography; Derrick facts already in his published bio.
- Flagged for Derrick's review (in the task PR description, never as shipped prose):
  any "known for / specializes in" claim, neighbourhood characterizations beyond
  geography, anything I could not verify.
- Banned: prices, averages, rankings, "hottest market" claims, fabricated anecdotes.

## Hub page (`/areas/index.astro`)

Targets "areas served" queries. Descriptive teaser per town (2–3 sentences, drawn from
each page's thesis — not a bare link list), ordered by `order`. Same head/section styling
as `/guides/`.

## SEO mechanics

- **JSON-LD per town** (`AreaSchema.astro`): `RealEstateAgent` (name, brokerage NAP,
  `url` = the area page) with `areaServed: { '@type': 'Place', name, geo }`.
- **Internal links in:** new "Areas" header dropdown (4th; `Header.astro` maps a
  `dropdowns` array, additive change); footer town links; About-page "serving" line;
  relevant guides/calculators link to matching towns.
- **Sitemap:** automatic via `@astrojs/sitemap`.
- **Measurement:** post-launch, Search Console queries/impressions per `/areas/` URL.
  Expansion to new towns only after existing pages show impressions (anti-batch rule).

## Verification

No new math → no new unit tests; existing 22 must stay green.
Per task: `pnpm build` (routes render; sitemap contains 5 + hub), `pnpm check` (0 errors),
grep `dist/areas/*/index.html` for `areaServed` JSON-LD, copy passes the swap-the-town-name
test, nav/footer links resolve.

## Out of scope

Map embeds, live market-data feeds, new photography, French content, GBP changes,
any redesign of existing pages beyond nav/footer/internal-link additions.
