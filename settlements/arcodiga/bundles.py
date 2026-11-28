#!/usr/bin/env python3
"""Read-in-place sealed kit & engine closures for settlements/arcodiga (Kōpa-Dīga / Arcodiga).

Seals each kit in its own lexical closure so its internal globals (MAT, KIT, DEFS, REG, TAU, clamp, terrainH, ...)
never clash across kits or with the settlement page:
  - kcity_bundle()              KCITY + KRATOR_KITS (core/city 10..40, core/kits, 42/53 multikit DataTexture2DArray)
  - hkk_bundle()                HKK (kits/hueru-kuran/src + core/engine + kits/resources, with live ATMOS wind hook)
  - etk_bundle()                ETK (kits/eternian/src + core/engine + kits/resources in official Eternal State dress)
  - anc_bundle()                ANC (kits/ancients/src + targets/arcodiga at yOffset = -95 m + asymmetric East Wing socket)
  - kcons_bundle()              KCONS (kits/construction)
  - ringsea_bundle()            RINGSEA (hkWhaleCat, arkChainedWard, vothJunk, salvageTug, vothBarge)
  - furn_and_interiors_bundle() KratorFurniture (ancient + eternian + hueru-kuran + scrap + generic) + KratorInteriors + KratorAncientsInteriors
  - peoples_fragment()          ADG_PEOPLES (eternian, cflit_qbon, talovolci, rustic_clansmen)
"""
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
NL = '\n'


def P(*parts):
    return os.path.normpath(os.path.join(ROOT, *parts))


def rd(path):
    with open(path, encoding='utf-8') as fh:
        return fh.read()


def rel(path):
    return os.path.relpath(path, ROOT).replace(os.sep, '/')


