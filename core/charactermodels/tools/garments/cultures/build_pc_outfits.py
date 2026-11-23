"""Build the 5 Recruitable PC Outfits across Xanadu, Iron Republic, Free Clans (Torgo), Abyssal, and Order of Historians."""
import base64
import copy
import json
import math
import os
import sys
import time
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[3]          # core/charactermodels (this file: tools/garments/cultures/)
SCRATCH = Path(__file__).resolve().parent             # the builders beside this one (once Gemini's scratch folder)
sys.path.insert(0, str(ROOT / 'tools'))

import garments as bio
from garments import C, P, B, PN, Part, head_frame, hood, blob, horn, set_body, J
from garments import paint as gpaint

# Register custom palette colors for the 5 Recruitable PC Outfits
C.update({
    'peony_cream': (0.91, 0.89, 0.84),
    'peony_violet': (0.36, 0.11, 0.44),
    'peony_magenta': (0.62, 0.14, 0.34),
    'peony_orange': (0.86, 0.38, 0.12),
    'peony_leaf': (0.18, 0.36, 0.18),
    'saffron_yellow': (0.92, 0.72, 0.08),
    'saffron_shadow': (0.68, 0.48, 0.04),
    'harlequin_teal': (0.18, 0.48, 0.50),
    'harlequin_crimson': (0.68, 0.18, 0.24),
    'harlequin_mustard': (0.82, 0.68, 0.24),
    'harlequin_green': (0.20, 0.42, 0.30),
    'harlequin_white': (0.92, 0.91, 0.89),
    'torgo_black': (0.05, 0.05, 0.06),
    'torgo_gold': (0.82, 0.66, 0.28),
    'torgo_nude': (0.58, 0.43, 0.34),
    'abyss_turquoise': (0.06, 0.56, 0.68),
    'abyss_mint': (0.14, 0.72, 0.58),
    'abyss_indigo': (0.06, 0.09, 0.28),
    'abyss_coral': (0.86, 0.42, 0.32),
    'abyss_fez': (0.84, 0.18, 0.26),
    'lancer_cream': (0.92, 0.88, 0.56),
    'lancer_red': (0.78, 0.14, 0.14),
    'lancer_steel': (0.46, 0.49, 0.47),
    'lancer_orange': (0.82, 0.40, 0.18),
    'lancer_cyan': (0.28, 0.90, 0.96),
})

_orig_motif = gpaint.motif


def _pc_motif(style, w, h, fg, bg, aspect=1.0):
    u = np.linspace(0.0, 1.0, max(w, 2), endpoint=False)[None, :]
    v = np.linspace(0.0, 1.0, max(h, 2), endpoint=False)[:, None]
    img = np.empty((max(h, 2), max(w, 2), 3), dtype=np.float64)

    if style == 'peony_brocade':
        img[:] = C['peony_cream']
        # Lush multi-colored peony blossoms (purple, orange, gold, crimson) + dark botanical leaves
        centers = [
            (0.24, 0.28, 0.21, C['peony_violet'], C['peony_magenta']),
            (0.74, 0.32, 0.22, C['peony_orange'], C['saffron_yellow']),
            (0.48, 0.68, 0.24, C['peony_magenta'], C['peony_violet']),
            (0.18, 0.78, 0.19, C['saffron_yellow'], C['peony_orange']),
            (0.82, 0.76, 0.20, C['peony_violet'], C['gold']),
        ]
        # Background leaf vines
        vine = (np.abs(np.sin(u * 4.0 * math.pi + v * 2.0 * math.pi)) < 0.14) | (
            np.abs(np.cos(u * 3.0 * math.pi - v * 3.0 * math.pi)) < 0.12
        )
        img[vine] = C['peony_leaf']
        for cx, cy, rad, c_outer, c_inner in centers:
            dx = (u - cx) * max(aspect, 0.65)
            dy = v - cy
            r = np.hypot(dx, dy)
            ang = np.arctan2(dy, dx)
            petals = rad * (0.82 + 0.18 * np.cos(ang * 7.0))
            in_blossom = r < petals
            in_mid = r < petals * 0.62
            in_core = r < rad * 0.22
            img[in_blossom] = c_outer
            img[in_mid] = c_inner
            img[in_core] = C['gold']
        tex_folk = gpaint.sample_cultural_tex('tex.highlands_folk', max(w, 2), max(h, 2), C['peony_violet'], C['peony_cream'], pal_blend=0.20)
        return 0.42 * img + 0.58 * tex_folk

    if style == 'harlequin_patchwork':
        # Asymmetrical patchwork of crimson, teal with mustard polka-dots, mustard with red squiggles, and green with white polka-dots
        img[:] = bg
        q_left = u < 0.50
        q_top = v < 0.52
        # Quadrant 1 (top-left): teal with mustard dots
        m1 = q_left & q_top
        img[m1] = C['harlequin_teal']
        du = ((u * 8.0) % 1.0) - 0.5
        dv = ((v * 8.0) % 1.0) - 0.5
        dots1 = m1 & (np.hypot(du, dv) < 0.20)
        img[dots1] = C['harlequin_mustard']
        # Quadrant 2 (top-right): crimson with maroon rose-scrolls
        m2 = (~q_left) & q_top
        img[m2] = C['harlequin_crimson']
        scroll = m2 & (np.abs(np.sin(u * 10.0 * math.pi) + np.cos(v * 10.0 * math.pi)) < 0.35)
        img[scroll] = C['maroon']
        # Quadrant 3 (bottom-left): crimson + green/gold brocade corner
        m3 = q_left & (~q_top)
        img[m3] = C['harlequin_crimson']
        broc = m3 & ((u + v) > 1.12)
        img[broc] = C['harlequin_green']
        broc_line = broc & (np.abs(np.sin(u * 14.0 * math.pi) * np.cos(v * 14.0 * math.pi)) > 0.45)
        img[broc_line] = C['harlequin_mustard']
        # Quadrant 4 (bottom-right): mustard top + green with white polka-dots bottom
        m4_top = (~q_left) & (v >= 0.52) & (v < 0.74)
        m4_bot = (~q_left) & (v >= 0.74)
        img[m4_top] = C['harlequin_mustard']
        sq = m4_top & (np.abs(np.sin(v * 16.0 * math.pi) * 0.06 - (u - 0.75)) < 0.018)
        img[sq] = C['harlequin_crimson']
        img[m4_bot] = C['harlequin_green']
        dots4 = m4_bot & (np.hypot(du, dv) < 0.22)
        img[dots4] = C['harlequin_white']
        # White cross-stitching along seams
        seam_v = (np.abs(u - 0.50) < 0.016) & (((np.floor(v * 28.0)) % 2) == 0)
        seam_h = (np.abs(v - 0.52) < 0.016) & (((np.floor(u * 28.0)) % 2) == 0)
        img[seam_v | seam_h] = C['harlequin_white']
        return img

    if style == 'harlequin_mask':
        # Split patchwork face mask: right side teal with gold sheriff star, left side white with red button eye, green/mustard jaw
        img[:] = C['harlequin_teal']
        left_eye_zone = (u < 0.48) & (v < 0.56)
        img[left_eye_zone] = C['harlequin_white']
        jaw_zone = v >= 0.56
        img[jaw_zone & (u < 0.55)] = C['harlequin_mustard']
        img[jaw_zone & (u >= 0.55)] = C['harlequin_green']
        # Red button over left eye (u ~ 0.34, v ~ 0.38)
        r_btn = np.hypot((u - 0.34) * 1.4, v - 0.38)
        img[r_btn < 0.11] = C['harlequin_crimson']
        img[(r_btn >= 0.11) & (r_btn < 0.135)] = C['soot']
        # Gold sheriff star over right eye (u ~ 0.66, v ~ 0.38)
        dx, dy = (u - 0.66) * 1.4, v - 0.38
        r_st = np.hypot(dx, dy)
        ang_st = np.arctan2(dy, dx)
        star_r = 0.13 * (0.58 + 0.42 * np.cos(ang_st * 6.0))
        img[r_st < star_r] = C['gold']
        # Stitch lines
        seam = ((np.abs(u - 0.48) < 0.018) | (np.abs(v - 0.56) < 0.018)) & (((np.floor((u + v) * 24.0)) % 2) == 0)
        img[seam] = C['harlequin_white']
        return img

    if style == 'torgo_lace':
        # Intricate black floral Chantilly lace over warm bronze-nude lining
        img[:] = C['torgo_nude']
        su = (u * 6.0) % 1.0 - 0.5
        sv = (v * 6.0) % 1.0 - 0.5
        r = np.hypot(su, sv)
        ang = np.arctan2(sv, su)
        petal = 0.36 * (0.75 + 0.25 * np.cos(ang * 6.0))
        web = (np.abs(r - petal) < 0.07) | (r < 0.11) | (np.abs(su) > 0.44) | (np.abs(sv) > 0.44) | (
            np.abs(np.abs(su) - np.abs(sv)) < 0.05
        )
        img[web] = C['torgo_black']
        tex_damask = gpaint.sample_cultural_tex('tex.voth_damask', max(w, 2), max(h, 2), C['torgo_nude'], C['torgo_black'], pal_blend=0.45)
        return 0.52 * img + 0.48 * tex_damask

    if style == 'torgo_sleeve_bands':
        # Horizontal woven gold-and-silver geometric Mongolian brocade bands on black velvet
        img[:] = C['torgo_black']
        band_idx = np.floor(v * 10.0)
        in_band = (band_idx >= 2) & (band_idx <= 7) & (((v * 10.0) % 1.0) < 0.72)
        sub_v = ((v * 10.0) % 1.0) / 0.72
        rail = in_band & ((sub_v < 0.16) | (sub_v > 0.84))
        diamond = in_band & (np.abs(((u * 18.0) % 1.0) - 0.5) + np.abs(sub_v - 0.5) < 0.38)
        img[rail | diamond] = C['torgo_gold']
        tex_solar = gpaint.sample_cultural_tex('tex.voth_solar', max(w, 2), max(h, 2), C['torgo_gold'], C['torgo_black'], pal_blend=0.38)
        return 0.50 * img + 0.50 * tex_solar

    if style == 'abyssal_chevron_border':
        # Coral-orange and gold geometric diagonal stripe & triangle border on turquoise silk
        img[:] = bg
        au = np.abs(u - 0.5) * 2.0
        diag = ((u * 12.0 + v * 16.0) % 1.0) < 0.38
        tri = (au < 0.32) & (((v * 10.0) % 1.0) < 0.45)
        rail = (au > 0.82) | (au < 0.12)
        img[diag | rail] = C['abyss_coral']
        img[tri] = C['gold']
        tex_rl = gpaint.sample_cultural_tex('tex.reedlake_band', max(w, 2), max(h, 2), C['abyss_coral'], bg, pal_blend=0.28)
        return 0.45 * img + 0.55 * tex_rl

    if style == 'lancer_jagged_border':
        # Cream silk with bold crimson lightning/chevron border and crimson droplet rivets
        img[:] = C['lancer_cream']
        au = np.abs(u - 0.5) * 2.0
        zag = 0.62 + 0.22 * np.abs(((v * 4.0) % 1.0) - 0.5) * 2.0
        in_red = (au > zag) | (v > 0.90)
        img[in_red] = C['lancer_red']
        # Red rivet dots along the inner cream field
        dv = ((v * 10.0) % 1.0) - 0.5
        du = (au - 0.44) * 4.0
        dots = (np.hypot(du, dv) < 0.22) & (~in_red)
        img[dots] = C['lancer_red']
        tex_xb = gpaint.sample_cultural_tex('tex.xanadu_band', max(w, 2), max(h, 2), C['lancer_red'], C['lancer_cream'], pal_blend=0.32)
        return 0.50 * img + 0.50 * tex_xb

    return _orig_motif(style, w, h, fg, bg, aspect=aspect)


