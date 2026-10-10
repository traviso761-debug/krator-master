#!/usr/bin/env python3
"""Make the equipment pieces: every donor fitted to one skeleton and cut into slots.

  python3 tools/make_pieces.py            # every donor in data/donors.json -> pieces/<id>.glb, data/outfits.json,
                                          # data/skeleton.json, pieces/anims.glb

A donor is a rigged humanoid GLB (a Meshy export: the web app's mixamorig names or the API's Spine02/neck/head_end
names; NAME_MAP folds them together). For each donor:

1. FIT. The donor's bind pose is moved onto the canonical one (Styv's, hero/styv.glb). Each bone gets an affine map:
   uniform scale k (the donor's head-to-feet height onto the canonical one), a stretch along the bone so its length
   matches, a rotation turning the bone onto the canonical bone's direction, and the move onto the canonical joint.
   Vertices go through the weighted blend of those maps (skinning from the donor's rest to the canonical rest), so a
   donor modelled with arms at 20 degrees comes out with Styv's 48, and its weights carry straight over.
2. FACE. Ten face joints (FACE) are added under Head, at landmarks found on this donor's head (the nose tip from the
   front profile; the rest at fixed offsets from it), and the head's vertices get falloff weights to them. The face
   sliders move and scale these joints. Their rest positions differ per head, so they are stored per head piece.
3. CUT. Each triangle goes to the slot (SLOTS) holding most of its weight. Next to each cut, a band of the
   neighbouring slot's triangles is kept as an extra mesh, `<slot>~<other>`: the outer piece reaches BAND[...]
   metres over the cut, pushed out a little along the normal, and the inner piece a short way under it. The page
   shows a band only when the slot across the cut holds a different outfit, so the seam is covered both ways.
4. WRITE. One GLB per donor: the canonical skeleton (rest = bind), one skin, a mesh node per slot and per band,
   one material with JPEG maps (colour 1024 px, normal and metal-roughness 512 px).

The canonical skeleton, the slots and the face landmarks go to data/skeleton.json and data/outfits.json, the
[G data] the page and the Godot twin read. pieces/anims.glb is the canonical skeleton with the CLIPS (Styv's walk, run and stretch, Phil's idle: rotation
tracks, plus the hips' translation) and no mesh.
"""
import io, json, os, sys
import numpy as np
from PIL import Image
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glbio

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(HERE))
CANON = os.path.join(ROOT, 'settlements', 'girder', 'hero', 'styv.glb')

NAME_MAP = {'Spine02': 'Spine', 'Spine01': 'Spine1', 'neck': 'Neck', 'head_end': 'HeadTop_End'}
NAME_MAP_API_SPINE = 'Spine2'      # the API rig's top spine bone is called plain 'Spine'

# the bone each joint points along (its direction and length are fitted); others follow their parent's map
CHILD = {'Hips': 'Spine', 'Spine': 'Spine1', 'Spine1': 'Spine2', 'Spine2': 'Neck', 'Neck': 'Head'}
for s in ('Left', 'Right'):
    CHILD.update({s + 'Shoulder': s + 'Arm', s + 'Arm': s + 'ForeArm', s + 'ForeArm': s + 'Hand',
                  s + 'UpLeg': s + 'Leg', s + 'Leg': s + 'Foot', s + 'Foot': s + 'ToeBase'})
UPRIGHT = {'Hips', 'Spine', 'Spine1', 'Spine2'}
NO_STRETCH = {'Neck', 'Hips', 'LeftShoulder', 'RightShoulder', 'LeftFoot', 'RightFoot'}

SLOTS = ['head', 'torso', 'hands', 'legs', 'feet']
SLOT_OF = {'Neck': 'head', 'Head': 'head', 'HeadTop_End': 'head', 'headfront': 'head',
           'Spine': 'torso', 'Spine1': 'torso', 'Spine2': 'torso', 'Hips': 'legs'}
for s in ('Left', 'Right'):
    SLOT_OF.update({s + 'Shoulder': 'torso', s + 'Arm': 'torso', s + 'ForeArm': 'torso',
                    s + 'Hand': 'hands', s + 'HandMiddle4': 'hands',
                    s + 'UpLeg': 'legs', s + 'Leg': 'legs',
                    s + 'Foot': 'feet', s + 'ToeBase': 'feet', s + 'Toe_End': 'feet'})
