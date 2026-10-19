"""The kits the isle demo's city page (dist/isle-city.html, P6) draws with, each READ IN PLACE and sealed in a closure of its
own so its globals (MAT, REG, TAU, clamp, terrainH, WORLD, KIT...) meet neither the page's nor another kit's:

    kcity_bundle()     KCITY: core/city's data fragments (as settlements/verge/build.py bundles them)
    isk_bundle()       ISK: the Islanders kit (kits/islanders/src), its engine (vendored there from kits/scyvoi), the
                       resource nodes (kits/resources) and the farm animals (kits/fauna); ISK.proto(key, v) builds one
                       def at the origin into a group, ISK.dims() is the kit's isDims()
    izv_bundle()       IZV: the Iziz Vernacular with the Ancients core it draws through (settlements/iziz/src,
                       core/materials), the same files settlements/verge/build.py's IZV takes; IZV.proto(key, v, w)
    ringsea_fragment() RINGSEA: the Ring Sea watercraft (kits/ringsea) through settlements/voth/ringsea.py, read in
                       place, with the isle demo's own vessel list (PLAN.md section 8a)

A kit's furniture is left out of the city page: FURNISH places nothing (the city is drawn from outside; interiors and
their catalog pieces come with the export profile, P6b). The files are read live at build time, never copied."""
import glob, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
NL = '\n'


def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def safe(js):
    """inline text may hold no script tag, not even in a comment (kits/catalog/furniture_bundle.py)"""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def body(files):
    return ''.join('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL) for f in files)


# ---------------------------------------------------------------- core/city
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js']


def city_files():
    return [os.path.join(ROOT, 'core', 'city', f) for f in CITY_JS]


def kcity_bundle():
    return ('/* KCITY: core/city in one closure (settlements/isle-demo/bundles.py). GENERATED: edit core/city. */' + NL +
            'var KCITY = (function(){' + NL + body(city_files()) +
            'KCITY.lib = { SL: SL, OCC: OCC, Raster: Raster, V: V, obb: obb, obbCorners: obbCorners, inPoly: inPoly, offsetConvex: offsetConvex,' + NL +
            '  resample: resample, plLen: plLen, segDist: segDist, ryFacing: ryFacing, polyArea: polyArea, polyCentroid: polyCentroid, plFrame: plFrame,' + NL +
            '  polySegDist: polySegDist, plan: function () { return PLAN; } };' + NL +
            'return KCITY;' + NL + '})();' + NL)


# ---------------------------------------------------------------- the Islanders kit
ISL = os.path.join(ROOT, 'kits', 'islanders', 'src')
# the engine and the kit, in the kit's own filename order (kits/islanders/build.py sorts them); left out: the page shell,
# the sky, the sheet's scene, the shore's drawing, the probe, the night pool, the camera, the clock and the furniture
# adapter (FURNISH is the stub below). 90h-is-shore.js's IS_SEA (the harbour defs' water and sea floor) is restated here
ISK_SKIP = ('00-head.html', '81-sky.js', '90-scene.js', '90h-is-shore.js', '91-probe.js', '91f-furnish.js', '91n-night.js',
            '92-camera.js', '93-anim.js', '99-tail.html')


def isk_files():
    fs = {f: os.path.join(ISL, f) for f in os.listdir(ISL) if f[0].isdigit() and f.endswith('.js') and f not in ISK_SKIP}
    for f in ('42r-res-ore.js', '44r-res-nodes.js'):      # kits/resources, read in place (kits/islanders/build.py RESOURCES)
        fs[f] = os.path.join(ROOT, 'kits', 'resources', 'src', f)
    return [fs[f] for f in sorted(fs)]


ISK_HEAD = r'''
/* the page's shell, as the kit's fragments ask for it: its window (the kit's error hooks stay in here), the sheet's scene
   hooks. The kit's errors at load go to the page's panel (10-core.js reportErr); after it, to ISK.errors */
var ISK_ERRS = [];
var window = new Proxy(globalThis.window || globalThis, { get: function (t, k) { var v = t[k]; return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },
  set: function (t, k, v) { if (k === 'onerror') return true; t[k] = v; return true; } });
var buildWorld = function () { return null; }, WORLD = null;
/* the harbour defs' water (kits/islanders/src/90h-is-shore.js, its sheet's shore): the waterline 0.9 m under the land */
var IS_SEA = { level: -0.9, floor: -3.8, shoreZ: null, beach: 5, slope: 9 };
/* no furniture on the city page (bundles.py): the builders' FURNISH calls place nothing */
var SVF = { WEALTH: {}, missing: {}, placed: [] };
function svfNewBatch() {}
function FURNISH() { return null; }
function FURNISH_HANG() { return null; }
function svfH(key, v, dflt) { return dflt; }
/* ...and no catalog: the dresser (42-is-dress.js isDim) asks a piece's size only to place it */
var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, setDetail: function () {} };
'''

ISK_TAIL = r'''
reportErr = function (m) { ISK_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.error('ISK: ' + m); };
/* ISK.proto(key, v): the def built once at the origin (y 0, front +z) into a new group, its buckets flushed, its sails and
   animals with it; nothing is registered (the city registered the lot in core/tags before drawing it) */
function iskProto(key, v) {
  var d = DEFS[key]; if (!d) return null;
  var G = new THREE.Group(); G.name = key + '#' + (v | 0);
  GB = {}; GTARGET = GB; REG.length = 0; SV_LIFE.length = 0; halosReset(); SMOKES = []; GSTAT.tris = 0; SBS.length = 0; SB = null; resetCM();
  if (typeof saReset === 'function') saReset(); IE_MILLS.length = 0;
  var dry = PLACE_DRY; PLACE_DRY = 1; var rec = null;
  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0 }); } finally { PLACE_DRY = dry; }
  flushBuckets(GB, G, false);
  if (IE_MILLS.length) ieMillFlush(G);
  if (typeof saFlush === 'function') saFlush(G);
  G.userData = { key: key, v: v | 0, tris: Math.round(GSTAT.tris), w: d.w, d: d.d, h: d.h, doors: rec ? rec.doorCount : 0 };
  return G;
}
return { proto: iskProto, dims: isDims, DEFS: DEFS, MAT: MAT, KIT: KIT, IS_TRADES: (typeof IS_TRADES !== 'undefined' ? IS_TRADES : null),
  RES: (typeof RES_NODES !== 'undefined' ? RES_NODES : null), errors: ISK_ERRS, ANIMU: ANIMU, FRAME_HOOKS: FRAME_HOOKS };
'''


def isk_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'fauna'))
    import fauna_bundle
    fs = isk_files()
    return safe('/* ISK: the Islanders kit in one closure (settlements/isle-demo/bundles.py). GENERATED: edit kits/islanders/src, '
                'kits/resources/src or kits/fauna. */' + NL + 'var ISK = (function(){' + NL + ISK_HEAD +
                '/* ---- kits/fauna (fauna_bundle.py: the farm animals) ---- */' + NL + fauna_bundle.bundle(['farm']) + NL +
                body(fs) + ISK_TAIL + '})();' + NL), [rel(f) for f in fs] + ['kits/fauna (farm)']


