"""Layer 2 (Headgear): Helmets, 3D sculpted masks, craniums, hoods, brims, tower/cone hats, turbans, crowns, fans, crests, wings, and horns.

Consolidates all headgear primitives (`head_rings`, `sculpted_faceplate`, `sculpted_cranium`,
`hood`, `brim`, `tower_hat`, `conical_hat`, `cone_hat`, `turban`, `crown_band`, `fan`, `crest`,
`wing`, `horn`) into a single garment-type module.
"""
import math
import numpy as np
import glbio
from .. import core
from ..core import Part, J, first_hit, frame, head_frame, ring_points, smooth_push


_HEAD_LM_CACHE = {}


def head_landmarks_exact():
    """Return `(a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye)` calibrated directly to `base.glb` eyelashes & eyebrows."""
    a, b, up, bk, left = head_frame()
    h_ab = max(float(np.linalg.norm(b - a)), 1e-6)
    bid = core.BODY_ID
    if bid not in _HEAD_LM_CACHE:
        head_v = core.CO[core.CO[:, 2] > a[2] + 0.01]
        z_nose = float(head_v[np.argmin(head_v[:, 1]), 2])
        z_crown = float(head_v[:, 2].max())
        f_nose = (z_nose - float(a[2])) / h_ab
        f_crown = (z_crown - float(a[2])) / h_ab
        f_eyes = f_nose + 0.038 / h_ab
        f_brow = f_eyes + 0.055
        x_eye = 0.0328 if 'male' in (bid or '') else 0.0301
        if core.BASE_GLB is not None and core.BASE_GLB.exists():
            jb, bb = glbio.read_glb(core.BASE_GLB.read_bytes())
            for m in jb.get('meshes', []):
                for pr in m.get('primitives', []):
                    mn = (jb['materials'][pr['material']].get('name', '') if 'material' in pr else '').lower()
                    if 'eyelash' in mn:
                        P_gl = glbio.accessor(jb, bb, pr['attributes']['POSITION'])
                        L_gl = P_gl[P_gl[:, 0] > 0.005]
                        if len(L_gl):
                            f_eyes = (float(L_gl[:, 1].mean()) - float(a[2])) / h_ab
                            x_eye = float(L_gl[:, 0].mean())
                    elif 'eyebrow' in mn:
                        P_gl = glbio.accessor(jb, bb, pr['attributes']['POSITION'])
                        L_gl = P_gl[P_gl[:, 0] > 0.005]
                        if len(L_gl):
                            f_brow = (float(L_gl[:, 1].mean()) - float(a[2])) / h_ab
        _HEAD_LM_CACHE[bid] = (f_nose, f_eyes, f_brow, f_crown, x_eye)
    f_nose, f_eyes, f_brow, f_crown, x_eye = _HEAD_LM_CACHE[bid]
    return a, b, up, bk, left, f_nose, f_eyes, f_brow, f_crown, x_eye


def head_rings(name, f0, f1, ease, paint, n=32, rows=4, apex=False, scale=(1.0, 1.0)):
    a, b = J('Head'), J('Head', 'tail')
    t = (b - a) / np.linalg.norm(b - a)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    x = x - t * x.dot(t)
    x /= np.linalg.norm(x)
    y = np.cross(t, x)
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    fs = np.linspace(f0, f1, rows)
    P_grid = np.array([ring_points(a + (b - a) * f, x, y, angles, ease, rmin=0.03, rmax=0.22, scale=scale) for f in fs])
    if apex:
        c = a + (b - a) * f1
        P_grid[-1] = c + (P_grid[-1] - c) * 0.2 + t * ease
        P_grid[-2] = c + (P_grid[-2] - c) * 0.7 + t * ease * 0.7
    P_grid = smooth_push(P_grid, True, ease, iters=2)
    return Part(name, P_grid, True, ['body'] * rows, paint)


