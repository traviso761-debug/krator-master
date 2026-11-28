"""Layer 2 (Accoutrements): Belts, pouches, sashes with tails, stacked belts, buttons, rosettes, pendants, tassels, eyes, flaps, straps, tubes, and blobs.

Consolidates all accoutrement primitives (`belt_sash`, `pouch_belt`, `sash_with_tail`,
`stacked_belts`, `button_row`, `rosette`, `pendants`, `tassel`, `eye_disc`, `flap`, `strap`,
`tube`, `blob`) into a single module, eliminating cross-culture function vending.
"""
import math
import numpy as np
from .. import core
from ..core import Part, spine_at, first_hit, smooth_push, surface_out, chest_front
from ..paint import P, B
from .torso import torso_tube
from .headgear import horn


def flap(name, top_center, width, length, out, paint, cols=7, rows=10, ease=0.012, group_below=None, sway=0.0, push=True, rigid_joint=None, role='drape'):
    out = np.asarray(out, float)
    out = out / np.linalg.norm(out)
    side = np.cross(np.array([0, 0, 1.0]), out)
    if np.linalg.norm(side) < 1e-6:
        side = np.array([1.0, 0, 0])
    else:
        side /= np.linalg.norm(side)
    P_grid = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j in range(cols):
            u = j / (cols - 1) - 0.5
            p = top_center + side * u * width * (1 + 0.08 * v) + np.array([0, 0, -length * v]) + out * (sway * v * v)
            row.append(p)
        P_grid.append(row)
    P_grid = np.array(P_grid)
    if push:
        P_grid = smooth_push(P_grid, False, ease, iters=2, fix_top=True)
    grp = ['helper-skirt' if (group_below is not None and P_grid[i, :, 2].mean() < group_below) else 'body' for i in range(rows)]
    pt = Part(name, P_grid, False, grp, paint, rigid_joint=rigid_joint, role=role)
    if rigid_joint is None and length >= 0.12:
        pt.cloth = {
            'start': 0,
            'stiff': 0.08,
            'layer': 2 if any(k in name for k in ('tail', 'apron', 'stole', 'tabard', 'tasset', 'ribbons', 'sidesash')) else 1,
        }
    return pt


def blob(name, c, size, paint, n=12, rows=5, out=None, rigid_joint=None, role=None):
    out = np.array([0, -1.0, 0]) if out is None else np.asarray(out, float) / np.linalg.norm(out)
    side = np.cross(np.array([0, 0, 1.0]), out)
    if np.linalg.norm(side) < 1e-6:
        side = np.array([1.0, 0, 0])
    else:
        side /= np.linalg.norm(side)
    up = np.cross(out, side)
    up /= np.linalg.norm(up)
    Q = []
    for i in range(rows):
        ph = math.pi * (0.06 + 0.88 * i / (rows - 1))
        r, z = math.sin(ph), math.cos(ph)
        Q.append([c + side * math.cos(a) * r * size[0] / 2 + out * (max(-0.25, math.sin(a)) * r * size[1] / 2) + up * (z * size[2] / 2)
                  for a in np.linspace(0, 2 * math.pi, n, endpoint=False)])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint=rigid_joint, role=role)


def belt_sash(name, z_bot, z_top, paint, ease=0.038):
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    return torso_tube(name, z0, z1, ease, paint, n=40, rows=6, hull_from=z0)


def pouch_belt(gid, paint, pouch_paint, ease=0.024):
    """Waist belt with three utility pouches sitting snugly against the conformed belt."""
    c = spine_at(core.WAIST - 0.015)
    parts = [torso_tube(gid + '_belt', core.WAIST + 0.02, core.WAIST - 0.05, ease, paint, rows=4, n=40, hull_from=core.WAIST + 0.1, role='belt')]
    for k, d in enumerate((np.array([-0.75, -0.66, 0]), np.array([0.8, 0.6, 0]), np.array([0.98, -0.2, 0]))):
        d = d / np.linalg.norm(d)
        parts.append(blob('%s_pouch%d' % (gid, k), surface_out(c, d, 0.021), (0.072, 0.036, 0.082), pouch_paint, out=d, role='accessory'))
    return parts


