#!/usr/bin/env python3
"""smodel against the scripts it was lifted from (history/), on the live model's data.

    python3 tools/scale-model/tests/test_smodel.py

1. Every function smodel lifted unchanged has the same syntax tree as its history/ original, and every constant the
   same value. The functions that changed on purpose (grid_fields, carve_river, region_mask) are listed and run instead.
2. On a test edit of the live data (ridged mountains in the 'little demo' polygon), smodel and history give the same
   heights, re-shaded paint, rain, class, zone, repaint, retint, desert and climate repaints, water books and routing
   set-up, temperatures' lapse, routed and carved river, and strokes. History's height range is set to the data's
   first (its constants say hi 17,100 m; 4.23 is 27,000 m), which is the change smodel makes.
3. smodel.page reads and re-encodes `h` and `wl` to the same arrays, and its hydro.py is history's byte for byte.
Deterministic; about two minutes.
"""
import ast, inspect, os, sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
TOOL = os.path.dirname(HERE)
sys.path[:0] = [TOOL, os.path.join(TOOL, 'history')]
import smodel.page as P, smodel.geom as G, smodel.terrain as T, smodel.paint as PA, smodel.climate as C   # noqa: E402
import smodel.rivers as RV   # noqa: E402
import edit_heights as H, edit_422 as E422, edit_rivers as ER, edit_423 as E423   # noqa: E402

LIFTED = {  # smodel module: [(history module, [functions]), ...]
    G: [(H, ['sstep', 'poly', 'chaikin', 'meander']), (E422, ['strokes'])],
    T: [(H, ['lakes', 'ridged', 'mountains', 'hump', 'cut', 'level']), (E423, ['weather'])],
    PA: [(H, ['ramp', 'repaint', 'relight', 'paint_river']), (E422, ['retint', 'desert', 'by_climate']),
         (ER, ['inpaint', 'lake_style'])],
    C: [(H, ['reclimate']), (ER, ['lake_rain'])],
    RV: [(H, ['route_river']), (ER, ['closed_books', 'setup', 'qcells', 'trace', 'body_at', 'biggest', 'cut_channel'])],
}
CONSTS = {T: [(H, ['SPILL_SLACK']), (E423, ['WEATHER'])], PA: [(H, ['RAIN_RAMP'])],
          RV: [(ER, ['RIVER_RGB', 'BARRIER_M', 'IMPORT_KM', 'ICE_T', 'CLOSED_M', 'Q_RIVER', 'A_WADI', 'MIN_CELLS',
                     'Q_KEEP', 'BREACH_M', 'SETTLE_KM', 'TOOL_REGIONS'])]}
CHANGED = {'grid_fields', 'carve_river', 'region_mask'}
ok = 0


def check(name, cond):
    global ok
    assert cond, name
    ok += 1
    print('ok  ' + name)


