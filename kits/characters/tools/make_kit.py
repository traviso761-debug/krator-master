#!/usr/bin/env python3
"""The Kenshi-style kit: a base body that is always there, swappable heads, hair and beards, and armour in layers.

  python3 tools/make_kit.py [male|female]      # -> pieces/<body>/*.glb, data/<body>/kit.json, data/<body>/skeleton.json

Per body (BODIES), with that body's base model (a donor with "head": "base") as the canonical skeleton:

  base      the base model's own surface, cut by bone weight into regions (torso, hands, legs, feet; its head goes to
            the heads). Always drawn. Each armour piece names the base triangles it covers (`hide`), and the page leaves
            those out, so skin never shows through armour.
  heads     every donor's head slot (base, outfits, Styv), fitted onto the base skeleton, moved front-to-back onto the
            base's neck ring and conformed to it (make_pieces.SEAMS 'neck'), with its ten face joints. `bald` heads
            take hair and beards.
  armour    each outfit donor's torso (with its gloves, if any), legs and feet, with the donor's skin taken out (texels
            near its face's skin colour) and pushed out over the base body: feet LAYER[feet] above the skin, legs
            above that, torso above that, so a torso rides over trousers and trousers over boots.
  hair      each hair donor (a Meshy prop) fitted onto each bald head of its body: its hair colour is the dominant colour
            of its crown, and only triangles near that colour are kept (Meshy gives hair on a mannequin, or with a
            face, or with a shirt); beards are the hair-coloured triangles below the eyes of a bust.
  clips     every clip retargeted onto the base skeleton (make_pieces.write_anims).
"""
import base64, json, os, sys
import numpy as np
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import glbio
import make_pieces as mp

HERE = mp.HERE
BODIES = ['male', 'female']
ARMOUR = {'torso': ('torso', 'hands'), 'legs': ('legs',), 'feet': ('feet',)}      # armour slot: the cut slots it takes
LAYER = {'feet': 0.004, 'legs': 0.007, 'torso': 0.010}     # metres above the base skin, so outer layers win
WHOLE = 0.6           # an armour piece covering more of a base region than this hides all of it (gloves, boots)
SKIN_DE = 0.16        # colour distance (RGB, 0-1) under which a donor texel counts as its skin
HAIR_DE = 0.22        # colour distance from the crown's hair colour under which a triangle counts as hair
REGIONS = ['torso', 'hands', 'legs', 'feet']
SKIN_BONES = ('Arm', 'Hand', 'Neck', 'Leg', 'Foot', 'Toe')     # where a donor's bare skin may be taken out


# ---------------------------------------------------------------- colour per triangle

def tri_colours(img, uv, tri, px=512):
    a = np.asarray(img.convert('RGB').resize((px, px))).astype(float) / 255
    c = uv[tri].mean(1)
    x = np.clip((c[:, 0] % 1) * (px - 1), 0, px - 1).astype(int)
    y = np.clip((c[:, 1] % 1) * (px - 1), 0, px - 1).astype(int)
    return a[y, x]


def donor_image(d):
    t = d.material.get('pbrMetallicRoughness', {}).get('baseColorTexture')
    return glbio.image(d, t['index']).convert('RGB') if t else None


def skin_colour(cols, P, tri, marks):
    """the donor's skin: median colour of the triangles round its nose and cheeks"""
    ctr = P[tri].mean(1)
    near = np.zeros(len(tri), bool)
    for k in ('face_nose', 'face_cheek_L', 'face_cheek_R'):
        near |= np.linalg.norm(ctr - np.array(marks[k]), axis=1) < 0.025
    return np.median(cols[near], 0) if near.sum() >= 3 else None


def areas(P, tri):
    return 0.5 * np.linalg.norm(np.cross(P[tri[:, 1]] - P[tri[:, 0]], P[tri[:, 2]] - P[tri[:, 0]]), axis=1)


# ---------------------------------------------------------------- writing

