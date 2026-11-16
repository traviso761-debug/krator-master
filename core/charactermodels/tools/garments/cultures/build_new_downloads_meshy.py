"""Rig and segment the 5 new downloaded Meshy GLB models into 5-piece MPFB kits (male & female)."""
import base64
import copy
import io
import json
import os
from pathlib import Path
import struct
import sys

import numpy as np
from PIL import Image
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components, dijkstra

ROOT = str(Path(__file__).resolve().parents[3])     # core/charactermodels (this file: tools/garments/cultures/)
DL = r'C:\Users\travi\Downloads'
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import glbio
import make_mpfb
from garments import core as gc
from make_pieces import rot_between


def pack_bits(mask_bool, n_tris):
    out = np.zeros((n_tris + 7) >> 3, dtype=np.uint8)
    idx = np.where(mask_bool[:n_tris])[0]
    for i in idx:
        out[i >> 3] |= (1 << (i & 7))
    return base64.b64encode(out.tobytes()).decode('ascii'), int(len(idx))


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def decimate_uv_preserving(pos, nrm, uv, tri, cell_size=0.0165):
    q = np.floor((pos - pos.min(axis=0)) / cell_size).astype(np.int64)
    uv_bin = np.floor(uv * 16.0).astype(np.int64)
    key = ((q[:, 0] * 1000 + q[:, 1]) * 1000 + q[:, 2]) * 1000 + (uv_bin[:, 0] * 32 + uv_bin[:, 1])
    u_keys, first_v, inv = np.unique(key, return_index=True, return_inverse=True)
    n_c = len(u_keys)
    counts = np.maximum(np.bincount(inv, minlength=n_c), 1)
    c_nrm = np.column_stack([np.bincount(inv, nrm[:, k], minlength=n_c) / counts for k in range(3)])
    c_nrm /= np.maximum(np.linalg.norm(c_nrm, axis=1, keepdims=True), 1e-9)
    c_uv = np.column_stack([np.bincount(inv, uv[:, k], minlength=n_c) / counts for k in range(2)]).astype(np.float32)

    q_key = (q[:, 0] * 1000 + q[:, 1]) * 1000 + q[:, 2]
    _, q_inv = np.unique(q_key, return_inverse=True)
    q_counts = np.maximum(np.bincount(q_inv), 1)
    q_pos = np.column_stack([np.bincount(q_inv, pos[:, k]) / q_counts for k in range(3)])
    c_pos = q_pos[q_inv[first_v]]

    tc = inv[tri]
    tq = q_inv[tri]
    non_deg = (tq[:, 0] != tq[:, 1]) & (tq[:, 1] != tq[:, 2]) & (tq[:, 2] != tq[:, 0])
    duv_orig = np.maximum(
        np.linalg.norm(uv[tri[:, 1]] - uv[tri[:, 0]], axis=1),
        np.linalg.norm(uv[tri[:, 2]] - uv[tri[:, 0]], axis=1),
    )
    valid_t = non_deg & (duv_orig < 0.08)
    tc_nd = tc[valid_t]
    tq_nd = np.sort(tq[valid_t], axis=1)
    n_q = int(q_inv.max()) + 1
    t_hash = (tq_nd[:, 0].astype(np.int64) * n_q + tq_nd[:, 1].astype(np.int64)) * n_q + tq_nd[:, 2].astype(np.int64)
    _, u_t = np.unique(t_hash, return_index=True)
    final_tri = tc_nd[np.sort(u_t)]
    used_c, final_tri = np.unique(final_tri, return_inverse=True)
    final_tri = final_tri.reshape(-1, 3)
    final_pos = c_pos[used_c]
    final_nrm = c_nrm[used_c]
    final_uv = c_uv[used_c]
    return final_pos, final_nrm, final_uv, final_tri


