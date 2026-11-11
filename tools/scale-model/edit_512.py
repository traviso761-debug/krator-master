#!/usr/bin/env python3
"""Scale model 5.1, edit 2 (2026-11-11): Erewhon's lake remodelled as a caldera lake on the pattern of Atitlan.

    python tools/scale-model/edit_512.py            # edits model/data in place, writes edit_512.report.json
    python tools/scale-model/edit_512.py --dry      # computes and prints the report, writes nothing

The owner's decision of 2026-11-11: one great lake, about 120 x 65 km, caldera walls all round, a chain of volcanoes
along the south side set back from the shore, and a few islands.

1. The lake: a smoothed ellipse 60 x 32 px (120 x 64 km) at -520 m on the old lake's axis (15 degrees south of east), in
   the west part of the old basin. Its bed is a caldera bowl, about 60 m deep at the shore, falling steeply to some 900 m
   in the middle. The walls rise 480 m in the first two cells off the shore, with a bench behind them that slopes back to
   the lake (so the escarpment and the horst behind it hold no trench).
2. The south horst (the knife-edge spine between the lake and the Lizardman Rift) is lowered to a caldera rim: its height
   over the lake compressed as 700 ln(1 + h / 700) (3.7 km -> 1.3 km, 2 km -> 0.95 km, 0.5 km -> 0.38 km), faded out at the
   box's edges and east of the lake; on the rim stand three stratovolcanoes (concave cones, bases 5.5 px), their summits
   12-15 px back from the shore, 2.0 / 2.3 / 2.5 km over the lake from west to east.
3. The Vale: the old basin east of the lake, filled to a floor that falls gently to Theodiga (the river 0.4 m a px, the
   floor rising about 3 m a px to the walls). The outlet, the Alph (r070), leaves the lake's east tip through a gorge in
   the east wall, crosses the vale and passes Theodiga's broken dam by a breach west of the pin (the dam's crest, the
   pin's cell at -495 m, is kept), joining its old course down the cataract. The vale's wadis (r488, r616) join it; the
   north shore's rivers (r613, r753, r492, r272) are cut through the wall into the lake.
4. Islands: four of one to four cells, 45-140 m over the lake, and two sub-cell islands as landform records
   (`model/data/landforms.json`, DATA.landforms) for core/world to stamp at 1:1: the Pleasure Dome's island in
   Erehwon's bay, and a stack off the west shore.
5. Erehwon's new site: a bench on the south shore between the western and middle volcanoes, the town climbing behind it
   to a step (the cliff) and a plateau over it (the palace), the mountainside behind. Reported only: the settlement
   record (model/src/60-settlements.js) is moved separately.

Checks: the lake spills at its outlet's sill and, with the outlet blocked, not under 200 m over its level; no new pit in
the box (any is filled and reported); every settlement pin but Erehwon's unchanged; heights, water, temperatures, rain,
class and zone unchanged outside the box. Refuses to run twice (DATA.landforms is the marker).
"""
import json, math, os, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402
from edit_511 import priority_fill, hexrgb   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')

# ---- the specs
LEVEL = -520.0
LAKE = dict(cx=810.0, cy=1499.5, a=30.0, b=16.0, deg=15.0)       # 60 x 32 px, the old lake's axis (14.6 deg)
BED_SHORE, BED_DROP = 60.0, 860.0                                 # 60 m deep at the shore, ~920 m in the middle
WALL_RISE, BENCH_SLOPE, BENCH_REACH = 480.0, 15.0, 16.0          # +480 m over cells 1-3; then 15 m a px, to 16 px
HORST_C = 700.0                                                   # rim height over the lake: C ln(1 + h / C)
VOLCS = [  # id, px, py, summit over the lake (m), base radius (px)
    ('volc_erewhon_west', 794.0, 1525.0, 2000.0, 5.5),
    ('volc_erewhon_middle', 819.0, 1530.0, 2300.0, 5.5),
    ('volc_erewhon_east', 843.0, 1523.0, 2500.0, 5.5),
]
ISLANDS = [  # id, px, py, rx, ry, crest over the lake (m)
    ('isle_erewhon_great', 816.5, 1501.5, 1.05, 1.05, 140.0),
    ('isle_erewhon_bay', 808.5, 1509.0, 1.05, 0.6, 70.0),
    ('isle_erewhon_west', 797.0, 1494.0, 0.6, 0.6, 100.0),
    ('isle_erewhon_east', 828.0, 1497.0, 0.6, 0.6, 45.0),
]
LANDFORMS = [
    {'id': 'lf_pleasure_dome_isle', 'kind': 'island', 'px': 806.6, 'py': 1513.3, 'r_m': 300.0, 'crest_m': -498.0,
     'water_m': LEVEL,
     'note': "The Pleasure Dome of the Bay's island in Erehwon's bay, about 5 km off the town's quays (22 m over the "
             "lake; the Erewhon page's island with its lagoon, dome and barge dock). Sub-cell: its cell's bed is held "
             "as a shoal (40 m) for the stamp. edit_512, 2026-11-11."},
    {'id': 'lf_west_stack', 'kind': 'island', 'px': 784.4, 'py': 1491.6, 'r_m': 160.0, 'crest_m': -478.0,
     'water_m': LEVEL,
     'note': "A basalt stack off the lake's west shore, 42 m over the water. Sub-cell; its cell's bed held as a shoal. "
             "edit_512, 2026-11-11."},
]
SHOAL_M = 40.0
EREHWON = (805, 1516)                     # the new pin: the bench on the south shore (reported; the record moves apart)
# s (cells off the shore) -> m: the quays' bench, the town's climb, the cliff (90 m), the palace plateau, the mountainside
EREHWON_PROFILE = {1: -497.0, 2: -415.0, 3: -325.0, 4: -305.0, 5: -210.0, 6: -20.0, 7: 180.0, 8: 360.0}
# the Alph from the lake's east tip across the vale to r070's old head (903.5,1529.5)
ALPH_CTRL = [(838.0, 1503.0), (846.0, 1502.0), (854.0, 1501.5), (862.0, 1503.0), (870.0, 1504.5), (877.0, 1507.0),
             (884.0, 1510.5), (890.0, 1515.0), (895.5, 1520.5), (900.0, 1525.5), (903.5, 1529.5)]
