#!/usr/bin/env python3
"""Mungo's real site, cast from the scale model (tools/site_cast.py; settlements/locus/PLAN-ONMAP.md: Mungo moves onto the
shared sky with Locus, the owner 2026-11-24).

    python3 settlements/mungo/region/site.py      # writes settlements/mungo/region/site.json

Not run by build.py; its output is committed and build.py embeds it as LOCUS_SITE (89r-host-site.js, the name Locus's sky
fragment reads). The pin is the moved one (openworld/PLAN-SETTLEMENTS.md: 1322, 828). The page's y = 0 is its salt lake: the
level of the nearest water on the model, within 20 km. No far field for Mungo in this pass (its own ground is not lifted):
the ridges alone, from 6 km out.
"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import site_cast as SC   # noqa: E402

PX, PY = 1322, 828
M = SC.model()
best = None
for j in range(PY - 10, PY + 11):
    for i in range(PX - 10, PX + 11):
        if M['WAT'][j, i]:
            d = math.hypot(i - PX, j - PY)
            if best is None or d < best[0]:
                best = (d, float(M['WL'][j, i]))
y0 = best[1] if best else None
rec = SC.cast(PX, PY, eye=30.0, grid_km=0, bands=((6e3, 30e3), (30e3, 120e3), (120e3, 450e3)), y0=y0)
rec['site']['water_km'] = round(best[0] * 2, 1) if best else None
out = os.path.join(HERE, 'site.json')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(rec, f, separators=(',', ':'))
print(SC.summary('Mungo', rec), ' nearest water %s km' % rec['site']['water_km'], '->', os.path.relpath(out, ROOT).replace(os.sep, '/'))
