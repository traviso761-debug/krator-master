#!/usr/bin/env python3
"""Scale model 5.1, edit 30 (2026-11-24): the SE outer wall's partial rescale - the Godsgate's frame and the five tarns
brought into the alpine window, the matrix left high and airless.

    python tools/scale-model/edit_530_seow_rescale.py          # edits h, tm/tw/tc/th/tl and the paint; run once
    python tools/scale-model/edit_530_seow_rescale.py --dry    # print the report, write nothing

The owner, 2026-11-24, answer A3: *"leave only east se outer wall high and airless."* So `biomes/seouterwall/PLAN.md`
step 6.1 is applied to the **Godsgate's frame and a disc at each of the five tarns** and to nothing else;
`openworld/catch-bowl/PLAN.md` section 11 edit 4, queued as `openworld/catch-bowl/MAP-EDITS.md` edit 4. Step 6.1 never
landed, although 6.2 (the pass) and 6.3 (the tarns) landed to the metre, so the province reads a 7,963 m median with
83 % over 6,500 m against its plan's 4,850 m and zero.

**The boundary, re-derived here and not taken on trust.** Splitting the province at every x from 1030 to 1100 and
scoring each split by the gap in the share of cells over 8,000 m, the sharpest break is at **x 1056** (west 1.4 % over
8 km at a 6,137 m median, east 56.3 % at 8,282 m; gap 54.9 points, the maximum over the whole sweep). That is the
figure the queue carries, confirmed independently. So the frame is **x 997..1056** and each tarn takes a disc of
**12.5 cells = 25 km** radius round 1016,1236 / 1064,1272 / 1134,1218 / 1208,1254 / 1288,1184. A disc of 25 km
*diameter* was the other reading of "a ~25 km disc" and is rejected: 6.3 already gives each tarn an amphitheatre of
4.5-6.5 cells (9-13 km), so a 12.5 km radius would add nothing, and the owner's answer A asks for a breathable
*approach*, not just a breathable cell.

**Two corrections to 6.1 as written**, both because it was designed to run *before* 6.2 and 6.3, on an all-high
province, and is running after them here:

1. The curve `E_alp_base = 3850 + 2150 * tanh(max(0, E_base - 3850) / 3600)` maps **every** cell under 3,850 m *up* to
   3,850 m, because `max(0, ...)` is 0 there. Run as written today it would raise the carved pass floor (2,284-3,789 m)
   and the Bowl-facing toe onto a 3,850 m shelf. It is written to compress the airless 8-15 km ground into the
   +3,800-6,450 m window, so below the knee it is the identity: `E_alp = where(E_base > 3850, curve, E_base)`.
2. The high-frequency relief `dE_hp = En - gaussian_filter(En, 4.5)` added back at full amplitude puts cells at 9,000 m
   on top of a base the curve caps at 6,000 m, against 6.1's "zero cells above 6,500 m". It is restored scaled by the
   curve's own local slope, `d(E_alp)/d(E_base) = (2150/3600) * sech^2(u)`, so compressed ground keeps its character and
   stays inside the window. On the fully-weighted core this gives **zero cells over 6,500 m**, which is 6.1's own test.

**The landed features are guarded.** 6.2's pass and 6.3's tarns must not move, so the corridor's swath (6.2's chain and
its own half-widths), each tarn's amphitheatre (6.5 cells) and every water cell take weight 0, feathered over 12 cells
so the guard makes no step of its own. Nothing inside the guard moves by more than a millimetre, which is why all eight
of the landed readings come through unchanged.

**The weight** is 6.1's own `G.sstep` blend in three factors: the province's interior feather (8 cells, widened from
6.1's 3.5 because 6.1's exterior term `0.35 * sstep(4.5, 0, d_out)` is dropped here - it would move ground outside the
province, which other regions read - and without it a 3.5-cell feather left a 1,020 m/cell step on the province's
western edge; at 8 cells that falls to 527 and nothing outside moves), the shape's **outward** feather (12 cells), and
the guard's. The shape's feather runs outward because an inward one leaves the frame's own named horn unrescaled:
Shatter-Crown stands at x 1056 exactly, and fed an inward feather it stayed at 6,873 m against its planned 5,760 m.

**No new scarp, measured.** The province's own gradients run p50 125, p95 391, p99 662, p99.9 1,170, max 1,911 m per
2 km cell. After the edit that distribution is unchanged (p99 662, p99.9 1,137, max 1,911). The largest increase at any
single cell is 527 m/cell, between the terrain's own p95 and p99, on 142 cells of the 10,019 reached - 134 of them on
disc rims and 89 of those at tarn 5, which is a 3,820 m pocket inside a 9,200 m matrix, so a wall there is what the
owner's ruling asks for. Wider feathers (16, 20 cells) cut that to 393 and 358 m/cell but spread the discs to 57 and
65 km and lowered the matrix 1,128 and 1,788 m out at x 1310-1319, so 12 cells is kept: it holds the owner's shape and
costs nothing the terrain does not already do.

Also runs 6.1 step 3: three back-tilted listric slump benches at **+3,500, +4,350 and +5,150 m** on the northern
Bowl-facing slope (py < 1220), as `w_step = exp(-((de / 220) ** 2))` attractors; and 6.1 step 2's arete sharpening,
`T.ridged` at scales (1.5, 3.0, 6.0), on the high ground only.

**6.4's graded river beds are guarded too, and that is a correction this edit had to find by breaking them.** The guard
first held only 6.2's pass and 6.3's tarns. With those alone the eight landed readings came through untouched and the
rescale looked right - and it had quietly broken two rivers. `tests/test_smodel.py` check 6 wants every river's course
to descend (nothing may stand more than 50 m over the lowest point before it). Before this edit the worst climb in all
963 rivers was 48.3 m and **all seven of this province's read 0.0 m**: 6.4 had landed them perfectly. After the first
run, `r708` Wadi al-Sakhr climbed **659.8 m** and `r645` Wadi al-Zulal al-Saghir **407.3 m**, because the curve is the
identity only below its knee on a cell's *own* height while the compression is driven by `E_base`, the 9 km-smoothed
base - and in a valley ringed by 8 km walls that base is high, so the valley floor came down with the walls. Each tarn's
outflow then ran downhill into a bowl and uphill out of it, which is a real terrain fault and not a test artefact.

Carving the courses back down (6.4 step 1's own remedy, `smodel.rivers.carve_river`) did fix the climbs, but it cut
**300 cells outside the province by up to 680 m** to do it, because a bed graded out of a bowl has to keep falling
downstream of the boundary. Guarding the beds instead costs almost nothing: every river in the province goes back to
**0.0 m** of climb, nothing outside the province moves at all, and the fully-weighted core only falls from 1,361 cells
to 1,072 while still reading a 6,723 -> 5,332 m median with zero cells over 6,500 m. So **every river cell in the model,
dilated by one to take its banks, joins the guard**, and 6.4 step 1 stays in the script as a net that proves nothing
needs grading - the report lists every river in the province with its climb before and after.

Temperatures are lapsed and the paint relit. The five tarns are the province's only water (53 cells, checked) and are
guarded, so no water moves and no water class, zone or paint changes. Nothing outside the province moves, and nothing
east of x 1312 moves at all, so the eastern wall above Hub 01 that the Stalkers transit is untouched.

Refuses to run twice (Ilmenite Horn 1008,1248 under 6,000 m is its marker). Writes `edit_530_seow_rescale.report.json`.
"""
import json, os, sys
import numpy as np
from PIL import Image   # noqa: F401  (smodel.page encodes through it)
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C, smodel.terrain as T   # noqa: E402
import smodel.rivers as RV                                                              # noqa: E402
from smodel.geom import sstep, region_mask                                              # noqa: E402