def sash_with_tail(gid, paint, tail_paint, ease=0.022, tail=0.28):
    """Volumetric 3D pleated cummerbund with sculpted hip-knot and closed 3D double-sided silk sash ribbon."""
    c_w = spine_at(core.WAIST - 0.012)
    d = np.array([0.85, -0.50, 0.0])
    d /= np.linalg.norm(d)
    side = np.cross(np.array([0.0, 0.0, 1.0]), d)
    side /= np.linalg.norm(side)

    # 1. Closed 3D double-sided volumetric sash ribbon (`closed=True` around 14-col cross-section, 16 dense rows down)
    #    Cols 0..6: outer front face (+half_thk); Cols 7..13: inner back face (-half_thk), rounded at side selvedges.
    n_rows, n_half = 16, 7
    width = 0.086
    half_thk = 0.0052
    top_ctr = surface_out(c_w, d, ease + 0.018, bvh=core.BVH_T)
    u_vals = np.linspace(-0.5, 0.5, n_half)
    Q_tail = []
    for ri in range(n_rows):
        v = ri / float(n_rows - 1)
        w_cur = width * (1.0 + 0.08 * v) * (0.72 if ri == 0 else (0.92 if ri == n_rows - 1 else 1.0))
        thk_cur = half_thk * (0.65 if ri in (0, n_rows - 1) else 1.0)
        p_row_c = top_ctr + np.array([0.0, 0.0, -tail * v]) + d * (0.028 * (v ** 1.15))
        ring_pts = []
        # Outer visible face (left to right)
        for j_c, u_c in enumerate(u_vals):
            edge_round = math.sqrt(max(0.08, 1.0 - (2.0 * u_c) ** 2))
            ring_pts.append(p_row_c + side * (u_c * w_cur) + d * (thk_cur * edge_round))
        # Inner backing face (right back to left)
        for j_c, u_c in enumerate(reversed(u_vals)):
            edge_round = math.sqrt(max(0.08, 1.0 - (2.0 * u_c) ** 2))
            ring_pts.append(p_row_c + side * (u_c * w_cur) - d * (thk_cur * edge_round))
        Q_tail.append(ring_pts)
    t_pt = Part(gid + '_sash_tail', np.array(Q_tail), True, ['body'] * n_rows, tail_paint, role='sash_tail')

    # 2. Sculpted 3D folded silk sash-knot bolster seated over the cummerbund at the hip origin
    knot_pos = surface_out(spine_at(core.WAIST - 0.010), d, ease + 0.012, bvh=core.BVH_T)
    knot_pt = blob(gid + '_sash_knot', knot_pos, (0.064, 0.034, 0.062), paint, n=12, rows=6, out=d, role='trinket')

    # 3. Pleated waist cummerbund band (`rows=7, n=48`)
    sash_band = torso_tube(gid + '_sash', core.WAIST + 0.032, core.WAIST - 0.044, ease + 0.005,
                           paint, rows=7, n=48, hull_from=core.WAIST + 0.1, role='band')
    return [sash_band, knot_pt, t_pt]


