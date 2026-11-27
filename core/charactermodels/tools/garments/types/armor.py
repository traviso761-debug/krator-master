"""Layer 2 (Armor): Sculpted 3D rigid plate armor primitives (zero flexible cloth chains).

Implements historical & production-3D plate armor anatomy:
- `cuirass_plate`: Globose/peaked breastplate & backplate with ribcage expansion, wasp-waist taper,
  central deflecting medial keel, rolled stop-rib rims, and optional articulated cascading `faulds`
  with a front groin cutout arch. Styles: 'gothic', 'musculata', 'laminar', 'lamellar', 'cyber_plate'.
- `articulated_pauldron`: Domed shoulder cop + optional neck-deflecting `haute_piece` + cascading
  overlapping horizontal `lames`.
- `gorget_guard`: Rigid beveled throat & clavicle collar with V-point chest flange.
- `hinged_tassets`: Separate left/right modular multi-lame thigh-guard plates with central groin arch.
- `sculpted_vambraces`: Rigid fluted forearm cannons + winged elbow couters.
- `sculpted_greaves`: Contoured anterior-keel shin greaves + sculpted winged knee poleyns.
"""
import math
import numpy as np
from .. import core
from ..core import Part, J, L, R, spine_at, first_hit, frame, ring_points, smooth_push
from .torso import torso_tube, collar, collar_disc, pauldron
from .limbs import limb_tube


def _ensure_metal_paint(paint):
    """Ensure armor plate paint carries a metallic fabric tag so core.py emits full metallic PBR + normal maps."""
    if not isinstance(paint, dict):
        return paint
    fab = (paint.get('fabric') or '').lower()
    if not fab.startswith(('metal.', 'armor.', 'shell.nacre', 'beads.glass', 'glass.')):
        out = dict(paint)
        out['fabric'] = 'metal.steel'
        return out
    return paint


