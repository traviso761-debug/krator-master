"""Layer 2 (Limbs): Sleeves, armbands, four-armed garment adapters, trousers, skirts, and loincloths.

Consolidates all limb-type primitives (`limb_tube`, `sleeve`, `sleeves`, `armbands`, `trousers`,
`skirt`, `loincloth`) into a single garment-type module.
"""
import math
import numpy as np
from .. import core
from ..core import Part, J, frame, ring_points, smooth_push, L, R
from .torso import torso_tube


def limb_tube(name, a, b, ease, paint, n=20, rows=8, ease_end=None, start_back=0.0, arc=None, group='body', path=None, bvh=None, rmax=0.25,
              role=None, side=None, wide=False):
    _plen = float(np.linalg.norm(np.diff(np.array(path if path is not None else [a, b], float), axis=0), axis=1).sum())
    if bvh is core.BVH_A and role != 'pauldron' and _plen >= 0.18 and not wide:
        # issue 4 (REVIEW-GARMENTS-2026-11-06.md): a sleeve's ease is capped at 2 cm and its flare at 2.8 cm here, in
        # the tube every arm part is built on, not only in sleeve(): sleeves() and the builders' own calls bypassed
        # the cap, and the push has no trunk capsule to catch a sleeve that stands too far off the arm. A sleeve is an
        # arm tube 18 cm or longer: a pauldron or an armband stands off by design, and so does a sleeve cut wide on
        # purpose (wide=True: a boubou's; capped, its hem sat inside the gown's drape and the armhole showed its inside)
        ease = min(float(ease), 0.020)
        if ease_end is not None:
            ease_end = min(float(ease_end), ease + 0.028)
    pts = np.array(path if path is not None else [a, b], float)
    t0 = (pts[1] - pts[0]) / np.linalg.norm(pts[1] - pts[0])
    pts[0] = pts[0] - t0 * start_back
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)])
    total = cum[-1]
    if arc:
        angles = np.linspace(arc[0], arc[1], n)
    else:
        angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Es = np.linspace(ease, ease_end if ease_end is not None else ease, rows)
    if start_back > 0.02 and arc is None and rows >= 5:
        Es[0] = min(Es[0] * 0.35, 0.006)
        Es[1] = min(Es[1] * 0.72, 0.014)
    x, _ = frame(t0)
    rings = []
    for k in range(rows):
        sdist = total * k / (rows - 1)
        i = min(len(seg) - 1, int(np.searchsorted(cum, sdist, side='right') - 1))
        f = (sdist - cum[i]) / seg[i]
        c = pts[i] + (pts[i + 1] - pts[i]) * f
        t = (pts[i + 1] - pts[i]) / seg[i]
        if i + 1 < len(seg) and f > 0.7:
            t2 = (pts[i + 2] - pts[i + 1]) / seg[i + 1]
            w = (f - 0.7) / 0.6
            t = t * (1 - w) + t2 * w
        if i > 0 and f < 0.3:
            t1 = (pts[i] - pts[i - 1]) / seg[i - 1]
            w = (0.3 - f) / 0.6
            t = t * (1 - w) + t1 * w
        t = t / np.linalg.norm(t)
        x = x - t * x.dot(t)
        x = x / np.linalg.norm(x)
        y = np.cross(t, x)
        rings.append(ring_points(c, x, y, angles, Es[k], rmin=0.02, rmax=rmax, bvh=bvh))
    P_grid = np.array(rings)
    P_grid = smooth_push(P_grid, arc is None, ease, iters=2, rows_ease=Es, bvh=bvh)
    pt = Part(name, P_grid, arc is None, [group] * rows, paint, role=role, side=side)
    pt.is_arm = (bvh is core.BVH_A)
    return pt


def sleeve(name, side, paint, f0=0.0, f1=0.92, ease=0.020, flare=0.008, rows=12, n=22):
    """Single-arm sleeve from fraction f0 to f1 along the arm (0=shoulder, 0.5=elbow, 1.0=wrist)."""
    ease_c = min(float(ease), 0.020)
    flare_c = min(float(flare), 0.028)
    a, e, h = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
    def pt_at(f):
        if f <= 0.5:
            return a + (e - a) * (f / 0.5)
        return e + (h - e) * ((f - 0.5) / 0.5)
    if f0 < 0.48 and f1 > 0.52:
        path = [pt_at(f0), e, pt_at(f1)]
    else:
        path = [pt_at(f0), pt_at(f1)]
    sb = 0.048 if f0 < 0.05 else 0.0
    return limb_tube(name, None, None, ease_c, paint, n=n, rows=rows,
                     ease_end=ease_c + flare_c, start_back=sb, path=path, bvh=core.BVH_A, rmax=0.135, role='sleeve', side=side[0])


