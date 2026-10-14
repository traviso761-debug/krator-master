"""Body mods: what a genetic or cybernetic mod adds to a MakeHuman body, worn like an item (kit items in slot 'mods').

Every body's skeleton carries a second pair of arms' joints (add_joints: Left2Shoulder, Left2Arm ... Right2HandThumb3,
hung from Spine2 below the first pair (arms2.drop: out of the lower ribs on any torso), INSET nearer the axis, HANG steeper), whether a mod uses them or not: the
clips, the grips (skeleton hands L2, R2), the capsules and the figure's lower-arm controller (50-figure.js arms2) are
the same on every body. Nothing is drawn on them until a mod is worn:

  mod_arms_flesh   the genetic pair: each arm's skin and nails copied onto the lower joints, its root grown out of the
                   ribs (shrink-wrapped onto the torso and given the torso's weights, BLEND from its open edge)
  mod_arms_cyber, mod_arms_loader, mod_arms_surgical
                   the cybernetic pairs (CYBER: bronze; heavy steel with rams and claws; slim ceramic with cables):
                   jointed limbs on the same joints, each part rigid on its bone, on a mount plate on the ribs, sized
                   to the body's arm
  mod_gills        rib gills (the Hykkousoi's, or anyone's with the mod): four slits a side over the ribs, a lip of skin
                   over a dark slit, ray-cast onto the body

Each piece's vertices carry a _VIDX (the MakeHuman vertex whose morph deltas move it: for the flesh arms the vertex it
copies, for the gills the nearest skin, for a cybernetic part the skin at the joint it copies), so the body's sliders
move them with the body (make_mpfb.py packs their deltas from the base's). A mod's kit entry says what it grants
(grants.arms 4, grants.gills) and its group (one pair of arms at a time). Torso clothing has an arm count (kit item
arms, 2 by default): a body with four arms wears only four-armed tops (KCHAR.fits)."""
import copy
import io
import json
import math

import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

import glbio

from arms2 import INSET, HANG, drop_of, fwd, lower, upper  # where the lower pair hangs (shared with make_garments.py)

BLEND = 0.09           # metres: how far from the flesh copy's open edge it blends into the torso
TUCK = 0.05            # the point inside the ribs the copy's open root is drawn toward, in from its shoulder joint
SIDES = ('Left', 'Right')


def chain_names(names, S):
    return [n for n in names if n.startswith((S + 'Shoulder', S + 'Arm', S + 'ForeArm', S + 'Hand'))]


def hang(S, sx, bind, jidx):
    """(pivot, R): the lower arm's turn at rest, about its shoulder joint, down toward the body by HANG"""
    a = -sx * np.radians(HANG)
    R = np.array([[np.cos(a), -np.sin(a), 0], [np.sin(a), np.cos(a), 0], [0, 0, 1.0]])
    return bind[jidx[S + 'Arm']][:3, 3] + np.array([-sx * INSET, -drop_of(bind, jidx), fwd(drop_of(bind, jidx))]), R


def _quat(R):
    return glbio.mat_quat(R / np.linalg.norm(R, axis=0))


def _write(path, j, b, blobs):
    parts_out, off = [], 0
    for k, v in enumerate(j['bufferViews']):
        o = v.get('byteOffset', 0)
        data = blobs.get(k, bytes(b[o:o + v['byteLength']]))
        pad = (-off) % 4
        parts_out.append(b'\0' * pad)
        off += pad
        v['byteOffset'], v['byteLength'] = off, len(data)
        parts_out.append(data)
        off += len(data)
    binb = b''.join(parts_out) + b'\0' * ((-off) % 4)
    j['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    import struct
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + binb)


def add_joints(path):
    """the lower pair's joints in a GLB's skin (a base's, or a four-armed garment's: no skin of their own here, the
    mods bring that); returns their names, or [] when the skin has them already"""
    j, b = glbio.read_glb(open(path, 'rb').read())
    nodes = j['nodes']
    hn = next((i for i, n in enumerate(nodes) if n.get('name') == 'Human' and 'skin' in n), None)
    if hn is None:
        hn = next(i for i, n in enumerate(nodes) if 'skin' in n)
    skin = j['skins'][nodes[hn]['skin']]
    names = [glbio.short(nodes[k].get('name', '')) for k in skin['joints']]
    if 'Left2Arm' in names:
        return []
    ibm = glbio.accessor(j, b, skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1).astype(float)
    bind = np.linalg.inv(ibm)
    parent = {}
    for i, n in enumerate(nodes):
        for ch in n.get('children', []):
            parent[ch] = i
    jidx = {n: k for k, n in enumerate(names)}
    new_names, new_bind, new_par, remap = [], [], [], {}
    for sx, S in zip((1, -1), SIDES):
        off = np.array([-sx * INSET, -drop_of(bind, jidx), fwd(drop_of(bind, jidx))])
        for n in chain_names(names, S):
            k = jidx[n]
            B = bind[k].copy()
            B[:3, 3] += off
            if not n.startswith(S + 'Shoulder'):         # the arm and all below it hang further down (HANG)
                pv, R = hang(S, sx, bind, jidx)
                B[:3, :3] = R @ B[:3, :3]
                B[:3, 3] = pv + R @ (B[:3, 3] - pv)
            remap[k] = len(names) + len(new_names)
            new_names.append(lower(n))
            new_bind.append(B)
            pk = parent.get(skin['joints'][k])
            new_par.append(names[skin['joints'].index(pk)] if pk in skin['joints'] else None)
    base_n = len(nodes)
    all_bind = list(bind) + new_bind
    for i, (n, B, pn) in enumerate(zip(new_names, new_bind, new_par)):
        pk = remap[jidx[pn]] if jidx[pn] in remap else jidx[pn]
        L = np.linalg.inv(all_bind[pk]) @ B
        nodes.append({'name': n, 'translation': [float(x) for x in L[:3, 3]], 'rotation': [float(x) for x in _quat(L[:3, :3])]})
        pnode = skin['joints'][pk] if pk < len(names) else base_n + (pk - len(names))
        nodes[pnode].setdefault('children', []).append(base_n + i)
    skin['joints'] = skin['joints'] + [base_n + i for i in range(len(new_names))]
    old = glbio.accessor(j, b, skin['inverseBindMatrices']).reshape(-1, 16)
    newi = np.linalg.inv(np.stack(new_bind)).transpose(0, 2, 1).reshape(-1, 16)
    j['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': 0})
    data = np.concatenate([old, newi]).astype(np.float32).tobytes()
    j['accessors'].append({'bufferView': len(j['bufferViews']) - 1, 'componentType': 5126, 'count': len(old) + len(newi), 'type': 'MAT4'})
    skin['inverseBindMatrices'] = len(j['accessors']) - 1
    _write(path, j, b, {len(j['bufferViews']) - 1: data})
    return new_names


