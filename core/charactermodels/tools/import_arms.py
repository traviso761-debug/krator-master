#!/usr/bin/env python3
"""Dissect, splice handles, orient, decimate, and import all cultural weapons & shields from Downloads and Meshy archives
into pieces/props/<id>.glb, data/props.json, and dist/thumbs/props/<id>.png.

Explicitly ignores 'flying bat 3d model.glb' and deduplicates 'fantasy weapon 3d modelandaru 2.glb'.
For Tripo multi-item culture sheets: separates the 5 weapons and 5 shields per culture, ignores redundant back/side
shield duplicates except to splice their rear handle/straps onto the back of the front-facing shield.
"""
import glob, io, json, math, os, re, struct, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, 'tools'))
import glbio

DL = r'C:\Users\travi\Downloads'
MESHY_DIR = r'C:\Users\travi\.gemini\antigravity\brain\90fc1231-0f9f-4770-9ae3-2ed1dc1add67\scratch\meshy_extracted'
OUT_PROPS = os.path.join(HERE, 'pieces', 'props')
OUT_THUMBS = os.path.join(HERE, 'dist', 'thumbs', 'props')

BIN = 0.015
FLIP = np.diag([1.0, -1.0, -1.0])


def rot_x(deg):
    a = np.radians(deg)
    c, s = np.cos(a), np.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], dtype=float)


def rot_y(deg):
    a = np.radians(deg)
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], dtype=float)


def rot_z(deg):
    a = np.radians(deg)
    c, s = np.cos(a), np.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], dtype=float)


def submesh(P, N, UV, T, tri_mask):
    T_sub = T[tri_mask]
    used, inv = np.unique(T_sub, return_inverse=True)
    return P[used].copy(), N[used].copy(), UV[used].copy(), inv.reshape(-1, 3)


def connected_components_tris(P, T, tol=1e-4, min_tris=8):
    if len(T) == 0:
        return []
    q = np.round(P / tol).astype(np.int64)
    _, inv = np.unique(q, axis=0, return_inverse=True)
    T_w = inv[T]
    n_v = int(inv.max()) + 1
    parent = np.arange(n_v)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b, c in T_w:
        ra, rb, rc = find(a), find(b), find(c)
        if ra != rb:
            parent[rb] = ra
        if ra != rc:
            parent[rc] = ra
    roots = np.array([find(i) for i in range(n_v)])
    tri_roots = roots[T_w[:, 0]]
    comps = []
    for r in np.unique(tri_roots):
        idx = np.where(tri_roots == r)[0]
        if len(idx) >= min_tris:
            comps.append(idx)
    return comps


def decimate_uv_preserving(pos, nrm, uv, tri, target_tris=4200):
    if len(tri) <= target_tris:
        return pos, nrm, uv, tri
    span = float(np.max(np.ptp(pos, axis=0)))
    # Choose cell_size to land near target_tris
    ratio = math.sqrt(len(tri) / float(target_tris))
    cell_size = max(1e-4, span / max(28.0, min(140.0, 260.0 / ratio)))
    for _ in range(4):
        q = np.floor((pos - pos.min(axis=0)) / cell_size).astype(np.int64)
        uv_bin = np.floor(np.clip(uv, 0.0, 1.0) * 24.0).astype(np.int64)
        key = ((q[:, 0] * 1024 + q[:, 1]) * 1024 + q[:, 2]) * 1024 + (uv_bin[:, 0] * 32 + uv_bin[:, 1])
        u_keys, first_v, inv = np.unique(key, return_index=True, return_inverse=True)
        n_c = len(u_keys)
        counts = np.maximum(np.bincount(inv, minlength=n_c), 1)
        c_nrm = np.column_stack([np.bincount(inv, nrm[:, k], minlength=n_c) / counts for k in range(3)])
        c_nrm /= np.maximum(np.linalg.norm(c_nrm, axis=1, keepdims=True), 1e-9)
        c_uv = np.column_stack([np.bincount(inv, uv[:, k], minlength=n_c) / counts for k in range(2)]).astype(np.float32)

        q_key = (q[:, 0] * 1024 + q[:, 1]) * 1024 + q[:, 2]
        _, q_inv = np.unique(q_key, return_inverse=True)
        q_counts = np.maximum(np.bincount(q_inv), 1)
        q_pos = np.column_stack([np.bincount(q_inv, pos[:, k]) / q_counts for k in range(3)])
        c_pos = q_pos[q_inv[first_v]]

        tc = inv[tri]
        tq = q_inv[tri]
        non_deg = (tq[:, 0] != tq[:, 1]) & (tq[:, 1] != tq[:, 2]) & (tq[:, 2] != tq[:, 0])
        tc_nd = tc[non_deg]
        tq_nd = np.sort(tq[non_deg], axis=1)
        n_q = int(q_inv.max()) + 1
        t_hash = (tq_nd[:, 0].astype(np.int64) * n_q + tq_nd[:, 1].astype(np.int64)) * n_q + tq_nd[:, 2].astype(np.int64)
        _, u_t = np.unique(t_hash, return_index=True)
        final_tri = tc_nd[np.sort(u_t)]
        if len(final_tri) > target_tris * 1.45:
            cell_size *= 1.25
        elif len(final_tri) < target_tris * 0.45 and len(final_tri) < len(tri) * 0.8:
            cell_size *= 0.8
        else:
            break
    used_c, final_tri = np.unique(final_tri, return_inverse=True)
    final_tri = final_tri.reshape(-1, 3)
    return c_pos[used_c], c_nrm[used_c], c_uv[used_c], final_tri


def find_row_splits(P, T):
    tc = P[T].mean(axis=1)
    s_mask = tc[:, 0] > 0.08
    ys = tc[s_mask, 1] if s_mask.sum() > 100 else tc[:, 1]
    y_min, y_max = ys.min(), ys.max()
    bins = np.linspace(y_min, y_max, 201)
    hist, _ = np.histogram(ys, bins=bins)
    centers = 0.5 * (bins[:-1] + bins[1:])
    span = y_max - y_min
    splits = []
    for k in range(1, 5):
        target = y_max - (k / 5.0) * span
        win = np.abs(centers - target) < 0.065 * span
        idx = np.where(win)[0]
        best = idx[np.argmin(hist[idx])]
        splits.append(float(centers[best]))
    return splits


SHEETS_3COL_SHIELDS = {
    'andaru 2.glb', 'zeijani jungle camo.glb', 'pylon.glb', 'drum.glb',
    'torus.glb', 'screamer.glb', 'shell.glb', 'lizard.glb', 'xanadu.glb'
}


def make_handle_strap_mesh(y_span, z_span, x_back, uv_center):
    """Create a clean 3D handle bar on the +X back face when a standalone/Meshy shield lacks a rear grip."""
    hy = min(0.075, max(0.045, 0.22 * y_span))
    hz = min(0.018, max(0.010, 0.06 * z_span))
    hx = 0.032
    # 8-vertex arch box from x_back - 0.005 to x_back + hx
    x0, x1 = x_back - 0.005, x_back + hx
    P = np.array([
        [x0, -hy, -hz], [x0, -hy, +hz], [x0, +hy, +hz], [x0, +hy, -hz],
        [x1, -hy * 0.75, -hz], [x1, -hy * 0.75, +hz], [x1, +hy * 0.75, +hz], [x1, +hy * 0.75, -hz],
    ], dtype=float)
    T = np.array([
        [0, 1, 5], [0, 5, 4],
        [1, 2, 6], [1, 6, 5],
        [2, 3, 7], [2, 7, 6],
        [3, 0, 4], [3, 4, 7],
        [4, 5, 6], [4, 6, 7],
    ], dtype=np.int64)
    N = np.zeros_like(P)
    N[:4, 0] = -0.3
    N[4:, 0] = 1.0
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-8)
    UV = np.tile(uv_center.reshape(1, 2), (len(P), 1)).astype(np.float32)
    return P, N, UV, T


def extract_shield_for_row(fname, row, P, N, UV, T, rmask):
    P_r, N_r, UV_r, T_r = submesh(P, N, UV, T, rmask)
    tc = P_r[T_r].mean(axis=1)
    if fname == 'republic.glb':
        # Take the 3D shield at tc_x > 0.30
        s_mask = tc[:, 0] > 0.30
        if s_mask.sum() >= 50:
            P_r, N_r, UV_r, T_r = submesh(P_r, N_r, UV_r, T_r, s_mask)
        fc = 0.5 * (P_r.min(0) + P_r.max(0))
        P_r -= fc
        # Ensure thin axis is X and longest axis is Y
        exts = [np.ptp(P_r[:, 0]), np.ptp(P_r[:, 1]), np.ptp(P_r[:, 2])]
        if exts[0] > exts[2]:
            R = rot_y(-90)
            P_r = P_r @ R.T
            N_r = N_r @ R.T
        if np.ptp(P_r[:, 2]) > np.ptp(P_r[:, 1]) * 1.25:
            R = rot_x(90)
            P_r = P_r @ R.T
            N_r = N_r @ R.T
        return P_r, N_r, UV_r, T_r

    if fname == 'lizard 2.glb' and row == 4:
        f_mask = tc[:, 0] < 0.422
        s_mask = tc[:, 0] >= 0.422
        Pf, Nf, UVf, Tf = submesh(P_r, N_r, UV_r, T_r, f_mask)
        Ps, Ns, UVs, Ts = submesh(P_r, N_r, UV_r, T_r, s_mask)
        R_z90 = rot_z(90)
        fc = 0.5 * (Pf.min(0) + Pf.max(0))
        Pf = (Pf - fc) @ R_z90.T
        Nf = Nf @ R_z90.T
        R_y_m90 = rot_y(-90)
        Pf = Pf @ R_y_m90.T
        Nf = Nf @ R_y_m90.T
        sx_min, sx_max = Ps[:, 0].min(), Ps[:, 0].max()
        s_tc = Ps[Ts].mean(axis=1)
        h_mask = s_tc[:, 0] > sx_min + 0.35 * (sx_max - sx_min)
        if h_mask.any():
            Ph, Nh, UVh, Th = submesh(Ps, Ns, UVs, Ts, h_mask)
            hc = 0.5 * (Ph.min(0) + Ph.max(0))
            Ph[:, 1] -= hc[1]
            Ph[:, 2] -= hc[2]
            x_back = np.percentile(Pf[:, 0], 88)
            Ph[:, 0] = Ph[:, 0] - Ph[:, 0].min() + x_back - 0.004
            n_prev = len(Pf)
            Pf = np.vstack([Pf, Ph]); Nf = np.vstack([Nf, Nh]); UVf = np.vstack([UVf, UVh]); Tf = np.vstack([Tf, Th + n_prev])
        return Pf, Nf, UVf, Tf

    comps = connected_components_tris(P_r, T_r)
    c_info = []
    for idx in comps:
        v = P_r[T_r[idx].reshape(-1)]
        cx = 0.5 * (v[:, 0].min() + v[:, 0].max())
        if cx < 0.08:
            continue
        c_info.append((cx, len(idx), idx, v.min(0), v.max(0)))
    c_info.sort(key=lambda x: x[0])
    main_front = [c for c in c_info if c[1] >= 80][0]
    fx_center = main_front[0]
    f_indices = np.concatenate([c[2] for c in c_info if abs(c[0] - fx_center) < 0.055])
    f_mask = np.zeros(len(T_r), dtype=bool)
    f_mask[f_indices] = True
    Pf, Nf, UVf, Tf = submesh(P_r, N_r, UV_r, T_r, f_mask)
    fc = 0.5 * (Pf.min(0) + Pf.max(0))
    Pf -= fc
    R_y_m90 = rot_y(-90)
    Pf = Pf @ R_y_m90.T
    Nf = Nf @ R_y_m90.T
    x_back = np.percentile(Pf[:, 0], 88)
    f_h = Pf[:, 1].max() - Pf[:, 1].min()
    f_w = Pf[:, 2].max() - Pf[:, 2].min()

    if fname in SHEETS_3COL_SHIELDS:
        b_Indices_list = [c[2] for c in c_info if c[0] > fx_center + 0.14]
        if b_Indices_list:
            b_mask = np.zeros(len(T_r), dtype=bool)
            b_mask[np.concatenate(b_Indices_list)] = True
            Pb, Nb, UVb, Tb = submesh(P_r, N_r, UV_r, T_r, b_mask)
            bc = 0.5 * (Pb.min(0) + Pb.max(0))
            Pb -= bc
            b_tc = Pb[Tb].mean(axis=1)
            b_front_mask = b_tc[:, 2] >= np.median(Pb[:, 2]) - 0.002
            Pb, Nb, UVb, Tb = submesh(Pb, Nb, UVb, Tb, b_front_mask)
            R_y_p90 = rot_y(90)
            Pb = Pb @ R_y_p90.T
            Nb = Nb @ R_y_p90.T
            b_h = max(1e-4, Pb[:, 1].max() - Pb[:, 1].min())
            b_w = max(1e-4, Pb[:, 2].max() - Pb[:, 2].min())
            Pb[:, 1] *= (f_h / b_h) * 0.96
            Pb[:, 2] *= (f_w / b_w) * 0.96
            Pb[:, 0] = (Pb[:, 0] - Pb[:, 0].min()) * 1.35 + x_back - 0.003
            r_grip = np.hypot(Pb[:, 1] / (0.28 * f_h), Pb[:, 2] / (0.35 * f_w))
            Pb[:, 0] += np.clip(1.0 - r_grip, 0.0, 1.0) * 0.022
            f_tc = Pf[Tf].mean(axis=1)
            f_keep = f_tc[:, 0] <= np.median(Pf[:, 0]) + 0.003
            if f_keep.sum() >= 50:
                Pf, Nf, UVf, Tf = submesh(Pf, Nf, UVf, Tf, f_keep)
            n_prev = len(Pf)
            Pf = np.vstack([Pf, Pb]); Nf = np.vstack([Nf, Nb]); UVf = np.vstack([UVf, UVb]); Tf = np.vstack([Tf, Tb + n_prev])
    else:
        s_Indices_list = [c[2] for c in c_info if c[0] > fx_center + 0.07]
        if s_Indices_list:
            s_mask = np.zeros(len(T_r), dtype=bool)
            s_mask[np.concatenate(s_Indices_list)] = True
            Ps, Ns, UVs, Ts = submesh(P_r, N_r, UV_r, T_r, s_mask)
            sx_min, sx_max = Ps[:, 0].min(), Ps[:, 0].max()
            sdx = sx_max - sx_min
            s_tc = Ps[Ts].mean(axis=1)
            h_mask = s_tc[:, 0] > sx_min + 0.36 * sdx
            if h_mask.sum() < 20:
                h_mask = s_tc[:, 0] > sx_min + 0.22 * sdx
            Ph, Nh, UVh, Th = submesh(Ps, Ns, UVs, Ts, h_mask)
            hc = 0.5 * (Ph.min(0) + Ph.max(0))
            Ph[:, 1] -= hc[1]
            Ph[:, 2] -= hc[2]
            Ph[:, 0] = Ph[:, 0] - Ph[:, 0].min() + x_back - 0.004
            n_prev = len(Pf)
            Pf = np.vstack([Pf, Ph]); Nf = np.vstack([Nf, Nh]); UVf = np.vstack([UVf, UVh]); Tf = np.vstack([Tf, Th + n_prev])
    return Pf, Nf, UVf, Tf


