#!/usr/bin/env python3
"""Scale model 4.15 to 4.19: the eastern abyss as an escarpment, the valley of Yuni, the lakes that stood above their
shores, (4.16) mountains filled into the regions the owner marks (MOUNTAINS), and (4.17) gentle rims kept where the
owner asks (GENTLE), a rise across the abyss's floor (HUMPS), a region cut to the floor with a salt lake (CUTS), and
(4.18) rain, climate class and zone recomputed where the heights changed (reclimate), and (4.19) the class decided by
the cell's own climate, the Yuni river (RIVERS) and two fixes to the page's region tool (UI_FIXES).

    python3 tools/scale-model/edit_heights.py <4.14 page.html> <regions.json> <settlements.json> <out page.html> [--work DIR]

Reads the page as saved (Artifact read) and the two collections (one JSON list each, as openworld/<name>/source/
keeps them), writes a new page with the edited rasters, and prints what it changed. Deterministic.

1. THE LAKES. A water body (connected cells of one level) standing more than SPILL_SLACK over the lower quartile of
   its dry shore cells is a data error (4.14 holds pools at 0, -50 and -900 m over the abyss's floor near -2,300 m);
   its level is lowered to that quartile. A body cut by the map's edge is judged by its shore inside the map; a lake
   the model records an outlet for (DATA.outlets: it spills over falls) is left as it is.
2. THE ABYSS ESCARPMENT (the owner, Oct 2026: "a more dramatic height drop for the eastern abyss, like the inner
   rim of the inner wall"). Round the abyss's floor (the cells below FLOOR_MAX inside or near the 'e abysss'
   overlay), each cell of the rim band is placed between the floor's level L and the plateau's level U there
   (low and high percentiles over a disc of RIM_R cells) and its share t of the way up is sharpened (a smoothstep
   over the middle of the range), so the plateau runs level to the edge, the drop happens within about one cell,
   and the floor runs level to the foot: the inner rim's ~1.8 km per 4 km cell. Feathered at the band's edges.
3. THE VALLEY OF YUNI ("more prominent mountains near Yuni forming a true valley opening to the NW"). Two ranges
   flank an axis from Yuni toward the north-west: the existing south-western mountains are raised and steepened,
   a new range rises on the north-east side, and the two close in a head ridge south-east of the city. The valley
   floor keeps its height; the ranges join the land with the max-and-a-quarter rule (core/terrain's KRELIEF.join).
4. THE PAINT. The satellite, relief, climate and shade images are re-lit where the heights changed (the light fitted
   to the image as assemble.py does), and the temperatures lapse with the new surface (6.5 C per km). The climate
   class and zone rasters are recomputed in step 6 (4.18, reclimate) wherever the heights changed.
"""
import base64, io, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

LO, HI = -2600.0, 17100.0
SPILL_SLACK = 600.0
FLOOR_MAX = -900.0      # m: the abyss's floor lies below this
RIM_R = 6               # height cells (~4 km each): the disc that finds the floor and the plateau
RIM_BAND = 5            # cells out from the floor's edge (and in) that the escarpment edit reaches
SHARP = (.32, .68)      # the share of the rise that becomes the cliff
VERSION = '4.19'
# regions the owner marked to fill with mountains. 4.16: 'Region 61', the valley of Yuni's south-eastern head (the
# polygon is kept here: the owner removed it from the store once it was applied)
MOUNTAINS = {'Region 61': dict(h=3400, floor=900, seed=161,
                               points=[[1013, 785], [1025, 760], [1040, 783], [1032, 799], [1017, 799]])}
# 4.17: where the abyss keeps the gentle drop it had in 4.14 (no escarpment)
GENTLE = ('east rim', 'Region 64')
# 4.17: a rise on the abyss's floor between two basins, falling away north and south (crest h metres over the floor)
HUMPS = {'Region 62': dict(h=750)}
# 4.17: cut down to the abyss's floor, a salt lake at the middle, the rim round it gentle (feather cells)
CUTS = {'Region 63': dict(floor=-2330, lake=.42, feather=6, seed=163)}
# 4.18: a region brought to an average height (m), its relief softened to `relief` of what it was, blended into the
# land round it over `feather` cells on every side
LEVELS = {'passage': dict(h=200, relief=.15, feather=4)}
# 4.19: rivers routed over the edited heights (least cost: no climbing, the low ground) from a source to a lake, the
# bed carved to fall all the way, written into DATA.rivers and painted on the satellite and relief maps. 'from' is a map
# px, or ('yuni', along) a point on the valley of Yuni's axis; 'to' a region whose lake it ends in, or ('near', a
# settlement) the lake nearest it. The Yuni river ends in the lake at Locus (-2,400 m), on the abyss floor below the valley
RIVERS = [dict(name='Yuni river', start=('yuni', -24), to=('near', 'Locus'), depth=40)]


def load(page):
    lines = open(page, encoding='utf8').read().split('\n')
    k = next(i for i, l in enumerate(lines) if l.startswith('const DATA = {'))
    s = lines[k]
    return lines, k, json.loads(s[s.index('{'):s.rindex('}') + 1])


def raster(D, key, mode='RGB'):
    return np.array(Image.open(io.BytesIO(base64.b64decode(D[key]))).convert(mode))


