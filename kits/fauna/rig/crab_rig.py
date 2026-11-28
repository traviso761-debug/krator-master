#!/usr/bin/env python3
"""Cut and rig the Meshy Giant Land Crab into rigid closed parts with articulated pincer dactyls:

    python rig/crab_rig.py [giant-land-crab] [meshy]

Produces rig/sources/<key>/rig-<candidate>.glb ready for models_pack.py:
  - Closed carapace/cephalothorax ('thorax'), eyestalk/mouthpart front ('head'), tucked apron ('abd')
  - 8 two-segment walking legs ('leg0L'/'leg0Lt' .. 'leg3R'/'leg3Rt') grounded at y = 0 with a planted
    alternating-tetrapod 'walk' clip, 'perch' idle clip, and 'strike' pincer-snap clip
  - 2 three-segment cheliped pincer arms ('armL' -> 'armLt' -> 'pincerL', 'armR' -> 'armRt' -> 'pincerR')
    where 'pincerL' and 'pincerR' are the upper movable dactyls hinged at the claw knuckle.

Uses pure NumPy/SciPy/trimesh Garland-Heckbert QEM simplification (no external C-extension DLL needed)
and caps every open boundary loop so every part is a watertight shell in all poses.
"""
import argparse
import heapq
import json
import os
import re
import struct
import sys
import numpy as np
import trimesh
from scipy import ndimage
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components, dijkstra
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))


def load_glb(path):
    b = open(path, 'rb').read()
    jl = struct.unpack('<I', b[12:16])[0]
    J = json.loads(b[20:20 + jl])
    BIN = b[20 + jl + 8:]

    def acc(i):
        a = J['accessors'][i]
        v = J['bufferViews'][a['bufferView']]
        n = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]
        dt = {5126: '<f4', 5125: '<u4', 5123: '<u2'}[a['componentType']]
        st = v.get('byteStride') or np.dtype(dt).itemsize * n
        if st != np.dtype(dt).itemsize * n:
            raw = np.frombuffer(BIN, np.uint8, a['count'] * st, v.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, st)
            return np.frombuffer(raw[:, :np.dtype(dt).itemsize * n].tobytes(), dt).reshape(-1, n).copy()
        return np.frombuffer(BIN, dt, a['count'] * n, v.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, n).copy()

    def mat4(n):
        if 'matrix' in n:
            return np.array(n['matrix'], float).reshape(4, 4).T
        M = np.eye(4)
        x, y, z, w = n.get('rotation', [0, 0, 0, 1])
        s = n.get('scale', [1, 1, 1])
        M[:3, :3] = np.array([
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
        ]) @ np.diag(s)
        M[:3, 3] = n.get('translation', [0, 0, 0])
        return M

    Ps, Ns, Us, Fs, base = [], [], [], [], 0

    def walk(i, W):
        nonlocal base
        n = J['nodes'][i]
        M = W @ mat4(n)
        if 'mesh' in n:
            for pr in J['meshes'][n['mesh']]['primitives']:
                at = pr['attributes']
                p = acc(at['POSITION']).astype(float)
                nn = acc(at['NORMAL']).astype(float) if 'NORMAL' in at else None
                Ps.append(p @ M[:3, :3].T + M[:3, 3])
                Us.append(acc(at['TEXCOORD_0']).astype(float))
                Ns.append(None if nn is None else nn @ np.linalg.inv(M[:3, :3]))
                Fs.append(acc(pr['indices']).reshape(-1, 3).astype(np.int64) + base)
                base += len(p)
        for c in n.get('children', []):
            walk(c, M)

    for r in J['scenes'][J.get('scene', 0)]['nodes']:
        walk(r, np.eye(4))
    P = np.vstack(Ps)
    F = np.vstack(Fs)
    UV = np.vstack(Us)
    N = np.vstack(Ns) if all(n is not None for n in Ns) else trimesh.Trimesh(P, F, process=False).vertex_normals.copy()
    N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-12
    return J, BIN, P, N, UV, F


def weld(P):
    tol = max(np.ptp(P, axis=0).max() * 2e-5, 1e-7)
    return np.unique(np.round(P / tol), axis=0, return_inverse=True)[1].reshape(-1)


def comps(F, sel, W):
    Fs = W[F[sel]]
    if not len(Fs):
        return np.zeros(0, np.int32)
    n = W.max() + 1
    g = coo_matrix((np.ones(len(Fs) * 3), (np.r_[Fs[:, 0], Fs[:, 1], Fs[:, 2]], np.r_[Fs[:, 1], Fs[:, 2], Fs[:, 0]])), shape=(n, n))
    return connected_components(g, directed=False)[1][Fs[:, 0]]


def largest_comp(F, f_idx, W):
    if len(f_idx) <= 1:
        return f_idx
    sel = np.zeros(len(F), bool)
    sel[f_idx] = True
    f_sorted = np.where(sel)[0]
    lb = comps(F, sel, W)
    ids, cnt = np.unique(lb, return_counts=True)
    return f_sorted[lb == ids[cnt.argmax()]]


