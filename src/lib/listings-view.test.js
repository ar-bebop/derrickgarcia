import { describe, it, expect } from 'vitest';
import { municipality, displayCity, median, filterListings, sortListings, toIndexRecord } from './listings-view.js';

const L = (o) => ({ id: '1', mlsNumber: 'X1', address: '1 A St', city: 'Toronto (Roncesvalles)', province: 'Ontario',
  price: 800000, priceFormatted: '$800,000', beds: 2, baths: 1, propertyType: 'Single Family', primaryPhoto: 'p.jpg',
  photos: ['p.jpg'], photosCount: 1, brokerage: 'REAL BROKER ONTARIO LTD.', isDerrick: false, lat: 43.6, lng: -79.4,
  updatedAt: '2026-05-01T00:00:00Z', ...o });

describe('municipality/displayCity', () => {
  it('strips the parenthetical area', () => {
    expect(municipality('Toronto (Roncesvalles)')).toBe('Toronto');
    expect(municipality('Caledon (Bolton)')).toBe('Caledon');
    expect(municipality('Milton')).toBe('Milton');
    expect(municipality(null)).toBe('');
  });
  it('formats neighbourhood, municipality', () => {
    expect(displayCity('Toronto (Roncesvalles)')).toBe('Roncesvalles, Toronto');
    expect(displayCity('Milton')).toBe('Milton');
  });
});

describe('median', () => {
  it('handles odd/even/empty', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});

describe('filterListings', () => {
  const list = [L({ id: 'a', city: 'Toronto (X)', price: 600000, beds: 1, propertyType: 'Single Family' }),
    L({ id: 'b', city: 'Milton', price: 950000, beds: 3, propertyType: 'Single Family' }),
    L({ id: 'c', city: 'Mississauga', price: 1700000, beds: 3, propertyType: 'Multi-family' })];
  it('filters by municipality', () => { expect(filterListings(list, { municipality: 'Milton' }).map((x) => x.id)).toEqual(['b']); });
  it('filters by maxPrice', () => { expect(filterListings(list, { maxPrice: 700000 }).map((x) => x.id)).toEqual(['a']); });
  it('filters by minBeds', () => { expect(filterListings(list, { minBeds: 3 }).map((x) => x.id)).toEqual(['b', 'c']); });
  it('filters by propertyType', () => { expect(filterListings(list, { propertyType: 'Multi-family' }).map((x) => x.id)).toEqual(['c']); });
  it('filters savedOnly', () => { expect(filterListings(list, { savedOnly: true, savedIds: ['c'] }).map((x) => x.id)).toEqual(['c']); });
  it('empty filter returns all', () => { expect(filterListings(list, {}).length).toBe(3); });
  it('filters by municipality on lean index records (precomputed municipality, no city field)', () => {
    const idx = [{ id: 'a', municipality: 'Toronto', price: 600000, beds: 1, propertyType: 'Single Family' },
      { id: 'b', municipality: 'Milton', price: 600000, beds: 1, propertyType: 'Single Family' }];
    expect(filterListings(idx, { municipality: 'Milton' }).map((x) => x.id)).toEqual(['b']);
    expect(filterListings(idx, { municipality: 'Toronto' }).map((x) => x.id)).toEqual(['a']);
  });
});

describe('sortListings', () => {
  const list = [L({ id: 'a', price: 600000, updatedAt: '2026-01-01T00:00:00Z' }),
    L({ id: 'b', price: 900000, updatedAt: '2026-05-01T00:00:00Z' })];
  it('lo = price asc', () => expect(sortListings(list, 'lo').map((x) => x.id)).toEqual(['a', 'b']));
  it('hi = price desc', () => expect(sortListings(list, 'hi').map((x) => x.id)).toEqual(['b', 'a']));
  it('new = updatedAt desc', () => expect(sortListings(list, 'new').map((x) => x.id)).toEqual(['b', 'a']));
});

describe('toIndexRecord', () => {
  it('keeps only browse fields', () => {
    expect(toIndexRecord(L({}))).toEqual({ id: '1', price: 800000, priceFormatted: '$800,000', beds: 2, baths: 1,
      propertyType: 'Single Family', municipality: 'Toronto', displayCity: 'Roncesvalles, Toronto',
      primaryPhoto: 'p.jpg', lat: 43.6, lng: -79.4, isDerrick: false, address: '1 A St', updatedAt: '2026-05-01T00:00:00Z' });
  });
});
