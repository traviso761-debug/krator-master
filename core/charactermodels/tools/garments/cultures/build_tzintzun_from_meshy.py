"""Convert downloaded Meshy_AI_Sun_Sovereign_1105094506_texture.glb into rigged MPFB Tzintzun pieces."""
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
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import glbio
import make_mpfb
from garments import core as gc
from make_pieces import rot_between

MESHY_GLB = r'C:\Users\travi\Downloads\Meshy_AI_Sun_Sovereign_1105094506_texture.glb'


def pack_bits(mask_bool, n_tris):
    out = np.zeros((n_tris + 7) >> 3, dtype=np.uint8)
    idx = np.where(mask_bool[:n_tris])[0]
    for i in idx:
        out[i >> 3] |= (1 << (i & 7))
    return base64.b64encode(out.tobytes()).decode('ascii'), int(len(idx))


def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def compute_lower_body_weights(P_sub, T_sub, rig, joint_names, slot, arm_w_sub=None):
    """Smooth analytical + welded-Laplacian skin weights for torso waist, harem pants/cape, and boots."""
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
        # Pure smooth analytical weights per boot: (Leg, Foot, ToeBase)
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

    # Analytical 6-bone weights for lower torso / harem pants / lower cape:
    # [Spine, Hips, LeftUpLeg, RightUpLeg, LeftLeg, RightLeg]
    y_knee = float(rig.jpos[rig.J['LeftLeg']][1])  # ~0.517
    W6 = np.zeros((n_v, 6), dtype=np.float64)
    b_ids = [idx_sp, idx_hips, idx_lul, idx_rul, idx_ll, idx_rl]

    w_sp = smoothstep(0.955, 1.075, y)
    # Waist belt (y = 0.90..0.96) is predominantly Hips so torso and pants move together without seam shear
    w_hips_belt = (1.0 - w_sp) * smoothstep(0.815, 0.930, y)
    # Back cape & center sash get extra Hips support near x=0 so they don't over-stretch between legs
    is_cape_sheet = smoothstep(-0.07, -0.15, z) * smoothstep(0.34, 0.45, y)
    center_bridge = np.exp(-(x / 0.11) ** 2) * smoothstep(0.52, 0.78, y)
    w_hips_drape = (1.0 - w_sp - w_hips_belt) * np.clip(0.32 * is_cape_sheet + 0.35 * center_bridge, 0.0, 0.55)

    w_hips = w_hips_belt + w_hips_drape
    w_rem = np.maximum(0.0, 1.0 - w_sp - w_hips)

    # Left vs right transition width: wider on the back cape / upper crotch, narrow on the lower trouser tubes
    half_w = 0.035 + 0.145 * np.maximum(is_cape_sheet, smoothstep(0.60, 0.82, y))
    s_left = smoothstep(-half_w, half_w, x)

    # Thigh (UpLeg) vs Shin (Leg) transition around the knee
    t_shin = smoothstep(y_knee + 0.055, y_knee - 0.115, y)

    W6[:, 0] = w_sp
    W6[:, 1] = w_hips
    W6[:, 2] = w_rem * s_left * (1.0 - t_shin)
    W6[:, 3] = w_rem * (1.0 - s_left) * (1.0 - t_shin)
    W6[:, 4] = w_rem * s_left * t_shin
    W6[:, 5] = w_rem * (1.0 - s_left) * t_shin

    if slot == 'legs':
        # Welded-vertex Laplacian smoothing across T_sub so UV seams and folds deform with zero tearing
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
        # Pin waist overlap (y >= 0.905) and boot cuff overlap (y <= 0.335) so seams match 100%
        pin = (y_u >= 0.905) | (y_u <= 0.335)

        for _ in range(8):
            W_avg = (adj @ W_u) / deg[:, None]
            W_u = np.where(pin[:, None], W_u_init, 0.55 * W_u + 0.45 * W_avg)
            W_u /= np.maximum(W_u.sum(axis=1, keepdims=True), 1e-9)
        W6 = W_u[inv]

    # Pack top 4 weights into JJ, WW
    top4 = np.argsort(-W6, axis=1)[:, :4]
    for k in range(4):
        idx_k = top4[:, k]
        JJ[:, k] = np.array(b_ids, dtype=np.uint8)[idx_k]
        WW[:, k] = W6[np.arange(n_v), idx_k].astype(np.float32)
    w_sum = np.maximum(WW.sum(axis=1, keepdims=True), 1e-9)
    WW /= w_sum
    return JJ, WW


