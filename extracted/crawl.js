// Crawl Derrick's Lofty site behind the PoW anti-bot.
// Solves PoW once, reuses cookie, re-solves on challenge. Saves each page + logs status.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://derrickgarcia.ca';
const OUT = path.join(__dirname, 'pages');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

// Path -> output filename. Ours = rebuild targets; a couple IDX pages kept as layout reference.
const PAGES = {
  '/': 'home.html',
  '/myteam': 'myteam.html',
  '/agents/Derrick-Garcia/8814119': 'agent-derrick-garcia.html',
  '/agents/Pina-Marrella/8814844': 'agent-pina-marrella.html',
  '/agents/Voula-Spingos/8814845': 'agent-voula-spingos.html',
  '/blog?categoryId=0': 'blog-index.html',
  '/blog/Should-You-Sell-Before-You-Buy-in-Toronto-s-Market-': 'blog-sell-before-buy.html',
  '/blog/Top-5-Toronto-Neighbourhoods-for-First-Time-Homebuyers-in-2025': 'blog-top5-neighbourhoods.html',
  '/blog/What-You-Need-to-Know-About-Buying-Pre-Construction-in-Toronto': 'blog-preconstruction.html',
  '/contact': 'contact.html',
  '/evaluation': 'evaluation.html',
  '/affordability-calculator-1': 'affordability-calculator.html',
  '/mortgage-calculator-1': 'mortgage-calculator.html',
  '/accessibility': 'accessibility.html',
  '/featured-listing': 'featured-listing.html',
  '/listing': 'listing-search.html', // IDX search shell — layout reference only
  '/listing5-1': 'listing5-1.html',
  '/sell': 'sell.html',
  '/sold-listing': 'sold-listing.html',
  '/reviews': 'reviews.html',
  '/rent-to-own': 'rent-to-own.html',
  '/site/privacy-terms': 'privacy-terms.html',
  '/sitemap': 'sitemap.html',
  '/property-listings/sitemap': 'property-listings-sitemap.html',
};

const sha1 = s => crypto.createHash('sha1').update(s).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseChallenge(html) {
  const nonce = (html.match(/var nonce = '([^']+)'/) || [])[1];
  if (!nonce) return null;
  const difficulty = parseInt((html.match(/var difficulty = (\d+)/) || [])[1]);
  const _a = (html.match(/_a = '([^']+)'/) || [])[1] || '';
  const _b = (html.match(/_b = '([^']+)'/) || [])[1] || '';
  const _c = (html.match(/_c = '([^']+)'/) || [])[1] || '';
  return { nonce, difficulty, cf_pass: _a + _b + _c };
}

function solve(nonce, difficulty) {
  const target = '7'.repeat(difficulty), start = Date.now();
  for (let x = 0; x < 5e8; x++)
    if (sha1(nonce + x).slice(0, difficulty) === target) return { x, elapsed: Date.now() - start };
  throw new Error('no PoW solution');
}

async function getCookie() {
  const r = await fetch(ORIGIN + '/', { headers: { 'User-Agent': UA } });
  const ch = parseChallenge(await r.text());
  if (!ch) return ''; // already clear
  const s = solve(ch.nonce, ch.difficulty);
  return `cf_pow=${s.x}; cf_time=${s.elapsed}; cf_pass=${ch.cf_pass}`;
}

const isChallenge = html => html.includes('cf_retry') || html.includes('var nonce =');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let cookie = await getCookie();
  console.log('cookie acquired\n');
  const summary = [];
  for (const [p, file] of Object.entries(PAGES)) {
    let html, status;
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await fetch(ORIGIN + p, { headers: { 'User-Agent': UA, 'Cookie': cookie }, redirect: 'follow' });
      status = r.status; html = await r.text();
      if (isChallenge(html)) { cookie = await getCookie(); continue; } // re-solve, retry once
      break;
    }
    fs.writeFileSync(path.join(OUT, file), html);
    const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
    const challenged = isChallenge(html);
    summary.push({ file, status, bytes: html.length, challenged, title: title.slice(0, 70) });
    console.log(`${status} ${String(html.length).padStart(7)}B  ${file}${challenged ? '  [STILL BLOCKED]' : ''}`);
    await sleep(400);
  }
  fs.writeFileSync(path.join(OUT, '_crawl-summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nsaved', summary.length, 'pages to', OUT);
})();
