#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: the Cliff Lungs (biomes/clifflung/PLAN.md).

  00-head.html      page shell, opens <script>
  10..44            the cores (biome, rand, tags, space, hazard, terrain, export), by path
  44-host-station   the station's numbers (stations/<name>/ replaces it): the site, the scarp, the deck, the hour, the views
  45-host-stage     HOST binding (renderer, the scarp on KFIELD, the fields, BIO.init) -- must run before 47
  41-biome-lung-data  LUNG, [G data]: the breath, the bands, the yield, the layout, the hazards, the species (tests/test-lung.js)
  48-host-lungs     the layout on this stage's scarp (LUNG.layout), the keep-clear (KSPACE), the records (core/tags)
  50..70            the southern highlands' leaves, READ IN PLACE from biomes/shighlands/src (the cloud forest and the paramo the lungs stand in)
  72-biome-lung     the lungs' items and their pass (rings on BIO.animHook's breath, bells, mouths, collars, fringes, husks, the breath meadows)
  80..98            HOST (ground, far field, sky, atmosphere, water, build, the breath's tick)
  99-host-take      the views, the inspector's words and the probe's checks, handed to core/host
  99-tail.html      closes <script>

  python3 build.py                     dist/clifflung.html, station 1, the Mouths (PLAN.md section 11)
  python3 build.py --station <name>    dist/clifflung-<name>.html: stations/<name>/ added to src/ (bells, stair)

The biome leaves never reference a host global except through BIO.host (BIOME-API.md); build.py greps for the forbidden names.
"""
import os, re, subprocess, sys, json as _json

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
import subprocess as _sp
_cp = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        _sp.call([sys.executable, _cp, '--quiet', os.path.dirname(os.path.abspath(__file__))]) != 0:
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
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(HERE)), 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
_SD = os.path.join(HERE, 'stations')
if os.path.isdir(_SD): BSRC.variants([['--station', _s] for _s in sorted(os.listdir(_SD)) if os.path.isfile(os.path.join(_SD, _s, 'station.json'))])
_args = [a for a in sys.argv[1:] if not a.startswith('--') or a == '--station']
STATION = _args[_args.index('--station') + 1] if '--station' in _args else None
if STATION: _args = [a for a in _args if a not in ('--station', STATION)]
OUT = _args[0] if _args else ('clifflung-%s.html' % STATION if STATION else 'clifflung.html')
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
J = lambda *p: os.path.normpath(os.path.join(ROOT, *p))
# a STATION: stations/<name>/'s numbered fragments are added to src/'s (a name in both is the station's; station.json "drop" removes one of
# src/'s, "reads" names more fragments by path from the repo root)
SJ = {}
if STATION:
    _sd = os.path.join(_SD, STATION)
    if not os.path.isdir(_sd): sys.exit('build.py: no station ' + STATION + ' (stations/' + STATION + '/)')
    _sj = os.path.join(_sd, 'station.json')
    if os.path.isfile(_sj):
        with open(_sj, encoding='utf-8') as _fh: SJ = _json.load(_fh)
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in SJ.get('drop', []): PATH.pop(f, None)
    for f in os.listdir(_sd):
        if re.match(r'\d', f): PATH[f] = os.path.join(_sd, f)
    for f, pth in SJ.get('reads', {}).items(): PATH.setdefault(f, J(pth))
# THE SOUTHERN HIGHLANDS, READ IN PLACE (PLAN.md section 7, "Earth's, read in place"): its species, trees, floor and build are the cloud forest on the
# face and the paramo on the crest, which the lungs stand in and whose spiral rule they keep. Nothing is copied: the kit's files by path
SHIGH_DIR = J('biomes', 'shighlands')
SHIGH_LEAVES = ['50-biome-shigh-species.js', '55-biome-shigh-trees.js', '60-biome-shigh-floor.js', '70-biome-shigh.js']
if SJ.get('shigh', True):
    for f in SHIGH_LEAVES: PATH.setdefault(f, os.path.join(SHIGH_DIR, 'src', f))
# core/terrain (core/README.md "terrain/"): 30 KFIELD (the stage baked, with an inset on the face), 38 KRELIEF (the scarp: SCARP.md), 43 KGROUND
# (the ground's library layers and the breccia's clasts), 44 KFAR (the land past the map), 45 KHORIZON (the scarp's shadow on the ground)
CORE_TERRAIN = ['30-core-field.js', '38-core-relief.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN: PATH.setdefault(f, J('core', 'terrain', f))
PATH.setdefault('44-core-farfield-draw.js', J('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', J('core', 'terrain', 'host', '45-core-horizon-shade.js'))
# 44b the far lines (KFAR.streaks, the Cliff Lungs' section 14 item 7): the far lungs as dark lines down the Wall past the map
PATH.setdefault('44b-core-farfield-lines.js', J('core', 'terrain', '44b-core-farfield-lines.js'))
PATH.setdefault('44c-core-farfield-lines-draw.js', J('core', 'terrain', 'host', '44b-core-farfield-lines-draw.js'))
# the biome core (core/biome): 35 the breath mode (BIO.animHook 'breath': the rings, the sphincters, the fringes), 37 KTRAPS.cycle (core/hazard's one
# clock), the rest as shighlands takes them
CORE_BIOME = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '31j-core-joint.js', '34-core-impostor.js', '35-core-anim.js',
              '37-core-traps.js', '40-core-place.js', '42-core-export.js', '43-core-export-host.js']
for f in CORE_BIOME: PATH.setdefault(f, J('core', 'biome', f))
# core/rand and core/tags: every lung, ring, mouth, well, plant and hazard a record before it is drawn (BIO.init({tags}))
CORE_TAGS = {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}
for f, d in CORE_TAGS.items(): PATH.setdefault(f, J('core', d, f))
# core/hazard (core/hazard/README.md): the draw, the cold breath, the film, the sphincter, the fall, the maw, on LUNG.breath (KHAZ.STATES)
CORE_HAZARD = ['20-core-hazard.js']
for f in CORE_HAZARD: PATH.setdefault(f, J('core', 'hazard', f))
# core/export: the krator-world container
for f in ['07-core-export.js', '09-core-export-adapters.js']: PATH.setdefault(f, J('core', 'export', f))
# core/space (KSPACE): the lungs' keep-clear, read by the root mask; core/host's FULL lists it too
PATH.setdefault('20-core-space.js', J('core', 'space', '20-core-space.js'))
# core/shadow (KSHADOW): toggleable, off by default
PATH.setdefault('10-core-shadow.js', J('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', J('core', 'shadow', 'host', '12-core-shadow-host.js'))
# the host shell (core/host FULL: camera, loop and its clock, panel, probe, inspector, marks, pictures, minimap, editor)
sys.path.insert(0, J('core', 'host'))
import host as khost
CORE_HOST = khost.FULL
khost.resolve(PATH, CORE_HOST)
# the material library (core/materials/record: KMAT) and two generated packs: this kit's (materials.json -> tex/, 'lung') and the southern
# highlands' own, read from its tex/ in place (its trees and ground layers want it; its station-only families are left out)
for f in ('23-mat-record.js', '25-matlib-host.js'): PATH.setdefault(f, J('core', 'materials', 'record', f))
sys.path.insert(0, J('tools', 'textures'))
import matlib_pack
VIRTUAL = {'44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'lung', own=True) +
           (matlib_pack.fragment(SHIGH_DIR, 'shigh') if SJ.get('shigh', True) else '') +
           (matlib_pack.fragment(J('biomes', 'hyperjungle'), 'hyperjungle') if SJ.get('jungle') else ''),   # the Bells read the canopy in place

           khost.EDITS_JS: khost.edits_js(HERE, 'clifflung' + ('-' + STATION if STATION else ''))}
for f in VIRTUAL: PATH[f] = None
# the shared atmosphere (core/atmos): its core, presets, export, the sky's light, the weather, the cloud deck (the cloud sea) and its DAY (fx/deckday:
# the level LUNG.breath reads, PLAN.md section 14 item 5), the particles (the steam, the cap clouds, the cold breath) in groups scaled by the breath
# (fx/smokegroups), the shared sky and height fog
CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-8-export.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-3-particles.js',
              '89-atmos-4-weather.js', '89-atmos-9-host.js', '89-atmos-d-clouddeck.js']
for f in CORE_ATMOS: PATH.setdefault(f, J('core', 'atmos', f))
for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js']: PATH[f] = J('core', 'atmos', 'sky', f)
for f in ['89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js']: PATH[f] = J('core', 'atmos', 'host', f)
for f in ['89-atmos-fx-deckday.js', '89-atmos-fx-smokegroups.js'] + SJ.get('fx', []): PATH[f] = J('core', 'atmos', 'fx', f)
# core/water: the wells at the mouths (ext/54 W.karstSpring, drawn by 54b), the tarns on the paramo (still), the audit (57)
CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER: PATH.setdefault(f, J('core', 'water', f))
PATH['22b-core-water-kinds-ext.js'] = J('core', 'water', 'ext', '54-core-water-kinds-ext.js')
PATH['51b-core-water-kinds-ext-draw.js'] = J('core', 'water', 'ext', '54b-core-water-kinds-ext-draw.js')
for f in ['56-core-water-breakup.js', '57-core-water-audit.js']: PATH.setdefault(f, J('core', 'water', 'ext', f))
miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
if miss: print('NO BIOME CORE: ' + ', '.join(miss)); sys.exit(1)
frags = sorted(PATH)
out = []; bad = []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
    else:
        with open(PATH[f], encoding='utf-8') as _fh: s = _fh.read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-host-' not in f and not (PATH[f] and os.sep + 'core' + os.sep in os.path.normpath(PATH[f])):
        for w in FORBID:
            if w in s: bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else ''); out.append(s)
if bad: print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad)); sys.exit(1)
BSRC.report(PATH)   # --list-sources: what the page is made of, then exit
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as _fh: _fh.write(html)
m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as _fh: _fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  ' + ('syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki, encoding='utf-8') as _fh: op = [l for l in _fh if l.startswith('- [ ]')]
    if op: print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