# ---------------------------------------------------------------- the Iziz Vernacular
IZIZ = os.path.join(ROOT, 'settlements', 'iziz', 'src')
MATS = os.path.join(ROOT, 'core', 'materials')


def izv_files():
    """settlements/verge/build.py izv_files() and every vernacular fragment Iziz has added since (one shared copy is a
    follow-up: KNOWN_ISSUES.md)"""
    def iz(f):   # a local copy in settlements/iziz/src wins over core/materials (its build's srcpath rule)
        p = os.path.join(IZIZ, f)
        if os.path.exists(p):
            return p
        q = os.path.join(MATS, f)
        return q if os.path.exists(q) else os.path.join(MATS, 'opt', f)
    names = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js',
             '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js', '69a-world-uv.js', '69b-vern-mat.js',
             '69c-vern-helpers.js', '69e-vern-hollow.js']
    out = [iz(f) for f in names]
    # every vernacular building fragment in its file order: Verge's list stops at 74, and Iziz has since added 71a-c, 73b-c
    out += sorted(glob.glob(os.path.join(IZIZ, '7[0-4]*-vern-*.js')))
    return out


IZV_HEAD = r'''
var IZV_ERRS = [];
var window = new Proxy(globalThis.window || globalThis, { get: function (t, k) { var v = t[k]; return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },
  set: function (t, k, v) { if (k === 'onerror') return true; t[k] = v; return true; } });
var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };
'''

IZV_TAIL = r'''
reportErr = function (m) { IZV_ERRS.push(String(m).slice(0, 600)); if (typeof console !== 'undefined') console.error('IZV: ' + m); };
if (typeof KMAT !== 'undefined' && KMAT.bindMat) KMAT.bindMat('iziz', MAT, { tile: KMAT.ANCIENT_TILES });
/* IZV.proto(key, v, w): the def built once at the origin on flat ground into a new group, its kit items baked */
function izvProto(key, v, w) {
  var D = VERN.defs[key]; if (!D) return null;
  var G = new THREE.Group(); G.name = key + '#' + (v | 0); var r0 = REG.length;
  withFlatGround(function () { VERN.place(G, key, 0, 0, 0, { y: 0, v: v | 0, w: w == null ? 1 : w }); });
  kbake(G); REG.length = r0;
  G.userData = { key: key, v: v | 0, w: D.w, d: D.d, h: D.h };
  return G;
}
function izvDims() { var out = {}; VERN.order.forEach(function (k) { var D = VERN.defs[k]; out[k] = { w: D.w, d: D.d, h: D.h || 8, name: D.name, family: D.family, types: [].concat(D.tags.type || []), wealth: D.tags.wealth, variants: D.variants || 2 }; }); return out; }
return { proto: izvProto, dims: izvDims, VERN: VERN, MAT: MAT, errors: IZV_ERRS };
'''


