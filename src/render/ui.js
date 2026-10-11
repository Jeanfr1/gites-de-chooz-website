import images from '../data/images.json';
import { brand, nav, gites, sozen } from '../data/site.js';
import { icon, sprite } from './icons.js';

export const SITE_URL = process.env.SITE_URL || 'https://gites-de-chooz.vercel.app';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);

// French typography: narrow no-break space before ; : ! ? and inside « »
export const t = (s) =>
  esc(s)
    .replace(/ ([;:!?])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »');

export const people = (n) => `${n} ${n > 1 ? 'personnes' : 'personne'}`;
export const rooms = (n) => `${n} ${n > 1 ? 'chambres' : 'chambre'}`;
export const facts = (g) => `${people(g.capacity)} · ${rooms(g.bedrooms)} · ${g.area} m²`;

const srcset = (key, ext) => {
  const m = images[key];
  if (!m) throw new Error(`Unknown image ${key} — run npm run images`);
  return m.sizes.map((w) => `/img/${key}-${m.v}-${w}.${ext} ${w}w`).join(', ');
};

export const imgUrl = (key, ext = 'webp', which = 'max') => {
  const m = images[key];
  const w = which === 'max' ? m.sizes[m.sizes.length - 1] : m.sizes.find((s) => s >= which) || m.sizes[m.sizes.length - 1];
  return `/img/${key}-${m.v}-${w}.${ext}`;
};

export function picture(key, { alt = '', sizes = '100vw', cls = '', imgCls = '', loading = 'lazy', priority = false, attrs = '' } = {}) {
  const m = images[key];
  const mid = m.sizes[Math.min(1, m.sizes.length - 1)];
  return `<picture${cls ? ` class="${cls}"` : ''}${attrs ? ` ${attrs}` : ''}>`
    + `<source type="image/avif" srcset="${srcset(key, 'avif')}" sizes="${sizes}">`
    + `<img src="/img/${key}-${m.v}-${mid}.webp" srcset="${srcset(key, 'webp')}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"`
    + `${imgCls ? ` class="${imgCls}"` : ''} decoding="async"${priority ? ' fetchpriority="high"' : ` loading="${loading}"`}>`
    + `</picture>`;
}

export const button = (href, label, { variant = 'solid', ic = 'arrow', external = false, cls = '' } = {}) =>
  `<a class="btn btn-${variant}${cls ? ` ${cls}` : ''}" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>`
  + `<span>${t(label)}</span>${icon(external ? 'external' : ic)}${external ? '<span class="sr-only"> (nouvel onglet)</span>' : ''}</a>`;

export const textLink = (href, label, { external = false, ic } = {}) =>
  `<a class="text-link" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>`
  + `${t(label)}${icon(ic || (external ? 'external' : 'arrow'))}${external ? '<span class="sr-only"> (nouvel onglet)</span>' : ''}</a>`;

export const eyebrow = (s, cls = '') => `<p class="eyebrow${cls ? ` ${cls}` : ''}">${t(s)}</p>`;

export const sprig = (cls = '') => `<svg class="sprig${cls ? ` ${cls}` : ''}" aria-hidden="true" focusable="false"><use href="#i-sprig"/></svg>`;

function wordmark(variant = 'forest') {
  return `<a class="brand brand-${variant}" href="/" aria-label="${esc(brand.name)}, accueil">`
    + picture(`emblem-${variant}`, { sizes: '56px', cls: 'brand-emblem', loading: 'eager' })
    + `<span class="brand-text"><span class="brand-name">${t(brand.name)}</span>`
    + `<span class="brand-tag">${t(brand.tagline)}</span></span></a>`;
}

function header(active) {
  const links = nav
    .map((n) => `<a href="${n.href}"${n.id === active ? ' aria-current="page"' : ''}>${t(n.label)}</a>`)
    .join('');
  return `<header class="site-header" data-header>
  <div class="header-inner">
    ${wordmark('forest')}
    <nav class="main-nav" id="main-nav" aria-label="Navigation principale">${links}
      <a class="nav-cta" href="/gites/">${t('Choisir mon gîte')}${icon('arrow')}</a>
    </nav>
    <a class="btn btn-solid btn-sm header-cta" href="/gites/"><span>${t('Choisir mon gîte')}</span>${icon('arrow')}</a>
    <a class="menu-toggle" href="#footer-nav" aria-controls="main-nav" data-menu-toggle>
      <span class="menu-label">Menu</span>${icon('menu', 'icon-open')}${icon('close', 'icon-close')}
    </a>
  </div>
</header>`;
}

function bottomNav(active) {
  const items = [
    { id: 'gites', label: 'Les gîtes', href: '/gites/', ic: 'house' },
    { id: 'sejour', label: 'Mon séjour', href: '/sejour/', ic: 'book' },
    { id: 'sozen', label: 'So Zen', href: '/so-zen/', ic: 'lotus' },
  ];
  return `<nav class="bottom-nav" aria-label="Accès rapide">${items
    .map((i) => `<a href="${i.href}"${i.id === active ? ' aria-current="page"' : ''}>${icon(i.ic)}<span>${t(i.label)}</span></a>`)
    .join('')}</nav>`;
}

// TODO(gites): mentions légales (éditeur, hébergeur) and privacy page before the public launch — not in the kit.
function footer() {
  const links = [...nav, { label: 'Accueil', href: '/' }];
  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      ${picture('logo-linen', { alt: brand.name, sizes: '(max-width: 700px) 220px, 280px', cls: 'footer-logo' })}
    </div>
    <div class="footer-intro">
      ${eyebrow(brand.place)}
      <p class="footer-title">Le temps <em>de se retrouver.</em></p>
    </div>
    <div class="footer-cols">
      <div id="footer-nav">
        <p class="footer-head">Naviguer</p>
        <ul>${links.map((l) => `<li><a href="${l.href}">${t(l.label)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <p class="footer-head">Réserver</p>
        <ul>${gites
          .map((g) => `<li><a href="${esc(g.bookingUrl)}" target="_blank" rel="noopener noreferrer">${t(g.name)} · ${g.reference}${icon('external')}<span class="sr-only"> (Gîtes de France, nouvel onglet)</span></a></li>`)
          .join('')}</ul>
      </div>
      <div>
        <p class="footer-head">So Zen</p>
        <ul>
          <li><a href="${sozen.phoneHref}">${icon('phone')}${t(sozen.phone)}</a></li>
          <li><a href="${esc(sozen.facebookUrl)}" target="_blank" rel="noopener noreferrer">${icon('facebook')}Facebook<span class="sr-only"> (nouvel onglet)</span></a></li>
        </ul>
      </div>
    </div>
    <p class="footer-note">${t(`${brand.name} · Ardennes, bords de Meuse`)}<span>${t('Réservez votre escapade sur les plateformes liées.')}</span></p>
  </div>
</footer>`;
}

// TODO(gites): remove noindex (here and in vercel.json) once the owner validates the name, texts and photos
// and the final domain is set; then point SITE_URL to it. The printed QR card (09-qr/final) opens
// https://gites-de-chooz.vercel.app: keep that address alive (redirect) after any domain change.
export function layout({ id, nav: active, title, description, body, bodyClass = '' }) {
  const fullTitle = id === 'home' ? `${brand.name} · ${brand.concept}` : `${title} · ${brand.name}`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#203F35">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${esc(brand.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE_URL}/img/og-v1.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32-v1.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon-v1.png">
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="/src/styles/main.css">
<script type="module" src="/src/main.js"></script>
</head>
<body class="${bodyClass}">
${sprite()}
<a class="skip-link" href="#main">Aller au contenu</a>
${header(active)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${bottomNav(active)}
</body>
</html>
`;
}
