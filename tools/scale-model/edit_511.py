#!/usr/bin/env python3
"""Scale model 5.1, edit 1 (2026-11-09): the owner's decisions on the biome plans of 2026-11-09.

    python3 tools/scale-model/edit_511.py            # edits model/data in place, writes edit_511.report.json

1. The Epidote-Steam Tarn's way in (biomes/neouterwall/PLAN.md section 2a): the Portal Valley carved into the NE outer
   wall's back from 1330,295 to 1331,302 (floor 5,530 m to 5,900 m, cut 0 to 1.3 km), and the Epidote Cave as a record
   (`tube_epidote_16`, a hypogene marble cave on the Outland Gate fault; nothing carved).
2. The Godthrone's brine lake relocated (biomes/godshearth/PLAN.md section 1a): a closed lake carved at 876,1440, 29 cells
   at 6,420 m behind a lip of 6.7-6.8 km on its west side; the stale basin record at 842.7,1397.5 moved to it; the stale
   cavern note (`cav_god_brine_throat`, "6,415 m under the ice") rewritten.
3. Godshearth's climate (the same plan, section 3): the forced oasis replaced by a lapse of 6 C/km from a floor of +7 C
   (warm month 15, cold month -2, hottest afternoon 24, coldest night -10, -18 in the cold-air pools), its classes
   following (Cwb on the floor, Dwb on the benches, Dwc and ET on the rim); rain totals kept, its season in the region's
   note (the model holds annual rain only).
4. The records: The Gate (`sthegate`) moved to the Outland Gate's Narrows, 1438,326; Region 99's north edge trimmed to
   the Great Chasm's south edge so the sill (1697,1028) is the Great Chasm's. The page's defaults
   (`model/src/60-settlements.js`, `51-region-store.js`) and `openworld/little-demo/source/regions.json` are edited here;
   the live artifact's database copies are written separately (README, "5.1 edit 1").

Heights move only in the valley and round the lake; temperatures only there and in the Godshearth polygon. Every other
cell of every raster is checked unchanged at the end. Refuses to run twice (the cave record is the marker).
"""
import json, os, re, sys

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402

SRC = os.path.join(HERE, 'model', 'src')
OW_REGIONS = os.path.join(REPO, 'openworld', 'little-demo', 'source', 'regions.json')

# ---- the specs (the plans' numbers)
VALLEY_ROWS = [295, 298, 300, 302]                 # neouterwall PLAN 2a: floor 5,530 / 5,750 / 5,850 / 5,900 m
VALLEY_FLOOR = [5530.0, 5750.0, 5850.0, 5900.0]
VALLEY_FROM, VALLEY_TO = (1330.0, 295.0), (1331.0, 302.0)
LAKE_C, LAKE_R, LAKE_LEVEL = (876, 1440), 3.0, 6420.0   # godshearth PLAN 1a: 29 cells, r <= 3 px
LAKE_BED = 6270.0                                  # its bed about 6,270 m, deepest in the middle
LIP_R, LIP_MIN = (3.0, 4.5), 6750.0                # the ring 3-4.5 px out held at 6.7-6.8 km
GH_ID = 'rmw4wou2y1hhc'                            # godshearth
GH_FLOOR_M = 3640.0
GH = dict(tm=7.0, tw=15.0, tc=-2.0, th=24.0, tl=-10.0, pool_tl=-18.0, lapse=6.0)
GATE = dict(id='sthegate', px=1438, py=326,
            notes="The one way into the Outlands: the Outland Gate's Narrows (1,423 m, 1.34 atm), held by the Tierhounds' "
                  "long wall from wall foot to wall foot (1431,326 to 1446,326) and their toll fort and water gate on the "
                  "river, with the trickster's shrine; the god's road (Sleeping City to Trickster's House) runs through "
                  "it. Moved from the old 7.7 km pass (1408,414), which keeps a cairn and a shrine. biomes/outlandgate/"
                  "PLAN.md section 5, biomes/outlands/PLAN.md; the owner, 2026-10-26 and 2026-11-09.")
