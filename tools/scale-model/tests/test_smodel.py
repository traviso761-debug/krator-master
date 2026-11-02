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
    T: [(H, ['lakes', 'ridged', 'mountains', 'hump', 'cut', 'level'])],
    PA: [(H, ['ramp', 'repaint', 'relight', 'paint_river']), (E422, ['retint', 'desert', 'by_climate']),
         (ER, ['inpaint', 'lake_style'])],
    C: [(H, ['reclimate']), (ER, ['lake_rain'])],
    RV: [(H, ['route_river']), (ER, ['closed_books', 'setup', 'qcells', 'trace', 'body_at', 'biggest', 'cut_channel'])],
}
CONSTS = {T: [(H, ['SPILL_SLACK']), (E423, ['WEATHER'])], PA: [(H, ['RAIN_RAMP'])],
          RV: [(ER, ['RIVER_RGB', 'BARRIER_M', 'IMPORT_KM', 'ICE_T', 'CLOSED_M', 'Q_RIVER', 'A_WADI', 'MIN_CELLS',
                     'Q_KEEP', 'BREACH_M', 'SETTLE_KM', 'TOOL_REGIONS'])]}
CHANGED = {'grid_fields', 'carve_river', 'region_mask', 'weather'}
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
R = P.docs(os.path.join(TOOL, '..', '..', 'openworld', 'little-demo', 'source', 'regions.json'))
su, sv = P.grid(D)
pts = next(r for r in R if r['name'] == 'little demo')['points']
check('region_mask', same(G.region_mask(R, 'little demo', su, sv, E.shape), E422.region_mask(R, 'little demo', su, sv, E.shape)))
En, mk = T.mountains(E, su, sv, pts, 2200.0, 600.0, 7)
check('mountains', same((En, mk), H.mountains(E, su, sv, pts, 2200.0, 600.0, 7)))
check('mountains moved ground', mk.sum() > 20)
Ew = T.weather(En, mk)
check('weather', Ew.shape == En.shape and not np.array_equal(Ew, En) and np.array_equal(Ew[~mk], En[~mk]))
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
riv_start = P.legacy_px(330, 120, D) if (D['fullW'], D['fullH']) == (1821, 1723) else (330, 120)
path = RV.route_river(En, su, sv, riv_start, goal)
check('route_river', path == H.route_river(En, su, sv, riv_start, goal))
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

# ---- 4. vent peaks (every vent with `peak` and `volc` has ground within 400 m inside 12 km; 40 km for the 77-km Godthrone caldera)
for v in [D.get('volc', {})] + list(D.get('vents', [])):
    if 'peak' not in v:
        continue
    r_cells = (20.0 if float(v['peak']) >= 20000.0 else 6.0) * su
    vx, vy = v['px'][0] * su, v['px'][1] * sv
    j0, j1 = max(0, int(vy - r_cells - 1)), min(E.shape[0], int(vy + r_cells + 2))
    i0, i1 = max(0, int(vx - r_cells - 1)), min(E.shape[1], int(vx + r_cells + 2))
    yy, xx = np.mgrid[j0:j1, i0:i1]
    in_disc = np.hypot(xx - vx, yy - vy) <= r_cells
    check('vent peak near %s' % v['px'], float(E[j0:j1, i0:i1][in_disc].max()) >= float(v['peak']) - 400.0)

# ---- 5. biome stations (every station's stated `base` must be within 150 m of the ground at its `px`)
import glob as _glob, json as _json   # noqa: E402
REPO_ROOT = os.path.abspath(os.path.join(TOOL, '..', '..'))
for st_path in sorted(_glob.glob(os.path.join(REPO_ROOT, 'biomes', '**', 'station*.json'), recursive=True)):
    st_doc = _json.load(open(st_path, encoding='utf-8'))
    site = st_doc.get('site', {})
    if 'px' not in site or 'py' not in site or 'base' not in site:
        continue
    raw_px, raw_py = float(site['px']), float(site['py'])
    if '4.2' in st_doc.get('source', '') and '5.' not in st_doc.get('canvas', ''):
        raw_px, raw_py = P.legacy_px(raw_px, raw_py, D)
    spx = min(E.shape[1] - 1, max(0, int(round(raw_px * su))))
    spy = min(E.shape[0] - 1, max(0, int(round(raw_py * sv))))
    ground_m = float(E[spy, spx])
    base_m = float(site['base'])
    rel_st = os.path.relpath(st_path, REPO_ROOT).replace('\\', '/')
    check('station base within 150 m: %s (stated %.0f m vs ground %.0f m)' % (rel_st, base_m, ground_m),
          abs(ground_m - base_m) <= 150.0)

# ---- 6. river descent (no river climbs > 50 m along its course on the map grid, and `bed_m` is monotonically non-increasing)
max_riv_climb = 0.0
worst_riv = None
bad_bed_rivs = []
for r in D.get('rivers', []):
    b_m = r.get('bed_m') or []
    if any(b2 > b1 + 1e-6 for b1, b2 in zip(b_m, b_m[1:])):
        bad_bed_rivs.append(r.get('id'))
    pts_r = r.get('px') or []
    if len(pts_r) < 2:
        continue
    es_r = [
        float(E[min(E.shape[0] - 1, max(0, int(round(py_r * sv)))), min(E.shape[1] - 1, max(0, int(round(px_r * su))))])
        for px_r, py_r in pts_r
    ]
    m_e = es_r[0]
    for e_v in es_r:
        if e_v < m_e:
            m_e = e_v
        if e_v - m_e > max_riv_climb:
            max_riv_climb = e_v - m_e
            worst_riv = r.get('id')
