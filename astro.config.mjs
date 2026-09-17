import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://derrickgarcia.ca',
  integrations: [sitemap()],
  // Astro 7 changed the compressHTML default to 'jsx', which strips whitespace-only text
  // nodes BETWEEN inline elements. Across this site that removed ~12,800 `</a> <a>` gaps
  // (plus `</span> <button>`, `</button> <img>`, ...) on 801 of 807 pages, and inline-block
  // elements then render flush — measured on /areas/*: the two CTA buttons went from a
  // 3.2px gap to 0. `true` keeps the Astro 4/5/6 whitespace semantics the CSS was written
  // against. Revisit only alongside a deliberate pass to make that spacing explicit in CSS.
  compressHTML: true,
});
