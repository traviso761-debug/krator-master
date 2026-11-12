#!/usr/bin/env python3
"""The Iziz Vernacular kit's own sheet: dist/iziz-vernacular.html (README.md, "Its own sheet"; MODULARITY-PLAN.md step 4).

    python3 build.py                    # build the sheet (python3 tools/build.py kits/iziz-vernacular records its inputs)
    python3 build.py --no-checks        # skip the port lint and the shared-scope and seed checks
    python3 build.py --list-sources     # the repo files the page is made of (tools/dep_graph.py)

The page is the kit sheet (sheet.py: the shell in src/*-vsheet-*, the Ancients core read in place from kits/ancients/src,
core/rand, core/tags, core/walk, core/door, core/host, core/atmos/placeholder, core/materials) with the kit's own fragments
(vernacular.py FILES: 69b ... 74z) and targets/sheet/ (89z-rows.js: the rows; 88y-vsheet-matlib.js: the library bind on the
kit's tex/; 91t-vsheet-tags.js: REG into core/tags). No settlement is read: Iziz's `vernacular` target stays Iziz's own sheet
(the furnished interiors, which are Iziz's 95i), checked by settlements/iziz/verify.py.
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
import sheet as ksheet       # the kit sheet: the shell and the core modules it takes (CORE_RAND, CORE_TAGS, CORE_WALK, CORE_DOOR, CORE_HOST)
import vernacular as kvern   # the kit's file list
CORE_RAND, CORE_TAGS, CORE_WALK = ksheet.CORE_RAND, ksheet.CORE_TAGS, ksheet.CORE_WALK   # core/rand, core/tags, core/walk (tools/check_core_use.py reads these names)

ksheet.port_lint(HERE)
S = ksheet.compose(HERE, kvern.paths(), generative=kvern.BUILDINGS, pack='iziz-vernacular')
BSRC.report()   # --list-sources: every file read above, then exit
ksheet.write(S, 'iziz-vernacular.html', do_checks='--no-checks' not in sys.argv)