gpaint.motif = _pc_motif
bio.motif = _pc_motif


def assemble_garment(gid, label, slot, culture, parts, **kw):
    flat = []
    for p in parts:
        if isinstance(p, (list, tuple)):
            flat.extend(p)
        elif p is not None:
            flat.append(p)
    return bio.assemble_garment(gid, label, slot, culture, flat, **kw)


def rosette(name, center, out_vec, side_vec, radius, paint, n=14, thick=0.014, rigid_joint=None):
    return bio.blob(name, center, (radius * 2.0, thick * 2.0, radius * 2.0), paint,
                    n=n, rows=5, out=out_vec, rigid_joint=rigid_joint)


_orig_torso_tube = bio.torso_tube
_orig_tabard = bio.tabard
_orig_cape = bio.cape
_orig_boot = bio.boot


def _pc_torso_tube(name, z0, z1, paint, ease=0.024, flare=0.0, arc=None, over_arms=False, rows=16, n=36, **kw):
    return _orig_torso_tube(name, max(z0, z1), min(z0, z1), ease, paint, n=n, rows=rows, flare=flare, arc=arc, over_arms=over_arms, **kw)


def _pc_tabard(name, z0, z1, width, paint, ease=0.036, back_len=False, point=0.0, **kw):
    return _orig_tabard(name, min(z0, z1), max(z0, z1), paint, width=width, ease=ease, front=True, back=bool(back_len))


def _pc_band(name, z_low, z_high, paint, ease=0.032, **kw):
    z_top, z_bot = max(z_low, z_high), min(z_low, z_high)
    return _orig_torso_tube(name, z_top, z_bot, ease, paint, n=40, rows=6, hull_from=z_top)


def _pc_cape(name, z_bot, z_top, paint, arc=1.35, ease=0.052, flare=0.16, rows=20, n=36, **kw):
    return _orig_cape(name, min(z_bot, z_top), paint, z_top=max(z_bot, z_top), span=arc, ease=ease, flare=flare, rows=rows, n=n)


def _pc_boot(name, side, paint, top_f=0.35, ease=0.018, **kw):
    return _orig_boot(name, side, paint, top_f=top_f, ease=ease)


def _pc_brimmed_hat(name, paint, r_brim=0.25, h_crown=0.11, f=0.62, **kw):
    return [
        bio.brim(name + '_brim', f, max(0.08, r_brim - 0.095), paint, droop=0.015),
        bio.tower_hat(name + '_crown', h_crown, lambda s: 1.0 - 0.14 * s, paint, f=f, ease=0.014, rows=10, n=36),
    ]


def _pc_tassel(name, top_pos, length, radius, paint, rigid_joint=None):
    bot_pos = np.asarray(top_pos, float) - np.array([0.0, 0.0, length])
    return bio.horn(name, [top_pos, bot_pos], radius * 0.85, radius * 1.15, paint, n=8, rows=6, rigid_joint=rigid_joint)


