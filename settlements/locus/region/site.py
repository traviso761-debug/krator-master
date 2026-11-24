#!/usr/bin/env python3
"""Locus's real site, cast from the scale model (tools/site_cast.py; PLAN-ONMAP.md, the owner 2026-11-24).

    python3 settlements/locus/region/site.py      # writes settlements/locus/region/site.json

Not run by build.py (numpy and the model's page module); its output is committed and build.py embeds it as LOCUS_SITE
(89r-host-site.js). Rerun it after the model moves. The page's y = 0 is the salt lake's level on the model, -2,400 m.
  site    the pixel (1267, 1043), the model's height there, the air, the climate, y0 = -2400
  grid    the model's 2 km heights +-60 km round the pin and its water cells: the page's lifted E and S edge and the far field
          (the abyss wall, the lake's far shore) are drawn from it
  ridges  the far rim past 60 km (60-160 and 160-450 km), as the shared sky's ridges
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import site_cast as SC   # noqa: E402

rec = SC.cast(1267, 1043, eye=30.0, grid_km=60, bands=((60e3, 160e3), (160e3, 450e3)), y0=-2400.0)
out = os.path.join(HERE, 'site.json')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(rec, f, separators=(',', ':'))
print(SC.summary('Locus', rec), '->', os.path.relpath(out, ROOT).replace(os.sep, '/'))
