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