def _pc_crown_band(name, f0, f1, paint, bulge=0.01, ease=0.018, rows=5, n=30, **kw):
    return bio.head_rings(name, f0, f1, max(0.005, ease + bulge), paint, n=n, rows=rows, apex=False)


bio.torso_tube = _pc_torso_tube
bio.tabard = _pc_tabard
bio.band = _pc_band
bio.cape = _pc_cape
bio.boot = _pc_boot
bio.slouch_hat = _pc_brimmed_hat
bio.brimmed_hat = _pc_brimmed_hat
bio.tassel = _pc_tassel
bio.crown_band = _pc_crown_band


# ==============================================================================
# OUTFIT 1: Xanadu (`mind_front`) — `pc_floral_envoy` (Image 1)
# High black turtleneck + crossed black lapel, peony floral brocade jacket with
# bell cuffs & front floral apron panel, wide black silk obi sash, voluminous
# pleated saffron-yellow balloon trousers, and glossy black leather boots.
# ==============================================================================
def build_pc_floral_envoy(body_id, sex_tag):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    # 1. TORSO: xan_{m/f}_pc_envoy_jacket
    gid_t = f'xan_{sex_tag}_pc_envoy_jacket'
    parts_t = []
    # High black turtleneck inner collar + crossed black silk hanbok/kimono lapel collar
    parts_t.append(bio.collar(gid_t + '_turtleneck', P('soot', 0.03, fabric='cloth.silk'), height=0.032, flare=0.004, ease=0.014, open_front=False, rows=5, n=32))
    parts_t.append(bio.collar(gid_t + '_lapel', P('soot', 0.02, [B('bottom', 0.0, 0.02, 'solid', 'gold')], fabric='cloth.silk'), height=0.026, flare=0.014, ease=0.020, open_front=True, rows=5, n=32))

    # Rich peony floral brocade jacket + split knee-length coat-tails
    floral_p = P('peony_cream', 0.03, [
        B('top', 0.0, 0.04, 'solid', 'soot'),
        B('bottom', 0.0, 0.03, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'peony_brocade', 'peony_violet', 'peony_cream', 0.34),
    ], fabric='cloth.silk')
    parts_t.append(bio.torso_tube(gid_t + '_bodice', bio.WAIST - 0.02, bio.TOP + 0.01, floral_p, ease=0.018, flare=0.01, rows=14, n=40))
    # Back & side flared floral coat-tails (open in front to show the yellow balloon pants and front floral apron!)
    parts_t.append(bio.torso_tube(gid_t + '_coattails', bio.KNEE + 0.04, bio.WAIST - 0.01, floral_p, ease=0.034, ease_bottom=0.048, flare=0.14, arc=(-math.pi * 0.68, math.pi * 0.68), rows=14, n=36, layer=2))
    # Rectangular front floral apron panel hanging from under the obi waist down to mid-thigh
    parts_t.append(bio.tabard(gid_t + '_apron', bio.WAIST - 0.02, bio.KNEE + 0.14, 0.19, floral_p, ease=0.036, back_len=False))

    # Wide black silk obi belt with knotted bow & diagonal black sash ribbon
    obi_p = P('soot', 0.02, [B('top', 0.0, 0.015, 'solid', 'peony_violet')], fabric='cloth.silk')
    parts_t.append(bio.band(gid_t + '_obi', bio.WAIST - 0.03, bio.WAIST + 0.07, obi_p, ease=0.038))
    bow_pos = bio.chest_front(bio.WAIST + 0.02, 0.048, x=0.02)
    parts_t.append(blob(gid_t + '_obi_knot', bow_pos, (0.09, 0.045, 0.055), obi_p, n=12, rows=5, rigid_joint='Spine'))

    # Fitted upper sleeves flaring smoothly toward the wrists
    for side in ('Left', 'Right'):
        parts_t.append(bio.sleeve(f'{gid_t}_sleeve_{side}', side, floral_p, f0=0.0, f1=0.86, ease=0.016, flare=0.026, rows=12, n=24))
    e_t = assemble_garment(gid_t, 'Xanadu Peony-Brocade Envoy Jacket & Obi', 'torso', 'xanadu', parts_t)
    e_t['type'] = 'pc'
    entries.append(e_t)

    # 2. LEGS: xan_{m/f}_pc_envoy_pants
    gid_l = f'xan_{sex_tag}_pc_envoy_pants'
    pants_p = P('saffron_yellow', 0.03, [
        B('bottom', 0.0, 0.05, 'solid', 'saffron_shadow'),
    ], [
        PN(0.0, 1.0, 'stripes', 'saffron_shadow', 'saffron_yellow', 0.055),
    ], fabric='cloth.silk')
    parts_l = bio.trousers(gid_l, pants_p, ankle_f=0.60, ease=0.016, bag=0.024, ease_end=0.012, rows=16, n=26)
    e_l = assemble_garment(gid_l, 'Xanadu Saffron-Silk Pleated Balloon Trousers', 'legs', 'xanadu', parts_l, legged=True)
    e_l['type'] = 'pc'
    entries.append(e_l)

    # 3. FEET: xan_{m/f}_pc_envoy_boots
    gid_f = f'xan_{sex_tag}_pc_envoy_boots'
    boot_p = P('soot', 0.02, [B('top', 0.0, 0.03, 'solid', 'gold')], fabric='leather.polished')
    parts_f = [bio.boot(f'{gid_f}_{s}', s, boot_p, top_f=0.45, ease=0.022, rows=14, n=22, cuff=0.010, point=0.025) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Xanadu Glossy Black Leather Envoy Boots', 'feet', 'xanadu', parts_f)
    e_f['type'] = 'pc'
    entries.append(e_f)

    return entries, {
        'torso': gid_t,
        'legs': gid_l,
        'feet': gid_f,
        'type': 'pc',
        'label': 'Xanadu Peony-Brocade Envoy (PC)',
    }


# ==============================================================================
# OUTFIT 2: Iron Republic (`iron_republic`) — `pc_patchwork_sheriff` (Image 2)
# Wide-brimmed patchwork cowboy hat + stitched full-face harlequin mask with
# gold sheriff star & button eye, asymmetrical patchwork poncho-cloak over white
# rose-embroidered western shirt & star gunbelt, patched white breeches, and
# mismatched colorful cowboy boots.
# ==============================================================================
def build_pc_patchwork_sheriff(body_id, sex_tag):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    # 1. HEAD: rep_{m/f}_pc_sheriff_hat
    gid_h = f'rep_{sex_tag}_pc_sheriff_hat'
    parts_h = []
    mask_p = P('harlequin_teal', 0.04, [], [PN(0.0, 1.0, 'harlequin_mask', 'gold', 'harlequin_teal', 0.30)], fabric='cloth.canvas')
    parts_h.append(bio.sculpted_cranium(gid_h + '_cranium', mask_p, f_top=1.02, f_bot=0.10, ease=0.009))
    parts_h.append(bio.sculpted_faceplate(gid_h + '_mask', mask_p, f_top=0.78, f_bot=-0.05, ease=0.013, jaw_narrow=0.32))
    # Wide-brimmed patchwork cowboy hat with crimson hatband
    hat_p = P('harlequin_mustard', 0.04, [
        B('bottom', 0.0, 0.05, 'solid', 'harlequin_white'),
        B('top', 0.0, 0.04, 'solid', 'harlequin_crimson'),
    ], [
        PN(0.35, 0.75, 'solid', 'harlequin_crimson', 'harlequin_mustard', 0.14),
    ], fabric='leather.matte')
    parts_h.append(bio.slouch_hat(gid_h + '_cowboy_hat', hat_p, r_brim=0.25, h_crown=0.13, f=0.62, side_Pinch=0.025, front_dip=0.015, rows=12, n=36))
    e_h = assemble_garment(gid_h, 'Patchwork Sheriff Cowboy Hat & Stitched Mask', 'head', 'iron_republic', parts_h, covers_hair=True, covers_face=True)
    e_h['type'] = 'pc'
    entries.append(e_h)

    # 2. TORSO: rep_{m/f}_pc_sheriff_poncho
    gid_t = f'rep_{sex_tag}_pc_sheriff_poncho'
    parts_t = []
    # White western bib-shirt with red roses above the waist & green shoulder piping
    shirt_p = P('harlequin_white', 0.03, [
        B('bottom', 0.0, 0.08, 'floral', 'harlequin_crimson', 'harlequin_white', 0.07),
        B('top', 0.0, 0.05, 'fret', 'harlequin_green', 'harlequin_white', 0.04),
    ], fabric='cloth.cotton')
    parts_t.append(bio.torso_tube(gid_t + '_shirt', bio.WAIST - 0.02, bio.TOP, shirt_p, ease=0.016, flare=0.0, rows=12, n=36))
    # Low teal cowl neck-wrap
    parts_t.append(bio.collar(gid_t + '_cowl', P('harlequin_teal', 0.04, [B('top', 0.0, 0.02, 'solid', 'soot')]), height=0.030, flare=0.012, ease=0.020, rows=5, n=32))
    # Sweeping asymmetrical multi-color patchwork poncho-cloak (`harlequin_patchwork`)
    poncho_p = P('harlequin_crimson', 0.05, [
        B('bottom', 0.0, 0.05, 'zag', 'soot', 'harlequin_teal', 0.05),
    ], [
        PN(0.0, 1.0, 'harlequin_patchwork', 'harlequin_mustard', 'harlequin_crimson', 0.85),
    ], fabric='cloth.wool')
    parts_t.append(bio.cape(gid_t + '_cloak', bio.ANKLE + 0.12, bio.TOP - 0.01, poncho_p, arc=1.18, ease=0.042, flare=0.14, rows=20, n=32))
    # Draped 360-degree patchwork poncho mantle over the shoulders & upper chest
    parts_t.append(bio.collar_disc(gid_t + '_poncho_mantle', 0.15, poncho_p, drop=0.11, rows=7, n=40, scallop=0.06, ease=0.026, z_off=0.005))
    # Leather gunbelt with silver sheriff-star buckle & hip holster
    belt_p = P('leather', 0.04, [B('top', 0.0, 0.015, 'solid', 'gold'), B('bottom', 0.0, 0.015, 'solid', 'gold')], fabric='leather.polished')
    parts_t.append(bio.band(gid_t + '_gunbelt', bio.WAIST - 0.04, bio.WAIST + 0.025, belt_p, ease=0.036))
    buckle_pos = bio.chest_front(bio.WAIST - 0.01, 0.046)
    parts_t.append(rosette(gid_t + '_star_buckle', buckle_pos, np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]), 0.036, P('silver', 0.02, fabric='metal.iron'), n=12, thick=0.012, rigid_joint='Hips'))
    # Sleeves: right sleeve draped in patchwork poncho, left sleeve crisp white western shirt with green cuff
    parts_t.append(bio.sleeve(f'{gid_t}_sleeve_Right', 'Right', poncho_p, f0=0.0, f1=0.72, ease=0.016, flare=0.012, rows=11, n=22))
    left_slv_p = P('harlequin_white', 0.03, [B('bottom', 0.0, 0.08, 'solid', 'harlequin_green'), B('top', 0.0, 0.06, 'solid', 'harlequin_teal')], fabric='cloth.cotton')
    parts_t.append(bio.sleeve(f'{gid_t}_sleeve_Left', 'Left', left_slv_p, f0=0.0, f1=0.72, ease=0.016, flare=0.012, rows=11, n=22))
    e_t = assemble_garment(gid_t, 'Patchwork Sheriff Poncho-Cloak & Star Gunbelt', 'torso', 'iron_republic', parts_t)
    e_t['type'] = 'pc'
    entries.append(e_t)

    # 3. GLOVES: rep_{m/f}_pc_sheriff_gloves
    gid_g = f'rep_{sex_tag}_pc_sheriff_gloves'
    glove_p = P('harlequin_white', 0.02, [B('top', 0.0, 0.05, 'solid', 'harlequin_green'), B('bottom', 0.0, 0.02, 'solid', 'harlequin_crimson')], fabric='leather.matte')
    parts_g = [bio.sleeve(f'{gid_g}_{s}', s, glove_p, f0=0.72, f1=1.0, ease=0.014, flare=0.012, rows=7, n=20) for s in ('Left', 'Right')]
    e_g = assemble_garment(gid_g, 'Patchwork Sheriff White Duelling Gloves', 'gloves', 'iron_republic', parts_g)
    e_g['type'] = 'pc'
    entries.append(e_g)

    # 4. LEGS: rep_{m/f}_pc_sheriff_pants
    gid_l = f'rep_{sex_tag}_pc_sheriff_pants'
    pants_p = P('harlequin_white', 0.03, [
        B('bottom', 0.0, 0.16, 'solid', 'harlequin_teal'),
        B('top', 0.0, 0.06, 'zag', 'harlequin_teal', 'harlequin_white', 0.05),
    ], [
        PN(0.55, 0.85, 'checks', 'harlequin_green', 'harlequin_white', 0.12),
    ], fabric='cloth.canvas')
    parts_l = list(bio.trousers(gid_l, pants_p, ankle_f=0.68, ease=0.014, bag=0.012, ease_end=0.012, rows=16, n=26))
    holster_pos = bio.surface_out(bio.spine_at(bio.WAIST - 0.05), left, 0.036)
    parts_l.append(blob(gid_l + '_holster', holster_pos, (0.060, 0.032, 0.10), P('leather', 0.04, fabric='leather.matte'), n=10, rows=6, out=left, rigid_joint='Hips'))
    e_l = assemble_garment(gid_l, 'Patchwork Sheriff Stitched White Breeches', 'legs', 'iron_republic', parts_l, legged=True)
    e_l['type'] = 'pc'
    entries.append(e_l)

    # 5. FEET: rep_{m/f}_pc_sheriff_boots
    gid_f = f'rep_{sex_tag}_pc_sheriff_boots'
    boot_r_p = P('harlequin_mustard', 0.03, [B('top', 0.0, 0.06, 'zag', 'harlequin_teal', 'harlequin_mustard', 0.05), B('bottom', 0.0, 0.08, 'zag', 'harlequin_crimson', 'harlequin_teal', 0.05)], fabric='leather.polished')
    boot_l_p = P('umber', 0.03, [B('top', 0.0, 0.06, 'zag', 'harlequin_crimson', 'umber', 0.05), B('bottom', 0.0, 0.09, 'zag', 'harlequin_crimson', 'harlequin_white', 0.05)], fabric='leather.polished')
    parts_f = [
        bio.boot(f'{gid_f}_Right', 'Right', boot_r_p, top_f=0.36, ease=0.022, rows=14, n=22, cuff=0.015, point=0.028),
        bio.boot(f'{gid_f}_Left', 'Left', boot_l_p, top_f=0.36, ease=0.022, rows=14, n=22, cuff=0.015, point=0.028),
    ]
    e_f = assemble_garment(gid_f, 'Patchwork Sheriff Mismatched Cowboy Boots', 'feet', 'iron_republic', parts_f)
    e_f['type'] = 'pc'
    entries.append(e_f)

    return entries, {
        'head': gid_h,
        'torso': gid_t,
        'gloves': gid_g,
        'legs': gid_l,
        'feet': gid_f,
        'hair': None,
        'beard': None,
        'type': 'pc',
        'label': 'Iron Republic Patchwork Sheriff (PC)',
    }


