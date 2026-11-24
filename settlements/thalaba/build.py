#!/usr/bin/env python3
"""Thalaba, the town at the mouth of Godshearth (PLAN.md, steps T2-T4).

The town is built on Xanadu's page, as Erewhon and Qiblai are: settlements/xanadu/build.py --kit takes this folder's
kit.json, src/ and targets/, with core/city sealed in one closure as Qiblai seals it (gen/69t-kcity-bundle.js) and the
town's ground baked from the scale model (gen/69u-tb-ground.js), both generated here at every build, never edited by hand.
The page takes core/rand, core/tags, core/host, core/door, core/lod and core/atmos through Xanadu's build; core/city and
core/space through the bundle; core/water and core/atmos for the springs, the leat and the tank (kit.json "files").

The ground (gen/69u-tb-ground.js): the scale model 5.1's heights (tools/scale-model/model/data/h.png: (R*256+G)/65535*
29600-2600 m) round the pin, px 840,1463, interpolated bicubically, as core/world's WORLD.H reads the same cells:
  near  4.8 km east-west by 12.8 km, from 2.4 km south of the pin to the gorge's mouth 10.4 km north, at 40 m (the town,
        its fields, the spring line, the bench, the riser and its terraces, the leat's head), decimetres over 1,500 m
  far   an 80 km square at 500 m (the walls of the gorge, Gaadz-Phol, the caldera's rim falling to the lake), metres
x east, z south, metres from the pin (2 km a pixel).

    python3 ../../tools/build.py settlements/thalaba      # dist/thalaba.html
    KRATOR_GL=gpu python3 verify.py dist/thalaba.html --assert --views "Overview,The market square"
"""
import os, sys                                   # item 25 (the survey): a plain run goes through tools/build.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)           # build-inputs.json is always written (KRATOR_ALLOW_PLAIN_BUILD=1 skips it)
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
NEAR = (-2400.0, 2400.0, -10400.0, 2400.0, 40.0)   # x0, x1, z0, z1, step (m): the town, the bench and the riser up to the gorge's mouth
FAR = (-40000.0, 40000.0, -40000.0, 40000.0, 500.0)


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

    def grid(box, unit, base):
        x0, x1, z0, z1, step = box
        nx, nz = int(round((x1 - x0) / step)) + 1, int(round((z1 - z0) / step)) + 1
        zz, xx = np.meshgrid(z0 + step * np.arange(nz), x0 + step * np.arange(nx), indexing='ij')   # rows z (south), columns x (east)
        rows, cols = PIN[1] + zz / M_PER_PX, PIN[0] + xx / M_PER_PX
        h = nd.map_coordinates(H, [rows.ravel(), cols.ravel()], order=3, mode='nearest').reshape(nz, nx)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        return ('{x0:%g,z0:%g,x1:%g,z1:%g,step:%g,nx:%d,nz:%d,unit:%g,base:%g,min:%.1f,max:%.1f,b64:"%s"}'
                % (x0, z0, x1, z1, step, nx, nz, unit, base, float(h.min()), float(h.max()), base64.b64encode(q.tobytes()).decode('ascii')))

    near, far = grid(NEAR, 0.1, 1500.0), grid(FAR, 1.0, 0.0)
    # the rivers within the far land (the model's rivers.json): [x, z, bed m] in the page's frame, for the far mesh's colour
    import json
    with io.open(os.path.join(ROOT, *RIVERS.split('/')), encoding='utf-8') as fh:
        rivers = json.load(fh)
    keep = []
    for r in rivers:
        pts = r.get('px') or []
        if not pts or min(abs(x - PIN[0]) + abs(y - PIN[1]) for x, y in pts) * M_PER_PX > FAR[1] * 1.3:
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
            ' near:%s,\n far:%s,\n'
            ' rivers:[%s]};\n'
            % (H_PNG, PIN[0], PIN[1], PIN[0], PIN[1], near, far, ',\n  '.join(keep)))


# the Dalab mission's pieces (the Dalab set's, read in place: kit.json `external`) draw in Xanadu's shared keys (wood, stone,
# plaster: the Xanadu pack textures them) and in Dalab's own: only those Dalab's pack must bring (the rammed earth, the
# reliefs, the three murals the healers' hall shows), measured on the pieces sheet; the rest of its 49 families stay out
DALAB_FAMILIES = ('dRammed', 'dRelief', 'dReliefCh', 'dMural3', 'dMural4', 'dMural6')


def dalab_pack():
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import json, matlib_pack
    d = os.path.join(ROOT, 'settlements', 'dalab')
    fams = json.load(io.open(os.path.join(d, 'tex', 'pack.json'), encoding='utf-8'))['families']
    return ('/* the Dalab pack, trimmed to the mission\'s own families (settlements/thalaba/build.py DALAB_FAMILIES). GENERATED. */\n'
            + matlib_pack.fragment(d, 'dalab', exclude=tuple(k for k in fams if k not in DALAB_FAMILIES)))


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    for name, make in (('69t-kcity-bundle.js', kcity_bundle), ('69u-tb-ground.js', ground_fragment), ('69v-dalab-pack.js', dalab_pack)):
        out = os.path.join(GEN, name)
        new = make()
        old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != new:
            with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(new)


BSRC.note(*(['settlements/dalab/tex/pack.json'] + ['settlements/dalab/tex/%s.%s.webp' % (f, m) for f in DALAB_FAMILIES for m in ('albedo', 'normal', 'rough')] + [SPACE, H_PNG, RIVERS] + ['core/city/' + f for f in CITY_JS]))
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
