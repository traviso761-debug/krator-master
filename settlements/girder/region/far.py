#!/usr/bin/env python3
"""Girder's horizon, read from the scale model (tools/scale-model/model/data, 5.1) at Girder's pixel (W7, 2026-11-24).

    python3 settlements/girder/region/far.py        # writes settlements/girder/region/far.json

Not run by build.py (it needs numpy and the model's page module); its output is committed and build.py embeds it as the
virtual fragment 89r-host-far.js (const GIRDER_FAR=...), which 90s-host-sky.js hands the shared sky. Rerun it after the model
moves. The owner (2026-11-24): "no painted volcano, real terrain only": the far land is the model's ground and nothing else.
The shape is Ancient's Valley's (biomes/ancientsvalley/region/site.py, ridges_of), with two differences: over water the
surface counts, not the bed (the Ring Sea's edge is a horizon), and the bands start at Girder's own ground's edge (the page
draws 3.6 km each way, 10-core.js HW) and run to 450 km, past the Throne.

  site     the pixel, the model's height there (the eye stands EYE over it), the air (1.6 atm x e^(-h/8 km), the model's rule)
  ridges   three bands of distance, each the highest elevation angle of the model's ground (or water surface) at 1024 azimuths
           (0 north, 90 east) from the eye, with the planet's curvature (the sky model's frame: 84 km a degree) and the thick
           air's refraction (k 0.13: the curve as from a planet 1/(1-k) times as large)

Deterministic: no randomness.
"""
import json, math, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import smodel.page as page   # noqa: E402

PX, PY = 1039, 869                                   # Girder (openworld/iziz-cluster/data/region.json, 5.1 px)
EYE = 30.0
R_PLANET = 84.0 * 360 / (2 * math.pi) * 1000         # m: the sky model's frame (kmPerDeg 84)
R_SEEN = R_PLANET / (1 - 0.13)                       # with refraction
BANDS = [(4000, 20000), (20000, 80000), (80000, 450000)]

D = page.load(page.DATA_DIR)
LO, HI = D['lo'], D['hi']
_h = page.raster(D, 'h')
E = LO + ((_h[..., 0].astype(np.int32) << 8) | _h[..., 1]) / 65535.0 * (HI - LO)
_w = page.raster(D, 'wl')
WAT = _w[..., 2] > 127
WL = LO + ((_w[..., 0].astype(np.int32) << 8) | _w[..., 1]) / 65535.0 * (HI - LO)
TOP = np.where(WAT, np.maximum(E, WL), E)            # the surface: water's where there is water
NJ, NI = E.shape
assert (NI, NJ) == (D['fullW'], D['fullH']) == (1821, 1723), 'the model is not the 5.1 canvas at 2 km a px'


def height(px, py, grid):
    """bilinear on the model's grid, as its page samples it"""
    i, j = int(math.floor(px)), int(math.floor(py))
    if i < 0 or j < 0 or i + 1 >= NI or j + 1 >= NJ:
        return None
    fu, fv = px - i, py - j
    return float(grid[j, i] * (1 - fu) * (1 - fv) + grid[j, i + 1] * fu * (1 - fv) + grid[j + 1, i] * (1 - fu) * fv + grid[j + 1, i + 1] * fu * fv)


def ridges(eye):
    out = []
    for d0, d1 in BANDS:
        prof, dist = [], []
        for k in range(1024):
            az = 2 * math.pi * k / 1024
            sx, sz = math.sin(az), -math.cos(az)          # 0 north (-y on the map), 90 east (+x)
            best, bd = -90.0, None
            d = d0
            while d <= d1:
                h = height(PX + sx * d / 2000, PY + sz * d / 2000, TOP)
                if h is not None:
                    a = math.degrees(math.atan2(h - d * d / (2 * R_SEEN) - eye, d))
                    if a > best:
                        best, bd = a, d
                d += max(500.0, d * .01)
            prof.append(round(best, 3))
            dist.append(bd or d1)
        out.append({'band': [d0, d1], 'dist': round(float(np.mean(dist))), 'profile': prof})
    return out


def main():
    base = height(PX, PY, E)
    rec = {'site': {'px': PX, 'py': PY, 'base': round(base, 1), 'eye': EYE, 'atm': round(1.6 * math.exp(-base / 8000), 3)},
           'ridges': ridges(base + EYE)}
    out = os.path.join(HERE, 'far.json')
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rec, f, separators=(',', ':'))
    print('Girder px %d,%d  base %.0f m  %.2f atm  ridges %s  -> %s' % (PX, PY, base, rec['site']['atm'],
          ', '.join('%.2f..%.2f deg @%d km' % (min(b['profile']), max(b['profile']), b['dist'] / 1000) for b in rec['ridges']),
          os.path.relpath(out, ROOT).replace(os.sep, '/')))


if __name__ == '__main__':
    main()