class Body:
    """a base GLB (with the lower joints) read for the mods: its joints at bind, and the skin and nails primitives"""
    def __init__(self, path):
        j, b = glbio.read_glb(open(path, 'rb').read())
        self.j, self.b = j, b
        nodes = j['nodes']
        self.hn = next(i for i, n in enumerate(nodes) if n.get('name') == 'Human' and 'skin' in n)
        self.skin = j['skins'][nodes[self.hn]['skin']]
        self.names = [glbio.short(nodes[k].get('name', '')) for k in self.skin['joints']]
        self.jidx = {n: k for k, n in enumerate(self.names)}
        self.ibm = glbio.accessor(j, b, self.skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1).astype(float)
        self.bind = np.linalg.inv(self.ibm)
        self.prims = {}
        for p in j['meshes'][nodes[self.hn]['mesh']]['primitives']:
            mname = j['materials'][p['material']]['name'] if 'material' in p else ''
            at = p['attributes']
            A = {k: glbio.accessor(j, b, v) for k, v in at.items()}
            aw = j['accessors'][at['WEIGHTS_0']]
            W = A['WEIGHTS_0'].astype(float)
            if aw.get('normalized'):
                W = W / {5121: 255.0, 5123: 65535.0}[aw['componentType']]
            A['W'] = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
            A['J'] = A['JOINTS_0'].astype(int)
            A['T'] = glbio.accessor(j, b, p['indices']).reshape(-1, 3).astype(int)
            A['VID'] = np.rint(A['_VIDX'].reshape(len(A['POSITION']), -1)[:, 0]).astype(int)
            A['mat'] = j['materials'][p['material']]
            self.prims[mname] = A
        B = self.prims['Human.body']
        arms = [self.jidx[n] for S in SIDES for n in chain_names(self.names, S) if not n.startswith(S + 'Shoulder')]
        self.torso = np.nonzero(np.where(np.isin(B['J'], arms), B['W'], 0).sum(1) < 0.05)[0]
        self.ttree = cKDTree(B['POSITION'][self.torso].astype(float))

    def P(self, n):
        return self.bind[self.jidx[n]][:3, 3]

    def texture(self, mname, px):
        """the colour texture of a base material, as JPEG bytes at most px wide (None if it has none)"""
        t = self.prims[mname]['mat'].get('pbrMetallicRoughness', {}).get('baseColorTexture')
        if t is None:
            return None
        im = self.j['images'][self.j['textures'][t['index']]['source']]
        v = self.j['bufferViews'][im['bufferView']]
        o = v.get('byteOffset', 0)
        img = Image.open(io.BytesIO(bytes(self.b[o:o + v['byteLength']]))).convert('RGB')
        if max(img.size) > px:
            img = img.resize((px, px), Image.LANCZOS)
        bio = io.BytesIO()
        img.save(bio, 'JPEG', quality=85)
        return bio.getvalue(), 'image/jpeg'

    def skin_at(self, pts):
        """per point: the nearest torso vertex (index into the body primitive)"""
        _, q = self.ttree.query(pts)
        return self.torso[q]


def flat(rgb):
    """a 4 x 4 PNG of one colour (the pages set an untinted item's colour to white: the texture carries it)"""
    bio = io.BytesIO()
    Image.new('RGB', (4, 4), tuple(int(rgb[k:k + 2], 16) for k in (1, 3, 5))).save(bio, 'PNG')
    return bio.getvalue(), 'image/png'


