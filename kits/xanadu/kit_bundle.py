"""The Xanadu building kit for another world's page, READ IN PLACE and sealed in one closure (as settlements/isle-demo/
bundles.py seals the Iziz Vernacular: IZV), so its globals (MAT, KIT, REG, TAU, clamp, terrainH, rng...) meet neither the
page's nor another kit's:

    bundle(key='XAK') -> (js, files)   var XAK = (function(){ ... })(): the Ancients core the kit draws through (kits/ancients,
                                       core/materials), the Vernacular helpers, the Xanadu vocabulary and every builder
                                       (kits/xanadu/src), without the showcase (90-99), the sky (81-sky) or the vendored Vale biome
                                       (86-bio-*: the kit's plants fall back to its own boxes and cones without it)

    XAK.proto(key, v)   the def built once at the origin on flat ground into a new group (its kit items baked as
                        InstancedMeshes, per instance colours kept; userData.doors its doors as core/door records, all
                        locked); null for a key the kit lacks. The scrap bundle takes XAK.proto(key, v, {unlocked: true}):
                        the scrap defs with an interior (kits/interiors/sets/xanadu-scrap.js, SCRAP_OPEN below) hand their
                        doors back unlocked, for a host that places the interior and opens the leaves through core/door
    XAK.dims()          {key: {w, d, h, fw, fd, name, family, types, wealth, variants}} for every def
    XAK.bind(KMAT)      binds the library maps onto the kit's MAT from the page's KMAT, where the page registered the
                        pack 'xanadu' (tools/textures/matlib_pack.fragment(settlements/xanadu, 'xanadu')): the kit page's
                        own 88y bind. Without it the kit draws its procedural maps (its ?mat=proc look)
    XAK.errors          the kit's reportErr messages

Writes to `window` from inside the kit land on a shadow of its own (the kit sets window._instances and window.onerror;
the page's must not move). The files are read live at build time, never copied."""
import os

import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
MATS = os.path.join(ROOT, 'core', 'materials')
NL = '\n'

# the showcase, the page shell and the kit page's own take; the sky; the vendored biome; the library bind (XAK.bind does
# it against the page's KMAT instead)
SKIP = ('81-sky.js', '88y-xanadu-matlib.js')
SKIP_FROM = '90'


# The Qiblai kit (kits/qiblai: QB.def is XA.def with culture 'qiblai', its keys qb_*), opt-in: its registry and helpers, the
# Xanadui script and its canvases, its MAT keys, every building family and the cut-away rooms' vocabulary (89q5: the wheel
# house draws its inside with qnLampTable). Not the walk-in rooms' furnishing and shells (89q5f, 89q5s: they take the furniture
# bundle and core/walk) nor the mixed street sheet (89q9). Theodiga's town first (settlements/theodiga).
QIBLAI_DIR = os.path.join(ROOT, 'kits', 'qiblai', 'src')
QIBLAI = ['89q0-qb-helpers.js', '89q0x-qb-xanadui.js', '89q0y-qb-script.js', '89q0z-qb-matlib.js', '89q1-qb-houses.js',
          '89q2-qb-trades.js', '89q3-qb-sacred.js', '89q3m-qb-meditation.js', '89q4-qb-temple.js', '89q5-qb-interiors.js']


