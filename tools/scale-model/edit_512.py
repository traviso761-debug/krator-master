#!/usr/bin/env python3
"""Scale model 5.1, edit 2 (2026-11-12): the Firebliss Patera and its pancake domes, and the pancake domes round Korona
(the owner's decisions of 2026-11-12; biomes/firebliss/PLAN.md sections 1a-1d, biomes/korona/PLAN.md "Amendment").

    python3 tools/scale-model/edit_512.py            # edits model/data in place, writes edit_512.report.json

1. The Firebliss Patera (biomes/firebliss/PLAN.md 1a): the Great Firebliss Vale's floor taken over by a lava lake. An
   oval 48 x 32 km (semi-axes 12 x 8 px, its long axis 6 degrees north of east) round 181,1317.5, its crust at 2,240 m;
   the vale's warm tarn (60 water cells at 2,280 m) is gone under it. Inside the oval every cell is cut or filled to the
   crust, so the vale's walls stand straight out of it; a lip of 2,740 m (500 m over the crust) is held on the cells just
   outside the shore where the ground is lower (the vale's east and west ends), eased back into the ground over the next
   3-4 cells. The island (the Holm): an oval 12 x 9 km round 175.5,1315, in the lake's west half, its top flat at 2,700 m, never reached.
2. The Firebliss domes (the same plan, 1c): five flat-topped, steep-sided tables of obsidian-skinned rhyolite on the
   patera's shoulders, 8-14 km across, 400-550 m over their own ground.
3. The Korona domes (biomes/korona/PLAN.md, "Amendment 2026-11-12"): five tables 12-20 km across, 500-700 m high, on the
   floors of the corona's trenches and its outer moat, where the ring faults reach the plume-melted basement.
4. The climate, only where the plans say: temperatures lapsed with every height change (smodel.climate.lapse); rain,
   class and zone re-derived where the ground moved (smodel.climate.reclimate), the patera's floor apart: there the plan's
   heat-island temperatures and a new class `L` (patera: lava-lake crust); and the heat low's rain ring, +900 mm at its
   peak 8-24 km off the shore, nothing past 56 km, the classes in it kept (they are temperature-bound: ET, EF, Dfc, Cfb).
5. The records: the patera as a vent (`kind: patera`: the page draws its lava disc, glow and plume) and as a basin
   (`kind: lava lake`); the ten domes under a new key `domes`; the Tlahn Warra's head moved off the lava to the patera's
   east lip. No settlement: the plan settles nobody (the island's people are a question for the owner).

Heights move only in the patera, its lip and the domes; temperatures there and on the patera's floor; rain, class and zone
there, in the rain ring and where reclimate re-derived them. Every other cell of every raster is checked unchanged.
Refuses to run twice (the patera's vent record is the marker). Re-runnable on data that already carries edit 513 (the
Slabfields): it reads whatever model/data holds and checks only its own cells.
"""
import json, os, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402

# ---- the specs (the plans' numbers)
PATERA = dict(name='Firebliss Patera', c=(181.0, 1317.5), a=12.0, b=8.0, rot_deg=-6.0, crust_m=2240.0, lip_m=2740.0)
ISLAND = dict(name='the Holm', c=(175.5, 1315.0), a=3.0, b=2.2, top_m=2700.0)
LIP_EASE = (1.0, 1.15, 1.55)        # rho: the lip held to 1.15, eased back into the ground by 1.55
RING = dict(mm=900.0, rise_px=(0.0, 4.0), fall_px=(12.0, 28.0))   # rain ring: +900 mm from 8 to 24 km off the shore
# the patera's floor: the heat island over the crust (default taken, owner to confirm: firebliss PLAN 1b)
FLOOR_T = dict(tm=28.0, tw=34.0, tc=20.0, th=50.0, tl=8.0)
FLOOR_RAIN_MM = 1200.0              # what falls on the crust and flashes off it
L_CLASS = {'code': 'L', 'name': 'patera (lava-lake crust)', 'color': '#5a1a0a', 'group': 'L'}
GFV_TARN = (184, 1318, 2280.0)      # the Great Firebliss Vale's tarn, which the patera replaces
FB_REGION, KO_REGION = 'rmw8hj62nmugn', 'rmuqm3urh0mo6'