def b64(img, fmt='PNG', **kw):
    buf = io.BytesIO()
    img.save(buf, fmt, **kw)
    return base64.b64encode(buf.getvalue()).decode()


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def poly(pts, su, sv, shape):
    m = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(m).polygon([(a * su, b * sv) for a, b in pts], fill=1)
    return np.array(m).astype(bool)


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


def escarpment(E, abyss_poly, water, gentle=None):
    """sharpen the abyss's rim; returns (new E, band mask, report)"""
    floor = (E < FLOOR_MAX) & nd.binary_dilation(abyss_poly, iterations=4) & ~water
    lab, n = nd.label(floor)
    if n:   # the main trough only: the biggest connected floor and anything within a few cells of it
        sizes = nd.sum(floor, lab, range(1, n + 1))
        main = lab == (1 + int(np.argmax(sizes)))
        floor = floor & nd.binary_dilation(main, iterations=3)
    dist_out = nd.distance_transform_edt(~floor)
    dist_in = nd.distance_transform_edt(floor)
    band = ((dist_out > 0) & (dist_out <= RIM_BAND)) | ((dist_in > 0) & (dist_in <= 2))
    yy, xx = np.mgrid[-RIM_R:RIM_R + 1, -RIM_R:RIM_R + 1]
    disc = (xx * xx + yy * yy) <= RIM_R * RIM_R
    L = nd.percentile_filter(E, 8, footprint=disc)
    U = nd.percentile_filter(E, 68, footprint=disc)   # the plateau's own level, not its highest hills (no raised lip)
    rise = U - L
    t = np.clip((E - L) / np.maximum(rise, 1), 0, 1)
    tn = sstep(SHARP[0], SHARP[1], t)
    target = L + rise * tn
    w = band * sstep(400, 900, rise)
    w = nd.gaussian_filter(w.astype(float), 1.0) * band   # feathered, never outside the band
    if gentle is not None:   # the owner's gentle rims keep the drop they had
        w = w * (1 - np.clip(nd.gaussian_filter(gentle.astype(float), 1.5) * 1.6, 0, 1))
    En = E + w * (target - E)
    gy, gx = np.gradient(E)
    gy2, gx2 = np.gradient(En)
    g0, g1 = np.hypot(gx, gy)[band & (w > .5)], np.hypot(gx2, gy2)[band & (w > .5)]
    rep = {'band_cells': int(band.sum()), 'edited_cells': int((w > .05).sum()),
           'steepest_m_per_cell_before': round(float(g0.max()), 0) if g0.size else 0,
           'steepest_m_per_cell_after': round(float(g1.max()), 0) if g1.size else 0,
           'p90_before': round(float(np.percentile(g0, 90)), 0) if g0.size else 0,
           'p90_after': round(float(np.percentile(g1, 90)), 0) if g1.size else 0}
    return En, band, rep


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


def ridge(shape, su, sv, a_px, b_px, h, w_px, seed):
    """a range along a-b (map px), h metres at the spine, w_px half-width: an envelope (steep sides, a broad top,
    tapered ends) times ridged fractal noise, so it is a mass of peaks and spurs, not a wall"""
    ny, nx = shape
    yy, xx = np.mgrid[0:ny, 0:nx]
    px, py = xx / su, yy / sv
    ax, ay = a_px
    bx, by = b_px
    dx, dy = bx - ax, by - ay
    Ln = math.hypot(dx, dy)
    ux, uy = dx / Ln, dy / Ln
    s = (px - ax) * ux + (py - ay) * uy
    q = -(px - ax) * uy + (py - ay) * ux
    sc = np.where(s < 0, -s, np.where(s > Ln, s - Ln, 0))
    d = np.hypot(sc, q)
    f = np.clip(1 - d / w_px, 0, 1)
    env = f ** .45 * sstep(0, .25, f) * sstep(-w_px * .8, w_px * .7, np.minimum(s, Ln - s))
    rn = ridged(shape, seed)
    return h * env * (.35 + .9 * rn)


