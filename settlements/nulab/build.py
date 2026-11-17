#!/usr/bin/env python3
"""Nulab, the Realm of Dalab's city on the West Rift's great lake (PLAN.md, step N3 with N2's ground and N5's near ring).

The town is a target on Xanadu's page, as Kirstabal's and Thalaba's are: settlements/xanadu/build.py --kit takes this folder's
kit.json, src/ and targets/. Its buildings are the Dalab set's (settlements/dalab/src, read in place through kit.json
"external", as Thalaba reads three of them); Dalab's texture pack is trimmed to the families those pieces draw
(DALAB_FAMILIES, gen/69n3-dalab-pack.js), because the whole pack (16.8 MB) would pass the page cap. core/space, core/city
and core/hamlet (with the opt-in Dalab row, core/hamlet/dalab) are sealed in one closure (gen/69n-kcity-bundle.js), because
Xanadu's page keeps core/space out of its global scope; core/biome and riftrim's veiled rim in another (gen/69n2-nl-flora-bundle.js),
because the page runs its own vendored biome core. core/atmos, core/water and core/drawn come in through kit.json "files".
Everything in gen/ is written here at every build, never edited by hand.

    python3 ../../tools/build.py settlements/nulab     # dist/nulab.html (a plain python3 build.py comes through it)
    python3 build.py --bake-model                     # rewrite src/39n-nl-model.js from the scale model
    node test-nl-town.js                              # the town, the ring and the sim's records, without a browser
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
              'core/drawn', 'core/biome')   # through Xanadu's build, kit.json and gen/

CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js']
HAMLET_JS = ['10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js', '16-hamlet-names.js', '18-hamlet-names.js',
             '20-hamlet-cultures.js', 'dalab/23-hamlet-dalab.js', '30-hamlet-village.js']
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
MODEL = os.path.join(HERE, 'src', '39n-nl-model.js')


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
# No texture pack: the kit keeps its procedural textures here (KNOWN_ISSUES.md)
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


# Dalab's own surfaces the town's pieces draw (the rest of its keys are Xanadu's shared ones: wood, stone, plaster, which the
# Xanadu pack textures): the rammed earth and the eroded banco of the peasants' walls, the rendered stone and the dressed
# blocks of the nobles and priests, the turf roofs, the plain relief, the banners, and the priests' mural. The page cap (16 MB)
# leaves out the chevron and tile reliefs, the harlequin checker and the other murals: those keys keep the Dalab set's own
# canvas textures (69d), as on Thalaba's page (KNOWN_ISSUES.md)
DALAB_FAMILIES = ('dRammed', 'dBancoE', 'dRender', 'dBlock', 'dTurf', 'dRelief', 'dBanner', 'dMural6')


def dalab_pack():
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    d = os.path.join(ROOT, 'settlements', 'dalab')
    fams = json.load(io.open(os.path.join(d, 'tex', 'pack.json'), encoding='utf-8'))['families']
    return ('/* the Dalab pack, trimmed to the families Nulab\'s pieces draw (settlements/nulab/build.py DALAB_FAMILIES). GENERATED. */\n'
            + matlib_pack.fragment(d, 'dalab', exclude=tuple(k for k in fams if k not in DALAB_FAMILIES)))


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69n-kcity-bundle.js', kcity_bundle), ('69n2-nl-flora-bundle.js', flora_bundle), ('69n3-dalab-pack.js', dalab_pack)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS] +
            ['core/biome/' + f for f in FLORA_CORE] + ['biomes/riftrim/src/' + f for f in RIM_JS] + ['settlements/dalab/tex/pack.json'] +
            ['settlements/dalab/tex/%s.%s.webp' % (f, m) for f in DALAB_FAMILIES for m in ('albedo', 'normal', 'rough')]))
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
