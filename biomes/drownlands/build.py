#!/usr/bin/env python3
"""Concatenate src/* and core/* (filename order) into dist/drownlands[-<station>].html (biomes/drownlands/PLAN.md).

  python3 tools/build.py biomes/drownlands                     dist/drownlands.html (Station 1 shoal: 145, 520)
  python3 tools/build.py biomes/drownlands --station bar       dist/drownlands-bar.html (Station 2 bar: 195, 420)
  python3 tools/build.py biomes/drownlands --station drowned   dist/drownlands-drowned.html (Station 3 drowned: 95, 545)
  python3 tools/build.py biomes/drownlands --station skerry    dist/drownlands-skerry.html (Station 4 skerry: 145, 495)
  python3 biomes/drownlands/build.py --all                     every page
  python3 biomes/drownlands/build.py --list-sources            print source dependencies (tools/build_sources.py)
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                     # noqa: E402
buildlib.through_tools_build(__file__)              # survey item 25: always record build-inputs.json
import build_sources as BSRC                        # noqa: E402

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then common install paths."""
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


EXTRA_STATIONS = ['bar', 'drowned', 'skerry']
BSRC.variants([['--station', _s] for _s in EXTRA_STATIONS])

if '--all' in sys.argv or '--stations' in sys.argv:
    rest = [a for a in sys.argv[1:] if a not in ('--all', '--stations')]
    rc = [subprocess.call([sys.executable, os.path.abspath(__file__)] + rest)]
    for st in EXTRA_STATIONS:
        rc.append(subprocess.call([sys.executable, os.path.abspath(__file__), '--station', st] + rest))
    sys.exit(max(rc))

SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
_args = [a for a in sys.argv[1:] if not a.startswith('--') or a == '--station']
STATION = _args[_args.index('--station') + 1] if '--station' in _args else None
if STATION:
    _args = [a for a in _args if a not in ('--station', STATION)]
if STATION == 'shoal':
    STATION = None
OUT = _args[0] if _args else ('drownlands-%s.html' % STATION if STATION else 'drownlands.html')
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
J = lambda *p: os.path.normpath(os.path.join(ROOT, *p))

SJ = {}
if STATION:
    _sd = os.path.join(HERE, 'stations', STATION)
    if not os.path.isdir(_sd):
        sys.exit('build.py: no station %s (stations/%s/)' % (STATION, STATION))
    _sj = os.path.join(_sd, 'station.json')
    if os.path.isfile(_sj):
        with open(_sj, encoding='utf-8') as _fh:
            SJ = json.load(_fh)
    if SJ.get('out') and not _args:
        OUT = SJ['out']

PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION:
    for f in os.listdir(_sd):
        if re.match(r'\d', f):
            PATH[f] = os.path.join(_sd, f)
    for f, pth in SJ.get('core', {}).items():
        PATH.setdefault(f, J(*pth.split('/')))

# 1. core/biome: extend buildlib.CORE_BIOME_MIN (survey item 26)
CORE_BIOME_PATHS = buildlib.CORE_BIOME_MIN + [
    'core/biome/31j-core-joint.js',
    'core/biome/32-core-variants.js',
    'core/biome/33-core-fungoid.js',
    'core/biome/35-core-anim.js',
    'core/biome/37-core-traps.js',
    'core/biome/39-core-lean.js',
    'core/biome/41-core-env.js',
    'core/biome/42-core-export.js',
    'core/biome/43-core-export-host.js',
    'core/biome/44-core-stage.js',
]
for rel in CORE_BIOME_PATHS:
    PATH.setdefault(os.path.basename(rel), J(*rel.split('/')))