ALPH_HEAD_BED, ALPH_VALE_END_BED = -521.5, -546.0
# the breach through Theodiga's broken dam, west of the pin (908,1535), cell by cell (j, i), then r070's old gorge
BREACH = [(1531, 905), (1532, 906), (1533, 906), (1534, 907), (1535, 907), (1536, 907), (1537, 908), (1538, 909),
          (1539, 910), (1540, 911), (1541, 912)]
BREACH_STEP = 2.0
THEODIGA = (908, 1535)
VALE_U = 27.0                             # the vale: the old basin east of the lake's east tip (u > 27 px on its axis)
BOX = (1464, 1556, 758, 918)              # y0, y1, x0, x1: the old lake's box (774..906 x 1482..1534) and margins
INFLOWS_LAKE = ['r613', 'r753', 'r492', 'r272']
INFLOWS_VALE = ['r488', 'r616']


def lake_frame(xx, yy):
    th = math.radians(LAKE['deg'])
    dx, dy = xx - LAKE['cx'], yy - LAKE['cy']
    u = dx * math.cos(th) + dy * math.sin(th)
    v = -dx * math.sin(th) + dy * math.cos(th)
    phi = np.arctan2(v / LAKE['b'], u / LAKE['a'])
    r = np.hypot(u / LAKE['a'], v / LAKE['b']) * (1 + 0.03 * np.sin(3 * phi + 0.7) + 0.02 * np.sin(5 * phi + 2.1))
    return u, v, r


def cells_along(pts, step=0.1):
    """the height cells (j, i) a polyline crosses, in order, 8-connected"""
    out = []
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        n = max(1, int(math.ceil(math.hypot(x1 - x0, y1 - y0) / step)))
        for k in range(n + 1):
            t = k / n
            c = (int(round(y0 + (y1 - y0) * t)), int(round(x0 + (x1 - x0) * t)))
            if not out or out[-1] != c:
                out.append(c)
    return out


def resample(pts, spacing=2.0):
    P_ = np.array(pts, float)
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(P_, axis=0).T))]
    n = max(2, int(round(seg[-1] / spacing)) + 1)
    s = np.linspace(0, seg[-1], n)
    return [[round(float(np.interp(t, seg, P_[:, 0])), 2), round(float(np.interp(t, seg, P_[:, 1])), 2)] for t in s]


def box_fade(sh, box, margin=3.0, inset=8.0):
    """(a weight 0 within `margin` cells of the box's edge, 1 from `inset` in; the box's cells beyond the margin): the
    edit keeps 3 cells off the box's edge, so the climate's 2-cell reach stays inside it"""
    y0, y1, x0, x1 = box
    m = np.zeros(sh, bool)
    m[y0:y1, x0:x1] = True
    d = nd.distance_transform_edt(m)
    return G.sstep(margin, inset, d), d > margin


def at(A, p):
    return A[int(round(p[1])), int(round(p[0]))]


def pits(S, box):
    y0, y1, x0, x1 = box
    F = priority_fill(S, box)
    out = np.zeros(S.shape, bool)
    out[y0:y1, x0:x1] = (F - S[y0:y1, x0:x1]) > 1.0
    Ff = np.full(S.shape, np.nan)
    Ff[y0:y1, x0:x1] = F
    return out, Ff


