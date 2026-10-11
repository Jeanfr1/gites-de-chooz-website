#!/usr/bin/env python3
"""Prepare the 2.5D hero from the kit (03-hero).

The two transparent layers of the kit were re-rendered by an image model and are
not pixel-registered with the approved still (maquete-conceitual.png): the lower
tier is ~14 % bigger and shifted. This script:

1. registers each layer on the maquette (SIFT + RANSAC similarity),
2. pads the lower layer on the right (mirror) so it still reaches the stage edge,
3. builds a background plate = maquette with the tiers filled (push-pull) so the
   gap revealed by the opening never shows a ghost of the houses,
4. measures the gap between the tiers when they are fully open and writes the
   brass thread path through it,
5. writes src/data/hero.json + intermediates in assets-src/.cache/hero/
   (encoded for the web by scripts/build-images.mjs).

Run: npm run hero   (uses ~/anaconda3 python: opencv, numpy, pillow)
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
KIT = ROOT / "03-hero"
OUT = ROOT / "assets-src" / ".cache" / "hero"
DATA = ROOT / "src" / "data" / "hero.json"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1536, 1024
# Opening amplitude at progress 1, in stage pixels (timeline.json: upper rises, lower goes down a little)
OPEN_UP = 46
OPEN_DOWN = 24

cv2.setRNGSeed(7)
maq = cv2.imread(str(KIT / "maquete-conceitual.png"))
maq_g = cv2.cvtColor(maq, cv2.COLOR_BGR2GRAY)
sift = cv2.SIFT_create(nfeatures=8000)
km, dm = sift.detectAndCompute(maq_g, None)


def register(layer):
    alpha = layer[:, :, 3]
    gray = cv2.cvtColor(layer[:, :, :3], cv2.COLOR_BGR2GRAY)
    mask = cv2.erode((alpha > 200).astype(np.uint8) * 255, np.ones((9, 9), np.uint8))
    kl, dl = sift.detectAndCompute(gray, mask)
    pairs = cv2.BFMatcher().knnMatch(dl, dm, k=2)
    good = [m for m, n in pairs if m.distance < 0.72 * n.distance]
    src = np.float32([kl[m.queryIdx].pt for m in good])
    dst = np.float32([km[m.trainIdx].pt for m in good])
    A, inliers = cv2.estimateAffinePartial2D(
        src, dst, method=cv2.RANSAC, ransacReprojThreshold=4, maxIters=20000, confidence=0.999
    )
    return A, int(inliers.sum()), len(good)


layers = {}
report = {}
for name, file, pad_right in (("upper", "camada-brasserie.png", 0), ("lower", "camada-grain-e-meuse.png", 72)):
    src = cv2.imread(str(KIT / file), cv2.IMREAD_UNCHANGED)
    A, n_in, n_good = register(src)
    scale = float(np.hypot(A[0, 0], A[1, 0]))
    if abs(scale - 1) < 0.004 and abs(A[0, 2]) < 2 and abs(A[1, 2]) < 2:
        A = np.float32([[1, 0, 0], [0, 1, 0]])  # already registered: keep the pixels untouched
    if pad_right:
        # the layer was cut by its own canvas edge; mirror a strip so it still reaches the stage edge once scaled down
        src = cv2.copyMakeBorder(src, 0, 0, 0, pad_right, cv2.BORDER_REFLECT)
    warped = cv2.warpAffine(src, A, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    warped[:, :, 3] = np.where(warped[:, :, 3] < 3, 0, warped[:, :, 3])
    layers[name] = warped
    report[name] = {
        "matches": n_good,
        "inliers": n_in,
        "scale": round(scale, 4),
        "rotation_deg": round(float(np.degrees(np.arctan2(A[1, 0], A[0, 0]))), 3),
        "tx": round(float(A[0, 2]), 1),
        "ty": round(float(A[1, 2]), 1),
    }

# ---- background plate --------------------------------------------------------
union = np.maximum(layers["upper"][:, :, 3], layers["lower"][:, :, 3])
hole = cv2.dilate((union > 4).astype(np.uint8), np.ones((31, 31), np.uint8)) > 0
# right edge between the tiers: the maquette keeps bright paper fragments there that no layer covers
hole[430:720, 1380:] = True


def push_pull(img, valid):
    pyramid = []
    im = img * valid[..., None]
    w = valid.astype(np.float32)
    while min(im.shape[:2]) > 4:
        pyramid.append((im, w))
        im, w = cv2.pyrDown(im), cv2.pyrDown(w)
    est = im / np.maximum(w, 1e-6)[..., None]
    for im, w in reversed(pyramid):
        up = cv2.resize(est, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_LINEAR)
        known = np.where(w[..., None] > 1e-6, im / np.maximum(w, 1e-6)[..., None], up)
        k = np.clip(w * 4, 0, 1)[..., None]
        est = known * k + up * (1 - k)
    return est


m = maq.astype(np.float32)
fill = push_pull(m, (~hole).astype(np.float32))
plate = np.where(hole[..., None], fill, m)
plate = cv2.GaussianBlur(plate, (0, 0), 5) * 0.4 + plate * 0.6
cv2.imwrite(str(OUT / "plate.png"), np.clip(plate, 0, 255).astype(np.uint8))


# ---- layers cropped to their bounding boxes -----------------------------------
def bbox(alpha, margin=2):
    ys, xs = np.where(alpha > 0)
    x0, x1 = max(0, xs.min() - margin), min(W, xs.max() + 1 + margin)
    y0, y1 = max(0, ys.min() - margin), min(H, ys.max() + 1 + margin)
    return int(x0), int(y0), int(x1), int(y1)


boxes = {}
for name, img in layers.items():
    x0, y0, x1, y1 = bbox(img[:, :, 3])
    cv2.imwrite(str(OUT / f"{name}.png"), img[y0:y1, x0:x1])
    boxes[name] = {"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0}


# ---- gap centreline when fully open ------------------------------------------
def edge(alpha, top):
    """Per column: first opaque row from the top (top=True) or last opaque row (top=False)."""
    solid = alpha > 140
    out = np.full(W, np.nan)
    for x in range(W):
        rows = np.where(solid[:, x])[0]
        if len(rows):
            out[x] = rows.min() if top else rows.max()
    return out


up_bottom = edge(layers["upper"][:, :, 3], top=False) - OPEN_UP
low_top = edge(layers["lower"][:, :, 3], top=True) + OPEN_DOWN
xs = np.arange(W)
valid = ~np.isnan(up_bottom) & ~np.isnan(low_top) & (xs > 600)
centre = np.where(valid, np.minimum((up_bottom + low_top) / 2, up_bottom + 18), np.nan)
# robust smoothing: rolling median then a wide gaussian
s = np.array(centre)
med = np.array([np.nanmedian(s[max(0, i - 40): i + 41]) if valid[i] else np.nan for i in range(W)])
med = np.where(np.isnan(med), np.interp(xs, xs[valid], med[valid]), med)
smooth = cv2.GaussianBlur(med.reshape(1, -1).astype(np.float32), (0, 0), 28).ravel()

# Thread: emerges from under the Brasserie tier on the right, runs through the gap,
# leaves the tiers on the left, crosses the mist and the river, exits at the bottom.
pts = [(1560, float(smooth[1530]) - 10)]
for x in range(1500, 640, -60):
    pts.append((x, float(smooth[x])))
x_left = 600
pts += [(x_left - 40, float(smooth[640]) + 40), (470, 640), (430, 760), (500, 880), (640, 960), (720, 1060)]


def catmull_rom(points):
    p = [points[0]] + points + [points[-1]]
    d = f"M {p[1][0]:.1f} {p[1][1]:.1f}"
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C {c1[0]:.1f} {c1[1]:.1f}, {c2[0]:.1f} {c2[1]:.1f}, {p2[0]:.1f} {p2[1]:.1f}"
    return d


thread_d = catmull_rom(pts)

# ---- verification artefacts --------------------------------------------------
def composite(base, layer, box, dy):
    out = base.copy()
    x, y, w, h = box["x"], box["y"] + dy, box["w"], box["h"]
    crop = layer[box["y"]: box["y"] + h, x: x + w]
    y0, y1 = max(0, y), min(H, y + h)
    c = crop[y0 - y: y1 - y]
    a = c[:, :, 3:4].astype(np.float32) / 255
    out[y0:y1, x: x + w] = out[y0:y1, x: x + w] * (1 - a) + c[:, :, :3].astype(np.float32) * a
    return out


rest = composite(composite(plate, layers["lower"], boxes["lower"], 0), layers["upper"], boxes["upper"], 0)
opened = composite(composite(plate, layers["lower"], boxes["lower"], OPEN_DOWN), layers["upper"], boxes["upper"], -OPEN_UP)
cv2.imwrite(str(OUT / "rebuild-rest.png"), rest.astype(np.uint8))
cv2.imwrite(str(OUT / "rebuild-open.png"), opened.astype(np.uint8))
overlay = opened.astype(np.uint8).copy()
for (x, y) in pts:
    cv2.circle(overlay, (int(x), int(y)), 6, (0, 0, 255), -1)
for x in range(0, W, 4):
    if not np.isnan(up_bottom[x]):
        cv2.circle(overlay, (x, int(up_bottom[x])), 1, (255, 0, 255), -1)
    if not np.isnan(low_top[x]):
        cv2.circle(overlay, (x, int(low_top[x])), 1, (255, 255, 0), -1)
cv2.imwrite(str(OUT / "verify-thread.jpg"), overlay)
side = np.hstack([cv2.resize(maq, (768, 512)), cv2.resize(rest.astype(np.uint8), (768, 512))])
cv2.imwrite(str(OUT / "verify-maquette-vs-rest.jpg"), side)

hero = {
    "_note": "Generated by scripts/prepare-hero.py — do not edit by hand.",
    "stage": {"w": W, "h": H},
    "registration": report,
    "layers": boxes,
    "open": {"up": OPEN_UP, "down": OPEN_DOWN},
    "thread": thread_d,
}
DATA.parent.mkdir(parents=True, exist_ok=True)
DATA.write_text(json.dumps(hero, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"registration": report, "layers": boxes}, indent=1))
