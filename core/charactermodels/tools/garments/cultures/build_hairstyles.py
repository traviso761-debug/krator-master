"""Build 50 procedural 3D hairstyles across the 5 user reference sheets.

Sheet 1 (s1_01..s1_10): Classical / Hellenistic / Long Curled, Wavy & Half-Up Hairstyles (10 styles)
Sheet 2 (s2_01..s2_10): Tousled, Viking, Shaved-Side & Forelock / Mohawk Hairstyles (10 styles)
Sheet 3 (s3_01..s3_10): Levantine / Mediterranean Wavy, Half-Tied, Topknot & Braided Hairstyles (10 styles)
Sheet 4 (s4_01..s4_10): Medieval & Renaissance Pageboy, Bowl Cut, Bob & Aureole Curls (10 styles)
Sheet 5 (s5_01..s5_10): East Asian / Steppe Topknots, Hairpin Crowns & Queue Braids (10 styles)
"""
import copy
import io
import json
import math
import os
import struct
import sys
import time
from pathlib import Path

os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
os.environ.setdefault('MKL_NUM_THREADS', '1')

import numpy as np
from PIL import Image

SCRATCH = Path(__file__).resolve().parent             # the builders beside this one (once Gemini's scratch folder)
sys.path.insert(0, str(SCRATCH))
import build_inspired_outfits as bio
from build_inspired_outfits import (
    ROOT, C, P, B, PN, Part, first_hit, assemble_garment, glbio, make_mpfb
)

# Neutral hair shades (~0.46 linear so kit.tint.roles['hair'] * gain 2.0964 = 0.96x rec.hair_color)
# plus untinted accessory shades (gold fillet, wooden/jade hairpin, leather cord ties)
C.update({
    'hair_base':   (0.47, 0.46, 0.45),
    'hair_light':  (0.64, 0.62, 0.60),
    'hair_dark':   (0.28, 0.27, 0.26),
    'hair_stubble':(0.56, 0.54, 0.52),
    'hair_gold':   (0.90, 0.72, 0.25),
    'hair_brass':  (0.60, 0.42, 0.12),
    'hair_wood':   (0.44, 0.28, 0.15),
    'hair_jade':   (0.32, 0.52, 0.38),
    'cyb_porc':    (0.88, 0.90, 0.92),
    'cyb_silver':  (0.70, 0.73, 0.77),
    'cyb_cyan':    (0.28, 0.88, 1.00),
    'cyb_gun':     (0.36, 0.37, 0.39),
    'cyb_dark':    (0.16, 0.17, 0.19),
    'cyb_titan':   (0.62, 0.64, 0.67),
})

_orig_motif = bio.motif


def _hair_motif(style, w, h, fg, bg, aspect=1.0):
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)
    if style == 'hair_strands':
        img = np.empty((h, w, 3), dtype=np.float64)
        s1 = np.sin(u * 2 * math.pi * 54.0 + 0.30 * np.sin(v * 2 * math.pi * 3.0))
        s2 = np.sin(u * 2 * math.pi * 150.0 + 0.50 * np.cos(v * 2 * math.pi * 6.0))
        clump = np.sin(u * 2 * math.pi * 16.0)
        aniso = 0.88 + 0.14 * np.sin(np.clip(v, 0.0, 1.0) * math.pi * 2.0)
        shade = 0.50 + 0.20 * s1 + 0.14 * s2 + 0.12 * clump
        t = np.clip(shade * aniso, 0.0, 1.0)[..., None]
        img[:] = np.asarray(bg) * (1.0 - t) + np.asarray(fg) * t
        return img
    elif style == 'hair_waves':
        img = np.empty((h, w, 3), dtype=np.float64)
        wave = 0.045 * np.sin(v * 2 * math.pi * 6.0)
        s1 = np.sin((u + wave) * 2 * math.pi * 40.0)
        s2 = np.sin((u + wave) * 2 * math.pi * 120.0)
        ridge = 0.52 + 0.26 * np.cos(v * 2 * math.pi * 6.0)
        t = np.clip(0.36 + 0.22 * s1 + 0.14 * s2 + 0.26 * ridge, 0.0, 1.0)[..., None]
        img[:] = np.asarray(bg) * (1.0 - t) + np.asarray(fg) * t
        return img
    elif style == 'hair_curls':
        img = np.empty((h, w, 3), dtype=np.float64)
        nx, ny = 18.0, 10.0
        row_c = np.floor(v * ny).astype(int)
        cu = (u * nx + 0.5 * (row_c % 2)) % 1.0 - 0.5
        cv = (v * ny) % 1.0 - 0.5
        r = np.hypot(cu * 1.15, cv * 1.15)
        ang = np.arctan2(cv, cu)
        spiral = np.sin(r * 16.0 - ang * 2.0)
        t = np.clip(0.48 + 0.32 * spiral - 0.28 * np.clip(r - 0.38, 0.0, 0.5), 0.0, 1.0)[..., None]
        img[:] = np.asarray(bg) * (1.0 - t) + np.asarray(fg) * t
        return img
    elif style == 'hair_braid':
        img = np.empty((h, w, 3), dtype=np.float64)
        nx = 6.0
        bu = (u * nx) % 1.0 - 0.5
        sgn = np.where(bu >= 0, 1.0, -1.0)
        diag = (v * 14.0 + sgn * np.abs(bu) * 5.0) % 1.0
        lobe = np.sin(diag * math.pi) ** 0.75
        fiber = 0.5 + 0.35 * np.sin((v * 28.0 + sgn * bu * 18.0) * 2 * math.pi)
        groove = np.clip(1.0 - np.abs(bu) * 2.0, 0.22, 1.0)
        t = np.clip(lobe * (0.68 + 0.32 * fiber) * (0.60 + 0.40 * groove), 0.0, 1.0)[..., None]
        img[:] = np.asarray(bg) * (1.0 - t) + np.asarray(fg) * t
        return img
    elif style == 'gold_fillet':
        img = np.empty((h, w, 3), dtype=np.float64)
        img[:] = C['hair_gold']
        rim = (v < 0.20) | (v > 0.80) | (np.abs(v - 0.5) < 0.08)
        img[rim] = C['hair_brass']
        flute = np.sin(u * 2 * math.pi * 24.0) > 0.25
        img[(v >= 0.22) & (v <= 0.78) & flute] = (1.0, 0.88, 0.44)
        return img
    elif style == 'wood_pin':
        img = np.empty((h, w, 3), dtype=np.float64)
        grain = 0.5 + 0.5 * np.sin(u * 2 * math.pi * 12.0 + 2.0 * np.sin(v * math.pi * 4.0))
        img[:] = np.asarray(C['hair_wood']) * (0.78 + 0.35 * grain[..., None])
        img[:, int(w * 0.82):] = C['hair_jade']
        return img
    elif style == 'cyber_porcelain':
        img = np.empty((h, w, 3), dtype=np.float64)
        img[:] = C['cyb_porc']
        edge = (v < 0.14) | (v > 0.86) | (u < 0.04) | (u > 0.96)
        img[edge] = C['cyb_silver']
        glow_line = (np.abs(v - 0.50) < 0.07) & ((np.sin(u * 2 * math.pi * 6.0) > -0.2))
        img[glow_line] = C['cyb_cyan']
        filigree = (np.abs(np.sin(u * 2 * math.pi * 8.0) * 0.22 + (v - 0.5)) < 0.03)
        img[filigree & ~glow_line] = (0.48, 0.52, 0.58)
        return img
    elif style == 'cyber_cyan_glow':
        img = np.empty((h, w, 3), dtype=np.float64)
        r = np.hypot(u - 0.5, v - 0.5) * 2.0
        ring = (np.abs(r - 0.62) < 0.10) | (r < 0.26) | (np.abs(u - 0.5) < 0.04) | (np.abs(v - 0.5) < 0.04)
        img[:] = (0.14, 0.45, 0.62)
        img[ring] = C['cyb_cyan']
        img[r > 0.82] = C['cyb_silver']
        return img
    elif style == 'cyber_gunmetal':
        img = np.empty((h, w, 3), dtype=np.float64)
        brush = 0.92 + 0.08 * np.sin(u * 2 * math.pi * 45.0)
        img[:] = np.asarray(C['cyb_gun']) * brush[..., None]
        bevel = (v < 0.15) | (v > 0.85) | (np.abs(u - 0.5) < 0.03)
        img[bevel] = C['cyb_dark']
        vents = (v > 0.35) & (v < 0.65) & (np.sin(u * 2 * math.pi * 16.0) > 0.45)
        img[vents] = (0.10, 0.11, 0.12)
        return img
    elif style == 'cyber_cable':
        img = np.empty((h, w, 3), dtype=np.float64)
        rib = 0.5 + 0.5 * np.cos(u * 2 * math.pi * 28.0)
        img[:] = np.asarray(C['cyb_dark']) * (0.55 + 0.65 * rib[..., None])
        return img
    elif style == 'cyber_titanium':
        img = np.empty((h, w, 3), dtype=np.float64)
        brush = 0.94 + 0.06 * np.sin(u * 2 * math.pi * 50.0)
        img[:] = np.asarray(C['cyb_titan']) * brush[..., None]
        seam = (v < 0.12) | (v > 0.88) | (np.abs(v - 0.5) < 0.04)
        img[seam] = (0.34, 0.36, 0.39)
        return img
    return _orig_motif(style, w, h, fg, bg, aspect=aspect)


bio.motif = _hair_motif


def P_hair(style='hair_strands', base='hair_base', light='hair_light', dark='hair_dark'):
    return P(base, 0.06, [B('bottom', 0.0, 1.0, style, light, dark, 0.25)], fabric='fur.short')


def P_gold():
    p = P('hair_gold', 0.02, [B('bottom', 0.0, 1.0, 'gold_fillet', 'hair_gold', 'hair_brass', 0.10)], fabric='metal.gold')
    p['_is_gold'] = True
    return p


def P_pin():
    p = P('hair_wood', 0.04, [B('bottom', 0.0, 1.0, 'wood_pin', 'hair_wood', 'hair_brass', 0.10)], fabric='leather.smooth')
    p['_is_gold'] = True
    return p


# ---------------------------------------------------------------------------------------------------------------
# Precompute 3D Spherical Skull Table & Cylindrical Head/Neck/Shoulder Table on mpfb_male
# ---------------------------------------------------------------------------------------------------------------
C_SKULL = np.array([0.0, -0.048, 1.685], dtype=np.float64)
_PHIS = np.linspace(0.0, math.radians(154.0), 53)
_THETAS = np.linspace(-math.pi, math.pi, 73)
_SKULL_R = np.zeros((len(_PHIS), len(_THETAS)), dtype=np.float64)

for ip, phi in enumerate(_PHIS):
    for it, th in enumerate(_THETAS):
        ath = abs(th)
        d = np.array([math.sin(phi) * math.sin(ath), -math.sin(phi) * math.cos(ath), math.cos(phi)])
        h = first_hit(C_SKULL + d * 0.25, -d)
        r = (0.25 - h) if (h is not None and (0.25 - h) > 0.065) else 0.078
        # Bridge across the ear hole in Human.body (phi in [85°, 128°], |th| in [65°, 105°])
        if math.radians(82.0) <= phi <= math.radians(130.0) and math.radians(64.0) <= ath <= math.radians(108.0):
            r = max(r, 0.076)
        _SKULL_R[ip, it] = r


def skull_r(phi, th, cover_ears=False):
    pc = float(np.clip(phi, _PHIS[0], _PHIS[-1]))
    tc = float(np.clip(((th + math.pi) % (2 * math.pi)) - math.pi, -math.pi, math.pi))
    ip = int(np.clip(np.searchsorted(_PHIS, pc) - 1, 0, len(_PHIS) - 2))
    it = int(np.clip(np.searchsorted(_THETAS, tc) - 1, 0, len(_THETAS) - 2))
    fp = (pc - _PHIS[ip]) / (_PHIS[ip + 1] - _PHIS[ip])
    ft = (tc - _THETAS[it]) / (_THETAS[it + 1] - _THETAS[it])
    r00, r01 = _SKULL_R[ip, it], _SKULL_R[ip, it + 1]
    r10, r11 = _SKULL_R[ip + 1, it], _SKULL_R[ip + 1, it + 1]
    r = (1 - fp) * ((1 - ft) * r00 + ft * r01) + fp * ((1 - ft) * r10 + ft * r11)
    if cover_ears:
        ath = abs(tc)
        if math.radians(84.0) <= pc <= math.radians(130.0) and math.radians(66.0) <= ath <= math.radians(104.0):
            pe = 1.0 - ((pc - math.radians(107.0)) / math.radians(23.0)) ** 2
            te = 1.0 - ((ath - math.radians(85.0)) / math.radians(19.0)) ** 2
            r = max(r, 0.076 + 0.017 * max(0.0, pe) * max(0.0, te))
    return r


# Cylindrical head/neck/shoulder clearance table around (0.0, -0.035, z)
_CYL_ZS = np.linspace(1.30, 1.77, 48)
_CYL_THS = np.linspace(-math.pi, math.pi, 73)
_CYL_R = np.zeros((len(_CYL_ZS), len(_CYL_THS)), dtype=np.float64)

for iz, z in enumerate(_CYL_ZS):
    c = np.array([0.0, -0.035, z])
    for it, th in enumerate(_CYL_THS):
        ath = abs(th)
        d = np.array([math.sin(ath), -math.cos(ath), 0.0])
        h = first_hit(c + d * 0.32, -d)
        r = (0.32 - h) if (h is not None and (0.32 - h) > 0.042) else 0.068
        # Ear pinna clearance if z in [1.622, 1.686] and |th| in [68°, 104°]
        if 1.622 <= z <= 1.686 and math.radians(68.0) <= ath <= math.radians(104.0):
            r = max(r, 0.075)
        _CYL_R[iz, it] = r


def cyl_r(z, th, cover_ears=True):
    zc = float(np.clip(z, _CYL_ZS[0], _CYL_ZS[-1]))
    tc = float(np.clip(((th + math.pi) % (2 * math.pi)) - math.pi, -math.pi, math.pi))
    iz = int(np.clip(np.searchsorted(_CYL_ZS, zc) - 1, 0, len(_CYL_ZS) - 2))
    it = int(np.clip(np.searchsorted(_CYL_THS, tc) - 1, 0, len(_CYL_THS) - 2))
    fz = (zc - _CYL_ZS[iz]) / (_CYL_ZS[iz + 1] - _CYL_ZS[iz])
    ft = (tc - _CYL_THS[it]) / (_CYL_THS[it + 1] - _CYL_THS[it])
    r00, r01 = _CYL_R[iz, it], _CYL_R[iz, it + 1]
    r10, r11 = _CYL_R[iz + 1, it], _CYL_R[iz + 1, it + 1]
    r = (1 - fz) * ((1 - ft) * r00 + ft * r01) + fz * ((1 - ft) * r10 + ft * r11)
    if cover_ears:
        ath = abs(tc)
        if 1.620 <= zc <= 1.688 and math.radians(66.0) <= ath <= math.radians(104.0):
            ze = 1.0 - ((zc - 1.654) / 0.034) ** 2
            te = 1.0 - ((ath - math.radians(85.0)) / math.radians(19.0)) ** 2
            r = max(r, 0.075 + 0.017 * max(0.0, ze) * max(0.0, te))
    return r


# ---------------------------------------------------------------------------------------------------------------
# Core 3D Hair Builders
# ---------------------------------------------------------------------------------------------------------------
def _make_part(name, G, paint, wrap_u=False, wrap_v=False, Rigid='Head', use_trunk=False):
    G_arr = np.asarray(G, dtype=np.float64)
    return Part(name, G_arr, bool(wrap_u), ['body'] * G_arr.shape[0], paint, rigid_joint=Rigid)


def _close_thick_sheet(G_out, G_in, close_u=True):
    """Wrap outer + inner (rows, cols, 3) grids into a closed 3D Part grid."""
    G = np.concatenate([G_out, G_in[-2:0:-1]], axis=0)
    return G


def sculpt_scalp_dome(
    name, paint,
    phi_front_deg=64.0,     # forehead hairline (64°=normal forehead, 85°=bangs, 44°=receding)
    phi_temple_deg=88.0,    # temple hairline at |th|~52°
    phi_sideburn_deg=110.0, # sideburn tip in front of ear at |th|~68°
    phi_ear_deg=88.0,       # arch over ear at |th|~86° (or >115° if covering ear)
    phi_nape_deg=135.0,     # back of neck hairline at |th|=180°
    widow_peak_deg=4.0,     # downward peak at center forehead (negative for parting notch)
    part_x=None,            # None=no part, 0.0=center part, +0.026=side part
    part_depth=0.008,
    thick_crown=0.016,
    thick_front=0.014,
    thick_side=0.012,
    thick_nape=0.014,
    bangs_roll=0.0,         # extra forward volume at front hem for bowl/Caesar bangs
    wave_amp=0.002,
    wave_freq=6.0,
    lobe_count=16,
    lobe_amp=0.0018,
    cover_ears=False,
    rows=18,
    cols=48,
):
    """Build a closed 3D sculpted scalp/short-hair dome over the cranium."""
    # Parameterize u in [0, 1) around the azimuth starting at back (-pi..+pi) so seam is welded
    ths = np.linspace(-math.pi, math.pi, cols, endpoint=False)
    phi_max_arr = np.zeros(cols)

    phi_f = (68.0 + 0.65 * (phi_front_deg - 58.0)) if phi_front_deg >= 50.0 else phi_front_deg
    phi_t = max(phi_temple_deg, phi_f + 8.0)

    for j, th in enumerate(ths):
        ath_deg = math.degrees(abs(th))
        if ath_deg < 56.0:
            t = ath_deg / 56.0
            s = t * t * (3.0 - 2.0 * t)
            wp = widow_peak_deg * math.cos(min(ath_deg / 28.0, 1.0) * math.pi * 0.5) ** 2
            pm = (phi_f + wp) * (1.0 - s) + phi_t * s
        elif ath_deg < 72.0:
            # Sideburn tab in front of ear
            t = (ath_deg - 56.0) / 16.0
            sb = math.sin(t * math.pi)
            pm = (phi_t * (1.0 - t) + phi_ear_deg * t) + (phi_sideburn_deg - max(phi_t, phi_ear_deg)) * sb
        elif ath_deg < 104.0:
            # Over the ear
            t = (ath_deg - 72.0) / 32.0
            arch = math.sin(t * math.pi)
            pm = phi_ear_deg - (4.0 if not cover_ears else -6.0) * arch
        else:
            # Behind the ear down to the nape
            t = (ath_deg - 104.0) / 76.0
            s = t * t * (3.0 - 2.0 * t)
            phi_nape_eff = max(float(phi_nape_deg), 144.0) if phi_nape_deg >= 120.0 else float(phi_nape_deg)
            pm = phi_ear_deg * (1.0 - s) + phi_nape_eff * s
        phi_max_arr[j] = math.radians(pm)

    vs = np.linspace(0.0, 1.0, rows)
    G_out = np.zeros((rows, cols, 3))
    G_in = np.zeros((rows, cols, 3))

    for i, v in enumerate(vs):
        v_eff = v
        for j, th in enumerate(ths):
            phi = v_eff * phi_max_arr[j]
            d = np.array([math.sin(phi) * math.sin(th), -math.sin(phi) * math.cos(th), math.cos(phi)])
            r_skin = skull_r(phi, th, cover_ears=cover_ears)
            p_in = C_SKULL + d * (r_skin - 0.0025)

            # Azimuthal blend of thickness (front / side / back)
            ath = abs(th)
            w_front = max(0.0, math.cos(ath * 0.8)) ** 2 if ath < math.pi * 0.6 else 0.0
            w_back = max(0.0, -math.cos(ath)) ** 1.5
            w_side = max(0.0, 1.0 - w_front - w_back)
            thk_rim = w_front * thick_front + w_side * thick_side + w_back * thick_nape
            thk = thick_crown * (1.0 - v ** 1.2) + thk_rim * (v ** 1.2)

            # Full thickness at crown pole v=0; taper only near outer rim v -> 1
            edge_env = math.sin(min((1.0 - v) / 0.14, 1.0) * math.pi * 0.5) ** 0.55
            if v > 0.88:
                edge_env = max(edge_env, 0.25 * (1.0 - (v - 0.88) / 0.12))

            # Parting groove on top/front of dome
            p_base = C_SKULL + d * r_skin
            groove = 0.0
            if part_x is not None and p_base[1] < 0.01:
                dx = abs(p_base[0] - part_x)
                front_w = np.clip((-p_base[1] + 0.01) / 0.06, 0.0, 1.0)
                if dx < 0.016:
                    groove = -part_depth * front_w * math.cos((dx / 0.016) * math.pi * 0.5) ** 2
                elif dx < 0.048:
                    # Slight volume puff on either side of the part!
                    puff = math.sin(((dx - 0.016) / 0.032) * math.pi)
                    groove = 0.005 * front_w * puff

            # Wave & strand lobe relief
            wave = wave_amp * math.sin(v * math.pi * wave_freq + 2.0 * math.cos(th * 2.0)) * math.sin(v * math.pi)
            lobe = lobe_amp * math.cos(th * lobe_count) * (v ** 0.7)

            # Extra forward bangs roll near front forehead
            b_roll = 0.0
            if bangs_roll > 0.0 and ath < math.radians(52.0):
                fw = math.cos((ath / math.radians(52.0)) * math.pi * 0.5) ** 1.5
                b_roll = bangs_roll * fw * math.sin(v * math.pi) ** 1.2

            min_disp = 0.0060 if v < 0.90 else 0.0030
            disp = max(min_disp, (thk + groove + wave + lobe + b_roll) * edge_env)
            p_out = C_SKULL + d * (r_skin + disp)
            if v > 0.92 and bangs_roll > 0.0 and ath < math.radians(52.0):
                # Tuck very bottom edge slightly down & inward
                p_out[2] -= 0.004 * ((v - 0.92) / 0.08)

            G_in[i, j] = p_in
            G_out[i, j] = p_out

    G = _close_thick_sheet(G_out, G_in, close_u=True)
    return _make_part(name, G, paint, wrap_u=True, wrap_v=True, Rigid='Head', use_trunk=False)


def sculpt_bianfa_cap(
    name, paint,
    y_front_line=-0.025,    # coronal hairline Y coordinate across top of skull (-0.025 = mid-crown)
    z_nape=1.585,           # bottom of back hairline at nape
    thick=0.009,
    temple_fringes=False,   # True for s5_08 (receding hairline with wispy side locks)
    rows=16,
    cols=36,
):
    """Build a sleek rear-cranium hair cap for East Asian/Steppe shaved-forehead queue styles (Sheet 5: 6..10)."""
    # Parameterize u in [-1, 1] across the back from right ear/temple (-X) to left ear/temple (+X),
    # and v in [0, 1] from the coronal front line (y = y_front_line) over the back dome down to the nape!
    us = np.linspace(-1.0, 1.0, cols)
    vs = np.linspace(0.0, 1.0, rows)
    G_out = np.zeros((rows, cols, 3))
    G_in = np.zeros((rows, cols, 3))

    for j, u in enumerate(us):
        # At v=0 (front coronal arch over the crown and behind the ears):
        # u in [-1, 1] maps angle alpha in [-pi/2, +pi/2] in the X-Z plane!
        alpha = u * (math.pi * 0.52)
        for i, v in enumerate(vs):
            # Spherical interpolation from coronal arch (v=0) toward back of neck/occiput (v=1)
            # At v=0: point is near y = y_front_line + 0.025 * sin(alpha)^2 (behind ears)
            # At v=1: point converges toward the nape arc at z = z_nape..z_nape+0.025, y = +0.035
            phi_back = (1.0 - v) * math.radians(78.0) + v * math.radians(18.0 + 28.0 * abs(u))
            # Unit direction from C_SKULL where +Y is the pole (phi_back=0 is straight +Y back!)
            dy = math.cos(phi_back)
            dx = math.sin(phi_back) * math.sin(alpha)
            dz = math.sin(phi_back) * math.cos(alpha)
            # Shift coronal plane according to y_front_line
            y_bias = (y_front_line - (-0.025)) * (1.0 - v)
            d_raw = np.array([dx, dy - y_bias * 8.0, dz - 0.35 * (v ** 1.6)])
            d = d_raw / max(np.linalg.norm(d_raw), 1e-6)

            # Convert d to standard (phi, th) for skull_r lookup
            phi_std = math.acos(np.clip(d[2], -1.0, 1.0))
            th_std = math.atan2(d[0], -d[1])
            r_skin = skull_r(phi_std, th_std, cover_ears=False)

            env = math.sin(min(v / 0.14, 1.0) * math.pi * 0.5) * math.sin(min((1.0 - v) / 0.15, 1.0) * math.pi * 0.5) * math.sin(min((1.0 - abs(u)) / 0.12, 1.0) * math.pi * 0.5)
            G_in[i, j] = C_SKULL + d * (r_skin - 0.002)
            G_out[i, j] = C_SKULL + d * (r_skin + max(0.0012, thick * env))

    # Close sheet without wrapping u (u=-1 and u=+1 are the left/right side borders behind the ears)
    G = np.concatenate([G_out, G_in[::-1]], axis=0)
    return _make_part(name, G, paint, wrap_u=False, wrap_v=True, Rigid='Head', use_trunk=False)


def sculpt_flowing_mane(
    name, paint,
    z_top=1.768,            # crown/parting start height
    z_bot=1.470,            # bottom hem height (1.57=jaw, 1.48=shoulder, 1.40=chest)
    theta_top_deg=3.0,      # angle at top of forehead (small = meets at center part)
    theta_brow_deg=52.0,    # face opening angle at brow/eye level (z ~ 1.68)
    theta_cheek_deg=62.0,   # face opening angle at cheek/jaw level (z ~ 1.60)
    theta_bot_deg=68.0,     # opening angle at bottom hem
    tuck_behind_ears=False, # True = sweeps behind ears (|th| ~ 95°) at z in [1.62, 1.68]
    cover_ears=True,
    part_depth=0.009,
    thick_crown=0.018,
    thick_mid=0.024,
    thick_bot=0.018,
    bell_flare=0.012,       # outward radial flare toward bottom hem
    pageboy_roll=0.0,       # inward curl at bottom hem for pageboy/bowl bobs
    wave_amp=0.005,
    wave_freq=4.5,
    lobe_count=14,
    lobe_amp=0.0035,
    v_notch_back=0.0,       # downward V-taper on back hem
    rows=24,
    cols=45,
):
    """Build a closed 3D flowing hair mane from the crown/parting down over the sides, back, and shoulders.

    u in [-1, 1] runs from the right front hair edge (-1) around the back (0) to the left front hair edge (+1),
    so the back of the head is 100% seamless and u = ±1 form thick 3D face-framing curtains!
    """
    us = np.linspace(-1.0, 1.0, cols)
    vs = np.linspace(0.0, 1.0, rows)
    G_out = np.zeros((rows, cols, 3))
    G_in = np.zeros((rows, cols, 3))

    for i, v in enumerate(vs):
        # Vertical profile: near v=0, curve over the top of the crown; then descend to z_bot
        z_base = z_top - (z_top - z_bot) * (v ** 0.88)

        # Determine front opening angle theta_front(v) based on height z_base
        if z_base > 1.720:
            t = (1.768 - z_base) / max(1.768 - 1.720, 1e-4)
            s = np.clip(t, 0.0, 1.0) ** 1.4
            th_f_deg = theta_top_deg + (theta_brow_deg * 0.55 - theta_top_deg) * s
        elif z_base > 1.665:
            t = (1.720 - z_base) / 0.055
            s = t * t * (3.0 - 2.0 * t)
            th_f_deg = theta_brow_deg * 0.55 + (theta_brow_deg - theta_brow_deg * 0.55) * s
        elif z_base > 1.590:
            t = (1.665 - z_base) / 0.075
            s = t * t * (3.0 - 2.0 * t)
            th_f_deg = theta_brow_deg + (theta_cheek_deg - theta_brow_deg) * s
        else:
            t = np.clip((1.590 - z_base) / max(1.590 - z_bot, 0.05), 0.0, 1.0)
            th_f_deg = theta_cheek_deg + (theta_bot_deg - theta_cheek_deg) * t

        if tuck_behind_ears and 1.595 <= z_base <= 1.695:
            ear_w = math.sin(((z_base - 1.595) / 0.100) * math.pi) ** 1.2
            th_f_deg = max(th_f_deg, th_f_deg * (1.0 - ear_w) + 96.0 * ear_w)

        th_front = math.radians(th_f_deg)

        for j, u in enumerate(us):
            au = abs(u)
            sgn = 1.0 if u >= 0 else -1.0
            # u=0 -> th = pi (back center); u=±1 -> th = ±th_front (front face-framing edges)
            th = sgn * (math.pi - au * (math.pi - th_front))

            # Optional back V-taper on bottom hem
            z = z_base - v_notch_back * (v ** 1.5) * math.cos(u * math.pi * 0.5) ** 2

            # For top crown rows (z > 1.69), blend spherical skull_r with cylindrical cyl_r so the top dome is round!
            c_axis = np.array([0.0, -0.035, z])
            d_horiz = np.array([math.sin(th), -math.cos(th), 0.0])

            if z > 1.685:
                # Vector from C_SKULL to cylindrical surface point
                r_c = cyl_r(z, th, cover_ears=cover_ears and not tuck_behind_ears)
                p_cyl = c_axis + d_horiz * r_c
                vec = p_cyl - C_SKULL
                dist = max(np.linalg.norm(vec), 1e-5)
                d_sph = vec / dist
                phi_s = math.acos(np.clip(d_sph[2], -1.0, 1.0))
                th_s = math.atan2(d_sph[0], -d_sph[1])
                r_sph = skull_r(phi_s, th_s, cover_ears=cover_ears and not tuck_behind_ears)
                p_skin = C_SKULL + d_sph * r_sph
                n_out = d_sph
            else:
                r_c = cyl_r(z, th, cover_ears=cover_ears and not tuck_behind_ears)
                p_skin = c_axis + d_horiz * r_c
                n_out = d_horiz

            # Thickness & bell flare along v
            thk = (
                thick_crown * (1.0 - v) ** 2
                + 2.0 * thick_mid * v * (1.0 - v)
                + thick_bot * (v ** 2)
            )
            flare = bell_flare * (v ** 1.35) * (0.65 + 0.35 * math.cos(u * math.pi * 0.5))

            # Pageboy inward roll at bottom hem (v in [0.78, 1.0])
            roll_dr = 0.0
            roll_dz = 0.0
            if pageboy_roll > 0.0:
                if v < 0.82:
                    roll_dr = pageboy_roll * 0.55 * math.sin((v / 0.82) * math.pi * 0.5)
                else:
                    tv = (v - 0.82) / 0.18
                    roll_dr = pageboy_roll * 0.55 * math.cos(tv * math.pi * 0.75)
                    roll_dz = 0.008 * (1.0 - math.cos(tv * math.pi * 0.5))

            # Center part groove at top-front (v < 0.22, au > 0.78)
            groove = 0.0
            if v < 0.25 and au > 0.72:
                gw = (1.0 - v / 0.25) * ((au - 0.72) / 0.28)
                groove = -part_depth * gw

            # Wave & strand lobe relief
            wave = wave_amp * math.sin(v * math.pi * wave_freq + 1.5 * math.cos(u * math.pi * 2.0)) * (v ** 0.5)
            lobe = lobe_amp * math.cos(u * math.pi * lobe_count) * math.sin(v * math.pi) ** 0.6

            # Smooth taper at front curtain edges (au -> 1) and top/bottom hems
            u_env = math.sin(min((1.0 - au) / 0.09, 1.0) * math.pi * 0.5) ** 0.55
            v_env = math.sin(min(v / 0.08, 1.0) * math.pi * 0.5) * math.sin(min((1.0 - v) / 0.10, 1.0) * math.pi * 0.5) ** 0.5
            env = max(0.12, u_env * v_env)

            # Inner surface tracks skin clearance (and follows outer flare so hair isn't 8cm thick at shoulders)
            in_offset = max(-0.002, flare + roll_dr - 0.008 * v)
            out_offset = flare + roll_dr + max(0.002, (thk + groove + wave + lobe) * env)

            p_in = p_skin + n_out * in_offset + np.array([0.0, 0.0, roll_dz])
            p_out = p_skin + n_out * out_offset + np.array([0.0, 0.0, roll_dz])

            G_in[i, j] = p_in
            G_out[i, j] = p_out

    # Seal u=-1 and u=+1 front curtain edges by wrapping v around G_out and G_in[::-1]
    G = np.concatenate([G_out, G_in[::-1]], axis=0)
    use_trunk = (z_bot < 1.545)
    return _make_part(name, G, paint, wrap_u=False, wrap_v=True, Rigid=None if use_trunk else 'Head', use_trunk=use_trunk)


