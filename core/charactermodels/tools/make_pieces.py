#!/usr/bin/env python3
"""Make the equipment pieces: every donor fitted to one skeleton and cut into slots.

  python3 tools/make_pieces.py [male|female]    # every donor in data/donors.json, per body (BODIES) ->
                                                # pieces/<body>/<id>.glb, pieces/<body>/anims.glb,
                                                # data/<body>/skeleton.json, data/<body>/outfits.json

A donor is a rigged humanoid GLB (a Meshy export: the web app's mixamorig names or the API's Spine02/neck/head_end
names; NAME_MAP folds them together). For each donor:

1. FIT. The donor's bind pose is moved onto the canonical one (Styv's, donors/styv.glb; Girder's retired hero page brought him). Each bone gets an affine map:
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
CANON = os.path.join(ROOT, 'core', 'charactermodels', 'donors', 'styv.glb')

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
# data/clips.json dropped: clips no longer built (idle_2 was the Stretch again)
DROPPED = set(json.load(open(os.path.join(HERE, 'data', 'clips.json'), encoding='utf-8')).get('dropped', []))


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
            if key not in DROPPED:
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
            out.append((os.path.join(IDLES, f), clip, c['key'] + ('@src' if 'derive' in c else ''), c['label'], c['group'], c['loop']))
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


def _axis_rot(h, a):
    """the rotation by a radians about unit axis h"""
    x, y, z = h
    c, s, C = math.cos(a), math.sin(a), 1 - math.cos(a)
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s],
                     [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
                     [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])


ELBOW_MIN, ELBOW_REST, ELBOW_ADD, ELBOW_SPAN, ELBOW_WRAP = (math.radians(3), math.radians(12), math.radians(25), math.radians(80),
                                                         math.radians(-45))


def elbow_limit(c, clip):
    """no elbow bent backwards: retargeting from a rig whose arms rest at another angle can open an elbow past
    straight (the owner saw it in idles 7 and 12 and the backward walk, by 13 to 17 degrees). The elbow is a hinge
    fixed in the upper arm: its axis is across the upper arm and the figure's forward at rest (the A pose's elbow pit
    faces forward). An arm whose least bend about it in the clip is under ELBOW_MIN has its forearm turned forward
    about the hinge, by enough to bring that least bend to ELBOW_REST (a relaxed arm) but by no more than ELBOW_ADD,
    the turn fading out over ELBOW_SPAN of further bend: the clip's own motion of the elbow stays (a floor at the
    least bend held idle 12's arms rigid and straight), and a deep bend is barely touched. A frame still under
    ELBOW_MIN after it (a slash opened 26 degrees past straight) is turned up to ELBOW_MIN. The bend out of the hinge's plane (and the hand,
    which rides the forearm) is kept. A bend measured past ELBOW_WRAP backwards is left alone: it is a deep bend with
    the upper arm turned on its axis (an overhead wind-up folds the forearm behind the head), which a hinge fixed at
    rest misreads"""
    times, rots, hips = clip
    J = c.J
    for S in ('Left', 'Right'):
        up, fore, hand = J.get(S + 'Arm'), J.get(S + 'ForeArm'), J.get(S + 'Hand')
        if up is None or fore is None or hand is None or (S + 'ForeArm') not in rots:
            continue
        u0 = c.jpos[fore] - c.jpos[up]
        h = c.jrot[up].T @ np.cross(u0, [0.0, 0.0, 1.0])
        h /= np.linalg.norm(h)
        u = c.jrot[up].T @ u0                                   # the upper arm, in its own frame
        off = c.jrot[fore].T @ (c.jpos[hand] - c.jpos[fore])    # the forearm, in its own frame
        q = rots[S + 'ForeArm'].copy()
        th = []
        for f in range(len(q)):
            w = _qm(q[f]) @ off
            w = w - h * h.dot(w)
            th.append(math.atan2(np.cross(u, w).dot(h), u.dot(w)))
        ok = [t for t in th if t > ELBOW_WRAP]
        if not ok or min(ok) >= ELBOW_MIN:
            continue
        low = min(ok)
        add = min(ELBOW_REST - low, ELBOW_ADD)
        for f in range(len(q)):
            if th[f] <= ELBOW_WRAP:
                continue
            a = add * max(0.0, 1.0 - (th[f] - low) / ELBOW_SPAN)
            a = max(a, ELBOW_MIN - th[f])                       # past ELBOW_ADD backwards (a slash), still no less than ELBOW_MIN
            if a > 1e-6:
                m = glbio.mat_quat(_axis_rot(h, a) @ _qm(q[f]))
                q[f] = m if np.dot(m, q[f]) >= 0 else -np.array(m)
        rots = dict(rots)
        rots[S + 'ForeArm'] = q
    return times, rots, hips


def _head_ball(c):
    """the skull as a ball, from the base mesh at rest: centre and radius (hair adds 1.5 cm)"""
    h = c.jpos[c.J['Head']]
    P = c.pos[(np.linalg.norm(c.pos - h, axis=1) < 0.3) & (c.pos[:, 1] > h[1] + 0.06)]
    xr = (P[:, 0].max() - P[:, 0].min()) / 2
    band = P[(P[:, 1] > h[1] + 0.1) & (P[:, 1] < h[1] + 0.16)]
    ctr = np.array([(P[:, 0].max() + P[:, 0].min()) / 2, P[:, 1].max() - xr, (band[:, 2].max() + band[:, 2].min()) / 2])
    return ctr, xr + 0.015


def _front(c, j):
    """how far the body's front is ahead of joint j at rest (the skin near the middle at its height)"""
    p = c.jpos[c.J[j]]
    P = c.pos[(np.abs(c.pos[:, 1] - p[1]) < 0.02) & (np.abs(c.pos[:, 0] - p[0]) < 0.05)]
    return float(P[:, 2].max() - p[2])


