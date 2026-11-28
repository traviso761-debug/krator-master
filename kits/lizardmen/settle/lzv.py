#!/usr/bin/env python3
"""The shared build of a Lizardmen village on kits/lizardmen/settle (core/simulation/PLAN-LIZARDMEN.md step 7). A town's
build.py names its modules (tools/check_core_use.py reads them there) and calls

    lzv.build(HERE, pin=(818, 1554), near=(-4000, 4000, -4000, 4000, 20), far=(-30000, 30000, -30000, 30000, 500))

which writes the town's gen/ (never edited by hand, removed after the build, as Gila's is):
  69g-lzv-ground.js    LZV_GROUND: the scale model 5.1's heights (tools/scale-model/model/data/h.png:
                       (R*256+G)/65535*29600-2600 m) bicubic round the pin, as core/world's WORLD.H reads the same cells: the
                       near grid at its step (decimetres about the pin's height) and the far grid (metres); x east, z south,
                       metres from the pin (2 km a pixel)
  69k-kcity-bundle.js  core/city and core/space in one closure (the village's steps, 82-lzv-site.js, lay the spiral on it)
then runs kits/lizardmen/build.py --settlement on the town's folder (its settlement.json, src/, gen/, tex/). Gila's own
build.py is the model; Gila moves onto this at its next pass."""
import base64, io, json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))   # kits/lizardmen/settle -> the repo (was two levels: kits/)
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import build_sources as BSRC                      # noqa: E402

CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js',
           '../kits/10-core-kits.js', '42-city-multikit.js', '53-city-host-multikit.js']   # the multi-kit host (Stage 8 D8): inert until called
SPACE = 'core/space/20-core-space.js'
H_PNG = 'tools/scale-model/model/data/h.png'
M_PER_PX = 2000.0


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle(name):
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    return ('/* KCITY: core/city and core/space in one closure (kits/lizardmen/settle/lzv.py for %s). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' % name + body +
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, tune: function () { return TUNE; } };\n'
            'return KCITY;\n})(Object.create(window));\n')


def ground_fragment(name, pin, near, far):
    import numpy as np
    from PIL import Image
    from scipy import ndimage as nd
    im = np.array(Image.open(os.path.join(ROOT, *H_PNG.split('/'))).convert('RGB')).astype(np.float64)
    H = (im[..., 0] * 256 + im[..., 1]) / 65535 * 29600 - 2600
    cell = float(nd.map_coordinates(H, [[pin[1]], [pin[0]]], order=3, mode='nearest')[0])

    def grid(box, unit, base):
        x0, x1, z0, z1, step = box
        nx, nz = int(round((x1 - x0) / step)) + 1, int(round((z1 - z0) / step)) + 1
        zz, xx = np.meshgrid(z0 + step * np.arange(nz), x0 + step * np.arange(nx), indexing='ij')
        h = nd.map_coordinates(H, [(pin[1] + zz / M_PER_PX).ravel(), (pin[0] + xx / M_PER_PX).ravel()], order=3, mode='nearest').reshape(nz, nx)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        return ('{x0:%g,z0:%g,x1:%g,z1:%g,step:%g,nx:%d,nz:%d,unit:%g,base:%g,min:%.1f,max:%.1f,b64:"%s"}'
                % (x0, z0, x1, z1, step, nx, nz, unit, base, float(h.min()), float(h.max()), base64.b64encode(q.tobytes()).decode('ascii')))

    return ('/* LZV_GROUND: %s\'s ground from the scale model 5.1 (%s), bicubic round the pin px %g,%g (kits/lizardmen/settle/lzv.py).\n'
            '   GENERATED: edit the model. x east, z south, metres from the pin; a grid row is one z; nx, nz count the vertices. [G data] */\n'
            'var LZV_GROUND={pin:[%g,%g],model:%.1f,\n near:%s,\n far:%s};\n'
            % (name, H_PNG, pin[0], pin[1], pin[0], pin[1], cell, grid(near, 0.1, round(cell)), grid(far, 1.0, 0.0)))


def build(town_dir, pin, near, far):
    name = os.path.basename(town_dir)
    gen = os.path.join(town_dir, 'gen')
    cfg_path = os.path.join(town_dir, 'settlement.json')
    cfg = json.load(io.open(cfg_path, encoding='utf-8')) if os.path.isfile(cfg_path) else {}
    uses_res = any(e.partition('=')[0].startswith('kits/resources/') for e in cfg.get('core', []))
    geo_rel = 'kits/resources/data/geology.json'
    noted = [SPACE, H_PNG] + ['core/city/' + f for f in CITY_JS] + ([geo_rel] if uses_res else [])
    BSRC.note(*[os.path.join(ROOT, *p.split('/')) for p in noted])
    if not BSRC.LISTING:
        os.makedirs(gen, exist_ok=True)
        gen_items = [('69g-lzv-ground.js', ground_fragment(name, pin, near, far)), ('69k-kcity-bundle.js', kcity_bundle(name))]
        if uses_res:
            gen_items.append(('45q-res-geodata.js', '/* RES_GEODATA from %s (kits/lizardmen/settle/lzv.py). GENERATED. */\nconst RES_GEODATA=%s;\n' % (geo_rel, rd(geo_rel).strip())))
        for fn, text in gen_items:
            with io.open(os.path.join(gen, fn), 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(text)
    rc = 1
    try:
        if '--no-checks' not in sys.argv and subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', town_dir]) != 0:
            sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')
        rc = subprocess.call([sys.executable, os.path.join(ROOT, 'kits', 'lizardmen', 'build.py'), '--settlement', town_dir] + sys.argv[1:],
                             cwd=os.path.join(ROOT, 'kits', 'lizardmen'))
    finally:
        if not BSRC.LISTING:
            shutil.rmtree(gen, ignore_errors=True)
    if not rc:
        BSRC.report()
    sys.exit(rc)
