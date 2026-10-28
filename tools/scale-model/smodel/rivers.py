"""Rivers on the height grid: the water books (grid_fields, closed_books), the routing set-up (setup, with
smodel.hydro), tracing courses (trace), cutting a channel (cut_channel), and the 4.19 least-cost route and carve.

Lifted from history/edit_rivers.py (4.21) and history/edit_heights.py (route_river, carve_river). Two changes:
grid_fields decodes the heights with the data's own lo/hi (the 4.21 code's constants say hi 17,100 m; 4.23 is 27,000),
and carve_river takes the floor `lo` as an argument. The reroute that runs these over a whole page is still
history/edit_422.py's main(): it is the worked example until the edit pipeline has its own.
"""
import heapq, math, re, sys

import numpy as np
from scipy import ndimage as nd

from . import hydro
from .page import heights, raster, water_levels


BARRIER_M = 5000.0     # m: moist air does not cross ground this high; it walls the sealed basins


IMPORT_KM = 300.0      # km: the rain this near the ocean at the map's edge is the crater's only outside water


ICE_T = -10.0          # deg C: ground with a colder annual mean is frozen all year


CLOSED_M = 25.0        # m: a drawn lake whose spill stands this far over its level is closed (ends flow as drawn)


Q_RIVER = 10.0         # m3/s mean flow: a river


A_WADI = 2500.0        # km2: a dry valley's catchment, when it carries less than Q_RIVER


MIN_CELLS = 6          # a course shorter than this many height cells (~24 km) is not listed, unless it carries Q_KEEP


Q_KEEP = 100.0


BREACH_M = 150.0       # m: a hollow on a course no deeper than this is the grid's, and is cut through


SETTLE_KM = 12.0       # a settlement this near a course is listed on it


TOOL_REGIONS = re.compile(r'^(little demo|big demo|passage|east rim|region \d+|dam( 2)?)$', re.I)


RIVER_RGB = (63, 111, 134)


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


def carve_river(E, path, depth, lo):
    """the bed falls all the way: each cell of the path no higher than the one before less 2 m, the channel `depth` below
    the land it crosses, its banks (the 8 neighbours) eased toward the bed; returns (new E, the bed per path cell). `lo` is D['lo'], the format's floor"""
    En = E.copy()
    bed, beds = 1e9, []
    for j, i in path:
        bed = max(min(E[j, i] - depth, bed - 2.0), lo + 1.0)   # no lower than the format's floor
        beds.append(bed)
    for (j, i), b in zip(path, beds):
        En[j, i] = min(En[j, i], b)
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                jj, ii = j + dj, i + di
                if (dj or di) and 0 <= jj < E.shape[0] and 0 <= ii < E.shape[1]:
                    En[jj, ii] = min(En[jj, ii], max(b + depth * 2.5, En[jj, ii] - depth))
    return En, beds


def grid_fields(D):
    VW, VH, OW, OH = D['w'], D['hh'], D['fullW'], D['fullH']
    su, sv = (VW - 1) / (OW - 1), (VH - 1) / (OH - 1)
    h = raster(D, 'h').astype(np.int64)
    E, water = heights(D)                  # D's own lo/hi (4.21 read the constants: hi 17,100 m)
    whas, wlev = water_levels(D)
    ny, nx = E.shape
    gx = np.clip(np.round(np.arange(nx) / su).astype(int), 0, OW - 1)
    gy = np.clip(np.round(np.arange(ny) / sv).astype(int), 0, OH - 1)
    P = (raster(D, 'p', 'L').astype(float) / 255 * 4000)[np.ix_(gy, gx)]
    T = (raster(D, 'tm', 'L').astype(float) - 90)[np.ix_(gy, gx)]
    G = dict(su=su, sv=sv, h=h, E=E, water=water, whas=whas, wlev=wlev, P=P, T=T, P_drawn=P)
    G['evap_k'], G['books'], G['P'] = closed_books(G)
    return G