def compute_lower_body_weights(P_sub, T_sub, rig, joint_names, slot):
    idx_hips = joint_names.index('Hips')
    idx_sp = joint_names.index('Spine')
    idx_lul = joint_names.index('LeftUpLeg')
    idx_rul = joint_names.index('RightUpLeg')
    idx_ll = joint_names.index('LeftLeg')
    idx_rl = joint_names.index('RightLeg')
    idx_lf = joint_names.index('LeftFoot')
    idx_rf = joint_names.index('RightFoot')
    idx_lt = joint_names.index('LeftToeBase')
    idx_rt = joint_names.index('RightToeBase')

    n_v = len(P_sub)
    JJ = np.zeros((n_v, 4), dtype=np.uint8)
    WW = np.zeros((n_v, 4), dtype=np.float32)

    x = P_sub[:, 0]
    y = P_sub[:, 1]
    z = P_sub[:, 2]

    if slot == 'feet':
        t_foot = smoothstep(0.145, 0.060, y)
        t_toe = smoothstep(0.105, 0.185, z) * smoothstep(0.058, 0.015, y) * 0.65
        w_leg = 1.0 - t_foot
        w_foot = t_foot * (1.0 - t_toe)
        w_toe = t_foot * t_toe

        left = x >= 0.0
        JJ[:, 0] = np.where(left, idx_ll, idx_rl)
        WW[:, 0] = w_leg
        JJ[:, 1] = np.where(left, idx_lf, idx_rf)
        WW[:, 1] = w_foot
        JJ[:, 2] = np.where(left, idx_lt, idx_rt)
        WW[:, 2] = w_toe
        return JJ, WW

    y_knee = float(rig.jpos[rig.J['LeftLeg']][1])
    W6 = np.zeros((n_v, 6), dtype=np.float64)
    b_ids = [idx_sp, idx_hips, idx_lul, idx_rul, idx_ll, idx_rl]

    w_sp = smoothstep(0.955, 1.075, y)
    w_hips_belt = (1.0 - w_sp) * smoothstep(0.815, 0.930, y)
    is_cape_sheet = smoothstep(-0.07, -0.15, z) * smoothstep(0.34, 0.45, y)
    center_bridge = np.exp(-(x / 0.11) ** 2) * smoothstep(0.52, 0.78, y)
    w_hips_drape = (1.0 - w_sp - w_hips_belt) * np.clip(0.32 * is_cape_sheet + 0.35 * center_bridge, 0.0, 0.55)

    w_hips = w_hips_belt + w_hips_drape
    w_rem = np.maximum(0.0, 1.0 - w_sp - w_hips)

    half_w = 0.035 + 0.145 * np.maximum(is_cape_sheet, smoothstep(0.60, 0.82, y))
    s_left = smoothstep(-half_w, half_w, x)
    t_shin = smoothstep(y_knee + 0.055, y_knee - 0.115, y)

    W6[:, 0] = w_sp
    W6[:, 1] = w_hips
    W6[:, 2] = w_rem * s_left * (1.0 - t_shin)
    W6[:, 3] = w_rem * (1.0 - s_left) * (1.0 - t_shin)
    W6[:, 4] = w_rem * s_left * t_shin
    W6[:, 5] = w_rem * (1.0 - s_left) * t_shin

    if slot == 'legs':
        _, inv = np.unique(np.round(P_sub, 5), axis=0, return_inverse=True)
        n_u = int(inv.max()) + 1
        tw = inv[T_sub]
        e0 = np.concatenate([tw[:, 0], tw[:, 1], tw[:, 2], tw[:, 1], tw[:, 2], tw[:, 0]])
        e1 = np.concatenate([tw[:, 1], tw[:, 2], tw[:, 0], tw[:, 0], tw[:, 1], tw[:, 2]])
        adj = coo_matrix((np.ones(len(e0), dtype=np.float64), (e0, e1)), shape=(n_u, n_u)).tocsr()
        deg = np.maximum(np.array(adj.sum(axis=1)).ravel(), 1.0)

        W_u = np.zeros((n_u, 6), dtype=np.float64)
        counts_u = np.maximum(np.bincount(inv, minlength=n_u), 1)[:, None]
        np.add.at(W_u, inv, W6)
        W_u /= counts_u
        W_u_init = W_u.copy()

        y_u = np.zeros(n_u, dtype=np.float64)
        np.add.at(y_u, inv, y)
        y_u /= counts_u[:, 0]
        pin = (y_u >= 0.905) | (y_u <= 0.335)

        for _ in range(8):
            W_avg = (adj @ W_u) / deg[:, None]
            W_u = np.where(pin[:, None], W_u_init, 0.55 * W_u + 0.45 * W_avg)
            W_u /= np.maximum(W_u.sum(axis=1, keepdims=True), 1e-9)
        W6 = W_u[inv]

    top4 = np.argsort(-W6, axis=1)[:, :4]
    for k in range(4):
        idx_k = top4[:, k]
        JJ[:, k] = np.array(b_ids, dtype=np.uint8)[idx_k]
        WW[:, k] = W6[np.arange(n_v), idx_k].astype(np.float32)
    WW /= np.maximum(WW.sum(axis=1, keepdims=True), 1e-9)
    return JJ, WW


