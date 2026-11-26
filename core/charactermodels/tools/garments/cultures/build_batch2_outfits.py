"""Build Batch 2 outfits (22 full outfits across Voth, Beast Riders, Izani, Free Clans, Eternal State, Iron Republic, Yuni, and Yusar)."""
import concurrent.futures
import math
import os
import sys
import time
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[3]          # core/charactermodels (this file: tools/garments/cultures/)
sys.path.insert(0, str(ROOT / 'tools'))
import garments as bio
from garments import (
    C, P, B, PN, Part, head_frame, hood, blob, horn, register_entries, set_body, J
)


def assemble_garment(gid, label, slot, culture, parts, **kw):
    flat_parts = []
    for p in parts:
        if isinstance(p, (list, tuple)):
            flat_parts.extend(p)
        elif p is not None:
            flat_parts.append(p)
    return bio.assemble_garment(gid, label, slot, culture, flat_parts, **kw)


def torso_tube(name, z_bot, z_top, paint, ease=0.024, flare=0.0, rows=20, n=36, yoke=False, **kw):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    hang_from = min(z0 - 0.03, bio.WAIST - 0.02) if (flare > 0 or z1 < bio.CROTCH) else None
    grp_below = (bio.CROTCH + 0.02) if z1 < bio.CROTCH else None
    hull_from = min(z0, bio.WAIST) if z1 < bio.WAIST else None
    jagged = kw.get('jagged', kw.get('Jagged', 0.0))
    pts = (jagged, 2.0) if jagged else None
    main_part = bio.torso_tube(name, z0, z1, ease, paint, n=n, rows=rows,
                               hang_from=hang_from, flare=flare,
                               group_below=grp_below, hull_from=hull_from, points=pts)
    if yoke and z0 >= bio.NECK[2] - 0.015:
        yoke_part = bio.collar_disc(f'{name}_yoke', 0.085, P('gold', 0.02, fabric='metal.gold'), drop=0.032, rows=4, n=36,
                                    scallop=0.0, ease=ease + 0.004, z_off=0.004)
        return [main_part, yoke_part]
    return main_part


def sleeve(name, side, paint, f0=0.0, f1=0.92, ease=0.020, flare=0.008, rows=12, n=22):
    return bio.sleeve(name, side, paint, f0=f0, f1=f1, ease=ease, flare=flare, rows=rows, n=n)


def trousers(gid, paint, ankle_f=0.78, ease=0.022, bag=0.025, rows=16, n=26):
    out = [
        bio.torso_tube(f'{gid}_pelvis', bio.WAIST + 0.01, bio.CROTCH + 0.02, ease, paint,
                       n=36, rows=6, hull_from=bio.WAIST)
    ]
    for s in ('Left', 'Right'):
        hip, knee, foot = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        ank = knee + (foot - knee) * ankle_f
        pt = bio.limb_tube(f'{gid}_{s}', None, None, ease, paint, n=n, rows=rows,
                           ease_end=max(0.014, ease * 0.75), start_back=0.03,
                           path=[hip, knee, ank], rmax=0.19)
        if bag > 0:
            for k in range(rows):
                u = k / max(rows - 1, 1)
                b_add = bag * (math.sin(math.pi * u) ** 1.2)
                c = pt.P[k].mean(axis=0)
                vecs = pt.P[k] - c
                vecs[:, 2] = 0.0
                norms = np.linalg.norm(vecs, axis=1, keepdims=True)
                dirs = vecs / np.maximum(norms, 1e-6)
                pt.P[k] = pt.P[k] + dirs * b_add
        out.append(pt)
    return out


def skirt(name, z_bot, z_top, paint, ease=0.028, flare=0.08, rows=12, n=36, jagged=0.0):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    pts = (jagged, 2.0) if jagged else None
    return bio.torso_tube(name, z0, z1, ease, paint, n=n, rows=rows,
                          hang_from=z0 - 0.01, flare=flare,
                          group_below=bio.CROTCH + 0.02, hull_from=z0, points=pts)


def boot(name, side, paint, top_f=0.12, ease=0.018, rows=15, n=24, cuff=0.014):
    shaft_frac = max(0.32, min(0.95, 1.0 - top_f)) if top_f < 0.26 else float(top_f)
    return bio.boot(name, side, paint, top_f=shaft_frac, ease=ease)


def collar(name, paint, h=0.08, flare=0.03, open_front=0.0, rows=7, n=30):
    return bio.collar(name, paint, height=h, flare=flare, open_front=open_front, rows=rows, n=n)


def turban(name, f0, f1, ease, paint, **kw):
    return bio.head_rings(name, f0, f1, ease, paint, n=36, rows=10, apex=True, scale=(1.08, 1.10))


def conical_hat(name, f_base, f_top, radius, paint, curve=0.9):
    a, b, up, bk, left = head_frame()
    rows = 11
    n = 40
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Q = []
    # Iterate from apex (f_top, v=0.0) down to brim (f_base, v=1.0) so B('top') is apex and B('bottom') is brim!
    for k in range(rows):
        s = 1.0 - (k / (rows - 1))
        f = f_base + (f_top - f_base) * s
        c = a + (b - a) * f
        r = max(0.008, radius * ((1.0 - s) ** curve))
        Q.append([c + (bk * math.cos(an) + left * math.sin(an)) * r for an in angs])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head')


def crown_band(name, f0, f1, paint, bulge=0.01, ease=0.018, rows=5, n=30):
    return bio.head_rings(name, f0, f1, max(0.005, ease + bulge), paint, n=n, rows=rows, apex=False)


def sculpted_faceplate(name, paint, f_top=0.80, f_bot=-0.06, ease=0.012, rows=16, n=34, jaw_narrow=0.38):
    """Contoured 3D anatomical face-mask spanning only the front facial plane (an in 0.54*pi .. 1.46*pi)
    with top-to-bottom row ordering (Row 0 = forehead f_top, Row rows-1 = chin f_bot),
    sculpted 3D brow ridge, recessed eye sockets, projecting nasal bridge, cheekbones, and tapered chin."""
    a, b, up, bk, left = head_frame()
    fs = np.linspace(f_top, f_bot, rows)
    angs = np.linspace(0.54 * math.pi, 1.46 * math.pi, n)
    Q = []
    for k, f in enumerate(fs):
        vf = k / max(rows - 1, 1)  # 0.0 at forehead crown, 1.0 at chin tip
        c = a + (b - a) * f
        # Forehead oval crown taper & anatomical jaw/chin taper
        top_taper = 1.0 - 0.22 * (max(0.0, (0.20 - vf) / 0.20) ** 1.6)
        jaw_taper = 1.0 - jaw_narrow * (max(0.0, (vf - 0.48) / 0.52) ** 1.45)
        rx = (0.104 + ease * 0.6) * top_taper * jaw_taper
        ry = (0.136 + ease) * (1.0 - 0.14 * max(0.0, (vf - 0.56) / 0.44))
        row_pts = []
        for an in angs:
            sx = math.sin(an)        # + on Left cheek, 0 at nose center, - on Right cheek
            cy = math.cos(an)        # -1 at front nose center, ~0 at temples
            frontness = max(0.0, -cy)
            # 3D anatomical relief on the front face
            brow = 0.011 * math.exp(-(((vf - 0.29) / 0.09) ** 2)) * math.exp(-((sx / 0.58) ** 2)) * (frontness ** 1.5)
            eye_rec = -0.008 * math.exp(-(((abs(sx) - 0.26) / 0.12) ** 2)) * math.exp(-(((vf - 0.39) / 0.07) ** 2)) * frontness
            nose = 0.018 * math.exp(-((sx / 0.12) ** 2)) * math.exp(-(((vf - 0.49) / 0.18) ** 2)) * (0.65 + 0.55 * max(0.0, (vf - 0.30) / 0.28)) * (frontness ** 2)
            cheek = 0.009 * math.exp(-(((abs(sx) - 0.40) / 0.18) ** 2)) * math.exp(-(((vf - 0.48) / 0.14) ** 2)) * frontness
            cheek_hollow = -0.005 * math.exp(-(((abs(sx) - 0.34) / 0.16) ** 2)) * math.exp(-(((vf - 0.66) / 0.12) ** 2)) * frontness
            chin_boss = 0.007 * math.exp(-((sx / 0.18) ** 2)) * math.exp(-(((vf - 0.88) / 0.10) ** 2)) * (frontness ** 2)
            fwd_shift = 0.010 + ease + brow + eye_rec + nose + cheek + cheek_hollow + chin_boss
            row_pts.append(c + left * (sx * rx) + bk * (cy * ry - fwd_shift))
        Q.append(row_pts)
    return Part(name, np.array(Q), False, ['body'] * rows, paint, rigid_joint='Head')


def sculpted_cranium(name, paint, f_top=1.05, f_bot=-0.06, ease=0.008, rows=14, n=36):
    """Contoured 3D cranial casque & under-coif with top-to-bottom row ordering (Row 0 = crown, Row rows-1 = nape/jaw)
    that sits cleanly behind a sculpted_faceplate to form a complete 360-degree helmet without soup-can distortion."""
    a, b, up, bk, left = head_frame()
    fs = np.linspace(f_top, f_bot, rows)
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Q = []
    for k, f in enumerate(fs):
        c = a + (b - a) * f
        dome_s = 1.0 if f <= 0.74 else max(0.05, math.cos(math.pi * 0.5 * min(1.0, (f - 0.74) / max(0.08, f_top - 0.74))) ** 0.82)
        neck_taper = 1.0 - 0.16 * max(0.0, (0.28 - f) / 0.38)
        rx = (0.104 + ease) * dome_s * neck_taper
        ry = (0.136 + ease) * dome_s * neck_taper
        Q.append([c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - 0.006 * dome_s) for an in angs])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head')


def cape(name, z_bot, z_top, paint, arc=1.18, ease=0.056, flare=0.16, rows=20, n=32):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    e_top = max(ease, 0.054)
    e_bot = e_top + 0.028
    return bio.torso_tube(name, z0, z1, e_top, paint, n=n, rows=rows,
                          arc=(-arc, arc), hang_from=min(z0 - 0.04, bio.CHEST - 0.02),
                          ease_bottom=e_bot, flare=flare, group_below=bio.CROTCH + 0.02,
                          over_arms=True, layer=2)


def tabard(name, z_bot, z_top, width, paint, front=True, back=False, ease=0.038, flare=0.02, center_ang=None):
    """Build narrow open woven/armored tabard or stole panels (Row 0 = z_top, Row rows-1 = z_bot)
    that contour to the trunk above the waist and hang cleanly in front of (or behind) the pelvis/legs
    without wrapping 360 degrees or collapsing into the gap between the legs."""
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    rows = 16
    n = 15
    zs = np.linspace(z0, z1, rows)
    half_ang = min(0.58, max(0.16, (width * 0.5) / 0.145))
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    hang_z = min(z0, bio.WAIST)
    z_anchor = max(hang_z, bio.CROTCH + 0.05)
    c_anchor = bio.spine_at(z_anchor)

    def _make_panel(panel_name, c_ang):
        angs = np.linspace(c_ang - half_ang, c_ang + half_ang, n)
        anchor_ring = np.array(bio.ring_points(c_anchor, x, y, angs, ease, rmin=0.10, rmax=0.28, bvh=bio.BVH))
        anchor_xy = anchor_ring[:, :2] - c_anchor[:2]
        anchor_r = np.linalg.norm(anchor_xy, axis=1, keepdims=True)
        anchor_dir = anchor_xy / np.maximum(anchor_r, 1e-6)
        P_rows = []
        for z in zs:
            cz = bio.spine_at(z)
            if z >= bio.CROTCH + 0.04:
                ring = np.array(bio.ring_points(cz, x, y, angs, ease, rmin=0.10, rmax=0.28, bvh=bio.BVH))
                if z < hang_z:
                    drop = hang_z - z
                    xy = ring[:, :2] - cz[:2]
                    r_cur = np.linalg.norm(xy, axis=1, keepdims=True)
                    r_want = np.maximum(r_cur, anchor_r + flare * drop)
                    ring[:, :2] = cz[:2] + anchor_dir * r_want
                P_rows.append(ring)
            else:
                drop = max(0.0, hang_z - z)
                leg_ring = np.array(bio.ring_points(cz, x, y, angs, ease + 0.028, rmin=0.10, rmax=0.34, bvh=bio.BVH))
                leg_r = np.linalg.norm(leg_ring[:, :2] - cz[:2], axis=1, keepdims=True)
                r_want = np.maximum(leg_r, anchor_r + ease * 0.45 + max(flare, 0.06) * drop)
                xy = cz[:2] + anchor_dir * r_want
                row_pts = np.column_stack([xy, np.full(n, z)])
                P_rows.append(row_pts)
        grp = ['helper-skirt' if z < bio.CROTCH + 0.02 else 'body' for z in zs]
        pt = Part(panel_name, np.array(P_rows), False, grp, paint)
        pt.layer = 2
        start_row = next((i for i, z in enumerate(zs) if z < hang_z + 0.01), rows // 2)
        if start_row < rows - 2:
            pt.cloth = {'start': start_row, 'stiff': 0.16, 'layer': 2}
        return pt

    out = []
    if center_ang is not None:
        out.append(_make_panel(name, center_ang))
    else:
        if front:
            out.append(_make_panel(f'{name}_front', math.pi))
        if back:
            out.append(_make_panel(f'{name}_back', 0.0))
    return out


def belt_sash(name, z_bot, z_top, paint, ease=0.038):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    return bio.torso_tube(name, z0, z1, ease, paint, n=40, rows=6, hull_from=z0)


def crossed_sash(name, paint, width=0.06, ease=0.032):
    return bio.band(name, bio.WAIST, bio.SHOULDER + 0.02, width, ease, paint, high=math.pi * 0.45, rows=5)


def pauldron(name, side, paint, span=0.20, drop=0.16, lift=0.022):
    return bio.pauldron(name, side, paint,
                        reach=min(0.65, max(0.25, drop * 2.6)),
                        ease=0.026 + lift * 0.5,
                        flare_end=1.06,
                        span=max(1.35, min(1.95, span * 7.5)),
                        rows=7, n=16)


def neck_ring(name, paint, r_tube=0.035, drop=0.02, n=32, nr=10):
    c = bio.spine_at(bio.TOP - drop)
    R_maj = 0.125 + r_tube * 0.85
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    phis = np.linspace(0, 2 * math.pi, nr, endpoint=False)
    Q = []
    for ph in phis:
        r_cur = R_maj + r_tube * math.cos(ph)
        z_cur = c[2] + r_tube * math.sin(ph) * 0.75 - drop * 0.3
        row = [np.array([c[0] + math.sin(an) * r_cur, c[1] + math.cos(an) * r_cur, z_cur]) for an in angs]
        Q.append(row)
    return Part(name, np.array(Q), True, ['body'] * nr, paint, rigid_joint='Spine2')


def tube(name, path, r, paint, n=8, rigid_joint=None):
    return bio.horn(name, path, r, r, paint, n=n, rows=max(5, len(path) * 2), rigid_joint=rigid_joint)


def strap(name, path, width, paint, rigid_joint=None):
    return bio.horn(name, path, width * 0.5, width * 0.5, paint, n=8, rows=max(5, len(path) * 2), rigid_joint=rigid_joint)


def tassel(name, top_pos, length, radius, paint, rigid_joint=None):
    bot_pos = np.asarray(top_pos, float) - np.array([0.0, 0.0, length])
    return bio.horn(name, [top_pos, bot_pos], radius * 0.85, radius * 1.15, paint, n=8, rows=6, rigid_joint=rigid_joint)


def glove(name, side, hand_paint, cuff_paint=None, finger_paint=None, f0=0.62, ease=0.014):
    """Build a fitted gauntlet/glove for `side` ('Left' or 'Right') with a flared forearm/wrist cuff,
    contoured metacarpal palm/dorsal shell, and 5 articulated finger sheaths with per-row phalanx bone bindings."""
    out = []
    out.append(sleeve(f'{name}_cuff_{side}', side, cuff_paint or hand_paint, f0=f0, f1=0.98, ease=ease, flare=0.008, rows=8, n=20))
    # Contoured metacarpal palm/back-of-hand shell from wrist (Hand) to knuckles (Middle1)
    w_pt = J(side + 'Hand')
    idx1 = J(side + 'HandIndex1')
    mid1 = J(side + 'HandMiddle1')
    rng1 = J(side + 'HandRing1')
    pnk1 = J(side + 'HandPinky1')
    knuckle_ctr = 0.25 * (idx1 + mid1 + rng1 + pnk1)
    d_hand = knuckle_ctr - w_pt
    u_ax = d_hand / max(np.linalg.norm(d_hand), 1e-6)
    span_vec = idx1 - pnk1
    x_ax = span_vec - u_ax * np.dot(span_vec, u_ax)
    x_ax = x_ax / max(np.linalg.norm(x_ax), 1e-6)
    y_ax = np.cross(u_ax, x_ax)
    if np.linalg.norm(y_ax) > 1e-6:
        y_ax = y_ax / np.linalg.norm(y_ax)
    angs_p = np.linspace(0, 2 * math.pi, 20, endpoint=False)
    palm_rows = []
    for s in np.linspace(0.0, 0.96, 6):
        c = w_pt + d_hand * s
        rx = 0.040 + 0.007 * s
        ry = 0.021 * (1.0 - 0.12 * s)
        palm_rows.append([c + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry) for an in angs_p])
    pt_palm = Part(f'{name}_palm_{side}', np.array(palm_rows), True, ['helper-tights'] * 6, hand_paint, rigid_joint=side + 'Hand')
    pt_palm.is_arm = True
    out.append(pt_palm)
    f_paint = finger_paint or P('soot', 0.02, [B('bottom', 0.0, 0.006, 'solid', 'gold'), B('top', 0.0, 0.006, 'solid', 'gold')], fabric='leather.polished')
    # 5 articulated finger sheaths with sleek anatomical radii & exact phalanx row_joints
    for fg, r_base in (('Thumb', 0.0108), ('Index', 0.0094), ('Middle', 0.0098), ('Ring', 0.0092), ('Pinky', 0.0084)):
        p1 = J(f'{side}Hand{fg}1')
        p2 = J(f'{side}Hand{fg}2')
        p3 = J(f'{side}Hand{fg}3')
        tip_dir = p3 - p2
        root_pt = p1 - 0.16 * (p2 - p1)
        mid12 = 0.5 * (p1 + p2)
        tip1 = p3 + 0.78 * tip_dir
        tip2 = p3 + 1.04 * tip_dir
        f_pts = [root_pt, p1, mid12, p2, p3, tip1, tip2]
        f_rads = [r_base * 1.04, r_base, r_base * 0.95, r_base * 0.90, r_base * 0.82, r_base * 0.65, 0.0020]
        f_joints = [
            f'{side}Hand',
            f'{side}Hand{fg}1',
            f'{side}Hand{fg}1',
            f'{side}Hand{fg}2',
            f'{side}Hand{fg}3',
            f'{side}Hand{fg}3',
            f'{side}Hand{fg}3',
        ]
        angs_f = np.linspace(0, 2 * math.pi, 10, endpoint=False)
        f_rows = []
        for idx_r, (cp, rad) in enumerate(zip(f_pts, f_rads)):
            seg_d = (f_pts[min(idx_r + 1, len(f_pts) - 1)] - f_pts[max(idx_r - 1, 0)])
            t_v = seg_d / max(np.linalg.norm(seg_d), 1e-6)
            ref_v = np.array([0.0, 0.0, 1.0]) if abs(t_v[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
            u_v = np.cross(t_v, ref_v); u_v /= np.linalg.norm(u_v) + 1e-12
            v_v = np.cross(t_v, u_v); v_v /= np.linalg.norm(v_v) + 1e-12
            f_rows.append([cp + (u_v * math.cos(an) + v_v * math.sin(an)) * rad for an in angs_f])
        pt_f = Part(f'{name}_finger_{side}_{fg}', np.array(f_rows), True, ['helper-tights'] * len(f_rows), f_paint)
        pt_f.row_joints = f_joints
        pt_f.is_arm = True
        out.append(pt_f)
    return out


def rosette(name, center, out_vec, side_vec, radius, paint, n=14, thick=0.014, rigid_joint=None):
    return bio.blob(name, center, (radius * 2.0, thick * 2.0, radius * 2.0), paint,
                    n=n, rows=5, out=out_vec, rigid_joint=rigid_joint)


# ===============================================================================================================
# 1. Voth Priest — "Sun-Temple High Priest (Crimson Hierophant)"
# ===============================================================================================================
def build_voth_priest():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: voth_m_priest_helm ---
    gid_h = 'voth_m_priest_helm'
    parts_h = []
    # Crimson draped neck-cowl & hood base
    cowl_p = P('crimson', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'gold'), B('top', 0.0, 0.03, 'solid', 'maroon')], fabric='cloth.silk')
    parts_h.append(hood(gid_h + '_cowl', cowl_p, ease=0.020, ease_low=0.048, open_front=0.65, low=-0.46, rows=12, n=32, peak=0.02))
    # Bronze cranial back-casque + sculpted slotted bronze-and-gold architectural faceplate (`priest_mask`)
    cranium_p = P('bronze', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'gold'), B('top', 0.0, 0.04, 'fret', 'gold', 'crimson', 0.035)], fabric='metal.bronze')
    parts_h.append(sculpted_cranium(gid_h + '_cranium', cranium_p, f_top=1.02, f_bot=-0.04, ease=0.008))
    mask_p = P('bronze', 0.02, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('top', 0.0, 0.035, 'fret', 'gold', 'crimson', 0.03),
    ], [
        PN(0.0, 1.0, 'priest_mask', 'gold', 'bronze', 0.22),
    ], fabric='metal.bronze')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.80, f_bot=-0.06, ease=0.013, jaw_narrow=0.34))
    # Tall vertical central forehead/nose miter-blade fin with crimson & purple enamel inlay
    fin_p = P('gold', 0.02, [B('top', 0.0, 0.04, 'solid', 'crimson')], [PN(0.20, 0.80, 'stripes', 'crimson', 'purple', 0.025)], fabric='metal.gold')
    fin_pts = [a + (b - a) * f - bk * (0.158 + 0.022 * math.sin((f + 0.05) * math.pi * 0.7)) for f in np.linspace(1.62, -0.02, 11)]
    parts_h.append(horn(gid_h + '_fin', fin_pts, 0.016, 0.026, fin_p, n=10, rows=11, rigid_joint='Head'))
    # Swept bronze-and-gold temple/cheek wings & side spikes
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        sp1 = [a + (b - a) * (0.50 + 0.16 * t) + left * (sgn * (0.102 + 0.105 * t)) - bk * (0.05 - 0.03 * t) for t in np.linspace(0, 1, 6)]
        parts_h.append(horn(f'{gid_h}_spike_{tag}', sp1, 0.020, 0.004, P('gold', 0.02, fabric='metal.gold'), n=8, rows=6, rigid_joint='Head'))
        sp2 = [a + (b - a) * (0.30 - 0.04 * t) + left * (sgn * (0.098 + 0.072 * t)) - bk * (0.07 - 0.04 * t) for t in np.linspace(0, 1, 6)]
        parts_h.append(horn(f'{gid_h}_wing_{tag}', sp2, 0.026, 0.007, cranium_p, n=8, rows=6, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Voth Sun-Priest Miter Mask', 'head', 'chichani', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: voth_m_priest_robe ---
    gid_t = 'voth_m_priest_robe'
    parts_t = []
    robe_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.09, 'dentils', 'gold', 'maroon', 0.045),
        B('bottom', 0.09, 0.16, 'fret', 'gold', 'crimson', 0.055),
        B('top', 0.0, 0.06, 'solid', 'gold'),
    ], [
        PN(0.42, 0.58, 'voth_glyphs', 'soot', 'cream', 0.24),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_body', J('LeftFoot')[2] + 0.08, J('Neck')[2] + 0.01, robe_p,
                              ease=0.024, flare=0.14, rows=26, n=44))
    # Layered crimson-and-gold shoulder capelet & cowl collar
    cape_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.05, 'dentils', 'gold', 'maroon', 0.035),
        B('top', 0.0, 0.04, 'fret', 'gold', 'crimson', 0.04),
    ], fabric='cloth.silk')
    parts_t.append(collar(gid_t + '_cowl', cape_p, h=0.09, flare=0.04, open_front=0.0, rows=7, n=32))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, cape_p, span=0.22, drop=0.20, lift=0.022))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, P('purple', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'gold')]), f1=0.92, ease=0.016, flare=0.012, rows=14, n=24))
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, P('bronze', 0.02, [B('bottom', 0.0, 0.04, 'solid', 'gold'), B('top', 0.0, 0.04, 'fret', 'gold', 'bronze', 0.03)], fabric='metal.bronze'), f0=0.45, f1=0.92, ease=0.024, flare=0.006, rows=9, n=22))
    # Reliquary belt & side pouches
    parts_t.append(belt_sash(gid_t + '_belt', J('Hips')[2] + 0.03, J('Hips')[2] + 0.11, P('bronze', 0.02, [B('bottom', 0.0, 0.08, 'dentils', 'gold', 'umber', 0.03)], fabric='metal.bronze'), ease=0.038))
    e_t = assemble_garment(gid_t, 'Voth Sun-Priest Crimson Vestments', 'torso', 'chichani', parts_t)

    # --- FEET: voth_m_priest_boots ---
    gid_f = 'voth_m_priest_boots'
    boot_p = P('bronze', 0.02, [
        B('top', 0.0, 0.07, 'fret', 'gold', 'umber', 0.035),
        B('bottom', 0.0, 0.06, 'stripes', 'gold', 'umber', 0.025),
    ], fabric='metal.bronze')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.12, ease=0.018, rows=16, n=24, cuff=0.012) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Voth Sun-Priest Bronze Sabatons', 'feet', 'chichani', parts_f)
    return [e_h, e_t, e_f]