def valley(E, su, sv, yuni_px):
    """the ranges round Yuni; returns (new E, mask of the cells they changed, report)"""
    yx, yy = yuni_px
    # the valley's axis runs from the head (south-east of the city) to the mouth (north-west); directions in map px
    ax_ = np.array([-1.0, -.78]); ax_ /= np.linalg.norm(ax_)   # toward the mouth
    nrm = np.array([ax_[1], -ax_[0]])                          # toward the north-east side
    P = lambda along, across: (yx + ax_[0] * along + nrm[0] * across, yy + ax_[1] * along + nrm[1] * across)
    base = 650.0   # the valley floor's height at the city
    ranges = [
        # north-east wall: from beyond the head to well past the city toward the mouth
        dict(a=P(-30, 17), b=P(34, 19), h=3300, w=11, seed=151),
        # south-west wall: over the existing mountains, steepened and raised a little
        dict(a=P(-28, -15), b=P(30, -17), h=2700, w=10, seed=152),
        # the head: a ridge closing the valley south-east of the city
        dict(a=P(-27, -19), b=P(-29, 21), h=2900, w=9, seed=153),
    ]
    add = [ridge(E.shape, su, sv, R['a'], R['b'], R['h'], R['w'], R['seed']) for R in ranges]
    # the valley floor itself: a gentle trough along the axis so the ranges' toes do not choke it
    ny, nx = E.shape
    yyg, xxg = np.mgrid[0:ny, 0:nx]
    px, py = xxg / su - yx, yyg / sv - yy
    along = px * ax_[0] + py * ax_[1]
    across = px * nrm[0] + py * nrm[1]
    floorK = sstep(9, 4, np.abs(across)) * sstep(-34, -24, along) * sstep(60, 40, along)
    stack = np.stack(add)
    top = stack.max(0)
    join = top + .25 * (stack.sum(0) - top)
    lifted = base + join
    En = np.where(join > 1, np.maximum(E, np.minimum(lifted, E + join)), E)
    # the floor keeps (or gets) the valley's own height, falling gently toward the mouth
    floor_h = base - np.clip(along, 0, None) * 6.0
    En = En + floorK * (np.minimum(En, floor_h + 120) - En)
    # 4.17: the mouth. From the city the floor runs down the axis to the abyss's floor in one long gentle ramp (the
    # owner: "gently transition to the abyss"), over the corridor between the ranges' toes
    alongs = np.arange(0, 120, 1.0)
    reach = 60.0
    for a_ in alongs:
        qx, qy = yx + ax_[0] * a_, yy + ax_[1] * a_
        if E[min(ny - 1, max(0, int(round(qy * sv)))), min(nx - 1, max(0, int(round(qx * su))))] < -1500:
            reach = float(a_)
            break
    abyss_floor = -1900.0
    ramp = base + (abyss_floor - base) * sstep(8, reach + 6, along)
    mouthK = sstep(12, 5, np.abs(across)) * sstep(4, 10, along) * sstep(reach + 14, reach + 4, along)
    En = En + mouthK * (ramp - En)
    changed = np.abs(En - E) > 1
    rep = {'cells_changed': int(changed.sum()), 'highest_m': round(float(En[changed].max()), 0) if changed.any() else 0,
           'ranges': [{'from_px': [round(c, 1) for c in R['a']], 'to_px': [round(c, 1) for c in R['b']], 'h': R['h']} for R in ranges]}
    rep['mouth_reach_px'] = reach
    return En, changed, rep


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


