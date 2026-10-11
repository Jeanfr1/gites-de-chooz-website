import hero from '../data/hero.json';
import images from '../data/images.json';
import { brand, gites, shared, carnet, outings, outingCategories, sozen } from '../data/site.js';
import { icon, featureIcon } from './icons.js';
import { layout, picture, button, textLink, eyebrow, sprig, t, esc, facts, people, rooms, imgUrl } from './ui.js';

const gite = (id) => gites.find((g) => g.id === id);
const other = (g) => gites.find((o) => o.id !== g.id);

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

function giteCard(g, { headingLevel = 3, sizes = '(max-width: 820px) 92vw, 44vw' } = {}) {
  const h = `h${headingLevel}`;
  return `<article class="gite-card" data-reveal>
  <a class="gite-card-photo" href="/gites/${g.slug}/" tabindex="-1" aria-hidden="true">
    ${picture(g.photos[0].key, { alt: '', sizes })}
    <span class="photo-num">${g.number}</span>
  </a>
  <div class="gite-card-body">
    ${eyebrow(facts(g))}
    <${h} class="gite-card-title"><a href="/gites/${g.slug}/">${t(g.name)}</a></${h}>
    <p class="gite-card-tagline">${t(g.tagline)}</p>
    <p class="gite-card-text">${t(g.description)}</p>
    <div class="card-actions">
      ${button(`/gites/${g.slug}/`, 'Découvrir')}
      ${button(g.bookingUrl, 'Réserver', { variant: 'outline', external: true })}
    </div>
  </div>
</article>`;
}

function sharedMoments(photoKey, photoAlt) {
  return `<section class="shared section" aria-labelledby="shared-title">
  <div class="container shared-grid">
    <div class="shared-photo" data-reveal>${picture(photoKey, { alt: photoAlt, sizes: '(max-width: 820px) 92vw, 40vw', cls: 'arch' })}</div>
    <div class="shared-copy" data-reveal>
      ${eyebrow('Les moments partagés')}
      <h2 id="shared-title">Un jardin.<br><em>Des instants à savourer.</em></h2>
      <ul class="shared-list">
        <li>${icon('waves')}<span>${t(shared.pool)}</span></li>
        <li>${icon('trees')}<span>${t(shared.garden)}</span></li>
        <li>${icon('sparkle')}<span>${t(shared.wellness)} ${t('Les modalités sont à confirmer avec votre hôte.')}</span></li>
      </ul>
    </div>
  </div>
</section>`;
}

const guideBand = (g) => `<section class="guide-band" aria-labelledby="guide-band-title">
  <div class="container guide-band-inner" data-reveal>
    <div>
      ${eyebrow('Votre carnet de séjour')}
      <h2 id="guide-band-title">Installez-vous.<br><em>On vous guide.</em></h2>
    </div>
    <div class="guide-band-cta">
      <p>${t('Wi-Fi, tri, énergie, piscine, arrivée et départ : les repères de votre gîte, réunis au même endroit.')}</p>
      ${button(g ? `/sejour/${g.slug}/` : '/sejour/', g ? 'Ouvrir le carnet de ce gîte' : 'Ouvrir mon carnet', { variant: 'light' })}
    </div>
  </div>
</section>`;

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------

