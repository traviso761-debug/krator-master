#!/usr/bin/env python3
"""The Talia kit: Iziz's vassal university and caravan city at the foot of the eastern passes (PLAN.md;
settlements/iziz/VASSAL-KITS.md).

The kit is written on the Iziz Vernacular contract (VERN.def, the vn* helpers, the v* kit items), so it is built on the
Vernacular's own page with no copy of it: settlements/iziz/build.py --kit takes this folder's src/ (merged into its one
fragment order; a clashing name stops the build), targets/ and kit.json, and writes dist/talia.html and the manifest
here. Its build rules (a reseed per builder, no seed collisions, no shared-scope name clashes) apply to these fragments
too. The port lint runs on this folder first.

    python3 build.py                 # dist/talia.html, the kit sheet (the Vernacular is on it too: the mixed street)
    python3 build.py --no-checks     # skip the lint and the build rules
    python3 verify.py dist/talia.html --assert --views "Overview,Mixed street — middle — eye level"
"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

args = [a for a in sys.argv[1:]]
sys.exit(subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'iziz', 'build.py'), '--kit', HERE] + args,
                         cwd=os.path.join(ROOT, 'settlements', 'iziz')))