# (outer, inner): metres the outer piece reaches over the cut, and the inner piece under it
BAND = {('torso', 'legs'): (0.07, 0.025), ('torso', 'head'): (0.03, 0.03), ('hands', 'torso'): (0.05, 0.02),
        ('feet', 'legs'): (0.06, 0.025)}
PUSH = 0.004          # how far an outer band stands off the surface it covers, at its far edge

# face joints: offset from the nose tip (x, y, z) in metres, falloff radius, and mirrored pairs
FACE = [('face_nose', (0, 0, 0), 0.022), ('face_mouth', (0, -0.04, -0.012), 0.022),
        ('face_chin', (0, -0.085, -0.03), 0.028), ('face_jaw', (0, -0.06, -0.075), 0.06),
        ('face_eye_L', (0.032, 0.035, -0.04), 0.017), ('face_eye_R', (-0.032, 0.035, -0.04), 0.017),
        ('face_brow_L', (0.035, 0.055, -0.025), 0.022), ('face_brow_R', (-0.035, 0.055, -0.025), 0.022),
        ('face_cheek_L', (0.05, 0.005, -0.05), 0.028), ('face_cheek_R', (-0.05, 0.005, -0.05), 0.028)]
FACE_SHARE = 0.9      # most of a vertex's weight the face joints may take from Head


def canon_name(n, api):
    if api and n == 'Spine':
        return NAME_MAP_API_SPINE
    return NAME_MAP.get(n, n)


def load(path):
    r = glbio.read_rig(path)
    api = 'Spine02' in r.joints
    r.joints = [canon_name(n, api) for n in r.joints]
    r.J = {n: i for i, n in enumerate(r.joints)}
    return r


def rot_between(a, b):
    a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)
    v, c = np.cross(a, b), float(np.dot(a, b))
    if c < -0.9999:
        return -np.eye(3)
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + vx + vx @ vx / (1 + c)


def height(r):
    return r.jpos[r.J['Head']][1] - 0.5 * (r.jpos[r.J['LeftFoot']][1] + r.jpos[r.J['RightFoot']][1])


def fit(d, c):
    """move donor d's mesh onto canonical c's bind pose; returns positions, normals, and joint indices into c"""
    k = height(c) / height(d)
    maps = {}
    order = sorted(range(len(d.joints)), key=lambda i: depth(d, i))
    for i in order:
        n = d.joints[i]
        if n not in c.J:
            continue
        pd, pc = d.jpos[i], c.jpos[c.J[n]]
        ch = CHILD.get(n)
        if n in UPRIGHT:
            # the spine is not turned: where a rig puts its spine joints along the back is arbitrary, and turning
            # them onto Styv's leans the whole donor. Each only moves onto its canonical place
            maps[n] = (k * np.eye(3), pd, pc)
            continue
        if n in ('Neck', 'Head'):
            # neck and head move as one, from the neck joint: a rig's Head joint can sit anywhere in the skull
            # (Meshy's API puts it at the front), so fitting it on its own tips the head back or forward
            pn = d.jpos[d.J['Neck']]
            maps[n] = (k * np.eye(3), pn, c.jpos[c.J['Neck']])
            continue
        if ch and ch in d.J and ch in c.J:
            dd, dc = d.jpos[d.J[ch]] - pd, c.jpos[c.J[ch]] - pc
            R = rot_between(dd, dc)
            u = dd / np.linalg.norm(dd)
            s = 1.0 if n in NO_STRETCH else float(np.clip(np.linalg.norm(dc) / (k * np.linalg.norm(dd)), 0.8, 1.25))
            L = k * (np.eye(3) + (s - 1) * np.outer(u, u))
            A = R @ L
        else:
            # an end or marker joint (Hand, ToeBase, HeadTop_End, headfront): its place differs between rigs for
            # no anatomical reason (Meshy's API puts headfront 0.3 m before the face), so it moves rigidly with
            # its parent's map
            p = d.parents[i]
            while p >= 0 and d.joints[p] not in maps:
                p = d.parents[p]
            maps[n] = maps[d.joints[p]] if p >= 0 else (k * np.eye(3), pd, pc)
            continue
        maps[n] = (A, pd, pc)
    # every donor joint the canonical skeleton lacks takes its nearest mapped ancestor's map and index
    jmap = np.zeros(len(d.joints), int)
    Ms = []
    for i, n in enumerate(d.joints):
        m = i
        while d.joints[m] not in maps:
            m = d.parents[m]
        A, pd, pc = maps[d.joints[m]]
        Ms.append((A, pd, pc))
        jmap[i] = c.J[d.joints[m]]
    P = np.zeros_like(d.pos)
    N = np.zeros_like(d.nrm)
    for t in range(4):
        for i, (A, pd, pc) in enumerate(Ms):
            sel = d.jt[:, t] == i
            if not sel.any():
                continue
            w = d.wt[sel, t:t + 1]
            P[sel] += w * ((d.pos[sel] - pd) @ A.T + pc)
            R = A / np.cbrt(abs(np.linalg.det(A)))
            N[sel] += w * (d.nrm[sel] @ R.T)
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
    return P, N, jmap[d.jt]


