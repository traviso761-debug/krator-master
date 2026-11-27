#!/usr/bin/env python3
"""Scale model 5.1, edit 4 (2026-11-10; re-run on the merged model 2026-11-11): Ostrukh Riba rerouted south into Lake Ostrukh (the owner, 2026-11-10).

    python3 tools/scale-model/edit_514.py            # edits model/data in place, writes edit_514.report.json

Mid Basin's flagship maar pool (40 cells at 2,040 m round 1584,1348) spilled north through its breach gorge as Ostrukh Riba,
300 km into Region 99 (to 334 m), while the river's own gloss says it feeds Lake Ostrukh (56 cells at 1,850 m round
1524,1462), the fresh lake south-west of it (biomes/midbasin/PLAN.md section 9; biomes/loom-chasms/PLAN.md: 340 m3/s onto a
desert floor). The owner: the course is the part that is wrong. So:

1. **The north sill.** The pool's north shore stands at 2,018-2,030 m, under its 2,040 m level, so it drains north. The
   breach throat is closed by a travertine sill (the springs' carbonate: the plan's "travertine shelves at its outlet") held
   at 2,050 m: the gorge below it stays, dry.
2. **The south outlet and channel.** The course is routed (smodel.rivers.route_river) from the pool's south shore to the
   lake on the land, never back north of the pool, and its bed carved to fall all the way: the outlet's sill at 2,036 m
   (the pool keeps its level), then each cell no higher than the one before less 0.5 m and at least 30 m under the land
   it crosses, to the lake at 1,850 m; the banks eased toward it (as smodel.rivers.carve_river does).
3. **The record.** `r_mb_siphon_breach` keeps its id, name and gloss (which is now true); its course, beds, flow and size
   are new. The flow is the model's own: Turc runoff (smodel.hydro.runoff, evap_k from hydro.json) summed down the
   carved ground's D8 drainage within the Mid Basin box, the pool's catchment included. The old 340 m3/s was Gemini's
   and not the model's (no outflow from Lake Ostrukh could carry it).

Heights move only on the sill and the channel; temperatures, rain, class and zone only round them (lapse, reclimate,
relight, retint, as edit_511.py). Refuses to run twice (the record's `rerouted` field is the marker).
"""
import json, math, os, sys
from collections import Counter

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]   # edit_511.py is in history/ since 5.1 edit 3
import smodel.page as P, smodel.geom as G, smodel.climate as C, smodel.paint as PA   # noqa: E402
import smodel.rivers as RV, smodel.hydro as HY   # noqa: E402
from edit_511 import priority_fill, hexrgb   # noqa: E402

RID = 'r_mb_siphon_breach'
POOL_AT, LAKE_AT = (1584, 1348), (1524, 1462)
POOL_LEVEL, LAKE_LEVEL = 2040.0, 1850.0
SILL_M = 2050.0          # the travertine sill across the north breach
OUTLET_M = 2036.0        # the south outlet's sill: 4 m under the pool's level
DEPTH = 30.0             # the channel under the land it crosses
FALL = 0.5               # m a cell, at least
BOX = (1290, 1520, 1450, 1680)   # y0, y1, x0, x1: Mid Basin, the pool and the lake


