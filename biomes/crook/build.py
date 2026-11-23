#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/<target>.html: The Crook (biomes/crook/PLAN.md; CROOK-RIA-DECISIONS.md section 1.6).

  00-head.html      page shell, opens <script>
  10..44            BIOME CORE (core/biome) and the core modules the kit takes (core/terrain, core/drawn, core/rand,
                    core/tags, core/space, core/export, core/hazard, core/shadow, core/water, core/atmos, core/materials)
  40, 41            CROOK_PHYS and CROOK_SITES: tsunami trimline, talweg seepage, aspect split, skarn/malachite
                    biomineralization, monotone rimstone steps, aero-acoustic resonance, thermogenic snow wells,
                    and Silent Vales Great Hush threshold [G data]
  44z-host-site     station selector (stations/<station>/44z-host-site.js)
  45-host-stage     HOST binding (renderer, terrain, hydrology, KSPACE, KHAZ, BIO.init) -- before 50
  50..70            THE KIT (CROOK.SPECIES, library materials, BIO.flareJoin trees, BIO.bamboo, BIO.fung, placement, kitEnd)
  84..98            HOST (KGROUND + KSTRATA + KDRAWN, KFAR + KHORIZON, KTAGS reserves & trail cairns, sky, air, water, bake)
  99-host-take      preset views, interactive controls, inspector, hostChecks and hostNegatives
  99-tail.html      closes <script>

  python3 tools/build.py biomes/crook                    dist/crook.html: default station (shore, Crookshore)
  python3 tools/build.py biomes/crook --station wash     dist/crook-wash.html: Station 2 (Crookwash gorge & rimstone)
  python3 tools/build.py biomes/crook --station head     dist/crook-head.html: Station 3 (Crookhead tarn, hearth-rings & Hush)
  python3 tools/build.py biomes/crook --all              every station
  (a plain `python3 build.py ...` re-runs itself through tools/build.py, so build-inputs.json is always written: item 25)
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)

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


STATIONS = ['shore', 'wash', 'head']
BSRC.variants([['--station', _s] for _s in STATIONS[1:]])
if '--stations' in sys.argv or '--all' in sys.argv:
    _rest = [a for a in sys.argv[1:] if a not in ('--stations', '--all')]
    _rc = subprocess.call([sys.executable, os.path.abspath(__file__)] + _rest)
    for _s in STATIONS[1:]:
        _rc |= subprocess.call([sys.executable, os.path.abspath(__file__), '--station', _s] + _rest)
    sys.exit(_rc)

_args = [a for a in sys.argv[1:] if not a.startswith('--') or a == '--station']
STATION = _args[_args.index('--station') + 1] if '--station' in _args else None
if STATION:
    _args = [a for a in _args if a not in ('--station', STATION)]
STATION = STATION or 'shore'
OUT = _args[0] if _args else ('crook.html' if STATION == 'shore' else 'crook-%s.html' % STATION)
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
P = lambda *a: os.path.normpath(os.path.join(ROOT, *a))

_sd = os.path.join(HERE, 'stations', STATION)
if not os.path.isdir(_sd):
    sys.exit('build.py: no station ' + STATION + ' (stations/' + STATION + '/)')
SJ = {}
if os.path.isfile(os.path.join(_sd, 'station.json')):
    with open(os.path.join(_sd, 'station.json'), encoding='utf-8') as _fh:
        SJ = json.load(_fh)

PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
for _st in ([SJ['base']] if SJ.get('base') else []) + [STATION]:
    _d = os.path.join(HERE, 'stations', _st)
    for f in sorted(os.listdir(_d)):
        if re.match(r'\d', f):
            PATH[f] = os.path.join(_d, f)

