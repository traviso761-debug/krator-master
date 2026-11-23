#!/usr/bin/env python3
"""Build settlements/battered-port (Bè-tõ-pò: Bare-Stone Port) -> dist/battered-port.html + .tex.*.js sidecars.

   python3 tools/build.py settlements/battered-port          # builds dist/battered-port.html (< 3.5 MB) + sidecars
   python3 settlements/battered-port/build.py --list-sources # lists all read repo files (tools/dep_graph.py)
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


P = lambda *a: os.path.normpath(os.path.join(ROOT, *a))
NL = '\n'


def rd(p):
    with open(p, encoding='utf-8') as _fh:
        return _fh.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def safe(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


OUT = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'battered-port.html'
PATH = {f: os.path.join(SRC, f) for f in os.listdir(SRC) if not f.startswith('.')}

# 1. Core modules (core/shader, core/export, core/rand, core/drawn, core/shadow, core/interiors,
#    core/door, core/walk, core/space, core/mask, core/coast, core/materials/record, core/tags)
PATH.setdefault('06-core-khook.js', P('core', 'shader', '06-core-khook.js'))
PATH.setdefault('06b-core-kcolor.js', P('core', 'shader', '06b-core-kcolor.js'))
for f in ('07-core-export.js', '09-core-export-adapters.js'):
    PATH.setdefault(f, P('core', 'export', f))
PATH.setdefault('08-core-rand.js', P('core', 'rand', '08-core-rand.js'))
PATH.setdefault('10-core-drawn.js', P('core', 'drawn', '10-core-drawn.js'))
PATH.setdefault('10-core-shadow.js', P('core', 'shadow', '10-core-shadow.js'))
PATH.setdefault('12-core-shadow-host.js', P('core', 'shadow', 'host', '12-core-shadow-host.js'))
PATH.setdefault('10-core-roomlight.js', P('core', 'interiors', '10-core-roomlight.js'))
for f in ('10-core-door.js', '20-core-glass.js', '90-core-door-host.js'):
    PATH.setdefault(f, P('core', 'door', f))
PATH.setdefault('20-core-walk.js', P('core', 'walk', '20-core-walk.js'))
PATH.setdefault('24-core-walk-box.js', P('core', 'walk', 'box', '24-core-walk-box.js'))
PATH.setdefault('20-core-space.js', P('core', 'space', '20-core-space.js'))
PATH.setdefault('20-core-hazard.js', P('core', 'hazard', '20-core-hazard.js'))
PATH.setdefault('25-core-mask.js', P('core', 'mask', '25-core-mask.js'))
PATH.setdefault('27-core-mask-distance.js', P('core', 'mask', '27-core-mask-distance.js'))
PATH.setdefault('30-core-coast.js', P('core', 'coast', '30-core-coast.js'))
for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js', '27-matlib-m1.js'):
    PATH.setdefault(f, P('core', 'materials', 'record', f))
for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH.setdefault(f, P('core', 'tags', f))

# 2. core/biome (CORE_BIOME_MIN + dither, joint, variants, impostor, anim, traps, lean, env, export, stage)
CORE_BIOME = list(buildlib.CORE_BIOME_MIN) + [
    'core/biome/31-core-dither.js', 'core/biome/31j-core-joint.js', 'core/biome/32-core-variants.js',
    'core/biome/33-core-fungoid.js', 'core/biome/35-core-anim.js', 'core/biome/37-core-traps.js',
    'core/biome/39-core-lean.js', 'core/biome/41-core-env.js', 'core/biome/42-core-export.js',
    'core/biome/43-core-export-host.js', 'core/biome/44-core-stage.js',
]
for rel_b in CORE_BIOME:
    PATH.setdefault(os.path.basename(rel_b), P(*rel_b.split('/')))

# 3. core/terrain + core/world (WRELIEF + WMICRO v2)
CORE_TERRAIN = [
    '35-core-strata.js', '36-core-carve.js', '37-core-stacks.js', '38-core-relief.js',
    '39-core-cavern.js', '39b-core-speleo.js', '39b2-core-speleo-cleft.js', '39d-core-cavern-floor.js',
    '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js',
]
for f in CORE_TERRAIN:
    PATH.setdefault(f, P('core', 'terrain', f))
PATH.setdefault('35z-core-strata-shade.js', P('core', 'terrain', 'host', '35-core-strata-shade.js'))
PATH.setdefault('39e-core-cavern-draw.js', P('core', 'terrain', 'host', '39e-core-cavern-draw.js'))
PATH.setdefault('39h-core-cavern-cut.js', P('core', 'terrain', 'host', '39h-core-cavern-cut.js'))
PATH.setdefault('44-core-farfield-draw.js', P('core', 'terrain', 'host', '44-core-farfield-draw.js'))
PATH.setdefault('45-core-horizon-shade.js', P('core', 'terrain', 'host', '45-core-horizon-shade.js'))

# WRELIEF + WMICRO v2 loaded before 40-bp-cinder-site.js
PATH.setdefault('38w-world-relief.js', P('core', 'world', '43-world-relief.js'))
PATH.setdefault('38x-world-micro.js', P('core', 'world', '43m-world-micro.js'))

# 4. kits/crops read in place
PATH.setdefault('22a-crop-core.js', P('kits', 'crops', 'src', '10-crop-core.js'))
PATH.setdefault('22b-crop-records.js', P('kits', 'crops', 'src', '20-crop-records.js'))
PATH.setdefault('22c-crop-material.js', P('kits', 'crops', 'src', '22-crop-material.js'))
PATH.setdefault('22d-crop-query.js', P('kits', 'crops', 'src', '40-crop-query.js'))

# 5. core/cityconstructMesh + core/simulation + core/water + core/atmos + core/host
PATH.setdefault('54-city-host-construct.js', P('core', 'city', '54-city-host-construct.js'))

SIM_FILES = [
    '77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
    '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
    '77-sim-6-items.js', '77-sim-6-needs.js', '77-sim-6-population.js', '77-sim-6-trade.js',
    '77-sim-7-stocks.js', '77-sim-8-export.js',
]
for f in SIM_FILES:
    PATH.setdefault(f, P('core', 'simulation', f))

for f in ('20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js'):
    PATH.setdefault(f, P('core', 'water', f))
PATH.setdefault('52f-core-water-farbed.js', P('core', 'water', 'farbed', '53-core-water-farbed.js'))
for f in ('56-core-water-breakup.js', '57-core-water-audit.js', '58-core-water-mirror.js'):
    PATH.setdefault(f, P('core', 'water', 'ext', f))

for f in ('89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-4-weather.js',
          '89-atmos-8-export.js', '89-atmos-9-host.js', '89-atmos-a-waves.js', '89-atmos-b-skylight.js'):
    PATH.setdefault(f, P('core', 'atmos', f))
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = P('core', 'atmos', 'sky', f)
for f in ('89-atmos-c-hostbind.js', '89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = P('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = P('core', 'atmos', 'fx', f)

sys.path.insert(0, P('core', 'host'))
import host as khost  # noqa: E402
khost.resolve(PATH, khost.FULL + ['92k-host-keys.js'])

# 6. biomes/batteredisle + arch/farside kin read in place
BATTER_DIR = P('biomes', 'batteredisle')
ARCH_DIR = P('biomes', 'arch')
FARSIDE_DIR = P('biomes', 'farside')

PATH['28a-batter-mipvar.js'] = os.path.join(BATTER_DIR, 'src', '28-batter-mipvar.js')
PATH['40a-biome-batter-phys.js'] = os.path.join(BATTER_DIR, 'src', '40-biome-batter-phys.js')
PATH['41a-biome-batter-sites.js'] = os.path.join(BATTER_DIR, 'src', '41-biome-batter-sites.js')
PATH['47a0-biome-arch-chem.js'] = os.path.join(ARCH_DIR, 'src', '40-biome-arch-chem.js')
PATH['47a1-biome-arch-sites.js'] = os.path.join(ARCH_DIR, 'src', '41-biome-arch-sites.js')
PATH['47a2-biome-arch-species.js'] = os.path.join(ARCH_DIR, 'src', '50-biome-arch-species.js')
PATH['47b1-biome-farside-species.js'] = os.path.join(FARSIDE_DIR, 'src', '50-biome-farside-species.js')
PATH['50-biome-batter-species.js'] = os.path.join(BATTER_DIR, 'src', '50-biome-batter-species.js')
PATH['60a-biome-batter-place.js'] = os.path.join(BATTER_DIR, 'src', '60-biome-batter-place.js')
PATH['70a-biome-batteredisle.js'] = os.path.join(BATTER_DIR, 'src', '70-biome-batteredisle.js')

# 7. Sealed Read-in-Place Bundles: KCITY, ETK (kits/eternian + core/engine + Exile Dress), KCONS, RINGSEA, Furniture & Interiors
CITY_JS = [
    '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
    '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js',
]


def kcity_bundle():
    files = [P('core', 'city', f) for f in CITY_JS]
    body = ''
    for p in files:
        fn = os.path.basename(p)
        body += '/* ---- %s ---- */\n%s\n' % (rel(p), rd(p))
        if fn == '10-city-core.js':
            body += 'globalThis.KCITY = KCITY;\n'
    return safe(
        '/* KCITY: core/city sealed in one closure (settlements/battered-port/build.py). */\n'
        'var KCITY = (function(window){\n' + body +
        'KCITY.lib = { SL: SL, OCC: OCC, Raster: Raster, V: V, obb: obb, obbCorners: obbCorners, inPoly: inPoly, plan: function(){ return PLAN; } };\n'
        'return KCITY;\n})(Object.create(window));\n'
    ), [rel(p) for p in files]


ET_DIR = P('kits', 'eternian')
ET_SKIP = (
    '00-head.html', '81-sky.js', '89-rows.js', '90-scene.js', '91-probe.js',
    '91c-et-clock.js', '91d-et-water.js', '91f-furnish.js', '91i-interiors.js',
    '91n-night.js', '92-camera.js', '92-world.js', '93-anim.js', '93e-et-export.js',
    '99-host-take.js', '99-tail.html',
)


def etk_bundle():
    sys.path.insert(0, P('core', 'engine'))
    import engine as kengine
    fs = {f: p for f, p in kengine.paths().items() if f.endswith('.js') and f not in ET_SKIP}
    et_src = os.path.join(ET_DIR, 'src')
    fs.update({f: os.path.join(et_src, f) for f in os.listdir(et_src) if f[0].isdigit() and f.endswith('.js') and f not in ET_SKIP})
    for f in ('42r-res-ore.js', '44r-res-nodes.js'):
        fs[f] = P('kits', 'resources', 'src', f)
    ordered = [fs[k] for k in sorted(fs)]

    head = r'''
var ETK_ERRS = [];
var window = new Proxy(globalThis.window || globalThis, {
  get: function(t, k){ var v = t[k]; return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },
  set: function(t, k, v){ if (k === 'onerror') return true; t[k] = v; return true; }
});
var buildWorld = function(){ return null; }, WORLD = null;
var SVF = { WEALTH: {}, missing: {}, placed: [] };
function svfNewBatch(){}
function FURNISH(){ return null; }
function FURNISH_HANG(){ return null; }
function svfH(key, v, dflt){ return dflt; }
var KratorFurniture = globalThis.KratorFurniture || { FURN_BY_KEY: {}, has: function(){ return false; }, entryDims: function(){ return { w: 1, d: 1, h: 1 }; }, setDetail: function(){} };
'''
    mid = ''.join('/* ---- %s ---- */\n%s\n;\n' % (rel(p), rd(p)) for p in ordered)

    tail = r'''
reportErr = function(m){ ETK_ERRS.push(String(m).slice(0, 500)); };
/* Unpainted Exile Dress overrides inside ETK ("No Mask Above the Door, No Chalk Upon the Cheek", 0 Heirs gold): */
if (typeof SVPAL !== 'undefined') {
  SVPAL.gold = [0x8c7b5c];
  SVPAL.stoneD = [0x382c2a, 0x2e3136, 0x3b2a26];
}
/* Suppress closed-eyed household ancestor masks on all lintels -> recessed chiselled-blank basalt plaque + driftwood bar! */
if (typeof etMask === 'function') {
  etMask = function(x, y, z, s){
    box('stone', x, y, z, s * 0.88, s * 0.92, 0.08, P('stoneD'));
    box('timber', x, y + s * 0.34, z + 0.05, s * 0.76, s * 0.16, 0.05, P('timberL'));
  };
}
/* Swap any 'gold' statuary metal to weathered bronze/stone and open eyes on living syndicate figureheads */
if (typeof etHead === 'function') {
  var _etHead0 = etHead;
  etHead = function(x, y, z, h, o){
    var o2 = Object.assign({}, o || {});
    if (o2.metal === 'gold') o2.metal = 'bronze';
    o2.eyes = 'open';
    return _etHead0(x, y, z, h, o2);
  };
}
if (typeof etFigure === 'function') {
  var _etFigure0 = etFigure;
  etFigure = function(x, y, z, h, o){
    var o2 = Object.assign({}, o || {});
    if (o2.metal === 'gold') o2.metal = 'bronze';
    o2.eyes = 'open';
    return _etFigure0(x, y, z, h, o2);
  };
}
(function(){
  var recs = {};
  for (var k in MAT) {
    var fam = SV_LIB[k], L = fam && KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, fam) : null;
    recs[k] = {
      id: KIT.pack + '.' + k, family: k, scale: [TILE[k] == null ? 1 : TILE[k], TILE[k] == null ? 1 : TILE[k]],
      tint: true, roughness: MAT[k].roughness === undefined ? 1 : MAT[k].roughness, metal: MAT[k].metalness == null ? 0 : MAT[k].metalness,
      specular: L ? L.specular : 0.5, breakup: L ? (L.breakup || null) : null, lib: L ? L.lib : null,
      doubleSided: MAT[k].side === THREE.DoubleSide
    };
  }
  KMAT.adapter(KIT.pack, recs);
})();
function etkFixtures(rec){
  var f = { doors: [], windows: [], lamps: [] }, r3 = function(v){ return +v.toFixed(3); };
  (function walk(r){
    if (!r) return;
    (r.doors || []).forEach(function(q){ f.doors.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h || null, part: r.key }); });
    (r.windows || []).forEach(function(q){ f.windows.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h, sill: q.sill, part: r.key }); });
    (r.children || []).forEach(walk);
  })(rec);
  return f;
}
function etkProto(key, v){
  var d = DEFS[key]; if (!d) return null;
  var G = new THREE.Group(); G.name = key + '#' + (v | 0);
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  var dry = PLACE_DRY; PLACE_DRY = 1; var rec = null;
  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0 }); } finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false);
  G.userData = { key: key, v: v | 0, tris: Math.round(GSTAT.tris), w: d.w, d: d.d, h: d.h, heads: (rec && rec.heads) || [], fixtures: etkFixtures(rec) };
  return G;
}
return { proto: etkProto, DEFS: DEFS, MAT: MAT, KIT: KIT, errors: ETK_ERRS };
'''
    return safe(
        '/* ETK: kits/eternian + core/engine sealed with Unpainted Exile Dress overrides (settlements/battered-port/build.py). */\n'
        'var ETK = (function(){\n' + head + mid.replace('window.onerror=', 'var _etkOnerror=') + tail + '\n})();\n'
    ), [rel(p) for p in ordered]


def kcons_bundle():
    files = [P('kits', 'construction', 'src', '10-cons-site.js'), P('kits', 'construction', 'src', '20-cons-lib.js')]
    body = ''.join('/* ---- %s ---- */\n%s\n' % (rel(p), rd(p)) for p in files)
    return safe(body), [rel(p) for p in files]


VESSELS = [
    '87-rs-voth-dhow.js', '89b-rs-islander-lanong.js', '80-rs-iziz-lighter.js',
    '85-rs-voth-barge.js', '65-rs-hyk-galley.js', '89f-rs-ark-trimaran.js', '89h-rs-hk-whaler.js',
]


def ringsea_bundle():
    sys.path.insert(0, P('settlements', 'voth'))
    import ringsea
    ringsea.VESSELS = VESSELS
    return safe(ringsea.ringsea_fragment().replace('window.onerror=', 'var _rsOnerror=')), [rel(os.path.join(ringsea.RS_SRC, f)) for f in VESSELS] + ['settlements/voth/ringsea.py']


def furn_and_interiors():
    sys.path.insert(0, P('kits', 'catalog'))
    sys.path.insert(0, P('kits', 'interiors'))
    import furniture_bundle
    import kit_bundle
    fb = furniture_bundle.bundle(['eternian'], harvested=False)
    ib = kit_bundle.bundle(['eternian'])
    return safe(fb + '\n' + ib + '\n'), ['kits/interiors/sets/eternian.js']


def peoples_fragment():
    pp = P('core', 'charactermodels', 'data', 'peoples.json')
    if not os.path.isfile(pp):
        return 'var BP_PEOPLES = {};\n', []
    data = json.loads(rd(pp))
    sub = {k: data[k] for k in ('eternian', 'yonni', 'hueru-kuran') if k in data}
    return 'var BP_PEOPLES = %s;\n' % json.dumps(sub, separators=(',', ':')), [rel(pp)]


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

# 8. Sidecar Texture Packs (.tex.battered_port.js, .tex.eternian.js, .tex.batteredisle.js, .tex.arch.js, .tex.farside.js)
sys.path.insert(0, P('tools', 'textures'))
import matlib_pack  # noqa: E402
SIDE = None if '--inline-packs' in sys.argv else {}


def _excl_except(bdir, keep):
    pj = os.path.join(bdir, 'tex', 'pack.json')
    if not os.path.isfile(pj):
        return []
    with open(pj, encoding='utf-8') as _fh:
        fams = sorted(json.load(_fh).get('families', {}))
    return [f for f in fams if f not in keep]


_kcity_js, _kcity_src = kcity_bundle()
_etk_js, _etk_src = etk_bundle()
_kcons_js, _kcons_src = kcons_bundle()
_rs_js, _rs_src = ringsea_bundle()
_fi_js, _fi_src = furn_and_interiors()
_pp_js, _pp_src = peoples_fragment()

BSRC.note(*(_kcity_src + _etk_src + _kcons_src + _rs_src + _fi_src + _pp_src + ['settlements/battered-port/site/battered-site.json']))

VIRTUAL = {
    '38-furniture-interiors-bundle.js': _fi_js,
    '39a-kcity-bundle.js': _kcity_js,
    '39b-etk-bundle.js': _etk_js,
    '39c-kcons-bundle.js': _kcons_js,
    '39d-ringsea-bundle.js': _rs_js,
    '39e-peoples-data.js': _pp_js,
    '44-host-matlib-pack-bp.js': matlib_pack.fragment(HERE, 'battered_port', side=SIDE, own=True),
    '44a-host-matlib-pack-eternian.js': matlib_pack.fragment(ET_DIR, 'eternian', side=SIDE),
    '44b-host-matlib-pack-batteredisle.js': matlib_pack.fragment(BATTER_DIR, 'batteredisle', side=SIDE),
    '44c-host-matlib-pack-arch.js': matlib_pack.fragment(ARCH_DIR, 'arch', side=SIDE, exclude=_excl_except(ARCH_DIR, ('glossy', 'needles', 'bark'))),
    '44d-host-matlib-pack-farside.js': matlib_pack.fragment(FARSIDE_DIR, 'farside', side=SIDE, exclude=_excl_except(FARSIDE_DIR, ('heap', 'wine0', 'wine1'))),
    '47a8-arch-kin-bridge.js': ARCH_KIN_BRIDGE,
    '47b8-farside-kin-bridge.js': FARSIDE_KIN_BRIDGE,
    khost.EDITS_JS: khost.edits_js(HERE, 'battered-port'),
}
for f in VIRTUAL:
    PATH[f] = None

frags = sorted(PATH)
out = []
for f in frags:
    s = VIRTUAL[f] if PATH[f] is None else rd(PATH[f])
    out.append('\n// ==================== %s\n' % f if f.endswith('.js') else '')
    out.append(s)

BSRC.report(PATH, [os.path.join(HERE, 'site', 'battered-site.json')])

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    html = matlib_pack.write_sidecar(SIDE, html, DIST, 'battered-port.tex.js', prune=False)
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
sys.exit(r.returncode if r else 0)