class Writer:
    """one GLB: the skeleton (face joints at `marks`), one skin, materials, and named meshes"""

    def __init__(self, c, marks):
        self.c = c
        names, parents, jnodes, W = mp.skeleton_nodes(c, marks)
        self.g = g = glbio.GlbWriter()
        self.nodes = [{'name': 'Character', 'children': [1 + parents.index(-1)]}] + [dict(n) for n in jnodes]
        for n in self.nodes[1:]:
            if 'children' in n:
                n['children'] = [ch + 1 for ch in n['children']]
        ibm = np.stack([np.linalg.inv(m) for m in W]).transpose(0, 2, 1).astype(np.float32).reshape(-1, 16)
        g.j['skins'] = [{'joints': list(range(1, 1 + len(names))), 'inverseBindMatrices': g.acc(ibm, 'MAT4'),
                         'skeleton': 1 + parents.index(-1)}]
        g.j['images'], g.j['textures'], g.j['materials'], g.j['meshes'] = [], [], [], []
        g.j['samplers'] = [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]

    def tex(self, img, px):
        g = self.g
        g.j['images'].append({'bufferView': g.view(mp.jpeg(img, px)), 'mimeType': 'image/jpeg'})
        g.j['textures'].append({'source': len(g.j['images']) - 1, 'sampler': 0})
        return {'index': len(g.j['textures']) - 1}

    def material(self, name, rig=None, image=None, double=False):
        m = {'name': name, 'pbrMetallicRoughness': {'metallicFactor': 0.0, 'roughnessFactor': 0.75}}
        if rig is not None:
            mat, pbr = rig.material, rig.material.get('pbrMetallicRoughness', {})
            m['pbrMetallicRoughness'] = {'metallicFactor': pbr.get('metallicFactor', 1.0),
                                         'roughnessFactor': pbr.get('roughnessFactor', 1.0)}
            if 'baseColorTexture' in pbr:
                m['pbrMetallicRoughness']['baseColorTexture'] = self.tex(glbio.image(rig, pbr['baseColorTexture']['index']), 1024)
            if 'metallicRoughnessTexture' in pbr:
                m['pbrMetallicRoughness']['metallicRoughnessTexture'] = self.tex(glbio.image(rig, pbr['metallicRoughnessTexture']['index']), 512)
            if 'normalTexture' in mat:
                m['normalTexture'] = self.tex(glbio.image(rig, mat['normalTexture']['index']), 512)
        elif image is not None:
            m['pbrMetallicRoughness']['baseColorTexture'] = self.tex(image, 1024)
        if double:
            m['doubleSided'] = True
        self.g.j['materials'].append(m)
        return len(self.g.j['materials']) - 1

    def mesh(self, name, P, N, UV, JT, WT, tri, mat):
        """tri indexes P; only the vertices it uses are written"""
        if not len(tri):
            return 0
        g = self.g
        used = np.unique(tri.reshape(-1))
        remap = -np.ones(len(P), np.int64)
        remap[used] = np.arange(len(used))
        WT = mp.renormalise_weights(WT[used])
        attrs = {'POSITION': g.acc(P[used].astype(np.float32), 'VEC3', 34962, minmax=True),
                 'NORMAL': g.acc(N[used].astype(np.float32), 'VEC3', 34962),
                 'TEXCOORD_0': g.acc(UV[used].astype(np.float32), 'VEC2', 34962),
                 'JOINTS_0': g.acc(JT[used].astype(np.uint8), 'VEC4', 34962),
                 'WEIGHTS_0': g.acc(np.round(WT * 255).astype(np.uint8), 'VEC4', 34962, normalized=True)}
        dt = np.uint16 if len(used) < 65536 else np.uint32
        g.j['meshes'].append({'name': name, 'primitives': [{'attributes': attrs, 'material': mat,
                              'indices': g.acc(remap[tri].reshape(-1).astype(dt), 'SCALAR', 34963)}]})
        self.nodes.append({'name': name, 'mesh': len(g.j['meshes']) - 1, 'skin': 0})
        self.nodes[0]['children'].append(len(self.nodes) - 1)
        return int(len(tri))

    def save(self, out):
        self.g.j['nodes'] = self.nodes
        self.g.j['scenes'], self.g.j['scene'] = [{'nodes': [0]}], 0
        open(out, 'wb').write(self.g.bytes())