def write_meshy_piece(gid, name, slot, culture, P_sub, N_sub, UV_sub, T_sub, tex_jpeg_bytes,
                      hide_mask_bool, hide_parts=None, covers_hair=False, is_metallic=True,
                      plume_mask=None, arm_w_sub=None):
    body = gc.BODY_ID
    j_tpl = copy.deepcopy(gc.TPL_J)
    b_tpl = gc.TPL_B
    rig = gc.RIG
    joint_names = list(rig.joints)

    # Separate torso/leg vs arm base vertices so wide cape/trouser vertices NEVER pick up ForeArm/Hand weights
    from scipy.spatial import cKDTree
    non_arm_base = np.where(gc.BASE_ARM_W <= 0.04)[0]
    arm_base = np.where(gc.BASE_ARM_W > 0.15)[0]
    tree_non_arm = cKDTree(gc.BP_GL[non_arm_base])
    tree_arm = cKDTree(gc.BP_GL[arm_base])

    _, nn_non_arm = tree_non_arm.query(P_sub, k=1)
    nn_idx = non_arm_base[nn_non_arm]
    if slot == 'gloves':
        _, nn_a = tree_arm.query(P_sub, k=1)
        nn_idx = arm_base[nn_a]
    elif arm_w_sub is not None:
        is_arm_v = arm_w_sub >= 0.30
        if is_arm_v.any():
            _, nn_a = tree_arm.query(P_sub[is_arm_v], k=1)
            nn_idx[is_arm_v] = arm_base[nn_a]

    JJ_arr = gc.BASE_JJ[nn_idx].copy()
    WW_arr = gc.BASE_WW[nn_idx].copy()
    VI_arr = np.arange(len(P_sub), dtype=np.int32)

    if slot == 'head':
        # Mask & helmet bind rigidly to Head; lower neck collar & hanging horsehair plume blend Head -> Neck -> Spine2
        idx_head = joint_names.index('Head')
        idx_neck = joint_names.index('Neck')
        idx_sp2 = joint_names.index('Spine2')
        JJ_arr[:] = 0
        WW_arr[:] = 0.0
        JJ_arr[:, 0] = idx_head
        WW_arr[:, 0] = 1.0
        for vi in range(len(P_sub)):
            y = float(P_sub[vi, 1])
            z = float(P_sub[vi, 2])
            if plume_mask is not None and plume_mask[vi] and y < 1.54 and z < -0.05:
                if y >= 1.43:
                    t = np.clip((1.54 - y) / 0.11, 0.0, 1.0) * 0.55
                    JJ_arr[vi, 0] = idx_head
                    WW_arr[vi, 0] = 1.0 - t
                    JJ_arr[vi, 1] = idx_neck
                    WW_arr[vi, 1] = t
                else:
                    t = np.clip((1.43 - y) / 0.16, 0.0, 1.0) * 0.75
                    JJ_arr[vi, 0] = idx_neck
                    WW_arr[vi, 0] = (1.0 - t) * 0.55
                    JJ_arr[vi, 1] = idx_sp2
                    WW_arr[vi, 1] = t
                    JJ_arr[vi, 2] = idx_head
                    WW_arr[vi, 2] = 1.0 - WW_arr[vi, 0] - WW_arr[vi, 1]
            elif y < 1.535 and z < 0.06:
                t = np.clip((1.535 - y) / 0.055, 0.0, 1.0) * 0.65
                JJ_arr[vi, 0] = idx_head
                WW_arr[vi, 0] = 1.0 - t
                JJ_arr[vi, 1] = idx_neck
                WW_arr[vi, 1] = t
    elif slot in ('legs', 'feet'):
        JJ_arr, WW_arr = compute_lower_body_weights(P_sub, T_sub, rig, joint_names, slot)
    elif slot == 'torso':
        # Smoothly blend non-arm lower waist vertices (y <= 1.075) into the exact same analytical waist field as pants
        JJ_low, WW_low = compute_lower_body_weights(P_sub, T_sub, rig, joint_names, slot)
        low_mask = (P_sub[:, 1] <= 1.04) & ((arm_w_sub < 0.15) if arm_w_sub is not None else True)
        JJ_arr[low_mask] = JJ_low[low_mask]
        WW_arr[low_mask] = WW_low[low_mask]

    j_tpl['meshes'][0]['name'] = gid
    for node in j_tpl['nodes']:
        if 'mesh' in node:
            node['name'] = gid
    j_tpl['materials'][0]['name'] = gid
    j_tpl['materials'][0]['doubleSided'] = True
    pbr = j_tpl['materials'][0].setdefault('pbrMetallicRoughness', {})
    pbr['baseColorFactor'] = [1.0, 1.0, 1.0, 1.0]
    if is_metallic:
        pbr['metallicFactor'] = 0.26
        pbr['roughnessFactor'] = 0.42
        j_tpl['materials'][0]['extensions'] = {
            'KHR_materials_clearcoat': {'clearcoatFactor': 0.20, 'clearcoatRoughnessFactor': 0.34}
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

    # Write .glb
    out_glb = os.path.join(ROOT, 'pieces', body, f'{gid}.glb')
    js = json.dumps(j_tpl, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((-len(js)) % 4)
    with open(out_glb, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))

    # Write .morph.bin using make_mpfb.pack_morphs
    used_vi = np.unique(VI_arr)
    base_vidx_for_vi = gc.BASE_VIDX[nn_idx[used_vi]]
    D_garment = np.zeros((gc.BASE_MORPH_D.shape[0], int(used_vi.max()) + 1, 3), dtype=np.float32)
    if slot == 'head':
        # Keep mask rigid on Head bone rather than distorting solar rays with nose/jaw sliders
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
    print(f'Built Meshy piece {gid:26s} ({slot:6s}): {len(P_sub):5d} verts, {len(T_sub):5d} tris, hides {n_hidden:4d} base tris')
    return entry


def extract_submesh(P, N, UV, T, tri_mask, extra_mask_per_vert=None):
    sel_tris = T[tri_mask]
    # Remove any tiny disconnected fragment (< 30 tris) left near bridge cuts
    _, inv_w = np.unique(np.round(P, 5), axis=0, return_inverse=True)
    tw = inv_w[sel_tris]
    n_w = int(inv_w.max()) + 1
    e0 = np.concatenate([tw[:, 0], tw[:, 1], tw[:, 2]])
    e1 = np.concatenate([tw[:, 1], tw[:, 2], tw[:, 0]])
    _, lbl = connected_components(coo_matrix((np.ones(len(e0)), (e0, e1)), shape=(n_w, n_w)), directed=False)
    tri_lbl = lbl[tw[:, 0]]
    u_l, c_l = np.unique(tri_lbl, return_counts=True)
    keep_l = set(u_l[c_l >= 30].tolist())
    sel_tris = sel_tris[np.isin(tri_lbl, list(keep_l))]
    used_verts, new_tris = np.unique(sel_tris, return_inverse=True)
    new_tris = new_tris.reshape(-1, 3)
    sub_extra = extra_mask_per_vert[used_verts] if extra_mask_per_vert is not None else None
    return P[used_verts], N[used_verts], UV[used_verts], new_tris, sub_extra


def main():
    j_m, b_m = glbio.read_glb(open(MESHY_GLB, 'rb').read())
    p0 = j_m['meshes'][0]['primitives'][0]
    pos_raw = glbio.accessor(j_m, b_m, p0['attributes']['POSITION']).astype(np.float64)
    nrm_raw = glbio.accessor(j_m, b_m, p0['attributes']['NORMAL']).astype(np.float64)
    uv_raw = glbio.accessor(j_m, b_m, p0['attributes']['TEXCOORD_0']).astype(np.float32)
    tri_raw = glbio.accessor(j_m, b_m, p0['indices']).reshape(-1, 3)

    # Extract texture_0 and encode as high-quality JPEG
    bv_tex = j_m['bufferViews'][j_m['images'][1]['bufferView']]
    tex_pil = Image.open(io.BytesIO(b_m[bv_tex.get('byteOffset', 0):bv_tex.get('byteOffset', 0) + bv_tex['byteLength']])).convert('RGB')
    tex_bio = io.BytesIO()
    tex_pil.save(tex_bio, 'JPEG', quality=93)
    tex_jpeg_bytes = tex_bio.getvalue()

    # Scale and shift to align with mpfb_male
    pos = pos_raw.copy() * 1.02
    pos[:, 1] -= pos[:, 1].min()
    nrm = nrm_raw.copy()

    # Connected components to identify comp 1 (horsehair plume + helmet crest)
    _, inv = np.unique(np.round(pos, 5), axis=0, return_inverse=True)
    t_w = inv[tri_raw]
    n_v = int(inv.max()) + 1
    u_pos = np.zeros((n_v, 3))
    u_pos[inv] = pos
    e0 = np.concatenate([t_w[:, 0], t_w[:, 1], t_w[:, 2]])
    e1 = np.concatenate([t_w[:, 1], t_w[:, 2], t_w[:, 0]])
    G_all = coo_matrix((np.ones(len(e0)), (e0, e1)), shape=(n_v, n_v))
    _, comp_labels = connected_components(G_all, directed=False)
    is_plume_vert = (comp_labels[inv] == 1)

    # Geodesic arm segmentation outside the torso cylinder below armpits
    arm_cand = ((np.abs(u_pos[:, 0]) > 0.195) | (u_pos[:, 1] > 1.29)) & (u_pos[:, 1] > 0.78) & (u_pos[:, 1] < 1.49) & (u_pos[:, 2] > -0.145)
    keep_e = arm_cand[e0] & arm_cand[e1]
    e0_a, e1_a = e0[keep_e], e1[keep_e]
    el_a = np.linalg.norm(u_pos[e0_a] - u_pos[e1_a], axis=1)
    G_arm = coo_matrix((el_a, (e0_a, e1_a)), shape=(n_v, n_v))

    l_seed = np.where((u_pos[:, 0] > 0.28) & (u_pos[:, 1] > 0.86) & (u_pos[:, 1] < 1.05) & (u_pos[:, 2] > 0.04))[0]
    r_seed = np.where((u_pos[:, 0] < -0.28) & (u_pos[:, 1] > 0.86) & (u_pos[:, 1] < 1.05) & (u_pos[:, 2] > 0.04))[0]
    d_l_u = dijkstra(G_arm, directed=False, indices=l_seed).min(0)
    d_r_u = dijkstra(G_arm, directed=False, indices=r_seed).min(0)
    d_l = d_l_u[inv]
    d_r = d_r_u[inv]

    w_l_u = np.where(np.isfinite(d_l_u), np.clip((0.58 - d_l_u) / 0.16, 0.0, 1.0), 0.0)
    w_r_u = np.where(np.isfinite(d_r_u), np.clip((0.58 - d_r_u) / 0.16, 0.0, 1.0), 0.0)
    adj_u = G_all.tocsr()
    deg_u = np.maximum(np.array(adj_u.sum(axis=1)).ravel(), 1.0)
    pin_l = (d_l_u < 0.26) | ((np.abs(u_pos[:, 0]) < 0.16) & (u_pos[:, 1] < 1.28)) | (u_pos[:, 2] < -0.15)
    pin_r = (d_r_u < 0.26) | ((np.abs(u_pos[:, 0]) < 0.16) & (u_pos[:, 1] < 1.28)) | (u_pos[:, 2] < -0.15)
    w_l_init, w_r_init = w_l_u.copy(), w_r_u.copy()
    for _ in range(8):
        w_l_u = np.where(pin_l, w_l_init, 0.45 * w_l_u + 0.55 * ((adj_u @ w_l_u) / deg_u))
        w_r_u = np.where(pin_r, w_r_init, 0.45 * w_r_u + 0.55 * ((adj_u @ w_r_u) / deg_u))
    w_l = w_l_u[inv]
    w_r = w_r_u[inv]

    piv_l = np.array([0.190, 1.428, 0.018])
    v_d_l, v_c_l = np.array([0.123, -0.468, 0.082]), np.array([0.311, -0.330, 0.196])
    R_l_rot = rot_between(v_d_l, v_c_l)
    R_l = R_l_rot * (np.linalg.norm(v_c_l) / np.linalg.norm(v_d_l))

    piv_r = np.array([-0.190, 1.428, 0.018])
    v_d_r, v_c_r = np.array([-0.123, -0.468, 0.082]), np.array([-0.311, -0.330, 0.196])
    R_r_rot = rot_between(v_d_r, v_c_r)
    R_r = R_r_rot * (np.linalg.norm(v_c_r) / np.linalg.norm(v_d_r))

    pos_m = pos.copy()
    pos_m += w_l[:, None] * (((pos - piv_l) @ R_l.T + piv_l) - pos)
    pos_m += w_r[:, None] * (((pos - piv_r) @ R_r.T + piv_r) - pos)

    # Expand boot/greave region (y <= 0.30) outward by 6mm so base feet never clip through boots
    boot_w = smoothstep(0.30, 0.16, pos_m[:, 1])
    leg_cx = np.where(pos_m[:, 0] >= 0.0, 0.095, -0.095)
    rx = pos_m[:, 0] - leg_cx
    rz = pos_m[:, 2] - 0.015
    rn = np.maximum(np.hypot(rx, rz), 1e-6)
    pos_m[:, 0] += boot_w * (rx / rn) * 0.0065
    pos_m[:, 2] += boot_w * (rz / rn) * 0.0075

    nrm_m = (1.0 - w_l - w_r)[:, None] * nrm + w_l[:, None] * (nrm @ R_l_rot.T) + w_r[:, None] * (nrm @ R_r_rot.T)
    nrm_m /= np.maximum(np.linalg.norm(nrm_m, axis=1, keepdims=True), 1e-9)

    # Filter out ONLY low wrist-to-hip bridge triangles (y < 1.12), never shoulder/sleeve triangles
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
    tri_plume = is_plume_vert[T].any(axis=1)
    tri_d_l = d_l[T].mean(axis=1)
    tri_d_r = d_r[T].mean(axis=1)
    tri_arm = (w_l[T].mean(axis=1) > 0.45) | (w_r[T].mean(axis=1) > 0.45)

    mask_head = tri_plume | (tc_orig[:, 1] >= 1.488)
    mask_gloves = (~mask_head) & tri_arm & ((tri_d_l <= 0.275) | (tri_d_r <= 0.275))

    # Pure horizontal height segmentation with 3cm overlap bands and zero vertical x/z slicing
    mask_boots = (~mask_head) & (~mask_gloves) & (~tri_arm) & (tc_orig[:, 1] <= 0.315)
    mask_pants = (~mask_head) & (~mask_gloves) & (~tri_arm) & (tc_orig[:, 1] >= 0.285) & (tc_orig[:, 1] <= 0.945)
    not_head_for_torso = (~tri_plume) & ((tc_orig[:, 1] <= 1.496) | ((tc_orig[:, 1] <= 1.525) & (tc_orig[:, 2] < 0.05)))
    mask_torso = not_head_for_torso & (~(tri_arm & ((tri_d_l < 0.255) | (tri_d_r < 0.255)))) & (tc_orig[:, 1] >= 0.915)
    arm_w_vert = np.clip(w_l + w_r, 0.0, 1.0)

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

    for body, P_body, pfx in (('mpfb_male', pos_m, 'm'), ('mpfb_female', pos_f, 'f')):
        gc.set_body(body)
        tb_c = gc.BP_GL[gc.BT].mean(axis=1)
        y_neck = float(gc.RIG.jpos[gc.RIG.J['Neck']][1]) - 0.03
        y_hips = float(gc.RIG.jpos[gc.RIG.J['LeftUpLeg']][1]) - 0.04
        y_shin = float(gc.RIG.jpos[gc.RIG.J['LeftLeg']][1]) - 0.14
        x_elbow = abs(float(gc.RIG.jpos[gc.RIG.J['LeftForeArm']][0])) - 0.03
        x_wrist = abs(float(gc.RIG.jpos[gc.RIG.J['LeftHand']][0])) - 0.01
        hide_head = tb_c[:, 1] >= y_neck
        hide_torso = (tb_c[:, 1] >= y_hips - 0.03) & (tb_c[:, 1] <= y_neck + 0.04) & (np.abs(tb_c[:, 0]) <= x_elbow + 0.05)
        hide_gloves = (tb_c[:, 1] >= y_hips - 0.08) & (tb_c[:, 1] <= y_neck + 0.03) & (np.abs(tb_c[:, 0]) >= x_elbow - 0.04) & (np.abs(tb_c[:, 0]) <= x_wrist)
        hide_pants = (tb_c[:, 1] >= y_shin - 0.03) & (tb_c[:, 1] <= y_hips + 0.05) & (np.abs(tb_c[:, 0]) <= x_elbow)
        hide_boots = tb_c[:, 1] <= y_shin + 0.05

        entries = []
        # 1. Head: voth_m/f_tzintzun_mask
        P_s, N_s, UV_s, T_s, plume_s = extract_submesh(P_body, nrm_m, uv_raw, T, mask_head, is_plume_vert)
        entries.append(write_meshy_piece(
            f'voth_{pfx}_tzintzun_mask', "Tzintzun's Radiant Sun-God Mask & Plume", 'head', 'chichani',
            P_s, N_s, UV_s, T_s, tex_jpeg_bytes, hide_head,
            hide_parts=['Human.lips', 'Human.ears', 'Human.eyebrow001', 'Human.eyelashes01', 'Human.eyebrow002', 'Human.eyelashes02', 'Human.low-poly'],
            covers_hair=True, is_metallic=True, plume_mask=plume_s
        ))
        # 2. Torso: voth_m/f_tzintzun_regalia
        P_s, N_s, UV_s, T_s, arm_s = extract_submesh(P_body, nrm_m, uv_raw, T, mask_torso, arm_w_vert)
        entries.append(write_meshy_piece(
            f'voth_{pfx}_tzintzun_regalia', "Tzintzun's Royal Solar Tunic & Cloak", 'torso', 'chichani',
            P_s, N_s, UV_s, T_s, tex_jpeg_bytes, hide_torso,
            hide_parts=['Human.nipple'], is_metallic=False, arm_w_sub=arm_s
        ))
        # 3. Gloves: voth_m/f_tzintzun_gloves
        P_s, N_s, UV_s, T_s, _ = extract_submesh(P_body, nrm_m, uv_raw, T, mask_gloves)
        entries.append(write_meshy_piece(
            f'voth_{pfx}_tzintzun_gloves', "Tzintzun's Ceremonial Black & Gold Gauntlets", 'gloves', 'chichani',
            P_s, N_s, UV_s, T_s, tex_jpeg_bytes, hide_gloves,
            hide_parts=['Human.fingernails'], is_metallic=True
        ))
        # 4. Legs: voth_m/f_tzintzun_pants
        P_s, N_s, UV_s, T_s, _ = extract_submesh(P_body, nrm_m, uv_raw, T, mask_pants)
        entries.append(write_meshy_piece(
            f'voth_{pfx}_tzintzun_pants', "Tzintzun's Sun-Brocade Harem Trousers", 'legs', 'chichani',
            P_s, N_s, UV_s, T_s, tex_jpeg_bytes, hide_pants, is_metallic=False
        ))
        # 5. Feet: voth_m/f_tzintzun_boots
        P_s, N_s, UV_s, T_s, _ = extract_submesh(P_body, nrm_m, uv_raw, T, mask_boots)
        entries.append(write_meshy_piece(
            f'voth_{pfx}_tzintzun_boots', "Tzintzun's Black & Gold Greave-Boots", 'feet', 'chichani',
            P_s, N_s, UV_s, T_s, tex_jpeg_bytes, hide_boots,
            hide_parts=['Human.toenails'], is_metallic=True
        ))

        kit_path = os.path.join(ROOT, 'data', body, 'kit.json')
        kit_data = json.load(open(kit_path, 'r', encoding='utf-8'))
        items = kit_data['items']
        for e in entries:
            idx = next((i for i, x in enumerate(items) if x.get('id') == e['id']), None)
            if idx is not None:
                items[idx] = e
            else:
                items.append(e)
        with open(kit_path, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(kit_data, f, indent=2)
        print(f'Updated {kit_path}')

    gc.set_body('mpfb_male')
    peoples_path = os.path.join(ROOT, 'data', 'peoples.json')
    pdata = json.load(open(peoples_path, 'r', encoding='utf-8'))
    for p in pdata.get('peoples', []):
        if p['id'] in ('voth', 'chichani'):
            for sex, pfx in (('male', 'm'), ('female', 'f')):
                if sex in p.get('outfits', {}) and 'tzintzun' in p['outfits'][sex]:
                    p['outfits'][sex]['tzintzun'] = {
                        'head': f'voth_{pfx}_tzintzun_mask',
                        'torso': f'voth_{pfx}_tzintzun_regalia',
                        'gloves': f'voth_{pfx}_tzintzun_gloves',
                        'legs': f'voth_{pfx}_tzintzun_pants',
                        'feet': f'voth_{pfx}_tzintzun_boots',
                        'hair': None,
                        'beard': None,
                        'type': 'important_npc',
                    }
    with open(peoples_path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(pdata, f, indent=2)
    print('Updated Tzintzun outfit in data/peoples.json!')


if __name__ == '__main__':
    main()
