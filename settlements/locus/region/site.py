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

# THE CATARACTS (PLAN-ONMAP.md item 7: the owner took "the Bigga's cataract"): every river on the model that falls more than
# 300 m within 80 km of the pin, from its rivers.json bed profile: the fall's top and foot as azimuth (0 north, 90 east) and
# elevation from the eye, with the curve. The sky draws each as a horizon band; the ground in front hides it where the model's
# ground does (the Bigga's, 43 km NE, stands behind the wall's NE limb from the town: 0.9 deg against 5-7 deg).
import math   # noqa: E402
with open(os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data', 'rivers.json'), encoding='utf-8') as fh:
    _R = json.load(fh)
_rivers = _R['rivers'] if isinstance(_R, dict) and 'rivers' in _R else _R
_eye = rec['site']['base'] + rec['site']['eye']
def _aim(p, h):
    dx, dz = (p[0] - 1267) * 2000, (p[1] - 1043) * 2000
    d = math.hypot(dx, dz)
    return (math.degrees(math.atan2(dx, -dz)) + 360) % 360, math.degrees(math.atan2(h - d * d / (2 * SC.R_SEEN) - _eye, d)), d
rec['cataracts'] = []
for r in _rivers:
    px, bed = r.get('px'), r.get('bed_m')
    if not px or not bed:
        continue
    i = 0
    while i < len(bed) - 1:
        if bed[i] - bed[i + 1] <= 150:                            # a fall is a run of steep steps (each over 150 m between the
            i += 1                                                 # profile's points), over 300 m in all, within 80 km, under 16 km
            continue
        j = i + 1
        while j < len(bed) - 1 and bed[j] - bed[j + 1] > 150:
            j += 1
        az0, el0, d0 = _aim(px[i], bed[i])
        az1, el1, d1 = _aim(px[j], bed[j])
        span = math.hypot(px[j][0] - px[i][0], px[j][1] - px[i][1]) * 2000
        if bed[i] - bed[j] >= 300 and min(d0, d1) <= 80000 and span <= 16000:
            rec['cataracts'].append({'river': r.get('name') or r.get('id'), 'id': r.get('id'), 'drop': round(bed[i] - bed[j]),
                                     'az': [round(az0, 2), round(az1, 2)], 'el': [round(el1, 3), round(el0, 3)], 'dist': round((d0 + d1) / 2)})
        i = j
# THE RIVERS on the far field: every model river with a point within 45 km of the pin, its course in page metres (x east, z
# south; the bed's absolute height and the width per point), so the far field draws them where the model runs them (the
# page's own river off the wall, Wadi al-Naft, and the Bigga's upper fall among them)
rec['rivers'] = []
for r in _rivers:
    px, bed, wid = r.get('px'), r.get('bed_m'), r.get('width_m')
    if not px or not bed:
        continue
    wk = lambda k: wid[k] if isinstance(wid, list) and k < len(wid) else (wid if isinstance(wid, (int, float)) else 20)   # a width a point, or one for the river
    pts = [[round((p[0] - 1267) * 2000, 1), round((p[1] - 1043) * 2000, 1), round(bed[k], 1), round(wk(k), 1)] for k, p in enumerate(px)]
    if min(math.hypot(q[0], q[1]) for q in pts) <= 45000:
        rec['rivers'].append({'id': r.get('id'), 'name': r.get('name'), 'pts': pts})
out = os.path.join(HERE, 'site.json')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    json.dump(rec, f, separators=(',', ':'))
print(SC.summary('Locus', rec), '->', os.path.relpath(out, ROOT).replace(os.sep, '/'))