def write_meshy_piece(gid, name, slot, culture, P_sub, N_sub, UV_sub, T_sub, tex_jpeg_bytes,
                      hide_mask_bool, hide_parts=None, covers_hair=False, is_metallic=True,
                      arm_w_sub=None):
    body = gc.BODY_ID
    j_tpl = copy.deepcopy(gc.TPL_J)
    b_tpl = gc.TPL_B
    rig = gc.RIG
    joint_names = list(rig.joints)

    from scipy.spatial import cKDTree
    non_arm_base = np.where(gc.BASE_ARM_W <= 0.04)[0]
    arm_base = gc.ARM_ONLY_IDX if gc.ARM_ONLY_IDX is not None else np.where(gc.BASE_ARM_W > 0.45)[0]
    tree_non_arm = cKDTree(gc.BP_GL[non_arm_base])
    tree_arm = cKDTree(gc.BP_GL[arm_base])

    _, nn_non_arm = tree_non_arm.query(P_sub, k=1)
    nn_idx = non_arm_base[nn_non_arm]
    if slot == 'gloves':
        _, nn_a = tree_arm.query(P_sub, k=1)
        nn_idx = arm_base[nn_a]
    elif arm_w_sub is not None:
        is_arm_v = arm_w_sub >= 0.25
        if is_arm_v.any():
            _, nn_a = tree_arm.query(P_sub[is_arm_v], k=1)
            nn_idx[is_arm_v] = arm_base[nn_a]

    JJ_arr = gc.BASE_JJ[nn_idx].copy()
    WW_arr = gc.BASE_WW[nn_idx].copy()
    VI_arr = np.arange(len(P_sub), dtype=np.int32)

    if slot == 'head':
        idx_head = joint_names.index('Head')
        idx_neck = joint_names.index('Neck')
        JJ_arr[:] = 0
        WW_arr[:] = 0.0
        JJ_arr[:, 0] = idx_head
        WW_arr[:, 0] = 1.0
        for vi in range(len(P_sub)):
            y = float(P_sub[vi, 1])
            z = float(P_sub[vi, 2])
            if y < 1.525 and z < 0.06:
                t = np.clip((1.525 - y) / 0.055, 0.0, 1.0) * 0.55
                JJ_arr[vi, 0] = idx_head
                WW_arr[vi, 0] = 1.0 - t
                JJ_arr[vi, 1] = idx_neck
                WW_arr[vi, 1] = t
    elif slot in ('legs', 'feet'):
        JJ_arr, WW_arr = compute_lower_body_weights(P_sub, T_sub, rig, joint_names, slot)
    elif slot == 'torso':
        JJ_low, WW_low = compute_lower_body_weights(P_sub, T_sub, rig, joint_names, slot)
        low_mask = (P_sub[:, 1] <= 1.04) & ((arm_w_sub < 0.15) if arm_w_sub is not None else True)
        JJ_arr[low_mask] = JJ_low[low_mask]
        WW_arr[low_mask] = WW_low[low_mask]

    # Smooth analytical arm weights on gloves and torso arm vertices
    if slot == 'gloves' or (slot == 'torso' and arm_w_sub is not None and (arm_w_sub >= 0.25).any()):
        arm_m = np.ones(len(P_sub), dtype=bool) if slot == 'gloves' else (arm_w_sub >= 0.25)
        for side, sgn in (('Left', 1.0), ('Right', -1.0)):
            side_m = arm_m & ((P_sub[:, 0] * sgn) >= 0.0)
            if not side_m.any():
                continue
            q_part = P_sub[side_m]
            p_arm = np.asarray(rig.jpos[rig.J[side + 'Arm']], dtype=np.float64)
            p_fa = np.asarray(rig.jpos[rig.J[side + 'ForeArm']], dtype=np.float64)
            p_hnd = np.asarray(rig.jpos[rig.J[side + 'Hand']], dtype=np.float64)
            u1 = p_fa - p_arm
            l1 = max(float(np.linalg.norm(u1)), 1e-6)
            d1 = u1 / l1
            u2 = p_hnd - p_fa
            l2 = max(float(np.linalg.norm(u2)), 1e-6)
            d2 = u2 / l2
            t1 = ((q_part - p_arm) @ d1) / l1
            t2 = ((q_part - p_fa) @ d2) / l2
            s = np.where(((q_part - p_fa) @ (d1 + d2)) < 0.0, t1, 1.0 + t2)
            if slot == 'torso':
                u_sh = np.clip((0.18 - s) / 0.48, 0.0, 1.0)
                u_sh = u_sh * u_sh * (3.0 - 2.0 * u_sh)
            else:
                u_sh = np.zeros_like(s)
            w_sp2 = 0.38 * u_sh
            w_sh = 0.46 * u_sh
            u_fa = np.clip((s - 0.72) / 0.56, 0.0, 1.0)
            u_fa = u_fa * u_fa * (3.0 - 2.0 * u_fa)
            s_h0 = 1.82 if slot == 'gloves' else 1.96
            u_hnd = np.clip((s - s_h0) / 0.28, 0.0, 1.0)
            u_hnd = u_hnd * u_hnd * (3.0 - 2.0 * u_hnd)
            w_rem = np.maximum(0.0, 1.0 - (w_sp2 + w_sh))
            w_a = w_rem * (1.0 - u_fa)
            w_f = w_rem * u_fa * (1.0 - u_hnd)
            w_h = w_rem * u_fa * u_hnd
            cand_j = np.array([
                joint_names.index(side + 'Arm'),
                joint_names.index(side + 'ForeArm'),
                joint_names.index(side + 'Shoulder'),
                joint_names.index('Spine2'),
                joint_names.index(side + 'Hand'),
            ], dtype=np.uint8)
            cand_w = np.stack([w_a, w_f, w_sh, w_sp2, w_h], axis=1)
            order = np.argsort(-cand_w, axis=1)[:, :4]
            top_j = cand_j[order]
            top_w = np.take_along_axis(cand_w, order, axis=1)
            top_w /= np.maximum(top_w.sum(axis=1, keepdims=True), 1e-9)
            JJ_arr[side_m] = top_j
            WW_arr[side_m] = top_w.astype(np.float32)

    j_tpl['meshes'][0]['name'] = gid
    for node in j_tpl['nodes']:
        if 'mesh' in node:
            node['name'] = gid
    j_tpl['materials'][0]['name'] = gid
    j_tpl['materials'][0]['doubleSided'] = True
    pbr = j_tpl['materials'][0].setdefault('pbrMetallicRoughness', {})
    pbr['baseColorFactor'] = [1.0, 1.0, 1.0, 1.0]
    if is_metallic:
        pbr['metallicFactor'] = 0.24
        pbr['roughnessFactor'] = 0.44
        j_tpl['materials'][0]['extensions'] = {
            'KHR_materials_clearcoat': {'clearcoatFactor': 0.18, 'clearcoatRoughnessFactor': 0.36}
        }
    else:
        pbr['metallicFactor'] = 0.08
        pbr['roughnessFactor'] = 0.62

    if j_tpl.get('images'):
        j_tpl['images'][0]['name'] = gid

    prim = j_tpl['meshes'][0]['primitives'][0]
    at = prim['attributes']
    blobs = {}

    def set_acc(ai, arr, ctype=None, minmax=False):
        a = j_tpl['accessors'][ai]
        if ctype is not None:
            a['componentType'] = ctype
        a['count'] = len(arr)
        if minmax:
            a['min'] = [float(x) for x in arr.min(axis=0)]
            a['max'] = [float(x) for x in arr.max(axis=0)]
        bv_idx = a['bufferView']
        j_tpl['bufferViews'][bv_idx].pop('byteStride', None)
        blobs[bv_idx] = np.ascontiguousarray(arr).tobytes()

    set_acc(at['_VIDX'], VI_arr.astype(np.float32).reshape(-1, 1), 5126)
    set_acc(at['POSITION'], P_sub.astype(np.float32), 5126, minmax=True)
    set_acc(at['NORMAL'], N_sub.astype(np.float32), 5126)
    set_acc(at['TEXCOORD_0'], UV_sub.astype(np.float32), 5126)
    set_acc(at['JOINTS_0'], JJ_arr.astype(np.uint8), 5121)

    aw = j_tpl['accessors'][at['WEIGHTS_0']]
    w_ct = aw['componentType']
    w_dt = glbio.CT[w_ct]
    if w_ct == 5126:
        w_arr = WW_arr.astype(np.float32)
    else:
        w_arr = np.round(np.clip(WW_arr, 0.0, 1.0) * np.iinfo(w_dt).max).astype(w_dt)
    set_acc(at['WEIGHTS_0'], w_arr, w_ct)
    set_acc(prim['indices'], T_sub.reshape(-1).astype(np.uint16), 5123)

    if j_tpl.get('images'):
        im_meta = j_tpl['images'][0]
        im_meta['mimeType'] = 'image/jpeg'
        blobs[im_meta['bufferView']] = tex_jpeg_bytes

    buf_parts, off = [], 0
    for k, v in enumerate(j_tpl['bufferViews']):
        o = v.get('byteOffset', 0)
        data = blobs.get(k, bytes(b_tpl[o:o + v['byteLength']]))
        pad = (-off) % 4
        buf_parts.append(b'\0' * pad)
        off += pad
        v['byteOffset'], v['byteLength'] = off, len(data)
        buf_parts.append(data)
        off += len(data)
    binb = bytearray(b''.join(buf_parts) + b'\0' * ((-off) % 4))
    j_tpl['buffers'] = [{'byteLength': len(binb)}]

    out_glb = os.path.join(ROOT, 'pieces', body, f'{gid}.glb')
    js = json.dumps(j_tpl, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((-len(js)) % 4)
    with open(out_glb, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))

    used_vi = np.unique(VI_arr)
    base_vidx_for_vi = gc.BASE_VIDX[nn_idx[used_vi]]
    D_garment = np.zeros((gc.BASE_MORPH_D.shape[0], int(used_vi.max()) + 1, 3), dtype=np.float32)
    if slot == 'head':
        head_vi = gc.BASE_VIDX[gc.BASE_TREE_GL.query(rig.jpos[rig.J['Head']])[1]]
        D_garment[:, used_vi, :] = gc.BASE_MORPH_D[:, head_vi:head_vi + 1, :]
    else:
        D_garment[:, used_vi, :] = gc.BASE_MORPH_D[:, base_vidx_for_vi, :]
    morph_bytes = make_mpfb.pack_morphs([(gid, [gid], used_vi)], {'d_' + gid: D_garment})
    out_morph = os.path.join(ROOT, 'pieces', body, f'{gid}.morph.bin')
    with open(out_morph, 'wb') as f:
        f.write(morph_bytes)

    hide_b64, n_hidden = pack_bits(hide_mask_bool, len(gc.BT))
    entry = {
        'id': gid,
        'name': name,
        'slot': slot,
        'glb': f'pieces/{body}/{gid}.glb',
        'culture': culture,
        'type': 'important_npc',
        'hide': hide_b64,
        'hide_by': 'rays',
    }
    if slot == 'legs':
        entry['legged'] = True
    if hide_parts:
        entry['hides'] = hide_parts
        entry['hide_parts'] = hide_parts
    if covers_hair:
        entry['covers_hair'] = True
    print(f'Built {gid:38s} ({slot:6s}): {len(P_sub):5d}v, {len(T_sub):5d}t, hides {n_hidden:4d}')
    return entry