def make_shaft_cylinder(x0, x1, y_mid, z_mid, radius, uv_sample, n_sides=8, n_segs=10):
    xs = np.linspace(x0, x1, n_segs + 1)
    angles = np.linspace(0, 2 * np.pi, n_sides, endpoint=False)
    P_list, N_list = [], []
    for x in xs:
        for a in angles:
            cy, cz = np.cos(a), np.sin(a)
            P_list.append([x, y_mid + radius * cy, z_mid + radius * cz])
            N_list.append([0.0, cy, cz])
    P_c = np.array(P_list, dtype=float)
    N_c = np.array(N_list, dtype=float)
    UV_c = np.tile(uv_sample.reshape(1, 2), (len(P_c), 1)).astype(np.float32)
    T_list = []
    for i in range(n_segs):
        b0 = i * n_sides
        b1 = (i + 1) * n_sides
        for j in range(n_sides):
            jn = (j + 1) % n_sides
            T_list.append([b0 + j, b1 + j, b1 + jn])
            T_list.append([b0 + j, b1 + jn, b0 + jn])
    return P_c, N_c, UV_c, np.array(T_list, dtype=np.int64)


def bridge_arrow_shaft(P, N, UV, T, radius=0.0028):
    """Bridge thin wooden arrow/dart shafts across Tripo's dropout gaps while preserving fletching and arrowhead."""
    x0, x1 = float(P[:, 0].min()), float(P[:, 0].max())
    dx = x1 - x0
    mid_m = (P[:, 0] >= x0 + 0.15 * dx) & (P[:, 0] <= x1 - 0.15 * dx)
    if mid_m.sum() >= 3:
        y_mid = float(np.median(P[mid_m, 1]))
        z_mid = float(np.median(P[mid_m, 2]))
        uv_s = UV[mid_m].mean(axis=0)
    else:
        y_mid = float(0.5 * (P[:, 1].min() + P[:, 1].max()))
        z_mid = float(0.5 * (P[:, 2].min() + P[:, 2].max()))
        uv_s = UV.mean(axis=0)
    Pc, Nc, UVc, Tc = make_shaft_cylinder(x0 + 0.04 * dx, x1 - 0.04 * dx, y_mid, z_mid, radius, uv_s)
    n_prev = len(P)
    return np.vstack([P, Pc]), np.vstack([N, Nc]), np.vstack([UV, UVc]), np.vstack([T, Tc + n_prev])


def extract_tripo_projectiles(fname, P, N, UV, T):
    """Extract separated arrows and blowgun darts from Tripo culture sheets."""
    tc = P[T].mean(axis=1)
    out = []
    if fname == 'korona - bog.glb':
        # Row 0: Blowgun Dart (between blowgun tube at y>0.883 and dart case at y<0.858)
        m_dart = (tc[:, 0] < 0.025) & (tc[:, 1] >= 0.860) & (tc[:, 1] <= 0.883)
        Pd, Nd, UVd, Td = bridge_arrow_shaft(*submesh(P, N, UV, T, m_dart), radius=0.0022)
        out.append(('kor_bog_w1_dart', 'Korona Bog-Reed Blowgun Dart', 'dart', 0.42, Pd, Nd, UVd, Td, 'kor_bog_w1_spear'))
        # Row 1: Hunting Arrow (below bow at y<0.583)
        m_arr = (tc[:, 0] < -0.05) & (tc[:, 1] >= 0.556) & (tc[:, 1] <= 0.583)
        Pa, Na, UVa, Ta = bridge_arrow_shaft(*submesh(P, N, UV, T, m_arr), radius=0.0026)
        out.append(('kor_bog_w2_arrow', 'Korona Bog-Yew Hunting Arrow', 'arrow', 0.78, Pa, Na, UVa, Ta, 'kor_bog_w2_bow'))
    elif fname == 'korona - bird.glb':
        # Row 0: Blowgun Dart
        m_dart = (tc[:, 0] < 0.020) & (tc[:, 1] >= 0.865) & (tc[:, 1] <= 0.892)
        Pd, Nd, UVd, Td = bridge_arrow_shaft(*submesh(P, N, UV, T, m_dart), radius=0.0022)
        out.append(('kor_bird_w1_dart', 'Korona Bird-Clan Plumed Blowgun Dart', 'dart', 0.42, Pd, Nd, UVd, Td, 'kor_bird_w1_spear'))
        # Row 1: Feather Arrow
        m_arr = (tc[:, 0] < -0.05) & (tc[:, 1] >= 0.560) & (tc[:, 1] <= 0.583)
        Pa, Na, UVa, Ta = bridge_arrow_shaft(*submesh(P, N, UV, T, m_arr), radius=0.0026)
        out.append(('kor_bird_w2_arrow', 'Korona Bird-Clan Feather Arrow', 'arrow', 0.78, Pa, Na, UVa, Ta, 'kor_bird_w2_bow'))
    elif fname == 'Shumar.glb':
        # Row 4: Shumar Recurve Arrow
        m_arr = (tc[:, 0] < -0.05) & (tc[:, 1] >= 0.041) & (tc[:, 1] <= 0.063)
        Pa, Na, UVa, Ta = bridge_arrow_shaft(*submesh(P, N, UV, T, m_arr), radius=0.0026)
        out.append(('shumar_w5_arrow', 'Shumar Bronze-Tipped Recurve Arrow', 'arrow', 0.78, Pa, Na, UVa, Ta, 'shumar_w5_bow'))
    elif fname == 'paintedman.glb':
        # Row 4: Painted Man Feathered Arrow (fletching at x in [-0.44,-0.36], y in [0.042,0.064] + stone point from R1 lance tip)
        m_fl = (tc[:, 0] < -0.35) & (tc[:, 1] >= 0.042) & (tc[:, 1] <= 0.064)
        Pf, Nf, UVf, Tf = submesh(P, N, UV, T, m_fl)
        m_pt = (tc[:, 0] < -0.41) & (tc[:, 1] >= 0.470) & (tc[:, 1] <= 0.502)
        Pp, Np, UVp, Tp = submesh(P, N, UV, T, m_pt)
        # Flip point so tip points toward +X and place at x = -0.15
        R_flip = rot_z(180)
        pc = 0.5 * (Pp.min(0) + Pp.max(0))
        Pp = (Pp - pc) * 0.55 @ R_flip.T
        Np = Np @ R_flip.T
        y_mid = float(0.5 * (Pf[:, 1].min() + Pf[:, 1].max()))
        z_mid = float(0.5 * (Pf[:, 2].min() + Pf[:, 2].max()))
        Pp += np.array([-0.155, y_mid, z_mid])
        n0 = len(Pf)
        Pa = np.vstack([Pf, Pp]); Na = np.vstack([Nf, Np]); UVa = np.vstack([UVf, UVp]); Ta = np.vstack([Tf, Tp + n0])
        Pa, Na, UVa, Ta = bridge_arrow_shaft(Pa, Na, UVa, Ta, radius=0.0026)
        out.append(('pman_w5_arrow', 'Painted Man Feathered Arrow', 'arrow', 0.78, Pa, Na, UVa, Ta, 'pman_w5_bow'))
    elif fname == 'voth - ornate.glb':
        # Row 3: Voth Ornate Feathered Arrow (golden fletching at x in [-0.080,-0.038], y in [0.162,0.180] + obsidian point from R4)
        m_fl = (tc[:, 0] >= -0.080) & (tc[:, 0] <= -0.038) & (tc[:, 1] >= 0.162) & (tc[:, 1] <= 0.180)
        Pf, Nf, UVf, Tf = submesh(P, N, UV, T, m_fl)
        m_pt = (tc[:, 0] < -0.38) & (tc[:, 1] >= 0.056) & (tc[:, 1] <= 0.082)
        Pp, Np, UVp, Tp = submesh(P, N, UV, T, m_pt)
        pc = 0.5 * (Pp.min(0) + Pp.max(0))
        Pp = (Pp - pc) * 0.48
        y_mid = float(0.5 * (Pf[:, 1].min() + Pf[:, 1].max()))
        z_mid = float(0.5 * (Pf[:, 2].min() + Pf[:, 2].max()))
        Pp += np.array([-0.33, y_mid, z_mid])
        n0 = len(Pf)
        Pa = np.vstack([Pf, Pp]); Na = np.vstack([Nf, Np]); UVa = np.vstack([UVf, UVp]); Ta = np.vstack([Tf, Tp + n0])
        Pa, Na, UVa, Ta = bridge_arrow_shaft(Pa, Na, UVa, Ta, radius=0.0026)
        out.append(('voth_orn_w4_arrow', 'Voth Ornate Feathered Arrow', 'arrow', 0.78, Pa, Na, UVa, Ta, 'voth_orn_w4_bow'))
    return out


