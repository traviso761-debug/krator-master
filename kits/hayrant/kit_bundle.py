#!/usr/bin/env python3
"""The Hayrant Vassal Kit of the Western Outer Wall for another world's page (Mirabilis, Sheritu, Circuit E6,
Ukor-Tera pass), READ IN PLACE and sealed in one closure (as kits/molu-che/kit_bundle.py seals MCK and
kits/kulanewa/kit_bundle.py seals KLK), so its globals (MAT, KIT, DEFS, REG, TAU, clamp, terrainH, ...) meet neither
the page's nor another kit's:

    bundle(key='HYK') -> (js, files)   var HYK = (function(){ ... })(): core/engine's geometry & building registry,
                                       Stage 5 KMAT_M1, the Hayrant vertical-stack shader hooks, Eternian suzerain
                                       head/statue/roof helpers, Hayrant nuraghe/loess/cruck & Kanopi formline/totem
                                       toolkits, all 52 hy_* building defs, and HY_TRADES.

    HYK.proto(key, v)   the def built once at the origin (y=0, front +z) into a new THREE.Group, its material buckets
                        flushed, userData = {key, v, tris, w, d, h, style, doors, fixtures}; null for an unknown key
    HYK.dims()          {key: {cls, name, w, d, h, fw, fd, style, wealth, types, role, job, resSource, cut, variants}} for all 52 defs
    HYK.trades          HY_TRADES (all 44 Voth census trades mapped to hy_* keys)
    HYK.tradeDefs(st)   {trade: [keys...]} optionally filtered by style ('bench' | 'hybrid' | 'prefect' | 'sanctuary')
    HYK.seats           HY_SEATS (Mirabilis, Sheritu, Ukor-Tera Divide Pass)
    HYK.rigMath         hyRigMath
    HYK.errors          the kit's reportErr messages
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
ET_SRC = os.path.join(ROOT, 'kits', 'eternian', 'src')
NL = '\n'

SKIP = (
    '00-head.html', '39-hy-furn.js', '70-hy-street.js', '89-rows.js',
    '81-sky.js', '90-scene.js', '90z-hy-atmos.js', '91-probe.js',
    '91f-furnish.js', '91i-interiors.js', '91n-night.js', '91z-hy-world.js',
    '92-camera.js', '92-world.js', '93-anim.js', '99-host-take.js', '99-host-tz-hy.js', '99-tail.html'
)

ET_HELPERS = (
    '38-et-alt.js', '40-et-kit.js', '41-et-profile.js', '42-et-head.js',
    '43-et-statue.js', '44-et-roof.js', '46-et-civic-kit.js'
)


def files():
    sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
    import engine as kengine
    fs = {f: p for f, p in kengine.paths().items() if f.endswith('.js') and f not in SKIP}
    fs['27-matlib-m1.js'] = os.path.join(ROOT, 'core', 'materials', 'record', '27-matlib-m1.js')
    for f in ET_HELPERS:
        fs[f] = os.path.join(ET_SRC, f)
    for f in os.listdir(SRC):
        if f[0].isdigit() and f.endswith('.js') and f not in SKIP:
            fs[f] = os.path.join(SRC, f)
    return [fs[f] for f in sorted(fs)]


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def rd(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """Inline text may hold no literal script tag, not even in a comment."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


HEAD = r'''
var HYK_ERRS = [], HYK_WIN = { addEventListener: function () {} };
var window = new Proxy(globalThis.window || globalThis, {
  get: function (t, k) {
    if (Object.prototype.hasOwnProperty.call(HYK_WIN, k)) return HYK_WIN[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function (t, k, v) {
    if (k === 'onerror') return true;
    HYK_WIN[k] = v;
    return true;
  }
});
var document = globalThis.document || { getElementById: function () { return null; } };
var location = globalThis.location || { search: '', hash: '' };
var buildWorld = function () { return null; }, WORLD = null;
var KWALK = undefined, KWALKBOX = undefined;
var SVF = { WEALTH: {}, missing: {}, placed: [] };
function svfNewBatch() {}
function FURNISH() { return null; }
function FURNISH_HANG() { return null; }
function svfH(key, v, dflt) { return dflt; }
var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, setDetail: function () {} };
'''