# ===============================================================================================================
# 2. Voth Ordinator — "Temple Ordinator (Emerald-Gold Indoril Guard)"
# ===============================================================================================================
def build_voth_ordinator():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: voth_m_ordinator_helm ---
    gid_h = 'voth_m_ordinator_helm'
    parts_h = []
    # 1. Gold-and-emerald cranial casque covering cranium, temples, and nape
    casque_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.04, 'fret', 'emerald', 'gold', 0.03),
        B('top', 0.0, 0.06, 'dentils', 'cream', 'gold', 0.03),
    ], fabric='metal.gold')
    parts_h.append(sculpted_cranium(gid_h + '_casque', casque_p, f_top=1.04, f_bot=-0.06, ease=0.009))
    # 2. Sculpted 3D golden Indoril faceplate with white forehead enamel plates, fierce V-brow, dark slanted eye slits & sharp nose ridge
    face_p = P('gold', 0.02, [
        B('top', 0.0, 0.03, 'fret', 'emerald', 'gold', 0.025),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'ordinator_mask', 'gold', 'gold', 0.22),
    ], fabric='metal.gold')
    parts_h.append(sculpted_faceplate(gid_h + '_faceplate', face_p, f_top=0.82, f_bot=-0.07, ease=0.014, jaw_narrow=0.38))
    # 3a. Rigid hammered-gold helmet crest-holder comb socket along the cranium midline
    comb_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.03, 'dentils', 'emerald', 'gold', 0.02),
        B('top', 0.0, 0.03, 'fret', 'emerald', 'gold', 0.025),
    ], fabric='metal.gold')
    s_comb = np.linspace(0.0, 1.0, 14)
    comb_rows = []
    for rad_c in (0.20, 0.12, 0.0):
        c_left, c_right = [], []
        for s in s_comb:
            ang_c = -0.30 * math.pi + 1.16 * math.pi * s
            ch = (0.035 + 0.085 * math.sin(s * math.pi)) * rad_c
            z_f = 0.48 + (0.53 + ch) * math.cos(ang_c)
            y_b = (0.130 + ch * 0.85) * math.sin(ang_c) - 0.012
            thk = 0.008 + 0.010 * (1.0 - rad_c * 3.5)
            bp = a + (b - a) * z_f + bk * y_b
            c_left.append(bp + left * thk)
            c_right.append(bp - left * thk)
        comb_rows.append(c_left + c_right[::-1])
    parts_h.append(Part(gid_h + '_comb_socket', np.array(comb_rows), True, ['body'] * len(comb_rows), comb_p, rigid_joint='Head'))
    # 3b. Dynamic forward-swooping mohawk feather/hair crest!
    # Row 0 is anchored in the golden comb socket (weighted 100% to Head) and rows 1..9 rise upward and lightly swoop forward
    # over the brow, rigged on upward-standing cloth/feather chains (`upCrest`) so it sways with core/atmos wind & character motion!
    plume_p = P('emerald', 0.02, [
        B('top', 0.0, 0.03, 'solid', 'gold'),
        B('bottom', 0.0, 0.025, 'solid', 'cybercyan'),
    ], [
        PN(0.0, 1.0, 'ordinator_plume', 'jade', 'emerald', 0.22),
    ], fabric='cloth.silk')
    s_vals = np.linspace(0.0, 1.0, 18)
    plume_rows = []
    for r_idx, rad_f in enumerate(np.linspace(0.0, 1.0, 10)):
        left_side = []
        right_side = []
        for s in s_vals:
            ang_c = -0.28 * math.pi + 1.12 * math.pi * s  # front brow over crown down to nape
            # Scalloped feather-lock silhouette near the outer tip
            scallop = 1.0 + 0.075 * math.sin(s * 9.0 * math.pi) * (rad_f ** 1.6)
            arch_profile = (math.sin(s * math.pi * 0.88 + 0.12) ** 0.62) * (1.12 - 0.28 * s)
            crest_h = (0.045 + 0.225 * arch_profile) * rad_f * scallop
            # Lightly swoops forward (`-bk * swoop_fwd`) as it rises toward the tip!
            swoop_fwd = (0.115 * (1.0 - 0.45 * s) * (rad_f ** 1.55) + 0.032 * rad_f * math.cos(s * math.pi * 0.65))
            z_f = 0.50 + (0.53 * math.cos(ang_c)) + crest_h * (0.78 * math.cos(ang_c * 0.55) + 0.28)
            y_b = (0.132 * math.sin(ang_c) - 0.012) + crest_h * 0.42 * math.sin(ang_c) - swoop_fwd
            thick = (0.006 + 0.020 * math.sin(rad_f * math.pi * 0.82)) * (0.65 + 0.35 * math.sin(s * math.pi))
            base_pt = a + (b - a) * z_f + bk * y_b
            left_side.append(base_pt + left * thick)
            right_side.append(base_pt - left * thick)
        plume_rows.append(left_side + right_side[::-1])
    plume_part = Part(gid_h + '_plume', np.array(plume_rows), True, ['body'] * len(plume_rows), plume_p, rigid_joint=None)
    plume_part.cloth = {'start': 0, 'stiff': 0.16, 'layer': 2}
    parts_h.append(plume_part)
    # 4. Pointed gilded ear-guards & cheek-spurs
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ep = [a + (b - a) * (0.36 + 0.06 * t) + left * (sgn * (0.104 + 0.058 * t)) + bk * (0.005 + 0.02 * t) for t in np.linspace(0, 1, 5)]
        parts_h.append(horn(f'{gid_h}_ear_{tag}', ep, 0.024, 0.004, casque_p, n=8, rows=5, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Voth Ordinator Crested Face-Helm', 'head', 'chichani', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: voth_m_ordinator_cuirass ---
    gid_t = 'voth_m_ordinator_cuirass'
    parts_t = []
    cuir_p = P('gold', 0.02, [
        B('top', 0.0, 0.055, 'fret', 'gold', 'emerald', 0.035),
        B('bottom', 0.0, 0.055, 'lorica_lames', 'gold', 'emerald', 0.035),
    ], [
        PN(0.22, 0.78, 'ordinator_cuirass', 'gold', 'emerald', 0.42),
        PN(0.0, 0.22, 'lorica_lames', 'gold', 'emerald', 0.055),
        PN(0.78, 1.0, 'lorica_lames', 'gold', 'emerald', 0.055),
    ], fabric='metal.gold')
    parts_t.append(torso_tube(gid_t + '_cuirass', J('Hips')[2] - 0.03, J('Neck')[2] + 0.01, cuir_p, ease=0.025, flare=0.032, rows=18, n=40))
    # Sculpted 3D golden pectoral plates, central chest sun-medallion & high golden gorget
    parts_t.append(collar(gid_t + '_gorget', P('gold', 0.02, [B('bottom', 0.0, 0.03, 'dentils', 'emerald', 'gold', 0.025)], fabric='metal.gold'), h=0.072, flare=0.026, open_front=0.0, rows=6, n=30))
    chest_pos = J('Spine2') - bk * 0.158 + up * 0.045
    parts_t.append(rosette(gid_t + '_sunboss', chest_pos, -bk, left, 0.058, P('gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='metal.gold'), n=16, thick=0.018, rigid_joint='Spine2'))
    # Multi-tiered hammered gold & emerald plate pauldrons with upturned shoulder horns & articulated golden vambraces
    paul_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.06, 'fret', 'gold', 'emerald', 0.035),
        B('top', 0.0, 0.06, 'lorica_lames', 'gold', 'emerald', 0.04),
    ], [
        PN(0.18, 0.82, 'baroque_scroll', 'gold', 'emerald', 0.12),
    ], fabric='metal.gold')
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, paul_p, span=0.24, drop=0.20, lift=0.030))
        parts_t.append(pauldron(f'{gid_t}_upper_lame_{side}', side, P('gold', 0.02, [B('bottom', 0.0, 0.03, 'dentils', 'emerald', 'gold', 0.025)], fabric='metal.gold'), span=0.18, drop=0.11, lift=0.042))
        sh_p = J(side + 'Arm')
        horn_pts = [sh_p + left * (sgn * (0.04 + 0.055 * t)) + up * (0.04 + 0.075 * (t ** 1.4)) - bk * 0.015 for t in np.linspace(0, 1, 6)]
        parts_t.append(horn(f'{gid_t}_shhorn_{side}', horn_pts, 0.022, 0.004, P('gold', 0.02, fabric='metal.gold'), n=8, rows=6, rigid_joint=side + 'Arm'))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, P('emerald', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='metal.gold'), f1=0.92, ease=0.016, flare=0.008, rows=12, n=22))
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, paul_p, f0=0.42, f1=0.92, ease=0.025, flare=0.008, rows=9, n=22))
    # Hammered gold & emerald Greek-key hip tassets + central cream-and-gold glyphic tabard banner
    tasset_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.06, 'fret', 'gold', 'emerald', 0.04),
        B('top', 0.0, 0.05, 'lorica_lames', 'gold', 'emerald', 0.04),
    ], [
        PN(0.10, 0.42, 'baroque_scroll', 'gold', 'emerald', 0.14),
        PN(0.58, 0.90, 'baroque_scroll', 'gold', 'emerald', 0.14),
    ], fabric='metal.gold')
    parts_t.append(skirt(gid_t + '_tassets', J('LeftLeg')[2] + 0.08, J('Hips')[2] + 0.04, tasset_p, ease=0.032, flare=0.075, rows=12, n=36))
    tab_p = P('cream', 0.03, [
        B('bottom', 0.0, 0.045, 'fret', 'gold', 'crimson', 0.03),
        B('top', 0.0, 0.03, 'solid', 'gold'),
    ], [
        PN(0.06, 0.94, 'voth_glyphs', 'umber', 'cream', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(tabard(gid_t + '_tabard', J('LeftLeg')[2] - 0.04, J('Hips')[2] + 0.04, 0.14, tab_p, front=True, back=True, ease=0.040, flare=0.02))
    parts_t.append(belt_sash(gid_t + '_belt', J('Hips')[2] + 0.01, J('Hips')[2] + 0.09, P('gold', 0.02, [B('bottom', 0.0, 0.03, 'fret', 'emerald', 'gold', 0.03)], fabric='metal.gold'), ease=0.037))
    buckle_pos = J('Hips') - bk * 0.158 + up * 0.05
    parts_t.append(rosette(gid_t + '_buckle', buckle_pos, -bk, left, 0.052, P('gold', 0.02, fabric='metal.gold'), n=14, thick=0.016, rigid_joint='Hips'))
    e_t = assemble_garment(gid_t, 'Voth Ordinator Emerald-Gold Cuirass', 'torso', 'chichani', parts_t)

    # --- LEGS: voth_m_ordinator_pants ---
    gid_l = 'voth_m_ordinator_pants'
    parts_l = trousers(gid_l, P('emerald', 0.03, [B('bottom', 0.0, 0.04, 'solid', 'gold')], [PN(0.0, 1.0, 'lorica_lames', 'gold', 'darkemerald', 0.06)], fabric='metal.gold'), ankle_f=0.88, ease=0.018, bag=0.012, rows=16, n=24)
    e_l = assemble_garment(gid_l, 'Voth Ordinator Emerald Breeches', 'legs', 'chichani', parts_l, legged=True)

    # --- FEET: voth_m_ordinator_greaves ---
    gid_f = 'voth_m_ordinator_greaves'
    gr_p = P('gold', 0.02, [
        B('top', 0.0, 0.08, 'fret', 'gold', 'emerald', 0.035),
        B('bottom', 0.0, 0.08, 'lorica_lames', 'gold', 'emerald', 0.035),
    ], [
        PN(0.18, 0.82, 'baroque_scroll', 'gold', 'emerald', 0.14),
    ], fabric='metal.gold')
    parts_f = []
    for s in ('Left', 'Right'):
        parts_f.extend(boot(f'{gid_f}_{s}', s, gr_p, top_f=0.05, ease=0.020, rows=16, n=24, cuff=0.018))
        knee_j = J(s + 'Leg')
        parts_f.append(rosette(f'{gid_f}_kneeboss_{s}', knee_j - bk * 0.072 + up * 0.01, -bk, left, 0.038, P('gold', 0.02, fabric='metal.gold'), n=12, thick=0.016, rigid_joint=s + 'Leg'))
    e_f = assemble_garment(gid_f, 'Voth Ordinator Filigree Greaves', 'feet', 'chichani', parts_f)
    return [e_h, e_t, e_l, e_f]


# ===============================================================================================================
# 3. Voth Scout — "Caldera Ash-Scout (Goggle-Wrapped Outrider)"
# ===============================================================================================================
def build_voth_scout():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: voth_m_scout_wrap ---
    gid_h = 'voth_m_scout_wrap'
    parts_h = []
    wrap_p = P('cobalt', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'ochre'), B('top', 0.0, 0.04, 'stripes', 'indigo', 'cobalt', 0.025)])
    # Close-fitting anatomical skull wrap above the brow (f = 0.46 .. 1.00, hugging the true cranium contour)
    parts_h.append(bio.head_rings(gid_h + '_skullwrap', 0.46, 1.00, 0.006, wrap_p, n=36, rows=9, apex=True, scale=(0.99, 0.96)))
    # Continuous rear/temple desert litham wrap bridging the back and sides of the head (no posterior overhang or ear gap!)
    angs_back = np.linspace(-0.52 * math.pi, 0.52 * math.pi, 22)
    Nape_grid = []
    for f in np.linspace(0.50, 0.20, 6):
        c = a + (b - a) * f
        Nape_grid.append(bio.ring_points(c, bk, left, angs_back, 0.006, rmin=0.060, rmax=0.104, bvh=bio.BVH))
    parts_h.append(Part(gid_h + '_napewrap', np.array(Nape_grid), False, ['body'] * len(Nape_grid), wrap_p, rigid_joint='Head'))
    # Lower-face dark indigo dust mask (top-to-bottom from nose tip f=0.22 down to chin/neck f=-0.10, contoured tightly)
    mask_p = P('indigo', 0.05, [B('top', 0.0, 0.025, 'solid', 'cobalt'), B('bottom', 0.0, 0.025, 'solid', 'ochre')])
    angs_cap = np.linspace(0, 2 * math.pi, 32, endpoint=False)
    fs_v = np.linspace(0.22, -0.10, 9)
    V_grid = []
    for f in fs_v:
        c = a + (b - a) * f
        ring = np.array(bio.ring_points(c, bk, left, angs_cap, 0.007, rmin=0.056, rmax=0.104, bvh=bio.BVH))
        V_grid.append(ring)
    parts_h.append(Part(gid_h + '_facemask', np.array(V_grid), True, ['body'] * len(fs_v), mask_p, rigid_joint='Head'))
    # Snug cobalt-blue neck-scarf around throat
    parts_h.append(collar(gid_h + '_scarf', wrap_p, h=0.058, flare=0.008, open_front=0.0, rows=6, n=32))
    # Brass-and-amber ash-goggles perched flush on the forehead brow (f=0.55)
    parts_h.append(crown_band(gid_h + '_strap', 0.51, 0.58, P('leather', 0.04), bulge=0.003, ease=0.008, rows=4, n=28))
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        g_pos = a + (b - a) * 0.55 + left * (sgn * 0.040) - bk * 0.116
        parts_h.append(rosette(f'{gid_h}_goggle_{tag}', g_pos, -bk, left, 0.026, P('brass', 0.02, fabric='metal.bronze'), n=12, thick=0.014, rigid_joint='Head'))
        parts_h.append(rosette(f'{gid_h}_lens_{tag}', g_pos - bk * 0.004, -bk, left, 0.018, P('cobalt', 0.02, fabric='beads.glass'), n=12, thick=0.012, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Voth Ash-Scout Goggle Head-Wrap', 'head', 'chichani', parts_h, covers_hair=True)

    # --- TORSO: voth_m_scout_harness ---
    gid_t = 'voth_m_scout_harness'
    parts_t = []
    # Cropped bone-white & cobalt chest-harness leaving grey Chichani midriff bare
    chest_p = P('bone', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'leather'),
        B('top', 0.0, 0.04, 'solid', 'cobalt'),
    ], [
        PN(0.0, 0.35, 'solid', 'cobalt', 'cobalt', 0.10),
    ], fabric='leather.buckskin')
    parts_t.append(torso_tube(gid_t + '_chest', J('Spine1')[2] + 0.03, J('Neck')[2] + 0.015, chest_p, ease=0.022, flare=0.006, rows=12, n=36))
    # Diagonal leather cross-baldric with brass O-ring
    parts_t.append(crossed_sash(gid_t + '_baldric', P('leather', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'brass')]), width=0.052, ease=0.034))
    ring_pos = J('Spine2') - bk * 0.152 + up * 0.03
    parts_t.append(rosette(gid_t + '_oring', ring_pos, -bk, left, 0.030, P('brass', 0.02, fabric='metal.bronze'), n=12, thick=0.010, rigid_joint='Spine2'))
    # Asymmetric bone-white leather pauldron + short cobalt sleeves + strapped leather bracers
    parts_t.append(pauldron(gid_t + '_pauldron_Left', 'Left', P('bone', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='leather.buckskin'), span=0.20, drop=0.16, lift=0.028))
    parts_t.append(pauldron(gid_t + '_pauldron_Right', 'Right', P('cobalt', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'brass')]), span=0.17, drop=0.13, lift=0.024))
    bracer_p = P('leather', 0.04, [B('top', 0.0, 0.04, 'solid', 'brass'), B('bottom', 0.0, 0.04, 'solid', 'brass')],
                 [PN(0.25, 0.75, 'stripes', 'indigo', 'brass', 0.03)], fabric='leather.polished')
    for side in ('Left', 'Right'):
        parts_t.append(sleeve(f'{gid_t}_short_{side}', side, P('indigo', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), f0=0.07, f1=0.33, ease=0.016, flare=0.006, rows=7, n=22))
        parts_t.append(sleeve(f'{gid_t}_bracer_{side}', side, bracer_p, f0=0.50, f1=0.92, ease=0.018, flare=0.005, rows=8, n=20))
    e_t = assemble_garment(gid_t, 'Voth Ash-Scout Leather Chest-Harness', 'torso', 'chichani', parts_t, open_torso=True)

    # --- LEGS: voth_m_scout_trousers ---
    gid_l = 'voth_m_scout_trousers'
    parts_l = trousers(gid_l, P('indigo', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'leather')]), ankle_f=0.55, ease=0.015, bag=0.002, rows=14, n=26)
    # Asymmetric half-cobalt / half-ochre ragged sash-kilt over the indigo trousers
    kilt_p = P('cobalt', 0.05, [
        B('bottom', 0.0, 0.05, 'dentils', 'ochre', 'cobalt', 0.04),
        B('top', 0.0, 0.06, 'stripes', 'leather', 'brass', 0.03),
    ], [
        PN(0.50, 0.88, 'stripes', 'sand', 'ochre', 0.08),
    ])
    parts_l.append(skirt(gid_l + '_kilt', J('LeftLeg')[2] + 0.04, J('Hips')[2] + 0.05, kilt_p, ease=0.044, flare=0.06, rows=12, n=36, jagged=0.030))
    # Right-hip brown leather scout satchel pouch
    pouch_pos = J('Hips') - left * 0.178 - bk * 0.04 - up * 0.02
    parts_l.append(blob(gid_l + '_satchel', pouch_pos, (0.045, 0.075, 0.085), P('leather', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass')], fabric='leather.polished'), n=12, rows=6, out=-left, rigid_joint='Hips'))
    e_l = assemble_garment(gid_l, 'Voth Ash-Scout Sash & Breeches', 'legs', 'chichani', parts_l, legged=True)

    # --- FEET: voth_m_scout_sandals ---
    gid_f = 'voth_m_scout_sandals'
    sand_p = P('leather', 0.04, [
        B('top', 0.0, 0.08, 'fret', 'brass', 'leather', 0.035),
        B('bottom', 0.0, 0.12, 'stripes', 'leather', 'bone', 0.028),
    ], fabric='leather.polished')
    parts_f = [boot(f'{gid_f}_{s}', s, sand_p, top_f=0.45, ease=0.022, rows=14, n=22, cuff=0.012) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Voth Ash-Scout Strapped Greave-Sandals', 'feet', 'chichani', parts_f)
    return [e_h, e_t, e_l, e_f]


# ===============================================================================================================
# 4. Tzintzun's Regalia — "Tzintzun, Son of the Sun (God-King Regalia)"
# ===============================================================================================================
def build_voth_tzintzun():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: voth_m_tzintzun_mask ---
    gid_h = 'voth_m_tzintzun_mask'
    parts_h = []
    # 1. Oblong gold oval face-mask pointed at the bottom chin (`jaw_narrow=0.82`, `f_top=0.88`, `f_bot=-0.12`)
    #    with clearly defined almond eyes & vertical diamond 'third eye' (hair is now standalone `hair_meso_11_tzintzun_ringed_ponytail`!)
    mask_p = P('gold', 0.015, [
        B('top', 0.0, 0.015, 'solid', 'gold'),
        B('bottom', 0.0, 0.015, 'solid', 'umber'),
    ], [
        PN(0.0, 1.0, 'tzintzun_mask', 'gold', 'gold', 0.28),
    ], fabric='metal.gold')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.88, f_bot=-0.12, ease=0.016, rows=18, n=36, jaw_narrow=0.82))

    # 2. Oblong pointed-bottom golden mask border plate that bridges the sculpted face to all 19 golden border spikes without any gap!
    face_ctr = a + (b - a) * 0.38 - bk * 0.124
    ray_gold = P('gold', 0.015, [B('bottom', 0.0, 0.02, 'solid', 'umber')], fabric='metal.gold')

    def _oblong_mask_pt(ang, r_scale=1.0, fwd_extra=0.0):
        sx = math.sin(ang)
        cz = math.cos(ang)
        # Oblong vertical aspect (rz = 0.132) with pointed bottom chin when cz < -0.10
        t_chin = max(0.0, min(1.0, (-0.10 - cz) / 0.90))
        chin_narrow = 1.0 - 0.68 * (t_chin ** 1.35)
        rx = 0.100 * chin_narrow * r_scale
        rz = 0.132 * r_scale
        z_point = -0.014 * (max(0.0, -cz) ** 3) * r_scale
        # Curve back smoothly from nose/brow bridge toward the temples so the oblong plate wraps the face
        y_back = (0.028 * (sx ** 2) + 0.012 * (cz ** 2)) * (r_scale ** 1.2) - 0.018 * (1.0 - r_scale) - fwd_extra
        return face_ctr + left * (sx * rx) + up * (cz * rz + z_point) + bk * y_back

    rim_angs = np.linspace(-math.pi, math.pi, 48, endpoint=False)
    oblong_rows = [
        [_oblong_mask_pt(an, r_sc, fwd) for an in rim_angs]
        for r_sc, fwd in ((0.48, 0.008), (0.72, 0.006), (0.92, 0.004), (1.03, 0.002), (1.05, -0.006))
    ]
    parts_h.append(Part(gid_h + '_oblong_plate', np.array(oblong_rows), True, ['body'] * len(oblong_rows), ray_gold, rigid_joint='Head'))

    # 3. Sculpted 3D vertical diamond 'third eye' + 3D upturned almond eye-slit bezels on the mask faceplate!
    gem_ctr = a + (b - a) * 0.62 - bk * 0.168
    d_rows = []
    for r_sc, fwd_off in ((0.002, 0.012), (0.55, 0.010), (0.82, 0.005), (1.0, -0.004)):
        d_rows.append([
            gem_ctr + up * (0.036 * r_sc) - bk * fwd_off,
            gem_ctr + left * (0.022 * r_sc) - bk * fwd_off,
            gem_ctr - up * (0.036 * r_sc) - bk * fwd_off,
            gem_ctr - left * (0.022 * r_sc) - bk * fwd_off,
        ])
    third_eye_p = P('soot', 0.01, [B('bottom', 0.0, 0.014, 'solid', 'gold'), B('top', 0.0, 0.006, 'solid', 'cream')], fabric='beads.glass')
    parts_h.append(Part(gid_h + '_third_eye_3d', np.array(d_rows), True, ['body'] * len(d_rows), third_eye_p, rigid_joint='Head'))
    for sd_e, tag_e in ((-1.0, 'R'), (1.0, 'L')):
        eye_c = a + (b - a) * 0.43 + left * (sd_e * 0.036) - bk * 0.162
        e_rows = []
        for r_sc, fwd_off in ((0.002, 0.009), (0.65, 0.008), (1.0, -0.004)):
            e_rows.append([
                eye_c + (left * (sd_e * 0.024) + up * 0.006 + bk * 0.008) * r_sc - bk * fwd_off,
                eye_c + up * (0.012 * r_sc) - bk * fwd_off,
                eye_c + (-left * (sd_e * 0.022) - up * 0.003 + bk * 0.004) * r_sc - bk * fwd_off,
                eye_c - up * (0.011 * r_sc) - bk * fwd_off,
            ])
        parts_h.append(Part(f'{gid_h}_eye_3d_{tag_e}', np.array(e_rows), True, ['body'] * len(e_rows), third_eye_p, rigid_joint='Head'))

    # 4. Radiant halo of 19 flat-beveled triangular golden sun-rays rooted inside the oblong mask rim (r_scale=0.84) + tall central forehead spear-ray
    n_rays = 19
    for k in range(n_rays):
        ang_r = -0.82 * math.pi + 1.64 * math.pi * (k / (n_rays - 1))
        sx = math.sin(ang_r)
        cz = math.cos(ang_r)
        # Root each spike inside the oblong golden mask rim (r_scale=0.84) so every spike connects 100% solidly to the golden face!
        rim_pt = _oblong_mask_pt(ang_r, r_scale=0.84, fwd_extra=0.002)
        r_dir = left * sx + up * cz - bk * 0.04
        r_dir = r_dir / np.linalg.norm(r_dir)
        if k == n_rays // 2:
            ray_len = 0.155
            r_w = 0.028
            spear_p = P('gold', 0.015, [B('bottom', 0.0, 0.03, 'solid', 'soot')], [PN(0.38, 0.62, 'solid', 'soot', 'gold', 0.10)], fabric='metal.gold')
            r_pts = [rim_pt + r_dir * (ray_len * t) for t in np.linspace(0, 1, 6)]
            parts_h.append(horn(f'{gid_h}_ray_{k}', r_pts, r_w, 0.002, spear_p, n=8, rows=6, rigid_joint='Head'))
        else:
            ray_len = 0.108 if (k % 2 == 0) else 0.080
            r_w = 0.021 if (k % 2 == 0) else 0.016
            r_pts = [rim_pt + r_dir * (ray_len * t) for t in np.linspace(0, 1, 5)]
            parts_h.append(horn(f'{gid_h}_ray_{k}', r_pts, r_w, 0.002, ray_gold, n=6, rows=5, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, "Tzintzun's Radiant Sun-God Mask", 'head', 'chichani', parts_h, covers_hair=False, covers_face=True)

    # --- TORSO: voth_m_tzintzun_regalia ---
    gid_t = 'voth_m_tzintzun_regalia'
    parts_t = []
    # Split royal upper tunic (from Neck down to Hips so the Red/Purple patterned legs & Emerald Stole are 100% visible below the belt!):
    # In torso_tube: u in [0.0, 0.50] = Left (+X, matching Left Red arm), u in [0.50, 1.00] = Right (-X, matching Right Purple arm)!
    tunic_p = P('purple', 0.025, [
        B('bottom', 0.0, 0.045, 'fret', 'gold', 'soot', 0.04),
        B('top', 0.0, 0.045, 'fret', 'gold', 'soot', 0.04),
    ], [
        PN(0.0, 0.49, 'tzintzun_tapestry', 'gold', 'crimson', 0.28),
        PN(0.51, 1.0, 'tzintzun_tapestry', 'gold', 'purple', 0.28),
        PN(0.36, 0.64, 'tzintzun_tapestry', 'gold', 'purple', 0.24),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_tunic', J('Hips')[2] - 0.02, J('Neck')[2] + 0.01, tunic_p, ease=0.024, flare=0.03, rows=14, n=44))
    # Draped black silk shawl-cowl collar & twin embossed golden sun-disc shoulder fibulae with hanging gold tassels
    parts_t.append(collar(gid_t + '_shawl', P('soot', 0.03, [B('bottom', 0.0, 0.025, 'solid', 'gold'), B('top', 0.0, 0.02, 'solid', 'gold')], fabric='cloth.silk'), h=0.085, flare=0.042, open_front=0.0, rows=7, n=32))
    for sgn, tag, jn in ((-1.0, 'R', 'RightShoulder'), (1.0, 'L', 'LeftShoulder')):
        fib_pos = J('Neck') + left * (sgn * 0.142) - bk * 0.098 - up * 0.042
        parts_t.append(rosette(f'{gid_t}_fibula_{tag}', fib_pos, -bk, left, 0.050,
                               P('gold', 0.015, [B('top', 0.0, 0.015, 'dentils', 'soot', 'gold', 0.02)], fabric='metal.gold'),
                               n=16, thick=0.016, rigid_joint=jn))
        parts_t.append(tassel(f'{gid_t}_fibula_tassel_{tag}', fib_pos - up * 0.035 - bk * 0.008, 0.095, 0.014,
                              P('gold', 0.015, [B('top', 0.0, 0.02, 'solid', 'crimson')], fabric='metal.gold'), rigid_joint=jn))
    # Sweeping floor-length black silk royal cloak with golden fretwork hem border
    cloak_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.075, 'fret', 'gold', 'soot', 0.045),
        B('top', 0.0, 0.04, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_t.append(cape(gid_t + '_cloak', J('LeftFoot')[2] + 0.14, J('Neck')[2] - 0.02, cloak_p, arc=1.08, ease=0.062, flare=0.16, rows=20, n=32))
    # Executive decision: Arms are OPPOSITE of legs -> Right arm = Purple (`purple`) pattern, Left arm = Red (`crimson`) pattern!
    parts_t.append(sleeve(gid_t + '_sleeve_Right', 'Right', P('purple', 0.025, [B('bottom', 0.0, 0.035, 'fret', 'gold', 'soot', 0.03)], [PN(0.0, 1.0, 'tzintzun_tapestry', 'gold', 'purple', 0.28)], fabric='cloth.silk'), f0=0.0, f1=0.58, ease=0.032, flare=0.015, rows=10, n=22))
    parts_t.append(sleeve(gid_t + '_sleeve_Left', 'Left', P('crimson', 0.025, [B('bottom', 0.0, 0.035, 'fret', 'gold', 'soot', 0.03)], [PN(0.0, 1.0, 'tzintzun_tapestry', 'gold', 'crimson', 0.28)], fabric='cloth.silk'), f0=0.0, f1=0.58, ease=0.032, flare=0.015, rows=10, n=22))
    vam_p = P('soot', 0.025, [B('top', 0.0, 0.04, 'fret', 'gold', 'soot', 0.03), B('bottom', 0.0, 0.04, 'solid', 'gold')], [PN(0.2, 0.8, 'chevrons', 'gold', 'soot', 0.035)], fabric='leather.polished')
    for side in ('Left', 'Right'):
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, vam_p, f0=0.48, f1=0.88, ease=0.020, flare=0.004, rows=8, n=20))
    # Wide embossed golden royal belt, central sun-medallion buckle, & center-front Emerald/Jade-and-Gold Mayan glyphic tabard/stole!
    parts_t.append(belt_sash(gid_t + '_belt', J('Hips')[2] - 0.01, J('Hips')[2] + 0.095, P('gold', 0.015, [B('bottom', 0.0, 0.03, 'fret', 'soot', 'gold', 0.03), B('top', 0.0, 0.025, 'fret', 'soot', 'gold', 0.03)], fabric='metal.gold'), ease=0.038))
    parts_t.append(rosette(gid_t + '_buckle', J('Hips') - bk * 0.160 + up * 0.045, -bk, left, 0.056, P('gold', 0.015, [B('top', 0.0, 0.02, 'dentils', 'soot', 'gold', 0.02)], fabric='metal.gold'), n=16, thick=0.018, rigid_joint='Hips'))
    stole_p = P('deepgreen', 0.025, [
        B('bottom', 0.0, 0.055, 'dentils', 'gold', 'soot', 0.03),
        B('top', 0.0, 0.035, 'solid', 'gold'),
    ], [
        PN(0.0, 1.0, 'tzintzun_emerald_stole', 'gold', 'deepgreen', 0.24),
    ], fabric='cloth.silk')
    parts_t.append(tabard(gid_t + '_stole', J('LeftLeg')[2] + 0.02, J('Hips')[2] + 0.03, 0.15, stole_p, front=True, back=False, ease=0.048, flare=0.03, center_ang=math.pi))
    e_t = assemble_garment(gid_t, "Tzintzun's Royal Solar Tunic & Cloak", 'torso', 'chichani', parts_t)

    # --- GLOVES: voth_m_tzintzun_gloves ---
    gid_g = 'voth_m_tzintzun_gloves'
    glove_hand_p = P('soot', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'gold'),
        B('bottom', 0.0, 0.02, 'solid', 'gold'),
    ], [
        PN(0.20, 0.80, 'chevrons', 'gold', 'soot', 0.03),
    ], fabric='leather.polished')
    glove_cuff_p = P('soot', 0.02, [
        B('top', 0.0, 0.03, 'fret', 'gold', 'soot', 0.03),
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.15, 0.85, 'tzintzun_tapestry', 'gold', 'soot', 0.14),
    ], fabric='leather.polished')
    parts_g = []
    for side in ('Left', 'Right'):
        parts_g.extend(glove(f'{gid_g}_{side}', side, glove_hand_p, cuff_paint=glove_cuff_p, f0=0.66, ease=0.014))
    e_g = assemble_garment(gid_g, "Tzintzun's Ceremonial Black & Gold Gauntlets", 'gloves', 'chichani', parts_g)

    # --- LEGS: voth_m_tzintzun_pants ---
    # Executive decision: Right leg = Red (`crimson`) pattern, Left leg = Purple (`purple`) pattern!
    gid_l = 'voth_m_tzintzun_pants'
    p_pelvis = P('purple', 0.025, [], [
        PN(0.0, 0.50, 'tzintzun_tapestry', 'gold', 'purple', 0.34),
        PN(0.50, 1.0, 'tzintzun_tapestry', 'gold', 'crimson', 0.34),
    ], fabric='cloth.silk')
    p_right = P('crimson', 0.025, [B('bottom', 0.0, 0.055, 'fret', 'gold', 'soot', 0.04)], [PN(0.0, 1.0, 'tzintzun_tapestry', 'gold', 'crimson', 0.36)], fabric='cloth.silk')
    p_left = P('purple', 0.025, [B('bottom', 0.0, 0.055, 'fret', 'gold', 'soot', 0.04)], [PN(0.0, 1.0, 'tzintzun_tapestry', 'gold', 'purple', 0.36)], fabric='cloth.silk')
    raw_legs = trousers(gid_l, p_right, ankle_f=0.78, ease=0.028, bag=0.048, rows=16, n=28)
    for pt in raw_legs:
        if pt.name.endswith('_pelvis'):
            pt.paint = p_pelvis
        elif pt.name.endswith('_Left'):
            pt.paint = p_left
        elif pt.name.endswith('_Right'):
            pt.paint = p_right
    e_l = assemble_garment(gid_l, "Tzintzun's Solar Harem Trousers", 'legs', 'chichani', raw_legs, legged=True)

    # --- FEET: voth_m_tzintzun_boots ---
    gid_f = 'voth_m_tzintzun_boots'
    boot_p = P('soot', 0.025, [
        B('top', 0.0, 0.06, 'dentils', 'gold', 'soot', 0.03),
        B('bottom', 0.0, 0.05, 'solid', 'gold'),
    ], [
        PN(0.25, 0.75, 'tzintzun_tapestry', 'gold', 'soot', 0.22),
    ], fabric='leather.polished')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.22, ease=0.018, rows=14, n=24, cuff=0.014) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, "Tzintzun's Star-Embossed Royal Boots", 'feet', 'chichani', parts_f)
    return [e_h, e_t, e_g, e_l, e_f]


