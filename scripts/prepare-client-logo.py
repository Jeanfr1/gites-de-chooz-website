"""Sophie's So Dream logo (made by a friend) -> transparent, colour-true web/print files.

Sources (11-brief-v2/logo-client/):
  Plan-de-travail-1.png  original artwork (true colours, transparent, but small: ~316 x 434 px)
  IMG_3759.jpg           large copy (~1000 px) on a cream background, colours washed by the screenshot
The large copy is colour-matched to the original (least squares on aligned pixels), cut out of its
cream background (solid disc + crescent, colour-to-alpha for the lettering) and saved to
assets-src/brand/client/. Run: ~/anaconda3/bin/python3 -I scripts/prepare-client-logo.py
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '11-brief-v2' / 'logo-client'
OUT = ROOT / 'assets-src' / 'brand' / 'client'
OUT.mkdir(parents=True, exist_ok=True)

png = np.asarray(Image.open(SRC / 'Plan-de-travail-1.png').convert('RGBA')).astype(np.float64)
jpg = np.asarray(Image.open(SRC / 'IMG_3759.jpg').convert('RGB')).astype(np.float64)
jpg = jpg[:, 3:-3]  # 1-2 px grey borders on both sides of the screenshot

# --- background and logo boxes ---------------------------------------------------------
bg = np.median(np.concatenate([jpg[:20].reshape(-1, 3), jpg[-20:].reshape(-1, 3)]), axis=0)
dist = np.abs(jpg - bg).max(-1)
ys, xs = np.where(dist > 40)
jb = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
pa = png[..., 3] > 8
ys2, xs2 = np.where(pa)
pb = (xs2.min(), ys2.min(), xs2.max() + 1, ys2.max() + 1)
print('jpg box', jb, 'png box', pb)

# --- colour match: original PNG resampled onto the JPG box ---------------------------------
jw, jh = jb[2] - jb[0], jb[3] - jb[1]
png_crop = Image.fromarray(png[pb[1]:pb[3], pb[0]:pb[2]].astype(np.uint8), 'RGBA').resize((jw, jh), Image.LANCZOS)
P = np.asarray(png_crop).astype(np.float64)
J = jpg[jb[1]:jb[3], jb[0]:jb[2]]
Js = ndimage.uniform_filter(J, size=(5, 5, 1))
Ps = ndimage.uniform_filter(P[..., :3], size=(5, 5, 1))
solid = ndimage.binary_erosion(P[..., 3] > 250, iterations=4)
x = Js[solid][::7] / 255
y = Ps[solid][::7] / 255
feat = lambda v: np.concatenate([v, v ** 2, v ** 3, v[:, :1] * v[:, 1:2], v[:, 1:2] * v[:, 2:3], v[:, :1] * v[:, 2:3], np.ones((len(v), 1))], 1)
coef, *_ = np.linalg.lstsq(feat(x), y, rcond=None)
err = np.abs(feat(x) @ coef - y).mean() * 255
print(f'colour fit on {len(x)} px, mean error {err:.1f}/255')

# --- alpha ---------------------------------------------------------------------------------
crop = jpg[jb[1] - 6:jb[3] + 6, jb[0] - 6:jb[2] + 6]
d = np.abs(crop - bg).max(-1)
# solid part = the biggest connected shape (disc + crescent), holes filled
lab, n = ndimage.label(d > 40)
sizes = ndimage.sum(np.ones_like(d), lab, range(1, n + 1))
disc = ndimage.binary_fill_holes(lab == (np.argmax(sizes) + 1))
disc_soft = np.asarray(Image.fromarray((disc * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float64) / 255
# lettering = colour-to-alpha against the cream background
diff = np.where(crop > bg, (crop - bg) / np.maximum(255 - bg, 1), (bg - crop) / np.maximum(bg, 1))
a_text = np.clip(diff.max(-1), 0, 1)
a_text = np.clip((a_text - 0.06) / 0.94, 0, 1)
alpha = np.maximum(disc_soft, a_text)
alpha[alpha < 0.02] = 0
# unmix the lettering from the cream, keep the disc as is
safe = np.maximum(a_text, 1e-3)[..., None]
# the disc edge takes the colour of the nearest inner pixel (no cream rim on dark backgrounds)
inner = ndimage.binary_erosion(disc, iterations=3)
_, (iy, ix) = ndimage.distance_transform_edt(~inner, return_indices=True)
disc_rgb = crop[iy, ix]
fg = np.where(disc[..., None] | (disc_soft[..., None] > 0.02), disc_rgb, np.clip((crop - bg) / safe + bg, 0, 255))
rgb = np.clip(feat((fg / 255).reshape(-1, 3)) @ coef, 0, 1).reshape(fg.shape) * 255
logo = np.dstack([rgb, alpha * 255]).astype(np.uint8)
full = Image.fromarray(logo, 'RGBA')
full = full.crop(full.getchannel('A').getbbox())
full.save(OUT / 'so-dream-logo.png', optimize=True)

# parts: the emblem (arc text + disc + crescent) and the SO DREAM wordmark, split at the widest empty band
A = np.asarray(full.getchannel('A')) > 20
rows = A.any(1)
gaps = [y for y in range(len(rows)) if not rows[y]]
split = max(gaps, key=lambda y: y if y < len(rows) * 0.95 else 0) if gaps else int(len(rows) * 0.8)
# last empty row before the wordmark
cut = [y for y in gaps if len(rows) * 0.6 < y < len(rows) * 0.95]
cut = cut[len(cut) // 2] if cut else int(len(rows) * 0.8)
emblem = full.crop((0, 0, full.width, cut))
emblem = emblem.crop(emblem.getchannel('A').getbbox())
word = full.crop((0, cut, full.width, full.height))
word = word.crop(word.getchannel('A').getbbox())
emblem.save(OUT / 'so-dream-emblem.png', optimize=True)
word.save(OUT / 'so-dream-wordmark.png', optimize=True)

# light versions for dark backgrounds: the navy lettering becomes linen (the painting stays)
def lighten(im, protect_disc):
    a = np.asarray(im).astype(np.float64)
    navy = (a[..., 2] > a[..., 0] + 25) & (a[..., :3].sum(-1) < 330)
    if protect_disc is not None:
        navy &= ~protect_disc
    out = a.copy()
    out[navy, :3] = (244, 240, 229)
    return Image.fromarray(out.astype(np.uint8), 'RGBA')

word_l = lighten(word, None)
word_l.save(OUT / 'so-dream-wordmark-linen.png', optimize=True)
# in the emblem only the arc lettering (outside the disc) is recoloured
ea = np.asarray(emblem.getchannel('A')) > 200
lab2, n2 = ndimage.label(ea)
sizes2 = ndimage.sum(np.ones_like(ea, dtype=float), lab2, range(1, n2 + 1))
disc2 = ndimage.binary_dilation(ndimage.binary_fill_holes(lab2 == (np.argmax(sizes2) + 1)), iterations=2)
lighten(emblem, disc2).save(OUT / 'so-dream-emblem-linen.png', optimize=True)
fa = np.asarray(full.getchannel('A')) > 200
lab3, n3 = ndimage.label(fa)
sizes3 = ndimage.sum(np.ones_like(fa, dtype=float), lab3, range(1, n3 + 1))
disc3 = ndimage.binary_dilation(ndimage.binary_fill_holes(lab3 == (np.argmax(sizes3) + 1)), iterations=2)
lighten(full, disc3).save(OUT / 'so-dream-logo-linen.png', optimize=True)
# the disc + crescent alone (favicons, small sizes): drop the arc lettering
disc_only = np.asarray(emblem).copy()
disc_only[~disc2, 3] = 0
d_im = Image.fromarray(disc_only, 'RGBA')
d_im.crop(d_im.getchannel('A').getbbox()).save(OUT / 'so-dream-disc.png', optimize=True)
for f in sorted(OUT.iterdir()):
    print(f.name, Image.open(f).size)