def extract_weapons_and_sheaths(fname, P, N, UV, T, w_specs):
    splits = find_row_splits(P, T)
    if fname == 'voth - ornate.glb':
        splits[3] = 0.11
    tc_all = P[T].mean(axis=1)
    w_mask = tc_all[:, 0] < 0.02
    if fname == 'korona - bog.glb':
        w_mask = w_mask & ~((tc_all[:, 1] > 0.48) & (tc_all[:, 1] < 0.72) & (tc_all[:, 0] > -0.015))
    drum_sheath_mesh = None
    if fname == 'drum.glb':
        s_mask = w_mask & (tc_all[:, 1] > 0.74) & (tc_all[:, 1] < 0.842)
        drum_sheath_mesh = submesh(P, N, UV, T, s_mask)
        w_mask = w_mask & ~((tc_all[:, 1] > 0.74) & (tc_all[:, 1] < 0.842))

    Pw, Nw, UVw, Tw = submesh(P, N, UV, T, w_mask)
    comps = connected_components_tris(Pw, Tw)

    rows = [[] for _ in range(5)]
    for idx in comps:
        v = Pw[Tw[idx].reshape(-1)]
        cx = 0.5 * (v[:, 0].min() + v[:, 0].max())
        cy = 0.5 * (v[:, 1].min() + v[:, 1].max())
        dx = np.ptp(v[:, 0])
        dy = np.ptp(v[:, 1])
        if fname == 'tungang.glb':
            if cx > -0.20:
                continue
        elif fname == 'korona - bog.glb' and cy > 0.50 and cy < 0.72 and cx > -0.02:
            continue
        else:
            if cx > -0.16 and dx < 0.16:
                continue
            if dx < 0.12 and dy < 0.12 and len(idx) < 400:
                continue
        r_idx = 4
        for k in range(4):
            if cy > splits[k]:
                r_idx = k
                break
        rows[r_idx].append((cy, cx, len(idx), dx, dy, idx))

    out_weapons = []
    out_sheaths = []
    for r_idx in range(5):
        cand = rows[r_idx]
        cand.sort(key=lambda x: -x[0])
        has_sheath = len(w_specs[r_idx]) >= 4 and bool(w_specs[r_idx][3])
        major = [c for c in cand if (c[3] >= 0.18 and c[2] >= 160) or fname == 'tungang.glb']
        if not major:
            major = [c for c in cand if c[3] >= 0.18]
        best_cy = major[0][0] if major else cand[0][0]
        chosen_idx = np.concatenate([c[5] for c in cand if abs(c[0] - best_cy) < 0.028])
        tmask = np.zeros(len(Tw), dtype=bool)
        tmask[chosen_idx] = True
        out_weapons.append(submesh(Pw, Nw, UVw, Tw, tmask))

        if has_sheath:
            if fname == 'drum.glb' and r_idx == 0 and drum_sheath_mesh is not None:
                out_sheaths.append(drum_sheath_mesh)
            else:
                rem = [c for c in cand if c[0] < best_cy - 0.032 and c[2] >= 160]
                if not rem:
                    rem = [c for c in cand if c[0] < best_cy - 0.032]
                if rem:
                    s_cy = rem[0][0]
                    s_idx = np.concatenate([c[5] for c in cand if abs(c[0] - s_cy) < 0.028])
                    smask = np.zeros(len(Tw), dtype=bool)
                    smask[s_idx] = True
                    out_sheaths.append(submesh(Pw, Nw, UVw, Tw, smask))
                else:
                    out_sheaths.append(None)
        else:
            out_sheaths.append(None)
    return out_weapons, out_sheaths


def profile(P):
    y0, y1 = P[:, 1].min(), P[:, 1].max()
    n = max(2, int(np.ceil((y1 - y0) / BIN)))
    k = np.minimum(((P[:, 1] - y0) / BIN).astype(int), n - 1)
    prof = np.zeros(n)
    for i in range(n):
        m = k == i
        if m.any():
            prof[i] = max(np.ptp(P[m, 0]), np.ptp(P[m, 2]))
    return prof, y0 + (np.arange(n) + 0.5) * BIN


def axis_at(P, y, half=0.04):
    m = np.abs(P[:, 1] - y) <= half
    if not m.any():
        m = np.abs(P[:, 1] - y) <= 4 * half
    if not m.any():
        return 0.0, 0.0
    return float(P[m, 0].mean()), float(P[m, 2].mean())