def sculpted_faceplate(name, paint, f_top=0.78, f_bot=-0.06, ease=0.012, span=0.46, rows=16, cols=25,
                       brow_relief=0.015, nose_relief=0.024, cheek_relief=0.011, chin_relief=0.010, jaw_narrow=0.28):
    """Contoured 3D anatomical face-mask spanning only the front facial arc with top-to-bottom row ordering."""
    a, b, up, bk, left = head_frame()
    fs = np.linspace(f_top, f_bot, rows)
    angs = np.linspace(math.pi * (1.0 - span), math.pi * (1.0 + span), cols)
    c_ref = a + (b - a) * 0.44
    base_rs = []
    for an in angs:
        d = bk * math.cos(an) + left * math.sin(an)
        raw = [first_hit(a + (b - a) * ff, d) for ff in (0.18, 0.36, 0.54, 0.68)]
        valid = [h for h in raw if h is not None and 0.05 < h < 0.15]
        base_rs.append((max(valid) if valid else 0.098) + ease)
    base_rs = np.array(base_rs)
    base_rs = np.array([np.mean([base_rs[max(0, min(cols - 1, j + dj))] for dj in (-2, -1, 0, 1, 2)]) for j in range(cols)])

    Q = []
    for i, f in enumerate(fs):
        v = i / max(rows - 1, 1)
        jaw_taper = 1.0 - jaw_narrow * max(0.0, (v - 0.52) / 0.48) ** 1.35
        crown_taper = 1.0 - 0.10 * max(0.0, (0.18 - v) / 0.18) ** 1.5
        row = []
        for j, an in enumerate(angs):
            u_rel = (an - math.pi) / (math.pi * span)
            abs_u = abs(u_rel)
            d = bk * math.cos(an * jaw_taper + math.pi * (1.0 - jaw_taper)) + left * math.sin(an * jaw_taper + math.pi * (1.0 - jaw_taper))
            d /= np.linalg.norm(d)
            r = base_rs[j] * crown_taper * (1.0 - 0.14 * max(0.0, (v - 0.55) / 0.45) * (1.0 - 0.3 * abs_u))
            brow = brow_relief * math.exp(-((v - 0.31) / 0.075) ** 2) * math.exp(-((abs_u - 0.24) / 0.36) ** 2)
            eye_pit = -0.009 * math.exp(-((v - 0.41) / 0.065) ** 2) * math.exp(-((abs_u - 0.30) / 0.18) ** 2)
            nose_len = math.exp(-((v - 0.49) / 0.17) ** 2) * (1.0 + 0.28 * math.sin(np.clip((v - 0.30) / 0.34, 0.0, 1.0) * math.pi))
            nose = nose_relief * nose_len * math.exp(-(u_rel / 0.15) ** 2)
            cheek = cheek_relief * math.exp(-((v - 0.54) / 0.11) ** 2) * math.exp(-((abs_u - 0.46) / 0.22) ** 2)
            lips = 0.007 * (math.exp(-((v - 0.72) / 0.035) ** 2) + 0.85 * math.exp(-((v - 0.77) / 0.038) ** 2)) * math.exp(-(u_rel / 0.24) ** 2)
            chin = chin_relief * math.exp(-((v - 0.90) / 0.08) ** 2) * math.exp(-(u_rel / 0.25) ** 2)
            r_tot = r + brow + eye_pit + nose + cheek + lips + chin
            c_f = np.array([c_ref[0], c_ref[1], (a + (b - a) * f)[2]])
            row.append(c_f + d * r_tot)
        Q.append(row)
    return Part(name, np.array(Q), False, ['body'] * rows, paint, rigid_joint='Head')


