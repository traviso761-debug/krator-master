"""Build 40 procedural 3D facial hair pieces across the 5 user reference sheets.

Sheet 1 (s1_01..s1_10): Ancient / Assyrian / Braided & Curled Royal Beards (10 styles)
Sheet 2 (s2_01..s2_05): Mustache + Goatee / Van Dyke / Braided Chin Combos (5 styles)
Sheet 3 (s3_01..s3_05): Pure Mustaches — Walrus, Steppe, Chevron, Handlebar, Horseshoe (5 styles)
Sheet 4 (s4_01..s4_10): Classical / Levantine / Trimmed & Full Beards (10 styles)
Sheet 5 (s5_01..s5_10): Renaissance / Forked / Swallowtail / Stiletto & Philosopher Beards (10 styles)
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
    ROOT, C, P, B, PN, Part, first_hit, head_frame, horn, assemble_garment, glbio, make_mpfb
)

# Register neutral hair shades (around 0.46 linear so kit.tint.roles['hair'] * gain 2.0964 = 0.96x rec.hair_color)
# plus bright gold cuff shade for the untinted metallic gold primitive
C.update({
    'hair_base':   (0.47, 0.46, 0.45),
    'hair_light':  (0.64, 0.62, 0.60),
    'hair_dark':   (0.28, 0.27, 0.26),
    'hair_root':   (0.32, 0.31, 0.30),
    'beard_gold':  (0.92, 0.72, 0.24),
    'beard_brass': (0.62, 0.44, 0.12),
})

_orig_motif = bio.motif


def _beard_motif(style, w, h, fg, bg, aspect=1.0):
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)
    if style == 'beard_strands':
        img = np.empty((h, w, 3), dtype=np.float64)
        s1 = np.sin(u * 2 * math.pi * 48.0 + 0.35 * np.sin(v * 2 * math.pi * 4.0))
        s2 = np.sin(u * 2 * math.pi * 140.0 + 0.6 * np.cos(v * 2 * math.pi * 7.0))
        clump = np.sin(u * 2 * math.pi * 14.0)
        shade = 0.52 + 0.20 * s1 + 0.15 * s2 + 0.11 * clump
        env = 0.90 + 0.10 * np.sin(np.clip(v, 0.0, 1.0) * math.pi)
        t = np.clip(shade * env, 0.0, 1.0)[..., None]
        img[:] = np.asarray(bg) * (1.0 - t) + np.asarray(fg) * t
        return img
    elif style == 'beard_waves':
        img = np.empty((h, w, 3), dtype=np.float64)
        wave = 0.045 * np.sin(v * 2 * math.pi * 6.0)
        s1 = np.sin((u + wave) * 2 * math.pi * 36.0)
        s2 = np.sin((u + wave) * 2 * math.pi * 110.0)
        ridge = 0.52 + 0.24 * np.cos(v * 2 * math.pi * 6.0)
        t = np.clip(0.38 + 0.22 * s1 + 0.14 * s2 + 0.24 * ridge, 0.0, 1.0)[..., None]
        img[:] = np.asarray(bg) * (1.0 - t) + np.asarray(fg) * t
        return img
    elif style == 'beard_curls':
        img = np.empty((h, w, 3), dtype=np.float64)
        nx, ny = 18.0, 10.0
        row_c = np.floor(v * ny).astype(int)
        cu = (u * nx + 0.5 * (row_c % 2)) % 1.0 - 0.5
        cv = (v * ny) % 1.0 - 0.5
        r = np.hypot(cu * 1.15, cv * 1.15)
        ang = np.arctan2(cv, cu)
        spiral = np.sin(r * 16.0 - ang * 2.0)
        t = np.clip(0.48 + 0.30 * spiral - 0.28 * np.clip(r - 0.38, 0.0, 0.5), 0.0, 1.0)[..., None]
        img[:] = np.asarray(bg) * (1.0 - t) + np.asarray(fg) * t
        return img
    elif style == 'beard_braid':
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
    elif style == 'gold_cuff':
        img = np.empty((h, w, 3), dtype=np.float64)
        img[:] = C['beard_gold']
        rim = (v < 0.20) | (v > 0.80) | (np.abs(v - 0.5) < 0.09)
        img[rim] = C['beard_brass']
        flute = np.sin(u * 2 * math.pi * 20.0) > 0.25
        img[(v >= 0.22) & (v <= 0.78) & flute] = (1.0, 0.88, 0.42)
        return img
    return _orig_motif(style, w, h, fg, bg, aspect=aspect)


bio.motif = _beard_motif


def P_hair(style='beard_strands', base='hair_base', light='hair_light', dark='hair_dark', extra_bands=()):
    bands = [B('bottom', 0.0, 1.0, style, light, dark, 0.25)] + list(extra_bands)
    return P(base, 0.06, bands, fabric='fur.short')


def P_cuff():
    p = P('beard_gold', 0.02, [B('bottom', 0.0, 1.0, 'gold_cuff', 'beard_gold', 'beard_brass', 0.10)], fabric='metal.gold')
    p['_is_gold'] = True
    return p


# ---------------------------------------------------------------------------------------------------------------
# Precompute exact outer skin surface of mpfb_male face (Z up, -Y forward, +X left)
# Center axis at x=0.0, y=-0.055
# ---------------------------------------------------------------------------------------------------------------
_ZS = np.linspace(1.545, 1.645, 41)
_THS = np.linspace(-math.radians(82.0), math.radians(82.0), 65)
_FACE_R = np.zeros((len(_ZS), len(_THS)), dtype=np.float64)

for iz, z in enumerate(_ZS):
    c = np.array([0.0, -0.055, z])
    for ith, th in enumerate(_THS):
        ath = abs(th)
        d = np.array([math.sin(ath), -math.cos(ath), 0.0])
        h = first_hit(c + d * 0.25, -d)
        r = (0.25 - h) if (h is not None and (0.25 - h) > 0.035) else 0.085
        if 1.586 <= z <= 1.616 and ath <= math.radians(28.0):
            lip_r = 0.106 - 0.018 * (ath / math.radians(28.0)) ** 1.5
            r = max(r, lip_r)
        _FACE_R[iz, ith] = r


def face_r(z, th):
    zc = float(np.clip(z, _ZS[0], _ZS[-1]))
    tc = float(np.clip(th, _THS[0], _THS[-1]))
    iz = int(np.clip(np.searchsorted(_ZS, zc) - 1, 0, len(_ZS) - 2))
    ith = int(np.clip(np.searchsorted(_THS, tc) - 1, 0, len(_THS) - 2))
    fz = (zc - _ZS[iz]) / (_ZS[iz + 1] - _ZS[iz])
    ft = (tc - _THS[ith]) / (_THS[ith + 1] - _THS[ith])
    r00, r01 = _FACE_R[iz, ith], _FACE_R[iz, ith + 1]
    r10, r11 = _FACE_R[iz + 1, ith], _FACE_R[iz + 1, ith + 1]
    return (1 - fz) * ((1 - ft) * r00 + ft * r01) + fz * ((1 - ft) * r10 + ft * r11)


# ---------------------------------------------------------------------------------------------------------------
# Sculpted 3D Facial Hair Builders
# ---------------------------------------------------------------------------------------------------------------
def sculpt_beard_mass(
    name, paint,
    theta_max_deg=76.0,
    z_side_top=1.634,
    z_cheek_mid=1.606,      # height along mid-cheek / mouth corner connection!
    z_chin_top=1.588,       # height directly under lower lip
    length=0.050,
    thick_top=0.003,
    thick_mid=0.016,
    thick_bot=0.020,
    flare_x=0.0,
    flare_fwd=0.010,
    bottom_shape='round',   # 'round', 'flat', 'point', 'fork', 'wedge'
    point_drop=0.025,
    fork_depth=0.030,
    fork_peak_u=0.38,
    wave_amp=0.0,
    wave_freq=6.0,
    lobe_count=0,
    lobe_amp=0.0,
    soul_patch_notch=0.0,
    rows_front=15,
    rows_back=5,
    cols=35,
):
    """Build a closed 3D sculpted beard volume with natural mouth-corner connection & rounded bottom hem."""
    th_max = math.radians(theta_max_deg)
    us = np.linspace(-1.0, 1.0, cols)
    thetas = us * th_max

    # Top edge Z profile across u in [-1, 1]:
    # For full beards (theta_max_deg > 42), the beard dips under the lower lip at |u| < 0.24 (z_chin_top),
    # rises around the mouth corners at |u| ~ 0.34..0.50 (to z_cheek_mid ~ 1.606..1.612 so it joins the mustache!),
    # and sweeps up to the sideburns at |u| = 1.0 (z_side_top ~ 1.634).
    z_top = np.zeros(cols)
    for j, u in enumerate(us):
        au = abs(u)
        if theta_max_deg > 42.0:
            if au < 0.24:
                # Under the lower lip: optional soul-patch peak at u=0, dipping slightly at |u|~0.16 if notched
                t = au / 0.24
                zt = z_chin_top + 0.004 * (1.0 - t ** 2) - soul_patch_notch * math.sin(t * math.pi)
            elif au < 0.44:
                # Rise up around the mouth corners to join the outer mustache
                t = (au - 0.24) / 0.20
                s = t * t * (3.0 - 2.0 * t)
                zt = z_chin_top + (z_cheek_mid - z_chin_top) * s
            else:
                # Sweep from mouth-corner/cheek level up to sideburn tragus
                t = (au - 0.44) / 0.56
                zt = z_cheek_mid + (z_side_top - z_cheek_mid) * (t ** 1.45)
        else:
            # Chin-only goatee / Van Dyke
            zt = z_chin_top + 0.003 * (1.0 - au ** 2) - 0.008 * (au ** 1.6)
        z_top[j] = zt

    # Bottom hem Z profile across u in [-1, 1]
    z_chin_base = 1.564 - length
    z_bot = np.zeros(cols)
    for j, u in enumerate(us):
        au = abs(u)
        if bottom_shape == 'flat':
            zb = z_chin_base + 0.005 * (au ** 2.6)
        elif bottom_shape == 'round':
            zb = z_chin_base + (0.018 + 0.24 * length) * (au ** 1.85)
        elif bottom_shape == 'wedge':
            zb = z_chin_base - point_drop * (1.0 - au) + 0.015 * (au ** 1.5)
        elif bottom_shape == 'point':
            zb = z_chin_base - point_drop * ((1.0 - au) ** 1.65) + 0.020 * (au ** 1.4)
        elif bottom_shape == 'fork':
            d_prong = abs(au - fork_peak_u) / max(fork_peak_u, 0.25)
            prong_ext = point_drop * max(0.0, 1.0 - (d_prong ** 1.35))
            cleft = fork_depth * max(0.0, 1.0 - (au / max(fork_peak_u, 0.2)) ** 1.5)
            zb = z_chin_base - prong_ext + cleft + 0.022 * max(0.0, au - fork_peak_u) ** 1.4
        else:
            zb = z_chin_base + 0.016 * (au ** 1.8)
        z_bot[j] = min(zb, z_top[j] - 0.008)

    total_rows = rows_front + rows_back
    P_grid = np.zeros((total_rows, cols, 3), dtype=np.float64)

    # 1. Front/outer rows (v = 0 at top skin edge -> v = 1 at rounded bottom tip)
    for i in range(rows_front):
        vf = i / (rows_front - 1)
        # Round the last 2 rows smoothly inward at the very bottom hem so normals point downward/forward instead of pinching
        hem_round = math.sin(max(0.0, (vf - 0.82) / 0.18) * math.pi * 0.5)
        thk_base = (
            thick_top * ((1.0 - vf) ** 2.2)
            + thick_mid * 2.2 * vf * (1.0 - vf)
            + thick_bot * (vf ** 1.15) * (1.0 - 0.28 * hem_round)
        )
        for j, (u, th) in enumerate(zip(us, thetas)):
            au = abs(u)
            z = z_top[j] * (1.0 - vf) + z_bot[j] * vf
            z_skin_ref = max(z, 1.572)
            r_skin = face_r(z_skin_ref, th)
            edge_taper = 0.25 + 0.75 * math.cos(au * math.pi * 0.46)
            lobe_mod = lobe_amp * math.cos(u * math.pi * lobe_count) * math.sin(vf * math.pi) if lobe_count > 0 else 0.0
            wave_mod = wave_amp * math.sin(vf * 2 * math.pi * wave_freq + au * 1.5) * (vf ** 0.6) if wave_amp > 0 else 0.0
            r_out = r_skin + (thk_base + lobe_mod + wave_mod) * edge_taper

            x = r_out * math.sin(th) + np.sign(u) * flare_x * (vf ** 1.15) * (au ** 0.7)
            y = -0.055 - r_out * math.cos(th) - flare_fwd * (vf ** 1.1) * (1.0 - 0.45 * (au ** 1.5)) + 0.004 * hem_round
            if bottom_shape == 'fork' and vf > 0.35:
                x += np.sign(u) * 0.008 * ((vf - 0.35) / 0.65) ** 1.3 * math.sin(au * math.pi * 0.5)
            P_grid[i, j] = [x, y, z]

    # 2. Back/under-chin rows: wrap smoothly from rounded bottom hem back to the under-chin anchor
    for k in range(1, rows_back + 1):
        vb = k / rows_back
        row_idx = rows_front - 1 + k
        for j, (u, th) in enumerate(zip(us, thetas)):
            au = abs(u)
            p_hem = P_grid[rows_front - 1, j]
            z_anchor = min(z_top[j] - 0.004, 1.556 + 0.026 * (au ** 1.6))
            r_anchor = face_r(max(z_anchor, 1.555), th) + 0.002
            p_anchor = np.array([
                r_anchor * math.sin(th),
                -0.055 - r_anchor * math.cos(th) + 0.010 * (1.0 - au),
                z_anchor
            ])
            arc_drop = -0.004 * math.sin(vb * math.pi)
            P_grid[row_idx, j] = p_hem * (1.0 - vb) + p_anchor * vb + np.array([0.0, 0.008 * math.sin(vb * math.pi), arc_drop])

    return Part(name, P_grid, False, ['body'] * total_rows, paint, rigid_joint='Head')


def sculpt_soul_patch(name, paint, width_top=0.011, width_bot=0.005, z_top=1.594, z_bot=1.578, thick=0.007):
    """Build a sculpted triangular/teardrop soul patch directly under the lower lip center."""
    rows, cols = 6, 9
    us = np.linspace(-1.0, 1.0, cols)
    P_grid = np.zeros((rows, cols, 3), dtype=np.float64)
    for i in range(rows):
        vf = i / (rows - 1)
        z = z_top * (1.0 - vf) + z_bot * vf
        w = width_top * (1.0 - vf) + width_bot * vf
        thk_v = thick * math.sin(vf * math.pi * 0.85 + 0.15)
        for j, u in enumerate(us):
            au = abs(u)
            x = u * w
            th = math.atan2(x, 0.100)
            r_skin = face_r(max(z, 1.572), th)
            r_out = r_skin + thk_v * (1.0 - 0.75 * (au ** 1.6))
            P_grid[i, j] = [r_out * math.sin(th), -0.055 - r_out * math.cos(th), z]
    return Part(name, P_grid, False, ['body'] * rows, paint, rigid_joint='Head')


def sculpt_mustache(
    name, paint,
    span_x=0.044,
    z_center=1.615,
    thick=0.013,
    height=0.017,
    droop=0.016,
    flare_out=0.004,
    curl_up=0.0,
    curl_loops=0.0,
    hang_tail_len=0.0,
    hang_tail_x=0.032,
    braided=False,
    cuff_at=None,
    rows=16,
    n_ring=10,
):
    """Build C1-smooth left and right 3D sculpted mustache wings using parallel-transported frames."""
    parts = []
    angles = np.linspace(0, 2 * math.pi, n_ring, endpoint=False)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ts = np.linspace(0.0, 1.0, rows)
        centers = []
        rxs, rzs = [], []

        for idx, t in enumerate(ts):
            if hang_tail_len > 0.0:
                # Smooth C1 transition from horizontal lip sweep (t in 0..0.42) into downward hanging tendril (t in 0.42..1.0)
                if t <= 0.42:
                    s = t / 0.42
                    x_base = sgn * (0.001 + hang_tail_x * math.sin(s * math.pi * 0.5))
                    z_base = z_center - droop * (s ** 1.6)
                    t_hang = 0.0
                else:
                    t_hang = (t - 0.42) / 0.58
                    x_base = sgn * (0.001 + hang_tail_x + flare_out * (t_hang ** 1.2))
                    z_base = z_center - droop - hang_tail_len * (t_hang ** 1.1)
                th = math.atan2(abs(x_base), 0.102)
                r_skin = face_r(max(z_base, 1.572), sgn * th)
                y_base = -0.055 - r_skin * math.cos(th) - thick * (0.85 - 0.25 * t_hang) - 0.003
                env = (0.75 + 0.25 * math.sin(min(t / 0.42, 1.0) * math.pi * 0.8)) * (1.0 - 0.62 * (t_hang ** 1.25))
                rx = max(0.0022, thick * 0.68 * env)
                rz = max(0.0022, height * 0.55 * env)

            elif curl_loops > 0.0:
                # Smooth C1 transition from lip sweep (t in 0..0.62) into tangent-continuous upward/inward handlebar curl (t in 0.62..1.0)
                if t <= 0.62:
                    s = t / 0.62
                    x_base = sgn * (0.001 + span_x * s)
                    # Swoop down by droop at mid-wing, then level out horizontally at s=1 so the curl starts smoothly!
                    z_base = z_center - droop * math.sin(s * math.pi * 0.68)
                    th = math.atan2(abs(x_base), 0.102)
                    r_skin = face_r(max(z_base, 1.585), sgn * th)
                    y_base = -0.055 - r_skin * math.cos(th) - thick * (0.80 - 0.22 * s) - flare_out * s
                    env = 0.72 + 0.30 * math.sin(s * math.pi * 0.85)
                else:
                    u = (t - 0.62) / 0.38
                    # Anchor at s=1 end of lip sweep
                    x1 = sgn * (0.001 + span_x)
                    z1 = z_center - droop * math.sin(math.pi * 0.68)
                    th1 = math.atan2(abs(x1), 0.102)
                    r_skin1 = face_r(max(z1, 1.585), sgn * th1)
                    y1 = -0.055 - r_skin1 * math.cos(th1) - thick * 0.58 - flare_out
                    # Circular curl arc starting tangent to +X (ang = -pi/2) and curling up and inward
                    r_curl = max(0.007, curl_up * 0.55)
                    ang = -math.pi * 0.5 + u * math.pi * (1.25 * curl_loops)
                    x_base = x1 + sgn * r_curl * math.cos(ang)
                    z_base = (z1 + r_curl) + r_curl * math.sin(ang)
                    y_base = y1 - 0.003 * u
                    env = (0.72 + 0.30 * math.sin(math.pi * 0.85)) * (1.0 - 0.72 * (u ** 1.15))
                rx = max(0.0018, thick * 0.65 * env)
                rz = max(0.0018, height * 0.52 * env)

            else:
                x_base = sgn * (0.001 + span_x * t)
                z_base = z_center - droop * (t ** 1.45) + curl_up * (t ** 2.4)
                th = math.atan2(abs(x_base), 0.102)
                r_skin = face_r(max(z_base, 1.585), sgn * th)
                y_base = -0.055 - r_skin * math.cos(th) - thick * (0.78 - 0.22 * (t ** 1.5)) - flare_out * t
                env = (0.72 + 0.35 * math.sin(t * math.pi * 0.85)) * (1.0 - 0.58 * (t ** 2.4))
                rx = max(0.0020, thick * 0.68 * env)
                rz = max(0.0020, height * 0.55 * env)

            if braided:
                bulge = 1.0 + 0.16 * math.sin(idx * 2.2)
                rx *= bulge
                rz *= bulge

            centers.append(np.array([x_base, y_base, z_base], dtype=np.float64))
            rxs.append(rx)
            rzs.append(rz)

        pts = np.array(centers)
        tangents = np.gradient(pts, axis=0)
        # Parallel-transport frame along the mustache curve so cross-sections never twist or flip!
        t0 = tangents[0] / max(np.linalg.norm(tangents[0]), 1e-8)
        up_v = np.array([0.0, 0.0, 1.0]) - t0 * t0[2]
        up_v /= max(np.linalg.norm(up_v), 1e-8)
        out_v = np.cross(t0, up_v)
        out_v /= max(np.linalg.norm(out_v), 1e-8)

        ring_list = []
        for idx in range(rows):
            tg = tangents[idx] / max(np.linalg.norm(tangents[idx]), 1e-8)
            out_v = out_v - tg * out_v.dot(tg)
            out_v /= max(np.linalg.norm(out_v), 1e-8)
            up_v = np.cross(out_v, tg)
            up_v /= max(np.linalg.norm(up_v), 1e-8)
            rx, rz = rxs[idx], rzs[idx]
            ring = [
                pts[idx] + out_v * (math.cos(a) * rx) + up_v * (math.sin(a) * rz)
                for a in angles
            ]
            ring_list.append(ring)
        parts.append(Part(f'{name}_{tag}', np.array(ring_list), True, ['body'] * rows, paint, rigid_joint='Head'))

        if cuff_at is not None:
            for ci, ct in enumerate(cuff_at):
                k = int(np.clip(round(ct * (rows - 1)), 1, rows - 2))
                c_p = pts[k]
                tg = tangents[k] / max(np.linalg.norm(tangents[k]), 1e-8)
                rc = max(rxs[k], rzs[k]) * 1.28 + 0.0015
                cuff_pts = [c_p - tg * 0.0045, c_p + tg * 0.0045]
                parts.append(horn(f'{name}_cuff_{tag}_{ci}', cuff_pts, rc, rc, P_cuff(), n=10, rows=3, rigid_joint='Head'))
    return parts


def sculpt_braid_strand(
    name, path_pts, r_top, r_bot, paint,
    cuff_ts=(), cuff_len=0.010, rows=14, n=10
):
    """Build a 3D 3-strand undulating braided lock along path_pts plus metallic gold cuff collars at cuff_ts."""
    pts = np.asarray(path_pts, dtype=np.float64)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    cum = np.concatenate([[0.0], np.cumsum(seg)])
    total = max(float(cum[-1]), 1e-8)
    angles = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Q = []
    sampled_pts, sampled_tan, sampled_rad = [], [], []
    for k in range(rows):
        f = k / (rows - 1)
        sd = total * f
        i = min(len(seg) - 1, int(np.searchsorted(cum, sd, side='right') - 1))
        loc_f = (sd - cum[i]) / max(seg[i], 1e-9)
        c = pts[i] + (pts[i + 1] - pts[i]) * loc_f
        t = (pts[i + 1] - pts[i]) / max(seg[i], 1e-9)
        t /= max(np.linalg.norm(t), 1e-9)
        x = np.array([1.0, 0.0, 0.0]) - t * t[0]
        if np.linalg.norm(x) < 1e-6:
            x = np.array([0.0, -1.0, 0.0])
        else:
            x /= np.linalg.norm(x)
        y = np.cross(t, x)
        r_base = r_top * (1.0 - f) + r_bot * f
        if k == rows - 1:
            r_base *= 0.22
        sampled_pts.append(c)
        sampled_tan.append(t)
        sampled_rad.append(r_base)
        ring = []
        for a in angles:
            plait = 1.0 + 0.16 * math.cos(3.0 * a + f * 18.0) + 0.10 * math.sin(f * 26.0)
            r = r_base * plait
            ring.append(c + (x * math.cos(a) * 1.05 + y * math.sin(a) * 0.92) * r)
        Q.append(ring)

    out = [Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head')]
    for ci, ct in enumerate(cuff_ts):
        idx = int(np.clip(round(ct * (rows - 1)), 1, rows - 2))
        c = sampled_pts[idx]
        t = sampled_tan[idx]
        rc = sampled_rad[idx] * 1.25 + 0.0018
        cuff_path = [c - t * (cuff_len * 0.5), c + t * (cuff_len * 0.5)]
        out.append(horn(f'{name}_cuff_{ci}', cuff_path, rc, rc * 0.98, P_cuff(), n=10, rows=3, rigid_joint='Head'))
    return out


def sculpt_ringlet_tiers(
    gid, paint,
    tiers=4,
    cols_per_tier=(7, 8, 9, 9),
    z_top=1.580,
    z_bot=1.455,
    theta_span_deg=54.0,
    r_curl=0.0085,
    spiral_twist=0.0,
):
    """Build terraced horizontal rows of 3D cylindrical or spiral corkscrew ringlets (Assyrian #1-6 & Babylonian #1-7)."""
    parts = []
    th_span = math.radians(theta_span_deg)
    tier_zs = np.linspace(z_top, z_bot, tiers + 1)
    for ti in range(tiers):
        zt0 = tier_zs[ti] + (0.005 if ti > 0 else 0.0)
        zt1 = tier_zs[ti + 1]
        nc = cols_per_tier[min(ti, len(cols_per_tier) - 1)]
        us = np.linspace(-1.0, 1.0, nc)
        for ci, u in enumerate(us):
            th = u * th_span * (1.0 + 0.06 * ti)
            r_skin = face_r(max(zt0, 1.572), th)
            r_out = r_skin + 0.016 + 0.0045 * ti
            rows = 7
            angles = np.linspace(0, 2 * math.pi, 8, endpoint=False)
            Q = []
            for k in range(rows):
                f = k / (rows - 1)
                z = zt0 * (1.0 - f) + zt1 * f
                swirl_x = 0.0022 * math.cos(f * 2 * math.pi * spiral_twist) if spiral_twist > 0 else 0.0
                swirl_y = 0.0022 * math.sin(f * 2 * math.pi * spiral_twist) if spiral_twist > 0 else 0.0
                cx = r_out * math.sin(th) + u * 0.006 * ti + swirl_x
                cy = -0.055 - r_out * math.cos(th) - 0.003 * ti + swirl_y
                rc = r_curl * (0.92 + 0.14 * math.sin(f * math.pi))
                if k == rows - 1:
                    rc *= 0.65
                Q.append([
                    np.array([cx + math.cos(a) * rc, cy + math.sin(a) * rc, z])
                    for a in angles
                ])
            parts.append(Part(f'{gid}_r_{ti}_{ci}', np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head'))
    return parts


# ---------------------------------------------------------------------------------------------------------------
# Define all 40 Facial Hair Styles across Sheets 1–5
# ---------------------------------------------------------------------------------------------------------------
def build_all_specs():
    specs = []

    # ===========================================================================================================
    # SHEET 1: Ancient / Assyrian / Braided & Curled Royal Beards (10 styles)
    # ===========================================================================================================

    # S1-01: Long flared beard with twin front braids clasped with two gold cuffs each
    def s1_01():
        gid = 'beard_s1_01_twin_braids'
        p_str = P_hair('beard_strands')
        p_brd = P_hair('beard_braid')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.115, thick_mid=0.022, thick_bot=0.028, flare_x=0.026, flare_fwd=0.018,
                              bottom_shape='flat', wave_amp=0.002, wave_freq=4.0),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.046, thick=0.013, height=0.017, droop=0.022))
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            b_pts = [
                np.array([sgn * 0.022, -0.172, 1.592]),
                np.array([sgn * 0.025, -0.180, 1.545]),
                np.array([sgn * 0.028, -0.184, 1.495]),
                np.array([sgn * 0.030, -0.182, 1.448]),
            ]
            parts.extend(sculpt_braid_strand(f'{gid}_braid_{tag}', b_pts, 0.0085, 0.0055, p_brd, cuff_ts=(0.55, 0.82)))
        return gid, 'Royal Flared Beard with Twin Braids', parts
    specs.append(s1_01)

    # S1-02: Long trapezoidal straight beard with braided mustache tails & gold tip cuffs
    def s1_02():
        gid = 'beard_s1_02_braided_stache'
        p_str = P_hair('beard_strands')
        p_brd = P_hair('beard_braid')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.105, thick_mid=0.022, thick_bot=0.030, flare_x=0.024, flare_fwd=0.022,
                              bottom_shape='flat'),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_brd, span_x=0.054, thick=0.013, height=0.016, droop=0.038,
                                     flare_out=0.010, braided=True, cuff_at=(0.82,)))
        return gid, 'Trapezoid Beard with Braided Mustache', parts
    specs.append(s1_02)

    # S1-03: Full rounded cheek beard gathered into a single thick central chin braid with a heavy gold collar
    def s1_03():
        gid = 'beard_s1_03_chin_braid'
        p_str = P_hair('beard_waves')
        p_brd = P_hair('beard_braid')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.052, thick_mid=0.025, thick_bot=0.022, flare_x=0.008, flare_fwd=0.016,
                              bottom_shape='round', wave_amp=0.0025, wave_freq=5.0),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.045, thick=0.013, height=0.017, droop=0.018))
        c_pts = [
            np.array([0.0, -0.172, 1.568]),
            np.array([0.0, -0.180, 1.530]),
            np.array([0.0, -0.180, 1.490]),
            np.array([0.0, -0.175, 1.455]),
        ]
        parts.extend(sculpt_braid_strand(gid + '_cbraid', c_pts, 0.018, 0.010, p_brd, cuff_ts=(0.68,), cuff_len=0.014))
        return gid, 'Full Beard with Ringed Chin Braid', parts
    specs.append(s1_03)

    # S1-04: Full beard split into forked twin lower braids bound with heavy gold collars
    def s1_04():
        gid = 'beard_s1_04_forked_braids'
        p_str = P_hair('beard_strands')
        p_brd = P_hair('beard_braid')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=75, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.048, thick_mid=0.022, thick_bot=0.020, flare_x=0.006, flare_fwd=0.014,
                              bottom_shape='fork', point_drop=0.018, fork_depth=0.016, fork_peak_u=0.35),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.046, thick=0.013, height=0.016, droop=0.020))
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            b_pts = [
                np.array([sgn * 0.020, -0.168, 1.552]),
                np.array([sgn * 0.024, -0.174, 1.512]),
                np.array([sgn * 0.026, -0.176, 1.472]),
                np.array([sgn * 0.027, -0.174, 1.442]),
            ]
            parts.extend(sculpt_braid_strand(f'{gid}_fbraid_{tag}', b_pts, 0.014, 0.008, p_brd, cuff_ts=(0.70,), cuff_len=0.013))
        return gid, 'Full Beard with Forked Twin Braids', parts
    specs.append(s1_04)

    # S1-05: Long beard with five beaded vertical locks (3 gold cuffs per lock)
    def s1_05():
        gid = 'beard_s1_05_five_beaded'
        p_str = P_hair('beard_strands')
        p_brd = P_hair('beard_braid')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.095, thick_mid=0.020, thick_bot=0.024, flare_x=0.018, flare_fwd=0.016,
                              bottom_shape='round'),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.048, thick=0.013, height=0.017, droop=0.024))
        for idx, u_lock in enumerate((-0.68, -0.34, 0.0, 0.34, 0.68)):
            th = u_lock * math.radians(48.0)
            r0 = face_r(1.572, th) + 0.018
            x0 = r0 * math.sin(th)
            y0 = -0.055 - r0 * math.cos(th)
            z_top_l = 1.568 - 0.008 * abs(u_lock)
            b_pts = [
                np.array([x0, y0, z_top_l]),
                np.array([x0 * 1.12, y0 - 0.006, z_top_l - 0.038]),
                np.array([x0 * 1.22, y0 - 0.010, z_top_l - 0.078]),
                np.array([x0 * 1.28, y0 - 0.008, z_top_l - 0.118]),
            ]
            parts.extend(sculpt_braid_strand(f'{gid}_lock_{idx}', b_pts, 0.009, 0.006, p_brd, cuff_ts=(0.30, 0.58, 0.84), cuff_len=0.008))
        return gid, 'Long Beard with Five Beaded Locks', parts
    specs.append(s1_05)

    # S1-06: Assyrian 4-tier square-cut tubular ringlet beard
    def s1_06():
        gid = 'beard_s1_06_assyrian_tiers'
        p_curls = P_hair('beard_curls')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_curls, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.105, thick_mid=0.022, thick_bot=0.028, flare_x=0.020, flare_fwd=0.018,
                              bottom_shape='flat', lobe_count=9, lobe_amp=0.003),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', P_hair('beard_strands'), span_x=0.046, thick=0.013, height=0.017, droop=0.020))
        parts.extend(sculpt_ringlet_tiers(gid, P_hair('beard_curls'), tiers=4, cols_per_tier=(7, 8, 9, 9),
                                          z_top=1.576, z_bot=1.458, theta_span_deg=50.0, r_curl=0.0080, spiral_twist=0.0))
        return gid, 'Assyrian Tiered Ringlet Beard', parts
    specs.append(s1_06)

    # S1-07: Babylonian dense spiral corkscrew ringlet beard
    def s1_07():
        gid = 'beard_s1_07_babylonian_curls'
        p_curls = P_hair('beard_curls')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_curls, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.108, thick_mid=0.024, thick_bot=0.032, flare_x=0.022, flare_fwd=0.020,
                              bottom_shape='flat', wave_amp=0.004, wave_freq=7.0, lobe_count=8, lobe_amp=0.004),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', P_hair('beard_strands'), span_x=0.046, thick=0.013, height=0.017, droop=0.020))
        parts.extend(sculpt_ringlet_tiers(gid, p_curls, tiers=4, cols_per_tier=(6, 7, 8, 8),
                                          z_top=1.576, z_bot=1.455, theta_span_deg=52.0, r_curl=0.0095, spiral_twist=2.0))
        return gid, 'Babylonian Spiral Curl Beard', parts
    specs.append(s1_07)

    # S1-08: Long flowing wavy cascade beard with curled handlebar mustache
    def s1_08():
        gid = 'beard_s1_08_wavy_cascade'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.120, thick_mid=0.024, thick_bot=0.030, flare_x=0.024, flare_fwd=0.018,
                              bottom_shape='flat', wave_amp=0.0055, wave_freq=6.5, lobe_count=7, lobe_amp=0.004),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.046, thick=0.013, height=0.016, droop=0.014,
                                     curl_up=0.014, curl_loops=1.0))
        return gid, 'Long Wavy Cascade & Handlebar', parts
    specs.append(s1_08)

    # S1-09: Pointed woven basket-lattice chin braid with golden bottom cuff
    def s1_09():
        gid = 'beard_s1_09_woven_point'
        p_brd = P_hair('beard_braid')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_brd, theta_max_deg=74, z_side_top=1.634, z_cheek_mid=1.606, z_chin_top=1.588,
                              length=0.055, thick_mid=0.022, thick_bot=0.016, flare_x=-0.016, flare_fwd=0.016,
                              bottom_shape='point', point_drop=0.048, lobe_count=5, lobe_amp=0.003),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', P_hair('beard_strands'), span_x=0.044, thick=0.012, height=0.016, droop=0.018))
        c_pts = [
            np.array([0.0, -0.172, 1.560]),
            np.array([0.0, -0.176, 1.515]),
            np.array([0.0, -0.174, 1.475]),
            np.array([0.0, -0.170, 1.450]),
        ]
        parts.extend(sculpt_braid_strand(gid + '_tip_braid', c_pts, 0.020, 0.007, p_brd, cuff_ts=(0.68,), cuff_len=0.014))
        return gid, 'Woven Lattice Pointed Braid Beard', parts
    specs.append(s1_09)

    # S1-10: Tightly curled medium-long spade beard with curled handlebar mustache
    def s1_10():
        gid = 'beard_s1_10_curled_spade'
        p_curls = P_hair('beard_curls')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_curls, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.058, thick_mid=0.026, thick_bot=0.028, flare_x=0.006, flare_fwd=0.022,
                              bottom_shape='round', wave_amp=0.0025, wave_freq=6.0, lobe_count=9, lobe_amp=0.0025),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', P_hair('beard_strands'), span_x=0.046, thick=0.013, height=0.016,
                                     droop=0.014, curl_up=0.014, curl_loops=1.0))
        return gid, 'Tightly Curled Spade & Handlebar', parts
    specs.append(s1_10)

    # ===========================================================================================================
    # SHEET 2: Mustache + Goatee / Van Dyke / Braided Chin Combos (5 styles)
    # ===========================================================================================================

    # S2-01: Thick drooping walrus mustache & short triangular chin tuft
    def s2_01():
        gid = 'beard_s2_01_walrus_tuft'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_tuft', p_str, theta_max_deg=24, z_chin_top=1.586,
                              length=0.018, thick_mid=0.014, thick_bot=0.010, flare_x=-0.008, flare_fwd=0.012,
                              bottom_shape='point', point_drop=0.018),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.046, thick=0.018, height=0.022, droop=0.032, flare_out=0.006))
        return gid, 'Thick Walrus Stache & Chin Spike', parts
    specs.append(s2_01)

    # S2-02: Long thin drooping horseshoe/steppe mustache & long tapered pointed goatee
    def s2_02():
        gid = 'beard_s2_02_droop_goatee'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_goatee', p_str, theta_max_deg=26, z_chin_top=1.586,
                              length=0.038, thick_mid=0.016, thick_bot=0.008, flare_x=-0.012, flare_fwd=0.016,
                              bottom_shape='point', point_drop=0.036),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.036, thick=0.011, height=0.014, droop=0.018,
                                     hang_tail_len=0.055, hang_tail_x=0.034))
        return gid, 'Long Drooping Stache & Tapered Goatee', parts
    specs.append(s2_02)

    # S2-03: Broad sweeping Magyar mustache & compact rounded chin goatee
    def s2_03():
        gid = 'beard_s2_03_magyar_goatee'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_goatee', p_str, theta_max_deg=28, z_chin_top=1.586,
                              length=0.020, thick_mid=0.016, thick_bot=0.014, flare_x=-0.004, flare_fwd=0.012,
                              bottom_shape='round'),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.054, thick=0.017, height=0.021, droop=0.028, flare_out=0.008))
        return gid, 'Sweeping Magyar Stache & Round Goatee', parts
    specs.append(s2_03)

    # S2-04: Curled handlebar mustache & long narrow braided chin tail with cuff
    def s2_04():
        gid = 'beard_s2_04_handlebar_braid'
        p_str = P_hair('beard_strands')
        p_brd = P_hair('beard_braid')
        parts = [
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=22, z_chin_top=1.586,
                              length=0.016, thick_mid=0.014, thick_bot=0.012, flare_x=-0.006, flare_fwd=0.010,
                              bottom_shape='point', point_drop=0.012),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.048, thick=0.012, height=0.015, droop=0.020,
                                     curl_up=0.015, curl_loops=1.10))
        c_pts = [
            np.array([0.0, -0.166, 1.568]),
            np.array([0.0, -0.170, 1.530]),
            np.array([0.0, -0.170, 1.492]),
            np.array([0.0, -0.168, 1.462]),
        ]
        parts.extend(sculpt_braid_strand(gid + '_braid', c_pts, 0.012, 0.006, p_brd, cuff_ts=(0.75,), cuff_len=0.010))
        return gid, 'Curled Handlebar & Braided Chin Tail', parts
    specs.append(s2_04)

    # S2-05: Heavy vertical-hanging Cossack mustache & dagger-pointed chin beard
    def s2_05():
        gid = 'beard_s2_05_cossack_dagger'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_dagger', p_str, theta_max_deg=25, z_chin_top=1.586,
                              length=0.032, thick_mid=0.015, thick_bot=0.009, flare_x=-0.010, flare_fwd=0.014,
                              bottom_shape='point', point_drop=0.028),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.040, thick=0.015, height=0.018, droop=0.020,
                                     hang_tail_len=0.050, hang_tail_x=0.035))
        return gid, 'Heavy Cossack Stache & Dagger Goatee', parts
    specs.append(s2_05)

    # ===========================================================================================================
    # SHEET 3: Pure Mustaches (5 styles)
    # ===========================================================================================================

    # S3-01: Massive bushy walrus mustache covering upper & lower lip
    def s3_01():
        gid = 'beard_s3_01_bushy_walrus'
        p_str = P_hair('beard_strands')
        parts = sculpt_mustache(gid + '_stache', p_str, span_x=0.050, z_center=1.616, thick=0.022, height=0.028,
                                droop=0.034, flare_out=0.008, rows=16, n_ring=12)
        return gid, 'Massive Bushy Walrus Mustache', parts
    specs.append(s3_01)

    # S3-02: Long thin drooping Steppe mustache tendrils
    def s3_02():
        gid = 'beard_s3_02_steppe_tendrils'
        p_str = P_hair('beard_strands')
        parts = sculpt_mustache(gid + '_stache', p_str, span_x=0.036, z_center=1.615, thick=0.012, height=0.015,
                                droop=0.018, hang_tail_len=0.058, hang_tail_x=0.034, rows=16, n_ring=10)
        return gid, 'Long Hanging Steppe Mustache', parts
    specs.append(s3_02)

    # S3-03: Broad sweeping chevron / lampshade mustache
    def s3_03():
        gid = 'beard_s3_03_wide_chevron'
        p_str = P_hair('beard_strands')
        parts = sculpt_mustache(gid + '_stache', p_str, span_x=0.054, z_center=1.615, thick=0.018, height=0.022,
                                droop=0.030, flare_out=0.007, rows=16, n_ring=12)
        return gid, 'Broad Sweeping Chevron Mustache', parts
    specs.append(s3_03)

    # S3-04: Classic rolled handlebar mustache with jaw-level spiral curls
    def s3_04():
        gid = 'beard_s3_04_rolled_handlebar'
        p_str = P_hair('beard_strands')
        parts = sculpt_mustache(gid + '_stache', p_str, span_x=0.044, z_center=1.615, thick=0.016, height=0.020,
                                droop=0.030, curl_up=0.015, curl_loops=1.15, rows=18, n_ring=10)
        return gid, 'Classic Rolled Handlebar Mustache', parts
    specs.append(s3_04)

    # S3-05: Heavy pillar horseshoe / biker mustache descending to chin base
    def s3_05():
        gid = 'beard_s3_05_heavy_horseshoe'
        p_str = P_hair('beard_strands')
        parts = sculpt_mustache(gid + '_stache', p_str, span_x=0.038, z_center=1.615, thick=0.016, height=0.019,
                                droop=0.016, hang_tail_len=0.052, hang_tail_x=0.033, rows=16, n_ring=10)
        return gid, 'Heavy Pillar Horseshoe Mustache', parts
    specs.append(s3_05)

    # ===========================================================================================================
    # SHEET 4: Classical / Levantine / Trimmed & Full Beards (10 styles)
    # ===========================================================================================================

    # S4-01: Neat short boxed beard
    def s4_01():
        gid = 'beard_s4_01_short_boxed'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.604, z_chin_top=1.588,
                              length=0.010, thick_mid=0.009, thick_bot=0.010, flare_x=0.0, flare_fwd=0.008,
                              bottom_shape='round', soul_patch_notch=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.040, thick=0.010, height=0.013, droop=0.014))
        return gid, 'Neat Short Boxed Beard', parts
    specs.append(s4_01)

    # S4-02: Medium thick rounded full beard
    def s4_02():
        gid = 'beard_s4_02_medium_round'
        p_str = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.036, thick_mid=0.020, thick_bot=0.022, flare_x=0.004, flare_fwd=0.016,
                              bottom_shape='round', wave_amp=0.002, wave_freq=4.0),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.044, thick=0.012, height=0.015, droop=0.016))
        return gid, 'Medium Thick Rounded Beard', parts
    specs.append(s4_02)

    # S4-03: Sharp V-pointed ducktail beard
    def s4_03():
        gid = 'beard_s4_03_sharp_ducktail'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=75, z_side_top=1.634, z_cheek_mid=1.604, z_chin_top=1.588,
                              length=0.028, thick_mid=0.014, thick_bot=0.012, flare_x=-0.014, flare_fwd=0.022,
                              bottom_shape='point', point_drop=0.038, soul_patch_notch=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.042, thick=0.011, height=0.014, droop=0.015))
        return gid, 'Sharp V-Pointed Ducktail Beard', parts
    specs.append(s4_03)

    # S4-04: Crisp square-cut spade beard
    def s4_04():
        gid = 'beard_s4_04_square_spade'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.042, thick_mid=0.020, thick_bot=0.024, flare_x=0.008, flare_fwd=0.018,
                              bottom_shape='flat'),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.044, thick=0.012, height=0.015, droop=0.016))
        return gid, 'Crisp Square-Cut Spade Beard', parts
    specs.append(s4_04)

    # S4-05: Medium wavy wedge beard
    def s4_05():
        gid = 'beard_s4_05_wavy_wedge'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.606, z_chin_top=1.588,
                              length=0.024, thick_mid=0.016, thick_bot=0.016, flare_x=-0.006, flare_fwd=0.016,
                              bottom_shape='wedge', point_drop=0.018, wave_amp=0.002, wave_freq=4.0),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.042, thick=0.011, height=0.015, droop=0.015))
        return gid, 'Medium Wavy Wedge Beard', parts
    specs.append(s4_05)

    # S4-06: Heavy stubble with bold chevron mustache (Beardstache)
    def s4_06():
        gid = 'beard_s4_06_beardstache'
        p_stub = P_hair('beard_strands', base='hair_light', light='hair_light', dark='hair_base')
        p_stache = P_hair('beard_strands', base='hair_dark', light='hair_base', dark='hair_dark')
        parts = [
            sculpt_beard_mass(gid + '_stubble', p_stub, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.602, z_chin_top=1.588,
                              length=0.004, thick_top=0.0015, thick_mid=0.0035, thick_bot=0.0035, flare_x=0.0, flare_fwd=0.002,
                              bottom_shape='round', soul_patch_notch=0.008),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_stache, span_x=0.044, thick=0.014, height=0.017, droop=0.016,
                                     curl_up=0.006))
        return gid, 'Heavy Stubble & Bold Chevron Stache', parts
    specs.append(s4_06)

    # S4-07: Sculpted high-cheek dagger ducktail beard
    def s4_07():
        gid = 'beard_s4_07_dagger_ducktail'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=74, z_side_top=1.634, z_cheek_mid=1.602, z_chin_top=1.588,
                              length=0.022, thick_mid=0.013, thick_bot=0.010, flare_x=-0.016, flare_fwd=0.020,
                              bottom_shape='point', point_drop=0.040, soul_patch_notch=0.008),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.040, thick=0.011, height=0.014, droop=0.014))
        return gid, 'Sculpted Dagger Ducktail Beard', parts
    specs.append(s4_07)

    # S4-08: Long flowing natural wavy patriarch beard
    def s4_08():
        gid = 'beard_s4_08_long_patriarch'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.095, thick_mid=0.022, thick_bot=0.026, flare_x=0.012, flare_fwd=0.024,
                              bottom_shape='round', wave_amp=0.004, wave_freq=5.0, lobe_count=6, lobe_amp=0.003),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.046, thick=0.013, height=0.017, droop=0.020))
        return gid, 'Long Flowing Patriarch Beard', parts
    specs.append(s4_08)

    # S4-09: Close tapered court beard
    def s4_09():
        gid = 'beard_s4_09_tapered_court'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.602, z_chin_top=1.588,
                              length=0.008, thick_mid=0.008, thick_bot=0.008, flare_x=-0.003, flare_fwd=0.006,
                              bottom_shape='wedge', point_drop=0.008, soul_patch_notch=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.040, thick=0.010, height=0.013, droop=0.013))
        return gid, 'Close Tapered Court Beard', parts
    specs.append(s4_09)

    # S4-10: Broad Garibaldi beard with curled handlebar mustache
    def s4_10():
        gid = 'beard_s4_10_garibaldi_curled'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.062, thick_mid=0.024, thick_bot=0.028, flare_x=0.010, flare_fwd=0.022,
                              bottom_shape='flat', wave_amp=0.003, wave_freq=5.0),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.046, thick=0.013, height=0.016, droop=0.014,
                                     curl_up=0.014, curl_loops=1.0))
        return gid, 'Broad Garibaldi Beard & Curled Stache', parts
    specs.append(s4_10)

    # ===========================================================================================================
    # SHEET 5: Renaissance / Forked / Swallowtail / Stiletto & Philosopher Beards (10 styles)
    # ===========================================================================================================

    # S5-01: Wide bell-flared bushy beard with sweeping mustache
    def s5_01():
        gid = 'beard_s5_01_bell_flared'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.072, thick_mid=0.026, thick_bot=0.034, flare_x=0.032, flare_fwd=0.026,
                              bottom_shape='round', wave_amp=0.0035, wave_freq=4.0, lobe_count=5, lobe_amp=0.003),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.056, thick=0.017, height=0.022, droop=0.028, flare_out=0.010))
        return gid, 'Wide Bell-Flared Bushy Beard', parts
    specs.append(s5_01)

    # S5-02: Curled handlebar mustache & long stiletto Van Dyke goatee
    def s5_02():
        gid = 'beard_s5_02_stiletto_vandyke'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_stiletto', p_str, theta_max_deg=26, z_chin_top=1.587,
                              length=0.052, thick_mid=0.015, thick_bot=0.006, flare_x=-0.014, flare_fwd=0.018,
                              bottom_shape='point', point_drop=0.058),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.048, thick=0.014, height=0.017, droop=0.016,
                                     curl_up=0.015, curl_loops=1.10))
        return gid, 'Curled Handlebar & Long Stiletto Van Dyke', parts
    specs.append(s5_02)

    # S5-03: Pointed French Fork beard
    def s5_03():
        gid = 'beard_s5_03_french_fork'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_fork', p_str, theta_max_deg=68, z_side_top=1.632, z_cheek_mid=1.606, z_chin_top=1.588,
                              length=0.055, thick_mid=0.018, thick_bot=0.012, flare_x=-0.004, flare_fwd=0.020,
                              bottom_shape='fork', point_drop=0.048, fork_depth=0.042, fork_peak_u=0.36),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.050, thick=0.015, height=0.019, droop=0.024))
        return gid, 'Pointed French Fork Beard', parts
    specs.append(s5_03)

    # S5-04: Full rounded Burgher beard with sweeping mustache
    def s5_04():
        gid = 'beard_s5_04_burgher_round'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.058, thick_mid=0.028, thick_bot=0.032, flare_x=0.016, flare_fwd=0.026,
                              bottom_shape='round', wave_amp=0.003, wave_freq=4.5),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.054, thick=0.016, height=0.020, droop=0.024))
        return gid, 'Full Rounded Burgher Beard', parts
    specs.append(s5_04)

    # S5-05: Drooping mustache tails framing a pointed anchor chin beard
    def s5_05():
        gid = 'beard_s5_05_anchor_droop'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_anchor', p_str, theta_max_deg=68, z_side_top=1.632, z_cheek_mid=1.602, z_chin_top=1.588,
                              length=0.026, thick_mid=0.015, thick_bot=0.012, flare_x=-0.008, flare_fwd=0.016,
                              bottom_shape='point', point_drop=0.024, soul_patch_notch=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.040, thick=0.014, height=0.018, droop=0.020,
                                     hang_tail_len=0.046, hang_tail_x=0.036))
        return gid, 'Drooping Stache & Pointed Anchor Beard', parts
    specs.append(s5_05)

    # S5-06: Narrow twin-spike forked goatee with curled mustache
    def s5_06():
        gid = 'beard_s5_06_twin_spike_goatee'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_spikes', p_str, theta_max_deg=34, z_chin_top=1.587,
                              length=0.052, thick_mid=0.015, thick_bot=0.008, flare_x=-0.008, flare_fwd=0.018,
                              bottom_shape='fork', point_drop=0.052, fork_depth=0.046, fork_peak_u=0.38),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.046, thick=0.013, height=0.016, droop=0.016,
                                     curl_up=0.013, curl_loops=0.90))
        return gid, 'Narrow Twin-Spike Forked Goatee', parts
    specs.append(s5_06)

    # S5-07: Broad flat-bottomed Cathedral trapezoid beard with sweeping mustache
    def s5_07():
        gid = 'beard_s5_07_cathedral_flat'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.064, thick_mid=0.024, thick_bot=0.030, flare_x=0.020, flare_fwd=0.026,
                              bottom_shape='flat', lobe_count=7, lobe_amp=0.002),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.052, thick=0.016, height=0.020, droop=0.018,
                                     curl_up=0.013, curl_loops=0.90))
        return gid, 'Broad Flat-Bottomed Cathedral Beard', parts
    specs.append(s5_07)

    # S5-08: Wide swallowtail forked beard with curled handlebar mustache
    def s5_08():
        gid = 'beard_s5_08_swallowtail_fork'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_fork', p_str, theta_max_deg=68, z_side_top=1.632, z_cheek_mid=1.606, z_chin_top=1.588,
                              length=0.058, thick_mid=0.018, thick_bot=0.012, flare_x=0.018, flare_fwd=0.024,
                              bottom_shape='fork', point_drop=0.054, fork_depth=0.052, fork_peak_u=0.46),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.050, thick=0.015, height=0.019, droop=0.016,
                                     curl_up=0.015, curl_loops=1.0))
        return gid, 'Wide Swallowtail Forked Beard', parts
    specs.append(s5_08)

    # S5-09: Long Cavalier drooping mustache tails & compact pointed chin tuft
    def s5_09():
        gid = 'beard_s5_09_cavalier_tuft'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_beard_mass(gid + '_tuft', p_str, theta_max_deg=26, z_chin_top=1.586,
                              length=0.024, thick_mid=0.015, thick_bot=0.010, flare_x=-0.008, flare_fwd=0.014,
                              bottom_shape='point', point_drop=0.022),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.038, thick=0.014, height=0.017, droop=0.020,
                                     hang_tail_len=0.056, hang_tail_x=0.035))
        return gid, 'Long Cavalier Stache & Chin Tuft', parts
    specs.append(s5_09)

    # S5-10: Grand flowing multi-lobed philosopher beard with curled handlebar
    def s5_10():
        gid = 'beard_s5_10_grand_philosopher'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.634, z_cheek_mid=1.608, z_chin_top=1.588,
                              length=0.115, thick_mid=0.026, thick_bot=0.034, flare_x=0.026, flare_fwd=0.024,
                              bottom_shape='round', wave_amp=0.005, wave_freq=5.5, lobe_count=6, lobe_amp=0.004),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.050, thick=0.016, height=0.020, droop=0.018,
                                     curl_up=0.015, curl_loops=1.10))
        return gid, 'Grand Wavy Philosopher Beard & Handlebar', parts
    specs.append(s5_10)

    # ===========================================================================================================
    # SHEET 6: Musketeer, Cavalier, Soul-Patch Van Dyke, Balbo & Circle Beards (10 styles)
    # ===========================================================================================================

    # S6-01: Musketeer upturned mustache, soul patch & sharp triangular chin spike
    def s6_01():
        gid = 'beard_s6_01_musketeer_vandyke'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.010, width_bot=0.005, z_top=1.594, z_bot=1.580, thick=0.008),
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=24, z_chin_top=1.582,
                              length=0.018, thick_mid=0.014, thick_bot=0.008, flare_x=-0.010, flare_fwd=0.018,
                              bottom_shape='point', point_drop=0.026),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.040, thick=0.010, height=0.013, droop=0.012,
                                     curl_up=0.009, curl_loops=0.55))
        return gid, 'Musketeer Stache & Pointed Van Dyke', parts
    specs.append(s6_01)

    # S6-02: Neat chevron mustache, soul patch & short crisp pointed goatee
    def s6_02():
        gid = 'beard_s6_02_chevron_vandyke'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.009, width_bot=0.004, z_top=1.594, z_bot=1.580, thick=0.007),
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=22, z_chin_top=1.582,
                              length=0.014, thick_mid=0.012, thick_bot=0.007, flare_x=-0.008, flare_fwd=0.014,
                              bottom_shape='point', point_drop=0.020),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.038, thick=0.009, height=0.012, droop=0.014))
        return gid, 'Neat Chevron Stache & Short Van Dyke', parts
    specs.append(s6_02)

    # S6-03: Low-cheek Balbo chinstrap beard with soul patch & upturned mustache
    def s6_03():
        gid = 'beard_s6_03_balbo_chinstrap'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.011, width_bot=0.006, z_top=1.594, z_bot=1.579, thick=0.008),
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=74, z_side_top=1.630, z_cheek_mid=1.582, z_chin_top=1.582,
                              length=0.014, thick_mid=0.014, thick_bot=0.014, flare_x=0.0, flare_fwd=0.014,
                              bottom_shape='round', soul_patch_notch=0.008),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.042, thick=0.011, height=0.014, droop=0.014,
                                     curl_up=0.008, curl_loops=0.45))
        return gid, 'Low-Cheek Balbo Beard & Upturned Stache', parts
    specs.append(s6_03)

    # S6-04: Thin pencil mustache, soul patch & long slender wispy chin beard
    def s6_04():
        gid = 'beard_s6_04_pencil_long_goatee'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.008, width_bot=0.005, z_top=1.594, z_bot=1.580, thick=0.007),
            sculpt_beard_mass(gid + '_goatee', p_str, theta_max_deg=20, z_chin_top=1.582,
                              length=0.048, thick_mid=0.012, thick_bot=0.005, flare_x=-0.012, flare_fwd=0.016,
                              bottom_shape='point', point_drop=0.052),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.038, thick=0.0075, height=0.0095, droop=0.012,
                                     curl_up=0.005))
        return gid, 'Thin Pencil Stache & Long Wispy Goatee', parts
    specs.append(s6_04)

    # S6-05: Tightly curled Imperial handlebar mustache, soul patch & short pointed spade goatee
    def s6_05():
        gid = 'beard_s6_05_curled_imperial_vandyke'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.010, width_bot=0.005, z_top=1.594, z_bot=1.580, thick=0.008),
            sculpt_beard_mass(gid + '_chin', p_str, theta_max_deg=24, z_chin_top=1.582,
                              length=0.016, thick_mid=0.014, thick_bot=0.008, flare_x=-0.009, flare_fwd=0.018,
                              bottom_shape='point', point_drop=0.022),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.042, thick=0.011, height=0.014, droop=0.015,
                                     curl_up=0.013, curl_loops=1.15))
        return gid, 'Curled Imperial Handlebar & Pointed Goatee', parts
    specs.append(s6_05)

    # S6-06: Classic short full beard with soul patch & chevron mustache
    def s6_06():
        gid = 'beard_s6_06_full_short_circle'
        p_str = P_hair('beard_waves')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.011, width_bot=0.006, z_top=1.594, z_bot=1.580, thick=0.008),
            sculpt_beard_mass(gid + '_mass', p_str, theta_max_deg=76, z_side_top=1.632, z_cheek_mid=1.592, z_chin_top=1.584,
                              length=0.016, thick_mid=0.015, thick_bot=0.015, flare_x=0.002, flare_fwd=0.014,
                              bottom_shape='round', soul_patch_notch=0.010, wave_amp=0.0015, wave_freq=4.0),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.042, thick=0.011, height=0.014, droop=0.016))
        return gid, 'Classic Short Full Beard & Chevron Stache', parts
    specs.append(s6_06)

    # S6-07: Delicate upturned mustache, soul patch & medium-long narrow V-tapered goatee
    def s6_07():
        gid = 'beard_s6_07_wispy_stache_goatee'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.009, width_bot=0.005, z_top=1.594, z_bot=1.580, thick=0.007),
            sculpt_beard_mass(gid + '_goatee', p_str, theta_max_deg=22, z_chin_top=1.582,
                              length=0.036, thick_mid=0.013, thick_bot=0.006, flare_x=-0.011, flare_fwd=0.016,
                              bottom_shape='point', point_drop=0.040),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.038, thick=0.0085, height=0.011, droop=0.012,
                                     curl_up=0.008, curl_loops=0.50))
        return gid, 'Delicate Upturned Stache & Tapered Goatee', parts
    specs.append(s6_07)

    # S6-08: Connected circle beard (square-cut chin box + mustache + thin low jaw strap)
    def s6_08():
        gid = 'beard_s6_08_circle_beard_chinstrap'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.010, width_bot=0.006, z_top=1.594, z_bot=1.580, thick=0.008),
            # Square-cut central chin box
            sculpt_beard_mass(gid + '_chinbox', p_str, theta_max_deg=26, z_chin_top=1.586,
                              length=0.012, thick_mid=0.013, thick_bot=0.013, flare_x=0.002, flare_fwd=0.012,
                              bottom_shape='flat'),
            # Thin low mandibular jawline strap back to sideburns
            sculpt_beard_mass(gid + '_strap', p_str, theta_max_deg=75, z_side_top=1.630, z_cheek_mid=1.576, z_chin_top=1.578,
                              length=0.006, thick_mid=0.008, thick_bot=0.008, flare_x=0.0, flare_fwd=0.006,
                              bottom_shape='flat', soul_patch_notch=0.006),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.034, thick=0.011, height=0.014, droop=0.018,
                                     hang_tail_len=0.022, hang_tail_x=0.028))
        return gid, 'Connected Circle Beard & Thin Jaw Strap', parts
    specs.append(s6_08)

    # S6-09: Tousled Cavalier medium-short full beard & curled mustache
    def s6_09():
        gid = 'beard_s6_09_scruffy_cavalier'
        p_wav = P_hair('beard_waves')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_wav, width_top=0.011, width_bot=0.006, z_top=1.594, z_bot=1.580, thick=0.008),
            sculpt_beard_mass(gid + '_mass', p_wav, theta_max_deg=76, z_side_top=1.632, z_cheek_mid=1.590, z_chin_top=1.584,
                              length=0.022, thick_mid=0.017, thick_bot=0.016, flare_x=0.002, flare_fwd=0.016,
                              bottom_shape='wedge', point_drop=0.014, soul_patch_notch=0.010, wave_amp=0.0025, wave_freq=5.0,
                              lobe_count=6, lobe_amp=0.002),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_wav, span_x=0.042, thick=0.011, height=0.014, droop=0.014,
                                     curl_up=0.011, curl_loops=0.80))
        return gid, 'Tousled Cavalier Beard & Curled Stache', parts
    specs.append(s6_09)

    # S6-10: Upturned mustache, soul patch & long spear-pointed chin beard with low jaw strap
    def s6_10():
        gid = 'beard_s6_10_needle_spear_beard'
        p_str = P_hair('beard_strands')
        parts = [
            sculpt_soul_patch(gid + '_soul', p_str, width_top=0.010, width_bot=0.006, z_top=1.594, z_bot=1.580, thick=0.008),
            sculpt_beard_mass(gid + '_spear', p_str, theta_max_deg=72, z_side_top=1.630, z_cheek_mid=1.582, z_chin_top=1.584,
                              length=0.056, thick_mid=0.016, thick_bot=0.007, flare_x=-0.018, flare_fwd=0.024,
                              bottom_shape='point', point_drop=0.068, soul_patch_notch=0.010),
        ]
        parts.extend(sculpt_mustache(gid + '_stache', p_str, span_x=0.042, thick=0.010, height=0.013, droop=0.013,
                                     curl_up=0.010, curl_loops=0.65))
        return gid, 'Upturned Stache & Long Spear-Pointed Beard', parts
    specs.append(s6_10)

    return specs


