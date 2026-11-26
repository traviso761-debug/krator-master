#!/usr/bin/env python3
"""Scale model 5.1, edit 35 (2026-11-26): the Veiled Mountains as one highland biome, Matron's Coast's fringe of
islands and its temperatures, and the north-west's climate audit fixed.

    python tools/scale-model/edit_535_veiled_mountains.py [--dry]

The owner: "reshape 'veiled mountains' into a coherent highland biome: the region formerly mistheights (now veiled
pass) will have several more valleys (regions 174-175) carved with a similar climate and landform: a cool but damp and
lush temperate-boreal rainforest, fed by the drafts coming SE from the tsunami coast. this will be the homeland of
another one of the hayrants' cousins. the areas of the polygon that are not carved into valleys will be reshaped into
megabreccia mountains that the valleys plausibly slope up to"; "do climate audit on the NWern portion of the map";
"convert the NW coast of matron's coast into a fringe of islands". The polygons are the live map's (edit_535_live.json).

1. The valleys. Region 174 (a bar along the wall's north end with three fingers south) and Region 175 (a strip down
   the west flank) are cut as U-valleys that follow their polygons: a floor rising from the mouth that opens to the
   tsunami coast's drafts (174's at its north-west, 175's at its north end by the Veilpass's west entry) to the far
   end, 3,700-4,400 m like the Veilpass's (edit 31), and walls rising ~1,400 m to the polygon's edge.
2. The megabreccia mountains: the rest of the Veiled Mountains polygon, the crater wall shattered into blocks kilometres
   across (an impact's megabreccia). The land rises from the valley floor nearest it, up to ~2.6 km above it away from
   the valleys, and each block (a Voronoi cell ~6 px across) is offset and tilted on its own. Faded into the land round
   the polygon over ~12 px along a ragged line; the Veilpass's own valleys (edit 31) kept. The valley floors are
   megabreccia too, worn down (a quarter of the blocks' relief, softened), and the whole highland is weathered (edit
   30's weather: stream power and creep, 20 rounds).
3. The valleys' climate: maritime, the drafts from the tsunami coast. Every valley floor under 4,800 m (174, 175 and
   the Veilpass) takes a panhandle's temperatures for its height (warm month 13 C, cold month -1.5 C at 3,900 m,
   5 C and 4.5 C a km colder above), and ~3,200 mm of rain; the mountains round them ~2,200 mm (the drafts' orographic
   rain), all smoothed into the country round the polygon. This fixes the audit's worst finding: edit 31's Cfc floors
   had a continental -13 C cold month, and its 3,500 mm a hard edge.
4. Matron's Coast's temperatures: the raised sea kept the sea's raster values (a -22 C cold month under a Cfb class).
   Its plain (under 1,800 m) takes the temperatures of the nearest coastal land of its height outside it (the 12
   nearest in place, height and distance from the sea). That land is hot (a 29 C warm month), so for the owner's
   temperate rainforest the plain has a cold current's maritime climate (18 C warm month, 6 C cold month at sea level,
   4 C cooler a km), blended over 8 px; Cfb where it allows.
5. Matron's Coast's fringe of islands: the coast within 7 px of the open sea, away from Arkerum and every pin, is
   drowned where a smooth noise falls under a threshold that rises toward the sea. It leaves a skerry coast of islands
   and drowned channels (sea level, 5-40 m deep). Rivers that reached the old coast end at the first water.
6. The north-west's audit (x < 700, y < 1000), apart from 1-5:
   - the straight seams in tm, tw, tc, th and tl (old stamp edges, the worst down column 271): within 6 px of each,
     every temperature becomes its local fit on height plus its smoothed residual;
   - the rain seams and lone spikes (clusters under 30 cells over 900 mm off their neighbourhood): the 7 px median;
   - land under 6,800 m still classed airless (O): the temperatures of the nearby land of its height;
   - the classes the temperatures contradict (Köppen): E, D and C classes re-lettered by their warm and cold months.
Temperatures lapsed where the land moved; rain, class and zone re-derived; the paint relit and tinted (the valleys a
dark rainforest green, the megabreccia raw grey, the drowned coast the sea's colour). The page: Veiled Mountains,
Veilpass, Region 174 and Region 175 as default biome regions, key 5.1e31. Refuses to run twice (Region 174's floor).
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import cKDTree
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.climate as C, smodel.geom as G   # noqa: E402
import edit_532_sw_wall_trigemini as T32                             # noqa: E402

KEY = '5.1e31'
LIVE = json.load(open(os.path.join(HERE, 'edit_535_live.json'), encoding='utf-8'))
REG = {r['name']: r for r in LIVE['regions']}
WIN = (0, 700, 0, 1000)              # the audit's window: x0, x1, y0, y1
MOUTH = {'Region 174': (238.0, 652.0), 'Region 175': (212.0, 692.0)}
FLOOR = {'Region 174': (3700.0, 4400.0), 'Region 175': (3800.0, 4300.0)}


def geodesic(poly, src):
    """Distance from src inside the polygon (8-neighbour steps), so a floor rises up each finger of a branching valley."""
    d = np.full(poly.shape, np.inf)
    sy, sx = int(round(src[1])), int(round(src[0]))
    if not poly[sy, sx]:
        yy, xx = np.nonzero(poly)
        k = int(np.argmin(np.hypot(xx - src[0], yy - src[1])))
        sy, sx = int(yy[k]), int(xx[k])
    d[sy, sx] = 0.0
    front = [(sy, sx)]
    nb = [(-1, -1, 1.414), (-1, 0, 1.0), (-1, 1, 1.414), (0, -1, 1.0), (0, 1, 1.0), (1, -1, 1.414), (1, 0, 1.0), (1, 1, 1.414)]
    import heapq
    pq = [(0.0, sy, sx)]
    while pq:
        dd, j, i = heapq.heappop(pq)
        if dd > d[j, i]:
            continue
        for dj, di, w in nb:
            jj, ii = j + dj, i + di
            if 0 <= jj < poly.shape[0] and 0 <= ii < poly.shape[1] and poly[jj, ii] and dd + w < d[jj, ii]:
                d[jj, ii] = dd + w
                heapq.heappush(pq, (dd + w, jj, ii))
    return d


def local_fit(v, e, m, size=41):
    """v's fit on height, a + b e, in a size-px window over the cells m (b held to a lapse between 0 and 12 C a km)."""
    w = m.astype(float)
    f = lambda a: nd.uniform_filter(a * w, size)
    n = f(np.ones_like(e)) + 1e-9
    me, mv = f(e) / n, f(np.where(m, v, 0.0)) / n
    cov = f(np.where(m, e * v, 0.0)) / n - me * mv
    var = f(e * e) / n - me * me + 1e-6
    b = np.clip(cov / var, -0.012, 0.0)
    return mv + b * (e - me)


