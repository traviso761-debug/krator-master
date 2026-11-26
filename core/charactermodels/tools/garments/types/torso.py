"""Layer 2 (Torso): Tunics, robes, coats, collars, capes, tabards, sashes, and pauldrons.

Consolidates all torso-type primitives (`torso_tube`, `collar`, `stand_collar`, `collar_disc`,
`cape`, `tabard`, `crossed_sash`, `band`, `pauldron`, `neck_ring`) into one garment-type module.
"""
import math
import numpy as np
from .. import core
from ..core import (
    Part, J, spine_at, first_hit, frame, ring_points, smooth_push, hang, hull_rows
)
from ..paint import P


def torso_tube(name, z0, z1, ease=0.020, paint=None, n=40, hang_from=None, flare=0.0, arc=None, rows=None,
               group_below=None, scale=(1.0, 1.0), ease_bottom=None, iters=3, hang_side=None, points=None,
               hull_from=None, over_arms=False, stiff=0.12, layer=None, yoke=False, role=None, side=None, **kw):
    """Unified torso tube builder supporting both (z_top, z_bot, ease, paint) and (z_bot, z_top, paint, ease=...) call styles."""
    if isinstance(ease, dict) and (paint is None or isinstance(paint, (int, float))):
        # Called in Batch 2 order: torso_tube(name, z_bot, z_top, paint, ease=...)
        actual_paint = ease
        actual_ease = float(paint) if paint is not None else kw.get('ease', 0.024)
    else:
        actual_paint = paint
        actual_ease = float(ease)

    z_top, z_bot = max(z0, z1), min(z0, z1)
    if hang_from is None and (flare > 0 or z_bot < core.CROTCH):
        hang_from = min(z_top - 0.03, core.WAIST - 0.02)
    if group_below is None and z_bot < core.CROTCH:
        group_below = core.CROTCH + 0.02
    if hull_from is None and z_bot < core.WAIST:
        hull_from = min(z_top, core.WAIST)
    jagged = kw.get('jagged', kw.get('Jagged', 0.0))
    if points is None and jagged:
        points = (jagged, 2.0)

    # Always raycast against the trunk BVH (BVH_T) so torso/cloak tubes never
    # tent out over the outstretched A-pose arms/forearms or inherit arm weights.
    bvh = core.BVH_T
    zs = []
    z = z_top
    while z > z_bot + 1e-4:
        zs.append(z)
        step = 0.012 if z > core.SHOULDER - 0.04 else 0.03
        z -= step
    if zs and zs[-1] - z_bot < 0.008:
        zs[-1] = z_bot
    else:
        zs.append(z_bot)
    if rows and z_top <= core.SHOULDER - 0.02:
        zs = list(np.linspace(z_top, z_bot, rows))
    if arc:
        angles = np.linspace(arc[0], arc[1], n)
    else:
        angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    extra_arm = 0.010 if over_arms else 0.0
    Es = np.linspace(actual_ease + extra_arm, (ease_bottom if ease_bottom is not None else actual_ease) + extra_arm * 0.5, len(zs))
    rmax = kw.get('rmax', 0.30 if over_arms else 0.6)
    P_grid = np.array([ring_points(spine_at(zz), x, y, angles, Es[k], rmin=0.05, rmax=rmax, scale=scale, bvh=bvh) for k, zz in enumerate(zs)])
    axes = [spine_at(zz) for zz in zs]
    near = lambda zz: int(np.argmin([abs(zv - zz) for zv in zs]))
    start = None
    if hang_from is not None:
        hs = hang_side if hang_side is not None else hang_from
        hb = hang_from
        if arc is None and not over_arms and z_bot < core.CROTCH and hang_from > core.CROTCH + 0.02:
            hb = core.CROTCH + 0.02
        start = [near(hs) if abs(math.sin(a)) > 0.55 else near(hb) if math.cos(a) > 0 else near(hang_from) for a in angles]
        P_grid = hang(P_grid, axes, start, flare)
    P_grid = smooth_push(P_grid, arc is None, actual_ease, iters=iters, rows_ease=Es, bvh=bvh)
    if hang_from is not None:
        P_grid = hang(P_grid, axes, start, flare)
    if hull_from is not None and not over_arms:
        h_rows = [i for i, zz in enumerate(zs) if zz < hull_from]
        if arc is None:
            P_grid = hull_rows(P_grid, axes, h_rows)
        elif h_rows:
            ang_full = np.linspace(0, 2 * math.pi, 36, endpoint=False)
            P_full = np.array([ring_points(spine_at(zz), x, y, ang_full, Es[k], rmin=0.05, rmax=rmax, scale=scale, bvh=bvh) for k, zz in enumerate(zs)])
            if hang_from is not None:
                st_full = [near(hs) if abs(math.sin(a)) > 0.55 else near(hb) if math.cos(a) > 0 else near(hang_from) for a in ang_full]
                P_full = hang(P_full, axes, st_full, flare)
            P_full = smooth_push(P_full, True, actual_ease, iters=iters, rows_ease=Es, bvh=bvh)
            if hang_from is not None:
                P_full = hang(P_full, axes, st_full, flare)
            P_full = hull_rows(P_full, axes, h_rows)
            for i in h_rows:
                c2 = axes[i][:2]
                r_full = np.linalg.norm(P_full[i, :, :2] - c2, axis=1)
                a_full = np.mod(np.arctan2(P_full[i, :, 0] - c2[0], P_full[i, :, 1] - c2[1]), 2 * math.pi)
                order = np.argsort(a_full)
                af_s = np.concatenate([a_full[order] - 2 * math.pi, a_full[order], a_full[order] + 2 * math.pi])
                rf_s = np.tile(r_full[order], 3)
                for j in range(P_grid.shape[1]):
                    d2 = P_grid[i, j, :2] - c2
                    rj = np.linalg.norm(d2)
                    aj = math.atan2(d2[0], d2[1]) % (2 * math.pi) if rj > 1e-6 else (angles[j] % (2 * math.pi))
                    r_want = float(np.interp(aj, af_s, rf_s))
                    if rj < r_want:
                        u2 = d2 / rj if rj > 1e-6 else np.array([math.sin(aj), math.cos(aj)])
                        P_grid[i, j, :2] = c2 + u2 * r_want
    if points:
        depth, pw = points
        top_z = zs[start[0]] if start else zs[0]
        for j, a in enumerate(angles):
            f = 1 + depth / max(0.05, top_z - zs[-1]) * abs(math.cos(a)) ** pw
            for i in range(len(zs)):
                if zs[i] < top_z:
                    zn = top_z - (top_z - zs[i]) * f
                    d = P_grid[i, j] - axes[i]
                    d[2] = 0
                    P_grid[i, j] = np.array([axes[i][0], axes[i][1], zn]) + d * (1 + (f - 1) * 0.5 * (top_z - zs[i]) / max(0.05, top_z - zs[-1]))
    grp = ['helper-skirt' if (group_below is not None and P_grid[k, :, 2].mean() < group_below) else 'body' for k in range(len(zs))]
    pt = Part(name, P_grid, arc is None, grp, actual_paint, role=role, side=side)
    pt.over_arms = over_arms
    if hang_from is not None:
        pt.cloth = {'start': start, 'stiff': stiff}
        if layer is not None:
            pt.cloth['layer'] = layer
    if yoke and z_top >= core.NECK[2] - 0.015:
        yoke_part = collar_disc(f'{name}_yoke', 0.085, P('gold', 0.02, fabric='metal.gold'), drop=0.032, rows=4, n=36,
                                scallop=0.0, ease=actual_ease + 0.004, z_off=0.004)
        return [pt, yoke_part]
    return pt


