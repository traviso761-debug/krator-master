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
R = P.regions()
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
# the page's own defaults (openworld/little-demo/source, their old copy, was retired to archive/ in 5be246474)
regs_doc, setts_doc = P.regions(), P.settlements()
check('the page holds its regions and settlements (%d, %d)' % (len(regs_doc), len(setts_doc)), len(regs_doc) > 100 and len(setts_doc) > 100)
if True:
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

# ---- 9. Southern Inner Wall scarp & Spirladunon (Round 3 Item 3) + Neo-Ozarks tube location
spirl_h = float(E[int(round(1017.0 * sv)), int(round(800.0 * su))])
check('Spirladunon (800, 1017) preserved near 1,398 m (got %.1f m)' % spirl_h, 1300.0 <= spirl_h <= 1500.0)
scarp_steps = []
for x_sc in list(range(750, 791, 5)) + list(range(840, 926, 5)):
    col_sc = [float(E[int(round(y_sc * sv)), int(round(x_sc * su))]) for y_sc in range(980, 1064)]
    y_foot = max([i for i, h_v in enumerate(col_sc) if h_v < 500.0], default=-1)
    y_crest = min([i for i, h_v in enumerate(col_sc) if h_v > 3000.0], default=99)
    scarp_steps.append(y_crest - y_foot)
check('Southern Inner Wall scarp steps <500 m to >3,000 m in <= 6 px (max=%d px)' % max(scarp_steps),
      all(1 <= s_px <= 6 for s_px in scarp_steps))
oz_tube = next((t for t in D.get('tubes', []) if t.get('id') == 'tube_ozarks_15'), None)
check('tube_ozarks_15 sits inside neo-ozarks (X=1109..1318, Y=107..231)',
      bool(oz_tube) and all(1109 <= p[0] <= 1318 and 107 <= p[1] <= 231 for p in oz_tube['px']))

# ---- 10. Great Chasm & Godshearth reshaped terrain and stations
for st_name, sx, sy, target_h in [
    ('greatchasm/firefissure', 1692, 895, -1180.0),
    ('greatchasm/dikecathedral', 1708, 935, 1640.0),
    ('greatchasm/rimepalisade', 1726, 888, 6850.0),
    ('greatchasm/loomthroat', 1698, 1008, 280.0),
    ('godshearth/climaxgrove', 836, 1388, 3740.0),
    ('godshearth/prismbasin', 844, 1394, 3642.0),
    ('godshearth/amberheadwall', 848, 1375, 4120.0),
    ('godshearth/xanaduspill', 845, 1422, 3380.0),
    ('seouterwall/godsgate', 1031, 1252, 3620.0),
    ('seouterwall/gatetarn', 1016, 1236, 3680.0),
    ('seouterwall/ambertarn', 1064, 1272, 3940.0),
    ('seouterwall/mirrorscarp', 1134, 1218, 4120.0),
    ('seouterwall/jadecrest', 1208, 1254, 4380.0),
    ('seouterwall/coppertarn', 1288, 1184, 3820.0),
    ('twins/pyroduct', 980, 1467, 4240.0),
    ('twins/brazier', 1016, 1479, 4680.0),
    ('twins/lavasump', 992, 1465, 4890.0),
    ('twins/shroudvale', 968, 1442, 4720.0),
    ('twins/erebustwin', 1042, 1498, 5420.0),
    ('twins/catchlookout', 1056, 1462, 3690.0),
    ('opalvalley/glacier', 1124, 1676, 4150.0),
    ('opalvalley/upperbed', 1082, 1672, 2540.0),
    ('opalvalley/middlebed', 1038, 1662, 1340.0),
    ('opalvalley/lowerbed', 998, 1646, 275.0),
    ('opalvalley/riftmouth', 972, 1636, 60.0),
]:
    map_h = float(E[int(round(sy * sv)), int(round(sx * su))])
    check('%s (%d, %d) ground %.0f m within 150 m of %.0f m' % (st_name, sx, sy, map_h, target_h),
          abs(map_h - target_h) <= 150.0)
check('Godshearth thermal lake at (840, 1394) is wet at 3,642 m',
      bool(whas[int(round(1394 * sv)), int(round(840 * su))])
      and abs(float(wlev[int(round(1394 * sv)), int(round(840 * su))]) - 3642.0) <= 2.0)
for t_name, tx, ty, twl in [
    ('Tarn of the Gate-Bell', 1013, 1236, 3680.0),
    ('Amber-Sinter Tarn', 1061, 1272, 3940.0),
    ('Mirror-Slump Tarn', 1131, 1218, 4120.0),
    ('Jade-Karst Polje', 1205, 1254, 4380.0),
    ('Copper-Vein Tarn', 1285, 1184, 3820.0),
    ('Opal Valley Lake 1 (Milk-Opal Ribbon Tarn)', 1074, 1670, 2525.0),
    ('Opal Valley Lake 2 (Harlequin Mirror Ribbon Lake)', 1028, 1658, 1315.0),
    ('Opal Valley Lake 3 (Fire-Opal Ribbon Lagoon)', 989, 1643, 255.0),
]:
    iy_t, ix_t = int(round(ty * sv)), int(round(tx * su))
    check('%s (%d, %d) is wet at %.0f m' % (t_name, tx, ty, twl),
          bool(whas[iy_t, ix_t]) and abs(float(wlev[iy_t, ix_t]) - twl) <= 2.0)
for vx_tw, vy_tw, vfl_tw, vpk_tw in [
    (988.0, 1458.0, 5980.0, 6480.0),
    (1042.0, 1498.0, 5420.0, 5880.0),
    (1007.0, 1472.0, 4680.0, 4840.0),
    (1024.0, 1485.0, 4460.0, 4610.0),
]:
    v_rec = next((v for v in D.get('vents', []) if abs(v['px'][0] - vx_tw) < 2.0 and abs(v['px'][1] - vy_tw) < 2.0), None)
    check('Twins Option A vent at (%.0f, %.0f) has floor=%.0f m, peak=%.0f m' % (vx_tw, vy_tw, vfl_tw, vpk_tw),
          v_rec is not None and abs(float(v_rec.get('floor', 0)) - vfl_tw) <= 1.0 and abs(float(v_rec.get('peak', 0)) - vpk_tw) <= 1.0)

