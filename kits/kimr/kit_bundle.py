"""The Kimr kit for another world's page, READ IN PLACE and sealed in one closure (after kits/xanadu/kit_bundle.py's XAK and
settlements/isle-demo/bundles.py's ISK, the other core/engine kit sealed for a host), so its globals (the engine's MAT, KIT, REG,
TAU, clamp, smooth, terrainH, reseed, rng, P, DEFS, place...) meet neither the page's nor another kit's. The first host is
biomes/labyrinth (its Mesas: a pueblo on a knob of the chaos), whose page reads the Ancients runtime in place with names the
engine's would clash with:

    bundle(key='KMK') -> (js, files)   var KMK = (function(){ ... })(): the building-kit engine the kit draws through
                                       (core/engine: 10-core, 27-mat, 30-geo, 36-def, 36o-open, 36s-stair), core/pueblo (KPUEBLO)
                                       and the kit (kits/kimr/src), without the sheet's scene, world, furniture, night, clock
                                       and host hand-over (the kit page's own: core/engine 90-99)

    KMK.proto(key, v, o)  the def built once at the origin into a new group (y 0 the floor in front of the rock, front +z), its
                          buckets flushed to one mesh per material key; o.rock a world's own rock (kits/kimr/src/44-km-plan.js
                          kmSite: {x0, x1, z0, z1, h, batter, drawn:false}); nothing registered (the host registers first:
                          KMK.register); null for a key the kit lacks
    KMK.dims()            {key: {w, d, h, name, types, wealth, variants}} for every def
    KMK.plan(v), KMK.site(v, o)   the house's core/pueblo plan and its site record (the rock, the dress below it, its box and the
                          offset that centres it on the def's origin): plain data, for the host's fit and checks
    KMK.register(T, o)    the house and its parts (rooms, ladders, the rock, the round room, the pen...) into the page's core/tags
                          registry T (BIO.tagReg()): o {v, rock, at(x, y, z) -> [x, y, z] world from the def's frame, ry, name}
    KMK.bind(KMAT)        binds the library maps onto the kit's MAT where the page registered the pack 'kimr' (none yet: the
                          kit draws on vertex colours, KNOWN_ISSUES.md); null otherwise
    KMK.errors            the kit's reportErr messages

The page must carry three.js, core/rand (KRAND), core/space (KSPACE), core/materials/record (KMAT) and core/tags (KTAGS): the
closure reads those globals (one copy each on a page). The files are read live at build time, never copied."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
NL = '\n'

# core/engine's files the kit's builders draw through; the rest (90-scene, 91f-furnish, 91n-night, 92-world, 93-anim,
# 99-host-take, 99-tail.html) are the kit page's own
ENGINE = ('10-core.js', '27-mat.js', '30-geo.js', '36-def.js', '36o-open.js', '36s-stair.js')
PUEBLO = ('10-pueblo-plan.js', '20-pueblo-access.js', '30-pueblo-court.js')


def files():
    """The engine, core/pueblo and the kit's fragments, in the kit page's filename order (kits/kimr/build.py sorts them)."""
    sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
    import engine as kengine
    names = {f: p for f, p in kengine.paths(list(ENGINE)).items()}
    names.update({f: os.path.join(ROOT, 'core', 'pueblo', f) for f in PUEBLO})
    names.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit() and f.endswith('.js')})   # a src/ copy wins
    return [names[f] for f in sorted(names)]


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def safe(js):
    """inline text may hold no script tag, not even in a comment (kits/catalog/furniture_bundle.py)"""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


HEAD = r'''
/* the page's shell, as the engine asks for it: its window (the kit's error hooks stay in here: window.onerror and what it sets
   land on a shadow of its own), no furniture (the builders place none), no walk and no doors (a proto is a dry placement) */
var KMK_ERRS = [], KMK_WIN = {};
/* the engine wraps console.error to forward shader errors to its panel (10-core.js): here it wraps a console of its own, so the page's
   console (and the page's own forwarding) is untouched; the kit's messages go out through the page's console (TAIL) */
var console = Object.create(globalThis.console);
var window = new Proxy(globalThis.window || globalThis, {
  get: function (t, k) { if (Object.prototype.hasOwnProperty.call(KMK_WIN, k)) return KMK_WIN[k]; var v = t[k]; return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },
  set: function (t, k, v) { KMK_WIN[k] = v; return true; } });
var KDOOR, KGLASS, KWALK, KWALKBOX;
var SVF = { WEALTH: {}, missing: {}, placed: [] };
function FURNISH() { return null; }
function FURNISH_HANG() { return null; }
function svfH(key, v, dflt) { return dflt; }
'''

TAIL = r'''
reportErr = function (m) { KMK_ERRS.push(String(m).slice(0, 600)); if (globalThis.console) globalThis.console.error('KMK: ' + m); };
/* KMK.proto(key, v, o): the def built once at the origin (y 0, front +z) into a new group, its buckets flushed; dry: nothing
   registered (the host registered the house in core/tags first: KMK.register) */
function kmkProto(key, v, o) {
  var d = DEFS[key]; if (!d) return null; o = o || {};
  var G = new THREE.Group(); G.name = key + '#' + (v | 0);
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  var dry = PLACE_DRY; PLACE_DRY = 1; var rec = null;
  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0, rock: o.rock }); }
  catch (e) { KMK_ERRS.push(key + ': ' + String(e && e.stack || e).slice(0, 600)); return null; }
  finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false); GB = {}; GTARGET = GB;
  G.userData = { key: key, v: v | 0, tris: Math.round(GSTAT.tris), w: d.w, d: d.d, h: d.h, km: rec && rec.km || null };
  return G;
}
function kmkDims() { var out = {}; for (var k in DEFS) { var D = DEFS[k];
  out[k] = { w: D.w, d: D.d, h: D.h, name: D.name, types: [].concat((D.tags && D.tags.types) || []), wealth: D.tags && D.tags.wealth, variants: 3 }; } return out; }
/* KMK.register(T, o): the house record and its parts, as kmBuild registers them on the kit's own page (46-km-draw.js
   kmRegister), into the host's registry; o.at maps the def's frame (y 0 the floor) to the world */
function kmkRegister(T, o) {
  var D = DEFS['km-house'], P = KM.plan(o.v | 0), St = kmSite(P, o), R = St.rock, ox = St.off[0], oz = St.off[1], at0 = o.at;
  var name = o.name || D.name, w = at0(0, 0, 0);
  var top = T.add({ 'class': 'building', kind: 'km-house', key: 'km-house', name: name, at: w, ry: o.ry || 0, size: [St.box.w, St.box.d, St.box.h],
    tags: Object.assign({}, D.tags), note: D.note, frag: KIT.frag });
  var at = function (x, y, z) { return at0(x + ox, y + R.h, z + oz); };
  var n = kmRegister(P, St, T, top.id, at, o.ry || 0, name);
  return { id: top.id, count: n + 1 };
}
function kmkBind(K) { if (!K || !K.bindMat || !K.packed || !K.packed('kimr', 'stone')) return null; return K.bindMat('kimr', MAT, {}); }
return { proto: kmkProto, dims: kmkDims, plan: function (v) { return KM.plan(v | 0); }, site: function (v, o) { return kmSite(KM.plan(v | 0), o); },
  register: kmkRegister, bind: kmkBind, KM: KM, MAT: MAT, errors: KMK_ERRS };
'''


# names renamed in the sealed copy only (the files on disk are untouched, as biomes/labyrinth/build.py renames the Ancients runtime's):
# the cloth flutter's `uniform float uWind` (core/engine 27-mat.js) meets core/atmos's cloud shading, which a host's sky puts in every
# scene material's fragment shader as `uniform vec2 uWind`: one program cannot hold both (GL: "Types of uniform 'uWind' differ")
# and the engine's window.onerror (the shadow window swallows it anyway) reads as a clash with the page's own in tools/check_assembly.py
SUBST = {'27-mat.js': [(r'\buWind\b', 'uSvWind')], '10-core.js': [(r'\bwindow\.onerror\b', 'window.kmkOnerror')]}


def bundle(key='KMK'):
    import re
    fs = files()

    def text(f):
        s = rd(f)
        for pat, rep in SUBST.get(os.path.basename(f), []):
            s = re.sub(pat, rep, s)
        return s
    body = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, text(f), NL, NL) for f in fs)
    js = ('/* %s: the Kimr kit, core/pueblo and the building-kit engine in one closure (kits/kimr/kit_bundle.py). GENERATED: '
          'edit kits/kimr/src, core/pueblo or core/engine. */' % key + NL + 'var %s = (function(){' % key + NL + HEAD + body + TAIL +
          '})();' + NL)
    return safe(js), [rel(f) for f in fs]


if __name__ == '__main__':
    js, fs = bundle()
    print('%d files, %d KB' % (len(fs), len(js) // 1024))
    for f in fs:
        print('  ' + f)