def reclimate(D, E, En, whas, forced, cap=None):
    """4.18: rain, climate class and zone recomputed where the heights changed (the model's own generator is not in the
    repo, so they are re-derived from the model itself). A changed cell takes the rain, class and zone of the unchanged
    land cells most like it nearby: the nearest in (place, height, windward slope under the north-west wind, mean
    temperature), so new mountains get the rain and the cold classes the model gives mountains round them, a basin cut
    into the abyss gets the abyss's. `forced` (full-res bool) is left alone (a cut's own classes). Returns the new
    full-res rain (mm), class and zone, the changed mask and a report."""
    from scipy.spatial import cKDTree
    OH, OW = D['fullH'], D['fullW']
    zoom = (OH / E.shape[0], OW / E.shape[1])
    Eo, Ef = nd.zoom(E, zoom, order=1)[:OH, :OW], nd.zoom(En, zoom, order=1)[:OH, :OW]
    wetF = nd.zoom(whas.astype(np.uint8), zoom, order=0)[:OH, :OW].astype(bool)
    rain = raster(D, 'p', 'L').astype(float) / 255 * 4000
    cls = raster(D, 'c', 'L')
    zon = raster(D, 'z', 'L')
    tm = raster(D, 'tm', 'L').astype(float) - 90

    def windward(H):
        gy, gx = np.gradient(nd.gaussian_filter(H, 2.0), 2000.0)
        return (gx + gy) / np.sqrt(2) * 1000            # m per km rising toward the south-east (the wind's way)
    wo, wn = windward(Eo), windward(Ef)
    changed = nd.binary_dilation(np.abs(Ef - Eo) > 40, iterations=2) & ~wetF & ~forced
    codes = [c['code'] for c in D['climate']['classes']]
    airless = cls == codes.index('O') if 'O' in codes else np.zeros(cls.shape, bool)
    pool = ~changed & ~wetF & ~airless & (tm > -89) & ~forced   # a cut's forced class is no twin
    yy, xx = np.mgrid[0:OH, 0:OW]
    feat = lambda m, H, W: np.stack([xx[m] / 40.0, yy[m] / 40.0, H[m] / 350.0, W[m] / 60.0, tm[m] / 2.5], 1)
    tree = cKDTree(feat(pool, Eo, wo))
    pr, pc, pz = rain[pool], cls[pool], zon[pool]
    q = changed & ~airless
    d, idx = tree.query(feat(q, Ef, wn), k=12)
    w = 1.0 / (d + .25)
    nrain = (pr[idx] * w).sum(1) / w.sum(1)

    def vote(v):
        out = np.empty(len(v), np.uint8)
        for r in range(len(v)):
            sc = {}
            for k_ in range(v.shape[1]):
                sc[v[r, k_]] = sc.get(v[r, k_], 0) + w[r, k_]
            out[r] = max(sc, key=sc.get)
        return out
    rain2, cls2, zon2 = rain.copy(), cls.copy(), zon.copy()
    rain2[q] = nrain
    zon2[q] = vote(pz[idx])
    # one cell's own slope makes the rain banded: it is smoothed over the cells recomputed
    rs = nd.gaussian_filter(rain2, 2.5)
    rain2[q] = rs[q]
    if cap is not None:     # a cut's dry rain (main): over the cut and its eased edge, which are recomputed with it
        dry, k = cap
        rain2 = rain2 + k * (np.minimum(rain2, dry) - rain2)
        q = q | (k > 0) & ~forced & ~airless & ~wetF
    # 4.19: THE CLASS FOLLOWS THE CELL'S OWN CLIMATE. 4.18 voted the class from its look-alikes apart from the rain, so a
    # cell could take a wet rain and a desert class (abyssal desert at 1,400 mm). Now each recomputed cell takes the class
    # the model gives the unchanged land with the same climate: the nearest in (rain, mean, warmest and coldest
    # temperature, air pressure), so the model's own thresholds decide (its XW stays under ~400 mm, its XA over ~1,300).
    tw = raster(D, 'tw', 'L').astype(float) - 90
    tc = raster(D, 'tc', 'L').astype(float) - 90
    prs = lambda H: np.exp(-H / 8000.0) * 1.6
    cfeat = lambda m, H, Rn: np.stack([Rn[m] / 120.0, tm[m] / 2.0, tw[m] / 2.5, tc[m] / 2.5, prs(H)[m] / .04], 1)
    ctree = cKDTree(cfeat(pool, Eo, rain))
    d2, idx2 = ctree.query(cfeat(q, Ef, rain2), k=40)
    # and never a class whose rain the cell is outside: each class's 2nd to 98th percentile of rain over the land kept,
    # so the hottest abyss floor, whose only twins are dry, cannot take abyssal desert at 1,500 mm
    lo_, hi_ = np.full(256, 0.0), np.full(256, 1e9)
    for k_ in np.unique(pc):
        r_ = rain[pool][pc == k_]
        if len(r_) > 50:
            lo_[k_], hi_[k_] = np.percentile(r_, 2), np.percentile(r_, 98)
    rq = rain2[q][:, None]
    fits = (rq >= lo_[pc[idx2]]) & (rq <= hi_[pc[idx2]])
    w = 1.0 / (d2 + .2) * np.where(fits.any(1, keepdims=True), fits, 1.0)
    out_ = vote(pc[idx2])
    # none of the 40 fits (the hottest floor, 35 C and over, has dry twins only): the nearest twin of any class that does
    none = np.nonzero(~fits.any(1))[0]
    if len(none):
        fq = cfeat(q, Ef, rain2)[none]
        best_ = np.full(len(none), np.inf)
        for k_ in np.unique(pc):
            ok_ = (rq[none, 0] >= lo_[k_]) & (rq[none, 0] <= hi_[k_])
            if not ok_.any():
                continue
            dk, _ = cKDTree(cfeat(pool, Eo, rain)[pc == k_]).query(fq[ok_], k=1)
            rows = np.nonzero(ok_)[0]
            better = dk < best_[rows]
            best_[rows[better]] = dk[better]
            out_[none[rows[better]]] = k_
    cls2[q] = out_
    ys_, xs_ = np.nonzero(q)
    y0, y1, x0, x1 = max(0, ys_.min() - 3), ys_.max() + 4, max(0, xs_.min() - 3), xs_.max() + 4
    for arr in (zon2,):   # the class is now decided by the climate itself and needs no smoothing of its own
        sub = arr[y0:y1, x0:x1]
        best, cnt = sub.copy(), np.zeros(sub.shape)
        for k in np.unique(sub[q[y0:y1, x0:x1]]):
            c = nd.uniform_filter((sub == k).astype(float), 5)
            better = c > cnt
            best[better], cnt[better] = k, c[better]
        m = q[y0:y1, x0:x1]
        sub[m] = best[m]
    moved = cls2 != cls
    rep = {'cells': int(q.sum()), 'class_changed': int(moved.sum()),
           'rain_mean_before_mm': round(float(rain[q].mean()), 0) if q.any() else 0,
           'rain_mean_after_mm': round(float(rain2[q].mean()), 0) if q.any() else 0,
           'classes_now': {codes[k]: int(((cls2 == k) & q).sum()) for k in np.unique(cls2[q])} if q.any() else {}}
    return rain2, cls2, zon2, q, rep


RAIN_RAMP = [(0, (214, 178, 120)), (240, (222, 205, 150)), (600, (190, 210, 150)), (1000, (120, 190, 170)),
             (1600, (60, 150, 170)), (2400, (30, 95, 160)), (4000, (20, 40, 110))]   # the page's rain legend


def ramp(v):
    xs = [r[0] for r in RAIN_RAMP]
    return np.stack([np.interp(v, xs, [r[1][k] for r in RAIN_RAMP]) for k in range(3)], -1)


def repaint(D, key, old_col, new_col, mask):
    """repaint a painted map where its colour key changed: each pixel scaled by new over old colour, so the relief
    shading baked into the paint is kept"""
    src = Image.open(io.BytesIO(base64.b64decode(D[key])))
    im = np.array(src.convert('RGB')).astype(float)
    f = np.clip((new_col + 8) / (old_col + 8), .3, 3.0)
    im[mask] = np.clip(im[mask] * f[mask], 0, 255)
    q = getattr(src, 'quantization', None)
    return b64(Image.fromarray(im.round().astype(np.uint8)), 'JPEG', **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))


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


