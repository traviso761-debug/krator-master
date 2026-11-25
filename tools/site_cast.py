#!/usr/bin/env python3
"""A page's real site, read from the scale model (tools/scale-model/model/data, 5.1 at 2 km a pixel): shared by the pages that
move onto the shared sky on their map site (W7, STAGE-8/G-weather.md; the owner, 2026-11-24: "real terrain only").

    import site_cast as SC
    rec = SC.cast(px, py, eye=30, grid_km=60, bands=[(60e3, 160e3), (160e3, 450e3)], y0=None)

Not run by any build.py (it needs numpy and the model's page module): a page's region script calls it and commits its JSON,
which its build embeds. Rerun after the model moves. The method is Ancient's Valley's (biomes/ancientsvalley/region/site.py)
and the outer walls' (biomes/nwouterwall/region/far.py), with the water's surface counted where there is water and the thick
air's refraction (k 0.13) on the planet's curve.

  site    px, py, base (the model's height at the pixel, m), eye (m over it), atm (1.6 x e^(-h/8 km), the model's rule), cls,
          mean (C), rain (mm), lat (the sky model's frame), y0 (the absolute height of the page's y = 0: the caller's, or base)
  grid    the model's heights on its 2 km cells in a box of +-grid_km round the pixel, in page metres: x0, z0 (the first cell's
          offset from the pixel), dx, dz, nx, nz, h (rows of absolute heights, z outer), and water: [[i, j, level], ...]
  ridges  per band, at 1024 azimuths (0 north, 90 east), the highest elevation angle (deg) of the model's ground or water
          surface from base + eye, with the curve; dist: the mean distance of the highest points

Deterministic: no randomness.
"""
import math, os, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import smodel.page as page   # noqa: E402

R_PLANET = 84.0 * 360 / (2 * math.pi) * 1000      # m: the sky model's frame (kmPerDeg 84)
R_SEEN = R_PLANET / (1 - 0.13)                     # the curve as seen through the air's refraction

_D = None


def model():
    global _D
    if _D is None:
        D = page.load(page.DATA_DIR)
        lo, hi = D['lo'], D['hi']
        h = page.raster(D, 'h')
        E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535.0 * (hi - lo)
        w = page.raster(D, 'wl')
        wat = w[..., 2] > 127
        wl = lo + ((w[..., 0].astype(np.int32) << 8) | w[..., 1]) / 65535.0 * (hi - lo)
        top = np.where(wat, np.maximum(E, wl), E)
        cl = page.raster(D, 'c')[..., 0]
        ra = page.raster(D, 'p')[..., 0].astype(np.float64) / 255.0 * 4000.0
        tm = page.raster(D, 'tm')[..., 0].astype(np.float64) - 90.0
        assert (E.shape[1], E.shape[0]) == (D['fullW'], D['fullH']) == (1821, 1723), 'the model is not the 5.1 canvas'
        _D = {'D': D, 'E': E, 'WAT': wat, 'WL': wl, 'TOP': top, 'CL': cl, 'RA': ra, 'TM': tm}
    return _D


def height(px, py, grid):
    """bilinear on the model's grid, as its page samples it"""
    nj, ni = grid.shape
    i, j = int(math.floor(px)), int(math.floor(py))
    if i < 0 or j < 0 or i + 1 >= ni or j + 1 >= nj:
        return None
    fu, fv = px - i, py - j
    return float(grid[j, i] * (1 - fu) * (1 - fv) + grid[j, i + 1] * fu * (1 - fv) + grid[j + 1, i] * (1 - fu) * fv + grid[j + 1, i + 1] * fu * fv)


def ridges(px, py, eye, bands):
    M = model()
    out = []
    for d0, d1 in bands:
        prof, dist = [], []
        for k in range(1024):
            az = 2 * math.pi * k / 1024
            sx, sz = math.sin(az), -math.cos(az)          # 0 north (-y on the map), 90 east (+x)
            best, bd = -90.0, None
            d = d0
            while d <= d1:
                h = height(px + sx * d / 2000, py + sz * d / 2000, M['TOP'])
                if h is not None:
                    a = math.degrees(math.atan2(h - d * d / (2 * R_SEEN) - eye, d))
                    if a > best:
                        best, bd = a, d
                d += max(500.0, d * .01)
            prof.append(round(best, 3))
            dist.append(bd or d1)
        out.append({'band': [d0, d1], 'dist': round(float(np.mean(dist))), 'profile': prof})
    return out


def grid(px, py, km):
    M = model()
    E, WAT, WL = M['E'], M['WAT'], M['WL']
    nj, ni = E.shape
    n = int(math.ceil(km * 1000 / 2000))
    ia, ib, ja, jb = max(0, px - n), min(ni - 1, px + n), max(0, py - n), min(nj - 1, py + n)
    return {'x0': (ia - px) * 2000, 'z0': (ja - py) * 2000, 'dx': 2000, 'dz': 2000, 'nx': ib - ia + 1, 'nz': jb - ja + 1,
            'h': [[round(float(E[j, i]), 1) for i in range(ia, ib + 1)] for j in range(ja, jb + 1)],
            'water': [[i - ia, j - ja, round(float(WL[j, i]), 1)] for j in range(ja, jb + 1) for i in range(ia, ib + 1) if WAT[j, i]]}


def cast(px, py, eye=30.0, grid_km=60, bands=((60e3, 160e3), (160e3, 450e3)), y0=None):
    M = model()
    base = height(px, py, M['E'])
    lat = -40 - (py - 690) * 2000 / 1000 / 84          # the sky model's frame (refLat -40 at py 690)
    cls = M['D']['climate']['classes'][int(M['CL'][py, px])]['code']
    site = {'px': px, 'py': py, 'base': round(base, 1), 'eye': eye, 'atm': round(1.6 * math.exp(-base / 8000), 3), 'cls': cls,
            'mean': round(float(M['TM'][py, px]), 1), 'rain': round(float(M['RA'][py, px])), 'lat': round(lat, 3),
            'y0': round(base if y0 is None else y0, 1)}
    return {'site': site, 'grid': grid(px, py, grid_km) if grid_km else None, 'ridges': ridges(px, py, base + eye, bands)}


def summary(name, rec):
    s = rec['site']
    return '%s px %d,%d  base %.0f m  y0 %s  %.2f atm  %s %s C %s mm  ridges %s' % (
        name, s['px'], s['py'], s['base'], s.get('y0', '-'), s['atm'], s.get('cls', '-'), s.get('mean', '-'), s.get('rain', '-'),
        ', '.join('%.2f..%.2f deg @%d km' % (min(b['profile']), max(b['profile']), b['dist'] / 1000) for b in rec['ridges']))
