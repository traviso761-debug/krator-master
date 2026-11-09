#!/usr/bin/env python3
"""Concatenate src/* and a station's fragments (filename order) into dist/<target>.html: the Twins kit (PLAN.md).

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (core/biome, core/terrain, core/rand, core/tags: engine-independent)
  44a, 45b          HOST: the station (its names, its square) and its ground model (stations/<name>/)
  45-host-stage     HOST binding (renderer, the frame, the field, BIO.init) -- must run before 50
  50..79            BIOME LEAVES (the Twins: its ground classes, its items, its passes, build)
  80..98            HOST (the far field, the ground, the station's own structures, build, sky, atmosphere, views)
  99-tail.html      closes <script>

STATIONS (PLAN.md section 6), as the Godthrone's (biomes/godthrone/build.py), started from it (README.md, "CORE MODULES ARE NOT
OPTIONAL": a station set starts from the nearest finished one). EVERY PAGE IS A STATION: src/ holds what they share, and
stations/<name>/ the station's own fragments (they replace src/'s of the same name) and its station.json:
  python3 build.py                       station 1, the pyroduct (stations/pyroduct) -> dist/twins.html
  python3 build.py --station <name>      stations/<name>/ -> its station.json "out"
station.json: "out" (the page), "region" (the far country, written by biomes/godthrone/tools/region.py --kit biomes/twins),
"reads" ({slot: path from the repo root}: core pieces and other kits' fragments read in place), "water" (core/water fragments),
"tex" (the library sets the page takes beyond BASE_TEX).

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
sys.path.insert(0, J('tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
BSRC.variants([['--station', _s] for _s in sorted(os.listdir(os.path.join(HERE, 'stations'))) if os.path.isfile(os.path.join(HERE, 'stations', _s, 'station.json'))])
STATION = sys.argv[sys.argv.index('--station') + 1] if '--station' in sys.argv else 'pyroduct'
STN_DIR = os.path.join(HERE, 'stations', STATION)
STN = json.load(open(os.path.join(STN_DIR, 'station.json'), encoding='utf-8'))
OUT = STN['out']
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
for f in os.listdir(STN_DIR):
    if (f.endswith('.js') or f.endswith('.html')) and re.match(r'\d', f): PATH[f] = os.path.join(STN_DIR, f)

# core/terrain (core/README.md, "terrain"): the field (KFIELD: the ground baked once), the strata (KSTRATA: the tibasalt recipe on every
# rock face, the ledge pass), the landforms (KRELIEF: talus at the scarps' feet), frost (KFROST: the sub-nival ground's polygons and
# solifluction lobes), the ground shader's layers and kinds (KGROUND), the far field (KFAR), the terrain's horizon (KHORIZON); the
# three.js halves by explicit path. KCAVERN (39: the lava tubes) is a station's read (station.json "reads")
CORE_TERRAIN = ['30-core-field.js', '35-core-strata.js', '38-core-relief.js', '42-core-frost.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, J('core', 'terrain', f))
for f in ('44-core-farfield-draw.js', '45-core-horizon-shade.js'):
    PATH.setdefault(f, J('core', 'terrain', 'host', f))
# the strata's three.js half reads KSTRATA when it loads: keyed to sort AFTER 35-core-strata.js (as godthrone's build does)
PATH.setdefault('35s-core-strata-shade.js', J('core', 'terrain', 'host', '35-core-strata-shade.js'))
# core/biome: the kit's items and their bake; the leafset (31b: the cards' stem path the kit's calls reach); the traps' one clock (37)
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '37-core-traps.js', '40-core-place.js', '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
for f in CORE_BIOME:
    PATH.setdefault(f, J('core', 'biome', f))
# core/rand and core/tags: with BIO.init({tags}) every item set, instance and registered volume is a core/tags record
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
for f, d in CORE_TAGS.items():
    PATH.setdefault(f, J('core', d, f))
# core/export (the krator-world container) and core/space (KSPACE)
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, J('core', 'export', f))
PATH.setdefault('20-core-space.js', J('core', 'space', '20-core-space.js'))
# core/shadow (KSHADOW: toggleable, OFF at page load, ?shadow=1; src/89zz-host-shadow.js)
PATH.setdefault('10-core-shadow.js', J('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', J('core', 'shadow', 'host', '12-core-shadow-host.js'))
# core/hazard (core/hazard/README.md, "Adopting it"): the cold, the thin air, the vents' gas and heat; the ambient bridge
PATH.setdefault('20-core-hazard.js', J('core', 'hazard', '20-core-hazard.js'))
# the host shell from core/host: the whole interface
sys.path.insert(0, J('core', 'host'))
import host as khost
khost.resolve(PATH, khost.FULL)
# the material library (core/materials/record) and the GENERATED pack of the textures materials.json names
for f in ('23-mat-record.js', '25-matlib-host.js'):
    PATH.setdefault(f, J('core', 'materials', 'record', f))
sys.path.insert(0, J('tools', 'textures'))
import matlib_pack
# THE PAGE'S TEXTURE SETS: what every station takes and what its station.json "tex" adds (a station's sets do not ride on every page)
BASE_TEX = ['groundDetail', 'rockFace', 'rock', 'obsidian', 'snow']
_pj = os.path.join(HERE, 'tex', 'pack.json')
_fams = list(json.load(open(_pj, encoding='utf-8')).get('families', {})) if os.path.isfile(_pj) else []
_take = set(BASE_TEX) | set(STN.get('tex', []))
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'twins', exclude=[f for f in _fams if f not in _take]), khost.EDITS_JS: khost.edits_js(HERE, 'twins')}
# A STATION'S REGION (station.json "region": written by biomes/godthrone/tools/region.py --kit biomes/twins from scale model 5.1): its
# far country's heights round the site, inlined as REGION_DATA (45-host-stage.js reads it: the ground past the station's own model)
if STN.get('region'):
    VIRTUAL['45a3-host-region-data.js'] = '/* GENERATED from %s (biomes/godthrone/tools/region.py; do not edit) */\nconst REGION_DATA=%s;\n' % (STN['region'], open(os.path.join(STN_DIR, STN['region']), encoding='utf-8').read().strip())
# A STATION'S READS (station.json "reads": {slot: path from the repo root}): core pieces and other kits' fragments it takes by path
for _slot, _p in STN.get('reads', {}).items():
    PATH[_slot] = J(*_p.split('/'))
for f in VIRTUAL: PATH[f] = None
# core/atmos: its core, presets, particles (the Twin's plume, the skylight's breath), the weather (graupel, rime-fog) and its selector,
# export, the sky's light; bound by 89a-host-atmos.js (ATMOS.bindHost, ATMOS.bindWeather); the shared sky (89-host-sky.js); snow that
# lies while it snows (fx/snowcover: the weather host's climate.cold)
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-2-lights.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js', '89-atmos-8-export.js',
          '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH.setdefault(f, J('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js'):
    PATH[f] = J('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js'):
    PATH[f] = J('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-snowcover.js',):
    PATH[f] = J('core', 'atmos', 'fx', f)
# core/water by path for a station that has water (station.json "water": paths under core/water); station 1 has none (a frozen scree)
for f in STN.get('water', []):
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
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
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
