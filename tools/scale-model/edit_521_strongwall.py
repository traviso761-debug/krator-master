#!/usr/bin/env python3
"""Scale model 5.1 edit 9 (edit_521_strongwall.py, 2026-11-23): Strongwall's W0 and V0 (settlements/strongwall/PLAN.md,
on claude/strongwall-plan-c1ee33; the owner said yes to asking, 2026-11-23).

    python tools/scale-model/edit_521_strongwall.py [--dry]

1. **The slot kept** (the owner, 2026-11-16: "keep the slot as a natural moat"). Row 1641, x 913-922, the fault trough
   at the scarp's foot that the plan was measured on (316 m at 913, -8 m at 916, -356 m at 918, -347 m at 920), was half
   filled the same day by edit_517_crease.py, whose blur along Qiblai's old stamp edge (y 1639.5, x 906-1001) reached
   rows 1638-1641. Those four rows go back to their heights before the crease from x 904 to 922 (the fort's bench and
   the slot), fading to today's over x 923-927; the crease stays east of that.
2. **The pit** at 913-915, 1633-1635 (to -351 m, the old pin's cell) filled from its rim to the bench.
3. **The pins** (SETT_ADDED / defSetts, reconcile 5.1e15, done by the page's own file): the six watch posts and the
   House of the Tempest with its west-brow lookout. Not this script: it writes the rasters and the report.
Then the temperatures are lapsed with the change and the paint relit. The report gives each pin's ground and every
line of sight the plan asks for (each post to the one before it; the monastery and its lookout to Strongwall and the
posts), a 10 m tower at each end, the earth's curve with refraction (k 0.13).
Refuses to run twice (the pit's middle cell is its marker).
"""
import os, sys, json, math
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C   # noqa: E402

X0 = 904   # first column of PRE
PRE = {1638: [1374.2, 1284.8, 772.1, 706.7, 668.7, 652.5, 635.7, 619.0, 601.4, 584.3, 568.0, 554.0, 543.6, 537.3, 536.4, 539.1, 544.5, 551.3, 557.2, 561.2, 563.9, 565.7, 566.6, 568.0], 1639: [1798.3, 1685.0, 912.6, 844.9, 761.3, 716.6, 704.4, 690.8, 675.5, 658.8, 641.2, 625.4, 612.7, 604.6, 601.4, 602.3, 605.5, 610.0, 614.1, 617.2, 619.0, 619.9, 620.8, 621.3], 1640: [2280.7, 2147.5, 1048.6, 984.4, 905.4, 816.4, 778.0, 768.1, 755.0, 738.7, 721.1, 703.9, 689.5, 679.1, 673.2, 670.5, 670.1, 671.0, 671.9, 672.3, 673.7, 675.0, 704.8, 728.8], 1641: [2600.0, 2465.4, 2262.2, 2032.3, 1722.0, 1437.9, 1142.5, 825.0, 559.9, 315.5, 216.1, 114.1, -7.9, -143.8, -356.1, -505.2, -347.1, -182.2, 30.5, 239.2, 354.8, 443.8, 497.5, 508.4]}
FULL_TO, FADE_TO = 922, 927
PIT = [(x, y) for x in (913, 914, 915) for y in (1633, 1634, 1635)]

FORT = ('Strongwall', 912, 1640)
POSTS = [('G1, the Brow post', 917, 1648, 'fort'), ('G2, the Cold post', 911, 1653, 'G1, the Brow post'),
         ('G3, the Lode post', 915, 1664, 'G2, the Cold post'), ('R1, the Fan post', 906, 1635, 'fort'),
         ('R2, the Bench-end post', 905, 1626, 'R1, the Fan post'), ('R3, the Rift post', 894, 1624, 'R2, the Bench-end post')]
TEMPEST = ('the House of the Tempest', 886, 1619)
LOOKOUT = ('its west-brow lookout', 879, 1618)
EYE, R_EFF, CELL = 10.0, 6371000.0 / (1 - 0.13), 2000.0


