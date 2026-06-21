import { filterListings, sortListings } from '../lib/listings-view.js';

const dataEl = document.getElementById('listings-index');
if (dataEl) {
  const all: any[] = JSON.parse(dataEl.textContent || '[]');
  const inMarkets = new Set<string>(JSON.parse(dataEl.dataset.markets || '[]'));
  const grid = document.getElementById('listings-grid')!;
  const countEl = document.getElementById('listings-count');
  const chips = document.getElementById('listings-chips');
  const areaSel = document.querySelector<HTMLSelectElement>('[data-filter="municipality"]');
  const savedBtn = document.getElementById('saved-toggle');
  const savedCountEl = document.getElementById('saved-count');
  const FAV_KEY = 'dg:favs';
  const favs = new Set<string>(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
  const state: any = { municipality: '', maxPrice: 0, minBeds: 0, propertyType: '', savedOnly: false, sort: 'new', ontarioWide: false };

  // HTML-escape interpolated DDF values (XSS defense-in-depth; mirrors Astro's auto-escaping on the SSR side).
  const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

  // Emits the SAME global `.lcard*` markup as ListingCard.astro so SSR + client cards match.
  function cardHTML(d: any) {
    const id = esc(d.id);
    const tag = d.isDerrick
      ? `<span class="lcard__tag lcard__tag--d">Derrick's Listing</span>`
      : `<span class="lcard__tag">For Sale</span>`;
    const on = favs.has(d.id);
    const photo = d.primaryPhoto
      ? `<img class="lcard__img" src="${esc(d.primaryPhoto)}" loading="lazy" decoding="async" width="400" height="300" alt="Photo of ${esc(d.address)}">`
      : `<div class="lcard__empty" aria-hidden="true">No photo</div>`;
    const meta = [d.beds != null ? d.beds + ' bd' : null, d.baths != null ? d.baths + ' ba' : null, esc(d.propertyType)].filter(Boolean).join(' · ');
    return `<a class="lcard" href="/listings/${id}"><div class="lcard__ph">${tag}`
      + `<button class="lcard__fav ${on ? 'is-on' : ''}" data-fav="${id}" aria-label="Save listing" aria-pressed="${on}">${on ? '♥' : '♡'}</button>${photo}</div>`
      + `<div class="lcard__b"><div class="lcard__price">${esc(d.priceFormatted ?? 'Price on request')}</div>`
      + `${meta ? `<div class="lcard__meta">${meta}</div>` : ''}<div class="lcard__addr">${esc(d.address)}</div><div class="lcard__sub">${esc(d.displayCity)}</div>`
      + `<div class="lcard__foot"><span>Real Broker Ontario</span><span class="lcard__go">View details →</span></div></div></a>`;
  }

  function apply() {
    const base = state.ontarioWide ? all : all.filter((d) => inMarkets.has(d.municipality));
    const rows = sortListings(filterListings(base, {
      municipality: state.municipality, maxPrice: state.maxPrice || undefined, minBeds: state.minBeds || undefined,
      propertyType: state.propertyType || undefined, savedOnly: state.savedOnly, savedIds: [...favs],
    }), state.sort);
    grid.innerHTML = rows.map(cardHTML).join('') || '<p class="browser-empty ui">No listings match those filters.</p>';
    if (countEl) countEl.textContent = String(rows.length);
    window.dispatchEvent(new CustomEvent('listings:filtered', { detail: rows }));
  }

  function updateSavedCount() { if (savedCountEl) savedCountEl.textContent = `(${favs.size})`; }

  // Area is ONE filter with two synced inputs: the dropdown (all markets) + the quick bubbles.
  function setArea(muni: string) {
    state.municipality = muni;
    if (areaSel) areaSel.value = muni;
    chips?.querySelectorAll<HTMLElement>('[data-chip]').forEach((c) => c.classList.toggle('is-on', (c.dataset.chip || '') === muni));
    apply();
  }

  // Bubbles → setArea (keeps the dropdown in sync)
  chips?.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-chip]');
    if (!chip) return;
    setArea(chip.dataset.chip || '');
  });

  // Selects: municipality routes through setArea (syncs bubbles); the rest are independent dimensions.
  document.querySelectorAll<HTMLSelectElement>('[data-filter]').forEach((el) => {
    el.addEventListener('change', () => {
      const key = el.dataset.filter!;
      if (key === 'municipality') { setArea(el.value); return; }
      const v = el.value;
      state[key] = v === '' ? (key === 'propertyType' ? '' : 0) : (isNaN(Number(v)) ? v : Number(v));
      apply();
    });
  });

  const sortSel = document.getElementById('listings-sort') as HTMLSelectElement | null;
  sortSel?.addEventListener('change', () => { state.sort = sortSel.value; apply(); });

  const wide = document.getElementById('ontario-wide') as HTMLInputElement | null;
  wide?.addEventListener('change', () => { state.ontarioWide = wide.checked; apply(); });

  // Saved is its own toggle, independent of area.
  savedBtn?.addEventListener('click', () => {
    state.savedOnly = !state.savedOnly;
    savedBtn.classList.toggle('is-on', state.savedOnly);
    savedBtn.setAttribute('aria-pressed', String(state.savedOnly));
    apply();
  });

  // Favorites (localStorage, event-delegated)
  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.fav!;
    if (favs.has(id)) favs.delete(id); else favs.add(id);
    localStorage.setItem(FAV_KEY, JSON.stringify([...favs]));
    const on = favs.has(id);
    btn.classList.toggle('is-on', on); btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? '♥' : '♡';
    updateSavedCount();
    if (state.savedOnly) apply();
  });

  // Grid / Map view toggle
  document.querySelectorAll<HTMLElement>('[data-view]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.view;
    document.getElementById('view-grid')!.hidden = v !== 'grid';
    document.getElementById('view-map')!.hidden = v !== 'map';
    document.querySelectorAll('[data-view]').forEach((x) => {
      const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on));
    });
    if (v === 'map') window.dispatchEvent(new Event('listings:mapshown'));
  }));

  updateSavedCount();
  apply();
}
