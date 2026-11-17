#!/usr/bin/env python3
"""Nulab, the Realm of Dalab's city on the West Rift's great lake (PLAN.md, steps N1-N5).

The town is a target on Xanadu's page, as Kirstabal's and Thalaba's are: settlements/xanadu/build.py --kit takes this folder's
kit.json, src/ and targets/. Its buildings are the Dalab set's (settlements/dalab/src and opt/75-dalab-lake-works.js, read in
place through kit.json "external"); Dalab's 23 d* texture families are written as a sidecar script beside the page
(dist/nulab.tex.dalab.js via SIDE, alongside kit.json "sidePacks": true), keeping dist/nulab.html well under the 16 MB page cap
while binding all Dalab reliefs, checker tiles and murals. core/space, core/city and core/hamlet (with core/hamlet/dalab) are
sealed in gen/69n-kcity-bundle.js; core/biome and riftrim's veiled rim in gen/69n2-nl-flora-bundle.js; and kits/ringsea's core
with Dalab's three lake hulls (kits/ringsea/opt/90..92) in gen/69n4-nl-ringsea-bundle.js. Everything in gen/ is written here at
every build, never edited by hand.

    python3 ../../tools/build.py settlements/nulab     # dist/nulab.html (a plain python3 build.py comes through it)
    python3 build.py --bake-model                     # rewrite src/39n-nl-model.js from the scale model
    node test-nl-town.js                              # the town, the ring, the boats and the sim's records, without a browser
    KRATOR_GL=gpu python3 verify.py dist/nulab.html --assert --views "Overview,The mound"
"""
import io, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
if '--bake-model' not in sys.argv:
    buildlib.through_tools_build(__file__)        # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/hamlet', 'core/atmos', 'core/water',
              'core/drawn', 'core/biome', 'core/ruins', 'core/terrain')   # through Xanadu's build, kit.json and gen/

CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js']
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', 'dalab/23-hamlet-dalab.js', '30-hamlet-village.js']
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
DIST = os.path.join(HERE, 'dist')
MODEL = os.path.join(HERE, 'src', '39n-nl-model.js')
SIDE = None if '--inline-packs' in sys.argv else {}


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    """core/space, core/city and core/hamlet in one closure (Kirstabal's kcity_bundle, with the Dalab row): the closure hands
    them a window of their own (Object.create(window)), so KSPACE stays inside; KCITY.lib names what the town's site steps use."""
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    return ('/* KCITY, KHAMLET: core/space, core/city and core/hamlet (with its opt-in Dalab row) in one closure (settlements/nulab/build.py). '
            'GENERATED: edit core/city, core/hamlet. */\n'
            'var NL_CORE = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC,\n'
            '  obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, resample: resample, clamp: clamp, inPoly: inPoly,\n'
            '  cg: function () { return CG; } };\n'
            'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n'
            'var KCITY = NL_CORE.KCITY, KHAMLET = NL_CORE.KHAMLET;\n')


# the model's cells round the town: the basin, the lake to Ledge's cliff (437,1330), the walls west (411), south (1391) and east (477)
BOX = (405, 1318, 81, 82)   # px0, py0, nx, ny


def bake_model():
    """The scale model 5.1's ground round Nulab (2 km a pixel): heights in metres (absolute) and the water flag, px 405..485 x
    1318..1399. A [G data] fragment, committed; 40-nl-ground.js reads it through Catmull-Rom, as Kirstabal's does."""
    from PIL import Image
    D = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    H = Image.open(os.path.join(D, 'h.png')).convert('RGB').load()
    x0, y0, nx, ny = BOX
    hs, wet = [], []
    for y in range(y0, y0 + ny):
        for x in range(x0, x0 + nx):
            r, g, b = H[x, y]
            hs.append(int(round((r * 256 + g) / 65535 * 29600 - 2600)))
            wet.append(1 if b > 127 else 0)
    rows = ',\n '.join(','.join(str(v) for v in hs[i * nx:(i + 1) * nx]) for i in range(ny))
    js = ('// ================================================================= NULAB — the scale model round the town (GENERATED)\n'
          '// [G data] `python3 build.py --bake-model` writes this from tools/scale-model/model/data/h.png (5.1, 2 km a pixel):\n'
          '// heights in metres (absolute; the great lake stands at 297.4 m, wl.png) and the water flag (a water cell holds its bed),\n'
          '// px %d..%d x %d..%d, row by row (y), each row west to east (x). 40-nl-ground.js reads it.\n'
          'var NL_MODEL={px0:%d,py0:%d,nx:%d,ny:%d,cell:2000,lake:297.4,\n h:[%s],\n wet:"%s"};\n'
          % (x0, x0 + nx - 1, y0, y0 + ny - 1, x0, y0, nx, ny, rows, ''.join(str(v) for v in wet)))
    with io.open(MODEL, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('wrote', os.path.relpath(MODEL, ROOT).replace(os.sep, '/'))


if '--bake-model' in sys.argv:
    bake_model()
    sys.exit(0)


# THE VEILED RIM'S FLORA (biomes/riftrim, RRIM.biome('w'): PLAN.md section 3, the shore zone of the great lake's basin): today's
# core/biome and the rim kit sealed in one closure, as Kirstabal seals the Rift's, because Xanadu's page runs its own vendored
# biome core. The closure's BIO hides the page's; it exports NL_FLORA only (targets/town/90p-nl-flora.js binds the host and builds).
FLORA_CORE = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31-core-dither.js',
              '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js', '33b-core-bamboo.js',
              '34-core-impostor.js', '35-core-anim.js', '35b-core-anim-turn.js', '40-core-place.js']
