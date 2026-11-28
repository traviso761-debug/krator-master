#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Tiers (PLAN.md), the Coyote Kingdom's staircase country.

  00-head.html      page shell, opens <script>
  10..44            BIOME CORE (core/biome) and the core modules the land takes (core/terrain, core/rand, core/tags, core/space,
                    core/drawn, core/export, core/hazard, core/water, core/hamlet with core/city's frontage cursor, the material library)
  44f               the STATION's far-field data: the scale model round its site (stations/<name>/44f-host-far-data.js, written by
                    stations/bake_far.py from tools/scale-model's data; never edited by hand)
  44r               THE KIT's rock: the `tiers` KSTRATA recipes (the Black, Red, White and Grey Steps), data
  44v               HOST: what the stations share (the land from the model and its parts: tiersLand)
  44w               the STATION's land (stations/<name>/44w-host-land.js): its ground, features, climate, hazards and views
  45-host-stage     HOST binding (renderer, the ground, the rock bodies, BIO.init) -- must run before 50
  47*               the NEIGHBOURS' species, read in place (station.json "kin"), each in its own registry
  50..79            THE KIT: the Tiers' own plants, which grow in tiers (PLAN.md section 4): species, trees, floor, build
  80..98            HOST (the far field, the station's settlement, the kin, the hazards, sky, air, water, build)
  99-host-take      the page handed to core/host
  99-tail.html      closes <script>

  python3 tools/build.py biomes/tiers                      dist/tiers.html: station 1, the Lake of the Tiers (stations/lake/)
  python3 tools/build.py biomes/tiers --station canyon     dist/tiers-canyon.html: station 2, Coyote Canyon (stations/canyon/)
  python3 tools/build.py biomes/tiers --station <name>     dist/tiers-<name>.html (PLAN.md section 9; the stations built so far:
                                                           STATIONS below)
  python3 tools/build.py biomes/tiers --stations           every station (NOT --all: tools/build.py takes --all as every build in the repo)
  (a plain `python3 build.py ...` re-runs itself through tools/build.py, so build-inputs.json is always written: item 25)

stations/<name>/station.json: "kin" {"<kit>": [[fragments], "<API>", [pack families] | "*"]} (the kits whose species the station grows, read in
place); "core" {"<slot>": "<path from the repo root>"} (extra core fragments this station takes); "base" "<station>" (a station whose numbered
fragments come first). Host hooks a station does not set are inert, so station 1's bytes do not move when another station adds one.

The core and the kit never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the forbidden names so a kit
fragment cannot quietly grow a dependency on one world's engine.
"""
import os, re, subprocess, sys, json

HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)

# the port lint first (tools/check_port.py: a fragment PORT.md tags [G data] must not touch the browser)
if '--no-checks' not in sys.argv and subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


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


STATIONS = ['lake', 'canyon', 'lip', 'tread']   # station 1 first (the owner, 2026-11-10), Coyote Canyon (T4), the Lip (T5: the sill drawn by this kit until the map edit), the Great Tread (T4)
BSRC.variants([['--station', _s] for _s in STATIONS[1:]])   # every station's page (--list-sources)
if '--stations' in sys.argv:
    _rc = 0
    for _s in STATIONS:
        _rc |= subprocess.call([sys.executable, os.path.abspath(__file__), '--station', _s] + [a for a in sys.argv[1:] if a != '--stations'])
    sys.exit(_rc)
_args = [a for a in sys.argv[1:] if not a.startswith('--') or a == '--station']
STATION = _args[_args.index('--station') + 1] if '--station' in _args else None
if STATION: _args = [a for a in _args if a not in ('--station', STATION)]
STATION = STATION or 'lake'   # station 1 is the kit's own page (dist/tiers.html)
OUT = _args[0] if _args else ('tiers.html' if STATION == 'lake' else 'tiers-%s.html' % STATION)
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
P = lambda *a: os.path.normpath(os.path.join(ROOT, *a))

_sd = os.path.join(HERE, 'stations', STATION)
if not os.path.isdir(_sd): sys.exit('build.py: no station ' + STATION + ' (stations/' + STATION + '/)')
SJ = {}
if os.path.isfile(os.path.join(_sd, 'station.json')):
    with open(os.path.join(_sd, 'station.json'), encoding='utf-8') as _fh: SJ = json.load(_fh)

PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
# a STATION's fragments (stations/<name>/, numbered): added to src/'s, a name in both is the station's; a "base" station's first
for _st in ([SJ['base']] if SJ.get('base') else []) + [STATION]:
    _d = os.path.join(HERE, 'stations', _st)
    for f in sorted(os.listdir(_d)):
        if re.match(r'\d', f): PATH[f] = os.path.join(_d, f)
# core/terrain, opt-in by name (core/README.md "terrain/"): 35 KSTRATA (the steps' beds: 44r's recipes) with its shade keyed 35z (Span's lesson),
# 37 KSTACKS (the riser's outliers on the shore and in the shallows), 38 KRELIEF (the Black Step's scarp, its talus, the pavement), 43 KGROUND,
# 44 KFAR (the stair past the map, from the scale model), 45 KHORIZON (its shade). Not listed until drawn (PLAN.md 10a): 36 KCARVE, 42 KFROST,
# 44g KGLACIER. A local src/ copy wins.
CORE_TERRAIN = ['35-core-strata.js', '37-core-stacks.js', '38-core-relief.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))
# the biome core (core/README.md): the minimum set (item 26: buildlib.CORE_BIOME_MIN, never listed by hand) and what this kit adds: 31j a limb's
# joint (the shelf oak's tiers off the bole), 32 kin and variant pools (BIO.kin: the neighbours' species), 35 anim, 37 traps (KTRAPS.cycle: the
# clock core/hazard runs on), 41 the environmental fields, 42/43 the export, 44 the stage
CORE_BIOME = buildlib.CORE_BIOME_MIN + ['core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js', 'core/biome/35-core-anim.js',
                                        'core/biome/37-core-traps.js', 'core/biome/41-core-env.js', 'core/biome/42-core-export.js',
                                        'core/biome/43-core-export-host.js', 'core/biome/44-core-stage.js']
for p in CORE_BIOME:
    PATH.setdefault(os.path.basename(p), P(*p.split('/')))
# core/drawn (item 28): the ground as drawn, for the eye and the audits (45 registers the ground's strip cells: KDRAWN.add)
PATH.setdefault('10-core-drawn.js', P('core', 'drawn', '10-core-drawn.js'))
# core/rand and core/tags (core/tags/README.md): with BIO.init({tags}) every item set, instance and registered volume is a core/tags record
for f, d in {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}.items():
    PATH.setdefault(f, P('core', d, f))
# core/export (core/export/README.md): the krator-world container; the biome core fills it
for f in ['07-core-export.js', '09-core-export-adapters.js']:
    PATH.setdefault(f, P('core', 'export', f))
# core/space (KSPACE: the spatial index the core's keep-clear, the kin and the village read)
PATH.setdefault('20-core-space.js', P('core', 'space', '20-core-space.js'))
# core/hazard (KHAZ, PLAN.md section 5): rockfall, the riser's edge, the lake's drop-off, wet tufa as records; pressure and temperature ambient
PATH.setdefault('20-core-hazard.js', P('core', 'hazard', '20-core-hazard.js'))
# and its flow (KHAZ.moveAt, drift): the flash floods' current that slows a walker and pulls him downstream (44g, 89f)
PATH.setdefault('21-core-hazard-flow.js', P('core', 'hazard', '21-core-hazard-flow.js'))
# core/hamlet (KHAMLET.village, PLAN.md section 6): the lake's fishing village as records, every building pending (KHAMLET.pendingRow('coyote'), in
# 32-hamlet-platform.js) until kits/coyote exists; its lanes laid by core/city's frontage cursor, read in place (33-city-strategies.js)
for f in ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '18-hamlet-names.js', '20-hamlet-cultures.js', '30-hamlet-village.js',
          '32-hamlet-platform.js']:
    PATH.setdefault(f, P('core', 'hamlet', f))
PATH.setdefault('33-city-strategies.js', P('core', 'city', '33-city-strategies.js'))
# the host shell from core/host (core/host/README.md): the camera, the frame loop and its clock, the panel and the probe, the inspector, the
# polygon tool and the rest of the interface. src/99-host-take.js hands it the page (KHOST.take). A local src/ copy wins.
sys.path.insert(0, P('core', 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])
# the shared atmosphere (core/atmos/README.md): its core, presets, export, the wave field and the sky's light, bound by 89a (ATMOS.bindHost);
# the weather and its selector; the shared sky (ATMOS.skyBiome at the station's place); height fog, the rain cover, lightning
for f in ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js',
          '89-atmos-4-weather.js', '89-atmos-9-host.js']:
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js']:
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ['89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js']:
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ['89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js']:
    PATH[f] = P('core', 'atmos', 'fx', f)
# core/water (core/water/README.md): the upper lake an open surface (WATER.open: no surf, no breakers, the calm share of the wave field), the
# step moss's rimstone pools down the seep (ext 53, 53b: WATER.terraces), the breakup (56), the audit (57), the mirror switch (58, off at load),
# the shore's fields (60) the flora reads
for f in ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']:
    PATH.setdefault(f, P('core', 'water', f))
# the terraces' data (53) is slotted 22t, after the flow (22) it needs and before the land (44w), which digs the step moss's pools into the ground
PATH.setdefault('22t-core-water-terraces.js', P('core', 'water', 'ext', '53-core-water-terraces.js'))
for f in ['53b-core-water-terraces-draw.js', '56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js',
          '60-core-water-fields.js']:
    PATH.setdefault(f, P('core', 'water', 'ext', f))
# core/shadow (KSHADOW): toggleable and off at load (89z attaches it; ?shadow=1 or core's button)
PATH.setdefault('10-core-shadow.js', P('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', P('core', 'shadow', 'host', '12-core-shadow-host.js'))
# the material library (core/materials/record): the record and its browser half
for f in ['23-mat-record.js', '25-matlib-host.js']:
    PATH.setdefault(f, P('core', 'materials', 'record', f))
# a station's extra core fragments (station.json "core": {"<slot>": "<path from the repo root>"})
for slot, rel in sorted(SJ.get('core', {}).items()):
    PATH[slot] = P(*rel.split('/'))
miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
# the library pack (tools/textures/matlib_pack.py): the packs of the library textures materials.json names, from the committed tex/
sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402
STATION_EXCLUDE = {
    'lake': ('bark.pine', 'cushion', 'ground.gravel', 'ground.litter', 'ground.pave', 'ground.reed', 'ground.tufa', 'pagoda', 'pinespray', 'rheumleaf'),
    'canyon': ('cushion', 'ground.gravel', 'ground.litter', 'ground.pave', 'ground.reed', 'ground.tufa', 'pad', 'pagoda'),
    'lip': ('bark.pine', 'cushion', 'ground.gravel', 'ground.pave', 'ground.reed', 'ground.terrace', 'ground.tufa', 'pagoda', 'pinespray', 'rheumleaf'),
    'tread': ('agaveblade', 'bark.cactus', 'bark.cornel', 'bark.juniper', 'bark.oak', 'bark.palm', 'bark.pine', 'bark.skirt', 'cornelbract', 'cornelplate', 'ground.litter', 'ground.meadow', 'ground.reed', 'ground.terrace', 'ground.tufa', 'irisblade', 'irisbloom', 'juniperpad', 'oakplate', 'pad', 'palmfan', 'pinespray', 'reed', 'stepfern', 'sumacplate', 'umbelleaf'),
}
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'tiers', own=True, exclude=STATION_EXCLUDE.get(STATION, ())), khost.EDITS_JS: khost.edits_js(HERE, 'tiers')}
# THE NEIGHBOURS' SPECIES, read in place (riftrim's form, the Great Chasm's 87-host-kin.js): each kit's fragments slot after the host stage (45)
# and before this kit (50), in their own registry, closed by a one-line kitEnd; its pack carries only the families those builders draw with
NEIGH = {k: tuple(v) for k, v in SJ.get('kin', {}).items()}
for _i, (_k, _row) in enumerate(sorted(NEIGH.items())):
    _fs, _api, _keep = _row[:3]; _reg = _row[3] if len(_row) > 3 else _k.split('/')[0]
    _d = os.path.normpath(os.path.join(HERE, '..', _k.split('/')[0])); _c = 'abcdefgh'[_i]; _kk = _k.replace('/', '-')
    for _j, _f in enumerate(_fs): PATH['47%s%d-%s' % (_c, _j, os.path.basename(_f))] = os.path.join(_d, _f)
    VIRTUAL['47%s-%s-open.js' % (_c, _kk)] = chr(10) + "BIO.kit('%s');   // its own registry" % _reg + chr(10)
    VIRTUAL['47%s9-%s-end.js' % (_c, _kk)] = chr(10) + "BIO.kit('%s');BIO.kitEnd(%s);   // its registry closed (its own page does it in a later fragment)" % (_reg, _api) + chr(10)
    _pj = os.path.join(_d, 'tex', 'pack.json'); _fam = []
    if os.path.isfile(_pj):
        with open(_pj, encoding='utf-8') as _fh: _fam = sorted(json.load(_fh).get('families', {}))
    VIRTUAL['44%s-host-matlib-pack-%s.js' % (_c, _kk)] = matlib_pack.fragment(_d, _reg, exclude=[] if _keep == '*' else [f for f in _fam if f not in _keep])
for f in VIRTUAL: PATH[f] = None
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
    else:
        with open(PATH[f], encoding='utf-8') as fh: s = fh.read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-host-' not in f and 'core-' not in f and 'hamlet' not in f and 'city-' not in f and not re.match(r'47[a-h]', f):
        for w in FORBID:   # the kit's own fragments (the core's and the neighbours' are their own builds' to lint)
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
