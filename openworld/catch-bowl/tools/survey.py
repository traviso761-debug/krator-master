#!/usr/bin/env python3
"""The Catch and the Bowl on scale model 5.1: the survey behind openworld/catch-bowl/PLAN-TERRAIN.md.

    python3 openworld/catch-bowl/tools/survey.py            # every section
    python3 openworld/catch-bowl/tools/survey.py pins        # one section: pins | polygons | floor | basins |
                                                             # routes | walls | seow | union | drift

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
    ('Ranger HQ', 1420, 1242), ('Arcbeam', 1016, 1058), ('Esper', 1042, 1083), ('Lake Vapora (caldera)', 1421, 1236),
]
POLYS = [('the catch', 'rmvka7icdn1dq'), ('the bowl', 'rmvka5413efyi'),
         ('SE outer wall', 'rmw4xy4tp9b29'), ('stalker range', 'rmvkknh1am4fw'),
         ('twins', 'rmw536m06wlyf'), ('Stalker Gate', 'rmvstalkergate'),
         ('Stalker Peaks (geographic)', 'rmwstalkerpks')]
# the region's own four, in cut order, and the neighbour a later region may take
REGION = ['rmvka7icdn1dq', 'rmvka5413efyi', 'rmw4xy4tp9b29', 'rmvkknh1am4fw', 'rmvstalkergate', 'rmw536m06wlyf']
NEIGHBOUR = ('Xanadu Sultanate (region 2\'s)', 'rmufcgvtxatfx')
# biomes/seouterwall/PLAN.md's own features, with the height its plan gives them
SEOW = [('Godsgate north sill', 1026, 1224, 3380), ('Godsgate saddle crest', 1031, 1252, 3620),
        ('Bab al-Hawa vent shaft', 1033, 1258, 3590), ('Godsgate southern narrows', 1035, 1292, 3480),
        ('North gorge (Guli rrija)', 1024, 1206, 2850),
        ('Ilmenite Horn', 1008, 1248, 5480), ('Shatter-Crown', 1056, 1244, 5760),
        ('Tarn 1 Gate-Bell', 1016, 1236, 3680), ('Tarn 2 Amber-Sinter', 1064, 1272, 3940),
        ('Tarn 3 Mirror-Slump', 1134, 1218, 4120), ('Tarn 4 Jade-Karst Polje', 1208, 1254, 4380),
        ('Tarn 5 Copper-Vein', 1288, 1184, 3820),
        ('Tharn crater floor (station 12)', 1375, 1525, 6185),
        ('Ranger HQ (Yuni Stalker-watch)', 1420, 1242, None), ('Hub 01', 1344, 1409, 4351)]
# the Godsgate corridor, as biomes/seouterwall/PLAN.md section 6.2 carves it
GODSGATE = (1005, 1059, 1195, 1320)
# the Catch kit's five oasis records (biomes/catch/src/50-biome-catch-species.js, the 4.21 canvas) against 5.1's pins
KIT_OASES = [('Kolli', (738, 944), (1058, 1367)), ('Arfwai', (792, 1030), (1090, 1387)),
             ('Stair', (834, 1112), (1106, 1442)), ('Bitta', (806, 1180), (1088, 1455)),
             ('Lasso', (768, 1236), (1083, 1474))]
# the kit's four station sites (biomes/catch/PLAN.md section 10, the 4.21 canvas) and the height each was planned at
KIT_STATIONS = [('1 the sand sea', (800, 1010), 350), ('2 Stair\'s oasis', (834, 1112), 1000),
                ('3 the lake and lake beds', (763, 1062), 318), ('4 the north fan', (738, 944), 1400)]
ROUTES = [
    ('Jabal > Parabola', [(1225, 1149), (1100, 1170), (1000, 1180), (970, 1186)]),
    # the north road end to end as straight hops: the WRONG tool over a meandering corridor (see the walls section,
    # which follows the Godsgate's own thalweg), kept because the legs outside the corridor are measured right
    ('Parabola > the Godsgate > Kolli (hops)', [(970, 1186), (1028, 1246), (1058, 1367)]),
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
    print('\n== the walls, and the Godsgate corridor through the north one ==')
    print('  NOTE. A column maximum over a band answers "how high is the wall here", NOT "how high must a road climb":')
    print('  a meandering carved corridor has a THALWEG (its own lowest continuous line), which is the road\'s answer.')
    for lab, (x0, x1, y0, y1) in (('the north wall (SE outer wall)', (990, 1181, 1240, 1331)),
                                  ('the south wall toward the Twins', (1000, 1121, 1455, 1531))):
        best = sorted((E[y0:y1, x].max(), x, y0 + int(E[y0:y1, x].argmax())) for x in range(x0, x1))
        print('  -- %s: lowest column maximum (x %d-%d, y %d-%d) --' % (lab, x0, x1 - 1, y0, y1 - 1))
        for v, x, y in best[:3]:
            print('     %6.0f m at px %d,%d' % (v, x, y))
    gx0, gx1, gy0, gy1 = GODSGATE
    print('  -- the Godsgate corridor THALWEG (x %d-%d), as seouterwall PLAN.md 6.2 carves it --' % (gx0, gx1 - 1))
    print('     %6s %9s %7s %9s' % ('py', 'floor m', 'at px', 'median m'))
    lo, hi = 1e9, -1e9
    for y in range(gy0, gy1, 5):
        col = E[y, gx0:gx1]
        i = int(col.argmin())
        lo, hi = min(lo, col.min()), max(hi, col.min())
        print('     %6d %9.0f %7d %9.0f' % (y, col.min(), gx0 + i, np.median(col)))
    # the thalweg as a polyline (one point per row: the x of that row's lowest cell), and the road it implies
    pts = []
    for y in range(gy0, gy1):
        col = E[y, gx0:gx1]
        pts.append((gx0 + int(col.argmin()), y, float(col.min())))
    d = sum(np.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts[:-1], pts[1:])) * M_PER_PX
    up = sum(max(0.0, b[2] - a[2]) for a, b in zip(pts[:-1], pts[1:]))
    dn = sum(max(0.0, a[2] - b[2]) for a, b in zip(pts[:-1], pts[1:]))
    g = [abs(b[2] - a[2]) / max(1.0, np.hypot(b[0] - a[0], b[1] - a[1]) * M_PER_PX) for a, b in zip(pts[:-1], pts[1:])]
    print('     the thalweg runs %.0f..%.0f m over %.0f km: climb %.0f m, descent %.0f m, grade med %.1f %% p95 %.1f %%'
          % (lo, hi, d / 1000, up, dn, 100 * np.median(g), 100 * np.percentile(g, 95)))
    print('     so a road over the Godsgate tops out at about %.0f m, not at the column maxima above' % hi)


def sec_seow(S):
    M, E, WHAS, WLEV, RAIN, TEMP = S
    e = lambda x, y: E[int(round(y)), int(round(x))]
    print('\n== biomes/seouterwall/PLAN.md features against 5.1 (its carve landed; its rescale did not) ==')
    print('  %-32s %-11s %9s %9s %8s  %s' % ('feature', 'px', 'planned', '5.1', 'delta', 'water'))
    for n, x, y, want in SEOW:
        v = e(x, y)
        w = 'LAKE %.0f m' % WLEV[y, x] if WHAS[y, x] else ''
        if not w:
            sub = WHAS[max(0, y - 8):y + 9, max(0, x - 8):x + 9]
            if sub.any():
                ys, xs = np.nonzero(sub)
                w = 'water %.0f km' % (np.hypot(ys - 8, xs - 8).min() * 2)
        print('  %-32s %4d,%-6d %9s %9.0f %8s  %s' % (
            n, x, y, want if want else '-', v, ('%+.0f' % (v - want)) if want else '-', w))
    r = regions()['rmw4xy4tp9b29']
    m, (x0, y0, x1, y1) = poly_mask(r['points'])
    v = E[y0:y1, x0:x1][m]
    print('  -- the rescale (PLAN.md 6.1: a 4,850 m median and ZERO cells over 6,500 m) --')
    print('     median %.0f m; %d of %d px over 6,500 m (%.0f %%); max %.0f m: NOT APPLIED'
          % (np.median(v), (v > 6500).sum(), m.sum(), 100 * (v > 6500).mean(), v.max()))


def sec_union(S):
    """the region's scale, polygon by polygon and as the union, against xanadu-oidong-highrift"""
    R = regions()
    allp = [R[i]['points'] for i in REGION] + [R[NEIGHBOUR[1]]['points']]
    bb = lambda p: (min(q[0] for q in p), max(q[0] for q in p), min(q[1] for q in p), max(q[1] for q in p))
    X0 = int(min(bb(p)[0] for p in allp)); X1 = int(max(bb(p)[1] for p in allp)) + 1
    Y0 = int(min(bb(p)[2] for p in allp)); Y1 = int(max(bb(p)[3] for p in allp)) + 1
    yy, xx = np.mgrid[Y0:Y1, X0:X1]

    def mk(pts):
        ins = np.zeros(xx.shape, bool)
        n = len(pts)
        for k in range(n):
            ax, ay = pts[k]; bx, by = pts[(k + 1) % n]
            ins ^= ((ay > yy) != (by > yy)) & (xx < (bx - ax) * (yy - ay) / ((by - ay) or 1e-9) + ax)
        return ins

    names = [R[i]['name'] for i in REGION] + [NEIGHBOUR[0]]
    masks = dict(zip(names, (mk(p) for p in allp)))
    print('\n== the region\'s scale ==')
    for n in names:
        print('  %-16s %6d px = %4.0f thousand km2' % (n, masks[n].sum(), masks[n].sum() * 4 / 1000))
    steps = [(names[:2], 'catch + bowl'), (names[:3], '+ SE outer wall'), (names[:4], '+ stalker range'),
             (names[:5], '+ Stalker Gate'),
             (names[:6], '+ twins (THE REGION, settled 2026-11-24)'),
             (names, '+ Xanadu Sultanate (region 2\'s: NOT cut here)')]
    for sel, lab in steps:
        u = np.zeros(xx.shape, bool)
        for s in sel:
            u |= masks[s]
        ys, xs = np.nonzero(u)
        bx0, bx1, by0, by1 = X0 + xs.min(), X0 + xs.max(), Y0 + ys.min(), Y0 + ys.max()
        print('  %-36s filled %4.0f kkm2;  box px %d-%d x %d-%d = %.0f x %.0f km = %.0f kkm2;  centre px %.0f,%.0f'
              % (lab, u.sum() * 4 / 1000, bx0, bx1, by0, by1, (bx1 - bx0) * 2, (by1 - by0) * 2,
                 (bx1 - bx0) * (by1 - by0) * 4 / 1000, (bx0 + bx1) / 2, (by0 + by1) / 2))
    print('  reference: xanadu-oidong-highrift fills ~295 kkm2 in a 1,037 kkm2 box at 1 km cells (a 7.6 MB page)')
    print('  overlaps (extract_region.py gives the SMALLER polygon the overlap):')
    import itertools
    for a, b in itertools.combinations(names, 2):
        o = int((masks[a] & masks[b]).sum())
        if o:
            print('     %-16s / %-16s %5d px = %.0f kkm2' % (a, b, o, o * 4 / 1000))


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
            'routes': sec_routes, 'walls': sec_walls, 'seow': sec_seow, 'union': sec_union, 'drift': sec_drift}

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