def write_piece(body, out, name, prims):
    """a GLB holding one skinned mesh on the body's skeleton (its nodes and skin, the lower joints with them).
    prims: [{'material': {name, metallic, rough}, 'image': (bytes, mime), 'P','N','UV','J','W','VID','T'}]"""
    g = glbio.GlbWriter()
    nodes = copy.deepcopy(body.j['nodes'])
    for n in nodes:
        n.pop('mesh', None)
        n.pop('skin', None)
    nodes[body.hn].update({'name': name, 'mesh': 0, 'skin': 0})
    g.j['nodes'] = nodes
    g.j['scenes'] = copy.deepcopy(body.j['scenes'])
    g.j['scene'] = body.j.get('scene', 0)
    skin = {k: v for k, v in body.skin.items() if k != 'inverseBindMatrices'}
    skin['inverseBindMatrices'] = g.acc(body.ibm.transpose(0, 2, 1).reshape(-1, 16).astype(np.float32), 'MAT4')
    g.j['skins'] = [skin]
    g.j['samplers'] = [{}]
    g.j['images'], g.j['textures'], g.j['materials'] = [], [], []
    out_prims = []
    for p in prims:
        m = p['material']
        mat = {'name': m['name'], 'pbrMetallicRoughness': {'metallicFactor': m.get('metallic', 0.0),
                                                           'roughnessFactor': m.get('rough', 0.8)}}
        if p.get('image'):
            data, mime = p['image']
            g.j['images'].append({'bufferView': g.view(data), 'mimeType': mime})
            g.j['textures'].append({'source': len(g.j['images']) - 1, 'sampler': 0})
            mat['pbrMetallicRoughness']['baseColorTexture'] = {'index': len(g.j['textures']) - 1}
        g.j['materials'].append(mat)
        W = np.asarray(p['W'], float)
        W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
        out_prims.append({'material': len(g.j['materials']) - 1, 'attributes': {
            'POSITION': g.acc(np.asarray(p['P'], np.float32), 'VEC3', 34962, minmax=True),
            'NORMAL': g.acc(np.asarray(p['N'], np.float32), 'VEC3', 34962),
            'TEXCOORD_0': g.acc(np.asarray(p['UV'], np.float32), 'VEC2', 34962),
            'JOINTS_0': g.acc(np.asarray(p['J'], np.uint16), 'VEC4', 34962),
            'WEIGHTS_0': g.acc(W.astype(np.float32), 'VEC4', 34962),
            '_VIDX': g.acc(np.asarray(p['VID'], np.float32).reshape(-1, 1), 'SCALAR', 34962)},
            'indices': g.acc(np.asarray(p['T'], np.uint32).reshape(-1), 'SCALAR', 34963)})
    g.j['meshes'] = [{'name': name, 'primitives': out_prims}]
    open(out, 'wb').write(g.bytes())


def _blend_weights(J, W, nb, g, BJ, BW):
    """each vertex's weights moved toward body vertex nb's by g (the four heaviest kept)"""
    for i in np.nonzero(g > 0.01)[0]:
        mix = {}
        for jj, ww in zip(J[i], W[i]):
            mix[int(jj)] = mix.get(int(jj), 0) + ww * (1 - g[i])
        for jj, ww in zip(BJ[nb[i]], BW[nb[i]]):
            mix[int(jj)] = mix.get(int(jj), 0) + ww * g[i]
        top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
        top += [(0, 0.0)] * (4 - len(top))
        J[i] = [q for q, _ in top]
        W[i] = [x for _, x in top]


def flesh_arms(body, out):
    """mod_arms_flesh: each arm's skin and nails (each vertex weighted at least half to the arm) copied onto the
    lower joints, hung as the joints are, the root grown out of the ribs"""
    B = body.prims['Human.body']
    remap = {body.jidx[n]: body.jidx[lower(n)] for S in SIDES for n in chain_names(body.names, S) if lower(n) in body.jidx}
    prims = []
    for mname, out_name, px in (('Human.body', 'Mod.arms_flesh', 512), ('Human.fingernails', 'Mod.arms_flesh_nails', 128)):
        A = body.prims[mname]
        P_, N_, UV_, J_, W_, VID_, T_ = [], [], [], [], [], [], []
        base = 0
        for sx, S in zip((1, -1), SIDES):
            arm = [body.jidx[n] for n in chain_names(body.names, S) if not n.startswith(S + 'Shoulder')]
            w_all = np.where(np.isin(A['J'], arm), A['W'], 0).sum(1)
            sel = w_all >= 0.5
            tri = A['T'][sel[A['T']].all(1)]
            used = np.unique(tri)
            vmap = -np.ones(len(w_all), int)
            vmap[used] = np.arange(len(used))
            tri = vmap[tri]
            w = w_all[used]
            off = np.array([-sx * INSET, -drop_of(body.bind, body.jidx), fwd(drop_of(body.bind, body.jidx))])
            pv, R = hang(S, sx, body.bind, body.jidx)
            turn = np.clip((w - 0.5) / 0.4, 0, 1)[:, None]
            v = A['POSITION'][used].astype(float) + off
            v = v + turn * ((v - pv) @ R.T + pv - v)
            n = A['NORMAL'][used].astype(float)
            n = n + turn * (n @ R.T - n)
            n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-9)
            J = A['J'][used].copy()
            for src, dst in remap.items():
                if body.names[src].startswith(S):
                    J[A['J'][used] == src] = dst
            W = A['W'][used].copy()
            if mname == 'Human.body':
                # the root, BLEND from the open edge (where the arm's share fell to a half), drawn toward a point
                # inside the ribs and then onto the torso's skin just under it, taking the torso's weights as it goes
                cnt = {}
                for t3 in tri:
                    for a_, b_ in ((t3[0], t3[1]), (t3[1], t3[2]), (t3[2], t3[0])):
                        e = (min(a_, b_), max(a_, b_))
                        cnt[e] = cnt.get(e, 0) + 1
                edge = np.unique([x for e, c in cnt.items() if c == 1 for x in e])
                edge = edge[w[edge] < 0.8]               # the cut at the shoulder, not the holes the nails sit in
                de, _ = cKDTree(v[edge]).query(v)
                f = np.clip(1 - de / BLEND, 0, 1)
                f = f * f * (3 - 2 * f)
                inside = body.P(S + 'Arm') + off + np.array([-sx * TUCK, 0.0, -0.01])
                v = v + (f[:, None] * 0.5) * (inside - v)
                nb = body.skin_at(v)
                g = f ** 1.5
                v = v + g[:, None] * (B['POSITION'][nb].astype(float) - B['NORMAL'][nb].astype(float) * 0.004 - v)
                _blend_weights(J, W, nb, g, B['J'], B['W'])
            P_.append(v); N_.append(n); UV_.append(A['TEXCOORD_0'][used]); J_.append(J); W_.append(W)
            VID_.append(A['VID'][used]); T_.append(tri + base)
            base += len(used)
        prims.append({'material': {'name': out_name, 'rough': 0.6}, 'image': body.texture(mname, px),
                      'P': np.concatenate(P_), 'N': np.concatenate(N_), 'UV': np.concatenate(UV_), 'J': np.concatenate(J_),
                      'W': np.concatenate(W_), 'VID': np.concatenate(VID_), 'T': np.concatenate(T_)})
    write_piece(body, out, 'mod_arms_flesh', prims)


