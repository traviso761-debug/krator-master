#!/usr/bin/env python3
"""The Stalker Gate's waystation network, routed on the graben floors (openworld/catch-bowl/PLAN.md section 2a).

    python3 openworld/catch-bowl/tools/gate_route.py            # the four branches and their waystations
    python3 openworld/catch-bowl/tools/gate_route.py --json      # the same as JSON for a tune to take

The plan asks for "a trail with `stops`, following the graben floors rather than any straight line", and the straight
lines show why: from Ranger HQ (1420,1242, 1,982 m) the straight line west crosses 4,416 and 4,507 m, and the straight
line south crosses 5,492 and 8,109 m. The province is a four-way transtensional graben pass network through a +14,000 m
massif -- its floors run 1,680 to 2,450 m and its horsts stand over 6,000 m -- so a route is a search, not a line.

THE SEARCH is a least-cost path (Dijkstra, eight-connected) whose cost per step is the ground distance times a penalty
for standing above the floor window: `1 + (max(0, E - FLOOR_TOP) / 300) ** 1.6`. Below FLOOR_TOP the step costs its
distance and nothing more, so the path is free to wander the floors; above it the penalty rises fast enough that a route
takes a long detour rather than a short climb. Water is impassable. The waystations are then placed along the found
route at even intervals, each nudged to the lowest dry cell within 3 px, which is what a bothy wants.

THE SPACING matters and is a decision, not an arithmetic. A post every day's march (24 km) gives twenty-one on the west
branch alone and about sixty over the network, which is more census than the province is meant to carry
(`PLAN-SIM.md` 4d: "no census beyond Ranger HQ's 500 and the waystations' keepers"). But the plan's network is
"bothies, water tanks and fodder bins" -- mostly UNMANNED caches. So `--every <days>` (default 4) spaces the KEPT
posts, and the number of day-marches between them is the number of unmanned bothies on that stretch. Fourteen kept
posts of six to ten keepers each is a province's worth; sixty is a county's.

Every figure this prints is read off `tools/scale-model/model/data` and nothing is hard-coded but the endpoints, which
are the plan's.
"""
import sys, os, json, heapq
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path[:0] = [os.path.join(REPO, 'tools', 'scale-model')]
import smodel.page as P   # noqa: E402

HQ = (1420, 1242)              # Ranger HQ, the hub of all four branches
FLOOR_TOP = 2450.0             # the graben floors' top (PLAN.md 2a: +1,680 to +2,450 m)
BOX = (1230, 1060, 1570, 1440)  # x0, y0, x1, y1: the search window, the province plus a margin
KM_PER_PX = 2.0
DAY_KM = 24.0                  # a laden pack day on a graben trail, under the Catch's 30 on open floor
EVERY_DAYS = 4.0               # days between KEPT posts; the day-marches between them are unmanned bothies
# the plan's four branches. The west one leaves the cut inside it (the supply line); the other three run to the cut's
# edge and stop, since what is beyond them belongs to a later region.
BRANCHES = [
    ('west', (1263, 1089), 'the supply line: everything Ranger HQ eats comes up it'),
    ('northeast', (1520, 1140), "to the Loom Chasms' edge"),
    ('southeast', (1530, 1350), "to the Slabfields' edge"),
    ('south', (1400, 1400), "to the Siphon Pits' edge, by Lake Vapora"),
]


def cost_grid(E, whas):
    over = np.maximum(0.0, E - FLOOR_TOP) / 300.0
    c = 1.0 + over ** 1.6
    c[whas] = np.inf
    return c


