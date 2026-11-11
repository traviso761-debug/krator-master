#!/usr/bin/env python3
"""Headless verification for biomes/scablands: n semiarid's verify.py (the kit's harness: tools/harness.py, the probe,
the budgets, --assert with the page's hostChecks and their negatives), run on this build's page.

  python3 verify.py dist/coulee.html --assert --out shots/x
  python3 verify.py dist/coulee.html --views "The dry falls from the rim,The plunge-pool lake" --out shots/x
  python3 verify.py dist/highline-nw.html --assert --all-views --out shots/x   (station 2's NW lowlands half: nwlowlands' verify.py)

The page's own checks (src/99-host-take.js) are the station's: the falls, the water held, the walls stepped by the
flows, the scour bare; and the kit's that apply here. Each with a broken input that must fail.
"""
import json, os, runpy, sys

HERE = os.path.dirname(os.path.abspath(__file__))
# a station on another kit (its station.json "kit": highline-nw on biomes/nwlowlands) takes that kit's harness
def _kit(argv):
    for a in argv[1:]:
        if a.endswith('.html'):
            sj = os.path.join(HERE, 'stations', os.path.splitext(os.path.basename(a))[0], 'station.json')
            if os.path.isfile(sj):
                with open(sj, encoding='utf-8') as fh:
                    return json.load(fh).get('kit') or 'nsemiarid'
    return 'nsemiarid'
runpy.run_path(os.path.join(HERE, '..', _kit(sys.argv), 'verify.py'), run_name='__main__')