# ===============================================================================================================
# 5. Voth Chosen Warrior / Son of Tzintzun — "Chosen of Tzintzun (Solar Praetorian Guard)"
# ===============================================================================================================
def build_voth_chosen():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: voth_m_chosen_hat ---
    gid_h = 'voth_m_chosen_hat'
    parts_h = []
    # Dark charcoal neck-cowl & under-hood
    parts_h.append(hood(gid_h + '_cowl', P('soot', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'crimson')]),
                        ease=0.020, ease_low=0.046, open_front=0.62, low=-0.42, rows=11, n=30, peak=0.01))
    parts_h.append(sculpted_cranium(gid_h + '_cranium', P('soot', 0.05), f_top=0.92, f_bot=-0.04, ease=0.008))
    # Sculpted porcelain-white war-mask (`chosen_kabuki_mask` motif: crimson-and-black kabuki war-stripes, dark eye sockets & lips)
    mask_p = P('porcelain', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'soot'),
        B('bottom', 0.0, 0.02, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'chosen_kabuki_mask', 'crimson', 'porcelain', 0.22),
    ], fabric='shell.nacre')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.76, f_bot=-0.05, ease=0.014, jaw_narrow=0.38))
    # Dark iron conical war-hat (jingasa) with raised front crest & side silver tassels
    hat_p = P('iron', 0.03, [
        B('bottom', 0.0, 0.04, 'fret', 'bronze', 'soot', 0.04),
        B('top', 0.0, 0.05, 'solid', 'bronze'),
    ], fabric='metal.iron')
    parts_h.append(conical_hat(gid_h + '_kasa', 0.62, 1.36, 0.25, hat_p, curve=0.88))
    crest_pts = [a + (b - a) * (0.66 + 0.68 * t) - bk * (0.24 * (1.0 - t) + 0.02) for t in np.linspace(0, 1, 6)]
    parts_h.append(horn(gid_h + '_crest', crest_pts, 0.024, 0.006, P('bronze', 0.02, fabric='metal.bronze'), n=8, rows=6, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        t_top = a + (b - a) * 0.62 + left * (sgn * 0.18) - bk * 0.04
        parts_h.append(tassel(f'{gid_h}_tassel_{tag}', t_top, 0.08, 0.010, P('silver', 0.02, fabric='metal.iron'), rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Chosen of Tzintzun Porcelain Mask & Kasa', 'head', 'chichani', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: voth_m_chosen_tunic ---
    gid_t = 'voth_m_chosen_tunic'
    parts_t = []
    # Crossed charcoal-black tunic & split martial skirt with crimson-oat-black woven tapestry panel
    tunic_p = P('soot', 0.05, [
        B('bottom', 0.0, 0.06, 'fret', 'bronze', 'soot', 0.045),
        B('top', 0.0, 0.05, 'chevrons', 'crimson', 'oat', 0.04),
    ], [
        PN(0.30, 0.56, 'chosen_tapestry', 'crimson', 'oat', 0.14),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_body', J('LeftLeg')[2] + 0.02, J('Neck')[2] + 0.01, tunic_p, ease=0.024, flare=0.10, rows=22, n=40))
    # Narrow woven crimson-ochre-black geometric tapestry stole hanging down from left chest past the knees
    stole_p = P('oat', 0.05, [
        B('bottom', 0.0, 0.05, 'stripes', 'crimson', 'soot', 0.02),
        B('top', 0.0, 0.04, 'solid', 'crimson'),
    ], [
        PN(0.06, 0.94, 'chosen_tapestry', 'crimson', 'oat', 0.14),
    ], fabric='cloth.weave.twill')
    parts_t.append(tabard(gid_t + '_stole', J('LeftFoot')[2] + 0.18, J('Spine2')[2] + 0.10, 0.15, stole_p, front=True, back=True, ease=0.038, flare=0.02))
    # Segmented dark-iron lamellar shoulder pauldrons & fluted vambraces
    iron_p = P('iron', 0.02, [B('bottom', 0.0, 0.06, 'lorica_lames', 'bronze', 'iron', 0.04), B('top', 0.0, 0.05, 'lorica_lames', 'bronze', 'iron', 0.04)], fabric='metal.iron')
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, iron_p, span=0.22, drop=0.20, lift=0.024))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, P('soot', 0.05), f1=0.92, ease=0.016, flare=0.008, rows=12, n=22))
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, iron_p, f0=0.45, f1=0.92, ease=0.022, flare=0.005, rows=9, n=20))
    # Wide knotted crimson-and-black waist obi + hanging silver scroll-cylinder
    parts_t.append(belt_sash(gid_t + '_obi', J('Hips')[2] + 0.01, J('Hips')[2] + 0.13, stole_p, ease=0.040))
    cyl_top = J('Hips') - left * 0.11 - bk * 0.155 - up * 0.02
    parts_t.append(tassel(gid_t + '_scroll', cyl_top, 0.11, 0.018, P('silver', 0.02, fabric='metal.iron'), rigid_joint='Hips'))
    e_t = assemble_garment(gid_t, 'Chosen of Tzintzun Lamellar Tunic & Stole', 'torso', 'chichani', parts_t)

    # --- LEGS: voth_m_chosen_pants ---
    gid_l = 'voth_m_chosen_pants'
    parts_l = trousers(gid_l, P('soot', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'crimson')]), ankle_f=0.76, ease=0.028, bag=0.046, rows=16, n=28)
    e_l = assemble_garment(gid_l, 'Chosen of Tzintzun Hakama Breeches', 'legs', 'chichani', parts_l, legged=True)

    # --- FEET: voth_m_chosen_greaves ---
    gid_f = 'voth_m_chosen_greaves'
    gr_p = P('iron', 0.03, [
        B('top', 0.0, 0.08, 'dentils', 'bronze', 'iron', 0.035),
        B('bottom', 0.0, 0.10, 'stripes', 'bronze', 'soot', 0.028),
    ], [
        PN(0.30, 0.70, 'chevrons', 'crimson', 'iron', 0.045),
    ], fabric='metal.iron')
    parts_f = [boot(f'{gid_f}_{s}', s, gr_p, top_f=0.08, ease=0.018, rows=16, n=24, cuff=0.014) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Chosen of Tzintzun Iron Shin-Greaves', 'feet', 'chichani', parts_f)
    return [e_h, e_t, e_l, e_f]


# ===============================================================================================================
# 6. Beast Rider Amazon (mpfb_female) — "Jungle Amazon (Leopard-Pelt Dual-Blade Huntress)"
# ===============================================================================================================
def build_beast_amazon():
    set_body('mpfb_female')
    a, b, up, bk, left = head_frame()

    # --- HEAD: beast_f_amazon_torc (Stacked brass neck-rings, bone-tooth necklace, & silver/carnelian disc earrings) ---
    gid_h = 'beast_f_amazon_torc'
    parts_h = []
    torc_p = P('gold', 0.02, [B('top', 0.0, 0.08, 'stripes', 'gold', 'umber', 0.014)], fabric='metal.gold')
    parts_h.append(collar(gid_h + '_neckrings', torc_p, h=0.075, flare=0.012, open_front=0.0, rows=7, n=30))
    # Large silver-and-carnelian disc earrings hanging below the ears
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ear_pos = a + (b - a) * 0.14 + left * (sgn * 0.098) + bk * 0.005
        parts_h.append(rosette(f'{gid_h}_earring_{tag}', ear_pos, left * sgn, -bk, 0.032,
                               P('silver', 0.02, [B('top', 0.0, 0.02, 'solid', 'terracotta')], fabric='metal.iron'), n=14, thick=0.008, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Beast Rider Amazon Neck-Rings & Earrings', 'head', 'beast_riders', parts_h, covers_hair=False)

    # --- TORSO: beast_f_amazon_harness ---
    gid_t = 'beast_f_amazon_harness'
    parts_t = []
    # Terracotta-red wrapped chest-bandeau with bone-white back cross-straps
    band_p = P('madder', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
        B('top', 0.0, 0.025, 'dentils', 'bone', 'leather', 0.022),
    ], [
        PN(0.0, 0.22, 'stripes', 'cream', 'madder', 0.025),
        PN(0.78, 1.0, 'stripes', 'cream', 'madder', 0.025),
    ], fabric='cloth.cotton.coarse')
    parts_t.append(torso_tube(gid_t + '_bandeau', J('Spine1')[2] + 0.04, J('Spine2')[2] + 0.09, band_p, ease=0.028, flare=0.005, rows=9, n=34))
    # Bone-tooth necklace around upper chest
    parts_t.append(neck_ring(gid_t + '_teeth', P('bone', 0.03, [B('bottom', 0.0, 0.02, 'dentils', 'bone', 'leather', 0.018)]), r_tube=0.014, drop=0.04))
    # Sculpted golden beast-skull left pauldron + golden bicep bands + fur-trimmed bronze/leather vambraces
    skull_p = P('gold', 0.02, [B('bottom', 0.0, 0.04, 'dentils', 'umber', 'gold', 0.03)], fabric='metal.gold')
    parts_t.append(pauldron(gid_t + '_skull_pauldron_Left', 'Left', skull_p, span=0.20, drop=0.16, lift=0.026))
    vam_p = P('leather', 0.04, [
        B('top', 0.0, 0.05, 'solid', 'buck'),
        B('bottom', 0.0, 0.04, 'solid', 'gold'),
    ], [
        PN(0.20, 0.80, 'baroque_scroll', 'gold', 'leather', 0.09),
    ], fabric='leather.polished')
    for side in ('Left', 'Right'):
        parts_t.append(sleeve(f'{gid_t}_armband_{side}', side, skull_p, f0=0.18, f1=0.32, ease=0.016, flare=0.002, rows=5, n=20))
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, vam_p, f0=0.52, f1=0.92, ease=0.020, flare=0.005, rows=8, n=20))
    e_t = assemble_garment(gid_t, 'Beast Rider Amazon Bandeau & Beast-Pauldron', 'torso', 'beast_riders', parts_t, open_torso=True)

    # --- LEGS: beast_f_amazon_kilt ---
    gid_l = 'beast_f_amazon_kilt'
    # Brown rugged trousers underneath
    parts_l = trousers(gid_l, P('umber', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'buck')]), ankle_f=0.68, ease=0.016, bag=0.006, rows=14, n=24)
    # Jagged leopard-pelt skirt/kilt with front & back indigo-blue diamond-motif woven sash
    leopard_p = P('sand', 0.05, [
        B('top', 0.0, 0.08, 'stripes', 'mongolblue', 'leather', 0.035),
    ], [
        PN(0.0, 1.0, 'leopard_spots', 'soot', 'sand', 0.18),
        PN(0.42, 0.56, 'diamonds', 'white', 'mongolblue', 0.14),
        PN(0.92, 1.00, 'diamonds', 'white', 'mongolblue', 0.14),
        PN(0.00, 0.08, 'diamonds', 'white', 'mongolblue', 0.14),
    ], fabric='fur.short')
    parts_l.append(skirt(gid_l + '_pelt', J('LeftLeg')[2] - 0.04, J('Hips')[2] + 0.05, leopard_p, ease=0.046, flare=0.08, rows=14, n=38, jagged=0.045))
    # Silver belt buckle & hip daggers/pouches
    parts_l.append(rosette(gid_l + '_buckle', J('Hips') - bk * 0.145 + up * 0.03, -bk, left, 0.038, P('silver', 0.02, fabric='metal.iron'), n=12, thick=0.012, rigid_joint='Hips'))
    e_l = assemble_garment(gid_l, 'Beast Rider Amazon Leopard-Pelt Kilt', 'legs', 'beast_riders', parts_l, legged=True)

    # --- FEET: beast_f_amazon_boots ---
    gid_f = 'beast_f_amazon_boots'
    boot_p = P('leather', 0.04, [
        B('top', 0.0, 0.09, 'solid', 'buck'),
        B('bottom', 0.0, 0.06, 'solid', 'leather'),
    ], [
        PN(0.15, 0.85, 'chevrons', 'crimson', 'leather', 0.055),
    ], fabric='leather.polished')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.08, ease=0.018, rows=16, n=24, cuff=0.022) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Beast Rider Amazon Fur-Topped Greave-Boots', 'feet', 'beast_riders', parts_f)
    set_body('mpfb_male')
    return [e_h, e_t, e_l, e_f]


