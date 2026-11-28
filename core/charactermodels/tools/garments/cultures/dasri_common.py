"""Shared procedural motifs and Bedouin × Chiricahua/Mescalero Apache 3D garment primitives for `dasri`.

Provides:
- `dasri_motif_scope()`: Clean context manager wrapping `paint.motif` with 6 custom Dasri syncretic
  textile/leather/metalwork motifs (restoring `paint.motif` on exit with zero permanent mutation).
- `ndee_boots(...)`: Knee-high or mid-calf Chiricahua/Mescalero Apache folded-top upturned-toe
  cactus-boots (*ndee* moccasin-boots) with optional oxidized silver & turquoise cuff conchos.
- `jambiya_daggers(...)`: Curved Yemeni/Jabal *jambiya* J-scabbard(s) & T-shaped horn/silver/gold
  hilt(s) seated flush on the front waist sash (`rigid_joint='Spine1'`).
- `hirz_amulet_box(...)`: Rectangular sterling silver *hirz* talisman case with end-caps, cabochon
  inlay, and 3 pendant silver bells seated flush on chest, brow, or bandolier.
- `apache_war_headband(...)`: Seamless 360-degree closed Apache war-headband (`closed=True`) with
  temple conchos, optional brow *hirz*, optional upright hawk-feather plume, and knotted back tails.
- `keffiyeh_iqal_head(...)`: Draped Bedouin *keffiyeh* headcloth bound with double black goat-hair
  *'iqāl* coils, optional lower-face *lithām* veil, and optional twin gilded ibex horns.
- `apache_warshirt_yoke(...)`: 3D V-fringed smoke-buckskin Chiricahua pectoral & back yoke.
- `breechclout_sirwal(...)`: Airy desert *sirwāl* trousers paired with front & back beaded Apache
  buckskin breechclout aprons (`legged=True`).
- `dasri_bracers(...)`: Forearm thorn-wraps, alembic gauntlets, archer bracers, and hawk-bell cuffs.
"""
from contextlib import contextmanager
import math
import numpy as np

from .. import core
from .. import paint as paint_mod
from ..core import (
    Part, J, L, R, FRONT, spine_at, first_hit, head_frame,
    surface_out, chest_front
)
from ..paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex
from ..types.torso import torso_tube, collar_disc, tabard
from ..types.limbs import sleeve, trousers
from ..types.footwear import _foot_skin_slice, _leg_skin_ring, _strip_top_bands
from ..types.headgear import hood, crown_band, sculpted_faceplate, horn
from ..types.accoutrements import flap, blob, tube, rosette


DASRI_CUSTOM_MOTIFS = {
    'sadu_apache_chevron',
    'juss_qamariya',
    'buckskin_concho',
    'hirz_filigree',
    'horned_sun_shield',
    'dasri_horns_blazon',
}


