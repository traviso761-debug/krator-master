"""The Giants of Dalab (LORE.md: engineered at Dalab, 3.8 m, green; the priests' temple guards have four arms).

make_mpfb.py giant <the man's export> builds data/mpfb_giant and pieces/mpfb_giant from the man's MakeHuman export:
the same base and morphs, a few of his items, and a second pair of arms (add_arms) below the first. The pages make him
big (kit.scale) and slow his clips to a giant's pace; the lower arms have no tracks of their own: the figure drives
them from the upper pair (50-figure.js arms2, kchar_figure.gd _arms2).

add_arms(path): in the base GLB, a copy of each arm's joints (Shoulder, Arm, ForeArm, Hand and the fingers, on the
sides 'Left2' and 'Right2': Left2Arm, Left2HandIndex1, so code that builds names from a side works on them) hung from Spine2 DROP lower and INSET nearer the body's axis, and a copy of the skin and nails those
joints carry (each vertex weighted at least half to the arm), as primitives of the body mesh with materials of their
own (ARM_MATS). The copies keep their _VIDX, so the morph deltas of the arm they copy move them too. The copy's root,
round the deltoid, sinks into the ribs (TUCK) so its open edge sits inside the torso."""
import json
import struct

import numpy as np
from scipy.spatial import cKDTree

import glbio

DROP = 0.25            # metres below the upper pair, on the man's base (1.78 m)
INSET = 0.045          # toward the body's axis
FWD = 0.015            # forward: the lower pair comes out of the side of the ribs, a little ahead of the lats
HANG = 30              # degrees: the lower pair hangs this much steeper than the upper at rest (near its usual pose,
                       # so the deltoid copy is not wrung up out of the ribs when the arm comes down)
BLEND = 0.09           # metres: how far from the copy's open edge it blends into the torso
TUCK = 0.05            # the point inside the ribs the copy's open root is drawn toward, in from its shoulder joint
ARM_MATS = {'Human.body': 'Human.arms2', 'Human.fingernails': 'Human.arms2nails'}
SIDES = ('Left', 'Right')
SCALE = 2.0            # the pages' scale for the whole figure: the man's 1.78 m base -> about 3.6 m, 3.4-4.1 with the sliders
# the man's items a giant wears (the Dalab commoner's kilt and sandals, a loincloth, the bead cap; a few hair styles
# and beards): kit item culture 'giants', so only the giants' strangers draw them
ITEMS = {'dalab_m_peasant_kilt', 'voth_m_peasant_maxtlatl', 'dalab_m_sandals', 'dalab_m_noble_sandals', 'dalab_m_trade_cap',
         'dalab_m_peasant_sash', 'short02', 'short04', 'cortu_short_messy_hair', 'afro01', 'braid01', 'long01', 'ponytail01',
         'wdg_scruffy_beard', 'elvs_scruffy_beard1', 'grinsegold_full_beard'}


def kit_extra():
    """what kit.json says of a giant beyond the man's kit: the scale, the arms, and whose clips to play"""
    return {'label': 'Giant of Dalab', 'scale': SCALE, 'arms': 4, 'arms2': sorted(ARM_MATS.values()),
            'anims': 'mpfb_male'}


def chain_names(names, S):
    return [n for n in names if n.startswith((S + 'Shoulder', S + 'Arm', S + 'ForeArm', S + 'Hand'))]


def lower(n):
    """a joint's copy on the lower pair: LeftArm -> Left2Arm"""
    return n.replace('Left', 'Left2', 1) if n.startswith('Left') else n.replace('Right', 'Right2', 1)


def hang(S, sx, bind, jidx):
    """(pivot, R): the lower arm's turn at rest, about its shoulder joint, down toward the body by HANG"""
    a = -sx * np.radians(HANG)
    R = np.array([[np.cos(a), -np.sin(a), 0], [np.sin(a), np.cos(a), 0], [0, 0, 1.0]])
    return bind[jidx[S + 'Arm']][:3, 3] + np.array([-sx * INSET, -DROP, FWD]), R


def _quat(R):
    return glbio.mat_quat(R / np.linalg.norm(R, axis=0))


