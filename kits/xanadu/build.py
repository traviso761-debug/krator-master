#!/usr/bin/env python3
"""The Xanadu kit's own sheet: dist/xanadu.html (README.md, "Its own sheet"; MODULARITY-PLAN.md step 4).

    python3 build.py                    # build the sheet (python3 tools/build.py kits/xanadu records its inputs)
    python3 build.py --no-checks        # skip the port lint and the shared-scope and seed checks
    python3 build.py --list-sources     # the repo files the page is made of (tools/dep_graph.py)

The page is the kit sheet of the kits on the Vernacular's contract (kits/iziz-vernacular/sheet.py: its shell, the Ancients core
read in place from kits/ancients/src, core/rand, core/tags, core/walk, core/door, core/host, core/atmos/placeholder,
core/materials) with the kit's fragments (xanadu.py FILES), what they draw through (the Vernacular's 69b, 69c and openings 69e5,
read in place from kits/iziz-vernacular) and targets/sheet/ (89z-rows.js, 88y-xasheet-matlib.js on the kit's tex/,
91t-xasheet-tags.js). No settlement is read; Xanadu's `xanadu` target stays (README.md, "Its own sheet"). kit_bundle.py (XAK,
for another world's page) is a separate product and does not change.
Core modules taken: core/rand, core/tags, core/walk, core/door, core/host, core/atmos (placeholder), core/materials."""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
sys.path.insert(0, HERE)
import xanadu as kxa      # the kit's file list
sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
import sheet as ksheet    # the kit sheet: the shell and the core modules it takes (CORE_RAND, CORE_TAGS, CORE_WALK, CORE_DOOR, CORE_HOST)
CORE_RAND, CORE_TAGS, CORE_WALK = ksheet.CORE_RAND, ksheet.CORE_TAGS, ksheet.CORE_WALK   # core/rand, core/tags, core/walk (tools/check_core_use.py reads these names)
VERN = os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src')

ksheet.port_lint(HERE)
paths = kxa.paths()
paths.update({f: os.path.join(VERN, f) for f in kxa.VERNACULAR + kxa.OPENINGS_VERN})   # what the kit draws through, read in place
generative = [f for f in kxa.BUILDINGS if f != '86b-xa-plants.js']   # the plant shim draws no rnd() (Xanadu's DETERMINISTIC)
S = ksheet.compose(HERE, paths, generative=generative, pack='xanadu')
BSRC.report()   # --list-sources: every file read above, then exit
ksheet.write(S, 'xanadu.html', do_checks='--no-checks' not in sys.argv)
