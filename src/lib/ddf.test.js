// src/lib/ddf.test.js
import { describe, it, expect } from 'vitest';
import {
  DERRICK_AGENT_KEY,
  SELECT_FIELDS,
  OFFICE_SELECT_FIELDS,
  activeFilter,
  derrickFilter,
  buildListingsUrl,
  normalizeListingUrl,
  formatPrice,
  primaryPhoto,
  sortedPhotoUrls,
  isDerrickListing,
  isActiveListing,
  normalizeListing,
  getToken,
  fetchJsonWithRetry,
  fetchAllPages,
  fetchAllListings,
  fetchOfficeNameMap,
  buildDatasets,
} from './ddf.js';
import sample from './__fixtures__/ddf-sample.json' with { type: 'json' };

const API_BASE = 'https://ddfapi.realtor.ca/odata/v1';

describe('constants', () => {
  it('Derrick agent key is the string MemberKey', () => {
    expect(DERRICK_AGENT_KEY).toBe('2088980');
  });
  it('SELECT_FIELDS contains the exact required fields', () => {
    expect(SELECT_FIELDS).toEqual([
      'ListingKey', 'ListingId', 'ListingURL', 'UnparsedAddress', 'City',
      'StateOrProvince', 'PostalCode', 'ListPrice', 'BedroomsTotal',
      'BathroomsTotalInteger', 'PropertySubType', 'ListAgentKey',
      'CoListAgentKey', 'CoListAgentKey2', 'CoListAgentKey3', 'ListOfficeKey',
      'StandardStatus', 'PublicRemarks', 'Media',
      'PhotosCount', 'ModificationTimestamp', 'Latitude', 'Longitude',
    ]);
  });
  it('SELECT_FIELDS keeps ListOfficeKey but NOT the nonexistent ListOfficeName', () => {
    // ListOfficeName does not exist on Property; selecting it 400s the whole query.
    expect(SELECT_FIELDS).toContain('ListOfficeKey');
    expect(SELECT_FIELDS).not.toContain('ListOfficeName');
  });
  it('OFFICE_SELECT_FIELDS is the Office key + name join fields', () => {
    expect(OFFICE_SELECT_FIELDS).toEqual(['OfficeKey', 'OfficeName']);
  });
});

describe('activeFilter / derrickFilter', () => {
  // REGRESSION GUARD (broke live ~2026-07): CREA removed StandardStatus from the
  // filterable property set. `$filter=StandardStatus eq 'Active'` now 400s the WHOLE
  // query -> 0 listings. The DDF member feed only distributes Active listings, so the
  // status restriction moved server-side-off / in-memory (see isActiveListing).
  it('activeFilter returns null — StandardStatus is NOT filterable on the DDF API', () => {
    expect(activeFilter()).toBeNull();
  });
  it('no filter helper ever puts StandardStatus in $filter', () => {
    expect(String(activeFilter())).not.toContain('StandardStatus');
    expect(derrickFilter()).not.toContain('StandardStatus');
  });
  it('derrickFilter restricts to any of the four agent-key fields', () => {
    const f = derrickFilter();
    expect(f).toContain("ListAgentKey eq '2088980'");
    expect(f).toContain("CoListAgentKey eq '2088980'");
    expect(f).toContain("CoListAgentKey2 eq '2088980'");
    expect(f).toContain("CoListAgentKey3 eq '2088980'");
  });
});

describe('isActiveListing', () => {
  it('accepts an explicitly Active record', () => {
    expect(isActiveListing({ StandardStatus: 'Active' })).toBe(true);
  });
  it('rejects an explicitly non-Active record', () => {
    expect(isActiveListing({ StandardStatus: 'Sold' })).toBe(false);
    expect(isActiveListing({ StandardStatus: 'Expired' })).toBe(false);
  });
  // Fail OPEN, not closed: the feed only distributes Active listings, so a missing
  // status must not silently empty the whole site (that is the failure we just had).
  it('accepts a record with no StandardStatus at all', () => {
    expect(isActiveListing({})).toBe(true);
    expect(isActiveListing({ StandardStatus: null })).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(isActiveListing({ StandardStatus: 'active' })).toBe(true);
  });
});

