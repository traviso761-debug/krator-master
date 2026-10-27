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
import base64
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

    def add(self, rows):
        """joints the base's skin lacks (the tail's, face_jaw), in memory, for the pieces that weight them: rows of
        (name, parent name, world bind 4 x 4), each after its parent; the base's own file is left as it is"""
        nodes = self.j['nodes']
        for name, parent, B in rows:
            if name in self.jidx:
                continue
            pk = self.jidx[parent]
            L = np.linalg.inv(self.bind[pk]) @ B
            nodes.append({'name': name, 'translation': [float(x) for x in L[:3, 3]], 'rotation': [float(x) for x in _quat(L[:3, :3])]})
            nodes[self.skin['joints'][pk]].setdefault('children', []).append(len(nodes) - 1)
            self.skin['joints'] = self.skin['joints'] + [len(nodes) - 1]
            self.names.append(name)
            self.jidx[name] = len(self.names) - 1
            self.bind = np.concatenate([self.bind, np.asarray(B, float)[None]])
            self.ibm = np.concatenate([self.ibm, np.linalg.inv(np.asarray(B, float))[None]])

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
    prims: [{'material': {name, metallic, rough}, 'image': (bytes, mime), 'P','N','UV','J','W','VID','T'}], and
    optionally 'C' (a vertex colour the material multiplies, or four numbers a shader reads: the frog's pattern),
    'UV2' (a second UV, TEXCOORD_1: the frog's shade), 'normal' (a normal map, (bytes, mime)), 'targets'
    ({name: (dP, dN)}: morph targets, the lizard's lids' blink) and 'mesh' (a prim with mesh 1 goes in a second mesh
    on a node of its own: glTF wants every primitive of a mesh to carry the same targets)"""
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
    meshes = {}

    def tex(img):
        data, mime = img
        g.j['images'].append({'bufferView': g.view(data), 'mimeType': mime})
        g.j['textures'].append({'source': len(g.j['images']) - 1, 'sampler': 0})
        return len(g.j['textures']) - 1
    for p in prims:
        m = p['material']
        mat = {'name': m['name'], 'pbrMetallicRoughness': {'metallicFactor': m.get('metallic', 0.0),
                                                           'roughnessFactor': m.get('rough', 0.8)}}
        if p.get('image'):
            mat['pbrMetallicRoughness']['baseColorTexture'] = {'index': tex(p['image'])}
        if p.get('normal'):
            mat['normalTexture'] = {'index': tex(p['normal'])}
        g.j['materials'].append(mat)
        W = np.asarray(p['W'], float)
        W = W / np.maximum(W.sum(1, keepdims=True), 1e-9)
        attrs = {
            'POSITION': g.acc(np.asarray(p['P'], np.float32), 'VEC3', 34962, minmax=True),
            'NORMAL': g.acc(np.asarray(p['N'], np.float32), 'VEC3', 34962),
            'TEXCOORD_0': g.acc(np.asarray(p['UV'], np.float32), 'VEC2', 34962),
            'JOINTS_0': g.acc(np.asarray(p['J'], np.uint16), 'VEC4', 34962),
            'WEIGHTS_0': g.acc(W.astype(np.float32), 'VEC4', 34962),
            '_VIDX': g.acc(np.asarray(p['VID'], np.float32).reshape(-1, 1), 'SCALAR', 34962)}
        if p.get('C') is not None:
            C = np.asarray(p['C'], np.float32)
            attrs['COLOR_0'] = g.acc(C, 'VEC4' if C.shape[1] == 4 else 'VEC3', 34962)
        if p.get('UV2') is not None:
            attrs['TEXCOORD_1'] = g.acc(np.asarray(p['UV2'], np.float32), 'VEC2', 34962)
        pr = {'material': len(g.j['materials']) - 1, 'attributes': attrs,
              'indices': g.acc(np.asarray(p['T'], np.uint32).reshape(-1), 'SCALAR', 34963)}
        if p.get('targets'):
            pr['targets'] = [{'POSITION': g.acc(np.asarray(dp, np.float32), 'VEC3', 34962, minmax=True),
                              'NORMAL': g.acc(np.asarray(dn, np.float32), 'VEC3', 34962)} for dp, dn in p['targets'].values()]
        me = meshes.setdefault(p.get('mesh', 0), {'name': name if not p.get('mesh') else '%s_%d' % (name, p['mesh']), 'primitives': []})
        me['primitives'].append(pr)
        if p.get('targets'):
            me['weights'] = [0.0] * len(p['targets'])
            me['extras'] = {'targetNames': list(p['targets'])}
    g.j['meshes'] = [meshes[k] for k in sorted(meshes)]
    for k in sorted(meshes)[1:]:
        g.j['nodes'].append({'name': meshes[k]['name'], 'mesh': k, 'skin': 0})
        g.j['scenes'][g.j['scene']]['nodes'].append(len(g.j['nodes']) - 1)
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


def arm_skin(body):
    """the base skin's triangles that are arm (each vertex weighted at least half to an arm's bones below the
    shoulder): what a replacement pair hides"""
    B = body.prims['Human.body']
    arm = [body.jidx[n] for S in SIDES for n in chain_names(body.names, S) if not n.startswith(S + 'Shoulder')]
    sel = np.where(np.isin(B['J'], arm), B['W'], 0).sum(1) >= 0.5
    return np.nonzero(sel[B['T']].all(1))[0]


def cyber_arms(body, out, mid='mod_arms_cyber', replace=False):
    """a cybernetic pair (CYBER[mid], or CYBER[mid without _up] for replace): per lower arm a mount plate on the ribs (on
    Spine2), ball joints, plated upper arm and forearm with bands at their ends, a palm and jointed fingers or claws,
    each part rigid on its bone. replace: the pair in place of the body's own arms, on their joints, a dome on each
    shoulder over the edge of the skin they replace; returns that skin (arm_skin) for the item to hide"""
    st = CYBER[mid[:-3] if replace else mid]
    B = body.prims['Human.body']
    plate, trim, joint = _Mesh(), _Mesh(), _Mesh()
    vid = lambda p: int(B['VID'][body.skin_at(np.asarray([p]))[0]])
    allv = cKDTree(B['POSITION'].astype(float))
    vid_any = lambda p: int(B['VID'][allv.query(p)[1]])       # the skin at the upper joint this part copies
    hide = arm_skin(body) if replace else None
    if replace:
        # the edge of the hidden skin, per side: the vertices its triangles share with the shown ones
        shown = np.ones(len(B['T']), bool)
        shown[hide] = False
        edge = np.intersect1d(np.unique(B['T'][hide]), np.unique(B['T'][shown]))
        EP = B['POSITION'][edge].astype(float)
    for sx, S in zip((1, -1), SIDES):
        S2 = S + ('' if replace else '2')
        J = lambda n: body.jidx[S2 + n]
        P = lambda n: body.P(S2 + n)
        U = lambda n: vid_any(body.P(S + n))
        sp2 = body.jidx['Spine2']
        sh, el, wr = P('Arm'), P('ForeArm'), P('Hand')
        k = st['bulk'] * np.linalg.norm(el - sh) / ARM_REF
        mount = sh + np.array([-sx * 0.03, 0.0, 0.0])
        out_ax = np.array([sx, 0.0, 0.0])
        d1 = (el - sh) / np.linalg.norm(el - sh)
        if replace:
            # a dome over the shoulder joint, just past the edge of the hidden skin on this side: that edge runs
            # slant from the top of the shoulder down into the armpit, all of it 5 to 9 cm from the joint, so a ball
            # on the joint covers it in any pose (a ring across the arm stood off it like a hoop)
            ep = EP[EP[:, 0] * sx > 0]
            plate.ball(sh, np.linalg.norm(ep - sh, axis=1).max() * 1.03, J('Shoulder'), vid(sh), n=16, m=11)
        else:
            plate.prism(mount - out_ax * 0.008, mount + out_ax * 0.006, 0.06 * k, 0.052 * k, sp2, vid(mount), n=10)
            trim.prism(mount + out_ax * 0.006, mount + out_ax * 0.016, 0.036 * k, 0.032 * k, sp2, vid(mount), n=10)
        if st.get('cables') and not replace:
            for q in range(3):
                a = 2 * math.pi * q / 3
                o = np.array([0, math.cos(a), math.sin(a)]) * 0.022 * k
                joint.prism(mount + o + out_ax * 0.01, sh + o * 0.4, 0.0055 * k, 0.0055 * k, sp2, vid(mount), n=5)
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
            if replace:
                r = max(r, 0.0095 * k / st['bulk'])     # the body's own nails (drawn always) stay inside the finger
            for q, n in enumerate(js):
                v = vid_any(body.P(upper(n)))
                joint.ball(pts[q], r * 1.08, body.jidx[n], v, n=6, m=4)
                tip = q == len(js) - 1 and st.get('claw')
                (trim if tip else plate).prism(pts[q], pts[q + 1] + (pts[q + 1] - pts[q]) * (0.35 if tip else 0), r, r * (0.12 if tip else 0.9),
                                               body.jidx[n], v, n=6)
    mats = [(m, st[key]) for m, key in ((plate, 'plate'), (trim, 'trim'), (joint, 'joint'))]
    write_piece(body, out, mid, [m.prim({'name': 'Mod.%s_%s' % (mid[4:], key), 'metallic': c[1], 'rough': c[2]}, flat(c[0]))
                                 for (m, c), key in zip(mats, ('plate', 'trim', 'joint'))])
    return hide


def _ray_hits(o, d, P, T, nearest=False):
    """the farthest (or nearest) hit along ray o + t d (t > 0) on triangles T of P: (point, triangle) or None"""
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
    k = np.nonzero(hit)[0][np.argmin(t[hit]) if nearest else np.argmax(t[hit])]
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


"""Non-human parts (a spike for the Lizardmen, LORE 6.20; tools/nonhuman.py puts them on the published pieces): a tail
on the tail joints every skeleton carries (tools/tail.py), and an animal head in place of the human one. Their
vertices do not copy MakeHuman vertices, so each has a _VIDX of its own (numbered from 0; a UV seam's two copies share
one) and a recipe for its morph deltas (Recipe below): the tail moves with the skin over the sacrum and grows with the
legs; the head's rigid parts move with the Head joint; its collar takes the nearest neck vertex's deltas, fading to
the head's above the seam. scale_texture() is a stand-in for the scale textures still to be asked for (KNOWN_ISSUES)."""


class Recipe:
    """per synthetic vertex (its _VIDX), how its morph deltas are made from the base's (deltas(), tools/nonhuman.py
    and make_mpfb.py): d = (1 - f) d_base[b] + f d_joint[j] + g s (p - o), s the hip joint's height change over its
    height (the tail grows with the legs)"""
    def __init__(self):
        self.b, self.f, self.j, self.g, self.p, self.o = [], [], [], [], [], []

    def add(self, b, f, j, g, p, o):
        self.b.append(int(b)); self.f.append(float(f)); self.j.append(j or ''); self.g.append(float(g))
        self.p.append(np.asarray(p, float)); self.o.append(np.asarray(o, float))
        return len(self.b) - 1

    def deltas(self, d_base, d_joint, s):
        """targets x vertices x 3: d_base targets x base vertices x 3 (by Blender index), d_joint(name) targets x 3,
        s targets"""
        T = d_base.shape[0]
        b = np.maximum(np.array(self.b), 0)
        f = np.array(self.f)[None, :, None]
        D = (1 - f) * d_base[:, b, :]
        for jn in sorted(set(self.j) - {''}):
            m = np.array([x == jn for x in self.j])
            D[:, m, :] += f[:, m, :] * d_joint(jn)[:, None, :]
        g = np.array(self.g)
        if g.any():
            D += g[None, :, None] * np.asarray(s, float)[:, None, None] * (np.array(self.p) - np.array(self.o))[None]
        return D.astype(np.float32) if T else D


class _Smooth:
    """a smooth surface for the non-human parts: vertices with a recipe each, quads between them; normals summed"""
    def __init__(self, rec):
        self.rec, self.P, self.UV, self.J, self.W, self.VID, self.T = rec, [], [], [], [], [], []

    def v(self, p, uv, jw, recipe, vid=None):
        """a vertex: jw [(joint index, weight)...], recipe (b, f, j, g, o) or vid (a seam's copy of that vertex)"""
        if vid is None:
            vid = self.rec.add(recipe[0], recipe[1], recipe[2], recipe[3], p, recipe[4])
        jw = sorted(jw, key=lambda x: -x[1])[:4]
        jw += [(0, 0.0)] * (4 - len(jw))
        self.P.append(np.asarray(p, float)); self.UV.append(uv)
        self.J.append([q for q, _ in jw]); self.W.append([x for _, x in jw]); self.VID.append(vid)
        return len(self.P) - 1

    def grid(self, rows, closed=True, flip=False):
        """quads between rows of vertex indices (each row a ring round, its last a seam copy of its first)"""
        for r in range(len(rows) - 1):
            a, b = rows[r], rows[r + 1]
            for k in range(len(a) - 1):
                q = [a[k], a[k + 1], b[k + 1], b[k]]
                if flip:
                    q = q[::-1]
                self.T += [[q[0], q[1], q[2]], [q[0], q[2], q[3]]]

    def fan(self, ring, centre, flip=False):
        for k in range(len(ring) - 1):
            t = [centre, ring[k + 1], ring[k]]
            self.T.append(t[::-1] if flip else t)

    def prim(self, material, image, outward=None):
        P, T = np.array(self.P), np.array(self.T, int)
        fn = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])
        if outward is not None:
            # wound away from the given centre(s) (per triangle), whichever way the builder went round
            flip = (fn * (P[T].mean(1) - outward(P[T].mean(1)))).sum(1) < 0
            T[flip] = T[flip][:, ::-1]
            fn[flip] = -fn[flip]
        vid = np.array(self.VID)
        acc = np.zeros((vid.max() + 1, 3))
        for k in range(3):
            np.add.at(acc, vid[T[:, k]], fn)
        N = acc[vid]
        N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)
        return {'material': material, 'image': image, 'P': P, 'N': N, 'UV': np.array(self.UV, float),
                'J': np.array(self.J), 'W': np.array(self.W, float), 'VID': vid, 'T': T}


