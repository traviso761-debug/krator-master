#!/usr/bin/env python3
"""Where a town could stand that CONTROLS A PASS into a region and can also FEED OR PAY FOR ITSELF.

    python3 tools/scale-model/find_pass_site.py                       # the Inner Crater's south-eastern rim
    python3 tools/scale-model/find_pass_site.py --into "Inner Crater" --box 880,940,1210,1230 --top 8
    python3 tools/scale-model/find_pass_site.py --json

Written for Eidolon (the owner, 2026-11-25: "let's try and find a place for it that controls the pass to the inner
crater but also can support itself or produce valuable resources"), and general: give it a polygon and a box and it
answers the same question anywhere.

WHAT A PASS IS HERE. The region's boundary is a closed curve on the model's grid. At every boundary cell this walks a
short transect straight across the boundary and records the HIGHEST ground on it: that is what a road must climb to get
in or out there. A pass is a local minimum of that barrier along the boundary -- a place the rim is low. The candidates
are then thinned so that two passes 40 km apart are not reported as one.

WHAT CONTROLS A PASS. A low saddle is only a chokepoint if its neighbours are high: a rim that is low everywhere is a
plain, not a gate. So each candidate carries `rivals` -- how many other crossings within `--control-km` are no more than
`--rival-m` higher -- and `relief`, how far the barrier rises within 30 km either side along the rim. One rival and a
tall shoulder is a gate; six rivals is a frontier.

WHAT SUPPORTS A TOWN. Measured in a reach round the site, as `openworld/resources-settlements.json` measures it for the
pins that exist:
  water      the nearest water cell, in km (the model's own `wl`)
  rain/temp  the model's `p` and `tm` at the site, and the share of the reach that is farmable at all
  land       the share of the reach under a workable slope -- a site wedged in a gorge has nowhere to put a town
  geology    `kits/resources/data/geology-gemini.json`, the same layers the resources file was built from, summed over
             the reach by family, so "produce valuable resources" is a number and not a hope
The score is deliberately NOT a single number: a pass that feeds itself and a pass that mines silver are different
answers to the owner's "or", and the table prints both so the choice stays theirs.
"""
import os, sys, json, base64
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path[:0] = [HERE]
import smodel.page as P   # noqa: E402
from smodel.geom import region_mask   # noqa: E402
from scipy import ndimage as nd   # noqa: E402

KM = 2.0
VALUABLE = ['gold', 'silver', 'rare-earth', 'tin', 'copper', 'iron', 'coal', 'oil', 'sulfur', 'saltpeter', 'halite', 'potash']


def arg(k, d=None):
    for i, a in enumerate(sys.argv):
        if a == '--' + k and i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return d


def geology():
    p = os.path.join(REPO, 'kits', 'resources', 'data', 'geology-gemini.json')
    if not os.path.exists(p):
        p = os.path.join(REPO, 'kits', 'resources', 'data', 'geology.json')
    G = json.load(open(p, encoding='utf-8'))
    GW, GH = int(G['grid']['w']), int(G['grid']['h'])
    out = {}
    for k, b64 in G['layers'].items():
        b = np.frombuffer(base64.b64decode(b64), dtype=np.uint8)
        out[k] = np.repeat(b[1::2], b[0::2].astype(np.int32) + 1).reshape(GH, GW)
    return out, float(G['grid']['cell_km'])