describe('normalizeListingUrl', () => {
  it('prefixes https:// when the scheme is missing', () => {
    expect(normalizeListingUrl('www.realtor.ca/real-estate/28705430/x'))
      .toBe('https://www.realtor.ca/real-estate/28705430/x');
  });
  it('leaves an existing scheme alone', () => {
    expect(normalizeListingUrl('https://www.realtor.ca/x'))
      .toBe('https://www.realtor.ca/x');
  });
  it('returns null for blank/nullish', () => {
    expect(normalizeListingUrl('')).toBeNull();
    expect(normalizeListingUrl(null)).toBeNull();
    expect(normalizeListingUrl(undefined)).toBeNull();
  });
});

describe('formatPrice', () => {
  it('formats CAD with no decimals', () => {
    expect(formatPrice(650000)).toBe('$650,000');
  });
  it('returns null for null/undefined', () => {
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(undefined)).toBeNull();
  });
});

describe('primaryPhoto', () => {
  it('prefers PreferredPhotoYN even when its Order is not the lowest', () => {
    // fixture: pref photo is Order 3; other photos are Order 1,2
    expect(primaryPhoto(sample.derrickListing.Media))
      .toBe('https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_pref.jpg');
  });
  it('falls back to lowest Order when none preferred', () => {
    const media = [
      { MediaURL: 'b.jpg', Order: 2, PreferredPhotoYN: false, MediaCategory: 'Property Photo' },
      { MediaURL: 'a.jpg', Order: 1, PreferredPhotoYN: false, MediaCategory: 'Property Photo' },
    ];
    expect(primaryPhoto(media)).toBe('a.jpg');
  });
  it('returns null when there are no photos', () => {
    expect(primaryPhoto(sample.otherAgent.Media)).toBeNull();
    expect(primaryPhoto([])).toBeNull();
    expect(primaryPhoto(undefined)).toBeNull();
  });
  it('ignores non-photo media (Office Logo / Document) when choosing the primary', () => {
    const media = [
      { MediaURL: 'logo.png', Order: 0, PreferredPhotoYN: true, MediaCategory: 'Office Logo' },
      { MediaURL: 'doc.pdf', Order: 0, PreferredPhotoYN: true, MediaCategory: 'Document' },
      { MediaURL: 'photo.jpg', Order: 5, PreferredPhotoYN: false, MediaCategory: 'Property Photo' },
    ];
    expect(primaryPhoto(media)).toBe('photo.jpg');
  });
});

describe('sortedPhotoUrls', () => {
  it('returns photo URLs sorted by ascending Order', () => {
    expect(sortedPhotoUrls(sample.derrickListing.Media)).toEqual([
      'https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_1.jpg',
      'https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_2.jpg',
      'https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_pref.jpg',
    ]);
  });
  it('excludes non-photo media categories (Office Logo, Document)', () => {
    // the Office Logo + Document items in the fixture must not appear; /photo/i excludes them.
    const urls = sortedPhotoUrls(sample.derrickListing.Media);
    expect(urls).not.toContain('https://ddfcdn.realtor.ca/listing/TSabc/docs/floorplan.pdf');
    expect(urls).not.toContain('https://ddfcdn.realtor.ca/listing/TSabc/logo/office-logo.png');
    // only the three "Property Photo" items survive
    expect(urls).toHaveLength(3);
  });
  it('returns [] for empty / no-photo / nullish media', () => {
    expect(sortedPhotoUrls([])).toEqual([]);
    expect(sortedPhotoUrls(sample.otherAgent.Media)).toEqual([]);
    expect(sortedPhotoUrls(undefined)).toEqual([]);
  });
});