def hands_clip(c, clip, spec):
    """a clip with a hand put where the clip only gestures at (data/clips.json derive 'hands': {'R'|'L': place}):
      head    the palm on the crown, a little behind its top on the hand's side, fingers back along the scalp and the
              forearm up over the head from before it, wherever the clip brings that hand within reach of it (and in
              proportion as it nears it): Meshy's 'Confused Scratch' scratched the air 10 cm over the crown, and
              then held the hand up like a claw at the side of the head, its wrist bent back
      belly   the palm flat on the belly, fingers across the body, the whole clip
      chest   the palm on the lower chest, the same
    Each arm is a two-bone solve (belly, chest: the elbow on the clip's side) with the palm on the body. 'Sleep' lay
    with both hands held up in the air"""
    times, rots, hips = clip
    J = c.J
    ctr, rad = _head_ball(c)
    hj = c.jpos[J['Head']]
    out = {nm: [] for nm in rots}
    grips = {S: c.jrot[J[S + 'Hand']].T @ grip_frame(c, S)[:3, :3] for S in ('Left', 'Right')}
    for f in range(len(times)):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        for side, place in sorted(spec.items()):
            S = 'Right' if side == 'R' else 'Left'
            sx = -1.0 if S == 'Right' else 1.0                  # the hand's side along x (the left is +x)
            up, fore, hand, tip = J[S + 'Arm'], J[S + 'ForeArm'], J[S + 'Hand'], J[S + 'HandMiddle3']
            Rw, P = rig.fk(loc)
            clipL = [loc[up], loc[fore], loc[hand]]
            pole = P[fore] - P[up]
            if place == 'head':
                M = Rw[J['Head']] @ c.jrot[J['Head']].T          # the head as the clip turned it from rest
                C = P[J['Head']] + M @ (ctr - hj)
                F0 = P[tip] - P[hand]
                L = np.linalg.norm(F0)
                d = np.linalg.norm(P[tip] - C)
                w = float(np.clip((0.52 - d) / 0.16, 0, 1))
                w = w * w * (3 - 2 * w)
                if w <= 0:
                    continue
                # the palm on the upper side of the head, behind the top of the ear, on the hand's side (on the crown
                # the shoulder and elbow came up high and the wrist bent back to reach it: the owner's review,
                # 2026-10-25); the fingers back along the scalp (tipped 15 degrees into it, so their ends reach it as it
                # curves away), the wrist forward of the palm, so the forearm comes up beside the head from before it,
                # the elbow forward, out and low
                n = M @ np.array([0.6 * sx, 0.6, -0.5])
                n /= np.linalg.norm(n)
                K = C + n * rad
                Zt = M @ np.array([0.0, -0.2, -1.0])
                Zt -= n * n.dot(Zt)
                Zt /= np.linalg.norm(Zt)
                Z = Zt * math.cos(math.radians(15)) - n * math.sin(math.radians(15))
                X = -n                                            # out of the palm: into the head
                lp = np.linalg.norm(P[J[S + 'HandMiddle1']] - P[hand])
                rig.reach(loc, up, fore, hand, K + n * 0.03 - Zt * (lp / 2), M @ np.array([0.75 * sx, -0.45, 0.5]))
                rig.hold(loc, hand, grips[S], np.cross(Z, X), Z)
            else:
                w = 1.0
                j = 'Spine' if place == 'belly' else 'Spine1'
                M = Rw[J[j]] @ c.jrot[J[j]].T
                X = M @ np.array([0.0, 0.0, -1.0])                # out of the palm: into the body
                Z = M @ np.array([-sx, -0.35, 0.0])               # the fingers across the body, a little down
                Z -= X * X.dot(Z)
                Z /= np.linalg.norm(Z)
                pt = P[J[j]] + M @ np.array([sx * 0.04, 0.0, _front(c, j) + 0.012])
                rig.reach(loc, up, fore, hand, pt - X * 0.03 - Z * 0.05, pole + M @ np.array([sx * 0.15, 0, 0]))
                rig.hold(loc, hand, grips[S], np.cross(Z, X), Z)
            if w < 1:
                for k, jj in enumerate((up, fore, hand)):
                    a, b = glbio.mat_quat(clipL[k]), glbio.mat_quat(loc[jj])
                    loc[jj] = _qm(_slerp(np.array(a), np.array(b), w))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def feet_clip(c, clip, floor):
    """a clip whose feet point down further than floor degrees (the foot joint to the ball, from level) turned up at the
    ankle to it, frame by frame (data/clips.json derive 'feet'): Meshy's 'Limp' held each swinging foot 40 to 60 degrees
    past flat for a third of its stride, the toes pointing at the ground (the owner's review, 2026-10-25); a walk's
    toe-off passes that for a frame"""
    times, rots, hips = clip
    J = c.J
    lim = math.radians(floor)
    out = {nm: [] for nm in rots}
    for f in range(len(times)):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        for S in ('Left', 'Right'):
            Rw, P = rig.fk(loc)
            d = P[J[S + 'ToeBase']] - P[J[S + 'Foot']]
            h = math.hypot(d[0], d[2])
            p = math.atan2(d[1], h)
            ax = np.cross(d, [0.0, 1.0, 0.0])
            if p >= lim or h < 1e-6 or np.linalg.norm(ax) < 1e-9:
                continue
            rig.turn(loc, J[S + 'Foot'], _axis_rot(ax / np.linalg.norm(ax), lim - p))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def toes_clip(c, clip, spec):
    """derive 'toes': {'max': degrees, 'smooth': frames}: each ToeBase kept within max degrees of its rest turn on the
    foot (the clip's turn eased back toward rest past it) and averaged over smooth frames either side. Meshy's kicks,
    leg sweep and over-the-shoulder throw flapped the toes up and down and bent them past what a toe bends (the owner's
    review, 2026-11-26)"""
    times, rots, hips = clip
    lim = math.radians(spec.get('max', 20))
    n = int(spec.get('smooth', 3))
    rots = dict(rots)
    for S in ('Left', 'Right'):
        nm = S + 'ToeBase'
        if nm not in rots:
            continue
        i = c.J[nm]
        rest = np.array(glbio.mat_quat(c.jrot[c.parents[i]].T @ c.jrot[i]), float)
        q = np.array(rots[nm], float)
        for f in range(len(q)):
            d = abs(float(np.dot(rest, q[f])))
            ang = 2 * math.acos(min(1.0, d))
            if ang > lim:
                q[f] = _slerp(rest, q[f], lim / ang)
        sm = q.copy()
        for f in range(len(q)):
            acc = np.zeros(4)
            for g in range(max(0, f - n), min(len(q), f + n + 1)):
                acc += q[g] if np.dot(q[g], q[f]) >= 0 else -q[g]
            sm[f] = acc / np.linalg.norm(acc)
        rots[nm] = sm
    return times, rots, hips