def safe(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def _load_mod(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


# ---------------------------------------------------------------- 1. KCITY + KRATOR_KITS
CITY_JS = [
    '10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js',
    '25-city-site.js', '31-city-steps-b.js', '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js',
    '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js',
]


def kcity_bundle():
    files = [P('core', 'city', f) for f in CITY_JS]
    body = ''
    for p in files:
        fn = os.path.basename(p)
        body += '/* ---- %s ---- */\n%s\n;\n' % (rel(p), rd(p))
        if fn == '10-city-core.js':
            body += 'globalThis.KCITY = KCITY;\n'
        elif fn == '10-core-kits.js':
            body += 'globalThis.KRATOR_KITS = window.KRATOR_KITS;\n'
    js = (
        '/* KCITY + KRATOR_KITS: core/city and core/kits sealed in one closure (settlements/arcodiga/bundles.py). */\n'
        'var KCITY = (function(window){\n' + body +
        'KCITY.kits = window.KRATOR_KITS;\n'
        'KCITY.lib = {\n'
        '  SL: SL, OCC: OCC, Raster: Raster, V: V,\n'
        '  obb: obb, obbCorners: obbCorners, inPoly: inPoly, offsetConvex: offsetConvex,\n'
        '  resample: resample, plLen: plLen, segDist: segDist, ryFacing: ryFacing,\n'
        '  polyArea: polyArea, polyCentroid: polyCentroid, plFrame: plFrame, polySegDist: polySegDist,\n'
        '  plan: function(){ return PLAN; }\n'
        '};\n'
        'return KCITY;\n})(Object.create(globalThis.window || globalThis));\n'
    )
    return safe(js), [rel(p) for p in files]


# ---------------------------------------------------------------- 2. HKK (kits/hueru-kuran)
HK_DIR = P('kits', 'hueru-kuran')
HK_SKIP = (
    '00-head.html', '39-hk-furn.js', '81-sky.js', '89-rows.js', '90-scene.js', '90z-hk-atmos.js',
    '91-probe.js', '91f-furnish.js', '91i-interiors.js', '91n-night.js', '91z-hk-world.js',
    '92-camera.js', '92-world.js', '93-anim.js', '99-host-take.js', '99-host-tz-hk.js', '99-tail.html',
)


def hkk_bundle():
    sys.path.insert(0, P('core', 'engine'))
    import engine as kengine
    fs = {f: p for f, p in kengine.paths().items() if f.endswith('.js') and f not in HK_SKIP}
    hk_src = os.path.join(HK_DIR, 'src')
    for f in os.listdir(hk_src):
        if f[0].isdigit() and f.endswith('.js') and f not in HK_SKIP:
            fs[f] = os.path.join(hk_src, f)
    for f in ('42r-res-ore.js', '44r-res-nodes.js'):
        fs[f] = P('kits', 'resources', 'src', f)
    ordered = [fs[k] for k in sorted(fs)]

    head = r'''
var HKK_ERRS = [], HKK_WIN = { addEventListener: function(){} };
var window = new Proxy(globalThis.window || globalThis, {
  get: function(t, k){
    if (Object.prototype.hasOwnProperty.call(HKK_WIN, k)) return HKK_WIN[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function(t, k, v){
    if (k === 'onerror') return true;
    HKK_WIN[k] = v;
    return true;
  }
});
var buildWorld = function(){ return null; }, WORLD = null;
var KWALK = undefined, KWALKBOX = undefined;
var SVF = { WEALTH: {}, missing: {}, placed: [] };
function svfNewBatch(){}
function FURNISH(){ return null; }
function FURNISH_HANG(){ return null; }
function FURNISH_WALL(){ return null; }
function svfH(key, v, dflt){ return dflt; }
var KratorFurniture = globalThis.KratorFurniture || { FURN_BY_KEY: {}, has: function(){ return false; }, entryDims: function(){ return { w: 1, d: 1, h: 1 }; }, setDetail: function(){} };
'''
    mid = ''.join('/* ---- %s ---- */\n%s\n;\n' % (rel(p), rd(p)) for p in ordered).replace('window.onerror=', 'var _hkkOnerror=')

    tail = r'''
reportErr = function(m){ HKK_ERRS.push(String(m).slice(0, 500)); if (typeof console !== 'undefined') console.warn('HKK: ' + m); };
(function(){
  if (typeof KMAT === 'undefined' || !KMAT.adapter) return;
  var recs = {};
  for (var k in MAT) {
    var fam = SV_LIB[k], L = fam && KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, fam) : null;
    var tl = TILE[k] == null ? 1 : TILE[k];
    recs[k] = {
      id: KIT.pack + '.' + k, family: k, scale: [tl, tl], tint: true,
      roughness: MAT[k].roughness === undefined ? 1 : MAT[k].roughness,
      metal: MAT[k].metalness == null ? 0 : MAT[k].metalness,
      specular: L ? L.specular : 0.5, breakup: L ? (L.breakup || null) : null, lib: L ? L.lib : null,
      doubleSided: MAT[k].side === THREE.DoubleSide,
      hook: [SV_CLOTH[k] ? 'cloth-flutter' : null, SV_CUT[k] ? 'cut-away' : null, k === 'glow' ? 'unlit flicker' : null].filter(Boolean).join('+') || null
    };
  }
  KMAT.adapter(KIT.pack, recs);
})();
if (MAT.room && MAT.basalt && MAT.basalt.map && !MAT.room.map) {
  MAT.room.map = MAT.basalt.map; MAT.room.normalMap = MAT.basalt.normalMap; MAT.room.roughnessMap = MAT.basalt.roughnessMap;
}
function hkkFixtures(rec){
  var f = { doors: [], windows: [], lamps: [], stills: [], river: null };
  var r3 = function(v){ return +v.toFixed(3); };
  (function walk(r){
    if (!r) return;
    (r.doors || []).forEach(function(q){ f.doors.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h == null ? 2.1 : q.h, part: r.key }); });
    (r.windows || []).forEach(function(q){ f.windows.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h, sill: q.sill, part: r.key }); });
    if (r.stills && r.stills.length) f.stills = f.stills.concat(r.stills);
    if (r.river && !f.river) f.river = r.river;
    (r.children || []).forEach(walk);
  })(rec);
  HALOS.forEach(function(H){ f.lamps.push({ x: r3(H.x), y: r3(H.y), z: r3(H.z), colour: [+H.r.toFixed(3), +H.g.toFixed(3), +H.b.toFixed(3)], big: !!H.big }); });
  return f;
}
function hkkProto(key, v){
  var d = DEFS[key]; if (!d) return null;
  var G = new THREE.Group(); G.name = key + '#' + (v | 0);
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  if (typeof svOpenReset === 'function') svOpenReset();
  var dry = PLACE_DRY; PLACE_DRY = 1; var rec = null;
  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0 }); } finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false);
  if (typeof svOpenFlush === 'function') svOpenFlush(G);
  G.userData = {
    key: key, v: v | 0, tris: Math.round(GSTAT.tris),
    w: d.w, d: d.d, h: d.h, doorH: HK.DOOR_H,
    doors: rec ? rec.doorCount : 0, fixtures: hkkFixtures(rec)
  };
  return G;
}
function hkkDims(){
  var out = {};
  for (var k in DEFS) {
    var d = DEFS[k];
    if (d.cls !== 'building' && d.kind !== 'res-node') continue;
    out[k] = {
      cls: d.cls, name: d.name, kind: d.kind || null,
      w: d.w, d: d.d, h: d.h, fw: +(d.w * 0.92).toFixed(2), fd: +(d.d * 0.92).toFixed(2),
      style: (d.tags && d.tags.style) || null,
      wealth: (d.tags && d.tags.wealth) || null,
      types: (d.tags && d.tags.types) || [],
      role: (d.tags && d.tags.role) || null,
      job: (d.tags && d.tags.job) || null,
      doorH: HK.DOOR_H, cut: !!d.cut, variants: 2
    };
  }
  return out;
}
function hkkBindWind(ATMOS_MOD, KHOOK_MOD){
  if (!ATMOS_MOD || !ATMOS_MOD.U || !KHOOK_MOD) return 0;
  var HK_WIND_GLSL = [
    '{float hkPin=length(aFlut);',
    'if(hkPin>1e-5){',
    '#ifdef USE_INSTANCING',
    ' vec3 hkWPos=(modelMatrix*instanceMatrix*vec4(position,1.0)).xyz;',
    '#else',
    ' vec3 hkWPos=(modelMatrix*vec4(position,1.0)).xyz;',
    '#endif',
    ' vec2 hkFw=atmWind(uAtmTime,hkWPos.xz,uAtmWind,uAtmGust);',
    ' float hkWMag=length(hkFw);',
    ' vec2 hkWDir=hkWMag>1e-4?hkFw/hkWMag:vec2(1.0,0.0);',
    ' float hkPh1=dot(hkWPos.xz,hkWDir)*2.3-uAtmTime*(2.6+0.55*hkWMag)+hkWPos.y*1.6;',
    ' float hkPh2=dot(hkWPos,vec3(1.15,1.85,1.25))*2.0-uAtmTime*(4.1+0.45*hkWMag);',
    ' float hkWave=0.65*sin(hkPh1)+0.35*sin(hkPh2);',
    ' vec3 hkDrift=vec3(hkFw.x*0.26,0.05*hkWMag*(0.5+0.5*sin(hkPh1)),hkFw.y*0.26)*hkPin;',
    ' vec3 hkRip=aFlut*hkWave*(0.34+0.44*hkWMag)+vec3(hkWDir.x,0.1,hkWDir.y)*(hkPin*0.16*sin(hkPh1));',
    ' transformed+=hkDrift+hkRip;',
    '}}'
  ].join('\n');
  var count = 0;
  for (var k in SV_CLOTH) {
    var m = MAT[k]; if (!m) continue;
    if (m.userData && Array.isArray(m.userData.hooks)) {
      m.userData.hooks = m.userData.hooks.filter(function(h){ return h.key !== 'flut' && h.key !== 'flut-atmos-hk'; });
      var ck = m.userData.hooks.map(function(h){ return h.key; }).join('|');
      m.customProgramCacheKey = (function(base){ return function(){ return base; }; })(ck);
    }
    KHOOK_MOD.add(m, 'flut-atmos-hk', function(sh){
      sh.uniforms.uAtmTime = ATMOS_MOD.U.time;
      sh.uniforms.uAtmWind = ATMOS_MOD.U.wind;
      sh.uniforms.uAtmGust = ATMOS_MOD.U.gustAmp;
      sh.vertexShader = 'uniform float uAtmTime;\nuniform vec2 uAtmWind;\nuniform float uAtmGust;\nattribute vec3 aFlut;\n' + ATMOS_MOD.GLSL_WIND + '\n' + sh.vertexShader;
      KHOOK_MOD.v(sh, '#include <begin_vertex>', '#include <begin_vertex>\n' + HK_WIND_GLSL, 'flut-atmos-hk');
    });
    m.needsUpdate = true;
    count++;
  }
  return count;
}
globalThis.hkRigMath = hkRigMath;
return {
  id: 'hueru-kuran', name: KIT.title, culture: 'hueru-kuran', pack: KIT.pack,
  proto: hkkProto, dims: hkkDims, DEFS: DEFS, MAT: MAT, KIT: KIT,
  trades: HK_TRADES, rigMath: hkRigMath, bindWind: hkkBindWind, errors: HKK_ERRS
};
'''
    js = '/* HKK: kits/hueru-kuran + core/engine sealed in one closure (settlements/arcodiga/bundles.py). */\nvar HKK = (function(){\n' + head + mid + tail + '\n})();\n'
    return safe(js), [rel(p) for p in ordered]


# ---------------------------------------------------------------- 3. ETK (kits/eternian — Official Eternal State Frontier Dress)
ET_DIR = P('kits', 'eternian')
ET_SKIP = (
    '00-head.html', '45-et-samples.js', '81-sky.js', '89-rows.js', '90-scene.js', '91-probe.js',
    '91c-et-clock.js', '91d-et-water.js', '91f-furnish.js', '91i-interiors.js',
    '91n-night.js', '92-camera.js', '92-world.js', '93-anim.js', '93e-et-export.js',
    '99-host-take.js', '99-tail.html',
)


def etk_bundle():
    sys.path.insert(0, P('core', 'engine'))
    import engine as kengine
    fs = {f: p for f, p in kengine.paths().items() if f.endswith('.js') and f not in ET_SKIP}
    et_src = os.path.join(ET_DIR, 'src')
    for f in os.listdir(et_src):
        if f[0].isdigit() and f.endswith('.js') and f not in ET_SKIP:
            fs[f] = os.path.join(et_src, f)
    for f in ('42r-res-ore.js', '44r-res-nodes.js'):
        fs[f] = P('kits', 'resources', 'src', f)
    ordered = [fs[k] for k in sorted(fs)]

    head = r'''
var ETK_ERRS = [], ETK_WIN = { addEventListener: function(){} };
var window = new Proxy(globalThis.window || globalThis, {
  get: function(t, k){
    if (Object.prototype.hasOwnProperty.call(ETK_WIN, k)) return ETK_WIN[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function(t, k, v){
    if (k === 'onerror') return true;
    ETK_WIN[k] = v;
    return true;
  }
});
var buildWorld = function(){ return null; }, WORLD = null;
var KWALK = undefined, KWALKBOX = undefined;
var SVF = { WEALTH: {}, missing: {}, placed: [] };
function svfNewBatch(){}
function FURNISH(){ return null; }
function FURNISH_HANG(){ return null; }
function FURNISH_WALL(){ return null; }
function svfH(key, v, dflt){ return dflt; }
var KratorFurniture = globalThis.KratorFurniture || { FURN_BY_KEY: {}, has: function(){ return false; }, entryDims: function(){ return { w: 1, d: 1, h: 1 }; }, setDetail: function(){} };
'''
    mid = ''.join('/* ---- %s ---- */\n%s\n;\n' % (rel(p), rd(p)) for p in ordered).replace('window.onerror=', 'var _etkOnerror=')

    tail = r'''
reportErr = function(m){ ETK_ERRS.push(String(m).slice(0, 500)); if (typeof console !== 'undefined') console.warn('ETK: ' + m); };
/* Official Eternal State Frontier Superintendency Dress (Dī-Gā Wài-Sī):
   - Closed-eyed household & civic ancestor masks and heads STAY INTACT (contrasting directly with Bè-tõ-pò Exiles!).
   - Frontier superintendency rank substitutes bronze/silver for Sanctum-exclusive True Heirs gold on outer fort/houses. */
var ETK_HEADS = [];
if (typeof etNote === 'function') {
  var _etNoteBase = etNote;
  etNote = function(rec){
    if (rec) ETK_HEADS.push(rec);
    return _etNoteBase(rec);
  };
}
if (typeof etHead === 'function') {
  var _etHeadBase = etHead;
  etHead = function(x, y, z, h, o){
    var o2 = Object.assign({}, o || {});
    if (o2.metal === 'gold') o2.metal = 'bronze';
    if (o2.eyes === 'open') o2.eyes = 'closed';
    return _etHeadBase(x, y, z, h, o2);
  };
}
if (typeof etFigure === 'function') {
  var _etFigureBase = etFigure;
  etFigure = function(x, y, z, h, o){
    var o2 = Object.assign({}, o || {});
    if (o2.metal === 'gold') o2.metal = 'bronze';
    if (o2.eyes === 'open') o2.eyes = 'closed';
    return _etFigureBase(x, y, z, h, o2);
  };
}
(function(){
  if (typeof KMAT === 'undefined' || !KMAT.adapter) return;
  var recs = {};
  for (var k in MAT) {
    var fam = SV_LIB[k], L = fam && KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, fam) : null;
    var tl = TILE[k] == null ? 1 : TILE[k];
    recs[k] = {
      id: KIT.pack + '.' + k, family: k, scale: [tl, tl], tint: true,
      roughness: MAT[k].roughness === undefined ? 1 : MAT[k].roughness,
      metal: MAT[k].metalness == null ? 0 : MAT[k].metalness,
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
    (r.doors || []).forEach(function(q){ f.doors.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h == null ? 2.2 : q.h, part: r.key }); });
    (r.windows || []).forEach(function(q){ f.windows.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h, sill: q.sill, part: r.key }); });
    (r.children || []).forEach(walk);
  })(rec);
  HALOS.forEach(function(H){ f.lamps.push({ x: r3(H.x), y: r3(H.y), z: r3(H.z), colour: [+H.r.toFixed(3), +H.g.toFixed(3), +H.b.toFixed(3)], big: !!H.big }); });
  return f;
}
function etkProto(key, v){
  var d = DEFS[key]; if (!d) return null;
  var G = new THREE.Group(); G.name = key + '#' + (v | 0);
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  if (typeof svOpenReset === 'function') svOpenReset();
  var dry = PLACE_DRY; PLACE_DRY = 1; var rec = null;
  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0 }); } finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false);
  if (typeof svOpenFlush === 'function') svOpenFlush(G);
  G.userData = {
    key: key, v: v | 0, tris: Math.round(GSTAT.tris),
    w: d.w, d: d.d, h: d.h, doorH: 2.2,
    heads: (rec && rec.heads) ? rec.heads.slice() : [],
    clock: (rec && rec.clock) ? rec.clock : null,
    fixtures: etkFixtures(rec)
  };
  return G;
}
function etkDims(){
  var raw = etDims(DEFS, typeof FAMILIES !== 'undefined' ? FAMILIES : []);
  var out = {};
  for (var k in raw) {
    var r = raw[k];
    out[k] = Object.assign({}, r, {
      name: DEFS[k] ? DEFS[k].name : k,
      fw: +(r.w * 0.92).toFixed(2),
      fd: +(r.d * 0.92).toFixed(2),
      doorH: 2.2,
      variants: 2
    });
  }
  return out;
}
/* Build a standalone Eternian Bronze Ancestor-Lintel Bulkhead Group (for sealing Arcodiga East Wing at x = +38 m) */
function etkCivicBulkhead(totalW, totalH, doorW, doorH){
  var G = new THREE.Group(); G.name = 'et_ancestor_lintel_bulkhead';
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  if (typeof svOpenReset === 'function') svOpenReset();
  var rec = { key: 'et_bulkhead', heads: [], doors: [], windows: [], children: [] };
  REG.push(rec);
  CUR = rec;
  try {
    var sd = P('stoneD'), br = P('bronze'), sideW = Math.max(1.2, (totalW - doorW) * 0.5);
    box('stone', -(doorW * 0.5 + sideW * 0.5), 0, 0, sideW, totalH, 1.8, sd);
    box('stone',  (doorW * 0.5 + sideW * 0.5), 0, 0, sideW, totalH, 1.8, sd);
    box('stone', 0, doorH, 0, doorW + 0.4, Math.max(1.2, totalH - doorH), 1.8, sd);
    box('bronze', 0, totalH - 0.65, 0.95, totalW * 0.92, 0.36, 0.24, br);
    etCivicDoor(0, 0.9, doorW, doorH, { metal: 'bronze', hollow: false });
    etHead(0, doorH + 1.4, 1.05, 1.65, { metal: 'bronze' });
  } finally { CUR = null; }
  flushBuckets(GB, G, false);
  if (typeof svOpenFlush === 'function') svOpenFlush(G);
  G.userData = { heads: rec.heads.slice() };
  return G;
}
/* Build animated bronze clock hands & ancestor parade figures for a placed et_clock landmark */
function etkBuildClockRig(clockSpec){
  if (!clockSpec) return null;
  var grp = new THREE.Group(); grp.name = 'et_tsunami_tide_clock_rig';
  function cMat(metal){
    var k = ET_METALS[metal] || 'bronze', src = MAT[k];
    return new THREE.MeshStandardMaterial({ vertexColors: true, map: (src && src.map) || null, metalness: src ? src.metalness : 0.6, roughness: src ? src.roughness : 0.38 });
  }
  function cGeo(G0, col){
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(G0.pos, 3));
    if (G0.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(G0.uv, 2));
    g.computeVertexNormals();
    var n = G0.pos.length / 3, c = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    return g;
  }
  var figs = clockSpec.figures.map(function(f){
    var mMat = f.metal === 'gold' ? 'bronze' : f.metal;
    var m = new THREE.Mesh(cGeo(etFigureGeo({ pose: 'stand', seed: f.seed }), etMetalCol(mMat)), cMat(mMat));
    m.scale.setScalar(clockSpec.figureH);
    m.userData.probeSkip = true;
    grp.add(m);
    return m;
  });
  var piv = new THREE.Object3D(), N = new THREE.Vector3().fromArray(clockSpec.normal);
  piv.position.fromArray(clockSpec.dial);
  piv.lookAt(piv.position.clone().add(N));
  grp.add(piv);
  function makeHand(len, w){
    var g = new THREE.BoxGeometry(w, len, 0.06).translate(0, len * 0.5 - 0.15, 0.06);
    var cnt = g.attributes.position.count, c = new Float32Array(cnt * 3).fill(1);
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    var m = new THREE.Mesh(g, cMat('bronze'));
    m.userData.probeSkip = true;
    piv.add(m);
    return m;
  }
  var T = clockSpec.track.map(function(p){ return new THREE.Vector3().fromArray(p); });
  var L = [0];
  for (var i = 1; i < T.length; i++) L.push(L[i - 1] + T[i].distanceTo(T[i - 1]));
  var hourHand = makeHand(clockSpec.radius * 0.55, 0.16);
  var minHand = makeHand(clockSpec.radius * 0.82, 0.10);
  function update(tSec, hourVal, alarmActive){
    var period = alarmActive ? 18 : clockSpec.period;
    var ph = tSec % period;
    for (var fi = 0; fi < figs.length; fi++) {
      var m = figs[fi];
      var u = (ph - fi * (alarmActive ? 1.1 : 2.4)) / (alarmActive ? 9 : 18);
      var s = Math.max(0, Math.min(1, u)) * L[L.length - 1];
      var idx = 1;
      while (idx < L.length - 1 && L[idx] < s) idx++;
      var frac = (s - L[idx - 1]) / Math.max(1e-6, L[idx] - L[idx - 1]);
      m.position.lerpVectors(T[idx - 1], T[idx], frac);
      m.rotation.y = Math.atan2(T[idx].x - T[idx - 1].x, T[idx].z - T[idx - 1].z);
      m.visible = u > -0.02 && u < 1.02;
    }
    hourHand.rotation.z = -(hourVal % 12) / 12 * TAU;
    minHand.rotation.z = alarmActive ? -(tSec * 0.35 % 1) * TAU : -(hourVal % 1) * TAU;
  }
  return { group: grp, update: update };
}
function etkBindWind(ATMOS_MOD, KHOOK_MOD){
  if (!ATMOS_MOD || !ATMOS_MOD.U || !KHOOK_MOD || typeof SV_CLOTH === 'undefined') return 0;
  var count = 0;
  for (var k in SV_CLOTH) {
    var m = MAT[k]; if (!m) continue;
    if (m.userData && Array.isArray(m.userData.hooks)) {
      m.userData.hooks = m.userData.hooks.filter(function(h){ return h.key !== 'flut' && h.key !== 'flut-atmos-et'; });
    }
    KHOOK_MOD.add(m, 'flut-atmos-et', function(sh){
      sh.uniforms.uAtmTime = ATMOS_MOD.U.time;
      sh.uniforms.uAtmWind = ATMOS_MOD.U.wind;
      sh.vertexShader = 'uniform float uAtmTime;\nuniform vec2 uAtmWind;\nattribute vec3 aFlut;\n' + sh.vertexShader;
      KHOOK_MOD.v(sh, '#include <begin_vertex>', '#include <begin_vertex>\n{float etP=length(aFlut);if(etP>1e-5){transformed+=aFlut*(0.24*sin(uAtmTime*3.1+position.y*1.8));}}', 'flut-atmos-et');
    });
    m.needsUpdate = true;
    count++;
  }
  return count;
}
return {
  id: 'eternian', name: KIT.title, culture: 'eternian', pack: KIT.pack,
  proto: etkProto, dims: etkDims, DEFS: DEFS, MAT: MAT, KIT: KIT,
  trades: ET_TRADES, civicBulkhead: etkCivicBulkhead, buildClockRig: etkBuildClockRig,
  bindWind: etkBindWind, heads: ETK_HEADS, errors: ETK_ERRS
};
'''
    js = '/* ETK: kits/eternian + core/engine sealed in Official Eternal State Frontier Dress (settlements/arcodiga/bundles.py). */\nvar ETK = (function(){\n' + head + mid + tail + '\n})();\n'
    return safe(js), [rel(p) for p in ordered]


# ---------------------------------------------------------------- 4. ANC (kits/ancients + targets/arcodiga read in place)
def anc_bundle():
    files = [
        P('core', 'lod', '09-lod.js'),
        P('kits', 'ancients', 'src', '10-core.js'),
        P('kits', 'ancients', 'src', '12-stats.js'),
        P('core', 'materials', '20-textures.js'),
        P('core', 'materials', '22-materials.js'),
        P('kits', 'ancients', 'src', '30-kit.js'),
        P('kits', 'ancients', 'src', '32-surfaces.js'),
        P('kits', 'ancients', 'src', '34-kitdefs.js'),
        P('kits', 'ancients', 'src', '36-decor.js'),
        P('kits', 'ancients', 'src', '38-helpers2.js'),
        P('kits', 'ancients', 'src', '50-registry.js'),
        P('kits', 'ancients', 'src', '54-mat-concrete.js'),
        P('core', 'materials', '68-mat-v5.js'),
        P('kits', 'ancients', 'src', '69-mat-salvage.js'),
        P('core', 'materials', 'opt', '69a-world-uv.js'),
        P('kits', 'ancients', 'src', '69w-worn.js'),
        P('kits', 'ancients', 'targets', 'arcodiga', '8av0-arcodiga-plan.js'),
        P('kits', 'ancients', 'targets', 'arcodiga', '8av1-arcodiga-interiors.js'),
        P('kits', 'ancients', 'targets', 'arcodiga', '8av2-arcodiga-water.js'),
        P('kits', 'ancients', 'targets', 'arcodiga', '8av2b-arcodiga-parts.js'),
        P('kits', 'ancients', 'targets', 'arcodiga', '8av3-arcodiga-draw.js'),
        P('kits', 'ancients', 'src', '88y-ancients-matlib.js'),
        P('kits', 'ancients', 'src', '8zo-anc-open.js'),
        P('kits', 'ancients', 'src', '8zz-interiors.js'),
    ]

    head = r'''
var ANC_ERRS = [], _ANC_WPROXY = { ANC_OPEN_GUEST: true, addEventListener: function(){} };
var window = new Proxy(globalThis.window || globalThis, {
  get: function(t, k){
    if (Object.prototype.hasOwnProperty.call(_ANC_WPROXY, k)) return _ANC_WPROXY[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function(t, k, v){
    if (k === 'onerror') return true;
    _ANC_WPROXY[k] = v;
    return true;
  }
});
var scene = new THREE.Group();
var camera = { position: new THREE.Vector3(0, 120, 420) };
var renderer = { capabilities: { getMaxAnisotropy: function(){ return 4; } } };
var NIGHT = false;
var CIV_FLOOR = new THREE.Color(0x3a3834);
function civDef(name, mk, mat){ if (!KIT.defs[name]) kdef(name, mk(), mat); return name; }
function aikClipAll(){}
'''
    mid_parts = []
    for p in files:
        fn = os.path.basename(p)
        txt = rd(p)
        if fn == '10-core.js':
            txt = txt.replace("const ERRS=document.getElementById('errs');", "const ERRS={style:{},textContent:''};")
            txt = txt.replace("window.onerror=", "var _ancOnerror=")
        mid_parts.append('/* ---- %s ---- */\n%s\n;\n' % (rel(p), txt))
    mid = ''.join(mid_parts)

    tail = r'''
reportErr = function(m){ ANC_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.warn('ANC: ' + m); };
globalThis.ARCODIGA = ARCODIGA;
globalThis.ADG_INTERIORS = ADG_INTERIORS;

/* Build Arcodiga at yOffset = -95.0 m across the Kopa-North gorge-throat (d = 1 exterior breach + selective East Wing 'eternian' socket) */
function buildAt(hostScene, opts){
  opts = opts || {};
  var yOff = opts.yOffset == null ? -95.0 : +opts.yOffset;
  var gx = opts.gx == null ? 0 : +opts.gx;
  var gz = opts.gz == null ? 0 : +opts.gz;
  var hostGround = opts.ground || function(){ return -65.0; };
  var eastPred = opts.isReclaimedUnit || function(u){
    return (u.area === 'wing' && u.x0 >= 30) || (u.area === 'ribs' && u.x0 >= 35 && u.y0 >= 150);
  };

  if (globalThis.camera) camera = globalThis.camera;
  if (globalThis.renderer) renderer = globalThis.renderer;

  var ancRoot = new THREE.Group();
  ancRoot.name = 'arcodiga_megastructure_root';
  ancRoot.position.set(0, yOff, 0);
  hostScene.add(ancRoot);
  scene = ancRoot;

  var pageTags = opts.tags || (typeof KTAGS !== 'undefined' && KTAGS.page ? KTAGS.page : null);
  var tagCountBefore = (pageTags && pageTags.list) ? pageTags.list.length : 0;
  var doorCountBefore = (typeof KDOOR !== 'undefined' && KDOOR.list) ? KDOOR.list.length : 0;

  if (typeof KratorAncientsInteriors !== 'undefined' && typeof KratorInteriors !== 'undefined') {
    var AI = KratorAncientsInteriors;
    if (AI.DRESS && !AI.DRESS.eternian) {
      AI.DRESS.eternian = Object.assign({}, AI.DRESS.occupied, ADG_INTERIORS.DRESS_REFURB);
    }
    AI.KIT.arcodiga = ADG_INTERIORS.entry(AI, { culture: 'eternian' });
    if (!AIK.T && pageTags) {
      AIK.on = true;
      AI.IX = KratorInteriors;
      AI.install(KratorInteriors);
      AIK.T = pageTags;
      AIK.F = KFURN.create({
        catalog: KFURN.catalogOf(globalThis.KratorFurniture),
        interiors: KratorInteriors,
        on: true,
        tags: AIK.T,
        seed: function(o, ctx, R, x, y, z){
          return ((Math.round(x * 10) * 73856093) ^ (Math.round(z * 10) * 19349663) ^ (Math.round(y * 10) * 83492791)) >>> 0;
        },
        draw: null
      });
      AIK.adapter = KratorInteriors.runtimeAdapter(globalThis.KratorFurniture, globalThis.KratorFurniture.batch({ indexed: true }));
    }
  }

  var mark = typeof interiorBegin === 'function' ? interiorBegin('arcodiga', 1, gx, gz) : null;
  var G_ARCH = buildArcodiga(ancRoot, gx, gz, 1, {
    noTerrain: true,
    noWater: true,
    ground: function(wx, wz){ return hostGround(wx, wz) - yOff; }
  });

  /* Add sealed alloy bulkhead gates on dormant ribs & warm Eternian lighting along reclaimed East Stiffening Wing (x >= +44 m) */
  KOFF = [gx, 0, gz];
  var P0 = ARCODIGA.plan({ seed: 12700 });
  for (var ri = 0; ri < P0.ribs.length; ri++) {
    var rb = P0.ribs[ri];
    var isEastReclaimed = rb.side > 0 && rb.j <= 2;
    if (!isEastReclaimed) {
      var topY = ARCODIGA.inNotch(rb.x, P0.dim.H - 12) ? Math.min(rb.y1, P0.dim.NOTCH.sill - 8) : rb.y1;
      var bys = [200, topY - 14];
      for (var bi = 0; bi < bys.length; bi++) {
        var by = bys[bi];
        if (by < rb.y0 + 10) continue;
        var zThroat = ARCODIGA.zDs(rb.x, by) + 4;
        kput('boxD', [rb.x + rb.nx * 4, by, zThroat], qFacing([rb.nx, 0, rb.nz]), [rb.w + 3, 10, 4.5], null);
        kput('patchPlate', [rb.x + rb.nx * 6.5, by, zThroat + rb.nz * 2.4], qFacing([rb.nx, 0, rb.nz]), [rb.w * 0.7, 7.5, 1], null);
      }
    } else {
      for (var wy = 180; wy < rb.y1 - 12; wy += 24) {
        var pj = ARCODIGA.lerp(rb.proj0, rb.proj1, (wy - rb.y0) / Math.max(1, rb.y1 - rb.y0));
        var zB = ARCODIGA.zDs(rb.x, wy);
        kput('cell', [rb.x + rb.nz * (rb.w * 0.5 + 0.35) + rb.nx * pj * 0.45, wy, zB - rb.nx * (rb.w * 0.5 + 0.35) + rb.nz * pj * 0.45],
          qFacing([rb.nz, 0, -rb.nx]), [11, 4.0, 1], WARM.clone().multiplyScalar(0.82));
      }
    }
  }
  /* Warm Eternian lantern-strips along the intact East Stiffening Wing highway deck (x = +56..+900 m, worldY = +81 m) */
  for (var xi = 2; xi <= 32; xi++) {
    var wx0 = xi * 28;
    var pr0 = ARCODIGA.wingProfile(wx0);
    kput('strip', [wx0, P0.dim.WING.yHwy + 5.2, pr0.zNose - 4.5], qEuler(0, Math.PI / 2, 0), [22, 0.9, 0.9], WARM);
    for (var rw = 0; rw < 2; rw++) {
      var wy2 = P0.dim.WING.yHwy + 16 + rw * 18;
      var zr2 = ARCODIGA.wingZAt(wx0, wy2);
      if (zr2 && ARCODIGA.u(12799, xi, rw, 1) < 0.76) {
        kput('cell', [wx0, wy2, zr2[1] - 0.8], qFacing([0, 0.25, 1]), [12, 3.6, 1], WARM.clone().multiplyScalar(0.8));
      }
    }
  }
  KOFF = [0, 0, 0];

  /* Asymmetric Interior Pass: furnish ONLY reclaimed East Wing & E1-E2 units in 'eternian' (d = 5 whole partitions + operable doors) */
  var eastSite = null;
  if (mark && typeof KratorAncientsInteriors !== 'undefined' && typeof interiorPass === 'function') {
    var AI2 = KratorAncientsInteriors;
    var origUnits = ADG_INTERIORS.units;
    var origFurnish = AI2.furnishPlan;
    try {
      ADG_INTERIORS.units = function(dVal){
        return origUnits(dVal).filter(eastPred);
      };
      AI2.KIT.arcodiga = ADG_INTERIORS.entry(AI2, { culture: 'eternian', furnish: true });
      AI2.furnishPlan = function(plan, adapter, fOpts){
        return origFurnish.call(AI2, plan, adapter, Object.assign({}, fOpts || {}, { culture: 'eternian', all: true, seed: 89604 }));
      };
      var c0 = G_ARCH.children.length;
      interiorPass({ k: 'arcodiga', d: 5, gx: gx, gz: gz, mark: mark.mark }, G_ARCH);
      for (var ci = c0; ci < G_ARCH.children.length; ci++) {
        if (G_ARCH.children[ci].isMesh) G_ARCH.children[ci].userData.interiorFloors = true;
      }
      eastSite = AIK.byId['arcodiga/5'] || null;
      if (eastSite) {
        eastSite.culture = 'eternian';
        if (eastSite.recs && eastSite.recs.length && typeof KratorFurniture !== 'undefined') {
          var heroB = KratorFurniture.batch({ indexed: true });
          var nHero = Math.min(180, eastSite.recs.length);
          for (var hi = 0; hi < nHero; hi++) {
            var hr = eastSite.recs[hi];
            heroB.place(hr.key, hr.x, hr.y, hr.z, hr.ry, { variant: hr.variant, seed: hr.seed, wealth: 0.65, building: hr.building, setting: 'indoor' });
          }
          var hg = heroB.flush(ancRoot);
          if (hg) hg.traverse(function(o){ if (o.isMesh) { KFURN.linearColours(o.geometry); o.userData.probeSkip = true; } });
          eastSite.group = hg;
        }
      }
    } finally {
      ADG_INTERIORS.units = origUnits;
      AI2.furnishPlan = origFurnish;
    }
  }

  /* Shift KDOOR records & anLeaf instances to exact worldY = localY + yOff, then bake ancRoot and reparent moving leaves to hostScene */
  if (typeof KDOOR !== 'undefined' && KDOOR.list) {
    for (var di = doorCountBefore; di < KDOOR.list.length; di++) {
      var D = KDOOR.list[di];
      if (D.at) D.at[1] = +(D.at[1] + yOff).toFixed(3);
      if (D.hinge) D.hinge[1] = +(D.hinge[1] + yOff).toFixed(3);
      if (D.p0) D.p0[1] = +(D.p0[1] + yOff).toFixed(3);
    }
  }
  ['anLeaf', 'anLeafG'].forEach(function(lnm){
    var arr = KIT.items[lnm];
    if (arr) {
      for (var li = 0; li < arr.length; li++) arr[li].p[1] += yOff;
    }
  });

  kbake(ancRoot);

  ['anLeaf', 'anLeafG'].forEach(function(lnm){
    var im = KIT.meshes[lnm];
    if (im) {
      ancRoot.remove(im);
      hostScene.add(im);
    }
  });
  ancHost();

  /* Shift Arcodiga KTAGS records to exact worldY = localY + yOff and tag Eternian East Wing vs Submerged Powerhouse vs Abandoned Ruin */
  if (pageTags && pageTags.list) {
    for (var ti = tagCountBefore; ti < pageTags.list.length; ti++) {
      var tr = pageTags.list[ti];
      if (tr && Array.isArray(tr.at)) {
        tr.at[1] = +(tr.at[1] + yOff).toFixed(2);
        var kStr = String(tr.key || tr.name || '');
        if (/wing\.learning|wing\.hub|rib\.e[12]\b|prow\.[23]\b|adg\.wing\.(lrn|hub\.east)|adg\.ribs\.(ribe1|prow2)/.test(kStr)) {
          tr.tags = Object.assign({}, tr.tags || {}, { culture: 'eternian', state: 'reclaimed' });
        } else if (tr.at[1] < -5.0 && /power|ind\.[we]/.test(kStr)) {
          tr.tags = Object.assign({}, tr.tags || {}, { culture: 'ancient', state: 'submerged' });
        }
      }
    }
  }

  var geoName = new Map();
  for (var nm in KIT.defs) geoName.set(KIT.defs[nm].geo, nm);

  return {
    root: ancRoot,
    arch: G_ARCH,
    yOffset: yOff,
    hull: ARCODIGA.HULL,
    geoName: geoName,
    eastSite: eastSite,
    aiStats: { furnished: AIK.furnished, pieces: AIK.pieces, rooms: eastSite ? eastSite.rooms : 0, leaves: AIK.leaves },
    tick: function(dt){ for (var i = 0; i < TICKS.length; i++) TICKS[i](dt); }
  };
}

return {
  ARCODIGA: ARCODIGA,
  ADG_INTERIORS: ADG_INTERIORS,
  MAT: MAT,
  KIT: KIT,
  buildAt: buildAt,
  errors: ANC_ERRS
};
'''
    js = '/* ANC: kits/ancients + targets/arcodiga read in place and sealed (settlements/arcodiga/bundles.py). */\nvar ANC = (function(){\n' + head + mid + tail + '\n})();\n'
    return safe(js), [rel(p) for p in files]


# ---------------------------------------------------------------- 5. KCONS, RINGSEA, Furniture/Interiors & Peoples
def kcons_bundle():
    files = [P('kits', 'construction', 'src', '10-cons-site.js'), P('kits', 'construction', 'src', '20-cons-lib.js')]
    body = ''.join('/* ---- %s ---- */\n%s\n' % (rel(p), rd(p)) for p in files)
    return safe(body), [rel(p) for p in files]


VESSELS = [
    '89h-rs-hk-whaler.js',
    '89g-rs-ark-ward.js',
    '81-rs-voth-junk.js',
    '66-rs-salvage-tug.js',
    '85-rs-voth-barge.js',
]


def ringsea_bundle():
    rs_mod = _load_mod('adg_ringsea', P('settlements', 'voth', 'ringsea.py'))
    rs_mod.VESSELS = VESSELS
    frag = rs_mod.ringsea_fragment().replace('window.onerror=', 'var _rsOnerror=').replace('console.error("RINGSEA:', 'console.warn("RINGSEA:')
    srcs = [rel(os.path.join(rs_mod.RS_SRC, f)) for f in VESSELS] + ['settlements/voth/ringsea.py']
    return safe(frag), srcs


def furn_and_interiors_bundle():
    fb_mod = _load_mod('adg_fb', P('kits', 'catalog', 'furniture_bundle.py'))
    ib_mod = _load_mod('adg_ib', P('kits', 'interiors', 'kit_bundle.py'))
    ab_mod = _load_mod('adg_ab', P('kits', 'ancients-interiors', 'kit_bundle.py'))
    hk_furn = P('kits', 'hueru-kuran', 'src', '39-hk-furn.js')

    fb = fb_mod.bundle(['generic-goods', 'generic', 'scrap', 'eternian', 'post-apoc'], harvested=True)
    hk_f = '/* ---- %s ---- */\n%s\n' % (rel(hk_furn), rd(hk_furn))
    ib = ib_mod.bundle(['noahs-regret', 'eternian'])
    ab = ab_mod.bundle()
    srcs = [
        rel(hk_furn),
        'kits/interiors/sets/noahs-regret.js',
        'kits/interiors/sets/eternian.js',
    ]
    return safe(fb + '\n' + hk_f + '\n' + ib + '\n' + ab + '\n'), srcs


def peoples_fragment():
    pp = P('core', 'charactermodels', 'data', 'peoples.json')
    if not os.path.isfile(pp):
        return 'var ADG_PEOPLES = {};\n', []
    raw = json.loads(rd(pp)).get('peoples', [])
    want = {'eternian', 'cflit_qbon', 'talovolci', 'rustic_clansmen'}
    sub = {p['id']: p for p in raw if p.get('id') in want}
    return 'var ADG_PEOPLES = %s;\n' % json.dumps(sub, separators=(',', ':'), ensure_ascii=False), [rel(pp)]