def bits(n, idx):
    """a set of triangle indices as a base64 bitset (the page's KCHAR.unbits)"""
    b = np.zeros((n + 7) // 8 * 8, np.uint8)
    b[np.asarray(idx, int)] = 1
    return base64.b64encode(np.packbits(b, bitorder='little').tobytes()).decode()


# ---------------------------------------------------------------- the pieces

def fitted(d, c, jnames):
    P, N, JT = mp.fit(d, c)
    dense = np.zeros((len(P), len(jnames)))
    for t in range(4):
        np.add.at(dense, (np.arange(len(P)), JT[:, t]), d.wt[:, t])
    return P, N, dense


def push_out(P, N, base_P, base_N, gap, reach=0.06):
    """vertices under (or within `gap` of) the base skin move out to `gap` above it, along the skin's normal. Only
    for shallow cases (hair on a scalp): from deep inside a body the nearest skin vertex can be on the far side"""
    tree = cKDTree(base_P)
    dist, k = tree.query(P)
    off = ((P - base_P[k]) * base_N[k]).sum(1)
    lift = np.clip(gap - off, 0, None) * (dist < reach)
    return P + base_N[k] * lift[:, None], int((lift > 0).sum())


def ray_hits(O, D, A_P, A_tri, reach, step=0.03):
    """for rays O + t D (t in 0..reach), the first triangle of A each meets: (t, triangle index), t = inf if none.
    Candidates are the triangles near points along the ray (Moller-Trumbore on every pair at once)"""
    a, b, c = A_P[A_tri[:, 0]], A_P[A_tri[:, 1]], A_P[A_tri[:, 2]]
    ctr = (a + b + c) / 3
    rad = np.percentile(np.maximum(np.linalg.norm(a - ctr, axis=1), np.linalg.norm(c - ctr, axis=1)), 98)
    tree = cKDTree(ctr)
    pairs = set()
    for t in np.arange(0, reach + step, step):
        for vi, lst in enumerate(tree.query_ball_point(O + D * t, r=step + rad)):
            pairs.update((vi, x) for x in lst)
    best_t = np.full(len(O), np.inf)
    best_k = np.full(len(O), -1)
    if not pairs:
        return best_t, best_k
    pr = np.array(sorted(pairs))
    vi, ti = pr[:, 0], pr[:, 1]
    e1, e2 = b[ti] - a[ti], c[ti] - a[ti]
    pv = np.cross(D[vi], e2)
    det = (e1 * pv).sum(1)
    ok = np.abs(det) > 1e-12
    inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
    tv = O[vi] - a[ti]
    u = (tv * pv).sum(1) * inv
    qv = np.cross(tv, e1)
    v = (D[vi] * qv).sum(1) * inv
    t = (e2 * qv).sum(1) * inv
    good = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 1e-5) & (t < reach)
    for k in np.nonzero(good)[0]:
        if t[k] < best_t[vi[k]]:
            best_t[vi[k]], best_k[vi[k]] = t[k], ti[k]
    return best_t, best_k