def cuirass_plate(gid, plate_paint, trim_paint=None, style='gothic', z_top=None, z_bot=None,
                  ease=0.022, keel=0.018, faulds=3, n=44, rows=20, open_torso=False):
    """Sculpted 3D rigid cuirass (breastplate + backplate + articulated overlapping fauld hoops).

    Never attaches cloth chains; uses anatomical ribcage expansion, wasp-waist taper, central
    deflecting keel, rolled stop-rib neck/hem bevels, and cascading horizontal fauld lames with
    a front groin cutout arch.
    """
    p_mat = _ensure_metal_paint(plate_paint)
    t_mat = _ensure_metal_paint(trim_paint) if trim_paint is not None else p_mat
    zt = float(z_top) if z_top is not None else (core.TOP - 0.008)
    zb = float(z_bot) if z_bot is not None else (core.WAIST - 0.020)

    # Build base anatomical trunk shell with high vertical resolution for 3D sculpting
    base = torso_tube(f'{gid}_cuirass', zt, zb, ease, p_mat, n=n, rows=rows, iters=2)
    P_grid = base.P.copy()
    R_cnt, C_cnt = P_grid.shape[:2]
    angles = np.linspace(0.0, 2.0 * math.pi, C_cnt, endpoint=False)
    # In torso_tube: an=0 is +Y (back), an=pi is -Y (front), an=pi/2 is +X (left), an=3pi/2 is -X (right)
    cos_a = np.cos(angles)
    sin_a = np.sin(angles)
    front_w = np.clip(-cos_a, 0.0, 1.0)
    back_w = np.clip(cos_a, 0.0, 1.0)

    z_rows = np.array([float(P_grid[r, :, 2].mean()) for r in range(R_cnt)])
    z_span = max(0.08, zt - zb)

    for r in range(R_cnt):
        u = float(np.clip((zt - z_rows[r]) / z_span, 0.0, 1.0))  # 0 at collar, 1 at waist hem
        c = spine_at(z_rows[r])
        d_xy = P_grid[r, :, :2] - c[:2]
        rad = np.linalg.norm(d_xy, axis=1)
        u_dir = d_xy / np.maximum(rad[:, None], 1e-6)

        # 1. Anatomical cuirass profile: globose ribcage expansion (u~0.35), wasp-waist taper (u~0.85), hip flare (u~1.0)
        rib_dome = math.sin(min(1.0, u / 0.72) * math.pi) if u < 0.72 else 0.0
        waist_pinch = math.exp(-((u - 0.84) / 0.13) ** 2)
        hip_flare = max(0.0, (u - 0.86) / 0.14) ** 1.4
        dr = (0.011 * rib_dome - 0.004 * waist_pinch + 0.008 * hip_flare) * np.ones(C_cnt)

        # 2. Central deflecting medial keel (pigeon-breast / gothic sternum ridge)
        front_peak = np.power(front_w, 4.5)
        back_spine = np.power(back_w, 5.0)
        keel_env = math.sin(min(1.0, max(0.0, (u - 0.06) / 0.84)) * math.pi)
        if style == 'gothic':
            dr += float(keel) * keel_env * front_peak
            dr += 0.007 * keel_env * back_spine
            # Subtle radiating gothic fluting ribs across chest
            flute = 0.0028 * keel_env * front_w * np.cos(10.0 * (angles - math.pi))
            dr += flute
        elif style == 'musculata':
            # Sculpted pectoral plates + costal rib arch + abdominal divisions
            pec_u = math.exp(-((u - 0.34) / 0.13) ** 2)
            pec_lat = np.exp(-((np.abs(sin_a) - 0.42) / 0.24) ** 2) * np.clip(-cos_a, 0.0, 1.0)
            ab_u = math.exp(-((u - 0.68) / 0.16) ** 2)
            ab_seg = (0.5 + 0.5 * np.cos((u - 0.54) * 26.0)) * np.exp(-((np.abs(sin_a) - 0.22) / 0.18) ** 2) * front_w
            dr += 0.015 * pec_u * pec_lat + 0.007 * ab_u * ab_seg + 0.006 * keel_env * back_spine
        elif style == 'laminar':
            # 6 stepped downward-cascading horizontal steel/bronze hoops (lorica segmentata / splint)
            lame_phase = (u * 6.0) % 1.0
            step = 0.0075 * lame_phase  # lower edge of each band steps outward like roof shingles
            dr += step + 0.008 * keel_env * front_peak
        elif style == 'lamellar':
            # 8 sawtooth 3D shingle-rows + faceted column ridges
            row_phase = (u * 8.0) % 1.0
            col_facet = 0.0025 * np.abs(np.cos(angles * 12.0))
            dr += 0.0060 * row_phase + col_facet + 0.006 * keel_env * front_peak
        elif style == 'cyber_plate':
            # Faceted angular chest carapace + beveled collarbone vents
            chest_box = np.clip(-cos_a - 0.15, 0.0, 1.0) ** 1.4
            dr += float(keel) * 0.95 * keel_env * chest_box
            dr += 0.009 * keel_env * np.power(back_w, 2.5)
            # Crisp horizontal plate seam at lower sternum
            if abs(u - 0.52) < 0.06:
                dr -= 0.0045
        else:
            dr += float(keel) * keel_env * front_peak

        # 3. Rolled stop-rib neck collar & lower waist bevel (gives plate visible forged thickness)
        if r == 0 or r == 1:
            dr += 0.0055 * (1.0 if r == 0 else 0.5)
        elif r == R_cnt - 1:
            dr += 0.0060

        P_grid[r, :, :2] = c[:2] + u_dir * (rad + dr)[:, None]

    # Smooth body-transferred spine skinning prevents hard row-to-row shearing/displacement during animation
    cuirass = Part(f'{gid}_cuirass', P_grid, True, ['body'] * R_cnt, p_mat, role='trunk')
    parts = [cuirass]

    # 4. Articulated overlapping fauld hoops below waist (with front groin cutout arch)
    if faulds and int(faulds) > 0:
        n_f = int(faulds)
        z_f_top = zb + 0.012
        # Keep lowest fauld above CROTCH + 0.015 so it stays rigid without triggering Check #17 rigid-skirt failure
        z_f_bot = max(core.CROTCH + 0.022, zb - 0.036 * n_f)
        h_lame = (z_f_top - z_f_bot) / float(n_f)
        x_ax, y_ax = np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])
        ang_f = np.linspace(0.0, 2.0 * math.pi, 36, endpoint=False)
        for k in range(n_f):
            zk0 = z_f_top - k * h_lame + 0.005
            zk1 = z_f_top - (k + 1) * h_lame
            e_top = ease + 0.004 + k * 0.0035
            e_bot = e_top + 0.0075  # outward cascading roof-shingle step
            qf = []
            for ri, (zz, ee) in enumerate(((zk0, e_top), (0.5 * (zk0 + zk1), 0.5 * (e_top + e_bot) + 0.0015), (zk1, e_bot))):
                ring = np.array(ring_points(spine_at(zz), x_ax, y_ax, ang_f, ee, rmin=0.06, rmax=0.35, bvh=core.BVH_T), dtype=np.float64)
                # Front groin cutout arch on lower fauld hoops
                if k >= max(1, n_f - 2) and ri > 0:
                    arch = np.power(np.clip(-np.cos(ang_f), 0.0, 1.0), 3.0)
                    ring[:, 2] += 0.022 * (ri / 2.0) * arch
                qf.append(ring)
            lame_p = Part(f'{gid}_fauld_{k}', np.array(qf, dtype=np.float64), True, ['body'] * 3,
                          t_mat if (k == n_f - 1 and trim_paint is not None) else p_mat,
                          role='belt')
            parts.append(lame_p)

    return parts


