#!/usr/bin/env python3
"""XS0, the offline half: every family of every pack a Xanadu page carries, with its STACK-PLAN section 5 class, the
stack's glazed rule (specular >= 0.45 and roughness < 0.35, roughness the packed map's mean), today's bytes per map,
and (with --xy8) the bytes of its normal map at 8 bits (lossless, as pack.py writes 6 bits today), re-encoded here in
memory from the library source. Nothing in the repo is written.

Usage: python3 xs0_families.py <out.json> [--xy8]
"""
import io, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import pack as P  # noqa: E402

# the pack name a page registers (KMAT.packs / KMAT_SIDE) -> the folder whose materials.json and tex/ made it
PACKS = {
    'xanadu': 'settlements/xanadu',          # kits/xanadu's materials.json and tex/ are the same 48 families
    'qiblai': 'kits/qiblai',
    'tungang': 'kits/tungang',
    'catalog-furniture': 'kits/catalog',
    'xanadu-bio': 'biomes/xanadu',
    'oidong': 'biomes/oidong',
    'twins': 'biomes/twins',
    'flashing-eye': 'settlements/flashing-eye',
    'kirstabal': 'settlements/kirstabal',
    'thalaba': 'settlements/thalaba',
}

# STACK-PLAN.md section 5, by family key or library id
GLAZED = {'xMosC', 'xMosD', 'xZel', 'xHaft', 'xMuqT', 'xBTile', 'xBandC', 'xBandR', 'xGiltC', 'xPietra', 'xMarW', 'xMarK',
          'xMarbleB', 'xMarbleW', 'roof.tile.celadon', 'tile.hex.ceramic', 'wood.lacquer', 'wood.lacquer.crimson'}
GLAZED_SUBSTR = ('moonglass',)
RELIEF = {'stone', 'brick', 'xSandR', 'xRubble', 'stone.sandstone.ashlar', 'stone.marble.ashlar', 'wall.rubble.limewash'}
FLAT = {'plaster', 'xWash'}


def plan_class(fam, e):
    lib = e.get('lib') or ''
    if e.get('card'):
        return 'cut-out'
    if fam in GLAZED or lib in GLAZED or any(s in lib or s in fam.lower() for s in GLAZED_SUBSTR):
        return 'glazed'
    if fam in RELIEF or lib in RELIEF:
        return 'relief'
    if fam in FLAT or lib in FLAT or lib.startswith('patterns/') or 'limewash' in lib or lib.startswith('metal.') or (e.get('metal') or 0) >= 0.5:
        return 'flat'
    return None


def grey_mean(path):
    if not os.path.isfile(path) or P.buildlib.is_pointer(path):
        return None
    return float(np.asarray(Image.open(path).convert('L')).astype(np.float64).mean() / 255.0)


def xy8(lib, size):
    d = P.set_dir(lib)
    try:
        meta = json.load(open(os.path.join(d, 'meta.json'), encoding='utf-8'))
    except Exception:
        return None, 'no meta.json'
    mp = meta.get('maps') or {}
    pn = os.path.normpath(os.path.join(d, mp.get('normalMap', 'normal.jpg')))
    if not os.path.isfile(pn):
        return None, 'no normal map'
    if P.buildlib.is_pointer(pn):
        return None, 'pointer: ' + os.path.relpath(pn, ROOT)
    n = P.load(pn, size, 'RGB') * 2 - 1
    n /= np.maximum(np.linalg.norm(n, axis=2, keepdims=True), 1e-6)
    b6 = len(P.webp(n * 0.5 + 0.5, 92, 'RGB', lossless=True, bits=6))
    b8 = len(P.webp(n * 0.5 + 0.5, 92, 'RGB', lossless=True, bits=8))
    return {'xy6': b6, 'xy8': b8}, None


def main(out, do8):
    res = {}
    for pname, d in PACKS.items():
        mj = os.path.join(ROOT, d, 'materials.json')
        cfg = json.load(open(mj, encoding='utf-8'))
        size = int(cfg.get('size', 512))
        tex = os.path.join(ROOT, d, 'tex')
        rows = {}
        for fam, c in cfg.get('families', {}).items():
            lib = c['lib']
            card = False
            try:
                meta = json.load(open(os.path.join(P.set_dir(lib), 'meta.json'), encoding='utf-8'))
                card = (meta.get('record', {}) or {}).get('kind') == 'card'
                rec_rough = (meta.get('record', {}) or {}).get('roughness')
            except Exception:
                rec_rough = None
            e = {'lib': lib, 'specular': c.get('specular', 0.5), 'metal': c.get('metal', 0), 'card': card,
                 'mapOnly': bool(c.get('mapOnly')), 'roughLift': c.get('roughLift', 0.0), 'size': c.get('size', size)}
            by = {}
            for slot, suf in (('map', 'albedo'), ('normalMap', 'normal'), ('roughnessMap', 'rough')):
                p = os.path.join(tex, '%s.%s.webp' % (fam, suf))
                if os.path.isfile(p):
                    by[slot] = os.path.getsize(p)
            e['bytes'] = by
            e['roughMean'] = grey_mean(os.path.join(tex, fam + '.rough.webp'))
            e['recordRoughness'] = rec_rough
            e['rule'] = (e['specular'] is not None and e['specular'] >= 0.45 and e['roughMean'] is not None and e['roughMean'] < 0.35)
            e['class'] = plan_class(fam, e)
            if do8 and 'normalMap' in by and (e['class'] == 'glazed' or e['rule']):
                sz = e['size']
                sz = [int(v) for v in sz] if isinstance(sz, list) else int(sz)
                r, why = xy8(lib, sz)
                e['normal8'] = r if r else {'skipped': why}
            rows[fam] = e
        res[pname] = {'dir': d, 'size': size, 'families': rows}
    json.dump(res, open(out, 'w'), indent=1)


if __name__ == '__main__':
    main(sys.argv[1], '--xy8' in sys.argv)