function heroScene() {
  const { w, h } = hero.stage;
  const box = (b) => `left:${((b.x / w) * 100).toFixed(3)}%;top:${((b.y / h) * 100).toFixed(3)}%;width:${((b.w / w) * 100).toFixed(3)}%;height:${((b.h / h) * 100).toFixed(3)}%`;
  const layer = (key, b, name, sizes) =>
    `<div class="layer layer-${name}" data-layer="${name}" style="${box(b)}">${picture(key, { sizes, loading: 'eager', priority: name === 'brasserie' })}</div>`;
  return `<div class="hero-stage" data-stage role="img" aria-label="${esc('Illustration : La Brasserie et Le Grain d’Amour posés sur des strates de paysage, au-dessus de la Meuse')}" style="--open-up:${hero.open.up};--open-down:${hero.open.down}">
      <div class="layer layer-plate">${picture('hero-plate', { sizes: '(max-width: 900px) 180vw, 100vw', loading: 'eager' })}</div>
      ${layer('hero-grain', hero.layers.lower, 'grain', '(max-width: 900px) 160vw, 90vw')}
      <svg class="hero-thread" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs><filter id="thread-blur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="4"/></filter></defs>
        <path class="thread-glow" d="${hero.thread}" pathLength="1" filter="url(#thread-blur)" data-thread/>
        <path class="thread-line" d="${hero.thread}" pathLength="1" data-thread/>
      </svg>
      ${layer('hero-brasserie', hero.layers.upper, 'brasserie', '(max-width: 900px) 120vw, 66vw')}
    </div>`;
}

function home() {
  const [grain, brasserie] = gites;
  const body = `
<section class="hero" aria-labelledby="hero-title" data-hero>
  <div class="hero-track" data-hero-track>
    <div class="hero-sticky">
      <div class="hero-scene">${heroScene()}</div>
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-copy">
        ${eyebrow(brand.place, 'eyebrow-light')}
        <h1 id="hero-title" class="hero-title"><span>La parenthèse</span> <em>verte.</em></h1>
        <p class="hero-sub">Deux gîtes.<br>Un même art de ralentir.</p>
        ${button('#les-gites', 'Découvrir les gîtes', { variant: 'brass', ic: 'arrow' })}
      </div>
      <p class="hero-hint" aria-hidden="true"><span></span>Prendre le temps</p>
      ${tornEdge('hero-edge')}
    </div>
  </div>
</section>

<section class="intro section" id="les-gites" aria-labelledby="intro-title" data-intro>
  <svg class="intro-thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M47 0 C 47 7, 53.6 5, 53.6 14 S 50 44, 50 56 S 51 82, 50 100" pathLength="1" data-intro-thread/>
  </svg>
  <div class="container intro-head" data-reveal>
    ${eyebrow('Une escale, deux façons de la vivre')}
    <h2 id="intro-title">À deux. À douze.<br><em>À votre rythme.</em></h2>
    <p class="intro-text">${t('Le Grain d’Amour pour une échappée à deux.')}<br>${t('La Brasserie pour le plaisir de se retrouver.')}<br>${t('À Chooz, laissez les Ardennes vous accueillir.')}</p>
  </div>
  <div class="container cards cards-staggered">
    ${giteCard(grain)}
    ${giteCard(brasserie)}
  </div>
</section>

<section class="guest-band" aria-labelledby="guest-title">
  <div class="container">
    <div class="guest-head" data-reveal>
      <div>
        ${eyebrow('Votre séjour, en toute simplicité', 'eyebrow-light')}
        <h2 id="guest-title">Posez les valises.<br><em>Gardez l’essentiel.</em></h2>
      </div>
      <div class="guest-cta">
        <p>${t('Wi-Fi, tri, énergie et petits repères : retrouvez les informations de votre gîte dans votre carnet de séjour.')}</p>
        ${button('/sejour/', 'Ouvrir mon carnet', { variant: 'light' })}
      </div>
    </div>
    <ul class="guest-items" data-reveal>
      <li>${icon('wifi')}<span><b>Wi-Fi</b>Disponible dans votre gîte</span></li>
      <li>${icon('recycle')}<span><b>Tri</b>Gestes éco-responsables</span></li>
      <li>${icon('leaf')}<span><b>Énergie</b>Conditions selon la réservation</span></li>
      <li>${icon('heart')}<span><b>Respect</b>De la nature et du voisinage</span></li>
    </ul>
  </div>
</section>

<section class="sozen-teaser section" aria-labelledby="sozen-teaser-title">
  <div class="container sozen-teaser-grid">
    <div class="sozen-teaser-photo" data-reveal>
      ${picture(sozen.photos[0].key, { alt: sozen.photos[0].alt, sizes: '(max-width: 820px) 92vw, 46vw', cls: 'arch' })}
      ${sprig('sprig-a')}
    </div>
    <div class="sozen-teaser-copy" data-reveal>
      ${picture('sozen-logo', { alt: 'So Zen : femme en méditation, nature et soleil', sizes: '160px', cls: 'sozen-mark' })}
      ${eyebrow('So Zen · Chooz')}
      <h2 id="sozen-teaser-title">Un moment<br><em>pour soi.</em></h2>
      <p class="lead">${t('Yoga, détente et moments partagés à Chooz.')}</p>
      <div class="card-actions">
        ${button('/so-zen/', 'Découvrir So Zen')}
        ${button(sozen.facebookUrl, 'Suivre So Zen sur Facebook', { variant: 'outline', external: true })}
      </div>
    </div>
  </div>
</section>

<section class="explore-teaser section" aria-labelledby="explore-teaser-title">
  <div class="container">
    <div class="explore-teaser-head" data-reveal>
      ${eyebrow('Autour de vous')}
      <h2 id="explore-teaser-title">La Meuse comme <em>fil conducteur.</em></h2>
    </div>
    <ol class="outing-list" data-reveal>
      ${outings.map((o) => `<li><span class="outing-list-n">${o.n}</span><span class="outing-list-name">${t(o.name)}</span><span class="outing-list-where">${t(o.where)}</span></li>`).join('')}
    </ol>
    <div class="explore-teaser-cta">${button('/explorer/', 'Explorer les alentours')}</div>
  </div>
</section>`;
  return layout({
    id: 'home',
    nav: 'home',
    title: brand.concept,
    description: 'Le Grain d’Amour et La Brasserie à Chooz, dans les Ardennes : découvrez les gîtes, votre carnet de séjour, So Zen et les sorties autour de la Meuse.',
    body,
    bodyClass: 'page-home',
  });
}

