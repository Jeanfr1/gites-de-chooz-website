// Encode every web image from the masters (never modified) into public/img.
// Names carry a version (-v2): files are served with an immutable cache, so a
// changed image needs a new version instead of an overwrite.
// Sources: Sophie's photos (10-photos-so-dream, kept locally), the Gîtes de France
// exteriors of the kit (04-fotos-reais), the hero layers (npm run hero) and the
// So Dream brand (assets-src/brand, made by scripts/make-logo.py).
// Run: npm run images
import { mkdir, writeFile, rm, readdir, readFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { gites, sozen } from '../src/data/site.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'img');
const V = 'v2';
const manifest = {};

const AVIF = { quality: 52, effort: 5 };
const WEBP = { quality: 78, effort: 5 };
const LINEN = { r: 244, g: 240, b: 229, alpha: 1 };

async function encode(input, name, widths, { alpha = false, region = null } = {}) {
  // .rotate() applies the EXIF orientation of camera files
  const base = sharp(input, { limitInputPixels: false }).rotate();
  const src = region ? base.clone().extract(region) : base.clone();
  let meta;
  if (region) meta = { width: region.width, height: region.height };
  else {
    const m = await sharp(input).metadata();
    meta = (m.orientation || 1) >= 5 ? { width: m.height, height: m.width } : { width: m.width, height: m.height };
  }
  const sizes = [...new Set(widths.map((w) => Math.min(w, meta.width)))].sort((a, b) => a - b);
  for (const w of sizes) {
    const h = Math.round((meta.height * w) / meta.width);
    const pipe = () => src.clone().resize(w, h, { fit: 'fill', kernel: 'lanczos3' });
    await pipe().avif({ ...AVIF, quality: alpha ? 60 : AVIF.quality }).toFile(path.join(OUT, `${name}-${V}-${w}.avif`));
    await pipe().webp({ ...WEBP, alphaQuality: alpha ? 90 : undefined }).toFile(path.join(OUT, `${name}-${V}-${w}.webp`));
  }
  manifest[name] = { w: meta.width, h: meta.height, sizes, v: V };
}

// Gîtes de France kit files are named photo<N>-<ref>_<h>_<w>.jpg; the key is <gite>-photo<N>-<ref>.
async function gdfFile(key) {
  const stem = key.replace(/^[a-z]+-/, '');
  const files = await readdir(path.join(ROOT, '04-fotos-reais'));
  const file = files.find((f) => f.startsWith(`${stem}_`));
  if (!file) throw new Error(`No kit photo for ${key}`);
  return path.join(ROOT, '04-fotos-reais', file);
}

async function main() {
  if (existsSync(OUT)) await rm(OUT, { recursive: true });
  await mkdir(OUT, { recursive: true });

  // ---- gîte photos -----------------------------------------------------------
  const done = new Set();
  for (const g of gites) {
    for (const p of g.photos) {
      if (done.has(p.key)) continue;
      done.add(p.key);
      if (p.src) {
        const file = path.join(ROOT, p.src);
        if (!existsSync(file)) throw new Error(`Missing ${p.src} — Sophie's masters are kept locally (see 10-photos-so-dream/manifest.json)`);
        await encode(file, p.key, [480, 960, 1600]);
      } else {
        await encode(await gdfFile(p.key), p.key, [480, 960, 1440]);
      }
      process.stdout.write('.');
    }
  }
  process.stdout.write('\n');

  // ---- hero (prepared by scripts/prepare-hero.py) -------------------------
  const cache = path.join(ROOT, 'assets-src', '.cache', 'hero');
  if (!existsSync(path.join(cache, 'plate.png'))) throw new Error('Run `npm run hero` first.');
  await encode(path.join(cache, 'plate.png'), 'hero-plate', [960, 1536]);
  await encode(path.join(cache, 'upper.png'), 'hero-brasserie', [640, 1018], { alpha: true });
  await encode(path.join(cache, 'lower.png'), 'hero-grain', [840, 1343], { alpha: true });

  // ---- So Zen yoga photos: crop the photo area of the phone captures ------
  for (const p of sozen.photos) {
    await encode(path.join(ROOT, p.source), p.key, [600, 946], { region: p.region });
  }
  await encode(path.join(ROOT, sozen.logo), 'sozen-logo', [240, 480], { alpha: true });

  // ---- So Dream identity ----------------------------------------------------
  const brand = path.join(ROOT, 'assets-src', 'brand');
  const emblemBold = await readFile(path.join(brand, 'emblem-forest-bold.svg'));
  await copyFile(path.join(brand, 'emblem-forest-bold.svg'), path.join(OUT, `favicon-${V}.svg`));
  for (const [size, file] of [[32, `favicon-32-${V}.png`], [180, `apple-touch-icon-${V}.png`], [512, `icon-512-${V}.png`]]) {
    const pad = Math.round(size * (size <= 32 ? 0.02 : 0.12));
    const inner = await sharp(emblemBold, { density: 72 * Math.max(1, (size * 2) / 200) })
      .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: LINEN } })
      .composite([{ input: inner, left: pad, top: pad }])
      .png()
      .toFile(path.join(OUT, file));
  }

  // Share image 1200×630: the hero illustration, a forest veil and the stacked So Dream lockup
  const lockup = await sharp(path.join(ROOT, '01-identidade', 'so-dream', 'so-dream-stacked-linen.svg'), { density: 160 })
    .resize({ height: 430 })
    .png()
    .toBuffer();
  const lm = await sharp(lockup).metadata();
  const veil = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#173a30" stop-opacity=".96"/><stop offset=".42" stop-color="#173a30" stop-opacity=".78"/><stop offset=".72" stop-color="#173a30" stop-opacity="0"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#g)"/></svg>`);
  await sharp(path.join(cache, 'rebuild-rest.png'))
    .resize(1200, 630, { fit: 'cover', position: 'right' })
    .composite([{ input: veil }, { input: lockup, left: Math.round(250 - lm.width / 2) + 40, top: Math.round((630 - lm.height) / 2) }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, `og-${V}.jpg`));

  await writeFile(path.join(ROOT, 'src', 'data', 'images.json'), JSON.stringify(manifest, null, 1) + '\n');
  console.log(`Encoded ${Object.keys(manifest).length} images into public/img`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
