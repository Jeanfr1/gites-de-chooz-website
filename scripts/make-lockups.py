#!/usr/bin/env python3
"""So Dream lockups with the wordmark converted to outlines (Playfair Display + Jost from the site),
so the logo files work anywhere (print shop, Canva, social) without the fonts installed."""
import re
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "node_modules" / "@fontsource-variable"
BRAND = ROOT / "assets-src" / "brand"
OUT = ROOT / "01-identidade" / "so-dream"
OUT.mkdir(parents=True, exist_ok=True)

def load(path, wght):
    f = TTFont(path)
    return instantiateVariableFont(f, {"wght": wght})

serif = load(FONTS / "playfair-display/files/playfair-display-latin-wght-normal.woff2", 400)
serif_i = load(FONTS / "playfair-display/files/playfair-display-latin-wght-italic.woff2", 400)
sans = load(FONTS / "jost/files/jost-latin-wght-normal.woff2", 500)

def kern_table(font):
    """Pair kerning from GPOS PairPos (format 1 + 2) — enough for a short wordmark."""
    pairs = {}
    if "GPOS" not in font: return pairs
    gpos = font["GPOS"].table
    for lookup in gpos.LookupList.Lookup:
        subs = lookup.SubTable
        for st in subs:
            if lookup.LookupType == 9: st = st.ExtSubTable
            if getattr(st, "LookupType", lookup.LookupType) != 2 and lookup.LookupType != 2 and lookup.LookupType != 9: continue
            if not hasattr(st, "Format"): continue
            if st.Format == 1:
                for g1, ps in zip(st.Coverage.glyphs, st.PairSet):
                    for pv in ps.PairValueRecord:
                        v = getattr(pv.Value1, "XAdvance", 0) if pv.Value1 else 0
                        if v: pairs.setdefault((g1, pv.SecondGlyph), v)
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs; c2 = st.ClassDef2.classDefs
                for g1 in st.Coverage.glyphs:
                    k1 = c1.get(g1, 0)
                    for g2, k2 in c2.items():
                        rec = st.Class1Record[k1].Class2Record[k2]
                        v = getattr(rec.Value1, "XAdvance", 0) if rec.Value1 else 0
                        if v: pairs.setdefault((g1, g2), v)
    return pairs

KERN = {id(serif): kern_table(serif), id(serif_i): kern_table(serif_i), id(sans): {}}

def text_path(font, text, size, x, y, tracking=0.0):
    """Returns (svg path d, advance width in px)."""
    cmap = font.getBestCmap(); gs = font.getGlyphSet(); upm = font["head"].unitsPerEm
    hmtx = font["hmtx"]; s = size / upm; d = []; pen_x = x; prev = None
    kern = KERN[id(font)]
    for ch in text:
        g = cmap.get(ord(ch))
        if g is None: continue
        if prev and (prev, g) in kern: pen_x += kern[(prev, g)] * s
        sp = SVGPathPen(gs)
        gs[g].draw(TransformPen(sp, (s, 0, 0, -s, pen_x, y)))
        if sp.getCommands(): d.append(sp.getCommands())
        pen_x += hmtx[g][0] * s + tracking * size
        prev = g
    return " ".join(d), pen_x - x - (tracking * size if text else 0)

def emblem_group(color, star, sw):
    svg = (BRAND / "emblem-forest.svg").read_text()
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    inner = inner.replace('#203F35', color).replace('#A98B52', star)
    inner = re.sub(r'stroke-width="2.4"', f'stroke-width="{sw}"', inner)
    inner = re.sub(r'stroke-width="1.2"', f'stroke-width="{sw/2}"', inner)
    return inner.replace('id="in"', 'id="in-{c}"'.format(c=color[1:])).replace('url(#in)', 'url(#in-{c})'.format(c=color[1:])) \
                .replace('id="behind"', 'id="behind-{c}"'.format(c=color[1:])).replace('url(#behind)', 'url(#behind-{c})'.format(c=color[1:]))

def wordmark(color, x, y, size):
    d1, w1 = text_path(serif, "So", size, x, y)
    d2, w2 = text_path(serif_i, "Dream", size, x + w1 + size * 0.24, y)
    return f'<path fill="{color}" d="{d1} {d2}"/>', w1 + size * 0.24 + w2

def tagline(color, cx, y, size, width):
    txt = "GÎTES · CHOOZ · ARDENNES"
    _, w = text_path(sans, txt, size, 0, 0, tracking=0.34)
    x = cx - w / 2
    d, _ = text_path(sans, txt, size, x, y, tracking=0.34)
    line_y = y - size * 0.34
    gap = size * 1.1
    rules = ""
    if width:
        rules = (f'<path stroke="{color}" stroke-opacity=".55" stroke-width="{size*0.08:.2f}" d="M {cx - width/2:.1f} {line_y:.1f} H {x - gap:.1f} '
                 f'M {x + w + gap:.1f} {line_y:.1f} H {cx + width/2:.1f}"/>')
    return f'<path fill="{color}" d="{d}"/>' + rules, w

def stacked(color, star, name):
    W, H = 600, 640
    em = f'<g transform="translate(150 20) scale(1.5)">{emblem_group(color, star, 2.4)}</g>'
    wm_size = 104
    # measure wordmark then centre it
    _, wm_w = wordmark(color, 0, 0, wm_size)
    wm, _ = wordmark(color, (W - wm_w) / 2, 448, wm_size)
    tg, _ = tagline(color, W / 2, 520, 19, 520)
    (OUT / f"so-dream-stacked-{name}.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{em}{wm}{tg}</svg>')

def horizontal(color, star, name):
    H = 200
    em = f'<g transform="translate(0 0)">{emblem_group(color, star, 2.6)}</g>'
    wm, wm_w = wordmark(color, 228, 108, 92)
    tg_w = wm_w
    tg, _ = tagline(color, 228 + wm_w / 2, 156, 15.5, wm_w)
    W = int(228 + wm_w + 8)
    (OUT / f"so-dream-horizontal-{name}.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{em}{wm}{tg}</svg>')

for name, color, star in (("forest", "#203F35", "#A98B52"), ("linen", "#F4F0E5", "#D1B884"), ("white", "#FFFFFF", "#FFFFFF"), ("black", "#111111", "#111111")):
    stacked(color, star, name)
    horizontal(color, star, name)
for f in ("emblem-forest.svg", "emblem-linen.svg", "emblem-forest-bold.svg", "emblem-linen-bold.svg", "emblem-mono-forest.svg", "emblem-mono-white.svg"):
    (OUT / f"so-dream-{f}").write_text((BRAND / f).read_text())
print("\n".join(sorted(p.name for p in OUT.glob("*.svg"))))
