#!/usr/bin/env python3
"""Scale model 5.1, edit 7 polish (2026-11-17): the mountains round the Lake of the Vale.

    python tools/scale-model/edit_517_vale_ring.py          # after edit_517_pher_rim.py; edits the heights; once
    python tools/scale-model/edit_517_vale_ring.py --dry    # print the report, write nothing

The owner, 2026-11-17 (settlements/pher/PLAN.md, the fifth round): "look at the lake atitlan model in the world
menagerie. I'd like to give something like that kind of effect with the Lake of the Vale, but with the rise to the
mountains not quite as steep. they should be visible though, and come up the lake in places"; "Whole lake".

The lake (Erewhon's caldera lake, -520 m, about 140 by 60 km) was ringed by a wall about 300 m high in its first 4 km
and a plateau 500-600 m over the water behind it: nothing to see across the water. This edit raises a ring of massifs
round it, procedurally, from the lake's own shape:

- **The massifs**: one every MASSIF_KM (20 km) of the lake's ring (its angle round the centre, in the ellipse of its
  box), each standing DIST_PX (4.5-7.5 cells, 9-15 km) out from the shore along the ray from the centre, its height
  800-1,250 m over the ground it stands on (peaks 1,300-1,800 m over the water) and its radius 4-6 cells; a gaussian
  dome roughened by a ridged field so each reads as a mountain, not a bump.
- **The range**: a crest band CREST_PX (5 cells, 10 km) back from the water, 480-820 m over the ground, its height
  wandering round the ring, so the massifs stand on a continuous range with saddles, not in a row of domes; a ridged
  field at two scales breaks every slope into ribs.
- **The spurs** ("come up to the lake in places"): from every massif whose draw allows (SPUR_SHARE), a ridge from its
  shoulder straight down to the shore, falling to TIP_M (150-260 m) over the water at the shoreline, so it ends in a
  steep promontory standing in the lake.
- **What stays open**: the contributions take the larger of the dome and the spur (no stacking) and only ever raise the
  ground. Every settlement and site on the lake keeps its ground (fading in from 1.5 to 3.5 cells), and every river
  that reaches the lake keeps its valley (fading in from 0.8 to 2.5 cells of its course), so the Qol Siṭrīm's road and
  the Ālph's outlet stay low; the lake, every wet cell and the lake's islands are left alone.

The draws come from SEED through a hash of the massif's index, so a re-run gives the same mountains. The temperatures
are lapsed with the change (smodel.climate.lapse) and the paint relit (smodel.paint.relight). Writes
edit_517_vale_ring.report.json and sets DATA.landforms' `vale_ring` marker so it runs once.
Regions over this ground re-cut after it: openworld/xanadu-north-shore and openworld/xanadu-oidong-highrift.
"""
import os, sys, json, math, hashlib
import numpy as np
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C   # noqa: E402

SEED = 51717
LAKE_AT = (843, 1493)           # a cell of the lake (Phēr's cove)
LAKE_LEVEL = -520.0
MASSIF_KM = 20.0
DIST_PX = (4.5, 7.5)
HEIGHT_M = (800.0, 1250.0)
RADIUS_PX = (4.0, 6.0)
SPUR_SHARE = 0.55
TIP_M = (150.0, 260.0)          # the spur's tip over the water, at the shoreline
SPUR_W_PX = 1.1
CREST_PX = (5.0, 2.6)           # the range behind the shore: its crest's distance from the water and its half-width
CREST_M = (480.0, 820.0)        # its height over the ground it stands on, varying along the ring
PROTECT_PX = (1.5, 3.5)
RIVER_PX = (0.8, 2.5)
BOX = (780, 1440, 915, 1560)    # x0, y0, x1, y1: the cells looked at
# the settlements and sites on the lake (scale model pins and openworld/SITES.json's north-shore sites)
KEEP = [('Erehwon', 841, 1517), ('Ōlḍ-Thalaba', 860, 1496), ('Phēr', 843, 1491), ('Māuṭh', 852, 1494),
        ('Ḍāiyar', 870, 1500), ('the Qol ford', 822.7, 1480), ('the Qol head', 826.7, 1464)]


def draw(i, salt):
    """a number in [0, 1) from (SEED, i, salt): the same on every run"""
    h = hashlib.sha256(('%d:%d:%s' % (SEED, i, salt)).encode()).digest()
    return int.from_bytes(h[:8], 'big') / 2.0 ** 64


def lerp(a, b, t):
    return a + (b - a) * t


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def seg_dist(xx, yy, a, b):
    (ax, ay), (bx, by) = a, b
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / max(L2, 1e-9), 0, 1)
    return np.hypot(ax + t * dx - xx, ay + t * dy - yy), t