def qem_simplify(V, F, target_faces):
    """Pure Python/NumPy Garland-Heckbert Quadric Error Metric simplifier with boundary preservation."""
    V = V.astype(np.float64).copy()
    F = F.astype(np.int64).copy()
    if len(F) <= target_faces:
        return V, F

    nv = len(V)
    nf = len(F)

    # Plane equations per face: n.x * x + n.y * y + n.z * z + d = 0
    v0, v1, v2 = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    cr = np.cross(v1 - v0, v2 - v0)
    area2 = np.linalg.norm(cr, axis=1)
    nrm = cr / (area2[:, None] + 1e-15)
    d = -(nrm * v0).sum(1)
    pl = np.c_[nrm, d]
    # Weight by triangle area so tiny slivers collapse first and broad silhouette plates stay crisp
    K = pl[:, :, None] * pl[:, None, :] * (area2[:, None, None] + 1e-9)

    Q = np.zeros((nv, 4, 4), dtype=np.float64)
    for c in range(3):
        np.add.at(Q, F[:, c], K)

    # Boundary edges: add strong perpendicular penalty planes so open cut rims stay round & clean
    edges_dir = np.vstack([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    f_of_e = np.repeat(np.arange(nf), 3)
    ekey = np.sort(edges_dir, axis=1)
    _, inv, cnt = np.unique(ekey, axis=0, return_inverse=True, return_counts=True)
    bnd_mask = cnt[inv.reshape(-1)] == 1
    if bnd_mask.any():
        be = edges_dir[bnd_mask]
        bf = f_of_e[bnd_mask]
        ev = V[be[:, 1]] - V[be[:, 0]]
        bn = np.cross(ev, nrm[bf])
        bl = np.linalg.norm(bn, axis=1, keepdims=True) + 1e-15
        bn /= bl
        bd = -(bn * V[be[:, 0]]).sum(1)
        bpl = np.c_[bn, bd]
        BK = bpl[:, :, None] * bpl[:, None, :] * (np.linalg.norm(ev, axis=1)[:, None, None] * 12.0)
        np.add.at(Q, be[:, 0], BK)
        np.add.at(Q, be[:, 1], BK)

    v_faces = [set() for _ in range(nv)]
    for fi in range(nf):
        a, b, c = int(F[fi, 0]), int(F[fi, 1]), int(F[fi, 2])
        v_faces[a].add(fi)
        v_faces[b].add(fi)
        v_faces[c].add(fi)

    alive_f = np.ones(nf, dtype=bool)
    alive_v = np.ones(nv, dtype=bool)
    ver = np.zeros(nv, dtype=np.int32)

    def edge_cost(u, w):
        Qsum = Q[u] + Q[w]
        # Candidate points: midpoint, u, w (robust against ill-conditioned matrices and zero-inversion)
        mid = 0.5 * (V[u] + V[w])
        best_p = mid
        best_c = 1e30
        A = Qsum[:3, :3]
        rhs = -Qsum[:3, 3]
        det = np.linalg.det(A)
        cands = [mid, V[u], V[w]]
        if abs(det) > 1e-12:
            try:
                opt = np.linalg.solve(A, rhs)
                if np.linalg.norm(opt - mid) <= 1.2 * np.linalg.norm(V[u] - V[w]):
                    cands.insert(0, opt)
            except np.linalg.LinAlgError:
                pass
        for p in cands:
            hp = np.array([p[0], p[1], p[2], 1.0])
            c = float(hp @ Qsum @ hp)
            if c < best_c:
                best_c = c
                best_p = p
        # Tiny edge-length tie-breaker keeps triangulation uniform
        best_c += 1e-5 * float(np.sum((V[u] - V[w]) ** 2))
        return best_c, best_p

    u_edges = np.unique(ekey, axis=0)
    heap = []
    seq = 0
    for u, w in u_edges:
        u, w = int(u), int(w)
        if u == w:
            continue
        c, p = edge_cost(u, w)
        heap.append((c, seq, u, w, 0, 0, p))
        seq += 1
    heapq.heapify(heap)

    cur_faces = nf
    while cur_faces > target_faces and heap:
        cost, _, u, w, vu, vw, p = heapq.heappop(heap)
        if not (alive_v[u] and alive_v[w]) or ver[u] != vu or ver[w] != vw or u == w:
            continue

        # Link condition / normal-flip guard: reject collapse if any surviving adjacent triangle flips normal
        shared = v_faces[u] & v_faces[w]
        only_u = v_faces[u] - shared
        only_w = v_faces[w] - shared

        # Check non-manifold link condition: common neighbors besides shared faces
        nbr_u, nbr_w = set(), set()
        for fi in v_faces[u]:
            for vx in F[fi]:
                if vx != u:
                    nbr_u.add(int(vx))
        for fi in v_faces[w]:
            for vx in F[fi]:
                if vx != w:
                    nbr_w.add(int(vx))
        if len(nbr_u & nbr_w) > len(shared) + 1:
            continue

        flipped = False
        for subset, old_v in ((only_u, u), (only_w, w)):
            for fi in subset:
                tri = F[fi]
                pa = p if tri[0] == old_v else V[tri[0]]
                pb = p if tri[1] == old_v else V[tri[1]]
                pc = p if tri[2] == old_v else V[tri[2]]
                old_n = np.cross(V[tri[1]] - V[tri[0]], V[tri[2]] - V[tri[0]])
                new_n = np.cross(pb - pa, pc - pa)
                nn_len = np.linalg.norm(new_n)
                if nn_len < 1e-13 or (old_n @ new_n) < 0.15 * np.linalg.norm(old_n) * nn_len:
                    flipped = True
                    break
            if flipped:
                break
        if flipped:
            continue

        # Commit collapse w -> u at position p
        V[u] = p
        Q[u] = Q[u] + Q[w]
        alive_v[w] = False
        ver[u] += 1

        for fi in list(shared):
            if alive_f[fi]:
                alive_f[fi] = False
                cur_faces -= 1
                for vx in F[fi]:
                    v_faces[int(vx)].discard(fi)

        for fi in list(only_w):
            tri = F[fi]
            for k in range(3):
                if tri[k] == w:
                    tri[k] = u
            v_faces[u].add(fi)
        v_faces[w].clear()

        nbrs = set()
        for fi in v_faces[u]:
            for vx in F[fi]:
                vx = int(vx)
                if vx != u and alive_v[vx]:
                    nbrs.add(vx)
        for nb in nbrs:
            a_, b_ = (u, nb) if u < nb else (nb, u)
            c_new, p_new = edge_cost(a_, b_)
            heapq.heappush(heap, (c_new, seq, a_, b_, ver[a_], ver[b_], p_new))
            seq += 1

    F_out = F[alive_f]
    F_out = F_out[(F_out[:, 0] != F_out[:, 1]) & (F_out[:, 1] != F_out[:, 2]) & (F_out[:, 0] != F_out[:, 2])]
    used = np.unique(F_out)
    rm = -np.ones(nv, dtype=np.int64)
    rm[used] = np.arange(len(used))
    return V[used], rm[F_out]


def surface_points(P, F, h):
    t = P[F]
    a = np.linalg.norm(np.cross(t[:, 1] - t[:, 0], t[:, 2] - t[:, 0]), axis=1) / 2
    n = np.minimum((a / (h * h) * 3).astype(int) + 1, 200)
    idx = np.repeat(np.arange(len(F)), n)
    rng = np.random.default_rng(1)
    u = rng.random((len(idx), 2))
    fl = u.sum(1) > 1
    u[fl] = 1 - u[fl]
    return t[idx, 0] + (t[idx, 1] - t[idx, 0]) * u[:, :1] + (t[idx, 2] - t[idx, 0]) * u[:, 1:]


def boundary_caps(V, Fq, dome=0.08, toward=None):
    """Close every open boundary loop (splitting figure-8 pinch vertices cleanly)."""
    E = np.vstack([Fq[:, [0, 1]], Fq[:, [1, 2]], Fq[:, [2, 0]]])
    key = np.sort(E, axis=1)
    _, inv, cnt = np.unique(key, axis=0, return_inverse=True, return_counts=True)
    open_ = E[cnt[inv.reshape(-1)] == 1]
    nxt = {}
    for a, b in open_:
        nxt.setdefault(int(b), []).append(int(a))
    addV, addF, base = [], [], len(V)

    def emit_loop(lp):
        if len(lp) < 3:
            return
        pts_l = V[lp]
        m = pts_l.mean(0)
        p_cur = pts_l - m
        p_nxt = np.roll(p_cur, -1, axis=0)
        nl = np.cross(p_cur, p_nxt).sum(0)
        nlen = np.linalg.norm(nl)
        if toward is not None:
            m = m + 0.30 * (np.asarray(toward, float) - m)
        elif nlen > 1e-12 and dome != 0.0:
            r_loop = np.mean(np.linalg.norm(p_cur, axis=1))
            m = m + (nl / nlen) * (dome * r_loop)
        idx_m = base + len(addV)
        addV.append(m)
        for k in range(len(lp)):
            addF.append([lp[k], lp[(k + 1) % len(lp)], idx_m])

    for s in list(nxt):
        while nxt.get(s):
            trail = [s]
            pos_map = {s: 0}
            a = s
            while nxt.get(a):
                b = nxt[a].pop()
                if b in pos_map:
                    k0 = pos_map[b]
                    emit_loop(trail[k0:])
                    for gone in trail[k0 + 1:]:
                        pos_map.pop(gone, None)
                    trail = trail[:k0 + 1]
                    a = b
                    if a == s and not nxt.get(a):
                        break
                else:
                    pos_map[b] = len(trail)
                    trail.append(b)
                    a = b
            if len(trail) >= 3:
                emit_loop(trail)

    return (np.array(addV) if addV else np.zeros((0, 3))), (np.array(addF, np.int64) if addF else np.zeros((0, 3), np.int64))


def bake_part(P, N, UV, F, target, pre_cap=False, dome=0.08, toward=None):
    """Simplify part to target faces, transfer UVs inside chart islands, smooth normals, and cap open loops."""
    W = weld(P)
    ids, first = np.unique(W, return_index=True)
    m = np.zeros(W.max() + 1, np.int64)
    m[ids] = np.arange(len(ids))
    Fw = m[W[F]]
    Fw = Fw[(Fw[:, 0] != Fw[:, 1]) & (Fw[:, 1] != Fw[:, 2]) & (Fw[:, 0] != Fw[:, 2])]
    Vw = P[first]

    if pre_cap:
        pV, pF = boundary_caps(Vw, Fw, dome=0.0, toward=toward)
        if len(pF):
            Vw = np.vstack([Vw, pV])
            Fw = np.vstack([Fw, pF])

    V2, F2 = qem_simplify(Vw, Fw, target)
    # Keep single dominant connected component on limbs/parts so C3 pieces == 0 always holds
    if len(F2) > 4:
        g2 = coo_matrix((np.ones(len(F2) * 3), (np.r_[F2[:, 0], F2[:, 1], F2[:, 2]], np.r_[F2[:, 1], F2[:, 2], F2[:, 0]])), shape=(len(V2),) * 2)
        _, vcomp = connected_components(g2, directed=False)
        fc = vcomp[F2[:, 0]]
        cids, ccnt = np.unique(fc, return_counts=True)
        # Keep strictly the dominant connected shell so zero floating slivers ever survive
        big_id = cids[ccnt.argmax()]
        keep_m = (fc == big_id)
        F2 = F2[keep_m]
        used = np.unique(F2)
        rm = -np.ones(len(V2), np.int64)
        rm[used] = np.arange(len(used))
        V2 = V2[used]
        F2 = rm[F2]

    OM = trimesh.Trimesh(P, F, process=False)
    _, isl = connected_components(
        coo_matrix((np.ones(len(F) * 3), (np.r_[F[:, 0], F[:, 1], F[:, 2]], np.r_[F[:, 1], F[:, 2], F[:, 0]])), shape=(len(P),) * 2),
        directed=False,
    )
    fisl = isl[F[:, 0]]
    cen = V2[F2].mean(1)
    _, _, tid = trimesh.proximity.closest_point(OM, cen)
    face_isl = fisl[tid]

    corner = V2[F2].reshape(-1, 3)
    cuv = np.zeros((len(corner), 2))
    cisl = np.repeat(face_isl, 3)
    for k in np.unique(cisl):
        sel = np.where(cisl == k)[0]
        fid = np.where(fisl == k)[0]
        sub = trimesh.Trimesh(P, F[fid], process=False)
        cp, _, t = trimesh.proximity.closest_point(sub, corner[sel])
        tri = F[fid[t]]
        bc = trimesh.triangles.points_to_barycentric(P[tri], cp)
        cuv[sel] = (UV[tri] * bc[:, :, None]).sum(1)

    ct = corner.reshape(-1, 3, 3)
    uvt = cuv.reshape(-1, 3, 2)
    e = uvt[:, 1] - uvt[:, 0]
    f = uvt[:, 2] - uvt[:, 0]
    ua = np.abs(e[:, 0] * f[:, 1] - e[:, 1] * f[:, 0]) / 2
    sa = np.linalg.norm(np.cross(ct[:, 1] - ct[:, 0], ct[:, 2] - ct[:, 0]), axis=1) / 2
    ratio = ua / (sa + 1e-12)
    bad = ratio > 6 * max(np.median(ratio[ratio > 0]), 1e-12) if (ratio > 0).any() else np.zeros(len(ratio), bool)
    if bad.any():
        cp, _, t = trimesh.proximity.closest_point(OM, ct[bad].mean(1))
        tri = F[t]
        bc = trimesh.triangles.points_to_barycentric(P[tri], cp)
        uvt[bad] = (UV[tri] * bc[:, :, None]).sum(1)[:, None, :]
        cuv = uvt.reshape(-1, 2)

    tm = trimesh.Trimesh(V2, F2, process=False)
    cn = tm.vertex_normals[F2].reshape(-1, 3).copy()
    fn = np.repeat(tm.face_normals, 3, axis=0)
    weak = np.linalg.norm(cn, axis=1) < 0.5
    cn[weak] = fn[weak]

    aV, aF = boundary_caps(V2, F2, dome=dome, toward=toward)
    if len(aF):
        V3 = np.vstack([V2, aV])
        T = cKDTree(V2)
        capc = V3[aF].reshape(-1, 3)
        _, nv = T.query(capc)
        rim = cKDTree(corner)
        _, nc = rim.query(V2[nv])
        n0 = np.cross(capc[1::3] - capc[0::3], capc[2::3] - capc[0::3])
        n0 /= np.linalg.norm(n0, axis=1, keepdims=True) + 1e-12
        inner = cuv.reshape(-1, 3, 2).mean(1)[nc[0::3] // 3]
        n0[np.linalg.norm(n0, axis=1) < 0.5] = [0, 1, 0]
        corner = np.vstack([corner, capc])
        cuv = np.vstack([cuv, np.repeat(inner, 3, axis=0)])
        cn = np.vstack([cn, np.repeat(n0, 3, axis=0)])
    return corner, cn, cuv, len(corner) // 3


def rot_axis(axis, angle):
    u = np.asarray(axis, float)
    u /= np.linalg.norm(u) + 1e-12
    c, s = np.cos(angle), np.sin(angle)
    K = np.array([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]])
    return np.eye(3) + s * K + (1 - c) * (K @ K)


def mat2q(R):
    t = np.trace(R)
    if t > 0:
        s = np.sqrt(t + 1) * 2
        q = [(R[2, 1] - R[1, 2]) / s, (R[0, 2] - R[2, 0]) / s, (R[1, 0] - R[0, 1]) / s, s / 4]
    else:
        i = int(np.argmax(np.diag(R)))
        j, k = (i + 1) % 3, (i + 2) % 3
        s = np.sqrt(R[i, i] - R[j, j] - R[k, k] + 1) * 2
        q = [0.0, 0.0, 0.0, 0.0]
        q[i] = s / 4
        q[j] = (R[j, i] + R[i, j]) / s
        q[k] = (R[k, i] + R[i, k]) / s
        q[3] = (R[k, j] - R[j, k]) / s
    q = np.array(q, float)
    return q / np.linalg.norm(q)


def qa(axis, an):
    q = np.zeros(4)
    u = np.asarray(axis, float)
    u /= np.linalg.norm(u) + 1e-12
    q[:3] = u * np.sin(an / 2)
    q[3] = np.cos(an / 2)
    return q


def fr(x, pole):
    x = x / (np.linalg.norm(x) + 1e-12)
    z = np.cross(x, pole)
    z /= np.linalg.norm(z) + 1e-12
    return np.array([x, np.cross(z, x), z]).T


def ik2(g, target):
    """Two-bone IK putting the lower leg's foot tip ('ankle' == 'toe') at target."""
    H, K0, A0 = g['hip'], g['knee'], g['toe']
    a, b = np.linalg.norm(K0 - H), np.linalg.norm(A0 - K0)
    to = target - H
    dst = min(np.linalg.norm(to), (a + b) * 0.998)
    dirn = to / (np.linalg.norm(to) + 1e-12)
    x = (a * a - b * b + dst * dst) / (2 * max(dst, 1e-9))
    h = np.sqrt(max(a * a - x * x, 0.0))
    pole0 = (K0 - H) - dirn * ((K0 - H) @ dirn)
    if np.linalg.norm(pole0) < 1e-6:
        pole0 = np.array([0.0, 1.0, 0.0]) - dirn * dirn[1]
    pole = pole0 / np.linalg.norm(pole0)
    K = H + dirn * x + pole * h
    F0 = fr(K0 - H, A0 - K0)
    T0 = fr(A0 - K0, K0 - H)
    F1 = fr(K - H, target - K)
    T1 = fr(target - K, K - H)
    return F1 @ F0.T, T1 @ T0.T


def walk_leg_chain_2seg(P, F, sel, trunkP):
    """Split a walking leg into upper merus (femur) and lower carpus-propodus-dactyl (tibia+tip) at its knee."""
    Fs = F[sel]
    W = weld(P)
    ids = np.unique(W[Fs])
    m = -np.ones(W.max() + 1, np.int64)
    m[ids] = np.arange(len(ids))
    Fw = m[W[Fs]]
    Vs = np.zeros((len(ids), 3))
    Vs[Fw.reshape(-1)] = P[Fs.reshape(-1)]
    e = np.vstack([Fw[:, [0, 1]], Fw[:, [1, 2]], Fw[:, [2, 0]]])
    d = np.linalg.norm(Vs[e[:, 0]] - Vs[e[:, 1]], axis=1) + 1e-9
    g = coo_matrix((np.r_[d, d], (np.r_[e[:, 0], e[:, 1]], np.r_[e[:, 1], e[:, 0]])), shape=(len(ids),) * 2).tocsr()
    td, _ = cKDTree(trunkP).query(Vs)
    rootv = np.argsort(td)[:max(6, len(Vs) // 60)]
    dist = dijkstra(g, indices=rootv, min_only=True)
    dist[~np.isfinite(dist)] = np.nanmax(dist[np.isfinite(dist)])
    s = dist / dist.max()

    # The crab knee is the outer/upper apex before the leg plunges downward to the tip
    nb = 28
    b = np.minimum((s * nb).astype(int), nb - 1)
    line = np.array([Vs[b == i].mean(0) if (b == i).any() else [np.nan] * 3 for i in range(nb)])
    ok = ~np.isnan(line[:, 0])
    idx = np.where(ok)[0]
    line = line[ok]
    a = line[2:] - line[:-2]
    c = line[4:] - line[2:-2] if len(line) > 6 else a
    k = min(len(a), len(c))
    u = a[:k] / (np.linalg.norm(a[:k], axis=1, keepdims=True) + 1e-12)
    w = c[:k] / (np.linalg.norm(c[:k], axis=1, keepdims=True) + 1e-12)
    bend = np.arccos(np.clip((u * w).sum(1), -1, 1))
    sb = (idx[2:2 + k] + 0.5) / nb
    in_r = (sb > 0.25) & (sb < 0.62)
    sk = float(sb[in_r][np.argmax(bend[in_r])]) if in_r.any() else 0.42

    band = 0.025
    fs = s[Fw].mean(1)
    fem = fs < sk + band
    tib = fs > sk - band
    hip = Vs[s < 0.06].mean(0)
    knee = Vs[np.abs(s - sk) < 0.035].mean(0)
    distal = Vs[s > 0.85]
    toe = distal[np.argmin(distal[:, 1])].copy()
    return fem, tib, hip, knee, toe, sk


def split_cheliped_3seg(P, F, arm_f, trunkP, W):
    """Split cheliped arm into:
       - armL/armR: upper merus/carpus (shoulder -> elbow)
       - armLt/armRt: claw propodus palm + lower fixed finger (elbow -> fixed tip)
       - pincerL/pincerR: upper movable serrated dactyl hinged at the dorsal claw knuckle!
    """
    C = P[F].mean(1)
    sd = 'L' if C[arm_f, 0].mean() > 0 else 'R'
    sgn = 1.0 if sd == 'L' else -1.0

    Fs = F[arm_f]
    ids = np.unique(W[Fs])
    m = -np.ones(W.max() + 1, np.int64)
    m[ids] = np.arange(len(ids))
    Fw = m[W[Fs]]
    Vs = np.zeros((len(ids), 3))
    Vs[Fw.reshape(-1)] = P[Fs.reshape(-1)]
    e = np.vstack([Fw[:, [0, 1]], Fw[:, [1, 2]], Fw[:, [2, 0]]])
    d = np.linalg.norm(Vs[e[:, 0]] - Vs[e[:, 1]], axis=1) + 1e-9
    g = coo_matrix((np.r_[d, d], (np.r_[e[:, 0], e[:, 1]], np.r_[e[:, 1], e[:, 0]])), shape=(len(ids),) * 2).tocsr()
    td, _ = cKDTree(trunkP).query(Vs)
    rootv = np.argsort(td)[:max(8, len(Vs) // 60)]
    dist = dijkstra(g, indices=rootv, min_only=True)
    dist[~np.isfinite(dist)] = np.nanmax(dist[np.isfinite(dist)])
    s = dist / dist.max()
    fs = s[Fw].mean(1)

    shoulder = Vs[s < 0.06].mean(0)
    # Outermost lateral elbow bend is around s = 0.46 (where |x| peaks ~ 0.67)
    el_mask = (s > 0.38) & (s < 0.54)
    elbow = Vs[el_mask][np.argmax(np.abs(Vs[el_mask, 0])) * 0 + np.arange(el_mask.sum())].mean(0)
    elbow = Vs[np.abs(s - 0.47) < 0.035].mean(0)

    lap_e = 0.025
    upper_m = fs < 0.47 + lap_e
    fore_all_m = fs > 0.47 - lap_e

    fore_f = arm_f[fore_all_m]
    cf = C[fore_f]
    ax = np.abs(cf[:, 0])

    # Pincer dactyl cleft line: V-cleft vertex sits at (|x| = 0.335, y = 1.196, z = 0.455).
    # For |x| < 0.355 and z > 0.38, faces above the open jaw cleft belong to the movable upper dactyl!
    # The knuckle cut rises steeply from (|x|=0.335, y=1.196) to the dorsal knuckle condyle (|x|=0.362, y=1.315).
    y_cleft = np.where(
        ax <= 0.340,
        1.192 - 0.10 * (0.340 - ax),          # passes cleanly through empty air of the V-gap!
        1.192 + 3.60 * (ax - 0.340),          # slices cleanly across the dorsal knuckle neck!
    )
    dactyl_cand = (ax < 0.388) & (cf[:, 2] > 0.36) & (cf[:, 1] > y_cleft)
    dactyl_f = largest_comp(F, fore_f[dactyl_cand], W)

    # Small knuckle overlap band at the hinge neck (ax >= 0.335) so opening +45 deg never exposes a gap or inner-tip sliver
    knuckle_band = (ax >= 0.335) & (ax < 0.392) & (cf[:, 2] > 0.35) & (np.abs(cf[:, 1] - y_cleft) < 0.015)
    palm_f = np.setdiff1d(fore_f, dactyl_f)
    palm_f = largest_comp(F, np.union1d(palm_f, fore_f[knuckle_band]), W)
    dactyl_f = largest_comp(F, np.union1d(dactyl_f, fore_f[knuckle_band]), W)
    upper_f = largest_comp(F, arm_f[upper_m], W)

    # Knuckle hinge pivot sits at the middle of the knuckle cut between palm and movable dactyl
    knuckle_pts = C[np.intersect1d(palm_f, dactyl_f)]
    if len(knuckle_pts) >= 3:
        knuckle = knuckle_pts.mean(0)
    else:
        d_palm, i_palm = cKDTree(C[palm_f]).query(C[dactyl_f])
        k_idx = int(np.argmin(d_palm))
        knuckle = 0.5 * (C[dactyl_f][k_idx] + C[palm_f][i_palm[k_idx]])

    dactyl_tip = C[dactyl_f][np.argmin(np.abs(C[dactyl_f, 0]))]
    print('  cheliped arm%s: upper=%d palm=%d pincer=%d shoulder=%s elbow=%s knuckle=%s tip=%s' % (
        sd, len(upper_f), len(palm_f), len(dactyl_f),
        shoulder.round(3), elbow.round(3), knuckle.round(3), dactyl_tip.round(3)
    ))
    return sd, upper_f, palm_f, dactyl_f, shoulder, elbow, knuckle


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('key', nargs='?', default='giant-land-crab')
    ap.add_argument('candidate', nargs='?', default='meshy')
    a = ap.parse_args()

    d = os.path.join(HERE, 'sources', a.key)
    spec = json.load(open(os.path.join(d, 'spec.json'), encoding='utf-8'))
    B = spec['budget']

    raw_path = os.path.join(d, 'raw-%s.glb' % a.candidate)
    J, BIN, P, N, UV, F = load_glb(raw_path)
    print('Loaded %s: %d tris, %d verts' % (raw_path, len(F), len(P)))

    vol = trimesh.Trimesh(P, F, process=False).volume
    if vol < 0:
        F = F[:, ::-1]
        print('Flipped negative volume winding')

    # Shift floor to y = 0; raw-meshy.glb is already +Z forward, +Y up, +X animal's left!
    P = P.copy()
    P[:, 0] -= 0.5 * (P[:, 0].min() + P[:, 0].max())
    P[:, 1] -= P[:, 1].min()
    H = float(np.ptp(P[:, 1]))
    L = float(np.ptp(P, axis=0).max())

    # Voxel opening at r = spec['open'] (18.0) separates trunk from limbs cleanly
    h = L / 240.0
    lo = P.min(0)
    q = np.floor((surface_points(P, F, h) - lo) / h).astype(int) + 8
    G = np.zeros(q.max(0) + 9, bool)
    G[q[:, 0], q[:, 1], q[:, 2]] = True
    skin = ndimage.binary_dilation(G, ndimage.generate_binary_structure(3, 2), iterations=3)
    out_, _ = ndimage.label(~skin)
    solid = ndimage.binary_erosion(out_ != out_[0, 0, 0], ndimage.generate_binary_structure(3, 2), iterations=2)
    D = ndimage.distance_transform_edt(solid)

    r = float(spec.get('open', 18.0))
    core = D > r
    op = ndimage.distance_transform_edt(~core) <= r + 2.5
    lab, nlab = ndimage.label(op)
    sizes = ndimage.sum(op, lab, range(1, nlab + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s > 0.015 * sizes.max()]
    remap = np.zeros(nlab + 1, np.int32)
    remap[keep] = np.arange(1, len(keep) + 1)

    C = P[F].mean(1)
    W = weld(P)
    v = np.clip(np.floor((C - lo) / h).astype(int) + 8, 0, np.array(solid.shape) - 1)
    face = remap[lab][v[:, 0], v[:, 1], v[:, 2]]

    limb = np.where(face == 0)[0]
    clab = comps(F, face == 0, W)
    pieces = sorted([limb[clab == cl] for cl in np.unique(clab)], key=len, reverse=True)

    # 1. Largest limb piece is the two raised chelipeds + front carapace bridge.
    #    Separate armL and armR across |x| > 0.28 ONLY below y < 1.04 so thorax keeps the full shoulder collar,
    #    and overlap 0.24 < |x| < 0.31 across shoulder & thorax so no seam ever opens!
    big = pieces[0]
    arm_sel = np.zeros(len(F), bool)
    arm_sel[big[(np.abs(C[big, 0]) > 0.25) | (C[big, 1] >= 1.04)]] = True
    dome_center = big[(np.abs(C[big, 0]) <= 0.25) & (C[big, 2] < 0.25)]
    arm_sel[dome_center] = False
    side_f = np.where(arm_sel)[0]
    l2 = comps(F, arm_sel, W)
    ids2, cnt2 = np.unique(l2, return_counts=True)
    ord2 = np.argsort(-cnt2)[:2]
    arms = [side_f[l2 == ids2[i]] for i in ord2]
    assert len(arms) == 2 and C[arms[0], 0].mean() * C[arms[1], 0].mean() < 0, 'Chelipeds did not split into L/R pair'
    sh_lap = big[(np.abs(C[big, 0]) <= 0.31) & (C[big, 1] < 1.03)]
    carapace_return = np.union1d(np.setdiff1d(big, np.r_[arms[0], arms[1]]), sh_lap)
    face[carapace_return] = 1

    # 2. Ground-reaching legs vs extra appendages:
    #    Keep the 8 primary arched walking legs (4 pairs front-to-back); drop spurious horizontal side-spurs
    #    and extra 5th inner-rear leg pair so the crab has an exact 8-legged decapod silhouette (8 walking + 2 claws = 10!).
    cand_legs = []
    for f in pieces[1:]:
        if len(f) >= 600 and C[f, 1].min() < 0.08 * H and np.ptp(C[f, 1]) > 0.25 * H:
            cand_legs.append(f)
        elif len(f) < 600 and C[f, 1].min() > 0.40 * H and np.abs(C[f, 0].mean()) > 0.45:
            # Spurious horizontal mid-flank spur above leg2: drop cleanly (socket capped on thorax)
            print('  dropping spurious lateral spur (%d tris at x=%.2f, y=%.2f)' % (len(f), C[f, 0].mean(), C[f, 1].mean()))
        else:
            face[f] = 1

    # Sort candidate legs on L (+x) and R (-x) from front (+z) to back (-z) and keep the first 4 pairs!
    legs_L = sorted([f for f in cand_legs if C[f, 0].mean() > 0], key=lambda f: -C[f, 2].mean())
    legs_R = sorted([f for f in cand_legs if C[f, 0].mean() < 0], key=lambda f: -C[f, 2].mean())
    for extra in legs_L[4:] + legs_R[4:]:
        print('  dropping extra 5th rear leg (%d tris at x=%.2f, z=%.2f)' % (len(extra), C[extra, 0].mean(), C[extra, 2].mean()))
    legs_L, legs_R = legs_L[:4], legs_R[:4]
    assert len(legs_L) == 4 and len(legs_R) == 4, 'Expected 4L + 4R walking legs, got %dL + %dR' % (len(legs_L), len(legs_R))

    # 3. Partition trunk (face > 0) into 'thorax' (carapace), 'head' (eyestalks + mouthparts), and 'abd' (tucked rear apron)
    trunk_idx = np.where(face > 0)[0]
    trunk_idx = largest_comp(F, trunk_idx, W)
    ct = C[trunk_idx]

    # Front eyestalks & epistome mouthparts: |x| < 0.23, z > 0.34, y > 0.56
    s_head = (ct[:, 2] - 0.34) - 0.45 * np.maximum(0.0, np.abs(ct[:, 0]) - 0.16) + 0.15 * (ct[:, 1] - 0.65)
    head_core = trunk_idx[(np.abs(ct[:, 0]) < 0.24) & (ct[:, 1] > 0.54) & (s_head > 0.0)]
    head_band = trunk_idx[(np.abs(ct[:, 0]) < 0.25) & (ct[:, 1] > 0.52) & (np.abs(s_head) < 0.022)]

    # Rear tucked pleon / abdomen apron: |x| < 0.25, z < -0.35, y < 0.62
    s_abd = (-0.35 - ct[:, 2]) - 0.35 * np.maximum(0.0, np.abs(ct[:, 0]) - 0.16) - 0.20 * np.maximum(0.0, ct[:, 1] - 0.55)
    abd_core = trunk_idx[(np.abs(ct[:, 0]) < 0.26) & (ct[:, 1] < 0.64) & (s_abd > 0.0)]
    abd_band = trunk_idx[(np.abs(ct[:, 0]) < 0.27) & (ct[:, 1] < 0.66) & (np.abs(s_abd) < 0.022)]

    head_f = largest_comp(F, np.union1d(head_core, head_band), W)
    abd_f = largest_comp(F, np.union1d(abd_core, abd_band), W)
    # Keep thorax shell continuous behind head & abd (recessed inward 14mm under them) and pre-cap limb sockets
    # before QEM simplification so thorax is a closed watertight carapace, while abd/head tuck deep into thorax!
    thorax_f = trunk_idx.copy()
    P_thx = P.copy()
    under_overlay = np.unique(F[np.union1d(head_core, abd_core)])
    P_thx[under_overlay] -= N[under_overlay] * 0.014
    thx_center = C[thorax_f].mean(0)
    print('Trunk parts: thorax=%d, head=%d, abd=%d (center=%s)' % (len(thorax_f), len(head_f), len(abd_f), thx_center.round(3)))

    trunkP = C[thorax_f]
    tri_parts = {
        'head': (head_f, B['head']),
        'abd': (abd_f, B['abd']),
    }

    # 4. Split both cheliped arms into 3 parts each: arm{L,R} -> arm{L,R}t -> pincer{L,R}
    ARM = {}
    for arm_f in arms:
        sd, upper_f, palm_f, dactyl_f, sh, el, kn = split_cheliped_3seg(P, F, arm_f, trunkP, W)
        ARM[sd] = dict(shoulder=sh, elbow=el, knuckle=kn)
        tri_parts['arm' + sd] = (upper_f, B['arm'])
        tri_parts['arm' + sd + 't'] = (palm_f, B['armt'])
        tri_parts['pincer' + sd] = (dactyl_f, B['pincer'])

    # 5. Split all 8 walking legs into 2 segments each (leg{0..3}{L,R} -> leg{0..3}{L,R}t),
    #    gently grounding each lower leg about its knee so all 8 pointed tips touch y = 0.000 at rest!
    LEG = {}
    MESH = {}
    for i in range(4):
        for sd, lf in (('L', legs_L[i]), ('R', legs_R[i])):
            nm = 'leg%d%s' % (i, sd)
            fem, tib, hip, knee, toe, sk = walk_leg_chain_2seg(P, F, lf, trunkP)
            f_fem = largest_comp(F, lf[fem], W)
            f_tib = largest_comp(F, lf[tib], W)

            # Bake upper leg
            u1, iv1 = np.unique(F[f_fem], return_inverse=True)
            MESH[nm] = bake_part(P[u1], N[u1], UV[u1], iv1.reshape(-1, 3), B['femur'])

            # Ground lower leg precisely so its lowest baked vertex sits at y = 0.000!
            u2, iv2 = np.unique(F[f_tib], return_inverse=True)
            P_tib = P[u2].copy()
            N_tib = N[u2].copy()
            ymin_raw = float(P_tib[:, 1].min())
            if abs(ymin_raw) > 1e-4:
                tip_raw = P_tib[np.argmin(P_tib[:, 1])]
                v0 = tip_raw - knee
                # Rotate in the vertical leg plane around knee so tip_raw[1] lands at 0.0
                horiz = np.hypot(v0[0], v0[2])
                r_len = np.linalg.norm(v0)
                if r_len > abs(knee[1]) and horiz > 1e-4:
                    ang0 = np.arctan2(v0[1], horiz)
                    ang1 = np.arcsin(np.clip(-knee[1] / r_len, -0.999, 0.999))
                    d_ang = ang1 - ang0
                    h_dir = np.array([v0[0], 0.0, v0[2]]) / horiz
                    ax_rot = np.cross(h_dir, [0.0, 1.0, 0.0])
                    Rg = rot_axis(ax_rot, d_ang)
                    P_tib = (P_tib - knee) @ Rg.T + knee
                    N_tib = N_tib @ Rg.T

            pos_t, nrm_t, uv_t, nt_t = bake_part(P_tib, N_tib, UV[u2], iv2.reshape(-1, 3), B['tibia'])
            # Exact micro-shift <= 2mm so baked lowest vertex is strictly 0.000000
            dy_exact = float(pos_t[:, 1].min())
            if abs(dy_exact) < 0.015:
                pos_t[:, 1] -= dy_exact
            MESH[nm + 't'] = (pos_t, nrm_t, uv_t, nt_t)
            toe_baked = pos_t[np.argmin(pos_t[:, 1])].copy()
            LEG[nm] = dict(hip=hip, knee=knee, ankle=toe_baked, toe=toe_baked, i=i, sd=sd)
            print('  %s: femur=%d tris, tibia=%d tris, grounded toe=%s' % (nm, MESH[nm][3], nt_t, toe_baked.round(4)))

    # 6. Bake trunk & cheliped parts
    u_thx, iv_thx = np.unique(F[thorax_f], return_inverse=True)
    MESH['thorax'] = bake_part(P_thx[u_thx], N[u_thx], UV[u_thx], iv_thx.reshape(-1, 3), B['thorax'], pre_cap=True, dome=0.0)
    print('  baked %-8s: %4d tris (from %d)' % ('thorax', MESH['thorax'][3], len(thorax_f)))
    for nm, (f_idx, bud) in sorted(tri_parts.items()):
        u, iv = np.unique(F[f_idx], return_inverse=True)
        P_part = P[u].copy()
        if nm in ('head', 'abd'):
            P_part += N[u] * 0.003
            MESH[nm] = bake_part(P_part, N[u], UV[u], iv.reshape(-1, 3), bud, toward=thx_center)
        else:
            MESH[nm] = bake_part(P_part, N[u], UV[u], iv.reshape(-1, 3), bud)
        print('  baked %-8s: %4d tris (from %d)' % (nm, MESH[nm][3], len(f_idx)))

    tot_tris = sum(m[3] for m in MESH.values())
    print('Total baked: %d tris across %d parts' % (tot_tris, len(MESH)))

    # 7. Hierarchy & pivots (every child pivot sits right on its parent's surface for C6!)
    def near_surface(child_nm, par_nm):
        d_q, i_q = cKDTree(MESH[par_nm][0]).query(MESH[child_nm][0])
        k = int(d_q.argmin())
        return 0.5 * (MESH[child_nm][0][k] + MESH[par_nm][0][i_q[k]])

    def snap_to_parent(pt, par_nm):
        _, idx_p = cKDTree(MESH[par_nm][0]).query(pt)
        return 0.5 * (pt + MESH[par_nm][0][idx_p])

    PIV = {'thorax': MESH['thorax'][0].mean(0)}
    PAR = {}

    PIV['head'] = near_surface('head', 'thorax')
    PIV['head'][0] = 0.0
    PAR['head'] = 'thorax'

    PIV['abd'] = near_surface('abd', 'thorax')
    PIV['abd'][0] = 0.0
    PAR['abd'] = 'thorax'

    for sd in ('L', 'R'):
        PIV['arm' + sd] = snap_to_parent(ARM[sd]['shoulder'], 'thorax')
        PAR['arm' + sd] = 'thorax'
        PIV['arm' + sd + 't'] = snap_to_parent(ARM[sd]['elbow'], 'arm' + sd)
        PAR['arm' + sd + 't'] = 'arm' + sd
        PIV['pincer' + sd] = snap_to_parent(ARM[sd]['knuckle'], 'arm' + sd + 't')
        PAR['pincer' + sd] = 'arm' + sd + 't'

    for nm, g in LEG.items():
        g['hip'] = snap_to_parent(g['hip'], 'thorax')
        g['knee'] = snap_to_parent(g['knee'], nm)
        PIV[nm] = g['hip']
        PAR[nm] = 'thorax'
        PIV[nm + 't'] = g['knee']
        PAR[nm + 't'] = nm

    ORDER = ['thorax', 'head', 'abd', 'armL', 'armLt', 'pincerL', 'armR', 'armRt', 'pincerR'] + [
        'leg%d%s%s' % (i, sd, sf) for i in range(4) for sd in ('L', 'R') for sf in ('', 't')
    ]

    # 8. Build GLB with 'perch', 'walk', and 'strike' clips
    write_crab_glb(d, a.candidate, J, BIN, MESH, PIV, PAR, ORDER, LEG, H, L)


def pincer_quat(sd, open_rad):
    """Rotate movable dactyl around the anatomical claw knuckle axis (+open_rad opens wide, -open_rad snaps shut)."""
    sgn = 1.0 if sd == 'L' else -1.0
    axis = np.array([-0.65, 0.0, -0.76 * sgn])
    axis /= np.linalg.norm(axis)
    return qa(axis, open_rad)


def write_crab_glb(d, candidate, J, BIN, MESH, PIV, PAR, ORDER, LEG, H, L):
    blob = bytearray()
    BV, AC = [], []

    def add_bv(data, target=None):
        while len(blob) % 4:
            blob.append(0)
        bv = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(data)}
        if target:
            bv['target'] = target
        blob.extend(data)
        BV.append(bv)
        return len(BV) - 1

    def add_acc(arr, typ, ct, target=None, mm=False):
        ac = {'bufferView': add_bv(arr.tobytes(), target), 'componentType': ct, 'count': len(arr), 'type': typ}
        if mm:
            ac['min'] = np.atleast_1d(arr.min(0)).tolist()
            ac['max'] = np.atleast_1d(arr.max(0)).tolist()
        AC.append(ac)
        return len(AC) - 1

    imgs = []
    for im in J['images']:
        v = J['bufferViews'][im['bufferView']]
        imgs.append({'mimeType': im['mimeType'], 'bufferView': add_bv(BIN[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])})

    meshes, nodes, idx = [], [{'name': 'creature', 'children': [1]}], {}
    for n in ORDER:
        pos, nrm, uv, _ = MESH[n]
        pos = pos - PIV[n]
        key = np.round(np.c_[pos, uv, nrm], 5)
        _, fi, iv = np.unique(key, axis=0, return_index=True, return_inverse=True)
        iv = iv.reshape(-1)
        pa = add_acc(pos[fi].astype('<f4'), 'VEC3', 5126, 34962, True)
        na = add_acc(nrm[fi].astype('<f4'), 'VEC3', 5126, 34962)
        ua = add_acc(uv[fi].astype('<f4'), 'VEC2', 5126, 34962)
        ia = add_acc(iv.astype('<u4'), 'SCALAR', 5125, 34963)
        meshes.append({'name': n, 'primitives': [{'attributes': {'POSITION': pa, 'NORMAL': na, 'TEXCOORD_0': ua}, 'indices': ia, 'mode': 4, 'material': 0}]})
        idx[n] = len(nodes)
        nodes.append({'name': n, 'mesh': len(meshes) - 1, 'translation': [float(x) for x in (PIV[n] - (PIV[PAR[n]] if n in PAR else 0))]})
    for n in ORDER:
        if n in PAR:
            nodes[idx[PAR[n]]].setdefault('children', []).append(idx[n])

    # Slight 2.5% body crouch in walk gives every arched crab leg generous fore/aft IK reach with zero foot slide!
    T_WALK, DUTY = 1.0, 0.6
    DROP = np.array([0.0, -0.025 * H, 0.0])
    LIFT = 0.055 * H

    def reach(g):
        r_ = 0.97 * (np.linalg.norm(g['knee'] - g['hip']) + np.linalg.norm(g['toe'] - g['knee']))
        v_ = g['toe'] - g['hip'] - DROP
        return np.sqrt(max(r_ * r_ - v_[0] ** 2 - v_[1] ** 2, 0.0)) - abs(v_[2])

    STRIDE = min(0.16 * L, 2.0 * max(min(reach(g) for g in LEG.values()), 0.015 * L))
    SPEED = STRIDE / (DUTY * T_WALK)

    def leg_walk_q(nm, u):
        g = LEG[nm]
        half = STRIDE / 2.0
        if u < DUTY:
            z = half * (1.0 - 2.0 * u / DUTY)
            y = 0.0
        else:
            s = (u - DUTY) / (1.0 - DUTY)
            z = -half + STRIDE * (0.5 - 0.5 * np.cos(np.pi * s))
            y = LIFT * np.sqrt(np.sin(np.pi * s))
        target = g['toe'] + np.array([0.0, y, z]) - DROP
        return ik2(g, target)

    def pose_perch(nm, ph):
        if nm == 'head':
            return qa([0, 1, 0], 0.07 * np.sin(2 * np.pi * ph))
        if nm == 'abd':
            return qa([1, 0, 0], 0.03 * np.sin(2 * np.pi * (ph + 0.25)))
        if nm == 'pincerL':
            return pincer_quat('L', 0.14 * (0.5 - 0.5 * np.cos(2 * np.pi * ph)))
        if nm == 'pincerR':
            return pincer_quat('R', 0.14 * (0.5 - 0.5 * np.cos(2 * np.pi * (ph + 0.5))))
        if nm in ('armL', 'armR'):
            sg = 1.0 if nm == 'armL' else -1.0
            return qa([0, 1, 0], sg * 0.04 * np.sin(2 * np.pi * ph))
        return np.array([0.0, 0.0, 0.0, 1.0])

    def pose_walk(nm, ph):
        m_ = re.match(r'^(leg\d[LR])(t?)$', nm)
        if m_:
            base, sub = m_.group(1), m_.group(2)
            g = LEG[base]
            # Alternating tetrapod gait: (0L, 1R, 2L, 3R) vs (0R, 1L, 2R, 3L)
            tet = (g['i'] + (0 if g['sd'] == 'L' else 1)) % 2
            u = (ph + 0.5 * tet) % 1.0
            R1, R2 = leg_walk_q(base, u)
            return mat2q(R1) if sub == '' else mat2q(R1.T @ R2)
        if nm == 'head':
            return qa([0, 1, 0], 0.04 * np.sin(2 * np.pi * ph))
        if nm in ('pincerL', 'pincerR'):
            sd = nm[-1]
            return pincer_quat(sd, 0.10 * (0.5 - 0.5 * np.cos(2 * np.pi * ph)))
        return np.array([0.0, 0.0, 0.0, 1.0])

    def pose_strike(nm, ph):
        sm = lambda a_, b_, x: (lambda q: q * q * (3 - 2 * q))(min(1.0, max(0.0, (x - a_) / (b_ - a_))))
        w_up = sm(0.0, 0.28, ph) - sm(0.28, 0.42, ph)
        snap = sm(0.28, 0.42, ph) - sm(0.65, 0.96, ph)
        if nm == 'armR':
            return qa([1, 0, 0], -0.35 * w_up + 0.68 * snap)
        if nm == 'armRt':
            return qa([0, 1, 0], -0.25 * w_up + 0.42 * snap)
        if nm == 'pincerR':
            return pincer_quat('R', 0.785 * w_up - 0.34 * snap)
        if nm == 'pincerL':
            return pincer_quat('L', 0.35 * w_up - 0.22 * snap)
        return np.array([0.0, 0.0, 0.0, 1.0])

    def build_clip(name, T, fn, n, with_drop=False, extras=None):
        t = (np.arange(n + 1) / n * T).astype('<f4')
        sam, ch = [], []
        for nm in ORDER:
            q = np.array([fn(nm, k / n) for k in range(n + 1)], '<f4')
            if np.allclose(q, [0, 0, 0, 1], atol=1e-6):
                continue
            sam.append({'input': add_acc(t, 'SCALAR', 5126, None, True), 'output': add_acc(q, 'VEC4', 5126), 'interpolation': 'LINEAR'})
            ch.append({'sampler': len(sam) - 1, 'target': {'node': idx[nm], 'path': 'rotation'}})
        if with_drop:
            p0 = np.array(nodes[idx['thorax']]['translation'], float) + DROP
            sam.append({'input': add_acc(t, 'SCALAR', 5126, None, True), 'output': add_acc(np.tile(p0, (n + 1, 1)).astype('<f4'), 'VEC3', 5126), 'interpolation': 'LINEAR'})
            ch.append({'sampler': len(sam) - 1, 'target': {'node': idx['thorax'], 'path': 'translation'}})
        c = {'name': name, 'samplers': sam, 'channels': ch}
        if extras:
            c['extras'] = extras
        return c

    anims = [
        build_clip('perch', 4.0, pose_perch, 24, with_drop=False),
        build_clip('walk', T_WALK, pose_walk, 36, with_drop=True, extras={
            'speed': float(SPEED),
            'stride': float(STRIDE),
            'duty': DUTY,
            'ground': 0.0,
            'note': 'alternating tetrapod crab gait, in place: drive root at speed',
        }),
        build_clip('strike', 1.10, pose_strike, 44, with_drop=False),
    ]

    out = {
        'asset': {'version': '2.0', 'generator': 'rig/crab_rig.py'},
        'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': nodes,
        'meshes': meshes,
        'materials': J['materials'][:1],
        'textures': J['textures'],
        'images': imgs,
        'bufferViews': BV,
        'accessors': AC,
        'animations': anims,
        'buffers': [{'byteLength': len(blob)}],
    }
    if J.get('samplers'):
        out['samplers'] = J['samplers']
    js = json.dumps(out, separators=(',', ':')).encode('utf-8')
    while len(js) % 4:
        js += b' '
    while len(blob) % 4:
        blob.append(0)
    out_path = os.path.join(d, 'rig-%s.glb' % candidate)
    with open(out_path, 'wb') as fh:
        fh.write(
            struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob))
            + struct.pack('<II', len(js), 0x4E4F534A) + js
            + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob)
        )
    print('Wrote %s (%d KB), speed=%.3f, stride=%.3f' % (out_path, os.path.getsize(out_path) // 1024, SPEED, STRIDE))


if __name__ == '__main__':
    main()
