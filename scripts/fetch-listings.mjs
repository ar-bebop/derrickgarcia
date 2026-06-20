// scripts/fetch-listings.mjs
// CI / local data-pipeline entry point: fetch active CREA DDF listings and write
// the two generated JSON datasets the site imports. Must NEVER break the build —
// on any failure (or an empty active set) it writes EMPTY datasets and exits 0,
// emitting a GitHub Actions ::warning:: annotation so the failure is still visible.
//
// Env (loaded via Node's --env-file=.env locally; real env in CI):
//   CREA_DDF_TOKEN_URL, CREA_DDF_CLIENT_ID, CREA_DDF_CLIENT_SECRET,
//   CREA_DDF_SCOPE, CREA_DDF_API_BASE

import { mkdir, writeFile } from 'node:fs/promises';
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

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

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
    process.exit(0);
  }

  await writeDataset(OUT_ALL, all);
  await writeDataset(OUT_DERRICK, derrick);
  console.log(`Wrote ${all.length} active listings (${derrick.length} Derrick) to ${OUT_DIR}/`);
}

main().catch(async (err) => {
  console.log(`::warning::DDF fetch failed: ${err && err.message ? err.message : err}`);
  try {
    await writeEmpty();
  } catch (writeErr) {
    // Even the empty-write failed — surface it but still exit 0 (never break the build).
    console.log(`::warning::Also failed to write empty datasets: ${writeErr && writeErr.message ? writeErr.message : writeErr}`);
  }
  process.exit(0);
});