def route(cost, a, b):
    """Dijkstra from a to b over an eight-connected grid; returns the path as [(x, y), ...]"""
    x0, y0, x1, y1 = BOX
    W, H = x1 - x0, y1 - y0
    idx = lambda x, y: (y - y0) * W + (x - x0)
    dist = np.full(W * H, np.inf)
    prev = np.full(W * H, -1, dtype=np.int64)
    s = idx(*a)
    dist[s] = 0.0
    q = [(0.0, s)]
    goal = idx(*b)
    steps = [(-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
             (-1, -1, 1.4142), (1, -1, 1.4142), (-1, 1, 1.4142), (1, 1, 1.4142)]
    while q:
        d, u = heapq.heappop(q)
        if u == goal:
            break
        if d > dist[u]:
            continue
        ux, uy = x0 + u % W, y0 + u // W
        for dx, dy, w in steps:
            vx, vy = ux + dx, uy + dy
            if not (x0 <= vx < x1 and y0 <= vy < y1):
                continue
            c = cost[vy, vx]
            if not np.isfinite(c):
                continue
            v = idx(vx, vy)
            nd = d + w * c
            if nd < dist[v]:
                dist[v] = nd
                prev[v] = u
                heapq.heappush(q, (nd, v))
    if not np.isfinite(dist[goal]):
        return None
    path, u = [], goal
    while u != -1:
        path.append((x0 + u % W, y0 + u // W))
        u = prev[u]
    return path[::-1]


def nudge(E, whas, x, y, r=3):
    """the best dry cell within r: low, and NEAR WATER where there is any, because a kept post wants a tank it can fill.
    Scored as the elevation plus 40 m a kilometre of distance to water, so a post trades 400 m of height for 10 km of
    carry -- which is the trade a keeper actually makes."""
    best = None
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            px, py = x + dx, y + dy
            if whas[py, px]:
                continue
            e = float(E[py, px])
            wk = water_km(whas, px, py, most=10)
            s = e + 40.0 * (wk if wk is not None else 30.0)
            if best is None or s < best[3]:
                best = (px, py, e, s)
    return best[0], best[1], best[2]


def water_km(whas, x, y, most=20):
    for r in range(1, most + 1):
        if whas[max(0, y - r):y + r + 1, max(0, x - r):x + r + 1].any():
            return r * KM_PER_PX
    return None


def main():
    as_json = '--json' in sys.argv
    D = P.load()
    E, _ = P.heights(D)
    whas, _ = P.water_levels(D)
    cost = cost_grid(E, whas)
    out = {'hq': {'px': list(HQ), 'm': round(float(E[HQ[1], HQ[0]]), 1),
                  'water_km': water_km(whas, *HQ), 'floor_top_m': FLOOR_TOP}, 'branches': []}
    for name, end, note in BRANCHES:
        p = route(cost, HQ, end)
        if not p:
            out['branches'].append({'branch': name, 'error': 'no route'})
            continue
        es = np.array([float(E[y, x]) for x, y in p])
        km = 0.0
        for (ax, ay), (bx, by) in zip(p[:-1], p[1:]):
            km += KM_PER_PX * (1.4142 if ax != bx and ay != by else 1.0)
        straight = KM_PER_PX * float(np.hypot(end[0] - HQ[0], end[1] - HQ[1]))
        # kept posts every EVERY_DAYS of travel, and at least one
        ev = EVERY_DAYS
        for i, a in enumerate(sys.argv):
            if a == '--every' and i + 1 < len(sys.argv):
                ev = float(sys.argv[i + 1])
        n = max(1, int(round(km / (DAY_KM * ev))) - 1)
        stations = []
        for k in range(1, n + 1):
            want = km * k / (n + 1)
            run, j = 0.0, 0
            for i, ((ax, ay), (bx, by)) in enumerate(zip(p[:-1], p[1:])):
                run += KM_PER_PX * (1.4142 if ax != bx and ay != by else 1.0)
                if run >= want:
                    j = i + 1
                    break
            nx, ny, ne = nudge(E, whas, *p[j])
            stations.append({'px': [int(nx), int(ny)], 'm': round(ne, 1), 'water_km': water_km(whas, nx, ny),
                             'km_from_hq': round(want)})
        out['branches'].append({
            'branch': name, 'note': note, 'to': list(end), 'road_km': round(km), 'straight_km': round(straight),
            'winding': round(km / straight, 2) if straight else None,
            'median_m': round(float(np.median(es))), 'max_m': round(float(es.max())),
            'pct_over_floor_top': round(100.0 * float((es > FLOOR_TOP).mean()), 1),
            'days': round(km / DAY_KM, 1), 'kept_every_days': ev,
            'bothies_between': max(0, int(round(km / DAY_KM)) - len(stations)), 'waystations': stations,
            '_path': [(int(c[0]), int(c[1])) for c in p]})
    # where two branches share their first stretch they are one trunk that forks, not two branches
    paths = {b['branch']: b.pop('_path') for b in out['branches'] if '_path' in b}
    names = list(paths)
    for i, a in enumerate(names):
        for b2 in names[i + 1:]:
            pa, pb = paths[a], paths[b2]
            k = 0
            while k < min(len(pa), len(pb)) and pa[k] == pb[k]:
                k += 1
            if k > 8:
                km = KM_PER_PX * k
                out.setdefault('forks', []).append({'a': a, 'b': b2, 'shared_px': int(k), 'shared_km': round(km),
                                                    'forks_at': [int(pa[k - 1][0]), int(pa[k - 1][1])]})
    if as_json:
        print(json.dumps(out, ensure_ascii=False, indent=1))
        return
    h = out['hq']
    print('Ranger HQ px %d,%d: %.0f m, water %s km. The floors\' top is %.0f m.'
          % (h['px'][0], h['px'][1], h['m'], h['water_km'], h['floor_top_m']))
    for b in out['branches']:
        if 'error' in b:
            print('%-10s %s' % (b['branch'], b['error']))
            continue
        print('\n%s branch -- %s' % (b['branch'].upper(), b['note']))
        print('  %d km of road for %d km straight (winding %.2f), %.1f days; median %d m, max %d m, %.1f %% over the floors'
              % (b['road_km'], b['straight_km'], b['winding'], b['days'], b['median_m'], b['max_m'], b['pct_over_floor_top']))
        print('  %d kept posts every %.0f days, with %d unmanned bothies between them'
              % (len(b['waystations']), b['kept_every_days'], b['bothies_between']))
        for s in b['waystations']:
            print('    waystation px %d,%d  %6.0f m  water %s km  (%d km out)'
                  % (s['px'][0], s['px'][1], s['m'], s['water_km'] if s['water_km'] else '>40', s['km_from_hq']))
    for f in out.get('forks', []):
        print('\nFORK: the %s and %s branches share their first %d km and part at px %d,%d -- one trunk, not two branches'
              % (f['a'], f['b'], f['shared_km'], f['forks_at'][0], f['forks_at'][1]))


if __name__ == '__main__':
    main()