// ---------------------------------------------------------------------------
// Les gîtes
// ---------------------------------------------------------------------------

function listing() {
  const [a, b] = gites;
  const row = (label, fa, fb) => `<tr><th scope="row">${t(label)}</th><td>${fa}</td><td>${fb}</td></tr>`;
  const body = `
<section class="page-head container" aria-labelledby="page-title">
  ${eyebrow('Choisir son escale')}
  <h1 id="page-title">Deux adresses.<br><em>Votre échappée.</em></h1>
  <p class="lead">${t('À deux ou en tribu, découvrez le gîte qui vous ressemble.')}</p>
</section>

<section class="section section-tight" aria-label="Les deux gîtes">
  <div class="container cards cards-staggered">
    ${giteCard(a, { headingLevel: 2 })}
    ${giteCard(b, { headingLevel: 2 })}
  </div>
</section>

<section class="section compare" aria-labelledby="compare-title">
  <div class="container">
    <div class="compare-head" data-reveal>
      ${eyebrow('En un coup d’œil')}
      <h2 id="compare-title">Comparer <em>les deux gîtes.</em></h2>
    </div>
    <div class="table-wrap" data-reveal>
      <table class="compare-table">
        <caption class="sr-only">Comparaison du Grain d’Amour et de La Brasserie</caption>
        <thead><tr><td></td><th scope="col">${t(a.name)}</th><th scope="col">${t(b.name)}</th></tr></thead>
        <tbody>
          ${row('Capacité', people(a.capacity), people(b.capacity))}
          ${row('Chambres', rooms(a.bedrooms), rooms(b.bedrooms))}
          ${row('Surface', `${a.area}\u00A0m²`, `${b.area}\u00A0m²`)}
          ${row('Énergie', t(a.compare.energy), t(b.compare.energy))}
          ${row('Animaux', t(a.compare.pets), t(b.compare.pets))}
          ${row('Linge', t(a.compare.linen), t(b.compare.linen))}
          ${row('Référence', `Gîtes de France ${a.reference}`, `Gîtes de France ${b.reference}`)}
          <tr class="compare-actions"><th scope="row"><span class="sr-only">Réserver</span></th>
            <td>${textLink(a.bookingUrl, 'Réserver', { external: true })}</td>
            <td>${textLink(b.bookingUrl, 'Réserver', { external: true })}</td></tr>
        </tbody>
      </table>
    </div>
    <p class="note">${t('Les conditions détaillées, les disponibilités et les tarifs sont confirmés sur la fiche de réservation de chaque gîte.')}</p>
  </div>
</section>
${sharedMoments('grain-photo8-430', 'La piscine partagée, entre graminées et tournesols')}
${guideBand(null)}`;
  return layout({
    id: 'gites',
    nav: 'gites',
    title: 'Les gîtes',
    description: 'Le Grain d’Amour (2 personnes, 55 m²) et La Brasserie (12 personnes, 240 m²) à Chooz : comparez les deux gîtes et réservez sur Gîtes de France.',
    body,
    bodyClass: 'page-gites',
  });
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
      alt: p.alt,
    };
  });
}

