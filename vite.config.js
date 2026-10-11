import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './src/render/pages.js';

const root = dirname(fileURLToPath(import.meta.url));

// Every page is rendered at build time from src/data/site.js (works without JavaScript).
// Each HTML entry only holds a <!--@page:id--> marker.
function renderPages() {
  let server;
  return {
    name: 'render-pages',
    configureServer(s) {
      server = s;
      s.watcher.on('change', (file) => {
        if (/src[\\/](render|data)[\\/]/.test(file)) s.ws.send({ type: 'full-reload' });
      });
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const m = html.match(/<!--@page:([\w-]+)-->/);
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
      input: Object.fromEntries(pages.map((p) => [p.id, resolve(root, p.file)])),
    },
  },
});
