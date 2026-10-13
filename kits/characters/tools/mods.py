"""Body mods: what a genetic or cybernetic mod adds to a MakeHuman body, worn like an item (kit items in slot 'mods').

Every body's skeleton carries a second pair of arms' joints (add_joints: Left2Shoulder, Left2Arm ... Right2HandThumb3,
hung from Spine2 DROP below the first pair, INSET nearer the axis, HANG steeper), whether a mod uses them or not: the
clips, the grips (skeleton hands L2, R2), the capsules and the figure's lower-arm controller (50-figure.js arms2) are
the same on every body. Nothing is drawn on them until a mod is worn:

  mod_arms_flesh   the genetic pair: each arm's skin and nails copied onto the lower joints, its root grown out of the
                   ribs (shrink-wrapped onto the torso and given the torso's weights, BLEND from its open edge)
  mod_arms_cyber   the cybernetic pair: jointed limbs (bronze plates, steel joints) on the same joints, each part rigid
                   on its bone, on a mount plate on the ribs
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

from arms2 import DROP, INSET, FWD, HANG, lower, upper      # where the lower pair hangs (shared with make_garments.py)

BLEND = 0.09           # metres: how far from the flesh copy's open edge it blends into the torso
TUCK = 0.05            # the point inside the ribs the copy's open root is drawn toward, in from its shoulder joint
SIDES = ('Left', 'Right')


def chain_names(names, S):
    return [n for n in names if n.startswith((S + 'Shoulder', S + 'Arm', S + 'ForeArm', S + 'Hand'))]


def hang(S, sx, bind, jidx):
    """(pivot, R): the lower arm's turn at rest, about its shoulder joint, down toward the body by HANG"""
    a = -sx * np.radians(HANG)
    R = np.array([[np.cos(a), -np.sin(a), 0], [np.sin(a), np.cos(a), 0], [0, 0, 1.0]])
    return bind[jidx[S + 'Arm']][:3, 3] + np.array([-sx * INSET, -DROP, FWD]), R


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
        off = np.array([-sx * INSET, -DROP, FWD])
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
            off = np.array([-sx * INSET, -DROP, FWD])
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


def cyber_arms(body, out):
    """mod_arms_cyber: per lower arm a mount plate on the ribs (on Spine2), ball joints, plated upper arm and forearm,
    a palm and jointed fingers, each part rigid on its bone; bronze plates, steel joints"""
    B = body.prims['Human.body']
    plate, joint = _Mesh(), _Mesh()
    vid = lambda p: int(B['VID'][body.skin_at(np.asarray([p]))[0]])
    allv = cKDTree(B['POSITION'].astype(float))
    vid_any = lambda p: int(B['VID'][allv.query(p)[1]])       # the skin at the upper joint this part copies
    for sx, S in zip((1, -1), SIDES):
        S2 = S + '2'
        J = lambda n: body.jidx[S2 + n]
        P = lambda n: body.P(S2 + n)
        U = lambda n: vid_any(body.P(S + n))
        sp2 = body.jidx['Spine2']
        sh = P('Arm')
        mount = sh + np.array([-sx * 0.03, 0.0, 0.0])
        out_ax = np.array([sx, 0.0, 0.0])
        plate.prism(mount - out_ax * 0.008, mount + out_ax * 0.006, 0.06, 0.052, sp2, vid(mount), n=10)
        joint.prism(mount + out_ax * 0.006, mount + out_ax * 0.016, 0.034, 0.03, sp2, vid(mount), n=10)
        joint.ball(sh, 0.04, J('Arm'), U('Arm'))
        el, wr = P('ForeArm'), P('Hand')
        d1 = (el - sh) / np.linalg.norm(el - sh)
        plate.prism(sh + d1 * 0.03, el - d1 * 0.022, 0.036, 0.028, J('Arm'), U('Arm'))
        joint.ball(el, 0.028, J('ForeArm'), U('ForeArm'))
        d2 = (wr - el) / np.linalg.norm(wr - el)
        plate.prism(el + d2 * 0.022, wr - d2 * 0.018, 0.029, 0.022, J('ForeArm'), U('ForeArm'))
        joint.ball(wr, 0.02, J('Hand'), U('Hand'))
        knuck = np.mean([P('Hand%s1' % f) for f in ('Index', 'Middle', 'Ring', 'Pinky')], 0)
        plate.prism(wr + (knuck - wr) * 0.15, knuck, 0.026, 0.03, J('Hand'), U('Hand'), n=6)
        for f in ('Index', 'Middle', 'Ring', 'Pinky', 'Thumb'):
            js = [S2 + 'Hand%s%d' % (f, k) for k in (1, 2, 3) if S2 + 'Hand%s%d' % (f, k) in body.jidx]
            if not js:
                continue
            pts = [body.P(n) for n in js]
            pts.append(pts[-1] + (pts[-1] - pts[-2]) * 0.9 if len(pts) > 1 else pts[-1] + (pts[-1] - wr) * 0.4)
            r = 0.0105 if f == 'Thumb' else 0.0085
            for k, n in enumerate(js):
                joint.ball(pts[k], r * 1.05, body.jidx[n], vid_any(body.P(upper(n))), n=6, m=4)
                plate.prism(pts[k], pts[k + 1], r, r * 0.9, body.jidx[n], vid_any(body.P(upper(n))), n=6)
    write_piece(body, out, 'mod_arms_cyber', [
        plate.prim({'name': 'Mod.cyber_plate', 'metallic': 0.35, 'rough': 0.4}, flat('#b08d57')),
        joint.prim({'name': 'Mod.cyber_joint', 'metallic': 0.4, 'rough': 0.5}, flat('#34363b'))])


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
    rows = [y1 + (y2 - y1) * f for f in (-0.7, -0.4, -0.1, 0.2)]
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
    ('mod_arms_cyber', 'Cybernetic arms', {'arms': 4}, 'arms', 'cybernetic', cyber_arms, {}),
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


def make_all(base_path, pieces, body_name):
    """every mod's piece beside the base; their kit entries and tint roles"""
    body = Body(base_path)
    entries, roles = [], {}
    import os
    for mid, label, grants, group, kind, build, rl in MODS:
        build(body, os.path.join(pieces, mid + '.glb'))
        entries.append({'id': mid, 'name': label, 'slot': 'mods', 'glb': 'pieces/%s/%s.glb' % (body_name, mid),
                        'grants': grants, 'group': group, 'kind': kind})
        roles.update(rl)
    return entries, roles
