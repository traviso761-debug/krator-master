"""Build the Geomancer Faction / Hero NPC / PC Wardrobe Kit (18 Outfits + 19 Goggles & Face-Masks).

Generates skinned .glb and .morph.bin files for both `mpfb_male` and `mpfb_female` in:
  - `pieces/mpfb_male/`
  - `pieces/mpfb_female/`
and writes `geomancers_manifest.json` in the scratch directory containing:
  `{ "male_entries": [...], "female_entries": [...], "outfits": {...} }`
without modifying `kit.json`, `peoples.json`, `src/*`, or `build_batch2_outfits.py`.
"""
import concurrent.futures
import copy
import json
import math
import os
import sys
import time
from pathlib import Path
import numpy as np

os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
os.environ.setdefault('MKL_NUM_THREADS', '1')

ROOT = Path(__file__).resolve().parents[3]          # core/charactermodels (this file: tools/garments/cultures/)
SCRATCH = Path(__file__).resolve().parent             # the builders beside this one (once Gemini's scratch folder)
sys.path.insert(0, str(ROOT / 'tools'))

import garments as bio
from garments import (
    C, P, B, PN, Part, J, L, R, FRONT, set_body, spine_at, first_hit,
    head_frame, surface_out, chest_front, ring_points, smooth_push,
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band,
    crossed_sash, pauldron, neck_ring, limb_tube, sleeve, sleeves,
    trousers, skirt, boot, boots, sandal, head_rings, sculpted_faceplate,
    sculpted_cranium, hood, brim, tower_hat, conical_hat, crown_band,
    horn, turban, flap, blob, belt_sash, pouch_belt, strap, tube, tassel, rosette
)
import garments.paint as gpaint

# ---------------------------------------------------------------------------------------------------------------
# 1. Extend Palette & Procedural Motifs in memory for the Geomancers Kit
# ---------------------------------------------------------------------------------------------------------------
GEO_COLORS = {
    'geo_teal':        (0.11, 0.38, 0.40),
    'geo_darkteal':    (0.06, 0.22, 0.25),
    'geo_cream':       (0.90, 0.86, 0.76),
    'geo_sand':        (0.78, 0.68, 0.52),
    'geo_ochre':       (0.76, 0.50, 0.16),
    'geo_saffron':     (0.88, 0.62, 0.18),
    'geo_mustard':     (0.78, 0.56, 0.15),
    'geo_rust':        (0.58, 0.22, 0.14),
    'geo_terracotta':  (0.66, 0.31, 0.19),
    'geo_plum':        (0.35, 0.16, 0.24),
    'geo_burgundy':    (0.42, 0.11, 0.16),
    'geo_sage':        (0.45, 0.53, 0.41),
    'geo_moss':        (0.33, 0.40, 0.28),
    'geo_olive':       (0.37, 0.39, 0.25),
    'geo_slate':       (0.27, 0.32, 0.40),
    'geo_navy':        (0.15, 0.19, 0.27),
    'geo_charcoal':    (0.16, 0.16, 0.18),
    'geo_basalt':      (0.22, 0.21, 0.22),
    'geo_stone':       (0.68, 0.65, 0.58),
    'geo_darkstone':   (0.42, 0.40, 0.37),
    'geo_ivory':       (0.91, 0.88, 0.80),
    'geo_leather':     (0.35, 0.21, 0.13),
    'geo_darkleather': (0.20, 0.13, 0.09),
    'geo_tan':         (0.62, 0.49, 0.34),
    'geo_brass':       (0.78, 0.60, 0.25),
    'geo_bronze':      (0.58, 0.41, 0.19),
    'geo_cyan':        (0.32, 0.88, 0.94),
    'geo_opal':        (0.82, 0.92, 0.90),
    'geo_amber':       (0.98, 0.64, 0.12),
    'geo_jade':        (0.24, 0.78, 0.48),
}
C.update(GEO_COLORS)
gpaint.C.update(GEO_COLORS)

_ORIG_MOTIF = gpaint.motif


