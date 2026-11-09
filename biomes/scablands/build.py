#!/usr/bin/env python3
"""The scablands (an overlay): a station built on the n semiarid kit, read in place (biomes/scablands/PLAN.md).

  python3 build.py            dist/coulee.html (station 1: a coulee and dry falls on the west breach)

n semiarid's build.py assembles the page (its build(overlay=...)): every fragment of biomes/nsemiarid/src and the core
lists it names, then this folder's src/, which shadows the kit's fragments by name (45b-host-stage.js: the station;
99-host-take.js: its views and checks) and adds its own, and the core this overlay needs (core/terrain's KSCOUR).
The library pack is the kit's (biomes/nsemiarid/tex), and beside it this overlay's own (materials.json, tex/: the
erratics' concrete and basalt; python3 tools/textures/pack.py biomes/scablands).
"""
import importlib.util, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
NS = os.path.join(ROOT, 'biomes', 'nsemiarid')
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)

# the port lint for this build's own fragments (the kit's build lints the kit's when it loads)
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

spec = importlib.util.spec_from_file_location('nsemiarid_build', os.path.join(NS, 'build.py'))
ns = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ns)

CORE = {'41-core-scour.js': os.path.join(ROOT, 'core', 'terrain', '41-core-scour.js'),   # KSCOUR: the flood's landforms
        # the geodes (PLAN.md, "Geodes"): KCAVERN (the walk-in geode's block and pocket), KGEODE (the records), and their drawing
        '39-core-cavern.js': os.path.join(ROOT, 'core', 'terrain', '39-core-cavern.js'),
        '39f-core-geode.js': os.path.join(ROOT, 'core', 'terrain', '39f-core-geode.js'),
        '39e-core-cavern-draw.js': os.path.join(ROOT, 'core', 'terrain', 'host', '39e-core-cavern-draw.js'),
        '39g-core-geode-draw.js': os.path.join(ROOT, 'core', 'terrain', 'host', '39g-core-geode-draw.js')}

if __name__ == '__main__':
    sys.exit(ns.build('coulee.html', overlay={'src': os.path.join(HERE, 'src'), 'core': CORE,
                                              'dist': os.path.join(HERE, 'dist'), 'here': HERE,
                                              'tex': os.path.join(HERE, 'tex'), 'pack': 'scablands',
                                              'title': 'Krator biome — the scablands: a coulee and its dry falls'}))   # its own pack: materials.json