# ---- 11. Twins no bull's-eye moat, taller SE Outer Wall, gradual North Great Chasm, and lush Green Valley
yy_all, xx_all = np.mgrid[0:E.shape[0], 0:E.shape[1]]
for tw_nm, tw_x, tw_y in [('NW Twin', 988.0, 1458.0), ('SE Twin', 1042.0, 1498.0)]:
    r_tw = np.hypot(xx_all - tw_x, yy_all - tw_y)
    med_r3_6 = float(np.median(E[(r_tw >= 3.0) & (r_tw <= 6.0)]))
    med_r8_13 = float(np.median(E[(r_tw >= 8.0) & (r_tw <= 13.0)]))
    med_r15_20 = float(np.median(E[(r_tw >= 15.0) & (r_tw <= 20.0)]))
    check('%s (%d, %d) has monotonic radial slope with no bullseye moat (r3..6=%.0fm > r8..13=%.0fm >= r15..20=%.0fm - 150m)' % (
        tw_nm, tw_x, tw_y, med_r3_6, med_r8_13, med_r15_20),
        med_r3_6 > med_r8_13 and med_r8_13 >= med_r15_20 - 150.0 and med_r8_13 >= 3900.0)

seow_east_med = float(np.median(E[1190:1320, 1230:1345]))
seow_east_max = float(np.max(E[1180:1340, 1210:1350]))
check('SE Outer Wall eastern cordillera (X=1230..1345, Y=1190..1320) meets Stalker Range height (med=%.0fm >= 6800m, max=%.0fm >= 9200m)' % (
    seow_east_med, seow_east_max),
    seow_east_med >= 6800.0 and seow_east_max >= 9200.0)

gc_north_y790 = float(E[790, 1671])
gc_north_y825 = float(E[825, 1668])
gc_north_y860 = float(E[860, 1660])
check('Great Chasm northern slope towards S Outlands is gradual (Y=790:%.0fm > Y=825:%.0fm > Y=860:%.0fm)' % (
    gc_north_y790, gc_north_y825, gc_north_y860),
    1500.0 <= gc_north_y790 <= 4900.0 and 200.0 <= gc_north_y825 <= 2400.0 and gc_north_y790 > gc_north_y825 > gc_north_y860)

gv_reg = next((r for r in R if r.get('id') == 'rmw5n1w1rx0u2'), None)
check('Greenstep region rmw5n1w1rx0u2 is present in regions', gv_reg is not None and gv_reg.get('name') == 'Greenstep')
for pol_id, pol_nm, pol_npts in [
    ('rmw5ruqmv60t3', 'Realm of Dalab', 36),
    ('rmw5rzefnfapk', 'Vothic Kingdom', 51),
    ('rmw5s3ktxgv0d', 'Shumar', 8),
    ('rmw5sayxeskra', 'Vrivolci', 16),
    ('rmw8ca6baau47', 'Yuni Emirate', 38),
    ('rmw8bqrn3dnx4', 'Labyrinth', 13),
    ('rmw8hj62nmugn', 'Firebliss Range', 12),
]:
    pol_reg = next((r for r in R if r.get('id') == pol_id), None)
    check('Reworked/new region %s (%s, %d pts) is present in regions' % (pol_nm, pol_id, pol_npts),
          pol_reg is not None and pol_reg.get('name') == pol_nm and len(pol_reg.get('points', [])) == pol_npts)
check('Superseded political region IDs (rmudhwjkmjc1e, rmufwoc7586da, rmuooahhlhlnu, rmukx7n441l62, rmvyl36gozner) are removed',
      not any(r.get('id') in {'rmudhwjkmjc1e', 'rmufwoc7586da', 'rmuooahhlhlnu', 'rmukx7n441l62', 'rmvyl36gozner'} for r in R))
S = P.settlements()
tw_sett = next((s for s in S if s.get('id') == 'stallwalls01' or s.get('name') == 'Tallwalls'), None)
check('Tallwalls settlement stallwalls01 is present at (650, 1268)', tw_sett is not None and (int(tw_sett['px']), int(tw_sett['py'])) == (650, 1268))
gv_t1_e = float(E[1212, 638])
gv_t2_e = float(E[1242, 644])
gv_t3_e = float(E[1268, 650])
gv_t4_e = float(E[1304, 662])
gv_t5_e = float(E[1338, 668])
p_grid = P.raster(D, 'p', 'L').astype(float) / 255.0 * 4000.0
gv_rain_med = float(np.median(p_grid[1210:1335, 615:675]))
check('Greenstep has 5 stepped lava terraces (T1:%.0fm < T2:%.0fm < T3/Tallwalls:%.0fm < T4:%.0fm < T5:%.0fm <= 3900m) and C.reclimate rain (med=%.0f mm/yr >= 1100 mm/yr)' % (
    gv_t1_e, gv_t2_e, gv_t3_e, gv_t4_e, gv_t5_e, gv_rain_med),
    750.0 <= gv_t1_e < gv_t2_e < gv_t3_e < gv_t4_e < gv_t5_e <= 3900.0 and gv_rain_med >= 1100.0)
shumar_reg = next((r for r in R if r.get('id') == 'rmw5s3ktxgv0d'), None)
mask_sh_test = G.poly(shumar_reg['points'], 1.0, 1.0, (D['fullH'], D['fullW'])) > 0.5
c_grid_test = P.raster(D, 'c', 'L')[mask_sh_test]
codes_test = [c['code'] for c in D['climate']['classes']]
sh_d_frac = float(sum(1 for k in c_grid_test if codes_test[int(k)].startswith('D'))) / float(max(1, len(c_grid_test)))
sh_e_med = float(np.median(E[mask_sh_test]))
check('Shumar (rmw5s3ktxgv0d) has primarily Continental/Boreal (D*) climate (%.1f%% >= 65%%, med elev %.0fm)' % (sh_d_frac * 100.0, sh_e_med),
      sh_d_frac >= 0.65 and 2600.0 <= sh_e_med <= 3900.0)
shumari_rivs = [r for r in D.get('rivers', []) if r.get('tongue') == 'shumari']
check('Shumari rivers are present in Shumar (%d courses >= 10)' % len(shumari_rivs), len(shumari_rivs) >= 10)
c_grid_full = P.raster(D, 'c', 'L')
catch_reg = next((r for r in R if r.get('id') == 'rmvka7icdn1dq'), None)
mask_catch_test = G.poly(catch_reg['points'], 1.0, 1.0, (D['fullH'], D['fullW'])) > 0.5
catch_floor_mask = mask_catch_test & (E < 1000.0)
catch_floor_px = int(np.sum(catch_floor_mask))
catch_bw_frac = float(sum(1 for k in c_grid_full[catch_floor_mask] if codes_test[int(k)].startswith('BW'))) / float(max(1, catch_floor_px))
check('The Catch (rmvka7icdn1dq) restores <1000m alkali desert floor (%d px >= 6200 px, %.1f%% BW* >= 75%%)' % (
    catch_floor_px, catch_bw_frac * 100.0),
    catch_floor_px >= 6200 and catch_bw_frac >= 0.75)
