#!/usr/bin/env python3
"""Build the Girder material mockup: one HTML page, textures embedded, three.js inlined.

    python3 build.py --scratch DIR [--size 512] [--out dist/girder-mockup.html]

Textures come from the same places as the demo kit (core/materials/library + patterns, and the scratch
folder's ph/amb/sv/gpt sets). A mockup only: no Girder source is read or changed (see NOTES in the page).
"""
import argparse, base64, io, json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(HERE)))))
MAT = os.path.join(ROOT, 'core', 'materials')
# name -> source in the demo kit's notation
USE = {
 'soil': 'sv/Ground068', 'moss': 'amb/Moss002', 'moss2': 'sv/Moss001', 'litter': 'sv/Ground072', 'mud': 'ph/brown_mud_02',
 'concrete': 'ph/cracked_concrete_wall', 'concrete2': 'ph/concrete_wall_009', 'rust': 'ph/rusty_metal_04', 'rust2': 'amb/Metal053C',
 'tarred': 'library/wood.tarred', 'carved': 'library/wood.carved', 'plank': 'ph/weathered_brown_planks', 'thatch': 'library/roof.thatch',
 'cane': 'library/fibre.cane', 'rope': 'library/fibre.rope', 'shingle': 'library/roof.shingle',
 'cloth1': 'patterns/beast-riders/cloth-3', 'cloth2': 'patterns/beast-riders/cloth-4', 'cloth3': 'patterns/beast-riders/cloth-5',
 'awning': 'patterns/beast-riders/awning', 'trim': 'patterns/beast-riders/trim', 'sail': 'patterns/beast-riders/cloth-1',
 'ironbark': 'amb/Bark015', 'ghost': 'ph/bark_willow_02', 'prism': 'ph/bark_bluegum', 'baobab': 'ph/bark_brown_01',
}
def resolve(src, scratch):
    kind, _, rest = src.partition('/')
    if kind == 'library': return os.path.join(MAT, 'library', rest)
    if kind == 'patterns': return os.path.join(MAT, 'patterns', rest)
    sub = {'gpt': 'gpt', 'ph': 'ph/sets', 'amb': 'amb/sets', 'sv': 'sv/sets'}[kind]
    return os.path.join(scratch, 'demo', sub, rest.replace('/', '_'))
def enc(path, size, q):
    im = Image.open(path).convert('RGB')
    if im.size != (size, size): im = im.resize((size, size), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
LEAF = {'leafA': 'LeafSet019', 'leafB': 'LeafSet023', 'leafC': 'LeafSet024', 'leafD': 'LeafSet029', 'leafE': 'LeafSet013'}   # AmbientCG leaf sheets; colour + opacity
def leaf_card(name, size=512):
    import zipfile
    base = r'C:/Users/travi/OneDrive/Pictures/krator/texture/amb cg/' + name + '_1K-PNG'
    z = zipfile.ZipFile(base + '.zip')
    col = Image.open(io.BytesIO(z.read(name + '_1K-PNG_Color.png'))).convert('RGB')
    op = Image.open(io.BytesIO(z.read(name + '_1K-PNG_Opacity.png'))).convert('L')
    w = size; h = max(1, round(size * col.size[1] / col.size[0]))
    im = col.resize((w, h), Image.LANCZOS).convert('RGBA'); im.putalpha(op.resize((w, h), Image.LANCZOS))
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode(), name

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--scratch', required=True); ap.add_argument('--size', type=int, default=512)
    ap.add_argument('--out', default=os.path.join(HERE, 'dist', 'girder-mockup.html')); a = ap.parse_args()
    tex = {}
    for k, src in USE.items():
        d = resolve(src, a.scratch); meta = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8'))
        rec = meta.get('record', {})
        tex[k] = dict(a=enc(os.path.join(d, 'albedo.jpg'), a.size, 82), n=enc(os.path.join(d, 'normal.png'), a.size, 86),
                      s=(rec.get('scale') or [2, 2])[0], src=src)
    leaf = {k: dict(a=leaf_card(v)[0], src='ambientCG/' + v) for k, v in LEAF.items()}
    three = open(os.path.join(ROOT, 'kits', 'ringsea', 'three.min.js'), encoding='utf-8').read()
    js = open(os.path.join(HERE, 'girder.js'), encoding='utf-8').read()
    html = open(os.path.join(HERE, 'head.html'), encoding='utf-8').read()
    html = html.replace('/*THREE*/', three).replace('/*TEX*/', 'const TEX=' + json.dumps(tex, separators=(',', ':')) + ';const LEAF=' + json.dumps(leaf, separators=(',', ':')) + ';') + '<script>\n' + js + '\n</script>\n'
    os.makedirs(os.path.dirname(a.out), exist_ok=True); open(a.out, 'w', encoding='utf-8').write(html)
    print('%d textures, %.1f MB -> %s' % (len(tex), len(html) / 1e6, a.out))
main()
