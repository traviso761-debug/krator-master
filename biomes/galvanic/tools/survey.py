#!/usr/bin/env python3
"""The station survey on scale model 5.1 (PLAN.md section 5): heights, water, classes, rain and temperatures round a point.

    python3 biomes/galvanic/tools/survey.py [px py]        # default: the vent at 5.1 px 801,1573

Reads tools/scale-model/model/data through smodel/page.py (read only: nothing on the model is changed). Pressure 1.6 atm x e^(-h/8 km).
"""
import os, sys, json
import numpy as np
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model', 'smodel'))
import page  # noqa: E402

D = page.load()
E, _ = page.heights(D)
W, _ = page.water_levels(D)
C = page.raster(D, 'c')[..., 0]
P = page.raster(D, 'p')[..., 0] / 255 * 4000
TM = page.raster(D, 'tm')[..., 0].astype(float) - 90
codes = [c['code'] for c in D['climate']['classes']]
vx, vy = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (801, 1573)
yy, xx = np.mgrid[0:E.shape[0], 0:E.shape[1]]
d = np.hypot(xx - vx, yy - vy) * 2
x, y = int(round(vx)), int(round(vy))
print('site px %g,%g: %.0f m, %.2f atm, rain %.0f mm, mean %+.0f degC, %s' % (vx, vy, E[y, x], 1.6 * np.exp(-E[y, x] / 8000), P[y, x], TM[y, x], codes[C[y, x]]))
for R in (10, 20, 40):
    m = d <= R
    land = m & ~W
    u, n = np.unique(C[land], return_counts=True)
    print('R %d km: land %d km2, water %d, strand (<= -2590 m) %d; h %.0f..%.0f; rain %.0f; mean %+.0f; %s' % (
        R, land.sum() * 4, (m & W).sum() * 4, (land & (E <= -2590)).sum() * 4, E[land].min(), E[land].max(),
        np.median(P[land]), np.median(TM[land]), json.dumps({codes[a]: int(b) * 4 for a, b in sorted(zip(u, n), key=lambda t: -t[1])[:6]})))
for v in D['vents']:
    if 420 <= v['px'][0] <= 900 and 1370 <= v['px'][1] <= 1660:
        print('vent', v['px'], 'floor %.0f' % v['floor'], 'ground %.0f' % E[int(v['px'][1]), int(v['px'][0])], codes[C[int(v['px'][1]), int(v['px'][0])]])
