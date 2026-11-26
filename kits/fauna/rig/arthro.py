#!/usr/bin/env python3
"""Cut a generated arthropod into rigid parts and rig it: python3 rig/arthro.py <key> <candidate> [--tris N] [--debug]

Reads rig/sources/<key>/raw-<candidate>.glb and spec.json, writes rig-<candidate>.glb there, ready for models_pack.py. The first Meshy rigs cut
by coordinates tuned per animal, decimated in one pass and let the join hide the cut. Here the shape decides, so a new animal needs no table:

  body and limbs   a solid voxel model, opened by a ball wider than a leg: what survives is the trunk, and it falls into its segments at the
                   necks by itself. Whatever the opening removed is limbs, and a limb that reaches the ground is a leg
  thin limbs       each part is decimated on its own budget, so a leg keeps its triangles however large the body is (F5)
  no holes         every cut is capped, so a part stays a closed shell in any pose (F2)
  joints           a leg is femur, tibia and tarsus, cut at its bends along the surface; neighbours overlap across each cut
  walk             a tripod gait by two-bone IK, each tarsus kept level while planted

Frame: +z the snout, y up, +x the animal's left. Needs numpy, scipy, trimesh, fast-simplification.
"""
import argparse, json, os, re, struct, sys
import numpy as np, trimesh, fast_simplification
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components, dijkstra
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
BUDGET = dict(head=2150, thorax=1500, abd=1300, femur=240, tibia=230, tarsus=130, arm=1300, jaw=800)      # a spec's "budget" overrides these


def load(path):
    b = open(path, 'rb').read(); jl = struct.unpack('<I', b[12:16])[0]
    J = json.loads(b[20:20 + jl]); BIN = b[20 + jl + 8:]

    def acc(i):
        a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; n = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]
        dt = {5126: '<f4', 5125: '<u4', 5123: '<u2'}[a['componentType']]
        st = v.get('byteStride') or np.dtype(dt).itemsize * n
        if st != np.dtype(dt).itemsize * n:
            raw = np.frombuffer(BIN, np.uint8, a['count'] * st, v.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, st)
            return np.frombuffer(raw[:, :np.dtype(dt).itemsize * n].tobytes(), dt).reshape(-1, n).copy()
        return np.frombuffer(BIN, dt, a['count'] * n, v.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, n).copy()

    def mat(n):
        if 'matrix' in n:
            return np.array(n['matrix'], float).reshape(4, 4).T
        M = np.eye(4); x, y, z, w = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1])
        M[:3, :3] = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]]) @ np.diag(s)
        M[:3, 3] = n.get('translation', [0, 0, 0]); return M
    Ps, Ns, Us, Fs, base = [], [], [], [], 0

    def walk(i, W):
        nonlocal base
        n = J['nodes'][i]; M = W @ mat(n)
        if 'mesh' in n:
            for pr in J['meshes'][n['mesh']]['primitives']:
                at = pr['attributes']; p = acc(at['POSITION']).astype(float); nn = acc(at['NORMAL']).astype(float) if 'NORMAL' in at else None
                Ps.append(p @ M[:3, :3].T + M[:3, 3]); Us.append(acc(at['TEXCOORD_0']).astype(float)); Ns.append(None if nn is None else nn @ np.linalg.inv(M[:3, :3]))
                Fs.append(acc(pr['indices']).reshape(-1, 3).astype(np.int64) + base); base += len(p)
        for c in n.get('children', []):
            walk(c, M)
    for r in J['scenes'][J.get('scene', 0)]['nodes']:
        walk(r, np.eye(4))
    P = np.vstack(Ps); F = np.vstack(Fs); UV = np.vstack(Us)
    N = np.vstack(Ns) if all(n is not None for n in Ns) else trimesh.Trimesh(P, F, process=False).vertex_normals.copy()
    N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-12
    return J, BIN, P, N, UV, F


def weld(P):
    return np.unique(np.round(P / (np.ptp(P, axis=0).max() * 2e-5)), axis=0, return_inverse=True)[1].reshape(-1)


def defur(P, F, n):
    """Taubin smoothing, n passes: hair modelled as spikes turns to shards when a part is decimated. The hair stays in the maps, and the size does not shrink"""
    W = weld(P); m = W.max() + 1; Q = np.zeros((m, 3)); Q[W] = P
    e = np.vstack([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); a, b = W[e[:, 0]], W[e[:, 1]]; A = coo_matrix((np.ones(len(a) * 2), (np.r_[a, b], np.r_[b, a])), shape=(m, m)).tocsr(); A.data[:] = 1
    deg = np.maximum(np.asarray(A.sum(1)).ravel(), 1)[:, None]
    for _ in range(n):
        Q = Q + 0.6 * (A @ Q / deg - Q); Q = Q - 0.63 * (A @ Q / deg - Q)
    return Q[W]


def surface_points(P, F, h):
    """points on the surface no further than a voxel apart"""
    t = P[F]; a = np.linalg.norm(np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0]), axis=1) / 2
    n = np.minimum((a / (h * h) * 3).astype(int) + 1, 200); idx = np.repeat(np.arange(len(F)), n)
    rng = np.random.default_rng(1); u = rng.random((len(idx), 2)); fl = u.sum(1) > 1; u[fl] = 1 - u[fl]
    return t[idx, 0] + (t[idx, 1] - t[idx, 0]) * u[:, :1] + (t[idx, 2] - t[idx, 0]) * u[:, 1:]


def segment(P, F, spec):
    """(a label per face: 1.. the trunk's blobs, 0 limb; the blobs; voxel helpers)"""
    lo = P.min(0); L = np.ptp(P, axis=0).max(); h = L / 240
    q = np.floor((surface_points(P, F, h) - lo) / h).astype(int) + 8
    G = np.zeros(q.max(0) + 9, bool); G[q[:, 0], q[:, 1], q[:, 2]] = True
    # the outside is what a flood from the corner reaches past a thickened skin (a mesh may have pinholes); the solid is the rest, thinned back
    skin = ndimage.binary_dilation(G, ndimage.generate_binary_structure(3, 2), iterations=3)
    out_, _n = ndimage.label(~skin); solid = ndimage.binary_erosion(out_ != out_[0, 0, 0], ndimage.generate_binary_structure(3, 2), iterations=2)
    D = ndimage.distance_transform_edt(solid)
    r = spec['open']      # voxels, of 240 along the longest side
    core = D > r
    op = ndimage.distance_transform_edt(~core) <= r + 2.5
    lab, n = ndimage.label(op)
    sizes = ndimage.sum(op, lab, range(1, n + 1)); keep = [i + 1 for i, s in enumerate(sizes) if s > 0.015 * sizes.max()]
    print('voxels %s, opening %.1f, blobs %s' % (solid.shape, r, sorted((int(sizes[k - 1]) for k in keep), reverse=True)))
    remap = np.zeros(n + 1, np.int32); remap[keep] = np.arange(1, len(keep) + 1); lab = remap[lab]
    c = P[F].mean(1); v = np.floor((c - lo) / h).astype(int) + 8; v = np.clip(v, 0, np.array(lab.shape) - 1)
    return lab[v[:, 0], v[:, 1], v[:, 2]], len(keep), L


def comps(F, sel, W):
    Fs = W[F[sel]]; n = W.max() + 1
    g = coo_matrix((np.ones(len(Fs) * 3), (np.r_[Fs[:, 0], Fs[:, 1], Fs[:, 2]], np.r_[Fs[:, 1], Fs[:, 2], Fs[:, 0]])), shape=(n, n))
    return connected_components(g, directed=False)[1][Fs[:, 0]]


