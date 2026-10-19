// Departure checklist: ticks are remembered on this device (per gîte) and a ring shows the progress.
// The checkboxes work without JS; nothing here is required to read the reminder.
export default function initChecklist(note) {
  const key = `sodream:depart:${note.dataset.checklist}`;
  const boxes = [...note.querySelectorAll('input[type="checkbox"]')];
  const ring = document.querySelector('[data-depart-ring]');
  const count = document.querySelector('[data-depart-count]');
  const done = note.querySelector('[data-depart-done]');
  if (ring) ring.hidden = false;

  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    saved = [];
  }
  boxes.forEach((b, i) => {
    b.checked = saved.includes(i);
  });

  function update(fromUser) {
    const ticked = boxes.map((b, i) => (b.checked ? i : -1)).filter((i) => i >= 0);
    const k = ticked.length / boxes.length;
    if (ring) ring.style.setProperty('--done', k.toFixed(4));
    if (count) count.textContent = `${ticked.length}/${boxes.length}`;
    if (done) {
      const all = ticked.length === boxes.length;
      if (all && done.hidden && fromUser) {
        done.hidden = false;
        done.animate?.(
          [{ opacity: 0, transform: 'rotate(-8deg) scale(1.8)' }, { opacity: 1, transform: 'rotate(-8deg) scale(1)' }],
          { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 520, easing: 'cubic-bezier(.2,1.4,.4,1)' },
        );
      } else {
        done.hidden = !all;
      }
    }
    try {
      localStorage.setItem(key, JSON.stringify(ticked));
    } catch {
      /* private mode: progress simply isn't kept */
    }
  }
  boxes.forEach((b) => b.addEventListener('change', () => update(true)));
  update(false);
}
