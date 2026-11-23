#!/usr/bin/env python3
"""Scale model 5.1, edit 6 (2026-11-11): the Godthrone's walls round Godshearth unforced (the owner, 2026-11-11, after
hearing that the flank's wet 4-6 km band is the 5.0 build's forced rain: "make it 129").

    python3 tools/scale-model/edit_516.py            # edits model/data in place, writes edit_516.report.json

build_425_master.py (l. 4166-4174) forced Godshearth's oasis in as `rain = native (1 - w) + target w`, target
clip(920 - 0.18 (E - 3640), 320, 1150), w the same weight as the temperatures (1 in the caldera, falling to 0 over 24 px of
its walls; rebuilt without the 5.0 build's noise terms as edit_511.gh_weight). Inside the `godshearth` polygon the rain
stays (the owner's 750-925 mm). Outside it, the native rain is recovered from the blend where the weight leaves enough of
it (0.02 < w < 0.85: native = (rain - w target) / (1 - w)), and carried in from the nearest such cell where it does not.

Then: the walls' classes where the old block set them (w > 0.2, land, under 6,250 m, outside the polygon) read again off
their temperatures and the new rain (Köppen with its dry B test); the rain map repainted; Āirã Siṭrīm (r_gh_spillway)
recomputed from the new field as edit_515.py computed it; every other course whose catchment held changed cells takes the
change in its runoff, and passes it down its `to` chain. Heights, water and temperatures do not move. Refuses to run
twice (the outlet river's `walls_unforced` field is its marker).
"""
import json, math, os, sys
from collections import Counter, defaultdict

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]   # edit_511.py is in history/ since 5.1 edit 3
import smodel.page as P, smodel.geom as G, smodel.paint as PA, smodel.hydro as HY   # noqa: E402
from edit_511 import gh_weight, hexrgb   # noqa: E402

GH_ID, RIVER = 'rmw4wou2y1hhc', 'r_gh_spillway'
BOX = (1100, 1480, 620, 1060)            # edit_513's converged drainage box
CELL_KM2 = 4.0


def m3s(mm_sum):
    return float(mm_sum) * 1e-3 * CELL_KM2 * 1e6 / HY.SEC_YR


def koppen_dry(P_, tm, tw, tc, codes):
    """Köppen with the dry test (rain mostly in summer here: threshold 20 T + 280 mm), E before B as Köppen orders it"""
    out = np.empty(tm.shape, np.uint8)
    for n in range(len(tm)):
        if tw[n] < 0:
            k = 'EF'
        elif tw[n] < 10:
            k = 'ET'
        else:
            th = 20 * tm[n] + 280
            if P_[n] < th:
                k = ('BW' if P_[n] < th / 2 else 'BS') + ('h' if tm[n] >= 18 else 'k')
            else:
                k = ('C' if tc[n] > -3 else 'D') + 'w' + ('a' if tw[n] >= 22 else 'b' if tw[n] >= 12 else 'c')
        out[n] = codes.index(k)
    return out


def course_cells(px):
    out = []
    for a, b in zip(px, px[1:]):
        n = max(1, int(math.ceil(max(abs(b[0] - a[0]), abs(b[1] - a[1])))))
        out += [(int(round(a[1] + (b[1] - a[1]) * k / n)), int(round(a[0] + (b[0] - a[0]) * k / n))) for k in range(n)]
    return out + [(int(round(px[-1][1])), int(round(px[-1][0])))]


def add_flow(r, k0, dq):
    if r.get('q_m3s'):
        r['q_m3s'] = [round(max(0.0, v + (dq if k >= k0 else 0.0)), 1) for k, v in enumerate(r['q_m3s'])]
    r['q_mouth_m3s'] = round(max(0.0, r['q_mouth_m3s'] + dq), 1)
    if 'q_mouth' in r:
        r['q_mouth'] = r['q_mouth_m3s']
    r['width_m'] = round(4.5 * r['q_mouth_m3s'] ** 0.5)
    r['depth_m'] = round(0.35 * r['q_mouth_m3s'] ** 0.38, 1)


