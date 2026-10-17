#!/usr/bin/env python3
"""Make the equipment pieces: every donor fitted to one skeleton and cut into slots.

  python3 tools/make_pieces.py [male|female]    # every donor in data/donors.json, per body (BODIES) ->
                                                # pieces/<body>/<id>.glb, pieces/<body>/anims.glb,
                                                # data/<body>/skeleton.json, data/<body>/outfits.json

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
import io, json, math, os, sys
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
# the Unreal-style mannequin Quaternius's Universal Animation Libraries use (CC0 clips, data/clips.json 'ual')
NAME_MAP.update({'pelvis': 'Hips', 'spine_01': 'Spine', 'spine_02': 'Spine1', 'spine_03': 'Spine2', 'neck_01': 'Neck'})
for _s, _S in (('l', 'Left'), ('r', 'Right')):
    NAME_MAP.update({'clavicle_' + _s: _S + 'Shoulder', 'upperarm_' + _s: _S + 'Arm', 'lowerarm_' + _s: _S + 'ForeArm',
                     'hand_' + _s: _S + 'Hand', 'thigh_' + _s: _S + 'UpLeg', 'calf_' + _s: _S + 'Leg',
                     'foot_' + _s: _S + 'Foot', 'ball_' + _s: _S + 'ToeBase'})
    for _f, _F in (('thumb', 'Thumb'), ('index', 'Index'), ('middle', 'Middle'), ('ring', 'Ring'), ('pinky', 'Pinky')):
        for _k in (1, 2, 3):
            NAME_MAP['%s_0%d_%s' % (_f, _k, _s)] = '%sHand%s%d' % (_S, _F, _k)
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


def action_clips():
    """the clips data/clips.json lists: Meshy library actions (donors/anims/actions.json) and Quaternius's Universal
    Animation Library clips (donors/anims/UAL*.glb): (src, clip, key, label, group, loop). A Meshy action whose entry
    is also derived comes as '<key>@src', the source of its derive and not a clip of its own"""
    jp, cp = os.path.join(IDLES, 'actions.json'), os.path.join(HERE, 'data', 'clips.json')
    if not os.path.exists(jp) or not os.path.exists(cp):
        return []
    clips = json.load(open(cp))['clips']
    want = {c['meshy']: c for c in clips if 'meshy' in c}
    out = []
    for c in clips:                     # 'ual': '<file>:<clip>' in donors/anims/ (Quaternius, CC0)
        if 'ual' in c:
            f, clip = c['ual'].split(':')
            out.append((os.path.join(IDLES, f), clip, c['key'], c['label'], c['group'], c['loop']))
    for b in json.load(open(jp))['batches']:
        src = os.path.join(IDLES, b['glb'])
        names = [a['name'] for a in glbio.read_glb(open(src, 'rb').read())[0]['animations']]
        for clip, aid in zip(names, b['ids']):
            if aid in want:
                c = want[aid]
                out.append((src, clip, c['key'] + ('@src' if 'derive' in c else ''), c['label'], c['group'], c['loop']))
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


# ---- clips made from others, for work the libraries have no clip for (data/clips.json 'derive') ----
def _qm(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def _slerp(a, b, s):
    if np.dot(a, b) < 0:
        b = -b
    d = float(np.clip(np.dot(a, b), -1, 1))
    if d > 0.9995:
        q = a + s * (b - a)
    else:
        th = np.arccos(d)
        q = (np.sin((1 - s) * th) * a + np.sin(s * th) * b) / np.sin(th)
    return q / np.linalg.norm(q)


def loop_back(clip, back):
    """a one-shot made a loop: after its last frame it eases back to its first over `back` seconds"""
    times, rots, hips = clip
    n = max(2, int(round(back * FPS)))
    ss = [0.5 - 0.5 * math.cos(math.pi * k / n) for k in range(1, n + 1)]
    t2 = np.concatenate([times, times[-1] + np.arange(1, n + 1) / FPS])
    r2 = {j: np.concatenate([q, [_slerp(q[-1], q[0], s) for s in ss]]) for j, q in rots.items()}
    h2 = np.concatenate([hips, [hips[-1] + s * (hips[0] - hips[-1]) for s in ss]])
    return t2, r2, h2


def _ease(keys, t):
    """a point along keys [(time, vector, ease)]: each stretch eased in-out ('io'), in ('in') or out ('out')"""
    for (t0, a, _), (t1, b, e) in zip(keys, keys[1:]):
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0)
            u = u * u if e == 'in' else 1 - (1 - u) ** 2 if e == 'out' else 0.5 - 0.5 * math.cos(math.pi * u)
            return a + (b - a) * u
    return keys[-1][1]


def grip_frame(c, S):
    """the grip frame of hand S ('Right', 'Left') at rest, in the skeleton's space (4x4): origin in the closed hand,
    +Y along the handle out past the index finger, +Z the way the fingers point, +X out of the palm (make_mpfb.hands,
    tools/make_props.py)"""
    P = lambda n: c.jpos[c.J[S + n]]
    hand = P('Hand')
    knuck = np.mean([P('Hand' + f + '1') for f in ('Index', 'Middle', 'Ring', 'Pinky')], 0)
    Y = P('HandIndex1') - P('HandPinky1')
    Y /= np.linalg.norm(Y)
    Z = knuck - hand
    Z -= Y * Y.dot(Z)
    Z /= np.linalg.norm(Z)
    X = np.cross(Y, Z)
    if X.dot(P('HandMiddle3') - P('HandMiddle1')) < 0:      # the fingers curl toward the palm: that side is +X
        Y, X = -Y, -X
    G = np.eye(4)
    G[:3, :3] = np.stack([X, Y, Z], 1)
    G[:3, 3] = 0.45 * hand + 0.55 * knuck + 0.028 * X
    return G


class _Rig:
    """a pose built on one frame of a clip, for the clips made here: forward kinematics on the canonical skeleton
    (loc: each joint's rotation in its parent's frame), a joint turned by a rotation in the skeleton's space, a two-bone
    arm solve, a hand turned to hold its prop a given way, and the frame's rotations as quaternions"""

    def __init__(self, c, clip, frame=0):
        times0, rots0, hips0 = clip
        self.c, self.n, self.names = c, len(c.joints), list(rots0)
        self.order = sorted(range(self.n), key=lambda i: depth(c, i))
        self.loc0 = [_qm(rots0[c.joints[i]][frame]) if c.joints[i] in rots0 else
                     (c.jrot[c.parents[i]].T @ c.jrot[i] if c.parents[i] >= 0 else c.jrot[i]) for i in range(self.n)]
        self.off = [c.jrot[c.parents[i]].T @ (c.jpos[i] - c.jpos[c.parents[i]]) if c.parents[i] >= 0 else None for i in range(self.n)]
        self.hips = hips0[frame]

    def fk(self, loc):
        Rw, P = [None] * self.n, [None] * self.n
        for i in self.order:
            p = self.c.parents[i]
            Rw[i] = loc[i] if p < 0 else Rw[p] @ loc[i]
            P[i] = self.hips if p < 0 else P[p] + Rw[p] @ self.off[i]
        return Rw, P

    def turn(self, loc, j, R):
        """joint j turned by R (in the skeleton's space) about its own origin"""
        Rw, _ = self.fk(loc)
        loc[j] = Rw[self.c.parents[j]].T @ R @ Rw[j]

    def reach(self, loc, up, fore, hand, T, pole):
        """the upper arm and forearm turned so the hand joint comes to T (as near as the arm reaches), the elbow
        toward pole"""
        c = self.c
        Rw, P = self.fk(loc)
        S, E, W = P[up], P[fore], P[hand]
        a, b = np.linalg.norm(E - S), np.linalg.norm(W - E)
        d = T - S
        dl = min(np.linalg.norm(d), 0.995 * (a + b))
        u = d / np.linalg.norm(d)
        T = S + u * dl
        x = (a * a - b * b + dl * dl) / (2 * dl)
        h = math.sqrt(max(a * a - x * x, 0))
        v = pole - u * np.dot(pole, u)
        v /= np.linalg.norm(v)
        E2 = S + u * x + v * h
        Rup = rot_between(E - S, E2 - S) @ Rw[up]
        loc[up] = Rw[c.parents[up]].T @ Rup
        Rw, P = self.fk(loc)
        Rf = rot_between(P[hand] - P[fore], T - P[fore]) @ Rw[fore]
        loc[fore] = Rw[c.parents[fore]].T @ Rf

    def hold(self, loc, hand, grip, Y, Z):
        """hand turned so its grip frame (grip: its axes in the hand bone) has the prop's +Y along Y and +Z along Z"""
        Y = Y / np.linalg.norm(Y)
        Z = Z - Y * Y.dot(Z)
        Z /= np.linalg.norm(Z)
        Rw, _ = self.fk(loc)
        loc[hand] = Rw[self.c.parents[hand]].T @ np.stack([np.cross(Y, Z), Y, Z], 1) @ grip.T

    def quats(self, loc, out):
        for nm in out:
            q = np.array(glbio.mat_quat(loc[self.c.J[nm]]))
            if out[nm] and np.dot(out[nm][-1], q) < 0:
                q = -q
            out[nm].append(q)


