#!/usr/bin/env python3
"""Scale model 5.1, edit 7 Alph (2026-11-16): the Alph carried on into Qiblai's lake.

    python tools/scale-model/edit_517_alph.py      # after edit_517_paint.py; run once

The owner, 2026-11-16: "make sure the river alph still connects the two lakes". The Alph (r070) leaves Erewhon's lake at
its east tip (edit 7) and falls through the Vale, Theodiga's breach and its gorge, but its course stopped 7 px short of
Qiblai's lake ("the Lower Xanadu Small Lake", -1,685 m), in its gorge's slot (-2,025 m), and its record's mouth named a
lake of -1,706 m at 930.9,1553.8, on dry ground (928 m): both so on main before edit 7. Here the course goes on from
its last point to the lake's nearest wet cell; the cells between are cut to the slot's floor (the gorge meets the lake;
no climb), the record's beds, length and mouth follow, `to` names the lake at its level, and the river is drawn on the
painted maps. Writes edit_517_alph.report.json.
"""
import os, sys, json, math
import numpy as np
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C   # noqa: E402
from edit_517 import cells_along   # noqa: E402

LAKE_LEVEL = -1685.0
SEEK = (930, 1000, 1580, 1615)          # x0, x1, y0, y1: where Qiblai's lake lies


def main():
    D = P.load()
    E, W = P.heights(D)
    whas, wlev = P.water_levels(D)
    a = next(r for r in D['rivers'] if r['id'] == 'r070')
    end = a['px'][-1]
    x0, x1, y0, y1 = SEEK
    lk = np.zeros(E.shape, bool)
    lk[y0:y1, x0:x1] = whas[y0:y1, x0:x1] & (np.abs(np.nan_to_num(wlev[y0:y1, x0:x1], nan=0) - LAKE_LEVEL) <= 5)
    jj, ii = np.nonzero(lk)
    k = int(np.argmin(np.hypot(ii - end[0], jj - end[1])))
    tgt = [float(ii[k]), float(jj[k])]
    gap = math.hypot(tgt[0] - end[0], tgt[1] - end[1])
    rep = {'edit': '5.1 edit 7 Alph', 'date': '2026-11-16', 'from': end, 'to_lake_cell': tgt, 'gap_px': round(gap, 1),
           'to_was': a.get('to'), 'mouth_m_was': a.get('mouth_m')}
    assert not a.get('to', {}).get('lake_m') == LAKE_LEVEL or gap > 1.5, 'run once'
    n = max(1, int(math.ceil(gap / 1.5)))
    add = [[round(end[0] + (tgt[0] - end[0]) * t / n, 2), round(end[1] + (tgt[1] - end[1]) * t / n, 2)] for t in range(1, n + 1)]
    floor = float(min(a['bed_m'][-1], E[int(round(end[1])), int(round(end[0]))]))
    En = E.copy()
    cut = []
    for c in cells_along([end] + add):
        if lk[c]:
            break
        if En[c] > floor:
            cut.append([int(c[1]), int(c[0]), round(float(En[c]))])
            En[c] = floor
    add = [p for p in add if not lk[int(round(p[1])), int(round(p[0]))]] or add[:1]   # the course stops at the shore
    rep['cells_cut_to_m'] = round(floor, 1)
    rep['cells_cut'] = cut
    # the record
    q = list(a['q_m3s'])
    a['px'] = a['px'] + add
    a['q_m3s'] = q + [q[-1]] * len(add)
    floor = round(floor, 1)
    a['bed_m'] = a['bed_m'] + [floor] * len(add)
    a['length_km'] = round(a['length_km'] + math.hypot(add[-1][0] - end[0], add[-1][1] - end[1]) * 2.0, 1)
    a['mouth_m'] = floor
    a['to'] = {'lake_m': int(LAKE_LEVEL), 'at_px': tgt, 'name': "Qiblai's lake (the Lower Xanadu Small Lake)"}
    rep['to_now'] = a['to']
    # heights, temperatures (lapsed with the cut), the river drawn
    lap = C.lapse(D, E, En, whas, wlev)
    for kk in C.TEMPS:
        D[kk] = lap[kk]
    D['h'] = P.encode_heights(D, En)
    for key in ('st', 't', 'rt', 'ct'):
        D[key] = PA.paint_river(D, key, [end] + add)
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_517_alph.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
