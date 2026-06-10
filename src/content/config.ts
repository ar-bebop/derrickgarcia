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
