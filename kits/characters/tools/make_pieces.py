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


# how much of the neck-ring shift each joint's vertices take: all of it above the chest, fading to none at the hips,
# so a donor's own chest stays on its own neck while its neck moves onto everyone else's
NECK_GAIN = {'Spine': 0.33, 'Spine1': 0.66, 'Spine2': 1.0, 'Neck': 1.0, 'Head': 1.0, 'HeadTop_End': 1.0, 'headfront': 1.0}
for _s in ('Left', 'Right'):
    for _b in ('Shoulder', 'Arm', 'ForeArm', 'Hand', 'HandMiddle4'):
        NECK_GAIN[_s + _b] = 1.0


def neck_ring(P, tri, dense, joints):
    """the centre (x, z) of the seam between the head slot and the torso slot: where the two pieces must meet.
    Rigs put their spine and neck joints at different depths in the body (Meshy's web rig, Styv's and Phil's, sits
    6-10 cm further back than its API rig), so matching joints leaves heads in front of or behind other torsos"""
    sl = np.array([SLOTS.index(SLOT_OF.get(n, 'head')) for n in joints])
    vs = np.stack([dense[:, sl == s].sum(1) for s in range(len(SLOTS))], 1)
    tslot = vs[tri].sum(1).argmax(1)
    w = weld(P)
    h = np.zeros(w.max() + 1, bool)
    t = np.zeros(w.max() + 1, bool)
    h[w[tri[tslot == SLOTS.index('head')]].reshape(-1)] = True
    t[w[tri[tslot == SLOTS.index('torso')]].reshape(-1)] = True
    ring = np.nonzero((h & t)[w])[0]
    return np.array([np.median(P[ring, 0]), np.median(P[ring, 2])]), len(ring)


def neck_shift(P, dense, joints, delta):
    gain = np.array([NECK_GAIN.get(n, 0.0) for n in joints])
    g = dense @ gain
    P = P.copy()
    P[:, 0] += g * delta[0]
    P[:, 2] += g * delta[1]
    return P


# The seams every pair of pieces must meet at: (name, slot a, slot b, origin joint, axis from, axis to, side, reach m).
# Each donor's ring at a seam (where its own slot-a and slot-b triangles meet) is measured as a radius and a height
# round the axis, in bins of angle; the target ring is the median over all donors; every donor's surface within
# `reach` of its ring (along the surface, both sides) is morphed onto the target, fading out. Any head then ends on
# the ring every torso starts from, and so on for the waist, wrists and ankles.
SEAMS = [('neck', 'head', 'torso', 'Neck', 'Neck', 'Head', 0, 0.05),
         ('waist', 'torso', 'legs', 'Hips', 'Hips', 'Spine', 0, 0.08),
         ('wrist_L', 'hands', 'torso', 'LeftHand', 'LeftForeArm', 'LeftHand', 1, 0.05),
         ('wrist_R', 'hands', 'torso', 'RightHand', 'RightForeArm', 'RightHand', -1, 0.05),
         ('ankle_L', 'feet', 'legs', 'LeftFoot', 'LeftLeg', 'LeftFoot', 1, 0.06),
         ('ankle_R', 'feet', 'legs', 'RightFoot', 'RightLeg', 'RightFoot', -1, 0.06)]
BINS = 32


def tri_slots(tri, dense, joints):
    sl = np.array([SLOTS.index(SLOT_OF.get(n, 'head')) for n in joints])
    vs = np.stack([dense[:, sl == s].sum(1) for s in range(len(SLOTS))], 1)
    return vs[tri].sum(1).argmax(1)


def seam_frame(c, seam):
    _, _, _, oj, a0, a1, _, _ = seam
    o = c.jpos[c.J[oj]]
    ax = c.jpos[c.J[a1]] - c.jpos[c.J[a0]]
    ax /= np.linalg.norm(ax)
    ref = np.array([0, 0, 1.0]) if abs(ax[2]) < 0.9 else np.array([1.0, 0, 0])
    u = ref - ax * ref.dot(ax)
    u /= np.linalg.norm(u)
    return o, ax, u, np.cross(ax, u)


def polar(P, frame):
    o, ax, u, v = frame
    d = P - o
    h = d @ ax
    r = d - np.outer(h, ax)
    return np.arctan2(r @ v, r @ u), np.linalg.norm(r, axis=1), h, r


def circ_fill(vals):
    """bins with no sample take the nearest filled ones, round the circle; then a light smoothing"""
    ok = ~np.isnan(vals)
    if ok.sum() < 3:
        return None
    idx = np.arange(BINS)
    good = idx[ok]
    ext = np.concatenate([good - BINS, good, good + BINS])
    out = np.interp(idx, ext, np.tile(vals[ok], 3))
    return (np.roll(out, 1) + 2 * out + np.roll(out, -1)) / 4


