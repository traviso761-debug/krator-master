#!/usr/bin/env python3
"""Add what a packed model lacks to models/<key>.json, in place: the fitted anchors (rig/anchors.json, from fit_anchors.js) and the
dragonfly's wing material, which its rigged GLB held and the old models_pack.py dropped (that GLB is gone).

    python3 rig/patch_models.py          # run from kits/fauna; deterministic, safe to run again

The wing is core/materials/library/wing.dragonfly, made see-through between the veins by the same sum rig/dragonfly_rig.py used.
Needs numpy and Pillow.
"""
import base64, io, json, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(KIT))
MODELS = os.path.join(KIT, 'models')


def wing_mat():
    im = Image.open(os.path.join(ROOT, 'core', 'materials', 'library', 'wing.dragonfly', 'albedo.png')).convert('RGBA').resize((512, 512), Image.LANCZOS)
    a = np.array(im).astype(float)
    lum = a[..., :3].mean(2) / 255
    a[..., 3] = a[..., 3] * np.clip(0.32 + (0.86 - lum) * 1.0, 0.32, 1.0)
    buf = io.BytesIO()
    Image.fromarray(a.astype(np.uint8)).save(buf, 'WEBP', quality=84, method=6)
    return {'map': 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode('ascii'), 'parts': ['wing2L', 'wing2R', 'wingL', 'wingR'],
            'roughness': 0.3, 'source': 'core/materials/library/wing.dragonfly'}


def main():
    anchors = json.load(open(os.path.join(HERE, 'anchors.json'), encoding='utf-8'))
    for f in sorted(os.listdir(MODELS)):
        key = f[:-5]
        path = os.path.join(MODELS, f)
        with open(path, encoding='utf-8') as fh:
            M = json.load(fh)
        if anchors.get(key):
            M['anchors'] = anchors[key]
        for p, q in (M.get('picks') or {}).items():      # a family's species
            if anchors.get(key + '#' + p):
                q['anchors'] = anchors[key + '#' + p]
        wings = sorted({n.split('~')[0] for n in M['meshes'] if n.startswith('wing')})
        if key == 'giant-dragonfly' or (M.get('family') and wings):
            M['mats'] = {'wing': dict(wing_mat(), parts=wings or ['wing2L', 'wing2R', 'wingL', 'wingR'])}
        with open(path, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(M, fh, sort_keys=True, separators=(',', ':'))
        print('%s: %d anchors%s, %.2f MB' % (key, len(M.get('anchors', {})), ', wing material' if 'mats' in M else '', os.path.getsize(path) / 1e6))


if __name__ == '__main__':
    main()