def _geo_motif(style, w, h, fg, bg, aspect=1.0):
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)

    if style == 'topographic':
        # Signature Geomancer topographic elevation contour lines (nested organic hills & isolines)
        img = np.empty((h, w, 3), dtype=np.float64)
        img[:] = bg
        su = u * max(1.0, min(3.0, aspect * 1.2))
        sv = v * 1.6
        elev = (
            np.sin(su * 2.0 * math.pi + 0.65 * np.sin(sv * 2.0 * math.pi))
            + 0.65 * np.cos(sv * 2.0 * math.pi * 1.3 - 0.55 * np.cos(su * 2.0 * math.pi))
            + 0.35 * np.sin((su + sv) * 2.0 * math.pi * 1.7)
        )
        phase = (elev * 3.8) % 1.0
        # Subtle elevation band tinting + crisp contour lines
        band_shade = 0.94 + 0.10 * np.floor((elev + 2.5) * 2.5) % 2
        img[:] = np.clip(img * band_shade[:, :, None], 0.0, 1.0)
        is_line = np.abs(phase - 0.5) < 0.085
        is_major = np.abs(((elev * 0.95) % 1.0) - 0.5) < 0.055
        img[is_line | is_major] = fg
        return img

    elif style == 'opal_lens':
        # Iridescent mother-of-pearl / opal crystal lens with cyan, rose, mint & cream facets
        img = np.empty((h, w, 3), dtype=np.float64)
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        r = np.hypot(dx, dy)
        ang = np.arctan2(dy, dx)
        shimmer1 = 0.5 + 0.5 * np.sin(dx * 5.0 + dy * 4.0 + np.sin(ang * 3.0))
        shimmer2 = 0.5 + 0.5 * np.cos(dx * 4.0 - dy * 6.0)
        base_col = (
            np.asarray(C['geo_opal'])[None, None, :] * 0.45
            + np.asarray(C['geo_cyan'])[None, None, :] * (0.30 * shimmer1[:, :, None])
            + np.asarray(C['nacrepink'])[None, None, :] * (0.25 * shimmer2[:, :, None])
        )
        img[:] = np.clip(base_col, 0.0, 1.0)
        # Facet grid lines and specular glint
        facet = (np.abs(np.cos(ang * 4.0)) > 0.92) & (r > 0.25) & (r < 0.78)
        img[facet] = C['white']
        glint = ((dx + 0.24) ** 2 + (dy + 0.24) ** 2) < 0.06
        img[glint] = C['white']
        tex_nacre = gpaint.sample_cultural_tex('tex.ys_band', max(w, 2), max(h, 2), C['geo_cyan'], C['geo_opal'], pal_blend=0.25)
        img = 0.60 * img + 0.40 * tex_nacre
        img[r > 0.84] = fg
        return img

    elif style == 'canyon_visor':
        # Warm amber-canyon horizon tint with sunset reflection gradient & specular glint
        img = np.empty((h, w, 3), dtype=np.float64)
        horizon = np.clip((v - 0.15) / 0.75, 0.0, 1.0)
        c_top = np.asarray(C['geo_rust']) * 0.65
        c_mid = np.asarray(C['geo_amber'])
        c_bot = np.asarray(C['geo_cream']) * 0.85
        for ch in range(3):
            img[:, :, ch] = np.where(
                horizon < 0.55,
                c_top[ch] + (c_mid[ch] - c_top[ch]) * (horizon / 0.55),
                c_mid[ch] + (c_bot[ch] - c_mid[ch]) * ((horizon - 0.55) / 0.45),
            )
        # Mountain ridge silhouette reflection across mid-visor
        ridge = 0.56 + 0.08 * np.sin(u * 4.0 * math.pi) + 0.04 * np.cos(u * 9.0 * math.pi)
        img[np.abs(v - ridge) < 0.025] = C['geo_leather']
        # Crisp white diagonal reflection streak
        glint = np.abs((u - 0.28) * 1.4 + (v - 0.35)) < 0.045
        img[glint & (v > 0.18) & (v < 0.62)] = C['white']
        img[(v < 0.09) | (v > 0.91) | (u < 0.04) | (u > 0.96)] = fg
        return img

    elif style == 'calcified_stone':
        # Stratified sedimentary limestone/travertine with porous cavities & mineral veins
        img = np.empty((h, w, 3), dtype=np.float64)
        wave = 0.08 * np.sin(u * 3.0 * math.pi) + 0.04 * np.cos(u * 7.0 * math.pi)
        strata = 0.5 + 0.5 * np.sin((v * 5.0 + wave) * 2.0 * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * (0.80 + 0.28 * strata[:, :, None])
        vein = np.abs(((v * 4.0 + wave) % 1.0) - 0.5) < 0.065
        img[vein] = fg
        # Small calcified pores
        for px, py, pr in ((0.24, 0.35, 0.07), (0.68, 0.58, 0.08), (0.45, 0.76, 0.06), (0.78, 0.28, 0.06)):
            d2 = ((u - px) * 1.6) ** 2 + ((v - py) * 1.6) ** 2
            img[d2 < pr ** 2] = C['geo_darkstone']
        return img

    elif style == 'sun_compass':
        # Engraved brass sun-compass / astrolabe dial
        img = np.empty((h, w, 3), dtype=np.float64)
        img[:] = bg
        dx, dy = (u - 0.5) * 2.0, (v - 0.5) * 2.0
        r = np.hypot(dx, dy)
        ang = np.arctan2(dy, dx)
        rings = ((r > 0.80) & (r < 0.92)) | ((r > 0.52) & (r < 0.58)) | ((r > 0.24) & (r < 0.30))
        spokes = (r < 0.82) & (np.abs(np.sin(ang * 4.0)) < 0.09)
        ticks = (r > 0.68) & (r < 0.80) & (np.abs(np.sin(ang * 16.0)) < 0.18)
        img[rings | spokes | ticks] = fg
        img[r < 0.18] = C['geo_cyan']
        return img

    elif style == 'geo_glyphs':
        # Vertical lithomancer geometric survey glyphs (triangles, plumb-circles, diamond strata)
        img = np.empty((h, w, 3), dtype=np.float64)
        img[:] = bg
        border = (u < 0.08) | (u > 0.92) | (np.abs(u - 0.14) < 0.02) | (np.abs(u - 0.86) < 0.02)
        img[border] = fg
        ny = 5.0
        cell_i = np.floor(v * ny).astype(int) % 3
        lu = (u - 0.5) * 2.4
        lv = ((v * ny) % 1.0 - 0.5) * 2.2
        r = np.hypot(lu, lv)
        # Glyph 0: Plumb circle + vertical axis
        g0 = (cell_i == 0) & (((r > 0.36) & (r < 0.50)) | (np.abs(lu) < 0.07) | (r < 0.14))
        # Glyph 1: Upward triangle + base bar
        tri_w = 0.58 * (lv + 0.55) / 1.1
        g1 = (cell_i == 1) & (
            ((lv > -0.55) & (lv < 0.55) & (np.abs(np.abs(lu) - tri_w) < 0.10))
            | ((np.abs(lv - 0.50) < 0.08) & (np.abs(lu) < 0.58))
        )
        # Glyph 2: Nested diamond + horizontal horizon line
        d = np.abs(lu) + np.abs(lv)
        g2 = (cell_i == 2) & (((np.abs(d - 0.56) < 0.09)) | ((np.abs(d - 0.24) < 0.07)) | (np.abs(lv) < 0.06))
        img[(g0 | g1 | g2) & (np.abs(u - 0.5) < 0.36)] = fg
        return img

    return _ORIG_MOTIF(style, w, h, fg, bg, aspect=aspect)


gpaint.motif = _geo_motif
bio.motif = _geo_motif


# ---------------------------------------------------------------------------------------------------------------
# 2. Shared Geomancer 3D Accoutrement, Glove, Boot & Goggle/Mask Primitives
# ---------------------------------------------------------------------------------------------------------------
def make_geo_garment(gid, label, slot, parts, role='scholar', **kw):
    """Assemble a Geomancer garment piece and tag with culture/class/type/role metadata."""
    flat_parts = []
    for p in parts:
        if isinstance(p, (list, tuple)):
            for sub in p:
                if isinstance(sub, (list, tuple)):
                    flat_parts.extend(sub)
                elif sub is not None:
                    flat_parts.append(sub)
        elif p is not None:
            flat_parts.append(p)
    entry = bio.assemble_garment(gid, label, slot, 'geomancers', flat_parts, **kw)
    entry.pop('_body', None)
    entry['culture'] = 'geomancers'
    entry['class'] = 'geomancer'
    entry['type'] = 'pc'
    entry['role'] = role
    return entry


def crystal_vial(name, center, radius=0.018, length=0.075, glass_col='geo_cyan', cap_col='geo_brass',
                 axis=(0.0, 0.0, 1.0), joint='Spine1'):
    """Build a 3D glowing crystal cylinder vial with top and bottom brass end-caps."""
    c = np.asarray(center, float)
    ax = np.asarray(axis, float)
    ax /= max(np.linalg.norm(ax), 1e-9)
    p0 = c - ax * (length * 0.5)
    p1 = c + ax * (length * 0.5)
    vial_p = P(glass_col, 0.02, [
        B('top', 0.0, 0.18, 'solid', cap_col),
        B('bottom', 0.0, 0.16, 'solid', cap_col),
    ], [
        PN(0.35, 0.55, 'solid', 'white', glass_col, 0.10),
    ], fabric='beads.glass')
    return tube(name, [p0, p1], radius, vial_p, n=10, rigid_joint=joint)


def crystal_spike(name, base_pos, tip_pos, r_base=0.020, r_tip=0.003, col='geo_cyan', base_col='geo_brass', joint='Head'):
    """Build a faceted 6-sided glowing quartz/jade crystal spike."""
    sp_p = P(col, 0.02, [
        B('top', 0.0, 0.15, 'solid', base_col),
        B('bottom', 0.0, 0.25, 'solid', 'white'),
    ], fabric='beads.glass')
    return horn(name, [base_pos, tip_pos], r_base, r_tip, sp_p, n=6, rows=5, rigid_joint=joint)


def build_glove_side(name, side, hand_paint, cuff_paint=None, finger_paint=None, f0=0.52, ease=0.015, flare=0.010):
    """Build a 3D gauntlet/glove for `side` ('Left' or 'Right') with forearm cuff, palm shell, and 5 articulated fingers."""
    out = []
    out.append(sleeve(f'{name}_cuff_{side[0]}', side, cuff_paint or hand_paint,
                      f0=f0, f1=0.96, ease=ease, flare=flare, rows=8, n=20))
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
    x_ax /= max(np.linalg.norm(x_ax), 1e-6)
    y_ax = np.cross(u_ax, x_ax)
    y_ax /= max(np.linalg.norm(y_ax), 1e-6)
    angs_p = np.linspace(0, 2 * math.pi, 20, endpoint=False)
    palm_rows = []
    for s in np.linspace(0.0, 0.96, 6):
        c = w_pt + d_hand * s
        rx = 0.040 + 0.007 * s
        ry = 0.021 * (1.0 - 0.12 * s)
        palm_rows.append([c + x_ax * (math.cos(an) * rx) + y_ax * (math.sin(an) * ry) for an in angs_p])
    pt_palm = Part(f'{name}_palm_{side[0]}', np.array(palm_rows), True, ['helper-tights'] * 6, hand_paint, rigid_joint=side + 'Hand')
    pt_palm.is_arm = True
    out.append(pt_palm)

    f_paint = finger_paint or P('geo_darkleather', 0.03, [B('top', 0.0, 0.008, 'solid', 'geo_brass')], fabric='leather.polished')
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
            f'{side}Hand', f'{side}Hand{fg}1', f'{side}Hand{fg}1',
            f'{side}Hand{fg}2', f'{side}Hand{fg}3', f'{side}Hand{fg}3', f'{side}Hand{fg}3',
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
        pt_f = Part(f'{name}_finger_{side[0]}_{fg}', np.array(f_rows), True, ['helper-tights'] * len(f_rows), f_paint)
        pt_f.row_joints = f_joints
        pt_f.is_arm = True
        out.append(pt_f)
    return out


# ---------------------------------------------------------------------------------------------------------------
# 3. 3D Goggles & Face-Mask Helper Primitives (Head-Space Raycast Contoured)
# ---------------------------------------------------------------------------------------------------------------
def goggle_head_strap(name, f_center=0.40, band_h=0.08, ease=0.012, paint=None):
    """Snug 360-degree leather/cloth strap around the cranium at goggle level with side brass buckles."""
    a, b, up, bk, left = head_frame()
    st_p = paint or P('geo_leather', 0.04, [
        B('top', 0.0, 0.008, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.008, 'solid', 'geo_brass'),
    ], fabric='leather.polished')
    ring = head_rings(name + '_strap', f_center - band_h * 0.5, f_center + band_h * 0.5, ease, st_p, n=36, rows=4, apex=False)
    ring.rigid_joint = 'Head'
    out = [ring]
    c_mid = a + (b - a) * f_center
    for sd, tag in ((-1, 'R'), (1, 'L')):
        d_s = left * sd - bk * 0.18
        d_s /= np.linalg.norm(d_s)
        h_s = first_hit(c_mid, d_s) or 0.086
        b_pos = c_mid + d_s * (h_s + ease + 0.006)
        out.append(blob(f'{name}_buckle_{tag}', b_pos, (0.022, 0.010, 0.026),
                        P('geo_brass', 0.02, fabric='metal.bronze'), n=10, rows=4, out=d_s, rigid_joint='Head'))
    return out


def goggle_eye_cup(name, side_x, f_eye=0.39, r_cup=0.029, depth=0.020, bezel_paint=None, lens_paint=None):
    """Build a 3D cylindrical goggle housing + convex lens positioned in front of the eye socket."""
    a, b, up, bk, left = head_frame()
    bz_p = bezel_paint or P('geo_brass', 0.02, [B('top', 0.0, 0.008, 'solid', 'geo_darkleather')], fabric='metal.bronze')
    ln_p = lens_paint or P('geo_opal', 0.02, [], [PN(0.0, 1.0, 'opal_lens', 'geo_brass', 'geo_opal', 0.12)], fabric='beads.glass')
    c_eye = a + (b - a) * f_eye + left * side_x
    d_out = -bk + left * (side_x * 2.2)
    d_out /= np.linalg.norm(d_out)
    h_face = first_hit(a + (b - a) * f_eye, d_out) or 0.106
    p_base = a + (b - a) * f_eye + left * (side_x * 0.85) - bk * (h_face + 0.004)
    p_front = p_base + d_out * depth
    cup = horn(name + '_cup', [p_base, p_front], r_cup * 1.06, r_cup, bz_p, n=18, rows=5, rigid_joint='Head')
    lens = rosette(name + '_lens', p_front + d_out * 0.002, d_out, left, r_cup * 0.86, ln_p, n=18, thick=0.006, rigid_joint='Head')
    return [cup, lens]


def panoramic_visor(name, f_top=0.49, f_bot=0.30, span=0.38, ease=0.020, frame_paint=None, lens_paint=None, wave_amp=0.0):
    """Build a curved wrap-around panoramic visor shield with top and bottom sculpted frame rims."""
    a, b, up, bk, left = head_frame()
    fr_p = frame_paint or P('geo_brass', 0.02, fabric='metal.bronze')
    ln_p = lens_paint or P('geo_amber', 0.02, [], [PN(0.0, 1.0, 'canyon_visor', 'geo_brass', 'geo_amber', 0.18)], fabric='beads.glass')
    rows, cols = 9, 25
    angs = np.linspace(math.pi * (1.0 - span), math.pi * (1.0 + span), cols)
    c_ref = a + (b - a) * 0.40
    base_rs = []
    for an in angs:
        d = bk * math.cos(an) + left * math.sin(an)
        h = first_hit(c_ref, d) or 0.102
        base_rs.append(h + ease)
    base_rs = np.array([np.mean([base_rs[max(0, min(cols - 1, j + dj))] for dj in (-2, -1, 0, 1, 2)]) for j in range(cols)])

    Q_lens = []
    for i in range(rows):
        v = i / (rows - 1)
        row = []
        for j, an in enumerate(angs):
            u_rel = (an - math.pi) / (math.pi * span)
            f_cur = (f_top + (f_bot - f_top) * v) + wave_amp * math.cos(u_rel * math.pi * 2.0) * (1.0 - 0.5 * abs(u_rel))
            # Slight nasal bridge notch at bottom center
            if v > 0.65 and abs(u_rel) < 0.22:
                f_cur += 0.028 * ((v - 0.65) / 0.35) * (1.0 - (abs(u_rel) / 0.22) ** 2)
            d = bk * math.cos(an) + left * math.sin(an)
            r = base_rs[j] + 0.008 * math.cos(u_rel * math.pi * 0.5) + 0.004 * math.sin(v * math.pi)
            c_z = (a + (b - a) * f_cur)[2]
            row.append(np.array([c_ref[0] + d[0] * r, c_ref[1] + d[1] * r, c_z]))
        Q_lens.append(row)
    Q_lens = np.array(Q_lens)
    pt_lens = Part(name + '_visor', Q_lens, False, ['body'] * rows, ln_p, rigid_joint='Head')
    top_rim = horn(name + '_toprim', Q_lens[0], 0.0065, 0.0065, fr_p, n=10, rows=cols, rigid_joint='Head')
    bot_rim = horn(name + '_botrim', Q_lens[-1], 0.0060, 0.0060, fr_p, n=10, rows=cols, rigid_joint='Head')
    return [pt_lens, top_rim, bot_rim]


def draped_face_veil(name, paint, f_top=0.35, z_drop=0.14, ease=0.022):
    """Build a desert keffiyeh / surveyor cloth face-and-neck veil draping from the nose bridge below the chin."""
    parts = []
    ease_eff = max(float(ease), 0.022)
    parts.append(sculpted_faceplate(
        name + '_upper_veil', paint, f_top=max(float(f_top), 0.32), f_bot=-0.06, ease=ease_eff, span=0.45,
        rows=10, cols=23, brow_relief=0.0, nose_relief=0.026, cheek_relief=0.014, chin_relief=0.018, jaw_narrow=0.20
    ))
    a, b, up, bk, left = head_frame()
    # Draped cloth folds hanging from jaw/cheeks down to throat
    rows_d, cols_d = 9, 25
    angs = np.linspace(0.52 * math.pi, 1.48 * math.pi, cols_d)
    c_jaw = a + (b - a) * 0.02
    Q_drape = []
    for i in range(rows_d):
        v = i / (rows_d - 1)
        row = []
        for an in angs:
            u_rel = (an - math.pi) / (0.48 * math.pi)
            d = bk * math.cos(an) + left * math.sin(an)
            # Pointed V-handkerchief drop in front
            front_point = max(0.0, 1.0 - abs(u_rel) * 0.85)
            z_cur = c_jaw[2] - v * (0.045 + z_drop * (0.45 + 0.55 * front_point))
            r_cur = 0.095 + ease_eff + 0.022 * v + 0.006 * math.sin(u_rel * math.pi * 5.0) * v
            row.append(np.array([c_jaw[0] + d[0] * r_cur, c_jaw[1] + d[1] * r_cur - 0.015 * front_point * v, z_cur]))
        Q_drape.append(row)
    parts.append(Part(name + '_drape', np.array(Q_drape), False, ['body'] * rows_d, paint, rigid_joint='Head'))
    return parts


# ===============================================================================================================
# 4. GEOMANCER OUTFITS 01–05 (Reference Image 1)
# ===============================================================================================================
def build_geo_01_sultan_strider():
    """01: Sultan Strider — Striped bulbous turban, leather plated harness & crystal vials, asymmetric hook-leg boot."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: White-and-teal striped bulbous turban with gold brow jewel & trailing side sash
    gid_h = 'geo_01_sultan_strider_head'
    turb_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_teal'),
    ], [
        PN(0.0, 1.0, 'vstripes', 'geo_teal', 'geo_cream', 0.08),
    ], fabric='cloth.silk')
    wrap_p = P('geo_teal', 0.04, [B('top', 0.0, 0.015, 'solid', 'geo_brass')], fabric='cloth.silk')
    jewel_p = P('geo_brass', 0.02, [B('top', 0.0, 0.02, 'solid', 'geo_cyan')], fabric='metal.gold')
    parts_h = turban(gid_h + '_turban', turb_p, wrap_paint=wrap_p, jewel_paint=jewel_p, size=1.18, ribbons=5)
    # Trailing tan sash tail on right side of turban
    tail_top = a + (b - a) * 0.58 - left * 0.11 + bk * 0.03
    parts_h.append(horn(gid_h + '_tail', [
        tail_top,
        tail_top - left * 0.05 + bk * 0.04 - up * 0.08,
        tail_top - left * 0.08 + bk * 0.07 - up * 0.17,
    ], 0.022, 0.008, P('geo_tan', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'geo_teal')]), n=10, rows=7, rigid_joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Sultan Strider Striped Bulbous Turban', 'head', parts_h, covers_hair=True))

    # TORSO: Brown leather plated breastplate & pauldron harness with glowing crystal vials + white-and-teal split tunic
    gid_t = 'geo_01_sultan_strider_torso'
    parts_t = []
    tunic_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.035, 'solid', 'geo_brass'),
        B('top', 0.0, 0.04, 'solid', 'geo_teal'),
    ], [
        PN(0.41, 0.59, 'vstripes', 'geo_teal', 'geo_cream', 0.05),
        PN(0.0, 0.14, 'vstripes', 'geo_teal', 'geo_cream', 0.05),
        PN(0.86, 1.0, 'vstripes', 'geo_teal', 'geo_cream', 0.05),
    ])
    parts_t.append(torso_tube(gid_t + '_tunic', bio.WAIST + 0.02, bio.KNEE + 0.03, 0.022, tunic_p,
                              n=44, rows=14, hang_from=bio.WAIST - 0.02, flare=0.11))
    cuir_p = P('geo_leather', 0.05, [
        B('bottom', 0.0, 0.04, 'lorica_lames', 'geo_brass', 'geo_darkleather', 0.06),
        B('top', 0.0, 0.03, 'solid', 'geo_brass'),
    ], [
        PN(0.25, 0.75, 'lorica_lames', 'geo_brass', 'geo_leather', 0.09),
    ], fabric='leather.polished')
    parts_t.append(torso_tube(gid_t + '_cuirass', bio.TOP, bio.WAIST + 0.01, 0.026, cuir_p, n=40, rows=12))
    parts_t.append(stand_collar(gid_t, P('geo_teal', 0.04, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), high=0.048))
    for s in (L, R):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{s[0]}', s, cuir_p, reach=0.48, ease=0.032, flare_end=1.10))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{s[0]}', s, P('geo_darkleather', 0.05, [
            B('bottom', 0.0, 0.16, 'lorica_lames', 'geo_brass', 'geo_leather', 0.05)
        ]), f0=0.0, f1=0.90, ease=0.020, flare=0.008))
    # Glowing crystal vials on chest harness & back plate
    for dx, dz in ((-0.055, 0.03), (0.0, 0.01), (0.055, -0.01)):
        vc = chest_front(bio.CHEST + dz, 0.042, x=dx)
        parts_t.append(crystal_vial(f'{gid_t}_vial_{dx:.2f}', vc, 0.016, 0.065, 'geo_cyan', 'geo_brass',
                                    axis=(0.3, 0.0, 1.0), joint='Spine2'))
    back_c = spine_at(bio.CHEST) + np.array([0.0, 0.145, 0.0])
    parts_t.append(rosette(gid_t + '_back_node', back_c, np.array([0, 1.0, 0]), np.array([1.0, 0, 0]), 0.048,
                           P('geo_cyan', 0.02, [B('top', 0.0, 0.015, 'solid', 'geo_brass')]), n=12, thick=0.018, rigid_joint='Spine2'))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_teal', 0.04, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]),
                              P('geo_leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.034))
    entries.append(make_geo_garment(gid_t, 'Sultan Strider Plated Leather Cuirass & Striped Tunic', 'torso', parts_t))

    # LEGS: Dark brown breeches
    gid_l = 'geo_01_sultan_strider_legs'
    leg_p = P('geo_darkleather', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'geo_brass')], fabric='leather.buckskin')
    entries.append(make_geo_garment(gid_l, 'Sultan Strider Dark Leather Breeches', 'legs',
                                    trousers(gid_l, leg_p, ankle_f=0.78, ease=0.022, bag=0.028), legged=True))

    # FEET: Asymmetric Right curled-toe boot + Left mechanical hook-prosthetic boot
    gid_f = 'geo_01_sultan_strider_feet'
    parts_f = []
    boot_p = P('geo_leather', 0.05, [
        B('top', 0.0, 0.05, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.04, 'solid', 'geo_darkleather'),
    ], fabric='leather.polished')
    # Right boot: sturdy leather boot with curled sultan toe
    parts_f.extend(boot(gid_f, R, boot_p, top_f=0.52, ease=0.020))
    tip_r = J('RightToeBase', 'tail')
    parts_f.append(horn(gid_f + '_curl_R', [
        np.array([tip_r[0], tip_r[1] - 0.012, 0.022]),
        np.array([tip_r[0], tip_r[1] - 0.045, 0.042]),
        np.array([tip_r[0], tip_r[1] - 0.032, 0.068]),
    ], 0.020, 0.005, P('geo_brass', 0.02, fabric='metal.bronze'), n=10, rows=6, rigid_joint='RightToeBase'))
    # Left leg: bronze-and-iron mechanical prosthetic leg brace with glowing cyan knee-node & curved hook-foot
    prost_p = P('geo_bronze', 0.03, [
        B('top', 0.0, 0.06, 'solid', 'geo_leather'),
        B('bottom', 0.0, 0.06, 'solid', 'iron'),
    ], fabric='metal.bronze')
    parts_f.extend(boot(gid_f, L, prost_p, top_f=0.58, ease=0.018))
    knee_l, foot_l, tip_l = J('LeftLeg'), J('LeftFoot'), J('LeftToeBase', 'tail')
    parts_f.append(rosette(gid_f + '_knee_gem_L', knee_l + np.array([0.0, -0.065, -0.02]), FRONT, np.array([1.0, 0, 0]),
                           0.028, P('geo_cyan', 0.02, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]), n=12, thick=0.014, rigid_joint='LeftLeg'))
    parts_f.append(horn(gid_f + '_hook_L', [
        np.array([foot_l[0], foot_l[1] - 0.02, 0.035]),
        np.array([tip_l[0], tip_l[1] - 0.055, 0.018]),
        np.array([tip_l[0], tip_l[1] - 0.072, 0.055]),
        np.array([tip_l[0], tip_l[1] - 0.048, 0.082]),
    ], 0.022, 0.006, P('geo_brass', 0.02, fabric='metal.bronze'), n=10, rows=8, rigid_joint='LeftFoot'))
    entries.append(make_geo_garment(gid_f, 'Sultan Strider Prosthetic Hook & Curled Boots', 'feet', parts_f))
    return {'geo_01_sultan_strider': entries}


def build_geo_02_obelisk_acolyte():
    """02: Obelisk Acolyte — Tall burgundy mitered hood-cap, plum-and-grey quilted mantle, sage harem breeches."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Tall burgundy-and-brass mitered obelisk hood-cap
    gid_h = 'geo_02_obelisk_acolyte_head'
    parts_h = []
    miter_p = P('geo_plum', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
        B('top', 0.0, 0.035, 'solid', 'geo_brass'),
    ], [
        PN(0.45, 0.55, 'solid', 'geo_brass', 'geo_plum', 0.10),
    ], fabric='cloth.wool')
    parts_h.append(hood(gid_h + '_cowl', P('geo_plum', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'geo_brass')]),
                        ease=0.022, ease_low=0.046, open_front=0.75, low=-0.42, rows=12, n=32, peak=0.02))
    parts_h.append(tower_hat(gid_h + '_miter', 0.21, lambda s: 1.02 - 0.16 * (s ** 1.3), miter_p, f=0.56, ease=0.016, rows=10, n=36))
    entries.append(make_geo_garment(gid_h, 'Obelisk Acolyte Tall Burgundy Miter-Hood', 'head', parts_h, covers_hair=True))

    # TORSO: Layered plum-and-grey quilted mantle & tunic with crystal flasks on belt
    gid_t = 'geo_02_obelisk_acolyte_torso'
    parts_t = []
    tunic_p = P('geo_plum', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'geo_brass'),
        B('top', 0.0, 0.05, 'solid', 'geo_teal'),
    ], [
        PN(0.28, 0.44, 'diamond_quilt', 'ash', 'slate', 0.14),
        PN(0.56, 0.72, 'diamond_quilt', 'ash', 'slate', 0.14),
        PN(0.44, 0.56, 'diamond_quilt', 'geo_plum', 'soot', 0.12),
    ], fabric='cloth.quilted')
    parts_t.append(torso_tube(gid_t + '_tunic', bio.TOP, bio.KNEE + 0.02, 0.024, tunic_p,
                              n=44, rows=22, hang_from=bio.WAIST - 0.02, flare=0.13))
    mantle_p = P('geo_plum', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'geo_brass'), B('top', 0.0, 0.03, 'solid', 'geo_teal')])
    parts_t.append(collar_disc(gid_t + '_mantle', 0.12, mantle_p, drop=0.065, rows=5, n=40, scallop=0.08, ease=0.028))
    parts_t.append(crossed_sash(gid_t + '_straps', P('geo_leather', 0.05, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]), width=0.048, ease=0.032))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, P('geo_cream', 0.05, [
        B('bottom', 0.0, 0.18, 'solid', 'geo_darkleather'),
        B('top', 0.0, 0.12, 'solid', 'geo_plum'),
    ]), ease_end=0.020, rows=10))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_darkleather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    # Hanging crystal flasks on front-left and back-left hip
    hip_c = spine_at(bio.WAIST - 0.04)
    for ang_v, nm in ((2.35, 'frontL'), (0.85, 'backL'), (-2.35, 'frontR')):
        dv = np.array([math.sin(ang_v), math.cos(ang_v), 0.0])
        vp = surface_out(hip_c, dv, 0.055) + np.array([0.0, 0.0, -0.05])
        parts_t.append(crystal_vial(f'{gid_t}_flask_{nm}', vp, 0.020, 0.085, 'geo_opal', 'geo_brass', joint='Hips'))
    entries.append(make_geo_garment(gid_t, 'Obelisk Acolyte Quilted Plum Mantle & Flask Tunic', 'torso', parts_t))

    # LEGS: Sage-green baggy harem breeches
    gid_l = 'geo_02_obelisk_acolyte_legs'
    harem_p = P('geo_sage', 0.05, [B('bottom', 0.0, 0.05, 'solid', 'geo_darkleather')], fabric='cloth.cotton.coarse')
    entries.append(make_geo_garment(gid_l, 'Obelisk Acolyte Sage Baggy Harem Breeches', 'legs',
                                    trousers(gid_l, harem_p, ankle_f=0.76, ease=0.030, bag=0.052), legged=True))

    # FEET: Brown field boots
    gid_f = 'geo_02_obelisk_acolyte_feet'
    boot_p = P('geo_leather', 0.05, [B('top', 0.0, 0.04, 'solid', 'geo_brass')], fabric='leather.polished')
    entries.append(make_geo_garment(gid_f, 'Obelisk Acolyte Brown Field Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), boot_p, top=0.38, ease_top=0.024)))
    return {'geo_02_obelisk_acolyte': entries}


def build_geo_03_ochre_lithomancer():
    """03: Ochre Lithomancer — Topographic ochre hooded shoulder-cape over slate gambeson, topographic front kilt."""
    entries = []

    # TORSO: Topographic ochre-gold hooded shoulder-cape over slate-blue cross-strapped gambeson with crystal vials
    gid_t = 'geo_03_ochre_lithomancer_torso'
    parts_t = []
    gamb_p = P('geo_slate', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'geo_ochre'),
        B('top', 0.0, 0.04, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'geo_slate', 'soot', 0.14),
    ], fabric='cloth.quilted')
    parts_t.append(torso_tube(gid_t + '_gambeson', bio.TOP, bio.CROTCH - 0.04, 0.024, gamb_p,
                              n=42, rows=16, hang_from=bio.WAIST - 0.02, flare=0.06))
    topo_ochre = P('geo_ochre', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'geo_leather'),
        B('top', 0.0, 0.02, 'solid', 'geo_cream'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_cream', 'geo_ochre', 0.22),
    ], fabric='cloth.wool')
    parts_t.append(collar(gid_t + '_hood_cowl', topo_ochre, height=0.075, flare=0.038, ease=0.028, open_front=False, rows=6))
    parts_t.append(collar_disc(gid_t + '_capelet', 0.145, topo_ochre, drop=0.095, rows=6, n=44, scallop=0.05, ease=0.032))
    for s in (L, R):
        parts_t.append(pauldron(f'{gid_t}_cape_sh_{s[0]}', s, topo_ochre, reach=0.45, ease=0.036, flare_end=1.15))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{s[0]}', s, P('geo_cream', 0.05, [
            B('top', 0.0, 0.28, 'topographic', 'geo_cream', 'geo_ochre', 0.22),
            B('bottom', 0.0, 0.22, 'stripes', 'geo_tan', 'geo_leather', 0.03)
        ]), f0=0.0, f1=0.90, ease=0.022, flare=0.008))
    parts_t.append(band(gid_t + '_strap1', bio.WAIST, bio.SHOULDER + 0.02, 0.050, 0.032,
                        P('geo_leather', 0.05, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]), high=math.pi * 0.44))
    parts_t.append(band(gid_t + '_strap2', bio.WAIST, bio.SHOULDER + 0.02, 0.050, 0.034,
                        P('geo_leather', 0.05, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]), high=-math.pi * 0.44))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_darkleather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_ochre')]), ease=0.036))
    # Crystal vials at left & right hip
    hip_c = spine_at(bio.WAIST - 0.03)
    for ang_v, nm in ((2.1, 'L1'), (2.4, 'L2'), (-2.1, 'R1')):
        dv = np.array([math.sin(ang_v), math.cos(ang_v), 0.0])
        vp = surface_out(hip_c, dv, 0.052) + np.array([0.0, 0.0, -0.055])
        parts_t.append(crystal_vial(f'{gid_t}_vial_{nm}', vp, 0.016, 0.075, 'geo_cyan', 'geo_brass', joint='Hips'))
    kilt_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_ochre'),
        B('top', 0.0, 0.025, 'solid', 'geo_leather'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.20),
    ])
    parts_t.extend(tabard(gid_t + '_kilt', bio.KNEE + 0.04, bio.WAIST + 0.01, kilt_p, width=0.26, ease=0.036, front=True, back=True))
    entries.append(make_geo_garment(gid_t, 'Ochre Lithomancer Topographic Capelet & Slate Gambeson', 'torso', parts_t))

    # LEGS: Slate trousers
    gid_l = 'geo_03_ochre_lithomancer_legs'
    parts_l = trousers(gid_l, P('geo_slate', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'geo_tan')]),
                       ankle_f=0.76, ease=0.024, bag=0.032)
    entries.append(make_geo_garment(gid_l, 'Ochre Lithomancer Topographic Kilt & Slate Trousers', 'legs', parts_l, legged=True))

    # FEET: Wrapped leather field boots
    gid_f = 'geo_03_ochre_lithomancer_feet'
    boot_p = P('geo_leather', 0.05, [B('top', 0.0, 0.06, 'stripes', 'geo_tan', 'geo_leather', 0.028)], fabric='leather.buckskin')
    entries.append(make_geo_garment(gid_f, 'Ochre Lithomancer Wrapped Leather Field Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), boot_p, top=0.52, wraps=4, wrap_paint=P('geo_tan', 0.05), ease_top=0.026)))
    return {'geo_03_ochre_lithomancer': entries}


def build_geo_04_crystal_warden():
    """04: Crystal Warden — Horned crystal brow circlet, fur mantle with glowing shoulder crystals, crimson cape & gauntlets."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Horned crystal-spike brow circlet
    gid_h = 'geo_04_crystal_warden_head'
    parts_h = []
    circ_p = P('geo_bronze', 0.03, [
        B('top', 0.0, 0.012, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.012, 'solid', 'crimson'),
    ], fabric='metal.bronze')
    parts_h.append(crown_band(gid_h + '_circlet', circ_p, f0=0.48, f1=0.68, ease=0.016, flare=0.008, rows=5, n=36))
    # Twin upward-jutting glowing cyan crystal horns on forehead temples
    for sd, tag in ((-1, 'R'), (1, 'L')):
        p_base = a + (b - a) * 0.62 + left * (sd * 0.058) - bk * 0.095
        p_tip = p_base + up * 0.115 + left * (sd * 0.018) - bk * 0.015
        parts_h.append(crystal_spike(f'{gid_h}_horn_{tag}', p_base, p_tip, r_base=0.020, r_tip=0.004, col='geo_cyan', joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Crystal Warden Horned Quartz Brow Circlet', 'head', parts_h,
                                    role='military', covers_hair=False))

    # TORSO: Heavy brown fur shoulder-mantle with glowing cyan shoulder crystals + crimson scalloped cape & dark brown longcoat
    gid_t = 'geo_04_crystal_warden_torso'
    parts_t = []
    coat_p = P('geo_darkleather', 0.05, [
        B('bottom', 0.0, 0.05, 'dentils', 'geo_teal', 'geo_brass', 0.04),
        B('bottom', 0.05, 0.08, 'solid', 'crimson'),
        B('top', 0.0, 0.04, 'solid', 'geo_brass'),
    ], [
        PN(0.36, 0.64, 'lorica_lames', 'geo_slate', 'geo_darkleather', 0.12),
    ], fabric='leather.buckskin')
    parts_t.append(torso_tube(gid_t + '_longcoat', bio.TOP, bio.ANKLE + 0.10, 0.026, coat_p,
                              n=46, rows=24, hang_from=bio.WAIST - 0.02, flare=0.14))
    # Crimson scalloped mid-back cape with white chevron tips
    cape_p = P('crimson', 0.04, [
        B('bottom', 0.0, 0.06, 'zigzag', 'white', 'crimson', 0.05),
        B('top', 0.0, 0.04, 'solid', 'geo_tan'),
    ], fabric='cloth.wool')
    parts_t.append(cape(gid_t + '_crimson_cape', bio.CROTCH - 0.06, cape_p, z_top=bio.SHOULDER + 0.02, span=0.58, ease=0.042, flare=0.12))
    # Heavy brown fur shoulder mantle
    fur_p = P('darkfur', 0.09, [B('bottom', 0.0, 0.025, 'solid', 'geo_tan')], fabric='fur.short')
    parts_t.append(collar_disc(gid_t + '_fur_collar', 0.12, fur_p, drop=0.048, rows=5, n=40, scallop=0.12, ease=0.034))
    for s, sgn in ((L, 1.0), (R, -1.0)):
        parts_t.append(pauldron(f'{gid_t}_fur_sh_{s[0]}', s, fur_p, reach=0.50, ease=0.040, flare_end=1.18))
        # Large glowing cyan shoulder crystals erupting from each pauldron
        sh_j = J(s + 'Arm')
        for k_c, (dx, dz, h_c) in enumerate(((0.03, 0.03, 0.095), (0.06, 0.01, 0.075))):
            cb = sh_j + np.array([sgn * dx, -0.01, dz])
            ct = cb + np.array([sgn * 0.035, 0.0, h_c])
            parts_t.append(crystal_spike(f'{gid_t}_sh_crys_{s[0]}_{k_c}', cb, ct, r_base=0.026, r_tip=0.006,
                                         col='geo_cyan', joint=s + 'Arm'))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{s[0]}', s, P('geo_darkleather', 0.05), f0=0.0, f1=0.65, ease=0.022, flare=0.006))
    parts_t.append(crossed_sash(gid_t + '_bandolier', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.055, ease=0.036))
    entries.append(make_geo_garment(gid_t, 'Crystal Warden Fur-Crowned Longcoat & Crimson Cape', 'torso', parts_t, role='military'))

    # GLOVES: Crystal-plated gauntlets
    gid_g = 'geo_04_crystal_warden_gloves'
    gaunt_p = P('geo_slate', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.02, 'solid', 'geo_cyan'),
    ], fabric='metal.iron')
    parts_g = []
    for s, sgn in ((L, 1.0), (R, -1.0)):
        parts_g.extend(build_glove_side(gid_g, s, gaunt_p, cuff_paint=gaunt_p, f0=0.45, ease=0.018, flare=0.012))
        fa_j, h_j = J(s + 'ForeArm'), J(s + 'Hand')
        mid_fa = fa_j + (h_j - fa_j) * 0.55 + np.array([sgn * 0.025, 0.0, 0.015])
        parts_g.append(crystal_spike(f'{gid_g}_blade_{s[0]}', mid_fa, mid_fa + (fa_j - h_j) * 0.45 + np.array([sgn * 0.025, 0.0, 0.02]),
                                     r_base=0.018, r_tip=0.004, col='geo_cyan', joint=s + 'ForeArm'))
    entries.append(make_geo_garment(gid_g, 'Crystal Warden Quartz-Bladed Gauntlets', 'gloves', parts_g, role='military'))

    # LEGS & FEET
    gid_l = 'geo_04_crystal_warden_legs'
    entries.append(make_geo_garment(gid_l, 'Crystal Warden Dark Slate Breeches', 'legs',
                                    trousers(gid_l, P('geo_slate', 0.05), ankle_f=0.80, ease=0.022, bag=0.020),
                                    role='military', legged=True))
    gid_f = 'geo_04_crystal_warden_feet'
    boot_p = P('geo_darkleather', 0.05, [B('top', 0.0, 0.05, 'solid', 'geo_brass'), B('bottom', 0.0, 0.04, 'solid', 'iron')], fabric='leather.polished')
    entries.append(make_geo_garment(gid_f, 'Crystal Warden Heavy Armored Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), boot_p, top=0.48, ease_top=0.028), role='military'))
    return {'geo_04_crystal_warden': entries}


def build_geo_05_dune_chevalier():
    """05: Dune Chevalier — Wide-brimmed cream cavalier hat + white neck-wrap, slate breastplate & sun-compass, saffron pouf breeches."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Wide-brimmed cream cavalier hat + high white neck-wrap
    gid_h = 'geo_05_dune_chevalier_head'
    parts_h = []
    hat_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'geo_leather'),
        B('top', 0.0, 0.02, 'solid', 'geo_tan'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.20),
    ], fabric='cloth.felt')
    parts_h.append(tower_hat(gid_h + '_crown', 0.11, lambda s: 1.0 - 0.12 * s, hat_p, f=0.62, ease=0.015, rows=8, n=36))
    parts_h.append(brim(gid_h + '_brim', 0.60, 0.165, hat_p, ease=0.016, rows=6, n=44, lift=0.022, droop=0.008, scallop=0.04))
    # High white pleated desert neck-wrap covering chin and throat
    wrap_p = P('white', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'geo_brass'), B('top', 0.0, 0.015, 'solid', 'geo_cream')])
    parts_h.extend(draped_face_veil(gid_h + '_neckwrap', wrap_p, f_top=0.32, z_drop=0.11, ease=0.022))
    entries.append(make_geo_garment(gid_h, 'Dune Chevalier Wide Cavalier Hat & White Neck-Wrap', 'head', parts_h,
                                    role='military', covers_hair=True, covers_face=True))

    # TORSO: Slate-blue steel breastplate with brass sun-compass & sweeping floor-length topographic-lined cream cape
    gid_t = 'geo_05_dune_chevalier_torso'
    parts_t = []
    plate_p = P('geo_slate', 0.03, [
        B('bottom', 0.0, 0.05, 'lorica_lames', 'geo_brass', 'geo_slate', 0.05),
        B('top', 0.0, 0.03, 'solid', 'geo_brass'),
    ], [
        PN(0.25, 0.75, 'lorica_lames', 'silver', 'geo_slate', 0.08),
    ], fabric='metal.iron')
    parts_t.append(torso_tube(gid_t + '_cuirass', bio.TOP, bio.CROTCH + 0.02, 0.026, plate_p,
                              n=42, rows=16, hang_from=bio.WAIST - 0.02, flare=0.06))
    # Large brass sun-compass dial on left chest
    comp_c = chest_front(bio.CHEST + 0.02, 0.040, x=0.058)
    comp_p = P('geo_brass', 0.02, [], [PN(0.0, 1.0, 'sun_compass', 'geo_leather', 'geo_brass', 0.14)], fabric='metal.gold')
    parts_t.append(rosette(gid_t + '_sun_compass', comp_c, FRONT, np.array([1.0, 0, 0]), 0.048, comp_p, n=16, thick=0.014, rigid_joint='Spine2'))
    parts_t.append(crossed_sash(gid_t + '_baldric', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.048, ease=0.034))
    # Slate shoulder pauldrons & steel-plated sleeves
    for s in (L, R):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{s[0]}', s, plate_p, reach=0.48, ease=0.034, flare_end=1.12))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{s[0]}', s, P('geo_cream', 0.04, [
            B('bottom', 0.0, 0.35, 'lorica_lames', 'geo_brass', 'geo_slate', 0.05)
        ]), f0=0.0, f1=0.92, ease=0.020, flare=0.008))
    # Sweeping floor-length topographic-lined cream cape with slate-blue shoulder mantle yoke
    cape_p = P('geo_cream', 0.04, [
        B('top', 0.0, 0.18, 'topographic', 'geo_brass', 'geo_slate', 0.16),
        B('bottom', 0.0, 0.03, 'solid', 'geo_tan'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.28),
    ], fabric='cloth.wool')
    parts_t.append(cape(gid_t + '_cape', bio.ANKLE + 0.04, cape_p, z_top=bio.SHOULDER + 0.02, span=0.40, ease=0.042, flare=0.10, rows=22))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    stole_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'geo_glyphs', 'geo_leather', 'geo_cream', 0.22),
    ])
    parts_t.extend(tabard(gid_t + '_stole', bio.KNEE - 0.06, bio.WAIST + 0.01, stole_p, width=0.14, ease=0.040, front=True, back=False))
    entries.append(make_geo_garment(gid_t, 'Dune Chevalier Sun-Compass Cuirass & Topographic Cape', 'torso', parts_t, role='military'))

    # LEGS: Saffron-yellow pouf breeches
    gid_l = 'geo_05_dune_chevalier_legs'
    pouf_p = P('geo_saffron', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'geo_slate'),
        B('top', 0.0, 0.04, 'solid', 'geo_cream'),
    ], [
        PN(0.15, 0.35, 'topographic', 'geo_cream', 'geo_saffron', 0.18),
        PN(0.65, 0.85, 'topographic', 'geo_cream', 'geo_saffron', 0.18),
    ], fabric='cloth.silk')
    parts_l = trousers(gid_l, pouf_p, ankle_f=0.58, ease=0.032, bag=0.058, rows=16)
    entries.append(make_geo_garment(gid_l, 'Dune Chevalier Saffron Pouf Breeches & Glyphic Stole', 'legs', parts_l,
                                    role='military', legged=True))

    # FEET: Steel-greaved cavalier boots with white spats
    gid_f = 'geo_05_dune_chevalier_feet'
    greave_p = P('geo_slate', 0.03, [
        B('top', 0.0, 0.05, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.06, 'solid', 'geo_cream'),
    ], fabric='metal.iron')
    entries.append(make_geo_garment(gid_f, 'Dune Chevalier Steel-Greaved Cavalier Boots', 'feet',
                                    boots(gid_f, P('geo_cream', 0.04), greave_p, top=0.78, ease_top=0.026), role='military'))
    return {'geo_05_dune_chevalier': entries}


