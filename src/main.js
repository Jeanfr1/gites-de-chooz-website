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
  window.matchMedia('(min-width: 1101px)').addEventListener('change', () => setOpen(false));
}

// ---- Language menu: close on outside click / Escape ----
const lang = document.querySelector('[data-lang]');
if (lang) {
  document.addEventListener('click', (e) => {
    if (lang.open && !lang.contains(e.target)) lang.open = false;
  });
  lang.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lang.open) {
      lang.open = false;
      lang.querySelector('summary').focus();
    }
  });
}

// ---- Header: hides while reading down, comes back up; brass reading progress ----
const header = document.querySelector('[data-header]');
if (header) {
  let lastY = window.scrollY;
  let queued = false;
  const update = () => {
    queued = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
    const menuOpen = menu && menu.classList.contains('is-open');
    const langOpen = lang && lang.open;
    if (!menuOpen && !langOpen && y > lastY + 6 && y > 320) header.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 320) header.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
  update();
}

// ---- Print the carnet ----
const printBtn = document.querySelector('[data-print]');
if (printBtn) {
  printBtn.hidden = false;
  printBtn.addEventListener('click', () => window.print());
}

// ---- Agenda: dates already passed disappear (the page is built ahead of time) ----
const agendaItems = document.querySelectorAll('[data-agenda] [data-date]');
if (agendaItems.length) {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  let left = 0;
  agendaItems.forEach((el) => {
    if (el.dataset.date < iso) el.remove();
    else left++;
  });
  const empty = document.querySelector('[data-agenda-empty]');
  if (!left && empty) empty.hidden = false;
}

// ---- Page modules ----
if (document.querySelector('[data-hero]')) import('./js/hero.js').then((m) => m.default());
const carousel = document.querySelector('[data-carousel]');
if (carousel) import('./js/carousel.js').then((m) => m.default(carousel));
const gallery = document.querySelector('[data-gallery]');
if (gallery) import('./js/gallery.js').then((m) => m.default(gallery));
const filters = document.querySelector('[data-filters]');
if (filters) import('./js/filters.js').then((m) => m.default(filters));
const triGuide = document.querySelector('[data-tri]');
if (triGuide) import('./js/tri.js').then((m) => m.default(triGuide));
const checklist = document.querySelector('[data-checklist]');
if (checklist) import('./js/checklist.js').then((m) => m.default(checklist));
if (document.querySelector('[data-lang-suggest]')) import('./js/lang.js').then((m) => m.default());

// ---- Motion (GSAP): only when motion is allowed ----
if (root.classList.contains('motion') && !reduce.matches) {
  import('./js/motion.js')
    .then((m) => m.default())
    .catch(() => root.classList.remove('motion'));
}
