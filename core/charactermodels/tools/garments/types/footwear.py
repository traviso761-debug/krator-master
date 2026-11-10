"""Layer 2 (Footwear): Closed boots, wrapped shoes, and laced/greaved sandals.

Consolidates all footwear primitives (`boot`, `boots`, `sandal`) into a single module.
Builds anatomically contoured uppers and welt-matched soles directly from `core.CO`
so that:
1. The heel and toe box are 100% covered with zero pinching or exposed calcaneus/toes.
2. The shaft and foot vamp share an exact welded ankle/heel transition ring with
   matching base leather paint (stripping calf-top cuff bands from the vamp).
3. The sole contour is derived directly from the boot/foot footprint with a +2mm
   welt margin and never slices through or protrudes widely past the upper.
4. Optional ankle/calf wraps sit strictly +5mm outside the shaft at matching
   circumferential angles so they never z-fight at the ankle.
"""
import math
import numpy as np
from .. import core
from ..core import Part, J, frame, L, R
from ..paint import P, leathery
from .limbs import limb_tube


def _foot_skin_slice(fv, y_q, ease_foot):
    sub = fv[np.abs(fv[:, 1] - y_q) < 0.026]
    if len(sub) < 4:
        sub = fv[np.argsort(np.abs(fv[:, 1] - y_q))[:16]]
    xmin, xmax = float(sub[:, 0].min()), float(sub[:, 0].max())
    xc = 0.5 * (xmin + xmax)
    hw = 0.5 * (xmax - xmin) + ease_foot
    zmax = float(sub[:, 2].max()) + ease_foot
    return xc, hw, zmax


def _leg_skin_ring(leg_v, z_q, ease_r, thetas):
    sl = leg_v[np.abs(leg_v[:, 2] - z_q) < 0.028]
    if len(sl) < 6:
        sl = leg_v[np.argsort(np.abs(leg_v[:, 2] - z_q))[:24]]
    xmin, xmax = float(sl[:, 0].min()), float(sl[:, 0].max())
    ymin, ymax = float(sl[:, 1].min()), float(sl[:, 1].max())
    xc = 0.5 * (xmin + xmax)
    yc = 0.5 * (ymin + ymax)
    hw = 0.5 * (xmax - xmin) + ease_r
    hy = 0.5 * (ymax - ymin) + ease_r
    dx_s = sl[:, 0] - xc
    dy_s = sl[:, 1] - yc
    r_s = np.hypot(dx_s, dy_s)
    ring = np.zeros((len(thetas), 3), dtype=np.float64)
    for j, th in enumerate(thetas):
        st, ct = math.sin(th), -math.cos(th)
        r_ell = 1.0 / math.hypot(st / max(hw, 1e-4), ct / max(hy, 1e-4))
        cos_sim = (dx_s * st + dy_s * ct) / np.maximum(r_s, 1e-6)
        sec = cos_sim >= math.cos(0.45)
        r_sec = (float(r_s[sec].max()) + ease_r) if sec.any() else r_ell
        r_use = max(r_ell, r_sec)
        ring[j] = [xc + st * r_use, yc + ct * r_use, z_q]
    return ring, xc, hw, yc, hy


def _strip_top_bands(paint_spec):
    """Strip 'top' cuff bands from the foot vamp paint so calf-cuff stripes never paint a spot at the ankle/heel."""
    if not isinstance(paint_spec, dict):
        return paint_spec
    out = dict(paint_spec)
    if out.get('bands'):
        out['bands'] = [b for b in out['bands'] if not (isinstance(b, dict) and b.get('slot') == 'top')]
    return out


