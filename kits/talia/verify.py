#!/usr/bin/env python3
"""Headless verification of the Talia kit sheet: the page is built on the Iziz Vernacular's (build.py), so its probe
(window._api), invariants and views are Iziz's, and settlements/iziz/verify.py runs it unchanged (on tools/harness.py).

    python3 verify.py dist/talia.html --assert --views "Overview,Mixed street — middle — eye level" --out shots
"""
import os, runpy, sys

HERE = os.path.dirname(os.path.abspath(__file__))
IZ = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'settlements', 'iziz', 'verify.py')
sys.argv = [IZ] + [os.path.abspath(a) if a.endswith('.html') and os.path.exists(a) else a for a in sys.argv[1:]]
runpy.run_path(IZ, run_name='__main__')
