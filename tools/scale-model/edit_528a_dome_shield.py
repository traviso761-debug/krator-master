#!/usr/bin/env python3
"""Scale model 5.1, edit 28a (2026-11-25): the Dome built as the shield volcano its record describes (the owner: "im not
sure the Dome biome got rendered on map correctly"). Runs before edit 28, so the Ria's rivers that rise on it are routed
off the finished volcano.

    python tools/scale-model/edit_528a_dome_shield.py [--dry]

`the dome` (rmweubdnyts8y): "a large shield volcano, much lower than the Throne, yet high enough (+1,440 to +2,925 m) to
push its region into a cool, wet tropical/subtropical highland climate (Cfa/Cfb)". The land in its polygon held those
heights as an uneven upland with no shield. Here, inside the polygon (its water left alone): a broad convex shield
round the polygon's centre, from 1,440 m at its edge to 2,925 m at the summit (h = base + rise (1 - (r/R)^2)^1.6, R the
polygon's mean radius), a summit caldera 8 km across and 140 m deep, radial lava-flow ribbing (a few tens of metres), a
quarter of the land's own fine texture kept; eased into the land round it over 8 px past the polygon. Temperatures
lapsed, rain, class and zone re-derived where the land moved, the paint relit and tinted for the new heights. Refuses to
run twice (the summit at 2,925 m with its caldera).
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C, smodel.geom as G   # noqa: E402

RID = 'rmweubdnyts8y'
BASE, TOP = 1440.0, 2925.0


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
    if abs(E0[int(cy), int(cx)] - (TOP - 140)) < 30:
        sys.exit('edit_528a has run already (the caldera floor is at the summit)')
    r = np.hypot(XX - cx, YY - cy)
    th = np.arctan2(YY - cy, XX - cx)
    u = np.clip(r / R, 0, 1.2)
    shield = BASE + (TOP - BASE) * np.clip(1 - u ** 2, 0, 1) ** 1.6
    rib = (18.0 * np.sin(th * 23 + 3 * np.sin(r / 7.0)) + 10.0 * np.sin(th * 41 + 1.3)) * np.clip(u * 3, 0, 1) * (1 - np.clip(u, 0, 1))
    calderar = 2.0
    cald = np.where(r < calderar, -140.0 * (1 - (r / calderar) ** 4), 0.0)
    fine = E0 - nd.gaussian_filter(E0, 3.0)
    target = shield + rib + cald + 0.25 * fine
    # eased in: full inside the polygon, fading over 8 px past it
    dout = nd.distance_transform_edt(~poly)
    w = np.clip(1 - dout / 8.0, 0, 1) * ~whas0
    w = nd.gaussian_filter(w, 1.0) * ~whas0
    En = E0 * (1 - w) + target * w
    # the shores kept: no land beside water below its level plus a metre
    dw, (wy, wx) = nd.distance_transform_edt(~whas0, return_indices=True)
    wl_near = np.nan_to_num(wlev0, nan=-9e9)[wy, wx]
    near = (~whas0) & (dw <= 2) & (w > 0)          # only where the shield moved the land
    En[near] = np.maximum(En[near], wl_near[near] + 1.0)
    moved = np.abs(En - E0) > 1
    rep = {'edit': '5.1 edit 28a: the Dome as a shield volcano', 'date': '2026-11-25', 'centre': [round(cx, 1), round(cy, 1)],
           'radius_km': round(R * 2), 'summit_m': round(float(En[int(cy), int(cx) + 3])), 'caldera_floor_m': round(float(En[int(cy), int(cx)])),
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
