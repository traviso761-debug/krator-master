#!/usr/bin/env python3
"""Scale model 5.1, edit 32 (2026-11-25): the SW outer wall as a biome, its vales, and the Trigemini Pass (the owner: "sw
outer wall will be a biome. it may get a few small vales to break up the complete airlessness, but most prominently will
be the Trigemini Pass region which contains a Cold Lake type lake at its center and provides one of Dalab's backup routes
to the Rift").

    python tools/scale-model/edit_532_sw_wall_trigemini.py [--dry]

The polygons are the live map's (edit_532_live.json). At the model's 2 km cells, never raising the land:
- Trigemini Pass: three U-troughs that meet at a high basin, the pass's three heads. In the basin, a tarn like the Yeti
  Kingdom's Cold Lake (5,680 m, in a ring at 6-6.7 km): level 5,680 m, class WH. The NE trough climbs from Dalab's side
  over a 6,350 m col; the S trough goes down to the w rift highland over a 6,250 m col (Dalab's back way to the Rift, past
  the tarn). The W trough crosses a 6,450 m col and falls to the copper glacier's head (the hard way).
- three small vales cut into the wall's airless crest, each a short U-valley from the breathable flank nearest it,
  rising to a bowl head at 5.9-6.2 km: air (HT/ET) where the crest held none.
Temperatures are lapsed. Cells that were airless and are now cut to breathable heights take the temperatures of nearby
land at their new height. Rain, class and zone are re-derived. The tarn is WH; the paint is relit and tinted to the new
heights. The river courses across moved ground are kept running downhill. The page: SW outer wall (biome) and Trigemini
Pass become default regions, reconcile key 5.1e28. Refuses to run twice: the tarn's marker is water at the junction.
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import cKDTree
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C, smodel.geom as G   # noqa: E402

KEY = '5.1e28'
LIVE = json.load(open(os.path.join(HERE, 'edit_532_live.json'), encoding='utf-8'))
REG = {r['name']: r for r in LIVE['regions']}
SRC = os.path.join(HERE, 'model', 'src')
J = (279.0, 1120.0)       # the Trigemini junction, the tarn's centre
TL = 5680.0               # the tarn's level (Cold Lake's)
# the three arms from the junction: (name, the land it comes out on, its col, half width px). Each is routed over the
# wall inside the polygon (see route) and cut as a valley rising from the tarn's basin (5,700 m) to its col at the
# course's own saddle and falling to the land at its end.
TRIGEMINI = [
    ('NE', (364.0, 1063.0), 6350.0, 4.0),       # to Dalab's side
    ('S', (271.0, 1210.0), 6250.0, 4.0),        # to the w rift highland: Dalab's back way to the Rift
    ('W', (185.0, 1152.0), 6450.0, 3.5),        # to the copper glacier's head, the hard way
]
# the vales: (head, floor at the head, half width px); each runs from the nearest breathable flank to its head
VALES = [((410.0, 1213.0), 6100.0, 3.5), ((568.0, 1292.0), 5900.0, 3.5), ((628.0, 1362.0), 6200.0, 3.0)]


def codes_of(D):
    return [c['code'] for c in D['climate']['classes']]


def nearest_flank(E, cls, codes, head, maxr=60, lim=6800.0):
    """The nearest cell to `head` that has air and stands under `lim` (the breathable flank a vale opens onto)."""
    iO = codes.index('O')
    hx, hy = int(head[0]), int(head[1])
    y0, x0 = max(0, hy - maxr), max(0, hx - maxr)
    sub = (cls[y0:hy + maxr, x0:hx + maxr] != iO) & (E[y0:hy + maxr, x0:hx + maxr] < lim)
    yy, xx = np.nonzero(sub)
    k = int(np.argmin(np.hypot(xx + x0 - head[0], yy + y0 - head[1])))
    return (float(xx[k] + x0), float(yy[k] + y0))


def carve(E0, En, lines, rise=1800.0):
    """U-valleys on centre lines: the floor runs from f0 to f1 along each (None: the land there), never above the land,
    and the sides rise `rise` (d/hw)^2. Cuts En in place (only ever lower) and returns the floor mask."""
    sh = E0.shape
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    floor = np.zeros(sh, bool)
    for line, f0, f1, hw in lines:
        L = np.array(line, float)
        seg = np.r_[0, np.cumsum(np.hypot(*np.diff(L, axis=0).T))]
        t = np.linspace(0, seg[-1], max(2, int(seg[-1] / 0.5)))
        x = np.interp(t, seg, L[:, 0]); y = np.interp(t, seg, L[:, 1])
        a = E0[int(round(y[0])), int(round(x[0]))] if f0 is None else f0
        b = E0[int(round(y[-1])), int(round(x[-1]))] if f1 is None else f1
        f = a + (b - a) * t / seg[-1]
        f = np.minimum(f, E0[np.round(y).astype(int), np.round(x).astype(int)])
        R = int(math.ceil(2.4 * hw)) + 1
        x0, x1 = max(0, int(x.min()) - R), min(sh[1], int(x.max()) + R + 1)
        y0, y1 = max(0, int(y.min()) - R), min(sh[0], int(y.max()) + R + 1)
        cells = np.stack([XX[y0:y1, x0:x1].ravel(), YY[y0:y1, x0:x1].ravel()], 1)
        d, ix = cKDTree(np.stack([x, y], 1)).query(cells)
        val = np.where(d <= 2.4 * hw, f[ix] + rise * (d / hw) ** 2, np.inf).reshape(y1 - y0, x1 - x0)
        En[y0:y1, x0:x1] = np.minimum(En[y0:y1, x0:x1], val)
        floor[y0:y1, x0:x1] |= (d <= max(1.2, 0.45 * hw)).reshape(y1 - y0, x1 - x0)
    return floor


def route(E, a, b, rng, keep=None, pad=18, wander=0.35):
    """The way a valley would take from a to b: least cost over the land, each step's cost its length x (1 + (height /
    1.5 km)^2) x a smooth noise (1 +- wander), so it keeps to low ground and saddles and winds a little. `keep` (bool
    grid) multiplies the cost 6x off it. Returns the course smoothed (Chaikin x3, a 5-point mean), every 0.5 px."""
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import dijkstra
    sh = E.shape
    x0, x1 = max(0, int(min(a[0], b[0])) - pad), min(sh[1], int(max(a[0], b[0])) + pad + 1)
    y0, y1 = max(0, int(min(a[1], b[1])) - pad), min(sh[0], int(max(a[1], b[1])) + pad + 1)
    H = E[y0:y1, x0:x1]
    h, w = H.shape
    nz = nd.gaussian_filter(rng.standard_normal((h, w)), 2.5); nz /= nz.std() + 1e-9
    c = (1 + (np.maximum(H, 0) / 1500.0) ** 2) * np.clip(1 + wander * nz, 0.4, None)
    if keep is not None:
        c = c * np.where(keep[y0:y1, x0:x1], 1.0, 6.0)
    idx = np.arange(h * w).reshape(h, w)
    rows, cols, vals = [], [], []
    for dy, dx in ((0, 1), (1, 0), (1, 1), (1, -1)):
        ys, ye = 0, h - dy
        xs, xe = max(0, -dx), w - max(0, dx)
        A = idx[ys:ye, xs:xe]; B = idx[ys + dy:ye + dy, xs + dx:xe + dx]
        L = math.hypot(dx, dy)
        cc = 0.5 * (c[ys:ye, xs:xe] + c[ys + dy:ye + dy, xs + dx:xe + dx]) * L
        rows += [A.ravel(), B.ravel()]; cols += [B.ravel(), A.ravel()]; vals += [cc.ravel(), cc.ravel()]
    G_ = coo_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(h * w, h * w)).tocsr()
    s = idx[int(round(a[1])) - y0, int(round(a[0])) - x0]; t = idx[int(round(b[1])) - y0, int(round(b[0])) - x0]
    _, pred = dijkstra(G_, indices=s, return_predecessors=True)
    path = [t]
    while path[-1] != s:
        path.append(pred[path[-1]])
    path = path[::-1]
    pts = [(float(a[0]), float(a[1]))] + [(p % w + x0, p // w + y0) for p in path[1:-1]] + [(float(b[0]), float(b[1]))]
    pts = np.array(G.chaikin(pts, 3), float)
    if len(pts) > 6:
        sm = np.stack([nd.uniform_filter1d(pts[:, k], 5, mode='nearest') for k in (0, 1)], 1)
        sm[0], sm[-1] = pts[0], pts[-1]
        pts = sm
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
    t_ = np.linspace(0, seg[-1], max(2, int(seg[-1] / 0.5)))
    return np.stack([np.interp(t_, seg, pts[:, 0]), np.interp(t_, seg, pts[:, 1])], 1)


def valley(E0, En, pts, f0, col, f1, hw, rng, rise=1800.0, floor_arr=None, breathe=0.3):
    """A U-valley along a routed course: its floor rises from f0 (None: the land there) to `col` at the course's own
    saddle (the highest land along it, kept to its middle three fifths; None: no col, straight from f0 to f1), then falls
    to f1, with a little unevenness; never above the land. The width breathes (hw x 0.7-1.3 along it) and the walls rise
    unevenly (rise x 0.75-1.25, a smooth field), so neither side is a ruled cut. Cuts En (only lower); returns the floor
    mask."""
    sh = E0.shape
    n = len(pts)
    yi = np.clip(np.round(pts[:, 1]).astype(int), 0, sh[0] - 1); xi = np.clip(np.round(pts[:, 0]).astype(int), 0, sh[1] - 1)
    land = nd.uniform_filter1d(E0[yi, xi], 7, mode='nearest')
    a = E0[yi[0], xi[0]] if f0 is None else f0
    b = E0[yi[-1], xi[-1]] if f1 is None else f1
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
    if col is None:
        fl = a + (b - a) * seg / seg[-1]
        ic = None
    else:
        lo, hi = int(0.2 * n), max(int(0.2 * n) + 1, int(0.8 * n))
        ic = lo + int(np.argmax(land[lo:hi]))
        sc = seg[ic]
        fl = np.where(seg <= sc, a + (col - a) * seg / max(sc, 1e-6),
                      col + (b - col) * (seg - sc) / max(seg[-1] - sc, 1e-6))
    bump = nd.gaussian_filter1d(rng.standard_normal(n), 6.0); bump /= np.abs(bump).max() + 1e-9
    fl = fl + 45.0 * bump * np.sin(np.pi * seg / seg[-1])          # uneven, but the ends and their heights held
    if floor_arr is not None:                                      # a floor given point by point (a lake basin's)
        fl = np.asarray(floor_arr, float)
        ic = None
    fl = np.minimum(fl, E0[yi, xi])
    hwv = hw * (1.0 + breathe * nd.gaussian_filter1d(rng.standard_normal(n), 8.0) / 0.14)
    hwv = np.clip(hwv, (1 - breathe) * hw, (1 + breathe) * hw)
    R = int(math.ceil(2.4 * hw * 1.3)) + 1
    x0, x1 = max(0, int(pts[:, 0].min()) - R), min(sh[1], int(pts[:, 0].max()) + R + 1)
    y0, y1 = max(0, int(pts[:, 1].min()) - R), min(sh[0], int(pts[:, 1].max()) + R + 1)
    YY, XX = np.mgrid[y0:y1, x0:x1]
    d, ix = cKDTree(pts).query(np.stack([XX.ravel(), YY.ravel()], 1))
    u = d / hwv[ix]
    wall = nd.gaussian_filter(rng.standard_normal((y1 - y0, x1 - x0)), 2.0).ravel()
    wall = 1.0 + 0.25 * np.clip(wall / (wall.std() + 1e-9), -1, 1)
    val = np.where(u <= 2.4, fl[ix] + rise * wall * u ** 2, np.inf).reshape(y1 - y0, x1 - x0)
    En[y0:y1, x0:x1] = np.minimum(En[y0:y1, x0:x1], val)
    floor = np.zeros(sh, bool)
    floor[y0:y1, x0:x1] = (u <= 0.45).reshape(y1 - y0, x1 - x0)
    return floor, (float(fl[ic]) if ic is not None else None), (pts[ic].tolist() if ic is not None else None)


def bowl(En, c, floor_m, r_flat, rise=2200.0, r_wall=5.0):
    """A bowl: flat to r_flat, then rising `rise` over r_wall more (only ever lower)."""
    sh = En.shape
    YY, XX = np.mgrid[0:sh[0], 0:sh[1]]
    r = np.hypot(XX - c[0], YY - c[1])
    u = np.clip((r - r_flat) / r_wall, 0, None)
    val = np.where(u <= 2.5, floor_m + rise * u ** 2, np.inf)
    np.minimum(En, val, out=En)
    return r <= r_flat


def rivers_downhill(D, E0, En, whas):
    """Every river course over moved ground runs downhill again: after its first moved point, the land along it is cut to
    the running low (points rounded as the page stores them)."""
    sh = En.shape
    moved = np.abs(En - E0) > 1
    fixed = []
    for rv in D['rivers']:
        p = rv.get('px') or []
        if len(p) < 2:
            continue
        P_ = np.round(np.array(p, float), 2)
        jj = np.clip(np.round(P_[:, 1]).astype(int), 0, sh[0] - 1); ii = np.clip(np.round(P_[:, 0]).astype(int), 0, sh[1] - 1)
        if not moved[jj, ii].any():
            continue
        for _ in range(4):
            cur, seen, n = np.inf, False, 0
            for j_, i_ in zip(jj, ii):
                seen |= moved[j_, i_]
                if whas[j_, i_]:
                    continue
                if seen and En[j_, i_] > cur:
                    En[j_, i_] = cur; n += 1
                cur = min(cur, En[j_, i_])
            if not n:
                break
        fixed.append(rv['id'])
    return fixed


def give_air(D, E0, En, whas0, sh):
    """Moved cells still at the airless -90 C take the temperatures of the nearby land of their new height (the 12
    nearest in place and height); the warm month's afternoon over its mean, the cold night under its mean."""
    T5 = {k: P.raster(D, k, 'L').astype(float) - 90 for k in C.TEMPS}
    moved0 = np.abs(En - E0) > 1
    airless = np.zeros(sh, bool)
    for k in C.TEMPS:
        airless |= T5[k] <= -89.5
    fix = moved0 & airless & ~whas0
    if fix.any():
        win = nd.binary_dilation(fix, iterations=80)
        pool = win & ~airless & ~whas0 & ~moved0
        py_, px_ = np.nonzero(pool); ty_, tx_ = np.nonzero(fix)
        ft = lambda X, Y, H: np.stack([X / 40.0, Y / 40.0, H / 350.0], 1)
        dk, ik = cKDTree(ft(px_, py_, E0[pool])).query(ft(tx_, ty_, En[fix]), k=12)
        wk = 1.0 / (dk + .25)
        for k in C.TEMPS:
            T5[k][fix] = (T5[k][pool][ik] * wk).sum(1) / wk.sum(1)
    mv = moved0 & ~whas0 & (T5['tm'] > -89.5)          # every moved land cell, the lapse's own rates aside
    T5['th'][mv] = np.maximum(T5['th'][mv], T5['tw'][mv] + 1)
    T5['tl'][mv] = np.minimum(T5['tl'][mv], T5['tc'][mv] - 1)
    for k in C.TEMPS:
        D[k] = P.b64(Image.fromarray(np.clip(np.round(T5[k] + 90), 0, 255).astype(np.uint8), 'L'), optimize=True)
    return int(fix.sum())