def izv_bundle():
    fs = izv_files()
    return safe('/* IZV: the Iziz Vernacular and its Ancients core in one closure (settlements/isle-demo/bundles.py). GENERATED: '
                'edit settlements/iziz/src or core/materials. */' + NL + 'var IZV = (function(){' + NL + IZV_HEAD + body(fs) + IZV_TAIL +
                '})();' + NL), [rel(f) for f in fs]


# ---------------------------------------------------------------- the Beast Riders' buildings
# Ridertown's: the Beast Riders kit's own (kits/beast-riders src/50-br-mounts.js: the stables, the byre, the rookery tower)
# and its ports of Girder's and Mav's Refuge's own buildings (br_port_*: the towns' engines sealed by
# kits/beast-riders/towns.py, registered by src/60-br-ports.js), on the catalog's core. The catalog's hand-made copies
# (krator-master-buildings-beast-rider.js) are no longer taken.
BR = os.path.join(ROOT, 'kits', 'beast-riders')
CAT_FILES = [os.path.join(ROOT, 'kits', 'catalog', 'krator-furniture-core.js'), os.path.join(BR, 'src', '50-br-mounts.js')]
CAT_PORTS = os.path.join(BR, 'src', '60-br-ports.js')


def cat_bundle(side=None):
    """CAT: the catalog's geometry kit, the Beast Riders kit's own buildings and its ports (the two towns sealed, their
    maps BR_TOWN_IMG: in side['brtowns'] when side is given, a sidecar file), sealed; CAT.proto(key, v) builds one at the
    origin into a new group (no furniture: the catalog's pieces are not on this page; a port keeps the furniture its
    town drew into it), its userData.port set for a port (src/60-isle-draw.js draws its materials as the town does)"""
    if BR not in sys.path:
        sys.path.insert(0, BR)
    import towns
    tjs, tfiles = towns.bundle(side)
    return safe('/* CAT: the Beast Riders\' buildings in one closure (settlements/isle-demo/bundles.py). GENERATED: edit kits/catalog, '
                'kits/beast-riders and the towns (kits/beast-riders/towns.py). */' + NL +
                'var CAT = (function(){' + NL + 'var scene = new THREE.Group();' + NL + body(CAT_FILES) +
                '/* ---- the towns sealed (GENERATED: kits/beast-riders/towns.py) ---- */' + NL + tjs + NL + body([CAT_PORTS]) +
                'function catProto(key, v) { if (!ASSET_BY_KEY[key]) return null; var g = buildAsset(key, 0, 0, 0, { variant: v | 0, seed: 1, y: 0 }); if (!g) return null;' + NL +
                '  scene.remove(g); INSTANCES.length = 0; var A = ASSET_BY_KEY[key]; g.userData = { key: key, v: v | 0, w: A.w, d: A.d, h: A.h, error: g.userData.error, port: A.port || null }; return g; }' + NL +
                'return { proto: catProto, ASSET_BY_KEY: ASSET_BY_KEY, PORTS: BR_PORTS };' + NL + '})();' + NL), [rel(f) for f in CAT_FILES] + tfiles + [rel(CAT_PORTS)]


# ---------------------------------------------------------------- the Ring Sea vessels
# PLAN.md section 8a: the Islanders' warships (military harbour), the fishing craft and the six origins of the trading
# vessels (civilian harbour). "Islander extraction" is read as the lakatoi, the Islanders' own bulk carrier (owner to confirm)
VESSELS = ['88-rs-islander-drua.js', '89-rs-islander-korakora.js', '70-rs-islander-karakoa.js', '89b-rs-islander-lanong.js',
           '69-rs-islander-oruwa.js', '76-rs-islander-lakatoi.js',
           '87-rs-voth-dhow.js', '81-rs-voth-junk.js', '77-rs-voth-hulk.js', '85-rs-voth-barge.js',
           '78-rs-hyk-corbita.js', '65-rs-hyk-galley.js', '73-rs-hyk-pearl.js',
           '68-rs-iziz-dhoni.js', '80-rs-iziz-lighter.js', '61-rs-iziz-turtle.js',
           '64-rs-beast-waa.js', '75-rs-beast-rookery.js', '66-rs-salvage-tug.js']


def ringsea_fragment():
    sys.path.insert(0, os.path.join(ROOT, 'settlements', 'voth'))
    import ringsea
    ringsea.VESSELS = VESSELS
    return safe(ringsea.ringsea_fragment()), [rel(os.path.join(ringsea.RS_SRC, f)) for f in VESSELS] + ['settlements/voth/ringsea.py']


if __name__ == '__main__':
    for name, fn in (('KCITY', kcity_bundle), ('ISK', isk_bundle), ('IZV', izv_bundle), ('RINGSEA', ringsea_fragment)):
        r = fn()
        s = r[0] if isinstance(r, tuple) else r
        print('%-8s %6d KB' % (name, len(s) // 1024))