class _Mesh:
    """flat-shaded parts, each rigid on one bone, for the cybernetic arms"""
    def __init__(self):
        self.P, self.N, self.J, self.VID, self.T = [], [], [], [], []

    def tri(self, a, b, c, bone, vid):
        n = np.cross(b - a, c - a)
        ln = np.linalg.norm(n)
        if ln < 1e-12:
            return
        k = len(self.P)
        self.P += [a, b, c]
        self.N += [n / ln] * 3
        self.J += [bone] * 3
        self.VID += [vid] * 3
        self.T.append([k, k + 1, k + 2])

    def quad(self, a, b, c, d, bone, vid):
        self.tri(a, b, c, bone, vid)
        self.tri(a, c, d, bone, vid)

    def prism(self, a, b, r0, r1, bone, vid, n=8, caps=True):
        a, b = np.asarray(a, float), np.asarray(b, float)
        ax = b - a
        L = np.linalg.norm(ax)
        if L < 1e-6:
            return
        ax /= L
        u = np.cross(ax, [0, 0, 1.0] if abs(ax[2]) < 0.9 else [1.0, 0, 0])
        u /= np.linalg.norm(u)
        w = np.cross(ax, u)
        ring = lambda c, r: [c + r * (math.cos(2 * math.pi * k / n) * u + math.sin(2 * math.pi * k / n) * w) for k in range(n)]
        A, Bv = ring(a, r0), ring(b, r1)
        for k in range(n):
            self.quad(A[k], A[(k + 1) % n], Bv[(k + 1) % n], Bv[k], bone, vid)
        if caps:
            for k in range(n):
                self.tri(a, A[(k + 1) % n], A[k], bone, vid)
                self.tri(b, Bv[k], Bv[(k + 1) % n], bone, vid)

    def ball(self, c, r, bone, vid, n=8, m=5):
        c = np.asarray(c, float)
        pt = lambda i, k: c + r * np.array([math.sin(math.pi * i / m) * math.cos(2 * math.pi * k / n), math.cos(math.pi * i / m),
                                            math.sin(math.pi * i / m) * math.sin(2 * math.pi * k / n)])
        for i in range(m):
            for k in range(n):
                self.quad(pt(i, k), pt(i, k + 1), pt(i + 1, k + 1), pt(i + 1, k), bone, vid)

    def prim(self, material, image):
        T = np.array(self.T, int)
        P = np.array(self.P, float)
        N = np.array(self.N, float)
        # the faces wind outward (prism and ball build them that way); a degenerate cap left out
        return {'material': material, 'image': image, 'P': P, 'N': N, 'UV': np.zeros((len(P), 2)),
                'J': np.array([[j, 0, 0, 0] for j in self.J]), 'W': np.array([[1.0, 0, 0, 0]] * len(P)),
                'VID': np.array(self.VID), 'T': T}


def _qout(m, a, b, c, d, centre, bone, vid):
    """a quad wound to face away from centre"""
    n = np.cross(b - a, c - a)
    if n.dot((a + b + c + d) / 4 - centre) < 0:
        a, b, c, d = d, c, b, a
    m.quad(a, b, c, d, bone, vid)


def _box(m, c, ax, ay, az, bone, vid):
    """a box at c, its half axes ax, ay, az"""
    pts = {(i, j, k): c + i * ax + j * ay + k * az for i in (-1, 1) for j in (-1, 1) for k in (-1, 1)}
    for f in ((0, 1), (0, -1), (1, 1), (1, -1), (2, 1), (2, -1)):
        cs = [q for q in pts if q[f[0]] == f[1]]
        o = [i for i in range(3) if i != f[0]]
        cs.sort(key=lambda q: math.atan2(q[o[1]], q[o[0]]))
        _qout(m, *[pts[q] for q in cs], c, bone, vid)


def _perp(d, v):
    """v made perpendicular to d, unit"""
    v = np.asarray(v, float) - d * d.dot(v)
    return v / np.linalg.norm(v)


# the cybernetic pairs: one builder, three designs. bulk: thickness against the man's arm; pistons: hydraulic rams
# along the upper arm and forearm; cables: a bundle from the rib mount into the shoulder; fingers: which, and how thick;
# claw: pointed tips. Colours: plate, trim (end bands, the shoulder dome), joint (balls, rams, cables)
CYBER = {
    'mod_arms_cyber': {'bulk': 1.0, 'fingers': ('Index', 'Middle', 'Ring', 'Pinky', 'Thumb'), 'finger_r': 0.0085,
                       'plate': ('#b08d57', 0.35, 0.4), 'trim': ('#6b4e2a', 0.4, 0.45), 'joint': ('#34363b', 0.4, 0.5)},
    'mod_arms_loader': {'bulk': 1.35, 'pistons': True, 'fingers': ('Index', 'Ring', 'Thumb'), 'finger_r': 0.013, 'claw': True,
                        'plate': ('#6b6e72', 0.5, 0.45), 'trim': ('#d9a521', 0.1, 0.55), 'joint': ('#25272a', 0.5, 0.55)},
    'mod_arms_surgical': {'bulk': 0.8, 'cables': True, 'fingers': ('Index', 'Middle', 'Ring', 'Pinky', 'Thumb'), 'finger_r': 0.0065,
                          'plate': ('#e6e4de', 0.05, 0.3), 'trim': ('#3fc6c0', 0.1, 0.35), 'joint': ('#2a2c30', 0.4, 0.4)},
}
ARM_REF = 0.262        # the man's upper arm (Left2Arm to Left2ForeArm): a design's sizes are for it, scaled to the body's


