#!/usr/bin/env python3
"""The Highlands kit's own sheet: dist/highlands.html (README.md, "Its own sheet"; MODULARITY-PLAN.md step 4).

    python3 build.py                    # build the sheet (python3 tools/build.py kits/highlands records its inputs)
    python3 build.py --no-checks        # skip the port lint and the shared-scope and seed checks
    python3 build.py --list-sources     # the repo files the page is made of (tools/dep_graph.py)

The page is the kit sheet of the kits on the Vernacular's contract (kits/iziz-vernacular/sheet.py: its shell, the Ancients core
read in place from kits/ancients/src, core/rand, core/tags, core/walk, core/door, core/host, core/atmos/placeholder,
core/materials) with the kit's fragments (highlands.py FILES: the foundation and the three sets), what they draw through
(the Vernacular's 69b, 69c and openings 69e5, read in place from kits/iziz-vernacular), core/furnish and the GENERATED
69d-furniture-bundle.js (kits/catalog/furniture_bundle.py: the catalog cultures 89y-hl-furnish.js places; kits/interiors/
kit_bundle.py: the interiors core and the Highlands set), and targets/sheet/ (89z-rows.js, 88y-hlsheet-matlib.js on the kit's
tex/, 91t-hlsheet-tags.js). No settlement is read; Highlands' `highlands` target stays (README.md, "Its own sheet").
Core modules taken: core/rand, core/tags, core/walk, core/door, core/host, core/atmos (placeholder), core/materials, core/furnish."""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
sys.path.insert(0, HERE)
import highlands as khl   # the kit's file list
sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
import sheet as ksheet    # the kit sheet: the shell and the core modules it takes (CORE_RAND, CORE_TAGS, CORE_WALK, CORE_DOOR, CORE_HOST)
CORE_RAND, CORE_TAGS, CORE_WALK = ksheet.CORE_RAND, ksheet.CORE_TAGS, ksheet.CORE_WALK   # core/rand, core/tags, core/walk (tools/check_core_use.py reads these names)
FURNISH_DIR = os.path.join(ROOT, 'core', 'furnish')   # KFURN: the catalog furniture placement pass (89y-hl-furnish.js)
FURNISH_FILES = ['50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js']
VERN = os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src')
VERNACULAR = ['69b-vern-mat.js', '69c-vern-helpers.js', '69e5-iziz-openings.js']   # what the kit draws through, read in place
# the catalog cultures the kit's furniture comes from, as Highlands' page bundles them (settlements/highlands/build.py FURN_CULTURES)
FURN_CULTURES = ['republican', 'rustic', 'painted', 'iziz', 'generic', 'scrap', 'post-apoc']
FURN_BUNDLE = '69d-furniture-bundle.js'


def furniture_bundle():
    """GENERATED: the catalog (KratorFurniture) and the interiors core with the Highlands set (KratorInteriors), two closures."""
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    return furniture_bundle.bundle(FURN_CULTURES) + kit_bundle.bundle(['highlands'])


ksheet.port_lint(HERE)
paths = khl.paths()
paths.update({f: os.path.join(VERN, f) for f in VERNACULAR})
paths.update({f: os.path.join(FURNISH_DIR, f) for f in FURNISH_FILES})
generative = [f for s in khl.SETS.values() for f in s]
S = ksheet.compose(HERE, paths, generative=generative, pack='highlands', virtual={FURN_BUNDLE: furniture_bundle()})
BSRC.report()   # --list-sources: every file read above, then exit
ksheet.write(S, 'highlands.html', do_checks='--no-checks' not in sys.argv)
