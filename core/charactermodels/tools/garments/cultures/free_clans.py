"""The Free Clans of Ardent (`rustic_clansmen`) Complete 10-Tier Procedural Wardrobe Kit.

Norse-Gaelic / Swiss-Alpine / Early-Modern Highland Free-Clan synthesis (`Ardent`, `Upper Cut`,
`Nine Clans`, stave-halls & high-tin bell/cannon bronze foundries).

Compiles 108 procedural garments (`ard_m_*` & `ard_f_*`) across `mpfb_male` and `mpfb_female`
for all 9 Free-Clan societal, foundry, warden, mercenary, skald, moot & chieftain tiers
(6 slots each: `head`, `torso`, `back`, `gloves`, `legs`, `feet`) while preserving existing
`pc_torgo_couture` (`rustic_{m,f}_pc_torgo_*`) = Full 10-Tier Roster at 100% M+F parity!

Run standalone in manifest-only mode (does NOT edit shared kit.json or peoples.json):
    python -u tools/garments/cultures/free_clans.py
"""
from contextlib import contextmanager
import json
import math
import os
os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
import struct
import sys
import time
from pathlib import Path
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

import glbio
from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment,
)
from garments.paint import P, B, PN, C, leathery, sample_cultural_tex
from garments.types.torso import (
    torso_tube, stand_collar, collar_disc, tabard, crossed_sash, pauldron,
)
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import sleeves, trousers, full_gloves
from garments.types.footwear import boots
from garments.types.headgear import (
    head_landmarks_exact, brim, tower_hat, crown_band, crest, horn,
)
from garments.types.accoutrements import (
    blob, belt_sash, pouch_belt, sash_with_tail, tube, rosette,
)


# ===========================================================================================================
# 1. CANONICAL FREE CLANS OF ARDENT PALETTE (`ard_*` linear RGB) & CUSTOM MOTIFS
# ===========================================================================================================
ARD_COLORS = {
    'ard_heather':    (0.360, 0.255, 0.310),  # Wild Highland heather wool
    'ard_oatmeal':    (0.720, 0.665, 0.555),  # Undyed homespun sheep's wool
    'ard_firtartan':  (0.065, 0.165, 0.105),  # Deep Ardent fir-pine green
    'ard_madder':     (0.480, 0.105, 0.085),  # Highland madder-berry crimson
    'ard_woad':       (0.095, 0.155, 0.310),  # Stave-hall woad-indigo dye
    'ard_saffron':    (0.780, 0.540, 0.140),  # Bog-myrtle / Highland saffron-ochre
    'ard_peat':       (0.145, 0.102, 0.072),  # Smoked peat-brown wool & leather
    'ard_soothide':   (0.075, 0.058, 0.048),  # Soot-darkened bell-founder hide
    'ard_bellbronze': (0.640, 0.430, 0.185),  # Cast Ardent Cu+Sn bell & cannon bronze
    'ard_giltbronze': (0.830, 0.620, 0.215),  # Gilded Nine-Clan chieftain bronze
    'ard_bogiron':    (0.235, 0.248, 0.265),  # Forged Highland bog-iron helm/splint steel
    'ard_antler':     (0.865, 0.825, 0.735),  # Carved Highland stag-antler ivory
    'ard_pinewood':   (0.420, 0.275, 0.145),  # Resinous alpine larch/pinewood
}

ARD_CUSTOM_MOTIFS = {
    'ard_clan_tartan',
    'ard_royal_tartan',
    'ard_norse_interlace',
    'ard_bronze_scale',
    'ard_brigandine_studs',
    'ard_oath_stave',
}


