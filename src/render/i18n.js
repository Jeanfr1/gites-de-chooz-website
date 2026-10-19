// Locale state for the build-time renderer. fr is the source; every dictionary has the same keys
// (checked by scripts/check-i18n.mjs).
import fr from '../i18n/fr.js';
import en from '../i18n/en.js';
import de from '../i18n/de.js';
import es from '../i18n/es.js';
import nl from '../i18n/nl.js';
import pl from '../i18n/pl.js';
import tr from '../i18n/tr.js';
import { routes, LOCALES, DEFAULT_LOCALE } from '../data/site.js';

export const dicts = { fr, en, de, es, nl, pl, tr };

// The page being rendered (rendering is synchronous, one page at a time).
export let L = fr;
export let LOC = DEFAULT_LOCALE;
export function setLocale(locale) {
  LOC = locale;
  L = dicts[locale];
}

export const prefix = (locale = LOC) => (locale === DEFAULT_LOCALE ? '/' : `/${locale}/`);
export function href(id, locale = LOC) {
  const r = routes.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown route ${id}`);
  return `${prefix(locale)}${r.path}`;
}

export { LOCALES, DEFAULT_LOCALE };
