#!/usr/bin/env python3
"""Scale model 5.1, edit 7 polish (2026-11-17): the Lake of the Vale made longer and thinner, and its basin's mountains.

    python tools/scale-model/edit_517_vale_ring.py          # after edit_517_pher_rim.py; edits the model; once
    python tools/scale-model/edit_517_vale_ring.py --dry    # print the report, write nothing

The owner, 2026-11-17 (settlements/pher/PLAN.md, the fifth and sixth rounds): "look at the lake atitlan model in the
world menagerie. I'd like to give something like that kind of effect with the Lake of the Vale, but with the rise to the
mountains not quite as steep. they should be visible though, and come up the lake in places"; "Whole lake"; then "can we
enhance the mountain profile by making the lake longer and thinner? and we're going to want the rougher terrain around
the lake now to continue and continue to slope upward to the edge of the vale... it will have some clearly defined
valleys that slope to the lake, but will also have mountains that come closer to the lake". Asked: the south shore comes
in (Erehwon moves with it), the lake reaches west, the island stays (narrower), the edge is the lake basin's rim.

1. **Thinner** (a warp, column by column): the north shore stays where it is (Phēr, Māuṭh, Ōlḍ-Thalaba, Ḍāiyar, the
   cove and the headland untouched); the lake between it and the south shore is pressed north to K (0.62) of its width,
   the island and the bed with it; the south shore's rim (its bench, Erehwon's, the volcanoes' foot) moves north by the
   same amount, whole, for R1 cells; then the ground eases back to where it was over R2 cells, before the drop to the
   lower Vale. Every raster on the model's grid (heights, water, temperatures, rain, class, zone, wind, the paints) is
   moved with it, and every record in it (rivers, the outlet, the landforms, the basin, Erehwon's pin) moved the same way.
2. **Longer**: an arm of water from the lake's west end (px 816) west to px 792, under the western scarp, tapering to its
   tip, its bed a bowl; the north-west rivers (r492, r613, r753) end on its north shore.
3. **The basin's rise**: inside the lake basin's rim (RIM, its outline: the north scarp's foot, the western scarp, the
   south rim's crest before the drop to the lower Vale, the east ridge), the ground rises from the shore to the rim's own
   height there (each cell's share of the way from the shore to the rim, a little convex), roughened by a ridged field
   that grows with the height, so the slopes are ribbed all the way up.
4. **The mountains near the water**: a range CREST_PX (3.8 cells) back from the water, massifs on it one every MASSIF_KM
   of the ring 3-6.5 cells out, and spurs from most of them down to the shore, ending 150-260 m over the water.
5. **The valleys**: every river reaching the lake keeps its valley (no lift within RIVER_PX of its course), and VALLEYS
   more cut from the rim to the shore between the massifs (no lift within VALLEY_PX), so the rise and the mountains part
   along valleys that fall to the lake on the old ground.
Every settlement and site keeps its ground (Phēr's from 1 to 2 cells: its page climbs to meet the range); the water,
the island and the lake's level are kept; the temperatures are lapsed and the paint relit. Seeded (SEED), so a re-run
is the same. Sets DATA.landforms.vale_ring so it runs once; writes edit_517_vale_ring.report.json.
Re-cut after it: openworld/xanadu-north-shore and openworld/xanadu-oidong-highrift; Erewhon's page refits its new bench.
"""
import os, sys, json, math, hashlib, re
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C   # noqa: E402

SEED = 51717
LAKE_AT = (843, 1493)           # a cell of the lake (Phēr's cove)
LAKE_LEVEL = -520.0
# 1. thinner
K = 0.62                        # the lake's new width over its old, column by column
R1, R2 = 10.0, 20.0             # the south rim moved whole for R1 cells, then eased back over R2 (R2 > 1.5 x the shift)
WARP_BOX = (786, 1470, 912, 1580)
# 2. longer: the arm's centre line from (x0, y0) at the lake to its tip, its half-width at the lake
ARM = {'x_lake': 816.0, 'x_tip': 792.0, 'y_tip': 1491.0, 'hw': 3.4, 'depth': (35.0, 420.0)}
# 3. the rise: the basin's rim (px, before the warp; warped with everything else)
RIM = [(780, 1474), (810, 1471), (840, 1473), (866, 1475), (888, 1478), (897, 1486), (897, 1500), (889, 1510),
       (893, 1526), (870, 1531), (840, 1531), (810, 1529), (790, 1527), (780, 1515), (777, 1495)]