def _Rx(a):
    return np.array([[1, 0, 0], [0, math.cos(a), -math.sin(a)], [0, math.sin(a), math.cos(a)]])


def _Ry(a):
    return np.array([[math.cos(a), 0, math.sin(a)], [0, 1, 0], [-math.sin(a), 0, math.cos(a)]])


def hammer_loop(c, idle, cycle=1.1):
    """hammering at an anvil, standing: the idle's first frame, the spine leaning in as the blow lands, the head
    down, the right hand (the hammer) lifted to the shoulder and brought down onto an anvil at the hips' height in
    front (just below them), and the left hand resting on the work beside it. Each arm is a two-bone solve (the elbow out and down)"""
    rig = _Rig(c, idle)
    hips0 = idle[2]
    J = c.J
    hy = float(hips0[0][1])                   # the idle's hips, a little below the rest's
    side = 1.0 if c.jpos[J['RightArm']][0] > c.jpos[J['LeftArm']][0] else -1.0     # +x on the right hand's side?
    shR, shL = c.jpos[J['RightArm']], c.jpos[J['LeftArm']]
    anvil = np.array([shR[0] * 0.8 + shL[0] * 0.2, hy - 0.03, 0.34])
    keys = [(0.0, anvil + [0, 0.06, -0.01], ''), (0.48 * cycle, np.array([shR[0] + side * 0.06, shR[1] + 0.1, 0.12]), 'io'),
            (0.64 * cycle, anvil, 'in'), (0.74 * cycle, anvil + [0, 0.08, -0.01], 'out'), (cycle, anvil + [0, 0.06, -0.01], 'io')]
    lean = [(0.0, np.array([0.22]), ''), (0.48 * cycle, np.array([0.12]), 'io'), (0.64 * cycle, np.array([0.32]), 'in'),
            (cycle, np.array([0.22]), 'io')]
    left = np.array([anvil[0] - side * 0.22, hy + 0.01, 0.3])
    # the hammer's pitch: its handle (the grip's +Y) forward and its face (+Z) down as it lands, swung up and back over
    # the shoulder at the top of the lift
    pitch = [(0.0, np.array([-0.35]), ''), (0.48 * cycle, np.array([-2.1]), 'io'), (0.64 * cycle, np.array([0.0]), 'in'),
             (0.74 * cycle, np.array([-0.4]), 'out'), (cycle, np.array([-0.35]), 'io')]
    grip = c.jrot[J['RightHand']].T @ grip_frame(c, 'Right')[:3, :3]        # the grip's axes in the hand bone
    times = np.arange(0, cycle + 1e-6, 1.0 / FPS)
    out = {nm: [] for nm in rig.names}
    for t in times:
        loc = list(rig.loc0)
        rig.turn(loc, J['Spine'], _Rx(float(_ease(lean, t)[0])))
        rig.turn(loc, J['Head'], _Rx(0.3))
        rig.reach(loc, J['RightArm'], J['RightForeArm'], J['RightHand'], _ease(keys, t), np.array([side * 0.7, -1.0, -0.3]))
        a = float(_ease(pitch, t)[0])
        rig.hold(loc, J['RightHand'], grip, np.array([0, -math.sin(a) - 0.25 * math.cos(a), math.cos(a)]),
                 np.array([0, -math.cos(a), -math.sin(a)]))
        rig.reach(loc, J['LeftArm'], J['LeftForeArm'], J['LeftHand'], left, np.array([-side * 0.7, -1.0, -0.3]))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, np.repeat(hips0[:1], len(times), 0)


