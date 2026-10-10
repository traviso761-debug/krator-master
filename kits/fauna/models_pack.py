#!/usr/bin/env python3
"""Pack a rigged GLB into the compact model asset the fauna kit embeds (kits/fauna/models/<key>.json).

    python3 models_pack.py <in.glb> <out.json> --key giant-dragonfly --group flyers --scale 3.85

A model is a node tree (each part a node with its pivot, a mesh in the node's own frame), the clips that turn the nodes,
and three downsized baked maps (base colour, normal, metallic-roughness). Geometry is quantized (positions int16 inside
each mesh's own box, normals int8, UVs uint16) so five animals cost about a megabyte in a page. --scale is metres per
model unit: it makes the animal the size its entry declares.

The kit's frame is +z the snout, y up, **+x the animal's LEFT**. The rigs were cut with 'R' on +x, so node names that end in
L / R (wingL, legR, footL, leg0Lt ...) are renamed here by the sign of their pivot's x, once, so the kit's part names are
true (wingL is the left wing, the one on +x).

Needs numpy and PIL. Reads only the GLB it is given (never the Meshy API), so a repack is deterministic.
"""
import argparse, base64, io, json, os, re, struct, sys
import numpy as np
from PIL import Image


def load_glb(path):
    b = open(path, 'rb').read()
    jl = struct.unpack('<I', b[12:16])[0]
    J = json.loads(b[20:20 + jl].decode('utf-8'))
    return J, b[20 + jl + 8:]


def accessor(J, BIN, i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]
    n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dt = {5126: '<f4', 5125: '<u4', 5123: '<u2'}[a['componentType']]
    return np.frombuffer(BIN, dt, a['count'] * n, v['byteOffset'] + a.get('byteOffset', 0)).reshape(-1, n)


def b64(arr):
    return base64.b64encode(np.ascontiguousarray(arr).tobytes()).decode('ascii')