def route_river(E, su, sv, start_px, goal_mask):
    """least-cost path on the height grid from start_px (map px) to any cell of goal_mask: climbing is dear and low ground
    is cheap, so the river keeps to the valley floors; returns the cells [(j, i), ...]"""
    import heapq
    ny, nx = E.shape
    st = (int(round(start_px[1] * sv)), int(round(start_px[0] * su)))
    dist, prev, pq, end = {st: 0.0}, {}, [(0.0, st)], None
    while pq:
        d, u = heapq.heappop(pq)
        if goal_mask[u]:
            end = u
            break
        if d > dist[u]:
            continue
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                if not dj and not di:
                    continue
                v = (u[0] + dj, u[1] + di)
                if not (0 <= v[0] < ny and 0 <= v[1] < nx):
                    continue
                c = d + math.hypot(dj, di) * (1 + max(0.0, E[v] - E[u]) / 15 + (E[v] + 3000) / 4000)
                if c < dist.get(v, 1e18):
                    dist[v], prev[v] = c, u
                    heapq.heappush(pq, (c, v))
    path = [end]
    while path[-1] != st:
        path.append(prev[path[-1]])
    return path[::-1]


def carve_river(E, path, depth):
    """the bed falls all the way: each cell of the path no higher than the one before less 2 m, the channel `depth` below
    the land it crosses, its banks (the 8 neighbours) eased toward the bed; returns (new E, the bed per path cell)"""
    En = E.copy()
    bed, beds = 1e9, []
    for j, i in path:
        bed = max(min(E[j, i] - depth, bed - 2.0), LO + 1.0)   # no lower than the format's floor
        beds.append(bed)
    for (j, i), b in zip(path, beds):
        En[j, i] = min(En[j, i], b)
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                jj, ii = j + dj, i + di
                if (dj or di) and 0 <= jj < E.shape[0] and 0 <= ii < E.shape[1]:
                    En[jj, ii] = min(En[jj, ii], max(b + depth * 2.5, En[jj, ii] - depth))
    return En, beds


def paint_river(D, key, pts_px, width=1.6, colour=(63, 111, 134)):
    """a river drawn on a painted map: a line along its smoothed course, blended over the paint"""
    src = Image.open(io.BytesIO(base64.b64decode(D[key])))
    im = src.convert('RGB')
    over = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(over).line([tuple(p) for p in pts_px], fill=colour + (205,), width=max(1, int(round(width))), joint='curve')
    over = over.filter(ImageFilter.GaussianBlur(.6))
    im = Image.alpha_composite(im.convert('RGBA'), over).convert('RGB')
    q = getattr(src, 'quantization', None)
    return b64(im, 'JPEG', **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))


def chaikin(pts, n=2):
    for _ in range(n):
        q = [pts[0]]
        for a_, b_ in zip(pts[:-1], pts[1:]):
            q += [(a_[0] * .75 + b_[0] * .25, a_[1] * .75 + b_[1] * .25), (a_[0] * .25 + b_[0] * .75, a_[1] * .25 + b_[1] * .75)]
        q.append(pts[-1])
        pts = q
    return pts


def meander(pts, amp=.55):
    """a routed course follows the grid's eight directions in ruled runs: each point is pushed sideways by two sines of
    the distance along it (map px; amp px is about 1 km), faded to nothing at both ends so the source and the mouth stay put"""
    P = np.array(pts, float)
    seg = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
    tg = np.gradient(P, axis=0)
    nrm = np.stack([-tg[:, 1], tg[:, 0]], 1) / (np.hypot(tg[:, 0], tg[:, 1])[:, None] + 1e-9)
    fade = np.clip(np.minimum(seg, seg[-1] - seg) / 4.0, 0, 1)
    off = amp * (np.sin(seg / 2.3) + .5 * np.sin(seg / .9 + 1.7)) * fade
    return [tuple(v) for v in P + nrm * off[:, None]]


UI_FIXES = [
    # importCityRegions never closed: the settlements' hover and __settReady sat inside it, so once the import had run
    # every pointer move threw (hoverSett is not defined). Close it where it ends and set the rest up at the top level.
    ("    settStatus.textContent=n?('imported '+n+' from regions marked (city) \u2014 set each one\u2019s type below'):'no new (city) regions to import';\n",
     "    settStatus.textContent=n?('imported '+n+' from regions marked (city) \u2014 set each one\u2019s type below'):'no new (city) regions to import';\n"
     "    renderSett(); drawSettlements();\n    try{ localStorage.setItem('krator.settSeeded','1'); }catch(e){}\n  }\n"),
    ("  window.__settReady=true;\n  renderSett(); drawSettlements();\n    try{ localStorage.setItem('krator.settSeeded','1'); }catch(e){}\n  }\n",
     "  window.__settReady=true;\n  renderSett(); drawSettlements();\n"),
    # region handles: picked in screen space (the nearest within 16 px) and drawn twice the size; a 15 km sphere on a
    # 3,000 km map was a few pixels across, so a drag usually missed it and orbited the camera instead
    ("  function pickHandle(e){ const hit=castAt(e,handles.children); return hit?hit.object:null; }",
     "  function pickHandle(e){ const r=el.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=null,bd=16;camera.updateMatrixWorld();\n"
     "    handles.children.forEach(m=>{ const v=m.position.clone().project(camera); if(v.z>1) return; const d=Math.hypot((v.x*.5+.5)*r.width-mx,(-v.y*.5+.5)*r.height-my); if(d<bd){bd=d;best=m;} });\n"
     "    return best; }"),
    ("    const s=Math.max(3,dist*0.006);", "    const s=Math.max(5,dist*0.012);"),
]