function fiche(id) {
  const g = gite(id);
  const o = other(g);
  // the first photo already leads the page: the mosaic starts with the second one
  const shown = g.photos.slice(1, 7);
  const more = g.photos.slice(7);
  const tile = (p, i, cls = '') =>
    `<a class="tile${cls}" href="${imgUrl(p.key)}" data-gallery-index="${i}" aria-label="${esc(`Agrandir la photo ${i + 1} sur ${g.photos.length} : ${p.alt}`)}">`
    + picture(p.key, { alt: p.alt, sizes: cls ? '(max-width: 820px) 92vw, 50vw' : '(max-width: 820px) 46vw, 25vw' })
    + `</a>`;
  const sharedPhoto = id === 'grain'
    ? ['grain-photo9-430', 'La piscine partagée et le jardin fleuri']
    : ['brasserie-photo10-339', 'Le jardin, la piscine partagée et les collines, vus de La Brasserie'];
  const body = `
<section class="fiche-lead container" aria-labelledby="page-title">
  <div class="fiche-copy">
    <a class="back-link" href="/gites/">${icon('arrow-left')}Les gîtes</a>
    ${eyebrow(`Chooz · Ardennes · ${g.reference}`)}
    <h1 id="page-title">${t(g.name)}</h1>
    <p class="lead">${t(g.tagline)}</p>
    <p>${t(g.description)}</p>
    <dl class="facts">
      <div>${icon('users')}<dt>Capacité</dt><dd><b>${g.capacity}</b> ${g.capacity > 1 ? 'personnes' : 'personne'}</dd></div>
      <div>${icon('bed')}<dt>Chambres</dt><dd><b>${g.bedrooms}</b> ${g.bedrooms > 1 ? 'chambres' : 'chambre'}</dd></div>
      <div>${icon('area')}<dt>Surface</dt><dd><b>${g.area}</b> m²</dd></div>
    </dl>
    ${button(g.bookingUrl, 'Réserver sur Gîtes de France', { external: true })}
    <p class="note">${t('Les disponibilités, tarifs et conditions sont confirmés sur la plateforme.')}</p>
  </div>
  <div class="fiche-photo">
    <a class="fiche-photo-link" href="${imgUrl(g.photos[0].key)}" data-gallery-index="0" aria-label="${esc(`Agrandir la photo 1 sur ${g.photos.length} : ${g.photos[0].alt}`)}">${picture(g.photos[0].key, { alt: g.photos[0].alt, sizes: '(max-width: 820px) 92vw, 46vw', cls: 'arch', loading: 'eager', priority: true })}</a>
    ${sprig('sprig-b')}
  </div>
</section>

<ul class="amenities container" aria-label="Équipements">
  ${g.features.map((f) => `<li>${icon(featureIcon[f] || 'leaf')}<span>${t(f)}</span></li>`).join('')}
</ul>

<section class="section gallery-section" aria-labelledby="gallery-title" data-gallery>
  <div class="container">
    <div class="gallery-head">
      <div>
        ${eyebrow('La galerie')}
        <h2 id="gallery-title">${t(g.name)} <em>en images.</em></h2>
      </div>
      <p class="gallery-count">${icon('images')}${g.photos.length} photographies</p>
    </div>
    <div class="mosaic">
      ${shown.map((p, i) => tile(p, i + 1, i === 0 ? ' tile-main' : '')).join('')}
    </div>
    ${more.length ? `<details class="more-photos">
      <summary>${icon('images')}<span>${more.length} photos de plus</span></summary>
      <div class="more-grid">${more.map((p, i) => tile(p, i + 7)).join('')}</div>
    </details>` : ''}
  </div>
  <dialog class="lightbox" aria-label="${esc(`Photographies : ${g.name}`)}" data-lightbox>
    <div class="lightbox-bar">
      <p class="lightbox-count" aria-live="polite" data-lightbox-count></p>
      <button type="button" class="lightbox-close" data-lightbox-close>${icon('close')}<span>Fermer</span></button>
    </div>
    <figure class="lightbox-figure">
      <picture><source type="image/avif" data-lightbox-avif><img alt="" data-lightbox-img></picture>
      <figcaption data-lightbox-caption></figcaption>
    </figure>
    <div class="lightbox-nav">
      <button type="button" data-lightbox-prev>${icon('chevron-left')}<span>Précédente</span></button>
      <button type="button" data-lightbox-next><span>Suivante</span>${icon('chevron-right')}</button>
    </div>
  </dialog>
  <script type="application/json" data-gallery-data>${JSON.stringify(galleryData(g)).replace(/</g, '\\u003c')}</script>
</section>

<section class="section conditions" aria-labelledby="conditions-title">
  <div class="container">
    <div class="conditions-head" data-reveal>
      ${eyebrow('Les conditions de ce gîte')}
      <h2 id="conditions-title">Bon à savoir <em>avant de réserver.</em></h2>
    </div>
    <div class="conditions-grid" data-reveal>
      <div>${icon('leaf')}<h3>Énergie</h3><p>${t(g.energy)}</p></div>
      <div>${icon('paw')}<h3>Animaux</h3><p>${t(g.pets)}</p></div>
      <div>${icon('bed')}<h3>Linge</h3><p>${t(g.linen)}</p></div>
    </div>
  </div>
</section>
${sharedMoments(...sharedPhoto)}
${guideBand(g)}
<section class="section other-gite" aria-labelledby="other-title">
  <div class="container other-gite-inner" data-reveal>
    <a class="other-gite-photo" href="/gites/${o.slug}/" tabindex="-1" aria-hidden="true">${picture(o.photos[0].key, { alt: '', sizes: '(max-width: 820px) 92vw, 36vw', cls: 'arch' })}</a>
    <div>
      ${eyebrow('L’autre adresse')}
      <h2 id="other-title">${t(o.name)}</h2>
      <p class="lead">${t(o.tagline)}</p>
      <p>${t(facts(o))}</p>
      ${button(`/gites/${o.slug}/`, `Découvrir ${o.name}`)}
    </div>
  </div>
</section>`;
  return layout({
    id: `fiche-${g.id}`,
    nav: 'gites',
    title: g.name,
    description: `${g.name} à Chooz (Ardennes) : ${facts(g)}. ${g.description} Réservation sur Gîtes de France (${g.reference}).`,
    body,
    bodyClass: `page-fiche page-${g.id}`,
  });
}

