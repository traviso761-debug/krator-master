#!/usr/bin/env python3
"""A region's height grid as a hillshade, at the grid's own resolution: what shows the land's linear artifacts
(staircases on scarps, streaks along the rows and columns, ruler-straight river cuts; core/world/README.md, "Smoothing").

    python3 core/world/hillshade.py <region dir or elev.png> <out.png> [--crop px0 px1 py0 py1] [--zoom N] [--az deg] [--exag 4]
    python3 core/world/hillshade.py <a> <b> <out.png> --diff [--crop ...]   # two grids side by side (before, after)

--crop takes scale-model pixels (the 5.1 canvas, 2 km a pixel), as region.json's heights note says: cell (i, j) sits at
full px ((i + i0) / su, (j + j0) / sv). --zoom repeats each cell N times (nearest), so a 500 m cell stays a square.
The light is from --az (315: the north-west) at 40 degrees, plus a little slope shade, so an edge in any direction shows; heights are
exaggerated --exag times (4), so a 20 m step on a 500 m cell reads.
"""
import json, os, sys

import numpy as np
from PIL import Image


def load(path):
    """(elev metres as float64 [ny, nx], the heights record) from a region dir, its data dir or its elev.png"""
    if os.path.isdir(path):
        path = os.path.join(path, 'data', 'elev.png') if os.path.isdir(os.path.join(path, 'data')) else os.path.join(path, 'elev.png')
    rj = json.load(open(os.path.join(os.path.dirname(path), 'region.json'), encoding='utf-8'))
    Hd = rj['heights']
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.int64)
    q = (a[..., 0] << 8) | a[..., 1]
    return Hd['lo'] + q / 65535.0 * (Hd['hi'] - Hd['lo']), Hd


def crop(E, Hd, box):
    if not box:
        return E
    i0, j0 = Hd['origin_cell']
    su, sv = Hd['su'], Hd['sv']
    px0, px1, py0, py1 = box
    a, b = max(0, int(px0 * su - i0)), min(E.shape[1], int(px1 * su - i0) + 1)
    c, d = max(0, int(py0 * sv - j0)), min(E.shape[0], int(py1 * sv - j0) + 1)
    return E[c:d, a:b]


def shade(E, cell_m, az=315.0, alt=40.0, exag=4.0):
    gz, gx = np.gradient(E * exag, cell_m, cell_m)          # rows run south (z), columns east (x)
    slope = np.arctan(np.hypot(gx, gz))
    aspect = np.arctan2(-gx, gz)                      # downhill direction, from +z (south)
    azr, altr = np.radians(az), np.radians(alt)
    # light direction (from the light toward the ground): az measured clockwise from north (-z)
    lx, lz = np.sin(azr), -np.cos(azr)
    nxv, nzv, nyv = -gx, -gz, np.ones_like(E)
    n = np.sqrt(nxv * nxv + nzv * nzv + 1.0)
    L = (nxv * lx * np.cos(altr) + nzv * lz * np.cos(altr) + nyv * np.sin(altr)) / n
    s = np.clip(L, 0, 1) * 0.85 + 0.15 * np.cos(slope)
    return np.clip(s * 255, 0, 255).astype(np.uint8)


def main():
    a = sys.argv[1:]
    if not a or a[0] in ('-h', '--help'):
        sys.exit(__doc__)
    opt = lambda k, n, d: [float(x) for x in a[a.index(k) + 1:a.index(k) + 1 + n]] if k in a else d
    box = opt('--crop', 4, None)
    zoom = int(opt('--zoom', 1, [2])[0])
    az = opt('--az', 1, [315.0])[0]
    exag = opt('--exag', 1, [4.0])[0]
    pos = []
    k = 0
    while k < len(a):
        if a[k] in ('--crop',):
            k += 5; continue
        if a[k] in ('--zoom', '--az', '--exag'):
            k += 2; continue
        if a[k] == '--diff':
            k += 1; continue
        pos.append(a[k]); k += 1
    imgs = []
    for p in pos[:-1]:
        E, Hd = load(p)
        imgs.append(shade(crop(E, Hd, box), Hd['cell_m'], az, exag))
    out = np.concatenate([np.pad(m, ((0, 0), (0, 6)), constant_values=255) for m in imgs[:-1]] + [imgs[-1]], 1) if len(imgs) > 1 else imgs[0]
    out = np.repeat(np.repeat(out, zoom, 0), zoom, 1)
    Image.fromarray(out, 'L').save(pos[-1], optimize=True)
    print('hillshade %s: %d x %d' % (pos[-1], out.shape[1], out.shape[0]))


if __name__ == '__main__':
    main()
