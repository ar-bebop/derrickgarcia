# Brainstorm research appendix — 2026-06-09

Detailed findings from the parallel research agents that informed the design spec. Kept because
the implementation (especially the Canadian calculator math) needs this detail.

---

## A. Lead forms (Web3Forms)

Free-tier comparison: **Web3Forms 250/mo** (free CAPTCHA built in, unlimited forms via per-form
access keys) beats Formspree (50/mo), Netlify Forms (100/mo but requires Netlify hosting — conflicts
with GitHub Pages), Basin (100/mo, cheapest paid at $8.25/mo), Getform (100), Formspark (250 lifetime,
not monthly).

- **Spam:** honeypot + time-trap (free, frictionless, every form) + Web3Forms' built-in **hCaptcha**
  on the highest-risk forms. Prefer hCaptcha/Turnstile over reCAPTCHA (Google cookies = worse PIPEDA posture).
- **Lead destinations on free:** email + autoresponder only. Google Sheets / Airtable / Telegram /
  Slack / webhooks are Web3Forms **Pro ($18/mo)** — or bridged free via Zapier/Make free tiers reading
  the notification email.
- **Multi-form:** one access key per form; distinct `subject` + `from_name` + redirect page each;
  shared 250/mo account pool; Gmail filters per subject = free pipeline view.
- **Gotchas:** access key is public in page source (spam protection essential; rotate if abused);
  30-day retention on free (email is system of record); PIPEDA consent notice + checkbox near forms;
  disclose US processing; test autoresponder deliverability.
- **Upgrade trigger:** Pro $18/mo at ~200/mo OR when native Sheets/Telegram/Slack routing wanted.
  Cheaper scale-only path: Basin $8.25/mo (backend switch). Stronger free product: Netlify Forms
  (if willing to move hosting off GitHub Pages).

---

## B. Calculators — Canadian math (implementation-critical)

**The current Lofty calculators are US templates** (monthly compounding, 30/40-yr fixed terms, HOA,
FHA, DTI 36%). Rebuild with Canadian math.

### B.1 Semi-annual compounding → periodic rate (THE critical gotcha)
Canadian **fixed-rate** mortgages compound **semi-annually** (Interest Act). Convert nominal annual
rate `r` to per-payment effective rate — NOT `r/12`:
```
i_p = (1 + r/2)^(2/p) - 1          // p = payments/year
// monthly (p=12): i = (1 + r/2)^(1/6) - 1
```
Using US `r/12` overstates the rate → payment slightly too high (a broker will notice).
Variable-rate mortgages often compound monthly (`r/12` correct only for variable) — MVP models fixed.

### B.2 Payment
```
n = amortization_years * p
PMT = P * i / (1 - (1 + i)^(-n))   // guard i==0 → P/n
```

### B.3 Payment frequencies
Let `M` = monthly payment. Monthly (12), semi-monthly (24, ~M/2), bi-weekly (26, re-derive),
**accelerated bi-weekly (26, pay M/2 → ≈13 monthly/yr, pays off years early — the Canadian selling
point)**, weekly (52), accelerated weekly (52, M/4). Show shortened payoff for accelerated.

### B.4 Amortization schedule
Per period: `interest = balance*i; principal = PMT-interest; balance -= principal`.

### B.5 Stress test (qualifying rate) — drives affordability
```
qualifying_rate = max(contract_rate + 0.02, 0.0525)   // 5.25% MQR is a policy floor — verify/date it
```
Payment SHOWN uses contract rate; affordability QUALIFIES at the qualifying rate.

### B.6 CMHC default insurance (down payment < 20%)
Premium = % of loan, **added to principal** (financed). Down-payment minimums: ≤$500k → 5%;
$500k–$1.5M → 5% on first $500k + 10% above; over $1.5M insurability cap → 20% min, no CMHC.
Premium by LTV (verify): 90.01–95% → 4.00%; 85.01–90% → 3.10%; 80.01–85% → 2.80%; ≤80% → 0%.
```
ltv = loan/price
premiumRate = ltv>0.90?0.04 : ltv>0.85?0.031 : ltv>0.80?0.028 : 0
financedLoan = loan + loan*premiumRate   // amortize this
```
Notes: insured amortization max 25yr (30yr for first-time/new-build — verify); Ontario charges 8% PST
on the premium (cash at closing, not financed); >25yr amortization adds a surcharge (optional MVP).

### B.7 Affordability — GDS/TDS
Canada uses two ratios, not US DTI. GDS limit ≈39% (insured), TDS ≈44%.
```
housing = mortgagePmt + propertyTax + heating + 0.5*condoFees   // 50% of condo fees, Canadian rule
GDS = housing / grossMonthlyIncome
TDS = (housing + otherDebts) / grossMonthlyIncome
```
Heating: fixed estimate (~$150/mo). Max purchase (invert at **qualifying** rate):
```
maxHousingByGDS = 0.39 * grossMonthlyIncome
maxHousingByTDS = 0.44 * grossMonthlyIncome - otherDebts
maxMonthlyHousing = min(...)
maxMortgagePmt = maxMonthlyHousing - propertyTax - heating - 0.5*condoFees
maxMortgage = maxMortgagePmt * (1 - (1+i_q)^(-n)) / i_q
maxPrice = maxMortgage + downPayment
// then re-check dp<20% → back out CMHC + enforce dp minimums; iterate property tax 2-3x for precision
```

### B.8 Ontario + Toronto Land Transfer Tax (bonus calculator)
`bracketTax(price, brackets[])` helper used twice.
- **Ontario LTT:** 0.5% ≤$55k; 1.0% $55k–$250k; 1.5% $250k–$400k; 2.0% $400k–$2M; 2.5% >$2M.
- **Toronto MLTT** (only if in City of Toronto): mirrors provincial brackets for common range + added
  luxury tiers >$3M (up to ~7.5% on portion >$20M — verify current schedule).