class Skin:
    """the base body as a surface to stay outside of"""

    def __init__(self, c, P, tri):
        self.P, self.tri = P, tri
        fn = np.cross(P[tri[:, 1]] - P[tri[:, 0]], P[tri[:, 2]] - P[tri[:, 0]])
        self.fn = fn / np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-12)
        # bone segments, for an outward direction at any point: away from the nearest bone
        seg = []
        for n, ch in mp.CHILD.items():
            if n in c.J and ch in c.J:
                seg.append((c.jpos[c.J[n]], c.jpos[c.J[ch]]))
        self.sa = np.array([x[0] for x in seg])
        self.sb = np.array([x[1] for x in seg])

    def outward(self, P):
        ab = self.sb - self.sa
        t = np.clip(((P[:, None, :] - self.sa[None]) * ab[None]).sum(2) / (ab * ab).sum(1)[None], 0, 1)
        q = self.sa[None] + t[..., None] * ab[None]
        d = np.linalg.norm(P[:, None, :] - q, axis=2)
        k = d.argmin(1)
        out = P - q[np.arange(len(P)), k]
        return out / np.maximum(np.linalg.norm(out, axis=1, keepdims=True), 1e-9)

    def push(self, P, gap, reach=0.15, passes=2):
        """a vertex is inside the skin when the first skin triangle a ray outward from it meets faces outward (the
        ray is leaving the body); it moves out to that point plus `gap`. A first hit facing inward is another limb
        the ray is entering: the vertex is already outside"""
        P = P.copy()
        moved = np.zeros(len(P), bool)
        for _ in range(passes):
            D = self.outward(P)
            t, k = ray_hits(P, D, self.P, self.tri, reach)
            inside = np.isfinite(t) & (k >= 0)
            inside[inside] = (self.fn[k[inside]] * D[inside]).sum(1) > 0
            P[inside] += D[inside] * (t[inside] + gap)[:, None]
            moved |= inside
            if not inside.any():
                break
        return P, int(moved.sum())


def boundary_verts(P, tri):
    """welded vertices on an open edge of tri"""
    w = mp.weld(P)
    e = np.sort(np.concatenate([w[tri[:, [0, 1]]], w[tri[:, [1, 2]]], w[tri[:, [2, 0]]]]), 1)
    u, cnt = np.unique(e, axis=0, return_counts=True)
    bw = np.unique(u[cnt == 1].reshape(-1))
    return np.nonzero(np.isin(w, bw))[0]


def covered(base_P, base_N, base_tri, A_P, A_tri, reach=0.08, back=0.02):
    """base triangles under an armour piece: from each of the triangle's vertices, a ray out along the skin's normal
    (starting `back` inside the skin) meets the armour within `reach`. Past a hem the ray meets nothing, so the skin
    there stays; pockets, straps and loose shells do not matter (an earlier test, distance to the armour's open
    edges, left skin showing all over a jacket full of pockets)"""
    if not len(A_tri):
        return np.zeros(0, int)
    used = np.unique(base_tri.reshape(-1))
    O = base_P[used] - base_N[used] * back
    D = base_N[used]
    a, b, c = A_P[A_tri[:, 0]], A_P[A_tri[:, 1]], A_P[A_tri[:, 2]]
    ctr = (a + b + c) / 3
    rad = np.maximum(np.linalg.norm(a - ctr, axis=1), np.maximum(np.linalg.norm(b - ctr, axis=1), np.linalg.norm(c - ctr, axis=1)))
    tree = cKDTree(ctr)
    cand = tree.query_ball_point(O + D * (reach / 2), r=reach / 2 + back + np.percentile(rad, 95))
    hit = np.zeros(len(used), bool)
    vi = np.repeat(np.arange(len(used)), [len(x) for x in cand])
    ti = np.concatenate([np.asarray(x, int) for x in cand]) if len(vi) else np.zeros(0, int)
    if len(vi):
        # Moller-Trumbore, every (vertex, candidate triangle) pair at once
        e1, e2 = b[ti] - a[ti], c[ti] - a[ti]
        pv = np.cross(D[vi], e2)
        det = (e1 * pv).sum(1)
        ok = np.abs(det) > 1e-12
        inv = np.where(ok, 1 / np.where(ok, det, 1), 0)
        tv = O[vi] - a[ti]
        u = (tv * pv).sum(1) * inv
        qv = np.cross(tv, e1)
        v = (D[vi] * qv).sum(1) * inv
        t = (e2 * qv).sum(1) * inv
        good = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 0) & (t < reach + back)
        hit[np.unique(vi[good])] = True
    flag = np.zeros(len(base_P), bool)
    flag[used[hit]] = True
    return np.nonzero(flag[base_tri].all(1))[0]


