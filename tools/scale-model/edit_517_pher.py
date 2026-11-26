#!/usr/bin/env python3
"""Scale model 5.1, edit 7 polish for Phēr (2026-11-16): the north shore's fair gets its headland, cove and stream.

    python tools/scale-model/edit_517_pher.py          # after the edit 7 re-run (5f659c054); edits landforms, rivers; once
    python tools/scale-model/edit_517_pher.py --dry    # print the report, write nothing

The owner, 2026-11-16 (settlements/pher/PLAN.md section 7): "give it a headland and cove; give it a small stream".
Phēr stands at 843,1491, on the foot of the caldera's north wall (the shore bench at -500 m, the lake at -520 m). The
lake there is a smooth diagonal shore with the bed 150 m down 4 km out, so the boats need a cove.

Both are finer than the 2 km cells, so they are records, not raster edits (the islets' way, 41l-world-landforms.js):
- **The headland**: two `island` records joined to the shore at the bend west of the town, the arm running south-east
  about 1.5 km into the lake, 50-80 m over the water. The stamp only raises ground (Math.max), so the arm meets the bench
  without cutting it.
- **The east point**: a small `islet` record off the strand east of the pin. The cove is the water between the arm and the
  point, about 1 km across, with the town's strand round its head.
- **The stream** (Swīṭ Siṭrīm, "sweet stream", a coined Xanadui name: the owner, 2026-11-16, "coined name"): a perennial
  `rivers.json` record of ~2 m3/s from springs at the scarp's foot (842,1477, ~130 m) south across the rim plain, which
  falls 6-7 m a km toward the lake, and down the wall in a ravine to the cove's head. Its bed is the ground less a few
  metres on the plain and a ravine 30-40 m deep down the wall; every step is downhill.

The records' places are the plan's; the region cut (settlements/pher/PLAN.md step P2) checks them at 1:1 (WLAND.check,
the stream's bed) and may move them. No raster changes; the pin is in model/src/60-settlements.js (SETT_ADDED '5.1e13').
Writes edit_517_pher.report.json.
"""
import os, sys, json, math
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P   # noqa: E402

PIN = (843, 1491)
LAKE = -520.0
HEADLAND = [   # (id, kind, px, py, r_m, crest_m): the arm from the bend (840.6,1491.2) to its tip (841.1,1491.7)
    ('lf_pher_headland', 'island', 840.65, 1491.2, 520.0, -440.0),
    ('lf_pher_headland_tip', 'island', 841.05, 1491.65, 320.0, -470.0)]
EAST_POINT = ('lf_pher_east_point', 'islet', 842.75, 1492.15, 240.0, -495.0)
STREAM_ID, STREAM_NAME = 'r_pher_swit', 'Swīṭ Siṭrīm'
# the stream's course: down the 842 column across the rim plain, then the wall to the cove's head
COURSE = [(842.0, 1477.0), (842.0, 1478.0), (842.0, 1479.0), (842.0, 1480.0), (842.0, 1481.0), (842.0, 1482.0),
          (842.0, 1483.0), (842.0, 1484.0), (842.0, 1485.0), (842.0, 1486.0), (842.0, 1487.0), (842.0, 1488.0),
          (842.0, 1489.0), (842.1, 1490.0), (842.2, 1491.0), (842.25, 1491.55)]


def bil(E, x, y):
    x0, y0 = int(math.floor(x)), int(math.floor(y))
    fx, fy = x - x0, y - y0
    return float((E[y0, x0] * (1 - fx) + E[y0, x0 + 1] * fx) * (1 - fy) + (E[y0 + 1, x0] * (1 - fx) + E[y0 + 1, x0 + 1] * fx) * fy)