# the domes: id, name, centre px, diameter km, height over their ground m
DOMES = [
    ('dome_fb_north', 'North Glass', 'Firebliss Range', (175.0, 1302.0), 12.0, 500.0),
    ('dome_fb_west', 'West Glass', 'Firebliss Range', (157.0, 1324.0), 10.0, 450.0),
    ('dome_fb_south', 'South Glass', 'Firebliss Range', (175.0, 1335.0), 14.0, 550.0),
    ('dome_fb_southeast', 'Ember Glass', 'Firebliss Range', (201.0, 1331.0), 8.0, 400.0),
    ('dome_fb_east', 'Gate Glass', 'Firebliss Range', (211.0, 1305.0), 10.0, 450.0),
    ('dome_ko_nw_trench', 'Korona dome 1 (NW trench)', 'Korona / NE', (1007.0, 490.0), 14.0, 600.0),
    ('dome_ko_ne_trench', 'Korona dome 2 (NE trench)', 'Korona / NE', (1131.0, 494.0), 12.0, 500.0),
    ('dome_ko_s_trench', 'Korona dome 3 (S trench)', 'Korona / NE', (1038.0, 581.0), 16.0, 650.0),
    ('dome_ko_se_moat', 'Korona dome 4 (SE moat)', 'Korona / NE', (1179.0, 578.0), 16.0, 650.0),
    ('dome_ko_n_trench', 'Korona dome 5 (N trench)', 'Korona / NE', (1071.0, 430.0), 14.0, 600.0),
]
DOME_TOP, DOME_EDGE = 0.72, 1.0     # flat to 72% of the radius, then the wall (steep: about one cell)

PATERA_NOTE = ("The Firebliss Patera: a lava lake 48 x 32 km under a thin black crust, in the Great Firebliss Vale's old "
               "floor, its crust at 2,240 m behind walls of 2.7-4.5 km. Once a year the crust founders: two fronts start "
               "at the west shore and run round both sides of the Holm at about a kilometre a day, meeting on the east "
               "shore some 40-60 days later. About 3-4 TW: a permanent heat low, its storm column over the lake and a "
               "ring of rain and lightning round it. biomes/firebliss/PLAN.md section 1a; the owner, 2026-11-12.")
HOLM_NOTE = ("The Holm: the patera's island, 12 x 9 km, its top 2,700 m (460 m over the crust), which the turn never "
             "reaches. Reached only across the crust. biomes/firebliss/PLAN.md section 1b.")


def priority_fill(E, box):
    """(edit_511.py's, copied so this script stands alone when that one moves to history/) depression-filled heights over a box (y0, y1, x0, x1), its edge the outlet: a cell under its fill is in a pit"""
    import heapq
    y0, y1, x0, x1 = box
    S = E[y0:y1, x0:x1]
    H, W = S.shape
    F = np.full(S.shape, np.inf)
    seen = np.zeros(S.shape, bool)
    q = []
    for j in range(H):
        for i in range(W):
            if j in (0, H - 1) or i in (0, W - 1):
                F[j, i] = S[j, i]; seen[j, i] = True; heapq.heappush(q, (S[j, i], j, i))
    while q:
        h, j, i = heapq.heappop(q)
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                jj, ii = j + a, i + b
                if 0 <= jj < H and 0 <= ii < W and not seen[jj, ii]:
                    seen[jj, ii] = True
                    F[jj, ii] = max(S[jj, ii], h)
                    heapq.heappush(q, (F[jj, ii], jj, ii))
    return F


def ell_rho(xx, yy, c, a, b, rot_deg=0.0):
    """normalised elliptical radius (1 on the oval's edge)"""
    t = np.radians(rot_deg)
    dx, dy = xx - c[0], yy - c[1]
    u = dx * np.cos(t) + dy * np.sin(t)
    v = -dx * np.sin(t) + dy * np.cos(t)
    return np.hypot(u / a, v / b)