def pack_straps(gid_b, strap_paint, ease=0.021, width=0.026, thick=0.005):
    """Build paired smooth, twist-free, watertight-closed leather shoulder-harness loops for dorsal `back` packs.
    Uses a periodic 40-ring closed scye curve (`row[-1] == row[0]`) seated snugly (~20mm off skin, ~3mm over tunics)
    with parallel-transported flat ribbon frames; `conform_outfit_back_straps()` then molds it +2.5mm flush onto paired coats."""
    out = []
    TOP = core.TOP
    SHOULDER = core.SHOULDER
    CHEST = core.CHEST
    # Clamp base ease to snug tailored harness range (0.014..0.021m off skin) so straps never hover an inch in mid-air;
    # thicker paired coats/pauldrons are handled smoothly per-outfit by `conform_outfit_back_straps()`.
    eff_ease = min(max(float(ease), 0.014), 0.021)
    ht = thick * 0.5
    hw = width * 0.5
    n_loop = 40
    phis = np.linspace(0.0, 2.0 * math.pi, n_loop, endpoint=False)
    c_mid = spine_at(0.5 * (SHOULDER + CHEST))
    z_hi = TOP - 0.014
    z_lo = CHEST - 0.052
    z_ctr = 0.5 * (z_hi + z_lo)
    z_amp = 0.5 * (z_hi - z_lo)

    for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
        raw_pts = []
        raw_nrms = []
        for ph in phis:
            # ph=0: top of clavicle/shoulder saddle; ph=pi/2: anterior chest; ph=pi: lower axilla; ph=3pi/2: scapula
            s_ph, c_ph = math.sin(ph), math.cos(ph)
            z_t = z_ctr + z_amp * c_ph
            # Keep strap straight down pectoral/scapula (|x| ~ 0.094..0.118) so it hugs ribcage without loose armpit loops
            u_ax = max(0.0, -c_ph) ** 1.6
            x_t = sd * (0.094 + 0.024 * u_ax)
            c_sp = spine_at(min(max(z_t, CHEST - 0.10), TOP))
            if c_ph > 0.52:
                # Top of shoulder saddle: raycast straight down at fixed x_t
                ro = np.array([x_t, float(c_sp[1]) - 0.056 * s_ph, TOP + 0.12])
                hd = first_hit(ro, np.array([0.0, 0.0, -1.0]), maxd=0.28, bvh=core.BVH_T)
                z_surf = (TOP + 0.12 - float(hd)) if hd is not None else (SHOULDER + 0.018)
                loc = np.array([x_t, ro[1], z_surf], dtype=np.float64)
                nrm = np.array([0.0, -0.45 * s_ph, 0.90], dtype=np.float64)
                nrm /= np.linalg.norm(nrm)
            elif abs(s_ph) >= 0.38 and c_ph > -0.65:
                # Anterior chest (s_ph > 0) or dorsal scapula (s_ph < 0): raycast in Y at fixed x_t so it never slides into pauldrons!
                dy_dir = -1.0 if s_ph > 0.0 else 1.0
                ro = np.array([x_t, float(c_sp[1]), min(z_t, TOP - 0.006)])
                hy = first_hit(ro, np.array([0.0, dy_dir, 0.0]), maxd=0.26, bvh=core.BVH_T)
                y_surf = float(c_sp[1]) + dy_dir * (float(hy) if hy is not None else 0.102)
                loc = np.array([x_t, y_surf, z_t], dtype=np.float64)
                nrm = np.array([0.12 * sd, dy_dir, 0.0], dtype=np.float64)
                nrm /= np.linalg.norm(nrm)
            else:
                # Underarm ribcage arc: radial raycast from spine at z_t
                d_u = np.array([sd * (0.72 + 0.28 * u_ax), -0.68 * s_ph, -0.18], dtype=np.float64)
                d_u /= np.linalg.norm(d_u)
                hu = first_hit(c_sp, d_u, maxd=0.28, bvh=core.BVH_T)
                loc = c_sp + d_u * (float(hu) if hu is not None else 0.135)
                nrm = d_u
            raw_pts.append(loc + nrm * (eff_ease + ht))
            raw_nrms.append(nrm)

        P_lp = np.array(raw_pts, dtype=np.float64)
        N_lp = np.array(raw_nrms, dtype=np.float64)
        # 6 passes of periodic closed-loop smoothing + surface clearance projection so there are zero kinks
        for _ in range(6):
            P_lp = 0.50 * P_lp + 0.25 * (np.roll(P_lp, 1, axis=0) + np.roll(P_lp, -1, axis=0))
            N_lp = 0.50 * N_lp + 0.25 * (np.roll(N_lp, 1, axis=0) + np.roll(N_lp, -1, axis=0))
            N_lp /= np.maximum(np.linalg.norm(N_lp, axis=1, keepdims=True), 1e-9)
            for k_p in range(n_loop):
                loc_s, n_s = core.nearest(P_lp[k_p], core.BVH_T)
                clr_s = float((P_lp[k_p] - loc_s).dot(n_s))
                if clr_s < eff_ease + ht:
                    P_lp[k_p] = P_lp[k_p] + n_s * (eff_ease + ht - clr_s)
                if float(N_lp[k_p].dot(n_s)) < 0.25:
                    N_lp[k_p] = n_s

        n_ring = 8
        angs_r = np.linspace(0.0, 2.0 * math.pi, n_ring, endpoint=False)
        Q_st = []
        prev_b = None
        for k_p in range(n_loop):
            p_k = P_lp[k_p]
            t_vec = P_lp[(k_p + 1) % n_loop] - P_lp[(k_p - 1) % n_loop]
            t_vec /= max(float(np.linalg.norm(t_vec)), 1e-9)
            n_ortho = N_lp[k_p] - t_vec * float(np.dot(N_lp[k_p], t_vec))
            if np.linalg.norm(n_ortho) < 1e-5:
                n_ortho = np.array([0.0, 0.0, 1.0]) - t_vec * t_vec[2]
            n_ortho /= max(float(np.linalg.norm(n_ortho)), 1e-9)
            b_lat = np.cross(t_vec, n_ortho)
            b_lat /= max(float(np.linalg.norm(b_lat)), 1e-9)
            # Enforce consistent ribbon orientation around the entire loop so the strap NEVER twists 180 degrees
            if prev_b is not None and float(np.dot(b_lat, prev_b)) < 0.0:
                b_lat = -b_lat
                n_ortho = -n_ortho
            prev_b = b_lat
            ring_v = []
            for ar in angs_r:
                vp = p_k + b_lat * (math.cos(ar) * hw) + n_ortho * (math.sin(ar) * ht)
                loc_v, n_v = core.nearest(vp, core.BVH_T)
                clr_v = float((vp - loc_v).dot(n_v))
                if clr_v < eff_ease * 0.85:
                    vp = vp + n_v * (eff_ease * 0.85 - clr_v)
                ring_v.append(vp)
            Q_st.append(ring_v)
        # Explicitly close axis 0 (`row[40] == row[0]`) so the loop is 100% seamless with zero disjointed gap!
        Q_st.append([v.copy() for v in Q_st[0]])
        out.append(Part(f'{gid_b}_strap_{tag}', np.array(Q_st), True, ['body'] * len(Q_st),
                        strap_paint, role='band'))
    return out


