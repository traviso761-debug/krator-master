#!/usr/bin/env python3
"""The Qiblai kit: the Xanadu Sultanate's holy city of the Decree, a vassal kit of the Xanadu kit (PLAN.md).

The kit is written on the Xanadu kit's contract (QB.def is XA.def on VERN.def; the xn* helpers and x* items), so it is built
on Xanadu's own page with no copy of it: settlements/xanadu/build.py --kit takes this folder's src/ (merged into its one
fragment order; a clashing name stops the build), targets/ and kit.json, and writes dist/qiblai.html and the manifest here.
Its build rules (a reseed per builder, no seed collisions, no shared-scope name clashes) apply to these fragments too. The
port lint runs on this folder first. The page takes core/rand and core/tags (and core/host, core/door, core/lod, core/atmos,
core/water) through Xanadu's build; CORE_TAKEN names them for tools/check_core_use.py.

    python3 build.py                 # dist/qiblai.html, the kit sheet (the Xanadu kit is on it too: the mixed street)
    python3 build.py --no-checks     # skip the lint and the build rules
    python3 verify.py dist/qiblai.html --assert --views "Overview,Mixed street"
"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/water')   # read through settlements/xanadu/build.py

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

args = [a for a in sys.argv[1:]]
_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + args,
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()   # --list-sources: Xanadu's build printed what the page is made of; this adds this build.py
sys.exit(_rc)