def files(scrap=False, qiblai=False):
    """The kit's fragments and what they draw through, in filename order: the Ancients core from kits/ancients/src, the
    Vernacular's materials and helpers from kits/iziz-vernacular, core/materials (until 2026-11-03 the first two were
    Xanadu's byte-identical copies in settlements/xanadu/src)."""
    import xanadu as kxa
    names = {f: p for f, p in kxa.paths().items() if f not in SKIP and f[:2] < SKIP_FROM}
    if scrap:   # Scrap Xanadu (PLAN-SCRAP.md), opt-in, and core/rand, whose hash varies its panels
        names.update(kxa.paths(kxa.SCRAP))
        names['08-core-rand.js'] = os.path.join(ROOT, 'core', 'rand', '08-core-rand.js')
    if qiblai:   # the Qiblai kit's buildings (QIBLAI above), read in place
        names.update({f: os.path.join(QIBLAI_DIR, f) for f in QIBLAI})
    names.update({f: os.path.join(ROOT, 'kits', 'ancients', 'src', f) for f in kxa.ANCIENTS_CORE})
    names.update({f: os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src', f) for f in kxa.VERNACULAR + kxa.OPENINGS_VERN})
    names.update({f: os.path.join(ROOT, 'core', 'door', f) for f in kxa.DOOR})   # core/door's records and glass, as the Vernacular bundle carries them
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
/* core/door's registry and glass are the kit's own (its window is the shadow above, so their globals land there: DOOR_BIND
   below names them); no walk: a proto's stairs and doors stand at the origin, not in the page's core/walk */
var KDOOR, KGLASS, KWALK;
'''

TAIL = r'''
reportErr = function (m) { XAK_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.error('XAK: ' + m); };
/* XAK.proto(key, v, o): the def built once at the origin on flat ground into a new group, only its own kit items baked;
   o.drop the slope footing's depth under it (the def's fw x fd, as the kit page sites a building on a hill), o.footC its
   colour, o.rotor false: the windmill without its rotors' arms and sails (the host turns its own: XAK.rotors). Every InstancedMesh of one kit item shares one material across protos (userData.kdef names the item), so a
   host that flattens them (settlements/isle-demo/src/58-isle-protos.js) merges a whole village by material */
var XAK_SHARED = {};
function xakProto(key, v, o) {
  var D = VERN.defs[key]; if (!D) return null; o = o || {};
  KIT.order.forEach(function (n) { KIT.items[n].length = 0; KIT.meshes[n] = null; }); KDOOR.clear();
  var G = new THREE.Group(); G.name = key + '#' + (v | 0); var r0 = REG.length;
  try { withFlatGround(function () { VERN.place(G, key, 0, 0, 0, { y: 0, v: v | 0, drop: o.drop || 0, footC: o.footC, rotor: o.rotor }); }); kbake(G);
    KIT.order.forEach(function (n) { var im = KIT.meshes[n]; if (!im) return; im.userData.kdef = n; im.name = n;
      im.material = XAK_SHARED[n] || (XAK_SHARED[n] = im.material); im.material.userData.kdef = n; }); }
  catch (e) { XAK_ERRS.push(key + ': ' + String(e && e.stack || e).slice(0, 600)); return null; }
  finally { REG.length = r0; KIT.order.forEach(function (n) { KIT.items[n].length = 0; }); }
  /* its doors (core/door records, in the def's frame at the origin; idx: the leaf's instance in the vDoorLeaf mesh), every one
     locked: the kit's bodies are solid. A host that keeps the leaves as instances can register them in its own KDOOR */
  var doors = KDOOR.list.map(function (R) { return { id: R.id, at: R.at, hinge: R.hinge, yaw: R.yaw, sign: R.sign, w: R.w, h: R.h, t: R.t, locked: R.locked, idx: R.idx }; });
  KDOOR.clear();
  G.userData = { key: key, v: v | 0, w: D.w, d: D.d, h: D.h, doors: doors };
  return G;
}
function xakDims() { var out = {}; VERN.order.forEach(function (k) { var D = VERN.defs[k]; if (!/^xa_/.test(k)) return;
  out[k] = { w: D.w, d: D.d, h: D.h || 8, fw: D.fw == null ? D.w * .92 : D.fw, fd: D.fd == null ? D.d * .92 : D.fd, name: D.name, family: D.family,
    types: [].concat((D.tags && D.tags.type) || []), wealth: D.tags && D.tags.wealth, variants: D.nv || D.variants || 2 }; }); return out; }
/* XAK.rotors(key, v): what of a def a host turns itself (built with {rotor: false}): the windmill's rotors, in the def's
   frame (xnAsbadRotors, src/76-xa-farm.js); [] for any other def */
function xakRotors(key, v) { return key === 'xa_windmill' ? xnAsbadRotors({ v: v | 0 }) : []; }
function xakBind(K) { if (!K || !K.bindMat || !K.packed || !K.packed('xanadu', 'xWash')) return null; return K.bindMat('xanadu', MAT, { tile: K.ANCIENT_TILES }); }
return { proto: xakProto, dims: xakDims, bind: xakBind, rotors: xakRotors, VERN: VERN, MAT: MAT, ticks: TICKS, errors: XAK_ERRS };
'''


# after core/door's glass: its two globals, set on the kit's shadow window, become the kit's own KDOOR and KGLASS
DOOR_BIND = 'KDOOR = XAK_WIN.KDOOR; KGLASS = XAK_WIN.KGLASS;' + NL
RAND_BIND = 'KRAND = XAK_WIN.KRAND;' + NL

# Scrap Xanadu's interiors (kits/interiors/sets/xanadu-scrap.js) stand behind these defs' doors: with them placed, a leaf opens.
# XAK.proto(key, v, {unlocked: true}) hands those defs' door records back unlocked (core/door: a host registers them in its KDOOR
# and opens them as the walker comes; KDOOR.clearDoorways switches off the interior's door blocks). The scrap bundle only:
# without scrap=True the tail is byte for byte what it was.
SCRAP_OPEN = ['xa_scrap_house', 'xa_scrap_row', 'xa_scrap_court', 'xa_scrap_bazaar', 'xa_scrap_serai', 'xa_scrap_gate', 'xa_scrap_tower',
              'xa_scrap_shrine', 'xa_scrap_bridge', 'xa_scrap_guild_salvage', 'xa_scrap_guild_hall', 'xa_scrap_store', 'xa_scrap_bath',
              'xa_scrap_tank_house', 'xa_scrap_silos', 'xa_scrap_hull', 'xa_scrap_glint', 'xa_scrap_shacks', 'xa_scrap_farm']
SCRAP_LOCK_OLD = 'w: R.w, h: R.h, t: R.t, locked: R.locked, idx: R.idx }; });'
SCRAP_LOCK_NEW = ('w: R.w, h: R.h, t: R.t, locked: o.unlocked && XAK_OPEN.indexOf(key) >= 0 ? false : R.locked, idx: R.idx }; });')
SCRAP_TAIL_HEAD = ('/* the defs whose doors open onto an interior (kits/interiors/sets/xanadu-scrap.js): XAK.proto(key, v, {unlocked: true}) '
                   'returns their door records unlocked; every other door stays locked (a solid body) */' + NL +
                   'var XAK_OPEN = ' + repr(SCRAP_OPEN).replace("'", '"') + ';' + NL)


QIBLAI_DIMS_OLD = "if (!/^xa_/.test(k)) return;"
QIBLAI_DIMS_NEW = "if (!/^(xa|qb)_/.test(k)) return;"
QIBLAI_BIND_OLD = "return K.bindMat('xanadu', MAT, { tile: K.ANCIENT_TILES }); }"
QIBLAI_BIND_NEW = ("var b = K.bindMat('xanadu', MAT, { tile: K.ANCIENT_TILES }); "
                   "if (K.packed('qiblai', 'qAshlar')) K.bindMat('qiblai', MAT, { tile: K.ANCIENT_TILES }); return b; }")


def bundle(key='XAK', scrap=False, qiblai=False):
    """scrap=True adds Scrap Xanadu (kits/xanadu/PLAN-SCRAP.md: the xa_scrap_* defs) and core/rand (its KRAND lands on the
    kit's shadow window and is bound as the kit's own, as core/door's are). qiblai=True adds the Qiblai kit's buildings
    (QIBLAI above): XAK.dims lists the qb_* defs too, and XAK.bind binds the page's 'qiblai' pack where it registered one.
    Without either the bundle is what it always was."""
    fs = files(scrap, qiblai)
    body = ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL) + (DOOR_BIND if f.endswith('20-core-glass.js') else '')
                   + (RAND_BIND if f.endswith('08-core-rand.js') else '') for f in fs)
    tail = TAIL
    if scrap:
        body = 'var KRAND;' + NL + body
        assert SCRAP_LOCK_OLD in tail, 'kit_bundle: the proto door line moved; update SCRAP_LOCK_OLD'
        tail = SCRAP_TAIL_HEAD + tail.replace(SCRAP_LOCK_OLD, SCRAP_LOCK_NEW)
    if qiblai:
        assert QIBLAI_DIMS_OLD in tail and QIBLAI_BIND_OLD in tail, 'kit_bundle: xakDims or xakBind moved; update QIBLAI_*_OLD'
        tail = tail.replace(QIBLAI_DIMS_OLD, QIBLAI_DIMS_NEW).replace(QIBLAI_BIND_OLD, QIBLAI_BIND_NEW)
    js = ('/* %s: the Xanadu building kit and its Ancients core in one closure (kits/xanadu/kit_bundle.py). GENERATED: '
          'edit kits/xanadu/src, kits/ancients/src, kits/iziz-vernacular/src or core/materials. */' % key + NL + 'var %s = (function(){' % key + NL + HEAD + body + tail +
          '})();' + NL)
    return safe(js), [rel(f) for f in fs]


if __name__ == '__main__':
    import sys as _sys
    js, fs = bundle(scrap='--scrap' in _sys.argv, qiblai='--qiblai' in _sys.argv)
    print('%d files, %d KB' % (len(fs), len(js) // 1024))
    for f in fs:
        print('  ' + f)