def sleeves(gid, end, ease, paint, ease_end=None, rows=8, n=22, rmax=0.135, wide=False):
    """Paired left and right sleeves ('elbow', 'wrist', or fraction of upper arm)."""
    out = []
    for s in (L, R):
        a, e, h = J(s + 'Arm'), J(s + 'ForeArm'), J(side + 'Hand') if False else J(s + 'Hand')
        path = [a, e] if end == 'elbow' else [a, e, h - (h - e) * 0.08] if end == 'wrist' else [a, a + (e - a) * end]
        out.append(limb_tube('%s_sleeve_%s' % (gid, s[0]), None, None, ease, paint, n=n, rows=rows, ease_end=ease_end,
                             start_back=0.048, path=path, bvh=core.BVH_A, rmax=rmax, role='sleeve', side=s[0], wide=wide))
    return out


def armbands(gid, paint, f=0.45, w=0.035):
    """Paired upper-arm bands (de-vendored from Dalab)."""
    out = []
    for s in (L, R):
        a, e = J(s + 'Arm'), J(s + 'ForeArm')
        c = a + (e - a) * f
        out.append(limb_tube('%s_armband_%s' % (gid, s[0]), c, c + (e - a) / np.linalg.norm(e - a) * w, 0.008, paint,
                             n=16, rows=2, bvh=core.BVH_A, role='band', side=s[0]))
    return out


def trousers(gid, paint, ease=0.018, ease_end=None, cuff=None, seat_paint=None, n=22, rows=14, ankle_f=None, bag=0.025):
    """Unified trousers builder supporting both cuff height (`cuff=...`) and shin fraction (`ankle_f=...`)."""
    out = [torso_tube(gid + '_seat', core.WAIST + 0.01, core.CROTCH + 0.01, ease, seat_paint or paint,
                      n=36, rows=6, hull_from=core.WAIST, role='trunk')]
    ee_raw = ease_end if ease_end is not None else (ease + bag * 0.5)
    for s in (L, R):
        hip, knee, foot = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        if ankle_f is not None:
            f_use = min(1.0, float(ankle_f))
            end = knee + (foot - knee) * f_use
        else:
            z = cuff if cuff is not None else core.ANKLE + 0.05
            f_use = min(1.0, (knee[2] - z) / max(1e-6, knee[2] - foot[2]))
            end = knee + (foot - knee) * f_use
        # Taper lower shin cleanly (<= 16mm) when trousers extend below mid-calf so they tuck inside boots without calf bulge
        ee = min(float(ee_raw), 0.016) if f_use >= 0.55 else float(ee_raw)
        out.append(limb_tube('%s_leg_%s' % (gid, s[0]), None, None, ease + 0.003, paint, n=n, rows=rows,
                             ease_end=ee, start_back=0.06, path=[hip, knee, end], rmax=0.22, role='leg', side=s[0]))
    return out


def skirt(name, z_bot, z_top, paint, ease=0.024, flare=0.08, rows=18, n=40):
    """Full or knee-length skirt hanging from the waist."""
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    return torso_tube(name, z0, z1, ease, paint, n=n, rows=rows,
                      hang_from=z0 - 0.02, flare=flare,
                      group_below=core.CROTCH + 0.02, hull_from=z0)


