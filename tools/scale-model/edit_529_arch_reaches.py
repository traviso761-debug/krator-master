#!/usr/bin/env python3
"""Scale model 5.1, edit 29 (2026-11-24): the Arch's graben river in short reaches from lake to lake (the owner: "on the
river running thru the arch, it should be treated as one river that feeds into multiple lakes or one river in several
short stretches, currently one long river runs on top of the lakes").

    python tools/scale-model/edit_529_arch_reaches.py [--dry]

The Arch's drowned axial graben (biomes/arch/PLAN.md, "the sound") held, besides its rift lakes, a ruled line of single
water cells from px 506,113 to 300,221 joining them (each its own one-cell "lake"), with a straight thread painted over
it: one long channel lying over the lakes. Here:
- the one-cell water along that line is made dry ground 2 m over the lakes' level (the graben's floor between them), and
  the painted line is painted out (`paint.inpaint`);
- one river in reaches: from the mainland end down the graben, each reach routed on the land (least cost, low ground cheap)
  from the last lake's outlet (its cell nearest the next) to the next lake, the last reach to the sea; smoothed, a small
  meander; its bed falling from the lake it leaves to the one it feeds;
- each reach a record (`r_arch_1`...), `to` the lake it feeds ({kind: lake, at_px}) or the sea, one name for all of them
  (smodel.river_names on the whole course: the tongue of its country), `reach` its number;
- the paint: the reaches drawn on the satellite and relief maps.
Refuses to run twice (r_arch_1 exists).
"""
import json, math, os, sys, copy
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.geom as G   # noqa: E402
from smodel import river_names as RN   # noqa: E402
from edit_528_ria_network import Router, resample, bil, polyline_mask   # noqa: E402

A_, B_ = np.array([506.0, 113.0]), np.array([300.0, 221.0])
BOX = (285, 95, 525, 235)
RIVER_RGB = (63, 111, 134)


