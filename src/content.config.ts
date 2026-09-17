import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Astro 6 deprecates the `z` re-export from 'astro:content' (ts(6385) on every use).
// astro/zod is the supported path and is the same zod instance astro validates with.
import { z } from 'astro/zod';

// Content Layer API (Astro 5+). `base` keeps the markdown where it already lives, so entry
// ids — and therefore every /guides/* and /areas/* URL — are unchanged from the legacy
// `type: 'content'` collections this replaces.
const guides = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/guides' }),
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
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/areas' }),
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