// ---------------------------------------------------------------------------
// Carnet de séjour
// ---------------------------------------------------------------------------

function sejourIndex() {
  const quick = ['Wi-Fi disponible', 'Conditions de votre réservation', 'Piscine et jardin partagés', 'Horaires et collecte : consulter votre hôte'];
  const body = `
<section class="page-head container" aria-labelledby="page-title">
  ${eyebrow('Le carnet qui vous accompagne')}
  <h1 id="page-title">Bienvenue<br><em>chez vous.</em></h1>
  <p class="lead">${t('Sélectionnez votre gîte pour retrouver vos repères.')}</p>
</section>
<section class="section section-tight" aria-label="Choisir mon gîte">
  <div class="container chooser">
    ${gites.map((g) => `<article class="chooser-card" data-reveal>
      ${picture(g.photos[0].key, { alt: '', sizes: '(max-width: 820px) 30vw, 180px', cls: 'chooser-photo' })}
      <div class="chooser-body">
        <h2>${t(g.name)}</h2>
        <p class="chooser-facts">${t(facts(g))}</p>
        <ul>${quick.map((q) => `<li>${t(q)}</li>`).join('')}</ul>
        ${button(`/sejour/${g.slug}/`, 'Ouvrir mon carnet')}
      </div>
    </article>`).join('')}
  </div>
</section>
<section class="section carnet-index" aria-labelledby="index-title">
  <div class="container">
    ${eyebrow('Dans votre carnet')}
    <h2 id="index-title" class="h3">${t('Huit repères pour bien vivre le séjour.')}</h2>
    <ol class="index-grid">
      ${carnet.map((c) => `<li>${icon(c.icon)}<span class="index-n">${c.n}</span><span>${t(c.title)}</span></li>`).join('')}
    </ol>
  </div>
</section>`;
  return layout({
    id: 'sejour',
    nav: 'sejour',
    title: 'Votre carnet de séjour',
    description: 'Le carnet de séjour des Gîtes de Chooz : Wi-Fi, tri, énergie, piscine, animaux, linge, arrivée et départ. Choisissez votre gîte.',
    body,
    bodyClass: 'page-sejour',
  });
}

