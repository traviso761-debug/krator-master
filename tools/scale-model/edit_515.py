#!/usr/bin/env python3
"""Scale model 5.1, edit 5 (2026-11-11): the owner's decisions on the pending model edits (the owner, 2026-11-11: "yes go
godhearth vents etc; Region99 > neighbors (also can we fix its name as loom chasms once and for all), catch oases, high
rift gorge").

    python3 tools/scale-model/edit_515.py            # edits model/data and the page's defaults, writes edit_515.report.json

1. **Godshearth** (biomes/godshearth/PLAN.md section 8, model amendments 1-2): three geyser vent records on the caldera's
   vent lines (the hot lake's bed, the grove's line, the spillway's head), and an **outlet river** from the hot lake
   (3,642 m) down the spillway to Rifar al-Bihar (r442): its sill cut to 3,640 m so the lake spills, its bed carved to fall
   all the way; its flow the model's Turc runoff over the caldera; r442 and r272 below the junction carry it.
2. **Region 99 wins its overlaps, and is the Loom Chasms**: Stalker Gate (`rmvstalkergate`) and the Stalker range
   (`rmvkknh1am4fw`) lose the cells they shared with it (polygon difference, shapely; the largest piece kept); the region
   `rmvraoas90co7` keeps its id (records and the store key on it) and takes the name "Loom Chasms".
3. **The Catch's oases** (biomes/catch/PLAN.md section 8, names by the owner's leave "you propose", 2026-10-26): four new
   pins beside Stair (already one) at fans' toes on the Catch's floor. The plan's points were 4.22's; on 5.1 the floor
   (under 1,600 m) is ~110 px long, so the five sit in the plan's order along it: two north of Stair, two south.
4. **High Rift's gorge** (biomes/highrift/PLAN.md section 1: "the model's 34 km gorge is owed to the model"): Verdigris
   Beck from px 1395 to 1361 (34 px: the plan's "34 km" read as px) cut as an inner gorge one cell wide, its bed falling
   from the course's bed at the head to the Caldron's level at the mouth, its walls left standing.

Heights move only on those courses; temperatures, rain, class and zone only round them (lapse, reclimate, relight,
retint). The page's defaults are edited here, with one-time reconciles `krator.regMerged.5.1e5` and
`krator.settAdded.5.1e5`. Refuses to run twice (the outlet river is the marker).
"""
import copy, json, math, os, re, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]   # edit_511.py is in history/ since 5.1 edit 3
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402
import smodel.rivers as RV, smodel.hydro as HY, smodel.river_names as RN   # noqa: E402
from edit_511 import hexrgb   # noqa: E402
from edit_514 import pool_spill   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
NEW_RIVER = 'r_gh_spillway'
GH_ID, R99_ID = 'rmw4wou2y1hhc', 'rmvraoas90co7'
NEIGHBOURS = ('rmvstalkergate', 'rmvkknh1am4fw')
R99_NAME = 'Loom Chasms'
HOT_LAKE_AT, HOT_LEVEL, OUTLET_M = (839, 1394), 3642.0, 3640.0
VENTS = [  # px, name: the plan's three vent lines (section 8, amendment 1); floors read off the ground
    ([839.5, 1394.5], 'Hot Lake bed vents'),
    ([836.0, 1388.0], 'Grove vent line'),
    ([845.0, 1397.0], 'Spillway head vents'),
]
OASES = [  # the plan's order north to south, Yuni first (the records carry every form in the note); Stair is #3
    ('Kolli', "Kold'a", 'al-Kōl', 'Kholṭu', 'the cold one: the first water down from the notch, snowmelt seeping at the north fan\'s toe'),
    ('Arfwai', 'Afguai', 'al-Ḥafwē', 'Hāphwe', 'halfway (to Stair)'),
    ('Bitta', "Bit'ar", 'al-Bitar', 'Biṭṭar', 'bitter water: brackish, drinkable by beasts, not by people unless boiled with ash'),
    ('Lasso', "Last'a Guat'ar", 'al-Lāst', 'Lāsṭu', 'the last water before the southern passes, toward Strongbow'),
]
STAIR = (1106, 1442)
EIW_ID = 'rmvkaq9fftvpp'                 # 'e inner wall' -> 'e highlands' (the README's record list, item 1)
CATCH_GEO = 'rmuf346nvpktx'              # The Catch, geographic
SP_ID = 'rmwstalkerpks'                  # the new Stalker Peaks (item 4; biomes/catch/PLAN.md section 6c)
PEAKS = [(1287, 1293), (1321, 1481), (1397, 1505), (1411, 1409)]   # the plan's four peaks, 4.21 px + (272, 330)
HUB01 = (1344, 1409)
CATCH_BOX = tuple(int(v) for v in os.environ.get('E513_BOX', '1100,1480,620,1060').split(','))   # y0, y1, x0, x1: the outlet's drainage
GORGE_X = (1395.0, 1361.0)
GORGE_DEPTH = 100.0       # the inner gorge under the valley floor, at least
LIP_OVER_CALDRON = 110.0  # the gorge's mouth over the Caldron: the cataract
CALDRON_LEVEL_AT = (1358, 1661)