RISE_GAMMA = 0.85               # the share of the way to the rim, raised to this: a little convex
ROUGH_M = (60.0, 260.0)         # the ribs' depth: at the shore, at the rim
# 4. the mountains near the water
MASSIF_KM = 20.0
DIST_PX = (3.0, 6.5)
HEIGHT_M = (700.0, 1150.0)
RADIUS_PX = (3.2, 5.0)
SPUR_SHARE = 0.65
TIP_M = (150.0, 260.0)
SPUR_W_PX = 1.0
CREST_PX = (3.8, 2.2)
CREST_M = (420.0, 760.0)
# 5. the valleys
VALLEYS = 12
VALLEY_PX = (0.7, 2.2)
RIVER_PX = (0.8, 2.5)
PROTECT_PX = (1.5, 3.5)
PROTECT = {'Phēr': (1.0, 2.0)}
BOX = (770, 1440, 915, 1560)
# the settlements and sites in the basin (scale model pins and openworld/SITES.json's north-shore sites); Erehwon's is
# taken at its warped place
KEEP = [('Erehwon', 841, 1517), ('Ōlḍ-Thalaba', 860, 1496), ('Phēr', 843, 1491), ('Māuṭh', 852, 1494),
        ('Ḍāiyar', 870, 1500), ('the Qol ford', 822.7, 1480), ('the Qol head', 826.7, 1464), ('Thalaba', 840, 1463)]
L_KEYS = ('p', 'c', 'z', 'tm', 'th', 'tl', 'tw', 'tc')     # one channel
CAT_KEYS = ('c', 'z')                                      # categories: nearest, never blended
RGB_KEYS = ('t', 'rt', 'st', 'ct', 'wd')                   # three channels


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


# ---------------------------------------------------------------- 1. the warp
class Warp:
    """new -> old rows, column by column: Y(x, y) = y + D(x) ramp(x, y)"""

    def __init__(self, lake):
        fill = nd.binary_fill_holes(lake)
        x0, x1 = WARP_BOX[0], WARP_BOX[2]
        self.x0 = x0
        cols = np.arange(x0, x1 + 1)
        yN = np.full(len(cols), np.nan)
        Wd = np.zeros(len(cols))
        for i, x in enumerate(cols):
            c = np.nonzero(fill[:, x])[0]
            if len(c):
                yN[i], Wd[i] = c.min(), c.max() - c.min()
        ok = ~np.isnan(yN)
        yN = np.interp(cols, cols[ok], yN[ok])                 # past the ends: the end's north shore
        D = nd.gaussian_filter1d((1 - K) * Wd, 1.5)
        self.yN, self.W, self.D = yN, Wd, D
        self.L = np.maximum(Wd - D, 2.0)

    def record(self):
        """the warp's columns for the report, so a check can map the old geometry after the edit (Warp.from_report)"""
        r = lambda a: [round(float(v), 4) for v in a]
        return {'x0': int(self.x0), 'yN': r(self.yN), 'L': r(self.L), 'D': r(self.D)}

    @classmethod
    def from_report(cls, rep=None):
        """the warp the edit ran, from edit_517_vale_ring.report.json (the lake it was built on is gone after the edit)"""
        if rep is None:
            rep = json.load(open(os.path.join(HERE, 'edit_517_vale_ring.report.json'), encoding='utf-8'))
        w = rep['warp']
        o = cls.__new__(cls)
        o.x0, o.yN, o.L, o.D = w['x0'], np.array(w['yN']), np.array(w['L']), np.array(w['D'])
        return o

    def col(self, x):
        i = int(round(x)) - self.x0
        if i < 0 or i >= len(self.D):
            return None
        return self.yN[i], self.L[i], self.D[i]

    def Y(self, x, y):
        c = self.col(x)
        if c is None:
            return y
        yN, L, D = c
        s = y - yN
        if s <= 0:
            r = 0.0
        elif s <= L:
            r = s / L
        elif s <= L + R1:
            r = 1.0
        elif s <= L + R1 + R2:
            t = (s - L - R1) / R2
            r = 1.0 - t * t * (3 - 2 * t)
        else:
            r = 0.0
        return y + D * r

    def forward(self, x, yo):
        """the new row of an old point (bisection: Y is monotone in y)"""
        c = self.col(x)
        if c is None:
            return yo
        lo, hi = yo - c[2] - 2.0, yo + 2.0
        for _ in range(60):
            m = (lo + hi) / 2
            if self.Y(x, m) < yo:
                lo = m
            else:
                hi = m
        return (lo + hi) / 2

    def rows(self, shape):
        """the old row of every cell in the box (others: their own)"""
        x0, y0, x1, y1 = WARP_BOX
        out = np.zeros((y1 - y0, x1 - x0))
        for i, x in enumerate(range(x0, x1)):
            for j, y in enumerate(range(y0, y1)):
                out[j, i] = self.Y(x, y)
        return out


