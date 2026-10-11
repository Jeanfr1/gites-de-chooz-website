// Gallery dialog: Escape closes, arrows change photo, focus returns to the opening tile.
// Without JS every tile is a plain link to the full-size photo.
export default function initGallery(section) {
  const dialog = section.querySelector('[data-lightbox]');
  const dataEl = section.querySelector('[data-gallery-data]');
  if (!dialog || !dataEl || typeof dialog.showModal !== 'function') return;
  const photos = JSON.parse(dataEl.textContent);
  const img = dialog.querySelector('[data-lightbox-img]');
  const avif = dialog.querySelector('[data-lightbox-avif]');
  const caption = dialog.querySelector('[data-lightbox-caption]');
  const count = dialog.querySelector('[data-lightbox-count]');
  const sizes = '(max-width: 900px) 100vw, 80vw';
  let index = 0;
  let trigger = null;

  function show(i) {
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    avif.srcset = p.avif;
    avif.sizes = sizes;
    img.srcset = p.webp;
    img.sizes = sizes;
    img.src = p.src;
    img.width = p.w;
    img.height = p.h;
    img.alt = p.alt;
    caption.textContent = p.alt;
    count.textContent = `${index + 1} / ${photos.length}`;
    // warm the next photo
    const next = photos[(index + 1) % photos.length];
    const pre = new Image();
    pre.sizes = sizes;
    pre.srcset = next.webp;
  }

  // tiles live in the gallery section; the lead photo of the fiche opens it too
  document.addEventListener('click', (e) => {
    const tile = e.target.closest('[data-gallery-index]');
    if (!tile) return;
    e.preventDefault();
    trigger = tile;
    show(Number(tile.dataset.galleryIndex));
    dialog.showModal();
    dialog.querySelector('[data-lightbox-next]').focus();
  });
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });
  // click on the dark area closes
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('lightbox-figure')) dialog.close();
  });
  // swipe
  let x0 = null;
  dialog.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  dialog.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 60 && e.pointerType !== 'mouse') show(index + (dx < 0 ? 1 : -1));
  });
  dialog.addEventListener('close', () => {
    if (trigger) trigger.focus();
  });
}