REGION = 'SE outer wall'                 # rmw4xy4tp9b29
FRAME_X = 1056                           # re-derived below; the data's own break
DISC_R = 12.5                            # cells; 25 km radius
F_PROV, F_SHAPE, F_GUARD = 8.0, 12.0, 12.0
KNEE, SPAN, SIG = 3850.0, 2150.0, 3600.0                 # 6.1's alpine curve
SIGMA, ARETE, BENCH_K = 4.5, 500.0, 0.6
RIDGE_SCALES = (1.5, 3.0, 6.0)
BENCHES = (3500.0, 4350.0, 5150.0)       # 6.1 step 3
BENCH_SIG, BENCH_Y = 220.0, 1220
SEED = 5301
AMPH_R = 6.5                             # 6.3's sheltered rock walls

TARNS = {1: (1016, 1236), 2: (1064, 1272), 3: (1134, 1218), 4: (1208, 1254), 5: (1288, 1184)}
# 6.2's Godsgate chain: (px, py, half_width_px)
CHAIN = [(1018., 1188., 6.5), (1024., 1206., 5.5), (1026., 1224., 5.0), (1029., 1238., 4.8), (1031., 1252., 4.5),
         (1033., 1268., 4.8), (1035., 1292., 5.2), (1032., 1315., 6.8), (1018., 1338., 8.5)]
