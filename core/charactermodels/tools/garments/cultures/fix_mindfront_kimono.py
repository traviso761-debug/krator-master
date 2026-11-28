"""Fix mindfront_kimono.glb midline seam, chest clearance, and welded shoulder normals on mpfb_male and mpfb_female."""
import io
import json
import math
import os
import struct
import numpy as np
from PIL import Image
from tools import glbio, make_mpfb


def get_components(n_verts, tris):
    adj = {i: set() for i in range(n_verts)}
    for a, b, c in tris:
        adj[int(a)].update((int(b), int(c)))
        adj[int(b)].update((int(a), int(c)))
        adj[int(c)].update((int(a), int(b)))
    vis = set()
    comps = []
    for i in range(n_verts):
        if i not in vis:
            c = []
            q = [i]
            vis.add(i)
            while q:
                u = q.pop()
                c.append(u)
                for w in adj[u]:
                    if w not in vis:
                        vis.add(w)
                        q.append(w)
            comps.append(sorted(c))
    return comps


def get_panel_grid(comp_indices, P, UV):
    """Return 30x9 topological grid for comp 4 or comp 9 sorted by UV.u ascending (cols 0..8) and UV.v descending (rows 0..29)."""
    c = np.array(comp_indices, dtype=np.int32)
    by_u = c[np.argsort(UV[c, 0])].reshape(9, 30)
    for col in range(9):
        by_u[col] = by_u[col, np.argsort(-UV[by_u[col], 1])]
    return by_u.T  # shape (30, 9): row 0 = hem, row 29 = waist/chest join


def recompute_smooth_normals(P, N, tris, vidx, target_verts):
    """Recompute area-weighted vertex normals across shared _VIDX for all target_verts."""
    target_set = set(int(v) for v in target_verts)
    fn = np.cross(P[tris[:, 1]] - P[tris[:, 0]], P[tris[:, 2]] - P[tris[:, 0]])
    v_accum = {}
    for t_i, (a, b, c) in enumerate(tris):
        ia, ib, ic = int(a), int(b), int(c)
        if ia == ib or ib == ic or ia == ic:
            continue
        if ia in target_set and ib in target_set and ic in target_set:
            n_vec = fn[t_i]
            for v in (ia, ib, ic):
                vid = int(vidx[v])
                v_accum[vid] = v_accum.get(vid, np.zeros(3, dtype=np.float64)) + n_vec
    for v in target_set:
        vid = int(vidx[v])
        if vid in v_accum:
            n_vec = v_accum[vid]
            norm = np.linalg.norm(n_vec)
            if norm > 1e-8:
                N[v] = (n_vec / norm).astype(np.float32)