def orient_and_place(P, N, UV, T, kind, length, is_spliced_shield=False):
    """Orient mesh (P, N, UV, T) into the make_props.py grip frame and scale to `length` metres."""
    P = P.copy()
    N = N.copy()
    P -= 0.5 * (P.min(0) + P.max(0))

    if kind == 'shield':
        if not is_spliced_shield:
            # Put board in YZ plane (thin axis = X, longest axis = Y); in glTF, +Z is front face so rot_y(-90) sends front to -X
            exts = [np.ptp(P[:, 0]), np.ptp(P[:, 1]), np.ptp(P[:, 2])]
            thin = int(np.argmin(exts))
            if thin == 2:
                R = rot_y(-90)
                P = P @ R.T; N = N @ R.T
            elif thin == 1:
                R = rot_z(-90)
                P = P @ R.T; N = N @ R.T
            if np.ptp(P[:, 2]) > np.ptp(P[:, 1]) * 1.15:
                R = rot_x(90)
                P = P @ R.T; N = N @ R.T
        span = max(1e-4, max(np.ptp(P[:, 1]), np.ptp(P[:, 2])))
        P *= length / span
        if not is_spliced_shield and np.ptp(P[:, 0]) < 0.14 * length:
            x_back = np.percentile(P[:, 0], 88)
            Ph, Nh, UVh, Th = make_handle_strap_mesh(np.ptp(P[:, 1]), np.ptp(P[:, 2]), x_back, UV.mean(axis=0))
            n_prev = len(P)
            P = np.vstack([P, Ph]); N = np.vstack([N, Nh]); UV = np.vstack([UV, UVh]); T = np.vstack([T, Th + n_prev])
        back = np.percentile(P[:, 0], 88)
        grip = np.array([back - 0.022, 0.5 * (P[:, 1].min() + P[:, 1].max()), 0.5 * (P[:, 2].min() + P[:, 2].max())])
        P -= grip
        return P, N, UV, T, None, None

    if kind in ('rifle', 'pistol'):
        # Longest axis -> Z (barrel), second longest -> Y (grip-to-sight height), thinnest -> X
        exts = [np.ptp(P[:, 0]), np.ptp(P[:, 1]), np.ptp(P[:, 2])]
        order = np.argsort(exts)  # [thin, mid, long]
        # Build right-handed permutation mapping order[0]->X(0), order[1]->Y(1), order[2]->Z(2)
        R0 = np.zeros((3, 3), dtype=float)
        R0[0, order[0]] = 1.0
        R0[1, order[1]] = 1.0
        R0[2, order[2]] = 1.0
        if np.linalg.det(R0) < 0:
            R0[0, :] *= -1.0
        P = P @ R0.T; N = N @ R0.T
        P *= length / max(1e-4, np.ptp(P[:, 2]))
        # Muzzle (+Z) is narrower in Y than the stock/grip end (-Z)
        z_mid = 0.5 * (P[:, 2].min() + P[:, 2].max())
        y_pos_z = np.ptp(P[P[:, 2] >= z_mid, 1]) if (P[:, 2] >= z_mid).any() else 0.0
        y_neg_z = np.ptp(P[P[:, 2] < z_mid, 1]) if (P[:, 2] < z_mid).any() else 0.0
        if y_pos_z > y_neg_z:
            R = rot_y(180)
            P = P @ R.T; N = N @ R.T
        # Top rail/barrel (+Y) has points spanning the full Z length, while trigger/grip (-Y) is concentrated in rear half
        y_mid = 0.5 * (P[:, 1].min() + P[:, 1].max())
        z_top = np.ptp(P[P[:, 1] >= y_mid, 2]) if (P[:, 1] >= y_mid).any() else 0.0
        z_bot = np.ptp(P[P[:, 1] < y_mid, 2]) if (P[:, 1] < y_mid).any() else 0.0
        if z_bot > z_top:
            R = rot_z(180)
            P = P @ R.T; N = N @ R.T
        zlo, zhi = P[:, 2].min(), P[:, 2].max()
        ylo, yhi = P[:, 1].min(), P[:, 1].max()
        L = zhi - zlo
        H = yhi - ylo
        if kind == 'rifle':
            grip = np.array([0.0, ylo + 0.38 * H, zlo + 0.30 * L])
            support = [0.0, 0.06, 0.16, 0.0, 0.06, 0.42]
        else:
            grip = np.array([0.0, ylo + 0.38 * H, zlo + 0.22 * L])
            support = [0.04, -0.03, 0.02, 0.04, -0.03, 0.02]
        P -= grip
        return P, N, UV, T, None, support

    if kind == 'crossbow':
        # Stock along Z, prod (wide bow limbs) along X, height along Y
        exts = [np.ptp(P[:, 0]), np.ptp(P[:, 1]), np.ptp(P[:, 2])]
        order = np.argsort(exts)  # [thin(Y), mid(X or Z), long(Z or X)]
        R0 = np.zeros((3, 3), dtype=float)
        R0[1, order[0]] = 1.0     # thinnest -> Y
        R0[0, order[1]] = 1.0     # prod -> X
        R0[2, order[2]] = 1.0     # stock -> Z
        if np.linalg.det(R0) < 0:
            R0[0, :] *= -1.0
        P = P @ R0.T; N = N @ R0.T
        P *= length / max(1e-4, np.ptp(P[:, 2]))
        z_mid = 0.5 * (P[:, 2].min() + P[:, 2].max())
        x_front = np.ptp(P[P[:, 2] >= z_mid, 0])
        x_rear = np.ptp(P[P[:, 2] < z_mid, 0])
        if x_rear > x_front:
            R = rot_y(180)
            P = P @ R.T; N = N @ R.T
        zlo, zhi = P[:, 2].min(), P[:, 2].max()
        ylo, yhi = P[:, 1].min(), P[:, 1].max()
        grip = np.array([0.0, ylo + 0.40 * (yhi - ylo), zlo + 0.32 * (zhi - zlo)])
        P -= grip
        support = [0.0, 0.075, 0.10, 0.0, 0.075, 0.30]
        return P, N, UV, T, None, support

    if kind == 'arrow':
        # Bow arrow in make_props.py / 50-figure.js bowString() frame:
        # Longest axis along +Z from nock (0, 0, 0) to arrowhead (0, 0, +length)
        exts = [np.ptp(P[:, 0]), np.ptp(P[:, 1]), np.ptp(P[:, 2])]
        order = np.argsort(exts)  # [thin, mid, long]
        R0 = np.zeros((3, 3), dtype=float)
        R0[0, order[0]] = 1.0     # thin -> X
        R0[1, order[1]] = 1.0     # mid -> Y (feather vane height)
        R0[2, order[2]] = 1.0     # long -> Z (shaft)
        if np.linalg.det(R0) < 0:
            R0[0, :] *= -1.0
        P = P @ R0.T; N = N @ R0.T
        P *= length / max(1e-4, np.ptp(P[:, 2]))
        zlo, zhi = P[:, 2].min(), P[:, 2].max()
        L = zhi - zlo
        lo_m = P[:, 2] <= zlo + 0.22 * L
        hi_m = P[:, 2] >= zhi - 0.22 * L
        w_lo = max(np.ptp(P[lo_m, 0]), np.ptp(P[lo_m, 1])) if lo_m.any() else 0.0
        w_hi = max(np.ptp(P[hi_m, 0]), np.ptp(P[hi_m, 1])) if hi_m.any() else 0.0
        if w_hi > w_lo:
            # Fletching is at +Z; rotate 180 deg around Y so fletching/nock is at -Z and arrowhead is at +Z
            R = rot_y(180)
            P = P @ R.T; N = N @ R.T
        zlo, zhi = P[:, 2].min(), P[:, 2].max()
        L = zhi - zlo
        mid_m = np.abs(P[:, 2] - (zlo + 0.5 * L)) <= 0.25 * L
        gx = float(P[mid_m, 0].mean()) if mid_m.any() else 0.0
        gy = float(P[mid_m, 1].mean()) if mid_m.any() else 0.0
        P -= np.array([gx, gy, zlo])
        return P, N, UV, T, None, None

    # All shaft/blade/bow/dart weapons: align longest axis to Y, second-longest to Z, thinnest to X
    exts = [np.ptp(P[:, 0]), np.ptp(P[:, 1]), np.ptp(P[:, 2])]
    order = np.argsort(exts)  # [thin, mid, long]
    R0 = np.zeros((3, 3), dtype=float)
    R0[0, order[0]] = 1.0     # thin -> X
    R0[2, order[1]] = 1.0     # mid -> Z
    R0[1, order[2]] = 1.0     # long -> Y
    if np.linalg.det(R0) < 0:
        R0[0, :] *= -1.0
    P = P @ R0.T; N = N @ R0.T
    P *= length / max(1e-4, np.ptp(P[:, 1]))

    if kind == 'bow':
        # Limbs along Y, curve bending toward -Z (string at -Z, front belly at +Z)
        mid_mask = np.abs(P[:, 1]) < 0.15 * length
        end_mask = np.abs(P[:, 1]) > 0.35 * length
        if mid_mask.any() and end_mask.any():
            if P[mid_mask, 2].mean() < P[end_mask, 2].mean():
                R = rot_y(180)
                P = P @ R.T; N = N @ R.T
        gx, gz = axis_at(P, 0.0, half=0.08)
        grip = np.array([gx, 0.0, gz])
        P -= grip
        return P, N, UV, T, None, None

    if kind == 'sheath':
        # Longest axis -> Y (+Y = mouth/throat of sheath, -Y = chape/tip), mid -> Z (width/rings), thin -> X (flat)
        prof, _ = profile(P)
        n_half = max(1, len(prof) // 2)
        if prof[:n_half].mean() > prof[-n_half:].mean():
            P = P @ FLIP.T; N = N @ FLIP.T
        ylo, yhi = P[:, 1].min(), P[:, 1].max()
        L = yhi - ylo
        susp_y = ylo + 0.72 * L
        gx, gz = axis_at(P, susp_y)
        P -= np.array([gx, susp_y, gz])
        return P, N, UV, T, None, None

    if kind == 'dart':
        # Hand-held / thrown dart or blowgun dart: longest axis along Y (+Y = sharp tip, -Y = fletching/tuft)
        ylo, yhi = P[:, 1].min(), P[:, 1].max()
        L = yhi - ylo
        lo_m = P[:, 1] <= ylo + 0.22 * L
        hi_m = P[:, 1] >= yhi - 0.22 * L
        w_lo = max(np.ptp(P[lo_m, 0]), np.ptp(P[lo_m, 2])) if lo_m.any() else 0.0
        w_hi = max(np.ptp(P[hi_m, 0]), np.ptp(P[hi_m, 2])) if hi_m.any() else 0.0
        if w_hi > w_lo:
            P = P @ FLIP.T; N = N @ FLIP.T
        ylo, yhi = P[:, 1].min(), P[:, 1].max()
        L = yhi - ylo
        grip_y = ylo + 0.42 * L
        gx, gz = axis_at(P, grip_y)
        P -= np.array([gx, grip_y, gz])
        blade = [round(float(0.22 * L), 3), round(float(yhi - grip_y), 3)]
        return P, N, UV, T, blade, None

    prof, yc = profile(P)
    top = int(prof.argmax())
    L = P[:, 1].max() - P[:, 1].min()
    head_up = yc[top] > 0
    if kind in ('sword', 'scimitar', 'dagger'):
        flip = head_up
    else:
        flip = not head_up
    if flip:
        P = P @ FLIP.T; N = N @ FLIP.T
        prof, yc = profile(P)
        top = int(prof.argmax())

    ylo, yhi = P[:, 1].min(), P[:, 1].max()
    blade = support = None

    if kind in ('sword', 'scimitar', 'dagger'):
        g = top
        while g > 0 and prof[g - 1] > 0.5 * prof[top]:
            g -= 1
        guard_lo = yc[g] - BIN / 2
        off = 0.05 if kind == 'dagger' else 0.09
        grip_y = max(ylo + 0.06 * L, min(ylo + 0.32 * L, guard_lo - off))
        gx, gz = axis_at(P, grip_y)
        grip = np.array([gx, grip_y, gz])
        above = P[P[:, 1] > grip_y + 0.08 * L]
        if len(above) > 10 and np.ptp(above[:, 0]) > np.ptp(above[:, 2]):
            R2 = rot_y(90); P = P @ R2.T; N = N @ R2.T; grip = R2 @ grip
        if kind == 'scimitar':
            tip_pts = P[P[:, 1] > yhi - 0.12 * L]
            if len(tip_pts) > 0 and (tip_pts[:, 2].mean() - grip[2]) > 0:
                R2 = rot_y(180); P = P @ R2.T; N = N @ R2.T; grip = R2 @ grip
        blade = [float(max(0.05, grip_y + 0.06 * L - grip[1])), float(yhi - grip[1])]
        if kind in ('sword', 'scimitar'):
            support = [0.0, -0.10, 0.0, 0.0, -0.10, 0.0]
    elif kind in ('axe', 'mace'):
        grip_y = ylo + 0.18 * L
        gx, gz = axis_at(P, grip_y)
        grip = np.array([gx, grip_y, gz])
        lo = top
        while lo > 0 and prof[lo - 1] > 0.5 * prof[top]:
            lo -= 1
        hi = top
        while hi + 1 < len(prof) and prof[hi + 1] > 0.5 * prof[top]:
            hi += 1
        head = P[(P[:, 1] >= yc[lo] - BIN / 2) & (P[:, 1] <= yc[hi] + BIN / 2)]
        if len(head) > 10 and np.ptp(head[:, 0]) > np.ptp(head[:, 2]):
            R2 = rot_y(90); P = P @ R2.T; N = N @ R2.T; grip = R2 @ grip
            head = head @ R2.T
        if kind == 'axe' and len(head) > 0 and head[:, 2].mean() < grip[2]:
            R2 = rot_y(180); P = P @ R2.T; N = N @ R2.T; grip = R2 @ grip
        b0 = max(0.25 * L, float(yc[lo] - BIN / 2 - grip[1]))
        b1 = max(b0 + 0.10, float(yc[hi] + BIN / 2 - grip[1]))
        blade = [b0, b1]
        support = [0.0, -0.10, 0.0, 0.0, float(max(0.25, b0 * 0.8)), 0.0]
    elif kind in ('spear', 'staff', 'sling'):
        frac = 0.35 if kind == 'spear' else 0.42
        grip_y = ylo + frac * L
        gx, gz = axis_at(P, grip_y)
        grip = np.array([gx, grip_y, gz])
        lo = top
        while lo > 0 and prof[lo - 1] > 0.5 * prof[top]:
            lo -= 1
        b0 = max(0.35 * L, float(yc[lo] - BIN / 2 - grip[1]))
        blade = [b0, float(yhi - grip[1])]
        if kind != 'sling':
            support = [0.0, 0.25, 0.0, 0.0, float(max(0.45, b0 * 0.85)), 0.0]
    else:
        raise SystemExit(f"Unknown kind: {kind}")

    P -= grip
    return P, N, UV, T, blade, support


def encode_textures_from_rig(rig):
    """Pre-encode textures from a source GLB once so multi-item sheets don't re-encode 10 times."""
    src = rig.material
    pbr = src.get('pbrMetallicRoughness', {})
    blobs = {}

    def enc(ti, px, q=85):
        img = glbio.image(rig, ti).convert('RGB')
        if max(img.size) > px:
            img = img.resize((px, px), Image.LANCZOS)
        out = io.BytesIO()
        img.save(out, 'JPEG', quality=q)
        return out.getvalue(), img

    base_img = None
    if 'baseColorTexture' in pbr:
        blobs['base'], base_img = enc(pbr['baseColorTexture']['index'], 1024, 84)
    if 'metallicRoughnessTexture' in pbr:
        blobs['mr'], _ = enc(pbr['metallicRoughnessTexture']['index'], 256, 85)
    if 'normalTexture' in src:
        blobs['nrm'], _ = enc(src['normalTexture']['index'], 512, 85)
    blobs['metallicFactor'] = pbr.get('metallicFactor', 1.0)
    blobs['roughnessFactor'] = pbr.get('roughnessFactor', 1.0)
    blobs['baseColorFactor'] = pbr.get('baseColorFactor', [0.8, 0.8, 0.8, 1.0])
    blobs['base_pil'] = base_img
    return blobs


def write_prop_glb(path, pid, P, N, UV, T, tex_blobs):
    g = glbio.GlbWriter()
    g.j['asset']['generator'] = 'core/charactermodels/import_arms.py'
    imgs, texs = [], []

    def add_tex(raw_bytes):
        imgs.append({'bufferView': g.view(raw_bytes), 'mimeType': 'image/jpeg'})
        texs.append({'source': len(imgs) - 1, 'sampler': 0})
        return {'index': len(texs) - 1}

    m = {
        'name': 'prop.' + pid,
        'pbrMetallicRoughness': {
            'metallicFactor': tex_blobs['metallicFactor'],
            'roughnessFactor': tex_blobs['roughnessFactor'],
        }
    }
    if 'base' in tex_blobs:
        m['pbrMetallicRoughness']['baseColorTexture'] = add_tex(tex_blobs['base'])
    if 'mr' in tex_blobs:
        m['pbrMetallicRoughness']['metallicRoughnessTexture'] = add_tex(tex_blobs['mr'])
    if 'nrm' in tex_blobs:
        m['normalTexture'] = add_tex(tex_blobs['nrm'])
    if imgs:
        g.j['images'], g.j['textures'] = imgs, texs
        g.j['samplers'] = [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]
    g.j['materials'] = [m]
    prim = {
        'attributes': {
            'POSITION': g.acc(P.astype(np.float32), 'VEC3', 34962, minmax=True),
            'NORMAL': g.acc(N.astype(np.float32), 'VEC3', 34962),
            'TEXCOORD_0': g.acc(UV.astype(np.float32), 'VEC2', 34962),
        },
        'indices': g.acc(T.reshape(-1).astype(np.uint32), 'SCALAR', 34963),
        'material': 0,
    }
    g.j['meshes'] = [{'name': pid, 'primitives': [prim]}]
    g.j['nodes'] = [{'name': pid, 'mesh': 0}]
    g.j['scenes'], g.j['scene'] = [{'nodes': [0]}], 0
    with open(path, 'wb') as f:
        f.write(g.bytes())


def render_prop_thumb(out_png, P, N, UV, T, base_pil=None, vtx_rgb=None, kind='sword'):
    """Fast supersampled 224x224 -> 128x128 RGBA software rasterizer with per-pixel UV texture sampling & 3-point lighting."""
    W = H = 224
    P_v = P.copy()
    N_v = N.copy()
    if kind == 'shield':
        # Shield front face points toward -X; rot_y(+102) rotates -X toward +Z camera, tilted slightly for 3D depth
        R = rot_x(10) @ rot_y(102)
    elif kind in ('rifle', 'pistol', 'crossbow', 'arrow'):
        # Barrel/shaft is +Z, grip/fletching is Y; rotate so side profile (+Z to right, +Y up) faces +Z camera at a 28 deg angle
        R = rot_z(28) @ rot_x(14) @ rot_y(-75)
    else:
        # Shaft/blade is +Y, edge is +Z; show broadside (+Z/+Y) tilted -34 deg diagonally across frame
        R = rot_z(-34) @ rot_x(12) @ rot_y(-72)
    P_v = P_v @ R.T
    N_v = N_v @ R.T

    lo, hi = P_v.min(0), P_v.max(0)
    mid = 0.5 * (lo + hi)
    P_v -= mid
    span = max(1e-4, max(hi[0] - lo[0], hi[1] - lo[1]))
    scale = (W * 0.85) / span
    sx = P_v[:, 0] * scale + W * 0.5
    sy = -P_v[:, 1] * scale + H * 0.5
    sz = P_v[:, 2] * scale

    t0, t1, t2 = T[:, 0], T[:, 1], T[:, 2]
    n_tri = N_v[t0] + N_v[t1] + N_v[t2]
    n_len = np.linalg.norm(n_tri, axis=1, keepdims=True)
    face_n = np.cross(P_v[t1] - P_v[t0], P_v[t2] - P_v[t0])
    fn_len = np.linalg.norm(face_n, axis=1, keepdims=True)
    n_tri = np.where(n_len > 1e-6, n_tri / np.maximum(n_len, 1e-6), face_n / np.maximum(fn_len, 1e-6))
    flip_n = n_tri[:, 2] < 0
    n_tri[flip_n] *= -1.0

    l1 = np.array([0.38, 0.52, 0.76])
    l2 = np.array([-0.55, -0.25, 0.45])
    shade = (0.38 + 0.54 * np.clip(n_tri @ l1, 0.0, 1.0) + 0.18 * np.clip(n_tri @ l2, 0.0, 1.0)).astype(np.float32)

    tex_arr = None
    th = tw = 0
    if base_pil is not None:
        tex_arr = np.asarray(base_pil.convert('RGB'), dtype=np.float32)
        th, tw = tex_arr.shape[:2]
    elif vtx_rgb is not None:
        tri_rgb = np.clip(vtx_rgb * shade[:, None] * 255.0, 0, 255).astype(np.uint8)
    else:
        tri_rgb = np.clip(np.full((len(T), 3), 0.72, dtype=np.float32) * shade[:, None] * 255.0, 0, 255).astype(np.uint8)

    z_avg = (sz[t0] + sz[t1] + sz[t2]) / 3.0
    order = np.argsort(z_avg)

    img_buf = np.zeros((H, W, 4), dtype=np.uint8)
    z_buf = np.full((H, W), -1e9, dtype=np.float32)

    x0_a, y0_a, z0_a = sx[t0], sy[t0], sz[t0]
    x1_a, y1_a, z1_a = sx[t1], sy[t1], sz[t1]
    x2_a, y2_a, z2_a = sx[t2], sy[t2], sz[t2]
    u0_a, v0_a = UV[t0, 0], UV[t0, 1]
    u1_a, v1_a = UV[t1, 0], UV[t1, 1]
    u2_a, v2_a = UV[t2, 0], UV[t2, 1]

    for idx in order:
        x0, y0, z0 = x0_a[idx], y0_a[idx], z0_a[idx]
        x1, y1, z1 = x1_a[idx], y1_a[idx], z1_a[idx]
        x2, y2, z2 = x2_a[idx], y2_a[idx], z2_a[idx]
        ix0 = max(0, int(min(x0, x1, x2)))
        ix1 = min(W - 1, int(max(x0, x1, x2)) + 1)
        iy0 = max(0, int(min(y0, y1, y2)))
        iy1 = min(H - 1, int(max(y0, y1, y2)) + 1)
        if ix0 > ix1 or iy0 > iy1:
            continue
        denom = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if abs(denom) < 1e-5:
            continue
        inv_d = 1.0 / denom
        py, px = np.mgrid[iy0:iy1 + 1, ix0:ix1 + 1]
        px = px + 0.5
        py = py + 0.5
        w0 = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) * inv_d
        w1 = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) * inv_d
        w2 = 1.0 - w0 - w1
        inside = (w0 >= -1e-4) & (w1 >= -1e-4) & (w2 >= -1e-4)
        if not inside.any():
            continue
        pz = w0 * z0 + w1 * z1 + w2 * z2
        z_slice = z_buf[iy0:iy1 + 1, ix0:ix1 + 1]
        hit = inside & (pz >= z_slice)
        if hit.any():
            z_slice[hit] = pz[hit]
            c_slice = img_buf[iy0:iy1 + 1, ix0:ix1 + 1]
            if tex_arr is not None:
                pu = np.mod(w0[hit] * u0_a[idx] + w1[hit] * u1_a[idx] + w2[hit] * u2_a[idx], 1.0)
                pv = np.mod(w0[hit] * v0_a[idx] + w1[hit] * v1_a[idx] + w2[hit] * v2_a[idx], 1.0)
                tx = np.clip((pu * (tw - 1)).astype(int), 0, tw - 1)
                ty = np.clip((pv * (th - 1)).astype(int), 0, th - 1)
                c_slice[hit, :3] = np.clip(tex_arr[ty, tx] * shade[idx], 0, 255).astype(np.uint8)
            else:
                c_slice[hit, :3] = tri_rgb[idx]
            c_slice[hit, 3] = 255

    im = Image.fromarray(img_buf, 'RGBA').resize((128, 128), Image.LANCZOS)
    im.save(out_png)