RIM_JS = ['50-biome-riftrim-species.js', '55-biome-riftrim-trees.js', '60-biome-riftrim-floor.js', '70-biome-riftrim.js']


def flora_bundle():
    part = lambda rel: '/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = ('/* the bootstrap: THREE before the kit loads; the town binds its scene, ground and fields later (90p-nl-flora.js) */\n'
            'BIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
            '  ticks: function (fn) { var last = null; (window._frameHooks = window._frameHooks || []).push(function (now) { var t = now / 1000, '
            'dt = last == null ? 0.016 : Math.min(0.1, t - last); last = t; fn(dt, t); }); },\n'
            '  seed: 44310, origin: [[0, 0]], center: [0, 0], fields: {} });\n')
    return ('/* NL_FLORA: core/biome and the rift rim kit in one closure (settlements/nulab/build.py). GENERATED: edit core/biome and biomes/riftrim. */\n'
            'var NL_FLORA = (function (window) {\n' +
            "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });   /* the closure's own BIO, on its own window */\n" +
            part(SPACE) + "var KSPACE = window.KSPACE;   /* core/biome's placer reads core/space (40-core-place.js) */\n" +
            ''.join(part('core/biome/' + f) for f in FLORA_CORE) + boot +
            'var RRIM = (function () {\n' + ''.join(part('biomes/riftrim/src/' + f) for f in RIM_JS) + '\nreturn RRIM;\n})();\n' +
            'return { BIO: BIO, reseed: reseed, RRIM: RRIM };\n})(Object.create(window));\n')


# DALAB'S THREE LAKE HULLS (kits/ringsea, sealed in their own closure as settlements/voth/ringsea.py seals Voth's ships):
# dalabLakeFerry (90), dalabGrainBarge (91) and dalabFishingBoat (92), read live from kits/ringsea/src and kits/ringsea/opt.
RS_KIT_FILES = ['kits/ringsea/src/10-core.js', 'kits/ringsea/src/12-stats.js', 'core/materials/20-textures.js',
                'core/materials/22-materials.js', 'kits/ringsea/src/30-kit.js', 'kits/ringsea/src/40-rs-core.js',
                'kits/ringsea/src/41-rs-tex.js', 'kits/ringsea/src/42-rs-hull.js', 'kits/ringsea/src/43-rs-rig.js',
                'kits/ringsea/src/44-rs-parts.js']
RS_VESSELS = ['kits/ringsea/opt/90-rs-dalab-ferry.js', 'kits/ringsea/opt/91-rs-dalab-barge.js', 'kits/ringsea/opt/92-rs-dalab-skiff.js']