def _ard_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base_style = style.split(':')[0]
    H = max(int(h), 1)
    W = max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if base_style in ('ard_clan_tartan', 'ard_royal_tartan'):
        # Authentic Highland 2/2 twill tartan sett with warp/weft crossings & overcheck lines
        nx = max(3.0, round(5.5 * max(aspect, 0.5)))
        ny = max(3.0, round(5.5 / max(aspect, 0.5)))
        gu = (u * nx) % 1.0
        gv = (v * ny) % 1.0
        twill = (((xx + yy) % 4) < 2).astype(np.float64)
        warp_broad = (gu > 0.18) & (gu < 0.52)
        weft_broad = (gv > 0.18) & (gv < 0.52)
        warp_mad = (gu > 0.68) & (gu < 0.84)
        weft_mad = (gv > 0.68) & (gv < 0.84)
        over_u = np.abs(gu - 0.35) < 0.032
        over_v = np.abs(gv - 0.35) < 0.032
        fg_a = np.asarray(fg)
        bg_a = np.asarray(bg)
        mad_a = np.asarray(C['ard_madder'])
        saf_a = np.asarray(C['ard_giltbronze'] if base_style == 'ard_royal_tartan' else C['ard_saffron'])
        c_warp = np.where(warp_mad[..., None], mad_a, np.where(warp_broad[..., None], fg_a, bg_a))
        c_weft = np.where(weft_mad[..., None], mad_a, np.where(weft_broad[..., None], fg_a, bg_a))
        img = c_warp * twill[..., None] + c_weft * (1.0 - twill[..., None])
        img[over_u | over_v] = saf_a
        tex = sample_cultural_tex('tex.freeclans_falu_check', W, H, fg, bg, pal_blend=0.30)
        img = 0.56 * img + 0.44 * tex

    elif base_style == 'ard_norse_interlace':
        # Norse-Gaelic Urnes/Borre braided ribbon knotwork & penannular ring chain
        nx = max(3.0, round(6.0 * max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        rail = (np.abs(gv) > 0.78) & (np.abs(gv) < 0.92)
        wave1 = np.abs(gv - 0.46 * np.sin(math.pi * gu)) < 0.15
        wave2 = np.abs(gv + 0.46 * np.sin(math.pi * gu)) < 0.15
        ring = (np.hypot(gu * 0.95, gv) > 0.38) & (np.hypot(gu * 0.95, gv) < 0.54)
        boss = np.hypot(gu, gv) < 0.16
        img[rail | wave1 | wave2 | ring] = fg
        img[boss] = C['ard_giltbronze']

    elif base_style == 'ard_bronze_scale':
        # Overlapping riveted Ardent bronze scales & bog-iron mail rings
        nx = max(6.0, round(12.0 * max(aspect, 0.5)))
        ny = max(5.0, round(10.0 / max(aspect, 0.5)))
        row_i = np.floor(v * ny).astype(int)
        gu = ((u * nx + 0.5 * (row_i % 2)) % 1.0 - 0.5) * 2.0
        gv = (v * ny) % 1.0
        arc = np.hypot(gu * 0.92, (gv - 0.35) * 1.25)
        rim = (arc > 0.68) & (arc < 0.86) & (gv > 0.25)
        rivet = np.hypot(gu, (gv - 0.22) * 1.4) < 0.16
        shade = 0.76 + 0.28 * (1.0 - np.abs(gu))
        img[:] = np.asarray(bg)[None, None, :] * shade[:, :, None]
        img[rim] = np.asarray(bg) * 0.48
        img[rivet] = fg
        tex = sample_cultural_tex('tex.lamellar_bronze', W, H, fg, bg, pal_blend=0.32)
        img = 0.56 * img + 0.44 * tex

    elif base_style == 'ard_brigandine_studs':
        # Oiled Highland leather/canvas jack studded with trefoil clusters of bronze rivets
        nx = max(4.0, round(8.0 * max(aspect, 0.5)))
        ny = max(4.0, round(8.0 / max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = ((v * ny) % 1.0 - 0.5) * 2.0
        seam = (np.abs(gu) > 0.88) | (np.abs(gv) > 0.88)
        r1 = np.hypot(gu, gv + 0.22) < 0.15
        r2 = np.hypot(gu - 0.20, gv - 0.14) < 0.15
        r3 = np.hypot(gu + 0.20, gv - 0.14) < 0.15
        img[seam] = np.asarray(bg) * 0.62
        img[r1 | r2 | r3] = fg

    elif base_style == 'ard_oath_stave':
        # Clanthing carved rune-stave tallies & concentric bronze oath-rings
        nx = max(4.0, round(9.0 * max(aspect, 0.5)))
        cell_i = np.floor(u * nx).astype(int)
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        rails = (np.abs(gv) > 0.78) & (np.abs(gv) < 0.90)
        is_ring = (cell_i % 3) == 0
        oath_r = (np.hypot(gu, gv) > 0.36) & (np.hypot(gu, gv) < 0.56)
        stave = (np.abs(gu) < 0.12) & (np.abs(gv) < 0.68)
        twig1 = (np.abs((gv - 0.18) - 0.75 * gu) < 0.10) & (gu > 0.0) & (gu < 0.48)
        twig2 = (np.abs((gv + 0.22) + 0.75 * gu) < 0.10) & (gu < 0.0) & (gu > -0.48)
        pat = np.where(is_ring, oath_r, stave | twig1 | twig2)
        img[rails | pat] = fg

    return np.clip(img, 0.0, 1.0)


@contextmanager
def free_clans_motif_scope():
    orig_motif = paint_mod.motif
    added_colors = []
    for k, v in ARD_COLORS.items():
        if k not in C:
            C[k] = v
            added_colors.append(k)
    paint_mod.FABRIC.setdefault('metal.steel.hammered', 0.25)

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in ARD_CUSTOM_MOTIFS:
            return _ard_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif
        for k in added_colors:
            C.pop(k, None)


def _ard_assemble(gid, label, slot, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    return assemble_garment(
        gid, label, slot, 'rustic_clansmen', parts,
        covers_hair=covers_hair, covers_face=covers_face,
        open_torso=open_torso, legged=legged,
    )


# ===========================================================================================================
# 2. SHARED HIGHLAND / NORSE-GAELIC GEOMETRY HELPERS
# ===========================================================================================================
def _anchor_on_part(host_part, target_pt):
    P_flat = host_part.P.reshape(-1, 3)
    tgt = np.asarray(target_pt, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(P_flat - tgt[None, :], axis=1)))
    p = P_flat[idx].copy()
    c = spine_at(p[2]) if p[2] < core.NECK[2] + 0.015 else core.HEAD
    nrm = p - np.array([c[0], c[1], p[2]], dtype=np.float64)
    L_n = float(np.linalg.norm(nrm))
    nrm = (nrm / L_n) if L_n > 1e-6 else np.array([0.0, -1.0, 0.0], dtype=np.float64)
    return p, nrm


def _open_cranial_shell(name, paint, f_top=1.14, f_bot=0.02, f_brow_min=0.62, ease=0.018, rows=12, n=36):
    """Open-face helmet/bonnet shell descending at occiput while arching cleanly above `f_brow_min >= 0.60` in front.

    Uses equator-sampled dome taper + high-latitude skull clamping (`f_top >= 1.13, ease >= 0.018`) to guarantee
    zero double-taper skull poke-through on both male and female crania.
    """
    a, b, up, bk, left = head_frame()
    H = float(np.linalg.norm(b - a))
    f_top_use = max(float(f_top), 1.13)
    ease_use = max(float(ease), 0.018)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    ds = [bk * math.cos(an) + left * math.sin(an) for an in angs]
    f_brow = max(float(f_brow_min), 0.60)
    f_rim = np.full(n, float(f_bot), dtype=np.float64)
    if f_bot < f_brow:
        half_span = 0.56 * math.pi
        for j, an in enumerate(angs):
            ang_front = abs(an - math.pi)
            if ang_front < half_span:
                w = 0.5 + 0.5 * math.cos(math.pi * ang_front / half_span)
                f_rim[j] = float(f_bot) + (f_brow - float(f_bot)) * (w ** 0.82)
    c_eq = a + (b - a) * 0.56
    r_eq = np.zeros(n, dtype=np.float64)
    for j, d in enumerate(ds):
        h_eq = first_hit(c_eq, d)
        r_eq[j] = (float(h_eq) if (h_eq is not None and 0.045 < h_eq < 0.145) else 0.096) + ease_use
    Q = np.zeros((rows, n, 3), dtype=np.float64)
    for i in range(rows):
        u = i / float(max(rows - 1, 1))
        for j, (an, d) in enumerate(zip(angs, ds)):
            f_ij = f_top_use + (float(f_rim[j]) - f_top_use) * u
            c_ij = a + (b - a) * f_ij
            if f_ij <= 0.72:
                c_ray = a + (b - a) * max(f_ij, 0.15)
                h_hit = first_hit(c_ray, d)
                r_ij = (float(h_hit) if (h_hit is not None and 0.045 < h_hit < 0.145) else (r_eq[j] - ease_use)) + ease_use
            else:
                u_top = min(1.0, (f_ij - 0.72) / max(0.08, f_top_use - 0.72))
                r_ij = r_eq[j] * max(0.04, math.sqrt(max(0.0, 1.0 - u_top ** 1.85)))
                if f_ij <= 0.96:
                    h_hit = first_hit(c_ij, d)
                    if h_hit is not None and 0.020 < h_hit < 0.145:
                        r_ij = max(r_ij, float(h_hit) + ease_use)
            Q[i, j] = c_ij + d * r_ij
    apex = b + up * max(0.028, (f_top_use - 1.0) * H + ease_use * 0.6)
    Q[0] = apex + (Q[0] - apex) * 0.04
    return Part(name, Q, True, ['body'] * rows, paint, rigid_joint='Head')


def _penannular_brooch(gid, host_part, target_pt, paint, radius=0.038):
    """Giant Norse-Gaelic penannular ring brooch + diagonal pin anchored flush onto `host_part`."""
    p_s, n_s = _anchor_on_part(host_part, target_pt)
    side_v = np.cross(np.array([0.0, 0.0, 1.0]), n_s)
    side_v /= max(float(np.linalg.norm(side_v)), 1e-6)
    ring_pt = rosette(gid + '_brooch_ring', p_s + n_s * 0.004, n_s, side_v, radius, paint, n=16, thick=0.012, rigid_joint='Spine2')
    pin_pt = tube(gid + '_brooch_pin', [
        p_s + n_s * 0.010 - side_v * (radius * 0.85) + np.array([0.0, 0.0, radius * 0.75]),
        p_s + n_s * 0.010 + side_v * (radius * 0.95) - np.array([0.0, 0.0, radius * 0.85]),
    ], 0.0045, paint, n=8, rigid_joint='Spine2')
    return [ring_pt, pin_pt]


def _dorsal_pad(gid, pad_paint, z_mid=None, pad_size=(0.18, 0.044, 0.22), clearance=0.022):
    """Flush Spine2-weighted dorsal mounting pad seated against the back (zero loose front shoulder straps)."""
    z_c = z_mid if z_mid is not None else (0.55 * core.CHEST + 0.45 * core.SHOULDER - 0.02)
    c_sp = spine_at(z_c)
    bk_dir = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    anc = surface_out(c_sp, bk_dir, clearance, bvh=core.BVH_T)
    return blob(gid + '_dorsal_pad', anc, pad_size, pad_paint, n=14, rows=6, out=bk_dir, rigid_joint='Spine2')


def _dorsal_pack_base(gid, box_size, box_paint, strap_paint):
    z_mid = 0.55 * core.CHEST + 0.45 * core.SHOULDER - 0.02
    c_sp = spine_at(z_mid)
    bk_dir = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    h_back = first_hit(c_sp, bk_dir, bvh=core.BVH_T)
    back_r = (float(h_back) if h_back is not None else 0.11) + 0.024 + box_size[1] * 0.26
    pack_ctr = c_sp + bk_dir * back_r
    box = blob(gid + '_body', pack_ctr, box_size, box_paint, n=16, rows=7, out=bk_dir, rigid_joint='Spine2')
    pad = _dorsal_pad(gid, strap_paint, z_mid=z_mid, clearance=0.022)
    return box, pack_ctr, bk_dir, pad


# ===========================================================================================================
# 3. FULL 9 PROCEDURAL TIER BUILDERS (`ard_{m,f}_*`, 6 SLOTS EACH)
# ===========================================================================================================
def _build_for_body(sex, body_id):
    set_body(body_id)
    s = sex
    entries = []

    p_peat_lth = leathery(P('ard_peat', 0.06, fabric='leather.cuir_bouilli'))
    p_soot_lth = leathery(P('ard_soothide', 0.06, fabric='leather.foundry.pigskin'))
    p_buff_lth = leathery(P('buck', 0.05, fabric='leather.buckskin'))
    p_bronze = P('ard_bellbronze', 0.03, fabric='metal.bronze')
    p_gilt = P('ard_giltbronze', 0.02, fabric='metal.gold')
    p_iron = P('ard_bogiron', 0.04, fabric='metal.steel.hammered')

    p_tartan_fir = P('ard_firtartan', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'ard_madder')],
                     [PN(0.0, 1.0, 'ard_clan_tartan', 'ard_heather', 'ard_firtartan', 0.18)], fabric='cloth.wool')
    p_tartan_mad = P('ard_madder', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'ard_saffron')],
                     [PN(0.0, 1.0, 'ard_clan_tartan', 'ard_firtartan', 'ard_madder', 0.18)], fabric='cloth.wool')
    p_tartan_roy = P('ard_madder', 0.05, [B('bottom', 0.0, 0.025, 'ard_norse_interlace', 'ard_giltbronze', 'ard_woad', 0.08)],
                     [PN(0.0, 1.0, 'ard_royal_tartan', 'ard_woad', 'ard_madder', 0.18)], fabric='cloth.wool.fulled')

    # =======================================================================================================
    # TIER 1: `ardent_crofter` — Highland Oat-Farmer & Sheep-Crofter
    # =======================================================================================================
    gid = f'ard_{s}_crofter_bonnet'
    # Highland knitted tam o' shanter wool bonnet with checked band & bronze clan badge
    bn_band = crown_band(gid + '_band', P('ard_firtartan', 0.06, [], [PN(0.0, 1.0, 'ard_clan_tartan', 'ard_madder', 'ard_firtartan', 0.08)]),
                         f0=0.60, f1=0.70, ease=0.012, flare=0.004, rows=4, n=36)
    bn_tam = tower_hat(gid + '_tam', 0.085, lambda t: 1.0 + 0.30 * math.sin(math.pi * min(1.0, t * 1.15)),
                       P('ard_heather', 0.08, [B('bottom', 0.0, 0.02, 'solid', 'ard_madder')], fabric='cloth.gansey.sea_knit'),
                       f=0.68, ease=0.015, rows=8, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    p_bp, _ = _anchor_on_part(bn_band, a_h + (b_h - a_h) * 0.65 - bk_h * 0.09 + left_h * 0.05)
    bn_pin = rosette(gid + '_clan_pin', p_bp - bk_h * 0.003, -bk_h, left_h, 0.018, p_bronze, n=12, thick=0.008, rigid_joint='Head')
    entries.append(_irp_or_ard := _ard_assemble(gid, 'Knitted Highland Tam-o-Shanter Wool Bonnet', 'head',
                                                [bn_band, bn_tam, bn_pin], covers_hair=True))

    gid = f'ard_{s}_crofter_tunic'
    p_homespun = P('ard_oatmeal', 0.07, [
        B('top', 0.0, 0.026, 'solid', 'ard_heather'),
        B('bottom', 0.0, 0.032, 'ard_norse_interlace', 'ard_madder', 'ard_heather', 0.08),
    ], fabric='cloth.wool')
    cr_body = torso_tube(gid, core.TOP, core.CROTCH - 0.10, 0.032, p_homespun,
                         hang_from=core.WAIST - 0.02, flare=0.12, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    cr_plaid = crossed_sash(gid + '_plaid_wrap', p_tartan_fir, width=0.078, ease=0.036)
    cr_belt = pouch_belt(gid, p_peat_lth, P('hide', 0.06, fabric='leather.buckskin'), ease=0.040)
    cr_brooch = _penannular_brooch(gid, cr_plaid, chest_front(core.SHOULDER - 0.03, 0.038, x=-0.075), p_bronze, radius=0.030)
    entries.append(_ard_assemble(
        gid, 'Homespun Wool Tunic & Belted Highland Plaid Wrap', 'torso',
        [cr_body, stand_collar(gid, P('ard_heather', 0.07), high=0.028), cr_plaid, cr_belt, cr_brooch,
         sleeves(gid, 'wrist', 0.019, p_homespun, ease_end=0.025, rows=9)],
    ))

    gid = f'ard_{s}_crofter_creel'
    cr_bsk, cr_ctr, bk_d, cr_straps = _dorsal_pack_base(
        gid, (0.25, 0.15, 0.28),
        P('ard_pinewood', 0.08, [B('top', 0.0, 0.03, 'solid', 'ard_peat')], fabric='straw.reed.plaited'),
        p_peat_lth,
    )
    fleece_top = blob(gid + '_fleece_bundle', cr_ctr + np.array([0.0, 0.0, 0.145]), (0.21, 0.12, 0.10),
                      P('ard_oatmeal', 0.10, fabric='fur.caribou'), n=14, rows=6, out=bk_d, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Woven Willow Peat-and-Fleece Creel', 'back', [cr_bsk, fleece_top, cr_straps]))

    entries.append(_ard_assemble(
        f'ard_{s}_crofter_wraps', 'Knitted Heather-Wool Wrist & Hand Wraps', 'gloves',
        full_gloves(f'ard_{s}_crofter_wraps',
                    P('ard_heather', 0.08, [B('top', 0.0, 0.015, 'solid', 'ard_oatmeal')], fabric='cloth.gansey.sea_knit'),
                    P('ard_oatmeal', 0.07, fabric='cloth.wool'), f0=0.60, ease=0.014),
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_crofter_trews', 'Homespun Fir-and-Heather Tartan Trews', 'legs',
        trousers(f'ard_{s}_crofter_trews', p_tartan_fir, ease=0.014, ease_end=0.015, ankle_f=0.82, bag=0.008),
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_crofter_brogues', 'Laced Highland Hide Cuaran Brogues', 'feet',
        boots(f'ard_{s}_crofter_brogues', p_peat_lth, P('hide', 0.06, fabric='leather.buckskin'),
              top=0.44, wraps=2, wrap_paint=p_peat_lth, ease_top=0.024),
    ))

    # =======================================================================================================
    # TIER 2: `clan_bronzesmith` — Ardent Bell & Cannon Founder
    # =======================================================================================================
    gid = f'ard_{s}_smith_skullcap'
    sm_cap = _open_cranial_shell(gid, P('ard_soothide', 0.06, [B('bottom', 0.0, 0.018, 'solid', 'ard_bellbronze')], fabric='leather.cuir_bouilli'),
                                 f_top=1.14, f_bot=0.22, f_brow_min=0.62, ease=0.018, rows=10, n=36)
    entries.append(_ard_assemble(gid, 'Soot-Leather Bell-Founder Skullcap', 'head', [sm_cap], covers_hair=True))

    gid = f'ard_{s}_smith_apron'
    p_linen = P('linen', 0.06, [B('top', 0.0, 0.022, 'solid', 'ard_madder')], fabric='cloth.plain')
    sm_shirt = torso_tube(gid + '_shirt', core.TOP, core.CROTCH - 0.08, 0.024, p_linen,
                          hang_from=core.WAIST - 0.02, flare=0.10, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    sm_apron = torso_tube(gid + '_apron', core.CHEST + 0.04, core.KNEE + 0.04, 0.032,
                          P('ard_soothide', 0.07, [B('top', 0.0, 0.020, 'solid', 'ard_bellbronze'), B('bottom', 0.0, 0.025, 'solid', 'ard_peat')],
                            fabric='leather.foundry.pigskin'),
                          hang_from=core.WAIST - 0.02, flare=0.13, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    sm_strap = crossed_sash(gid + '_strap', p_peat_lth, width=0.040, ease=0.036)
    sm_belt = pouch_belt(gid, p_soot_lth, p_peat_lth, ease=0.039)
    sm_brooch = _penannular_brooch(gid, sm_strap, chest_front(core.CHEST + 0.05, 0.038, x=-0.05), p_bronze, radius=0.034)
    entries.append(_ard_assemble(
        gid, 'Soot-Darkened Founder Leather Apron, Linen Shirt & Bronze Clan-Brooch', 'torso',
        [sm_shirt, sm_apron, sm_strap, sm_belt, sm_brooch,
         sleeves(gid, 'wrist', 0.019, p_linen, ease_end=0.024, rows=9)],
    ))

    gid = f'ard_{s}_smith_mould_pack'
    sm_box, sm_ctr, bk_d, sm_straps = _dorsal_pack_base(
        gid, (0.22, 0.13, 0.27),
        P('clay', 0.07, [B('top', 0.04, 0.07, 'solid', 'ard_bellbronze'), B('bottom', 0.04, 0.07, 'solid', 'ard_bellbronze')], fabric='leather.cuir_bouilli'),
        p_soot_lth,
    )
    ladle_shaft = tube(gid + '_casting_ladle', [sm_ctr + bk_d * 0.062 + np.array([-0.06, 0.0, 0.22]),
                                                sm_ctr + bk_d * 0.062 + np.array([0.05, 0.0, -0.16])],
                       0.014, p_iron, n=8, rigid_joint='Spine2')
    ladle_cup = blob(gid + '_ladle_bowl', sm_ctr + bk_d * 0.068 + np.array([-0.06, 0.0, 0.21]), (0.085, 0.065, 0.085),
                     p_bronze, n=12, rows=5, out=bk_d, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Ardent Bell-Mould Core & Bronze Casting-Ladle Pack', 'back',
                                 [sm_box, ladle_shaft, ladle_cup, sm_straps]))

    entries.append(_ard_assemble(
        f'ard_{s}_smith_gauntlets', 'Heavy Soot-Leather & Bronze-Riveted Founder Gauntlets', 'gloves',
        full_gloves(f'ard_{s}_smith_gauntlets', p_soot_lth, p_soot_lth, f0=0.52, ease=0.015, knuckle_paint=p_bronze),
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_smith_trews', 'Peat-and-Madder Founder Wool Trews', 'legs',
        trousers(f'ard_{s}_smith_trews',
                 P('ard_peat', 0.06, [], [PN(0.0, 1.0, 'ard_clan_tartan', 'ard_madder', 'ard_peat', 0.18)], fabric='cloth.wool'),
                 ease=0.014, ease_end=0.015, ankle_f=0.82, bag=0.008),
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_smith_clogs', 'Iron-and-Bronze-Shod Foundry Clogs', 'feet',
        boots(f'ard_{s}_smith_clogs', P('ard_pinewood', 0.08, [B('bottom', 0.0, 0.012, 'solid', 'ard_bogiron')]),
              p_soot_lth, top=0.40, ease_top=0.024),
    ))

    # =======================================================================================================
    # TIER 3: `cut_gorge_warden` — Upper Cut Canyon Toll-Warden
    # =======================================================================================================
    gid = f'ard_{s}_warden_spangenhelm'
    sp_bowl = _open_cranial_shell(gid + '_bowl', P('ard_bogiron', 0.04, [B('bottom', 0.0, 0.022, 'solid', 'ard_bellbronze')], fabric='metal.steel.hammered'),
                                  f_top=1.14, f_bot=0.08, f_brow_min=0.61, ease=0.018, rows=12, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    p_ns, _ = _anchor_on_part(sp_bowl, a_h + (b_h - a_h) * 0.63 - bk_h * 0.11)
    sp_nasal = tube(gid + '_nasal', [p_ns + up_h * 0.018 - bk_h * 0.004, p_ns - up_h * 0.042 - bk_h * 0.012],
                    0.0052, p_bronze, n=8, rigid_joint='Head')
    sp_badge = rosette(gid + '_raven_pine_badge', p_ns + up_h * 0.028 - bk_h * 0.005, -bk_h, left_h, 0.022, p_bronze, n=12, thick=0.010, rigid_joint='Head')
    entries.append(_ard_assemble(gid, 'Upper-Cut Iron Nasal Spangenhelm & Raven-Pine Badge', 'head',
                                 [sp_bowl, sp_nasal, sp_badge], covers_hair=True))

    gid = f'ard_{s}_warden_brigandine'
    p_brig = P('ard_bogiron', 0.04, [
        B('top', 0.0, 0.024, 'solid', 'ard_bellbronze'),
        B('bottom', 0.0, 0.024, 'solid', 'ard_bellbronze'),
    ], [
        PN(0.0, 1.0, 'ard_brigandine_studs', 'ard_bellbronze', 'ard_bogiron', 0.14),
    ], fabric='metal.steel.hammered')
    wd_cuir = cuirass_plate(gid, p_brig, trim_paint=p_bronze, style='laminar', faulds=2, ease=0.024)
    wd_gorg = gorget_guard(gid + '_gorg', p_brig, trim_paint=p_bronze, ease=0.024)
    wd_pld = articulated_pauldrons(gid + '_pld', p_brig, trim_paint=p_bronze, lames=2, haute_piece=False, ease=0.023)
    p_oil_plaid = P('ard_firtartan', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'ard_saffron')],
                    [PN(0.0, 1.0, 'ard_clan_tartan', 'ard_saffron', 'ard_firtartan', 0.16)], fabric='cloth.canvas.oiled')
    wd_sash = crossed_sash(gid + '_plaid_sash', p_oil_plaid, width=0.065, ease=0.034)
    wd_belt = pouch_belt(gid, p_peat_lth, p_soot_lth, ease=0.036)
    wd_brooch = _penannular_brooch(gid, wd_sash, chest_front(core.SHOULDER - 0.03, 0.042, x=-0.07), p_bronze, radius=0.032)
    entries.append(_ard_assemble(
        gid, 'Sculpted Bog-Iron & Bronze Laminar Canyon Cuirass & Plaid Sash', 'torso',
        [wd_cuir, wd_gorg, wd_pld, wd_sash, wd_belt, wd_brooch,
         sleeves(gid, 'wrist', 0.019, p_oil_plaid, ease_end=0.025, rows=9)],
    ))

    gid = f'ard_{s}_warden_rope_pack'
    wd_box, wd_ctr, bk_d, wd_straps = _dorsal_pack_base(gid, (0.21, 0.11, 0.25), p_peat_lth, p_peat_lth)
    rope_coil = rosette(gid + '_gorge_rope', wd_ctr + bk_d * 0.054, bk_d, np.array([1.0, 0.0, 0.0]),
                        0.115, P('oat', 0.08, fabric='straw.reed.plaited'), n=20, thick=0.036, rigid_joint='Spine2')
    sig_horn = horn(gid + '_signal_horn', [
        wd_ctr + bk_d * 0.058 + np.array([0.09, 0.0, -0.09]),
        wd_ctr + bk_d * 0.065 + np.array([0.12, 0.0, 0.02]),
        wd_ctr + bk_d * 0.058 + np.array([0.06, 0.0, 0.13]),
    ], 0.026, 0.008, P('ard_antler', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'ard_bellbronze')]), n=10, rows=8, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Coiled Gorge-Rope & Toll-Warden Signal Horn Pack', 'back',
                                 [wd_box, rope_coil, sig_horn, wd_straps]))

    entries.append(_ard_assemble(
        f'ard_{s}_warden_bracers', 'Bronze-Trimmed Iron Gorge Vambraces & Gauntlets', 'gloves',
        [sculpted_vambraces(f'ard_{s}_warden_vmb', p_iron, trim_paint=p_bronze, couter=False, ease=0.020),
         full_gloves(f'ard_{s}_warden_bracers',
                     P('ard_peat', 0.05, [B('top', 0.0, 0.015, 'solid', 'ard_bellbronze')], fabric='leather.cuir_bouilli'),
                     p_peat_lth, f0=0.86, ease=0.014, knuckle_paint=p_bronze)],
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_warden_trews', 'Weatherproofed Fir-Check Gorge Trews', 'legs',
        trousers(f'ard_{s}_warden_trews', p_tartan_fir, ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_warden_boots', 'Crag-Cleated Leather Gorge Boots', 'feet',
        boots(f'ard_{s}_warden_boots', p_iron, p_peat_lth, top=0.66, wraps=2, wrap_paint=p_soot_lth, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 4: `ardent_axeman` — Free-Clan Huscarl / Galloglass
    # =======================================================================================================
    gid = f'ard_{s}_axeman_helm'
    ax_bowl = _open_cranial_shell(gid + '_bowl', P('ard_bogiron', 0.04, [B('bottom', 0.0, 0.022, 'solid', 'ard_bellbronze')],
                                  [PN(0.0, 1.0, 'ard_bronze_scale', 'ard_bellbronze', 'ard_bogiron', 0.10)], fabric='metal.steel.hammered'),
                                  f_top=1.14, f_bot=-0.06, f_brow_min=0.61, ease=0.018, rows=12, n=36)
    ax_ridge = crest(gid + '_ridge', 0.026, p_bronze, rows=4, cols=13, sweep=0.01, a0=-0.80, a1=1.35, base_ease=0.013, thick=0.012, host_part=ax_bowl)
    # Gjermundbu spectacle brow/nose guard arching cleanly ABOVE and AROUND the eyes (`covers_face=False`, clear eyeline!)
    a_h, b_h, up_h, bk_h, left_h, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    p_brw, _ = _anchor_on_part(ax_bowl, a_h + (b_h - a_h) * 0.63 - bk_h * 0.11)
    spec_bar = tube(gid + '_spectacle_brow', [
        p_brw - left_h * 0.060 + bk_h * 0.014,
        p_brw - bk_h * 0.006,
        p_brw + left_h * 0.060 + bk_h * 0.014,
    ], 0.0060, p_bronze, n=8, rigid_joint='Head')
    spec_nose = tube(gid + '_spectacle_nasal', [p_brw - bk_h * 0.006, p_brw - up_h * 0.045 - bk_h * 0.012],
                     0.0055, p_bronze, n=8, rigid_joint='Head')
    entries.append(_ard_assemble(gid, 'Ridged Bog-Iron & Bronze Gjermundbu Spectacle-Helm', 'head',
                                 [ax_bowl, ax_ridge, spec_bar, spec_nose], covers_hair=True))

    gid = f'ard_{s}_axeman_byrnie'
    p_aketon = P('ard_saffron', 0.06, [
        B('bottom', 0.0, 0.025, 'solid', 'ard_madder'),
        B('bottom', 0.025, 0.075, 'ard_norse_interlace', 'ard_madder', 'ard_saffron', 0.09),
    ], [
        PN(0.0, 1.0, 'diamond_quilt', 'ochre', 'ard_saffron', 0.14),
    ], fabric='cloth.quilted.diamond')
    p_byrnie = P('ard_bellbronze', 0.03, [
        B('top', 0.0, 0.020, 'solid', 'ard_bogiron'),
        B('bottom', 0.0, 0.024, 'solid', 'ard_bogiron'),
    ], [
        PN(0.0, 1.0, 'ard_bronze_scale', 'ard_giltbronze', 'ard_bellbronze', 0.12),
    ], fabric='metal.bronze')
    ax_aketon = torso_tube(gid + '_aketon', core.TOP, core.KNEE - 0.02, 0.025, p_aketon,
                           hang_from=core.WAIST - 0.02, flare=0.15, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    ax_byrnie = cuirass_plate(gid + '_byrnie', p_byrnie, trim_paint=p_iron, style='lamellar', faulds=3, ease=0.032)
    ax_gorg = gorget_guard(gid + '_gorg', p_iron, trim_paint=p_bronze, ease=0.026)
    ax_pld = articulated_pauldrons(gid + '_pld', p_byrnie, trim_paint=p_iron, lames=3, haute_piece=True, ease=0.025)
    ax_belt = pouch_belt(gid, P('ard_peat', 0.05, [B('top', 0.0, 0.008, 'solid', 'ard_bellbronze')]), p_peat_lth, ease=0.044)
    p_md, n_md = _anchor_on_part(ax_byrnie[0], chest_front(core.CHEST + 0.03, 0.042))
    ax_med = rosette(gid + '_clan_medallion', p_md + n_md * 0.004, n_md, np.array([1.0, 0.0, 0.0]), 0.040, p_gilt, n=16, thick=0.014, rigid_joint='Spine2')
    entries.append(_ard_assemble(
        gid, 'Galloglass Saffron Aketon & Sculpted Bronze-Lamellar Cuirass', 'torso',
        [ax_aketon, ax_byrnie, ax_gorg, ax_pld, ax_belt, ax_med,
         sleeves(gid, 'wrist', 0.019, p_aketon, ease_end=0.025, rows=9)],
    ))

    gid = f'ard_{s}_axeman_targe'
    z_tg = 0.52 * core.CHEST + 0.48 * core.SHOULDER
    c_tg = spine_at(z_tg)
    bk_v = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    h_tg = first_hit(c_tg, bk_v, bvh=core.BVH_T)
    tg_ctr = c_tg + bk_v * ((float(h_tg) if h_tg is not None else 0.11) + 0.035)
    p_targe = P('ard_pinewood', 0.06, [B('top', 0.0, 0.03, 'solid', 'ard_bellbronze'), B('bottom', 0.0, 0.03, 'solid', 'ard_bellbronze')],
                [PN(0.0, 1.0, 'ard_norse_interlace', 'ard_bellbronze', 'ard_peat', 0.16)], fabric='leather.cuir_bouilli')
    tg_disc = rosette(gid + '_targe', tg_ctr, bk_v, np.array([1.0, 0.0, 0.0]), 0.265, p_targe, n=28, thick=0.024, rigid_joint='Spine2')
    tg_boss = rosette(gid + '_boss', tg_ctr + bk_v * 0.020, bk_v, np.array([1.0, 0.0, 0.0]), 0.068, p_bronze, n=16, thick=0.030, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Round Bossed Pinewood Highland Targe', 'back',
                                 [tg_disc, tg_boss, _dorsal_pad(gid, p_peat_lth, z_mid=z_tg, clearance=0.022)]))

    entries.append(_ard_assemble(
        f'ard_{s}_axeman_vambraces', 'Sculpted Bog-Iron & Bronze Huscarl Vambraces & Gauntlets', 'gloves',
        [sculpted_vambraces(f'ard_{s}_axeman_vmb', p_iron, trim_paint=p_bronze, couter=True, ease=0.021),
         full_gloves(f'ard_{s}_axeman_vambraces',
                     P('ard_bogiron', 0.04, [B('top', 0.0, 0.015, 'solid', 'ard_bellbronze')], fabric='metal.iron'),
                     p_peat_lth, f0=0.86, ease=0.015, knuckle_paint=p_bronze)],
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_axeman_trews', 'Huscarl Tartan Trews & Hinged Bronze Thigh-Tassets', 'legs',
        [trousers(f'ard_{s}_axeman_trews', p_tartan_mad, ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
         hinged_tassets(f'ard_{s}_axeman_tas', p_byrnie, trim_paint=p_iron, lames=3, ease=0.026)],
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_axeman_boots', 'Sculpted Bronze-Greave Huscarl War-Boots', 'feet',
        [boots(f'ard_{s}_axeman_boots', p_iron, p_peat_lth, top=0.26, ease_top=0.022),
         sculpted_greaves(f'ard_{s}_axeman_grv', p_byrnie, trim_paint=p_iron, poleyn=True, ease=0.025)],
    ))

    # =======================================================================================================
    # TIER 5: `bronze_gunner` — MC-06 Ardent Bronze-Gunners Mercenary Culveriner
    # =======================================================================================================
    gid = f'ard_{s}_gunner_morion'
    gn_bowl = _open_cranial_shell(gid + '_bowl', P('ard_bogiron', 0.04, [B('bottom', 0.0, 0.022, 'solid', 'ard_bellbronze')], fabric='metal.steel.hammered'),
                                  f_top=1.14, f_bot=0.14, f_brow_min=0.62, ease=0.018, rows=12, n=36)
    gn_comb = crest(gid + '_comb', 0.052, p_bronze, rows=5, cols=15, sweep=0.03, a0=-0.82, a1=1.40, base_ease=0.016, thick=0.012, host_part=gn_bowl)
    gn_brim = brim(gid + '_brim', 0.63, 0.056, P('ard_bogiron', 0.04, [B('bottom', 0.0, 0.014, 'solid', 'ard_bellbronze')], fabric='metal.steel.hammered'),
                   ease=0.018, rows=5, n=40, lift=0.024)
    entries.append(_ard_assemble(gid, 'MC-06 Bronze-Trimmed Mercenary Morion Pot-Helm', 'head',
                                 [gn_bowl, gn_comb, gn_brim], covers_hair=True))

    gid = f'ard_{s}_gunner_jerkin'
    p_gun_plate = P('ard_bellbronze', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'ard_bogiron'),
        B('bottom', 0.0, 0.022, 'solid', 'ard_bogiron'),
    ], [
        PN(0.0, 1.0, 'ard_brigandine_studs', 'ard_giltbronze', 'ard_bellbronze', 0.12),
    ], fabric='metal.bronze')
    gn_cuir = cuirass_plate(gid, p_gun_plate, trim_paint=p_iron, style='gothic', faulds=3, ease=0.024)
    gn_gorg = gorget_guard(gid + '_gorg', p_iron, trim_paint=p_bronze, ease=0.024)
    gn_pld = articulated_pauldrons(gid + '_pld', p_gun_plate, trim_paint=p_iron, lames=2, haute_piece=False, ease=0.023)
    gn_bando = crossed_sash(gid + '_powder_bandolier', p_peat_lth, width=0.052, ease=0.036)
    gn_belt = pouch_belt(gid, p_soot_lth, p_bronze, ease=0.038)
    # Bronze powder flasks suspended along bandolier
    gn_flasks = []
    for kf in range(5):
        tf = (kf + 0.5) / 5.0
        zf = (core.SHOULDER - 0.04) * (1.0 - tf) + (core.WAIST + 0.05) * tf
        xf = -0.09 + 0.18 * tf
        pf_s, nf_s = _anchor_on_part(gn_bando, chest_front(zf, 0.042, x=xf))
        gn_flasks.append(tube(f'{gid}_flask_{kf}', [pf_s + nf_s * 0.008 + np.array([0.0, 0.0, 0.032]),
                                                    pf_s + nf_s * 0.008 - np.array([0.0, 0.0, 0.036])],
                              0.013, p_bronze, n=8, rigid_joint='Spine2'))
    entries.append(_ard_assemble(
        gid, 'Sculpted Bell-Bronze Munition Cuirass & Culveriner Powder Bandolier', 'torso',
        [gn_cuir, gn_gorg, gn_pld, gn_bando, gn_belt, gn_flasks,
         sleeves(gid, 'wrist', 0.019, p_tartan_mad, ease_end=0.025, rows=9)],
    ))

    gid = f'ard_{s}_gunner_culverin_rig'
    gn_box, gn_ctr, bk_d, gn_straps = _dorsal_pack_base(gid, (0.20, 0.11, 0.26),
                                                        P('ard_pinewood', 0.06, [B('top', 0.0, 0.02, 'solid', 'ard_bogiron')], fabric='leather.cuir_bouilli'),
                                                        p_soot_lth)
    culv_barrel = horn(gid + '_culverin_barrel', [
        gn_ctr + bk_d * 0.056 + np.array([0.0, 0.0, -0.17]),
        gn_ctr + bk_d * 0.058 + np.array([0.0, 0.0, 0.04]),
        gn_ctr + bk_d * 0.056 + np.array([0.0, 0.0, 0.23]),
    ], 0.044, 0.030, P('ard_bellbronze', 0.03, [B('top', 0.0, 0.03, 'solid', 'ard_giltbronze'), B('bottom', 0.0, 0.03, 'solid', 'ard_bogiron')],
                       fabric='metal.bronze'), n=14, rows=9, rigid_joint='Spine2')
    ramrod = tube(gid + '_ramrod', [gn_ctr + bk_d * 0.052 + np.array([0.085, 0.0, 0.25]),
                                    gn_ctr + bk_d * 0.052 + np.array([0.085, 0.0, -0.18])],
                  0.011, P('ard_pinewood', 0.05, [B('top', 0.0, 0.05, 'solid', 'ard_oatmeal')]), n=8, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Dorsal Swivel-Culverin Bronze Barrel & Ramrod Rig', 'back',
                                 [gn_box, culv_barrel, ramrod, gn_straps]))

    entries.append(_ard_assemble(
        f'ard_{s}_gunner_gauntlets', 'Bronze-Vambrace Cannonier Gauntlets', 'gloves',
        [sculpted_vambraces(f'ard_{s}_gunner_vmb', p_bronze, trim_paint=p_iron, couter=False, ease=0.020),
         full_gloves(f'ard_{s}_gunner_gauntlets', p_buff_lth, p_soot_lth, f0=0.86, ease=0.015)],
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_gunner_trews', 'MC-06 Mercenary Tartan Marching Trews', 'legs',
        trousers(f'ard_{s}_gunner_trews', p_tartan_mad, ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_gunner_boots', 'Sculpted Bronze-Greave Culveriner Marching Boots', 'feet',
        [boots(f'ard_{s}_gunner_boots', p_soot_lth, p_peat_lth, top=0.26, ease_top=0.022),
         sculpted_greaves(f'ard_{s}_gunner_grv', p_bronze, trim_paint=p_iron, poleyn=True, ease=0.025)],
    ))

    # =======================================================================================================
    # TIER 6: `stave_skald_envoy` — Clan Envoy & Stave-Hall Chronicler
    # =======================================================================================================
    gid = f'ard_{s}_envoy_headband'
    ev_band = crown_band(gid + '_band',
                         P('ard_giltbronze', 0.03, [], [PN(0.0, 1.0, 'ard_norse_interlace', 'ard_bellbronze', 'ard_giltbronze', 0.08)], fabric='metal.gold'),
                         f0=0.58, f1=0.68, ease=0.004, flare=0.003, rows=5, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    p_gem, _ = _anchor_on_part(ev_band, a_h + (b_h - a_h) * 0.63 - bk_h * 0.11)
    ev_boss = rosette(gid + '_amber_boss', p_gem - bk_h * 0.003, -bk_h, left_h, 0.018,
                      P('amber', 0.02, fabric='metal.gold'), n=12, thick=0.009, rigid_joint='Head')
    entries.append(_ard_assemble(gid, 'Bronze-Filigree Knotwork Envoy Headband', 'head', [ev_band, ev_boss], covers_hair=False))

    gid = f'ard_{s}_envoy_coat'
    p_skald = P('ard_woad', 0.05, [
        B('top', 0.0, 0.032, 'ard_norse_interlace', 'ard_giltbronze', 'ard_madder', 0.07),
        B('bottom', 0.0, 0.020, 'solid', 'ard_giltbronze'),
        B('bottom', 0.020, 0.085, 'ard_norse_interlace', 'ard_giltbronze', 'ard_madder', 0.09),
    ], [
        PN(0.45, 0.55, 'ard_norse_interlace', 'ard_giltbronze', 'ard_madder', 0.10),
    ], fabric='cloth.wool.fulled')
    ev_body = torso_tube(gid, core.TOP, core.KNEE - 0.08, 0.025, p_skald,
                         hang_from=core.WAIST - 0.02, flare=0.15, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    ev_plaid = crossed_sash(gid + '_shoulder_plaid', p_tartan_roy, width=0.085, ease=0.032)
    ev_sash = sash_with_tail(gid, P('ard_madder', 0.04, [B('top', 0.0, 0.008, 'solid', 'ard_giltbronze')]),
                             P('ard_madder', 0.04, [B('bottom', 0.0, 0.025, 'solid', 'ard_giltbronze')]), ease=0.034, tail=0.25)
    ev_brooch = _penannular_brooch(gid, ev_plaid, chest_front(core.SHOULDER - 0.03, 0.038, x=-0.075), p_gilt, radius=0.046)
    entries.append(_ard_assemble(
        gid, 'Embroidered Woad-and-Madder Skald Coat & Giant Penannular Brooch', 'torso',
        [ev_body, stand_collar(gid, P('ard_madder', 0.04, [B('top', 0.0, 0.008, 'solid', 'ard_giltbronze')]), high=0.034),
         ev_plaid, ev_sash, ev_brooch,
         sleeves(gid, 'wrist', 0.019, P('ard_woad', 0.05, [B('bottom', 0.0, 0.05, 'ard_norse_interlace', 'ard_giltbronze', 'ard_madder', 0.06)]),
                 ease_end=0.028, rows=9)],
    ))

    gid = f'ard_{s}_envoy_harp_case'
    ev_box, ev_ctr, bk_d, ev_straps = _dorsal_pack_base(
        gid, (0.21, 0.10, 0.29),
        P('ard_pinewood', 0.05, [B('top', 0.0, 0.025, 'solid', 'ard_giltbronze'), B('bottom', 0.0, 0.025, 'solid', 'ard_giltbronze')],
          [PN(0.2, 0.8, 'ard_norse_interlace', 'ard_giltbronze', 'ard_pinewood', 0.12)], fabric='leather.cuir_bouilli'),
        p_peat_lth,
    )
    harp_bow = horn(gid + '_clarsach_pillar', [
        ev_ctr + bk_d * 0.052 + np.array([-0.06, 0.0, -0.14]),
        ev_ctr + bk_d * 0.068 + np.array([-0.10, 0.0, 0.05]),
        ev_ctr + bk_d * 0.052 + np.array([0.04, 0.0, 0.18]),
    ], 0.022, 0.014, p_gilt, n=10, rows=8, rigid_joint='Spine2')
    oath_ring = rosette(gid + '_oath_ring', ev_ctr + bk_d * 0.052 + np.array([0.04, 0.0, -0.02]), bk_d, np.array([1.0, 0.0, 0.0]),
                        0.062, p_gilt, n=16, thick=0.014, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Carved Clarsach Harp & Bronze Oath-Ring Case', 'back',
                                 [ev_box, harp_bow, oath_ring, ev_straps]))

    entries.append(_ard_assemble(
        f'ard_{s}_envoy_cuffs', 'Silver-Ringed Indigo Skald Cuffs & Gloves', 'gloves',
        full_gloves(f'ard_{s}_envoy_cuffs',
                    P('ard_woad', 0.05, [B('top', 0.0, 0.018, 'solid', 'silver'), B('bottom', 0.0, 0.015, 'solid', 'silver')], fabric='cloth.wool.fulled'),
                    P('ard_peat', 0.04, fabric='leather.polished'), f0=0.58, ease=0.013, ring_paint=P('silver', 0.02, fabric='metal.steel.brushed')),
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_envoy_trews', 'Woad-and-Saffron Envoy Tartan Trews', 'legs',
        trousers(f'ard_{s}_envoy_trews',
                 P('ard_woad', 0.05, [], [PN(0.0, 1.0, 'ard_royal_tartan', 'ard_saffron', 'ard_woad', 0.18)], fabric='cloth.wool.fulled'),
                 ease=0.013, ease_end=0.014, ankle_f=0.82, bag=0.008),
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_envoy_boots', 'Tooled-Leather & Bronze-Buckled Envoy Boots', 'feet',
        boots(f'ard_{s}_envoy_boots', p_bronze,
              P('ard_peat', 0.04, [B('top', 0.0, 0.02, 'solid', 'ard_giltbronze')], fabric='leather.polished'),
              top=0.72, ease_top=0.024),
    ))

    # =======================================================================================================
    # TIER 7: `clanthing_lawspeaker` — All-Clan Moot Judge
    # =======================================================================================================
    gid = f'ard_{s}_lawspeaker_circlet'
    lw_band = crown_band(gid + '_circlet',
                         P('ard_antler', 0.04, [B('bottom', 0.0, 0.010, 'solid', 'ard_giltbronze')],
                           [PN(0.0, 1.0, 'ard_oath_stave', 'ard_bellbronze', 'ard_antler', 0.08)]),
                         f0=0.58, f1=0.69, ease=0.004, flare=0.003, rows=5, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    c_lw = a_h + (b_h - a_h) * 0.65
    lw_parts = [lw_band]
    for tag, sgn in (('L', 1.0), ('R', -1.0)):
        d_t = -bk_h * 0.65 + left_h * (sgn * 0.75)
        d_t /= np.linalg.norm(d_t)
        p_t, _ = _anchor_on_part(lw_band, c_lw + d_t * 0.105)
        lw_parts.append(horn(f'{gid}_antler_tine_{tag}', [
            p_t - d_t * 0.002,
            p_t + d_t * 0.018 + up_h * 0.045,
            p_t + left_h * (sgn * 0.028) + up_h * 0.095 + bk_h * 0.015,
        ], 0.011, 0.003, P('ard_antler', 0.04), n=8, rows=7, rigid_joint='Head'))
    entries.append(_ard_assemble(gid, 'Carved Stag-Antler & Bronze Clanthing Circlet', 'head', lw_parts, covers_hair=False))

    gid = f'ard_{s}_lawspeaker_mantle'
    p_law_robe = P('ard_oatmeal', 0.05, [
        B('bottom', 0.0, 0.025, 'solid', 'ard_saffron'),
        B('bottom', 0.025, 0.110, 'ard_oath_stave', 'ard_bellbronze', 'ard_saffron', 0.10),
    ], [
        PN(0.44, 0.56, 'ard_oath_stave', 'ard_bellbronze', 'ard_saffron', 0.10),
    ], fabric='cloth.wool.fulled')
    lw_body = torso_tube(gid, core.TOP, core.ANKLE + 0.08, 0.024, p_law_robe,
                         hang_from=core.WAIST - 0.02, flare=0.18, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    lw_yoke = collar_disc(gid + '_mantle_yoke', 0.13,
                          P('ard_saffron', 0.05, [B('bottom', 0.0, 0.028, 'ard_norse_interlace', 'ard_bellbronze', 'ard_oatmeal', 0.07)], fabric='cloth.wool.fulled'),
                          drop=0.10, rows=8, n=48, scallop=0.06, ease=0.022)
    lw_belt = belt_sash(gid + '_belt', core.WAIST - 0.028, core.WAIST + 0.028,
                        P('ard_bellbronze', 0.03, [], [PN(0.0, 1.0, 'ard_oath_stave', 'ard_giltbronze', 'ard_peat', 0.08)]), ease=0.032)
    # Three cast-bronze Oath-Rings across the sternum
    lw_rings = []
    for kr, x_r in enumerate((-0.055, 0.0, 0.055)):
        pr_s, nr_s = _anchor_on_part(lw_body, chest_front(core.CHEST + (0.01 if kr == 1 else 0.03), 0.032, x=x_r))
        lw_rings.append(rosette(f'{gid}_oathring_{kr}', pr_s + nr_s * 0.004, nr_s, np.array([1.0, 0.0, 0.0]),
                                0.032 if kr == 1 else 0.026, p_gilt, n=14, thick=0.011, rigid_joint='Spine2'))
    entries.append(_ard_assemble(
        gid, 'White-and-Ochre Law-Mantle & Triple Bronze Oath-Rings', 'torso',
        [lw_body, lw_yoke, lw_belt, lw_rings,
         sleeves(gid, 'wrist', 0.020, P('ard_oatmeal', 0.05, [B('bottom', 0.0, 0.055, 'ard_oath_stave', 'ard_bellbronze', 'ard_saffron', 0.07)]),
                 ease_end=0.036, rows=10, wide=True)],
    ))

    gid = f'ard_{s}_lawspeaker_tablets'
    lw_box, lw_ctr, bk_d, lw_straps = _dorsal_pack_base(
        gid, (0.23, 0.10, 0.28),
        P('ard_pinewood', 0.05, [B('top', 0.0, 0.02, 'solid', 'ard_bellbronze'), B('bottom', 0.0, 0.02, 'solid', 'ard_bellbronze')],
          [PN(0.0, 1.0, 'ard_oath_stave', 'ard_giltbronze', 'ard_pinewood', 0.10)], fabric='leather.cuir_bouilli'),
        p_peat_lth,
    )
    stave_rod = tube(gid + '_law_stave', [lw_ctr + bk_d * 0.052 + np.array([0.0, 0.0, 0.21]),
                                          lw_ctr + bk_d * 0.052 + np.array([0.0, 0.0, -0.17])],
                     0.018, p_gilt, n=10, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Ancestral Carved Stave-Law Tablet Pack', 'back', [lw_box, stave_rod, lw_straps]))

    entries.append(_ard_assemble(
        f'ard_{s}_lawspeaker_cuffs', 'Engraved Bronze & Cream Lawspeaker Cuffs', 'gloves',
        full_gloves(f'ard_{s}_lawspeaker_cuffs',
                    P('ard_giltbronze', 0.03, [], [PN(0.0, 1.0, 'ard_oath_stave', 'ard_peat', 'ard_giltbronze', 0.08)], fabric='metal.gold'),
                    P('ard_oatmeal', 0.05, fabric='leather.buckskin'), f0=0.58, ease=0.013),
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_lawspeaker_trews', 'Ochre-and-Cream Ceremonial Moot Trews', 'legs',
        trousers(f'ard_{s}_lawspeaker_trews',
                 P('ard_saffron', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'ard_oatmeal')], fabric='cloth.wool.fulled'),
                 ease=0.013, ease_end=0.014, ankle_f=0.84, bag=0.008),
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_lawspeaker_shoes', 'Bronze-Buckled Lawspeaker Moot Shoes', 'feet',
        boots(f'ard_{s}_lawspeaker_shoes', p_peat_lth,
              P('ard_peat', 0.04, [B('top', 0.0, 0.02, 'solid', 'ard_giltbronze')], fabric='leather.polished'),
              top=0.36, ease_top=0.022),
    ))

    # =======================================================================================================
    # TIER 8: `nine_clan_jarl` — Highland Nine-Clan Chieftain
    # =======================================================================================================
    gid = f'ard_{s}_jarl_helm'
    jr_bowl = _open_cranial_shell(gid + '_bowl',
                                  P('ard_bogiron', 0.03, [B('bottom', 0.0, 0.026, 'ard_norse_interlace', 'ard_giltbronze', 'ard_bellbronze', 0.07)],
                                    [PN(0.0, 1.0, 'ard_bronze_scale', 'ard_giltbronze', 'ard_bogiron', 0.10)], fabric='metal.steel.hammered'),
                                  f_top=1.14, f_bot=-0.06, f_brow_min=0.61, ease=0.018, rows=12, n=36)
    jr_boar_crest = crest(gid + '_boar_crest', 0.064, p_gilt, rows=6, cols=15, sweep=0.03, a0=-0.82, a1=1.38, base_ease=0.013, thick=0.016, host_part=jr_bowl)
    # Swept gilded stag-antler brow wings anchored into the helmet bowl
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    c_jr = a_h + (b_h - a_h) * 0.72
    jr_parts = [jr_bowl, jr_boar_crest]
    for tag, sgn in (('L', 1.0), ('R', -1.0)):
        d_a = -bk_h * 0.45 + left_h * (sgn * 0.88)
        d_a /= np.linalg.norm(d_a)
        p_a, _ = _anchor_on_part(jr_bowl, c_jr + d_a * 0.11)
        jr_parts.append(horn(f'{gid}_stag_crest_{tag}', [
            p_a - d_a * 0.003,
            p_a + d_a * 0.032 + up_h * 0.055,
            p_a + left_h * (sgn * 0.048) + up_h * 0.115 + bk_h * 0.025,
        ], 0.014, 0.004, p_gilt, n=8, rows=7, rigid_joint='Head'))
    entries.append(_ard_assemble(gid, 'Gilded-Bronze Boar-and-Stag Crest Chieftain Ridge-Helm', 'head', jr_parts, covers_hair=True))

    gid = f'ard_{s}_jarl_surcoat'
    p_jarl_lam = P('ard_giltbronze', 0.02, [
        B('bottom', 0.0, 0.03, 'ard_norse_interlace', 'ard_giltbronze', 'ard_madder', 0.08),
    ], [
        PN(0.0, 1.0, 'ard_bronze_scale', 'ard_giltbronze', 'ard_bellbronze', 0.12),
    ], fabric='metal.gold')
    jr_surcoat = torso_tube(gid + '_surcoat', core.TOP, core.KNEE - 0.06, 0.025, p_tartan_roy,
                            hang_from=core.WAIST - 0.02, flare=0.16, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    jr_cuir = cuirass_plate(gid + '_lamellar', p_jarl_lam, trim_paint=p_gilt, style='musculata', faulds=3, ease=0.032)
    jr_gorg = gorget_guard(gid + '_gorg', p_gilt, trim_paint=p_bronze, ease=0.026)
    jr_pld = articulated_pauldrons(gid + '_pld', p_jarl_lam, trim_paint=p_gilt, lames=3, haute_piece=True, ease=0.025)
    p_wolf_fur = P('darkfur', 0.12, [B('bottom', 0.0, 0.02, 'solid', 'fur')], fabric='fur.wolf')
    jr_belt = sash_with_tail(gid, P('ard_giltbronze', 0.03, [], [PN(0.0, 1.0, 'ard_norse_interlace', 'ard_madder', 'ard_giltbronze', 0.08)], fabric='metal.gold'),
                             p_tartan_roy, ease=0.044, tail=0.26)
    jr_brooch = _penannular_brooch(gid, jr_cuir[0], chest_front(core.CHEST + 0.06, 0.042, x=0.0), p_gilt, radius=0.044)
    entries.append(_ard_assemble(
        gid, 'Gilded Chieftain Musculata Cuirass, Articulated Pauldrons & Royal Tartan Surcoat', 'torso',
        [jr_surcoat, jr_cuir, jr_gorg, jr_pld, jr_belt, jr_brooch,
         sleeves(gid, 'wrist', 0.019, p_tartan_roy, ease_end=0.026, rows=9)],
    ))

    gid = f'ard_{s}_jarl_banner_shield'
    z_jb = 0.52 * core.CHEST + 0.48 * core.SHOULDER
    c_jb = spine_at(z_jb)
    bk_v = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    h_jb = first_hit(c_jb, bk_v, bvh=core.BVH_T)
    jb_ctr = c_jb + bk_v * ((float(h_jb) if h_jb is not None else 0.11) + 0.036)
    jr_targe = rosette(gid + '_royal_targe', jb_ctr, bk_v, np.array([1.0, 0.0, 0.0]),
                       0.265, P('ard_madder', 0.04, [B('top', 0.0, 0.035, 'solid', 'ard_giltbronze')],
                                [PN(0.0, 1.0, 'ard_norse_interlace', 'ard_giltbronze', 'ard_madder', 0.16)], fabric='metal.bronze'),
                       n=28, thick=0.024, rigid_joint='Spine2')
    jr_umbo = rosette(gid + '_umbo', jb_ctr + bk_v * 0.020, bk_v, np.array([1.0, 0.0, 0.0]), 0.072, p_gilt, n=16, thick=0.030, rigid_joint='Spine2')
    jr_mast = tube(gid + '_banner_staff', [jb_ctr + bk_v * 0.022 + np.array([0.0, 0.0, 0.34]),
                                           jb_ctr + bk_v * 0.022 + np.array([0.0, 0.0, -0.20])],
                   0.014, p_gilt, n=10, rigid_joint='Spine2')
    jr_crossbar = tube(gid + '_banner_cross', [jb_ctr + bk_v * 0.028 + np.array([-0.14, 0.0, 0.32]),
                                               jb_ctr + bk_v * 0.028 + np.array([0.14, 0.0, 0.32])],
                       0.011, p_gilt, n=8, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Nine-Clan Royal Targe & Gilded Banner Standard', 'back',
                                 [jr_targe, jr_umbo, jr_mast, jr_crossbar, _dorsal_pad(gid, p_peat_lth, z_mid=z_jb, clearance=0.022)]))

    entries.append(_ard_assemble(
        f'ard_{s}_jarl_vambraces', 'Sculpted Gilded-Bronze Urnes Vambraces & Gauntlets', 'gloves',
        [sculpted_vambraces(f'ard_{s}_jarl_vmb', p_jarl_lam, trim_paint=p_gilt, couter=True, ease=0.021),
         full_gloves(f'ard_{s}_jarl_vambraces',
                     P('ard_giltbronze', 0.03, [], [PN(0.0, 1.0, 'ard_norse_interlace', 'ard_madder', 'ard_giltbronze', 0.08)], fabric='metal.gold'),
                     p_peat_lth, f0=0.86, ease=0.015, knuckle_paint=p_gilt)],
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_jarl_trews', 'Royal Nine-Clan Tartan Trews & Hinged Gilded Tassets', 'legs',
        [trousers(f'ard_{s}_jarl_trews', p_tartan_roy, ease=0.013, ease_end=0.014, ankle_f=0.80, bag=0.008),
         hinged_tassets(f'ard_{s}_jarl_tas', p_jarl_lam, trim_paint=p_gilt, lames=4, ease=0.026)],
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_jarl_boots', 'Sculpted Gilded-Bronze Greaves & Chieftain War-Boots', 'feet',
        [boots(f'ard_{s}_jarl_boots', p_gilt, p_peat_lth, top=0.26, ease_top=0.022),
         sculpted_greaves(f'ard_{s}_jarl_grv', p_jarl_lam, trim_paint=p_gilt, poleyn=True, ease=0.025)],
    ))

    # =======================================================================================================
    # TIER 9: `high_pass_drover` — Alpine Yak/Cattle Drover & Timber-Rafter
    # =======================================================================================================
    gid = f'ard_{s}_drover_hat'
    dr_crown = tower_hat(gid + '_crown', 0.115, lambda t: 1.00 - 0.18 * t,
                         P('ard_peat', 0.08, [B('top', 0.0, 0.024, 'ard_clan_tartan', 'ard_saffron', 'ard_firtartan', 0.06)], fabric='cloth.felt.boiled'),
                         f=0.64, ease=0.014, rows=8, n=36)
    dr_brim = brim(gid + '_brim', 0.64, 0.105, P('ard_peat', 0.08, [B('bottom', 0.0, 0.012, 'solid', 'ard_bellbronze')], fabric='cloth.felt.boiled'),
                   ease=0.014, rows=5, n=42, droop=0.018)
    entries.append(_ard_assemble(gid, 'Wide Boiled-Felt High-Pass Rain-Hat', 'head', [dr_crown, dr_brim], covers_hair=True))

    gid = f'ard_{s}_drover_poncho'
    p_greased_wool = P('ard_peat', 0.07, [
        B('bottom', 0.0, 0.025, 'solid', 'ard_saffron'),
        B('bottom', 0.025, 0.085, 'ard_clan_tartan', 'ard_saffron', 'ard_firtartan', 0.12),
    ], fabric='cloth.oilskin.tarred_seams')
    dr_body = torso_tube(gid, core.TOP, core.CROTCH - 0.14, 0.035, p_greased_wool,
                         hang_from=core.WAIST - 0.02, flare=0.15, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    dr_capelet = collar_disc(gid + '_rain_poncho', 0.15, p_greased_wool, drop=0.13, rows=8, n=48, scallop=0.05, ease=0.023)
    dr_belt = pouch_belt(gid, P('ard_soothide', 0.06, [B('top', 0.0, 0.008, 'solid', 'ard_bellbronze')]), p_buff_lth, ease=0.042)
    entries.append(_ard_assemble(
        gid, 'Greased-Wool High-Pass Poncho-Cloak & Studded Drover Belt', 'torso',
        [dr_body, dr_capelet, dr_belt,
         sleeves(gid, 'wrist', 0.019, p_tartan_fir, ease_end=0.025, rows=9)],
    ))

    gid = f'ard_{s}_drover_pack'
    dr_box, dr_ctr, bk_d, dr_straps = _dorsal_pack_base(
        gid, (0.24, 0.14, 0.27),
        P('fur', 0.10, [B('top', 0.0, 0.03, 'solid', 'ard_peat')], fabric='fur.yak'),
        p_soot_lth,
    )
    yak_horn = horn(gid + '_herding_horn', [
        dr_ctr + bk_d * 0.062 + np.array([-0.09, 0.0, -0.08]),
        dr_ctr + bk_d * 0.072 + np.array([-0.13, 0.0, 0.03]),
        dr_ctr + bk_d * 0.062 + np.array([-0.06, 0.0, 0.15]),
    ], 0.028, 0.008, P('ard_antler', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'ard_bellbronze')]), n=10, rows=8, rigid_joint='Spine2')
    axe_haft = tube(gid + '_rafter_axe', [dr_ctr + bk_d * 0.060 + np.array([0.07, 0.0, 0.22]),
                                          dr_ctr + bk_d * 0.060 + np.array([0.07, 0.0, -0.17])],
                    0.014, P('ard_pinewood', 0.05), n=8, rigid_joint='Spine2')
    axe_head = blob(gid + '_axe_head', dr_ctr + bk_d * 0.065 + np.array([0.10, 0.0, 0.18]), (0.095, 0.024, 0.075),
                    p_iron, n=10, rows=5, out=bk_d, rigid_joint='Spine2')
    entries.append(_ard_assemble(gid, 'Alpine Yak-Horn & Timber-Rafter Axe Pack', 'back',
                                 [dr_box, yak_horn, axe_haft, axe_head, dr_straps]))

    entries.append(_ard_assemble(
        f'ard_{s}_drover_mitts', 'Greased-Hide & Fleece High-Pass Drover Mitts', 'gloves',
        full_gloves(f'ard_{s}_drover_mitts', P('fur', 0.10, fabric='fur.yak'), p_soot_lth, f0=0.56, ease=0.015),
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_drover_trews', 'Gaitered Peat-and-Fir High-Pass Trews', 'legs',
        trousers(f'ard_{s}_drover_trews',
                 P('ard_firtartan', 0.06, [B('bottom', 0.0, 0.16, 'solid', 'ard_peat')],
                   [PN(0.0, 1.0, 'ard_clan_tartan', 'ard_saffron', 'ard_firtartan', 0.18)], fabric='cloth.wool'),
                 ease=0.014, ease_end=0.015, ankle_f=0.82, bag=0.008),
        legged=True,
    ))
    entries.append(_ard_assemble(
        f'ard_{s}_drover_boots', 'Hobnailed Gaitered Alpine Drover Boots', 'feet',
        boots(f'ard_{s}_drover_boots', p_iron, p_soot_lth, top=0.64, wraps=2, wrap_paint=p_buff_lth, ease_top=0.025),
    ))

    return entries


# ===========================================================================================================
# 4. LOCAL SELF-CONTAINED CROSS-SLOT CONFORMITY PASS (`ard_*` GLBs ONLY, ZERO SHARED FILES!)
# ===========================================================================================================
def _write_glb_pos(glb_path, j_obj, raw_b, pos_acc_i, P_f32):
    acc_meta = j_obj['accessors'][pos_acc_i]
    acc_meta['min'] = [float(x) for x in P_f32.min(axis=0)]
    acc_meta['max'] = [float(x) for x in P_f32.max(axis=0)]
    bv = j_obj['bufferViews'][acc_meta['bufferView']]
    pos_bytes = np.ascontiguousarray(P_f32).tobytes()
    raw_b[bv['byteOffset']:bv['byteOffset'] + len(pos_bytes)] = pos_bytes
    js_b = json.dumps(j_obj, separators=(',', ':')).encode()
    js_b += b' ' * ((-len(js_b)) % 4)
    with open(glb_path, 'wb') as f_out:
        f_out.write(struct.pack('<III', 0x46546C67, 2, 28 + len(js_b) + len(raw_b)))
        f_out.write(struct.pack('<II', len(js_b), 0x4E4F534A) + js_b + struct.pack('<II', len(raw_b), 0x004E4942) + bytes(raw_b))


def _conform_local_manifest_glbs(kit_entries, peoples_entry, prefix='ard_'):
    for sex_key, b_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        set_body(b_id)
        sh_y_gl = float(core.RIG.jpos[core.RIG.J['LeftArm']][1])
        sp1_y_gl = float(core.RIG.jpos[core.RIG.J['Spine1']][1])
        y_upleg_gl = float(core.RIG.jpos[core.RIG.J['LeftUpLeg']][1])

        base_kit = json.loads((ROOT / 'data' / b_id / 'kit.json').read_text(encoding='utf-8'))
        by_id = {it['id']: dict(it) for it in base_kit['items']}
        for e in kit_entries:
            if e.get('_body') == b_id:
                ec = dict(e)
                ec['made_by'] = 'garments'
                by_id[e['id']] = ec

        back_to_torsos, torso_to_legs, feet_to_legs = {}, {}, {}
        for outf in peoples_entry['outfits'][sex_key].values():
            t_id, bk_id, l_id, ft_id = outf.get('torso'), outf.get('back'), outf.get('legs'), outf.get('feet')
            if t_id and bk_id and t_id in by_id and bk_id in by_id:
                back_to_torsos.setdefault(bk_id, set()).add(t_id)
            if t_id and l_id and t_id in by_id and l_id in by_id:
                torso_to_legs.setdefault(t_id, set()).add(l_id)
            if l_id and ft_id and l_id in by_id and ft_id in by_id:
                feet_to_legs.setdefault(ft_id, set()).add(l_id)

        # 1. Hip/thigh torso hem over trousers (`Gate 6B`)
        for t_id, l_ids in sorted(torso_to_legs.items()):
            if not t_id.startswith(prefix):
                continue
            t_it = by_id[t_id]
            if not t_it.get('loose'):
                continue
            t_glb = ROOT / t_it['glb']
            tj, tb = glbio.read_glb(t_glb.read_bytes())
            pr_t = tj['meshes'][0]['primitives'][0]
            at_t = pr_t['attributes']
            Pt = glbio.accessor(tj, tb, at_t['POSITION']).astype(np.float64).copy()
            Tt = glbio.accessor(tj, tb, pr_t['indices']).reshape(-1, 3)
            y_t_min = float(Pt[:, 1].min())
            re_t = np.concatenate([Tt[:, 0], Tt[:, 1], Tt[:, 2]])
            ce_t = np.concatenate([Tt[:, 1], Tt[:, 2], Tt[:, 0]])
            nc_t, lbl_t = connected_components(csr_matrix((np.ones(len(re_t), dtype=np.int8), (re_t, ce_t)), shape=(len(Pt), len(Pt))), directed=False)
            wide_ys = [
                float(Pt[lbl_t == cid_t, 1].min()) for cid_t in range(nc_t)
                if int((lbl_t == cid_t).sum()) >= 260 and float(Pt[lbl_t == cid_t, 0].max() - Pt[lbl_t == cid_t, 0].min()) >= 0.28
            ]
            main_skirt_y = min(wide_ys) if wide_ys else y_t_min
            if not (0.62 <= main_skirt_y <= y_upleg_gl - 0.03):
                continue
            lh_blocks = []
            for l_id in l_ids:
                l_it = by_id[l_id]
                if l_it.get('loose'):
                    continue
                lj, lb = glbio.read_glb((ROOT / l_it['glb']).read_bytes())
                pr_l = lj['meshes'][0]['primitives'][0]
                Pl = glbio.accessor(lj, lb, pr_l['attributes']['POSITION']).astype(np.float64)
                Tl = glbio.accessor(lj, lb, pr_l['indices']).reshape(-1, 3)
                va_l, vb_l, vc_l = Pl[Tl[:, 0]], Pl[Tl[:, 1]], Pl[Tl[:, 2]]
                sub_l = np.vstack([Pl, (va_l + vb_l + vc_l) / 3.0, 0.5 * (va_l + vb_l), 0.5 * (vb_l + vc_l), 0.5 * (vc_l + va_l)])
                lh_blocks.append(sub_l[(sub_l[:, 1] >= min(y_t_min, main_skirt_y) - 0.015) & (sub_l[:, 1] <= main_skirt_y + 0.135)])
            if not lh_blocks:
                continue
            L_hem = np.vstack(lh_blocks)
            if len(L_hem) < 12:
                continue
            mod_th = False
            for cid_t in range(nc_t):
                c_ix = np.nonzero(lbl_t == cid_t)[0]
                if len(c_ix) < 180 or float(Pt[c_ix, 0].max() - Pt[c_ix, 0].min()) < 0.28:
                    continue
                c_ymin = float(Pt[c_ix, 1].min())
                for vi_t in c_ix[Pt[c_ix, 1] <= c_ymin + 0.125]:
                    vx, vy, vz = float(Pt[vi_t, 0]), float(Pt[vi_t, 1]), float(Pt[vi_t, 2])
                    r_t = math.hypot(vx, vz)
                    if r_t < 0.05:
                        continue
                    ux_t, uz_t = vx / r_t, vz / r_t
                    nl_h = L_hem[np.abs(L_hem[:, 1] - vy) <= 0.020]
                    if not len(nl_h):
                        continue
                    rl_h = np.hypot(nl_h[:, 0], nl_h[:, 2])
                    sec_h = ((nl_h[:, 0] * ux_t + nl_h[:, 2] * uz_t) / np.maximum(rl_h, 1e-6)) >= math.cos(0.32)
                    if sec_h.any():
                        r_req_h = float(rl_h[sec_h].max()) + 0.0085
                        if r_t < r_req_h:
                            w_hem = float(np.clip(((c_ymin + 0.125) - vy) / 0.070, 0.0, 1.0))
                            w_hem = w_hem * w_hem * (3.0 - 2.0 * w_hem)
                            r_new_h = r_t + w_hem * (r_req_h - r_t)
                            if r_new_h - r_t > 3e-4:
                                Pt[vi_t, 0] = ux_t * r_new_h
                                Pt[vi_t, 2] = uz_t * r_new_h
                                mod_th = True
            if mod_th:
                raw_t = bytearray(tb)
                Pt_f32 = Pt.astype(np.float32)
                nd_t0 = next((n for n in tj['nodes'] if 'mesh' in n and 'skin' in n), None)
                sk_t0 = tj['skins'][nd_t0['skin']] if nd_t0 else None
                if sk_t0 is not None and 'inverseBindMatrices' in sk_t0 and t_it.get('cloth'):
                    ibm_at = tj['accessors'][sk_t0['inverseBindMatrices']]
                    ibm_bvt = tj['bufferViews'][ibm_at['bufferView']]
                    ibm_t = np.frombuffer(bytes(raw_t[ibm_bvt['byteOffset']:ibm_bvt['byteOffset'] + ibm_bvt['byteLength']]), dtype=np.float32).reshape(-1, 4, 4).copy()
                    j_names_t = [tj['nodes'][k].get('name', '') for k in sk_t0['joints']]
                    for g_it, ch_t in enumerate(t_it['cloth'].get('chains', [])):
                        pts_ct = ch_t.get('pts', [])
                        for b_kt in range(len(pts_ct) - 1):
                            jn_ct = f'cloth:{t_id}:{g_it}:{b_kt}'
                            if jn_ct in j_names_t:
                                ibm_t[j_names_t.index(jn_ct)][3, :3] = -Pt_f32[pts_ct[b_kt]]
                    ibm_tb = np.ascontiguousarray(ibm_t).tobytes()
                    raw_t[ibm_bvt['byteOffset']:ibm_bvt['byteOffset'] + len(ibm_tb)] = ibm_tb
                _write_glb_pos(t_glb, tj, raw_t, at_t['POSITION'], Pt_f32)

        # 2. Back straps over paired torso (`Gate 5A`)
        for bk_id, t_ids in sorted(back_to_torsos.items()):
            if not bk_id.startswith(prefix):
                continue
            bk_it = by_id[bk_id]
            bk_glb = ROOT / bk_it['glb']
            bj, bb = glbio.read_glb(bk_glb.read_bytes())
            prim_b = bj['meshes'][0]['primitives'][0]
            at_b = prim_b['attributes']
            Pb = glbio.accessor(bj, bb, at_b['POSITION']).astype(np.float64).copy()
            Tb = glbio.accessor(bj, bb, prim_b['indices']).reshape(-1, 3)

            t_blocks = []
            for t_id in t_ids:
                tj, tb = glbio.read_glb((ROOT / by_id[t_id]['glb']).read_bytes())
                pr_t = tj['meshes'][0]['primitives'][0]
                Pt = glbio.accessor(tj, tb, pr_t['attributes']['POSITION']).astype(np.float64)
                Tt = glbio.accessor(tj, tb, pr_t['indices']).reshape(-1, 3)
                va, vb_t, vc = Pt[Tt[:, 0]], Pt[Tt[:, 1]], Pt[Tt[:, 2]]
                t_blocks.extend([Pt, (va + vb_t + vc) / 3.0, 0.5 * (va + vb_t), 0.5 * (vb_t + vc), 0.5 * (vc + va)])
            T_surf = np.vstack(t_blocks)
            re_i = np.concatenate([Tb[:, 0], Tb[:, 1], Tb[:, 2]])
            ce_i = np.concatenate([Tb[:, 1], Tb[:, 2], Tb[:, 0]])
            n_comp, lbl = connected_components(csr_matrix((np.ones(len(re_i), dtype=np.int8), (re_i, ce_i)), shape=(len(Pb), len(Pb))), directed=False)
            strap_cids = [cid for cid in range(n_comp) if 60 <= int((lbl == cid).sum()) <= 440 and float(Pb[lbl == cid, 2].max()) > 0.045 and float(Pb[lbl == cid, 2].min()) < -0.045]
            if not strap_cids:
                continue
            T_up = T_surf[(T_surf[:, 1] >= sp1_y_gl - 0.08) & (np.abs(T_surf[:, 0]) <= 0.24)]
            modified = False
            for cid in strap_cids:
                idxs = np.nonzero(lbl == cid)[0]
                ring_sz = 9 if (len(idxs) % 9 == 0) else (8 if (len(idxs) % 8 == 0) else 1)
                n_rings = len(idxs) // ring_sz
                has_seam = ring_sz >= 8 and n_rings >= 16 and float(np.linalg.norm(Pb[idxs[:ring_sz]] - Pb[idxs[(n_rings - 1) * ring_sz:n_rings * ring_sz]])) < 0.003
                n_unique = (n_rings - 1) if has_seam else n_rings
                u_outs = np.zeros((n_unique, 3), dtype=np.float64)
                deltas = np.zeros(n_unique, dtype=np.float64)
                min_deltas = np.full(n_unique, -0.05, dtype=np.float64)
                for rk in range(n_unique):
                    rv = Pb[idxs[rk * ring_sz:(rk + 1) * ring_sz]]
                    rc = rv.mean(axis=0)
                    c_ref = np.array([math.copysign(min(abs(float(rc[0])), 0.095), float(rc[0])), min(float(rc[1]), sh_y_gl + 0.005), 0.0])
                    u_out = rc - c_ref
                    L_u = float(np.linalg.norm(u_out))
                    if L_u < 1e-5:
                        continue
                    u_out /= L_u
                    u_outs[rk] = u_out
                    rel_t = T_up - c_ref[None, :]
                    s_proj = rel_t @ u_out
                    perp_sq = np.sum(rel_t * rel_t, axis=1) - s_proj * s_proj
                    x_ok = np.abs(T_up[:, 0] - rc[0]) <= (0.0135 if abs(float(rc[0])) < 0.135 else 0.020)
                    cyl_m = x_ok & (s_proj > 0.020) & (perp_sq <= 0.0155 * 0.0155)
                    if not cyl_m.any():
                        cyl_m = (s_proj > 0.015) & (perp_sq <= 0.026 * 0.026)
                    if not cyl_m.any():
                        continue
                    s_coat = float(np.percentile(s_proj[cyl_m], 98))
                    s_in = float(((rv - c_ref[None, :]) @ u_out).min())
                    min_deltas[rk] = (s_coat + 0.0022) - s_in
                    deltas[rk] = float(np.clip((s_coat + 0.0030) - s_in, -0.045, 0.038))
                if n_unique >= 8:
                    disp_v = u_outs * deltas[:, None]
                    for _ in range(3):
                        disp_v = 0.50 * disp_v + 0.25 * (np.roll(disp_v, 1, axis=0) + np.roll(disp_v, -1, axis=0))
                    for rk in range(n_unique):
                        if np.linalg.norm(u_outs[rk]) > 0.5 and min_deltas[rk] > -0.048:
                            proj_d = float(np.dot(disp_v[rk], u_outs[rk]))
                            if proj_d < min_deltas[rk]:
                                disp_v[rk] += u_outs[rk] * (min_deltas[rk] - proj_d)
                    disp_v = 0.65 * disp_v + 0.175 * (np.roll(disp_v, 1, axis=0) + np.roll(disp_v, -1, axis=0))
                for rk in range(n_unique):
                    dv_k = disp_v[rk] if n_unique >= 8 else (u_outs[rk] * float(deltas[rk]))
                    if np.linalg.norm(dv_k) > 0.0004:
                        Pb[idxs[rk * ring_sz:(rk + 1) * ring_sz]] += dv_k
                        modified = True
                if has_seam and modified:
                    Pb[idxs[(n_rings - 1) * ring_sz:n_rings * ring_sz]] = Pb[idxs[:ring_sz]]
            if modified:
                _write_glb_pos(bk_glb, bj, bytearray(bb), at_b['POSITION'], Pb.astype(np.float32))

        # 3. Closed boot shafts over paired legged trews (`Gate 7`)
        p_foot_l = np.asarray(core.RIG.jpos[core.RIG.J['LeftFoot']], dtype=np.float64)
        p_knee_l = np.asarray(core.RIG.jpos[core.RIG.J['LeftLeg']], dtype=np.float64)
        p_foot_r = np.asarray(core.RIG.jpos[core.RIG.J['RightFoot']], dtype=np.float64)
        p_knee_r = np.asarray(core.RIG.jpos[core.RIG.J['RightLeg']], dtype=np.float64)
        for ft_id, l_ids in sorted(feet_to_legs.items()):
            if not ft_id.startswith(prefix):
                continue
            ft_it = by_id[ft_id]
            ft_glb = ROOT / ft_it['glb']
            fj, fb = glbio.read_glb(ft_glb.read_bytes())
            prim_f = fj['meshes'][0]['primitives'][0]
            at_f = prim_f['attributes']
            Pf = glbio.accessor(fj, fb, at_f['POSITION']).astype(np.float64).copy()
            Tf = glbio.accessor(fj, fb, prim_f['indices']).reshape(-1, 3)
            re_f = np.concatenate([Tf[:, 0], Tf[:, 1], Tf[:, 2]])
            ce_f = np.concatenate([Tf[:, 1], Tf[:, 2], Tf[:, 0]])
            nc_f, lbl_f = connected_components(csr_matrix((np.ones(len(re_f), dtype=np.int8), (re_f, ce_f)), shape=(len(Pf), len(Pf))), directed=False)
            shaft_mask_f = np.zeros(len(Pf), dtype=bool)
            cuff_mask_f = np.zeros(len(Pf), dtype=bool)
            for cid_f in range(nc_f):
                c_if = np.nonzero(lbl_f == cid_f)[0]
                if float(Pf[c_if, 2].min()) < -0.02 and float(Pf[c_if, 2].max()) > 0.02 and len(c_if) >= 60:
                    shaft_mask_f[c_if] = True
                    if float(Pf[c_if, 1].min()) > 0.12:
                        cuff_mask_f[c_if] = True
            if not shaft_mask_f.any():
                continue
            y_ft_max = float(Pf[shaft_mask_f, 1].max())
            l_blocks = []
            for l_id in l_ids:
                l_it = by_id[l_id]
                if not l_it.get('legged'):
                    continue
                lj, lb = glbio.read_glb((ROOT / l_it['glb']).read_bytes())
                pr_l = lj['meshes'][0]['primitives'][0]
                Pl = glbio.accessor(lj, lb, pr_l['attributes']['POSITION']).astype(np.float64)
                Tl = glbio.accessor(lj, lb, pr_l['indices']).reshape(-1, 3)
                va_l, vb_l, vc_l = Pl[Tl[:, 0]], Pl[Tl[:, 1]], Pl[Tl[:, 2]]
                sub_l = np.vstack([Pl, (va_l + vb_l + vc_l) / 3.0, 0.5 * (va_l + vb_l), 0.5 * (vb_l + vc_l), 0.5 * (vc_l + va_l)])
                l_blocks.append(sub_l[(sub_l[:, 1] >= 0.085) & (sub_l[:, 1] <= y_ft_max + 0.030)])
            if not l_blocks:
                continue
            L_surf = np.vstack(l_blocks)
            if not len(L_surf):
                continue
            mod_ft = False
            for sgn_x, p_ft, p_kn in ((1.0, p_foot_l, p_knee_l), (-1.0, p_foot_r, p_knee_r)):
                ls_side = L_surf[L_surf[:, 0] * sgn_x > 0.01]
                if not len(ls_side):
                    continue
                for vi_f in np.nonzero(shaft_mask_f & (Pf[:, 0] * sgn_x > 0.01) & (Pf[:, 1] >= 0.095))[0]:
                    vx, vy, vz = float(Pf[vi_f, 0]), float(Pf[vi_f, 1]), float(Pf[vi_f, 2])
                    u_sh = float(np.clip((vy - p_ft[1]) / max(1e-4, p_kn[1] - p_ft[1]), 0.0, 1.0))
                    ax_c = p_ft + (p_kn - p_ft) * u_sh
                    dx_f, dz_f = vx - float(ax_c[0]), vz - float(ax_c[2])
                    r_f = math.hypot(dx_f, dz_f)
                    if r_f < 1e-5:
                        continue
                    ux_f, uz_f = dx_f / r_f, dz_f / r_f
                    near_l = ls_side[np.abs(ls_side[:, 1] - vy) <= 0.022]
                    if not len(near_l):
                        continue
                    dl_x, dl_z = near_l[:, 0] - float(ax_c[0]), near_l[:, 2] - float(ax_c[2])
                    rl = np.hypot(dl_x, dl_z)
                    sec_m = ((dl_x * ux_f + dl_z * uz_f) / np.maximum(rl, 1e-6)) >= math.cos(0.38)
                    if sec_m.any():
                        r_req = float(rl[sec_m].max()) + 0.0040 + (0.0025 if cuff_mask_f[vi_f] else 0.0)
                        if r_f < r_req:
                            Pf[vi_f, 0] = float(ax_c[0]) + ux_f * r_req
                            Pf[vi_f, 2] = float(ax_c[2]) + uz_f * r_req
                            mod_ft = True
            if mod_ft:
                _write_glb_pos(ft_glb, fj, bytearray(fb), at_f['POSITION'], Pf.astype(np.float32))


# ===========================================================================================================
# 5. COMPLETE 10-TIER `rustic_clansmen` PEOPLES ENTRY & MANIFEST VALIDATOR
# ===========================================================================================================
FREE_CLANS_TIERS = [
    ['ardent_crofter', 0.240],
    ['high_pass_drover', 0.140],
    ['clan_bronzesmith', 0.120],
    ['cut_gorge_warden', 0.110],
    ['ardent_axeman', 0.130],
    ['bronze_gunner', 0.100],
    ['stave_skald_envoy', 0.070],
    ['clanthing_lawspeaker', 0.050],
    ['nine_clan_jarl', 0.040],
    ['pc_torgo_couture', 0.000],
]

FREE_CLANS_TIER_LABELS = {
    'ardent_crofter': 'Ardent Highland Oat-Farmer & Sheep-Crofter',
    'high_pass_drover': 'Alpine Yak-Drover & Timber-Rafter',
    'clan_bronzesmith': 'Ardent Bell & Cannon Bronze-Founder',
    'cut_gorge_warden': 'Upper Cut Canyon Toll-Warden',
    'ardent_axeman': 'Free-Clan Huscarl & Galloglass Axeman',
    'bronze_gunner': 'Ardent Bronze-Gunners Mercenary Culveriner (MC-06)',
    'stave_skald_envoy': 'Clan Envoy & Stave-Hall Chronicler',
    'clanthing_lawspeaker': 'All-Clan Clanthing Moot Lawspeaker',
    'nine_clan_jarl': 'Nine-Clan Highland Jarl & Chieftain',
    'pc_torgo_couture': 'Free Clans Torgo Gold-Brocade Couture (PC)',
}


def _free_clans_outfits_for_sex(sex):
    s = sex
    return {
        'ardent_crofter': {
            'head': f'ard_{s}_crofter_bonnet',
            'torso': f'ard_{s}_crofter_tunic',
            'back': f'ard_{s}_crofter_creel',
            'gloves': f'ard_{s}_crofter_wraps',
            'legs': f'ard_{s}_crofter_trews',
            'feet': f'ard_{s}_crofter_brogues',
            'region': 'ardent',
        },
        'clan_bronzesmith': {
            'head': f'ard_{s}_smith_skullcap',
            'torso': f'ard_{s}_smith_apron',
            'back': f'ard_{s}_smith_mould_pack',
            'gloves': f'ard_{s}_smith_gauntlets',
            'legs': f'ard_{s}_smith_trews',
            'feet': f'ard_{s}_smith_clogs',
            'region': 'ardent',
        },
        'cut_gorge_warden': {
            'head': f'ard_{s}_warden_spangenhelm',
            'torso': f'ard_{s}_warden_brigandine',
            'back': f'ard_{s}_warden_rope_pack',
            'gloves': f'ard_{s}_warden_bracers',
            'legs': f'ard_{s}_warden_trews',
            'feet': f'ard_{s}_warden_boots',
            'region': 'upper_cut',
        },
        'ardent_axeman': {
            'head': f'ard_{s}_axeman_helm',
            'torso': f'ard_{s}_axeman_byrnie',
            'back': f'ard_{s}_axeman_targe',
            'gloves': f'ard_{s}_axeman_vambraces',
            'legs': f'ard_{s}_axeman_trews',
            'feet': f'ard_{s}_axeman_boots',
            'region': 'nine_clans',
        },
        'bronze_gunner': {
            'head': f'ard_{s}_gunner_morion',
            'torso': f'ard_{s}_gunner_jerkin',
            'back': f'ard_{s}_gunner_culverin_rig',
            'gloves': f'ard_{s}_gunner_gauntlets',
            'legs': f'ard_{s}_gunner_trews',
            'feet': f'ard_{s}_gunner_boots',
            'region': 'mercenary',
        },
        'stave_skald_envoy': {
            'head': f'ard_{s}_envoy_headband',
            'torso': f'ard_{s}_envoy_coat',
            'back': f'ard_{s}_envoy_harp_case',
            'gloves': f'ard_{s}_envoy_cuffs',
            'legs': f'ard_{s}_envoy_trews',
            'feet': f'ard_{s}_envoy_boots',
            'region': 'stave_halls',
        },
        'clanthing_lawspeaker': {
            'head': f'ard_{s}_lawspeaker_circlet',
            'torso': f'ard_{s}_lawspeaker_mantle',
            'back': f'ard_{s}_lawspeaker_tablets',
            'gloves': f'ard_{s}_lawspeaker_cuffs',
            'legs': f'ard_{s}_lawspeaker_trews',
            'feet': f'ard_{s}_lawspeaker_shoes',
            'region': 'ardent',
        },
        'nine_clan_jarl': {
            'head': f'ard_{s}_jarl_helm',
            'torso': f'ard_{s}_jarl_surcoat',
            'back': f'ard_{s}_jarl_banner_shield',
            'gloves': f'ard_{s}_jarl_vambraces',
            'legs': f'ard_{s}_jarl_trews',
            'feet': f'ard_{s}_jarl_boots',
            'region': 'nine_clans',
        },
        'high_pass_drover': {
            'head': f'ard_{s}_drover_hat',
            'torso': f'ard_{s}_drover_poncho',
            'back': f'ard_{s}_drover_pack',
            'gloves': f'ard_{s}_drover_mitts',
            'legs': f'ard_{s}_drover_trews',
            'feet': f'ard_{s}_drover_boots',
            'region': 'upper_cut',
        },
        'pc_torgo_couture': {
            'head': f'rustic_{s}_pc_torgo_hat',
            'torso': f'rustic_{s}_pc_torgo_coat',
            'legs': f'rustic_{s}_pc_torgo_tights',
            'feet': f'rustic_{s}_pc_torgo_heels',
            'type': 'pc',
            'label': 'Free Clans Torgo Gold-Brocade Couture (PC)',
        },
    }


def build_free_clans_peoples_entry():
    return {
        'id': 'rustic_clansmen',
        'name': 'Free Clans (Rustic Clansmen)',
        'note': (
            'Copper-and-tin Highland Nine-Clan confederacy around Ardent & Upper Cut (LORE.md S6.4): '
            'Norse-Gaelic / Swiss-Alpine / Early-Modern Scottish Highland synthesis of stave-halls, '
            'Clanthing moots, galloglass huscarls, and MC-06 Ardent Bronze-Gunner culverin foundries '
            '(10 tiers at 100% M+F parity; tools/garments/cultures/free_clans.py).'
        ),
        'ancestry': {
            'african': [0.0, 0.05],
            'asian': [0.0, 0.15],
            'caucasian': [0.8, 1.0],
        },
        'skin': ['#f4dccb', '#e8c6ad', '#d6ab8c'],
        'hair': ['#e3cf9a', '#cfae6a', '#b07a43', '#8e4f2a', '#6d4a2c'],
        'eyes': ['#4e6a80', '#5a7a9a', '#6a7a86', '#4a5a3a', '#5a3a22'],
        'grey': 0.45,
        'beard': 0.75,
        'morph': {
            'height': [0.0, 0.6],
            'muscle': [0.0, 0.5],
        },
        'styles': {
            'male': [
                'long01', 'braid01', 'ponytail01', 'elvs_that_80s_babe_hair',
                'short02', 'scalpviking', 'fourstrandbraid', 'elvs_unkempt_french_braid',
            ],
            'female': [
                'braid01', 'elvs_double_mh_braid', 'elvs_reverse_french_braid_bun',
                'long01', 'brunhilde', 'fourstrandbraid',
            ],
        },
        'tiers': FREE_CLANS_TIERS,
        'tier_labels': FREE_CLANS_TIER_LABELS,
        'outfits': {
            'male': _free_clans_outfits_for_sex('m'),
            'female': _free_clans_outfits_for_sex('f'),
        },
    }


def build_free_clans_kit():
    with free_clans_motif_scope():
        entries = []
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            entries.extend(_build_for_body(sex, body_id))
    return entries


def _validate_manifest(kit_entries, peoples_entry):
    share_sum = sum(sh for _, sh in peoples_entry['tiers'])
    assert abs(share_sum - 1.0) < 1e-9, f'Free Clans tier shares sum to {share_sum}, expected 1.000'
    for tid, sh in peoples_entry['tiers']:
        if tid == 'pc_torgo_couture':
            assert sh == 0.0, f'{tid} must have 0.0 crowd share, got {sh}'

    existing_by_body = {}
    for b_id in ('mpfb_male', 'mpfb_female'):
        kit = json.loads((ROOT / 'data' / b_id / 'kit.json').read_text(encoding='utf-8'))
        existing_by_body[b_id] = {it['id']: it for it in kit['items']}

    by_body_id = {}
    for ent in kit_entries:
        b_id = ent.get('_body')
        gid = ent.get('id')
        assert b_id in ('mpfb_male', 'mpfb_female'), f'Invalid _body on {gid}: {b_id}'
        assert gid.startswith('ard_'), f'New piece {gid} must use ard_ prefix!'
        assert ent.get('culture') == 'rustic_clansmen', f'Unexpected culture on {gid}: {ent.get("culture")}'
        key = (b_id, gid)
        assert key not in by_body_id, f'Duplicate kit entry for {key}'
        by_body_id[key] = ent
        glb_p = ROOT / ent['glb']
        morph_p = glb_p.with_suffix('.morph.bin')
        assert glb_p.exists() and glb_p.stat().st_size > 500, f'Missing or empty GLB: {glb_p}'
        assert morph_p.exists() and morph_p.stat().st_size > 100, f'Missing or empty morph.bin: {morph_p}'

    m_keys = set(peoples_entry['outfits']['male'].keys())
    f_keys = set(peoples_entry['outfits']['female'].keys())
    assert m_keys == f_keys, f'M/F tier parity mismatch: {m_keys ^ f_keys}'
    assert len(m_keys) == 10, f'Expected 10 tiers, got {len(m_keys)}'

    for sex_key, body_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        for tid, spec in peoples_entry['outfits'][sex_key].items():
            for req in ('head', 'torso', 'legs', 'feet'):
                assert req in spec, f'Outfit {sex_key}.{tid} missing required {req} slot!'
            for slot in ('head', 'torso', 'gloves', 'legs', 'feet', 'back'):
                if slot in spec:
                    pid = spec[slot]
                    ent_ref = by_body_id.get((body_id, pid)) or existing_by_body[body_id].get(pid)
                    assert ent_ref is not None, f'Outfit {sex_key}.{tid}.{slot} -> {pid} missing from {body_id}'
                    assert ent_ref['slot'] == slot, f'Slot mismatch on {pid}: expected {slot}, got {ent_ref["slot"]}'


def main():
    t0 = time.perf_counter()
    kit_entries = build_free_clans_kit()
    peoples_entry = build_free_clans_peoples_entry()
    _conform_local_manifest_glbs(kit_entries, peoples_entry, prefix='ard_')
    _validate_manifest(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'free_clans_manifest.json'
    manifest_data = {
        'culture': 'rustic_clansmen',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Free Clans of Ardent pieces ({n_m} male, {n_f} female) across 10 tiers in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
