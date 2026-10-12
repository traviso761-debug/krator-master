"""The scale model's hydrology on its height grid: rain to runoff, fill-spill routing with closed basins, discharge.

Used by edit_rivers.py (4.21) to audit the valleys and designate the rivers. Deterministic: no randomness anywhere.

- runoff(P, T): Turc's annual balance. Actual evaporation P / sqrt(0.9 + (P/L)^2), L = 300 + 25 T + 0.05 T^3 (mm/yr,
  T the mean in deg C) its evaporative capacity, which is also taken as open water's evaporation. Runoff = P less it.
- route(S, term, R, PL): the routing. S is the surface (a lake's level where there is water), term the cells that end
  flow (the seas, the map's edge). Every closed hollow is filled to its spill (priority flood) and drains D8 on the
  filled surface; a hollow (or a lake) is one unit whose outflow is its inflow plus the rain on it less the evaporation
  of the lake that would fill it to its spill. A unit whose outflow is negative cannot fill: it is endorheic, and its
  lake stands where its evaporation balances its inflow (grown from its lowest cell in order of level). That lake is
  made terminal and the routing runs again, until no unit is endorheic.
"""
import heapq, math
import numpy as np
from scipy import ndimage as nd

N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
SEC_YR = 3.156e7


def runoff(P, T):
    L = np.maximum(300 + 25 * T + 0.05 * T ** 3, 50.0)
    Ea = P / np.sqrt(0.9 + (P / L) ** 2)
    return np.clip(P - Ea, 0, None), L


def fill(Z, sink):
    """priority flood from the sink cells: every hollow raised to its spill, an epsilon slope across flats.
    Returns the filled surface and the cells in the order they were reached (lowest first)."""
    ny, nx = Z.shape
    F = Z.astype(np.float64).copy()
    done = sink.copy()
    pq = [(F[j, i], j, i) for j, i in zip(*np.nonzero(sink))]
    heapq.heapify(pq)
    order = []
    while pq:
        h, j, i = heapq.heappop(pq)
        order.append((j, i))
        for dj, di in N8:
            a, b = j + dj, i + di
            if 0 <= a < ny and 0 <= b < nx and not done[a, b]:
                done[a, b] = True
                F[a, b] = max(F[a, b], h + 1e-3 * math.hypot(dj, di))
                heapq.heappush(pq, (F[a, b], a, b))
    return F, order


def d8(F, sink):
    """each cell's steepest downhill neighbour on F (rec[...,0] = -1 where it drains nowhere)"""
    ny, nx = F.shape
    Fp = np.pad(F, 1, constant_values=np.inf)
    best = np.zeros(F.shape)
    bk = -np.ones(F.shape, int)
    for k, (dj, di) in enumerate(N8):
        s = (F - Fp[1 + dj:1 + dj + ny, 1 + di:1 + di + nx]) / math.hypot(dj, di)
        m = s > best
        best, bk = np.where(m, s, best), np.where(m, k, bk)
    jj, ii = np.mgrid[0:ny, 0:nx]
    dj = np.array([d[0] for d in N8])
    di = np.array([d[1] for d in N8])
    rec = np.stack([np.where(bk >= 0, jj + dj[bk], -1), np.where(bk >= 0, ii + di[bk], -1)], -1).astype(np.int32)
    rec[sink] = -1
    return rec


def _accumulate(order, rec, w, unit, exit_of):
    """w accumulated down rec in reverse flood order; each unit's outflow (gathered at its exit cell) clamped at 0.
    Returns (acc, raw outflow per unit)"""
    acc = w.astype(np.float64).copy()
    raw = {}
    for j, i in reversed(order):
        a, b = rec[j, i]
        if a < 0:
            continue
        k = unit[j, i]
        if k and unit[a, b] != k:
            e = exit_of[k]
            if (j, i) != e:          # another cell leaving the unit: gathered at the unit's own exit first
                acc[e] += acc[j, i]
                continue
            raw[k] = acc[j, i]
            acc[j, i] = max(acc[j, i], 0.0)
        acc[a, b] += acc[j, i]
    return acc, raw


