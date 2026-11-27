#!/usr/bin/env python3
"""The Painted Men (Kweentx) kit's own sheet: dist/painted-men.html (README.md).

    python3 build.py                    # build the sheet (python3 tools/build.py kits/painted-men records its inputs)
    python3 build.py --no-checks        # skip the port lint and the shared-scope and seed checks
    python3 build.py --list-sources     # the repo files the page is made of (tools/dep_graph.py)

The page is the kit sheet on the Vernacular's contract (kits/iziz-vernacular/sheet.py: its shell, the Ancients core read in
place from kits/ancients/src, core/rand, core/tags, core/walk, core/door, core/host, core/atmos/placeholder, core/materials)
with the shared timber/bamboo/furnish base from kits/highlands (painted_men.py SHARED_BASE), this kit's Tlingit / Pacific-NW
formline & totem layer (83-pm-tlingit.js) and dwellings/halls/salvage (84-tri-dwell.js, 85-tri-village.js, 85b-tri-salvage.js),
core/furnish, the GENERATED 69d-furniture-bundle.js, and targets/sheet/ (88y-pmsheet-matlib.js, 89z-rows.js, 91t-pmsheet-tags.js).
Packed PBR and Tlingit frieze maps named in materials.json are read in place from kits/highlands/tex/.
Core modules taken: core/rand, core/tags, core/walk, core/door, core/host, core/atmos (placeholder), core/materials, core/furnish."""
import os, sys                                   # item 25 (the survey): a plain run goes through tools/build.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)           # build-inputs.json is always written (KRATOR_ALLOW_PLAIN_BUILD=1 skips it)
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
sys.path.insert(0, HERE)
import painted_men as kpm
sys.path.insert(0, os.path.join(ROOT, 'kits', 'iziz-vernacular'))
import sheet as ksheet
CORE_RAND, CORE_TAGS, CORE_WALK = ksheet.CORE_RAND, ksheet.CORE_TAGS, ksheet.CORE_WALK   # tools/check_core_use.py reads these names
FURNISH_DIR = os.path.join(ROOT, 'core', 'furnish')
FURNISH_FILES = ['50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js']
VERN = os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src')
VERNACULAR = ['69b-vern-mat.js', '69c-vern-helpers.js', '69e5-iziz-openings.js']
FURN_CULTURES = ['painted', 'rustic', 'republican', 'iziz', 'generic', 'scrap', 'post-apoc']
FURN_BUNDLE = '69d-furniture-bundle.js'
HL_DIR = os.path.join(ROOT, 'kits', 'highlands')


def furniture_bundle():
    """GENERATED: the catalog (KratorFurniture) and the interiors core with the Highlands set (KratorInteriors)."""
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    return furniture_bundle.bundle(FURN_CULTURES, tex=True) + kit_bundle.bundle(['highlands'])


def pack_fragment(side):
    """Build 88x-matlib-pack.js for 'painted-men' from materials.json using the committed webp pack in kits/highlands/tex/."""
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    with open(os.path.join(HERE, 'materials.json'), encoding='utf-8') as fh:
        wanted = set(json.load(fh).get('families', {}))
    pj = os.path.join(HL_DIR, 'tex', 'pack.json')
    all_fams = set(json.load(open(pj, encoding='utf-8')).get('families', {})) if os.path.isfile(pj) else set()
    return matlib_pack.fragment(HL_DIR, 'painted-men', exclude=all_fams - wanted, side=side)


ksheet.port_lint(HERE)
paths = kpm.full_paths()
paths.update({f: os.path.join(VERN, f) for f in VERNACULAR})
paths.update({f: os.path.join(FURNISH_DIR, f) for f in FURNISH_FILES})
generative = [f for s in kpm.SETS.values() for f in s]
side = {}
virtual = {FURN_BUNDLE: furniture_bundle(), ksheet.MATLIB_PACK: pack_fragment(side)}
S = ksheet.compose(HERE, paths, generative=generative, pack=None, virtual=virtual)
S['side'] = side
S['pack'] = 'painted-men'
BSRC.report()   # --list-sources: every file read above, then exit
ksheet.write(S, 'painted-men.html', do_checks='--no-checks' not in sys.argv)