# ==============================================================================
# OUTFIT 3: Free Clans / Torgo Couture (`rustic_clansmen`) — `pc_torgo_couture` (Image 3)
# Wide-brimmed black velvet Mongolian court hat with gold medallions & finial,
# floor-length black velvet & gold-brocade greatcoat with pleated shoulders,
# gold frog-closures, leopard-gold hem, and checkerboard gold-framed obi over a
# black floral lace bodysuit & lace stockings.
# ==============================================================================
def build_pc_torgo_couture(body_id, sex_tag):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    # 1. HEAD: rustic_{m/f}_pc_torgo_hat
    gid_h = f'rustic_{sex_tag}_pc_torgo_hat'
    parts_h = []
    hat_p = P('torgo_black', 0.03, [
        B('top', 0.0, 0.09, 'rosettes', 'torgo_gold', 'torgo_black', 0.055),
        B('bottom', 0.0, 0.02, 'solid', 'torgo_gold'),
    ], fabric='cloth.velvet')
    parts_h.append(bio.brimmed_hat(gid_h + '_hat', hat_p, r_brim=0.26, h_crown=0.095, f=0.64, brim_tilt=-0.04, rows=12, n=36))
    # Black-and-gold spire finial on top of crown + hanging gold-and-onyx temple earrings
    fin_pts = [a + (b - a) * (0.98 + 0.16 * t) for t in np.linspace(0, 1, 5)]
    parts_h.append(horn(gid_h + '_finial', fin_pts, 0.016, 0.003, P('torgo_black', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'torgo_gold')], fabric='metal.gold'), n=8, rows=5, rigid_joint='Head'))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ear_top = a + (b - a) * 0.28 + left * (sgn * 0.096) - bk * 0.015
        parts_h.append(bio.tassel(f'{gid_h}_earring_{tag}', ear_top, 0.085, 0.010, P('torgo_gold', 0.02, [B('bottom', 0.0, 0.03, 'solid', 'torgo_black')], fabric='metal.gold'), rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Torgo Gold-Medallion Court Hat', 'head', 'rustic_clansmen', parts_h, covers_hair=True, covers_face=False)
    e_h['type'] = 'pc'
    entries.append(e_h)

    # 2. TORSO: rustic_{m/f}_pc_torgo_coat
    gid_t = f'rustic_{sex_tag}_pc_torgo_coat'
    parts_t = []
    # High-neck black floral lace bodysuit (`torgo_lace`) + gold-framed black checkerboard corset belt
    lace_p = P('torgo_nude', 0.03, [B('top', 0.0, 0.04, 'solid', 'torgo_black')], [PN(0.0, 1.0, 'torgo_lace', 'torgo_black', 'torgo_nude', 0.18)], fabric='cloth.silk')
    parts_t.append(bio.collar(gid_t + '_lace_neck', lace_p, height=0.032, flare=0.004, ease=0.014, rows=5, n=32))
    parts_t.append(bio.torso_tube(gid_t + '_bodysuit', bio.WAIST - 0.02, bio.TOP + 0.01, lace_p, ease=0.014, flare=0.0, rows=12, n=36))
    obi_p = P('torgo_black', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'torgo_gold'),
        B('bottom', 0.0, 0.02, 'solid', 'torgo_gold'),
    ], [
        PN(0.32, 0.68, 'checks', 'soot', 'torgo_black', 0.035),
    ], fabric='leather.polished')
    parts_t.append(bio.band(gid_t + '_check_obi', bio.WAIST - 0.03, bio.WAIST + 0.07, obi_p, ease=0.026))

    # Sweeping floor-length open-front black velvet & gold-brocade greatcoat with gold frog-closures and leopard-gold hem border
    coat_p = P('torgo_black', 0.03, [
        B('bottom', 0.0, 0.16, 'rosettes', 'torgo_gold', 'torgo_black', 0.065),
        B('top', 0.0, 0.05, 'fret', 'torgo_gold', 'torgo_black', 0.04),
    ], [
        PN(0.0, 0.14, 'fret', 'torgo_gold', 'torgo_black', 0.055),
        PN(0.86, 1.0, 'fret', 'torgo_gold', 'torgo_black', 0.055),
    ], fabric='cloth.velvet')
    parts_t.append(bio.torso_tube(gid_t + '_greatcoat', bio.ANKLE + 0.06, bio.TOP + 0.01, coat_p, ease=0.034, ease_bottom=0.052, flare=0.18, arc=(-math.pi * 0.70, math.pi * 0.70), rows=24, n=42, layer=2))
    # Architectural pleated black velvet shoulder caps + fitted gold-brocade sleeves with plush black rose-velvet cuffs
    slv_p = P('torgo_black', 0.03, [
        B('bottom', 0.0, 0.12, 'rosettes', 'soot', 'torgo_black', 0.05),
    ], [
        PN(0.0, 1.0, 'torgo_sleeve_bands', 'torgo_gold', 'torgo_black', 0.36),
    ], fabric='cloth.velvet')
    for side in ('Left', 'Right'):
        parts_t.append(bio.pauldron(f'{gid_t}_shcap_{side}', side, P('torgo_black', 0.04, [B('bottom', 0.0, 0.03, 'stripes', 'soot', 'torgo_black', 0.02)], fabric='cloth.velvet'), span=0.20, drop=0.14, lift=0.024))
        parts_t.append(bio.sleeve(f'{gid_t}_sleeve_{side}', side, slv_p, f0=0.0, f1=0.88, ease=0.016, flare=0.024, rows=14, n=24))
    e_t = assemble_garment(gid_t, 'Torgo Gold-Brocade Velvet Greatcoat & Lace Bodysuit', 'torso', 'rustic_clansmen', parts_t)
    e_t['type'] = 'pc'
    entries.append(e_t)

    # 3. LEGS: rustic_{m/f}_pc_torgo_tights
    gid_l = f'rustic_{sex_tag}_pc_torgo_tights'
    parts_l = bio.trousers(gid_l, lace_p, ankle_f=0.84, ease=0.008, bag=0.0, ease_end=0.008, rows=16, n=24)
    e_l = assemble_garment(gid_l, 'Torgo Floral-Filigree Black Lace Stockings', 'legs', 'rustic_clansmen', parts_l, legged=True)
    e_l['type'] = 'pc'
    entries.append(e_l)

    # 4. FEET: rustic_{m/f}_pc_torgo_heels
    gid_f = f'rustic_{sex_tag}_pc_torgo_heels'
    shoe_p = P('torgo_black', 0.02, [B('top', 0.0, 0.03, 'solid', 'torgo_gold')], fabric='leather.polished')
    parts_f = [bio.boot(f'{gid_f}_{s}', s, shoe_p, top_f=0.18, ease=0.016, rows=10, n=20, point=0.026) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Torgo Glossy Black & Gold Court Shoes', 'feet', 'rustic_clansmen', parts_f)
    e_f['type'] = 'pc'
    entries.append(e_f)

    return entries, {
        'head': gid_h,
        'torso': gid_t,
        'legs': gid_l,
        'feet': gid_f,
        'type': 'pc',
        'label': 'Free Clans Torgo Gold-Brocade Couture (PC)',
    }


# ==============================================================================
# OUTFIT 4: Abyssal (`abyssal`) — `pc_azure_emir` (Image 4)
# Tall coral-crimson cylindrical fez with gold rim & inverted gold triangle,
# sweeping turquoise-and-seafoam agbada/boubou over-mantle with coral-and-gold
# geometric chevron borders over a midnight-indigo kaftan with clustered gold
# sun-disc pectoral medallions & gold triple-stripe hem.
# ==============================================================================
def build_pc_azure_emir(body_id, sex_tag):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    # 1. HEAD: abyssal_{m/f}_pc_azure_fez
    gid_h = f'abyssal_{sex_tag}_pc_azure_fez'
    parts_h = []
    fez_p = P('abyss_fez', 0.03, [
        B('bottom', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.32, 0.44, 'triangles', 'gold', 'abyss_fez', 0.045),
    ], fabric='cloth.wool')
    parts_h.append(bio.tower_hat(gid_h + '_fez', 0.145, lambda s: 1.0 - 0.12 * s, fez_p, f=0.62, ease=0.014, rows=12, n=36))
    # Gold stud earring on right ear
    stud_pos = a + (b - a) * 0.30 - left * 0.095 - bk * 0.01
    parts_h.append(blob(gid_h + '_ear_stud', stud_pos, (0.014, 0.014, 0.014), P('gold', 0.01, fabric='metal.gold'), n=8, rows=4, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Abyssal Crimson & Gold Geometric Fez', 'head', 'abyssal', parts_h, covers_hair=True, covers_face=False)
    e_h['type'] = 'pc'
    entries.append(e_h)

    # 2. TORSO: abyssal_{m/f}_pc_azure_boubou
    gid_t = f'abyssal_{sex_tag}_pc_azure_boubou'
    parts_t = []
    # Unified manifold grand boubou & inner midnight-indigo kaftan (`u = 0.36..0.64` is the indigo kaftan front panel
    # with gold hem stripes; `u = 0.30..0.36` and `0.64..0.70` are the coral-and-gold chevron borders; sides and back
    # are the turquoise & seafoam-mint boubou silk — zero multi-layer robe clipping!)
    kaftan_p = P('abyss_indigo', 0.03, [
        B('bottom', 0.0, 0.06, 'stripes', 'gold', 'abyss_indigo', 0.025),
    ], fabric='cloth.silk')
    boubou_robe_p = P('abyss_turquoise', 0.03, [
        B('bottom', 0.0, 0.08, 'stripes', 'gold', 'abyss_indigo', 0.028),
        B('top', 0.0, 0.025, 'solid', 'gold'),
    ], [
        PN(0.0, 0.30, 'solid', 'abyss_mint', 'abyss_turquoise', 0.35),
        PN(0.70, 1.0, 'solid', 'abyss_mint', 'abyss_turquoise', 0.35),
        PN(0.30, 0.37, 'abyssal_chevron_border', 'abyss_coral', 'abyss_turquoise', 0.16),
        PN(0.63, 0.70, 'abyssal_chevron_border', 'abyss_coral', 'abyss_turquoise', 0.16),
        PN(0.37, 0.63, 'solid', 'abyss_indigo', 'abyss_indigo', 1.0),
    ], fabric='cloth.silk')
    boubou_robe = bio.torso_tube(
        gid_t + '_boubou_robe', bio.ANKLE + 0.06, bio.TOP + 0.005, boubou_robe_p,
        ease=0.022, flare=0.065, hang_from=bio.WAIST - 0.02,
        hull_from=bio.WAIST, rows=24, n=48
    )
    # Use rigid Hips + GPU radial hull (kcEO=1, like mindfront_kimono and order_m_listener_coat)
    # and hang from WAIST so the torso stays inside abs(x) < 0.22 above y = 0.88 (clearing the
    # forearm colliders and avoiding cloth-chain pinching when turning or walking).
    boubou_robe.cloth = None
    parts_t.append(boubou_robe)
    # 7 clustered golden sun-disc medallions on the upper chest
    for idx_m, (dx, dz, rad) in enumerate([
        (0.0, 0.045, 0.026), (-0.042, 0.055, 0.022), (0.042, 0.052, 0.022),
        (-0.024, 0.015, 0.020), (0.026, 0.018, 0.023), (0.0, -0.018, 0.019), (-0.048, 0.020, 0.018),
    ]):
        m_pos = bio.chest_front(bio.CHEST + dz, 0.032, x=dx)
        parts_t.append(rosette(f'{gid_t}_gold_disc_{idx_m}', m_pos, np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]), rad, P('gold', 0.015, fabric='metal.gold'), n=12, thick=0.010, rigid_joint='Spine2'))

    # Sleek, low draped turquoise shawl collar with coral-and-gold chevron trim + seamless shoulder yoke
    cowl_p = P('abyss_turquoise', 0.03, [B('bottom', 0.0, 0.03, 'zag', 'abyss_coral', 'gold', 0.04)], fabric='cloth.silk')
    parts_t.append(bio.collar(gid_t + '_shawl_collar', cowl_p, height=0.026, flare=0.008, ease=0.018, open_front=True, rows=5, n=32))
    parts_t.append(bio.collar_disc(gid_t + '_yoke', 0.115, cowl_p, drop=0.045, rows=5, n=40, scallop=0.0, ease=0.024, z_off=0.004))

    # Fitted turquoise & coral-chevron sleeves draping naturally along the arms
    boubou_slv_p = P('abyss_turquoise', 0.03, [
        B('bottom', 0.0, 0.06, 'solid', 'abyss_mint'),
    ], [
        PN(0.0, 0.22, 'abyssal_chevron_border', 'abyss_coral', 'abyss_turquoise', 0.16),
        PN(0.78, 1.0, 'abyssal_chevron_border', 'abyss_coral', 'abyss_turquoise', 0.16),
        PN(0.22, 0.78, 'solid', 'abyss_mint', 'abyss_turquoise', 0.40),
    ], fabric='cloth.silk')
    for side in ('Left', 'Right'):
        parts_t.append(bio.sleeve(f'{gid_t}_sleeve_{side}', side, boubou_slv_p, f0=0.0, f1=0.78, ease=0.016, flare=0.024, rows=12, n=22))
    e_t = assemble_garment(gid_t, 'Abyssal Turquoise & Gold-Medallion Grand Boubou', 'torso', 'abyssal', parts_t)
    e_t['type'] = 'pc'
    entries.append(e_t)

    # 3. LEGS: abyssal_{m/f}_pc_azure_pants
    gid_l = f'abyssal_{sex_tag}_pc_azure_pants'
    parts_l = bio.trousers(gid_l, kaftan_p, ankle_f=0.74, ease=0.010, bag=0.0, ease_end=0.010, rows=16, n=24)
    e_l = assemble_garment(gid_l, 'Abyssal Midnight-Indigo Silk Trousers', 'legs', 'abyssal', parts_l, legged=True)
    e_l['type'] = 'pc'
    entries.append(e_l)

    # 4. FEET: abyssal_{m/f}_pc_azure_boots
    gid_f = f'abyssal_{sex_tag}_pc_azure_boots'
    slip_p = P('abyss_indigo', 0.02, [B('top', 0.0, 0.03, 'solid', 'gold')], fabric='leather.polished')
    parts_f = [bio.boot(f'{gid_f}_{s}', s, slip_p, top_f=0.24, ease=0.020, rows=10, n=20, point=0.024) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Abyssal Indigo & Gold Ceremonial Slippers', 'feet', 'abyssal', parts_f)
    e_f['type'] = 'pc'
    entries.append(e_f)

    return entries, {
        'head': gid_h,
        'torso': gid_t,
        'legs': gid_l,
        'feet': gid_f,
        'type': 'pc',
        'label': 'Abyssal Azure-Boubou Emir (PC)',
    }


# ==============================================================================
# OUTFIT 5: Order of Historians (`order`) — `pc_relic_lancer` (Image 5)
# Steel dome helm with cream-and-crimson striped turban wrap, 4 tall golden
# lightning-rod spikes, crimson visor, and high steel gorget with glowing cyan
# vertical respirator grille & twin yellow breather tubes; grey steel cuirass
# with glowing cyan oval lenses, cream-and-crimson shoulder mantle with left
# shoulder spikes, split jagged-border coat-tails & blood-drop tabard, gauntlet
# knuckle nodes, articulated steel greaves, and spiked sabatons.
# ==============================================================================
def build_pc_relic_lancer(body_id, sex_tag):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    # 1. HEAD: order_{m/f}_pc_lancer_helm
    gid_h = f'order_{sex_tag}_pc_lancer_helm'
    parts_h = []
    # Crimson upper-face visor + steel cranial dome
    visor_p = P('lancer_red', 0.03, [B('top', 0.0, 0.03, 'solid', 'lancer_steel')], fabric='leather.matte')
    parts_h.append(bio.sculpted_faceplate(gid_h + '_visor', visor_p, f_top=0.76, f_bot=0.22, ease=0.012, jaw_narrow=0.25))
    steel_p = P('lancer_steel', 0.03, [B('bottom', 0.0, 0.03, 'solid', 'soot')], fabric='metal.iron')
    parts_h.append(bio.sculpted_cranium(gid_h + '_dome', steel_p, f_top=1.04, f_bot=0.14, ease=0.010))
    # Cream-and-crimson striped turban band with red rivets around the brow
    turban_p = P('lancer_cream', 0.03, [
        B('top', 0.0, 0.025, 'solid', 'lancer_red'),
        B('bottom', 0.0, 0.025, 'solid', 'lancer_red'),
    ], [
        PN(0.0, 1.0, 'stripes', 'lancer_red', 'lancer_cream', 0.035),
    ], fabric='cloth.canvas')
    parts_h.append(bio.crown_band(gid_h + '_turban', 0.56, 0.92, turban_p, bulge=0.024, ease=0.018, rows=8, n=34))
    # High steel gorget-bevor covering the lower face & neck with central cyan-and-gold slatted respirator grille
    gorget_p = P('lancer_steel', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'lancer_cream'),
        B('bottom', 0.0, 0.02, 'solid', 'soot'),
    ], [
        PN(0.44, 0.56, 'stripes', 'lancer_cyan', 'gold', 0.018),
    ], fabric='metal.iron')
    parts_h.append(bio.hood(gid_h + '_gorget', gorget_p, ease=0.026, ease_low=0.044, open_front=0.0, low=-0.42, rows=10, n=32, peak=0.0))
    # Twin curved yellow ribbed breather tubes from cheeks to gorget + 4 tall golden crown lightning-rod spikes
    tube_p = P('lancer_cream', 0.02, [B('top', 0.0, 0.04, 'stripes', 'soot', 'lancer_cream', 0.015)], fabric='metal.gold')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        t_pts = [
            a + (b - a) * (0.48 - 0.36 * t) + left * (sgn * (0.095 + 0.032 * math.sin(math.pi * t))) - bk * (0.045 + 0.045 * t)
            for t in np.linspace(0, 1, 6)
        ]
        parts_h.append(horn(f'{gid_h}_tube_{tag}', t_pts, 0.018, 0.014, tube_p, n=8, rows=6, rigid_joint='Head'))
    for idx_s, (sx, sy) in enumerate([(-0.038, -0.02), (0.038, -0.02), (-0.025, 0.03), (0.025, 0.03)]):
        sp_base = a + (b - a) * 0.96 + left * sx + bk * sy
        sp_pts = [sp_base + up * (0.115 * t) + left * (sx * 0.25 * t) for t in np.linspace(0, 1, 5)]
        parts_h.append(horn(f'{gid_h}_spike_{idx_s}', sp_pts, 0.009, 0.0015, P('gold', 0.01, fabric='metal.gold'), n=6, rows=5, rigid_joint='Head'))
    e_h = assemble_garment(gid_h, 'Order Relic-Lancer Respirator Helm & Spikes', 'head', 'historians', parts_h, covers_hair=True, covers_face=True)
    e_h['type'] = 'pc'
    entries.append(e_h)

    # 2. TORSO: order_{m/f}_pc_lancer_armor
    gid_t = f'order_{sex_tag}_pc_lancer_armor'
    parts_t = []
    # Grey steel plate cuirass + 2 glowing cyan oval chest lenses
    cuirass_p = P('lancer_steel', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'soot'),
        B('top', 0.0, 0.03, 'solid', 'soot'),
    ], fabric='metal.iron')
    parts_t.append(bio.torso_tube(gid_t + '_cuirass', bio.WAIST - 0.02, bio.TOP + 0.01, cuirass_p, ease=0.026, flare=0.015, rows=14, n=38))
    cyan_lens_p = P('lancer_cyan', 0.01, [B('top', 0.0, 0.015, 'solid', 'lancer_steel')], fabric='beads.glass')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        l_pos = bio.chest_front(bio.CHEST + 0.01, 0.036, x=sgn * 0.078)
        parts_t.append(rosette(f'{gid_t}_chest_lens_{tag}', l_pos, np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]), 0.028, cyan_lens_p, n=12, thick=0.012, rigid_joint='Spine2'))

    # Draped cream-and-crimson striped shoulder mantle (`collar_disc` + `pauldron`) + 2 tall golden spikes on the left shoulder
    mantle_p = P('lancer_cream', 0.03, [
        B('bottom', 0.0, 0.035, 'dentils', 'lancer_red', 'lancer_cream', 0.03),
    ], [
        PN(0.0, 1.0, 'stripes', 'lancer_red', 'lancer_cream', 0.075),
    ], fabric='cloth.wool')
    parts_t.append(bio.collar_disc(gid_t + '_mantle', 0.16, mantle_p, drop=0.11, rows=7, n=40, scallop=0.08, ease=0.034, z_off=0.008))
    for side in ('Left', 'Right'):
        parts_t.append(bio.pauldron(f'{gid_t}_pauldron_{side}', side, mantle_p, span=0.22, drop=0.16, lift=0.024))
    for idx_sp, dx in enumerate((0.145, 0.185)):
        sh_base = J('LeftShoulder') + left * (dx - 0.06) + up * 0.045
        sh_pts = [sh_base + up * (0.14 * t) + left * (0.02 * t) for t in np.linspace(0, 1, 5)]
        parts_t.append(horn(f'{gid_t}_sh_spike_{idx_sp}', sh_pts, 0.011, 0.002, P('gold', 0.01, fabric='metal.gold'), n=6, rows=5, rigid_joint='LeftShoulder'))

    # Pleated orange waist sash + articulated grey steel waist belt with central glowing cyan lens & hip tassets
    parts_t.append(bio.band(gid_t + '_orange_sash', bio.WAIST - 0.01, bio.WAIST + 0.05, P('lancer_orange', 0.04, fabric='cloth.cotton'), ease=0.032))
    parts_t.append(bio.band(gid_t + '_steel_belt', bio.WAIST - 0.06, bio.WAIST + 0.005, cuirass_p, ease=0.038))
    belt_lens = bio.chest_front(bio.WAIST - 0.028, 0.046)
    parts_t.append(rosette(gid_t + '_belt_lens', belt_lens, np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]), 0.030, cyan_lens_p, n=12, thick=0.014, rigid_joint='Hips'))

    # Split floor-length cream-and-crimson jagged-border coat-tails + central pointed blood-drop tabard
    tail_p = P('lancer_cream', 0.03, [
        B('bottom', 0.0, 0.05, 'solid', 'lancer_red'),
    ], [
        PN(0.0, 1.0, 'lancer_jagged_border', 'lancer_red', 'lancer_cream', 0.42),
    ], fabric='cloth.canvas')
    parts_t.append(bio.torso_tube(gid_t + '_coattails', bio.ANKLE + 0.08, bio.WAIST - 0.02, tail_p, ease=0.034, ease_bottom=0.048, flare=0.14, arc=(-math.pi * 0.68, math.pi * 0.68), rows=18, n=38, layer=2))
    parts_t.append(bio.tabard(gid_t + '_tabard', bio.WAIST - 0.02, bio.KNEE + 0.04, 0.16, tail_p, ease=0.036, back_len=False, point=0.10))

    # Terracotta-orange padded sleeves with cream-and-red striped cuffs
    slv_p = P('lancer_orange', 0.04, [
        B('bottom', 0.0, 0.06, 'stripes', 'lancer_red', 'lancer_cream', 0.03),
    ], fabric='cloth.cotton')
    for side in ('Left', 'Right'):
        parts_t.append(bio.sleeve(f'{gid_t}_sleeve_{side}', side, slv_p, f0=0.0, f1=0.62, ease=0.016, flare=0.010, rows=10, n=22))
    e_t = assemble_garment(gid_t, 'Order Relic-Lancer Cuirass, Mantle & Jagged Coat-Tails', 'torso', 'historians', parts_t)
    e_t['type'] = 'pc'
    entries.append(e_t)

    # 3. GLOVES: order_{m/f}_pc_lancer_gloves
    gid_g = f'order_{sex_tag}_pc_lancer_gloves'
    gaunt_p = P('leather', 0.04, [
        B('top', 0.0, 0.04, 'solid', 'lancer_cream'),
        B('bottom', 0.0, 0.03, 'solid', 'gold'),
    ], [
        PN(0.35, 0.65, 'rosettes', 'lancer_cyan', 'leather', 0.045),
    ], fabric='leather.polished')
    parts_g = [bio.sleeve(f'{gid_g}_{s}', s, gaunt_p, f0=0.62, f1=1.0, ease=0.016, flare=0.014, rows=8, n=20) for s in ('Left', 'Right')]
    e_g = assemble_garment(gid_g, 'Order Relic-Lancer Cyan-Node Gauntlets', 'gloves', 'historians', parts_g)
    e_g['type'] = 'pc'
    entries.append(e_g)

    # 4. LEGS: order_{m/f}_pc_lancer_greaves
    gid_l = f'order_{sex_tag}_pc_lancer_greaves'
    greave_p = P('lancer_steel', 0.03, [
        B('top', 0.0, 0.08, 'stripes', 'lancer_orange', 'lancer_steel', 0.04),
        B('bottom', 0.0, 0.04, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'lorica_lames', 'soot', 'lancer_steel', 0.08),
    ], fabric='metal.iron')
    parts_l = bio.trousers(gid_l, greave_p, ankle_f=0.72, ease=0.014, bag=0.006, ease_end=0.012, rows=16, n=26)
    e_l = assemble_garment(gid_l, 'Order Relic-Lancer Articulated Steel Greaves', 'legs', 'historians', parts_l, legged=True)
    e_l['type'] = 'pc'
    entries.append(e_l)

    # 5. FEET: order_{m/f}_pc_lancer_boots
    gid_f = f'order_{sex_tag}_pc_lancer_boots'
    boot_p = P('leather', 0.03, [
        B('top', 0.0, 0.06, 'stripes', 'lancer_steel', 'soot', 0.025),
        B('bottom', 0.0, 0.04, 'solid', 'soot'),
    ], [
        PN(0.15, 0.35, 'rosettes', 'lancer_cyan', 'soot', 0.04),
    ], fabric='leather.polished')
    parts_f = [bio.boot(f'{gid_f}_{s}', s, boot_p, top_f=0.30, ease=0.022, rows=12, n=22, point=0.032) for s in ('Left', 'Right')]
    e_f = assemble_garment(gid_f, 'Order Relic-Lancer Spiked Sabatons', 'feet', 'historians', parts_f)
    e_f['type'] = 'pc'
    entries.append(e_f)

    return entries, {
        'head': gid_h,
        'torso': gid_t,
        'gloves': gid_g,
        'legs': gid_l,
        'feet': gid_f,
        'hair': None,
        'beard': None,
        'type': 'pc',
        'label': 'Order of Historians Relic-Lancer (PC)',
    }