def unair(D, E0, En, whas, lim=7200.0):
    """Moved land now under `lim` that was class O (airless) is let go of it, so the reclimate classes it from its climate
    (it skips O cells). Call after give_air, before the reclimate."""
    codes = codes_of(D)
    cls = P.raster(D, 'c', 'L')
    m = (np.abs(En - E0) > 1) & (En < lim) & ~whas & (cls == codes.index('O'))
    cls[m] = codes.index('ET')
    D['c'] = P.b64(Image.fromarray(cls.astype(np.uint8), 'L'), optimize=True)
    return int(m.sum())


def finish(D, E0, En, W1, whas0, wlev0, whas, wlev, lake, floor_mask, seed, paint_floor=None, heat=None, force=None,
           rain_min=None, paint_extra=None):
    """The rasters after a carve: levels, lapse, air, rain/class/zone, paint, relight; returns the reclimate report.
    heat: a grid of degrees C added to every temperature (geothermal ground), the order kept; force: [(mask, code)]
    classes set after the reclimate; rain_min: (mask, mm); paint_extra: [(mask weights, rgb)] painted over the floors."""
    sh = En.shape
    codes = codes_of(D)
    raw0 = {k: P.raster(D, k, 'L') for k in ('p', 'c', 'z')}
    D['h'] = P.encode_heights(D, En, W1)
    D['wl'] = P.encode_levels(D, whas, wlev)
    lap = C.lapse(D, E0, En, whas0, wlev0, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    n_air = give_air(D, E0, En, whas0, sh)
    if heat is not None:
        T5 = {k: P.raster(D, k, 'L').astype(float) - 90 for k in C.TEMPS}
        hm = (heat > 0.05) & (T5['tm'] > -89.5)
        for k in C.TEMPS:
            T5[k][hm] += heat[hm] * (1.25 if k in ('tc', 'tl') else 1.0)     # the ground's heat shows most in the cold
        T5['th'][hm] = np.maximum(T5['th'][hm], T5['tw'][hm] + 1)
        T5['tl'][hm] = np.minimum(T5['tl'][hm], T5['tc'][hm] - 1)
        for k in C.TEMPS:
            D[k] = P.b64(Image.fromarray(np.clip(np.round(T5[k] + 90), 0, 255).astype(np.uint8), 'L'), optimize=True)
    n_un = unair(D, E0, En, whas)
    rain2, cls2, zon2, _, crep = C.reclimate(D, E0, En, whas, whas.copy())
    crep['airless_cells_given_air'] = n_air
    crep['class_O_let_go'] = n_un
    if rain_min is not None:
        rain2[rain_min[0]] = np.maximum(rain2[rain_min[0]], rain_min[1])
    for m_, code in (force or []):
        cls2[m_] = codes.index(code)
    if lake.any():
        cls2[lake] = codes.index('WH')
        hl = whas0 & (wlev0 > 3000)
        if hl.any():
            zon2[lake] = int(np.bincount(raw0['z'][hl]).argmax())
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
    rng = np.random.default_rng(seed)
    moved = np.abs(En - E0) > 1
    for key in ('st', 't'):
        arr = P.raster(D, key)
        arr = PA.retint(arr, E0, En, moved, ~moved, 150.0)
        a = arr.astype(float)
        if paint_floor is not None and floor_mask.any():
            # the floors that now hold air: the tundra's dun-green, a little texture
            tex = nd.gaussian_filter(rng.standard_normal(sh), 1.0)[..., None] * 7.0
            w = nd.gaussian_filter((floor_mask & ~whas).astype(float), 0.8)[..., None] * 0.75
            a = a * (1 - w) + np.clip(np.array(paint_floor, float) + tex, 0, 255) * w
        for wgt, rgb in (paint_extra or []):
            tex = nd.gaussian_filter(rng.standard_normal(sh), 0.8)[..., None] * 6.0
            w = np.clip(wgt, 0, 1)[..., None]
            a = a * (1 - w) + np.clip(np.array(rgb, float) + tex, 0, 255) * w
        if lake.any():
            hl = whas0 & (wlev0 > 3000)
            a[lake] = np.median(a[hl], 0) if hl.any() else np.array([120.0, 150.0, 170.0])
        D[key] = P.jpeg_like(D, key, np.clip(a, 0, 255).astype(np.uint8))
    relit, _, _ = PA.relight(D, E0, En)
    for k_, v in relit.items():
        D[k_] = v
    D['h'] = P.encode_heights(D, En, W1)
    return crep


def write_regions(recs, key, label):
    """The polygons as default regions on the page, with their reconcile key."""
    fr = os.path.join(SRC, '51-region-store.js')
    s = open(fr, encoding='utf-8', newline='').read()
    i = s.index('const defRegs = ') + len('const defRegs = ')
    j = s.index('\n', i)
    line = s[i:j].rstrip()
    assert line.endswith(';')
    regs = json.loads(line[:-1])
    for rec in recs:
        old = next((x for x in regs if x['id'] == rec['id']), None)
        if old:
            old.update(rec)
        else:
            regs.append(rec)
    s = s[:i] + json.dumps(regs, ensure_ascii=False) + ';' + s[j:]
    ids = ','.join('"%s"' % r['id'] for r in recs)
    block = ("      if(localStorage.getItem('krator.regMerged.%s')!=='1'){   /* %s: %s */\n"
             "        [%s].forEach(id=>{ const d=defMap.get(id); if(d) regions.set(id,d); });\n"
             "        localStorage.setItem('krator.regMerged.%s','1');\n        localSave();\n      }\n") % (key, key, label, ids, key)
    anchor = "    }catch(e){}"
    k_ = s.index(anchor, s.index("krator.regMerged.5.1e24"))
    s = s[:k_] + block + s[k_:]
    open(fr, 'w', encoding='utf-8', newline='\n').write(s)


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    if whas0[int(J[1]), int(J[0])]:
        sys.exit('edit_532 has run already (the Trigemini tarn is in place)')
    sh = E0.shape
    codes = codes_of(D)
    cls0 = P.raster(D, 'c', 'L')
    En, whas, wlev, W1 = E0.copy(), whas0.copy(), wlev0.copy(), W0.copy()
    rng = np.random.default_rng(53202)
    # ---- Trigemini: the three troughs, the basin, the tarn
    tpoly = G.poly([tuple(p) for p in REG['Trigemini Pass']['points']], 1.0, 1.0, sh)
    keep = nd.binary_dilation(tpoly, iterations=3)
    floor_t = np.zeros(sh, bool)
    arms = {}
    for nm, end, col, hw in TRIGEMINI:
        pts = route(E0, J, end, rng, keep=keep)
        f_, colm, colp = valley(E0, En, pts, 5700.0, col, None, hw, rng)
        floor_t |= f_
        arms[nm] = {'col_m': round(colm), 'col_px': [round(colp[0], 1), round(colp[1], 1)], 'km': round(float(len(pts)) * 0.5 * 2),
                    'end_m': round(float(E0[int(end[1]), int(end[0])]))}
    basin = bowl(En, J, TL - 30.0, 3.2, rise=900.0, r_wall=4.0)
    lab, _ = nd.label(basin & (En < TL))
    tarn = lab == lab[int(J[1]), int(J[0])]
    whas[tarn] = True; wlev[tarn] = TL; W1[tarn] = True
    En[tarn] = np.minimum(En[tarn], TL - 12.0)
    shore = nd.binary_dilation(tarn, iterations=2) & ~tarn
    En[shore] = np.maximum(En[shore], np.minimum(E0[shore], TL + 2.0))
    # ---- the vales
    vrep = []
    floor_v = np.zeros(sh, bool)
    for head, fm, hw in VALES:
        flank = nearest_flank(E0, cls0, codes, head, lim=fm - 250.0)
        pts = route(E0, flank, head, rng, pad=10)
        f_, _, _ = valley(E0, En, pts, None, None, fm, hw, rng, rise=2000.0)
        floor_v |= f_
        vrep.append({'head': list(head), 'flank': [round(flank[0]), round(flank[1])], 'flank_m': round(float(E0[int(flank[1]), int(flank[0])])), 'head_m': fm,
                     'crest_m_was': round(float(E0[int(head[1]), int(head[0])]))})
    for head, fm, hw in VALES:
        floor_v |= bowl(En, head, fm, 2.0, rise=2000.0, r_wall=hw)
    fixed = rivers_downhill(D, E0, En, whas)
    floor_mask = (floor_t | floor_v) & (np.abs(En - E0) > 1)
    rep = {'edit': '5.1 edit 32: the SW outer wall, its vales, the Trigemini Pass', 'date': '2026-11-25',
           'trigemini': {'tarn_cells': int(tarn.sum()), 'tarn_level_m': TL, 'arms': arms},
           'vales': vrep, 'rivers_kept_downhill': fixed,
           'land_moved_cells': int((np.abs(En - E0) > 1).sum()), 'lowered_m_max': round(float((E0 - En).max())),
           'raised_cells': int((En > E0 + 1).sum())}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    out = os.path.join(HERE, 'edit_532_sw_wall_trigemini.report.json')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    if dry:
        return
    rep['reclimate'] = finish(D, E0, En, W1, whas0, wlev0, whas, wlev, tarn, floor_mask, 53201, paint_floor=(92.0, 98.0, 72.0))
    cnow = P.raster(D, 'c', 'L')
    rep['floor_classes'] = {codes[k]: int(v) for k, v in zip(*np.unique(cnow[floor_mask & ~whas], return_counts=True))}
    P.save(D)
    T = REG['Trigemini Pass']; S = REG['SW outer wall']
    write_regions([
        {'id': S['id'], 'name': S['name'], 'color': S['color'], 'points': S['points'], 'kind': S['kind'],
         'notes': "The SW outer wall: the crater's rim from the Silent Vales' head to the Rift's north rim, 6-15 km and mostly airless. Three small vales are cut into its crest from the flanks, with air to 5.9-6.2 km. The Trigemini Pass crosses its north-west end (the owner, 2026-11-25; scale model 5.1 edit 32)."},
        {'id': T['id'], 'name': T['name'], 'color': T['color'], 'points': T['points'], 'kind': T['kind'],
         'notes': "Three U-troughs through the SW outer wall meeting at a high basin with a half-frozen tarn like the Yeti Kingdom's Cold Lake (5,680 m, WH). NE to Dalab's side over a 6,350 m col; S to the w rift highland over a 6,250 m col: one of Dalab's backup routes to the Rift. W to the copper glacier's head over a 6,450 m col, the hard way (the owner, 2026-11-25; scale model 5.1 edit 32)."},
    ], KEY, 'the SW outer wall and the Trigemini Pass from the live map (edit 32, 2026-11-25)')
    json.dump(rep, open(out, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(json.dumps({'floor_classes': rep['floor_classes'], 'air': rep['reclimate'].get('airless_cells_given_air')}))
    print('saved')


if __name__ == '__main__':
    main()
