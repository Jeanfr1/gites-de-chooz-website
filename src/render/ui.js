import images from '../data/images.json';
import { brand, gites, sozen, platforms, routes } from '../data/site.js';
import { L, LOC, LOCALES, DEFAULT_LOCALE, dicts, href, prefix } from './i18n.js';
import { icon, sprite } from './icons.js';
import { emblem, wordmark } from './brand.js';

export const SITE_URL = process.env.SITE_URL || 'https://gites-de-chooz.vercel.app';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);

// Escape, plus French typography (narrow no-break space before ; : ! ? and inside « ») for fr.
export const t = (s) => {
  const out = esc(s);
  if (LOC !== 'fr') return out;
  return out.replace(/ ([;:!?])/g, '\u202F$1').replace(/« /g, '«\u202F').replace(/ »/g, '\u202F»');
};
// Two-line headings: ['La parenthèse', 'verte.'] -> La parenthèse<br><em>verte.</em>
export const lines = (arr, { br = true } = {}) =>
  arr.length === 1 ? t(arr[0]) : `${t(arr[0])}${br ? '<br>' : ' '}<em>${t(arr.slice(1).join(' '))}</em>`;

export const facts = (g) => [L.people(g.capacity), L.rooms(g.bedrooms), g.area ? L.sqm(g.area) : null].filter(Boolean).join(' · ');
export const giteText = (g) => L.giteText[g.id];
export const photoAlt = (g, p) => `${g.name} · ${L.photoKinds[p.kind]}`;

const srcset = (key, ext) => {
  const m = images[key];
  if (!m) throw new Error(`Unknown image ${key} — run npm run images`);
  return m.sizes.map((w) => `/img/${key}-${m.v}-${w}.${ext} ${w}w`).join(', ');
};

export const imgUrl = (key, ext = 'webp', which = 'max') => {
  const m = images[key];
  if (!m) throw new Error(`Unknown image ${key} — run npm run images`);
  const w = which === 'max' ? m.sizes[m.sizes.length - 1] : m.sizes.find((s) => s >= which) || m.sizes[m.sizes.length - 1];
  return `/img/${key}-${m.v}-${w}.${ext}`;
};

export function picture(key, { alt = '', sizes = '100vw', cls = '', imgCls = '', loading = 'lazy', priority = false, attrs = '' } = {}) {
  const m = images[key];
  if (!m) throw new Error(`Unknown image ${key} — run npm run images`);
  const mid = m.sizes[Math.min(1, m.sizes.length - 1)];
  return `<picture${cls ? ` class="${cls}"` : ''}${attrs ? ` ${attrs}` : ''}>`
    + `<source type="image/avif" srcset="${srcset(key, 'avif')}" sizes="${sizes}">`
    + `<img src="/img/${key}-${m.v}-${mid}.webp" srcset="${srcset(key, 'webp')}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"`
    + `${imgCls ? ` class="${imgCls}"` : ''} decoding="async"${priority ? ' fetchpriority="high"' : ` loading="${loading}"`}>`
    + `</picture>`;
}

const newTab = () => `<span class="sr-only"> ${t(L.ui.newTab)}</span>`;
const ext = (external) => (external ? ' target="_blank" rel="noopener noreferrer"' : '');

export const button = (url, label, { variant = 'solid', ic = 'arrow', external = false, cls = '', attrs = '' } = {}) =>
  `<a class="btn btn-${variant}${cls ? ` ${cls}` : ''}" href="${esc(url)}"${ext(external)}${attrs ? ` ${attrs}` : ''}>`
  + `<span class="btn-label">${t(label)}</span>${icon(external ? 'external' : ic)}${external ? newTab() : ''}</a>`;

export const textLink = (url, label, { external = false, ic } = {}) =>
  `<a class="text-link" href="${esc(url)}"${ext(external)}>`
  + `<span>${t(label)}</span>${icon(ic || (external ? 'external' : 'arrow'))}${external ? newTab() : ''}</a>`;

export const eyebrow = (s, cls = '') => `<p class="eyebrow${cls ? ` ${cls}` : ''}" data-anim="eyebrow">${t(s)}</p>`;

export const sprig = (cls = '') => `<svg class="sprig${cls ? ` ${cls}` : ''}" aria-hidden="true" focusable="false"><use href="#i-sprig"/></svg>`;