def boot(gid, side, paint, top_f=0.45, ease=0.020, sole_paint=None, cuff_paint=None, rows=None, n=20, cuff=0.0, **kw):
    """Single-side closed boot (welt-matched sole + contoured shin shaft + seamless foot vamp)."""
    sp = leathery(sole_paint or P('soot', 0.10))
    up_p = leathery(paint)
    vamp_p = _strip_top_bands(up_p)

    sgn = 1.0 if side == L else -1.0
    foot, toe, tip, knee = J(side + 'Foot'), J(side + 'ToeBase'), J(side + 'ToeBase', 'tail'), J(side + 'Leg')
    fv = core.CO[(core.CO[:, 0] * sgn > 0.01) & (core.CO[:, 2] < foot[2] + 0.03)]
    y_heel_skin = float(fv[:, 1].max())
    y_toe_skin = float(fv[:, 1].min())
    ease_foot = 0.013

    n = int(n or 20)
    thetas = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    cos_t = np.cos(thetas)
    sin_t = np.sin(thetas)

    shaft_frac = max(0.32, min(0.95, 1.0 - top_f)) if top_f < 0.26 else float(top_f)
    up = foot + (knee - foot) * shaft_frac
    leg_v = core.CO[(core.CO[:, 0] * sgn > 0.01) & (core.CO[:, 2] >= 0.0) & (core.CO[:, 2] <= up[2] + 0.04)]

    y_heel = y_heel_skin + ease_foot
    y_ank_front = float(foot[1]) - 0.046
    _, _, z_ank_top = _foot_skin_slice(fv, 0.5 * (y_heel + y_ank_front), ease_foot)
    z_ank_top = max(z_ank_top, float(foot[2]) + 0.014)

    # Shared ankle/heel transition ring (shaft.P[-1] == u.P[0])
    R_ank = np.zeros((n, 3), dtype=np.float64)
    for j in range(n):
        u_front = 0.5 * (1.0 + cos_t[j])
        yj = y_heel + (y_ank_front - y_heel) * u_front
        xc_j, hw_j, zmax_j = _foot_skin_slice(fv, yj, ease_foot)
        arch = max(0.0, cos_t[j]) ** 0.65
        zj = 0.009 + arch * (max(z_ank_top, zmax_j) - 0.009)
        R_ank[j] = [xc_j + sin_t[j] * hw_j, yj, zj]

    # 1. Contoured shin shaft (rows 0..8): horizontal rings down to z_ank_top, then smooth heel counter into R_ank
    rows_sh = 9
    Q_sh = np.zeros((rows_sh, n, 3), dtype=np.float64)
    e_sh_top = max(ease + 0.014, 0.032)
    e_sh_bot = max(ease_foot + 0.005, 0.018)
    for r in range(6):
        u_r = r / 5.0
        z_r = float(up[2] * (1.0 - u_r) + z_ank_top * u_r)
        e_r = e_sh_top * (1.0 - u_r) + e_sh_bot * u_r
        ring_r, _, _, _, _ = _leg_skin_ring(leg_v, z_r, e_r, thetas)
        Q_sh[r] = ring_r
    for r in range(6, rows_sh):
        w = (r - 5) / float(rows_sh - 1 - 5)
        for j in range(n):
            p_mix = Q_sh[5, j] * (1.0 - w) + R_ank[j] * w
            xc_j, hw_j, _ = _foot_skin_slice(fv, p_mix[1], ease_foot)
            p_mix[0] = xc_j + sin_t[j] * max(abs(p_mix[0] - xc_j), hw_j)
            if cos_t[j] < 0.0:
                p_mix[1] = max(p_mix[1], y_heel * w + Q_sh[5, j, 1] * (1.0 - w))
            p_mix[2] = max(0.009, p_mix[2])
            Q_sh[r, j] = p_mix
    shaft_roles = ['top'] + ['body'] * (rows_sh - 2) + ['bottom']
    shaft = Part(f'{gid}_shaft_{side[0]}', Q_sh, True, shaft_roles, up_p, role='shaft', side=side[0])

    # 2. Contoured foot vamp & toe box (rows 0..9): starts at R_ank (Q_sh[-1]) and closes cleanly at toe welt
    rows_u = 10
    Q_u = np.zeros((rows_u, n, 3), dtype=np.float64)
    Q_u[0] = Q_sh[-1].copy()
    y_toe = y_toe_skin - ease_foot - 0.004
    for k in range(1, rows_u):
        v = k / float(rows_u - 1)
        for j in range(n):
            y0_j = Q_u[0, j, 1]
            yj = y0_j * (1.0 - v) + y_toe * v
            xc_j, hw_j, zmax_j = _foot_skin_slice(fv, yj, ease_foot)
            if k == rows_u - 1:
                hw_use = hw_j * 0.24
                z_top_use = 0.013
            elif k == rows_u - 2:
                hw_use = hw_j * 0.88
                z_top_use = max(0.028, zmax_j)
            else:
                hw_use = hw_j
                z_top_use = max(0.030, zmax_j)
            arch = max(0.0, cos_t[j]) ** 0.62
            boot_bot = 0.009 if cos_t[j] >= 0.0 else 0.008
            zj = boot_bot + arch * (z_top_use - boot_bot)
            Q_u[k, j] = [xc_j + sin_t[j] * hw_use, yj, zj]
    u_roles = ['top'] + ['body'] * (rows_u - 2) + ['bottom']
    u = Part(f'{gid}_foot_{side[0]}', Q_u, True, u_roles, vamp_p, role='foot', side=side[0])

    # 3. Welt-matched sole (rows 0..11): contoured to the exact (xc, hw) footprint of the boot upper
    rows_s, n_s = 12, 20
    angles_s = np.linspace(0.0, 2.0 * math.pi, n_s, endpoint=False)
    y_s_heel = y_heel + 0.003
    y_s_toe = y_toe - 0.003
    Q_s = np.zeros((rows_s, n_s, 3), dtype=np.float64)
    for k in range(rows_s):
        vs = k / float(rows_s - 1)
        ys = y_s_heel * (1.0 - vs) + y_s_toe * vs
        xc_s, hw_s, _ = _foot_skin_slice(fv, ys, ease_foot)
        if k == 0 or k == rows_s - 1:
            taper = 0.48
        elif k == 1 or k == rows_s - 2:
            taper = 0.88
        else:
            taper = 1.0
        w_s = (hw_s + 0.002) * taper
        for j, a in enumerate(angles_s):
            dy_cap = (0.003 * abs(math.cos(a))) * (1.0 if k == 0 else -1.0 if k == rows_s - 1 else 0.0)
            Q_s[k, j] = [xc_s + math.cos(a) * w_s, ys + dy_cap, 0.0075 + 0.0075 * math.sin(a)]
    sole = Part(f'{gid}_sole_{side[0]}', Q_s, True, ['body'] * rows_s, sp, role='sole', side=side[0])

    out = [sole, shaft, u]
    if cuff_paint is not None:
        cp = leathery(cuff_paint)
        Q_cuff = np.zeros((3, n, 3), dtype=np.float64)
        z_c0 = float(up[2] - (knee[2] - foot[2]) * 0.06)
        z_c1 = float(up[2] + (knee[2] - foot[2]) * 0.02)
        for rc, z_c in enumerate(np.linspace(z_c1, z_c0, 3)):
            ring_c, _, _, _, _ = _leg_skin_ring(leg_v, float(z_c), e_sh_top + 0.006, thetas)
            Q_cuff[rc] = ring_c
        out.append(Part(f'{gid}_cuff_{side[0]}', Q_cuff, True, ['top', 'body', 'bottom'], cp, role='cuff', side=side[0]))
    return out


