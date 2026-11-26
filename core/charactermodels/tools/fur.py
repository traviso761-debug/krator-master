"""Fur regions of the generated garments, for the pieces built before make_garments.py wrote them.

make_garments.py writes each garment's fur (its .cloth.json 'fur', fur_of) and make_mpfb.py carries it into the kit item;
this fills it in for pieces already built, from their GLBs: the texture strip of each fur part (strips run top to bottom
in the order of the garment's parts) and, inside it or on a trim, the rows painted in a fur colour. A fur entry is
[v0, v1, kind, mu, mv]: rows v0 to v1 of the texture (glTF v, 0 at the top), the fur kind (data/fur.json), and the
metres one unit of u and of v spans on the garment (the strip's girth and its length over its v span), so a strand is
the same size on a hat's crown and down a trouser leg. The figure draws it as shells (50-figure.js fur, kchar_figure.gd
_fur).

    python3 tools/fur.py <body> <piece.glb or published piece .txt> ...    # mpfb_male, mpfb_female
"""
import base64, gzip, io, json, os, struct, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# make_garments.py's fur paints (C['fur'], C['darkfur']), linear
FUR, DARK = np.array([0.44, 0.33, 0.22]), np.array([0.20, 0.15, 0.11])
# per garment (sex 's'): the strips that are fur parts, with their kind, and the strips with a fur trim painted on.
# From make_garments.py: a part whose paint's fabric is fur.* (a sole is left bare: it lies on the ground), and a
# 'feather' or 'solid' band in the fur colours on any part (fur_of); the Beast Riders' fringes ('rays' of buckskin) are
# not fur
TABLE = {
    'beast_%s_trade_deel': {'parts': {2: 'short'}},                         # the fur pauldron
    'beast_%s_trade_hat': {'parts': {1: 'short'}},                          # the brim
    'beast_%s_trade_boots': {'parts': {3: 'short', 7: 'short'}},            # the cuffs (0 and 4 the soles)
    'beast_%s_trade_trousers': {'parts': {0: 'short', 1: 'short', 2: 'short'}},
    'beast_m_noble_horns': {'parts': {0: 'short'}},                         # the cap
    'rep_%s_trade_ushanka': {'parts': {1: 'short', 2: 'short', 3: 'short'}},  # the brim and the ear flaps
    'rep_m_fest_trade_ushanka': {'parts': {1: 'short', 2: 'short', 3: 'short'}},
    'rep_%s_noble_papakha': {'parts': {0: 'astrakhan'}},                    # its red crown left bare
    'rep_m_fest_noble_papakha': {'parts': {0: 'astrakhan'}},
    'rep_m_fest_peasant_cap': {'parts': {1: 'short'}},                      # the fur band
    'rep_f_fest_noble_gown': {'trims': {2: 'short'}},                       # the cape's edge
}