def main():
    into = arg('into', 'Inner Crater')
    top = int(arg('top', '6'))
    reach_km = float(arg('reach', '40'))
    ctrl_km = float(arg('control-km', '150'))
    rival_m = float(arg('rival-m', '250'))
    box = arg('box', '880,940,1210,1230')
    x0, y0, x1, y1 = [int(v) for v in box.split(',')]

    D = P.load()
    E, _ = P.heights(D)
    whas, _ = P.water_levels(D)
    H, W = E.shape
    M = region_mask(P.regions(), into, *P.grid(D), (H, W))
    GEO, gcell = geology()

    import io as _io
    from PIL import Image
    def raster(key):
        raw = D.get(key)
        return np.asarray(Image.open(_io.BytesIO(base64.b64decode(raw))).convert('L')).astype(float) if isinstance(raw, str) else None
    TM, PP = raster('tm'), raster('p')

    # the boundary: inside cells with an outside neighbour, inside the box
    edge = M & ~nd.binary_erosion(M)
    win = np.zeros_like(edge)
    win[y0:y1, x0:x1] = True
    edge &= win
    ys, xs = np.nonzero(edge)
    if not len(ys):
        sys.exit('no boundary of %r inside the box %s' % (into, box))

    # the barrier at a boundary cell: walk 14 cells (28 km) each way along the OUTWARD normal and take the highest
    # ground on the transect. The normal is the gradient of the mask, smoothed, so it does not jitter cell to cell.
    sm = nd.gaussian_filter(M.astype(float), 3.0)
    gy, gx = np.gradient(sm)
    bar = np.full(len(ys), np.inf)
    for i, (y, x) in enumerate(zip(ys, xs)):
        nxv, nyv = -gx[y, x], -gy[y, x]
        n = np.hypot(nxv, nyv)
        if n < 1e-6:
            continue
        nxv, nyv = nxv / n, nyv / n
        hi = -1e9
        for t in range(-14, 15):
            px, py = int(round(x + nxv * t)), int(round(y + nyv * t))
            if not (0 <= px < W and 0 <= py < H):
                hi = 1e9
                break
            hi = max(hi, float(E[py, px]))
        bar[i] = hi

    order = np.argsort(bar)
    picked = []
    for i in order:
        if not np.isfinite(bar[i]):
            continue
        y, x = int(ys[i]), int(xs[i])
        if any(np.hypot(x - q[1], y - q[0]) * KM < 40.0 for q in picked):
            continue
        picked.append((y, x, float(bar[i])))
        if len(picked) >= top * 3:
            break

    rows = []
    rr = int(round(reach_km / KM))
    for (y, x, b) in picked:
        sl = (slice(max(0, y - rr), y + rr + 1), slice(max(0, x - rr), x + rr + 1))
        sub = E[sl]
        # water
        wd = None
        for r in range(1, 41):
            if whas[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1].any():
                wd = r * KM
                break
        # workable land: the share of the reach whose local slope is under 8 % and which is not water
        gyy, gxx = np.gradient(sub, KM * 1000.0)
        slope = np.hypot(gxx, gyy)
        land = float(((slope < 0.08) & ~whas[sl]).mean())
        # control: how many other crossings within control-km are no more than rival-m higher
        rivals = 0
        for (y2, x2, b2) in picked:
            if (y2, x2) == (y, x):
                continue
            if np.hypot(x2 - x, y2 - y) * KM <= ctrl_km and b2 <= b + rival_m:
                rivals += 1
        # the rim's shoulder: the barrier 30 km either way along the boundary
        near = [bb for (yy, xx, bb) in zip(ys, xs, bar)
                if np.isfinite(bb) and 8.0 <= np.hypot(xx - x, yy - y) * KM <= 30.0]
        shoulder = float(np.median(near) - b) if near else 0.0
        # geology over the reach
        g0y, g0x = int(y * KM / gcell), int(x * KM / gcell)
        gr = max(1, int(round(reach_km / gcell)))
        geo = {}
        for fam in VALUABLE:
            a = GEO.get(fam)
            if a is None:
                continue
            q = a[max(0, g0y - gr):g0y + gr + 1, max(0, g0x - gr):g0x + gr + 1]
            if q.size:
                geo[fam] = (float(q.mean()), int(q.max()))
        rich = sorted([(v[1], k) for k, v in geo.items() if v[1] >= 100], reverse=True)
        rows.append(dict(px=[x, y], barrier_m=round(b), site_m=round(float(E[y, x])),
                         water_km=wd, rain_mm=round(float(PP[y, x]) * 4000.0 / 255.0) if PP is not None else None,
                         temp_c=round(float(TM[y, x]) - 90.0, 1) if TM is not None else None,
                         land_pct=round(100 * land), rivals=rivals, shoulder_m=round(shoulder),
                         rich=[k for _, k in rich][:5],
                         geo={k: v for k, v in sorted(geo.items(), key=lambda kv: -kv[1][1])[:6]}))
    rows.sort(key=lambda r: (r['rivals'], -r['shoulder_m'], r['barrier_m']))
    rows = rows[:top]
    if '--json' in sys.argv:
        print(json.dumps(dict(into=into, box=[x0, y0, x1, y1], reach_km=reach_km, sites=rows), ensure_ascii=False, indent=1))
        return
    print('passes into %r in the box %s, %d of them, ranked by how few rivals they have:' % (into, box, len(rows)))
    print('  px          barrier  site    rim+30km  rivals  water   rain  temp   flat   rich in')
    for r in rows:
        print('  %4d,%-4d   %6d  %6d  %+7d  %5d   %5s  %5s  %5s  %4s%%  %s'
              % (r['px'][0], r['px'][1], r['barrier_m'], r['site_m'], r['shoulder_m'], r['rivals'],
                 ('%.0f km' % r['water_km']) if r['water_km'] else '>80',
                 r['rain_mm'], r['temp_c'], r['land_pct'], ', '.join(r['rich']) or '-'))


if __name__ == '__main__':
    main()
