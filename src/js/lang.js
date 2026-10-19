// Suggest the visitor's own language once (never redirects). Dismissal is remembered.
export default function initLangSuggest() {
  const el = document.querySelector('[data-lang-suggest]');
  let data;
  try {
    data = JSON.parse(el.textContent);
  } catch {
    return;
  }
  const KEY = 'sodream:lang-suggest';
  try {
    if (localStorage.getItem(KEY)) return;
  } catch {
    /* storage blocked: still suggest */
  }
  const wanted = (navigator.languages || [navigator.language || ''])
    .map((l) => l.slice(0, 2).toLowerCase())
    .find((l) => data.locales[l]);
  if (!wanted || wanted === data.current) return;
  // a visitor who chose this language explicitly (came from our own pages) is not bothered
  if (document.referrer && new URL(document.referrer).origin === location.origin) return;

  const s = data.locales[wanted];
  const box = document.createElement('aside');
  box.className = 'lang-suggest';
  box.lang = wanted;
  box.setAttribute('aria-label', s.text);
  const p = document.createElement('p');
  p.textContent = s.text;
  const a = document.createElement('a');
  a.href = s.href;
  a.hreflang = wanted;
  a.textContent = s.action;
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', s.dismiss);
  close.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>';
  const remember = () => {
    try {
      localStorage.setItem(KEY, wanted);
    } catch {
      /* ignore */
    }
  };
  close.addEventListener('click', () => {
    remember();
    box.remove();
  });
  a.addEventListener('click', remember);
  box.append(p, a, close);
  setTimeout(() => {
    document.body.append(box);
    box.animate?.([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
  }, 1200);
}