def _split_gold_primitive(gid, parts):
    """If any part in `parts` has `_is_gold`, split the GLB indices into two primitives:
    - primitive 0: material `gid` (hair, tinted by rec.hair_color via kit.tint.roles)
    - primitive 1: material `gid + '_gold'` (untinted metallic gold cuffs/beads)
    and update .morph.bin to include both material names.
    """
    gold_flags = [bool(p.paint.get('_is_gold')) for p in parts]
    if not any(gold_flags):
        return
    tri_counts = []
    for p in parts:
        R, Cn = p.P.shape[:2]
        cols_t = Cn if p.closed else (Cn - 1)
        tri_counts.append(2 * (R - 1) * cols_t)

    glb_path = ROOT / 'pieces' / 'mpfb_male' / f'{gid}.glb'
    j, b = glbio.read_glb(glb_path.read_bytes())
    prim0 = j['meshes'][0]['primitives'][0]
    T_all = glbio.accessor(j, b, prim0['indices']).reshape(-1, 3)

    hair_tris, gold_tris = [], []
    off = 0
    for is_g, tc in zip(gold_flags, tri_counts):
        sub = T_all[off:off + tc]
        if is_g:
            gold_tris.append(sub)
        else:
            hair_tris.append(sub)
        off += tc

    if not gold_tris or not hair_tris:
        return

    T_hair = np.concatenate(hair_tris, axis=0).reshape(-1).astype(np.uint16)
    T_gold = np.concatenate(gold_tris, axis=0).reshape(-1).astype(np.uint16)

    # Add second material for untinted gold cuffs
    gold_mat = copy.deepcopy(j['materials'][0])
    gold_mat['name'] = gid + '_gold'
    gold_mat['pbrMetallicRoughness']['metallicFactor'] = 0.35
    gold_mat['pbrMetallicRoughness']['roughnessFactor'] = 0.32
    j['materials'].append(gold_mat)

    # Update prim0 indices to T_hair and add a new bufferView + accessor for T_gold on prim1
    idx_acc0 = j['accessors'][prim0['indices']]
    bv0_idx = idx_acc0['bufferView']
    idx_acc0['count'] = len(T_hair)

    b_hair = np.ascontiguousarray(T_hair).tobytes()
    b_gold = np.ascontiguousarray(T_gold).tobytes()

    # Rebuild bufferViews with updated hair indices + appended gold indices
    blobs = {bv0_idx: b_hair}
    buf_parts, boff = [], 0
    for k, v in enumerate(j['bufferViews']):
        o = v.get('byteOffset', 0)
        data = blobs.get(k, bytes(b[o:o + v['byteLength']]))
        pad = (-boff) % 4
        buf_parts.append(b'\0' * pad)
        boff += pad
        v['byteOffset'], v['byteLength'] = boff, len(data)
        buf_parts.append(data)
        boff += len(data)

    pad = (-boff) % 4
    buf_parts.append(b'\0' * pad)
    boff += pad
    bv_gold_idx = len(j['bufferViews'])
    j['bufferViews'].append({
        'buffer': 0,
        'byteOffset': boff,
        'byteLength': len(b_gold),
        'target': 34963,
    })
    buf_parts.append(b_gold)
    boff += len(b_gold)

    acc_gold_idx = len(j['accessors'])
    j['accessors'].append({
        'bufferView': bv_gold_idx,
        'componentType': 5123,
        'count': len(T_gold),
        'type': 'SCALAR',
    })

    prim1 = copy.deepcopy(prim0)
    prim1['indices'] = acc_gold_idx
    prim1['material'] = len(j['materials']) - 1
    j['meshes'][0]['primitives'].append(prim1)

    binb = bytearray(b''.join(buf_parts) + b'\0' * ((-boff) % 4))
    j['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((-len(js)) % 4)
    with open(glb_path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(binb)))
        f.write(struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb))

    # Update .morph.bin header so its material list includes both [gid, gid + '_gold']
    morph_path = ROOT / 'pieces' / 'mpfb_male' / f'{gid}.morph.bin'
    mb = morph_path.read_bytes()
    # KMR1 format: 'KMR1' (4B) + uint16 count (2B) + uint16 nl (2B) + mats utf8 (nl B) + rest
    nl_old = struct.unpack_from('<H', mb, 6)[0]
    new_mats = f'{gid}\n{gid}_gold'.encode('utf-8')
    mb_new = mb[:6] + struct.pack('<H', len(new_mats)) + new_mats + mb[8 + nl_old:]
    morph_path.write_bytes(mb_new)


def _build_one(fn):
    gid, label, parts = fn()
    entry = assemble_garment(gid, label, 'beard', None, parts, covers_hair=False, covers_face=False, legged=False)
    _split_gold_primitive(gid, parts)
    entry.pop('culture', None)
    entry.pop('_body', None)
    return entry


def main():
    t0 = time.time()
    specs = build_all_specs()
    entries = []
    for fn in specs:
        entries.append(_build_one(fn))

    kit_path = ROOT / 'data' / 'mpfb_male' / 'kit.json'
    kit = json.loads(kit_path.read_text(encoding='utf-8'))
    new_ids = {e['id'] for e in entries}
    kit['items'] = [it for it in kit['items'] if it['id'] not in new_ids] + entries
    roles = kit.setdefault('tint', {}).setdefault('roles', {})
    for e in entries:
        roles[e['id']] = 'hair'
    kit_path.write_text(json.dumps(kit, indent=2) + '\n', encoding='utf-8')
    print(f'Built and registered {len(entries)} facial hair pieces in {time.time() - t0:.2f}s (total male items: {len(kit["items"])}).')


if __name__ == '__main__':
    main()