def cyber_arms(body, out, mid='mod_arms_cyber'):
    """a cybernetic pair (CYBER[mid]): per lower arm a mount plate on the ribs (on Spine2), ball joints, plated upper
    arm and forearm with bands at their ends, a palm and jointed fingers or claws, each part rigid on its bone"""
    st = CYBER[mid]
    B = body.prims['Human.body']
    plate, trim, joint = _Mesh(), _Mesh(), _Mesh()
    vid = lambda p: int(B['VID'][body.skin_at(np.asarray([p]))[0]])
    allv = cKDTree(B['POSITION'].astype(float))
    vid_any = lambda p: int(B['VID'][allv.query(p)[1]])       # the skin at the upper joint this part copies
    for sx, S in zip((1, -1), SIDES):
        S2 = S + '2'
        J = lambda n: body.jidx[S2 + n]
        P = lambda n: body.P(S2 + n)
        U = lambda n: vid_any(body.P(S + n))
        sp2 = body.jidx['Spine2']
        sh, el, wr = P('Arm'), P('ForeArm'), P('Hand')
        k = st['bulk'] * np.linalg.norm(el - sh) / ARM_REF
        mount = sh + np.array([-sx * 0.03, 0.0, 0.0])
        out_ax = np.array([sx, 0.0, 0.0])
        plate.prism(mount - out_ax * 0.008, mount + out_ax * 0.006, 0.06 * k, 0.052 * k, sp2, vid(mount), n=10)
        trim.prism(mount + out_ax * 0.006, mount + out_ax * 0.016, 0.036 * k, 0.032 * k, sp2, vid(mount), n=10)
        if st.get('cables'):
            for q in range(3):
                a = 2 * math.pi * q / 3
                o = np.array([0, math.cos(a), math.sin(a)]) * 0.022 * k
                joint.prism(mount + o + out_ax * 0.01, sh + o * 0.4, 0.0055 * k, 0.0055 * k, sp2, vid(mount), n=5)
        d1 = (el - sh) / np.linalg.norm(el - sh)
        d2 = (wr - el) / np.linalg.norm(wr - el)
        joint.ball(sh, 0.04 * k, J('Arm'), U('Arm'))
        trim.ball(sh, 0.047 * k, J('Arm'), U('Arm'), n=14, m=9)     # the dome, round the joint ball (it hides it whole)
        # each joint is a ball a little wider than the ends that meet in it, and each segment runs into it far enough
        # (into() : the rim of an end of radius r stays inside a ball of radius R) that a bend never opens a gap
        into = lambda R, r: math.sqrt(max(R * R - r * r, 0.0)) * 0.85
        # the upper arm: a shell between bands
        Re = 0.038 * k
        a0, a1 = sh + d1 * 0.04 * k, el - d1 * into(Re, 0.033 * k)
        plate.prism(a0, a1 - d1 * 0.012 * k, 0.036 * k, 0.03 * k, J('Arm'), U('Arm'), n=8)
        trim.prism(a1 - d1 * 0.014 * k, a1, 0.033 * k, 0.033 * k, J('Arm'), U('Arm'), n=8)
        joint.ball(el, Re, J('ForeArm'), U('ForeArm'), n=10, m=7)
        # the forearm: swelling toward its middle, a band at the wrist
        Rw = 0.03 * k
        b0, b2 = el + d2 * into(Re, 0.027 * k), wr - d2 * into(Rw, 0.027 * k)
        bm = b0 + (b2 - b0) * 0.4
        plate.prism(b0, bm, 0.027 * k, 0.034 * k, J('ForeArm'), U('ForeArm'), n=8, caps=False)
        plate.prism(bm, b2 - d2 * 0.012 * k, 0.034 * k, 0.024 * k, J('ForeArm'), U('ForeArm'), n=8)
        trim.prism(b2 - d2 * 0.014 * k, b2, 0.027 * k, 0.026 * k, J('ForeArm'), U('ForeArm'), n=8)
        if st.get('pistons'):
            # a ram along the front of each segment: a cylinder and its rod, on the segment's bone
            for (p0, p1, dd, bone, v) in ((a0, a1, d1, J('Arm'), U('Arm')), (b0, b2, d2, J('ForeArm'), U('ForeArm'))):
                o = _perp(dd, [0, 0, 1.0]) * 0.042 * k
                q0, q1 = p0 + o + dd * 0.01, p1 + o - dd * 0.01
                qm = q0 + (q1 - q0) * 0.55
                joint.prism(q0, qm, 0.011 * k, 0.011 * k, bone, v, n=6)
                trim.prism(qm, q1, 0.0055 * k, 0.0055 * k, bone, v, n=6)
                joint.ball(q0, 0.012 * k, bone, v, n=6, m=4)
                joint.ball(q1, 0.009 * k, bone, v, n=6, m=4)
        joint.ball(wr, Rw, J('Hand'), U('Hand'), n=10, m=7)
        # the palm: a box from the wrist to the knuckles
        knuck = np.mean([P('Hand%s1' % f) for f in ('Index', 'Middle', 'Ring', 'Pinky')], 0)
        ax = (knuck - wr) * 0.45
        across = _perp(ax / np.linalg.norm(ax), P('HandIndex1') - P('HandPinky1'))
        thick = np.cross(ax / np.linalg.norm(ax), across)
        half = max(0.015, np.linalg.norm(P('HandIndex1') - P('HandPinky1')) * 0.42) * k / st['bulk'] ** 0.5
        _box(plate, wr + (knuck - wr) * 0.55, ax, across * half, thick * 0.013 * k, J('Hand'), U('Hand'))
        # a cuff from the wrist ball into the palm, so the palm's back edge never stands clear of the ball
        trim.prism(wr, wr + (knuck - wr) * 0.2, Rw * 0.8, half * 0.75, J('Hand'), U('Hand'), n=8)
        for f in st['fingers']:
            js = [S2 + 'Hand%s%d' % (f, q) for q in (1, 2, 3) if S2 + 'Hand%s%d' % (f, q) in body.jidx]
            if not js:
                continue
            pts = [body.P(n) for n in js]
            pts.append(pts[-1] + (pts[-1] - pts[-2]) * 0.9 if len(pts) > 1 else pts[-1] + (pts[-1] - wr) * 0.4)
            r = st['finger_r'] * (1.25 if f == 'Thumb' else 1.0) * k / st['bulk']
            for q, n in enumerate(js):
                v = vid_any(body.P(upper(n)))
                joint.ball(pts[q], r * 1.08, body.jidx[n], v, n=6, m=4)
                tip = q == len(js) - 1 and st.get('claw')
                (trim if tip else plate).prism(pts[q], pts[q + 1] + (pts[q + 1] - pts[q]) * (0.35 if tip else 0), r, r * (0.12 if tip else 0.9),
                                               body.jidx[n], v, n=6)
    mats = [(m, st[key]) for m, key in ((plate, 'plate'), (trim, 'trim'), (joint, 'joint'))]
    write_piece(body, out, mid, [m.prim({'name': 'Mod.%s_%s' % (mid[4:], key), 'metallic': c[1], 'rough': c[2]}, flat(c[0]))
                                 for (m, c), key in zip(mats, ('plate', 'trim', 'joint'))])


