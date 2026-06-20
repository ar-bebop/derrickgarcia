// src/lib/ddf.test.js
import { describe, it, expect } from 'vitest';
import {
  DERRICK_AGENT_KEY,
  SELECT_FIELDS,
  activeFilter,
  derrickFilter,
  buildListingsUrl,
  normalizeListingUrl,
  formatPrice,
  primaryPhoto,
  sortedPhotoUrls,
  isDerrickListing,
  normalizeListing,
  getToken,
  fetchJsonWithRetry,
  fetchAllListings,
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
      'ListOfficeName', 'StandardStatus', 'PublicRemarks', 'Media',
      'PhotosCount', 'ModificationTimestamp', 'Latitude', 'Longitude',
    ]);
  });
});

describe('activeFilter / derrickFilter', () => {
  it('activeFilter returns the Active OData clause', () => {
    expect(activeFilter()).toBe("StandardStatus eq 'Active'");
  });
  it('derrickFilter restricts to active AND any of the four agent-key fields', () => {
    const f = derrickFilter();
    expect(f).toContain("StandardStatus eq 'Active'");
    expect(f).toContain("ListAgentKey eq '2088980'");
    expect(f).toContain("CoListAgentKey eq '2088980'");
    expect(f).toContain("CoListAgentKey2 eq '2088980'");
    expect(f).toContain("CoListAgentKey3 eq '2088980'");
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
      { MediaURL: 'b.jpg', Order: 2, PreferredPhotoYN: false, MediaCategory: 'Photo' },
      { MediaURL: 'a.jpg', Order: 1, PreferredPhotoYN: false, MediaCategory: 'Photo' },
    ];
    expect(primaryPhoto(media)).toBe('a.jpg');
  });
  it('returns null when there are no photos', () => {
    expect(primaryPhoto(sample.otherAgent.Media)).toBeNull();
    expect(primaryPhoto([])).toBeNull();
    expect(primaryPhoto(undefined)).toBeNull();
  });
  it('ignores non-Photo media when choosing the primary', () => {
    const media = [
      { MediaURL: 'doc.pdf', Order: 0, PreferredPhotoYN: true, MediaCategory: 'Document' },
      { MediaURL: 'photo.jpg', Order: 5, PreferredPhotoYN: false, MediaCategory: 'Photo' },
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
  it('excludes non-Photo media categories', () => {
    // the Document item in the fixture must not appear
    expect(sortedPhotoUrls(sample.derrickListing.Media))
      .not.toContain('https://ddfcdn.realtor.ca/listing/TSabc/docs/floorplan.pdf');
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
  const n = normalizeListing(sample.derrickListing);
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
      brokerage: 'REAL BROKER ONTARIO LTD',
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
  it('brokerage comes from ListOfficeName', () => {
    expect(n.brokerage).toBe('REAL BROKER ONTARIO LTD');
  });
  it('marks a non-Derrick listing isDerrick: false', () => {
    expect(normalizeListing(sample.otherAgent).isDerrick).toBe(false);
  });
});

describe('buildListingsUrl', () => {
  const url = buildListingsUrl({
    apiBase: API_BASE,
    filter: activeFilter(),
    select: SELECT_FIELDS,
    top: 100,
  });
  it('targets the Property endpoint', () => {
    expect(url.startsWith(`${API_BASE}/Property?`)).toBe(true);
  });
  // URLSearchParams encodes spaces as '+', which decodeURIComponent leaves intact;
  // normalize '+' → ' ' so we can assert on the human-readable filter.
  const decoded = decodeURIComponent(url).replace(/\+/g, ' ');
  it('includes the filter, $top and $count=true', () => {
    expect(decoded).toContain("StandardStatus eq 'Active'");
    expect(decoded).toContain('$top=100');
    expect(decoded).toContain('$count=true');
  });
  it('includes every field in the $select list', () => {
    for (const field of SELECT_FIELDS) {
      expect(decoded).toContain(field);
    }
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
    })).rejects.toThrow();
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
    })).rejects.toThrow();
    // initial try + 2 retries
    expect(calls).toBe(3);
  });

  it('throws immediately on a non-retryable 4xx', async () => {
    let calls = 0;
    const fetchImpl = async () => { calls++; return { ok: false, status: 400, text: async () => 'bad' }; };
    await expect(fetchJsonWithRetry('u', { token: 't', fetchImpl, sleep: noSleep }))
      .rejects.toThrow();
    expect(calls).toBe(1);
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
});

describe('buildDatasets', () => {
  const noSleep = async () => {};
  it('normalizes all listings and derives Derrick\'s subset', async () => {
    const fetchImpl = async (url) => {
      // token POST
      if (url.includes('connect/token')) {
        return { ok: true, json: async () => ({ access_token: 'tok', token_type: 'Bearer', expires_in: 3600 }) };
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
    // all entries are normalized (render contract), not raw
    expect(all[0]).toHaveProperty('priceFormatted');
    expect(all[0]).toHaveProperty('mlsNumber');
  });
});
