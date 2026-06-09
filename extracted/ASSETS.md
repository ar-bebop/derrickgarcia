# Image assets inventory

Downloaded from the live Lofty site 2026-06-09. **Bottom line:** the only genuinely
Derrick-specific imagery is the 3 headshots + the Real Broker logos. Every hero/banner
is generic template stock — plan to replace those with owned/licensed photography.

## ✅ Real & reusable — `images/profile/` + `images/branding/`
| File | What |
|------|------|
| `profile/derrick-garcia.webp` (+ `-original.jpeg`) | Derrick Garcia headshot |
| `profile/pina-marrella.webp` (+ `-original.png`) | Pina Marrella headshot |
| `profile/voula-spingos.webp` (+ `-original.png`) | Voula Spingos headshot |
| `branding/real-wordmark-white.png` | "real" wordmark — Real Broker logo (white) |
| `branding/real-emblem-gold.png` | gold "real" circular emblem |

`-original.*` = full-res source; `.webp` = the w600 web version used on the live site.
Logos are **Real Broker** brokerage branding (Derrick's brokerage). No separate personal logo exists.

## ⚠️ Generic stock banners — `images/site/` (kept for layout reference only; DO NOT reuse)
| File | Page it was on | Content |
|------|----------------|---------|
| `hero-house-stone.webp` | home | luxury stone house (stock photo) |
| `hero-house-dusk-render.webp` | home | modern house at dusk (AI render) |
| `sell-hero.webp` | sell | = same stone house |
| `evaluation-hero.webp` | evaluation | stock living room |
| `contact-hero.webp` | contact | = same stock living room |
| `myteam-hero.webp` | myteam | stock "OFFICE" team photo (NOT Derrick's team) |
| `reviews-hero.webp` | reviews | stock agent-with-clients |
| `blog-index-hero.webp` | blog | stock dining room |
| `rent-to-own-1/2/3.webp` | rent-to-own | stock section graphics |
| `sitemap-graphic.webp` | sitemap | decorative |
| `contact-secondary.webp` | contact | 728 B — tiny placeholder/near-empty |

These shipped with the Lofty template or were dropped in by the prior builder. Source/licence
unknown — replace with owned or properly licensed images on the new site.

## ❌ NOT downloaded (deliberate)
- **~100+ MLS listing photos** (`img.chime.me/.../mls-listing/…`) — IDX-licensed, not ours.
- **Hotlinked editorial/stock** referenced in blog posts: storeys.com, shutterstock, schindler.com,
  realestatebay, istockphoto (watermarked), pngtree, a weebly upload. Unlicensed/hotlinked — don't reuse.
- **Favicon / app icons** (`static.chimeroi.com`) — Lofty's default "M" icon. New site needs its own.

## CSS — `css/`
- `styleAndTheme.css` (125 KB) — the site's theme/colour/font variables (siteId 127871). Best design reference.
- `css/modules/` — Lofty's module stylesheets. The layout the site uses:
  `md-header/layout3`, `md-hero/layout4`, `md-house/layout8`, `md-team/template8`,
  `md-testimonial/layout5`, `md-cta/layout2`, `md-footer/layout1`, `md-blog/layout1`.