def ground(Es, x, y):
    x0, y0 = int(math.floor(x)), int(math.floor(y)); fx, fy = x - x0, y - y0
    g = lambda i, j: float(Es[j, i])
    return (g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy


def sight(Es, a, b):
    (ax, ay), (bx, by) = a, b
    d = math.hypot(bx - ax, by - ay) * CELL
    ha, hb = float(Es[ay, ax]) + EYE, float(Es[by, bx]) + EYE
    n = max(8, int(d / 250.0))
    worst = (1e9, None)
    for k in range(1, n):
        t = k / n
        x, y = ax + (bx - ax) * t, ay + (by - ay) * t
        line = ha + (hb - ha) * t - (t * d) * ((1 - t) * d) / (2 * R_EFF)
        c = line - ground(Es, x, y)
        if c < worst[0]:
            worst = (c, (round(x, 2), round(y, 2)))
    return {'km': round(d / 1000, 1), 'clear_m': round(worst[0], 1), 'tightest_at': worst[1], 'sees': worst[0] > 0}


def main():
    D = P.load()
    E, W = P.heights(D)
    whas, wlev = P.water_levels(D)
    if float(E[1634, 914]) > 0:
        sys.exit('edit_521_strongwall has run already (the pit at 914,1634 is filled)')
    En = E.copy()
    rep = {'edit': '5.1 edit 9 (Strongwall W0, V0)', 'date': '2026-11-23'}
    # 1. the slot: the rows before the crease, x 904-922, fading over 923-927
    moved = 0
    for j, vals in PRE.items():
        for k, v in enumerate(vals):
            i = X0 + k
            w = 1.0 if i <= FULL_TO else max(0.0, (FADE_TO + 1 - i) / (FADE_TO + 1 - FULL_TO))
            nv = En[j, i] + w * (v - En[j, i])
            moved += abs(nv - En[j, i]) > 0.5
            En[j, i] = nv
    rep['slot'] = {'rows': sorted(PRE), 'full_x': [X0, FULL_TO], 'fade_x': [FULL_TO + 1, FADE_TO], 'cells_moved': int(moved),
                   'row_1641': {str(i): round(float(En[1641, i])) for i in range(912, 923)}}
    # 2. the pit: each cell from its rim, a relaxed fill (Laplace) to the bench
    pit = np.zeros(E.shape, bool)
    for x, y in PIT:
        pit[y, x] = True
    for _ in range(400):
        avg = (np.roll(En, 1, 0) + np.roll(En, -1, 0) + np.roll(En, 1, 1) + np.roll(En, -1, 1)) / 4.0
        En[pit] = avg[pit]
    rep['pit'] = {'cells': PIT, 'was_min_m': round(float(E[pit].min())), 'now_m': [round(float(En[y, x])) for x, y in PIT]}
    if '--dry' not in sys.argv:
        lap = C.lapse(D, E, En, whas, wlev)
        for k in C.TEMPS:
            D[k] = lap[k]
        relit, _, _ = PA.relight(D, E, En)
        for k, v in relit.items():
            D[k] = v
        D['h'] = P.encode_heights(D, En)
        P.save(D)
    Es = np.where(whas, np.maximum(En, np.nan_to_num(wlev, nan=-1e9)), En)
    pts = {'fort': (FORT[1], FORT[2])}
    for nm, x, y, _ in POSTS:
        pts[nm] = (x, y)
    rep['ground_m'] = {nm: {'px': list(p), 'ground_m': round(float(En[p[1], p[0]])), 'wet': bool(whas[p[1], p[0]])}
                       for nm, p in list(pts.items()) + [(TEMPEST[0], TEMPEST[1:]), (LOOKOUT[0], LOOKOUT[1:])]}
    rep['posts'] = {nm: dict(sight(Es, (x, y), pts[prev]), to=prev) for nm, x, y, prev in POSTS}
    rep['tempest'] = {to: sight(Es, TEMPEST[1:], p) for to, p in pts.items()}
    rep['lookout'] = {to: sight(Es, LOOKOUT[1:], p) for to, p in pts.items()}
    rep['tempest_to_lookout'] = sight(Es, TEMPEST[1:], LOOKOUT[1:])
    if '--dry' not in sys.argv:
        json.dump(rep, open(os.path.join(HERE, 'edit_521_strongwall.report.json'), 'w', encoding='utf-8', newline='\n'),
                  indent=1, ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