def main():
    D = P.load()
    if any(v.get('kind') == 'patera' and v.get('name') == PATERA['name'] for v in D['vents']):
        sys.exit('edit_512 has run already (the Firebliss Patera is in vents.json)')
    rep = {'edit': '5.1 edit 2', 'date': '2026-11-12'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    assert Eo.shape == (D['fullH'], D['fullW']), 'the height grid is the full grid since 5.1'
    sh = Eo.shape
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]].astype(float)
    codes = [c['code'] for c in D['climate']['classes']]
    raw0 = {k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
            for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc', 'st', 't', 'rt', 'ct')}
    En = Eo.copy()

    # ---- 1. the patera, its lip and the Holm
    rho = ell_rho(xx, yy, PATERA['c'], PATERA['a'], PATERA['b'], PATERA['rot_deg'])
    rho_i = ell_rho(xx, yy, ISLAND['c'], ISLAND['a'], ISLAND['b'], PATERA['rot_deg'])
    oval = rho < 1.0
    holm = rho_i < 1.0
    lava = oval & ~holm
    tx, ty, tl = GFV_TARN
    tarn = whas0 & (np.hypot(xx - tx, yy - ty) < 14)
    assert tarn.sum() > 0 and (np.abs(wlev0[tarn] - tl) < 3).all(), 'the vale tarn is not where the seed plan put it'
    assert not (tarn & ~lava).any(), 'the vale tarn reaches outside the lava'
    assert not (whas0 & oval & ~tarn).any(), 'other water inside the patera'
    En[lava] = PATERA['crust_m']
    top = ISLAND['top_m'] - 140.0 * G.sstep(0.55, 1.0, rho_i)      # a flat top, its rim breaking off in one cell
    En[holm] = np.where(rho_i[holm] < 0.8, ISLAND['top_m'], np.maximum(top[holm], PATERA['crust_m'] + 250))
    ring = (rho >= LIP_EASE[0]) & (rho < LIP_EASE[2])
    lipT = PATERA['crust_m'] + (PATERA['lip_m'] - PATERA['crust_m']) * (1 - G.sstep(LIP_EASE[1], LIP_EASE[2], rho))
    lipped = ring & (Eo < lipT)
    En[ring] = np.maximum(Eo[ring], lipT[ring])
    shore = nd.binary_dilation(lava, structure=np.ones((3, 3))) & ~lava & ~holm
    rep['patera'] = {
        'name': PATERA['name'], 'centre_px': list(PATERA['c']), 'semi_axes_px': [PATERA['a'], PATERA['b']],
        'size_km': [PATERA['a'] * 4, PATERA['b'] * 4], 'rot_deg': PATERA['rot_deg'], 'crust_m': PATERA['crust_m'],
        'lava_cells': int(lava.sum()), 'lava_km2': int(lava.sum()) * 4, 'oval_km2': int(oval.sum()) * 4,
        'tarn_cells_replaced': int(tarn.sum()), 'tarn_level_m': tl,
        'cut_m_max': round(float((Eo - En)[lava].max())), 'fill_m_max': round(float((En - Eo)[lava].max())),
        'shore_min_m': round(float(En[shore].min())), 'shore_median_m': round(float(np.median(En[shore]))),
        'lip_cells_raised': int(lipped.sum()), 'lip_fill_m_max': round(float((En - Eo)[lipped].max())) if lipped.any() else 0,
        'heat_TW_at_1_3_5_kW_m2': [round(int(lava.sum()) * 4e6 * f / 1e12, 2) for f in (1e3, 3e3, 5e3)]}
    rep['holm'] = {'name': ISLAND['name'], 'centre_px': list(ISLAND['c']), 'size_km': [ISLAND['a'] * 4, ISLAND['b'] * 4],
                   'cells': int(holm.sum()), 'km2': int(holm.sum()) * 4, 'top_m': ISLAND['top_m'],
                   'over_crust_m': ISLAND['top_m'] - PATERA['crust_m'], 'edge_min_m': round(float(En[holm].min()))}
    assert rep['holm']['edge_min_m'] > PATERA['crust_m'] + 200
    assert rep['patera']['shore_min_m'] >= PATERA['crust_m'] + 400, 'the lava could spill: the shore is too low'

    # ---- 2. the domes
    rivers_px = [(r.get('id'), p) for r in D['rivers'] for p in (r.get('px') or [])]
    dmask_all = np.zeros(sh, bool)
    dome_recs = []
    for did, name, region, (cx, cy), dkm, hm in DOMES:
        R = dkm / 4.0                                    # radius in 2 km cells
        r = np.hypot(xx - cx, yy - cy) / R
        foot = r < DOME_EDGE
        assert not (nd.binary_dilation(foot, iterations=1) & whas0).any(), did + ' touches water'
        assert not (foot & (rho < LIP_EASE[2])).any(), did + ' is on the patera'
        near_r = [rid for rid, (px, py) in rivers_px if np.hypot(px - cx, py - cy) < R + 1.5]
        assert not near_r, '%s is on a river: %s' % (did, near_r)
        base = float(np.median(Eo[foot]))
        top_m = max(base + hm, float(np.percentile(Eo[foot], 90)) + 0.4 * hm)
        prof = top_m - (top_m - Eo) * G.sstep(DOME_TOP, DOME_EDGE, r)   # flat top, a wall of about one cell
        up = foot & (prof > En)
        En[up] = prof[up]
        dmask_all |= up
        dome_recs.append({
            'id': did, 'name': name, 'region': region, 'px': [cx, cy], 'd_km': dkm, 'base_m': round(base),
            'top_m': round(top_m), 'h_m': round(top_m - base), 'cells': int(up.sum()),
            'wall_m_max': round(float(np.max(np.abs(np.diff(En[int(cy) - 6:int(cy) + 7, int(cx) - 6:int(cx) + 7], axis=1))))),
            'kind': 'pancake_dome', 'rock': 'rhyolite_obsidian'})
    rep['domes'] = dome_recs

    moved = np.abs(En - Eo) > 0.5
    # no new pit round the patera but the patera itself (rain on the lip runs off it), none at a dome
    for nm, box in (('patera', (1290, 1345, 150, 220)),):
        F0, F1 = priority_fill(Eo, box), priority_fill(En, box)
        sub0, sub1 = Eo[box[0]:box[1], box[2]:box[3]], En[box[0]:box[1], box[2]:box[3]]
        lv = lava[box[0]:box[1], box[2]:box[3]]
        pits0, pits1 = int(((F0 - sub0) > 1).sum()), int((((F1 - sub1) > 1) & ~lv).sum())
        rep['patera']['pit_cells_outside_lava_before_after'] = [pits0, pits1]
    for d in dome_recs:
        cx, cy = d['px']
        box = (int(cy) - 14, int(cy) + 15, int(cx) - 14, int(cx) + 15)
        sub0, sub1 = Eo[box[0]:box[1], box[2]:box[3]], En[box[0]:box[1], box[2]:box[3]]
        p0 = int(((priority_fill(Eo, box) - sub0) > 1).sum())
        p1 = int(((priority_fill(En, box) - sub1) > 1).sum())
        d['pit_cells_before_after'] = [p0, p1]

    # ---- 3. water: the tarn gone
    whas2, wlev2 = whas0.copy(), wlev0.copy()
    whas2[tarn], wlev2[tarn] = False, np.nan
    water2 = water0 & ~tarn

    # ---- 4. temperatures lapsed with the surface, then rain, class and zone where the ground moved
    for k, v in C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2).items():
        D[k] = v
    forced = lava | tarn
    rain2, cls2, zon2, q, crep = C.reclimate(D, Eo, En, whas2, forced)
    rep['reclimate'] = crep
    # the patera's floor: the heat island, class L
    if L_CLASS['code'] not in codes:
        D['climate']['classes'].append(dict(L_CLASS))
        codes.append(L_CLASS['code'])
    Lk = codes.index(L_CLASS['code'])
    for k, v in FLOOR_T.items():
        a = P.raster(D, k, 'L').astype(float)
        a[lava] = v + 90
        D[k] = P.b64(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'L'), optimize=True)
    cls2[lava] = Lk
    rain2[lava] = FLOOR_RAIN_MM
    zfloor = Counter(raw0['z'][shore & ~whas0].tolist()).most_common(1)[0][0]
    zon2[lava] = zfloor
    # the rain ring: the heat low's column rains out round the lake
    dpx = nd.distance_transform_edt(~oval)
    ringw = G.sstep(RING['rise_px'][0], RING['rise_px'][1], dpx) * (1 - G.sstep(RING['fall_px'][0], RING['fall_px'][1], dpx))
    land2 = ~whas2 & (cls2 != codes.index("O"))
    ringw = np.where(land2 & ~oval, ringw, 0.0)
    rain_before_ring = rain2.copy()
    rain2 = np.minimum(4000.0, rain2 + RING['mm'] * ringw)
    inring = ringw > 0.01
    bk = [codes.index(c_) for c_ in ('BWh', 'BWk', 'BSh', 'BSk')]
    rep['rain_ring'] = {
        'cells': int(inring.sum()), 'peak_mm': RING['mm'], 'peak_km_off_shore': [RING['rise_px'][1] * 2, RING['fall_px'][0] * 2],
        'zero_km_off_shore': RING['fall_px'][1] * 2,
        'mean_mm_before_after': [round(float(rain_before_ring[inring].mean())), round(float(rain2[inring].mean()))],
        'classes_in_ring': dict(Counter(codes[c_] for c_ in cls2[inring].tolist()).most_common()),
        'dry_class_cells_in_ring': int(np.isin(cls2[inring], bk).sum())}
    assert rep['rain_ring']['dry_class_cells_in_ring'] == 0, 'a dry class in the rain ring would want reclassing'

    # ---- 5. the paint
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    col = np.array([[int(c_['color'][i:i + 2], 16) for i in (1, 3, 5)] for c_ in D['climate']['classes']], float)
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    relit, EoF, EnF = PA.relight(D, Eo, En)
    for k, v in relit.items():
        D[k] = v
    near = nd.binary_dilation(moved, iterations=3)
    seam = nd.binary_dilation(lava, iterations=1) & ~nd.binary_erosion(lava, iterations=1) & lava
    rng = np.random.default_rng(512)
    crust_det = nd.gaussian_filter(rng.normal(0, 1, sh), 1.2)
    for k in ('st', 't'):
        a = P.raster(D, k)
        a = PA.retint(a, EoF, EnF, near & ~lava, ~near, 150.0)
        af = a.astype(float)
        lum = af.mean(-1)
        det = np.clip((lum + 4) / (nd.gaussian_filter(lum, 3.0) + 4), .85, 1.15)[..., None]
        # the crust: near-black basalt glass, a dull red where the last front's seams still glow, a hot margin at the shore
        crust = np.array([34.0, 29.0, 28.0]) * (1 + 0.12 * crust_det)[..., None] * det
        crust = np.where((crust_det > 1.0)[..., None], crust * 0.6 + np.array([92.0, 30.0, 14.0]) * 0.4, crust)
        crust = np.where(seam[..., None], crust * 0.4 + np.array([170.0, 62.0, 20.0]) * 0.6, crust)
        w = np.clip(nd.gaussian_filter(lava.astype(float), 0.6) * 1.4, 0, 1)[..., None] * lava[..., None]
        af = af * (1 - w) + crust * w
        # the domes' tops: glass-dark rhyolite, grey pumice skin in streaks
        rd = np.zeros(sh)
        for d in dome_recs:
            rd = np.maximum(rd, 1 - G.sstep(0.5, 1.05, np.hypot(xx - d['px'][0], yy - d['px'][1]) / (d['d_km'] / 4.0)))
        glass = np.array([46.0, 44.0, 48.0]) * det * (1 + 0.18 * crust_det)[..., None]
        wd = (0.75 * rd)[..., None]
        af = af * (1 - wd) + glass * wd
        D[k] = P.jpeg_like(D, k, np.clip(af, 0, 255))

    # ---- 6. records
    rep['vent'] = {'name': PATERA['name'], 'px': list(PATERA['c']), 'floor': PATERA['crust_m'], 'scale': 0.6,
                   'radius': PATERA['b'] * 2.0, 'kind': 'patera', 'region': 'Firebliss Range', 'notes': PATERA_NOTE}
    D['vents'].append(rep['vent'])
    rep['basin'] = {'at_px': list(PATERA['c']), 'level_m': int(PATERA['crust_m']), 'km2': int(lava.sum()) * 4,
                    'kind': 'lava lake', 'climate': 'L', 'island': {'name': ISLAND['name'], 'at_px': list(ISLAND['c']),
                                                                   'km2': int(holm.sum()) * 4, 'top_m': ISLAND['top_m'],
                                                                   'notes': HOLM_NOTE},
                    'notes': PATERA_NOTE}
    D['basins'].append(rep['basin'])
    D['domes'] = list(D.get('domes', [])) + [dict(d, notes=dome_note(d)) for d in dome_recs]
    # the Tlahn Warra: its head was the tarn; it now heads on the patera's east lip, fed by the rain ring
    tw_ = next(r for r in D['rivers'] if r.get('id') == 'r_fb_central')
    keep = [i for i, (px, py) in enumerate(tw_['px'])
            if ell_rho(np.array(px), np.array(py), PATERA['c'], PATERA['a'], PATERA['b'], PATERA['rot_deg']) >= LIP_EASE[2]]
    drop = keep[0]
    assert keep == list(range(drop, len(tw_['px']))), 'the Tlahn Warra re-enters the patera'
    was = {k: tw_[k] for k in ('px', 'bed_m', 'q_m3s', 'length_km', 'source_m')}
    gone_km = sum(float(np.hypot(b[0] - a[0], b[1] - a[1])) * 2 for a, b in zip(tw_['px'][:drop + 1], tw_['px'][1:drop + 1]))
    tw_['px'] = tw_['px'][drop:]
    tw_['bed_m'] = tw_['bed_m'][drop:]
    tw_['q_m3s'] = tw_['q_m3s'][drop:]
    tw_['length_km'] = round(tw_['length_km'] - gone_km, 1)
    tw_['source_m'] = tw_['bed_m'][0]
    tw_['notes'] = ("Heads on the Firebliss Patera's east lip (5.1 edit 2): the tarn that fed it is under the lava; the "
                    "rain ring feeds it now. biomes/firebliss/PLAN.md section 1a.")
    rep['tlahn_warra'] = {'dropped_points': was['px'][:drop], 'head_px': tw_['px'][0], 'head_bed_m': tw_['bed_m'][0],
                          'length_km_before_after': [was['length_km'], tw_['length_km']]}
    # the climate key's areas
    dc = Counter(cnow.ravel().tolist())
    have = {pr['code'] for pr in D['climate']['present']}
    if 'L' not in have:
        D['climate']['present'].append({'code': 'L', 'name': L_CLASS['name'], 'color': L_CLASS['color'], 'pct': 0, 'km2': 0})
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # ---- 7. nothing else moved
    sites = moved | lava | holm | tarn
    for k in ('h', 'wl'):
        diff = np.any(P.raster(D, k) != raw0[k], -1)
        assert not (diff & ~sites).any(), k + ' changed outside the sites'
    tsite = nd.binary_dilation(sites, iterations=4) | q
    for k in ('tm', 'th', 'tl', 'tw', 'tc'):
        assert not ((P.raster(D, k, 'L') != raw0[k]) & ~tsite).any(), k + ' changed outside the sites'
    csite = tsite | (ringw > 0)
    for k in ('p', 'c', 'z'):
        assert not ((P.raster(D, k, 'L') != raw0[k]) & ~csite).any(), k + ' changed outside the sites and the ring'
    fb = G.poly(next_region(FB_REGION), 1.0, 1.0, sh)
    ko = G.poly(next_region(KO_REGION), 1.0, 1.0, sh)
    hmoved = np.any(P.raster(D, 'h') != raw0['h'], -1)
    rep['cells_changed'] = {k: int((P.raster(D, k, 'L') != raw0[k]).sum()) for k in ('tm', 'tw', 'tc', 'th', 'tl', 'p', 'c', 'z')}
    rep['cells_changed']['h'] = int(hmoved.sum())
    rep['cells_changed']['wl'] = int(np.any(P.raster(D, 'wl') != raw0['wl'], -1).sum())
    rep['cells_changed']['h_in_firebliss_korona_other'] = [int((hmoved & fb).sum()), int((hmoved & ko).sum()),
                                                           int((hmoved & ~fb & ~ko).sum())]
    assert rep['cells_changed']['h_in_firebliss_korona_other'][2] == 0, 'heights moved outside Firebliss and Korona'
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_512.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps({k: v for k, v in rep.items() if k not in ('vent', 'basin')}, indent=1, ensure_ascii=False))