def collar(name, paint, height=0.055, flare=0.018, ease=0.024, open_front=False, rows=5, n=32, **kw):
    """Standing collar ring around the base of the neck, optionally open at the front (extruded from the neck base so it never snags the chin)."""
    h_eff = min(float(kw.get('h', height)), 0.038)
    z_top = core.TOP + h_eff
    z_bot = core.TOP - 0.014
    zs = np.linspace(z_top, z_bot, rows)
    closed = (not open_front) if isinstance(open_front, bool) else (float(open_front) <= 0.02)
    if closed:
        angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    else:
        of_val = 0.65 if isinstance(open_front, bool) else float(open_front)
        half = math.pi - of_val * 0.45
        angles = np.linspace(-half, half, n)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    z_ref = core.NECK[2] - 0.006
    c_ref = spine_at(z_ref)
    base_ring = np.array(ring_points(c_ref, x, y, angles, ease, rmin=0.052, rmax=0.088, bvh=core.BVH_T))
    rel_xy = base_ring[:, :2] - c_ref[:2]
    Q = []
    for k, z in enumerate(zs):
        u_top = 1.0 - (k / max(rows - 1, 1))
        cz = spine_at(z)
        scale_r = 1.0 + (flare / max(0.065, ease + 0.05)) * u_top
        row_xy = cz[:2] + rel_xy * scale_r
        Q.append(np.column_stack([row_xy, np.full(len(angles), z)]))
    return Part(name, np.array(Q), closed, ['body'] * rows, paint, role='collar')