def extract_submesh(P, N, UV, T, tri_mask, extra_mask_per_vert=None, min_comp_tris=15):
    sel_tris = T[tri_mask]
    if len(sel_tris) > 60 and min_comp_tris > 0:
        _, inv_w = np.unique(np.round(P, 5), axis=0, return_inverse=True)
        tw = inv_w[sel_tris]
        n_w = int(inv_w.max()) + 1
        e0 = np.concatenate([tw[:, 0], tw[:, 1], tw[:, 2]])
        e1 = np.concatenate([tw[:, 1], tw[:, 2], tw[:, 0]])
        _, lbl = connected_components(coo_matrix((np.ones(len(e0)), (e0, e1)), shape=(n_w, n_w)), directed=False)
        tri_lbl = lbl[tw[:, 0]]
        u_l, c_l = np.unique(tri_lbl, return_counts=True)
        keep_l = set(u_l[c_l >= min_comp_tris].tolist())
        if keep_l:
            sel_tris = sel_tris[np.isin(tri_lbl, list(keep_l))]
    used_verts, new_tris = np.unique(sel_tris, return_inverse=True)
    new_tris = new_tris.reshape(-1, 3)
    sub_extra = extra_mask_per_vert[used_verts] if extra_mask_per_vert is not None else None
    return P[used_verts], N[used_verts], UV[used_verts], new_tris, sub_extra