def make_body(body, donors):
    data, pieces = os.path.join(HERE, 'data', body), os.path.join(HERE, 'pieces', body)
    os.makedirs(data, exist_ok=True)
    os.makedirs(pieces, exist_ok=True)
    for f in os.listdir(pieces):
        if f.endswith('.glb'):
            os.remove(os.path.join(pieces, f))
    mine = [d for d in donors if d.get('body', 'male') == body]
    base_dn = [d for d in mine if d.get('head') == 'base'][0]
    c = mp.load(os.path.join(HERE, base_dn['glb']))
    c.J = {n: i for i, n in enumerate(c.joints)}
    jnames = list(c.joints) + [f[0] for f in mp.FACE]
    jidx = {n: i for i, n in enumerate(jnames)}
    neck = mp.SEAMS[0]
    frame = mp.seam_frame(c, neck)
    kit = {'body': body, 'base': base_dn['id'], 'regions': REGIONS, 'face_joints': [f[0] for f in mp.FACE],
           'heads': [], 'armour': [], 'hair': []}

    # -- the base: its surface is the skin every other piece sits on
    bd = mp.load(os.path.join(HERE, base_dn['glb']))
    bP, bN, bdense = fitted(bd, c, jnames)
    bN = mp.smooth_normals(bP, bN, bd.tri)
    bmarks = mp.face_landmarks(bP, bdense, c)
    btslot = mp.tri_slots(bd.tri, bdense, jnames)
    bring, _ = mp.neck_ring(bP, bd.tri, bdense, jnames)
    bneck = mp.seam_ring(bP, bd.tri, btslot, frame, neck)
    bJT, bWT = mp.top4(bdense)
    w = Writer(c, bmarks)
    mat = w.material('base', rig=bd)
    region_tris = {}
    for r in REGIONS:
        region_tris[r] = np.nonzero(btslot == mp.SLOTS.index(r))[0]
        if r == 'torso':     # the base's own neck reaches 3 cm up under the heads, so no head shows a gap
            tr = mp.cut(bP, bN, bd.tri, bdense, jnames)[1].get(('torso', 'head'))
            if tr is not None:
                region_tris[r] = np.concatenate([region_tris[r], tr[0]])
        w.mesh('base_' + r, bP, bN, bd.uv, bJT, bWT, bd.tri[region_tris[r]], mat)
    w.save(os.path.join(pieces, 'base.glb'))
    base_cover = np.unique(bd.tri[np.isin(btslot, [mp.SLOTS.index(r) for r in REGIONS])].reshape(-1))
    skinP, skinN = bP[base_cover], bN[base_cover]
    skin_tree = cKDTree(skinP)
    bdom = bJT[np.arange(len(bJT)), bWT.argmax(1)]          # each base vertex's main bone
    skin_surface = Skin(c, bP, bd.tri[np.isin(btslot, [mp.SLOTS.index(r) for r in REGIONS])])
    kit['base_tris'] = {r: int(len(region_tris[r])) for r in REGIONS}

    heads = {}
    for dn in mine:
        if dn.get('kind', 'outfit') not in ('outfit', 'head'):
            continue
        d = mp.load(os.path.join(HERE, dn['glb']))
        P, N, dense = fitted(d, c, jnames)
        ring, _ = mp.neck_ring(P, d.tri, dense, jnames)
        P = mp.neck_shift(P, dense, jnames, np.array([0.0, bring[1] - ring[1]]))
        tslot = mp.tri_slots(d.tri, dense, jnames)
        mine_ring = mp.seam_ring(P, d.tri, tslot, frame, neck)
        if mine_ring is not None and bneck is not None and dn['id'] != base_dn['id']:
            P = mp.conform(P, d.tri, tslot, frame, neck, mine_ring, bneck[:2])
        N = mp.smooth_normals(P, N, d.tri)
        marks = mp.face_landmarks(P, dense, c) or bmarks
        JTa, WTa = mp.top4(dense)          # armour: no face joints (they move with whichever head is worn)
        dense = mp.face_weights(P, dense, c, marks, jidx)
        JT, WT = mp.top4(dense)
        img = donor_image(d)
        cols = tri_colours(img, d.uv, d.tri) if img is not None else None
        # head, without the donor's collar: below the chin only skin and hair stay (long hair still hangs); the
        # base body's own neck is under it
        ht = tslot == mp.SLOTS.index('head')
        if cols is not None:
            hskin = skin_colour(cols, P, d.tri, marks)
            ctr = P[d.tri].mean(1)
            crown = ht & (ctr[:, 1] > ctr[ht, 1].max() - 0.04)
            hair_col = np.median(cols[crown], 0) if crown.any() else None
            low = ht & (ctr[:, 1] < marks['face_chin'][1] - 0.015)
            ok = np.zeros(len(d.tri), bool)
            if hskin is not None:
                ok |= np.linalg.norm(cols - hskin, axis=1) < SKIN_DE * 1.3
            if hair_col is not None:
                ok |= np.linalg.norm(cols - hair_col, axis=1) < HAIR_DE
            ht &= ~(low & ~ok)
        ht = np.nonzero(ht)[0]
        w = Writer(c, marks)
        hm = w.material(dn['id'], rig=d)
        w.mesh('head', P, N, d.uv, JT, WT, d.tri[ht], hm)
        w.save(os.path.join(pieces, 'head_%s.glb' % dn['id']))
        style = dn.get('head', 'hair')
        kit['heads'].append({'id': dn['id'], 'name': dn.get('head_name', dn['name']), 'style': style,
                             'glb': 'pieces/%s/head_%s.glb' % (body, dn['id']),
                             'face': {k: [round(x, 4) for x in v] for k, v in marks.items()}})
        heads[dn['id']] = (P, N, d.tri, tslot, JT, WT, marks, style)
        if dn.get('kind', 'outfit') != 'outfit' or dn['id'] == base_dn['id']:
            continue
        # armour: the donor's clothing in each armour slot, its skin taken out, over the base skin
        skin = skin_colour(cols, P, d.tri, marks) if cols is not None else None
        is_skin = (np.linalg.norm(cols - skin, axis=1) < SKIN_DE) if skin is not None else np.zeros(len(d.tri), bool)
        # skin comes out of armour only as whole hands: a donor whose hands are mostly its skin colour has bare hands,
        # and they go (the base's hands show); a gloved donor keeps its whole glove. Anything finer (stripping skin
        # texel by texel) tore holes in gloves, and in leather close to a shadowed face's colour
        hands = tslot == mp.SLOTS.index('hands')
        ar = areas(P, d.tri)
        bare_hands = bool(hands.any() and (ar[hands & is_skin].sum() / max(ar[hands].sum(), 1e-9)) > 0.5)
        is_skin = hands & bare_hands
        entry = {'id': dn['id'], 'name': dn['name'], 'glb': 'pieces/%s/armour_%s.glb' % (body, dn['id']), 'slots': {},
                 'gloves': not bare_hands}
        w = Writer(c, marks)
        am = w.material(dn['id'], rig=d)
        Pa = P.copy()
        _, bands = mp.cut(P, N, d.tri, dense, jnames)
        for slot in ('feet', 'legs', 'torso'):
            mine_slots = [mp.SLOTS.index(s) for s in ARMOUR[slot]]
            at = np.isin(tslot, mine_slots)
            # and the donor's own surface a few cm past each cut (make_pieces.BAND), so a hem overlaps the next
            # piece whatever outfit that comes from: layered, both sides may overlap
            for (sl, other), (bt, _, _, _) in bands.items():
                if sl in ARMOUR[slot] and other not in ARMOUR[slot] and other != 'head':
                    at[bt] = True
            at = np.nonzero(at & ~is_skin)[0]
            if len(at) < 50:
                continue
            sv = np.unique(d.tri[at].reshape(-1))
            pushed, n_lift = skin_surface.push(Pa[sv], LAYER[slot])
            Pa[sv] = pushed
            # the base body's weights, from its nearest vertex: armour then bends exactly like the skin under it
            # (the donor's own weights drift centimetres off the base's in a pose, and the skin pokes through)
            JTt, WTt = JTa.copy(), WTa.copy()
            JTt[sv], WTt[sv] = bJT[base_cover[skin_tree.query(Pa[sv])[1]]], bWT[base_cover[skin_tree.query(Pa[sv])[1]]]
            n = w.mesh(slot, Pa, N, d.uv, JTt, WTt, d.tri[at], am)
            hide = {}
            for r in REGIONS:
                cov = covered(bP, bN, bd.tri[region_tris[r]], Pa, d.tri[at])
                if (r in ('hands', 'feet') and len(cov) > WHOLE * len(region_tris[r])) or \
                        (r == 'hands' and slot == 'torso' and not bare_hands):
                    cov = np.arange(len(region_tris[r]))     # a glove or a boot: the whole hand or foot goes
                if len(cov):
                    hide[r] = bits(len(region_tris[r]), cov)
            entry['slots'][slot] = {'triangles': n, 'hide': hide, 'lifted': n_lift}
        w.save(os.path.join(pieces, 'armour_%s.glb' % dn['id']))
        kit['armour'].append(entry)
        print('%-6s %-8s head %5d  armour %s  skin %s' % (body, dn['id'], len(ht),
              {k: (v['triangles'], len(v['hide'])) for k, v in entry['slots'].items()},
              None if skin is None else np.round(skin, 2)))

    # -- hair and beards, on every bald head of this body
    for hd in mine:
        if hd.get('kind') not in ('hair', 'beard'):
            continue
        for hid, head in heads.items():
            if head[7] not in ('bald', 'base'):
                continue
            out = '%s__%s.glb' % (hd['id'], hid)      # <hair>__<head>
            info = fit_hair(os.path.join(HERE, hd['glb']), hd.get('kind'), head, c, os.path.join(pieces, out), hd['id'])
            if info is None:
                continue
            kit['hair'].append({'id': hd['id'], 'name': hd['name'], 'kind': hd['kind'], 'head': hid,
                                'glb': 'pieces/%s/%s' % (body, out)})
            print('%-6s %-14s on %-7s %s' % (body, hd['id'], hid, info))

    clips = mp.write_anims(os.path.join(pieces, 'anims.glb'), c)
    names, parents, jnodes, W = mp.skeleton_nodes(c, {f[0]: c.jpos[c.J['Head']] for f in mp.FACE})
    json.dump({'joints': [{'name': n['name'], 'parent': parents[i], 't': n['translation'], 'r': n['rotation']}
                          for i, n in enumerate(jnodes)], 'clips': clips},
              open(os.path.join(data, 'skeleton.json'), 'w'), indent=1)
    json.dump(kit, open(os.path.join(data, 'kit.json'), 'w'), indent=1)


