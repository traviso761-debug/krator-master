#!/usr/bin/env python3
"""A region's rasters decoded at build time into the typed arrays core/world takes (41-world-fields.js: WORLD.init(R)),
so a page builds its land at once and never reads a canvas's pixels (lifted from settlements/pinnacle-rock/tools/
world_data.py, 2026-11-09; that tool now calls this one).

    fragment(data_dir, kits_js, name, source) -> the JavaScript text of the generated fragment:
        WORLD_DATA = {meta: region.json, ...extra}, WORLD_R = the decoded arrays, then kits_js (the WORLD_KITS line)
    arrays(data_dir) -> {name: numpy array}: the same arrays, for a node bake or a test

The decoding is 98-world-start.js's, in Python: heights 16 bits in R,G (lo..hi), B the water flag; the map rasters one
byte each. Arrays go in as base64 of little-endian Float32 / Uint8, decoded by atob into typed arrays."""
import base64, json, os
import numpy as np
from PIL import Image

MAP = ('clim', 'rain', 'temp', 'biome', 'mask')


def _rgb(path):
    return np.array(Image.open(path).convert('RGB')).astype(np.int64)


def meta(data_dir):
    return json.load(open(os.path.join(data_dir, 'region.json'), encoding='utf-8'))


def arrays(data_dir):
    M = meta(data_dir)
    lo, hi = M['heights']['lo'], M['heights']['hi']
    v16 = lambda a: lo + ((a[..., 0] << 8) | a[..., 1]) / 65535.0 * (hi - lo)
    e, w = _rgb(os.path.join(data_dir, 'elev.png')), _rgb(os.path.join(data_dir, 'wlev.png'))
    R = {'elev': v16(e).astype('<f4'), 'wflag': (e[..., 2] > 127).astype('u1'), 'whas': (w[..., 2] > 127).astype('u1')}
    R['wlev'] = np.where(R['whas'] > 0, v16(w), lo).astype('<f4')
    for k in MAP:
        R[k] = _rgb(os.path.join(data_dir, k + '.png'))[..., 0].astype('u1')
    R['scarpL'] = v16(_rgb(os.path.join(data_dir, 'scarpl.png'))).astype('<f4')
    R['scarpU'] = v16(_rgb(os.path.join(data_dir, 'scarpu.png'))).astype('<f4')
    R['scarpW'] = _rgb(os.path.join(data_dir, 'scarpw.png'))[..., 0].astype('<f4')
    return R


def fragment(data_dir, kits_js, name, source, extra=None):
    """name: the fragment's name in its header; source: the line that says where the data came from; extra: more keys of
    WORLD_DATA ({key: JSON-able}, written after meta in key order: a region's baked roads or plans)"""
    M = meta(data_dir)
    R = arrays(data_dir)
    enc = {k: [('f4' if v.dtype.kind == 'f' else 'u1'), base64.b64encode(np.ascontiguousarray(v).ravel().tobytes()).decode('ascii')] for k, v in R.items()}
    more = ''.join(',%s:%s' % (k, json.dumps(extra[k], separators=(',', ':'), ensure_ascii=False)) for k in sorted(extra or {}))
    return ('// ==================== ' + name + '\n'
            '// ' + source + '\n'
            'var WORLD_DATA={meta:' + json.dumps(M, separators=(',', ':'), ensure_ascii=False) + more + '};\n'
            'var WORLD_R=(function(E){const R={};for(const k in E){const b=atob(E[k][1]),u=new Uint8Array(b.length);'
            'for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);R[k]=E[k][0]===\'f4\'?new Float32Array(u.buffer):u;}return R;})('
            + json.dumps(enc, separators=(',', ':')) + ');\n'
            + kits_js)


# ---------------------------------------------------------------- the geology a region's resources read
GEOLOGY = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'kits', 'resources', 'data', 'geology.json')
# kits/resources' fragments a region reads in place after geology_fragment() (45r loads RES_GEODATA itself)
RES_FRAGS = [('kits/resources/src', '42r-res-ore.js'), ('kits/resources/src', '45r-res-field.js')]


def _rle_decode(s, n):
    b = np.frombuffer(base64.b64decode(s), dtype=np.uint8)
    out = np.repeat(b[1::2], b[0::2].astype(np.int64) + 1)
    if out.size != n:
        raise ValueError('geology layer: %d bytes, the grid wants %d' % (out.size, n))
    return out


def _rle_encode(a):
    a = np.ascontiguousarray(a, dtype=np.uint8).ravel()
    out, i, n = bytearray(), 0, a.size
    while i < n:
        v, j = a[i], i + 1
        while j < n and a[j] == v and j - i < 256:
            j += 1
        out += bytes((j - i - 1, int(v)))
        i = j
    return base64.b64encode(bytes(out)).decode('ascii')


def geology_crop(data_dir, margin_px=8):
    """kits/resources/data/geology.json (the scale model's geology: provinces, the mask, a prospectivity byte per family per
    4 km cell over the whole 5.1 map) cropped to the region's box: the same grid and format (RES_GEO reads it unchanged, a
    cell's index and its nodes' ids are the map's), every layer zero outside the box (run-length coded, the zeros cost
    little), the placers and evaporite basins inside it; the polities and settlement lists dropped (the ledger's)"""
    D = json.load(open(GEOLOGY, encoding='utf-8'))
    M = meta(data_dir)
    G = D['grid']
    w, h = G['w'], G['h']
    bx0, by0, bx1, by1 = M['frame']['box_px']
    sx, sy = (w - 1) / (G['fullW'] - 1), (h - 1) / (G['fullH'] - 1)
    i0, i1 = max(0, int((bx0 - margin_px) * sx)), min(w, int((bx1 + margin_px) * sx) + 2)
    j0, j1 = max(0, int((by0 - margin_px) * sy)), min(h, int((by1 + margin_px) * sy) + 2)
    keep = np.zeros((h, w), dtype=bool)
    keep[j0:j1, i0:i1] = True
    layers = {}
    for k, s in D['layers'].items():
        a = _rle_decode(s, w * h).reshape(h, w)
        layers[k] = _rle_encode(np.where(keep, a, 0))
    inb = lambda x, z: bx0 - margin_px <= x / 2000.0 <= bx1 + margin_px and by0 - margin_px <= z / 2000.0 <= by1 + margin_px
    out = {k: v for k, v in D.items() if k not in ('layers', 'placers', 'basins', 'polities', 'settlements')}
    out['layers'] = layers
    out['placers'] = [p for p in D.get('placers', []) if inb(p['x'], p['z'])]
    out['basins'] = [b for b in D.get('basins', []) if inb(b['at_px'][0] * 2000, b['at_px'][1] * 2000)]
    out['crop'] = {'box_px': [bx0, by0, bx1, by1], 'cells': [i0, j0, i1, j1], 'by': 'core/world/world_data.py geology_crop'}
    return out


def geology_fragment(data_dir):
    """the generated fragment that carries a region's geology: var RES_GEODATA (kits/resources/src/45r-res-field.js loads it)"""
    return ('// ==================== the region\'s geology (generated by core/world/world_data.py geology_crop from\n'
            '// kits/resources/data/geology.json: do not edit)\n'
            'var RES_GEODATA=' + json.dumps(geology_crop(data_dir), separators=(',', ':'), ensure_ascii=False) + ';\n')
