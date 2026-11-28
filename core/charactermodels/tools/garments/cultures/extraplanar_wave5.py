"""The Extraplanar Entities Kit — Wave 5: Exotic DMT / Hyperspace Entities (`ext5_*`).

Compiles 44 bespoke procedural extraplanar pieces (`22` `mpfb_male` `ext5_m_*` +
`22` `mpfb_female` `ext5_f_*`, 100% M+F parity) for four exotic DMT / visionary entities
paired with optical-illusion & psychedelic shaders:

1. **Chrysanthemum Godhead (`chrysanthemum_lattice`)** — Polycephalic Porcelain Skull-Cluster & Neon Hex Endoskeleton:
   - `head`:   `ext5_{s}_chrys_polyhead` (5-Faced Matte-Porcelain Skull Cluster, 4-Stacked Rainbow Eyes & Neon Hex Neck)
   - `torso`:  `ext5_{s}_chrys_exo`      (Porcelain Lattice Exo-Ribs over Neon Rainbow Hex-Cell Endoskeleton + `dmt_chrysanthemum` Illusion)
   - `back`:   `ext5_{s}_chrys_mandala`  (Counter-Rotating Porcelain & Thin-Film Prism Sacred-Geometry Halo)
   - `gloves`: `ext5_{s}_chrys_hands`    (Porcelain Tendon-Caged Neon Hex Forearms & Articulated Hands)
   - `legs`:   `ext5_{s}_chrys_legs`     (Neon Hex-Cell Limbs Framed by Sculpted White Porcelain Lattice Plates)
   - `feet`:   `ext5_{s}_chrys_boots`    (Matte-Porcelain & Rainbow-Veined Anatomical Boots)

2. **Compound-Eye Lotus Deva (`ocular_lotus`)** — 25-Eyed Dome Bodhisattva, 6 Neon Mudra Arms & UV Lotus Throne:
   - `head`:   `ext5_{s}_lotus_dome`     (Tessellated 25-Eye Psychedelic Compound Dome & Stepped Neon-Cube Mandala Halo)
   - `torso`:  `ext5_{s}_lotus_vestment` (UV-Blacklight Kaleidoscope Torso, Twin Chakra Bullseyes, Mala Garland & `op_art_starburst` Illusion)
   - `back`:   `ext5_{s}_lotus_arms`     (6 Fanned Neon Lime/Cobalt/Magenta Mudra Arms Holding Glowing Star-Gems)
   - `gloves`: `ext5_{s}_lotus_mudra`    (UV-Neon Forearms, Beaded Golden Bangles & Glowing Palm Chakras)
   - `legs`:   `ext5_{s}_lotus_throne`   (Levitating Multi-Petal UV-Blacklight Scarlet/Magenta/Cobalt Lotus Throne)

3. **Hyperspace Hierophant (`hyperspace_hierophant`)** — Baroque Gold-Filigree & Thin-Film Liquid-Rainbow Sovereign:
   - `head`:   `ext5_{s}_hiero_crown`     (Liquid-Rainbow & Gold-Filigree Visage, Amber Star-Eyes, 7 Spires & 14 Floating Gold Orbs)
   - `torso`:  `ext5_{s}_hiero_palace`    (Aztec-DMT Glyph & Liquid-Rainbow Filigree Cuirass, Corridor Portal & `hyperspace_tunnel` Illusion)
   - `back`:   `ext5_{s}_hiero_astrolabe` (Counter-Rotating Nested Square/Octagonal Golden Hyperspace Portals)
   - `gloves`: `ext5_{s}_hiero_gauntlets` (Thin-Film Liquid-Rainbow & Baroque Gold-Filigree Vambraces)
   - `legs`:   `ext5_{s}_hiero_greaves`   (DMT-Glyph Robe Panels w/ Cloth Chains over Liquid-Rainbow Filigree Greaves)
   - `feet`:   `ext5_{s}_hiero_sabatons`  (Baroque Gilded & Thin-Film Rainbow Sabatons)

4. **Weeping Third-Eye Oracle (`weeping_oracle`)** — Colossal Melting-Gold Third-Eye, Golden Tears & Peacock Fan:
   - `head`:   `ext5_{s}_oracle_oculus`  (Turquoise Visage, Molten-Gold Weeping Tears, Melting-Gold Crown, Giant Magenta Eye Orb & Peacock Fan)
   - `torso`:  `ext5_{s}_oracle_regalia` (Obsidian-Magenta & Turquoise Shamanic Bodice, Beaded Necklaces & `op_art_wave_star` Illusion)
   - `back`:   `ext5_{s}_oracle_flames`  (Sinuous Psychic Hot-Magenta & Liquid-Gold Wing-Tendrils)
   - `gloves`: `ext5_{s}_oracle_bangles` (Visionary Turquoise Forearms & Stacked Polychrome Shamanic Bangles)
   - `legs`:   `ext5_{s}_oracle_shroud`  (Hovering Star-Speckled Magenta-Indigo Visionary Gown Shroud)

Run standalone:
    python -u tools/garments/cultures/extraplanar_wave5.py
"""
import base64
from contextlib import contextmanager
import json
import math
import os
os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
os.environ.setdefault('OMP_NUM_THREADS', '1')
import sys
import time
from pathlib import Path
import numpy as np

CULTURES_DIR = Path(__file__).resolve().parent
ROOT = CULTURES_DIR.parents[2]  # core/charactermodels
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

import glbio
import make_mpfb
from garments import core
from garments import paint as paint_mod
from garments.core import (
    Part, J, head_frame, chest_front, set_body,
    assemble_garment as _core_assemble,
)
from garments.paint import P, PN, C
from garments.types.torso import torso_tube
from garments.types.limbs import sleeves, full_gloves, trousers
from garments.types.armor import cuirass_plate, sculpted_greaves, sculpted_vambraces
from garments.types.footwear import boots

# ===============================================================================================================
# Scoped Palette Colors (Linear RGB, `ext5_` prefixed)
# ===============================================================================================================
EXT5_COLORS = {
    # Chrysanthemum Godhead (Porcelain + Carbon + Neon Rainbow)
    'ext5_porcelain':      (0.955, 0.955, 0.965),
    'ext5_porcelain_sh':   (0.760, 0.775, 0.810),
    'ext5_carbon_void':    (0.015, 0.012, 0.022),
    'ext5_neon_magenta':   (1.000, 0.080, 0.720),
    'ext5_neon_lime':      (0.180, 1.000, 0.220),
    'ext5_neon_cyan':      (0.080, 0.920, 1.000),
    'ext5_neon_gold':      (1.000, 0.780, 0.120),
    # Compound-Eye Lotus Deva (UV Blacklight Palette)
    'ext5_uv_white':       (0.960, 0.970, 1.000),
    'ext5_uv_cobalt':      (0.060, 0.180, 0.980),
    'ext5_uv_scarlet':     (1.000, 0.120, 0.180),
    'ext5_uv_orange':      (1.000, 0.450, 0.060),
    'ext5_uv_violet':      (0.560, 0.080, 0.980),
    # Hyperspace Hierophant (Filigree Gold + Aztec DMT Glyph)
    'ext5_filigree_gold':  (0.920, 0.710, 0.220),
    'ext5_filigree_hi':    (1.000, 0.880, 0.480),
    'ext5_glyph_emerald':  (0.080, 0.860, 0.340),
    'ext5_glyph_obsidian': (0.018, 0.022, 0.032),
    # Weeping Third-Eye Oracle (Turquoise + Molten Gold + Psychic Magenta)
    'ext5_oracle_cyan':    (0.120, 0.680, 0.740),
    'ext5_oracle_deep':    (0.060, 0.020, 0.120),
    'ext5_molten_gold':    (1.000, 0.820, 0.200),
    'ext5_psychic_pink':   (0.980, 0.090, 0.680),
}
for _k, _v in EXT5_COLORS.items():
    C.setdefault(_k, _v)

FULL_HEAD_HIDE_PARTS = [
    'Human.lips',
    'Human.ears',
    'Human.eyebrow001',
    'Human.eyebrow002',
    'Human.eyelashes01',
    'Human.eyelashes02',
    'Human.low-poly',
]

ALL_BODY_HIDE_PARTS = FULL_HEAD_HIDE_PARTS + [
    'Human.nipple',
    'Human.fingernails',
    'Human.toenails',
]

EXT5_CUSTOM_MOTIFS = {
    'ext5_porcelain_pores',
    'ext5_aztec_dmt_glyph',
    'ext5_peacock_starlight',
    'ext5_uv_kaleido',
}


