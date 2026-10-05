#!/usr/bin/env python3
"""Build the material demo kit: one self-contained HTML that lays every candidate set on a wall.

    python3 build.py [--scratch DIR] [--size 512] [--out dist/materials-demo.html]

Rows are the type of surface, columns the culture. Each panel is a 2 m square showing the set at its
`scale` (world metres per tile), so a per-metre guess can be judged by eye; sets whose scale is only an
estimate carry a "scale?" mark. Every panel has a status:

  committed  already in core/materials/library or patterns, in git
  new        processed (tools/textures/process.py) but not committed
  scan       a scan-library candidate (Poly Haven, AmbientCG) reduced by tools/textures/ingest_polyhaven.py

manifest.json lists the entries. `src` is one of
  library/<id>     core/materials/library/<id>          (committed or new)
  patterns/<path>  core/materials/patterns/<path>
  gpt/<dir>        <scratch>/demo/gpt/<dir>             (processed ChatGPT images, not committed)
  ph/<slug>        <scratch>/demo/ph/sets/<slug>        (Poly Haven picks, reduced)
  amb/<slug>       <scratch>/demo/amb/sets/<slug>       (AmbientCG picks, reduced)
  sv/<slug>        <scratch>/demo/sv/sets/<slug>        (the second survey: either library, reduced)
An entry whose source folder is missing is skipped with a note. The maps are reduced to --size px
(JPEG) and embedded, so the page works offline and its size is about 200 KB per set.
Needs numpy-free Pillow only. Deterministic. three.js r128 is inlined from a local copy.
"""
import argparse, base64, io, json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
MAT = os.path.join(ROOT, 'core', 'materials')


def find_three():
    for c in (os.path.join(HERE, 'three.min.js'), os.path.join(ROOT, 'kits', 'ringsea', 'three.min.js'),
              os.path.join(ROOT, 'kits', 'ancients', 'three.min.js'), os.path.join(ROOT, 'biomes', 'sedesert', 'three.min.js')):
        if os.path.isfile(c):
            return c
    sys.exit('build.py: no local three.min.js (r128) found')


def enc(path, size, kind):
    im = Image.open(path)
    im = im.convert('L' if kind == 'r' else 'RGB')
    if max(im.size) != size:      # keep the shape: a tall or wide sheet is not squeezed square
        k = size / max(im.size); im = im.resize((max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))), Image.LANCZOS)
    b = io.BytesIO()
    q = {'a': 80, 'n': 88, 'r': 78}[kind]
    im.save(b, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def enc_card(path, size, kind):
    """A cut-out card for the wall: its colour over a mid grey where it is transparent, a flat normal, a constant roughness."""
    im = Image.open(path).convert('RGBA')
    k = size / max(im.size); im = im.resize((max(1, round(im.size[0] * k)), max(1, round(im.size[1] * k))), Image.LANCZOS)
    if kind == 'a':
        bg = Image.new('RGBA', im.size, (122, 122, 122, 255)); bg.alpha_composite(im); out = bg.convert('RGB')
    elif kind == 'n':
        out = Image.new('RGB', im.size, (128, 128, 255))
    else:
        out = Image.new('L', im.size, 200)
    b = io.BytesIO(); out.save(b, 'JPEG', quality=85, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def resolve(src, scratch):
    kind, _, rest = src.partition('/')
    if kind == 'library':
        return os.path.join(MAT, 'library', rest)
    if kind == 'patterns':
        return os.path.join(MAT, 'patterns', rest)
    sub = {'gpt': 'gpt', 'ph': 'ph/sets', 'amb': 'amb/sets', 'sv': 'sv/sets'}.get(kind)
    return os.path.join(scratch, 'demo', sub, rest.replace('/', '_')) if sub else None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--scratch', default=os.environ.get('KRATOR_DEMO_SCRATCH', ''))
    ap.add_argument('--size', type=int, default=512)
    ap.add_argument('--artifact', action='store_true', help='drop the document wrapper (the Artifact host adds its own)')
    ap.add_argument('--out', default=os.path.join(HERE, 'dist', 'materials-demo.html'))
    a = ap.parse_args()
    man = json.load(open(os.path.join(HERE, 'manifest.json'), encoding='utf-8'))
    sets, skipped = [], []
    for e in man['entries']:
        d = resolve(e['src'], a.scratch)
        meta_p = os.path.join(d, 'meta.json') if d else None
        if not d or not os.path.isfile(meta_p):
            skipped.append(e['src']); continue
        meta = json.load(open(meta_p, encoding='utf-8'))
        mp = meta.get('maps', {})
        files = {k: os.path.normpath(os.path.join(d, mp.get(m, f))) for k, m, f in
                 (('a', 'map', 'albedo.jpg'), ('n', 'normalMap', 'normal.png'), ('r', 'roughnessMap', 'roughness.png'))}
        rec = meta.get('record', {})
        card = rec.get('kind') == 'card'
        if card and os.path.isfile(files['a']):      # a cut-out: no normal or roughness map; shown on a grey card
            files['n'] = files['r'] = None
        elif not all(os.path.isfile(v) for v in files.values()):
            skipped.append(e['src'] + ' (maps)'); continue
        src = meta.get('source', {})
        s = dict(e)
        s['id'] = e.get('id') or rec.get('id') or os.path.basename(d)
        s.setdefault('scale', rec.get('scale', [2, 2]))
        s.setdefault('metal', rec.get('metal', 0))
        s.setdefault('rough', rec.get('roughness', 0.8))
        s.setdefault('tint', bool(rec.get('tint', False)))
        s['family'] = rec.get('family', '')
        s['pattern'] = bool(rec.get('pattern', False))
        s['source'] = {k: src.get(k, '') for k in ('generator', 'file', 'url', 'licence', 'prompt', 'asset') if src.get(k)}
        if s['pattern']:       # a sheet that kept its shape: its tile is as tall as its width says
            w0, h0 = Image.open(files['a']).size
            if w0 != h0: s['scale'] = [s['scale'][0], round(s['scale'][0] * h0 / w0, 3)]
        s['card'] = card
        for k in 'anr':
            s[k] = enc_card(files['a'], a.size, k) if card else enc(files[k], a.size, k)
        sets.append(s)
    if skipped:
        print('skipped (source missing):', ', '.join(skipped))
    if a.artifact:      # the host's page validator objects to some of the provenance prose; ship it encoded
        for x in sets:
            x['srcb64'] = base64.b64encode(json.dumps(x.pop('source', {})).encode('utf-8')).decode()
    layout = {k: man[k] for k in ('rows', 'cols', 'statuses')}
    data = 'const DEMO=' + json.dumps({'layout': layout, 'sets': sets}, separators=(',', ':')) + ';\n'
    parts = []
    src_dir = os.path.join(HERE, 'src')
    for f in sorted(os.listdir(src_dir)):
        t = open(os.path.join(src_dir, f), encoding='utf-8').read()
        parts.append((f, t))
    three = open(find_three(), encoding='utf-8').read()
    head = [t for f, t in parts if f.endswith('.html')][0]
    js = ''.join(t for f, t in parts if f.endswith('.js'))
    html = head.replace('/*THREE*/', three).replace('/*DATA*/', data) + '<script>\n' + js + '\n</script></body></html>\n'
    if a.artifact:
        import re
        html = re.sub(r'<!doctype html>|<html>|<head>|<meta [^>]*>|</head>|<body>|</body>|</html>', '', html, flags=re.I)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, 'w', encoding='utf-8').write(html)
    print('%d sets, %.1f MB -> %s' % (len(sets), len(html) / 1e6, a.out))


if __name__ == '__main__':
    main()