def sculpt_lock_tube(
    name, paint,
    ctrl_pts,               # list/array of 3D control points along lock spine
    radii,                  # list/array of cross-section radii (or (rx, ry) tuples) at each control point
    flatten=0.65,           # flatten ratio in radial direction vs tangential direction
    curl_amp=0.0,           # helical spiral amplitude for ringlet locks
    curl_turns=0.0,         # number of helical turns along the lock
    phase=0.0,
    rib_amp=0.0,            # longitudinal strand or braid rib modulation
    rib_freq=6.0,
    braid_plait=False,      # True = 3-strand woven plait cross-section modulation
    rows=20,
    n_ring=10,
    use_trunk=False,
):
    """Build a 3D sculpted hair lock, ringlet curl, or braided plait along a smooth 3D spine."""
    pts = np.asarray(ctrl_pts, dtype=np.float64)
    rads = np.asarray(radii, dtype=np.float64)
    n_ctrl = len(pts)
    t_ctrl = np.linspace(0.0, 1.0, n_ctrl)
    ts = np.linspace(0.0, 1.0, rows)

    spine = np.column_stack([np.interp(ts, t_ctrl, pts[:, k]) for k in range(3)])
    r_arr = np.interp(ts, t_ctrl, rads)

    # Compute smooth tangents and parallel-transported cross-section frames
    tangents = np.gradient(spine, axis=0)
    tangents /= np.maximum(np.linalg.norm(tangents, axis=1, keepdims=True), 1e-6)

    normals = np.zeros_like(tangents)
    binormals = np.zeros_like(tangents)
    # Initial radial outward normal from head center (0, -0.04, spine[0,2])
    up0 = spine[0] - np.array([0.0, -0.045, spine[0, 2]])
    if np.linalg.norm(up0) < 1e-4:
        up0 = np.array([0.0, -1.0, 0.0])
    up0 /= np.linalg.norm(up0)
    b0 = np.cross(tangents[0], up0)
    if np.linalg.norm(b0) < 1e-4:
        b0 = np.array([1.0, 0.0, 0.0])
    b0 /= np.linalg.norm(b0)
    n0 = np.cross(b0, tangents[0])
    normals[0], binormals[0] = n0, b0

    for i in range(1, rows):
        bi = binormals[i - 1] - np.dot(binormals[i - 1], tangents[i]) * tangents[i]
        norm_b = np.linalg.norm(bi)
        if norm_b < 1e-5:
            bi = binormals[i - 1]
        else:
            bi /= norm_b
        ni = np.cross(bi, tangents[i])
        normals[i], binormals[i] = ni, bi

    phis = np.linspace(0.0, 2.0 * math.pi, n_ring, endpoint=False)
    G = np.zeros((rows, n_ring, 3))

    for i, t in enumerate(ts):
        c = spine[i].copy()
        n_vec, b_vec = normals[i], binormals[i]
        r_base = r_arr[i]

        # Helical ringlet spiral displacement
        if curl_amp > 0.0 and curl_turns > 0.0:
            ang = t * 2.0 * math.pi * curl_turns + phase
            env_c = math.sin(min(t / 0.18, 1.0) * math.pi * 0.5) * math.sin(min((1.0 - t) / 0.12, 1.0) * math.pi * 0.5)
            c = c + (math.cos(ang) * n_vec + math.sin(ang) * b_vec) * (curl_amp * env_c)

        for k, phi in enumerate(phis):
            mod = 1.0
            if braid_plait:
                # 3-strand plait weave relief
                lobe = 0.16 * math.sin(t * 2.0 * math.pi * 9.0 + 2.0 * math.cos(phi))
                pinch = 1.0 - 0.25 * abs(math.cos(phi))
                mod = (1.0 + lobe) * pinch
            elif rib_amp > 0.0:
                mod = 1.0 + rib_amp * math.cos(phi * rib_freq)

            rx = r_base * mod
            ry = r_base * flatten * mod
            G[i, k] = c + b_vec * (rx * math.cos(phi)) + n_vec * (ry * math.sin(phi))

    # Keep locks Rigid='Head' unless they drape onto the shoulders/back below z=1.46
    needs_trunk = use_trunk or (float(G[:, :, 2].min()) < 1.460)
    return _make_part(name, G, paint, wrap_u=True, wrap_v=False, Rigid=None if needs_trunk else 'Head', use_trunk=needs_trunk)


def sculpt_ringlet_array(
    name_prefix, paint,
    z_top=1.715,
    z_bot=1.475,
    theta_start_deg=54.0,
    n_locks=15,
    radius=0.015,
    curl_amp=0.007,
    curl_turns=3.5,
    flare_out=0.018,
    cover_ears=True,
):
    """Build a horse-shoe array of 3D helical ringlet locks around the sides and back of the head."""
    parts = []
    th_start = math.radians(theta_start_deg)
    us = np.linspace(-1.0, 1.0, n_locks)
    for idx, u in enumerate(us):
        au = abs(u)
        sgn = 1.0 if u >= 0 else -1.0
        th = sgn * (math.pi - au * (math.pi - th_start))
        d_horiz = np.array([math.sin(th), -math.cos(th), 0.0])

        # Build 6 control points along the lock from z_top down to z_bot
        n_pts = 6
        ctrl_pts = []
        radii = []
        for ip in range(n_pts):
            tv = ip / (n_pts - 1)
            z = z_top - (z_top - z_bot) * tv
            r_skin = cyl_r(z, th, cover_ears=cover_ears)
            r_off = 0.010 + flare_out * math.sin(tv * math.pi * 0.75)
            p = np.array([0.0, -0.035, z]) + d_horiz * (r_skin + r_off)
            ctrl_pts.append(p)
            # Taper at root and tip
            r_loc = radius * (0.55 + 0.55 * math.sin(tv * math.pi) ** 0.65)
            if ip == n_pts - 1:
                r_loc = radius * 0.22
            radii.append(r_loc)

        parts.append(
            sculpt_lock_tube(
                f'{name_prefix}_curl{idx}', paint,
                ctrl_pts, radii, flatten=0.88,
                curl_amp=curl_amp, curl_turns=curl_turns,
                phase=(idx % 3) * 2.1, rib_amp=0.10, rib_freq=5.0,
                rows=22, n_ring=10,
            )
        )
    return parts


def sculpt_curtain_tendrils(
    name_prefix, paint,
    z_root=1.745,
    z_tip=1.595,
    x_root=0.008,
    x_mid=0.056,
    x_tip=0.064,
    y_root=-0.125,
    y_mid=-0.132,
    y_tip=-0.095,
    radius=0.014,
    wave_amp=0.004,
    sym=True,
):
    """Build 3D face-framing front curtain locks or temple tendrils on left and right sides."""
    parts = []
    sides = [(-1.0, 'R'), (1.0, 'L')] if sym else [(1.0, 'L')]
    th_root_deg = max(12.0, min(28.0, math.degrees(math.atan2(abs(x_root), 0.105))))
    th_mid_deg = max(48.0, min(62.0, math.degrees(math.atan2(abs(x_mid), 0.048))))
    th_tip_deg = max(56.0, min(70.0, math.degrees(math.atan2(abs(x_tip), 0.042))))
    for sgn, tag in sides:
        n_pts = 6
        ctrl = []
        rads = []
        for k in range(n_pts):
            t = k / (n_pts - 1)
            z = z_root - (z_root - z_tip) * (t ** 0.92)
            if t < 0.45:
                st = t / 0.45
                s = st * st * (3.0 - 2.0 * st)
                th_deg = th_root_deg * (1.0 - s) + th_mid_deg * s
            else:
                st = (t - 0.45) / 0.55
                th_deg = th_mid_deg * (1.0 - st) + th_tip_deg * st
            th = sgn * math.radians(th_deg)
            d_horiz = np.array([math.sin(th), -math.cos(th), 0.0])
            if z > 1.690:
                r_c = cyl_r(z, th, cover_ears=False)
                p_cyl = np.array([0.0, -0.035, z]) + d_horiz * r_c
                vec = p_cyl - C_SKULL
                d_sph = vec / max(np.linalg.norm(vec), 1e-5)
                phi_s = math.acos(np.clip(d_sph[2], -1.0, 1.0))
                th_s = math.atan2(d_sph[0], -d_sph[1])
                r_sph = skull_r(phi_s, th_s, cover_ears=False)
                p_skin = C_SKULL + d_sph * (r_sph + 0.009)
            else:
                r_c = cyl_r(z, th, cover_ears=False)
                flare = 0.010 + wave_amp * math.sin(t * math.pi)
                p_skin = np.array([0.0, -0.035, z]) + d_horiz * (r_c + flare)
            ctrl.append(p_skin.tolist())
            r_loc = radius * (0.60 + 0.50 * math.sin(t * math.pi) ** 0.7)
            if k == n_pts - 1:
                r_loc = radius * 0.25
            rads.append(r_loc)
        parts.append(
            sculpt_lock_tube(
                f'{name_prefix}_{tag}', paint, ctrl, rads,
                flatten=0.58, rib_amp=0.12, rib_freq=5.0, rows=18, n_ring=10,
            )
        )
    return parts


def sculpt_bun(
    name, paint,
    center=(0.0, 0.062, 1.615),
    axis=(0.0, 0.92, -0.38),
    radius_xy=0.036,
    height=0.034,
    cylindrical=False,      # True = vertical scholar/Daoist cylinder topknot (s5_01, s5_04)
    messy_amp=0.003,
    with_cuff=False,
    cuff_paint=None,
    with_hairpin=False,
    pin_paint=None,
):
    """Build a 3D coiled bun, chignon, or cylindrical scholar topknot with optional tie cuff & hairpin."""
    c = np.asarray(center, dtype=np.float64)
    ax = np.asarray(axis, dtype=np.float64)
    ax /= max(np.linalg.norm(ax), 1e-6)

    # Orthonormal basis (u_vec, v_vec, ax)
    ref = np.array([1.0, 0.0, 0.0]) if abs(ax[0]) < 0.85 else np.array([0.0, 1.0, 0.0])
    u_vec = np.cross(ax, ref)
    u_vec /= np.linalg.norm(u_vec)
    v_vec = np.cross(ax, u_vec)

    rows, cols = 14, 24
    vs = np.linspace(0.0, 1.0, rows)
    phis = np.linspace(0.0, 2.0 * math.pi, cols, endpoint=False)
    G = np.zeros((rows, cols, 3))

    for i, v in enumerate(vs):
        if cylindrical:
            # Cylindrical scholar topknot with rounded dome cap
            h = (v - 0.10) * height
            if v < 0.15:
                r = radius_xy * (0.72 + 0.28 * (v / 0.15))
            elif v < 0.78:
                r = radius_xy * (1.0 + 0.08 * math.sin(((v - 0.15) / 0.63) * math.pi * 2.0))
            else:
                tv = (v - 0.78) / 0.22
                r = max(0.002, radius_xy * math.cos(tv * math.pi * 0.5))
        else:
            # Spheroidal / coiled chignon bun
            ang_v = (v - 0.08) * (math.pi * 0.88)
            h = height * 0.55 * (1.0 - math.cos(ang_v)) - height * 0.15
            r = max(0.002, radius_xy * math.sin(max(0.04, min(v * math.pi * 0.96, math.pi - 0.04))) ** 0.78)

        for j, phi in enumerate(phis):
            coil = messy_amp * math.sin(v * math.pi * 5.0 + phi * 2.0) * math.sin(v * math.pi)
            rj = r + coil
            G[i, j] = c + ax * h + (u_vec * math.cos(phi) + v_vec * math.sin(phi)) * rj

    parts = [_make_part(name, G, paint, wrap_u=True, wrap_v=False, Rigid='Head', use_trunk=False)]

    if with_cuff:
        cp = cuff_paint if cuff_paint is not None else paint
        G_cuff = np.zeros((6, 18, 3))
        phis_c = np.linspace(0.0, 2.0 * math.pi, 18, endpoint=False)
        for i, tv in enumerate(np.linspace(0.0, 1.0, 6)):
            hc = (tv - 0.3) * 0.014
            rc = radius_xy * (0.86 + 0.08 * math.sin(tv * math.pi))
            for j, phi in enumerate(phis_c):
                G_cuff[i, j] = c + ax * hc + (u_vec * math.cos(phi) + v_vec * math.sin(phi)) * rc
        parts.append(_make_part(name + '_cuff', G_cuff, cp, wrap_u=True, wrap_v=False, Rigid='Head', use_trunk=False))

    if with_hairpin:
        pp = pin_paint if pin_paint is not None else P_pin()
        # Horizontal wooden/jade hairpin (zan) piercing through the middle of the topknot along u_vec (X axis)
        pin_c = c + ax * (height * 0.42)
        G_pin = np.zeros((10, 10, 3))
        phis_p = np.linspace(0.0, 2.0 * math.pi, 10, endpoint=False)
        xs_p = np.linspace(-0.068, 0.072, 10)
        for i, xp in enumerate(xs_p):
            t_p = (i / 9.0)
            # Tapered tip on left (-X), decorative finial knob on right (+X)
            rp = 0.0022 + 0.0025 * t_p
            if i == 0:
                rp = 0.0008
            elif i == 8:
                rp = 0.0068
            elif i == 9:
                rp = 0.0020
            for j, phi in enumerate(phis_p):
                G_pin[i, j] = pin_c + u_vec * xp + (v_vec * math.cos(phi) + ax * math.sin(phi)) * rp
        parts.append(_make_part(name + '_pin', G_pin, pp, wrap_u=True, wrap_v=False, Rigid='Head', use_trunk=False))

    return parts


def sculpt_headband_fillet(name, paint, z_front=1.724, z_back=1.678, width=0.011, thick=0.005):
    """Build a 3D headband / classical fillet around the cranium (for s1_05_fillet_ringlets)."""
    rows, cols = 8, 48
    ths = np.linspace(-math.pi, math.pi, cols, endpoint=False)
    vs = np.linspace(0.0, 1.0, rows)
    G = np.zeros((rows, cols, 3))

    for j, th in enumerate(ths):
        # Tilt smoothly from forehead (z_front) to occiput (z_back)
        w_back = 0.5 * (1.0 + math.cos(th - math.pi))
        z_c = z_front * (1.0 - w_back) + z_back * w_back
        d_horiz = np.array([math.sin(th), -math.cos(th), 0.0])
        r_skin = cyl_r(z_c, th, cover_ears=False) + 0.010

        for i, v in enumerate(vs):
            # Rounded cross-section around the band
            ang = v * 2.0 * math.pi
            dz = 0.5 * width * math.sin(ang)
            dr = 0.5 * thick * (1.0 - math.cos(ang))
            G[i, j] = np.array([0.0, -0.035, z_c + dz]) + d_horiz * (r_skin + dr)

    return _make_part(name, G, paint, wrap_u=True, wrap_v=True, Rigid='Head', use_trunk=False)


def sculpt_crown_braid(
    name, paint,
    th_start_deg=25.0,
    th_end_deg=176.0,
    z_start=1.742,
    z_mid=1.705,
    z_end=1.655,
    radius=0.015,
    side='both',            # 'both', 'L', 'R'
):
    """Build 3D braided coronet / halo / temple-to-occiput braid bands hugging the cranium."""
    parts = []
    sides = [(-1.0, 'R'), (1.0, 'L')] if side == 'both' else ([(1.0, 'L')] if side == 'L' else [(-1.0, 'R')])
    for sgn, tag in sides:
        n_pts = 8
        ctrl, rads = [], []
        for k in range(n_pts):
            t = k / (n_pts - 1)
            th = sgn * math.radians(th_start_deg * (1.0 - t) + th_end_deg * t)
            z = (1.0 - t) ** 2 * z_start + 2.0 * (1.0 - t) * t * z_mid + (t ** 2) * z_end
            d_horiz = np.array([math.sin(th), -math.cos(th), 0.0])
            r_skin = cyl_r(z, th, cover_ears=True) + 0.014
            ctrl.append(np.array([0.0, -0.035, z]) + d_horiz * r_skin)
            rads.append(radius * (0.75 + 0.30 * math.sin(t * math.pi)))
        parts.append(
            sculpt_lock_tube(
                f'{name}_{tag}', paint, ctrl, rads,
                flatten=0.72, braid_plait=True, rows=20, n_ring=10,
            )
        )
    return parts


def sculpt_hanging_braid(
    name, paint,
    mode='back_center',     # 'back_center', 'twin_back', 'twin_shoulder', 'left_shoulder', 'right_shoulder', 'temple_thin'
    z_top=1.640,
    z_bot=1.410,
    radius=0.018,
    with_cuff=False,
    cuff_paint=None,
):
    """Build 3D woven hanging braids (back queue, twin plaits, over-shoulder braid, or thin temple braids)."""
    parts = []
    if mode == 'back_center':
        configs = [(0.0, 'C', False)]
    elif mode == 'twin_back':
        configs = [(-1.0, 'R', False), (1.0, 'L', False)]
    elif mode == 'twin_shoulder':
        configs = [(-1.0, 'R', True), (1.0, 'L', True)]
    elif mode == 'left_shoulder':
        configs = [(1.0, 'L', True)]
    elif mode == 'right_shoulder':
        configs = [(-1.0, 'R', True)]
    else:  # 'temple_thin'
        configs = [(-1.0, 'R', True), (1.0, 'L', True)]

    for sgn, tag, over_front in configs:
        n_pts = 7
        ctrl, rads = [], []
        for k in range(n_pts):
            t = k / (n_pts - 1)
            z = z_top - (z_top - z_bot) * t
            if mode == 'temple_thin':
                th = sgn * math.radians(66.0 - 8.0 * t)
                r_skin = cyl_r(z, th, cover_ears=True) + 0.016
            elif over_front:
                # Curve from behind ear (th ~ 125°) forward over the shoulder/clavicle (th ~ 46°)
                th = sgn * math.radians(125.0 * (1.0 - t ** 0.85) + 46.0 * (t ** 0.85))
                r_skin = cyl_r(z, th, cover_ears=True) + 0.018
            elif sgn == 0.0:
                th = math.pi
                r_skin = cyl_r(z, th, cover_ears=False) + 0.016
            else:
                th = sgn * math.radians(152.0 + 10.0 * t)
                r_skin = cyl_r(z, th, cover_ears=False) + 0.016

            d_horiz = np.array([math.sin(th), -math.cos(th), 0.0])
            ctrl.append(np.array([0.0, -0.035, z]) + d_horiz * r_skin)
            r_loc = radius * (0.85 + 0.25 * math.sin(t * math.pi * 0.8))
            if k == n_pts - 1:
                r_loc = radius * 0.28
            elif k == n_pts - 2:
                r_loc = radius * 0.65
            rads.append(r_loc)

        parts.append(
            sculpt_lock_tube(
                f'{name}_{tag}', paint, ctrl, rads,
                flatten=0.78, braid_plait=True, rows=22, n_ring=10,
            )
        )
        if with_cuff and len(ctrl) >= 2:
            cp = cuff_paint if cuff_paint is not None else P_gold()
            c_pt = 0.25 * ctrl[-2] + 0.75 * ctrl[-1]
            parts.extend(
                sculpt_bun(
                    f'{name}_{tag}_cuff', cp,
                    center=c_pt, axis=(0.0, 0.0, -1.0),
                    radius_xy=radius * 0.85, height=0.012, cylindrical=True, messy_amp=0.0,
                )
            )
    return parts


def sculpt_ear_coils(
    name, paint,
    z_center=1.655,
    y_center=-0.042,
    x_offset=0.088,
    radius_ring=0.034,
    tube_r=0.014,
    open_loop=False,        # True = hanging braided U-loop (f2_02), False = full coiled wheel bun (f2_04, f3_02)
):
    """Build twin Renaissance / courtly coiled ear buns or hanging braided ear loops."""
    parts = []
    for sgn, tag in [(-1.0, 'R'), (1.0, 'L')]:
        n_pts = 12
        ctrl, rads = [], []
        for k in range(n_pts):
            t = k / (n_pts - 1)
            if open_loop:
                # U-shaped loop from temple (front-top of ear) dipping below earlobe and up behind ear
                ang = math.radians(-20.0 + 220.0 * t)
                dy = -radius_ring * 0.85 * math.cos(ang)
                dz = -radius_ring * 1.15 * math.sin(ang)
                dx = sgn * (x_offset + 0.008 * math.sin(t * math.pi))
            else:
                # Spiral 1.35 turns over the ear
                ang = t * 2.0 * math.pi * 1.35
                rr = radius_ring * (1.0 - 0.45 * t)
                dy = rr * math.cos(ang)
                dz = rr * math.sin(ang)
                dx = sgn * (x_offset + 0.010 * t)
            ctrl.append([dx, y_center + dy, z_center + dz])
            rads.append(tube_r * (0.75 + 0.25 * math.sin(t * math.pi)))
        parts.append(
            sculpt_lock_tube(
                f'{name}_{tag}', paint, ctrl, rads,
                flatten=0.75, braid_plait=True, rows=20, n_ring=10,
            )
        )
    return parts


def sculpt_spike_cluster(
    name_prefix, paint,
    spikes_spec,            # list of (root_xyz, mid_xyz, tip_xyz, base_r)
    flatten=0.55,
):
    """Build a cluster of 3D sculpted tapered hair spikes along quadratic/cubic arcs."""
    parts = []
    for idx, (p0, p1, p2, r0) in enumerate(spikes_spec):
        p0, p1, p2 = np.asarray(p0, float), np.asarray(p1, float), np.asarray(p2, float)
        ctrl = [
            p0,
            0.56 * p0 + 0.38 * p1 + 0.06 * p2,
            0.12 * p0 + 0.56 * p1 + 0.32 * p2,
            p2,
        ]
        rads = [r0 * 0.85, r0 * 1.05, r0 * 0.62, r0 * 0.08]
        parts.append(
            sculpt_lock_tube(
                f'{name_prefix}_sp{idx}', paint, ctrl, rads,
                flatten=flatten, rib_amp=0.14, rib_freq=4.0, rows=14, n_ring=8,
            )
        )
    return parts


