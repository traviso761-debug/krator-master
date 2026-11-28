#!/usr/bin/env python3
"""Basilisk, the Lizardmen's stone capital at the eastern terminal sea (PLAN.md). python3 tools/build.py settlements/basilisk
(a plain python3 build.py comes through it by itself).

Built on the Lizardmen kit's page with no copy of the kit: kits/lizardmen/build.py --settlement takes this folder's
settlement.json, src/, gen/ and tex/. This script writes gen/ first, never edited by hand:
  69g-bs-ground.js    the ground and water mask from scale model 5.1 (tools/scale-model/model/data/h.png) round the agreed
                      sabkha pin, px 766.6,1597.25 (bicubic heights, bilinear water mask):
                        near  6.8 km east-west by 6.8 km north-south at 16 m (the walled capital, 5 m platforms, 12 m Mound,
                              Lothal dock, bronze hall, 700 m ley mole, scaled-back salt pans, seven Dholavira reservoirs,
                              Tlahn Gill check dam and southern paddies), half-decimetres over -2,550 m
                        far   a 64 km square at 500 m (the eastern terminal sea, Tlahn Gill's fan, the Rift walls), metres
                      x east, z south, metres from the pin (2 km a pixel); y is the model's height in metres
  69k-kcity-bundle.js core/city and core/space in one closure, as settlements/gila/build.py seals them
  81p-bs-plan.js      BS_PLAN from basilisk_plan.json (2,327 deterministic placements, district spirals, wall, water, ley)

    python3 tools/build.py settlements/basilisk
    KRATOR_GL=gpu python3 settlements/basilisk/verify.py settlements/basilisk/dist/basilisk.html --assert --all-views
"""
import base64, io, json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)
import build_sources as BSRC                      # noqa: E402

CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/atmos', 'core/door', 'core/walk', 'core/furnish', 'core/engine',
              'core/city', 'core/space', 'core/water', 'core/drawn', 'core/terrain', 'core/hamlet')

CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js',
           '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js']   # the multi-kit host (Stage 8 D8): inert until called
SPACE = 'core/space/20-core-space.js'
H_PNG = 'tools/scale-model/model/data/h.png'
PLAN_JSON = os.path.join(HERE, 'basilisk_plan.json')
GEN = os.path.join(HERE, 'gen')
PIN = (766.6, 1597.25)
M_PER_PX = 2000.0
NEAR = (-3200.0, 3600.0, -3000.0, 3800.0, 16.0)
FAR = (-32000.0, 32000.0, -32000.0, 32000.0, 500.0)


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    return ('/* KCITY: core/city and core/space in one closure (settlements/basilisk/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, tune: function () { return TUNE; } };\n'
            'return KCITY;\n})(Object.create(window));\n')


def ground_fragment():
    import numpy as np
    from PIL import Image
    from scipy import ndimage as nd
    im = np.array(Image.open(os.path.join(ROOT, *H_PNG.split('/'))).convert('RGB')).astype(np.float64)
    H = (im[..., 0] * 256 + im[..., 1]) / 65535 * 29600 - 2600
    W = (im[..., 2] > 127).astype(np.float64)

    def grid(box, unit, base):
        x0, x1, z0, z1, step = box
        nx, nz = int(round((x1 - x0) / step)) + 1, int(round((z1 - z0) / step)) + 1
        zz, xx = np.meshgrid(z0 + step * np.arange(nz), x0 + step * np.arange(nx), indexing='ij')
        rows, cols = PIN[1] + zz / M_PER_PX, PIN[0] + xx / M_PER_PX
        h = nd.map_coordinates(H, [rows.ravel(), cols.ravel()], order=3, mode='nearest').reshape(nz, nx)
        w = nd.map_coordinates(W, [rows.ravel(), cols.ravel()], order=1, mode='nearest').reshape(nz, nx)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        wq = np.clip(np.round(w * 255.0), 0, 255).astype(np.uint8)
        return ('{x0:%g,z0:%g,x1:%g,z1:%g,step:%g,nx:%d,nz:%d,unit:%g,base:%g,min:%.1f,max:%.1f,b64:"%s",w64:"%s"}'
                % (x0, z0, x1, z1, step, nx, nz, unit, base, float(h.min()), float(h.max()),
                   base64.b64encode(q.tobytes()).decode('ascii'),
                   base64.b64encode(wq.tobytes()).decode('ascii')))

    near, far = grid(NEAR, 0.05, -2550.0), grid(FAR, 1.0, 0.0)
    cell = float(nd.map_coordinates(H, [[PIN[1]], [PIN[0]]], order=3, mode='nearest')[0])
    return ('/* BS_GROUND: Basilisk\'s ground and water mask from scale model 5.1 (%s), round px %g,%g (settlements/basilisk/build.py).\n'
            '   GENERATED: edit the model. x east, z south, metres from the pin; [G data] */\n'
            'var BS_GROUND={pin:[%g,%g],model:%.1f,sea:-2600.5,\n near:%s,\n far:%s};\n'
            % (H_PNG, PIN[0], PIN[1], PIN[0], PIN[1], cell, near, far))


def plan_fragment():
    with io.open(PLAN_JSON, encoding='utf-8') as fh:
        data = json.load(fh)
    return ('/* BS_PLAN: deterministic manifest from settlements/basilisk/basilisk_plan.json (settlements/basilisk/build.py).\n'
            '   GENERATED: edit basilisk_layout.py. [G data] */\n'
            'var BS_PLAN=' + json.dumps(data, separators=(',', ':'), ensure_ascii=False) + ';\n')


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69g-bs-ground.js', ground_fragment), ('69k-kcity-bundle.js', kcity_bundle), ('81p-bs-plan.js', plan_fragment)):
        with io.open(os.path.join(GEN, name), 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(make())


BSRC.note(*([PLAN_JSON] + [os.path.join(ROOT, *p.split('/')) for p in ([SPACE, H_PNG] + ['core/city/' + f for f in CITY_JS])]))
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
