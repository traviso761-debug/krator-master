#!/usr/bin/env python3
"""The Urban Tabisti Architectural Kit for another world's page (Sfenops, Middle Tabisti, Liikofi, Mungo, Lower Verge),
READ IN PLACE and sealed in one closure (as kits/kulanewa/kit_bundle.py seals KLK and kits/xanadu/kit_bundle.py seals XAK):

    bundle(key='TBK') -> (js, files)   var TBK = (function(){ ... })(): core/engine's geometry & building registry,
                                       Stage 5 KMAT_M1, the Urban Tabisti vertical-stack shader hooks, bioclimatic helpers,
                                       crowns, all 50 Urban Tabisti defBuildings, and TB_TRADES.

    TBK.proto(key, v)   the def built once at the origin (y=0, front +z) into a new THREE.Group, its material buckets
                        flushed, userData = {key, v, tris, w, d, h, style, doors, fixtures}; null for an unknown key
    TBK.dims()          {key: {cls, name, w, d, h, fw, fd, style, wealth, types, role, job, cut, variants}} for all 50 defs
    TBK.trades          TB_TRADES (all 44/44 Voth census trades)
    TBK.tradeDefs()     tbTradeDefs() -> {trade: [keys...]}
    TBK.polities        TB_POLITIES (Sfenops, Middle Tabisti, Liikofi)
    TBK.lexicon         TB_LEXICON (Tabist architectural & civic vocabulary)
    TBK.errors          the kit's reportErr messages
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
NL = '\n'

SKIP = (
    '00-head.html', '39-tb-furn.js',
    '43-tb-round.js', '66d-tb-desert-khans.js', '67d-tb-desert-forts.js', '89d-rows-desert.js',   # the Desert Tabisti variants: on the kit page only until a settlement zones them
    '81-sky.js', '90-scene.js', '91-probe.js', '91f-furnish.js', '91i-interiors.js', '91n-night.js',
    '91r-tb-roomlight.js', '91z-tb-world.js', '92-camera.js', '92-world.js',
    '93-anim.js', '99-host-take.js', '99-host-tz-tb.js', '99-tail.html'
)


def files():
    sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
    import engine as kengine
    fs = {f: p for f, p in kengine.paths().items() if f.endswith('.js') and f not in SKIP}
    fs['27-matlib-m1.js'] = os.path.join(ROOT, 'core', 'materials', 'record', '27-matlib-m1.js')
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
var TBK_ERRS = [], TBK_WIN = { addEventListener: function () {} };
var window = new Proxy(globalThis.window || globalThis, {
  get: function (t, k) {
    if (Object.prototype.hasOwnProperty.call(TBK_WIN, k)) return TBK_WIN[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function (t, k, v) {
    if (k === 'onerror') return true;
    TBK_WIN[k] = v;
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
reportErr = function (m) { TBK_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.error('TBK: ' + m); };
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

function tbkFixtures(rec) {
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

function tbkProto(key, v) {
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
    doors: rec ? rec.doorCount : 0, fixtures: tbkFixtures(rec)
  };
  return G;
}

function tbkDims() {
  var out = {};
  for (var k in DEFS) {
    var d = DEFS[k];
    if (d.cls !== 'building') continue;
    out[k] = {
      cls: d.cls, name: d.name, w: d.w, d: d.d, h: d.h, fw: d.w * 0.92, fd: d.d * 0.92,
      style: d.tags.style || null, wealth: d.tags.wealth || null,
      types: d.tags.types || null, role: d.tags.role || null, job: d.tags.job || null,
      cut: !!d.cut, variants: 1
    };
  }
  return out;
}

return {
  proto: tbkProto, dims: tbkDims, DEFS: DEFS, MAT: MAT, KIT: KIT,
  trades: TB_TRADES, tradeDefs: tbTradeDefs, polities: TB_POLITIES, lexicon: TB_LEXICON,
  errors: TBK_ERRS, ANIMU: ANIMU, FRAME_HOOKS: FRAME_HOOKS
};
'''


def bundle(key='TBK'):
    fs = files()
    body = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL) for f in fs)
    js = ('/* %s: the Urban Tabisti Architectural Kit in one closure (kits/tabisti/kit_bundle.py). GENERATED: edit kits/tabisti/src or core/engine. */' % key + NL +
          'var %s = (function(){' % key + NL + HEAD + body + TAIL + '})();' + NL)
    return safe(js), [rel(f) for f in fs]


if __name__ == '__main__':
    js, fs = bundle()
    print('%d files, %d KB' % (len(fs), len(js) // 1024))
    for f in fs:
        print('  ' + f)
