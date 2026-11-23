#!/usr/bin/env python3
"""Build biomes/batteredisle stations into dist/batteredisle[-<station>].html + .tex.*.js sidecars (PLAN.md).

  python3 tools/build.py biomes/batteredisle                    -> dist/batteredisle.html (Station 1: cove)
  python3 tools/build.py biomes/batteredisle --station rampart  -> dist/batteredisle-rampart.html (Station 2: rampart)
  python3 tools/build.py biomes/batteredisle --station strait   -> dist/batteredisle-strait.html (Station 3: strait)
  python3 tools/build.py biomes/batteredisle --station plug     -> dist/batteredisle-plug.html (Station 4: plug)
  python3 tools/build.py biomes/batteredisle --all              -> all four stations
  python3 biomes/batteredisle/build.py --list-sources           -> union of all read repo files (tools/dep_graph.py)
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

STATIONS = ['cove', 'rampart', 'strait', 'plug']
ALIASES = {'portcove': 'cove', 'archcove': 'strait', 'plugcrest': 'plug'}
BSRC.variants([['--station', _s] for _s in STATIONS[1:]])

_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if os.path.isfile(_cp) and '--no-checks' not in sys.argv and not BSRC.LISTING and \
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


if '--stations' in sys.argv or '--all' in sys.argv:
    _rest = [a for a in sys.argv[1:] if a not in ('--stations', '--all')]
    _rc = subprocess.call([sys.executable, os.path.abspath(__file__)] + _rest)
    for _s in STATIONS[1:]:
        _rc = subprocess.call([sys.executable, os.path.abspath(__file__), '--station', _s, '--no-checks'] + _rest) or _rc
    sys.exit(_rc)

_args = [a for a in sys.argv[1:] if not a.startswith('--') or a == '--station']
STATION = _args[_args.index('--station') + 1] if '--station' in _args else None
if STATION:
    _args = [a for a in _args if a not in ('--station', STATION)]
    STATION = ALIASES.get(STATION, STATION)
STATION = STATION or 'cove'
if STATION not in STATIONS:
    sys.exit('build.py: unknown station ' + STATION)

OUT = _args[0] if _args else ('batteredisle.html' if STATION == 'cove' else 'batteredisle-%s.html' % STATION)
SJ = {}
if STATION != 'cove':
    _sd = os.path.join(HERE, 'stations', STATION)
    if not os.path.isdir(_sd):
        sys.exit('build.py: missing station folder stations/' + STATION)
    _sj = os.path.join(_sd, 'station.json')
    if os.path.isfile(_sj):
        with open(_sj, encoding='utf-8') as _fh:
            SJ = json.load(_fh)
        if SJ.get('out') and not _args:
            OUT = SJ['out']

FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'BRIDGES', 'TOWERS', 'RIVER', 'PALISADE', 'KOFF']
P = lambda *a: os.path.normpath(os.path.join(ROOT, *a))

PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}
if STATION != 'cove':
    _sd = os.path.join(HERE, 'stations', STATION)
    for f in sorted(os.listdir(_sd)):
        if re.match(r'\d', f) and (f.endswith('.js') or f.endswith('.html')):
            PATH[f] = os.path.join(_sd, f)

# 1. core/shader, core/export, core/rand, core/mask, core/coast, core/drawn, core/shadow, core/space, core/hazard, core/tags
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
PATH.setdefault('25-core-mask.js', P('core', 'mask', '25-core-mask.js'))
PATH.setdefault('27-core-mask-distance.js', P('core', 'mask', '27-core-mask-distance.js'))
PATH.setdefault('30-core-coast.js', P('core', 'coast', '30-core-coast.js'))
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH.setdefault(f, P('core', 'tags', f))

# 2. core/biome: CORE_BIOME_MIN (survey item 26) + dither, joint, variants/kin, fungoid, anim, traps, lean, env, export, stage
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/31-core-dither.js', 'core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js',
    'core/biome/33-core-fungoid.js', 'core/biome/35-core-anim.js', 'core/biome/37-core-traps.js',
    'core/biome/39-core-lean.js', 'core/biome/41-core-env.js', 'core/biome/42-core-export.js',
    'core/biome/43-core-export-host.js', 'core/biome/44-core-stage.js',
]
for rel in CORE_BIOME:
    PATH.setdefault(os.path.basename(rel), P(*rel.split('/')))

# 3. kits/crops read in place ([G data], sorted before 40-biome-batter-phys.js)
PATH.setdefault('22a-crop-core.js', P('kits', 'crops', 'src', '10-crop-core.js'))
PATH.setdefault('22b-crop-records.js', P('kits', 'crops', 'src', '20-crop-records.js'))
PATH.setdefault('22c-crop-material.js', P('kits', 'crops', 'src', '22-crop-material.js'))
PATH.setdefault('22d-crop-query.js', P('kits', 'crops', 'src', '40-crop-query.js'))

# 4. core/materials/record + Stage 5 KMAT_M1 (27-matlib-m1.js)
for f in ('23-mat-record.js', '25-matlib-host.js', '27-matlib-m1.js'):
    PATH.setdefault(f, P('core', 'materials', 'record', f))

# 5. core/terrain (KSTRATA, KCARVE, KSTACKS, KRELIEF, KCAVERN + KSPELEO + 39b2 + 39d + 39e + 39h, KSCOUR, KGROUND, KFAR, KHORIZON)
CORE_TERRAIN = [
    '35-core-strata.js', '36-core-carve.js', '37-core-stacks.js', '38-core-relief.js',
    '39-core-cavern.js', '39b-core-speleo.js', '39b2-core-speleo-cleft.js', '39d-core-cavern-floor.js',
    '41-core-scour.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js',
]
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('39e-core-cavern-draw.js', P('core', 'terrain', 'host', '39e-core-cavern-draw.js'))
PATH.setdefault('39h-core-cavern-cut.js', P('core', 'terrain', 'host', '39h-core-cavern-cut.js'))
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))

# 6. core/host
sys.path.insert(0, P('core', 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])

# 7. core/atmos + sky + fx
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-8-export.js',
          '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-4-weather.js', '89-atmos-9-host.js'):
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = P('core', 'atmos', 'fx', f)

# 8. core/water + farbed (53-core-water-farbed.js) + ext (ZERO volcanic geysers!)
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, P('core', 'water', f))
PATH.setdefault('52f-core-water-farbed.js', P('core', 'water', 'farbed', '53-core-water-farbed.js'))
for f in ('53-core-water-terraces.js', '53b-core-water-terraces-draw.js', '56-core-water-breakup.js',
          '57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js'):
    PATH.setdefault(f, P('core', 'water', 'ext', f))

miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '34-core-impostor.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss))
    sys.exit(1)

# 9. Virtual texture sidecars (.tex.batteredisle.js, .tex.arch.js, .tex.farside.js) + BIO.kin read-in-place partners
sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402
SIDE = None if '--inline-packs' in sys.argv else {}

ARCH_DIR = P('biomes', 'arch')
FARSIDE_DIR = P('biomes', 'farside')

def _excl_except(bdir, keep):
    pj = os.path.join(bdir, 'tex', 'pack.json')
    if not os.path.isfile(pj):
        return []
    with open(pj, encoding='utf-8') as _fh:
        fams = sorted(json.load(_fh).get('families', {}))
    return [f for f in fams if f not in keep]

# Read biomes/arch (nickel-hyperaccumulators) and biomes/farside (stormwrack/wineweed) species in place after 46-host-init.js
PATH['47a0-biome-arch-chem.js'] = os.path.join(ARCH_DIR, 'src', '40-biome-arch-chem.js')
PATH['47a1-biome-arch-sites.js'] = os.path.join(ARCH_DIR, 'src', '41-biome-arch-sites.js')
PATH['47a2-biome-arch-species.js'] = os.path.join(ARCH_DIR, 'src', '50-biome-arch-species.js')

PATH['47b1-biome-farside-species.js'] = os.path.join(FARSIDE_DIR, 'src', '50-biome-farside-species.js')

ARCH_KIN_BRIDGE = """
(function(){
  var prev0 = BIO.kit('arch');
  try {
    var T3 = BIO.host.THREE, fn = BIO.fn, TAU = fn.TAU, rr = fn.rr, qEuler = fn.qEuler;
    if (ARCHB.M && ARCHB.M.bark && !ARCHB.M.bark.map) {
      ARCHB.M.bark.map = BIO.canvasTex(64, 64, function(g){
        var im = g.createImageData(64, 64), d = im.data;
        for (var i = 0; i < 64 * 64; i++) {
          var v = 128 + ((i * 37) % 31) - 15;
          d[i * 4] = v; d[i * 4 + 1] = v - 6; d[i * 4 + 2] = v - 12; d[i * 4 + 3] = 255;
        }
        g.putImageData(im, 0, 0);
      });
    }
    var cg = new T3.CylinderGeometry(0.5, 0.5, 1, 6, 1), cp = cg.attributes.position, cc = [];
    for (var ci = 0; ci < cp.count; ci++) { var ao = 0.7 + 0.3 * (cp.getY(ci) + 0.5); cc.push(ao, ao, ao); }
    cg.setAttribute('color', new T3.Float32BufferAttribute(cc, 3));
    BIO.def('ar_rod_bark', cg, ARCHB.M.bark, { label: 'Ultramafic maquis stem' });
    ARCHB.builders = {
      pycnandra: {
        make: function(x, y, z){ return { x: x, y0: y, z: z, s: rr(2.2, 4.0) }; },
        grow: function(T){
          var pv = BIO.kit('arch');
          try {
            BIO.tree(T.x, T.z, function(){
              var th = T.s * 0.44;
              BIO.beam('ar_rod_bark', [T.x, T.y0 - 0.12, T.z], [T.x, T.y0 + th, T.z], 0.08, 0.04, 0x6e5e50);
              BIO.put('arpycn', [T.x, T.y0 + th, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 0.5, T.s * 0.55, T.s * 0.5], 0x386e44);
            }, { range: 520 });
          } finally { BIO.kit(pv); }
        }
      },
      gymnostoma: {
        make: function(x, y, z){ return { x: x, y0: y, z: z, s: rr(1.6, 3.0) }; },
        grow: function(T){
          var pv = BIO.kit('arch');
          try {
            BIO.tree(T.x, T.z, function(){
              var th = T.s * 0.38;
              BIO.beam('ar_rod_bark', [T.x, T.y0 - 0.12, T.z], [T.x, T.y0 + th, T.z], 0.06, 0.03, 0x5c5044);
              BIO.put('argymno', [T.x, T.y0 + th, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 0.62, T.s * 0.72, T.s * 0.62], 0x4a5e40);
            }, { range: 520 });
          } finally { BIO.kit(pv); }
        }
      }
    };
    BIO.kitEnd(ARCHB);
  } finally { BIO.kit(prev0); }
})();
"""

FARSIDE_KIN_BRIDGE = """
(function(){
  var prev0 = BIO.kit('farside');
  try {
    var fn = BIO.fn, TAU = fn.TAU, rr = fn.rr, qEuler = fn.qEuler;
    FARSIDE.builders = {
      stormwrack: {
        make: function(x, y, z){ return { x: x, y0: y, z: z, s: rr(0.55, 1.15) }; },
        grow: function(T){
          var pv = BIO.kit('farside');
          try {
            BIO.put('heap', [T.x, T.y0 - 0.02, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 1.1, T.s * 0.45, T.s * 1.1], 0x6c5c28);
          } finally { BIO.kit(pv); }
        }
      },
      wineweed: {
        make: function(x, y, z){ return { x: x, y0: y, z: z, s: rr(0.45, 0.85) }; },
        grow: function(T){
          var pv = BIO.kit('farside');
          try {
            BIO.put('heap', [T.x, T.y0 - 0.02, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 0.55, T.s * 0.28, T.s * 0.55], 0x5a4638);
            BIO.put('wine0', [T.x, T.y0 + 0.14, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 0.75, T.s * 0.35, T.s * 0.75], 0xd88ca0);
          } finally { BIO.kit(pv); }
        }
      }
    };
    BIO.kitEnd(FARSIDE);
  } finally { BIO.kit(prev0); }
})();
"""

VIRTUAL = {
    '44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'batteredisle', side=SIDE, own=True),
    '44a-host-matlib-pack-arch.js': matlib_pack.fragment(ARCH_DIR, 'arch', side=SIDE, exclude=_excl_except(ARCH_DIR, ('glossy', 'needles', 'bark'))),
    '44b-host-matlib-pack-farside.js': matlib_pack.fragment(FARSIDE_DIR, 'farside', side=SIDE, exclude=_excl_except(FARSIDE_DIR, ('heap', 'wine0', 'wine1'))),
    '47a8-arch-kin-bridge.js': ARCH_KIN_BRIDGE,
    '47b8-farside-kin-bridge.js': FARSIDE_KIN_BRIDGE,
    khost.EDITS_JS: khost.edits_js(HERE, 'batteredisle'),
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
        with open(PATH[f], encoding='utf-8') as _fh:
            s = _fh.read()
    n = int(re.match(r'(\d+)', f).group(1))
    if 10 <= n < 80 and '-host-' not in f and 'core-' not in f and not re.match(r'(22[a-d]|47[ab])', f) and not (
            PATH[f] and '/core/' in PATH[f].replace(os.sep, '/')):
        for w in FORBID:
            if w in s:
                bad.append('%s: uses %s' % (f, w))
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else '')
    out.append(s)

if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    sys.exit(1)

BSRC.report(PATH, [os.path.join(HERE, 'stations', k, 'station.json') for k in STATIONS[1:]])

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    html = matlib_pack.write_sidecar(SIDE, html, DIST, 'batteredisle.tex.js', prune=False)
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