def seam_ring(P, tri, tslot, frame, seam):
    """this donor's ring at a seam: (radius per bin, height per bin) or None"""
    _, a, b, _, _, _, side, _ = seam
    w = weld(P)
    ia, ib = SLOTS.index(a), SLOTS.index(b)
    ha = np.zeros(w.max() + 1, bool)
    hb = np.zeros(w.max() + 1, bool)
    ha[w[tri[tslot == ia]].reshape(-1)] = True
    hb[w[tri[tslot == ib]].reshape(-1)] = True
    ring = np.nonzero((ha & hb)[w])[0]
    if side:
        ring = ring[np.sign(P[ring, 0]) == side]
    if len(ring) < 8:
        return None
    th, r, h, _ = polar(P[ring], frame)
    k = ((th + np.pi) / (2 * np.pi) * BINS).astype(int) % BINS
    R = np.full(BINS, np.nan)
    Hh = np.full(BINS, np.nan)
    for i in range(BINS):
        if (k == i).any():
            R[i] = np.median(r[k == i])
            Hh[i] = np.median(h[k == i])
    R, Hh = circ_fill(R), circ_fill(Hh)
    return None if R is None else (R, Hh, ring)


def conform(P, tri, tslot, frame, seam, mine, target):
    """morph the donor's surface near its ring onto the target ring"""
    _, a, b, _, _, _, side, reach = seam
    R0, H0, ring = mine
    R1, H1 = target
    w = weld(P)
    nw = w.max() + 1
    e = np.concatenate([tri[:, [0, 1]], tri[:, [1, 2]], tri[:, [2, 0]]])
    ln = np.linalg.norm(P[e[:, 0]] - P[e[:, 1]], axis=1) + 1e-7
    G = coo_matrix((np.concatenate([ln, ln]), (np.concatenate([w[e[:, 0]], w[e[:, 1]]]),
                                                np.concatenate([w[e[:, 1]], w[e[:, 0]]]))), shape=(nw, nw)).tocsr()
    dist = dijkstra(G, indices=np.unique(w[ring]), min_only=True, limit=reach)[w]
    near = np.isfinite(dist)
    slot_ok = np.zeros(len(P), bool)
    for s in (a, b):
        slot_ok[tri[tslot == SLOTS.index(s)].reshape(-1)] = True
    sel = np.nonzero(near & slot_ok)[0]
    if side:
        sel = sel[np.sign(P[sel, 0]) == side]
    o, ax, u, v = frame
    th, r, h, rv = polar(P[sel], frame)
    x = (th + np.pi) / (2 * np.pi) * BINS - 0.5
    i0 = np.floor(x).astype(int) % BINS
    i1 = (i0 + 1) % BINS
    f = x - np.floor(x)
    dR = (1 - f) * (R1 - R0)[i0] + f * (R1 - R0)[i1]
    dH = (1 - f) * (H1 - H0)[i0] + f * (H1 - H0)[i1]
    t = np.clip(1 - dist[sel] / reach, 0, 1)
    g = t * t * (3 - 2 * t)
    rd = rv / np.maximum(r, 1e-6)[:, None]
    P = P.copy()
    P[sel] += (g * dR)[:, None] * rd + (g * dH)[:, None] * ax
    return P


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


# the clips in anims.glb: (source GLB, its clip name, the name here, the label, the group). Every clip is retargeted
# (retarget() below), so a clip made on any rig plays on the canonical skeleton. Meshy's library idles were made on
# the scout donor's API rig by `meshy.py anims` (donors/anims/idles.json lists them).
STYV_GLB = CANON
IDLES = os.path.join(HERE, 'donors', 'anims')
CLIPS = [(STYV_GLB, 'walk', 'walk', 'Walk', 'move'), (STYV_GLB, 'run', 'run', 'Run', 'move'),
         (STYV_GLB, 'idle', 'stretch', 'Stretch', 'idle')]
FPS = 30


def idle_clips():
    """the Meshy library idles, from donors/anims/idles.json: 'Idle' -> idle, 'Idle 3' -> idle_3, the rest by name"""
    jp = os.path.join(IDLES, 'idles.json')
    if not os.path.exists(jp):
        return []
    out = []
    for b in json.load(open(jp))['batches']:
        src = os.path.join(IDLES, b['glb'])
        names = [a['name'] for a in glbio.read_glb(open(src, 'rb').read())[0]['animations']]
        for clip, label in zip(names, b['names']):
            key = label.lower().replace(' ', '_') if label.startswith('Idle') else label.split()[0].lower()
            out.append((src, clip, key, label, 'idle'))
    return out