# ===============================================================================================================
# 5. GEOMANCER OUTFITS 06–10 (Reference Image 2)
# ===============================================================================================================
def build_geo_06_chime_oracle():
    """06: Chime Oracle — Wide flat parasol hat with golden crystal chimes + goggle-mask, moss topographic poncho & astrolabe."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Wide flat parasol hat hung with golden crystal chimes + goggle-mask
    gid_h = 'geo_06_chime_oracle_head'
    parts_h = []
    parts_h.append(hood(gid_h + '_cowl', P('geo_moss', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'geo_brass')]),
                        ease=0.020, ease_low=0.044, open_front=0.68, low=-0.42, rows=11, n=32))
    mask_p = P('geo_darkleather', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'geo_brass')], fabric='leather.polished')
    parts_h.append(sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.65, f_bot=-0.05, ease=0.013))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        parts_h.extend(goggle_eye_cup(f'{gid_h}_gog_{tag}', sd * 0.034, f_eye=0.40, r_cup=0.026, depth=0.018,
                                      bezel_paint=P('geo_brass', 0.02), lens_paint=P('geo_amber', 0.02)))
    hat_p = P('geo_tan', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
        B('top', 0.0, 0.03, 'solid', 'geo_moss'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_leather', 'geo_tan', 0.24),
    ])
    parts_h.append(conical_hat(gid_h + '_parasol', hat_p, f_base=0.72, f_top=1.06, r_base=0.29, r_top=0.02, rows=9, n=40))
    # Ring of 12 dangling golden crystal chimes around the parasol rim
    c_rim = a + (b - a) * 0.72
    chime_p = P('geo_amber', 0.02, [B('top', 0.0, 0.015, 'solid', 'geo_brass')], fabric='beads.glass')
    for k in range(12):
        an = 2.0 * math.pi * k / 12.0
        d_r = bk * math.cos(an) + left * math.sin(an)
        top_p = c_rim + d_r * 0.275
        parts_h.append(tassel(f'{gid_h}_chime_{k}', top_p, 0.055, 0.008, chime_p, rigid_joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Chime Oracle Crystal-Fringed Parasol & Goggle-Mask', 'head', parts_h,
                                    covers_hair=True, covers_face=True))

    # TORSO: Layered moss-green topographic poncho-shawl with golden astrolabe chest ring & pleated cream-and-green robes
    gid_t = 'geo_06_chime_oracle_torso'
    parts_t = []
    robe_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'geo_moss'),
        B('top', 0.0, 0.04, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 0.35, 'fluted', 'geo_sage', 'geo_moss', 0.08),
        PN(0.65, 1.0, 'fluted', 'geo_sage', 'geo_moss', 0.08),
        PN(0.35, 0.65, 'fluted', 'geo_cream', 'geo_tan', 0.06),
    ])
    parts_t.append(torso_tube(gid_t + '_robe', bio.TOP, bio.ANKLE + 0.06, 0.026, robe_p,
                              n=46, rows=24, hang_from=bio.WAIST - 0.02, flare=0.15))
    poncho_p = P('geo_moss', 0.05, [
        B('bottom', 0.0, 0.04, 'dentils', 'geo_brass', 'geo_moss', 0.04),
        B('top', 0.0, 0.03, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_moss', 0.22),
    ], fabric='cloth.wool')
    parts_t.append(cape(gid_t + '_poncho', bio.CROTCH - 0.06, poncho_p, z_top=bio.TOP, span=0.82, ease=0.040, flare=0.14, rows=16))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.024, poncho_p, ease_end=0.042, rows=10))
    # Golden astrolabe chest ring on the front of the poncho
    astro_c = chest_front(bio.CHEST - 0.01, 0.046)
    astro_p = P('geo_brass', 0.02, [], [PN(0.0, 1.0, 'sun_compass', 'geo_leather', 'geo_brass', 0.14)], fabric='metal.gold')
    parts_t.append(rosette(gid_t + '_astrolabe', astro_c, FRONT, np.array([1.0, 0, 0]), 0.062, astro_p, n=18, thick=0.014, rigid_joint='Spine2'))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_tan', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.038))
    entries.append(make_geo_garment(gid_t, 'Chime Oracle Topographic Poncho & Astrolabe Robe', 'torso', parts_t))

    # LEGS & FEET
    gid_l = 'geo_06_chime_oracle_legs'
    entries.append(make_geo_garment(gid_l, 'Chime Oracle Pleated Under-Trousers', 'legs',
                                    trousers(gid_l, P('geo_moss', 0.05), ankle_f=0.82, ease=0.022, bag=0.025), legged=True))
    gid_f = 'geo_06_chime_oracle_feet'
    entries.append(make_geo_garment(gid_f, 'Chime Oracle Dark Leather Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_darkleather', 0.05), top=0.36, ease_top=0.022)))
    return {'geo_06_chime_oracle': entries}


def build_geo_07_exo_rig_engineer():
    """07: Exo-Rig Engineer — Brow goggles, mustard cropped jacket, amber cylinder backpack, right brass exo-gauntlet & exo-boots."""
    entries = []

    # HEAD: Brow goggles perched on forehead
    gid_h = 'geo_07_exo_rig_engineer_head'
    parts_h = goggle_head_strap(gid_h, f_center=0.58, band_h=0.06, ease=0.014)
    for sd, tag in ((-1, 'R'), (1, 'L')):
        parts_h.extend(goggle_eye_cup(f'{gid_h}_cup_{tag}', sd * 0.036, f_eye=0.58, r_cup=0.026, depth=0.018,
                                      bezel_paint=P('geo_brass', 0.02), lens_paint=P('geo_opal', 0.02)))
    entries.append(make_geo_garment(gid_h, 'Exo-Rig Engineer Forehead Goggles', 'head', parts_h, covers_hair=False))

    # TORSO: Mustard-yellow cropped jacket & leather harness
    gid_t = 'geo_07_exo_rig_engineer_torso'
    parts_t = []
    shirt_p = P('geo_charcoal', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'geo_brass'), B('top', 0.0, 0.03, 'solid', 'geo_cream')])
    parts_t.append(torso_tube(gid_t + '_shirt_hem', bio.WAIST + 0.03, bio.WAIST - 0.05, 0.020, shirt_p, n=38, rows=5))
    jkt_p = P('geo_mustard', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_leather'),
        B('top', 0.0, 0.035, 'solid', 'geo_leather'),
    ], [
        PN(0.45, 0.55, 'solid', 'geo_charcoal', 'geo_mustard', 0.10),
    ], fabric='cloth.cotton.coarse')
    parts_t.append(torso_tube(gid_t + '_jacket', bio.TOP, bio.WAIST + 0.02, 0.026, jkt_p, n=40, rows=12))
    parts_t.append(collar(gid_t + '_collar', jkt_p, height=0.05, flare=0.022, ease=0.030, open_front=True))
    parts_t.extend(sleeves(gid_t, 'elbow', 0.020, jkt_p, ease_end=0.025, rows=8))
    parts_t.append(crossed_sash(gid_t + '_harness', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.046, ease=0.036))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.038))
    entries.append(make_geo_garment(gid_t, 'Exo-Rig Engineer Mustard Cropped Jacket & Harness', 'torso', parts_t))

    # BACK: Brass-and-amber glowing cylinder backpack
    gid_b = 'geo_07_exo_rig_engineer_back'
    parts_b = []
    back_c = spine_at(bio.CHEST - 0.01) + np.array([0.0, 0.155, 0.0])
    frame_p = P('geo_brass', 0.03, [B('top', 0.0, 0.03, 'solid', 'geo_leather'), B('bottom', 0.0, 0.03, 'solid', 'geo_leather')], fabric='metal.bronze')
    parts_b.append(blob(gid_b + '_chassis', back_c, (0.20, 0.10, 0.24), frame_p, n=14, rows=6, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        cyl_c = back_c + np.array([sd * 0.068, 0.025, 0.0])
        parts_b.append(crystal_vial(f'{gid_b}_tank_{tag}', cyl_c, radius=0.036, length=0.22,
                                    glass_col='geo_amber', cap_col='geo_brass', axis=(0.0, 0.0, 1.0), joint='Spine2'))
    entries.append(make_geo_garment(gid_b, 'Exo-Rig Engineer Twin Amber Tank Backpack', 'back', parts_b))

    # GLOVES: Heavy brass right-arm exo-gauntlet + left leather work glove
    gid_g = 'geo_07_exo_rig_engineer_gloves'
    parts_g = []
    exo_p = P('geo_brass', 0.02, [
        B('top', 0.0, 0.04, 'solid', 'geo_amber'),
        B('bottom', 0.0, 0.03, 'solid', 'iron'),
    ], [
        PN(0.0, 1.0, 'lorica_lames', 'geo_brass', 'geo_leather', 0.06),
    ], fabric='metal.bronze')
    work_p = P('geo_leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_tan')], fabric='leather.buckskin')
    parts_g.extend(build_glove_side(gid_g, R, exo_p, cuff_paint=exo_p, finger_paint=exo_p, f0=0.28, ease=0.024, flare=0.016))
    # Piston strut and amber power node on Right exo-gauntlet
    fa_r, h_r = J('RightForeArm'), J('RightHand')
    parts_g.append(tube(gid_g + '_piston_R', [fa_r + np.array([-0.035, 0.0, 0.02]), h_r + np.array([-0.032, 0.0, 0.015])],
                        0.014, P('geo_amber', 0.02, [B('top', 0.0, 0.25, 'solid', 'geo_brass')]), n=10, rigid_joint='RightForeArm'))
    parts_g.extend(build_glove_side(gid_g, L, work_p, cuff_paint=work_p, f0=0.62, ease=0.015, flare=0.008))
    entries.append(make_geo_garment(gid_g, 'Exo-Rig Engineer Powered Right Gauntlet & Work Glove', 'gloves', parts_g))

    # LEGS: Charcoal cargo breeches
    gid_l = 'geo_07_exo_rig_engineer_legs'
    cargo_p = P('geo_charcoal', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'geo_brass')], fabric='cloth.cotton.coarse')
    entries.append(make_geo_garment(gid_l, 'Exo-Rig Engineer Charcoal Cargo Breeches', 'legs',
                                    trousers(gid_l, cargo_p, ankle_f=0.72, ease=0.026, bag=0.038), legged=True))

    # FEET: Articulated brass exo-brace boots
    gid_f = 'geo_07_exo_rig_engineer_feet'
    parts_f = boots(gid_f, P('soot', 0.08), P('geo_leather', 0.05, [B('top', 0.0, 0.04, 'solid', 'geo_brass')]), top=0.45, ease_top=0.024)
    for s, sgn in ((L, 1.0), (R, -1.0)):
        knee, foot = J(s + 'Leg'), J(s + 'Foot')
        # Outer mechanical brass exo-strut & knee hinge
        p_k = knee + np.array([sgn * 0.062, -0.01, 0.01])
        p_f = foot + np.array([sgn * 0.052, -0.01, 0.04])
        parts_f.append(tube(f'{gid_f}_strut_{s[0]}', [p_k, p_f], 0.014, P('geo_brass', 0.02, fabric='metal.bronze'), n=10, rigid_joint=s + 'Leg'))
        parts_f.append(rosette(f'{gid_f}_hinge_{s[0]}', p_k, np.array([sgn, 0.0, 0.0]), FRONT, 0.032,
                               P('geo_brass', 0.02, [B('top', 0.0, 0.01, 'solid', 'geo_amber')]), n=12, thick=0.014, rigid_joint=s + 'Leg'))
    entries.append(make_geo_garment(gid_f, 'Exo-Rig Engineer Brass Exo-Brace Boots', 'feet', parts_f))
    return {'geo_07_exo_rig_engineer': entries}


def build_geo_08_calcified_nomad():
    """08: Calcified Nomad — Brow goggles & rust scarf, huge asymmetric calcified stone right pauldron & split coat."""
    entries = []

    # HEAD: Brow goggles & rust-red neck scarf
    gid_h = 'geo_08_calcified_nomad_head'
    parts_h = goggle_head_strap(gid_h, f_center=0.56, band_h=0.06, ease=0.014)
    for sd, tag in ((-1, 'R'), (1, 'L')):
        parts_h.extend(goggle_eye_cup(f'{gid_h}_gog_{tag}', sd * 0.035, f_eye=0.56, r_cup=0.025, depth=0.018,
                                      bezel_paint=P('geo_brass', 0.02), lens_paint=P('geo_amber', 0.02)))
    scarf_p = P('geo_rust', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'geo_brass'), B('top', 0.0, 0.02, 'solid', 'geo_cream')])
    parts_h.extend(draped_face_veil(gid_h + '_scarf', scarf_p, f_top=0.28, z_drop=0.12, ease=0.016))
    entries.append(make_geo_garment(gid_h, 'Calcified Nomad Brow Goggles & Rust Face-Scarf', 'head', parts_h,
                                    covers_hair=False, covers_face=True))

    # TORSO: Huge asymmetric calcified stone right shoulder-pauldron & rust-red/cream split surveyor coat with brass rings
    gid_t = 'geo_08_calcified_nomad_torso'
    parts_t = []
    coat_p = P('geo_rust', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'geo_darkleather'),
        B('top', 0.0, 0.04, 'solid', 'geo_rust'),
    ], [
        PN(0.32, 0.68, 'topographic', 'geo_tan', 'geo_cream', 0.22),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_coat', bio.TOP, bio.ANKLE + 0.12, 0.024, coat_p,
                              n=44, rows=24, hang_from=bio.WAIST - 0.02, flare=0.14))
    parts_t.append(collar(gid_t + '_collar', P('geo_rust', 0.05), height=0.065, flare=0.028, ease=0.028))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, P('geo_rust', 0.05, [B('bottom', 0.0, 0.18, 'solid', 'geo_cream')]), ease_end=0.028, rows=10))
    # Huge sculpted calcified limestone Right shoulder pauldron with glowing mineral pockets
    stone_p = P('geo_stone', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_darkstone'),
    ], [
        PN(0.0, 1.0, 'calcified_stone', 'geo_cream', 'geo_stone', 0.18),
    ])
    sh_r = J('RightArm') + np.array([-0.035, 0.01, 0.025])
    parts_t.append(blob(gid_t + '_stone_pauldron_R', sh_r, (0.22, 0.19, 0.16), stone_p,
                        n=18, rows=8, out=np.array([-0.85, -0.2, 0.45]), rigid_joint='RightArm'))
    parts_t.append(blob(gid_t + '_stone_gem_R', sh_r + np.array([-0.06, -0.05, 0.03]), (0.055, 0.035, 0.045),
                        P('geo_amber', 0.02, [B('top', 0.0, 0.01, 'solid', 'white')]), n=12, rows=5,
                        out=np.array([-0.7, -0.6, 0.3]), rigid_joint='RightArm'))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_darkleather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    # Brass survey rings at right hip
    hip_c = spine_at(bio.WAIST - 0.03)
    ring_pos = surface_out(hip_c, np.array([-0.75, -0.65, 0.0]), 0.052) + np.array([0.0, 0.0, -0.04])
    parts_t.append(rosette(gid_t + '_survey_ring', ring_pos, np.array([-0.75, -0.65, 0.0]), np.array([0.0, 0.0, 1.0]),
                           0.045, P('geo_brass', 0.02, fabric='metal.bronze'), n=16, thick=0.010, rigid_joint='Hips'))
    entries.append(make_geo_garment(gid_t, 'Calcified Nomad Stone-Pauldron Split Surveyor Coat', 'torso', parts_t))

    # LEGS & FEET
    gid_l = 'geo_08_calcified_nomad_legs'
    entries.append(make_geo_garment(gid_l, 'Calcified Nomad Dark Desert Trousers', 'legs',
                                    trousers(gid_l, P('geo_darkleather', 0.05), ankle_f=0.78, ease=0.024, bag=0.030), legged=True))
    gid_f = 'geo_08_calcified_nomad_feet'
    entries.append(make_geo_garment(gid_f, 'Calcified Nomad Laced Leather Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_leather', 0.05, [B('top', 0.0, 0.04, 'solid', 'geo_brass')]), top=0.44, ease_top=0.024)))
    return {'geo_08_calcified_nomad': entries}


def build_geo_09_amber_alchemist():
    """09: Amber Alchemist — Dual-tube brass respirator & goggles, olive surveyor tunic with amber vial bandolier & 3-vial rack."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Dual-tube brass respirator & goggles
    gid_h = 'geo_09_amber_alchemist_head'
    parts_h = goggle_head_strap(gid_h, f_center=0.40, band_h=0.07, ease=0.012)
    mask_p = P('geo_brass', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_darkleather'),
        B('top', 0.0, 0.02, 'solid', 'geo_leather'),
    ], fabric='metal.bronze')
    parts_h.append(sculpted_faceplate(gid_h + '_respirator', mask_p, f_top=0.48, f_bot=-0.06, ease=0.014, span=0.42))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        parts_h.extend(goggle_eye_cup(f'{gid_h}_gog_{tag}', sd * 0.035, f_eye=0.41, r_cup=0.026, depth=0.018,
                                      bezel_paint=P('geo_brass', 0.02), lens_paint=P('geo_amber', 0.02)))
        # Corrugated breathing hose from cheek valve down to collar
        p_cheek = a + (b - a) * 0.14 + left * (sd * 0.052) - bk * 0.115
        p_mid = a + (b - a) * (-0.08) + left * (sd * 0.082) - bk * 0.105
        p_col = a + (b - a) * (-0.28) + left * (sd * 0.065) - bk * 0.065
        hose_p = P('geo_darkleather', 0.04, [B('top', 0.0, 0.8, 'stripes', 'geo_brass', 'geo_darkleather', 0.025)])
        parts_h.append(horn(f'{gid_h}_hose_{tag}', [p_cheek, p_mid, p_col], 0.016, 0.014, hose_p, n=10, rows=8, rigid_joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Amber Alchemist Dual-Tube Brass Respirator & Goggles', 'head', parts_h,
                                    covers_hair=False, covers_face=True))

    # TORSO: Slate-and-olive surveyor tunic with glowing amber vial bandolier
    gid_t = 'geo_09_amber_alchemist_torso'
    parts_t = []
    tunic_p = P('geo_olive', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'geo_brass'),
        B('top', 0.0, 0.05, 'solid', 'geo_slate'),
    ], [
        PN(0.32, 0.68, 'topographic', 'geo_tan', 'geo_olive', 0.20),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_tunic', bio.TOP, bio.KNEE + 0.04, 0.024, tunic_p,
                              n=42, rows=20, hang_from=bio.WAIST - 0.02, flare=0.11))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.018, P('geo_charcoal', 0.05, [
        B('bottom', 0.0, 0.22, 'solid', 'geo_leather'),
        B('top', 0.0, 0.18, 'solid', 'geo_slate'),
    ]), ease_end=0.020, rows=10))
    parts_t.append(crossed_sash(gid_t + '_bandolier', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.050, ease=0.034))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_darkleather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    # Glowing amber vials at right hip & left thigh
    hip_c = spine_at(bio.WAIST - 0.03)
    for ang_v, nm in ((-2.15, 'R1'), (-2.42, 'R2'), (2.25, 'L1')):
        dv = np.array([math.sin(ang_v), math.cos(ang_v), 0.0])
        vp = surface_out(hip_c, dv, 0.052) + np.array([0.0, 0.0, -0.045])
        parts_t.append(crystal_vial(f'{gid_t}_amber_vial_{nm}', vp, 0.018, 0.080, 'geo_amber', 'geo_brass', joint='Hips'))
    entries.append(make_geo_garment(gid_t, 'Amber Alchemist Topographic Tunic & Vial Bandolier', 'torso', parts_t))

    # BACK: 3-vial glowing amber waist/back rack
    gid_b = 'geo_09_amber_alchemist_back'
    parts_b = []
    rack_c = spine_at(bio.WAIST + 0.05) + np.array([0.0, 0.145, 0.0])
    parts_b.append(blob(gid_b + '_rack_bar', rack_c, (0.20, 0.06, 0.06),
                        P('geo_brass', 0.02, fabric='metal.bronze'), n=12, rows=5, out=np.array([0, 1.0, 0]), rigid_joint='Spine'))
    for idx_v, dx in enumerate((-0.065, 0.0, 0.065)):
        parts_b.append(crystal_vial(f'{gid_b}_back_vial_{idx_v}', rack_c + np.array([dx, 0.025, 0.0]),
                                    radius=0.022, length=0.14, glass_col='geo_amber', cap_col='geo_brass', joint='Spine'))
    entries.append(make_geo_garment(gid_b, 'Amber Alchemist 3-Vial Dorsal Amber Rack', 'back', parts_b))

    # LEGS & FEET
    gid_l = 'geo_09_amber_alchemist_legs'
    entries.append(make_geo_garment(gid_l, 'Amber Alchemist Baggy Olive Trousers', 'legs',
                                    trousers(gid_l, P('geo_olive', 0.05), ankle_f=0.76, ease=0.026, bag=0.036), legged=True))
    gid_f = 'geo_09_amber_alchemist_feet'
    entries.append(make_geo_garment(gid_f, 'Amber Alchemist Strapped Field Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_leather', 0.05, [B('top', 0.0, 0.04, 'solid', 'geo_brass')]), top=0.45, ease_top=0.024)))
    return {'geo_09_amber_alchemist': entries}