function sejour(id) {
  const g = gite(id);
  const entryText = (c) => {
    if (c.text) return `<p>${t(c.text)}</p>`;
    if (c.field) return `<p>${t(g[c.field])}</p>`;
    return c.fields.map((f) => `<p>${t(g[f])}</p>`).join('');
  };
  const body = `
<section class="page-head container carnet-head" aria-labelledby="page-title">
  ${eyebrow('Votre carnet de séjour')}
  <h1 id="page-title">Bienvenue<br><em>chez vous.</em></h1>
  <p class="carnet-property">${t(g.name)} · ${people(g.capacity)} · ${g.reference}</p>
  <nav class="switcher" aria-label="Choisir le carnet du gîte">
    <span class="switcher-label">Mon gîte</span>
    <div class="switcher-options">
      ${gites.map((x) => `<a href="/sejour/${x.slug}/"${x.id === g.id ? ' aria-current="page"' : ''}>${t(x.name)}</a>`).join('')}
    </div>
  </nav>
</section>
<section class="section section-tight carnet" aria-label="${esc(`Les repères du gîte ${g.name}`)}">
  <div class="container">
    <ol class="carnet-grid">
      ${carnet.map((c) => `<li class="carnet-item" data-reveal>
        <div class="carnet-item-head">${icon(c.icon)}<span class="carnet-n">${c.n}</span></div>
        <h2>${t(c.title)}</h2>
        ${entryText(c)}
      </li>`).join('')}
    </ol>
    <div class="carnet-foot">
      <p>${t('Ces repères complètent votre réservation. Les instructions personnalisées et les conditions de votre fiche restent votre référence.')}</p>
      <div class="carnet-actions">
        <button type="button" class="btn btn-solid" data-print hidden><span>Imprimer mon carnet</span>${icon('printer')}</button>
        ${textLink(g.bookingUrl, 'Ma fiche de réservation', { external: true })}
      </div>
    </div>
  </div>
</section>`;
  return layout({
    id: `sejour-${g.id}`,
    nav: 'sejour',
    title: `Carnet de séjour · ${g.name}`,
    description: `Le carnet de séjour du gîte ${g.name} à Chooz : Wi-Fi, tri, énergie, piscine, animaux, linge, arrivée et départ.`,
    body,
    bodyClass: 'page-carnet',
  });
}

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------

