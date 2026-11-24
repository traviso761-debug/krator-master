#!/usr/bin/env python3
"""The Catch and the Bowl on scale model 5.1: the survey behind openworld/catch-bowl/PLAN-TERRAIN.md.

    python3 openworld/catch-bowl/tools/survey.py            # every section
    python3 openworld/catch-bowl/tools/survey.py pins        # one section: pins | polygons | floor | basins | routes | walls | drift

Read-only on tools/scale-model/model/data (the 5.1 canvas, never a saved page). Every number PLAN-TERRAIN.md quotes
comes out of a section here, so a later map edit can be re-measured against the plan by rerunning it. It needs numpy and
PIL only (not scipy, which extract_region.py wants and a fresh cloud container does not have).
"""
import json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
DATA = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
RSTORE = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'src', '51-region-store.js')
M_PER_PX = 2000.0
SHIFT = (272, 330)   # model.json legacy_shift: the 4.21/4.22 canvas (1549 x 1393) into 5.1's (1821 x 1723)


def load():
    keys = json.load(open(os.path.join(DATA, 'model.json'), encoding='utf-8'))['keys']
    M = {k['key']: k.get('value', k.get('file')) for k in keys}
    img = lambda n: np.asarray(Image.open(os.path.join(DATA, n)).convert('RGB'))
    lo, hi = M['lo'], M['hi']
    h = img('h.png')
    E = lo + ((h[..., 0].astype(np.int32) << 8) | h[..., 1]) / 65535.0 * (hi - lo)
    w = img('wl.png')
    WHAS = w[..., 2] > 127
    WLEV = np.where(WHAS, lo + ((w[..., 0].astype(np.int32) << 8) | w[..., 1]) / 65535.0 * (hi - lo), np.nan)
    RAIN = img('p.png')[..., 0].astype(np.float64) / 255.0 * 4000.0
    TEMP = img('tm.png')[..., 0].astype(np.float64) - 90.0
    return M, E, WHAS, WLEV, RAIN, TEMP


def regions():
    src = open(RSTORE, encoding='utf-8').read()
    i = src.index('const defRegs = [')
    j = src.index('\n', src.index('];', i))
    return {r['id']: r for r in json.loads(src[src.index('[', i): src.rindex('];', i, j) + 1])}


def poly_mask(pts):
    """(inside, (x0, y0, x1, y1)) on the model's pixel grid: the even-odd rule, as extract_region.py cuts"""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1, y0, y1 = int(min(xs)), int(max(xs)) + 1, int(min(ys)), int(max(ys)) + 1
    yy, xx = np.mgrid[y0:y1, x0:x1]
    inside = np.zeros(xx.shape, bool)
    n = len(pts)
    for k in range(n):
        ax, ay = pts[k]
        bx, by = pts[(k + 1) % n]
        inside ^= ((ay > yy) != (by > yy)) & (xx < (bx - ax) * (yy - ay) / ((by - ay) or 1e-9) + ax)
    return inside, (x0, y0, x1, y1)


# the places this plan measures: name, 5.1 px
PINS = [
    ('Parabola', 970, 1186), ('Bab al-Hawa (Godsgate pin)', 1028, 1246), ('Bab al-Hawa shaft', 1033, 1258),
    ('Kolli', 1058, 1367), ('Arfwai', 1090, 1387), ('Stair', 1106, 1442),
    ('Bitta', 1088, 1455), ('Lasso', 1083, 1474), ('Salt al-Ban (held pin)', 1080, 1428),
    ('the terminal soda lake', 1035, 1392), ('Hub 01', 1344, 1409),
    ('Jabal', 1225, 1149), ('Solta (held pin)', 1169, 1150), ('Mantis', 1113, 1164), ('the Bowl salt lake', 1147, 1141),
    ('White Gills Hermitage', 1015, 1430), ('Catch-Lookout', 1056, 1462), ('the Brazier', 1016, 1479),
    ('Sinter-Gate', 996, 1504), ('Twins Pass pin', 1042, 1525), ('Strongbow', 1001, 1596),
]
POLYS = [('the catch', 'rmvka7icdn1dq'), ('the bowl', 'rmvka5413efyi'),
         ('twins', 'rmw536m06wlyf'), ('stalker range', 'rmvkknh1am4fw')]
# the Catch kit's five oasis records (biomes/catch/src/50-biome-catch-species.js, the 4.21 canvas) against 5.1's pins
KIT_OASES = [('Kolli', (738, 944), (1058, 1367)), ('Arfwai', (792, 1030), (1090, 1387)),
             ('Stair', (834, 1112), (1106, 1442)), ('Bitta', (806, 1180), (1088, 1455)),
             ('Lasso', (768, 1236), (1083, 1474))]
