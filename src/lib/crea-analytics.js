// CREA DDF Analytics Web Service API (Rule 5c). Spec not yet published by CREA.
// Inert stub: no-ops until CONFIG.creaAnalyticsKey is set and the real API is implemented.
// Wired (gated) on listing-detail views; see src/pages/listings/[id].astro.
export function reportListingView(_listingId, { key } = {}) {
  if (!key) return; // not configured — do nothing
  // TODO(go-live): implement once CREA supplies the Analytics Web Service API spec.
}
