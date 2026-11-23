#!/usr/bin/env python3
"""Build the Yuni kit's own sheet: dist/yuni.html (kits/yuni/README.md, "Its own sheet").

    python3 build.py [--no-checks] [--list-sources] [--inline-packs]

The page (sheetbuild.py has the whole recipe), in filename order:
  targets/sheet/*          the sheet shell (the Yuni lineage's, which kits/locus and kits/eastern-abyssal take too), plus
                           30-ys-world.js (the one world name Yuni's 50-structure.js reads at load: BRIDGES, empty)
  src/*                    the kit (55-59c), yunikit.py's list
  settlements/yuni/src     THE YUNI ENGINE, read in place (ENGINE): 05-palette (PAL, FAMMAT), 10-core (rnd/reseed, noise,
                           geometry helpers, and Yuni's world, which a sheet target switches off: SHEET), 45-kit (the buckets,
                           the merged meshes, the openings, REGISTER), 47-texture (the families' maps), 50-structure (QF/TF,
                           arch walls and bands, the blunt tower), 51-fixtures (FIX: buildings, doors, windows, lights into
                           core/tags), 53-assets (ASSET, FURN, the frame F), 72-lights (LANTERN), 81-glow (the night light
                           volume, the panes on core/door's KGLASS), 86-inspect (the inspector's words over SITES). Not a core
                           module (MODULARITY-PLAN.md step 4b): the kit's sheet takes Yuni's fork, where its buildings came from
  core modules             CORE_MODULES below, the host shell with the inspector and marks, the placeholder sky; read in place
  46-matlib-pack.js        GENERATED: Yuni's library pack (settlements/yuni/materials.json -> tex/), read in place
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
sys.path.insert(0, HERE)
import yunikit                              # the kit: its buildings (55-59c)
import sheetbuild                           # the Yuni lineage's kit sheet (targets/sheet, the recipe)
TOWN = 'yuni'                               # the world whose engine fork the kit draws through
ENGINE = sheetbuild.YUNI_ENGINE            # the engine's files, read in place from settlements/yuni/src (the docstring)
# every numbered fragment of each, read in place: KRAND (core/tags' uid is its hash), KTAGS, KMAT and TEX (the material
# records and the library loader), KDOOR / KGLASS / KDOORHOST (the doors and the glass)
CORE_MODULES = ['rand', 'tags', 'materials/record', 'door']
WALK_FILES = {'20-core-walk.js': os.path.join(ROOT, 'core', 'walk', '20-core-walk.js')}   # KWALK: the ground, the footprints, the doors
CONFIG = {'YS_KIT': 'yuni', 'YS_SUBKIT': None, 'YS_BUILD': 'yuni-kit', 'YS_GROUND_COL': '#b9a27a', 'YS_LIM': 210,
          'YS_FAM_ORDER': ['civic', 'rich', 'park', 'mid', 'trade', 'poor', 'prop'],
          'YS_FAM_NAME': {'civic': 'Civic & neo-African', 'rich': 'Wealthy compounds', 'park': 'Park pieces (Guell)',
                          'mid': 'Middle-class houses', 'trade': 'Shops, taverns, workshops, caravanserai',
                          'poor': 'Poor quarters: mud & thatch', 'prop': 'Street furniture', 'furn': "The Order's furniture (FURN)"}}
HEAD = {'__TITLE__': 'Yuni Building Kit', '__LOADING__': 'Laying out the Yuni kit…', '__TARGET__': 'sheet',
        '__HINT__': "The Yuni kit (kits/yuni) on Yuni's engine, on core/host: I hovers the inspector, a click inspects, "
                    'P marks, F walks, E opens a door within reach. The blue tab on a footprint marks its FRONT.'}

if __name__ == '__main__':
    sheetbuild.build(HERE, 'yuni', CONFIG, HEAD, TOWN, ENGINE, yunikit.paths(), CORE_MODULES, core_files=WALK_FILES,
                     pack_key='yuni', shell_extra=['30-ys-world.js'])