R99_ID, GC_ID = 'rmvraoas90co7', 'rmw4vh9t20da4'
# Region 99's north edge (1750,1016 -> 1604,986) rerouted along the Great Chasm's south edge, from where it crosses it
R99_NEW_EDGE = [[1750, 1016], [1736, 1013], [1723, 1032], [1696, 1028], [1667, 1022], [1660, 1003], [1662, 998], [1604, 986]]
GH_NOTE = ("A caldera cut into the Godthrone's south flank: floor 3.6-3.75 km, walls 3-4 km high, the hot lake (3,642 m) "
           "and the spillway south. Climate (the owner, 2026-11-09): cools with height, 6 C per km from a floor of +7 C "
           "(warm month 15 C, days 24 / nights +6; cold month -2 C, days +7 / nights -10, to -18 C in the cold-air pools "
           "on clear nights): Cwb on the floor, Dwb on the benches, Dwc and ET on the rim. Rain 750-925 mm, about 70% of "
           "it in the warm half as afternoon storms, so the nights and the winters are clear (the model holds annual "
           "rain only). biomes/godshearth/PLAN.md.")
EPIDOTE = {
    "id": "tube_epidote_16", "name": "Epidote Cave", "region": "rmvymakpc0pft", "culture": "uninhabited",
    "state": "geothermal", "rock": "skarn_marble", "kind": "hypogene_cave",
    "width_m": 18.0, "height_m": 14.0, "depth_m": 0.0, "km": 71,
    "px": [[1331.0, 302.0], [1333.0, 312.0], [1335.0, 322.0], [1337.0, 330.0], [1340.0, 336.0]],
    "branches": [],
    "caverns": [
        {"id": "cav_epidote_portal", "name": "The Portal", "kind": "ice_portal", "px": [1331.0, 302.0],
         "span_m": [60, 35], "height_m": 22, "skylight_m": 0,
         "notes": "The cave's outer mouth at the head of the Portal Valley, 5,900 m (0.77 atm, EF), under the portal's ice."},
        {"id": "cav_epidote_marble_hall", "name": "The Marble Hall", "kind": "bottle_hall", "px": [1336.0, 326.0],
         "span_m": [240, 150], "height_m": 55, "skylight_m": 0,
         "notes": "The upper level's great chamber under the crest (ground 11.8-12.1 km, about 6.2 km of rock overhead): "
                  "white skarn marble dissolved from below, gypsum crust and cupolas, dry since the old water table fell."},
        {"id": "cav_epidote_inner_mouth", "name": "The Inner Mouth", "kind": "warm_spring_outlet", "px": [1340.0, 336.0],
         "span_m": [90, 50], "height_m": 30, "skylight_m": 0,
         "notes": "The lower level's outlet on the Epidote-Steam Tarn's north shore, about 2,700 m, 30 m over the water: "
                  "warm, CO2- and H2S-charged water and steam, sinter and mats round it."}],
    "notes": "A hypogene cave (water from below, as Carlsbad and Lechuguilla) dissolved in the marble bands of the skarn "
             "along the Outland Gate fault (NNW-SSE), the only way into the sealed Epidote-Steam Tarn. The way in: the "
             "Portal Valley (1330,295 to 1331,302, floor 5,530-5,900 m, 14 km), then the cave. Floors (depth_m does not "
             "describe them): the upper level holds 5.6-5.9 km from the portal (5,900 m) to under the cauldron's rim (y "
             "333); the lower level then falls about 2.9 km to the inner mouth (~2,700 m) in its last 6-8 km. Rock "
             "overhead peaks at about 6.4 km under the crest (1336,329, 12.1 km). No point of the walk stands over 5.9 km. "
             "A record only: nothing is carved. biomes/neouterwall/PLAN.md section 2a; the owner, 2026-11-09."}