SPECS = [
    {
        'key': 'phil',
        'file': 'phil.glb',
        'culture': 'izani',
        'tier_label': 'Phil (Izani Corsair Lord)',
        'target_h': 1.815,
        'x_offset': 0.0,
        'y_head_cut': 1.495,
        'rotate_arms': True,
        'v_d_l': [0.224, -0.479, 0.052],
        'scale_arm_len': True,
        'pieces': {
            'head': ('iziz_{sex}_phil_hood', "Phil's Corsair Leather Hood & Locks", False),
            'torso': ('iziz_{sex}_phil_jacket', "Phil's Crimson-Trimmed Corsair Doublet", False),
            'gloves': ('iziz_{sex}_phil_gloves', "Phil's Brigandine Wrist-Bracers", True),
            'legs': ('iziz_{sex}_phil_trousers', "Phil's Sea-Wolf Breeches & Sash", False),
            'feet': ('iziz_{sex}_phil_boots', "Phil's Turned-Cuff Deck Boots", False),
        },
    },
    {
        'key': 'gilded_sentinel',
        'file': 'Meshy_AI_Gilded_Sentinel_1105101931_texture (1).glb',
        'culture': 'eternian',
        'tier_label': 'Gilded Sentinel (Eternian Palace Guard)',
        'target_h': 1.855,
        'x_offset': 0.0,
        'y_head_cut': 1.488,
        'rotate_arms': False,
        'pieces': {
            'head': ('eternian_{sex}_gilded_sentinel_helm', 'Gilded Sentinel Tall Crown-Helm', True),
            'torso': ('eternian_{sex}_gilded_sentinel_cuirass', 'Gilded Sentinel Filigree Plate Cuirass', True),
            'gloves': ('eternian_{sex}_gilded_sentinel_gauntlets', 'Gilded Sentinel Articulated Vambraces', True),
            'legs': ('eternian_{sex}_gilded_sentinel_greaves', 'Gilded Sentinel Tasset-Skirt & Thigh-Plates', True),
            'feet': ('eternian_{sex}_gilded_sentinel_sabatons', 'Gilded Sentinel Royal Sabatons', True),
        },
    },
    {
        'key': 'crescent_vigilant',
        'file': 'Meshy_AI_Crescent_Vigilant_1105103634_texture.glb',
        'culture': 'yusar',
        'tier_label': 'Crescent Vigilant (Yusar Astral Inquisitor)',
        'target_h': 1.875,
        'x_offset': 0.1244,
        'filter_x_min': -0.600,
        'y_head_cut': 1.545,
        'rotate_arms': False,
        'cape_safe_arms': True,
        'pieces': {
            'head': ('yusar_{sex}_crescent_vigilant_hat', 'Crescent Vigilant Wide-Brimmed Cavalier Hat', False),
            'torso': ('yusar_{sex}_crescent_vigilant_cloak', 'Crescent Vigilant Gold-Broidered Mantle & Cape', False),
            'gloves': ('yusar_{sex}_crescent_vigilant_bracers', 'Crescent Vigilant Gilded Gauntlet-Cuffs', True),
            'legs': ('yusar_{sex}_crescent_vigilant_trousers', 'Crescent Vigilant Brocade Riding Breeches', False),
            'feet': ('yusar_{sex}_crescent_vigilant_boots', 'Crescent Vigilant Astral Cavalier Boots', True),
        },
    },
    {
        'key': 'crimson_technomancer',
        'file': 'Meshy_AI_Crimson_Technomancer_1105101936_texture.glb',
        'culture': 'iron_republic',
        'tier_label': 'Crimson Technomancer (Republic Arcanist)',
        'target_h': 1.855,
        'x_offset': 0.0,
        'y_head_cut': 1.500,
        'rotate_arms': False,
        'trunk_only_arms': True,
        'pieces': {
            'head': ('rep_{sex}_crimson_technomancer_hat', 'Crimson Technomancer Spire-Hat & Visor Mask', False),
            'torso': ('rep_{sex}_crimson_technomancer_coat', 'Crimson Technomancer Filigree Greatcloak', False),
            'gloves': ('rep_{sex}_crimson_technomancer_gloves', 'Crimson Technomancer Brass-Cuffed Gauntlets', True),
            'legs': ('rep_{sex}_crimson_technomancer_trousers', 'Crimson Technomancer Crimson Robe-Skirt & Trousers', False),
            'feet': ('rep_{sex}_crimson_technomancer_boots', 'Crimson Technomancer Ironclad Boots', True),
        },
    },
    {
        'key': 'crested_guardian',
        'file': 'Meshy_AI_Crested_Guardian_1105094734_image-to-3d-texture.glb',
        'culture': 'hykkousoi',
        'tier_label': 'Crested Guardian (Hykkousoi Royal Hoplite)',
        'target_h': 1.910,
        'x_offset': -0.025,
        'y_head_cut': 1.495,
        'decimate': True,
        'rotate_arms': False,
        'trunk_only_arms': True,
        'pieces': {
            'head': ('hykk_{sex}_crested_guardian_helm', 'Crested Guardian Emerald-Plumed Corinthian Helm', True),
            'torso': ('hykk_{sex}_crested_guardian_cuirass', 'Crested Guardian Golden Panoply & Hoplon Shield', True),
            'gloves': ('hykk_{sex}_crested_guardian_gauntlets', 'Crested Guardian Lion-Stamped Vambraces', True),
            'legs': ('hykk_{sex}_crested_guardian_greaves', 'Crested Guardian Pteruges Kilt & Thigh-Guards', True),
            'feet': ('hykk_{sex}_crested_guardian_boots', 'Crested Guardian Golden Hoplite Greave-Sandals', True),
        },
    },
]