lab_reg = next((r for r in R if r.get('id') == 'rmw8bqrn3dnx4'), None)
mask_lab_test = G.poly(lab_reg['points'], 1.0, 1.0, (D['fullH'], D['fullW'])) > 0.5
lab_e_vals = E[mask_lab_test]
lab_p10, lab_p90 = float(np.percentile(lab_e_vals, 10)), float(np.percentile(lab_e_vals, 90))
w_edge_med = float(np.median(E[1360:1660, 0:45]))
s_edge_med = float(np.median(E[1688:1723, 90:380]))
check('Labyrinth (rmw8bqrn3dnx4) has Noctis/Chaos inversion relief (p10=%.0fm <= 2800m, p90=%.0fm >= 4600m) while outer W/S map edges remain airless (W=%.0fm, S=%.0fm >= 8800m)' % (
    lab_p10, lab_p90, w_edge_med, s_edge_med),
    lab_p10 <= 2800.0 and lab_p90 >= 4600.0 and (lab_p90 - lab_p10) >= 2100.0 and w_edge_med >= 8800.0 and s_edge_med >= 8800.0)
for lb_lk_nm, lb_x, lb_y, lb_wl in [
    ('Labyrinth Lake 1 (NW Catena Tarn)', 148, 1468, 2920.0),
    ('Labyrinth Lake 2 (SW Catena Tarn)', 176, 1564, 2840.0),
    ('Labyrinth Lake 3 (North Graben Ribbon Lake)', 234, 1424, 1980.0),
    ('Labyrinth Lake 4 (Central Hub Ribbon Lake)', 244, 1482, 1820.0),
    ('Labyrinth Lake 5 (South Graben Ribbon Lake)', 248, 1556, 1920.0),
    ('Labyrinth Lake 6 (North Chaos Moat Lake)', 284, 1418, 1720.0),
    ('Labyrinth Lake 7 (Great Chaos Moat Lake)', 328, 1475, 1420.0),
    ('Labyrinth Lake 8 (South Chaos Trough Lake)', 312, 1518, 1580.0),
]:
    check('%s (%d, %d) is wet at %.0f m' % (lb_lk_nm, lb_x, lb_y, lb_wl),
          bool(whas[lb_y, lb_x]) and abs(float(wlev[lb_y, lb_x]) - lb_wl) <= 2.0)
r295_rec = next((r for r in D.get('rivers', []) if str(r.get('id')) in ('295', 'r295')), None)
r020_rec = next((r for r in D.get('rivers', []) if str(r.get('id')) in ('20', 'r020')), None)
r331_rec = next((r for r in D.get('rivers', []) if str(r.get('id')) in ('331', 'r331')), None)
check('r295 and r020 stay outside Labyrinth on NE mountain range while r331 drains Labyrinth through single Eastern Opening',
      r295_rec is not None and not any(mask_lab_test[int(round(py)), int(round(px))] for px, py in r295_rec['px'])
      and r020_rec is not None and not any(mask_lab_test[int(round(py)), int(round(px))] for px, py in r020_rec['px'])
      and r331_rec is not None and any(mask_lab_test[int(round(py)), int(round(px))] for px, py in r331_rec['px']))
lab_c_codes = {codes_test[int(k)] for k in c_grid_full[mask_lab_test]}
check('Labyrinth has rich microclimate mosaic (%d classes >= 7: %s)' % (len(lab_c_codes), sorted(lab_c_codes)),
      len(lab_c_codes) >= 7 and 'WH' in lab_c_codes and bool(lab_c_codes & {'BWk', 'BSk'}) and bool(lab_c_codes & {'Csb', 'Cfb'}) and bool(lab_c_codes & {'Dsb', 'Dfb', 'Dsc', 'Dfc'}))

# ---- 12. Xanadu one lake-valley (Erewhon's), Theodiga tall cataract, Small Lake, Oidong eastern cataract, low cataracts to Lizardman lake, Rift relief, & climate detail
# (5.1 edit 7, edit_517.py: the caldera lake round 845,1504, an island in its middle; Erehwon's bench is 841,1517)
check('Erewhon Lake (841, 1516) is wet at -520 m and Erehwon\'s bench (841, 1517) is dry at ~ -497 m',
      bool(whas[1516, 841]) and abs(float(wlev[1516, 841]) - (-520.0)) <= 2.0
      and not bool(whas[1517, 841]) and -515.0 <= float(E[1517, 841]) <= -450.0)
check('Theodiga (908, 1535) is on dry broken-dam brink at ~ -495 m above Erewhon Lake (-520 m)',
      not bool(whas[1535, 908]) and -515.0 <= float(E[1535, 908]) <= -460.0)
s_horst_max = float(np.max(E[1538:1564, 795:895]))
check('Xanadu Southern Rift Horst Spine (X=795..895, Y=1538..1564) rises cleanly between Erewhon Lake (-520 m) and Lizardman Rift (-2,600 m) (max=%.0f m >= +600 m)' % s_horst_max,
      s_horst_max >= 600.0)
small_lk_px = int(np.sum(whas[1578:1635, 910:995] & (np.abs(np.nan_to_num(wlev[1578:1635, 910:995], nan=0.0) - (-1685.0)) <= 5.0)))
dry_below_slk = int(np.sum((~whas[1574:1636, 932:995]) & (E[1574:1636, 932:995] < -2050.0)))
e_brink_oid = float(E[1598, 1001])
wlev_foot_oid = float(wlev[1597, 989])
check('Lower Xanadu Extended Small Lake (933..990, 1597) is wet at -1,685 m (%d px in 450..1200 px), receives >2 km cataract from Longsong/Oidong river right into eastern shore (brink %.0f m -> lake %.0f m, drop %.0f m >= 2000 m), and has 0 dry basin cells at old -2,599 m floor (got %d)' % (
    small_lk_px, e_brink_oid, wlev_foot_oid, e_brink_oid - wlev_foot_oid, dry_below_slk),
    bool(whas[1597, 947]) and bool(whas[1597, 989]) and abs(wlev_foot_oid - (-1685.0)) <= 2.0
    and (e_brink_oid - wlev_foot_oid) >= 2000.0
    and 450 <= small_lk_px <= 1200 and dry_below_slk == 0 and not bool(whas[1536, 968]) and not bool(whas[1595, 1060]))
