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
