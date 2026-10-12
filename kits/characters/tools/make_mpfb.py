#!/usr/bin/env python3
"""MakeHuman (MPFB2) bodies for the editor: the base and its library items, made in Blender, packed for the page.

  blender -b --python tools/mpfb_build.py -- <male|female> <export dir>    # the Blender half (needs MPFB2 + asset packs)
  python3 tools/make_mpfb.py <male|female> <export dir>                      # this half

The Blender half builds an MPFB human on the Mixamo rig with a skin, loads library clothes, hair, brows and lashes
(MPFB fits them to the body and interpolates their weights from it), and exports the base and each item as its own
GLB on that rig, with each item's delete group (the base vertices it covers) as positions.

This half, per GLB: applies RY (identity: MPFB already faces +Z; positions, normals, tangents and inverse binds would
be rewritten, since the page builds its bones from skeleton.json), shrinks its textures (JPEG,
or PNG where there is alpha: hair, lashes), and writes pieces/mpfb_<body>/<id>.glb. The base's rig becomes the body's
canonical skeleton (data/mpfb_<body>/skeleton.json) and every clip is retargeted onto it (make_pieces.write_anims).
Each delete group becomes a bitset over the triangles of the base's skin primitive (material 'Human.body'):
data/mpfb_<body>/kit.json, read by KCHAR (kit.style 'mpfb').
"""
import base64, io, json, os, struct, sys
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glbio
import make_pieces as mp

HERE = mp.HERE
# MPFB's glTF export already faces +Z with its left side on +X (the convention every piece here uses); kept as a hook
# in case a future export needs turning
RY = np.eye(3)


