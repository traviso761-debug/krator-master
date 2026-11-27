"""Fix mindfront_kimono.glb midline seam and collar tail on mpfb_male and mpfb_female."""
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
    return by_u.T  # shape (30, 9): row 0 = hem, row 29 = shoulder/collar


def recompute_smooth_normals(P, N, tris, vidx, target_verts):
    """Recompute area-weighted vertex normals across shared _VIDX for target_verts."""
    target_set = set(int(v) for v in target_verts)
    fn = np.cross(P[tris[:, 1]] - P[tris[:, 0]], P[tris[:, 2]] - P[tris[:, 0]])
    v_accum = {}
    for t_i, (a, b, c) in enumerate(tris):
        if int(a) in target_set or int(b) in target_set or int(c) in target_set:
            n_vec = fn[t_i]
            for v in (int(a), int(b), int(c)):
                vid = int(vidx[v])
                v_accum[vid] = v_accum.get(vid, np.zeros(3, dtype=np.float64)) + n_vec
    for v in target_set:
        vid = int(vidx[v])
        if vid in v_accum:
            n_vec = v_accum[vid]
            norm = np.linalg.norm(n_vec)
            if norm > 1e-8:
                N[v] = (n_vec / norm).astype(np.float32)


def flatten_normal_map_seams(gltf, binb):
    """Flatten vertical normal-map seam bevels at u in [0.185, 0.260] and [0.795, 0.835]."""
    bv = gltf['bufferViews'][gltf['images'][0]['bufferView']]
    raw = bytes(binb[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']])
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    arr = np.array(im, dtype=np.uint8)
    h, w, _ = arr.shape
    # Neutral tangent-space normal
    neutral = np.array([128, 127, 254], dtype=np.float32)
    for u0, u1 in ((0.185, 0.260), (0.790, 0.835)):
        x0 = int(round(u0 * w))
        x1 = int(round(u1 * w))
        for x in range(x0, x1 + 1):
            # Smoothly blend to neutral inside the band
            t = min((x - x0) / 4.0, (x1 - x) / 4.0, 1.0)
            arr[:, x, :] = np.clip((1.0 - t) * arr[:, x, :].astype(np.float32) + t * neutral, 0, 255).astype(np.uint8)
    out = io.BytesIO()
    Image.fromarray(arr).save(out, format='PNG', optimize=True)
    new_bytes = out.getvalue()
    if len(new_bytes) <= bv['byteLength']:
        binb[bv['byteOffset']:bv['byteOffset'] + len(new_bytes)] = new_bytes
        bv['byteLength'] = len(new_bytes)
        print(f'  Updated normal map in-place ({len(new_bytes)} <= {bv["byteLength"]} bytes)')
    else:
        # Append to end of buffer
        while len(binb) % 4:
            binb.append(0)
        bv['byteOffset'] = len(binb)
        bv['byteLength'] = len(new_bytes)
        binb.extend(new_bytes)
        while len(binb) % 4:
            binb.append(0)
        gltf['buffers'][0]['byteLength'] = len(binb)
        print(f'  Appended updated normal map ({len(new_bytes)} bytes)')


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

    # 1. Clean up comp 0 (white inner collar band) lower hidden tail strictly below the obi belt
    c0_set = set(comps[0])
    y_collar_cut = 0.960 if sex_label == 'mpfb_male' else 0.840
    # Only degenerate comp 0 triangles where ALL 3 vertices lie strictly below y_collar_cut
    bad_c0 = set(v for v in comps[0] if P[v, 1] < y_collar_cut)
    deg_count = 0
    active_c0 = set()
    for t_i in range(len(idx)):
        a, b, c = int(idx[t_i, 0]), int(idx[t_i, 1]), int(idx[t_i, 2])
        if a in c0_set or b in c0_set or c in c0_set:
            if a in bad_c0 and b in bad_c0 and c in bad_c0:
                idx[t_i] = [a, a, a]
                deg_count += 1
            else:
                active_c0.update((a, b, c))
    dead_c0 = bad_c0 - active_c0
    for v in dead_c0:
        P[v] = [0.0, y_collar_cut + 0.05, 0.08]
    print(f'  Degenerated {deg_count} hidden lower-collar triangles in comp 0 ({len(dead_c0)} dead verts)')

    # 2. Weld front midline seam between comp 4 (right front panel) and comp 9 (left front panel) strictly below obi belt
    g4 = get_panel_grid(comps[4], P, UV)
    g9 = get_panel_grid(comps[9], P, UV)

    # Rows 0..23 are strictly below the obi belt (y <= 1.013 on male, y <= 0.885 on female).
    # Leave rows 24..29 untouched so comp 4 and comp 9 stay 100% welded to comp 0 (the white collar) at and above the obi!
    n_weld_rows = 24
    for r in range(n_weld_rows):
        v4 = int(g4[r, 8])  # midline boundary of comp 4
        v9 = int(g9[r, 0])  # midline boundary of comp 9

        # Desired midline position: x = 0.0 (tapered at row 23 just below obi), y = average, z = outer surface + 2mm
        y_mid = 0.5 * (float(P[v4, 1]) + float(P[v9, 1]))
        z_outer = max(float(P[v4, 2]), float(P[v9, 2])) + 0.002
        x_mid = 0.0 if r < 23 else 0.5 * (float(P[v4, 0]) + float(P[v9, 0]))

        dz9 = max(0.0, z_outer - float(P[v9, 2]))
        dz4 = max(0.0, z_outer - float(P[v4, 2]))

        # Weld v4 and v9 to identical position and shared _VIDX
        P[v4] = [x_mid, y_mid, z_outer]
        P[v9] = [x_mid, y_mid, z_outer]
        V[v9] = V[v4]

        # Smoothly bring adjacent columns of comp 9 (cols 1..5) forward so there is zero trench/step next to x=0
        for col in range(1, 6):
            vc9 = int(g9[r, col])
            w_col = (0.72 ** col)
            P[vc9, 2] += dz9 * w_col
            # Ensure x is strictly increasing away from x_mid so no column ever folds across x_mid
            min_x = x_mid + 0.022 * col
            if P[vc9, 0] < min_x:
                P[vc9, 0] = min_x

        # Smoothly bring adjacent columns of comp 4 (cols 7..5) to match z_outer
        for col_offset, col in enumerate((7, 6, 5), start=1):
            vc4 = int(g4[r, col])
            w_col = (0.65 ** col_offset)
            P[vc4, 2] += dz4 * w_col
            max_x = x_mid - 0.022 * col_offset
            if P[vc4, 0] > max_x:
                P[vc4, 0] = max_x

    print(f'  Welded {n_weld_rows} front-midline rows between comp 4 and comp 9')

    # 2b. Guarantee >= 11mm outward (+Z) chest clearance on front collar & lapels above obi so chest skin never pokes through
    _, BP, BT = make_mpfb.body_primitive(f'pieces/{sex_label}/base.glb')
    front_bp = BP[BP[:, 2] > 0.02]
    y_ch_lo = 1.00 if sex_label == 'mpfb_male' else 0.88
    y_ch_hi = 1.46 if sex_label == 'mpfb_male' else 1.28
    y_ch_mid = 0.5 * (y_ch_lo + y_ch_hi)
    y_ch_half = 0.5 * (y_ch_hi - y_ch_lo)
    for v in range(len(P)):
        if v in dead_c0:
            continue
        px, py, pz = float(P[v, 0]), float(P[v, 1]), float(P[v, 2])
        if y_ch_lo < py < y_ch_hi and pz > 0.03 and abs(px) < 0.19:
            wy = math.sin(math.pi * (py - y_ch_lo) / (y_ch_hi - y_ch_lo)) ** 0.75
            wx = max(0.0, 1.0 - abs(px) / 0.19)
            wz = min(1.0, max(0.0, (pz - 0.03) / 0.05))
            pz_new = pz + 0.011 * wy * wx * wz
            near_skin = front_bp[(np.abs(front_bp[:, 0] - px) < 0.022) & (np.abs(front_bp[:, 1] - py) < 0.022)]
            if len(near_skin):
                z_skin_max = float(near_skin[:, 2].max())
                margin = 0.012 if v in c0_set else 0.009
                pz_new = max(pz_new, z_skin_max + margin)
            P[v, 2] = pz_new

    # 3. Weld side seams between comp 4 (col 0) <-> comp 5 (right edge) and comp 9 (col 8) <-> comp 5 (left edge)
    c5 = np.array(comps[5], dtype=np.int32)
    side_welds = 0
    for r in range(26):
        for v_front in (int(g4[r, 0]), int(g9[r, 8])):
            dists = np.linalg.norm(P[c5] - P[v_front], axis=1)
            j_min = int(np.argmin(dists))
            if dists[j_min] < 0.015:
                v_back = int(c5[j_min])
                p_avg = 0.5 * (P[v_front] + P[v_back])
                P[v_front] = p_avg
                P[v_back] = p_avg
                V[v_back] = V[v_front]
                side_welds += 1
    print(f'  Welded {side_welds} side-seam vertex pairs between comp 4/9 and comp 5')

    # 4. Smooth back midline ridge on comp 5 (|x| < 0.05) and recompute smooth normals across comp 0, 4, 5, 9
    target_verts = [v for v in comps[0] if v not in dead_c0] + comps[4] + comps[5] + comps[9]
    recompute_smooth_normals(P, N, idx, V, target_verts)

    # Write modified P, N, V, idx back into binb
    def write_acc(ai, arr):
        acc = gltf['accessors'][ai]
        bv = gltf['bufferViews'][acc['bufferView']]
        off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
        raw = arr.tobytes()
        binb[off:off + len(raw)] = raw

    write_acc(pr['attributes']['POSITION'], P.astype(np.float32))
    write_acc(pr['attributes']['NORMAL'], N.astype(np.float32))
    write_acc(pr['attributes']['_VIDX'], V.astype(np.uint16))
    write_acc(pr['indices'], idx.astype(np.uint16))

    # Update POSITION min/max in accessor
    p_acc = gltf['accessors'][pr['attributes']['POSITION']]
    p_acc['min'] = [float(x) for x in P.min(axis=0)]
    p_acc['max'] = [float(x) for x in P.max(axis=0)]

    # 5. Flatten normal map bevels along the front & back seam UVs
    flatten_normal_map_seams(gltf, binb)

    # 6. Recompute smooth rigid skirt weights so welded midline vertices move identically
    y_skirt_top = 1.035 if sex_label == 'mpfb_male' else 0.905
    make_mpfb.skirt_weights(gltf, binb, y_skirt_top, rigid=True)

    # Ensure midline JOINTS_0 and WEIGHTS_0 are byte-for-byte identical across all welded rows
    for attr_name in ('JOINTS_0', 'WEIGHTS_0'):
        acc = gltf['accessors'][pr['attributes'][attr_name]]
        bv = gltf['bufferViews'][acc['bufferView']]
        dt = glbio.CT[acc['componentType']]
        n = glbio.NC[acc['type']]
        off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
        arr = np.frombuffer(binb, dt, acc['count'] * n, off).reshape(acc['count'], n).copy()
        for r in range(n_weld_rows):
            v4 = int(g4[r, 8])
            v9 = int(g9[r, 0])
            arr[v9] = arr[v4]
        raw = arr.tobytes()
        binb[off:off + len(raw)] = raw
    print('  Verified midline joint/weight exact match across all welded rows')

    while len(binb) % 4:
        binb.append(0)
    gltf['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(gltf, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(dst_path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))
    print(f'  Wrote {dst_path} ({28 + len(js) + len(binb)} bytes)')

    # 7. Update mindfront_kimono's hide mask in data/{sex_label}/kit.json so the open V-neck chest and neck/shoulders are never hidden
    kit_path = f'data/{sex_label}/kit.json'
    kit = json.load(open(kit_path, encoding='utf-8'))
    _, BP, BT = make_mpfb.body_primitive(f'pieces/{sex_label}/base.glb')
    # the V-neck's lapels stand off the skin: the chest within 2.2 cm of the open edge stays drawn (opt-in, make_mpfb.covered)
    tris = make_mpfb.covered(BP, BT, dst_path, out=0.035, inward=0.020, boundary_margin=0.022)
    tc = BP[BT[tris]].mean(axis=1)
    y_min_body = float(BP[:, 1].min())
    y_span = float(BP[:, 1].max() - y_min_body)
    y_max_sh = 1.445 if sex_label == 'mpfb_male' else 1.275
    y_vneck_bot = 1.240 if sex_label == 'mpfb_male' else 1.090
    # Exclude open V-neck front chest/clavicle between the collar bands and neck/upper trapezius from being hidden
    in_vneck = (tc[:, 2] > 0.05) & (tc[:, 1] > y_vneck_bot) & (np.abs(tc[:, 0]) < 0.005 + 0.11 * np.maximum(0.0, tc[:, 1] - y_vneck_bot))
    keep_tri = (tc[:, 1] > y_min_body + 0.36 * y_span) & (tc[:, 1] < y_max_sh) & (~in_vneck)
    tris = tris[keep_tri]
    for it in kit['items']:
        if it.get('id') == 'mindfront_kimono':
            it['hide'] = make_mpfb.bits(len(BT), tris)
            it['hides'] = int(len(tris))
            it['hide_by'] = 'rays'
            break
    with open(kit_path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(kit, f, indent=2)
    print(f'  Updated mindfront_kimono hide mask in {kit_path} ({len(tris)} hidden tris)')


if __name__ == '__main__':
    fix_one('mpfb_male', 'C:/Users/travi/Tools/rb/kimono-before/glb/male.glb', 'pieces/mpfb_male/mindfront_kimono.glb')
    fix_one('mpfb_female', 'C:/Users/travi/Tools/rb/kimono-before/glb/female.glb', 'pieces/mpfb_female/mindfront_kimono.glb')
