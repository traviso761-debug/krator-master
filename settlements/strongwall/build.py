#!/usr/bin/env python3
"""Strongwall, the Master of Mines' fort at the foot of the Gold March's scarp (PLAN.md, step S1).

The fort is built on Xanadu's page, as Erewhon, Qiblai, Thalaba and Kirstabal are: settlements/xanadu/build.py --kit takes this
folder's kit.json and targets/, with the Xanadui fort read in place from kits/xanadu (src/80f-xa-fort-data.js, XFORT; src/80g-xa-fort.js,
its drawing: kit.json "external") and the fort's ground baked from the scale model (gen/69w-sw-ground.js), generated here at every build,
never edited by hand.

The ground (gen/69w-sw-ground.js): the scale model 5.1's heights (tools/scale-model/model/data/h.png: (R*256+G)/65535*29600-2600 m)
round the pin, px 912,1640, interpolated bicubically (as Thalaba's and Kirstabal's pages read the model):
  near  4 km east-west by 4 km, from 2.6 km north of the pin to 1.4 km south (the bench, the fort, the scarp's foot, the slot's head
        2 km east), at 20 m, decimetres over 0 m
  far   an 80 km square at 500 m (the scarp to the gold plateau, the bench falling north toward Qiblai, the slot east along the scarp's
        foot, the lowland valley west toward the Rift), metres
and the model's rivers within the far square (Kruk Gill, the wadi whose mouth the fort closes). x east, z south, metres from the pin.

    python3 ../../tools/build.py settlements/strongwall      # dist/strongwall.html
    KRATOR_GL=gpu python3 verify.py dist/strongwall.html --assert --views "Overview,The Qiblai Gate"
"""
import base64, io, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools')); import build_sources as BSRC   # --list-sources (tools/dep_graph.py)
CORE_TAKEN = ('core/rand', 'core/tags', 'core/host', 'core/door', 'core/terrain', 'core/ruins')   # through Xanadu's build and kit.json

GEN = os.path.join(HERE, 'gen')
H_PNG = 'tools/scale-model/model/data/h.png'
RIVERS = 'tools/scale-model/model/data/rivers.json'
PIN = (912.0, 1640.0)                  # Strongwall's pin on the 5.1 canvas (sxan7r1sln; edit 5.1e8 moved it here from 914,1634)
M_PER_PX = 2000.0
NEAR = (-2000.0, 2000.0, -2600.0, 1400.0, 20.0)   # x0, x1, z0, z1, step (m): the bench north of the pin, the fort, the scarp's foot
FAR = (-40000.0, 40000.0, -40000.0, 40000.0, 500.0)


def rd(rel):
    with io.open(os.path.join(ROOT, *rel.split('/')), encoding='utf-8') as fh:
        return fh.read()


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

    near, far = grid(NEAR, 0.1, 0.0), grid(FAR, 1.0, 0.0)
    cell = float(H[int(PIN[1]), int(PIN[0])])
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
        keep.append('{id:%s,name:%s,kind:%s,w:%d,pts:[%s]}' % (json.dumps(r['id']), json.dumps(r.get('name', ''), ensure_ascii=False), json.dumps(r.get('kind', '')),
                                                                round(r.get('width_m') or 10), ','.join(P)))
    return ('/* SW_GROUND: Strongwall\'s ground from the scale model 5.1 (%s), bicubic round the pin px %g,%g (settlements/strongwall/build.py).\n'
            '   GENERATED: edit the model. x east, z south, metres from the pin; a grid row is one z. cell: the model\'s own height at the pin. [G data] */\n'
            'var SW_GROUND={pin:[%g,%g],cell:%.1f,\n'
            ' near:%s,\n far:%s,\n'
            ' rivers:[%s]};\n'
            % (H_PNG, PIN[0], PIN[1], PIN[0], PIN[1], cell, near, far, ',\n  '.join(keep)))


def write_gen():
    os.makedirs(GEN, exist_ok=True)
    out = os.path.join(GEN, '69w-sw-ground.js')
    new = ground_fragment()
    old = io.open(out, encoding='utf-8').read() if os.path.exists(out) else None
    if old != new:
        with io.open(out, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(new)


BSRC.note(H_PNG, RIVERS)
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