def jpeg(blob, size, q):
    im = Image.open(io.BytesIO(blob)).convert('RGB')
    if max(im.size) > size:
        im = im.resize((size, size), Image.LANCZOS)
    out = io.BytesIO(); im.save(out, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(out.getvalue()).decode('ascii')


SIDE = re.compile(r'^(wing2?|wingO2?|leg\d*|legT\d*|foot)([LR])(t?)$')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('glb'); ap.add_argument('out')
    ap.add_argument('--key', required=True); ap.add_argument('--group', required=True)
    ap.add_argument('--scale', type=float, required=True, help='metres per model unit')
    ap.add_argument('--tex', type=int, default=1024, help='base colour and normal map size (px)')
    ap.add_argument('--mrtex', type=int, default=512, help='metallic-roughness map size (px)')
    a = ap.parse_args()
    J, BIN = load_glb(a.glb)
    nodes = J['nodes']
    parent = {c: i for i, nd in enumerate(nodes) for c in nd.get('children', [])}

    def world_t(i):
        p = np.zeros(3)
        while i is not None:
            p += np.array(nodes[i].get('translation', [0, 0, 0]), float); i = parent.get(i)
        return p
    # true left / right: +x is the animal's left
    rename = {}
    for i, nd in enumerate(nodes):
        m = SIDE.match(nd['name'])
        if m:
            x = world_t(i)[0]
            if abs(x) > 1e-6:
                rename[nd['name']] = m.group(1) + ('L' if x > 0 else 'R') + m.group(3)
    names = [rename.get(nd['name'], nd['name']) for nd in nodes]
    assert len(set(names)) == len(names), 'renaming made two nodes share a name'

    out_nodes, meshes = [], {}
    tris = 0
    for i, nd in enumerate(nodes):
        out_nodes.append({'name': names[i], 'parent': parent.get(i, -1), 't': [round(float(x), 6) for x in nd.get('translation', [0, 0, 0])]})
        if 'mesh' not in nd:
            continue
        prim = J['meshes'][nd['mesh']]['primitives'][0]; at = prim['attributes']
        P = accessor(J, BIN, at['POSITION']).astype(np.float64); Nn = accessor(J, BIN, at['NORMAL']).astype(np.float64)
        UV = accessor(J, BIN, at['TEXCOORD_0']).astype(np.float64); idx = accessor(J, BIN, prim['indices']).reshape(-1)
        lo, hi = P.min(0), P.max(0); sc = np.maximum(hi - lo, 1e-9)
        q = np.round((P - lo) / sc * 65535).astype('<u2')
        nq = np.round(np.clip(Nn, -1, 1) * 127).astype('i1')
        uq = np.round(np.clip(UV, 0, 1) * 65535).astype('<u2')
        ix = idx.astype('<u2') if len(P) < 65536 else idx.astype('<u4')
        meshes[names[i]] = {'n': int(len(P)), 'min': [round(float(x), 6) for x in lo], 'size': [round(float(x), 6) for x in sc],
                            'pos': b64(q), 'nrm': b64(nq), 'uv': b64(uq), 'idx': b64(ix), 'wide': bool(len(P) >= 65536)}
        tris += len(idx) // 3

    anims = {}
    for an in J.get('animations', []):
        tracks = []
        for c in an['channels']:
            s = an['samplers'][c['sampler']]
            t = accessor(J, BIN, s['input']).reshape(-1).astype('<f4'); v = accessor(J, BIN, s['output']).astype('<f4')
            tracks.append({'node': names[c['target']['node']], 'path': {'rotation': 'quaternion', 'translation': 'position', 'scale': 'scale'}[c['target']['path']], 't': b64(t), 'v': b64(v)})
        anims[an['name']] = {'dur': round(float(accessor(J, BIN, an['samplers'][0]['input']).max()), 6), 'tracks': tracks}
        if an.get('extras'):
            anims[an['name']]['extras'] = an['extras']

    # the rest pose (the 'perch' clip at t = 0): its box, where the feet stand, the middle of the body
    chans = {}
    perch = [x for x in J['animations'] if x['name'] == 'perch'][0]
    for c in perch['channels']:
        s = perch['samplers'][c['sampler']]; chans[(c['target']['node'], c['target']['path'])] = accessor(J, BIN, s['output'])[0].astype(float)

    def qmat(q):
        x, y, z, w = q
        return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])

    def world(i):
        chain = []
        while i is not None:
            chain.append(i); i = parent.get(i)
        M = np.eye(4)
        for j in reversed(chain):
            t = np.array(nodes[j].get('translation', [0, 0, 0]), float)
            if (j, 'translation') in chans:
                t = chans[(j, 'translation')]
            R = qmat(chans[(j, 'rotation')]) if (j, 'rotation') in chans else np.eye(3)
            if (j, 'scale') in chans:
                R = R @ np.diag(chans[(j, 'scale')])
            L = np.eye(4); L[:3, :3] = R; L[:3, 3] = t; M = M @ L
        return M
    allv, footy = [], []
    for i, nd in enumerate(nodes):
        if 'mesh' in nd:
            P = accessor(J, BIN, J['meshes'][nd['mesh']]['primitives'][0]['attributes']['POSITION']).astype(float)
            w = (np.c_[P, np.ones(len(P))] @ world(i).T)[:, :3]; allv.append(w)
            if names[i].startswith('foot'): footy.append(w[:, 1].min())
    if not footy:   # no feet parts: the legs' lowest point
        footy = [(np.c_[accessor(J, BIN, J['meshes'][nd['mesh']]['primitives'][0]['attributes']['POSITION']).astype(float), np.ones(accessor(J, BIN, J['meshes'][nd['mesh']]['primitives'][0]['attributes']['POSITION']).shape[0])] @ world(i).T)[:, 1].min()
                 for i, nd in enumerate(nodes) if 'mesh' in nd and names[i].startswith('leg')]
    allv = np.vstack(allv); bmin, bmax = allv.min(0), allv.max(0)
    if footy:
        bmin = bmin.copy(); bmin[1] = min(footy)      # the animal stands on its feet, whatever hangs lower (a folded wing tip)
    S = a.scale
    info = {'ground': round(float(bmin[1]), 6), 'center': [round(float((bmin[0] + bmax[0]) / 2), 6), round(float((bmax[2] + bmin[2]) / 2), 6)],
            'w': round(float((bmax[0] - bmin[0]) * S), 3), 'd': round(float((bmax[2] - bmin[2]) * S), 3), 'h': round(float((bmax[1] - bmin[1]) * S), 3)}
    # the declared box: the union of the rest pose and every clip (8 samples each), measured from the feet's ground and the body's middle
    meshnodes = [(i, accessor(J, BIN, J['meshes'][nd['mesh']]['primitives'][0]['attributes']['POSITION']).astype(float)) for i, nd in enumerate(nodes) if 'mesh' in nd]
    lo_all, hi_all = bmin.copy(), bmax.copy()
    for an in J.get('animations', []):
        outs = {(c['target']['node'], c['target']['path']): accessor(J, BIN, an['samplers'][c['sampler']]['output']).astype(float) for c in an['channels']}
        nk = max(len(v) for v in outs.values())
        for ki in np.unique(np.linspace(0, nk - 1, 9).astype(int)):
            chans.clear(); chans.update({k: v[min(ki, len(v) - 1)] for k, v in outs.items()})
            pts = np.vstack([(np.c_[P, np.ones(len(P))] @ world(i).T)[:, :3] for i, P in meshnodes])
            lo_all = np.minimum(lo_all, pts.min(0)); hi_all = np.maximum(hi_all, pts.max(0))
    info['extent'] = {'w': round(float((hi_all[0] - lo_all[0]) * S), 3), 'd': round(float((hi_all[2] - lo_all[2]) * S), 3), 'h': round(float((hi_all[1] - lo_all[1]) * S), 3)}

    mat = J['materials'][0]; pbr = mat['pbrMetallicRoughness']
    def img(texinfo):
        return J['images'][J['textures'][texinfo['index']]['source']]
    def data(im):
        v = J['bufferViews'][im['bufferView']]; return BIN[v['byteOffset']:v['byteOffset'] + v['byteLength']]
    tex = {'map': jpeg(data(img(pbr['baseColorTexture'])), a.tex, 84), 'nrm': jpeg(data(img(mat['normalTexture'])), a.tex, 84),
           'mr': jpeg(data(img(pbr['metallicRoughnessTexture'])), a.mrtex, 84)}

    doc = {'format': 1, 'key': a.key, 'group': a.group, 'scale': S, 'tris': tris, 'rest': info, 'nodes': out_nodes, 'meshes': meshes, 'anims': anims, 'tex': tex,
           'renamed': rename}
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(doc, fh, sort_keys=True, separators=(',', ':'))
    print('%s: %d tris, %d nodes, clips %s, rest %sx%sx%s m, any pose %sx%sx%s m, ground %.4f, %.2f MB' % (a.key, tris, len(out_nodes), sorted(anims), info['w'], info['d'], info['h'], info['extent']['w'], info['extent']['d'], info['extent']['h'], info['ground'], os.path.getsize(a.out) / 1e6))


if __name__ == '__main__':
    main()