def depth(r, i):
    n = 0
    while r.parents[i] >= 0:
        i, n = r.parents[i], n + 1
    return n


def merge_weights(jt, wt, nj):
    """(V,4) indices may repeat after mapping: sum duplicates, keep the 4 largest"""
    dense = np.zeros((len(jt), nj))
    for t in range(4):
        np.add.at(dense, (np.arange(len(jt)), jt[:, t]), wt[:, t])
    return top4(dense)


def top4(dense):
    idx = np.argsort(-dense, axis=1)[:, :4]
    w = np.take_along_axis(dense, idx, 1)
    w /= np.maximum(w.sum(1, keepdims=True), 1e-9)
    idx[w == 0] = 0
    return idx.astype(np.uint8), w.astype(np.float32)


def face_landmarks(P, dense, c, nose_hint=None):
    """the nose tip: the most forward head vertex in a strip down the middle of the face"""
    J = c.J
    head = dense[:, [J['Head'], J['HeadTop_End'], J['headfront']]].sum(1) > 0.5
    hy, top = c.jpos[J['Head']][1], c.jpos[J['HeadTop_End']][1]
    H = top - hy
    win = head & (np.abs(P[:, 0]) < 0.015) & (P[:, 1] > hy + 0.45 * H) & (P[:, 1] < hy + 0.75 * H)
    if win.sum() < 3:
        return None
    nose = P[win][np.argmax(P[win][:, 2])]
    return {name: [float(nose[0] + o[0]), float(nose[1] + o[1]), float(nose[2] + o[2])] for name, o, _ in FACE}


def face_weights(P, dense, c, marks, jidx):
    J = c.J
    hcol = J['Head']
    head = dense[:, [J['Head'], J['HeadTop_End'], J['headfront']]].sum(1)
    front = P[:, 2] > c.jpos[hcol][2]
    fw = np.zeros((len(P), len(FACE)))
    for f, (name, _, rad) in enumerate(FACE):
        d = np.linalg.norm(P - np.array(marks[name]), axis=1)
        fw[:, f] = np.exp(-(d / rad) ** 2)
    tot = fw.sum(1)
    scale = np.where(tot > FACE_SHARE, FACE_SHARE / np.maximum(tot, 1e-9), 1.0)
    fw *= (scale * head * front)[:, None]
    take = fw.sum(1)
    dense = dense.copy()
    dense[:, hcol] = np.maximum(dense[:, hcol] - take, 0)
    for f in range(len(FACE)):
        dense[:, jidx[FACE[f][0]]] += fw[:, f]
    return dense


def smooth_normals(P, N, tri):
    """area-weighted normals over welded positions. Meshy's remeshed exports carry flat (per-triangle) normals,
    which read as facets on a face; the fit bends the surface anyway. Keeps the sign of the old normal."""
    w = weld(P)
    fn = np.cross(P[tri[:, 1]] - P[tri[:, 0]], P[tri[:, 2]] - P[tri[:, 0]])
    acc = np.zeros((w.max() + 1, 3))
    for t in range(3):
        np.add.at(acc, w[tri[:, t]], fn)
    S = acc[w]
    S /= np.maximum(np.linalg.norm(S, axis=1, keepdims=True), 1e-12)
    flip = (S * N).sum(1) < -0.2
    S[flip] = N[flip]
    return S