CT = {5121: np.uint8, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def glb(path):
    raw = open(path, 'rb').read()
    if path.endswith('.txt'):                     # a published piece: base64 gzip, its morphs on a second line
        raw = gzip.decompress(base64.b64decode(raw.split(b'\n')[0]))
    n = struct.unpack_from('<I', raw, 12)[0]
    js = json.loads(raw[20:20 + n].decode('utf-8'))
    bl = struct.unpack_from('<I', raw, 20 + n)[0]
    return js, raw[28 + n:28 + n + bl]


def accessor(js, b, i):
    a = js['accessors'][i]
    bv = js['bufferViews'][a['bufferView']]
    nc, dt = NC[a['type']], np.dtype(CT[a['componentType']])
    off, stride = bv.get('byteOffset', 0) + a.get('byteOffset', 0), bv.get('byteStride', 0) or nc * dt.itemsize
    rows = np.lib.stride_tricks.as_strided(np.frombuffer(b, np.uint8, offset=off), (a['count'], nc * dt.itemsize), (stride, 1))
    return np.ascontiguousarray(rows).view(dt).reshape(a['count'], nc)


def strips(uv, tris):
    """the texture strips, top to bottom: the v spans the triangles cover, joined where they overlap"""
    tv = uv[tris][:, :, 1]
    lo, hi = tv.min(1), tv.max(1)
    out = []
    for t in np.argsort(lo, kind='stable'):
        if out and lo[t] <= out[-1][1] + 1e-4:
            out[-1][1] = max(out[-1][1], hi[t])
        else:
            out.append([float(lo[t]), float(hi[t])])
    return out


def metres(pos, uv, tris, v0, v1):
    """the metres a unit of u and of v spans on the triangles in rows v0 to v1: each edge's length against its change
    in u (or v), weighted by how much of the edge runs that way"""
    sel = tris[(uv[tris][:, :, 1].mean(1) >= v0) & (uv[tris][:, :, 1].mean(1) <= v1)]
    e = np.concatenate([sel[:, [0, 1]], sel[:, [1, 2]], sel[:, [2, 0]]])
    L = np.linalg.norm(pos[e[:, 0]] - pos[e[:, 1]], axis=1)
    d = np.abs(uv[e[:, 0]] - uv[e[:, 1]])
    d[:, 0] = np.minimum(d[:, 0], 1 - d[:, 0])    # across a closed tube's seam
    out = []
    for k in (0, 1):
        w = d[:, k] / np.maximum(np.linalg.norm(d, axis=1), 1e-9)
        ok = (d[:, k] > 1e-5) & (w > 0.9)
        out.append(float(np.sum(L[ok] * w[ok]) / max(np.sum(d[ok, k]), 1e-9)) if ok.any() else 0.0)
    return out


def near_fur(rows):
    """each row's distance from the line of fur colours (C['fur'] to C['darkfur']: a feather band mixes the two)"""
    t = np.clip(((rows - DARK) @ (FUR - DARK)) / ((FUR - DARK) @ (FUR - DARK)), 0, 1)
    return np.linalg.norm(rows - (DARK + t[:, None] * (FUR - DARK)), axis=1)


def runs(ok, r0, H):
    out, k = [], 0
    while k < len(ok):
        if ok[k]:
            e = k
            while e < len(ok) and ok[e]:
                e += 1
            if e - k >= 3:
                out.append([(r0 + k) / H, (r0 + e) / H])
            k = e
        else:
            k += 1
    return out


def fur_of(path, spec):
    js, b = glb(path)
    pr = js['meshes'][0]['primitives'][0]
    pos = accessor(js, b, pr['attributes']['POSITION']).astype(float)
    uv = accessor(js, b, pr['attributes']['TEXCOORD_0']).astype(float)
    tris = accessor(js, b, pr['indices']).reshape(-1, 3)
    bv = js['bufferViews'][js['images'][0]['bufferView']]
    o = bv.get('byteOffset', 0)
    im = (np.asarray(Image.open(io.BytesIO(b[o:o + bv['byteLength']])).convert('RGB'), float) / 255.0) ** 2.2
    H = im.shape[0]
    S = strips(uv, tris)
    out = []
    for k, (a, c) in enumerate(S):
        kind = spec.get('parts', {}).get(k) or spec.get('trims', {}).get(k)
        if not kind:
            continue
        r0, r1 = int(round(a * H)), int(round(c * H))
        rows = im[r0:r1].mean(1)
        if k in spec.get('parts', {}):
            # a fur part: all of it but the bands in another colour (the papakha's crown): rows far from the strip's own
            # colour and from the fur colours
            base = np.median(rows, 0)
            ok = (np.linalg.norm(rows - base, axis=1) < 0.06) | (near_fur(rows) < 0.035)
        else:
            ok = near_fur(rows) < 0.035
        for v0, v1 in runs(ok, r0, H):
            v0, v1 = max(v0, a), min(v1, c)
            mu, mv = metres(pos, uv, tris, v0, v1)
            out.append([round(v0, 5), round(v1, 5), kind, round(mu, 4), round(mv, 4)])
    return out


def main():
    body, paths = sys.argv[1], sys.argv[2:]
    kpath = os.path.join(HERE, '..', 'data', body, 'kit.json')
    kit = json.load(open(kpath, encoding='utf-8'))
    sex = {'mpfb_male': 'm', 'mpfb_female': 'f'}[body]
    table = {k.replace('%s', sex): v for k, v in TABLE.items()}
    items = {it['id']: it for it in kit['items']}
    for p in paths:
        gid = os.path.basename(p).rsplit('.', 1)[0]
        if gid not in table or gid not in items:
            continue
        f = fur_of(p, table[gid])
        items[gid]['fur'] = f
        print('%-12s %-28s %s' % (body, gid, ' '.join('%.4f-%.4f %s %.3fx%.3f' % tuple(x) for x in f)))
    with open(kpath, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(kit, fh, indent=1)


if __name__ == '__main__':
    main()