- **First-time-buyer rebates:** ON up to $4,000; Toronto up to $4,475; `min(cap, tax_owed)`, never negative.
```
totalLTT = ontarioLTT(price) + (inToronto ? torontoLTT(price) : 0)
         - (ftb ? min(4000, ontarioLTT) + (inToronto ? min(4475, torontoLTT) : 0) : 0)
```

### B.9 Engineering
- Build custom vanilla JS (Alpine.js optional). No good Canadian-specific JS lib exists; optionally
  borrow an MIT `PMT` helper but feed it the Canadian periodic rate.
- All policy numbers (MQR, CMHC tiers, $1.5M cap, LTT brackets, rebate caps, heating default) as
  **named, date-commented constants**. "Estimates only / not advice / not a pre-approval" disclaimer.
- Optional donut chart: Chart.js (MIT) or inline SVG.

---

## C. Booking / reviews / social

- **Booking:** Calendly DISQUALIFIED (no new iCloud connections since Aug 2024). Apple/iCloud-friendly,
  free, static-embeddable picks: **TidyCal** (free, two-way iCloud CalDAV, unlimited booking types,
  iframe/inline embed; badge — one-time ~$29 removes it) ◀ recommended; **Koalendar** (free iCloud,
  similar); **Cal.com** (open-source, free iCloud, multiple meeting types, badge removal paid).
  All CalDAV options need an Apple app-specific password; iCloud sync lag ~30–45 min.
- **Reviews:** MVP = hand-curated testimonial cards (real quotes, name + initial). Later: **Featurable**
  (only truly uncapped free Google-reviews widget, auto-refresh daily, "Powered by" backlink).
  Self-built Places API rejected (key can't be hidden on static). Don't scrape Maps into the repo.
- **Social:** styled icon links (lowest maintenance); optional 1–2 official IG post embeds. Avoid live
  feed widgets (break often, view-cap deactivation, paid, script/privacy weight).

---

## D. Hosting / stack (Astro)

- **Astro** chosen over plain HTML / 11ty / Hugo: shared layout components (no header/footer
  duplication), zero-JS by default, `.astro` reads like HTML, best GitHub Pages support. Plain HTML is
  the fallback only if "never touch a terminal" is a hard constraint.
- **Deploy:** GitHub Actions (`withastro/action@v6` → `actions/deploy-pages`), Source = GitHub Actions.
- **astro.config:** `site: 'https://derrickgarcia.ca'`, **no `base`** (apex serves from root — the
  `base:'/repo'` advice is the #1 mistake here). `CNAME` in `public/`.
- **DNS:** apex A → 185.199.108–111.153; AAAA → 2606:50c0:8000–8003::153; `www` CNAME → `<user>.github.io`.
  Enforce HTTPS after verify.
- **Cutover:** stage on `*.github.io` first; lower TTL 24h before; swap only web records; **KEEP MX**
  (don't break info@derrickgarcia.ca email); decommission Lofty after HTTPS green + propagation.
- **Images:** Astro `<Image>`/`<Picture>` (Sharp, build-time). Hero = eager + fetchpriority high (LCP);
  everything else lazy. No image CDN, no imagemin step.
- **CSS:** vanilla + custom properties (from `extracted/css/styleAndTheme.css`). Not Tailwind.
- **Listings link-out:** realtor.ca agent profile pattern `realtor.ca/agent/<ID>/<slug>` (ID must be
  looked up); Real Broker `onereal.com/profile/<slug>` + `onereal.ca/search-agent`. CTAs = plain
  `<a target=_blank rel=noopener>`. Optional small hand-curated featured cards (don't rehost MLS photos;
  default to auto-updating realtor.ca profile link if Derrick won't maintain cards).

---

## E. SEO / analytics / privacy / schema

- **Analytics:** **Cloudflare Web Analytics** (free, cookieless, JS beacon, works on plain GH Pages).
  Runner-up GoatCounter (free non-commercial). **Avoid GA4** (cookies → reintroduces consent banner).
- **Cookie banner:** none, IF cookieless analytics + no other non-essential cookies/pixels. Canadian law
  (PIPEDA, Quebec Law 25 strictest, CASL) requires opt-in for non-essential tracking — staying cookieless
  means nothing to consent to. Banner becomes required if GA4/Meta Pixel/YouTube (use youtube-nocookie)/
  retargeting is added.
- **Privacy policy:** still required (forms collect PII) — forms/PII + CASL doc, written fresh.
- **Accessibility:** carry over old statement (WCAG 2.1 AA; AODA-appropriate); actually meet AA basics.
- **SEO per page:** unique title/description/canonical; OG + Twitter; new favicon set + manifest
  (Lofty default dropped); robots.txt → sitemap.xml. Remove 5 stale Lofty `google-site-verification`
  tags + chimeroi scripts; add own GSC verification.
- **JSON-LD:** `RealEstateAgent` (home, shared `@id`, NAP, `sameAs` → IG/FB/GBP), `Person` per agent,
  `BreadcrumbList`. Skip listing/Residence schema (don't host the data).
- **Local SEO:** claim Google Business Profile (highest-ROI local lever); byte-identical NAP everywhere
  (`Derrick Garcia — Real Broker Ontario LTD`, `130 King St W, Unit 1800B, Toronto, ON M5X 1E3`,
  `+1 416-684-7370` / `tel:+14166847370`); neighbourhood-targeted homepage title/H1 (Toronto + GTA).
- **Total recurring cost: $0/mo.**
