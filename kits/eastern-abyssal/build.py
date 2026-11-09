#!/usr/bin/env python3
"""Build the Eastern Abyssal kit's own sheet: dist/eastern-abyssal.html (kits/eastern-abyssal/README.md, "Its own sheet").

    python3 build.py [--no-checks] [--list-sources] [--inline-packs]          (?interiors=1 on the page plans the rooms)

The page is the Yuni lineage's kit sheet (kits/yuni/sheetbuild.py has the recipe; kits/yuni/targets/sheet the shell), on
LOCUS'S FORK of the Yuni engine, read in place from settlements/locus/src (sheetbuild.LOCUS_ENGINE; kits/locus/build.py
says what each file is): the kit was written on Locus's fork, which stays in Locus (MODULARITY-PLAN.md step 4b). The kit is
laid out as Locus's `abyss-kit.html` laid it out: the assets whose `kit` names 'abyss', in their groups' rows
(KIT_ROWS.abyss). The Locus kit (kits/locus) is read too: its 64-locus-core.js holds the LOCUS.* helpers this kit's builders
call, and some of its assets (the four-pole sun shade) belong to both kits.
Generated: the library pack (settlements/locus/materials.json -> tex/, read in place: the fork's families are Locus's) and
65z-furniture-bundle.js (the catalog's KratorFurniture, the interiors' KratorInteriors with the Abyss's sets).
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
sys.path[:0] = [HERE, os.path.join(ROOT, 'kits', 'locus'), os.path.join(ROOT, 'kits', 'yuni')]
import abysskit, locuskit                   # the Eastern Abyssal kit, and the Locus kit it leans on
import sheetbuild                           # the Yuni lineage's kit sheet (kits/yuni/targets/sheet, the recipe)
# every numbered fragment of each, read in place: KRAND (core/tags' uid), KTAGS, KDOOR / KGLASS / KDOORHOST, KWALK (the
# interiors' floors, the doors' blocks, the sheet's ground and footprints), KFURN (the furniture placement pass)
CORE_MODULES = ['rand', 'tags', 'door', 'walk', 'furnish']
CONFIG = {'YS_KIT': 'eastern-abyssal', 'YS_SUBKIT': 'abyss', 'YS_BUILD': 'eastern-abyssal-kit', 'YS_GROUND_COL': '#c9c2a8', 'YS_LIM': 230,
          'YS_FAM_ORDER': [], 'YS_FAM_NAME': {}}
HEAD = {'__TITLE__': 'Eastern Abyssal Building Kit', '__LOADING__': 'Laying out the abyssal kit…', '__TARGET__': 'abyss',
        '__HINT__': "The Eastern Abyssal kit (kits/eastern-abyssal) on Locus's fork of the Yuni engine, on core/host: I hovers the "
                    'inspector, a click inspects, P marks, F walks, E opens a door within reach; ?interiors=1 plans the rooms.'}

if __name__ == '__main__':
    kits = dict(locuskit.paths()); kits.update(abysskit.paths())
    sheetbuild.build(HERE, 'eastern-abyssal', CONFIG, HEAD, 'locus', sheetbuild.LOCUS_ENGINE, kits, CORE_MODULES,
                     core_files=sheetbuild.locus_record_files(), pack_key='locus', bundles=sheetbuild.locus_bundles())