def _ray_hits(o, d, P, T):
    """the farthest hit along ray o + t d (t > 0) on triangles T of P: (point, triangle) or None"""
    a, b, c = P[T[:, 0]], P[T[:, 1]], P[T[:, 2]]
    e1, e2 = b - a, c - a
    h = np.cross(d, e2)
    det = (e1 * h).sum(1)
    ok = np.abs(det) > 1e-12
    inv = np.where(ok, 1.0 / np.where(ok, det, 1), 0)
    s = o - a
    u = (s * h).sum(1) * inv
    q = np.cross(s, e1)
    v = (q * d).sum(1) * inv
    t = (e2 * q).sum(1) * inv
    hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0)
    if not hit.any():
        return None
    k = np.nonzero(hit)[0][np.argmax(t[hit])]
    return o + t[k] * d, k


def gills(body, out):
    """mod_gills: four gills a side over the ribs, from behind the flank to its front, falling toward the front as the
    ribs do: a lip of skin (the body's texture, tinted as skin) over a dark slit"""
    B = body.prims['Human.body']
    P, T = B['POSITION'].astype(float), B['T']
    y1, y2 = body.P('Spine1')[1], body.P('Spine2')[1]
    rows = [y1 + (y2 - y1) * f for f in (-0.15, 0.15, 0.45, 0.75)]   # over the side of the ribcage, a rib apart
    is_torso = np.zeros(len(P), bool)
    is_torso[body.torso] = True
    skin, slit = {'P': [], 'N': [], 'UV': [], 'J': [], 'W': [], 'VID': [], 'T': []}, None
    slit = {k: [] for k in skin}
    LIP = [(-0.012, 0.0003), (-0.005, 0.0018), (0.002, 0.0042), (0.006, 0.0036)]
    SLIT = [(0.006, 0.0036), (0.005, 0.0006), (0.0095, 0.0004), (0.0125, 0.0001)]
    n_along = 16
    for sx in (1, -1):
        for y in rows:
            # the ribs' own skin: triangles no arm moves (a ray out of the side would hit the A-posed arm)
            band = np.nonzero((np.abs(P[T].mean(1)[:, 1] - y) < 0.06) & is_torso[T].all(1))[0]
            TT = T[band]
            zc = P[TT.reshape(-1), 2].mean()
            curve, norms = [], []
            for i in range(n_along):
                u = i / (n_along - 1)
                th = math.radians(-28 + 62 * u)              # from behind the flank (-28) to its front (+34)
                yy = y - 0.045 * u                           # the ribs fall toward the front
                d = np.array([sx * math.cos(th), 0.0, math.sin(th)])
                h = _ray_hits(np.array([0.0, yy, zc]), d, P, TT)
                if h is None:
                    break
                p, k = h
                tn = np.cross(P[TT[k, 1]] - P[TT[k, 0]], P[TT[k, 2]] - P[TT[k, 0]])
                tn /= np.linalg.norm(tn)
                if tn.dot(d) < 0:
                    tn = -tn
                curve.append(p)
                norms.append(tn)
            if len(curve) < n_along:
                continue
            curve, norms = np.array(curve), np.array(norms)
            for prof, dst in ((LIP, skin), (SLIT, slit)):
                base = len(dst['P'])
                for i in range(n_along):
                    u = i / (n_along - 1)
                    taper = math.sin(math.pi * u) ** 0.6
                    t_ = curve[min(i + 1, n_along - 1)] - curve[max(i - 1, 0)]
                    t_ /= np.linalg.norm(t_)
                    down = np.cross(t_, norms[i])
                    if down[1] > 0:
                        down = -down
                    for (dd, nn) in prof:
                        p = curve[i] + down * dd * (0.4 + 0.6 * taper) + norms[i] * nn * taper
                        nb = body.skin_at(np.asarray([p]))[0]
                        dst['P'].append(p)
                        dst['UV'].append(B['TEXCOORD_0'][nb])
                        dst['J'].append(B['J'][nb])
                        dst['W'].append(B['W'][nb])
                        dst['VID'].append(B['VID'][nb])
                R = len(prof)
                for i in range(n_along - 1):
                    for r in range(R - 1):
                        a = base + i * R + r
                        quad = [a, a + R, a + R + 1, a + 1]
                        dst['T'] += [[quad[0], quad[1], quad[2]], [quad[0], quad[2], quad[3]]]
    out_prims = []
    for dst, mat, img in ((skin, {'name': 'Mod.gills', 'rough': 0.6}, body.texture('Human.body', 256)),
                          (slit, {'name': 'Mod.gills_slit', 'rough': 0.4}, flat('#3c1216'))):
        Pp, Tt = np.array(dst['P']), np.array(dst['T'])
        # smooth normals, wound outward (away from the body's axis)
        N = np.zeros_like(Pp)
        fn = np.cross(Pp[Tt[:, 1]] - Pp[Tt[:, 0]], Pp[Tt[:, 2]] - Pp[Tt[:, 0]])
        out_dir = Pp[Tt].mean(1) * np.array([1, 0, 1])
        flip = (fn * out_dir).sum(1) < 0
        Tt[flip] = Tt[flip][:, ::-1]
        fn[flip] = -fn[flip]
        for k in range(3):
            np.add.at(N, Tt[:, k], fn)
        N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
        out_prims.append({'material': mat, 'image': img, 'P': Pp, 'N': N, 'UV': np.array(dst['UV']), 'J': np.array(dst['J']),
                          'W': np.array(dst['W']), 'VID': np.array(dst['VID']), 'T': Tt})
    write_piece(body, out, 'mod_gills', out_prims)


