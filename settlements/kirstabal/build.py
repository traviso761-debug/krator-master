#!/usr/bin/env python3
"""Kirstabal, the Scarp's barge port at the head of the Lower Xanadu Lake (PLAN.md, steps K2-K4).

The town is a target on Xanadu's page, as Qiblai's city is (settlements/qiblai): settlements/xanadu/build.py --kit takes this
folder's kit.json, src/ and targets/, and the town uses only the normal Xanadu kit (the owner, 2026-11-16: "make it a target on
xanadu's page, it will use just the normal xanadu kit"). core/city, core/space and core/hamlet are sealed in one closure
(gen/69k-kcity-bundle.js, generated here at every build, never edited by hand), because Xanadu's page keeps core/space out of
its global scope; KCITY.lib hands the town's site steps what core/city's own steps use. core/atmos, core/water and core/drawn
come in through kit.json "files".

    python3 build.py                     # dist/kirstabal.html (through tools/build.py: build-inputs.json is written)
    python3 build.py --bake-model        # rewrite src/39k-ks-model.js from the scale model (tools/scale-model/model/data)
    KRATOR_GL=gpu python3 verify.py dist/kirstabal.html --assert --views "Overview,The harbour"
    node test-ks-town.js                 # the town's records on core/city and core/hamlet, without a browser
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
if '--bake-model' not in sys.argv:
    buildlib.through_tools_build(__file__)        # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/hamlet', 'core/atmos', 'core/water',
              'core/drawn', 'core/biome')   # through Xanadu's build, kit.json and gen/

CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js']
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', '30-hamlet-village.js']
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
MODEL = os.path.join(HERE, 'src', '39k-ks-model.js')


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    """core/space, core/city and core/hamlet in one closure (settlements/qiblai/build.py's kcity_bundle, with core/hamlet):
    the closure hands them a window of their own (Object.create(window)), so KSPACE stays inside; KCITY.lib names what a
    world's site steps use, read through functions where core/city rebinds them (PLAN, TUNE: KCITY.bind)."""
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    return ('/* KCITY, KHAMLET: core/space, core/city and core/hamlet in one closure (settlements/kirstabal/build.py). '
            'GENERATED: edit core/city, core/hamlet. */\n'
            'var KS_CORE = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC,\n'
            '  obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, resample: resample, clamp: clamp, inPoly: inPoly,\n'
            '  cg: function () { return CG; } };\n'
            'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n'
            'var KCITY = KS_CORE.KCITY, KHAMLET = KS_CORE.KHAMLET;\n')


def bake_model():
    """The scale model's ground round the town (5.1, 2 km a pixel): heights above the Lower Xanadu Lake's level and the water
    flag, px 925..1009 x 1580..1619 (the whole Lower Xanadu Lake), for the page's far field and the lake's villages. A [G data] fragment, committed."""
    from PIL import Image
    D = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    H = Image.open(os.path.join(D, 'h.png')).convert('RGB').load()
    x0, y0, nx, ny, lake = 925, 1580, 85, 40, -1685   # the town (988,1599) to the lake's far end (934), the Landing and Qiblai's cataracts
    hs, wet = [], []
    for y in range(y0, y0 + ny):
        for x in range(x0, x0 + nx):
            r, g, b = H[x, y]
            hs.append(int(round((r * 256 + g) / 65535 * 29600 - 2600 - lake)))
            wet.append(1 if b > 127 else 0)
    rows = ',\n '.join(','.join(str(v) for v in hs[i * nx:(i + 1) * nx]) for i in range(ny))
    js = ('// ================================================================= KIRSTABAL — the scale model round the town (GENERATED)\n'
          '// [G data] `python3 build.py --bake-model` writes this from tools/scale-model/model/data/h.png (5.1, 2 km a pixel):\n'
          '// heights in metres above the Lower Xanadu Lake (its level -1,685 m: wl.png) and the water flag, px %d..%d x %d..%d,\n'
          '// row by row (y), each row west to east (x). The page\'s far field and the town\'s frame read it (40-ks-ground.js).\n'
          'var KS_MODEL={px0:%d,py0:%d,nx:%d,ny:%d,cell:2000,lake:%d,\n h:[%s],\n wet:"%s"};\n'
          % (x0, x0 + nx - 1, y0, y0 + ny - 1, x0, y0, nx, ny, lake, rows, ''.join(str(v) for v in wet)))
    with io.open(MODEL, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('wrote', os.path.relpath(MODEL, ROOT).replace(os.sep, '/'))


if '--bake-model' in sys.argv:
    bake_model()
    sys.exit(0)


# THE RIFT FLOOR'S FLORA (the owner, 2026-11-16: "implement rift climate"): today's core/biome and the Rift kit (biomes/rift, read in
# place) sealed in one closure, as settlements/qiblai/build.py seals its gardens' kits, because Xanadu's page runs its own vendored
# biome core (version 'xanadu-1', without BIO.kit, kin or impostors). The closure's BIO hides the page's; it hands its files a window
# of its own (Object.create(window)) carrying that BIO; it exports KS_FLORA only (targets/town/90m-ks-flora.js binds the host and
# builds). No texture pack: the Rift kit keeps its procedural textures here, as in the open world (its pack inline would pass the
# page cap of 16 MB; KNOWN_ISSUES.md)
FLORA_CORE = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31-core-dither.js',
              '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js', '33b-core-bamboo.js',
              '34-core-impostor.js', '35-core-anim.js', '35b-core-anim-turn.js', '40-core-place.js']
RIFT_JS = ['50-biome-rift-species.js', '52-biome-rift-library.js', '55-biome-rift-trees.js', '60-biome-rift-floor.js',
           '65-biome-rift-dress.js', '70-biome-rift.js']


def flora_bundle():
    part = lambda rel: '/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = ('/* the bootstrap: THREE before the kit loads (its fragment 50 makes textures); the town binds its scene, ground and '
            'climate later (90m-ks-flora.js) */\n'
            'BIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
            '  ticks: function (fn) { var last = null; (window._frameHooks = window._frameHooks || []).push(function (now) { var t = now / 1000, '
            'dt = last == null ? 0.016 : Math.min(0.1, t - last); last = t; fn(dt, t); }); },\n'
            '  seed: 41630, origin: [[0, 0]], center: [0, 0], fields: {} });\n'
            'var RIFT_LAKE = { hue: 0.32 };   /* the Lower Xanadu Lake: fresh, green-brown */\n')
    return ('/* KS_FLORA: core/biome and the Rift kit in one closure (settlements/kirstabal/build.py). GENERATED: edit core/biome and biomes/rift. */\n'
            'var KS_FLORA = (function (window) {\n' +
            "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });   /* the closure's own BIO, on its own window */\n" +
            ''.join(part('core/biome/' + f) for f in FLORA_CORE) + boot +
            'var RIFT = (function () {\n' + ''.join(part('biomes/rift/src/' + f) for f in RIFT_JS) + '\nreturn RIFT;\n})();\n' +
            'return { BIO: BIO, reseed: reseed, RIFT: RIFT };\n})(Object.create(window));\n')


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69k-kcity-bundle.js', kcity_bundle), ('69k2-ks-flora-bundle.js', flora_bundle)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS] +
            ['core/biome/' + f for f in FLORA_CORE] + ['biomes/rift/src/' + f for f in RIFT_JS]))
if not BSRC.LISTING:
    write_gen()

if '--no-checks' not in sys.argv:
    if subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

_rc = subprocess.call([sys.executable, os.path.join(ROOT, 'settlements', 'xanadu', 'build.py'), '--kit', HERE] + sys.argv[1:],
                      cwd=os.path.join(ROOT, 'settlements', 'xanadu'))
if not _rc:
    BSRC.report()
sys.exit(_rc)