def main(dry=False):
    D = P.load()
    if 'landforms' in D:
        sys.exit('edit_512 has run already (DATA.landforms is in model/data)')
    rep = {'edit': '5.1 edit 2', 'date': '2026-11-11'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    assert sh == (D['fullH'], D['fullW']), 'the height grid is the full grid (5.1)'
    codes = [c['code'] for c in D['climate']['classes']]
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]].astype(float)
    raw0 = {k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
            for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc', 'st', 't', 'rt', 'ct')}
    fade, inbox = box_fade(sh, BOX)          # inbox: where the edit may move ground (3 cells inside the box)
    y0, y1, x0, x1 = BOX
    fullbox = np.zeros(sh, bool)
    fullbox[y0:y1, x0:x1] = True
    oldlake = whas0 & inbox & (np.abs(np.nan_to_num(wlev0, nan=0) - LEVEL) < 1.0)
    lab, _ = nd.label(oldlake, structure=np.ones((3, 3)))
    oldlake = lab == np.bincount(lab[oldlake]).argmax()
    rep['old_lake'] = {'cells': int(oldlake.sum()), 'km2': int(oldlake.sum()) * 4,
                       'bed_m': [round(float(Eo[oldlake].min())), round(float(Eo[oldlake].max()))]}
    S0 = np.where(whas0, np.fmax(Eo, np.nan_to_num(wlev0, nan=-1e9)), Eo)
    FBOX = (1420, 1660, 720, 1040)                 # the spill test's box: the Small Lake and the Rift inside it
    F0 = priority_fill(S0, FBOX)
    rep['old_lake']['raster_spill_m'] = round(float(priority_fill(Eo, FBOX)[1498 - FBOX[0], 851 - FBOX[2]]), 1)

    u, v, r = lake_frame(xx, yy)
    lake_full = (r <= 1.0) & inbox
    isl = np.zeros(sh, bool)
    isl_r = np.full(sh, np.inf)
    for iid, ix, iy, rx, ry, crest in ISLANDS:
        ri = np.hypot((xx - ix) / rx, (yy - iy) / ry)
        isl |= (ri <= 1.0) & lake_full
        isl_r = np.minimum(isl_r, ri)
    lake = lake_full & ~isl
    s = nd.distance_transform_edt(~lake_full)          # cells off the shore
    En = Eo.copy()

    # ---- 1. the south horst lowered to a caldera rim
    ks = G.sstep(2.0, 8.0, v) * (1 - G.sstep(LAKE['a'] + 8, LAKE['a'] + 20, np.abs(u))) * (1 - G.sstep(30.0, 42.0, v)) * fade
    rel = En - LEVEL
    comp = np.where(rel > 0, LEVEL + HORST_C * np.log1p(np.maximum(rel, 0) / HORST_C), En)
    En = En + ks * (comp - En)
    rep['horst'] = {'cells_lowered': int(((Eo - En) > 1).sum()), 'max_lowered_m': round(float((Eo - En).max())),
                    'rim_max_m_before_after': [round(float(Eo[(ks > .9) & ~lake_full].max())),
                                               round(float(En[(ks > .9) & ~lake_full].max()))]}

    # ---- 2. the lake's bed: a caldera bowl
    bed = LEVEL - BED_SHORE - BED_DROP * G.sstep(1.0, 0.45, r) ** 0.9 + 25 * np.sin(xx * 0.37 + yy * 0.23) * np.sin(yy * 0.31)
    En[lake_full] = bed[lake_full]

    # ---- 3. the walls (inner, all round) and the bench behind them (not over the vale)
    vale_core = oldlake & ~lake_full & (u > VALE_U) & (s > 3.5)
    vale_collar = nd.binary_dilation(vale_core, iterations=2) & ~oldlake & ~lake_full & (u > VALE_U - 2)
    vale = vale_core | vale_collar
    W = LEVEL + 20 + WALL_RISE * G.sstep(1.0, 3.0, s)
    Wb = W + BENCH_SLOPE * np.maximum(0.0, s - 3.0)
    inner = ~lake_full & (s <= 3.5) & inbox
    En[inner] = np.maximum(En[inner], W[inner])
    # and no higher than 80 m over the lake on the shore, rising 300 m a cell (the old horst stood 1.5 km at the water)
    capz = ~lake_full & (s <= 5.0) & inbox
    cap = LEVEL + 80.0 + 300.0 * (s - 1.0)
    En[capz] = np.minimum(En[capz], np.maximum(cap, W)[capz])
    # the bench behind the wall, north, west and south (the vale's sides keep their ground)
    bench = ~lake_full & ~vale & (s > 3.5) & (((s <= BENCH_REACH) & (u < VALE_U)) | oldlake) & inbox
    kb = fade * (1 - G.sstep(BENCH_REACH - 3, BENCH_REACH, s)) * (1 - G.sstep(VALE_U - 4, VALE_U, u))
    kb = np.where(oldlake, 1.0, kb)                  # the old lake's floor outside the new lake and the vale: all bench
    En[bench] = np.maximum(En[bench], (En + kb * np.maximum(0, Wb - En))[bench])

    # ---- 4. the volcanoes
    vrep = []
    for vid, vx, vy, top, rb in VOLCS:
        rr = np.hypot(xx - vx, yy - vy) / rb
        foot = LEVEL + 380.0
        cone = foot + (LEVEL + top - foot) * np.clip(1 - rr, 0, 1) - 70.0 * (1 - G.sstep(0.0, 0.14, rr))
        cone += 35 * np.sin(np.arctan2(yy - vy, xx - vx) * 7 + vx) * G.sstep(0.15, 0.6, rr) * (rr < 1)
        m = (rr < 1.0) & ~lake_full
        En[m] = np.maximum(En[m], cone[m])
        vrep.append({'id': vid, 'px': [vx, vy], 'summit_m': round(float(En[int(vy), int(vx)])),
                     'over_lake_m': round(float(En[int(vy), int(vx)] - LEVEL)), 'base_px': rb,
                     'from_shore_px': round(float(s[int(vy), int(vx)]), 1),
                     'from_shore_km': round(float(s[int(vy), int(vx)]) * 2, 1),
                     'from_erehwon_px': round(math.hypot(vx - EREHWON[0], vy - EREHWON[1]), 1)})
    rep['volcanoes'] = vrep

    # ---- 5. Erehwon's bench, the step (cliff) and the plateau over it
    ex, ey = EREHWON
    assert lake_full[ey - 1, ex] and not lake_full[ey, ex], 'Erehwon stands on the shore'
    de = np.hypot(xx - ex, np.where(yy > ey, 0.55, 1.0) * (yy - ey))      # reaching further up the mountainside
    ke = (1 - G.sstep(3.5, 6.0, de)) * ~lake_full
    prof = np.interp(s, list(EREHWON_PROFILE), list(EREHWON_PROFILE.values()))
    reach = (s <= max(EREHWON_PROFILE) + 0.5) & (ke > 0)
    En[reach] = En[reach] + ke[reach] * (prof[reach] - En[reach])
    En[ey, ex] = EREHWON_PROFILE[1]

    # ---- 6. the Vale: the floor, falling to the Alph and down it to Theodiga
    ctrl = G.chaikin(ALPH_CTRL, 2)
    fine = np.array(resample(ctrl, 0.2))
    arc = np.r_[0, np.cumsum(np.hypot(*np.diff(fine, axis=0).T))]
    tree = cKDTree(fine)
    vy_, vx_ = np.nonzero(vale | (oldlake & ~lake_full) | (inbox & (s < 9) & (u > VALE_U - 4)))
    dd, ii = tree.query(np.stack([vx_, vy_], 1).astype(float))
    t_arc = arc[ii] / arc[-1]
    bvale = ALPH_HEAD_BED + (ALPH_VALE_END_BED - ALPH_HEAD_BED) * t_arc
    Fv = bvale + 4.0 * G.sstep(0.0, 1.2, dd) + 2.2 * dd + 0.03 * dd * dd
    FV, BV, DR = np.full(sh, np.nan), np.full(sh, np.nan), np.full(sh, np.inf)
    FV[vy_, vx_], BV[vy_, vx_], DR[vy_, vx_] = Fv, bvale, dd
    vc = vale_core
    crest = LEVEL + 20 + WALL_RISE * G.sstep(1.0, 3.0, 3.5)
    We = crest + (FV - crest) * G.sstep(3.5, 7.5, s)
    En[vc] = np.maximum(FV[vc], We[vc])
    En[vale_collar] = np.maximum(En[vale_collar], FV[vale_collar])
    # (the east wall's own old-lake cells, s <= 3.5, are the inner wall of step 3)
    # the outlet gorge through the east wall: V-shaped, 110 m a px up its sides
    gz = inbox & ~lake_full & (s < 9.5) & (DR < 3.0)
    gorge = BV + 4.0 * G.sstep(0.0, 1.2, np.where(gz, DR, 0)) + 110.0 * np.where(gz, DR, 0) ** 1.2
    En[gz] = np.minimum(En[gz], gorge[gz])
    # the river's own cells, falling all the way
    apath = [c for c in cells_along(ctrl) if not lake_full[c]]
    assert lake_full[cells_along(ctrl)[0]], 'the Alph leaves the lake'
    bed_prev = LEVEL
    abeds = []
    for c in apath:
        _, k = tree.query([c[1], c[0]])
        b = min(ALPH_HEAD_BED + (ALPH_VALE_END_BED - ALPH_HEAD_BED) * arc[k] / arc[-1], bed_prev - 0.15)
        En[c] = b
        abeds.append(b)
        bed_prev = b
    for c in BREACH:
        b = bed_prev - BREACH_STEP
        En[c] = min(En[c], b) if Eo[c] > -1000 else b       # r070's old -2,025 m slots in the dam raised to the bed
        abeds.append(float(En[c]))
        bed_prev = float(En[c])
    rep['vale'] = {'floor_cells': int(vale.sum()), 'river_bed_m': [round(abeds[0], 1), round(abeds[len(apath) - 1], 1)],
                   'breach_bed_m': [round(abeds[len(apath)], 1), round(abeds[-1], 1)],
                   'floor_m': {'p5': round(float(np.percentile(En[vc], 5))), 'median': round(float(np.median(En[vc]))),
                               'p95': round(float(np.percentile(En[vc], 95)))},
                   'floor_near_lake_m': round(float(np.median(En[vc & (u < VALE_U + 14)]))),
                   'floor_near_theodiga_m': round(float(np.median(En[vc & (np.hypot(xx - 903, yy - 1528) < 8)]))),
                   'fill_m_max': round(float((En - Eo)[vale].max()))}

    # ---- 7. the islands, their shoals, and the sub-cell islands' shoals
    for iid, ix, iy, rx, ry, crest_ in ISLANDS:
        ri = np.hypot((xx - ix) / rx, (yy - iy) / ry)
        m = (ri <= 1.0) & lake_full
        En[m] = LEVEL + 8 + (crest_ - 8) * (1 - 0.45 * ri[m] ** 2)
        sm = lake & (ri > 1.0) & (ri <= 3.2)
        En[sm] = np.maximum(En[sm], LEVEL - 12 - 95 * (ri[sm] - 1))
    for lf in LANDFORMS:
        c = (int(round(lf['py'])), int(round(lf['px'])))
        assert lake[c], lf['id'] + ' stands in the lake'
        En[c] = max(En[c], LEVEL - SHOAL_M)

    # ---- 8. the rivers into the lake and the vale cut through the walls
    R = {r_['id']: r_ for r_ in D['rivers']}
    zone = inbox & ~lake_full & ((s <= BENCH_REACH) | vale)
    river_out = {}
    for rid in INFLOWS_LAKE + INFLOWS_VALE:
        rec = R[rid]
        pts = [list(p) for p in rec['px']]
        if rid in INFLOWS_LAKE:
            k_in = next((k for k, p in enumerate(pts) if lake_full[int(round(p[1])), int(round(p[0]))]), None)
            if k_in is not None:
                pts = pts[:k_in + 1]
            else:                                         # carried on downhill to the shore
                tail = pts[-1]
                ys_, xs_ = np.nonzero(lake)
                j = np.argmin((xs_ - tail[0]) ** 2 + (ys_ - tail[1]) ** 2)
                end = [float(xs_[j]), float(ys_[j])]
                n = max(1, int(math.ceil(math.hypot(end[0] - tail[0], end[1] - tail[1]) / 2.0)))
                pts += [[round(tail[0] + (end[0] - tail[0]) * k / n, 2), round(tail[1] + (end[1] - tail[1]) * k / n, 2)]
                        for k in range(1, n + 1)]
        else:                                             # on across the vale floor to the Alph
            tail = pts[-1]
            _, k = tree.query(tail)
            end = fine[k]
            n = max(1, int(math.ceil(math.hypot(end[0] - tail[0], end[1] - tail[1]) / 2.0)))
            pts += [[round(tail[0] + (end[0] - tail[0]) * k_ / n, 2), round(tail[1] + (end[1] - tail[1]) * k_ / n, 2)]
                    for k_ in range(1, n + 1)]
        path = cells_along(pts)
        prev = None
        for c in path:
            if lake_full[c]:
                break
            if zone[c]:
                # the ground the wall raised goes back to the old bed; the vale's floor takes a channel 3 m deep
                tgt = min(En[c], Eo[c]) if not oldlake[c] else En[c] - 3.0
                if prev is not None:
                    tgt = min(tgt, prev - 0.3)
                if tgt < En[c]:
                    for dj in (-1, 0, 1):
                        for di in (-1, 0, 1):
                            nb = (c[0] + dj, c[1] + di)
                            if (dj or di) and zone[nb] and not lake_full[nb]:
                                En[nb] = min(En[nb], max(tgt + 80.0, min(Eo[nb], En[nb])))
                    En[c] = tgt
            prev = En[c]
        river_out[rid] = pts

    # ---- 9. water, the pins, and no new pit
    whas2, wlev2 = whas0.copy(), wlev0.copy()
    whas2[oldlake & ~lake] = False
    wlev2[oldlake & ~lake] = np.nan
    whas2[lake], wlev2[lake] = True, LEVEL
    water2 = water0.copy()
    water2[oldlake & ~lake] = False
    water2[lake] = True
    En[THEODIGA[1], THEODIGA[0]] = Eo[THEODIGA[1], THEODIGA[0]]
    S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
    pit0, _ = pits(S0, BOX)
    old_land_pit = pit0 & ~whas0           # the old lake itself stood 32 m under Theodiga's sill: not a pit to keep
    filled = np.zeros(sh, bool)
    En_prefill = En.copy()
    for _ in range(6):
        pit1, F1 = pits(S2, BOX)
        new = pit1 & ~old_land_pit & ~whas2
        if not new.any():
            break
        En[new] = F1[new] + 0.05
        filled |= new
        S2 = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
    pit1, _ = pits(S2, BOX)
    rep['pits'] = {'before_cells': int((pit0 & ~whas0).sum()), 'after_cells': int((pit1 & ~whas2).sum()),
                   'new_cells': int((pit1 & ~old_land_pit & ~whas2).sum()), 'filled_cells': int(filled.sum()),
                   'filled_max_m': round(float((En - En_prefill)[filled].max()), 1) if filled.any() else 0.0,
                   'filled_at': [[int(i), int(j)] for j, i in zip(*np.nonzero(filled))][:20]}
    assert not (pit1 & ~old_land_pit & ~whas2).any(), 'a new pit'
    # the spill: the lake's bed filled to its way out, with the outlet open and with the outlet's gorge blocked
    Fb = priority_fill(En, FBOX)
    spill = float(Fb[int(LAKE['cy']) - FBOX[0], int(LAKE['cx']) - FBOX[2]])
    Eb = En.copy()
    Eb[gz & (s < 9.5)] += 3000.0
    for c in apath[:12]:
        Eb[c] = Eb[c] + 3000.0
    Fbb = priority_fill(Eb, FBOX)
    spill_b = float(Fbb[int(LAKE['cy']) - FBOX[0], int(LAKE['cx']) - FBOX[2]])
    lake_surface_pit = pit1 & lake
    rep['spill'] = {'level_m': LEVEL, 'spill_m': round(spill, 2), 'through_outlet': bool(spill <= LEVEL),
                    'spill_with_outlet_blocked_m': round(spill_b, 1), 'closed_otherwise': bool(spill_b >= LEVEL + 200),
                    'lake_surface_cells_in_a_pit': int(lake_surface_pit.sum())}
    assert spill <= LEVEL and spill_b >= LEVEL + 200, rep['spill']

    # ---- the lake's numbers
    ys_, xs_ = np.nonzero(lake)
    shore = nd.binary_dilation(lake_full, structure=np.ones((3, 3))) & ~lake_full
    for c in apath[:3]:
        shore[c] = False                     # the outlet's sill, 1.5 m under the level
    rep['lake'] = {'centre_px': [LAKE['cx'], LAKE['cy']], 'axis_deg': LAKE['deg'], 'cells': int(lake.sum()),
                   'km2': int(lake.sum()) * 4, 'x': [int(xs_.min()), int(xs_.max())], 'y': [int(ys_.min()), int(ys_.max())],
                   'length_km': round(float(u[lake].max() - u[lake].min() + 1) * 2, 1),
                   'width_km': round(float(v[lake].max() - v[lake].min() + 1) * 2, 1),
                   'level_m': LEVEL, 'bed_m': [round(float(En[lake].min())), round(float(En[lake].max()))],
                   'depth_max_m': round(LEVEL - float(En[lake].min())),
                   'shore_min_m': round(float(En[shore].min())),
                   'wall_m_at_2_px': round(float(np.median(En[~lake_full & (np.abs(s - 2) < .5) & inbox]))),
                   'wall_m_at_3_px': round(float(np.median(En[~lake_full & (np.abs(s - 3) < .5) & inbox])))}
    assert rep['lake']['shore_min_m'] > LEVEL, 'the shore is dry'
    if '--terrain' in sys.argv:              # the heights only (for looking at them): --terrain <out.npz>
        np.savez_compressed(sys.argv[sys.argv.index('--terrain') + 1], En=En, Eo=Eo, whas2=whas2, lake=lake)
        print(json.dumps(rep, indent=1, ensure_ascii=False))
        return D, En
    rep['islands'] = [{'id': iid, 'px': [ix, iy], 'cells': int(((np.hypot((xx - ix) / rx, (yy - iy) / ry) <= 1) & lake_full).sum()),
                       'crest_m': round(float(En[int(round(iy)), int(round(ix))])), 'over_lake_m': round(float(En[int(round(iy)), int(round(ix))] - LEVEL)),
                       'from_erehwon_km': round(math.hypot(ix - ex, iy - ey) * 2, 1)} for iid, ix, iy, rx, ry, crest_ in ISLANDS]
    rep['erehwon'] = {'px': [ex, ey], 'ground_m': round(float(En[ey, ex])),
                      'profile_m_by_cells_back': {str(k): round(float(En[ey + k - 1, ex])) for k in range(1, 9)},
                      'lake_cell_north': bool(lake[ey - 1, ex]), 'old_pin_800_1503': {'wet': bool(whas2[1503, 800])}}

    # settlements: every pin but Erehwon's unchanged
    s_src = open(os.path.join(SRC, '60-settlements.js'), encoding='utf-8').read()
    i0 = s_src.index('const defSetts = ') + len('const defSetts = ')
    setts, _ = json.JSONDecoder().raw_decode(s_src[i0:])
    pins = {}
    for st in setts:
        if y0 <= st['py'] < y1 and x0 <= st['px'] < x1:
            pins[st['name']] = {'px': [st['px'], st['py']], 'before_m': round(float(Eo[st['py'], st['px']])),
                                'after_m': round(float(En[st['py'], st['px']])), 'wet_after': bool(whas2[st['py'], st['px']])}
            if st['id'] != 's57bkv9741':
                assert abs(En[st['py'], st['px']] - Eo[st['py'], st['px']]) < 0.5 and not whas2[st['py'], st['px']], st['name']
    rep['pins'] = pins

    moved = (np.abs(En - Eo) > 0.5) | (whas2 != whas0)
    assert not (moved & ~inbox).any(), 'heights moved outside the box'

    # ---- 10. temperatures: lapsed with the surface; cells that turned to land take their land twins'; new water the lake's
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    T = {}
    for k in C.TEMPS:
        T[k] = P.raster({'x': lap[k]}, 'x', 'L').astype(float) - 90
    to_land = whas0 & ~whas2
    to_water = whas2 & ~whas0
    pool = inbox & ~whas0 & ~whas2 & ~nd.binary_dilation(moved, iterations=2) & (T['tm'] > -89)
    py_, px_ = np.nonzero(pool)
    ty_, tx_ = np.nonzero(to_land)
    ft = lambda X, Y, H: np.stack([X / 40.0, Y / 40.0, H / 350.0], 1)
    dk, ik = cKDTree(ft(px_, py_, Eo[pool])).query(ft(tx_, ty_, En[to_land]), k=12)
    wk = 1.0 / (dk + .25)
    for k in C.TEMPS:
        vals = T[k][pool]
        T[k][to_land] = np.round((vals[ik] * wk).sum(1) / wk.sum(1))
        T[k][to_water] = np.median(T[k][oldlake & lake])
    for k in C.TEMPS:
        D[k] = P.b64(Image.fromarray(np.clip(T[k] + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep['temperatures'] = {'vale_C': {k: round(float(np.median(T[k][to_land & vale])), 1) for k in C.TEMPS},
                           'lake_C': {k: round(float(np.median(T[k][lake])), 1) for k in C.TEMPS},
                           'rim_C_at_volcano_summits': {v_[0]: round(float(T['tm'][int(v_[2]), int(v_[1])]), 1) for v_ in VOLCS}}

    # ---- 11. rain, class and zone where the heights changed; the lake's on new water
    forced = whas2.copy()
    rain2, cls2, zon2, q, crep = C.reclimate(D, Eo, En, whas2, forced)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain2[to_water] = np.median(rain0[oldlake & lake])
    cls2[whas2 & inbox] = codes.index('WH')
    zon2[whas2 & inbox] = int(np.bincount(raw0['z'][oldlake]).argmax())
    rep['reclimate'] = crep
    rep['vale_climate'] = {'rain_mm_median': round(float(np.median(rain2[to_land & vale]))),
                           'classes': dict(Counter(codes[c] for c in cls2[to_land & vale]).most_common())}
    on_cones = np.min([np.hypot(xx - vx, yy - vy) for _, vx, vy, _, _ in VOLCS], 0) < 5.5
    rep['volcano_classes'] = dict(Counter(codes[c] for c in cls2[on_cones]).most_common())

    # ---- 12. the paint
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k, v_ in relit.items():
        D[k] = v_
    near = nd.binary_dilation(moved, iterations=3)
    tm_now = P.raster(D, 'tm', 'L').astype(float) - 90
    paint_rivers = [river_out[rid] for rid in INFLOWS_LAKE + INFLOWS_VALE if rid in river_out]
    alph_px = resample(ctrl, 2.0)
    for k in ('st', 't'):
        a = P.raster(D, k)
        a = PA.retint(a, EoF, EnF, near, ~near, 150.0)
        lum = a.mean(-1)
        det = np.clip((lum + 4) / (nd.gaussian_filter(lum, 3.0) + 4), .8, 1.2)[..., None]
        # the lake's water in the old lake's colour, its own texture kept
        tgt = np.median(raw0[k][oldlake & lake & (nd.distance_transform_edt(oldlake) > 2)], 0)
        wgt = np.clip(nd.gaussian_filter(lake.astype(float), 0.7) * 1.3, 0, 1) * lake_full
        a = np.clip(a * (1 - wgt[..., None]) + tgt * det * wgt[..., None], 0, 255)
        # the land that was water (the vale, the islands, the old shore) painted for its climate
        landw = np.clip(nd.gaussian_filter(to_land.astype(float), 0.8) * 1.5, 0, 1) * ~lake
        a = PA.by_climate(a.astype(np.uint8), EnF, rain_now, tm_now, whas2 | near, to_land, landw)
        # the rivers
        img = Image.fromarray(a.astype(np.uint8))
        from PIL import ImageDraw, ImageFilter
        over = Image.new('RGBA', img.size, (0, 0, 0, 0))
        dr = ImageDraw.Draw(over)
        colour, wid = ((64, 154, 168), 2) if k == 'st' else ((58, 112, 132), 2)
        dr.line([tuple(p) for p in alph_px] + [(905.5, 1532.0), (907.2, 1535.5)], fill=colour + (205,), width=wid, joint='curve')
        for pts in paint_rivers:
            tail = [tuple(p) for p in pts[-8:]]
            dr.line(tail, fill=colour + (150,), width=1, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(.6))
        img = Image.alpha_composite(img.convert('RGBA'), over).convert('RGB')
        D[k] = P.jpeg_like(D, k, np.array(img))
        rep['lake_paint_rgb_' + k] = [round(float(x_)) for x_ in tgt]

    # ---- 13. records: the rivers, the outlet, the basin, the landforms
    rep['rivers'] = rivers(D, R, En, lake_full, river_out, alph_px, apath, abeds)
    D['outlets'].append({'name': "Erewhon's lake outlet", 'from': "Erewhon's lake",
                         'to': "the Alph across the Vale, through Theodiga's breach to the Small Lake",
                         'px': [[float(c[1]), float(c[0])] for c in apath + BREACH],
                         'bed_m': [int(round(b)) for b in abeds], 'lake_level_m': int(LEVEL)})
    basin = {'at_px': [LAKE['cx'], LAKE['cy']], 'level_m': int(LEVEL), 'km2': int(lake.sum()) * 4,
             'depth_m': round(LEVEL - float(En[lake].min())), 'kind': 'through lake',
             'climate': codes[int(np.bincount(cnow[shore & ~whas2]).argmax())], 'spill_m': round(spill),
             'name': "Erewhon's lake", 'notes': 'A caldera lake (edit_512, 2026-11-11): its outlet the Alph (r070).'}
    D['basins'].append(basin)
    rep['basin'] = basin
    D['landforms'] = {'format': 'krator-landforms', 'version': 1, 'landforms': LANDFORMS}
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # ---- 14. nothing else moved
    for k in ('h', 'wl'):
        diff = np.any(P.raster(D, k) != raw0[k], -1)
        assert not (diff & ~inbox).any(), k + ' changed outside the box'
    for k in ('tm', 'th', 'tl', 'tw', 'tc', 'p', 'c', 'z'):
        a = P.raster(D, k, 'L')
        assert not ((a != raw0[k]) & ~fullbox).any(), k + ' changed outside the box'
    rep['cells_changed'] = {k: int((P.raster(D, k, 'L') != raw0[k]).sum()) for k in ('tm', 'tw', 'tc', 'th', 'tl', 'p', 'c', 'z')}
    rep['cells_changed']['h'] = int(moved.sum())
    rep['box'] = {'y': [y0, y1], 'x': [x0, x1]}
    if not dry:
        P.save(D)
        json.dump(rep, open(os.path.join(HERE, 'edit_512.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
                  ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))
    return D, En


def rivers(D, R, En, lake_full, river_out, alph_px, apath, abeds):
    """the records of the rivers this edit moved: their courses, beds sampled on the new ground (falling all the way),
    flows carried to the new points, lengths, mouths"""
    out = {}

    def beds(pts):
        b, m = [], 1e9
        for p in pts:
            m = min(m, float(at(En, p)))
            b.append(round(m, 1))
        return b

    def length(pts):
        return round(sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])) * 2.0, 1)
    for rid, pts in river_out.items():
        rec = R[rid]
        old = {'n': len(rec['px']), 'last': rec['px'][-1], 'to': rec.get('to')}
        q = list(rec['q_m3s'])
        q = (q + [q[-1]] * len(pts))[:len(pts)]
        rec['px'], rec['q_m3s'] = pts, q
        rec['bed_m'] = beds(pts)
        rec['length_km'] = length(pts)
        rec['mouth_m'] = rec['bed_m'][-1]
        if rid in INFLOWS_LAKE:
            rec['to'] = {'lake_m': int(LEVEL), 'at_px': pts[-1]}
        else:
            rec['to'] = {'river': 'r070', 'name': R['r070']['name'], 'at_px': pts[-1]}
        out[rid] = {'was': old, 'now': {'n': len(pts), 'last': pts[-1], 'to': rec['to'], 'mouth_m': rec['mouth_m']}}
    a = R['r070']
    old = {'n': len(a['px']), 'first': a['px'][0], 'length_km': a['length_km']}
    head = [p for p in alph_px[:-1] if not lake_full[int(round(p[1])), int(round(p[0]))]]
    pts = head + [list(p) for p in a['px']]
    hb = beds(head + [a['px'][0]])
    rest = [min(b, hb[-1]) for b in a['bed_m']]
    rest[0] = hb[-1]
    a['bed_m'] = hb[:-1] + [round(min(b, rest[0]), 1) for b in rest]
    q0 = a['q_m3s'][0]
    a['q_m3s'] = [q0] * len(head) + list(a['q_m3s'])
    a['px'] = pts
    a['source_m'] = a['bed_m'][0]
    a['length_km'] = round(a['length_km'] + length(head + [a['px'][len(head)]]), 1)
    a['settlements'] = sorted(set(a.get('settlements', [])) | {'Theodiga'})
    out['r070'] = {'was': old, 'now': {'n': len(pts), 'first': pts[0], 'length_km': a['length_km'],
                                       'source_m': a['source_m'], 'head_cells': len(apath)}}
    return out


if __name__ == '__main__':
    main(dry='--dry' in sys.argv)