# ---------------------------------------------------------------------------------------------------------------
# 150 Hairstyle Specifications (50 Male + 50 Female + 20 Chichani + 20 Spiky/Punk + 10 Barbarian)
# Each spec returns (gid, label, gender, parts)
# ---------------------------------------------------------------------------------------------------------------
def build_male_50_specs():
    specs = []
    p_str = P_hair('hair_strands')
    p_wav = P_hair('hair_waves')
    p_crl = P_hair('hair_curls')
    p_brd = P_hair('hair_braid')
    p_stb = P_hair('hair_strands', base='hair_stubble', light='hair_light', dark='hair_base')
    p_gld = P_gold()
    p_pin = P_pin()

    # ===========================================================================================================
    # SHEET M1: Classical / Hellenistic / Long Curled, Wavy & Half-Up Hairstyles (10 styles)
    # ===========================================================================================================
    def m1_01():
        gid = 'hair_s1_01_curled_shoulder'
        parts = [sculpt_flowing_mane(gid + '_base', p_crl, z_bot=1.485, theta_brow_deg=48, theta_cheek_deg=56,
                                     thick_crown=0.018, thick_mid=0.022, bell_flare=0.012, wave_amp=0.005, wave_freq=6.0)]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.720, z_bot=1.480, theta_start_deg=52, n_locks=13,
                                          radius=0.015, curl_amp=0.007, curl_turns=3.5, flare_out=0.016))
        return gid, 'Classical Shoulder Ringlet Curls', 'male', parts
    specs.append(m1_01)

    def m1_02():
        gid = 'hair_s1_02_long_corkscrew'
        parts = [sculpt_flowing_mane(gid + '_base', p_crl, z_bot=1.400, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.019, thick_mid=0.024, bell_flare=0.016, wave_amp=0.006, wave_freq=7.5)]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.720, z_bot=1.395, theta_start_deg=50, n_locks=15,
                                          radius=0.016, curl_amp=0.008, curl_turns=4.5, flare_out=0.020))
        return gid, 'Cascading Long Corkscrew Curls', 'male', parts
    specs.append(m1_02)

    def m1_03():
        gid = 'hair_s1_03_sleek_shoulder_page'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.008, thick_crown=0.016, wave_amp=0.0008),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.485, theta_brow_deg=56, theta_cheek_deg=68,
                                tuck_behind_ears=True, thick_crown=0.015, thick_mid=0.018, bell_flare=0.008,
                                pageboy_roll=0.010, wave_amp=0.001, lobe_amp=0.0015),
        ]
        return gid, 'Sleek Tucked Shoulder Pageboy', 'male', parts
    specs.append(m1_03)

    def m1_04():
        gid = 'hair_s1_04_wavy_low_bun'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=64, phi_temple_deg=92, phi_ear_deg=98,
                              phi_nape_deg=136, part_x=0.0, part_depth=0.009, thick_crown=0.018, wave_amp=0.003, cover_ears=True),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.745, z_tip=1.575, x_mid=0.062, x_tip=0.068, radius=0.015))
        parts.extend(sculpt_bun(gid + '_bun', p_wav, center=(0.0, 0.062, 1.608), axis=(0.0, 0.92, -0.38),
                                radius_xy=0.036, height=0.034, messy_amp=0.005))
        return gid, 'Wavy Curtain Locks & Low Nape Bun', 'male', parts
    specs.append(m1_04)

    def m1_05():
        gid = 'hair_s1_05_fillet_ringlets'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=86, phi_ear_deg=96,
                              part_x=0.0, part_depth=0.007, thick_crown=0.015),
            sculpt_headband_fillet(gid + '_fillet', p_gld, z_front=1.720, z_back=1.678, width=0.010, thick=0.005),
            sculpt_flowing_mane(gid + '_base', p_crl, z_top=1.705, z_bot=1.485, theta_top_deg=48, theta_brow_deg=52,
                                thick_crown=0.014, thick_mid=0.024, bell_flare=0.016, wave_amp=0.005),
        ]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.695, z_bot=1.480, theta_start_deg=52, n_locks=13,
                                          radius=0.016, curl_amp=0.008, curl_turns=3.5, flare_out=0.018))
        return gid, 'Golden Fillet & Classical Ringlets', 'male', parts
    specs.append(m1_05)

    def m1_06():
        gid = 'hair_s1_06_long_flowing_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.400, theta_brow_deg=50, theta_cheek_deg=58,
                                thick_crown=0.018, thick_mid=0.023, bell_flare=0.018, wave_amp=0.006, wave_freq=5.5,
                                lobe_count=16, lobe_amp=0.004),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.520, x_mid=0.064, x_tip=0.078, radius=0.015))
        return gid, 'Long Flowing Center-Parted Waves', 'male', parts
    specs.append(m1_06)

    def m1_07():
        gid = 'hair_s1_07_half_up_crown_bun'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.006, thick_crown=0.016),
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.415, theta_brow_deg=58, theta_cheek_deg=66,
                                tuck_behind_ears=True, thick_crown=0.015, thick_mid=0.021, bell_flare=0.014, wave_amp=0.005),
        ]
        parts.extend(sculpt_bun(gid + '_bun', p_wav, center=(0.0, 0.056, 1.722), axis=(0.0, 0.88, 0.46),
                                radius_xy=0.028, height=0.028, messy_amp=0.004))
        return gid, 'Half-Up Crown Knot & Flowing Waves', 'male', parts
    specs.append(m1_07)

    def m1_08():
        gid = 'hair_s1_08_half_up_crown_braids'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.006, thick_crown=0.016),
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.415, theta_brow_deg=56, theta_cheek_deg=64,
                                tuck_behind_ears=True, thick_crown=0.015, thick_mid=0.021, bell_flare=0.014, wave_amp=0.005),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=32, th_end_deg=176,
                                        z_start=1.740, z_mid=1.712, z_end=1.688, radius=0.014))
        return gid, 'Twin Temple Crown Braids & Long Waves', 'male', parts
    specs.append(m1_08)

    def m1_09():
        gid = 'hair_s1_09_layered_shag_mullet'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=56, phi_temple_deg=84, phi_ear_deg=88,
                              widow_peak_deg=5.0, thick_crown=0.022, thick_front=0.018, wave_amp=0.004),
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.520, theta_top_deg=32, theta_brow_deg=56, theta_cheek_deg=68,
                                tuck_behind_ears=True, thick_crown=0.018, thick_mid=0.022, bell_flare=0.014,
                                wave_amp=0.005, lobe_count=18, lobe_amp=0.0045),
        ]
        return gid, 'Swept-Back Layered Wavy Shag', 'male', parts
    specs.append(m1_09)

    def m1_10():
        gid = 'hair_s1_10_temple_braid_locks'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.405, theta_brow_deg=52, theta_cheek_deg=60,
                                thick_crown=0.017, thick_mid=0.021, bell_flare=0.015, wave_amp=0.005),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.710, z_bot=1.410, radius=0.012))
        parts.extend(sculpt_hanging_braid(gid + '_bbrd', p_brd, mode='twin_back', z_top=1.710, z_bot=1.410, radius=0.012))
        return gid, 'Long Wavy Mane with Temple Braids', 'male', parts
    specs.append(m1_10)

    # ===========================================================================================================
    # SHEET M2: Tousled, Viking, Shaved-Side & Forelock / Mohawk Hairstyles (10 styles)
    # ===========================================================================================================
    def m2_01():
        gid = 'hair_s2_01_shoulder_curtain_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.485, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.019, thick_mid=0.024, bell_flare=0.014, wave_amp=0.005, wave_freq=5.0),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.555, x_mid=0.062, x_tip=0.070, radius=0.016))
        return gid, 'Shoulder-Length Tousled Curtain Waves', 'male', parts
    specs.append(m2_01)

    def m2_02():
        gid = 'hair_s2_02_short_wavy_sidepart'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=64, phi_temple_deg=86, phi_sideburn_deg=110,
                              phi_ear_deg=88, phi_nape_deg=136, part_x=0.026, part_depth=0.008,
                              thick_crown=0.020, thick_front=0.018, wave_amp=0.0035, cover_ears=False),
            sculpt_lock_tube(gid + '_forelock', p_wav,
                             [[0.022, -0.125, 1.748], [-0.015, -0.148, 1.738], [-0.046, -0.145, 1.715], [-0.062, -0.122, 1.692]],
                             [0.013, 0.018, 0.016, 0.006], flatten=0.62, rib_amp=0.12),
        ]
        return gid, 'Short Wavy Side-Parted Crop', 'male', parts
    specs.append(m2_02)

    def m2_03():
        gid = 'hair_s2_03_swept_back_medium'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=58, phi_temple_deg=84, phi_sideburn_deg=110,
                              phi_ear_deg=88, phi_nape_deg=138, widow_peak_deg=5.0,
                              thick_crown=0.022, thick_front=0.019, thick_nape=0.022, wave_amp=0.004, cover_ears=False),
            sculpt_flowing_mane(gid + '_nape', p_wav, z_top=1.700, z_bot=1.545, theta_top_deg=82, theta_brow_deg=88,
                                theta_cheek_deg=92, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.020,
                                bell_flare=0.008, wave_amp=0.004),
        ]
        return gid, 'Swept-Back Medium Wavy Mane', 'male', parts
    specs.append(m2_03)

    def m2_04():
        gid = 'hair_s2_04_tousled_curls_medium'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_crl, phi_front_deg=66, phi_temple_deg=96, phi_ear_deg=108,
                              phi_nape_deg=138, part_x=0.0, part_depth=0.009, thick_crown=0.022, wave_amp=0.005, cover_ears=True),
        ]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.720, z_bot=1.535, theta_start_deg=48, n_locks=13,
                                          radius=0.016, curl_amp=0.007, curl_turns=2.6, flare_out=0.016))
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_crl, z_root=1.745, z_tip=1.615, x_mid=0.058, x_tip=0.068, radius=0.016))
        return gid, 'Medium Tousled Curly Bob', 'male', parts
    specs.append(m2_04)

    def m2_05():
        gid = 'hair_s2_05_low_nape_ponytail'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=86, phi_ear_deg=88,
                              phi_nape_deg=134, part_x=0.0, part_depth=0.007, thick_crown=0.016, cover_ears=False),
            sculpt_lock_tube(gid + '_tail', p_wav,
                             [[0.0, 0.052, 1.612], [0.0, 0.068, 1.580], [0.0, 0.072, 1.535], [0.0, 0.065, 1.485]],
                             [0.018, 0.024, 0.022, 0.008], flatten=0.82, rib_amp=0.14, rib_freq=6.0),
        ]
        parts.extend(sculpt_bun(gid + '_tie', p_brd, center=(0.0, 0.054, 1.612), axis=(0.0, 0.85, -0.52),
                                radius_xy=0.019, height=0.014, cylindrical=True, messy_amp=0.0))
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.745, z_tip=1.565, x_mid=0.060, x_tip=0.065, radius=0.013))
        return gid, 'Low Tied Ponytail with Curtain Locks', 'male', parts
    specs.append(m2_05)

    def m2_06():
        gid = 'hair_s2_06_shaved_swept_crest'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
            sculpt_lock_tube(gid + '_crest1', p_str,
                             [[0.0, 0.035, 1.665], [0.0, 0.010, 1.745], [0.008, -0.055, 1.795], [0.032, -0.125, 1.775], [0.068, -0.142, 1.735]],
                             [0.012, 0.024, 0.028, 0.024, 0.007], flatten=0.68, rib_amp=0.14),
            sculpt_lock_tube(gid + '_crest2', p_str,
                             [[-0.012, -0.020, 1.775], [0.015, -0.085, 1.802], [0.048, -0.135, 1.762], [0.078, -0.138, 1.722]],
                             [0.018, 0.024, 0.018, 0.005], flatten=0.65, rib_amp=0.14),
        ]
        return gid, 'Shaved Sides with Swept Crest', 'male', parts
    specs.append(m2_06)

    def m2_07():
        gid = 'hair_s2_07_oselepets_forelock'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.0025, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
            sculpt_lock_tube(gid + '_chub', p_str,
                             [[0.0, 0.042, 1.640], [0.008, 0.025, 1.715], [-0.005, -0.035, 1.792],
                              [0.018, -0.115, 1.782], [0.055, -0.152, 1.730], [0.072, -0.145, 1.660], [0.078, -0.125, 1.595]],
                             [0.006, 0.014, 0.022, 0.024, 0.018, 0.012, 0.003], flatten=0.68, rib_amp=0.12),
        ]
        return gid, 'Shaved Scalp with Cossack Oselepets Forelock', 'male', parts
    specs.append(m2_07)

    def m2_08():
        gid = 'hair_s2_08_undercut_side_sweep'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
        ]
        for idx, y0 in enumerate([-0.115, -0.075, -0.035, 0.005, 0.035]):
            z0 = 1.745 + 0.038 * math.cos((y0 + 0.045) * 14.0)
            parts.append(
                sculpt_lock_tube(
                    f'{gid}_sw{idx}', p_str,
                    [[-0.028, y0, z0], [0.025, y0 - 0.010, z0 + 0.016], [0.072, y0 + 0.005, 1.715],
                     [0.088, y0 + 0.020, 1.635], [0.082, y0 + 0.030, 1.555]],
                    [0.014, 0.022, 0.022, 0.018, 0.006], flatten=0.55, rib_amp=0.10,
                )
            )
        return gid, 'High Undercut with Long Side Sweep', 'male', parts
    specs.append(m2_08)

    def m2_09():
        gid = 'hair_s2_09_shaved_side_braid'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.0025, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
            # Central crown braid down the back
            sculpt_lock_tube(gid + '_back_braid', p_brd,
                             [[0.0, -0.085, 1.775], [0.0, -0.015, 1.792], [0.0, 0.048, 1.735],
                              [0.0, 0.062, 1.655], [0.0, 0.052, 1.575], [0.0, 0.055, 1.515]],
                             [0.018, 0.022, 0.020, 0.017, 0.014, 0.006], flatten=0.75, braid_plait=True),
            # Temple braid hanging down in front of the left ear
            sculpt_lock_tube(gid + '_side_braid', p_brd,
                             [[0.0, -0.105, 1.768], [0.042, -0.115, 1.755], [0.072, -0.095, 1.700],
                              [0.078, -0.088, 1.620], [0.075, -0.082, 1.540], [0.072, -0.078, 1.480]],
                             [0.016, 0.019, 0.017, 0.015, 0.013, 0.005], flatten=0.78, braid_plait=True),
        ]
        return gid, 'Shaved Scalp with Viking Crown & Temple Braid', 'male', parts
    specs.append(m2_09)

    def m2_10():
        gid = 'hair_s2_10_short_mohawk_crest'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.0025, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
        ]
        # Upright V-fanned mohawk crest from forehead to occiput
        for idx, (y0, z0, h_c) in enumerate([
            (-0.125, 1.742, 0.044), (-0.090, 1.768, 0.048), (-0.050, 1.782, 0.048),
            (-0.010, 1.780, 0.044), (0.025, 1.760, 0.038), (0.048, 1.720, 0.030),
        ]):
            parts.append(
                sculpt_lock_tube(
                    f'{gid}_mhk{idx}', p_str,
                    [[0.0, y0, z0], [0.0, y0 - 0.006, z0 + h_c * 0.55], [0.0, y0 - 0.012, z0 + h_c]],
                    [0.020, 0.024, 0.008], flatten=0.65, rib_amp=0.16,
                )
            )
        return gid, 'Shaved Sides with Short Mohawk Crest', 'male', parts
    specs.append(m2_10)

    # ===========================================================================================================
    # SHEET M3: Levantine / Mediterranean Wavy, Half-Tied, Topknot & Braided Hairstyles (10 styles)
    # ===========================================================================================================
    def m3_01():
        gid = 'hair_s3_01_short_wavy_crop'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=85, phi_sideburn_deg=110,
                              phi_ear_deg=88, phi_nape_deg=136, part_x=-0.022, part_depth=0.007,
                              thick_crown=0.020, thick_front=0.018, wave_amp=0.0035, cover_ears=False),
        ]
        return gid, 'Short Wavy Mediterranean Crop', 'male', parts
    specs.append(m3_01)

    def m3_02():
        gid = 'hair_s3_02_thick_curled_crop'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_crl, phi_front_deg=60, phi_temple_deg=88, phi_sideburn_deg=112,
                              phi_ear_deg=96, phi_nape_deg=138, thick_crown=0.024, thick_side=0.020, thick_nape=0.022,
                              wave_amp=0.005, wave_freq=7.0, lobe_count=20, lobe_amp=0.003, cover_ears=False),
        ]
        return gid, 'Thick Medium-Short Curled Crop', 'male', parts
    specs.append(m3_02)

    def m3_03():
        gid = 'hair_s3_03_shoulder_bell_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.480, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.019, thick_mid=0.025, thick_bot=0.024, bell_flare=0.024,
                                pageboy_roll=0.008, wave_amp=0.006, wave_freq=5.5, lobe_count=16, lobe_amp=0.004),
        ]
        return gid, 'Shoulder-Length Bell-Flared Waves', 'male', parts
    specs.append(m3_03)

    def m3_04():
        gid = 'hair_s3_04_curtain_low_tail'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=88, phi_ear_deg=92,
                              phi_nape_deg=135, part_x=0.0, part_depth=0.008, thick_crown=0.017),
            sculpt_lock_tube(gid + '_tail', p_wav,
                             [[0.0, 0.052, 1.605], [0.0, 0.068, 1.575], [0.0, 0.070, 1.525]],
                             [0.018, 0.024, 0.010], flatten=0.80, rib_amp=0.15),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.745, z_tip=1.570, x_mid=0.062, x_tip=0.068, radius=0.015))
        return gid, 'Center-Parted Curtains & Low Tied Tail', 'male', parts
    specs.append(m3_04)

    def m3_05():
        gid = 'hair_s3_05_half_tied_curls'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=56, phi_temple_deg=84, phi_ear_deg=88,
                              widow_peak_deg=4.0, thick_crown=0.018),
            sculpt_flowing_mane(gid + '_mane', p_crl, z_bot=1.485, theta_top_deg=45, theta_brow_deg=56,
                                theta_cheek_deg=64, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.024,
                                bell_flare=0.016, wave_amp=0.006, wave_freq=6.5),
        ]
        parts.extend(sculpt_bun(gid + '_tie', p_gld, center=(0.0, 0.065, 1.668), axis=(0.0, 0.96, 0.25),
                                radius_xy=0.022, height=0.012, cylindrical=True, messy_amp=0.0))
        return gid, 'Half-Tied Shoulder Curls with Cord Band', 'male', parts
    specs.append(m3_05)

    def m3_06():
        gid = 'hair_s3_06_ear_length_curtains'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.555, theta_brow_deg=48, theta_cheek_deg=58,
                                thick_crown=0.018, thick_mid=0.023, bell_flare=0.010, pageboy_roll=0.006,
                                wave_amp=0.005, wave_freq=4.5),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.605, x_mid=0.060, x_tip=0.068, radius=0.016))
        return gid, 'Jaw-Length Wavy Curtain Bob', 'male', parts
    specs.append(m3_06)

    def m3_07():
        gid = 'hair_s3_07_heavy_layered_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.475, theta_brow_deg=46, theta_cheek_deg=54,
                                thick_crown=0.020, thick_mid=0.026, thick_bot=0.024, bell_flare=0.020,
                                wave_amp=0.007, wave_freq=6.0, lobe_count=18, lobe_amp=0.0045),
        ]
        return gid, 'Dense Layered Shoulder Waves', 'male', parts
    specs.append(m3_07)

    def m3_08():
        gid = 'hair_s3_08_high_topknot_half_down'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=56, phi_temple_deg=82, phi_ear_deg=86,
                              widow_peak_deg=4.0, thick_crown=0.016),
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.420, theta_top_deg=52, theta_brow_deg=60,
                                theta_cheek_deg=68, tuck_behind_ears=True, thick_crown=0.015, thick_mid=0.022,
                                bell_flare=0.016, wave_amp=0.005),
        ]
        parts.extend(sculpt_bun(gid + '_topknot', p_wav, center=(0.0, 0.005, 1.796), axis=(0.0, 0.35, 0.93),
                                radius_xy=0.030, height=0.032, messy_amp=0.004))
        return gid, 'High Crown Topknot & Flowing Wavy Mane', 'male', parts
    specs.append(m3_08)

    def m3_09():
        gid = 'hair_s3_09_sleek_low_chignon'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=86, phi_ear_deg=88,
                              phi_nape_deg=136, part_x=0.0, part_depth=0.007, thick_crown=0.016, cover_ears=False),
        ]
        parts.extend(sculpt_bun(gid + '_chignon', p_str, center=(0.0, 0.064, 1.612), axis=(0.0, 0.94, -0.34),
                                radius_xy=0.040, height=0.036, messy_amp=0.003))
        return gid, 'Sleek Pulled-Back Low Chignon Bun', 'male', parts
    specs.append(m3_09)

    def m3_10():
        gid = 'hair_s3_10_long_back_plait'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=86, phi_ear_deg=88,
                              phi_nape_deg=136, part_x=0.0, part_depth=0.007, thick_crown=0.016, cover_ears=False),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_plait', p_brd, mode='back_center', z_top=1.630, z_bot=1.405, radius=0.020))
        return gid, 'Pulled-Back Thick Rear Plait', 'male', parts
    specs.append(m3_10)

    # ===========================================================================================================
    # SHEET M4: Medieval & Renaissance Pageboy, Bowl Cut, Bob & Aureole Curls (10 styles)
    # ===========================================================================================================
    def m4_01():
        gid = 'hair_s4_01_feathered_caesar_crop'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=78, phi_temple_deg=86, phi_sideburn_deg=108,
                              phi_ear_deg=86, phi_nape_deg=134, widow_peak_deg=2.0,
                              thick_crown=0.018, thick_front=0.016, bangs_roll=0.006, lobe_count=22, lobe_amp=0.0025),
        ]
        return gid, 'Medieval Feathered Caesar Crop', 'male', parts
    specs.append(m4_01)

    def m4_02():
        gid = 'hair_s4_02_pageboy_bowl_bob'
        parts = [
            sculpt_scalp_dome(gid + '_bangs', p_str, phi_front_deg=84, phi_temple_deg=92, phi_ear_deg=105,
                              phi_nape_deg=128, widow_peak_deg=0.0, thick_crown=0.018, thick_front=0.018,
                              bangs_roll=0.010, wave_amp=0.0005, cover_ears=True),
            sculpt_flowing_mane(gid + '_bob', p_str, z_bot=1.570, theta_top_deg=35, theta_brow_deg=48,
                                theta_cheek_deg=54, theta_bot_deg=58, cover_ears=True, thick_crown=0.017,
                                thick_mid=0.024, thick_bot=0.022, bell_flare=0.014, pageboy_roll=0.018,
                                wave_amp=0.0008, lobe_amp=0.0015),
        ]
        return gid, 'Classic Medieval Pageboy Bowl Bob', 'male', parts
    specs.append(m4_02)

    def m4_03():
        gid = 'hair_s4_03_parted_renaissance_lob'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.490, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.018, thick_mid=0.024, bell_flare=0.016, pageboy_roll=0.010,
                                wave_amp=0.004, wave_freq=4.5),
        ]
        return gid, 'Center-Parted Renaissance Wavy Lob', 'male', parts
    specs.append(m4_03)

    def m4_04():
        gid = 'hair_s4_04_short_parted_curls'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_crl, phi_front_deg=62, phi_temple_deg=88, phi_sideburn_deg=110,
                              phi_ear_deg=90, phi_nape_deg=138, part_x=0.0, part_depth=0.009,
                              thick_crown=0.022, thick_front=0.020, thick_nape=0.022, wave_amp=0.0045, cover_ears=False),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_crl, z_root=1.748, z_tip=1.640, x_mid=0.056, x_tip=0.066, radius=0.016))
        return gid, 'Short Parted Renaissance Curls', 'male', parts
    specs.append(m4_04)

    def m4_05():
        gid = 'hair_s4_05_aureole_angel_curls'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_crl, z_bot=1.540, theta_brow_deg=48, theta_cheek_deg=55,
                                thick_crown=0.018, thick_mid=0.026, thick_bot=0.026, bell_flare=0.024,
                                pageboy_roll=0.014, wave_amp=0.006, wave_freq=5.5),
        ]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.700, z_bot=1.540, theta_start_deg=50, n_locks=13,
                                          radius=0.016, curl_amp=0.008, curl_turns=2.4, flare_out=0.022))
        return gid, 'Cherubic Aureole Ringlet Bob', 'male', parts
    specs.append(m4_05)

    def m4_06():
        gid = 'hair_s4_06_sleek_chin_page'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.545, theta_brow_deg=46, theta_cheek_deg=52,
                                theta_bot_deg=56, cover_ears=True, thick_crown=0.017, thick_mid=0.022,
                                thick_bot=0.022, bell_flare=0.012, pageboy_roll=0.018, wave_amp=0.0008, lobe_amp=0.0012),
        ]
        return gid, 'Sleek Center-Parted Chin Pageboy', 'male', parts
    specs.append(m4_06)

    def m4_07():
        gid = 'hair_s4_07_high_bowl_crop'
        parts = [
            sculpt_scalp_dome(gid + '_bowl', p_wav, phi_front_deg=82, phi_temple_deg=92, phi_ear_deg=106,
                              phi_nape_deg=134, widow_peak_deg=0.0, thick_crown=0.020, thick_front=0.018,
                              thick_side=0.020, thick_nape=0.022, bangs_roll=0.010, wave_amp=0.003, cover_ears=True),
        ]
        return gid, 'Ear-Level Rolled Medieval Bowl Cut', 'male', parts
    specs.append(m4_07)

    def m4_08():
        gid = 'hair_s4_08_cascading_mullet_curls'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_crl, phi_front_deg=58, phi_temple_deg=86, phi_ear_deg=90,
                              part_x=0.0, part_depth=0.008, thick_crown=0.020, wave_amp=0.004),
            sculpt_flowing_mane(gid + '_mane', p_crl, z_bot=1.520, theta_top_deg=42, theta_brow_deg=58,
                                theta_cheek_deg=66, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.024,
                                bell_flare=0.014, wave_amp=0.006),
        ]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.695, z_bot=1.522, theta_start_deg=64, n_locks=11,
                                          radius=0.015, curl_amp=0.007, curl_turns=3.0, flare_out=0.014, cover_ears=False))
        return gid, 'Parted Swept Forehead & Cascading Nape Curls', 'male', parts
    specs.append(m4_08)

    def m4_09():
        gid = 'hair_s4_09_feathered_shoulder_mane'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.480, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.019, thick_mid=0.024, bell_flare=0.018, wave_amp=0.005, wave_freq=4.5),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_wings', p_wav, z_root=1.748, z_tip=1.550, x_mid=0.066, x_tip=0.082,
                                             y_mid=-0.125, y_tip=-0.075, radius=0.017, wave_amp=0.006))
        return gid, 'Feathered Shoulder Mane with Winged Curtains', 'male', parts
    specs.append(m4_09)

    def m4_10():
        gid = 'hair_s4_10_parted_nape_roll'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=90, phi_ear_deg=94,
                              phi_nape_deg=136, part_x=0.0, part_depth=0.008, thick_crown=0.018, wave_amp=0.0035),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.620, x_mid=0.058, x_tip=0.066, radius=0.015))
        parts.extend(sculpt_bun(gid + '_roll', p_wav, center=(0.0, 0.062, 1.608), axis=(0.0, 0.94, -0.34),
                                radius_xy=0.032, height=0.028, messy_amp=0.004))
        return gid, 'Center-Parted Wavy Low Nape Roll', 'male', parts
    specs.append(m4_10)

    # ===========================================================================================================
    # SHEET M5: East Asian / Steppe Topknots, Hairpin Crowns & Queue Braids (10 styles)
    # ===========================================================================================================
    def m5_01():
        gid = 'hair_s5_01_high_scholar_topknot'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_sideburn_deg=108,
                              phi_ear_deg=86, phi_nape_deg=134, widow_peak_deg=5.0, thick_crown=0.015, wave_amp=0.0005),
        ]
        parts.extend(sculpt_bun(gid + '_topknot', p_str, center=(0.0, -0.008, 1.792), axis=(0.0, 0.12, 0.99),
                                radius_xy=0.026, height=0.052, cylindrical=True, messy_amp=0.001, with_cuff=True, cuff_paint=p_str))
        return gid, 'Tall Cylindrical Scholar Topknot', 'male', parts
    specs.append(m5_01)

    def m5_02():
        gid = 'hair_s5_02_compact_martial_bun'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_sideburn_deg=108,
                              phi_ear_deg=86, phi_nape_deg=134, widow_peak_deg=5.0, thick_crown=0.015, wave_amp=0.0005),
        ]
        parts.extend(sculpt_bun(gid + '_bun', p_str, center=(0.0, 0.002, 1.792), axis=(0.0, 0.25, 0.97),
                                radius_xy=0.028, height=0.032, cylindrical=False, messy_amp=0.001, with_cuff=True, cuff_paint=p_str))
        return gid, 'Compact Rounded Martial Crown Bun', 'male', parts
    specs.append(m5_02)

    def m5_03():
        gid = 'hair_s5_03_asym_side_bun'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=86, phi_sideburn_deg=110,
                              phi_ear_deg=88, phi_nape_deg=135, widow_peak_deg=4.0, thick_crown=0.016, wave_amp=0.001),
        ]
        parts.extend(sculpt_bun(gid + '_sidebun', p_str, center=(0.068, 0.012, 1.732), axis=(0.78, 0.42, 0.46),
                                radius_xy=0.030, height=0.032, messy_amp=0.002))
        return gid, 'Asymmetric Side-Crown Coiled Bun', 'male', parts
    specs.append(m5_03)

    def m5_04():
        gid = 'hair_s5_04_pinned_daoist_crown'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_sideburn_deg=108,
                              phi_ear_deg=86, phi_nape_deg=134, widow_peak_deg=5.0, thick_crown=0.015, wave_amp=0.0005),
        ]
        parts.extend(sculpt_bun(gid + '_topknot', p_str, center=(0.0, -0.006, 1.792), axis=(0.0, 0.14, 0.99),
                                radius_xy=0.027, height=0.056, cylindrical=True, messy_amp=0.001,
                                with_cuff=True, cuff_paint=p_str, with_hairpin=True, pin_paint=p_pin))
        return gid, 'Tall Daoist Topknot with Horizontal Hairpin', 'male', parts
    specs.append(m5_04)

    def m5_05():
        gid = 'hair_s5_05_half_topknot_long_straight'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                              widow_peak_deg=5.0, thick_crown=0.015, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.405, theta_top_deg=55, theta_brow_deg=62,
                                theta_cheek_deg=70, tuck_behind_ears=True, thick_crown=0.014, thick_mid=0.019,
                                bell_flare=0.012, wave_amp=0.0008, lobe_amp=0.0012),
        ]
        parts.extend(sculpt_bun(gid + '_topknot', p_str, center=(0.0, 0.005, 1.792), axis=(0.0, 0.28, 0.96),
                                radius_xy=0.027, height=0.032, with_cuff=True, cuff_paint=p_str))
        return gid, 'High Topknot with Long Straight Cascading Hair', 'male', parts
    specs.append(m5_05)

    def m5_06():
        gid = 'hair_s5_06_shaved_forehead_queue'
        parts = [sculpt_bianfa_cap(gid + '_cap', p_str, y_front_line=-0.025, z_nape=1.588, thick=0.010)]
        parts.extend(sculpt_hanging_braid(gid + '_queue', p_brd, mode='back_center', z_top=1.625, z_bot=1.390, radius=0.015))
        return gid, 'Shaved Forehead with Long Braided Queue', 'male', parts
    specs.append(m5_06)

    def m5_07():
        gid = 'hair_s5_07_shaved_thick_nape_braid'
        parts = [sculpt_bianfa_cap(gid + '_cap', p_str, y_front_line=-0.030, z_nape=1.585, thick=0.012)]
        parts.extend(sculpt_hanging_braid(gid + '_queue', p_brd, mode='back_center', z_top=1.645, z_bot=1.405, radius=0.021))
        return gid, 'Shaved Forehead with Thick Heavy Queue Plait', 'male', parts
    specs.append(m5_07)

    def m5_08():
        gid = 'hair_s5_08_receding_fringed_queue'
        parts = [
            sculpt_bianfa_cap(gid + '_cap', p_str, y_front_line=-0.048, z_nape=1.580, thick=0.012),
            sculpt_flowing_mane(gid + '_fringe', p_str, z_top=1.685, z_bot=1.540, theta_top_deg=72, theta_brow_deg=76,
                                theta_cheek_deg=80, tuck_behind_ears=True, thick_crown=0.010, thick_mid=0.014, bell_flare=0.008),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_queue', p_brd, mode='back_center', z_top=1.625, z_bot=1.450,
                                          radius=0.017, with_cuff=True, cuff_paint=p_pin))
        return gid, 'High Forehead with Temple Locks & Wrapped Queue', 'male', parts
    specs.append(m5_08)

    def m5_09():
        gid = 'hair_s5_09_high_shaved_long_queue'
        parts = [sculpt_bianfa_cap(gid + '_cap', p_str, y_front_line=-0.015, z_nape=1.590, thick=0.009)]
        parts.extend(sculpt_hanging_braid(gid + '_queue', p_brd, mode='back_center', z_top=1.635, z_bot=1.380, radius=0.016))
        return gid, 'High Shaved Crown with Long Tight Queue', 'male', parts
    specs.append(m5_09)

    def m5_10():
        gid = 'hair_s5_10_full_back_longest_queue'
        parts = [sculpt_bianfa_cap(gid + '_cap', p_str, y_front_line=-0.025, z_nape=1.588, thick=0.010)]
        parts.extend(sculpt_hanging_braid(gid + '_queue', p_brd, mode='back_center', z_top=1.635, z_bot=1.310, radius=0.017))
        return gid, 'Shaved Dome with Waist-Length Braided Queue', 'male', parts
    specs.append(m5_10)

    return specs


