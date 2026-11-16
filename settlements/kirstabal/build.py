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


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    out = os.path.join(GEN, '69k-kcity-bundle.js')
    new = kcity_bundle()
    old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
    if old != new:
        with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + ['core/hamlet/' + f for f in HAMLET_JS]))
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