def render_existing_prop_thumb(glb_path, out_png, kind='sword'):
    j, b = glbio.read_glb(open(glb_path, 'rb').read())
    mats = j.get('materials', [])
    imgs = j.get('images', [])
    texs = j.get('textures', [])
    P_all, N_all, UV_all, T_all, C_all = [], [], [], [], []
    v_off = 0
    base_pil = None
    for m in j.get('meshes', []):
        for p in m.get('primitives', []):
            if p.get('mode', 4) != 4 or 'indices' not in p:
                continue
            pos = glbio.accessor(j, b, p['attributes']['POSITION']).astype(float)
            nrm = glbio.accessor(j, b, p['attributes']['NORMAL']).astype(float) if 'NORMAL' in p['attributes'] else np.zeros_like(pos)
            uv = glbio.accessor(j, b, p['attributes']['TEXCOORD_0']).astype(float) if 'TEXCOORD_0' in p['attributes'] else np.zeros((len(pos), 2))
            tri = glbio.accessor(j, b, p['indices']).reshape(-1, 3).astype(np.int64)
            mi = p.get('material', 0)
            col = [0.72, 0.72, 0.72]
            if mi < len(mats):
                pbr = mats[mi].get('pbrMetallicRoughness', {})
                if 'baseColorFactor' in pbr:
                    col = pbr['baseColorFactor'][:3]
                if 'baseColorTexture' in pbr and base_pil is None:
                    ti = pbr['baseColorTexture']['index']
                    si = texs[ti]['source']
                    bv = j['bufferViews'][imgs[si]['bufferView']]
                    o = bv.get('byteOffset', 0)
                    base_pil = Image.open(io.BytesIO(b[o:o + bv['byteLength']]))
            P_all.append(pos)
            N_all.append(nrm)
            UV_all.append(uv)
            T_all.append(tri + v_off)
            C_all.append(np.tile(np.array(col, dtype=np.float32), (len(tri), 1)))
            v_off += len(pos)
    if not P_all:
        return
    P = np.vstack(P_all)
    N = np.vstack(N_all)
    UV = np.vstack(UV_all)
    T = np.vstack(T_all)
    C = np.vstack(C_all)
    render_prop_thumb(out_png, P, N, UV, T, base_pil=base_pil, vtx_rgb=C, kind=kind)