# ===============================================================================================================
# 7. Phil's Outfit (Izani Pirate) — "Phil's Corsair Rig (Izani Pirate Captain)"
# ===============================================================================================================
def build_iziz_phil():
    set_body('mpfb_male')
    _, _, up, bk, left = head_frame()

    # --- TORSO: iziz_m_phil_jacket ---
    gid_t = 'iziz_m_phil_jacket'
    parts_t = []
    # Open-chested slate-blue & crimson cropped pirate bolero jacket over cream linen V-neck shirt
    jacket_p = P('slateblue', 0.05, [
        B('bottom', 0.0, 0.05, 'stripes', 'crimson', 'gold', 0.03),
        B('top', 0.0, 0.04, 'solid', 'crimson'),
    ], [
        PN(0.32, 0.44, 'baroque_scroll', 'cream', 'crimson', 0.14),
        PN(0.56, 0.68, 'baroque_scroll', 'cream', 'crimson', 0.14),
        PN(0.44, 0.56, 'stripes', 'cream', 'oat', 0.035),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_bolero', J('Spine')[2] + 0.01, J('Neck')[2] + 0.015, jacket_p, ease=0.022, flare=0.012, rows=14, n=36))
    # High upturned crimson-lined collar with gold trim, open in front
    col_p = P('crimson', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'slateblue')])
    parts_t.append(collar(gid_t + '_collar', col_p, h=0.085, flare=0.045, open_front=0.85, rows=7, n=30))
    # Layered gold coin medallion & tooth pendant on the open chest
    med_pos = J('Spine2') - bk * 0.145 + up * 0.055
    parts_t.append(rosette(gid_t + '_medallion', med_pos, -bk, left, 0.028, P('gold', 0.02, fabric='metal.gold'), n=12, thick=0.008, rigid_joint='Spine2'))
    # Embroidered slate-blue sleeves with leather shoulder-tabs & upturned crimson-and-gold cuffs
    sl_p = P('slateblue', 0.05, [
        B('bottom', 0.0, 0.10, 'baroque_scroll', 'cream', 'crimson', 0.08),
        B('top', 0.0, 0.05, 'solid', 'leather'),
    ], [
        PN(0.25, 0.75, 'baroque_scroll', 'cream', 'slateblue', 0.14),
    ])
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_epaulette_{side}', side, P('leather', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), span=0.18, drop=0.12, lift=0.024))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, sl_p, f0=0.0, f1=0.92, ease=0.018, flare=0.016, rows=14, n=24))
    e_t = assemble_garment(gid_t, "Phil's Embroidered Corsair Bolero & Shirt", 'torso', 'izani', parts_t)

    # --- LEGS: iziz_m_phil_trousers ---
    gid_l = 'iziz_m_phil_trousers'
    # Tucked cream canvas pirate breeches
    parts_l = trousers(gid_l, P('cream', 0.05, [B('top', 0.0, 0.06, 'solid', 'slateblue')]), ankle_f=0.68, ease=0.022, bag=0.028, rows=16, n=26)
    # Wide crimson & slate-blue waist sash + brown leather compass-buckle belt
    sash_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'slateblue'),
        B('top', 0.0, 0.05, 'stripes', 'leather', 'gold', 0.03),
    ], fabric='cloth.silk')
    parts_l.append(belt_sash(gid_l + '_sash', J('Hips')[2] - 0.02, J('Hips')[2] + 0.12, sash_p, ease=0.034))
    parts_l.append(rosette(gid_l + '_compass_buckle', J('Hips') - bk * 0.155 + up * 0.05, -bk, left, 0.042, P('brass', 0.02, fabric='metal.bronze'), n=14, thick=0.014, rigid_joint='Hips'))
    # Long fringed crimson-and-gold brocade side-sash hanging down the left thigh
    broc_p = P('crimson', 0.04, [B('bottom', 0.0, 0.06, 'dentils', 'gold', 'crimson', 0.025)], [PN(0.1, 0.9, 'baroque_scroll', 'gold', 'crimson', 0.12)], fabric='cloth.silk')
    parts_l.append(tabard(gid_l + '_sidesash', J('LeftLeg')[2] - 0.06, J('Hips')[2] + 0.04, 0.13, broc_p, ease=0.084, flare=0.055, center_ang=math.pi * 0.72))
    e_l = assemble_garment(gid_l, "Phil's Corsair Sash & Cream Breeches", 'legs', 'izani', parts_l, legged=True)

    # --- FEET: iziz_m_phil_boots ---
    gid_f = 'iziz_m_phil_boots'
    boot_p = P('leather', 0.04, [
        B('top', 0.0, 0.08, 'dentils', 'brass', 'saddle', 0.04),
        B('bottom', 0.0, 0.05, 'solid', 'umber'),
    ], [
        PN(0.35, 0.65, 'stripes', 'saddle', 'brass', 0.04),
    ], fabric='leather.polished')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.05, ease=0.020, rows=16, n=24, cuff=0.016) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, "Phil's Cavalier Knee-Boots", 'feet', 'izani', parts_f)
    return [e_t, e_l, e_f]


# ===============================================================================================================
# 8. Free Clans Axeman + Handlebar Stache Option — "Free Clans Axeman (Ardent Bronze-Medallion Huscarl)"
# ===============================================================================================================
def build_rustic_axeman():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- BEARD OPTION: rustic_m_axeman_stache ---
    gid_b = 'rustic_m_axeman_stache'
    parts_b = []
    stache_p = P('magentapink', 0.05, [B('bottom', 0.0, 0.02, 'stripes', 'magenta', 'magentapink', 0.012)], fabric='fur.short')
    # Sweeping upturned Gallic handlebar moustache wings from philtrum out and curling up past the cheeks
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        m_pts = []
        for t in np.linspace(0.0, 1.0, 10):
            x_off = sgn * (0.004 + 0.115 * t)
            z_off = 0.16 - 0.035 * math.sin(t * math.pi * 0.85) + 0.065 * (t ** 2.2)
            y_off = 0.118 - 0.045 * (t ** 1.4)
            m_pts.append(a + (b - a) * z_off + left * x_off - bk * y_off)
        parts_b.append(horn(f'{gid_b}_wing_{tag}', m_pts, 0.024, 0.004, stache_p, n=10, rows=10, rigid_joint='Head'))
        # Matching flared bushy magenta eyebrows
        b_pts = [a + (b - a) * (0.42 + 0.045 * (t ** 1.3)) + left * (sgn * (0.014 + 0.052 * t)) - bk * (0.114 - 0.024 * t) for t in np.linspace(0, 1, 6)]
        parts_b.append(horn(f'{gid_b}_brow_{tag}', b_pts, 0.012, 0.004, stache_p, n=8, rows=6, rigid_joint='Head'))
    e_b = assemble_garment(gid_b, 'Free Clans Handlebar Stache & Brows', 'beard', 'rustic_clansmen', parts_b)

    # --- TORSO: rustic_m_axeman_tunic ---
    gid_t = 'rustic_m_axeman_tunic'
    parts_t = []
    # Crossed dark charcoal, ochre & magenta-crimson surcoat with layered asymmetrical scrolled skirt panels
    surcoat_p = P('magenta', 0.05, [
        B('bottom', 0.0, 0.06, 'fret', 'gold', 'magenta', 0.045),
        B('top', 0.0, 0.05, 'chevrons', 'gold', 'soot', 0.04),
    ], [
        PN(0.0, 0.44, 'baroque_scroll', 'repochre', 'magenta', 0.18),
        PN(0.44, 0.56, 'diamond_quilt', 'repochre', 'umber', 0.12),
        PN(0.56, 1.0, 'baroque_scroll', 'repgrey', 'soot', 0.16),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_surcoat', J('LeftLeg')[2] + 0.02, J('Neck')[2] + 0.01, surcoat_p, ease=0.026, flare=0.10, rows=22, n=40))
    parts_t.append(collar(gid_t + '_collar', P('magenta', 0.04, [B('top', 0.0, 0.02, 'solid', 'gold')]), h=0.065, flare=0.02, open_front=0.35, rows=6, n=28))
    # Large embossed Ardent bronze clan-medallion on the left chest + right shoulder strap
    med_pos = J('Spine2') + left * 0.075 - bk * 0.155 + up * 0.045
    parts_t.append(rosette(gid_t + '_clan_disc', med_pos, -bk, left, 0.062, P('bronze', 0.02, fabric='metal.bronze'), n=16, thick=0.016, rigid_joint='Spine2'))
    # Shoulder coverage: magenta-trimmed cap on Right shoulder, patterned short sleeve on Left shoulder, plus fur-trimmed leather bracers on both forearms
    parts_t.append(pauldron(gid_t + '_sh_Right', 'Right', P('soot', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'magenta')]), span=0.16, drop=0.11, lift=0.018))
    parts_t.append(pauldron(gid_t + '_sh_Left', 'Left', P('magenta', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'gold')]), span=0.18, drop=0.13, lift=0.020))
    parts_t.append(sleeve(gid_t + '_short_Left', 'Left', P('soot', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'repgrey')], [PN(0.0, 1.0, 'baroque_scroll', 'repgrey', 'soot', 0.12)]), f0=0.0, f1=0.42, ease=0.024, flare=0.012, rows=8, n=22))
    parts_t.append(sleeve(gid_t + '_bicep_Right', 'Right', P('magenta', 0.05, fabric='fur.short'), f0=0.28, f1=0.44, ease=0.022, flare=0.005, rows=6, n=20))
    bracer_p = P('leather', 0.04, [B('top', 0.0, 0.06, 'solid', 'magentapink'), B('bottom', 0.0, 0.03, 'solid', 'bronze')], fabric='leather.polished')
    for side in ('Left', 'Right'):
        parts_t.append(sleeve(f'{gid_t}_bracer_{side}', side, bracer_p, f0=0.46, f1=0.92, ease=0.022, flare=0.005, rows=9, n=22))
    # Thick magenta-fur waist-rolls flanking a wide leather belt
    belt_p = P('leather', 0.04, [
        B('top', 0.0, 0.04, 'solid', 'magentapink'),
        B('bottom', 0.0, 0.04, 'solid', 'magentapink'),
    ], fabric='fur.short')
    parts_t.append(belt_sash(gid_t + '_furbelt', J('Hips')[2] + 0.01, J('Hips')[2] + 0.14, belt_p, ease=0.042))
    e_t = assemble_garment(gid_t, 'Free Clans Axeman Bronze-Disc Surcoat', 'torso', 'rustic_clansmen', parts_t)

    # --- LEGS: rustic_m_axeman_trousers ---
    gid_l = 'rustic_m_axeman_trousers'
    parts_l = trousers(gid_l, P('heather', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'magentapink')], [PN(0.0, 1.0, 'stripes', 'umber', 'heather', 0.045)]),
                       ankle_f=0.76, ease=0.028, bag=0.044, rows=16, n=26)
    e_l = assemble_garment(gid_l, 'Free Clans Axeman Striped Braccae', 'legs', 'rustic_clansmen', parts_l, legged=True)

    # --- FEET: rustic_m_axeman_boots ---
    gid_f = 'rustic_m_axeman_boots'
    boot_p = P('umber', 0.04, [
        B('top', 0.0, 0.08, 'solid', 'magentapink'),
        B('bottom', 0.0, 0.06, 'solid', 'soot'),
    ], [
        PN(0.20, 0.80, 'chevrons', 'magenta', 'bronze', 0.05),
    ], fabric='leather.polished')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.14, ease=0.018, rows=15, n=24, cuff=0.018) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Free Clans Axeman Fur-Cuffed Boots', 'feet', 'rustic_clansmen', parts_f)
    return [e_b, e_t, e_l, e_f]