def dig_loop(c, idle, cycle=1.4):
    """digging with a pickaxe or a hoe, standing: the idle's first frame, both hands on the handle (the right at the
    grip, the left below it toward the end, where the figure's two-hand grip slides it on), lifted over the right
    shoulder with the head swung back behind it, and brought down in front with the spine bending into the blow, the
    head (the hammer's face, the grip's +Z) leading; it was Meshy's one-handed heavy swing looped, its left arm
    folded across the chest"""
    rig = _Rig(c, idle)
    J = c.J
    side = 1.0 if c.jpos[J['RightArm']][0] > c.jpos[J['LeftArm']][0] else -1.0
    _, P0 = rig.fk(list(rig.loc0))
    sh, hy = P0[J['RightArm']], float(rig.hips[1])
    T = lambda f: f * cycle
    low = np.array([sh[0] * 0.5, hy + 0.10, sh[2] + 0.34])
    hit = np.array([sh[0] * 0.3, hy - 0.02, sh[2] + 0.40])
    hand = [(0.0, low, ''), (T(0.45), np.array([sh[0] * 0.6, sh[1] + 0.22, sh[2] + 0.04]), 'io'), (T(0.62), hit, 'in'),
            (T(0.74), hit + [0, 0.03, -0.03], 'out'), (cycle, low, 'io')]
    pitch = [(0.0, np.array([0.3]), ''), (T(0.45), np.array([-2.2]), 'io'), (T(0.62), np.array([0.75]), 'in'),
             (T(0.74), np.array([0.7]), 'out'), (cycle, np.array([0.3]), 'io')]
    lean = [(0.0, np.array([0.3]), ''), (T(0.45), np.array([0.05]), 'io'), (T(0.62), np.array([0.5]), 'in'),
            (T(0.74), np.array([0.5]), ''), (cycle, np.array([0.3]), 'io')]
    grip = c.jrot[J['RightHand']].T @ grip_frame(c, 'Right')[:3, :3]
    times = np.arange(0, cycle + 1e-6, 1.0 / FPS)
    out = {nm: [] for nm in rig.names}
    for t in times:
        loc = list(rig.loc0)
        ln = float(_ease(lean, t)[0])
        rig.turn(loc, J['Spine'], _Rx(ln * 0.6))
        rig.turn(loc, J['Spine1'], _Rx(ln * 0.4))
        rig.turn(loc, J['Head'], _Rx(0.25))
        R, a = _ease(hand, t), float(_ease(pitch, t)[0])
        rig.reach(loc, J['RightArm'], J['RightForeArm'], J['RightHand'], R, np.array([side * 0.7, -1.0, -0.3]))
        Y = np.array([0, -math.sin(a) - 0.25 * math.cos(a), math.cos(a)])
        rig.hold(loc, J['RightHand'], grip, Y, np.array([0, -math.cos(a), -math.sin(a)]))
        rig.reach(loc, J['LeftArm'], J['LeftForeArm'], J['LeftHand'], R - Y / np.linalg.norm(Y) * 0.1,
                  np.array([-side * 0.7, -1.0, -0.3]))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, np.repeat(idle[2][:1], len(times), 0)