def sculpted_cranium(name, paint, f_top=1.02, f_bot=-0.04, ease=0.012, rows=12, n=36):
    """Contoured 3D cranial helmet dome with top-to-bottom row ordering."""
    a, b, up, bk, left = head_frame()
    fs = np.linspace(f_top, f_bot, rows)
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    c_mid = a + (b - a) * 0.56
    base_rs = []
    for an in angs:
        d = bk * math.cos(an) + left * math.sin(an)
        h = first_hit(c_mid, d) or 0.098
        base_rs.append(h + ease)
    base_rs = np.array([np.mean([base_rs[(j + dj) % n] for dj in (-2, -1, 0, 1, 2)]) for j in range(n)])
    Q = []
    for i, f in enumerate(fs):
        c = a + (b - a) * f
        if f > 0.68:
            u_top = min(1.0, (f - 0.68) / max(0.08, f_top - 0.68))
            scale_r = max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.85)))
        elif f < 0.20:
            scale_r = 1.0 - 0.12 * ((0.20 - f) / 0.30)
        else:
            scale_r = 1.0 + 0.03 * math.sin((f - 0.20) / 0.48 * math.pi)
        row = []
        for j, an in enumerate(angs):
            d = bk * math.cos(an) + left * math.sin(an)
            row.append(c + d * (base_rs[j] * scale_r))
        Q.append(row)
    Q = np.array(Q)
    Q[0] = Q[0].mean(0) + (Q[0] - Q[0].mean(0)) * 0.04
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def hood(gid, paint, ease=0.035, ease_low=0.055, open_front=0.95, low=-0.45, rows=14, n=36, peak=0.05, high=1.0):
    """Seamless 360-degree closed cloth hood (`closed=True`) whose lower rim drapes over the neck/shoulders
    at the back and sides while arching smoothly over the forehead brow in front — topologically immune to
    forehead/crown bifurcation."""
    a, b, up, bk, left = head_frame()
    low_eff = min(float(low), -0.15)
    angles = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]

    # Rim height f_rim(an): low_eff around neck/shoulders, arching smoothly up to f_brow across the front face cutout
    open_eff = max(0.0, float(open_front))
    f_brow = min(float(high) - 0.16, 0.62)
    f_rim = np.full(n, low_eff, dtype=np.float64)
    if open_eff > 0.05:
        half_span = min(math.pi * 0.85, open_eff * 1.18)
        for j, an in enumerate(angles):
            ang_front = abs(an - math.pi)
            if ang_front < half_span:
                w = 0.5 + 0.5 * math.cos(math.pi * ang_front / half_span)
                f_rim[j] = low_eff + (f_brow - low_eff) * (w ** 0.80)

    Q = np.zeros((rows, n, 3), dtype=np.float64)
    row_eases = np.zeros(rows, dtype=np.float64)
    for i in range(rows):
        u = i / float(max(rows - 1, 1))
        row_eases[i] = ease_low * (1.0 - u) + ease * u
        for j, (an, d) in enumerate(zip(angles, ds)):
            f_ij = float(f_rim[j]) + (float(high) - float(f_rim[j])) * u
            e_ij = float(np.interp(f_ij, [low_eff, 0.15, high], [ease_low, ease, ease]))
            c_ij = a + (b - a) * f_ij
            h_hit = first_hit(c_ij, d)
            r_ij = min(max(0.045, (h_hit if h_hit is not None else 0.092) + e_ij), 0.22)
            Q[i, j] = c_ij + d * r_ij

    apex_c = a + (b - a) * float(high) + up * float(ease) + bk * float(peak)
    if rows >= 3:
        Q[-2] = apex_c * 0.38 + Q[-2] * 0.62
    Q[-1] = apex_c
    Q = smooth_push(Q, True, ease, iters=2, fix_bottom=True, rows_ease=row_eases)
    Q[-1] = apex_c
    return Part(gid, Q, True, ['body'] * rows, paint)


def brim(name, f, width, paint, ease=0.02, rows=5, n=40, droop=0.0, lift=0.0, scallop=0.0):
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * f
    Q = []
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    inner = []
    for an in angles:
        d = bk * math.cos(an) + left * math.sin(an)
        h = first_hit(c, d) or 0.095
        inner.append((d, h + ease))
    for k in range(rows):
        s = k / (rows - 1)
        Q.append([c + d * (r + s * width * (1 + scallop * math.cos(12 * an))) + up * (lift - droop) * s * s
                  for (d, r), an in zip(inner, angles)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint)


def tower_hat(name, height, profile, paint, f=0.64, ease=0.014, rows=12, n=36):
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * f
    c_ray = a + (b - a) * max(f, 0.58)
    height = max(height, (first_hit(c, up) or 0.0) + 0.015)
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angles]
    raw_rs = np.array([(first_hit(c_ray, d) or 0.095) + ease for d in ds])
    smooth_rs = np.array([np.mean([raw_rs[(i + dk) % n] for dk in (-2, -1, 0, 1, 2)]) for i in range(n)])
    base = list(zip(ds, smooth_rs))
    Q = []
    for k in range(rows):
        sk = k / (rows - 1)
        Q.append([c + up * height * sk + d * r * profile(sk) for d, r in base])
    top = c + up * height
    Q.append([top + (q - top) * 0.02 for q in Q[-1]])
    return Part(name, np.array(Q), True, ['body'] * (rows + 1), paint, rigid_joint='Head')