def dome_note(d):
    if d['region'] == 'Firebliss Range':
        return ("A pancake dome of the Firebliss Patera: rhyolite melted out of the crust round the patera's long-lived "
                "basalt (bimodal, as Iceland's and Yellowstone's), risen slowly and degassed, so it oozed out as a "
                "flat-topped table of glass-skinned lava instead of exploding. %d km across, %d m over its ground, its "
                "top at %d m; obsidian cliffs, pumice skin. biomes/firebliss/PLAN.md section 1c." % (d['d_km'], d['h_m'], d['top_m']))
    return ("A pancake dome of Korona: rhyolite melted out of the granite basement under the tepui sandstone by the "
            "corona's plume, risen on a ring fault where the trench cuts through the cover, and oozed out as a "
            "flat-topped glass-skinned table. %d km across, %d m over its ground, its top at %d m. biomes/korona/PLAN.md, "
            "'Amendment 2026-11-12'." % (d['d_km'], d['h_m'], d['top_m']))


def next_region(rid):
    import re
    s = open(os.path.join(HERE, 'model', 'src', '51-region-store.js'), encoding='utf-8').read()
    m = re.search(r'\{"id": "%s", "name": "[^"]*", "color": "[^"]*", "points": (\[\[.*?\]\])' % rid, s)
    return json.loads(m.group(1))


if __name__ == '__main__':
    main()