def build_female_50_specs():
    specs = []
    p_str = P_hair('hair_strands')
    p_wav = P_hair('hair_waves')
    p_crl = P_hair('hair_curls')
    p_brd = P_hair('hair_braid')

    # ===========================================================================================================
    # SHEET F1: Medieval / Slavic / Folk Braids, Crown Braids & Flowing Waves (10 styles)
    # ===========================================================================================================
    def f1_01():
        gid = 'hair_f1_01_long_parted_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.380, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.019, thick_mid=0.025, bell_flare=0.022, wave_amp=0.006, wave_freq=5.5)]
        return gid, 'Long Flowing Center-Parted Folk Waves', 'female', parts
    specs.append(f1_01)

    def f1_02():
        gid = 'hair_f1_02_single_back_braid'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        parts.extend(sculpt_hanging_braid(gid + '_braid', p_brd, mode='back_center', z_top=1.640, z_bot=1.380, radius=0.022))
        return gid, 'Center-Parted Thick Single Back Braid', 'female', parts
    specs.append(f1_02)

    def f1_03():
        gid = 'hair_f1_03_twin_shoulder_braids'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.009, thick_crown=0.018)]
        parts.extend(sculpt_hanging_braid(gid + '_braids', p_brd, mode='twin_shoulder', z_top=1.650, z_bot=1.385, radius=0.019))
        return gid, 'Twin Thick Over-Shoulder Braids', 'female', parts
    specs.append(f1_03)

    def f1_04():
        gid = 'hair_f1_04_milkmaid_halo_braid'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=92,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_halo', p_brd, th_start_deg=12, th_end_deg=178,
                                        z_start=1.758, z_mid=1.710, z_end=1.625, radius=0.022))
        return gid, 'Slavic Milkmaid Halo Crown Braid', 'female', parts
    specs.append(f1_04)

    def f1_05():
        gid = 'hair_f1_05_braided_low_chignon'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=90, phi_ear_deg=96,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.064, 1.612), axis=(0.0, 0.94, -0.34),
                                radius_xy=0.042, height=0.036, messy_amp=0.005))
        parts.extend(sculpt_curtain_tendrils(gid + '_tend', p_wav, z_root=1.740, z_tip=1.565, x_mid=0.062, x_tip=0.068, radius=0.011))
        return gid, 'Braided Low Chignon with Cheek Tendrils', 'female', parts
    specs.append(f1_05)

    def f1_06():
        gid = 'hair_f1_06_asym_left_shoulder_braid'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        parts.extend(sculpt_hanging_braid(gid + '_braid', p_brd, mode='left_shoulder', z_top=1.645, z_bot=1.385, radius=0.022))
        parts.extend(sculpt_hanging_braid(gid + '_back', p_brd, mode='back_center', z_top=1.645, z_bot=1.410, radius=0.019))
        return gid, 'Draped Over-Shoulder Loose Plait', 'female', parts
    specs.append(f1_06)

    def f1_07():
        gid = 'hair_f1_07_crown_to_back_braid'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=92,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_crown', p_brd, th_start_deg=20, th_end_deg=176,
                                        z_start=1.748, z_mid=1.700, z_end=1.635, radius=0.018))
        parts.extend(sculpt_hanging_braid(gid + '_tail', p_brd, mode='back_center', z_top=1.635, z_bot=1.385, radius=0.020))
        parts.extend(sculpt_hanging_braid(gid + '_side', p_brd, mode='left_shoulder', z_top=1.635, z_bot=1.415, radius=0.016))
        return gid, 'Dutch Crown Braids into Merged Plait', 'female', parts
    specs.append(f1_07)

    def f1_08():
        gid = 'hair_f1_08_crossed_crown_plait'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=92,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_crown', p_brd, th_start_deg=24, th_end_deg=176,
                                        z_start=1.745, z_mid=1.715, z_end=1.655, radius=0.017))
        parts.extend(sculpt_hanging_braid(gid + '_tail', p_brd, mode='back_center', z_top=1.655, z_bot=1.390, radius=0.019))
        return gid, 'Crossed Crown Wreath & Back Braid', 'female', parts
    specs.append(f1_08)

    def f1_09():
        gid = 'hair_f1_09_bohemian_temple_braids'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.385, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.006)]
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.720, z_bot=1.390, radius=0.012))
        parts.extend(sculpt_hanging_braid(gid + '_bbrd', p_brd, mode='twin_back', z_top=1.710, z_bot=1.395, radius=0.012))
        return gid, 'Flowing Waves with Twin Bohemian Braids', 'female', parts
    specs.append(f1_09)

    def f1_10():
        gid = 'hair_f1_10_coiled_rosette_bun'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=92,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_crown', p_brd, th_start_deg=18, th_end_deg=165,
                                        z_start=1.752, z_mid=1.715, z_end=1.655, radius=0.018))
        parts.extend(sculpt_bun(gid + '_rosette', p_brd, center=(0.0, 0.062, 1.655), axis=(0.0, 0.98, 0.15),
                                radius_xy=0.052, height=0.038, messy_amp=0.006))
        return gid, 'Grand Coiled Braided Rosette Updo', 'female', parts
    specs.append(f1_10)

    # ===========================================================================================================
    # SHEET F2: Renaissance / Italian Court Coiled Ear-Buns, Chignons & Waves (10 styles)
    # ===========================================================================================================
    def f2_01():
        gid = 'hair_f2_01_renaissance_parted_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.395, theta_brow_deg=46, theta_cheek_deg=54,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.005, wave_freq=5.0)]
        return gid, 'Long Sculpted Renaissance Court Waves', 'female', parts
    specs.append(f2_01)

    def f2_02():
        gid = 'hair_f2_02_looped_ear_braids'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_ear_coils(gid + '_loops', p_brd, z_center=1.655, y_center=-0.038, x_offset=0.088,
                                      radius_ring=0.036, tube_r=0.014, open_loop=True))
        parts.extend(sculpt_bun(gid + '_nape', p_brd, center=(0.0, 0.058, 1.630), axis=(0.0, 0.96, -0.25),
                                radius_xy=0.036, height=0.028, messy_amp=0.004))
        return gid, 'Renaissance Looped Ear-Braids & Chignon', 'female', parts
    specs.append(f2_02)

    def f2_03():
        gid = 'hair_f2_03_braided_nape_chignon'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=92, phi_ear_deg=98,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018, cover_ears=True)]
        parts.extend(sculpt_crown_braid(gid + '_side', p_brd, th_start_deg=55, th_end_deg=175,
                                        z_start=1.690, z_mid=1.650, z_end=1.615, radius=0.016))
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.064, 1.615), axis=(0.0, 0.95, -0.30),
                                radius_xy=0.042, height=0.034, messy_amp=0.004))
        return gid, 'Parted Waves & Braided Nape Chignon', 'female', parts
    specs.append(f2_03)

    def f2_04():
        gid = 'hair_f2_04_coiled_ram_ear_buns'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=96,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017, cover_ears=True)]
        parts.extend(sculpt_ear_coils(gid + '_coils', p_brd, z_center=1.652, y_center=-0.032, x_offset=0.088,
                                      radius_ring=0.042, tube_r=0.017, open_loop=False))
        return gid, 'Coiled Braided Wheel Buns Over Ears', 'female', parts
    specs.append(f2_04)

    def f2_05():
        gid = 'hair_f2_05_tucked_renaissance_roll'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=94, phi_ear_deg=102,
                                   phi_nape_deg=138, part_x=0.0, part_depth=0.008, thick_crown=0.019,
                                   thick_side=0.020, thick_nape=0.024, cover_ears=True)]
        parts.extend(sculpt_bun(gid + '_roll', p_wav, center=(0.0, 0.060, 1.608), axis=(0.0, 0.92, -0.38),
                                radius_xy=0.038, height=0.026, messy_amp=0.003))
        return gid, 'Tucked Renaissance Cushion Roll', 'female', parts
    specs.append(f2_05)

    def f2_06():
        gid = 'hair_f2_06_shoulder_ringlet_bob'
        parts = [sculpt_flowing_mane(gid + '_base', p_crl, z_bot=1.480, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.016, wave_amp=0.006)]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.710, z_bot=1.475, theta_start_deg=50, n_locks=13,
                                          radius=0.016, curl_amp=0.007, curl_turns=3.2, flare_out=0.018))
        return gid, 'Shoulder-Length Bouncy Court Ringlets', 'female', parts
    specs.append(f2_06)

    def f2_07():
        gid = 'hair_f2_07_coronet_twist_updo'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_coronet', p_brd, th_start_deg=16, th_end_deg=178,
                                        z_start=1.750, z_mid=1.700, z_end=1.622, radius=0.020))
        return gid, 'Braided Coronet Wreath Updo', 'female', parts
    specs.append(f2_07)

    def f2_08():
        gid = 'hair_f2_08_high_chignon_tendrils'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=90, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        parts.extend(sculpt_bun(gid + '_bun', p_wav, center=(0.0, 0.062, 1.665), axis=(0.0, 0.98, 0.18),
                                radius_xy=0.044, height=0.038, messy_amp=0.005))
        parts.extend(sculpt_curtain_tendrils(gid + '_tend', p_crl, z_root=1.720, z_tip=1.545, x_mid=0.064, x_tip=0.070, radius=0.011))
        return gid, 'Coiled Back Chignon with Spiral Tendrils', 'female', parts
    specs.append(f2_08)

    def f2_09():
        gid = 'hair_f2_09_braided_diadem_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.395, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.005)]
        parts.extend(sculpt_crown_braid(gid + '_diadem', p_brd, th_start_deg=20, th_end_deg=176,
                                        z_start=1.748, z_mid=1.715, z_end=1.685, radius=0.015))
        return gid, 'Flowing Court Waves with Braided Diadem', 'female', parts
    specs.append(f2_09)

    def f2_10():
        gid = 'hair_f2_10_festooned_ear_coils'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=90, phi_ear_deg=96,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        parts.extend(sculpt_ear_coils(gid + '_coils', p_brd, z_center=1.662, y_center=-0.035, x_offset=0.088,
                                      radius_ring=0.034, tube_r=0.015, open_loop=True))
        parts.extend(sculpt_crown_braid(gid + '_crown', p_brd, th_start_deg=22, th_end_deg=175,
                                        z_start=1.748, z_mid=1.705, z_end=1.630, radius=0.016))
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.062, 1.628), axis=(0.0, 0.96, -0.25),
                                radius_xy=0.040, height=0.032, messy_amp=0.004))
        return gid, 'Festooned Ear Coils & Braided Court Knot', 'female', parts
    specs.append(f2_10)

    # ===========================================================================================================
    # SHEET F3: East Asian Courtly Buns, Twin Buns, Loops & Winged Chignons (10 styles)
    # ===========================================================================================================
    def f3_01():
        gid = 'hair_f3_01_high_coiled_top_bun'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                                   widow_peak_deg=4.0, thick_crown=0.016, wave_amp=0.0005)]
        parts.extend(sculpt_bun(gid + '_bun', p_str, center=(0.0, 0.008, 1.796), axis=(0.0, 0.35, 0.94),
                                radius_xy=0.044, height=0.042, messy_amp=0.003))
        return gid, 'High Coiled Court Top Bun', 'female', parts
    specs.append(f3_01)

    def f3_02():
        gid = 'hair_f3_02_twin_side_buns'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=88,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.016, wave_amp=0.0005)]
        for sgn, tag in [(-1.0, 'R'), (1.0, 'L')]:
            parts.extend(sculpt_bun(f'{gid}_bun_{tag}', p_str, center=(sgn * 0.086, -0.010, 1.695),
                                    axis=(sgn * 0.94, 0.20, 0.25), radius_xy=0.040, height=0.036, messy_amp=0.002))
        return gid, 'Twin Side Coiled Buns (Shuangji)', 'female', parts
    specs.append(f3_02)

    def f3_03():
        gid = 'hair_f3_03_woven_low_court_bun'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=86, phi_ear_deg=90,
                                   part_x=0.0, part_depth=0.007, thick_crown=0.016, wave_amp=0.0005)]
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.064, 1.608), axis=(0.0, 0.94, -0.34),
                                radius_xy=0.046, height=0.036, messy_amp=0.004))
        return gid, 'Woven Low Nape Court Chignon', 'female', parts
    specs.append(f3_03)

    def f3_04():
        gid = 'hair_f3_04_half_topknot_sleek_long'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                              widow_peak_deg=4.0, thick_crown=0.015, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.390, theta_top_deg=58, theta_brow_deg=66,
                                theta_cheek_deg=72, tuck_behind_ears=True, thick_crown=0.014, thick_mid=0.019,
                                bell_flare=0.010, wave_amp=0.0005, lobe_amp=0.001),
        ]
        parts.extend(sculpt_bun(gid + '_bun', p_str, center=(0.0, 0.018, 1.792), axis=(0.0, 0.45, 0.89),
                                radius_xy=0.036, height=0.034, messy_amp=0.002))
        return gid, 'High Coiled Topknot & Sleek Long Hair', 'female', parts
    specs.append(f3_04)

    def f3_05():
        gid = 'hair_f3_05_flying_immortal_loops'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                                   part_x=0.0, part_depth=0.007, thick_crown=0.016, wave_amp=0.0005)]
        parts.extend(sculpt_bun(gid + '_center_bun', p_str, center=(0.0, 0.015, 1.785), axis=(0.0, 0.40, 0.91),
                                radius_xy=0.038, height=0.030, messy_amp=0.002))
        # Standing twin ring loops on top-sides (feixianji)
        for sgn, tag in [(-1.0, 'R'), (1.0, 'L')]:
            ctrl = [
                [0.0, 0.005, 1.785],
                [sgn * 0.042, -0.005, 1.825],
                [sgn * 0.075, 0.005, 1.785],
                [sgn * 0.058, 0.015, 1.735],
                [0.0, 0.020, 1.755],
            ]
            parts.append(sculpt_lock_tube(f'{gid}_loop_{tag}', p_str, ctrl, [0.012, 0.014, 0.014, 0.013, 0.010], flatten=0.80))
        return gid, 'Flying-Immortal Ring Loops (Feixianji)', 'female', parts
    specs.append(f3_05)

    def f3_06():
        gid = 'hair_f3_06_swept_butterfly_wings'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=88,
                                   part_x=0.0, part_depth=0.009, thick_crown=0.016, wave_amp=0.0005)]
        for sgn, tag in [(-1.0, 'R'), (1.0, 'L')]:
            parts.extend(sculpt_bun(f'{gid}_wing_{tag}', p_str, center=(sgn * 0.068, -0.005, 1.735),
                                    axis=(sgn * 0.82, 0.15, 0.55), radius_xy=0.044, height=0.052, cylindrical=True, messy_amp=0.001))
        return gid, 'Upward-Swept Court Butterfly Wings', 'female', parts
    specs.append(f3_06)

    def f3_07():
        gid = 'hair_f3_07_wide_cloud_lobes'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=88,
                                   part_x=0.0, part_depth=0.009, thick_crown=0.016, wave_amp=0.0005)]
        for sgn, tag in [(-1.0, 'R'), (1.0, 'L')]:
            parts.extend(sculpt_bun(f'{gid}_lobe_{tag}', p_str, center=(sgn * 0.078, 0.005, 1.690),
                                    axis=(sgn * 0.96, 0.25, 0.05), radius_xy=0.044, height=0.055, cylindrical=False, messy_amp=0.001))
        return gid, 'Wide Horizontal Court Cloud Lobes', 'female', parts
    specs.append(f3_07)

    def f3_08():
        gid = 'hair_f3_08_sleek_high_pillbox_bun'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                                   widow_peak_deg=4.0, thick_crown=0.016, wave_amp=0.0005)]
        parts.extend(sculpt_bun(gid + '_bun', p_str, center=(0.0, 0.015, 1.788), axis=(0.0, 0.35, 0.94),
                                radius_xy=0.040, height=0.034, cylindrical=True, messy_amp=0.001, with_cuff=True, cuff_paint=p_str))
        return gid, 'Sleek High Rounded Pillbox Bun', 'female', parts
    specs.append(f3_08)

    def f3_09():
        gid = 'hair_f3_09_flat_bar_chignon'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=88,
                              part_x=0.0, part_depth=0.009, thick_crown=0.016, wave_amp=0.0005),
            sculpt_lock_tube(gid + '_bar', p_str,
                             [[-0.098, 0.005, 1.755], [-0.048, 0.008, 1.768], [0.0, 0.010, 1.765],
                              [0.048, 0.008, 1.768], [0.098, 0.005, 1.755]],
                             [0.022, 0.032, 0.028, 0.032, 0.022], flatten=0.72),
        ]
        return gid, 'Horizontal Winged Court Bar (Liangbatou)', 'female', parts
    specs.append(f3_09)

    def f3_10():
        gid = 'hair_f3_10_bouffant_empress_dome'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=56, phi_temple_deg=88, phi_ear_deg=92,
                              phi_nape_deg=136, part_x=0.0, part_depth=0.008,
                              thick_crown=0.042, thick_front=0.034, thick_side=0.036, thick_nape=0.024, wave_amp=0.001),
        ]
        return gid, 'Voluminous Bouffant Empress Dome', 'female', parts
    specs.append(f3_10)

    # ===========================================================================================================
    # SHEET F4: Levantine / Mediterranean / Persian Wavy, Crown-Braided & Chignon Hairstyles (10 styles)
    # ===========================================================================================================
    def f4_01():
        gid = 'hair_f4_01_voluminous_dark_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.385, theta_brow_deg=46, theta_cheek_deg=54,
                                     thick_crown=0.020, thick_mid=0.026, bell_flare=0.024, wave_amp=0.007, wave_freq=6.0)]
        return gid, 'Voluminous Cascading Persian Waves', 'female', parts
    specs.append(f4_01)

    def f4_02():
        gid = 'hair_f4_02_full_low_chignon'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=90, phi_ear_deg=96,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018, cover_ears=True)]
        parts.extend(sculpt_bun(gid + '_bun', p_wav, center=(0.0, 0.064, 1.612), axis=(0.0, 0.94, -0.34),
                                radius_xy=0.044, height=0.038, messy_amp=0.004))
        return gid, 'Parted Full Rounded Nape Chignon', 'female', parts
    specs.append(f4_02)

    def f4_03():
        gid = 'hair_f4_03_waves_single_temple_braid'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.390, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.019, thick_mid=0.025, bell_flare=0.020, wave_amp=0.006)]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=25, th_end_deg=110,
                                        z_start=1.745, z_mid=1.715, z_end=1.675, radius=0.014, side='L'))
        parts.extend(sculpt_hanging_braid(gid + '_lbrd', p_brd, mode='left_shoulder', z_top=1.675, z_bot=1.395, radius=0.014))
        return gid, 'Flowing Waves with Left Temple Accent Braid', 'female', parts
    specs.append(f4_03)

    def f4_04():
        gid = 'hair_f4_04_half_twisted_back_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.390, theta_brow_deg=50, theta_cheek_deg=58,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.006)]
        parts.extend(sculpt_crown_braid(gid + '_twist', p_wav, th_start_deg=35, th_end_deg=176,
                                        z_start=1.735, z_mid=1.700, z_end=1.675, radius=0.015))
        return gid, 'Half-Twisted Crown Locks & Long Waves', 'female', parts
    specs.append(f4_04)

    def f4_05():
        gid = 'hair_f4_05_braided_crown_low_bun'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_crown', p_brd, th_start_deg=22, th_end_deg=175,
                                        z_start=1.748, z_mid=1.695, z_end=1.625, radius=0.018))
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.064, 1.615), axis=(0.0, 0.94, -0.34),
                                radius_xy=0.044, height=0.036, messy_amp=0.005))
        return gid, 'Braided Side Crowns & Low Chignon', 'female', parts
    specs.append(f4_05)

    def f4_06():
        gid = 'hair_f4_06_thick_left_shoulder_plait'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        parts.extend(sculpt_hanging_braid(gid + '_plait', p_brd, mode='left_shoulder', z_top=1.640, z_bot=1.385, radius=0.023))
        parts.extend(sculpt_hanging_braid(gid + '_back', p_brd, mode='back_center', z_top=1.640, z_bot=1.410, radius=0.020))
        return gid, 'Heavy Left-Shoulder Draped Plait', 'female', parts
    specs.append(f4_06)

    def f4_07():
        gid = 'hair_f4_07_high_braided_crown_bun'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=86, phi_ear_deg=90,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.032, 1.765), axis=(0.0, 0.65, 0.76),
                                radius_xy=0.046, height=0.038, messy_amp=0.005))
        return gid, 'High Braided Crown Coil Bun', 'female', parts
    specs.append(f4_07)

    def f4_08():
        gid = 'hair_f4_08_loose_low_back_braid'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=90, phi_ear_deg=96,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018, cover_ears=True)]
        parts.extend(sculpt_hanging_braid(gid + '_braid', p_brd, mode='back_center', z_top=1.625, z_bot=1.390, radius=0.023))
        return gid, 'Softly Parted Loose Low Back Braid', 'female', parts
    specs.append(f4_08)

    def f4_09():
        gid = 'hair_f4_09_parted_wreath_chignon'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.010, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_wreath', p_brd, th_start_deg=20, th_end_deg=176,
                                        z_start=1.748, z_mid=1.685, z_end=1.610, radius=0.020))
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.062, 1.612), axis=(0.0, 0.94, -0.34),
                                radius_xy=0.040, height=0.034, messy_amp=0.004))
        return gid, 'Center-Parted Dutch Wreath Chignon', 'female', parts
    specs.append(f4_09)

    def f4_10():
        gid = 'hair_f4_10_braided_halo_flowing_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.385, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.025, bell_flare=0.022, wave_amp=0.006)]
        parts.extend(sculpt_crown_braid(gid + '_halo', p_brd, th_start_deg=18, th_end_deg=178,
                                        z_start=1.752, z_mid=1.718, z_end=1.685, radius=0.018))
        return gid, 'Braided Halo Band & Long Flowing Waves', 'female', parts
    specs.append(f4_10)

    # ===========================================================================================================
    # SHEET F5: Classical / Noble Ringlet Curls, Multi-Braid Half-Up & Crown-Braided Hairstyles (10 styles)
    # ===========================================================================================================
    def f5_01():
        gid = 'hair_f5_01_sculpted_shoulder_curls'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.440, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, thick_bot=0.026, bell_flare=0.024,
                                     pageboy_roll=0.016, wave_amp=0.006, wave_freq=4.5)]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.580, z_bot=1.435, theta_start_deg=52, n_locks=13,
                                          radius=0.018, curl_amp=0.008, curl_turns=2.2, flare_out=0.022))
        return gid, 'Smooth Parted Top & Sculpted Barrel Curls', 'female', parts
    specs.append(f5_01)

    def f5_02():
        gid = 'hair_f5_02_cascading_ringlet_mane'
        parts = [sculpt_flowing_mane(gid + '_base', p_crl, z_bot=1.390, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.019, thick_mid=0.025, bell_flare=0.022, wave_amp=0.007)]
        parts.extend(sculpt_ringlet_array(gid, p_crl, z_top=1.715, z_bot=1.385, theta_start_deg=48, n_locks=15,
                                          radius=0.017, curl_amp=0.009, curl_turns=4.2, flare_out=0.022))
        return gid, 'Dense Cascading Noble Corkscrew Ringlets', 'female', parts
    specs.append(f5_02)

    def f5_03():
        gid = 'hair_f5_03_crown_braid_temple_plaits'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.390, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.005)]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=22, th_end_deg=145,
                                        z_start=1.748, z_mid=1.715, z_end=1.690, radius=0.015))
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.715, z_bot=1.395, radius=0.012))
        parts.extend(sculpt_hanging_braid(gid + '_bbrd', p_brd, mode='twin_back', z_top=1.695, z_bot=1.395, radius=0.012))
        return gid, 'Crown Braids & Twin Hanging Temple Plaits', 'female', parts
    specs.append(f5_03)

    def f5_04():
        gid = 'hair_f5_04_braided_chignon_tendrils'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=90, phi_ear_deg=96,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.064, 1.622), axis=(0.0, 0.96, -0.25),
                                radius_xy=0.044, height=0.036, messy_amp=0.005))
        parts.extend(sculpt_curtain_tendrils(gid + '_tend', p_wav, z_root=1.735, z_tip=1.555, x_mid=0.062, x_tip=0.068, radius=0.012))
        return gid, 'Woven Back Chignon with Soft Tendrils', 'female', parts
    specs.append(f5_04)

    def f5_05():
        gid = 'hair_f5_05_quad_braid_flowing_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.385, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.006)]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=20, th_end_deg=155,
                                        z_start=1.748, z_mid=1.718, z_end=1.695, radius=0.014))
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.715, z_bot=1.390, radius=0.012))
        parts.extend(sculpt_hanging_braid(gid + '_bbrd', p_brd, mode='twin_back', z_top=1.705, z_bot=1.390, radius=0.013))
        return gid, 'Multi-Braid Cascades over Flowing Waves', 'female', parts
    specs.append(f5_05)

    def f5_06():
        gid = 'hair_f5_06_twisted_crown_waves'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.410, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.018, wave_amp=0.005)]
        parts.extend(sculpt_crown_braid(gid + '_twist', p_brd, th_start_deg=24, th_end_deg=150,
                                        z_start=1.745, z_mid=1.712, z_end=1.680, radius=0.015))
        return gid, 'Twisted Side-Crown Ropes & Shoulder Waves', 'female', parts
    specs.append(f5_06)

    def f5_07():
        gid = 'hair_f5_07_thick_twin_dutch_braids'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.010, thick_crown=0.018)]
        parts.extend(sculpt_crown_braid(gid + '_dutch', p_brd, th_start_deg=22, th_end_deg=135,
                                        z_start=1.748, z_mid=1.700, z_end=1.645, radius=0.018))
        parts.extend(sculpt_hanging_braid(gid + '_front', p_brd, mode='twin_shoulder', z_top=1.655, z_bot=1.390, radius=0.020))
        parts.extend(sculpt_hanging_braid(gid + '_back', p_brd, mode='twin_back', z_top=1.655, z_bot=1.400, radius=0.018))
        return gid, 'Thick Twin Dutch Shoulder & Back Braids', 'female', parts
    specs.append(f5_07)

    def f5_08():
        gid = 'hair_f5_08_half_up_braided_rosette'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.395, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.005)]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=28, th_end_deg=176,
                                        z_start=1.742, z_mid=1.712, z_end=1.695, radius=0.015))
        parts.extend(sculpt_bun(gid + '_rosette', p_brd, center=(0.0, 0.058, 1.695), axis=(0.0, 0.94, 0.34),
                                radius_xy=0.032, height=0.028, messy_amp=0.004))
        return gid, 'Half-Up Braided Rosette Knot & Waves', 'female', parts
    specs.append(f5_08)

    def f5_09():
        gid = 'hair_f5_09_heavy_coronet_half_down'
        parts = [sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.395, theta_brow_deg=48, theta_cheek_deg=55,
                                     thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.005)]
        parts.extend(sculpt_crown_braid(gid + '_coronet', p_brd, th_start_deg=16, th_end_deg=178,
                                        z_start=1.752, z_mid=1.715, z_end=1.682, radius=0.021))
        return gid, 'Heavy Braided Coronet Halo & Long Waves', 'female', parts
    specs.append(f5_09)

    def f5_10():
        gid = 'hair_f5_10_woven_basket_chignon'
        parts = [sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=88, phi_ear_deg=94,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.017)]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=22, th_end_deg=175,
                                        z_start=1.748, z_mid=1.695, z_end=1.630, radius=0.018))
        parts.extend(sculpt_bun(gid + '_basket', p_brd, center=(0.0, 0.064, 1.622), axis=(0.0, 0.96, -0.25),
                                radius_xy=0.046, height=0.038, messy_amp=0.005))
        return gid, 'Woven Basket-Braid Court Chignon', 'female', parts
    specs.append(f5_10)

    return specs