# 2. core/drawn, core/rand, core/space, core/tags, core/export, core/mask + core/coast, core/hazard, core/shadow
PATH.setdefault('10-core-drawn.js', J('core', 'drawn', '10-core-drawn.js'))
PATH.setdefault('08-core-rand.js', J('core', 'rand', '08-core-rand.js'))
PATH.setdefault('20-core-space.js', J('core', 'space', '20-core-space.js'))
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH.setdefault(f, J('core', 'tags', f))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, J('core', 'export', f))
PATH.setdefault('25-core-mask.js', J('core', 'mask', '25-core-mask.js'))
PATH.setdefault('27-core-mask-distance.js', J('core', 'mask', '27-core-mask-distance.js'))
PATH.setdefault('30-core-coast.js', J('core', 'coast', '30-core-coast.js'))
PATH.setdefault('20-core-hazard.js', J('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js', J('core', 'hazard', '21-core-hazard-flow.js'))
PATH.setdefault('10-core-shadow.js', J('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', J('core', 'shadow', 'host', '12-core-shadow-host.js'))

# 3. kits/crops read in place ([G data], sorted before 40-biome-drown-phys.js)
PATH.setdefault('22a-crop-core.js', J('kits', 'crops', 'src', '10-crop-core.js'))
PATH.setdefault('22b-crop-records.js', J('kits', 'crops', 'src', '20-crop-records.js'))
PATH.setdefault('22c-crop-query.js', J('kits', 'crops', 'src', '40-crop-query.js'))

# 4. core/terrain (KSTRATA, KRELIEF, KGROUND, KFAR, KHORIZON)
for f in ('35-core-strata.js', '38-core-relief.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js'):
    PATH.setdefault(f, J('core', 'terrain', f))
PATH.setdefault('35s-core-strata-shade.js', J('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js', J('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', J('core', 'terrain', 'host', '45-core-horizon-shade.js'))

# 5. core/host
sys.path.insert(0, J('core', 'host'))
import host as khost                                # noqa: E402
CORE_HOST = khost.FULL + ['94-host-polytool.js']
khost.resolve(PATH, CORE_HOST)

# 6. core/atmos
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-8-export.js',
          '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-4-weather.js', '89-atmos-9-host.js'):
    PATH.setdefault(f, J('core', 'atmos', f))
PATH['89-atmos-c-hostbind.js'] = J('core', 'atmos', 'host', '89-atmos-c-hostbind.js')
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = J('core', 'atmos', 'sky', f)
for f in ('89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = J('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = J('core', 'atmos', 'fx', f)

# 7. core/water (open, shore, flow, draw, kinds, farbed, breakup, audit, mirror, fields, plume)
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, J('core', 'water', f))
PATH.setdefault('50f-core-water-farbed.js', J('core', 'water', 'farbed', '53-core-water-farbed.js'))
for f in ('56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js', '61-core-water-plume.js'):
    PATH.setdefault(f, J('core', 'water', 'ext', f))

miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss))
    sys.exit(1)

# 8. core/materials/record + packed library textures from tex/pack.json
for f in ('23-mat-record.js', '25-matlib-host.js'):
    PATH.setdefault(f, J('core', 'materials', 'record', f))
sys.path.insert(0, J('tools', 'textures'))
import matlib_pack                                  # noqa: E402
VIRTUAL = {
    '44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'drownlands', own=True),
    khost.EDITS_JS: khost.edits_js(HERE, 'drownlands'),
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
    is_core = bool(PATH[f] and '/core/' in PATH[f].replace(os.sep, '/'))
    if 10 <= n < 80 and '-host-' not in f and not is_core:
        for w in FORBID:
            if w in s:
                bad.append('%s: uses %s' % (f, w))
    out.append(('\n// ==================== %s\n' % f) if f.endswith('.js') else '')
    out.append(s)

if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    sys.exit(1)

BSRC.report(PATH, [os.path.join(HERE, 'stations', k, 'station.json') for k in EXTRA_STATIONS])
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
print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED (no node: set NODE=/path/to/node)' if r is None else
    ('syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800])
))
ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
if os.path.exists(ki):
    with open(ki, encoding='utf-8') as fh:
        op = [ln for ln in fh if ln.startswith('- [ ]')]
    if op:
        print('KNOWN_ISSUES.md: %d open item(s) -- read it before changing this kit' % len(op))
sys.exit(r.returncode if r else 0)