def build_geo_10_basalt_veteran():
    """10: Basalt Veteran — Crystal-studded headband, heavy quilted charcoal-basalt greatcoat with topographic hem & satchel."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Crystal-studded headband
    gid_h = 'geo_10_basalt_veteran_head'
    hb_p = P('geo_leather', 0.04, [
        B('top', 0.0, 0.012, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.012, 'solid', 'geo_brass'),
    ], fabric='leather.polished')
    parts_h = [crown_band(gid_h + '_band', hb_p, f0=0.54, f1=0.72, ease=0.016, flare=0.006, rows=5, n=36)]
    c_mid = a + (b - a) * 0.63
    for an in np.linspace(-0.65 * math.pi, 0.65 * math.pi, 7):
        d = -bk * math.cos(an) + left * math.sin(an)
        h = first_hit(c_mid, d) or 0.098
        parts_h.append(blob(f'{gid_h}_gem_{an:.2f}', c_mid + d * (h + 0.022), (0.024, 0.014, 0.020),
                            P('geo_opal', 0.02, [B('top', 0.0, 0.008, 'solid', 'geo_cyan')]), n=8, rows=4, out=d, rigid_joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Basalt Veteran Quartz-Studded Headband', 'head', parts_h,
                                    role='military', covers_hair=False))

    # TORSO: Heavy quilted charcoal-basalt padded greatcoat with topographic hem & cross-body leather satchel
    gid_t = 'geo_10_basalt_veteran_torso'
    parts_t = []
    coat_p = P('geo_basalt', 0.06, [
        B('bottom', 0.0, 0.22, 'topographic', 'geo_ochre', 'geo_basalt', 0.20),
        B('top', 0.0, 0.05, 'solid', 'geo_tan'),
    ], [
        PN(0.0, 0.42, 'diamond_quilt', 'geo_basalt', 'soot', 0.16),
        PN(0.58, 1.0, 'diamond_quilt', 'geo_basalt', 'soot', 0.16),
        PN(0.42, 0.58, 'solid', 'geo_sage', 'geo_tan', 0.12),
    ], fabric='cloth.quilted')
    parts_t.append(torso_tube(gid_t + '_greatcoat', bio.TOP, bio.KNEE - 0.04, 0.032, coat_p,
                              n=46, rows=22, hang_from=bio.WAIST - 0.02, flare=0.14))
    parts_t.append(collar(gid_t + '_collar', P('geo_tan', 0.06, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]),
                          height=0.075, flare=0.032, ease=0.034))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.028, P('geo_basalt', 0.06, [
        B('bottom', 0.0, 0.16, 'solid', 'geo_tan'),
        B('top', 0.0, 0.45, 'diamond_quilt', 'geo_basalt', 'soot', 0.14),
    ]), ease_end=0.032, rows=10))
    # Cross-body leather strap & hip satchel bag
    parts_t.append(crossed_sash(gid_t + '_satchel_strap', P('geo_tan', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.052, ease=0.038))
    hip_c = spine_at(bio.WAIST - 0.05)
    bag_pos = surface_out(hip_c, np.array([-0.80, 0.60, 0.0]), 0.065)
    parts_t.append(blob(gid_t + '_satchel_bag', bag_pos, (0.14, 0.08, 0.15),
                        P('geo_tan', 0.05, [B('top', 0.0, 0.03, 'solid', 'geo_leather'), B('bottom', 0.0, 0.02, 'solid', 'geo_brass')]),
                        n=12, rows=6, out=np.array([-0.80, 0.60, 0.0]), rigid_joint='Hips'))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_tan', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.040))
    entries.append(make_geo_garment(gid_t, 'Basalt Veteran Quilted Greatcoat & Field Satchel', 'torso', parts_t, role='military'))

    # LEGS & FEET
    gid_l = 'geo_10_basalt_veteran_legs'
    entries.append(make_geo_garment(gid_l, 'Basalt Veteran Baggy Tan Trousers', 'legs',
                                    trousers(gid_l, P('geo_tan', 0.05), ankle_f=0.78, ease=0.028, bag=0.036),
                                    role='military', legged=True))
    gid_f = 'geo_10_basalt_veteran_feet'
    entries.append(make_geo_garment(gid_f, 'Basalt Veteran Heavy Cuffed Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_leather', 0.05, [B('top', 0.0, 0.05, 'solid', 'geo_tan')]), top=0.45, ease_top=0.028),
                                    role='military'))
    return {'geo_10_basalt_veteran': entries}



# ===============================================================================================================
# 6. GEOMANCER OUTFITS 13–15 (Reference Image 3)
# ===============================================================================================================
def build_geo_13_bamboo_surveyor():
    """13: Bamboo Surveyor — Sage cowl scarf & asymmetric cream topographic half-cape over rust split coat, bamboo 3-cylinder backpack."""
    entries = []

    # TORSO: Sage-green cowl scarf & asymmetric cream topographic half-cape over rust-red split coat
    gid_t = 'geo_13_bamboo_surveyor_torso'
    parts_t = []
    coat_p = P('geo_rust', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'geo_tan'),
        B('top', 0.0, 0.04, 'solid', 'geo_sage'),
    ], [
        PN(0.30, 0.70, 'topographic', 'geo_tan', 'geo_cream', 0.22),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_coat', bio.TOP, bio.KNEE + 0.02, 0.024, coat_p,
                              n=44, rows=20, hang_from=bio.WAIST - 0.02, flare=0.12))
    # Sage-green draped cowl scarf
    cowl_p = P('geo_sage', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'geo_brass'), B('top', 0.0, 0.02, 'solid', 'geo_cream')])
    parts_t.append(collar(gid_t + '_cowl', cowl_p, height=0.075, flare=0.036, ease=0.030, open_front=False, rows=6))
    parts_t.append(collar_disc(gid_t + '_cowl_drape', 0.11, cowl_p, drop=0.055, rows=5, n=38, scallop=0.06, ease=0.030))
    # Asymmetric cream topographic shoulder half-cape (sweeping over left shoulder & back)
    topo_cream = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_rust'),
        B('top', 0.0, 0.03, 'solid', 'geo_sage'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.24),
    ])
    parts_t.append(pauldron(gid_t + '_halfcape_L', L, topo_cream, reach=0.58, ease=0.036, flare_end=1.22))
    parts_t.append(cape(gid_t + '_halfcape_back', bio.WAIST - 0.06, topo_cream, z_top=bio.SHOULDER + 0.02, span=0.52, ease=0.038, flare=0.10))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.020, P('geo_rust', 0.05, [
        B('bottom', 0.0, 0.24, 'stripes', 'geo_tan', 'geo_leather', 0.03)
    ]), ease_end=0.022, rows=10))
    parts_t.append(crossed_sash(gid_t + '_harness', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.048, ease=0.034))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_darkleather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    entries.append(make_geo_garment(gid_t, 'Bamboo Surveyor Topographic Half-Cape & Rust Coat', 'torso', parts_t))

    # BACK: Bamboo-frame 3-cylinder core-sample backpack
    gid_b = 'geo_13_bamboo_surveyor_back'
    parts_b = []
    back_c = spine_at(bio.CHEST - 0.01) + np.array([0.0, 0.145, 0.0])
    bamboo_p = P('geo_tan', 0.04, [
        B('top', 0.0, 0.85, 'stripes', 'geo_leather', 'geo_tan', 0.03),
    ], fabric='straw.woven')
    # Vertical and horizontal bamboo rack poles
    for dx in (-0.085, 0.0, 0.085):
        p0 = back_c + np.array([dx, 0.018, -0.14])
        p1 = back_c + np.array([dx, 0.018, 0.16])
        parts_b.append(tube(f'{gid_b}_bamboo_tube_{dx:.2f}', [p0, p1], 0.026, bamboo_p, n=12, rigid_joint='Spine2'))
        parts_b.append(crystal_vial(f'{gid_b}_core_cap_{dx:.2f}', p1 + np.array([0.0, 0.0, 0.02]),
                                    radius=0.022, length=0.05, glass_col='geo_opal', cap_col='geo_brass', joint='Spine2'))
    for dz in (-0.08, 0.08):
        parts_b.append(tube(f'{gid_b}_crossbar_{dz:.2f}', [
            back_c + np.array([-0.11, 0.01, dz]),
            back_c + np.array([0.11, 0.01, dz]),
        ], 0.014, P('geo_leather', 0.05), n=10, rigid_joint='Spine2'))
    entries.append(make_geo_garment(gid_b, 'Bamboo Surveyor 3-Cylinder Core-Sample Pack', 'back', parts_b))

    # LEGS & FEET: Dark navy breeches & laced field boots
    gid_l = 'geo_13_bamboo_surveyor_legs'
    entries.append(make_geo_garment(gid_l, 'Bamboo Surveyor Dark Navy Breeches', 'legs',
                                    trousers(gid_l, P('geo_navy', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'geo_tan')]),
                                             ankle_f=0.76, ease=0.024, bag=0.034), legged=True))
    gid_f = 'geo_13_bamboo_surveyor_feet'
    entries.append(make_geo_garment(gid_f, 'Bamboo Surveyor Laced Field Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_leather', 0.05, [B('top', 0.0, 0.05, 'solid', 'geo_tan')]),
                                          top=0.46, wraps=3, wrap_paint=P('geo_cream', 0.04), ease_top=0.025)))
    return {'geo_13_bamboo_surveyor': entries}


def build_geo_14_lantern_mason():
    """14: Lantern Mason — Dark stone-dust half-mask, cream shirt & leather apron-vest, white stone left pauldron & twin amber hip-lanterns."""
    entries = []

    # HEAD: Dark stone-dust half-mask
    gid_h = 'geo_14_lantern_mason_head'
    mask_p = P('geo_charcoal', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.02, 'solid', 'geo_leather'),
    ], fabric='leather.polished')
    parts_h = [
        sculpted_faceplate(gid_h + '_halfmask', mask_p, f_top=0.38, f_bot=-0.06, ease=0.014, span=0.44,
                           nose_relief=0.024, cheek_relief=0.010, chin_relief=0.012)
    ]
    entries.append(make_geo_garment(gid_h, 'Lantern Mason Stone-Dust Half-Mask', 'head', parts_h,
                                    covers_hair=False, covers_face=True))

    # TORSO: Cream shirt with brown leather apron-vest, white stone left pauldron & twin glowing amber hip-lanterns
    gid_t = 'geo_14_lantern_mason_torso'
    parts_t = []
    shirt_p = P('geo_cream', 0.05, [B('bottom', 0.0, 0.16, 'solid', 'geo_tan'), B('top', 0.0, 0.30, 'solid', 'geo_leather')])
    vest_p = P('geo_leather', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'geo_darkleather'),
        B('top', 0.0, 0.04, 'solid', 'geo_cream'),
    ], [
        PN(0.30, 0.70, 'lorica_lames', 'geo_brass', 'geo_leather', 0.08),
    ], fabric='leather.buckskin')
    parts_t.append(torso_tube(gid_t + '_vest', bio.TOP, bio.CROTCH + 0.02, 0.025, vest_p,
                              n=42, rows=16, hang_from=bio.WAIST - 0.02, flare=0.06))
    parts_t.extend(sleeves(gid_t, 'elbow', 0.020, shirt_p, ease_end=0.026, rows=8))
    # Sculpted white stone Left pauldron
    stone_p = P('geo_ivory', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_stone'),
    ], [
        PN(0.0, 1.0, 'calcified_stone', 'white', 'geo_ivory', 0.16),
    ])
    parts_t.append(pauldron(gid_t + '_stone_pauldron_L', L, stone_p, reach=0.52, ease=0.038, flare_end=1.18))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_darkleather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    # Twin glowing amber hip-lanterns on left and right waist
    hip_c = spine_at(bio.WAIST - 0.03)
    for sd, nm in ((1.0, 'L'), (-1.0, 'R')):
        dv = np.array([sd * 0.88, -0.46, 0.0])
        lp = surface_out(hip_c, dv, 0.058) + np.array([0.0, 0.0, -0.05])
        parts_t.append(crystal_vial(f'{gid_t}_lantern_{nm}', lp, radius=0.028, length=0.095,
                                    glass_col='geo_amber', cap_col='geo_brass', joint='Hips'))
    entries.append(make_geo_garment(gid_t, 'Lantern Mason Apron-Vest & Twin Amber Hip-Lanterns', 'torso', parts_t))

    # GLOVES: Leather mason bracers & work gloves
    gid_g = 'geo_14_lantern_mason_gloves'
    bracer_p = P('geo_leather', 0.05, [
        B('top', 0.0, 0.04, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.04, 'solid', 'geo_darkleather'),
    ], fabric='leather.polished')
    parts_g = []
    for s in (L, R):
        parts_g.extend(build_glove_side(gid_g, s, bracer_p, cuff_paint=bracer_p, f0=0.42, ease=0.018, flare=0.010))
    entries.append(make_geo_garment(gid_g, 'Lantern Mason Leather Bracers & Work Gloves', 'gloves', parts_g))

    # LEGS & FEET: Baggy cream trousers with knee pads & heavy mason boots
    gid_l = 'geo_14_lantern_mason_legs'
    leg_p = P('geo_cream', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'geo_tan'),
    ], [
        PN(0.35, 0.55, 'lorica_lames', 'geo_leather', 'geo_tan', 0.08),
    ], fabric='cloth.cotton.coarse')
    entries.append(make_geo_garment(gid_l, 'Lantern Mason Cream Knee-Padded Trousers', 'legs',
                                    trousers(gid_l, leg_p, ankle_f=0.76, ease=0.028, bag=0.042), legged=True))
    gid_f = 'geo_14_lantern_mason_feet'
    entries.append(make_geo_garment(gid_f, 'Lantern Mason Strapped Work Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_darkleather', 0.05, [B('top', 0.0, 0.04, 'solid', 'geo_brass')]),
                                          top=0.44, ease_top=0.026)))
    return {'geo_14_lantern_mason': entries}


def build_geo_15_crescent_sage():
    """15: Crescent Sage — Wide crystal-studded hat, slate coat with large ivory crescent pectoral & cream topographic cape, ivory-and-bronze greaves."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Wide crystal-studded scholar hat with glowing brow stone
    gid_h = 'geo_15_crescent_sage_head'
    parts_h = []
    hat_p = P('geo_slate', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
        B('top', 0.0, 0.03, 'solid', 'geo_ivory'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_ivory', 'geo_slate', 0.22),
    ], fabric='cloth.felt')
    parts_h.append(tower_hat(gid_h + '_crown', 0.10, lambda s: 1.0 - 0.15 * s, hat_p, f=0.60, ease=0.015, rows=7, n=36))
    parts_h.append(brim(gid_h + '_brim', 0.58, 0.19, hat_p, ease=0.015, rows=6, n=44, lift=0.012, droop=0.010))
    # Crystal studs along hat crown & dangling side beads
    c_crown = a + (b - a) * 0.66
    for k in range(8):
        an = 2.0 * math.pi * k / 8.0
        d_c = -bk * math.cos(an) + left * math.sin(an)
        parts_h.append(blob(f'{gid_h}_stud_{k}', c_crown + d_c * 0.112, (0.018, 0.012, 0.018),
                            P('geo_cyan', 0.02, [B('top', 0.0, 0.008, 'solid', 'geo_brass')]), n=8, rows=4, out=d_c, rigid_joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Crescent Sage Crystal-Studded Wide Hat', 'head', parts_h, covers_hair=True))

    # TORSO: Slate-blue layered plate-and-cloth coat with large ivory crescent pectoral & asymmetric cream topographic cape
    gid_t = 'geo_15_crescent_sage_torso'
    parts_t = []
    coat_p = P('geo_slate', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'geo_brass'),
        B('top', 0.0, 0.04, 'solid', 'geo_ivory'),
    ], [
        PN(0.32, 0.68, 'topographic', 'geo_tan', 'geo_cream', 0.20),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_coat', bio.TOP, bio.ANKLE + 0.12, 0.024, coat_p,
                              n=44, rows=24, hang_from=bio.WAIST - 0.02, flare=0.14))
    # Large sculpted ivory crescent pectoral collar across chest & shoulders
    cresc_p = P('geo_ivory', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
        B('top', 0.0, 0.025, 'solid', 'geo_bronze'),
    ], [
        PN(0.0, 1.0, 'calcified_stone', 'geo_brass', 'geo_ivory', 0.14),
    ])
    parts_t.append(collar_disc(gid_t + '_crescent_pectoral', 0.155, cresc_p, drop=0.085, rows=6, n=44, scallop=0.04, ease=0.034))
    # Asymmetric cream topographic shoulder cape
    topo_cape = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.24),
    ])
    parts_t.append(cape(gid_t + '_cape', bio.KNEE + 0.04, topo_cape, z_top=bio.SHOULDER + 0.02, span=0.58, ease=0.042, flare=0.15))
    for s in (L, R):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{s[0]}', s, cresc_p, reach=0.46, ease=0.034, flare_end=1.14))
        parts_t.append(sleeve(f'{gid_t}_sleeve_{s[0]}', s, P('geo_slate', 0.04, [
            B('bottom', 0.0, 0.28, 'lorica_lames', 'geo_brass', 'geo_ivory', 0.05)
        ]), f0=0.0, f1=0.92, ease=0.020, flare=0.008))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_bronze', 0.03, [B('top', 0.0, 0.012, 'solid', 'geo_ivory')]),
                              P('geo_leather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    entries.append(make_geo_garment(gid_t, 'Crescent Sage Ivory-Pectoral Coat & Topographic Cape', 'torso', parts_t))

    # LEGS & FEET: Slate breeches + articulated ivory-and-bronze greave-boots
    gid_l = 'geo_15_crescent_sage_legs'
    entries.append(make_geo_garment(gid_l, 'Crescent Sage Slate Breeches', 'legs',
                                    trousers(gid_l, P('geo_slate', 0.05), ankle_f=0.78, ease=0.022, bag=0.024), legged=True))
    gid_f = 'geo_15_crescent_sage_feet'
    greave_p = P('geo_ivory', 0.03, [
        B('top', 0.0, 0.06, 'solid', 'geo_bronze'),
        B('bottom', 0.0, 0.06, 'solid', 'geo_bronze'),
    ], [
        PN(0.0, 1.0, 'lorica_lames', 'geo_bronze', 'geo_ivory', 0.06),
    ], fabric='metal.bronze')
    entries.append(make_geo_garment(gid_f, 'Crescent Sage Ivory & Bronze Greave-Boots', 'feet',
                                    boots(gid_f, P('geo_bronze', 0.03), greave_p, top=0.80, ease_top=0.026)))
    return {'geo_15_crescent_sage': entries}


# ===============================================================================================================
# 7. GEOMANCER OUTFITS 19–20 (Reference Image 4)
# ===============================================================================================================
def build_geo_19_field_cartographer():
    """19: Field Cartographer — Teal scarf & sleeveless charcoal vest over cream shirt with map-satchel & teal/cream split skirt, knee-plate breeches."""
    entries = []

    # TORSO: Teal scarf & sleeveless charcoal vest over cream shirt with cross-body leather map-satchel & teal/cream split skirt
    gid_t = 'geo_19_field_cartographer_torso'
    parts_t = []
    vest_p = P('geo_charcoal', 0.05, [
        B('bottom', 0.0, 0.05, 'topographic', 'geo_cream', 'geo_teal', 0.18),
        B('top', 0.0, 0.04, 'solid', 'geo_teal'),
    ], [
        PN(0.0, 0.35, 'topographic', 'geo_cream', 'geo_teal', 0.20),
        PN(0.65, 1.0, 'topographic', 'geo_cream', 'geo_teal', 0.20),
        PN(0.46, 0.54, 'solid', 'geo_cream', 'geo_charcoal', 0.08),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_vest_coat', bio.TOP, bio.KNEE + 0.04, 0.025, vest_p,
                              n=42, rows=20, hang_from=bio.WAIST - 0.02, flare=0.12))
    parts_t.extend(sleeves(gid_t, 'elbow', 0.020, P('geo_cream', 0.04, [
        B('top', 0.0, 0.34, 'topographic', 'geo_cream', 'geo_teal', 0.20),
        B('bottom', 0.0, 0.16, 'solid', 'geo_teal'),
    ]), ease_end=0.024, rows=8))
    # Teal neck scarf
    scarf_p = P('geo_teal', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'geo_brass'), B('top', 0.0, 0.02, 'solid', 'geo_cream')])
    parts_t.append(collar(gid_t + '_scarf', scarf_p, height=0.068, flare=0.032, ease=0.031, open_front=False, rows=6))
    # Cross-body leather strap & map-scroll satchel at left hip
    parts_t.append(crossed_sash(gid_t + '_satchel_strap', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.048, ease=0.036))
    hip_c = spine_at(bio.WAIST - 0.04)
    sat_pos = surface_out(hip_c, np.array([0.82, 0.56, 0.0]), 0.060)
    parts_t.append(blob(gid_t + '_map_satchel', sat_pos, (0.13, 0.08, 0.14),
                        P('geo_leather', 0.05, [B('top', 0.0, 0.03, 'solid', 'geo_brass')]),
                        n=12, rows=6, out=np.array([0.82, 0.56, 0.0]), rigid_joint='Hips'))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_darkleather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.038))
    entries.append(make_geo_garment(gid_t, 'Field Cartographer Teal Scarf, Vest & Map-Satchel', 'torso', parts_t))

    # LEGS: Brown breeches with round knee-plates
    gid_l = 'geo_19_field_cartographer_legs'
    parts_l = trousers(gid_l, P('geo_leather', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'geo_tan')]),
                       ankle_f=0.76, ease=0.024, bag=0.030)
    for s in (L, R):
        kj = J(s + 'Leg') + np.array([0.0, -0.062, 0.01])
        parts_l.append(rosette(f'{gid_l}_knee_plate_{s[0]}', kj, FRONT, np.array([1.0, 0, 0]), 0.036,
                               P('geo_ivory', 0.03, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]), n=14, thick=0.014, rigid_joint=s + 'Leg'))
    entries.append(make_geo_garment(gid_l, 'Field Cartographer Knee-Plated Brown Breeches', 'legs', parts_l, legged=True))

    # FEET: Strapped cartographer field boots
    gid_f = 'geo_19_field_cartographer_feet'
    entries.append(make_geo_garment(gid_f, 'Field Cartographer Strapped Leather Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_darkleather', 0.05, [B('top', 0.0, 0.05, 'solid', 'geo_tan')]),
                                          top=0.48, wraps=3, wrap_paint=P('geo_tan', 0.05), ease_top=0.025)))
    return {'geo_19_field_cartographer': entries}