def ui_fixes(html):
    n = 0
    for a_, b_ in UI_FIXES:
        if html.count(a_) != 1:     # the script runs on the 4.14 page, where each occurs once
            raise SystemExit('UI fix not found once: ' + a_[:80])
        html = html.replace(a_, b_, 1)
        n += 1
    return html, n


def relight(D, Eo, En, keys=('st', 't', 'rt', 'ct')):
    """re-shade the painted images where the heights changed (the light fitted to each image, as assemble.py does)"""
    FH, FW = D['fullH'], D['fullW']
    zoom = (FH / Eo.shape[0], FW / Eo.shape[1])
    EoF, EnF = nd.zoom(Eo, zoom, order=1), nd.zoom(En, zoom, order=1)
    region = nd.binary_dilation(np.abs(EnF - EoF) > 1, iterations=3)

    def lam(E, zf, az, alt=45):
        gy, gx = np.gradient(E / 1000 * zf, 2.0)
        a, l = np.radians(az), np.radians(alt)
        lx, ly, lz = np.cos(l) * np.sin(a), -np.cos(l) * np.cos(a), np.sin(l)
        return (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1)
    out = {}
    for k in keys:
        src = Image.open(io.BytesIO(base64.b64decode(D[k])))
        im = np.array(src.convert('RGB')).astype(float)
        Lm = im.mean(-1)
        Ll = nd.uniform_filter(Lm, 25) + 1
        mfit = nd.binary_dilation(region, iterations=20)
        y = (Lm / Ll - 1)[mfit]
        best = None
        for az in range(255, 390, 15):
            for zf in [1, 2, 3, 5, 10]:
                so = lam(EoF, zf, az)
                x = (so - nd.uniform_filter(so, 25))[mfit]
                g = float((x * y).sum() / (x * x).sum())
                r = np.corrcoef(x, y)[0, 1]
                if best is None or r > best[0]:
                    best = (r, az, zf, g)
        r, az, zf, g = best
        f = np.clip(1 + g * (lam(EnF, zf, az) - lam(EoF, zf, az)), .55, 1.7)
        res = im.copy()
        res[region] = res[region] * f[region, None]
        q = getattr(src, 'quantization', None)
        out[k] = b64(Image.fromarray(np.clip(res, 0, 255).round().astype(np.uint8)), 'JPEG',
                     **({'qtables': q, 'subsampling': 2} if q else {'quality': 90}))
        print('  relit %s: light az %d, zf %d, gain %.2f (corr %.2f)' % (k, az, zf, g, r))
    return out, EoF, EnF


