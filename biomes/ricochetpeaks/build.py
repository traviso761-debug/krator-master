#!/usr/bin/env python3
"""Concatenate src/* and core/* (filename order) into dist/ricochetpeaks[-<station>].html: Ricochet Peaks (biomes/ricochetpeaks/PLAN.md).

  00-head.html      page shell, opens <script>
  06..48            BIOME CORE (core/biome) and shared core modules (core/shader, core/export, core/rand, core/drawn,
                    core/shadow, core/space, core/hazard, core/water + geyser/52 + ext/53+54+57, kits/crops, kits/resources,
                    core/materials/record + 27-matlib-m1, core/terrain: KSTRATA, KCARVE, KSTACKS, KRELIEF, KFROST, KGROUND, KFAR, KHORIZON, KTHERM)
  15, 22, 24        RICOCHET_PHYS & RICOCHET_SITES, CROPS.BIOMES.ricochetpeaks, RICOCHET_FAUNA [G data]
  44z-host-site     station selector (stations/<station>/44z-host-site.js)
  45-host-stage     HOST binding (renderer, 5-station crater terrain & hydrology, KRELIEF, KFROST, KCARVE, KTHERM, KSPACE, BIO.init)
  46-rp-vstack      Native vertical-stack graphics (B1-B5, S6, M1/M2 km1RoughAA, card fringe dilation, base/crown AO)
  50..70            THE KIT (RICOCHET.SPECIES, packed library materials, BIO.flareJoin + BIO.leanTo trees, BIO.kin cousins, placement)
  84..99            HOST (KGROUND <= 3 layers + KSTRATA + KSTACKS tors & Erebus ice chimneys + KCARVE + KDRAWN, KFAR + KHORIZON,
                    site:* reserves, meteoritic iron/nickel/gold nodes, Yuni shrine & bandit abatis, sky, ATMOS snowBare/fogPool/steam, water, views)
  99-tail.html      closes <script>

  python3 tools/build.py biomes/ricochetpeaks                        dist/ricochetpeaks.html: Station 1 (ringlake)
  python3 tools/build.py biomes/ricochetpeaks --station notch        dist/ricochetpeaks-notch.html: Station 2 (Skippers Notch)
  python3 tools/build.py biomes/ricochetpeaks --station vents        dist/ricochetpeaks-vents.html: Station 3 (East Hearth Vents)
  python3 tools/build.py biomes/ricochetpeaks --station glasssheet   dist/ricochetpeaks-glasssheet.html: Station 4 (Glass-Pan Melt Sheet)
  python3 tools/build.py biomes/ricochetpeaks --station highbowl     dist/ricochetpeaks-highbowl.html: Station 5 (Old Rim Erebus Bowl)
  python3 tools/build.py biomes/ricochetpeaks --all                  every station
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib  # noqa: E402
buildlib.through_tools_build(__file__)
import build_sources as BSRC  # noqa: E402

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and \
        subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then common install locations."""
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


STATIONS = ['ringlake', 'notch', 'vents', 'glasssheet', 'highbowl']
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
STATION = STATION or 'ringlake'
OUT = _args[0] if _args else ('ricochetpeaks.html' if STATION == 'ringlake' else 'ricochetpeaks-%s.html' % STATION)
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
P = lambda *a: os.path.normpath(os.path.join(ROOT, *a))

_sd = os.path.join(HERE, 'stations', STATION)
if not os.path.isdir(_sd):
    sys.exit('build.py: no station ' + STATION + ' (stations/' + STATION + '/)')
SJ = {}
if os.path.isfile(os.path.join(_sd, 'station.json')):
    with open(os.path.join(_sd, 'station.json'), encoding='utf-8') as _fh:
        SJ = json.load(_fh)
if SJ.get('out') and not _args:
    OUT = SJ['out']

PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
for _st in ([SJ['base']] if SJ.get('base') else []) + [STATION]:
    _d = os.path.join(HERE, 'stations', _st)
    for f in sorted(os.listdir(_d)):
        if re.match(r'\d', f):
            PATH[f] = os.path.join(_d, f)

