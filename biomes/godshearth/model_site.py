#!/usr/bin/env python3
"""Godshearth's view of the scale model (5.1) round a station's site, for build.py (the generated fragment 44r-host-model.js).

    python3 model_site.py 842 1394          # prints the JSON the page reads as GH_MODEL

  vents   the model's vent records in Godshearth's polygon (tools/scale-model/model/data/vents.json, 5.1 edit 2: edit_512.py) within
          `reach` km of the site, in the page's metres (x east, z south, from the site; 5.1 px = 2 km) with their T, reach_m, kind and
          name; a vent line's points as `pts`
  h       the model's heights over a square of 2 * R + 1 cells (2 km each) centred on the site, in metres over `datum` (the hot lake's
          level, 3,642 m), rounded to the metre, row by row (z), and `wet` the model's water cells (1) in the same order
The far field (85: past the square) and the caldera's walls (89y: the ring past the far field) read them, so the country past the
page is the model's, not a guess. Nothing here writes: it reads the model's data folder.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SM = os.path.normpath(os.path.join(HERE, '..', '..', 'tools', 'scale-model'))
sys.path.insert(0, SM)
import numpy as np   # noqa: E402
import smodel.page as P   # noqa: E402

GH_ID = 'rmw4wou2y1hhc'
DATUM = 3642.0
KM_PX = 2000.0


def site(px, py, R=56, reach=12.0):
    D = P.load()
    E, wet = P.heights(D)
    su, sv = P.grid(D)
    out = {'site': [px, py], 'datum': DATUM, 'cell': KM_PX, 'R': R, 'vents': []}
    for v in D['vents']:
        if v.get('region') != GH_ID:
            continue
        x, z = (v['px'][0] - px) * KM_PX, (v['px'][1] - py) * KM_PX
        if np.hypot(x, z) > reach * 1000:
            continue
        r = {'name': v['name'], 'kind': v['kind'], 'x': round(x, 1), 'z': round(z, 1), 'floor': v['floor'], 'T': v['T'], 'reach': v['reach_m']}
        if v.get('line'):
            r['pts'] = [[round((p[0] - px) * KM_PX, 1), round((p[1] - py) * KM_PX, 1)] for p in v['line']]
        out['vents'].append(r)
    hs, ws = [], []
    for j in range(-R, R + 1):
        for i in range(-R, R + 1):
            x, y = (px + i) * su, (py + j) * sv
            ii, jj = int(np.floor(x)), int(np.floor(y))
            fx, fy = x - ii, y - jj
            e = E[jj, ii] * (1 - fx) * (1 - fy) + E[jj, ii + 1] * fx * (1 - fy) + E[jj + 1, ii] * (1 - fx) * fy + E[jj + 1, ii + 1] * fx * fy
            hs.append(int(round(float(e) - DATUM)))
            ws.append(1 if wet[int(round(y)), int(round(x))] else 0)
    out['h'], out['wet'] = hs, ws
    return out


if __name__ == '__main__':
    print(json.dumps(site(float(sys.argv[1]), float(sys.argv[2])), separators=(',', ':')))
