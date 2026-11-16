#!/usr/bin/env python3
"""Scale model 5.1, edit 7 Phēr (2026-11-16): Phēr's headland, cove and stream on the lake's north shore.

    python tools/scale-model/edit_517_pher.py      # after edit_517_gorge.py; run once

The owner, 2026-11-16, in the Phēr plan's session (settlements/pher/PLAN.md section 1.2, claude/pher-plan-55d3f2):
"give it a headland and cove; give it a small stream". Phēr's pin is 843,1491 (spher0000001), on the wall's foot.

- The stream: a new perennial record, 2 m3/s, rising in springs at the scarp's foot (842.5,1477, +133 m) and running
  south down the plain's own slope (column 842 falls all the way, so no channel is cut) and the caldera wall to the
  cove's head on the bench (842.5,1492), into the lake (-520 m). Its name is the owner's to give.
- The headland and the cove are under a cell (1.5 km and 1 km) and go in as landform records, DATA.landforms, for
  core/world to stamp at 1:1 like lf_pleasure_dome_isle: lf_pher_headland (a ridge 1.5 km long running south-east from
  the shore's bend at 839.5,1491, 40-80 m over the lake) and lf_pher_cove (1 km across and 600 m deep, its head at
  842.5,1492 under the pin, opening south-east to the long isle, 10-30 m deep). The stamper in
  openworld/xanadu-oidong-highrift/src/44-world-landforms.js knows islands only so far: these kinds are owed there.
Writes edit_517_pher.report.json.
"""
import os, sys, json, math
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.page as P, smodel.paint as PA   # noqa: E402

LEVEL = -520.0
SRC, HEAD = (842.5, 1477.0), (842.5, 1492.0)
Q = 2.0
LANDFORMS = [
    {'id': 'lf_pher_headland', 'kind': 'headland', 'px': 839.5, 'py': 1491.0, 'to_px': [840.03, 1491.53],
     'length_m': 1500.0, 'width_m': 300.0, 'crest_m': -440.0, 'toe_m': -480.0, 'water_m': LEVEL,
     'note': "Phēr's headland: a ridge 1.5 km long running south-east from the north shore's bend, 80 m over the lake at "
             "its root falling to 40 m at its point, sheltering the cove east of it (the owner, 2026-11-16: \"give it a "
             "headland and cove\"; settlements/pher/PLAN.md 1.2). edit_517_pher."},
    {'id': 'lf_pher_cove', 'kind': 'cove', 'px': 842.5, 'py': 1492.0, 'opens_deg': 135.0,
     'width_m': 1000.0, 'depth_into_shore_m': 600.0, 'bed_m': [-550.0, -530.0], 'water_m': LEVEL,
     'note': "Phēr's cove: its head under the town (843,1491) on the bench, 1 km across and 600 m deep, opening south-east "
             "toward the long isle, 10-30 m deep; the harbour, the stream's mouth at its head (settlements/pher/PLAN.md "
             "1.2). edit_517_pher."},
]


def main():
    D = P.load()
    E, W = P.heights(D)
    assert not any(r['id'] == 'r_pher_stream' for r in D['rivers']), 'run once'
    n = int(math.ceil((HEAD[1] - SRC[1]) / 1.5))
    pts = [[SRC[0], round(SRC[1] + (HEAD[1] - SRC[1]) * k / n, 2)] for k in range(n + 1)]
    wet = [k for k, p in enumerate(pts) if W[int(round(p[1])), int(round(p[0]))]]
    lake_at = [float(int(round(pts[wet[0]][0]))), float(int(round(pts[wet[0]][1])))] if wet else None
    pts = pts[:wet[0]] if wet else pts                 # the course ends on the bench, the lake next to it
    n = len(pts) - 1
    beds, m = [], 1e9
    climb = 0.0
    prev = None
    for p in pts:
        g = float(E[int(round(p[1])), int(round(p[0]))])
        if prev is not None:
            climb = max(climb, g - prev)
        prev = g
        m = min(m, g)
        beds.append(round(m, 1))
    assert lake_at is not None, 'the lake at the cove head'
    i, j = int(lake_at[0]), int(lake_at[1])
    assert not W[1491, 843], 'Phēr dry'
    length = round(sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])) * 2.0, 1)
    rec = {'id': 'r_pher_stream', 'name': 'Phēr stream (to be named)', 'kind': 'stream', 'perennial': True, 'order': 0,
           'length_km': length, 'catchment_km2': 250, 'q_mouth_m3s': Q, 'source_m': beds[0], 'mouth_m': beds[-1],
           'region': None, 'to': {'lake_m': int(LEVEL), 'at_px': [float(i), float(j)]}, 'settlements': ['Phēr'],
           'px': pts, 'bed_m': beds, 'q_m3s': [round(Q * (0.4 + 0.6 * k / n), 2) for k in range(n + 1)],
           'width_m': 6, 'depth_m': 0.5,
           'note': "Phēr's stream: springs at the scarp's foot, south across the plain and down the caldera wall in a "
                   "ravine to the cove's head (the owner, 2026-11-16: \"give it a small stream\"; settlements/pher/PLAN.md "
                   "1.2). A Xanadui Siṭrīm; its name is the owner's to give."}
    D['rivers'].append(rec)
    lf = D.get('landforms') or {'format': 'krator-landforms', 'version': 1, 'landforms': []}
    ids = {l['id'] for l in lf['landforms']}
    lf['landforms'] += [l for l in LANDFORMS if l['id'] not in ids]
    D['landforms'] = lf
    for key in ('st', 't', 'rt', 'ct'):
        D[key] = PA.paint_river(D, key, pts, width=1.0)
    P.save(D)
    rep = {'edit': '5.1 edit 7 Phēr', 'date': '2026-11-16', 'stream': {k: rec[k] for k in
           ('id', 'name', 'length_km', 'source_m', 'mouth_m', 'q_mouth_m3s', 'to')}, 'stream_max_climb_m': round(climb, 1),
           'landforms': [l['id'] for l in LANDFORMS]}
    json.dump(rep, open(os.path.join(HERE, 'edit_517_pher.report.json'), 'w', encoding='utf-8', newline='\n'), indent=1,
              ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False))


if __name__ == '__main__':
    main()
