"""QR codes of the So Dream print pieces (same settings as 09-qr/generer_qr.py).

  carte de visite  -> https://gites-de-chooz.vercel.app/
  carnet par gîte  -> https://gites-de-chooz.vercel.app/sejour/<slug>/

The printed codes depend on the vercel.app address: keep it alive (redirect) after any domain change.
Requires: pip install "qrcode[pil]==8.2"
"""
from pathlib import Path
import qrcode
import qrcode.image.svg

BASE = 'https://gites-de-chooz.vercel.app'
TARGETS = {
    'qr-so-dream': f'{BASE}/',
    'qr-carnet-le-grain-damour': f'{BASE}/sejour/le-grain-damour/',
    'qr-carnet-la-brasserie': f'{BASE}/sejour/la-brasserie/',
    'qr-carnet-chez-suzanne': f'{BASE}/sejour/chez-suzanne/',
    'qr-carnet-au-petit-bouchon': f'{BASE}/sejour/au-petit-bouchon/',
}
out = Path(__file__).parent / 'qr'
out.mkdir(exist_ok=True)
for name, url in TARGETS.items():
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=18, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(fill_color='#203F35', back_color='white').save(out / f'{name}.png')
    svg = out / f'{name}.svg'
    qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage).save(svg)
    # the SVG factory ignores fill_color: set the So Dream forest ink by hand
    svg.write_text(svg.read_text(encoding='utf-8').replace('fill="#000000"', 'fill="#203F35"'), encoding='utf-8')
    (out / f'{name}.txt').write_text(url + '\n', encoding='utf-8')
    print(name, url)
