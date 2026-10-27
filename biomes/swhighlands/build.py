#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the SW highlands kit (PLAN.md), station 1, the ring folds.

  00-head.html      page shell, opens <script>
  07..44            the cores: export, rand, biome, space, tags, terrain, materials and the generated pack
  45-host-stage     HOST: renderer, the folds' terrain, the water courses, the fields, BIO.init -- runs before the kit
  47-host-land      HOST: the rock bodies (the arch, the natural bridges), the cave's carve patch, the strata
  50..79            BIOME LEAVES (the SW highlands' species, trees, floor, build)
  80..98            HOST (the far country and the farm, the ground, build order, the shared sky, the atmosphere, the water)
                    and the host shell (core/host)
  99-host-take      the page handed to core/host; 99-tail.html closes <script>

Started from biomes/nhighlands/build.py (PLAN.md, "Core adoption"). The core and the biome leaves never reference a host
global except through BIO.host (BIOME-API.md); the FORBID scan below fails the build if a kit fragment grows a dependency
on one world's engine.
"""
import os, re, subprocess, sys

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import os as _os, subprocess as _sp, sys as _sys
_cp = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))), 'tools', 'check_port.py')
if _os.path.isfile(_cp) and '--no-checks' not in _sys.argv and \
        _sp.call([_sys.executable, _cp, '--quiet', _os.path.dirname(_os.path.abspath(__file__))]) != 0:
    _sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places (the newest first). None when there
    is none: the build then says plainly that the syntax was NOT checked. Every build.py carries this same function."""
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
# STATIONS (PLAN.md section 7): `--station <name>` overlays stations/<name>/*.js on src/ (a fragment of the same name wins, a
# name 'drop:<file>' in stations/<name>/DROP drops one) and writes dist/swhighlands-<name>.html; no flag: station 1, the ring folds
STATION = next((sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == '--station' and i + 1 < len(sys.argv)), None)
OUT = next((a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith('--') and sys.argv[i - 1] != '--station'),
           'swhighlands-%s.html' % STATION if STATION else 'swhighlands.html')
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
core = lambda *p: os.path.normpath(os.path.join(ROOT, 'core', *p))
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    SD = os.path.join(HERE, 'stations', STATION)
    if not os.path.isdir(SD):
        sys.exit('build.py: no station ' + STATION)
    for f in os.listdir(SD):
        if f.endswith(('.js', '.html')):
            PATH[f] = os.path.join(SD, f)
    dp = os.path.join(SD, 'DROP')
    if os.path.isfile(dp):
        with open(dp, encoding='utf-8') as fh:
            for ln in fh:
                ln = ln.strip()
                if ln and not ln.startswith('#'):
                    PATH.pop(ln, None)
# core/terrain (core/README.md "terrain"): the field (KFIELD: the ground baked once, the heightfield the page and Godot read), strata (the ringfold recipe, KSTRATA, and its three.js shader), carve (the cave's mouth),
# stacks (the arch, the natural bridges), relief (ranges, gaps, the river's levels, the farm's fields), the ground's library layers
# (KGROUND), the far field (KFAR) and the terrain's shadows (KHORIZON). A src/ copy with the same name wins.
CORE_TERRAIN = ['30-core-field.js', '35-core-strata.js', '36-core-carve.js', '37-core-stacks.js', '38-core-relief.js', '43-core-ground.js',
                '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, core('terrain', f))
for f in ('44-core-farfield-draw.js', '45-core-horizon-shade.js'):
    PATH.setdefault(f, core('terrain', 'host', f))
# the strata shader's half reads KSTRATA when it loads (it does not merge into a later data half as KHORIZON's and KFAR's do), so
# it is slotted to sort AFTER 35-core-strata.js; the core README's "Adopting it" names it 35-core-strata-shade.js (KNOWN_ISSUES.md)
PATH.setdefault('35z-core-strata-shade.js', core('terrain', 'host', '35-core-strata-shade.js'))
# the biome core: one copy for every kit; the fungoid parts (BIO.fung) and the octahedral impostors opt in by name
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '33-core-fungoid.js',
              '34-core-impostor.js', '40-core-place.js', '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
for f in CORE_BIOME:
    PATH.setdefault(f, core('biome', f))
# core/rand and core/tags: KRAND seeds every field and placement cell; with BIO.init({tags}) everything placed is a record
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
for f, d in CORE_TAGS.items():
    PATH.setdefault(f, core(d, f))
# core/export: the krator-world container, filled by the biome core (42, 43) and the adapters
CORE_EXPORT = ['07-core-export.js', '09-core-export-adapters.js']
for f in CORE_EXPORT:
    PATH.setdefault(f, core('export', f))
# core/space (KSPACE): the keep-clear between trees, the core's obstacle index, the water courses' segment index
CORE_SPACE = ['20-core-space.js']
for f in CORE_SPACE:
    PATH.setdefault(f, core('space', f))
# the host shell (core/host/README.md): the whole interface, as nhighlands takes it. src/99-host-take.js hands it the page.
sys.path.insert(0, core('host'))
import host as khost
CORE_HOST = khost.FULL
khost.resolve(PATH, CORE_HOST)
# the material library (core/materials/record) and the GENERATED pack of the textures materials.json names (tools/textures/pack.py
# writes tex/; without tex/pack.json the pack is empty and the kit keeps its procedural textures)
for f in ('23-mat-record.js', '25-matlib-host.js'):
    PATH.setdefault(f, core('materials', 'record', f))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'swhighlands'), khost.EDITS_JS: khost.edits_js(HERE, 'swhighlands')}