def same(a, b):
    if isinstance(a, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    if isinstance(a, (list, tuple)):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    if isinstance(a, np.ndarray):
        return a.shape == b.shape and np.array_equal(a, b, equal_nan=a.dtype.kind == 'f')
    return a == b or (a != a and b != b)


def tree(f):
    t = ast.parse(inspect.getsource(f))
    return ast.dump(t.body[0], include_attributes=False)


# ---- 1. the lifted code
for mod, srcs in LIFTED.items():
    for hist, names in srcs:
        for n in names:
            check('%s.%s is %s.%s' % (mod.__name__, n, hist.__name__, n), tree(getattr(mod, n)) == tree(getattr(hist, n)))
for mod, srcs in CONSTS.items():
    for hist, names in srcs:
        for n in names:
            check('%s.%s == %s.%s' % (mod.__name__, n, hist.__name__, n), getattr(mod, n) == getattr(hist, n))
check('smodel/hydro.py is history/hydro.py', open(os.path.join(TOOL, 'smodel', 'hydro.py'), 'rb').read()
      == open(os.path.join(TOOL, 'history', 'hydro.py'), 'rb').read())

# ---- 3. the page's encodings
D = P.load()
for m in (H, ER):
    m.LO, m.HI = D['lo'], D['hi']
E, water = P.heights(D)
whas, wlev = P.water_levels(D)
h = P.raster(D, 'h').astype(np.int64)
check('heights() decodes as the 4.23 edit did', same(E, D['lo'] + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (D['hi'] - D['lo'])))
check('encode_heights() gives `h` back', same(P.raster({'h': P.encode_heights(D, E)}, 'h'), P.raster(D, 'h')))
check('encode_levels() gives `wl` back', same(P.raster({'wl': P.encode_levels(D, whas, wlev)}, 'wl'), P.raster(D, 'wl')))
check('load(page) == load(data)', P.load(os.path.join(TOOL, 'model', 'dist', 'scale-model.html')) == D)
import shutil, tempfile   # noqa: E402
with tempfile.TemporaryDirectory() as tmp:
    tmp = shutil.copytree(P.DATA_DIR, os.path.join(tmp, 'data'))
    for f in os.listdir(tmp):
        if f != 'model.json':
            os.remove(os.path.join(tmp, f))
    P.save(D, tmp)
    names = sorted(os.listdir(P.DATA_DIR))
    check('save() writes data/ back byte for byte', names == sorted(os.listdir(tmp)) and all(
        open(os.path.join(tmp, f), 'rb').read() == open(os.path.join(P.DATA_DIR, f), 'rb').read() for f in names))

# ---- 2. a test edit, run through both
R = P.docs(os.path.join(TOOL, '..', '..', 'openworld', 'north-basin', 'source', 'regions.json'))
su, sv = P.grid(D)
pts = next(r for r in R if r['name'] == 'little demo')['points']
check('region_mask', same(G.region_mask(R, 'little demo', su, sv, E.shape), E422.region_mask(R, 'little demo', su, sv, E.shape)))
En, mk = T.mountains(E, su, sv, pts, 2200.0, 600.0, 7)
check('mountains', same((En, mk), H.mountains(E, su, sv, pts, 2200.0, 600.0, 7)))
check('mountains moved ground', mk.sum() > 20)
check('relight', same(PA.relight(D, E, En), H.relight(D, E, En)))
forced = np.zeros((D['fullH'], D['fullW']), bool)
a, b = C.reclimate(D, E, En, whas, forced), H.reclimate(D, E, En, whas, forced)
check('reclimate', same(a, b))
rain0 = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
check('repaint', PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(a[0]), a[3]) == H.repaint(D, 'rt', H.ramp(rain0), H.ramp(a[0]), a[3]))
EoF, EnF = P.up(E, D['fullH'], D['fullW'], 1), P.up(En, D['fullH'], D['fullW'], 1)
st = P.raster(D, 'st')
moved = np.abs(EnF - EoF) > 1
check('retint', same(PA.retint(st, EoF, EnF, moved, ~moved, 150.0), E422.retint(st, EoF, EnF, moved, ~moved, 150.0)))
tm = P.raster(D, 'tm', 'L').astype(float) - 90
w = moved.astype(float)
check('desert', same(PA.desert(st, EnF, a[0], tm, ~moved & False, moved, w), E422.desert(st, EnF, a[0], tm, ~moved & False, moved, w)))
check('by_climate', same(PA.by_climate(st, EnF, a[0], tm, moved & False, moved, w),
                         E422.by_climate(st, EnF, a[0], tm, moved & False, moved, w)))
gf, gh = RV.grid_fields(D), ER.grid_fields(D)
check('grid_fields (with the data\'s lo/hi)', same({k: v for k, v in gf.items() if k != 'h'}, {k: v for k, v in gh.items() if k != 'h'}))
check('setup', same({k: v for k, v in RV.setup(gf).items() if k != 'bodies'}, {k: v for k, v in ER.setup(gh).items() if k != 'bodies'}))
goal = whas & (np.nan_to_num(wlev, nan=9e9) < -1000)
path = RV.route_river(En, su, sv, (330, 120), goal)
check('route_river', path == H.route_river(En, su, sv, (330, 120), goal))
check('carve_river', same(RV.carve_river(En, path, 40.0, D['lo']), H.carve_river(En, path, 40.0)))
check('strokes', all(G.strokes(r) == E422.strokes(r) for r in D['rivers'][:40]))
# the temperatures' lapse: smodel.climate.lapse against history/edit_heights.py main()'s own lines (4.19)
lap = C.lapse(D, E, En, whas, np.nan_to_num(wlev))
surf = lambda Ex, lev: np.where(whas, np.maximum(Ex, lev), Ex)
from scipy import ndimage as nd   # noqa: E402
from PIL import Image   # noqa: E402
DS = nd.zoom(surf(En, np.nan_to_num(wlev)) - surf(E, np.nan_to_num(wlev)), (D['fullH'] / E.shape[0], D['fullW'] / E.shape[1]), order=1)
for k in C.TEMPS:
    v = P.raster(D, k, 'L').astype(float) - 90
    v2 = np.where((v > -89) & (np.abs(DS) > 1), np.round(v - 6.5 * DS / 1000), v)
    ref = H.b64(Image.fromarray(np.clip(v2 + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    check('lapse ' + k, lap[k] == ref)
print('%d checks passed' % ok)