def weld(P):
    key = np.round(P / 1e-5).astype(np.int64)
    _, inv = np.unique(key, axis=0, return_inverse=True)
    return inv.reshape(-1)


def cut(P, N, tri, dense, joints):
    """slot per triangle, and for each (slot, other) band the triangles of `other` within reach of `slot`"""
    sl = np.array([SLOTS.index(SLOT_OF.get(n, 'head')) for n in joints])
    vs = np.zeros((len(P), len(SLOTS)))
    for s in range(len(SLOTS)):
        vs[:, s] = dense[:, sl == s].sum(1)
    tslot = vs[tri].sum(1).argmax(1)
    w = weld(P)
    nw = w.max() + 1
    e = np.concatenate([tri[:, [0, 1]], tri[:, [1, 2]], tri[:, [2, 0]]])
    a, b = w[e[:, 0]], w[e[:, 1]]
    ln = np.linalg.norm(P[e[:, 0]] - P[e[:, 1]], axis=1) + 1e-7
    G = coo_matrix((np.concatenate([ln, ln]), (np.concatenate([a, b]), np.concatenate([b, a]))), shape=(nw, nw)).tocsr()
    bands = {}
    for (outer, inner), (lo, li) in BAND.items():
        for s, o, reach in ((outer, inner, lo), (inner, outer, li)):
            si, oi = SLOTS.index(s), SLOTS.index(o)
            src = np.unique(w[tri[tslot == si]].reshape(-1))
            if not len(src):
                continue
            dist = dijkstra(G, indices=src, min_only=True, limit=reach * 1.5)
            dv = dist[w]
            sel = (tslot == oi) & (dv[tri].max(1) <= reach)
            bands[(s, o)] = (np.nonzero(sel)[0], dv, s == outer, reach)
    return tslot, bands


def jpeg(img, px, mode='RGB'):
    img = img.convert(mode)
    if max(img.size) > px:
        img = img.resize((px, px), Image.LANCZOS)
    b = io.BytesIO()
    img.save(b, 'JPEG', quality=86)
    return b.getvalue()


def skeleton_nodes(c, face_pos):
    """canonical joints (+ face joints under Head) as glTF nodes with rest = bind; returns nodes, world matrices"""
    names = list(c.joints) + [f[0] for f in FACE]
    parents = list(c.parents) + [c.J['Head']] * len(FACE)
    W = []
    for i, n in enumerate(c.joints):
        m = np.eye(4)
        m[:3, :3] = c.jrot[i]
        m[:3, 3] = c.jpos[i]
        W.append(m)
    for f, (n, _, _) in enumerate(FACE):
        m = W[c.J['Head']].copy()
        m[:3, 3] = face_pos[n]
        W.append(m)
    nodes = []
    for i, n in enumerate(names):
        p = parents[i]
        L = np.linalg.inv(W[p]) @ W[i] if p >= 0 else W[i]
        R = L[:3, :3] / np.linalg.norm(L[:3, :3], axis=0)
        nodes.append({'name': n, 'translation': [round(float(x), 6) for x in L[:3, 3]],
                      'rotation': [round(float(x), 7) for x in glbio.mat_quat(R)]})
    for i, p in enumerate(parents):
        if p >= 0:
            nodes[p].setdefault('children', []).append(i)
    return names, parents, nodes, W