def _point(rig, loc, R, a, side, grip, inward):
    """the right hand to R holding its prop with the point forward (the grip's +Y), pitched up by a and turned
    across toward the middle by inward, the elbow out and down"""
    J = rig.c.J
    rig.reach(loc, J['RightArm'], J['RightForeArm'], J['RightHand'], R, np.array([side * 0.8, -1.0, -0.2]))
    Y = np.array([-side * inward, math.sin(a), math.cos(a)])
    rig.hold(loc, J['RightHand'], grip, Y, np.array([0, -math.cos(a), math.sin(a)]))
    return Y / np.linalg.norm(Y)


def _spear_arms(rig, loc, R, a, reach, side, grip):
    """a spear held underhand: the right hand at R on the butt end, the point forward and up across the body (a),
    the left hand forward along the shaft by reach (the figure's two-hand grip slides it onto the shaft)"""
    J = rig.c.J
    Y = _point(rig, loc, R, a, side, grip, 0.22)
    rig.reach(loc, J['LeftArm'], J['LeftForeArm'], J['LeftHand'], R + Y * reach, np.array([-side * 0.4, -1.0, 0.0]))


def spear_carry(c, clip):
    """a clip's legs and body with the arms holding a spear at the guard of the spear thrust (thrust_clip), frame by
    frame: Meshy's 'Spear Walk' carried the spear with the right hand behind the back"""
    J = c.J
    side = 1.0 if c.jpos[J['RightArm']][0] > c.jpos[J['LeftArm']][0] else -1.0
    grip = c.jrot[J['RightHand']].T @ grip_frame(c, 'Right')[:3, :3]
    times, rots, hips = clip
    out = {nm: [] for nm in rots}
    for f in range(len(times)):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        rig.turn(loc, J['Spine1'], _Ry(side * 0.15))
        _, P = rig.fk(loc)
        sh, hy = P[J['RightArm']], float(rig.hips[1])
        _spear_arms(rig, loc, np.array([sh[0] * 1.15, hy + 0.12, sh[2] + 0.14]), 0.28, 0.52, side, grip)
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def thrust_clip(c, stance, kind='one', cycle=1.3):
    """a straight thrust from the combat stance's first frame, at a man's chest in front: the hand drawn back to the
    ribs, driven forward and a little down with the point leading (along the grip's +Y), held, and brought back to
    the guard; the spine turns the right shoulder into it and leans in. kind 'one': the right hand alone (a dagger, a
    sword), the left drawn back to the hip. 'spear': underhand, the right hand at the hip on the butt end and the
    left hand forward on the shaft (where the figure's two-hand grip slides it on), both driving through. The
    libraries' one thrust (Meshy's 'Thrust Slash') stabs overhand, the point up, and a spear following that hand
    swung through the body"""
    rig = _Rig(c, stance)
    J = c.J
    side = 1.0 if c.jpos[J['RightArm']][0] > c.jpos[J['LeftArm']][0] else -1.0
    _, P0 = rig.fk(list(rig.loc0))
    sh, shL, hy = P0[J['RightArm']], P0[J['LeftArm']], float(rig.hips[1])
    T = lambda f: f * cycle
    if kind == 'spear':
        # the right hand by the hip, the shaft aimed up across the body at the chest of a man a pace and a half away
        guard, back = np.array([sh[0] * 1.15, hy + 0.12, sh[2] + 0.14]), np.array([sh[0] * 1.2, hy + 0.10, sh[2] + 0.0])
        hit = np.array([sh[0] * 0.55, hy + 0.24, sh[2] + 0.42])
        pitch = [(0.0, np.array([0.28]), ''), (T(0.3), np.array([0.3]), 'io'), (T(0.48), np.array([0.14]), 'in'),
                 (T(0.66), np.array([0.14]), ''), (cycle, np.array([0.28]), 'io')]
        twist = [(0.0, np.array([-0.30]), ''), (T(0.3), np.array([-0.42]), 'io'), (T(0.48), np.array([0.05]), 'in'),
                 (T(0.66), np.array([0.05]), ''), (cycle, np.array([-0.30]), 'io')]
        lean = [(0.0, np.array([0.04]), ''), (T(0.3), np.array([0.0]), 'io'), (T(0.48), np.array([0.14]), 'in'),
                (T(0.66), np.array([0.14]), ''), (cycle, np.array([0.04]), 'io')]
        reach = [(0.0, np.array([0.52]), ''), (T(0.3), np.array([0.58]), 'io'), (T(0.48), np.array([0.40]), 'in'),
                 (T(0.66), np.array([0.40]), ''), (cycle, np.array([0.52]), 'io')]
    else:
        guard, back = np.array([sh[0] * 0.9, sh[1] - 0.30, sh[2] + 0.26]), np.array([sh[0] * 1.05, sh[1] - 0.36, sh[2] - 0.04])
        hit = np.array([sh[0] * 0.25, sh[1] - 0.12, sh[2] + 0.62])
        pitch = [(0.0, np.array([0.55]), ''), (T(0.3), np.array([0.15]), 'io'), (T(0.48), np.array([-0.06]), 'in'),
                 (T(0.66), np.array([-0.06]), ''), (cycle, np.array([0.55]), 'io')]
        twist = [(0.0, np.array([0.0]), ''), (T(0.3), np.array([-0.28]), 'io'), (T(0.48), np.array([0.32]), 'in'),
                 (T(0.66), np.array([0.32]), ''), (cycle, np.array([0.0]), 'io')]
        lean = [(0.0, np.array([0.03]), ''), (T(0.3), np.array([0.0]), 'io'), (T(0.48), np.array([0.16]), 'in'),
                (T(0.66), np.array([0.16]), ''), (cycle, np.array([0.03]), 'io')]
        inward = 0.08
    hand = [(0.0, guard, ''), (T(0.3), back, 'io'), (T(0.48), hit, 'in'), (T(0.66), hit + [0, 0, -0.03], 'out'), (cycle, guard, 'io')]
    left_back = np.array([shL[0] * 1.1, shL[1] - 0.40, shL[2] - 0.06])
    grip = c.jrot[J['RightHand']].T @ grip_frame(c, 'Right')[:3, :3]
    times = np.arange(0, cycle + 1e-6, 1.0 / FPS)
    out = {nm: [] for nm in rig.names}
    for t in times:
        loc = list(rig.loc0)
        tw, ln = float(_ease(twist, t)[0]), float(_ease(lean, t)[0])
        # the turn and the lean shared between the lower and the upper spine, the head kept toward the target
        for nm in ('Spine', 'Spine1'):
            rig.turn(loc, J[nm], _Rx(ln / 2) @ _Ry(-side * tw / 2))
        rig.turn(loc, J['Head'], _Ry(side * tw * 0.8) @ _Rx(-ln * 0.5))
        R, a = _ease(hand, t), float(_ease(pitch, t)[0])
        if kind == 'spear':
            _spear_arms(rig, loc, R, a, float(_ease(reach, t)[0]), side, grip)
        else:
            _point(rig, loc, R, a, side, grip, inward)
            rig.reach(loc, J['LeftArm'], J['LeftForeArm'], J['LeftHand'], _ease([(0.0, P0[J['LeftHand']], ''), (T(0.48), left_back, 'in'),
                                                                                 (T(0.66), left_back, ''), (cycle, P0[J['LeftHand']], 'io')], t),
                      np.array([-side * 0.7, -1.0, -0.3]))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, np.repeat(stance[2][:1], len(times), 0)


