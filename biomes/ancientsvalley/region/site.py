#!/usr/bin/env python3
"""The stations' ground and horizon, read from the scale model (tools/scale-model/model/data, 5.1) at each station's pixel.

    python3 biomes/ancientsvalley/region/site.py            # writes region/station-<name>.json for every station in SITES

Not run by build.py (it needs numpy and the model's page module); its output is committed and build.py embeds it as the
virtual fragment 44n-host-region.js (const AV_REGION=...). Rerun it after the model moves. The shape is nwouterwall's
(biomes/nwouterwall/region/far.py), read straight off the model's full 2 km grid instead of an extract_region cut:

  site     the pixel, the model's height there (the page's y = 0 is BASE), the climate class, the annual mean, the rain,
           the air (1.6 atm x e^(-h/8 km), the model's rule), the latitude (the sky model's frame)
  lake     the valley lake's level (the model's body 242, 17.4 m; build_425_master.py STEP 5C), absolute and over BASE
  grid     the model's heights (m, absolute) on its 2 km cells in a box round the site, in page metres (x east, z south,
           origin at the pixel), with its water cells and their levels: the page's ground follows it (45-host-stage.js)
  ridges   the far land for the shared sky: three bands of distance, each the highest elevation angle of the model's ground
           at 1024 azimuths (0 north, 90 east) from BASE + EYE, with the planet's curvature
  cities   the valley's settlements by NUMBER (PLAN.md section 3: the code never says a name; this table is the one place the
           names live), in page metres, with the model's height and the hazard theme
  basins   the seven blast basins (PLAN-ANOMALIES.md section 3, the model's anc_blast_specs order), in page metres

Deterministic: no randomness.
"""
import json, math, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import smodel.page as page   # noqa: E402

# the stations (PLAN.md section 12): px, py, title. The Overlook stands on the ridge east of city1 over the drowned inlet
# (83-132 m on the model: the shelf's edge, residential under B), looking south-west over city1's floor to the lake.
SITES = {
    'overlook': {'px': 457, 'py': 907, 'title': 'The Overlook: the city on a normal day'},
}
EYE = 30.0
R_PLANET = 84.0 * 360 / (2 * math.pi) * 1000      # m: the sky model's frame (kmPerDeg 84)
BANDS = [(18000, 45000), (45000, 120000), (120000, 320000)]
GRID_KM = 24
LAKE_LEVEL = 17.4

# PLAN.md section 3: the settlements by number. A name lives here and nowhere else in the code.
CITIES = [
    {'n': 1, 'name': 'Babel', 'px': 456, 'py': 908, 'type': 'ruined arcology', 'theme': 'house'},
    {'n': 2, 'name': 'Necropolis', 'px': 406, 'py': 944, 'type': 'ruin', 'theme': 'rad'},
    {'n': 3, 'name': 'Dorado', 'px': 483, 'py': 964, 'type': 'ruin, drowned', 'theme': 'extraplanar'},
    {'n': 4, 'name': 'Blade', 'px': 451, 'py': 1022, 'type': 'ruined arcology', 'theme': 'mutagenic'},
    {'n': 5, 'name': 'Wheel', 'px': 406, 'py': 886, 'type': 'ruined arcology', 'theme': 'machines'},
    {'n': 6, 'name': 'Thera', 'px': 526, 'py': 955, 'type': 'ruin', 'theme': 'temporal'},
]
# PLAN-ANOMALIES.md section 3, in the model's anc_blast_specs order (build_425_master.py l.1125): px, r (km), anomaly kind
BASINS = [
    {'n': 1, 'px': 476, 'py': 915, 'r': 6.0, 'kind': 'gravity', 'name': 'the Press'},
    {'n': 2, 'px': 398, 'py': 966, 'r': 5.5, 'kind': 'time', 'name': 'the Stilled Ground'},
    {'n': 3, 'px': 450, 'py': 896, 'r': 5.0, 'kind': 'space', 'name': 'the House'},
    {'n': 4, 'px': 406, 'py': 908, 'r': 6.5, 'kind': 'bend', 'name': 'the Broken Country'},
    {'n': 5, 'px': 428, 'py': 948, 'r': 7.5, 'kind': 'gravity', 'name': 'the Lake That Falls'},
    {'n': 6, 'px': 460, 'py': 962, 'r': 7.0, 'kind': 'time', 'name': 'the Fast Water'},
    {'n': 7, 'px': 420, 'py': 984, 'r': 6.5, 'kind': 'bend', 'name': 'the Bend'},
]

D = page.load(page.DATA_DIR)
LO, HI = D['lo'], D['hi']
_h = page.raster(D, 'h')
E = LO + ((_h[..., 0].astype(np.int32) << 8) | _h[..., 1]) / 65535.0 * (HI - LO)
_w = page.raster(D, 'wl')
WAT = _w[..., 2] > 127
WL = LO + ((_w[..., 0].astype(np.int32) << 8) | _w[..., 1]) / 65535.0 * (HI - LO)
CL = page.raster(D, 'c')[..., 0]
RA = page.raster(D, 'p')[..., 0].astype(np.float64) / 255.0 * 4000.0
TM = page.raster(D, 'tm')[..., 0].astype(np.float64) - 90.0
NJ, NI = E.shape
assert (NI, NJ) == (D['fullW'], D['fullH']) == (1821, 1723), 'the model is not the 5.1 canvas at 2 km a px'