def ringsea_bundle():
    h = rd('kits/ringsea/src/00-head.html')
    head_js = h[h.rindex('<script>') + len('<script>'):].replace('</script>', '')
    parts = [head_js] + ['/* ---- %s ---- */\n%s' % (rel, rd(rel)) for rel in RS_KIT_FILES + RS_VESSELS]
    js = ('\n'.join(parts)
          .replace("const ERRS=document.getElementById('errs');", '')
          .replace("window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));", ''))
    return ('/* NL_RINGSEA: kits/ringsea core and Dalab\'s three lake hulls in one closure (settlements/nulab/build.py, after voth/ringsea.py). GENERATED. */\n'
            'var NL_RINGSEA = { keys: [], dims: {}, tags: {}, make: function () { return null; }, tick: function () {} };\n'
            '(function () {\n'
            '  var __own = { addEventListener: function () {}, onerror: null };\n'
            '  var window = new Proxy(globalThis.window, { get: function (t, k) { if (k in __own) return __own[k]; var v = t[k]; '
            'return typeof v === "function" && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },\n'
            '    set: function (t, k, v) { __own[k] = v; return true; }, has: function (t, k) { return k in __own || k in t; } });\n'
            '  var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };\n'
            '  var ERRS = { style: {}, textContent: "" };\n' +
            js + '\n'
            '  function reportErr(m) { if (typeof console !== "undefined") console.error("NL_RINGSEA: " + m); }\n'
            '  var made = {};\n'
            '  NL_RINGSEA.keys = RS.order.slice();\n'
            '  RS.order.forEach(function (k) { var D = RS.defs[k]; NL_RINGSEA.dims[k] = { L: D.L, B: D.B, H: D.H, name: D.name }; NL_RINGSEA.tags[k] = D.tags || {}; });\n'
            '  NL_RINGSEA.make = function (key) {\n'
            '    var D = RS.defs[key]; if (!D) return null;\n'
            '    if (!made[key]) {\n'
            '      try {\n'
            '        var r = D.build(), tris = 0, meshes = 0;\n'
            '        r.group.traverse(function (o) { if (o.isMesh && o.geometry) { meshes++; var g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });\n'
            '        made[key] = { group: r.group, deckY: r.deckY, tris: Math.round(tris), meshes: meshes };\n'
            '      } catch (e) { reportErr(key + ": " + (e.stack || e)); made[key] = { error: String(e) }; }\n'
            '    }\n'
            '    var M = made[key]; if (!M.group) return null;\n'
            '    var g = M.group.clone(); g.userData = { kind: "vessel", key: key, deckY: M.deckY };\n'
            '    return { group: g, deckY: M.deckY, tris: M.tris, meshes: M.meshes };\n'
            '  };\n'
            '  NL_RINGSEA.tick = function (t) { RS_U.uTime.value = t; };\n'
            '})();\n')


# All 23 Dalab-specific d* texture families in settlements/dalab/tex/pack.json (the shared vernacular wood/stone/plaster keys
# come from Xanadu's pack), written beside the page into dist/nulab.tex.dalab.js via SIDE so dist/nulab.html stays compact.
_DALAB_PACK_JSON = json.load(io.open(os.path.join(ROOT, 'settlements', 'dalab', 'tex', 'pack.json'), encoding='utf-8'))
DALAB_FAMILIES = tuple(sorted(k for k in _DALAB_PACK_JSON['families'] if k.startswith('d')))


def dalab_pack():
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    d = os.path.join(ROOT, 'settlements', 'dalab')
    fams = _DALAB_PACK_JSON['families']
    return ('/* the Dalab pack: all d* families, maps beside the page in nulab.tex.dalab.js (settlements/nulab/build.py). GENERATED. */\n'
            + matlib_pack.fragment(d, 'dalab', exclude=tuple(k for k in fams if k not in DALAB_FAMILIES), side=SIDE))


# STEP N6: KTRANSIT + Rift Line (`line` kind in kits/ancient-transit/opt) + KratorTransitFurniture, and kits/tungang + opt/ (`tg` loj set)
TR_OPT_FILES = ['kits/ancient-transit/opt/40b-tr-line-compat.js', 'kits/ancient-transit/opt/43c-tr-line.js',
                'kits/ancient-transit/opt/56c-tr-draw-line.js']
TG_OPT_FILES = ['kits/tungang/opt/44-tg-kit.js', 'kits/tungang/opt/46-tg-homes.js', 'kits/tungang/opt/48-tg-civic.js',
                'kits/tungang/opt/56-tg-works.js', 'kits/tungang/opt/82-tg-host.js']


def _safe_js(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def transit_bundle_gen():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'ancient-transit'))
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import transit_bundle, matlib_pack
    pack_js = matlib_pack.fragment(os.path.join(ROOT, 'kits', 'ancient-transit'), 'ancient-transit', side=SIDE)
    data_frags = transit_bundle.fragments(data_only=True)
    draw_frags = [x for x in transit_bundle.fragments(data_only=False) if x not in data_frags]
    body = [pack_js]
    for name, path in data_frags:
        with io.open(path, encoding='utf-8') as fh:
            body.append('/* ---- kits/ancient-transit/src/%s ---- */\n%s' % (name, fh.read()))
    for rel in TR_OPT_FILES[:2]:
        body.append('/* ---- %s ---- */\n%s' % (rel, rd(rel)))
    for name, path in draw_frags:
        with io.open(path, encoding='utf-8') as fh:
            body.append('/* ---- kits/ancient-transit/src/%s ---- */\n%s' % (name, fh.read()))
    body.append('/* ---- %s ---- */\n%s' % (TR_OPT_FILES[2], rd(TR_OPT_FILES[2])))
    furn_js = transit_bundle.furniture().replace('window.KTRANSIT', 'KTRANSIT').replace('window.KratorTransitFurniture', 'KratorTransitFurniture')
    body.append(furn_js)
    return _safe_js('/* KTRANSIT + Rift line kind + KratorTransitFurniture (settlements/nulab/build.py, step N6). GENERATED. */\n'
                    'var NL_TRANSIT = (function () {\n'
                    '  var KSPACE = KCITY.lib.KSPACE;\n' +
                    '\n'.join(body) +
                    '\n  return { KTRANSIT: KTRANSIT, KratorTransitFurniture: KratorTransitFurniture };\n'
                    '})();\n'
                    'var KTRANSIT = NL_TRANSIT.KTRANSIT, KratorTransitFurniture = NL_TRANSIT.KratorTransitFurniture;\n')


