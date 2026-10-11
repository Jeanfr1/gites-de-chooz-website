// Progressive enhancement only: every page is complete without this file.
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---- Mobile menu (the toggle is a link to the footer navigation without JS) ----
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.getElementById('main-nav');
if (toggle && menu) {
  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(!menu.classList.contains('is-open'));
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', () => setOpen(false));
}

// ---- Reveal on scroll (this module owns the hidden state) ----
const revealItems = document.querySelectorAll('[data-reveal]');
if (revealItems.length && !reduce.matches && 'IntersectionObserver' in window) {
  root.classList.add('reveal-on');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
  );
  revealItems.forEach((el) => io.observe(el));
}

// ---- Print the carnet ----
const printBtn = document.querySelector('[data-print]');
if (printBtn) {
  printBtn.hidden = false;
  printBtn.addEventListener('click', () => window.print());
}

// ---- Page modules ----
if (document.querySelector('[data-hero]')) import('./js/hero.js').then((m) => m.default());
const gallery = document.querySelector('[data-gallery]');
if (gallery) import('./js/gallery.js').then((m) => m.default(gallery));
const filters = document.querySelector('[data-filters]');
if (filters) import('./js/filters.js').then((m) => m.default(filters));