def build_geo_20_geode_delver():
    """20: Geode Delver — Rust-brown hood with protruding glowing quartz crystals, quilted rust/sandstone coat, round bronze geode drum backpack."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Rust-brown hood with protruding glowing quartz crystals
    gid_h = 'geo_20_geode_delver_head'
    hood_p = P('geo_rust', 0.05, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
        B('top', 0.0, 0.03, 'solid', 'geo_tan'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_rust', 0.22),
    ], fabric='cloth.wool')
    parts_h = [hood(gid_h + '_hood', hood_p, ease=0.024, ease_low=0.050, open_front=0.72, low=-0.42, rows=12, n=34, peak=0.03)]
    # Protruding quartz crystal spikes on top-left and top-right of the hood
    for sd, tag in ((-1, 'R'), (1, 'L')):
        cb = a + (b - a) * 0.78 + left * (sd * 0.068) - bk * 0.02
        ct = cb + up * 0.085 + left * (sd * 0.045)
        parts_h.append(crystal_spike(f'{gid_h}_quartz_{tag}', cb, ct, r_base=0.022, r_tip=0.005, col='geo_opal', joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Geode Delver Quartz-Crowned Rust Hood', 'head', parts_h, covers_hair=True))

    # TORSO: Heavy quilted rust-and-sandstone split surveyor coat
    gid_t = 'geo_20_geode_delver_torso'
    parts_t = []
    coat_p = P('geo_rust', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'geo_brass'),
        B('top', 0.0, 0.04, 'solid', 'geo_sand'),
    ], [
        PN(0.0, 0.36, 'diamond_quilt', 'geo_rust', 'geo_leather', 0.14),
        PN(0.64, 1.0, 'diamond_quilt', 'geo_rust', 'geo_leather', 0.14),
        PN(0.36, 0.64, 'topographic', 'geo_rust', 'geo_sand', 0.20),
    ], fabric='cloth.quilted')
    parts_t.append(torso_tube(gid_t + '_coat', bio.TOP, bio.KNEE + 0.02, 0.026, coat_p,
                              n=44, rows=22, hang_from=bio.WAIST - 0.02, flare=0.13))
    for s in (L, R):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{s[0]}', s, P('geo_sand', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'geo_brass')]),
                                reach=0.45, ease=0.034, flare_end=1.12))
    parts_t.extend(sleeves(gid_t, 'elbow', 0.024, coat_p, ease_end=0.028, rows=8))
    parts_t.append(crossed_sash(gid_t + '_harness', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), width=0.050, ease=0.034))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_tan', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.038))
    entries.append(make_geo_garment(gid_t, 'Geode Delver Quilted Rust & Sandstone Coat', 'torso', parts_t))

    # BACK: Round bronze-and-opal geode drum backpack
    gid_b = 'geo_20_geode_delver_back'
    parts_b = []
    back_c = spine_at(bio.CHEST - 0.01) + np.array([0.0, 0.165, 0.0])
    drum_p = P('geo_bronze', 0.03, [
        B('top', 0.0, 0.04, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.04, 'solid', 'geo_leather'),
    ], [
        PN(0.0, 1.0, 'sun_compass', 'geo_brass', 'geo_bronze', 0.16),
    ], fabric='metal.bronze')
    parts_b.append(rosette(gid_b + '_geode_drum', back_c, np.array([0, 1.0, 0]), np.array([1.0, 0, 0]),
                           0.145, drum_p, n=20, thick=0.095, rigid_joint='Spine2'))
    parts_b.append(rosette(gid_b + '_geode_core', back_c + np.array([0.0, 0.052, 0.0]), np.array([0, 1.0, 0]), np.array([1.0, 0, 0]),
                           0.068, P('geo_opal', 0.02, [], [PN(0.0, 1.0, 'opal_lens', 'geo_brass', 'geo_opal', 0.15)]),
                           n=16, thick=0.024, rigid_joint='Spine2'))
    entries.append(make_geo_garment(gid_b, 'Geode Delver Bronze & Opal Drum Pack', 'back', parts_b))

    # GLOVES: White stone/ivory plate vambraces & leather gloves
    gid_g = 'geo_20_geode_delver_gloves'
    vam_p = P('geo_ivory', 0.03, [
        B('top', 0.0, 0.04, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.04, 'solid', 'geo_bronze'),
    ], fabric='metal.bronze')
    parts_g = []
    for s in (L, R):
        parts_g.extend(build_glove_side(gid_g, s, P('geo_leather', 0.05), cuff_paint=vam_p, f0=0.35, ease=0.020, flare=0.012))
    entries.append(make_geo_garment(gid_g, 'Geode Delver Ivory Plate Vambraces & Gloves', 'gloves', parts_g))

    # LEGS & FEET
    gid_l = 'geo_20_geode_delver_legs'
    entries.append(make_geo_garment(gid_l, 'Geode Delver Baggy Brown Breeches', 'legs',
                                    trousers(gid_l, P('geo_leather', 0.05), ankle_f=0.76, ease=0.028, bag=0.040), legged=True))
    gid_f = 'geo_20_geode_delver_feet'
    entries.append(make_geo_garment(gid_f, 'Geode Delver Heavy Delving Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_darkleather', 0.05, [B('top', 0.0, 0.05, 'solid', 'geo_ivory')]),
                                          top=0.48, ease_top=0.026)))
    return {'geo_20_geode_delver': entries}


# ===============================================================================================================
# 8. GEOMANCER OUTFITS 23–25 (Reference Image 5)
# ===============================================================================================================
def build_geo_23_aether_scout():
    """23: Aether Scout — Brow goggles, layered stone-slate feathered pauldrons & terracotta vest with topographic waist-drape, green crystal backpack."""
    entries = []

    # HEAD: Brow goggles perched on forehead
    gid_h = 'geo_23_aether_scout_head'
    parts_h = goggle_head_strap(gid_h, f_center=0.58, band_h=0.06, ease=0.014)
    for sd, tag in ((-1, 'R'), (1, 'L')):
        parts_h.extend(goggle_eye_cup(f'{gid_h}_gog_{tag}', sd * 0.036, f_eye=0.58, r_cup=0.026, depth=0.018,
                                      bezel_paint=P('geo_brass', 0.02), lens_paint=P('geo_jade', 0.02)))
    entries.append(make_geo_garment(gid_h, 'Aether Scout Jade-Lens Forehead Goggles', 'head', parts_h, covers_hair=False))

    # TORSO: Layered stone-slate feathered pauldrons & terracotta vest with cream topographic waist-drape
    gid_t = 'geo_23_aether_scout_torso'
    parts_t = []
    vest_p = P('geo_terracotta', 0.05, [
        B('bottom', 0.0, 0.04, 'solid', 'geo_brass'),
        B('top', 0.0, 0.04, 'solid', 'geo_slate'),
    ], [
        PN(0.30, 0.70, 'topographic', 'geo_tan', 'geo_cream', 0.22),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_vest', bio.TOP, bio.KNEE + 0.04, 0.024, vest_p,
                              n=42, rows=20, hang_from=bio.WAIST - 0.02, flare=0.12))
    scale_p = P('geo_slate', 0.04, [
        B('bottom', 0.0, 0.05, 'scallop_lace', 'geo_brass', 'geo_slate', 0.05),
    ], [
        PN(0.0, 1.0, 'scale_mail', 'geo_ivory', 'geo_slate', 0.09),
    ], fabric='metal.iron')
    parts_t.append(collar_disc(gid_t + '_sh_mantle', 0.14, scale_p, drop=0.075, rows=6, n=42, scallop=0.10, ease=0.032))
    for s in (L, R):
        parts_t.append(pauldron(f'{gid_t}_pauldron_{s[0]}', s, scale_p, reach=0.52, ease=0.036, flare_end=1.18))
        parts_t.append(sleeve(f'{gid_t}_bracer_{s[0]}', s, P('geo_leather', 0.05, [B('top', 0.0, 0.12, 'solid', 'geo_brass')]),
                              f0=0.52, f1=0.92, ease=0.018, flare=0.008))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_terracotta', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.036))
    entries.append(make_geo_garment(gid_t, 'Aether Scout Slate-Scale Mantle & Terracotta Vest', 'torso', parts_t))

    # BACK: Glowing green-crystal backpack
    gid_b = 'geo_23_aether_scout_back'
    parts_b = []
    back_c = spine_at(bio.CHEST - 0.01) + np.array([0.0, 0.150, 0.0])
    parts_b.append(blob(gid_b + '_pack_frame', back_c, (0.16, 0.09, 0.20),
                        P('geo_bronze', 0.03, [B('top', 0.0, 0.03, 'solid', 'geo_brass')]),
                        n=14, rows=6, out=np.array([0, 1.0, 0]), rigid_joint='Spine2'))
    for dx, dz, h_c in ((-0.045, 0.06, 0.11), (0.0, 0.08, 0.14), (0.045, 0.06, 0.11)):
        cb = back_c + np.array([dx, 0.02, dz])
        parts_b.append(crystal_spike(f'{gid_b}_jade_crys_{dx:.2f}', cb, cb + np.array([dx * 0.4, 0.04, h_c]),
                                     r_base=0.024, r_tip=0.005, col='geo_jade', joint='Spine2'))
    entries.append(make_geo_garment(gid_b, 'Aether Scout Jade-Crystal Resonance Pack', 'back', parts_b))

    # LEGS & FEET
    gid_l = 'geo_23_aether_scout_legs'
    entries.append(make_geo_garment(gid_l, 'Aether Scout Charcoal Baggy Trousers', 'legs',
                                    trousers(gid_l, P('geo_charcoal', 0.05), ankle_f=0.76, ease=0.028, bag=0.040), legged=True))
    gid_f = 'geo_23_aether_scout_feet'
    entries.append(make_geo_garment(gid_f, 'Aether Scout Wrapped Field Boots', 'feet',
                                    boots(gid_f, P('soot', 0.08), P('geo_leather', 0.05, [B('top', 0.0, 0.05, 'solid', 'geo_cream')]),
                                          top=0.46, wraps=3, wrap_paint=P('geo_cream', 0.04), ease_top=0.025)))
    return {'geo_23_aether_scout': entries}


def build_geo_24_jade_resonance_sage():
    """24: Jade Resonance Sage — Jade crystal hairpins, sweeping wide-sleeved sage-green & cream kimono-robe with glowing chest crystal, jade-beaded sandals."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Jade crystal hairpins & ornament crown-comb
    gid_h = 'geo_24_jade_resonance_sage_head'
    parts_h = []
    comb_p = P('geo_brass', 0.02, [B('top', 0.0, 0.015, 'solid', 'geo_jade')], fabric='metal.gold')
    parts_h.append(crown_band(gid_h + '_fillet', comb_p, f0=0.66, f1=0.78, ease=0.014, flare=0.006, rows=4, n=32))
    # Crossed jade hairpins & glowing jade flower sprays at upper temples
    for sd, tag in ((-1, 'R'), (1, 'L')):
        p_in = a + (b - a) * 0.78 + left * (sd * 0.035) + bk * 0.01
        p_out = p_in + left * (sd * 0.115) + up * 0.055 + bk * 0.02
        parts_h.append(crystal_spike(f'{gid_h}_jade_pin_{tag}', p_in, p_out, r_base=0.014, r_tip=0.003, col='geo_jade', joint='Head'))
        parts_h.append(tassel(f'{gid_h}_jade_drop_{tag}', p_out - left * (sd * 0.02), 0.065, 0.008,
                              P('geo_jade', 0.02, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), rigid_joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Jade Resonance Sage Crystal Hairpins & Fillet', 'head', parts_h, covers_hair=False))

    # TORSO: Sweeping wide-sleeved sage-green & cream layered kimono-robe with glowing chest crystal
    gid_t = 'geo_24_jade_resonance_sage_torso'
    parts_t = []
    kimono_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.18, 'topographic', 'geo_brass', 'geo_sage', 0.20),
        B('top', 0.0, 0.06, 'solid', 'geo_sage'),
    ], [
        PN(0.0, 0.35, 'topographic', 'geo_cream', 'geo_sage', 0.22),
        PN(0.65, 1.0, 'topographic', 'geo_cream', 'geo_sage', 0.22),
        PN(0.35, 0.65, 'topographic', 'geo_tan', 'geo_cream', 0.18),
    ], fabric='cloth.silk')
    parts_t.append(torso_tube(gid_t + '_kimono', bio.TOP, bio.ANKLE + 0.06, 0.026, kimono_p,
                              n=46, rows=24, hang_from=bio.WAIST - 0.02, flare=0.16))
    parts_t.append(stand_collar(gid_t, P('geo_sage', 0.04, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]), high=0.048))
    # Wide sweeping kimono sleeves
    wide_slv_p = P('geo_sage', 0.04, [
        B('bottom', 0.0, 0.22, 'topographic', 'geo_brass', 'geo_cream', 0.18),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_cream', 'geo_sage', 0.22),
    ], fabric='cloth.silk')
    parts_t.extend(sleeves(gid_t, 'wrist', 0.026, wide_slv_p, ease_end=0.068, rows=12))
    # Glowing jade chest crystal medallion & obi sash
    gem_c = chest_front(bio.CHEST + 0.02, 0.040)
    parts_t.append(rosette(gid_t + '_chest_jade', gem_c, FRONT, np.array([1.0, 0, 0]), 0.036,
                           P('geo_jade', 0.02, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]), n=12, thick=0.016, rigid_joint='Spine2'))
    obi_p = P('geo_moss', 0.04, [
        B('top', 0.0, 0.015, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.015, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'geo_glyphs', 'geo_brass', 'geo_moss', 0.20),
    ], fabric='cloth.brocade')
    parts_t.append(belt_sash(gid_t + '_obi', bio.WAIST - 0.04, bio.WAIST + 0.05, obi_p, ease=0.034))
    entries.append(make_geo_garment(gid_t, 'Jade Resonance Sage Wide-Sleeved Kimono & Jade Medallion', 'torso', parts_t))

    # LEGS & FEET: Dark trousers & jade-beaded ankle-ring sandals
    gid_l = 'geo_24_jade_resonance_sage_legs'
    entries.append(make_geo_garment(gid_l, 'Jade Resonance Sage Dark Silk Under-Trousers', 'legs',
                                    trousers(gid_l, P('geo_charcoal', 0.04), ankle_f=0.72, ease=0.022, bag=0.024), legged=True))
    gid_f = 'geo_24_jade_resonance_sage_feet'
    parts_f = sandal(gid_f, P('geo_leather', 0.05), P('geo_brass', 0.02, [B('top', 0.0, 0.02, 'solid', 'geo_jade')]), guard=True, laces=3)
    entries.append(make_geo_garment(gid_f, 'Jade Resonance Sage Beaded Ankle-Ring Sandals', 'feet', parts_f))
    return {'geo_24_jade_resonance_sage': entries}