BRINE_NOTE = ("The drained brine lake's throat, under the caldera floor at ~3.6 km: the old reservoir emptied down it when "
              "Godshearth's caldera fell. The bloodfalls' brine now comes from the closed lake at 876,1440 (6,420 m), "
              "which the ice belt kept. biomes/godshearth/PLAN.md sections 1a and 8.")


def hexrgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], float)


def priority_fill(E, box):
    """depression-filled heights over a box (y0, y1, x0, x1), its edge the outlet: a cell under its fill is in a pit"""
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


def gh_weight(sh, whas):
    """build_425_master.py's Godshearth climate weight (l. 1119-1173, 4166), without its noise terms (fbm1, fbm2 and the
    scallop are draws of the 5.0 build's generator, which is not reproducible here): 1 in the caldera, falling to 0 over
    24 px of its walls, the spillway's breach included, 0 on water"""
    main = [[808, 1379], [824, 1387], [837, 1374], [862, 1370], [871, 1376], [880, 1385], [872, 1403], [854, 1411],
            [831, 1408], [821, 1400], [808, 1391]]
    m = G.poly(main, 1.0, 1.0, sh)
    sd = nd.distance_transform_edt(m) - nd.distance_transform_edt(~m)
    Y, X = np.mgrid[0:sh[0], 0:sh[1]].astype(float)
    t = np.clip((Y - 1394.0) / (1451.0 - 1394.0), 0.0, 1.0)
    u = np.abs(X - (844.5 + 0.5 * t + 1.2 * np.sin(t * np.pi * 2.0))) / (7.5 + 12.5 * t ** 1.15)
    wsp = (1.0 - G.sstep(0.18, 1.35, u)) * G.sstep(1391.0, 1397.0, Y) * (1.0 - G.sstep(1445.0, 1455.0, Y))
    return np.clip(np.maximum(G.sstep(-24.0, 4.0, sd), wsp) * ~whas, 0.0, 1.0)


def koppen(tm, tw, tc, codes):
    """the class the plan reads off the temperatures (rain 750-925 mm, 70% in summer: never B, always 'w')"""
    out = np.empty(tm.shape, np.uint8)
    sub = np.where(tw >= 22, 'a', np.where(tw >= 12, 'b', 'c'))
    for idx in np.ndindex(tm.shape):
        if tw[idx] < 0:
            k = 'EF'
        elif tw[idx] < 10:
            k = 'ET'
        else:
            k = ('C' if tc[idx] > -3 else 'D') + 'w' + str(sub[idx])
        out[idx] = codes.index(k)
    return out