OUTFIT_SPECS = [
    ('pc_floral_envoy', 'Xanadu Peony-Brocade Envoy (PC)', 'xanadu', build_pc_floral_envoy),
    ('pc_patchwork_sheriff', 'Iron Republic Patchwork Sheriff (PC)', 'iron_republic', build_pc_patchwork_sheriff),
    ('pc_torgo_couture', 'Free Clans Torgo Gold-Brocade Couture (PC)', 'rustic_clansmen', build_pc_torgo_couture),
    ('pc_azure_emir', 'Abyssal Azure-Boubou Emir (PC)', 'abyssal', build_pc_azure_emir),
    ('pc_relic_lancer', 'Order of Historians Relic-Lancer (PC)', 'historians', build_pc_relic_lancer),
]


def main():
    t0 = time.perf_counter()
    male_entries = []
    female_entries = []
    social_types = []

    for tid, label, culture, builder_fn in OUTFIT_SPECS:
        m_ents, m_outfit = builder_fn('mpfb_male', 'm')
        f_ents, f_outfit = builder_fn('mpfb_female', 'f')
        for e in m_ents:
            ec = dict(e)
            ec.pop('_body', None)
            male_entries.append(ec)
        for e in f_ents:
            ec = dict(e)
            ec.pop('_body', None)
            female_entries.append(ec)
        social_types.append({
            'id': tid,
            'name': label,
            'culture': culture,
            'type': 'pc',
            'weight': 0.04,
            'outfit': {
                'male': m_outfit,
                'female': f_outfit,
            },
        })

    manifest = {
        'kit_entries': [dict(e, _body='mpfb_male') for e in male_entries] + [dict(e, _body='mpfb_female') for e in female_entries],
        'male_entries': male_entries,
        'female_entries': female_entries,
        'social_types': social_types,
    }
    out_path = SCRATCH / 'pc_outfits_manifest.json'
    out_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    print(f'Built {len(male_entries)} male + {len(female_entries)} female PC pieces across {len(OUTFIT_SPECS)} outfits in {dt:.2f}s -> {out_path}')


if __name__ == '__main__':
    main()