describe('isDerrickListing', () => {
  it('true when ListAgentKey is Derrick', () => {
    expect(isDerrickListing(sample.derrickListing)).toBe(true);
  });
  it('true when a co-list agent key is Derrick', () => {
    expect(isDerrickListing(sample.coListDerrick)).toBe(true);
  });
  it('false when no agent field matches', () => {
    expect(isDerrickListing(sample.otherAgent)).toBe(false);
  });
  it('false for an empty record', () => {
    expect(isDerrickListing({})).toBe(false);
  });
});

describe('normalizeListing', () => {
  // Office-name map joined on ListOfficeKey. otherAgent's office (770000) is intentionally
  // ABSENT so its brokerage resolves to null (never an invented name).
  const officeNameByKey = Object.fromEntries(
    sample.offices.map((o) => [o.OfficeKey, o.OfficeName]),
  );
  const n = normalizeListing(sample.derrickListing, officeNameByKey);
  it('maps every render-contract field correctly', () => {
    expect(n).toEqual({
      id: '28705430',
      mlsNumber: 'X12331537',
      url: 'https://www.realtor.ca/real-estate/28705430/123-example-st-peterborough',
      address: '123 Example St',
      city: 'Peterborough (Northcrest Ward 5)',
      province: 'Ontario',
      postalCode: 'K9J 1A1',
      price: 650000,
      priceFormatted: '$650,000',
      beds: 6,
      baths: 2,
      propertyType: 'Single Family',
      primaryPhoto: 'https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_pref.jpg',
      photos: [
        'https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_1.jpg',
        'https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_2.jpg',
        'https://ddfcdn.realtor.ca/listing/TSabc/highres/7/x12331537_pref.jpg',
      ],
      photosCount: 5,
      description: 'Spacious 6-bed family home in Northcrest.',
      brokerage: 'REAL BROKER ONTARIO LTD.',
      isDerrick: true,
      lat: 44.3091,
      lng: -78.3197,
      updatedAt: '2026-06-18T14:03:22Z',
    });
  });
  it('prefixes the ListingURL scheme', () => {
    expect(n.url.startsWith('https://')).toBe(true);
  });
  it('priceFormatted is CAD with no decimals', () => {
    expect(n.priceFormatted).toBe('$650,000');
  });
  it('brokerage resolves from the Office-name map via ListOfficeKey', () => {
    expect(n.brokerage).toBe('REAL BROKER ONTARIO LTD.');
  });
  it('brokerage is null when ListOfficeKey is absent from the office map', () => {
    // otherAgent.ListOfficeKey 770000 is not in officeNameByKey → null (no invented name).
    expect(normalizeListing(sample.otherAgent, officeNameByKey).brokerage).toBeNull();
  });
  it('brokerage is null when called with no office map (default {})', () => {
    expect(normalizeListing(sample.derrickListing).brokerage).toBeNull();
  });
  it('marks a non-Derrick listing isDerrick: false', () => {
    expect(normalizeListing(sample.otherAgent, officeNameByKey).isDerrick).toBe(false);
  });
});