def hold_clip(c, clip, spec):
    """derive 'hold': {'at': seconds, 'cycle': seconds, 'breath': degrees}: the source's pose at 'at' held as a loop,
    breathing (the upper spine rocks by breath degrees once a cycle, the hips bob a centimetre). Meshy's 'Boxing
    Practice', the guard idle, was a flurry of punches (the owner's review, 2026-11-26): the fist guard is the pose a
    jab from guard starts in"""
    times, rots, hips = clip
    f0 = int(np.clip(round(spec.get('at', 0.0) * FPS), 0, len(times) - 1))
    cyc = spec.get('cycle', 2.6)
    amp = math.radians(spec.get('breath', 1.5))
    n = max(2, int(round(cyc * FPS)))
    t2 = np.arange(n + 1) / FPS
    base = {j: q[f0] for j, q in rots.items()}
    held = (np.array([0.0]), {j: np.array([q]) for j, q in base.items()}, np.array([hips[f0]]))
    out = {nm: [] for nm in rots}
    h2 = []
    for k in range(n + 1):
        s = math.sin(2 * math.pi * k / n)
        rig = _Rig(c, held, 0)
        loc = list(rig.loc0)
        rig.turn(loc, c.J['Spine1'], _Rx(-amp * s))
        rig.turn(loc, c.J['Spine2'], _Rx(amp * 0.5 * s))
        rig.quats(loc, out)
        h2.append(hips[f0] + np.array([0.0, 0.006 * s, 0.0]))
    return t2, {nm: np.array(v) for nm, v in out.items()}, np.array(h2)


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
    # the lift goes out to the side first and up beside the head, and the blow comes down in front of the shoulder
    # before it swings in to the anvil (the owner, 2026-11-26: lifted straight up from the anvil and brought back
    # across the face, the hammer went through the bowed head)
    keys = [(0.0, anvil + [0, 0.06, -0.01], ''), (0.24 * cycle, np.array([shR[0] + side * 0.18, hy + 0.26, 0.26]), 'out'),
            (0.48 * cycle, np.array([shR[0] + side * 0.22, shR[1] + 0.12, 0.10]), 'io'),
            (0.57 * cycle, np.array([shR[0] + side * 0.12, shR[1] - 0.12, 0.32]), 'in'), (0.64 * cycle, anvil, ''),
            (0.74 * cycle, anvil + [0, 0.08, -0.01], 'out'), (cycle, anvil + [0, 0.06, -0.01], 'io')]
    lean = [(0.0, np.array([0.22]), ''), (0.48 * cycle, np.array([0.12]), 'io'), (0.64 * cycle, np.array([0.32]), 'in'),
            (cycle, np.array([0.22]), 'io')]
    left = np.array([anvil[0] - side * 0.22, hy + 0.01, 0.3])
    # the hammer's pitch: its handle (the grip's +Y) forward and its face (+Z) down as it lands, swung up and back over
    # the shoulder at the top of the lift
    pitch = [(0.0, np.array([-0.35]), ''), (0.24 * cycle, np.array([-0.9]), 'out'), (0.48 * cycle, np.array([-2.1]), 'io'),
             (0.57 * cycle, np.array([-1.0]), 'in'), (0.64 * cycle, np.array([0.0]), ''), (0.74 * cycle, np.array([-0.4]), 'out'),
             (cycle, np.array([-0.35]), 'io')]
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
    grip, the left below it toward the end, where the figure's two-hand grip slides it on), lifted before and above the
    right shoulder with the head swung up and back, and brought down in front with the spine bending into the blow, the
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
    # the top of the lift: out beside the right shoulder, above it and well in front, the handle up and back (4 cm
    # before the shoulder the left hand reached behind the head for the handle, its arm round the neck; over the
    # shoulder the hands passed over the face and the handle through the man's head: the owner, 2026-11-26); the
    # swing comes down in front of the shoulder, the spine bending into it only as the blow lands
    hand = [(0.0, low, ''), (T(0.45), np.array([sh[0] + side * 0.16, sh[1] + 0.14, sh[2] + 0.46]), 'io'),
            (T(0.54), np.array([sh[0] + side * 0.02, sh[1] - 0.02, sh[2] + 0.54]), 'in'), (T(0.62), hit, ''),
            (T(0.74), hit + [0, 0.03, -0.03], 'out'), (cycle, low, 'io')]
    pitch = [(0.0, np.array([0.3]), ''), (T(0.45), np.array([-1.9]), 'io'), (T(0.54), np.array([-0.45]), 'in'),
             (T(0.62), np.array([0.75]), ''), (T(0.74), np.array([0.7]), 'out'), (cycle, np.array([0.3]), 'io')]
    lean = [(0.0, np.array([0.3]), ''), (T(0.45), np.array([0.05]), 'io'), (T(0.54), np.array([0.15]), 'in'),
            (T(0.62), np.array([0.5]), ''), (T(0.74), np.array([0.5]), ''), (cycle, np.array([0.3]), 'io')]
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


