#!/usr/bin/env python3
"""Girder's horizon, read from the scale model (tools/scale-model/model/data, 5.1) at Girder's pixel (W7, 2026-11-24).

    python3 settlements/girder/region/far.py        # writes settlements/girder/region/far.json

Not run by build.py (it needs numpy and the model's page module; the method is tools/site_cast.py's); its output is committed and build.py embeds it as the
virtual fragment 89r-host-far.js (const GIRDER_FAR=...), which 90s-host-sky.js hands the shared sky. Rerun it after the model
moves. The owner (2026-11-24): "no painted volcano, real terrain only": the far land is the model's ground and nothing else.
The shape is Ancient's Valley's (biomes/ancientsvalley/region/site.py, ridges_of), with two differences: over water the
surface counts, not the bed (the Ring Sea's edge is a horizon), and the bands start at Girder's own ground's edge (the page
draws 3.6 km each way, 10-core.js HW) and run to 450 km, past the Throne.

  site     the pixel, the model's height there (the eye stands EYE over it), the air (1.6 atm x e^(-h/8 km), the model's rule)
  ridges   three bands of distance, each the highest elevation angle of the model's ground (or water surface) at 1024 azimuths
           (0 north, 90 east) from the eye, with the planet's curvature (the sky model's frame: 84 km a degree) and the thick
           air's refraction (k 0.13: the curve as from a planet 1/(1-k) times as large)

Deterministic: no randomness.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import site_cast as SC   # noqa: E402   (the shared cast: tools/site_cast.py)

PX, PY = 1039, 869                                   # Girder (openworld/iziz-cluster/data/region.json, 5.1 px)
BANDS = [(4000, 20000), (20000, 80000), (80000, 450000)]


def main():
    rec = SC.cast(PX, PY, eye=30.0, grid_km=0, bands=BANDS)
    rec = {'site': {k: rec['site'][k] for k in ('px', 'py', 'base', 'eye', 'atm')}, 'ridges': rec['ridges']}
    out = os.path.join(HERE, 'far.json')
    with open(out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(rec, f, separators=(',', ':'))
    print(SC.summary('Girder', rec), '->', os.path.relpath(out, ROOT).replace(os.sep, '/'))


if __name__ == '__main__':
    main()
