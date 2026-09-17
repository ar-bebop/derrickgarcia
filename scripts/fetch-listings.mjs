// scripts/fetch-listings.mjs
// CI / local data-pipeline entry point: fetch active CREA DDF listings and write
// the two generated JSON datasets the site imports. Must NEVER break the build —
// on any failure (or an empty active set) it writes EMPTY datasets and exits 0,
// emitting a GitHub Actions ::warning:: annotation so the failure is still visible.
//
// Env (loaded via Node's --env-file=.env locally; real env in CI):
//   CREA_DDF_TOKEN_URL, CREA_DDF_CLIENT_ID, CREA_DDF_CLIENT_SECRET,
//   CREA_DDF_SCOPE, CREA_DDF_API_BASE

import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { buildDatasets } from '../src/lib/ddf.js';

const OUT_DIR = 'src/data/generated';
const OUT_ALL = `${OUT_DIR}/listings.json`;
const OUT_DERRICK = `${OUT_DIR}/listings-derrick.json`;

// The .env / CI secret holds the API HOST ROOT (e.g. https://ddfapi.realtor.ca).
// buildDatasets calls `${apiBase}/Property`, so apiBase must be the full OData
// service root. The `/odata/v1` service path is a fixed CREA API contract, not a
// deployment detail, so we append it here rather than baking it into the secret.
function normalizeApiBase(raw) {
  const trimmed = String(raw || '').replace(/\/+$/, '');
  return trimmed.endsWith('/odata/v1') ? trimmed : `${trimmed}/odata/v1`;
}

// Publish the active-listing count as a GitHub Actions step output so the workflow can
// alert on an EMPTY feed (see .github/workflows/deploy.yml). This script deliberately
// never fails the build, which means an empty feed otherwise deploys behind a green
// check — that is how the 2026-07-24 CREA breaking change hid for eight weeks.
// Best-effort and swallowed: reporting must never itself break the build.
async function reportCount(count) {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) return;
  try {
    await appendFile(out, `count=${count}\n`);
  } catch {
    // ignore — the ::warning::/::error:: annotations still carry the signal
  }
}

async function writeDataset(path, listings) {
  const payload = {
    generatedAt: new Date().toISOString(),
    count: listings.length,
    listings,
  };
  await writeFile(path, `${JSON.stringify(payload, null, 2)}\n`);
}

async function writeEmpty() {
  await mkdir(OUT_DIR, { recursive: true });
  await writeDataset(OUT_ALL, []);
  await writeDataset(OUT_DERRICK, []);
}

// Env vars buildDatasets needs; surfaced up-front so a missing secret produces an
// actionable warning rather than an opaque token/fetch failure deeper in the pipeline.
// Thrown here, this is still caught by the top-level main().catch graceful path
// (warning + empty datasets + exit 0), so the build never breaks.
const REQUIRED_ENV = ['CREA_DDF_TOKEN_URL', 'CREA_DDF_CLIENT_ID', 'CREA_DDF_CLIENT_SECRET', 'CREA_DDF_SCOPE', 'CREA_DDF_API_BASE'];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing required env vars: ${missing.join(', ')}`);

  const apiBase = normalizeApiBase(process.env.CREA_DDF_API_BASE);
  const { all, derrick } = await buildDatasets({
    tokenUrl: process.env.CREA_DDF_TOKEN_URL,
    clientId: process.env.CREA_DDF_CLIENT_ID,
    clientSecret: process.env.CREA_DDF_CLIENT_SECRET,
    scope: process.env.CREA_DDF_SCOPE,
    apiBase,
  });

  // An empty active set means a broken fetch — derrick being 0 is normal/expected.
  if (all.length === 0) {
    console.log('::warning::DDF fetch returned 0 active listings — wrote empty datasets.');
    await writeEmpty();
    await reportCount(0);
    process.exit(0);
  }

  await writeDataset(OUT_ALL, all);
  await writeDataset(OUT_DERRICK, derrick);
  await reportCount(all.length);
  console.log(`Wrote ${all.length} active listings (${derrick.length} Derrick) to ${OUT_DIR}/`);
}

main().catch(async (err) => {
  console.log(`::warning::DDF fetch failed: ${err && err.message ? err.message : err}`);
  await reportCount(0);
  try {
    await writeEmpty();
  } catch (writeErr) {
    // Even the empty-write failed — surface it but still exit 0 (never break the build).
    console.log(`::warning::Also failed to write empty datasets: ${writeErr && writeErr.message ? writeErr.message : writeErr}`);
  }
  process.exit(0);
});
