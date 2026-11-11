#!/usr/bin/env python3
"""Bake a station's far country from scale model 5.1 (tools/scale-model/model/data/h.png): the heights on a lattice round the
station's site, written to stations/<name>/region.json, which build.py inlines as REGION_DATA (station.json "region").

    python3 biomes/godthrone/tools/region.py <station> <px> <py> [--n 81] [--cell 2000] [--up 0]

px, py: the site on the 5.1 canvas (2 km a px). The lattice is n x n cells of `cell` metres centred on the site, x east, z south (the
pages' frame), each the raster's height there (bilinear), as metres relative to the site's own cell. Deterministic; re-run only when
the model changes. Every text write names utf-8 and '\\n'.
"""
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
a = sys.argv[1:]
name, px, py = a[0], float(a[1]), float(a[2])
opt = lambda k, d: float(a[a.index(k) + 1]) if k in a else d
n, cell = int(opt('--n', 81)), opt('--cell', 2000.0)
D = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
mj = {k['key']: k.get('value') for k in json.load(open(os.path.join(D, 'model.json'), encoding='utf-8'))['keys']}
h = np.array(Image.open(os.path.join(D, 'h.png')))
E = mj['lo'] + ((h[..., 0].astype(np.int64) << 8) | h[..., 1]) / 65535 * (mj['hi'] - mj['lo'])
def bil(x, y):
    i, j = int(np.floor(x)), int(np.floor(y)); fx, fy = x - i, y - j
    return float(E[j, i] * (1 - fx) * (1 - fy) + E[j, i + 1] * fx * (1 - fy) + E[j + 1, i] * (1 - fx) * fy + E[j + 1, i + 1] * fx * fy)
y0 = bil(px, py)
half = (n - 1) / 2
H = []
for j in range(n):
    for i in range(n):
        H.append(round(bil(px + (i - half) * cell / 2000.0, py + (j - half) * cell / 2000.0) - y0, 1))
out = {'px': px, 'py': py, 'n': n, 'cell': cell, 'y0': round(y0, 1), 'x0': -half * cell, 'z0': -half * cell, 'dh': H,
       'note': 'scale model 5.1 heights round the site, metres relative to its cell (biomes/godthrone/tools/region.py)'}
p = os.path.join(HERE, '..', 'stations', name, 'region.json')
with open(p, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(out, f, separators=(',', ':'))
print('wrote', os.path.relpath(p, ROOT).replace(os.sep, '/'), n, 'x', n, 'cells of', cell, 'm; site', round(y0), 'm')