function explorer() {
  const label = (id) => outingCategories.find((c) => c.id === id).label;
  const body = `
<section class="page-head container" aria-labelledby="page-title">
  ${eyebrow('Le carnet des alentours')}
  <h1 id="page-title">Au fil<br><em>de vos envies.</em></h1>
  <p class="lead">${t('Une balade, une visite, une bonne adresse : choisissez votre prochaine escale.')}</p>
</section>
<section class="section section-tight" aria-label="Idées de sorties" data-filters>
  <div class="container">
    <div class="filters" role="group" aria-label="Filtrer les idées de sorties" hidden data-filter-group>
      ${outingCategories.map((c) => `<button type="button" data-filter="${c.id}" aria-pressed="${c.id === 'all'}">${t(c.label)}</button>`).join('')}
    </div>
    <p class="filter-result" aria-live="polite" data-filter-result>${outings.length} idées à découvrir</p>
    <div class="outings">
      ${outings.map((o) => `<article class="outing" data-category="${o.category}" data-reveal>
        <span class="outing-n">${o.n}</span>
        <p class="outing-tag">${t(label(o.category))}</p>
        ${eyebrow(o.where)}
        <h2>${t(o.name)}</h2>
        <p>${t(o.text)}</p>
        ${textLink(o.url, o.label, { external: true })}
      </article>`).join('')}
    </div>
    <p class="note">${t('Consultez les sites des établissements pour les horaires, tarifs et conditions du jour.')}</p>
  </div>
</section>`;
  return layout({
    id: 'explorer',
    nav: 'explorer',
    title: 'Explorer les alentours',
    description: 'Autour de Chooz : la Voie Verte au bord de la Meuse, le Fort de Charlemont à Givet, la Pâtisserie Léval et la Presqu’île de Chooz.',
    body,
    bodyClass: 'page-explorer',
  });
}

// ---------------------------------------------------------------------------
// So Zen
// ---------------------------------------------------------------------------