def build_geo_25_sphere_atlas():
    """25: Sphere Atlas — Wide flat hat with hanging crystal drops, dark charcoal robe with ochre scarf & right stone sphere pauldron, massive bronze-banded stone orb backpack."""
    a, b, up, bk, left = head_frame()
    entries = []

    # HEAD: Wide flat hat with hanging crystal drops
    gid_h = 'geo_25_sphere_atlas_head'
    parts_h = []
    hat_p = P('geo_tan', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
        B('top', 0.0, 0.03, 'solid', 'geo_charcoal'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_leather', 'geo_tan', 0.24),
    ])
    parts_h.append(conical_hat(gid_h + '_disc_hat', hat_p, f_base=0.68, f_top=0.92, r_base=0.28, r_top=0.04, rows=8, n=40))
    c_rim = a + (b - a) * 0.68
    for k in range(8):
        an = 2.0 * math.pi * k / 8.0
        d_r = bk * math.cos(an) + left * math.sin(an)
        parts_h.append(tassel(f'{gid_h}_drop_{k}', c_rim + d_r * 0.26, 0.050, 0.008,
                              P('geo_cyan', 0.02, [B('top', 0.0, 0.015, 'solid', 'geo_brass')]), rigid_joint='Head'))
    entries.append(make_geo_garment(gid_h, 'Sphere Atlas Crystal-Dropped Wide Disc Hat', 'head', parts_h, covers_hair=True))

    # TORSO: Dark charcoal robe with ochre scarf, huge right-shoulder stone sphere pauldron & glowing belt vials
    gid_t = 'geo_25_sphere_atlas_torso'
    parts_t = []
    robe_p = P('geo_charcoal', 0.05, [
        B('bottom', 0.0, 0.05, 'solid', 'geo_ochre'),
        B('top', 0.0, 0.04, 'solid', 'geo_ochre'),
    ], [
        PN(0.35, 0.65, 'topographic', 'geo_ochre', 'geo_charcoal', 0.20),
    ], fabric='cloth.wool')
    parts_t.append(torso_tube(gid_t + '_robe', bio.TOP, bio.KNEE + 0.02, 0.026, robe_p,
                              n=44, rows=22, hang_from=bio.WAIST - 0.02, flare=0.14))
    scarf_p = P('geo_ochre', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'geo_brass')])
    parts_t.append(collar(gid_t + '_ochre_scarf', scarf_p, height=0.072, flare=0.034, ease=0.030, open_front=False, rows=6))
    parts_t.extend(sleeves(gid_t, 'wrist', 0.022, P('geo_charcoal', 0.05, [B('bottom', 0.0, 0.20, 'solid', 'geo_ochre')]), ease_end=0.026, rows=10))
    # Huge right-shoulder stone sphere pauldron
    sh_r = J('RightArm') + np.array([-0.035, 0.0, 0.030])
    orb_p = P('geo_stone', 0.04, [
        B('top', 0.0, 0.04, 'solid', 'geo_bronze'),
        B('bottom', 0.0, 0.04, 'solid', 'geo_bronze'),
    ], [
        PN(0.0, 1.0, 'calcified_stone', 'geo_cream', 'geo_stone', 0.18),
    ])
    parts_t.append(blob(gid_t + '_sh_sphere_R', sh_r, (0.15, 0.15, 0.15), orb_p,
                        n=18, rows=8, out=np.array([-0.85, -0.1, 0.50]), rigid_joint='RightArm'))
    parts_t.extend(pouch_belt(gid_t + '_belt', P('geo_leather', 0.05, [B('top', 0.0, 0.012, 'solid', 'geo_brass')]),
                              P('geo_darkleather', 0.05, [B('top', 0.0, 0.02, 'solid', 'geo_brass')]), ease=0.038))
    # Glowing cyan belt vials
    hip_c = spine_at(bio.WAIST - 0.03)
    for ang_v, nm in ((2.15, 'L1'), (2.40, 'L2'), (-2.25, 'R1')):
        dv = np.array([math.sin(ang_v), math.cos(ang_v), 0.0])
        vp = surface_out(hip_c, dv, 0.054) + np.array([0.0, 0.0, -0.045])
        parts_t.append(crystal_vial(f'{gid_t}_vial_{nm}', vp, 0.017, 0.075, 'geo_cyan', 'geo_brass', joint='Hips'))
    entries.append(make_geo_garment(gid_t, 'Sphere Atlas Stone-Orb Pauldron & Charcoal Robe', 'torso', parts_t))

    # BACK: Massive bronze-banded stone orb backpack
    gid_b = 'geo_25_sphere_atlas_back'
    parts_b = []
    back_c = spine_at(bio.CHEST + 0.01) + np.array([0.0, 0.185, 0.02])
    atlas_p = P('geo_stone', 0.04, [
        B('top', 0.0, 0.08, 'solid', 'geo_bronze'),
        B('bottom', 0.0, 0.08, 'solid', 'geo_bronze'),
    ], [
        PN(0.42, 0.58, 'solid', 'geo_brass', 'geo_bronze', 0.10),
        PN(0.0, 0.42, 'calcified_stone', 'geo_cream', 'geo_stone', 0.18),
        PN(0.58, 1.0, 'calcified_stone', 'geo_cream', 'geo_stone', 0.18),
    ])
    parts_b.append(blob(gid_b + '_atlas_sphere', back_c, (0.28, 0.26, 0.28), atlas_p,
                        n=20, rows=10, out=np.array([0.0, 1.0, 0.15]), rigid_joint='Spine2'))
    entries.append(make_geo_garment(gid_b, 'Sphere Atlas Bronze-Banded Lithic Orb Backpack', 'back', parts_b))

    # LEGS & FEET: Charcoal breeches + crystal-knee greaves & boots
    gid_l = 'geo_25_sphere_atlas_legs'
    entries.append(make_geo_garment(gid_l, 'Sphere Atlas Charcoal Breeches', 'legs',
                                    trousers(gid_l, P('geo_charcoal', 0.05), ankle_f=0.78, ease=0.024, bag=0.032), legged=True))
    gid_f = 'geo_25_sphere_atlas_feet'
    parts_f = boots(gid_f, P('soot', 0.08), P('geo_darkleather', 0.05, [B('top', 0.0, 0.05, 'solid', 'geo_brass')]),
                    top=0.58, ease_top=0.026)
    for s in (L, R):
        kj = J(s + 'Leg') + np.array([0.0, -0.065, 0.0])
        parts_f.append(rosette(f'{gid_f}_knee_crys_{s[0]}', kj, FRONT, np.array([1.0, 0, 0]), 0.032,
                               P('geo_cyan', 0.02, [B('top', 0.0, 0.01, 'solid', 'geo_brass')]), n=12, thick=0.016, rigid_joint=s + 'Leg'))
    entries.append(make_geo_garment(gid_f, 'Sphere Atlas Crystal-Knee Greave Boots', 'feet', parts_f))
    return {'geo_25_sphere_atlas': entries}