def derived_clips(c, got):
    """data/clips.json entries with 'derive': {'loop_of': key, 'back': s} (a one-shot looped), {'hammer': true}, {'dig': true} or
    {'thrust': 'one' | 'spear', 'from': the stance clip} or {'carry': 'spear', 'from': a clip, '<key>@src' for an
    entry's own Meshy action}"""
    cp = os.path.join(HERE, 'data', 'clips.json')
    if not os.path.exists(cp):
        return []
    out = []
    for d in json.load(open(cp))['clips']:
        spec = d.get('derive')
        if not spec:
            continue
        if 'loop_of' in spec and spec['loop_of'] in got:
            clip = loop_back(got[spec['loop_of']], spec.get('back', 0.5))
        elif spec.get('hammer') and 'idle' in got:
            clip = hammer_loop(c, got['idle'], spec.get('cycle', 1.1))
        elif spec.get('dig') and 'idle' in got:
            clip = dig_loop(c, got['idle'], spec.get('cycle', 1.4))
        elif spec.get('carry') == 'spear' and spec.get('from') in got:
            clip = spear_carry(c, got[spec['from']])
        elif spec.get('thrust') and spec.get('from', 'combat_idle') in got:
            clip = thrust_clip(c, got[spec.get('from', 'combat_idle')], spec['thrust'], spec.get('cycle', 1.3))
        else:
            continue
        out.append(clip + (d['key'], d['label'], d['group'], d['loop']))
    return out