def warp_field(a, Yb, cat):
    """a raster (2-D or 3-D) warped in the box: each new cell sampled at its old row (linear, or nearest for categories)"""
    x0, y0, x1, y1 = WARP_BOX
    out = a.copy()
    jj = Yb - y0
    ii = np.tile(np.arange(x1 - x0), (y1 - y0, 1)).astype(float)
    src = a[y0:y1 + 30, x0:x1].astype(float)
    if a.ndim == 2:
        out[y0:y1, x0:x1] = nd.map_coordinates(src, [jj, ii], order=0 if cat else 1, mode='nearest').astype(a.dtype)
    else:
        for ch in range(a.shape[2]):
            out[y0:y1, x0:x1, ch] = np.clip(nd.map_coordinates(src[..., ch], [jj, ii], order=1, mode='nearest'), 0, 255).astype(a.dtype)
    return out


# ---------------------------------------------------------------- 3-5. the basin's terrain
def plan(E, lake, rivers, rim_poly, keep_pts):
    x0, y0, x1, y1 = BOX
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(float)
    mb = lake[y0:y1, x0:x1]
    Eb = E[y0:y1, x0:x1]
    ys, xs = np.nonzero(lake)
    cx, cy = (xs.min() + xs.max()) / 2.0, (ys.min() + ys.max()) / 2.0
    ax, ay = (xs.max() - xs.min()) / 2.0 + 0.5, (ys.max() - ys.min()) / 2.0 + 0.5
    # the basin: inside the rim's outline
    from PIL import ImageDraw
    im = Image.new('L', (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(im).polygon([(p[0] - x0, p[1] - y0) for p in rim_poly], fill=1)
    inside = np.array(im, bool)
    dl = nd.distance_transform_edt(~mb)
    dr, (ri, rj) = nd.distance_transform_edt(inside, return_indices=True)
    Hr = nd.gaussian_filter(np.clip(Eb, 200.0, 1700.0), 1.2)[ri, rj]          # the rim's height at its nearest cell
    t = np.clip(dl / np.maximum(dl + dr, 1e-6), 0, 1) ** RISE_GAMMA
    base = LAKE_LEVEL + 40.0 + (Hr - LAKE_LEVEL - 40.0) * t
    rib = ridged(xx, yy, 4.0, SEED + 3) - 0.5 + 0.5 * (ridged(xx, yy, 1.6, SEED + 4) - 0.5)
    rise = np.where(inside & ~mb, np.maximum(0.0, base + lerp(ROUGH_M[0], ROUGH_M[1], t) * rib - Eb), 0.0)
    # the mountains near the water: the range, the massifs and their spurs
    per = math.pi * (3 * (ax + ay) - math.sqrt((3 * ax + ay) * (ax + 3 * ay)))
    n = max(6, int(round(per * 2.0 / MASSIF_KM)))
    massifs = []
    for k in range(n):
        th = 2 * math.pi * (k + 0.35 * (draw(k, 'th') - 0.5)) / n
        dx, dy = math.cos(th) * ax, math.sin(th) * ay
        Lr = math.hypot(dx, dy)
        ux, uy = dx / Lr, dy / Lr
        tt, last = 120.0, None
        while tt > 0:
            px, py = cx + ux * tt, cy + uy * tt
            if 0 <= int(round(py)) < lake.shape[0] and 0 <= int(round(px)) < lake.shape[1] and lake[int(round(py)), int(round(px))]:
                last = (px, py)
                break
            tt -= 0.25
        if last is None:
            continue
        dist = lerp(*DIST_PX, draw(k, 'dist'))
        massifs.append({'k': k, 'theta_deg': round(math.degrees(th), 1), 'shore_px': [round(last[0], 2), round(last[1], 2)],
                        'px': [round(last[0] + ux * dist, 2), round(last[1] + uy * dist, 2)], 'height_m': round(lerp(*HEIGHT_M, draw(k, 'h'))),
                        'radius_px': round(lerp(*RADIUS_PX, draw(k, 'r')), 2), 'spur': draw(k, 'spur') < SPUR_SHARE,
                        'tip_m': round(lerp(*TIP_M, draw(k, 'tip'))), 'dir': [ux, uy]})
    rough = 0.62 + 0.24 * ridged(xx, yy, 5.0, SEED) + 0.14 * ridged(xx, yy, 2.2, SEED + 1)
    thg = np.arctan2((yy - cy) / ay, (xx - cx) / ax)
    wav = sum(np.sin(f * thg + 2 * math.pi * draw(f, 'ph')) / f for f in (2, 3, 5))
    hr = lerp(CREST_M[0], CREST_M[1], np.clip(0.5 + 0.38 * wav, 0, 1))
    ring = hr * np.exp(-((dl - CREST_PX[0]) / CREST_PX[1]) ** 2) * rough
    ring = np.where(dl < CREST_PX[0], ring * smooth(0.8, 3.0, dl), ring)
    for M in massifs:
        r = np.hypot(xx - M['px'][0], yy - M['px'][1])
        ring = np.maximum(ring, M['height_m'] * np.exp(-(r / M['radius_px']) ** 2) * rough)
        if M['spur']:
            a = (M['px'][0] - M['dir'][0] * 0.5 * M['radius_px'], M['px'][1] - M['dir'][1] * 0.5 * M['radius_px'])
            b = (M['shore_px'][0] + M['dir'][0] * 0.4, M['shore_px'][1] + M['dir'][1] * 0.4)
            ds, tt = seg_dist(xx, yy, a, b)
            crest = lerp(M['height_m'] * np.exp(-0.25) * 0.9, 0.0, tt)
            crest = np.maximum(crest, np.maximum(0.0, LAKE_LEVEL + M['tip_m'] - Eb) * smooth(0.55, 1.0, tt))
            ring = np.maximum(ring, crest * np.exp(-(ds / SPUR_W_PX) ** 2) * (0.85 + 0.15 * rough))
    # the valleys: from the rim to the shore, between the massifs (at the half-steps of their angles)
    valleys = []
    vd = np.full_like(xx, 1e9)
    for v in range(VALLEYS):
        th = 2 * math.pi * (v + 0.5 + 0.3 * (draw(v, 'vth') - 0.5)) / VALLEYS
        ux, uy = math.cos(th) * ax, math.sin(th) * ay
        Lr = math.hypot(ux, uy)
        ux, uy = ux / Lr, uy / Lr
        tt, shore = 120.0, None
        while tt > 0:
            px, py = cx + ux * tt, cy + uy * tt
            if 0 <= int(round(py)) < lake.shape[0] and 0 <= int(round(px)) < lake.shape[1] and lake[int(round(py)), int(round(px))]:
                shore = (px, py)
                break
            tt -= 0.25
        if shore is None:
            continue
        # outward from the shore, wandering a little, to the rim
        pts, p = [shore], shore
        wob = draw(v, 'wob') * 6.28
        for s in range(1, 40):
            q = (shore[0] + ux * s + 0.9 * math.sin(s * 0.45 + wob) * -uy, shore[1] + uy * s + 0.9 * math.sin(s * 0.45 + wob) * ux)
            pts.append(q)
            ii_, jj_ = int(round(q[0])) - x0, int(round(q[1])) - y0
            if not (0 <= ii_ < xx.shape[1] and 0 <= jj_ < xx.shape[0]) or not inside[jj_, ii_]:
                break
        for i in range(len(pts) - 1):
            vd = np.minimum(vd, seg_dist(xx, yy, pts[i], pts[i + 1])[0])
        valleys.append({'theta_deg': round(math.degrees(th), 1), 'px': [[round(a_, 2), round(b_, 2)] for a_, b_ in pts]})
    # what stays open: the towns' ground, the rivers' valleys, the cut valleys; the water and the island
    keep = np.ones_like(xx)
    for nm, kx, ky in keep_pts:
        pr = PROTECT.get(nm, PROTECT_PX)
        keep *= smooth(pr[0], pr[1], np.hypot(xx - kx, yy - ky))
    rd = np.full_like(xx, 1e9)
    for R in rivers:
        pts = R.get('px') or R.get('drawn_px') or []
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            if max(a[0], b[0]) < x0 - 5 or min(a[0], b[0]) > x1 + 5 or max(a[1], b[1]) < y0 - 5 or min(a[1], b[1]) > y1 + 5:
                continue
            rd = np.minimum(rd, seg_dist(xx, yy, tuple(a), tuple(b))[0])
    keep *= smooth(RIVER_PX[0], RIVER_PX[1], rd) * smooth(VALLEY_PX[0], VALLEY_PX[1], vd)
    fill = nd.binary_fill_holes(mb)
    lift = np.where(fill, 0.0, np.maximum(rise, ring) * keep)
    return {'massifs': massifs, 'valleys': valleys, 'basin_cells': int(inside.sum())}, lift


# ---------------------------------------------------------------- the records
def warp_pt(Wp, p):
    return [p[0], round(Wp.forward(p[0], p[1]), 3)]


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    if D['landforms'].get('vale_ring'):
        sys.exit('edit_517_vale_ring has already run (DATA.landforms.vale_ring is set)')
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    lake0 = lake_mask(whas0, wlev0)
    Wp = Warp(lake0)
    Yb = Wp.rows(None)
    rep = {'edit': '5.1 edit 7 polish: the Lake of the Vale longer and thinner, and its basin\'s mountains', 'date': '2026-11-17',
           'seed': SEED, 'K': K, 'shift_px_max': round(float(Wp.D.max()), 2), 'warp': Wp.record()}
    # 1. warp every raster on the grid
    E = warp_field(E0, Yb, False)
    W1 = warp_field(W0.astype(np.uint8), Yb, True).astype(bool)
    whas = warp_field(whas0.astype(np.uint8), Yb, True).astype(bool)
    wlev = np.where(whas, warp_field(np.nan_to_num(wlev0, nan=LAKE_LEVEL), Yb, True), np.nan)
    rasters = {}
    for k in L_KEYS:
        rasters[k] = warp_field(P.raster(D, k, 'L'), Yb, k in CAT_KEYS)
    for k in RGB_KEYS:
        rasters[k] = warp_field(P.raster(D, k), Yb, False)
    # 2. the west arm
    lake = lake_mask(whas, wlev)
    A = ARM
    col = np.nonzero(lake[:, int(A['x_lake'])])[0]
    y_lake = (col.min() + col.max()) / 2.0 if len(col) else 1494.0
    arm = np.zeros_like(lake)
    for x in range(int(A['x_tip']) - 1, int(A['x_lake']) + 1):
        f = (x - A['x_tip']) / (A['x_lake'] - A['x_tip'])
        if f < 0:
            continue
        yc = lerp(A['y_tip'], y_lake, f)
        hw = A['hw'] * math.sqrt(max(0.0, 1 - (1 - f) ** 1.6))
        for y in range(int(yc - hw) - 1, int(yc + hw) + 2):
            if abs(y - yc) <= hw:
                arm[y, x] = True
    new_w = arm & ~whas
    dsh = nd.distance_transform_edt(arm | lake)
    E = np.where(new_w, LAKE_LEVEL - (A['depth'][0] + A['depth'][1] * smooth(0.0, 3.5, dsh)), E)
    ring1 = nd.binary_dilation(arm | lake, iterations=2) & ~(arm | lake) & ~whas
    E = np.where(ring1, np.maximum(E, LAKE_LEVEL + 25.0), E)
    whas = whas | arm
    wlev = np.where(arm, float(np.nanmedian(wlev[lake])), wlev)
    W1 = W1 | arm
    lake = lake_mask(whas, wlev)
    zone_lake = int(np.bincount(rasters['z'][lake & ~arm]).argmax())
    cls_lake = int(np.bincount(rasters['c'][lake & ~arm]).argmax())
    rasters['z'][new_w] = zone_lake
    rasters['c'][new_w] = cls_lake
    for k in ('st', 't', 'ct'):
        rasters[k][new_w] = np.median(rasters[k][lake & ~arm & (nd.distance_transform_edt(lake) > 2)], 0).astype(np.uint8)
    rep['arm'] = {'cells': int(new_w.sum()), 'from_px': A['x_lake'], 'to_px': A['x_tip']}
    ys, xs = np.nonzero(lake)
    rep['lake'] = {'x': [int(xs.min()), int(xs.max())], 'y': [int(ys.min()), int(ys.max())], 'cells': int(lake.sum()), 'km2': int(lake.sum()) * 4,
                   'was': {'x': [811, 881], 'cells': int(lake0.sum())}}
    # the records moved with the warp
    erehwon = warp_pt(Wp, [841, 1517])
    keep_pts = [(nm, kx, ky) if nm != 'Erehwon' else (nm, erehwon[0], erehwon[1]) for nm, kx, ky in KEEP]
    rim = [tuple(warp_pt(Wp, list(p))) for p in RIM]
    for L_ in D['landforms']['landforms']:
        if WARP_BOX[0] <= L_['px'] <= WARP_BOX[2] and WARP_BOX[1] <= L_['py'] <= WARP_BOX[3]:
            L_['py'] = round(Wp.forward(L_['px'], L_['py']), 3)
    arm_rivers = []
    for R in D['rivers']:
        pts = R.get('px') or []
        if not pts or not any(WARP_BOX[0] <= p[0] <= WARP_BOX[2] and WARP_BOX[1] <= p[1] <= WARP_BOX[3] for p in pts):
            continue
        R['px'] = [warp_pt(Wp, p) if WARP_BOX[0] <= p[0] <= WARP_BOX[2] and WARP_BOX[1] <= p[1] <= WARP_BOX[3] else p for p in pts]
        to = R.get('to') or {}
        if to.get('lake_m') is not None and abs(to['lake_m'] - LAKE_LEVEL) < 1 and to.get('at_px'):
            # ends on the new shore: cut at its first point in the water (the arm's rivers), else carried to it
            cut = next((i for i, p in enumerate(R['px']) if lake[int(round(p[1])), int(round(p[0]))]), None)
            if cut is not None and cut < len(R['px']) - 1:
                n0 = len(R['px'])
                R['px'] = R['px'][:cut + 1]
                if isinstance(R.get('bed_m'), list) and len(R['bed_m']) == n0:
                    R['bed_m'] = R['bed_m'][:cut + 1]
                    R['bed_m'][-1] = LAKE_LEVEL
                arm_rivers.append(R['id'])
            to['at_px'] = list(R['px'][-1])
    for O in D['outlets']:
        if "Erewhon" in O.get('name', ''):
            O['px'] = [[p[0], round(Wp.forward(p[0], p[1]), 3)] for p in O['px']]
    for B in D['basins']:
        if "Erewhon" in B.get('name', ''):
            B['at_px'] = warp_pt(Wp, B['at_px'])
            B['km2'] = int(lake.sum()) * 4
    rep['erehwon_px'] = erehwon
    rep['rivers_to_the_arm'] = arm_rivers
    # 3-5. the basin's terrain
    info, lift = plan(E, lake, D['rivers'], rim, keep_pts)
    x0, y0, x1, y1 = BOX
    En = E.copy()
    En[y0:y1, x0:x1] = E[y0:y1, x0:x1] + lift
    rep['massifs'] = [{k: v for k, v in M.items() if k != 'dir'} for M in info['massifs']]
    rep['valleys'] = info['valleys']
    rep['basin_cells'] = info['basin_cells']
    rep['cells'] = int((lift > 1).sum())
    rep['max_lift_m'] = round(float(lift.max()))
    dl = nd.distance_transform_edt(~lake)
    rings = []
    for k in (1, 2, 4, 6, 8, 10, 14):
        r = (dl > k - .5) & (dl <= k + .5) & ~whas
        rings.append({'px': k, 'km': 2 * k, 'before_m': round(float(E0[r].mean())), 'after_m': round(float(En[r].mean())), 'max_after_m': round(float(En[r].max()))})
    rep['rings'] = rings
    rep['kept'] = [{'name': nm, 'px': [round(kx, 2), round(ky, 2)], 'before_m': round(float(E[int(round(ky)), int(round(kx))]), 1),
                    'after_m': round(float(En[int(round(ky)), int(round(kx))]), 1), 'dry': not bool(whas[int(round(ky)), int(round(kx))])} for nm, kx, ky in keep_pts]
    # the lake holds: no dry cell next to it under its level but at the outlet
    edge = nd.binary_dilation(lake) & ~whas
    low = edge & (En < LAKE_LEVEL)
    rep['spill_cells'] = [[int(i_), int(j_)] for j_, i_ in zip(*np.nonzero(low))][:12]
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    assert all(abs(k['after_m'] - k['before_m']) < 15 and k['dry'] for k in rep['kept']), 'a settlement\'s ground moved or went under'
    if dry:
        return rep
    # write: heights and water, the other rasters, the temperatures lapsed and the paint relit over the warped ground
    D['h'] = P.encode_heights(D, E, W1)
    D['wl'] = P.encode_levels(D, whas, wlev)
    for k in L_KEYS:
        D[k] = P.b64(Image.fromarray(rasters[k].astype(np.uint8), 'L'), optimize=True)
    for k in RGB_KEYS:
        D[k] = P.jpeg_like(D, k, rasters[k]) if k in ('t', 'rt', 'st', 'ct') else P.b64(Image.fromarray(rasters[k].astype(np.uint8), 'RGB'), optimize=True)
    lap = C.lapse(D, E, En, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    relit, _, _ = PA.relight(D, E, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En, W1)
    D['landforms']['vale_ring'] = {'edit': 'edit_517_vale_ring.py', 'seed': SEED, 'K': K, 'massifs': len(info['massifs']),
                                   'valleys': len(info['valleys']), 'erehwon_px': erehwon,
                                   'note': 'The Lake of the Vale longer and thinner, and its basin\'s mountains (the owner, 2026-11-17).'}
    P.save(D)
    with open(os.path.join(HERE, 'edit_517_vale_ring.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
        f.write('\n')
    # Erehwon's pin: the page's defaults and a move entry (the page's settlements apply SETT_MOVED once per version)
    src = os.path.join(HERE, 'model', 'src', '60-settlements.js')
    s = open(src, encoding='utf-8').read()
    px, py = erehwon[0], round(erehwon[1], 2)
    m = re.search(r'(const defSetts = \[.*?\{"id": "s57bkv9741", "name": "Erehwon", "type": "city", "px": )841(, "py": )1517', s)
    if m:
        s = s[:m.start()] + m.group(1) + str(px) + m.group(2) + str(py) + s[m.end():]
    if "'5.1e14'" not in s:
        note = ('Moved 2026-11-17 with edit_517_vale_ring.py (the owner: "making the lake longer and thinner": the south '
                'shore came in, Erehwon with it) from 841,1517 to its bench on the new shore.')
        entry = "    '5.1e14':[{\"id\": \"s57bkv9741\", \"name\": \"Erehwon\", \"type\": \"city\", \"px\": %s, \"py\": %s, \"notes\": \"%s\"}],\n" % (px, py, note)
        k_ = s.index("  const SETT_MOVED={\n")
        e_ = s.index("\n  };\n", k_)   # last, so it is applied after 5.1e12 (which also moves Erehwon)
        s = s[:e_] + ",\n" + entry.rstrip("\n").rstrip(",") + s[e_:]
    with open(src, 'w', encoding='utf-8', newline='\n') as f:
        f.write(s)
    return rep


if __name__ == '__main__':
    main()
