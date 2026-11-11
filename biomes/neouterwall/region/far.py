#!/usr/bin/env python3
"""The stations' ground and horizon, cut from the scale model (region/data: tools/scale-model/extract_region.py 'ne outer wall', 5.1).

    python3 biomes/neouterwall/region/far.py             # writes region/station-<name>.json for stations 1-3 (region/data)
    NEOW_DATA=data-east python3 biomes/neouterwall/region/far.py   # stations 4, 5 and 5a (region/data-east: horizon-east.json's cut)

The cut (2026-11-10, the model's 5.1 data in tools/scale-model/model/data; the regions and settlements from the page's defaults,
model/src/51-region-store.js `defRegs` and 60-settlements.js `defSetts`, written out as JSON lists):
    python3 tools/scale-model/extract_region.py tools/scale-model/model/data regions.json settlements.json "ne outer wall" <out> \
        --add biomes/neouterwall/region/horizon.json --upsample 2
(horizon.json: a box 160 px (320 km) round each station's pixel, so the far land's last band (to 320 km) has ground on every side:
the polygon's own box stops 70 px north of station 1 and 80 px south, 70 px west of station 2). Then region.json, elev, wlev, temp, rain, clim, mask and
biome copied here (dist.png and the scarp rasters are not read by this kit and are left out: dist.png is 434 KB). The height grid is
Option C's, 1 km a cell (upsample 2), on 5.1 map pixels.

Not run by build.py (it needs numpy and PIL); its output is committed and build.py embeds it. Rerun it after a new region cut.

For each station (SITES: its map pixel, chosen from the model in N0; PLAN.md section 7):
  site     the pixel, the model's height there (the page's y = 0 is BASE: the model's height at the pixel, or with 'level' the tarn's water), the climate class
           the annual mean, the rain, the air (1.6 atm x e^(-h/8 km), the model's own rule), the latitude
  grid     the model's heights (m, absolute) on its own half-resolution grid (~4 km a cell) in a box round the site, in page
           metres (x east, z south, origin at the pixel): the near and mid ground follow it (45-host-stage.js)
  water    the model's water cells in that box: their level (the sag ponds of the slump terraces: station 2)
  ridges   the far land for the shared sky (core/atmos/SKY-PLAN.md section 3.3, "a horizon profile cast from the scale model's
           heightfield at the site"): three bands of distance; in each, at 1024 azimuths (0 north, 90 east), the highest
           elevation angle of the model's ground seen from the eye (BASE + EYE), with the planet's curvature (R from the sky
           model's kmPerDeg: 84 km a degree). Each band's `dist` is the mean distance of its highest points; snowH the height
           over the eye above which the band's ground is snow (the model's mean below -9 C: the ice and the polar desert)
  places   the settlements in the cut (none inside the polygon; the Gate and Coyote Canyon outside it) in page metres, with the model's height there

Deterministic: no randomness.
"""
import json, math, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# the cut this run reads (NEOW_DATA, default 'data'): stations 1-3 read region/data, stations 4-5a region/data-east (horizon-east.json;
# a separate cut so the first stations' bytes do not move). Each SITES entry names its cut ('data'); only this run's are written
CUT = os.environ.get('NEOW_DATA', 'data')
D = os.path.join(HERE, CUT)
# the stations (PLAN.md section 7, the build plan of 2026-11-09: its 5.1 pixels)
SITES = {
    # the Vitreous Boxwork Tarn's south-east shore (the tarn 1258,326 at 2,950 m, ~15 x 11 km on the 1 km grid): the page holds the shore,
    # the warm floor rising south-east to the dike walls (4.3-4.8 km within 6 km); station 1 (PLAN.md section 7)
    # 'level': the page's y = 0 is the tarn's water (the model's level there), not the model's height at the pixel (on the shore the
    # 1 km grid's bilinear reads 3.4 km, half-way up the wall); 'clim': the climate is the tarn's (its WH cell, +9 C, the warm pocket),
    # not the wall's Dfc cell the shore pixel falls in
    'vitreous': {'px': 1260.75, 'py': 327.8, 'title': 'Vitreous Hollow', 'level': True, 'clim': [1258, 326]},
    # the Garnet-Mirror Tarn's south shore (the tarn 1186,344 at 2,810 m, ~14 x 8 km; its north-west wall 4.8-6.3 km within 4 km, its
    # south a low sill at 3.4-3.7 km): the page holds the shore and the wet south slope, the great wall across the water; station 2
    'garnet': {'px': 1185, 'py': 345.9, 'title': 'Garnet-Mirror Cauldron', 'level': True, 'clim': [1186, 344]},
    # the skarn ribs between the two cauldrons (4.78 km, ET, 0.88 atm): a slope rising south-west ~7%, the model smooth at 1 km; the
    # station cuts its gullies and stands its ribs on it (station 3; inside the cut's box, which already reaches 320 km round it)
    'badlands': {'px': 1200, 'py': 330, 'title': 'The Epidote Badlands'},
    # (NEOW_DATA=data-east python3 region/far.py) the Gate shoulder's east flank above the Narrows (2.87 km, Csa): station 4
    'shoulder': {'px': 1430, 'py': 345, 'title': 'The Gate Shoulder', 'data': 'data-east'},
    # the Epidote-Steam Tarn's north shore by the cave's inner mouth (1340,336; the tarn 2,670 m, WH +11): station 5
    'steam': {'px': 1340, 'py': 336.6, 'title': 'The Epidote-Steam Tarn', 'level': True, 'clim': [1342, 338], 'data': 'data-east'},
    # the Portal Valley's head at the cave's portal (1331,302): 'base' is the valley floor the plan sets there (5,900 m, section 2a), not
    # the model's uncut wall (the map edit that carves it is owed): station 5a
    'portal': {'px': 1331, 'py': 301.6, 'title': 'The Portal', 'base': 5900.0, 'data': 'data-east'},
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


def tarn_level(S):
    """the level of the model's water nearest the pixel (its water cells' level, wlev)"""
    u, v = cell_of(S['px'], S['py'])
    best = None
    for j in range(max(0, int(v) - 12), min(NJ, int(v) + 13)):
        for i in range(max(0, int(u) - 12), min(NI, int(u) + 13)):
            if WAT[j, i]:
                d = (i - u) ** 2 + (j - v) ** 2
                if best is None or d < best[0]:
                    best = (d, float(WL[j, i]))
    return best[1] if best else None


def site_of(name, S):
    px, py = S['px'], S['py']
    h = S['base'] if S.get('base') else tarn_level(S) if S.get('level') else height(px, py)
    cpx, cpy = S.get('clim', (px, py))
    lat = -40 - (py - 690) * 2000 / 1000 / 84          # the sky model's frame (89-atmos-e-skymodel.js: refLat -40 at py 690)
    cls = R['classes'][int(full(CL, cpx, cpy))]['code']
    return {'name': name, 'title': S['title'], 'px': px, 'py': py, 'base': round(h, 1), 'atm': round(1.6 * math.exp(-h / 8000), 3),
            'mean': float(full(T, cpx, cpy)), 'rain': round(float(full(RA, cpx, cpy))), 'cls': cls, 'lat': round(lat, 3),
            'level': bool(S.get('level')), 'clim_px': [cpx, cpy]}


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
        if S.get('data', 'data') != CUT:
            continue
        site = site_of(name, S)
        base = site['base']
        rec = {'format': 'neouterwall-station', 'version': 1, 'source': R.get('source'), 'site': site, 'eye': EYE, 'planetR': round(R_PLANET),
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
