// Hero 2.5D — "Les maisons s’ouvrent sur le paysage" (06-roteiros/MOTION.md, 07-integracao/timeline.json)
//   0 %      planes at rest, title and button visible
//   20–55 %  La Brasserie rises, Le Grain d’Amour goes down a little
//   35–90 %  the brass thread draws itself between the planes
//   70–100 % hand-off: the thread leaves the hero and continues towards the gîte cards
// Scroll is never blocked: the hero is a short sticky section. Reduced motion = static scene.
// Capture flag: ?p=0.5 freezes the hero at that progress.

const STAGE_W = 1536;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// Intro thread, in % of the intro section (x, y pairs); the start x is set from the hero thread exit.
const INTRO = (x0) => [
  ['M', [x0, 0]],
  ['C', [x0, 7, 53.6, 5, 53.6, 14]],
  ['S', [53.4, 27, 51.5, 33]],
  ['S', [50, 42, 50, 50]],
  ['C', [50, 62, 51.2, 72, 50, 84]],
  ['S', [49.6, 96, 50, 100]],
];

export default function initHero() {
  const hero = document.querySelector('[data-hero]');
  const track = hero.querySelector('[data-hero-track]');
  const sticky = hero.querySelector('.hero-sticky');
  const stage = hero.querySelector('[data-stage]');
  const upper = stage.querySelector('[data-layer="brasserie"]');
  const lower = stage.querySelector('[data-layer="grain"]');
  const threads = stage.querySelectorAll('[data-thread]');
  const threadLine = stage.querySelector('.thread-line');
  const openUp = parseFloat(stage.style.getPropertyValue('--open-up')) || 46;
  const openDown = parseFloat(stage.style.getPropertyValue('--open-down')) || 24;

  const intro = document.querySelector('[data-intro]');
  const introSvg = intro && intro.querySelector('.intro-thread');
  const introPath = intro && intro.querySelector('[data-intro-thread]');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const forced = new URLSearchParams(location.search).get('p');
  let queued = false;
  let introStartX = 47;

  function headerHeight() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
  }

  function heroProgress() {
    if (forced !== null) return clamp(parseFloat(forced) || 0);
    const range = track.offsetHeight - sticky.offsetHeight;
    if (range <= 0) return 0;
    return clamp((headerHeight() - track.getBoundingClientRect().top) / range);
  }

  // Where does the hero thread leave the visible hero? -> start of the intro thread (continuity)
  function measureExit() {
    if (!threadLine || !introSvg) return;
    const s = stage.getBoundingClientRect();
    const h = sticky.getBoundingClientRect();
    const scale = s.width / STAGE_W;
    const total = threadLine.getTotalLength();
    let exitX = null;
    for (let i = 0; i <= 200; i++) {
      const pt = threadLine.getPointAtLength((total * i) / 200);
      const y = s.top + pt.y * scale;
      if (y >= h.bottom - 4) {
        exitX = s.left + pt.x * scale;
        break;
      }
    }
    if (exitX === null) return;
    const introRect = intro.getBoundingClientRect();
    introStartX = clamp(((exitX - introRect.left) / introRect.width) * 100, 5, 95);
  }

  function layoutIntro() {
    if (!introSvg || !introPath) return;
    const w = intro.offsetWidth;
    const hgt = intro.offsetHeight;
    introSvg.setAttribute('viewBox', `0 0 ${w} ${hgt}`);
    const d = INTRO(introStartX)
      .map(([cmd, nums]) => `${cmd} ${nums.map((n, i) => (i % 2 === 0 ? (n / 100) * w : (n / 100) * hgt).toFixed(1)).join(' ')}`)
      .join(' ');
    introPath.setAttribute('d', d);
    introPath.style.strokeDasharray = '1 1';
  }

  function frame() {
    queued = false;
    const still = reduce.matches;
    const p = still ? 0 : heroProgress();
    const k = window.innerWidth <= 900 ? 0.75 : 1; // reduced amplitude on phones
    const scale = stage.offsetWidth / STAGE_W;
    const open = ease(seg(p, 0.2, 0.55));
    const draw = still ? 1 : ease(seg(p, 0.35, 0.9));
    upper.style.transform = `translate3d(0, ${(-openUp * open * scale * k).toFixed(2)}px, 0)`;
    lower.style.transform = `translate3d(0, ${(openDown * open * scale * k).toFixed(2)}px, 0)`;
    threads.forEach((t) => (t.style.strokeDashoffset = (1 - draw).toFixed(4)));
    stage.dataset.progress = p.toFixed(3);

    if (introPath) {
      const r = intro.getBoundingClientRect();
      const vh = window.innerHeight;
      const q = still ? 1 : clamp((vh * 0.98 - r.top) / (r.height * 0.82));
      introPath.style.strokeDashoffset = (1 - q).toFixed(4);
    }
  }

  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  };
  const relayout = () => {
    measureExit();
    layoutIntro();
    request();
  };

  relayout();
  if (forced === null) window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', relayout);
  reduce.addEventListener('change', relayout);
  // images decode after first paint; re-measure once they are in
  window.addEventListener('load', relayout, { once: true });
}