for xn_rid in ('70', '107', 'r_xanadu_low_cataracts'):
    r_xn = next((r for r in D.get('rivers', []) if str(r.get('id')) == xn_rid or (str(r.get('id')) == 'r070' and xn_rid == '70') or (str(r.get('id')) == 'r107' and xn_rid == '107')), None)
    check('Xanadu cataract/outflow river %s is present, sinuous (>= 12 pts), and descends monotonically' % xn_rid,
          r_xn is not None and len(r_xn.get('px', [])) >= 12 and r_xn['bed_m'][0] > r_xn['bed_m'][-1])
xan_reg = next((r for r in R if r.get('id') == 'rmvkkmitffbjk'), None)
mask_xan_test = G.poly(xan_reg['points'], 1.0, 1.0, (D['fullH'], D['fullW'])) > 0.5
xan_c_codes = {codes_test[int(k)] for k in c_grid_full[mask_xan_test]}
check('Xanadu (rmvkkmitffbjk) has fine-scale Rift microclimate mosaic (%d classes >= 6: %s)' % (len(xan_c_codes), sorted(xan_c_codes)),
      len(xan_c_codes) >= 6 and {'WH', 'Af', 'Cfa', 'Csb', 'Cfb'} <= xan_c_codes)

# ---- 13. Firebliss Range (rmw8hj62nmugn) volcanic arc, 4 temperate geothermal valleys, & SE ash/vapor plume into Labyrinth
fb_reg = next((r for r in R if r.get('id') == 'rmw8hj62nmugn'), None)
mask_fb_test = G.poly(fb_reg['points'], 1.0, 1.0, (D['fullH'], D['fullW'])) > 0.5
fb_c_codes = {codes_test[int(k)] for k in c_grid_full[mask_fb_test]}
fb_vents = [v for v in D.get('vents', []) if v.get('region') == 'Firebliss Range']
check('Firebliss Range (rmw8hj62nmugn) has 5 volcanic vents (%d) and sheltered temperate geothermal valleys (classes: %s)' % (
    len(fb_vents), sorted(fb_c_codes)),
    len(fb_vents) == 5 and 'WH' in fb_c_codes and bool(fb_c_codes & {'Cfa', 'Cfb', 'Csb'}) and 'EF' in fb_c_codes)
for fb_lk_nm, fb_x, fb_y, fb_wl in [
    ('West Bliss Cauldron Tarn', 126, 1344, 2640.0),
    ('Great Firebliss Vale Lake', 184, 1318, 2280.0),
    ('Solfatara Glen Tarn', 238, 1322, 2120.0),
    ('East Bliss Vale Tarn', 284, 1318, 1960.0),
]:
    check('Firebliss geothermal lake %s (%d, %d) is wet at %.0f m' % (fb_lk_nm, fb_x, fb_y, fb_wl),
          bool(whas[fb_y, fb_x]) and abs(float(wlev[fb_y, fb_x]) - fb_wl) <= 2.0)
# ---- 14. 5.1 edit 1 (edit_511.py, 2026-11-09): the Portal Valley and the Epidote Cave, the brine lake, Godshearth's
#          climate, The Gate and Region 99
pv = {295: 5530.0, 298: 5750.0, 300: 5850.0, 302: 5900.0}
for pv_y, pv_f in pv.items():
    pv_x = int(round(1330 + (pv_y - 295) / 7.0))
    check('Portal Valley floor (%d, %d) %.0f m within 40 m of %.0f m' % (pv_x, pv_y, E[pv_y, pv_x], pv_f),
          abs(float(E[pv_y, pv_x]) - pv_f) <= 40.0)
pv_line = [float(E[y, int(round(1330 + (y - 295) / 7.0))]) for y in range(295, 303)]
check('Portal Valley floor climbs steadily south to the portal (%s)' % [round(v) for v in pv_line],
      all(b > a for a, b in zip(pv_line, pv_line[1:])) and max(pv_line) <= 5950.0)
check('Portal Valley is a trough: its walls stand 400 m over the floor at y 300-302',
      all(min(float(E[y, int(round(1330 + (y - 295) / 7.0)) - 3]), float(E[y, int(round(1330 + (y - 295) / 7.0)) + 3]))
          - float(E[y, int(round(1330 + (y - 295) / 7.0))]) >= 400.0 for y in (300, 301, 302)))
ep = next((t for t in D['tubes'] if t['id'] == 'tube_epidote_16'), None)
check('tube_epidote_16 (Epidote Cave) runs from the portal 1331,302 to the inner mouth 1340,336 in rmvymakpc0pft',
      ep is not None and ep['px'][0] == [1331.0, 302.0] and ep['px'][-1] == [1340.0, 336.0]
      and ep['region'] == 'rmvymakpc0pft' and ep['rock'] == 'skarn_marble' and ep['km'] == 71)
yy_b, xx_b = np.mgrid[0:E.shape[0], 0:E.shape[1]]
bl = np.hypot(xx_b - 876, yy_b - 1440) <= 3.0
check('brine lake at 876,1440: 29 cells wet at 6,420 m',
      int(bl.sum()) == 29 and bool(whas[bl].all()) and float(np.abs(wlev[bl] - 6420.0).max()) <= 2.0)
bl_ring = (np.hypot(xx_b - 876, yy_b - 1440) > 3.0) & (np.hypot(xx_b - 876, yy_b - 1440) <= 4.5)
check('brine lake is closed: its lip holds 6.7 km all round (min %.0f m)' % float(E[bl_ring].min()),
      float(E[bl_ring].min()) >= 6700.0 and not bool(whas[bl_ring].any()))
r442_t = next(r for r in D['rivers'] if r['id'] == 'r442')
check('r442 (the bloodfalls) still rises at 864.8,1439.6, 5,318 m, 22 km below the lake',
      r442_t['px'][0] == [864.8, 1439.6] and r442_t['source_m'] == 5318.0)
check('the brine lake\'s basin record is at 876,1440 (6,420 m), the stale one at 842.7,1397.5 gone',
      any(b['at_px'] == [876.0, 1440.0] and b['level_m'] == 6420 for b in D['basins'])
      and not any(abs(b['at_px'][0] - 842.7) < .5 and abs(b['at_px'][1] - 1397.5) < .5 for b in D['basins']))