def write_piece(out, did, c, P, N, UV, JT, WT, tri, tslot, bands, rig, face_pos):
    names, parents, jnodes, W = skeleton_nodes(c, face_pos)
    g = glbio.GlbWriter()
    nodes = [{'name': 'Character', 'children': []}] + [dict(n) for n in jnodes]
    for n in nodes[1:]:
        if 'children' in n:
            n['children'] = [ch + 1 for ch in n['children']]
    nodes[0]['children'].append(1 + parents.index(-1))
    ibm = np.stack([np.linalg.inv(m) for m in W]).transpose(0, 2, 1).astype(np.float32).reshape(-1, 16)
    g.j['skins'] = [{'joints': list(range(1, 1 + len(names))), 'inverseBindMatrices': g.acc(ibm, 'MAT4'),
                     'skeleton': 1 + parents.index(-1)}]
    # material
    mat = rig.material
    pbr = mat.get('pbrMetallicRoughness', {})
    imgs, texs = [], []

    def tex(ti, px, mode='RGB'):
        data = jpeg(glbio.image(rig, ti), px, mode)
        imgs.append({'bufferView': g.view(data), 'mimeType': 'image/jpeg'})
        texs.append({'source': len(imgs) - 1, 'sampler': 0})
        return {'index': len(texs) - 1}

    m = {'name': did, 'pbrMetallicRoughness': {'metallicFactor': pbr.get('metallicFactor', 1.0),
                                               'roughnessFactor': pbr.get('roughnessFactor', 1.0)}}
    if 'baseColorTexture' in pbr:
        m['pbrMetallicRoughness']['baseColorTexture'] = tex(pbr['baseColorTexture']['index'], 1024)
    if 'metallicRoughnessTexture' in pbr:
        m['pbrMetallicRoughness']['metallicRoughnessTexture'] = tex(pbr['metallicRoughnessTexture']['index'], 512)
    if 'normalTexture' in mat:
        m['normalTexture'] = tex(mat['normalTexture']['index'], 512)
    if mat.get('doubleSided'):
        m['doubleSided'] = True
    g.j['images'], g.j['textures'] = imgs, texs
    g.j['samplers'] = [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]
    g.j['materials'] = [m]
    meshes = []
    summary = {}
    for s, slot in enumerate(SLOTS):
        core = np.nonzero(tslot == s)[0]
        own = [(o, bands[(slot, o)]) for (sl, o) in bands if sl == slot]
        used = np.unique(np.concatenate([tri[core].reshape(-1)] + [tri[b[0]].reshape(-1) for _, b in own]))
        if not len(core):
            continue
        remap = -np.ones(len(P), np.int64)
        remap[used] = np.arange(len(used))
        Pp = P[used].copy()
        for o, (bt, dv, outer, reach) in own:
            if outer:
                bv = np.unique(tri[bt].reshape(-1))
                bv = bv[dv[bv] > 0]
                # band vertices only (their distance from the cut is > 0, so no core vertex moves)
                Pp[remap[bv]] += N[bv] * (PUSH * np.clip(dv[bv] / (reach * 0.5), 0, 1))[:, None]
        attrs = {'POSITION': g.acc(Pp.astype(np.float32), 'VEC3', 34962, minmax=True),
                 'NORMAL': g.acc(N[used].astype(np.float32), 'VEC3', 34962),
                 'TEXCOORD_0': g.acc(UV[used].astype(np.float32), 'VEC2', 34962),
                 'JOINTS_0': g.acc(JT[used], 'VEC4', 34962),
                 'WEIGHTS_0': g.acc(np.round(WT[used] * 255).astype(np.uint8), 'VEC4', 34962, normalized=True)}
        parts = [(slot, core)] + [('%s~%s' % (slot, o), b[0]) for o, b in own if len(b[0])]
        for name, ts in parts:
            idx = remap[tri[ts]].reshape(-1)
            dt = np.uint16 if len(used) < 65536 else np.uint32
            meshes.append({'name': name, 'primitives': [{'attributes': attrs, 'material': 0,
                                                          'indices': g.acc(idx.astype(dt), 'SCALAR', 34963)}]})
            nodes.append({'name': name, 'mesh': len(meshes) - 1, 'skin': 0})
            nodes[0]['children'].append(len(nodes) - 1)
            summary[name] = int(len(ts))
    g.j['meshes'], g.j['nodes'] = meshes, nodes
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(out, 'wb').write(g.bytes())
    return summary


def renormalise_weights(WT):
    """the uint8 weights must sum to 255 for each vertex; push the rounding error onto the largest"""
    q = np.round(WT * 255)
    q[np.arange(len(q)), q.argmax(1)] += 255 - q.sum(1)
    return (q / 255).astype(np.float32)


# the clips in anims.glb: (source GLB, its clip name, the name here). Styv's idle is a big backward stretch, so the
# standing idle is Phil's; Phil's hips sit lower, so his hips' track is scaled onto Styv's height (hips_scale)
CLIPS = [(CANON, 'idle', 'stretch'), (CANON, 'walk', 'walk'), (CANON, 'run', 'run'),
         (os.path.join(ROOT, 'settlements', 'girder', 'hero', 'phil.glb'), 'idle', 'idle')]


