// Bonnes adresses filters. Without JS every place is listed.
// With motion allowed, cards glide to their new place (GSAP Flip).
export default async function initFilters(section) {
  const group = section.querySelector('[data-filter-group]');
  const result = section.querySelector('[data-filter-result]');
  const cards = [...section.querySelectorAll('[data-category]')];
  const buttons = [...group.querySelectorAll('[data-filter]')];
  let labels = [];
  try {
    labels = JSON.parse(result.dataset.labels || '[]');
  } catch {
    labels = [];
  }
  const motion = document.documentElement.classList.contains('motion');
  group.hidden = false;

  let gsap = null;
  let Flip = null;
  if (motion) {
    try {
      ({ gsap } = await import('gsap'));
      ({ Flip } = await import('gsap/Flip'));
      gsap.registerPlugin(Flip);
    } catch {
      gsap = null;
    }
  }

  function apply(category) {
    const state = Flip ? Flip.getState(cards) : null;
    let n = 0;
    for (const card of cards) {
      const visible = category === 'all' || card.dataset.category === category;
      card.style.display = visible ? '' : 'none';
      if (visible) n++;
    }
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === category)));
    // translated plural forms are built at render time ("1 adresse", "3 adresy", "5 adresów"…)
    if (labels[n]) result.textContent = labels[n];
    if (state) {
      Flip.from(state, {
        duration: 0.7,
        ease: 'power3.inOut',
        absolute: true,
        scale: true,
        stagger: 0.02,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.86, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.86, duration: 0.35, ease: 'power2.in' }),
      });
    }
  }

  group.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (b) apply(b.dataset.filter);
  });
}