def closed_books(G):
    """the water books, one sealed basin at a time (the owner: a crater sealed by a mostly airless rim, the ocean to the
    north-west its only outside moisture; the eastern basins walled by airless mountains and very dry).

    The map is cut into basins along ground over BARRIER_M (moist air does not cross it). The basin that touches the
    ocean at the map's edge, the crater, imports the rain within IMPORT_KM of that ocean; evaporation is scaled (k,
    hydro.calibrate) until the rest of its books close. Every other basin is sealed: it can rain only what it evaporates.
    Where the model's rain there is more than that (its generator brought moisture over the rim), the rain the rivers
    run on is scaled down (s) until the basin's books close at the same k; it is never scaled up. The painted rain map
    is left as it is. Returns (k, books, the rain the rivers run on)."""
    E, whas, P, T, wlev = G['E'], G['whas'], G['P'], G['T'], G['wlev']
    air = T > -85
    lab, n = nd.label(whas, structure=np.ones((3, 3)))
    ocean = np.zeros(E.shape, bool)
    for k in range(1, n + 1):
        m = lab == k
        j, i = np.nonzero(m)
        if j.min() == 0 or i.min() == 0 or j.max() == E.shape[0] - 1 or i.max() == E.shape[1] - 1:
            ocean |= m
    S = np.where(whas, np.fmax(wlev, E), E)
    bl, bn = nd.label(air & (S < BARRIER_M), structure=np.ones((3, 3)))
    sizes = nd.sum(np.ones(E.shape), bl, range(1, bn + 1))
    big = [k + 1 for k in range(bn) if sizes[k] >= 50]
    keep = np.isin(bl, big)
    _, (iy, ix) = nd.distance_transform_edt(~keep, return_indices=True)
    basin = np.where(air, bl[iy, ix], 0)            # the high ground drains to the basin it stands over
    main = int(np.bincount(basin[nd.binary_dilation(ocean, iterations=2) & (basin > 0)]).argmax())
    inside = (basin == main) & ~ocean
    near = inside & (nd.distance_transform_edt(~ocean) * (2 / G['su']) < IMPORT_KM)
    imported = float(P[near].sum()) * 1e-3 * 16.04e6 / hydro.SEC_YR
    k = hydro.calibrate(P, T, inside, whas, imported)
    b0, b1 = hydro.budget(P, T, inside, whas, 1.0), hydro.budget(P, T, inside, whas, k)
    books = {'barrier_m': BARRIER_M, 'import_km': IMPORT_KM, 'imported_m3s': round(imported), 'evap_k': round(k, 3),
             'crater': {'turc_alone_left': round(b0[3]), 'rain': round(b1[0]), 'land_evap': round(b1[1]),
                        'water_evap': round(b1[2]), 'left': round(b1[3])}, 'sealed': []}
    Pe = P.copy()
    for bk in big:
        if bk == main:
            continue
        m = basin == bk
        if m.sum() < 150:
            continue
        r0 = hydro.budget(P, T, m, whas, k)
        s_ = 1.0
        if r0[3] > 0:
            lo, hi = 0.0, 1.0
            for _ in range(40):
                s_ = (lo + hi) / 2
                if hydro.budget(P * s_, T, m, whas, k)[3] > 0:
                    hi = s_
                else:
                    lo = s_
            s_ = lo
            Pe[m] = P[m] * s_
        j, i = np.argwhere(m).mean(0)
        books['sealed'].append({'at_px': [round(i / G['su']), round(j / G['sv'])], 'km2': round(float(m.sum()) * 16.04),
                                'rain_mm': round(float(P[m].mean())), 'left_m3s': round(r0[3]), 'rain_scale': round(s_, 3)})
    books['sealed'].sort(key=lambda b: -b['km2'])
    return k, books, Pe


def setup(G):
    E, whas, wlev, P, T = G['E'], G['whas'], G['wlev'], G['P'], G['T']
    ny, nx = E.shape
    R, L = hydro.runoff(P, T, G.get('evap_k', 1.0))
    air = T > -85                         # the page shows the airless rim as -90
    R[~air] = 0.0
    PL = np.where(air, P - L, 0.0)
    S = np.where(whas, np.fmax(wlev, E), E)
    lab, n = nd.label(whas, structure=np.ones((3, 3)))
    sea = np.zeros(E.shape, bool)
    for k in range(1, n + 1):
        m = lab == k
        lv = float(np.nanmedian(wlev[m]))
        j, i = np.nonzero(m)
        at_edge = j.min() == 0 or i.min() == 0 or j.max() == ny - 1 or i.max() == nx - 1
        if abs(lv + 1500) < 1 or (at_edge and abs(lv) < 1):
            sea |= m
    term = sea.copy()
    term[0, :] = term[-1, :] = term[:, 0] = term[:, -1] = True
    F0, _ = hydro.fill(S, term)
    bl, bn = nd.label(whas & ~sea, structure=np.ones((3, 3)))
    closed = np.zeros(E.shape, bool)
    bodies = []
    for k in range(1, bn + 1):
        m = bl == k
        lv, sp = float(np.median(S[m])), float(F0[m].max())
        if sp - lv > CLOSED_M:
            closed |= m
        bodies.append(dict(cells=m, level=lv, spill=sp, closed=sp - lv > CLOSED_M))
    return dict(R=R, L=L, PL=PL, air=air, S=S, sea=sea, term=term | closed, lake=whas & ~sea, bodies=bodies,
                frozen=(T < ICE_T) & air | ~air)


def qcells(acc):
    return acc * 1e-3 * 16.04e6 / hydro.SEC_YR   # mm/yr x 4 km cells -> m3/s