def koppen_fix(cl, tw, tc):
    """Only the plain contradictions, the model's own subtype thresholds left alone: an A class whose cold month is under
    18 C; an EF whose warm month is over 0 C; an ET whose warm month reaches 10 C; a C whose cold month is under -3 C or a
    D whose cold month is over 0 C (the same letters otherwise); a C or D whose warm month is under 10 C. Others as
    they are. Returns the code."""
    if cl[0] == 'A' and tc < 18:
        return ('Cfa' if tw >= 22 else 'Cfb') if tc > -3 else 'Dfb'
    if cl == 'EF' and tw > 0:
        cl = 'ET'
    if cl == 'ET' and tw >= 10:
        return 'Cfc' if tc > -3 else 'Dfc'
    if cl[0] in 'CD' and tw < 10:
        return 'ET'
    if cl[0] == 'C' and tc < -3 and len(cl) == 3:
        return 'D' + cl[1:]
    if cl[0] == 'D' and tc > 0 and len(cl) == 3:
        return 'C' + cl[1:3] if cl[2] != 'd' else 'C' + cl[1] + 'c'
    return cl


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = E0.shape
    codes = T32.codes_of(D)
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    poly = {nm: G.poly([tuple(p) for p in r['points']], 1.0, 1.0, sh) for nm, r in REG.items()}
    VM, VP, R4, R5 = poly['Veiled Mountains'], poly['Veilpass'], poly['Region 174'], poly['Region 175']
    if E0[int(MOUTH['Region 174'][1]), int(MOUTH['Region 174'][0])] < 4000:
        sys.exit('edit_535 has run already (Region 174 is cut)')
    rng = np.random.default_rng(53501)
    En, whas, wlev, W1 = E0.copy(), whas0.copy(), wlev0.copy(), W0.copy()
    rep = {'edit': '5.1 edit 35: the Veiled Mountains, Matron\'s Coast\'s islands, the north-west audit', 'date': '2026-11-26'}

    # ---- 1. the valleys 174 and 175: floors up their own polygons, walls to the edge
    floor_t = np.full(sh, np.nan)
    for nm, pm in (('Region 174', R4), ('Region 175', R5)):
        g = geodesic(pm, MOUTH[nm])
        f0, f1 = FLOOR[nm]
        gm = np.nanmax(np.where(np.isfinite(g), g, np.nan))
        fl = f0 + (f1 - f0) * np.clip(g / gm, 0, 1) ** 0.8
        din = nd.distance_transform_edt(pm)
        wloc = np.maximum(nd.maximum_filter(din, size=9), 1.5)
        till = 30.0 * nd.gaussian_filter(rng.standard_normal(sh), 1.2) / 0.23
        prof = fl + 1400.0 * np.clip(1 - din / wloc, 0, 1) ** 1.6 + till
        floor_t = np.where(pm & np.isfinite(g), prof, floor_t)
        rep.setdefault('valleys', {})[nm] = {'cells': int(pm.sum()), 'floor_m': [round(f0), round(f1)], 'mouth': list(MOUTH[nm])}
    # the Veilpass's own valleys (edit 31): its floors below 5,000 m, as they are
    vp_floor = VP & (E0 < 5000)
    valley = (np.isfinite(floor_t)) | vp_floor
    vfloor = np.where(np.isfinite(floor_t), floor_t, np.where(vp_floor, E0, np.nan))

    # ---- 2. the megabreccia mountains: up from the nearest valley's floor, in blocks
    dv, (iy, ix) = nd.distance_transform_edt(~valley, return_indices=True)
    base = vfloor[iy, ix]
    seeds = rng.uniform(0, 1, (int(VM.sum() / 40), 2))           # blocks ~6 px across (12 km)
    ys_, xs_ = np.nonzero(VM)
    pick = rng.choice(len(xs_), size=len(seeds), replace=False)
    sp = np.stack([xs_[pick] + rng.uniform(-.5, .5, len(pick)), ys_[pick] + rng.uniform(-.5, .5, len(pick))], 1)
    _, blk = cKDTree(sp).query(np.stack([XX.ravel(), YY.ravel()], 1))
    blk = blk.reshape(sh)
    off = rng.normal(0, 380, len(sp))[blk]
    tx, ty = rng.normal(0, 45, len(sp)), rng.normal(0, 45, len(sp))
    tilt = tx[blk] * (XX - sp[blk, 0]) + ty[blk] * (YY - sp[blk, 1])
    blocks = nd.gaussian_filter(off + tilt, 0.8)                  # the blocks' edges softened by their own talus
    fine = 25.0 * nd.gaussian_filter(rng.standard_normal(sh), 0.8) / 0.33
    mount = base + 2600.0 * (1 - np.exp(-dv / 7.0)) + blocks * np.clip(dv / 3.0, 0, 1) + fine
    mount = np.maximum(mount, base + 150.0 * np.clip(dv, 0, 1))
    # the valley floors are megabreccia too, worn down by constant weathering (the owner, 2026-11-26): the same blocks,
    # their relief a quarter and softened, on the floors of 174, 175 and the Veilpass
    worn = 0.25 * nd.gaussian_filter(off + tilt, 1.6)
    target = np.where(np.isfinite(floor_t), floor_t + worn, np.where(vp_floor, E0 + worn, mount))
    dvm = nd.distance_transform_edt(VM)
    # faded into the land round the polygon over ~12 px, along a ragged line (the polygon's straight edges not drawn)
    edge_n = nd.gaussian_filter(rng.standard_normal(sh), 3.0); edge_n /= edge_n.std() + 1e-9
    w = np.clip((dvm + 4.0 * edge_n) / 12.0, 0, 1) * ~whas0
    w = np.where(np.isfinite(floor_t) | vp_floor, np.maximum(w, 1.0 * VM), w)   # the valleys cut to the polygon's edge
    En = np.where(VM & ~whas0, E0 * (1 - w) + target * w, En)
    # ... and the whole highland weathered as Matron's Coast is (edit 30's weather: stream power cutting where the rain
    # gathers, creep rounding the blocks), draining out of the polygon
    import edit_530_white_pass as T30
    Ew = T30.weather(En, VM & ~whas0, ~VM | whas0, iters=20, K=0.03, kd=0.10, cap=40.0)
    rep['weathering_m'] = {'cut_p90': round(float(np.percentile((En - Ew)[VM & ~whas0], 90))),
                           'cut_max': round(float((En - Ew)[VM & ~whas0].max()))}
    En = Ew
    rep['mountains'] = {k: round(float(v)) for k, v in zip(('p10', 'p50', 'p90', 'max'), np.percentile(En[VM & ~valley & ~whas0], [10, 50, 90, 100]))}
    rep['valley_floor_m'] = [round(float(v)) for v in np.percentile(En[valley & VM], [5, 50, 95])]

    # ---- 5. Matron's Coast's fringe of islands
    M = poly["Matron's Coast"]
    lab_s, _ = nd.label(whas0)
    size = np.bincount(lab_s.ravel()); size[0] = 0
    sea = whas0 & (size[lab_s] > 20000)
    dsea = nd.distance_transform_edt(~sea)
    pins = np.zeros(sh, bool)
    for s in P.settlements():
        x_, y_ = int(round(s['px'])), int(round(s['py']))
        if 0 <= y_ < sh[0] and 0 <= x_ < sh[1]:
            pins[y_, x_] = True
    keep_out = nd.binary_dilation(pins, iterations=3)
    ark = next(s for s in P.settlements() if s['id'] == 'sqjogy1xhf')
    keep_out |= np.hypot(XX - ark['px'], YY - ark['py']) < 14
    nc = nd.gaussian_filter(rng.standard_normal(sh), 2.2); nf = nd.gaussian_filter(rng.standard_normal(sh), 0.9)
    n_ = 0.65 * nc / (nc.std() + 1e-9) + 0.35 * nf / (nf.std() + 1e-9)        # islands large and small
    n_ = (n_ - n_.mean()) / (n_.std() + 1e-9)
    zone = M & ~whas0 & (dsea <= 8) & ~keep_out
    # drowned where the noise falls under a threshold rising toward the sea: the knolls stand out as islands
    drown = zone & (n_ < -1.1 + 2.0 * (1 - dsea / 8.0))
    # a drowned cell joins the sea (no inland ponds): keep only those connected to it
    lab_d, _ = nd.label(drown | sea)
    drown &= np.isin(lab_d, np.unique(lab_d[sea]))
    sea_lv = float(np.nanmedian(wlev0[sea & (nd.binary_dilation(zone, iterations=3))]))
    depth = 5.0 + 35.0 * np.clip(nd.distance_transform_edt(drown) / 2.0, 0, 1)
    En[drown] = np.minimum(En[drown], sea_lv - depth[drown])
    whas[drown] = True; wlev[drown] = sea_lv; W1[drown] = True
    lab_l, _ = nd.label(~whas)
    main_ = np.bincount(lab_l.ravel())
    main_[0] = 0
    big = lab_l == int(np.argmax(main_))
    isl = ~whas & ~big & nd.binary_dilation(M, iterations=2)
    il, n_isl = nd.label(isl)
    rep['islands'] = {'drowned_cells': int(drown.sum()), 'sea_level_m': round(sea_lv, 1), 'islands': int(n_isl),
                      'island_cells': int(isl.sum())}
    # rivers end at the first water
    trimmed = []
    for rv in D['rivers']:
        p = rv.get('px') or []
        if len(p) < 2:
            continue
        jj = [min(sh[0] - 1, max(0, int(round(q[1])))) for q in p]; ii = [min(sh[1] - 1, max(0, int(round(q[0])))) for q in p]
        hit = [k for k in range(1, len(p)) if drown[jj[k], ii[k]]]
        if not hit:
            continue
        k = hit[0] + 1
        for f in ('px', 'bed_m', 'q_m3s'):
            if isinstance(rv.get(f), list) and len(rv[f]) == len(p):
                rv[f] = rv[f][:k]
        L = float(np.hypot(*np.diff(np.array(rv['px'], float), axis=0).T).sum()) * 2
        for f in ('length_km', 'len_km'):
            if f in rv:
                rv[f] = round(L, 1)
        if isinstance(rv.get('to'), dict):
            rv['to'] = dict(rv['to'], at_px=[round(float(rv['px'][-1][0]), 2), round(float(rv['px'][-1][1]), 2)])
        trimmed.append(rv['id'])
    rep['rivers_ended_at_the_islands'] = trimmed
    fixed = T32.rivers_downhill(D, E0, En, whas)
    rep['rivers_kept_downhill'] = fixed
    moved = np.abs(En - E0) > 1
    rep['land_moved_cells'] = int(moved.sum())
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    out = os.path.join(HERE, 'edit_535_veiled_mountains.report.json')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return

    x0, x1, y0, y1 = WIN
    inwin = np.zeros(sh, bool); inwin[y0:y1, x0:x1] = True
    vfl = valley & VM & (En < 4800) & ~whas
    Mland = M & ~whas & (En < 1800)        # the coastal plain (the raised sea); the old highlands in the polygon keep theirs
    cls_before = P.raster(D, 'c', 'L')
    audit = {}

    def temps_set(T5, En_):
        # 3. the valleys' maritime temperatures for their height, blended in over their walls
        wv = nd.gaussian_filter(vfl.astype(float), 1.2) * VM
        dh = (En_ - 3900.0) / 1000.0
        mar = {'tw': 13.0 - 5.0 * dh, 'tc': -1.5 - 4.5 * dh}
        mar['tm'] = 0.5 * (mar['tw'] + mar['tc']) + 0.5
        mar['th'] = mar['tw'] + 6.0
        mar['tl'] = mar['tc'] - 5.0
        for k in C.TEMPS:
            T5[k] = np.where(wv > 0.01, T5[k] * (1 - wv) + mar[k] * wv, T5[k])
        # 4. Matron's Coast: the temperatures of the nearest coastal land of its height outside it
        air = T5['tm'] > -89.5
        pool = (~M) & ~whas & air & (nd.distance_transform_edt(~M) <= 60) & (dsea <= 12) & (En_ < 2500)
        py_, px_ = np.nonzero(pool); ty_, tx_ = np.nonzero(Mland)
        ft = lambda X, Y, H, S: np.stack([X / 40.0, Y / 40.0, H / 350.0, S / 4.0], 1)
        dk, ik = cKDTree(ft(px_, py_, En_[pool], dsea[pool])).query(ft(tx_, ty_, En_[Mland], dsea[Mland]), k=12)
        wk = 1.0 / (dk + .25)
        before = float(np.median(T5['tc'][Mland]))
        for k in C.TEMPS:
            T5[k][Mland] = (T5[k][pool][ik] * wk).sum(1) / wk.sum(1)
        # ... but the land round it is hot (a 29 C warm month), and the owner's Matron's Coast is a temperate rainforest:
        # a cold current along the coast (as off the Pacific North-West or Valdivia) gives the plain a cool maritime
        # climate, warm month 17 C and cold month 6 C at sea level, cooler with height, blended into the twins' over 8 px
        hkm = En_ / 1000.0
        cur = {'tw': 18.0 - 4.0 * hkm, 'tc': 6.0 - 4.0 * hkm}     # the rainforest up to ~1.8 km, its treeline
        cur['tm'] = 0.5 * (cur['tw'] + cur['tc']) + 0.3
        cur['th'] = cur['tw'] + 6.0
        cur['tl'] = cur['tc'] - 4.0
        wcur = np.clip(nd.distance_transform_edt(M) / 8.0, 0, 1) * Mland
        for k in C.TEMPS:
            T5[k] = np.where(Mland, T5[k] * (1 - wcur) + cur[k] * wcur, T5[k])
        audit['matron_tc_C'] = [round(before, 1), round(float(np.median(T5['tc'][Mland])), 1)]
        audit['matron_tw_C'] = round(float(np.median(T5['tw'][Mland])), 1)
        # 6a. the seams: within 6 px of each straight jump, the local fit on height plus the smoothed residual
        land = inwin & ~whas & (T5['tm'] > -89.5)
        seam = np.zeros(sh, bool)
        for ax in (0, 1):
            g = np.abs(np.diff(T5['tm'], axis=ax))
            j = (g > 5) & (land[:-1, :] if ax == 0 else land[:, :-1])
            j = np.pad(j, ((0, 1), (0, 0)) if ax == 0 else ((0, 0), (0, 1)))
            seam |= nd.binary_opening(j, structure=np.ones((1, 12)) if ax == 0 else np.ones((12, 1)))
        seamz = nd.binary_dilation(seam, iterations=6) & land & ~VM & ~M
        for k in C.TEMPS:
            fit = local_fit(T5[k], En_, land)
            res = np.where(land, T5[k] - fit, 0.0)
            wm = nd.gaussian_filter(land.astype(float), 3.0) + 1e-9
            rs = nd.gaussian_filter(res, 3.0) / wm
            T5[k][seamz] = fit[seamz] + rs[seamz]
        audit['seam_cells_smoothed'] = int(seamz.sum())
        # 6c. land under 6,800 m still classed airless: the temperatures of the nearby land of its height
        lowO = inwin & ~whas & (cls_before == codes.index('O')) & (En_ < 6800)
        if lowO.any():
            pool2 = inwin & ~whas & air & ~lowO & (cls_before != codes.index('O'))
            py2, px2 = np.nonzero(pool2); ty2, tx2 = np.nonzero(lowO)
            f3 = lambda X, Y, H: np.stack([X / 40.0, Y / 40.0, H / 350.0], 1)
            dk2, ik2 = cKDTree(f3(px2, py2, En_[pool2])).query(f3(tx2, ty2, En_[lowO]), k=12)
            wk2 = 1.0 / (dk2 + .25)
            for k in C.TEMPS:
                T5[k][lowO] = (T5[k][pool2][ik2] * wk2).sum(1) / wk2.sum(1)
        audit['low_airless_given_air'] = int(lowO.sum())
        return T5

    def rain_set(rain):
        # 3. the drafts' rain over the Veiled Mountains: the valleys ~3,200 mm, the mountains ~2,200 mm, smoothed and
        # faded into the country round them
        tgt = np.where(vfl, 3200.0, 2200.0)
        tgt = nd.gaussian_filter(tgt, 2.5)
        wr = nd.gaussian_filter(VM.astype(float), 3.0)
        rain = rain * (1 - wr) + tgt * wr
        # 6b. the rain seams and lone spikes: the 7 px median
        land = inwin & ~whas
        med = nd.median_filter(rain, 7)
        spk = land & (np.abs(rain - med) > 900) & ~nd.binary_dilation(VM, iterations=3)
        lab, _ = nd.label(spk); sz = np.bincount(lab.ravel()); sz[0] = 0
        spk &= sz[lab] < 30
        seam = np.zeros(sh, bool)
        g = np.abs(np.diff(rain, axis=1)) > 600
        seam[:, :-1] |= nd.binary_opening(g & land[:, :-1], structure=np.ones((12, 1)))
        g = np.abs(np.diff(rain, axis=0)) > 600
        seam[:-1, :] |= nd.binary_opening(g & land[:-1, :], structure=np.ones((1, 12)))
        seam = nd.binary_dilation(seam, iterations=3) & land & ~VM
        fixm = spk | seam
        rain[fixm] = med[fixm]
        audit['rain_cells_fixed'] = int(fixm.sum())
        return rain

    def after_reclimate(D_, rain, cls, zon):
        # the drowned coast is sea
        if drown.any():
            cls[drown] = codes.index('WS')
            zs = P.raster(D_, 'z', 'L')
            zon[drown] = int(np.bincount(zs[sea & nd.binary_dilation(drown, iterations=4)]).argmax())
        # the valleys: Cfc where their cold month allows it (a damp, lush temperate-boreal rainforest)
        T5 = {k: P.raster(D_, k, 'L').astype(float) - 90 for k in ('tw', 'tc')}
        # 6d. the classes the temperatures contradict, re-lettered (the window and the valleys)
        land = (inwin | VM) & ~whas
        idx = np.nonzero(land)
        n_ch = 0
        cache = {}
        for j, i in zip(*idx):
            c0 = codes[cls[j, i]]
            if c0[0] not in 'CDE':
                continue
            key = (c0, int(round(T5['tw'][j, i])), int(round(T5['tc'][j, i])))
            c1 = cache.get(key)
            if c1 is None:
                c1 = koppen_fix(c0, key[1], key[2])
                c1 = c1 if c1 in codes else c0
                cache[key] = c1
            if c1 != c0:
                cls[j, i] = codes.index(c1); n_ch += 1
        audit['classes_relettered'] = n_ch
        # Matron's Coast's plain: Cfb where its cool maritime climate allows (the owner's temperate rainforest)
        mc = Mland & (T5['tw'] >= 10) & (T5['tw'] < 22) & (T5['tc'] > -3)
        cls[mc] = codes.index('Cfb')
        # the low airless land: its class from its new climate
        lowO = inwin & ~whas & (cls == codes.index('O')) & (En < 6800)
        for j, i in zip(*np.nonzero(lowO)):
            cls[j, i] = codes.index(koppen_fix('ET', int(round(T5['tw'][j, i])), int(round(T5['tc'][j, i]))))
        return rain, cls, zon

    rock = np.where(VM & ~valley & ~whas, np.clip(dv / 6.0, 0, 1) * 0.55, 0.0)
    forest = np.where(VM & vfl, 0.75, 0.0)
    rep['reclimate'] = T32.finish(D, E0, En, W1, whas0, wlev0, whas, wlev, np.zeros(sh, bool), np.zeros(sh, bool), 53502,
                                  paint_extra=[(rock, (118.0, 112.0, 104.0)), (forest, (38.0, 72.0, 44.0))],
                                  temps_set=temps_set, rain_set=rain_set, after_reclimate=after_reclimate)
    # the drowned coast painted as the sea beside it
    for key in ('st', 't'):
        arr = P.raster(D, key).astype(float)
        ring = sea & nd.binary_dilation(drown, iterations=4)
        arr[drown] = np.median(arr[ring], 0)
        D[key] = P.jpeg_like(D, key, np.clip(arr, 0, 255).astype(np.uint8))
    cnow = P.raster(D, 'c', 'L')
    rep['audit'] = audit
    rep['valley_classes'] = {codes[k]: int(v) for k, v in zip(*np.unique(cnow[vfl], return_counts=True))}
    rep['matron_classes'] = {codes[k]: int(v) for k, v in zip(*np.unique(cnow[Mland], return_counts=True)) if v > 20}
    T_ = {k: P.raster(D, k, 'L').astype(float) - 90 for k in ('tw', 'tc')}
    rep['valley_temps_C'] = {k: round(float(np.median(T_[k][vfl])), 1) for k in T_}
    P.save(D)
    recs = []
    for nm, kind, note in (
        ('Veiled Mountains', 'biome', "The Veiled Mountains: the W outer wall reshaped into one highland, the homeland of another of the Hayrants' cousins. The crater wall is shattered into megabreccia (blocks kilometres across, each offset and tilted), rising ~2.6 km from the valleys between them. The valleys (the Veilpass, Regions 174 and 175, 3.7-4.4 km floors) hold a cool, damp, lush temperate-boreal rainforest (Cfc, ~3,200 mm) fed by the drafts coming south-east from the tsunami coast (the owner, 2026-11-26; scale model 5.1 edit 35)."),
        ('Veilpass', 'biome', "The Veilpass (was Mistheights): the carve through the W outer wall, now the Veiled Mountains' main valley. Two entry valleys funnel the tsunami coast's damp air up to 3,900 m; the misty high country runs at 3,900-4,300 m (Cfc, ~3,200 mm). The way out west is easy; the way east crosses a 5,400 m col (scale model 5.1 edits 31 and 35)."),
        ('Region 174', 'biome', "A valley of the Veiled Mountains: a bar along the wall's north end and three fingers south, opening north-west to the tsunami coast's drafts, floor 3,700-4,400 m, Cfc temperate-boreal rainforest (scale model 5.1 edit 35)."),
        ('Region 175', 'biome', "A valley of the Veiled Mountains down the west flank, opening north beside the Veilpass's west entry, floor 3,800-4,300 m, Cfc temperate-boreal rainforest (scale model 5.1 edit 35).")):
        r = REG[nm]
        recs.append({'id': r['id'], 'name': nm, 'color': r['color'], 'points': r['points'], 'kind': kind, 'notes': note})
    T32.write_regions(recs, KEY, 'the Veiled Mountains from the live map (edit 35, 2026-11-26)')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(json.dumps({'audit': audit, 'valley_classes': rep['valley_classes'], 'valley_temps_C': rep['valley_temps_C'],
                      'matron_classes': rep['matron_classes']}, ensure_ascii=False))
    print('saved')


if __name__ == '__main__':
    main()
