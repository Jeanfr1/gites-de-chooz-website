// So Dream motion system (GSAP 3.13: ScrollTrigger, SplitText, DrawSVG, MotionPath).
// Each section has its own choreography; the hidden states only exist under html.motion
// (see main.css), so no-JS, reduced motion and print always show everything.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);

const $ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const inView = (el) => el.getBoundingClientRect().top < window.innerHeight * 0.92;
const fontsReady = (ms) => Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, ms))]);
const EXPO = 'expo.out';

// Icons are <use> references: inline the symbol so DrawSVG can reach the strokes.
function inlineIcon(svg) {
  const use = svg.querySelector('use');
  if (!use) return svg;
  const sym = document.getElementById(use.getAttribute('href').slice(1));
  if (!sym) return svg;
  svg.setAttribute('viewBox', sym.getAttribute('viewBox'));
  svg.innerHTML = sym.innerHTML;
  return svg;
}
const strokes = (svg) => $('path, circle, rect, line, polyline, polygon', svg);

function drawIcons(icons, trigger, { stagger = 0.08, delay = 0 } = {}) {
  if (!icons.length) return;
  const parts = icons.map((i) => strokes(inlineIcon(i)));
  const tl = gsap.timeline({ scrollTrigger: { trigger, start: 'top 85%', once: true }, delay });
  parts.forEach((p, i) => tl.fromTo(p, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut', stagger: 0.06 }, i * stagger));
}

// ---------------------------------------------------------------------------
// Headings — four voices
// ---------------------------------------------------------------------------
function splitHeadings() {
  for (const el of $('[data-split]')) {
    const inHead = el.closest('.page-head, .fiche-copy, .palm-copy');
    const dark = el.closest('.guest-band, .guide-band, .site-footer');
    const zen = el.closest('.sozen-teaser, .zen-lead, .yoga-story');
    const style = el.tagName === 'H1' && inHead ? 'chars' : dark ? 'words' : zen ? 'breath' : 'lines';
    const st = { trigger: el, start: 'top 90%', once: true };
    SplitText.create(el, {
      type: style === 'chars' ? 'lines, words, chars' : style === 'words' ? 'words' : 'lines',
      mask: style === 'words' ? undefined : 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { opacity: 1 });
        if (style === 'chars') {
          // page titles: letters turn up from below, one after the other
          return gsap.fromTo(self.chars, { yPercent: 110, rotateX: -80, opacity: 0 }, {
            yPercent: 0, rotateX: 0, opacity: 1, duration: 1.1, ease: EXPO, stagger: 0.024, delay: 0.1, transformOrigin: '50% 100%',
            scrollTrigger: inView(el) ? undefined : st,
          });
        }
        if (style === 'words') {
          // dark bands: words surface from a blur
          return gsap.fromTo(self.words, { opacity: 0, y: 26, filter: 'blur(10px)' }, {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.06, scrollTrigger: st,
          });
        }
        if (style === 'breath') {
          // So Zen: slow, breathing rise
          return gsap.fromTo(self.lines, { yPercent: 100, opacity: 0 }, {
            yPercent: 0, opacity: 1, duration: 1.8, ease: 'sine.out', stagger: 0.28, scrollTrigger: inView(el) ? undefined : st,
          });
        }
        // editorial default: lines rise out of their mask with a slight tilt
        return gsap.fromTo(self.lines, { yPercent: 115, rotate: 2.5 }, {
          yPercent: 0, rotate: 0, duration: 1.15, ease: EXPO, stagger: 0.1, scrollTrigger: inView(el) ? undefined : st,
        });
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Generic reveals
// ---------------------------------------------------------------------------
function reveals() {
  // eyebrows: the brass rule draws, the letters tighten
  for (const el of $('[data-anim="eyebrow"]')) {
    gsap.fromTo(el, { opacity: 0, letterSpacing: '0.5em', '--eb': 0 }, {
      opacity: 1, letterSpacing: '0.26em', '--eb': 1, duration: 1.2, ease: EXPO,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  }
  ScrollTrigger.batch('[data-anim="fade"]', {
    start: 'top 92%',
    once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: 0.1 }),
  });
  for (const list of $('[data-anim="stagger"]')) {
    gsap.fromTo(list.children, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1, ease: EXPO, stagger: 0.09,
      scrollTrigger: { trigger: list, start: 'top 88%', once: true },
    });
  }
  // arch photos: the arch opens from the bottom while the photo settles
  for (const el of $('[data-anim="arch"]')) {
    if (el.closest('[data-carousel]')) continue;
    const img = el.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: EXPO }, 0.1);
  }
  // scroll parallax inside a frame
  for (const el of $('[data-parallax]')) {
    const pic = el.querySelector('picture');
    gsap.set(pic, { scale: 1.16 });
    gsap.fromTo(pic, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  // counters
  for (const el of $('[data-count]')) {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.6, ease: 'power3.out', delay: 0.4,
      onUpdate: () => { el.textContent = Math.round(o.v); },
      scrollTrigger: inView(el) ? undefined : { trigger: el, start: 'top 92%', once: true },
    });
  }
}

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
async function heroIntro() {
  const copy = document.querySelector('[data-hero-copy]');
  if (!copy) return;
  await fontsReady(700);
  const title = copy.querySelector('[data-hero-title]');
  const split = SplitText.create(title, { type: 'lines, chars', mask: 'lines', linesClass: 'split-line' });
  gsap.set(title, { opacity: 1 });
  const tl = gsap.timeline({ delay: 0.15 });
  tl.fromTo(copy.querySelector('.eyebrow'), { opacity: 0, letterSpacing: '0.6em', '--eb': 0 }, { opacity: 1, letterSpacing: '0.26em', '--eb': 1, duration: 1.4, ease: EXPO })
    .fromTo(split.chars, { yPercent: 120, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.3, ease: EXPO, stagger: 0.028 }, 0.15)
    .fromTo(copy.querySelector('.hero-sub'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: EXPO }, 0.65)
    .fromTo($('[data-hero-quick] > *', copy), { opacity: 0, y: 26, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.07 }, 0.85);
  // the copy drifts up and fades while the houses open (hero.js drives the scene)
  gsap.to(copy, {
    '--drift': '-90px', opacity: 0.12, ease: 'none',
    scrollTrigger: { trigger: '[data-hero-track]', start: 'top top', end: 'bottom 40%', scrub: true },
  });
}

function carousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const slides = $('.gite-slide', root);
  const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 82%', once: true } });
  // the four gîtes are dealt in like cards
  tl.fromTo(slides, { opacity: 0, x: 180, rotate: 4, transformOrigin: '0% 100%' }, { opacity: 1, x: 0, rotate: 0, duration: 1.4, ease: EXPO, stagger: 0.12 })
    .fromTo($('.gite-card-photo', root), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', stagger: 0.12 }, 0)
    .fromTo($('.photo-num', root), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(2)', stagger: 0.12 }, 0.7)
    .fromTo($('.carousel-ui', root.parentElement), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.6);
}

function marquees() {
  for (const m of $('[data-marquee]')) {
    const track = m.querySelector('.marquee-track');
    const anim = track.getAnimations ? track.getAnimations()[0] : null;
    if (!anim) continue;
    const proxy = { rate: 1 };
    const skew = gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' });
    ScrollTrigger.create({
      trigger: m,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate(self) {
        const v = self.getVelocity();
        const dir = self.direction;
        proxy.rate = dir * Math.min(6, 1 + Math.abs(v) / 350);
        anim.playbackRate = proxy.rate;
        skew(gsap.utils.clamp(-7, 7, v / -260));
        gsap.to(proxy, { rate: dir, duration: 1, overwrite: true, onUpdate: () => { anim.playbackRate = proxy.rate; } });
      },
      onLeave: () => skew(0),
      onLeaveBack: () => skew(0),
    });
  }
}

function guestItems() {
  const list = document.querySelector('.guest-items');
  if (list) drawIcons($('.icon', list), list, { stagger: 0.14, delay: 0.2 });
}

function iris() {
  for (const el of $('[data-anim="iris"]')) {
    const img = el.querySelector('img');
    if (inView(el)) {
      gsap.fromTo(el, { clipPath: 'circle(0% at 50% 60%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 2, ease: 'power3.inOut', delay: 0.2 });
      gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2.4, ease: EXPO, delay: 0.2 });
    } else {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 55%', scrub: 1 } });
      tl.fromTo(el, { clipPath: 'circle(8% at 50% 60%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'none' })
        .fromTo(img, { scale: 1.35 }, { scale: 1, ease: 'none' }, 0);
    }
  }
  for (const el of $('[data-anim="spin-in"]')) {
    gsap.fromTo(el, { opacity: 0, rotate: -120, scale: 0.6 }, {
      opacity: 1, rotate: 0, scale: 1, duration: 1.8, ease: 'back.out(1.4)',
      scrollTrigger: inView(el) ? undefined : { trigger: el, start: 'top 90%', once: true },
    });
  }
  for (const el of $('[data-anim="polaroid"]')) {
    gsap.fromTo(el, { opacity: 0, y: 90, rotate: 16 }, { opacity: 1, y: 0, rotate: 3.5, duration: 1.6, ease: EXPO, delay: 0.9 });
  }
}

// The Meuse: the river draws itself, a paper boat sails down to Namur, towns light up as it passes.
function meuseMaps() {
  for (const map of $('[data-meuse-map]')) {
    const river = map.querySelector('[data-river]');
    const boat = map.querySelector('[data-boat]');
    const total = river.getTotalLength();
    const samples = Array.from({ length: 301 }, (_, i) => {
      const p = river.getPointAtLength((total * i) / 300);
      return [p.x, p.y, i / 300];
    });
    const at = (g) => {
      const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
      const x = Number(m[1]);
      const y = Number(m[2]);
      let best = samples[0];
      let d = Infinity;
      for (const s of samples) {
        const dd = (s[0] - x) ** 2 + (s[1] - y) ** 2;
        if (dd < d) { d = dd; best = s; }
      }
      return best[2];
    };
    const pins = $('[data-pin]', map);
    const tl = gsap.timeline({ scrollTrigger: { trigger: map, start: 'top 88%', end: 'bottom 72%', scrub: 1.2 } });
    tl.fromTo(river, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'none' }, 0)
      .fromTo(map.querySelector('.map-river-glow'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1, ease: 'none' }, 0)
      .set(boat, { opacity: 1 }, 0)
      .to(boat, { motionPath: { path: river, align: river, alignOrigin: [0.5, 0.9] }, duration: 1, ease: 'none' }, 0);
    pins.forEach((pin) => {
      tl.fromTo(pin, { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.06, ease: 'back.out(3)' }, Math.max(0, at(pin) - 0.03));
    });
    // a gentle bob of the boat, independent from scrolling
    gsap.to(boat.children, { y: -2.5, rotate: 2, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 100%' });
  }
}

// ---------------------------------------------------------------------------
// Inner pages
// ---------------------------------------------------------------------------
function cardsGrid() {
  for (const card of $('.cards-grid .gite-card')) {
    gsap.fromTo(card, { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 1.3, ease: EXPO, scrollTrigger: { trigger: card, start: 'top 90%', once: true } });
  }
}

function compareTable() {
  const wrap = document.querySelector('[data-compare]');
  if (!wrap) return;
  const rows = $('tr', wrap);
  const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 85%', once: true } });
  tl.fromTo(rows[0], { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: EXPO })
    .fromTo(rows.slice(1), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.9, ease: EXPO, stagger: 0.08 }, 0.15);
}

function guideBands() {
  for (const band of $('[data-band]')) {
    const bg = band.querySelector('.guide-band-bg');
    gsap.fromTo(bg, { clipPath: 'inset(0% 7% 0% 7% round 40px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 35%', scrub: true },
    });
  }
}

function fiche() {
  const lead = document.querySelector('[data-anim="lead-photo"]');
  if (lead) {
    const img = lead.querySelector('img');
    gsap.timeline({ delay: 0.1 })
      .fromTo(lead, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.4 }, { scale: 1, duration: 2.2, ease: EXPO }, 0.1);
    gsap.to(lead.querySelector('picture'), { yPercent: 8, ease: 'none', scrollTrigger: { trigger: lead, start: 'top top', end: 'bottom top', scrub: true } });
  }
  const amen = document.querySelector('.amenities');
  if (amen) drawIcons($('.icon', amen), amen, { stagger: 0.12 });
  // gallery: tiles uncover in alternating directions
  const mosaic = document.querySelector('[data-mosaic]');
  if (mosaic) {
    const from = ['inset(0% 100% 0% 0%)', 'inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 100%)', 'inset(0% 0% 100% 0%)'];
    const tiles = $('.tile', mosaic);
    const tl = gsap.timeline({ scrollTrigger: { trigger: mosaic, start: 'top 82%', once: true } });
    tiles.forEach((tile, i) => {
      tl.fromTo(tile, { clipPath: from[i % 4] }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, i * 0.1)
        .fromTo(tile.querySelector('img'), { scale: 1.45 }, { scale: 1, duration: 1.6, ease: EXPO }, i * 0.1 + 0.1);
    });
  }
  for (const grid of $('[data-anim="flip-cards"]')) {
    gsap.fromTo(grid.children, { opacity: 0, rotateX: -75, y: 30 }, {
      opacity: 1, rotateX: 0, y: 0, duration: 1.3, ease: EXPO, stagger: 0.12, transformOrigin: '50% 0%',
      scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
    });
    drawIcons($('.icon', grid), grid, { stagger: 0.12, delay: 0.2 });
  }
  const village = document.querySelector('.village-list');
  if (village) drawIcons($('.icon', village), village, { stagger: 0.15 });
  const shared = document.querySelector('.shared-list');
  if (shared) drawIcons($('.icon', shared), shared, { stagger: 0.15 });
}

function sejour() {
  const index = document.querySelector('.index-grid');
  if (index) drawIcons($('.icon', index), index, { stagger: 0.07 });
  // chooser cards lean towards the pointer
  if (window.matchMedia('(pointer: fine)').matches) {
    for (const card of $('[data-tilt]')) {
      const rx = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 7);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 7);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }
  }
}

function carnet() {
  const items = $('[data-timeline-item]');
  if (items.length) {
    ScrollTrigger.batch(items, {
      start: 'top 90%',
      once: true,
      onEnter: (els) => {
        gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.1, ease: EXPO, stagger: 0.1 });
        els.forEach((el, i) => {
          const ic = el.querySelector('.carnet-item-head .icon');
          gsap.fromTo(strokes(inlineIcon(ic)), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut', delay: 0.2 + i * 0.1 });
        });
      },
    });
  }
  for (const bins of $('[data-anim="bins"]')) {
    gsap.fromTo(bins.children, { opacity: 0, y: 70, scale: 0.9, rotate: (i) => (i % 2 ? 4 : -4) }, {
      opacity: 1, y: 0, scale: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.5)', stagger: 0.09,
      scrollTrigger: { trigger: bins, start: 'top 85%', once: true },
    });
  }
  for (const note of $('[data-anim="note"]')) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: note, start: 'top 85%', once: true } });
    tl.fromTo(note, { opacity: 0, y: 90, rotate: -5 }, { opacity: 1, y: 0, rotate: window.innerWidth > 700 ? -0.6 : 0, duration: 1.4, ease: EXPO })
      .fromTo($('.depart-list li', note), { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.8, ease: EXPO, stagger: 0.07 }, 0.4)
      .fromTo(note.querySelector('.depart-sign'), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 1, ease: EXPO }, '-=0.4');
  }
}

