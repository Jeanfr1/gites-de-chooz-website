// Gîtes carousel (home). Without JS it is a native horizontal scroller with snap points.
// On wide screens the four cards fit side by side (main.css) and the controls are hidden.
// Adds: mouse drag with inertia, previous/next buttons, a progress line and a parallax
// of each photo inside its arch while the row moves.
export default function initCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  const bar = root.querySelector('[data-carousel-bar]');
  const buttons = root.querySelector('[data-carousel-buttons]');
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const slides = [...track.children];
  const imgs = slides.map((s) => s.querySelector('picture'));
  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  buttons.hidden = false;

  const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: motion ? 'smooth' : 'auto' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: motion ? 'smooth' : 'auto' }));

  let queued = false;
  function frame() {
    queued = false;
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 1;
    const visible = track.clientWidth / track.scrollWidth;
    bar.style.setProperty('--p', Math.min(1, visible + (1 - visible) * p).toFixed(4));
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    if (motion) {
      const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      slides.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const k = (r.left + r.width / 2 - mid) / track.clientWidth; // -1 .. 1
        if (imgs[i]) imgs[i].style.transform = `translate3d(${(-k * 9).toFixed(2)}%, 0, 0) scale(1.18)`;
      });
    }
  }
  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  };
  track.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  request();

  // Mouse drag (touch and trackpads already scroll natively)
  let down = false;
  let startX = 0;
  let startLeft = 0;
  let lastX = 0;
  let lastT = 0;
  let v = 0;
  let moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (track.scrollWidth <= track.clientWidth + 1) return; // the four gîtes already fit: nothing to drag
    down = true;
    moved = false;
    startX = lastX = e.clientX;
    startLeft = track.scrollLeft;
    lastT = performance.now();
    v = 0;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      track.classList.add('is-dragging');
    }
    if (!moved) return;
    track.scrollLeft = startLeft - dx;
    const now = performance.now();
    v = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX;
    lastT = now;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (!moved) return;
    // glide, then let the snap points settle
    let vel = v * 16;
    const glide = () => {
      if (Math.abs(vel) < 0.5 || !motion) {
        track.classList.remove('is-dragging');
        return;
      }
      track.scrollLeft -= vel;
      vel *= 0.92;
      requestAnimationFrame(glide);
    };
    requestAnimationFrame(glide);
  });
  // a drag must not open the gîte under the pointer
  track.addEventListener('click', (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);
}