describe('buildListingsUrl', () => {
  const url = buildListingsUrl({
    apiBase: API_BASE,
    filter: derrickFilter(),
    select: SELECT_FIELDS,
    top: 100,
  });
  // The production listings pass sends NO $filter (activeFilter() === null).
  const unfiltered = buildListingsUrl({
    apiBase: API_BASE,
    filter: activeFilter(),
    select: SELECT_FIELDS,
    top: 100,
  });
  it('omits $filter entirely when the filter is null', () => {
    expect(unfiltered).not.toContain('$filter');
    expect(unfiltered).not.toContain('filter=');
    expect(unfiltered.startsWith(`${API_BASE}/Property?$select=`)).toBe(true);
    expect(unfiltered).toContain('$top=100');
    expect(unfiltered).toContain('$count=true');
    expect(unfiltered).not.toContain('%24');
  });
  it('targets the Property endpoint', () => {
    expect(url.startsWith(`${API_BASE}/Property?`)).toBe(true);
  });
  // OData system query options MUST keep a literal '$' — assert on the RAW url so a
  // regression to URLSearchParams (which encodes '$' -> '%24') is caught immediately.
  it('uses LITERAL $-prefixed OData params (never %24)', () => {
    expect(url).toContain('$filter=');
    expect(url).toContain('$select=');
    expect(url).toContain('$top=');
    expect(url).toContain('$count=true');
    expect(url).not.toContain('%24');
  });
  // The value side must still be percent-encoded: the filter has spaces (encodeURIComponent
  // leaves "'" literal, which is valid in a query value). The '$' before 'filter' stays literal.
  it('percent-encodes the $filter VALUE (literal $, encoded spaces)', () => {
    expect(decodeURIComponent(url)).toContain("ListAgentKey eq '2088980'");
    expect(url).toContain("$filter=");
    // the filter value must not contain raw spaces
    expect(url).not.toMatch(/\$filter=[^&]*\s/);
  });
  it('includes the filter, $top and $count=true (decoded)', () => {
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("ListAgentKey eq '2088980'");
    expect(decoded).toContain('$top=100');
    expect(decoded).toContain('$count=true');
  });
  it('includes every field in the $select list (decoded)', () => {
    const decoded = decodeURIComponent(url);
    for (const field of SELECT_FIELDS) {
      expect(decoded).toContain(field);
    }
  });
  it('selects ListOfficeKey but never the nonexistent ListOfficeName', () => {
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('ListOfficeKey');
    expect(decoded).not.toContain('ListOfficeName');
  });
});

describe('getToken', () => {
  it('POSTs form-urlencoded creds and applies the 60s skew', async () => {
    let captured;
    const fetchImpl = async (url, opts) => {
      captured = { url, opts };
      return {
        ok: true,
        json: async () => ({ access_token: 'tok-abc', token_type: 'Bearer', expires_in: 3600 }),
      };
    };
    const now = () => 1_000_000;
    const result = await getToken({
      tokenUrl: 'https://identity.crea.ca/connect/token',
      clientId: 'cid', clientSecret: 'secret', scope: 'DDFApi_Read',
      fetchImpl, now,
    });

    expect(result).toEqual({ token: 'tok-abc', expiresAt: 1_000_000 + (3600 - 60) * 1000 });
    expect(captured.url).toBe('https://identity.crea.ca/connect/token');
    expect(captured.opts.method).toBe('POST');
    expect(captured.opts.headers['Content-Type']).toBe('application/x-www-form-urlencoded');

    const body = new URLSearchParams(captured.opts.body);
    expect(body.get('grant_type')).toBe('client_credentials');
    expect(body.get('client_id')).toBe('cid');
    expect(body.get('client_secret')).toBe('secret');
    expect(body.get('scope')).toBe('DDFApi_Read');
  });

  it('throws a clear error on a non-OK response', async () => {
    const fetchImpl = async () => ({ ok: false, status: 401, text: async () => 'bad creds' });
    await expect(getToken({
      tokenUrl: 't', clientId: 'c', clientSecret: 's', scope: 'DDFApi_Read', fetchImpl,
    })).rejects.toThrow('DDF token request failed');
  });
});

