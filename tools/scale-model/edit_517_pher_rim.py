#!/usr/bin/env python3
"""Scale model 5.1, edit 7 polish for Phēr (2026-11-16): the rim plain behind Phēr raised to the page's.

    python tools/scale-model/edit_517_pher_rim.py          # after edit_517_pher.py; edits the heights and r_pher_swit; once
    python tools/scale-model/edit_517_pher_rim.py --dry    # print the report, write nothing

The owner, 2026-11-16 (settlements/pher/PLAN.md question 17): "do (a)", raise the land behind the rim. Phēr's page
(settlements/pher, its ground in openworld/xanadu-north-shore since step P7) has the caldera wall's top at the lake's
level + 520 m (the world's 0 m) and the rim plain rising about 7 m a km inland; the model's plain behind the same stretch
of the wall falls at the same 7 m a km but stands about 40 m lower (its last plain cell above Phēr at -30 m). So the
model's Swīṭ Siṭrīm (r_pher_swit, edit_517_pher.py) reached the town's band at about -38 m, under the page's plain
where the town's stream rises: core/world 41t could not lead it in without its water climbing.

- **The lift**: every dry plain cell north of the wall's top (a column's last cell at -60 m or over before the wall
  falls) is raised by LIFT_M (40 m) times a fade north (full for the first two cells, nothing 8 cells, 16 km, in) and a
  fade along the shore (full within 5 columns of the stream's 842, nothing past 11). The wall and the lake are left
  alone; the plain still falls to the wall everywhere (the lift fades by about 6 m a cell, under its 13 m a cell fall).
- **The stream**: its bed recomputed on the raised ground by edit_517_pher.stream (the plain's 3 m channel, the
  ravine down the wall, always downhill); its source and mouth with it.
- The temperatures are lapsed with the change (smodel.climate.lapse) and the paint relit (smodel.paint.relight), as
  edit_517_crease.py does.

Regions cut over this ground re-cut after it: openworld/xanadu-north-shore (Phēr's), and openworld/xanadu-oidong-highrift,
whose box (746-1636, 1424-1714) holds it too. Writes edit_517_pher_rim.report.json.
"""
import os, sys, json
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA, smodel.climate as C   # noqa: E402
from edit_517_pher import stream, STREAM_ID   # noqa: E402

LIFT_M = 40.0
STREAM_X = 842
COLS = (830, 856)            # the columns looked at (the fade along the shore ends inside them)
FULL_ALONG, END_ALONG = 5, 11  # columns from the stream: full lift, none
FULL_NORTH, END_NORTH = 1, 8   # cells north of the wall's top: full lift, none
PLAIN_MIN = -60.0            # a plain cell stands at this or over; the wall's first cell falls under it
ROWS = (1470, 1496)


def smooth(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def rim_rows(E, W):
    """{column: the row of its last plain cell before the wall falls south}, scanning south from the scarp's foot."""
    out = {}
    for x in range(COLS[0], COLS[1] + 1):
        for y in range(ROWS[0], ROWS[1]):
            if W[y, x] or W[y + 1, x]:
                break
            if E[y, x] >= PLAIN_MIN and E[y + 1, x] < PLAIN_MIN:
                out[x] = y
                break
    return out


def lift_field(E, W, whas):
    rim = rim_rows(E, W)
    L = np.zeros_like(E)
    for x, yr in rim.items():
        along = 1.0 - smooth(FULL_ALONG, END_ALONG, abs(x - STREAM_X))
        if along <= 0:
            continue
        for y in range(yr - END_NORTH, yr + 1):
            if W[y, x] or whas[y, x]:
                continue
            north = 1.0 - smooth(FULL_NORTH, END_NORTH, yr - y)
            L[y, x] = LIFT_M * along * north
    return rim, L


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E, W = P.heights(D)
    whas, wlev = P.water_levels(D)
    sw = next((r for r in D['rivers'] if r['id'] == STREAM_ID), None)
    if sw is None:
        sys.exit('edit_517_pher_rim: run edit_517_pher.py first (no %s in the data)' % STREAM_ID)
    if sw.get('rim_lift_m'):
        sys.exit('edit_517_pher_rim has already run (%s carries rim_lift_m)' % STREAM_ID)
    rim, L = lift_field(E, W, whas)
    assert STREAM_X in rim, 'the stream\'s column has no wall top in rows %s' % (ROWS,)
    En = E + L
    # the plain still falls to the wall down every lifted column
    for x, yr in rim.items():
        col = [float(En[y, x]) for y in range(yr - END_NORTH - 1, yr + 1)]
        assert all(col[i + 1] < col[i] for i in range(len(col) - 1)), 'column %d no longer falls to the wall: %s' % (x, col)
    ground0, R0 = stream(E)
    ground, R = stream(En)
    beds = R['bed_m']
    assert all(beds[i + 1] < beds[i] for i in range(len(beds) - 1)), 'the stream must run downhill'
    yr = rim[STREAM_X]
    rep = {'edit': '5.1 edit 7 polish: Phēr\'s rim plain', 'date': '2026-11-16', 'lift_m': LIFT_M,
           'rim_rows': {str(x): y for x, y in sorted(rim.items())},
           'cells': int((L > 0.5).sum()), 'max_m': round(float(L.max()), 1),
           'stream_column': [{'py': y, 'before_m': round(float(E[y, STREAM_X]), 1), 'after_m': round(float(En[y, STREAM_X]), 1)}
                             for y in range(yr - END_NORTH - 1, yr + 3)],
           'stream_bed_before_m': R0['bed_m'], 'stream_bed_m': beds}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    if dry:
        return
    lap = C.lapse(D, E, En, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]
    relit, _, _ = PA.relight(D, E, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En)
    for k in ('bed_m', 'source_m', 'mouth_m'):
        sw[k] = R[k]
    sw['rim_lift_m'] = LIFT_M
    sw['note'] = sw['note'] + ' Its plain raised 40 m behind the rim (the owner, 2026-11-16, "do (a)": edit_517_pher_rim.py).'
    P.save(D)
    with open(os.path.join(HERE, 'edit_517_pher_rim.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
