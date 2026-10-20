"""The Xanadu building kit for another world's page, READ IN PLACE and sealed in one closure (as settlements/isle-demo/
bundles.py seals the Iziz Vernacular: IZV), so its globals (MAT, KIT, REG, TAU, clamp, terrainH, rng...) meet neither the
page's nor another kit's:

    bundle(key='XAK') -> (js, files)   var XAK = (function(){ ... })(): the Ancients core the kit draws through (src/10-69,
                                       core/materials), the Vernacular helpers, the Xanadu vocabulary and every builder
                                       (src/70-89), without the showcase (90-99), the sky (81-sky) or the vendored Vale biome
                                       (86-bio-*: the kit's plants fall back to its own boxes and cones without it)

    XAK.proto(key, v)   the def built once at the origin on flat ground into a new group (its kit items baked as
                        InstancedMeshes, per instance colours kept); null for a key the kit lacks
    XAK.dims()          {key: {w, d, h, fw, fd, name, family, types, wealth, variants}} for every def
    XAK.bind(KMAT)      binds the library maps onto the kit's MAT from the page's KMAT, where the page registered the
                        pack 'xanadu' (tools/textures/matlib_pack.fragment(settlements/xanadu, 'xanadu')): the kit page's
                        own 88y bind. Without it the kit draws its procedural maps (its ?mat=proc look)
    XAK.errors          the kit's reportErr messages

Writes to `window` from inside the kit land on a shadow of its own (the kit sets window._instances and window.onerror;
the page's must not move). The files are read live at build time, never copied."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
MATS = os.path.join(ROOT, 'core', 'materials')
NL = '\n'

# the showcase, the page shell and the kit page's own take; the sky; the vendored biome; the library bind (XAK.bind does
# it against the page's KMAT instead)
SKIP = ('81-sky.js', '88y-xanadu-matlib.js')
SKIP_FROM = '90'


def files():
    names = {f: os.path.join(SRC, f) for f in os.listdir(SRC)
             if f[0].isdigit() and f.endswith('.js') and not f.startswith('86-bio-') and f not in SKIP and f[:2] < SKIP_FROM}
    for f in os.listdir(MATS):   # core/materials (a src/ copy of the same name would win: none today)
        if f[0].isdigit() and f.endswith('.js') and f not in names:
            names[f] = os.path.join(MATS, f)
    names['69a-world-uv.js'] = os.path.join(MATS, 'opt', '69a-world-uv.js')
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
var XAK_ERRS = [], XAK_WIN = {};
var window = new Proxy(globalThis.window || globalThis, {
  get: function (t, k) { if (Object.prototype.hasOwnProperty.call(XAK_WIN, k)) return XAK_WIN[k]; var v = t[k]; return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },
  set: function (t, k, v) { XAK_WIN[k] = v; return true; } });
var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };
'''

TAIL = r'''
reportErr = function (m) { XAK_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.error('XAK: ' + m); };
/* XAK.proto(key, v, o): the def built once at the origin on flat ground into a new group, only its own kit items baked;
   o.drop the slope footing's depth under it (the def's fw x fd, as the kit page sites a building on a hill), o.footC its
   colour. Every InstancedMesh of one kit item shares one material across protos (userData.kdef names the item), so a
   host that flattens them (settlements/isle-demo/src/58-isle-protos.js) merges a whole village by material */
var XAK_SHARED = {};
function xakProto(key, v, o) {
  var D = VERN.defs[key]; if (!D) return null; o = o || {};
  KIT.order.forEach(function (n) { KIT.items[n].length = 0; KIT.meshes[n] = null; });
  var G = new THREE.Group(); G.name = key + '#' + (v | 0); var r0 = REG.length;
  try { withFlatGround(function () { VERN.place(G, key, 0, 0, 0, { y: 0, v: v | 0, drop: o.drop || 0, footC: o.footC }); }); kbake(G);
    KIT.order.forEach(function (n) { var im = KIT.meshes[n]; if (!im) return; im.userData.kdef = n; im.name = n;
      im.material = XAK_SHARED[n] || (XAK_SHARED[n] = im.material); im.material.userData.kdef = n; }); }
  catch (e) { XAK_ERRS.push(key + ': ' + String(e && e.stack || e).slice(0, 600)); return null; }
  finally { REG.length = r0; KIT.order.forEach(function (n) { KIT.items[n].length = 0; }); }
  G.userData = { key: key, v: v | 0, w: D.w, d: D.d, h: D.h };
  return G;
}
function xakDims() { var out = {}; VERN.order.forEach(function (k) { var D = VERN.defs[k]; if (!/^xa_/.test(k)) return;
  out[k] = { w: D.w, d: D.d, h: D.h || 8, fw: D.fw == null ? D.w * .92 : D.fw, fd: D.fd == null ? D.d * .92 : D.fd, name: D.name, family: D.family,
    types: [].concat((D.tags && D.tags.type) || []), wealth: D.tags && D.tags.wealth, variants: D.nv || D.variants || 2 }; }); return out; }
function xakBind(K) { if (!K || !K.bindMat || !K.packed || !K.packed('xanadu', 'xWash')) return null; return K.bindMat('xanadu', MAT, { tile: K.ANCIENT_TILES }); }
return { proto: xakProto, dims: xakDims, bind: xakBind, VERN: VERN, MAT: MAT, ticks: TICKS, errors: XAK_ERRS };
'''


def bundle(key='XAK'):
    fs = files()
    body = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL) for f in fs)
    js = ('/* %s: the Xanadu building kit and its Ancients core in one closure (settlements/xanadu/kit_bundle.py). GENERATED: '
          'edit settlements/xanadu/src or core/materials. */' % key + NL + 'var %s = (function(){' % key + NL + HEAD + body + TAIL +
          '})();' + NL)
    return safe(js), [rel(f) for f in fs]


if __name__ == '__main__':
    js, fs = bundle()
    print('%d files, %d KB' % (len(fs), len(js) // 1024))
    for f in fs:
        print('  ' + f)
