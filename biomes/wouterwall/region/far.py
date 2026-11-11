#!/usr/bin/env python3
"""The stations' ground and horizon, cut from the scale model (region/data: tools/scale-model/extract_region.py 'w outer wall', 5.1).

    python3 biomes/wouterwall/region/far.py             # writes region/station-<name>.json for every station in SITES

The cut (2026-11-09, the model's 5.1 data in tools/scale-model/model/data; the regions and settlements from the page's defaults,
model/src/51-region-store.js and 60-settlements.js, written out as JSON lists):
    python3 tools/scale-model/extract_region.py tools/scale-model/model/data regions.json settlements.json "w outer wall" <out> \
        --add biomes/wouterwall/region/crest.json
(crest.json: a box from px 190 west of the polygon, so the far land holds the airless crest, 9.3 km at px 255 on the station's row;
added 2026-11-09, KNOWN_ISSUES.md)
then region.json, elev, wlev, temp, rain, clim, mask, biome, overlay and palaeo copied here (dist.png and the scarp rasters are
not read by this kit and are left out). The height grid is Option C's, 1 km a cell (upsample 2); 5.1 map pixels (the plan's
4.22 pixels + 272, + 330).

Not run by build.py (it needs numpy and PIL); its output is committed and build.py embeds it. Rerun it after a new region cut.

For each station (SITES: its map pixel, chosen from the model in N0; PLAN.md section 7):
  site     the pixel, the model's height there (the page's y = 0 is BASE, the model height at the pixel), the climate class,
           the annual mean, the rain, the air (1.6 atm x e^(-h/8 km), the model's own rule), the latitude
  grid     the model's heights (m, absolute) on its own half-resolution grid (~4 km a cell) in a box round the site, in page
           metres (x east, z south, origin at the pixel): the near and mid ground follow it (45-host-stage.js)
  water    the model's water cells in that box: their level (the sag ponds of the slump terraces: station 2)
  ridges   the far land for the shared sky (core/atmos/SKY-PLAN.md section 3.3, "a horizon profile cast from the scale model's
           heightfield at the site"): three bands of distance; in each, at 1024 azimuths (0 north, 90 east), the highest
           elevation angle of the model's ground seen from the eye (BASE + EYE), with the planet's curvature (R from the sky
           model's kmPerDeg: 84 km a degree). Each band's `dist` is the mean distance of its highest points; snowH the height
           over the eye above which the band's ground is snow (the model's mean below -9 C: the ice and the polar desert)
  places   the settlements in the region (Mirabilis, Shelf) in page metres, with the model's height there

Deterministic: no randomness.
"""
import json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, 'data')
# the stations (PLAN.md section 7, the build plan of 2026-11-09: its 5.1 pixels)
SITES = {
    # a yuan at ~3.66 km, Dsb, beside Yut-Ma's gully; Mirabilis 20 km south
    'tablelands': {'px': 352, 'py': 716, 'title': 'The loess tablelands'},
    # the trench lake at 4,430 m (84 km2) under the middle bench's head scarp, Dfc. The plan's px 318,818 is the lake's middle (its 1 km cells
    # span px 316.5-319.5 there): the page stands 4 km west, on the head scarp over its west shore, the lake filling its east third
    'slumps': {'px': 316, 'py': 818, 'title': 'The slump terraces'},
    # the flagship lobe at 4.9-5.0 km under its scar (px 310,872), Dfc; the wall to 7 km 64 km west, the airless rim beyond
    'sturzstrom': {'px': 320, 'py': 871, 'title': 'The sturzstrom'},
    # Waywater Ironblack's country at ~3.45 km, Dsb; the river leaves the bench at 2,580 m. The plan's px 360,1010 is half way up the
    # valley's south wall (3,430 m); the page stands 3 km south of it (half a pixel), on the plateau's rim (3,640 m), so its box canyon
    # runs from the plateau down through the wall to the valley floor inside the page
    'edge': {'px': 360, 'py': 1010.75, 'title': 'The edge'},
}
EYE = 30.0            # m over the ground: a viewer on a rise
R_PLANET = 84.0 * 360 / (2 * math.pi) * 1000      # m: the sky model's frame (kmPerDeg 84)
BANDS = [(18000, 45000), (45000, 120000), (120000, 320000)]   # m; the page's own ground reaches ~20 km (45-host-stage.js: the mid ring)
GRID_KM = 24          # the grid box's half-side (km): the page's mid ground reaches 20 km; at 1 km a cell, 49 x 49 heights

R = json.load(open(os.path.join(D, 'region.json'), encoding='utf-8'))
H = R['heights']
lo, hi, su, sv = H['lo'], H['hi'], H['su'], H['sv']
i0, j0 = H['origin_cell']
bx = R['frame']['box_px']
e = np.array(Image.open(os.path.join(D, 'elev.png')).convert('RGB')).astype(np.float64)
E = lo + (e[..., 0] * 256 + e[..., 1]) / 65535 * (hi - lo)
WAT = e[..., 2] > 127
w = np.array(Image.open(os.path.join(D, 'wlev.png')).convert('RGB')).astype(np.float64)
WL = lo + (w[..., 0] * 256 + w[..., 1]) / 65535 * (hi - lo)
T = np.array(Image.open(os.path.join(D, 'temp.png')).convert('L')).astype(float) + R['temp']['offset']
RA = np.array(Image.open(os.path.join(D, 'rain.png')).convert('L')).astype(float) * R['rain']['scale_mm']
CL = np.array(Image.open(os.path.join(D, 'clim.png')).convert('L'))
NJ, NI = E.shape


