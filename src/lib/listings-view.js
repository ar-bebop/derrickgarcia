// Pure, framework-free helpers over the Listing shape (see src/data/listings.ts).
// Tested in listings-view.test.js. No Astro/DOM imports — safe to import on server or client.

export function municipality(city) {
  if (!city) return '';
  const i = city.indexOf('(');
  return (i >= 0 ? city.slice(0, i) : city).trim();
}

export function neighbourhood(city) {
  if (!city) return '';
  const m = city.match(/\(([^)]+)\)/);
  return m ? m[1].trim() : '';
}

export function displayCity(city) {
  const muni = municipality(city);
  const nb = neighbourhood(city);
  return nb ? `${nb}, ${muni}` : muni;
}

export function median(nums) {
  const a = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n)).sort((x, y) => x - y);
  if (!a.length) return 0;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

export function filterListings(list, opts = {}) {
  const { municipality: muni, maxPrice, minBeds, propertyType, savedOnly, savedIds = [] } = opts;
  const saved = new Set(savedIds);
  // Accept both full listings (have `city`) and lean index records (precomputed `municipality`).
  const muniOf = (l) => l.municipality ?? municipality(l.city);
  return list.filter((l) => {
    if (muni && muniOf(l) !== muni) return false;
    if (maxPrice && (l.price == null || l.price > maxPrice)) return false;
    if (minBeds && (l.beds == null || l.beds < minBeds)) return false;
    if (propertyType && l.propertyType !== propertyType) return false;
    if (savedOnly && !saved.has(l.id)) return false;
    return true;
  });
}

export function sortListings(list, sort) {
  const a = [...list];
  if (sort === 'lo') return a.sort((x, y) => (x.price ?? Infinity) - (y.price ?? Infinity));
  if (sort === 'hi') return a.sort((x, y) => (y.price ?? -Infinity) - (x.price ?? -Infinity));
  // 'new' (default): updatedAt desc, nulls last
  return a.sort((x, y) => (y.updatedAt ?? '').localeCompare(x.updatedAt ?? ''));
}

// Lean record shipped to the browser for client filter/sort/map.
export function toIndexRecord(l) {
  return {
    id: l.id, price: l.price, priceFormatted: l.priceFormatted, beds: l.beds, baths: l.baths,
    propertyType: l.propertyType, municipality: municipality(l.city), displayCity: displayCity(l.city),
    primaryPhoto: l.primaryPhoto, lat: l.lat, lng: l.lng, isDerrick: l.isDerrick,
    address: l.address, updatedAt: l.updatedAt,
  };
}