// Booking buttons: one per platform (the first is the main one).
export const platformName = (p) => platforms[p.platform].name;
export const bookingButtons = (g, { variant } = {}) =>
  g.booking
    .map((b, i) => button(b.url, `${L.ui.bookOn} ${platformName(b)}`, { variant: variant || (i === 0 ? 'solid' : 'outline'), external: true }))
    .join('');

// ---------------------------------------------------------------------------
// Header, navigation, footer
// ---------------------------------------------------------------------------

const navItems = () => [
  { id: 'gites', label: L.nav.gites, ic: 'house' },
  { id: 'sejour', label: L.nav.sejour, ic: 'book' },
  { id: 'adresses', label: L.nav.adresses, ic: 'compass' },
  { id: 'palmeraie', label: L.nav.palmeraie, ic: 'palm' },
  { id: 'sozen', label: L.nav.sozen, ic: 'lotus' },
];

function brandLink() {
  return `<a class="brand" href="${prefix()}" aria-label="${esc(`${brand.name} · ${L.ui.home}`)}">`
    + emblem({ cls: 'brand-emblem', sw: 4.6 })
    + `<span class="brand-text">${wordmark('brand-name')}<span class="brand-tag">Chooz · Ardennes</span></span></a>`;
}

function langSwitch(routeId) {
  if (!routeId) return '';
  const items = LOCALES.map((l) => {
    const cur = l === LOC;
    return `<li><a href="${href(routeId, l)}" hreflang="${l}" lang="${l}"${cur ? ' aria-current="true"' : ''}>`
      + `<span class="lang-code">${l.toUpperCase()}</span><span>${esc(dicts[l].name)}</span>${cur ? icon('check') : ''}</a></li>`;
  }).join('');
  return `<details class="lang" data-lang>
      <summary aria-label="${esc(`${L.ui.language} · ${L.name}`)}">${icon('globe')}<span class="lang-current">${LOC.toUpperCase()}</span></summary>
      <ul class="lang-menu">${items}</ul>
    </details>`;
}

function header(active, routeId) {
  const links = navItems()
    .map((n) => `<a href="${href(n.id)}"${n.id === active ? ' aria-current="page"' : ''}><span>${t(n.label)}</span></a>`)
    .join('');
  return `<header class="site-header" data-header>
  <div class="header-inner">
    ${brandLink()}
    <nav class="main-nav" id="main-nav" aria-label="${esc(L.ui.menu)}">${links}
      <a class="nav-cta" href="${href('gites')}">${t(L.ui.chooseGite)}${icon('arrow')}</a>
    </nav>
    ${langSwitch(routeId)}
    <a class="btn btn-solid btn-sm header-cta" href="${href('gites')}"><span class="btn-label">${t(L.ui.chooseGite)}</span>${icon('arrow')}</a>
    <a class="menu-toggle" href="#footer-nav" aria-controls="main-nav" data-menu-toggle>
      <span class="menu-label">${t(L.ui.menu)}</span>${icon('menu', 'icon-open')}${icon('close', 'icon-close')}
    </a>
  </div>
</header>`;
}

function bottomNav(active) {
  const items = navItems().filter((n) => n.id !== 'palmeraie');
  return `<nav class="bottom-nav" aria-label="${esc(L.hero.quickLabel)}">${items
    .map((i) => `<a href="${href(i.id)}"${i.id === active ? ' aria-current="page"' : ''}>${icon(i.ic)}<span>${t(i.label)}</span></a>`)
    .join('')}</nav>`;
}

