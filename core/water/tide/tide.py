#!/usr/bin/env python3
"""core/water/tide/tide.py: cut a region out of the scale model's tides record for a page.

tides.json (tools/scale-model/model/data, made by tools/scale-model/tides/bake_tides.py) covers whole sea basins and
weighs about 0.8 MB. A build that places one settlement or one open-world region inlines only the cells round it:

    python3 core/water/tide/tide.py --box 300 280 360 340 --out dist/tides-slice.json   # scale-model pixels x0 y0 x1 y1
    python3 core/water/tide/tide.py --box 300 280 360 340 --js KTIDE_DATA > src/24-tides-data.js

or from a build.py:

    sys.path.insert(0, os.path.join(ROOT, 'core', 'water', 'tide')); import tide
    rec = tide.slice_box(tide.read(), 300, 280, 360, 340)            # a record KTIDE.load reads unchanged

A slice keeps the record's kind and version and every basin that meets the box (with KTIDE's reach of 3 cells round
it, so a coast point at the edge still finds its wet cell). Pure Python, no numpy.
"""
import argparse
import base64
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
DEFAULT = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data', 'tides.json')
GRIDS16 = ('amp1', 'amp2', 'depth')
GRIDS8 = ('ph1', 'ph2', 'vmax')


def read(path=None):
    with open(path or DEFAULT, encoding='utf-8') as f:
        rec = json.load(f)
    if rec.get('kind') != 'krator-tides' or rec.get('version') != 1:
        raise ValueError('not a krator-tides v1 record: %s' % (path or DEFAULT))
    return rec


def _cut(b64, nx, i0, j0, i1, j1, size):
    raw = base64.b64decode(b64)
    out = bytearray()
    for j in range(j0, j1):
        out += raw[(j * nx + i0) * size:(j * nx + i1) * size]
    return base64.b64encode(bytes(out)).decode('ascii')


def slice_box(rec, x0, y0, x1, y1, reach=3):
    """the record cut to the scale-model pixel box [x0,x1) x [y0,y1), plus reach cells round it"""
    out = {k: v for k, v in rec.items() if k != 'basins'}
    out['slice'] = [x0, y0, x1, y1]
    out['basins'] = []
    for b in rec['basins']:
        c, nx, ny = b['cell'], b['nx'], b['ny']
        i0 = max(0, int((x0 - b['x0']) // c) - reach - 1)
        j0 = max(0, int((y0 - b['y0']) // c) - reach - 1)
        i1 = min(nx, int(-(-(x1 - b['x0']) // c)) + reach + 1)
        j1 = min(ny, int(-(-(y1 - b['y0']) // c)) + reach + 1)
        if i1 <= i0 or j1 <= j0:
            continue
        nb = {k: v for k, v in b.items() if k not in GRIDS16 + GRIDS8}
        nb.update(x0=b['x0'] + i0 * c, y0=b['y0'] + j0 * c, nx=i1 - i0, ny=j1 - j0)
        for g in GRIDS16:
            nb[g] = _cut(b[g], nx, i0, j0, i1, j1, 2)
        for g in GRIDS8:
            nb[g] = _cut(b[g], nx, i0, j0, i1, j1, 1)
        out['basins'].append(nb)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--box', nargs=4, type=float, required=True, metavar=('X0', 'Y0', 'X1', 'Y1'),
                    help='scale-model pixels (2 km each)')
    ap.add_argument('--src', default=None, help='the tides record (default tools/scale-model/model/data/tides.json)')
    ap.add_argument('--out', default=None, help='write JSON here (default stdout)')
    ap.add_argument('--js', default=None, metavar='NAME', help='write a JS fragment: var NAME = {...};')
    a = ap.parse_args()
    rec = slice_box(read(a.src), *a.box)
    text = json.dumps(rec, separators=(',', ':'))
    if a.js:
        text = '/* the scale model\'s tides, sliced by core/water/tide/tide.py --box %s */\nvar %s=%s;\n' % (
            ' '.join('%g' % v for v in a.box), a.js, text)
    if a.out:
        with open(a.out, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        print('%s: %d basin(s), %d KB' % (a.out.replace(os.sep, '/'), len(rec['basins']), len(text) // 1024),
              file=sys.stderr)
    else:
        sys.stdout.write(text)


if __name__ == '__main__':
    main()
