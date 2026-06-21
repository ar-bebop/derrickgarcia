// Progressive enhancement shared across pages. Motion is gated; no-JS users are unaffected.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sticky-nav scrolled state + scroll-progress bar
const header = document.querySelector('.site-header');
const bar = document.querySelector<HTMLElement>('.progress-bar');
function onScroll() {
  const st = window.scrollY || document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (header) header.classList.toggle('is-scrolled', st > 40);
  if (bar) bar.style.width = h > 0 ? `${(100 * st) / h}%` : '0';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Count-up for [data-count] when its container scrolls into view
const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
if (counters.length && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      const to = Number(el.dataset.count) || 0;
      if (reduce) { el.textContent = to.toLocaleString(); obs.unobserve(el); return; }
      let t0: number | null = null;
      const step = (ts: number) => {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / 1100, 1);
        el.textContent = Math.floor(p * to).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => obs.observe(c));
}