def build_extra_hair_specs():
    """Build 60 additional hairstyles:
    - 10 Chichani Male (hair_cm_01..10)
    - 10 Chichani Female (hair_cf_01..10)
    - 10 Spiky/Heroic Male (hair_sp_m01..10)
    - 10 Spiky/Punk Female (hair_sp_f01..10)
    - 10 Barbarian Male (hair_barb_01..10)
    - 10 Cyber/Fade Male (hair_cyb_01..10)
    """
    specs = []
    p_str = P_hair('hair_strands')
    p_wav = P_hair('hair_waves')
    p_brd = P_hair('hair_braid')
    p_stb = P_hair('hair_strands', base='hair_stubble', light='hair_light', dark='hair_base')
    p_gld = P_gold()

    # ===========================================================================================================
    # CHICHANI MALE HAIRSTYLES (10 styles)
    # ===========================================================================================================
    def cm_01():
        gid = 'hair_cm_01_sleek_straight_shoulder'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.008, thick_crown=0.016, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.460, theta_brow_deg=54, theta_cheek_deg=64,
                                tuck_behind_ears=True, thick_crown=0.015, thick_mid=0.020, bell_flare=0.010, wave_amp=0.0005),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_front', p_str, z_root=1.748, z_tip=1.470, x_mid=0.058, x_tip=0.062,
                                             y_mid=-0.125, y_tip=-0.105, radius=0.014, wave_amp=0.0))
        return gid, 'Chichani Sleek Straight Shoulder Mane', 'male', parts
    specs.append(cm_01)

    def cm_02():
        gid = 'hair_cm_02_wild_feathered_mane'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.465, theta_brow_deg=48, theta_cheek_deg=58,
                                tuck_behind_ears=True, thick_crown=0.022, thick_mid=0.026, bell_flare=0.022,
                                wave_amp=0.006, lobe_count=20, lobe_amp=0.005),
        ]
        spikes = [
            ([sgn * 0.045, -0.04, 1.72], [sgn * 0.095, -0.02, 1.70], [sgn * 0.125, 0.01, 1.66], 0.016)
            for sgn in (-1.0, 1.0)
        ] + [
            ([sgn * 0.055, 0.01, 1.64], [sgn * 0.105, 0.03, 1.60], [sgn * 0.130, 0.05, 1.54], 0.016)
            for sgn in (-1.0, 1.0)
        ]
        parts.extend(sculpt_spike_cluster(gid, p_wav, spikes))
        return gid, 'Chichani Wild Feathered Mane', 'male', parts
    specs.append(cm_02)

    def cm_03():
        gid = 'hair_cm_03_cornrow_topknot_bun'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_brd, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=134, thick_crown=0.014, lobe_count=24, lobe_amp=0.003),
            sculpt_lock_tube(gid + '_back_plait', p_brd,
                             [[0.0, 0.025, 1.775], [0.0, 0.062, 1.700], [0.0, 0.055, 1.610], [0.0, 0.045, 1.540]],
                             [0.014, 0.016, 0.014, 0.006], braid_plait=True),
        ]
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, -0.005, 1.796), axis=(0.0, 0.25, 0.97),
                                radius_xy=0.034, height=0.034, messy_amp=0.004))
        return gid, 'Chichani Cornrow Crown & Topknot', 'male', parts
    specs.append(cm_03)

    def cm_04():
        gid = 'hair_cm_04_undercut_swept_mullet'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
            sculpt_flowing_mane(gid + '_back', p_str, z_top=1.765, z_bot=1.465, theta_top_deg=110, theta_brow_deg=115,
                                theta_cheek_deg=120, theta_bot_deg=125, tuck_behind_ears=True,
                                thick_crown=0.020, thick_mid=0.024, bell_flare=0.014),
        ]
        # Dramatic right-swept fringe (-X is character's right side, viewer's left!)
        spikes = [
            ([0.015, -0.115, 1.755], [-0.048, -0.148, 1.745], [-0.088, -0.135, 1.640], 0.020),
            ([0.020, -0.085, 1.775], [-0.055, -0.132, 1.760], [-0.095, -0.115, 1.610], 0.022),
            ([0.010, -0.045, 1.785], [-0.062, -0.105, 1.765], [-0.092, -0.088, 1.585], 0.020),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Chichani Shaved Side & Swept Mullet', 'male', parts
    specs.append(cm_04)

    def cm_05():
        gid = 'hair_cm_05_half_braided_cuff_mane'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.460, theta_brow_deg=54, theta_cheek_deg=64,
                                tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.021, bell_flare=0.012, wave_amp=0.002),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=28, th_end_deg=176,
                                        z_start=1.742, z_mid=1.710, z_end=1.675, radius=0.015))
        parts.extend(sculpt_bun(gid + '_cuff', p_gld, center=(0.0, 0.064, 1.668), axis=(0.0, 0.95, 0.30),
                                radius_xy=0.018, height=0.016, cylindrical=True, messy_amp=0.0))
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.700, z_bot=1.465, radius=0.012))
        return gid, 'Chichani Braided Crown Clasp & Straight Mane', 'male', parts
    specs.append(cm_05)

    def cm_06():
        gid = 'hair_cm_06_asym_choppy_fringe'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=134, thick_crown=0.020, lobe_count=20, lobe_amp=0.003),
        ]
        spikes = [
            ([0.020, -0.115, 1.755], [-0.032, -0.155, 1.720], [-0.055, -0.155, 1.635], 0.018),
            ([0.035, -0.095, 1.768], [-0.012, -0.152, 1.735], [-0.032, -0.158, 1.645], 0.018),
            ([-0.015, -0.110, 1.755], [-0.058, -0.145, 1.715], [-0.078, -0.132, 1.650], 0.016),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Chichani Choppy Asymmetric Fringe Crop', 'male', parts
    specs.append(cm_06)

    def cm_07():
        gid = 'hair_cm_07_full_dread_braid_curtain'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_brd, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=88,
                              part_x=0.0, part_depth=0.008, thick_crown=0.016),
        ]
        parts.extend(sculpt_ringlet_array(gid, p_brd, z_top=1.735, z_bot=1.455, theta_start_deg=56, n_locks=15,
                                          radius=0.015, curl_amp=0.0, curl_turns=0.0, flare_out=0.014, cover_ears=False))
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.725, z_bot=1.460, radius=0.014))
        return gid, 'Chichani Full Braided Dreadlock Curtain', 'male', parts
    specs.append(cm_07)

    def cm_08():
        gid = 'hair_cm_08_wavy_half_topknot'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.465, theta_brow_deg=52, theta_cheek_deg=62,
                                tuck_behind_ears=True, thick_crown=0.017, thick_mid=0.023, bell_flare=0.016, wave_amp=0.005),
        ]
        parts.extend(sculpt_bun(gid + '_bun', p_wav, center=(0.0, 0.052, 1.735), axis=(0.0, 0.85, 0.52),
                                radius_xy=0.032, height=0.030, messy_amp=0.004))
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.485, x_mid=0.062, x_tip=0.072, radius=0.015))
        return gid, 'Chichani Wavy Half-Up Crown Knot', 'male', parts
    specs.append(cm_08)

    def cm_09():
        gid = 'hair_cm_09_side_swept_temple_braids'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.485, theta_brow_deg=56, theta_cheek_deg=66,
                                tuck_behind_ears=True, thick_crown=0.019, thick_mid=0.024, bell_flare=0.016, wave_amp=0.005),
        ]
        parts.extend(sculpt_crown_braid(gid + '_tbrd', p_brd, th_start_deg=35, th_end_deg=135,
                                        z_start=1.725, z_mid=1.705, z_end=1.675, radius=0.012, side='L'))
        parts.extend(sculpt_spike_cluster(gid, p_wav, [
            ([0.015, -0.115, 1.755], [-0.048, -0.145, 1.740], [-0.082, -0.125, 1.645], 0.020),
        ]))
        return gid, 'Chichani Swept Waves & Temple Cornrows', 'male', parts
    specs.append(cm_09)

    def cm_10():
        gid = 'hair_cm_10_long_asym_undercut_straight'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.460, theta_top_deg=85, theta_brow_deg=92,
                                theta_cheek_deg=96, tuck_behind_ears=True, thick_crown=0.017, thick_mid=0.021, bell_flare=0.012),
        ]
        spikes = [
            ([0.018, -0.115, 1.755], [-0.048, -0.148, 1.740], [-0.075, -0.135, 1.480], 0.020),
            ([0.022, -0.080, 1.775], [-0.058, -0.128, 1.750], [-0.085, -0.110, 1.475], 0.022),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Chichani Undercut with Long Sleek Side Sweep', 'male', parts
    specs.append(cm_10)

    # ===========================================================================================================
    # CHICHANI FEMALE HAIRSTYLES (10 styles)
    # ===========================================================================================================
    def cf_01():
        gid = 'hair_cf_01_sleek_long_straight'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.008, thick_crown=0.016, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.375, theta_brow_deg=56, theta_cheek_deg=66,
                                tuck_behind_ears=True, thick_crown=0.015, thick_mid=0.021, bell_flare=0.014, wave_amp=0.0005),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_front', p_str, z_root=1.748, z_tip=1.390, x_mid=0.058, x_tip=0.064,
                                             y_mid=-0.125, y_tip=-0.105, radius=0.014, wave_amp=0.0))
        return gid, 'Chichani Sleek Straight Long Hair', 'female', parts
    specs.append(cf_01)

    def cf_02():
        gid = 'hair_cf_02_crown_braid_long_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.390, theta_brow_deg=50, theta_cheek_deg=58,
                                tuck_behind_ears=True, thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.006),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=24, th_end_deg=176,
                                        z_start=1.748, z_mid=1.715, z_end=1.675, radius=0.016))
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.440, x_mid=0.062, x_tip=0.075, radius=0.015))
        return gid, 'Chichani Braided Crown & Flowing Waves', 'female', parts
    specs.append(cf_02)

    def cf_03():
        gid = 'hair_cf_03_high_braided_updo_tendrils'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=60, phi_temple_deg=84, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.008, thick_crown=0.017),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=20, th_end_deg=165,
                                        z_start=1.752, z_mid=1.725, z_end=1.685, radius=0.017))
        parts.extend(sculpt_bun(gid + '_bun', p_brd, center=(0.0, 0.055, 1.710), axis=(0.0, 0.90, 0.42),
                                radius_xy=0.048, height=0.042, messy_amp=0.005))
        parts.extend(sculpt_curtain_tendrils(gid + '_tend', p_wav, z_root=1.735, z_tip=1.525, x_mid=0.062, x_tip=0.068, radius=0.011))
        return gid, 'Chichani High Braided Updo with Tendrils', 'female', parts
    specs.append(cf_03)

    def cf_04():
        gid = 'hair_cf_04_parted_twin_back_braids'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=84, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.009, thick_crown=0.017),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_braids', p_brd, mode='twin_back', z_top=1.665, z_bot=1.385, radius=0.020))
        parts.extend(sculpt_hanging_braid(gid + '_fbraids', p_brd, mode='twin_shoulder', z_top=1.655, z_bot=1.395, radius=0.018))
        return gid, 'Chichani Parted Twin Braids', 'female', parts
    specs.append(cf_04)

    def cf_05():
        gid = 'hair_cf_05_shaved_side_long_wave_sweep'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002,
                              wave_amp=0.0, lobe_amp=0.0),
        ]
        for idx, y0 in enumerate([-0.115, -0.075, -0.035, 0.005, 0.040]):
            z0 = 1.745 + 0.038 * math.cos((y0 + 0.040) * 14.0)
            parts.append(
                sculpt_lock_tube(
                    f'{gid}_sw{idx}', p_wav,
                    [[0.020, y0, z0], [-0.035, y0 - 0.010, z0 + 0.018], [-0.078, y0, 1.705],
                     [-0.095, y0 + 0.010, 1.585], [-0.105, y0 + 0.015, 1.445]],
                    [0.015, 0.024, 0.026, 0.024, 0.010], flatten=0.62, curl_amp=0.005, curl_turns=1.5,
                )
            )
        return gid, 'Chichani Shaved Side & Long Wave Sweep', 'female', parts
    specs.append(cf_05)

    def cf_06():
        gid = 'hair_cf_06_thick_halo_braid_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.395, theta_brow_deg=50, theta_cheek_deg=58,
                                tuck_behind_ears=True, thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.006),
        ]
        parts.extend(sculpt_crown_braid(gid + '_halo', p_brd, th_start_deg=18, th_end_deg=178,
                                        z_start=1.752, z_mid=1.715, z_end=1.672, radius=0.020))
        return gid, 'Chichani Thick Halo Braid & Waves', 'female', parts
    specs.append(cf_06)

    def cf_07():
        gid = 'hair_cf_07_high_cascade_ponytail_bangs'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=72, phi_temple_deg=84, phi_ear_deg=86,
                              part_x=0.022, part_depth=0.007, thick_crown=0.017, bangs_roll=0.006),
            sculpt_lock_tube(gid + '_tail_main', p_str,
                             [[0.0, 0.035, 1.775], [0.0, 0.085, 1.795], [0.0, 0.115, 1.710],
                              [0.0, 0.110, 1.580], [0.0, 0.095, 1.455]],
                             [0.022, 0.034, 0.036, 0.028, 0.010], flatten=0.75, rib_amp=0.16),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_bangs', p_str, z_root=1.752, z_tip=1.565, x_mid=0.056, x_tip=0.064, radius=0.015))
        return gid, 'Chichani High Cascading Ponytail & Bangs', 'female', parts
    specs.append(cf_07)

    def cf_08():
        gid = 'hair_cf_08_multi_braid_low_rosette'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_brd, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.008, thick_crown=0.016),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd1', p_brd, th_start_deg=20, th_end_deg=175,
                                        z_start=1.750, z_mid=1.710, z_end=1.630, radius=0.015))
        parts.extend(sculpt_bun(gid + '_rosette', p_brd, center=(0.0, 0.064, 1.622), axis=(0.0, 0.95, -0.30),
                                radius_xy=0.044, height=0.036, messy_amp=0.005))
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.715, z_bot=1.445, radius=0.011))
        return gid, 'Chichani Braided Crown Rosette & Temple Plaits', 'female', parts
    specs.append(cf_08)

    def cf_09():
        gid = 'hair_cf_09_feathered_pixie_mullet'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=70, phi_temple_deg=84, phi_ear_deg=86,
                              phi_nape_deg=138, part_x=0.020, part_depth=0.007, thick_crown=0.022, lobe_count=20, lobe_amp=0.004),
            sculpt_flowing_mane(gid + '_nape', p_str, z_top=1.680, z_bot=1.525, theta_top_deg=95, theta_brow_deg=100,
                                theta_cheek_deg=105, tuck_behind_ears=True, thick_crown=0.014, thick_mid=0.018, bell_flare=0.010),
        ]
        spikes = [
            ([sgn * 0.045, -0.06, 1.72], [sgn * 0.088, -0.05, 1.69], [sgn * 0.105, -0.03, 1.64], 0.015)
            for sgn in (-1.0, 1.0)
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Chichani Feathered Spiky Pixie Mullet', 'female', parts
    specs.append(cf_09)

    def cf_10():
        gid = 'hair_cf_10_high_bun_long_curtain_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.385, theta_brow_deg=50, theta_cheek_deg=58,
                                tuck_behind_ears=True, thick_crown=0.018, thick_mid=0.024, bell_flare=0.020, wave_amp=0.006),
        ]
        parts.extend(sculpt_bun(gid + '_bun', p_wav, center=(0.0, 0.018, 1.792), axis=(0.0, 0.42, 0.91),
                                radius_xy=0.036, height=0.034, messy_amp=0.004))
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.430, x_mid=0.062, x_tip=0.075, radius=0.016))
        return gid, 'Chichani High Crown Bun & Long Curtain Waves', 'female', parts
    specs.append(cf_10)

    # ===========================================================================================================
    # SPIKY / HEROIC MALE HAIRSTYLES (10 styles: media_1793781538461_a4e2a5bd.jpg)
    # ===========================================================================================================
    def sp_m01():
        gid = 'hair_sp_m01_swept_spiky_crest'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=64, phi_temple_deg=86, phi_ear_deg=88,
                                   thick_crown=0.022, lobe_count=18, lobe_amp=0.004)]
        spikes = [
            ([0.0, -0.08, 1.77], [0.0, 0.01, 1.84], [0.0, 0.09, 1.82], 0.024),
            ([-0.03, -0.05, 1.76], [-0.06, 0.03, 1.81], [-0.09, 0.10, 1.77], 0.022),
            ([0.03, -0.05, 1.76], [0.06, 0.03, 1.81], [0.09, 0.10, 1.77], 0.022),
            ([-0.04, 0.01, 1.72], [-0.08, 0.07, 1.73], [-0.11, 0.12, 1.69], 0.020),
            ([0.04, 0.01, 1.72], [0.08, 0.07, 1.73], [0.11, 0.12, 1.69], 0.020),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        parts.extend(sculpt_curtain_tendrils(gid + '_bangs', p_str, z_root=1.752, z_tip=1.610, x_mid=0.056, x_tip=0.062, radius=0.015))
        return gid, 'Heroic Swept-Back Spiky Crest', 'male', parts
    specs.append(sp_m01)

    def sp_m02():
        gid = 'hair_sp_m02_long_wild_spiky_mane'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.455, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.022, thick_mid=0.026, bell_flare=0.022, lobe_count=20, lobe_amp=0.005),
        ]
        spikes = [
            ([0.0, -0.07, 1.77], [0.0, 0.02, 1.84], [0.0, 0.10, 1.80], 0.024),
            ([-0.04, -0.03, 1.75], [-0.09, 0.03, 1.78], [-0.13, 0.08, 1.72], 0.022),
            ([0.04, -0.03, 1.75], [0.09, 0.03, 1.78], [0.13, 0.08, 1.72], 0.022),
            ([-0.05, 0.02, 1.66], [-0.10, 0.06, 1.64], [-0.14, 0.09, 1.56], 0.020),
            ([0.05, 0.02, 1.66], [0.10, 0.06, 1.64], [0.14, 0.09, 1.56], 0.020),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Long Wild Spiky Layered Mane', 'male', parts
    specs.append(sp_m02)

    def sp_m03():
        gid = 'hair_sp_m03_undercut_long_swept_spikes'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
        ]
        spikes = [
            ([0.02, -0.09, 1.76], [-0.05, -0.14, 1.81], [-0.11, -0.12, 1.62], 0.024),
            ([0.02, -0.04, 1.78], [-0.06, -0.08, 1.83], [-0.12, -0.06, 1.58], 0.024),
            ([0.01, 0.01, 1.76], [-0.06, 0.01, 1.80], [-0.11, 0.04, 1.56], 0.022),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Undercut with Dramatic Swept Arc Spikes', 'male', parts
    specs.append(sp_m03)

    def sp_m04():
        gid = 'hair_sp_m04_radial_star_spikes'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=64, phi_temple_deg=86, phi_ear_deg=88, thick_crown=0.020)]
        spikes = [
            ([0.0, -0.05, 1.77], [0.0, 0.0, 1.85], [0.0, 0.05, 1.87], 0.022),
        ]
        for sgn in (-1.0, 1.0):
            spikes.extend([
                ([sgn * 0.03, -0.05, 1.76], [sgn * 0.08, -0.02, 1.82], [sgn * 0.13, 0.01, 1.80], 0.022),
                ([sgn * 0.05, 0.0, 1.72], [sgn * 0.10, 0.03, 1.74], [sgn * 0.15, 0.06, 1.71], 0.020),
                ([sgn * 0.04, 0.03, 1.66], [sgn * 0.09, 0.06, 1.65], [sgn * 0.13, 0.09, 1.61], 0.018),
            ])
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        parts.extend(sculpt_curtain_tendrils(gid + '_bangs', p_str, z_root=1.752, z_tip=1.595, x_mid=0.052, x_tip=0.058, radius=0.015))
        return gid, 'Radial Starburst Spiky Crop', 'male', parts
    specs.append(sp_m04)

    def sp_m05():
        gid = 'hair_sp_m05_high_arc_swept_spikes'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=84, phi_ear_deg=86, thick_crown=0.018)]
        spikes = [
            ([0.0, -0.09, 1.76], [0.0, 0.02, 1.86], [0.0, 0.14, 1.76], 0.026),
            ([-0.03, -0.07, 1.76], [-0.07, 0.01, 1.84], [-0.11, 0.12, 1.72], 0.024),
            ([0.03, -0.07, 1.76], [0.07, 0.01, 1.84], [0.11, 0.12, 1.72], 0.024),
            ([-0.02, -0.11, 1.75], [-0.07, -0.14, 1.76], [-0.10, -0.11, 1.62], 0.020),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'High Sweeping Arc Spikes', 'male', parts
    specs.append(sp_m05)

    def sp_m06():
        gid = 'hair_sp_m06_layered_wolf_shag'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.460, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.022, thick_mid=0.026, bell_flare=0.020, lobe_count=18, lobe_amp=0.005),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, [
            ([0.02, -0.11, 1.76], [-0.04, -0.15, 1.74], [-0.08, -0.13, 1.61], 0.020),
            ([-0.04, 0.0, 1.73], [-0.09, 0.04, 1.71], [-0.12, 0.07, 1.63], 0.018),
            ([0.04, 0.0, 1.73], [0.09, 0.04, 1.71], [0.12, 0.07, 1.63], 0.018),
        ]))
        return gid, 'Long Layered Spiky Wolf Shag', 'male', parts
    specs.append(sp_m06)

    def sp_m07():
        gid = 'hair_sp_m07_twin_high_spiky_tails'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=62, phi_temple_deg=86, phi_ear_deg=88,
                                   part_x=0.0, part_depth=0.008, thick_crown=0.018)]
        spikes = []
        for sgn in (-1.0, 1.0):
            spikes.extend([
                ([sgn * 0.04, 0.02, 1.75], [sgn * 0.10, 0.04, 1.83], [sgn * 0.15, 0.06, 1.66], 0.024),
                ([sgn * 0.04, 0.03, 1.74], [sgn * 0.11, 0.06, 1.78], [sgn * 0.14, 0.08, 1.59], 0.022),
            ])
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        parts.extend(sculpt_curtain_tendrils(gid + '_bangs', p_str, z_root=1.752, z_tip=1.585, x_mid=0.054, x_tip=0.060, radius=0.015))
        return gid, 'Twin High Fountain Spiky Tails', 'male', parts
    specs.append(sp_m07)

    def sp_m08():
        gid = 'hair_sp_m08_tiered_armored_spikes'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=86, phi_ear_deg=88, thick_crown=0.020),
            sculpt_flowing_mane(gid + '_nape', p_str, z_top=1.680, z_bot=1.460, theta_top_deg=70, theta_brow_deg=75,
                                theta_cheek_deg=80, tuck_behind_ears=True, thick_crown=0.018, thick_mid=0.022, bell_flare=0.014),
        ]
        spikes = [
            ([0.0, -0.10, 1.76], [0.0, -0.02, 1.83], [0.0, 0.06, 1.80], 0.026),
            ([0.0, -0.02, 1.75], [0.0, 0.06, 1.79], [0.0, 0.12, 1.73], 0.026),
            ([0.0, 0.03, 1.68], [0.0, 0.09, 1.70], [0.0, 0.13, 1.62], 0.024),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        parts.extend(sculpt_curtain_tendrils(gid + '_bangs', p_str, z_root=1.752, z_tip=1.475, x_mid=0.058, x_tip=0.064, radius=0.015))
        return gid, 'Tiered Chevron Spikes & Temple Locks', 'male', parts
    specs.append(sp_m08)

    def sp_m09():
        gid = 'hair_sp_m09_windswept_wavy_lion'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.475, theta_brow_deg=46, theta_cheek_deg=54,
                                thick_crown=0.024, thick_mid=0.030, bell_flare=0.026, wave_amp=0.008, wave_freq=5.5,
                                lobe_count=16, lobe_amp=0.005),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.755, z_tip=1.545, x_mid=0.068, x_tip=0.085, radius=0.018))
        return gid, 'Voluminous Windswept Wavy Lion Mane', 'male', parts
    specs.append(sp_m09)

    def sp_m10():
        gid = 'hair_sp_m10_braided_crown_spiky_mane'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_brd, phi_front_deg=60, phi_temple_deg=84, phi_ear_deg=86, thick_crown=0.016),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=20, th_end_deg=165,
                                        z_start=1.752, z_mid=1.725, z_end=1.685, radius=0.015))
        spikes = [
            ([0.0, 0.02, 1.76], [0.0, 0.10, 1.83], [0.0, 0.16, 1.52], 0.026),
            ([-0.04, 0.02, 1.75], [-0.09, 0.09, 1.80], [-0.12, 0.13, 1.54], 0.024),
            ([0.04, 0.02, 1.75], [0.09, 0.09, 1.80], [0.12, 0.13, 1.54], 0.024),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.715, z_bot=1.460, radius=0.012))
        parts.extend(sculpt_hanging_braid(gid + '_bbrd', p_brd, mode='back_center', z_top=1.720, z_bot=1.450, radius=0.018))
        return gid, 'Braided Crown & Tall Spiky Cascade', 'male', parts
    specs.append(sp_m10)

    # ===========================================================================================================
    # SPIKY / PUNK / UNDERCUT FEMALE HAIRSTYLES (10 styles: media_1793781598982_dd64d137.jpg)
    # ===========================================================================================================
    def sp_f01():
        gid = 'hair_sp_f01_tall_fanned_mohawk'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=134, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
        ]
        spikes = [
            ([0.0, -0.12, 1.74], [0.0, -0.13, 1.80], [0.0, -0.14, 1.85], 0.018),
            ([0.0, -0.07, 1.77], [0.0, -0.07, 1.83], [0.0, -0.07, 1.88], 0.020),
            ([0.0, -0.01, 1.78], [0.0, 0.0, 1.84], [0.0, 0.01, 1.88], 0.020),
            ([0.0, 0.04, 1.74], [0.0, 0.07, 1.78], [0.0, 0.10, 1.81], 0.018),
            ([0.0, 0.05, 1.66], [0.0, 0.09, 1.68], [0.0, 0.12, 1.69], 0.016),
            ([0.0, 0.04, 1.59], [0.0, 0.08, 1.59], [0.0, 0.10, 1.58], 0.014),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes, flatten=0.45))
        return gid, 'Tall Fanned Punk Mohawk', 'female', parts
    specs.append(sp_f01)

    def sp_f02():
        gid = 'hair_sp_f02_choppy_shaved_side_crop'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=68, phi_temple_deg=84, phi_ear_deg=86,
                              phi_nape_deg=138, thick_crown=0.022, lobe_count=22, lobe_amp=0.004),
        ]
        spikes = [
            ([0.02, -0.11, 1.75], [-0.03, -0.15, 1.73], [-0.06, -0.15, 1.65], 0.018),
            ([0.0, -0.05, 1.78], [-0.04, -0.04, 1.83], [-0.07, -0.02, 1.80], 0.018),
            ([-0.03, 0.0, 1.75], [-0.08, 0.02, 1.78], [-0.11, 0.04, 1.73], 0.018),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Choppy Shaved-Side Spiky Pixie', 'female', parts
    specs.append(sp_f02)

    def sp_f03():
        gid = 'hair_sp_f03_asym_swept_bob_undercut'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
            sculpt_scalp_dome(gid + '_top', p_str, phi_front_deg=60, phi_temple_deg=78, phi_ear_deg=82,
                              phi_nape_deg=122, thick_crown=0.022, lobe_count=18, lobe_amp=0.003),
        ]
        spikes = [
            ([0.03, -0.10, 1.76], [-0.04, -0.15, 1.75], [-0.08, -0.14, 1.60], 0.022),
            ([0.03, -0.05, 1.78], [-0.06, -0.11, 1.76], [-0.09, -0.10, 1.59], 0.024),
            ([0.02, 0.0, 1.77], [-0.07, -0.05, 1.75], [-0.09, -0.05, 1.61], 0.022),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Undercut with Asymmetric Swept Bob', 'female', parts
    specs.append(sp_f03)

    def sp_f04():
        gid = 'hair_sp_f04_urchin_crown_spikes'
        parts = [sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=64, phi_temple_deg=84, phi_ear_deg=86,
                                   phi_nape_deg=136, thick_crown=0.020)]
        spikes = [
            ([0.0, -0.06, 1.77], [0.0, -0.04, 1.84], [0.0, -0.02, 1.88], 0.020),
            ([-0.03, -0.04, 1.76], [-0.07, -0.02, 1.82], [-0.11, 0.0, 1.84], 0.019),
            ([0.03, -0.04, 1.76], [0.07, -0.02, 1.82], [0.11, 0.0, 1.84], 0.019),
            ([-0.04, 0.01, 1.73], [-0.09, 0.03, 1.77], [-0.13, 0.05, 1.77], 0.018),
            ([0.04, 0.01, 1.73], [0.09, 0.03, 1.77], [0.13, 0.05, 1.77], 0.018),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Explosive Urchin Crown Spikes', 'female', parts
    specs.append(sp_f04)

    def sp_f05():
        gid = 'hair_sp_f05_shaggy_wolf_mullet'
        parts = [
            sculpt_scalp_dome(gid + '_bangs', p_str, phi_front_deg=78, phi_temple_deg=88, phi_ear_deg=92,
                              phi_nape_deg=138, thick_crown=0.022, bangs_roll=0.006, lobe_count=22, lobe_amp=0.004),
            sculpt_flowing_mane(gid + '_mullet', p_str, z_bot=1.500, theta_top_deg=52, theta_brow_deg=60,
                                theta_cheek_deg=68, thick_crown=0.018, thick_mid=0.022, bell_flare=0.014,
                                lobe_count=20, lobe_amp=0.0045),
        ]
        return gid, 'Tousled Shaggy Wolf-Cut Mullet', 'female', parts
    specs.append(sp_f05)

    def sp_f06():
        gid = 'hair_sp_f06_carved_undercut_side_sweep'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
            sculpt_scalp_dome(gid + '_top', p_str, phi_front_deg=58, phi_temple_deg=74, phi_ear_deg=78,
                              phi_nape_deg=115, thick_crown=0.022, lobe_count=16, lobe_amp=0.003),
        ]
        spikes = [
            ([0.02, -0.10, 1.76], [-0.04, -0.15, 1.75], [-0.08, -0.14, 1.62], 0.022),
            ([0.02, -0.05, 1.78], [-0.06, -0.11, 1.76], [-0.09, -0.09, 1.62], 0.022),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Carved Undercut & Sleek Side Fringe', 'female', parts
    specs.append(sp_f06)

    def sp_f07():
        gid = 'hair_sp_f07_tousled_wavy_side_undercut'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
            sculpt_scalp_dome(gid + '_top', p_wav, phi_front_deg=60, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=134, thick_crown=0.022, wave_amp=0.004),
        ]
        spikes = [
            ([0.02, -0.10, 1.76], [-0.05, -0.15, 1.74], [-0.09, -0.13, 1.57], 0.024),
            ([0.02, -0.05, 1.78], [-0.07, -0.11, 1.75], [-0.10, -0.09, 1.57], 0.024),
            ([0.01, 0.0, 1.77], [-0.07, -0.04, 1.74], [-0.09, -0.03, 1.58], 0.022),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_wav, spikes))
        return gid, 'Shaved Side with Tousled Wavy Side Bob', 'female', parts
    specs.append(sp_f07)

    def sp_f08():
        gid = 'hair_sp_f08_cornrow_high_dread_tail'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
        ]
        for x_off in (-0.028, 0.0, 0.028):
            parts.append(
                sculpt_lock_tube(
                    f'{gid}_cr_{x_off:.3f}', p_brd,
                    [[x_off, -0.125, 1.740], [x_off, -0.055, 1.785], [x_off * 0.6, 0.025, 1.780],
                     [x_off * 1.1, 0.085, 1.745], [x_off * 1.3, 0.095, 1.600], [x_off * 1.4, 0.085, 1.460]],
                    [0.010, 0.013, 0.015, 0.016, 0.014, 0.007], braid_plait=True,
                )
            )
        return gid, 'Shaved Sides with Cornrow High Dread Tail', 'female', parts
    specs.append(sp_f08)

    def sp_f09():
        gid = 'hair_sp_f09_feathered_layered_shag'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.495, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.022, thick_mid=0.026, bell_flare=0.020, wave_amp=0.005,
                                lobe_count=20, lobe_amp=0.0045),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.750, z_tip=1.565, x_mid=0.064, x_tip=0.082, radius=0.017))
        return gid, 'Feathered Layered Winged Shag', 'female', parts
    specs.append(sp_f09)

    def sp_f10():
        gid = 'hair_sp_f10_sleek_angled_undercut_bob'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
            sculpt_scalp_dome(gid + '_bob', p_str, phi_front_deg=62, phi_temple_deg=86, phi_ear_deg=88,
                              phi_nape_deg=124, part_x=0.026, part_depth=0.008, thick_crown=0.020, wave_amp=0.0005),
        ]
        spikes = [
            ([0.024, -0.11, 1.755], [-0.042, -0.150, 1.735], [-0.075, -0.138, 1.565], 0.022),
            ([0.024, -0.07, 1.775], [-0.058, -0.120, 1.745], [-0.085, -0.105, 1.575], 0.022),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Undercut Nape with Sleek Angled Bob', 'female', parts
    specs.append(sp_f10)

    # ===========================================================================================================
    # BARBARIAN / RAIDER MALE HAIRSTYLES (10 styles: media_1793782026348_0aa60404.jpg)
    # ===========================================================================================================
    def barb_01():
        gid = 'hair_barb_01_spiked_fauxhawk_crest'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=134, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
        ]
        spikes = [
            ([0.0, -0.12, 1.74], [0.0, -0.11, 1.81], [0.0, -0.09, 1.86], 0.022),
            ([0.0, -0.06, 1.77], [0.0, -0.04, 1.84], [0.0, -0.01, 1.88], 0.024),
            ([0.0, 0.0, 1.77], [0.0, 0.04, 1.83], [0.0, 0.08, 1.85], 0.022),
            ([0.0, 0.04, 1.71], [0.0, 0.09, 1.74], [0.0, 0.12, 1.73], 0.020),
            ([0.0, 0.05, 1.63], [0.0, 0.09, 1.63], [0.0, 0.11, 1.59], 0.018),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes, flatten=0.55))
        return gid, 'Barbarian Spiked Mohawk Crest', 'male', parts
    specs.append(barb_01)

    def barb_02():
        gid = 'hair_barb_02_braided_temple_lion_mane'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.410, theta_top_deg=35, theta_brow_deg=54,
                                theta_cheek_deg=62, tuck_behind_ears=True, thick_crown=0.022, thick_mid=0.026,
                                bell_flare=0.022, wave_amp=0.006),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_fbrd', p_brd, mode='temple_thin', z_top=1.720, z_bot=1.415, radius=0.014))
        return gid, 'Swept Barbarian Mane & Temple Braids', 'male', parts
    specs.append(barb_02)

    def barb_03():
        gid = 'hair_barb_03_shaved_left_sweep_braid'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
            sculpt_lock_tube(gid + '_sweep', p_str,
                             [[0.0, -0.095, 1.768], [0.038, -0.128, 1.762], [0.072, -0.115, 1.705], [0.078, -0.098, 1.635]],
                             [0.018, 0.024, 0.022, 0.016], flatten=0.65),
            sculpt_lock_tube(gid + '_braid', p_brd,
                             [[0.078, -0.098, 1.640], [0.076, -0.092, 1.565], [0.074, -0.088, 1.485], [0.072, -0.085, 1.425]],
                             [0.015, 0.015, 0.013, 0.005], braid_plait=True),
        ]
        return gid, 'Shaved Scalp with Swept Forelock Braid', 'male', parts
    specs.append(barb_03)

    def barb_04():
        gid = 'hair_barb_04_chevron_crown_braid_mane'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.410, theta_brow_deg=52, theta_cheek_deg=60,
                                tuck_behind_ears=True, thick_crown=0.020, thick_mid=0.026, bell_flare=0.022, wave_amp=0.006),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=15, th_end_deg=178,
                                        z_start=1.748, z_mid=1.718, z_end=1.685, radius=0.018))
        return gid, 'Chevron Crown Braids & Raider Mane', 'male', parts
    specs.append(barb_04)

    def barb_05():
        gid = 'hair_barb_05_spiky_warrior_mullet'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.415, theta_top_deg=55, theta_brow_deg=64,
                                theta_cheek_deg=70, tuck_behind_ears=True, thick_crown=0.020, thick_mid=0.025,
                                bell_flare=0.020, wave_amp=0.006),
        ]
        spikes = [
            ([0.0, -0.10, 1.76], [0.0, -0.04, 1.83], [0.0, 0.02, 1.85], 0.022),
            ([-0.03, -0.08, 1.75], [-0.06, -0.03, 1.81], [-0.09, 0.02, 1.82], 0.020),
            ([0.03, -0.08, 1.75], [0.06, -0.03, 1.81], [0.09, 0.02, 1.82], 0.020),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Spiky Warrior Crown & Long Mullet Mane', 'male', parts
    specs.append(barb_05)

    def barb_06():
        gid = 'hair_barb_06_split_twin_fan_crest'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=134, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
        ]
        spikes = []
        for sgn in (-1.0, 1.0):
            spikes.extend([
                ([sgn * 0.015, -0.10, 1.75], [sgn * 0.065, -0.08, 1.82], [sgn * 0.125, -0.05, 1.83], 0.022),
                ([sgn * 0.015, -0.04, 1.77], [sgn * 0.070, -0.01, 1.83], [sgn * 0.130, 0.03, 1.82], 0.022),
                ([sgn * 0.015, 0.02, 1.75], [sgn * 0.060, 0.06, 1.79], [sgn * 0.110, 0.10, 1.76], 0.020),
            ])
        parts.extend(sculpt_spike_cluster(gid, p_str, spikes))
        return gid, 'Split Twin Winged Fan Crest', 'male', parts
    specs.append(barb_06)

    def barb_07():
        gid = 'hair_barb_07_asym_sweep_multi_braids'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.415, theta_top_deg=65, theta_brow_deg=72,
                                theta_cheek_deg=76, tuck_behind_ears=True, thick_crown=0.018, thick_mid=0.023, bell_flare=0.018),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_wav, [
            ([0.02, -0.10, 1.76], [-0.05, -0.14, 1.75], [-0.09, -0.11, 1.48], 0.022),
        ]))
        parts.extend(sculpt_hanging_braid(gid + '_c_brd', p_brd, mode='back_center', z_top=1.700, z_bot=1.415, radius=0.019))
        parts.extend(sculpt_hanging_braid(gid + '_t_brd', p_brd, mode='twin_back', z_top=1.710, z_bot=1.420, radius=0.015))
        return gid, 'Side-Swept Raider Mane & Triple Back Braids', 'male', parts
    specs.append(barb_07)

    def barb_08():
        gid = 'hair_barb_08_short_spiky_rattail_braid'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=70, phi_temple_deg=82, phi_ear_deg=84,
                              phi_nape_deg=134, thick_crown=0.018, bangs_roll=0.005, lobe_count=24, lobe_amp=0.0035),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_tail', p_brd, mode='back_center', z_top=1.630, z_bot=1.460,
                                          radius=0.016, with_cuff=True, cuff_paint=p_gld))
        return gid, 'Short Spiky Crop with Nape Braid Tail', 'male', parts
    specs.append(barb_08)

    def barb_09():
        gid = 'hair_barb_09_undercut_tousled_side_fringe'
        parts = [
            sculpt_scalp_dome(gid + '_stubble', p_stb, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              phi_nape_deg=132, thick_crown=0.003, thick_front=0.002, thick_side=0.002, thick_nape=0.002),
        ]
        spikes = [
            ([0.02, -0.10, 1.76], [-0.05, -0.15, 1.75], [-0.09, -0.14, 1.62], 0.022),
            ([0.02, -0.05, 1.78], [-0.06, -0.11, 1.77], [-0.10, -0.09, 1.63], 0.022),
            ([0.01, 0.01, 1.77], [-0.06, -0.02, 1.76], [-0.09, 0.01, 1.64], 0.020),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_wav, spikes))
        return gid, 'High Undercut with Tousled Raider Fringe', 'male', parts
    specs.append(barb_09)

    def barb_10():
        gid = 'hair_barb_10_half_topknot_braided_mane'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.405, theta_brow_deg=52, theta_cheek_deg=60,
                                tuck_behind_ears=True, thick_crown=0.019, thick_mid=0.025, bell_flare=0.020, wave_amp=0.006),
        ]
        parts.extend(sculpt_bun(gid + '_knot', p_wav, center=(0.0, 0.020, 1.792), axis=(0.0, 0.45, 0.89),
                                radius_xy=0.032, height=0.034, messy_amp=0.005))
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.440, x_mid=0.062, x_tip=0.075, radius=0.015))
        return gid, 'Barbarian Topknot & Flowing Wavy Mane', 'male', parts
    specs.append(barb_10)

    # ===========================================================================================================
    # MODERN / CYBER / TAPER-FADE MALE HAIRSTYLES (10 styles: media_1793782230138_6659b891.jpg)
    # ===========================================================================================================
    def cyb_01():
        gid = 'hair_cyb_01_slashed_undercut_fringe'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=62, phi_temple_deg=80, phi_ear_deg=84,
                              phi_nape_deg=130, part_x=0.032, part_depth=0.009, thick_crown=0.020, thick_side=0.006),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, [
            ([0.025, -0.105, 1.760], [-0.035, -0.152, 1.745], [-0.068, -0.145, 1.655], 0.020),
            ([0.025, -0.065, 1.778], [-0.045, -0.125, 1.765], [-0.078, -0.115, 1.675], 0.020),
        ]))
        return gid, 'Slashed Taper Undercut & Swept Fringe', 'male', parts
    specs.append(cyb_01)

    def cyb_02():
        gid = 'hair_cyb_02_long_textured_side_fringe'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=62, phi_temple_deg=80, phi_ear_deg=84,
                              phi_nape_deg=134, thick_crown=0.022, thick_side=0.006, lobe_count=20, lobe_amp=0.0035),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, [
            ([0.030, -0.105, 1.760], [-0.045, -0.155, 1.745], [-0.085, -0.142, 1.615], 0.022),
            ([0.025, -0.060, 1.780], [-0.058, -0.125, 1.760], [-0.092, -0.110, 1.630], 0.022),
        ]))
        return gid, 'Textured Undercut with Long Side Fringe', 'male', parts
    specs.append(cyb_02)

    def cyb_03():
        gid = 'hair_cyb_03_spiky_fauxhawk_fade'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=80, phi_ear_deg=84,
                              phi_nape_deg=132, thick_crown=0.022, thick_side=0.007, lobe_count=22, lobe_amp=0.004),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, [
            ([0.0, -0.115, 1.750], [0.0, -0.125, 1.805], [0.0, -0.110, 1.835], 0.020),
            ([0.0, -0.065, 1.775], [0.0, -0.055, 1.825], [0.0, -0.035, 1.845], 0.022),
            ([0.0, -0.010, 1.778], [0.0, 0.015, 1.820], [0.0, 0.040, 1.830], 0.020),
        ]))
        return gid, 'Taper Fade with Textured Spiky Quiff', 'male', parts
    specs.append(cyb_03)

    def cyb_04():
        gid = 'hair_cyb_04_curtain_wolf_mullet'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=64, phi_temple_deg=88, phi_ear_deg=90,
                              phi_nape_deg=138, part_x=0.0, part_depth=0.008, thick_crown=0.022, lobe_count=20, lobe_amp=0.004),
            sculpt_flowing_mane(gid + '_nape', p_str, z_top=1.685, z_bot=1.510, theta_top_deg=80, theta_brow_deg=85,
                                theta_cheek_deg=90, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.020, bell_flare=0.012),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_str, z_root=1.752, z_tip=1.595, x_mid=0.058, x_tip=0.068, radius=0.016))
        return gid, 'Textured Curtain Wolf-Cut Mullet', 'male', parts
    specs.append(cyb_04)

    def cyb_05():
        gid = 'hair_cyb_05_blunt_caesar_temple_slash'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=76, phi_temple_deg=80, phi_ear_deg=84,
                              phi_nape_deg=130, part_x=0.042, part_depth=0.009,
                              thick_crown=0.017, thick_front=0.016, thick_side=0.006, bangs_roll=0.005, lobe_count=24, lobe_amp=0.0025),
        ]
        return gid, 'Blunt Caesar Crop with Carved Temple Line', 'male', parts
    specs.append(cyb_05)

    def cyb_06():
        gid = 'hair_cyb_06_slicked_back_pompadour_undercut'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=56, phi_temple_deg=78, phi_ear_deg=82,
                              phi_nape_deg=128, widow_peak_deg=3.0, thick_crown=0.028, thick_front=0.026,
                              thick_side=0.006, thick_nape=0.014, lobe_count=20, lobe_amp=0.003),
        ]
        return gid, 'High Undercut Slicked-Back Pompadour', 'male', parts
    specs.append(cyb_06)

    def cyb_07():
        gid = 'hair_cyb_07_spiky_flat_top_twin_braids'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=78, phi_ear_deg=82,
                              phi_nape_deg=128, thick_crown=0.026, thick_front=0.024, thick_side=0.005,
                              lobe_count=28, lobe_amp=0.004),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_bbrd', p_brd, mode='twin_back', z_top=1.720, z_bot=1.500, radius=0.013))
        return gid, 'Spiky Crop Fade with Twin Rear Braids', 'male', parts
    specs.append(cyb_07)

    def cyb_08():
        gid = 'hair_cyb_08_two_tone_textured_bowl_fringe'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=82, phi_temple_deg=88, phi_ear_deg=88,
                              phi_nape_deg=134, part_x=0.0, part_depth=0.007,
                              thick_crown=0.022, thick_front=0.022, thick_side=0.016, bangs_roll=0.010,
                              lobe_count=22, lobe_amp=0.004),
        ]
        return gid, 'Heavy Textured Forward Bowl Fringe', 'male', parts
    specs.append(cyb_08)

    def cyb_09():
        gid = 'hair_cyb_09_sweeping_asym_undercut'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=78, phi_ear_deg=82,
                              phi_nape_deg=128, thick_crown=0.022, thick_side=0.006),
        ]
        parts.extend(sculpt_spike_cluster(gid, p_str, [
            ([0.028, -0.105, 1.760], [-0.045, -0.155, 1.750], [-0.082, -0.140, 1.620], 0.022),
            ([0.025, -0.065, 1.778], [-0.055, -0.125, 1.765], [-0.088, -0.112, 1.635], 0.022),
        ]))
        return gid, 'High Fade with Sweeping Curved Fringe', 'male', parts
    specs.append(cyb_09)

    def cyb_10():
        gid = 'hair_cyb_10_carved_line_quiff_fade'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=78, phi_ear_deg=82,
                              phi_nape_deg=130, part_x=0.038, part_depth=0.010,
                              thick_crown=0.026, thick_front=0.026, thick_side=0.006, lobe_count=20, lobe_amp=0.0035),
        ]
        return gid, 'Carved Temple Line & Upward Quiff Fade', 'male', parts
    specs.append(cyb_10)

    # ===========================================================================================================
    # EAST ASIAN / MODERN NATURAL MALE HAIRSTYLES (10 styles: media_1793782492431_a022e915.jpg)
    # ===========================================================================================================
    def ea_01():
        gid = 'hair_ea_01_short_textured_spiky_crop'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=74, phi_temple_deg=84, phi_sideburn_deg=108,
                              phi_ear_deg=84, phi_nape_deg=134, widow_peak_deg=2.0,
                              thick_crown=0.020, thick_front=0.018, thick_side=0.012, bangs_roll=0.006,
                              lobe_count=26, lobe_amp=0.0035),
        ]
        return gid, 'Short Textured Spiky Fringe Crop', 'male', parts
    specs.append(ea_01)

    def ea_02():
        gid = 'hair_ea_02_parted_wavy_shoulder_lob'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.485, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.019, thick_mid=0.024, bell_flare=0.016, wave_amp=0.005, wave_freq=5.0),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.545, x_mid=0.062, x_tip=0.072, radius=0.015))
        return gid, 'Center-Parted Wavy Shoulder Lob', 'male', parts
    specs.append(ea_02)

    def ea_03():
        gid = 'hair_ea_03_long_parted_flowing_waves'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.405, theta_brow_deg=48, theta_cheek_deg=56,
                                thick_crown=0.019, thick_mid=0.024, bell_flare=0.022, wave_amp=0.006, wave_freq=5.5),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.495, x_mid=0.064, x_tip=0.078, radius=0.015))
        return gid, 'Long Center-Parted Flowing Waves', 'male', parts
    specs.append(ea_03)

    def ea_04():
        gid = 'hair_ea_04_wispy_curtain_low_bun'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=88, phi_ear_deg=90,
                              phi_nape_deg=136, part_x=0.0, part_depth=0.008, thick_crown=0.017),
        ]
        parts.extend(sculpt_bun(gid + '_bun', p_wav, center=(0.0, 0.062, 1.595), axis=(0.0, 0.90, -0.42),
                                radius_xy=0.036, height=0.036, messy_amp=0.005, with_cuff=True, cuff_paint=p_str))
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.748, z_tip=1.555, x_mid=0.062, x_tip=0.068, radius=0.014))
        return gid, 'Wispy Curtain Locks & Low Tied Bun', 'male', parts
    specs.append(ea_04)

    def ea_05():
        gid = 'hair_ea_05_sleek_low_over_shoulder_plait'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=86, phi_ear_deg=88,
                              phi_nape_deg=136, part_x=0.0, part_depth=0.007, thick_crown=0.016),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_plait', p_brd, mode='left_shoulder', z_top=1.625, z_bot=1.425, radius=0.020))
        return gid, 'Parted Hair with Low Over-Shoulder Plait', 'male', parts
    specs.append(ea_05)

    def ea_06():
        gid = 'hair_ea_06_full_cornrow_braid_locks'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_brd, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.008, thick_crown=0.014),
        ]
        parts.extend(sculpt_ringlet_array(gid, p_brd, z_top=1.740, z_bot=1.445, theta_start_deg=48, n_locks=14,
                                          radius=0.014, curl_amp=0.0, curl_turns=0.0, flare_out=0.016))
        return gid, 'Braided Cornrows & Shoulder Locks', 'male', parts
    specs.append(ea_06)

    def ea_07():
        gid = 'hair_ea_07_half_topknot_wavy_shoulder'
        parts = [
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.455, theta_top_deg=45, theta_brow_deg=56,
                                theta_cheek_deg=64, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.022,
                                bell_flare=0.018, wave_amp=0.005),
        ]
        parts.extend(sculpt_bun(gid + '_knot', p_wav, center=(0.0, 0.008, 1.796), axis=(0.0, 0.30, 0.95),
                                radius_xy=0.028, height=0.030, messy_amp=0.003))
        return gid, 'High Topknot Bun & Wavy Shoulder Hair', 'male', parts
    specs.append(ea_07)

    def ea_08():
        gid = 'hair_ea_08_parted_feathered_ear_curtains'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=62, phi_temple_deg=88, phi_ear_deg=92,
                              phi_nape_deg=138, part_x=0.0, part_depth=0.008, thick_crown=0.020, thick_nape=0.020,
                              wave_amp=0.0035, cover_ears=False),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.750, z_tip=1.625, x_mid=0.064, x_tip=0.074, radius=0.017))
        return gid, 'Center-Parted Feathered Ear-Length Curtains', 'male', parts
    specs.append(ea_08)

    def ea_09():
        gid = 'hair_ea_09_sleek_tucked_straight_mane'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.007, thick_crown=0.016, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.455, theta_top_deg=45, theta_brow_deg=58,
                                theta_cheek_deg=68, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.020,
                                bell_flare=0.012, wave_amp=0.0008, lobe_amp=0.0012),
        ]
        return gid, 'Sleek Tucked Straight Shoulder Hair', 'male', parts
    specs.append(ea_09)

    def ea_10():
        gid = 'hair_ea_10_tousled_layered_curtain_shag'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_wav, phi_front_deg=64, phi_temple_deg=90, phi_ear_deg=94,
                              phi_nape_deg=138, part_x=0.0, part_depth=0.008, thick_crown=0.022, thick_nape=0.022,
                              wave_amp=0.004, lobe_count=20, lobe_amp=0.0035),
            sculpt_flowing_mane(gid + '_nape', p_wav, z_top=1.690, z_bot=1.535, theta_top_deg=72, theta_brow_deg=78,
                                theta_cheek_deg=82, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.020,
                                bell_flare=0.010, wave_amp=0.004),
        ]
        parts.extend(sculpt_curtain_tendrils(gid + '_curt', p_wav, z_root=1.750, z_tip=1.595, x_mid=0.062, x_tip=0.072, radius=0.017))
        return gid, 'Tousled Layered Medium Curtain Shag', 'male', parts
    specs.append(ea_10)

    # ===========================================================================================================
    # MESOAMERICAN / ANDEAN MALE & FEMALE HAIRSTYLES (10 styles: media_1793782742562_e02ac89b.jpg)
    # ===========================================================================================================
    def meso_01():
        gid = 'hair_meso_01_cropped_fringe_cap'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=78, phi_temple_deg=84, phi_sideburn_deg=108,
                              phi_ear_deg=86, phi_nape_deg=134, widow_peak_deg=0.0,
                              thick_crown=0.018, thick_front=0.017, bangs_roll=0.007, lobe_count=24, lobe_amp=0.0025),
        ]
        return gid, 'Mesoamerican Cropped Fringe Cap', 'male', parts
    specs.append(meso_01)

    def meso_02():
        gid = 'hair_meso_02_parted_jaw_bob'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=60, phi_temple_deg=84, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.008, thick_crown=0.016, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_bob', p_str, z_bot=1.535, theta_top_deg=42, theta_brow_deg=56,
                                theta_cheek_deg=66, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.020,
                                bell_flare=0.012, wave_amp=0.001, lobe_amp=0.0015),
        ]
        return gid, 'Parted Tucked Jaw-Length Straight Bob', 'male', parts
    specs.append(meso_02)

    def meso_03():
        gid = 'hair_meso_03_temilotl_half_topknot_mane'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.007, thick_crown=0.016),
            sculpt_flowing_mane(gid + '_mane', p_str, z_bot=1.450, theta_top_deg=48, theta_brow_deg=58,
                                theta_cheek_deg=66, tuck_behind_ears=True, thick_crown=0.016, thick_mid=0.021,
                                bell_flare=0.016, wave_amp=0.002),
        ]
        parts.extend(sculpt_bun(gid + '_knot', p_str, center=(0.0, 0.028, 1.775), axis=(0.0, 0.65, 0.76),
                                radius_xy=0.028, height=0.026, messy_amp=0.001, with_cuff=True, cuff_paint=p_str))
        return gid, 'Bound Crown Knot & Straight Shoulder Mane', 'male', parts
    specs.append(meso_03)

    def meso_04():
        gid = 'hair_meso_04_stepped_three_tier_male'
        parts = [
            sculpt_flowing_mane(gid + '_tier1', p_str, z_bot=1.475, theta_brow_deg=52, theta_cheek_deg=58,
                                thick_crown=0.015, thick_mid=0.017, thick_bot=0.017, bell_flare=0.010, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_tier2', p_str, z_bot=1.550, theta_brow_deg=48, theta_cheek_deg=52,
                                thick_crown=0.017, thick_mid=0.022, thick_bot=0.021, bell_flare=0.012, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_tier3', p_str, z_bot=1.622, theta_brow_deg=44, theta_cheek_deg=46,
                                thick_crown=0.019, thick_mid=0.026, thick_bot=0.024, bell_flare=0.010, wave_amp=0.0005),
        ]
        return gid, 'Stepped Three-Tier Noble Cut (Male)', 'male', parts
    specs.append(meso_04)

    def meso_05():
        gid = 'hair_meso_05_sleek_parted_back_braid'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                              phi_nape_deg=134, part_x=0.0, part_depth=0.008, thick_crown=0.016, wave_amp=0.0005),
        ]
        parts.extend(sculpt_hanging_braid(gid + '_braid', p_brd, mode='back_center', z_top=1.655, z_bot=1.440, radius=0.020))
        return gid, 'Center-Parted Sleek Rear Braid', 'male', parts
    specs.append(meso_05)

    def meso_06():
        gid = 'hair_meso_06_stepped_three_tier_female'
        parts = [
            sculpt_flowing_mane(gid + '_tier1', p_str, z_bot=1.455, theta_brow_deg=50, theta_cheek_deg=56,
                                thick_crown=0.016, thick_mid=0.018, thick_bot=0.018, bell_flare=0.012, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_tier2', p_str, z_bot=1.540, theta_brow_deg=46, theta_cheek_deg=50,
                                thick_crown=0.018, thick_mid=0.023, thick_bot=0.022, bell_flare=0.014, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_tier3', p_str, z_bot=1.618, theta_brow_deg=42, theta_cheek_deg=44,
                                thick_crown=0.020, thick_mid=0.027, thick_bot=0.025, bell_flare=0.012, wave_amp=0.0005),
        ]
        return gid, 'Stepped Three-Tier Noble Cut (Female)', 'female', parts
    specs.append(meso_06)

    def meso_07():
        gid = 'hair_meso_07_high_bound_flowing_mane'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=82, phi_ear_deg=86,
                              part_x=0.0, part_depth=0.007, thick_crown=0.016),
            sculpt_flowing_mane(gid + '_mane', p_wav, z_bot=1.440, theta_top_deg=46, theta_brow_deg=56,
                                theta_cheek_deg=64, tuck_behind_ears=True, thick_crown=0.018, thick_mid=0.024,
                                bell_flare=0.018, wave_amp=0.004),
        ]
        parts.extend(sculpt_bun(gid + '_tie', p_str, center=(0.0, 0.024, 1.780), axis=(0.0, 0.55, 0.83),
                                radius_xy=0.030, height=0.024, cylindrical=True, messy_amp=0.001, with_cuff=True, cuff_paint=p_str))
        return gid, 'High Crown-Bound Cascading Mane', 'female', parts
    specs.append(meso_07)

    def meso_08():
        gid = 'hair_meso_08_sleek_parted_low_ponytail'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                              phi_nape_deg=134, part_x=0.0, part_depth=0.008, thick_crown=0.016, wave_amp=0.0005),
            sculpt_lock_tube(gid + '_tail', p_str,
                             [[0.0, 0.056, 1.595], [0.0, 0.072, 1.545], [0.0, 0.075, 1.465]],
                             [0.018, 0.024, 0.012], flatten=0.80, rib_amp=0.10),
        ]
        parts.extend(sculpt_bun(gid + '_cuff', p_str, center=(0.0, 0.058, 1.598), axis=(0.0, 0.85, -0.52),
                                radius_xy=0.019, height=0.014, cylindrical=True, messy_amp=0.0))
        return gid, 'Sleek Center-Parted Low Nape Ponytail', 'female', parts
    specs.append(meso_08)

    def meso_09():
        gid = 'hair_meso_09_parted_twin_looped_braids'
        parts = [
            sculpt_scalp_dome(gid + '_dome', p_str, phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=86,
                              phi_nape_deg=134, part_x=0.0, part_depth=0.008, thick_crown=0.016),
        ]
        parts.extend(sculpt_crown_braid(gid + '_cbrd', p_brd, th_start_deg=45, th_end_deg=175,
                                        z_start=1.725, z_mid=1.675, z_end=1.605, radius=0.018))
        parts.extend(sculpt_hanging_braid(gid + '_sbrd', p_brd, mode='twin_shoulder', z_top=1.620, z_bot=1.450, radius=0.018))
        return gid, 'Parted Crown-Looped Twin Shoulder Braids', 'female', parts
    specs.append(meso_09)

    def meso_10():
        gid = 'hair_meso_10_stepped_fringe_shoulder_bob'
        parts = [
            sculpt_scalp_dome(gid + '_bangs', p_str, phi_front_deg=80, phi_temple_deg=88, phi_ear_deg=92,
                              phi_nape_deg=128, widow_peak_deg=0.0, part_x=0.0, part_depth=0.007,
                              thick_crown=0.018, thick_front=0.018, bangs_roll=0.008, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_bob', p_str, z_bot=1.485, theta_brow_deg=46, theta_cheek_deg=52,
                                thick_crown=0.017, thick_mid=0.022, thick_bot=0.021, bell_flare=0.010,
                                pageboy_roll=0.012, wave_amp=0.0005),
            sculpt_flowing_mane(gid + '_step', p_str, z_bot=1.635, theta_brow_deg=40, theta_cheek_deg=44,
                                thick_crown=0.019, thick_mid=0.025, thick_bot=0.024, bell_flare=0.008, wave_amp=0.0005),
        ]
        return gid, 'Stepped Brow Fringe & Shoulder Bob', 'female', parts
    specs.append(meso_10)

    def meso_11():
        gid = 'hair_meso_11_tzintzun_ringed_ponytail'
        p_gld = P_gold()
        parts = [
            sculpt_scalp_dome(
                gid + '_dome', p_str,
                phi_front_deg=54, phi_temple_deg=80, phi_sideburn_deg=104,
                phi_ear_deg=86, phi_nape_deg=134, widow_peak_deg=4.0,
                thick_crown=0.017, thick_front=0.015, thick_side=0.015, thick_nape=0.014,
                wave_amp=0.0035, lobe_count=26, lobe_amp=0.0028, cover_ears=False
            ),
            # Bound rising crown stem
            sculpt_lock_tube(
                gid + '_stem', p_str,
                [[0.0, 0.010, 1.756], [0.0, 0.024, 1.782], [0.0, 0.040, 1.806], [0.0, 0.058, 1.824]],
                [0.034, 0.028, 0.026, 0.028],
                flatten=0.92, rib_amp=0.14, rib_freq=8.0, rows=16, n_ring=16
            ),
            # Central thick arched ponytail plume
            sculpt_lock_tube(
                gid + '_plume_mid', p_str,
                [[0.0, 0.056, 1.822], [0.0, 0.088, 1.836], [0.0, 0.126, 1.792],
                 [0.0, 0.148, 1.710], [0.0, 0.154, 1.625], [0.0, 0.146, 1.558]],
                [0.026, 0.034, 0.038, 0.034, 0.024, 0.009],
                flatten=0.78, rib_amp=0.16, rib_freq=7.0, rows=24, n_ring=14
            ),
            # Upper-crest arched lock
            sculpt_lock_tube(
                gid + '_plume_top', p_str,
                [[0.0, 0.054, 1.825], [0.0, 0.086, 1.848], [0.0, 0.132, 1.812],
                 [0.0, 0.160, 1.732], [0.0, 0.166, 1.648], [0.0, 0.158, 1.585]],
                [0.018, 0.024, 0.026, 0.022, 0.015, 0.006],
                flatten=0.72, rib_amp=0.18, rib_freq=6.0, rows=22, n_ring=12
            ),
        ]
        # Left and right fanned outer locks for rich multi-clump silhouette
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            parts.append(sculpt_lock_tube(
                f'{gid}_plume_{tag}1', p_str,
                [[sgn * 0.008, 0.056, 1.820], [sgn * 0.018, 0.088, 1.832],
                 [sgn * 0.028, 0.126, 1.786], [sgn * 0.032, 0.148, 1.702],
                 [sgn * 0.028, 0.152, 1.620], [sgn * 0.020, 0.144, 1.562]],
                [0.018, 0.024, 0.027, 0.024, 0.017, 0.007],
                flatten=0.76, rib_amp=0.16, rib_freq=6.0, rows=22, n_ring=12
            ))
            parts.append(sculpt_lock_tube(
                f'{gid}_plume_{tag}2', p_str,
                [[sgn * 0.012, 0.058, 1.814], [sgn * 0.026, 0.088, 1.818],
                 [sgn * 0.040, 0.120, 1.768], [sgn * 0.044, 0.138, 1.690],
                 [sgn * 0.038, 0.140, 1.615], [sgn * 0.028, 0.132, 1.572]],
                [0.014, 0.019, 0.021, 0.019, 0.014, 0.006],
                flatten=0.74, rib_amp=0.15, rib_freq=5.0, rows=20, n_ring=10
            ))
        # 4 stacked metallic gold ring hairbands clasping the rising crown stem
        ring_specs = [
            ((0.0, 0.016, 1.768), (0.0, 0.54, 0.84), 0.033, 0.011),
            ((0.0, 0.026, 1.784), (0.0, 0.56, 0.83), 0.030, 0.011),
            ((0.0, 0.038, 1.800), (0.0, 0.58, 0.81), 0.029, 0.011),
            ((0.0, 0.050, 1.815), (0.0, 0.62, 0.78), 0.030, 0.012),
        ]
        for r_idx, (rc, rax, r_rad, r_h) in enumerate(ring_specs):
            c_arr = np.asarray(rc, dtype=np.float64)
            ax_arr = np.asarray(rax, dtype=np.float64)
            ax_arr /= np.linalg.norm(ax_arr)
            u_vec = np.array([1.0, 0.0, 0.0])
            v_vec = np.cross(ax_arr, u_vec)
            v_vec /= np.linalg.norm(v_vec)
            G_ring = np.zeros((7, 20, 3))
            phis_r = np.linspace(0.0, 2.0 * math.pi, 20, endpoint=False)
            for i_r, tv in enumerate(np.linspace(0.0, 1.0, 7)):
                hc = (tv - 0.5) * r_h
                # Torus-like outward bulge on each gold ring
                rr = r_rad + 0.0045 * math.sin(tv * math.pi)
                for j_r, phi in enumerate(phis_r):
                    G_ring[i_r, j_r] = c_arr + ax_arr * hc + (u_vec * math.cos(phi) + v_vec * math.sin(phi)) * rr
            parts.append(_make_part(f'{gid}_ring{r_idx}', G_ring, p_gld, wrap_u=True, wrap_v=False, Rigid='Head', use_trunk=False))
        return gid, 'Tzintzun High-Bound Ringed Ponytail', 'male', parts
    specs.append(meso_11)

    return specs