# 21 Two-Column Tripo Culture Sheets specification:
# (filename, id_prefix, people, culture_label, subset, [(w_kind, w_len, w_label, has_sheath), ...], [s_label_1..5])
TRIPO_SHEETS = [
    ('voth - ornate.glb', 'voth_orn', 'chichani', 'Chichani (Voth)', 'Voth Ornate', [
        ('scimitar', 1.00, 'Voth Ornate Curved Macuahuitl', True),
        ('sword', 0.98, 'Voth Ornate Obsidian Broadsword', True),
        ('mace', 1.05, 'Voth Ornate Sun-Crest Scepter Mace', False),
        ('bow', 1.40, 'Voth Ornate Feathered War Bow', True),
        ('spear', 1.85, 'Voth Ornate Serpent Spear', False),
    ], ['Voth Ornate Sun-Disc Shield', 'Voth Ornate Step-Fret Shield', 'Voth Ornate Feathered Chimalli', 'Voth Ornate Jaguar Buckler', 'Voth Ornate Turquoise Shield']),
    ('drum.glb', 'voth_drum', 'chichani', 'Chichani (Voth)', 'Voth Drum', [
        ('sword', 0.96, 'Voth Drum-Hilt Sword', True),
        ('scimitar', 0.95, 'Voth Drum Curved War-Blade', False),
        ('axe', 0.95, 'Voth Drum-Crest Battle Axe', False),
        ('mace', 0.88, 'Voth Drum-Head War Club', False),
        ('spear', 1.85, 'Voth Drum-Banner Spear', False),
    ], ['Voth Drum Hide Shield I', 'Voth Drum Hide Shield II', 'Voth Drum Resonator Shield', 'Voth Drum Ceremonial Shield', 'Voth Drum Tower Shield']),
    ('torus.glb', 'voth_torus', 'chichani', 'Chichani (Voth)', 'Voth Torus', [
        ('sword', 1.00, 'Voth Torus Ring-Broadsword', True),
        ('scimitar', 0.95, 'Voth Torus Curved Ring-Saber', False),
        ('axe', 0.95, 'Voth Torus Crescent Axe', False),
        ('mace', 0.90, 'Voth Torus Disc Mace', False),
        ('spear', 1.85, 'Voth Torus Ring-Head Spear', False),
    ], ['Voth Torus Ring Buckler', 'Voth Torus Annular Shield', 'Voth Torus Sun-Wheel Shield', 'Voth Torus Jade-Ring Shield', 'Voth Torus Eclipse Oval Shield']),
    ('andaru.glb', 'and1', 'andaru', 'Andaru', 'Andaru Set 1', [
        ('sword', 0.96, 'Andaru Broadsword', False),
        ('spear', 1.90, 'Andaru Cavalry Lance', False),
        ('dagger', 0.48, 'Andaru Jambiya Dagger', False),
        ('axe', 0.95, 'Andaru Tabar Battle Axe', False),
        ('mace', 0.88, 'Andaru Flanged Mace', False),
    ], ['Andaru Bronze Boss Shield', 'Andaru Crescent Sipar Shield', 'Andaru Sunburst Round Shield', 'Andaru Gilded Kalkan Shield', 'Andaru Royal Guard Shield']),
    ('andaru 2.glb', 'and2', 'andaru', 'Andaru', 'Andaru Set 2', [
        ('sword', 0.96, 'Andaru Royal Straight Sword', True),
        ('scimitar', 0.95, 'Andaru Ornate Kilij', False),
        ('spear', 1.90, 'Andaru Winged Spear', False),
        ('axe', 0.95, 'Andaru Double-Bit Tabar', False),
        ('mace', 0.88, 'Andaru Bull-Head Mace', False),
    ], ['Andaru Enamel Sipar I', 'Andaru Enamel Sipar II', 'Andaru Lion-Boss Shield', 'Andaru Star-Crest Shield', 'Andaru Teardrop Kite Shield']),
    ('zeijani guard.glb', 'zeij_grd', 'zeijani', 'Zeijani', 'Zeijani Guard', [
        ('sword', 0.96, 'Zeijani Guard Officer Sword', True),
        ('spear', 1.85, 'Zeijani Guard Halberd Pike', False),
        ('axe', 0.92, 'Zeijani Guard Trench Axe', False),
        ('mace', 0.88, 'Zeijani Guard Shock Mace', False),
        ('spear', 1.90, 'Zeijani Guard Partisan Spear', False),
    ], ['Zeijani Guard Riot Shield', 'Zeijani Guard Tower Shield', 'Zeijani Guard Buckler', 'Zeijani Guard Chevrons Shield', 'Zeijani Guard Bastion Shield']),
    ('zeijani jungle camo.glb', 'zeij_camo', 'zeijani', 'Zeijani', 'Zeijani Jungle Camo', [
        ('sword', 0.92, 'Zeijani Jungle Machete Sword', True),
        ('scimitar', 0.92, 'Zeijani Jungle Curved Brush-Saber', False),
        ('axe', 0.88, 'Zeijani Jungle Tomahawk Axe', False),
        ('mace', 0.85, 'Zeijani Jungle Breaching Club', False),
        ('spear', 1.85, 'Zeijani Jungle Boar Spear', False),
    ], ['Zeijani Camo Round Targe', 'Zeijani Camo Bark Shield', 'Zeijani Camo Skirmish Buckler', 'Zeijani Camo Leaf-Pattern Shield', 'Zeijani Camo Patrol Shield']),
    ('pylon.glb', 'zeij_pylon', 'zeijani', 'Zeijani', 'Zeijani Pylon', [
        ('sword', 1.00, 'Pylon Arc Broadsword', True),
        ('scimitar', 0.95, 'Pylon Curved Conduit Saber', False),
        ('axe', 0.95, 'Pylon Cleaver Axe', False),
        ('mace', 0.90, 'Pylon Resonator Mace', False),
        ('spear', 1.85, 'Pylon Conduit Lance', False),
    ], ['Pylon Hex Aegis I', 'Pylon Coil Round Shield', 'Pylon Spire Tower Shield', 'Pylon Capacitor Buckler', 'Pylon Monolith Shield']),
    ('republic.glb', 'rep_std', 'iron_republic', 'Iron Republic', 'Republic Standard', [
        ('spear', 1.90, 'Republic Infantry Halberd', False),
        ('sword', 0.98, 'Republic Heavy Broadsword', True),
        ('scimitar', 0.95, 'Republic Officer Saber', True),
        ('axe', 0.92, 'Republic Boarding Axe', False),
        ('crossbow', 0.88, 'Republic Heavy Siege Arbalest', False),
    ], ['Republic Riveted Ballistic Shield', 'Republic Siege Mantlet Shield', 'Republic Trench Gun-Shield', 'Republic Sapper Buckler', 'Republic Ironclad Pavise']),
    ('shell.glb', 'shell', 'islanders', 'Ring Sea (Shell)', 'Shell Set', [
        ('sword', 0.95, 'Shell Coral-Tooth Sword', True),
        ('scimitar', 0.94, 'Shell Abalone Wave-Saber', True),
        ('axe', 0.95, 'Shell Giant-Clam Axe', False),
        ('mace', 0.88, 'Shell Conch-Spire Club', False),
        ('spear', 1.90, 'Shell Trident Harpoon', False),
    ], ['Shell Nautilus Shield', 'Shell Scallop Crest Shield', 'Shell Abalone Oval Shield', 'Shell Sea-Urchin Buckler', 'Shell Horseshoe Carapace Shield']),
    ('lizard.glb', 'liz1', 'lizardmen', 'Lizardmen', 'Lizard Set 1', [
        ('sword', 0.95, 'Lizard Fang Macuahuitl', False),
        ('scimitar', 0.95, 'Lizard Claw Curved Cleaver', False),
        ('spear', 1.85, 'Lizard Barbed Hunting Spear', False),
        ('axe', 0.95, 'Lizard Bone-Crest Axe', False),
        ('crossbow', 0.86, 'Lizard Bone-Prod Crossbow', False),
    ], ['Lizard Scale Round Shield', 'Lizard Croc-Hide Tower Shield', 'Lizard Rib-Bone Shield', 'Lizard Raptor-Skull Buckler', 'Lizard Frilled Carapace Shield']),
    ('lizard 2.glb', 'liz2', 'lizardmen', 'Lizardmen', 'Lizard Set 2', [
        ('sword', 0.95, 'Lizard Jade Broadsword', False),
        ('scimitar', 0.95, 'Lizard Serpent Curved Saber', False),
        ('axe', 0.95, 'Lizard Twin-Fang Battle Axe', False),
        ('spear', 1.85, 'Lizard Serpent Glaive', False),
        ('crossbow', 0.86, 'Lizard Swamp Repeater Crossbow', False),
    ], ['Lizard Jade-Boss Buckler', 'Lizard Horned Hide Shield', 'Lizard Fang-Rim Oval Shield', 'Lizard Swamp-Turtle Shield', 'Lizard Great Totem Pavise']),
    ('xanadu.glb', 'xan', 'xanadu', 'Xanadu', 'Xanadu Set', [
        ('scimitar', 0.95, 'Xanadu Imperial Dao', True),
        ('sword', 0.96, 'Xanadu Scholar Jian Sword', True),
        ('spear', 1.90, 'Xanadu Red-Tassel Qiang Spear', False),
        ('mace', 0.88, 'Xanadu Gilded Melon Hammer', False),
        ('bow', 1.40, 'Xanadu Reflex Horn Bow', True),
    ], ['Xanadu Tiger-Face 藤牌 Shield', 'Xanadu Cloud-Lacquer Shield', 'Xanadu Imperial Lotus Shield', 'Xanadu Phoenix-Crest Shield', 'Xanadu Fortress Pavilion Shield']),
    ('tungang.glb', 'tg_set', 'tungang', 'Tungangs', 'Tungang Set', [
        ('axe', 0.92, 'Tungang Heavy Mining Pickaxe', False),
        ('mace', 0.92, 'Tungang Riveter Sledgehammer', False),
        ('mace', 0.85, 'Tungang Wrecking Prybar', False),
        ('mace', 0.85, 'Tungang Heavy Pipe-Wrench Club', False),
        ('axe', 1.15, 'Tungang Long-Handled Deck Scraper', False),
    ], ['Tungang Porthole Hatch Shield', 'Tungang Riveted Hull Shield', 'Tungang Buoy-Ring Shield', 'Tungang Boiler-Door Pavise', 'Tungang Barnacle Plate Shield']),
    ('paintedman.glb', 'pman', 'painted_men', 'Painted Men', 'Painted Men Set', [
        ('sword', 0.95, 'Painted Man Bone-Inlaid Sword', True),
        ('spear', 1.85, 'Painted Man Feathered Lance', False),
        ('axe', 0.85, 'Painted Man Stone Tomahawk', False),
        ('dagger', 0.48, 'Painted Man Knapped Flint Knife', True),
        ('bow', 1.40, 'Painted Man Sinew-Backed Bow', False),
    ], ['Painted Man Handprint Hide Shield', 'Painted Man Horned Wing Shield', 'Painted Man Spiral Sun Shield', 'Painted Man Bone-Spoke Shield', 'Painted Man Medicine Wheel Shield']),
    ('korona - bog.glb', 'kor_bog', 'korona', 'Korona (Abyssal)', 'Korona Bog', [
        ('spear', 1.65, 'Korona Bog-Reed Blowgun', True),
        ('bow', 1.38, 'Korona Bog-Yew Hunting Bow', False),
        ('mace', 0.92, 'Korona Bog-Oak Paddle War-Club', False),
        ('mace', 0.85, 'Korona Bog-Root Ball Club', False),
        ('dagger', 0.48, 'Korona Bog-Iron Carving Knife', True),
    ], ['Korona Bog-Oak Round Shield', 'Korona Moss-Wicker Shield', 'Korona Peat-Hide Buckler', 'Korona Fen-Serpent Shield', 'Korona Mire-Bark Oval Shield']),
    ('korona - bird.glb', 'kor_bird', 'korona', 'Korona (Abyssal)', 'Korona Bird', [
        ('spear', 1.65, 'Korona Bird-Clan Plumed Blowgun', True),
        ('bow', 1.38, 'Korona Bird-Clan Feather Bow', False),
        ('mace', 0.92, 'Korona Bird-Clan Wing-Paddle Club', False),
        ('mace', 0.85, 'Korona Bird-Clan Talon Ball-Club', False),
        ('dagger', 0.48, 'Korona Bird-Clan Beak Knife', True),
    ], ['Korona Feather-Rim Round Shield', 'Korona Wing-Pair Shield', 'Korona Owl-Visage Buckler', 'Korona Hawk-Pinion Shield', 'Korona Crane-Crest Oval Shield']),
    ('dasri.glb', 'dasri', 'dasri', 'Dasri', 'Dasri Set', [
        ('spear', 1.90, 'Dasri Steel-Tipped Cavalry Lance', False),
        ('scimitar', 0.95, 'Dasri Curved Shamshir', True),
        ('dagger', 0.48, 'Dasri Curved Jambiya Dagger', False),
        ('rifle', 1.15, 'Dasri Inlaid Matchlock Jezail', False),
        ('sling', 0.92, 'Dasri Braided Desert Sling', False),
    ], ['Dasri Four-Boss Dhal I', 'Dasri Brass-Studded Dhal II', 'Dasri Velvet-Rim Buckler', 'Dasri Sunburst Dhal Shield', 'Dasri Rhinoceros-Hide Shield']),
    ('Shumar.glb', 'shumar', 'shumar', 'Shumar', 'Shumar Set', [
        ('scimitar', 0.92, 'Shumar Bronze Curved Saber', True),
        ('sword', 0.95, 'Shumar Lapis-Hilt Broadsword', False),
        ('spear', 1.85, 'Shumar Chariot Spear', False),
        ('mace', 0.88, 'Shumar Star-Head Bronze Mace', False),
        ('bow', 1.40, 'Shumar Horn-Tipped Recurve Bow', False),
    ], ['Shumar Rosette Round Shield', 'Shumar Winged-Bull Shield', 'Shumar Ziggurat Step Shield', 'Shumar Bronze Boss Buckler', 'Shumar Lamassu Tower Shield']),
    ('screamer.glb', 'scrm', 'screamer', 'Screamers', 'Screamer Set', [
        ('sword', 0.95, 'Screamer Jagged Saw-Blade', True),
        ('dagger', 0.52, 'Screamer Bone-Ripper Cleaver', False),
        ('mace', 0.88, 'Screamer Barbed Nail-Bat', False),
        ('axe', 0.95, 'Screamer Chain-Bit Chopper', False),
        ('mace', 1.10, 'Screamer Spiked Pole-Maul', False),
    ], ['Screamer Shrieking-Maw Shield', 'Screamer Spiked Scrap Targe', 'Screamer Ribcage Buckler', 'Screamer Razor-Rim Shield', 'Screamer Gore-Plate Pavise']),
    ('salvage_gear.glb', 'salv', 'salvagers', 'Salvagers', 'Salvage Gear', [
        ('sword', 0.90, 'Salvaged Lawn-Blade Machete', False),
        ('dagger', 0.50, 'Salvaged Saw-Tooth Cleaver', False),
        ('mace', 0.88, 'Salvaged Pipe-Fitting Club', False),
        ('axe', 0.88, 'Salvaged Stop-Sign Hatchet', False),
        ('mace', 0.92, 'Salvaged Gear-Cog Maul', False),
    ], ['Salvaged Road-Sign Shield', 'Salvaged Hubcap Buckler', 'Salvaged Corrugated Tin Shield', 'Salvaged Tire-Tread Shield', 'Salvaged Car-Door Pavise']),
]