def main():
    D = P.load()
    if any(t['id'] == EPIDOTE['id'] for t in D['tubes']):
        sys.exit('edit_511 has run already (tube_epidote_16 is in tubes.json)')
    rep = {'edit': '5.1 edit 1', 'date': '2026-11-09'}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    codes = [c['code'] for c in D['climate']['classes']]
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]]
    raw0 = {k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
            for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc', 'st', 't', 'rt', 'ct')}
    En = Eo.copy()

    # ---- 1. the Portal Valley
    (xa, ya), (xb, yb) = VALLEY_FROM, VALLEY_TO
    vmask = np.zeros(sh, bool)
    vrows = {}
    for y in range(int(ya), int(yb) + 1):
        fl = float(np.interp(y, VALLEY_ROWS, VALLEY_FLOOR))
        xc = xa + (xb - xa) * (y - ya) / (yb - ya)
        for x in range(int(xc) - 3, int(xc) + 4):
            dx = abs(x - xc)
            k = 1.0 - G.sstep(0.6, 1.9, dx)        # 1 on the floor (one to two cells), easing to 0 over the next cell
            if k <= 0:
                continue
            t = fl + (Eo[y, x] - fl) * (1 - k)
            if t < En[y, x] - 0.5:
                En[y, x] = t
                vmask[y, x] = True
        vrows[y] = {'floor_m': round(fl), 'centre_x': round(xc, 2),
                    'cut_m': round(float(Eo[y, int(round(xc))] - En[y, int(round(xc))]))}
    rep['portal_valley'] = {'cells': int(vmask.sum()), 'rows': vrows,
                            'max_cut_m': round(float((Eo - En)[vmask].max()))}

    # ---- 2. the brine lake, its bed and lip
    cx, cy = LAKE_C
    r = np.hypot(xx - cx, yy - cy)
    lake = r <= LAKE_R
    bed = LAKE_BED + 110 * G.sstep(0, LAKE_R, r)       # 6,270 m in the middle, ~6,380 m at the shore
    En[lake] = np.minimum(np.maximum(bed[lake], Eo[lake] - 2000), LAKE_LEVEL - 40)   # carve or fill to the bed
    ring = (r > LIP_R[0]) & (r <= LIP_R[1])
    lip = LIP_MIN + 50 * G.sstep(LIP_R[0], LIP_R[1], r)                # 6.75 km at the shore's edge, 6.8 km out
    lipped = ring & (Eo < lip)
    En[ring] = np.maximum(En[ring], lip[ring])
    out = (r > LIP_R[1]) & (r <= LIP_R[1] + 2.0)                        # the moraine's outer slope, eased over 2 cells
    k_out = 1 - G.sstep(LIP_R[1], LIP_R[1] + 2.0, r)
    En[out] = np.maximum(En[out], Eo[out] + k_out[out] * (lip[out] - 250 - Eo[out]))
    lmask = (np.abs(En - Eo) > 0.5) & (r <= LIP_R[1] + 2.0)
    # closed: the lowest way out of the lake over its rim
    F = priority_fill(En, (cy - 30, cy + 31, cx - 30, cx + 31))
    spill = float(F[30, 30])
    whas2, wlev2 = whas0.copy(), wlev0.copy()
    whas2[lake], wlev2[lake] = True, LAKE_LEVEL
    water2 = water0 | lake
    shore = nd.binary_dilation(lake, structure=np.ones((3, 3))) & ~lake
    rep['brine_lake'] = {
        'centre_px': list(LAKE_C), 'cells': int(lake.sum()), 'km2': int(lake.sum()) * 4, 'level_m': LAKE_LEVEL,
        'bed_m': [round(float(En[lake].min())), round(float(En[lake].max()))],
        'carve_m_max': round(float((Eo - En)[lake].max())), 'fill_m_max': round(float((En - Eo)[lake | ring | out].max())),
        'shore_min_m': round(float(En[shore].min())), 'lip_cells_raised': int(lipped.sum()),
        'spill_m': round(spill), 'closed': bool(spill > LAKE_LEVEL + 200),
        'to_r442_head_km': round(float(np.hypot(cx - 864.8, cy - 1439.6)) * 2, 1)}
    assert rep['brine_lake']['cells'] == 29 and rep['brine_lake']['closed']

    # no new pit in the valley (it drains north), and the lake is the only one round it
    for nm, box in (('portal_valley', (280, 315, 1315, 1350)),):
        pits0 = int(((priority_fill(Eo, box) - Eo[box[0]:box[1], box[2]:box[3]]) > 1).sum())
        pits1 = int(((priority_fill(En, box) - En[box[0]:box[1], box[2]:box[3]]) > 1).sum())
        rep[nm]['pit_cells_before_after'] = [pits0, pits1]
        assert pits1 <= pits0, nm + ' made a pit'

    moved = vmask | lmask
    # ---- 3. temperatures lapsed with the surface (the lake's level on water), then rain, class and zone
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas2, wlev2)
    for k, v in lap.items():
        D[k] = v
    gh = next(rr for rr in P.docs(OW_REGIONS) if rr['id'] == GH_ID)
    ghm = G.poly(gh['points'], 1.0, 1.0, sh) > .5
    wgh = gh_weight(sh, whas0)
    forced = ghm | lake | (wgh > 0)
    rain2, cls2, zon2, q, crep = C.reclimate(D, Eo, En, whas0, forced)
    cls2[lake] = codes.index('WH')
    zon2[lake] = raw0['z'][1394, 839]                 # the hot lake's zone: a highland lake
    rep['reclimate'] = crep

    # ---- 4. Godshearth's climate: cools with height, mild days, cold clear nights.
    # build_425_master.py (l. 4164) forced its oasis in as old = native (1 - w) + target w, w reaching 24 px past the
    # polygon onto the walls. The same weight swaps the old target for the new one (new = old + w (new target - old
    # target)), so the walls keep the seam they had with the flank. tm, tw, tc were the block's; th and tl were not, so
    # they are set from the new warm and cold months (days 9 C over the warm month, nights 8 C under the cold one).
    surf = np.where(whas2, np.fmax(En, np.nan_to_num(wlev2, nan=-1e9)), En)
    dz = (surf - GH_FLOOR_M) / 1000.0
    old_tw = 22.0 - 0.0055 * np.maximum(0.0, En - GH_FLOOR_M)
    old_tc = 8.5 - 0.0055 * np.maximum(0.0, En - GH_FLOOR_M)
    oldT = {'tw': old_tw, 'tc': old_tc, 'tm': 0.5 * (old_tw + old_tc)}
    newT = {k: GH[k] - GH['lapse'] * dz for k in ('tm', 'tw', 'tc')}
    # cold-air pools: the main bowl's lowest floor, away from the hot lake's warmth
    far_lake = nd.distance_transform_edt(~whas2) > 3
    bowl = ghm & ~whas2 & far_lake & (yy < 1408) & (En < 3800)
    p20, p3 = np.percentile(En[bowl], [20, 3])
    pool_k = np.where(bowl, G.sstep(p20, p3, En), 0.0)
    T2 = {}
    for k in ('tm', 'tw', 'tc'):
        v = P.raster(D, k, 'L').astype(float) - 90
        swap = np.where(wgh > 0.98, newT[k], v + wgh * (newT[k] - oldT[k]))   # full weight: the target itself
        T2[k] = np.where(v > -89, np.round(swap), v)
    for k, off in (('th', GH['th'] - GH['tw']), ('tl', GH['tl'] - GH['tc'])):
        v = P.raster(D, k, 'L').astype(float) - 90
        tgt = T2['tw' if k == 'th' else 'tc'] + off
        if k == 'tl':
            tgt = tgt + (GH['pool_tl'] - GH['tl']) * pool_k
        T2[k] = np.where(v > -89, np.round(v + wgh * (tgt - v)), v)
    for k in C.TEMPS:
        D[k] = P.b64(Image.fromarray(np.clip(T2[k] + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    # the classes where the old block set them (w > 0.2, land, under 6,250 m), now from the temperatures
    land = (wgh > 0.2) & ~whas2 & (T2['tm'] > -89) & (En < 6250)
    cls2[land] = koppen(T2['tm'][land], T2['tw'][land], T2['tc'][land], codes)
    d_in = nd.distance_transform_edt(ghm)
    floor = ghm & land & (En < 3760) & (En > 3640)
    bench = ghm & land & (np.abs(En - 4120) < 60)
    from collections import Counter
    rep['godshearth'] = {
        'cells': int(ghm.sum()), 'weighted_cells': int((wgh > 0).sum()), 'reclassed_cells': int(land.sum()),
        'cold_pool_cells': int((pool_k > .5).sum()), 'cold_pool_below_m': round(float(p20)),
        'spillway_C': {k: round(float(T2[k][1430, 845])) for k in C.TEMPS},
        'rim_C_at_5km': {k: round(float(np.median(T2[k][ghm & (np.abs(En - 5000) < 150)]))) for k in C.TEMPS}
        if (ghm & (np.abs(En - 5000) < 150)).any() else None,
        'floor_C': {k: round(float(np.median(T2[k][floor])), 1) for k in C.TEMPS},
        'bench_C': {k: round(float(np.median(T2[k][bench])), 1) for k in C.TEMPS},
        'classes': dict(Counter(codes[c] for c in cls2[ghm]).most_common()),
        'classes_weighted': dict(Counter(codes[c] for c in cls2[wgh > 0.2]).most_common()),
        'mean_cell_step_tm_C_before_after': [
            round(float(np.abs(np.diff(raw0['tm'].astype(float), axis=1))[(wgh[:, 1:] > 0) | (wgh[:, :-1] > 0)].mean()), 2),
            round(float(np.abs(np.diff(T2['tm'], axis=1))[(wgh[:, 1:] > 0) | (wgh[:, :-1] > 0)].mean()), 2)]}

    # ---- 5. the paint
    D['h'] = P.encode_heights(D, En, water2)
    D['wl'] = P.encode_levels(D, whas2, wlev2)
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
    for k, v in relit.items():
        D[k] = v
    near = nd.binary_dilation(moved, iterations=3)
    for k in ('st', 't'):
        a = P.raster(D, k)
        a = PA.retint(a, EoF, EnF, near, ~near, 150.0)
        if k == 'st':
            # the lake's water: the colour of the model's other closed lakes over 6 km (ET), its own texture kept
            donors = whas0 & (wlev0 > 5800) & (wlev0 < 7000) & ~nd.binary_dilation(lake, iterations=8)
            tgt = np.median(raw0['st'][donors], 0)
            lum = a.mean(-1)
            det = np.clip((lum + 4) / (nd.gaussian_filter(lum, 3.0) + 4), .8, 1.2)[..., None]
            wgt = np.clip(nd.gaussian_filter(lake.astype(float), 0.7) * 1.3, 0, 1)[..., None]
            a = np.clip(a * (1 - wgt) + tgt * det * wgt, 0, 255).astype(np.uint8)
            # Godshearth's floor repainted for its new climate (the hot lake and its shore kept)
            keep = nd.binary_dilation(whas2, iterations=2)
            w = np.where(ghm & ~keep, 0.6 * G.sstep(0, 3, d_in), 0.0)
            a = PA.by_climate(a, EnF, rain_now, T2['tm'], ghm | moved, ghm, w)
            rep['lake_paint_rgb'] = [round(float(v)) for v in tgt]
        D[k] = P.jpeg_like(D, k, a)

    # ---- 6. records: the cave, the cavern note, the basin
    D['tubes'].append(EPIDOTE)
    gt = next(t for t in D['tubes'] if t['id'] == 'tube_god_ssw_14')
    cav = next(c for c in gt['caverns'] if c['id'] == 'cav_god_brine_throat')
    rep['cavern_note_was'] = cav['notes']
    cav['notes'] = BRINE_NOTE
    b = next(x for x in D['basins'] if abs(x['at_px'][0] - 842.7) < .5 and abs(x['at_px'][1] - 1397.5) < .5)
    rep['basin_was'] = dict(b)
    b.update({'at_px': [float(cx), float(cy)], 'level_m': int(LAKE_LEVEL), 'km2': int(lake.sum()) * 4,
              'spill_m': round(spill), 'climate': codes[int(np.bincount(cnow[shore]).argmax())], 'kind': 'salt lake',
              'surplus_m3s': 0.0, 'depth_m': round(LAKE_LEVEL - float(En[lake].min()))})
    rep['basin_now'] = b
    # the climate key's areas (2 km cells, 4 km2 each) move with the cells that changed class
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        k = codes.index(pr['code'])
        pr['km2'] = int(dc.get(k, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(k, 0) / cnow.size, 2)

    # ---- 7. nothing else moved
    touched_h = nd.binary_dilation(moved | lake, iterations=0)
    for k in ('h', 'wl'):
        a = P.raster(D, k)
        diff = np.any(a != raw0[k], -1)
        assert not (diff & ~(moved | lake)).any(), k + ' changed outside the sites'
    tsite = nd.binary_dilation(moved | lake, iterations=4) | ghm | (wgh > 0)
    for k in ('tm', 'th', 'tl', 'tw', 'tc', 'p', 'c', 'z'):
        a = P.raster(D, k, 'L')
        assert not ((a != raw0[k]) & ~tsite & ~q).any(), k + ' changed outside the sites'
    rep['cells_changed'] = {k: int((P.raster(D, k, 'L') != raw0[k]).sum()) for k in ('tm', 'tw', 'tc', 'th', 'tl', 'p', 'c', 'z')}
    # ---- 8. the page's defaults and the open world's copy of the regions (checked before anything is written)
    rep['records'], writes = records()
    P.save(D)
    for path, text in writes:
        open(path, 'w', encoding='utf-8', newline='').write(text)
    json.dump(rep, open(os.path.join(HERE, 'edit_511.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


def r99_trim(points):
    i = next(k for k, p in enumerate(points) if p == [1750, 1016])
    assert points[i + 1] == [1604, 986]
    return points[:i] + R99_NEW_EDGE + points[i + 2:]


def records():
    out = {}
    # settlements: the default list
    path = os.path.join(SRC, '60-settlements.js')
    s = open(path, encoding='utf-8', newline='').read()
    m = re.search(r'\{"id": "sthegate", "name": "The Gate", "type": "outpost", "px": (\d+), "py": (\d+), "notes": "((?:[^"\\]|\\.)*)"', s)
    assert m and (m.group(1), m.group(2)) == ('1408', '414'), 'sthegate default'
    new = '{"id": "sthegate", "name": "The Gate", "type": "outpost", "px": %d, "py": %d, "notes": %s' % (
        GATE['px'], GATE['py'], json.dumps(GATE['notes'], ensure_ascii=False))
    s = s[:m.start()] + new + s[m.end():]
    writes = [(path, s)]
    out['sthegate'] = {'from': [1408, 414], 'to': [GATE['px'], GATE['py']]}
    # regions: the default list (one line of JSON) and the open world's file
    path = os.path.join(SRC, '51-region-store.js')
    s = open(path, encoding='utf-8', newline='').read()
    for rid, fn in ((R99_ID, r99_trim), (GH_ID, None)):
        m = re.search(r'\{"id": "%s", "name": "[^"]*", "color": "[^"]*", "points": (\[\[.*?\]\]), "notes": "((?:[^"\\]|\\.)*)"' % rid, s)
        assert m, rid
        if fn:
            pts = fn(json.loads(m.group(1)))
            s = s[:m.start(1)] + json.dumps(pts) + s[m.end(1):]
        else:
            s = s[:m.start(2)] + json.dumps(GH_NOTE, ensure_ascii=False)[1:-1] + s[m.end(2):]
    writes.append((path, s))
    raw = open(OW_REGIONS, encoding='utf-8', newline='').read()
    R = json.loads(raw)
    assert json.dumps(R, indent=1) + '\n' == raw.replace('\r\n', '\n') or \
        json.dumps(R, indent=1) == raw.replace('\r\n', '\n'), 'regions.json would reformat'
    for rr in R:
        if rr['id'] == R99_ID:
            rr['points'] = r99_trim(rr['points'])
            out['region99_points'] = rr['points']
        if rr['id'] == GH_ID:
            rr['notes'] = GH_NOTE
    txt = json.dumps(R, indent=1) + ('\n' if raw.endswith('\n') else '')
    writes.append((OW_REGIONS, txt))
    gc = next(rr for rr in R if rr['id'] == GC_ID)
    r99 = next(rr for rr in R if rr['id'] == R99_ID)
    sh = (1723, 1821)
    m99, mgc = G.poly(r99['points'], 1.0, 1.0, sh) > .5, G.poly(gc['points'], 1.0, 1.0, sh) > .5
    out['region99_gc_overlap_cells'] = int((m99 & mgc).sum())
    out['sill_1697_1028'] = {'region99': bool(m99[1028, 1697]), 'great_chasm': bool(mgc[1028, 1697])}
    assert not m99[1028, 1697] and mgc[1028, 1697]
    return out, writes


if __name__ == '__main__':
    main()