cav_bt = next(c for t in D['tubes'] for c in t.get('caverns', []) if c['id'] == 'cav_god_brine_throat')
check('cav_god_brine_throat no longer says 6,415 m under the ice', '6,415' not in cav_bt['notes'])
gh_reg = next(r for r in R if r.get('id') == 'rmw4wou2y1hhc')
gh_m = G.poly(gh_reg['points'], 1.0, 1.0, E.shape)
temps_t = {k: P.raster(D, k, 'L').astype(float) - 90 for k in ('tm', 'tw', 'tc', 'th', 'tl')}
gh_floor = gh_m & ~whas & (E > 3640) & (E < 3760)
gh_med = {k: float(np.median(v[gh_floor])) for k, v in temps_t.items()}
check('Godshearth floor: +7 C (15 / -2), days 24, nights -10 or colder (%s)' % {k: round(v) for k, v in gh_med.items()},
      abs(gh_med['tm'] - 7) <= 1 and abs(gh_med['tw'] - 15) <= 1 and abs(gh_med['tc'] + 2) <= 1
      and abs(gh_med['th'] - 24) <= 1 and gh_med['tl'] <= -10)
gh_hi = gh_m & ~whas & (np.abs(E - 4500) < 150)
check('Godshearth cools with height (4.5 km: %.0f C vs the floor\'s %.0f C)' % (np.median(temps_t['tm'][gh_hi]), gh_med['tm']),
      float(np.median(temps_t['tm'][gh_hi])) <= gh_med['tm'] - 4)
gh_cls = [codes_test[int(k)] for k in c_grid_full[gh_floor]]
# the cold month crosses Koppen's -3 C at about 3,720 m: the floor's upper edge (3.72-3.76 km) is Dwb
check('Godshearth floor is mostly Cwb, the rest Dwb (%.0f%% Cwb)' % (100.0 * gh_cls.count('Cwb') / len(gh_cls)),
      gh_cls.count('Cwb') / len(gh_cls) >= .6 and gh_cls.count('Cwb') + gh_cls.count('Dwb') == len(gh_cls))
s_src = open(os.path.join(TOOL, 'model', 'src', '60-settlements.js'), encoding='utf-8').read()
check('The Gate (sthegate) stands at the Narrows, 1438,326 (ground %.0f m)' % E[326, 1438],
      '"id": "sthegate", "name": "The Gate", "type": "outpost", "px": 1438, "py": 326' in s_src
      and abs(float(E[326, 1438]) - 1423.0) <= 50.0)
r99_t = next(r for r in R if r.get('id') == 'rmvraoas90co7')
gc_t = next(r for r in R if r.get('id') == 'rmw4vh9t20da4')
m99_t, mgc_t = G.poly(r99_t['points'], 1.0, 1.0, E.shape), G.poly(gc_t['points'], 1.0, 1.0, E.shape)
check('the Great Chasm\'s sill (1697,1028) is the Great Chasm\'s, not Region 99\'s; overlap %d edge cells' % int((m99_t & mgc_t).sum()),
      bool(mgc_t[1028, 1697]) and not bool(m99_t[1028, 1697]) and int((m99_t & mgc_t).sum()) <= 80)
# ---- 15. 5.1 edit 2 (edit_512.py, 2026-11-09): Godshearth's vent records (biomes/godshearth/PLAN.md section 8, model amendment 1)
gh_v = [v for v in D['vents'] if v.get('region') == 'rmw4wou2y1hhc']
check('Godshearth has its six vent records, kinds spring, geyser and fumarole (%d: %s)' % (len(gh_v), sorted({v.get('kind') for v in gh_v})),
      len(gh_v) == 6 and {v.get('kind') for v in gh_v} == {'spring', 'geyser', 'fumarole'})
gh_bad = [v['name'] for v in gh_v if not all(gh_m[int(round(p[1])), int(round(p[0]))] for p in (v.get('line') or [v['px']]))]
check('every Godshearth vent (and every point of its line) inside the caldera\'s polygon%s' % (': ' + ', '.join(gh_bad) if gh_bad else ''), not gh_bad)
gh_fl = [(v['name'], v['floor'], float(E[int(round(v['px'][1])), int(round(v['px'][0]))])) for v in gh_v]
check('every Godshearth vent\'s floor is the ground under it, within 60 m (%s)' % ', '.join('%.0f/%.0f' % (f, e) for _, f, e in gh_fl),
      all(abs(f - e) <= 60 for _, f, e in gh_fl))
check('every Godshearth vent carries T (60-100 C) and reach_m', all(60 <= v.get('T', 0) <= 100 and v.get('reach_m', 0) > 0 for v in gh_v))
v_src = open(os.path.join(TOOL, 'model', 'src', '30-vents.js'), encoding='utf-8').read()
check('the model draws fumaroles and springs as steam (30-vents.js)', "v.kind==='fumarole'" in v_src and "v.kind==='spring'" in v_src)
# ---- 16. 5.1 edit 3 (edit_513.py, 2026-11-09): Copper Glacier trimmed to the Firebliss Range, the Firebliss rivers
#          rerouted and carved, th and tl, the Firebliss vent records
import re as _re   # noqa: E402
defregs = _json.loads(_re.search(r'const defRegs = (\[.*?\]);\n', open(os.path.join(TOOL, 'model', 'src', '51-region-store.js'),
                                                                        encoding='utf-8').read(), _re.S).group(1))
cg_t = next(r for r in defregs if r['id'] == 'rmvcopperglacier')
fb_t = next(r for r in defregs if r['id'] == 'rmw8hj62nmugn')
mcg_t, mfb_t = G.poly(cg_t['points'], 1.0, 1.0, E.shape) > .5, G.poly(fb_t['points'], 1.0, 1.0, E.shape) > .5
check('Copper Glacier and Firebliss share only their edge (%d cells); the cones and valleys are Firebliss\'s' % int((mcg_t & mfb_t).sum()),
      int((mcg_t & mfb_t).sum()) <= 150 and all(not mcg_t[y, x] and mfb_t[y, x] for x, y in
                                                ((104, 1304), (148, 1292), (206, 1284), (126, 1344), (184, 1318)))
      and bool(mcg_t[1148, 148]) and fb_t['notes'] != '')