def write_anims(out, c):
    """canonical skeleton + every clip, retargeted: rotation tracks, and the hips' translation; then the clips made
    from them (derived_clips)"""
    names, parents, jnodes, W = skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in FACE})
    g = glbio.GlbWriter()
    nodes = [{'name': 'Character', 'children': [1 + parents.index(-1)]}] + [dict(n) for n in jnodes]
    for n in nodes[1:]:
        if 'children' in n:
            n['children'] = [ch + 1 for ch in n['children']]
    by = {n.get('name', ''): i + 1 for i, n in enumerate(jnodes)}
    anims, meta, got = [], [], {}
    made = []
    for src, clip, name, label, group, loop in [x + (True,) for x in CLIPS + idle_clips()] + action_clips():
        got[name] = retarget(src, clip, c)
        if '@' not in name:
            made.append(got[name] + (name, label, group, loop))
    for times, rots, hips, name, label, group, loop in made + derived_clips(c, got):
        speed = None
        if loop and len(times) > 1 and times[-1] > 0:
            # a loop plays in place: the hips' drift over a cycle (root motion: forward, sideways, up a ladder) comes
            # out, and is kept as a speed (x, y, z m/s) a game moves the character by
            drift = hips[-1] - hips[0]
            if np.linalg.norm(drift) > 0.02:
                hips = hips - np.outer(times / times[-1], drift)
                speed = [round(float(x), 3) for x in drift / times[-1]]
        ia = g.acc(times.astype(np.float32), 'SCALAR', minmax=True)
        chans, samps = [], []
        for n, q in rots.items():
            samps.append({'input': ia, 'output': g.acc(q.astype(np.float32), 'VEC4'), 'interpolation': 'LINEAR'})
            chans.append({'sampler': len(samps) - 1, 'target': {'node': by[n], 'path': 'rotation'}})
        samps.append({'input': ia, 'output': g.acc(hips.astype(np.float32), 'VEC3'), 'interpolation': 'LINEAR'})
        chans.append({'sampler': len(samps) - 1, 'target': {'node': by['Hips'], 'path': 'translation'}})
        anims.append({'name': name, 'channels': chans, 'samplers': samps})
        meta.append({'name': name, 'label': label, 'group': group, 'seconds': round(float(times[-1]), 2), 'loop': loop})
        if speed:
            meta[-1]['root_speed'] = speed
    g.j['nodes'], g.j['animations'] = nodes, anims
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(out, 'wb').write(g.bytes())
    return meta