# ---- the owner's review of 2026-11-26: clips re-aimed, re-timed or re-armed from a captured one, and two made ----
def _spanw(spans, t, ease, dur):
    """a weight over spans of clip seconds: easing in over `ease` from a span's start and out over it after its end
    (a span from 0 or to the clip's end runs on there, no easing): the figure's faceWeight, at bake time"""
    w = 0.0
    for a, b in spans:
        sm = lambda x: x * x * (3 - 2 * x)
        win = 1.0 if a <= 0 else sm(float(np.clip((t - a) / max(ease, 1e-6), 0, 1)))
        wout = 1.0 if b >= dur - 1e-3 else 1 - sm(float(np.clip((t - b) / max(ease, 1e-6), 0, 1)))
        w = max(w, min(win, wout))
    return w


def _blend(loc, clip_loc, joints, w):
    """the joints' local rotations w of the way from the clip's (clip_loc) to the solved ones (loc)"""
    for jj in joints:
        a, b = np.array(glbio.mat_quat(clip_loc[jj])), np.array(glbio.mat_quat(loc[jj]))
        loc[jj] = _qm(_slerp(a, b, w))


def _grip_to(rig, loc, S, grip, T, Y, Z, pole):
    """hand S's grip frame (grip: its axes in the hand bone) to the point T with the prop's +Y along Y and +Z along Z:
    the hand is turned first, so the reach can aim the wrist where the grip then lands (the grip's origin sits in the
    closed hand, 6 to 9 cm from the wrist joint)"""
    c, J = rig.c, rig.c.J
    up, fore, hand = J[S + 'Arm'], J[S + 'ForeArm'], J[S + 'Hand']
    Y = Y / np.linalg.norm(Y)
    Z = Z - Y * Y.dot(Z)
    Z /= np.linalg.norm(Z)
    Hw = np.stack([np.cross(Y, Z), Y, Z], 1) @ grip.T            # the hand bone's world turn
    G = grip_frame(c, S)
    o = c.jrot[hand].T @ (G[:3, 3] - c.jpos[hand])                # the grip's origin in the hand bone
    for _ in range(2):                                            # the reach moves the wrist; settle it twice
        rig.reach(loc, up, fore, hand, T - Hw @ o, pole)
        rig.hold(loc, hand, grip, Y, Z)


def _grips(c):
    return {S: c.jrot[c.J[S + 'Hand']].T @ grip_frame(c, S)[:3, :3] for S in ('Left', 'Right')}


def _side(c):
    """+1 when the right arm lies at +x (the canonical skeleton: the left is +x, so -1)"""
    return 1.0 if c.jpos[c.J['RightArm']][0] > c.jpos[c.J['LeftArm']][0] else -1.0


def _curl(c, S, style='fist'):
    """the local rotation per finger joint that closes hand S (make_mpfb.hands: the same curls the figure puts on a
    held prop), as {joint index: 3x3}, for a made clip whose hand takes hold of something the figure does not hold
    (a door's handle)"""
    import make_mpfb
    h = make_mpfb.hands(c, {n: i for i, n in enumerate(c.joints)})['R' if S == 'Right' else 'L']
    return {e[0]: _qm(e[1:]) for e in h['curls'][style]}