lab_t, _ = nd.label(whas, structure=np.ones((3, 3)))
riv_t = {r['id']: r for r in D['rivers']}
for rid_t, lake_t in (('r_fb_west', (125, 1343)), ('r_fb_central', (184, 1318)), ('r_fb_east', (284, 1318))):
    r_t = riv_t[rid_t]
    lv_t = float(np.nanmedian(wlev[lab_t == lab_t[lake_t[1], lake_t[0]]]))
    # the record keeps every cell of its course, each a step (8-neighbour) from the last
    cells_t = [(int(y_), int(x_)) for x_, y_ in r_t['px']]
    check('%s: every vertex a cell, each a neighbour of the last (or across a lake)' % r_t['name'], all(
        max(abs(a_[0] - b_[0]), abs(a_[1] - b_[1])) == 1 or (whas[a_] and whas[b_] and lab_t[a_] == lab_t[b_])
        for a_, b_ in zip(cells_t[:-1], cells_t[1:])))
    dry_t = [float(E[c]) for c in cells_t if not whas[c]]
    climb_t = max([0.0] + [b - min(dry_t[:k + 1]) for k, b in enumerate(dry_t)])
    check('%s leaves its lake (%.0f m) and falls the whole way (climbs %.1f m); region and mouth recorded'
          % (r_t['name'], lv_t, climb_t),
          bool(whas[int(r_t['px'][0][1]), int(r_t['px'][0][0])]) and abs(r_t['source_m'] - lv_t) <= 1.0 and climb_t <= 1.0
          and r_t.get('region') == 'Firebliss Range' and r_t.get('to'))
for lake_t in ((125, 1343), (184, 1318), (238, 1322), (284, 1318)):
    lk_t = lab_t == lab_t[lake_t[1], lake_t[0]]
    rim_t = nd.binary_dilation(lk_t, structure=np.ones((3, 3))) & ~whas
    lv_t = float(np.nanmedian(wlev[lk_t]))
    check('the lake at %d,%d (%.0f m) keeps its rim at its level (lowest %.1f m)' % (lake_t + (lv_t, float(E[rim_t].min()))),
          float(E[rim_t].min()) >= lv_t - 1.0)
T15 = {k: P.raster(D, k, 'L').astype(int) - 90 for k in ('tm', 'th', 'tl', 'tw', 'tc')}
codes15 = [c['code'] for c in D['climate']['classes']]
land15 = ~whas & (P.raster(D, 'c', 'L') != codes15.index('O')) & (T15['tm'] > -89)
bad15 = land15 & ((T15['th'] <= -89) | (T15['tl'] <= -89) | (T15['th'] < T15['tw']) | (T15['tl'] > T15['tc']))
check('th and tl on every land cell, the hottest afternoon over its warm month and the coldest night under its cold one '
      '(%d cells not)' % int(bad15.sum()), int(bad15.sum()) == 0)
fbv = [v for v in D['vents'] if v.get('region') == 'Firebliss Range']
check('the five Firebliss vents have a crater floor and radius', len(fbv) == 5 and all(
    v.get('floor') and v.get('radius') and v['floor'] < v['peak'] for v in fbv))
# ---- 16. 5.1 edit 4 (edit_514.py, 2026-11-10): Ostrukh Riba into Lake Ostrukh, the north sill, Godstep's dry playa
ob = next(r for r in D['rivers'] if r['id'] == 'r_mb_siphon_breach')
ob_end = ob['px'][-1]
check('Ostrukh Riba leaves the flagship maar south (%s, %.0f m) and ends in Lake Ostrukh at 1,850 m (%s)' % (ob['px'][0], ob['source_m'], ob_end),
      ob['px'][0][1] > 1350 and ob['source_m'] == 2036.0 and ob['to'].get('lake_m') == 1850.0
      and bool(whas[int(round(ob_end[1])), int(round(ob_end[0]))]) and abs(float(wlev[int(round(ob_end[1])), int(round(ob_end[0]))]) - 1850.0) <= 2.0)
check('the flagship maar still holds 40 cells at 2,040 m', int((whas & (np.abs(np.nan_to_num(wlev) - 2040.0) < 1)
      & (np.hypot(xx_b - 1584, yy_b - 1348) < 8)).sum()) == 40)
check('the north breach is closed by the 2,050 m sill (ground %.0f m at 1580,1344)' % E[1344, 1580], float(E[1344, 1580]) >= 2049.0)
gsv = next(r for r in R if r.get('id') == 'rmvkbfspgsmr3')
gsv_m = G.poly(gsv['points'], 1.0, 1.0, E.shape)
check('Godstep valley has no highland-lake class on dry ground (%d cells)' % int((gsv_m & ~whas & (c_grid_full == codes_test.index('WH'))).sum()),
      int((gsv_m & ~whas & (c_grid_full == codes_test.index('WH'))).sum()) == 0)
# ---- 17. 5.1 edit 5 (edit_515.py, 2026-11-11): Godshearth's vents and outlet, the Loom Chasms, e highlands, the Stalker
#          Peaks, the Catch's oases, High Rift's gorge, the Xanadui names
gso = next((r for r in D['rivers'] if r['id'] == 'r_gh_spillway'), None)
check('the hot lake spills down the spillway to r442 (%s, %.1f m3/s)' % (gso and gso['name'], gso and gso['q_mouth_m3s'] or 0),
      gso is not None and gso['source_m'] == 3640.0 and gso['to'].get('river') == 'r442' and gso['q_mouth_m3s'] > 10
      and gso['px'][0][1] > 1394 and gso['to'].get('name') == next(r for r in D['rivers'] if r['id'] == 'r442')['name'])
rr = {r['id']: r for r in R}
check('region rmvraoas90co7 is the Loom Chasms', rr['rmvraoas90co7']['name'] == 'Loom Chasms')
m_lc = G.poly(rr['rmvraoas90co7']['points'], 1.0, 1.0, E.shape)
for nb_id in ('rmvstalkergate', 'rmvkknh1am4fw'):
    ov = int((m_lc & G.poly(rr[nb_id]['points'], 1.0, 1.0, E.shape)).sum())
    check('%s keeps out of the Loom Chasms (%d shared edge cells)' % (rr[nb_id]['name'], ov), ov <= 100)
check('rmvkaq9fftvpp is e highlands, and no region is named e inner wall',
      rr['rmvkaq9fftvpp']['name'] == 'e highlands' and not any(r['name'] == 'e inner wall' for r in R))
sp_m = G.poly(rr['rmwstalkerpks']['points'], 1.0, 1.0, E.shape) if 'rmwstalkerpks' in rr else None
check('the Stalker Peaks hold their four peaks and Hub 01', sp_m is not None and all(bool(sp_m[y, x]) for x, y in
      [(1287, 1293), (1321, 1481), (1397, 1505), (1411, 1409), (1344, 1409)]))
setts_t = {s['id']: s for s in P.settlements()}
catch_m = G.poly(rr['rmuf346nvpktx']['points'], 1.0, 1.0, E.shape)
oas = [setts_t.get('scatch%s01' % n) for n in ('kolli', 'arfwai', 'bitta', 'lasso')]
check('the Catch\'s four new oases stand on its floor at 1,000-1,600 m (%s)' % [o and (o['px'], o['py'], round(E[o['py'], o['px']])) for o in oas],
      all(o is not None and catch_m[o['py'], o['px']] and 1000 <= E[o['py'], o['px']] <= 1600 for o in oas))