describe('fetchJsonWithRetry', () => {
  const noSleep = async () => {};
  it('retries on 429 then succeeds', async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls++;
      if (calls === 1) return { ok: false, status: 429, text: async () => 'rate limited' };
      return { ok: true, json: async () => ({ value: ['ok'] }) };
    };
    const json = await fetchJsonWithRetry('u', { token: 't', fetchImpl, sleep: noSleep });
    expect(json).toEqual({ value: ['ok'] });
    expect(calls).toBe(2);
  });

  it('refreshes the token and retries once on 401', async () => {
    let calls = 0;
    const bearers = [];
    const fetchImpl = async (_url, opts) => {
      calls++;
      bearers.push(opts.headers.Authorization);
      if (calls === 1) return { ok: false, status: 401, text: async () => 'expired' };
      return { ok: true, json: async () => ({ value: ['ok'] }) };
    };
    let refreshed = 0;
    const refreshToken = async () => { refreshed++; return 'fresh-token'; };
    const json = await fetchJsonWithRetry('u', {
      token: 'stale-token', fetchImpl, refreshToken, sleep: noSleep,
    });
    expect(json).toEqual({ value: ['ok'] });
    expect(refreshed).toBe(1);
    expect(bearers[0]).toBe('Bearer stale-token');
    expect(bearers[1]).toBe('Bearer fresh-token');
  });

  it('throws after retries are exhausted on persistent 5xx', async () => {
    let calls = 0;
    const fetchImpl = async () => { calls++; return { ok: false, status: 503, text: async () => 'down' }; };
    await expect(fetchJsonWithRetry('u', {
      token: 't', fetchImpl, maxRetries: 2, sleep: noSleep,
    })).rejects.toThrow('DDF request failed');
    // initial try + 2 retries
    expect(calls).toBe(3);
  });

  it('throws immediately on a non-retryable 4xx', async () => {
    let calls = 0;
    const fetchImpl = async () => { calls++; return { ok: false, status: 400, text: async () => 'bad' }; };
    await expect(fetchJsonWithRetry('u', { token: 't', fetchImpl, sleep: noSleep }))
      .rejects.toThrow('DDF request failed');
    expect(calls).toBe(1);
  });
});

describe('fetchAllPages', () => {
  const noSleep = async () => {};
  const INITIAL = `${API_BASE}/Property?$top=100&$count=true`;

  it('returns { records, count } from the first page count, concatenated across 2 pages', async () => {
    const page2Url = `${API_BASE}/Property?$skiptoken=abc`;
    const fetchImpl = async (url) => {
      if (url.includes('$skiptoken')) {
        // page 2: no count of its own — only the first page's count is authoritative.
        return { ok: true, json: async () => ({ '@odata.count': 999, value: [{ k: 3 }] }) };
      }
      return {
        ok: true,
        json: async () => ({
          '@odata.count': 7,
          '@odata.nextLink': page2Url,
          value: [{ k: 1 }, { k: 2 }],
        }),
      };
    };
    const { records, count } = await fetchAllPages(INITIAL, {
      token: 't', fetchImpl, sleep: noSleep,
    });
    // count is the FIRST page's @odata.count, not page 2's.
    expect(count).toBe(7);
    expect(records).toEqual([{ k: 1 }, { k: 2 }, { k: 3 }]);
  });

  it('threads the refreshed bearer from a page-1 401 into the page-2 request', async () => {
    const page2Url = `${API_BASE}/Property?$skiptoken=abc`;
    const bearers = [];
    let page1Calls = 0;
    const fetchImpl = async (url, opts) => {
      bearers.push(opts.headers.Authorization);
      if (url.includes('$skiptoken')) {
        // page 2 must already carry the FRESH bearer — never the stale one.
        return { ok: true, json: async () => ({ value: [{ k: 2 }] }) };
      }
      page1Calls++;
      if (page1Calls === 1) return { ok: false, status: 401, text: async () => 'expired' };
      return {
        ok: true,
        json: async () => ({ '@odata.count': 2, '@odata.nextLink': page2Url, value: [{ k: 1 }] }),
      };
    };
    let refreshed = 0;
    const refreshToken = async () => { refreshed++; return 'fresh-token'; };

    const { records } = await fetchAllPages(INITIAL, {
      token: 'stale-token', fetchImpl, refreshToken, sleep: noSleep,
    });

    expect(refreshed).toBe(1);
    // page 1 attempt 1: stale → 401; attempt 2: fresh; page 2: fresh (NOT a wasted re-401).
    expect(bearers).toEqual([
      'Bearer stale-token',
      'Bearer fresh-token',
      'Bearer fresh-token',
    ]);
    expect(records).toEqual([{ k: 1 }, { k: 2 }]);
  });
});