def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    page, regions, setts, out = sys.argv[1:5]
    lines, li, D = load(page)
    R = {r['name']: r for r in json.load(open(regions, encoding='utf8'))}
    S = {s['name']: s for s in json.load(open(setts, encoding='utf8'))}
    VW, VH, OW, OH = D['w'], D['hh'], D['fullW'], D['fullH']
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    h = raster(D, 'h').astype(np.int64)
    wl = raster(D, 'wl').astype(np.int64)
    E = LO + ((h[..., 0] << 8) | h[..., 1]) / 65535 * (HI - LO)
    water = h[..., 2] > 127
    whas = wl[..., 2] > 127
    wlev = np.where(whas, LO + ((wl[..., 0] << 8) | wl[..., 1]) / 65535 * (HI - LO), 0.0)
    report = {'version': VERSION}

    wlev2, report['lakes'] = lakes(E, whas, wlev, D.get('outlets', []))
    print('lakes lowered:', report['lakes'])
    abyss = poly(R['e abysss']['points'], su, sv, E.shape)
    gentle = np.zeros(E.shape, bool)
    for nm in GENTLE:
        if nm in R:
            gentle |= poly(R[nm]['points'], su, sv, E.shape)
        else:
            print('no region named', nm)
    E1, band, report['escarpment'] = escarpment(E, abyss, water | whas, gentle)
    print('escarpment:', report['escarpment'])
    yuni = S['Yuni']
    E2, vmask, report['valley'] = valley(E1, su, sv, (yuni['px'], yuni['py']))
    print('valley of Yuni:', report['valley'])
    report['mountains'] = {}
    for nm, M_ in MOUNTAINS.items():
        pts = M_.get('points') or (R[nm]['points'] if nm in R else None)
        if not pts:
            print('no region named', nm)
            continue
        E2, mm = mountains(E2, su, sv, pts, M_['h'], M_['floor'], M_['seed'])
        report['mountains'][nm] = {'cells_changed': int(mm.sum()), 'highest_m': round(float(E2[mm].max()), 0) if mm.any() else 0}
    print('mountains:', report['mountains'])
    report['humps'] = {}
    for nm, Hm in HUMPS.items():
        if nm not in R:
            print('no region named', nm)
            continue
        E2, hm = hump(E2, su, sv, R[nm]['points'], Hm['h'])
        report['humps'][nm] = {'cells_changed': int(hm.sum()), 'crest_m': round(float(E2[hm].max()), 0) if hm.any() else 0}
    print('humps:', report['humps'])
    report['cuts'] = {}
    lakes_new = np.zeros(E.shape, bool)
    cut_full = []
    for nm, Cu in CUTS.items():
        if nm not in R:
            print('no region named', nm)
            continue
        E2, lk, ins = cut(E2, su, sv, R[nm]['points'], Cu['floor'], Cu['lake'], Cu['feather'], Cu['seed'])
        lakes_new |= lk
        wlev2 = np.where(lk, Cu['floor'] + 25, wlev2)
        cut_full.append((R[nm]['points'], Cu))
        report['cuts'][nm] = {'cells': int(ins.sum()), 'lake_cells': int(lk.sum()), 'lake_level_m': Cu['floor'] + 25}
    print('cuts:', report['cuts'])
    report['levels'] = {}
    for nm, Lv in LEVELS.items():
        if nm not in R:
            print('no region named', nm)
            continue
        E2, lm = level(E2, su, sv, R[nm]['points'], Lv['h'], Lv['relief'], Lv['feather'])
        ins = poly(R[nm]['points'], su, sv, E.shape)
        report['levels'][nm] = {'cells': int(lm.sum()), 'mean_inside_m': round(float(E2[ins].mean()), 0),
                                'range_inside_m': [round(float(E2[ins].min()), 0), round(float(E2[ins].max()), 0)]}
    print('levels:', report['levels'])
    # 4.19: no edit raises the bed of a lake the model already has (the valley's north-east range ran its toe into the
    # lake at Locus, lifting its south end to +300 m under water at -2,400 m): uplift is taken off the lakes and eased
    # back in over 2 cells from their shores
    old_lake = whas & ~water
    kl = np.clip(nd.distance_transform_edt(~old_lake) / 2.0, 0, 1)
    up = E2 - E
    report['lake_beds_restored_cells'] = int((old_lake & (up > 1)).sum())
    E2 = E + np.where(up > 0, up * kl, up)
    report['rivers'] = []
    rivers_px = []
    for Rv in RIVERS:
        st_px = Rv['start']
        if isinstance(st_px, tuple) and st_px[0] == 'yuni':
            ax_ = np.array([-1.0, -.78]); ax_ /= np.linalg.norm(ax_)
            y_ = S['Yuni']
            st_px = (y_['px'] + ax_[0] * st_px[1], y_['py'] + ax_[1] * st_px[1])
        if isinstance(Rv['to'], tuple):          # the lake nearest a settlement
            lab_, _ = nd.label(whas | lakes_new)
            s_ = S[Rv['to'][1]]
            ys_, xs_ = np.nonzero(lab_)
            k_ = np.argmin(np.hypot(ys_ - s_['py'] * sv, xs_ - s_['px'] * su))
            goal = (lab_ == lab_[ys_[k_], xs_[k_]]) & (E2 < wlev2 - 20)   # its cells under water, not its coarse shore
        else:
            goal = lakes_new & poly(R[Rv['to']]['points'], su, sv, E.shape)
        path = route_river(E2, su, sv, st_px, goal)
        E2, beds = carve_river(E2, path, Rv['depth'])
        pts = meander(chaikin([((i) / su, (j) / sv) for j, i in path[::2] + ([path[-1]] if len(path) % 2 == 0 else [])], 4))
        rivers_px.append({'name': Rv['name'], 'px': [[round(x, 1), round(y, 1)] for x, y in pts],
                          'to': ' '.join(Rv['to']) if isinstance(Rv['to'], tuple) else Rv['to']})
        report['rivers'].append({'name': Rv['name'], 'cells': len(path), 'from_m': round(float(beds[0]), 0), 'to_m': round(float(beds[-1]), 0)})
    print('rivers:', report['rivers'])
    En = np.where(water & ~lakes_new, E, E2)   # the sea and the lakes' beds are left alone (a new lake's is the cut's)
    water = water | lakes_new
    whas = whas | lakes_new

    enc = lambda v: np.round(np.clip((v - LO) / (HI - LO), 0, 1) * 65535).astype(np.int64)   # never wraps past the format's range
    q = np.where(np.abs(En - E) > .5, enc(En), (h[..., 0] << 8) | h[..., 1])
    h2 = h.copy()
    h2[..., 0], h2[..., 1] = q >> 8, q & 255
    h2[..., 2] = np.where(water, 255, 0)
    qw = np.where(whas, enc(wlev2), (wl[..., 0] << 8) | wl[..., 1])
    wl2 = wl.copy()
    wl2[..., 0], wl2[..., 1] = qw >> 8, qw & 255
    wl2[..., 2] = np.where(whas, 255, 0)
    rep = {'h': b64(Image.fromarray(h2.astype(np.uint8), 'RGB'), optimize=True),
           'wl': b64(Image.fromarray(wl2.astype(np.uint8), 'RGB'), optimize=True)}
    imgs, EoF, EnF = relight(D, E, En)
    rep.update(imgs)
    # temperatures lapse with the surface (the water surface where there is water)
    surf = lambda Ex, lev: np.where(whas, np.maximum(Ex, lev), Ex)
    zoom = (OH / E.shape[0], OW / E.shape[1])
    DS = nd.zoom(surf(En, wlev2) - surf(E, wlev), zoom, order=1)
    for k in ['tm', 'th', 'tl', 'tw', 'tc']:
        a = raster(D, k, 'L').astype(float)
        v = a - 90
        ok = (v > -89) & (np.abs(DS) > 1)
        v2 = np.where(ok, np.round(v - 6.5 * DS / 1000), v)
        rep[k] = b64(Image.fromarray(np.clip(v2 + 90, 0, 255).astype(np.uint8), 'L'), optimize=True)
    # the cut's climate class and zone, at full resolution: abyssal desert on its floor, abyssal salt lake in its middle
    forcedF = np.zeros((OH, OW), bool)
    if cut_full:
        codes = [c['code'] for c in D['climate']['classes']]
        cimg = raster(D, 'c', 'L').copy()
        zimg = raster(D, 'z', 'L').copy()
        lakeF = nd.zoom(lakes_new.astype(np.uint8), (OH / E.shape[0], OW / E.shape[1]), order=0).astype(bool)[:OH, :OW]
        for pts, Cu in cut_full:
            m = Image.new('L', (OW, OH), 0)
            ImageDraw.Draw(m).polygon([tuple(p) for p in pts], fill=1)
            inF = np.array(m).astype(bool)
            forcedF |= inF
            cimg[inF] = codes.index('XW')
            zimg[inF] = 5                      # salt basin
            cimg[lakeF & inF] = codes.index('WX')
            zimg[lakeF & inF] = 4              # lake / sea
    else:
        cimg, zimg = raster(D, 'c', 'L').copy(), raster(D, 'z', 'L').copy()
    # 4.18: rain, class and zone recomputed where the heights changed (reclimate), then the rain and climate maps
    # repainted where they changed. The temperatures have already lapsed with the new heights (rep['tm'] ...): the
    # analog search reads the new mean temperature.
    D2 = dict(D)
    D2['c'] = b64(Image.fromarray(cimg, 'L'))
    D2['z'] = b64(Image.fromarray(zimg, 'L'))
    D2['tm'] = rep['tm']
    rain0 = raster(D, 'p', 'L').astype(float) / 255 * 4000
    # 4.19: a cut is a dry salt basin, so its rain is the abyss floor's dry rain too (4.18 kept the rain the ground had
    # before the cut, up to 3,400 mm under an abyssal desert class): the median of the dry abyss floor (XW) within 40 px,
    # eased over 4 px into the rain round it. reclimate applies it before it chooses the classes.
    cap = None
    if forcedF.any():
        codes = [c['code'] for c in D['climate']['classes']]
        near = nd.binary_dilation(forcedF, iterations=40) & ~forcedF & (raster(D, 'c', 'L') == codes.index('XW'))
        dry = float(np.median(rain0[near])) if near.any() else 250.0
        cap = (dry, np.where(forcedF, 1.0, np.clip(1 - nd.distance_transform_edt(~forcedF) / 4, 0, 1)))
        report['cut_rain_mm'] = round(dry, 0)
    rain2, cls2, zon2, qmask, report['climate'] = reclimate(D2, E, En, whas, forcedF, cap)
    print('climate:', report['climate'])
    pal = np.array([[int(c['color'][i:i + 2], 16) for i in (1, 3, 5)] for c in D['climate']['classes']], float)
    c0 = raster(D, 'c', 'L')
    cmask = cls2 != c0
    rep['ct'] = repaint(dict(D, ct=rep.get('ct', D['ct'])), 'ct', pal[c0], pal[cls2], cmask)
    rmask = np.abs(rain2 - rain0) > 15
    rep['rt'] = repaint(dict(D, rt=rep.get('rt', D['rt'])), 'rt', ramp(rain0), ramp(rain2), rmask)
    rep['p'] = b64(Image.fromarray(np.clip(np.round(rain2 / 4000 * 255), 0, 255).astype(np.uint8), 'L'), optimize=True)
    rep['c'] = b64(Image.fromarray(cls2, 'L'), optimize=True)
    rep['z'] = b64(Image.fromarray(zon2, 'L'), optimize=True)
    for Rv in rivers_px:
        for k in ('st', 't'):
            rep[k] = paint_river(dict(D, **{k: rep.get(k, D[k])}), k, Rv['px'])
    s = lines[li]
    for k, v in rep.items():
        key = '"%s": "' % k
        assert s.count(key) == 1, k
        a = s.index(key) + len(key)
        b = s.index('"', a)
        s = s[:a] + v + s[b:]
    # the rivers as data (a viewer or an extractor reads them): DATA.rivers, added once after "vents"
    if rivers_px:
        key = '"rivers": '
        if key in s:
            a_ = s.index(key) + len(key)
            depth_, b_ = 0, a_
            while True:
                depth_ += {'[': 1, ']': -1}.get(s[b_], 0)
                b_ += 1
                if depth_ == 0:
                    break
            s = s[:a_] + json.dumps(rivers_px) + s[b_:]
        else:
            s = s[:s.rindex('}')] + ', "rivers": ' + json.dumps(rivers_px) + s[s.rindex('}'):]
    lines[li] = s
    html = '\n'.join(lines)
    html, nfix = ui_fixes(html)
    report['ui_fixes'] = nfix
    import re
    html, n = re.subn(r'scale model 4\.\d+ ·', 'scale model %s ·' % VERSION, html)
    assert n >= 1, 'version label not found'
    open(out, 'w', encoding='utf8').write(html)
    json.dump(report, open(os.path.splitext(out)[0] + '.report.json', 'w'), indent=1)
    print('wrote %s (%d bytes); report beside it' % (out, len(html)))


if __name__ == '__main__':
    main()
