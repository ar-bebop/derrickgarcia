// Typed accessor over the DDF/CREA listing data generated at build time by the fetch
// pipeline (see src/lib/ddf.js + scripts/). The two JSON files are gitignored and
// CI-ephemeral; an ensure-listings.mjs prebuild guard writes empty stubs when absent,
// so these imports never break (empty case → { generatedAt: null, count: 0, listings: [] }).
import listingsData from './generated/listings.json';
import derrickData from './generated/listings-derrick.json';

// Shape produced by normalizeListing() in src/lib/ddf.js — keep in sync.
export interface Listing {
  id: string;
  mlsNumber: string;
  url: string | null;
  address: string;
  city: string | null;
  province: string;
  postalCode: string;
  price: number | null;
  priceFormatted: string | null;
  beds: number | null;
  baths: number | null;
  propertyType: string | null;
  primaryPhoto: string | null;
  photos: string[];
  photosCount: number | null;
  description: string | null;
  brokerage: string | null;
  isDerrick: boolean;
  lat: number | null;
  lng: number | null;
  updatedAt: string | null;
}

// The empty-stub case infers `never[]` for `listings`, so cast through `unknown` to Listing[].
export const LISTINGS: Listing[] = listingsData.listings as unknown as Listing[];
export const DERRICK_LISTINGS: Listing[] = derrickData.listings as unknown as Listing[];
export const LISTINGS_GENERATED_AT: string | null = listingsData.generatedAt;

// GTA + the site's /areas towns, verified against the live feed. The Toronto boroughs
// (Etobicoke/North York/Scarborough/East York/York), Bolton, and Georgetown are currently
// subsumed under their parent municipality by the DDF `(City (Area))` convention, so they're
// defensive entries. This allowlist currently matches ~322 of ~805 active listings.
export const RELEVANT_MARKETS: string[] = [
  'Toronto', 'Etobicoke', 'North York', 'Scarborough', 'East York', 'York',
  'Mississauga', 'Brampton', 'Caledon', 'Bolton', 'Orangeville',
  'Vaughan', 'Markham', 'Richmond Hill',
  'Oakville', 'Burlington', 'Milton', 'Halton Hills', 'Georgetown',
  'Ajax', 'Pickering', 'Whitby', 'Oshawa',
  'Newmarket', 'Aurora', 'King',
];

// Uppercased allowlist, built once at module scope for exact-match comparison.
const RELEVANT_MARKETS_SET = new Set(RELEVANT_MARKETS.map((m) => m.toUpperCase()));

// True iff the listing's municipality is one of Derrick's relevant markets.
// The DDF city field uses a `City (Area)` convention, so we strip everything from the
// first `(` onward to recover the FULL municipality name (which may contain spaces, e.g.
// "Caledon (Bolton)" → "CALEDON", "Halton Hills" → "HALTON HILLS"), then match exactly.
export function inDerricksMarkets(listing: Listing): boolean {
  const city = listing.city ?? '';
  const parenIndex = city.indexOf('(');
  const municipality = (parenIndex >= 0 ? city.slice(0, parenIndex) : city).trim().toUpperCase();
  return RELEVANT_MARKETS_SET.has(municipality);
}
