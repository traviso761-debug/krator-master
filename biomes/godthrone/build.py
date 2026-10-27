#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Godthrone kit (PLAN.md).

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (core/biome, core/terrain, core/rand, core/tags: engine-independent)
  45-host-stage     HOST binding (renderer, the caldera, the field, BIO.init) -- must run before 50
  50..79            BIOME LEAVES (the Godthrone: its items, its ground passes, build)
  80..98            HOST (the far field, the ground, the vent, build, sky, atmosphere, camera, probe)
  99-tail.html      closes <script>

STATIONS (PLAN.md section 7), as the Throne's (biomes/throne/build.py):
  python3 build.py                     station 1, the summit vent: src/ as it is -> dist/godthrone.html
  python3 build.py --station flank     stations/flank/: its fragments replace src/'s of the same name; its station.json
                                       names the page ("out") and the core/water fragments it draws with ("water")

The core and the biome leaf never reference a host global except through BIO.host (see BIOME-API.md); build.py greps for
the forbidden names so a biome fragment cannot quietly grow a dependency on one world's engine.
"""
import os, re, subprocess, sys, json

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
# tools/check_port.py checks this build before anything else; --no-checks skips it like the other checks.
_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
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


HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
J = lambda *p: os.path.normpath(os.path.join(ROOT, *p))
OUT = 'godthrone.html'
STATION = None; STN = {}
if '--station' in sys.argv:
    STATION = sys.argv[sys.argv.index('--station') + 1]
    STN_DIR = os.path.join(HERE, 'stations', STATION)
    STN = json.load(open(os.path.join(STN_DIR, 'station.json'), encoding='utf-8'))
    OUT = STN['out']
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'): PATH[f] = os.path.join(STN_DIR, f)

# core/terrain (core/README.md, "terrain"): the field (KFIELD: the ground baked once), the strata (KSTRATA: the tibasalt
# recipe on every rock face, the ledge pass), the landforms (KRELIEF: talus at the scarps' feet), the ground shader's layers
# and kinds (KGROUND), the far field (KFAR) and the terrain's horizon (KHORIZON); the three.js halves by explicit path
CORE_TERRAIN = ['30-core-field.js', '35-core-strata.js', '38-core-relief.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, J('core', 'terrain', f))
for f in ('44-core-farfield-draw.js', '45-core-horizon-shade.js'):
    PATH.setdefault(f, J('core', 'terrain', 'host', f))
# the strata's three.js half reads KSTRATA when it loads (it does not merge into a later data half, as 44's and 45's do):
# keyed to sort AFTER 35-core-strata.js ('35-core-strata-shade.js' sorts before it: '-' < '.')
PATH.setdefault('35s-core-strata-shade.js', J('core', 'terrain', 'host', '35-core-strata-shade.js'))
# core/biome: no impostors (nothing tall stands at the summit), no foliage extras (no plants)
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js', '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
for f in CORE_BIOME:
    PATH.setdefault(f, J('core', 'biome', f))
# core/rand and core/tags: with BIO.init({tags}) every item set, instance and registered volume is a core/tags record
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
for f, d in CORE_TAGS.items():
    PATH.setdefault(f, J('core', d, f))
# core/export (the krator-world container) and core/space (KSPACE)
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, J('core', 'export', f))
CORE_SPACE = ['20-core-space.js']
for f in CORE_SPACE:
    PATH.setdefault(f, J('core', 'space', f))
# core/terrain's KLAVA (core/terrain/LAVA.md, "Adopting it"): the lake's overflow on the vent's page, behind its ?overflow
# (89d-host-overflow.js); the surface and the GPU stepper (checked against the CPU by the page's verify) by explicit path
PATH.setdefault('46-core-lava.js', J('core', 'terrain', '46-core-lava.js'))
PATH.setdefault('46s-core-lava-draw.js', J('core', 'terrain', 'host', '46-core-lava-draw.js'))
PATH.setdefault('46t-core-lava-gpu.js', J('core', 'terrain', 'host', '46-core-lava-gpu.js'))
# core/hazard (core/hazard/README.md, "Adopting it"): the lava, the vents, the hot ground, the ambient bridge; its clock
PATH.setdefault('20-core-hazard.js', J('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('37-core-traps.js', J('core', 'biome', '37-core-traps.js'))
# the host shell from core/host: the whole interface
sys.path.insert(0, J('core', 'host'))
import host as khost
khost.resolve(PATH, khost.FULL)
# the material library (core/materials/record) and the GENERATED pack of the textures materials.json names
for f in ('23-mat-record.js', '25-matlib-host.js'):
    PATH.setdefault(f, J('core', 'materials', 'record', f))
sys.path.insert(0, J('tools', 'textures'))
import matlib_pack
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'godthrone'), khost.EDITS_JS: khost.edits_js(HERE, 'godthrone')}
for f in VIRTUAL: PATH[f] = None
# core/atmos: its core, presets, the glow layer (the crack's and the throat's glow: ATMOS.buildGlow), particles (the fume), the weather (ash) and its selector, export, the sky's light; bound by
# 89a-host-atmos.js (ATMOS.bindHost, ATMOS.bindWeather); the shared sky with thin air (89-host-sky.js); the lava surface
# (the vent's throat), the air's load (the ash) and the branched lightning (the ash storm)
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-2-lights.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js', '89-atmos-8-export.js',
          '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH.setdefault(f, J('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
    PATH[f] = J('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js'):
    PATH[f] = J('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-lava.js', '89-atmos-fx-airload.js', '89-atmos-fx-lightning.js'):
    PATH[f] = J('core', 'atmos', 'fx', f)
# core/water, by station (PLAN.md section 9a): station 1 (the summit, 22-25 km, 0.07-0.11 atm) has no liquid water and
# lists none; a station that has water names its fragments in station.json "water" (the bloodfalls: falls, brine, ice)
CORE_WATER = STN.get('water', [])
for f in CORE_WATER:
    PATH[os.path.basename(f)] = J('core', 'water', f)
miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else open(PATH[f], encoding='utf-8').read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-host-' not in f and not (PATH[f] and os.path.normpath(PATH[f]).startswith(J('core'))):
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n').write(html)
# syntax check on the script body
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf-8', newline='\n').write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  ' + ('syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    op = [l for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
