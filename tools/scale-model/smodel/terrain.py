"""Terrain operators on the height grid (metres): lowering perched lakes, ridged noise, mountains, humps, cuts and
levels in a polygon, and the stream-power weathering of an uplift.

Lifted unchanged from history/edit_heights.py (4.15-4.19) and history/edit_423.py (weather). Each takes the polygon's
points in map px and the grid scale (smodel.page.grid), and returns new heights; none touches the paint or the climate:
run smodel.climate and smodel.paint after them.
"""
import math

import numpy as np
from scipy import ndimage as nd

from .geom import poly, sstep


SPILL_SLACK = 600.0


WEATHER = dict(iters=60, K=1.8, max_cut=1200.0, thermal=0.3, thermal_iters=12, guard_km=6.0)


def lakes(E, whas, wlev, outlets=()):
    """lower each body standing more than SPILL_SLACK over its shore's lower quartile, unless the model records its
    outlet (DATA.outlets: a lake that spills over falls stands high by design); returns (wlev, report)"""
    falls = [o['lake_level_m'] for o in outlets]
    ring = nd.binary_dilation(whas, structure=np.ones((3, 3))) & ~whas
    ring[0, :] = ring[-1, :] = ring[:, 0] = ring[:, -1] = False
    out, rep = wlev.copy(), []
    for lv in np.unique(np.round(wlev[whas])):
        lab, n = nd.label(whas & (np.round(wlev) == lv), structure=np.ones((3, 3)))
        for k in range(1, n + 1):
            body = lab == k
            shore = nd.binary_dilation(body, structure=np.ones((3, 3))) & ring
            if not shore.any():
                continue
            spill = float(np.percentile(E[shore], 25))
            if lv > spill + SPILL_SLACK and not any(abs(lv - f) < 5 for f in falls):
                out[body] = spill
                j, i = np.argwhere(body).mean(0)
                rep.append({'cells': int(body.sum()), 'level': float(lv), 'to': round(spill, 1), 'at_cell': [round(i), round(j)]})
    return out, rep


def ridged(shape, seed, scales=(2.2, 4.5, 9.0)):
    """ridged fractal noise on the height grid, 0..1: smoothed random fields at a few scales (cells), each folded
    (1-|n|) so its crests are sharp, weighted by scale. Seeded: the same seed gives the same mountains."""
    rng = np.random.default_rng(seed)
    acc, tot = np.zeros(shape), 0.0
    for k, sc in enumerate(scales):
        f = nd.gaussian_filter(rng.standard_normal(shape), sc, mode='wrap')
        f /= (np.abs(f).max() + 1e-9)
        r = 1 - np.abs(f)
        w = .55 ** k
        acc += w * r ** 2
        tot += w
    return acc / tot


def mountains(E, su, sv, pts, h, floor, seed):
    """fill a drawn region with mountains: ridged noise under an envelope that rises from the region's edge to its
    middle (feathered two cells outside it), joined to the land by the higher of the two; returns (new E, mask)"""
    inside = poly(pts, su, sv, E.shape)
    d_in = nd.distance_transform_edt(inside)
    d_out = nd.distance_transform_edt(~inside)
    env = np.where(inside, sstep(0, max(2.0, d_in.max() * .55), d_in), sstep(2.5, 0, d_out) * .25)
    rn = ridged(E.shape, seed, scales=(1.6, 3.2, 6.5))
    lifted = floor + env * h * (.4 + .8 * rn)
    En = np.where(env > 0, np.maximum(E, lifted), E)
    return En, np.abs(En - E) > 1


def hump(E, su, sv, pts, h):
    """a rise across the abyss's floor: highest along the region's east-west middle line, falling to the floor at its
    northern and southern edges (cos-squared), feathered a cell outside; returns (new E, mask)"""
    inside = poly(pts, su, sv, E.shape)
    ys, xs = np.nonzero(inside)
    En = E.copy()
    feather = nd.distance_transform_edt(~inside)
    floor = float(np.percentile(E[inside], 10))   # the abyss's floor here: the rise stands on it, not on the rim
    for i in np.unique(xs):
        col = ys[xs == i]
        y0, y1 = col.min() - 1.5, col.max() + 1.5
        mid, half = (y0 + y1) / 2, (y1 - y0) / 2
        jj = np.arange(max(0, int(y0) - 2), min(E.shape[0], int(y1) + 3))
        prof = np.cos(np.clip(np.abs(jj - mid) / half, 0, 1) * np.pi / 2) ** 2
        k = sstep(2.0, 0, feather[jj, i])
        En[jj, i] = E[jj, i] + k * (np.maximum(E[jj, i], floor + h * prof) - E[jj, i])
    return En, np.abs(En - E) > 1