def scale_texture(mean_rgb, px=512, seed=7):
    """a stand-in for a reptile's skin (KNOWN_ISSUES: the owner is asked for real ones): rows of overlapping rounded
    scales, darker at their edges, as a neutral grey whose mean is the body texture's (the skin tint multiplies it in
    as it does the skin's), PNG. Tiles in u and v; u = 0.5 is the belly (a little lighter)"""
    rs = np.random.RandomState(seed)
    y, x = np.mgrid[0:px, 0:px] / px
    rows, cols = 16, 16
    v = y * rows
    row = np.floor(v)
    u = x * cols + 0.5 * (row % 2)
    du = (u % 1) - 0.5
    dv = (v % 1)
    d = np.sqrt(du * du * 1.4 + (dv - 0.15) ** 2)        # each scale's round top edge, the next row's tucked under it
    edge = np.clip((d - 0.38) / 0.18, 0, 1)
    jit = rs.uniform(-0.035, 0.035, (rows + 1, cols + 2))
    shade = jit[row.astype(int) % rows, np.floor(u).astype(int) % (cols + 1)]
    lum = 1.0 + shade - 0.17 * edge ** 1.5 + 0.05 * (1 - dv)
    belly = np.exp(-((x - 0.5) / 0.16) ** 2)
    lum = lum * (1 + 0.12 * belly)
    lum = lum / lum.mean()
    img = np.clip(np.asarray(mean_rgb, float)[None, None, :] * lum[:, :, None], 0, 255).astype(np.uint8)
    bio = io.BytesIO()
    Image.fromarray(img, 'RGB').save(bio, 'PNG')
    return bio.getvalue(), 'image/png'