# ===============================================================================================================
# 9. GEOMANCER GOGGLES 01–10 (Reference Image 6 — slot='head', covers_hair=False, covers_face=False)
# ===============================================================================================================
def build_geo_goggles():
    """Build all 10 standalone 3D Geomancer Goggles (geo_goggles_01 .. geo_goggles_10)."""
    a, b, up, bk, left = head_frame()
    entries = []
    opal_p = P('geo_opal', 0.02, [], [PN(0.0, 1.0, 'opal_lens', 'geo_brass', 'geo_opal', 0.14)], fabric='beads.glass')
    canyon_p = P('geo_amber', 0.02, [], [PN(0.0, 1.0, 'canyon_visor', 'geo_brass', 'geo_amber', 0.18)], fabric='beads.glass')
    brass_p = P('geo_brass', 0.02, [B('top', 0.0, 0.01, 'solid', 'geo_darkleather')], fabric='metal.bronze')
    slate_p = P('geo_slate', 0.03, [B('top', 0.0, 0.01, 'solid', 'geo_brass')], fabric='metal.iron')
    jade_p = P('geo_jade', 0.02, [B('top', 0.0, 0.01, 'solid', 'white')], fabric='beads.glass')

    # 01: Twin round brass opal-lens goggles with leather strap
    gid = 'geo_goggles_01'
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.075, ease=0.012)
    for sd, tag in ((-1, 'R'), (1, 'L')):
        pts.extend(goggle_eye_cup(f'{gid}_{tag}', sd * 0.035, f_eye=0.40, r_cup=0.029, depth=0.022,
                                  bezel_paint=brass_p, lens_paint=opal_p))
    # Nose bridge bar
    c_br = a + (b - a) * 0.41 - bk * 0.112
    pts.append(tube(gid + '_bridge', [c_br - left * 0.016, c_br + left * 0.016], 0.007, brass_p, n=8, rigid_joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Opal-Lens Brass Goggles (01)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 02: Rectangular brass canyon-tint visor goggles with cream forehead wrap
    gid = 'geo_goggles_02'
    wrap_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.015, 'solid', 'geo_tan'),
        B('top', 0.0, 0.015, 'solid', 'geo_tan'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.20),
    ])
    pts = [crown_band(gid + '_forehead_wrap', wrap_p, f0=0.46, f1=0.68, ease=0.014, flare=0.005, rows=5, n=36)]
    pts.extend(panoramic_visor(gid + '_visor', f_top=0.47, f_bot=0.31, span=0.35, ease=0.020,
                               frame_paint=brass_p, lens_paint=canyon_p))
    entries.append(make_geo_garment(gid, 'Geomancer Canyon-Tint Visor & Forehead Wrap (02)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 03: Asymmetric big-left/small-right dual-lens brass-and-slate goggles
    gid = 'geo_goggles_03'
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.075, ease=0.012)
    pts.extend(goggle_eye_cup(gid + '_L_big', 0.036, f_eye=0.40, r_cup=0.034, depth=0.026,
                              bezel_paint=brass_p, lens_paint=opal_p))
    pts.extend(goggle_eye_cup(gid + '_R_small', -0.034, f_eye=0.40, r_cup=0.023, depth=0.020,
                              bezel_paint=slate_p, lens_paint=opal_p))
    pts.append(tube(gid + '_bridge', [c_br - left * 0.015, c_br + left * 0.015], 0.008, slate_p, n=8, rigid_joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Asymmetric Dual-Caliber Goggles (03)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 04: Wide amber wrap-around visor with twin glowing side-lamps
    gid = 'geo_goggles_04'
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.07, ease=0.012)
    pts.extend(panoramic_visor(gid + '_visor', f_top=0.48, f_bot=0.30, span=0.38, ease=0.021,
                               frame_paint=brass_p, lens_paint=canyon_p))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        lamp_c = a + (b - a) * 0.40 + left * (sd * 0.092) - bk * 0.048
        pts.append(crystal_vial(f'{gid}_lamp_{tag}', lamp_c, radius=0.016, length=0.042,
                                glass_col='geo_amber', cap_col='geo_brass', axis=(-bk[0], -bk[1], 0.0), joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Wide Amber Side-Lamp Visor (04)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 05: Round wire-rimmed scholar spectacles with flip-up left loupe magnifier
    gid = 'geo_goggles_05'
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.045, ease=0.011,
                            paint=P('geo_brass', 0.02, fabric='metal.gold'))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        pts.extend(goggle_eye_cup(f'{gid}_{tag}', sd * 0.034, f_eye=0.40, r_cup=0.025, depth=0.010,
                                  bezel_paint=brass_p, lens_paint=opal_p))
    # Flip-up left magnifier loupe above left spectacle rim
    pts.extend(goggle_eye_cup(gid + '_flip_loupe_L', 0.052, f_eye=0.49, r_cup=0.020, depth=0.015,
                              bezel_paint=brass_p, lens_paint=canyon_p))
    pts.append(tube(gid + '_bridge', [c_br - left * 0.014, c_br + left * 0.014], 0.005, brass_p, n=8, rigid_joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Flip-Loupe Scholar Spectacles (05)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 06: Leather-hooded rectangular goggles with side louver vents
    gid = 'geo_goggles_06'
    louver_p = P('geo_leather', 0.04, [
        B('top', 0.0, 0.015, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.015, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'lorica_lames', 'geo_brass', 'geo_leather', 0.05),
    ], fabric='leather.polished')
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.08, ease=0.013, paint=louver_p)
    pts.extend(panoramic_visor(gid + '_shades', f_top=0.47, f_bot=0.32, span=0.36, ease=0.022,
                               frame_paint=louver_p, lens_paint=P('geo_charcoal', 0.02, [B('top', 0.0, 0.02, 'solid', 'geo_brass')], fabric='beads.glass')))
    entries.append(make_geo_garment(gid, 'Geomancer Louvered Leather Dust-Goggles (06)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 07: Ribbed-leather green-lens round goggles
    gid = 'geo_goggles_07'
    bellows_p = P('geo_darkleather', 0.04, [
        B('top', 0.0, 0.85, 'stripes', 'geo_brass', 'geo_darkleather', 0.03),
    ], fabric='leather.polished')
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.075, ease=0.012, paint=bellows_p)
    for sd, tag in ((-1, 'R'), (1, 'L')):
        pts.extend(goggle_eye_cup(f'{gid}_{tag}', sd * 0.035, f_eye=0.40, r_cup=0.028, depth=0.025,
                                  bezel_paint=bellows_p, lens_paint=jade_p))
    pts.append(tube(gid + '_bridge', [c_br - left * 0.016, c_br + left * 0.016], 0.008, brass_p, n=8, rigid_joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Green-Crystal Bellows Goggles (07)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 08: Right-eye brass crystal monocle with flip-up loupe & forehead strap
    gid = 'geo_goggles_08'
    pts = goggle_head_strap(gid, f_center=0.44, band_h=0.055, ease=0.012)
    pts.extend(goggle_eye_cup(gid + '_monocle_R', -0.035, f_eye=0.40, r_cup=0.031, depth=0.024,
                              bezel_paint=brass_p, lens_paint=opal_p))
    pts.extend(goggle_eye_cup(gid + '_aux_loupe_R', -0.056, f_eye=0.48, r_cup=0.019, depth=0.016,
                              bezel_paint=brass_p, lens_paint=canyon_p))
    entries.append(make_geo_garment(gid, 'Geomancer Brass Surveyor Monocle & Loupe (08)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 09: Iridescent mother-of-pearl wave-frame panoramic visor
    gid = 'geo_goggles_09'
    ivory_frame = P('geo_ivory', 0.03, [B('top', 0.0, 0.01, 'solid', 'geo_brass')], fabric='metal.gold')
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.065, ease=0.012, paint=ivory_frame)
    pts.extend(panoramic_visor(gid + '_nacre_visor', f_top=0.49, f_bot=0.30, span=0.39, ease=0.021,
                               frame_paint=ivory_frame, lens_paint=opal_p, wave_amp=0.022))
    entries.append(make_geo_garment(gid, 'Geomancer Iridescent Nacre Wave-Visor (09)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    # 10: Triple-lens (green/amber/opal) brass surveyor goggles
    gid = 'geo_goggles_10'
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.075, ease=0.012)
    pts.extend(goggle_eye_cup(gid + '_R_opal', -0.035, f_eye=0.40, r_cup=0.028, depth=0.022,
                              bezel_paint=brass_p, lens_paint=opal_p))
    pts.extend(goggle_eye_cup(gid + '_L_green', 0.035, f_eye=0.40, r_cup=0.029, depth=0.024,
                              bezel_paint=brass_p, lens_paint=jade_p))
    pts.extend(goggle_eye_cup(gid + '_L_amber_turret', 0.056, f_eye=0.47, r_cup=0.021, depth=0.020,
                              bezel_paint=brass_p, lens_paint=canyon_p))
    pts.append(tube(gid + '_bridge', [c_br - left * 0.015, c_br + left * 0.015], 0.008, brass_p, n=8, rigid_joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Triple-Lens Turret Goggles (10)', 'head', pts,
                                    covers_hair=False, covers_face=False))

    return entries


# ===============================================================================================================
# 10. GEOMANCER GOGGLES + FACE-MASKS 01–05, 07–10 (Reference Image 7 — SKIP 06! covers_face=True)
# ===============================================================================================================
def build_geo_masks():
    """Build the 9 Geomancer Goggle + Face-Mask combos (geo_mask_01..05, 07..10, skipping 06 as requested)."""
    a, b, up, bk, left = head_frame()
    entries = []
    opal_p = P('geo_opal', 0.02, [], [PN(0.0, 1.0, 'opal_lens', 'geo_brass', 'geo_opal', 0.14)], fabric='beads.glass')
    canyon_p = P('geo_amber', 0.02, [], [PN(0.0, 1.0, 'canyon_visor', 'geo_brass', 'geo_amber', 0.18)], fabric='beads.glass')
    brass_p = P('geo_brass', 0.02, [B('top', 0.0, 0.01, 'solid', 'geo_darkleather')], fabric='metal.bronze')
    jade_p = P('geo_jade', 0.02, [B('top', 0.0, 0.01, 'solid', 'white')], fabric='beads.glass')

    # 01: Twin opal goggles + dark brown topographic-stitched leather face mask
    gid = 'geo_mask_01'
    pts = goggle_head_strap(gid, f_center=0.41, band_h=0.075, ease=0.012)
    mask01_p = P('geo_darkleather', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.02, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_darkleather', 0.22),
    ], fabric='leather.polished')
    pts.append(sculpted_faceplate(gid + '_mask', mask01_p, f_top=0.38, f_bot=-0.06, ease=0.014, span=0.44))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        pts.extend(goggle_eye_cup(f'{gid}_{tag}', sd * 0.035, f_eye=0.41, r_cup=0.029, depth=0.022,
                                  bezel_paint=brass_p, lens_paint=opal_p))
    entries.append(make_geo_garment(gid, 'Geomancer Opal Goggles & Topographic Leather Mask (01)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # 02: Rectangular brass visor goggles + draped cream-and-sage desert keffiyeh neck/face wrap
    gid = 'geo_mask_02'
    pts = [crown_band(gid + '_forehead', P('geo_cream', 0.04, [B('bottom', 0.0, 0.015, 'solid', 'geo_sage')]),
                      f0=0.46, f1=0.68, ease=0.014, flare=0.005, rows=5, n=36)]
    pts.extend(panoramic_visor(gid + '_visor', f_top=0.47, f_bot=0.31, span=0.35, ease=0.020,
                               frame_paint=brass_p, lens_paint=canyon_p))
    keff_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_sage'),
        B('top', 0.0, 0.02, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_sage', 'geo_cream', 0.20),
    ])
    pts.extend(draped_face_veil(gid + '_keffiyeh', keff_p, f_top=0.33, z_drop=0.14, ease=0.016))
    entries.append(make_geo_garment(gid, 'Geomancer Canyon Visor & Draped Keffiyeh Wrap (02)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # 03: Left-eye crystal monocle + ivory bone respirator mask with twin cheek filters & vertical mouth vents
    gid = 'geo_mask_03'
    pts = goggle_head_strap(gid, f_center=0.41, band_h=0.065, ease=0.012)
    bone_p = P('geo_ivory', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.02, 'solid', 'geo_slate'),
    ], [
        PN(0.38, 0.62, 'vstripes', 'geo_charcoal', 'geo_ivory', 0.04),
    ], fabric='metal.bronze')
    pts.append(sculpted_faceplate(gid + '_bone_mask', bone_p, f_top=0.37, f_bot=-0.06, ease=0.015, span=0.43))
    pts.extend(goggle_eye_cup(gid + '_monocle_L', 0.036, f_eye=0.41, r_cup=0.031, depth=0.024,
                              bezel_paint=brass_p, lens_paint=opal_p))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        fc = a + (b - a) * 0.14 + left * (sd * 0.054) - bk * 0.112
        pts.append(rosette(f'{gid}_filter_{tag}', fc, -bk + left * (sd * 0.5), up, 0.022, brass_p, n=12, thick=0.016, rigid_joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Ivory Bone Respirator & Monocle (03)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # 04: Wide amber side-lamp visor (geo_mask_04)
    gid = 'geo_mask_04'
    pts = goggle_head_strap(gid, f_center=0.40, band_h=0.075, ease=0.012)
    pts.extend(panoramic_visor(gid + '_visor', f_top=0.48, f_bot=0.29, span=0.39, ease=0.022,
                               frame_paint=brass_p, lens_paint=canyon_p))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        lamp_c = a + (b - a) * 0.40 + left * (sd * 0.094) - bk * 0.048
        pts.append(crystal_vial(f'{gid}_lamp_{tag}', lamp_c, radius=0.017, length=0.045,
                                glass_col='geo_amber', cap_col='geo_brass', axis=(-bk[0], -bk[1], 0.0), joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Illuminated Amber Lamp-Visor (04)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # 05: Stone-brow-shielded goggles + cream topographic pleated face mask
    gid = 'geo_mask_05'
    stone_brow = P('geo_stone', 0.04, [
        B('bottom', 0.0, 0.02, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'calcified_stone', 'geo_cream', 'geo_stone', 0.18),
    ])
    pts = [crown_band(gid + '_stone_brow', stone_brow, f0=0.45, f1=0.66, ease=0.016, flare=0.008, rows=5, n=36)]
    for sd, tag in ((-1, 'R'), (1, 'L')):
        pts.extend(goggle_eye_cup(f'{gid}_{tag}', sd * 0.035, f_eye=0.40, r_cup=0.027, depth=0.020,
                                  bezel_paint=brass_p, lens_paint=canyon_p))
    pleat_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_tan'),
        B('top', 0.0, 0.02, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.20),
    ])
    pts.extend(draped_face_veil(gid + '_pleated_mask', pleat_p, f_top=0.34, z_drop=0.12, ease=0.015))
    entries.append(make_geo_garment(gid, 'Geomancer Stone-Brow Goggles & Pleated Mask (05)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # (NOTE: Mask 06 intentionally skipped per user request!)

    # 07: Round brass goggles + dark ribbed leather respirator with twin green crystal filters
    gid = 'geo_mask_07'
    pts = goggle_head_strap(gid, f_center=0.41, band_h=0.075, ease=0.012)
    rib_mask_p = P('geo_darkleather', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.02, 'solid', 'geo_brass'),
    ], [
        PN(0.35, 0.65, 'lorica_lames', 'geo_brass', 'geo_darkleather', 0.06),
    ], fabric='leather.polished')
    pts.append(sculpted_faceplate(gid + '_respirator', rib_mask_p, f_top=0.37, f_bot=-0.06, ease=0.015, span=0.44))
    for sd, tag in ((-1, 'R'), (1, 'L')):
        pts.extend(goggle_eye_cup(f'{gid}_{tag}', sd * 0.035, f_eye=0.41, r_cup=0.028, depth=0.022,
                                  bezel_paint=brass_p, lens_paint=jade_p))
        fc = a + (b - a) * 0.14 + left * (sd * 0.054) - bk * 0.114
        pts.append(rosette(f'{gid}_green_filter_{tag}', fc, -bk + left * (sd * 0.5), up, 0.024, jade_p, n=12, thick=0.018, rigid_joint='Head'))
    entries.append(make_geo_garment(gid, 'Geomancer Green-Crystal Filter Respirator & Goggles (07)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # 08: Asymmetric half-leather / half-ivory bone mask with left brass monocle
    gid = 'geo_mask_08'
    pts = goggle_head_strap(gid, f_center=0.42, band_h=0.06, ease=0.012)
    split_mask_p = P('geo_ivory', 0.04, [
        B('top', 0.0, 0.02, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.02, 'solid', 'geo_brass'),
    ], [
        PN(0.0, 0.50, 'topographic', 'geo_tan', 'geo_darkleather', 0.20),
        PN(0.50, 1.0, 'calcified_stone', 'geo_brass', 'geo_ivory', 0.16),
    ], fabric='leather.polished')
    pts.append(sculpted_faceplate(gid + '_split_mask', split_mask_p, f_top=0.38, f_bot=-0.06, ease=0.015, span=0.44))
    pts.extend(goggle_eye_cup(gid + '_monocle_L', 0.036, f_eye=0.42, r_cup=0.031, depth=0.024,
                              bezel_paint=brass_p, lens_paint=opal_p))
    entries.append(make_geo_garment(gid, 'Geomancer Split Bone-Leather Mask & Monocle (08)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # 09: Iridescent panoramic visor + sculpted ivory-and-slate vented face mask
    gid = 'geo_mask_09'
    ivory_frame = P('geo_ivory', 0.03, [B('top', 0.0, 0.01, 'solid', 'geo_brass')], fabric='metal.gold')
    pts = goggle_head_strap(gid, f_center=0.41, band_h=0.065, ease=0.012, paint=ivory_frame)
    pts.extend(panoramic_visor(gid + '_nacre_visor', f_top=0.49, f_bot=0.31, span=0.39, ease=0.021,
                               frame_paint=ivory_frame, lens_paint=opal_p, wave_amp=0.020))
    vent_mask_p = P('geo_ivory', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'geo_brass'),
        B('bottom', 0.0, 0.025, 'solid', 'geo_slate'),
    ], [
        PN(0.32, 0.68, 'lorica_lames', 'geo_slate', 'geo_ivory', 0.06),
    ], fabric='metal.bronze')
    pts.append(sculpted_faceplate(gid + '_vent_mask', vent_mask_p, f_top=0.34, f_bot=-0.06, ease=0.015, span=0.44))
    entries.append(make_geo_garment(gid, 'Geomancer Nacre Panorama Visor & Ivory Faceplate (09)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    # 10: Multi-loupe left-eye surveyor goggles + draped cream topographic face veil
    gid = 'geo_mask_10'
    pts = goggle_head_strap(gid, f_center=0.41, band_h=0.075, ease=0.012)
    pts.extend(goggle_eye_cup(gid + '_R_opal', -0.035, f_eye=0.41, r_cup=0.028, depth=0.022,
                              bezel_paint=brass_p, lens_paint=opal_p))
    pts.extend(goggle_eye_cup(gid + '_L_green', 0.035, f_eye=0.41, r_cup=0.029, depth=0.024,
                              bezel_paint=brass_p, lens_paint=jade_p))
    pts.extend(goggle_eye_cup(gid + '_L_amber_loupe', 0.056, f_eye=0.48, r_cup=0.021, depth=0.020,
                              bezel_paint=brass_p, lens_paint=canyon_p))
    veil_p = P('geo_cream', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'geo_brass'),
        B('top', 0.0, 0.02, 'solid', 'geo_tan'),
    ], [
        PN(0.0, 1.0, 'topographic', 'geo_tan', 'geo_cream', 0.22),
    ])
    pts.extend(draped_face_veil(gid + '_topo_veil', veil_p, f_top=0.34, z_drop=0.14, ease=0.016))
    entries.append(make_geo_garment(gid, 'Geomancer Triple-Loupe Goggles & Topographic Veil (10)', 'head', pts,
                                    covers_hair=False, covers_face=True))

    return entries


# ===============================================================================================================
# 11. MAIN BUILDER PIPELINE (Both mpfb_male and mpfb_female + geomancers_manifest.json)
# ===============================================================================================================
OUTFIT_BUILDERS = [
    build_geo_01_sultan_strider,
    build_geo_02_obelisk_acolyte,
    build_geo_03_ochre_lithomancer,
    build_geo_04_crystal_warden,
    build_geo_05_dune_chevalier,
    build_geo_06_chime_oracle,
    build_geo_07_exo_rig_engineer,
    build_geo_08_calcified_nomad,
    build_geo_09_amber_alchemist,
    build_geo_10_basalt_veteran,
    build_geo_13_bamboo_surveyor,
    build_geo_14_lantern_mason,
    build_geo_15_crescent_sage,
    build_geo_19_field_cartographer,
    build_geo_20_geode_delver,
    build_geo_23_aether_scout,
    build_geo_24_jade_resonance_sage,
    build_geo_25_sphere_atlas,
]


def build_all_for_body(body_id):
    """Build all 18 Geomancer outfits + 10 Goggles + 9 Face-Masks for `body_id`."""
    t0 = time.time()
    set_body(body_id)
    entries = []
    outfits_map = {}

    for fn in OUTFIT_BUILDERS:
        res = fn()
        for ok, ents in res.items():
            entries.extend(ents)
            outfits_map[ok] = [e['id'] for e in ents]

    gog_entries = build_geo_goggles()
    entries.extend(gog_entries)

    mask_entries = build_geo_masks()
    entries.extend(mask_entries)

    dt = time.time() - t0
    print(f"[{body_id}] Built {len(entries)} Geomancer pieces ({len(outfits_map)} outfits + {len(gog_entries)} goggles + {len(mask_entries)} masks) in {dt:.1f}s")
    return entries, outfits_map


def main():
    t_start = time.time()
    male_entries, outfits_map = build_all_for_body('mpfb_male')
    female_entries, _ = build_all_for_body('mpfb_female')

    manifest = {
        'male_entries': male_entries,
        'female_entries': female_entries,
        'outfits': outfits_map,
    }
    manifest_path = SCRATCH / 'geomancers_manifest.json'
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    for b_id, ents in (('mpfb_male', male_entries), ('mpfb_female', female_entries)):
        kp = ROOT / 'data' / b_id / 'kit.json'
        kit = json.loads(kp.read_text(encoding='utf-8'))
        by_id = {it['id']: idx for idx, it in enumerate(kit['items']) if 'id' in it}
        for e in ents:
            ee = dict(e)
            ee.pop('_body', None)
            if ee['id'] in by_id:
                kit['items'][by_id[ee['id']]] = ee
            else:
                kit['items'].append(ee)
                by_id[ee['id']] = len(kit['items']) - 1
        kp.write_text(json.dumps(kit, indent=2) + '\n', encoding='utf-8')
    print(f"Saved manifest to {manifest_path} (male={len(male_entries)}, female={len(female_entries)}, outfits={len(outfits_map)}) in {time.time() - t_start:.1f}s")


if __name__ == '__main__':
    main()
