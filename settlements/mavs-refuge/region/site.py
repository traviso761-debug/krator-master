#!/usr/bin/env python3
"""Mav's Refuge's real site, cast from the scale model (tools/site_cast.py; W7, 2026-11-24).

    python3 settlements/mavs-refuge/region/site.py      # writes settlements/mavs-refuge/region/site.json

Not run by build.py (numpy and the model's page module); its output is committed and build.py embeds it as MR_SITE
(09-mr-site.js). Rerun it after the model moves. The pin is the moved one (openworld/iziz-cluster/data/region.json, 2026-11-11:
the owner, "onto a big river"): 1049, 841, the Beesh Baatar's valley floor (90 m3/s, flowing E to W to the Ring Sea). The far
land is the model's own ground, nothing painted (the owner: "real terrain only"): the horizon bands from the page's edge
(the page draws 3.6 km each way, 10-core.js HW) to 450 km.
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import site_cast as SC   # noqa: E402

rec = SC.cast(1049, 841, eye=30.0, grid_km=0, bands=((4000, 20000), (20000, 80000), (80000, 450000)))
out = os.path.join(HERE, 'site.json')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(rec, f, separators=(',', ':'))
print(SC.summary("Mav's Refuge", rec), '->', os.path.relpath(out, ROOT).replace(os.sep, '/'))