def stacked_belts(gid, n_belts=3, ease=0.024):
    """Stacked leather belts with brass studs and side pouches (de-vendored from `animal_belts`)."""
    belt_p = P('leather', 0.05, [B('top', 0.0, 0.25, 'beads', 'brass', 'leather', 0.035)])
    pouch_p = P('saddle', 0.06, [B('top', 0.0, 0.02, 'solid', 'brass')])
    parts = []
    for i in range(n_belts):
        zb = core.WAIST + 0.03 - i * 0.032
        # (role band, not belt: a numbered belt never took the hips' rigid skinning, its suffix is not '_belt')
        parts.append(torso_tube(f'{gid}_belt{i}', zb, zb - 0.026, ease + 0.002 * i, belt_p, rows=3, n=40, hull_from=core.WAIST + 0.1, role='band'))
    c = spine_at(core.WAIST - 0.02)
    for k, d in enumerate((np.array([-0.85, -0.52, 0]), np.array([0.85, -0.52, 0]))):
        d = d / np.linalg.norm(d)
        parts.append(blob(f'{gid}_pouch{k}', surface_out(c, d, 0.022), (0.07, 0.036, 0.08), pouch_p, out=d, role='accessory'))
    return parts


def button_row(gid, z_top, z_bot, n_buttons=5, paint=None, ease=0.024, double=False):
    """Single or double-breasted row of 3D buttons down the chest (de-vendored from `_buttons`)."""
    bp = paint or P('brass', 0.02, fabric='metal.gold')
    out = []
    for i, z in enumerate(np.linspace(z_top, z_bot, n_buttons)):
        if double:
            for k, dx in enumerate((-0.042, 0.042)):
                out.append(blob(f'{gid}_btn_{i}_{k}', chest_front(z, ease, x=dx), (0.018, 0.012, 0.018), bp, n=8, rows=4, role='trinket'))
        else:
            out.append(blob(f'{gid}_btn_{i}', chest_front(z, ease), (0.018, 0.012, 0.018), bp, n=8, rows=4, role='trinket'))
    return out