def trace(rt, chan, key):
    """courses on the channel cells: each mouth's main stem traced upstream by the larger `key`, every other branch a
    course of its own that ends where it joins. Returns [(cells downstream-ordered, mouth receiver or None)]"""
    rec = rt['rec']
    ny, nx = chan.shape
    ups = {}
    for j, i in zip(*np.nonzero(chan)):
        a, b = rec[j, i]
        if a >= 0 and chan[a, b]:
            ups.setdefault((a, b), []).append((j, i))
    mouths = [(j, i) for j, i in zip(*np.nonzero(chan)) if rec[j, i][0] < 0 or not chan[tuple(rec[j, i])]]
    mouths.sort(key=lambda c: -key[c])
    out, todo = [], [(c, None) for c in mouths]
    while todo:
        c, joins = todo.pop(0)
        path = [c]
        while True:
            u = ups.get(path[-1], [])
            if not u:
                break
            u = sorted(u, key=lambda x: -key[x])
            for o in u[1:]:
                todo.append((o, path[-1]))
            path.append(u[0])
        path = path[::-1]
        mouth = joins if joins is not None else (tuple(rec[c]) if rec[c][0] >= 0 else None)
        out.append((path, mouth, joins is not None))
    return out


def body_at(lab, x, y, su, sv):
    """the labelled body nearest map px (x, y)"""
    j, i = int(round(y * sv)), int(round(x * su))
    ys, xs = np.nonzero(lab > 0)
    c = np.argmin((ys - j) ** 2 + (xs - i) ** 2)
    return lab == lab[ys[c], xs[c]]


def biggest(m):
    """the largest 8-connected piece of a mask"""
    lab, n = nd.label(m, structure=np.ones((3, 3)))
    return lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1) if n > 1 else m


def cut_channel(En, src, lv, target, blocked, floor=None):
    """the channel from the cells `src` (water at level lv, or a hollow's floor) to any cell of `target`: the course that
    cuts the least ground over lv (Dijkstra), never through `blocked` water. Its sill stays at lv: up to the last ground
    over lv the bed falls 1 m a cell and a hollow on the way is left to fill; beyond it the bed follows the land down.
    The cells beside the cut are eased half way down as its walls. With `floor` (the level of the water it ends in) the
    bed falls evenly from lv to just over floor along the whole course instead, and never under it. Edits En in place;
    returns (path, end, cells cut, deepest cut)."""
    S0 = En
    dist = np.full(En.shape, np.inf)
    prev = {}
    pq = []
    for a, b in zip(*np.nonzero(src)):
        dist[a, b] = 0.0
        pq.append((0.0, a, b))
    heapq.heapify(pq)
    end = None
    while pq:
        d, a, b = heapq.heappop(pq)
        if d > dist[a, b]:
            continue
        if target[a, b] and not src[a, b]:
            end = (a, b)
            break
        for da in (-1, 0, 1):
            for db in (-1, 0, 1):
                c_, e_ = a + da, b + db
                if (da or db) and 0 <= c_ < En.shape[0] and 0 <= e_ < En.shape[1] and not blocked[c_, e_]:
                    nd_ = d + max(0.0, S0[c_, e_] - lv) * math.hypot(da, db) + 1.0
                    if nd_ < dist[c_, e_]:
                        dist[c_, e_] = nd_
                        prev[(c_, e_)] = (a, b)
                        heapq.heappush(pq, (nd_, c_, e_))
    if end is None:
        sys.exit('no channel from %s finds its target' % (tuple(np.argwhere(src)[0]),))
    path = [end]
    while path[-1] in prev:
        path.append(prev[path[-1]])
    path = [p_ for p_ in path[::-1] if not src[p_]]
    path = path[:next((n_ for n_, p_ in enumerate(path) if target[p_]), len(path))]
    ridge = max([n_ for n_, p_ in enumerate(path) if En[p_] > lv] + [-1])
    step = 1.0 if floor is None else (lv - floor - 1.0) / max(len(path), 1)
    bed, cut_most, over = lv - step, 0.0, 0
    for n_, c in enumerate(path):
        bed = bed - step if n_ <= ridge else min(En[c], bed - step)
        if floor is not None:
            bed = max(bed, floor + 1.0)
        if En[c] - bed > 0.5:
            over += 1
            cut_most = max(cut_most, En[c] - bed)
            for dj in (-1, 0, 1):
                for di in (-1, 0, 1):
                    a, b = c[0] + dj, c[1] + di
                    if (dj or di) and not blocked[a, b] and not target[a, b] and En[a, b] > bed:
                        En[a, b] = min(En[a, b], bed + (En[a, b] - bed) * .5)
            En[c] = bed
    return path, end, over, cut_most