def level_clip(c, clip, spec):
    """derive 'level': {'R'|'L': [degrees, keep], 'when': spans, 'ease': s}: in the spans the arm's swing is flattened
    toward a level plane: the hand's elevation from the shoulder (degrees above level) is brought to that plane's
    elevation plus keep of how far the clip had it off it, by turning the upper arm about the level axis across it (the
    elbow and the hand riding with it). Meshy's 'Slash left' rose from below the right hip to over the left shoulder
    (kept as 'Up swing'); flattened to 12 degrees below the shoulder, keeping a third, it cuts across at the chest"""
    times, rots, hips = clip
    J, dur = c.J, float(times[-1])
    out = {nm: [] for nm in rots}
    for f in range(len(times)):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        for side in ('R', 'L'):
            if side not in spec:
                continue
            S = 'Right' if side == 'R' else 'Left'
            w = _spanw(spec.get('when', [[0, dur]]), float(times[f]), spec.get('ease', 0.2), dur)
            if w <= 0:
                continue
            _, P = rig.fk(loc)
            d = P[J[S + 'Hand']] - P[J[S + 'Arm']]
            d /= np.linalg.norm(d)
            k = np.cross([0.0, 1.0, 0.0], d)
            n = np.linalg.norm(k)
            if n < 1e-6:
                continue
            e = math.asin(float(np.clip(d[1], -1, 1)))
            lv, keep = math.radians(spec[side][0]), spec[side][1]
            # turning about k by a lowers the hand by a: from e to the plane's elevation plus keep of e's offset from it
            a = (e - (lv + keep * (e - lv))) * w * min(1.0, n / 0.3)   # an arm straight up or down has no level axis
            rig.turn(loc, J[S + 'Arm'], _axis_rot(k / n, a))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def bend_clip(c, clip, spec):
    """derive 'bend': {joint: degrees forward}: the spine bent forward about the figure's side axis, joint by joint
    from the hips up, whole clip. Everything above turns with it, so a rifle stays at the cheek: Meshy's 'Walk while
    shooting' aims 13 degrees up (kept as the high aim); bent 26 degrees it aims at the ground a few paces ahead"""
    times, rots, hips = clip
    J = c.J
    out = {nm: [] for nm in rots}
    for f in range(len(times)):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        for nm in ('Spine', 'Spine1', 'Spine2', 'Neck', 'Head'):
            if nm in spec:
                rig.turn(loc, J[nm], _Rx(math.radians(spec[nm])))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def force_clip(c, clip, spec):
    """derive 'force': {'pace': [[from s, factor], ...], 'lean': {'deg', 'when', 'ease'}}: the clip re-timed, each
    stretch from its 'from' second (of the source) on played at its factor of the time (under 1: faster), the changes
    of pace eased over a tenth of a second; and the spine leant forward into the blow. Meshy's 'Spinning axe attack'
    read weak: its wind-up now holds a little longer, the spin and the blow come a third faster and it settles slower,
    and the body leans into the blow"""
    times, rots, hips = clip
    dur = float(times[-1])
    ds = 1.0 / 600
    s = np.arange(0, dur + ds / 2, ds)
    pace = sorted(spec.get('pace', [[0, 1.0]]))
    k = np.ones_like(s)
    for a, fac in pace:
        k[s >= a] = fac
    box = int(round(0.1 / ds))
    k = np.convolve(np.pad(k, box, mode='edge'), np.ones(2 * box + 1) / (2 * box + 1), mode='same')[box:-box]
    tau = np.concatenate([[0.0], np.cumsum(k[1:] * ds)])
    t2 = np.arange(0, tau[-1] + 1e-6, 1.0 / FPS)
    src = np.interp(t2, tau, s)                                  # the source second each new frame shows
    fi = np.clip(src * FPS, 0, len(times) - 1)
    lo = np.floor(fi).astype(int)
    hi = np.minimum(lo + 1, len(times) - 1)
    fr = fi - lo
    r2 = {j: np.array([_slerp(q[a], q[b], u) for a, b, u in zip(lo, hi, fr)]) for j, q in rots.items()}
    h2 = hips[lo] * (1 - fr)[:, None] + hips[hi] * fr[:, None]
    lean = spec.get('lean')
    if lean:
        clip2 = (t2, r2, h2)
        out = {nm: [] for nm in r2}
        for f in range(len(t2)):
            rig = _Rig(c, clip2, f)
            loc = list(rig.loc0)
            w = _spanw(lean['when'], float(src[f]), lean.get('ease', 0.15), dur)
            if w > 0:
                for nm, share in (('Spine', 0.5), ('Spine1', 0.5)):
                    rig.turn(loc, c.J[nm], _Rx(math.radians(lean['deg']) * share * w))
            rig.quats(loc, out)
        r2 = {nm: np.array(v) for nm, v in out.items()}
    return t2, r2, h2


