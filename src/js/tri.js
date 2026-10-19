// Tri guide search: type a waste item, the matching bins light up.
// Without JS the five bins and their lists are simply shown.
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export default function initTri(section) {
  const search = section.querySelector('[data-tri-search]');
  const input = section.querySelector('[data-tri-input]');
  const out = section.querySelector('[data-tri-out]');
  const none = section.querySelector('[data-tri-none]');
  const binsWrap = section.querySelector('.bins');
  const bins = [...section.querySelectorAll('[data-bin]')];
  search.hidden = false;

  function apply() {
    const q = fold(input.value);
    binsWrap.classList.toggle('is-searching', q.length > 1);
    const found = [];
    for (const bin of bins) {
      let hit = false;
      for (const li of bin.querySelectorAll('li')) {
        const m = q.length > 1 && (li.dataset.q.includes(q) || q.split(/\s+/).every((w) => w.length > 2 && li.dataset.q.includes(w)));
        li.classList.toggle('is-match', m);
        if (m) {
          hit = true;
          found.push([li.textContent, bin.dataset.bin]);
        }
      }
      bin.classList.toggle('has-match', hit);
    }
    if (q.length < 2) {
      out.textContent = '';
      none.hidden = true;
      return;
    }
    none.hidden = found.length > 0;
    out.innerHTML = '';
    found.slice(0, 3).forEach(([item, bin], i) => {
      if (i) out.append(' · ');
      const b = document.createElement('b');
      b.textContent = item;
      out.append(b, ` → ${bin}`);
    });
  }
  input.addEventListener('input', apply);
  input.addEventListener('search', apply);
}