describe('fetchAllListings', () => {
  const noSleep = async () => {};
  it('concatenates across a 2-page nextLink set and stops when absent', async () => {
    const page2Url = `${API_BASE}/Property?$skiptoken=abc`;
    const fetchImpl = async (url) => {
      if (url.includes('$skiptoken')) {
        return { ok: true, json: async () => ({ value: [sample.otherAgent] }) };
      }
      return {
        ok: true,
        json: async () => ({
          '@odata.count': 3,
          '@odata.nextLink': page2Url,
          value: [sample.derrickListing, sample.coListDerrick],
        }),
      };
    };
    const { records, count } = await fetchAllListings({
      apiBase: API_BASE, filter: activeFilter(), select: SELECT_FIELDS,
      token: 't', fetchImpl, sleep: noSleep,
    });
    expect(count).toBe(3);
    expect(records).toHaveLength(3);
    expect(records.map((r) => r.ListingKey)).toEqual(['28705430', '28705431', '28705999']);
  });

  it('threads the refreshed token into later pages (no stale re-401)', async () => {
    const page2Url = `${API_BASE}/Property?$skiptoken=abc`;
    const bearers = [];
    let page1Calls = 0;
    const fetchImpl = async (url, opts) => {
      bearers.push(opts.headers.Authorization);
      if (url.includes('$skiptoken')) {
        // page 2: must already carry the FRESH bearer — no 401 needed here.
        return { ok: true, json: async () => ({ value: [sample.otherAgent] }) };
      }
      // page 1: first hit 401 (triggers refresh), second hit succeeds.
      page1Calls++;
      if (page1Calls === 1) return { ok: false, status: 401, text: async () => 'expired' };
      return {
        ok: true,
        json: async () => ({
          '@odata.count': 2,
          '@odata.nextLink': page2Url,
          value: [sample.derrickListing],
        }),
      };
    };
    let refreshed = 0;
    const refreshToken = async () => { refreshed++; return 'fresh-token'; };

    const { records } = await fetchAllListings({
      apiBase: API_BASE, filter: activeFilter(), select: SELECT_FIELDS,
      token: 'stale-token', fetchImpl, refreshToken, sleep: noSleep,
    });

    expect(refreshed).toBe(1);
    // page 1, attempt 1: stale → 401; attempt 2: fresh; page 2: fresh (NOT stale).
    expect(bearers).toEqual([
      'Bearer stale-token',
      'Bearer fresh-token',
      'Bearer fresh-token',
    ]);
    expect(records.map((r) => r.ListingKey)).toEqual(['28705430', '28705999']);
  });
});

describe('fetchOfficeNameMap', () => {
  const noSleep = async () => {};
  it('builds { OfficeKey: OfficeName } and follows nextLink across pages', async () => {
    const page2Url = `${API_BASE}/Office?$skiptoken=office2`;
    const urls = [];
    const fetchImpl = async (url) => {
      urls.push(url);
      if (url.includes('$skiptoken')) {
        return {
          ok: true,
          json: async () => ({ value: [{ OfficeKey: '290358', OfficeName: 'ANOTHER REALTY GROUP INC.' }] }),
        };
      }
      return {
        ok: true,
        json: async () => ({
          '@odata.count': 2,
          '@odata.nextLink': page2Url,
          value: [{ OfficeKey: '551123', OfficeName: 'REAL BROKER ONTARIO LTD.' }],
        }),
      };
    };
    const map = await fetchOfficeNameMap({
      apiBase: API_BASE, token: 't', fetchImpl, sleep: noSleep,
    });
    expect(map).toEqual({
      '551123': 'REAL BROKER ONTARIO LTD.',
      '290358': 'ANOTHER REALTY GROUP INC.',
    });
    // first page targets the Office resource with the OfficeKey,OfficeName $select
    expect(urls[0].startsWith(`${API_BASE}/Office?`)).toBe(true);
    expect(decodeURIComponent(urls[0])).toContain('OfficeKey,OfficeName');
    // it followed the nextLink to page 2
    expect(urls).toHaveLength(2);
    expect(urls[1]).toBe(page2Url);
  });
});