# ---------------------------------------------------------------------------------------------------------------
# Additional 26 Facial Hair Styles (5 Chichani Mustaches + 10 Sci-Fi/Geometric + 10 East Asian + Axeman Stache Fix)
# ---------------------------------------------------------------------------------------------------------------
def build_extra_beard_specs():
    import build_facial_hair as bfh
    sculpt_beard_mass = bfh.sculpt_beard_mass
    sculpt_soul_patch = bfh.sculpt_soul_patch
    sculpt_mustache = bfh.sculpt_mustache

    p_str = P_hair('hair_strands')
    p_wav = P_hair('hair_waves')
    p_stb = P_hair('hair_strands', base='hair_stubble', light='hair_light', dark='hair_base')

    specs = []

    # 1. Neutral/tintable rebuild of rustic_m_axeman_stache (no floating eyebrow dots, clean handlebar mustache!)
    def fix_axeman_stache():
        gid = 'rustic_m_axeman_stache'
        parts = sculpt_mustache(gid, p_str, span_x=0.044, z_center=1.615, thick=0.013, height=0.016,
                                droop=0.008, flare_out=0.008, curl_loops=0.95)
        return gid, 'Axeman Handlebar Mustache', parts
    specs.append(fix_axeman_stache)

    # ===========================================================================================================
    # CHICHANI MUSTACHES (5 styles: media_1793781323579_dae90c98.jpg — specifically including Mustache 4!)
    # ===========================================================================================================
    def cm_b01():
        gid = 'beard_cm_01_thin_droop_stache'
        parts = sculpt_mustache(gid, p_str, span_x=0.036, z_center=1.615, thick=0.008, height=0.011,
                                droop=0.022, flare_out=0.004)
        return gid, 'Chichani Thin Drooping Mustache', parts
    specs.append(cm_b01)

    def cm_b02():
        gid = 'beard_cm_02_full_swept_chevron'
        parts = sculpt_mustache(gid, p_str, span_x=0.048, z_center=1.615, thick=0.015, height=0.020,
                                droop=0.016, flare_out=0.008)
        return gid, 'Chichani Full Swept Chevron Mustache', parts
    specs.append(cm_b02)

    def cm_b03():
        gid = 'beard_cm_03_fine_curled_handlebar'
        parts = sculpt_mustache(gid, p_str, span_x=0.044, z_center=1.615, thick=0.011, height=0.014,
                                droop=0.010, flare_out=0.008, curl_loops=1.10)
        return gid, 'Chichani Fine Curled Handlebar Mustache', parts
    specs.append(cm_b03)

    def cm_b04():
        # MUSTACHE 4: Thick arched mustache curving sharply downward into twin pointed fang tails reaching the bottom of the chin
        gid = 'beard_cm_04_arched_fang_horseshoe'
        parts = sculpt_mustache(gid, p_str, span_x=0.036, z_center=1.616, thick=0.014, height=0.018,
                                droop=0.016, flare_out=0.002, hang_tail_len=0.048, hang_tail_x=0.028)
        return gid, 'Chichani Arched Fang Mustache (Style 4)', parts
    specs.append(cm_b04)

    def cm_b05():
        gid = 'beard_cm_05_wide_flared_imperial'
        parts = sculpt_mustache(gid, p_str, span_x=0.052, z_center=1.615, thick=0.013, height=0.016,
                                droop=0.012, flare_out=0.012, curl_up=0.008)
        return gid, 'Chichani Wide Flared Mustache', parts
    specs.append(cm_b05)

    # ===========================================================================================================
    # SHEET 7: Sci-Fi / Precision-Line / Geometric Facial Hair (10 styles: media_1793782262586_0424d694.jpg)
    # ===========================================================================================================
    def s7_01():
        gid = 'beard_s7_01_slashed_cheek_boxed'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=74, z_side_top=1.630, z_cheek_mid=1.594,
                              z_chin_top=1.580, length=0.014, thick_top=0.003, thick_mid=0.009, thick_bot=0.011,
                              bottom_shape='wedge', point_drop=0.008),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.007, width_bot=0.004, z_top=1.594, z_bot=1.578, thick=0.007),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.036, z_center=1.614, thick=0.008, height=0.011, droop=0.012))
        return gid, 'Precision Slashed-Cheek Boxed Beard', parts
    specs.append(s7_01)

    def s7_02():
        gid = 'beard_s7_02_shadow_boxed_stubble'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_stb, theta_max_deg=74, z_side_top=1.632, z_cheek_mid=1.596,
                              z_chin_top=1.584, length=0.006, thick_top=0.0015, thick_mid=0.0035, thick_bot=0.004,
                              bottom_shape='round'),
            sculpt_soul_patch(gid + '_sp', p_stb, width_top=0.008, width_bot=0.005, z_top=1.594, z_bot=1.580, thick=0.0035),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_stb, span_x=0.036, z_center=1.614, thick=0.005, height=0.009, droop=0.010))
        return gid, 'Precision Shadow Boxed Stubble', parts
    specs.append(s7_02)

    def s7_03():
        gid = 'beard_s7_03_cupped_anchor_chin'
        parts = [
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=26, z_chin_top=1.580, length=0.012,
                              thick_top=0.003, thick_mid=0.008, thick_bot=0.010, bottom_shape='round'),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.006, width_bot=0.005, z_top=1.595, z_bot=1.576, thick=0.007),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.038, z_center=1.614, thick=0.007, height=0.010,
                                     droop=0.008, curl_up=0.004))
        return gid, 'Winged Mustache & Cupped Chin Anchor', parts
    specs.append(s7_03)

    def s7_04():
        gid = 'beard_s7_04_ultra_light_contour_stubble'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_stb, theta_max_deg=74, z_side_top=1.630, z_cheek_mid=1.594,
                              z_chin_top=1.582, length=0.004, thick_top=0.001, thick_mid=0.0022, thick_bot=0.0025,
                              bottom_shape='round'),
            sculpt_soul_patch(gid + '_sp', p_stb, width_top=0.007, width_bot=0.004, z_top=1.594, z_bot=1.582, thick=0.0022),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_stb, span_x=0.035, z_center=1.614, thick=0.0035, height=0.008, droop=0.009))
        return gid, 'Ultra-Light Designer Contour Stubble', parts
    specs.append(s7_04)

    def s7_05():
        gid = 'beard_s7_05_pointed_anchor_vandyke'
        parts = [
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=24, z_chin_top=1.580, length=0.016,
                              thick_top=0.003, thick_mid=0.008, thick_bot=0.010, bottom_shape='point', point_drop=0.012),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.006, width_bot=0.004, z_top=1.595, z_bot=1.576, thick=0.007),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.038, z_center=1.614, thick=0.007, height=0.009,
                                     droop=0.006, curl_up=0.006))
        return gid, 'Upturned Pencil Stache & Pointed Anchor', parts
    specs.append(s7_05)

    def s7_06():
        gid = 'beard_s7_06_mustacheless_jaw_strap'
        parts = [
            sculpt_beard_mass(gid + '_jaw', p_str, theta_max_deg=74, z_side_top=1.630, z_cheek_mid=1.590,
                              z_chin_top=1.580, length=0.012, thick_top=0.003, thick_mid=0.008, thick_bot=0.010,
                              bottom_shape='wedge', point_drop=0.006),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.007, width_bot=0.004, z_top=1.594, z_bot=1.578, thick=0.007),
        ]
        return gid, 'Geometric Chinstrap & Soul Patch (No Mustache)', parts
    specs.append(s7_06)

    def s7_07():
        gid = 'beard_s7_07_upturned_wing_pencil'
        parts = sculpt_mustache(gid, p_str, span_x=0.038, z_center=1.614, thick=0.006, height=0.008,
                                droop=0.005, flare_out=0.006, curl_up=0.007)
        return gid, 'Ultra-Fine Upturned Winged Pencil Mustache', parts
    specs.append(s7_07)

    def s7_08():
        gid = 'beard_s7_08_thick_chevron_soulpatch'
        parts = [
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.009, width_bot=0.003, z_top=1.594, z_bot=1.576, thick=0.008),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.040, z_center=1.615, thick=0.013, height=0.017, droop=0.012))
        return gid, 'Thick Chevron Mustache & Triangular Soul Patch', parts
    specs.append(s7_08)

    def s7_09():
        gid = 'beard_s7_09_angled_boxed_disconnected'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=74, z_side_top=1.630, z_cheek_mid=1.592,
                              z_chin_top=1.580, length=0.012, thick_top=0.003, thick_mid=0.009, thick_bot=0.010,
                              bottom_shape='round'),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.007, width_bot=0.004, z_top=1.594, z_bot=1.578, thick=0.007),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.035, z_center=1.614, thick=0.008, height=0.011, droop=0.010))
        return gid, 'Angled Boxed Beard & Disconnected Mustache', parts
    specs.append(s7_09)

    def s7_10():
        gid = 'beard_s7_10_split_pencil_chin_pillar'
        parts = [
            sculpt_soul_patch(gid + '_pillar', p_str, width_top=0.008, width_bot=0.009, z_top=1.594, z_bot=1.564, thick=0.008),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.032, z_center=1.613, thick=0.006, height=0.009, droop=0.009))
        return gid, 'Split Pencil Mustache & Vertical Chin Pillar', parts
    specs.append(s7_10)

    # ===========================================================================================================
    # SHEET 8: East Asian / Natural Facial Hair (10 styles: media_1793782505894_c8827469.jpg)
    # ===========================================================================================================
    def s8_01():
        gid = 'beard_s8_01_fine_shadow_mustache'
        parts = sculpt_mustache(gid, p_stb, span_x=0.032, z_center=1.614, thick=0.004, height=0.008, droop=0.009)
        return gid, 'Light Wispy Shadow Mustache', parts
    specs.append(s8_01)

    def s8_02():
        gid = 'beard_s8_02_upturned_handlebar_stache'
        parts = sculpt_mustache(gid, p_str, span_x=0.038, z_center=1.614, thick=0.008, height=0.011,
                                droop=0.007, flare_out=0.006, curl_up=0.007)
        return gid, 'Neat Upturned Handlebar Mustache', parts
    specs.append(s8_02)

    def s8_03():
        gid = 'beard_s8_03_light_goatee_stubble'
        parts = [
            sculpt_beard_mass(gid + '_chin', p_stb, theta_max_deg=34, z_chin_top=1.584, length=0.004,
                              thick_top=0.001, thick_mid=0.0025, thick_bot=0.003, bottom_shape='round'),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_stb, span_x=0.032, z_center=1.614, thick=0.0035, height=0.008, droop=0.009))
        return gid, 'Light Mustache & Chin Stubble Shadow', parts
    specs.append(s8_03)

    def s8_04():
        gid = 'beard_s8_04_short_circle_goatee'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=68, z_side_top=1.622, z_cheek_mid=1.592,
                              z_chin_top=1.582, length=0.008, thick_top=0.002, thick_mid=0.006, thick_bot=0.007,
                              bottom_shape='round'),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.007, width_bot=0.004, z_top=1.594, z_bot=1.580, thick=0.005),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.034, z_center=1.614, thick=0.007, height=0.010, droop=0.012))
        return gid, 'Short Trimmed Circle Goatee & Chinstrap', parts
    specs.append(s8_04)

    def s8_05():
        gid = 'beard_s8_05_trimmed_boxed_goatee'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=70, z_side_top=1.624, z_cheek_mid=1.594,
                              z_chin_top=1.582, length=0.014, thick_top=0.003, thick_mid=0.009, thick_bot=0.011,
                              bottom_shape='round'),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.008, width_bot=0.004, z_top=1.594, z_bot=1.578, thick=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.035, z_center=1.614, thick=0.008, height=0.011, droop=0.013))
        return gid, 'Fuller Trimmed Boxed Goatee Beard', parts
    specs.append(s8_05)

    def s8_06():
        gid = 'beard_s8_06_long_tufted_chin_goatee'
        parts = [
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=26, z_chin_top=1.582, length=0.028,
                              thick_top=0.003, thick_mid=0.010, thick_bot=0.012, bottom_shape='point', point_drop=0.018),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.008, width_bot=0.004, z_top=1.594, z_bot=1.578, thick=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.035, z_center=1.614, thick=0.008, height=0.011, droop=0.014))
        return gid, 'Mustache & Long Tufted Chin Goatee', parts
    specs.append(s8_06)

    def s8_07():
        gid = 'beard_s8_07_broad_square_chin_goatee'
        parts = [
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=32, z_chin_top=1.582, length=0.022,
                              thick_top=0.003, thick_mid=0.011, thick_bot=0.013, bottom_shape='flat'),
            sculpt_soul_patch(gid + '_sp', p_str, width_top=0.008, width_bot=0.005, z_top=1.594, z_bot=1.578, thick=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.036, z_center=1.614, thick=0.008, height=0.011, droop=0.015))
        return gid, 'Mustache & Broad Square Chin Goatee', parts
    specs.append(s8_07)

    def s8_08():
        gid = 'beard_s8_08_scruffy_jawline_beard'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=74, z_side_top=1.628, z_cheek_mid=1.596,
                              z_chin_top=1.582, length=0.020, thick_top=0.003, thick_mid=0.012, thick_bot=0.014,
                              bottom_shape='round', lobe_count=12, lobe_amp=0.002),
            sculpt_soul_patch(gid + '_sp', p_wav, width_top=0.008, width_bot=0.004, z_top=1.594, z_bot=1.578, thick=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_wav, span_x=0.036, z_center=1.614, thick=0.009, height=0.012, droop=0.014))
        return gid, 'Natural Scruffy Jawline & Chin Beard', parts
    specs.append(s8_08)

    def s8_09():
        gid = 'beard_s8_09_bushy_neck_full_beard'
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.632, z_cheek_mid=1.598,
                              z_chin_top=1.582, length=0.032, thick_top=0.004, thick_mid=0.016, thick_bot=0.020,
                              flare_x=0.008, bottom_shape='round', wave_amp=0.003, lobe_count=14, lobe_amp=0.003),
            sculpt_soul_patch(gid + '_sp', p_wav, width_top=0.009, width_bot=0.005, z_top=1.594, z_bot=1.578, thick=0.007),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_wav, span_x=0.038, z_center=1.614, thick=0.010, height=0.013, droop=0.015))
        return gid, 'Bushy Natural Jaw & Neck Full Beard', parts
    specs.append(s8_09)

    def s8_10():
        gid = 'beard_s8_10_thin_stache_soul_stripe'
        parts = [
            sculpt_soul_patch(gid + '_stripe', p_str, width_top=0.005, width_bot=0.004, z_top=1.594, z_bot=1.566, thick=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_st', p_str, span_x=0.033, z_center=1.614, thick=0.006, height=0.009, droop=0.010))
        return gid, 'Fine Mustache & Vertical Chin Soul Stripe', parts
    specs.append(s8_10)

    return specs


def _fix_library_mustaches():
    """Shift MakeHuman library mustaches whose rest Z max was recessed behind the upper lip (+0.008m forward in glTF Z)."""
    for gid in ('Moustace_Light', 'Moustace_Thick', 'grinsegold_moustache', 'rehmanpolanski_moustache_viking'):
        p_glb = ROOT / 'pieces' / 'mpfb_male' / f'{gid}.glb'
        if not p_glb.exists():
            continue
        j, b = glbio.read_glb(p_glb.read_bytes())
        binb = bytearray(b)
        prim = j['meshes'][0]['primitives'][0]
        ai = prim['attributes']['POSITION']
        acc = j['accessors'][ai]
        bv = j['bufferViews'][acc['bufferView']]
        pos = glbio.accessor(j, bytes(binb), ai).astype(np.float32).copy()
        # Only shift if max Z < 0.172 (so calling twice is idempotent!)
        if float(pos[:, 2].max()) < 0.172:
            pos[:, 2] += 0.008
            acc['min'] = [float(x) for x in pos.min(axis=0)]
            acc['max'] = [float(x) for x in pos.max(axis=0)]
            p_bytes = np.ascontiguousarray(pos, dtype=np.float32).tobytes()
            binb[bv['byteOffset']:bv['byteOffset'] + len(p_bytes)] = p_bytes
            js = json.dumps(j, separators=(',', ':')).encode()
            js += b' ' * ((-len(js)) % 4)
            with open(p_glb, 'wb') as f:
                f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
                f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))
            print(f'  Fixed recessed library mustache {gid}.glb -> new Z max = {pos[:, 2].max():.4f}')