# Backward-compatible aliases
izani_belt = pouch_belt
izani_sash = sash_with_tail
animal_belts = stacked_belts
_buttons = button_row


def eye_disc(name, at, out, size, paint, iris_paint):
    """Almond eye boss with raised iris (Dalab / Eternal State emblem)."""
    out = np.asarray(out, float) / np.linalg.norm(out)
    return [blob(name, at, (size, size * 0.18, size * 0.6), paint, n=14, rows=6, out=out),
            blob(name + '_iris', at + out * size * 0.1, (size * 0.36, size * 0.12, size * 0.36), iris_paint, n=10, rows=5, out=out)]


def pendants(name, z, angles, size, paint, ease=0.020):
    """Small hanging trophies (claws, teeth, shells, bells, coins) around the body at height z touching the belt/girdle."""
    c = spine_at(z)
    eff_ease = min(float(ease), 0.021)
    out = []
    for k, an in enumerate(angles):
        d = np.array([math.sin(an), math.cos(an), 0])
        h = first_hit(c, d, bvh=core.BVH_T) or 0.14
        out.append(blob('%s%d' % (name, k), c + d * (h + eff_ease) + np.array([0, 0, -size[2] * 0.55]), size, paint, n=8, rows=5, out=d, role='trinket'))
    return out


def tube(name, path, r, paint, n=8, rigid_joint=None):
    pts = np.array(path, float)
    d0 = pts[1] - pts[0]
    d0 /= max(np.linalg.norm(d0), 1e-9)
    d1 = pts[-1] - pts[-2]
    d1 /= max(np.linalg.norm(d1), 1e-9)
    body_rows = max(5, len(pts) * 2)
    body_part = horn(name, pts, r, r, paint, n=n, rows=body_rows, rigid_joint=rigid_joint)
    Q_body = body_part.P
    c_top = pts[0] - d0 * (r * 0.06)
    c_bot = pts[-1] + d1 * (r * 0.06)
    top_rim = c_top + (Q_body[0] - pts[0]) * 0.94
    top_ctr = c_top + (Q_body[0] - pts[0]) * 0.02
    bot_rim = c_bot + (Q_body[-1] - pts[-1]) * 0.94
    bot_ctr = c_bot + (Q_body[-1] - pts[-1]) * 0.02
    Q_capped = np.concatenate([[top_ctr, top_rim], Q_body, [bot_rim, bot_ctr]], axis=0)
    return Part(name, Q_capped, True, ['body'] * len(Q_capped), paint, rigid_joint=rigid_joint)


def strap(name, path, width, paint, rigid_joint=None):
    return horn(name, path, width * 0.5, width * 0.5, paint, n=8, rows=max(5, len(path) * 2), rigid_joint=rigid_joint, role='band')


def tassel(name, top_pos, length, radius, paint, rigid_joint=None):
    bot_pos = np.asarray(top_pos, float) - np.array([0.0, 0.0, length])
    return horn(name, [top_pos, bot_pos], radius * 0.85, radius * 1.15, paint, n=8, rows=6, rigid_joint=rigid_joint, role='accessory')


def rosette(name, center, out_vec, side_vec, radius, paint, n=14, thick=0.014, rigid_joint=None):
    return blob(name, center, (radius * 2.0, thick * 2.0, radius * 2.0), paint,
                n=n, rows=5, out=out_vec, rigid_joint=rigid_joint, role='accessory')
