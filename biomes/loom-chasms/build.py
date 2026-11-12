#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Loom-Chasms (PLAN.md).

The host is the Great Chasm's (biomes/greatchasm/src, 2026-11-11), taken as the start: the land is the scale model's own surface round each
station (stations/bake_far.py, the Great Chasm's bake read in place), with the station's landforms on it and the model past it as the far field.
Read in place from the Great Chasm: its flood-basalt strata recipes (44r) and its ground cover (the Outlands' cold-desert set as named stand-ins,
its 50/60/70 in its own registry, with its pack: the ground's library layers are its). This kit's own: the living cables (50-60).

  00-head.html      page shell, opens <script>
  10..44            BIOME CORE (core/biome) and the core modules the land takes
  44f               the STATION's far-field data (stations/<name>/44f-host-far-data.js: generated, never edited)
  44r               the Great Chasm's strata recipes, read in place
  44v, 44w          HOST: the land library; the STATION's land (stations/<name>/44w-host-land.js)
  45-host-stage     HOST binding (renderer, the ground, the rock bodies, BIO.init) -- must run before 47 and 50
  47*               the NEIGHBOURS' kits, read in place (station.json "kin"), each in its own registry
  50..79            THE KIT: the cable spinner (its anchors, cables, tiers and pioneer shoots) and the slot walls' curtains
  80..98            HOST (the far field, the station's features, the kin, the hazards, sky, air, water, build)
  99-host-take      the page handed to core/host;  99-tail.html closes <script>

  python3 build.py                     dist/loom-chasms.html: station 3, the Loom (the plan builds it first: PLAN.md section 7)
  python3 build.py --station <name>    a station's page; only stations with a land (stations/<name>/44w-host-land.js) build: the Cradle, the
                                       Weave-Step and Mount Caelum are records only (their station.json) until their turns
  python3 build.py --all               every built station

stations/<name>/station.json: "kin" {"<kit>": [[fragments], "<API>", [pack families] | "*"]}; "core" {"<slot>": "<path from the repo root>"};
"base" "<station>". The station records' own fields (site, water, ...) are the plan's data and are not read here.
"""
import os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places
    (/opt/node*/bin, /usr/local/bin, ~/.nvm, ~/.volta; the newest first). None when
    there is none: the build then says plainly that the syntax was NOT checked.
    Every build.py carries this same function; a fix belongs in all of them."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
        print('NOTE: $NODE=%s is not a node binary; looking elsewhere' % env)
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
STATIONS = ['loom', 'cradle', 'monocline', 'caelum', 'whiteloom']
if '--all' in sys.argv:
    _rc = 0
    for _s in STATIONS:
        _rc |= subprocess.call([sys.executable, os.path.abspath(__file__), '--station', _s] + [a for a in sys.argv[1:] if a != '--all'])
    sys.exit(_rc)
_args = [a for a in sys.argv[1:] if not a.startswith('--') or a == '--station']
STATION = _args[_args.index('--station') + 1] if '--station' in _args else None
if STATION: _args = [a for a in _args if a not in ('--station', STATION)]
STATION = STATION or 'loom'   # the Loom is the kit's own page (dist/loom-chasms.html) until station 1 is built
OUT = _args[0] if _args else ('loom-chasms.html' if STATION == 'loom' else 'loom-chasms-%s.html' % STATION)
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
P = lambda *a: os.path.normpath(os.path.join(ROOT, *a))

import json as _json
_sd = os.path.join(HERE, 'stations', STATION)
if not os.path.isdir(_sd): sys.exit('build.py: no station ' + STATION + ' (stations/' + STATION + '/)')
if not os.path.isfile(os.path.join(_sd, '44w-host-land.js')): sys.exit('build.py: station ' + STATION + ' is a record only (no 44w-host-land.js yet): PLAN.md section 7')
SJ = {}
if os.path.isfile(os.path.join(_sd, 'station.json')):
    with open(os.path.join(_sd, 'station.json'), encoding='utf-8') as _fh: SJ = _json.load(_fh)

PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
# a STATION's fragments (stations/<name>/, numbered): added to src/'s, a name in both is the station's; a "base" station's first
for _st in ([SJ['base']] if SJ.get('base') else []) + [STATION]:
    _d = os.path.join(HERE, 'stations', _st)
    for f in sorted(os.listdir(_d)):
        if re.match(r'\d', f): PATH[f] = os.path.join(_d, f)
# core/terrain, opt-in by name (core/README.md "terrain/"): 35 KSTRATA (the walls' flood basalt, the chaos's ochre caps: 44r's recipes), 37 KSTACKS
# (the dikes' fins, the channels' buttes, the Deep's knobs, the horn's tors), 38 KRELIEF (the wadis, the pavement), 38c its landforms (the headwall's
# channels: stepcut), 43 KGROUND, 44 KFAR (the walls 30-120 km off, from the scale model), 45 KHORIZON (their shade). Not listed until drawn (PLAN.md
# section 8): 37c KRUBBLE, 39 KCAVERN with 39b KSPELEO (the amethyst geodes). A local src/ copy wins.
CORE_TERRAIN = ['35-core-strata.js', '37-core-stacks.js', '38-core-relief.js', '38c-core-landforms.js', '43-core-ground.js', '44-core-farfield.js',
                '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))   # after 35 (Span's lesson: keyed 35z)
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))
# the biome core from core/biome (core/README.md): one copy for every kit. 31b the leaf set (a hand-listed core must name it: BIO.leafOn),
# 31j a limb's joint, 32 kin and variant pools (BIO.kin: the neighbours' species), 33 the fungoid parts, 34 impostors, 35 anim, 37 traps
# (KTRAPS.cycle: the clock core/hazard runs on), 41 the environmental fields, 44 the stage
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js',
              '33-core-fungoid.js', '34-core-impostor.js', '35-core-anim.js', '37-core-traps.js', '40-core-place.js', '41-core-env.js',
              '42-core-export.js', '43-core-export-host.js', '44-core-stage.js', '45-core-span.js']   # 45 KSPAN: the living cables (PLAN.md section 4)
for f in CORE_BIOME:
    PATH.setdefault(f, P('core', 'biome', f))
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume is a core/tags record
for f, d in {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}.items():
    PATH.setdefault(f, P('core', d, f))
# core/export (core/export/README.md): the krator-world container; the biome core fills it
for f in ['07-core-export.js', '09-core-export-adapters.js']:
    PATH.setdefault(f, P('core', 'export', f))
# core/space (KSPACE: the spatial index the core's keep-clear and scatter read)
PATH.setdefault('20-core-space.js', P('core', 'space', '20-core-space.js'))
# core/hazard (KHAZ, PLAN.md section 6): the heat, the thin air and the cold as ambient fields (KHAZ.provide), falls, rockfall and the gas
# in the Deep's hollows as records; 21 the flow (gas pooled on a floor: shape.pool)
PATH.setdefault('20-core-hazard.js', P('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js', P('core', 'hazard', '21-core-hazard-flow.js'))
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock, the panel and the probe, the inspector, the
# polygon tool and the rest of the interface. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy wins.
sys.path.insert(0, P('core', 'host'))
import host as khost
khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the wave field and the sky's light, bound by 89a (ATMOS.bindHost);
# the weather and its selector; the shared sky (ATMOS.skyBiome at the station's place); height fog, the rain cover, the dust and the air's
# load (KHAZ's dust and sight), lightning; the heat shimmer over the hot floor (fx/shimmer, PLAN.md section 8) and the dust season
for f in ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js',
          '89-atmos-4-weather.js', '89-atmos-9-host.js', '89-atmos-3-particles.js', '89-atmos-3d-dust.js']:
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js']:
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ['89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js']:
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ['89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-airload.js', '89-atmos-fx-shimmer.js', '89-atmos-fx-dustseason.js']:
    PATH[f] = P('core', 'atmos', 'fx', f)
# core/water (core/water/README.md): the chasm has no standing water (PLAN.md section 1); the post's cistern is a still (station 1) and the
# fields path (ext/60) reads whatever surfaces a station has, none being a real answer
for f in ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']:
    PATH.setdefault(f, P('core', 'water', f))
for f in ['54-core-water-kinds-ext.js', '54b-core-water-kinds-ext-draw.js', '56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js']:
    PATH.setdefault(f, P('core', 'water', 'ext', f))
# core/shadow (KSHADOW): toggleable and off at load (89z attaches it; ?shadow=1 or core's button)
PATH.setdefault('10-core-shadow.js', P('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', P('core', 'shadow', 'host', '12-core-shadow-host.js'))
# the material library (core/materials/record): the record and its browser half
for f in ['23-mat-record.js', '25-matlib-host.js']:
    PATH.setdefault(f, P('core', 'materials', 'record', f))
# the Great Chasm's strata recipes (KSTRATA.add: the flood basalt, the ochre caps, the floor's komatiite) and GCH_STRATA, read in place
PATH.setdefault('44r-biome-greatchasm-strata.js', P('biomes', 'greatchasm', 'src', '44r-biome-greatchasm-strata.js'))
# a station's extra core fragments (station.json "core": {"<slot>": "<path from the repo root>"})
for slot, rel in sorted(SJ.get('core', {}).items()):
    PATH[slot] = P(*rel.split('/'))
miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
# the library pack (tools/textures/matlib_pack.py): the packs of the library textures materials.json names, from the committed tex/
sys.path.insert(0, P('tools', 'textures'))
import matlib_pack
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'loom-chasms', own=True), khost.EDITS_JS: khost.edits_js(HERE, 'loom-chasms')}
# THE NEIGHBOURS' SPECIES, read in place (riftrim's form; src/87-host-kin.js grows them): each kit's fragments slot after the host stage (45) and
# before this kit (50), in their own registry, closed by a one-line kitEnd; its pack carries only the families those builders draw with
NEIGH = {k: tuple(v) for k, v in SJ.get('kin', {}).items()}
for _i, (_k, _row) in enumerate(sorted(NEIGH.items())):
    _fs, _api, _keep = _row[:3]; _reg = _row[3] if len(_row) > 3 else _k.split('/')[0]
    _d = os.path.normpath(os.path.join(HERE, '..', _k.split('/')[0])); _c = 'abcdefgh'[_i]; _kk = _k.replace('/', '-')
    for _j, _f in enumerate(_fs): PATH['47%s%d-%s' % (_c, _j, os.path.basename(_f))] = os.path.join(_d, _f)
    VIRTUAL['47%s-%s-open.js' % (_c, _kk)] = chr(10) + "BIO.kit('%s');   // its own registry" % _reg + chr(10)
    VIRTUAL['47%s9-%s-end.js' % (_c, _kk)] = chr(10) + "BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)" % (_reg, _api) + chr(10)
    _pj = os.path.join(_d, 'tex', 'pack.json'); _fam = []
    if os.path.isfile(_pj):
        with open(_pj, encoding='utf-8') as _fh: _fam = sorted(_json.load(_fh).get('families', {}))
    VIRTUAL['44%s-host-matlib-pack-%s.js' % (_c, _kk)] = matlib_pack.fragment(_d, _reg, exclude=[] if _keep == '*' else [f for f in _fam if f not in _keep])
# THE FAUNA (kits/fauna, one kit for every animal): a station's groups (station.json "fauna": [group...]), bundled as KratorFauna with vertex
# colours only; the station's host places them. --no-fauna leaves the bundle out (the host then places none)
if SJ.get('fauna') and '--no-fauna' not in sys.argv:
    sys.path.insert(0, P('kits', 'fauna'))
    import fauna_bundle
    VIRTUAL['39-host-fauna.js'] = fauna_bundle.bundle(SJ['fauna'], tex=False)
for f in VIRTUAL: PATH[f] = None
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
    else:
        with open(PATH[f], encoding='utf-8') as fh: s = fh.read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-host-' not in f and 'core-water' not in f and not re.match(r'47[a-h]', f):   # the neighbours' kits are their own builds' to lint
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh: fh.write(html)
# syntax check on the script body
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh: fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  ' + ('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki, encoding='utf-8') as fh: op = [l for l in fh if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
