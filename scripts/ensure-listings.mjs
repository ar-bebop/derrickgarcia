// scripts/ensure-listings.mjs
// prebuild / predev guard. The generated datasets are CI-ephemeral and gitignored,
// so a contributor building without CREA creds has no src/data/generated/*.json.
// This writes empty STUBS only when a file is missing, guaranteeing the site's
// `import` of the generated JSON never breaks. It NEVER clobbers a file that
// already exists (which may hold real fetched data from fetch:listings).

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const OUT_DIR = 'src/data/generated';
const FILES = [`${OUT_DIR}/listings.json`, `${OUT_DIR}/listings-derrick.json`];
const STUB = { generatedAt: null, count: 0, listings: [] };

async function main() {
  for (const path of FILES) {
    if (existsSync(path)) continue;
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(path, `${JSON.stringify(STUB, null, 2)}\n`);
    console.log(`ensure-listings: created stub ${path}`);
  }
}

main().catch((err) => {
  console.warn(`ensure-listings: failed to create stubs: ${err.message}`);
});
