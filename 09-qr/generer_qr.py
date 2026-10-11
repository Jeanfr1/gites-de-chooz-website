"""Génère le QR du portail uniquement après définition de son URL publique."""
import argparse
from pathlib import Path
from urllib.parse import urlparse
import qrcode
import qrcode.image.svg

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',required=True,help='URL HTTPS définitive du portail')
parser.add_argument('--output',type=Path,default=Path(__file__).parent/'final')
args=parser.parse_args()
u=urlparse(args.url)
if u.scheme!='https' or not u.hostname or '.' not in u.hostname or u.hostname in ('localhost','example.com','example.org','example.net') or u.username or u.password:
    parser.error('Utilisez la véritable URL HTTPS publique, sans identifiants.')
args.output.mkdir(parents=True,exist_ok=True)
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=18,border=4)
qr.add_data(args.url);qr.make(fit=True)
qr.make_image(fill_color='#203F35',back_color='white').save(args.output/'qr-portail.png')
qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage,fill_color='#203F35',back_color='white').save(args.output/'qr-portail.svg')
(args.output/'destination.txt').write_text(args.url+'\n',encoding='utf-8')
print('QR PNG + SVG créés. Vérifiez le scan sur deux téléphones avant impression.')