TAIL = r'''
reportErr = function (m) { HYK_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.error('HYK: ' + m); };
(function () {
  if (typeof KMAT === 'undefined' || !KMAT.adapter) return;
  var recs = {};
  for (var k in MAT) {
    var fam = SV_LIB[k], L = fam && KMAT.mode === 'lib' ? KMAT.packed(KIT.pack, fam) : null;
    var tl = TILE[k] == null ? 1 : TILE[k];
    var sp = L && L.specular != null ? L.specular : 0.5;
    recs[k] = {
      id: KIT.pack + '.' + k, family: k, scale: [tl, tl], tint: true,
      roughness: MAT[k].roughness === undefined ? 1 : MAT[k].roughness, metal: MAT[k].metalness == null ? 0 : MAT[k].metalness,
      specular: sp, breakup: L ? (L.breakup || null) : null, lib: L ? L.lib : null,
      doubleSided: MAT[k].side === THREE.DoubleSide,
      hook: [SV_CLOTH[k] ? 'cloth-flutter' : null, SV_CUT[k] ? 'cut-away' : null, k === 'glow' ? 'unlit flicker' : null].filter(Boolean).join('+') || null,
      note: L ? 'library set, tint keep ' + L.tint : 'vertex colour only'
    };
  }
  KMAT.adapter(KIT.pack, recs);
})();

function hykFixtures(rec) {
  var f = { doors: [], windows: [], lamps: [] }, r3 = function (v) { return +v.toFixed(3); };
  (function walk(r) {
    if (!r) return;
    (r.doors || []).forEach(function (q) { f.doors.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h || null, part: r.key }); });
    (r.windows || []).forEach(function (q) { f.windows.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h, sill: q.sill, part: r.key }); });
    (r.children || []).forEach(walk);
  })(rec);
  HALOS.forEach(function (H) { f.lamps.push({ x: r3(H.x), y: r3(H.y), z: r3(H.z), colour: [+H.r.toFixed(3), +H.g.toFixed(3), +H.b.toFixed(3)], big: !!H.big }); });
  return f;
}

function hykProto(key, v) {
  var d = DEFS[key];
  if (!d) return null;
  var G = new THREE.Group();
  G.name = key + '#' + (v | 0);
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  svOpenReset();
  var dry = PLACE_DRY; PLACE_DRY = 1; var rec = null;
  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0 }); }
  finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false);
  svOpenFlush(G);
  G.userData = {
    key: key, v: v | 0, tris: Math.round(GSTAT.tris),
    w: d.w, d: d.d, h: d.h, style: d.tags && d.tags.style || null,
    doors: rec ? rec.doorCount : 0, fixtures: hykFixtures(rec)
  };
  return G;
}

function hykDims() {
  var out = {};
  for (var k in DEFS) {
    var d = DEFS[k];
    if (d.cls !== 'building') continue;
    out[k] = {
      cls: d.cls, name: d.name, w: d.w, d: d.d, h: d.h, fw: d.w * 0.92, fd: d.d * 0.92,
      style: d.tags.style || null, wealth: d.tags.wealth || null,
      types: d.tags.types || null, role: d.tags.role || null, job: d.tags.job || null,
      resSource: d.resSource || null, cut: !!d.cut, variants: 1
    };
  }
  return out;
}

function hykTradeDefs(style) {
  var out = {};
  for (var i = 0; i < HY_TRADES.length; i++) {
    var row = HY_TRADES[i];
    if (row.na) continue;
    var ks = (row.keys || []).filter(function (k) {
      return DEFS[k] && (!style || (DEFS[k].tags && DEFS[k].tags.style === style));
    });
    if (ks.length) out[row.trade] = ks;
  }
  return out;
}

return {
  proto: hykProto, dims: hykDims, DEFS: DEFS, MAT: MAT, KIT: KIT,
  trades: HY_TRADES, tradeDefs: hykTradeDefs, seats: HY_SEATS, rigMath: hyRigMath,
  errors: HYK_ERRS, ANIMU: ANIMU, FRAME_HOOKS: FRAME_HOOKS
};
'''


def bundle(key='HYK'):
    fs = files()
    body = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL) for f in fs)
    js = ('/* %s: the Hayrant Vassal Kit of the Western Outer Wall in one closure (kits/hayrant/kit_bundle.py). GENERATED: edit kits/hayrant/src or core/engine. */' % key + NL +
          'var %s = (function(){' % key + NL + HEAD + body + TAIL + '})();' + NL)
    return safe(js), [rel(f) for f in fs]


if __name__ == '__main__':
    js, fs = bundle()
    print('%d files, %d KB' % (len(fs), len(js) // 1024))
    for f in fs:
        print('  ' + f)