def texture_mean(body):
    data, _ = body.texture('Human.body', 256)
    return np.asarray(Image.open(io.BytesIO(data)).convert('RGB'), float).reshape(-1, 3).mean(0)


TAIL_RING = 16         # vertices round the tail
TAIL_PER = 4           # rings per segment
TAIL_SINK = 0.05       # the tail starts this far before its root joint, inside the body
TAIL_HIPS = 0.09       # its root takes the hips' weights, fading to the tail's over this length


def tail_piece(body, out, rec, tex, nrm=None):
    """mod_tail: a tapering tube along the tail joints (body has them: nonhuman_joints), its root sunk in the lower back;
    each ring weighted to the two tail joints it lies between, the root's first TAIL_HIPS to the hips too. Its morph
    recipe: the skin over the sacrum's deltas, scaled about the root with the legs (Recipe g)"""
    import tail as TL
    hips_y = body.P('Hips')[1]
    names = TL.names()
    P = np.array([body.P(n) for n in names])
    seg = list(np.linalg.norm(np.diff(np.vstack([P, P[-1:]]), axis=0), axis=1)[:-1])
    tip = P[-1] + TL.direction(TL.N - 1) * TL.lengths(hips_y)[-1]
    pts = np.vstack([P, tip])
    root = P[0]
    B = body.prims['Human.body']
    _, kb = cKDTree(B['POSITION'].astype(float)).query(root - np.array([0, 0, TL.ROOT_IN]))
    b_root = int(B['VID'][kb])
    hip = body.jidx['Hips']
    # stations along the chain (arc length s), from TAIL_SINK before the root to the tip
    L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    st = [-TAIL_SINK, -TAIL_SINK / 2] + [L[k] + (L[k + 1] - L[k]) * q / TAIL_PER for k in range(TL.N) for q in range(TAIL_PER)] + [L[-1] - 0.004]
    m = _Smooth(rec)
    rings = []
    for s in st:
        k = int(np.clip(np.searchsorted(L, s, side='right') - 1, 0, TL.N - 1))
        a = (s - L[k]) / (L[k + 1] - L[k])
        c = pts[k] + (pts[k + 1] - pts[k]) * a if s >= 0 else pts[0] + TL.direction(0) * s
        dirv = pts[k + 1] - pts[k]
        if 0.25 < a < 0.75 or s < 0:
            dirv = dirv / np.linalg.norm(dirv)
        else:                                     # near a joint: the mean of the two segments' directions, so rings do not cross
            kk = k if a >= 0.75 else k - 1
            d1 = pts[kk + 1] - pts[kk] if kk >= 0 else pts[1] - pts[0]
            d2 = pts[min(kk + 2, TL.N)] - pts[kk + 1] if kk + 1 < TL.N else d1
            dirv = d1 / np.linalg.norm(d1) + d2 / np.linalg.norm(d2)
            dirv = dirv / np.linalg.norm(dirv)
        side = np.array([1.0, 0, 0])
        up = np.cross(dirv, side)
        if up[1] < 0:
            up = -up
        r = TL.radius(np.clip(s / L[-1], 0, 1), hips_y) * (1.08 if s < 0 else 1.0)
        # weights: the joint at the segment's start and the next, linear along it; the root's first stretch the hips' too
        if s < 0:
            jw = [(hip, 0.6), (body.jidx[names[0]], 0.4)]
        else:
            j0 = body.jidx[names[k]]
            j1 = body.jidx[names[min(k + 1, TL.N - 1)]]
            jw = [(j0, 1 - 0.5 * a), (j1, 0.5 * a)] if k + 1 < TL.N else [(j0, 1.0)]
            if s < TAIL_HIPS:
                h = 0.6 * (1 - s / TAIL_HIPS)
                jw = [(q, w * (1 - h)) for q, w in jw] + [(hip, h)]
        ring, first = [], None
        for i in range(TAIL_RING + 1):
            th = 2 * math.pi * i / TAIL_RING
            p = c + r * (math.sin(th) * side + TL.TALL * math.cos(th) * up)    # th 0 the top, pi the belly
            uv = (i / TAIL_RING, s / (2 * math.pi * TL.R0 * hips_y / TL.HIPS_REF))
            vi = m.v(p, uv, jw, (b_root, 0.0, '', 1.0, root), vid=None if i < TAIL_RING else m.VID[first])
            if i == 0:
                first = vi
            ring.append(vi)
        rings.append(ring)
    m.grid(rings)
    tipv = m.v(tip, (0.5, L[-1] / (2 * math.pi * TL.R0)), [(body.jidx[names[-1]], 1.0)], (b_root, 0.0, '', 1.0, root))
    m.fan(rings[-1], tipv)
    m.fan(rings[0], m.v(pts[0] + TL.direction(0) * -TAIL_SINK, (0.5, 0), [(hip, 0.6), (body.jidx[names[0]], 0.4)],
                        (b_root, 0.0, '', 1.0, root)), flip=True)
    axis = lambda q: _nearest_on(pts, q)
    write_piece(body, out, 'mod_tail', [dict(m.prim({'name': 'Mod.tail', 'rough': 0.55}, tex, outward=axis), normal=nrm)])
    Rh = body.bind[hip][:3, :3] / np.linalg.norm(body.bind[hip][:3, :3], axis=0)
    return {'joints': names, 'tip': [round(float(x), 5) for x in Rh.T @ (tip - P[-1])],     # in the hips' frame, as the joints' offsets
            'radius': [round(float(TL.radius(L[k] / L[-1], hips_y)), 4) for k in range(TL.N + 1)]}