def guard_clip(c, clip, spec):
    """derive 'guard': {'when': spans, 'ease': s, 'at': [x, y, z], 'blade': [x, y, z], 'edge': [x, y, z]}: in the spans,
    the right hand's grip goes to 'at' (metres from the head joint, in the figure's frame: x its left, y up, z
    forward) with the blade (the prop's +Y) along 'blade' and its edge (+Z) toward 'edge', so the sword lies across in
    front of the face seen from the front; the left hand keeps its place by the right one (moved as far as the right
    hand moved), so a hand the clip had on the blade stays on it. Meshy's 'Block' and 'Block 2' held the blade
    pointing back past the right side of the head, end on from the front"""
    times, rots, hips = clip
    J, dur = c.J, float(times[-1])
    grips = _grips(c)
    sd = _side(c)
    out = {nm: [] for nm in rots}
    at, Y, Z = np.array(spec['at'], float), np.array(spec['blade'], float), np.array(spec.get('edge', [0, 0, 1]), float)
    arm = lambda S: [J[S + 'Arm'], J[S + 'ForeArm'], J[S + 'Hand']]
    for f in range(len(times)):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        w = _spanw(spec['when'], float(times[f]), spec.get('ease', 0.25), dur)
        if w > 0:
            clipL = list(loc)
            Rw, P = rig.fk(loc)
            Rh0 = P[J['RightHand']]
            Lh0 = P[J['LeftHand']]
            T = P[J['Head']] + at
            pole = np.array([sd * 0.8, -0.6, -0.1])
            # the blade turns from the clip's (pointing back past the head) to across the face over the top: first
            # upright at the guard's place, then down across. Blended straight, it swept through the head on the
            # women, and the blade-clear pass then held the wrist turned away for its 0.3 s
            _grip_to(rig, loc, 'Right', grips['Right'], T, np.array([0.15 * -sd, 1.0, 0.1]), Z, pole)
            upL = list(loc)
            if w > 0.5:
                _grip_to(rig, loc, 'Right', grips['Right'], T, Y, Z, pole)
                _blend(loc, upL, arm('Right'), 2 * w - 1)
            else:
                _blend(loc, clipL, arm('Right'), 2 * w)
            Rw2, P2 = rig.fk(loc)
            Lw = Rw[J['LeftHand']]
            rig.reach(loc, J['LeftArm'], J['LeftForeArm'], J['LeftHand'], Lh0 + (P2[J['RightHand']] - Rh0),
                      np.array([-sd * 0.8, -0.6, -0.1]))
            Rw3, _ = rig.fk(loc)
            loc[J['LeftHand']] = Rw3[J['LeftForeArm']].T @ Lw              # the left hand keeps its turn
            _blend(loc, clipL, arm('Left'), w)
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def door_clip(c, clip, spec):
    """derive 'door': {'handle': [x, y, z], 'hinge': x, 'open': degrees, 'turn': degrees, 'lean': degrees, 'look': share,
    'keys': {...}}: a door pulled
    open by its lever handle, on a clip's legs and body (Meshy's 'Open door' held the right hand still in front for three
    seconds, which read as nothing). The right hand reaches the handle (x, y from the ground, z forward), closes on it,
    turns the lever down by 'turn', and pulls: the handle travels round the hinge ('hinge' metres to the left of it) as
    the door swings 'open' degrees toward the figure, the lever let back up as it goes and the body leaning back; then
    the hand lets go and the arm goes back to the clip's end. keys: the seconds of reach, grip, turn, pull, hold, let"""
    times, rots, hips = clip
    J, dur = c.J, float(times[-1])
    grips = _grips(c)
    sd = _side(c)
    K = spec['keys']
    H0 = np.array(spec['handle'], float)
    r = float(spec.get('hinge', 0.72))
    hinge = H0 + np.array([r, 0, 0])
    curl = _curl(c, 'Right')
    arm = [J['RightArm'], J['RightForeArm'], J['RightHand']]
    end = min(len(times) - 1, int(round(K['end'] * FPS)))       # the clip's arm at rest by the side, after its own reach
    sm = lambda x: x * x * (3 - 2 * x)
    # the finger joints get tracks of their own: Meshy's clips have none, so a curl set on them would not be written
    out = {nm: [] for nm in list(rots) + [c.joints[i] for i in sorted(curl) if c.joints[i] not in rots]}
    for f in range(len(times)):
        t = float(times[f])
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        # the arm the clip would have: its own until the reach, after the letting go its rest at the end
        ref = list(_Rig(c, clip, end).loc0) if t >= K['let'][0] else list(loc)
        for jj in arm:
            loc[jj] = ref[jj]
        clipL = list(loc)
        w = min(sm(np.clip((t - K['reach'][0]) / (K['reach'][1] - K['reach'][0]), 0, 1)),
                1 - sm(np.clip((t - K['let'][0]) / (K['let'][1] - K['let'][0]), 0, 1)))
        th = math.radians(spec['open']) * sm(np.clip((t - K['pull'][0]) / (K['pull'][1] - K['pull'][0]), 0, 1))
        ph = math.radians(spec['turn']) * min(sm(np.clip((t - K['turn'][0]) / (K['turn'][1] - K['turn'][0]), 0, 1)),
                                              1 - sm(np.clip((t - K['pull'][0] - 0.3) / 0.6, 0, 1)))
        lean = math.radians(spec.get('lean', 6)) * sm(np.clip((t - K['pull'][0]) / (K['pull'][1] - K['pull'][0]), 0, 1)) * w
        if lean:
            rig.turn(loc, J['Spine'], _Rx(-lean * 0.6))
            rig.turn(loc, J['Spine1'], _Rx(-lean * 0.4))
        if w > 0:
            Dr = _Ry(-th)                                           # the door's swing about the hinge's upright
            T = hinge + Dr @ (H0 - hinge)
            # the lever pointing toward the hinge (+x), turned down about the door's face normal by ph; the hand over it,
            # palm down, the fingers forward round it
            Yl = Dr @ np.array([math.cos(ph), -math.sin(ph), 0.0])
            Zl = Dr @ np.array([0.0, -0.25, 1.0])
            # a lever's turn swings the hand down about its pivot, 7 cm to the right of the grip
            T = T + Dr @ np.array([0.07 * (math.cos(ph) - 1), -0.07 * math.sin(ph), 0.0])
            _grip_to(rig, loc, 'Right', grips['Right'], T, Yl, Zl, np.array([sd * 0.9, -0.5, -0.2]))
            _blend(loc, clipL, arm, w)
            # the head turned most of the way toward the handle while the hand is on it
            Rw, P = rig.fk(loc)
            fwd = (Rw[J['Head']] @ c.jrot[J['Head']].T) @ np.array([0.0, 0.0, 1.0])
            want = T - P[J['Head']]
            want /= np.linalg.norm(want)
            ax = np.cross(fwd, want)
            if np.linalg.norm(ax) > 1e-6:
                a = math.acos(float(np.clip(fwd.dot(want), -1, 1))) * spec.get('look', 0.6) * w
                rig.turn(loc, J['Neck'], _axis_rot(ax / np.linalg.norm(ax), a * 0.4))
                rig.turn(loc, J['Head'], _axis_rot(ax / np.linalg.norm(ax), a * 0.6))
            g = min(w, sm(np.clip((t - K['grip'][0]) / (K['grip'][1] - K['grip'][0]), 0, 1)),
                    1 - sm(np.clip((t - K['let'][0]) / 0.25, 0, 1)))
            if g > 0:
                rest = lambda i: c.jrot[c.parents[i]].T @ c.jrot[i]
                for i, R in curl.items():
                    a, b = np.array(glbio.mat_quat(loc[i])), np.array(glbio.mat_quat(rest(i) @ R))
                    loc[i] = _qm(_slerp(a, b, g))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def bench_clip(c, idle, cycle=3.6):
    """crafting at a bench, standing: the idle's first frame bent over a bench just below the hips (a workbench's
    height on every body), the left hand flat on the work holding it, the right hand working a tool on it: three light
    taps, a pause turning the work over (the tool lifted aside, the left hand shifting it), two more taps; the head
    down at the work. Quaternius's 'Interact' only reached out and pressed (kept as 'Push button')"""
    rig = _Rig(c, idle)
    J = c.J
    grips = _grips(c)
    sd = _side(c)
    _, P0 = rig.fk(list(rig.loc0))
    hy = float(rig.hips[1])
    sh = P0[J['RightArm']]
    bench = hy - 0.02
    work = np.array([sh[0] * 0.25, bench + 0.03, 0.40])
    # the tool's head lands on the work: the handle forward and a little in, its face (+Z) down; lifted ten to fifteen
    # centimetres between taps
    T = lambda f: f * cycle
    taps = [T(0.0), T(0.12), T(0.24), T(0.62), T(0.74)]
    lift = []
    for t0 in taps:
        lift += [(t0, 0.0), (t0 + T(0.05), 0.13), (t0 + T(0.1), 0.0)]
    times = np.arange(0, cycle + 1e-6, 1.0 / FPS)
    out = {nm: [] for nm in rig.names}
    for t in times:
        loc = list(rig.loc0)
        # lean over the bench, a slow sway so it does not stand frozen
        sway = 0.03 * math.sin(2 * math.pi * t / cycle)
        rig.turn(loc, J['Spine'], _Rx(0.10) @ _Ry(sway))
        rig.turn(loc, J['Spine1'], _Rx(0.08))
        # between the taps the work is turned over: the tool hand lifts aside, the left hand slides the work
        turn = math.sin(math.pi * np.clip((t - T(0.34)) / T(0.24), 0, 1)) ** 2
        rig.turn(loc, J['Head'], _Rx(0.42 - 0.08 * turn) @ _Ry(sd * 0.12 * turn))
        h = float(np.interp(t, [x for x, _ in lift], [y for _, y in lift]))
        a = -0.35 * h / 0.13 - 0.9 * turn                           # the tool's pitch: up with the lift
        Yt = np.array([-sd * 0.2, -math.sin(a) - 0.25 * math.cos(a), math.cos(a)])
        Zt = np.array([0.0, -math.cos(a), -math.sin(a)])
        Yn = Yt / np.linalg.norm(Yt)
        tip = work + np.array([-sd * 0.12 * turn, h + 0.10 * turn, -0.06 * turn])
        _grip_to(rig, loc, 'Right', grips['Right'], tip - Yn * 0.30, Yt, Zt, np.array([sd * 0.7, -1.0, -0.3]))
        # the left hand flat on the work beside the tool, the fingers forward and in; it slides the work a little
        Lp = work + np.array([-sd * (0.16 + 0.04 * turn), -0.005, -0.03 + 0.05 * turn])
        Zl = np.array([sd * 0.3, -0.15, 1.0])                       # the fingers forward and in, a little down
        Xl = np.array([0.0, -1.0, 0.0])                             # out of the palm: down onto the work
        _grip_to(rig, loc, 'Left', grips['Left'], Lp, np.cross(Zl, Xl), Zl, np.array([-sd * 0.7, -1.0, -0.3]))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, np.repeat(idle[2][:1], len(times), 0)


