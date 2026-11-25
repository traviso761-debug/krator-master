#!/usr/bin/env python3
"""Gila, the Lizardmen's salt village on its lake (PLAN.md). python3 tools/build.py settlements/gila (a plain
python3 build.py comes through it by itself).

The village is built on the Lizardmen kit's page, with no copy of the kit: kits/lizardmen/build.py --settlement takes this
folder's settlement.json, src/, gen/ and tex/ (as settlements/xanadu/build.py --kit builds Thalaba). This script writes gen/
first, never edited by hand:
  69g-gl-ground.js    the ground: the scale model 5.1's heights (tools/scale-model/model/data/h.png: (R*256+G)/65535*29600-2600 m)
                      round the pin, px 653,1485, bicubic as core/world's WORLD.H reads the same cells:
                        near  8 km east-west by 9 km at 20 m (the village, the spit, the salt flats, the fields, the reliquary on
                              the south shore), decimetres over -1,800 m
                        far   a 60 km square at 500 m (the spit, the lake's arms, the Rift's walls), metres
                      x east, z south, metres from the pin (2 km a pixel); y is the model's height in metres
  69k-kcity-bundle.js core/city and core/space in one closure, as settlements/thalaba/build.py seals them (the village's own
                      steps, src/89g-gl-site.js, lay the spiral on the instance)

The modules the page takes (tools/check_core_use.py reads this list): core/rand, core/tags, core/host, core/atmos, core/door,
core/walk and core/furnish through the kit's build; core/engine (the kit's engine); core/city and core/space (the bundle);
core/water, core/drawn, core/terrain (KGROUND, the ground's layers), core/hamlet (with core/hamlet/lizardmen) and kits/crops
through settlement.json "core".

    python3 tools/build.py settlements/gila           # dist/gila.html (+ gila.tex.*.js beside it)
    KRATOR_GL=gpu python3 settlements/gila/verify.py settlements/gila/dist/gila.html --assert --views "Overview,The nest hall"
"""
import base64, io, json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402  (--list-sources: tools/dep_graph.py)

CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/door', 'core/walk', 'core/furnish', 'core/engine',
              'core/city', 'core/space', 'core/water', 'core/drawn', 'core/terrain', 'core/hamlet')   # through the kit's build, the bundle and settlement.json

CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js',
           '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js']   # the multi-kit host (Stage 8 D8): inert until called
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
H_PNG = 'tools/scale-model/model/data/h.png'
PIN = (653.0, 1485.0)                  # Gila's pin on the 5.1 canvas (sze26pgivd)
M_PER_PX = 2000.0
NEAR = (-4500.0, 3500.0, -4500.0, 4500.0, 20.0)   # x0, x1, z0, z1, step (m)
FAR = (-30000.0, 30000.0, -30000.0, 30000.0, 500.0)


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    return ('/* KCITY: core/city and core/space in one closure (settlements/gila/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' + body +
            # the village's own steps (src/89g-gl-site.js) lay its raster and its spiral from outside the closure
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, tune: function () { return TUNE; } };\n'
            'return KCITY;\n})(Object.create(window));\n')


def ground_fragment():
    import numpy as np
    from PIL import Image
    from scipy import ndimage as nd
    im = np.array(Image.open(os.path.join(ROOT, *H_PNG.split('/'))).convert('RGB')).astype(np.float64)
    H = (im[..., 0] * 256 + im[..., 1]) / 65535 * 29600 - 2600

    def grid(box, unit, base):
        x0, x1, z0, z1, step = box
        nx, nz = int(round((x1 - x0) / step)) + 1, int(round((z1 - z0) / step)) + 1
        zz, xx = np.meshgrid(z0 + step * np.arange(nz), x0 + step * np.arange(nx), indexing='ij')   # rows z (south), columns x (east)
        rows, cols = PIN[1] + zz / M_PER_PX, PIN[0] + xx / M_PER_PX
        h = nd.map_coordinates(H, [rows.ravel(), cols.ravel()], order=3, mode='nearest').reshape(nz, nx)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        return ('{x0:%g,z0:%g,x1:%g,z1:%g,step:%g,nx:%d,nz:%d,unit:%g,base:%g,min:%.1f,max:%.1f,b64:"%s"}'
                % (x0, z0, x1, z1, step, nx, nz, unit, base, float(h.min()), float(h.max()), base64.b64encode(q.tobytes()).decode('ascii')))

    near, far = grid(NEAR, 0.1, -1800.0), grid(FAR, 1.0, 0.0)
    cell = float(nd.map_coordinates(H, [[PIN[1]], [PIN[0]]], order=3, mode='nearest')[0])
    return ('/* GL_GROUND: Gila\'s ground from the scale model 5.1 (%s), bicubic round the pin px %g,%g (settlements/gila/build.py).\n'
            '   GENERATED: edit the model. x east, z south, metres from the pin; a grid row is one z; nx, nz count the vertices. [G data] */\n'
            'var GL_GROUND={pin:[%g,%g],model:%.1f,lake:-1723,\n near:%s,\n far:%s};\n'
            % (H_PNG, PIN[0], PIN[1], PIN[0], PIN[1], cell, near, far))


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69g-gl-ground.js', ground_fragment), ('69k-kcity-bundle.js', kcity_bundle)):
        with io.open(os.path.join(GEN, name), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(make())


BSRC.note(*[os.path.join(ROOT, *p.split('/')) for p in ([SPACE, H_PNG] + ['core/city/' + f for f in CITY_JS])])
if not BSRC.LISTING:
    write_gen()

try:
    if '--no-checks' not in sys.argv and subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
        sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')

    _rc = subprocess.call([sys.executable, os.path.join(ROOT, 'kits', 'lizardmen', 'build.py'), '--settlement', HERE] + sys.argv[1:],
                          cwd=os.path.join(ROOT, 'kits', 'lizardmen'))
finally:
    if not BSRC.LISTING:
        shutil.rmtree(GEN, ignore_errors=True)
if not _rc:
    BSRC.report()
sys.exit(_rc)
