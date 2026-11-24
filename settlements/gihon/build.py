#!/usr/bin/env python3
"""Gihon, the Lower Lake's garrison town at the Opal River's mouth (PLAN.md, steps G2-G3).

The town is a target on Xanadu's page, as Kirstabal's is (settlements/kirstabal): settlements/xanadu/build.py --kit takes this
folder's kit.json, src/ and targets/. It uses the normal Xanadu kit with its opt-in pieces read in place (kit.json "external":
the lake trades, the slate wall, the harbour, the lake craft, the works, and Gihon's own pieces in kits/xanadu/extra/88h), and
the fort asset (kits/xanadu 80f/80g) for the forbidden city's wall. core/city, core/space and core/hamlet (with the Xanadu row
passed by name, core/hamlet/xanadu/23) are sealed in one closure (gen/69g-kcity-bundle.js, generated here at every build, never
edited by hand); the Rift floor's flora as Kirstabal's (gen/69g2-gh-flora-bundle.js). The ground's library sets are Kirstabal's
pack, read in place (kit.json "packFrom"). core/atmos, core/water and core/drawn come in through kit.json "files".

    python3 tools/build.py settlements/gihon       # dist/gihon.html (build-inputs.json is written)
    python3 build.py --bake-model                  # rewrite src/39g-gh-model.js from the scale model
    KRATOR_GL=gpu python3 verify.py dist/gihon.html --assert --views "Overview,The forbidden city"
    node test-gh-town.js                           # the town, the forbidden city, the ring; the Landing and the Alph (G3)
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
           '32-city-steps-c.js', '33-city-strategies.js', '37-city-grid.js', '40-city-kcity.js']
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', '30-hamlet-village.js']   # the Xanadu row by name is in 20 (Stage 8 B8)
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
MODEL = os.path.join(HERE, 'src', '39g-gh-model.js')


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    """core/space, core/city and core/hamlet (with the Xanadu row by name) in one closure (Kirstabal's kcity_bundle): the closure
    hands them a window of their own (Object.create(window)), so KSPACE stays inside; KCITY.lib names what the town's site steps
    use, read through functions where core/city rebinds them."""
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    for f in HAMLET_JS:
        body += '\n/* ---- core/hamlet/%s ---- */\n%s\n' % (f, rd('core/hamlet/' + f))
    return ('/* KCITY, KHAMLET: core/space, core/city and core/hamlet in one closure (settlements/gihon/build.py). '
            'GENERATED: edit core/city, core/hamlet. */\n'
            'var GH_CORE = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, tune: function () { return TUNE; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC,\n'
            '  obb: obb, obbCorners: obbCorners, segDist: segDist, polySegDist: polySegDist, resample: resample, clamp: clamp, inPoly: inPoly,\n'
            '  cg: function () { return CG; } };\n'
            'return { KCITY: KCITY, KHAMLET: KHAMLET };\n})(Object.create(window));\n'
            'var KCITY = GH_CORE.KCITY, KHAMLET = GH_CORE.KHAMLET;\n')


def bake_model():
    """The scale model's ground (5.1, 2 km a pixel) round the town, the Landing, the Alph up to Theodiga and Strongwall: heights
    above the Lower Xanadu Lake's level and the water flag, px 900..1004 x 1530..1645. A [G data] fragment, committed."""
    from PIL import Image
    D = os.path.join(ROOT, 'tools', 'scale-model', 'model', 'data')
    H = Image.open(os.path.join(D, 'h.png')).convert('RGB').load()
    x0, y0, nx, ny, lake = 900, 1530, 105, 116, -1685
    hs, wet = [], []
    for y in range(y0, y0 + ny):
        for x in range(x0, x0 + nx):
            r, g, b = H[x, y]
            hs.append(int(round((r * 256 + g) / 65535 * 29600 - 2600 - lake)))
            wet.append(1 if b > 127 else 0)
    rows = ',\n '.join(','.join(str(v) for v in hs[i * nx:(i + 1) * nx]) for i in range(ny))
    js = ('// ================================================================= GIHON — the scale model round the town (GENERATED)\n'
          '// [G data] `python3 build.py --bake-model` writes this from tools/scale-model/model/data/h.png (5.1, 2 km a pixel):\n'
          '// heights in metres above the Lower Xanadu Lake (its level -1,685 m) and the water flag, px %d..%d x %d..%d (Gihon, the\n'
          '// Landing, the Alph up to Theodiga, Strongwall), row by row (y), each row west to east (x). 40-gh-ground.js reads it.\n'
          'var GH_MODEL={px0:%d,py0:%d,nx:%d,ny:%d,cell:2000,lake:%d,\n h:[%s],\n wet:"%s"};\n'
          % (x0, x0 + nx - 1, y0, y0 + ny - 1, x0, y0, nx, ny, lake, rows, ''.join(str(v) for v in wet)))
    with io.open(MODEL, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(js)
    print('wrote', os.path.relpath(MODEL, ROOT).replace(os.sep, '/'))


if '--bake-model' in sys.argv:
    bake_model()
    sys.exit(0)

# THE RIFT FLOOR'S FLORA, as Kirstabal's (settlements/kirstabal/build.py: today's core/biome and the Rift kit sealed in one closure,
# because Xanadu's page runs its own vendored biome core); procedural textures (the pack inline would pass the page cap)
FLORA_CORE = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '30s-core-season-flush.js', '31-core-dither.js',
              '31b-core-leafset.js', '31j-core-joint.js', '32-core-variants.js', '33-core-fungoid.js', '33b-core-bamboo.js',
              '34-core-impostor.js', '35-core-anim.js', '35b-core-anim-turn.js', '40-core-place.js']
RIFT_JS = ['50-biome-rift-species.js', '52-biome-rift-library.js', '55-biome-rift-trees.js', '60-biome-rift-floor.js',
           '65-biome-rift-dress.js', '70-biome-rift.js']


def flora_bundle():
    part = lambda rel: '/* ---- %s ---- */\n%s\n' % (rel, rd(rel))
    boot = ('/* the bootstrap: THREE before the kit loads (its fragment 50 makes textures); the town binds its scene, ground and '
            'climate later (90i-gh-flora.js) */\n'
            'BIO.init({ THREE: THREE, scene: null, terrainH: function () { return 0; }, mask: function () { return 0; }, obstacles: [],\n'
            '  ticks: function (fn) { var last = null; (window._frameHooks = window._frameHooks || []).push(function (now) { var t = now / 1000, '
            'dt = last == null ? 0.016 : Math.min(0.1, t - last); last = t; fn(dt, t); }); },\n'
            '  seed: 41930, origin: [[0, 0]], center: [0, 0], fields: {} });\n'
            'var RIFT_LAKE = { hue: 0.32 };   /* the Lower Xanadu Lake: fresh, green-brown */\n')
    return ('/* GH_FLORA: core/biome and the Rift kit in one closure (settlements/gihon/build.py). GENERATED: edit core/biome and biomes/rift. */\n'
            'var GH_FLORA = (function (window) {\n' +
            "Object.defineProperty(window, 'BIO', { get: function () { return BIO; } });   /* the closure's own BIO, on its own window */\n" +
            ''.join(part('core/biome/' + f) for f in FLORA_CORE) + boot +
            'var RIFT = (function () {\n' + ''.join(part('biomes/rift/src/' + f) for f in RIFT_JS) + '\nreturn RIFT;\n})();\n' +
            'return { BIO: BIO, reseed: reseed, RIFT: RIFT };\n})(Object.create(window));\n')


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69g-kcity-bundle.js', kcity_bundle), ('69g2-gh-flora-bundle.js', flora_bundle)):
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