vb = next(r for r in D['rivers'] if r['id'] == 'r_hr_verdigris')
g_cells = [(int(round(p[1])), int(round(p[0]))) for p in vb['px'] if 1361 <= p[0] <= 1395]
g_walls = [min(float(E[j - 2, i]), float(E[j + 2, i])) - float(E[j, i]) for j, i in g_cells]
check('High Rift\'s gorge: Verdigris Beck runs in a cut over the Caldron (walls %s m over its bed)' % [round(w) for w in g_walls],
      'gorge' in vb and all(float(E[j, i]) >= 2580.0 + 10 for j, i in g_cells) and np.median(g_walls) >= 30)
fz_t = _json.load(open(RN.FROZEN_NAMES_PATH, encoding='utf-8'))
check('r442 carries the owner\'s Xanadui name (%s)' % next(r for r in D['rivers'] if r['id'] == 'r442')['name'],
      next(r for r in D['rivers'] if r['id'] == 'r442')['name'] != 'Rīfar al-Bihār')
# ---- 18. 5.1 edit 6 (edit_516.py, 2026-11-11): the walls' forced rain removed; the outlet at the owner's ~129 m3/s
from edit_511 import gh_weight as _ghw   # noqa: E402
_w4 = _ghw(E.shape, whas)
_rain4 = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
_band4 = (_w4 > 0.02) & ~gh_m & ~whas & (E >= 4000) & (E < 6000)
check('the Godthrone walls round Godshearth are dry again (4-6 km band %.0f mm)' % _rain4[_band4].mean(), _rain4[_band4].mean() < 400)
check('Godshearth keeps its own rain inside the caldera (%.0f mm)' % _rain4[gh_floor].mean(), 700 <= _rain4[gh_floor].mean() <= 950)
gso4 = next(r for r in D['rivers'] if r['id'] == 'r_gh_spillway')
check('Āirã Siṭrīm carries about 129 m3/s (%.1f), perennial' % gso4['q_mouth_m3s'], 120 <= gso4['q_mouth_m3s'] <= 135 and gso4['perennial'])
# ---- 19. 5.1 edit 7 (edit_517.py, 2026-11-11, re-run 2026-11-16: narrower, in the valley's middle, a long isle in it):
#          Erewhon's caldera lake, its walls, volcanoes, islands, the Vale and the Alph's new head
import edit_517 as E517   # noqa: E402
yy_c, xx_c = np.mgrid[0:E.shape[0], 0:E.shape[1]].astype(float)
_, _, r_c = E517.lake_frame(xx_c, yy_c)
lk_full = r_c <= 1.0
lk = lk_full & whas & (np.abs(np.nan_to_num(wlev, nan=0.0) + 520.0) <= 1.0)
isl_c = np.zeros(E.shape, bool)
for _, i_x, i_y, i_rx, i_ry, _ in E517.ISLANDS:
    isl_c |= E517.isle_r(xx_c, yy_c, i_x, i_y, i_rx, i_ry) <= 1.0
check('Erewhon\'s caldera lake: %d cells wet at -520 m (1,100-1,300), %.0f m deep at most (>= 700 m), dry only on its islands' % (
    int(lk.sum()), -520.0 - float(E[lk].min())),
      1100 <= int(lk.sum()) <= 1300 and -520.0 - float(E[lk].min()) >= 700.0
      and not bool((lk_full & ~whas & ~isl_c).any()))
s_c = nd.distance_transform_edt(~lk_full)
wall2 = float(np.median(E[~lk_full & (np.abs(s_c - 2.0) < 0.5) & (yy_c > 1475) & (yy_c < 1545) & (xx_c > 805) & (xx_c < 880)]))
check('the caldera walls stand %.0f m over the lake two cells off the shore (>= 250 m)' % (wall2 + 520.0), wall2 + 520.0 >= 250.0)
for v_id, v_x, v_y, v_top, v_rb in E517.VOLCS:
    v_h = float(E[int(v_y), int(v_x)])
    check('%s (%d, %d) stands %.0f m over the lake (1.5-2.6 km), %.1f px back from the shore (10-15)' % (
        v_id, v_x, v_y, v_h + 520.0, s_c[int(v_y), int(v_x)]),
          1500.0 <= v_h + 520.0 <= 2600.0 and 10.0 <= s_c[int(v_y), int(v_x)] <= 15.0)
for i_id, i_x, i_y, i_rx, i_ry, i_c in E517.ISLANDS:
    i_j, i_i = int(round(i_y)), int(round(i_x))
    check('island %s (%.1f, %.1f) is dry, %.0f m over the lake' % (i_id, i_x, i_y, E[i_j, i_i] + 520.0),
          not bool(whas[i_j, i_i]) and 20.0 <= float(E[i_j, i_i]) + 520.0 <= 320.0)
lf = D.get('landforms', {})
check('DATA.landforms holds the Pleasure Dome\'s island, off Erehwon\'s quays (its cell the shore bench, no shoal)',
      lf.get('format') == 'krator-landforms' and any(
          l_['id'] == 'lf_pleasure_dome_isle' and abs(l_['px'] - 841) <= 1.5 and abs(l_['py'] - 1517) <= 1.5
          for l_ in lf.get('landforms', [])))
alph = next(r for r in D['rivers'] if r['id'] == 'r070')
a_j, a_i = int(round(alph['px'][0][1])), int(round(alph['px'][0][0]))
check('the Alph (r070) leaves the lake\'s east tip (%s, bed %.1f m) and reaches its old course at 903.5,1529.5' % (
    alph['px'][0], alph['bed_m'][0]),
      bool(nd.binary_dilation(lk, iterations=2)[a_j, a_i]) and -523.0 <= alph['bed_m'][0] <= -520.0
      and [903.5, 1529.5] in alph['px'])
vale_t = (xx_c > 882) & (xx_c < 906) & (yy_c > 1496) & (yy_c < 1534) & (np.abs(E + 520.0) < 60.0)
check('the Vale is dry land between -560 and -460 m (%d cells, median %.0f m)' % (int(vale_t.sum()), float(np.median(E[vale_t]))),
      int(vale_t.sum()) >= 450 and not bool(whas[vale_t].any()) and -545.0 <= float(np.median(E[vale_t])) <= -480.0)