# core/terrain: 35 KSTRATA (+35z shade), 38 KRELIEF, 42 KFROST, 43 KGROUND, 44 KFAR, 45 KHORIZON
CORE_TERRAIN = ['35-core-strata.js', '38-core-relief.js', '42-core-frost.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))

# core/biome: CORE_BIOME_MIN (item 26) + joint, variants, fungoid, bamboo, anim, traps, lean, env, export, stage
CORE_BIOME = buildlib.CORE_BIOME_MIN + [
    'core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js', 'core/biome/33-core-fungoid.js',
    'core/biome/33b-core-bamboo.js', 'core/biome/35-core-anim.js', 'core/biome/37-core-traps.js',
    'core/biome/39-core-lean.js', 'core/biome/41-core-env.js', 'core/biome/42-core-export.js',
    'core/biome/43-core-export-host.js', 'core/biome/44-core-stage.js'
]
for p in CORE_BIOME:
    PATH.setdefault(os.path.basename(p), P(*p.split('/')))

# core/drawn (item 28): drawn ground grid registered in 84-host-ground.js
PATH.setdefault('10-core-drawn.js', P('core', 'drawn', '10-core-drawn.js'))
# core/rand and core/tags
for f, d in {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}.items():
    PATH.setdefault(f, P('core', d, f))
# core/export
for f in ['07-core-export.js', '09-core-export-adapters.js']:
    PATH.setdefault(f, P('core', 'export', f))
# core/space and core/hazard
PATH.setdefault('20-core-space.js', P('core', 'space', '20-core-space.js'))
PATH.setdefault('20-core-hazard.js', P('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js', P('core', 'hazard', '21-core-hazard-flow.js'))

# core/host
sys.path.insert(0, P('core', 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])

# core/atmos
for f in ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-8-export.js',
          '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-4-weather.js', '89-atmos-9-host.js']:
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ['89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js']:
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ['89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js']:
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ['89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-snowcover.js', '89-atmos-fx-smokegroups.js']:
    PATH[f] = P('core', 'atmos', 'fx', f)

# core/water + ext (terraces/drawPools, still pools, maskFromGround, mirror, breakup, audit, fields, plume)
for f in ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']:
    PATH.setdefault(f, P('core', 'water', f))
for f in ['53-core-water-terraces.js', '53b-core-water-terraces-draw.js', '56-core-water-breakup.js', '57-core-water-audit.js',
          '58-core-water-mirror.js', '58-core-water-shore.js', '60-core-water-fields.js', '61-core-water-plume.js']:
    PATH.setdefault(f, P('core', 'water', 'ext', f))

# core/shadow (off at load) and core/materials/record
PATH.setdefault('10-core-shadow.js', P('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', P('core', 'shadow', 'host', '12-core-shadow-host.js'))
for f in ['23-mat-record.js', '25-matlib-host.js']:
    PATH.setdefault(f, P('core', 'materials', 'record', f))
for slot, rel in sorted(SJ.get('core', {}).items()):
    PATH[slot] = P(*rel.split('/'))

miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss))
    sys.exit(1)

sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402
VIRTUAL = {
    '44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'crook', own=True),
    khost.EDITS_JS: khost.edits_js(HERE, 'crook')
}

for f in VIRTUAL:
    PATH[f] = None
frags = sorted(PATH)
out = []
bad = []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
    else:
        with open(PATH[f], encoding='utf-8') as fh:
            s = fh.read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-host-' not in f and 'core-' not in f and not re.match(r'47[a-h]', f):
        for w in FORBID:
            if w in s:
                bad.append(f'{f}: uses {w}')
    out.append(f'\n// ==================== {f}\n' if f.endswith('.js') else '')
    out.append(s)
if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    sys.exit(1)

BSRC.report(PATH, [os.path.join(HERE, 'stations', k, 'station.json') for k in STATIONS])
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
print(f'built dist/{OUT}  ({len(frags)} fragments, {len(html)//1024} KB)  ' + (
    'syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki, encoding='utf-8') as fh:
        op = [l for l in fh if l.startswith('- [ ]')]
    if op:
        print(f'KNOWN_ISSUES.md: {len(op)} open item(s) -- read it before changing this kit')
sys.exit(r.returncode if r else 0)