def full_gloves(gid, cuff_paint, hand_paint, finger_paint=None, f0=0.62, ease=0.014, knuckle_paint=None, ring_paint=None):
    """Closed 5-finger articulated gauntlets/gloves with forearm cuff, contoured metacarpal shell, and phalanx-bound finger sheaths."""
    from .accoutrements import blob, tube
    out = []
    f_paint = finger_paint or hand_paint
    for side in (L, R):
        out.append(sleeve(f'{gid}_cuff_{side[0]}', side, cuff_paint or hand_paint, f0=f0, f1=1.00, ease=ease + 0.002, flare=0.008, rows=7, n=20))
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
        # Ensure y_ax points dorsally (back of hand)
        if y_ax[2] < 0:
            y_ax = -y_ax
        angs_p = np.linspace(0, 2 * math.pi, 20, endpoint=False)
        palm_s_vals = (-0.32, -0.14, 0.0, 0.34, 0.68, 1.02)
        palm_rows = []
        for s_t in palm_s_vals:
            c = w_pt + d_hand * s_t
            if s_t < 0.0:
                rx = 0.041 + 0.018 * s_t
                ry = 0.022 - 0.008 * s_t
            else:
                rx = 0.041 + 0.007 * s_t
                ry = 0.022 * (1.0 - 0.10 * s_t)
            palm_rows.append([c + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry) for an in angs_p])
        pt_palm = Part(f'{gid}_palm_{side[0]}', np.array(palm_rows), True, ['helper-tights'] * len(palm_s_vals),
                       hand_paint, role='cuff', side=side[0])
        pt_palm.row_joints = [
            side + 'ForeArm',
            side + 'ForeArm',
            side + 'Hand',
            side + 'Hand',
            side + 'Hand',
            side + 'Hand',
        ]
        pt_palm.is_arm = True
        out.append(pt_palm)

        if knuckle_paint is not None:
            k_joints_pos = [pnk1, rng1, mid1, idx1]
            span_dir = idx1 - pnk1
            span_len = max(float(np.linalg.norm(span_dir)), 1e-6)
            span_u = span_dir / span_len
            p_start = pnk1 - span_u * 0.007
            p_end = idx1 + span_u * 0.007
            n_krows, n_kring = 9, 10
            angs_k = np.linspace(0.0, 2.0 * math.pi, n_kring, endpoint=False)
            k_grid = []
            for ri_k in range(n_krows):
                tk = ri_k / float(n_krows - 1)
                base_k = p_start * (1.0 - tk) + p_end * tk
                # Subtle knuckle boss bump over each of the 4 metacarpophalangeal joints
                boss = max(math.exp(-(((float(np.linalg.norm(base_k - kj))) / 0.009) ** 2)) for kj in k_joints_pos)
                taper = 0.50 if ri_k in (0, n_krows - 1) else (0.90 if ri_k in (1, n_krows - 2) else 1.0)
                ru_k = (0.0135 + 0.0018 * boss) * taper
                ry_k = (0.0060 + 0.0024 * boss) * taper
                # `palm_rows` dorsal surface reaches `y_ax * 0.020`; seat knuckle plate at `y_ax * 0.0195` so its inner face
                # welds 3mm into the dorsal leather while its armored outer ridge stands +6mm proud across all 4 knuckles!
                ck = base_k + y_ax * (0.0195 + 0.0015 * boss) - u_ax * 0.008
                k_grid.append([
                    ck + u_ax * (math.cos(ak) * ru_k) + y_ax * (max(-0.45, math.sin(ak)) * ry_k)
                    for ak in angs_k
                ])
            kp = Part(f'{gid}_knuckle_{side[0]}', np.array(k_grid), True, ['helper-tights'] * n_krows,
                      knuckle_paint, rigid_joint=side + 'Hand', role='cuff', side=side[0])
            kp.is_arm = True
            out.append(kp)

        for fg, r_base in (('Thumb', 0.0116), ('Index', 0.0104), ('Middle', 0.0108), ('Ring', 0.0102), ('Pinky', 0.0094)):
            p1 = J(f'{side}Hand{fg}1')
            p2 = J(f'{side}Hand{fg}2')
            p3 = J(f'{side}Hand{fg}3')
            tip_dir = p3 - p2
            root_pt = p1 - 0.36 * (p2 - p1)
            mid12 = 0.5 * (p1 + p2)
            tip1 = p3 + 0.80 * tip_dir
            tip2 = p3 + 1.08 * tip_dir
            f_pts = [root_pt, p1, mid12, p2, p3, tip1, tip2]
            f_rads = [r_base * 1.18, r_base * 1.05, r_base * 0.97, r_base * 0.92, r_base * 0.85, r_base * 0.68, 0.0024]
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
                seg_d = f_pts[min(idx_r + 1, len(f_pts) - 1)] - f_pts[max(idx_r - 1, 0)]
                t_v = seg_d / max(np.linalg.norm(seg_d), 1e-6)
                ref_v = np.array([0.0, 0.0, 1.0]) if abs(t_v[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
                u_v = np.cross(t_v, ref_v)
                u_v /= np.linalg.norm(u_v) + 1e-12
                v_v = np.cross(t_v, u_v)
                v_v /= np.linalg.norm(v_v) + 1e-12
                f_rows.append([cp + (u_v * math.cos(an) + v_v * math.sin(an)) * rad for an in angs_f])
            pt_f = Part(f'{gid}_finger_{side[0]}_{fg}', np.array(f_rows), True, ['helper-tights'] * len(f_rows),
                        f_paint, role='cuff', side=side[0])
            pt_f.row_joints = f_joints
            pt_f.is_arm = True
            out.append(pt_f)

        if ring_paint is not None and side == R:
            rg1 = J(f'{side}HandRing1')
            rg2 = J(f'{side}HandRing2')
            rc1 = rg1 + (rg2 - rg1) * 0.35
            rc2 = rg1 + (rg2 - rg1) * 0.58
            rg_pt = tube(f'{gid}_signet_ring', [rc1, rc2], 0.0118, ring_paint, n=12,
                         rigid_joint=f'{side}HandRing1')
            rg_pt.role = 'cuff'
            rg_pt.side = 'R'
            rg_pt.is_arm = True
            out.append(rg_pt)
    return out
