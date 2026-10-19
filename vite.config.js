import { defineConfig } from 'vite';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './src/render/pages.js';

const root = dirname(fileURLToPath(import.meta.url));

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
  plugins: [renderPages()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p.id.replace('/', '-'), resolve(root, p.file)])),
    },
  },
});