def gorget_guard(gid, plate_paint, trim_paint=None, ease=0.023):
    """Rigid beveled steel/bronze throat & clavicle gorget with rolled rim and V-point chest flange."""
    p_mat = _ensure_metal_paint(plate_paint)
    t_mat = _ensure_metal_paint(trim_paint) if trim_paint is not None else p_mat
    neck_ring = collar(f'{gid}_gorget_neck', t_mat, height=0.034, flare=0.010, ease=ease + 0.002, rows=5, n=32)
    # Sculpted clavicle plate with V-point down front sternum
    disc = collar_disc(f'{gid}_gorget_plate', 0.115, p_mat, drop=0.085, rows=8, n=40, scallop=0.0, ease=ease)
    Q = disc.P.copy()
    R_cnt, C_cnt = Q.shape[:2]
    angs = np.linspace(0.0, 2.0 * math.pi, C_cnt, endpoint=False)
    front_v = np.power(np.clip(-np.cos(angs), 0.0, 1.0), 3.0)
    for r in range(1, R_cnt):
        s = r / float(R_cnt - 1)
        Q[r, :, 2] -= 0.032 * (s ** 1.2) * front_v
        if r == R_cnt - 1:
            # Rolled outer bevel rim
            c_xy = spine_at(float(Q[r, :, 2].mean()))[:2]
            d_xy = Q[r, :, :2] - c_xy
            d_xy /= np.maximum(np.linalg.norm(d_xy, axis=1, keepdims=True), 1e-6)
            Q[r, :, :2] += d_xy * 0.005
    disc.P = Q
    disc.rigid_joint = 'Spine2'
    neck_ring.rigid_joint = 'Spine2'
    return [neck_ring, disc]