def stand_collar(gid, paint, high=0.07, arc=None):
    """High standing court/guild collar (de-vendored from `izani_collar`)."""
    return collar(gid + '_collar', paint, height=min(high, 0.038), flare=0.012, ease=0.022, open_front=(arc is not None), rows=5, n=32)


izani_collar = stand_collar


def collar_disc(name, width, paint, drop=0.05, rows=8, n=48, scallop=0.12, ease=0.018, z_off=0.0, rigid_joint=None):
    """Broad pectoral/mantle collar around the neck that drapes flush along the sloped shoulders, chest, and upper back."""
    rows = max(int(rows), 8)
    z_top = core.TOP + min(float(z_off), 0.0) - 0.002
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    eff_drop = max(float(drop), float(width) * 0.88, 0.064)
    base_ease = min(max(float(ease), 0.016), 0.023)
    zs = np.linspace(z_top, z_top - eff_drop, rows)
    Es = np.linspace(max(0.014, base_ease - 0.002), base_ease + 0.002, rows)
    Q = np.array([
        ring_points(spine_at(min(zz, core.TOP)), x, y, angles, Es[k], rmin=0.052, rmax=0.22, bvh=core.BVH_T)
        for k, zz in enumerate(zs)
    ], dtype=np.float64)
    # Seat lateral trapezius/clavicle saddle columns directly onto the sloped shoulder roof via downward raycast
    for k in range(rows):
        e_k = Es[k]
        for j in range(n):
            px, py, pz = float(Q[k, j, 0]), float(Q[k, j, 1]), float(Q[k, j, 2])
            c_xy = spine_at(min(pz, core.TOP))[:2]
            dy_rel = py - float(c_xy[1])
            if abs(px) >= 0.068 and abs(dy_rel) <= 0.068 and pz >= core.SHOULDER - 0.035:
                ro = np.array([px, py, core.TOP + 0.12])
                hd = first_hit(ro, np.array([0.0, 0.0, -1.0]), maxd=0.26, bvh=core.BVH_T)
                if hd is not None:
                    z_surf = core.TOP + 0.12 - float(hd)
                    Q[k, j, 2] = z_surf + e_k
    # Light tangential Laplacians without ballooning upward off the clavicles
    for _ in range(2):
        Q_nb = 0.50 * Q + 0.25 * np.roll(Q, 1, axis=1) + 0.25 * np.roll(Q, -1, axis=1)
        Q[1:-1] = 0.65 * Q_nb[1:-1] + 0.175 * Q_nb[:-2] + 0.175 * Q_nb[2:]
        Q[0] = Q_nb[0]
        Q[-1] = Q_nb[-1]
    if scallop > 0.0:
        sc_amp = min(float(scallop), 0.08) * eff_drop * 0.40
        for k in range(1, rows):
            s = k / float(rows - 1)
            for j, an in enumerate(angles):
                Q[k, j, 2] -= sc_amp * (s ** 1.3) * (0.5 - 0.5 * math.cos(8.0 * an))
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint=rigid_joint, role='collar')