def main():
    D = P.load()
    if any(r['id'] == NEW_RIVER for r in D['rivers']):
        sys.exit('edit_515 has run already (%s exists)' % NEW_RIVER)
    rep = {'edit': '5.1 edit 5', 'date': '2026-11-11'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]]
    raw0 = {k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
            for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')}
    regions = P.regions()
    byid = {r['id']: r for r in regions}
    lab, _ = nd.label(whas0, structure=np.ones((3, 3)))
    En = Eo.copy()
    rivers = {r['id']: r for r in D['rivers']}

    # ---- 1a. Godshearth's vents: 5.1 edit 2 (edit_512.py) wrote six records at these sites (the lake's bed and shore, the
    # shore field and line, the grove's line, the spillway's head); this edit's three would repeat them, so it adds none
    have = [v for v in D['vents'] if v.get('region') == GH_ID]
    assert len(have) >= 3, 'Godshearth vent records missing (5.1 edit 2)'
    for px, name in ([] if have else VENTS):
        j, i = int(round(px[1])), int(round(px[0]))
        D['vents'].append({'px': px, 'floor': round(float(Eo[j, i]), 1), 'scale': 0.1, 'radius': 0.9, 'kind': 'geyser',
                           'name': name, 'region': 'godshearth'})
    rep['godshearth_vents'] = 'kept 5.1 edit 2\'s %d records' % len(have)

    # ---- 1b. the outlet river: the hot lake down the spillway to r442
    hot = lab == lab[HOT_LAKE_AT[1], HOT_LAKE_AT[0]]
    assert abs(float(np.nanmedian(wlev0[hot])) - HOT_LEVEL) < 1
    r442 = rivers['r442']
    goal = np.zeros(sh, bool)
    for p in densify(r442['px']):
        j_, i_ = int(round(p[1])), int(round(p[0]))
        if p[1] >= 1448 and Eo[j_, i_] < 3200:
            goal[j_, i_] = True
    ring = nd.binary_dilation(hot, structure=np.ones((3, 3))) & ~hot & (yy > np.argwhere(hot)[:, 0].max() - 1)
    sj, si = np.argwhere(ring)[np.argmin(np.where(ring, Eo, np.inf)[ring])]
    cost = En.copy()
    cost[hot] = 1e5
    path = RV.route_river(cost, 1.0, 1.0, (float(si), float(sj)), goal)
    on_shore = nd.binary_dilation(hot, structure=np.ones((3, 3))) & ~hot
    beds, bed = [], OUTLET_M
    for n, (j, i) in enumerate(path):
        bed = OUTLET_M if (n == 0 or on_shore[j, i]) else min(En[j, i] - 15.0, bed - 1.0)   # the sill: every shore cell
        beds.append(bed)
    end_bed = min(beds[-1], nearest_bed(r442, path[-1]), float(Eo[path[-1]]))
    beds[-1] = min(beds[-1], end_bed)
    beds = list(np.minimum.accumulate(beds))
    chan_gh = carve(En, path, beds, depth=15.0, protect=whas0 | goal)   # r442's own cells are not cut
    for j, i in path:
        if on_shore[j, i]:
            En[j, i] = OUTLET_M                     # the sill, raised where the shore stood lower
    # the hot lake stood over its own shore (3,605 m at 838,1397, under its 3,642 m): a sinter rim holds it, the outlet
    # its one way out
    shore = nd.binary_dilation(hot, structure=np.ones((3, 3))) & ~hot & ~chan_gh & ~whas0
    rim = shore & (En < HOT_LEVEL + 2.0)
    En[rim] = HOT_LEVEL + 2.0
    rep['godshearth_rim'] = {'cells': int(rim.sum()), 'raised_m_max': round(float((En - Eo)[rim].max())) if rim.any() else 0,
                             'held_m': HOT_LEVEL + 2.0}
    rep['godshearth_outlet'] = {
        'from_px': [int(si), int(sj)], 'sill_m': OUTLET_M, 'to_px': [path[-1][1], path[-1][0]], 'cells': len(path),
        'length_km': round(sum(math.hypot(a[0] - b[0], a[1] - b[1]) * 2 for a, b in zip(path, path[1:]))),
        'cut_m_max': round(float((Eo - En)[chan_gh].max())), 'bed_m': [round(beds[0]), round(beds[-1])],
        'spill': pool_spill_box(En, hot, goal, (1350, 1480, 790, 900))}
    assert abs(rep['godshearth_outlet']['spill']['spill_m'] - OUTLET_M) < 1.5, rep['godshearth_outlet']

    # ---- 4. High Rift's gorge (heights before the climate, so one reclimate covers all)
    ver = rivers['r_hr_verdigris']
    gpath = [(int(round(p[1])), int(round(p[0]))) for p in densify(ver['px']) if GORGE_X[1] <= p[0] <= GORGE_X[0]]
    gpath = [c for k, c in enumerate(gpath) if k == 0 or c != gpath[k - 1]]
    cal = lab == lab[CALDRON_LEVEL_AT[1], CALDRON_LEVEL_AT[0]]
    cal_level = float(np.nanmedian(wlev0[cal]))
    lip = cal_level + LIP_OVER_CALDRON                     # the cataract's lip: the page's four tiers drop from it
    b0 = min(float(En[gpath[0]]) - GORGE_DEPTH, nearest_bed(ver, gpath[0]))
    floor_m = cal_level + 15.0                              # never under the Caldron: the gorge shallows to its mouth
    gbeds = list(np.minimum.accumulate([max(min(float(En[c]) - GORGE_DEPTH, b0 + (lip - b0) * k / (len(gpath) - 1)),
                                            floor_m) for k, c in enumerate(gpath)]))
    walls_before = [float(np.median([Eo[c[0] + a, c[1] + b] for a in (-2, -1, 1, 2) for b in (0,)])) for c in gpath]
    chan_hr = carve(En, gpath, gbeds, depth=0.0, protect=whas0, banks=False)
    rep['highrift_gorge'] = {
        'from_px': [gpath[0][1], gpath[0][0]], 'to_px': [gpath[-1][1], gpath[-1][0]], 'cells': len(gpath),
        'length_km': round(sum(math.hypot(a[0] - b[0], a[1] - b[1]) * 2 for a, b in zip(gpath, gpath[1:]))),
        'bed_m': [round(gbeds[0]), round(gbeds[-1])], 'caldron_level_m': round(cal_level),
        'cataract_m': round(gbeds[-1] - cal_level),
        'cut_m_max': round(float((Eo - En)[chan_hr].max())), 'cut_m_mean': round(float((Eo - En)[chan_hr].mean())),
        'wall_over_bed_m_median': round(float(np.median([w - b for w, b in zip(walls_before, gbeds)])))}
    # the beck's record follows its new bed over the stretch, and stays falling
    ver['bed_m'] = list(np.minimum.accumulate([min(b, float(En[int(round(p[1])), int(round(p[0]))]))
                                               if GORGE_X[1] <= p[0] <= GORGE_X[0] else b
                                               for p, b in zip(ver['px'], ver['bed_m'])]))
    ver['bed_m'] = [round(float(b), 1) for b in ver['bed_m']]
    ver['gorge'] = '5.1 edit 5 (2026-11-11): an inner gorge cut from px %d to %d, %d km, bed %d to %d m' % (
        GORGE_X[0], GORGE_X[1], rep['highrift_gorge']['length_km'], gbeds[0], gbeds[-1])

    # ---- 1c. the outlet river's flow (Turc runoff down the carved drainage) and its record
    k_ev = D['hydro']['evap_k']
    Pm = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    Tm = P.raster(D, 'tm', 'L').astype(float) - 90
    Rr, _ = HY.runoff(Pm, Tm, k_ev)
    Rr[Tm <= -85] = 0.0
    y0, y1, x0, x1 = CATCH_BOX
    Sb = np.where(whas0, np.fmax(np.nan_to_num(wlev0, nan=-1e9), En), En)[y0:y1, x0:x1]
    sink = goal[y0:y1, x0:x1].copy()
    sink[0, :] = sink[-1, :] = sink[:, 0] = sink[:, -1] = True
    for r_ in D['rivers']:                        # every other course is its own drainage, not this one's
        if r_['id'] == NEW_RIVER:
            continue
        for p in densify(r_['px']):
            j_, i_ = int(round(p[1])) - y0, int(round(p[0])) - x0
            if 0 <= j_ < sink.shape[0] and 0 <= i_ < sink.shape[1]:
                sink[j_, i_] = True
    for j_, i_ in path:
        sink[j_ - y0, i_ - x0] = False
    Fb, order = HY.fill(Sb, sink)
    rec = HY.d8(Fb, sink)
    # the catchment: every cell whose drainage reaches the channel, labelled with the first channel cell it reaches
    # (`order` runs downstream first, so each receiver is labelled before the cells that drain to it)
    hit = np.full(Sb.shape, -1, int)
    pidx = {(j - y0, i - x0): n for n, (j, i) in enumerate(path[:-1])}
    for j, i in order:
        if (j, i) in pidx:
            hit[j, i] = pidx[(j, i)]
        else:
            a, b = rec[j, i]
            if a >= 0:
                hit[j, i] = hit[a, b]
    Rb = Rr[y0:y1, x0:x1]
    per = np.bincount(hit[hit >= 0], weights=Rb[hit >= 0], minlength=len(path))   # mm/yr summed, per channel cell
    q = list(np.cumsum(per[:len(path) - 1]) * 1e-3 * 4.0e6 / HY.SEC_YR)
    q.append(q[-1])
    area_km2 = float(((hit >= 0) & (Tm[y0:y1, x0:x1] > -85)).sum()) * 4.0   # the catchment with air (the airless rim yields nothing)
    qm = round(float(q[-1]), 1)
    pts = G.meander([(float(i), float(j)) for j, i in path], amp=0.3)
    seg = sum(math.hypot(a[0] - b[0], a[1] - b[1]) * 2 for a, b in zip(path, path[1:]))
    jn = nearest_vertex(r442, pts[-1])
    new = {'id': NEW_RIVER, 'name': '', 'kind': 'river' if qm >= RV.Q_RIVER else 'wadi',
           'length_km': round(seg), 'q_mouth_m3s': qm, 'source_m': OUTLET_M, 'mouth_m': round(float(beds[-1]), 1),
           'px': [[round(x, 2), round(y, 2)] for x, y in pts], 'bed_m': [round(float(b), 1) for b in beds],
           'tongue': r442.get('tongue', 'xanadui'), 'gloss': '', 'old_name': '',
           'q_m3s': [round(float(v), 1) for v in q], 'perennial': bool(qm >= RV.Q_RIVER), 'order': 1,
           'to': {'river': 'r442', 'name': r442['name'], 'at_px': r442['px'][jn]},
           'width_m': round(4.5 * qm ** 0.5), 'depth_m': round(0.35 * qm ** 0.38, 1),
           'catchment_km2': round(area_km2), 'region': 'godshearth',
           'settlements': [], 'added': '5.1 edit 5 (2026-11-11): Godshearth\'s hot lake spilling down its spillway'}
    D['rivers'].append(new)
    # its name: the model's own namer, run on a copy; every other river keeps its name (frozen)
    cp = copy.deepcopy(D['rivers'])
    RN.rename_all_rivers_culturally(cp, regions, P.settlements(), En_exp=En)
    nm = next(r for r in cp if r['id'] == NEW_RIVER)
    new['name'], new['tongue'], new['gloss'] = nm['name'], nm.get('tongue', new['tongue']), nm.get('gloss', '')
    # the 30 Xanadui courses the owner ruled on (2026-11-03, b6763589c): frozen_river_names.json holds their new names,
    # but model/data/rivers.json was merged back to the old ones; they are carried here, and nothing else may move
    frozen = json.load(open(RN.FROZEN_NAMES_PATH, encoding='utf-8'))
    fz = frozen if isinstance(frozen, dict) else {}
    byc = {r['id']: r for r in cp}
    moved = []
    for r in D['rivers']:
        if r['id'] == NEW_RIVER or byc[r['id']]['name'] == r['name']:
            continue
        assert byc[r['id']].get('tongue', r.get('tongue')) == 'xanadui', ('the namer moved a non-Xanadui name', r['id'])
        moved.append([r['id'], r['name'], byc[r['id']]['name']])
        r['name'], r['gloss'] = byc[r['id']]['name'], byc[r['id']].get('gloss', r.get('gloss', ''))
    rep['xanadui_names_restored'] = moved
    assert len(moved) <= 30, len(moved)
    names = {r['id']: r['name'] for r in D['rivers']}
    retold = 0
    for r in D['rivers']:                          # every junction names the river it joins as that river is now named
        t = r.get('to') or {}
        if t.get('river') in names and t.get('name') != names[t['river']]:
            t['name'] = names[t['river']]
            retold += 1
    rep['junction_names_updated'] = retold
    # r442 below the junction, then r272 below r442's mouth, carry it
    add_flow(r442, jn, qm)
    r272 = rivers['r272']
    add_flow(r272, nearest_vertex(r272, r442['px'][-1]), qm)
    rep['godshearth_outlet'].update({'name': new['name'], 'q_mouth_m3s': qm, 'catchment_km2': new['catchment_km2'],
                                     'joins_r442_at': r442['px'][jn], 'r442_q_mouth_now': r442['q_mouth_m3s'],
                                     'r272_q_mouth_now': r272['q_mouth_m3s']})

    # ---- 2. Region 99 over its neighbours, and its name
    from shapely.geometry import Polygon
    from shapely.validation import make_valid
    r99 = byid[R99_ID]
    p99 = make_valid(Polygon(r99['points']))
    rep['regions'] = {}
    for rid in NEIGHBOURS:
        r = byid[rid]
        before = G.poly(r['points'], 1.0, 1.0, sh)
        d_ = make_valid(Polygon(r['points'])).difference(p99)
        geoms = [g for g in getattr(d_, 'geoms', [d_]) if g.geom_type == 'Polygon']
        big = max(geoms, key=lambda g: g.area)
        ring_pts = [[int(round(x)), int(round(y))] for x, y in list(big.exterior.coords)[:-1]]
        ring_pts = [p for k, p in enumerate(ring_pts) if p != ring_pts[k - 1]]
        after = G.poly(ring_pts, 1.0, 1.0, sh)
        m99 = G.poly(r99['points'], 1.0, 1.0, sh)
        rep['regions'][rid] = {'name': r['name'], 'points_before': len(r['points']), 'points_after': len(ring_pts),
                               'cells_before': int(before.sum()), 'cells_after': int(after.sum()),
                               'overlap_before': int((before & m99).sum()), 'overlap_after': int((after & m99).sum()),
                               'pieces_dropped_km2': round(sum(g.area for g in geoms if g is not big) * 4),
                               'cells_gained_outside_old': int((after & ~before).sum())}
        assert (after & ~before).sum() <= 40, rid + ' grew'
        r['points'] = ring_pts
    rep['regions'][R99_ID] = {'name_before': r99['name'], 'name_after': R99_NAME}
    r99['name'] = R99_NAME
    # the README's record list, items 1 and 4 (the owner, 2026-11-11: "go 1 and 4")
    eiw = byid[EIW_ID]
    assert eiw['name'] == 'e inner wall' and not any(r['name'] == 'e highlands' for r in regions)
    rep['regions'][EIW_ID] = {'name_before': eiw['name'], 'name_after': 'e highlands'}
    eiw['name'] = 'e highlands'
    sp = stalker_peaks(byid, Eo, sh)
    regions.append(sp)
    byid[sp['id']] = sp
    spm = G.poly(sp['points'], 1.0, 1.0, sh)
    rep['regions'][sp['id']] = {
        'name': sp['name'], 'kind': sp['kind'], 'points': len(sp['points']), 'cells': int(spm.sum()),
        'km2': int(spm.sum()) * 4, 'heights_p10_50_90': [round(float(v)) for v in np.percentile(Eo[spm], [10, 50, 90])],
        'holds_peaks': [bool(spm[y, x]) for x, y in PEAKS + [HUB01]],
        'overlap_catch_cells': int((spm & G.poly(byid[CATCH_GEO]['points'], 1.0, 1.0, sh)).sum()),
        'overlap_geographic': {r['name']: int((spm & G.poly(r['points'], 1.0, 1.0, sh)).sum()) for r in regions
                               if r.get('kind') == 'geographic' and r['id'] != sp['id']
                               and (spm & G.poly(r['points'], 1.0, 1.0, sh)).sum() > 0}}

    # ---- 3. the Catch's oases
    catch = byid[CATCH_GEO]
    cm = G.poly(catch['points'], 1.0, 1.0, sh)
    floor = cm & ~whas0 & (En < 1600)
    sm = nd.gaussian_filter(En, 1.0)
    toe = floor & (En >= 1000) & (nd.maximum_filter(sm, size=5) - sm > 150)   # a floor cell under a rising fan, off the
    #                                                                           basin's deep middle (its soda lake's bed)
    fy, fx = np.nonzero(floor)
    north = (int(fx[fy == fy.min()].mean()), int(fy.min()))
    south = (int(fx[fy == fy.max()].mean()), int(fy.max()))
    targets = [lerp(north, STAIR, 0.0), lerp(north, STAIR, 0.5), lerp(STAIR, south, 0.5), lerp(STAIR, south, 1.0)]
    ty, tx = np.nonzero(toe)
    oases = []
    used = [STAIR]
    for (yu, iz, da, xa, gl), tgt in zip(OASES, targets):
        d = np.hypot(tx - tgt[0], ty - tgt[1])
        for u in used:
            d = np.where(np.hypot(tx - u[0], ty - u[1]) < 12, np.inf, d)
        k = int(np.argmin(d))
        px, py = int(tx[k]), int(ty[k])
        used.append((px, py))
        oases.append({'id': 'scatch%s01' % yu.lower(), 'name': yu, 'type': 'outpost', 'px': px, 'py': py,
                      'notes': "An oasis of the Catch's crossing: %s. Izani %s, Dasrī %s, Xanadui %s; caravaneers say "
                               "whichever their master's tongue is. A spring and seep at a fan's toe: a pool, a reed bed, "
                               "poplar and tamarisk, a well (%.0f m). biomes/catch/PLAN.md sections 4 and 8; placed by scale "
                               "model 5.1 edit 5 (2026-11-11)." % (gl, iz, da, xa, float(En[py, px])),
                      'createdAt': '2026-11-11T00:00:00.000Z'})
    rep['catch_oases'] = [{'name': o['name'], 'px': [o['px'], o['py']], 'ground_m': round(float(En[o['py'], o['px']]))}
                          for o in oases]
    rep['catch_oases_floor'] = {'north_end': north, 'south_end': south, 'stair': STAIR}

    # ---- 5. climate and paint where the ground moved
    moved = np.abs(En - Eo) > 0.5
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas0, wlev0)
    for k_, v in lap.items():
        D[k_] = v
    # Godshearth's climate is edit 1's (its classes read off its own temperatures): the reclimate leaves it alone
    from edit_511 import gh_weight
    rain2, cls2, zon2, qmask, crep = C.reclimate(D, Eo, En, whas0, gh_weight(sh, whas0) > 0.2)
    rep['reclimate'] = crep
    D['h'] = P.encode_heights(D, En, water0)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k_, v in relit.items():
        D[k_] = v
    nearm = nd.binary_dilation(moved, iterations=3)
    for k_ in ('st', 't'):
        D[k_] = P.jpeg_like(D, k_, PA.retint(P.raster(D, k_), EoF, EnF, nearm, ~nearm, 150.0))
    codes = [c['code'] for c in D['climate']['classes']]
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        kk = codes.index(pr['code'])
        pr['km2'] = int(dc.get(kk, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(kk, 0) / cnow.size, 2)

    # ---- 6. nothing else moved
    assert not (np.any(P.raster(D, 'h') != raw0['h'], -1) & ~moved).any(), 'h changed off the courses'
    site = nd.binary_dilation(moved, iterations=4)
    for k_ in ('tm', 'th', 'tl', 'tw', 'tc', 'p', 'c', 'z'):
        assert not ((P.raster(D, k_, 'L') != raw0[k_]) & ~site & ~qmask).any(), k_ + ' changed off the sites'
    rep['cells_changed'] = {'h': int(moved.sum()), **{k_: int((P.raster(D, k_, 'L') != raw0[k_]).sum())
                                                      for k_ in ('tm', 'p', 'c', 'z')}}

    # ---- 7. the page's defaults (checked before anything is written)
    writes = page_defaults(byid, oases)
    P.save(D)
    for path_, text in writes:
        open(path_, 'w', encoding='utf-8', newline='').write(text)
    json.dump(rep, open(os.path.join(HERE, 'edit_515.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False, default=lambda o: o.tolist() if hasattr(o, 'tolist') else str(o))
    print(json.dumps(rep, indent=1, ensure_ascii=False, default=lambda o: o.tolist() if hasattr(o, 'tolist') else str(o)))


def stalker_peaks(byid, E, sh):
    """the Stalker Peaks (biomes/catch/PLAN.md 6c): the ranges from the Catch's eastern wall out to and round Hub 01's high
    valley and its four peaks: the hull of the Catch's eastern edge (y 1275-1515) and the peaks and Hub 01 (each widened by
    10 px), less the Catch (both its polygons), the largest piece, simplified to 2 px"""
    from shapely.geometry import MultiPoint, Polygon, Point
    from shapely.validation import make_valid
    cg = byid[CATCH_GEO]
    xs = [p[0] for p in cg['points']]
    edge = [tuple(p) for p in cg['points'] if p[0] >= max(xs) - 45 and 1275 <= p[1] <= 1515]
    pts = edge + [tuple(p) for q in PEAKS + [HUB01] for p in Point(q).buffer(10, 8).exterior.coords]
    hull = MultiPoint(pts).convex_hull
    for cid in (CATCH_GEO, 'rmvka7icdn1dq'):
        hull = hull.difference(make_valid(Polygon(byid[cid]['points'])))
    geoms = [g for g in getattr(hull, 'geoms', [hull]) if g.geom_type == 'Polygon']
    big = max(geoms, key=lambda g: g.area).simplify(2.0)
    ring = [[int(round(x)), int(round(y))] for x, y in list(big.exterior.coords)[:-1]]
    ring = [p for k, p in enumerate(ring) if p != ring[k - 1]]
    return {'id': SP_ID, 'name': 'Stalker Peaks', 'color': '#6f7f8f', 'points': ring,
            'notes': "East of the Catch: the ranges from its eastern wall (7-11 km) to Hub 01's high valley (~4.4-6 km; Hub 01, "
                     "the ruined arcology run by a mad AI, at 1344,1409) and the 12-15 km peaks round it (1287,1293; "
                     "1321,1481; 1397,1505; 1411,1409). The Stalkers' country; no caravan takes its passes. "
                     "biomes/catch/PLAN.md section 6c; scale model 5.1 edit 5 (2026-11-11).",
            'kind': 'geographic', 'createdAt': '2026-11-11T00:00:00.000Z'}


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def densify(px):
    """a course's vertices with the cells between them (map px, one per cell step)"""
    out = []
    for a, b in zip(px, px[1:]):
        n = max(1, int(math.ceil(max(abs(b[0] - a[0]), abs(b[1] - a[1])))))
        out += [(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n) for k in range(n)]
    return out + [tuple(px[-1])]


def nearest_vertex(r, p):
    d = [math.hypot(q[0] - p[0], q[1] - p[1]) for q in r['px']]
    return int(np.argmin(d))


def nearest_bed(r, cell):
    k = nearest_vertex(r, (cell[1], cell[0]))
    return float(r['bed_m'][k])


def add_flow(r, k0, dq):
    """a river below vertex k0 carries dq more: q, mouth, width, depth"""
    if r.get('q_m3s'):
        r['q_m3s'] = [round(v + (dq if k >= k0 else 0.0), 1) for k, v in enumerate(r['q_m3s'])]
    r['q_mouth_m3s'] = round(r['q_mouth_m3s'] + dq, 1)
    if 'q_mouth' in r:
        r['q_mouth'] = r['q_mouth_m3s']
    r['width_m'] = round(4.5 * r['q_mouth_m3s'] ** 0.5)
    r['depth_m'] = round(0.35 * r['q_mouth_m3s'] ** 0.38, 1)
    r['perennial'] = True


def carve(En, path, beds, depth, protect, banks=True):
    """each path cell lowered to its bed; with banks, the 8 neighbours eased toward it (as smodel.rivers.carve_river)"""
    chan = np.zeros(En.shape, bool)
    for (j, i), b in zip(path, beds):
        if protect[j, i]:
            continue
        En[j, i] = min(En[j, i], b) if chan.any() else b
        chan[j, i] = True
        if banks:
            for dj in (-1, 0, 1):
                for di in (-1, 0, 1):
                    jj, ii = j + dj, i + di
                    if (dj or di) and not protect[jj, ii]:
                        En[jj, ii] = min(En[jj, ii], max(b + max(depth, 15.0) * 2.5, En[jj, ii] - max(depth, 15.0)))
    return chan


def pool_spill_box(E, pool, target, box):
    import edit_514
    old = edit_514.BOX
    edit_514.BOX = box
    try:
        return pool_spill(E, pool, target)
    finally:
        edit_514.BOX = old


def page_defaults(byid, oases):
    """the region and settlement defaults in model/src, and their one-time reconciles; returns [(path, text)]"""
    writes = []
    path = os.path.join(SRC, '51-region-store.js')
    s = open(path, encoding='utf-8', newline='').read()
    for rid in (R99_ID, EIW_ID) + NEIGHBOURS:
        r = byid[rid]
        m = re.search(r'\{"id": "%s", "name": "([^"]*)", "color": "[^"]*", "points": (\[\[.*?\]\])' % rid, s)
        assert m, rid
        s = s[:m.start(2)] + json.dumps(r['points']) + s[m.end(2):]
        s = s[:m.start(1)] + r['name'] + s[m.end(1):]
    m = re.search(r'const defRegs = (\[.*?\]);\n', s)
    assert SP_ID not in m.group(1)
    s = s[:m.end(1) - 1] + ', ' + json.dumps(byid[SP_ID]) + ']' + s[m.end(1):]
    anchor = "        localStorage.setItem('krator.regMerged.5.1e1','1');\n        localSave();\n      }\n"
    assert s.count(anchor) == 1
    s = s.replace(anchor, anchor + (
        "      if(localStorage.getItem('krator.regMerged.5.1e5')!=='1'){   // 5.1 edit 5: the Loom Chasms (was Region 99) over Stalker Gate and the Stalker range; e highlands (was e inner wall); the Stalker Peaks\n"
        "        [\"rmvraoas90co7\", \"rmvstalkergate\", \"rmvkknh1am4fw\", \"rmvkaq9fftvpp\", \"rmwstalkerpks\"].forEach(id=>{ const d=defMap.get(id); if(d) regions.set(id,d); });\n"
        "        localStorage.setItem('krator.regMerged.5.1e5','1');\n        localSave();\n      }\n"))
    writes.append((path, s))
    path = os.path.join(SRC, '60-settlements.js')
    s = open(path, encoding='utf-8', newline='').read()
    m = re.search(r'const defSetts = (\[.*?\]);\n', s)
    defs = json.loads(m.group(1))
    assert not any(o['id'] in {d['id'] for d in defs} for o in oases)
    ea = '\\u' in m.group(1)                       # the list's own escaping, so only the new pins show in the diff
    s = s[:m.end(1) - 1] + ', ' + ', '.join(json.dumps(o, ensure_ascii=ea) for o in oases) + ']' + s[m.end(1):]
    anchor = "  const SETT_ADDED={\n"
    assert s.count(anchor) == 1
    s = s.replace(anchor, anchor + "    '5.1e5':" + json.dumps(oases, ensure_ascii=ea) + ",\n")
    writes.append((path, s))
    return writes


if __name__ == '__main__':
    main()