def _transfer_hairs_to_female(hair_records):
    """Transfer all built male hair GLBs + morphs to mpfb_female using shared 13,307-vertex head correspondence."""
    from scipy.spatial import cKDTree

    jm_base, bm_base = glbio.read_glb((ROOT / 'pieces' / 'mpfb_male' / 'base.glb').read_bytes())
    jf_base, bf_base = glbio.read_glb((ROOT / 'pieces' / 'mpfb_female' / 'base.glb').read_bytes())
    bprim_m = next(p for m in jm_base['meshes'] for p in m['primitives']
                   if 'material' in p and jm_base['materials'][p['material']]['name'].endswith('.body'))
    bprim_f = next(p for m in jf_base['meshes'] for p in m['primitives']
                   if 'material' in p and jf_base['materials'][p['material']]['name'].endswith('.body'))

    Pm = glbio.accessor(jm_base, bm_base, bprim_m['attributes']['POSITION']).astype(np.float64)
    Pf = glbio.accessor(jf_base, bf_base, bprim_f['attributes']['POSITION']).astype(np.float64)
    BASE_JJ_F = glbio.accessor(jf_base, bf_base, bprim_f['attributes']['JOINTS_0']).astype(np.int32)
    BASE_WW_F = glbio.accessor(jf_base, bf_base, bprim_f['attributes']['WEIGHTS_0']).astype(np.float32)
    BASE_WW_F /= np.maximum(BASE_WW_F.sum(axis=1, keepdims=True), 1e-9)
    BASE_VIDX_F = np.rint(glbio.accessor(jf_base, bf_base, bprim_f['attributes']['_VIDX']).reshape(-1)).astype(np.int32)

    # Fit affine transform on head/neck vertices (Y > 1.50 in glTF) + smooth k-NN residual on cranial projection
    head_mask = Pm[:, 1] > 1.50
    A_m = np.column_stack([Pm[head_mask], np.ones(head_mask.sum())])
    T_aff, _, _, _ = np.linalg.lstsq(A_m, Pf[head_mask], rcond=None)
    res_all = Pf - (np.column_stack([Pm, np.ones(len(Pm))]) @ T_aff)
    tree_m = cKDTree(Pm)
    tree_f = cKDTree(Pf)

    # Female template GLB (for female skeleton nodes + inverseBindMatrices) and female base morph deltas
    tpl_f_j, tpl_f_b = glbio.read_glb((ROOT / 'pieces' / 'mpfb_female' / 'dalab_f_trade_cap.glb').read_bytes())
    skin_f_tpl = tpl_f_j['skins'][0]
    ibm_acc_f = tpl_f_j['accessors'][skin_f_tpl['inverseBindMatrices']]
    ibm_bv_f = tpl_f_j['bufferViews'][ibm_acc_f['bufferView']]
    ibm_bytes_f = bytes(tpl_f_b[ibm_bv_f['byteOffset']:ibm_bv_f['byteOffset'] + ibm_bv_f['byteLength']])
    rig_f = glbio.read_rig(str(ROOT / 'pieces' / 'mpfb_female' / 'dalab_f_trade_cap.glb'))
    neck_y_f = float(rig_f.jpos[rig_f.joints.index('Neck')][1])

    f_morph_ents = make_mpfb.unpack_morphs((ROOT / 'pieces' / 'mpfb_female' / 'base.morph.bin').read_bytes())
    n_targets_f = len(json.loads((ROOT / 'data' / 'mpfb_female' / 'kit.json').read_text(encoding='utf-8'))['morph']['targets'])
    BASE_MORPH_D_F = make_mpfb.dense_morphs(next(x for x in f_morph_ents if 'Human.body' in x[0]), n_targets_f)

    for gid, label, gender in hair_records:
        m_glb = ROOT / 'pieces' / 'mpfb_male' / f'{gid}.glb'
        j, b = glbio.read_glb(m_glb.read_bytes())
        binb = bytearray(b)

        # Replace skeleton nodes and inverseBindMatrices with mpfb_female's skeleton
        j['nodes'] = copy.deepcopy(tpl_f_j['nodes'])
        mesh_node = next(n for n in j['nodes'] if 'mesh' in n and 'skin' in n)
        mesh_node['name'] = gid
        ibm_acc = j['accessors'][j['skins'][0]['inverseBindMatrices']]
        ibm_bv = j['bufferViews'][ibm_acc['bufferView']]
        binb[ibm_bv['byteOffset']:ibm_bv['byteOffset'] + len(ibm_bytes_f)] = ibm_bytes_f

        # Transform vertex positions Pm -> Pf for every primitive
        for prim in j['meshes'][0]['primitives']:
            at = prim['attributes']
            ai_p = at['POSITION']
            acc_p = j['accessors'][ai_p]
            bv_p = j['bufferViews'][acc_p['bufferView']]
            pos_m = glbio.accessor(j, bytes(binb), ai_p).astype(np.float64)

            # Project query points toward the skull surface so inner & outer hair layers receive identical smooth residuals
            Q_m = pos_m.copy()
            Q_m[:, 1] = np.maximum(Q_m[:, 1], 1.56)
            r_xz = np.hypot(Q_m[:, 0], Q_m[:, 2] + 0.035)
            scale_r = np.where(r_xz > 1e-4, np.minimum(r_xz, 0.088) / np.maximum(r_xz, 1e-4), 1.0)
            Q_m[:, 0] *= scale_r
            Q_m[:, 2] = -0.035 + (Q_m[:, 2] + 0.035) * scale_r

            dists, idxs = tree_m.query(Q_m, k=12)
            w = np.exp(-(dists / 0.025) ** 2)
            w /= np.maximum(w.sum(axis=1, keepdims=True), 1e-9)
            res = (res_all[idxs] * w[:, :, None]).sum(axis=1)

            pos_f = ((np.column_stack([pos_m, np.ones(len(pos_m))]) @ T_aff) + res).astype(np.float32)
            acc_p['min'] = [float(x) for x in pos_f.min(axis=0)]
            acc_p['max'] = [float(x) for x in pos_f.max(axis=0)]
            p_bytes = np.ascontiguousarray(pos_f, dtype=np.float32).tobytes()
            binb[bv_p['byteOffset']:bv_p['byteOffset'] + len(p_bytes)] = p_bytes

            # Transform normals via inverse-transpose of T_aff[:3, :3]
            if 'NORMAL' in at:
                ai_n = at['NORMAL']
                bv_n = j['bufferViews'][j['accessors'][ai_n]['bufferView']]
                nrm_m = glbio.accessor(j, bytes(binb), ai_n).astype(np.float64)
                nrm_f = nrm_m @ np.linalg.inv(T_aff[:3, :3]).T
                nrm_f /= np.maximum(np.linalg.norm(nrm_f, axis=1, keepdims=True), 1e-9)
                n_bytes = np.ascontiguousarray(nrm_f.astype(np.float32)).tobytes()
                binb[bv_n['byteOffset']:bv_n['byteOffset'] + len(n_bytes)] = n_bytes

        # Recompute head weights on mpfb_female rig for any non-rigid primitives
        make_mpfb.head_weights(j, binb, neck_y_f + 0.02)

        f_glb = ROOT / 'pieces' / 'mpfb_female' / f'{gid}.glb'
        js = json.dumps(j, separators=(',', ':')).encode()
        js += b' ' * ((-len(js)) % 4)
        with open(f_glb, 'wb') as f:
            f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
            f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))

        # Build mpfb_female .morph.bin using projected cranial query on Pf
        prim0 = j['meshes'][0]['primitives'][0]
        pos0_f = glbio.accessor(j, bytes(binb), prim0['attributes']['POSITION']).astype(np.float64)
        vi_arr = np.rint(glbio.accessor(j, bytes(binb), prim0['attributes']['_VIDX']).reshape(-1)).astype(np.int32)
        Q_f = pos0_f.copy()
        Q_f[:, 1] = np.maximum(Q_f[:, 1], neck_y_f + 0.14)
        r_xz_f = np.hypot(Q_f[:, 0], Q_f[:, 2])
        scale_f = np.where(r_xz_f > 1e-4, np.minimum(r_xz_f, 0.080) / np.maximum(r_xz_f, 1e-4), 1.0)
        Q_f[:, 0] *= scale_f
        Q_f[:, 2] *= scale_f
        _, near_f = tree_f.query(Q_f)

        used_vi = np.unique(vi_arr)
        first_gi = np.zeros(int(used_vi.max()) + 1, dtype=np.int32)
        for gi, vi in enumerate(vi_arr):
            first_gi[vi] = gi
        base_vidx_for_vi = BASE_VIDX_F[near_f[first_gi[used_vi]]]
        D_garment = np.zeros((BASE_MORPH_D_F.shape[0], int(used_vi.max()) + 1, 3), dtype=np.float32)
        D_garment[:, used_vi, :] = BASE_MORPH_D_F[:, base_vidx_for_vi, :]
        mat_names = [m['name'] for m in j['materials']]
        morph_bytes = make_mpfb.pack_morphs([(gid, mat_names, used_vi)], {'d_' + gid: D_garment})
        (ROOT / 'pieces' / 'mpfb_female' / f'{gid}.morph.bin').write_bytes(morph_bytes)


def _head_pt(z, th_deg, clearance=0.002, cover_ears=False):
    """Return 3D point on mpfb_male head/face surface at height z and azimuth th_deg (0=front -Y, +90=left +X)."""
    th = math.radians(th_deg)
    d = np.array([math.sin(th), -math.cos(th), 0.0])
    if z > 1.688:
        r_c = cyl_r(z, th, cover_ears=cover_ears)
        p_cyl = np.array([0.0, -0.035, z]) + d * r_c
        vec = p_cyl - C_SKULL
        d_sph = vec / max(np.linalg.norm(vec), 1e-6)
        phi_s = math.acos(np.clip(d_sph[2], -1.0, 1.0))
        th_s = math.atan2(d_sph[0], -d_sph[1])
        r_sph = skull_r(phi_s, th_s, cover_ears=cover_ears)
        return C_SKULL + d_sph * (r_sph + clearance), d_sph
    else:
        c = np.array([0.0, -0.045, z])
        h = first_hit(c + d * 0.25, -d)
        r = (0.25 - h) if (h is not None and (0.25 - h) > 0.035) else cyl_r(z, th, cover_ears=cover_ears)
        return c + d * (r + clearance), d


def sculpt_dermal_plate(
    name, paint,
    th_min_deg, th_max_deg,
    z_top_fn, z_bot_fn,
    thick=0.0045,
    clearance=0.0018,
    cover_ears=False,
    rows=10, cols=18,
):
    """Build a 3D contoured cybernetic dermal armor plate conforming to the exact face/cranial surface."""
    us = np.linspace(0.0, 1.0, cols)
    vs = np.linspace(0.0, 1.0, rows)
    G_out = np.zeros((rows, cols, 3))
    G_in = np.zeros((rows, cols, 3))
    for j, u in enumerate(us):
        th_deg = th_min_deg + (th_max_deg - th_min_deg) * u
        zt = z_top_fn(u) if callable(z_top_fn) else float(z_top_fn)
        zb = z_bot_fn(u) if callable(z_bot_fn) else float(z_bot_fn)
        u_bevel = math.sin(min(u / 0.14, 1.0) * math.pi * 0.5) * math.sin(min((1.0 - u) / 0.14, 1.0) * math.pi * 0.5)
        for i, v in enumerate(vs):
            z = zt * (1.0 - v) + zb * v
            v_bevel = math.sin(min(v / 0.18, 1.0) * math.pi * 0.5) * math.sin(min((1.0 - v) / 0.18, 1.0) * math.pi * 0.5)
            bevel = max(0.18, (u_bevel * v_bevel) ** 0.55)
            p_in, n_out = _head_pt(z, th_deg, clearance=clearance - 0.001, cover_ears=cover_ears)
            G_in[i, j] = p_in
            G_out[i, j] = p_in + n_out * (0.001 + thick * bevel)
    G = np.concatenate([G_out, G_in[::-1]], axis=0)
    return _make_part(name, G, paint, wrap_u=False, wrap_v=True, Rigid='Head', use_trunk=False)


def sculpt_cyber_disc(name, housing_paint, glow_paint, center, normal, radius=0.015, thick=0.007, with_glow=True):
    """Build a 3D circular cybernetic temple node, jaw pivot bolt, or bionic ear comms-disc."""
    parts = []
    parts.extend(sculpt_bun(name + '_body', housing_paint, center=center, axis=normal,
                            radius_xy=radius, height=thick, cylindrical=True, messy_amp=0.0))
    if with_glow and glow_paint is not None:
        c_glow = np.asarray(center, float) + np.asarray(normal, float) / max(np.linalg.norm(normal), 1e-6) * (thick * 0.45)
        parts.extend(sculpt_bun(name + '_glow', glow_paint, center=c_glow, axis=normal,
                                radius_xy=radius * 0.62, height=thick * 0.48, cylindrical=True, messy_amp=0.0))
    return parts


def sculpt_ocular_unit(name, housing_paint, lens_paint, side='R', telescopic=False):
    """Build a 3D bionic eye monocle / multi-barrel telescopic ocular implant over the right (-X) or left (+X) eye."""
    sgn = 1.0 if side == 'L' else -1.0
    c_eye = np.array([sgn * 0.032, -0.135, 1.663])
    ax = np.array([sgn * 0.14, -0.98, 0.0])
    parts = []
    # Outer socket bezel ring
    parts.extend(sculpt_bun(name + '_bezel', housing_paint, center=c_eye, axis=ax,
                            radius_xy=0.023, height=0.014, cylindrical=True, messy_amp=0.0))
    if telescopic:
        c_mid = c_eye + ax * 0.010
        parts.extend(sculpt_bun(name + '_barrel', housing_paint, center=c_mid, axis=ax,
                                radius_xy=0.018, height=0.016, cylindrical=True, messy_amp=0.0))
        c_lens = c_eye + ax * 0.018
        parts.extend(sculpt_bun(name + '_lens', lens_paint, center=c_lens, axis=ax,
                                radius_xy=0.014, height=0.010, cylindrical=True, messy_amp=0.0))
    else:
        c_lens = c_eye + ax * 0.008
        parts.extend(sculpt_bun(name + '_lens', lens_paint, center=c_lens, axis=ax,
                                radius_xy=0.017, height=0.009, cylindrical=True, messy_amp=0.0))
    return parts


def sculpt_cyber_wire(name, paint, zt_pts, radius=0.0022, ribbed=False, sym=True):
    """Build 3D facial trace wires or ribbed Borg cranial neural cables from (z, th_deg, clearance) waypoints."""
    parts = []
    sides = [(-1.0, 'R'), (1.0, 'L')] if sym else [(1.0, 'S')]
    for sgn, tag in sides:
        ctrl = []
        rads = []
        for k, pt in enumerate(zt_pts):
            z, th_deg, clr = pt[0], pt[1] * sgn, pt[2]
            p, _ = _head_pt(z, th_deg, clearance=clr, cover_ears=(abs(th_deg) > 68))
            ctrl.append(p)
            rads.append(radius * (0.85 if (k == 0 or k == len(zt_pts) - 1) else 1.0))
        parts.append(
            sculpt_lock_tube(
                f'{name}_{tag}', paint, ctrl, rads,
                flatten=0.75 if not ribbed else 0.92,
                rib_amp=0.18 if ribbed else 0.0, rib_freq=8.0,
                braid_plait=ribbed, rows=16, n_ring=10,
            )
        )
    return parts


