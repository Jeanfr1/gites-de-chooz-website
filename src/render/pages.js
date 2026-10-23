import hero from '../data/hero.json';
import images from '../data/images.json';
import {
  gites, carnet, tri, placeCategories, places, agenda, mapTowns, meuseCourse, sozen, sozenEvents, routes, LOCALES,
} from '../data/site.js';
import { icon, featureIcon, placeIcon, triIcon } from './icons.js';
import { L, LOC, setLocale, href } from './i18n.js';
import {
  layout, picture, button, textLink, eyebrow, sprig, t, esc, lines, facts, giteText, photoAlt, imgUrl, bookingButtons, platformName,
} from './ui.js';

const gite = (id) => gites.find((g) => g.id === id);
const fiche = (g) => href(`fiche-${g.id}`);
const carnetHref = (g) => href(`carnet-${g.id}`);
const h = (level, arr, { id = '', cls = '' } = {}) =>
  `<h${level}${id ? ` id="${id}"` : ''}${cls ? ` class="${cls}"` : ''} data-split>${lines(arr)}</h${level}>`;
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// Shared blocks
// ---------------------------------------------------------------------------

function tornEdge(cls, seed = 3) {
  // deterministic torn-paper edge (echoes the paper tiers of the hero)
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let d = 'M0 48 L0 26';
  for (let x = 0; x < 1440; x += 48) {
    const y1 = 18 + rnd() * 14;
    const y2 = 16 + rnd() * 16;
    d += ` C ${x + 16} ${y1.toFixed(1)}, ${x + 32} ${y2.toFixed(1)}, ${x + 48} ${(14 + rnd() * 16).toFixed(1)}`;
  }
  d += ' L1440 48 Z';
  return `<svg class="${cls}" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
}

const platformList = (g) => g.booking.map((b) => esc(platformName(b))).join(' · ');

// Carousel slide (home) and grid card (/gites/)
function giteCard(g, { headingLevel = 3, sizes = '(max-width: 700px) 80vw, 32vw', cls = 'gite-card', long = false } = {}) {
  const tag = `h${headingLevel}`;
  const tx = giteText(g);
  return `<article class="${cls}">
  <a class="gite-card-photo" href="${fiche(g)}" tabindex="-1" aria-hidden="true" data-anim="arch">
    ${picture(g.card, { alt: '', sizes })}
    <span class="photo-num">${g.number}</span>
  </a>
  <div class="gite-card-body">
    <p class="gite-card-facts">${t(facts(g))}</p>
    <${tag} class="gite-card-title"><a href="${fiche(g)}">${t(g.name)}</a></${tag}>
    <p class="gite-card-tagline">${t(tx.tagline)}</p>
    ${long ? `<p class="gite-card-text">${t(tx.description)}</p>` : ''}
    <p class="gite-card-platforms">${icon('calendar')}<span>${platformList(g)}</span></p>
    <div class="card-actions">
      ${button(fiche(g), L.ui.discover, { variant: long ? 'solid' : 'outline' })}
      ${long ? button(g.booking[0].url, `${L.ui.bookOn} ${platformName(g.booking[0])}`, { variant: 'outline', external: true }) : ''}
    </div>
  </div>
</article>`;
}

function sharedMoments(photoKey, note = '') {
  return `<section class="shared section" aria-labelledby="shared-title">
  <div class="container shared-grid">
    <div class="shared-photo" data-anim="arch" data-parallax>${picture(photoKey, { alt: `${L.photoKinds.pool}`, sizes: '(max-width: 820px) 92vw, 40vw', cls: 'arch' })}</div>
    <div class="shared-copy">
      ${eyebrow(L.shared.eyebrow)}
      ${h(2, L.shared.title, { id: 'shared-title' })}
      <ul class="shared-list" data-anim="stagger">
        <li>${icon('waves')}<span>${t(L.shared.pool)}${note ? ` ${t(note)}` : ''}</span></li>
        <li>${icon('trees')}<span>${t(L.shared.garden)}</span></li>
        <li>${icon('sparkle')}<span>${t(L.shared.palmeraie)} <a href="${href('palmeraie')}">${t(L.carnet.palmeraieLink)}</a></span></li>
      </ul>
    </div>
  </div>
</section>`;
}

const guideBand = (g) => `<section class="guide-band" aria-labelledby="guide-band-title" data-band>
  <div class="guide-band-bg" aria-hidden="true"></div>
  <div class="container guide-band-inner">
    <div>
      ${eyebrow(L.fiche.guideEyebrow, 'eyebrow-light')}
      ${h(2, L.fiche.guideTitle, { id: 'guide-band-title' })}
    </div>
    <div class="guide-band-cta" data-anim="fade">
      <p>${t(L.fiche.guideText)}</p>
      ${button(g ? carnetHref(g) : href('sejour'), g ? L.fiche.guideCta : L.ui.openCarnet, { variant: 'light' })}
    </div>
  </div>
</section>`;

// Schematic map of the Meuse, north to the right (Charleville-Mézières -> Namur).
const MAP_LABELS = {
  'Charleville-Mézières': { label: 'Charleville', dx: -12, dy: -18, anchor: 'start' },
  Vireux: { dx: 0, dy: -16, anchor: 'middle' },
  Givet: { dx: 12, dy: -12, anchor: 'start' },
  Dinant: { dx: 0, dy: 30, anchor: 'middle' },
  Namur: { dx: 0, dy: -18, anchor: 'middle' },
};
function meuseMap({ cls = '', title = L.exploreTeaser.mapAlt } = {}) {
  const W = 1000, pad = 70;
  const lat0 = 49.762, lat1 = 50.4674;
  const kx = (W - pad * 2) / (lat1 - lat0);
  const ky = kx * Math.cos((50.1 * Math.PI) / 180); // same km scale on both axes
  const lons = meuseCourse.map((c) => c[1]);
  const lonMin = Math.min(...lons);
  const top = 56; // room for the labels above the river
  const P = (lat, lon) => [pad + (lat - lat0) * kx, top + (lon - lonMin) * ky];
  const pts = meuseCourse.map(([la, lo]) => P(la, lo));
  const H = Math.ceil(Math.max(...pts.map((p) => p[1])) + 84); // room for the Chooz label below
  // Catmull-Rom -> cubic Bézier
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1.map((v) => v.toFixed(1)).join(' ')}, ${c2.map((v) => v.toFixed(1)).join(' ')}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const towns = mapTowns.filter((m) => m.home || MAP_LABELS[m.name]).map((m) => {
    const [x, y] = P(m.lat, m.lon);
    if (m.home) {
      return `<g class="map-home" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" data-pin>
        <circle class="map-pulse" r="18"/><circle class="map-dot" r="7"/>
        <path class="map-leader" d="M0 9 V30"/>
        <g class="map-home-label" transform="translate(0 50)"><rect x="-74" y="-19" width="148" height="36" rx="18"/><text y="5" text-anchor="middle">Chooz · So Dream</text></g>
      </g>`;
    }
    const o = MAP_LABELS[m.name];
    return `<g class="map-town" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" data-pin>
      <circle r="4.5"/><text x="${o.dx}" y="${o.dy}" text-anchor="${o.anchor}">${esc(o.label || m.name)}</text>
    </g>`;
  }).join('');
  const boat = `<g class="map-boat" data-boat><path d="M-11 0 H11 L6 6 H-6 Z"/><path d="M0 0 V-15 L9 -3 H0"/></g>`;
  return `<figure class="meuse-map${cls ? ` ${cls}` : ''}" data-meuse-map>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
      <path class="map-river-glow" d="${d}"/>
      <path class="map-river" d="${d}" data-river/>
      ${towns}
      ${boat}
      <g class="map-north" transform="translate(${W - 40} ${H - 22})"><path d="M-14 0 H10 M4 -6 L10 0 L4 6"/><text x="-22" y="6" text-anchor="end">N</text></g>
    </svg>
  </figure>`;
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

function heroScene() {
  const { w, h: hh } = hero.stage;
  const box = (b) => `left:${((b.x / w) * 100).toFixed(3)}%;top:${((b.y / hh) * 100).toFixed(3)}%;width:${((b.w / w) * 100).toFixed(3)}%;height:${((b.h / hh) * 100).toFixed(3)}%`;
  const layer = (key, b, name, sizes) =>
    `<div class="layer layer-${name}" data-layer="${name}" style="${box(b)}">${picture(key, { sizes, loading: 'eager', priority: name === 'brasserie' })}</div>`;
  return `<div class="hero-stage" data-stage role="img" aria-label="${esc(L.hero.alt)}" style="--open-up:${hero.open.up};--open-down:${hero.open.down}">
      <div class="layer layer-plate">${picture('hero-plate', { sizes: '(max-width: 900px) 180vw, 100vw', loading: 'eager' })}</div>
      ${layer('hero-grain', hero.layers.lower, 'grain', '(max-width: 900px) 160vw, 90vw')}
      <svg class="hero-thread" viewBox="0 0 ${w} ${hh}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs><filter id="thread-blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="4"/></filter></defs>
        <path class="thread-glow" d="${hero.thread}" pathLength="1" filter="url(#thread-blur)" data-thread/>
        <path class="thread-line" d="${hero.thread}" pathLength="1" data-thread/>
      </svg>
      ${layer('hero-brasserie', hero.layers.upper, 'brasserie', '(max-width: 900px) 120vw, 66vw')}
    </div>`;
}

function home() {
  const quick = [
    { id: 'gites', ic: 'house' },
    { id: 'sejour', ic: 'book' },
    { id: 'palmeraie', ic: 'palm' },
    { id: 'adresses', ic: 'compass' },
    { id: 'sozen', ic: 'lotus' },
  ];
  const body = `
<section class="hero" aria-labelledby="hero-title" data-hero>
  <div class="hero-track" data-hero-track>
    <div class="hero-sticky">
      <div class="hero-scene">${heroScene()}</div>
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-copy" data-hero-copy>
        <p class="eyebrow eyebrow-light" data-hero-in>${t(L.hero.eyebrow)}</p>
        <h1 id="hero-title" class="hero-title" data-hero-title><span>${t(L.hero.title[0])}</span> <em>${t(L.hero.title[1])}</em></h1>
        <p class="hero-sub" data-hero-in>${t(L.hero.sub[0])}<br>${t(L.hero.sub[1])}</p>
        <nav class="hero-quick" aria-label="${esc(L.hero.quickLabel)}" data-hero-quick>
          ${quick.map((q, i) => `<a class="${i === 0 ? 'is-main' : ''}" href="${href(q.id)}">${icon(q.ic)}<span>${t(L.hero.quick[q.id])}</span></a>`).join('')}
        </nav>
      </div>
      <p class="hero-hint" aria-hidden="true"><span></span>${t(L.ui.scrollHint)}</p>
      ${tornEdge('hero-edge')}
    </div>
  </div>
</section>

<section class="intro section" id="les-gites" aria-labelledby="intro-title" data-intro>
  <svg class="intro-thread" aria-hidden="true" focusable="false"><path pathLength="1" data-intro-thread/></svg>
  <div class="container intro-head">
    ${eyebrow(L.intro.eyebrow)}
    ${h(2, L.intro.title, { id: 'intro-title' })}
    <p class="intro-text" data-anim="fade">${L.intro.text.map(t).join('<br>')}</p>
  </div>
  <div class="carousel" data-carousel>
    <div class="carousel-track" role="region" aria-label="${esc(L.meta.gites.title)}" tabindex="0" data-carousel-track>
      ${gites.map((g) => giteCard(g, { cls: 'gite-slide' })).join('')}
    </div>
    <div class="container carousel-ui">
      <p class="carousel-hint">${icon('arrow')}<span>${t(L.intro.drag)}</span></p>
      <div class="carousel-progress" aria-hidden="true"><span data-carousel-bar></span></div>
      <div class="carousel-buttons" hidden data-carousel-buttons>
        <button type="button" data-carousel-prev aria-label="${esc(L.ui.previous)}">${icon('chevron-left')}</button>
        <button type="button" data-carousel-next aria-label="${esc(L.ui.next)}">${icon('chevron-right')}</button>
      </div>
    </div>
  </div>
</section>

<section class="guest-band" aria-labelledby="guest-title">
  <div class="container">
    <div class="guest-head">
      <div>
        ${eyebrow(L.guest.eyebrow, 'eyebrow-light')}
        ${h(2, L.guest.title, { id: 'guest-title' })}
      </div>
      <div class="guest-cta" data-anim="fade">
        <p>${t(L.guest.text)}</p>
        ${button(href('sejour'), L.ui.openCarnet, { variant: 'light' })}
      </div>
    </div>
    <ul class="guest-items" data-anim="stagger">
      ${L.guest.items.map(([title, text], i) => `<li>${icon(['wifi', 'recycle', 'waves', 'door'][i])}<span><b>${t(title)}</b>${t(text)}</span></li>`).join('')}
    </ul>
  </div>
  <div class="marquee" aria-hidden="true" data-marquee>
    <div class="marquee-track">${[0, 1].map(() => `<span class="marquee-group">${L.guest.marquee.map((w) => `<span>${esc(w)}</span><svg class="marquee-star" viewBox="0 0 20 20"><path d="M10 0C10.6 6.4 13.6 9.4 20 10 13.6 10.6 10.6 13.6 10 20 9.4 13.6 6.4 10.6 0 10 6.4 9.4 9.4 6.4 10 0Z"/></svg>`).join('')}</span>`).join('')}</div>
  </div>
</section>

<section class="sozen-teaser section" aria-labelledby="sozen-teaser-title">
  <div class="container sozen-teaser-grid">
    <div class="sozen-teaser-photo">
      <div class="sozen-teaser-frame" data-anim="iris">${picture(sozen.photos[0].key, { alt: L.photoKinds.yoga1, sizes: '(max-width: 820px) 92vw, 46vw', cls: 'arch' })}</div>
      <div class="breathe" aria-hidden="true" data-breathe>
        <span class="breathe-ring"></span><span class="breathe-ring breathe-ring-2"></span>
        <span class="breathe-words"><span>${t(L.sozenTeaser.breathe[0])}</span><span>${t(L.sozenTeaser.breathe[1])}</span></span>
      </div>
      ${sprig('sprig-a')}
    </div>
    <div class="sozen-teaser-copy">
      ${picture('sozen-logo', { alt: L.sozen.logoAlt, sizes: '160px', cls: 'sozen-mark', attrs: 'data-anim="spin-in"' })}
      ${eyebrow(L.sozenTeaser.eyebrow)}
      ${h(2, L.sozenTeaser.title, { id: 'sozen-teaser-title' })}
      <p class="lead" data-anim="fade">${t(L.sozenTeaser.lead)}</p>
      <div class="card-actions" data-anim="fade">
        ${button(href('sozen'), L.sozenTeaser.cta)}
        ${button(sozen.facebookUrl, L.sozenTeaser.follow, { variant: 'outline', external: true })}
      </div>
    </div>
  </div>
</section>

<section class="explore-teaser section" aria-labelledby="explore-teaser-title">
  <div class="container explore-grid">
    <div class="explore-copy">
      ${eyebrow(L.exploreTeaser.eyebrow)}
      ${h(2, L.exploreTeaser.title, { id: 'explore-teaser-title' })}
      <p data-anim="fade">${t(L.exploreTeaser.text)}</p>
      <div data-anim="fade">${button(href('adresses'), L.exploreTeaser.cta)}</div>
    </div>
    ${meuseMap()}
  </div>
</section>`;
  return layout({ routeId: 'home', title: L.meta.home.title, description: L.meta.home.description, body, bodyClass: 'page-home' });
}

// ---------------------------------------------------------------------------
// Les gîtes
// ---------------------------------------------------------------------------

function listing() {
  const cell = (g, html) => `<td>${html}</td>`;
  const row = (label, fn) => `<tr><th scope="row">${t(label)}</th>${gites.map((g) => cell(g, fn(g))).join('')}</tr>`;
  const body = `
<section class="page-head container" aria-labelledby="page-title">
  ${eyebrow(L.gites.eyebrow)}
  ${h(1, L.gites.title, { id: 'page-title' })}
  <p class="lead" data-anim="fade">${t(L.gites.lead)}</p>
</section>

<section class="section section-tight" aria-labelledby="page-title">
  <div class="container cards-grid">
    ${gites.map((g) => giteCard(g, { headingLevel: 2, long: true, sizes: '(max-width: 820px) 92vw, 44vw' })).join('')}
  </div>
</section>

<section class="section compare" aria-labelledby="compare-title">
  <div class="container">
    <div class="compare-head">
      ${eyebrow(L.gites.compareEyebrow)}
      ${h(2, L.gites.compareTitle, { id: 'compare-title' })}
    </div>
    <div class="table-wrap" tabindex="0" role="region" aria-labelledby="compare-title" data-compare>
      <table class="compare-table">
        <caption class="sr-only">${t(L.gites.compareCaption)}</caption>
        <thead><tr><td></td>${gites.map((g) => `<th scope="col"><a href="${fiche(g)}">${t(g.name)}</a></th>`).join('')}</tr></thead>
        <tbody>
          ${row(L.gites.rows.capacity, (g) => t(L.people(g.capacity)))}
          ${row(L.gites.rows.bedrooms, (g) => t(L.rooms(g.bedrooms)))}
          ${row(L.gites.rows.area, (g) => (g.area ? t(L.sqm(g.area)) : L.gites.areaUnknown))}
          ${row(L.gites.rows.energy, (g) => t(giteText(g).compare.energy))}
          ${row(L.gites.rows.pets, (g) => t(giteText(g).compare.pets))}
          ${row(L.gites.rows.linen, (g) => t(giteText(g).compare.linen))}
          ${row(L.gites.rows.booking, (g) => `<ul class="compare-platforms">${g.booking.map((b) => `<li>${textLink(b.url, platformName(b), { external: true })}</li>`).join('')}</ul>`)}
        </tbody>
      </table>
    </div>
    <p class="note">${t(L.gites.compareNote)}</p>
  </div>
</section>
${sharedMoments('sd-exterieur-8693')}
${guideBand(null)}`;
  return layout({ routeId: 'gites', nav: 'gites', title: L.meta.gites.title, description: L.meta.gites.description, body, bodyClass: 'page-gites' });
}

// ---------------------------------------------------------------------------
// Fiche gîte
// ---------------------------------------------------------------------------

function galleryData(g) {
  return g.photos.map((p) => {
    const m = images[p.key];
    return {
      avif: m.sizes.map((w) => `/img/${p.key}-${m.v}-${w}.avif ${w}w`).join(', '),
      webp: m.sizes.map((w) => `/img/${p.key}-${m.v}-${w}.webp ${w}w`).join(', '),
      src: imgUrl(p.key),
      w: m.w,
      h: m.h,
      alt: photoAlt(g, p),
    };
  });
}

function timesText(g) {
  if (!g.times) return `<p>${t(L.times.unknown)}</p>`;
  return `<p>${t(L.times.arrival(g.times))}<br>${t(L.times.departure(g.times))}</p>${g.times.variesByPlatform ? `<p class="small">${t(L.times.varies)}</p>` : ''}`;
}

function fichePage(id) {
  const g = gite(id);
  const tx = giteText(g);
  const n = g.photos.length;
  // the first photo already leads the page: the mosaic starts with the second one
  const shown = g.photos.slice(1, 7);
  const more = g.photos.slice(7);
  const tile = (p, i, cls = '') =>
    `<a class="tile${cls}" href="${imgUrl(p.key)}" data-gallery-index="${i}" aria-label="${esc(L.ui.enlarge(i + 1, n, photoAlt(g, p)))}">`
    + picture(p.key, { alt: photoAlt(g, p), sizes: cls ? '(max-width: 820px) 92vw, 50vw' : '(max-width: 820px) 46vw, 25vw' })
    + `</a>`;
  const others = gites.filter((o) => o.id !== g.id);
  const village = places.filter((p) => p.inVillage);
  const fact = (ic, label, value, unit) =>
    `<div>${icon(ic)}<dt>${t(label)}</dt><dd><b data-count="${value}">${value}</b> ${t(unit)}</dd></div>`;
  const unit = (fn, v) => fn(v).replace(/^\d+\s*/, '');
  const body = `
<section class="fiche-lead container" aria-labelledby="page-title">
  <div class="fiche-copy">
    <a class="back-link" href="${href('gites')}">${icon('arrow-left')}${t(L.ui.back)}</a>
    ${eyebrow(L.fiche.eyebrow(g))}
    <h1 id="page-title" data-split>${t(g.name)}</h1>
    <p class="lead" data-anim="fade">${t(tx.tagline)}</p>
    <p data-anim="fade">${t(tx.description)}</p>
    ${tx.rooms ? `<p class="fiche-rooms" data-anim="fade">${icon('bed')}<span>${t(tx.rooms)}</span></p>` : ''}
    <dl class="facts" data-anim="fade">
      ${fact('users', L.fiche.facts.capacity, g.capacity, unit(L.people, g.capacity))}
      ${fact('bed', L.fiche.facts.bedrooms, g.bedrooms, unit(L.rooms, g.bedrooms))}
      ${g.area ? fact('area', L.fiche.facts.area, g.area, 'm²') : ''}
    </dl>
    <div class="booking" data-anim="fade">
      <p class="booking-title">${t(L.ui.platformsTitle)}</p>
      <div class="booking-buttons">${bookingButtons(g)}</div>
      <p class="note">${t(L.fiche.bookNote)}</p>
    </div>
  </div>
  <div class="fiche-photo">
    <a class="fiche-photo-link" href="${imgUrl(g.photos[0].key)}" data-gallery-index="0" aria-label="${esc(L.ui.enlarge(1, n, photoAlt(g, g.photos[0])))}" data-anim="lead-photo">${picture(g.photos[0].key, { alt: photoAlt(g, g.photos[0]), sizes: '(max-width: 820px) 92vw, 46vw', cls: 'arch', loading: 'eager', priority: true })}</a>
    ${sprig('sprig-b')}
  </div>
</section>

<ul class="amenities container" style="--n:${g.features.length}" aria-label="${esc(L.fiche.galleryEyebrow)}" data-anim="stagger">
  ${g.features.map((f) => `<li>${icon(featureIcon[f] || 'leaf')}<span>${t(L.features[f])}</span></li>`).join('')}
</ul>

<section class="section gallery-section" aria-labelledby="gallery-title" data-gallery>
  <div class="container">
    <div class="gallery-head">
      <div>
        ${eyebrow(L.fiche.galleryEyebrow)}
        ${h(2, L.fiche.galleryTitle(g.name), { id: 'gallery-title' })}
      </div>
      <p class="gallery-count">${icon('images')}${t(L.ui.allPhotos(n))}</p>
    </div>
    <div class="mosaic" data-mosaic>
      ${shown.map((p, i) => tile(p, i + 1, i === 0 ? ' tile-main' : '')).join('')}
    </div>
    ${more.length ? `<details class="more-photos">
      <summary>${icon('images')}<span>${t(L.ui.morePhotos(more.length))}</span></summary>
      <div class="more-grid">${more.map((p, i) => tile(p, i + 7)).join('')}</div>
    </details>` : ''}
  </div>
  <dialog class="lightbox" aria-label="${esc(L.ui.photosOf(g.name))}" data-lightbox>
    <div class="lightbox-bar">
      <p class="lightbox-count" aria-live="polite" data-lightbox-count></p>
      <button type="button" class="lightbox-close" data-lightbox-close>${icon('close')}<span>${t(L.ui.close)}</span></button>
    </div>
    <figure class="lightbox-figure">
      <picture><source type="image/avif" data-lightbox-avif><img alt="" data-lightbox-img></picture>
      <figcaption data-lightbox-caption></figcaption>
    </figure>
    <div class="lightbox-nav">
      <button type="button" data-lightbox-prev>${icon('chevron-left')}<span>${t(L.ui.previous)}</span></button>
      <button type="button" data-lightbox-next><span>${t(L.ui.next)}</span>${icon('chevron-right')}</button>
    </div>
  </dialog>
  <script type="application/json" data-gallery-data>${JSON.stringify(galleryData(g)).replace(/</g, '\\u003c')}</script>
</section>

<section class="section conditions" aria-labelledby="conditions-title">
  <div class="container">
    <div class="conditions-head">
      ${eyebrow(L.fiche.conditionsEyebrow)}
      ${h(2, L.fiche.conditionsTitle, { id: 'conditions-title' })}
    </div>
    <div class="conditions-grid" data-anim="flip-cards">
      <div>${icon('leaf')}<h3>${t(L.fiche.energy)}</h3><p>${t(tx.energy)}</p></div>
      <div>${icon('paw')}<h3>${t(L.fiche.pets)}</h3><p>${t(tx.pets)}</p></div>
      <div>${icon('bed')}<h3>${t(L.fiche.linen)}</h3><p>${t(tx.linen)}</p></div>
      <div>${icon('key')}<h3>${t(L.fiche.times)}</h3>${timesText(g)}</div>
    </div>
  </div>
</section>
${g.sharedGardenPool ? sharedMoments(g.id === 'grain' ? 'sd-exterieur-8693' : 'sd-exterieur-piscine-table', tx.pool || '') : `
<section class="section village" aria-labelledby="village-title">
  <div class="container village-grid">
    <div class="village-copy">
      ${eyebrow(L.fiche.villageEyebrow)}
      ${h(2, L.fiche.villageTitle, { id: 'village-title' })}
      <p data-anim="fade">${t(L.fiche.villageText)}</p>
      <div data-anim="fade">${button(href('adresses'), L.fiche.villageCta, { variant: 'outline' })}</div>
    </div>
    <ul class="village-list" data-anim="stagger">
      ${village.map((p) => `<li>${icon(placeIcon[p.cat])}<span><b>${t(p.name)}</b>${t(L.placeKinds[p.kind])}</span></li>`).join('')}
    </ul>
  </div>
</section>`}
${guideBand(g)}
<section class="section other-gites" aria-labelledby="other-title">
  <div class="container">
    ${eyebrow(L.ui.otherGites)}
    <h2 id="other-title" class="sr-only">${t(L.ui.otherGites)}</h2>
    <div class="other-grid" data-anim="stagger">
      ${others.map((o) => `<a class="other-card" href="${fiche(o)}">
        ${picture(o.card, { alt: '', sizes: '(max-width: 700px) 92vw, 30vw', cls: 'other-photo' })}
        <span class="other-body"><span class="other-facts">${t(facts(o))}</span><span class="other-name">${t(o.name)}</span><span class="other-tag">${t(giteText(o).tagline)}</span></span>
        ${icon('arrow')}
      </a>`).join('')}
    </div>
  </div>
</section>`;
  const meta = L.meta.fiche({ ...g, tagline: tx.tagline });
  return layout({ routeId: `fiche-${g.id}`, nav: 'gites', title: meta.title, description: meta.description, body, bodyClass: `page-fiche page-${g.id}` });
}

// ---------------------------------------------------------------------------
// Carnet de séjour
// ---------------------------------------------------------------------------

const carnetFor = (g) => carnet.filter((c) => c.scope !== 'pool' || g.sharedGardenPool).map((c, i) => ({ ...c, n: String(i + 1).padStart(2, '0') }));

function sejourIndex() {
  const body = `
<section class="page-head container" aria-labelledby="page-title">
  ${eyebrow(L.sejour.eyebrow)}
  ${h(1, L.sejour.title, { id: 'page-title' })}
  <p class="lead" data-anim="fade">${t(L.sejour.lead)}</p>
</section>
<section class="section section-tight" aria-label="${esc(L.ui.chooseGite)}">
  <div class="container chooser" data-anim="stagger">
    ${gites.map((g) => `<article class="chooser-card" data-tilt>
      ${picture(g.card, { alt: '', sizes: '(max-width: 700px) 30vw, 180px', cls: 'chooser-photo' })}
      <div class="chooser-body">
        <h2>${t(g.name)}</h2>
        <p class="chooser-facts">${t(facts(g))}</p>
        <ul>${L.sejour.quick.map((q) => `<li>${t(q)}</li>`).join('')}</ul>
        ${button(carnetHref(g), L.ui.openCarnet)}
      </div>
    </article>`).join('')}
  </div>
</section>
<section class="section carnet-index" aria-labelledby="index-title">
  <div class="container">
    ${eyebrow(L.sejour.indexEyebrow)}
    <h2 id="index-title" class="h3" data-split>${t(L.sejour.indexTitle)}</h2>
    <ol class="index-grid" data-anim="stagger">
      ${carnet.map((c) => `<li>${icon(c.icon)}<span class="index-n">${c.n}</span><span>${t(L.carnet.items[c.id].title)}</span></li>`).join('')}
    </ol>
  </div>
</section>`;
  return layout({ routeId: 'sejour', nav: 'sejour', title: L.meta.sejour.title, description: L.meta.sejour.description, body, bodyClass: 'page-sejour' });
}

const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function triGuide() {
  return `<section class="section tri" id="tri" aria-labelledby="tri-title" data-tri>
  <div class="container">
    <div class="tri-head">
      <div>
        ${eyebrow(L.carnet.triEyebrow)}
        ${h(2, L.carnet.triTitle, { id: 'tri-title' })}
      </div>
      <div class="tri-search" hidden data-tri-search>
        <label for="tri-q">${t(L.carnet.triLead)}</label>
        <div class="tri-field">${icon('search')}<input id="tri-q" type="search" autocomplete="off" placeholder="${esc(L.carnet.triSearch)}" aria-describedby="tri-out" data-tri-input></div>
        <p id="tri-out" class="tri-out" aria-live="polite" data-tri-out></p>
      </div>
    </div>
    <div class="bins" data-anim="bins">
      ${tri.map((b) => {
        const tb = L.tri[b.id];
        return `<article class="bin bin-${b.tone}" data-bin="${esc(tb.name)}">
        <div class="bin-head">${icon(triIcon[b.id])}<div><h3>${t(tb.name)}</h3><p class="bin-where">${t(tb.where)}</p></div></div>
        <ul>${tb.items.map((it) => `<li data-q="${esc(fold(it))}">${t(it)}</li>`).join('')}</ul>
        <p class="bin-tip">${t(tb.tip)}</p>
      </article>`;
      }).join('')}
    </div>
    <p class="note" hidden data-tri-none>${t(L.carnet.triNone)}</p>
  </div>
</section>`;
}

function departure(g) {
  return `<section class="section depart" id="depart" aria-labelledby="depart-title">
  <div class="container depart-grid">
    <div class="depart-head">
      ${eyebrow(L.carnet.departEyebrow)}
      ${h(2, L.carnet.departTitle, { id: 'depart-title' })}
      <div class="depart-ring" hidden data-depart-ring aria-hidden="true">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle class="ring-fill" cx="60" cy="60" r="52" pathLength="1"/></svg>
        <span data-depart-count>0/${L.carnet.departItems.length}</span>
      </div>
    </div>
    <div class="depart-note" data-anim="note" data-checklist="${g.slug}">
      <p>${t(L.carnet.departIntro)}</p>
      <ul class="depart-list">
        ${L.carnet.departItems.map((it, i) => `<li><label><input type="checkbox" name="depart-${i}"><span class="tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19.5 7" pathLength="1"/></svg></span><span>${t(it)}</span></label></li>`).join('')}
      </ul>
      <p>${t(L.carnet.departOutro)}</p>
      <p class="depart-sign">${t(L.carnet.departSign)}</p>
      <p class="depart-done" hidden data-depart-done aria-hidden="true">${picture('brand-disc', { sizes: '34px', cls: 'stamp-emblem' })}<span>So Dream</span>${icon('check')}</p>
    </div>
  </div>
</section>`;
}

function carnetPage(id) {
  const g = gite(id);
  const tx = giteText(g);
  const items = carnetFor(g);
  const text = (c) => {
    const it = L.carnet.items[c.id];
    switch (c.id) {
      case 'energy': return `<p>${t(tx.energy)}</p>`;
      case 'petsLinen': return tx.pets === tx.linen ? `<p>${t(tx.pets)}</p>` : `<p>${t(tx.pets)}</p><p>${t(tx.linen)}</p>`;
      case 'times': return `${timesText(g)}<p><a href="#depart">${t(L.times.reminder)}</a></p>`;
      case 'tri': return `<p>${t(it.text)}</p><p><a href="#tri">${t(L.carnet.triEyebrow)}</a></p>`;
      case 'palmeraie': return `<p>${t(it.text)}</p><p><a href="${href('palmeraie')}">${t(L.carnet.palmeraieLink)}</a></p>`;
      case 'pool': return `<p>${t(it.text)}</p>${tx.pool ? `<p>${t(tx.pool)}</p>` : ''}`;
      default: return `<p>${t(it.text)}</p>`;
    }
  };
  const ref = g.booking.find((b) => b.ref)?.ref;
  const body = `
<section class="page-head container carnet-head" aria-labelledby="page-title">
  ${eyebrow(L.carnet.eyebrow)}
  ${h(1, L.carnet.title, { id: 'page-title' })}
  <p class="carnet-property" data-anim="fade">${t(g.name)} · ${t(L.people(g.capacity))}${ref ? ` · ${ref}` : ''}</p>
  <nav class="switcher" aria-label="${esc(L.carnet.switcherLabel)}" data-anim="fade">
    <span class="switcher-label">${t(L.carnet.switcher)}</span>
    <div class="switcher-options">
      ${gites.map((x) => `<a href="${carnetHref(x)}"${x.id === g.id ? ' aria-current="page"' : ''}>${t(x.name)}</a>`).join('')}
    </div>
  </nav>
</section>
<section class="section section-tight carnet" aria-label="${esc(L.meta.carnet(g).title)}">
  <div class="container">
    <ol class="carnet-list" data-timeline>
      <span class="carnet-line" aria-hidden="true"><span data-timeline-fill></span></span>
      ${items.map((c) => `<li class="carnet-item" data-timeline-item>
        <div class="carnet-item-head">${icon(c.icon)}<span class="carnet-n">${c.n}</span></div>
        <div class="carnet-item-body">
          <h2>${t(L.carnet.items[c.id].title)}</h2>
          ${text(c)}
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>
${triGuide()}
${departure(g)}
<section class="section section-tight carnet-end">
  <div class="container carnet-foot">
    <p>${t(L.carnet.foot)}</p>
    <div class="carnet-actions">
      <button type="button" class="btn btn-solid" data-print hidden><span class="btn-label">${t(L.ui.print)}</span>${icon('printer')}</button>
      ${textLink(g.booking[0].url, `${L.carnet.myBooking} · ${platformName(g.booking[0])}`, { external: true })}
    </div>
  </div>
</section>`;
  const meta = L.meta.carnet(g);
  return layout({ routeId: `carnet-${g.id}`, nav: 'sejour', title: meta.title, description: meta.description, body, bodyClass: 'page-carnet' });
}

// ---------------------------------------------------------------------------
// La Palmeraie
// ---------------------------------------------------------------------------

// Line drawing: a glasshouse with two palms, under the So Dream moon and stars.
function palmArt() {
  const frond = (x, y, s, dir) => {
    const k = dir * s;
    return [
      `M${x} ${y} C${x - 18 * k} ${y - 20 * s}, ${x - 48 * k} ${y - 18 * s}, ${x - 66 * k} ${y + 4 * s}`,
      `M${x} ${y} C${x - 22 * k} ${y - 4 * s}, ${x - 46 * k} ${y + 8 * s}, ${x - 56 * k} ${y + 34 * s}`,
      `M${x} ${y} C${x + 16 * k} ${y - 24 * s}, ${x + 44 * k} ${y - 24 * s}, ${x + 64 * k} ${y - 4 * s}`,
      `M${x} ${y} C${x + 22 * k} ${y - 6 * s}, ${x + 46 * k} ${y + 6 * s}, ${x + 58 * k} ${y + 30 * s}`,
      `M${x} ${y} C${x + 2 * k} ${y - 26 * s}, ${x + 20 * k} ${y - 42 * s}, ${x + 40 * k} ${y - 34 * s}`,
    ].join(' ');
  };
  const star = (x, y, r) => `M${x} ${y - r} C${x + r * 0.11} ${y - r * 0.28}, ${x + r * 0.28} ${y - r * 0.11}, ${x + r} ${y} C${x + r * 0.28} ${y + r * 0.11}, ${x + r * 0.11} ${y + r * 0.28}, ${x} ${y + r} C${x - r * 0.11} ${y + r * 0.28}, ${x - r * 0.28} ${y + r * 0.11}, ${x - r} ${y} C${x - r * 0.28} ${y - r * 0.11}, ${x - r * 0.11} ${y - r * 0.28}, ${x} ${y - r} Z`;
  return `<svg class="palm-art" viewBox="0 0 400 400" aria-hidden="true" focusable="false" data-draw-art>
    <g class="pa-ink">
      <path d="M24 362 H376"/>
      <path d="M80 362 V200 A120 120 0 0 1 320 200 V362"/>
      <path d="M200 80 V362 M140 96.1 V362 M260 96.1 V362 M80 252 H320"/>
      <path d="M100 252 V200 A100 100 0 0 1 300 200 V252"/>
      <path d="M152 362 C154 324 148 296 158 256"/>
      <path d="${frond(158, 256, 0.8, 1)}"/>
      <path d="M246 362 C242 314 250 274 240 214"/>
      <path d="${frond(240, 214, 1, -1)}"/>
      <path d="M96 362 C92 344 104 336 112 346 C116 330 134 334 130 350 C138 344 146 352 140 362"/>
      <path d="M270 362 C266 346 280 338 288 350 C294 336 312 342 306 362"/>
      <path d="M332 84 A26 26 0 1 1 304 52 A20 20 0 1 0 332 84 Z"/>
    </g>
    <g class="pa-stars"><path d="${star(352, 132, 8)}"/><path d="${star(60, 120, 6)}"/><path d="${star(96, 64, 4.5)}"/></g>
  </svg>`;
}

function palmeraiePage() {
  const P = L.palmeraie;
  const body = `
<section class="palm-hero" aria-labelledby="page-title" data-curtain>
  <div class="curtain" aria-hidden="true"><span></span><span></span></div>
  <div class="container palm-hero-grid">
    <div class="palm-copy">
      ${eyebrow(P.eyebrow, 'eyebrow-light')}
      <h1 id="page-title" data-split>${lines(P.title, { br: false })}</h1>
      <p class="palm-status" data-anim="fade"><span class="status-dot"></span>${t(P.status)}</p>
      <p class="lead" data-anim="fade">${t(P.lead)}</p>
      <p data-anim="fade">${t(P.text)}</p>
    </div>
    ${palmArt()}
  </div>
  ${tornEdge('palm-edge', 11)}
</section>

<section class="section palm-blocks" aria-label="${esc(P.title.join(' '))}">
  <div class="container palm-grid" data-anim="stagger">
    ${P.blocks.map((b, i) => `<article class="palm-block">
      <span class="palm-n">0${i + 1}</span>
      ${icon(['sparkle', 'billiard', 'heartHand'][i], 'icon-lg')}
      <h2 class="h3">${t(b.title)}</h2>
      <p>${t(b.text)}</p>
    </article>`).join('')}
  </div>
</section>

<section class="section palm-contact" aria-labelledby="contact-title">
  <div class="container palm-contact-inner">
    <div>
      ${eyebrow(P.contactEyebrow)}
      ${h(2, P.contactTitle, { id: 'contact-title' })}
      <p data-anim="fade">${t(P.contactText)}</p>
    </div>
    <div class="card-actions" data-anim="fade">
      <a class="btn btn-solid" href="${sozen.phoneHref}"><span class="btn-label">${t(P.callCta)} · ${esc(LOC === 'fr' ? sozen.phone : sozen.phoneIntl)}</span>${icon('phone')}</a>
      ${button(sozen.facebookUrl, P.fbCta, { variant: 'outline', external: true })}
    </div>
  </div>
</section>`;
  return layout({ routeId: 'palmeraie', nav: 'palmeraie', title: L.meta.palmeraie.title, description: L.meta.palmeraie.description, body, bodyClass: 'page-palmeraie' });
}

// ---------------------------------------------------------------------------
// Bonnes adresses
// ---------------------------------------------------------------------------

function agendaCards() {
  const fmt = new Intl.DateTimeFormat(L.dateLocale, { weekday: 'long' });
  const fmtMonth = new Intl.DateTimeFormat(L.dateLocale, { month: 'short', year: 'numeric' });
  const items = agenda
    .flatMap((a) => a.dates.map((date) => ({ ...a, date })))
    .filter((a) => a.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!items.length) return `<p class="agenda-empty">${t(L.adresses.agendaEmpty)}</p>`;
  return `<ol class="agenda-list" data-anim="calendar">${items.map((a) => {
    const d = new Date(`${a.date}T12:00:00`);
    const tx = L.agenda[a.id];
    const theme = tx.themes?.[a.date];
    return `<li class="agenda-item" data-date="${a.date}">
      <time class="agenda-date" datetime="${a.date}"><span class="agenda-day">${d.getDate()}</span><span class="agenda-month">${esc(fmtMonth.format(d))}</span><span class="agenda-weekday">${esc(fmt.format(d))}</span></time>
      <div class="agenda-body">
        <h3>${t(tx.title)}${theme ? ` · <em>${t(theme)}</em>` : ''}</h3>
        <p>${t(tx.text)}</p>
        <p class="agenda-meta">${icon('pin')}<span>${t(a.place)}${a.town !== a.place ? ` · ${t(a.town)}` : ''}</span>${tx.price ? `<span class="agenda-price">${t(tx.price)}</span>` : ''}</p>
        ${a.phone ? `<a class="text-link" href="${a.phoneHref}">${icon('phone')}<span>${t(tx.book)} · ${esc(a.phone)}</span></a>` : ''}
        ${a.url ? textLink(a.url, L.adresses.link, { external: true }) : ''}
      </div>
    </li>`;
  }).join('')}</ol><p class="agenda-empty" hidden data-agenda-empty>${t(L.adresses.agendaEmpty)}</p>`;
}

function adressesPage() {
  const country = new Intl.DisplayNames([L.dateLocale], { type: 'region' });
  const where = (p) => p.town || country.of(p.country);
  const km = (v) => new Intl.NumberFormat(L.dateLocale).format(v);
  const cats = placeCategories.filter((c) => c === 'all' || places.some((p) => p.cat === c));
  const body = `
<section class="page-head container" aria-labelledby="page-title">
  ${eyebrow(L.adresses.eyebrow)}
  ${h(1, L.adresses.title, { id: 'page-title' })}
  <p class="lead" data-anim="fade">${t(L.adresses.lead)}</p>
</section>
<section class="section section-tight" aria-labelledby="page-title" data-filters>
  <div class="container">
    <div class="filters" role="group" aria-label="${esc(L.adresses.filters)}" hidden data-filter-group>
      ${cats.map((c) => `<button type="button" data-filter="${c}" aria-pressed="${c === 'all'}">${icon(placeIcon[c])}<span>${t(L.adresses.categories[c])}</span></button>`).join('')}
    </div>
    <p class="filter-result" aria-live="polite" data-filter-result data-labels="${esc(JSON.stringify(places.map((_, i) => L.ideas(i)).concat(L.ideas(places.length))))}">${t(L.ideas(places.length))}</p>
    <div class="places" data-places>
      ${places.map((p) => `<article class="place${p.trail ? ` place-trail trail-${p.trail.color}` : ''}" data-category="${p.cat}">
        <div class="place-top">${icon(placeIcon[p.cat])}<span class="place-cat">${t(L.adresses.categories[p.cat])}</span>${p.inVillage ? `<span class="place-badge">${t(L.adresses.inVillage)}</span>` : ''}</div>
        <h2>${t(p.name)}</h2>
        <p class="place-kind">${t(L.placeKinds[p.kind])}</p>
        ${p.trail ? `<p class="place-trail-line"><span class="trail-dot" aria-hidden="true"></span>${t(L.hike.trail(p.trail.n, L.hike.colors[p.trail.color]))}</p>
        <p class="place-stats">${t(L.hike.stats(km(p.trail.km), p.trail.h, p.trail.m, p.trail.up))}</p>` : ''}
        <p class="place-where">${icon('pin')}${t(where(p))}</p>
        ${p.url ? textLink(p.url, L.adresses.link, { external: true }) : ''}
      </article>`).join('')}
    </div>
    <p class="note">${t(L.adresses.note)} ${t(L.hike.note)}</p>
  </div>
</section>
<section class="section agenda" id="agenda" aria-labelledby="agenda-title" data-agenda>
  <div class="container">
    ${eyebrow(L.adresses.agendaEyebrow)}
    ${h(2, L.adresses.agendaTitle, { id: 'agenda-title' })}
    ${agendaCards()}
  </div>
</section>
<section class="section map-section" aria-labelledby="map-title">
  <div class="container">
    <h2 id="map-title" class="h3" data-split>${t(L.adresses.mapTitle)}</h2>
    ${meuseMap({ title: L.exploreTeaser.mapAlt })}
  </div>
</section>`;
  return layout({ routeId: 'adresses', nav: 'adresses', title: L.meta.adresses.title, description: L.meta.adresses.description, body, bodyClass: 'page-adresses' });
}

// ---------------------------------------------------------------------------
// So Zen
// ---------------------------------------------------------------------------

// So Zen calendar: sozenEvents in src/data/site.js (past dates hide at build time and in the browser).
function sozenCalendar() {
  const Z = L.sozen;
  const fmtDay = new Intl.DateTimeFormat(L.dateLocale, { weekday: 'long' });
  const fmtMonth = new Intl.DateTimeFormat(L.dateLocale, { month: 'short', year: 'numeric' });
  const hm = (v) => (LOC === 'fr' ? v.replace(':00', '\u00A0h').replace(':', '\u00A0h\u00A0') : v);
  const items = sozenEvents.filter((e) => e.date >= TODAY).sort((a, b) => (a.date + (a.start || '')).localeCompare(b.date + (b.start || '')));
  const phone = esc(LOC === 'fr' ? sozen.phone : sozen.phoneIntl);
  const empty = `<div class="zen-cal-empty"${items.length ? ' hidden' : ''} data-agenda-empty>
      ${icon('calendar', 'icon-lg')}
      <p>${t(Z.calendarEmpty)}</p>
      <div class="card-actions">
        ${button(sozen.facebookUrl, Z.fbCta, { external: true })}
        <a class="btn btn-outline" href="${sozen.phoneHref}"><span class="btn-label">${phone}</span>${icon('phone')}</a>
      </div>
    </div>`;
  const list = items.length ? `<ol class="agenda-list" data-anim="calendar">${items.map((e) => {
    const d = new Date(`${e.date}T12:00:00`);
    const time = e.start ? `${hm(e.start)}${e.end ? ` – ${hm(e.end)}` : ''}` : '';
    return `<li class="agenda-item" data-date="${e.date}">
      <time class="agenda-date" datetime="${e.date}"><span class="agenda-day">${d.getDate()}</span><span class="agenda-month">${esc(fmtMonth.format(d))}</span><span class="agenda-weekday">${esc(fmtDay.format(d))}</span></time>
      <div class="agenda-body">
        <h3>${t(e.title || Z.eventTypes[e.type] || Z.eventTypes.other)}</h3>
        ${e.text ? `<p>${t(e.text)}</p>` : ''}
        <p class="agenda-meta">${time ? `${icon('clock')}<span>${t(time)}</span>` : ''}${e.place ? `${icon('pin')}<span>${t(e.place)}</span>` : ''}</p>
        <a class="text-link" href="${sozen.phoneHref}">${icon('phone')}<span>${t(e.type === 'noel' ? Z.calendarInfo : Z.calendarBook)} · ${phone}</span></a>
      </div>
    </li>`;
  }).join('')}</ol>` : '';
  return `<section class="section zen-calendar" id="agenda" aria-labelledby="zen-cal-title" data-agenda>
  <div class="container">
    ${eyebrow(Z.calendarEyebrow)}
    ${h(2, Z.calendarTitle, { id: 'zen-cal-title' })}
    ${list}
    ${empty}
  </div>
</section>`;
}

function sozenPage() {
  const Z = L.sozen;
  const [p1, p2] = sozen.photos;
  const body = `
<section class="zen-lead container" aria-labelledby="page-title">
  <div class="zen-copy">
    <div class="zen-identity">
      ${picture('sozen-logo', { alt: Z.logoAlt, sizes: '(max-width: 700px) 150px, 210px', cls: 'zen-logo', loading: 'eager', attrs: 'data-anim="spin-in"' })}
      <p class="zen-wordmark">So Zen</p>
      <p class="zen-place">${t(Z.place)}</p>
    </div>
    ${h(1, Z.title, { id: 'page-title' })}
    <p class="lead" data-anim="fade">${t(Z.lead)}</p>
    <p data-anim="fade">${t(Z.text)}</p>
    <div data-anim="fade"><a class="btn btn-solid btn-fb" href="${esc(sozen.facebookUrl)}" target="_blank" rel="noopener noreferrer"><span class="btn-label">${t(Z.fbCta)}</span>${icon('facebook')}<span class="sr-only"> ${t(L.ui.newTab)}</span></a></div>
    <ul class="zen-contact" data-anim="fade">
      <li><a href="${sozen.phoneHref}">${icon('phone')}${esc(LOC === 'fr' ? sozen.phone : sozen.phoneIntl)}</a></li>
      <li>${icon('pin')}${t(sozen.address)}</li>
    </ul>
  </div>
  <div class="zen-photos" data-zen-photos>
    <div class="zen-main-wrap" data-anim="iris">${picture(p1.key, { alt: L.photoKinds[p1.kind], sizes: '(max-width: 820px) 88vw, 46vw', cls: 'arch zen-main', loading: 'eager', priority: true })}</div>
    <figure class="zen-inset" data-anim="polaroid">${picture(p2.key, { alt: L.photoKinds[p2.kind], sizes: '(max-width: 820px) 56vw, 24vw' })}</figure>
    <div class="breathe breathe-sm" aria-hidden="true" data-breathe>
      <span class="breathe-ring"></span><span class="breathe-ring breathe-ring-2"></span>
      <span class="breathe-words"><span>${t(L.sozenTeaser.breathe[0])}</span><span>${t(L.sozenTeaser.breathe[1])}</span></span>
    </div>
    ${sprig('sprig-c')}${sprig('sprig-d')}
  </div>
</section>

<section class="zen-mantra" aria-label="${esc(Z.mantra.join(' '))}">
  <div class="marquee marquee-zen" aria-hidden="true" data-marquee>
    <div class="marquee-track">${[0, 1].map(() => `<span class="marquee-group">${[0, 1].map(() => `<span>${t(Z.mantra[0])}</span><em>${t(Z.mantra[1])}</em><svg class="marquee-star" viewBox="0 0 20 20"><path d="M10 0C10.6 6.4 13.6 9.4 20 10 13.6 10.6 10.6 13.6 10 20 9.4 13.6 6.4 10.6 0 10 6.4 9.4 9.4 6.4 10 0Z"/></svg>`).join('')}</span>`).join('')}</div>
  </div>
</section>

<section class="section yoga-story" aria-labelledby="yoga-title">
  <div class="container yoga-story-inner">
    ${eyebrow(Z.storyEyebrow)}
    ${h(2, Z.storyTitle, { id: 'yoga-title' })}
    <div class="yoga-story-text" data-anim="fade">
      ${Z.story.map((p) => `<p>${t(p)}</p>`).join('')}
      ${textLink(sozen.facebookUrl, Z.storyCta, { external: true })}
    </div>
  </div>
</section>

${sozenCalendar()}

<section class="section section-tight zen-palmeraie" aria-labelledby="zen-palm-title">
  <a class="container zen-palm-inner" href="${href('palmeraie')}" data-anim="fade">
    ${icon('palm', 'icon-lg')}
    <span>
      <span class="eyebrow">${t(Z.palmeraieEyebrow)}</span>
      <span id="zen-palm-title" class="h3">${t(Z.palmeraieTitle)}</span>
      <span class="zen-palm-text">${t(Z.palmeraieText)}</span>
      <span class="text-link"><span>${t(Z.palmeraieCta)}</span>${icon('arrow')}</span>
    </span>
  </a>
</section>`;
  return layout({ routeId: 'sozen', nav: 'sozen', title: L.meta.sozen.title, description: L.meta.sozen.description, body, bodyClass: 'page-sozen' });
}

// ---------------------------------------------------------------------------
// 404 (one page, French, with links to every language)
// ---------------------------------------------------------------------------

function notFound() {
  const body = `
<section class="page-head container not-found" aria-labelledby="page-title">
  ${eyebrow(L.notFound.eyebrow)}
  ${h(1, L.notFound.title, { id: 'page-title' })}
  <p class="lead">${t(L.notFound.lead)}</p>
  <div class="card-actions">
    ${button(href('home'), L.notFound.home)}
    ${button(href('gites'), L.ui.chooseGite, { variant: 'outline' })}
  </div>
</section>`;
  return layout({ routeId: null, title: L.meta.notFound.title, description: L.meta.notFound.description, body, bodyClass: 'page-404' });
}

// ---------------------------------------------------------------------------

function renderRoute(route) {
  if (!route) return notFound();
  if (route.id === 'home') return home();
  if (route.id === 'gites') return listing();
  if (route.id === 'sejour') return sejourIndex();
  if (route.id === 'palmeraie') return palmeraiePage();
  if (route.id === 'adresses') return adressesPage();
  if (route.id === 'sozen') return sozenPage();
  if (route.id.startsWith('fiche-')) return fichePage(route.gite);
  if (route.id.startsWith('carnet-')) return carnetPage(route.gite);
  throw new Error(`No renderer for ${route.id}`);
}

export const pages = [
  ...LOCALES.flatMap((l) => routes.map((r) => ({
    id: `${l}/${r.id}`,
    file: `${l === 'fr' ? '' : `${l}/`}${r.path}index.html`,
    locale: l,
    route: r,
  }))),
  { id: 'fr/404', file: '404.html', locale: 'fr', route: null },
];

export function renderPage(id) {
  const p = pages.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown page ${id}`);
  setLocale(p.locale);
  return renderRoute(p.route);
}
