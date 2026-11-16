#!/usr/bin/env python3
"""Scale model 5.1, edit 7 crease (2026-11-16): the straight crease in the heights across the Twins' north-west.

    python tools/scale-model/edit_517_crease.py     # after edit_517.py, before edit_517_paint.py; run once

The owner, 2026-11-16: "i can still see linear artifact by the twins to the NW, and around Xanadu, as well as still a
bit in the qiblai basin".

- The Twins: a straight crease in the heights (a slope break of 150-350 m over a cell) runs ~100 px from 985,1419 to
  918,1493 across the Twins' north-west. Within 2.5 px of it the heights are blended toward their 1.3-px blur (dry land
  only), and the same along the south edge of the old stamp round Qiblai's basin (y 1639-1640); the temperatures are lapsed with the change (smodel.climate.lapse) and the paint relit (smodel.paint.relight).
Writes edit_517_crease.report.json.
"""
import os, sys, json
import numpy as np
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C   # noqa: E402

CREASES = [((985.0, 1419.0), (918.0, 1493.0)),   # the Twins' north-west
           ((906.0, 1639.5), (1001.0, 1639.5))]   # Qiblai's basin: its old stamp's south edge
CREASE_R, CREASE_SIG = 2.5, 1.3
def seg_dist(xx, yy, a, b):
    (ax, ay), (bx, by) = a, b
    dx, dy = bx - ax, by - ay
    t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / (dx * dx + dy * dy), 0, 1)
    return np.hypot(ax + t * dx - xx, ay + t * dy - yy)


def main():
    D = P.load()
    E, W = P.heights(D)
    whas, wlev = P.water_levels(D)
    rep = {'edit': '5.1 edit 7 crease', 'date': '2026-11-16'}
    # ---- the Twins' crease
    yy, xx = np.mgrid[0:E.shape[0], 0:E.shape[1]].astype(float)
    dist = np.min([seg_dist(xx, yy, *c) for c in CREASES], 0)
    w = np.clip(1 - dist / CREASE_R, 0, 1) * ~W * ~whas
    En = E + w * (nd.gaussian_filter(E, CREASE_SIG) - E)
    ch = np.abs(En - E)
    rep['crease'] = {'from_to_px': CREASES, 'cells': int((ch > 0.5).sum()), 'max_change_m': round(float(ch.max())),
                     'mean_change_m': round(float(ch[ch > 0.5].mean()), 1)}
    lap = C.lapse(D, E, En, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    relit, _, _ = PA.relight(D, E, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En)
    P.save(D)
    json.dump(rep, open(os.path.join(HERE, 'edit_517_crease.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1)
    print(json.dumps(rep, indent=1))


if __name__ == '__main__':
    main()