def flatten_normal_map_seams(gltf, binb, UV=None, idx=None, V=None, comps=None):
    """Flatten normal-map seam bevels at all inter-component UV edges (shoulders, chest, armholes, front/back seams)."""
    bv = gltf['bufferViews'][gltf['images'][0]['bufferView']]
    raw = bytes(binb[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']])
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    h, w, _ = arr.shape
    neutral = np.array([128.0, 127.0, 254.0], dtype=np.float32)

    # 1. Flatten vertical front/back seam bands
    for u0, u1 in ((0.185, 0.260), (0.790, 0.835)):
        x0 = int(round(u0 * w))
        x1 = int(round(u1 * w))
        for x in range(x0, x1 + 1):
            t = min((x - x0) / 4.0, (x1 - x) / 4.0, 1.0)
            arr[:, x, :] = (1.0 - t) * arr[:, x, :] + t * neutral

    # 2. Flatten normal-map bevels along ALL inter-component seam edges (shoulders, collar-chest, sleeve-shoulder, side seams)
    if UV is not None and idx is not None and V is not None and comps is not None:
        obi_set = set(comps[11]) if len(comps) > 11 else set()
        by_v = {}
        for i, vid in enumerate(V):
            if i not in obi_set:
                by_v.setdefault(int(vid), []).append(i)
        seam_vids = {vid for vid, vs in by_v.items() if len(vs) > 1}
        seam_verts = {v for vid in seam_vids for v in by_v[vid]}

        # Collect UV segments of all triangle edges where both endpoints lie on a component seam
        mask = np.zeros((h, w), dtype=np.float32)
        rad = max(6, int(round(w * 0.012)))
        yy, xx = np.mgrid[-rad:rad + 1, -rad:rad + 1]
        kernel = np.clip(1.0 - np.hypot(xx, yy) / max(rad, 1), 0.0, 1.0)

        edges = set()
        for a, b, c in idx:
            ia, ib, ic = int(a), int(b), int(c)
            if ia == ib or ib == ic or ia == ic:
                continue
            for u1_v, u2_v in ((ia, ib), (ib, ic), (ic, ia)):
                if u1_v in seam_verts and u2_v in seam_verts:
                    e_key = (min(u1_v, u2_v), max(u1_v, u2_v))
                    edges.add(e_key)

        for va, vb in edges:
            ua, va_uv = float(UV[va, 0]), float(UV[va, 1])
            ub, vb_uv = float(UV[vb, 0]), float(UV[vb, 1])
            if math.hypot(ua - ub, va_uv - vb_uv) > 0.25:
                continue
            n_steps = max(4, int(math.hypot((ua - ub) * w, (va_uv - vb_uv) * h) / 2.0) + 1)
            for s in range(n_steps + 1):
                ts = s / float(n_steps)
                px = int(round((ua + ts * (ub - ua)) * (w - 1)))
                py = int(round((va_uv + ts * (vb_uv - va_uv)) * (h - 1)))
                y0_k, y1_k = max(0, py - rad), min(h, py + rad + 1)
                x0_k, x1_k = max(0, px - rad), min(w, px + rad + 1)
                ky0, ky1 = y0_k - (py - rad), y1_k - (py - rad)
                kx0, kx1 = x0_k - (px - rad), x1_k - (px - rad)
                mask[y0_k:y1_k, x0_k:x1_k] = np.maximum(mask[y0_k:y1_k, x0_k:x1_k], kernel[ky0:ky1, kx0:kx1])

        m3 = mask[:, :, None]
        arr = (1.0 - m3) * arr + m3 * neutral

    arr_u8 = np.clip(arr, 0, 255).astype(np.uint8)
    out = io.BytesIO()
    Image.fromarray(arr_u8).save(out, format='PNG', optimize=True)
    new_bytes = out.getvalue()
    if len(new_bytes) <= bv['byteLength']:
        binb[bv['byteOffset']:bv['byteOffset'] + len(new_bytes)] = new_bytes
        bv['byteLength'] = len(new_bytes)
    else:
        while len(binb) % 4:
            binb.append(0)
        bv['byteOffset'] = len(binb)
        bv['byteLength'] = len(new_bytes)
        binb.extend(new_bytes)
        while len(binb) % 4:
            binb.append(0)
        gltf['buffers'][0]['byteLength'] = len(binb)


def fix_one(sex_label, src_path, dst_path):
    print(f'=== Fixing {sex_label}: {src_path} -> {dst_path} ===')
    gltf, binb_ro = glbio.read_glb(open(src_path, 'rb').read())
    binb = bytearray(binb_ro)

    pr = gltf['meshes'][0]['primitives'][0]
    P = glbio.accessor(gltf, binb, pr['attributes']['POSITION']).copy()
    N = glbio.accessor(gltf, binb, pr['attributes']['NORMAL']).copy()
    UV = glbio.accessor(gltf, binb, pr['attributes']['TEXCOORD_0']).copy()
    V = glbio.accessor(gltf, binb, pr['attributes']['_VIDX']).reshape(-1).copy()
    idx = glbio.accessor(gltf, binb, pr['indices']).reshape(-1, 3).copy()

    comps = get_components(len(P), idx)
    print(f'  Found {len(comps)} connected components; sizes: {[len(c) for c in comps]}')

    # Map original _VIDX -> list of vertex indices so any seam vertices sharing _VIDX ALWAYS move together
    by_vid = {}
    for i, vid in enumerate(V):
        by_vid.setdefault(int(vid), []).append(i)

    # 1. Clean up comp 0 (white inner collar band) lower hidden tail strictly below the obi belt
    c0_set = set(comps[0])
    y_collar_cut = 0.960 if sex_label == 'mpfb_male' else 0.840
    bad_c0 = set(v for v in comps[0] if P[v, 1] < y_collar_cut)
    deg_count = 0
    for t_i in range(len(idx)):
        a, b, c = int(idx[t_i, 0]), int(idx[t_i, 1]), int(idx[t_i, 2])
        if (a in c0_set or b in c0_set or c in c0_set) and (a in bad_c0 and b in bad_c0 and c in bad_c0):
            idx[t_i] = [a, a, a]
            deg_count += 1
    print(f'  Degenerated {deg_count} hidden lower-collar triangles in comp 0')

    # 2. Close front midline seam between comp 4 (right front panel) and comp 9 (left front panel) below obi belt
    #    WITHOUT overwriting _VIDX (so morph deltas stay 100% consistent with .morph.bin!)
    g4 = get_panel_grid(comps[4], P, UV)
    g9 = get_panel_grid(comps[9], P, UV)

    n_weld_rows = 24
    for r in range(n_weld_rows):
        v4 = int(g4[r, 8])  # midline boundary of comp 4
        v9 = int(g9[r, 0])  # midline boundary of comp 9

        y_mid = 0.5 * (float(P[v4, 1]) + float(P[v9, 1]))
        z_outer = max(float(P[v4, 2]), float(P[v9, 2])) + 0.002
        x_mid = 0.0 if r < 23 else 0.5 * (float(P[v4, 0]) + float(P[v9, 0]))

        dz9 = max(0.0, z_outer - float(P[v9, 2]))
        dz4 = max(0.0, z_outer - float(P[v4, 2]))

        P[v4] = [x_mid, y_mid, z_outer]
        P[v9] = [x_mid, y_mid, z_outer]
        old_vid9 = int(V[v9])
        new_vid4 = int(V[v4])
        for v_same in by_vid.get(old_vid9, []):
            V[v_same] = new_vid4
            if v_same in bad_c0:
                P[v_same] = [x_mid, y_mid, z_outer]
        by_vid.setdefault(new_vid4, []).extend(by_vid.pop(old_vid9, []))

        for col in range(1, 6):
            vc9 = int(g9[r, col])
            w_col = (0.72 ** col)
            P[vc9, 2] += dz9 * w_col
            min_x = x_mid + 0.022 * col
            if P[vc9, 0] < min_x:
                P[vc9, 0] = min_x

        for col_offset, col in enumerate((7, 6, 5), start=1):
            vc4 = int(g4[r, col])
            w_col = (0.65 ** col_offset)
            P[vc4, 2] += dz4 * w_col
            max_x = x_mid - 0.022 * col_offset
            if P[vc4, 0] > max_x:
                P[vc4, 0] = max_x

    # 3. Guarantee >= 14mm outward chest clearance on front collar & upper chest panels (grouped by _VIDX so seams never split!)
    _, BP, BT = make_mpfb.body_primitive(f'pieces/{sex_label}/base.glb')
    front_bp = BP[BP[:, 2] > 0.01]
    y_ch_lo = 1.00 if sex_label == 'mpfb_male' else 0.88
    y_ch_hi = 1.50 if sex_label == 'mpfb_male' else 1.32

    obi_set = set(comps[11]) if len(comps) > 11 else set()
    for vid, vs in by_vid.items():
        if any(v in obi_set for v in vs):
            continue
        p0 = P[vs[0]]
        px, py, pz = float(p0[0]), float(p0[1]), float(p0[2])
        if y_ch_lo < py < y_ch_hi and pz > 0.02 and abs(px) < 0.21:
            wy = math.sin(math.pi * (py - y_ch_lo) / (y_ch_hi - y_ch_lo)) ** 0.70
            wx = max(0.0, 1.0 - abs(px) / 0.21)
            wz = min(1.0, max(0.0, (pz - 0.02) / 0.05))
            pz_new = pz + 0.013 * wy * wx * wz
            near_skin = front_bp[(np.abs(front_bp[:, 0] - px) < 0.025) & (np.abs(front_bp[:, 1] - py) < 0.025)]
            if len(near_skin):
                z_skin_max = float(near_skin[:, 2].max())
                pz_new = max(pz_new, z_skin_max + 0.014)
            for v in vs:
                P[v, 2] = pz_new

        # Guarantee all vertices sharing _VIDX have identical 3D position so zero seam gaps exist anywhere
        if len(vs) > 1:
            p_mean = P[vs].mean(axis=0)
            for v in vs:
                P[v] = p_mean

    # 4. Recompute smooth normals across ALL cloth components (comps 0..10, excluding obi comp 11)
    cloth_verts = []
    for ci, comp in enumerate(comps):
        if ci == 11:
            continue
        cloth_verts.extend(comp)
    recompute_smooth_normals(P, N, idx, V, cloth_verts)

    # Also average normals across midline welded rows (v4, v9) so front seam has zero normal crease
    for r in range(n_weld_rows):
        v4 = int(g4[r, 8])
        v9 = int(g9[r, 0])
        nm = N[v4] + N[v9]
        n_len = np.linalg.norm(nm)
        if n_len > 1e-8:
            nm = (nm / n_len).astype(np.float32)
            N[v4] = nm
            N[v9] = nm

    def write_acc(ai, arr):
        acc = gltf['accessors'][ai]
        bv = gltf['bufferViews'][acc['bufferView']]
        dt = glbio.CT[acc['componentType']]
        off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
        raw = arr.astype(dt).tobytes()
        binb[off:off + len(raw)] = raw

    write_acc(pr['attributes']['POSITION'], P)
    write_acc(pr['attributes']['NORMAL'], N)
    write_acc(pr['attributes']['_VIDX'], V)
    write_acc(pr['indices'], idx)

    p_acc = gltf['accessors'][pr['attributes']['POSITION']]
    p_acc['min'] = [float(x) for x in P.min(axis=0)]
    p_acc['max'] = [float(x) for x in P.max(axis=0)]

    # 5. Flatten normal map bevels along all component seam UVs (shoulders, chest, collar, sleeves, front/back)
    flatten_normal_map_seams(gltf, binb, UV=UV, idx=idx, V=V, comps=comps)

    # 6. Recompute smooth rigid skirt weights, synchronize chest/collar skin weights with the underlying body mesh BP
    #    (so neck/shoulder rotation in animations never pulls the collar band behind the Spine2-weighted chest skin!),
    #    and synchronize welded midline rows.
    y_skirt_top = 1.035 if sex_label == 'mpfb_male' else 0.905
    make_mpfb.skirt_weights(gltf, binb, y_skirt_top, rigid=True)

    b_gltf, b_bin = glbio.read_glb(open(f'pieces/{sex_label}/base.glb', 'rb').read())
    b_prim = next(p for m in b_gltf['meshes'] for p in m['primitives']
                  if 'material' in p and b_gltf['materials'][p['material']]['name'].endswith('.body'))
    b_P = glbio.accessor(b_gltf, b_bin, b_prim['attributes']['POSITION']).astype(np.float64)
    b_J = glbio.accessor(b_gltf, b_bin, b_prim['attributes']['JOINTS_0']).copy()
    b_W = glbio.accessor(b_gltf, b_bin, b_prim['attributes']['WEIGHTS_0']).astype(np.float64)
    b_W /= np.maximum(b_W.sum(axis=1, keepdims=True), 1e-9)
    from scipy.spatial import cKDTree
    b_tree = cKDTree(b_P)
    y_vneck_bot = 1.085 if sex_label == 'mpfb_male' else 0.955
    y_neck_top = 1.485 if sex_label == 'mpfb_male' else 1.310

    chest_sync_v = {}
    for vid, vs in by_vid.items():
        if any(v in obi_set for v in vs):
            continue
        p0 = P[vs[0]]
        px, py, pz = float(p0[0]), float(p0[1]), float(p0[2])
        if (y_vneck_bot - 0.04) < py < (y_neck_top + 0.02) and pz > 0.02 and abs(px) < 0.145:
            # Query the body vertex directly behind (px, py, pz - 0.018) so collar & chest move 100% in lockstep with chest skin
            _, b_idx = b_tree.query([px, py, pz - 0.018])
            for v in vs:
                chest_sync_v[v] = int(b_idx)

    for attr_name in ('JOINTS_0', 'WEIGHTS_0'):
        acc = gltf['accessors'][pr['attributes'][attr_name]]
        bv = gltf['bufferViews'][acc['bufferView']]
        dt = glbio.CT[acc['componentType']]
        n = glbio.NC[acc['type']]
        off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
        arr = np.frombuffer(binb, dt, acc['count'] * n, off).reshape(acc['count'], n).copy()
        for v_k, b_idx in chest_sync_v.items():
            if attr_name == 'JOINTS_0':
                arr[v_k] = b_J[b_idx].astype(dt)
            else:
                w_val = b_W[b_idx]
                if acc.get('normalized') and np.issubdtype(dt, np.integer):
                    arr[v_k] = np.round(w_val * np.iinfo(dt).max).astype(dt)
                else:
                    arr[v_k] = w_val.astype(dt)
        for r in range(n_weld_rows):
            v4 = int(g4[r, 8])
            v9 = int(g9[r, 0])
            arr[v9] = arr[v4]
        raw = arr.tobytes()
        binb[off:off + len(raw)] = raw

    while len(binb) % 4:
        binb.append(0)
    gltf['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(gltf, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(dst_path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))
    print(f'  Wrote {dst_path} ({28 + len(js) + len(binb)} bytes)')

    # 7. Update mindfront_kimono's hide mask in data/{sex_label}/kit.json:
    #    Keep the entire V-neck chest skin (down to y_vneck_bot above the obi and extending under the standing collar band
    #    comp 0) UNHIDDEN so no deleted-triangle staircase edge is ever visible inside or under the standing collar!
    kit_path = f'data/{sex_label}/kit.json'
    kit = json.load(open(kit_path, encoding='utf-8'))
    base_glb = f'pieces/{sex_label}/base.glb'
    _, BP, BT = make_mpfb.body_primitive(base_glb)
    under = make_mpfb.parts_under(base_glb, BP, BT)
    tris = make_mpfb.covered(BP, BT, dst_path, out=0.075, inward=0.030, enclose=0.45, boundary_margin=0.0)
    tc = BP[BT[tris]].mean(axis=1)
    y_min_body = float(BP[:, 1].min())
    y_span = float(BP[:, 1].max() - y_min_body)
    # Un-hide the full V-neck skin zone strictly inside the collar bands (from y_vneck_bot up to the neck)
    in_vneck = (tc[:, 2] > 0.04) & (tc[:, 1] > y_vneck_bot) & (np.abs(tc[:, 0]) < 0.018 + 0.24 * np.maximum(0.0, tc[:, 1] - y_vneck_bot))
    in_neck_cyl = (tc[:, 1] > y_neck_top) & (np.abs(tc[:, 0]) < 0.085)
    keep_tri = (tc[:, 1] > y_min_body + 0.36 * y_span) & (~in_vneck) & (~in_neck_cyl)
    tris = tris[keep_tri]
    for it in kit['items']:
        if it.get('id') == 'mindfront_kimono':
            it['hide'] = make_mpfb.bits(len(BT), tris)
            it['hides'] = int(len(tris))
            it['hide_by'] = 'rays'
            hp = make_mpfb.hide_parts(it, under, len(BT))
            if hp:
                it['hide_parts'] = hp
            break
    make_mpfb.write_kit(kit_path, kit)
    print(f'  Updated mindfront_kimono hide mask in {kit_path} ({len(tris)} hidden tris)')


if __name__ == '__main__':
    fix_one('mpfb_male', 'C:/Users/travi/Tools/rb/kimono-before/glb/male.glb', 'pieces/mpfb_male/mindfront_kimono.glb')
    fix_one('mpfb_female', 'C:/Users/travi/Tools/rb/kimono-before/glb/female.glb', 'pieces/mpfb_female/mindfront_kimono.glb')