def _dasri_custom_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'sadu_apache_chevron':
        # Syncretic Bedouin 4-colour Al-Sadu goat-hair warp bands + Chiricahua stepped diamonds & turquoise seed-beads
        img[:] = C['goatblack']
        band_r = (v * 5.0) % 1.0
        band_id = (np.floor(v * 5.0).astype(int)) % 5
        img[band_id == 0] = C['dragoncrimson']
        img[band_id == 1] = C['goatblack']
        img[band_id == 2] = C['ebadindigo']
        img[band_id == 3] = C['jusschalk']
        img[band_id == 4] = C['rabbitgold']
        # Crisp chalk & gold selvedge rails between bands
        rail = (band_r < 0.08) | (band_r > 0.92)
        img[rail] = C['jusschalk']
        # Chiricahua stepped-diamond & lightning chevron register inside bands
        nx = max(2.0, round(3.5 * max(aspect, 0.4)))
        su = ((u * nx) % 1.0 - 0.5) * 2.0
        sv = (band_r - 0.5) * 2.0
        step_d = np.floor(np.abs(su) * 5.0) / 5.0 + np.floor(np.abs(sv) * 4.0) / 4.0
        in_diam = (step_d >= 0.45) & (step_d <= 0.85)
        core_diam = step_d < 0.30
        img[in_diam & (band_id != 3)] = C['jusschalk']
        img[in_diam & (band_id == 3)] = C['dragoncrimson']
        img[core_diam] = fg
        # Tiny turquoise seed-bead triangles along band borders
        tri_u = ((u * nx * 3.0) % 1.0) - 0.5
        bead_tri = ((band_r > 0.08) & (band_r < 0.24) & (np.abs(tri_u) < (0.24 - band_r) * 1.8))
        img[bead_tri] = C['oasisturq']
        # Woven Dasri Sadu-and-ibex-horn texture pack harmonization
        sadu_tex = sample_cultural_tex('tex.dasri_sadu_desert_horn', max(w, 1), max(h, 1), fg, bg, pal_blend=0.20)
        img = 0.44 * img + 0.56 * sadu_tex

    elif style == 'juss_qamariya':
        # Yemeni-Jabal carved white gypsum `juss` chevron lattice framing stained-glass `qamariya` jewel rosettes
        img[:] = bg
        nx = max(2.0, round(2.8 * max(aspect, 0.4)))
        ny = max(2.0, round(2.8 / max(aspect, 0.4)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        cell_idx = (np.floor(u * nx).astype(int) + np.floor(v * ny).astype(int)) % 3
        d_lat = np.abs(gu) + np.abs(gv)
        r = np.hypot(gu, gv)
        th = np.arctan2(gv, gu)
        # Stained-glass jewel petals inside qamariya roundel
        in_win = r < 0.68
        petal_col = np.where(cell_idx == 0, 0, np.where(cell_idx == 1, 1, 2))
        sec = (np.floor((th + math.pi) / (math.pi / 4.0)).astype(int)) % 3
        m_crim = in_win & (((petal_col + sec) % 3) == 0)
        m_emer = in_win & (((petal_col + sec) % 3) == 1)
        m_gold = in_win & (((petal_col + sec) % 3) == 2)
        img[m_crim] = C['dragoncrimson']
        img[m_emer] = C['emerald']
        img[m_gold] = C['rabbitgold']
        # Crisp white gypsum `juss` tracery mullions, 6-petal rosette & chevron border
        petal_rib = in_win & ((np.abs(np.sin(3.0 * th)) < 0.14) | (np.abs(r - 0.42) < 0.065) | (np.abs(r - 0.68) < 0.075))
        lattice = (np.abs(d_lat - 1.02) < 0.09) | (np.abs(gu) > 0.88) | (np.abs(gv) > 0.88)
        chev = np.abs(gv - (0.72 - 0.45 * np.abs(gu))) < 0.07
        img[petal_rib | lattice | (chev & ~in_win)] = C['jusschalk']
        img[r < 0.14] = fg
        juss_tex = sample_cultural_tex('tex.dasri_juss_qamariya', max(w, 1), max(h, 1), fg, bg, pal_blend=0.18)
        img = 0.42 * img + 0.58 * juss_tex

    elif style == 'buckskin_concho':
        # Smoke-tanned ochre buckskin with scalloped oxidized silver conchos, turquoise cabochons & rawhide zigzag
        img[:] = C['smokebuck']
        nx = max(2.0, round(4.2 * max(aspect, 0.4)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.46) * 2.4
        r = np.hypot(gu, gv)
        th = np.arctan2(gv, gu)
        scallop_r = 0.56 + 0.06 * np.cos(12.0 * th)
        in_concho = r < scallop_r
        inner_groove = (r > 0.34) & (r < 0.41)
        cabochon = r < 0.22
        img[in_concho] = C['silver']
        img[inner_groove] = C['charcoal']
        img[cabochon] = C['oasisturq']
        # Rawhide zigzag stitching & brass studs above/below concho row
        zig_top = np.abs((v - 0.13) * 14.0 - np.abs(((u * nx * 2.0) % 2.0) - 1.0) * 0.7) < 0.18
        zig_bot = np.abs((v - 0.78) * 14.0 - np.abs(((u * nx * 2.0) % 2.0) - 1.0) * 0.7) < 0.18
        img[zig_top | zig_bot] = C['jusschalk']
        stud = (np.hypot(((u * nx * 2.0) % 1.0) - 0.5, (v - 0.46) * 4.0) < 0.12) & (~in_concho)
        img[stud] = C['brass']
        # Cut V-fringe shadow ticks along bottom edge
        fringe_slit = (v > 0.84) & (((u * nx * 6.0) % 1.0) < 0.28)
        img[fringe_slit] = C['umber']

    elif style == 'hirz_filigree':
        # Yemeni-Bedouin oxidized sterling silver filigree with rectangular hirz cartouches & stepped horn crenellations
        img[:] = C['silver']
        nx = max(2.0, round(3.2 * max(aspect, 0.4)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        # Braided wire rails & niello horn-black ground
        niello = (np.abs(gv) > 0.74) & (np.abs(gv) < 0.86)
        img[niello] = C['goatblack']
        # Stepped ibex-horn crenellations along top
        step_top = (gv < -0.52) & (gv > -0.74) & (((np.floor(u * nx * 6.0)) % 2) == 0)
        img[step_top] = C['goatblack']
        # Rectangular hirz talisman cartouche with alternating turquoise & dragon-crimson inlays
        cart = (np.abs(gu) < 0.68) & (np.abs(gv) < 0.44)
        cart_rim = (np.abs(gu) < 0.76) & (np.abs(gv) < 0.52) & (~cart)
        img[cart_rim] = C['goatblack']
        arabesque = cart & ((np.abs(np.sin(gu * 6.0) * 0.25 - gv) < 0.08) | (np.abs(np.cos(gu * 5.0) * 0.22 + gv) < 0.07))
        img[arabesque] = C['charcoal']
        cell_i = (np.floor(u * nx).astype(int)) % 2
        gem = np.hypot(gu * 1.2, gv * 1.6) < 0.24
        img[gem & (cell_i == 0)] = C['oasisturq']
        img[gem & (cell_i == 1)] = C['dragoncrimson']

    elif style == 'horned_sun_shield':
        # Painted Apache rawhide buckler & Gaan sacred geometry: 4-direction hoop, horned sun disc & lightning arrows
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        r = np.hypot(dx, dy)
        th = np.arctan2(dy, dx)
        img[:] = bg
        # Four-directions outer quadrants inside rawhide rim
        in_hoop = r < 0.88
        q_top = in_hoop & (dy < 0) & (np.abs(dx) <= np.abs(dy))
        q_bot = in_hoop & (dy >= 0) & (np.abs(dx) <= np.abs(dy))
        q_lft = in_hoop & (dx < 0) & (np.abs(dx) > np.abs(dy))
        q_rgt = in_hoop & (dx >= 0) & (np.abs(dx) > np.abs(dy))
        img[q_top] = C['goatblack']
        img[q_bot] = C['rabbitgold']
        img[q_lft] = C['dragoncrimson']
        img[q_rgt] = C['jusschalk']
        # Outer turquoise & black hoop border
        img[(r >= 0.82) & (r < 0.90)] = C['oasisturq']
        img[(r >= 0.90) & (r < 0.96)] = C['goatblack']
        # Four zigzag lightning rays along diagonals
        diag1 = np.abs((dx + dy) * 0.707 + 0.06 * np.sin((dx - dy) * 14.0)) < 0.055
        diag2 = np.abs((dx - dy) * 0.707 + 0.06 * np.sin((dx + dy) * 14.0)) < 0.055
        img[in_hoop & (diag1 | diag2)] = C['oasisturq']
        # Central sun disc + sweeping curved ibex horns rising from upper sun rim
        sun_rays = (r < 0.42) & (r > 0.24) & (((th / (2 * math.pi) * 16.0) % 1.0) < 0.48)
        img[sun_rays] = C['rabbitgold']
        img[r < 0.25] = C['dragoncrimson']
        img[r < 0.14] = C['oasisturq']
        horn_arc = (dy < 0.05) & (np.abs(np.hypot(np.abs(dx) - 0.26, dy + 0.26) - 0.28) < 0.065) & (np.abs(dx) > 0.06)
        img[horn_arc] = fg

    elif style == 'dasri_horns_blazon':
        # Majlis & Shade Emblem of The Horns: twin sweeping ibex horns over stepped Jabal shurfat parapet & star
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        ax = np.abs(dx)
        img[:] = bg
        # Stepped Jabal shurfat parapet base
        step_h = 0.42 + 0.14 * np.floor((1.0 - np.minimum(ax, 0.85)) * 4.0)
        parapet = (dy > step_h) & (dy < 0.86) & (ax < 0.82)
        img[parapet] = C['jusschalk']
        # Twin sweeping ridged ibex horns curving out and back inward toward crown
        h_rad = np.hypot(ax - 0.28, dy - 0.02)
        in_horn = (h_rad > 0.30) & (h_rad < 0.44) & (dy < 0.36) & (~((ax < 0.16) & (dy < -0.26)))
        ridges = ((np.arctan2(dy - 0.02, ax - 0.28) * 14.0) % 1.0) < 0.25
        img[in_horn] = fg
        img[in_horn & ridges] = C['nahhascopper']
        # Central 8-pointed caravan star between the horns
        r_st = np.hypot(dx, dy + 0.06)
        sq1 = (ax < 0.16) & (np.abs(dy + 0.06) < 0.16)
        sq2 = (np.abs(dx + (dy + 0.06)) < 0.22) & (np.abs(dx - (dy + 0.06)) < 0.22)
        img[sq1 | sq2] = C['oasisturq']
        img[r_st < 0.08] = C['rabbitgold']
        # Outer tapestry border
        border = (ax > 0.88) | (np.abs(dy) > 0.88)
        img[border] = fg

    return np.clip(img, 0.0, 1.0)


@contextmanager
def dasri_motif_scope():
    """Temporarily extend `paint.motif` with Dasri syncretic motifs during compilation."""
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in DASRI_CUSTOM_MOTIFS:
            return _dasri_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif


# ===========================================================================================================
# SHARED 3D SIGNATURE SUB-ASSEMBLIES (BEDOUIN × CHIRICAHUA / MESCALERO APACHE)
# ===========================================================================================================

def ndee_boots(gid, upper_paint, sole_paint=None, cuff_paint=None, top=0.78, ease_top=0.015,
               upturned=True, concho_paint=None, wraps=0, wrap_paint=None):
    """Chiricahua/Mescalero Apache knee-high folded-top upturned-toe cactus-boots (*ndee* boots).

    Sculpts the characteristic upturned cactus-deflecting toe tab directly into the front rows of
    `foot_L/R` so `core.py` molds the welt sole seamlessly around it and Check #9 passes cleanly.
    """
    sp = leathery(sole_paint or P('umber', 0.08, [B('top', 0.0, 0.012, 'solid', 'smokebuck')]))
    up_p = leathery(upper_paint)
    vamp_p = _strip_top_bands(up_p)
    ease_base = max(0.012, min(float(ease_top), 0.017))
    ease_foot = 0.013
    n = 20
    thetas = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    cos_t = np.cos(thetas)
    sin_t = np.sin(thetas)
    parts = []

    for side in (L, R):
        sgn = 1.0 if side == L else -1.0
        foot, knee = J(side + 'Foot'), J(side + 'Leg')
        fv = core.CO[(core.CO[:, 0] * sgn > 0.01) & (core.CO[:, 2] < foot[2] + 0.03)]
        y_heel_skin = float(fv[:, 1].max())
        y_toe_skin = float(fv[:, 1].min())

        shaft_frac = max(0.32, min(0.92, float(top)))
        up_pt = foot + (knee - foot) * shaft_frac
        leg_v = core.CO[(core.CO[:, 0] * sgn > 0.01) & (core.CO[:, 2] >= 0.0) & (core.CO[:, 2] <= up_pt[2] + 0.05)]

        y_heel = y_heel_skin + ease_foot
        y_ank_front = float(foot[1]) - 0.046
        _, _, z_ank_top = _foot_skin_slice(fv, 0.5 * (y_heel + y_ank_front), ease_foot)
        z_ank_top = max(z_ank_top, float(foot[2]) + 0.014)

        R_ank = np.zeros((n, 3), dtype=np.float64)
        for j in range(n):
            u_front = 0.5 * (1.0 + cos_t[j])
            yj = y_heel + (y_ank_front - y_heel) * u_front
            xc_j, hw_j, zmax_j = _foot_skin_slice(fv, yj, ease_foot)
            arch = max(0.0, cos_t[j]) ** 0.65
            zj = 0.009 + arch * (max(z_ank_top, zmax_j) - 0.009)
            R_ank[j] = [xc_j + sin_t[j] * hw_j, yj, zj]

        rows_sh = 9
        Q_sh = np.zeros((rows_sh, n, 3), dtype=np.float64)
        e_sh_top = max(ease_base, 0.014)
        e_sh_bot = max(ease_foot + 0.002, 0.015)
        for r in range(6):
            u_r = r / 5.0
            z_r = float(up_pt[2] * (1.0 - u_r) + z_ank_top * u_r)
            calf_swell = 0.0045 * math.sin(u_r * math.pi)
            e_r = e_sh_top * (1.0 - u_r) + e_sh_bot * u_r + calf_swell
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
        shaft = Part(f'{gid}_shaft_{side[0]}', Q_sh, True, ['top'] + ['body'] * (rows_sh - 2) + ['bottom'],
                     up_p, role='shaft', side=side[0])

        rows_u = 11
        Q_u = np.zeros((rows_u, n, 3), dtype=np.float64)
        Q_u[0] = Q_sh[-1].copy()
        y_toe = y_toe_skin - ease_foot - (0.012 if upturned else 0.004)
        for k in range(1, rows_u):
            v = k / float(rows_u - 1)
            for j in range(n):
                y0_j = Q_u[0, j, 1]
                yj = y0_j * (1.0 - v) + y_toe * v
                xc_j, hw_j, zmax_j = _foot_skin_slice(fv, min(max(yj, y_toe_skin), y_heel_skin), ease_foot)
                if k == rows_u - 1:
                    hw_use = hw_j * (0.28 if upturned else 0.24)
                    z_bot_row = 0.034 if upturned else 0.009
                    z_top_use = 0.044 if upturned else 0.014
                elif k == rows_u - 2:
                    hw_use = hw_j * (0.68 if upturned else 0.86)
                    z_bot_row = 0.018 if upturned else 0.009
                    z_top_use = max(0.038 if upturned else 0.028, zmax_j)
                else:
                    hw_use = hw_j
                    z_bot_row = 0.0065
                    z_top_use = max(0.030, zmax_j)
                arch = max(0.0, cos_t[j]) ** 0.62
                zj = z_bot_row + arch * max(0.004, z_top_use - z_bot_row)
                Q_u[k, j] = [xc_j + sin_t[j] * hw_use, yj, zj]
        u_part = Part(f'{gid}_foot_{side[0]}', Q_u, True, ['top'] + ['body'] * (rows_u - 2) + ['bottom'],
                      vamp_p, role='foot', side=side[0])

        rows_s, n_s = 12, 20
        angles_s = np.linspace(0.0, 2.0 * math.pi, n_s, endpoint=False)
        y_s_heel = y_heel + 0.003
        y_s_toe = y_toe - 0.003
        Q_s = np.zeros((rows_s, n_s, 3), dtype=np.float64)
        for k in range(rows_s):
            vs = k / float(rows_s - 1)
            ys = y_s_heel * (1.0 - vs) + y_s_toe * vs
            xc_s, hw_s, _ = _foot_skin_slice(fv, min(max(ys, y_toe_skin), y_heel_skin), ease_foot)
            taper = 0.48 if k in (0, rows_s - 1) else (0.88 if k in (1, rows_s - 2) else 1.0)
            w_s = (hw_s + 0.002) * taper
            for j, a in enumerate(angles_s):
                dy_cap = (0.003 * abs(math.cos(a))) * (1.0 if k == 0 else -1.0 if k == rows_s - 1 else 0.0)
                Q_s[k, j] = [xc_s + math.cos(a) * w_s, ys + dy_cap, 0.0075 + 0.0075 * math.sin(a)]
        sole = Part(f'{gid}_sole_{side[0]}', Q_s, True, ['body'] * rows_s, sp, role='sole', side=side[0])
        parts.extend([sole, shaft, u_part])

        # Tailored folded-over Apache top cuff flap hugging the upper calf (+3.5..5.5mm outside shaft)
        cp = leathery(cuff_paint or P('smokebuck', 0.06, [
            B('bottom', 0.0, 0.024, 'sadu_apache_chevron', 'oasisturq', 'dragoncrimson', 0.045),
            B('top', 0.0, 0.012, 'solid', 'jusschalk'),
        ], fabric='leather.buckskin'))
        Q_cuff = np.zeros((4, n, 3), dtype=np.float64)
        z_c_top = float(up_pt[2] + 0.008)
        z_c_bot = float(up_pt[2] - max(0.052, (knee[2] - foot[2]) * 0.15))
        for rc, z_c in enumerate(np.linspace(z_c_top, z_c_bot, 4)):
            u_sh_c = float(np.clip((up_pt[2] - z_c) / max(up_pt[2] - z_ank_top, 0.02), 0.0, 1.0))
            e_sh_at_c = e_sh_top * (1.0 - u_sh_c) + e_sh_bot * u_sh_c + 0.0045 * math.sin(u_sh_c * math.pi)
            flare_c = 0.0035 + 0.0020 * (rc / 3.0)
            ring_c, _, _, _, _ = _leg_skin_ring(leg_v, float(z_c), e_sh_at_c + flare_c, thetas)
            if rc == 3:
                for j in range(n):
                    ring_c[j, 2] -= 0.008 * (0.5 - 0.5 * math.cos(6.0 * thetas[j]))
            Q_cuff[rc] = ring_c
        parts.append(Part(f'{gid}_cuff_{side[0]}', Q_cuff, True, ['top', 'body', 'body', 'bottom'],
                          cp, role='cuff', side=side[0]))

        # Optional lateral silver & turquoise cuff conchos seated flush on cuff
        if concho_paint is not None and z_c_bot > 0.16:
            z_con = 0.5 * (z_c_top + z_c_bot)
            u_sh_m = float(np.clip((up_pt[2] - z_con) / max(up_pt[2] - z_ank_top, 0.02), 0.0, 1.0))
            e_sh_m = e_sh_top * (1.0 - u_sh_m) + e_sh_bot * u_sh_m + 0.0045 * math.sin(u_sh_m * math.pi)
            ring_m, xc_m, hw_m, yc_m, _ = _leg_skin_ring(leg_v, z_con, e_sh_m + 0.0055, thetas)
            lat_pt = np.array([xc_m + sgn * hw_m, yc_m - 0.004, z_con])
            parts.append(rosette(f'{gid}_concho_{side[0]}', lat_pt, np.array([sgn, 0.0, 0.0]),
                                 np.array([0.0, -1.0, 0.0]), 0.016, concho_paint, n=10, thick=0.005))

        if wraps:
            wp = leathery(wrap_paint or upper_paint)
            for i in range(wraps):
                f_w = 0.18 + (shaft_frac - 0.24) * i / max(1, wraps - 1)
                c_w = foot + (knee - foot) * f_w
                u_sh = float(np.clip((up_pt[2] - c_w[2]) / max(up_pt[2] - z_ank_top, 0.02), 0.0, 1.0))
                e_wrap = e_sh_top * (1.0 - u_sh) + e_sh_bot * u_sh + 0.0045 * math.sin(u_sh * math.pi) + 0.0045
                Q_w = np.zeros((3, n, 3), dtype=np.float64)
                for rw, zw in enumerate(np.linspace(float(c_w[2]) + 0.020, float(c_w[2]), 3)):
                    ring_w, _, _, _, _ = _leg_skin_ring(leg_v, float(zw), e_wrap, thetas)
                    Q_w[rw] = ring_w
                parts.append(Part(f'{gid}_wrap{i}_{side[0]}', Q_w, True, ['top', 'body', 'bottom'],
                                  wp, role='band', side=side[0]))
    return parts


def jambiya_daggers(gid, z_waist, belt_ease, hilt_paint=None, scabbard_paint=None, twin=False):
    """Curved Yemeni/Jabal *jambiya* dagger(s) in J-curved scabbard(s) flush on the front waist sash."""
    hp = hilt_paint or P('goatblack', 0.03, [
        B('top', 0.0, 0.014, 'solid', 'silver'),
        B('bottom', 0.0, 0.012, 'solid', 'silver'),
    ], fabric='metal.iron')
    sp = scabbard_paint or P('nahhascopper', 0.02, [
        B('top', 0.0, 0.018, 'hirz_filigree', 'silver', 'nahhascopper', 0.03),
        B('bottom', 0.0, 0.022, 'solid', 'silver'),
    ], fabric='metal.bronze')
    out = []
    configs = ((-1.0, 'R', -0.028), (1.0, 'L', 0.028)) if twin else ((1.0, 'main', 0.0),)
    for sgn, tag, x_shift in configs:
        # Hilt rooted obliquely just above sash midline
        p_hilt_top = chest_front(z_waist + 0.052, belt_ease + 0.008, x=x_shift - sgn * 0.024)
        p_throat = chest_front(z_waist + 0.006, belt_ease + 0.007, x=x_shift - sgn * 0.004)
        p_elbow = chest_front(z_waist - 0.046, belt_ease + 0.008, x=x_shift + sgn * 0.032)
        p_tip = chest_front(z_waist - 0.016, belt_ease + 0.011, x=x_shift + sgn * 0.078)
        # T-shaped horn/silver pommel & grip
        out.append(tube(f'{gid}_jambiya_grip_{tag}', [p_hilt_top, p_throat], 0.012, hp, n=10, rigid_joint='Spine1'))
        pom_dir = np.array([0.85, 0.0, 0.45 * sgn])
        pom_dir /= np.linalg.norm(pom_dir)
        out.append(tube(f'{gid}_jambiya_pommel_{tag}',
                        [p_hilt_top - pom_dir * 0.024, p_hilt_top + pom_dir * 0.024],
                        0.009, hp, n=8, rigid_joint='Spine1'))
        # Sharply upturned J-curve scabbard
        out.append(horn(f'{gid}_jambiya_scab_{tag}', [p_throat, p_elbow, p_tip],
                        0.016, 0.005, sp, n=10, rows=9, rigid_joint='Spine1', role='trinket'))
    return out


def hirz_amulet_box(name, center_pt, out_vec, silver_paint=None, inlay='oasisturq',
                    width=0.056, height=0.034, bells=True, rigid_joint='Spine2'):
    """Rectangular sterling silver Yemeni-Bedouin *hirz* talisman case with cabochon & 3 silver bells."""
    sp = silver_paint or P('silver', 0.02, [
        B('top', 0.0, 0.008, 'solid', inlay),
        B('bottom', 0.0, 0.008, 'solid', 'nahhascopper'),
    ], fabric='metal.iron')
    out_u = np.asarray(out_vec, dtype=np.float64)
    out_u /= max(np.linalg.norm(out_u), 1e-9)
    side_u = np.cross(np.array([0.0, 0.0, 1.0]), out_u)
    if np.linalg.norm(side_u) < 1e-6:
        side_u = np.array([1.0, 0.0, 0.0])
    else:
        side_u /= np.linalg.norm(side_u)
    up_u = np.cross(out_u, side_u)
    up_u /= max(np.linalg.norm(up_u), 1e-9)

    p_l = center_pt - side_u * (width * 0.5)
    p_r = center_pt + side_u * (width * 0.5)
    parts = [
        tube(f'{name}_case', [p_l, p_r], height * 0.48, sp, n=8, rigid_joint=rigid_joint),
        blob(f'{name}_gem', center_pt + out_u * (height * 0.42), (0.018, 0.010, 0.018),
             P(inlay, 0.02, fabric='metal.iron'), n=8, rows=4, out=out_u, rigid_joint=rigid_joint, role='trinket'),
    ]
    if bells:
        for idx, u_s in enumerate((-0.34, 0.0, 0.34)):
            b_pt = center_pt + side_u * (width * u_s) - up_u * (height * 0.58)
            parts.append(blob(f'{name}_bell_{idx}', b_pt, (0.011, 0.010, 0.014),
                              P('silver', 0.02, fabric='metal.iron'), n=8, rows=4,
                              out=out_u, rigid_joint=rigid_joint, role='trinket'))
    return parts


def apache_war_headband(gid_h, band_paint, concho_paint=None, brow_hirz=False,
                        feather_paint=None, n_conchos=6, knot_tails=True, litham_paint=None):
    """360-degree closed Chiricahua Apache cloth war-headband (`closed=True` -> snug ~4mm skull fit)."""
    a, b, up, bk, left = head_frame()
    parts = [crown_band(gid_h + '_band', band_paint, f0=0.53, f1=0.72, ease=0.0038, flare=0.0010, rows=6, n=40)]

    c_mid = a + (b - a) * 0.625
    if concho_paint is not None and n_conchos > 0:
        for k in range(n_conchos):
            an = math.pi * (0.64 + 0.72 * k / max(1, n_conchos - 1))
            if brow_hirz and abs(an - math.pi) < 0.16:
                continue
            d = bk * math.cos(an) + left * math.sin(an)
            h_r = first_hit(c_mid, d) or 0.096
            parts.append(rosette(f'{gid_h}_concho_{k}', c_mid + d * (h_r + 0.0065), d, up,
                                 0.013, concho_paint, n=10, thick=0.0045, rigid_joint='Head'))

    if brow_hirz:
        h_f = first_hit(c_mid, -bk) or 0.100
        parts.extend(hirz_amulet_box(gid_h + '_brow_hirz', c_mid - bk * (h_f + 0.0085), -bk,
                                     width=0.042, height=0.022, bells=False, rigid_joint='Head'))

    if feather_paint is not None:
        d_pl = left * 0.94 - bk * 0.24
        d_pl /= np.linalg.norm(d_pl)
        h_pl = first_hit(c_mid, d_pl) or 0.088
        root_pl = c_mid + d_pl * (h_pl + 0.0055)
        mid_pl = root_pl + up * 0.082 + bk * 0.014 + left * 0.010
        tip_pl = root_pl + up * 0.162 + bk * 0.034 + left * 0.016
        parts.append(horn(gid_h + '_plume_quill', [root_pl, mid_pl, tip_pl], 0.013, 0.004,
                          feather_paint, n=8, rows=8, rigid_joint='Head'))

    if knot_tails:
        h_bk = first_hit(c_mid, bk) or 0.098
        knot_c = c_mid + bk * (h_bk + 0.0075)
        parts.append(blob(gid_h + '_occiput_knot', knot_c, (0.028, 0.014, 0.022),
                          band_paint, n=10, rows=4, out=bk, rigid_joint='Head'))
        for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
            d_nape1 = bk * 0.96 + left * (sd * 0.28)
            d_nape1 /= np.linalg.norm(d_nape1)
            c_n1 = a + (b - a) * 0.22
            c_n2 = a + (b - a) * (-0.12)
            h_n1 = first_hit(c_n1, d_nape1) or 0.072
            h_n2 = first_hit(c_n2, d_nape1) or 0.064
            t0 = knot_c + left * (sd * 0.011) - up * 0.008
            t1 = c_n1 + d_nape1 * (h_n1 + 0.009)
            t2 = c_n2 + d_nape1 * (h_n2 + 0.011) + left * (sd * 0.008)
            parts.append(horn(f'{gid_h}_tail_{tag}', [t0, t1, t2], 0.010, 0.005,
                              band_paint, n=8, rows=7, rigid_joint='Head'))

    if litham_paint is not None:
        parts.append(sculpted_faceplate(gid_h + '_litham', litham_paint,
                                        f_top=0.40, f_bot=-0.08, ease=0.012, span=0.48, rows=12, cols=23,
                                        brow_relief=0.002, nose_relief=0.020, cheek_relief=0.009, chin_relief=0.010))
    return parts


def keffiyeh_iqal_head(gid_h, cloth_paint, iqal_paint=None, litham_paint=None,
                       brow_hirz=False, ibex_horns_paint=None):
    """Draped Bedouin *keffiyeh* headcloth bound with double black goat-hair *'iqāl* coils."""
    a, b, up, bk, left = head_frame()
    iq_p = iqal_paint or P('goatblack', 0.05, [
        B('top', 0.0, 0.006, 'stripes', 'rabbitgold', 'goatblack', 0.025),
    ], fabric='cloth.tent.black')
    parts = [
        hood(gid_h + '_keffiyeh', cloth_paint, ease=0.013, ease_low=0.015,
             open_front=0.82, low=-0.16, rows=12, n=36, peak=0.018, high=1.0),
        crown_band(gid_h + '_iqal_lo', iq_p, f0=0.60, f1=0.69, ease=0.017, flare=0.002, rows=4, n=36),
        crown_band(gid_h + '_iqal_hi', iq_p, f0=0.70, f1=0.79, ease=0.016, flare=0.002, rows=4, n=36),
    ]
    c_brow = a + (b - a) * 0.68
    if brow_hirz:
        h_f = first_hit(c_brow, -bk) or 0.100
        parts.extend(hirz_amulet_box(gid_h + '_brow_hirz', c_brow - bk * (h_f + 0.022), -bk,
                                     width=0.044, height=0.024, bells=False, rigid_joint='Head'))
    if ibex_horns_paint is not None:
        for sd, tag in ((-1.0, 'R'), (1.0, 'L')):
            d_s = left * (sd * 0.86) - bk * 0.50
            d_s /= np.linalg.norm(d_s)
            h_s = first_hit(c_brow, d_s) or 0.094
            r0 = c_brow + d_s * (h_s + 0.019)
            r1 = r0 + left * (sd * 0.052) + up * 0.075 + bk * 0.015
            r2 = r1 + left * (sd * 0.018) + up * 0.088 + bk * 0.055
            r3 = r2 - left * (sd * 0.032) + up * 0.052 + bk * 0.048
            parts.append(horn(f'{gid_h}_ibex_{tag}', [r0, r1, r2, r3], 0.021, 0.005,
                              ibex_horns_paint, n=10, rows=10, rigid_joint='Head'))
    if litham_paint is not None:
        parts.append(sculpted_faceplate(gid_h + '_litham', litham_paint,
                                        f_top=0.40, f_bot=-0.08, ease=0.014, span=0.48, rows=12, cols=23,
                                        brow_relief=0.002, nose_relief=0.020, cheek_relief=0.009, chin_relief=0.010))
    return parts


def apache_warshirt_yoke(gid_t, yoke_paint, shirt_ease=0.018):
    """3D scalloped & V-fringed Chiricahua smoke-buckskin pectoral & dorsal war-shirt yoke (flush 360-degree shoulder saddle)."""
    yoke = collar_disc(gid_t + '_buckyoke', 0.118, yoke_paint, drop=0.115,
                       scallop=0.14, ease=min(shirt_ease + 0.003, 0.021), rows=9, n=48)
    yoke.cloth = None
    return [yoke]


def breechclout_sirwal(gid_l, sirwal_paint, clout_paint, ease=0.013, bag=0.006):
    """Tailored desert *sirwāl* trousers paired with front & back beaded Apache buckskin breechclout aprons."""
    parts = trousers(gid_l, sirwal_paint, ease=min(ease, 0.014), ease_end=0.009, bag=min(bag, 0.006), rows=14, n=22)
    parts.extend(tabard(gid_l + '_breechclout', core.KNEE + 0.02, core.WAIST - 0.012,
                        clout_paint, width=0.20, ease=ease + 0.018, front=True, back=True))
    return parts


def dasri_bracers(gid_g, cuff_paint, palm_paint=None, concho_paint=None, bells_paint=None, f0=0.56):
    """Forearm thorn-wraps, alembic gauntlets, archer bracers, or hawk-bell ritual cuffs."""
    from ..types.limbs import full_gloves
    if palm_paint is not None and gid_g.endswith(('_gloves', '_gauntlets')):
        parts = full_gloves(gid_g, cuff_paint, palm_paint, f0=f0, ease=0.015)
        for s, sgn in ((L, 1.0), (R, -1.0)):
            cuff_pt = next((p for p in parts if p.name == f'{gid_g}_cuff_{s[0]}'), None)
            if cuff_pt is None:
                continue
            if concho_paint is not None:
                mid_r = cuff_pt.P[2]
                idx_top = int(np.argmax(mid_r[:, 2]))
                p_con = mid_r[idx_top] + np.array([0.0, 0.0, 0.004])
                parts.append(rosette(f'{gid_g}_concho_{s[0]}', p_con, np.array([0.0, 0.0, 1.0]),
                                     np.array([sgn, 0.0, 0.0]), 0.014, concho_paint, n=10, thick=0.005,
                                     rigid_joint=s + 'ForeArm'))
            if bells_paint is not None:
                for bi, ri in enumerate((1, 3, 4)):
                    ring_b = cuff_pt.P[min(ri, len(cuff_pt.P) - 1)]
                    idx_bot = int(np.argmin(ring_b[:, 2]))
                    p_bl = ring_b[idx_bot] - np.array([0.0, 0.0, 0.009])
                    parts.append(blob(f'{gid_g}_bell_{s[0]}_{bi}', p_bl, (0.014, 0.014, 0.016),
                                      bells_paint, n=8, rows=4, out=np.array([0.0, 0.0, -1.0]),
                                      rigid_joint=s + 'ForeArm', role='trinket'))
        return parts
    parts = []
    for s, sgn in ((L, 1.0), (R, -1.0)):
        slv = sleeve(f'{gid_g}_bracer_{s[0]}', s, cuff_paint, f0=f0, f1=0.97, ease=0.026, flare=0.004, rows=6, n=20)
        parts.append(slv)
        if concho_paint is not None:
            mid_r = slv.P[2]
            idx_top = int(np.argmax(mid_r[:, 2]))
            p_con = mid_r[idx_top] + np.array([0.0, 0.0, 0.004])
            parts.append(rosette(f'{gid_g}_concho_{s[0]}', p_con, np.array([0.0, 0.0, 1.0]),
                                 np.array([sgn, 0.0, 0.0]), 0.014, concho_paint, n=10, thick=0.005,
                                 rigid_joint=s + 'ForeArm'))
        if bells_paint is not None:
            for bi, ri in enumerate((1, 3, 4)):
                ring_b = slv.P[min(ri, len(slv.P) - 1)]
                idx_bot = int(np.argmin(ring_b[:, 2]))
                p_bl = ring_b[idx_bot] - np.array([0.0, 0.0, 0.009])
                parts.append(blob(f'{gid_g}_bell_{s[0]}_{bi}', p_bl, (0.014, 0.014, 0.016),
                                  bells_paint, n=8, rows=4, out=np.array([0.0, 0.0, -1.0]),
                                  rigid_joint=s + 'ForeArm', role='trinket'))
        if palm_paint is not None:
            w_pt = J(s + 'Hand')
            idx1, pnk1 = J(s + 'HandIndex1'), J(s + 'HandPinky1')
            knuckles = 0.25 * (idx1 + J(s + 'HandMiddle1') + J(s + 'HandRing1') + pnk1)
            d_hand = knuckles - w_pt
            u_ax = d_hand / np.linalg.norm(d_hand)
            x_ax = (idx1 - pnk1) - u_ax * np.dot(idx1 - pnk1, u_ax)
            x_ax /= np.linalg.norm(x_ax)
            y_ax = np.cross(u_ax, x_ax)
            y_ax /= np.linalg.norm(y_ax)
            rows = []
            for t in np.linspace(0.0, 0.90, 5):
                cc = w_pt + d_hand * t
                rx, ry = 0.040 + 0.006 * t, 0.021 * (1.0 - 0.10 * t)
                rows.append([cc + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry)
                             for an in np.linspace(0, 2 * math.pi, 20, endpoint=False)])
            palm = Part(f'{gid_g}_palm_{s[0]}', np.array(rows), True, ['helper-tights'] * 5, palm_paint,
                        rigid_joint=s + 'Hand', role='cuff', side=s[0])
            palm.is_arm = True
            parts.append(palm)
    return parts