def stream(E):
    ground = [bil(E, x, y) for x, y in COURSE]
    bed = []
    for i, g in enumerate(ground):
        cut = 3.0 if g > -20 else 35.0          # a plain channel, then the ravine down the wall
        b = max(g - cut, LAKE + 2.0)            # over the lake until the mouth
        if i == len(COURSE) - 1:
            b = LAKE                            # the mouth, at the lake's level
        elif bed and b >= bed[-1]:
            b = bed[-1] - 0.5                   # always downhill
        bed.append(round(b, 1))
    n = len(COURSE)
    q = [round(0.4 + 1.6 * i / (n - 1), 2) for i in range(n)]      # springs to ~2 m3/s at the mouth
    km = sum(math.hypot(COURSE[i + 1][0] - COURSE[i][0], COURSE[i + 1][1] - COURSE[i][1]) for i in range(n - 1)) * 2.0
    return ground, {
        'id': STREAM_ID, 'name': STREAM_NAME, 'kind': 'river', 'perennial': True, 'order': 0,
        'length_km': round(km, 1), 'catchment_km2': 250, 'q_mouth_m3s': q[-1],
        'source_m': bed[0], 'mouth_m': bed[-1], 'region': 'Vale of Xanadu',
        'to': {'lake_m': LAKE, 'at_px': [COURSE[-1][0], COURSE[-1][1]]}, 'settlements': ['Phēr'],
        'px': [[x, y] for x, y in COURSE], 'bed_m': bed, 'q_m3s': q, 'width_m': 8, 'depth_m': 0.6,
        'tongue': 'xanadui', 'gloss': 'Swīṭ (sweet) + Siṭrīm (stream): the fair town\'s fresh water',
        'note': 'Added 2026-11-16 (the owner: "give it a small stream"; "coined name"): springs at the scarp\'s foot, the '
                'rim plain, a ravine down the caldera wall to Phēr\'s cove. settlements/pher/PLAN.md, edit_517_pher.py.'}


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E, W = P.heights(D)
    lf = D['landforms']['landforms']
    if any(l_['id'] == 'lf_pher_headland' for l_ in lf) or any(r_['id'] == STREAM_ID for r_ in D['rivers']):
        sys.exit('edit_517_pher has already run (lf_pher_headland / %s are in the data)' % STREAM_ID)
    rep = {'edit': '5.1 edit 7 polish: Phēr', 'date': '2026-11-16', 'pin': {'px': list(PIN),
           'ground_m': round(float(E[PIN[1], PIN[0]]), 1), 'wet': bool(W[PIN[1], PIN[0]]),
           'bench_south_m': round(float(E[PIN[1] + 1, PIN[0]]), 1), 'lake_two_south': bool(W[PIN[1] + 2, PIN[0]])}}
    assert not W[PIN[1], PIN[0]] and W[PIN[1] + 2, PIN[0]], 'the pin must be dry with the lake two cells south'
    recs = []
    for i_, k_, x_, y_, r_, c_ in HEADLAND + [EAST_POINT]:
        recs.append({'id': i_, 'kind': k_, 'px': x_, 'py': y_, 'r_m': r_, 'crest_m': c_, 'water_m': LAKE,
                     'note': ('Phēr\'s headland (the owner, 2026-11-16: "give it a headland and cove"): the arm from the '
                              'shore\'s bend west of the town, its rise joining the bench; the cove lies east of it. '
                              if 'headland' in i_ else
                              'The low point east of Phēr\'s cove, closing it to about 1 km across. ')
                     + 'settlements/pher/PLAN.md section 1.2, edit_517_pher.py.'})
        rep.setdefault('landforms', []).append({'id': i_, 'kind': k_, 'px': [x_, y_], 'r_m': r_, 'crest_m': c_,
                                                'cell_m': round(float(E[int(y_), int(x_)]), 1),
                                                'cell_wet': bool(W[int(y_), int(x_)])})
    ground, R = stream(E)
    beds = R['bed_m']
    assert all(beds[i + 1] < beds[i] for i in range(len(beds) - 1)), 'the stream must run downhill'
    assert all(b_ <= g_ for b_, g_ in zip(beds[:-1], ground[:-1])), 'the bed lies under the ground until the mouth'
    assert not any(W[int(y), int(x)] for x, y in R['px'][:-1]), 'the stream is on land until its mouth'
    rep['stream'] = {'id': STREAM_ID, 'name': STREAM_NAME, 'length_km': R['length_km'], 'q_mouth_m3s': R['q_mouth_m3s'],
                     'ground_m': [round(g_, 1) for g_ in ground], 'bed_m': beds}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    if dry:
        return
    lf.extend(recs)
    D['rivers'].append(R)
    P.save(D)
    with open(os.path.join(HERE, 'edit_517_pher.report.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rep, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