# the kit's four station sites (biomes/catch/PLAN.md section 10, the 4.21 canvas) and the height each was planned at
KIT_STATIONS = [('1 the sand sea', (800, 1010), 350), ('2 Stair\'s oasis', (834, 1112), 1000),
                ('3 the lake and lake beds', (763, 1062), 318), ('4 the north fan', (738, 944), 1400)]
ROUTES = [
    ('Jabal > Parabola', [(1225, 1149), (1100, 1170), (1000, 1180), (970, 1186)]),
    ('Parabola > Godsgate > Kolli', [(970, 1186), (1028, 1246), (1058, 1367)]),
    ('Kolli > Arfwai > Stair', [(1058, 1367), (1090, 1387), (1106, 1442)]),
    ('Stair > Bitta > Lasso', [(1106, 1442), (1088, 1455), (1083, 1474)]),
    ('Lasso > Catch-Lookout', [(1083, 1474), (1056, 1462)]),
    ('Route B: Lookout > Brazier > Sinter-Gate', [(1056, 1462), (1031, 1473), (1016, 1479), (1005, 1489), (996, 1504)]),
    ('Sinter-Gate > Strongbow', [(996, 1504), (1001, 1596)]),
    ('Mantis > Solta > Jabal', [(1113, 1164), (1169, 1150), (1225, 1149)]),
]


def sec_pins(S):
    M, E, WHAS, WLEV, RAIN, TEMP = S
    print('\n== pins ==  (5.1 px, 2 km a pixel)')
    print('%-28s %-10s %8s %7s %7s  %s' % ('place', 'px', 'elev m', 'rain', 'temp C', 'water'))
    for n, px, py in PINS:
        i, j = int(round(px)), int(round(py))
        print('%-28s %4d,%-5d %8.0f %7.0f %7.1f  %s' % (
            n, px, py, E[j, i], RAIN[j, i], TEMP[j, i],
            ('LAKE %.0f m' % WLEV[j, i]) if WHAS[j, i] else '-'))


def sec_polygons(S):
    M, E, WHAS, WLEV, RAIN, TEMP = S
    R = regions()
    for name, rid in POLYS:
        r = R[rid]
        m, (x0, y0, x1, y1) = poly_mask(r['points'])
        e = E[y0:y1, x0:x1][m]
        rn = RAIN[y0:y1, x0:x1][m]
        tp = TEMP[y0:y1, x0:x1][m]
        wa = WHAS[y0:y1, x0:x1][m]
        print('\n== polygon %s (%s, kind %s) ==' % (name, rid, r.get('kind')))
        print('  %d px = %.0f thousand km2; box px %d-%d x %d-%d = %.0f x %.0f km' % (
            m.sum(), m.sum() * 4 / 1000, x0, x1, y0, y1, (x1 - x0) * 2, (y1 - y0) * 2))
        for lab, v in (('elev', e), ('rain', rn), ('temp', tp)):
            print('  %-4s min %8.0f  p05 %8.0f  med %8.0f  p95 %8.0f  max %8.0f' % (
                lab, v.min(), np.percentile(v, 5), np.median(v), np.percentile(v, 95), v.max()))
        print('  water %d px (%.1f %%)' % (wa.sum(), 100 * wa.mean()))
        print('  over: ' + '  '.join('%d m %.0f%%' % (t, 100 * (e > t).mean()) for t in (500, 1600, 5000, 8000, 12000)))


def sec_floor(S):
    M, E, WHAS, WLEV, RAIN, TEMP = S
    r = regions()['rmvka7icdn1dq']
    m, (x0, y0, x1, y1) = poly_mask(r['points'])
    sub = E[y0:y1, x0:x1]
    print('\n== the Catch floor inside the catch polygon ==')
    for th in (1600, 600):
        low = m & (sub < th)
        ys, xs = np.nonzero(low)
        print('  under %4d m: %5d px = %5.0f thousand km2; extent px %d-%d x %d-%d (%.0f x %.0f km)' % (
            th, low.sum(), low.sum() * 4 / 1000, x0 + xs.min(), x0 + xs.max(), y0 + ys.min(), y0 + ys.max(),
            (xs.max() - xs.min()) * 2, (ys.max() - ys.min()) * 2))


def sec_basins(S):
    print('\n== closed basins (tools/scale-model/model/data/basins.json) ==')
    B = json.load(open(os.path.join(DATA, 'basins.json'), encoding='utf-8'))
    for lab, (bx0, bx1, by0, by1) in (('the Catch', (959, 1242, 1288, 1518)), ('the Bowl', (913, 1256, 1042, 1194))):
        print('  -- %s --' % lab)
        rows = [b for b in B if bx0 <= b['at_px'][0] <= bx1 and by0 <= b['at_px'][1] <= by1]
        rows.sort(key=lambda b: -b['km2'])
        for b in rows:
            print('     px %7.1f,%-7.1f  level %6.0f  spill %7s  %6.0f km2  %-12s %-5s surplus %s' % (
                b['at_px'][0], b['at_px'][1], b['level_m'], b.get('spill_m', b.get('depth_m')), b['km2'],
                b['kind'], b.get('climate'), b.get('surplus_m3s')))


