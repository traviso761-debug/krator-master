#!/usr/bin/env python3
"""The Tents kit for another world's page, READ IN PLACE and sealed in one closure (as kits/xanadu/kit_bundle.py seals XAK
and kits/kulanewa/kit_bundle.py seals KLK; Stage 8 B9, T27, 2026-11-24), so its globals (MAT, KIT, DEFS, REG, TAU, clamp,
terrainH, ...) meet neither the page's nor another kit's:

    bundle(key='TNK') -> (js, files)   var TNK = (function(){ ... })(): core/engine's geometry and registry, the tent
                                       toolkit (kits/scyvoi/src/40-tk-tentkit.js), the kit's table, dresses, parts, forms,
                                       roles and its 25 defs (tn-<form>-<size>)

    TNK.proto(key, o)   the def built once at the origin (y = 0, the door +z) into a new THREE.Group, its material buckets
                        flushed; o is place()'s placement (kits/tents/API.md): {dress, role, trade, wear, world, cell, index, v}.
                        userData = {key, v, tris, w, d, h, dress, role}; null for an unknown key. Dry: nothing is registered
                        (the host registers its tent with core/tags, tnTags below), no gear or interior is furnished (no
                        catalog in the closure), and the pennants are plain cloth (88-tn-emblem.js draws on a canvas: [web])
    TNK.dims()          {key: {name, w, d, h, form, size, role, cls, variants}} for the 25 defs: the declared box, guys and
                        stakes counted (tnDims, what core/camp pitches; rounded to the centimetre as the defs are)
    TNK.box(key)        tnDims(key) itself, unrounded: {w, d, h} | null, the numbers core/world/bake_sites.py reads from the
                        kit's table, so a page carrying the bundle pitches a camp (core/world 48w KWCAMPS) exactly as its bake
    TNK.KEYS, TNK.DRESS, TNK.DRESS_ORDER, TNK.FORMS, TNK.ROLES, TNK.TRADES
    TNK.dress(culture)  tnDress: the dress a culture pitches in (a fallback to 'generic' is marked .fallback)
    TNK.tags(role, trade, dress, form)   tnTags: the core/tags record's tags for a pitched tent (the host passes its people's culture)
    TNK.roleOf(form, size), TNK.spec(key), TNK.errors

The page supplies what every engine kit's bundle takes from it (kits/kulanewa/tests/test-kulanewa.js loads the same): three.js,
core/rand (KRAND: the colours, the wear and the patches are KRAND.hash of world, cell, index), core/materials/record, core/tags,
core/door. The dress is a placement option: a Great Caravan's tents take whichever dress its host passes (`generic` until a
Dalab dress is drawn: kits/tents/KNOWN_ISSUES.md)."""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
NL = '\n'

# the page shell, the sheet and the host: the engine's scene, world, furniture and interiors adapters, night, clock and the
# hand-over; the kit's sheet rows, sample camps (core/camp on the sheet), pennant canvases ([web]), interiors glue and probe
SKIP = ('00-head.html', '81-sky.js', '90-scene.js', '91-probe.js', '91f-furnish.js', '91i-interiors.js', '91n-night.js',
        '92-camera.js', '92-world.js', '93-anim.js', '99-host-take.js', '99-tail.html',
        '52-tn-camps.js', '88-tn-emblem.js', '89-rows.js', '91t-tn-interiors.js', '99-host-tn.js')
# read in place, as the kit's build.py reads them (READ_IN_PLACE there)
TENTKIT = os.path.join(ROOT, 'kits', 'scyvoi', 'src', '40-tk-tentkit.js')


def files():
    sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
    import engine as kengine
    fs = {f: p for f, p in kengine.paths().items() if f.endswith('.js') and f not in SKIP}
    fs['40-tk-tentkit.js'] = TENTKIT
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
var TNK_ERRS = [], TNK_WIN = { addEventListener: function () {} };
var window = new Proxy(globalThis.window || globalThis, {
  get: function (t, k) {
    if (Object.prototype.hasOwnProperty.call(TNK_WIN, k)) return TNK_WIN[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function (t, k, v) {
    if (k === 'onerror') return true;
    TNK_WIN[k] = v;
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
reportErr = function (m) { TNK_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.error('TNK: ' + m); };

/* the def built once at the origin, dry (PLACE_DRY: no record, no core/tags, no interior), in the placement's dress */
function tnkProto(key, o) {
  var d = DEFS[key];
  if (!d) return null;
  o = o || {};
  var G = new THREE.Group(), v = o.v | 0;
  G.name = key + '#' + v;
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  svOpenReset();
  var dry = PLACE_DRY; PLACE_DRY = 1;
  try { place(key, 0, 0, 0, Object.assign({}, o, { y: 0, v: v })); }
  catch (e) { TNK_ERRS.push(key + ': ' + String(e && e.stack || e).slice(0, 600)); return null; }
  finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false);
  svOpenFlush(G);
  var p = tnParse(key);
  G.userData = { key: key, v: v, tris: Math.round(GSTAT.tris), w: d.w, d: d.d, h: d.h,
    dress: tnDress(o.dress).key, role: o.role || tnRoleOf(p.form, p.size) };
  return G;
}

function tnkDims() {
  var out = {};
  TN_KEYS.forEach(function (k) {
    var d = DEFS[k], p = tnParse(k);
    if (!d) return;
    out[k] = { name: d.name, w: d.w, d: d.d, h: d.h, form: p.form, size: p.size, role: tnRoleOf(p.form, p.size), cls: d.cls, variants: 1 };
  });
  return out;
}

return {
  proto: tnkProto, dims: tnkDims, box: tnDims, KEYS: TN_KEYS, DRESS: TN_DRESS, DRESS_ORDER: TN_DRESS_ORDER, FORMS: TN_FORMS,
  ROLES: TN_ROLES, TRADES: TN_TRADES, dress: tnDress, tags: tnTags, roleOf: tnRoleOf, spec: tnSpec,
  DEFS: DEFS, MAT: MAT, KIT: KIT, errors: TNK_ERRS
};
'''


def bundle(key='TNK'):
    fs = files()
    body = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL) for f in fs)
    js = ('/* %s: the Tents kit in one closure (kits/tents/tents_bundle.py). GENERATED: edit kits/tents/src, core/engine or '
          'kits/scyvoi/src/40-tk-tentkit.js. */' % key + NL +
          'var %s = (function(){' % key + NL + HEAD + body + TAIL + '})();' + NL)
    return safe(js), [rel(f) for f in fs]


if __name__ == '__main__':
    js, fs = bundle()
    print('%d files, %d KB' % (len(fs), len(js) // 1024))
    for f in fs:
        print('  ' + f)