def fit_hair(path, kind, head, c, out, name):
    """hair (or a beard) from a Meshy prop, fitted onto one head and written as a skinned GLB"""
    h = glbio.read_mesh(path)
    if h.image is None:
        return None
    cols = tri_colours(h.image, h.uv, h.tri)
    A = areas(h.pos, h.tri)
    ctr = h.pos[h.tri].mean(1)
    lo, hi = h.pos[:, 1].min(), h.pos[:, 1].max()
    crown = ctr[:, 1] > hi - 0.12 * (hi - lo)
    hair_col = np.average(cols[crown], axis=0, weights=A[crown]) if crown.any() else np.median(cols, 0)
    hairy = np.linalg.norm(cols - hair_col, axis=1) < HAIR_DE
    proxy = ~hairy                                  # the mannequin, or a face: where the head was
    pa = A[proxy].sum() / A.sum()
    P, N, tri, tslot, JT, WT, marks, _ = head
    hv = np.unique(tri[tslot == mp.SLOTS.index('head')].reshape(-1))
    Q = P[hv]
    brow = marks['face_brow_L'][1]
    cr = Q[Q[:, 1] > brow]
    top, width, depth = cr[:, 1].max(), np.ptp(cr[:, 0]), np.ptp(cr[:, 2])
    cx, cz = np.median(cr[:, 0]), (cr[:, 2].max() + cr[:, 2].min()) / 2
    if pa > 0.05:
        # the head the hair was made on: its part above its own brow line onto the base head's cranium
        pv = np.unique(h.tri[proxy].reshape(-1))
        D = h.pos[pv]
        dtop = D[:, 1].max()
        dh = dtop - D[:, 1].min()
        Dc = D[D[:, 1] > dtop - 0.45 * dh]
        s = 0.5 * (width / np.ptp(Dc[:, 0]) + depth / np.ptp(Dc[:, 2]))
        ref = np.array([(Dc[:, 0].max() + Dc[:, 0].min()) / 2, dtop, (Dc[:, 2].max() + Dc[:, 2].min()) / 2])
    else:
        # a hollow shell: its crown cap, less the hair's thickness, onto the cranium
        cap = h.pos[h.pos[:, 1] > hi - 0.3 * (hi - lo)]
        s = 0.5 * ((width + 0.03) / np.ptp(cap[:, 0]) + (depth + 0.03) / np.ptp(cap[:, 2]))
        ref = np.array([(cap[:, 0].max() + cap[:, 0].min()) / 2, hi, (cap[:, 2].max() + cap[:, 2].min()) / 2])
        top += 0.015
    Hp = (h.pos - ref) * s + np.array([cx, top, cz])
    keep = hairy.copy()
    if kind == 'beard':
        # below the eyes, in front: the beard; the bust's hair on top is not part of it
        eye = (marks['face_eye_L'][1] - top) / s + hi if pa <= 0.05 else None
        keep &= (Hp[h.tri].mean(1)[:, 1] < marks['face_eye_L'][1] - 0.01) & (Hp[h.tri].mean(1)[:, 2] > cz)
    elif kind == 'hair':
        # hair grows above the ears at the front: drop a bust's beard (hair-coloured, low, at the front)
        tc = Hp[h.tri].mean(1)
        keep &= ~((tc[:, 1] < marks['face_eye_L'][1]) & (tc[:, 2] > marks['face_eye_L'][2] - 0.02))
    if keep.sum() < 50:
        return None
    used = np.unique(h.tri[keep].reshape(-1))
    remap = -np.ones(len(Hp), np.int64)
    remap[used] = np.arange(len(used))
    Hp, Hn, Huv = Hp[used], h.nrm[used], h.uv[used]
    htri = remap[h.tri[keep]]
    Hp, n_lift = push_out(Hp, Hn, P[hv], N[hv], mp.HAIR_GAP, reach=0.04)
    near = hv[cKDTree(P[hv]).query(Hp)[1]]
    w = Writer(c, marks)
    m = w.material(name, image=h.image, double=True)
    w.mesh(kind, Hp, Hn, Huv, JT[near], WT[near], htri, m)
    w.save(out)
    return {'tris': int(len(htri)), 'scale': round(float(s), 3), 'lifted': n_lift, 'proxy': round(float(pa), 2)}


def main():
    donors = json.load(open(os.path.join(HERE, 'data', 'donors.json')))
    for body in BODIES:
        if sys.argv[1:] and body not in sys.argv[1:]:
            continue
        if not any(d.get('body', 'male') == body and d.get('head') == 'base' for d in donors):
            print('%s: no base donor' % body)
            continue
        make_body(body, donors)


if __name__ == '__main__':
    main()