def frame(P, N, F, face, nblob, spider=False, flip=False):
    """turn the model so its trunk runs along z with the head on +z (the end nearest what rises highest off the trunk: the antennae; a spider's, the end its legs come from), feet at y = 0"""
    C = P[F].mean(1); t = C[face > 0]; c = t.mean(0); xx, xz, zz = np.cov(t[:, 0], t[:, 2]).ravel()[[0, 1, 3]]
    th = 0.5 * np.arctan2(2 * xz, xx - zz); ax = np.array([np.cos(th), 0, np.sin(th)]); up = np.array([0, 1.0, 0]); side = np.cross(up, ax)
    R = np.array([side, up, ax]).T
    p = (P - c) @ R; n = N @ R
    Cz = p[F].mean(1)
    hi = Cz[(face == 0)]; top = hi[hi[:, 1] > np.quantile(hi[:, 1], 0.97)]
    trunk = Cz[face > 0][:, 2]; mid = (trunk.min() + trunk.max()) / 2
    if ((hi[:, 2].mean() if spider else top[:, 2].mean()) < mid) != bool(flip):
        p = p * np.array([-1, 1, -1]); n = n * np.array([-1, 1, -1])
    p[:, 1] -= p[:, 1].min()
    return p, n


def boundary_caps(V, Fq):
    """close every open loop of a part: a fan from the loop's middle, wound against the edges it meets. Returns the new vertices and faces"""
    E = np.vstack([Fq[:, [0, 1]], Fq[:, [1, 2]], Fq[:, [2, 0]]]); key = np.sort(E, axis=1)
    u, inv, cnt = np.unique(key, axis=0, return_inverse=True, return_counts=True); open_ = E[cnt[inv.reshape(-1)] == 1]
    nxt = {}
    for a, b in open_:
        nxt.setdefault(int(b), []).append(int(a))      # walk against each edge's direction
    addV, addF, base = [], [], len(V); seen = set()
    for s in list(nxt):
        if not nxt.get(s):
            continue
        loop, a = [s], s
        while nxt.get(a):
            b = nxt[a].pop(); seen.add(b)
            if b == s:
                break
            loop.append(b); a = b
        if len(loop) < 3:
            continue
        m = V[loop].mean(0); i = base + len(addV); addV.append(m)
        addF += [[loop[k], loop[(k + 1) % len(loop)], i] for k in range(len(loop))]
    return (np.array(addV) if addV else np.zeros((0, 3))), (np.array(addF, np.int64) if addF else np.zeros((0, 3), np.int64))


def uv_transfer(P, F, N, UV, V2):
    """UV and normal of each corner of the decimated part, from the original, inside one chart so a face never straddles a seam"""
    OM = trimesh.Trimesh(P, F, process=False)
    _, isl = connected_components(coo_matrix((np.ones(len(F) * 3), (np.r_[F[:, 0], F[:, 1], F[:, 2]], np.r_[F[:, 1], F[:, 2], F[:, 0]])), shape=(len(P),) * 2), directed=False)
    fisl = isl[F[:, 0]]; return OM, fisl