def _ext5_custom_motif(style, w, h, fg, bg, aspect=1.0):
    H, W = max(h, 1), max(w, 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if style == 'ext5_porcelain_pores':
        # Smooth matte ivory porcelain with delicate organic trypophobic/voronoi dark-rimmed rainbow pores (Image 9!)
        su = (u * 12.0) % 1.0 - 0.5
        sv = (v * 12.0) % 1.0 - 0.5
        r = np.hypot(su, sv)
        jitter = 0.5 + 0.5 * np.sin(np.floor(u * 12.0) * 7.3 + np.floor(v * 12.0) * 11.7)
        pore = (r < 0.22 * jitter) & (jitter > 0.55)
        rim = (r >= 0.22 * jitter) & (r < 0.30 * jitter) & (jitter > 0.55)
        hue = (u * 2.0 + v * 3.0) % 1.0
        spec = 0.55 + 0.45 * np.cos(2.0 * math.pi * (hue[:, :, None] + np.array([0.0, 0.333, 0.667])[None, None, :]))
        img[rim] = C['ext5_carbon_void']
        img[pore] = spec[pore]
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext5_aztec_dmt_glyph':
        # Labyrinthine emerald-lime, solar-gold & cobalt DMT circuit-glyphs on obsidian (Image 8!)
        gx = np.sin(u * 2.0 * math.pi * 10.0 + 1.5 * np.round(np.sin(v * 28.0)))
        gy = np.cos(v * 2.0 * math.pi * 10.0 - 1.5 * np.round(np.cos(u * 28.0)))
        maze = np.abs(gx * gy) < 0.26
        hue_band = 0.5 + 0.5 * np.sin(u * 8.0 + v * 6.0)
        glyph_col = (
            np.asarray(C['ext5_glyph_emerald'])[None, None, :] * (1.0 - hue_band)[:, :, None]
            + np.asarray(C['ext5_neon_gold'])[None, None, :] * hue_band[:, :, None]
        )
        img[:] = C['ext5_glyph_obsidian']
        img[maze] = glyph_col[maze]
        border = (v < 0.06) | (v > 0.94)
        img[border] = C['ext5_filigree_gold']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext5_peacock_starlight':
        # Star-speckled magenta-to-cyan-to-gold visionary cosmic robe & feather gradient (Image 6!)
        hue = (u * 1.4 + v * 0.8) % 1.0
        grad = (
            np.asarray(C['ext5_oracle_deep'])[None, None, :] * 0.35
            + np.asarray(C['ext5_psychic_pink'])[None, None, :] * (0.55 * (0.5 + 0.5 * np.sin(u * 12.0)))[:, :, None]
            + np.asarray(C['ext5_oracle_cyan'])[None, None, :] * (0.45 * (0.5 + 0.5 * np.cos(v * 10.0)))[:, :, None]
        )
        stars = (np.sin(u * 89.0 + v * 53.0) * np.cos(u * 61.0 - v * 97.0)) > 0.94
        img[:] = grad
        img[stars] = C['ext5_molten_gold']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext5_uv_kaleido':
        # High-saturation UV-blacklight magenta, cobalt, scarlet & gold mandala bands (Image 3!)
        w1 = np.sin(u * 2.0 * math.pi * 6.0) * np.cos(v * 2.0 * math.pi * 5.0)
        img[:] = C['ext5_uv_cobalt']
        img[w1 > 0.25] = C['ext5_neon_magenta']
        img[w1 < -0.25] = C['ext5_uv_scarlet']
        img[np.abs(w1) < 0.08] = C['ext5_neon_gold']
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def wave5_motif_scope():
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in EXT5_CUSTOM_MOTIFS:
            return _ext5_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif


# ===============================================================================================================
# Coordinate Conversion, Body Hides & Procedural Geometry Helpers
# ===============================================================================================================
def bl_to_gl_pt(p):
    return [round(float(p[0]), 5), round(float(p[2]), 5), round(float(-p[1]), 5)]


def bl_to_gl_dir(d):
    v = np.asarray(d, dtype=np.float64)
    n = max(float(np.linalg.norm(v)), 1e-9)
    v = v / n
    return [round(float(v[0]), 5), round(float(v[2]), 5), round(float(-v[1]), 5)]


def _get_base_joint_names():
    bj, _ = glbio.read_glb(core.BASE_GLB.read_bytes())
    bskin = bj['skins'][0]
    return [bj['nodes'][k].get('name', '').split(':')[-1] for k in bskin['joints']]


def select_body_tris(joint_prefixes, weight_thresh=0.30, mode='any'):
    jnames = _get_base_joint_names()
    jmask = np.array([any(nm.startswith(p) for p in joint_prefixes) for nm in jnames], dtype=bool)
    vw = (core.BASE_WW * jmask[core.BASE_JJ]).sum(axis=1)
    tw = vw[core.BT]
    if mode == 'all':
        keep = (tw >= weight_thresh).all(axis=1)
    elif mode == 'any':
        keep = (tw >= weight_thresh).any(axis=1)
    else:
        keep = tw.mean(axis=1) >= weight_thresh
    return np.nonzero(keep)[0]


def apply_custom_hide(entry, extra_tris, replace=False):
    n_bt = len(core.BT)
    if (not replace) and entry.get('hide'):
        raw = np.unpackbits(np.frombuffer(base64.b64decode(entry['hide']), dtype=np.uint8), bitorder='little')[:n_bt]
        cur = np.nonzero(raw)[0]
        tris = np.unique(np.concatenate([cur, np.asarray(extra_tris, dtype=np.int32)]))
    else:
        tris = np.unique(np.asarray(extra_tris, dtype=np.int32))
    entry['hide'] = make_mpfb.bits(n_bt, tris)
    entry['hides'] = int(len(tris))
    entry['hide_by'] = 'extraplanar_custom'
    return entry


def hide_full_body(entry):
    entry['hide_parts'] = list(ALL_BODY_HIDE_PARTS)
    return apply_custom_hide(entry, np.arange(len(core.BT), dtype=np.int32), replace=True)


def assemble_garment(gid, label, slot, parts, emitters=None, auras=None, **kw):
    kw.setdefault('allow_floating', True)
    entry = _core_assemble(gid, label, slot, 'extraplanar', parts, **kw)
    entry['culture'] = 'extraplanar'
    if emitters:
        entry.setdefault('vfx', {})['emitters'] = emitters
    if auras:
        entry.setdefault('vfx', {})['auras'] = auras
    return entry


def tag_vfx(part, vfx_dict, no_conform=True):
    if isinstance(part, (list, tuple)):
        for p in part:
            tag_vfx(p, vfx_dict, no_conform=no_conform)
        return part
    part.vfx = dict(vfx_dict)
    if no_conform:
        part.no_conform = True
    return part


def _part_raw(name, Q, closed, paint, rigid_joint=None, role='accessory', no_conform=True, vfx=None):
    pt = Part(name, np.asarray(Q, dtype=np.float64), closed, ['body'] * len(Q), paint, rigid_joint=rigid_joint, role=role)
    pt.no_conform = bool(no_conform)
    if vfx is not None:
        pt.vfx = dict(vfx)
    return pt


def _mp(bg, fab, motif_name=None, fg=None, rep=None, grain=0.010):
    if motif_name:
        return P(bg, grain, [], [PN(0.0, 1.0, motif_name, fg or bg, bg, rep)], fabric=fab)
    return P(bg, grain, fabric=fab)


def catmull_spline(ctrl_pts, n_samples):
    P_in = np.asarray(ctrl_pts, dtype=np.float64)
    if len(P_in) < 3:
        t = np.linspace(0.0, 1.0, n_samples)[:, None]
        return P_in[0] * (1.0 - t) + P_in[-1] * t
    P_ext = np.vstack([2.0 * P_in[0] - P_in[1], P_in, 2.0 * P_in[-1] - P_in[-2]])
    segs = len(P_in) - 1
    out = []
    for s_idx in range(n_samples):
        u_all = (s_idx / max(n_samples - 1, 1)) * segs
        i = min(int(math.floor(u_all)), segs - 1)
        t = u_all - i
        p0, p1, p2, p3 = P_ext[i], P_ext[i + 1], P_ext[i + 2], P_ext[i + 3]
        pt = 0.5 * (
            (2.0 * p1)
            + (-p0 + p2) * t
            + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * (t * t)
            + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * (t * t * t)
        )
        out.append(pt)
    return np.array(out, dtype=np.float64)


def sweep_tube(name, path, radii, paint, n=12, rigid_joint=None, scale_xy=(1.0, 1.0),
               ref_dir=None, cap_ends=True, vfx=None, twist=0.0):
    pts = np.asarray(path, dtype=np.float64)
    rows = len(pts)
    if isinstance(radii, (int, float)):
        r_list = np.full(rows, float(radii))
    elif len(radii) != rows:
        r_list = np.interp(np.linspace(0.0, 1.0, rows), np.linspace(0.0, 1.0, len(radii)), np.asarray(radii, dtype=np.float64))
    else:
        r_list = np.asarray(radii, dtype=np.float64)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    Q = []
    u_prev = None
    for k in range(rows):
        u_t = k / max(rows - 1, 1)
        c = pts[k]
        if k == 0:
            tang = pts[1] - pts[0]
        elif k == rows - 1:
            tang = pts[-1] - pts[-2]
        else:
            tang = pts[k + 1] - pts[k - 1]
        tn = float(np.linalg.norm(tang))
        tang = tang / tn if tn > 1e-8 else np.array([0.0, 0.0, 1.0])
        if ref_dir is not None:
            rv = np.asarray(ref_dir, dtype=np.float64)
            u_ax = rv - tang * np.dot(rv, tang)
            if np.linalg.norm(u_ax) < 1e-6:
                rv2 = np.array([1.0, 0.0, 0.0]) if abs(tang[0]) < 0.85 else np.array([0.0, 1.0, 0.0])
                u_ax = rv2 - tang * np.dot(rv2, tang)
        elif u_prev is not None:
            u_ax = u_prev - tang * np.dot(u_prev, tang)
            if np.linalg.norm(u_ax) < 1e-6:
                u_ax = np.array([1.0, 0.0, 0.0])
        else:
            rv = np.array([0.0, 1.0, 0.0]) if abs(tang[1]) < 0.86 else np.array([1.0, 0.0, 0.0])
            u_ax = rv - tang * np.dot(rv, tang)
        u_ax = u_ax / max(float(np.linalg.norm(u_ax)), 1e-8)
        u_prev = u_ax
        v_ax = np.cross(tang, u_ax)
        v_ax = v_ax / max(float(np.linalg.norm(v_ax)), 1e-8)
        if abs(twist) > 1e-5:
            tw = twist * u_t
            ct, st = math.cos(tw), math.sin(tw)
            u_ax, v_ax = u_ax * ct + v_ax * st, -u_ax * st + v_ax * ct
        cap = 0.14 if (cap_ends and k in (0, rows - 1) and rows >= 4) else 1.0
        rx = float(r_list[k]) * scale_xy[0] * cap
        ry = float(r_list[k]) * scale_xy[1] * cap
        Q.append([c + u_ax * (math.cos(a) * rx) + v_ax * (math.sin(a) * ry) for a in angs])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def ellipsoid_part(name, center, radii_xyz, paint, rigid_joint, axes=None, n=14, rows=9, vfx=None):
    c = np.asarray(center, dtype=np.float64)
    rx, ry, rz = radii_xyz
    ax_x, ax_y, ax_z = axes if axes is not None else (
        np.array([1.0, 0.0, 0.0]), np.array([0.0, 1.0, 0.0]), np.array([0.0, 0.0, 1.0])
    )
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)
    phis = np.linspace(0.08 * math.pi, 0.92 * math.pi, rows)
    Q = []
    for phi in phis:
        sp, cp = math.sin(phi), math.cos(phi)
        Q.append([
            c + ax_x * (math.cos(a) * rx * sp) + ax_y * (math.sin(a) * ry * sp) + ax_z * (rz * cp)
            for a in angs
        ])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def crystal_prism(name, center, axis_up, height, radius, paint, rigid_joint, sides=6, scale_xy=(1.0, 1.0), vfx=None):
    c = np.asarray(center, dtype=np.float64)
    ax = np.asarray(axis_up, dtype=np.float64)
    ax = ax / max(float(np.linalg.norm(ax)), 1e-8)
    u_a, v_a = core.frame(ax)
    angs = np.linspace(0.0, 2.0 * math.pi, sides, endpoint=False)
    prof = [(-0.5, 0.08), (-0.18, 0.92), (0.0, 1.0), (0.18, 0.92), (0.5, 0.08)]
    Q = []
    for hz, r_f in prof:
        rx = radius * r_f * scale_xy[0]
        ry = radius * r_f * scale_xy[1]
        Q.append([c + ax * (hz * height) + u_a * (math.cos(a) * rx) + v_a * (math.sin(a) * ry) for a in angs])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def torus_ring(name, center, normal_ax, major_r, minor_rx, minor_ry, paint, rigid_joint,
               arc=(0.0, 2.0 * math.pi), n_major=32, n_minor=8, closed_loop=True, vfx=None):
    c = np.asarray(center, dtype=np.float64)
    n_ax = np.asarray(normal_ax, dtype=np.float64)
    n_ax = n_ax / max(float(np.linalg.norm(n_ax)), 1e-8)
    u_a, v_a = core.frame(n_ax)
    thetas = np.linspace(arc[0], arc[1], n_major, endpoint=not closed_loop)
    if closed_loop:
        thetas = np.append(thetas, thetas[0])
    phis = np.linspace(0.0, 2.0 * math.pi, n_minor, endpoint=False)
    Q = []
    for th in thetas:
        r_dir = u_a * math.cos(th) + v_a * math.sin(th)
        rc = c + r_dir * major_r
        Q.append([rc + r_dir * (math.cos(ph) * minor_rx) + n_ax * (math.sin(ph) * minor_ry) for ph in phis])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