def cell_of(px, py):
    return px * su - i0, py * sv - j0


def height(px, py):
    """bilinear on the height grid, as the model's page samples it"""
    u, v = cell_of(px, py)
    i, j = int(math.floor(u)), int(math.floor(v))
    if i < 0 or j < 0 or i + 1 >= NI or j + 1 >= NJ:
        return None
    fu, fv = u - i, v - j
    return float(E[j, i] * (1 - fu) * (1 - fv) + E[j, i + 1] * fu * (1 - fv) + E[j + 1, i] * (1 - fu) * fv + E[j + 1, i + 1] * fu * fv)


def full(arr, px, py):
    x, y = int(round(px)) - bx[0], int(round(py)) - bx[1]
    if 0 <= y < arr.shape[0] and 0 <= x < arr.shape[1]:
        return arr[y, x]
    return None


def site_of(name, S):
    px, py = S['px'], S['py']
    h = height(px, py)
    lat = -40 - (py - 690) * 2000 / 1000 / 84          # the sky model's frame (89-atmos-e-skymodel.js: refLat -40 at py 690)
    cls = R['classes'][int(full(CL, px, py))]['code']
    return {'name': name, 'title': S['title'], 'px': px, 'py': py, 'base': round(h, 1), 'atm': round(1.6 * math.exp(-h / 8000), 3),
            'mean': float(full(T, px, py)), 'rain': round(float(full(RA, px, py))), 'cls': cls, 'lat': round(lat, 3)}


def grid_of(S, base):
    px, py = S['px'], S['py']
    u, v = cell_of(px, py)
    n = int(math.ceil(GRID_KM * 1000 / (2000 / su)))
    ic, jc = int(round(u)), int(round(v))
    ia, ib, ja, jb = max(0, ic - n), min(NI - 1, ic + n), max(0, jc - n), min(NJ - 1, jc + n)
    # page metres of cell (i, j): full px (i+i0)/su, (j+j0)/sv
    x0 = ((ia + i0) / su - px) * 2000
    z0 = ((ja + j0) / sv - py) * 2000
    heights = [[round(float(E[j, i]), 1) for i in range(ia, ib + 1)] for j in range(ja, jb + 1)]
    water = []
    for j in range(ja, jb + 1):
        for i in range(ia, ib + 1):
            if WAT[j, i]:
                water.append([i - ia, j - ja, round(float(WL[j, i]), 1)])
    return {'x0': round(x0, 2), 'z0': round(z0, 2), 'dx': round(2000 / su, 3), 'dz': round(2000 / sv, 3), 'nx': ib - ia + 1, 'nz': jb - ja + 1,
            'h': heights, 'water': water}


def ridges_of(S, base):
    px, py = S['px'], S['py']
    eye = base + EYE
    out = []
    for d0, d1 in BANDS:
        prof, dist, snow = [], [], []
        for k in range(1024):
            az = 2 * math.pi * k / 1024
            sx, sz = math.sin(az), -math.cos(az)          # 0 north (-z), 90 east (+x)
            best, bd, bh = -90.0, None, None
            d = d0
            while d <= d1:
                h = height(px + sx * d / 2000, py + sz * d / 2000)
                if h is not None:
                    drop = d * d / (2 * R_PLANET)
                    a = math.degrees(math.atan2(h - drop - eye, d))
                    if a > best:
                        best, bd, bh = a, d, h
                d += max(500.0, d * .01)
            prof.append(round(best, 3))
            dist.append(bd or d1)
            snow.append(bh)
        cold = [hh for hh in snow if hh is not None]
        out.append({'band': [d0, d1], 'dist': round(float(np.mean(dist))), 'profile': prof,
                    'top': round(max(cold) - eye) if cold else 0})
    return out


def places_of(S):
    out = []
    for p in R.get('settlements', []):
        x, z = (p['px'] - S['px']) * 2000, (p['py'] - S['py']) * 2000
        out.append({'name': p['name'], 'type': p['type'], 'x': x, 'z': z, 'h': round(height(p['px'], p['py']), 1), 'km': round(math.hypot(x, z) / 1000, 1)})
    return out


def main():
    for name, S in SITES.items():
        site = site_of(name, S)
        base = site['base']
        rec = {'format': 'wouterwall-station', 'version': 1, 'source': R.get('source'), 'site': site, 'eye': EYE, 'planetR': round(R_PLANET),
               'grid': grid_of(S, base), 'ridges': ridges_of(S, base), 'places': places_of(S)}
        path = os.path.join(HERE, 'station-%s.json' % name)
        with open(path, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(rec, fh, separators=(',', ':'))
            fh.write('\n')
        r = rec['ridges']
        print('%-7s px %d,%d  base %.0f m  %.2f atm  %s  mean %+.0f C  %d mm  grid %dx%d  water cells %d  ridges %s  -> %s' % (
            name, site['px'], site['py'], base, site['atm'], site['cls'], site['mean'], site['rain'], rec['grid']['nx'], rec['grid']['nz'],
            len(rec['grid']['water']), ', '.join('%.1f..%.1f deg @%d km' % (min(b['profile']), max(b['profile']), b['dist'] / 1000) for b in r),
            os.path.relpath(path, HERE).replace(os.sep, '/')))


if __name__ == '__main__':
    main()
