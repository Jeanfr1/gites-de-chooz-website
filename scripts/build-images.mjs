// Encode every web image from the kit masters (never modified) into public/img.
// Names carry a version (-v1): files are served with an immutable cache, so a
// changed image needs a new version instead of an overwrite.
// Run: npm run images  (after `npm run hero` when the hero layers change)
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { gites, sozen } from '../src/data/site.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'img');
const V = 'v1';
const manifest = {};

const AVIF = { quality: 52, effort: 6 };
const WEBP = { quality: 78, effort: 6 };

async function encode(input, name, widths, { alpha = false, region = null, fit = null } = {}) {
  const base = sharp(input, { limitInputPixels: false });
  const src = region ? base.clone().extract(region) : base.clone();
  const meta = region ? { width: region.width, height: region.height } : await base.metadata();
  const sizes = [...new Set(widths.map((w) => Math.min(w, meta.width)))].sort((a, b) => a - b);
  for (const w of sizes) {
    const h = Math.round((meta.height * w) / meta.width);
    const pipe = () => src.clone().resize(w, h, { fit: fit || 'fill', kernel: 'lanczos3' });
    await pipe().avif({ ...AVIF, quality: alpha ? 60 : AVIF.quality }).toFile(path.join(OUT, `${name}-${V}-${w}.avif`));
    await pipe().webp({ ...WEBP, alphaQuality: alpha ? 90 : undefined }).toFile(path.join(OUT, `${name}-${V}-${w}.webp`));
  }
  manifest[name] = { w: meta.width, h: meta.height, sizes, v: V };
}

async function alphaBox(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rows = new Array(height).fill(false);
  let x0 = width, x1 = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 8) {
        rows[y] = true;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
      }
    }
  }
  return { rows, x0, x1, width, height };
}

async function recolor(input, region, rgb) {
  // Single-ink artwork: keep the alpha, replace the ink.
  const alpha = await sharp(input).extract(region).ensureAlpha().extractChannel('alpha').toBuffer();
  return sharp({ create: { width: region.width, height: region.height, channels: 3, background: rgb } })
    .joinChannel(alpha)
    .png()
    .toBuffer();
}

async function main() {
  if (existsSync(OUT)) await rm(OUT, { recursive: true });
  await mkdir(OUT, { recursive: true });

  // ---- official gîte photos ------------------------------------------------
  for (const g of gites) {
    for (const p of g.photos) {
      await encode(path.join(ROOT, '04-fotos-reais', p.file), p.key, [480, 960, 1440]);
    }
  }

  // ---- hero (prepared by scripts/prepare-hero.py) -------------------------
  const cache = path.join(ROOT, 'assets-src', '.cache', 'hero');
  if (!existsSync(path.join(cache, 'plate.png'))) throw new Error('Run `npm run hero` first.');
  await encode(path.join(cache, 'plate.png'), 'hero-plate', [960, 1536]);
  await encode(path.join(cache, 'upper.png'), 'hero-brasserie', [640, 1018], { alpha: true });
  await encode(path.join(cache, 'lower.png'), 'hero-grain', [840, 1343], { alpha: true });
  await sharp(path.join(cache, 'rebuild-rest.png'))
    .resize(1200, 800).extract({ left: 0, top: 70, width: 1200, height: 630 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `og-${V}.jpg`));

  // ---- So Zen yoga photos: crop the photo area of the phone captures ------
  for (const p of sozen.photos) {
    await encode(path.join(ROOT, p.source), p.key, [600, 946], { region: p.region });
  }

  // ---- identity -------------------------------------------------------------
  const logo = path.join(ROOT, '01-identidade', 'logo-provisoria-transparente.png');
  const box = await alphaBox(logo);
  // emblem = first block of opaque rows; wordmark follows after an empty band
  let top = box.rows.indexOf(true), end = top;
  while (end < box.height && (box.rows[end] || box.rows.slice(end, end + 6).some(Boolean))) end++;
  const emblemRows = { top, height: end - top };
  const emblemBuf = await sharp(logo).extract({ left: 0, top: emblemRows.top, width: box.width, height: emblemRows.height }).png().toBuffer();
  const eb = await alphaBox(emblemBuf);
  const emblem = { left: eb.x0, top: emblemRows.top, width: eb.x1 - eb.x0 + 1, height: emblemRows.height };
  await encode(await recolor(logo, emblem, { r: 32, g: 63, b: 53 }), 'emblem-forest', [96, 192], { alpha: true });
  await encode(await recolor(logo, emblem, { r: 244, g: 240, b: 229 }), 'emblem-linen', [96, 192], { alpha: true });
  const full = { left: box.x0, top, width: box.x1 - box.x0 + 1, height: box.rows.lastIndexOf(true) - top + 1 };
  await encode(await recolor(logo, full, { r: 244, g: 240, b: 229 }), 'logo-linen', [360, 720], { alpha: true });

  const sozenLogo = path.join(ROOT, sozen.logo);
  await encode(sozenLogo, 'sozen-logo', [240, 480], { alpha: true });

  // favicons: emblem on linen
  const emblemPng = await recolor(logo, emblem, { r: 32, g: 63, b: 53 });
  for (const [size, file] of [[32, `favicon-32-${V}.png`], [180, `apple-touch-icon-${V}.png`], [512, `icon-512-${V}.png`]]) {
    const pad = Math.round(size * 0.1);
    const inner = await sharp(emblemPng).resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 244, g: 240, b: 229, alpha: 1 } } })
      .composite([{ input: inner, left: pad, top: pad }])
      .png()
      .toFile(path.join(OUT, file));
  }

  await writeFile(path.join(ROOT, 'src', 'data', 'images.json'), JSON.stringify(manifest, null, 1) + '\n');
  console.log(`Encoded ${Object.keys(manifest).length} images into public/img`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