# ===============================================================================================================
# 9. Eternal State Arch-Minister — "Hologram-Crowned Arch-Minister" (Sheet 1, Row 1)
# ===============================================================================================================
def build_eternian_minister():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: eternian_m_minister_halo ---
    gid_h = 'eternian_m_minister_halo'
    parts_h = []
    # Ornate black-and-gold bureaucratic court crown diadem (leaving the painted face exposed!)
    diadem_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.025, 'fret', 'gold', 'soot', 0.03),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.38, 0.62, 'eternian_icons', 'gold', 'soot', 0.08),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_diadem', 0.56, 0.84, diadem_p, bulge=0.012, ease=0.016, rows=6, n=32))
    # Glowing cyan ancestral projection bust & concentric ring halo floating above the crown
    proj_ctr = a + (b - a) * 1.26
    parts_h.append(blob(gid_h + '_ancestor_bust', proj_ctr - bk * 0.018, (0.065, 0.075, 0.105), P('cybercyan', 0.02, [B('top', 0.0, 0.03, 'solid', 'white')], fabric='beads.glass'), n=14, rows=7, out=-bk, rigid_joint='Head'))
    parts_h.append(rosette(gid_h + '_halo_ring', proj_ctr + bk * 0.015, -bk, left, 0.115, P('sky', 0.02, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='beads.glass'), n=18, thick=0.008, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Eternal State Arch-Minister Ancestral Halo & Crown', 'head', 'eternian', parts_h, covers_hair=False, covers_face=False)

    # --- TORSO: eternian_m_minister_robe ---
    gid_t = 'eternian_m_minister_robe'
    parts_t = []
    robe_p = P('soot', 0.04, [
        B('bottom', 0.0, 0.08, 'fret', 'gold', 'soot', 0.05),
        B('top', 0.0, 0.05, 'solid', 'gold'),
    ], [
        PN(0.42, 0.58, 'eternian_icons', 'soot', 'cream', 0.24),
        PN(0.90, 1.00, 'eternian_icons', 'gold', 'soot', 0.24),
        PN(0.00, 0.10, 'eternian_icons', 'gold', 'soot', 0.24),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.06, J('Neck')[2] + 0.01, robe_p, ease=0.026, flare=0.14, rows=26, n=44))
    # Wide Art-Deco winged bronze shoulder collar & wide court sleeves
    deco_p = P('gold', 0.02, [B('bottom', 0.0, 0.04, 'fret', 'soot', 'gold', 0.035)], fabric='metal.gold')
    parts_t.append(collar(gid_t + '_collar', deco_p, h=0.08, flare=0.055, open_front=0.0, rows=7, n=32))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_wing_{side}', side, deco_p, span=0.25, drop=0.14, lift=0.038))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, robe_p, f0=0.0, f1=0.92, ease=0.028, flare=0.055, rows=14, n=26))
    e_t = assemble_garment(gid_t, 'Eternal State Arch-Minister Logograph Court Robe', 'torso', 'eternian', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 10. Eternal State Circuit-Maze Censor — "Circuit-Maze Censor & Examiner" (Sheet 1, Rows 2 & 3)
# ===============================================================================================================
def build_eternian_censor():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: eternian_m_censor_crown ---
    gid_h = 'eternian_m_censor_crown'
    parts_h = []
    # Courtly headband & round dark-tinted examiner spectacles (leaving the rank-painted face exposed!)
    parts_h.append(crown_band(gid_h + '_headband', 0.58, 0.78, P('soot', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold'), B('top', 0.0, 0.02, 'solid', 'gold')]), bulge=0.008, ease=0.014, rows=5, n=30))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        spec_pos = a + (b - a) * 0.39 + left * (sgn * 0.034) - bk * 0.140
        parts_h.append(rosette(f'{gid_h}_spectacle_{tag}', spec_pos, -bk, left, 0.022, P('soot', 0.02, [B('top', 0.0, 0.01, 'solid', 'gold')], fabric='beads.glass'), n=12, thick=0.008, rigid_joint='Head'))
    # Standing bronze oculus-disc halo behind the head with hanging rank chime-tablets
    halo_ctr = a + (b - a) * 0.62 + bk * 0.05
    parts_h.append(rosette(gid_h + '_oculus_halo', halo_ctr, -bk, left, 0.22, P('gold', 0.02, [B('top', 0.0, 0.04, 'fret', 'soot', 'gold', 0.04)], fabric='metal.gold'), n=24, thick=0.012, rigid_joint='Head'))
    for k, x_off in enumerate((-0.18, -0.12, -0.06, 0.06, 0.12, 0.18)):
        t_pos = a + (b - a) * 0.88 + left * x_off + bk * 0.03
        parts_h.append(tassel(f'{gid_h}_tablet_{k}', t_pos, 0.09, 0.012, P('indigo', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'gold')]), rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Eternal State Censor Oculus-Halo & Spectacles', 'head', 'eternian', parts_h, covers_hair=False, covers_face=False)

    # --- TORSO: eternian_m_censor_robe ---
    gid_t = 'eternian_m_censor_robe'
    parts_t = []
    robe_p = P('cobalt', 0.04, [
        B('bottom', 0.0, 0.08, 'circuit_schematic', 'gold', 'indigo', 0.12),
        B('top', 0.0, 0.05, 'solid', 'gold'),
    ], [
        PN(0.12, 0.38, 'circuit_schematic', 'cream', 'soot', 0.16),
        PN(0.62, 0.88, 'circuit_schematic', 'cream', 'soot', 0.16),
        PN(0.42, 0.58, 'eternian_icons', 'gold', 'cobalt', 0.22),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.06, J('Neck')[2] + 0.01, robe_p, ease=0.026, flare=0.14, rows=26, n=44))
    parts_t.append(collar(gid_t + '_collar', P('gold', 0.02, [B('bottom', 0.0, 0.03, 'circuit_schematic', 'soot', 'cream', 0.06)]), h=0.075, flare=0.05, open_front=0.0, rows=6, n=32))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_yoke_{side}', side, robe_p, span=0.22, drop=0.14, lift=0.022))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, robe_p, f0=0.0, f1=0.92, ease=0.028, flare=0.06, rows=14, n=26))
    e_t = assemble_garment(gid_t, 'Eternal State Circuit-Maze Censor Robe', 'torso', 'eternian', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 11. Eternal State Torus-Collar Prefect — "Torus-Collar Prefect" (Sheet 2, Row 2)
# ===============================================================================================================
def build_eternian_prefect():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: eternian_m_prefect_cap ---
    gid_h = 'eternian_m_prefect_cap'
    parts_h = []
    # Courtly black-and-gold guan topknot cap with transverse golden hairpin (leaving the rank-painted face exposed!)
    cap_p = P('soot', 0.04, [
        B('bottom', 0.0, 0.025, 'fret', 'gold', 'soot', 0.025),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], fabric='cloth.silk')
    parts_h.append(crown_band(gid_h + '_band', 0.58, 0.78, cap_p, bulge=0.008, ease=0.012, rows=5, n=28))
    parts_h.append(crown_band(gid_h + '_topknot', 0.78, 1.18, cap_p, bulge=0.010, ease=-0.032, rows=6, n=24))
    pin_pts = [a + (b - a) * 0.96 + left * x_p for x_p in np.linspace(-0.11, 0.11, 5)]
    parts_h.append(tube(gid_h + '_hairpin', pin_pts, 0.007, P('gold', 0.02, fabric='metal.gold'), n=8, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Eternal State Prefect Guan Topknot Cap', 'head', 'eternian', parts_h, covers_hair=False, covers_face=False)

    # --- TORSO: eternian_m_prefect_robe ---
    gid_t = 'eternian_m_prefect_robe'
    parts_t = []
    robe_p = P('teal', 0.04, [
        B('bottom', 0.0, 0.08, 'fret', 'gold', 'deepsea', 0.05),
        B('top', 0.0, 0.05, 'solid', 'gold'),
    ], [
        PN(0.18, 0.38, 'eternian_icons', 'gold', 'deepsea', 0.18),
        PN(0.62, 0.82, 'eternian_icons', 'gold', 'deepsea', 0.18),
        PN(0.42, 0.58, 'stripes', 'cream', 'madder', 0.04),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.08, J('Neck')[2] + 0.01, robe_p, ease=0.028, flare=0.14, rows=26, n=44))
    # Massive padded teal-and-gold torus collar encircling the shoulders and neck
    torus_p = P('teal', 0.04, [B('top', 0.0, 0.04, 'baroque_scroll', 'gold', 'teal', 0.08), B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='cloth.quilted')
    parts_t.append(neck_ring(gid_t + '_torus_collar', torus_p, r_tube=0.068, drop=0.01, n=32, nr=14))
    for side in ('Left', 'Right'):
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, robe_p, f0=0.0, f1=0.88, ease=0.032, flare=0.045, rows=14, n=26))
    e_t = assemble_garment(gid_t, 'Eternal State Prefect Torus-Collar Robe', 'torso', 'eternian', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 12. Eternal State Vermilion Grand Archivist — "Vermilion Mortarboard Grand Archivist" (Sheet 2, Row 5)
# ===============================================================================================================
def build_eternian_archivist():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: eternian_m_archivist_hat ---
    gid_h = 'eternian_m_archivist_hat'
    parts_h = []
    # Vermilion-and-gold silk under-cap + sculpted 3D white porcelain closed-eye mask with black merit/demerit markings
    parts_h.append(sculpted_cranium(gid_h + '_undercap', P('repred', 0.04, [B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='cloth.silk'), f_top=0.96, f_bot=-0.04, ease=0.008))
    face_p = P('porcelain', 0.02, [
        B('top', 0.0, 0.03, 'solid', 'gold'),
        B('bottom', 0.0, 0.02, 'solid', 'repred'),
    ], [
        PN(0.36, 0.64, 'eternian_icons', 'soot', 'porcelain', 0.14),
    ], fabric='shell.nacre')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', face_p, f_top=0.74, f_bot=-0.05, ease=0.013, jaw_narrow=0.38))
    # Wide trapezoidal vermilion-and-gold mortarboard crown (top-to-bottom row order!) with hanging side tassels
    hat_p = P('repred', 0.04, [
        B('bottom', 0.0, 0.04, 'fret', 'gold', 'repred', 0.04),
        B('top', 0.0, 0.04, 'circuit_schematic', 'gold', 'repred', 0.08),
    ], fabric='cloth.silk')
    angs_m = np.linspace(0, 2 * math.pi, 32, endpoint=False)
    board_rows = []
    for f, rx_b, ry_b in ((1.06, 0.04, 0.04), (1.02, 0.28, 0.16), (0.85, 0.24, 0.15), (0.68, 0.115, 0.145)):
        c = a + (b - a) * f
        board_rows.append([c + left * (math.sin(an) * rx_b) + bk * (math.cos(an) * ry_b) for an in angs_m])
    parts_h.append(Part(gid_h + '_mortarboard', np.array(board_rows), True, ['body'] * len(board_rows), hat_p, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'L'), (1.0, 'R')):
        parts_h.append(tassel(f'{gid_h}_tassel_{tag}', a + (b - a) * 0.85 + left * (sgn * 0.22), 0.10, 0.014, P('cream', 0.03, [B('top', 0.0, 0.02, 'solid', 'gold')]), rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Eternal State Archivist Mortarboard & Mask', 'head', 'eternian', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: eternian_m_archivist_robe ---
    gid_t = 'eternian_m_archivist_robe'
    parts_t = []
    robe_p = P('repred', 0.04, [
        B('bottom', 0.0, 0.08, 'fret', 'gold', 'cream', 0.05),
        B('top', 0.0, 0.05, 'solid', 'gold'),
    ], [
        PN(0.42, 0.58, 'eternian_icons', 'repred', 'cream', 0.22),
        PN(0.88, 1.00, 'circuit_schematic', 'repred', 'cream', 0.18),
        PN(0.00, 0.12, 'circuit_schematic', 'repred', 'cream', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.06, J('Neck')[2] + 0.01, robe_p, ease=0.028, flare=0.14, rows=26, n=44))
    parts_t.append(collar(gid_t + '_collar', P('repred', 0.03, [B('top', 0.0, 0.03, 'fret', 'gold', 'repred', 0.035)]), h=0.085, flare=0.055, open_front=0.0, rows=7, n=32))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_yoke_{side}', side, robe_p, span=0.22, drop=0.14, lift=0.022))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, robe_p, f0=0.0, f1=0.92, ease=0.030, flare=0.065, rows=14, n=26))
    e_t = assemble_garment(gid_t, 'Eternal State Vermilion Archivist Court Robe', 'torso', 'eternian', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 13. Eternal State Sanctum Porcelain Cuirassier — "Wardens' Porcelain Relic-Guard" (Concept Outfit 2)
# ===============================================================================================================
def build_eternian_warden():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: eternian_m_warden_mitre ---
    gid_h = 'eternian_m_warden_mitre'
    parts_h = []
    # Sculpted 3D white porcelain mask behind a high-rimmed celadon-blue porcelain gorget-bevor
    parts_h.append(sculpted_cranium(gid_h + '_casque', P('lacrose', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'gold')], fabric='metal.gold'), f_top=0.94, f_bot=0.05, ease=0.008))
    mask_p = P('porcelain', 0.02, [
        B('top', 0.0, 0.03, 'solid', 'gold'),
    ], [
        PN(0.18, 0.82, 'ancient_visor', 'porcelain', 'soot', 0.14),
    ], fabric='shell.nacre')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.72, f_bot=0.02, ease=0.013, jaw_narrow=0.36))
    # Tall scalloped gilt-and-rose mitre with wide behind-head fan nimbus & ruby apex gem (top-to-bottom row order!)
    mitre_p = P('lacrose', 0.03, [
        B('top', 0.0, 0.06, 'dentils', 'gold', 'lacrose', 0.025),
        B('bottom', 0.0, 0.05, 'baroque_scroll', 'gold', 'lacrose', 0.06),
    ], [
        PN(0.25, 0.75, 'baroque_scroll', 'gold', 'lacrose', 0.14),
    ], fabric='metal.gold')
    angs_m = np.linspace(0, 2 * math.pi, 32, endpoint=False)
    fan_rows = []
    for f, rx_f, ry_f in ((1.72, 0.03, 0.03), (1.68, 0.18, 0.10), (1.52, 0.22, 0.135), (1.05, 0.155, 0.145), (0.62, 0.115, 0.145)):
        c = a + (b - a) * f
        fan_rows.append([c + left * (math.sin(an) * rx_f) + bk * (math.cos(an) * ry_f + 0.02 * max(0.0, f - 0.65)) for an in angs_m])
    parts_h.append(Part(gid_h + '_mitre', np.array(fan_rows), True, ['body'] * len(fan_rows), mitre_p, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Sanctum Porcelain Cuirassier Fan-Mitre', 'head', 'eternian', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: eternian_m_warden_cuirass ---
    gid_t = 'eternian_m_warden_cuirass'
    parts_t = []
    porc_p = P('porcelainblue', 0.02, [
        B('bottom', 0.0, 0.05, 'baroque_scroll', 'gold', 'porcelainblue', 0.08),
        B('top', 0.0, 0.05, 'solid', 'gold'),
    ], [
        PN(0.28, 0.72, 'baroque_scroll', 'gold', 'porcelainblue', 0.16),
    ], fabric='shell.nacre')
    # High-gorgeted porcelain breastplate & crimson-gold embroidered groin-tasset + cuisses
    parts_t.append(torso_tube(gid_t + '_cuirass', J('Hips')[2] - 0.02, J('Neck')[2] + 0.02, porc_p, ease=0.026, flare=0.03, rows=16, n=36))
    parts_t.append(collar(gid_t + '_bevor', porc_p, h=0.12, flare=0.045, open_front=0.0, rows=8, n=32))
    # Pointed rose-and-gold embroidered front tasset between celadon-blue porcelain thigh cuisses
    tasset_p = P('lacrose', 0.03, [B('bottom', 0.0, 0.05, 'solid', 'gold')], [PN(0.15, 0.85, 'baroque_scroll', 'gold', 'crimson', 0.14)], fabric='cloth.silk')
    parts_t.append(skirt(gid_t + '_cuisses', J('LeftLeg')[2] + 0.06, J('Hips')[2] + 0.04, porc_p, ease=0.030, flare=0.06, rows=12, n=36))
    parts_t.append(tabard(gid_t + '_tasset', J('LeftLeg')[2] + 0.06, J('Hips')[2] + 0.04, 0.14, tasset_p, front=True, back=True, ease=0.038, flare=0.02))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, porc_p, span=0.22, drop=0.16, lift=0.026))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, P('crimson', 0.04), f1=0.92, ease=0.016, flare=0.008, rows=12, n=22))
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, porc_p, f0=0.45, f1=0.92, ease=0.024, flare=0.005, rows=9, n=22))
    e_t = assemble_garment(gid_t, 'Sanctum Porcelain Cuirass & High Bevor', 'torso', 'eternian', parts_t)

    # --- FEET: eternian_m_warden_greaves ---
    gid_f = 'eternian_m_warden_greaves'
    gr_p = P('porcelainblue', 0.02, [
        B('top', 0.0, 0.10, 'solid', 'lacrose'),
        B('bottom', 0.0, 0.06, 'solid', 'umber'),
    ], [
        PN(0.25, 0.75, 'baroque_scroll', 'gold', 'porcelainblue', 0.12),
    ], fabric='shell.nacre')
    parts_f = [boot(f'{gid_f}_{s}', s, gr_p, top_f=0.06, ease=0.020, rows=16, n=24, cuff=0.018) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Sanctum Porcelain Greaves & Sabatons', 'feet', 'eternian', parts_f)
    return [e_h, e_t, e_f]


# ===============================================================================================================
# 14. Iron Republic Line-Commissar & Salvage Inspector (Concept Outfit 3)
# ===============================================================================================================
def build_rep_commissar():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: rep_m_commissar_cap ---
    gid_h = 'rep_m_commissar_cap'
    parts_h = []
    cap_p = P('repgreyd', 0.04, [
        B('bottom', 0.0, 0.035, 'solid', 'soot'),
        B('top', 0.0, 0.03, 'solid', 'copper'),
    ], [
        PN(0.42, 0.58, 'baroque_scroll', 'copper', 'repgreyd', 0.08),
    ], fabric='cloth.wool')
    # Snug, properly proportioned peaked officer's cap contoured to the skull via raycast!
    angs_c = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    c_top = a + (b - a) * 0.90
    base_ring = np.array(bio.ring_points(a + (b - a) * 0.58, bk, left, angs_c, 0.008, rmin=0.075, rmax=0.115, bvh=bio.BVH))
    mid_ring = np.array(bio.ring_points(a + (b - a) * 0.72, bk, left, angs_c, 0.012, rmin=0.078, rmax=0.118, bvh=bio.BVH))
    top_ring = np.array([
        c_top + left * (math.sin(an) * 0.098) + bk * (math.cos(an) * 0.122 - 0.010)
        for an in angs_c
    ])
    apex_ring = np.array([c_top + up * 0.004 + (q - c_top) * 0.04 for q in top_ring])
    under_ring = np.array(bio.ring_points(a + (b - a) * 0.56, bk, left, angs_c, 0.002, rmin=0.070, rmax=0.105, bvh=bio.BVH))
    cap_rows = [apex_ring, top_ring, mid_ring, base_ring, under_ring]
    parts_h.append(Part(gid_h + '_crown', np.array(cap_rows), True, ['body'] * len(cap_rows), cap_p, rigid_joint='Head'))
    # Crisp dark-iron & brass front visor peak
    v_angs = np.linspace(0.72 * math.pi, 1.28 * math.pi, 18)
    v_base = np.array(bio.ring_points(a + (b - a) * 0.58, bk, left, v_angs, 0.008, rmin=0.075, rmax=0.115, bvh=bio.BVH))
    v_tip = np.array([
        q - bk * (0.042 * math.cos((an - math.pi) * 1.6)) - up * 0.012
        for q, an in zip(v_base, v_angs)
    ])
    v_under = np.array([q - up * 0.004 for q in v_base])
    parts_h.append(Part(gid_h + '_visor', np.array([v_base, v_tip, v_under]), False, ['body'] * 3, P('soot', 0.02, [B('bottom', 0.0, 0.015, 'solid', 'copper')], fabric='leather.polished'), rigid_joint='Head'))
    # Asymmetric red cybernetic optical monocle & brass temple mount over the right eye
    eye_p = a + (b - a) * 0.39 - left * 0.034 - bk * 0.132
    parts_h.append(rosette(f'{gid_h}_optic_R', eye_p, -bk, left, 0.020, P('repred', 0.02, [B('top', 0.0, 0.01, 'solid', 'brass')], fabric='beads.glass'), n=12, thick=0.012, rigid_joint='Head'))
    parts_h.append(strap(f'{gid_h}_optic_arm', [eye_p - left * 0.018, a + (b - a) * 0.42 - left * 0.092 - bk * 0.02], 0.008, P('brass', 0.02, fabric='metal.bronze'), rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Republic Salvage-Commissar Cap & Optic', 'head', 'iron_republic', parts_h, covers_hair=True)

    # --- TORSO: rep_m_commissar_coat ---
    gid_t = 'rep_m_commissar_coat'
    parts_t = []
    coat_p = P('repgreyd', 0.05, [
        B('bottom', 0.0, 0.14, 'baroque_scroll', 'copper', 'repgreyd', 0.14),
        B('top', 0.0, 0.05, 'fret', 'copper', 'repgreyd', 0.04),
    ], [
        PN(0.38, 0.62, 'circuit_schematic', 'copper', 'repgreyd', 0.18),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_greatcoat', J('LeftFoot')[2] + 0.18, J('Neck')[2] + 0.01, coat_p, ease=0.028, flare=0.11, rows=24, n=42))
    parts_t.append(collar(gid_t + '_highcollar', coat_p, h=0.095, flare=0.025, open_front=0.0, rows=7, n=30))
    # Chest-mounted Ancient diagnostic box flush on the chest
    box_pos = J('Spine2') - bk * 0.142 + up * 0.03
    parts_t.append(blob(gid_t + '_diagbox', box_pos, (0.048, 0.022, 0.072), P('iron', 0.02, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='metal.iron'), n=12, rows=6, out=-bk))
    for side in ('Left', 'Right'):
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, coat_p, f0=0.0, f1=0.92, ease=0.026, flare=0.014, rows=14, n=24))
    e_t = assemble_garment(gid_t, 'Republic Salvage-Commissar Greatcoat', 'torso', 'iron_republic', parts_t)

    # --- BACK: rep_m_commissar_pack (Structured leather & riveted-iron field backpack with bedroll, side battery & shoulder harness) ---
    gid_k = 'rep_m_commissar_pack'
    parts_k = []
    sp1 = J('Spine1')
    sp2 = J('Spine2')
    pack_ctr = 0.5 * (sp1 + sp2) + bk * 0.175 + up * 0.02
    pack_p = P('umber', 0.04, [
        B('top', 0.0, 0.06, 'fret', 'brass', 'umber', 0.04),
        B('bottom', 0.0, 0.05, 'solid', 'iron'),
    ], [
        PN(0.18, 0.30, 'stripes', 'brass', 'leather', 0.03),
        PN(0.70, 0.82, 'stripes', 'brass', 'leather', 0.03),
        PN(0.35, 0.65, 'circuit_schematic', 'copper', 'iron', 0.14),
    ], fabric='leather.polished')
    # Structured rectangular/chamfered haversack box (width=0.25m, depth=0.11m, height=0.31m)
    angs_pk = np.linspace(0, 2 * math.pi, 24, endpoint=False)
    pk_rows = []
    for z_f, sc_xy in ((0.155, 0.08), (0.150, 0.94), (0.08, 1.0), (-0.08, 1.0), (-0.150, 0.94), (-0.155, 0.08)):
        row_p = []
        for an in angs_pk:
            cs, sn = math.cos(an), math.sin(an)
            # Squircle cross-section for a boxed haversack silhouette
            sq_x = np.sign(sn) * (abs(sn) ** 0.55) * 0.125 * sc_xy
            sq_y = np.sign(cs) * (abs(cs) ** 0.55) * 0.058 * sc_xy
            row_p.append(pack_ctr + left * sq_x + bk * sq_y + up * z_f)
        pk_rows.append(row_p)
    parts_k.append(Part(gid_k + '_main_box', np.array(pk_rows), True, ['body'] * len(pk_rows), pack_p, rigid_joint='Spine2'))
    # Lower horizontal canvas bedroll strapped under the backpack
    roll_pts = [pack_ctr - up * 0.175 + left * x_r for x_r in np.linspace(-0.135, 0.135, 7)]
    parts_k.append(horn(gid_k + '_bedroll', roll_pts, 0.042, 0.042, P('drab', 0.05, [B('top', 0.0, 0.04, 'solid', 'leather'), B('bottom', 0.0, 0.04, 'solid', 'leather')]), n=12, rows=7, rigid_joint='Spine2'))
    # Side brass & iron salvage-capacitor cylinder + vertical brass telemetry antenna mast on the left side of the pack
    cyl_pts = [pack_ctr + left * 0.142 + up * z_c for z_c in np.linspace(-0.10, 0.12, 6)]
    parts_k.append(horn(gid_k + '_side_cell', cyl_pts, 0.032, 0.030, P('iron', 0.02, [B('top', 0.0, 0.03, 'solid', 'copper'), B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='metal.iron'), n=10, rows=6, rigid_joint='Spine2'))
    ant_pts = [pack_ctr + left * 0.142 + up * (0.12 + 0.24 * t) for t in np.linspace(0, 1, 5)]
    parts_k.append(horn(gid_k + '_antenna', ant_pts, 0.008, 0.003, P('brass', 0.02, fabric='metal.bronze'), n=8, rows=5, rigid_joint='Spine2'))
    # Contoured leather shoulder harness straps wrapping cleanly over the outside of the coat shoulders
    x_ax, y_ax = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    strap_p = P('leather', 0.04, [B('top', 0.0, 0.02, 'solid', 'brass'), B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='leather.polished')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        s_rows = []
        for ang_s, z_s in (
            (sgn * 0.32, sp2[2] + 0.09),
            (sgn * 0.55, sp2[2] + 0.13),
            (math.pi - sgn * 0.55, sp2[2] + 0.12),
            (math.pi - sgn * 0.48, sp2[2] + 0.03),
            (math.pi - sgn * 0.52, sp1[2] - 0.02),
            (sgn * 0.42, sp1[2] - 0.03),
        ):
            angs_w = np.linspace(ang_s - 0.08, ang_s + 0.08, 4)
            s_rows.append(bio.ring_points(bio.spine_at(z_s), x_ax, y_ax, angs_w, 0.036, rmin=0.09, rmax=0.25, bvh=bio.BVH_T))
        parts_k.append(Part(f'{gid_k}_harness_{tag}', np.array(s_rows), False, ['body'] * len(s_rows), strap_p))
    e_k = assemble_garment(gid_k, 'Republic Commissar Field Telemetry Backpack', 'back', 'iron_republic', parts_k)

    # --- FEET: rep_m_commissar_boots ---
    gid_f = 'rep_m_commissar_boots'
    boot_p = P('terracotta', 0.03, [
        B('top', 0.0, 0.08, 'solid', 'silver'),
        B('bottom', 0.0, 0.05, 'solid', 'iron'),
    ], [
        PN(0.30, 0.70, 'stripes', 'terracotta', 'silver', 0.035),
    ], fabric='leather.polished')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.22, ease=0.022, rows=14, n=24, cuff=0.014) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Republic Commissar Insulated Red Boots', 'feet', 'iron_republic', parts_f)
    return [e_h, e_t, e_k, e_f]


# ===============================================================================================================
# 15. Voth / Zeijani Dhelv Scripture-Cantor — "Inscribed-Skull Archon" (Concept Outfit 4)
# ===============================================================================================================
def build_voth_cantor():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: voth_m_cantor_head ---
    gid_h = 'voth_m_cantor_head'
    parts_h = []
    # Concentric gold-and-crimson liturgical skull-crown diadem + pointed Chichani ears & long rectangular gold-filigree ear-bars (leaving the painted face exposed!)
    diadem_p = P('gold', 0.02, [
        B('top', 0.0, 0.04, 'fret', 'umber', 'gold', 0.03),
        B('bottom', 0.0, 0.03, 'solid', 'crimson'),
    ], [
        PN(0.45, 0.55, 'stripes', 'crimson', 'gold', 0.02),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_liturgy_crown', 0.62, 0.94, diadem_p, bulge=0.008, ease=0.012, rows=6, n=32))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ep = [a + (b - a) * (0.34 + 0.06 * t) + left * (sgn * (0.100 + 0.062 * t)) + bk * (0.01 + 0.02 * t) for t in np.linspace(0, 1, 5)]
        parts_h.append(horn(f'{gid_h}_ear_{tag}', ep, 0.020, 0.003, P('gold', 0.02, fabric='metal.gold'), n=8, rows=5, rigid_joint='Head'))
        bar_top = a + (b - a) * 0.24 + left * (sgn * 0.112) - bk * 0.01
        parts_h.append(tassel(f'{gid_h}_earbar_{tag}', bar_top, 0.14, 0.014, P('gold', 0.02, [B('top', 0.0, 0.14, 'fret', 'umber', 'gold', 0.025)], fabric='metal.gold'), rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Dhelv Scripture-Cantor Liturgy Crown & Ear-Bars', 'head', 'chichani', parts_h, covers_hair=False, covers_face=False)

    # --- TORSO: voth_m_cantor_gorget ---
    gid_t = 'voth_m_cantor_gorget'
    parts_t = []
    robe_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.08, 'fret', 'gold', 'maroon', 0.045),
        B('top', 0.0, 0.16, 'lorica_lames', 'gold', 'silver', 0.05),
    ], [
        PN(0.35, 0.65, 'voth_glyphs', 'gold', 'crimson', 0.22),
    ], fabric='cloth.velvet')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.08, J('Neck')[2] + 0.01, robe_p, ease=0.024, flare=0.13, rows=24, n=42))
    parts_t.append(collar(gid_t + '_collar', P('crimson', 0.04, [B('top', 0.0, 0.04, 'fret', 'gold', 'crimson', 0.03)]), h=0.095, flare=0.02, open_front=0.0, rows=7, n=30))
    # Three large embossed silver-gilt triangle-sigil chest medallions hanging from the crescent gorget
    for x_off, z_off, tag in ((-0.095, 0.05, 'R'), (0.0, 0.01, 'C'), (0.095, 0.05, 'L')):
        m_pos = J('Spine2') + left * x_off - bk * 0.158 + up * z_off
        parts_t.append(rosette(f'{gid_t}_med_{tag}', m_pos, -bk, left, 0.048, P('gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'silver')], fabric='metal.gold'), n=14, thick=0.014, rigid_joint='Spine2'))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, P('gold', 0.02, fabric='metal.gold'), span=0.20, drop=0.15, lift=0.022))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, robe_p, f0=0.0, f1=0.92, ease=0.022, flare=0.025, rows=14, n=24))
    e_t = assemble_garment(gid_t, 'Dhelv Scripture-Cantor Medallion Gorget & Robe', 'torso', 'chichani', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 16. Yuni / Farside Vault-Breacher — "Vault-Breacher Hazmat Greatcoat" (Concept Outfit 5)
# ===============================================================================================================
def build_yuni_breacher():
    set_body('mpfb_male')
    _, _, up, bk, left = head_frame()

    # --- HEAD: yuni_m_breacher_collar (Rigid pressurized bowl-collar helmet ring leaving head/face visible inside) ---
    gid_h = 'yuni_m_breacher_collar'
    parts_h = []
    bowl_p = P('teal', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'yuniyellow'),
        B('bottom', 0.0, 0.03, 'dentils', 'repred', 'teal', 0.04),
    ], [
        PN(0.35, 0.65, 'eternian_icons', 'yuniyellow', 'teal', 0.12),
    ], fabric='cloth.oiled')
    parts_h.append(collar(gid_h + '_bowl', bowl_p, h=0.14, flare=0.095, open_front=0.0, rows=9, n=36))
    e_h = assemble_garment(gid_h, 'Yuni Vault-Breacher Pressurized Bowl-Collar', 'head', 'yuni', parts_h, covers_hair=False)

    # --- TORSO: yuni_m_breacher_coat ---
    gid_t = 'yuni_m_breacher_coat'
    parts_t = []
    coat_p = P('teal', 0.04, [
        B('bottom', 0.0, 0.10, 'dentils', 'yuniyellow', 'teal', 0.06),
        B('top', 0.0, 0.06, 'solid', 'yuniyellow'),
    ], [
        PN(0.42, 0.56, 'eternian_icons', 'repred', 'yuniyellow', 0.20),
        PN(0.18, 0.40, 'circuit_schematic', 'yuniyellow', 'teal', 0.18),
        PN(0.60, 0.82, 'circuit_schematic', 'yuniyellow', 'teal', 0.18),
    ], fabric='cloth.oiled')
    c_tube = torso_tube(gid_t + '_coat', J('LeftFoot')[2] + 0.10, J('Neck')[2] + 0.01, coat_p, ease=0.028, flare=0.085, rows=26, n=44)
    c_tube.cloth = None
    parts_t.append(c_tube)
    parts_t.append(crossed_sash(gid_t + '_strap', P('yuniyellow', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'soot')]), width=0.055, ease=0.036))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_rig_{side}', side, P('yuniyellow', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'repred')]), span=0.20, drop=0.14, lift=0.024))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, coat_p, f0=0.0, f1=0.94, ease=0.026, flare=0.018, rows=14, n=26))
    e_t = assemble_garment(gid_t, 'Yuni Vault-Breacher Stencilled Hazmat Greatcoat', 'torso', 'yuni', parts_t)

    # --- FEET: yuni_m_breacher_boots ---
    gid_f = 'yuni_m_breacher_boots'
    boot_p = P('yuniyellow', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'repred'),
        B('top', 0.0, 0.06, 'stripes', 'soot', 'yuniyellow', 0.03),
    ], fabric='leather.polished')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.24, ease=0.022, rows=14, n=24, cuff=0.016) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Yuni Vault-Breacher Heavy Salvage Boots', 'feet', 'yuni', parts_f)
    return [e_h, e_t, e_f]


# ===============================================================================================================
# 17. Yusar Stack-Hierophant — "Stack-Hierophant / Memory-Tower Speaker" (Cyberpunk Quality Pass)
# ===============================================================================================================
def build_yusar_hierophant():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: yusar_m_hierophant_stack ---
    gid_h = 'yusar_m_hierophant_stack'
    parts_h = []
    # Cyberpunk neural-socket diadem + glowing neon-cyan / amber LED visor + towering blade-server monolith stack
    stack_p = P('soot', 0.02, [
        B('top', 0.0, 0.06, 'stripes', 'cybercyan', 'soot', 0.02),
        B('bottom', 0.0, 0.05, 'stripes', 'amber', 'soot', 0.02),
    ], [
        PN(0.08, 0.92, 'cyber_hex_neon', 'cybercyan', 'soot', 0.14),
    ], fabric='metal.iron')
    parts_h.append(crown_band(gid_h + '_socket_band', 0.56, 0.82, P('soot', 0.02, [B('bottom', 0.0, 0.025, 'solid', 'cybercyan'), B('top', 0.0, 0.025, 'solid', 'amber')], fabric='metal.iron'), bulge=0.012, ease=0.015, rows=5, n=32))
    # Glowing holographic cyan wrap-around data-visor across the eyes
    visor_p = P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'soot'), B('bottom', 0.0, 0.015, 'solid', 'amber')], [PN(0.0, 1.0, 'stripes', 'white', 'cybercyan', 0.018)], fabric='beads.glass')
    parts_h.append(crown_band(gid_h + '_cybervisor', 0.34, 0.50, visor_p, bulge=0.014, ease=0.018, rows=5, n=32))
    angs_m = np.linspace(0, 2 * math.pi, 32, endpoint=False)
    st_rows = []
    for f in np.linspace(2.25, 0.76, 12):
        c = a + (b - a) * f
        rx_s = 0.015 if f > 2.20 else 0.082
        ry_s = 0.015 if f > 2.20 else 0.098
        st_rows.append([c + left * (math.sin(an) * rx_s) + bk * (math.cos(an) * ry_s) for an in angs_m])
    parts_h.append(Part(gid_h + '_server_stack', np.array(st_rows), True, ['body'] * len(st_rows), stack_p, rigid_joint='Head'))
    # Twin glowing cyan & amber fiber-optic neural bus cables looping from the server stack into the temples & nape
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        for z_top, col_c in ((1.22, 'cybercyan'), (0.88, 'amber')):
            c_pts = [
                a + (b - a) * z_top + left * (sgn * 0.078),
                a + (b - a) * (z_top - 0.16) + left * (sgn * 0.155) + bk * 0.02,
                a + (b - a) * 0.36 + left * (sgn * 0.106) + bk * 0.06,
            ]
            parts_h.append(tube(f'{gid_h}_cable_{tag}_{col_c}', c_pts, 0.013, P(col_c, 0.02, [B('top', 0.0, 0.02, 'solid', 'soot')], fabric='beads.glass'), n=8, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Yusar Stack-Hierophant Server Monolith & Visor', 'head', 'yusar', parts_h, covers_hair=True, covers_face=False)

    # --- TORSO: yusar_m_hierophant_robe ---
    gid_t = 'yusar_m_hierophant_robe'
    parts_t = []
    robe_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.10, 'circuit_schematic', 'cybercyan', 'soot', 0.08),
        B('top', 0.0, 0.08, 'circuit_schematic', 'amber', 'cobalt', 0.08),
    ], [
        PN(0.0, 0.30, 'cyber_hex_neon', 'cybercyan', 'cobalt', 0.16),
        PN(0.70, 1.0, 'cyber_hex_neon', 'cybercyan', 'cobalt', 0.16),
        PN(0.30, 0.70, 'circuit_schematic', 'amber', 'soot', 0.14),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.06, J('Neck')[2] + 0.01, robe_p, ease=0.028, flare=0.14, rows=26, n=44))
    parts_t.append(collar(gid_t + '_collar', P('soot', 0.02, [B('top', 0.0, 0.035, 'solid', 'cybercyan'), B('bottom', 0.0, 0.025, 'solid', 'amber')], fabric='metal.iron'), h=0.115, flare=0.048, open_front=0.0, rows=8, n=32))
    # Glowing cyan chest mainframe core & armored server-rack pauldrons
    parts_t.append(rosette(gid_t + '_core_node', J('Spine2') - bk * 0.156 + up * 0.045, -bk, left, 0.052, P('cybercyan', 0.01, [B('top', 0.0, 0.02, 'solid', 'amber')], fabric='beads.glass'), n=16, thick=0.018, rigid_joint='Spine2'))
    # Hanging black & neon-amber fiber-optic ribbon-cables down the front & back of the robe
    parts_t.append(tabard(gid_t + '_ribbons', J('LeftLeg')[2] - 0.05, J('Spine2')[2] + 0.08, 0.15,
                          P('soot', 0.02, [B('bottom', 0.0, 0.05, 'solid', 'cybercyan')], [PN(0.08, 0.92, 'circuit_schematic', 'amber', 'soot', 0.12)], fabric='metal.iron'),
                          front=True, back=True, ease=0.040, flare=0.02))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, stack_p, span=0.22, drop=0.16, lift=0.026))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, robe_p, f0=0.0, f1=0.92, ease=0.030, flare=0.055, rows=14, n=26))
    e_t = assemble_garment(gid_t, 'Yusar Stack-Hierophant Cyber-Matrix Vestment', 'torso', 'yusar', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 18. Yusar Light-Keeper — "Carcosa Light-Keeper (Cyber-Optic Plasma Mystic)" (Cyberpunk Quality Pass)
# ===============================================================================================================
def build_yusar_lightkeeper():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: yusar_m_lightkeeper_turban ---
    gid_h = 'yusar_m_lightkeeper_turban'
    parts_h = []
    # Carbon-black synth-leather under-hood + sculpted asymmetric 4-lens glowing neon-yellow/cyan cyber-optic respirator mask
    parts_h.append(sculpted_cranium(gid_h + '_underwrap', P('soot', 0.02, fabric='metal.iron'), f_top=0.88, f_bot=-0.06, ease=0.008))
    mask_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.03, 'solid', 'cybercyan'),
        B('top', 0.0, 0.025, 'solid', 'neonyellow'),
    ], [
        PN(0.0, 1.0, 'lightkeeper_mask', 'neonyellow', 'soot', 0.20),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_respirator', mask_p, f_top=0.72, f_bot=-0.06, ease=0.014, jaw_narrow=0.36))
    # 3D gunmetal & neon-cyan twin vocoder/filter canisters on the lower jaw
    snout_pos = a + (b - a) * 0.08 - bk * 0.146
    parts_h.append(rosette(gid_h + '_filter_can', snout_pos, -bk, left, 0.032, P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'soot')], fabric='beads.glass'), n=12, thick=0.018, rigid_joint='Head'))
    # Wrapped carbon-hex & circuit-woven turban with glowing plasma-tube bulbs protruding from both temples
    turb_p = P('charcoal', 0.03, [
        B('bottom', 0.0, 0.035, 'solid', 'neonyellow'),
        B('top', 0.0, 0.045, 'circuit_schematic', 'cybercyan', 'soot', 0.06),
    ], [
        PN(0.0, 1.0, 'cyber_hex_neon', 'amber', 'soot', 0.16),
    ], fabric='metal.iron')
    parts_h.append(turban(gid_h + '_turban', 0.46, 1.15, 0.042, turb_p))
    for sgn, tag, col_b in ((-1.0, 'R', 'neonyellow'), (1.0, 'L', 'cybercyan')):
        bulb_pts = [a + (b - a) * (0.86 + 0.18 * t) + left * (sgn * (0.08 + 0.09 * t)) - bk * (0.08 + 0.04 * t) for t in np.linspace(0, 1, 6)]
        parts_h.append(horn(f'{gid_h}_bulb_{tag}', bulb_pts, 0.026, 0.022, P(col_b, 0.01, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='beads.glass'), n=10, rows=6, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Yusar Light-Keeper Plasma-Bulb Cyber-Turban & Mask', 'head', 'yusar', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: yusar_m_lightkeeper_robe ---
    gid_t = 'yusar_m_lightkeeper_robe'
    parts_t = []
    robe_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.08, 'circuit_schematic', 'neonyellow', 'soot', 0.08),
        B('top', 0.0, 0.06, 'dentils', 'cybercyan', 'soot', 0.04),
    ], [
        PN(0.0, 1.0, 'cyber_hex_neon', 'amber', 'charcoal', 0.18),
        PN(0.38, 0.62, 'circuit_schematic', 'cybercyan', 'soot', 0.14),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.08, J('Neck')[2] + 0.01, robe_p, ease=0.026, flare=0.13, rows=24, n=42))
    parts_t.append(crossed_sash(gid_t + '_bandolier', P('soot', 0.02, [B('bottom', 0.0, 0.025, 'solid', 'neonyellow'), B('top', 0.0, 0.025, 'solid', 'cybercyan')], fabric='metal.iron'), width=0.085, ease=0.034))
    # Glowing plasma-tubes mounted on both cyber-pauldrons & armored LED forearm gauntlets
    paul_p = P('soot', 0.02, [B('bottom', 0.0, 0.04, 'solid', 'neonyellow'), B('top', 0.0, 0.04, 'solid', 'cybercyan')], [PN(0.15, 0.85, 'cyber_hex_neon', 'neonyellow', 'soot', 0.14)], fabric='metal.iron')
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, paul_p, span=0.22, drop=0.17, lift=0.025))
        sh_p = J(side + 'Arm')
        b_pts = [sh_p + left * (sgn * (0.04 + 0.04 * t)) + up * (0.04 + 0.075 * t) - bk * 0.02 for t in np.linspace(0, 1, 5)]
        parts_t.append(horn(f'{gid_t}_shbulb_{side}', b_pts, 0.022, 0.020, P('neonyellow', 0.01, fabric='beads.glass'), n=8, rows=5, rigid_joint=side + 'Arm'))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, P('soot', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'cybercyan')]), f0=0.0, f1=0.92, ease=0.018, flare=0.008, rows=12, n=22))
        parts_t.append(sleeve(f'{gid_t}_vambrace_{side}', side, paul_p, f0=0.44, f1=0.92, ease=0.026, flare=0.008, rows=9, n=22))
    parts_t.append(belt_sash(gid_t + '_belt', J('Hips')[2] + 0.01, J('Hips')[2] + 0.12, P('soot', 0.02, [B('bottom', 0.0, 0.035, 'solid', 'neonyellow'), B('top', 0.0, 0.035, 'solid', 'cybercyan')], fabric='metal.iron'), ease=0.038))
    e_t = assemble_garment(gid_t, 'Yusar Light-Keeper Plasma-Tube Cyber-Robe', 'torso', 'yusar', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 19. Yusar Drone-Caller — "Henge Drone-Caller (Multi-Lens Tactical Netrunner)" (Cyberpunk Quality Pass)
# ===============================================================================================================
def build_yusar_dronemaster():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: yusar_m_dronemaster_helm ---
    gid_h = 'yusar_m_dronemaster_helm'
    parts_h = []
    helm_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.04, 'solid', 'cybercyan'),
        B('top', 0.0, 0.04, 'dentils', 'neonmagenta', 'soot', 0.035),
    ], [
        PN(0.10, 0.90, 'cyber_hex_neon', 'cybercyan', 'steel', 0.14),
    ], fabric='metal.iron')
    # Wide horizontal drone-transceiver pod helmet across the eyes & temples + lower cybernetic jaw-respirator
    parts_h.append(sculpted_faceplate(gid_h + '_jawplate', P('soot', 0.02, [B('top', 0.0, 0.03, 'solid', 'cybercyan')], [PN(0.2, 0.8, 'priest_mask', 'cybercyan', 'soot', 0.16)], fabric='metal.iron'), f_top=0.45, f_bot=-0.06, ease=0.013, jaw_narrow=0.38))
    pod_rows = []
    angs_p = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    for f, rx_p, ry_p in ((1.06, 0.03, 0.03), (0.94, 0.135, 0.148), (0.68, 0.245, 0.168), (0.44, 0.235, 0.165), (0.28, 0.115, 0.148)):
        c = a + (b - a) * f
        pod_rows.append([c + left * (math.sin(an) * rx_p) + bk * (math.cos(an) * ry_p - 0.012) for an in angs_p])
    parts_h.append(Part(gid_h + '_podhelm', np.array(pod_rows), True, ['body'] * len(pod_rows), helm_p, rigid_joint='Head'))
    # Multi-eye neon-magenta & cyan optical camera array on the front pod + twin telemetry antennas
    parts_h.append(rosette(gid_h + '_lens_cluster', a + (b - a) * 0.52 - bk * 0.174, -bk, left, 0.054, P('neonmagenta', 0.01, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='beads.glass'), n=14, thick=0.020, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        parts_h.append(rosette(f'{gid_h}_sub_lens_{tag}', a + (b - a) * 0.54 + left * (sgn * 0.095) - bk * 0.155, -bk, left, 0.026, P('cybercyan', 0.01, fabric='beads.glass'), n=12, thick=0.014, rigid_joint='Head'))
        ant_pts = [a + (b - a) * (0.68 + 0.42 * t) + left * (sgn * (0.21 + 0.03 * t)) + bk * (0.02 * t) for t in np.linspace(0, 1, 5)]
        parts_h.append(horn(f'{gid_h}_antenna_{tag}', ant_pts, 0.010, 0.003, P('cybercyan', 0.01, fabric='metal.iron'), n=8, rows=5, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Yusar Drone-Caller Multi-Lens Transceiver Helm', 'head', 'yusar', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: yusar_m_dronemaster_coat ---
    gid_t = 'yusar_m_dronemaster_coat'
    parts_t = []
    coat_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.07, 'circuit_schematic', 'cybercyan', 'soot', 0.08),
        B('top', 0.0, 0.26, 'lorica_lames', 'cybercyan', 'steel', 0.07),
    ], [
        PN(0.0, 0.35, 'cyber_hex_neon', 'cybercyan', 'soot', 0.16),
        PN(0.65, 1.0, 'cyber_hex_neon', 'cybercyan', 'soot', 0.16),
        PN(0.35, 0.65, 'circuit_schematic', 'neonmagenta', 'soot', 0.14),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_coat', J('LeftLeg')[2] - 0.04, J('Neck')[2] + 0.01, coat_p, ease=0.026, flare=0.11, rows=22, n=40))
    parts_t.append(collar(gid_t + '_collar', P('soot', 0.02, [B('top', 0.0, 0.035, 'solid', 'cybercyan'), B('bottom', 0.0, 0.025, 'solid', 'neonmagenta')], fabric='metal.iron'), h=0.105, flare=0.042, open_front=0.0, rows=7, n=30))
    parts_t.append(rosette(gid_t + '_drone_dock', J('Spine2') - bk * 0.156 + up * 0.04, -bk, left, 0.050, P('neonmagenta', 0.01, [B('top', 0.0, 0.02, 'solid', 'cybercyan')], fabric='beads.glass'), n=14, thick=0.018, rigid_joint='Spine2'))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, helm_p, span=0.22, drop=0.17, lift=0.028))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, coat_p, f0=0.0, f1=0.92, ease=0.022, flare=0.012, rows=14, n=22))
    e_t = assemble_garment(gid_t, 'Yusar Drone-Caller Cyber-Deck Trenchcoat', 'torso', 'yusar', parts_t)

    # --- FEET: yusar_m_dronemaster_boots ---
    gid_f = 'yusar_m_dronemaster_boots'
    boot_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.06, 'solid', 'cybercyan'),
        B('top', 0.0, 0.06, 'solid', 'neonmagenta'),
    ], [
        PN(0.15, 0.85, 'cyber_hex_neon', 'cybercyan', 'steel', 0.14),
    ], fabric='metal.iron')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.08, ease=0.018, rows=16, n=24, cuff=0.016) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Yusar Drone-Caller Angled Cyber-Greaves', 'feet', 'yusar', parts_f)
    return [e_h, e_t, e_f]