# ---- hair and beards: a Meshy prop (hair on a pale mannequin dome) fitted onto a body's base head ----
HAIR_GAP = 0.003      # how far hair stands off the scalp, at least


def dome_split(h):
    """per triangle: True where it is the mannequin (pale, grey: low saturation, high value at its UV centre)"""
    img = np.asarray(h.image.resize((512, 512))).astype(float) / 255
    uv = h.uv[h.tri].mean(1)
    x = np.clip((uv[:, 0] % 1) * 511, 0, 511).astype(int)
    y = np.clip((uv[:, 1] % 1) * 511, 0, 511).astype(int)
    rgb = img[y, x]
    mx, mn = rgb.max(1), rgb.min(1)
    sat = (mx - mn) / np.maximum(mx, 1e-6)
    return (mx > 0.6) & (sat < 0.18)


def skull(P, tri, tslot, marks):
    """the base head's cranium above the brows: centre x, z, top y, width, depth"""
    hv = np.unique(tri[tslot == SLOTS.index('head')].reshape(-1))
    Q = P[hv]
    brow = marks['face_brow_L'][1]
    cr = Q[Q[:, 1] > brow]
    return np.array([np.median(cr[:, 0]), (cr[:, 2].max() + cr[:, 2].min()) / 2]), cr[:, 1].max(), \
        np.ptp(cr[:, 0]), np.ptp(cr[:, 2]), hv


def fit_hair(path, head, c, out, name):
    """hair from `path` fitted onto `head` (the base donor's fitted arrays) and written as a skinned GLB"""
    from scipy.spatial import cKDTree
    h = glbio.read_mesh(path)
    dome = dome_split(h)
    if dome.mean() < 0.05 or dome.mean() > 0.95:
        print('  %s: no mannequin found (%.0f%% pale), fitted by its own box' % (name, 100 * dome.mean()))
    dv = np.unique(h.tri[dome].reshape(-1)) if dome.any() else np.arange(len(h.pos))
    D = h.pos[dv]
    P, N, tri, tslot, JT, WT, marks = head
    ctr, top, width, depth, hv = skull(P, tri, tslot, marks)
    # the dome's top, width and depth onto the skull's: one scale (hair keeps its proportions), then move
    s = 0.5 * (width / np.ptp(D[:, 0]) + depth / np.ptp(D[:, 2]))
    Hp = h.pos * s
    D = D * s
    Hp += np.array([ctr[0] - (D[:, 0].max() + D[:, 0].min()) / 2, top - D[:, 1].max(),
                    ctr[1] - (D[:, 2].max() + D[:, 2].min()) / 2])
    keep = ~dome
    used = np.unique(h.tri[keep].reshape(-1))
    remap = -np.ones(len(Hp), np.int64)
    remap[used] = np.arange(len(used))
    Hp, Hn, Huv = Hp[used], h.nrm[used], h.uv[used]
    htri = remap[h.tri[keep]]
    # out of the scalp: where a hair vertex is under (or within HAIR_GAP of) the nearest head surface, lift it
    tree = cKDTree(P[hv])
    dist, k = tree.query(Hp)
    near = hv[k]
    off = ((Hp - P[near]) * N[near]).sum(1)
    lift = np.clip(HAIR_GAP - off, 0, None) * (dist < 0.03)
    Hp = Hp + N[near] * lift[:, None]
    # the head's weights: hair moves with the head, and with the face sliders where it reaches the face
    JTh, WTh = JT[near], WT[near]
    write_hair(out, name, c, Hp, Hn, Huv, JTh, WTh, htri, h, marks)
    return {'triangles': int(len(htri)), 'scale': round(float(s), 4), 'lifted': int((lift > 0).sum())}


