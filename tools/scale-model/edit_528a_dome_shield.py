#!/usr/bin/env python3
"""Scale model 5.1, edit 28a (2026-11-25): the Dome built as the shield volcano its record describes (the owner: "im not
sure the Dome biome got rendered on map correctly"). Runs before edit 28, so the Ria's rivers that rise on it are routed
off the finished volcano.

    python tools/scale-model/edit_528a_dome_shield.py [--dry]

`the dome` (rmweubdnyts8y): "a large shield volcano, much lower than the Throne, yet high enough (+1,440 to +2,925 m) to
push its region into a cool, wet tropical/subtropical highland climate (Cfa/Cfb)". The land in its polygon held those
heights as an uneven upland with no shield. The first cut set it 1,440-2,925 m, under the 1.7-2.5 km highland round it,
so it read as a hollow (the owner: "it should stand out / rise immediately from surrounding highlands"). Now, inside
the polygon (its water left alone), a broad convex shield replaces the upland:
- It rises 1,450 m over its own foot (h = foot + 1450 (1 - (r/R)^1.7)^1.25, R the polygon's mean radius). The foot is
  the land's height 3-10 px outside, by bearing, merging to one summit toward the centre.
- A ~220 m step of lava-flow fronts stands at its edge.
- At the top, a summit caldera 8 km across and 160 m deep.
- Radial lava-flow ribbing (a few tens of metres), and a quarter of the land's own fine texture kept.
It fades into the land over 3 px past the polygon and never cuts it there. Temperatures
lapsed, rain, class and zone re-derived where the land moved, the paint relit and tinted for the new heights. Refuses to
run twice (the centre standing 1 km over the ring round the polygon).
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C, smodel.geom as G   # noqa: E402

RID = 'rmweubdnyts8y'
RISE = 1450.0          # the record's +1,440 to +2,925 m read as the shield's own rise, over the highland it stands on


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    regs = P.regions()
    dome = next(r for r in regs if r.get('id') == RID)
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    sh = E0.shape
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    pts = np.array(dome['points'], float)
    poly = G.poly([tuple(p) for p in pts], 1.0, 1.0, sh)
    cy, cx = [float(v.mean()) for v in np.nonzero(poly)]
    R = float(np.mean(np.hypot(pts[:, 0] - cx, pts[:, 1] - cy)))
    ring0 = nd.binary_dilation(poly, iterations=2) & ~poly
    if E0[int(cy), int(cx)] > np.median(E0[ring0]) + 1000:
        sys.exit('edit_528a has run already (the shield stands over its ring)')
    r = np.hypot(XX - cx, YY - cy)
    th = np.arctan2(YY - cy, XX - cx)
    u = np.clip(r / R, 0, 1.2)
    dout = nd.distance_transform_edt(~poly)
    # the shield stands on the highland round it (the owner, 2026-11-25: "it should stand out / rise immediately from
    # surrounding highlands"): its foot is the land's own height in a ring 3-10 px outside the polygon, by bearing
    # (a median per 10 degrees, smoothed round the circle), and it rises RISE over that to the summit
    ring = (dout > 3) & (dout <= 10) & ~whas0
    nb = 36
    bins = ((th + np.pi) / (2 * np.pi) * nb).astype(int) % nb
    foot = np.array([np.median(E0[ring & (bins == b)]) if (ring & (bins == b)).any() else np.nan for b in range(nb)])
    foot = np.where(np.isnan(foot), np.nanmedian(foot), foot)
    foot = nd.gaussian_filter1d(np.r_[foot, foot, foot], 1.5)[nb:2 * nb]
    thc = (th + np.pi) / (2 * np.pi) * nb - 0.5
    base = np.interp(thc, np.arange(-1, nb + 1), np.r_[foot[-1], foot, foot[0]])
    base = foot.mean() + (base - foot.mean()) * G.sstep(0.0, 1.0, u)     # one summit: the bearing's foot only on the flanks
    shield = base + RISE * np.clip(1 - u ** 1.7, 0, 1) ** 1.25
    # the foot: lava-flow fronts, a step of ~220 m at the polygon's edge, gone a few px out
    toe = 220.0 * (1 - G.sstep(0.88, 1.12, u))
    rib = (22.0 * np.sin(th * 23 + 3 * np.sin(r / 7.0)) + 12.0 * np.sin(th * 41 + 1.3)) * np.clip(u * 3, 0, 1) * (1 - np.clip(u, 0, 1))
    calderar = 2.0
    cald = np.where(r < calderar, -160.0 * (1 - (r / calderar) ** 4), 0.0)
    fine = E0 - nd.gaussian_filter(E0, 3.0)
    target = shield + toe + rib + cald + 0.25 * fine
    # full inside the polygon, fading over 3 px past it; never below the land there (the caldera aside)
    w = np.clip(1 - dout / 3.0, 0, 1) * ~whas0
    w = nd.gaussian_filter(w, 0.7) * ~whas0
    # inside the polygon the shield replaces the upland (its old knobs too); past it, the foot never cuts the land
    En = E0 * (1 - w) + np.where(poly, target, np.maximum(target, E0)) * w
    # the shores kept: no land beside water below its level plus a metre
    dw, (wy, wx) = nd.distance_transform_edt(~whas0, return_indices=True)
    wl_near = np.nan_to_num(wlev0, nan=-9e9)[wy, wx]
    near = (~whas0) & (dw <= 2) & (w > 0)          # only where the shield moved the land
    En[near] = np.maximum(En[near], wl_near[near] + 1.0)
    moved = np.abs(En - E0) > 1
    rep = {'edit': '5.1 edit 28a: the Dome as a shield volcano', 'date': '2026-11-25', 'centre': [round(cx, 1), round(cy, 1)],
           'radius_km': round(R * 2), 'foot_m_by_bearing': [round(float(foot.min())), round(float(foot.max()))],
           'summit_m': round(float(En[(r > 2.4) & (r < 3.6)].max())), 'caldera_floor_m': round(float(En[int(cy), int(cx)])),
           'old_upland_max_m': round(float(E0[poly].max())), 'ring_outside_median_m': round(float(np.median(E0[(dout > 3) & (dout <= 10) & ~whas0]))),
           'edge_m_median': round(float(np.median(En[poly & (nd.distance_transform_edt(poly) <= 1.5)]))),
           'moved_cells': int(moved.sum()), 'raised': int((En > E0 + 1).sum()), 'lowered': int((En < E0 - 1).sum())}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    json.dump(rep, open(os.path.join(HERE, 'edit_528a_dome_shield.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    raw0 = {k: P.raster(D, k, 'L') for k in ('p', 'c', 'z')}
    D['h'] = P.encode_heights(D, En, W0)
    lap = C.lapse(D, E0, En, whas0, wlev0)
    for k in C.TEMPS:
        D[k] = lap[k]
    rain2, cls2, zon2, _, crep = C.reclimate(D, E0, En, whas0, whas0.copy())
    rep['reclimate'] = crep
    D['p'] = P.b64(Image.fromarray(np.clip(np.round(rain2 / 4000.0 * 255.0), 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(cls2.astype(np.uint8), 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(zon2.astype(np.uint8), 'L'), optimize=True)
    rain0 = raw0['p'].astype(float) / 255 * 4000
    rain_now = P.raster(D, 'p', 'L').astype(float) / 255 * 4000
    D['rt'] = PA.repaint(D, 'rt', PA.ramp(rain0), PA.ramp(rain_now), np.abs(rain_now - rain0) > 1)
    hexrgb = lambda h: tuple(int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))
    col = np.array([hexrgb(cc['color']) for cc in D['climate']['classes']])
    cnow = P.raster(D, 'c', 'L')
    D['ct'] = PA.repaint(D, 'ct', col[raw0['c']], col[cnow], cnow != raw0['c'])
    for key in ('st', 't'):
        D[key] = P.jpeg_like(D, key, PA.retint(P.raster(D, key), E0, En, moved, ~moved, 150.0))
    relit, _, _ = PA.relight(D, E0, En)
    for k_, v in relit.items():
        D[k_] = v
    D['h'] = P.encode_heights(D, En, W0)
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_528a_dome_shield.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print('saved')


if __name__ == '__main__':
    main()