def tungang_bundle_gen():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang'))
    import tungang_bundle as tb
    fs = tb.files()
    for rel in TG_OPT_FILES:
        fs[os.path.basename(rel)] = os.path.join(ROOT, *rel.split('/'))
    names = sorted(list(fs) + ['26-matlib-pack.js'])
    body = 'var _tgWin = window;\n'
    for n in names:
        if n == '26-matlib-pack.js':
            body += '/* ---- kits/tungang/tex (lean sidecar pack) ---- */\n' + tb.pack(tex='lean', side=SIDE) + '\n'
        else:
            chunk = (tb.rd(fs[n])
                     .replace('window.KMAT = KMAT', '_tgWin.KMAT = KMAT')
                     .replace('window._texPending = 0', '_tgWin._texPending = 0')
                     .replace('window.onerror=', '_tgWin.onerror='))
            body += '/* ---- %s ---- */\n%s\n;\n' % (tb.rel(fs[n]), chunk)
    return tb.safe('/* TG: kits/tungang + opt/ tg loj set in one closure (settlements/nulab/build.py, step N6). GENERATED. */\n'
                   'var TG = (function(){\n' + tb.HEAD + tb.furn_text(True) + body + tb.TAIL + '})();\n')


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69n-kcity-bundle.js', kcity_bundle), ('69n2-nl-flora-bundle.js', flora_bundle),
                       ('69n3-dalab-pack.js', dalab_pack), ('69n4-nl-ringsea-bundle.js', ringsea_bundle),
                       ('69n5-nl-transit-bundle.js', transit_bundle_gen), ('69n6-nl-tungang-bundle.js', tungang_bundle_gen)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


_dalab_webp = [p for f in DALAB_FAMILIES for p in [os.path.join('settlements', 'dalab', 'tex', '%s.%s.webp' % (f, m)).replace(os.sep, '/')
                                                   for m in ('albedo', 'normal', 'rough')] if os.path.exists(os.path.join(ROOT, *p.split('/')))]
sys.path.insert(0, os.path.join(ROOT, 'kits', 'ancient-transit'))
sys.path.insert(0, os.path.join(ROOT, 'kits', 'tungang'))
import transit_bundle as _trb, tungang_bundle as _tgb   # noqa: E402
_tr_srcs = ([os.path.relpath(p, ROOT).replace(os.sep, '/') for _, p in _trb.fragments(data_only=False)] +
            [os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/') for d, f in _trb.files()] +
            TR_OPT_FILES + ['kits/ancient-transit/transit_bundle.py', 'kits/ancient-transit/tex/pack.json'])
_tg_srcs = ([_tgb.rel(p) for p in _tgb.files().values()] + TG_OPT_FILES +
            ['kits/tungang/tungang_bundle.py', 'kits/tungang/tex/pack.json'])
BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS] +
            ['core/biome/' + f for f in FLORA_CORE] + ['biomes/riftrim/src/' + f for f in RIM_JS] +
            ['kits/ringsea/src/00-head.html'] + RS_KIT_FILES + RS_VESSELS +
            _tr_srcs + _tg_srcs + ['settlements/dalab/tex/pack.json'] + _dalab_webp))
if not BSRC.LISTING:
    write_gen()

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
    if SIDE and not BSRC.LISTING:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack
        _page = os.path.join(DIST, 'nulab.html')
        with io.open(_page, encoding='utf-8') as fh:
            _html = fh.read()
        if '<script src="nulab.tex.dalab.js">' not in _html:
            _html = matlib_pack.write_sidecar(SIDE, _html, DIST, 'nulab.tex.js', prune=True)
            with io.open(_page, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(_html)
sys.exit(_rc)
