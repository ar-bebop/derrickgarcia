# derrickgarcia.ca — full site snapshot

Crawled 2026-06-09 from the live Lofty site (behind its SHA-1 proof-of-work anti-bot).
24 real pages saved as raw HTML in `pages/`. Title pattern: *"<Page> - Derrick Garcia - Real Broker Ontario LTD."*

## Business info (from footer — use on new site)
- **Brokerage:** Real Broker Ontario LTD.
- **Agent:** Derrick Garcia
- **Phone:** +1 (416) 684-7370
- **Email:** info@derrickgarcia.ca
- **Office:** 130 King St W, Unit 1800B, Toronto, ON M5X 1E3
- **Instagram:** https://www.instagram.com/derrickgarcia__/
- **Facebook:** https://www.facebook.com/DerrickGarciaRealtor
- **Booking:** /meeting/844767391326472/derrick_garcia (Lofty-hosted → replace, e.g. Calendly)

## Navigation structure
```
Home
Buy ▾        → All Listings (/listing), Featured Listings (/featured-listing)
Sell ▾       → Sell My Home (/sell), Home Valuation (/evaluation), Recent Sold Listings (/sold-listing)
About ▾      → My Team (/myteam), Contact Us (/contact), Reviews (/reviews)
Rent to Own  → /rent-to-own
Deposit      → (nav item; target external/unknown)
Lending      → (nav item; target external/unknown)
Helpful Tools ▾ → Mortgage Calculator (/mortgage-calculator-1), Affordability Calculator (/affordability-calculator-1)
Register / Sign In  → CRM (STRIP)
Footer: Privacy/Terms (/site/privacy-terms), Cookie Policy, Sitemap (/sitemap), Accessibility (/accessibility)
```

## Pages captured (all in `pages/`)
| File | Route | Keep? | Notes |
|------|-------|-------|-------|
| home.html | `/` | ✅ rebuild | hero + featured + blog + team + CTA |
| myteam.html | `/myteam` | ✅ rebuild | 3 agents |
| agent-derrick-garcia.html | `/agents/Derrick-Garcia/8814119` | ✅ rebuild | bio |
| agent-pina-marrella.html | `/agents/Pina-Marrella/8814844` | ✅ rebuild | bio |
| agent-voula-spingos.html | `/agents/Voula-Spingos/8814845` | ✅ rebuild | bio |
| blog-index.html | `/blog` | ✅ rebuild | post list |
| blog-sell-before-buy.html | `/blog/Should-You-Sell-Before-You-Buy…` | ✅ rebuild | full article text |
| blog-top5-neighbourhoods.html | `/blog/Top-5-Toronto-Neighbourhoods…` | ✅ rebuild | full article text |
| blog-preconstruction.html | `/blog/What-You-Need-to-Know-About-Buying-Pre-Construction…` | ✅ rebuild | full article text |
| contact.html | `/contact` | ✅ rebuild | form (rewire to email/Formspree) |
| evaluation.html | `/evaluation` | ✅ rebuild | "what's my home worth" form |
| affordability-calculator.html | `/affordability-calculator-1` | ✅ rebuild | JS calculator |
| mortgage-calculator.html | `/mortgage-calculator-1` | ✅ rebuild | JS calculator |
| sell.html | `/sell` | ✅ rebuild | seller landing |
| rent-to-own.html | `/rent-to-own` | ✅ rebuild | program landing (3 graphics) |
| reviews.html | `/reviews` | ✅ rebuild | testimonials |
| accessibility.html | `/accessibility` | ✅ rebuild | statement |
| privacy-terms.html | `/site/privacy-terms` | ✅ rebuild | legal |
| sitemap.html | `/sitemap` | ➖ regen | auto-generate on new site |
| property-listings-sitemap.html | `/property-listings/sitemap` | ➖ regen | listings sitemap |
| featured-listing.html | `/featured-listing` | ❌ IDX | MLS feed |
| listing-search.html | `/listing` | ❌ IDX | MLS search shell (layout ref) |
| listing5-1.html | `/listing5-1` | ❌ IDX | MLS search variant (layout ref) |
| sold-listing.html | `/sold-listing` | ❌ IDX | MLS sold feed |

## STRIP — IDX/MLS (licensed feed, cannot rehost on static site)
- All listing/search/sold pages above + `/listing-detail/<id>/…` + home "Featured Listings" grid.
- ~100+ MLS listing photos (`img.chime.me/.../mls-listing/…`) — NOT downloaded.
- **Replace with:** an IDX widget (IDX Broker / iHomefinder / Real Broker search) or link-out.
- **Keep the IDX disclaimer** if any listings shown:
  > "IDX information is provided exclusively for consumers' personal, non-commercial use… deemed reliable but not guaranteed."

## STRIP — CRM/account
- Register / Sign In, saved searches, favourites, the Lofty PoW + iframe guard.

## Rebuild gotchas found
1. Home "Work With Us" CTA still has Lofty **template default text**: *"…experts for Colorado Luxury Real Estate."* — Derrick is in Ontario. Rewrite.
2. All hero/banner images are **generic stock** (see ASSETS.md) — only headshots + logos are real.
3. Forms post to Lofty CRM endpoints — rewire to a static-friendly handler (Formspree/Netlify Forms/email).