def cut(E, su, sv, pts, floor, lake, feather, seed):
    """cut a region down to the abyss's floor (a little relief from noise), its rim feathered over `feather` cells;
    the middle `lake` share of it (by distance from its edge) is a salt lake. Returns (new E, lake mask, region mask)"""
    inside = poly(pts, su, sv, E.shape)
    d_in = nd.distance_transform_edt(inside)
    d_out = nd.distance_transform_edt(~inside)
    k = np.where(inside, 1.0, sstep(feather, 0, d_out))
    rn = ridged(E.shape, seed, scales=(1.5, 3.0))
    target = floor + 70 * (rn - .5)
    En = E + k * (target - E)
    lk = inside & (d_in >= (1 - lake) * d_in.max())
    En[lk] = floor - 35 - 25 * sstep(0, d_in.max(), d_in[lk])   # the lake's bed, deepest in the middle
    return En, lk, inside


def level(E, su, sv, pts, h, relief, feather):
    """bring a region to an average height h: its own relief (smoothed) kept at `relief` of its size round that mean,
    the edge blended over `feather` cells outside it, then the blend band smoothed; returns (new E, mask)"""
    inside = poly(pts, su, sv, E.shape)
    d_out = nd.distance_transform_edt(~inside)
    k = np.where(inside, 1.0, sstep(feather, 0, d_out))
    Es = nd.gaussian_filter(E, 1.2)
    target = h + relief * (Es - Es[inside].mean())
    En = E + k * (target - E)
    band = (k > 0) & (k < 1) | nd.binary_dilation(inside, iterations=1) & ~nd.binary_erosion(inside, iterations=1)
    sm = nd.gaussian_filter(En, 1.0)
    En = np.where(band, sm, En)
    return En, k > 0


def weather(E, mask):
    """stream-power incision then a thermal & valley-broadening pass; only cells in `mask` move, by at most WEATHER['max_cut'] in all"""
    W = WEATHER
    h = E.copy()
    ny, nx = h.shape
    cell = 4.0
    offs = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    dist = [cell * math.hypot(a, b) for a, b in offs]
    rng_w = np.random.default_rng(4231)
    dir_jitter = [
        1.0 + 0.16 * nd.gaussian_filter(rng_w.standard_normal(h.shape), sigma=2.4)
        for _ in offs
    ]
    box = nd.binary_dilation(mask, iterations=3)
    box[0, :] = box[-1, :] = box[:, 0] = box[:, -1] = False
    by, bx = np.where(box)
    iy, ix = np.indices(h.shape)
    for it in range(W['iters']):
        pad = np.pad(h, 1, constant_values=1e9)
        slope = np.zeros(h.shape)
        ry, rx = iy.copy(), ix.copy()
        for idx_o, ((a, b), dd) in enumerate(zip(offs, dist)):
            nb = pad[1 + a:1 + a + ny, 1 + b:1 + b + nx]
            s = (h - nb) / (dd * dir_jitter[idx_o])
            better = s > slope
            slope = np.where(better, s, slope)
            ry = np.where(better, np.clip(iy + a, 0, ny - 1), ry)
            rx = np.where(better, np.clip(ix + b, 0, nx - 1), rx)
        order = np.argsort(-h[by, bx], kind='stable')
        A = np.full(h.shape, cell * cell)
        for k in order:
            y, x = by[k], bx[k]
            if ry[y, x] != y or rx[y, x] != x:
                A[ry[y, x], rx[y, x]] += A[y, x]
        cut = W['K'] * np.sqrt(A) * (slope / 1000.0)               # m per pass (slope in m per km -> rise over run)
        cut = np.minimum(cut, 0.4 * np.maximum(h - h[ry, rx], 0))
        room = np.maximum(W['max_cut'] - (E - h), 0)
        h = h - np.where(mask & (slope > 0), np.minimum(cut, room), 0)
    for it in range(W['thermal_iters']):
        pad = np.pad(h, 1, mode='edge')
        flow = np.zeros(h.shape)
        for (a, b), dd in zip(offs, dist):
            nb = pad[1 + a:1 + a + ny, 1 + b:1 + b + nx]
            flow += np.maximum((h - nb) / (dd * 220.0) - W['thermal'], 0) * dd * 220.0 * 0.06
        room = np.maximum(W['max_cut'] - (E - h), 0)
        h = h - np.where(mask, np.minimum(flow, room), 0)
    cut_raw = np.clip(E - h, 0.0, W['max_cut'])
    # Broaden 1-pixel D8 slots into smooth multi-pixel valleys so no vertical/horizontal/45-deg grid lines appear
    cut_smooth = np.clip(0.35 * nd.gaussian_filter(cut_raw, sigma=1.15) + 0.65 * nd.gaussian_filter(cut_raw, sigma=2.35), 0.0, W['max_cut'])
    h = E - np.where(mask, cut_smooth, 0.0)
    cut = E - h
    print('weathering: cut mean %.0f m, p99 %.0f m, max %.0f m over %d cells' % (cut[mask].mean(), np.percentile(cut[mask], 99), cut.max(), int(mask.sum())))
    return np.where(mask, np.minimum(h, E), E)