def _nearest_on(pts, q):
    """per point of q, the nearest point on the polyline pts"""
    q = np.atleast_2d(q)
    best, out = np.full(len(q), np.inf), np.zeros_like(q)
    for a, b in zip(pts[:-1], pts[1:]):
        ab = b - a
        t = np.clip(((q - a) @ ab) / max(ab @ ab, 1e-12), 0, 1)
        c = a + t[:, None] * ab
        d = np.linalg.norm(q - c, axis=1)
        m = d < best
        best[m], out[m] = d[m], c[m]
    return out


# the reptile head's profile, in metres on the man's head (scaled to the body's: head_scale), in the Head joint's frame
# at bind (x the figure's left, y up, z forward): per station along z, the cranium's half width, its top, the mouth
# line and the jaw's bottom. The snout runs ~10 cm past the human nose; the back of the skull covers the nape
HEAD_RING = 24
# drawn over the skin: left out under it (the man's brows and lashes are 001 and 01, the woman's 002 and 02: hers showed
# through the snout)
HEAD_PARTS = ['Human.lips', 'Human.ears', 'Human.eyebrow001', 'Human.eyebrow002', 'Human.eyelashes01', 'Human.eyelashes02',
              'Human.low-poly']


def head_skin(body):
    """the base skin's triangles that are head (every vertex weighted at least half to Head): what the head replaces"""
    B = body.prims['Human.body']
    w = np.where(B['J'] == body.jidx['Head'], B['W'], 0).sum(1)
    return np.nonzero((w[B['T']] >= 0.5).all(1))[0]


def head_scale(body):
    """the body's head against the man's (its width and its face's reach)"""
    B = body.prims['Human.body']
    w = np.where(B['J'] == body.jidx['Head'], B['W'], 0).sum(1)
    Q = B['POSITION'][w >= 0.5].astype(float) - body.P('Head')
    return 0.5 * ((Q[:, 0].max() - Q[:, 0].min()) / 0.161 + Q[:, 2].max() / 0.153)


def _head_collar(body, rec, k, tile):
    """an animal head's collar (lizard_head, frog_head): from the neck, below the edge of the skin the head hides
    (head_skin), up into the head; its vertices on the nearest neck vertex's weights and deltas, fading to the head's
    above that edge, so it follows the neck under every slider; UV in metres (tile a repeat). Returns the surface, its
    axis (for winding) and the hidden triangles"""
    H = body.P('Head')
    hj = body.jidx['Head']
    B = body.prims['Human.body']
    BP = B['POSITION'].astype(float)
    hide = head_skin(body)
    shown = np.ones(len(B['T']), bool)
    shown[hide] = False
    edge = np.intersect1d(np.unique(B['T'][hide]), np.unique(B['T'][shown]))
    E = BP[edge]
    cx, cz = E[:, 0].mean(), E[:, 2].mean()
    ang_e = np.arctan2(E[:, 0] - cx, E[:, 2] - cz)
    order = np.argsort(ang_e)
    ang_e, ye = ang_e[order], E[order, 1]
    edge_y = lambda a: float(np.interp(a, np.concatenate([ang_e - 2 * np.pi, ang_e, ang_e + 2 * np.pi]), np.concatenate([ye, ye, ye])))
    neck_tris = np.nonzero(shown & (BP[B['T']][:, :, 1].min(1) > H[1] - 0.2 * k))[0]
    TT = B['T'][neck_tris]
    tree = cKDTree(BP)
    collar = _Smooth(rec)
    collar.C = []
    y_low = H[1] - 0.095 * k
    rows = []
    K = 7
    for q in range(K + 1):
        ring, first = [], None
        for i in range(HEAD_RING + 1):
            th = 2 * math.pi * i / HEAD_RING
            a = math.atan2(math.sin(th), math.cos(th))
            y_top = edge_y(a) + 0.012 * k
            u = q / K
            y = y_low + (y_top - y_low) * u
            d = np.array([math.sin(th), 0.0, math.cos(th)])
            h = _ray_hits(np.array([cx, y, cz]), d, BP, TT, nearest=True)
            if h is None:                         # above the shown skin: the last ring's reach, drawn in
                h = (prev[i] if q else np.array([cx, y, cz]) + d * 0.05, None)
            p = h[0] + d * 0.0035
            if q == K:
                p = np.array([cx, y, cz]) + (p - np.array([cx, y, cz])) * 0.55 + np.array([0, 0.02 * k, 0])
            _, nb = tree.query(p)
            fa = np.clip((y - (edge_y(a) - 0.02 * k)) / (0.03 * k), 0, 1)
            if q == K:
                fa = 1.0
            jw = [(int(jx), float(wx) * (1 - fa)) for jx, wx in zip(B['J'][nb], B['W'][nb]) if wx > 0] + [(hj, fa)]
            uv = (th * math.hypot(p[0] - cx, p[2] - cz) / tile, (y - y_low) / tile)     # in metres round and up, as the head's
            if i < HEAD_RING:
                vi = collar.v(p, uv, jw, (int(B['VID'][nb]), fa, 'Head', 0.0, np.zeros(3)))
            else:
                vi = collar.v(p, uv, jw, None, vid=collar.VID[first])
            collar.C.append(np.ones(3))
            if i == 0:
                first = vi
            ring.append(vi)
        prev = [collar.P[x] for x in ring]
        rows.append(ring)
    collar.grid(rows)
    neck_axis = lambda q: np.stack([np.full(len(q), cx), q[:, 1], np.full(len(q), cz)], 1)
    return collar, neck_axis, hide