def sec_routes(S):
    M, E, WHAS, WLEV, RAIN, TEMP = S
    e = lambda x, y: E[int(round(y)), int(round(x))]
    print('\n== route profiles (straight hops between the stops; a ROADS route is longer and gentler) ==')
    print('%-40s %6s %12s %7s %7s %18s' % ('route', 'km', 'z start..end', 'max m', 'climb m', 'grade med/p95/max'))
    for name, pts in ROUTES:
        xs, ys = [], []
        for a, b in zip(pts[:-1], pts[1:]):
            n = max(2, int(np.hypot(b[0] - a[0], b[1] - a[1])))
            for t in np.linspace(0, 1, n, endpoint=False):
                xs.append(a[0] + (b[0] - a[0]) * t)
                ys.append(a[1] + (b[1] - a[1]) * t)
        xs.append(pts[-1][0]); ys.append(pts[-1][1])
        z = np.array([e(x, y) for x, y in zip(xs, ys)])
        d = np.hypot(np.diff(xs), np.diff(ys)) * M_PER_PX
        g = np.abs(np.diff(z)) / np.maximum(d, 1)
        print('%-40s %6.0f %6.0f..%-5.0f %7.0f %7.0f %5.1f%% %5.1f%% %5.1f%%' % (
            name, d.sum() / 1000, z[0], z[-1], z.max(), np.maximum(np.diff(z), 0).sum(),
            100 * np.median(g), 100 * np.percentile(g, 95), 100 * g.max()))


def sec_walls(S):
    M, E, WHAS, WLEV, RAIN, TEMP = S
    print('\n== the lowest crossing of each wall (the highest point of each column of the band) ==')
    for lab, (x0, x1, y0, y1) in (('the north wall', (990, 1181, 1240, 1331)),
                                  ('the south wall toward the Twins', (1000, 1121, 1455, 1531))):
        best = sorted((E[y0:y1, x].max(), x, y0 + int(E[y0:y1, x].argmax())) for x in range(x0, x1))
        print('  -- %s (x %d-%d, y %d-%d) --' % (lab, x0, x1 - 1, y0, y1 - 1))
        for v, x, y in best[:5]:
            print('     crest %6.0f m at px %d,%d' % (v, x, y))


def sec_drift(S):
    M, E, WHAS, WLEV, RAIN, TEMP = S
    e = lambda x, y: E[int(round(y)), int(round(x))]
    print('\n== biomes/catch records against 5.1 (the 4.21 canvas shifted by %d,%d) ==' % SHIFT)
    print('  -- CATCH.OASES (src/50-biome-catch-species.js) --')
    print('  %-8s %-12s %-12s %-12s %s' % ('oasis', 'kit px (4.21)', 'shifted', '5.1 pin', 'drift km'))
    for n, (ox, oy), (mx, my) in KIT_OASES:
        sx, sy = ox + SHIFT[0], oy + SHIFT[1]
        km = np.hypot(mx - sx, my - sy) * 2
        print('  %-8s %-12s %-12s %-12s %6.0f' % (n, '%d,%d' % (ox, oy), '%d,%d' % (sx, sy), '%d,%d' % (mx, my), km))
    print('  -- the station sites (PLAN.md section 10) --')
    print('  %-26s %-12s %-12s %10s %10s' % ('station', 'kit px (4.21)', 'shifted', 'planned m', '5.1 m'))
    for n, (ox, oy), want in KIT_STATIONS:
        sx, sy = ox + SHIFT[0], oy + SHIFT[1]
        print('  %-26s %-12s %-12s %10d %10.0f' % (n, '%d,%d' % (ox, oy), '%d,%d' % (sx, sy), want, e(sx, sy)))


SECTIONS = {'pins': sec_pins, 'polygons': sec_polygons, 'floor': sec_floor, 'basins': sec_basins,
            'routes': sec_routes, 'walls': sec_walls, 'drift': sec_drift}

if __name__ == '__main__':
    want = sys.argv[1:] or list(SECTIONS)
    bad = [w for w in want if w not in SECTIONS]
    if bad:
        sys.exit('survey: no section %s (have: %s)' % (', '.join(bad), ', '.join(SECTIONS)))
    S = load()
    print('scale model 5.1: %d x %d px at %.0f m, elevation %.0f..%.0f m'
          % (S[0]['w'], S[0]['hh'], M_PER_PX, S[1].min(), S[1].max()))
    for w in want:
        SECTIONS[w](S)