check('all river bed_m profiles descend monotonically', len(bad_bed_rivs) == 0)
check('all rivers descend along course (max climb %.1f m <= 50 m, worst=%s)' % (max_riv_climb, worst_riv),
      max_riv_climb <= 50.0)

# ---- 7. river name stability (r002 is Līng-Mā, and rerouting/reordering rivers never changes unrelated river names)
import copy as _copy   # noqa: E402
from smodel import river_names as RN   # noqa: E402
r002_entry = next((r for r in D.get('rivers', []) if str(r.get('id')) in ('2', 'r002')), None)
check('r002 is named Ling-Ma', r002_entry is not None and r002_entry.get('name') == 'L\u012bng-M\u0101')
regs_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json')
setts_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'settlements.json')
if os.path.exists(regs_path) and os.path.exists(setts_path):
    regs_doc = _json.load(open(regs_path, encoding='utf-8'))
    setts_doc = _json.load(open(setts_path, encoding='utf-8'))
    r_orig = _copy.deepcopy(D['rivers'])
    r_pert = _copy.deepcopy(D['rivers'])
    for r_p in r_pert[::5]:
        if r_p.get('px'):
            r_p['px'] = [[p[0] + 3.0, p[1] - 2.0] for p in r_p['px']]
        r_p['length_km'] = float(r_p.get('length_km') or 50.0) + 77.0
    r_pert.reverse()
    RN.rename_all_rivers_culturally(r_orig, regs_doc, setts_doc)
    RN.rename_all_rivers_culturally(r_pert, regs_doc, setts_doc)
    map_orig = {str(r['id']): (r['name'], r['tongue']) for r in r_orig}
    map_pert = {str(r['id']): (r['name'], r['tongue']) for r in r_pert}
    check('river names invariant under course/order perturbation', map_orig == map_pert)

# ---- 8. Ancient's Valley 7 blast basins & 17 m lake (Round 3 Item 2)
anc_basins_test = [
    (476.0, 915.0, 6.0, 'dry'),
    (398.0, 966.0, 5.5, 'dry'),
    (450.0, 896.0, 5.0, 'dry'),
    (406.0, 908.0, 6.5, 'dry'),
    (428.0, 948.0, 7.5, 'drowned'),
    (460.0, 962.0, 7.0, 'drowned'),
    (420.0, 984.0, 6.5, 'half'),
]
yy_e, xx_e = np.mgrid[0:E.shape[0], 0:E.shape[1]]
for bx_t, by_t, r_km_t, mode_t in anc_basins_test:
    cx_e = bx_t * su
    cy_e = by_t * sv
    r_e = (r_km_t / 2.0) * su
    dist_e = np.hypot(xx_e - cx_e, yy_e - cy_e)
    icx, icy = int(round(cx_e)), int(round(cy_e))
    centre_h = float(E[icy, icx])
    rim_h = float(np.median(E[(dist_e >= 0.80 * r_e) & (dist_e <= 1.45 * r_e)]))
    check('blast basin (%.0f, %.0f) depression (rim %.1f m vs centre %.1f m)' % (bx_t, by_t, rim_h, centre_h),
          (rim_h - centre_h) >= 45.0)
    if mode_t == 'dry':
        check('dry blast basin (%.0f, %.0f) is dry' % (bx_t, by_t), not bool(whas[icy, icx]))
    elif mode_t == 'drowned':
        check('drowned blast basin (%.0f, %.0f) is in 17.4 m lake with shallow bed' % (bx_t, by_t),
              bool(whas[icy, icx]) and abs(float(wlev[icy, icx]) - 17.4) <= 1.0 and centre_h >= -80.0)

# ---- 9. Southern Inner Wall scarp & Spirladunon (Round 3 Item 3)
spirl_h = float(E[int(round(1017.0 * sv)), int(round(800.0 * su))])
check('Spirladunon (800, 1017) preserved near 1,398 m (got %.1f m)' % spirl_h, 1300.0 <= spirl_h <= 1500.0)
scarp_steps = []
for x_sc in range(750, 926, 5):
    if 795 <= x_sc <= 805:
        continue
    col_sc = [float(E[int(round(y_sc * sv)), int(round(x_sc * su))]) for y_sc in range(1022, 1061)]
    y_foot = max([i for i, h_v in enumerate(col_sc) if h_v < 500.0], default=-1)
    y_crest = min([i for i, h_v in enumerate(col_sc) if h_v > 3000.0], default=99)
    scarp_steps.append(y_crest - y_foot)
check('Southern Inner Wall scarp steps <500 m to >3,000 m in <= 6 px (max=%d px)' % max(scarp_steps),
      all(1 <= s_px <= 6 for s_px in scarp_steps))
print('%d checks passed' % ok)