def _sample(j, b, ch_s, t):
    inp = glbio.accessor(j, b, ch_s['input']).reshape(-1)
    out = glbio.accessor(j, b, ch_s['output'])
    if t <= inp[0]:
        return out[0].astype(float)
    if t >= inp[-1]:
        return out[-1].astype(float)
    k = int(np.searchsorted(inp, t) - 1)
    f = (t - inp[k]) / max(inp[k + 1] - inp[k], 1e-9)
    a, c = out[k].astype(float), out[k + 1].astype(float)
    if len(a) == 4:
        if a.dot(c) < 0:
            c = -c
        q = a * (1 - f) + c * f
        return q / np.linalg.norm(q)
    return a * (1 - f) + c * f


def retarget(src, clip, c):
    """clip `clip` of `src` as (times, {canonical joint: rotations (F,4) local}, hips positions (F,3)).
    Per frame: each source joint's world delta from its rest, D = W(t) inv(W_rest); the canonical joint's world
    rotation is D A R_c, where R_c is its rest rotation and A turns the canonical bone onto the source bone's rest
    direction (so a source rig with arms at 20 degrees and ours at 48 move the arm to the same place). Local rotations
    follow from the canonical hierarchy; the hips move by the source's hips motion times the height ratio."""
    j, b = glbio.read_glb(open(src, 'rb').read())
    nodes = j['nodes']
    parent = {}
    for i, n in enumerate(nodes):
        for ch in n.get('children', []):
            parent[ch] = i
    a = [x for x in j['animations'] if x['name'] == clip][0]
    chans = {}
    for ch in a['channels']:
        chans.setdefault(ch['target']['node'], {})[ch['target']['path']] = a['samplers'][ch['sampler']]
    dur = max(float(glbio.accessor(j, b, s['input']).max()) for d in chans.values() for s in d.values())
    times = np.arange(0, dur + 1e-6, 1.0 / FPS)
    r = load(src)
    skin_nodes = j['skins'][0]['joints']
    api = any(glbio.short(nodes[nd].get('name', '')) == 'Spine02' for nd in skin_nodes)   # r.joints are renamed already
    sname = {nd: canon_name(glbio.short(nodes[nd].get('name', '')), api) for nd in skin_nodes}
    by_canon = {v: k for k, v in sname.items()}
    k = height(c) / height(r)

    def world_all(override):
        W = {}

        def w(i):
            if i in W:
                return W[i]
            n = dict(nodes[i])
            n.update(override.get(i, {}))
            m = glbio.node_matrix(n)
            W[i] = (w(parent[i]) @ m) if i in parent else m
            return W[i]
        for i in range(len(nodes)):
            w(i)
        return W

    W0 = world_all({})
    rot = lambda m: m[:3, :3] / np.linalg.norm(m[:3, :3], axis=0)
    # A per canonical joint: canonical rest bone direction onto the source's
    A = {}
    order = sorted(range(len(c.joints)), key=lambda i: depth(c, i))
    for i in order:
        n = c.joints[i]
        ch = CHILD.get(n)
        if n in by_canon and ch and ch in by_canon and ch in c.J and n not in ('Head',):
            ds = W0[by_canon[ch]][:3, 3] - W0[by_canon[n]][:3, 3]
            dc = c.jpos[c.J[ch]] - c.jpos[i]
            A[n] = rot_between(dc, ds)
        else:
            p = c.parents[i]
            A[n] = A[c.joints[p]] if p >= 0 else np.eye(3)
    rots = {n: [] for n in c.joints if n in by_canon}
    hips = []
    for t in times:
        ov = {}
        for nd, d in chans.items():
            o = {}
            for path, sm in d.items():
                if path in ('rotation', 'translation'):
                    o[path] = list(_sample(j, b, sm, t))
            ov[nd] = o
        W = world_all(ov)
        Rt = {}
        for i in order:
            n = c.joints[i]
            if n in by_canon:
                nd = by_canon[n]
                D = rot(W[nd]) @ rot(W0[nd]).T
                Rt[n] = D @ A[n] @ c.jrot[i]
            else:
                p = c.parents[i]
                # no source joint (HandMiddle4, Toe_End): keep its rest offset from the parent
                Rt[n] = Rt[c.joints[p]] @ (c.jrot[p].T @ c.jrot[i]) if p >= 0 else c.jrot[i]
        for i in order:
            n = c.joints[i]
            if n not in rots:
                continue
            p = c.parents[i]
            L = Rt[c.joints[p]].T @ Rt[n] if p >= 0 else Rt[n]
            q = glbio.mat_quat(L)
            prev = rots[n][-1] if rots[n] else None
            if prev is not None and np.dot(prev, q) < 0:
                q = -q
            rots[n].append(q)
        hn = by_canon['Hips']
        hips.append(c.jpos[c.J['Hips']] + k * (W[hn][:3, 3] - W0[hn][:3, 3]))
    return times, {n: np.array(v) for n, v in rots.items()}, np.array(hips)