def process_spec(spec, kits, pdata):
    fn_path = os.path.join(DL, spec['file'])
    j_m, b_m = glbio.read_glb(open(fn_path, 'rb').read())
    p0 = j_m['meshes'][0]['primitives'][0]
    pos_raw = glbio.accessor(j_m, b_m, p0['attributes']['POSITION']).astype(np.float64)
    nrm_raw = glbio.accessor(j_m, b_m, p0['attributes']['NORMAL']).astype(np.float64)
    uv_raw = glbio.accessor(j_m, b_m, p0['attributes']['TEXCOORD_0']).astype(np.float32)
    tri_raw = glbio.accessor(j_m, b_m, p0['indices']).reshape(-1, 3)

    if 'filter_x_min' in spec:
        keep_v = pos_raw[:, 0] > spec['filter_x_min']
        keep_t = keep_v[tri_raw[:, 0]] & keep_v[tri_raw[:, 1]] & keep_v[tri_raw[:, 2]]
        used_v, new_t = np.unique(tri_raw[keep_t], return_inverse=True)
        pos_raw = pos_raw[used_v]
        nrm_raw = nrm_raw[used_v]
        uv_raw = uv_raw[used_v]
        tri_raw = new_t.reshape(-1, 3)

    if spec.get('decimate'):
        pos_raw, nrm_raw, uv_raw, tri_raw = decimate_uv_preserving(pos_raw, nrm_raw, uv_raw, tri_raw, cell_size=0.0185)

    mat = j_m['materials'][p0.get('material', 0)]
    tex_idx = mat.get('pbrMetallicRoughness', {}).get('baseColorTexture', {}).get('index', 0)
    img_idx = j_m['textures'][tex_idx]['source'] if j_m.get('textures') else 0
    bv_tex = j_m['bufferViews'][j_m['images'][img_idx]['bufferView']]
    tex_pil = Image.open(io.BytesIO(b_m[bv_tex.get('byteOffset', 0):bv_tex.get('byteOffset', 0) + bv_tex['byteLength']])).convert('RGB')
    tex_bio = io.BytesIO()
    tex_pil.save(tex_bio, 'JPEG', quality=92)
    tex_jpeg_bytes = tex_bio.getvalue()

    pos = pos_raw.copy()
    pos[:, 0] -= spec.get('x_offset', 0.0)
    pos[:, 1] -= pos[:, 1].min()
    scale_f = spec['target_h'] / max(float(pos[:, 1].max()), 1e-6)
    pos *= scale_f
    nrm = nrm_raw.copy()

    _, inv = np.unique(np.round(pos, 5), axis=0, return_inverse=True)
    t_w = inv[tri_raw]
    n_v = int(inv.max()) + 1
    u_pos = np.zeros((n_v, 3))
    u_pos[inv] = pos
    e0 = np.concatenate([t_w[:, 0], t_w[:, 1], t_w[:, 2]])
    e1 = np.concatenate([t_w[:, 1], t_w[:, 2], t_w[:, 0]])
    G_all = coo_matrix((np.ones(len(e0)), (e0, e1)), shape=(n_v, n_v))

    if spec.get('trunk_only_arms'):
        w_l = np.zeros(len(pos), dtype=np.float64)
        w_r = np.zeros(len(pos), dtype=np.float64)
        d_l = np.full(len(pos), np.inf)
        d_r = np.full(len(pos), np.inf)
        pos_m = pos.copy()
        nrm_m = nrm.copy()
        T = tri_raw.copy()
        tc_orig = pos[T].mean(axis=1)
        y_hc = spec['y_head_cut']
        mask_head = tc_orig[:, 1] >= y_hc
        if spec['key'] == 'crimson_technomancer':
            mask_gloves = (~mask_head) & (np.abs(tc_orig[:, 0]) >= 0.305) & (tc_orig[:, 1] >= 0.72) & (tc_orig[:, 1] <= 1.06) & (tc_orig[:, 2] >= -0.04)
            mask_boots = (~mask_head) & (tc_orig[:, 1] <= 0.32)
            mask_pants = (~mask_head) & (~mask_gloves) & (tc_orig[:, 1] >= 0.29) & (tc_orig[:, 1] <= 0.945)
            mask_torso = (~mask_head) & (~mask_gloves) & (tc_orig[:, 1] >= 0.915)
        else:
            mask_gloves = (~mask_head) & (np.abs(tc_orig[:, 0]) >= 0.30) & (tc_orig[:, 1] >= 0.82) & (tc_orig[:, 1] <= 1.15) & (tc_orig[:, 0] < -0.25)
            mask_boots = (~mask_head) & (tc_orig[:, 1] <= 0.32)
            mask_pants = (~mask_head) & (tc_orig[:, 1] >= 0.29) & (tc_orig[:, 1] <= 0.94) & (tc_orig[:, 0] <= 0.24)
            mask_torso = (~mask_head) & ((tc_orig[:, 1] >= 0.91) | ((tc_orig[:, 0] > 0.20) & (tc_orig[:, 1] >= 0.62)))
        arm_w_vert = np.zeros(len(pos), dtype=np.float64)
    else:
        if spec.get('cape_safe_arms'):
            arm_cand = (np.abs(u_pos[:, 0]) > 0.245) & (u_pos[:, 1] > 0.94) & (u_pos[:, 1] < 1.48) & (u_pos[:, 2] > -0.045)
        else:
            arm_cand = ((np.abs(u_pos[:, 0]) > 0.205) | (u_pos[:, 1] > 1.30)) & (u_pos[:, 1] > 0.76) & (u_pos[:, 1] < 1.48) & (u_pos[:, 2] > -0.11)
        keep_e = arm_cand[e0] & arm_cand[e1]
        e0_a, e1_a = e0[keep_e], e1[keep_e]
        el_a = np.linalg.norm(u_pos[e0_a] - u_pos[e1_a], axis=1)
        G_arm = coo_matrix((el_a, (e0_a, e1_a)), shape=(n_v, n_v))

        x_seed_min = 0.44 if not spec.get('rotate_arms') else 0.30
        l_seed = np.where((u_pos[:, 0] > x_seed_min) & (u_pos[:, 1] > 0.78) & (u_pos[:, 1] < 1.18) & (u_pos[:, 2] > -0.05))[0]
        r_seed = np.where((u_pos[:, 0] < -x_seed_min) & (u_pos[:, 1] > 0.78) & (u_pos[:, 1] < 1.18) & (u_pos[:, 2] > -0.05))[0]
        d_l_u = dijkstra(G_arm, directed=False, indices=l_seed).min(0)
        d_r_u = dijkstra(G_arm, directed=False, indices=r_seed).min(0)
        d_l = d_l_u[inv]
        d_r = d_r_u[inv]

        w_l_u = np.where(np.isfinite(d_l_u), np.clip((0.55 - d_l_u) / 0.16, 0.0, 1.0), 0.0)
        w_r_u = np.where(np.isfinite(d_r_u), np.clip((0.55 - d_r_u) / 0.16, 0.0, 1.0), 0.0)
        adj_u = G_all.tocsr()
        deg_u = np.maximum(np.array(adj_u.sum(axis=1)).ravel(), 1.0)
        pin_l = (d_l_u < 0.24) | ((np.abs(u_pos[:, 0]) < 0.16) & (u_pos[:, 1] < 1.28)) | (u_pos[:, 2] < -0.12)
        pin_r = (d_r_u < 0.24) | ((np.abs(u_pos[:, 0]) < 0.16) & (u_pos[:, 1] < 1.28)) | (u_pos[:, 2] < -0.12)
        w_l_init, w_r_init = w_l_u.copy(), w_r_u.copy()
        for _ in range(8):
            w_l_u = np.where(pin_l, w_l_init, 0.45 * w_l_u + 0.55 * ((adj_u @ w_l_u) / deg_u))
            w_r_u = np.where(pin_r, w_r_init, 0.45 * w_r_u + 0.55 * ((adj_u @ w_r_u) / deg_u))
        w_l = w_l_u[inv]
        w_r = w_r_u[inv]

        pos_m = pos.copy()
        nrm_m = nrm.copy()
        if spec.get('rotate_arms'):
            piv_l = np.array([0.190, 1.428, 0.018])
            v_d_l = np.array(spec['v_d_l'], dtype=np.float64)
            v_c_l = np.array([0.311, -0.330, 0.196], dtype=np.float64)
            R_l_rot = rot_between(v_d_l, v_c_l)
            sc_len = (np.linalg.norm(v_c_l) / np.linalg.norm(v_d_l)) if spec.get('scale_arm_len', True) else 1.0
            R_l = R_l_rot * sc_len

            piv_r = np.array([-0.190, 1.428, 0.018])
            v_d_r = np.array([-v_d_l[0], v_d_l[1], v_d_l[2]], dtype=np.float64)
            v_c_r = np.array([-0.311, -0.330, 0.196], dtype=np.float64)
            R_r_rot = rot_between(v_d_r, v_c_r)
            R_r = R_r_rot * sc_len

            pos_m += w_l[:, None] * (((pos - piv_l) @ R_l.T + piv_l) - pos)
            pos_m += w_r[:, None] * (((pos - piv_r) @ R_r.T + piv_r) - pos)
            nrm_m = (1.0 - w_l - w_r)[:, None] * nrm + w_l[:, None] * (nrm @ R_l_rot.T) + w_r[:, None] * (nrm @ R_r_rot.T)
            nrm_m /= np.maximum(np.linalg.norm(nrm_m, axis=1, keepdims=True), 1e-9)

        orig_e = np.maximum(
            np.linalg.norm(pos[tri_raw[:, 1]] - pos[tri_raw[:, 0]], axis=1),
            np.maximum(
                np.linalg.norm(pos[tri_raw[:, 2]] - pos[tri_raw[:, 1]], axis=1),
                np.linalg.norm(pos[tri_raw[:, 0]] - pos[tri_raw[:, 2]], axis=1),
            ),
        )
        new_e = np.maximum(
            np.linalg.norm(pos_m[tri_raw[:, 1]] - pos_m[tri_raw[:, 0]], axis=1),
            np.maximum(
                np.linalg.norm(pos_m[tri_raw[:, 2]] - pos_m[tri_raw[:, 1]], axis=1),
                np.linalg.norm(pos_m[tri_raw[:, 0]] - pos_m[tri_raw[:, 2]], axis=1),
            ),
        )
        tri_y_orig = pos[tri_raw, 1].mean(axis=1)
        valid_tri_mask = (tri_y_orig >= 1.12) | (new_e <= (orig_e * 1.75))
        T = tri_raw[valid_tri_mask]

        tc_orig = pos[T].mean(axis=1)
        tri_d_l = d_l[T].mean(axis=1)
        tri_d_r = d_r[T].mean(axis=1)
        tri_arm = (w_l[T].mean(axis=1) > 0.45) | (w_r[T].mean(axis=1) > 0.45)

        y_hc = spec['y_head_cut']
        mask_head = tc_orig[:, 1] >= y_hc
        mask_gloves = (~mask_head) & tri_arm & ((tri_d_l <= 0.27) | (tri_d_r <= 0.27))
        mask_boots = (~mask_head) & (~mask_gloves) & (~tri_arm) & (tc_orig[:, 1] <= 0.32)
        mask_pants = (~mask_head) & (~mask_gloves) & (~tri_arm) & (tc_orig[:, 1] >= 0.29) & (tc_orig[:, 1] <= 0.945)
        mask_torso = (~mask_head) & (~(tri_arm & ((tri_d_l < 0.25) | (tri_d_r < 0.25)))) & (tc_orig[:, 1] >= 0.915)
        arm_w_vert = np.clip(w_l + w_r, 0.0, 1.0)

    # Expand boot/greave region outward slightly so base feet never clip
    boot_w = smoothstep(0.30, 0.16, pos_m[:, 1])
    leg_cx = np.where(pos_m[:, 0] >= 0.0, 0.095, -0.095)
    rx = pos_m[:, 0] - leg_cx
    rz = pos_m[:, 2] - 0.015
    rn = np.maximum(np.hypot(rx, rz), 1e-6)
    pos_m[:, 0] += boot_w * (rx / rn) * 0.006
    pos_m[:, 2] += boot_w * (rz / rn) * 0.007

    gc.set_body('mpfb_male')
    rm = gc.RIG
    ym_knots = np.array([
        0.0,
        float(rm.jpos[rm.J['LeftFoot']][1]),
        float(rm.jpos[rm.J['LeftLeg']][1]),
        float(rm.jpos[rm.J['LeftUpLeg']][1]),
        float(rm.jpos[rm.J['Spine2']][1]),
        float(rm.jpos[rm.J['Neck']][1]),
        float(rm.jpos[rm.J['Head']][1]),
        2.50,
    ])
    xm_arm = abs(float(rm.jpos[rm.J['LeftForeArm']][0]))

    gc.set_body('mpfb_female')
    rf = gc.RIG
    yf_knots = np.array([
        0.0,
        float(rf.jpos[rf.J['LeftFoot']][1]),
        float(rf.jpos[rf.J['LeftLeg']][1]),
        float(rf.jpos[rf.J['LeftUpLeg']][1]),
        float(rf.jpos[rf.J['Spine2']][1]),
        float(rf.jpos[rf.J['Neck']][1]),
        float(rf.jpos[rf.J['Head']][1]),
        2.50 * (float(rf.jpos[rf.J['Head']][1]) / float(rm.jpos[rm.J['Head']][1])),
    ])
    xf_arm = abs(float(rf.jpos[rf.J['LeftForeArm']][0]))
    xz_scale = xf_arm / max(xm_arm, 1e-6)

    pos_f = pos_m.copy()
    pos_f[:, 1] = np.interp(pos_m[:, 1], ym_knots, yf_knots)
    pos_f[:, 0] = pos_m[:, 0] * xz_scale
    pos_f[:, 2] = pos_m[:, 2] * xz_scale

    for body, P_body, pfx, sex_key in (('mpfb_male', pos_m, 'm', 'male'), ('mpfb_female', pos_f, 'f', 'female')):
        gc.set_body(body)
        tb_c = gc.BP_GL[gc.BT].mean(axis=1)
        y_neck = float(gc.RIG.jpos[gc.RIG.J['Neck']][1]) - 0.04
        y_hips = float(gc.RIG.jpos[gc.RIG.J['LeftUpLeg']][1]) - 0.04
        y_shin = float(gc.RIG.jpos[gc.RIG.J['LeftLeg']][1]) - 0.14
        x_elbow = abs(float(gc.RIG.jpos[gc.RIG.J['LeftForeArm']][0])) - 0.03
        x_wrist = abs(float(gc.RIG.jpos[gc.RIG.J['LeftHand']][0])) + 0.12
        hide_head = tb_c[:, 1] >= y_neck - 0.04
        hide_torso = (tb_c[:, 1] >= y_hips - 0.04) & (tb_c[:, 1] <= y_neck + 0.06) & (np.abs(tb_c[:, 0]) <= x_elbow + 0.06)
        hide_gloves = (tb_c[:, 1] >= y_hips - 0.10) & (tb_c[:, 1] <= y_neck + 0.04) & (np.abs(tb_c[:, 0]) >= x_elbow - 0.05) & (np.abs(tb_c[:, 0]) <= x_wrist)
        hide_pants = (tb_c[:, 1] >= y_shin - 0.04) & (tb_c[:, 1] <= y_hips + 0.06) & (np.abs(tb_c[:, 0]) <= x_elbow + 0.02)
        hide_boots = tb_c[:, 1] <= y_shin + 0.06

        masks_by_slot = {
            'head': (mask_head, hide_head, ['Human.lips', 'Human.ears', 'Human.eyebrow001', 'Human.eyelashes01', 'Human.eyebrow002', 'Human.eyelashes02', 'Human.low-poly'], True),
            'torso': (mask_torso, hide_torso, ['Human.nipple'], False),
            'gloves': (mask_gloves, hide_gloves, ['Human.fingernails'], False),
            'legs': (mask_pants, hide_pants, None, False),
            'feet': (mask_boots, hide_boots, ['Human.toenails'], False),
        }

        outfit_dict = {'hair': None, 'beard': None, 'type': 'important_npc'}
        items = kits[body]['items']
        for slot, (gid_tpl, pname, is_met) in spec['pieces'].items():
            gid = gid_tpl.format(sex=pfx)
            t_mask, h_mask, h_parts, cov_hair = masks_by_slot[slot]
            P_s, N_s, UV_s, T_s, arm_s = extract_submesh(
                P_body, nrm_m, uv_raw, T, t_mask,
                arm_w_vert if slot == 'torso' else None,
                min_comp_tris=(2 if slot == 'gloves' else 15)
            )
            ent = write_meshy_piece(
                gid, pname, slot, spec['culture'],
                P_s, N_s, UV_s, T_s, tex_jpeg_bytes, h_mask,
                hide_parts=h_parts, covers_hair=cov_hair, is_metallic=is_met,
                arm_w_sub=arm_s
            )
            idx = next((i for i, x in enumerate(items) if x.get('id') == gid), None)
            if idx is not None:
                items[idx] = ent
            else:
                items.append(ent)
            outfit_dict[slot] = gid

        for p_entry in pdata.get('peoples', []):
            if p_entry['id'] == spec['culture']:
                t_key = spec['key']
                p_entry.setdefault('tier_labels', {})[t_key] = spec['tier_label']
                if not any(t[0] == t_key for t in p_entry.setdefault('tiers', [])):
                    p_entry['tiers'].append([t_key, 0.02])
                p_entry.setdefault('outfits', {}).setdefault(sex_key, {})[t_key] = outfit_dict


def main():
    kits = {}
    for body in ('mpfb_male', 'mpfb_female'):
        kp = os.path.join(ROOT, 'data', body, 'kit.json')
        kits[body] = json.load(open(kp, 'r', encoding='utf-8'))
    pp = os.path.join(ROOT, 'data', 'peoples.json')
    pdata = json.load(open(pp, 'r', encoding='utf-8'))

    for spec in SPECS:
        print(f"=== Processing {spec['key']} ({spec['file']}) ===")
        process_spec(spec, kits, pdata)

    for body in ('mpfb_male', 'mpfb_female'):
        kp = os.path.join(ROOT, 'data', body, 'kit.json')
        with open(kp, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(kits[body], f, indent=2)
        print(f'Saved {kp}')

    with open(pp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(pdata, f, indent=2)
    print(f'Saved {pp}')


if __name__ == '__main__':
    main()