# 1. core/shader, core/export, core/rand, core/drawn, core/shadow, core/space, core/hazard, core/tags
PATH.setdefault('06-core-khook.js', P('core', 'shader', '06-core-khook.js'))
PATH.setdefault('06b-core-kcolor.js', P('core', 'shader', '06b-core-kcolor.js'))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, P('core', 'export', f))
PATH.setdefault('08-core-rand.js', P('core', 'rand', '08-core-rand.js'))
PATH.setdefault('10-core-drawn.js', P('core', 'drawn', '10-core-drawn.js'))
PATH.setdefault('10-core-shadow.js', P('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', P('core', 'shadow', 'host', '12-core-shadow-host.js'))
PATH.setdefault('20-core-space.js', P('core', 'space', '20-core-space.js'))
PATH.setdefault('20-core-hazard.js', P('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('21-core-hazard-flow.js', P('core', 'hazard', '21-core-hazard-flow.js'))
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH.setdefault(f, P('core', 'tags', f))

# 2. core/biome: CORE_BIOME_MIN + joint, variants, fungoid, anim, traps, lean, env, export, stage
CORE_BIOME = buildlib.CORE_BIOME_MIN + [
    'core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js', 'core/biome/33-core-fungoid.js',
    'core/biome/35-core-anim.js', 'core/biome/37-core-traps.js', 'core/biome/39-core-lean.js',
    'core/biome/41-core-env.js', 'core/biome/42-core-export.js', 'core/biome/43-core-export-host.js',
    'core/biome/44-core-stage.js'
]
for rel in CORE_BIOME:
    PATH.setdefault(os.path.basename(rel), P(*rel.split('/')))

# 3. kits/crops & kits/resources read in place ([G data], sorted before 22-ricochet-crops.js)
PATH.setdefault('21a-crop-core.js', P('kits', 'crops', 'src', '10-crop-core.js'))
PATH.setdefault('21b-crop-records.js', P('kits', 'crops', 'src', '20-crop-records.js'))
PATH.setdefault('21c-crop-material.js', P('kits', 'crops', 'src', '22-crop-material.js'))
PATH.setdefault('21d-crop-query.js', P('kits', 'crops', 'src', '40-crop-query.js'))
PATH.setdefault('21r-res-ore.js', P('kits', 'resources', 'src', '42r-res-ore.js'))
PATH.setdefault('21s-res-field.js', P('kits', 'resources', 'src', '45r-res-field.js'))

# 4. core/terrain: KSTRATA, KCARVE, KSTACKS, KRELIEF + KBASIN, KFROST, KGROUND, KFAR, KHORIZON, KTHERM
CORE_TERRAIN = [
    '35-core-strata.js', '36-core-carve.js', '37-core-stacks.js',
    '38-core-relief.js', '38c-core-landforms.js', '42-core-frost.js',
    '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js'
]
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('44t-core-therm.js', P('core', 'terrain', '47-core-therm.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))

# 5. core/host
sys.path.insert(0, P('core', 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])

# 6. core/atmos (including fx/snowcover with snowBare, fx/katabatic, fx/slopewind, fx/smokegroups)
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-8-export.js',
          '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-4-weather.js', '89-atmos-9-host.js'):
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-snowcover.js', '89-atmos-fx-katabatic.js', '89-atmos-fx-slopewind.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = P('core', 'atmos', 'fx', f)

# 7. core/water + geyser/52 + ext/53 (sinter terraces), ext/54 (ice), ext/56..60
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, P('core', 'water', f))
for f in ('52-core-water-geyser.js', '52b-core-water-geyser-draw.js'):
    PATH.setdefault(f, P('core', 'water', 'geyser', f))
for f in ('53-core-water-terraces.js', '53b-core-water-terraces-draw.js',
          '54-core-water-kinds-ext.js', '54b-core-water-kinds-ext-draw.js',
          '56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js'):
    PATH.setdefault(f, P('core', 'water', 'ext', f))

# 8. core/materials/record + sidecar library texture pack (ricochetpeaks.tex.js)
for f in ('23-mat-record.js', '25-matlib-host.js', '27-matlib-m1.js'):
    PATH.setdefault(f, P('core', 'materials', 'record', f))

miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss))
    sys.exit(1)

sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402
_mj_path = os.path.join(HERE, 'materials.json')
with open(_mj_path, encoding='utf-8') as _mfh:
    _all_fams = set(json.load(_mfh).get('families', {}).keys())
_excl_fams = sorted(_all_fams - set(SJ['families'])) if SJ.get('families') else ()
SIDE = None if '--inline-packs' in sys.argv else {}
VIRTUAL = {
    '44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'ricochetpeaks', exclude=_excl_fams, side=SIDE, own=True),
    khost.EDITS_JS: khost.edits_js(HERE, 'ricochetpeaks')
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
    rel_p = PATH[f].replace(os.sep, '/') if PATH[f] else ''
    is_core = bool(rel_p and ('/core/' in rel_p or '/kits/crops/' in rel_p or '/kits/resources/' in rel_p))
    if 10 <= n < 80 and '-host-' not in f and f != '46-rp-vstack.js' and not is_core:
        for w in FORBID:
            if w in s:
                bad.append('%s: uses %s' % (f, w))
    out.append(('\n// ==================== %s\n' % f) if f.endswith('.js') else '')
    out.append(s)
if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    sys.exit(1)

BSRC.report(PATH, [os.path.join(HERE, 'stations', k, 'station.json') for k in STATIONS] + [_mj_path])
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    _tex_stem = '%s.tex.js' % os.path.splitext(OUT)[0]
    html = matlib_pack.write_sidecar(SIDE, html, DIST, _tex_stem, prune=False)
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
chk = os.path.join(HERE, '.syntax.js')
with open(chk, 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(js)
node = find_node()
r = subprocess.run([node, '--check', chk], capture_output=True, text=True, encoding='utf-8') if node else None
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