def lizard_head(body, out, rec, tex, nrm=None):
    """mod_head_lizard: a Komodo dragon's head with an iguana's crest in place of the human one (tools/reptile.py: the
    upper head rigid on Head, the lower jaw on face_jaw, which the figure opens about the hinge; eyes behind lower lids
    that blink, teeth, nostrils, the crest down the nape and the neck), and a collar from the neck, below the edge of
    the skin it hides (head_skin), up into the head, on the neck's own weights and deltas (the nearest base vertex's),
    fading to the head's above that edge. tex, nrm: the scale texture and its normal map. Returns the kit entry's
    extras"""
    import heads as HD
    import reptile as RP
    k = head_scale(body)
    H = body.P('Head')
    hj, jj = body.jidx['Head'], body.jidx['face_jaw']
    lz = RP.Lizard(k)
    B = body.prims['Human.body']

    def smooth():
        m = _Smooth(rec)
        m.C = []
        return m
    cran, jaw, mouth_m, eye_m, dark_m, tooth_m, crest_m, crest_n, lid_m = (smooth() for _ in range(9))
    for f, is_upper, m, bone in ((lz.upper, True, cran, hj), (lz.lower, False, jaw, jj)):
        lo, hi = np.array([-0.13, -0.1, -0.15]) * k, np.array([0.13, 0.21, 0.29]) * k
        V, T, N, nb = RP._mesh(f, lo, hi, RP.CELL)
        C, inside = RP.paint(lz, V, N, is_upper)
        C, = HD.soften(nb, C)
        V, T, U, C, inside, src = HD.box_uv(V, T, C, inside, np.arange(len(V)))
        mats = np.where(inside[T].all(1), 'mouth', 'skin')
        RP.surface({'skin': m, 'mouth': mouth_m}, V + H, T, U, C, [(bone, 1.0)], mats, {'src': src, 'vid': {}})
    # the eyes (an iris texture the eye colour tints, a round pupil: amphibian.iris_texture), and the lower lids that
    # shut them
    import amphibian as AM
    eV, eN, eU, eT = AM.eyeball(lz.eyes, lz.eye_r, H)
    for p, u in zip(eV, eU):
        eye_m.v(p, tuple(u), [(hj, 1.0)], RP.RIGID)
        eye_m.C.append(np.ones(3))
    eye_m.T = eT.tolist()
    lV, lN, lC, lT, ldV, ldN, lU = RP.lids(lz)
    for p, c, u in zip(lV + H, lC, lU):
        lid_m.v(p, tuple(u / RP.TILE), [(hj, 1.0)], RP.RIGID)
        lid_m.C.append(c)
    lid_m.T = lT.tolist()
    for sx in (1, -1):
        # the nostril, dark in the pit of its boss
        c, r = lz.nostrils[0 if sx < 0 else 1]
        _ellipsoid(dark_m, H + c - np.array([sx * 0.0015 * k, 0, 0]), r * 1.1, [(hj, 1.0)], RP.RIGID)
        # recurved teeth along both jaws inside the closed mouth (seen when it opens)
        for z in np.arange(0.0, 0.235, 0.013) * k:
            wl = RP._lerp(RP.LOWER, 1, z / k) * k
            my = RP._lerp(RP.UPPER, 3, z / k) * k
            _cone(tooth_m, H + np.array([sx * wl * 0.82, my + 0.001 * k, z]), np.array([0, -1.0, 0.25]), 0.0022 * k, 0.0065 * k, [(hj, 1.0)], RP.RIGID)
            ly = RP._lerp(RP.LOWER, 2, z / k) * k
            _cone(tooth_m, H + np.array([sx * wl * 0.74, ly - 0.001 * k, z + 0.006 * k]), np.array([0, 1.0, 0.25]), 0.0018 * k, 0.005 * k, [(jj, 1.0)], RP.RIGID)
    for mm in (dark_m, tooth_m):
        mm.C = [np.ones(3)] * len(mm.P)
    collar, neck_axis, hide = _head_collar(body, rec, k, RP.TILE)
    # the crest: blades down the midline, the head's rigid, the neck's on the nearest base vertex and a material of
    # their own, which the figures leave out when a worn item covers the skin under their roots (under)
    spines = RP.crest(lz, body, H, hide)
    under = set()
    for p, up, back, h, nb in spines:
        if nb is None:
            m, jw, recipe = crest_m, [(hj, 1.0)], RP.RIGID
        else:
            m = crest_n
            jw = [(int(jx), float(wx)) for jx, wx in zip(B['J'][nb], B['W'][nb]) if wx > 0]
            recipe = (int(B['VID'][nb]), 0.0, 'Head', 0.0, np.zeros(3))
            under.update(int(t) for t in np.nonzero((B['T'] == nb).any(1))[0])
        RP.blade(m, m.C, H + p, up, back, h, min(0.45 * h + 0.004 * k, 0.019 * k), 0.0032 * k, jw, recipe)
    white = flat('#ffffff')
    spec = [(cran, {'name': 'Mod.head_lizard', 'rough': 0.62}, tex, nrm, None),
            (jaw, {'name': 'Mod.head_lizard_jaw', 'rough': 0.62}, tex, nrm, None),
            (collar, {'name': 'Mod.head_lizard_neck', 'rough': 0.65}, tex, nrm, neck_axis),
            (mouth_m, {'name': 'Mod.head_lizard_mouth', 'rough': 0.4}, flat('#8a4a48'), None, None),
            (eye_m, {'name': 'Mod.head_lizard_eye', 'rough': 0.08}, AM.iris_texture('round'), None, None),
            (dark_m, {'name': 'Mod.head_lizard_dark', 'rough': 0.5}, flat('#120c08'), None, None),
            (tooth_m, {'name': 'Mod.head_lizard_teeth', 'rough': 0.35}, flat('#d8ccb0'), None, None),
            (crest_m, {'name': 'Mod.head_lizard_crest', 'rough': 0.55}, white, None, None),
            (crest_n, {'name': 'Mod.head_lizard_crest_neck', 'rough': 0.55}, white, None, None)]
    prims = []
    for m, mat, img, nm, outward in spec:
        if not len(m.T):
            continue
        p = m.prim(mat, img, outward=outward)
        p['C'], p['normal'] = np.array(m.C, float), nm
        prims.append(p)
    lp = lid_m.prim({'name': 'Mod.head_lizard_lids', 'rough': 0.6}, tex)
    lp.update({'C': np.array(lid_m.C, float), 'normal': nrm, 'mesh': 1, 'targets': {'blink': (ldV, ldN)}})
    write_piece(body, out, 'mod_head_lizard', prims + [lp])
    hinge = np.array([0.0, RP.HINGE[1] * k, RP.HINGE[0] * k])
    return hide, {'pivot': [round(float(x), 5) for x in hinge]}, sorted(under)



