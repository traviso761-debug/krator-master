#!/usr/bin/env python3
"""Phēr, the north shore's fair (PLAN.md, step P3): the town on core/city, on Xanadu's page.

The town is built on Xanadu's page, as Qiblai's city is (settlements/qiblai): settlements/xanadu/build.py --kit takes this
folder's kit.json and targets/, with core/city sealed in one closure (KCITY: gen/69p-kcity-bundle.js, generated here at
every build from core/city and core/space, never edited by hand). The bundle hands the town's plan (targets/town/
89zp-ph-site.js) the closure's own SL, Raster, OCC and obb through KCITY.lib, as tests/test-pher-site.js does in node.
The buildings are the Xanadu kit's (kits/xanadu, through the page); the page takes core/rand, core/tags, core/host,
core/door and core/atmos through Xanadu's build, core/city and core/space through the bundle (CORE_TAKEN names them for
tools/check_core_use.py).

    python3 tools/build.py settlements/pher            # dist/pher.html: the town
    node settlements/pher/tests/test-pher-site.js      # the plan in node
    KRATOR_GL=gpu python3 settlements/pher/verify.py settlements/pher/dist/pher.html --assert --views "Overview,From the cove"
"""
import io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/atmos')   # through Xanadu's build and gen/

# core/city in one closure (as settlements/qiblai/build.py's kcity_bundle): its globals stay inside, and so does core/space,
# which writes KSPACE onto `window` (the closure hands every module a window of its own). Every data fragment of core/city
# (the host fragments are the page's to draw, and this page draws its own: targets/town/90r)
CITY_JS = sorted(f for f in os.listdir(os.path.join(ROOT, 'core', 'city')) if f[:2].isdigit() and f.endswith('.js') and '-host-' not in f)
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
        if f == '10-city-core.js':
            body += 'globalThis.KCITY = KCITY;\n'
    return ('/* KCITY: core/city and core/space in one closure (settlements/pher/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, obb: obb, obbCorners: obbCorners };\n'
            'return KCITY;\n})(Object.create(window));\n')


# a core/biome fragment of buildlib.CORE_BIOME_MIN that Xanadu's page (its vendored src/86-bio-*) lacks, read from core
# at every build under a name that sorts it after its 86-bio-30 foliage (the page's order is by file name); it only adds
# to BIO at load (tools/check_assembly.py rule MINSET, item 26). 34-core-impostor is not taken: it calls BIO._newItem and
# BIO.kitKey, which only the current core/biome/20-core-kit.js defines, not the page's older copy (KNOWN_ISSUES.md)
BIO_MIN = {'86-bio-31b-core-leafset.js': 'core/biome/31b-core-leafset.js'}


# the far ground (the owner, 2026-11-17: the Lake of the Vale ringed by mountains, "they should be visible"): the scale
# model's heights round the lake (tools/scale-model/model/data/h.png, after edit_517_vale_ring.py), sampled bicubically
# every FAR_STEP m on a grid in the world's metres from the pin (843,1491: x east, z south), heights in the world's (the
# lake at -520 m), packed 16 bits a sample. 89zp's phH takes it past the town's own ground (phFar), 90q draws it to the
# lake's far shore. Plain data for the page and for core/world/bake_towns.py, which samples phH through the same frame.
FAR_H = 'tools/scale-model/model/data/h.png'
FAR_PIN, FAR_STEP, FAR_BOX = (843, 1491), 500, (-46000, -34000, 46000, 66000)   # x0, z0, x1, z1 (m from the pin)
FAR_LO, FAR_HI = -2600.0, 27000.0   # tools/scale-model/model/data/model.json lo, hi (smodel/page.py)


def far_grid():
    import base64
    import numpy as np
    from PIL import Image
    from scipy import ndimage as nd
    a = np.asarray(Image.open(os.path.join(ROOT, *FAR_H.split('/'))).convert('RGB'))
    x0, z0, x1, z1 = FAR_BOX
    px0, py0 = int(FAR_PIN[0] + x0 / 2000.0) - 4, int(FAR_PIN[1] + z0 / 2000.0) - 4
    px1, py1 = int(FAR_PIN[0] + x1 / 2000.0) + 5, int(FAR_PIN[1] + z1 / 2000.0) + 5
    c = a[py0:py1, px0:px1].astype(np.int64)
    E = FAR_LO + ((c[..., 0] << 8) | c[..., 1]) / 65535.0 * (FAR_HI - FAR_LO)
    nx, nz = (x1 - x0) // FAR_STEP + 1, (z1 - z0) // FAR_STEP + 1
    xs = FAR_PIN[0] + (x0 + np.arange(nx) * FAR_STEP) / 2000.0 - px0
    zs = FAR_PIN[1] + (z0 + np.arange(nz) * FAR_STEP) / 2000.0 - py0
    gz, gx = np.meshgrid(zs, xs, indexing='ij')
    H = nd.map_coordinates(E, [gz, gx], order=3, mode='nearest')
    q = np.clip(np.round((H + 520.0) / 0.5), -32768, 32767).astype('<i2')
    b64 = base64.b64encode(q.tobytes()).decode('ascii')
    return ('/* PH_FAR: the scale model round the Lake of the Vale for the far ground of Phēr (settlements/pher/build.py far_grid). GENERATED. */\n'
            'var PH_FAR={x0:%d,z0:%d,step:%d,nx:%d,nz:%d,h0:-520,s:.5,b64:"%s"};\n' % (x0, z0, FAR_STEP, nx, nz, b64))


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    outs = {'69p-kcity-bundle.js': kcity_bundle(), '89zf-ph-far.js': far_grid()}
    for f, rel in BIO_MIN.items():
        outs[f] = '/* %s, read from core at every build (settlements/pher/build.py BIO_MIN). GENERATED: edit core/biome. */\n%s' % (rel, rd(rel))
    for f, new in outs.items():
        out = os.path.join(GEN, f)
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE] + ['core/city/' + f for f in CITY_JS] + sorted(BIO_MIN.values()) + [FAR_H]))
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