# the mods every body gets: id -> (name, what it grants, its group (one of a group at a time), its kind, builder,
# its materials' tint roles)
MODS = [
    ('mod_arms_flesh', 'Second pair of arms', {'arms': 4}, 'arms', 'genetic', flesh_arms,
     {'Mod.arms_flesh': 'skin', 'Mod.arms_flesh_nails': 'skin'}),
    ('mod_arms_cyber', 'Cybernetic arms, bronze', {'arms': 4}, 'arms', 'cybernetic', cyber_arms, {}),
    ('mod_arms_loader', 'Loader arms (hydraulic, claws)', {'arms': 4}, 'arms', 'cybernetic', cyber_arms, {}),
    ('mod_arms_surgical', 'Surgical arms (slim, cabled)', {'arms': 4}, 'arms', 'cybernetic', cyber_arms, {}),
    ('mod_gills', 'Rib gills', {'gills': True}, 'gills', 'genetic', gills, {'Mod.gills': 'skin'}),
]


def _skinned(j, b):
    """(names, prims) of a GLB's skinned meshes: each prim as (attributes, positions, _VIDX or None)"""
    out = []
    for node in j['nodes']:
        if 'mesh' not in node or 'skin' not in node:
            continue
        names = [glbio.short(j['nodes'][k].get('name', '')) for k in j['skins'][node['skin']]['joints']]
        for p in j['meshes'][node['mesh']]['primitives']:
            at = p['attributes']
            vk = next((k for k in at if k.upper() == '_VIDX'), None)
            V = np.rint(glbio.accessor(j, bytes(b), at[vk])[:, 0]).astype(int) if vk else None
            out.append((names, at, glbio.accessor(j, bytes(b), at['POSITION']).astype(float), V))
    return out


def fit_four(item_path, flesh_path, ranges):
    """a four-armed garment (make_garments.py four_armed): the lower joints added to its skin, and its lower sleeves'
    and armbands' vertices (ranges of _VIDX, from its .cloth.json 'lower') given the weights of the nearest vertex of
    the flesh arms (the lower pair's skin), so they follow the lower arms whichever pair of arms is worn. Returns how
    many vertices it moved"""
    add_joints(item_path)
    fj, fb = glbio.read_glb(open(flesh_path, 'rb').read())
    fp, fw = [], []
    for names, at, P, _ in _skinned(fj, fb):
        JJ = glbio.accessor(fj, bytes(fb), at['JOINTS_0']).astype(int)
        WW = glbio.accessor(fj, bytes(fb), at['WEIGHTS_0']).astype(float)
        if fj['accessors'][at['WEIGHTS_0']].get('normalized'):
            WW = WW / np.iinfo(glbio.CT[fj['accessors'][at['WEIGHTS_0']]['componentType']]).max
        for v in range(len(P)):
            fp.append(P[v])
            fw.append({names[int(a)]: w for a, w in zip(JJ[v], WW[v]) if w > 0})
    tree = cKDTree(np.array(fp))
    j, b = glbio.read_glb(open(item_path, 'rb').read())
    b = bytearray(b)
    moved = 0
    for names, at, P, V in _skinned(j, b):
        if V is None:
            continue
        want = np.zeros(len(V), bool)
        for lo, hi in ranges:
            want |= (V >= lo) & (V < hi)
        if not want.any():
            continue
        idx = {n: k for k, n in enumerate(names)}
        recs = []
        for key in ('JOINTS_0', 'WEIGHTS_0'):
            a = j['accessors'][at[key]]
            v = j['bufferViews'][a['bufferView']]
            dt = glbio.CT[a['componentType']]
            off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
            if v.get('byteStride') not in (None, np.dtype(dt).itemsize * 4):
                raise SystemExit('mods.py: strided skin attributes')
            recs.append((a, dt, off, np.frombuffer(bytes(b), dt, a['count'] * 4, off).reshape(-1, 4).copy()))
        (aj, dj, oj, JJ), (aw, dw, ow, WW) = recs
        if len(names) > np.iinfo(dj).max + 1:
            raise SystemExit('mods.py: %s has more joints than its JOINTS_0 holds' % item_path)
        scale = np.iinfo(dw).max if aw.get('normalized') else 1.0
        WW = WW.astype(float)
        _, near = tree.query(P[want])
        for v, f in zip(np.nonzero(want)[0], near):
            top = sorted(((idx[n], w) for n, w in fw[f].items() if n in idx), key=lambda kw: -kw[1])[:4]
            tot = sum(w for _, w in top) or 1.0
            top += [(0, 0.0)] * (4 - len(top))
            JJ[v] = [k for k, _ in top]
            WW[v] = [w / tot * scale for _, w in top]
            moved += 1
        WW = np.round(WW).astype(dw) if scale != 1.0 else WW.astype(dw)
        b[oj:oj + JJ.nbytes] = JJ.astype(dj).tobytes()
        b[ow:ow + WW.nbytes] = WW.tobytes()
    _write(item_path, j, bytes(b), {})
    return moved