def frog_head(body, out, rec, tex, nrm=None):
    """mod_head_frog: a frogman's head in place of the human one (tools/amphibian.py: the upper head rigid on Head, the
    lower jaw and the throat's pouch on face_jaw, which the figure opens about the hinge; bulging eyes behind lower lids
    that blink; dark nostrils), with the lizard's collar from the neck up into it (_head_collar). Its skin (the head, the
    jaw, the collar and the lids: role 'pattern') carries the pattern's fields and the pale share in COLOR_0 and a shade
    in TEXCOORD_1, which the figures colour from the record (skin, skin2, skin3, pattern, pattern_amount); the eyes an
    iris texture the eye colour tints (role 'iris'); and a primitive with no area carries the body's pattern (its
    texture: amphibian.body_mask), which the base skin takes under the head (kit item skin_detail mask). tex, nrm: the
    skin texture and its normal map. Returns the hidden skin and the jaw's extras"""
    import heads as HD
    import reptile as RP
    import amphibian as AM
    k = head_scale(body)
    H = body.P('Head')
    hj, jj = body.jidx['Head'], body.jidx['face_jaw']
    fr = AM.Frog(k)

    def smooth():
        m = _Smooth(rec)
        m.C = []
        return m
    cran, jaw, mouth_m, eye_m, dark_m, lid_m, mask_m, web_m, pad_m = (smooth() for _ in range(9))
    for f, is_upper, m, bone in ((fr.upper, True, cran, hj), (fr.lower, False, jaw, jj)):
        lo, hi = np.array([-0.16, -0.12, -0.15]) * k, np.array([0.16, 0.19, 0.18]) * k
        V, T, N, nb = RP._mesh(f, lo, hi, RP.CELL)
        M, S, inside = AM.paint(fr, V, N, is_upper, H)
        S, = HD.soften(nb, S)
        C = np.concatenate([M, S[:, None]], 1)            # the pattern, the pale share and the shade, split at the prims
        V, T, U, C, inside, src = HD.box_uv(V, T, C, inside, np.arange(len(V)))
        mats = np.where(inside[T].all(1), 'mouth', 'skin')
        RP.surface({'skin': m, 'mouth': mouth_m}, V + H, T, U, C, [(bone, 1.0)], mats, {'src': src, 'vid': {}}, tile=AM.TILE)
    eV, eN, eU, eT = AM.eyeball(fr.eyes, fr.eye_r, H)
    for p, u in zip(eV, eU):
        eye_m.v(p, tuple(u), [(hj, 1.0)], RP.RIGID)
    eye_m.T = eT.tolist()
    # the frog's ball stands proud of its turret: a wide lid lies down in the turret when open and rises over the
    # front of the eye; it turns no more than 95 degrees (a morph moves each point straight: further, the lid would
    # pass through the ball halfway)
    lV, lN, lC, lT, ldV, ldN, lU = RP.lids(fr, color=(1.0, 1.0, 1.0), open_deg=-60.0, shut_deg=35.0, span=150.0)
    for p, c, u in zip(lV + H, lC, lU):
        lid_m.v(p, tuple(u / AM.TILE), [(hj, 1.0)], RP.RIGID)
        lid_m.C.append(np.concatenate([AM.pattern_fields(p[None])[0], [0.0, c[0]]]))
    lid_m.T = lT.tolist()
    for c, r in fr.nostrils:
        _ellipsoid(dark_m, H + c, r * 0.9, [(hj, 1.0)], RP.RIGID)
    collar, neck_axis, hide = _head_collar(body, rec, k, AM.TILE)
    CP = np.array(collar.P)
    CN = (CP - np.array([CP[:, 0].mean(), 0, CP[:, 2].mean()])) * np.array([1, 0, 1])
    CN /= np.maximum(np.linalg.norm(CN, axis=1, keepdims=True), 1e-9)
    pale = AM.belly_share(body, CP, CN)                   # the throat's front, as the body's
    collar.C = [np.concatenate([f, [a, 1.0]]) for f, a in zip(AM.pattern_fields(CP), pale)]
    # webbed hands and pads under the fingertips, on the fingers' joints, each point's deltas the nearest base vertex's
    B = body.prims['Human.body']
    tree = cKDTree(B['POSITION'].astype(float))
    AM.hand_webs(body, web_m, pad_m, lambda p: ((int(B['VID'][tree.query(p)[1]]), 0.0, 'Head', 0.0, np.zeros(3)), None))
    # the body's pattern, on a primitive with no area (the figures read its texture; nothing is drawn)
    for _ in range(3):
        mask_m.v(H, (0.0, 0.0), [(hj, 1.0)], RP.RIGID)
    mask_m.T = [[0, 1, 2]]
    patterned = [(cran, {'name': 'Mod.head_frog', 'rough': 0.38}, tex, nrm, None),
                 (jaw, {'name': 'Mod.head_frog_jaw', 'rough': 0.38}, tex, nrm, None),
                 (collar, {'name': 'Mod.head_frog_neck', 'rough': 0.4}, tex, nrm, neck_axis),
                 (web_m, {'name': 'Mod.head_frog_webs', 'rough': 0.4}, tex, nrm, None),
                 (pad_m, {'name': 'Mod.head_frog_pads', 'rough': 0.45}, tex, nrm, None)]
    prims = []
    for m, mat, img, nm, outward in patterned:
        p = m.prim(mat, img, outward=outward)
        C = np.array(m.C, float)
        p.update({'C': C[:, :4], 'UV2': np.stack([C[:, 4], np.zeros(len(C))], 1), 'normal': nm})
        prims.append(p)
    prims.append(mouth_m.prim({'name': 'Mod.head_frog_mouth', 'rough': 0.3}, flat('#b06a68')))
    prims.append(eye_m.prim({'name': 'Mod.head_frog_eye', 'rough': 0.05}, AM.iris_texture('horizontal')))
    prims.append(dark_m.prim({'name': 'Mod.head_frog_dark', 'rough': 0.5}, flat('#120c08')))
    prims.append(mask_m.prim({'name': 'Mod.head_frog_mask', 'rough': 1.0}, AM.body_mask(body)))
    lp = lid_m.prim({'name': 'Mod.head_frog_lids', 'rough': 0.35}, tex)
    C = np.array(lid_m.C, float)
    lp.update({'C': C[:, :4], 'UV2': np.stack([C[:, 4], np.zeros(len(C))], 1), 'normal': nrm, 'mesh': 1,
               'targets': {'blink': (ldV, ldN)}})
    write_piece(body, out, 'mod_head_frog', prims + [lp])
    hinge = np.array([0.0, AM.HINGE[1] * k * AM.SIZE, AM.HINGE[0] * k * AM.SIZE])
    return hide, {'pivot': [round(float(x), 5) for x in hinge]}


def _ellipsoid(m, c, r, jw, recipe, n=12, mm=8):
    """a smooth ellipsoid of radii r at c"""
    rows = []
    for i in range(mm + 1):
        ph = math.pi * i / mm
        ring, first = [], None
        for kq in range(n + 1):
            th = 2 * math.pi * kq / n
            p = np.asarray(c, float) + np.array([r[0] * math.sin(ph) * math.cos(th), r[1] * math.cos(ph), r[2] * math.sin(ph) * math.sin(th)])
            vi = m.v(p, (kq / n, i / mm), jw, recipe, vid=None if kq < n else m.VID[first])
            if kq == 0:
                first = vi
            ring.append(vi)
        rows.append(ring)
    m.grid(rows)                                  # outward as built (round from +x toward +z, top to bottom)


def _cone(m, base, d, r, h, jw, recipe, n=6):
    d = np.asarray(d, float) / np.linalg.norm(d)
    u = np.cross(d, [1.0, 0, 0] if abs(d[0]) < 0.9 else [0, 0, 1.0])
    u /= np.linalg.norm(u)
    w = np.cross(d, u)
    tip = m.v(np.asarray(base) + d * h, (0.5, 1.0), jw, recipe)
    ring = []
    for kq in range(n):
        th = 2 * math.pi * kq / n
        ring.append(m.v(np.asarray(base) + r * (math.cos(th) * u + math.sin(th) * w) - d * r, (kq / n, 0.0), jw, recipe))
    for kq in range(n):
        a, b = ring[kq], ring[(kq + 1) % n]
        m.T.append([a, b, tip])


# the tail's motion in the figure (50-figure.js tail, kchar_figure.gd _tail): a spring chain on its joints. stiff: per
# point, root to tip, how far toward its rest (carried by the hips) it is pulled each 1/60 s; grav: m/s^2 down;
# damp: of its speed each step; sway: degrees each side at the tip (the root a share, root), a period in seconds;
# what the stiffness leaves is the lag. pad: kept this far out of the legs' capsules, beyond the tail's own radius
TAIL_MOTION = {'stiff': [0.5, 0.32, 0.22, 0.16, 0.12, 0.1, 0.09, 0.08, 0.08], 'grav': 3.0, 'damp': 0.06,
               'sway': {'deg': 9.0, 'root': 0.15, 'period': 3.2}, 'pad': 0.01}
