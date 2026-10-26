#!/usr/bin/env python3
"""Headless verification for biomes/scablands: n semiarid's verify.py (the kit's harness: tools/harness.py, the probe,
the budgets, --assert with the page's hostChecks and their negatives), run on this build's page.

  python3 verify.py dist/coulee.html --assert --out shots/x
  python3 verify.py dist/coulee.html --views "The dry falls from the rim,The plunge-pool lake" --out shots/x

The page's own checks (src/99-host-take.js) are the station's: the falls, the water held, the walls stepped by the
flows, the scour bare; and the kit's that apply here. Each with a broken input that must fail.
"""
import os, runpy, sys

HERE = os.path.dirname(os.path.abspath(__file__))
runpy.run_path(os.path.join(HERE, '..', 'nsemiarid', 'verify.py'), run_name='__main__')
