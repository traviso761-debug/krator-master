#!/usr/bin/env python3
"""The Shumari building kit sealed in one closure (`SMK`) for another world's page (`openworld/shumar-north`,
`openworld/shumar-south`, `settlements/shumar`), following `settlements/isle-demo/bundles.py` (`ISK`) and
`kits/xanadu/kit_bundle.py` (`XAK`). Its engine globals (`MAT`, `REG`, `DEFS`, `TAU`, `clamp`, `terrainH`, `KIT`...)
never collide with the host page's or another kit's:

    bundle(key='SMK', resources=True) -> (js, files)

    SMK.proto(key, v)   builds `DEFS[key]` once at the origin (`y = 0`, front `+z`) into a `THREE.Group`, flushes its
                        material buckets, records `userData = {key, v, tris, w, d, h, giant, caste, vaultH, doors,
                        sockets, fixtures}`, and leaves the page's `KTAGS`/`KWALK` untouched.
    SMK.dims()          `{key: {cls, kind, w, d, h, fw, fd, name, giant, caste, vaultH, style, wealth, types, role,
                        job, cut, shore, variants}}` for every building (and resource node when `resources=True`).
    SMK.SM_TRADES       the 44-row Voth census trade mapping (`src/68-sm-trades.js`).
    SMK.DEFS / SMK.MAT  the kit's definition and material tables; registers `KMAT.adapter('shumari', ...)` on load when
                        the host page provides `KMAT`.
    SMK.errors          any `reportErr` messages emitted inside the closure.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
NL = '\n'

ENGINE_SKIP = (
    '00-head.html',
    '81-sky.js',
    '90-scene.js',
    '91-probe.js',
    '91f-furnish.js',
    '91i-interiors.js',
    '91n-night.js',
    '92-camera.js',
    '92-world.js',
    '93-anim.js',
    '99-host-take.js',
    '99-tail.html',
)


def rd(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def safe(js):
    """Inline JS may contain no literal script tag, even inside comments."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files(resources=True):
    sys.path.insert(0, HERE)
    import shumari as ksm
    sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
    import engine as kengine

    fs = {f: p for f, p in kengine.paths().items() if f.endswith('.js') and f not in ENGINE_SKIP}
    fs.update(ksm.paths())
    if resources:
        for f in ('42r-res-ore.js', '44r-res-nodes.js'):
            fs[f] = os.path.join(ROOT, 'kits', 'resources', 'src', f)
    return [fs[f] for f in sorted(fs)]


HEAD = r'''
var SMK_ERRS = [], SMK_WIN = {};
var window = new Proxy(globalThis.window || globalThis, {
  get: function (t, k) {
    if (Object.prototype.hasOwnProperty.call(SMK_WIN, k)) return SMK_WIN[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function (t, k, v) {
    if (k === 'onerror') { SMK_WIN[k] = v; return true; }
    SMK_WIN[k] = v;
    return true;
  }
});
var qs = new URLSearchParams((globalThis.location && globalThis.location.search) || '');
var buildWorld = function () { return null; }, WORLD = null;
var SVF = { WEALTH: {}, missing: {}, placed: [] };
function svfNewBatch() {}
function FURNISH() { return null; }
function FURNISH_HANG() { return null; }
function svfH(key, v, dflt) { return dflt; }
var KratorFurniture = {
  FURN_BY_KEY: {},
  has: function () { return false; },
  entryDims: function () { return { w: 1, d: 1, h: 1 }; },
  setDetail: function () {}
};
'''