# ===============================================================================================================
# 20. Yusar Electro-Priest — "Carcosa Electro-Priest (Tesla-Arc Cyber-Celebrant)" (Cyberpunk Quality Pass)
# ===============================================================================================================
def build_yusar_electropriest():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: yusar_m_electropriest_hood ---
    gid_h = 'yusar_m_electropriest_hood'
    parts_h = []
    parts_h.append(sculpted_cranium(gid_h + '_underhood', P('soot', 0.02, fabric='metal.iron'), f_top=0.92, f_bot=-0.06, ease=0.008))
    mask_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.05, 'stripes', 'cybercyan', 'soot', 0.018),
        B('top', 0.0, 0.03, 'solid', 'neonmagenta'),
    ], [
        PN(0.15, 0.85, 'priest_mask', 'cybercyan', 'soot', 0.18),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_redgrille', mask_p, f_top=0.72, f_bot=-0.06, ease=0.013, jaw_narrow=0.38))
    hood_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'cybercyan'),
        B('top', 0.0, 0.05, 'solid', 'neonmagenta'),
    ], [
        PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'charcoal', 0.16),
    ], fabric='metal.iron')
    parts_h.append(hood(gid_h + '_hood', hood_p, ease=0.026, ease_low=0.052, open_front=0.72, low=-0.42, rows=14, n=32, peak=0.14))
    parts_h.append(crown_band(gid_h + '_crown_ring', 0.62, 0.76, P('cybercyan', 0.01, [B('top', 0.0, 0.03, 'dentils', 'neonmagenta', 'soot', 0.025)], fabric='beads.glass'), bulge=0.018, ease=0.022, rows=5, n=28))
    e_h = assemble_garment(gid_h, 'Yusar Electro-Priest Cyber-Cowl & Neon Grille', 'head', 'yusar', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: yusar_m_electropriest_robe ---
    gid_t = 'yusar_m_electropriest_robe'
    parts_t = []
    robe_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.08, 'circuit_schematic', 'cybercyan', 'soot', 0.08),
        B('top', 0.0, 0.14, 'lorica_lames', 'neonmagenta', 'soot', 0.05),
    ], [
        PN(0.0, 0.35, 'cyber_hex_neon', 'cybercyan', 'charcoal', 0.16),
        PN(0.65, 1.0, 'cyber_hex_neon', 'cybercyan', 'charcoal', 0.16),
        PN(0.35, 0.65, 'circuit_schematic', 'neonmagenta', 'soot', 0.16),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cassock', J('LeftFoot')[2] + 0.06, J('Neck')[2] + 0.01, robe_p, ease=0.028, flare=0.13, rows=26, n=42))
    # Massive horizontal titanium & neon-cyan induction-coil collar ring with 6 radial glowing plasma discharge-tubes
    coil_p = P('steel', 0.02, [B('top', 0.0, 0.04, 'stripes', 'cybercyan', 'soot', 0.025), B('bottom', 0.0, 0.03, 'solid', 'neonmagenta')], fabric='metal.iron')
    parts_t.append(neck_ring(gid_t + '_induction_ring', coil_p, r_tube=0.055, drop=0.02, n=36, nr=12))
    sp_top = J('Neck') - up * 0.04
    for k in range(6):
        ang_e = -0.75 * math.pi + 1.50 * math.pi * (k / 5.0)
        r_dir = left * math.sin(ang_e) - bk * (math.cos(ang_e) * 0.85)
        e_pts = [sp_top + r_dir * (0.18 + 0.11 * t) + up * (0.02 * t) for t in np.linspace(0, 1, 5)]
        parts_t.append(horn(f'{gid_t}_electrode_{k}', e_pts, 0.024, 0.006, P('cybercyan' if k % 2 == 0 else 'neonmagenta', 0.01, [B('bottom', 0.0, 0.03, 'solid', 'steel')], fabric='beads.glass'), n=8, rows=5, rigid_joint='Spine2'))
    # Chest arc-reactor capacitor-wheel & neon-trimmed cyber sleeves
    parts_t.append(rosette(gid_t + '_capacitor', J('Spine1') - bk * 0.165 + up * 0.04, -bk, left, 0.072, P('cybercyan', 0.01, [B('top', 0.0, 0.025, 'solid', 'neonmagenta')], fabric='beads.glass'), n=16, thick=0.022, rigid_joint='Spine1'))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_capelet_{side}', side, hood_p, span=0.22, drop=0.18, lift=0.024))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, robe_p, f0=0.0, f1=0.92, ease=0.022, flare=0.015, rows=14, n=24))
    e_t = assemble_garment(gid_t, 'Yusar Electro-Priest Tesla-Arc Cyber-Cassock', 'torso', 'yusar', parts_t)
    return [e_h, e_t]


# ===============================================================================================================
# 21. Yusar Electro-Monk — "Henge Electro-Monk (Live-Conduit Cyber-Ascetic)" (Cyberpunk Quality Pass)
# ===============================================================================================================
def build_yusar_electromonk():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: yusar_m_electromonk_mask ---
    gid_h = 'yusar_m_electromonk_mask'
    parts_h = []
    parts_h.append(sculpted_cranium(gid_h + '_cranium', P('soot', 0.02, fabric='metal.iron'), f_top=0.98, f_bot=-0.05, ease=0.008))
    mask_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.03, 'solid', 'cybercyan'),
        B('top', 0.0, 0.03, 'solid', 'amber'),
    ], [
        PN(0.0, 1.0, 'electromonk_mask', 'cybercyan', 'soot', 0.20),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.78, f_bot=-0.06, ease=0.014, jaw_narrow=0.38))
    # Three glowing plasma cathode cylinders (top crown + left/right temples)
    top_pts = [a + (b - a) * (0.95 + 0.22 * t) for t in np.linspace(0, 1, 5)]
    parts_h.append(horn(gid_h + '_cathode_top', top_pts, 0.026, 0.022, P('cybercyan', 0.01, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='beads.glass'), n=10, rows=5, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        s_pts = [a + (b - a) * 0.68 + left * (sgn * (0.105 + 0.095 * t)) for t in np.linspace(0, 1, 5)]
        parts_h.append(horn(f'{gid_h}_cathode_{tag}', s_pts, 0.024, 0.020, P('amber', 0.01, [B('bottom', 0.0, 0.03, 'solid', 'brass')], fabric='beads.glass'), n=10, rows=5, rigid_joint='Head'))
    # Sweeping neon-magenta & black insulated fiber-optic cable-dreadlocks draping over the back & shoulders
    dread_p = P('soot', 0.03, [
        B('bottom', 0.0, 0.04, 'solid', 'cybercyan'),
        B('top', 0.0, 0.25, 'stripes', 'neonmagenta', 'soot', 0.022),
    ], [
        PN(0.0, 1.0, 'circuit_schematic', 'neonmagenta', 'soot', 0.14),
    ], fabric='metal.iron')
    parts_h.append(hood(gid_h + '_cabledreads', dread_p, ease=0.026, ease_low=0.056, open_front=1.05, low=-0.52, rows=14, n=32, peak=0.04))
    e_h = assemble_garment(gid_h, 'Yusar Electro-Monk Tri-Cathode Mask & Optic-Dreads', 'head', 'yusar', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: yusar_m_electromonk_harness ---
    gid_t = 'yusar_m_electromonk_harness'
    parts_t = []
    # Subdermal cyber-hex & neon-cyan circuit torso chassis with glowing magenta power-conduits & central chest arc-reactor
    body_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.06, 'solid', 'cybercyan'),
        B('top', 0.0, 0.05, 'solid', 'neonmagenta'),
    ], [
        PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'charcoal', 0.16),
        PN(0.42, 0.58, 'circuit_schematic', 'neonmagenta', 'soot', 0.12),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_schematic_torso', J('Hips')[2] + 0.02, J('Neck')[2] + 0.01, body_p, ease=0.018, flare=0.005, rows=16, n=34))
    parts_t.append(crossed_sash(gid_t + '_cables', P('neonmagenta', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'cybercyan')], fabric='metal.iron'), width=0.058, ease=0.026))
    parts_t.append(rosette(gid_t + '_chest_node', J('Spine2') - bk * 0.150 + up * 0.02, -bk, left, 0.046, P('cybercyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'neonmagenta')], fabric='beads.glass'), n=14, thick=0.018, rigid_joint='Spine2'))
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_shcable_{side}', side, body_p, span=0.19, drop=0.14, lift=0.022))
        parts_t.append(sleeve(f'{gid_t}_armwrap_{side}', side, body_p, f0=0.22, f1=0.90, ease=0.018, flare=0.005, rows=10, n=20))
    e_t = assemble_garment(gid_t, 'Yusar Electro-Monk Subdermal Cyber-Chassis', 'torso', 'yusar', parts_t)

    # --- LEGS: yusar_m_electromonk_pants ---
    gid_l = 'yusar_m_electromonk_pants'
    parts_l = trousers(gid_l, P('soot', 0.03, [
        B('bottom', 0.0, 0.08, 'dentils', 'cybercyan', 'soot', 0.04),
        B('top', 0.0, 0.08, 'stripes', 'neonmagenta', 'soot', 0.035),
    ], [
        PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'soot', 0.18),
    ], fabric='metal.iron'), ankle_f=0.74, ease=0.028, bag=0.046, rows=16, n=26)
    parts_l.append(belt_sash(gid_l + '_cap_belt', J('Hips')[2] + 0.01, J('Hips')[2] + 0.12, P('steel', 0.02, [B('bottom', 0.0, 0.04, 'dentils', 'cybercyan', 'soot', 0.03)], fabric='metal.iron'), ease=0.038))
    parts_l.append(rosette(gid_l + '_belt_coil', J('Hips') + left * 0.08 - bk * 0.155 + up * 0.04, -bk, left, 0.052, P('cybercyan', 0.01, fabric='beads.glass'), n=14, thick=0.018, rigid_joint='Hips'))
    e_l = assemble_garment(gid_l, 'Yusar Electro-Monk Capacitor-Belt Tech-Breeches', 'legs', 'yusar', parts_l, legged=True)

    # --- FEET: yusar_m_electromonk_wraps ---
    gid_f = 'yusar_m_electromonk_wraps'
    wrap_p = P('soot', 0.02, [B('top', 0.0, 0.08, 'stripes', 'cybercyan', 'soot', 0.028), B('bottom', 0.0, 0.06, 'stripes', 'neonmagenta', 'soot', 0.025)], fabric='metal.iron')
    parts_f = [boot(f'{gid_f}_{s}', s, wrap_p, top_f=0.18, ease=0.016, rows=14, n=22, cuff=0.010) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Yusar Electro-Monk Cyber-Strapped Shin-Guards', 'feet', 'yusar', parts_f)
    return [e_h, e_t, e_l, e_f]


# ===============================================================================================================
# 22. Yusar Hive-Corsair — "Carcosa Hive-Corsair (Linked-Node Cyber-Enforcer)" (Cyberpunk Quality Pass)
# ===============================================================================================================
def build_yusar_corsair():
    set_body('mpfb_male')
    a, b, up, bk, left = head_frame()

    # --- HEAD: yusar_m_corsair_helm ---
    gid_h = 'yusar_m_corsair_helm'
    parts_h = []
    # Sculpted chrome-and-obsidian skull-respirator (`corsair_skull_mask` motif: 3 neon-magenta crosshair lenses in a triangle + chrome teeth grille)
    parts_h.append(sculpted_cranium(gid_h + '_casque', P('soot', 0.02, [B('top', 0.0, 0.04, 'solid', 'neonmagenta'), B('bottom', 0.0, 0.03, 'solid', 'cybercyan')], fabric='metal.iron'), f_top=1.02, f_bot=-0.06, ease=0.009))
    mask_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.035, 'solid', 'cybercyan'),
        B('top', 0.0, 0.03, 'solid', 'neonmagenta'),
    ], [
        PN(0.0, 1.0, 'corsair_skull_mask', 'neonmagenta', 'soot', 0.22),
    ], fabric='metal.iron')
    parts_h.append(sculpted_faceplate(gid_h + '_skullhelm', mask_p, f_top=0.80, f_bot=-0.06, ease=0.014, jaw_narrow=0.38))
    # Looped neon-magenta & cyan cranial neural-link tubes around the temples & crown
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        for (z_lo, z_hi), col_t in (((0.45, 0.82), 'neonmagenta'), ((0.68, 1.05), 'cybercyan')):
            t_pts = [
                a + (b - a) * z_lo + left * (sgn * 0.095) - bk * 0.04,
                a + (b - a) * ((z_lo + z_hi) * 0.5) + left * (sgn * 0.165) + bk * 0.02,
                a + (b - a) * z_hi + left * (sgn * 0.075) + bk * 0.06,
            ]
            parts_h.append(tube(f'{gid_h}_loop_{tag}_{z_lo:.2f}', t_pts, 0.014, P(col_t, 0.01, [B('top', 0.0, 0.02, 'solid', 'soot')], fabric='beads.glass'), n=8, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Yusar Hive-Corsair Tri-Eye Cyber-Skull Helm', 'head', 'yusar', parts_h, covers_hair=True, covers_face=True)

    # --- TORSO: yusar_m_corsair_coat ---
    gid_t = 'yusar_m_corsair_coat'
    parts_t = []
    # Two-tone carbon-hex & neon-magenta/cyan armored techwear trenchcoat with high LED collar & spiked cyber-pauldrons
    coat_p = P('soot', 0.02, [
        B('bottom', 0.0, 0.07, 'dentils', 'neonmagenta', 'soot', 0.04),
        B('top', 0.0, 0.08, 'circuit_schematic', 'cybercyan', 'soot', 0.08),
    ], [
        PN(0.0, 0.50, 'cyber_hex_neon', 'neonmagenta', 'soot', 0.16),
        PN(0.50, 1.00, 'cyber_hex_neon', 'cybercyan', 'charcoal', 0.16),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_coat', J('LeftLeg')[2] - 0.04, J('Neck')[2] + 0.01, coat_p, ease=0.028, flare=0.11, rows=22, n=40))
    parts_t.append(collar(gid_t + '_highcollar', P('soot', 0.02, [B('top', 0.0, 0.035, 'solid', 'neonmagenta'), B('bottom', 0.0, 0.025, 'solid', 'cybercyan')], fabric='metal.iron'), h=0.118, flare=0.052, open_front=0.0, rows=8, n=34))
    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        parts_t.append(pauldron(f'{gid_t}_mantle_{side}', side, coat_p, span=0.25, drop=0.17, lift=0.030))
        sh_p = J(side + 'Arm')
        for k, x_f in enumerate((0.04, 0.08, 0.12)):
            sp_pts = [sh_p + left * (sgn * x_f) + up * (0.04 + 0.065 * t) - bk * 0.01 for t in np.linspace(0, 1, 4)]
            parts_t.append(horn(f'{gid_t}_pin_{side}_{k}', sp_pts, 0.011, 0.003, P('neonmagenta' if k % 2 == 0 else 'cybercyan', 0.01, fabric='beads.glass'), n=6, rows=4, rigid_joint=side + 'Arm'))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, coat_p, f0=0.0, f1=0.92, ease=0.024, flare=0.012, rows=14, n=24))
    parts_t.append(belt_sash(gid_t + '_belt', J('Hips')[2] + 0.01, J('Hips')[2] + 0.13, P('soot', 0.02, [B('top', 0.0, 0.04, 'chevrons', 'neonmagenta', 'soot', 0.04), B('bottom', 0.0, 0.04, 'chevrons', 'cybercyan', 'soot', 0.04)], fabric='metal.iron'), ease=0.040))
    e_t = assemble_garment(gid_t, 'Yusar Hive-Corsair Spiked Cyber-Trenchcoat', 'torso', 'yusar', parts_t)

    # --- LEGS: yusar_m_corsair_pants ---
    gid_l = 'yusar_m_corsair_pants'
    p_right = P('charcoal', 0.03, [B('bottom', 0.0, 0.05, 'solid', 'neonmagenta')], [PN(0.0, 1.0, 'cyber_hex_neon', 'neonmagenta', 'soot', 0.16)], fabric='metal.iron')
    p_left = P('soot', 0.03, [B('bottom', 0.0, 0.05, 'solid', 'cybercyan')], [PN(0.0, 1.0, 'cyber_hex_neon', 'cybercyan', 'soot', 0.16)], fabric='metal.iron')
    raw_legs = trousers(gid_l, p_right, ankle_f=0.76, ease=0.028, bag=0.046, rows=16, n=26)
    for pt in raw_legs:
        if 'Left' in pt.name:
            pt.paint = p_left
    e_l = assemble_garment(gid_l, 'Yusar Hive-Corsair Two-Tone Cyber-Trousers', 'legs', 'yusar', raw_legs, legged=True)

    # --- FEET: yusar_m_corsair_boots ---
    gid_f = 'yusar_m_corsair_boots'
    boot_p = P('soot', 0.02, [B('top', 0.0, 0.08, 'stripes', 'neonmagenta', 'soot', 0.03), B('bottom', 0.0, 0.05, 'solid', 'cybercyan')], [PN(0.2, 0.8, 'cyber_hex_neon', 'neonmagenta', 'soot', 0.14)], fabric='metal.iron')
    parts_f = [boot(f'{gid_f}_{s}', s, boot_p, top_f=0.18, ease=0.018, rows=14, n=24, cuff=0.016) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Yusar Hive-Corsair Neon-Strapped Cyber-Boots', 'feet', 'yusar', parts_f)
    return [e_h, e_t, e_l, e_f]


# ===============================================================================================================
# 23. Dalab Genepriest (`dalab_m/f_noble_mitre`, `dalab_m/f_noble_robe`, `dalab_m/f_noble_sandals`)
#     High-Drip Quality Pass + Zero Lap Clipping Fix!
# ===============================================================================================================
def _build_dalab_genepriest_for(body_id, pfx):
    set_body(body_id)
    a, b, up, bk, left = head_frame()

    # --- HEAD: dalab_m/f_noble_mitre ("Dalab Mitre of the All-Seeing Eye") ---
    gid_h = f'dalab_{pfx}_noble_mitre'
    parts_h = []
    # 1. Golden-and-turquoise Tiwanaku brow diadem + tiered hammered-gold & holy-red high crown-mitre
    brow_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.025, 'fret', 'godteal', 'gold', 0.025),
        B('top', 0.0, 0.025, 'dentils', 'holyred', 'gold', 0.025),
    ], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_browband', 0.52, 0.74, brow_p, bulge=0.010, ease=0.012, rows=5, n=32))

    mitre_p = P('gold', 0.02, [
        B('bottom', 0.0, 0.08, 'stripes', 'holyred', 'gold', 0.022),
        B('top', 0.0, 0.06, 'fret', 'holyred', 'gold', 0.035),
    ], [
        PN(0.0, 1.0, 'dalab_solar_weave', 'gold', 'holyred', 0.24),
    ], fabric='metal.gold')
    # Flared cylindrical-conical high Tiwanaku crown (top-to-bottom row order from flat golden sun-cap down to brow!)
    angs_m = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    m_rows = []
    for f, rx_m, ry_m in (
        (1.66, 0.015, 0.015),
        (1.64, 0.142, 0.156),
        (1.38, 0.132, 0.148),
        (1.06, 0.120, 0.142),
        (0.70, 0.108, 0.136),
    ):
        c = a + (b - a) * f
        m_rows.append([c + left * (math.sin(an) * rx_m) + bk * (math.cos(an) * ry_m + 0.018 * (f - 0.70)) for an in angs_m])
    parts_h.append(Part(gid_h + '_crown_cylinder', np.array(m_rows), True, ['body'] * len(m_rows), mitre_p, rigid_joint='Head'))

    # 2. Iconic 3D pleated Golden & Ivory Solar-Fan Halo rising from the front/crown of the mitre!
    fan_p = P('gold', 0.02, [
        B('top', 0.0, 0.04, 'dentils', 'white', 'gold', 0.025),
        B('bottom', 0.0, 0.05, 'solid', 'holyred'),
    ], [
        PN(0.0, 1.0, 'stripes', 'white', 'gold', 0.024),
    ], fabric='metal.gold')
    fan_ctr = a + (b - a) * 0.92 - bk * 0.115
    s_fan = np.linspace(0.0, 1.0, 21)
    fan_rows = []
    for rad_f in (1.0, 0.74, 0.46, 0.20):
        f_front, f_back = [], []
        for s in s_fan:
            ang_f = -0.68 * math.pi + 1.36 * math.pi * s
            pleat = 1.0 + 0.045 * math.cos(s * 16.0 * math.pi)
            r_cur = (0.055 + 0.175 * rad_f) * pleat
            pt = fan_ctr + left * (math.sin(ang_f) * r_cur) + up * (math.cos(ang_f) * r_cur) - bk * (0.015 * rad_f)
            f_front.append(pt - bk * 0.008)
            f_back.append(pt + bk * 0.008)
        fan_rows.append(f_front + f_back[::-1])
    parts_h.append(Part(gid_h + '_solar_fan', np.array(fan_rows), True, ['body'] * len(fan_rows), fan_p, rigid_joint='Head'))

    # 3. Sculpted 3D "All-Seeing Eye of the God" medallion at the center of the solar fan + hanging temple ear-chimes
    parts_h.append(rosette(gid_h + '_eye_halo_boss', fan_ctr - bk * 0.022 + up * 0.045, -bk, left, 0.052,
                           P('godteal', 0.01, [B('top', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'holyred')], fabric='metal.gold'),
                           n=16, thick=0.016, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        chime_top = a + (b - a) * 0.54 + left * (sgn * 0.115) - bk * 0.02
        parts_h.append(tassel(f'{gid_h}_chime_{tag}', chime_top, 0.12, 0.014,
                              P('gold', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'godteal'), B('top', 0.0, 0.03, 'solid', 'holyred')], fabric='metal.gold'),
                              rigid_joint='Head'))
    e_h = assemble_garment(gid_h, "Dalab genepriest's mitre of the Eye", 'head', 'dalabites', parts_h, covers_hair=True)

    # --- TORSO: dalab_m/f_noble_robe ("Dalab Genepriest's Robe") ---
    # Uniform horizontal `hang_from` via `torso_tube` eliminates the non-uniform chain-root lap fold/clipping when turning!
    gid_t = f'dalab_{pfx}_noble_robe'
    parts_t = []
    robe_p = P('white', 0.03, [
        B('bottom', 0.0, 0.095, 'steps', 'holyred', 'gold', 0.065),
        B('top', 0.0, 0.055, 'fret', 'gold', 'holyred', 0.04),
    ], [
        # Central front & back crimson-and-gold liturgical pillar with All-Seeing Eye & stepped solar fretwork
        PN(0.41, 0.59, 'dalab_solar_weave', 'gold', 'holyred', 0.28),
        PN(0.91, 1.00, 'dalab_solar_weave', 'gold', 'holyred', 0.28),
        PN(0.00, 0.09, 'dalab_solar_weave', 'gold', 'holyred', 0.28),
        # Flank vertical golden temple-step stripes on the ivory silk
        PN(0.36, 0.41, 'fret', 'gold', 'white', 0.05),
        PN(0.59, 0.64, 'fret', 'gold', 'white', 0.05),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_robe', J('LeftFoot')[2] + 0.07, J('Neck')[2] + 0.01, robe_p, ease=0.030, flare=0.17, rows=26, n=44))

    # Wide pleated crimson-and-gold radial Solar Pectoral Collar (`_solar_collar`) + hammered gold neck-gorget
    ruff_p = P('holyred', 0.02, [
        B('top', 0.0, 0.035, 'dentils', 'gold', 'holyred', 0.025),
        B('bottom', 0.0, 0.035, 'fret', 'gold', 'holyred', 0.035),
    ], [
        PN(0.0, 1.0, 'stripes', 'gold', 'holyred', 0.028),
    ], fabric='metal.gold')
    parts_t.append(bio.collar_disc(gid_t + '_solar_collar', 0.145, ruff_p, drop=0.055, rows=6, n=40, scallop=0.012, ease=0.034, z_off=0.012))
    parts_t.append(collar(gid_t + '_gold_gorget', P('gold', 0.02, [B('top', 0.0, 0.025, 'solid', 'godteal')], fabric='metal.gold'), h=0.065, flare=0.035, open_front=0.0, rows=6, n=32))

    # 3D sculpted Golden & Turquoise "All-Seeing Eye" pectoral medallion on the chest + Golden Solar Epaulettes
    chest_eye = J('Spine2') - bk * 0.158 + up * 0.042
    parts_t.append(rosette(gid_t + '_chest_eye', chest_eye, -bk, left, 0.056,
                           P('gold', 0.02, [B('top', 0.0, 0.02, 'solid', 'godteal'), B('bottom', 0.0, 0.02, 'solid', 'holyred')], fabric='metal.gold'),
                           n=16, thick=0.016, rigid_joint='Spine2'))

    # Wide gold-brocaded crimson waist sash (`rigid_joint='Hips'`) + 3D golden waist Eye clasp + hanging liturgical stole (`layer=2`)
    sash_p = P('holyred', 0.02, [
        B('top', 0.0, 0.03, 'fret', 'gold', 'holyred', 0.03),
        B('bottom', 0.0, 0.03, 'fret', 'gold', 'holyred', 0.03),
    ], [
        PN(0.0, 1.0, 'dalab_solar_weave', 'gold', 'holyred', 0.14),
    ], fabric='metal.gold')
    parts_t.append(belt_sash(gid_t + '_waist_obi', J('Hips')[2] + 0.01, J('Hips')[2] + 0.12, sash_p, ease=0.038))
    parts_t.append(rosette(gid_t + '_waist_eye', J('Hips') - bk * 0.160 + up * 0.065, -bk, left, 0.050,
                           P('godteal', 0.01, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='metal.gold'),
                           n=16, thick=0.016, rigid_joint='Hips'))

    # Flared ceremonial bell-sleeves with stepped crimson-and-gold cuffs + hammered gold shoulder pauldrons
    sl_p = P('white', 0.03, [
        B('bottom', 0.0, 0.11, 'steps', 'holyred', 'gold', 0.045),
        B('top', 0.0, 0.06, 'fret', 'gold', 'holyred', 0.035),
    ], [
        PN(0.35, 0.65, 'dalab_solar_weave', 'gold', 'holyred', 0.18),
    ], fabric='cloth.silk')
    for side in ('Left', 'Right'):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{side}', side, P('gold', 0.02, [B('bottom', 0.0, 0.04, 'dentils', 'holyred', 'gold', 0.03)], fabric='metal.gold'), span=0.21, drop=0.15, lift=0.024))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{side}', side, sl_p, f0=0.0, f1=0.90, ease=0.026, flare=0.052, rows=14, n=26))
    e_t = assemble_garment(gid_t, "Dalab genepriest's robe", 'torso', 'dalabites', parts_t)

    # --- FEET: dalab_m/f_noble_sandals ("Dalab Temple Sandals") ---
    gid_f = f'dalab_{pfx}_noble_sandals'
    sandal_p = P('gold', 0.02, [
        B('top', 0.0, 0.08, 'fret', 'godteal', 'gold', 0.03),
        B('bottom', 0.0, 0.05, 'solid', 'holyred'),
    ], [
        PN(0.20, 0.80, 'stripes', 'gold', 'white', 0.03),
    ], fabric='metal.gold')
    parts_f = [boot(f'{gid_f}_{s}', s, sandal_p, top_f=0.22, ease=0.016, rows=14, n=22, cuff=0.012) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Dalab temple sandals', 'feet', 'dalabites', parts_f)
    return [e_h, e_t, e_f]


def build_dalab_genepriest():
    out = []
    out.extend(_build_dalab_genepriest_for('mpfb_male', 'm'))
    out.extend(_build_dalab_genepriest_for('mpfb_female', 'f'))
    set_body('mpfb_male')
    return out


BUILDERS_B2 = [
    build_voth_priest,
    build_voth_ordinator,
    build_voth_scout,
    build_voth_tzintzun,
    build_voth_chosen,
    build_beast_amazon,
    build_iziz_phil,
    build_rustic_axeman,
    build_eternian_minister,
    build_eternian_censor,
    build_eternian_prefect,
    build_eternian_archivist,
    build_eternian_warden,
    build_rep_commissar,
    build_voth_cantor,
    build_yuni_breacher,
    build_yusar_hierophant,
    build_yusar_lightkeeper,
    build_yusar_dronemaster,
    build_yusar_electropriest,
    build_yusar_electromonk,
    build_yusar_corsair,
    build_dalab_genepriest,
]


def _run_b2(fn):
    return fn()


def main():
    t0 = time.perf_counter()
    args = sys.argv[1:]
    only = None
    workers = min(10, os.cpu_count() or 8)
    if '--only' in args:
        idx = args.index('--only')
        only = args[idx + 1]
    if '--workers' in args:
        idx = args.index('--workers')
        workers = int(args[idx + 1])

    selected = [fn for fn in BUILDERS_B2 if not only or only in fn.__name__]
    new_entries = []
    if workers <= 1 or len(selected) <= 1:
        for fn in selected:
            new_entries += fn()
    else:
        with concurrent.futures.ProcessPoolExecutor(max_workers=min(workers, len(selected))) as ex:
            for entries in ex.map(_run_b2, selected):
                new_entries += entries

    register_entries(new_entries)
    dt = time.perf_counter() - t0
    print(f'Built {len(new_entries)} Batch 2 pieces across {len(selected)} outfits in {dt:.2f}s.')


if __name__ == '__main__':
    main()