# the jaw (50-figure.js jaw, kchar_figure.gd _jaw): face_jaw turned open about the hinge (pivot, Head's frame) by up
# to deg, for a share (hold) of every period seconds: a breath with the mouth a little open
JAW_MOTION = {'deg': 6.0, 'period': 5.0, 'hold': 0.35}
# the frogmen's skin colours (owner, 2026-10-27): greens, browns, red-browns and creams for the ground and the pale
# parts; the marks may be black too. The Cosmetic Lab offers only these (kit item pattern palette)
_GREENS = ['#2e4a1c', '#3e5a22', '#4a6a2e', '#5f8a36', '#7a9a3a', '#93ac5a']
_BROWNS = ['#3a2a1c', '#5a4028', '#7a5634', '#9a7448']
_RED_BROWNS = ['#5a2618', '#7a3a22', '#9a4a2a', '#a8603a']
_CREAMS = ['#c8b88a', '#d8c890', '#e2dab0', '#efe6c8']
FROG_PALETTE = {'skin': _GREENS + _BROWNS + _RED_BROWNS + _CREAMS,
                'skin2': ['#121410', '#1e2a12'] + _GREENS[:3] + _BROWNS[:3] + _RED_BROWNS[:3],
                'skin3': _CREAMS + ['#b8c890']}
NONHUMAN_ROLES = {'Mod.tail': 'skin', 'Mod.head_lizard': 'skin', 'Mod.head_lizard_jaw': 'skin', 'Mod.head_lizard_neck': 'skin',
                  'Mod.head_lizard_lids': 'skin', 'Mod.head_lizard_crest': 'skin', 'Mod.head_lizard_crest_neck': 'skin',
                  'Mod.head_lizard_eye': 'iris',
                  'Mod.head_frog': 'pattern', 'Mod.head_frog_jaw': 'pattern', 'Mod.head_frog_neck': 'pattern',
                  'Mod.head_frog_lids': 'pattern', 'Mod.head_frog_eye': 'iris', 'Mod.head_frog_webs': 'pattern',
                  'Mod.head_frog_pads': 'pattern'}


def nonhuman_joints(body):
    """the joints the non-human pieces weight and the base lacks, as Body.add rows (name, parent, world bind): the
    tail's (tools/tail.py: its rest frame the hips', so each joint's bind is the hips' turn at its place) and face_jaw
    (make_pieces.skeleton_nodes puts the face joints at the head joint, turned as it is). Returns them and the tail's
    root"""
    import tail as TL
    B = body.prims['Human.body']
    hips = body.bind[body.jidx['Hips']]
    root = TL.root_at(B['POSITION'].astype(float), B['T'], hips[:3, 3])
    P, _ = TL.chain(root, hips[1, 3])
    rows = []
    for k, p in enumerate(P):
        M = hips.copy()
        M[:3, 3] = p
        rows.append((TL.names()[k], 'Hips' if k == 0 else TL.names()[k - 1], M))
    rows.append(('face_jaw', 'Head', body.bind[body.jidx['Head']].copy()))
    return rows, root


def skin_repeat(body, tile=None):
    """how many times the head's scale texture repeats across the base skin's UV square for its scales to be the head's
    size (tile, by default reptile.TILE; one UV unit is about two metres of skin, area-weighted: MakeHuman's islands differ by about
    twice either way, which the busy scales hide). The figures draw the body's skin with it under a lizard's head
    (kit item skin_detail)"""
    import reptile as RP
    S = body.prims['Human.body']
    P, U, T = S['POSITION'].astype(float), S['TEXCOORD_0'].astype(float), S['T']
    a3 = np.linalg.norm(np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]]), axis=1) / 2
    e, f = U[T[:, 1]] - U[T[:, 0]], U[T[:, 2]] - U[T[:, 0]]
    a2 = np.abs(e[:, 0] * f[:, 1] - e[:, 1] * f[:, 0]) / 2
    ok = a2 > 1e-12
    mpu = float((np.sqrt(a3[ok] / a2[ok]) * a3[ok]).sum() / a3[ok].sum())
    return round(mpu / (tile or RP.TILE), 2)