TAIL = r'''
reportErr = function (m) {
  SMK_ERRS.push(String(m).slice(0, 600));
  if (typeof console !== 'undefined') console.error('SMK: ' + m);
};
(function () {
  if (typeof KMAT === 'undefined' || !KMAT || !KMAT.adapter) return;
  var recs = {};
  for (var k in MAT) {
    var fam = SV_LIB[k], L = fam && KMAT.mode === 'lib' && KMAT.packed ? KMAT.packed(KIT.pack, fam) : null;
    recs[k] = {
      id: KIT.pack + '.' + k,
      family: k,
      scale: [TILE[k] == null ? 1 : TILE[k], TILE[k] == null ? 1 : TILE[k]],
      tint: true,
      roughness: MAT[k].roughness === undefined ? 1 : MAT[k].roughness,
      metal: MAT[k].metalness == null ? 0 : MAT[k].metalness,
      specular: L ? L.specular : 0.5,
      breakup: L ? (L.breakup || null) : null,
      lib: L ? L.lib : null,
      doubleSided: MAT[k].side === THREE.DoubleSide,
      hook: [SV_CLOTH[k] ? 'cloth-flutter' : null, SV_CUT[k] ? 'cut-away' : null, k === 'glow' ? 'unlit flicker' : null].filter(Boolean).join('+') || null,
      note: L ? 'library set, tint keep ' + L.tint : 'vertex colour only'
    };
  }
  KMAT.adapter(KIT.pack, recs);
})();
function smkFixtures(rec) {
  var f = { doors: [], windows: [], lamps: [], sockets: [] }, r3 = function (v) { return +v.toFixed(3); };
  (function walk(r) {
    if (!r) return;
    (r.doors || []).forEach(function (q) {
      f.doors.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h == null ? null : q.h, part: r.key });
    });
    (r.windows || []).forEach(function (q) {
      f.windows.push({ x: r3(q.wx), y: r3(q.wy), z: r3(q.wz), yaw: +q.yaw.toFixed(4), w: q.w, h: q.h, sill: q.sill, part: r.key });
    });
    (r.sockets || []).forEach(function (q) {
      f.sockets.push({ kind: q.kind, x: r3(q.x), y: r3(q.y), z: r3(q.z), ry: +q.ry.toFixed(4) });
    });
    (r.children || []).forEach(walk);
  })(rec);
  HALOS.forEach(function (H) {
    f.lamps.push({ x: r3(H.x), y: r3(H.y), z: r3(H.z), colour: [+H.r.toFixed(3), +H.g.toFixed(3), +H.b.toFixed(3)], big: !!H.big });
  });
  return f;
}
function smkProto(key, v) {
  var d = DEFS[key];
  if (!d) return null;
  var G = new THREE.Group();
  G.name = key + '#' + (v | 0);
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  var dry = PLACE_DRY; PLACE_DRY = 1; var rec = null;
  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0 }); } finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false);
  G.userData = {
    key: key,
    v: v | 0,
    tris: Math.round(GSTAT.tris),
    w: d.w,
    d: d.d,
    h: d.h,
    giant: !!d.giant,
    caste: d.caste || null,
    vaultH: d.vaultH == null ? 0 : d.vaultH,
    doors: rec ? rec.doorCount : 0,
    fixtures: smkFixtures(rec)
  };
  return G;
}
return {
  proto: smkProto,
  dims: smDims,
  DEFS: DEFS,
  MAT: MAT,
  KIT: KIT,
  SM_TRADES: (typeof SM_TRADES !== 'undefined' ? SM_TRADES : null),
  RES: (typeof RES_NODES !== 'undefined' ? RES_NODES : null),
  errors: SMK_ERRS,
  ANIMU: ANIMU,
  FRAME_HOOKS: FRAME_HOOKS
};
'''


def pack_fragment(side=None):
    """Return the KMAT.pack('shumari', ...) fragment (with optional sidecar dict) for host settlement/openworld builds."""
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    return matlib_pack.fragment(HERE, 'shumari', side=side, own=True)


def bundle(key='SMK', resources=True):
    fs = files(resources=resources)
    body = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL) for f in fs)
    js = (
        '/* %s: the Shumari building kit in one closure (kits/shumari/kit_bundle.py). '
        'GENERATED: edit kits/shumari/src, core/engine or kits/resources/src. */' % key + NL +
        'var %s = (function(){' % key + NL + HEAD + body + TAIL + '})();' + NL
    )
    return safe(js), [rel(f) for f in fs]


if __name__ == '__main__':
    js, fs = bundle(resources='--no-resources' not in sys.argv)
    print('%d files, %d KB' % (len(fs), len(js) // 1024))
    for f in fs:
        print('  ' + f)

