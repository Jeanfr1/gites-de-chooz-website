import { defineConfig } from 'vite';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './src/render/pages.js';
import { routes, LOCALES, DEFAULT_LOCALE } from './src/data/site.js';
import { href } from './src/render/i18n.js';
import { SITE_URL, isIndexable } from './src/render/ui.js';

const root = dirname(fileURLToPath(import.meta.url));

// sitemap.xml (indexable routes × 7 languages, with their hreflang alternates) and robots.txt,
// written into dist/ at build time. Submit SITE_URL/sitemap.xml in Google Search Console.
function seoFiles() {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      const urls = routes.filter((r) => isIndexable(r.id)).flatMap((r) => LOCALES.map((l) => {
        const alts = [...LOCALES.map((a) => [a, href(r.id, a)]), ['x-default', href(r.id, DEFAULT_LOCALE)]]
          .map(([a, p]) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${SITE_URL}${p}"/>`)
          .join('\n');
        return `  <url>\n    <loc>${SITE_URL}${href(r.id, l)}</loc>\n${alts}\n  </url>`;
      }));
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n` });
    },
  };
}

// Every page is rendered at build time from src/data/site.js + src/i18n/<locale>.js
// (works without JavaScript). Each HTML entry is a generated stub holding a <!--@page:locale/route-->
// marker: 14 routes × 7 languages + 404. The stubs are not versioned (see .gitignore).
function writeStubs() {
  for (const p of pages) {
    const file = resolve(root, p.file);
    const html = `<!--@page:${p.id}-->\n`;
    if (existsSync(file) && readFileSync(file, 'utf8') === html) continue;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
  }
}

function renderPages() {
  let server;
  return {
    name: 'render-pages',
    config() {
      writeStubs();
    },
    configureServer(s) {
      server = s;
      s.watcher.on('change', (file) => {
        if (/src[\\/](render|data|i18n)[\\/]/.test(file)) s.ws.send({ type: 'full-reload' });
      });
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const m = html.match(/<!--@page:([\w/-]+)-->/);
        if (!m) return html;
        const mod = server ? await server.ssrLoadModule('/src/render/pages.js') : await import('./src/render/pages.js');
        return mod.renderPage(m[1]);
      },
    },
  };
}

export default defineConfig({
  appType: 'mpa',
  plugins: [renderPages(), seoFiles()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p.id.replace('/', '-'), resolve(root, p.file)])),
    },
  },
});
