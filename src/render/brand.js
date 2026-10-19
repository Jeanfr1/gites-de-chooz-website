// So Dream emblem, inlined from assets-src/brand/emblem-forest.svg (scripts/make-logo.py).
// Ink = currentColor, stars = --star; the stroke can be thickened for small sizes.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SOURCE = readFileSync(resolve(process.cwd(), 'assets-src/brand/emblem-forest.svg'), 'utf8');
let uid = 0;

export function emblem({ cls = '', sw = 2.4, label = '' } = {}) {
  const n = ++uid;
  const svg = SOURCE
    .replace(/<svg[^>]*>/, `<svg class="emblem${cls ? ` ${cls}` : ''}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true" focusable="false"'}>`)
    .replace(/id="in"/, `id="in-${n}"`)
    .replace(/url\(#in\)/g, `url(#in-${n})`)
    .replace(/id="behind"/, `id="behind-${n}"`)
    .replace(/url\(#behind\)/g, `url(#behind-${n})`)
    .replace(/stroke-width="6\.24[0-9]*"/, `stroke-width="${(sw * 2.6).toFixed(2)}"`)
    .replace(/stroke="#203F35" stroke-width="2\.4"/, `stroke="currentColor" stroke-width="${sw}"`)
    .replace(/fill="#A98B52" stroke="#A98B52" stroke-width="[0-9.]+"/, `fill="var(--star, #A98B52)" stroke="var(--star, #A98B52)" stroke-width="${(sw / 2).toFixed(2)}" data-stars`);
  return svg;
}

// Live wordmark (Playfair Display, as in the lockups): "So" roman + "Dream" italic.
export const wordmark = (cls = '') => `<span class="wordmark${cls ? ` ${cls}` : ''}">So <em>Dream</em></span>`;