function sozenPage() {
  const [p1, p2] = sozen.photos;
  const body = `
<section class="zen-lead container" aria-labelledby="page-title">
  <div class="zen-copy">
    <div class="zen-identity">
      ${picture('sozen-logo', { alt: 'So Zen : femme en méditation, nature et soleil', sizes: '(max-width: 700px) 150px, 210px', cls: 'zen-logo', loading: 'eager' })}
      <p class="zen-wordmark">So Zen</p>
      <p class="zen-place">Chooz · Ardennes</p>
    </div>
    <h1 id="page-title">Un moment<br><em>pour soi.</em></h1>
    <p class="lead">Yoga, détente et moments partagés à Chooz.</p>
    <p>${t('Des activités de yoga sont proposées sur place, dans le cadre verdoyant des gîtes. Découvrez les prochains rendez-vous sur la page Facebook So Zen et prenez contact pour connaître les modalités de participation.')}</p>
    <a class="btn btn-solid btn-fb" href="${esc(sozen.facebookUrl)}" target="_blank" rel="noopener noreferrer"><span>${t('Découvrir les actualités sur Facebook')}</span>${icon('facebook')}<span class="sr-only"> (nouvel onglet)</span></a>
    <ul class="zen-contact">
      <li><a href="${sozen.phoneHref}">${icon('phone')}${t(sozen.phone)}</a></li>
      <li>${icon('pin')}${t(sozen.address)}</li>
    </ul>
  </div>
  <div class="zen-photos">
    ${picture(p1.key, { alt: p1.alt, sizes: '(max-width: 820px) 88vw, 46vw', cls: 'arch zen-main', loading: 'eager', priority: true })}
    <figure class="zen-inset">${picture(p2.key, { alt: p2.alt, sizes: '(max-width: 820px) 56vw, 24vw' })}</figure>
    ${sprig('sprig-c')}${sprig('sprig-d')}
  </div>
</section>

<section class="zen-mantra" aria-label="Prendre le temps">
  <p>${sprig('sprig-inline')}<span>Prendre le temps. <em>Respirer. Se retrouver.</em></span>${sprig('sprig-inline sprig-flip')}</p>
</section>

<section class="section yoga-story" aria-labelledby="yoga-title">
  <div class="container yoga-story-inner" data-reveal>
    ${eyebrow('Le yoga au cœur des gîtes')}
    <h2 id="yoga-title">Une pause.<br><em>Un moment ensemble.</em></h2>
    <div class="yoga-story-text">
      <p>${t('Les activités de yoga So Zen invitent à prendre un temps pour soi, dans le cadre des gîtes à Chooz. Les photos partagées ici montrent ces moments vécus sur place.')}</p>
      <p>${t('Pour les dates, les disponibilités, les tarifs et les modalités de participation, consultez les actualités So Zen ou contactez directement l’équipe.')}</p>
      ${textLink(sozen.facebookUrl, 'Découvrir les prochains rendez-vous', { external: true })}
    </div>
  </div>
</section>

<section class="section zen-wellness" aria-labelledby="wellness-title">
  <div class="container zen-wellness-inner" data-reveal>
    ${icon('sparkle', 'icon-lg')}
    <div>
      ${eyebrow('Prolonger la détente')}
      <h2 id="wellness-title" class="h3">${t('L’espace bien-être des gîtes.')}</h2>
      <p>${t('Les fiches des hébergements proposent sauna, spa et hammam sur demande, selon disponibilité et avec supplément. Votre hôte vous précisera les conditions d’accès.')}</p>
      ${textLink('/sejour/', 'Retrouver les informations de mon gîte')}
    </div>
  </div>
</section>`;
  return layout({
    id: 'sozen',
    nav: 'sozen',
    title: 'So Zen · Yoga à Chooz',
    description: 'So Zen : yoga, détente et moments partagés à Chooz, dans le cadre verdoyant des gîtes. Actualités sur Facebook et contact au 06 21 11 43 58.',
    body,
    bodyClass: 'page-sozen',
  });
}

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

function notFound() {
  const body = `
<section class="page-head container not-found" aria-labelledby="page-title">
  ${eyebrow('Page introuvable')}
  <h1 id="page-title">Ce chemin<br><em>s’est égaré.</em></h1>
  <p class="lead">${t('La page demandée n’existe pas ou a changé d’adresse.')}</p>
  <div class="card-actions">
    ${button('/', 'Retour à l’accueil')}
    ${button('/gites/', 'Choisir mon gîte', { variant: 'outline' })}
  </div>
</section>`;
  return layout({ id: '404', nav: '', title: 'Page introuvable', description: 'Page introuvable.', body, bodyClass: 'page-404' });
}

// ---------------------------------------------------------------------------

export const pages = [
  { id: 'home', file: 'index.html', render: home },
  { id: 'gites', file: 'gites/index.html', render: listing },
  { id: 'grain', file: 'gites/le-grain-damour/index.html', render: () => fiche('grain') },
  { id: 'brasserie', file: 'gites/la-brasserie/index.html', render: () => fiche('brasserie') },
  { id: 'sejour', file: 'sejour/index.html', render: sejourIndex },
  { id: 'sejour-grain', file: 'sejour/le-grain-damour/index.html', render: () => sejour('grain') },
  { id: 'sejour-brasserie', file: 'sejour/la-brasserie/index.html', render: () => sejour('brasserie') },
  { id: 'explorer', file: 'explorer/index.html', render: explorer },
  { id: 'sozen', file: 'so-zen/index.html', render: sozenPage },
  { id: '404', file: '404.html', render: notFound },
];

export function renderPage(id) {
  const p = pages.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown page ${id}`);
  return p.render();
}