def place_clip(c, clip, spec):
    """derive 'place': {'L'|'R': {'at': [x, y, z], 'when': spans, 'ease': s}}: in the spans a hand goes to 'at' (metres
    from the hips, in the figure's frame), keeping its turn: Meshy's 'Pick into basket' held the basket hand out at the
    side while the other dropped the fruit 40 cm away; the basket hand now holds it under where the fruit drops"""
    times, rots, hips = clip
    J, dur = c.J, float(times[-1])
    sd = _side(c)
    out = {nm: [] for nm in rots}
    for f in range(len(times)):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        for side in ('R', 'L'):
            if side not in spec:
                continue
            S = 'Right' if side == 'R' else 'Left'
            p = spec[side]
            w = _spanw(p['when'], float(times[f]), p.get('ease', 0.4), dur)
            if w <= 0:
                continue
            clipL = list(loc)
            Rw, P = rig.fk(loc)
            hw = Rw[J[S + 'Hand']]
            sx = sd if side == 'R' else -sd
            rig.reach(loc, J[S + 'Arm'], J[S + 'ForeArm'], J[S + 'Hand'], P[J['Hips']] + np.array(p['at'], float),
                      np.array([sx * 0.8, -0.8, -0.2]))
            Rw2, _ = rig.fk(loc)
            loc[J[S + 'Hand']] = Rw2[J[S + 'ForeArm']].T @ hw
            _blend(loc, clipL, [J[S + 'Arm'], J[S + 'ForeArm'], J[S + 'Hand']], w)
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


