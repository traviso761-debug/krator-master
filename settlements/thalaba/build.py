#!/usr/bin/env python3
"""Thalaba, the town at the mouth of Godshearth (PLAN.md, steps T2-T4).

The town is built on Xanadu's page, as Erewhon and Qiblai are: settlements/xanadu/build.py --kit takes this folder's
kit.json, src/ and targets/, with core/city sealed in one closure as Qiblai seals it (gen/69t-kcity-bundle.js) and the
town's ground baked from the scale model (gen/69u-tb-ground.js), both generated here at every build, never edited by hand.
The page takes core/rand, core/tags, core/host, core/door, core/lod and core/atmos through Xanadu's build; core/city and
core/space through the bundle; core/water and core/atmos for the springs, the leat and the tank (kit.json "files").

The ground (gen/69u-tb-ground.js): the scale model 5.1's heights (tools/scale-model/model/data/h.png: (R*256+G)/65535*
29600-2600 m) round the pin, px 840,1463, interpolated bicubically, as core/world's WORLD.H reads the same cells:
  near  a 4.8 km square at 40 m (the town, its fields, the spring line), decimetres over 1,500 m
  far   an 80 km square at 500 m (the bench, the riser, the gorge's mouth and walls, the cataract), metres
x east, z south, metres from the pin (2 km a pixel).

    python3 ../../tools/build.py settlements/thalaba      # dist/thalaba.html
    KRATOR_GL=gpu python3 verify.py dist/thalaba.html --assert --views "Overview,The market square"
"""
import base64, io, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/city', 'core/space', 'core/atmos', 'core/water', 'core/biome')   # through Xanadu's build, kit.json and gen/

# core/city in one closure, as settlements/qiblai/build.py seals it (its globals stay inside; core/space writes KSPACE onto a
# window of the closure's own, because Xanadu's page keeps core/space out). No nested-squares site: Thalaba is laid by its
# own steps on the instance (targets/town/89zt-tb-site.js) and filled by the frontage-courts strategy.
CITY_JS = ['10-city-core.js', '12-city-index.js', '15-city-ground.js', '20-city-plan.js', '25-city-site.js', '31-city-steps-b.js',
           '32-city-steps-c.js', '33-city-strategies.js', '40-city-kcity.js']
SPACE = 'core/space/20-core-space.js'
GEN = os.path.join(HERE, 'gen')
H_PNG = 'tools/scale-model/model/data/h.png'
RIVERS = 'tools/scale-model/model/data/rivers.json'
PIN = (840.0, 1463.0)                  # Thalaba's pin on the 5.1 canvas (scale model 5.1e12)
M_PER_PX = 2000.0
NEAR = (2400.0, 40.0)                  # half-size, step (m)
FAR = (40000.0, 500.0)


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


def kcity_bundle():
    body = '\n/* ---- %s ---- */\n%s\nvar KSPACE = window.KSPACE;\n' % (SPACE, rd(SPACE))
    for f in CITY_JS:
        body += '\n/* ---- core/city/%s ---- */\n%s\n' % (f, rd('core/city/' + f))
    return ('/* KCITY: core/city and core/space in one closure (settlements/thalaba/build.py). GENERATED: edit core/city. */\n'
            'var KCITY = (function(window){\n' + body +
            # the town's own steps (targets/town/89zt-tb-site.js) lay its raster and ways from outside the closure, as the
            # nested-squares site does from inside it: they take the raster's class and its occupancy codes from here
            '\nKCITY.lib = { SL: SL, plan: function () { return PLAN; }, KSPACE: KSPACE, Raster: Raster, OCC: OCC, tune: function () { return TUNE; } };\n'
            'return KCITY;\n})(Object.create(window));\n')


def ground_fragment():
    import numpy as np
    from PIL import Image
    from scipy import ndimage as nd
    im = np.array(Image.open(os.path.join(ROOT, *H_PNG.split('/'))).convert('RGB')).astype(np.float64)
    H = (im[..., 0] * 256 + im[..., 1]) / 65535 * 29600 - 2600

    def grid(half, step, unit, base):
        n = int(round(2 * half / step)) + 1
        t = -half + step * np.arange(n)
        zz, xx = np.meshgrid(t, t, indexing='ij')                       # rows z (south), columns x (east)
        rows, cols = PIN[1] + zz / M_PER_PX, PIN[0] + xx / M_PER_PX
        h = nd.map_coordinates(H, [rows.ravel(), cols.ravel()], order=3, mode='nearest').reshape(n, n)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        return n, base64.b64encode(q.tobytes()).decode('ascii'), float(h.min()), float(h.max())

    nn, nb, n0, n1 = grid(NEAR[0], NEAR[1], 0.1, 1500.0)
    fn, fb, f0, f1 = grid(FAR[0], FAR[1], 1.0, 0.0)
    # the rivers within the far land (the model's rivers.json): [x, z, bed m] in the page's frame, for the far mesh's colour
    import json
    with io.open(os.path.join(ROOT, *RIVERS.split('/')), encoding='utf-8') as fh:
        rivers = json.load(fh)
    keep = []
    for r in rivers:
        pts = r.get('px') or []
        if not pts or min(abs(x - PIN[0]) + abs(y - PIN[1]) for x, y in pts) * M_PER_PX > FAR[0] * 1.3:
            continue
        bed = r.get('bed_m') or []
        P = []
        for k, (x, y) in enumerate(pts):
            b = bed[k] if k < len(bed) else float(nd.map_coordinates(H, [[y], [x]], order=1, mode='nearest')[0])
            P.append('[%d,%d,%d]' % (round((x - PIN[0]) * M_PER_PX), round((y - PIN[1]) * M_PER_PX), round(b)))
        keep.append('{id:%s,name:%s,w:%d,pts:[%s]}' % (json.dumps(r['id']), json.dumps(r.get('name', ''), ensure_ascii=False),
                                                        round(r.get('width_m') or 10), ','.join(P)))
    return ('/* TB_GROUND: Thalaba\'s ground from the scale model 5.1 (%s), bicubic round the pin px %g,%g (settlements/thalaba/build.py).\n'
            '   GENERATED: edit the model. x east, z south, metres from the pin; a grid row is one z. [G data] */\n'
            'var TB_GROUND={pin:[%g,%g],\n'
            ' near:{half:%g,step:%g,n:%d,unit:.1,base:1500,min:%.1f,max:%.1f,b64:"%s"},\n'
            ' far:{half:%g,step:%g,n:%d,unit:1,base:0,min:%.1f,max:%.1f,b64:"%s"},\n'
            ' rivers:[%s]};\n'
            % (H_PNG, PIN[0], PIN[1], PIN[0], PIN[1], NEAR[0], NEAR[1], nn, n0, n1, nb, FAR[0], FAR[1], fn, f0, f1, fb, ',\n  '.join(keep)))


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69t-kcity-bundle.js', kcity_bundle), ('69u-tb-ground.js', ground_fragment)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*([SPACE, H_PNG, RIVERS] + ['core/city/' + f for f in CITY_JS]))
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
