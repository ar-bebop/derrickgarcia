// src/lib/ddf.js
// CREA DDF (Data Distribution Facility) data library — fetch + normalize MLS listings.
// Pure ESM, native fetch, no dependencies. Every network function takes an injectable
// fetchImpl (and injectable now/sleep) so tests never touch the network or wall clock.
// API facts probed live 2026-06-19/20 — re-verify against CREA before relying in production.

// Derrick Garcia's CREA MemberKey / ListAgentKey. Treat agent keys as STRINGS.
export const DERRICK_AGENT_KEY = '2088980';

// The four agent-key fields a listing can carry; a listing is "Derrick's" if ANY === his key.
const AGENT_KEY_FIELDS = ['ListAgentKey', 'CoListAgentKey', 'CoListAgentKey2', 'CoListAgentKey3'];

// OData $select — request only the fields the site renders (keeps payloads small).
export const SELECT_FIELDS = [
  'ListingKey', 'ListingId', 'ListingURL', 'UnparsedAddress', 'City',
  'StateOrProvince', 'PostalCode', 'ListPrice', 'BedroomsTotal',
  'BathroomsTotalInteger', 'PropertySubType', 'ListAgentKey',
  'CoListAgentKey', 'CoListAgentKey2', 'CoListAgentKey3', 'ListOfficeKey',
  'ListOfficeName', 'StandardStatus', 'PublicRemarks', 'Media',
  'PhotosCount', 'ModificationTimestamp', 'Latitude', 'Longitude',
];

// HTTP statuses worth retrying with backoff (throttling + transient server errors).
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

// Only "Active" MLS listings should ever be published on the site.
export function activeFilter() {
  return "StandardStatus eq 'Active'";
}

// Active listings where any of the four agent-key fields is Derrick's. Included for
// completeness; buildDatasets derives Derrick's set in memory instead (one feed pass).
export function derrickFilter() {
  const agentClause = AGENT_KEY_FIELDS
    .map((f) => `${f} eq '${DERRICK_AGENT_KEY}'`)
    .join(' or ');
  return `${activeFilter()} and (${agentClause})`;
}

// Full Property URL with $filter, $select, $top and $count=true. OData system query
// options must keep their LITERAL '$' prefix — URLSearchParams would percent-encode it
// ('$filter' -> '%24filter') and CREA's endpoint rejects that. So build the key=value
// pairs by hand with literal '$' and encode only the VALUES.
export function buildListingsUrl({ apiBase, filter, select, top }) {
  return `${apiBase}/Property`
    + `?$filter=${encodeURIComponent(filter)}`
    + `&$select=${encodeURIComponent(select.join(','))}`
    + `&$top=${encodeURIComponent(String(top))}`
    + '&$count=true';
}

// CREA's ListingURL is a realtor.ca deep link WITHOUT a scheme — prefix https://.
export function normalizeListingUrl(url) {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const CAD = new Intl.NumberFormat('en-CA', {
  style: 'currency', currency: 'CAD', maximumFractionDigits: 0,
});

export function formatPrice(n) {
  if (n === null || n === undefined) return null;
  return CAD.format(n);
}

// Photo Media items only (CREA inlines Documents/etc. in the same array).
function photoItems(media) {
  if (!Array.isArray(media)) return [];
  return media.filter((m) => m && m.MediaCategory === 'Photo');
}

// Primary photo: PreferredPhotoYN first, else lowest Order, else first. null if none.
export function primaryPhoto(media) {
  const photos = photoItems(media);
  if (photos.length === 0) return null;
  const preferred = photos.find((p) => p.PreferredPhotoYN === true);
  if (preferred) return preferred.MediaURL;
  const byOrder = [...photos].sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  return byOrder[0].MediaURL;
}

// All photo URLs, ascending by Order. [] when none.
export function sortedPhotoUrls(media) {
  return photoItems(media)
    .slice()
    .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))
    .map((p) => p.MediaURL);
}

// True if any of the four agent-key fields is Derrick's MemberKey.
export function isDerrickListing(raw) {
  return AGENT_KEY_FIELDS.some((f) => raw && raw[f] === DERRICK_AGENT_KEY);
}

