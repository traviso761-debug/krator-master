#!/usr/bin/env python3
"""The scablands (an overlay): a station built on the n semiarid kit, read in place (biomes/scablands/PLAN.md).

  python3 build.py            dist/coulee.html (station 1: a coulee and dry falls on the west breach)
  python3 build.py --station highline      dist/highline.html (station 2: the flood lake's high line, n semiarid's share)
  python3 build.py --station highline-nw   dist/highline-nw.html (station 2's NW lowlands half, on biomes/nwlowlands' build(overlay=...))

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

# THE STATIONS (PLAN.md section 3): `python3 build.py --station <name>` builds dist/<name>.html from this overlay's src/ with stations/<name>/'s
# numbered fragments over it (a name in both is the station's: its 45b its stage, its 99 its views and checks). Its station.json: "drop" (src/'s
# fragments it leaves out: the coulee's pools and geodes), "core" ({name: path from the repo root}: in place of the coulee's CORE), "families" (this
# overlay's pack families that go into that station's page only) and "skip" (the overlay's families it leaves out: the coulee's own). Station 1,
# the coulee, is the overlay with no --station
import json as _json
def station_json(name):
    p = os.path.join(HERE, 'stations', name, 'station.json')
    if not os.path.isfile(p): return {}
    with open(p, encoding='utf-8') as fh: return _json.load(fh)
def station_families():
    out = set(); d = os.path.join(HERE, 'stations')
    if os.path.isdir(d):
        for s in sorted(os.listdir(d)): out.update(station_json(s).get('families', []))
    return out

if __name__ == '__main__':
    _a = sys.argv[1:]; _st = _a[_a.index('--station') + 1] if '--station' in _a and _a.index('--station') + 1 < len(_a) else None
    if not _st:
        sys.exit(ns.build('coulee.html', overlay={'src': os.path.join(HERE, 'src'), 'core': CORE,
                                                  'dist': os.path.join(HERE, 'dist'), 'here': HERE,
                                                  'tex': os.path.join(HERE, 'tex'), 'pack': 'scablands', 'packExclude': station_families(),
                                                  'title': 'Krator biome — the scablands: a coulee and its dry falls'}))   # its own pack: materials.json
    _sd = os.path.join(HERE, 'stations', _st)
    if not os.path.isdir(_sd): sys.exit('build.py: no station ' + _st + ' (stations/' + _st + '/)')
    SJ = station_json(_st)
    # a station on another kit (station.json "kit": station 2's NW lowlands half, highline-nw, on biomes/nwlowlands): that kit's build(overlay=...)
    # assembles it from the station's folder alone (none of this overlay's src/, which is n semiarid's stage), its "core" by path, this overlay's pack
    if SJ.get('kit') == 'nwlowlands':
        _spec = importlib.util.spec_from_file_location('nwlowlands_build', os.path.join(ROOT, 'biomes', 'nwlowlands', 'build.py'))
        nwl = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(nwl)
        sys.exit(nwl.build(_st + '.html', overlay={'src': _sd, 'drop': SJ.get('drop', []),
                                                   'core': {f: os.path.normpath(os.path.join(ROOT, p)) for f, p in SJ.get('core', {}).items()},
                                                   'dist': os.path.join(HERE, 'dist'), 'here': HERE,
                                                   'tex': os.path.join(HERE, 'tex'), 'pack': 'scablands',
                                                   'packExclude': (station_families() - set(SJ.get('families', []))) | set(SJ.get('skip', [])),
                                                   'kin': False, 'host': 'full', 'title': SJ.get('title')}))
    sys.exit(ns.build(_st + '.html', overlay={'src': os.path.join(HERE, 'src'), 'srcs': [_sd], 'drop': SJ.get('drop', []),
                                              'core': {f: os.path.normpath(os.path.join(ROOT, p)) for f, p in SJ.get('core', {}).items()},
                                              'dist': os.path.join(HERE, 'dist'), 'here': HERE,
                                              'tex': os.path.join(HERE, 'tex'), 'pack': 'scablands',
                                              'packExclude': (station_families() - set(SJ.get('families', []))) | set(SJ.get('skip', [])),
                                              'title': SJ.get('title')}))
