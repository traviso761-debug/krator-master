"""The Iron Republic (`iron_republic` / *Jernrepublika*) Complete 21-Tier Procedural Wardrobe Kit.

Compiles 158 procedural garments (`irp_m_*` & `irp_f_*`) across `mpfb_male` and `mpfb_female`
for all 13 new/upgraded Citizen-Army, Guild, Industrial, Magistracy, Commissariat & First-Citizen
tiers (6 slots each: `head`, `torso`, `back`, `gloves`, `legs`, `feet`) plus crouch-safe female
under-leggings for the preserved civic/festive dresses, while preserving existing valid `rep_*`
civic, festive, `pc_patchwork_sheriff`, and `crimson_technomancer` tiers = Full 21-Tier Roster
at 100% `mpfb_male` + `mpfb_female` parity!

Run standalone in manifest-only mode (does NOT edit shared kit.json or peoples.json):
    python -u tools/garments/cultures/iron_republic_full.py
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
from scipy.spatial import cKDTree

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

import glbio
import make_mpfb
from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, L, R, FRONT, set_body, spine_at, first_hit, head_frame,
    surface_out, chest_front, assemble_garment, frame, ring_points, smooth_push,
)
from garments.paint import P, B, PN, C, COTTON, WOOL, leathery, sample_cultural_tex
from garments.types.torso import (
    torso_tube, collar, stand_collar, collar_disc, cape, tabard, band, crossed_sash, pauldron,
)
from garments.types.armor import (
    cuirass_plate, gorget_guard, articulated_pauldron, articulated_pauldrons,
    hinged_tassets, sculpted_vambraces, sculpted_greaves,
)
from garments.types.limbs import limb_tube, sleeve, sleeves, trousers, full_gloves
from garments.types.footwear import boots
from garments.types.headgear import (
    head_landmarks_exact, head_rings, sculpted_faceplate,
    hood, brim, tower_hat, crown_band, crest, horn,
)
from garments.types.accoutrements import (
    flap, blob, belt_sash, pouch_belt, sash_with_tail, tube, strap, rosette,
)


# ===========================================================================================================
# 1. CANONICAL IRON REPUBLIC PALETTE (`irp_*` scoped linear RGB) & CUSTOM MOTIFS
# ===========================================================================================================
IRP_COLORS = {
    'irp_ironblack':   (0.024, 0.025, 0.028),  # #28292c Deep iron-black (Tinget, Commissar, First Citizen, Sapogi)
    'irp_obsidian':    (0.036, 0.038, 0.044),  # #313338 Polished obsidian leather
    'irp_steel':       (0.070, 0.103, 0.136),  # #4b5a66 Cascade hydro-steel oiled slate
    'irp_cuirass':     (0.470, 0.495, 0.530),  # #babec4 Brushed Stahlborn high-nickel steel
    'irp_slagiron':    (0.055, 0.058, 0.066),  # #3c3e43 Parkerized sapper/smelter slab-iron
    'irp_repred_deep': (0.370, 0.018, 0.014),  # #a3241c Deep Republic crimson
    'irp_pigskin':     (0.165, 0.068, 0.028),  # #6e472b Scorched blast-furnace split pigskin
    'irp_rubber':      (0.055, 0.062, 0.058),  # #3c403e Acid-proofed waxed rubberized cloth
    'irp_saxon_green': (0.042, 0.115, 0.078),  # #365f4d Opticians' & Astronomers' Guild slate-green
    'irp_amber_lens':  (0.840, 0.460, 0.085),  # #ebaf4e Smoked/amber optical blast-glass
    'irp_vial_green':  (0.180, 0.560, 0.340),  # #72c496 Saltpeter/nitric reagent glass
    'irp_dark_slit':   (0.008, 0.008, 0.010),  # #141416 Visor eye-slit void
}

IRP_CUSTOM_MOTIFS = {
    'irp_sword_triskele',
    'irp_vatnik_rib',
    'irp_streltsy_frogging',
    'irp_berendeika_tubes',
    'irp_izani_decree',
    'irp_fluted_steel',
}


def _irp_custom_motif(style, w, h, fg, bg, aspect=1.0):
    base_style = style.split(':')[0]
    H = max(int(h), 1)
    W = max(int(w), 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if base_style == 'irp_sword_triskele':
        # Three rotational 120-degree bent armored arms gripping 90-degree straight swords inside a braided medallion
        nx = max(1.0, round(1.8 * max(aspect, 0.5)))
        gu = ((u * nx) % 1.0 - 0.5) * 2.0
        gv = (v - 0.5) * 2.0
        rr = np.hypot(gu, gv)
        ring = (rr > 0.74) & (rr < 0.88)
        hub = rr < 0.16
        arms_m = np.zeros((H, W), dtype=bool)
        for k in range(3):
            th = k * (2.0 * math.pi / 3.0) - math.pi / 2.0
            ca, sa = math.cos(th), math.sin(th)
            rx = gu * ca + gv * sa
            ry = -gu * sa + gv * ca
            forearm = (rx > 0.0) & (rx < 0.44) & (np.abs(ry) < 0.075)
            fist = np.hypot(rx - 0.44, ry) < 0.105
            blade = (np.abs(rx - 0.44) < 0.048) & (ry > -0.16) & (ry < 0.58)
            guard = (np.abs(rx - 0.44) < 0.135) & (np.abs(ry - 0.11) < 0.040)
            arms_m |= forearm | fist | blade | guard
        rail = (v < 0.07) | (v > 0.93)
        img[ring | hub | arms_m | rail] = fg
        tex = sample_cultural_tex('tex.republic_sword_triskelion', W, H, fg, bg, pal_blend=0.28)
        img = 0.56 * img + 0.44 * tex

    elif base_style == 'irp_vatnik_rib':
        # Parallel vertical padded cotton-batting telogreika/vatnik channels + horizontal bar-tacks
        nx = max(6.0, round(14.0 * max(aspect, 0.4)))
        ch = (u * nx) % 1.0
        puff = 0.78 + 0.26 * np.sin(math.pi * ch)
        seam = (ch < 0.08) | (ch > 0.92)
        bartack = (np.abs((v * 4.0) % 1.0 - 0.5) < 0.035) & (((np.floor(u * nx).astype(int)) % 2) == 0)
        img[:] = np.asarray(bg)[None, None, :] * puff[:, :, None]
        img[seam] = np.asarray(bg) * 0.58
        img[bartack] = fg

    elif base_style == 'irp_streltsy_frogging':
        # Muscovite Streltsy ryasy horizontal cord bars with trefoil hussar knots & central brass toggles
        ny = max(4.0, round(7.0 / max(aspect, 0.35)))
        gv = (v * ny) % 1.0
        su = (u - 0.5) * 2.0
        au = np.abs(su)
        cord = (au < 0.68) & ((np.abs(gv - 0.36) < 0.085) | (np.abs(gv - 0.64) < 0.085))
        knot1 = np.hypot((au - 0.72) * 1.6, gv - 0.50) < 0.18
        knot2 = np.hypot((au - 0.64) * 1.6, gv - 0.28) < 0.13
        knot3 = np.hypot((au - 0.64) * 1.6, gv - 0.72) < 0.13
        placket = au < 0.055
        toggle = np.hypot(su * 2.2, gv - 0.50) < 0.15
        img[cord | knot1 | knot2 | knot3 | placket] = fg
        img[toggle] = C['brass']
        tex = sample_cultural_tex('tex.republic_streltsy_braid', W, H, fg, bg, pal_blend=0.25)
        img = 0.58 * img + 0.42 * tex

    elif base_style == 'irp_berendeika_tubes':
        # Turned birch/leather powder-apostle charger cylinders with brass spouts along a bandolier
        nx = max(6.0, round(12.0 * max(aspect, 0.5)))
        gu = (u * nx) % 1.0
        in_tube = (gu > 0.18) & (gu < 0.82) & (v > 0.14) & (v < 0.90)
        spout = (gu > 0.28) & (gu < 0.72) & (v <= 0.28) & (v >= 0.08)
        cap_band = in_tube & (np.abs(v - 0.78) < 0.06)
        cyl_shade = 0.72 + 0.34 * np.sin(math.pi * np.clip((gu - 0.18) / 0.64, 0.0, 1.0))
        img[in_tube] = np.asarray(fg)[None, None, :] * cyl_shade[in_tube, None]
        img[spout | cap_band] = C['brass']

    elif base_style == 'irp_izani_decree':
        # Straight-cut Izani capitals ('SERVIZ GIR SIDIZAN O') framed between twin crimson/brass rails
        nx = max(8.0, round(16.0 * max(aspect, 0.5)))
        cell_i = np.floor(u * nx).astype(int)
        gu = (u * nx) % 1.0
        gv = v
        rails = (gv < 0.12) | (gv > 0.88) | ((gv > 0.16) & (gv < 0.21)) | ((gv > 0.79) & (gv < 0.84))
        in_box = (gv >= 0.28) & (gv <= 0.72) & (gu >= 0.18) & (gu <= 0.82)
        mod_c = cell_i % 6
        v_bar = in_box & ((np.abs(gu - 0.26) < 0.09) | ((mod_c % 2 == 0) & (np.abs(gu - 0.74) < 0.09)))
        h_bar = in_box & (
            ((mod_c != 3) & (np.abs(gv - 0.33) < 0.065))
            | (np.isin(mod_c, (0, 2, 4)) & (np.abs(gv - 0.50) < 0.060))
            | ((mod_c != 1) & (np.abs(gv - 0.67) < 0.065))
        )
        sun_dot = (mod_c == 5) & (
            ((np.hypot((gu - 0.50) * 1.2, gv - 0.50) > 0.14) & (np.hypot((gu - 0.50) * 1.2, gv - 0.50) < 0.22))
            | (np.hypot((gu - 0.50) * 1.2, gv - 0.50) < 0.06)
        )
        glyph = np.where(mod_c == 5, sun_dot, v_bar | h_bar)
        img[rails | glyph] = fg

    elif base_style == 'irp_fluted_steel':
        # Maximilian vertical fluted munition cuirass ribs + rolled rivet borders
        nx = max(8.0, round(18.0 * max(aspect, 0.5)))
        rib = 0.80 + 0.24 * np.sin(2.0 * math.pi * u * nx)
        trough = np.abs(((u * nx) % 1.0) - 0.5) < 0.08
        border = (v < 0.06) | (v > 0.94)
        rivet = (np.hypot(((u * nx * 0.5) % 1.0) - 0.5, (v - 0.09) * 6.0) < 0.16) | (
            np.hypot(((u * nx * 0.5) % 1.0) - 0.5, (v - 0.91) * 6.0) < 0.16
        )
        img[:] = np.asarray(bg)[None, None, :] * rib[:, :, None]
        img[trough] = np.asarray(bg) * 0.66
        img[border | rivet] = fg
        tex = sample_cultural_tex('tex.republic_cuirass_steel', W, H, fg, bg, pal_blend=0.35)
        img = 0.62 * img + 0.38 * tex

    return np.clip(img, 0.0, 1.0)


@contextmanager
def iron_republic_motif_scope():
    """Temporarily register `irp_*` colors & custom motifs into `paint.py` without permanent mutation."""
    orig_motif = paint_mod.motif
    added_colors = []
    for k, v in IRP_COLORS.items():
        if k not in C:
            C[k] = v
            added_colors.append(k)
    paint_mod.FABRIC.setdefault('metal.steel.hammered', 0.25)

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        base = style.split(':')[0] if isinstance(style, str) else ''
        if base in IRP_CUSTOM_MOTIFS:
            return _irp_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif
        for k in added_colors:
            C.pop(k, None)


def _irp_assemble(gid, label, slot, parts, covers_hair=False, covers_face=False, open_torso=False, legged=False):
    return assemble_garment(
        gid, label, slot, 'iron_republic', parts,
        covers_hair=covers_hair, covers_face=covers_face,
        open_torso=open_torso, legged=legged,
    )


# ===========================================================================================================
# 2. SHARED GEOMETRY & ANCHORING HELPERS (ZERO >18mm ISLAND GAPS ON MALE & FEMALE!)
# ===========================================================================================================
def _anchor_on_part(host_part, target_pt):
    """Return `(surface_pt, outward_dir)` on `host_part.P` nearest `target_pt` (guarantees 0..3mm contact)."""
    P_flat = host_part.P.reshape(-1, 3)
    tgt = np.asarray(target_pt, dtype=np.float64)
    idx = int(np.argmin(np.linalg.norm(P_flat - tgt[None, :], axis=1)))
    p = P_flat[idx].copy()
    c = spine_at(p[2]) if p[2] < core.NECK[2] + 0.015 else core.HEAD
    nrm = p - np.array([c[0], c[1], p[2]], dtype=np.float64)
    L_n = float(np.linalg.norm(nrm))
    nrm = (nrm / L_n) if L_n > 1e-6 else np.array([0.0, -1.0, 0.0], dtype=np.float64)
    return p, nrm


def _coat_buttons(gid, host_part, z_top, z_bot, n_buttons=5, paint=None, double=False):
    """Anchor 3D buttons directly onto `host_part.P` (`<= 2.0mm` gap, passing Check #13 `<= 4.0mm` button rule!)."""
    bp = paint or P('brass', 0.03, fabric='metal.bronze')
    out = []
    for i, z in enumerate(np.linspace(z_top, z_bot, n_buttons)):
        if double:
            for k, dx in enumerate((-0.044, 0.044)):
                tgt = chest_front(z, 0.025, x=dx)
                p_s, n_s = _anchor_on_part(host_part, tgt)
                out.append(blob(f'{gid}_btn_{i}_{k}', p_s + n_s * 0.0015, (0.017, 0.010, 0.017), bp, n=8, rows=4, out=n_s, role='trinket'))
        else:
            tgt = chest_front(z, 0.025, x=0.0)
            p_s, n_s = _anchor_on_part(host_part, tgt)
            out.append(blob(f'{gid}_btn_{i}', p_s + n_s * 0.0015, (0.017, 0.010, 0.017), bp, n=8, rows=4, out=n_s, role='trinket'))
    return out


def _open_cranial_shell(name, paint, f_top=1.14, f_bot=0.02, f_brow_min=0.62, ease=0.018, rows=12, n=36):
    """Open-face helmet/cap shell descending to `f_bot` at occiput while arching cleanly above `f_brow_min >= 0.60` in front.

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


def _brow_goggles(gid, host_part, frame_paint, lens_paint, f_level=0.72):
    """Twin round brass-bezel goggles seated directly onto `host_part` above the brow (zero eyeline block)."""
    a, b, up, bk, left = head_frame()
    c_b = a + (b - a) * f_level
    out = []
    for tag, sgn in (('L', 1.0), ('R', -1.0)):
        d_g = -bk * 0.92 + left * (sgn * 0.34)
        d_g /= np.linalg.norm(d_g)
        tgt = c_b + d_g * 0.11
        p_h, _ = _anchor_on_part(host_part, tgt)
        out.append(rosette(f'{gid}_goggle_rim_{tag}', p_h + d_g * 0.003, d_g, left, 0.024, frame_paint, n=14, thick=0.012, rigid_joint='Head'))
        out.append(rosette(f'{gid}_goggle_lens_{tag}', p_h + d_g * 0.008, d_g, left, 0.017, lens_paint, n=12, thick=0.008, rigid_joint='Head'))
    # Connecting bridge strap between the two goggles
    p_mid, _ = _anchor_on_part(host_part, c_b - bk * 0.11)
    out.append(tube(f'{gid}_goggle_bridge', [p_mid - left * 0.026 - bk * 0.004, p_mid + left * 0.026 - bk * 0.004], 0.0045, frame_paint, n=8, rigid_joint='Head'))
    return out


def _tricorne_hat(gid, crown_paint, brim_paint, badge_paint, height=0.11):
    """3-cocked Republican tricorne / bicorne hat with upturned triangular brim & front cockade."""
    a, b, up, bk, left = head_frame()
    crown = tower_hat(gid + '_crown', height, lambda t: 1.02 - 0.08 * t, crown_paint, f=0.64, ease=0.014, rows=9, n=36)
    c = a + (b - a) * 0.64
    n = 42
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    inner = []
    for an in angs:
        d = bk * math.cos(an) + left * math.sin(an)
        h = first_hit(c, d)
        inner.append((d, (float(h) if h is not None else 0.096) + 0.014))
    Q = []
    rows_b = 6
    for k in range(rows_b):
        s = k / float(rows_b - 1)
        row = []
        for (d, r), an in zip(inner, angs):
            # Three cocked upturns (back + two front-sides), leaving three crisp points (front-prow + two back-corners)
            cock = 0.5 + 0.5 * math.cos(3.0 * (an - math.pi))
            w_rad = 0.078 * (1.0 - 0.32 * cock)
            z_lift = (0.010 + 0.062 * cock) * (s ** 1.35)
            row.append(c + d * (r + s * w_rad) + up * z_lift)
        Q.append(row)
    br = Part(gid + '_brim', np.array(Q), True, ['body'] * rows_b, brim_paint, rigid_joint='Head')
    # Front cockade anchored to left-front upturned brim panel
    d_ck = -bk * 0.80 + left * 0.55
    d_ck /= np.linalg.norm(d_ck)
    p_ck, _ = _anchor_on_part(br, c + d_ck * 0.14 + up * 0.04)
    cockade = rosette(gid + '_cockade', p_ck + d_ck * 0.003, d_ck, left, 0.024, badge_paint, n=14, thick=0.010, rigid_joint='Head')
    return [crown, br, cockade]


def _dorsal_pad(gid, pad_paint, z_mid=None, pad_size=(0.18, 0.044, 0.22), clearance=0.022):
    """Flush Spine2-weighted dorsal mounting pad seated against the back (zero loose front shoulder straps)."""
    z_c = z_mid if z_mid is not None else (0.55 * core.CHEST + 0.45 * core.SHOULDER - 0.02)
    c_sp = spine_at(z_c)
    bk_dir = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    anc = surface_out(c_sp, bk_dir, clearance, bvh=core.BVH_T)
    return blob(gid + '_dorsal_pad', anc, pad_size, pad_paint, n=14, rows=6, out=bk_dir, rigid_joint='Spine2')


def _dorsal_pack_base(gid, box_size, box_paint, strap_paint):
    """Standard dorsal pack frame seated cleanly on `Spine2` via a flush `_dorsal_pad` (zero loose front straps)."""
    z_mid = 0.55 * core.CHEST + 0.45 * core.SHOULDER - 0.02
    c_sp = spine_at(z_mid)
    bk_dir = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    h_back = first_hit(c_sp, bk_dir, bvh=core.BVH_T)
    back_r = (float(h_back) if h_back is not None else 0.11) + 0.024 + box_size[1] * 0.26
    pack_ctr = c_sp + bk_dir * back_r
    box = blob(gid + '_body', pack_ctr, box_size, box_paint, n=16, rows=7, out=bk_dir, rigid_joint='Spine2')
    pad = _dorsal_pad(gid, strap_paint, z_mid=z_mid, clearance=0.022)
    return box, pack_ctr, bk_dir, pad


def _bandolier_charges(gid, host_part, n_charges, tube_paint, cap_paint, r_tube=0.012, len_tube=0.068):
    """Row of 3D cylindrical apostle charges / glass vials anchored directly along the diagonal chest bandolier."""
    out = []
    z_hi = core.SHOULDER - 0.04
    z_lo = core.WAIST + 0.05
    for i in range(n_charges):
        t = (i + 0.5) / float(n_charges)
        z_i = z_hi * (1.0 - t) + z_lo * t
        x_i = -0.095 + 0.185 * t
        tgt = chest_front(z_i, 0.032, x=x_i)
        p_s, n_s = _anchor_on_part(host_part, tgt)
        top_p = p_s + n_s * (r_tube * 0.72) + np.array([0.0, 0.0, len_tube * 0.45])
        bot_p = p_s + n_s * (r_tube * 0.72) - np.array([0.0, 0.0, len_tube * 0.55])
        out.append(tube(f'{gid}_charge_{i}', [top_p, bot_p], r_tube, tube_paint, n=8, rigid_joint='Spine2'))
        cap_top = top_p + np.array([0.0, 0.0, 0.012])
        out.append(tube(f'{gid}_charge_cap_{i}', [cap_top, top_p], r_tube * 0.82, cap_paint, n=8, rigid_joint='Spine2'))
    return out


# ===========================================================================================================
# 3. FULL 13 PROCEDURAL TIER BUILDERS (`irp_{m,f}_*`) + FEMALE UNDER-TROUSERS
# ===========================================================================================================
def _build_for_body(sex, body_id):
    set_body(body_id)
    s = sex
    entries = []

    p_leather_blk = leathery(P('irp_ironblack', 0.05, fabric='leather.polished'))
    p_leather_brn = leathery(P('leather', 0.05, fabric='leather.polished'))
    p_leather_umb = leathery(P('umber', 0.06, fabric='leather.cuir_bouilli'))
    p_brass = P('brass', 0.03, fabric='metal.bronze')
    p_steel = P('irp_cuirass', 0.03, fabric='metal.steel.brushed')
    p_slag = P('irp_slagiron', 0.05, fabric='metal.steel.hammered')

    # --- 0. Female crouch-safe knee under-leggings for preserved skirted/gowned civic & fest tiers ---
    if sex == 'f':
        entries.append(_irp_assemble(
            'irp_f_citizen_undertrousers', 'Citizen Woollen Under-Drawers', 'legs',
            trousers('irp_f_citizen_undertrousers', P('repgreyd', 0.06, fabric='cloth.wool.fulled'),
                     ease=0.011, ease_end=0.012, cuff=core.KNEE + 0.03, bag=0.004),
            legged=True,
        ))
        entries.append(_irp_assemble(
            'irp_f_fest_undertrousers', 'Feast-Day Linen-Wool Under-Drawers', 'legs',
            trousers('irp_f_fest_undertrousers', P('repcream', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'repred')], fabric='cloth.plain'),
                     ease=0.011, ease_end=0.012, cuff=core.KNEE + 0.03, bag=0.004),
            legged=True,
        ))

    # =======================================================================================================
    # TIER 1: `line_musketeer` — Citizen-Army Third Legion Pike-and-Shot Musketeer
    # =======================================================================================================
    gid = f'irp_{s}_musketeer_hat'
    p_musk_hat = P('irp_ironblack', 0.05, [B('bottom', 0.0, 0.014, 'solid', 'repred')], fabric='cloth.wool.fulled')
    p_musk_badge = P('repred', 0.03, [B('bottom', 0.0, 0.01, 'solid', 'brass')],
                     [PN(0.0, 1.0, 'irp_sword_triskele', 'repcream', 'repred', 0.05)])
    entries.append(_irp_assemble(
        gid, 'Third Legion Regimental Tricorne', 'head',
        _tricorne_hat(gid, P('repgreyd', 0.05, fabric='cloth.wool.fulled'), p_musk_hat, p_musk_badge, height=0.105),
        covers_hair=True,
    ))

    gid = f'irp_{s}_musketeer_coat'
    p_shinel = P('repgrey', 0.06, [
        B('top', 0.0, 0.032, 'irp_sword_triskele', 'repred', 'repgreyd', 0.05),
        B('top', 0.032, 0.040, 'solid', 'repred'),
        B('bottom', 0.0, 0.014, 'solid', 'repred'),
        B('bottom', 0.014, 0.048, 'solid', 'repgreyd'),
    ], [
        PN(0.45, 0.55, 'solid', 'repgreyd', 'repgrey', 1.0, down=core.TOP - core.WAIST - 0.01),
        PN(0.492, 0.508, 'solid', 'repred', 'repred', 1.0),
    ], fabric='cloth.wool.fulled')
    p_musk_slv = P('repgrey', 0.06, [B('bottom', 0.0, 0.045, 'solid', 'repgreyd'), B('bottom', 0.045, 0.053, 'solid', 'repred')])
    p_bando = P('leather', 0.05, [], [PN(0.0, 1.0, 'irp_berendeika_tubes', 'umber', 'leather', 0.08)], fabric='leather.polished')
    musk_body = torso_tube(gid, core.TOP, core.KNEE - 0.06, 0.024, p_shinel,
                           hang_from=core.WAIST - 0.02, flare=0.14, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    musk_sash = crossed_sash(gid + '_bandolier', p_bando, width=0.052, ease=0.030)
    musk_belt = pouch_belt(gid, P('leather', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass')]), p_leather_umb, ease=0.034)
    entries.append(_irp_assemble(
        gid, 'Third Legion Regimental Shinel, Steel Gorget & Apostle Bandolier', 'torso',
        [musk_body, gorget_guard(gid + '_gorg', p_steel, trim_paint=p_brass, ease=0.025),
         musk_sash, musk_belt,
         articulated_pauldrons(gid + '_ep', p_steel, trim_paint=p_brass, lames=2, haute_piece=False, ease=0.024),
         sleeves(gid, 'wrist', 0.019, p_musk_slv, ease_end=0.026, rows=9),
         _bandolier_charges(gid, musk_sash, 6, P('umber', 0.05, fabric='leather.cuir_bouilli'), p_brass),
         _coat_buttons(gid, musk_body, core.TOP - 0.07, core.WAIST + 0.05, n_buttons=5, paint=p_brass, double=True)],
    ))

    gid = f'irp_{s}_musketeer_knapsack'
    pk_box, pk_ctr, bk_d, pk_straps = _dorsal_pack_base(
        gid, (0.24, 0.13, 0.27),
        P('drab', 0.06, [B('top', 0.0, 0.03, 'solid', 'leather'), B('bottom', 0.0, 0.02, 'solid', 'leather')], fabric='cloth.canvas.duck.army'),
        p_leather_brn,
    )
    roll_top = tube(gid + '_blanket_roll', [pk_ctr + np.array([-0.13, 0.0, 0.145]), pk_ctr + np.array([0.13, 0.0, 0.145])],
                    0.044, P('repgrey', 0.06, [B('top', 0.0, 0.02, 'solid', 'repred')], fabric='cloth.wool.fulled'), n=12, rigid_joint='Spine2')
    kettle = blob(gid + '_kettle', pk_ctr + bk_d * 0.058 - np.array([0.0, 0.0, 0.03]), (0.095, 0.060, 0.095), p_steel, n=12, rows=5, out=bk_d, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Third Legion Marching Knapsack & Blanket-Roll', 'back', [pk_box, roll_top, kettle, pk_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_musketeer_gauntlets', 'Musketeer Buff-Cuff Trigger Gauntlets', 'gloves',
        full_gloves(f'irp_{s}_musketeer_gauntlets',
                    P('buck', 0.05, [B('top', 0.0, 0.012, 'solid', 'repred')], fabric='leather.buckskin'),
                    P('repgreyd', 0.05, fabric='leather.buckskin'), f0=0.58, ease=0.014),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_musketeer_breeches', 'Gaitered Third Legion Wool Breeches', 'legs',
        trousers(f'irp_{s}_musketeer_breeches',
                 P('repgrey', 0.06, [B('bottom', 0.0, 0.14, 'solid', 'drabd'), B('bottom', 0.14, 0.15, 'solid', 'leather')], fabric='cloth.wool.fulled'),
                 ease=0.014, ease_end=0.015, ankle_f=0.82, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_musketeer_boots', 'Third Legion Hobnailed Marching Sapogi', 'feet',
        boots(f'irp_{s}_musketeer_boots', P('irp_slagiron', 0.08),
              P('irp_ironblack', 0.05, [B('top', 0.0, 0.014, 'solid', 'repred')], fabric='leather.polished'),
              top=0.62, wraps=2, wrap_paint=p_leather_brn, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 2: `streltsy_halberdier` — `MC-02` Cantonal Streltsy Shock-Guard
    # =======================================================================================================
    gid = f'irp_{s}_streltsy_cabasset'
    cab_bowl = _open_cranial_shell(gid + '_bowl', P('irp_slagiron', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'brass')],
                                   [PN(0.0, 1.0, 'irp_fluted_steel', 'brass', 'irp_slagiron', 0.09)], fabric='metal.steel.hammered'),
                                   f_top=1.14, f_bot=0.18, f_brow_min=0.62, ease=0.018, rows=12, n=36)
    cab_fur = crown_band(gid + '_furbrim', P('darkfur', 0.12, fabric='fur.wolf'), f0=0.56, f1=0.74, ease=0.022, flare=0.014, rows=5, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    p_cb, n_cb = _anchor_on_part(cab_fur, a_h + (b_h - a_h) * 0.66 - bk_h * 0.12)
    cab_badge = rosette(gid + '_plate', p_cb - bk_h * 0.003, -bk_h, left_h, 0.026, p_brass, n=12, thick=0.010, rigid_joint='Head')
    entries.append(_irp_assemble(gid, 'Cantonal Streltsy Fur-Trimmed Iron Cabasset', 'head', [cab_bowl, cab_fur, cab_badge], covers_hair=True))

    gid = f'irp_{s}_streltsy_kaftan'
    p_kaftan = P('irp_repred_deep', 0.05, [
        B('top', 0.0, 0.035, 'solid', 'irp_ironblack'),
        B('bottom', 0.0, 0.025, 'solid', 'irp_ironblack'),
        B('bottom', 0.025, 0.095, 'irp_sword_triskele', 'repochre', 'irp_ironblack', 0.09),
    ], [
        PN(0.30, 0.70, 'irp_streltsy_frogging', 'repochre', 'irp_ironblack', 0.18, down=core.TOP - core.WAIST + 0.04),
    ], fabric='cloth.wool.fulled')
    p_kaf_slv = P('irp_repred_deep', 0.05, [B('bottom', 0.0, 0.055, 'solid', 'irp_ironblack'), B('bottom', 0.055, 0.065, 'solid', 'brass')])
    kaf_body = torso_tube(gid, core.TOP, core.KNEE - 0.12, 0.024, p_kaftan,
                          hang_from=core.WAIST - 0.02, flare=0.16, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    kaf_cuir = cuirass_plate(gid + '_cuir', p_slag, trim_paint=p_brass, style='laminar',
                             z_bot=core.WAIST + 0.01, faulds=2, ease=0.031)
    kaf_gorg = gorget_guard(gid + '_gorg', p_slag, trim_paint=p_brass, ease=0.025)
    kaf_pld = articulated_pauldrons(gid + '_pld', p_slag, trim_paint=p_brass, lames=2, haute_piece=False, ease=0.024)
    kaf_bando = crossed_sash(gid + '_berendeika', P('irp_ironblack', 0.04, [B('top', 0.0, 0.006, 'solid', 'brass')]), width=0.046, ease=0.040)
    kaf_sash = belt_sash(gid + '_sash', core.WAIST - 0.03, core.WAIST + 0.03,
                         P('irp_ironblack', 0.04, [B('top', 0.0, 0.008, 'solid', 'repochre'), B('bottom', 0.0, 0.008, 'solid', 'repochre')]), ease=0.042)
    entries.append(_irp_assemble(
        gid, 'Streltsy Frogged Kaftan, Laminar Half-Cuirass & Brass Cartridge Tubes', 'torso',
        [kaf_body, kaf_cuir, kaf_gorg, kaf_pld, kaf_bando, kaf_sash,
         sleeves(gid, 'wrist', 0.020, p_kaf_slv, ease_end=0.028, rows=9),
         _bandolier_charges(gid, kaf_bando, 7, p_brass, P('irp_repred_deep', 0.04), r_tube=0.010, len_tube=0.072)],
    ))

    gid = f'irp_{s}_streltsy_rondache'
    z_sh = 0.52 * core.CHEST + 0.48 * core.SHOULDER
    c_sh = spine_at(z_sh)
    bk_v = np.array([0.0, 1.0, 0.0], dtype=np.float64)
    h_sh = first_hit(c_sh, bk_v, bvh=core.BVH_T)
    sh_ctr = c_sh + bk_v * ((float(h_sh) if h_sh is not None else 0.11) + 0.034)
    p_rond = P('irp_slagiron', 0.04, [B('top', 0.0, 0.03, 'solid', 'brass'), B('bottom', 0.0, 0.03, 'solid', 'repred')],
               [PN(0.0, 1.0, 'irp_sword_triskele', 'repred', 'irp_slagiron', 0.18)], fabric='metal.steel.hammered')
    rond_disc = rosette(gid + '_shield', sh_ctr, bk_v, np.array([1.0, 0.0, 0.0]), 0.255, p_rond, n=28, thick=0.024, rigid_joint='Spine2')
    rond_umbo = rosette(gid + '_umbo', sh_ctr + bk_v * 0.020, bk_v, np.array([1.0, 0.0, 0.0]), 0.068, p_brass, n=16, thick=0.028, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Streltsy Dorsal Iron Rondache Shield', 'back',
                                 [rond_disc, rond_umbo, _dorsal_pad(gid, p_leather_blk, z_mid=z_sh, clearance=0.022)]))

    entries.append(_irp_assemble(
        f'irp_{s}_streltsy_gauntlets', 'Streltsy Steel-Vambrace & Soot-Leather Gauntlets', 'gloves',
        [sculpted_vambraces(f'irp_{s}_streltsy_vmb', p_slag, trim_paint=p_brass, couter=False, ease=0.020),
         full_gloves(f'irp_{s}_streltsy_gauntlets',
                     P('irp_ironblack', 0.05, [B('top', 0.0, 0.015, 'solid', 'repred')], fabric='leather.polished'),
                     p_leather_blk, f0=0.86, ease=0.015, knuckle_paint=p_brass)],
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_streltsy_breeches', 'Streltsy Piped Slate Sharovary Breeches', 'legs',
        trousers(f'irp_{s}_streltsy_breeches',
                 P('repgreyd', 0.06, [B('bottom', 0.0, 0.02, 'solid', 'repred')],
                   [PN(0.23, 0.26, 'solid', 'repred', 'repgreyd', 1.0), PN(0.74, 0.77, 'solid', 'repred', 'repgreyd', 1.0)],
                   fabric='cloth.wool.fulled'),
                 ease=0.015, ease_end=0.015, ankle_f=0.78, bag=0.010),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_streltsy_boots', 'Streltsy Brass-Heeled Muscovite Boots', 'feet',
        boots(f'irp_{s}_streltsy_boots', p_brass,
              P('irp_obsidian', 0.05, [B('top', 0.0, 0.022, 'solid', 'irp_repred_deep')], fabric='leather.polished'),
              top=0.72, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 3: `cuirassier` — Heavy Blackened-Steel Jern'knekt Three-Quarter Cuirassier
    # =======================================================================================================
    gid = f'irp_{s}_cuirassier_burgonet'
    p_burg = P('irp_slagiron', 0.03, [B('bottom', 0.0, 0.020, 'solid', 'brass')],
               [PN(0.0, 1.0, 'irp_fluted_steel', 'irp_cuirass', 'irp_slagiron', 0.08)], fabric='metal.steel.hammered')
    burg_bowl = _open_cranial_shell(gid + '_bowl', p_burg, f_top=1.14, f_bot=-0.06, f_brow_min=0.61, ease=0.018, rows=13, n=36)
    burg_comb = crest(gid + '_comb', 0.042, p_brass, rows=5, cols=15, sweep=0.02, a0=-0.82, a1=1.42, base_ease=0.014, thick=0.012, host_part=burg_bowl)
    # Raised brow peak & raised barred nasal-visor bar clearing the eyeline
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    c_br = a_h + (b_h - a_h) * 0.64
    p_vis, _ = _anchor_on_part(burg_bowl, c_br - bk_h * 0.11)
    visor_brow = tube(gid + '_visor_bar', [
        p_vis - left_h * 0.062 + bk_h * 0.018,
        p_vis - bk_h * 0.024 + up_h * 0.008,
        p_vis + left_h * 0.062 + bk_h * 0.018,
    ], 0.0075, p_brass, n=8, rigid_joint='Head')
    nasal_bar = tube(gid + '_nasal_bar', [
        p_vis - bk_h * 0.022 + up_h * 0.024,
        p_vis - bk_h * 0.026 - up_h * 0.036,
    ], 0.0048, p_steel, n=8, rigid_joint='Head')
    entries.append(_irp_assemble(gid, 'Jern-Knekt Lobster-Tail Barred Shishak Burgonet', 'head',
                                 [burg_bowl, burg_comb, visor_brow, nasal_bar], covers_hair=True))

    gid = f'irp_{s}_cuirassier_plate'
    p_buff = leathery(P('buck', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'repred')], fabric='leather.buckskin'))
    p_plate = P('irp_slagiron', 0.03, [
        B('top', 0.0, 0.022, 'solid', 'brass'),
        B('bottom', 0.0, 0.022, 'solid', 'brass'),
    ], [
        PN(0.0, 1.0, 'irp_fluted_steel', 'irp_cuirass', 'irp_slagiron', 0.12),
    ], fabric='metal.steel.hammered')
    cuir_parts = cuirass_plate(gid + '_cuirass', p_plate, trim_paint=p_brass,
                               style='gothic', keel=0.020, faulds=3, ease=0.024)
    cuir_gorg = gorget_guard(gid + '_gorg', p_plate, trim_paint=p_brass, ease=0.024)
    cuir_pld = articulated_pauldrons(gid + '_pld', p_plate, trim_paint=p_brass,
                                     lames=3, haute_piece=True, ease=0.024)
    p_boss_pt, n_boss = _anchor_on_part(cuir_parts[0], chest_front(core.CHEST + 0.03, 0.05))
    sternum_boss = rosette(gid + '_triskelion_boss', p_boss_pt + n_boss * 0.003, n_boss, np.array([1.0, 0.0, 0.0]),
                           0.042, P('brass', 0.02, [], [PN(0.0, 1.0, 'irp_sword_triskele', 'repred', 'brass', 0.08)], fabric='metal.bronze'),
                           n=16, thick=0.014, rigid_joint='Spine2')
    cuir_belt = belt_sash(gid + '_belt', core.WAIST - 0.022, core.WAIST + 0.028,
                          P('irp_repred_deep', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')]), ease=0.035)
    # Twin pistol holsters anchored on waist sash
    p_hol_l, n_hol_l = _anchor_on_part(cuir_belt, surface_out(spine_at(core.WAIST - 0.01), np.array([0.75, -0.65, 0.0]), 0.05))
    p_hol_r, n_hol_r = _anchor_on_part(cuir_belt, surface_out(spine_at(core.WAIST - 0.01), np.array([-0.75, -0.65, 0.0]), 0.05))
    hol_l = blob(gid + '_holster_L', p_hol_l + n_hol_l * 0.008, (0.052, 0.042, 0.115), p_leather_blk, out=n_hol_l, role='accessory')
    hol_r = blob(gid + '_holster_R', p_hol_r + n_hol_r * 0.008, (0.052, 0.042, 0.115), p_leather_blk, out=n_hol_r, role='accessory')
    entries.append(_irp_assemble(
        gid, 'Sculpted Gothic Blackened-Steel Cuirass, Articulated Pauldrons & Pistol Belt', 'torso',
        [cuir_parts, cuir_gorg, cuir_pld, sternum_boss, cuir_belt, hol_l, hol_r,
         sleeves(gid, 'wrist', 0.019, p_buff, ease_end=0.025, rows=9)],
    ))

    entries.append(_irp_assemble(
        f'irp_{s}_cuirassier_cape', 'Cuirassier Crimson-Lined Pelisse Mantle', 'back',
        [cape(f'irp_{s}_cuirassier_cape', core.WAIST + 0.04,
              P('irp_ironblack', 0.04, [B('bottom', 0.0, 0.022, 'solid', 'repred'), B('top', 0.0, 0.018, 'solid', 'brass')], fabric='cloth.wool.fulled'),
              span=0.50, ease=0.026, flare=0.10, stiff=0.36, back_push=0.055)],
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_cuirassier_gauntlets', 'Articulated Blackened-Steel Vambraces & Cavalry Gauntlets', 'gloves',
        [sculpted_vambraces(f'irp_{s}_cuir_vmb', p_plate, trim_paint=p_brass, couter=True, ease=0.021),
         full_gloves(f'irp_{s}_cuirassier_gauntlets', p_plate, p_steel, finger_paint=p_leather_blk, f0=0.86, ease=0.015, knuckle_paint=p_brass)],
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_cuirassier_breeches', 'Cavalry Breeches & Hinged Blackened-Steel Tassets', 'legs',
        [trousers(f'irp_{s}_cuirassier_breeches',
                  P('repgreyd', 0.05, [B('bottom', 0.0, 0.03, 'solid', 'buck')], fabric='leather.buckskin'),
                  ease=0.014, ease_end=0.014, ankle_f=0.76, bag=0.008),
         hinged_tassets(f'irp_{s}_cuir_tas', p_plate, trim_paint=p_brass, lames=4, ease=0.026)],
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_cuirassier_boots', 'Sculpted Steel Greaves, Knee-Poleyns & Cuirassier Jackboots', 'feet',
        [boots(f'irp_{s}_cuirassier_boots', p_brass,
               P('irp_ironblack', 0.04, [B('top', 0.0, 0.020, 'solid', 'irp_cuirass')], fabric='leather.polished'),
               top=0.26, ease_top=0.022),
         sculpted_greaves(f'irp_{s}_cuir_grv', p_plate, trim_paint=p_brass, poleyn=True, ease=0.025)],
    ))

    # =======================================================================================================
    # TIER 4: `artillerist_rocketeer` — Roketstad Rocket-Corps Artillerist
    # =======================================================================================================
    gid = f'irp_{s}_rocketeer_visor_cap'
    rk_cap = _open_cranial_shell(gid + '_cap', P('irp_obsidian', 0.06, [B('bottom', 0.0, 0.016, 'solid', 'repred')], fabric='leather.cuir_bouilli'),
                                 f_top=1.14, f_bot=0.22, f_brow_min=0.61, ease=0.018, rows=11, n=36)
    rk_goggles = _brow_goggles(gid, rk_cap, p_brass, P('irp_amber_lens', 0.02, fabric='metal.gold'), f_level=0.70)
    entries.append(_irp_assemble(gid, 'Rocket-Corps Leather Cap & Brass Smoked Blast-Visor', 'head', [rk_cap, rk_goggles], covers_hair=True))

    gid = f'irp_{s}_rocketeer_apron'
    p_mundir = P('irp_ironblack', 0.05, [B('top', 0.0, 0.028, 'solid', 'repred'), B('bottom', 0.0, 0.015, 'solid', 'repred')], fabric='cloth.wool.fulled')
    p_blast_apron = leathery(P('irp_pigskin', 0.06, [
        B('top', 0.0, 0.018, 'solid', 'brass'),
        B('bottom', 0.0, 0.022, 'solid', 'irp_obsidian'),
    ], fabric='leather.foundry.pigskin'))
    rk_uni = torso_tube(gid + '_mundir', core.TOP, core.CROTCH - 0.14, 0.036, p_mundir,
                        hang_from=core.WAIST - 0.02, flare=0.15, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    rk_apron = tabard(gid + '_apron', core.KNEE + 0.06, core.CHEST + 0.05, p_blast_apron, width=0.24, ease=0.042, front=True, back=False)
    rk_belt = pouch_belt(gid, P('irp_obsidian', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass')]), p_leather_umb, ease=0.050)
    p_qd, n_qd = _anchor_on_part(rk_apron[0], chest_front(core.CHEST + 0.01, 0.050))
    rk_quad = rosette(gid + '_quadrant', p_qd + n_qd * 0.004, n_qd, np.array([1.0, 0.0, 0.0]), 0.034, p_brass, n=14, thick=0.012, rigid_joint='Spine2')
    entries.append(_irp_assemble(
        gid, 'Rocket-Corps Scorched Soot-Leather Apron over Slate Uniform', 'torso',
        [rk_uni, stand_collar(gid, p_mundir, high=0.034), rk_apron, rk_belt, rk_quad,
         sleeves(gid, 'wrist', 0.019, P('repgreyd', 0.05, [B('bottom', 0.0, 0.04, 'solid', 'irp_ironblack'), B('bottom', 0.04, 0.048, 'solid', 'repred')]),
                 ease_end=0.026, rows=9)],
    ))

    gid = f'irp_{s}_rocketeer_quiver'
    rk_box, rk_ctr, bk_d, rk_straps = _dorsal_pack_base(gid, (0.21, 0.10, 0.28), p_slag, p_leather_blk)
    rk_tubes = []
    for k_t, x_off in enumerate((-0.062, 0.0, 0.062)):
        t_bot = rk_ctr + bk_d * 0.042 + np.array([x_off, 0.0, -0.13])
        t_top = rk_ctr + bk_d * 0.042 + np.array([x_off, 0.0, 0.17])
        rk_tubes.append(tube(f'{gid}_rktube_{k_t}', [t_top, t_bot], 0.025, p_slag, n=10, rigid_joint='Spine2'))
        rk_tubes.append(horn(f'{gid}_warhead_{k_t}', [t_top, t_top + np.array([0.0, 0.0, 0.075])], 0.024, 0.004,
                             P('repred', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='metal.iron'), n=10, rows=5, rigid_joint='Spine2'))
    entries.append(_irp_assemble(gid, 'Roketstad Dorsal Three-Tube Spin-Rocket Quiver', 'back', [rk_box, rk_tubes, rk_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_rocketeer_mitts', 'Scorch-Proof Pigskin Artillery Heat-Mitts', 'gloves',
        full_gloves(f'irp_{s}_rocketeer_mitts', p_blast_apron, p_blast_apron, f0=0.54, ease=0.015, knuckle_paint=p_brass),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_rocketeer_breeches', 'Soot-Slate Artillery Battery Breeches', 'legs',
        trousers(f'irp_{s}_rocketeer_breeches',
                 P('repgreyd', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'repred')], fabric='cloth.wool.fulled'),
                 ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_rocketeer_boots', 'Reinforced Felt-and-Leather Battery Boots', 'feet',
        boots(f'irp_{s}_rocketeer_boots', p_leather_blk,
              P('felt', 0.08, [B('top', 0.0, 0.018, 'solid', 'repred'), B('bottom', 0.0, 0.08, 'solid', 'irp_ironblack')], fabric='cloth.felt.boiled'),
              top=0.68, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 5: `tunnel_sapper` — Cut / Lipp Alpine Miner-Engineer
    # =======================================================================================================
    gid = f'irp_{s}_sapper_casque'
    sap_dome = _open_cranial_shell(gid + '_dome', p_slag, f_top=1.14, f_bot=0.10, f_brow_min=0.60, ease=0.018, rows=11, n=36)
    sap_brim = brim(gid + '_brim', 0.62, 0.048, P('irp_slagiron', 0.04, [B('bottom', 0.0, 0.012, 'solid', 'brass')], fabric='metal.steel.hammered'),
                    ease=0.018, rows=4, n=38, droop=0.016)
    sap_face = sculpted_faceplate(gid + '_visor', p_slag, f_top=0.66, f_bot=-0.02, ease=0.014, span=0.44, rows=14, cols=23)
    # Proud +4mm dark eye-slit tubes + nasal bar + forehead brass carbide/electric bullseye lamp!
    a_h, b_h, up_h, bk_h, left_h, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    z_eye_s = float(a_h[2]) + f_eyes * float(np.linalg.norm(b_h - a_h))
    slit_parts = []
    for tag, sgn in (('L', 1.0), ('R', -1.0)):
        p_in, _ = _anchor_on_part(sap_face, np.array([sgn * 0.014, -0.12, z_eye_s]))
        p_out, _ = _anchor_on_part(sap_face, np.array([sgn * 0.044, -0.11, z_eye_s]))
        slit_parts.append(tube(f'{gid}_slit_{tag}', [p_in - bk_h * 0.005, p_out - bk_h * 0.005], 0.0048,
                               P('irp_dark_slit', 0.01), n=8, rigid_joint='Head'))
    p_nb_t, _ = _anchor_on_part(sap_face, np.array([0.0, -0.13, z_eye_s + 0.018]))
    p_nb_b, _ = _anchor_on_part(sap_face, np.array([0.0, -0.13, z_eye_s - 0.034]))
    slit_parts.append(tube(f'{gid}_nasal', [p_nb_t - bk_h * 0.005, p_nb_b - bk_h * 0.005], 0.0045, p_brass, n=8, rigid_joint='Head'))
    # Forehead bullseye lamp
    p_lamp, _ = _anchor_on_part(sap_dome, a_h + (b_h - a_h) * 0.78 - bk_h * 0.12)
    lamp_housing = rosette(gid + '_lamp', p_lamp - bk_h * 0.008, -bk_h, left_h, 0.028, p_brass, n=14, thick=0.022, rigid_joint='Head')
    lamp_lens = rosette(gid + '_lamp_lens', p_lamp - bk_h * 0.018, -bk_h, left_h, 0.018,
                        P('irp_amber_lens', 0.01, fabric='metal.gold'), n=12, thick=0.010, rigid_joint='Head')
    entries.append(_irp_assemble(gid, 'Alpine Sapper Riveted Lamp-Casque & Splinter Visor', 'head',
                                 [sap_dome, sap_brim, sap_face, slit_parts, lamp_housing, lamp_lens],
                                 covers_hair=True, covers_face=True))

    gid = f'irp_{s}_sapper_jerkin'
    p_vatnik = P('drabd', 0.06, [
        B('top', 0.0, 0.026, 'solid', 'irp_obsidian'),
        B('bottom', 0.0, 0.022, 'solid', 'leather'),
    ], [
        PN(0.0, 1.0, 'irp_vatnik_rib', 'umber', 'drabd', 0.14),
    ], fabric='cloth.quilted.channel')
    p_sap_slab = P('irp_slagiron', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'brass')],
                   [PN(0.25, 0.75, 'stencil:08', 'repcream', 'irp_slagiron', 0.12)], fabric='metal.steel.hammered')
    sap_cuir = cuirass_plate(gid + '_cuir', p_sap_slab, trim_paint=p_brass, style='laminar', faulds=2, ease=0.024)
    sap_gorg = gorget_guard(gid + '_gorg', p_sap_slab, trim_paint=p_brass, ease=0.024)
    sap_pld = articulated_pauldrons(gid + '_pld', p_sap_slab, trim_paint=p_brass, lames=2, haute_piece=True, ease=0.023)
    sap_bando = crossed_sash(gid + '_tool_band', p_leather_umb, width=0.048, ease=0.034)
    sap_belt = pouch_belt(gid, p_leather_blk, p_leather_umb, ease=0.036)
    entries.append(_irp_assemble(
        gid, 'Sapper Slab-Iron Siege Cuirass, Gorget & Tool Bandolier', 'torso',
        [sap_cuir, sap_gorg, sap_pld, sap_bando, sap_belt,
         sleeves(gid, 'wrist', 0.020, p_vatnik, ease_end=0.026, rows=9)],
    ))

    gid = f'irp_{s}_sapper_petard_rig'
    sp_keg, sp_ctr, bk_d, sp_straps = _dorsal_pack_base(
        gid, (0.20, 0.15, 0.25),
        P('umber', 0.06, [B('top', 0.05, 0.08, 'solid', 'irp_slagiron'), B('bottom', 0.05, 0.08, 'solid', 'irp_slagiron')], fabric='leather.cuir_bouilli'),
        p_leather_blk,
    )
    pick_haft = tube(gid + '_pick_haft', [sp_ctr + bk_d * 0.065 + np.array([-0.08, 0.0, 0.20]),
                                          sp_ctr + bk_d * 0.065 + np.array([0.08, 0.0, -0.18])],
                     0.015, P('saddle', 0.05), n=8, rigid_joint='Spine2')
    pick_head = horn(gid + '_pick_head', [sp_ctr + bk_d * 0.072 + np.array([-0.19, 0.0, 0.16]),
                                          sp_ctr + bk_d * 0.072 + np.array([-0.07, 0.0, 0.19]),
                                          sp_ctr + bk_d * 0.072 + np.array([0.05, 0.0, 0.15])],
                     0.018, 0.005, p_slag, n=8, rows=7, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Sapper Dorsal Petard-Keg & Pickaxe Rig', 'back', [sp_keg, pick_haft, pick_head, sp_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_sapper_gloves', 'Slab-Iron Sapper Vambraces & Work Gauntlets', 'gloves',
        [sculpted_vambraces(f'irp_{s}_sap_vmb', p_slag, trim_paint=p_brass, couter=True, ease=0.020),
         full_gloves(f'irp_{s}_sapper_gloves', p_leather_umb, p_leather_blk, f0=0.86, ease=0.014, knuckle_paint=p_slag)],
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_sapper_trousers', 'Knee-Plated Sapper Canvas-Wool Trousers', 'legs',
        trousers(f'irp_{s}_sapper_trousers',
                 P('drabd', 0.06, [B('bottom', 0.28, 0.42, 'solid', 'irp_slagiron')], fabric='cloth.canvas.duck.army'),
                 ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_sapper_boots', 'Slab-Iron Greaved Tunnel Siege Boots', 'feet',
        [boots(f'irp_{s}_sapper_boots', p_slag,
               P('irp_ironblack', 0.06, [B('bottom', 0.0, 0.04, 'solid', 'irp_slagiron')], fabric='leather.cuir_bouilli'),
               top=0.26, ease_top=0.022),
         sculpted_greaves(f'irp_{s}_sap_grv', p_slag, trim_paint=p_brass, poleyn=True, ease=0.025)],
    ))

    # =======================================================================================================
    # TIER 6: `foundry_smelter` — Bessemer Blast-Furnace Worker
    # =======================================================================================================
    gid = f'irp_{s}_smelter_hood'
    sm_hood = hood(gid + '_hood', P('repgreyd', 0.07, [B('bottom', 0.0, 0.016, 'solid', 'irp_pigskin')], fabric='cloth.felt.boiled'),
                   ease=0.024, ease_low=0.036, open_front=0.92, low=-0.22)
    sm_gog = _brow_goggles(gid, sm_hood, p_brass, P('irp_dark_slit', 0.02, fabric='metal.iron'), f_level=0.71)
    entries.append(_irp_assemble(gid, 'Bessemer Spark-Hood & Dark Slag-Goggles', 'head', [sm_hood, sm_gog], covers_hair=True))

    gid = f'irp_{s}_smelter_apron'
    p_rubakha = P('repgrey', 0.06, [B('top', 0.0, 0.02, 'solid', 'repgreyd')], fabric='cloth.cotton.coarse')
    p_sm_hide = leathery(P('irp_pigskin', 0.07, [B('top', 0.0, 0.018, 'solid', 'copper'), B('bottom', 0.0, 0.025, 'solid', 'irp_obsidian')],
                           fabric='leather.foundry.pigskin'))
    sm_shirt = torso_tube(gid + '_shirt', core.TOP, core.CROTCH - 0.08, 0.024, p_rubakha,
                          hang_from=core.WAIST - 0.02, flare=0.10, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    sm_apron = torso_tube(gid + '_apron', core.CHEST + 0.04, core.KNEE + 0.04, 0.032, p_sm_hide,
                          hang_from=core.WAIST - 0.02, flare=0.14, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    sm_strap = crossed_sash(gid + '_neckstrap', p_leather_umb, width=0.038, ease=0.036)
    sm_belt = belt_sash(gid + '_belt', core.WAIST - 0.025, core.WAIST + 0.025,
                        P('irp_obsidian', 0.05, [B('top', 0.0, 0.008, 'solid', 'copper')]), ease=0.038)
    entries.append(_irp_assemble(
        gid, 'Heavy Split-Hide Blast-Furnace Smelter Apron & Spark-Pauldron', 'torso',
        [sm_shirt, sm_apron, sm_strap, sm_belt,
         pauldron(gid + '_spark_pld', R, p_slag, reach=0.34, ease=0.025),
         sleeves(gid, 'wrist', 0.019, p_rubakha, ease_end=0.024, rows=9)],
    ))

    gid = f'irp_{s}_smelter_tongs_rack'
    sm_hod, sm_ctr, bk_d, sm_straps = _dorsal_pack_base(gid, (0.23, 0.13, 0.27), p_slag, p_leather_umb)
    tong_1 = tube(gid + '_tong_a', [sm_ctr + bk_d * 0.062 + np.array([-0.07, 0.0, 0.21]),
                                    sm_ctr + bk_d * 0.062 + np.array([0.07, 0.0, -0.17])], 0.012, p_slag, n=8, rigid_joint='Spine2')
    tong_2 = tube(gid + '_tong_b', [sm_ctr + bk_d * 0.072 + np.array([0.07, 0.0, 0.21]),
                                    sm_ctr + bk_d * 0.072 + np.array([-0.07, 0.0, -0.17])], 0.012, p_slag, n=8, rigid_joint='Spine2')
    ingot = blob(gid + '_ingot', sm_ctr + np.array([0.0, 0.0, 0.145]), (0.14, 0.07, 0.06),
                 P('copper', 0.04, fabric='metal.bronze'), n=10, rows=5, out=bk_d, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Smelter Sheet-Iron Ingot-Hod & Crucible-Tongs Rack', 'back',
                                 [sm_hod, tong_1, tong_2, ingot, sm_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_smelter_mitts', 'Asbestos-Canvas & Split-Hide Foundry Mitts', 'gloves',
        full_gloves(f'irp_{s}_smelter_mitts',
                    P('ash', 0.07, [B('top', 0.0, 0.02, 'solid', 'irp_pigskin')], fabric='cloth.canvas.duck.army'),
                    p_sm_hide, f0=0.52, ease=0.016),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_smelter_trousers', 'Smelter Soot-Canvas Furnace Trousers', 'legs',
        trousers(f'irp_{s}_smelter_trousers', P('repgreyd', 0.06, [B('bottom', 0.0, 0.06, 'solid', 'irp_pigskin')], fabric='cloth.canvas.duck.army'),
                 ease=0.014, ease_end=0.015, ankle_f=0.82, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_smelter_clogs', 'Iron-Shod Wooden-Sole Foundry Clogs', 'feet',
        boots(f'irp_{s}_smelter_clogs', P('bark', 0.08, [B('bottom', 0.0, 0.01, 'solid', 'irp_slagiron')]),
              p_sm_hide, top=0.42, ease_top=0.024),
    ))

    # =======================================================================================================
    # TIER 7: `hydro_miller` — Cascade Waterwheel & Canal-Lock Machinist
    # =======================================================================================================
    gid = f'irp_{s}_hydro_flatcap'
    hy_cap = tower_hat(gid + '_crown', 0.068, lambda t: 1.06 - 0.10 * t,
                       P('irp_steel', 0.05, [B('top', 0.0, 0.012, 'solid', 'brass')], fabric='cloth.canvas.oiled'),
                       f=0.64, ease=0.013, rows=6, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    c_fc = a_h + (b_h - a_h) * 0.63
    # Front visor peak
    angs_v = np.linspace(0.68 * math.pi, 1.32 * math.pi, 17)
    Qv = []
    for kr in range(4):
        sv = kr / 3.0
        row_v = []
        for av in angs_v:
            dv = bk_h * math.cos(av) + left_h * math.sin(av)
            hv = first_hit(c_fc, dv)
            rv = (float(hv) if hv is not None else 0.096) + 0.013 + sv * 0.048 * math.sin(math.pi * (av - 0.68 * math.pi) / (0.64 * math.pi))
            row_v.append(c_fc + dv * rv - up_h * (0.010 * sv))
        Qv.append(row_v)
    hy_peak = Part(gid + '_visor', np.array(Qv), False, ['body'] * 4, p_leather_blk, rigid_joint='Head')
    p_wh, _ = _anchor_on_part(hy_cap, c_fc - bk_h * 0.11 + up_h * 0.025)
    hy_badge = rosette(gid + '_wheel_badge', p_wh - bk_h * 0.003, -bk_h, left_h, 0.018, p_brass, n=12, thick=0.008, rigid_joint='Head')
    entries.append(_irp_assemble(gid, 'Oiled-Cloth Canal Machinist Flatcap', 'head', [hy_cap, hy_peak, hy_badge], covers_hair=True))

    gid = f'irp_{s}_hydro_waistcoat'
    p_oil_vest = P('irp_steel', 0.05, [
        B('top', 0.0, 0.024, 'solid', 'irp_ironblack'),
        B('bottom', 0.0, 0.020, 'solid', 'repred'),
    ], [
        PN(0.46, 0.54, 'solid', 'irp_ironblack', 'irp_steel', 1.0),
    ], fabric='cloth.canvas.oiled')
    p_rolled_shirt = P('linen', 0.06, [
        B('bottom', 0.0, 0.16, 'solid', 'linen'),
        B('bottom', 0.16, 0.18, 'solid', 'repgrey'),
    ], fabric='cloth.plain')
    hy_vest = torso_tube(gid, core.TOP, core.CROTCH - 0.09, 0.032, p_oil_vest,
                         hang_from=core.WAIST - 0.02, flare=0.12, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    hy_belt = pouch_belt(gid, p_leather_blk, p_leather_brn, ease=0.036)
    entries.append(_irp_assemble(
        gid, 'Brass-Buttoned Navy Oiled-Canvas Waistcoat & Rolled-Cuff Shirt', 'torso',
        [hy_vest, stand_collar(gid, P('linen', 0.05), high=0.028), hy_belt,
         sleeves(gid, 'wrist', 0.018, p_rolled_shirt, ease_end=0.022, rows=9),
         _coat_buttons(gid, hy_vest, core.TOP - 0.06, core.WAIST + 0.04, n_buttons=5, paint=p_brass, double=False)],
    ))

    gid = f'irp_{s}_hydro_satchel'
    hy_box, hy_ctr, bk_d, hy_straps = _dorsal_pack_base(
        gid, (0.23, 0.12, 0.24),
        P('irp_steel', 0.05, [B('top', 0.0, 0.03, 'solid', 'leather')], fabric='cloth.oilskin.tarred_seams'),
        p_leather_blk,
    )
    hy_gauge = rosette(gid + '_pressure_gauge', hy_ctr + bk_d * 0.058 + np.array([0.05, 0.0, 0.04]), bk_d, np.array([1.0, 0.0, 0.0]),
                       0.038, p_brass, n=14, thick=0.018, rigid_joint='Spine2')
    hy_wrench = tube(gid + '_gear_wrench', [hy_ctr + bk_d * 0.055 + np.array([-0.07, 0.0, 0.18]),
                                            hy_ctr + bk_d * 0.055 + np.array([-0.05, 0.0, -0.15])],
                     0.013, p_steel, n=8, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Machinist Gear-Wrench & Pressure-Gauge Satchel', 'back', [hy_box, hy_gauge, hy_wrench, hy_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_hydro_cuffs', 'Oiled-Leather Machinist Wrist Cuffs & Gloves', 'gloves',
        full_gloves(f'irp_{s}_hydro_cuffs', p_leather_brn, p_leather_blk, f0=0.60, ease=0.014),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_hydro_trousers', 'Waterproofed Penstock Work Trousers', 'legs',
        trousers(f'irp_{s}_hydro_trousers', P('repgreyd', 0.05, fabric='cloth.canvas.oiled'),
                 ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_hydro_boots', 'Vulcanized-Sole Cataract Lock Boots', 'feet',
        boots(f'irp_{s}_hydro_boots', P('irp_rubber', 0.05, fabric='rubber.tyre'),
              P('irp_obsidian', 0.05, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='cloth.oilskin.tarred_seams'),
              top=0.74, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 8: `optician_clockmaker` — Astronomers' & Opticians' Guild Master ("The Raja's Eye" Quest!)
    # =======================================================================================================
    gid = f'irp_{s}_optician_loupe_band'
    opt_band = crown_band(gid + '_band', P('brass', 0.03, [B('bottom', 0.0, 0.008, 'solid', 'irp_ironblack')], fabric='metal.bronze'),
                          f0=0.58, f1=0.69, ease=0.004, flare=0.003, rows=5, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    c_op = a_h + (b_h - a_h) * 0.635
    loupe_parts = [opt_band]
    for idx_l, (ang_off, rad_l) in enumerate(((-0.26, 0.022), (0.0, 0.026), (0.26, 0.019))):
        d_l = -bk_h * math.cos(ang_off) + left_h * math.sin(ang_off)
        d_l /= np.linalg.norm(d_l)
        p_l, _ = _anchor_on_part(opt_band, c_op + d_l * 0.105)
        loupe_parts.append(rosette(f'{gid}_loupe_bezel_{idx_l}', p_l + d_l * 0.004, d_l, left_h, rad_l, p_brass, n=14, thick=0.014, rigid_joint='Head'))
        loupe_parts.append(rosette(f'{gid}_loupe_glass_{idx_l}', p_l + d_l * 0.010, d_l, left_h, rad_l * 0.68,
                                   P('moonglass', 0.02, fabric='glass.moonglass.leaded'), n=12, thick=0.008, rigid_joint='Head'))
    entries.append(_irp_assemble(gid, 'Articulated Stahlborn Brass Multi-Loupe Headband', 'head', loupe_parts, covers_hair=False))

    gid = f'irp_{s}_optician_frock'
    p_frock = P('irp_saxon_green', 0.04, [
        B('top', 0.0, 0.028, 'solid', 'irp_ironblack'),
        B('bottom', 0.0, 0.016, 'solid', 'brass'),
        B('bottom', 0.016, 0.055, 'rose', 'repochre', 'irp_ironblack', 0.08),
    ], [
        PN(0.45, 0.55, 'solid', 'repgreyd', 'irp_saxon_green', 1.0, down=core.TOP - core.WAIST),
        PN(0.493, 0.507, 'solid', 'brass', 'brass', 1.0),
    ], fabric='cloth.wool.fulled')
    opt_body = torso_tube(gid, core.TOP, core.KNEE - 0.04, 0.024, p_frock,
                          hang_from=core.WAIST - 0.02, flare=0.14, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    opt_belt = pouch_belt(gid, P('irp_ironblack', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')]), p_brass, ease=0.032)
    p_ch, n_ch = _anchor_on_part(opt_body, chest_front(core.CHEST + 0.02, 0.030, x=0.045))
    opt_chrono = rosette(gid + '_chronometer', p_ch + n_ch * 0.003, n_ch, np.array([1.0, 0.0, 0.0]), 0.028, p_brass, n=14, thick=0.010, rigid_joint='Spine2')
    entries.append(_irp_assemble(
        gid, 'Opticians-Guild Slate-Green Frock-Coat & Caliper Pocket-Belt', 'torso',
        [opt_body, stand_collar(gid, P('irp_ironblack', 0.03, [B('top', 0.0, 0.008, 'solid', 'brass')]), high=0.034),
         opt_belt, opt_chrono,
         sleeves(gid, 'wrist', 0.018, P('irp_saxon_green', 0.04, [B('bottom', 0.0, 0.045, 'solid', 'irp_ironblack'), B('bottom', 0.045, 0.053, 'solid', 'brass')]),
                 ease_end=0.025, rows=9),
         _coat_buttons(gid, opt_body, core.TOP - 0.07, core.WAIST + 0.04, n_buttons=5, paint=p_brass, double=True)],
    ))

    gid = f'irp_{s}_optician_astrolabe_pack'
    op_box, op_ctr, bk_d, op_straps = _dorsal_pack_base(
        gid, (0.20, 0.11, 0.28),
        P('saddle', 0.04, [B('top', 0.0, 0.025, 'solid', 'brass'), B('bottom', 0.0, 0.025, 'solid', 'brass')], fabric='leather.cuir_bouilli'),
        p_leather_blk,
    )
    tel_tube = tube(gid + '_rajas_eye_tube', [op_ctr + np.array([0.09, 0.0, 0.21]), op_ctr + np.array([0.09, 0.0, -0.17])],
                    0.034, p_brass, n=12, rigid_joint='Spine2')
    astro_disc = rosette(gid + '_astrolabe', op_ctr + bk_d * 0.056, bk_d, np.array([1.0, 0.0, 0.0]), 0.095, p_brass, n=20, thick=0.014, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Brass Astrolabe & Rajas-Eye Refractor Lens Case', 'back', [op_box, tel_tube, astro_disc, op_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_optician_gloves', 'Fine Chamois Kidskin Lens-Polishing Gloves', 'gloves',
        full_gloves(f'irp_{s}_optician_gloves',
                    P('repcream', 0.04, [B('top', 0.0, 0.012, 'solid', 'brass')], fabric='leather.buckskin'),
                    P('repcream', 0.04, fabric='leather.buckskin'), f0=0.64, ease=0.013),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_optician_breeches', 'Tailored Guild Breeches & Brass Knee-Buckles', 'legs',
        trousers(f'irp_{s}_optician_breeches',
                 P('irp_ironblack', 0.04, [B('bottom', 0.34, 0.37, 'solid', 'brass'), B('bottom', 0.0, 0.34, 'solid', 'repgrey')], fabric='cloth.wool.fulled'),
                 ease=0.013, ease_end=0.014, ankle_f=0.84, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_optician_shoes', 'Polished Saxon Brass-Buckled Guild Shoes', 'feet',
        boots(f'irp_{s}_optician_shoes', p_leather_blk,
              P('irp_ironblack', 0.04, [B('top', 0.0, 0.018, 'solid', 'brass')], fabric='leather.polished'),
              top=0.34, ease_top=0.022),
    ))

    # =======================================================================================================
    # TIER 9: `alchemist_pyro` — State Saltpeter & Acid Chemist (100% Procedural!)
    # =======================================================================================================
    gid = f'irp_{s}_alchemist_mask'
    al_hood = hood(gid + '_hood', P('oxblood', 0.05, [B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='leather.cuir_bouilli'),
                   ease=0.024, ease_low=0.036, open_front=0.82, low=-0.24)
    al_face = sculpted_faceplate(gid + '_mask', P('irp_rubber', 0.05, fabric='leather.cuir_bouilli'),
                                 f_top=0.72, f_bot=-0.04, ease=0.013, span=0.45, rows=15, cols=23)
    a_h, b_h, up_h, bk_h, left_h, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    z_eye_a = float(a_h[2]) + f_eyes * float(np.linalg.norm(b_h - a_h))
    al_mask_parts = [al_hood, al_face]
    # Proud +5mm brass goggle rims & amber-dark lenses over eyes
    for tag, sgn in (('L', 1.0), ('R', -1.0)):
        p_eg, _ = _anchor_on_part(al_face, np.array([sgn * x_eye, -0.13, z_eye_a]))
        al_mask_parts.append(rosette(f'{gid}_eye_rim_{tag}', p_eg - bk_h * 0.005, -bk_h, left_h, 0.022, p_brass, n=14, thick=0.012, rigid_joint='Head'))
        al_mask_parts.append(rosette(f'{gid}_eye_lens_{tag}', p_eg - bk_h * 0.010, -bk_h, left_h, 0.015,
                                     P('irp_amber_lens', 0.02, fabric='metal.gold'), n=12, thick=0.008, rigid_joint='Head'))
    # Beaked brass-and-leather fume respirator snout + twin cheek filter canisters anchored to faceplate
    p_snout, _ = _anchor_on_part(al_face, np.array([0.0, -0.14, z_eye_a - 0.032]))
    al_mask_parts.append(horn(gid + '_beak', [
        p_snout + bk_h * 0.004,
        p_snout - bk_h * 0.048 - up_h * 0.018,
        p_snout - bk_h * 0.092 - up_h * 0.042,
    ], 0.032, 0.010, P('brass', 0.04, [B('top', 0.0, 0.03, 'solid', 'irp_rubber')], fabric='metal.bronze'), n=12, rows=7, rigid_joint='Head'))
    for tag, sgn in (('L', 1.0), ('R', -1.0)):
        p_cn, _ = _anchor_on_part(al_face, np.array([sgn * 0.042, -0.11, z_eye_a - 0.048]))
        d_cn = -bk_h * 0.55 + left_h * (sgn * 0.75) - up_h * 0.35
        d_cn /= np.linalg.norm(d_cn)
        al_mask_parts.append(tube(f'{gid}_canister_{tag}', [p_cn - d_cn * 0.004, p_cn + d_cn * 0.042], 0.018, p_brass, n=10, rigid_joint='Head'))
    entries.append(_irp_assemble(gid, 'Beaked Brass-and-Leather Saltpeter Fume Mask', 'head', al_mask_parts,
                                 covers_hair=True, covers_face=True))

    gid = f'irp_{s}_alchemist_coat'
    p_al_coat = P('irp_rubber', 0.05, [
        B('top', 0.0, 0.030, 'solid', 'oxblood'),
        B('bottom', 0.0, 0.025, 'solid', 'oxblood'),
        B('bottom', 0.025, 0.033, 'solid', 'brass'),
    ], [
        PN(0.45, 0.55, 'solid', 'oxblood', 'irp_rubber', 1.0),
    ], fabric='cloth.oiled.alkali')
    al_body = torso_tube(gid, core.TOP, core.KNEE - 0.14, 0.025, p_al_coat,
                         hang_from=core.WAIST - 0.02, flare=0.16, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    al_bando = crossed_sash(gid + '_vial_bandolier', P('oxblood', 0.05, fabric='leather.cuir_bouilli'), width=0.050, ease=0.031)
    al_belt = pouch_belt(gid, P('oxblood', 0.05, [B('top', 0.0, 0.008, 'solid', 'brass')]), p_leather_blk, ease=0.034)
    entries.append(_irp_assemble(
        gid, 'Acid-Proofed Waxed Rubberized Coat & Glass-Vial Bandolier', 'torso',
        [al_body, stand_collar(gid, P('oxblood', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass')]), high=0.036),
         al_bando, al_belt,
         sleeves(gid, 'wrist', 0.019, P('irp_rubber', 0.05, [B('bottom', 0.0, 0.05, 'solid', 'oxblood')]), ease_end=0.026, rows=9),
         _bandolier_charges(gid, al_bando, 6, P('irp_vial_green', 0.02, fabric='glass.moonglass.leaded'), p_brass, r_tube=0.011, len_tube=0.064),
         _coat_buttons(gid, al_body, core.TOP - 0.07, core.WAIST + 0.05, n_buttons=5, paint=p_brass, double=True)],
    ))

    gid = f'irp_{s}_alchemist_alembic_frame'
    al_box, al_ctr, bk_d, al_straps = _dorsal_pack_base(gid, (0.21, 0.11, 0.26), p_slag, P('oxblood', 0.05, fabric='leather.cuir_bouilli'))
    retort_bulb = blob(gid + '_retort_vessel', al_ctr + bk_d * 0.052 + np.array([-0.04, 0.0, 0.05]), (0.12, 0.10, 0.14),
                       P('copper', 0.03, fabric='metal.bronze'), n=14, rows=6, out=bk_d, rigid_joint='Spine2')
    retort_neck = horn(gid + '_alembic_coil', [
        al_ctr + bk_d * 0.062 + np.array([-0.04, 0.0, 0.11]),
        al_ctr + bk_d * 0.070 + np.array([0.02, 0.0, 0.17]),
        al_ctr + bk_d * 0.062 + np.array([0.07, 0.0, 0.08]),
        al_ctr + bk_d * 0.058 + np.array([0.07, 0.0, -0.08]),
    ], 0.018, 0.009, p_brass, n=10, rows=9, rigid_joint='Spine2')
    acid_carboy = tube(gid + '_acid_flask', [al_ctr + bk_d * 0.050 + np.array([0.07, 0.0, -0.02]),
                                             al_ctr + bk_d * 0.050 + np.array([0.07, 0.0, -0.13])],
                       0.032, P('irp_vial_green', 0.02, fabric='glass.moonglass.leaded'), n=12, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Dorsal Brass Alembic & Retort Distillation Frame', 'back',
                                 [al_box, retort_bulb, retort_neck, acid_carboy, al_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_alchemist_gauntlets', 'Vulcanized Acid-Proof Rubberized Gauntlets', 'gloves',
        full_gloves(f'irp_{s}_alchemist_gauntlets',
                    P('oxblood', 0.05, [B('top', 0.0, 0.015, 'solid', 'brass')], fabric='cloth.oiled.alkali'),
                    P('irp_rubber', 0.05, fabric='rubber.tyre'), f0=0.50, ease=0.015),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_alchemist_trousers', 'Waxed Slate-Black Ordnance Trousers', 'legs',
        trousers(f'irp_{s}_alchemist_trousers', P('irp_rubber', 0.05, fabric='cloth.oiled.alkali'),
                 ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_alchemist_boots', 'Spark-Proof Brass-Riveted Rubberized Boots', 'feet',
        boots(f'irp_{s}_alchemist_boots', P('irp_rubber', 0.05, fabric='rubber.tyre'),
              P('oxblood', 0.05, [B('top', 0.0, 0.02, 'solid', 'brass')], fabric='leather.cuir_bouilli'),
              top=0.66, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 10: `salvager` — Footfall Ruin-Iron & Slag-Heap Reclaimer
    # =======================================================================================================
    gid = f'irp_{s}_salvager_potcap'
    sv_pot = _open_cranial_shell(gid + '_pot', P('iron', 0.05, [B('bottom', 0.0, 0.025, 'solid', 'drab')],
                                 [PN(0.0, 1.0, 'tin_patchwork', 'ancient', 'iron', 0.14)], fabric='armor.salvage.tread_plate'),
                                 f_top=1.14, f_bot=-0.08, f_brow_min=0.61, ease=0.018, rows=12, n=36)
    a_h, b_h, up_h, bk_h, left_h = head_frame()
    p_lv, _ = _anchor_on_part(sv_pot, a_h + (b_h - a_h) * 0.70 - bk_h * 0.09 + left_h * 0.045)
    sv_loupe = rosette(gid + '_assay_loupe', p_lv - bk_h * 0.005, -bk_h, left_h, 0.024, p_brass, n=12, thick=0.014, rigid_joint='Head')
    entries.append(_irp_assemble(gid, 'Riveted Salvage-Iron Pot-Cap & Assay Loupe', 'head', [sv_pot, sv_loupe], covers_hair=True))

    gid = f'irp_{s}_salvager_coat'
    p_sv_coat = P('drab', 0.06, [
        B('top', 0.0, 0.032, 'solid', 'repgreyd'),
        B('bottom', 0.0, 0.025, 'solid', 'umber'),
    ], [
        PN(0.0, 1.0, 'irp_vatnik_rib', 'drabd', 'drab', 0.14),
    ], fabric='cloth.quilted.channel')
    p_hull_pld = P('ancient', 0.03, [B('bottom', 0.0, 0.015, 'solid', 'repred')],
                   [PN(0.2, 0.8, 'stencil:03', 'repred', 'ancient', 0.10)], fabric='metal.steel.hammered')
    sv_body = torso_tube(gid, core.TOP, core.CROTCH - 0.12, 0.034, p_sv_coat,
                         hang_from=core.WAIST - 0.02, flare=0.13, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    sv_chain = crossed_sash(gid + '_chain_baldric', P('irp_slagiron', 0.06, [B('top', 0.0, 0.01, 'solid', 'brass')], fabric='metal.iron'),
                            width=0.044, ease=0.040)
    sv_belt = pouch_belt(gid, p_leather_umb, P('drabd', 0.06), ease=0.042)
    entries.append(_irp_assemble(
        gid, 'Patched Vatnik Coat, Articulated Rocket-Hull Pauldrons & Chain Baldric', 'torso',
        [sv_body, gorget_guard(gid + '_gorg', p_slag, trim_paint=p_brass, ease=0.025),
         sv_chain, sv_belt,
         articulated_pauldron(gid + '_hull_L', L, p_hull_pld, trim_paint=p_slag, lames=3, haute_piece=True, ease=0.025),
         articulated_pauldron(gid + '_hull_R', R, p_slag, trim_paint=p_brass, lames=2, haute_piece=False, ease=0.024),
         sleeves(gid, 'wrist', 0.020, p_sv_coat, ease_end=0.026, rows=9)],
    ))

    gid = f'irp_{s}_salvager_winch_basket'
    sv_bsk, sv_ctr, bk_d, sv_straps = _dorsal_pack_base(
        gid, (0.24, 0.14, 0.28),
        P('iron', 0.06, [B('top', 0.0, 0.025, 'solid', 'brass')], fabric='armor.salvage.tread_plate'),
        p_leather_umb,
    )
    winch_drum = tube(gid + '_magnet_winch', [sv_ctr + bk_d * 0.062 + np.array([-0.09, 0.0, -0.06]),
                                              sv_ctr + bk_d * 0.062 + np.array([0.09, 0.0, -0.06])],
                      0.038, P('copper', 0.04, fabric='metal.bronze'), n=12, rigid_joint='Spine2')
    hull_slab = blob(gid + '_hull_slab', sv_ctr + bk_d * 0.058 + np.array([0.0, 0.0, 0.06]), (0.17, 0.04, 0.16),
                     p_hull_pld, n=12, rows=5, out=bk_d, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Salvager Magnet-Winch & Rocket-Scrap Basket', 'back', [sv_bsk, winch_drum, hull_slab, sv_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_salvager_gloves', 'Reinforced Buckskin & Salvage-Plate Wrecking Gloves', 'gloves',
        full_gloves(f'irp_{s}_salvager_gloves', P('buck', 0.06, fabric='leather.buckskin'), p_leather_umb, f0=0.58, ease=0.015, knuckle_paint=p_slag),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_salvager_trousers', 'Reinforced Ruin-Breaker Cargo Trousers', 'legs',
        trousers(f'irp_{s}_salvager_trousers',
                 P('repgreyd', 0.06, [B('bottom', 0.26, 0.42, 'solid', 'leather')], fabric='cloth.canvas.duck.army'),
                 ease=0.014, ease_end=0.015, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_salvager_boots', 'Hobnailed Ruin-Salvager Wrecking Boots', 'feet',
        boots(f'irp_{s}_salvager_boots', p_slag, p_leather_umb, top=0.64, wraps=2, wrap_paint=p_leather_blk, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 11: `magistrate` — Full M+F Republican Tribune / Salvage-Court Magistrate
    # =======================================================================================================
    gid = f'irp_{s}_magistrate_hat'
    mg_crown = tower_hat(gid + '_steeple', 0.19, lambda t: 1.00 - 0.26 * t,
                         P('irp_ironblack', 0.04, [B('top', 0.0, 0.032, 'irp_izani_decree', 'brass', 'irp_repred_deep', 0.06)], fabric='cloth.felt.boiled'),
                         f=0.64, ease=0.014, rows=11, n=36)
    mg_brim = brim(gid + '_brim', 0.64, 0.095, P('irp_ironblack', 0.04, [B('bottom', 0.0, 0.012, 'solid', 'repred')], fabric='cloth.felt.boiled'),
                   ease=0.014, rows=5, n=40, lift=0.012)
    entries.append(_irp_assemble(gid, 'Republican Tribune Steeple-Brim Assize Hat', 'head', [mg_crown, mg_brim], covers_hair=True))

    gid = f'irp_{s}_magistrate_robe'
    p_mg_robe = P('irp_ironblack', 0.04, [
        B('bottom', 0.0, 0.018, 'solid', 'repred'),
        B('bottom', 0.018, 0.068, 'irp_izani_decree', 'repochre', 'irp_repred_deep', 0.10),
    ], [
        PN(0.46, 0.54, 'solid', 'irp_repred_deep', 'irp_ironblack', 1.0),
        PN(0.493, 0.507, 'solid', 'brass', 'brass', 1.0),
    ], fabric='cloth.wool.fulled')
    mg_body = torso_tube(gid, core.TOP, core.ANKLE + 0.08, 0.024, p_mg_robe,
                         hang_from=core.WAIST - 0.02, flare=0.18, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    mg_collar = collar_disc(gid + '_white_collar', 0.095,
                            P('white', 0.03, [B('bottom', 0.0, 0.010, 'solid', 'repcream')], fabric='cloth.plain'),
                            drop=0.068, rows=8, n=48, scallop=0.06, ease=0.022)
    mg_chain = collar_disc(gid + '_chain_of_office', 0.125,
                           P('irp_slagiron', 0.04, [B('bottom', 0.0, 0.028, 'irp_sword_triskele', 'brass', 'irp_repred_deep', 0.06)], fabric='metal.iron'),
                           drop=0.105, rows=8, n=48, scallop=0.08, ease=0.026)
    mg_sash = belt_sash(gid + '_sash', core.WAIST - 0.028, core.WAIST + 0.028,
                        P('irp_repred_deep', 0.04, [B('top', 0.0, 0.008, 'solid', 'brass'), B('bottom', 0.0, 0.008, 'solid', 'brass')]), ease=0.032)
    entries.append(_irp_assemble(
        gid, 'Tribune Broadcloth Robe, White Collar & Civic Chain of Office', 'torso',
        [mg_body, mg_collar, mg_chain, mg_sash,
         sleeves(gid, 'wrist', 0.020, P('irp_ironblack', 0.04, [B('bottom', 0.0, 0.04, 'solid', 'white'), B('bottom', 0.04, 0.052, 'solid', 'repred')]),
                 ease_end=0.038, rows=10, wide=True)],
    ))

    gid = f'irp_{s}_magistrate_codex_case'
    mg_box, mg_ctr, bk_d, mg_straps = _dorsal_pack_base(
        gid, (0.21, 0.09, 0.27),
        P('irp_ironblack', 0.04, [B('top', 0.0, 0.022, 'solid', 'brass'), B('bottom', 0.0, 0.022, 'solid', 'brass')],
          [PN(0.2, 0.8, 'irp_sword_triskele', 'repred', 'irp_ironblack', 0.12)], fabric='leather.polished'),
        p_leather_blk,
    )
    scroll_cyl = tube(gid + '_decree_scroll', [mg_ctr + np.array([-0.11, 0.0, 0.145]), mg_ctr + np.array([0.11, 0.0, 0.145])],
                      0.030, P('repcream', 0.04, [B('top', 0.0, 0.02, 'solid', 'repred')]), n=12, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Iron-Bound Law-Codex & Charter Scroll Case', 'back', [mg_box, scroll_cyl, mg_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_magistrate_gloves', 'Judicial Iron-Black Kidskin Gloves', 'gloves',
        full_gloves(f'irp_{s}_magistrate_gloves',
                    P('irp_ironblack', 0.04, [B('top', 0.0, 0.012, 'solid', 'white')], fabric='leather.polished'),
                    p_leather_blk, f0=0.64, ease=0.013),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_magistrate_breeches', 'Tribune Court Broadcloth Breeches', 'legs',
        trousers(f'irp_{s}_magistrate_breeches', P('irp_ironblack', 0.04, fabric='cloth.wool.fulled'),
                 ease=0.013, ease_end=0.014, ankle_f=0.84, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_magistrate_shoes', 'Tribune Brass-Buckled Court Shoes', 'feet',
        boots(f'irp_{s}_magistrate_shoes', p_leather_blk,
              P('irp_ironblack', 0.04, [B('top', 0.0, 0.018, 'solid', 'brass')], fabric='leather.polished'),
              top=0.36, ease_top=0.022),
    ))

    # =======================================================================================================
    # TIER 12: `commissar` — Full M+F Political & Ordnance Commissar
    # =======================================================================================================
    gid = f'irp_{s}_commissar_cap'
    # Peaked furazhka cap (obsidian leather band, crimson piping, flared peaked slate-black crown + exact right-eye assay monocle!)
    cm_band = crown_band(gid + '_band', P('irp_obsidian', 0.04, [B('top', 0.0, 0.010, 'solid', 'repred'), B('bottom', 0.0, 0.008, 'solid', 'repred')],
                         fabric='leather.polished'), f0=0.60, f1=0.74, ease=0.013, flare=0.004, rows=5, n=36)
    cm_crown = tower_hat(gid + '_crown', 0.105, lambda t: 1.00 + 0.18 * t,
                         P('irp_ironblack', 0.04, [B('bottom', 0.0, 0.014, 'solid', 'repred')], fabric='cloth.wool.fulled'),
                         f=0.72, ease=0.015, rows=8, n=36)
    a_h, b_h, up_h, bk_h, left_h, f_nose, f_eyes, f_brow, f_crown, x_eye = head_landmarks_exact()
    c_cm = a_h + (b_h - a_h) * 0.62
    angs_vp = np.linspace(0.70 * math.pi, 1.30 * math.pi, 17)
    Qvp = []
    for kr in range(4):
        sv = kr / 3.0
        row_vp = []
        for av in angs_vp:
            dv = bk_h * math.cos(av) + left_h * math.sin(av)
            hv = first_hit(c_cm, dv)
            rv = (float(hv) if hv is not None else 0.096) + 0.013 + sv * 0.052 * math.sin(math.pi * (av - 0.70 * math.pi) / (0.60 * math.pi))
            row_vp.append(c_cm + dv * rv - up_h * (0.011 * sv))
        Qvp.append(row_vp)
    cm_visor = Part(gid + '_visor', np.array(Qvp), False, ['body'] * 4, p_leather_blk, rigid_joint='Head')
    p_ck, _ = _anchor_on_part(cm_band, a_h + (b_h - a_h) * 0.68 - bk_h * 0.12)
    cm_cockade = rosette(gid + '_cockade', p_ck - bk_h * 0.003, -bk_h, left_h, 0.018, p_brass, n=12, thick=0.008, rigid_joint='Head')
    # Right-eye contraband-assay monocle aligned to exact pupil `(x=-x_eye, z=eye_z_bl)` and `+6mm` proud of `eye_orb_z` (Gate 2E!)
    h_ab = float(np.linalg.norm(b_h - a_h))
    eye_z_bl = float(a_h[2]) + f_eyes * h_ab
    orb_m = ((np.abs(core.BP_GL[:, 0]) - x_eye) ** 2 + (core.BP_GL[:, 1] - eye_z_bl) ** 2 <= 0.022 ** 2) & (core.BP_GL[:, 2] > 0.05)
    eye_orb_z = float(core.BP_GL[orb_m, 2].max()) if orb_m.any() else (0.153 if 'male' in body_id else 0.134)
    mon_c = np.array([-x_eye, -(eye_orb_z + 0.0065), eye_z_bl], dtype=np.float64)
    cm_monocle = rosette(gid + '_monocle', mon_c, np.array([0.0, -1.0, 0.0]), np.array([1.0, 0.0, 0.0]),
                         0.0155, P('repred', 0.02, [B('top', 0.0, 0.006, 'solid', 'brass')], fabric='metal.bronze'),
                         n=14, thick=0.007, rigid_joint='Head')
    entries.append(_irp_assemble(gid, 'Commissar Peaked Furazhka Cap & Assay Monocle', 'head',
                                 [cm_band, cm_crown, cm_visor, cm_cockade, cm_monocle], covers_hair=True))

    gid = f'irp_{s}_commissar_greatcoat'
    p_cm_coat = P('irp_ironblack', 0.04, [
        B('top', 0.0, 0.036, 'irp_sword_triskele', 'repred', 'irp_obsidian', 0.05),
        B('top', 0.036, 0.044, 'solid', 'repred'),
        B('bottom', 0.0, 0.014, 'solid', 'repred'),
    ], [
        PN(0.41, 0.59, 'solid', 'irp_obsidian', 'irp_ironblack', 1.0, down=core.TOP - core.WAIST + 0.02),
        PN(0.405, 0.415, 'solid', 'repred', 'repred', 1.0, down=core.TOP - core.WAIST + 0.02),
        PN(0.585, 0.595, 'solid', 'repred', 'repred', 1.0, down=core.TOP - core.WAIST + 0.02),
    ], fabric='leather.polished')
    cm_body = torso_tube(gid, core.TOP, core.ANKLE + 0.14, 0.025, p_cm_coat,
                         hang_from=core.WAIST - 0.02, flare=0.17, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    cm_cross = crossed_sash(gid + '_sambrowne', p_leather_blk, width=0.038, ease=0.031)
    cm_sash = sash_with_tail(gid, P('repred', 0.04, [B('top', 0.0, 0.006, 'solid', 'irp_ironblack')]),
                             P('repred', 0.04, [B('bottom', 0.0, 0.02, 'solid', 'brass')]), ease=0.033, tail=0.25)
    entries.append(_irp_assemble(
        gid, 'Commissar Double-Breasted Obsidian Greatcoat & Crimson Sash', 'torso',
        [cm_body, stand_collar(gid, P('irp_obsidian', 0.04, [B('top', 0.0, 0.008, 'solid', 'repred')]), high=0.038),
         cm_cross, cm_sash,
         pauldron(gid + '_ep_L', L, P('irp_obsidian', 0.04, [B('bottom', 0.0, 0.010, 'solid', 'repred')]), reach=0.23, ease=0.024),
         pauldron(gid + '_ep_R', R, P('irp_obsidian', 0.04, [B('bottom', 0.0, 0.010, 'solid', 'repred')]), reach=0.23, ease=0.024),
         sleeves(gid, 'wrist', 0.019, P('irp_ironblack', 0.04, [B('bottom', 0.0, 0.05, 'solid', 'irp_obsidian'), B('bottom', 0.05, 0.058, 'solid', 'repred')]),
                 ease_end=0.027, rows=9),
         _coat_buttons(gid, cm_body, core.TOP - 0.07, core.WAIST + 0.05, n_buttons=5, paint=p_brass, double=True)],
    ))

    gid = f'irp_{s}_commissar_dispatch_case'
    cm_box, cm_ctr, bk_d, cm_straps = _dorsal_pack_base(
        gid, (0.22, 0.10, 0.25),
        P('irp_obsidian', 0.04, [B('top', 0.0, 0.02, 'solid', 'repred'), B('bottom', 0.0, 0.02, 'solid', 'brass')], fabric='leather.polished'),
        p_leather_blk,
    )
    cm_roll = tube(gid + '_cloak_roll', [cm_ctr + np.array([-0.12, 0.0, 0.135]), cm_ctr + np.array([0.12, 0.0, 0.135])],
                   0.036, P('repgreyd', 0.05, [B('top', 0.0, 0.015, 'solid', 'repred')]), n=12, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Commissar Embargo-Dossier Dispatch Case', 'back', [cm_box, cm_roll, cm_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_commissar_gauntlets', 'Commissar Mirror-Black Inspection Gauntlets', 'gloves',
        full_gloves(f'irp_{s}_commissar_gauntlets',
                    P('irp_obsidian', 0.04, [B('top', 0.0, 0.012, 'solid', 'repred')], fabric='leather.polished'),
                    p_leather_blk, f0=0.56, ease=0.014),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_commissar_breeches', 'Commissar Crimson-Piped Riding Breeches', 'legs',
        trousers(f'irp_{s}_commissar_breeches',
                 P('irp_ironblack', 0.04, [],
                   [PN(0.23, 0.255, 'solid', 'repred', 'irp_ironblack', 1.0), PN(0.745, 0.77, 'solid', 'repred', 'irp_ironblack', 1.0)],
                   fabric='cloth.wool.fulled'),
                 ease=0.013, ease_end=0.014, ankle_f=0.78, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_commissar_boots', 'Commissar Tall Obsidian Officer Jackboots', 'feet',
        boots(f'irp_{s}_commissar_boots', p_slag,
              P('irp_obsidian', 0.03, [B('top', 0.0, 0.016, 'solid', 'repred')], fabric='leather.polished'),
              top=0.84, ease_top=0.025),
    ))

    # =======================================================================================================
    # TIER 13: `first_citizen` — Head of State at Fortress of the Three (`important_npc`)
    # =======================================================================================================
    gid = f'irp_{s}_first_citizen_tricorne'
    fc_hat = _tricorne_hat(
        gid,
        P('irp_ironblack', 0.03, [B('top', 0.0, 0.02, 'solid', 'repred')], fabric='cloth.velvet.cut'),
        P('irp_slagiron', 0.03, [B('bottom', 0.0, 0.018, 'solid', 'silver')], fabric='metal.steel.brushed'),
        P('gold', 0.02, [], [PN(0.0, 1.0, 'irp_sword_triskele', 'repred', 'gold', 0.06)], fabric='metal.gold'),
        height=0.115,
    )
    # Austere silver-laurel civic wreath band around the base of the tricorne crown
    fc_laurel = crown_band(gid + '_silver_laurel',
                           P('silver', 0.03, [B('top', 0.0, 0.012, 'solid', 'irp_ironblack')], fabric='metal.steel.brushed'),
                           f0=0.61, f1=0.69, ease=0.018, flare=0.004, rows=4, n=36)
    entries.append(_irp_assemble(gid, 'First Citizen Silver-Laurel & Blackened-Steel Civic Tricorne', 'head',
                                 [fc_hat, fc_laurel], covers_hair=True))

    gid = f'irp_{s}_first_citizen_coat'
    p_fc_coat = P('irp_ironblack', 0.03, [
        B('top', 0.0, 0.038, 'irp_sword_triskele', 'gold', 'irp_repred_deep', 0.05),
        B('bottom', 0.0, 0.020, 'solid', 'repred'),
        B('bottom', 0.020, 0.085, 'irp_izani_decree', 'repochre', 'irp_ironblack', 0.09),
    ], [
        PN(0.36, 0.64, 'irp_streltsy_frogging', 'repred', 'irp_ironblack', 0.16, down=core.TOP - core.WAIST + 0.02),
    ], fabric='cloth.velvet.cut')
    fc_body = torso_tube(gid, core.TOP, core.KNEE - 0.14, 0.025, p_fc_coat,
                         hang_from=core.WAIST - 0.02, flare=0.17, group_below=core.CROTCH + 0.02, hull_from=core.CHEST + 0.02)
    fc_sash = crossed_sash(gid + '_state_sash',
                           P('irp_repred_deep', 0.03, [
                               B('top', 0.0, 0.012, 'solid', 'repcream'),
                               B('bottom', 0.0, 0.012, 'solid', 'irp_slagiron'),
                           ], [PN(0.0, 1.0, 'irp_izani_decree', 'repochre', 'irp_repred_deep', 0.08)]),
                           width=0.062, ease=0.031)
    fc_belt = belt_sash(gid + '_belt', core.WAIST - 0.028, core.WAIST + 0.028,
                        P('irp_obsidian', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold'), B('bottom', 0.0, 0.008, 'solid', 'gold')]), ease=0.033)
    # Precision Stahlborn brass astronomical chronometer pectoral anchored flush on sternum
    p_pc, n_pc = _anchor_on_part(fc_sash, chest_front(core.CHEST + 0.035, 0.038))
    fc_pectoral = rosette(gid + '_chronometer_pectoral', p_pc + n_pc * 0.004, n_pc, np.array([1.0, 0.0, 0.0]),
                          0.048, P('brass', 0.02, [B('top', 0.0, 0.015, 'solid', 'silver')], fabric='metal.gold'),
                          n=18, thick=0.015, rigid_joint='Spine2')
    fc_dial = rosette(gid + '_chronometer_dial', p_pc + n_pc * 0.010, n_pc, np.array([1.0, 0.0, 0.0]),
                      0.028, P('repcream', 0.02, [B('top', 0.0, 0.008, 'solid', 'repred')], fabric='metal.steel.brushed'),
                      n=14, thick=0.008, rigid_joint='Spine2')
    entries.append(_irp_assemble(
        gid, 'First Citizen Charcoal-Velvet Coat, State Sash & Astronomical Chronometer Pectoral', 'torso',
        [fc_body, stand_collar(gid, P('irp_repred_deep', 0.03, [B('top', 0.0, 0.008, 'solid', 'gold')]), high=0.038),
         fc_sash, fc_belt, fc_pectoral, fc_dial,
         pauldron(gid + '_ep_L', L, P('brass', 0.04, [B('bottom', 0.0, 0.012, 'solid', 'repred')], fabric='metal.brass.braid'), reach=0.24, ease=0.025),
         pauldron(gid + '_ep_R', R, P('brass', 0.04, [B('bottom', 0.0, 0.012, 'solid', 'repred')], fabric='metal.brass.braid'), reach=0.24, ease=0.025),
         sleeves(gid, 'wrist', 0.019, P('irp_ironblack', 0.03, [B('bottom', 0.0, 0.05, 'solid', 'irp_repred_deep'), B('bottom', 0.05, 0.058, 'solid', 'gold')]),
                 ease_end=0.027, rows=9),
         _coat_buttons(gid, fc_body, core.TOP - 0.07, core.WAIST + 0.05, n_buttons=5, paint=P('gold', 0.02, fabric='metal.gold'), double=True)],
    ))

    gid = f'irp_{s}_first_citizen_seal_case'
    fc_box, fc_ctr, bk_d, fc_straps = _dorsal_pack_base(
        gid, (0.20, 0.09, 0.25),
        P('irp_slagiron', 0.03, [B('top', 0.0, 0.02, 'solid', 'gold'), B('bottom', 0.0, 0.02, 'solid', 'repred')], fabric='metal.steel.brushed'),
        p_leather_blk,
    )
    seal_cyl = tube(gid + '_state_seal_cylinder', [fc_ctr + np.array([-0.12, 0.0, 0.135]), fc_ctr + np.array([0.12, 0.0, 0.135])],
                    0.034, p_brass, n=14, rigid_joint='Spine2')
    seal_med = rosette(gid + '_fortress_seal', fc_ctr + bk_d * 0.048, bk_d, np.array([1.0, 0.0, 0.0]),
                       0.056, P('gold', 0.02, [], [PN(0.0, 1.0, 'irp_sword_triskele', 'repred', 'gold', 0.08)], fabric='metal.gold'),
                       n=16, thick=0.014, rigid_joint='Spine2')
    entries.append(_irp_assemble(gid, 'Fortress of the Three State Seal & Cipher Case', 'back',
                                 [fc_box, seal_cyl, seal_med, fc_straps]))

    entries.append(_irp_assemble(
        f'irp_{s}_first_citizen_gloves', 'Ceremonial White-and-Obsidian State Gloves', 'gloves',
        full_gloves(f'irp_{s}_first_citizen_gloves',
                    P('irp_ironblack', 0.03, [B('top', 0.0, 0.015, 'solid', 'gold')], fabric='leather.polished'),
                    P('white', 0.03, fabric='leather.buckskin'), f0=0.58, ease=0.013),
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_first_citizen_breeches', 'First Citizen Double-Lampasy Tailored Breeches', 'legs',
        trousers(f'irp_{s}_first_citizen_breeches',
                 P('irp_ironblack', 0.04, [],
                   [PN(0.22, 0.245, 'solid', 'repred', 'irp_ironblack', 1.0),
                    PN(0.255, 0.275, 'solid', 'repred', 'irp_ironblack', 1.0),
                    PN(0.725, 0.745, 'solid', 'repred', 'irp_ironblack', 1.0),
                    PN(0.755, 0.78, 'solid', 'repred', 'irp_ironblack', 1.0)],
                   fabric='cloth.wool.fulled'),
                 ease=0.013, ease_end=0.014, ankle_f=0.80, bag=0.008),
        legged=True,
    ))
    entries.append(_irp_assemble(
        f'irp_{s}_first_citizen_boots', 'First Citizen Obsidian Riding Boots & Brass Spurs', 'feet',
        boots(f'irp_{s}_first_citizen_boots', p_brass,
              P('irp_obsidian', 0.03, [B('top', 0.0, 0.02, 'solid', 'gold')], fabric='leather.polished'),
              top=0.86, ease_top=0.025),
    ))

    return entries


# ===========================================================================================================
# 4. LOCAL SELF-CONTAINED CROSS-SLOT CONFORMITY PASS (ONLY TOUCHES `irp_*` GLBs, ZERO SHARED FILES!)
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


def _conform_local_manifest_glbs(kit_entries, peoples_entry, prefix='irp_'):
    """Run exact torso-over-legs, back-strap/cape-over-torso, and boot-over-legs conformity on new `irp_*` GLBs."""
    for sex_key, b_id in (('male', 'mpfb_male'), ('female', 'mpfb_female')):
        set_body(b_id)
        sh_y_gl = float(core.RIG.jpos[core.RIG.J['LeftArm']][1])
        sp1_y_gl = float(core.RIG.jpos[core.RIG.J['Spine1']][1])
        hip_y_gl = float(core.RIG.jpos[core.RIG.J['Hips']][1])
        nk_y_gl = float(core.RIG.jpos[core.RIG.J['Neck']][1])
        y_upleg_gl = float(core.RIG.jpos[core.RIG.J['LeftUpLeg']][1])

        base_kit = json.loads((ROOT / 'data' / b_id / 'kit.json').read_text(encoding='utf-8'))
        by_id = {it['id']: dict(it) for it in base_kit['items']}
        local_map = {}
        for e in kit_entries:
            if e.get('_body') == b_id:
                ec = dict(e)
                ec['made_by'] = 'garments'
                by_id[e['id']] = ec
                local_map[e['id']] = e

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

        # 2. Back straps & dorsal capes over paired torso (`Gates 5A, 5B, 5D, 5F`)
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

            if bk_it.get('cloth') or (Pb[:, 2].max() < 0.04 and len(Pb) > 400 and 'cape' in bk_id):
                # Conform dorsal cape (`cuirassier_cape`) flush 8..14mm outside dorsal coat
                T_back = T_surf[T_surf[:, 2] < 0.04]
                if len(T_back):
                    y_max_c, y_min_c = float(Pb[:, 1].max()), float(Pb[:, 1].min())
                    n_ybins = 24
                    y_grid = np.linspace(y_max_c, y_min_c, n_ybins)
                    x_bins = np.linspace(-0.32, 0.32, 25)
                    env_z = np.zeros((n_ybins, len(x_bins)), dtype=np.float64)
                    y_scap_lo = sh_y_gl - 0.170
                    for yi, yv in enumerate(y_grid):
                        clr_z = 0.0075 if yv >= sh_y_gl - 0.04 else 0.010
                        tm_y = T_back[np.abs(T_back[:, 1] - yv) <= 0.042]
                        for xi, xv in enumerate(x_bins):
                            if len(tm_y):
                                tm_xy = tm_y[np.abs(tm_y[:, 0] - xv) <= 0.055]
                                if not len(tm_xy):
                                    tm_xy = tm_y[np.abs(tm_y[:, 0] - np.clip(xv, -0.15, 0.15)) <= 0.065]
                                if len(tm_xy):
                                    env_z[yi, xi] = float(np.percentile(tm_xy[:, 2], 5)) - clr_z
                        if yi > 0 and yv < sh_y_gl - 0.035:
                            dy_s = abs(y_grid[yi - 1] - yv)
                            if yv >= y_scap_lo:
                                env_z[yi] = np.minimum(env_z[yi], env_z[yi - 1] + 0.14 * dy_s)
                            else:
                                env_z[yi] = np.minimum(env_z[yi], env_z[yi - 1] - 0.12 * dy_s)
                    mod_c = False
                    for vi in range(len(Pb)):
                        vx, vy, vz = float(Pb[vi, 0]), float(Pb[vi, 1]), float(Pb[vi, 2])
                        if vz > 0.02:
                            continue
                        if vy > nk_y_gl - 0.004 and abs(vx) >= 0.035:
                            Pb[vi, 1] = vy = nk_y_gl - 0.004
                            mod_c = True
                        w_att = float(np.clip((y_max_c - vy) / 0.032, 0.0, 1.0))
                        w_att = w_att * w_att * (3.0 - 2.0 * w_att)
                        if w_att <= 1e-4:
                            continue
                        yi_f = np.clip((y_max_c - vy) / max(1e-6, y_max_c - y_min_c) * (n_ybins - 1), 0.0, n_ybins - 1.001)
                        xi_f = np.clip((vx - x_bins[0]) / (x_bins[-1] - x_bins[0]) * (len(x_bins) - 1), 0.0, len(x_bins) - 1.001)
                        yi0, xi0 = int(yi_f), int(xi_f)
                        wy, wx = yi_f - yi0, xi_f - xi0
                        z_env = (1 - wy) * ((1 - wx) * env_z[yi0, xi0] + wx * env_z[yi0, xi0 + 1]) + wy * ((1 - wx) * env_z[yi0 + 1, xi0] + wx * env_z[yi0 + 1, xi0 + 1])
                        z_req = vz * (1.0 - w_att) + z_env * w_att
                        if abs(vz - z_req) > 2e-4 and z_req < -0.02:
                            Pb[vi, 2] = z_req
                            mod_c = True
                    if mod_c:
                        _write_glb_pos(bk_glb, bj, bytearray(bb), at_b['POSITION'], Pb.astype(np.float32))
                continue

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

        # 3. Closed boot shafts over paired legged trousers (`Gate 7`)
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
# 5. COMPLETE 21-TIER `iron_republic` PEOPLES ENTRY & MANIFEST VALIDATOR
# ===========================================================================================================
IRON_REPUBLIC_TIERS = [
    ['peasant', 0.130],
    ['foundry_smelter', 0.080],
    ['salvager', 0.070],
    ['hydro_miller', 0.050],
    ['peasant_fest', 0.050],
    ['trade', 0.070],
    ['optician_clockmaker', 0.050],
    ['alchemist_pyro', 0.050],
    ['trade_fest', 0.040],
    ['line_musketeer', 0.090],
    ['streltsy_halberdier', 0.065],
    ['cuirassier', 0.045],
    ['artillerist_rocketeer', 0.045],
    ['tunnel_sapper', 0.035],
    ['commissar', 0.040],
    ['magistrate', 0.030],
    ['noble', 0.045],
    ['noble_fest', 0.015],
    ['first_citizen', 0.000],
    ['pc_patchwork_sheriff', 0.000],
    ['crimson_technomancer', 0.000],
]

IRON_REPUBLIC_TIER_LABELS = {
    'peasant': 'Citizen Worker & Cottager',
    'foundry_smelter': 'Bessemer Blast-Furnace Smelter (R1/R3/R5)',
    'salvager': 'Footfall Ruin-Iron & Rocket-Hull Salvager',
    'hydro_miller': 'Cascade Waterwheel & Canal-Lock Machinist',
    'peasant_fest': 'Citizen in Feast-Day Folk Dress',
    'trade': 'Chartered Guildsfolk (Smiths, Mechanics & Mint)',
    'optician_clockmaker': 'Astronomers & Opticians Guild Master (Urverkstad)',
    'alchemist_pyro': 'State Saltpeter & Acid Pyrotechnician',
    'trade_fest': 'Guildsfolk in Feast-Day Saxon Dress',
    'line_musketeer': 'Citizen-Army Third Legion Line Musketeer',
    'streltsy_halberdier': 'Cantonal Streltsy Shock-Halberdier (MC-02)',
    'cuirassier': 'Jern-Knekt Blackened-Steel Cuirassier',
    'artillerist_rocketeer': 'Roketstad Rocket-Corps Artillerist',
    'tunnel_sapper': 'Alpine Karst-Tunnel Sapper & Miner-Engineer',
    'commissar': 'Political & Ordnance Line-Commissar',
    'magistrate': 'Republican Tribune & Salvage-Court Magistrate',
    'noble': 'Deputy of the Hall of the Republic (Tinget)',
    'noble_fest': 'Hall of the Republic, in State',
    'first_citizen': 'First Citizen of the Iron Republic (Fortress of the Three)',
    'pc_patchwork_sheriff': 'Iron Republic Patchwork Sheriff (PC)',
    'crimson_technomancer': 'Crimson Technomancer (Arc-Furnace Magus)',
}


def _iron_republic_outfits_for_sex(sex):
    s = sex
    if sex == 'm':
        preserved = {
            'peasant': {
                'head': 'rep_m_peasant_cap',
                'torso': 'rep_m_peasant_tunic',
                'legs': 'rep_m_peasant_trousers',
                'feet': 'rep_m_peasant_boots',
                'cantons': ['all'],
            },
            'trade': {
                'head': 'rep_m_trade_ushanka',
                'torso': 'rep_m_trade_jacket',
                'legs': 'rep_m_trade_breeches',
                'feet': 'rep_m_trade_boots',
                'cantons': ['all'],
            },
            'noble': {
                'head': 'rep_m_noble_papakha',
                'torso': 'rep_m_noble_greatcoat',
                'legs': 'rep_m_noble_breeches',
                'feet': 'rep_m_noble_boots',
                'cantons': ['all'],
            },
            'peasant_fest': {
                'head': 'rep_m_fest_peasant_cap',
                'torso': 'rep_m_fest_peasant_shirt',
                'legs': 'rep_m_fest_peasant_trousers',
                'feet': 'rep_m_fest_valenki',
                'cantons': ['all'],
            },
            'trade_fest': {
                'head': 'rep_m_fest_trade_ushanka',
                'torso': 'rep_m_fest_trade_jacket',
                'legs': 'rep_m_fest_trade_breeches',
                'feet': 'rep_m_trade_boots',
                'cantons': ['all'],
            },
            'noble_fest': {
                'head': 'rep_m_fest_noble_papakha',
                'torso': 'rep_m_fest_noble_greatcoat',
                'legs': 'rep_m_fest_noble_breeches',
                'feet': 'rep_m_fest_noble_boots',
                'cantons': ['R1'],
            },
        }
    else:
        preserved = {
            'peasant': {
                'head': 'rep_f_peasant_platok',
                'torso': 'rep_f_peasant_dress',
                'legs': 'irp_f_citizen_undertrousers',
                'feet': 'rep_f_peasant_boots',
                'cantons': ['all'],
            },
            'trade': {
                'head': 'rep_f_trade_ushanka',
                'torso': 'rep_f_trade_jacket',
                'legs': 'rep_f_trade_skirt',
                'feet': 'rep_f_trade_boots',
                'cantons': ['all'],
            },
            'noble': {
                'head': 'rep_f_noble_papakha',
                'torso': 'rep_f_noble_greatcoat',
                'legs': 'rep_f_noble_skirt',
                'feet': 'rep_f_noble_boots',
                'cantons': ['all'],
            },
            'peasant_fest': {
                'head': 'rep_f_fest_peasant_platok',
                'torso': 'rep_f_fest_peasant_sarafan',
                'legs': 'irp_f_fest_undertrousers',
                'feet': 'rep_f_fest_valenki',
                'cantons': ['all'],
            },
            'trade_fest': {
                'head': 'rep_f_fest_trade_borten',
                'torso': 'rep_f_fest_trade_coat',
                'legs': 'rep_f_fest_trade_skirt',
                'feet': 'rep_f_trade_boots',
                'cantons': ['all'],
            },
            'noble_fest': {
                'head': 'rep_f_fest_noble_kokoshnik',
                'torso': 'rep_f_fest_noble_gown',
                'legs': 'irp_f_fest_undertrousers',
                'feet': 'rep_f_fest_noble_boots',
                'cantons': ['R1'],
            },
        }

    built = {
        'line_musketeer': {
            'head': f'irp_{s}_musketeer_hat',
            'torso': f'irp_{s}_musketeer_coat',
            'back': f'irp_{s}_musketeer_knapsack',
            'gloves': f'irp_{s}_musketeer_gauntlets',
            'legs': f'irp_{s}_musketeer_breeches',
            'feet': f'irp_{s}_musketeer_boots',
            'cantons': ['all'],
        },
        'streltsy_halberdier': {
            'head': f'irp_{s}_streltsy_cabasset',
            'torso': f'irp_{s}_streltsy_kaftan',
            'back': f'irp_{s}_streltsy_rondache',
            'gloves': f'irp_{s}_streltsy_gauntlets',
            'legs': f'irp_{s}_streltsy_breeches',
            'feet': f'irp_{s}_streltsy_boots',
            'cantons': ['R1', 'R2', 'R4', 'R6'],
        },
        'cuirassier': {
            'head': f'irp_{s}_cuirassier_burgonet',
            'torso': f'irp_{s}_cuirassier_plate',
            'back': f'irp_{s}_cuirassier_cape',
            'gloves': f'irp_{s}_cuirassier_gauntlets',
            'legs': f'irp_{s}_cuirassier_breeches',
            'feet': f'irp_{s}_cuirassier_boots',
            'cantons': ['R1', 'R5'],
        },
        'artillerist_rocketeer': {
            'head': f'irp_{s}_rocketeer_visor_cap',
            'torso': f'irp_{s}_rocketeer_apron',
            'back': f'irp_{s}_rocketeer_quiver',
            'gloves': f'irp_{s}_rocketeer_mitts',
            'legs': f'irp_{s}_rocketeer_breeches',
            'feet': f'irp_{s}_rocketeer_boots',
            'cantons': ['R1', 'R2', 'R6'],
        },
        'tunnel_sapper': {
            'head': f'irp_{s}_sapper_casque',
            'torso': f'irp_{s}_sapper_jerkin',
            'back': f'irp_{s}_sapper_petard_rig',
            'gloves': f'irp_{s}_sapper_gloves',
            'legs': f'irp_{s}_sapper_trousers',
            'feet': f'irp_{s}_sapper_boots',
            'hair': None,
            'beard': None,
            'cantons': ['R3', 'R5', 'R6'],
        },
        'foundry_smelter': {
            'head': f'irp_{s}_smelter_hood',
            'torso': f'irp_{s}_smelter_apron',
            'back': f'irp_{s}_smelter_tongs_rack',
            'gloves': f'irp_{s}_smelter_mitts',
            'legs': f'irp_{s}_smelter_trousers',
            'feet': f'irp_{s}_smelter_clogs',
            'cantons': ['R1', 'R3', 'R5'],
        },
        'hydro_miller': {
            'head': f'irp_{s}_hydro_flatcap',
            'torso': f'irp_{s}_hydro_waistcoat',
            'back': f'irp_{s}_hydro_satchel',
            'gloves': f'irp_{s}_hydro_cuffs',
            'legs': f'irp_{s}_hydro_trousers',
            'feet': f'irp_{s}_hydro_boots',
            'cantons': ['R2', 'R3', 'R4'],
        },
        'optician_clockmaker': {
            'head': f'irp_{s}_optician_loupe_band',
            'torso': f'irp_{s}_optician_frock',
            'back': f'irp_{s}_optician_astrolabe_pack',
            'gloves': f'irp_{s}_optician_gloves',
            'legs': f'irp_{s}_optician_breeches',
            'feet': f'irp_{s}_optician_shoes',
            'cantons': ['R1', 'R2'],
        },
        'alchemist_pyro': {
            'head': f'irp_{s}_alchemist_mask',
            'torso': f'irp_{s}_alchemist_coat',
            'back': f'irp_{s}_alchemist_alembic_frame',
            'gloves': f'irp_{s}_alchemist_gauntlets',
            'legs': f'irp_{s}_alchemist_trousers',
            'feet': f'irp_{s}_alchemist_boots',
            'hair': None,
            'beard': None,
            'cantons': ['R1', 'R3'],
        },
        'salvager': {
            'head': f'irp_{s}_salvager_potcap',
            'torso': f'irp_{s}_salvager_coat',
            'back': f'irp_{s}_salvager_winch_basket',
            'gloves': f'irp_{s}_salvager_gloves',
            'legs': f'irp_{s}_salvager_trousers',
            'feet': f'irp_{s}_salvager_boots',
            'cantons': ['R1', 'R2'],
        },
        'magistrate': {
            'head': f'irp_{s}_magistrate_hat',
            'torso': f'irp_{s}_magistrate_robe',
            'back': f'irp_{s}_magistrate_codex_case',
            'gloves': f'irp_{s}_magistrate_gloves',
            'legs': f'irp_{s}_magistrate_breeches',
            'feet': f'irp_{s}_magistrate_shoes',
            'cantons': ['R1', 'R2'],
        },
        'commissar': {
            'head': f'irp_{s}_commissar_cap',
            'torso': f'irp_{s}_commissar_greatcoat',
            'back': f'irp_{s}_commissar_dispatch_case',
            'gloves': f'irp_{s}_commissar_gauntlets',
            'legs': f'irp_{s}_commissar_breeches',
            'feet': f'irp_{s}_commissar_boots',
            'cantons': ['R1', 'R4', 'R6'],
        },
        'first_citizen': {
            'head': f'irp_{s}_first_citizen_tricorne',
            'torso': f'irp_{s}_first_citizen_coat',
            'back': f'irp_{s}_first_citizen_seal_case',
            'gloves': f'irp_{s}_first_citizen_gloves',
            'legs': f'irp_{s}_first_citizen_breeches',
            'feet': f'irp_{s}_first_citizen_boots',
            'type': 'important_npc',
            'cantons': ['R1'],
        },
        'pc_patchwork_sheriff': {
            'head': f'rep_{s}_pc_sheriff_hat',
            'torso': f'rep_{s}_pc_sheriff_poncho',
            'gloves': f'rep_{s}_pc_sheriff_gloves',
            'legs': f'rep_{s}_pc_sheriff_pants',
            'feet': f'rep_{s}_pc_sheriff_boots',
            'hair': None,
            'beard': None,
            'type': 'pc',
            'label': 'Iron Republic Patchwork Sheriff (PC)',
        },
        'crimson_technomancer': {
            'head': f'rep_{s}_crimson_technomancer_hat',
            'torso': f'rep_{s}_crimson_technomancer_coat',
            'gloves': f'rep_{s}_crimson_technomancer_gloves',
            'legs': f'rep_{s}_crimson_technomancer_trousers',
            'feet': f'rep_{s}_crimson_technomancer_boots',
            'beard': None,
            'hair': None,
            'type': 'important_npc',
        },
    }

    out = {}
    for tid, _ in IRON_REPUBLIC_TIERS:
        out[tid] = preserved[tid] if tid in preserved else built[tid]
    return out


def build_iron_republic_peoples_entry():
    return {
        'id': 'iron_republic',
        'name': 'Iron Republic',
        'note': (
            'Highland citizen-army republic born of the Third Legion mutiny at Roketstad (Six Cantonal Tings R1-R6): '
            'Imperial-Russian/Red-Army shinel & telogreika uniforms, Muscovite Streltsy & Pike-and-Shot cuirassiers, '
            'Transylvanian-Saxon & Novgorodian guilds/feast dress, and Footfall/Cascade/Roketstad industrial salvage '
            '(21 tiers at 100% M+F parity; tools/garments/cultures/iron_republic_full.py).'
        ),
        'ancestry': {
            'african': [0.0, 0.1],
            'asian': [0.05, 0.3],
            'caucasian': [0.6, 0.95],
        },
        'skin': ['#f1d6c4', '#e3bfa5', '#cfa385'],
        'hair': ['#d9c08a', '#a8834f', '#7a5733', '#4d3522', '#241a14'],
        'eyes': ['#3b2414', '#5a3a22', '#4a5a3a', '#4e6a80', '#6a7a86'],
        'grey': 0.45,
        'beard': 0.5,
        'morph': {
            'height': [-0.1, 0.5],
        },
        'styles': {
            'male': ['short02', 'short01', 'mhair02', 'elvs_grump_hair', 'elvs_maxwell_hair', 'Short_Hair_B'],
            'female': ['elvs_braid_bun', 'Messy_Bun', 'elvs_50s_updo', 'braid01', 'ponytail01'],
        },
        'tiers': IRON_REPUBLIC_TIERS,
        'tier_labels': IRON_REPUBLIC_TIER_LABELS,
        'outfits': {
            'male': _iron_republic_outfits_for_sex('m'),
            'female': _iron_republic_outfits_for_sex('f'),
        },
    }


def build_iron_republic_kit():
    with iron_republic_motif_scope():
        entries = []
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            entries.extend(_build_for_body(sex, body_id))
    return entries


def _validate_manifest(kit_entries, peoples_entry):
    share_sum = sum(sh for _, sh in peoples_entry['tiers'])
    assert abs(share_sum - 1.0) < 1e-9, f'Iron Republic tier shares sum to {share_sum}, expected 1.000'
    for tid, sh in peoples_entry['tiers']:
        if tid in ('first_citizen', 'pc_patchwork_sheriff', 'crimson_technomancer'):
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
        assert gid.startswith('irp_'), f'New piece {gid} must use irp_ prefix!'
        assert ent.get('culture') == 'iron_republic', f'Unexpected culture on {gid}: {ent.get("culture")}'
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
    assert len(m_keys) == 21, f'Expected 21 tiers, got {len(m_keys)}'

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
    kit_entries = build_iron_republic_kit()
    peoples_entry = build_iron_republic_peoples_entry()
    _conform_local_manifest_glbs(kit_entries, peoples_entry, prefix='irp_')
    _validate_manifest(kit_entries, peoples_entry)

    manifest_path = CULTURES_DIR / 'iron_republic_manifest.json'
    manifest_data = {
        'culture': 'iron_republic',
        'kit_entries': kit_entries,
        'peoples_entry': peoples_entry,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    n_m = sum(1 for e in kit_entries if e['_body'] == 'mpfb_male')
    n_f = sum(1 for e in kit_entries if e['_body'] == 'mpfb_female')
    print(f'Successfully built {len(kit_entries)} Iron Republic pieces ({n_m} male, {n_f} female) across 21 tiers in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