for r_id in ('r613', 'r753', 'r492', 'r272'):
    r_t = next(r for r in D['rivers'] if r['id'] == r_id)
    check('%s ends in the lake' % r_id, bool(lk_full[int(round(r_t['px'][-1][1])), int(round(r_t['px'][-1][0]))])
          and r_t['to'].get('lake_m') == -520)
check('the Beacon\'s knoll (853,1540) is kept out of the rim\'s lowering: %.0f m, its crown %.0f m, the saddle %.0f m' % (
    float(E[1540, 853]), float(E[1540, 854]), float(E[1538, 854])),
      840.0 <= float(E[1540, 853]) <= 900.0 and float(E[1540, 854]) >= 860.0 and float(E[1538, 854]) >= 820.0)
for r_id in ('r488', 'r616'):
    r_t = next(r for r in D['rivers'] if r['id'] == r_id)
    check('%s joins the Alph in the Vale, or the lake at its east tip (%s)' % (r_id, r_t['to']),
          r_t['to'].get('river') == 'r070' or r_t['to'].get('lake_m') == -520)
# ---- 17. Phēr (edit_517_pher.py, 2026-11-16; settlements/pher/PLAN.md): the pin on the wall's foot, its headland, east point
#          and stream as records (finer than the cells)
setts_p = {s_['id']: s_ for s_ in P.settlements()}
ph = setts_p.get('spher0north1')
check('Phēr (843,1491) is pinned, dry on the wall\'s foot (%.0f m), the lake two cells south' % float(E[1491, 843]),
      ph is not None and (ph['px'], ph['py']) == (843, 1491) and not bool(whas[1491, 843]) and bool(whas[1493, 843])
      and -470.0 <= float(E[1491, 843]) <= -420.0)
lf_p = {l_['id']: l_ for l_ in D['landforms']['landforms'] if l_['id'].startswith('lf_pher_')}
check('DATA.landforms holds Phēr\'s headland (two island records) and the cove\'s east point, all over the lake (-520 m)',
      set(lf_p) == {'lf_pher_headland', 'lf_pher_headland_tip', 'lf_pher_east_point'}
      and all(l_['water_m'] == -520.0 and l_['crest_m'] > -520.0 for l_ in lf_p.values()))
sw = next((r_ for r_ in D['rivers'] if r_['id'] == 'r_pher_swit'), None)
check('the Swīṭ Siṭrīm runs downhill from the scarp\'s foot to the lake at Phēr\'s cove (%s)' % (sw and sw['px'][-1]),
      sw is not None and sw['perennial'] and sw['to'].get('lake_m') == -520
      and all(sw['bed_m'][i_ + 1] < sw['bed_m'][i_] for i_ in range(len(sw['bed_m']) - 1))
      and abs(sw['px'][-1][0] - 843) < 1.5 and abs(sw['px'][-1][1] - 1491.5) < 1.0
      and not any(bool(whas[int(y_), int(x_)]) for x_, y_ in sw['px'][:-1]))
# edit_517_pher_rim.py (the owner, 2026-11-16, "do (a)"): the rim plain behind Phēr raised to the page's (its last plain
# cell over the stream at +10 m, not -30 m), still falling to the wall, and the stream's bed on it over the town's head
check('Phēr\'s rim plain is raised: the stream\'s column falls to the wall\'s top at %.0f m, its bed there %s m'
      % (float(E[1489, 842]), sw and sw['bed_m'][12]),
      sw is not None and sw.get('rim_lift_m') == 40.0 and 0.0 <= float(E[1489, 842]) <= 25.0
      and all(float(E[y_ + 1, 842]) < float(E[y_, 842]) for y_ in range(1480, 1491))
      and sw['bed_m'][11] > 15.0 and float(E[1490, 842]) < -200.0)
# ---- 20. 5.1 edit 8 (edit_518.py: Gemini's reshape, its edit_517 of 2026-11-13, re-run 2026-11-17): Spider Lake crater &
#          SW 9102 spillway, SE Tharn 108 km crater & cryo-tarn, Crookshore twin bays & Copper Tarn collar, n semiarid salt
#          lakes, Ring Isles shoals & Port Goto, Firebliss domes (Gemini's checks, landforms read from their file)
lfl20 = D['landforms']['landforms']
lfs20 = {lf['id']: lf for lf in lfl20}
check('edit_518 records all 8 landforms including Spider crater, SE Tharn crater, twin bays, and 3 Firebliss pancake domes',
      {'lf_spider_crater', 'lf_se_tharn_crater', 'lf_crookshore_north_bay', 'lf_crookshore_south_bay',
       'lf_copper_tarn_collar', 'lf_fb_dome_west', 'lf_fb_dome_great', 'lf_fb_dome_east'} <= set(lfs20)
      and sum(1 for lf in lfl20 if lf.get('kind') == 'pancake_dome') == 3)
r9102_20 = next(r for r in D['rivers'] if str(r['id']) == '9102')
r9101_20 = next(r for r in D['rivers'] if str(r['id']) == '9101')
check('Spider NW divide sealed (>= 1,850 m at 1252,175); 9102 exits SW through (1246,232) with strictly monotonic bed_m',
      float(E[175, 1252]) >= 1850.0 and any(abs(p[0] - 1246.0) < 1.5 and abs(p[1] - 232.0) < 1.5 for p in r9102_20['px'])
      and all(b2 < b1 for b1, b2 in zip(r9102_20['bed_m'], r9102_20['bed_m'][1:]))
      and all(b2 <= b1 for b1, b2 in zip(r9101_20['bed_m'], r9101_20['bed_m'][1:])))
check('SE Tharn 108 km crater (1375,1525) holds its 6,910 m cryo-fumarole tarn and fumarole vent',
      bool(whas[1525, 1375]) and abs(float(wlev[1525, 1375]) - 6910.0) <= 2.0
      and any(v.get('name') == 'Tharn Cryo-Fumarole Cauldron' and v.get('kind') == 'fumarole' for v in D['vents']))
check('Crookshore twin secondary-ejecta bays (115,616 & 176,643) hold sea water at 0 m',
      bool(whas[616, 114]) and bool(whas[645, 176]) and abs(float(wlev[616, 114])) <= 1.0)
check('n semiarid closed dam-relic salt lakes are recorded as salt lake basins',
      sum(1 for b in D['basins'] if b.get('kind') == 'salt lake' and 'Dam Relic' in b.get('name', '')) == 2)
check('Port Goto (920,703) stands dry directly adjacent to Ring Sea harbor water at (920,704)',
      (not whas[703, 920]) and bool(whas[704, 920]) and float(wlev[704, 920] - E[704, 920]) >= 5.0)
print('%d checks passed' % ok)