def route(S, term, R, PL, lake, frozen=None, cap=200.0, force=(), max_iter=12, log=print):
    """the routing with closed basins (module doc). S surface, term terminal cells, R runoff on land (mm/yr), PL rain
    less open-water evaporation (mm/yr), lake the cells holding water. Returns a dict: F, rec, order, acc (mm/yr x
    cells, every unit's outflow clamped), unit (the hollows and lakes of the last pass), S and term (with the endorheic
    lakes added) and ends (one record per endorheic lake: cells, level, the unit it filled).
    frozen: cells whose ground is frozen all year. A hollow whose way out crosses frozen ground while its floor is not
    frozen cannot spill as a river: it is closed whatever its balance. If it would still gain water its lake is drawn
    `cap` m over its floor and flagged unbalanced (its surplus in mm/yr x cells): the model holds more water there than
    the land can lose, which is the owner's to settle (an outlet, a rain shadow, a large lake).
    force: courses (lists of cells, downstream) the flow must follow, each falling all the way (the owner's rivers)."""
    S = S.astype(np.float64).copy()
    term = term.copy()
    ends = []
    for it in range(max_iter):
        F, order = fill(S, term)
        rec = d8(F, term)
        for path in force:
            for a_, b_ in zip(path[:-1], path[1:]):
                assert F[b_] < F[a_], 'a forced course does not fall at %s' % (b_,)
                rec[a_] = b_
        unit, n = nd.label((((F - S) > 0.5) | lake) & ~term, structure=np.ones((3, 3)))
        w = np.where(term, 0.0, np.where((unit > 0), PL, R))
        rank = np.empty(F.shape, np.int64)
        rank[tuple(np.array(order).T)] = np.arange(len(order))
        exit_of = {}
        for j, i in zip(*np.nonzero(unit)):
            a, b = rec[j, i]
            k = unit[j, i]
            if a >= 0 and unit[a, b] != k and (k not in exit_of or rank[j, i] < rank[exit_of[k]]):
                exit_of[k] = (j, i)
        acc, raw = _accumulate(order, rec, w, unit, exit_of)
        bad = set(k for k, v in raw.items() if v < 0)
        shut = set()
        if frozen is not None:
            boxes = nd.find_objects(unit)
            for k, e in exit_of.items():
                sl = boxes[k - 1]
                m = unit[sl] == k
                lowest = np.unravel_index(np.argmin(np.where(m, S[sl], np.inf)), m.shape)
                if frozen[e] and not frozen[sl][lowest] and k not in bad:
                    shut.add(k)
        bad = sorted(bad | shut)
        log('  routing pass %d: %d hollows and lakes, %d endorheic' % (it + 1, n, len(bad)))
        if not bad:
            return dict(F=F, rec=rec, order=order, acc=acc, unit=unit, S=S, term=term, ends=ends, raw=raw)
        boxes = nd.find_objects(unit)
        for k in bad:
            sl = boxes[k - 1]
            m = unit[sl] == k
            Ss, PLs, Rs, lk0 = S[sl], PL[sl], R[sl], lake[sl] & m
            # each cell gives c0 as it stands (an existing lake evaporates, land runs off); one taken into the
            # endorheic lake gives the lake's balance instead. Lakes the growth never reaches stay as they are (perched
            # above it, they drain into it on the next pass).
            c0 = np.where(lk0, PLs, Rs)
            supply = raw[k] - PLs[m].sum() + c0[m].sum()
            seed = np.unravel_index(np.argmin(np.where(m, Ss, np.inf)), Ss.shape)
            body, _ = nd.label(lk0, structure=np.ones((3, 3)))    # an existing lake is taken whole, as drawn
            K = np.zeros(m.shape, bool)
            seen = np.zeros(m.shape, bool)
            seen[seed] = True
            pq = [(Ss[seed], seed[0], seed[1])]
            level = float(Ss[seed])
            floor_ = float(Ss[seed])
            while pq:
                h, j, i = heapq.heappop(pq)
                if K[j, i]:
                    continue
                if k in shut and h > floor_ + cap:
                    break
                cells = np.argwhere(body == body[j, i]) if body[j, i] else np.array([[j, i]])
                d = PLs[j, i] - c0[j, i]
                if K.any() and (supply <= 0 or (supply + d < 0 and h > level)):
                    break
                for j2, i2 in cells:
                    K[j2, i2] = True
                    level = max(level, float(Ss[j2, i2]))
                    for dj, di in N8:
                        a, b = j2 + dj, i2 + di
                        if 0 <= a < m.shape[0] and 0 <= b < m.shape[1] and m[a, b] and not seen[a, b]:
                            seen[a, b] = True
                            heapq.heappush(pq, (Ss[a, b], a, b))
                supply += d
            # the lakes the model draws in the unit stay, at their own levels, and end flow too (a lake drawn larger
            # than its supply, or perched over a dry hollow, is the model's: reported by the audit, not removed)
            grown = K & ~lk0
            Kf = np.zeros(S.shape, bool)
            Kf[sl] = K | lk0
            Gf = np.zeros(S.shape, bool)
            Gf[sl] = grown
            term |= Kf
            S[Gf] = np.maximum(S[Gf], level)
            ends.append(dict(cells=Kf, level=level, spill=float(F[sl][m].max()), had_water=bool((K & lk0).any()),
                             shut=k in shut, surplus=float(max(0.0, supply)) if k in shut else 0.0,
                             unit_cells=int(m.sum())))
    raise SystemExit('routing did not settle in %d passes' % max_iter)


def accumulate_area(order, rec, w):
    """w summed down rec (no clamping): the catchment"""
    acc = w.astype(np.float64).copy()
    for j, i in reversed(order):
        a, b = rec[j, i]
        if a >= 0:
            acc[a, b] += acc[j, i]
    return acc


def strahler(order, rec, chan):
    """Strahler order over the channel cells (0 elsewhere)"""
    so = np.zeros(chan.shape, np.int32)
    top = np.zeros(chan.shape, np.int32)       # the highest order arriving at a cell
    cnt = np.zeros(chan.shape, np.int32)       # how many arrive with it
    for j, i in reversed(order):
        if not chan[j, i]:
            continue
        so[j, i] = max(1, top[j, i] + (1 if cnt[j, i] > 1 else 0))
        a, b = rec[j, i]
        if a >= 0 and chan[a, b]:
            if so[j, i] > top[a, b]:
                top[a, b], cnt[a, b] = so[j, i], 1
            elif so[j, i] == top[a, b]:
                cnt[a, b] += 1
    return so