def write_anims(out, c):
    """canonical skeleton + the CLIPS, translation tracks dropped except the hips'"""
    names, parents, jnodes, W = skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in FACE})
    g = glbio.GlbWriter()
    nodes = [{'name': 'Character', 'children': [1 + parents.index(-1)]}] + [dict(n) for n in jnodes]
    for n in nodes[1:]:
        if 'children' in n:
            n['children'] = [ch + 1 for ch in n['children']]
    by = {glbio.short(n.get('name', '')): i + 1 for i, n in enumerate(jnodes)}
    anims = []
    for src, clip, name in CLIPS:
        j, b = glbio.read_glb(open(src, 'rb').read())
        hips_scale = c.jpos[c.J['Hips']][1] / load(src).jpos[load(src).J['Hips']][1]
        a = [x for x in j['animations'] if x['name'] == clip][0]
        chans, samps = [], []
        for ch in a['channels']:
            nm = glbio.short(j['nodes'][ch['target']['node']].get('name', ''))
            path = ch['target']['path']
            if nm not in by or (path == 'translation' and nm != 'Hips') or path == 'scale':
                continue
            s = a['samplers'][ch['sampler']]
            inp = glbio.accessor(j, b, s['input']).astype(np.float32)
            outp = glbio.accessor(j, b, s['output']).astype(np.float32)
            if path == 'translation':
                outp = outp * np.float32(hips_scale)
            ia = g.acc(inp, 'SCALAR', minmax=True)
            oa = g.acc(outp, 'VEC4' if path == 'rotation' else 'VEC3')
            samps.append({'input': ia, 'output': oa, 'interpolation': s.get('interpolation', 'LINEAR')})
            chans.append({'sampler': len(samps) - 1, 'target': {'node': by[nm], 'path': path}})
        anims.append({'name': name, 'channels': chans, 'samplers': samps})
    g.j['nodes'], g.j['animations'] = nodes, anims
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(out, 'wb').write(g.bytes())
    return [a['name'] for a in anims]


def main():
    data = os.path.join(HERE, 'data')
    pieces = os.path.join(HERE, 'pieces')
    os.makedirs(pieces, exist_ok=True)
    donors = json.load(open(os.path.join(data, 'donors.json')))
    c = load(CANON)
    c.J = {n: i for i, n in enumerate(c.joints)}
    jnames = list(c.joints) + [f[0] for f in FACE]
    jidx = {n: i for i, n in enumerate(jnames)}
    outfits = []
    for dn in donors:
        path = os.path.join(HERE, dn['glb'])
        d = load(path)
        P, N, JT = fit(d, c)
        N = smooth_normals(P, N, d.tri)
        dense = np.zeros((len(P), len(jnames)))
        for t in range(4):
            np.add.at(dense, (np.arange(len(P)), JT[:, t]), d.wt[:, t])
        marks = face_landmarks(P, dense, c)
        if marks is None:
            sys.exit('make_pieces.py: %s: no face found' % dn['id'])
        dense = face_weights(P, dense, c, marks, jidx)
        JT2, WT2 = top4(dense)
        WT2 = renormalise_weights(WT2)
        tslot, bands = cut(P, N, d.tri, dense, jnames)
        summary = write_piece(os.path.join(pieces, dn['id'] + '.glb'), dn['id'], c, P, N, d.uv, JT2, WT2,
                              d.tri, tslot, bands, d, marks)
        outfits.append({'id': dn['id'], 'name': dn['name'], 'glb': 'pieces/%s.glb' % dn['id'],
                        'head': dn.get('head', 'face'),
                        'face': {k: [round(x, 4) for x in v] for k, v in marks.items()},
                        'meshes': summary})
        print('%-7s %6d verts  %s' % (dn['id'], len(P), ' '.join('%s:%d' % kv for kv in summary.items())))
    clips = write_anims(os.path.join(pieces, 'anims.glb'), c)
    names, parents, jnodes, W = skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in FACE})
    json.dump({'joints': [{'name': n['name'], 'parent': parents[i], 't': n['translation'], 'r': n['rotation']}
                          for i, n in enumerate(jnodes)],
               'clips': clips}, open(os.path.join(data, 'skeleton.json'), 'w'), indent=1)
    json.dump({'slots': SLOTS, 'bands': [[o, i] for (o, i) in BAND], 'face_joints': [f[0] for f in FACE],
               'outfits': outfits}, open(os.path.join(data, 'outfits.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