describe('buildDatasets', () => {
  const noSleep = async () => {};
  it('normalizes all listings, joins the Office brokerage, and derives Derrick\'s subset', async () => {
    const fetchImpl = async (url) => {
      // token POST
      if (url.includes('connect/token')) {
        return { ok: true, json: async () => ({ access_token: 'tok', token_type: 'Bearer', expires_in: 3600 }) };
      }
      // Office resource — single page
      if (url.includes('/Office')) {
        return {
          ok: true,
          json: async () => ({
            '@odata.count': 1,
            value: [{ OfficeKey: '551123', OfficeName: 'REAL BROKER ONTARIO LTD.' }],
          }),
        };
      }
      // single page of Property
      return {
        ok: true,
        json: async () => ({
          '@odata.count': 3,
          value: [sample.derrickListing, sample.coListDerrick, sample.otherAgent],
        }),
      };
    };
    const { all, derrick, count } = await buildDatasets({
      tokenUrl: 'https://identity.crea.ca/connect/token',
      clientId: 'c', clientSecret: 's', scope: 'DDFApi_Read',
      apiBase: API_BASE, fetchImpl, sleep: noSleep,
    });
    expect(count).toBe(3);
    expect(all).toHaveLength(3);
    expect(derrick).toHaveLength(2);
    expect(derrick.every((l) => l.isDerrick)).toBe(true);
    expect(derrick.map((l) => l.id)).toEqual(['28705430', '28705431']);
    // brokerage resolved via the Office join (ListOfficeKey 551123)
    expect(all.find((l) => l.id === '28705430').brokerage).toBe('REAL BROKER ONTARIO LTD.');
    expect(derrick.every((l) => l.brokerage === 'REAL BROKER ONTARIO LTD.')).toBe(true);
    // otherAgent's office (770000) isn't in the map → null (no invented name)
    expect(all.find((l) => l.id === '28705999').brokerage).toBeNull();
    // all entries are normalized (render contract), not raw
    expect(all[0]).toHaveProperty('priceFormatted');
    expect(all[0]).toHaveProperty('mlsNumber');
  });

  // Status is no longer enforceable in $filter (CREA made StandardStatus non-filterable),
  // so buildDatasets must drop non-Active records in memory instead.
  it('excludes explicitly non-Active records in memory', async () => {
    const sold = { ...sample.otherAgent, ListingKey: '28705777', StandardStatus: 'Sold' };
    const fetchImpl = async (url) => {
      if (url.includes('connect/token')) {
        return { ok: true, json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
      }
      if (url.includes('/Office')) {
        return { ok: true, json: async () => ({ '@odata.count': 0, value: [] }) };
      }
      return {
        ok: true,
        json: async () => ({
          '@odata.count': 3,
          value: [sample.derrickListing, sold, sample.otherAgent],
        }),
      };
    };
    const { all } = await buildDatasets({
      tokenUrl: 'https://identity.crea.ca/connect/token',
      clientId: 'c', clientSecret: 's', scope: 'DDFApi_Read',
      apiBase: API_BASE, fetchImpl, sleep: noSleep,
    });
    expect(all.map((l) => l.id)).not.toContain('28705777');
    expect(all).toHaveLength(2);
  });

  // The listings pass must send NO $filter — a StandardStatus clause 400s the feed.
  it('requests the Property feed without a $filter', async () => {
    const propertyUrls = [];
    const fetchImpl = async (url) => {
      if (url.includes('connect/token')) {
        return { ok: true, json: async () => ({ access_token: 'tok', expires_in: 3600 }) };
      }
      if (url.includes('/Office')) {
        return { ok: true, json: async () => ({ '@odata.count': 0, value: [] }) };
      }
      propertyUrls.push(url);
      return { ok: true, json: async () => ({ '@odata.count': 1, value: [sample.derrickListing] }) };
    };
    await buildDatasets({
      tokenUrl: 'https://identity.crea.ca/connect/token',
      clientId: 'c', clientSecret: 's', scope: 'DDFApi_Read',
      apiBase: API_BASE, fetchImpl, sleep: noSleep,
    });
    expect(propertyUrls).toHaveLength(1);
    expect(propertyUrls[0]).not.toContain('filter');
    expect(propertyUrls[0]).not.toContain('StandardStatus%20eq');
  });
});
