#!/usr/bin/env python3
"""tools/scale_ground.py: a settlement's ground baked from the scale model, as a [G data] fragment (2026-11-23, the House of the
Tempest; the same bake Strongwall's and Thalaba's build.py each carry a copy of, here once for any page that stands on the model).

The scale model 5.1's heights (tools/scale-model/model/data/h.png: (R*256+G)/65535*29600-2600 m) round a pin, interpolated
bicubically, on two grids: a near box at a fine step in decimetres and a far square at a coarse step in metres, plus the model's
rivers within the far square. x east, z south, metres from the pin; a grid row is one z.

    import scale_ground
    js = scale_ground.fragment('TP_GROUND', pin=(886.0, 1619.0), near=(-2000, 2000, -2000, 2000, 20), far=(-40000, 40000, -40000, 40000, 500),
                               title='the House of the Tempest', build='settlements/tempest/build.py')
    scale_ground.write(path, js)     # writes only when the text changed

Every read is recorded for tools/build_sources.py (H_PNG, RIVERS: a build notes them with BSRC.note before it bakes).
"""
import base64, io, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H_PNG = 'tools/scale-model/model/data/h.png'
RIVERS = 'tools/scale-model/model/data/rivers.json'
M_PER_PX = 2000.0


def heights():
    import numpy as np
    from PIL import Image
    im = np.array(Image.open(os.path.join(ROOT, *H_PNG.split('/'))).convert('RGB')).astype(np.float64)
    return (im[..., 0] * 256 + im[..., 1]) / 65535 * 29600 - 2600


def fragment(var, pin, near, far, title, build):
    import numpy as np
    from scipy import ndimage as nd
    H = heights()

    def grid(box, unit, base):
        x0, x1, z0, z1, step = box
        nx, nz = int(round((x1 - x0) / step)) + 1, int(round((z1 - z0) / step)) + 1
        zz, xx = np.meshgrid(z0 + step * np.arange(nz), x0 + step * np.arange(nx), indexing='ij')
        rows, cols = pin[1] + zz / M_PER_PX, pin[0] + xx / M_PER_PX
        h = nd.map_coordinates(H, [rows.ravel(), cols.ravel()], order=3, mode='nearest').reshape(nz, nx)
        q = np.clip(np.round((h - base) / unit), -32768, 32767).astype('<i2')
        return ('{x0:%g,z0:%g,x1:%g,z1:%g,step:%g,nx:%d,nz:%d,unit:%g,base:%g,min:%.1f,max:%.1f,b64:"%s"}'
                % (x0, z0, x1, z1, step, nx, nz, unit, base, float(h.min()), float(h.max()), base64.b64encode(q.tobytes()).decode('ascii')))

    ng, fg = grid(near, 0.1, 0.0), grid(far, 1.0, 0.0)
    cell = float(H[int(pin[1]), int(pin[0])])
    with io.open(os.path.join(ROOT, *RIVERS.split('/')), encoding='utf-8') as fh:
        rivers = json.load(fh)
    keep = []
    for r in rivers:
        pts = r.get('px') or []
        if not pts or min(abs(x - pin[0]) + abs(y - pin[1]) for x, y in pts) * M_PER_PX > far[1] * 1.3:
            continue
        bed = r.get('bed_m') or []
        P = []
        for k, (x, y) in enumerate(pts):
            b = bed[k] if k < len(bed) else float(nd.map_coordinates(H, [[y], [x]], order=1, mode='nearest')[0])
            P.append('[%d,%d,%d]' % (round((x - pin[0]) * M_PER_PX), round((y - pin[1]) * M_PER_PX), round(b)))
        keep.append('{id:%s,name:%s,kind:%s,w:%d,pts:[%s]}' % (json.dumps(r['id']), json.dumps(r.get('name', ''), ensure_ascii=False), json.dumps(r.get('kind', '')),
                                                                round(r.get('width_m') or 10), ','.join(P)))
    return ('/* %s: %s\'s ground from the scale model 5.1 (%s), bicubic round the pin px %g,%g (%s, tools/scale_ground.py).\n'
            '   GENERATED: edit the model. x east, z south, metres from the pin; a grid row is one z. cell: the model\'s own height at the pin. [G data] */\n'
            'var %s={pin:[%g,%g],cell:%.1f,\n'
            ' near:%s,\n far:%s,\n'
            ' rivers:[%s]};\n'
            % (var, title, H_PNG, pin[0], pin[1], build, var, pin[0], pin[1], cell, ng, fg, ',\n  '.join(keep)))


def write(path, text):
    """write the fragment only when it changed (the build's output stays byte-identical across rebuilds)"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    old = io.open(path, encoding='utf-8').read() if os.path.exists(path) else None
    if old != text:
        with io.open(path, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(text)