def main():
    dry = '--dry' in sys.argv
    rng = np.random.default_rng(52901)
    D = P.load()
    if any(str(r['id']) == 'r_arch_1' for r in D['rivers']):
        sys.exit('edit_529_arch_reaches has run already')
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    lab, n = nd.label(whas0)
    size = np.bincount(lab.ravel())
    x0, y0, x1, y1 = BOX
    # the line's one-cell water: water bodies of 1-3 cells within 3 px of the line, inside the box
    yy, xx = np.mgrid[y0:y1, x0:x1]
    ab = B_ - A_; t = ((xx - A_[0]) * ab[0] + (yy - A_[1]) * ab[1]) / (ab @ ab)
    dline = np.hypot(xx - (A_[0] + t * ab[0]), yy - (A_[1] + t * ab[1]))
    sub = lab[y0:y1, x0:x1]
    chain = (sub > 0) & (size[sub] <= 3) & (dline <= 5) & (t > -0.08) & (t < 1.08)
    CH = np.zeros(E0.shape, bool); CH[y0:y1, x0:x1] = chain
    # the lakes on the line (20+ cells, a cell within 3 px of it), in order from the north-east
    lakes = []
    for l in np.unique(sub[(sub > 0) & (dline <= 6)]):
        if 20 <= size[l] < 20000:
            ys, xs = np.nonzero(lab == l)
            tl = (((xs - A_[0]) * ab[0] + (ys - A_[1]) * ab[1]) / (ab @ ab)).mean()
            lakes.append((tl, int(l), float(np.nanmedian(wlev0[lab == l]))))
    lakes.sort()
    rep = {'edit': "5.1 edit 29: the Arch's graben river in reaches", 'date': '2026-11-24', 'one_cell_water_removed': int(CH.sum()),
           'lakes': [{'label': l, 'cells': int(size[l]), 'level_m': round(lv, 1)} for _, l, lv in lakes]}
    # the ground: the one-cell water dry, 2 m over the lakes' level
    lvl = np.median([lv for _, _, lv in lakes]) if lakes else 0.0
    whas, wlev, W1 = whas0.copy(), wlev0.copy(), W0.copy()
    En = E0.copy()
    whas[CH] = False; wlev[CH] = np.nan; W1[CH] = False
    En[CH] = np.maximum(En[CH], lvl + 2.0)
    # the source: the line's north-east end, stepped onto land
    # the source: on the mainland up the axis beyond the north-easternmost lake (its first dry cell past the lake)
    t_first = lakes[0][0] if lakes else 0.0
    src = None
    for s in np.arange(t_first - 0.04, t_first - 0.30, -0.01):
        p = A_ + s * ab
        jy, ix = int(round(p[1])), int(round(p[0]))
        if not whas[jy, ix] and not (lab[max(0, jy - 1):jy + 2, max(0, ix - 1):ix + 2] == (lakes[0][1] if lakes else -1)).any():
            src = (float(p[0]), float(p[1])); break
    big = size > 20000; big[0] = False
    sea = big[lab] & whas
    # the sea it reaches: down the axis, past the south-western end
    YY, XX = np.mgrid[0:E0.shape[0], 0:E0.shape[1]]
    t_all = ((XX - A_[0]) * ab[0] + (YY - A_[1]) * ab[1]) / (ab @ ab)
    sea = sea & (t_all > 1.0) & (np.hypot(XX - (A_[0] + t_all * ab[0]), YY - (A_[1] + t_all * ab[1])) < 25)
    # routing on the window round the box
    import edit_528_ria_network as N
    N.WIN = (x0 - 10, y0 - 10, x1 + 10, y1 + 10)
    router = Router(En, whas, wlev, rng)
    def cells_of(mask):
        ys, xs = np.nonzero(mask[N.WIN[1]:N.WIN[3], N.WIN[0]:N.WIN[2]])
        return list(((ys) * router.nx + xs).astype(int))
    stops = [('lake', l, lv) for _, l, lv in lakes] + [('sea', None, 0.0)]
    reaches, start = [], src
    for kind, l, lv in stops:
        goal_mask = (lab == l) if kind == 'lake' else sea
        goal = cells_of(goal_mask)
        s, dist, pred = router.search(start, router.G)
        goal = np.asarray(goal)
        g = goal[np.argmin(dist[goal])]
        path = router.path(s, pred, g)
        line = [start] + [tuple(map(float, c)) for c in path[1:]]
        pts = resample(G.chaikin(line, 3), 0.6)
        # a small meander, faded at both ends
        s_ = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
        tg = np.gradient(pts, axis=0); nrm = np.stack([-tg[:, 1], tg[:, 0]], 1) / (np.hypot(tg[:, 0], tg[:, 1])[:, None] + 1e-9)
        off = 0.6 * np.sin(2 * math.pi * s_ / (9 + 3 * rng.random()) + rng.random() * 6.28) * np.clip(np.minimum(s_, s_[-1] - s_) / 3.0, 0, 1)
        mp = pts + nrm * off[:, None]
        jj = np.clip(np.round(mp[:, 1]).astype(int), 0, E0.shape[0] - 1); ii = np.clip(np.round(mp[:, 0]).astype(int), 0, E0.shape[1] - 1)
        wet_mid = whas[jj, ii]; wet_mid[[0, -1]] = False
        mp[wet_mid] = pts[wet_mid]
        # a reach leaving a lake starts on the shore, its first dry point (not on the lake's bed)
        jj = np.clip(np.round(np.round(mp[:, 1], 2)).astype(int), 0, E0.shape[0] - 1); ii = np.clip(np.round(np.round(mp[:, 0], 2)).astype(int), 0, E0.shape[1] - 1)
        k0 = 0
        while k0 < len(mp) - 2 and whas[jj[k0], ii[k0]]:
            k0 += 1
        mp = mp[k0:]
        reaches.append({'pts': mp, 'to': kind, 'lake': l, 'level': lv})
        # the next reach leaves this lake by its cell nearest the next stop
        if kind == 'lake':
            nxt = stops[len(reaches)] if len(reaches) < len(stops) else None
            ys, xs = np.nonzero(lab == l)
            if nxt and nxt[0] == 'lake':
                ys2, xs2 = np.nonzero(lab == nxt[1]); c2 = np.array([xs2.mean(), ys2.mean()])
            else:
                c2 = B_ + 0.15 * ab
            i = int(np.argmin(np.hypot(xs - c2[0], ys - c2[1])))
            start = (float(xs[i]), float(ys[i]))
    # beds: each reach falls from the ground (or the lake it leaves) to the level of the water it feeds
    up_level = None
    for k, rc in enumerate(reaches):
        z = bil(En, rc['pts'][:, 0], rc['pts'][:, 1])
        top = z[0] if up_level is None else up_level + 0.6
        end = rc['level'] + 0.05
        bed = np.minimum.accumulate(np.minimum(z, np.linspace(top, end, len(z)) + 0.0))
        bed = np.maximum(bed, end)
        rc['bed'] = bed - 1.0
        up_level = rc['level']
        jj = np.clip(np.round(rc['pts'][:, 1]).astype(int), 0, E0.shape[0] - 1); ii = np.clip(np.round(rc['pts'][:, 0]).astype(int), 0, E0.shape[1] - 1)
        dryc = ~whas[jj, ii]
        En[jj[dryc], ii[dryc]] = np.minimum(En[jj[dryc], ii[dryc]], np.maximum(bed[dryc], lvl + 1.0))
    # one name for all the reaches: the river-naming pass on the whole course
    whole = np.concatenate([rc['pts'] for rc in reaches])
    tmp = [{'id': 'r_arch', 'kind': 'river', 'px': [[round(float(x), 2), round(float(y), 2)] for x, y in whole],
            'q_m3s': list(np.linspace(20, 90, len(whole))), 'bed_m': list(np.linspace(50, 0, len(whole))),
            'length_km': float(np.hypot(*np.diff(whole, axis=0).T).sum() * 2), 'q_mouth_m3s': 90.0, 'order': 2,
            'to': {'kind': 'sea', 'at_px': [float(whole[-1, 0]), float(whole[-1, 1])]}}]
    RN.rename_all_rivers_culturally(tmp, P.regions(), P.settlements(), En_exp=En)
    name, tongue, gloss = tmp[0].get('name'), tmp[0].get('tongue'), tmp[0].get('gloss')
    rep['name'] = name; rep['tongue'] = tongue
    recs = []
    q0 = 20.0
    for k, rc in enumerate(reaches):
        p = rc['pts']; L = float(np.hypot(*np.diff(p, axis=0).T).sum()) * 2
        q = np.linspace(q0, q0 + 0.06 * L, len(p))
        rec = {'id': 'r_arch_%d' % (k + 1), 'name': name, 'kind': 'river', 'perennial': True, 'order': 2, 'reach': k + 1,
               'length_km': round(L, 1), 'q_mouth_m3s': round(float(q[-1]), 1), 'source_m': round(float(rc['bed'][0]), 1),
               'mouth_m': round(float(rc['bed'][-1]), 1), 'region': 'the arch',
               'to': ({'kind': 'lake', 'at_px': [round(float(p[-1, 0]), 2), round(float(p[-1, 1]), 2)]} if rc['to'] == 'lake'
                      else {'sea': 'Western Ocean', 'kind': 'sea', 'at_px': [round(float(p[-1, 0]), 2), round(float(p[-1, 1]), 2)]}),
               'px': [[round(float(x), 2), round(float(y), 2)] for x, y in p], 'bed_m': [round(float(b), 1) for b in rc['bed']],
               'q_m3s': [round(float(v), 1) for v in q], 'tongue': tongue,
               'gloss': (gloss + '; ' if gloss else '') + 'reach %d of %d down the Arch\'s graben, %s' % (
                   k + 1, len(reaches), 'into the next rift lake' if rc['to'] == 'lake' else 'to the sea')}
        recs.append(rec)
        q0 = float(q[-1])
    rep['reaches'] = [{'id': r['id'], 'km': r['length_km'], 'to': r['to'].get('kind'), 'from': r['px'][0], 'end': r['px'][-1]} for r in recs]
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    json.dump(rep, open(os.path.join(HERE, 'edit_529_arch_reaches.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    D['rivers'] = D['rivers'] + recs
    D['h'] = P.encode_heights(D, En, W1)
    D['wl'] = P.encode_levels(D, whas, wlev)
    # the paint: the line's water and its straight thread painted out, the reaches painted in
    band = polyline_mask([[tuple(A_ - 0.03 * ab), tuple(B_ + 0.03 * ab)]], E0.shape, 2) & ~whas
    for key in ('st', 't'):
        arr = P.raster(D, key)
        a = arr.astype(float)
        med = np.stack([nd.median_filter(a[..., c], 9) for c in range(3)], -1)
        thread = band & ((a[..., 2] - a[..., 0]) - (med[..., 2] - med[..., 0]) > 3) & (a.mean(-1) - med.mean(-1) < -3)
        hole = (nd.binary_dilation(thread, iterations=1) & band) | nd.binary_dilation(CH, iterations=1) & ~whas
        rep.setdefault('painted_out_px', {})[key] = int(hole.sum())
        arr = PA.inpaint(arr, hole)
        im = Image.fromarray(arr).convert('RGBA')
        over = Image.new('RGBA', im.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(over)
        for r in recs:
            dr.line([tuple(p) for p in r['px']], fill=RIVER_RGB + (205,), width=1, joint='curve')
        over = over.filter(ImageFilter.GaussianBlur(.6))
        D[key] = P.jpeg_like(D, key, np.array(Image.alpha_composite(im, over).convert('RGB')))
    relit, _, _ = PA.relight(D, E0, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En, W1)
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_529_arch_reaches.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('saved')


if __name__ == '__main__':
    main()