def ridged(xx, yy, scale, seed):
    """a ridged field in [0, 1]: three octaves of value noise folded at 0.5"""
    rng = np.random.default_rng(seed)
    out = np.zeros_like(xx)
    amp, tot = 1.0, 0.0
    for o in range(3):
        s = scale / (2 ** o)
        g = rng.random((int((BOX[3] - BOX[1]) / s) + 3, int((BOX[2] - BOX[0]) / s) + 3))
        u, v = (xx - BOX[0]) / s, (yy - BOX[1]) / s
        n = nd.map_coordinates(g, [v, u], order=3, mode='nearest')
        out += amp * (1 - np.abs(2 * n - 1))
        tot += amp
        amp *= 0.5
    return out / tot


def lake_mask(whas, wlev):
    lab, _ = nd.label(whas & (np.abs(wlev - LAKE_LEVEL) < 1.0))
    return lab == lab[LAKE_AT[1], LAKE_AT[0]]


def plan(E, whas, wlev, rivers):
    m = lake_mask(whas, wlev)
    ys, xs = np.nonzero(m)
    cx, cy = (xs.min() + xs.max()) / 2.0, (ys.min() + ys.max()) / 2.0
    ax, ay = (xs.max() - xs.min()) / 2.0 + 0.5, (ys.max() - ys.min()) / 2.0 + 0.5
    # the ring's length (Ramanujan's ellipse) and the massifs along it
    per = math.pi * (3 * (ax + ay) - math.sqrt((3 * ax + ay) * (ax + 3 * ay)))
    n = max(6, int(round(per * 2.0 / MASSIF_KM)))
    x0, y0, x1, y1 = BOX
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(float)
    mb = m[y0:y1, x0:x1]
    massifs = []
    for k in range(n):
        th = 2 * math.pi * (k + 0.35 * (draw(k, 'th') - 0.5)) / n
        dx, dy = math.cos(th) * ax, math.sin(th) * ay
        L = math.hypot(dx, dy)
        ux, uy = dx / L, dy / L
        # the outer shore along the ray: the first lake cell walking in from outside (the lake rings an island)
        t, last = 120.0, None
        while t > 0:
            px, py = cx + ux * t, cy + uy * t
            if 0 <= int(round(py)) < m.shape[0] and 0 <= int(round(px)) < m.shape[1] and m[int(round(py)), int(round(px))]:
                last = (px, py)
                break
            t -= 0.25
        if last is None:
            continue
        dist = lerp(*DIST_PX, draw(k, 'dist'))
        mx, my = last[0] + ux * dist, last[1] + uy * dist
        massifs.append({'k': k, 'theta_deg': round(math.degrees(th), 1), 'shore_px': [round(last[0], 2), round(last[1], 2)],
                        'px': [round(mx, 2), round(my, 2)], 'height_m': round(lerp(*HEIGHT_M, draw(k, 'h'))),
                        'radius_px': round(lerp(*RADIUS_PX, draw(k, 'r')), 2), 'spur': draw(k, 'spur') < SPUR_SHARE,
                        'tip_m': round(lerp(*TIP_M, draw(k, 'tip'))), 'dir': [ux, uy]})
    # the field: the larger of the range, each massif's dome and spur, raised only
    rough = 0.62 + 0.24 * ridged(xx, yy, 5.0, SEED) + 0.14 * ridged(xx, yy, 2.2, SEED + 1)
    Eb = E[y0:y1, x0:x1]
    # the range: a crest band at CREST_PX from the water, its height wandering round the ring (three seeded waves)
    dl = nd.distance_transform_edt(~mb)   # the lake lies inside the box
    th = np.arctan2((yy - cy) / ay, (xx - cx) / ax)
    wav = sum(math.sin(f * 1.0) * 0 + np.sin(f * th + 2 * math.pi * draw(f, 'ph')) / f for f in (2, 3, 5))
    hr = lerp(CREST_M[0], CREST_M[1], np.clip(0.5 + 0.38 * wav, 0, 1))
    lift = hr * np.exp(-((dl - CREST_PX[0]) / CREST_PX[1]) ** 2) * rough
    lift = np.where(dl < CREST_PX[0], lift * smooth(1.0, 4.0, dl), lift)   # the range stands back from the water
    for M in massifs:
        r = np.hypot(xx - M['px'][0], yy - M['px'][1])
        dome = M['height_m'] * np.exp(-(r / M['radius_px']) ** 2) * rough
        lift = np.maximum(lift, dome)
        if M['spur']:
            # from the massif's shoulder (half its radius in) to the shore, falling to its tip over the water
            a = (M['px'][0] - M['dir'][0] * 0.5 * M['radius_px'], M['px'][1] - M['dir'][1] * 0.5 * M['radius_px'])
            b = (M['shore_px'][0] + M['dir'][0] * 0.4, M['shore_px'][1] + M['dir'][1] * 0.4)
            ds, t = seg_dist(xx, yy, a, b)
            top = M['height_m'] * np.exp(-0.25) * 0.9
            crest = lerp(top, 0.0, t) + (1 - t) * 0.0          # the crest's lift falls along the spur ...
            want = LAKE_LEVEL + M['tip_m']                     # ... to its tip's height over the water
            tip_lift = np.maximum(0.0, want - Eb)
            crest = np.maximum(crest, tip_lift * smooth(0.55, 1.0, t))
            spur = crest * np.exp(-(ds / SPUR_W_PX) ** 2) * (0.85 + 0.15 * rough)
            lift = np.maximum(lift, spur)
    # what stays open
    keep = np.ones_like(xx)
    for _, kx, ky in KEEP:
        keep *= smooth(PROTECT_PX[0], PROTECT_PX[1], np.hypot(xx - kx, yy - ky))
    rd = np.full_like(xx, 1e9)
    for R in rivers:
        pts = R.get('px') or R.get('drawn_px') or []
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            if max(a[0], b[0]) < x0 - 5 or min(a[0], b[0]) > x1 + 5 or max(a[1], b[1]) < y0 - 5 or min(a[1], b[1]) > y1 + 5:
                continue
            rd = np.minimum(rd, seg_dist(xx, yy, tuple(a), tuple(b))[0])
    keep *= smooth(RIVER_PX[0], RIVER_PX[1], rd)
    wet = whas[y0:y1, x0:x1] | mb
    # the lake's islands (land it encloses: not joined to the box's edge) are left as they are
    land, _ = nd.label(~wet)
    edge = set(np.unique(np.concatenate([land[0], land[-1], land[:, 0], land[:, -1]]))) - {0}
    island = (land > 0) & ~np.isin(land, list(edge))
    lift = np.where(wet | island, 0.0, lift * keep)
    return {'mask': m, 'centre': [cx, cy], 'axes': [ax, ay], 'perimeter_px': per, 'massifs': massifs}, lift


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E, W = P.heights(D)
    whas, wlev = P.water_levels(D)
    if D['landforms'].get('vale_ring'):
        sys.exit('edit_517_vale_ring has already run (DATA.landforms.vale_ring is set)')
    info, lift = plan(E, whas, wlev, D['rivers'])
    x0, y0, x1, y1 = BOX
    En = E.copy()
    En[y0:y1, x0:x1] = E[y0:y1, x0:x1] + lift
    mb = info['mask'][y0:y1, x0:x1]
    dlake = nd.distance_transform_edt(~mb)
    Eb, Enb, wb = E[y0:y1, x0:x1], En[y0:y1, x0:x1], whas[y0:y1, x0:x1]
    rings = []
    for k in (1, 2, 4, 6, 8, 10):
        r = (dlake > k - .5) & (dlake <= k + .5) & ~wb
        rings.append({'px': k, 'km': 2 * k, 'before_m': round(float(Eb[r].mean())), 'after_m': round(float(Enb[r].mean())),
                      'max_after_m': round(float(Enb[r].max()))})
    del info['mask'], dlake
    keep_check = [{'name': nm, 'px': [kx, ky], 'before_m': round(float(E[int(round(ky)), int(round(kx))]), 1),
                   'after_m': round(float(En[int(round(ky)), int(round(kx))]), 1)} for nm, kx, ky in KEEP]
    rep = {'edit': '5.1 edit 7 polish: the mountains round the Lake of the Vale', 'date': '2026-11-17', 'seed': SEED,
           'lake': {'centre_px': [round(v, 1) for v in info['centre']], 'half_axes_px': [round(v, 1) for v in info['axes']],
                    'ring_km': round(info['perimeter_px'] * 2.0)},
           'massifs': [{k: v for k, v in M.items() if k != 'dir'} for M in info['massifs']],
           'cells': int((lift > 1).sum()), 'max_lift_m': round(float(lift.max())), 'rings': rings, 'kept': keep_check}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    assert all(abs(k['after_m'] - k['before_m']) < 15 for k in keep_check), 'a settlement\'s ground moved'
    assert not (lift[wb] > 0).any(), 'the water must not change'
    if dry:
        return
    lap = C.lapse(D, E, En, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    relit, _, _ = PA.relight(D, E, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En)
    D['landforms']['vale_ring'] = {'edit': 'edit_517_vale_ring.py', 'seed': SEED, 'massifs': len(info['massifs']),
                                   'note': 'The mountains round the Lake of the Vale (the owner, 2026-11-17).'}
    P.save(D)
    with open(os.path.join(HERE, 'edit_517_vale_ring.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