def handles_clip(c, clip, spec):
    """derive 'handles': {'height': m, 'ahead': m, 'width': m, 'smooth': s}: both hands on a cart's crossbar the whole
    clip, at a fixed height off the ground, 'ahead' of the hips as they go forward on average (a moving average over
    'smooth' seconds, so the bar does not bob with each step), palms down, the right hand at its right end. The cart
    prop (tools/make_props.py cart) hangs from the right hand's grip; the figure's two-hand grip keeps the left on the
    bar on every body. Meshy's 'Push cart' took hold of an unseen bar and let go of it"""
    times, rots, hips = clip
    J = c.J
    grips = _grips(c)
    sd = _side(c)
    n = len(times)
    k = max(1, int(round(spec.get('smooth', 1.0) * FPS / 2)))
    z = np.array([hips[max(0, min(n - 1, i)), 2] for i in range(-k, n + k)])
    zs = np.convolve(z, np.ones(2 * k + 1) / (2 * k + 1), mode='valid')   # the hips' forward going, averaged
    Yb = np.array([-sd, 0.0, 0.0])                                    # the bar, along the figure's left
    Zb = np.array([0.0, -0.25, 1.0])                                  # the fingers forward over it
    up, fore, hand = J['RightArm'], J['RightForeArm'], J['RightHand']
    arm = np.linalg.norm(c.jpos[fore] - c.jpos[up]) + np.linalg.norm(c.jpos[hand] - c.jpos[fore]) + 0.08
    out = {nm: [] for nm in rots}
    for f in range(n):
        rig = _Rig(c, clip, f)
        loc = list(rig.loc0)
        mid = np.array([0.0, spec['height'], zs[f] + spec['ahead']])
        R = mid + Yb * (-spec['width'] / 2)
        L = mid + Yb * (spec['width'] / 2)
        # where the clip stands up out of reach of the bar (it let go and stepped back), the back bends forward until
        # the bar is within reach with some to spare, so a taller body (longer legs than arms) still holds it
        for _ in range(16):
            _, P = rig.fk(loc)
            if np.linalg.norm(R - P[up]) <= spec.get('reach', 0.85) * arm:
                break
            rig.turn(loc, J['Spine'], _Rx(math.radians(1.2)))
            rig.turn(loc, J['Spine1'], _Rx(math.radians(1.2)))
        _grip_to(rig, loc, 'Right', grips['Right'], R, Yb, Zb, np.array([sd * 0.6, -1.0, -0.2]))
        _grip_to(rig, loc, 'Left', grips['Left'], L, Yb, Zb, np.array([-sd * 0.6, -1.0, -0.2]))
        rig.quats(loc, out)
    return times, {nm: np.array(v) for nm, v in out.items()}, hips


# the derive kinds above: a clip made from '<key>@src' stands where its source stood, one made from another clip
# right after it
PLACED = ('level', 'bend', 'force', 'guard', 'door', 'place', 'handles')


def derived_clips(c, got):
    """data/clips.json entries with 'derive': {'loop_of': key, 'back': s} (a one-shot looped), {'hammer': true}, {'dig': true},
    {'thrust': 'one' | 'spear', 'from': the stance clip}, {'carry': 'spear', 'from': a clip, '<key>@src' for an
    entry's own Meshy action} or {'hands': {'R'|'L': 'head' | 'belly' | 'chest'}, 'from': the clip itself (an idle's
    key) or '<key>@src'}: a 'hands' clip takes its source's place in the list rather than coming last"""
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
        elif spec.get('hands') and spec.get('from') in got:
            clip = hands_clip(c, got[spec['from']], spec['hands'])
        elif spec.get('bench') and 'idle' in got:
            clip = bench_clip(c, got['idle'], spec.get('cycle', 3.6))
        elif any(k in spec for k in PLACED) and spec.get('from') in got:
            kind = next(k for k in PLACED if k in spec)
            make = {'level': level_clip, 'bend': bend_clip, 'force': force_clip, 'guard': guard_clip, 'door': door_clip,
                    'place': place_clip, 'handles': handles_clip}[kind]
            clip = make(c, got[spec['from']], spec[kind])
        elif spec.get('feet') is not None and spec.get('from') in got:
            clip = feet_clip(c, got[spec['from']], spec['feet'])
        elif spec.get('toes') is not None and spec.get('from') in got:
            clip = toes_clip(c, got[spec['from']], spec['toes'])
        elif spec.get('hold') is not None and spec.get('from') in got:
            clip = hold_clip(c, got[spec['from']], spec['hold'])
        elif spec.get('trade') and spec.get('from', 'idle') in got:
            import trade_clips                                    # tools/trade_clips.py: the trades' work (stage 5)
            clip = trade_clips.make(c, spec['trade'], got[spec.get('from', 'idle')])
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
    seq = []
    for src, clip, name, label, group, loop in [x + (True,) for x in CLIPS + idle_clips()] + action_clips():
        got[name] = elbow_limit(c, retarget(src, clip, c))
        seq.append(name)
        if '@' not in name:
            made.append(got[name] + (name, label, group, loop))
    # a clip whose hands, feet or toes are put right (derive 'hands', 'feet', 'toes') stands where its source stood
    entries = json.load(open(os.path.join(HERE, 'data', 'clips.json')))['clips']
    spots = {d['key']: d['derive']['from'] for d in entries
             if (d.get('derive') or {}).get('hands') or (d.get('derive') or {}).get('feet') is not None
             or (d.get('derive') or {}).get('toes') is not None or (any(k in (d.get('derive') or {}) for k in PLACED)
                                                       and d['derive'].get('from', '').endswith('@src'))}
    # a clip made from another clip (not its own '@src'): right after it
    after = {d['key']: d['derive']['from'] for d in entries
             if any(k in (d.get('derive') or {}) for k in PLACED) and not d['derive'].get('from', '').endswith('@src')}
    # each clip's place: a retargeted one its own in seq; one standing for its source the source's (replacing it when
    # the source is a clip of its own); one made from another clip just after it; the rest after all of them, in turn.
    # A stable sort by those places (inserting each in turn put two '@src' neighbours, Block and Block 2, the wrong
    # way round)
    place = {m[3]: float(seq.index(m[3])) for m in made}
    late = len(seq)
    for d in derived_clips(c, got):
        if d[3] in after and after[d[3]] in place:
            place[d[3]] = place[after[d[3]]] + 0.5
            made.append(d)
        elif d[3] in spots and spots[d[3]] in seq:
            src = spots[d[3]]
            at = [i for i, m in enumerate(made) if m[3] == src]
            if at:
                made[at[0]] = d
            else:
                made.append(d)
            place[d[3]] = float(seq.index(src))
        else:
            place[d[3]] = late
            late += 1
            made.append(d)
    made.sort(key=lambda m: place[m[3]])
    for times, rots, hips, name, label, group, loop in made:
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
