#!/usr/bin/env python3
"""Build biomes/shroudhills into dist/shroudhills.html and its station pages (PLAN.md).

  python3 tools/build.py biomes/shroudhills                      -> dist/shroudhills.html (Station 1: cove)
  python3 tools/build.py biomes/shroudhills --station canopy     -> dist/shroudhills-canopy.html (Station 2: canopy)
  python3 tools/build.py biomes/shroudhills --station cloaktor   -> dist/shroudhills-cloaktor.html (Station 3: cloaktor)
  python3 build.py --all                                         -> all three stations
  python3 build.py --list-sources                                -> union of all read repo files (tools/dep_graph.py)
  python3 build.py --inline-packs                                -> inline texture pack (default: shared sidecar)
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import build_sources as BSRC  # noqa: E402

BSRC.variants([['--station', 'canopy'], ['--station', 'cloaktor']])

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then common install paths."""
    import glob as _g
    import shutil as _sh
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


if '--all' in sys.argv:
    rest = [a for a in sys.argv[1:] if a != '--all']
    rc = subprocess.call([sys.executable, os.path.abspath(__file__)] + rest)
    for st in sorted(os.listdir(os.path.join(HERE, 'stations'))):
        if os.path.isfile(os.path.join(HERE, 'stations', st, 'station.json')):
            rc = subprocess.call([sys.executable, os.path.abspath(__file__), '--station', st, '--no-checks'] + rest) or rc
    sys.exit(rc)

SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = 'shroudhills.html'
STATION = None
STN = {}

if '--station' in sys.argv:
    STATION = sys.argv[sys.argv.index('--station') + 1]
    STN_DIR = os.path.join(HERE, 'stations', STATION)
    if not os.path.isdir(STN_DIR):
        sys.exit('build.py: unknown station ' + STATION)
    with open(os.path.join(STN_DIR, 'station.json'), encoding='utf-8') as _fh:
        STN = json.load(_fh)
    OUT = STN['out']

core = lambda *p: os.path.normpath(os.path.join(ROOT, 'core', *p))
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']

PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(STN_DIR):
        if f.endswith('.js') or f.endswith('.html'):
            PATH[f] = os.path.join(STN_DIR, f)

# core/biome (universal set including 31j flareJoin & 34 octahedral impostors)
CORE_BIOME = [
    '10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31-core-dither.js', '31b-core-leafset.js',
    '31j-core-joint.js', '32-core-variants.js', '34-core-impostor.js', '37-core-traps.js', '40-core-place.js',
    '42-core-export.js', '43-core-export-host.js', '44-core-stage.js'
]
for f in CORE_BIOME:
    PATH.setdefault(f, core('biome', f))

# core/terrain (35 KSTRATA, 43 KGROUND, 44 KFAR, 45 KHORIZON)
CORE_TERRAIN = ['35-core-strata.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, core('terrain', f))
PATH.setdefault('35s-core-strata-shade.js', core('terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js', core('terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', core('terrain', 'host', '45-core-horizon-shade.js'))

# core/shadow (KSHADOW, off at page load)
PATH.setdefault('10-core-shadow.js', core('shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', core('shadow', 'host', '12-core-shadow-host.js'))

# core/rand, core/tags, core/hazard, core/export
for f, d in {'08-core-rand.js': 'rand', '50-core-tags.js': 'tags', '52-core-tags-vocab.js': 'tags', '53-core-tags-host.js': 'tags'}.items():
    PATH.setdefault(f, core(d, f))
PATH.setdefault('20-core-hazard.js', core('hazard', '20-core-hazard.js'))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, core('export', f))

# core/host & core/space
sys.path.insert(0, core('host'))
import host as khost  # noqa: E402
CORE_HOST = khost.SHELL + ['94-host-polytool.js', '20-core-space.js']
khost.resolve(PATH, CORE_HOST)

# core/materials/record & packed library textures (tex/pack.json)
PATH.setdefault('06-core-khook.js', core('shader', '06-core-khook.js'))
PATH.setdefault('06b-core-kcolor.js', core('shader', '06b-core-kcolor.js'))
PATH.setdefault('10-core-drawn.js', core('drawn', '10-core-drawn.js'))
for f in ('23-mat-record.js', '25-matlib-host.js', '27-matlib-m1.js'):
    PATH.setdefault(f, core('materials', 'record', f))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
import matlib_pack as _mp  # noqa: E402
SIDE = None if '--inline-packs' in sys.argv else {}
VIRTUAL = {'44-host-matlib-pack.js': _mp.fragment(HERE, 'shroudhills', side=SIDE, own=True)}
for f in VIRTUAL:
    PATH[f] = None

# core/atmos (sky, waves, skylight, weather, height fog, fogBelt, rainCover, smoke)
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js',
          '89-atmos-8-export.js', '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH.setdefault(f, core('atmos', f))
for f in ('89-atmos-c-hostbind.js', '89-atmos-e-weatherhost.js', '89-atmos-h-skyhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = core('atmos', 'host', f)
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = core('atmos', 'sky', f)
for f in ('89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = core('atmos', 'fx', f)

# core/water (open cove, flow streams, still pools & batched drawPools for Sister-Cup Sky-Ponds)
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, core('water', f))
for f in ('53-core-water-terraces.js', '53b-core-water-terraces-draw.js', '56-core-water-breakup.js', '57-core-water-audit.js'):
    PATH.setdefault(f, core('water', 'ext', f))

miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss))
    sys.exit(1)

frags = sorted(PATH)
out = []
bad = []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
    else:
        with open(PATH[f], encoding='utf-8') as _fh:
            s = _fh.read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-host-' not in f and not (PATH[f] and '/core/' in PATH[f].replace(os.sep, '/')):
        for w in FORBID:
            if w in s:
                bad.append('%s: uses %s' % (f, w))
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else '')
    out.append(s)

if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    sys.exit(1)

BSRC.report(PATH)

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    html = _mp.write_sidecar(SIDE, html, DIST, 'shroudhills.tex.js', prune=False)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as _out:
    _out.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as _chk:
    _chk.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True, encoding='utf-8') if node else None
print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]
))

ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki, encoding='utf-8') as _ki:
        op = [ln for ln in _ki if ln.startswith('- [ ]')]
    if op:
        print('KNOWN_ISSUES.md: %d open item(s) -- read it before changing this kit' % len(op))
sys.exit(r.returncode if r else 0)