def nonhuman(body, pieces, body_name):
    """the non-human pieces (a spike: tail_piece, lizard_head, frog_head) beside the others, their kit entries (marked test: no
    people draws them), tint roles and morph recipes ({id: Recipe}), and the tail's root (tail_rows). body gets the
    joints they weight (nonhuman_joints); build the other mods first"""
    import os
    import tail as TL
    rows, root = nonhuman_joints(body)
    body.add(rows)
    import reptile as RP
    sm = RP.scale_map(texture_mean(body))           # the library's scales, or the stand-in without git lfs
    tex, nrm = sm if sm else (scale_texture(texture_mean(body)), None)
    rec_t, rec_h = Recipe(), Recipe()
    info = tail_piece(body, os.path.join(pieces, 'mod_tail.glb'), rec_t, tex, nrm)
    hide, jaw, under = lizard_head(body, os.path.join(pieces, 'mod_head_lizard.glb'), rec_h, tex, nrm)
    import amphibian as AM
    fm = RP.scale_map(texture_mean(body), library=AM.LIBRARY)      # the frog's moist skin (skin.smooth)
    ftex, fnrm = fm if fm else (tex, nrm)
    rec_f = Recipe()
    hide_f, jaw_f = frog_head(body, os.path.join(pieces, 'mod_head_frog.glb'), rec_f, ftex, fnrm)
    n = len(body.prims['Human.body']['T'])

    def bits(tris):
        a = np.zeros((n + 7) // 8 * 8, np.uint8)
        a[tris] = 1
        return base64.b64encode(np.packbits(a, bitorder='little').tobytes()).decode()
    B = body.prims['Human.body']
    _, kb = cKDTree(B['POSITION'].astype(float)).query(root - np.array([0, 0, TL.ROOT_IN]))
    entries = [
        {'id': 'mod_tail', 'name': 'Tail (reptile)', 'slot': 'mods', 'glb': 'pieces/%s/mod_tail.glb' % body_name,
         'grants': {'tail': True}, 'group': 'tail', 'kind': 'genetic', 'test': True, 'tail': dict(info, **TAIL_MOTION)},
        {'id': 'mod_head_lizard', 'name': 'Lizard head', 'slot': 'mods', 'glb': 'pieces/%s/mod_head_lizard.glb' % body_name,
         'grants': {'head': 'lizard'}, 'group': 'head', 'kind': 'genetic', 'test': True, 'replaces_head': True,
         'hide': bits(hide), 'hides': int(len(hide)),
         'hide_parts': HEAD_PARTS, 'jaw': dict(jaw, **JAW_MOTION),
         'skin_detail': {'material': 'Mod.head_lizard', 'repeat': skin_repeat(body)},
         'crest_neck': {'material': 'Mod.head_lizard_crest_neck', 'under': under}},
        {'id': 'mod_head_frog', 'name': 'Frog head', 'slot': 'mods', 'glb': 'pieces/%s/mod_head_frog.glb' % body_name,
         'grants': {'head': 'frog'}, 'group': 'head', 'kind': 'genetic', 'test': True, 'replaces_head': True,
         'hide': bits(hide_f), 'hides': int(len(hide_f)), 'hide_parts': HEAD_PARTS, 'jaw': dict(jaw_f, **JAW_MOTION),
         'skin_detail': {'material': 'Mod.head_frog', 'repeat': skin_repeat(body, AM.TILE), 'mask': 'Mod.head_frog_mask'},
         # the skin's colours and pattern when the record names none (skin2 the marks', skin3 the pale parts'; kind
         # none, spots, net or marble; amount 0..1) and the eyes' colour
         'pattern': {'skin2': '#1e2a12', 'skin3': '#e2dab0', 'kind': 'marble', 'amount': 0.45, 'eye_color': '#d6a22a',
                     'palette': FROG_PALETTE}}]
    return entries, dict(NONHUMAN_ROLES), {'mod_tail': rec_t, 'mod_head_lizard': rec_h, 'mod_head_frog': rec_f}, \
        {'root': root, 'b_root': int(B['VID'][kb])}


def tail_rows(morph, names, hips_y, root, b_root, d_base, d_joint):
    """the tail joints' morph rows into kit.json morph (morph_joints, and out of follow): each moves with the skin over
    the sacrum (base vertex b_root) and scales about the root with the hip joint's height (as the piece's vertices)"""
    import tail as TL
    s = d_joint('Hips')[:, 1] / hips_y
    P, _ = TL.chain(root, hips_y)
    Dt = TL.joint_deltas(P, root, d_base[:, b_root], s)
    idx = [names.index(n) for n in TL.names()]
    mj = morph['morph_joints']
    for t in range(Dt.shape[0]):
        add = [[idx[k]] + [round(float(x), 5) for x in Dt[t, k]] for k in range(len(idx)) if np.abs(Dt[t, k]).max() > 1e-4]
        if add:
            mj.setdefault(str(t), []).extend(add)
    morph['morph_joints'] = {k: mj[k] for k in sorted(mj, key=int)}
    morph['follow'] = [i for i in morph['follow'] if i not in idx]


# the mods every body gets: id -> (name, what it grants, its group (one of a group at a time), its kind, builder,
# its materials' tint roles)
MODS = [
    ('mod_arms_flesh', 'Second pair of arms', {'arms': 4}, 'arms', 'genetic', flesh_arms,
     {'Mod.arms_flesh': 'skin', 'Mod.arms_flesh_nails': 'skin'}),
    ('mod_arms_cyber', 'Cybernetic arms, bronze', {'arms': 4}, 'arms', 'cybernetic', cyber_arms, {}),
    ('mod_arms_loader', 'Loader arms (hydraulic, claws)', {'arms': 4}, 'arms', 'cybernetic', cyber_arms, {}),
    ('mod_arms_surgical', 'Surgical arms (slim, cabled)', {'arms': 4}, 'arms', 'cybernetic', cyber_arms, {}),
    ('mod_arms_cyber_up', 'Replacement arms, bronze', {}, 'arms_up', 'cybernetic', cyber_arms, {}),
    ('mod_arms_loader_up', 'Replacement loader arms', {}, 'arms_up', 'cybernetic', cyber_arms, {}),
    ('mod_arms_surgical_up', 'Replacement surgical arms', {}, 'arms_up', 'cybernetic', cyber_arms, {}),
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


def pin_hips(item_path, ranges):
    """the vertices in ranges (of _VIDX: belts round the hips and what hangs from them, the .cloth.json's 'hips')
    weighted to the Hips joint alone, so a belt rides the pelvis instead of shearing with the thighs. A range with a
    third number (a band up to the shoulder) is pinned only below that height over the hip joint, fading in over 8 cm
    under it. Returns how many vertices it moved"""
    j, b = glbio.read_glb(open(item_path, 'rb').read())
    b = bytearray(b)
    moved = 0
    for node in j['nodes']:
        if 'skin' not in node:
            continue
        sk = j['skins'][node['skin']]
        names = [glbio.short(j['nodes'][k].get('name', '')) for k in sk['joints']]
        if 'Hips' not in names or 'inverseBindMatrices' not in sk:
            continue
        ibm = glbio.accessor(j, bytes(b), sk['inverseBindMatrices']).reshape(-1, 4, 4)[names.index('Hips')]
        hip_y = np.linalg.inv(ibm.T)[1, 3]                    # glTF matrices are column-major
        break
    else:
        hip_y = None
    for names, at, P, V in _skinned(j, b):
        if V is None or 'Hips' not in names:
            continue
        f = np.zeros(len(V))
        for r in ranges:
            inr = (V >= r[0]) & (V < r[1])
            if len(r) > 2 and hip_y is not None:
                f = np.maximum(f, inr * np.clip((hip_y + r[2] - P[:, 1]) / 0.08, 0.0, 1.0))
            else:
                f = np.maximum(f, inr.astype(float))
        if not (f > 0).any():
            continue
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
        scale = np.iinfo(dw).max if aw.get('normalized') else 1.0
        hips = names.index('Hips')
        W = WW.astype(float) / scale
        for v in np.nonzero(f > 0)[0]:
            dense = {}
            for jj, ww in zip(JJ[v], W[v]):
                if ww > 0: dense[int(jj)] = dense.get(int(jj), 0.0) + ww * (1.0 - f[v])
            dense[hips] = dense.get(hips, 0.0) + f[v]
            top = sorted(dense.items(), key=lambda kw: -kw[1])[:4]
            tot = sum(w for _, w in top) or 1.0
            top += [(0, 0.0)] * (4 - len(top))
            JJ[v] = [k for k, _ in top]
            W[v] = [w / tot for _, w in top]
        WW = np.round(W * scale).astype(dw) if scale != 1.0 else W.astype(dw)
        b[oj:oj + JJ.nbytes] = JJ.astype(dj).tobytes()
        b[ow:ow + WW.nbytes] = WW.tobytes()
        moved += int((f > 0).sum())
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


def make_all(base_path, pieces, body_name, extra=None):
    """every mod's piece beside the base; their kit entries and tint roles. extra (a dict) gets the non-human
    pieces' recipes and the tail's root (nonhuman), which make_mpfb.py turns into their deltas"""
    body = Body(base_path)
    entries, roles = [], {}
    import os
    for mid, label, grants, group, kind, build, rl in MODS:
        hide = None
        if build is cyber_arms:
            hide = build(body, os.path.join(pieces, mid + '.glb'), mid, replace=group == 'arms_up')
        else:
            build(body, os.path.join(pieces, mid + '.glb'))
        entries.append({'id': mid, 'name': label, 'slot': 'mods', 'glb': 'pieces/%s/%s.glb' % (body_name, mid),
                        'grants': grants, 'group': group, 'kind': kind})
        if hide is not None:
            # the skin it replaces (KCHAR.hidden): a bitset over the base skin's triangles, as an item's hide
            n = len(body.prims['Human.body']['T'])
            a = np.zeros((n + 7) // 8 * 8, np.uint8)
            a[hide] = 1
            entries[-1]['hide'] = base64.b64encode(np.packbits(a, bitorder='little').tobytes()).decode()
            entries[-1]['hides'] = int(len(hide))
        if kind == 'cybernetic' and grants.get('arms'):
            entries[-1]['bare'] = True        # a top's lower sleeves are left off it (split_lower, KCHAR.parts)
        roles.update(rl)
    nh, nr, recipes, tl = nonhuman(body, pieces, body_name)
    entries += nh
    roles.update(nr)
    if extra is not None:
        extra.update({'recipes': recipes, 'tail': tl})
    return entries, roles