def cape(name, z_bot, paint, z_top=None, span=0.52, ease=0.025, flare=0.08, rows=16, n=26, top=None, stiff=0.18, back_push=0.0):
    """Back cape/mantle clasped cleanly at the rear collar/clavicle saddle (never winging out over lateral deltoids)."""
    zt_req = top if top is not None else (z_top if z_top is not None else (core.TOP - 0.010))
    zt = min(max(float(zt_req), core.TOP - 0.016), core.TOP - 0.006)
    half = span if span > 0.85 else span * math.pi
    half = min(max(half, 0.25 * math.pi), 0.31 * math.pi)
    flare = min(float(flare), 0.22)
    # Clamp upper-back base ease (22..28mm off bare skin = ~6..10mm over tunics/coats) so capes never billow out at shoulders!
    body_ease = min(max(float(ease), 0.022), 0.028)
    n_cols = max(int(n), 34)
    pt = torso_tube(name, zt, z_bot, body_ease, paint, n=n_cols, rows=max(int(rows), 24),
                    arc=(-half, half), hang_from=min(zt - 0.06, core.SHOULDER - 0.02), flare=flare,
                    group_below=core.CROTCH + 0.05, iters=2, over_arms=False, stiff=float(stiff), layer=2)
    # Optional posterior clearance sweep below shoulder clasp for capes worn over bulky coats/robes
    if back_push > 0.0:
        R_bp = pt.P.shape[0]
        for k_bp in range(6, R_bp):
            u_bp = (k_bp - 5) / float(max(R_bp - 6, 1))
            pt.P[k_bp, :, 1] += float(back_push) * (u_bp ** 1.15)
    # Taper upper 7 rows inward into a clean rear-clavicle clasp (`|x| <= 0.116` at row 0, medial to deltoids, zero neck climb)
    R_p, C_p = pt.P.shape[:2]
    n_seat = min(7, R_p)
    for k in range(n_seat):
        w_top = 1.0 - (k / float(max(n_seat, 1)))
        w_clasp = w_top * w_top
        e_sh = 0.016 * w_top + body_ease * (1.0 - w_top)
        x_lim = 0.116 * w_clasp + 0.25 * (1.0 - w_clasp)
        for j in range(C_p):
            px, py, pz = float(pt.P[k, j, 0]), float(pt.P[k, j, 1]), float(pt.P[k, j, 2])
            if abs(px) > x_lim:
                px = math.copysign(x_lim, px) * w_clasp + px * (1.0 - w_clasp)
                pt.P[k, j, 0] = px
            c_xy = spine_at(min(pz, core.TOP - 0.008))[:2]
            dx, dy = px - float(c_xy[0]), py - float(c_xy[1])
            r_cur = math.hypot(dx, dy)
            if r_cur > 1e-6 and w_top > 0.05:
                d_dir = np.array([dx / r_cur, dy / r_cur, 0.0])
                h_t = first_hit(spine_at(min(pz, core.TOP - 0.008)), d_dir, bvh=core.BVH_T)
                if h_t is not None:
                    r_target = h_t + e_sh
                    r_blended = w_top * r_target + (1.0 - w_top) * r_cur
                    pt.P[k, j, 0] = c_xy[0] + d_dir[0] * r_blended
                    pt.P[k, j, 1] = c_xy[1] + d_dir[1] * r_blended
            px2, py2 = float(pt.P[k, j, 0]), float(pt.P[k, j, 1])
            dy_rel = py2 - float(c_xy[1])
            # Only slope downward across lateral clavicle/shoulder (`|x| >= 0.092`), NEVER upward onto the neck!
            if abs(px2) >= 0.092 and abs(dy_rel) <= 0.085 and pz >= core.SHOULDER - 0.045:
                ro = np.array([px2, py2, core.TOP + 0.12])
                hd = first_hit(ro, np.array([0.0, 0.0, -1.0]), maxd=0.28, bvh=core.BVH_T)
                if hd is not None:
                    z_surf = core.TOP + 0.12 - float(hd)
                    pt.P[k, j, 2] = min(pz, w_top * (z_surf + e_sh) + (1.0 - w_top) * pz)
        # Smooth upper collar/shoulder rows along columns so lateral borders stay completely crease-free
        if C_p >= 6:
            row_cp = pt.P[k].copy()
            pt.P[k, 1:-1] = 0.50 * row_cp[1:-1] + 0.25 * (row_cp[:-2] + row_cp[2:])
    # Guarantee monotonic lateral X broadening from shoulder blades (`k >= n_seat`) to hem so the waist NEVER pinches inward in X!
    for k in range(max(1, n_seat), R_p):
        dz_k = max(0.0, float(pt.P[k - 1, :, 2].mean() - pt.P[k, :, 2].mean()))
        x_prev = np.abs(pt.P[k - 1, :, 0])
        u_col = np.abs(np.linspace(-1.0, 1.0, C_p))
        min_x_k = x_prev + 0.045 * dz_k * u_col
        cur_x_k = np.abs(pt.P[k, :, 0])
        need_w = cur_x_k < min_x_k
        if need_w.any():
            sgn_x = np.where(pt.P[k, :, 0] >= 0.0, 1.0, -1.0)
            sgn_x[C_p // 2] = 0.0
            pt.P[k, need_w, 0] = sgn_x[need_w] * min_x_k[need_w]
    # Anchor live cloth chains at `Spine` (`~14 cm` ABOVE `Hips` and `< Spine1` for Gate 4!) so `50-figure.js` fades `fk`
    # smoothly across `Spine -> Hips` with ZERO mid-cape step kink and full `layered()` protection over glutes & coats!
    if float(z_bot) < core.CROTCH + 0.02:
        z_sp_mid = 0.5 * (float(core.J('Spine')[2]) + float(core.J('Spine1')[2])) - 0.015
        z_cloth = min(zt - 0.14, z_sp_mid)
        r_cloth = int(np.argmin(np.abs(pt.P[:, :, 2].mean(axis=1) - z_cloth)))
        if r_cloth < R_p - 2:
            pt.cloth = {'start': r_cloth, 'stiff': 0.18, 'layer': 2}
        else:
            pt.cloth = None
    else:
        pt.cloth = None
    return pt


def tabard(name, z_bot, z_top, paint, width=0.22, ease=0.032, front=True, back=False, center_ang=None, hull_from=None):
    """Narrow open woven/armored hanging panel (stole, apron, or tasset) contoured to the trunk with waist-bridge hull support."""
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    half_ang = max(0.18, min(0.58, width * 1.42))
    rows = 22
    cols = 15
    zs = np.linspace(z0, z1, rows)
    z_anchor_min = core.CROTCH + 0.04
    z_hull = hull_from if hull_from is not None else (min(z0, core.CHEST + 0.02) if (z0 >= core.WAIST + 0.04 and z1 < core.WAIST) else None)

    def _make_panel(pname, c_ang):
        angs = np.linspace(c_ang - half_ang, c_ang + half_ang, cols)
        r_hull_ref = None
        if z_hull is not None:
            c_hl = spine_at(max(z_hull, z_anchor_min))
            r_hull_ref = []
            for an in angs:
                d = np.array([math.sin(an), math.cos(an), 0.0])
                hh = first_hit(c_hl, d, bvh=core.BVH_T)
                r_hull_ref.append((hh if (hh is not None and hh > 0.06) else 0.125) + ease)
        Q = []
        for i, z in enumerate(zs):
            z_ray = max(z, z_anchor_min)
            c = spine_at(z_ray)
            dz = max(0.0, core.WAIST - z)
            row = []
            for j_a, an in enumerate(angs):
                d = np.array([math.sin(an), math.cos(an), 0.0])
                h = first_hit(c, d, bvh=core.BVH_T)
                if h is None or h <= 0.05:
                    loc_n, _ = core.nearest(c + d * 0.09, bvh=core.BVH_T)
                    h = max(0.055, float(np.hypot(loc_n[0] - c[0], loc_n[1] - c[1])))
                r = h + ease + 0.145 * dz
                if r_hull_ref is not None and z < z_hull:
                    r = max(r, r_hull_ref[j_a] + 0.145 * dz)
                px_r, py_r, pz_r = c[0] + d[0] * r, c[1] + d[1] * r, z
                if z >= core.SHOULDER - 0.030 and abs(px_r) >= 0.055:
                    hd_s = first_hit(np.array([px_r, py_r, core.TOP + 0.12]), np.array([0.0, 0.0, -1.0]), maxd=0.28, bvh=core.BVH_T)
                    if hd_s is not None:
                        pz_r = min(pz_r, (core.TOP + 0.12 - float(hd_s)) + min(ease, 0.024))
                row.append(np.array([px_r, py_r, pz_r]))
            Q.append(row)
        Q = np.array(Q)
        for _ in range(2):
            Q_new = Q.copy()
            for i in range(1, rows - 1):
                for j in range(1, cols - 1):
                    Q_new[i, j, :2] = 0.5 * Q[i, j, :2] + 0.125 * (
                        Q[i - 1, j, :2] + Q[i + 1, j, :2] + Q[i, j - 1, :2] + Q[i, j + 1, :2]
                    )
            Q = Q_new
        grp = ['helper-skirt' if z < core.CROTCH + 0.02 else 'body' for z in zs]
        pt = Part(pname, Q, False, grp, paint, role='drape')
        if z0 - z1 >= 0.16:
            start_r = int(np.argmin(np.abs(zs - min(z0 - 0.02, core.WAIST))))
            pt.cloth = {'start': start_r, 'stiff': 0.10, 'layer': 2}
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


def band(name, z_low, z_high, width, ease, paint, high=math.pi / 2, n=48, rows=4, iters=2):
    """Band around the torso on a tilted plane (baldric, sash, or himation)."""
    if z_high >= core.SHOULDER - 0.02:
        z_high = max(float(z_high), core.TOP - 0.042)
    z_high = min(z_high, core.TOP - 0.032)
    zm, amp = (z_high + z_low) / 2, (z_high - z_low) / 2
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    x_clavicle = 0.106
    Q = []
    for r in range(rows):
        dz = (r / (rows - 1) - 0.5) * width
        cs = []
        ds = []
        rs = []
        for a in angles:
            z = zm + amp * math.cos(a - high) - dz
            c = spine_at(min(z, core.TOP))
            d = x * math.cos(a) + y * math.sin(a)
            d = d / np.linalg.norm(d)
            h = first_hit(c, d, bvh=core.BVH_T)
            cs.append(c)
            ds.append(d)
            rs.append(np.nan if h is None else h + ease)
        rs = np.array(rs, dtype=np.float64)
        if np.isnan(rs).all():
            rs[:] = 0.13
        elif np.isnan(rs).any():
            k = np.arange(len(rs))
            ok = ~np.isnan(rs)
            rs = np.interp(k, np.concatenate([k[ok] - len(rs), k[ok], k[ok] + len(rs)]), np.tile(rs[ok], 3))
        row = []
        for a, c, d, rv in zip(angles, cs, ds, rs):
            pt = c + d * min(max(0.10, float(rv)), 0.21)
            # Smoothly taper lateral width from waist (0.142) to clavicle (0.114) across the whole upper torso
            # so a diagonal bandolier travels in a clean straight line across the chest without swinging into the armpit
            u_sh = min(1.0, max(0.0, (pt[2] - core.WAIST) / max(0.05, core.SHOULDER - core.WAIST)))
            x_lim = (1.0 - u_sh) * 0.144 + u_sh * x_clavicle
            if abs(pt[0]) > x_lim:
                pt[0] = math.copysign(x_lim, pt[0])
            # Re-project front/back Y at the clamped X so clamping X never pushes the strap inside the chest/back,
            # and raycast straight down onto the clavicle/trapezius roof over the top of the shoulder so it lies flush!
            dy_rel = float(pt[1] - c[1])
            if pt[2] >= core.SHOULDER - 0.045 and abs(dy_rel) <= 0.064:
                ro_sh = np.array([pt[0], pt[1], core.TOP + 0.12])
                h_dn = first_hit(ro_sh, np.array([0.0, 0.0, -1.0]), maxd=0.30, bvh=core.BVH_T)
                if h_dn is not None:
                    pt[2] = (core.TOP + 0.12 - float(h_dn)) + ease
            else:
                dy_sign = -1.0 if dy_rel < 0.0 else 1.0
                c_x = np.array([pt[0], c[1], min(pt[2], core.TOP - 0.005)])
                h_y = first_hit(c_x, np.array([0.0, dy_sign, 0.0]), bvh=core.BVH_T)
                if h_y is not None:
                    pt[1] = c[1] + dy_sign * (float(h_y) + ease)
            row.append(pt)
        Q.append(row)
    Q = np.array(Q, dtype=np.float64)
    return Part(name, Q, True, ['body'] * rows, paint, role='band')


def crossed_sash(name, paint, width=0.06, ease=0.022):
    """Diagonal sash from waist to opposite shoulder."""
    return band(name, core.WAIST, core.SHOULDER + 0.015, width, ease, paint, high=math.pi * 0.45, rows=5)


def pauldron(name, side, paint, reach=0.36, ease=0.024, flare_end=0.95, span=1.55, rows=6, n=14, drop=None, lift=None):
    """Shoulder armor plate or epaulette contoured over the deltoid."""
    from .limbs import limb_tube
    if drop is not None:
        reach = min(0.42, max(0.24, drop * 2.2))
    else:
        reach = min(float(reach), 0.38)
    if lift is not None:
        ease = 0.022 + min(float(lift), 0.016) * 0.4
        flare_end = 1.00
    else:
        ease = min(float(ease), 0.026)
        flare_end = min(float(flare_end), 1.02)
    if span < 0.85:
        span = max(1.30, min(1.70, span * 7.0))
    else:
        span = min(float(span), 1.65)
    a, e = J(side + 'Arm'), J(side + 'ForeArm')
    x, y = frame(e - a)
    c = math.atan2(y[2], x[2])
    pt = limb_tube(name, None, None, ease, paint, n=n, rows=rows, ease_end=ease * flare_end, start_back=0.022,
                   path=[a, a + (e - a) * reach], arc=(c - span, c + span), bvh=core.BVH_A, rmax=0.14)
    pt.role = 'pauldron'
    pt.side = side[0]
    return pt


def neck_ring(name, paint, r_tube=0.035, drop=0.02, n=32, nr=10):
    """Toroidal neck ring / torc / padded collar ring around the base of the neck."""
    c = spine_at(core.TOP - drop)
    R_maj = 0.125 + r_tube * 0.85
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    phis = np.linspace(0, 2 * math.pi, nr, endpoint=False)
    Q = []
    for ph in phis:
        r_cur = R_maj + r_tube * math.cos(ph)
        z_cur = c[2] + r_tube * math.sin(ph) * 0.75 - drop * 0.3
        row = [np.array([c[0] + math.sin(an) * r_cur, c[1] + math.cos(an) * r_cur, z_cur]) for an in angs]
        Q.append(row)
    return Part(name, np.array(Q), True, ['body'] * nr, paint, rigid_joint='Spine2', role='collar')