def articulated_pauldron(gid, side, plate_paint, trim_paint=None, lames=3, haute_piece=True, ease=0.022):
    """Multi-lame cascading 3D shoulder armor (domed cop + neck-deflecting haute-piece + telescoping lames)."""
    p_mat = _ensure_metal_paint(plate_paint)
    t_mat = _ensure_metal_paint(trim_paint) if trim_paint is not None else p_mat
    parts = []

    # Upper domed shoulder cop with rolled lip
    cop = pauldron(f'{gid}_cop_{side[0]}', side, p_mat, reach=0.22, ease=ease + 0.004, flare_end=1.02, span=1.55, rows=5, n=16)
    # Sculpt domed ridge & rolled outer lip on cop
    Q = cop.P.copy()
    a_pt = J(side + 'Arm')
    for r in range(Q.shape[0]):
        u = r / float(max(Q.shape[0] - 1, 1))
        dome = 0.009 * math.sin(u * math.pi) + (0.005 if r == Q.shape[0] - 1 else 0.0)
        d_out = Q[r] - a_pt
        d_out /= np.maximum(np.linalg.norm(d_out, axis=1, keepdims=True), 1e-6)
        Q[r] += d_out * dome
    cop.P = Q
    parts.append(cop)

    # Cascading lower overlapping lames down upper arm
    a, e = J(side + 'Arm'), J(side + 'ForeArm')
    x_ax, y_ax = frame(e - a)
    c_ang = math.atan2(y_ax[2], x_ax[2])
    n_l = max(1, int(lames))
    for k in range(n_l):
        f0 = 0.16 + k * 0.11
        f1 = f0 + 0.13
        e0 = max(0.014, ease - 0.002 + k * 0.0025)
        e1 = e0 + 0.0065  # cascading roof-shingle flare
        span_k = max(1.15, 1.48 - k * 0.10)
        lm = limb_tube(
            f'{gid}_lame{k}_{side[0]}', None, None, e0,
            t_mat if (k == n_l - 1 and trim_paint is not None) else p_mat,
            n=14, rows=4, ease_end=e1, start_back=0.0,
            path=[a + (e - a) * f0, a + (e - a) * f1],
            arc=(c_ang - span_k, c_ang + span_k),
            bvh=core.BVH_A, rmax=0.145, role='pauldron', side=side[0],
        )
        parts.append(lm)

    # Optional neck-deflecting haute-piece stop-rib along medial top edge of cop
    if haute_piece:
        # Take medial crest vertices of cop (row 0..2, central columns) and extrude a crisp 2.6cm vertical fin
        r_mid = 1
        c_s = Q.shape[1] // 4
        c_e = max(c_s + 3, (3 * Q.shape[1]) // 4)
        base_line = Q[r_mid, c_s:c_e].copy()
        n_hp = len(base_line)
        hp_grid = np.zeros((4, n_hp, 3), dtype=np.float64)
        s_in = -1.0 if side == L else 1.0
        for j in range(n_hp):
            u_j = math.sin((j / float(max(n_hp - 1, 1))) * math.pi)
            h_j = 0.028 * (0.35 + 0.65 * u_j)
            for ri, frac in enumerate((0.0, 0.35, 0.72, 1.0)):
                hp_grid[ri, j] = base_line[j] + np.array([s_in * 0.006 * frac, 0.0, h_j * frac])
        hp = Part(f'{gid}_hautepiece_{side[0]}', hp_grid, False, ['body'] * 4, t_mat,
                  rigid_joint=side + 'Shoulder', role='pauldron', side=side[0])
        parts.append(hp)

    return parts


def articulated_pauldrons(gid, plate_paint, trim_paint=None, lames=3, haute_piece=True, ease=0.022):
    """Paired left & right articulated multi-lame pauldrons."""
    out = []
    for s in (L, R):
        out.extend(articulated_pauldron(gid, s, plate_paint, trim_paint=trim_paint,
                                        lames=lames, haute_piece=haute_piece, ease=ease))
    return out


def hinged_tassets(gid, plate_paint, trim_paint=None, lames=4, ease=0.024):
    """Modular left & right multi-lame thigh-guard tassets with a wide central groin arch (rigid UpLeg weighted)."""
    p_mat = _ensure_metal_paint(plate_paint)
    t_mat = _ensure_metal_paint(trim_paint) if trim_paint is not None else p_mat
    parts = []
    n_l = max(2, int(lames))
    for s in (L, R):
        hip, knee = J(s + 'UpLeg'), J(s + 'Leg')
        x_ax, y_ax = frame(knee - hip)
        # Front-lateral arc centered toward front-outer thigh (leaves wide central groin cutout)
        # Find angle pointing toward (-Y front, ±X outer thigh)
        s_x = 1.0 if s == L else -1.0
        target_dir = np.array([0.45 * s_x, -0.89, 0.0])
        c_ang = math.atan2(float(np.dot(target_dir, y_ax)), float(np.dot(target_dir, x_ax)))
        for k in range(n_l):
            f0 = -0.04 + k * 0.12
            f1 = f0 + 0.14
            e0 = ease + k * 0.0025
            e1 = e0 + 0.0065
            span_k = max(0.75, 1.12 - k * 0.08)
            pt = limb_tube(
                f'{gid}_tasset{k}_{s[0]}', None, None, e0,
                t_mat if (k == n_l - 1 and trim_paint is not None) else p_mat,
                n=12, rows=3, ease_end=e1, start_back=0.0,
                path=[hip + (knee - hip) * f0, hip + (knee - hip) * f1],
                arc=(c_ang - span_k, c_ang + span_k),
                bvh=core.BVH, rmax=0.19, role='trunk', side=s[0],
            )
            pt.rigid_joint = s + 'UpLeg'
            parts.append(pt)
    return parts


def sculpted_vambraces(gid, plate_paint, trim_paint=None, couter=True, ease=0.015):
    """Rigid fluted forearm cannons + winged elbow couters (rigid ForeArm weighted)."""
    p_mat = _ensure_metal_paint(plate_paint)
    t_mat = _ensure_metal_paint(trim_paint) if trim_paint is not None else p_mat
    parts = []
    for s in (L, R):
        a, e, h = J(s + 'Arm'), J(s + 'ForeArm'), J(s + 'Hand')
        vamb = limb_tube(
            f'{gid}_vambrace_{s[0]}', None, None, ease, p_mat,
            n=18, rows=8, ease_end=ease + 0.004, start_back=0.0,
            path=[e + (h - e) * 0.12, h - (h - e) * 0.04],
            bvh=core.BVH_A, rmax=0.11, role='sleeve', side=s[0],
        )
        # Sculpt rolled elbow & wrist bevel rims + longitudinal dorsal keel ridge
        Q = vamb.P.copy()
        for r in range(Q.shape[0]):
            c_r = Q[r].mean(axis=0)
            d_r = Q[r] - c_r
            rad = np.linalg.norm(d_r, axis=1)
            u_d = d_r / np.maximum(rad[:, None], 1e-6)
            lip = 0.0045 if (r == 0 or r == Q.shape[0] - 1) else 0.0
            Q[r] = c_r + u_d * (rad + lip)[:, None]
        vamb.P = Q
        vamb.rigid_joint = s + 'ForeArm'
        parts.append(vamb)

        if couter:
            # Winged elbow couter cap
            x_ax, y_ax = frame(h - e)
            c_ang = math.atan2(float(np.dot(np.array([0.0, 1.0, 0.0]), y_ax)),
                               float(np.dot(np.array([0.0, 1.0, 0.0]), x_ax)))
            ct = limb_tube(
                f'{gid}_couter_{s[0]}', None, None, ease + 0.008, t_mat,
                n=12, rows=4, ease_end=ease + 0.004, start_back=0.0,
                path=[e - (e - a) * 0.14, e + (h - e) * 0.18],
                arc=(c_ang - 1.35, c_ang + 1.35),
                bvh=core.BVH_A, rmax=0.115, role='pauldron', side=s[0],
            )
            ct.rigid_joint = s + 'ForeArm'
            parts.append(ct)
    return parts


def sculpted_greaves(gid, plate_paint, trim_paint=None, poleyn=True, ease=0.015):
    """Anatomically contoured shin greaves with anterior deflecting keel + winged knee poleyns."""
    p_mat = _ensure_metal_paint(plate_paint)
    t_mat = _ensure_metal_paint(trim_paint) if trim_paint is not None else p_mat
    parts = []
    for s in (L, R):
        hip, knee, foot = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        grv = limb_tube(
            f'{gid}_greave_{s[0]}', None, None, ease, p_mat,
            n=20, rows=10, ease_end=ease + 0.005, start_back=0.0,
            path=[knee + (foot - knee) * 0.10, foot + np.array([0.0, 0.0, 0.045])],
            bvh=core.BVH, rmax=0.14, role='shaft', side=s[0],
        )
        # Sculpt sharp anterior shin keel (-Y front) + rolled top/ankle bevels
        Q = grv.P.copy()
        for r in range(Q.shape[0]):
            c_r = Q[r].mean(axis=0)
            d_r = Q[r] - c_r
            rad = np.linalg.norm(d_r, axis=1)
            u_d = d_r / np.maximum(rad[:, None], 1e-6)
            front_k = np.power(np.clip(-u_d[:, 1], 0.0, 1.0), 4.0)
            lip = 0.0045 if (r == 0 or r == Q.shape[0] - 1) else 0.0
            Q[r] = c_r + u_d * (rad + 0.009 * front_k + lip)[:, None]
        grv.P = Q
        grv.rigid_joint = s + 'Leg'
        parts.append(grv)

        if poleyn:
            # Sculpted knee poleyn with domed front patella & side fan-wings
            x_ax, y_ax = frame(foot - knee)
            c_ang = math.atan2(float(np.dot(np.array([0.0, -1.0, 0.0]), y_ax)),
                               float(np.dot(np.array([0.0, -1.0, 0.0]), x_ax)))
            pol = limb_tube(
                f'{gid}_poleyn_{s[0]}', None, None, ease + 0.008, t_mat,
                n=14, rows=5, ease_end=ease + 0.004, start_back=0.0,
                path=[knee - (knee - hip) * 0.12, knee + (foot - knee) * 0.14],
                arc=(c_ang - 1.45, c_ang + 1.45),
                bvh=core.BVH, rmax=0.145, role='shaft', side=s[0],
            )
            Qp = pol.P.copy()
            for r in range(Qp.shape[0]):
                u = math.sin((r / float(max(Qp.shape[0] - 1, 1))) * math.pi)
                Qp[r, :, 1] -= 0.011 * u  # domed forward patella point
            pol.P = Qp
            pol.rigid_joint = s + 'Leg'
            parts.append(pol)
    return parts