def add_arms(path):
    j, b = glbio.read_glb(open(path, 'rb').read())
    b = bytearray(b)
    nodes = j['nodes']
    node_of_mesh = next(i for i, n in enumerate(nodes) if n.get('name') == 'Human' and 'skin' in n)
    skin = j['skins'][nodes[node_of_mesh]['skin']]
    names = [glbio.short(nodes[k].get('name', '')) for k in skin['joints']]
    if 'Left2Arm' in names:
        return False
    ibm = glbio.accessor(j, bytes(b), skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1).astype(float)
    bind = np.linalg.inv(ibm)
    parent = {}
    for i, n in enumerate(nodes):
        for ch in n.get('children', []):
            parent[ch] = i
    jidx = {n: k for k, n in enumerate(names)}
    new_names, new_bind, new_par = [], [], []          # joints appended to the skin
    remap = {}                                         # source joint index -> its copy
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
            pn = names[skin['joints'].index(parent[skin['joints'][k]])] if parent.get(skin['joints'][k]) in skin['joints'] else None
            new_par.append(pn)
    # the new joint nodes: each under its source's parent's copy, the shoulders under Spine2 (where the source hangs)
    base_n = len(nodes)
    all_names = names + new_names
    all_bind = list(bind) + new_bind
    for i, (n, B, pn) in enumerate(zip(new_names, new_bind, new_par)):
        pk = remap[jidx[pn]] if pn in jidx and jidx[pn] in remap else jidx[pn]
        P = all_bind[pk]
        L = np.linalg.inv(P) @ B
        nd = {'name': n, 'translation': [float(x) for x in L[:3, 3]], 'rotation': [float(x) for x in _quat(L[:3, :3])]}
        nodes.append(nd)
        pnode = skin['joints'][pk] if pk < len(names) else base_n + (pk - len(names))
        nodes[pnode].setdefault('children', []).append(base_n + i)
    skin['joints'] = skin['joints'] + [base_n + i for i in range(len(new_names))]
    blobs = {}

    def add_view(data, target=None):
        j['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': 0})
        if target:
            j['bufferViews'][-1]['target'] = target
        blobs[len(j['bufferViews']) - 1] = data
        return len(j['bufferViews']) - 1

    def add_acc(arr, typ, ct, target=None, minmax=False, normalized=False):
        dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[ct]
        a = {'bufferView': add_view(np.ascontiguousarray(arr, dt).tobytes(), target), 'componentType': ct,
             'count': int(len(arr)), 'type': typ}
        if normalized:
            a['normalized'] = True
        if minmax:
            a['min'] = [float(x) for x in np.min(arr, 0)]
            a['max'] = [float(x) for x in np.max(arr, 0)]
        j['accessors'].append(a)
        return len(j['accessors']) - 1
    I4 = np.stack(all_bind[len(names):])
    old = glbio.accessor(j, bytes(b), skin['inverseBindMatrices']).reshape(-1, 16)
    newi = np.linalg.inv(I4).transpose(0, 2, 1).reshape(-1, 16)
    skin['inverseBindMatrices'] = add_acc(np.concatenate([old, newi]).astype(np.float32), 'MAT4', 5126)
    # the skin and nails of each arm, copied onto the new joints
    mesh = j['meshes'][nodes[node_of_mesh]['mesh']]
    added = []
    for p in list(mesh['primitives']):
        mname = j['materials'][p['material']]['name'] if 'material' in p else ''
        if mname not in ARM_MATS:
            continue
        at = p['attributes']
        A = {k: glbio.accessor(j, bytes(b), v) for k, v in at.items()}
        aw = j['accessors'][at['WEIGHTS_0']]
        W = A['WEIGHTS_0'].astype(float)
        if aw.get('normalized'):
            W = W / {5121: 255.0, 5123: 65535.0}[aw['componentType']]
        JJ = A['JOINTS_0'].astype(int)
        T = glbio.accessor(j, bytes(b), p['indices']).reshape(-1, 3).astype(int)
        # the torso's skin (the vertices no arm moves), for the copy's root to grow out of
        arms_all = [jidx[n] for S in SIDES for n in chain_names(names, S) if not n.startswith(S + 'Shoulder')]
        torso = np.nonzero(np.where(np.isin(JJ, arms_all), W, 0).sum(1) < 0.05)[0]
        tree = cKDTree(A['POSITION'][torso].astype(float)) if mname == 'Human.body' else None
        keepP, keepT = [], []
        for sx, S in zip((1, -1), SIDES):
            arm = [jidx[n] for n in chain_names(names, S) if not n.startswith(S + 'Shoulder')]
            w = np.where(np.isin(JJ, arm), W, 0).sum(1)
            sel = w >= 0.5
            tri = T[sel[T].all(1)]
            used = np.unique(tri)
            vmap = -np.ones(len(W), int)
            vmap[used] = np.arange(len(used))
            keepP.append((S, sx, used, w[used]))
            keepT.append(vmap[tri])
        # one primitive holding both sides' copies
        parts = {k: [] for k in at}
        tris, base, wrap = [], 0, {}
        for (S, sx, used, w), tri in zip(keepP, keepT):
            off = np.array([-sx * INSET, -DROP, FWD])
            for k in at:
                v = A[k][used].copy()
                if k == 'POSITION':
                    v = v.astype(float) + off
                    pv, R = hang(S, sx, bind, jidx)
                    turn = np.clip((w - 0.5) / 0.4, 0, 1)[:, None]
                    v = v + turn * ((v - pv) @ R.T + pv - v)
                    # the root (round the deltoid and the armpit, BLEND from the open edge) is drawn toward a point
                    # inside the ribs, then onto the torso's skin just under it (the open edge in full, fading out
                    # toward the arm), so the arm grows out of the side rather than standing on it
                    # how near the copy's open edge (its boundary, where the arm's share fell to a half): the blend
                    # runs an even BLEND all round, however steeply the weights change over the shoulder
                    cnt = {}
                    for t3 in tri:
                        for a_, b_ in ((t3[0], t3[1]), (t3[1], t3[2]), (t3[2], t3[0])):
                            e = (min(a_, b_), max(a_, b_))
                            cnt[e] = cnt.get(e, 0) + 1
                    edge = np.unique([x for e, c in cnt.items() if c == 1 for x in e])
                    edge = edge[w[edge] < 0.8]           # the cut at the shoulder, not the holes the nails sit in
                    de, _ = cKDTree(v[edge]).query(v)
                    f = np.clip(1 - de / BLEND, 0, 1)
                    f = f * f * (3 - 2 * f)
                    inside = bind[jidx[S + 'Arm']][:3, 3] + off + np.array([-sx * TUCK, 0.0, -0.01])
                    v = v + (f[:, None] * 0.5) * (inside - v)
                    if tree is not None:
                        d, q = tree.query(v)
                        nb = torso[q]
                        skin = A['POSITION'][nb].astype(float) - A['NORMAL'][nb].astype(float) * 0.004
                        g = (f ** 1.5)[:, None]
                        v = v + g * (skin - v)
                        wrap[S] = (nb, f ** 1.5)
                elif k in ('NORMAL', 'TANGENT'):
                    pv, R = hang(S, sx, bind, jidx)
                    turn = np.clip((w - 0.5) / 0.4, 0, 1)[:, None]
                    n3 = v[:, :3].astype(float)
                    n3 = n3 + turn * (n3 @ R.T - n3)
                    n3 /= np.maximum(np.linalg.norm(n3, axis=1, keepdims=True), 1e-9)
                    v = v.astype(float).copy()
                    v[:, :3] = n3
                elif k == 'JOINTS_0':
                    v = v.astype(int)
                    for src, dst in remap.items():
                        if names[src].startswith(S):
                            v[A['JOINTS_0'][used] == src] = dst
                parts[k].append(v)
            # the root takes the torso's weights where it lies on it (faded as its position was), so the joint
            # moves with the ribs it grows from
            if S in wrap:
                nb, g = wrap[S]
                J2, W2 = parts['JOINTS_0'][-1], parts['WEIGHTS_0'][-1].astype(float)
                if aw.get('normalized'):
                    W2 = W2 / {5121: 255.0, 5123: 65535.0}[aw['componentType']]
                for i in np.nonzero(g > 0.01)[0]:
                    mix = {}
                    for jj, ww in zip(J2[i], W2[i]):
                        mix[int(jj)] = mix.get(int(jj), 0) + ww * (1 - g[i])
                    for jj, ww in zip(JJ[nb[i]], W[nb[i]]):
                        mix[int(jj)] = mix.get(int(jj), 0) + ww * g[i]
                    top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
                    tot = sum(x for _, x in top) or 1.0
                    top += [(0, 0.0)] * (4 - len(top))
                    J2[i] = [q for q, _ in top]
                    W2[i] = [x / tot for _, x in top]
                if aw.get('normalized'):
                    W2 = np.round(W2 * {5121: 255.0, 5123: 65535.0}[aw['componentType']])
                parts['WEIGHTS_0'][-1] = W2
            tris.append(tri + base)
            base += len(used)
        newp = {'attributes': {}, 'material': len(j['materials'])}
        mat = json.loads(json.dumps(j['materials'][p['material']]))
        mat['name'] = ARM_MATS[mname]
        j['materials'].append(mat)
        for k, ai in at.items():
            a = j['accessors'][ai]
            arr = np.concatenate(parts[k])
            ct = a['componentType']
            if k == 'JOINTS_0' and arr.max() > 255:
                ct = 5123
            newp['attributes'][k] = add_acc(arr, a['type'], ct, 34962, minmax=(k == 'POSITION'), normalized=a.get('normalized', False))
        idx = np.concatenate(tris).reshape(-1)
        newp['indices'] = add_acc(idx, 'SCALAR', 5125 if base > 65535 else 5123, 34963)
        mesh['primitives'].append(newp)
        added.append((ARM_MATS[mname], int(len(idx) // 3)))
    # joints of the existing primitives may need 16 bits now (more than 256 joints is not expected, but be safe)
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
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + binb)
    return {'joints': new_names, 'primitives': added}
