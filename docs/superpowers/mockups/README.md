# Redesign mockups (brainstorm reference)

Interactive HTML mockups produced and approved during the 2026-06-20 listings-first redesign
brainstorm. They are the **visual source of truth** for the implementation plan
(`docs/superpowers/plans/2026-06-20-listings-first-redesign.md`).

- `direction.html` — the three aesthetic directions; **Direction A "Evolved Midnight" was chosen**.
- `homepage.html` — the full approved homepage (listings-first, surfaced info, motion).
- `listings.html` — the listings browse + map + detail-page flow.

Notes for implementers:

- These are standalone mockups. Image `src`s point at the brainstorm companion's `/files/…`
  paths and at `ddfcdn.realtor.ca`; the **structure, layout, CSS and motion** are the reference,
  not the asset URLs. Real components pull assets from `src/assets/**` and listing photos from the
  DDF data.
- Colours are hardcoded hex in the mockups. Port them to the design tokens — see the
  **token-mapping table** in the plan (e.g. `#0e0e10 → var(--color-bg)`, `#c6a15b → var(--color-accent)`,
  `#e7c987 → var(--color-accent-bright)`, `Space Grotesk → var(--font-ui)`).
- Mockup counts ("805 / $780K / 26") are illustrative; the real site derives them at build time.