def split_lower(item_path, sleeve_path, ranges):
    """a four-armed top's lower sleeves and armbands (ranges of _VIDX) as a piece of their own: sleeve_path gets the
    GLB with only their triangles, item_path keeps the rest. A cybernetic pair wears the top without them (kit item
    sleeves2, KCHAR.parts). Each keeps only the vertices its triangles use. Returns how many triangles moved"""
    j, b = glbio.read_glb(open(item_path, 'rb').read())
    keep_j, low_j = copy.deepcopy(j), copy.deepcopy(j)
    moved, blobs_keep, blobs_low = 0, {}, {}
    for mi, mesh in enumerate(j['meshes']):
        for pi, p in enumerate(mesh['primitives']):
            at = p['attributes']
            vk = next((k for k in at if k.upper() == '_VIDX'), None)
            if vk is None or 'indices' not in p:
                continue
            V = np.rint(glbio.accessor(j, bytes(b), at[vk])[:, 0]).astype(int)
            want = np.zeros(len(V), bool)
            for lo, hi in ranges:
                want |= (V >= lo) & (V < hi)
            T = glbio.accessor(j, bytes(b), p['indices']).reshape(-1, 3).astype(np.uint32)
            low = want[T].all(1)
            if not low.any():
                continue
            moved += int(low.sum())
            for jj, blobs, tris in ((keep_j, blobs_keep, T[~low]), (low_j, blobs_low, T[low])):
                # each half keeps only the vertices its triangles use (Godot's importer drops the others, and the
                # morphs and blend shapes are packed per vertex the GLB has)
                used = np.unique(tris)
                remap = np.full(len(V), -1, np.int64)
                remap[used] = np.arange(len(used))
                q = jj['meshes'][mi]['primitives'][pi]
                for name, ai in list(q['attributes'].items()):
                    a = j['accessors'][ai]
                    v = j['bufferViews'][a['bufferView']]
                    dt, nc = glbio.CT[a['componentType']], glbio.NC[a['type']]
                    if v.get('byteStride') not in (None, np.dtype(dt).itemsize * nc):
                        raise SystemExit('mods.py: strided attribute in %s' % item_path)
                    off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
                    arr = np.frombuffer(bytes(b), dt, a['count'] * nc, off).reshape(a['count'], nc)[used]
                    jj['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': 0, 'target': 34962})
                    blobs[len(jj['bufferViews']) - 1] = np.ascontiguousarray(arr).tobytes()
                    na = {k: a[k] for k in ('componentType', 'type', 'normalized') if k in a}
                    na.update({'bufferView': len(jj['bufferViews']) - 1, 'count': int(len(used))})
                    if 'min' in a:
                        na['min'], na['max'] = arr.min(0).tolist(), arr.max(0).tolist()
                    jj['accessors'].append(na)
                    q['attributes'][name] = len(jj['accessors']) - 1
                jj['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': 0, 'target': 34963})
                blobs[len(jj['bufferViews']) - 1] = remap[tris].reshape(-1).astype(np.uint32).tobytes()
                jj['accessors'].append({'bufferView': len(jj['bufferViews']) - 1, 'componentType': 5125, 'count': int(tris.size), 'type': 'SCALAR'})
                q['indices'] = len(jj['accessors']) - 1
    if moved:
        _write(item_path, keep_j, b, blobs_keep)
        _write(sleeve_path, low_j, b, blobs_low)
    return moved


def make_all(base_path, pieces, body_name):
    """every mod's piece beside the base; their kit entries and tint roles"""
    body = Body(base_path)
    entries, roles = [], {}
    import os
    for mid, label, grants, group, kind, build, rl in MODS:
        if build is cyber_arms:
            build(body, os.path.join(pieces, mid + '.glb'), mid)
        else:
            build(body, os.path.join(pieces, mid + '.glb'))
        entries.append({'id': mid, 'name': label, 'slot': 'mods', 'glb': 'pieces/%s/%s.glb' % (body_name, mid),
                        'grants': grants, 'group': group, 'kind': kind})
        if kind == 'cybernetic' and grants.get('arms'):
            entries[-1]['bare'] = True        # a top's lower sleeves are left off it (split_lower, KCHAR.parts)
        roles.update(rl)
    return entries, roles