def conical_hat(name, paint, f_base=0.68, f_top=1.35, r_base=0.34, r_top=0.012, rows=10, n=36):
    """Conical hat / kasa with top-to-bottom row ordering (apex at v=0, outer brim rim at v=1)."""
    a, b, up, bk, left = head_frame()
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Q = []
    for i in range(rows):
        t = i / (rows - 1)
        f = f_top + (f_base - f_top) * t
        r = r_top + (r_base - r_top) * (t ** 0.92)
        c = a + (b - a) * f
        row = [c + (bk * math.cos(an) + left * math.sin(an)) * r for an in angs]
        Q.append(row)
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head')


def cone_hat(name, paint, r=0.28, h=0.14, f=0.68, rows=9, n=36):
    """MakeHuman-compatible alias for conical_hat."""
    return conical_hat(name, paint, f_base=f, f_top=f + h * 4.2, r_base=r, rows=rows, n=n)


def crown_band(name, paint, f0=0.58, f1=0.78, ease=0.016, flare=0.012, rows=6, n=36):
    """Circlet, headband, or diadem band conformed per-row around the skull (temples, brow, and occiput)."""
    a, b, up, bk, left = head_frame()
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angs]
    Q = []
    for i, f in enumerate(np.linspace(f1, f0, rows)):
        t = 1.0 - i / max(rows - 1, 1)
        c = a + (b - a) * f
        c_ray = a + (b - a) * min(max(float(f), 0.32), 0.92)
        rs = np.array([(first_hit(c_ray, d) or 0.096) for d in ds], dtype=np.float64)
        rs = 0.50 * rs + 0.25 * np.roll(rs, 1) + 0.25 * np.roll(rs, -1)
        e_cur = max(float(ease), 0.0025) + flare * t
        Q.append([c + d * (r + e_cur) for d, r in zip(ds, rs)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head')


def fan(name, r0, r1, spread, paint, rows=8, cols=15, tilt=0.22, back=0.05, curl=0.06, stiff=0.35, center=None, up_vec=None, side_vec=None, rigid_joint=None):
    """Radiating feather/halo fan standing behind the crown or around a custom center."""
    if center is not None and up_vec is not None and side_vec is not None:
        up2 = np.asarray(up_vec, float)
        up2 /= np.linalg.norm(up2)
        side = np.asarray(side_vec, float)
        side /= np.linalg.norm(side)
        bk = np.cross(side, up2)
        c = np.asarray(center, float)
    else:
        a, b = J('Head'), J('Head', 'tail')
        up = (b - a) / np.linalg.norm(b - a)
        bk = np.array([0, 1.0, 0]) - up * up[1]
        bk /= np.linalg.norm(bk)
        side = np.cross(up, bk)
        side /= np.linalg.norm(side)
        up2 = up * math.cos(tilt) + bk * math.sin(tilt)
        c = a + (b - a) * 0.62 + bk * back
    P_grid = []
    for i in range(rows):
        r = r0 + (r1 - r0) * (1.0 - i / (rows - 1))
        row = []
        for j in range(cols):
            an = -spread + 2 * spread * j / (cols - 1)
            row.append(c + side * math.sin(an) * r + up2 * math.cos(an) * r + bk * curl * (r - r0) ** 2 / max(1e-6, r1 - r0))
        P_grid.append(row)
    part = Part(name, np.array(P_grid), False, ['body'] * rows, paint, rigid_joint=rigid_joint)
    if rigid_joint is None:
        part.cloth = {'start': 0, 'stiff': stiff, 'layer': 2}
    return part


def crest(name, height, paint, rows=5, cols=15, sweep=0.06, a0=-1.1, a1=1.9, base_ease=0.012, thick=0.008, host_part=None):
    """Volumetric 3D sagittal helmet crest/comb welded flush into the underlying helmet bowl."""
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * 0.55
    host_bvh = None
    hv_rim = None
    if host_part is not None and getattr(host_part, 'P', None) is not None and host_part.P.ndim == 3:
        hp = host_part.P
        Rh, Ch = hp.shape[:2]
        cols_h = Ch + 1 if getattr(host_part, 'closed', False) else Ch
        htris = []
        hverts = hp.reshape(-1, 3)
        for i_r in range(Rh - 1):
            for j_c in range(cols_h - 1):
                j0, j1 = j_c % Ch, (j_c + 1) % Ch
                v00, v10 = i_r * Ch + j0, (i_r + 1) * Ch + j0
                v11, v01 = (i_r + 1) * Ch + j1, i_r * Ch + j1
                htris.append((v00, v10, v11))
                htris.append((v00, v11, v01))
        if htris:
            host_bvh = core.FastBVH(hverts, np.array(htris, dtype=np.int32))
            hv_rim = hverts[np.abs(hverts[:, 0] - c[0]) <= 0.025]
            if not len(hv_rim):
                hv_rim = hverts

    half_t = 0.5 * float(thick)
    n_arch = max(7, 2 * int(rows) - 1)
    Q = []
    base_r_cols = []
    dirs_cols = []
    for j in range(cols):
        phi = a0 + (a1 - a0) * j / max(cols - 1, 1)
        d = up * math.cos(phi) + bk * math.sin(phi)
        d /= max(float(np.linalg.norm(d)), 1e-9)
        r_root = (first_hit(c, d) or 0.100) + float(base_ease)
        if host_bvh is not None:
            t_in = host_bvh.ray_cast(c + d * 0.35, -d, maxd=0.33)
            if t_in is not None:
                r_root = (0.35 - float(t_in)) - 0.0020
            elif hv_rim is not None and len(hv_rim):
                rel = hv_rim - c[None, :]
                rel_L = np.linalg.norm(rel, axis=1)
                best_k = int(np.argmax((rel @ d) / np.maximum(rel_L, 1e-6)))
                L_rim = max(float(rel_L[best_k]), 1e-6)
                d = rel[best_k] / L_rim
                r_root = L_rim - 0.0020
        base_r_cols.append(r_root)
        dirs_cols.append(d)

    mid_i = n_arch // 2
    for i in range(n_arch):
        if i <= mid_i:
            u_side = 1.0
            v = i / max(float(mid_i), 1.0)
        else:
            u_side = -1.0
            v = (n_arch - 1 - i) / max(float(mid_i), 1.0)
        lat_off = u_side * half_t * ((1.0 - 0.82 * (v ** 1.4)) if i != mid_i else 0.0)
        row = []
        for j in range(cols):
            d = dirs_cols[j]
            r_root = float(base_r_cols[j])
            hh = height * (math.sin(math.pi * (j + 0.35) / (cols - 0.30)) ** 0.65)
            p_pt = c + d * (r_root + hh * v) + bk * (sweep * (v ** 1.3)) + left * lat_off
            row.append(p_pt)
        Q.append(row)
    return Part(name, np.array(Q), False, ['body'] * n_arch, paint, rigid_joint='Head')


def wing(name, side, span, height, paint, rows=6, cols=9, rise=0.04, curl=0.05, f=0.62):
    """Flat temple wing out from the side of the head (+1 left, -1 right)."""
    a, b, up, bk, left = head_frame()
    c = a + (b - a) * f
    h = first_hit(c, left * side) or 0.08
    root = c + left * side * (h + 0.02)
    Q = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            u = j / (cols - 1)
            out = left * side * span * u
            down = -up * height * (v - 0.25) * (1 + 0.4 * u)
            row.append(root + out + down + up * rise * u * u + bk * curl * u * u)
        Q.append(row)
    return Part(name, np.array(Q), False, ['body'] * rows, paint, rigid_joint='Head')


def horn(name, path, r0, r1, paint, n=12, rows=10, rigid_joint=None, role=None):
    """Tapering 3D tube along an arbitrary 3D path (horn, spike, plume rib, cable, or strap)."""
    pts = np.array(path, float)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)])
    x, _ = frame(pts[1] - pts[0])
    Q = []
    for k in range(rows):
        sd = cum[-1] * k / (rows - 1)
        i = min(len(seg) - 1, int(np.searchsorted(cum, sd, side='right') - 1))
        c = pts[i] + (pts[i + 1] - pts[i]) * (sd - cum[i]) / max(seg[i], 1e-9)
        t = (pts[i + 1] - pts[i]) / max(seg[i], 1e-9)
        x = x - t * x.dot(t)
        x /= max(np.linalg.norm(x), 1e-9)
        y = np.cross(t, x)
        r = r0 + (r1 - r0) * k / (rows - 1)
        Q.append([c + (x * math.cos(a) + y * math.sin(a)) * r for a in np.linspace(0, 2 * math.pi, n, endpoint=False)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint=rigid_joint, role=role)


def turban(gid, base_paint, wrap_paint=None, jewel_paint=None, size=1.0, ribbons=4, f0=0.52, f1=1.08, bulge=0.042, ease=0.018, rows=12, n=36):
    """Unified turban builder: returns single Part dome when wrap_paint is omitted, or multi-part wrapped dome with brooch when wrap_paint is given."""
    from .accoutrements import blob
    a, b, up, bk, left = head_frame()
    if wrap_paint is None:
        angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
        c_mid = a + (b - a) * 0.65
        ds = [bk * math.cos(an) + left * math.sin(an) for an in angs]
        rs = [(first_hit(c_mid, d) or 0.095) for d in ds]
        Q = []
        for i, f in enumerate(np.linspace(f1, f0, rows)):
            t = 1.0 - i / max(rows - 1, 1)
            c = a + (b - a) * min(f, 0.96) + up * max(0.0, f - 0.96) * 0.19
            swell = math.sin(min(1.0, t * 1.15) * math.pi) * bulge
            top_taper = (1.0 - max(0.0, (t - 0.78) / 0.22) ** 1.6 * 0.92)
            Q.append([c + d * ((r + ease + swell) * top_taper) for d, r in zip(ds, rs)])
        return Part(gid, np.array(Q), True, ['body'] * rows, base_paint, rigid_joint='Head')

    H = np.linalg.norm(b - a)
    angles = np.linspace(0, 2 * math.pi, 44, endpoint=False)
    hug = ring_points(a + (b - a) * 0.62, left, bk, angles, 0.016, rmin=0.04, rmax=0.2)
    c0 = a + (b - a) * 0.62
    r0 = float(np.mean(np.linalg.norm(hug - c0, axis=1)))
    R_max = r0 + 0.055 * size
    fa, fb_top = 0.62, 1.05 + 0.85 * size
    rows_t = 18

    def rad(f):
        t = (f - fa) / (fb_top - fa)
        if t < 0.3:
            return r0 + (R_max - r0) * (0.5 - 0.5 * math.cos(math.pi * t / 0.3))
        u = (t - 0.3) / 0.7
        return R_max * (1 - u ** 1.6) ** 0.55 * (1 - 0.25 * u) + 0.004

    def at(f, an, extra=0.0):
        c = a + up * H * f + bk * 0.012 * (f - fa)
        return c + (left * math.cos(an) * 1.0 + bk * math.sin(an) * 1.06) * (rad(f) + extra)

    fs = np.linspace(fa, fb_top, rows_t)
    P_grid = np.array([[at(f, an) for an in angles] for f in fs])
    P_grid[0] = hug
    P_grid[1] = hug + (P_grid[1] - hug) * 0.6
    P_grid[-1] = P_grid[-1].mean(0)
    P_grid = smooth_push(P_grid, True, 0.016, iters=2)
    parts = [Part(gid, P_grid, True, ['body'] * rows_t, base_paint)]
    for k in range(ribbons):
        ph, amp, fm = k * math.pi / ribbons * 2 + 0.4, 0.2 * size, fa + (fb_top - fa) * (0.3 + 0.08 * (k % 2))
        Q = []
        for w in (-0.04, 0.04):
            Q.append([at(fm + amp * math.sin(an + ph) + w * (1 + 0.3 * math.cos(an)), an, 0.008) for an in angles])
        parts.append(Part('%s_wrap%d' % (gid, k), np.array(Q), True, ['body'] * 2, wrap_paint))
    Q_brow = [hug + (hug - c0) / np.linalg.norm(hug - c0, axis=1)[:, None] * e + up * dz for e, dz in ((0.012, -0.012), (0.02, 0.03))]
    parts.append(Part(gid + '_brow', np.array(Q_brow), True, ['body'] * 2, wrap_paint))
    if jewel_paint is not None:
        fb_m = fa + (fb_top - fa) * 0.3
        front_pt = at(fb_m, -math.pi / 2, 0.02)
        parts.append(blob(gid + '_brooch', front_pt, (0.07 * size, 0.024, 0.08 * size), jewel_paint, out=-bk))
        tip = front_pt + up * 0.11 * size
        parts.append(horn(gid + '_crescentL', [front_pt + up * 0.03, front_pt + up * 0.06 + left * 0.035, tip + left * 0.03 - bk * 0.005], 0.011, 0.003, jewel_paint, n=8, rows=8))
        parts.append(horn(gid + '_crescentR', [front_pt + up * 0.03, front_pt + up * 0.06 - left * 0.035, tip - left * 0.03 - bk * 0.005], 0.011, 0.003, jewel_paint, n=8, rows=8))
    return parts