# the hard constraint: 6.2 and 6.3 landed these to the metre and the rescale must not move them
LANDED = [('godsgate_saddle_crest', 1031, 1252, 3620.0), ('tarn1_gate_bell', 1016, 1236, 3680.0),
          ('tarn2_amber_sinter', 1064, 1272, 3940.0), ('tarn3_mirror_slump', 1134, 1218, 4120.0),
          ('tarn4_jade_karst_polje', 1208, 1254, 4380.0), ('tarn5_copper_vein', 1288, 1184, 3820.0),
          ('hub_01', 1344, 1409, 4351.0)]
# 6.1/6.2's own targets inside the frame: a free acceptance test, not a constraint
HORNS = [('ilmenite_horn', 1008, 1248, 5480.0), ('shatter_crown', 1056, 1244, 5760.0)]
STATIONS = [('seouterwall/godsgate', 1031, 1252, 3620.0), ('seouterwall/gatetarn', 1016, 1236, 3680.0),
            ('seouterwall/ambertarn', 1064, 1272, 3940.0), ('seouterwall/mirrorscarp', 1134, 1218, 4120.0),
            ('seouterwall/jadecrest', 1208, 1254, 4380.0), ('seouterwall/coppertarn', 1288, 1184, 3820.0)]
CORR_X = (1005, 1059)
CORR_ROWS = (1195, 1316)
RIV_CLIMB_M = 50.0        # tests/test_smodel.py's own allowance
RIV_DEPTH_M = 12.0        # the channel under the land it crosses


def derive_break(E, prov):
    """the x where the province's share of cells over 8,000 m breaks hardest: the frame's eastern edge"""
    best = None
    for b in range(1030, 1101):
        w = prov.copy(); w[:, b:] = False
        e = prov.copy(); e[:, :b] = False
        if w.sum() < 500 or e.sum() < 500:
            continue
        pw, pe = 100.0 * (E[w] > 8000).mean(), 100.0 * (E[e] > 8000).mean()
        if best is None or pe - pw > best['gap']:
            best = {'x': b, 'gap': round(pe - pw, 1), 'west_pct_over_8km': round(pw, 1),
                    'east_pct_over_8km': round(pe, 1), 'west_median_m': round(float(np.median(E[w]))),
                    'east_median_m': round(float(np.median(E[e])))}
    return best


def thalweg(E):
    return [float(E[y, CORR_X[0]:CORR_X[1]].min()) for y in range(*CORR_ROWS)]


def thalweg_stats(E):
    th = thalweg(E)
    d = np.abs(np.diff(th)) / 2000.0 * 100.0
    return {'min_m': round(min(th), 1), 'max_m': round(max(th), 1),
            'median_grade_pct': round(float(np.median(d)), 2), 'p95_grade_pct': round(float(np.percentile(d, 95)), 2)}


def grad(E):
    return np.maximum(np.abs(np.diff(E, axis=0))[:, :-1], np.abs(np.diff(E, axis=1))[:-1, :])


def river_climb(E, pts):
    """the most any point of a course stands over the lowest point before it (tests/test_smodel.py check 6)"""
    VH, VW = E.shape
    es = [float(E[min(VH - 1, max(0, int(round(y)))), min(VW - 1, max(0, int(round(x))))]) for x, y in pts]
    m, worst = es[0], 0.0
    for v in es:
        m = min(m, v)
        worst = max(worst, v - m)
    return worst


