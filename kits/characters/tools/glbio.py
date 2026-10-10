"""Read a skinned GLB into numpy arrays, and write one back. Used by make_pieces.py.

read_rig(path) -> Rig: the single skinned mesh (every primitive merged; one material expected), its skin and the
bind pose as joint positions and rotations in mesh space. Joint names are stripped of 'mixamorig:'.

GlbWriter: buffer views and accessors appended one at a time, then a dict made into a .glb.
"""
import io, json, struct
import numpy as np
from PIL import Image

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read_glb(data):
    jl = struct.unpack('<I', data[12:16])[0]
    j = json.loads(data[20:20 + jl])
    o = 20 + jl
    bl = struct.unpack('<I', data[o:o + 4])[0] if o < len(data) else 0
    return j, data[o + 8:o + 8 + bl]


def accessor(j, b, i):
    a = j['accessors'][i]
    v = j['bufferViews'][a['bufferView']]
    dt, n = CT[a['componentType']], NC[a['type']]
    off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = v.get('byteStride', 0)
    isz = np.dtype(dt).itemsize * n
    if stride and stride != isz:
        raw = np.frombuffer(b, np.uint8, stride * (a['count'] - 1) + isz, off)
        out = np.stack([np.frombuffer(raw[k * stride:k * stride + isz].tobytes(), dt) for k in range(a['count'])])
    else:
        out = np.frombuffer(b, dt, a['count'] * n, off).reshape(a['count'], n)
    if a.get('normalized'):
        out = out.astype(np.float32) / np.iinfo(dt).max
    return out.astype(np.float32) if dt == np.float32 else out


def quat_mat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def mat_quat(m):
    t = np.trace(m)
    if t > 0:
        s = np.sqrt(t + 1) * 2
        q = [(m[2, 1] - m[1, 2]) / s, (m[0, 2] - m[2, 0]) / s, (m[1, 0] - m[0, 1]) / s, s / 4]
    else:
        i = int(np.argmax(np.diag(m)))
        if i == 0:
            s = np.sqrt(1 + m[0, 0] - m[1, 1] - m[2, 2]) * 2
            q = [s / 4, (m[0, 1] + m[1, 0]) / s, (m[0, 2] + m[2, 0]) / s, (m[2, 1] - m[1, 2]) / s]
        elif i == 1:
            s = np.sqrt(1 + m[1, 1] - m[0, 0] - m[2, 2]) * 2
            q = [(m[0, 1] + m[1, 0]) / s, s / 4, (m[1, 2] + m[2, 1]) / s, (m[0, 2] - m[2, 0]) / s]
        else:
            s = np.sqrt(1 + m[2, 2] - m[0, 0] - m[1, 1]) * 2
            q = [(m[0, 2] + m[2, 0]) / s, (m[1, 2] + m[2, 1]) / s, s / 4, (m[1, 0] - m[0, 1]) / s]
    q = np.array(q)
    return q / np.linalg.norm(q)


def node_matrix(n):
    if 'matrix' in n:
        return np.array(n['matrix'], float).reshape(4, 4).T
    m = np.eye(4)
    s = np.array(n.get('scale', [1, 1, 1]), float)
    m[:3, :3] = quat_mat(n.get('rotation', [0, 0, 0, 1])) * s
    m[:3, 3] = n.get('translation', [0, 0, 0])
    return m


class Rig:
    pass


def short(name):
    return name.split(':')[-1]