def bake_part(P, N, UV, F, target):
    """(positions, normals, uvs, faces) of the part, unindexed by corner so a chart seam can stay sharp, capped"""
    W = weld(P); ids, first = np.unique(W, return_index=True); m = np.zeros(W.max() + 1, np.int64); m[ids] = np.arange(len(ids))
    Fw = m[W[F]]; Fw = Fw[(Fw[:, 0] != Fw[:, 1]) & (Fw[:, 1] != Fw[:, 2]) & (Fw[:, 0] != Fw[:, 2])]
    Vw = P[first]
    if len(Fw) > target:
        V2, F2 = fast_simplification.simplify(Vw.astype(np.float64), Fw.astype(np.int64), target_count=target, agg=4)[:2]
    else:
        V2, F2 = Vw, Fw
    used = np.unique(F2); rm = -np.ones(len(V2), np.int64); rm[used] = np.arange(len(used)); V2 = V2[used]; F2 = rm[F2]
    OM, fisl = uv_transfer(P, F, N, UV, V2)
    cen = V2[F2].mean(1); _, _, tid = trimesh.proximity.closest_point(OM, cen); face_isl = fisl[tid]
    corner = V2[F2].reshape(-1, 3); cuv = np.zeros((len(corner), 2)); cn = np.zeros((len(corner), 3)); cisl = np.repeat(face_isl, 3)
    for k in np.unique(cisl):
        sel = np.where(cisl == k)[0]; fid = np.where(fisl == k)[0]; sub = trimesh.Trimesh(P, F[fid], process=False)
        cp, _, t = trimesh.proximity.closest_point(sub, corner[sel]); tri = F[fid[t]]; bc = trimesh.triangles.points_to_barycentric(P[tri], cp)
        cuv[sel] = (UV[tri] * bc[:, :, None]).sum(1); cn[sel] = (N[tri] * bc[:, :, None]).sum(1)
    # a reduced triangle can bridge a gap inside one chart, and its corners then span the map: a few such faces smear most of the texture. Each takes one colour, the map's at its middle
    ct = corner.reshape(-1, 3, 3); uvt = cuv.reshape(-1, 3, 2); e = uvt[:, 1] - uvt[:, 0]; f = uvt[:, 2] - uvt[:, 0]; ua = np.abs(e[:, 0] * f[:, 1] - e[:, 1] * f[:, 0]) / 2
    sa = np.linalg.norm(np.cross(ct[:, 1] - ct[:, 0], ct[:, 2] - ct[:, 0]), axis=1) / 2; ratio = ua / (sa + 1e-12); bad = ratio > 6 * max(np.median(ratio[ratio > 0]), 1e-12) if (ratio > 0).any() else np.zeros(len(ratio), bool)
    if bad.any():
        cp, _, t = trimesh.proximity.closest_point(OM, ct[bad].mean(1)); tri = F[t]; bc = trimesh.triangles.points_to_barycentric(P[tri], cp); uvt[bad] = (UV[tri] * bc[:, :, None]).sum(1)[:, None, :]; cuv = uvt.reshape(-1, 2)
    # shade the reduced mesh by its own smooth normals: the original's, sampled at a few corners, are noise at this density (a faceted head)
    tm = trimesh.Trimesh(V2, F2, process=False); cn = tm.vertex_normals[F2].reshape(-1, 3).copy(); fn = np.repeat(tm.face_normals, 3, axis=0)
    weak = np.linalg.norm(cn, axis=1) < 0.5; cn[weak] = fn[weak]
    aV, aF = boundary_caps(V2, F2)
    if len(aF):      # a cap takes the colour of the rim it closes
        V3 = np.vstack([V2, aV]); T = cKDTree(V2); capc = V3[aF].reshape(-1, 3); _, nv = T.query(capc)
        rim = cKDTree(corner); _, nc = rim.query(V2[nv])
        n0 = np.cross(capc[1::3] - capc[0::3], capc[2::3] - capc[0::3]); n0 /= np.linalg.norm(n0, axis=1, keepdims=True) + 1e-12
        inner = cuv.reshape(-1, 3, 2).mean(1)[nc[0::3] // 3]      # the middle of a rim face, inside its chart: a corner can sit on the black between charts
        n0[np.linalg.norm(n0, axis=1) < 0.5] = [0, 1, 0]
        corner = np.vstack([corner, capc]); cuv = np.vstack([cuv, np.repeat(inner, 3, axis=0)]); cn = np.vstack([cn, np.repeat(n0, 3, axis=0)])      # one colour a triangle: a fan's rim can span the map
    return corner, cn, cuv, len(corner) // 3


def leg_chain(P, F, sel, trunkP):
    """cut a leg along its surface at its two sharpest bends: (femur, tibia, tarsus face masks within sel, hip, knee, ankle, toe)"""
    Fs = F[sel]; W = weld(P); ids = np.unique(W[Fs]); m = -np.ones(W.max() + 1, np.int64); m[ids] = np.arange(len(ids)); Fw = m[W[Fs]]
    Vw = np.zeros((len(ids), 3)); Vw[m[W]] = P * 1; Vw = Vw * 1
    Vs = np.zeros((len(ids), 3)); Vs[Fw.reshape(-1)] = P[Fs.reshape(-1)]
    e = np.vstack([Fw[:, [0, 1]], Fw[:, [1, 2]], Fw[:, [2, 0]]]); d = np.linalg.norm(Vs[e[:, 0]] - Vs[e[:, 1]], axis=1) + 1e-9
    g = coo_matrix((np.r_[d, d], (np.r_[e[:, 0], e[:, 1]], np.r_[e[:, 1], e[:, 0]])), shape=(len(ids),) * 2).tocsr()
    td, _ = cKDTree(trunkP).query(Vs); rootv = np.argsort(td)[:max(6, len(Vs) // 80)]
    dist = dijkstra(g, indices=rootv, min_only=True); dist[~np.isfinite(dist)] = np.nanmax(dist[np.isfinite(dist)])
    span = dist.max(); s = dist / span
    nb = 30; b = np.minimum((s * nb).astype(int), nb - 1); line = np.array([Vs[b == i].mean(0) if (b == i).any() else [np.nan] * 3 for i in range(nb)])
    ok = ~np.isnan(line[:, 0]); idx = np.where(ok)[0]; line = line[ok]
    a = line[2:] - line[:-2]; c = line[4:] - line[2:-2] if len(line) > 6 else a
    k = min(len(a), len(c)); u = a[:k] / (np.linalg.norm(a[:k], axis=1, keepdims=True) + 1e-12); w = c[:k] / (np.linalg.norm(c[:k], axis=1, keepdims=True) + 1e-12)
    bend = np.arccos(np.clip((u * w).sum(1), -1, 1)); sb = (idx[2:2 + k] + 0.5) / nb
    pick = lambda lo_, hi_, d_: float(sb[(sb > lo_) & (sb < hi_)][np.argmax(bend[(sb > lo_) & (sb < hi_)])]) if ((sb > lo_) & (sb < hi_)).any() else d_
    sk = pick(0.22, 0.6, 0.42); sa = pick(max(sk + 0.2, 0.68), 0.92, 0.82)
    band = 0.02
    fs = s[Fw].mean(1)
    fem, tib, tar = fs < sk + band, (fs > sk - band) & (fs < sa + band), fs > sa - band
    around = lambda t: Vs[np.abs(s - t) < 0.03].mean(0)
    hip = Vs[s < 0.05].mean(0); knee = around(sk); ankle = around(sa); toe = Vs[np.argmin(Vs[:, 1] + 1e-3 * np.abs(s - 1))] if False else Vs[s > 0.985][np.argmin(Vs[s > 0.985][:, 1])]
    return fem, tib, tar, hip, knee, ankle, toe, sk, sa


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('key'); ap.add_argument('candidate'); ap.add_argument('--tris', type=int, default=0); ap.add_argument('--open', type=float, default=None); a = ap.parse_args()
    d = os.path.join(HERE, 'sources', a.key); spec = json.load(open(os.path.join(d, 'spec.json'), encoding='utf-8'))
    if a.open is not None:
        spec['open'] = a.open
    BUDGET.update(spec.get('budget', {}))
    J, BIN, P, N, UV, F = load(os.path.join(d, 'raw-%s.glb' % a.candidate))
    print('raw', len(F), 'tris,', 'uv range', UV.min(0).round(3), UV.max(0).round(3))
    vol = trimesh.Trimesh(P, F, process=False).volume
    if vol < 0:
        F = F[:, ::-1]; print('flipped winding')
    if spec.get('defur'):
        P = defur(P, F, spec['defur'])
    P0, N0 = P, N
    # the opening that sets the legs free depends on the animal: try from wide to narrow until the count is the spec's
    for op in ([spec['open']] if 'open' in spec else [4.5] if spec.get('rings') else [16, 14, 12, 10, 8.8, 7.5, 6.5, 5.5, 4.5]):
        spec2 = dict(spec, open=op); face, nb, L = segment(P0, F, spec2); face = face.astype(np.int32)
        if not (face > 0).any():
            continue
        P, N = frame(P0, N0, F, face, nb, bool(spec.get('pedicel')), spec.get('flip'))
        C = P[F].mean(1); W = weld(P); ground = P[:, 1].min(); H = np.ptp(P[:, 1])
        if spec.get('rings'):      # legs in a row are a comb: everything below one height comes apart into teeth. The height is the highest that still gives most of the teeth, so each keeps its whole length
            rows = []
            for yc in np.linspace(.1, .62, 14):
                sel = C[:, 1] < ground + yc * H; l2 = comps(F, sel, W); ids, cnt = np.unique(l2, return_counts=True); rows.append((yc, int((cnt > 200).sum())))
            top_ = max(r[1] for r in rows); yc = spec['comb'] if 'comb' in spec else max(r[0] for r in rows if r[1] >= .9 * top_); print('comb', [(round(float(y), 2), c) for y, c in rows], 'cut at %.2f' % yc)
            face[:] = 1; face[C[:, 1] < ground + yc * H] = 0
        limb = np.where(face == 0)[0]; lab = comps(F, face == 0, W)
        # the limbs: a piece that reaches the ground is a leg; the rest go to the nearest blob of the trunk
        legs, other = [], []
        for l in np.unique(lab):
            f = limb[lab == l]
            if len(f) < 6:
                other.append(f); continue
            (legs if C[f, 1].min() < ground + 0.06 * H and (spec.get('rings') or np.ptp(C[f, 1]) > 0.2 * H) else other).append(f)
        print('open %.1f: limb pieces %d, legs %d' % (op, len(np.unique(lab)), len(legs)), [(len(f), round(float(C[f, 0].mean()), 3), round(float(C[f, 2].mean()), 3)) for f in legs])
        if len(legs) == spec['contacts'] or (spec.get('rings') and len(legs) >= spec['contacts']):
            break
    assert len(legs) >= spec['contacts'] if spec.get('rings') else len(legs) == spec['contacts'], 'found %d legs, the spec says %d: look at the mesh or set "open" in the spec' % (len(legs), spec['contacts'])
    arms = []
    if spec.get('raptorial'):
        # limbs held off the ground, a mantis's forelegs. A mantis's neck is as thin as a leg, so the opening takes them all as one piece: widen a strip down
        # the midline until what stands either side of it is a pair; the strip goes back to the trunk
        other.sort(key=len, reverse=True); big = other.pop(0); xm = np.median(C[big, 0]); wd = np.ptp(C[big, 0])
        grid, tops = np.linspace(0.02, 0.5, 49) * wd, []
        for w in grid:      # the two pieces either side of a strip this wide; the size falls off a cliff once the strip clears the neck, and what is left is the arms
            sel = np.zeros(len(F), bool); sel[big[np.abs(C[big, 0] - xm) > w]] = True; sidef = np.where(sel)[0]
            if not len(sidef):
                tops.append((0, None)); continue
            l2 = comps(F, sel, W); ids, cnt = np.unique(l2, return_counts=True); o = np.argsort(-cnt)[:2]
            pair = [sidef[l2 == ids[i]] for i in o]
            good = len(pair) == 2 and (C[pair[0], 0].mean() - xm) * (C[pair[1], 0].mean() - xm) < 0 and min(len(q) for q in pair) > 0.05 * len(big)
            tops.append((sum(len(q) for q in pair) if good else 0, pair if good else None))
        sizes = np.array([t[0] for t in tops], float); fall = sizes[:-1] - sizes[1:]; fall[sizes[1:] == 0] = 0
        i = int(np.argmin(np.abs(grid - spec['strip'] * wd))) if 'strip' in spec else int(np.argmax(fall)) + 2
        print('strip widths', np.round(grid[:14], 3), 'sizes', [int(x) for x in sizes[:14]], 'cliff at', i)
        arms = tops[min(i, len(tops) - 1)][1] or []
        if arms:
            rest = np.setdiff1d(big, np.r_[arms[0], arms[1]]); face[rest] = 1
        print('arms', [(len(f), round(float(C[f, 0].mean()), 3), round(float(C[f, 2].mean()), 3)) for f in arms])
        assert len(arms) == 2, 'the raised forelegs are not a pair'
    neck = None; rings = []; pairs = None
    if spec.get('rings'):      # a millipede: one ring to a groove in its back, the deepest first, no two closer than most of a leg pair's pitch; the legs pair off front to back, and a leg with no partner is dropped to the trunk
        L_, R_ = [sorted((f for f in legs if (C[f, 0].mean() > 0) == s), key=lambda f: -C[f, 2].mean()) for s in (True, False)]; pairs = []
        for fl in L_:
            fr_ = min(R_, key=lambda f: abs(C[f, 2].mean() - C[fl, 2].mean())) if R_ else None
            pairs.append((fl, fr_)); R_ = [f for f in R_ if f is not fr_]
        zp = np.array([C[p[0], 2].mean() for p in pairs]); pitch = np.median(-np.diff(zp)); keep_ = [p for p in pairs if p[1] is not None and abs(C[p[0], 2].mean() - C[p[1], 2].mean()) < .6 * pitch]
        other += [q for p in pairs if not any(p is k_ for k_ in keep_) for q in p if q is not None] + R_; pairs = keep_; legs = [q for p in pairs for q in p]; print('%d leg pairs, pitch %.3f' % (len(pairs), pitch))
        face[face > 0] = 1; t = np.where(face > 0)[0]; z = C[t, 2]; zs = np.linspace(z.min(), z.max(), 500); b_ = np.clip(np.digitize(z, zs) - 1, 0, 498); w = np.zeros(499); np.maximum.at(w, b_, C[t, 1]); w = ndimage.gaussian_filter1d(w, 1.5)
        cand = [i for i in range(3, 496) if w[i] <= w[i - 1] and w[i] <= w[i + 1]]; pick = []
        for q in sorted(cand, key=lambda i: w[i]):
            if all(abs(zs[q] - zs[r]) > .7 * pitch for r in pick):
                pick.append(q)
        cuts = sorted(float(zs[q]) for q in pick); nb = len(cuts) + 1; face[t] = nb - np.searchsorted(cuts, z); rings = ['seg%d' % i for i in range(nb - 1)]; spec['trunk'] = ['head'] + rings; neck = dict(t=t, z=z, cuts=cuts, tilt=0.0); print('%d rings' % len(rings))
    elif spec.get('pedicel'):      # a spider: the abdomen can sit up over the back, so no slice along the body parts it. The cut is square to the line from the hips to the abdomen's tip, at the waist behind the hips
        t = np.where(face > 0)[0]; tk = cKDTree(C[t][::max(1, len(t) // 6000)]); hips = np.array([C[f][tk.query(C[f])[0].argmin()] for f in legs]); hc = hips.mean(0)
        tip = C[t][np.linalg.norm(C[t] - hc, axis=1).argmax()]; ax = (hc - tip) / np.linalg.norm(hc - tip); z = C[t] @ ax; zs = np.linspace(z.min(), z.max(), 81); bins = np.clip(np.digitize(z, zs) - 1, 0, 79); w = np.full(80, np.inf)
        for i in range(80):      # each section's area, from the spread of its points square to the axis
            q = C[t[bins == i]]
            if len(q) > 12:
                q = q - np.outer(q @ ax, ax); e2 = np.sort(np.linalg.eigvalsh(np.cov(q.T)))[-2:]; w[i] = np.sqrt(max(e2[0] * e2[1], 0)) ** 0.5
        w = ndimage.gaussian_filter1d(np.where(np.isinf(w), 0, w), 1.0); head = int(np.searchsorted(zs, hc @ ax)); lo = int(w[:head].argmax()); i = lo + int(w[lo:head].argmin())      # the valley between the abdomen and the chest
        c = (zs[i] + zs[i + 1]) / 2; print('the waist at %.3f of the trunk, abdomen at %.3f, hips at %.3f, section %.3f against %.3f' % ((c - z.min()) / np.ptp(z), (zs[lo] - z.min()) / np.ptp(z), (zs[head] - z.min()) / np.ptp(z), w[i], w[lo]))
        nb = 2; face[t] = 2 - (z > c); neck = dict(t=t, z=z, cuts=[c], tilt=0.0)
    elif nb < spec.get('segments', 3):      # the trunk held together: part it at its necks, the narrowest points along it
        t = np.where(face > 0)[0]; yz = C[t][:, 1:] - C[t][:, 1:].mean(0); e = np.linalg.eigh(np.cov(yz.T))[1][:, -1]; e = e if e[1] > 0 else -e      # the trunk's long axis: a beetle stands nose up, a mantis curves
        ax = np.array([0, e[0], e[1]]); z = C[t] @ ax; zs = np.linspace(z.min(), z.max(), 81); bins = np.clip(np.digitize(z, zs) - 1, 0, 79); w = np.zeros(80)
        for i in range(80):      # the width at each station, about that station's own middle
            q = C[t[bins == i]]
            if len(q) > 3:
                w[i] = np.quantile(np.linalg.norm(q - np.median(q, axis=0), axis=1), 0.9)
        w = ndimage.gaussian_filter1d(w, 1.2); cand = [i for i in range(4, 76) if w[i] <= w[i - 1] and w[i] <= w[i + 1]]
        prom = [min(w[:i].max(), w[i:].max()) - w[i] for i in cand]; pick = []      # both ends of a waist are necks of one join: keep the deepest, then the next far enough off
        for q in sorted(range(len(cand)), key=lambda q: -prom[q]):
            if len(pick) < spec.get('segments', 3) - 1 and all(abs(cand[q] - cand[r]) > spec.get('neckgap', 16) for r in pick):
                pick.append(q)
        cuts = sorted((zs[cand[q]] + zs[cand[q] + 1]) / 2 for q in pick); print('necks at z', np.round(cuts, 3), 'prominence', [round(float(prom[q]), 3) for q in pick])
        nb = len(cuts) + 1; face[t] = nb - np.searchsorted(cuts, z); neck = dict(t=t, z=z, cuts=cuts, tilt=float(np.arctan2(e[0], e[1])))
    blobs = sorted(range(1, nb + 1), key=lambda b: -C[face == b, 2].mean()); names = (spec.get('trunk') or (['head', 'thorax', 'abd', 'abd2'] if nb >= 3 else ['head', 'thorax']))[:nb]
    bn = dict(zip(blobs, names)); print('segments', {bn[b]: [int((face == b).sum()), round(float(C[face == b, 2].min()), 3), round(float(C[face == b, 2].max()), 3)] for b in blobs})
    trees = {b: cKDTree(C[face == b][::max(1, (face == b).sum() // 4000)]) for b in blobs}
    part = np.full(len(F), '', dtype=object)
    for b in blobs:
        part[face == b] = bn[b]
    for f in other:
        c = C[f]; part[f] = bn[min(blobs, key=lambda b: trees[b].query(c.mean(0))[0])]
    jawcut = None
    if spec.get('jaw') is not None:      # the fangs and palps, its own part so they swap: the low front wedge of the thorax, with whatever hangs off it
        q = C[face == blobs[0]]; y0, z0 = q[:, 1].min(), q[:, 2].min(); s = (C[:, 2] - z0) / np.ptp(q[:, 2]) - 0.55 * (C[:, 1] - y0) / np.ptp(q[:, 1]) - spec['jaw']
        th = np.where(part == 'thorax')[0]; th = th[np.abs(C[th, 0] - q[:, 0].mean()) < 0.3 * np.ptp(q[:, 2])]; part[th[s[th] > 0]] = 'jaw'; jawcut = th[np.abs(s[th]) < 0.02]      # near the midline: out to the sides are the leg sockets
    trunkC = C[face == blobs[1 if spec.get('swap') else 0]] if spec.get('pedicel') or spec.get('swap') else C[face > 0]; trunkT = trunkC[::max(1, len(trunkC) // 6000)]
    order = sorted(legs, key=lambda f: -C[f].mean(0)[2])      # pairs front to back; sort each pair by its side
    groups = pairs if pairs else [order[i:i + 2] for i in range(0, len(order), 2)]
    tri_parts, LEG, CLONE = {}, {}, {}; chest = cKDTree(trunkT)
    for i, grp in enumerate([arms] + groups if arms else groups):
        for f in grp:
            held = bool(arms) and i == 0; sd = 'L' if C[f, 0].mean() > 0 else 'R'; nm = 'arm' + sd if held else 'leg%d' % (2 * i + (sd == 'R')) if pairs else 'leg%d%s' % (i - (1 if arms else 0), sd); fem, tib, tar, hip, knee, ankle, toe, sk, sa = leg_chain(P, F, f, trunkT)
            if spec.get('pedicel') or spec.get('swap'):      # a rear leg of a big-bellied spider comes out from under the abdomen: its femur is drawn out to the chest, so any abdomen can be swapped on
                to = trunkT[chest.query(hip)[1]]
                gap = np.linalg.norm(to - hip)
                if gap > 0.09 * np.ptp(C[:, 2]):      # less than that is the leg's own socket: moving it would part the leg from the stub on the body
                    # this leg's first length is lost in the belly: what reached the ground starts at its true knee. The scraps it left go, and it gets the femur of the leg in front, fitted from the chest to that knee
                    d2 = lambda q: np.linalg.norm(q - (to + np.clip((q - to) @ (hip - to) / gap ** 2, 0, 1) * (hip - to)))
                    lost = [p for p in other if len(p) >= 30 and d2(C[p].mean(0)) < 0.6 * gap]
                    if lost:
                        part[np.concatenate(lost)] = ''; other = [p for p in other if not any(p is q for q in lost)]
                    ab = np.where(part == 'abd')[0]      # and what is left of that femur on the belly: it stands out of the abdomen's ellipsoid, along the line from chest to knee
                    if len(ab):
                        Ca = C[ab]; mu = Ca.mean(0); w_, v_ = np.linalg.eigh(np.cov(Ca.T)); rr = np.sqrt((((Ca - mu) @ v_) ** 2 / (3 * w_)).sum(1)); t_ = np.clip((Ca - to) @ (hip - to) / gap ** 2, 0, 1); part[ab[(np.linalg.norm(Ca - (to + t_[:, None] * (hip - to)), axis=1) < 0.55 * gap) & (rr > 0.98)]] = ''
                    g0 = LEG['leg%d%s' % (i - 1, sd)]; u_, inv = np.unique(F[tri_parts['leg%d%s' % (i - 1, sd)][0]], return_inverse=True)
                    a0 = g0['knee'] - g0['hip']; L0 = np.linalg.norm(a0); ua = a0 / L0; ub = hip - to; L1 = np.linalg.norm(ub); ub = ub / L1
                    ax_ = np.cross(ua, ub); s_ = np.linalg.norm(ax_); c_ = ua @ ub; K_ = np.array([[0, -ax_[2], ax_[1]], [ax_[2], 0, -ax_[0]], [-ax_[1], ax_[0], 0]]); Rc = np.eye(3) + K_ + K_ @ K_ * ((1 - c_) / max(s_ * s_, 1e-12))
                    rel = P[u_] - g0['hip']; rel = rel + (L1 / L0 - 1) * (rel @ ua)[:, None] * ua
                    n0, f0 = len(P), len(F); P = np.vstack([P, to + rel @ Rc.T]); N = np.vstack([N, N[u_] @ Rc.T]); UV = np.vstack([UV, UV[u_]]); F = np.vstack([F, inv.reshape(-1, 3) + n0])
                    C = np.vstack([C, P[F[f0:]].mean(1)]); part = np.r_[part, np.full(len(F) - f0, '', dtype=object)]; face = np.r_[face, np.zeros(len(F) - f0, face.dtype)]
                    CLONE[nm] = (np.arange(f0, len(F)), hip.copy(), knee.copy()); knee = hip.copy(); hip = to; print(nm, 'takes the femur of the leg in front, dropped', sum(len(q) for q in lost), 'scraps')
            LEG[nm] = dict(hip=hip, knee=knee, ankle=ankle, toe=toe, i=i, sd=sd, held=held)
            if held:      # two parts, femur and tibia: faces go to the nearer bone, not along the surface, so a spine stays with the bone it grows on
                cf = C[f]; seg = lambda a_, b_: np.linalg.norm(cf - (a_ + np.clip(((cf - a_) @ (b_ - a_)) / ((b_ - a_) @ (b_ - a_)), 0, 1)[:, None] * (b_ - a_)), axis=1)
                d1, d2 = seg(hip, knee), seg(knee, ankle); lap = 0.012 * np.ptp(C[:, 2]); f = np.sort(f); cf = C[f]; d1, d2 = seg(hip, knee), seg(knee, ankle); onF = d1 <= d2
                # the tibia folds against the femur, so nearness alone can hand a stretch of one to the other: what is cut off from its own bone's end goes back
                for own, end in ((True, hip), (False, toe)):
                    idx = np.where(onF == own)[0]; sel = np.zeros(len(F), bool); sel[f[idx]] = True; lab2 = comps(F, sel, W); keep = lab2[np.argmin(np.linalg.norm(cf[idx] - end, axis=1))]; onF[idx[lab2 != keep]] = not own
                both = np.abs(d1 - d2) < lap
                tri_parts[nm] = (f[onF | both], int(BUDGET['arm'] * 0.55)); tri_parts[nm + 't'] = (f[~onF | both], int(BUDGET['arm'] * 0.45))
            else:
                for name, mask, bud in ((nm, fem, BUDGET['femur']), (nm + 't', tib, BUDGET['tibia']), (nm + 'f', tar, BUDGET['tarsus'])):
                    tri_parts[name] = (f[mask], bud)
                if nm in CLONE:
                    # the top of what reached the ground is torn where it left the belly: anything well off the bone goes
                    idx_, h_, k_ = CLONE[nm]; cf = C[f]; t_ = np.clip((cf - h_) @ (k_ - h_) / ((k_ - h_) @ (k_ - h_)), 0, 1); dd = np.linalg.norm(cf - (h_ + t_[:, None] * (k_ - h_)), axis=1); keep = (fem | tib) & (~fem | (dd < 1.3 * np.median(dd[fem])))
                    tri_parts[nm], tri_parts[nm + 't'] = (idx_, BUDGET['femur']), (f[keep], int(BUDGET['tibia'] * 1.6))
            print(nm, 'held' if held else '', 'faces', len(f), 'knee at %.2f, ankle at %.2f, femur %.3f tibia %.3f tarsus %.3f' % (sk, sa, np.linalg.norm(knee - hip), np.linalg.norm(ankle - knee), np.linalg.norm(toe - ankle)))
    for nm in set(part[part != '']):
        tri_parts[nm] = (np.where(part == nm)[0], BUDGET.get(nm, BUDGET['abd']))
    if neck:      # the segments overlap across each neck, so no pose or rounding shows a gap between their caps
        band = 0.012 * np.ptp(neck['z'])
        for c in neck['cuts']:
            sel = neck['t'][np.abs(neck['z'] - c) < band]; ids = {part[i] for i in sel if part[i]}
            for n in ids:
                tri_parts[n] = (np.union1d(tri_parts[n][0], sel), tri_parts[n][1])
    if jawcut is not None and 'jaw' in tri_parts:
        for n in ('jaw', 'thorax'):
            tri_parts[n] = (np.union1d(tri_parts[n][0], jawcut), tri_parts[n][1])
    assert pairs or sorted(n for n in LEG if n.startswith('leg')) == sorted('leg%d%s' % (i, s) for i in range(len(groups)) for s in 'LR'), 'legs do not pair up: %s' % sorted(LEG)
    # ---- bake each part on its own budget, pivots in the model frame
    MESH = {}
    k = (a.tris / sum(b for _, b in tri_parts.values())) if a.tris else 1.0
    for nm, (f, bud) in sorted(tri_parts.items()):
        if rings and nm.startswith('leg') and len(f) > 1:      # a sliver the comb cut off goes: a leg is one piece
            sel_ = np.zeros(len(F), bool); sel_[f] = True; l_ = comps(F, sel_, weld(P)); ids_, cnt_ = np.unique(l_, return_counts=True); f = np.sort(f)[l_ == ids_[cnt_.argmax()]]
        fu = F[f]; u, inv = np.unique(fu, return_inverse=True); sub = inv.reshape(-1, 3)
        MESH[nm] = bake_part(P[u], N[u], UV[u], sub, max(30, int(bud * k)))
    if rings:      # the legs leave a row of sockets under every ring, too many and too torn to cap: a plain dark core inside each ring closes the body behind them
        under = np.where(C[:, 1] < np.quantile(C[:, 1], .4))[0][:4000]; dark = UV[F[under[np.argsort(N[F[under, 0]].sum(1))[0]], 0]]
        for r_ in ['head'] + rings:
            pos, nrm, uv, nt = MESH[r_]; lo_, hi_ = np.quantile(pos, .02, axis=0), np.quantile(pos, .98, axis=0); c_ = (lo_ + hi_) / 2; ax_, ay_ = (hi_[0] - lo_[0]) * .47, (hi_[1] - lo_[1]) * .47; th_ = np.linspace(0, 2 * np.pi, 11)[:-1]
            ringv = lambda z_: np.c_[c_[0] + ax_ * np.cos(th_), c_[1] + ay_ * np.sin(th_), np.full(10, z_)]; A_, B_ = ringv(pos[:, 2].min()), ringv(pos[:, 2].max()); tri = []
            for i in range(10):
                j = (i + 1) % 10; tri += [(A_[i], B_[j], B_[i]), (A_[i], A_[j], B_[j]), (A_[i], np.array([c_[0], c_[1], A_[i, 2]]), A_[j]), (B_[i], B_[j], np.array([c_[0], c_[1], B_[i, 2]]))]
            q = np.array(tri).reshape(-1, 3, 3); m_ = q.mean(1); zc = (A_[0, 2] + B_[0, 2]) / 2; cap = np.abs(np.hypot(q[:, :, 0] - c_[0], q[:, :, 1] - c_[1])).min(1) < 1e-9; flat = np.ptp(q[:, :, 1], axis=1) < 1e-9
            out_ = np.where(flat[:, None], np.tile([0, -1.0, 0], (len(q), 1)), np.where(cap[:, None], np.c_[np.zeros((len(q), 2)), np.sign(m_[:, 2] - zc)], np.c_[m_[:, 0] - c_[0], m_[:, 1] - c_[1], np.zeros(len(q))]))      # sides away from the axis, ends along it
            fl = (np.cross(q[:, 1] - q[:, 0], q[:, 2] - q[:, 0]) * out_).sum(1) < 0; q[fl] = q[fl][:, ::-1]; q = q.reshape(-1, 3)      # every face outward, as the test's winding reads it
            nq = np.repeat(np.cross(q[1::3] - q[0::3], q[2::3] - q[0::3]), 3, axis=0); nq /= np.maximum(np.linalg.norm(nq, axis=1, keepdims=True), 1e-12)
            MESH[r_] = (np.vstack([pos, q]), np.vstack([nrm, nq]), np.vstack([uv, np.tile(dark, (len(q), 1))]), nt + len(tri))
    tot = sum(m[3] for m in MESH.values()); print('baked', tot, 'tris in', len(MESH), 'parts')
    cen = lambda n: MESH[n][0].mean(0)
    PIV = {rings[0]: cen(rings[0])} if rings else {'thorax': cen('thorax')}; PAR = {}
    near = lambda p, q: (lambda d, i: (MESH[p][0][d.argmin()] + MESH[q][0][i[d.argmin()]]) / 2)(*cKDTree(MESH[q][0]).query(MESH[p][0]))
    if rings:      # each ring turns on the one in front of it, about the middle of their groove, back from the first
        at_ = lambda c: (lambda f: C[f].mean(0))(neck['t'][np.abs(neck['z'] - c) < 0.012 * np.ptp(neck['z'])]); cu = neck['cuts'][::-1]; PIV['head'] = at_(cu[0]); PAR['head'] = rings[0]
        for i_ in range(1, len(rings)):
            PIV[rings[i_]] = at_(cu[i_]); PAR[rings[i_]] = rings[i_ - 1]
    for n in ('head', 'jaw'):
        if n in MESH and not rings:
            PIV[n] = near(n, 'thorax'); PAR[n] = 'thorax'
    if 'abd' in MESH:
        PIV['abd'] = near('abd', 'thorax'); PAR['abd'] = 'thorax'
    if 'abd2' in MESH:
        PIV['abd2'] = near('abd2', 'abd'); PAR['abd2'] = 'abd'
    if spec.get('swap'):      # a beetle's head and wing cases swap: the same joint as below, at each neck
        xm = C[face == blobs[1], 0].mean(); mid = lambda f: np.array([xm, C[f, 1].mean(), C[f, 2].mean()]); at = lambda c: mid(neck['t'][np.abs(neck['z'] - c) < 0.012 * np.ptp(neck['z'])])
        PIV['abd'], PIV['head'] = at(neck['cuts'][0]), at(neck['cuts'][1])
    if spec.get('pedicel'):      # parts that swap join at the middle of their cut, on the midline: the closest pair of points can lie to one side, and a part from another spider would sit off centre
        xm = C[face == blobs[0], 0].mean(); mid = lambda f: np.array([xm, C[f, 1].mean(), C[f, 2].mean()])
        if 'jaw' in MESH:
            PIV['jaw'] = mid(jawcut)
        PIV['abd'] = mid(neck['t'][np.abs(neck['z'] - neck['cuts'][0]) < 0.012 * np.ptp(neck['z'])])
    trunk = ['head'] + rings if rings else ['thorax'] if spec.get('pedicel') or spec.get('swap') else [n for n in ('thorax', 'head', 'abd', 'abd2') if n in MESH]; TR = {n: cKDTree(MESH[n][0]) for n in trunk}
    for nm, g in LEG.items():
        PIV[nm] = g['hip']; PAR[nm] = min(trunk, key=lambda n: TR[n].query(g['hip'])[0]); print(nm, 'hangs from', PAR[nm])
        PIV[nm + 't'] = g['knee']; PAR[nm + 't'] = nm
        if g['held']:
            continue
        PIV[nm + 'f'] = g['ankle']; PAR[nm + 'f'] = nm + 't'
    if spec.get('wings'):      # never cut from the body: cards on their own hinges, folded back at rest (PLAN-MESHY.md, section 1)
        Tv = MESH['thorax'][0]; z0, z1 = Tv[:, 2].min(), Tv[:, 2].max(); span = np.ptp(P[:, 2])
        for tag, zf, sp, ch in (('wing', .62, .5, .17), ('wing2', .34, .38, .13)):
            q = Tv[np.abs(Tv[:, 2] - (z0 + zf * (z1 - z0))) < .1 * (z1 - z0)]; q = q[q[:, 1] > np.quantile(q[:, 1], .55)]; hx = np.quantile(np.abs(q[:, 0]), .8); hy = np.quantile(q[:, 1], .75)
            for sd, sg in (('L', 1), ('R', -1)):
                MESH[tag + sd] = wing_card(np.array([sg * hx, hy, z0 + zf * (z1 - z0)]), sg, sp * span, ch * span); PIV[tag + sd] = np.array([sg * hx, hy, z0 + zf * (z1 - z0)]); PAR[tag + sd] = 'thorax'
    ORDER = (rings[:1] + ['head'] + rings[1:] if rings else ['thorax'] + [n for n in ('head', 'jaw', 'abd', 'abd2') if n in MESH]) + sorted(n for n in MESH if n.startswith(('leg', 'arm', 'wing')))
    level = neck['tilt'] if spec.get('level') and neck else None
    write_glb(a, d, J, BIN, MESH, PIV, PAR, ORDER, LEG, float(P[:, 1].min()), H, np.ptp(P[:, 2]), level, bool(rings), spec.get('crouch', 0))


# ---------------------------------------------------------------- rotation helpers and the clips
def mat2q(R):
    t = np.trace(R)
    if t > 0:
        s = np.sqrt(t + 1) * 2; q = [(R[2, 1] - R[1, 2]) / s, (R[0, 2] - R[2, 0]) / s, (R[1, 0] - R[0, 1]) / s, s / 4]
    else:
        i = int(np.argmax(np.diag(R))); j, k = (i + 1) % 3, (i + 2) % 3; s = np.sqrt(R[i, i] - R[j, j] - R[k, k] + 1) * 2
        q = [0, 0, 0, 0]; q[i] = s / 4; q[j] = (R[j, i] + R[i, j]) / s; q[k] = (R[k, i] + R[i, k]) / s; q[3] = (R[k, j] - R[j, k]) / s
    q = np.array(q); return q / np.linalg.norm(q)


def fr(x, pole):
    x = x / np.linalg.norm(x); z = np.cross(x, pole); z /= np.linalg.norm(z) + 1e-12; return np.array([x, np.cross(z, x), z]).T


def ik(g, target):
    """(femur world rotation, tibia world rotation) that put the ankle at target; the knee bends as it does at rest"""
    H, K0, A0 = g['hip'], g['knee'], g['ankle']; a, b = np.linalg.norm(K0 - H), np.linalg.norm(A0 - K0); to = target - H; dst = min(np.linalg.norm(to), (a + b) * 0.998)
    dirn = to / (np.linalg.norm(to) + 1e-12); x = (a * a - b * b + dst * dst) / (2 * dst); h = np.sqrt(max(a * a - x * x, 0))
    pole0 = (K0 - H) - dirn * ((K0 - H) @ dirn)
    if np.linalg.norm(pole0) < 1e-6:
        pole0 = np.array([0, 1.0, 0.0]) - dirn * dirn[1]
    pole = pole0 / np.linalg.norm(pole0); K = H + dirn * x + pole * h
    side0 = np.cross(K0 - H, A0 - K0); F0 = fr(K0 - H, A0 - K0); T0 = fr(A0 - K0, K0 - H)
    F1 = fr(K - H, target - K); T1 = fr(target - K, K - H)
    return F1 @ F0.T, T1 @ T0.T


def wing_card(at, sg, span, chord, nu=10):
    """(positions, normals, uvs, tris) of one wing, a flat rounded blade running out along x from its hinge, every corner its own vertex as bake_part returns them"""
    ts = np.linspace(0, 1, nu + 1); e = np.sqrt(np.maximum(1 - ts ** 3, 0)); lead, trail = .34 * chord * e, -.66 * chord * e * (.45 + .55 * np.sin(np.pi * np.minimum(ts * 1.1, 1) * .5 + .4))
    V = [(sg * t * span, 0, z) for t, a_, b_ in zip(ts, lead, trail) for z in (a_, b_)]; U = [(t, v) for t in ts for v in (0, 1)]; pos, uv = [], []
    for i in range(nu):
        for q in ((2 * i, 2 * i + 1, 2 * i + 3), (2 * i, 2 * i + 3, 2 * i + 2)):
            q = q if sg > 0 else q[::-1]
            pos += [V[j] for j in q]; uv += [U[j] for j in q]
    pos = np.array(pos, float) + at; return pos, np.tile([0, 1.0, 0], (len(pos), 1)), np.array(uv, float), len(pos) // 3


def write_glb(a, d, J, BIN, MESH, PIV, PAR, ORDER, LEG, ground, H, L, level=None, chain=False, crouch=0):
    blob = bytearray(); BV = []; AC = []

    def add_bv(data, target=None):
        while len(blob) % 4:
            blob.append(0)
        bv = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(data)}
        if target:
            bv['target'] = target
        blob.extend(data); BV.append(bv); return len(BV) - 1

    def add_acc(arr, typ, ct, target=None, mm=False):
        ac = {'bufferView': add_bv(arr.tobytes(), target), 'componentType': ct, 'count': len(arr), 'type': typ}
        if mm:
            ac['min'] = np.atleast_1d(arr.min(0)).tolist(); ac['max'] = np.atleast_1d(arr.max(0)).tolist()
        AC.append(ac); return len(AC) - 1
    imgs = []
    for im in J['images']:
        v = J['bufferViews'][im['bufferView']]; imgs.append({'mimeType': im['mimeType'], 'bufferView': add_bv(BIN[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])})
    meshes, nodes, idx = [], [{'name': 'creature', 'children': [1]}], {}
    for n in ORDER:
        pos, nrm, uv, _ = MESH[n]; pos = pos - PIV[n]
        key = np.round(np.c_[pos, uv, nrm], 5); _, fi, iv = np.unique(key, axis=0, return_index=True, return_inverse=True); iv = iv.reshape(-1)
        pa = add_acc(pos[fi].astype('<f4'), 'VEC3', 5126, 34962, True); na = add_acc(nrm[fi].astype('<f4'), 'VEC3', 5126, 34962); ua = add_acc(uv[fi].astype('<f4'), 'VEC2', 5126, 34962); ia = add_acc(iv.astype('<u4'), 'SCALAR', 5125, 34963)
        meshes.append({'name': n, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'TEXCOORD_0': ua}, 'indices': ia, 'mode': 4, 'material': 0}]})
        idx[n] = len(nodes); nodes.append({'name': n, 'mesh': len(meshes) - 1, 'translation': [float(x) for x in (PIV[n] - (PIV[PAR[n]] if n in PAR else 0))]})
    for n in ORDER:
        if n in PAR:
            nodes[idx[PAR[n]]].setdefault('children', []).append(idx[n])
    T_WALK, DUTY = (1.2, 0.7) if chain else (1.0, 0.6); STRIDE = (0.05 if chain else 0.2) * L; LIFT = 0.06 * H; I3 = np.eye(3); WAVE = 0.11      # a chain's legs go in a wave, this share of a stride behind the pair in front

    def qa(axis, an):
        q = np.zeros(4); q[:3] = np.asarray(axis, float) * np.sin(an / 2); q[3] = np.cos(an / 2); return q
    # a body generated nose up is levelled in every clip: the trunk turns about the thorax's pivot and the legs reach back to their own feet
    ct, st = (np.cos(level), np.sin(level)) if level is not None else (1.0, 0.0)
    LV = np.array([[1, 0, 0], [0, ct, -st], [0, st, ct]]); Tc = PIV[ORDER[0]]; hipY = np.mean([g['hip'][1] for g in LEG.values() if not g['held']])
    lift_body = hipY - np.mean([(LV @ (g['hip'] - Tc) + Tc)[1] for g in LEG.values() if not g['held']]) if level is not None else 0.0
    DROP = np.array([0, lift_body - crouch * H, 0.0])      # a leg generated nearly straight has no stride in it: the body is carried this much lower, and the knees take it up
    def reach(g):      # how far a foot can go fore and aft of its rest place before the leg runs out: a leg nearly straight at rest cannot take a full stride, and an overreached foot slides
        r_ = .97 * (np.linalg.norm(g['knee'] - g['hip']) + np.linalg.norm(g['ankle'] - g['knee'])); v_ = g['ankle'] - g['hip'] - DROP; return np.sqrt(max(r_ * r_ - v_[0] ** 2 - v_[1] ** 2, 0)) - abs(v_[2])
    STRIDE = min(STRIDE, 2 * max(min(reach(g) for g in LEG.values() if not g['held']), .01 * L))
    to_trunk = lambda w: LV.T @ (w - Tc - DROP) + Tc      # a world point in the trunk's frame at rest

    def leg_q(nm, u):
        g = LEG[nm]; half = STRIDE / 2; T0 = g['toe']; A0 = g['ankle']
        if u < DUTY:
            z = half * (1 - 2 * u / DUTY); y = 0.0
        else:
            s = (u - DUTY) / (1 - DUTY); z = -half + STRIDE * (0.5 - 0.5 * np.cos(np.pi * s)); y = LIFT * np.sqrt(np.sin(np.pi * s))      # off the ground at once: a foot that creeps up is still planted while it moves
        target = to_trunk(A0 + np.array([0, y, z]))
        R1, R2 = ik(g, target); return R1, R2

    fly = [False]

    def wing(nm, ph):
        """folded back along the abdomen, or beating; a hind wing a little behind its fore wing"""
        sg = 1 if nm.endswith('L') else -1; hind = nm.startswith('wing2')
        a_, b_ = (0.85 * np.sin(2 * np.pi * (ph - (0.08 if hind else 0))) + 0.2, 0.2 + 0.12 * np.cos(2 * np.pi * ph)) if fly[0] else (0.06, 1.47 if hind else 1.42)
        ca, sa, cb, sb = np.cos(sg * a_), np.sin(sg * a_), np.cos(sg * b_), np.sin(sg * b_); return mat2q(np.array([[ca, -sa, 0], [sa, ca, 0], [0, 0, 1]]) @ np.array([[cb, 0, sb], [0, 1, 0], [-sb, 0, cb]]))

    def pose(nm, ph, walkit):
        if nm.startswith('wing'):
            return wing(nm, ph)
        m_ = re.match(r'leg\d+[LR]?|arm[LR]', nm); base = m_.group() if m_ else nm
        if base in LEG:
            g = LEG[base]; tri = (g['i'] + (0 if g['sd'] == 'L' else 1)) % 2
            u = ((ph + 0.5 * (g['sd'] == 'R') - WAVE * g['i']) if chain else (ph + 0.5 * tri)) % 1.0
            if g['held'] or (not walkit and level is None and not crouch):
                return np.array([0, 0, 0, 1.0])
            R1, R2 = leg_q(base, u) if walkit else ik(g, to_trunk(g['ankle']))
            if nm == base:
                return mat2q(R1)
            if nm.endswith('t'):
                return mat2q(R1.T @ R2)
            return mat2q(R2.T @ LV.T)      # the tarsus keeps its rest attitude in the world
        if nm == 'thorax' and level is not None:
            return mat2q(LV)
        if nm == 'head':
            return qa([0, 1, 0], (0 if chain or (walkit and any(PAR.get(n) == 'head' for n in LEG)) else 0.05 if walkit else 0.1) * np.sin(2 * np.pi * ph))      # still while any legs hang from it
        if nm == 'abd' and not walkit:      # still in the walk: legs may hang from it, and its sway would drag their feet
            return qa([0, 1, 0], 0.03 * np.sin(2 * np.pi * (ph + 0.25)))
        return np.array([0, 0, 0, 1.0])

    def clip(name, T, walkit, n, extras=None):
        t = (np.arange(n + 1) / n * T).astype('<f4'); sam, ch = [], []
        for nm in ORDER:
            q = np.array([pose(nm, k / n, walkit) for k in range(n + 1)], '<f4')
            if np.allclose(q, [0, 0, 0, 1], atol=1e-6):
                continue
            sam.append({'input': add_acc(t, 'SCALAR', 5126, None, True), 'output': add_acc(q, 'VEC4', 5126), 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[nm], 'path': 'rotation'}})
        if level is not None or crouch:
            p0 = np.array(nodes[idx[ORDER[0]]]['translation'], float) + DROP; sam.append({'input': add_acc(t, 'SCALAR', 5126, None, True), 'output': add_acc(np.tile(p0, (n + 1, 1)).astype('<f4'), 'VEC3', 5126), 'interpolation': 'LINEAR'}); ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[ORDER[0]], 'path': 'translation'}})
        c = {'name': name, 'samplers': sam, 'channels': ch}
        if extras:
            c['extras'] = extras
        return c

    def strike(nm, ph):
        """a mantis's strike: a small draw back, the forelegs thrown forward and open, the tibia snapped shut, a slow return"""
        sm = lambda a_, b_, x: (lambda q: q * q * (3 - 2 * q))(min(1.0, max(0.0, (x - a_) / (b_ - a_))))
        if nm in ('armL', 'armR'):
            e = -0.15 * sm(0, 0.16, ph) + 1.15 * sm(0.16, 0.28, ph) - sm(0.5, 0.95, ph); return qa([1, 0, 0], e)      # + swings a raised foreleg down and forward, past the face
        if nm in ('armLt', 'armRt'):
            g = LEG[nm[:4]]; n_ = np.cross(g['knee'] - g['hip'], g['ankle'] - g['knee']); n_ /= np.linalg.norm(n_) + 1e-12
            return qa(n_, -1.5 * (sm(0.14, 0.27, ph) - sm(0.33, 0.42, ph)))
        return np.array([0, 0, 0, 1.0])
    SPEED = STRIDE / (DUTY * T_WALK)
    anims = [clip('perch', 4.0, False, 24), clip('walk', T_WALK, True, 48 if chain else 36, {'speed': float(SPEED), 'stride': float(STRIDE), 'duty': DUTY, 'ground': ground, 'note': 'a tripod gait, in place: drive the root forward at speed'})]
    if any(n.startswith('wing') for n in ORDER):
        fly[0] = True; anims.append(clip('flap', 0.16, False, 12)); fly[0] = False
    if any(g['held'] for g in LEG.values()):
        idle_pose, pose_ = pose, pose
        pose = lambda nm, ph, w: strike(nm, ph) if nm.startswith('arm') else idle_pose(nm, 0.0, False)
        anims.append(clip('strike', 1.2, False, 48))
    out = {'asset': {'version': '2.0', 'generator': 'rig/arthro.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': nodes, 'meshes': meshes, 'materials': J['materials'][:1], 'textures': J['textures'], 'images': imgs, 'bufferViews': BV, 'accessors': AC, 'animations': anims, 'buffers': [{'byteLength': len(blob)}]}
    if J.get('samplers'):
        out['samplers'] = J['samplers']
    js = json.dumps(out, separators=(',', ':')).encode()
    while len(js) % 4:
        js += b' '
    while len(blob) % 4:
        blob.append(0)
    path = os.path.join(d, 'rig-%s.glb' % a.candidate)
    with open(path, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob))
    print('wrote', path, 'speed %.3f stride %.3f' % (SPEED, STRIDE))


if __name__ == '__main__':
    main()