def main():
    D = P.load()
    r = next(x for x in D['rivers'] if x['id'] == RID)
    if r.get('rerouted'):
        sys.exit('edit_514 has run already (%s is rerouted)' % RID)
    rep = {'edit': '5.1 edit 4', 'date': '2026-11-10', 'river': RID, 'was': {
        'from_px': r['px'][0], 'to_px': r['px'][-1], 'source_m': r['source_m'], 'mouth_m': r['mouth_m'],
        'length_km': r['length_km'], 'q_mouth_m3s': r['q_mouth_m3s'], 'gloss': r['gloss']}}
    Eo, water0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = Eo.shape
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]]
    raw0 = {k: P.raster(D, k, 'L' if k in ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc') else 'RGB')
            for k in ('h', 'wl', 'p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')}
    lab, _ = nd.label(whas0, structure=np.ones((3, 3)))
    pool = lab == lab[POOL_AT[1], POOL_AT[0]]
    lake = lab == lab[LAKE_AT[1], LAKE_AT[0]]
    assert int(pool.sum()) == 40 and abs(float(np.nanmedian(wlev0[pool])) - POOL_LEVEL) < 1
    assert abs(float(np.nanmedian(wlev0[lake])) - LAKE_LEVEL) < 1
    pj, pi = np.argwhere(pool).T
    py_max = int(pj.max())
    En = Eo.copy()

    # ---- 1. the north sill: every cell within 2 of the pool, north of its south shore, held at SILL_M
    near = nd.binary_dilation(pool, structure=np.ones((3, 3)), iterations=2) & ~pool & (yy < py_max + 1)
    sill = near & (En < SILL_M)
    En[sill] = SILL_M
    rep['north_sill'] = {'cells': int(sill.sum()), 'raised_m_max': round(float((En - Eo)[sill].max())), 'held_m': SILL_M}

    # ---- 2. the south outlet and channel
    ring = nd.binary_dilation(pool, structure=np.ones((3, 3))) & ~pool & (yy > py_max)
    cand = np.argwhere(ring)
    sj, si = cand[np.argmin(En[ring])]
    cost = En.copy()
    block = (yy <= py_max) & (np.hypot(xx - POOL_AT[0], yy - POOL_AT[1]) < 25)
    cost[block | pool] = 1e5                          # never back north of the pool, nor across it
    path = RV.route_river(cost, 1.0, 1.0, (float(si), float(sj)), lake)
    beds, bed = [], OUTLET_M
    for n, (j, i) in enumerate(path):
        if lake[j, i]:
            beds.append(LAKE_LEVEL)
            break
        bed = OUTLET_M if n == 0 else max(min(En[j, i] - DEPTH, bed - FALL), LAKE_LEVEL + 1.0)
        beds.append(bed)
    path = path[:len(beds)]
    chan = np.zeros(sh, bool)
    Ec = En.copy()
    for (j, i), b in zip(path, beds):
        if lake[j, i]:
            continue
        Ec[j, i] = min(Ec[j, i], b) if (j, i) != path[0] else b
        chan[j, i] = True
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                jj, ii = j + dj, i + di
                if (dj or di) and not whas0[jj, ii] and not sill[jj, ii]:
                    Ec[jj, ii] = min(Ec[jj, ii], max(b + DEPTH * 2.5, Ec[jj, ii] - DEPTH))
    En = Ec
    assert all(b2 <= b1 + 1e-9 for b1, b2 in zip(beds, beds[1:])), 'the bed climbs'
    seg = [math.hypot(a[0] - b[0], a[1] - b[1]) * 2.0 for a, b in zip(path, path[1:])]
    cut = Eo - En
    rep['channel'] = {'outlet_px': [int(si), int(sj)], 'outlet_m': OUTLET_M, 'mouth_px': [path[-1][1], path[-1][0]],
                      'cells': len(path), 'length_km': round(sum(seg)), 'bed_m': [round(beds[0], 1), round(beds[-1], 1)],
                      'cut_m_max': round(float(cut[chan].max())), 'cut_m_mean': round(float(cut[chan].mean())),
                      'cut_at_px': [int(xx[chan][np.argmax(cut[chan])]), int(yy[chan][np.argmax(cut[chan])])]}

    # the pool now spills south, at the outlet, and nowhere lower
    y0, y1, x0, x1 = BOX
    gorge = (yy < int(pj.min()) - 3) & (np.abs(xx - POOL_AT[0]) < 12) & (En < POOL_LEVEL - 10)   # the breach gorge below
    rep['pool_spill'] = {'to_lake': pool_spill(En, pool, lake), 'to_north_gorge': pool_spill(En, pool, gorge)}
    assert abs(rep['pool_spill']['to_lake']['spill_m'] - OUTLET_M) < 1.5, rep['pool_spill']
    assert rep['pool_spill']['to_north_gorge']['spill_m'] >= SILL_M - 0.5, 'the pool still spills north'

    # ---- 3. the flow: Turc runoff summed down the carved ground's drainage (the box; lake and box edge are sinks)
    k_ev = D['hydro']['evap_k']
    Pm = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    Tm = P.raster(D, 'tm', 'L').astype(float) - 90
    Rr, _L = HY.runoff(Pm, Tm, k_ev)
    Rr[Tm <= -85] = 0.0
    Sb = np.where(whas0, np.fmax(np.nan_to_num(wlev0, nan=-1e9), En), En)[y0:y1, x0:x1]
    sink = lake[y0:y1, x0:x1].copy()
    sink[0, :] = sink[-1, :] = sink[:, 0] = sink[:, -1] = True
    Fb, order = HY.fill(Sb, sink)
    rec = HY.d8(Fb, sink)
    cell_km2 = 4.0
    acc = HY.accumulate_area(order, rec, Rr[y0:y1, x0:x1] * cell_km2 * 1e3)   # mm/yr x km2 -> m3/yr (x1e3)
    area = HY.accumulate_area(order, rec, np.full(Sb.shape, cell_km2))
    q = [float(acc[j - y0, i - x0]) / HY.SEC_YR for j, i in path[:-1]]
    q = list(np.maximum.accumulate(q))
    q.append(q[-1])
    a_km2 = float(area[path[-2][0] - y0, path[-2][1] - x0])
    q = [float(v) for v in q]
    q_run = q[-1]
    # the springs (the owner, 2026-11-10: the maars' springs and Lake Ostrukh share one confined aquifer, recharged by
    # the Stalker Range's snow): Lake Ostrukh is closed and fresh, so the springs' water the river carries is what
    # closes its books: the lake's evaporation less the rain on it and all the land's runoff reaching it
    m3s = lambda mm_cells: float(mm_cells) * 1e-3 * cell_km2 * 1e6 / HY.SEC_YR
    lk = lake[y0:y1, x0:x1]
    lake_evap = m3s(_L[lake].sum())
    lake_rain = m3s(Pm[lake].sum())
    land_in = float(acc[lk].sum()) / HY.SEC_YR - m3s(Rr[lake].sum())        # runoff arriving at the lake's cells
    springs = max(0.0, lake_evap - lake_rain - land_in)
    q = [v + springs for v in q]
    qm = round(float(q[-1]), 1)
    rep['flow'] = {'q_mouth_m3s': qm, 'runoff_m3s': round(q_run, 1), 'springs_m3s': round(springs, 1),
                   'catchment_km2': round(a_km2), 'lake_evap_m3s': round(lake_evap, 1),
                   'lake_rain_m3s': round(lake_rain, 1), 'land_runoff_into_lake_m3s': round(land_in, 1),
                   'note': 'Turc runoff (evap_k %.2f) down the carved D8 drainage, plus the springs\' discharge sized so '
                           'that Lake Ostrukh (closed, fresh) evaporates what reaches it; the old 340 m3/s was Gemini\'s' % k_ev}

    # ---- 4. the record
    pts = G.meander([(float(i), float(j)) for j, i in path], amp=0.3)
    r.update({
        'px': [[round(x, 2), round(y, 2)] for x, y in pts],
        'bed_m': [round(b, 1) for b in beds],
        'source_m': OUTLET_M, 'mouth_m': LAKE_LEVEL,
        'length_km': round(sum(seg)), 'len_km': round(sum(seg)) if 'len_km' in r else r.get('len_km'),
        'q_mouth': qm, 'q_mouth_m3s': qm, 'q_m3s': [round(v, 1) for v in q],
        'catchment_km2': round(a_km2),
        'width_m': round(4.5 * qm ** 0.5), 'depth_m': round(0.35 * qm ** 0.38, 1),
        'perennial': True, 'kind': 'river',            # spring-fed: it runs all year whatever its size
        **({'springs_m3s': round(springs, 1)} if springs > 0 else {}),
        'to': {'at_px': [round(pts[-1][0], 1), round(pts[-1][1], 1)], 'lake_m': LAKE_LEVEL},
        'rerouted': '5.1 edit 4 (2026-11-10): from the flagship maar south into Lake Ostrukh; the north breach closed by a travertine sill',
    })
    if r.get('len_km') is None:
        r.pop('len_km', None)
    rep['now'] = {k: r[k] for k in ('source_m', 'mouth_m', 'length_km', 'q_mouth_m3s', 'catchment_km2', 'width_m', 'depth_m', 'perennial', 'to')}

    # ---- 5. climate and paint where the ground moved
    moved = np.abs(En - Eo) > 0.5
    lap = C.lapse(D, Eo, En, whas0, wlev0, whas0, wlev0)
    for k_, v in lap.items():
        D[k_] = v
    rain2, cls2, zon2, qmask, crep = C.reclimate(D, Eo, En, whas0, np.zeros(sh, bool))
    rep['reclimate'] = crep
    # Godstep's dry playa (biomes/godstep/PLAN.md section 1, note 3; the owner, 2026-11-03: a dry terminal salt playa on
    # step 4): cells classed WH (highland lake) in its polygon with no water under them take the class of the dry land
    # most like them (the 12 nearest in place, height and mean temperature, outside the WH patch), so the playa reads as
    # the steppe or desert round it
    from scipy.spatial import cKDTree
    codes = [c['code'] for c in D['climate']['classes']]
    gs = next(rr for rr in P.regions() if rr['id'] == 'rmvkbfspgsmr3')   # godstep valley
    gsm = G.poly(gs['points'], 1.0, 1.0, sh)
    tmF = P.raster(D, 'tm', 'L').astype(float) - 90
    wh = codes.index('WH')
    dry_wh = gsm & (cls2 == wh) & ~whas0
    pool_g = nd.binary_dilation(gsm, iterations=20) & ~whas0 & (cls2 != wh) & (tmF > -85) & \
        ~np.isin(cls2, [codes.index(c) for c in ('WS', 'WX', 'WH', 'O')])
    ft = lambda m: np.stack([xx[m] / 20.0, yy[m] / 20.0, En[m] / 250.0, tmF[m] / 2.0], 1)
    _, ix = cKDTree(ft(pool_g)).query(ft(dry_wh), k=12)
    pc = cls2[pool_g]
    votes = pc[ix]
    cls2[dry_wh] = np.array([np.bincount(v, minlength=256).argmax() for v in votes], np.uint8)
    rep['godstep_playa'] = {'region': gs['id'], 'cells': int(dry_wh.sum()), 'km2': int(dry_wh.sum()) * 4,
                            'classes_now': dict(Counter(codes[c] for c in cls2[dry_wh]).most_common())}
    playa = dry_wh
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
        a = PA.retint(P.raster(D, k_), EoF, EnF, nearm, ~nearm, 150.0)
        D[k_] = P.jpeg_like(D, k_, a)
    dc = Counter(cnow.ravel().tolist())
    for pr in D['climate']['present']:
        kk = codes.index(pr['code'])
        pr['km2'] = int(dc.get(kk, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(kk, 0) / cnow.size, 2)

    # ---- 6. nothing else moved
    a = P.raster(D, 'h')
    assert not (np.any(a != raw0['h'], -1) & ~moved).any(), 'h changed off the sill and channel'
    site = nd.binary_dilation(moved, iterations=4)
    for k_ in ('tm', 'th', 'tl', 'tw', 'tc', 'p', 'c', 'z'):
        assert not ((P.raster(D, k_, 'L') != raw0[k_]) & ~site & ~qmask & ~playa).any(), k_ + ' changed off the site'
    rep['cells_changed'] = {'h': int(moved.sum()), **{k_: int((P.raster(D, k_, 'L') != raw0[k_]).sum())
                                                      for k_ in ('tm', 'p', 'c', 'z')}}
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_514.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


def pool_spill(E, pool, target):
    """the lowest way from the pool to any cell of `target`: a priority flood from the pool (the minimax barrier)"""
    import heapq
    y0, y1, x0, x1 = BOX
    S = E[y0:y1, x0:x1]
    Pb = pool[y0:y1, x0:x1]
    Tb = target[y0:y1, x0:x1]
    best = np.full(S.shape, np.inf)
    q = []
    for j, i in np.argwhere(Pb):
        best[j, i] = -1e9
        heapq.heappush(q, (-1e9, j, i, None))
    H, W = S.shape
    worst, at = -1e9, None
    while q:
        h, j, i, a = heapq.heappop(q)
        if h > best[j, i]:
            continue
        if h > worst:
            worst, at = h, (j, i)
        if Tb[j, i]:
            return {'spill_m': round(float(worst), 1), 'at_px': [int(at[1] + x0), int(at[0] + y0)]}
        for da in (-1, 0, 1):
            for db in (-1, 0, 1):
                jj, ii = j + da, i + db
                if 0 <= jj < H and 0 <= ii < W and not Pb[jj, ii]:
                    nh = max(h, float(S[jj, ii]))
                    if nh < best[jj, ii]:
                        best[jj, ii] = nh
                        heapq.heappush(q, (nh, jj, ii, None))
    return {'spill_m': None, 'at_px': None}


if __name__ == '__main__':
    main()