def read_rig(path):
    j, b = read_glb(open(path, 'rb').read())
    nodes = j['nodes']
    parent = {}
    for i, n in enumerate(nodes):
        for c in n.get('children', []):
            parent[c] = i

    def world(i):
        m = node_matrix(nodes[i])
        while i in parent:
            i = parent[i]
            m = node_matrix(nodes[i]) @ m
        return m

    mesh_nodes = [i for i, n in enumerate(nodes) if 'mesh' in n and 'skin' in n]
    if not mesh_nodes:
        raise SystemExit('%s: no skinned mesh' % path)
    skin = j['skins'][nodes[mesh_nodes[0]]['skin']]
    ibm = accessor(j, b, skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1).astype(float)
    r = Rig()
    r.json, r.bin, r.path = j, b, path
    r.joints = [short(nodes[i].get('name', 'j%d' % i)) for i in skin['joints']]
    jset = set(skin['joints'])
    r.parents = []
    for i in skin['joints']:
        p = parent.get(i)
        while p is not None and p not in jset:
            p = parent.get(p)
        r.parents.append(skin['joints'].index(p) if p is not None else -1)
    # the bind pose in mesh space: inverse(IBM). Meshy's and Mixamo's armatures may carry a scale (cm) in a parent
    # node; inverse(IBM) already includes it, and so do the vertices, so nothing else is needed
    bind = np.linalg.inv(ibm)
    r.jpos = bind[:, :3, 3].copy()
    r.jrot = np.stack([m[:3, :3] / np.linalg.norm(m[:3, :3], axis=0) for m in bind])
    r.mesh_world = world(mesh_nodes[0])
    pos, nrm, uv, jt, wt, idx = [], [], [], [], [], []
    base = 0
    mat = None
    for mn in mesh_nodes:
        if j['skins'][nodes[mn]['skin']] is not skin and j['skins'][nodes[mn]['skin']]['joints'] != skin['joints']:
            raise SystemExit('%s: more than one skin' % path)
        for p in j['meshes'][nodes[mn]['mesh']]['primitives']:
            A = p['attributes']
            P = accessor(j, b, A['POSITION'])
            pos.append(P)
            nrm.append(accessor(j, b, A['NORMAL']) if 'NORMAL' in A else np.zeros_like(P))
            uv.append(accessor(j, b, A['TEXCOORD_0']))
            jt.append(accessor(j, b, A['JOINTS_0']).astype(np.int32))
            wt.append(accessor(j, b, A['WEIGHTS_0']).astype(np.float32))
            ii = accessor(j, b, p['indices']).reshape(-1).astype(np.int64) if 'indices' in p else np.arange(len(P))
            idx.append(ii.reshape(-1, 3) + base)
            base += len(P)
            if mat is None:
                mat = p.get('material')
    r.pos, r.nrm, r.uv = np.concatenate(pos).astype(float), np.concatenate(nrm).astype(float), np.concatenate(uv)
    r.jt, r.wt, r.tri = np.concatenate(jt), np.concatenate(wt), np.concatenate(idx)
    r.wt = r.wt / np.maximum(r.wt.sum(1, keepdims=True), 1e-9)
    r.material = j['materials'][mat] if mat is not None and 'materials' in j else {}
    return r


def image(r, tex_index):
    """PIL image of texture tex_index of rig r"""
    j, b = r.json, r.bin
    src = j['images'][j['textures'][tex_index]['source']]
    v = j['bufferViews'][src['bufferView']]
    o = v.get('byteOffset', 0)
    return Image.open(io.BytesIO(b[o:o + v['byteLength']]))


class GlbWriter:
    def __init__(self):
        self.blobs, self.j = [], {'asset': {'version': '2.0', 'generator': 'kits/characters/make_pieces.py'},
                                  'bufferViews': [], 'accessors': [], 'buffers': []}
        self.size = 0

    def view(self, data, target=None):
        data = bytes(data)
        pad = (-self.size) % 4
        if pad:
            self.blobs.append(b'\0' * pad)
            self.size += pad
        v = {'buffer': 0, 'byteOffset': self.size, 'byteLength': len(data)}
        if target:
            v['target'] = target
        self.j['bufferViews'].append(v)
        self.blobs.append(data)
        self.size += len(data)
        return len(self.j['bufferViews']) - 1

    def acc(self, arr, kind, target=None, normalized=False, minmax=False):
        arr = np.ascontiguousarray(arr)
        ct = {np.dtype(np.float32): 5126, np.dtype(np.uint8): 5121, np.dtype(np.uint16): 5123,
              np.dtype(np.uint32): 5125}[arr.dtype]
        a = {'bufferView': self.view(arr.tobytes(), target), 'componentType': ct, 'count': len(arr), 'type': kind}
        if normalized:
            a['normalized'] = True
        if minmax:
            a['min'] = [float(x) for x in arr.reshape(len(arr), -1).min(0)]
            a['max'] = [float(x) for x in arr.reshape(len(arr), -1).max(0)]
        self.j['accessors'].append(a)
        return len(self.j['accessors']) - 1

    def bytes(self):
        bin_ = b''.join(self.blobs)
        bin_ += b'\0' * ((-len(bin_)) % 4)
        self.j['buffers'] = [{'byteLength': len(bin_)}]
        js = json.dumps(self.j, separators=(',', ':')).encode()
        js += b' ' * ((-len(js)) % 4)
        out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_))
        out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(bin_), 0x004E4942) + bin_
        return out