def write_hair(out, name, c, P, N, UV, JT, WT, tri, src, marks):
    names, parents, jnodes, W = skeleton_nodes(c, marks)
    g = glbio.GlbWriter()
    nodes = [{'name': 'Character', 'children': [1 + parents.index(-1)]}] + [dict(n) for n in jnodes]
    for n in nodes[1:]:
        if 'children' in n:
            n['children'] = [ch + 1 for ch in n['children']]
    ibm = np.stack([np.linalg.inv(m) for m in W]).transpose(0, 2, 1).astype(np.float32).reshape(-1, 16)
    g.j['skins'] = [{'joints': list(range(1, 1 + len(names))), 'inverseBindMatrices': g.acc(ibm, 'MAT4'),
                     'skeleton': 1 + parents.index(-1)}]
    data = jpeg(src.image, 1024)
    g.j['images'] = [{'bufferView': g.view(data), 'mimeType': 'image/jpeg'}]
    g.j['samplers'] = [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]
    g.j['textures'] = [{'source': 0, 'sampler': 0}]
    g.j['materials'] = [{'name': name, 'doubleSided': True,
                         'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0.0,
                                                  'roughnessFactor': 0.7}}]
    WT = renormalise_weights(WT)
    attrs = {'POSITION': g.acc(P.astype(np.float32), 'VEC3', 34962, minmax=True),
             'NORMAL': g.acc(N.astype(np.float32), 'VEC3', 34962),
             'TEXCOORD_0': g.acc(UV.astype(np.float32), 'VEC2', 34962),
             'JOINTS_0': g.acc(JT.astype(np.uint8), 'VEC4', 34962),
             'WEIGHTS_0': g.acc(np.round(WT * 255).astype(np.uint8), 'VEC4', 34962, normalized=True)}
    dt = np.uint16 if len(P) < 65536 else np.uint32
    g.j['meshes'] = [{'name': name, 'primitives': [{'attributes': attrs, 'material': 0,
                                                    'indices': g.acc(tri.reshape(-1).astype(dt), 'SCALAR', 34963)}]}]
    nodes.append({'name': name, 'mesh': 0, 'skin': 0})
    nodes[0]['children'].append(len(nodes) - 1)
    g.j['nodes'] = nodes
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    open(out, 'wb').write(g.bytes())


# the bodies: each has its own canonical skeleton (rest = the donors' fitted pose), donors, pieces, seams and clips.
# Male is Styv's skeleton; female is the female base model's (Meshy's API rig)
BODIES = {'male': CANON, 'female': os.path.join(HERE, 'donors', 'base_f.glb')}


def make_body(body, canon_path, donors, hair_donors=()):
    data = os.path.join(HERE, 'data', body)
    pieces = os.path.join(HERE, 'pieces', body)
    os.makedirs(pieces, exist_ok=True)
    os.makedirs(data, exist_ok=True)
    c = load(canon_path)
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
    heads = {}
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
        heads[dn['id']] = (P, N, d.tri, tslot, JT2, WT2, marks)
        outfits.append({'id': dn['id'], 'name': dn['name'], 'glb': 'pieces/%s/%s.glb' % (body, dn['id']),
                        'head': dn.get('head', 'face'),
                        'face': {k: [round(x, 4) for x in v] for k, v in marks.items()},
                        'meshes': summary})
        print('%-6s %-8s %6d verts  neck %+.3f  %s' % (body, dn['id'], len(P), (target - ring)[1],
                                                     ' '.join('%s:%d' % kv for kv in summary.items())))
    hair = []
    base = [d['id'] for d in donors if d.get('head') == 'base']
    for hd in hair_donors:
        if not base or not os.path.exists(os.path.join(HERE, hd['glb'])):
            continue
        info = fit_hair(os.path.join(HERE, hd['glb']), heads[base[0]], c,
                        os.path.join(pieces, hd['id'] + '.glb'), hd['id'])
        hair.append({'id': hd['id'], 'name': hd['name'], 'kind': hd.get('kind', 'hair'),
                     'glb': 'pieces/%s/%s.glb' % (body, hd['id']), 'on': base[0]})
        print('%-6s %-14s %s' % (body, hd['id'], info))
    clips = write_anims(os.path.join(pieces, 'anims.glb'), c)
    names, parents, jnodes, W = skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in FACE})
    json.dump({'joints': [{'name': n['name'], 'parent': parents[i], 't': n['translation'], 'r': n['rotation']}
                          for i, n in enumerate(jnodes)],
               'clips': clips}, open(os.path.join(data, 'skeleton.json'), 'w'), indent=1)
    json.dump({'body': body, 'slots': SLOTS, 'bands': [[o, i] for (o, i) in BAND], 'face_joints': [f[0] for f in FACE],
               'outfits': outfits, 'hair': hair}, open(os.path.join(data, 'outfits.json'), 'w'), indent=1)
    return c, heads


def main():
    donors = json.load(open(os.path.join(HERE, 'data', 'donors.json')))
    only = sys.argv[1:]
    for body, canon in BODIES.items():
        if only and body not in only:
            continue
        mine = [d for d in donors if d.get('body', 'male') == body and d.get('kind', 'outfit') == 'outfit']
        hair = [d for d in donors if d.get('body', 'male') == body and d.get('kind') in ('hair', 'beard')]
        if not os.path.exists(canon) or not mine:
            print('%s: skipped (no canon or no donors)' % body)
            continue
        make_body(body, canon, mine, hair)


if __name__ == '__main__':
    main()