def main():
    D = P.load()
    rivers = {r['id']: r for r in D['rivers']}
    if rivers[RIVER].get('walls_unforced'):
        sys.exit('edit_516 has run already (%s is walls_unforced)' % RIVER)
    rep = {'edit': '5.1 edit 6', 'date': '2026-11-11'}
    E, water = P.heights(D)
    whas, wlev = P.water_levels(D)
    sh = E.shape
    codes = [c['code'] for c in D['climate']['classes']]
    raw0 = {k: P.raster(D, k, 'L') for k in ('p', 'c', 'z', 'tm')}
    Pm = raw0['p'].astype(float) / 255 * 4000
    T = {k: P.raster(D, k, 'L').astype(float) - 90 for k in ('tm', 'tw', 'tc')}
    air = T['tm'] > -85
    ghm = G.poly(next(r for r in P.regions() if r['id'] == GH_ID)['points'], 1.0, 1.0, sh)

    # ---- 1. the walls' native rain, recovered from the 5.0 blend
    w = gh_weight(sh, whas)
    tgt = np.clip(920 - 0.18 * np.maximum(0, E - 3640), 320, 1150)
    ok = (w > 0.02) & (w < 0.85)
    nat = np.where(ok, (Pm - w * tgt) / np.maximum(1 - w, 1e-6), Pm)
    nat = np.clip(nat, 0, 4000)
    known = (w <= 0.02) | ok
    _, (iy, ix) = nd.distance_transform_edt(~known, return_indices=True)
    nat = np.where(known, nat, nat[iy, ix])
    walls = (w > 0.02) & ~ghm & ~whas & air
    P2 = np.where(walls, nat, Pm)
    p_new = np.clip(np.round(P2 / 4000.0 * 255.0), 0, 255).astype(np.uint8)
    changed = p_new != raw0['p']
    band = walls & (E >= 4000) & (E < 6000)
    rep['walls_rain'] = {'cells': int(walls.sum()), 'cells_changed': int(changed.sum()),
                         'band_4_6km_km2': int(band.sum()) * 4,
                         'band_rain_mm_before_after': [round(float(Pm[band].mean())), round(float(P2[band].mean()))],
                         'walls_rain_mm_before_after': [round(float(Pm[walls].mean())), round(float(P2[walls].mean()))]}

    # ---- 2. the walls' classes where the old block set them, from their temperatures and the new rain
    # (the model's own classes, not a fresh Köppen: each wall cell takes the class of the land with its climate, as
    # smodel.climate.reclimate decides a class: the 40 nearest in (rain, mean, warmest and coldest month, air) over the
    # land the old block never forced, within 300 px, never a class whose rain the cell is outside)
    from scipy.spatial import cKDTree
    cls2 = raw0['c'].copy()
    recl = walls & (w > 0.2) & (E < 6250)
    yy, xx = np.mgrid[0:sh[0], 0:sh[1]]
    near = np.hypot(xx - 843, yy - 1392) < 300
    wet_cls = [codes.index(c) for c in ('WS', 'WX', 'WH', 'O')]
    pool = near & (w <= 0.02) & ~whas & air & ~np.isin(raw0['c'], wet_cls)
    prs = np.exp(-E / 8000.0) * 1.6
    cfeat = lambda m: np.stack([P2[m] / 120.0, T['tm'][m] / 2.0, T['tw'][m] / 2.5, T['tc'][m] / 2.5, prs[m] / .04], 1)
    pc = raw0['c'][pool]
    d2, idx2 = cKDTree(cfeat(pool)).query(cfeat(recl), k=40)
    lo_, hi_ = np.full(256, 0.0), np.full(256, 1e9)
    for k_ in np.unique(pc):
        r_ = P2[pool][pc == k_]
        if len(r_) > 50:
            lo_[k_], hi_[k_] = np.percentile(r_, 2), np.percentile(r_, 98)
    rq = P2[recl][:, None]
    fits = (rq >= lo_[pc[idx2]]) & (rq <= hi_[pc[idx2]])
    wv = 1.0 / (d2 + .2) * np.where(fits.any(1, keepdims=True), fits, 1.0)
    cls2[recl] = np.array([np.bincount(pc[idx2[n]], weights=wv[n], minlength=256).argmax() for n in range(len(idx2))], np.uint8)
    # one cell's vote is speckled: the majority of each 5x5 window over the reclassed cells (as reclimate smooths its zones)
    ys_, xs_ = np.nonzero(recl)
    j0, j1, i0, i1 = ys_.min() - 3, ys_.max() + 4, xs_.min() - 3, xs_.max() + 4
    sub, msk = cls2[j0:j1, i0:i1].copy(), recl[j0:j1, i0:i1]
    best, cnt = sub.copy(), np.zeros(sub.shape)
    for k_ in np.unique(sub[msk]):
        c_ = nd.uniform_filter(((sub == k_) & msk).astype(float), 5)
        better = c_ > cnt
        best[better], cnt[better] = k_, c_[better]
    sub[msk] = best[msk]
    cls2[j0:j1, i0:i1] = sub
    moved_cls = cls2 != raw0['c']
    rep['walls_classes'] = {'reclassed_cells': int(recl.sum()), 'changed': int(moved_cls.sum()),
                            'before': dict(Counter(codes[c] for c in raw0['c'][moved_cls]).most_common()),
                            'after': dict(Counter(codes[c] for c in cls2[moved_cls]).most_common())}

    # ---- 3. every course's runoff change: one drainage pass over the box, each cell labelled with the first course it reaches
    k_ev = D['hydro']['evap_k']
    R0, _ = HY.runoff(Pm, T['tm'], k_ev)
    R1, L = HY.runoff(P2, T['tm'], k_ev)
    R0[~air] = 0
    R1[~air] = 0
    y0, y1, x0, x1 = BOX
    Sb = np.where(whas, np.fmax(np.nan_to_num(wlev, nan=-1e9), E), E)[y0:y1, x0:x1]
    sink = np.zeros(Sb.shape, bool)
    sink[0, :] = sink[-1, :] = sink[:, 0] = sink[:, -1] = True
    owner = -np.ones(Sb.shape, int)
    ids = [r['id'] for r in D['rivers']]
    vtx = {}
    for n, r in enumerate(D['rivers']):
        for k, (j, i) in enumerate(course_cells(r['px'])):
            jj, ii = j - y0, i - x0
            if 0 <= jj < Sb.shape[0] and 0 <= ii < Sb.shape[1] and owner[jj, ii] < 0:
                owner[jj, ii] = n
                sink[jj, ii] = True
    Fb, order = HY.fill(Sb, sink & (owner < 0))
    rec = HY.d8(Fb, sink & (owner < 0))
    lab = -np.ones(Sb.shape, int)
    for j, i in order:
        if owner[j, i] >= 0:
            lab[j, i] = owner[j, i]
        else:
            a, b = rec[j, i]
            if a >= 0:
                lab[j, i] = lab[a, b]
    # each course's own flow scales with its catchment's runoff, new over old (its recorded flow came from the 4.21-4.22
    # routing, so an absolute change could take a small wadi below nothing); the change passes down its `to` chain
    dR = (R1 - R0)[y0:y1, x0:x1]
    R0b = R0[y0:y1, x0:x1]
    delta = defaultdict(float)
    ratios = {}
    for n in np.unique(lab[(lab >= 0) & (dR != 0)]):
        rid = ids[n]
        if rid == RIVER:
            continue
        s0 = float(R0b[lab == n].sum())
        ratio = (s0 + float(dR[lab == n].sum())) / s0 if s0 > 0 else 1.0
        ratios[rid] = round(ratio, 3)
        trib = sum(t['q_mouth_m3s'] for t in D['rivers'] if (t.get('to') or {}).get('river') == rid)
        own = max(0.0, rivers[rid]['q_mouth_m3s'] - trib)          # its own share: tributaries pass their change down
        delta[rid] = own * (ratio - 1.0)
    rep['river_runoff_ratios'] = ratios
    rep['river_deltas_m3s'] = {k: round(v, 2) for k, v in sorted(delta.items(), key=lambda kv: kv[1]) if abs(v) >= 0.05}

    # ---- 4. Āirã Siṭrīm from the new field, exactly as edit 3 computed it (its own drainage, every other course a sink)
    r = rivers[RIVER]
    old_q = r['q_mouth_m3s']
    path = course_cells(r['px'])[:-1]
    sink2 = np.zeros(Sb.shape, bool)
    sink2[0, :] = sink2[-1, :] = sink2[:, 0] = sink2[:, -1] = True
    sink2 |= (owner >= 0) & (owner != ids.index(RIVER))
    for j, i in path:
        sink2[j - y0, i - x0] = False
    Fb2, order2 = HY.fill(Sb, sink2)
    rec2 = HY.d8(Fb2, sink2)
    pidx = {(j - y0, i - x0): n for n, (j, i) in enumerate(path)}
    hit = np.full(Sb.shape, -1, int)
    for j, i in order2:
        if (j, i) in pidx:
            hit[j, i] = pidx[(j, i)]
        else:
            a, b = rec2[j, i]
            if a >= 0:
                hit[j, i] = hit[a, b]
    Rb = R1[y0:y1, x0:x1]
    per = np.bincount(hit[hit >= 0], weights=Rb[hit >= 0], minlength=len(path))
    q = list(np.cumsum(per) * 1e-3 * CELL_KM2 * 1e6 / HY.SEC_YR)
    # resample onto the record's vertices (one per course cell of its px)
    qv = [float(q[min(len(q) - 1, k)]) for k in range(len(r['px']))]
    new_q = round(qv[-1], 1)
    gh_cells = (hit >= 0) & ghm[y0:y1, x0:x1]
    r['q_m3s'] = [round(v, 1) for v in qv]
    r['q_mouth_m3s'] = new_q
    r['width_m'] = round(4.5 * new_q ** 0.5)
    r['depth_m'] = round(0.35 * new_q ** 0.38, 1)
    r['perennial'] = True
    r['walls_unforced'] = '5.1 edit 6 (2026-11-11): the walls\' forced rain removed; %.1f m3/s, was %.1f' % (new_q, old_q)
    dq = new_q - old_q
    rep['outlet'] = {'q_before': old_q, 'q_after': new_q, 'caldera_part_m3s': round(m3s(Rb[gh_cells].sum()), 1),
                     'walls_part_m3s': round(m3s(Rb[(hit >= 0) & ~ghm[y0:y1, x0:x1]].sum()), 1)}
    # its change passes down r442 and r272; every other course takes its own runoff change, down its `to` chain
    delta[RIVER] = dq
    applied = {}
    for rid, d in sorted(delta.items()):
        if abs(d) < 0.05 or rid not in rivers:
            continue
        cur, k0, hops = rivers[rid], 0, 0
        if rid != RIVER:
            add_flow(cur, 0, d)
            applied[rid] = round(d, 2)
        while (cur.get('to') or {}).get('river') in rivers and hops < 20:
            nxt = rivers[cur['to']['river']]
            at = cur['to'].get('at_px') or cur['px'][-1]
            k0 = int(np.argmin([math.hypot(p[0] - at[0], p[1] - at[1]) for p in nxt['px']]))
            add_flow(nxt, k0, d)
            applied[nxt['id']] = round(applied.get(nxt['id'], 0.0) + d, 2)
            cur, hops = nxt, hops + 1
    rep['rivers_changed_m3s'] = applied
    rep['rivers_now'] = {k: rivers[k]['q_mouth_m3s'] for k in set(applied) | {RIVER}}

    # ---- 5. the rasters and the climate key
    D['p'] = P.b64(Image.fromarray(p_new, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    rain_now = p_new.astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(Pm), PA.ramp(rain_now), changed)
    col = np.array([hexrgb(c['color']) for c in D['climate']['classes']])
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cls2], moved_cls)
    dc = Counter(cls2.ravel().tolist())
    for pr in D['climate']['present']:
        kk = codes.index(pr['code'])
        pr['km2'] = int(dc.get(kk, 0)) * 4
        pr['pct'] = round(100.0 * dc.get(kk, 0) / cls2.size, 2)

    # ---- 6. who else the rain change reaches: regions and station pins over changed cells
    reach = changed | moved_cls
    rep['regions_touched'] = {rg['name']: int((G.poly(rg['points'], 1.0, 1.0, sh) & reach).sum()) for rg in P.regions()
                              if (G.poly(rg['points'], 1.0, 1.0, sh) & reach).any()}
    stations = []
    for root, _, files in os.walk(os.path.join(REPO, 'biomes')):
        if 'station.json' in files and os.sep + 'dist' not in root:
            try:
                st = json.load(open(os.path.join(root, 'station.json'), encoding='utf-8'))
            except Exception:
                continue
            px = st.get('px') or st.get('map_px') or st.get('scale_model_px')
            if isinstance(px, (list, tuple)) and len(px) >= 2:
                j, i = int(round(px[1])), int(round(px[0]))
                if 0 <= j < sh[0] and 0 <= i < sh[1] and nd.binary_dilation(reach, iterations=3)[j, i]:
                    stations.append(os.path.relpath(root, REPO).replace(os.sep, '/'))
    rep['stations_on_changed_ground'] = stations
    lakes_on = nd.binary_dilation(reach, iterations=1) & whas
    rep['lakes_beside_changed_ground_cells'] = int(lakes_on.sum())

    # ---- 7. nothing else moved
    for k_ in ('p', 'c'):
        a = P.raster(D, k_, 'L')
        assert not ((a != raw0[k_]) & ~(walls | recl)).any(), k_ + ' changed off the walls'
    assert np.array_equal(P.raster(D, 'tm', 'L'), raw0['tm']) and np.array_equal(P.raster(D, 'z', 'L'), raw0['z'])
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_516.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