def height(px, py):
    """bilinear on the model's grid, as its page samples it"""
    i, j = int(math.floor(px)), int(math.floor(py))
    if i < 0 or j < 0 or i + 1 >= NI or j + 1 >= NJ:
        return None
    fu, fv = px - i, py - j
    return float(E[j, i] * (1 - fu) * (1 - fv) + E[j, i + 1] * fu * (1 - fv) + E[j + 1, i] * (1 - fu) * fv + E[j + 1, i + 1] * fu * fv)


def site_of(name, S):
    px, py = S['px'], S['py']
    h = height(px, py)
    lat = -40 - (py - 690) * 2000 / 1000 / 84          # the sky model's frame (89-atmos-e-skymodel.js: refLat -40 at py 690)
    cls = D['climate']['classes'][int(CL[py, px])]['code']
    return {'name': name, 'title': S['title'], 'px': px, 'py': py, 'base': round(h, 1), 'atm': round(1.6 * math.exp(-h / 8000), 3),
            'mean': round(float(TM[py, px]), 1), 'rain': round(float(RA[py, px])), 'cls': cls, 'lat': round(lat, 3)}


def grid_of(S):
    px, py = S['px'], S['py']
    n = int(math.ceil(GRID_KM * 1000 / 2000))
    ia, ib, ja, jb = max(0, px - n), min(NI - 1, px + n), max(0, py - n), min(NJ - 1, py + n)
    heights = [[round(float(E[j, i]), 1) for i in range(ia, ib + 1)] for j in range(ja, jb + 1)]
    water = [[i - ia, j - ja, round(float(WL[j, i]), 1)] for j in range(ja, jb + 1) for i in range(ia, ib + 1) if WAT[j, i]]
    return {'x0': (ia - px) * 2000, 'z0': (ja - py) * 2000, 'dx': 2000, 'dz': 2000, 'nx': ib - ia + 1, 'nz': jb - ja + 1,
            'h': heights, 'water': water}


def ridges_of(S, base):
    px, py = S['px'], S['py']
    eye = base + EYE
    out = []
    for d0, d1 in BANDS:
        prof, dist = [], []
        for k in range(1024):
            az = 2 * math.pi * k / 1024
            sx, sz = math.sin(az), -math.cos(az)          # 0 north (-z), 90 east (+x)
            best, bd = -90.0, None
            d = d0
            while d <= d1:
                h = height(px + sx * d / 2000, py + sz * d / 2000)
                if h is not None:
                    a = math.degrees(math.atan2(h - d * d / (2 * R_PLANET) - eye, d))
                    if a > best:
                        best, bd = a, d
                d += max(500.0, d * .01)
            prof.append(round(best, 3))
            dist.append(bd or d1)
        out.append({'band': [d0, d1], 'dist': round(float(np.mean(dist))), 'profile': prof, 'top': 0})
    return out


def places_of(S, rows):
    out = []
    for p in rows:
        x, z = (p['px'] - S['px']) * 2000, (p['py'] - S['py']) * 2000
        r = dict(p)
        r.update({'x': x, 'z': z, 'h': round(height(p['px'], p['py']), 1), 'water': bool(WAT[p['py'], p['px']]), 'km': round(math.hypot(x, z) / 1000, 1)})
        if 'r' in r:
            r['r'] = r['r'] * 1000
        out.append(r)
    return out


def main():
    for name, S in SITES.items():
        site = site_of(name, S)
        base = site['base']
        rec = {'format': 'ancientsvalley-station', 'version': 1, 'source': 'Krator Scale Model 5.1 (model/data, %s)' % page.version(page.DATA_DIR),
               'site': site, 'eye': EYE, 'planetR': round(R_PLANET), 'lake': {'level': LAKE_LEVEL, 'y': round(LAKE_LEVEL - base, 1)},
               'grid': grid_of(S), 'ridges': ridges_of(S, base), 'cities': places_of(S, CITIES), 'basins': places_of(S, BASINS)}
        path = os.path.join(HERE, 'station-%s.json' % name)
        with open(path, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(rec, fh, separators=(',', ':'))
            fh.write('\n')
        print('%-9s px %d,%d  base %.0f m  lake at y %.1f  %.2f atm  %s  mean %+.0f C  %d mm  grid %dx%d  water cells %d  ridges %s  -> %s' % (
            name, site['px'], site['py'], base, rec['lake']['y'], site['atm'], site['cls'], site['mean'], site['rain'], rec['grid']['nx'], rec['grid']['nz'],
            len(rec['grid']['water']), ', '.join('%.1f..%.1f deg @%d km' % (min(b['profile']), max(b['profile']), b['dist'] / 1000) for b in rec['ridges']),
            os.path.relpath(path, HERE).replace(os.sep, '/')))


if __name__ == '__main__':
    main()