def boots(gid, paint_sole, paint_upper=None, top=0.45, wraps=0, wrap_paint=None, cuff_paint=None, ease_top=0.03, wrap_over=None):
    """Paired left and right closed boots with optional leg wraps and cuff bands."""
    if paint_upper is None:
        paint_upper = paint_sole
        paint_sole = P('soot', 0.10)
    parts = []
    ease_base = ease_top - 0.008
    n = 20
    thetas = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    cos_t = np.cos(thetas)
    sin_t = np.sin(thetas)

    for s in (L, R):
        parts.extend(boot(gid, s, paint_upper, top_f=top, ease=ease_base, sole_paint=paint_sole, cuff_paint=cuff_paint))
        if wraps:
            sgn = 1.0 if s == L else -1.0
            foot, knee = J(s + 'Foot'), J(s + 'Leg')
            up = foot + (knee - foot) * top
            leg_v = core.CO[(core.CO[:, 0] * sgn > 0.01) & (core.CO[:, 2] >= 0.0) & (core.CO[:, 2] <= up[2] + 0.06)]
            wp = leathery(wrap_paint or paint_upper)
            e_sh_top = max(ease_base + 0.014, 0.032)
            e_sh_bot = 0.018
            for i in range(wraps):
                f = 0.12 + (top - 0.10) * i / max(1, wraps - 1)
                c = foot + (knee - foot) * f
                # Interpolate shaft ease at height c[2] and sit +5.5mm strictly outside the shaft
                u_sh = float(np.clip((up[2] - c[2]) / max(up[2] - (foot[2] + 0.014), 0.02), 0.0, 1.0))
                e_shaft = e_sh_top * (1.0 - u_sh) + e_sh_bot * u_sh
                e_wrap = max(e_shaft + 0.0055, (ease_top + 0.016) if (wrap_over is not None and f >= wrap_over) else (e_shaft + 0.0055))
                Q_w = np.zeros((3, n, 3), dtype=np.float64)
                for rw, zw in enumerate(np.linspace(float(c[2]) + 0.022, float(c[2]), 3)):
                    ring_w, _, _, _, _ = _leg_skin_ring(leg_v, float(zw), e_wrap, thetas)
                    Q_w[rw] = ring_w
                parts.append(Part('%s_wrap%d_%s' % (gid, i, s[0]), Q_w, True, ['top', 'body', 'bottom'], wp, role='band', side=s[0]))
    return parts


