// Every language must have exactly the keys of src/i18n/fr.js, with the same kinds of values.
// Run: npm run check:i18n
import { LOCALES } from '../src/data/site.js';

const shape = (o, p = '') =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? shape(v, `${p}${k}.`) : [[`${p}${k}`, Array.isArray(v) ? `array(${v.length})` : typeof v]]);

const dicts = Object.fromEntries(await Promise.all(LOCALES.map(async (l) => [l, (await import(`../src/i18n/${l}.js`)).default])));
const ref = new Map(shape(dicts.fr));
let bad = 0;
for (const l of LOCALES.filter((x) => x !== 'fr')) {
  const m = new Map(shape(dicts[l]));
  const missing = [...ref.keys()].filter((k) => !m.has(k));
  const extra = [...m.keys()].filter((k) => !ref.has(k));
  const kind = [...ref].filter(([k, t]) => m.has(k) && m.get(k) !== t).map(([k, t]) => `${k} (${t} ≠ ${m.get(k)})`);
  for (const [label, list] of [['missing', missing], ['extra', extra], ['different', kind]]) {
    if (list.length) {
      bad += list.length;
      console.error(`${l}: ${label} ${list.join(', ')}`);
    }
  }
}
console.log(bad ? `${bad} problem(s)` : `${LOCALES.length} languages, ${ref.size} keys each: OK`);
process.exit(bad ? 1 : 0);