function palmeraie() {
  const hero = document.querySelector('[data-curtain]');
  if (!hero) return;
  const panels = $('.curtain span', hero);
  const art = hero.querySelector('[data-draw-art]');
  const tl = gsap.timeline({ delay: 0.15 });
  tl.to(panels[0], { xPercent: -101, duration: 1.5, ease: 'expo.inOut' }, 0)
    .to(panels[1], { xPercent: 101, duration: 1.5, ease: 'expo.inOut' }, 0)
    .set(hero.querySelector('.curtain'), { display: 'none' });
  if (art) {
    gsap.fromTo($('.pa-ink path', art), { drawSVG: '0%' }, { drawSVG: '100%', duration: 2.2, ease: 'power2.inOut', stagger: 0.12, delay: 0.7 });
    gsap.fromTo($('.pa-stars path', art), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.9, ease: 'back.out(3)', stagger: 0.2, delay: 2.2 });
    gsap.to($('.pa-stars path', art), { opacity: 0.35, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.5, delay: 3.4 });
    gsap.to(art, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }
  const grid = document.querySelector('.palm-grid');
  if (grid) drawIcons($('.icon', grid), grid, { stagger: 0.18, delay: 0.25 });
}

function adresses() {
  const places = $('.places .place');
  if (places.length) {
    ScrollTrigger.batch(places, {
      start: 'top 92%',
      once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 60, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: EXPO, stagger: 0.07 }),
    });
  }
  for (const list of $('[data-anim="calendar"]')) {
    gsap.fromTo(list.children, { opacity: 0, rotateX: 88, transformOrigin: '50% 0%' }, {
      opacity: 1, rotateX: 0, duration: 1.3, ease: 'expo.out', stagger: 0.16,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true },
    });
  }
}