// TODO(gites): mentions légales (éditeur, hébergeur) and privacy page before the public launch — Sophie to provide.
function footer(routeId) {
  const nav = [{ id: 'home', label: L.ui.home }, ...navItems()];
  const book = gites
    .map((g) => `<li><span class="footer-gite">${t(g.name)}</span><span class="footer-platforms">${g.booking
      .map((b) => `<a href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(platformName(b))}${icon('external')}${newTab()}</a>`)
      .join('')}</span></li>`)
    .join('');
  const langs = LOCALES.map((l) => `<li><a href="${routeId ? href(routeId, l) : prefix(l)}" hreflang="${l}" lang="${l}"${l === LOC ? ' aria-current="true"' : ''}>${esc(dicts[l].name)}</a></li>`).join('');
  return `<footer class="site-footer" data-footer>
  <div class="footer-inner">
    <div class="footer-top">
      <p class="footer-title" data-split>${lines(L.footer.title, { br: false })}</p>
      <div class="footer-cols">
        <div id="footer-nav">
          <p class="footer-head">${t(L.footer.navigate)}</p>
          <ul>${nav.map((l) => `<li><a href="${href(l.id)}">${t(l.label)}</a></li>`).join('')}</ul>
        </div>
        <div>
          <p class="footer-head">${t(L.footer.book)}</p>
          <ul class="footer-book">${book}</ul>
        </div>
        <div>
          <p class="footer-head">${t(L.footer.contact)}</p>
          <ul>
            <li><a href="${sozen.phoneHref}">${icon('phone')}${esc(LOC === 'fr' ? sozen.phone : sozen.phoneIntl)}</a></li>
            <li><a href="${esc(sozen.facebookUrl)}" target="_blank" rel="noopener noreferrer">${icon('facebook')}So Zen · Facebook${newTab()}</a></li>
            <li class="footer-address">${icon('pin')}Chooz · Ardennes</li>
          </ul>
        </div>
        <div>
          <p class="footer-head">${t(L.ui.language)}</p>
          <ul class="footer-langs">${langs}</ul>
        </div>
      </div>
    </div>
    <a class="footer-giant" href="${prefix()}" aria-label="${esc(`${brand.name} · ${L.ui.home}`)}" data-giant>
      ${emblem({ cls: 'footer-emblem', sw: 2.2 })}
      <span class="footer-wordmark" aria-hidden="true"><span>So</span> <em>Dream</em></span>
    </a>
    <p class="footer-note"><span>${t(L.footer.note)}</span><span>${t(L.footer.note2)}</span></p>
  </div>
</footer>`;
}

// Language suggestion (src/js/lang.js): the texts of the other languages for this page.
function suggestData(routeId) {
  if (!routeId) return '';
  const data = Object.fromEntries(LOCALES.map((l) => [l, { ...dicts[l].ui.suggest, href: href(routeId, l) }]));
  return `<script type="application/json" data-lang-suggest>${JSON.stringify({ current: LOC, locales: data }).replace(/</g, '\\u003c')}</script>`;
}

// TODO(gites): remove noindex (here and in vercel.json) once Sophie validates the texts and photos
// and the final domain is set; then point SITE_URL to it. The printed QR cards open
// https://gites-de-chooz.vercel.app: keep that address alive (redirect) after any domain change.
export function layout({ routeId, nav: active = '', title, description, body, bodyClass = '' }) {
  const fullTitle = routeId === 'home' ? title : `${title} · ${brand.name}`;
  const url = routeId ? `${SITE_URL}${href(routeId)}` : SITE_URL;
  const alternates = routeId
    ? LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${href(routeId, l)}">`).join('\n')
      + `\n<link rel="alternate" hreflang="x-default" href="${SITE_URL}${href(routeId, DEFAULT_LOCALE)}">`
    : '';
  const ogAlt = LOCALES.filter((l) => l !== LOC).map((l) => `<meta property="og:locale:alternate" content="${dicts[l].ogLocale}">`).join('\n');
  return `<!doctype html>
<html lang="${L.code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#203F35">
${routeId ? `<link rel="canonical" href="${url}">` : ''}
${alternates}
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${L.ogLocale}">
${ogAlt}
<meta property="og:site_name" content="${esc(brand.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE_URL}/img/og-v2.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/favicon-v2.svg" type="image/svg+xml">
<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32-v2.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon-v2.png">
<script>(function(d){var r=d.documentElement;r.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('motion');setTimeout(function(){if(!r.classList.contains('motion-ready'))r.classList.remove('motion')},3500)}})(document)</script>
<link rel="stylesheet" href="/src/styles/main.css">
<script type="module" src="/src/main.js"></script>
</head>
<body class="${bodyClass}">
${sprite()}
<a class="skip-link" href="#main">${t(L.ui.skip)}</a>
${header(active, routeId)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(routeId)}
${bottomNav(active)}
${suggestData(routeId)}
</body>
</html>
`;
}

export { L, LOC, href, prefix, icon, emblem, wordmark, routes };