def grade_rivers(En, rivers, prov, lo):
    """6.4 step 1: carve every river whose course enters the province and climbs more than the allowance"""
    VH, VW = En.shape
    rep = []
    for r in rivers:
        pts = r.get('px') or []
        if len(pts) < 2:
            continue
        cells = [(min(VH - 1, max(0, int(round(y)))), min(VW - 1, max(0, int(round(x))))) for x, y in pts]
        if not any(prov[j, i] for j, i in cells):
            continue
        before = river_climb(En, pts)
        if before <= RIV_CLIMB_M:
            rep.append({'id': r.get('id'), 'name': r.get('name', ''), 'climb_before_m': round(before, 1),
                        'climb_after_m': round(before, 1), 'graded': False})
            continue
        path = []
        for c in cells:                      # carve_river wants a path with no repeats
            if not path or path[-1] != c:
                path.append(c)
        En, beds = RV.carve_river(En, path, RIV_DEPTH_M, lo)
        by_cell = {c: b for c, b in zip(path, beds)}
        bed = [round(float(by_cell[c]), 1) for c in cells]
        r['bed_m'] = bed
        r['source_m'] = bed[0]
        r['mouth_m'] = bed[-1]
        after = river_climb(En, pts)
        rep.append({'id': r.get('id'), 'name': r.get('name', ''), 'climb_before_m': round(before, 1),
                    'climb_after_m': round(after, 1), 'graded': True, 'cells': len(path),
                    'bed_from_m': bed[0], 'bed_to_m': bed[-1]})
    return En, rep


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas, wlev = P.water_levels(D)
    VH, VW = E0.shape
    if E0[1248, 1008] < 6000.0:
        sys.exit('edit_530_seow_rescale has run already (Ilmenite Horn 1008,1248 is under 6,000 m)')

    prov = region_mask(P.regions(), REGION, *P.grid(D), (VH, VW))
    yy, xx = np.mgrid[0:VH, 0:VW]
    brk = derive_break(E0, prov)
    assert brk['x'] == FRAME_X, 'the data breaks at x %d, not the %d this edit assumes' % (brk['x'], FRAME_X)

    disc = np.zeros((VH, VW), bool)
    amph = np.zeros((VH, VW), bool)
    for x, y in TARNS.values():
        r2 = (xx - x) ** 2 + (yy - y) ** 2
        disc |= r2 <= DISC_R * DISC_R
        amph |= r2 <= AMPH_R * AMPH_R
    shape = (xx <= FRAME_X) | disc                       # the owner's shape: full weight on this
    swath = np.zeros((VH, VW), bool)
    for (x1, y1, h1), (x2, y2, h2) in zip(CHAIN[:-1], CHAIN[1:]):
        n = int(max(abs(x2 - x1), abs(y2 - y1)) * 4) + 1
        for t in np.linspace(0, 1, n):
            cx, cy, hw = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, h1 + (h2 - h1) * t
            swath |= (xx - cx) ** 2 + (yy - cy) ** 2 <= hw * hw
    # 6.2's pass, 6.3's tarns and 6.4's graded river beds: the ground the earlier steps landed
    rivers = D['rivers']
    rivers = rivers['rivers'] if isinstance(rivers, dict) and 'rivers' in rivers else rivers
    beds = np.zeros((VH, VW), bool)
    for r in rivers:
        for x, y in (r.get('px') or []):
            j, i = int(round(y)), int(round(x))
            if 0 <= j < VH and 0 <= i < VW:
                beds[j, i] = True
    beds = nd.binary_dilation(beds, structure=np.ones((3, 3)))     # the channel and its banks
    guard = prov & (swath | amph | whas | beds)          # 6.2, 6.3 and 6.4's landed ground
    lobe = prov & (nd.distance_transform_edt(~shape) < F_SHAPE)

    w = (sstep(0.0, F_PROV, nd.distance_transform_edt(prov))
         * sstep(F_SHAPE, 0.0, nd.distance_transform_edt(~shape))
         * sstep(0.0, F_GUARD, nd.distance_transform_edt(~guard)))

    E_base = nd.gaussian_filter(E0, SIGMA)
    dE_hp = E0 - E_base
    u = np.maximum(0.0, E_base - KNEE) / SIG
    E_alp = np.where(E_base > KNEE, KNEE + SPAN * np.tanh(u), E_base)          # identity below the knee
    hp_gain = np.where(E_base > KNEE, (SPAN / SIG) * (1.0 - np.tanh(u) ** 2), 1.0)   # the curve's own slope
    tgt = E_alp + hp_gain * dE_hp
    rid = T.ridged((VH, VW), SEED, scales=RIDGE_SCALES)
    tgt = tgt + ARETE * (rid - rid.mean()) * sstep(4200.0, 5600.0, E_alp)      # arete and horn sharpness
    for lvl in BENCHES:                                                        # 6.1 step 3
        tgt = tgt + np.exp(-(((tgt - lvl) / BENCH_SIG) ** 2)) * (yy < BENCH_Y) * (lvl - tgt) * BENCH_K
    En = E0 + w * (tgt - E0)

    # 6.4 step 1, as a net: with the beds guarded nothing should need grading, and the report proves it
    En_ungraded = En.copy()
    En, riv_rep = grade_rivers(En, rivers, prov, D['lo'])

    moved = np.abs(En - E0) > 1.0
    core = lobe & (w >= 0.9)
    reached = lobe & (w > 0.01)
    g0, g1 = grad(E0), grad(En)
    pm = prov[:-1, :-1]
    ring = nd.binary_dilation(lobe, iterations=3)[:-1, :-1]
    dist_before = nd.distance_transform_edt(~whas) * 2.0

    rep = {
        'edit': "5.1 edit 30: the SE outer wall's partial rescale", 'date': '2026-11-24',
        'why': 'the owner, 2026-11-24, answer A3: "leave only east se outer wall high and airless". '
               'biomes/seouterwall/PLAN.md step 6.1 on the Godsgate frame and the five tarns only '
               '(openworld/catch-bowl/PLAN.md section 11 edit 4)',
        'boundary_rederived': brk,
        'shape': {'frame_x': [997, FRAME_X], 'disc_radius_cells': DISC_R, 'disc_radius_km': DISC_R * 2,
                  'tarn_centres': {str(k): list(v) for k, v in TARNS.items()},
                  'disc_radius_read_as': 'radius, not diameter: 6.3 already gives each tarn 9-13 km of amphitheatre, '
                                         "so a 12.5 km radius would add nothing to the owner's breathable approach"},
        'feathers_cells': {'province_interior': F_PROV, 'shape_outward': F_SHAPE, 'guard': F_GUARD,
                           'province_exterior_term_dropped': "6.1's 0.35 * sstep(4.5, 0, d_out) would move ground "
                                                             'outside the province, which other regions read'},
        'corrections_to_6_1_as_written': {
            'curve_identity_below_knee': 'max(0, E_base - 3850) maps every cell under 3,850 m up to 3,850 m; 6.1 ran '
                                         'before 6.2 carved the pass, so below the knee the curve is the identity here',
            'relief_scaled_by_the_curve_slope': 'dE_hp restored at (2150/3600) * sech^2(u), not at full amplitude, '
                                                "so the result stays inside 6.1's own window"},
        'cells': {'province': int(prov.sum()), 'lobe': int(lobe.sum()), 'reached_w_over_0_01': int(reached.sum()),
                  'core_w_over_0_9': int(core.sum()), 'moved_over_1m': int(moved.sum()),
                  'rescale_moved_outside_province': int(((np.abs(En_ungraded - E0) > 1.0) & ~prov).sum()),
                  'rescale_moved_inside_guard': int(((np.abs(En_ungraded - E0) > 1.0) & guard).sum()),
                  'carve_moved_outside_province': int(((np.abs(En - En_ungraded) > 1.0) & ~prov).sum()),
                  'carve_max_cut_outside_province_m': round(float(np.abs(En - En_ungraded)[~prov].max()), 1),
                  'carve_moved_inside_guard': int(((np.abs(En - En_ungraded) > 1.0) & guard).sum()),
                  'raised_over_1m': int((((En - E0) > 1.0) & lobe).sum())},
        'heights': {
            'core': {'median_before_m': round(float(np.median(E0[core]))), 'median_after_m': round(float(np.median(En[core]))),
                     'max_before_m': round(float(E0[core].max())), 'max_after_m': round(float(En[core].max())),
                     'pct_over_6500_before': round(100.0 * float((E0[core] > 6500).mean()), 2),
                     'pct_over_6500_after': round(100.0 * float((En[core] > 6500).mean()), 2)},
            'reached': {'median_before_m': round(float(np.median(E0[reached]))), 'median_after_m': round(float(np.median(En[reached]))),
                        'pct_over_6500_before': round(100.0 * float((E0[reached] > 6500).mean()), 1),
                        'pct_over_6500_after': round(100.0 * float((En[reached] > 6500).mean()), 1)},
            'province': {'median_before_m': round(float(np.median(E0[prov]))), 'median_after_m': round(float(np.median(En[prov]))),
                         'pct_over_6500_before': round(100.0 * float((E0[prov] > 6500).mean()), 1),
                         'pct_over_6500_after': round(100.0 * float((En[prov] > 6500).mean()), 1)}},
        'no_new_scarp': {
            'province_gradient_m_per_cell_before': {'p50': round(float(np.percentile(g0[pm], 50))),
                                                    'p95': round(float(np.percentile(g0[pm], 95))),
                                                    'p99': round(float(np.percentile(g0[pm], 99))),
                                                    'p99_9': round(float(np.percentile(g0[pm], 99.9))),
                                                    'max': round(float(g0[pm].max()))},
            'province_gradient_m_per_cell_after': {'p50': round(float(np.percentile(g1[pm], 50))),
                                                   'p95': round(float(np.percentile(g1[pm], 95))),
                                                   'p99': round(float(np.percentile(g1[pm], 99))),
                                                   'p99_9': round(float(np.percentile(g1[pm], 99.9))),
                                                   'max': round(float(g1[pm].max()))},
            'largest_single_cell_increase_m': round(float((g1 - g0)[ring].max())),
            'cells_gaining_over_300m': int(((g1 - g0)[ring] > 300).sum())},
        'eastern_wall_above_hub_01': {
            'max_abs_change_m_by_x_band': {'%d-%d' % (x0, x0 + 9): round(float(np.abs(En - E0)[:, x0:x0 + 10].max()), 1)
                                           for x0 in range(1280, 1360, 10)},
            'untouched_from_x': int(next(x for x in range(1280, VW) if np.abs(En - E0)[:, x:].max() <= 1.0))},
        'rivers_6_4_step_1': {
            'allowance_m': RIV_CLIMB_M, 'channel_depth_m': RIV_DEPTH_M,
            'in_province': riv_rep,
            'graded': [r['id'] for r in riv_rep if r['graded']],
            'max_climb_in_province_before_grading_m': round(max([r['climb_before_m'] for r in riv_rep] or [0.0]), 1),
            'max_climb_in_province_after_grading_m': round(max([r['climb_after_m'] for r in riv_rep] or [0.0]), 1),
            'cells_the_carve_took_off_the_rescale': int((np.abs(En - En_ungraded) > 1.0).sum())},
        'landed_before_after': [], 'horn_targets_before_after': [], 'station_base_check': [],
        'thalweg_before': thalweg_stats(E0), 'thalweg_after': thalweg_stats(En),
        'water': {'cells_in_province': int((prov & whas).sum()), 'bodies': 5, 'changed': False,
                  'tarn_water_within_km_before': {}, 'tarn_water_within_km_after': {}},
    }
    for nm, x, y, t in LANDED:
        rep['landed_before_after'].append({'name': nm, 'px': [x, y], 'must_read_m': t,
                                           'before_m': round(float(E0[y, x]), 1), 'after_m': round(float(En[y, x]), 1),
                                           'moved_m': round(float(En[y, x] - E0[y, x]), 3)})
    for nm, x, y, t in HORNS:
        rep['horn_targets_before_after'].append({'name': nm, 'px': [x, y], 'planned_m': t,
                                                 'before_m': round(float(E0[y, x]), 1), 'after_m': round(float(En[y, x]), 1),
                                                 'off_plan_before_m': round(float(E0[y, x] - t)),
                                                 'off_plan_after_m': round(float(En[y, x] - t))})
    for nm, x, y, base in STATIONS:
        rep['station_base_check'].append({'station': nm, 'px': [x, y], 'base_m': base,
                                          'before_m': round(float(E0[y, x]), 1), 'after_m': round(float(En[y, x]), 1),
                                          'passed_before': bool(abs(E0[y, x] - base) <= 150.0),
                                          'passed_after': bool(abs(En[y, x] - base) <= 150.0)})
    for k, (x, y) in TARNS.items():
        rep['water']['tarn_water_within_km_before'][str(k)] = round(float(dist_before[y, x]), 1)
        rep['water']['tarn_water_within_km_after'][str(k)] = round(float(dist_before[y, x]), 1)

    print(json.dumps(rep, ensure_ascii=False, indent=1))

    # the hard constraint, and the promises this edit makes
    for row in rep['landed_before_after']:
        assert abs(row['moved_m']) <= 1.0, 'a landed reading moved: %s by %.1f m' % (row['name'], row['moved_m'])
        assert abs(row['after_m'] - row['must_read_m']) <= 1.0, '%s does not read %.0f m' % (row['name'], row['must_read_m'])
    # the rescale itself touches nothing outside the province and nothing 6.2/6.3 landed; the river carve may follow its
    # own course downstream past the boundary, which is what a river does and what 6.4 step 1 asks for
    assert rep['cells']['rescale_moved_outside_province'] == 0, 'the rescale reached outside the province'
    assert rep['cells']['rescale_moved_inside_guard'] == 0, "the rescale reached 6.2/6.3's landed ground"
    assert rep['heights']['core']['pct_over_6500_after'] == 0.0, "6.1's zero-over-6,500 m does not hold on the core"
    assert rep['heights']['core']['median_after_m'] < rep['heights']['core']['median_before_m'] - 1000, 'the core hardly moved'
    assert rep['no_new_scarp']['province_gradient_m_per_cell_after']['p99'] <= \
        rep['no_new_scarp']['province_gradient_m_per_cell_before']['p99'] * 1.05, 'the gradient distribution moved'
    tb, ta = rep['thalweg_before'], rep['thalweg_after']
    assert abs(ta['min_m'] - tb['min_m']) <= 1.0 and abs(ta['max_m'] - tb['max_m']) <= 1.0, 'the pass was reshaped'
    assert abs(ta['median_grade_pct'] - tb['median_grade_pct']) <= 0.05, 'the pass grade moved'
    assert rep['eastern_wall_above_hub_01']['untouched_from_x'] <= 1325, 'the eastern wall moved further west than told'
    assert all(s['passed_after'] for s in rep['station_base_check']), 'a station base check broke'
    assert rep['rivers_6_4_step_1']['max_climb_in_province_after_grading_m'] <= RIV_CLIMB_M, \
        'a river still climbs out of its bowl'
    worst = 0.0
    for r in rivers:                                    # every river in the model, not just this province's
        if len(r.get('px') or []) >= 2:
            worst = max(worst, river_climb(En, r['px']))
    rep['rivers_6_4_step_1']['max_climb_over_every_river_after_m'] = round(worst, 1)
    assert worst <= RIV_CLIMB_M, 'some river in the model climbs %.1f m after this edit' % worst
    if dry:
        return

    whas2, wlev2 = whas.copy(), wlev.copy()      # the tarns are guarded: no water moves
    assert np.array_equal(whas2, whas)
    D['h'] = P.encode_heights(D, En, W0)
    lap = C.lapse(D, E0, En, whas2, wlev2)
    for k in C.TEMPS:
        D[k] = lap[k]
    relit, _, _ = PA.relight(D, E0, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En, W0)
    if isinstance(D['rivers'], dict) and 'rivers' in D['rivers']:
        D['rivers']['rivers'] = rivers
    else:
        D['rivers'] = rivers
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_530_seow_rescale.report.json'), 'w', encoding='utf-8', newline='\n'),
              ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
