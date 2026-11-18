#!/usr/bin/env python3
"""Scale model 5.1, edit 7 gorge (2026-11-16): the Alph's gorge below Theodiga without its pits.

    python tools/scale-model/edit_517_gorge.py     # after edit_517_alph.py; run once

The Alph's gorge below Theodiga's broken dam falls from about -616 m to -1,530 m at Qiblai's lake (-1,685 m), but the
cells of r070's recorded points were cut to its old bed, -2,025 m: single-cell pits 400-1,500 m deep, with the gorge's
own floor between them (they read as a slot under the lake). The owner, 2026-11-16, chose to fill them so the river
falls ("Fill pits, river falls"). Each dry cell along the course from the breach down that stands more than 100 m under
both the course cells either side of it is raised to the lower of them; then the course falls all the way (each cell
under the one above it), the record's beds are sampled again (falling), and the temperatures lapse with the change.
Writes edit_517_gorge.report.json.
"""
import os, sys, json
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.climate as C   # noqa: E402
from edit_517 import cells_along   # noqa: E402

LAKE_LEVEL = -1685.0                    # Qiblai's lake
START = (910.0, 1538.0)                 # px: the breach's foot, where the gorge begins


def main():
    D = P.load()
    E, W = P.heights(D)
    whas, wlev = P.water_levels(D)
    a = next(r for r in D['rivers'] if r['id'] == 'r070')
    k0 = max(0, int(np.argmin([np.hypot(p[0] - START[0], p[1] - START[1]) for p in a['px']])) - 1)   # from the point above
    seen, course = set(), []
    for c in cells_along(a['px'][k0:]):
        if c not in seen:
            seen.add(c)
            course.append(c)
    on = np.zeros(E.shape, bool)
    for c in course:
        on[c] = True
    En = E.copy()
    pits = []
    for k in range(1, len(course) - 1):
        (j, i), up, dn = course[k], course[k - 1], course[k + 1]
        if whas[j, i] or whas[up] or whas[dn]:
            continue
        lo = min(E[up], E[dn])
        if E[j, i] < lo - 100.0:                     # under both its course neighbours: a pit, not the gorge's floor
            pits.append([i, j, round(float(E[j, i])), round(float(lo))])
            En[j, i] = lo
    falls = 0
    prev = None
    for c in course:
        if whas[c]:
            break
        if prev is not None and (En[c] > prev - 0.3 or En[c] < LAKE_LEVEL):   # dry cells under the lake's level:
            En[c] = prev - 0.3                                               # the cut to reach it, raised to fall on
            falls += 1
        prev = En[c]
    # the record's beds, falling, on the new ground
    b, m = [], 1e9
    for p in a['px']:
        m = min(m, float(En[int(round(p[1])), int(round(p[0]))]))
        b.append(round(m, 1))
    was = {'bed_m_last': a['bed_m'][-1], 'mouth_m': a.get('mouth_m')}
    a['bed_m'] = b
    a['mouth_m'] = b[-1]
    lap = C.lapse(D, E, En, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    D['h'] = P.encode_heights(D, En)
    P.save(D)
    rep = {'edit': '5.1 edit 7 gorge', 'date': '2026-11-16', 'course_cells': len(course), 'pits_filled': pits,
           'cells_lowered_to_fall': falls, 'alph_was': was, 'alph_now': {'bed_m': [b[k0], b[-1]], 'mouth_m': b[-1],
                                                                        'to': a['to']}}
    json.dump(rep, open(os.path.join(HERE, 'edit_517_gorge.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
