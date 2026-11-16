#!/usr/bin/env python3
"""Build the Locus kit's own sheet: dist/locus.html (kits/locus/README.md, "Its own sheet").

    python3 build.py [--no-checks] [--list-sources] [--inline-packs]          (?interiors=1 on the page plans the rooms)

The page is the Yuni lineage's kit sheet (kits/yuni/sheetbuild.py has the recipe; kits/yuni/targets/sheet the shell), on
LOCUS'S FORK of the Yuni engine, read in place from settlements/locus/src (LOCUS_ENGINE): 05-palette, 10-core (the sheet
target 'locus' sets its KIT), 45-kit, 47-texture, 50-structure, 53-assets (ASSET, the frame F, assetInKit / assetGroup /
KIT_ROWS), 66-locus-furnish (FURNISH: the kit's furniture from the catalog, core/furnish; the interiors with ?interiors=1),
72-lights, 81-glow, 86-inspect, 95-locus-doors (the doors on core/door). Not a core module (MODULARITY-PLAN.md step 4b);
the kit was written on Locus's fork, so its sheet takes that fork. The kit is laid out as Locus's `locus-kit.html` laid it
out: the assets whose `kit` names 'locus', in their groups' rows (KIT_ROWS.locus). Both of Locus's kits are read (the
Eastern Abyssal kit, kits/eastern-abyssal, declares assets of both kits and leans on 64-locus-core.js); the sheet shows
this kit's.
Generated: the library pack (settlements/locus/materials.json -> tex/, read in place) and 65z-furniture-bundle.js (the
catalog's KratorFurniture and the interiors' KratorInteriors with Locus's and the Abyss's sets: LOCUS_FURN_CULTURES,
LOCUS_INTERIOR_SETS, Locus's own lists).
"""
import os, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and '--list-sources' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # noqa: F401  --list-sources (tools/dep_graph.py)
sys.path[:0] = [HERE, os.path.join(ROOT, 'kits', 'eastern-abyssal'), os.path.join(ROOT, 'kits', 'yuni')]
import locuskit, abysskit                   # the Locus kit and the Eastern Abyssal kit (both read: they share assets and helpers)
import sheetbuild                           # the Yuni lineage's kit sheet (kits/yuni/targets/sheet, the recipe)
# every numbered fragment of each, read in place: KRAND (core/tags' uid), KTAGS, KDOOR / KGLASS / KDOORHOST, KWALK (the
# interiors' floors, the doors' blocks, the sheet's ground and footprints), KFURN (the furniture placement pass)
CORE_MODULES = ['rand', 'tags', 'door', 'walk', 'furnish']
CONFIG = {'YS_KIT': 'locus', 'YS_SUBKIT': 'locus', 'YS_BUILD': 'locus-kit', 'YS_GROUND_COL': '#a9a98a', 'YS_LIM': 210,
          'YS_FAM_ORDER': [], 'YS_FAM_NAME': {}}
HEAD = {'__TITLE__': 'Locus Building Kit', '__LOADING__': 'Laying out the Locus kit…', '__TARGET__': 'locus',
        '__HINT__': "The Locus kit (kits/locus) on Locus's fork of the Yuni engine, on core/host: I hovers the inspector, a click "
                    'inspects, P marks, F walks, E opens a door within reach; ?interiors=1 plans the rooms. The blue tab marks a FRONT.'}

if __name__ == '__main__':
    kits = dict(locuskit.paths()); kits.update(abysskit.paths())
    sheetbuild.build(HERE, 'locus', CONFIG, HEAD, 'locus', sheetbuild.LOCUS_ENGINE, kits, CORE_MODULES,
                     core_files=sheetbuild.locus_record_files(), pack_key='locus', bundles=sheetbuild.locus_bundles())