function footer() {
  const giant = document.querySelector('[data-giant]');
  if (!giant) return;
  const word = giant.querySelector('.footer-wordmark');
  const split = SplitText.create(word, { type: 'chars', charsClass: 'char' });
  const em = giant.querySelector('.footer-emblem');
  const tl = gsap.timeline({ scrollTrigger: { trigger: giant, start: 'top 92%', once: true } });
  tl.fromTo(split.chars, { yPercent: 105, opacity: 0, rotate: 8 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.4, ease: EXPO, stagger: 0.05 }, 0)
    .fromTo(strokes(em).filter((p) => !p.closest('[data-stars]') && !p.closest('mask') && !p.closest('clipPath')), { drawSVG: '0%' }, { drawSVG: '100%', duration: 2, ease: 'power2.inOut', stagger: 0.08 }, 0)
    .fromTo(em.querySelector('[data-stars]'), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.9, ease: 'back.out(3)' }, 1.4);
}

// ---------------------------------------------------------------------------
export default async function initMotion() {
  const root = document.documentElement;
  if (!root.classList.contains('motion')) return; // the safety timer gave up: stay static
  root.classList.add('motion-ready');

  heroIntro();
  carousel();
  marquees();
  guestItems();
  iris();
  meuseMaps();
  reveals();
  cardsGrid();
  compareTable();
  guideBands();
  fiche();
  sejour();
  carnet();
  palmeraie();
  adresses();

  await fontsReady(1500);
  splitHeadings();
  footer();
  ScrollTrigger.refresh();
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
