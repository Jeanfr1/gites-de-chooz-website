#!/usr/bin/env python3
"""So Dream emblem — a crescent moon cradling the two houses, trees, the Meuse and stars.
Monoline SVG (stroke only) so it scales from favicon to print and can be drawn on scroll."""
import math, sys
from pathlib import Path
OUT = Path(__file__).resolve().parent.parent / "assets-src" / "brand"
OUT.mkdir(parents=True, exist_ok=True)

C1, R1 = (100.0, 100.0), 84.0     # moon outer circle
C2, R2 = (128.0, 80.0), 70.0      # cut-out circle (opening top-right)

def inter(c1, r1, c2, r2):
    (x1, y1), (x2, y2) = c1, c2
    d = math.hypot(x2 - x1, y2 - y1)
    a = (r1**2 - r2**2 + d**2) / (2 * d)
    h = math.sqrt(r1**2 - a**2)
    xm, ym = x1 + a * (x2 - x1) / d, y1 + a * (y2 - y1) / d
    return (xm + h * (y2 - y1) / d, ym - h * (x2 - x1) / d), (xm - h * (y2 - y1) / d, ym + h * (x2 - x1) / d)

p, q = inter(C1, R1, C2, R2)
# tips: the upper one (smaller y) and the right one
tipA, tipB = sorted([p, q], key=lambda t: t[1])
f = lambda t: f"{t[0]:.2f} {t[1]:.2f}"
moon_outer = f"M {f(tipA)} A {R1} {R1} 0 1 0 {f(tipB)}"
moon_inner = f"M {f(tipB)} A {R2} {R2} 0 0 1 {f(tipA)}"
moon = moon_outer + " " + moon_inner

# landscape, all inside the lower bowl of the crescent
hill = "M 30 132 C 58 118, 92 114, 120 117 S 160 124, 174 122"
big = ("M 66 118 L 66 98 L 80 86 L 94 98 L 94 117 "           # left gable wing
       "M 80 86 L 104 86 L 116 98 L 116 116 "                   # long roof + right wall
       "M 94 98 L 116 98 "                                      # eave line
       "M 99 86 L 99 80 L 103 80 L 103 86 "                     # chimney
       "M 73 117 L 73 108 L 79 108 L 79 117 "                   # door
       "M 100 104 L 108 104 L 108 109 L 100 109 Z "             # window
       "M 116 104 L 132 104 M 120 104 L 120 117 M 128 104 L 128 117 M 116 100 L 132 100")  # terrace + railing
small = ("M 138 119 L 138 106 L 147 98 L 156 106 L 156 120 "    # cottage gable
         "M 141 110 L 153 110 M 141 114 L 153 114")             # wood cladding
trees = ("M 52 121 C 44 121, 41 112, 47 108 C 45 101, 54 97, 58 102 C 64 99, 70 106, 66 112 C 70 118, 63 122, 58 121 Z "
         "M 57 121 L 57 128 "
         "M 165 122 C 160 114, 161 100, 166 92 C 171 100, 172 114, 167 122 Z M 166 122 L 166 127")
river = ("M 22 150 C 52 140, 70 156, 100 148 S 150 136, 182 146 "
         "M 34 162 C 62 153, 82 167, 110 160 S 156 150, 176 158")
def star(cx, cy, r):
    k = r * 0.28
    return (f"M {cx} {cy - r} C {cx + k*0.4} {cy - k}, {cx + k} {cy - k*0.4}, {cx + r} {cy} "
            f"C {cx + k} {cy + k*0.4}, {cx + k*0.4} {cy + k}, {cx} {cy + r} "
            f"C {cx - k*0.4} {cy + k}, {cx - k} {cy + k*0.4}, {cx - r} {cy} "
            f"C {cx - k} {cy - k*0.4}, {cx - k*0.4} {cy - k}, {cx} {cy - r} Z")
stars = " ".join([star(150, 44, 7), star(172, 70, 4.2), star(128, 30, 3.4)])

scene_fill = ("M 30 132 C 58 118, 92 114, 120 117 S 160 124, 174 122 L 200 122 L 200 200 L 0 200 L 0 132 Z "
              "M 66 118 L 66 98 L 80 86 L 99 86 L 99 80 L 103 80 L 103 86 L 104 86 L 116 98 L 116 100 L 132 100 L 132 118 Z "
              "M 138 120 L 138 106 L 147 98 L 156 106 L 156 120 Z "
              "M 52 121 C 44 121, 41 112, 47 108 C 45 101, 54 97, 58 102 C 64 99, 70 106, 66 112 C 70 118, 63 122, 58 121 Z "
              "M 165 122 C 160 114, 161 100, 166 92 C 171 100, 172 114, 167 122 Z")
paths = {"moon": moon, "hill": hill, "big": big, "small": small, "trees": trees, "river": river, "stars": stars}
Path(OUT / "emblem-paths.json").write_text(__import__("json").dumps(paths, indent=1))

def svg(color="#203F35", sw=2.4, bg=None, size=200, star=None, inner=False):
    """inner=True returns only the <g> content (for lockups)."""
    star = star or color
    body = "".join(f'<path data-part="{k}" d="{v}"/>' for k, v in paths.items())
    bgr = f'<rect width="200" height="200" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="{size}" height="{size}">{bgr}'
            f'<defs><clipPath id="in"><circle cx="{C1[0]}" cy="{C1[1]}" r="{R1 - 0.5}"/></clipPath>'
            f'<mask id="behind" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff"/>'
            f'<path d="{scene_fill}" fill="#000" stroke="#000" stroke-width="{sw*2.6}" stroke-linejoin="round"/></mask></defs>'
            f'<g fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="{moon_outer}"/><path d="{moon_inner}" mask="url(#behind)"/><g clip-path="url(#in)">'
            + "".join(f'<path d="{paths[k]}"/>' for k in ("hill", "big", "small", "trees", "river")) +
            f'</g><path d="{stars}" fill="{star}" stroke="{star}" stroke-width="{sw*0.5}"/></g></svg>')

FOREST, LINEN, BRASS, BRASS_LIGHT = "#203F35", "#F4F0E5", "#A98B52", "#D1B884"
(OUT / "emblem-forest.svg").write_text(svg(FOREST, star=BRASS))
(OUT / "emblem-linen.svg").write_text(svg(LINEN, star=BRASS_LIGHT))
(OUT / "emblem-forest-bold.svg").write_text(svg(FOREST, sw=3.6, star=BRASS))
(OUT / "emblem-linen-bold.svg").write_text(svg(LINEN, sw=3.6, star=BRASS_LIGHT))
(OUT / "emblem-mono-forest.svg").write_text(svg(FOREST))
(OUT / "emblem-mono-white.svg").write_text(svg("#FFFFFF"))
print("tips", tipA, tipB)