def build_cyber_implant_specs():
    """Build 30 3D cybernetic implants across the 3 reference sheets (10 High-Tech Porcelain, 10 Borg Industrial, 10 Tactical Titanium)."""
    p_porc = P('cyb_porc', 0.02, [B('bottom', 0.0, 1.0, 'cyber_porcelain', 'cyb_porc', 'cyb_silver', 0.15)], fabric='metal.gold')
    p_cyan = P('cyb_cyan', 0.01, [B('bottom', 0.0, 1.0, 'cyber_cyan_glow', 'cyb_cyan', 'cyb_porc', 0.10)], fabric='silk')
    p_gun  = P('cyb_gun', 0.04, [B('bottom', 0.0, 1.0, 'cyber_gunmetal', 'cyb_gun', 'cyb_dark', 0.20)], fabric='metal.iron')
    p_cab  = P('cyb_dark', 0.05, [B('bottom', 0.0, 1.0, 'cyber_cable', 'cyb_gun', 'cyb_dark', 0.25)], fabric='leather.smooth')
    p_tit  = P('cyb_titan', 0.03, [B('bottom', 0.0, 1.0, 'cyber_titanium', 'cyb_titan', 'cyb_gun', 0.15)], fabric='metal.iron')

    specs = []

    def _build_sheet_archetypes(sheet_idx, prefix, label_prefix, p_main, p_accent, p_wire, with_cables=False, tactical_variants=False):
        with_glow = (sheet_idx == 1)

        # 1: Temple Neural Arcs + Cheek Trace Wires
        def imp_01():
            gid = f'{prefix}_01_temple_neural_arcs'
            parts = []
            for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                parts.append(sculpt_dermal_plate(
                    f'{gid}_arch_{tag}', p_main, sgn * 56.0, sgn * 116.0,
                    lambda u: 1.696 - 0.016 * ((u - 0.35) ** 2),
                    lambda u: 1.674 - 0.020 * ((u - 0.35) ** 2),
                    thick=0.0055, cover_ears=True,
                ))
                p_node, n_node = _head_pt(1.682, sgn * 62.0, clearance=0.005)
                parts.extend(sculpt_cyber_disc(f'{gid}_nd_{tag}', p_main, p_accent, p_node, n_node, radius=0.012, thick=0.007, with_glow=with_glow))
            parts.extend(sculpt_cyber_wire(f'{gid}_wire', p_wire, [
                (1.678, 60.0, 0.004), (1.656, 48.0, 0.003), (1.640, 36.0, 0.0025), (1.622, 26.0, 0.002)
            ], radius=0.0020))
            if with_cables:
                parts.extend(sculpt_cyber_wire(f'{gid}_cab1', p_wire, [
                    (1.686, 85.0, 0.006), (1.678, 115.0, 0.007), (1.655, 140.0, 0.006)
                ], radius=0.0045, ribbed=True))
                parts.extend(sculpt_cyber_wire(f'{gid}_cab2', p_wire, [
                    (1.676, 88.0, 0.006), (1.662, 118.0, 0.007), (1.638, 142.0, 0.006)
                ], radius=0.0045, ribbed=True))
            return gid, f'{label_prefix} Temple Neural Arcs', parts
        specs.append(imp_01)

        # 2: Forehead Diadem / Transceiver Bridge + Temple Pods
        def imp_02():
            gid = f'{prefix}_02_brow_diadem_bridge'
            parts = [
                sculpt_dermal_plate(f'{gid}_brow', p_main, -62.0, 62.0,
                                    lambda u: 1.706 + 0.005 * math.sin(u * math.pi),
                                    lambda u: 1.688 - 0.004 * math.sin(u * math.pi),
                                    thick=0.0055),
            ]
            p_fc, n_fc = _head_pt(1.697, 0.0, clearance=0.006)
            parts.extend(sculpt_cyber_disc(f'{gid}_fcore', p_main, p_accent, p_fc, n_fc, radius=0.013, thick=0.006, with_glow=with_glow))
            for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                parts.append(sculpt_dermal_plate(
                    f'{gid}_tarch_{tag}', p_main, sgn * 58.0, sgn * 118.0,
                    lambda u: 1.696 - 0.018 * (u ** 1.4),
                    lambda u: 1.676 - 0.022 * (u ** 1.4),
                    thick=0.0055, cover_ears=True,
                ))
                p_tn, n_tn = _head_pt(1.684, sgn * 64.0, clearance=0.006)
                parts.extend(sculpt_cyber_disc(f'{gid}_tnd_{tag}', p_main, p_accent, p_tn, n_tn, radius=0.012, thick=0.007, with_glow=with_glow))
            if with_cables:
                parts.extend(sculpt_cyber_wire(f'{gid}_cab', p_wire, [
                    (1.684, 92.0, 0.006), (1.670, 122.0, 0.007), (1.645, 148.0, 0.006)
                ], radius=0.005, ribbed=True))
            return gid, f'{label_prefix} Forehead Diadem Bridge', parts
        specs.append(imp_02)

        # 3: Right Ocular Monocle + Jaw Harness (or Articulated Chin/Mandible Guard on Sheet 3)
        def imp_03():
            if tactical_variants:
                gid = f'{prefix}_03_articulated_chin_mandible'
                parts = [
                    sculpt_dermal_plate(f'{gid}_jaw', p_main, -74.0, 74.0,
                                        lambda u: 1.576 + 0.056 * (abs(u - 0.5) * 2.0) ** 1.4,
                                        lambda u: 1.558 + 0.048 * (abs(u - 0.5) * 2.0) ** 1.5,
                                        thick=0.0065),
                ]
                for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                    p_jn, n_jn = _head_pt(1.628, sgn * 72.0, clearance=0.005)
                    parts.extend(sculpt_cyber_disc(f'{gid}_jhinge_{tag}', p_main, p_accent, p_jn, n_jn, radius=0.011, thick=0.007, with_glow=False))
                return gid, f'{label_prefix} Articulated Mandible Guard', parts

            gid = f'{prefix}_03_right_ocular_jaw_harness'
            parts = [
                # Right cranial & brow shell
                sculpt_dermal_plate(f'{gid}_rcowl', p_main, -135.0, -8.0,
                                    lambda u: 1.745 - 0.025 * ((u - 0.5) ** 2),
                                    lambda u: 1.682 - 0.055 * (1.0 - u) ** 1.6,
                                    thick=0.006, cover_ears=True),
                # Full cybernetic mandible chinstrap
                sculpt_dermal_plate(f'{gid}_jaw', p_main, -76.0, 76.0,
                                    lambda u: 1.575 + 0.058 * (abs(u - 0.5) * 2.0) ** 1.4,
                                    lambda u: 1.558 + 0.048 * (abs(u - 0.5) * 2.0) ** 1.5,
                                    thick=0.006),
            ]
            parts.extend(sculpt_ocular_unit(f'{gid}_eye', p_main, p_accent, side='R', telescopic=False))
            p_chin, n_chin = _head_pt(1.566, 0.0, clearance=0.006)
            parts.extend(sculpt_cyber_disc(f'{gid}_chin_core', p_main, p_accent, p_chin, n_chin, radius=0.010, thick=0.006, with_glow=with_glow))
            if with_cables:
                for z_off in (0.0, -0.016, -0.032):
                    parts.extend(sculpt_cyber_wire(f'{gid}_rcab_{z_off:.3f}', p_wire, [
                        (1.725 + z_off, -35.0, 0.008), (1.715 + z_off, -85.0, 0.009),
                        (1.675 + z_off, -130.0, 0.009), (1.615 + z_off * 0.5, -155.0, 0.007)
                    ], radius=0.0065, ribbed=True, sym=False))
            return gid, f'{label_prefix} Right Ocular & Jaw Harness', parts
        specs.append(imp_03)

        # 4: Infraorbital Under-Eye Cheek Wires & Temple Pods
        def imp_04():
            gid = f'{prefix}_04_infraorbital_cheek_wires'
            parts = []
            for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                parts.append(sculpt_dermal_plate(
                    f'{gid}_tpod_{tag}', p_main, sgn * 56.0, sgn * 92.0,
                    lambda u: 1.676 - 0.010 * u,
                    lambda u: 1.658 - 0.010 * u,
                    thick=0.005, cover_ears=False,
                ))
                p_tn, n_tn = _head_pt(1.668, sgn * 62.0, clearance=0.005)
                parts.extend(sculpt_cyber_disc(f'{gid}_tnd_{tag}', p_main, p_accent, p_tn, n_tn, radius=0.009, thick=0.006, with_glow=with_glow))
            parts.extend(sculpt_cyber_wire(f'{gid}_uwire', p_wire, [
                (1.666, 58.0, 0.004), (1.644, 42.0, 0.003), (1.638, 26.0, 0.0025), (1.646, 14.0, 0.0025)
            ], radius=0.0020))
            return gid, f'{label_prefix} Infraorbital Cheek Wires', parts
        specs.append(imp_04)

        # 5: Left Hemisphere Cortex Armor Plate (or Brow Bridge & Temple Plates on Sheet 3)
        def imp_05():
            if tactical_variants:
                gid = f'{prefix}_05_brow_bridge_temple_plates'
                parts = [
                    sculpt_dermal_plate(f'{gid}_fblock', p_main, -18.0, 18.0, 1.708, 1.688, thick=0.006),
                ]
                for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                    parts.append(sculpt_dermal_plate(
                        f'{gid}_tplate_{tag}', p_main, sgn * 36.0, sgn * 105.0,
                        lambda u: 1.700 - 0.016 * (u ** 1.3),
                        lambda u: 1.678 - 0.018 * (u ** 1.3),
                        thick=0.0055, cover_ears=True,
                    ))
                parts.extend(sculpt_cyber_wire(f'{gid}_rod', p_wire, [
                    (1.698, 16.0, 0.004), (1.696, 38.0, 0.004)
                ], radius=0.0022))
                return gid, f'{label_prefix} Brow Bridge & Temple Plates', parts

            gid = f'{prefix}_05_left_hemisphere_cortex_plate'
            parts = [
                # Left forehead-to-occiput cranial & cheek plate
                sculpt_dermal_plate(f'{gid}_lcortex', p_main, 6.0, 145.0,
                                    lambda u: 1.748 - 0.032 * (u ** 1.5),
                                    lambda u: 1.682 - 0.068 * math.sin(u * math.pi * 0.75),
                                    thick=0.0065, cover_ears=True),
                # Left cheek-to-jaw extension
                sculpt_dermal_plate(f'{gid}_lcheek', p_main, 42.0, 82.0, 1.680, 1.575, thick=0.006),
            ]
            p_ln, n_ln = _head_pt(1.682, 58.0, clearance=0.007)
            parts.extend(sculpt_cyber_disc(f'{gid}_lnd', p_main, p_accent, p_ln, n_ln, radius=0.012, thick=0.007, with_glow=with_glow))
            p_rn, n_rn = _head_pt(1.680, -64.0, clearance=0.005)
            parts.extend(sculpt_cyber_disc(f'{gid}_rnd', p_main, p_accent, p_rn, n_rn, radius=0.011, thick=0.007, with_glow=with_glow))
            if with_cables:
                for idx_c, z0 in enumerate((1.740, 1.720, 1.700, 1.680)):
                    parts.extend(sculpt_cyber_wire(f'{gid}_lcab{idx_c}', p_wire, [
                        (z0, 42.0, 0.008), (z0 - 0.012, 92.0, 0.010), (z0 - 0.038, 138.0, 0.009), (z0 - 0.075, 165.0, 0.007)
                    ], radius=0.0068, ribbed=True, sym=False))
            return gid, f'{label_prefix} Left Hemisphere Cortex Plate', parts
        specs.append(imp_05)

        # 6: Symmetric Mandible & Cheekbone Exoshell
        def imp_06():
            gid = f'{prefix}_06_mandible_cheek_exoshell'
            parts = [
                sculpt_dermal_plate(f'{gid}_jaw', p_main, -76.0, 76.0,
                                    lambda u: 1.576 + 0.068 * (abs(u - 0.5) * 2.0) ** 1.25,
                                    lambda u: 1.558 + 0.048 * (abs(u - 0.5) * 2.0) ** 1.45,
                                    thick=0.0065),
            ]
            for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                parts.append(sculpt_dermal_plate(
                    f'{gid}_cheek_{tag}', p_main, sgn * 38.0, sgn * 76.0,
                    lambda u: 1.648 + 0.024 * u,
                    lambda u: 1.622 + 0.018 * u,
                    thick=0.0055,
                ))
                p_tn, n_tn = _head_pt(1.678, sgn * 66.0, clearance=0.006)
                parts.extend(sculpt_cyber_disc(f'{gid}_tnd_{tag}', p_main, p_accent, p_tn, n_tn, radius=0.011, thick=0.007, with_glow=with_glow))
                p_jn, n_jn = _head_pt(1.602, sgn * 58.0, clearance=0.006)
                parts.extend(sculpt_cyber_disc(f'{gid}_jnd_{tag}', p_main, p_accent, p_jn, n_jn, radius=0.010, thick=0.006, with_glow=with_glow))
            p_chin, n_chin = _head_pt(1.566, 0.0, clearance=0.006)
            parts.extend(sculpt_cyber_disc(f'{gid}_chin', p_main, p_accent, p_chin, n_chin, radius=0.010, thick=0.006, with_glow=with_glow))
            return gid, f'{label_prefix} Mandible & Cheekbone Exoshell', parts
        specs.append(imp_06)

        # 7: Left Telescopic Ocular Crown (or Parietal Skull Plates on Sheet 3)
        def imp_07():
            if tactical_variants:
                gid = f'{prefix}_07_parietal_skull_plates'
                parts = []
                for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                    parts.append(sculpt_dermal_plate(
                        f'{gid}_par_{tag}', p_main, sgn * 52.0, sgn * 148.0,
                        lambda u: 1.745 - 0.022 * (u ** 1.5),
                        lambda u: 1.682 - 0.055 * (u ** 1.3),
                        thick=0.0065, cover_ears=False,
                    ))
                return gid, f'{label_prefix} Parietal Skull Armor Plates', parts

            gid = f'{prefix}_07_left_telescopic_ocular_crown'
            parts = [
                sculpt_dermal_plate(f'{gid}_cowl', p_main, -95.0, 140.0,
                                    lambda u: 1.746 - 0.022 * ((u - 0.55) ** 2),
                                    lambda u: 1.686 - 0.048 * max(0.0, u - 0.45) ** 1.4,
                                    thick=0.0065, cover_ears=True),
            ]
            parts.extend(sculpt_ocular_unit(f'{gid}_leye', p_main, p_accent, side='L', telescopic=True))
            for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                p_tn, n_tn = _head_pt(1.682, sgn * 64.0, clearance=0.007)
                parts.extend(sculpt_cyber_disc(f'{gid}_tnd_{tag}', p_main, p_accent, p_tn, n_tn, radius=0.011, thick=0.007, with_glow=with_glow))
            if with_cables:
                for idx_c, z0 in enumerate((1.742, 1.722, 1.702, 1.682)):
                    parts.extend(sculpt_cyber_wire(f'{gid}_lcab{idx_c}', p_wire, [
                        (z0, 38.0, 0.008), (z0 - 0.012, 90.0, 0.010), (z0 - 0.038, 136.0, 0.009), (z0 - 0.072, 165.0, 0.007)
                    ], radius=0.0068, ribbed=True, sym=False))
            return gid, f'{label_prefix} Left Telescopic Ocular Crown', parts
        specs.append(imp_07)

        # 8: Bionic Ear Comms-Discs / Turbines / Exoskeletal Ear Cuffs
        def imp_08():
            gid = f'{prefix}_08_bionic_ear_comms_discs'
            parts = []
            for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                c_ear = np.array([sgn * 0.082, -0.042, 1.655])
                n_ear = np.array([sgn * 0.98, -0.18, 0.0])
                parts.extend(sculpt_cyber_disc(f'{gid}_disc_{tag}', p_main, p_accent, c_ear, n_ear,
                                               radius=0.028 if not tactical_variants else 0.024,
                                               thick=0.012, with_glow=with_glow))
                # Forward cheekbone sensor spur
                parts.append(sculpt_dermal_plate(
                    f'{gid}_spur_{tag}', p_main, sgn * 50.0, sgn * 76.0,
                    lambda u: 1.658 + 0.006 * u,
                    lambda u: 1.646 - 0.006 * u,
                    thick=0.0055,
                ))
            return gid, f'{label_prefix} Bionic Ear Comms Pods', parts
        specs.append(imp_08)

        # 9: Right Telescopic Ocular Arch (or Nasal-Bridge & Cheek Guard on Sheet 3)
        def imp_09():
            if tactical_variants:
                gid = f'{prefix}_09_nasal_bridge_cheek_guard'
                parts = [
                    sculpt_dermal_plate(f'{gid}_nasal', p_main, -52.0, 52.0,
                                        lambda u: 1.658 + 0.014 * math.exp(-((u - 0.5) / 0.16) ** 2) - 0.012 * math.sin(abs(u - 0.5) * math.pi),
                                        lambda u: 1.638 + 0.010 * math.exp(-((u - 0.5) / 0.16) ** 2) - 0.012 * math.sin(abs(u - 0.5) * math.pi),
                                        thick=0.0055),
                ]
                return gid, f'{label_prefix} Nasal Bridge & Cheek Guard', parts

            gid = f'{prefix}_09_right_telescopic_ocular_arch'
            parts = [
                sculpt_dermal_plate(f'{gid}_rarch', p_main, -132.0, -6.0,
                                    lambda u: 1.738 - 0.028 * ((u - 0.5) ** 2),
                                    lambda u: 1.682 - 0.045 * (1.0 - u) ** 1.5,
                                    thick=0.0065, cover_ears=True),
            ]
            parts.extend(sculpt_ocular_unit(f'{gid}_reye', p_main, p_accent, side='R', telescopic=True))
            p_rn, n_rn = _head_pt(1.682, -62.0, clearance=0.007)
            parts.extend(sculpt_cyber_disc(f'{gid}_rnd', p_main, p_accent, p_rn, n_rn, radius=0.011, thick=0.007, with_glow=with_glow))
            p_ln, n_ln = _head_pt(1.668, 62.0, clearance=0.005)
            parts.extend(sculpt_cyber_disc(f'{gid}_lnd', p_main, p_accent, p_ln, n_ln, radius=0.009, thick=0.006, with_glow=with_glow))
            if with_cables:
                for idx_c, z0 in enumerate((1.735, 1.715, 1.695)):
                    parts.extend(sculpt_cyber_wire(f'{gid}_rcab{idx_c}', p_wire, [
                        (z0, -38.0, 0.008), (z0 - 0.012, -90.0, 0.010), (z0 - 0.038, -136.0, 0.009), (z0 - 0.070, -162.0, 0.007)
                    ], radius=0.0068, ribbed=True, sym=False))
            return gid, f'{label_prefix} Right Telescopic Ocular Arch', parts
        specs.append(imp_09)

        # 10: Twin Brow-to-Jawbone Outer Face Frames (or Asymmetric Right Brow & Mandible Plates on Sheet 3)
        def imp_10():
            gid = f'{prefix}_10_brow_cheek_dermal_frames'
            parts = []
            for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
                th_inner = 12.0 if (tactical_variants and sgn < 0) else 22.0
                parts.append(sculpt_dermal_plate(
                    f'{gid}_brow_{tag}', p_main, sgn * th_inner, sgn * 108.0,
                    lambda u: 1.714 - 0.024 * (u ** 1.4),
                    lambda u: 1.690 - 0.024 * (u ** 1.4),
                    thick=0.006, cover_ears=True,
                ))
                parts.append(sculpt_dermal_plate(
                    f'{gid}_cheek_{tag}', p_main, sgn * 46.0, sgn * 66.0,
                    1.690, 1.615, thick=0.0055,
                ))
                if not tactical_variants or sgn < 0:
                    parts.append(sculpt_dermal_plate(
                        f'{gid}_jaw_{tag}', p_main, sgn * 28.0, sgn * 64.0,
                        lambda u: 1.615 - 0.028 * (1.0 - u),
                        lambda u: 1.592 - 0.028 * (1.0 - u),
                        thick=0.0055,
                    ))
            if with_cables:
                parts.extend(sculpt_cyber_wire(f'{gid}_cab', p_wire, [
                    (1.692, 92.0, 0.006), (1.675, 122.0, 0.007), (1.650, 146.0, 0.006)
                ], radius=0.005, ribbed=True))
            return gid, f'{label_prefix} Brow & Jawbone Dermal Frames', parts
        specs.append(imp_10)

    _build_sheet_archetypes(1, 'implant_s1', 'Luminescent', p_porc, p_cyan, p_porc, with_cables=False, tactical_variants=False)
    _build_sheet_archetypes(2, 'implant_s2', 'Industrial', p_gun, p_gun, p_cab, with_cables=True, tactical_variants=False)
    _build_sheet_archetypes(3, 'implant_s3', 'Tactical', p_tit, p_tit, p_tit, with_cables=False, tactical_variants=True)
    return specs


def _split_hair_primitives(glb_path, parts, gid):
    """Split a hairstyle GLB into a tintable hair primitive (named gid) and an untinted accessory primitive (gold/jade/pin)."""
    acc_flags = [bool(p.paint.get('_is_gold') or p.paint.get('_is_accessory')) for p in parts]
    if not any(acc_flags) or all(acc_flags):
        return

    j, b = glbio.read_glb(glb_path.read_bytes())
    binb = bytearray(b)
    prim = j['meshes'][0]['primitives'][0]
    ind_ai = prim['indices']
    tris = glbio.accessor(j, bytes(binb), ind_ai).reshape(-1, 3)

    hair_tris, acc_tris = [], []
    t_off = 0
    for p, is_acc in zip(parts, acc_flags):
        R_cnt, C_cnt = p.P.shape[:2]
        cols_uv = C_cnt + 1 if p.closed else C_cnt
        n_tris = (R_cnt - 1) * (cols_uv - 1) * 2
        chunk = tris[t_off:t_off + n_tris]
        if is_acc:
            acc_tris.append(chunk)
        else:
            hair_tris.append(chunk)
        t_off += n_tris

    hair_idx = np.concatenate(hair_tris, axis=0).reshape(-1).astype(np.uint16)
    acc_idx = np.concatenate(acc_tris, axis=0).reshape(-1).astype(np.uint16)

    mat_hair = copy.deepcopy(j['materials'][0])
    mat_hair['name'] = gid
    mat_acc = copy.deepcopy(j['materials'][0])
    mat_acc['name'] = f'{gid}_acc'
    mat_acc['pbrMetallicRoughness'] = {
        'baseColorTexture': mat_hair['pbrMetallicRoughness']['baseColorTexture'],
        'metallicFactor': 0.75,
        'roughnessFactor': 0.28,
    }
    j['materials'] = [mat_hair, mat_acc]

    b_hair = np.ascontiguousarray(hair_idx).tobytes()
    b_acc = np.ascontiguousarray(acc_idx).tobytes()
    pad1 = (-len(binb)) % 4
    binb.extend(b'\0' * pad1)
    off_hair = len(binb)
    binb.extend(b_hair)
    pad2 = (-len(binb)) % 4
    binb.extend(b'\0' * pad2)
    off_acc = len(binb)
    binb.extend(b_acc)
    pad3 = (-len(binb)) % 4
    binb.extend(b'\0' * pad3)
    j['buffers'][0]['byteLength'] = len(binb)

    bv_hair_idx = len(j['bufferViews'])
    j['bufferViews'].append({'buffer': 0, 'byteOffset': off_hair, 'byteLength': len(b_hair), 'target': 34963})
    bv_acc_idx = len(j['bufferViews'])
    j['bufferViews'].append({'buffer': 0, 'byteOffset': off_acc, 'byteLength': len(b_acc), 'target': 34963})

    acc_hair_idx = len(j['accessors'])
    j['accessors'].append({
        'bufferView': bv_hair_idx, 'componentType': 5123, 'count': len(hair_idx), 'type': 'SCALAR',
        'min': [int(hair_idx.min())], 'max': [int(hair_idx.max())],
    })
    acc_acc_idx = len(j['accessors'])
    j['accessors'].append({
        'bufferView': bv_acc_idx, 'componentType': 5123, 'count': len(acc_idx), 'type': 'SCALAR',
        'min': [int(acc_idx.min())], 'max': [int(acc_idx.max())],
    })

    prim_hair = copy.deepcopy(prim)
    prim_hair['indices'] = acc_hair_idx
    prim_hair['material'] = 0
    prim_acc = copy.deepcopy(prim)
    prim_acc['indices'] = acc_acc_idx
    prim_acc['material'] = 1
    j['meshes'][0]['primitives'] = [prim_hair, prim_acc]

    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(glb_path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))

    morph_path = glb_path.with_suffix('.morph.bin')
    if morph_path.exists():
        mb = morph_path.read_bytes()
        nl_old = struct.unpack_from('<H', mb, 6)[0]
        new_mats = f'{gid}\n{gid}_acc'.encode('utf-8')
        mb_new = mb[:6] + struct.pack('<H', len(new_mats)) + new_mats + mb[8 + nl_old:]
        morph_path.write_bytes(mb_new)


def _connect_hair_parts(parts):
    """Ensure every secondary hair part (ponytail, bun, chignon, braid, tie, cuff, spike) connects seamlessly to the scalp dome with zero gap."""
    if len(parts) < 2:
        return parts
    from scipy.spatial import cKDTree

    dome_pts = parts[0].P.reshape(-1, 3)
    dome_tree = cKDTree(dome_pts)
    last_lock_shift = np.zeros(3, dtype=np.float64)

    for idx_p in range(1, len(parts)):
        p = parts[idx_p]
        pname = p.name.lower()
        conn_pts = np.concatenate([pt.P.reshape(-1, 3) for pt in parts[:idx_p]], axis=0)
        conn_tree = cKDTree(conn_pts)

        R_cnt = p.P.shape[0]
        is_tie_or_cuff = any(k in pname for k in ('tie', 'cuff', 'wrap', 'band', 'ring', 'ribbon', 'clasp'))
        is_crown_arc = any(k in pname for k in ('crown_braid', 'cbrd', 'coronet', 'dutch', 'twist', 'fillet', 'halo'))
        is_lock = (R_cnt >= 12) and (not is_tie_or_cuff) and (not is_crown_arc) and not any(k in pname for k in ('bun', 'chignon', 'knot', 'rosette', 'topknot', 'pouf', 'roll'))

        if is_lock:
            d_root, _ = dome_tree.query(p.P[0])
            if float(d_root.min()) > 0.0005:
                c_root = p.P[0].mean(axis=0)
                _, idx_d = dome_tree.query(c_root)
                q_dome = dome_pts[int(idx_d)]
                in_vec = np.array([0.0, -0.035, q_dome[2]]) - q_dome
                in_vec /= max(float(np.linalg.norm(in_vec)), 1e-6)
                target_root = q_dome + in_vec * 0.005
                delta = target_root - c_root
                last_lock_shift = delta.copy()
                is_nape_tail = (c_root[1] > 0.015) and (c_root[2] < 1.665)
                for r_i in range(R_cnt):
                    tv = r_i / max(R_cnt - 1, 1)
                    w_r = (1.0 - 0.30 * tv) if is_nape_tail else ((1.0 - tv) ** 1.7)
                    p.P[r_i] = p.P[r_i] + delta * w_r
                    if is_nape_tail and r_i >= 2:
                        # Ensure shifted tail rows never clip inside the back of the neck skin
                        row_c = p.P[r_i].mean(axis=0)
                        z_r = float(row_c[2])
                        th_r = math.atan2(float(row_c[0]), -float(row_c[1] + 0.035))
                        r_skin = cyl_r(z_r, th_r, cover_ears=False)
                        rad_row = float(np.linalg.norm(p.P[r_i] - row_c, axis=1).mean())
                        c_axis = np.array([0.0, -0.035, z_r])
                        v_out = row_c - c_axis
                        v_out[2] = 0.0
                        d_cur = float(np.linalg.norm(v_out))
                        d_min_req = r_skin + rad_row * 0.65 + 0.003
                        if d_cur < d_min_req and d_cur > 1e-6:
                            p.P[r_i, :, :2] += (v_out[:2] / d_cur) * (d_min_req - d_cur)
            else:
                last_lock_shift = np.zeros(3, dtype=np.float64)
        else:
            if is_tie_or_cuff and float(np.linalg.norm(last_lock_shift)) > 1e-4:
                p.P = p.P + last_lock_shift
                conn_pts = np.concatenate([pt.P.reshape(-1, 3) for pt in parts[:idx_p]], axis=0)
                conn_tree = cKDTree(conn_pts)
            flat_p = p.P.reshape(-1, 3)
            d_all, i_conn = conn_tree.query(flat_p)
            if float(d_all.min()) > 0.0005:
                best_k = int(np.argmin(d_all))
                p_near = flat_p[best_k]
                q_near = conn_pts[int(i_conn[best_k])]
                in_vec = np.array([0.0, -0.035, q_near[2]]) - q_near
                in_vec /= max(float(np.linalg.norm(in_vec)), 1e-6)
                shift = (q_near - p_near) + in_vec * 0.004
                p.P = p.P + shift
                if any(k in pname for k in ('bun', 'chignon', 'knot', 'rosette', 'topknot')):
                    last_lock_shift = shift.copy()
    return parts


def main():
    t0 = time.time()
    bio.set_body('mpfb_male')

    all_hair_specs = (
        build_male_50_specs()
        + build_female_50_specs()
        + build_extra_hair_specs()
    )
    print(f'Checking/building {len(all_hair_specs)} 3D hairstyles...')
    hair_records = []
    hair_entries_m = {}

    for idx, fn in enumerate(all_hair_specs, 1):
        gid, label, gender, parts = fn()
        has_dome = any(('_dome' in p.name or '_cap' in p.name or '_stubble' in p.name) for p in parts)
        if not has_dome:
            base_paint = parts[0].paint if parts else 'hair_base'
            parts = [
                sculpt_scalp_dome(
                    gid + '_dome', base_paint,
                    phi_front_deg=58, phi_temple_deg=84, phi_ear_deg=88, phi_nape_deg=142,
                    thick_crown=0.017, thick_front=0.016, thick_side=0.015, thick_nape=0.014,
                    part_x=0.0, part_depth=0.006, wave_amp=0.003, lobe_amp=0.0025
                )
            ] + list(parts)
        parts = _connect_hair_parts(parts)
        m_glb = ROOT / 'pieces' / 'mpfb_male' / f'{gid}.glb'
        m_morph = ROOT / 'pieces' / 'mpfb_male' / f'{gid}.morph.bin'
        ent = assemble_garment(gid, label, 'hair', None, parts)
        _split_hair_primitives(m_glb, parts, gid)
        ent.pop('culture', None)
        ent.pop('_body', None)
        ent['gender'] = gender
        hair_records.append((gid, label, gender))
        hair_entries_m[gid] = ent

    print('Transferring all 180 hairstyles to mpfb_female...')
    _transfer_hairs_to_female(hair_records)

    beard_specs = build_extra_beard_specs()
    print(f'Building {len(beard_specs)} additional facial hair pieces...')
    beard_entries_m = {}
    for idx, fn in enumerate(beard_specs, 1):
        gid, label, parts = fn()
        ent = assemble_garment(gid, label, 'beard', None, parts)
        ent.pop('culture', None)
        ent.pop('_body', None)
        beard_entries_m[gid] = ent
        if idx % 5 == 0 or idx == len(beard_specs):
            print(f'  [{idx}/{len(beard_specs)}] Built {gid}')

    _fix_library_mustaches()

    implant_specs = build_cyber_implant_specs()
    print(f'Building {len(implant_specs)} 3D cybernetic implants...')
    implant_records = []
    implant_entries_m = {}
    for idx, fn in enumerate(implant_specs, 1):
        gid, label, parts = fn()
        ent = assemble_garment(gid, label, 'implant', None, parts)
        ent.pop('culture', None)
        ent.pop('_body', None)
        implant_records.append((gid, label, 'unisex'))
        implant_entries_m[gid] = ent
        if idx % 10 == 0 or idx == len(implant_specs):
            print(f'  [{idx}/{len(implant_specs)}] Built {gid}')

    print('Transferring all 30 cybernetic implants to mpfb_female...')
    _transfer_hairs_to_female(implant_records)

    # Update data/mpfb_male/kit.json and data/mpfb_female/kit.json
    for body_id, default_lib_gender in (('mpfb_male', 'male'), ('mpfb_female', 'female')):
        kit_path = ROOT / 'data' / body_id / 'kit.json'
        kit = json.loads(kit_path.read_text(encoding='utf-8'))
        roles = kit.setdefault('tint', {}).setdefault('roles', {})

        # Tag existing library hairstyles with gender if not already tagged
        new_Ids = set(hair_entries_m.keys()) | set(beard_entries_m.keys()) | set(implant_entries_m.keys())
        kept = []
        for g in kit['items']:
            if g['id'] in new_Ids:
                continue
            if g.get('slot') == 'hair' and 'gender' not in g:
                g['gender'] = default_lib_gender
            kept.append(g)

        # Append all 180 new hairstyles to both mpfb_male and mpfb_female
        for gid, label, gender in hair_records:
            ent = copy.deepcopy(hair_entries_m[gid])
            ent['glb'] = f'pieces/{body_id}/{gid}.glb'
            ent['gender'] = gender
            kept.append(ent)
            roles[gid] = 'hair'

        # Append all 30 cybernetic implants to both mpfb_male and mpfb_female
        for gid, label, _ in implant_records:
            ent = copy.deepcopy(implant_entries_m[gid])
            ent['glb'] = f'pieces/{body_id}/{gid}.glb'
            kept.append(ent)

        # Append new facial hair to mpfb_male (and update rustic_m_axeman_stache)
        if body_id == 'mpfb_male':
            for gid, ent in beard_entries_m.items():
                kept.append(copy.deepcopy(ent))
                roles[gid] = 'hair'

        kit['items'] = kept
        kit_path.write_text(json.dumps(kit, indent=2) + '\n', encoding='utf-8')
        print(f'Updated {kit_path} ({len(kept)} total items)')

    print(f'Done in {time.time() - t0:.1f}s!')


if __name__ == '__main__':
    main()

