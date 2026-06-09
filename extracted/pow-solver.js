// Solve Lofty PoW anti-bot, fetch real page, print cookie string.
const crypto = require('crypto');

const URL = process.argv[2] || 'https://derrickgarcia.ca/';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

function sha1hex(s){ return crypto.createHash('sha1').update(s).digest('hex'); }

async function getChallenge(url){
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect:'follow' });
  const html = await r.text();
  return { html, status: r.status };
}

function parse(html){
  const nonce = (html.match(/var nonce = '([^']+)'/)||[])[1];
  const difficulty = parseInt((html.match(/var difficulty = (\d+)/)||[])[1]);
  const _a = (html.match(/_a = '([^']+)'/)||[])[1];
  const _b = (html.match(/_b = '([^']+)'/)||[])[1];
  const _c = (html.match(/_c = '([^']+)'/)||[])[1];
  if(!nonce) return null;
  return { nonce, difficulty, cf_pass: (_a||'')+(_b||'')+(_c||'') };
}

function solve(nonce, difficulty){
  const target = '7'.repeat(difficulty);
  const start = Date.now();
  for(let x=0; x<5e8; x++){
    if(sha1hex(nonce + x).slice(0,difficulty) === target){
      return { x, elapsed: Date.now()-start };
    }
  }
  throw new Error('no solution');
}

(async ()=>{
  const ch = await getChallenge(URL);
  const p = parse(ch.html);
  if(!p){ console.error('NO CHALLENGE — page may already be real. bytes='+ch.html.length); console.log('COOKIE='); process.exit(2); }
  const sol = solve(p.nonce, p.difficulty);
  const cookie = `cf_pow=${sol.x}; cf_time=${sol.elapsed}; cf_pass=${p.cf_pass}`;
  // verify by refetch
  const r2 = await fetch(URL, { headers: { 'User-Agent': UA, 'Cookie': cookie }, redirect:'follow' });
  const html2 = await r2.text();
  console.error(`solved x=${sol.x} diff=${p.difficulty} elapsed=${sol.elapsed}ms`);
  console.error(`refetch status=${r2.status} bytes=${html2.length}`);
  console.error('title=' + ((html2.match(/<title[^>]*>([^<]*)<\/title>/i)||[])[1]||'(none)'));
  console.log('COOKIE=' + cookie);
})();
