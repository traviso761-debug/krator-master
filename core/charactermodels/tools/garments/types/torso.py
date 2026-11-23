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


def collar_disc(name, width, paint, drop=0.05, rows=4, n=48, scallop=0.12, ease=0.02, z_off=0.005, rigid_joint=None):
    """Broad flat pectoral/shell collar around the neck lying over the shoulders."""
    zs = core.TOP + z_off
    c = spine_at(zs)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    Q = []
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    outer_ease = max(ease, 0.026)
    for k in range(rows):
        s = k / (rows - 1)
        e_k = ease + (outer_ease - ease) * min(1.0, s * 2.0)
        row = []
        for an in angles:
            d = x * math.cos(an) + y * math.sin(an)
            h = first_hit(c, d, bvh=core.BVH) or 0.07
            r = h + e_k + s * width * (1 + scallop * abs(math.cos(8 * an)))
            row.append(c + d * r + np.array([0, 0, -drop * s * s]))
        Q.append(row)
    Q = smooth_push(np.array(Q), True, outer_ease, iters=1, fix_top=True)
    # (no role yet: as a drape the Yuni duster's shoulder cape stood off the shoulders and showed its underside from behind,
    # the audit's "inside" 17345 to 23853 px; as a shoulder cap it is skinned to the arms. Its right treatment is Phase 2's)
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint=rigid_joint)


def cape(name, z_bot, paint, z_top=None, span=0.52, ease=0.035, flare=0.08, rows=16, n=26, top=None):
    """Back cape/mantle over the shoulders, supporting both radians (`span > 0.85`) and fraction-of-circle (`span <= 0.85`)."""
    zt = top if top is not None else (z_top if z_top is not None else (core.SHOULDER + 0.02))
    zt = min(zt, core.TOP + 0.01)
    half = span if span > 0.85 else span * math.pi
    half = min(half, 0.40 * math.pi)
    flare = min(flare, 0.12)
    return torso_tube(name, zt, z_bot, max(ease, 0.036), paint, n=n, rows=rows,
                      arc=(-half, half), hang_from=zt - 0.03, flare=flare,
                      group_below=core.CROTCH + 0.05, iters=2, over_arms=False, stiff=0.05, layer=2)


def tabard(name, z_bot, z_top, paint, width=0.22, ease=0.032, front=True, back=False, center_ang=None):
    """Narrow open woven/armored hanging panel (stole, apron, or tasset) contoured to the trunk."""
    z0, z1 = max(z_bot, z_top), min(z_bot, z_top)
    half_ang = max(0.18, min(0.58, width * 1.42))
    rows = 12
    cols = 11
    zs = np.linspace(z0, z1, rows)
    z_anchor_min = core.CROTCH + 0.04

    def _make_panel(pname, c_ang):
        angs = np.linspace(c_ang - half_ang, c_ang + half_ang, cols)
        Q = []
        for i, z in enumerate(zs):
            z_ray = max(z, z_anchor_min)
            c = spine_at(z_ray)
            dz = max(0.0, z_anchor_min - z)
            row = []
            for an in angs:
                d = np.array([math.sin(an), math.cos(an), 0.0])
                h = first_hit(c, d, bvh=core.BVH_T)
                r = (h if (h is not None and h > 0.06) else 0.125) + ease + 0.065 * dz
                row.append(np.array([c[0] + d[0] * r, c[1] + d[1] * r, z]))
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
    z_high = min(z_high, core.SHOULDER + 0.015)
    zm, amp = (z_high + z_low) / 2, (z_high - z_low) / 2
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    x, y = np.array([0, 1.0, 0]), np.array([1.0, 0, 0])
    x_clavicle = 0.126
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
            pt = c + d * min(max(0.10, float(rv)), 0.22)
            # Route high shoulder side over the clavicle/trapezius (|x| <= x_clavicle) instead of out into the armhole
            if pt[2] >= core.SHOULDER - 0.08:
                u_sh = min(1.0, max(0.0, (pt[2] - (core.SHOULDER - 0.08)) / 0.07))
                x_lim = (1.0 - u_sh) * 0.165 + u_sh * x_clavicle
                if abs(pt[0]) > x_lim:
                    pt[0] = math.copysign(x_lim, pt[0])
                # Arch over top of clavicle when crossing from front chest (y<0) to back (y>0)
                y_rel = (pt[1] - c[1]) / 0.085
                if abs(y_rel) < 1.0:
                    pt[2] = max(pt[2], core.SHOULDER + 0.026 * (1.0 - y_rel * y_rel) - dz * 0.35)
            row.append(pt)
        Q.append(row)
    Q = np.array(Q, dtype=np.float64)
    return Part(name, Q, True, ['body'] * rows, paint, role='band')


def crossed_sash(name, paint, width=0.06, ease=0.032):
    """Diagonal sash from waist to opposite shoulder."""
    return band(name, core.WAIST, core.SHOULDER + 0.02, width, ease, paint, high=math.pi * 0.45, rows=5)


def pauldron(name, side, paint, reach=0.5, ease=0.028, flare_end=0.7, span=1.7, rows=6, n=14, drop=None, lift=None):
    """Shoulder armor plate or epaulette over the deltoid."""
    from .limbs import limb_tube
    if drop is not None:
        reach = min(0.65, max(0.25, drop * 2.6))
    if lift is not None:
        ease = 0.026 + lift * 0.5
        flare_end = 1.06
    if span < 0.85:
        span = max(1.35, min(1.95, span * 7.5))
    a, e = J(side + 'Arm'), J(side + 'ForeArm')
    x, y = frame(e - a)
    c = math.atan2(y[2], x[2])
    return limb_tube(name, None, None, ease, paint, n=n, rows=rows, ease_end=ease * flare_end, start_back=0.06,
                     path=[a, a + (e - a) * reach], arc=(c - span, c + span), bvh=core.BVH_A, rmax=0.18)


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
    return Part(name, np.array(Q), True, ['body'] * nr, paint, rigid_joint='Spine2', role='pauldron', side=side[0])