# THE TREELINE reads the eastern highlands' kit in place (PLAN.md section 3: the glass tower is ehighlands' own, not a new species):
# its species and its trees (EHIGH.make / grow, one plant alone), slotted after the host stage and before this kit, its registry
# closed by stations/treeline/47c-host-ehigh-end.js; its pack's slots go with it
if STATION == 'treeline':
    EH = os.path.normpath(os.path.join(HERE, '..', 'ehighlands'))
    PATH['47a-ehigh-species.js'] = os.path.join(EH, 'src', '50-biome-ehigh-species.js')
    PATH['47b-ehigh-trees.js'] = os.path.join(EH, 'src', '55-biome-ehigh-trees.js')
    VIRTUAL['44b-host-matlib-pack-ehigh.js'] = matlib_pack.fragment(EH, 'ehigh')
    # snow that lies while it falls (core/atmos/fx: ATMOS.snowCover, ATMOS.snowOn on every lit material; the owner, 2026-10-27)
    PATH['89-atmos-fx-snowcover.js'] = core('atmos', 'fx', '89-atmos-fx-snowcover.js')
for f in VIRTUAL:
    PATH[f] = None
# core/atmos: its core, presets, weather, export, the wave field and the sky's light, bound by 89a-host-atmos.js
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-4-weather.js', '89-atmos-8-export.js', '89-atmos-9-host.js',
              '89-atmos-a-waves.js', '89-atmos-b-skylight.js']
for f in CORE_ATMOS:
    PATH.setdefault(f, core('atmos', f))
PATH['89-atmos-c-hostbind.js'] = core('atmos', 'host', '89-atmos-c-hostbind.js')   # ATMOS.bindHost
# the shared sky (core/atmos/SKY-PLAN.md section 9) and its biome call (src/89s-host-sky.js: ATMOS.skyBiome); the weather's host
# (ATMOS.bindWeather), height fog (R1) with its sky chunk, the rain occlusion map (R10)
for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js']:
    PATH[f] = core('atmos', 'sky', f)
for f in ['89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js']:
    PATH[f] = core('atmos', 'host', f)
PATH['89-atmos-fx-raincover.js'] = core('atmos', 'fx', '89-atmos-fx-raincover.js')
# core/water: the river through the gap, the cave stream, the gorge and its falls, the sink pool (records in 45, drawn in 89w)
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER:
    PATH.setdefault(f, core('water', f))
# core/water/ext: the cave stream's mouth on the river as one water (WATER.confluence: the ground's shore, one current)
for f in ['55-core-water-confluence.js', '55b-core-water-confluence-draw.js']:
    PATH[f] = core('water', 'ext', f)
miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
    else:
        with open(PATH[f], encoding='utf-8') as fh:
            s = fh.read()
    n = int(re.match(r'(\d+)', f).group(1))
    own = PATH[f] is not None and os.path.dirname(PATH[f]) == SRC
    if 10 <= n < 80 and '-host-' not in f and own:   # this kit's own fragments
        for w in FORBID:
            if w in s:
                bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  ' + ('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki, encoding='utf-8') as fh:
        op = [l for l in fh if l.startswith('- [ ]')]
    if op:
        print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