// Map a raw DDF Property record to the site's render contract.
export function normalizeListing(raw) {
  return {
    id: raw.ListingKey,
    mlsNumber: raw.ListingId,
    url: normalizeListingUrl(raw.ListingURL),
    address: raw.UnparsedAddress,
    city: raw.City,
    province: raw.StateOrProvince,
    postalCode: raw.PostalCode,
    price: raw.ListPrice,
    priceFormatted: formatPrice(raw.ListPrice),
    beds: raw.BedroomsTotal,
    baths: raw.BathroomsTotalInteger,
    propertyType: raw.PropertySubType,
    primaryPhoto: primaryPhoto(raw.Media),
    photos: sortedPhotoUrls(raw.Media),
    photosCount: raw.PhotosCount,
    description: raw.PublicRemarks,
    brokerage: raw.ListOfficeName,
    isDerrick: isDerrickListing(raw),
    lat: raw.Latitude,
    lng: raw.Longitude,
    updatedAt: raw.ModificationTimestamp,
  };
}

// ---------------------------------------------------------------------------
// Network functions (all take fetchImpl = fetch so tests never hit the network)
// ---------------------------------------------------------------------------

// OAuth2 client_credentials token. expiresAt applies a 60s clock-skew safety margin.
export async function getToken({
  tokenUrl, clientId, clientSecret, scope,
  fetchImpl = fetch, now = () => Date.now(),
}) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });
  const res = await fetchImpl(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`DDF token request failed: ${res.status} ${detail}`);
  }
  const json = await res.json();
  return { token: json.access_token, expiresAt: now() + (json.expires_in - 60) * 1000 };
}

// Default sleep used by retry backoff (injectable so tests run instantly).
const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GET JSON with auth + resilience: refresh+retry once on 401, exponential backoff
// (with jitter) on 429/5xx up to maxRetries, throw on non-retryable errors.
export async function fetchJsonWithRetry(url, {
  token, fetchImpl = fetch, refreshToken, maxRetries = 3, sleep = defaultSleep,
}) {
  let bearer = token;
  let refreshedOnce = false;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
    });
    if (res.ok) return res.json();

    // 401: token likely expired — refresh once and retry immediately (no backoff).
    if (res.status === 401 && refreshToken && !refreshedOnce) {
      refreshedOnce = true;
      bearer = await refreshToken();
      continue;
    }

    // Retryable throttle / transient server error — back off (if attempts remain).
    if (RETRYABLE_STATUSES.has(res.status) && attempt < maxRetries) {
      const backoff = 2 ** attempt * 250; // 250ms, 500ms, 1s, ...
      const jitter = Math.random() * 250;
      await sleep(backoff + jitter);
      continue;
    }

    const detail = await safeText(res);
    throw new Error(`DDF request failed: ${res.status} ${url} ${detail}`);
  }
  throw new Error(`DDF request failed after ${maxRetries} retries: ${url}`);
}

// Follow @odata.nextLink to exhaustion, concatenating value arrays.
export async function fetchAllListings({
  apiBase, filter, select, top = 100,
  token, fetchImpl = fetch, refreshToken, sleep = defaultSleep,
}) {
  const records = [];
  let count = 0;
  let url = buildListingsUrl({ apiBase, filter, select, top });
  let first = true;

  // Thread the freshest bearer across pages: when fetchJsonWithRetry refreshes on a 401
  // it does so locally, so capture the new token here and reuse it on subsequent pages —
  // otherwise every page after expiry pays a wasted 401->refresh round-trip.
  let currentToken = token;
  const trackingRefresh = refreshToken
    ? async () => {
        currentToken = await refreshToken();
        return currentToken;
      }
    : undefined;

  while (url) {
    const page = await fetchJsonWithRetry(url, {
      token: currentToken, fetchImpl, refreshToken: trackingRefresh, sleep,
    });
    if (first) {
      count = page['@odata.count'] ?? 0;
      first = false;
    }
    if (Array.isArray(page.value)) records.push(...page.value);
    url = page['@odata.nextLink'] || null;
  }
  return { records, count };
}

// One active-filter paginated pass: normalize ALL records, derive Derrick's subset.
export async function buildDatasets({
  tokenUrl, clientId, clientSecret, scope, apiBase,
  fetchImpl = fetch, sleep = defaultSleep,
}) {
  const refreshToken = async () => {
    const { token } = await getToken({ tokenUrl, clientId, clientSecret, scope, fetchImpl });
    return token;
  };
  const { token } = await getToken({ tokenUrl, clientId, clientSecret, scope, fetchImpl });

  const { records, count } = await fetchAllListings({
    apiBase, filter: activeFilter(), select: SELECT_FIELDS,
    token, fetchImpl, refreshToken, sleep,
  });

  const all = records.filter(Boolean).map(normalizeListing);
  const derrick = all.filter((l) => l.isDerrick);
  return { all, derrick, count };
}

// Read a response body as text without throwing (best-effort error detail).
async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}
