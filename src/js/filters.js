// Outing filters (Explorer). Without JS all outings are listed.
export default function initFilters(section) {
  const group = section.querySelector('[data-filter-group]');
  const result = section.querySelector('[data-filter-result]');
  const cards = [...section.querySelectorAll('[data-category]')];
  const buttons = [...group.querySelectorAll('[data-filter]')];
  group.hidden = false;

  function apply(category) {
    let n = 0;
    for (const card of cards) {
      const visible = category === 'all' || card.dataset.category === category;
      card.hidden = !visible;
      if (visible) n++;
    }
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === category)));
    result.textContent = `${n} ${n > 1 ? 'idées' : 'idée'} à découvrir`;
  }

  group.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (b) apply(b.dataset.filter);
  });
}
