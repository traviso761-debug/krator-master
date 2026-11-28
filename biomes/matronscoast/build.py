#!/usr/bin/env python3
"""Concatenate src/* and core/* (filename order) into dist/matronscoast[-<station>].html: Matron's Coast / The Snail Coast (PLAN.md).

  python3 tools/build.py biomes/matronscoast                        dist/matronscoast.html: Station 1 (skerry, 312, 392)
  python3 tools/build.py biomes/matronscoast --station browsewood   dist/matronscoast-browsewood.html: Station 2 (browsewood, 356, 424)
  python3 tools/build.py biomes/matronscoast --station kelpfront    dist/matronscoast-kelpfront.html: Station 3 (kelpfront, 298, 476)
  python3 tools/build.py biomes/matronscoast --station cloudslope   dist/matronscoast-cloudslope.html: Station 4 (cloudslope, 438, 386)
  python3 tools/build.py biomes/matronscoast --stations             all four stations
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

STATIONS = ['skerry', 'browsewood', 'kelpfront', 'cloudslope']
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
        _rc |= subprocess.call([sys.executable, os.path.abspath(__file__), '--station', _s, '--no-checks'] + _rest)
    sys.exit(_rc)

_args = [a for a in sys.argv[1:] if not a.startswith('--') or a == '--station']
STATION = _args[_args.index('--station') + 1] if '--station' in _args else None
if STATION:
    _args = [a for a in _args if a not in ('--station', STATION)]
STATION = STATION or 'skerry'
if STATION not in STATIONS:
    sys.exit('build.py: unknown station ' + STATION)

OUT = _args[0] if _args else ('matronscoast.html' if STATION == 'skerry' else 'matronscoast-%s.html' % STATION)
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
for f in sorted(os.listdir(_sd)):
    if re.match(r'\d', f) and (f.endswith('.js') or f.endswith('.html')):
        PATH[f] = os.path.join(_sd, f)

# 1. core/shader, core/export, core/rand, core/drawn, core/shadow, core/space, core/hazard, core/mask, core/coast, core/tags
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

# 2. core/biome: CORE_BIOME_MIN + joint, variants/kin, fungoid, anim, walker, lean, env, export, stage
CORE_BIOME = buildlib.CORE_BIOME_MIN + [
    'core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js', 'core/biome/33-core-fungoid.js',
    'core/biome/35-core-anim.js', 'core/biome/36-core-walker.js', 'core/biome/37-core-traps.js',
    'core/biome/39-core-lean.js', 'core/biome/41-core-env.js', 'core/biome/42-core-export.js',
    'core/biome/43-core-export-host.js', 'core/biome/44-core-stage.js',
]
for rel in CORE_BIOME:
    PATH.setdefault(os.path.basename(rel), P(*rel.split('/')))

# 3. kits/crops read in place ([G data], sorted before 22-snail-crops.js)
PATH.setdefault('21a-crop-core.js', P('kits', 'crops', 'src', '10-crop-core.js'))
PATH.setdefault('21b-crop-records.js', P('kits', 'crops', 'src', '20-crop-records.js'))
PATH.setdefault('21c-crop-material.js', P('kits', 'crops', 'src', '22-crop-material.js'))
PATH.setdefault('21d-crop-query.js', P('kits', 'crops', 'src', '40-crop-query.js'))

# 4. core/materials/record + Stage 5 27-matlib-m1.js
for f in ('23-mat-record.js', '25-matlib-host.js', '27-matlib-m1.js'):
    PATH.setdefault(f, P('core', 'materials', 'record', f))

# 5. core/terrain: KSTRATA, KSTACKS, KRELIEF, KGROUND, KFAR, KHORIZON
CORE_TERRAIN = [
    '35-core-strata.js', '37-core-stacks.js', '38-core-relief.js',
    '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js',
]
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))

# 6. core/host
sys.path.insert(0, P('core', 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.FULL + ['94-host-polytool.js'])

# 7. core/atmos + sky + fogBelt/heightFog + fx/raincover
for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-8-export.js',
          '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-4-weather.js', '89-atmos-9-host.js'):
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = P('core', 'atmos', 'fx', f)

# 8. core/water + farbed/53-core-water-farbed.js + ext
for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, P('core', 'water', f))
PATH.setdefault('52f-core-water-farbed.js', P('core', 'water', 'farbed', '53-core-water-farbed.js'))
for f in ('53-core-water-terraces.js', '53b-core-water-terraces-draw.js',
          '56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js'):
    PATH.setdefault(f, P('core', 'water', 'ext', f))

miss = [f for f in ('10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '34-core-impostor.js', '40-core-place.js') if f not in PATH]
if miss:
    print('NO BIOME CORE: ' + ', '.join(miss))
    sys.exit(1)

# 9. Virtual texture sidecars + BIO.kin read-in-place partners (biomes/shroudhills & biomes/farside)
sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402
SIDE = None if '--inline-packs' in sys.argv else {}

SHROUD_DIR = P('biomes', 'shroudhills')
FARSIDE_DIR = P('biomes', 'farside')


def _excl_except(bdir, keep):
    pj = os.path.join(bdir, 'tex', 'pack.json')
    if not os.path.isfile(pj):
        return []
    with open(pj, encoding='utf-8') as _fh:
        fams = sorted(json.load(_fh).get('families', {}))
    return [f for f in fams if f not in keep]


PATH['47a0-shroudhills-defs.js'] = os.path.join(SHROUD_DIR, 'src', '20-shroudhills-defs.js')
PATH['47a1-shroudhills-mats.js'] = os.path.join(SHROUD_DIR, 'src', '30-shroudhills-mats.js')
PATH['47b0-farside-species.js'] = os.path.join(FARSIDE_DIR, 'src', '50-biome-farside-species.js')

SHROUDHILLS_KIN_BRIDGE = """
(function(){
  var prev0 = BIO.kit('shroudhills');
  try {
    SHROUDHILLS.setupKit();
    if (typeof MC_VSTACK !== 'undefined' && SHROUDHILLS.MAT) {
      MC_VSTACK.dilateCardTextures('shroudhills', SHROUDHILLS.MAT);
    }
    var fn = BIO.fn, TAU = fn.TAU, lerp = fn.lerp, rr = fn.rr, pick = fn.pick, qEuler = fn.qEuler;
    var PAL = SHROUDHILLS.PAL;
    var flare = function(pts, pR){ return BIO.flareJoin ? BIO.flareJoin(pts, { parentR: pR, k: 1.65, sink: 0.58, len: 2.0 }) : pts; };

    SHROUDHILLS.builders = {
      shroud_kohekohe: {
        make: function(x, y, z){
          return { x: x, y0: y, z: z, H: rr(22, 31), rb: rr(0.45, 0.72), crownR: rr(5.5, 7.8), cupForks: [] };
        },
        grow: function(T){
          var pv = BIO.kit('shroudhills');
          try {
            BIO.tree(T.x, T.z, function(){
              var H0 = T.H, r0 = T.rb, trunk = [];
              for (var i = 0; i <= 6; i++) {
                var t = i / 6;
                var fl = 1 + 0.88 * Math.pow(Math.max(0, 1 - t / 0.22), 2);
                trunk.push({ x: T.x, y: T.y0 - 0.85 + (H0 + 0.85) * t, z: T.z, r: Math.max(0.08, r0 * (1 - 0.76 * t) * fl) });
              }
              BIO.tube('mahogany', trunk, pick(PAL.mahoganyBark), { seg: 7 });
              for (var k = 0; k < 4; k++) {
                var az0 = (k / 4) * TAU + rr(-0.2, 0.2), rs = r0 * rr(2.2, 2.9);
                BIO.tube('mahogany', flare([
                  { x: T.x + Math.cos(az0) * r0 * 0.45, y: T.y0 + 2.2, z: T.z + Math.sin(az0) * r0 * 0.45, r: r0 * 0.42 },
                  { x: T.x + Math.cos(az0) * rs * 0.62, y: T.y0 + 0.55, z: T.z + Math.sin(az0) * rs * 0.62, r: r0 * 0.26 },
                  { x: T.x + Math.cos(az0) * rs, y: T.y0 - 0.85, z: T.z + Math.sin(az0) * rs, r: r0 * 0.14 }
                ], r0), pick(PAL.mahoganyBark), { seg: 4 });
              }
              /* Strictly above the 2.20 m Snail Coast radula browse-skirt (baseT >= 0.40 -> y >= 8.8 m); zero Shroud-Ant drum-galls! */
              for (var ti = 0; ti < 3; ti++) {
                var baseT = 0.42 + 0.22 * ti;
                for (var b = 0; b < 3; b++) {
                  var az = (b / 3) * TAU + ti * 1.1 + rr(-0.18, 0.18);
                  var reach = H0 * rr(0.18, 0.24), by0 = T.y0 + H0 * baseT, pR = Math.max(0.08, r0 * (1 - 0.72 * baseT));
                  var ex = T.x + Math.cos(az) * reach, ez = T.z + Math.sin(az) * reach, ey = by0 + reach * 0.20;
                  var mx = lerp(T.x, ex, 0.50), my = lerp(by0, ey, 0.55), mz = lerp(T.z, ez, 0.50);
                  BIO.tube('mahogany', flare([
                    { x: T.x, y: by0, z: T.z, r: pR * 0.48 },
                    { x: mx, y: my, z: mz, r: pR * 0.30 },
                    { x: ex, y: ey, z: ez, r: pR * 0.16 }
                  ], pR), pick(PAL.mahoganyBark), { seg: 5 });
                  var pw = reach * 0.88, ph = pw * 0.62;
                  BIO.put('kohe_clump', [ex, ey, ez], qEuler(0, az, 0), [pw, ph, pw], pick(PAL.koheLeaf));
                  BIO.put('kohe_clump', [mx, my, mz], qEuler(0, az + 1.0, 0), [pw * 0.74, ph * 0.74, pw * 0.74], pick(PAL.koheLeaf));
                  if (ti === 0 && b === 0) T.cupForks.push({ x: mx, y: my + 0.08, z: mz, yaw: az });
                }
              }
              var tw = H0 * 0.20;
              BIO.put('kohe_clump', [T.x, T.y0 + H0, T.z], qEuler(0, rr(0, TAU), 0), [tw, tw * 0.62, tw], pick(PAL.koheLeaf));
            }, { range: 420 });
          } finally { BIO.kit(pv); }
        }
      },
      shroud_amber_kauri: {
        make: function(x, y, z){
          return { x: x, y0: y, z: z, H: rr(26, 36), rb: rr(0.52, 0.82), crownR: rr(5.2, 7.2), cupForks: [] };
        },
        grow: function(T){
          var pv = BIO.kit('shroudhills');
          try {
            BIO.tree(T.x, T.z, function(){
              var H0 = T.H, r0 = T.rb, trunk = [];
              for (var i = 0; i <= 6; i++) {
                var t = i / 6;
                trunk.push({ x: T.x, y: T.y0 - 0.85 + (H0 + 0.85) * t, z: T.z, r: i === 6 ? 0.036 : Math.max(0.10, r0 * (1 - 0.72 * t)) });
              }
              trunk.push({ x: T.x, y: T.y0 + H0 + 0.08, z: T.z, r: 0.028 });
              BIO.tube('kauri', trunk, pick(PAL.kauriBark), { seg: 7 });
              for (var ti = 0; ti < 4; ti++) {
                var baseT = 0.44 + 0.16 * ti;
                for (var b = 0; b < 3; b++) {
                  var az = (b / 3) * TAU + ti * 0.95 + rr(-0.15, 0.15);
                  var reach = H0 * rr(0.15, 0.21) * (1 - 0.22 * ti), by0 = T.y0 + H0 * baseT, pR = Math.max(0.08, r0 * (1 - 0.68 * baseT));
                  var ex = T.x + Math.cos(az) * reach, ez = T.z + Math.sin(az) * reach, ey = by0 + reach * 0.14;
                  var mx = lerp(T.x, ex, 0.52), my = lerp(by0, ey, 0.54), mz = lerp(T.z, ez, 0.52);
                  BIO.tube('kauri', flare([
                    { x: T.x, y: by0, z: T.z, r: pR * 0.46 },
                    { x: mx, y: my, z: mz, r: Math.min(0.08, pR * 0.26) },
                    { x: ex, y: ey, z: ez, r: 0.034 }
                  ], pR), pick(PAL.kauriBark), { seg: 5 });
                  var pw = reach * 0.94, ph = pw * 0.56;
                  BIO.put('kauri_clump', [ex, ey, ez], qEuler(0, az, 0), [pw, ph, pw], pick(PAL.kauriLeaf));
                  BIO.put('kauri_clump', [mx, my, mz], qEuler(0, az + 1.1, 0), [pw * 0.72, ph * 0.72, pw * 0.72], pick(PAL.kauriLeaf));
                  if (ti === 0 && b === 0) {
                    BIO.put('amber_drip0', [mx, my - 0.08, mz], qEuler(0, az, 0), [0.35, 0.85, 0.35], pick(PAL.amber));
                    T.cupForks.push({ x: mx, y: my + 0.08, z: mz, yaw: az });
                  }
                }
              }
              var tw = H0 * 0.16;
              BIO.put('kauri_clump', [T.x, T.y0 + H0, T.z], qEuler(0, rr(0, TAU), 0), [tw, tw * 0.72, tw], pick(PAL.kauriLeaf));
            }, { range: 420 });
          } finally { BIO.kit(pv); }
        }
      },
      shroud_sister_cups: {
        make: function(x, y, z, yaw){
          return { x: x, y: y, z: z, yaw: yaw == null ? rr(0, TAU) : yaw, cupR: rr(0.62, 0.86), lipH: rr(0.58, 0.78) };
        },
        grow: function(C){
          var pv = BIO.kit('shroudhills');
          try {
            BIO.tree(C.x, C.z, function(){
              var cy = Math.cos(C.yaw), sy = Math.sin(C.yaw);
              /* Woody bough-fork saddle under the paired Sister-Cups at matching range: 420 so no adjacent clump outranges it */
              BIO.tube('mahogany', [
                { x: C.x - cy * C.cupR * 0.95, y: C.y, z: C.z + sy * C.cupR * 0.95, r: 0.12 },
                { x: C.x, y: C.y, z: C.z, r: 0.14 },
                { x: C.x + cy * C.cupR * 0.95, y: C.y, z: C.z - sy * C.cupR * 0.95, r: 0.12 }
              ], pick(PAL.mahoganyBark), { seg: 4 });
              BIO.put('sister_cups0', [C.x, C.y, C.z], qEuler(0, C.yaw, 0), [C.cupR, C.lipH, C.cupR], pick(PAL.sisterTank));
              for (var sd = -1; sd <= 1; sd += 2) {
                var bx = C.x + cy * sd * 0.72 * C.cupR, bz = C.z - sy * sd * 0.72 * C.cupR;
                BIO.put('sister_bract', [bx, C.y + 0.04, bz], qEuler(0, C.yaw + sd * 0.6, 0), [C.cupR * 1.45, C.lipH * 0.82, C.cupR * 1.45], pick(PAL.sisterBract));
              }
              BIO.put('sister_drip', [C.x, C.y, C.z], qEuler(0, C.yaw, 0), [0.34, 2.1, 0.34], 0xdceae8);
            }, { range: 420 });
          } finally { BIO.kit(pv); }
        }
      }
    };
    BIO.kitEnd(SHROUDHILLS);
  } finally { BIO.kit(prev0); }
})();
"""

FARSIDE_KIN_BRIDGE = """
(function(){
  var prev0 = BIO.kit('farside');
  try {
    if (typeof MC_VSTACK !== 'undefined' && FARSIDE.MAT) {
      MC_VSTACK.dilateCardTextures('farside', FARSIDE.MAT);
    }
    var fn = BIO.fn, TAU = fn.TAU, rr = fn.rr, qEuler = fn.qEuler;
    FARSIDE.builders = {
      stormwrack: {
        make: function(x, y, z){ return { x: x, y0: y, z: z, s: rr(0.55, 1.15) }; },
        grow: function(T){
          var pv = BIO.kit('farside');
          try {
            BIO.put('heap', [T.x, T.y0 - 0.02, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 1.15, T.s * 0.42, T.s * 1.15], 0x6c5c28);
          } finally { BIO.kit(pv); }
        }
      },
      wineweed: {
        make: function(x, y, z){ return { x: x, y0: y, z: z, s: rr(0.45, 0.85) }; },
        grow: function(T){
          var pv = BIO.kit('farside');
          try {
            BIO.put('heap', [T.x, T.y0 - 0.02, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 0.55, T.s * 0.26, T.s * 0.55], 0x5a4638);
            BIO.put('wine0', [T.x, T.y0 + 0.12, T.z], qEuler(0, rr(0, TAU), 0), [T.s * 0.72, T.s * 0.34, T.s * 0.72], 0xd88ca0);
          } finally { BIO.kit(pv); }
        }
      },
      spraycoral: {
        make: function(x, y, z){ return { x: x, y0: y, z: z, s: rr(0.55, 1.05) }; },
        grow: function(T){
          var pv = BIO.kit('farside');
          try {
            BIO.put('staghorn0', [T.x, T.y0 - 0.04, T.z], qEuler(0, rr(0, TAU), 0), [T.s, T.s * 0.85, T.s], 0xf2e6e0);
          } finally { BIO.kit(pv); }
        }
      }
    };
    BIO.kitEnd(FARSIDE);
  } finally { BIO.kit(prev0); }
})();
"""

OWN_EXCLUDE = {
    'skerry': ['bark.yew', 'yewfol', 'shell.shag', 'bark.kelp', 'kelpstub'],
    'browsewood': ['bark.yew', 'yewfol', 'shell.shag', 'bark.kelp', 'kelpstub', 'shell.chiton'],
    'kelpfront': ['bark.yew', 'yewfol', 'shell.shag'],
    'cloudslope': ['bark.nacre', 'nacrefol', 'bark.palm', 'palmfrond', 'mineral.opaline', 'shell.tower', 'shell.chiton', 'bark.kelp', 'kelpstub'],
}

_PRUNE_JS = (
    '(function(){if(typeof KMAT!=="undefined"&&KMAT.packs){'
    'var ex=%s;if(KMAT.packs.matronscoast){for(var i=0;i<ex.length;i++)delete KMAT.packs.matronscoast[ex[i]];}'
    '%s}})();\n'
) % (
    json.dumps(OWN_EXCLUDE.get(STATION, [])),
    'delete KMAT.packs.farside;' if STATION not in ('skerry', 'kelpfront') else ''
)

VIRTUAL = {
    '44-host-matlib-pack.js': matlib_pack.fragment(HERE, 'matronscoast', side=SIDE, own=True),
    '44a-host-matlib-pack-shroudhills.js': matlib_pack.fragment(
        SHROUD_DIR, 'shroudhills', side=SIDE,
        exclude=_excl_except(SHROUD_DIR, ('mahogany', 'kauri', 'koheleaf', 'kaurileaf', 'amber', 'tank', 'bromeliad'))
    ),
    '44b-host-matlib-pack-farside.js': matlib_pack.fragment(
        FARSIDE_DIR, 'farside', side=SIDE,
        exclude=_excl_except(FARSIDE_DIR, ('heap', 'wine0', 'coralstem'))
    ),
    '44c-host-matlib-prune.js': _PRUNE_JS,
    '47a8-shroudhills-kin-bridge.js': SHROUDHILLS_KIN_BRIDGE,
    '47b8-farside-kin-bridge.js': FARSIDE_KIN_BRIDGE,
    khost.EDITS_JS: khost.edits_js(HERE, 'matronscoast'),
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
    is_core = bool(rel_p and ('/core/' in rel_p or '/kits/crops/' in rel_p))
    if 10 <= n < 80 and '-host-' not in f and f != '46-mc-vstack.js' and not re.match(r'47[ab]', f) and not is_core:
        for w in FORBID:
            if w in s:
                bad.append('%s: uses %s' % (f, w))
    out.append(('\n// ==================== %s\n' % f) if f.endswith('.js') else '')
    out.append(s)
if bad:
    print('BIOME FRAGMENT DEPENDS ON A HOST ENGINE:\n  ' + '\n  '.join(bad))
    sys.exit(1)

BSRC.report(PATH, [os.path.join(HERE, 'stations', k, 'station.json') for k in STATIONS])
os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    html = matlib_pack.write_sidecar(SIDE, html, DIST, 'matronscoast.tex.js', prune=False)
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