MESHY_SHEATH_PAIRS = {
    'msh_tabisti_takouba_sheath': 'msh_tabisti_takouba_sword',
    'msh_tabisti_flyssa_sheath': 'msh_tabisti_flyssa_dagger',
    'msh_dalab_sica_sheath': 'msh_dalab_sica_dagger',
    'msh_lizardman_dao_scabbard': 'msh_lizardman_dao_sword',
    'msh_lizardman_jian_scabbard': 'msh_lizardman_jian_sword',
}


def import_all():
    os.makedirs(OUT_PROPS, exist_ok=True)
    os.makedirs(OUT_THUMBS, exist_ok=True)
    new_entries = []
    entry_by_id = {}

    def add_item(pid, label, kind, length, P, N, UV, T, tex_blobs, people, culture_label, subset, src_name, is_spliced_shield=False, sheath_id=None, for_weapon=None):
        P_d, N_d, UV_d, T_d = decimate_uv_preserving(P, N, UV, T, target_tris=4200)
        P_f, N_f, UV_f, T_f, blade, support = orient_and_place(P_d, N_d, UV_d, T_d, kind, length, is_spliced_shield=is_spliced_shield)
        glb_path = os.path.join(OUT_PROPS, f"{pid}.glb")
        write_prop_glb(glb_path, pid, P_f, N_f, UV_f, T_f, tex_blobs)
        thumb_path = os.path.join(OUT_THUMBS, f"{pid}.png")
        render_prop_thumb(thumb_path, P_f, N_f, UV_f, T_f, base_pil=tex_blobs.get('base_pil'), kind=kind)

        hand = 'L' if kind in ('shield', 'bow', 'sheath') else 'R'
        grip_type = 'trigger' if kind in ('rifle', 'pistol', 'crossbow') else 'fist'
        e = {
            'id': pid,
            'label': label,
            'hand': hand,
            'kind': kind,
            'glb': f"pieces/props/{pid}.glb",
            'grip': grip_type,
            'people': people,
            'culture_label': culture_label,
            'subset': subset,
            'src': src_name,
        }
        if sheath_id:
            e['sheath'] = sheath_id
        if for_weapon:
            e['for_weapon'] = for_weapon
        if support:
            e['support'] = [round(float(x), 3) for x in support]
        if blade:
            e['blade'] = [round(float(x), 3) for x in blade]
        if kind == 'shield':
            e['low_turn'] = 90
        if kind == 'bow':
            h_half = round(float(0.45 * length), 3)
            e['arrow_arm'] = 1.65
            e['string'] = [0.0, h_half, -0.09, 0.0, -h_half, -0.09]
            e['arrow'] = 'arrow'
        if kind in ('arrow', 'dart'):
            e['length'] = round(float(length), 3)
        new_entries.append(e)
        entry_by_id[pid] = e
        return e

    # 1. Process all 21 Two-Column Tripo Culture Sheets (5 weapons + sheaths + arrows/darts + 5 shields per sheet)
    print("=== 1. Dissecting & Splicing 21 Two-Column Tripo Culture Sheets ===")
    tripo_sheath_count = 0
    tripo_proj_count = 0
    for fname, pref, people, clabel, subset, w_specs, s_labels in TRIPO_SHEETS:
        fpath = os.path.join(DL, fname)
        r = glbio.read_mesh(fpath)
        tex_blobs = encode_textures_from_rig(r)
        P, N, UV, T = r.pos, r.nrm, r.uv, r.tri

        # 5 Weapons (+ matching row sheaths/scabbards/quivers)
        weapons, sheaths = extract_weapons_and_sheaths(fname, P, N, UV, T, w_specs)
        for i, ((Pw, Nw, UVw, Tw), P_sheath, spec) in enumerate(zip(weapons, sheaths, w_specs)):
            w_kind, w_len, w_label = spec[0], spec[1], spec[2]
            pid = f"{pref}_w{i+1}_{w_kind}"
            s_pid = f"{pref}_w{i+1}_sheath" if P_sheath is not None else None
            add_item(pid, w_label, w_kind, w_len, Pw, Nw, UVw, Tw, tex_blobs, people, clabel, subset, fname, sheath_id=s_pid)
            if P_sheath is not None:
                Ps_sh, Ns_sh, UVs_sh, Ts_sh = P_sheath
                s_len = 0.58 if w_kind == 'bow' else (0.50 if 'Blowgun' in w_label else round(w_len * 0.78, 2))
                s_KindLabel = 'Quiver' if w_kind == 'bow' else ('Dart Case' if 'Blowgun' in w_label else 'Sheath')
                add_item(s_pid, f"{w_label} {s_KindLabel}", 'sheath', s_len, Ps_sh, Ns_sh, UVs_sh, Ts_sh, tex_blobs, people, clabel, subset, fname, for_weapon=pid)
                tripo_sheath_count += 1

        #Separated Arrows & Blowgun Darts from this Tripo sheet
        for p_pid, p_label, p_kind, p_len, Pp, Np, UVp, Tp, w_pid in extract_tripo_projectiles(fname, P, N, UV, T):
            add_item(p_pid, p_label, p_kind, p_len, Pp, Np, UVp, Tp, tex_blobs, people, clabel, subset, fname, for_weapon=w_pid)
            if w_pid in entry_by_id:
                if p_kind == 'arrow':
                    entry_by_id[w_pid]['arrow'] = p_pid
                elif p_kind == 'dart':
                    entry_by_id[w_pid]['dart'] = p_pid
            tripo_proj_count += 1

        # 5 Shields with spliced rear handles
        splits = find_row_splits(P, T)
        tc = P[T].mean(axis=1)
        for i, s_label in enumerate(s_labels):
            y_hi = 1e9 if i == 0 else splits[i - 1]
            y_lo = -1e9 if i == 4 else splits[i]
            rmask = (tc[:, 0] >= 0.06) & (tc[:, 1] <= y_hi) & (tc[:, 1] > y_lo)
            Ps, Ns, UVs, Ts = extract_shield_for_row(fname, i, P, N, UV, T, rmask)
            pid = f"{pref}_s{i+1}_shield"
            add_item(pid, s_label, 'shield', 0.85, Ps, Ns, UVs, Ts, tex_blobs, people, clabel, subset, fname, is_spliced_shield=True)
        print(f"  {fname:24s} -> 5 weapons + 5 shields ({pref}_*)")
    print(f"  Extracted {tripo_sheath_count} sheaths/quivers and {tripo_proj_count} arrows/darts from Tripo sheets")

    # 2. Process the 14 Standalone GLBs in Downloads (26 items; flying bat & duplicate andaru 2 ignored)
    print("=== 2. Processing 14 Standalone GLBs from Downloads (26 items) ===")
    # 2a. obsidian.glb (6 front-facing obsidian weapons)
    r = glbio.read_mesh(os.path.join(DL, 'obsidian.glb'))
    tex_blobs = encode_textures_from_rig(r)
    P, N, UV, T = r.pos, r.nrm, r.uv, r.tri
    tc = P[T].mean(axis=1)
    obs_specs = [
        ('voth_obs_macuahuitl', 'Obsidian Feathered Macuahuitl', 'sword', 1.00, tc[:, 0] < -0.395),
        ('voth_obs_club', 'Obsidian Spiked War Club', 'mace', 0.90, (tc[:, 0] >= -0.30) & (tc[:, 0] < -0.205)),
        ('voth_obs_dagger', 'Obsidian Sacrificial Dagger', 'dagger', 0.48, (tc[:, 0] >= -0.145) & (tc[:, 0] < -0.06)),
        ('voth_obs_axe', 'Obsidian Crescent Battle Axe', 'axe', 0.95, (tc[:, 0] >= 0.005) & (tc[:, 0] < 0.105)),
        ('voth_obs_spear', 'Obsidian Twin-Prong Spear', 'spear', 1.85, (tc[:, 0] >= 0.19) & (tc[:, 0] < 0.305)),
        ('voth_obs_knife', 'Obsidian Curved Flaying Knife', 'dagger', 0.48, (tc[:, 0] >= 0.375) & (tc[:, 0] < 0.45)),
    ]
    for pid, label, kind, length, mask in obs_specs:
        Pi, Ni, UVi, Ti = submesh(P, N, UV, T, mask)
        add_item(pid, label, kind, length, Pi, Ni, UVi, Ti, tex_blobs, 'chichani', 'Chichani (Voth)', 'Obsidian', 'obsidian.glb')

    # 2b. macahuitl.glb (3 front-facing macahuitl swords)
    r = glbio.read_mesh(os.path.join(DL, 'macahuitl.glb'))
    tex_blobs = encode_textures_from_rig(r)
    P, N, UV, T = r.pos, r.nrm, r.uv, r.tri
    tc = P[T].mean(axis=1)
    mac_specs = [
        ('voth_mac_broadblade', 'Macahuitl Broadblade I', 'sword', 1.00, tc[:, 0] < -0.33),
        ('voth_mac_greatblade', 'Macahuitl Greatblade II', 'sword', 1.08, (tc[:, 0] > -0.18) & (tc[:, 0] < 0.05)),
        ('voth_mac_sawblade', 'Macahuitl Sawblade III', 'sword', 1.02, (tc[:, 0] > 0.20) & (tc[:, 0] < 0.41)),
    ]
    for pid, label, kind, length, mask in mac_specs:
        Pi, Ni, UVi, Ti = submesh(P, N, UV, T, mask)
        add_item(pid, label, kind, length, Pi, Ni, UVi, Ti, tex_blobs, 'chichani', 'Chichani (Voth)', 'Macahuitl', 'macahuitl.glb')

    # 2c. ancient masks 3d model.glb (6 visage buckler shields in 2x3 grid)
    r = glbio.read_mesh(os.path.join(DL, 'ancient masks 3d model.glb'))
    tex_blobs = encode_textures_from_rig(r)
    P, N, UV, T = r.pos, r.nrm, r.uv, r.tri
    tc = P[T].mean(axis=1)
    mask_specs = [
        ('voth_mask_shield_1', 'Ancient Sun-God Visage Buckler', (tc[:, 0] < 0) & (tc[:, 1] > 0.67)),
        ('voth_mask_shield_2', 'Ancient Tlaloc Visage Buckler', (tc[:, 0] >= 0) & (tc[:, 1] > 0.67)),
        ('voth_mask_shield_3', 'Ancient Jade-Fret Visage Buckler', (tc[:, 0] < 0) & (tc[:, 1] > 0.33) & (tc[:, 1] <= 0.67)),
        ('voth_mask_shield_4', 'Ancient Feathered-Serpent Buckler', (tc[:, 0] >= 0) & (tc[:, 1] > 0.33) & (tc[:, 1] <= 0.67)),
        ('voth_mask_shield_5', 'Ancient Bat-Lord Visage Buckler', (tc[:, 0] < 0) & (tc[:, 1] <= 0.33)),
        ('voth_mask_shield_6', 'Ancient Skull-Crown Visage Buckler', (tc[:, 0] >= 0) & (tc[:, 1] <= 0.33)),
    ]
    for pid, label, mask in mask_specs:
        Pi, Ni, UVi, Ti = submesh(P, N, UV, T, mask)
        add_item(pid, label, 'shield', 0.68, Pi, Ni, UVi, Ti, tex_blobs, 'chichani', 'Chichani (Voth)', 'Ancient Masks', 'ancient masks 3d model.glb')

    # 2d. 11 Single-item standalone GLBs
    single_glbs = [
        ('iziz sword.glb', 'iziz_ornate_sword', 'Iziz Ornate Gladius Sword', 'sword', 0.95, 'izani', 'Izani (Iziz)', 'Iziz Ornate'),
        ('iziz - ornate.glb', 'iziz_ornate_shield', 'Iziz Ornate Imperial Scutum', 'shield', 1.02, 'izani', 'Izani (Iziz)', 'Iziz Ornate'),
        ('coyote.glb', 'coyote_ornate_shield', 'Coyote Men Painted Medicine Shield', 'shield', 0.85, 'coyote_men', 'Coyote Men', 'Coyote Ornate'),
        ('steampunk handgun 3d model_Clone1.glb', 'rep_steampunk_pistol', 'Republic Brass Steampunk Pistol', 'pistol', 0.36, 'iron_republic', 'Iron Republic', 'Republic Firearms'),
        ('sniper rifle 3d model.glb', 'relic_sniper_rifle', 'Ancient Relic Long-Range Sniper Rifle', 'rifle', 1.18, 'yuni', 'Yuni & Relics', 'Relic Firearms'),
        ('ornate assault rifle 3d model.glb', 'relic_ornate_assault_rifle', 'Gilded Relic Assault Rifle', 'rifle', 0.98, 'yuni', 'Yuni & Relics', 'Relic Firearms'),
        ('futuristic gun 3d model.glb', 'relic_futuristic_gun', 'Relic Pulse Blaster Rifle', 'rifle', 0.90, 'yuni', 'Yuni & Relics', 'Relic Firearms'),
        ('futuristic weapon 3d model.glb', 'relic_futuristic_carbine', 'Relic Plasma Carbine', 'rifle', 0.92, 'yuni', 'Yuni & Relics', 'Relic Firearms'),
        ('futuristic weapon 3d model (1).glb', 'relic_futuristic_cannon', 'Relic Heavy Arc Cannon', 'rifle', 1.05, 'yuni', 'Yuni & Relics', 'Relic Firearms'),
        ('missile 3d model.glb', 'relic_missile_launcher', 'Relic Guided Ordnance Tube', 'rifle', 1.10, 'yuni', 'Yuni & Relics', 'Relic Ordnance'),
        ('sci-fi turret 3d model.glb', 'relic_scifi_turret_gun', 'Relic Twin-Mount Turret Autocannon', 'rifle', 1.08, 'yuni', 'Yuni & Relics', 'Relic Ordnance'),
    ]
    for fname, pid, label, kind, length, people, clabel, subset in single_glbs:
        r = glbio.read_mesh(os.path.join(DL, fname))
        tex_blobs = encode_textures_from_rig(r)
        add_item(pid, label, kind, length, r.pos, r.nrm, r.uv, r.tri, tex_blobs, people, clabel, subset, fname)
        print(f"  {fname:38s} -> {pid} ({kind})")

    # 3. Process all Unique Meshy Weapons & Shields from the 12 Meshy ZIP Archives
    print("=== 3. Processing Unique Meshy Weapons & Shields from 12 Archives ===")
    meshy_summary = json.load(open(os.path.join(MESHY_DIR, 'meshy_summary.json'), encoding='utf-8'))
    seen_folders = set()
    meshy_count = 0
    for item in meshy_summary:
        folder = item['folder']
        if folder in seen_folders:
            continue
        seen_folders.add(folder)
        low = folder.lower()
        # Skip non-weapons and un-remeshed _base duplicates
        if '_base_' in low or 'mech_titan' in low or 'tropical_gourd' in low:
            continue

        # Parse stem between Meshy_AI_ and _2026
        m = re.match(r'^Meshy_AI_(.+?)_2026\d+_', folder)
        stem = m.group(1) if m else folder
        s_low = stem.lower()

        # Classify culture
        if s_low.startswith('khaayken_'):
            people, clabel, subset = 'khaayken', 'Khaayken', 'Khaayken Shields'
        elif s_low.startswith('lizardman_'):
            people, clabel, subset = 'lizardmen', 'Lizardmen', 'Lizardmen Meshy'
        elif s_low.startswith('voth_'):
            people, clabel, subset = 'chichani', 'Chichani (Voth)', 'Voth Meshy'
        elif s_low.startswith('tabisti_'):
            people, clabel, subset = 'tabisti', 'Tabisti', 'Tabisti Arms'
        elif s_low.startswith('coyoteman_'):
            people, clabel, subset = 'coyote_men', 'Coyote Men', 'Coyote Men Arms'
        elif s_low.startswith('eternian_') or s_low.startswith('ninja_'):
            people, clabel, subset = 'eternian', 'Eternians', 'Eternian Arms'
        elif s_low.startswith('talovolci_'):
            people, clabel, subset = 'talovolci', 'Talovolci (Free Clans)', 'Talovolci Arms'
        elif s_low.startswith('hykkousoi_'):
            people, clabel, subset = 'hykkousoi', 'Hykkousoi', 'Hykkousoi Panoply'
        elif s_low.startswith('izani_') or s_low.startswith('centurion_'):
            people, clabel, subset = 'izani', 'Izani (Iziz)', 'Izani Legion'
        elif s_low.startswith('dalab_'):
            people, clabel, subset = 'dalabites', 'Dalabites', 'Dalab Arms'
        else:
            people, clabel, subset = 'general', 'General', 'Meshy Arms'

        # Classify kind & length
        if any(k in s_low for k in ('sheath', 'scabbard')):
            kind = 'sheath'
            length = 0.42 if any(k in s_low for k in ('flyssa', 'sica')) else 0.78
        elif any(k in s_low for k in ('shield', 'tate', 'adarga', 'arer', 'aegis', 'clipeus', 'parma', 'scutum', 'forearm_guard')):
            kind = 'shield'
            length = 1.02 if any(k in s_low for k in ('tower', 'standing', 'tall', 'scutum', 'tate')) else 0.85
        elif 'bow' in s_low and 'crossbow' not in s_low or 'yumi' in s_low:
            kind, length = 'bow', 1.45
        elif 'crossbow' in s_low:
            kind, length = 'crossbow', 0.85
        elif 'rifle' in s_low:
            kind, length = 'rifle', 1.08
        elif 'sling' in s_low:
            kind, length = 'sling', 0.90
        elif 'plumbata' in s_low or 'dart' in s_low:
            kind, length = 'dart', 0.55
        elif any(k in s_low for k in ('spear', 'lance', 'pilum', 'hasta', 'yari', 'naginata', 'glaive', 'gaesum', 'akontion', 'dory', 'sarissa', 'rhomphaia')):
            kind = 'spear'
            length = 2.15 if 'sarissa' in s_low else 1.95
        elif any(k in s_low for k in ('axe', 'ge_dagger_axe')):
            kind, length = 'axe', 0.95
        elif any(k in s_low for k in ('mace', 'kanabo')):
            kind, length = 'mace', 0.92
        elif any(k in s_low for k in ('dagger', 'pugio')):
            kind, length = 'dagger', 0.48
        elif any(k in s_low for k in ('katana', 'kopis', 'falx', 'sica', 'dao', 'moonblade')):
            kind, length = 'scimitar', 0.96
        else:
            kind, length = 'sword', 0.98

        pid = 'msh_' + re.sub(r'[^a-z0-9_]+', '_', s_low).strip('_')
        label = stem.replace('_', ' ').title()
        if kind == 'bow':
            label = re.sub(r'\s+Arrows?$', '', label)
        elif kind == 'dart' and 'Dart' not in label:
            label = label + ' Dart'

        r = glbio.read_mesh(item['path'])
        tex_blobs = encode_textures_from_rig(r)
        P, N, UV, T = r.pos, r.nrm, r.uv, r.tri

        # For bow models that include detached arrows next to the bow, separate the bow and the arrow!
        extracted_arrow = None
        if kind == 'bow':
            comps = connected_components_tris(P, T)
            if len(comps) > 1:
                comps.sort(key=lambda c: -len(c))
                if len(comps[1]) >= 200:
                    amask = np.zeros(len(T), dtype=bool)
                    amask[comps[1]] = True
                    extracted_arrow = submesh(P, N, UV, T, amask)
                tmask = np.zeros(len(T), dtype=bool)
                tmask[comps[0]] = True
                P, N, UV, T = submesh(P, N, UV, T, tmask)

        bow_entry = add_item(pid, label, kind, length, P, N, UV, T, tex_blobs, people, clabel, subset, folder)
        meshy_count += 1
        if extracted_arrow is not None:
            Pa, Na, UVa, Ta = extracted_arrow
            a_stem = re.sub(r'_bow(_arrows?)?$', '_arrow', pid)
            a_label = re.sub(r'\s+Bow$', ' Arrow', label)
            add_item(a_stem, a_label, 'arrow', 0.78, Pa, Na, UVa, Ta, tex_blobs, people, clabel, subset, folder, for_weapon=pid)
            bow_entry['arrow'] = a_stem
            meshy_count += 1

    # Link Meshy weapons and sheaths
    for s_pid, w_pid in MESHY_SHEATH_PAIRS.items():
        if s_pid in entry_by_id and w_pid in entry_by_id:
            entry_by_id[w_pid]['sheath'] = s_pid
            entry_by_id[s_pid]['for_weapon'] = w_pid
    if 'msh_dalab_falx' in entry_by_id and 'msh_dalab_sica_sheath' in entry_by_id:
        entry_by_id['msh_dalab_falx']['sheath'] = 'msh_dalab_sica_sheath'

    print(f"  Imported {meshy_count} unique Meshy weapons, shields & sheaths")

    # 4. Update data/props.json and render thumbnails for existing built-in props too
    pj = os.path.join(HERE, 'data', 'props.json')
    props_doc = json.load(open(pj, encoding='utf-8'))
    new_ids = {e['id'] for e in new_entries}
    kept_props = []
    for p in props_doc['props']:
        if p['id'] in new_ids or p.get('src'):
            continue
        # Enrich existing built-in props with kind, people, culture_label, subset for the Arms Lab
        pid = p['id']
        if pid.startswith('tz_'):
            p.setdefault('people', 'chichani')
            p.setdefault('culture_label', 'Chichani (Voth)')
            p.setdefault('subset', 'Tzintzun')
            p.setdefault('kind', pid.split('_')[1] if pid != 'tz_scepter' else 'staff')
        elif pid.startswith('tg_'):
            p.setdefault('people', 'tungang')
            p.setdefault('culture_label', 'Tungangs')
            p.setdefault('subset', 'Tungang Tools')
            p.setdefault('kind', 'staff' if 'pole' in pid else ('mace' if 'spanner' in pid else 'tool'))
        else:
            p.setdefault('people', 'general')
            p.setdefault('culture_label', 'General (Built-In)')
            p.setdefault('subset', 'Base Props')
            if pid == 'arrow':
                p['kind'] = 'arrow'
            else:
                p.setdefault('kind', pid if pid in ('sword', 'dagger', 'axe', 'mace', 'spear', 'shield', 'bow', 'crossbow', 'rifle', 'pistol', 'arrow', 'dart') else 'tool')
        thumb_path = os.path.join(OUT_THUMBS, f"{pid}.png")
        glb_path = os.path.join(HERE, p['glb'])
        if os.path.isfile(glb_path):
            render_existing_prop_thumb(glb_path, thumb_path, kind=p.get('kind', 'sword'))
        kept_props.append(p)

    # Remove any stale GLBs or thumbs from previous import passes whose IDs were renamed
    valid_ids = {p['id'] for p in kept_props} | new_ids
    for gpath in glob.glob(os.path.join(OUT_PROPS, '*.glb')):
        stem = os.path.splitext(os.path.basename(gpath))[0]
        if stem not in valid_ids:
            os.remove(gpath)
    for tpath in glob.glob(os.path.join(OUT_THUMBS, '*.png')):
        stem = os.path.splitext(os.path.basename(tpath))[0]
        if stem not in valid_ids:
            os.remove(tpath)

    props_doc['props'] = kept_props + new_entries
    with open(pj, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(props_doc, f, indent=1)
    print(f"=== Done! Total props in data/props.json: {len(props_doc['props'])} ({len(new_entries)} newly imported) ===")


if __name__ == '__main__':
    import_all()