def write_anims(out, c):
    """canonical skeleton + every clip, retargeted: rotation tracks, and the hips' translation"""
    names, parents, jnodes, W = skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in FACE})
    g = glbio.GlbWriter()
    nodes = [{'name': 'Character', 'children': [1 + parents.index(-1)]}] + [dict(n) for n in jnodes]
    for n in nodes[1:]:
        if 'children' in n:
            n['children'] = [ch + 1 for ch in n['children']]
    by = {n.get('name', ''): i + 1 for i, n in enumerate(jnodes)}
    anims, meta = [], []
    for src, clip, name, label, group in CLIPS + idle_clips():
        times, rots, hips = retarget(src, clip, c)
        ia = g.acc(times.astype(np.float32), 'SCALAR', minmax=True)
        chans, samps = [], []
        for n, q in rots.items():
            samps.append({'input': ia, 'output': g.acc(q.astype(np.float32), 'VEC4'), 'interpolation': 'LINEAR'})
            chans.append({'sampler': len(samps) - 1, 'target': {'node': by[n], 'path': 'rotation'}})
        samps.append({'input': ia, 'output': g.acc(hips.astype(np.float32), 'VEC3'), 'interpolation': 'LINEAR'})
        chans.append({'sampler': len(samps) - 1, 'target': {'node': by['Hips'], 'path': 'translation'}})
        anims.append({'name': name, 'channels': chans, 'samplers': samps})
        meta.append({'name': name, 'label': label, 'group': group, 'seconds': round(float(times[-1]), 2)})
    g.j['nodes'], g.j['animations'] = nodes, anims
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(out, 'wb').write(g.bytes())
    return meta


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
    fitted = []
    for dn in donors:
        d = load(os.path.join(HERE, dn['glb']))
        P, N, JT = fit(d, c)
        dense = np.zeros((len(P), len(jnames)))
        for t in range(4):
            np.add.at(dense, (np.arange(len(P)), JT[:, t]), d.wt[:, t])
        ring, nring = neck_ring(P, d.tri, dense, jnames)
        fitted.append((dn, d, P, N, dense, ring))
    target = np.median(np.stack([f[5] for f in fitted]), 0)
    # front-back only: bodies are symmetric, and an off-centre collar (Styv's ruff) moves the ring's x without the neck
    fitted = [f[:5] + (np.array([target[0], f[5][1]]),) for f in fitted]
    shifted = []
    frames = [seam_frame(c, sm) for sm in SEAMS]
    for dn, d, P, N, dense, ring in fitted:
        P = neck_shift(P, dense, jnames, target - ring)
        tslot = tri_slots(d.tri, dense, jnames)
        rings = [seam_ring(P, d.tri, tslot, fr, sm) for sm, fr in zip(SEAMS, frames)]
        shifted.append((dn, d, P, N, dense, ring, tslot, rings))
    ring_target = []
    for k, sm in enumerate(SEAMS):
        have = [x[7][k] for x in shifted if x[7][k] is not None]
        ring_target.append((np.median(np.stack([h[0] for h in have]), 0), np.median(np.stack([h[1] for h in have]), 0)))
    for dn, d, P, N, dense, ring, tslot, rings in shifted:
        for k, sm in enumerate(SEAMS):
            if rings[k] is not None:
                P = conform(P, d.tri, tslot, frames[k], sm, rings[k], ring_target[k])
        N = smooth_normals(P, N, d.tri)
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
        print('%-7s %6d verts  neck %+.3f %+.3f  %s' % (dn['id'], len(P), (target - ring)[0], (target - ring)[1],
                                                       ' '.join('%s:%d' % kv for kv in summary.items())))
    clips = write_anims(os.path.join(pieces, 'anims.glb'), c)
    names, parents, jnodes, W = skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in FACE})
    json.dump({'joints': [{'name': n['name'], 'parent': parents[i], 't': n['translation'], 'r': n['rotation']}
                          for i, n in enumerate(jnodes)],
               'clips': clips}, open(os.path.join(data, 'skeleton.json'), 'w'), indent=1)
    json.dump({'slots': SLOTS, 'bands': [[o, i] for (o, i) in BAND], 'face_joints': [f[0] for f in FACE],
               'outfits': outfits}, open(os.path.join(data, 'outfits.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
