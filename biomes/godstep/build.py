#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Godstep valley kit (PLAN.md).

  00-head.html      page shell, opens <script>
  10..49            BIOME CORE  (core/biome, core/terrain, core/rand, core/tags, core/water: engine-independent)
  45-host-stage     HOST binding (renderer, the station's frame, the field, BIO.init) -- must run before 50
  50..79            BIOME LEAVES (Godstep: its ground classes, its items, its passes, build)
  80..98            HOST (the far country, the ground, build, sky, atmosphere, water, the station's views and checks)
  99-tail.html      closes <script>

STATIONS (PLAN.md section 7). Station 1, the stair, is src/ itself (src/station.json):
  python3 build.py                     station 1, the stair: src/ -> dist/godstep.html
  python3 build.py --station <name>    stations/<name>/: its numbered fragments replace src/'s of the same name; its station.json
                                       names the page ("out"), its region, its bake, its water and its texture families
                                       (rille, hearths, redlands, wall: PLAN.md section 7; NOTES.md says how each is made)

Started from biomes/godthrone (the same rock, the same host: PLAN.md "Core adoption"). The core and the biome leaf never
reference a host global except through BIO.host (see BIOME-API.md); build.py greps for the forbidden names so a biome
fragment cannot quietly grow a dependency on one world's engine.
"""
import os, re, subprocess, sys, json, hashlib

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
STATION = sys.argv[sys.argv.index('--station') + 1] if '--station' in sys.argv else None
STN_DIR = os.path.join(HERE, 'stations', STATION) if STATION else SRC
if STATION and not os.path.isdir(STN_DIR):
    sys.exit('build.py: no station %s (stations/%s/)' % (STATION, STATION))
with open(os.path.join(STN_DIR, 'station.json'), encoding='utf-8') as _fh:
    STN = json.load(_fh)
OUT = STN['out']
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
NUM = lambda f: re.match(r'\d', f) and (f.endswith('.js') or f.endswith('.html'))
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if NUM(f)}
if STATION:
    # station 1's own fragments that are not every station's (station.json "drop", default its views and checks: a station brings its own 98)
    for f in STN.get('drop', ['98-host-stair.js']): PATH.pop(f, None)
    for f in os.listdir(STN_DIR):
        if NUM(f): PATH[f] = os.path.join(STN_DIR, f)   # numbered fragments only (a station's bake script is not one)

# core/terrain (core/README.md, "terrain"): the field (KFIELD), the strata (KSTRATA: tibasalt-ponded on every front), the landforms
# (KRELIEF: the stair, the old cones; 38b its lava forms: the tumuli), the ground's layers and kinds (KGROUND), the far field (KFAR)
# and the terrain's horizon (KHORIZON); KLAVA (46, 46b: the flows' bake, run at build time, its layers the lip's beds)
CORE_TERRAIN = ['30-core-field.js', '35-core-strata.js', '38-core-relief.js', '38b-core-relief-lava.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, J('core', 'terrain', f))
PATH.setdefault('45a-core-lava.js', J('core', 'terrain', '46-core-lava.js'))
PATH.setdefault('45a1-core-lava-layers.js', J('core', 'terrain', '46b-core-lava-layers.js'))
for f in ('44-core-farfield-draw.js', '45-core-horizon-shade.js'):
    PATH.setdefault(f, J('core', 'terrain', 'host', f))
PATH.setdefault('35s-core-strata-shade.js', J('core', 'terrain', 'host', '35-core-strata-shade.js'))   # after 35 ('-' < '.')
# core/biome: the kit, the foliage, the leaf set (BIO.leafOn, which the kit's scatter calls), the fungoid parts (BIO.fung: the lava pioneers' crusts and cushions), placement, the field contract
# (41: BIO.env), export, the stage
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '33-core-fungoid.js', '40-core-place.js', '41-core-env.js', '42-core-export.js', '43-core-export-host.js', '44-core-stage.js']
for f in CORE_BIOME:
    PATH.setdefault(f, J('core', 'biome', f))
# core/rand and core/tags: with BIO.init({tags}) every item set, instance and registered volume is a core/tags record
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
for f, d in CORE_TAGS.items():
    PATH.setdefault(f, J('core', d, f))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, J('core', 'export', f))
PATH.setdefault('20-core-space.js', J('core', 'space', '20-core-space.js'))   # core/space (KSPACE)
# core/shadow (KSHADOW; the owner, 2026-11-03: toggleable, OFF at page load): src/89zz-host-shadow.js attaches it under ?shadow=1
PATH.setdefault('10-core-shadow.js', J('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', J('core', 'shadow', 'host', '12-core-shadow-host.js'))
# core/hazard (KHAZ): the cold, the fronts' falls, the ambient bridge; its clock
PATH.setdefault('20-core-hazard.js', J('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('37-core-traps.js', J('core', 'biome', '37-core-traps.js'))
# core/water (core/water/README.md): the meltwater ponds behind the lobes as stills (station.json "water" adds a station's own), the
# shore's fields (ext/60), the audit (ext/57), the reflections switch (ext/58, off at load), by path
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER:
    PATH.setdefault(f, J('core', 'water', f))
for f in ('57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js'):
    PATH.setdefault(f, J('core', 'water', 'ext', f))
for f in STN.get('water', []):
    PATH[os.path.basename(f)] = J('core', 'water', f)
# the host shell from core/host: the whole interface
sys.path.insert(0, J('core', 'host'))
import host as khost
khost.resolve(PATH, khost.FULL)
# the material library (core/materials/record) and the GENERATED pack of the textures materials.json names
for f in ('23-mat-record.js', '25-matlib-host.js'):
    PATH.setdefault(f, J('core', 'materials', 'record', f))
sys.path.insert(0, J('tools', 'textures'))
import matlib_pack
# THE PAGE'S TEXTURE SETS: the families station.json "tex" names (a station's sets do not ride on every page)
_pj = os.path.join(HERE, 'tex', 'pack.json')
_fams = list(json.load(open(_pj, encoding='utf-8')).get('families', {})) if os.path.isfile(_pj) else []
_take = set(STN.get('tex', _fams))
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'godstep', exclude=[f for f in _fams if f not in _take]), khost.EDITS_JS: khost.edits_js(HERE, 'godstep')}
# THE STATION'S REGION (station.json "region": written by biomes/godthrone/tools/region.py from scale model 5.1, read in place): the far
# country's heights round the site, inlined as REGION_DATA (45a5 reads it past the map)
if STN.get('region'):
    VIRTUAL['45a3-host-region-data.js'] = '/* GENERATED from %s (biomes/godthrone/tools/region.py; do not edit) */\nconst REGION_DATA=%s;\n' % (
        STN['region'], open(os.path.join(STN_DIR, STN['region']), encoding='utf-8').read().strip())
# THE STATION'S BAKE (station.json "bake": {"script", "out", "name", "slot", "inputs", "block"}): a deterministic node bake (the plains'
# frozen flows: KLAVA.bakeLayers) whose result is committed beside the station and inlined as a generated fragment; re-run only when the
# hash of its inputs changes (the marked block of the model and the core files it runs)
if STN.get('bake'):
    bk = STN['bake']; outp = os.path.join(STN_DIR, bk['out']); hh = hashlib.sha256()
    for f in bk.get('inputs', []): hh.update(open(J(*f.split('/')), 'rb').read())
    if bk.get('block'):
        txt = open(os.path.join(STN_DIR, bk['block'][0]), encoding='utf-8').read()
        hh.update(txt[txt.index(bk['block'][1]):txt.index(bk['block'][2])].encode('utf-8'))
    hx = hh.hexdigest()[:16]
    cur = json.load(open(outp, encoding='utf-8')).get('hash') if os.path.isfile(outp) else None
    if cur != hx:
        node = find_node()
        if not node: sys.exit('build.py: %s is stale (or missing) and there is no node to bake it' % bk['out'])
        print('baking %s (its inputs changed) ...' % bk['out'])
        if subprocess.call([node, os.path.join(STN_DIR, bk['script']), outp, hx]) != 0: sys.exit('build.py: the bake failed')
    VIRTUAL[bk.get('slot', '45a2-host-bake-data.js')] = '/* GENERATED from %s (do not edit) */\nconst %s=%s;\n' % (bk['out'], bk['name'], open(outp, encoding='utf-8').read().strip())
# A SHARED KIT'S OWN PACK (station.json "packs": e.g. "biomes/sedesert", its library sets read as a second pack, as godthrone's build does;
# ["biomes/sedesert", ["family", ...]] takes only those families, so a neighbour's whole pack does not ride on the page)
for _i, _k in enumerate(STN.get('packs', [])):
    _kp, _only = (_k, None) if isinstance(_k, str) else (_k[0], set(_k[1]))
    _kd = J(*_kp.split('/')); _kj = os.path.join(_kd, 'tex', 'pack.json')
    _kf = list(json.load(open(_kj, encoding='utf-8')).get('families', {})) if os.path.isfile(_kj) else []
    VIRTUAL['44p%d-host-matlib-pack-%s.js' % (_i, os.path.basename(_kp))] = matlib_pack.fragment(_kd, os.path.basename(_kp), exclude=[f for f in _kf if _only is not None and f not in _only])
# core/mask (KMASK: 25-core-mask.js, 27-core-mask-distance.js) is a station's read: the sites it paints as polygons (the rille's stalk fields,
# the redlands' pan, the wall's terraces) rasterised as data, never a DOM canvas's pixels, and placement reads them there
# A STATION'S READS (station.json "reads": {slot: path from the repo root}): the core pieces a station takes beyond station 1's (KCAVERN,
# KTHERM, the basin, the stacks, the breath) and the neighbour kits' fragments it reads in place (the Hearths, the sedesert, the shighlands),
# as godthrone's build reads them; the slot names their order
for _slot, _p in STN.get('reads', {}).items():
    PATH[_slot] = J(*_p.split('/'))
for f in VIRTUAL: PATH[f] = None
# core/atmos: its core, presets, particles (the spindrift), the weather and its selector, export, the sky's light, waves; bound by
# 89a-host-atmos.js (ATMOS.bindHost, ATMOS.bindWeather); the shared sky (89-host-sky.js); height fog; snow that lies; the air's load
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js', '89-atmos-8-export.js',
          '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH.setdefault(f, J('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = J('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = J('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-airload.js', '89-atmos-fx-snowcover.js'):
    PATH[f] = J('core', 'atmos', 'fx', f)
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