# ===============================================================================================================
# 1. CHRYSANTHEMUM GODHEAD (`chrysanthemum_lattice`) — Polycephalic Porcelain Skull-Cluster & Neon Hex Endoskeleton
#    (Refs: Images 9 & 10 + `dmt_chrysanthemum` Optical Illusion Aura)
# ===============================================================================================================
def _build_chrysanthemum_lattice(sex):
    entries = []
    porc_p     = _mp('ext5_porcelain', 'ceramic.mask.porcelain', 'ext5_porcelain_pores', 'ext5_neon_magenta', grain=0.006)
    porc_pure  = _mp('ext5_porcelain', 'ceramic.mask.porcelain', grain=0.004)
    carbon_p   = _mp('ext5_carbon_void', 'stone.obsidian.pancake_flaked', grain=0.008)
    mag_p      = _mp('ext5_neon_magenta', 'ceramic.mask.porcelain', grain=0.0)
    cyan_p     = _mp('ext5_neon_cyan', 'ceramic.mask.porcelain', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    hex_endo_vfx = {'kind': 'psychedelic_surface', 'sub_mode': 1.0, 'gain': 1.45, 'scale': 1.0}
    rainbow_eye_vfx = {'kind': 'psychedelic_surface', 'sub_mode': 0.0, 'gain': 1.95, 'scale': 2.2, 'trim_color': '#ff48e8'}

    # --- 1A. HEAD: ext5_{s}_chrys_polyhead (5-Faced Matte-Porcelain Skull Cluster & 4-Stacked Rainbow Eyes!) ---
    gid_h = f'ext5_{sex}_chrys_polyhead'
    parts_h = []
    hc = np.array([0.0, float(a_hd[1]) - 0.006, float(a_hd[2]) + 0.088])

    # Neon rainbow hex-cell endoskeleton neck column (`Image 9` glowing honeycomb throat!)
    nk = J('Neck')
    parts_h.append(sweep_tube(
        gid_h + '_hex_throat', [nk - up_w * 0.035, hc - up_h * 0.045], [0.068, 0.062],
        carbon_p, n=18, rigid_joint='Neck', vfx=hex_endo_vfx
    ))
    # 6 White porcelain tendon-struts curving down the glowing hex neck
    for si in range(6):
        ang_s = (si / 6.0) * 2.0 * math.pi + 0.25
        s_off = left_h * (math.sin(ang_s) * 0.068) + bk_h * (math.cos(ang_s) * 0.068)
        parts_h.append(sweep_tube(
            f'{gid_h}_neck_tendon_{si}',
            [hc - up_h * 0.055 + s_off * 1.05, 0.5 * (hc + nk) + s_off * 0.96, nk - up_w * 0.030 + s_off * 1.15],
            [0.009, 0.007, 0.010], porc_pure, n=7, rigid_joint='Neck'
        ))

    # Helper to sculpt a porous white-porcelain alien skull-face with stacked rainbow eyes (Image 9!)
    def _add_porcelain_face(tag_f, yaw_rad, z_drop, sc_f):
        cy_a, sy_a = math.cos(yaw_rad), math.sin(yaw_rad)
        f_fwd = -bk_h * cy_a + left_h * sy_a
        f_lft = left_h * cy_a + bk_h * sy_a
        fc = hc + f_fwd * (0.018 * (1.0 - cy_a)) + left_h * (sy_a * 0.082) - up_h * z_drop
        # Elongated sculpted porcelain cranium + tapered jaw
        parts_h.append(ellipsoid_part(
            f'{gid_h}_cranium_{tag_f}', fc + up_h * (0.032 * sc_f),
            (0.086 * sc_f, 0.098 * sc_f, 0.118 * sc_f), porc_p, 'Head',
            axes=(f_lft, -f_fwd, up_h), n=18, rows=12
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_jaw_{tag_f}', fc - up_h * (0.062 * sc_f) + f_fwd * (0.022 * sc_f),
            (0.056 * sc_f, 0.065 * sc_f, 0.058 * sc_f), porc_p, 'Head',
            axes=(f_lft, -f_fwd, up_h), n=14, rows=9
        ))
        # Stacked Double-Tier Rainbow Prism Eyes (`Image 9` iconic 4-eyed central face, 2-eyed side faces!)
        eye_rows = ((0.048, 0.030, 0.022), (-0.004, 0.032, 0.024)) if tag_f == 'C' else ((0.016, 0.028, 0.021),)
        for er_i, (ez, ex, ew) in enumerate(eye_rows):
            for sgn_e, et in ((-1.0, 'R'), (1.0, 'L')):
                ec = fc + f_fwd * (0.088 * sc_f) + f_lft * (sgn_e * ex * sc_f) + up_h * (ez * sc_f)
                parts_h.append(ellipsoid_part(
                    f'{gid_h}_sock_{tag_f}_{er_i}_{et}', ec,
                    (ew * 1.15 * sc_f, 0.012 * sc_f, ew * 0.72 * sc_f), carbon_p, 'Head',
                    axes=(f_lft, -f_fwd, up_h), n=10, rows=6
                ))
                parts_h.append(ellipsoid_part(
                    f'{gid_h}_iris_{tag_f}_{er_i}_{et}', ec + f_fwd * (0.007 * sc_f),
                    (ew * 0.85 * sc_f, 0.010 * sc_f, ew * 0.56 * sc_f), mag_p, 'Head',
                    axes=(f_lft, -f_fwd, up_h), n=10, rows=6, vfx=rainbow_eye_vfx
                ))
                parts_h.append(ellipsoid_part(
                    f'{gid_h}_pupil_{tag_f}_{er_i}_{et}', ec + f_fwd * (0.013 * sc_f),
                    (ew * 0.34 * sc_f, 0.007 * sc_f, ew * 0.34 * sc_f), carbon_p, 'Head',
                    axes=(f_lft, -f_fwd, up_h), n=8, rows=5
                ))
        if tag_f == 'C':
            # Sculpted porcelain nose bridge + glossy black lips (`Image 9`!)
            parts_h.append(sweep_tube(
                gid_h + '_nose_C',
                [fc + f_fwd * 0.094 + up_h * 0.022, fc + f_fwd * 0.108 - up_h * 0.028],
                [0.007, 0.011], porc_pure, n=7, rigid_joint='Head'
            ))
            parts_h.append(ellipsoid_part(
                gid_h + '_lips_C', fc + f_fwd * 0.092 - up_h * 0.056,
                (0.024, 0.012, 0.011), carbon_p, 'Head', axes=(f_lft, -f_fwd, up_h), n=12, rows=6
            ))

    _add_porcelain_face('C',  0.00, 0.000, 1.02)
    _add_porcelain_face('L1', 0.62, 0.022, 0.88)
    _add_porcelain_face('R1', -0.62, 0.022, 0.88)
    _add_porcelain_face('L2', 1.15, 0.052, 0.76)
    _add_porcelain_face('R2', -1.15, 0.052, 0.76)

    ent_h = assemble_garment(
        gid_h, 'Chrysanthemum Godhead 5-Faced Porcelain Skull Cluster', 'head', parts_h,
        covers_hair=True, covers_face=True
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 1B. TORSO: ext5_{s}_chrys_exo (Porcelain Lattice Exo-Ribs over Neon Hex Endoskeleton + `dmt_chrysanthemum` Illusion!) ---
    gid_t = f'ext5_{sex}_chrys_exo'
    parts_t = []
    endo_body = torso_tube(
        gid_t + '_hex_endo', core.TOP + 0.010, core.WAIST - 0.010, ease=0.008,
        paint=carbon_p, n=36, rows=14, layer=0
    )
    tag_vfx(endo_body, hex_endo_vfx, no_conform=True)
    parts_t.append(endo_body)

    endo_slv = sleeves(gid_t + '_hex_arms', 'elbow', 0.008, carbon_p, ease_end=0.010, rows=8, n=16)
    tag_vfx(endo_slv, hex_endo_vfx, no_conform=True)
    parts_t.extend(endo_slv)

    # Sculpted White Porcelain Organic Exo-Clavicles & Rib-Struts (`+22mm` outside neon hex core -> Image 9!)
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        sh = J(side + 'Arm')
        # Sweeping porcelain clavicle-shoulder arch
        clav_pts = catmull_spline([
            chest_front(core.CHEST + 0.03, 0.034, x=sgn * 0.028),
            chest_front(core.TOP - 0.01, 0.038, x=sgn * 0.095),
            sh + np.array([sgn * 0.045, 0.0, 0.028]),
        ], 10)
        parts_t.append(sweep_tube(
            f'{gid_t}_porc_clav_{tag}', clav_pts, [0.016, 0.024, 0.028], porc_pure, n=9, rigid_joint='Spine2'
        ))
        # 3 Organic porcelain rib-arches wrapping around the glowing neon hex chest
        for ri, uz in enumerate((0.72, 0.45, 0.18)):
            zv = core.WAIST + uz * (core.CHEST - core.WAIST + 0.02)
            r_pts = catmull_spline([
                chest_front(zv, 0.034, x=sgn * 0.032),
                np.array([sgn * 0.168, -0.02, zv + 0.012]),
                np.array([sgn * 0.095, 0.125, zv + 0.006]),
            ], 10)
            parts_t.append(sweep_tube(
                f'{gid_t}_porc_rib_{tag}_{ri}', r_pts, [0.013, 0.018, 0.013],
                porc_p, n=8, rigid_joint='Spine2' if ri < 2 else 'Spine1'
            ))

    ent_t = assemble_garment(
        gid_t, 'Chrysanthemum Godhead Porcelain Exo-Lattice & Neon Hex Core', 'torso', parts_t,
        auras=[{'kind': 'dmt_chrysanthemum', 'bone': 'Spine2', 'offset': [0.0, 0.08, 0.0], 'scale': 1.56}]
    )
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 1C. BACK: ext5_{s}_chrys_mandala (Counter-Rotating Porcelain & Rainbow-Prism Sacred-Geometry Halo) ---
    gid_b = f'ext5_{sex}_chrys_mandala'
    parts_b = []
    mc = np.array([0.0, 0.155, core.SHOULDER + 0.045])
    mc_gl = bl_to_gl_pt(mc)
    kin_m1 = {'bone': 'Spine2', 'motion': 'orbit', 'speed': 0.48, 'amp': 0.006, 'phase': 0.0, 'center_gl': mc_gl, 'axis_gl': [0.0, 0.0, 1.0]}
    kin_m2 = {'bone': 'Spine2', 'motion': 'orbit', 'speed': -0.68, 'amp': 0.006, 'phase': 1.2, 'center_gl': mc_gl, 'axis_gl': [0.0, 0.0, 1.0]}
    parts_b.append(torus_ring(
        gid_b + '_outer_ring', mc, fwd, 0.34, 0.013, 0.010, porc_pure, 'Spine2',
        n_major=12, n_minor=7, vfx={'kind': 'standard', 'kinetic': kin_m1}
    ))
    parts_b.append(torus_ring(
        gid_b + '_inner_ring', mc, fwd, 0.21, 0.011, 0.009, porc_pure, 'Spine2',
        n_major=12, n_minor=7, vfx={'kind': 'standard', 'kinetic': kin_m2}
    ))
    for pi in range(12):
        ang = (pi / 12.0) * 2.0 * math.pi
        pd = left_w * math.cos(ang) + up_w * math.sin(ang)
        parts_b.append(crystal_prism(
            f'{gid_b}_prism_{pi}', mc + pd * 0.275, pd, 0.085, 0.022, cyan_p, 'Spine2', sides=6,
            vfx=dict(rainbow_eye_vfx, kinetic=kin_m1)
        ))
    entries.append(assemble_garment(gid_b, 'Chrysanthemum Godhead Sacred-Geometry Porcelain Halo', 'back', parts_b))

    # --- 1D. GLOVES: ext5_{s}_chrys_hands (Porcelain Tendon-Caged Neon Hex Forearms & Hands) ---
    gid_g = f'ext5_{sex}_chrys_hands'
    parts_g = []
    glv_c = full_gloves(gid_g, porc_pure, porc_p, carbon_p, f0=0.16, ease=0.008)
    parts_g.extend(glv_c)
    parts_g.extend(sculpted_vambraces(gid_g + '_vamb', porc_p, trim_paint=porc_pure, couter=True, ease=0.014))
    ent_g = assemble_garment(gid_g, 'Chrysanthemum Godhead Porcelain Lattice Gauntlets', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 1E. LEGS: ext5_{s}_chrys_legs (Neon Hex-Cell Limbs Framed by Sculpted Porcelain Plates) ---
    gid_l = f'ext5_{sex}_chrys_legs'
    parts_l = []
    hex_trs = trousers(gid_l + '_hex_legs', carbon_p, ease=0.008, cuff=core.ANKLE + 0.05, bag=0.004)
    tag_vfx(hex_trs, hex_endo_vfx, no_conform=True)
    parts_l.extend(hex_trs)
    parts_l.extend(sculpted_greaves(gid_l + '_porc_greaves', porc_p, trim_paint=porc_pure, poleyn=True, ease=0.018))
    ent_l = assemble_garment(gid_l, 'Chrysanthemum Godhead Neon-Hex & Porcelain Legs', 'legs', parts_l, legged=True)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 1F. FEET: ext5_{s}_chrys_boots (Matte-Porcelain & Rainbow-Veined Boots) ---
    gid_f = f'ext5_{sex}_chrys_boots'
    parts_f = boots(gid_f, porc_pure, porc_p, top=0.30, wraps=1, wrap_paint=mag_p, ease_top=0.018)
    entries.append(assemble_garment(gid_f, 'Chrysanthemum Godhead Porcelain Boots', 'feet', parts_f))
    return entries


# ===============================================================================================================
# 2. COMPOUND-EYE LOTUS DEVA (`ocular_lotus`) — 25-Eyed Dome Bodhisattva, 6 Neon Arms & UV Lotus Throne
#    (Refs: Images 3, 2, 11 + `op_art_starburst` Optical Illusion Aura)
# ===============================================================================================================
def _build_ocular_lotus(sex):
    entries = []
    uv_white   = _mp('ext5_uv_white', 'ceramic.mask.porcelain', grain=0.004)
    uv_kaleido = _mp('ext5_uv_cobalt', 'cloth.silk', 'ext5_uv_kaleido', 'ext5_neon_magenta', grain=0.008)
    carbon_p   = _mp('ext5_carbon_void', 'ceramic.mask.porcelain', grain=0.0)
    cobalt_p   = _mp('ext5_uv_cobalt', 'ceramic.mask.porcelain', grain=0.0)
    mag_p      = _mp('ext5_neon_magenta', 'ceramic.mask.porcelain', grain=0.0)
    lime_p     = _mp('ext5_neon_lime', 'ceramic.mask.porcelain', grain=0.0)
    scar_p     = _mp('ext5_uv_scarlet', 'ceramic.mask.porcelain', grain=0.0)
    gold_p     = _mp('ext5_neon_gold', 'ceramic.mask.porcelain', grain=0.0)
    orange_p   = _mp('ext5_uv_orange', 'ceramic.mask.porcelain', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    # --- 2A. HEAD: ext5_{s}_lotus_dome (Oversized Tessellated 25-Eye Psychedelic Dome & Stepped Neon-Cube Halo — Image 3!) ---
    gid_h = f'ext5_{sex}_lotus_dome'
    parts_h = []
    hc = np.array([0.0, float(a_hd[1]) - 0.006, float(a_hd[2]) + 0.115])

    # Broad sculpted white-and-cobalt compound-eye dome (`rx=0.178, ry=0.148, rz=0.156`)
    parts_h.append(ellipsoid_part(
        gid_h + '_compound_dome', hc, (0.178, 0.148, 0.156), uv_white, 'Head',
        axes=(left_h, bk_h, up_h), n=24, rows=14
    ))
    # Tapered cobalt-blue neck pedestal (`Image 3` blue lattice neck under white dome!)
    parts_h.append(sweep_tube(
        gid_h + '_cobalt_neck', [J('Neck') - up_w * 0.02, hc - up_h * 0.105], [0.064, 0.115],
        cobalt_p, n=16, rigid_joint='Head', vfx={'kind': 'emissive_blaze', 'color': '#1e4cff', 'gain': 1.35, 'pulse': 0.12}
    ))

    # 25 Tessellated 3D Psychedelic Almond Eyes tiled across 4 latitude bands of the front hemisphere (Image 3!)
    iris_palette = [
        (cobalt_p, '#2458ff'),
        (mag_p,    '#ff18c8'),
        (lime_p,   '#2eff48'),
        (orange_p, '#ff6814'),
    ]
    eye_bands = [
        ( 0.42, 5, 0.032),
        ( 0.14, 7, 0.035),
        (-0.14, 7, 0.035),
        (-0.40, 6, 0.030),
    ]
    ei_counter = 0
    for lat_rad, n_e, ew in eye_bands:
        clat, slat = math.cos(lat_rad), math.sin(lat_rad)
        for k_e in range(n_e):
            u_lon = (k_e / max(n_e - 1, 1)) * 2.0 - 1.0  # -1..+1 across front arc
            lon_rad = u_lon * 1.12
            n_vec = left_h * (math.sin(lon_rad) * clat) - bk_h * (math.cos(lon_rad) * clat) + up_h * slat
            n_vec = n_vec / np.linalg.norm(n_vec)
            e_pos = hc + left_h * (0.176 * math.sin(lon_rad) * clat) - bk_h * (0.146 * math.cos(lon_rad) * clat) + up_h * (0.154 * slat)
            t_lft = np.cross(up_h, n_vec)
            t_lft = t_lft / max(float(np.linalg.norm(t_lft)), 1e-6)
            t_up = np.cross(n_vec, t_lft)
            ip, ihex = iris_palette[ei_counter % 4]
            ei_counter += 1
            # Sculpted dark-indigo lash socket rim + crisp white sclera bulge + neon iris + jet-black pupil!
            parts_h.append(ellipsoid_part(
                f'{gid_h}_rim_{ei_counter}', e_pos - n_vec * 0.002, (ew * 1.26, 0.013, ew * 0.76), cobalt_p, 'Head',
                axes=(t_lft, n_vec, t_up), n=10, rows=6
            ))
            parts_h.append(ellipsoid_part(
                f'{gid_h}_lid_{ei_counter}', e_pos + n_vec * 0.002, (ew * 1.12, 0.015, ew * 0.64), uv_white, 'Head',
                axes=(t_lft, n_vec, t_up), n=10, rows=6
            ))
            parts_h.append(ellipsoid_part(
                f'{gid_h}_iris_{ei_counter}', e_pos + n_vec * 0.010, (ew * 0.58, 0.011, ew * 0.52), ip, 'Head',
                axes=(t_lft, n_vec, t_up), n=9, rows=5,
                vfx={'kind': 'emissive_blaze', 'color': ihex, 'gain': 1.85, 'pulse': 0.16}
            ))
            parts_h.append(ellipsoid_part(
                f'{gid_h}_pupil_{ei_counter}', e_pos + n_vec * 0.017, (ew * 0.25, 0.007, ew * 0.28), carbon_p, 'Head',
                axes=(t_lft, n_vec, t_up), n=8, rows=5
            ))

    # Stepped 3D Neon-Cube Mandala Halo framing the Compound-Eye Dome (`Image 3` red/gold/lime pixel-cube arch!)
    cube_colors = [(lime_p, '#34ff3c', 0.255), (gold_p, '#ffc81e', 0.222), (scar_p, '#ff2438', 0.192)]
    for ring_i, (cp_p, cp_hex, r_halo) in enumerate(cube_colors):
        n_cubes = 18 - ring_i * 2
        for ci in range(n_cubes):
            ang_c = -0.22 * math.pi + (ci / max(n_cubes - 1, 1)) * 1.44 * math.pi
            cc = hc + left_h * (math.cos(ang_c) * (r_halo + 0.035)) + up_h * (math.sin(ang_c) * r_halo) + bk_h * (0.045 + 0.012 * ring_i)
            parts_h.append(crystal_prism(
                f'{gid_h}_halo_cube_{ring_i}_{ci}', cc, up_h, 0.036, 0.024, cp_p, 'Head', sides=4,
                vfx={'kind': 'emissive_blaze', 'color': cp_hex, 'gain': 1.65, 'pulse': 0.14}
            ))

    ent_h = assemble_garment(
        gid_h, 'Lotus Deva 25-Eye Compound Dome & Neon Cube Halo', 'head', parts_h,
        covers_hair=True, covers_face=True
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 2B. TORSO: ext5_{s}_lotus_vestment (UV-Kaleidoscope Bodice, Twin Chakra Bullseyes, Mala Garland & `op_art_starburst` Aura!) ---
    gid_t = f'ext5_{sex}_lotus_vestment'
    parts_t = []
    kaleido_vfx = {'kind': 'psychedelic_surface', 'sub_mode': 2.0, 'gain': 1.35, 'scale': 1.0}
    uv_trunk = torso_tube(
        gid_t + '_uv_body', core.TOP + 0.010, core.WAIST - 0.015, ease=0.014,
        paint=uv_kaleido, n=36, rows=13
    )
    tag_vfx(uv_trunk, kaleido_vfx, no_conform=True)
    parts_t.append(uv_trunk)

    uv_slv = sleeves(gid_t + '_uv_arms', 'elbow', 0.010, uv_kaleido, ease_end=0.012, rows=8, n=16)
    tag_vfx(uv_slv, kaleido_vfx, no_conform=True)
    parts_t.extend(uv_slv)

    # Twin Glowing Chakra-Orb Medallions on sternum (`Image 3`!)
    for chi, (cz, c_hex) in enumerate(((core.CHEST + 0.02, '#28ff58'), (core.CHEST - 0.08, '#ff24d8'))):
        chk_c = chest_front(cz, 0.032, x=0.0)
        parts_t.append(torus_ring(
            f'{gid_t}_chakra_ring_{chi}', chk_c, fwd, 0.038, 0.008, 0.008, cobalt_p, 'Spine2', n_major=18, n_minor=6
        ))
        parts_t.append(ellipsoid_part(
            f'{gid_t}_chakra_core_{chi}', chk_c, (0.022, 0.012, 0.022), lime_p if chi == 0 else mag_p, 'Spine2',
            n=12, rows=7, vfx={'kind': 'emissive_blaze', 'color': c_hex, 'gain': 2.15, 'pulse': 0.20}
        ))

    # Scarlet-and-Gold Beaded Mala Garland looping from shoulders across abdomen (`Image 3`!)
    mala_pts = [
        chest_front(core.TOP - 0.005, 0.036, x=-0.095),
        chest_front(core.CHEST - 0.04, 0.044, x=-0.082),
        chest_front(core.WAIST + 0.03, 0.046, x=0.0),
        chest_front(core.CHEST - 0.04, 0.044, x=0.082),
        chest_front(core.TOP - 0.005, 0.036, x=0.095),
    ]
    for bi_m, b_pt in enumerate(catmull_spline(mala_pts, 19)):
        parts_t.append(ellipsoid_part(
            f'{gid_t}_mala_bead_{bi_m}', b_pt, (0.014, 0.014, 0.014),
            scar_p if bi_m % 2 == 0 else gold_p, 'Spine2', n=8, rows=6,
            vfx={'kind': 'emissive_blaze', 'color': '#ff2838' if bi_m % 2 == 0 else '#ffd028', 'gain': 1.55, 'pulse': 0.12}
        ))

    ent_t = assemble_garment(
        gid_t, 'Lotus Deva UV-Kaleidoscope Vestment & Mala Garland', 'torso', parts_t,
        auras=[{'kind': 'op_art_starburst', 'bone': 'Spine1', 'offset': [0.0, 0.06, 0.0], 'scale': 1.52}]
    )
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 2C. BACK: ext5_{s}_lotus_arms (6 Fanned Radiant Neon Deva Arms w/ Glowing Palm Star-Gems — Image 3!) ---
    gid_b = f'ext5_{sex}_lotus_arms'
    parts_b = []
    deva_tiers = [
        # (tier_idx, z_rise, x_span, arm_paint, arm_hex, gem_paint, gem_hex)
        (0,  0.30, 0.55, lime_p,   '#2eff48', scar_p, '#ff2838'),
        (1,  0.04, 0.60, cobalt_p, '#2864ff', gold_p, '#ffd828'),
        (2, -0.22, 0.54, mag_p,    '#ff20c8', lime_p, '#38ff58'),
    ]
    for sgn, tag in ((1.0, 'L'), (-1.0, 'R')):
        sh = J(('Left' if sgn > 0 else 'Right') + 'Arm')
        for ti, z_r, x_sp, a_p, a_hex, g_p, g_hex in deva_tiers:
            root_d = sh + np.array([-sgn * 0.02, 0.08, -0.02 - 0.04 * ti])
            elb_d  = root_d + np.array([sgn * (0.52 * x_sp), 0.03, 0.35 * z_r - 0.05])
            palm_d = root_d + np.array([sgn * x_sp, -0.02, z_r])
            kin_da = {
                'bone': 'Spine2', 'motion': 'chorus_wave', 'speed': 1.55, 'amp': 0.018,
                'phase': ti * 0.95 + (0.0 if sgn > 0 else 1.5),
                'center_gl': bl_to_gl_pt(root_d), 'axis_gl': [0.0, 0.0, 1.0],
            }
            arm_vfx = {'kind': 'emissive_blaze', 'color': a_hex, 'gain': 1.65, 'pulse': 0.14, 'kinetic': kin_da}
            parts_b.append(sweep_tube(
                f'{gid_b}_arm_{tag}_{ti}', catmull_spline([root_d, elb_d, palm_d], 11),
                [0.024, 0.019, 0.016, 0.022], a_p, n=8, rigid_joint='Spine2', vfx=arm_vfx
            ))
            # Open mudra palm + 5 fanned neon fingers + glowing sacred-geometry palm star!
            u_arm = palm_d - elb_d
            u_arm = u_arm / max(float(np.linalg.norm(u_arm)), 1e-6)
            for fi, f_ang in enumerate((-0.55, -0.28, 0.0, 0.28, 0.55)):
                f_dir = u_arm * math.cos(f_ang) + up_w * (math.sin(f_ang) * 0.85)
                f_dir = f_dir / np.linalg.norm(f_dir)
                parts_b.append(sweep_tube(
                    f'{gid_b}_finger_{tag}_{ti}_{fi}', [palm_d, palm_d + f_dir * 0.085],
                    [0.0065, 0.0022], a_p, n=5, rigid_joint='Spine2', vfx=arm_vfx
                ))
            parts_b.append(crystal_prism(
                f'{gid_b}_palm_gem_{tag}_{ti}', palm_d - fwd * 0.018, fwd, 0.028, 0.024, g_p, 'Spine2', sides=6,
                vfx={'kind': 'emissive_blaze', 'color': g_hex, 'gain': 2.25, 'pulse': 0.22, 'kinetic': kin_da}
            ))
    entries.append(assemble_garment(gid_b, 'Lotus Deva Six Radiant Neon Mudra Arms', 'back', parts_b))

    # --- 2D. GLOVES: ext5_{s}_lotus_mudra (UV-Neon Forearms & Golden Bangles) ---
    gid_g = f'ext5_{sex}_lotus_mudra'
    parts_g = []
    glv_l = full_gloves(gid_g, uv_kaleido, mag_p, gold_p, f0=0.16, ease=0.008)
    tag_vfx(glv_l, kaleido_vfx, no_conform=True)
    parts_g.extend(glv_l)
    for side in ('Left', 'Right'):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        for bi in range(3):
            parts_g.append(torus_ring(
                f'{gid_g}_bangle_{side}_{bi}', el + d_fa * (0.66 + 0.09 * bi), d_fa,
                0.044, 0.007, 0.006, gold_p, side + 'ForeArm', n_major=18, n_minor=6,
                vfx={'kind': 'emissive_blaze', 'color': '#ffd838', 'gain': 1.75, 'pulse': 0.10}
            ))
    ent_g = assemble_garment(gid_g, 'Lotus Deva UV-Neon Forearms & Golden Bangles', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 2E. LEGS: ext5_{s}_lotus_throne (Levitating Multi-Petal UV-Blacklight Neon Lotus Throne — Image 3!) ---
    gid_l = f'ext5_{sex}_lotus_throne'
    parts_l = []
    tc = np.array([0.0, 0.0, core.WAIST - 0.26])
    # Meditative folded-robe lotus cushion core connecting cleanly from `core.WAIST + 0.02` down into the lotus cup!
    rows_p = 12
    angs_p = np.linspace(0.0, 2.0 * math.pi, 28, endpoint=False)
    Q_pod = []
    for kp_i, zv in enumerate(np.linspace(core.WAIST + 0.020, core.WAIST - 0.34, rows_p)):
        up_f = kp_i / (rows_p - 1)
        # Flares smoothly into a wide meditative lotus cushion then tapers at the base!
        swell = math.sin(up_f * math.pi * 0.88)
        rx = 0.145 + 0.165 * swell
        ry = 0.115 + 0.135 * swell
        Q_pod.append([[math.sin(a) * rx, math.cos(a) * ry, zv] for a in angs_p])
    parts_l.append(_part_raw(gid_l + '_lotus_cushion', Q_pod, True, uv_kaleido, rigid_joint='Hips', vfx=kaleido_vfx))

    # 2 Concentric Rings of Sculpted Upturned 3D UV-Neon Lotus Petals (`10` inner magenta/cobalt + `12` outer scarlet/gold!)
    petal_rings = [
        (10, 0.25, 0.22, mag_p,  '#ff20d0'),
        (12, 0.32, 0.26, scar_p, '#ff2838'),
    ]
    for ri_p, (n_pet, r_base, h_pet, p_paint, p_hex) in enumerate(petal_rings):
        for pi in range(n_pet):
            ang = (pi / float(n_pet)) * 2.0 * math.pi + ri_p * 0.26
            r_dir = np.array([math.sin(ang), math.cos(ang), 0.0])
            p0 = tc + r_dir * (r_base * 0.45) - up_w * 0.08
            p1 = tc + r_dir * r_base - up_w * 0.02
            p2 = tc + r_dir * (r_base * 1.16) + up_w * h_pet
            parts_l.append(sweep_tube(
                f'{gid_l}_petal_{ri_p}_{pi}', catmull_spline([p0, p1, p2], 9),
                [0.018, 0.056, 0.068, 0.048, 0.008], p_paint, n=8, rigid_joint='Hips',
                scale_xy=(1.35, 0.28), ref_dir=np.array([-math.cos(ang), math.sin(ang), 0.0]),
                vfx={'kind': 'emissive_blaze', 'color': p_hex, 'gain': 1.55, 'pulse': 0.14}
            ))

    ent_l = assemble_garment(gid_l, 'Lotus Deva Levitating UV-Blacklight Lotus Throne', 'legs', parts_l)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


# ===============================================================================================================
# 3. HYPERSPACE HIEROPHANT (`hyperspace_hierophant`) — Baroque Gold-Filigree & Liquid-Rainbow Sovereign
#    (Refs: Images 13, 15, 8 + `hyperspace_tunnel` Infinite Perspective Corridor Illusion Aura)
# ===============================================================================================================
def _build_hyperspace_hierophant(sex):
    entries = []
    gold_p    = _mp('ext5_filigree_gold', 'ceramic.mask.porcelain', grain=0.008)
    gold_hi   = _mp('ext5_filigree_hi', 'ceramic.mask.porcelain', grain=0.006)
    carbon_p  = _mp('ext5_carbon_void', 'ceramic.mask.porcelain', grain=0.0)
    glyph_p   = _mp('ext5_glyph_obsidian', 'cloth.silk', 'ext5_aztec_dmt_glyph', 'ext5_glyph_emerald', grain=0.008)
    cyan_p    = _mp('ext5_neon_cyan', 'ceramic.mask.porcelain', grain=0.0)
    amber_p   = _mp('ext5_neon_gold', 'ceramic.mask.porcelain', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    film_vfx = {'kind': 'psychedelic_surface', 'sub_mode': 0.0, 'gain': 1.38, 'scale': 1.15, 'trim_color': '#ffd65c'}
    gold_glow = {'kind': 'emissive_blaze', 'color': '#ffd254', 'gain': 1.35, 'pulse': 0.06}
    amber_eye = {'kind': 'emissive_blaze', 'color': '#ffbe34', 'gain': 2.35, 'pulse': 0.18}

    # --- 3A. HEAD: ext5_{s}_hiero_crown (Liquid-Rainbow & Gold-Filigree Visage, 7 Spires & 14 Floating Gold Orbs — Image 15!) ---
    gid_h = f'ext5_{sex}_hiero_crown'
    parts_h = []
    hc = np.array([0.0, float(a_hd[1]) - 0.005, float(a_hd[2]) + 0.085])

    parts_h.append(ellipsoid_part(
        gid_h + '_filigree_visage', hc, (0.092, 0.104, 0.122), gold_p, 'Head',
        axes=(left_h, bk_h, up_h), n=20, rows=13, vfx=film_vfx
    ))
    # Baroque Golden-Filigree Brow Arches, Sculpted Nose Bridge & Serene Lips (`Image 15`!)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ec = hc + left_h * (sgn * 0.036) - bk_h * 0.101 + up_h * 0.010
        parts_h.append(sweep_tube(
            f'{gid_h}_brow_arch_{tag}',
            catmull_spline([
                hc - bk_h * 0.105 + up_h * 0.018,
                hc + left_h * (sgn * 0.038) - bk_h * 0.103 + up_h * 0.032,
                hc + left_h * (sgn * 0.072) - bk_h * 0.078 + up_h * 0.020,
            ], 8),
            [0.007, 0.0055, 0.003], gold_hi, n=6, rigid_joint='Head', vfx=gold_glow
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_eye_rim_{tag}', ec, (0.022, 0.009, 0.014), carbon_p, 'Head',
            axes=(left_h, bk_h, up_h), n=10, rows=6
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_eye_{tag}', ec - bk_h * 0.005, (0.018, 0.009, 0.011), amber_p, 'Head',
            axes=(left_h, bk_h, up_h), n=10, rows=6, vfx=amber_eye
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_pupil_{tag}', ec - bk_h * 0.011, (0.0045, 0.005, 0.0095), carbon_p, 'Head',
            axes=(left_h, bk_h, up_h), n=8, rows=5
        ))
    parts_h.append(sweep_tube(
        gid_h + '_nose_filigree',
        [hc - bk_h * 0.104 + up_h * 0.020, hc - bk_h * 0.116 - up_h * 0.028],
        [0.006, 0.010], gold_hi, n=7, rigid_joint='Head', vfx=gold_glow
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_lips_gold', hc - bk_h * 0.100 - up_h * 0.055,
        (0.022, 0.009, 0.009), gold_hi, 'Head', axes=(left_h, bk_h, up_h), n=10, rows=6, vfx=gold_glow
    ))
    parts_h.append(crystal_prism(
        gid_h + '_brow_drop', hc - bk_h * 0.106 + up_h * 0.056, up_h, 0.068, 0.020, cyan_p, 'Head',
        sides=6, vfx=film_vfx
    ))

    # 7 Sweeping Liquid-Rainbow & Gold-Filigree Antenna Spires + 14 Floating Beaded Golden Orbs (`Image 15`!)
    for si in range(7):
        u_s = (si / 6.0) * 2.0 - 1.0
        ang_s = u_s * 1.05
        s_dir = left_h * math.sin(ang_s) + up_h * math.cos(ang_s) + bk_h * 0.12
        s_dir = s_dir / np.linalg.norm(s_dir)
        s_len = 0.26 - 0.06 * abs(u_s)
        p0 = hc + s_dir * 0.095
        p1 = hc + s_dir * (0.095 + s_len)
        parts_h.append(sweep_tube(
            f'{gid_h}_spire_{si}', catmull_spline([p0, 0.5 * (p0 + p1) - bk_h * 0.015, p1], 9),
            np.linspace(0.020, 0.0025, 9), gold_hi, n=8, rigid_joint='Head', vfx=film_vfx
        ))
        # Twin levitating golden filigree spheres flanking each spire!
        for oi, r_f in enumerate((0.55, 0.92)):
            oc = p0 * (1.0 - r_f) + p1 * r_f + left_h * ((0.028 if oi == 0 else -0.022) * (1.0 if u_s >= 0 else -1.0)) + up_h * 0.022
            parts_h.append(ellipsoid_part(
                f'{gid_h}_orb_{si}_{oi}', oc, (0.015, 0.015, 0.015), gold_hi, 'Head',
                n=10, rows=6, vfx=film_vfx if oi == 1 else None
            ))

    ent_h = assemble_garment(
        gid_h, 'Hyperspace Hierophant Filigree-Rainbow Visage & Beaded Spire Crown', 'head', parts_h,
        covers_hair=True, covers_face=True
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 3B. TORSO: ext5_{s}_hiero_palace (Aztec-DMT Glyph & Liquid-Rainbow Cuirass + `hyperspace_tunnel` Illusion!) ---
    gid_t = f'ext5_{sex}_hiero_palace'
    parts_t = []
    cuir_h = cuirass_plate(
        gid_t + '_cuirass', glyph_p, trim_paint=gold_hi, style='gothic',
        z_top=core.TOP - 0.010, z_bot=core.WAIST - 0.008, ease=0.020, keel=0.022, faulds=1
    )
    for cp in cuir_h:
        cp.no_conform = True
    parts_t.extend(cuir_h)

    slv_h = sleeves(gid_t + '_arms', 'elbow', 0.012, glyph_p, ease_end=0.016, rows=8, n=16)
    for sp in slv_h:
        sp.no_conform = True
    parts_t.extend(slv_h)

    # Swirled Liquid-Rainbow Soap-Film Shoulder Discs (`Image 15` lower-left rainbow whorl pauldrons!)
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        sh = J(side + 'Arm')
        parts_t.append(ellipsoid_part(
            f'{gid_t}_whorl_pauldron_{tag}', sh + np.array([sgn * 0.042, -0.005, 0.025]),
            (0.068, 0.072, 0.042), gold_p, 'Spine2', n=18, rows=10, vfx=film_vfx
        ))
        parts_t.append(torus_ring(
            f'{gid_t}_pauldron_rim_{tag}', sh + np.array([sgn * 0.042, -0.005, 0.025]),
            np.array([sgn * 0.75, 0.0, 0.65]), 0.068, 0.008, 0.008, gold_hi, 'Spine2', n_major=22, n_minor=6
        ))

    # Glowing Hyperspace Vanishing-Point Portal on sternum
    st_c = chest_front(core.CHEST + 0.01, 0.038, x=0.0)
    parts_t.append(torus_ring(
        gid_t + '_portal_frame', st_c, fwd, 0.052, 0.009, 0.009, gold_hi, 'Spine2', n_major=4, n_minor=6
    ))
    parts_t.append(crystal_prism(
        gid_t + '_portal_core', st_c - fwd * 0.005, fwd, 0.022, 0.042, cyan_p, 'Spine2', sides=4,
        vfx={'kind': 'emissive_blaze', 'color': '#42f6ff', 'gain': 2.40, 'pulse': 0.20}
    ))

    ent_t = assemble_garment(
        gid_t, 'Hyperspace Hierophant Filigree-Rainbow & DMT-Glyph Cuirass', 'torso', parts_t,
        auras=[{'kind': 'hyperspace_tunnel', 'bone': 'Spine1', 'offset': [0.0, 0.06, 0.0], 'scale': 1.54}]
    )
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 3C. BACK: ext5_{s}_hiero_astrolabe (Counter-Rotating Nested Square Golden Hyperspace Portals — Image 13!) ---
    gid_b = f'ext5_{sex}_hiero_astrolabe'
    parts_b = []
    ac = np.array([0.0, 0.155, core.SHOULDER + 0.035])
    ac_gl = bl_to_gl_pt(ac)
    for ri, (rad_sq, spd_sq) in enumerate(((0.34, 0.42), (0.24, -0.65), (0.15, 0.92))):
        kin_sq = {'bone': 'Spine2', 'motion': 'orbit', 'speed': spd_sq, 'amp': 0.006, 'phase': ri * 0.8, 'center_gl': ac_gl, 'axis_gl': [0.0, 0.0, 1.0]}
        parts_b.append(torus_ring(
            f'{gid_b}_sq_portal_{ri}', ac + np.array([0.0, 0.012 * ri, 0.0]), fwd,
            rad_sq, 0.012, 0.010, gold_hi, 'Spine2', n_major=4, n_minor=7,
            vfx=dict(film_vfx, kinetic=kin_sq) if ri == 1 else dict(gold_glow, kinetic=kin_sq)
        ))
    entries.append(assemble_garment(gid_b, 'Hyperspace Hierophant Nested Corridor Portals', 'back', parts_b))

    # --- 3D. GLOVES: ext5_{s}_hiero_gauntlets (Thin-Film Rainbow & Gold-Filigree Vambraces) ---
    gid_g = f'ext5_{sex}_hiero_gauntlets'
    parts_g = []
    parts_g.extend(full_gloves(gid_g, gold_p, gold_hi, gold_hi, f0=0.75, ease=0.010, knuckle_paint=gold_hi))
    vmb = sculpted_vambraces(gid_g + '_vamb', gold_p, trim_paint=gold_hi, couter=True, ease=0.015)
    tag_vfx(vmb, film_vfx, no_conform=True)
    parts_g.extend(vmb)
    ent_g = assemble_garment(gid_g, 'Hyperspace Hierophant Filigree-Rainbow Gauntlets', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 3E. LEGS: ext5_{s}_hiero_greaves (DMT-Glyph Robe Panels w/ Cloth Chains over Filigree-Rainbow Greaves) ---
    gid_l = f'ext5_{sex}_hiero_greaves'
    parts_l = []
    parts_l.extend(trousers(gid_l + '_under', glyph_p, ease=0.010, cuff=core.ANKLE + 0.05, bag=0.005))
    grv = sculpted_greaves(gid_l + '_greaves', gold_p, trim_paint=gold_hi, poleyn=True, ease=0.016)
    tag_vfx(grv, film_vfx, no_conform=True)
    parts_l.extend(grv)
    robe_tails = torso_tube(
        gid_l + '_glyph_skirt', core.WAIST + 0.008, core.KNEE - 0.04, ease=0.032,
        paint=glyph_p, n=36, arc=(-0.74 * math.pi, 0.74 * math.pi),
        hang_from=core.WAIST, flare=0.14, stiff=0.14, layer=1
    )
    robe_tails.no_conform = True
    parts_l.append(robe_tails)
    ent_l = assemble_garment(gid_l, 'Hyperspace Hierophant DMT-Glyph Robe & Filigree Greaves', 'legs', parts_l, legged=True)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 3F. FEET: ext5_{s}_hiero_sabatons (Baroque Gilded & Thin-Film Rainbow Sabatons) ---
    gid_f = f'ext5_{sex}_hiero_sabatons'
    parts_f = boots(gid_f, gold_p, gold_hi, top=0.30, wraps=2, wrap_paint=gold_hi, ease_top=0.020)
    tag_vfx(parts_f, film_vfx, no_conform=True)
    entries.append(assemble_garment(gid_f, 'Hyperspace Hierophant Thin-Film Sabatons', 'feet', parts_f))
    return entries


# ===============================================================================================================
# 4. WEEPING THIRD-EYE ORACLE (`weeping_oracle`) — Giant Melting-Gold Eye Orb, Golden Tears & Peacock Fan
#    (Refs: Images 14, 12, 6, 7 + `op_art_wave_star` Warped-Stripe Star Optical Illusion Aura)
# ===============================================================================================================
def _build_weeping_oracle(sex):
    entries = []
    cyan_skin  = _mp('ext5_oracle_cyan', 'ceramic.mask.porcelain', grain=0.006)
    star_robe  = _mp('ext5_oracle_deep', 'cloth.silk', 'ext5_peacock_starlight', 'ext5_molten_gold', grain=0.008)
    carbon_p   = _mp('ext5_carbon_void', 'ceramic.mask.porcelain', grain=0.0)
    molten_p   = _mp('ext5_molten_gold', 'ceramic.mask.porcelain', grain=0.0)
    pink_p     = _mp('ext5_psychic_pink', 'ceramic.mask.porcelain', grain=0.0)
    white_p    = _mp('ext5_uv_white', 'ceramic.mask.porcelain', grain=0.0)
    gold_m     = _mp('ext5_filigree_gold', 'ceramic.mask.porcelain', grain=0.006)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    gold_blaze = {'kind': 'emissive_blaze', 'color': '#ffe048', 'gain': 2.15, 'pulse': 0.16}
    cyan_blaze = {'kind': 'emissive_blaze', 'color': '#62f8ff', 'gain': 2.20, 'pulse': 0.14}
    pink_blaze = {'kind': 'emissive_blaze', 'color': '#ff1eb8', 'gain': 2.15, 'pulse': 0.18}
    white_blaze = {'kind': 'emissive_blaze', 'color': '#ffffff', 'gain': 2.50, 'pulse': 0.05}

    # --- 4A. HEAD: ext5_{s}_oracle_oculus (Turquoise Face, Weeping Molten-Gold Tears, V-Wing Tiara, Giant Magenta Eye & Peacock Fan!) ---
    gid_h = f'ext5_{sex}_oracle_oculus'
    parts_h = []
    hc = np.array([0.0, float(a_hd[1]) - 0.005, float(a_hd[2]) + 0.078])

    # Serene Turquoise-Cyan Visionary Face, Nose Bridge & Lips (`Image 14` & `Image 6`!)
    parts_h.append(ellipsoid_part(
        gid_h + '_cyan_visage', hc, (0.088, 0.098, 0.114), cyan_skin, 'Head',
        axes=(left_h, bk_h, up_h), n=20, rows=13
    ))
    parts_h.append(sweep_tube(
        gid_h + '_cyan_nose',
        [hc - bk_h * 0.098 + up_h * 0.018, hc - bk_h * 0.112 - up_h * 0.026],
        [0.006, 0.010], cyan_skin, n=7, rigid_joint='Head'
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_cyan_lips', hc - bk_h * 0.096 - up_h * 0.052,
        (0.021, 0.009, 0.009), gold_m, 'Head', axes=(left_h, bk_h, up_h), n=10, rows=6
    ))

    # Sweeping Golden V-Winged Shamanic Tiara Brow (`Image 6`!)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        tiara_pts = catmull_spline([
            hc - bk_h * 0.106 - up_h * 0.006,
            hc + left_h * (sgn * 0.055) - bk_h * 0.098 + up_h * 0.036,
            hc + left_h * (sgn * 0.145) - bk_h * 0.045 + up_h * 0.068,
        ], 9)
        parts_h.append(sweep_tube(
            f'{gid_h}_tiara_wing_{tag}', tiara_pts, [0.007, 0.011, 0.004],
            molten_p, n=7, rigid_joint='Head', vfx=gold_blaze
        ))

    # Luminous Almond Eyes ON the Turquoise Face + Weeping Molten-Gold Tear Streams & Beaded Droplets (`Image 14` & `6`!)
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ec = hc + left_h * (sgn * 0.035) - bk_h * 0.097 + up_h * 0.008
        parts_h.append(ellipsoid_part(
            f'{gid_h}_eye_liner_{tag}', ec, (0.022, 0.009, 0.012), carbon_p, 'Head',
            axes=(left_h, bk_h, up_h), n=10, rows=6
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_cyan_eye_{tag}', ec - bk_h * 0.005, (0.018, 0.009, 0.0095), white_p, 'Head',
            axes=(left_h, bk_h, up_h), n=10, rows=6, vfx=cyan_blaze
        ))
        # Curved cheekbone-hugging molten-gold tear streams + teardrop beads!
        for ti_r, dx_r in enumerate((-0.005, 0.005)):
            x_t = sgn * 0.035 + dx_r
            t_pts = catmull_spline([
                hc + left_h * x_t - bk_h * 0.099 + up_h * 0.001,
                hc + left_h * (x_t * 0.96) - bk_h * 0.096 - up_h * 0.048,
                hc + left_h * (x_t * 0.88) - bk_h * 0.078 - up_h * 0.105,
                hc + left_h * (x_t * 0.84) - bk_h * 0.068 - up_h * 0.165,
            ], 9)
            parts_h.append(sweep_tube(
                f'{gid_h}_tear_stream_{tag}_{ti_r}', t_pts,
                [0.0042, 0.0034, 0.0028, 0.0046], molten_p, n=6, rigid_joint='Head', vfx=gold_blaze
            ))
            parts_h.append(ellipsoid_part(
                f'{gid_h}_tear_drop_{tag}_{ti_r}', t_pts[-1] - up_h * 0.012,
                (0.0065, 0.0065, 0.010), molten_p, 'Head', n=8, rows=5, vfx=gold_blaze
            ))

    # COLOSSAL All-Seeing Golden-Magenta Third-Eye Oculus Framed Directly Above the Tiara Brow (`Image 14` & `6`!)
    orb_c = hc + up_h * 0.135 - bk_h * 0.048
    kin_eye = {'bone': 'Head', 'motion': 'bob', 'speed': 1.65, 'amp': 0.007, 'phase': 0.0, 'center_gl': bl_to_gl_pt(orb_c)}
    parts_h.append(torus_ring(
        gid_h + '_oculus_rim', orb_c, -bk_h, 0.088, 0.012, 0.010, molten_p, 'Head',
        n_major=22, n_minor=7, vfx=dict(gold_blaze, kinetic=kin_eye)
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_giant_sclera', orb_c, (0.092, 0.040, 0.068), molten_p, 'Head',
        axes=(left_h, bk_h, up_h), n=20, rows=11,
        vfx=dict(gold_blaze, color='#ffc438', gain=1.75, kinetic=kin_eye)
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_giant_iris', orb_c - bk_h * 0.032, (0.056, 0.022, 0.056), pink_p, 'Head',
        axes=(left_h, bk_h, up_h), n=16, rows=9,
        vfx=dict(pink_blaze, gain=2.05, kinetic=kin_eye)
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_giant_pupil', orb_c - bk_h * 0.048, (0.015, 0.012, 0.042), carbon_p, 'Head',
        axes=(left_h, bk_h, up_h), n=12, rows=7,
        vfx={'kind': 'standard', 'kinetic': kin_eye}
    ))
    parts_h.append(ellipsoid_part(
        gid_h + '_giant_spec', orb_c - bk_h * 0.054 + left_h * 0.016 + up_h * 0.016, (0.011, 0.008, 0.011), white_p, 'Head',
        axes=(left_h, bk_h, up_h), n=8, rows=5,
        vfx=dict(white_blaze, kinetic=kin_eye)
    ))
    # Levitating Molten-Gold Teardrop Crown Beads flanking the Giant Oculus (`Image 14`!)
    for di, ang_d in enumerate((-0.85, -0.52, -0.20, 0.20, 0.52, 0.85)):
        dc = orb_c + left_h * (math.sin(ang_d) * 0.125) + up_h * (math.cos(ang_d) * 0.098 + 0.018)
        parts_h.append(ellipsoid_part(
            f'{gid_h}_crown_bead_{di}', dc, (0.010, 0.010, 0.017), molten_p, 'Head',
            n=8, rows=6, vfx=dict(gold_blaze, kinetic=kin_eye)
        ))

    # Fanned Starlight-Peacock Crest of 15 Tall Iridescent Feathers Framing Head & Shoulders (`Image 6`!)
    fan_c = hc + up_h * 0.055 + bk_h * 0.048
    for fi in range(15):
        uf = (fi / 14.0) * 2.0 - 1.0
        ang_f = uf * 1.42
        f_dir = left_h * math.sin(ang_f) + up_h * math.cos(ang_f) + bk_h * 0.06
        f_dir = f_dir / np.linalg.norm(f_dir)
        f_len = 0.36 - 0.05 * abs(uf)
        parts_h.append(sweep_tube(
            f'{gid_h}_crest_feather_{fi}', [fan_c + f_dir * 0.07, fan_c + f_dir * (0.07 + f_len)],
            [0.014, 0.032, 0.028, 0.006], star_robe, n=7, rigid_joint='Head',
            scale_xy=(1.55, 0.22), ref_dir=left_h,
            vfx={'kind': 'psychedelic_surface', 'sub_mode': 0.0, 'gain': 1.25, 'scale': 1.4, 'trim_color': '#ff48d8'}
        ))

    ent_h = assemble_garment(
        gid_h, 'Weeping Oracle Giant All-Seeing Eye, Molten-Gold Tears & Peacock Crest', 'head', parts_h,
        covers_hair=True, covers_face=True
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 4B. TORSO: ext5_{s}_oracle_regalia (Star-Speckled Bodice, Shamanic Beads & `op_art_wave_star` Illusion!) ---
    gid_t = f'ext5_{sex}_oracle_regalia'
    parts_t = []
    or_body = torso_tube(
        gid_t + '_star_bodice', core.TOP + 0.010, core.WAIST - 0.012, ease=0.016,
        paint=star_robe, n=36, rows=14
    )
    or_body.no_conform = True
    parts_t.append(or_body)

    or_slv = sleeves(gid_t + '_cyan_arms', 'elbow', 0.008, cyan_skin, ease_end=0.010, rows=8, n=16)
    for sp in or_slv:
        sp.no_conform = True
    parts_t.extend(or_slv)

    # Multi-tier Beaded Shamanic Necklace (`Image 7`!)
    for ni, (z_drop, rad_n) in enumerate(((0.03, 0.092), (0.08, 0.108), (0.14, 0.118))):
        n_pts = [
            chest_front(core.TOP - 0.005, 0.034, x=-rad_n),
            chest_front(core.TOP - z_drop, 0.042, x=0.0),
            chest_front(core.TOP - 0.005, 0.034, x=rad_n),
        ]
        parts_t.append(sweep_tube(
            f'{gid_t}_necklace_{ni}', catmull_spline(n_pts, 11), 0.0085,
            gold_m if ni % 2 == 0 else pink_p, n=7, rigid_joint='Spine2',
            vfx=gold_blaze if ni == 1 else None
        ))

    ent_t = assemble_garment(
        gid_t, 'Weeping Oracle Starlight Regalia & Shamanic Necklaces', 'torso', parts_t,
        auras=[{'kind': 'op_art_wave_star', 'bone': 'Spine1', 'offset': [0.0, 0.08, 0.0], 'scale': 1.54}]
    )
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 4C. BACK: ext5_{s}_oracle_flames (Sinuous Psychic Hot-Magenta & Liquid-Gold Wing-Tendrils — Image 14!) ---
    gid_b = f'ext5_{sex}_oracle_flames'
    parts_b = []
    for sgn, tag in ((1.0, 'L'), (-1.0, 'R')):
        sh = J(('Left' if sgn > 0 else 'Right') + 'Arm')
        for wi, (x_sp, z_ri) in enumerate(((0.28, 0.30), (0.36, 0.08), (0.28, -0.18))):
            p0 = sh + np.array([sgn * 0.03, 0.07, 0.02 - 0.04 * wi])
            p1 = p0 + np.array([sgn * (0.55 * x_sp), 0.05, 0.5 * z_ri + 0.05])
            p2 = p0 + np.array([sgn * x_sp, 0.08, z_ri])
            kin_w = {
                'bone': 'Spine2', 'motion': 'chorus_wave', 'speed': 1.85, 'amp': 0.016,
                'phase': wi * 0.8 + (0.0 if sgn > 0 else 1.6),
                'center_gl': bl_to_gl_pt(p0), 'axis_gl': [0.0, 0.0, 1.0],
            }
            parts_b.append(sweep_tube(
                f'{gid_b}_psy_tendril_{tag}_{wi}', catmull_spline([p0, p1, p2], 10),
                np.linspace(0.024, 0.003, 10), pink_p if wi != 1 else molten_p,
                n=7, rigid_joint='Spine2', scale_xy=(0.35, 1.45),
                vfx=dict(pink_blaze if wi != 1 else gold_blaze, kinetic=kin_w)
            ))
    entries.append(assemble_garment(gid_b, 'Weeping Oracle Psychic Magenta & Gold Tendrils', 'back', parts_b))

    # --- 4D. GLOVES: ext5_{s}_oracle_bangles (Visionary Turquoise Forearms & Stacked Polychrome Shamanic Bangles — Image 7!) ---
    gid_g = f'ext5_{sex}_oracle_bangles'
    parts_g = []
    parts_g.extend(full_gloves(gid_g, cyan_skin, cyan_skin, gold_m, f0=0.16, ease=0.006))
    for side in ('Left', 'Right'):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        for bi, bp in enumerate((gold_m, pink_p, molten_p, gold_m)):
            parts_g.append(torus_ring(
                f'{gid_g}_bangle_{side}_{bi}', el + d_fa * (0.52 + 0.11 * bi), d_fa,
                0.044, 0.0075, 0.0065, bp, side + 'ForeArm', n_major=18, n_minor=6
            ))
    ent_g = assemble_garment(gid_g, 'Weeping Oracle Turquoise Forearms & Shamanic Bangles', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 4E. LEGS: ext5_{s}_oracle_shroud (Hovering Star-Speckled Magenta-Indigo Visionary Gown Shroud) ---
    gid_l = f'ext5_{sex}_oracle_shroud'
    parts_l = []
    rows_o = 20
    zs_o = np.linspace(core.WAIST + 0.016, 0.05, rows_o)
    angs_o = np.linspace(0.0, 2.0 * math.pi, 32, endpoint=False)
    Q_gown = []
    for ko_i, zv in enumerate(zs_o):
        uo = ko_i / (rows_o - 1)
        rx = 0.138 + 0.095 * uo
        ry = 0.108 + 0.085 * uo
        Q_gown.append([
            [math.sin(a) * rx * (1.0 + 0.06 * math.sin(8.0 * a + uo * 3.0)),
             math.cos(a) * ry * (1.0 + 0.06 * math.sin(8.0 * a + uo * 3.0)), zv]
            for a in angs_o
        ])
    gown_vfx = {
        'kind': 'alpha_erosion', 'no_push': True,
        'y_top': 0.52, 'y_bot': 0.04,
        'edge_color': '#ff24c8', 'smoke_color': '#12031e', 'swirl': 0.85,
    }
    parts_l.append(_part_raw(gid_l + '_star_gown', Q_gown, True, star_robe, rigid_joint='Hips', vfx=gown_vfx))
    ent_l = assemble_garment(gid_l, 'Weeping Oracle Star-Speckled Magenta Visionary Shroud', 'legs', parts_l)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


def build_wave5_kit():
    all_entries = []
    with wave5_motif_scope():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            for fn in (_build_chrysanthemum_lattice, _build_ocular_lotus, _build_hyperspace_hierophant, _build_weeping_oracle):
                b_ents = fn(sex)
                for e in b_ents:
                    e['_body'] = body_id
                all_entries.extend(b_ents)
    return all_entries


def main():
    t0 = time.time()
    entries = build_wave5_kit()
    outfits = {}
    for sex_key, s in (('male', 'm'), ('female', 'f')):
        outfits[sex_key] = {
            'chrysanthemum_lattice': {
                'head':   f'ext5_{s}_chrys_polyhead',
                'torso':  f'ext5_{s}_chrys_exo',
                'back':   f'ext5_{s}_chrys_mandala',
                'gloves': f'ext5_{s}_chrys_hands',
                'legs':   f'ext5_{s}_chrys_legs',
                'feet':   f'ext5_{s}_chrys_boots',
                'hair':   None,
                'beard':  None,
            },
            'ocular_lotus': {
                'head':   f'ext5_{s}_lotus_dome',
                'torso':  f'ext5_{s}_lotus_vestment',
                'back':   f'ext5_{s}_lotus_arms',
                'gloves': f'ext5_{s}_lotus_mudra',
                'legs':   f'ext5_{s}_lotus_throne',
                'feet':   None,
                'hair':   None,
                'beard':  None,
            },
            'hyperspace_hierophant': {
                'head':   f'ext5_{s}_hiero_crown',
                'torso':  f'ext5_{s}_hiero_palace',
                'back':   f'ext5_{s}_hiero_astrolabe',
                'gloves': f'ext5_{s}_hiero_gauntlets',
                'legs':   f'ext5_{s}_hiero_greaves',
                'feet':   f'ext5_{s}_hiero_sabatons',
                'hair':   None,
                'beard':  None,
            },
            'weeping_oracle': {
                'head':   f'ext5_{s}_oracle_oculus',
                'torso':  f'ext5_{s}_oracle_regalia',
                'back':   f'ext5_{s}_oracle_flames',
                'gloves': f'ext5_{s}_oracle_bangles',
                'legs':   f'ext5_{s}_oracle_shroud',
                'feet':   None,
                'hair':   None,
                'beard':  None,
            },
        }
    items_by_body = {
        'mpfb_male':   [{k: v for k, v in e.items() if k != '_body'} for e in entries if e.get('_body') == 'mpfb_male'],
        'mpfb_female': [{k: v for k, v in e.items() if k != '_body'} for e in entries if e.get('_body') == 'mpfb_female'],
    }
    manifest = {
        'items': items_by_body,
        'tiers': [
            ['chrysanthemum_lattice', 0.055],
            ['ocular_lotus', 0.055],
            ['hyperspace_hierophant', 0.055],
            ['weeping_oracle', 0.055],
        ],
        'outfits': outfits,
    }
    manifest_path = CULTURES_DIR / 'extraplanar_wave5_manifest.json'
    manifest_path.write_bytes((json.dumps(manifest, indent=2) + '\n').encode('utf-8'))
    print(
        f'Compiled {len(entries)} Wave-5 DMT Extraplanar pieces '
        f'({len(items_by_body["mpfb_male"])} M + {len(items_by_body["mpfb_female"])} F) '
        f'in {time.time() - t0:.1f}s -> {manifest_path.name}'
    )


if __name__ == '__main__':
    main()