def sandal(gid, paint_sole, paint_strap, guard=False, laces=0, greave=None, strap_paint2=None):
    """Paired sandals with anatomically contoured sole, toe/instep straps, optional heel guard, shin laces, and greaves."""
    parts = []
    paint_sole, paint_strap = leathery(paint_sole), leathery(paint_strap)
    if strap_paint2 is not None:
        strap_paint2 = leathery(strap_paint2)
    for s in (L, R):
        sgn = 1.0 if s == L else -1.0
        foot, toe, tip, knee = J(s + 'Foot'), J(s + 'ToeBase'), J(s + 'ToeBase', 'tail'), J(s + 'Leg')
        fv = core.CO[(core.CO[:, 0] * sgn > 0.01) & (core.CO[:, 2] < foot[2] + 0.03)]
        y_heel_skin = float(fv[:, 1].max())
        y_toe_skin = float(fv[:, 1].min())
        ease_s = 0.009

        rows, n = 12, 20
        angles_s = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
        y_s_heel = y_heel_skin + 0.012
        y_s_toe = y_toe_skin - 0.012
        Q = np.zeros((rows, n, 3), dtype=np.float64)
        for k in range(rows):
            vs = k / float(rows - 1)
            ys = y_s_heel * (1.0 - vs) + y_s_toe * vs
            xc_s, hw_s, _ = _foot_skin_slice(fv, ys, ease_s)
            taper = 0.50 if k in (0, rows - 1) else (0.88 if k in (1, rows - 2) else 1.0)
            w_s = hw_s * taper
            for j, a in enumerate(angles_s):
                dy_cap = (0.003 * abs(math.cos(a))) * (1.0 if k == 0 else -1.0 if k == rows - 1 else 0.0)
                Q[k, j] = [xc_s + math.cos(a) * w_s, ys + dy_cap, 0.007 + 0.007 * math.sin(a)]
        parts.append(Part('%s_sole_%s' % (gid, s[0]), Q, True, ['body'] * rows, paint_sole, role='sole', side=s[0]))

        # Contoured dorsal straps that arch cleanly over the foot and seat into the sole at z=0.008 (never below z=0.007)
        n_st = 16
        th_st = np.linspace(0.0, 2.0 * math.pi, n_st, endpoint=False)
        for tag, f in (('toe', 0.18), ('instep', 0.68)):
            y_c0 = float(toe[1] + (foot[1] - toe[1]) * f)
            y_c1 = float(y_c0 + (foot[1] - toe[1]) * 0.18)
            Q_st = np.zeros((3, n_st, 3), dtype=np.float64)
            for rk, y_st in enumerate(np.linspace(y_c1, y_c0, 3)):
                xc_k, hw_k, zmax_k = _foot_skin_slice(fv, float(y_st), 0.009)
                for j, a in enumerate(th_st):
                    arch = max(0.0, math.cos(a)) ** 0.65
                    z_st = (0.008 if math.cos(a) >= 0.0 else 0.007) + arch * (max(0.026, zmax_k) - 0.008)
                    Q_st[rk, j] = [xc_k + math.sin(a) * hw_k, float(y_st), z_st]
            parts.append(Part('%s_%s_%s' % (gid, tag, s[0]), Q_st, True, ['top', 'body', 'bottom'], paint_strap))

        if guard:
            parts.append(limb_tube('%s_heel_%s' % (gid, s[0]), foot + np.array([0, 0, 0.06]),
                                   np.array([foot[0], foot[1], 0.012]), 0.011, paint_strap, n=14, rows=5,
                                   arc=(-0.45 * math.pi, 0.45 * math.pi)))
        for i in range(laces):
            f = 0.14 + 0.11 * i
            c = foot + (knee - foot) * f
            parts.append(limb_tube('%s_lace%d_%s' % (gid, i, s[0]), c, c + np.array([0, 0, 0.018]), 0.010,
                                   strap_paint2 or paint_strap, n=16, rows=2))
        if greave is not None:
            a = foot + (knee - foot) * 0.22
            b = foot + (knee - foot) * 0.78
            x, y = frame(b - a)
            front_a = math.atan2(-y[1], -x[1])
            parts.append(limb_tube('%s_greave_%s' % (gid, s[0]), a, b, 0.015, greave, n=14, rows=8,
                                   arc=(front_a - 0.55 * math.pi, front_a + 0.55 * math.pi)))
    return parts