def turn_glb(src, out, max_px=1024):
    j, b = glbio.read_glb(open(src, 'rb').read())
    b = bytearray(b)

    def view(ai):
        a = j['accessors'][ai]
        v = j['bufferViews'][a['bufferView']]
        off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        if v.get('byteStride') not in (None, 12, 16, 64) and a['type'] in ('VEC3', 'VEC4', 'MAT4'):
            raise SystemExit('make_mpfb.py: strided %s in %s' % (a['type'], src))
        n = {'VEC3': 3, 'VEC4': 4, 'MAT4': 16}[a['type']]
        return a, np.frombuffer(b, np.float32, a['count'] * n, off).reshape(a['count'], n).copy(), off
    done = set()
    for m in j.get('meshes', []):
        for p in m['primitives']:
            for att in ('POSITION', 'NORMAL', 'TANGENT'):
                ai = p['attributes'].get(att)
                if ai is None or ai in done:
                    continue
                done.add(ai)
                a, arr, off = view(ai)
                arr[:, :3] = arr[:, :3] @ RY.T
                b[off:off + arr.nbytes] = arr.astype(np.float32).tobytes()
                if att == 'POSITION':
                    a['min'] = [float(x) for x in arr.min(0)]
                    a['max'] = [float(x) for x in arr.max(0)]
    for s in j.get('skins', []):
        ai = s['inverseBindMatrices']
        if ai in done:
            continue
        done.add(ai)
        a, arr, off = view(ai)
        M = arr.reshape(-1, 4, 4).transpose(0, 2, 1).astype(float)
        R4 = np.eye(4)
        R4[:3, :3] = RY
        M = M @ R4.T                                # IBM' = IBM inv(R): vertices and joints both turned by R
        b[off:off + arr.nbytes] = M.transpose(0, 2, 1).astype(np.float32).tobytes()
    # textures: smaller; PNG kept where the image has alpha (hair cards, lashes)
    blobs = {}
    for im in j.get('images', []):
        v = j['bufferViews'][im['bufferView']]
        o = v.get('byteOffset', 0)
        img = Image.open(io.BytesIO(bytes(b[o:o + v['byteLength']])))
        alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
        img = img.convert('RGBA' if alpha else 'RGB')
        if max(img.size) > max_px:
            img = img.resize((max_px, max_px), Image.LANCZOS)
        bio = io.BytesIO()
        if alpha:
            img.save(bio, 'PNG', optimize=True)
            im['mimeType'] = 'image/png'
        else:
            img.save(bio, 'JPEG', quality=86)
            im['mimeType'] = 'image/jpeg'
        blobs[im['bufferView']] = bio.getvalue()
    parts, off = [], 0
    for k, v in enumerate(j['bufferViews']):
        o = v.get('byteOffset', 0)
        data = blobs.get(k, bytes(b[o:o + v['byteLength']]))
        pad = (-off) % 4
        parts.append(b'\0' * pad)
        off += pad
        v['byteOffset'], v['byteLength'] = off, len(data)
        parts.append(data)
        off += len(data)
    binb = b''.join(parts) + b'\0' * ((-off) % 4)
    j['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(out, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + binb)


def body_primitive(path):
    """positions and triangles of the base's skin primitive (material 'Human.body')"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    for m in j['meshes']:
        for p in m['primitives']:
            mat = j['materials'][p['material']]['name'] if 'material' in p else ''
            if mat.endswith('.body'):
                P = glbio.accessor(j, b, p['attributes']['POSITION']).astype(float)
                T = glbio.accessor(j, b, p['indices']).reshape(-1, 3).astype(int)
                return mat, P, T
    raise SystemExit('make_mpfb.py: no body primitive in ' + path)


def bits(n, idx):
    a = np.zeros((n + 7) // 8 * 8, np.uint8)
    a[np.asarray(idx, int)] = 1
    return base64.b64encode(np.packbits(a, bitorder='little').tobytes()).decode()


def main():
    body, src = sys.argv[1], sys.argv[2]
    name = 'mpfb_' + body
    pieces = os.path.join(HERE, 'pieces', name)
    data = os.path.join(HERE, 'data', name)
    os.makedirs(pieces, exist_ok=True)
    os.makedirs(data, exist_ok=True)
    man = json.load(open(os.path.join(src, 'manifest.json')))
    dg = json.load(open(os.path.join(src, 'delete_groups.json')))
    turn_glb(os.path.join(src, 'base.glb'), os.path.join(pieces, 'base.glb'))
    c = mp.load(os.path.join(pieces, 'base.glb'))
    c.J = {n: i for i, n in enumerate(c.joints)}
    mat, BP, BT = body_primitive(os.path.join(pieces, 'base.glb'))
    tree = cKDTree(BP)
    items = []
    for it in man['items']:
        turn_glb(os.path.join(src, it['glb']), os.path.join(pieces, it['id'] + '.glb'))
        entry = {'id': it['id'], 'name': it['name'], 'slot': it['slot'], 'glb': 'pieces/%s/%s.glb' % (name, it['id'])}
        pts = np.array(dg.get(it['id'], []), float)
        if len(pts):
            # Blender world (Z up) -> glTF (Y up: x, z, -y) -> half a turn
            g = np.stack([pts[:, 0], pts[:, 2], -pts[:, 1]], 1) @ RY.T
            d, k = tree.query(g)
            hit = np.zeros(len(BP), bool)
            hit[k[d < 1e-3]] = True
            # MPFB's mask drops a face when any of its vertices is in the group
            tris = np.nonzero(hit[BT].any(1))[0]
            entry['hide'] = bits(len(BT), tris)
            entry['hides'] = int(len(tris))
        items.append(entry)
        print('%-8s %-6s %-34s hides %5d' % (name, it['slot'], it['id'], entry.get('hides', 0)))
    clips = mp.write_anims(os.path.join(pieces, 'anims.glb'), c)
    names, parents, jnodes, W = mp.skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in mp.FACE})
    json.dump({'joints': [{'name': n['name'], 'parent': parents[i], 't': n['translation'], 'r': n['rotation']}
                          for i, n in enumerate(jnodes)], 'clips': clips},
              open(os.path.join(data, 'skeleton.json'), 'w'), indent=1)
    json.dump({'body': name, 'style': 'mpfb', 'label': 'MakeHuman ' + body, 'base_glb': 'pieces/%s/base.glb' % name,
               'base_material': mat, 'base_tris': int(len(BT)), 'items': items},
              open(os.path.join(data, 'kit.json'), 'w'), indent=1)
    print(name, 'height %.2f m' % (c.jpos[c.J['HeadTop_End']][1] if 'HeadTop_End' in c.J else -1), len(items), 'items')


if __name__ == '__main__':
    main()
