"""The Extraplanar Entities Kit — Wave 4 (`ocular_umbra`, `astral_pyre`, `nightmare_urchin`).

Compiles 32 bespoke procedural extraplanar pieces (`16` `mpfb_male` `ext4_m_*` +
`16` `mpfb_female` `ext4_f_*`, 100% M+F parity) for three uncanny Extraplanar entities:

1. **Ocular Umbra (`ocular_umbra`)** — Towering Many-Eyed Pitch-Black Shadow Monolith & Crow Swarm:
   - `head`:   `ext4_{s}_umbra_peaks`    (Twin Jagged Shadow-Spire Peaks & Upper Staring Golden-Crimson Eyes)
   - `torso`:  `ext4_{s}_umbra_monolith` (Jagged Pitch-Black Shadow Monolith, Staggered Golden-Crimson Eyes, Shadow-Hands & `shadow_swarm` Aura)
   - `back`:   `ext4_{s}_umbra_flock`    (Orbiting Swarm of 10 Sculpted Pitch-Black Crow Silhouettes & Barbed Shadow-Spears)
   - `gloves`: `ext4_{s}_umbra_grasps`   (Elongated Multi-Fingered Pitch-Black Shadow-Claws & Barbed Wrist Tendrils)
   - `legs`:   `ext4_{s}_umbra_tatter`   (Legless Tapering Pitch-Black Shadow Root, Lower Staring Eyes & Drooping Feelers)

2. **Astral Pyre (`astral_pyre`)** — Constellation-Void & Pure-White Flame Colossus:
   - `head`:   `ext4_{s}_pyre_visage`        (Blazing Pure-White Flame-Shroud Head, Stark Black Vertical Oval Void-Face & Curling White Plumes)
   - `torso`:  `ext4_{s}_pyre_constellation` (Midnight-Ultramarine Star-Chart Constellation Body, White-Flame Shoulder Mantle & `white_tendril_flame` Aura)
   - `back`:   `ext4_{s}_pyre_plumes`        (8 Sweeping Kalligraphic S-Curl Pure-White & Silver Flame Ribbons)
   - `gloves`: `ext4_{s}_pyre_claws`         (Constellation-Charted Ultramarine Forearms, Hooked Astral Claws & White-Flame Elbow Wisps)
   - `legs`:   `ext4_{s}_pyre_legs`          (Constellation-Charted Midnight-Indigo & Cobalt Cosmic Legs)
   - `feet`:   `ext4_{s}_pyre_steps`         (Tapered Luminous Ultramarine-Cobalt & Starlit White Astral Feet)

3. **Nightmare Urchin (`nightmare_urchin`)** — Sleep-Paralysis Urchin-Head Shadow Horror:
   - `head`:   `ext4_{s}_urchin_head`     (Pitch-Black Shadow-Orb Head, Sunken Pinpoint-Pupil Eyes, Red Needle-Grin, 28 3D Black Spines & `spiky_dark_array` Aura)
   - `torso`:  `ext4_{s}_urchin_shroud`   (Gaunt Writhing Pitch-Black Nightmare-Tendril Ribcage & Crimson Dread-Rim)
   - `back`:   `ext4_{s}_urchin_stalkers` (Secondary Dorsal Pair of Gangly Reaching 4-Taloned Shadow-Claw Arms)
   - `gloves`: `ext4_{s}_urchin_claws`    (Spindly Pitch-Black Forearms & Wickedly Curved Nightmare Talons)
   - `legs`:   `ext4_{s}_urchin_wisps`    (Legless Writhing Column of Pitch-Black Shadow-Hair Tendrils & Eroding Strands)

Run standalone:
    python -u tools/garments/cultures/extraplanar_wave4.py
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
from garments.types.footwear import boots

# ===============================================================================================================
# Scoped Palette Colors (Linear RGB, `ext4_` prefixed)
# ===============================================================================================================
EXT4_COLORS = {
    # Ocular Umbra
    'ext4_void_ink':       (0.005, 0.004, 0.008),
    'ext4_shadow_char':    (0.014, 0.012, 0.020),
    'ext4_eye_gold':       (0.920, 0.640, 0.110),
    'ext4_eye_amber':      (0.980, 0.780, 0.240),
    'ext4_eye_crimson':    (0.820, 0.045, 0.040),
    'ext4_eye_pupil':      (0.006, 0.002, 0.004),
    # Astral Pyre
    'ext4_cosmos_void':    (0.008, 0.010, 0.028),
    'ext4_cosmos_cobalt':  (0.032, 0.110, 0.480),
    'ext4_cosmos_azure':   (0.110, 0.310, 0.920),
    'ext4_pyre_white':     (0.985, 0.990, 1.000),
    'ext4_pyre_silver':    (0.760, 0.815, 0.920),
    'ext4_hole_black':     (0.002, 0.002, 0.005),
    # Nightmare Urchin
    'ext4_urchin_black':   (0.006, 0.005, 0.009),
    'ext4_urchin_socket':  (0.002, 0.001, 0.003),
    'ext4_urchin_tooth':   (0.960, 0.210, 0.240),
    'ext4_urchin_pupil':   (1.000, 0.720, 0.760),
    'ext4_urchin_dread':   (0.280, 0.018, 0.030),
}
for _k, _v in EXT4_COLORS.items():
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

EXT4_CUSTOM_MOTIFS = {
    'ext4_star_chart',
    'ext4_umbra_bark',
    'ext4_urchin_furrow',
}


def _draw_segment_mask(u, v, x0, y0, x1, y1, half_w):
    dx, dy = x1 - x0, y1 - y0
    l2 = max(dx * dx + dy * dy, 1e-8)
    t = np.clip(((u - x0) * dx + (v - y0) * dy) / l2, 0.0, 1.0)
    dist = np.hypot(u - (x0 + t * dx), v - (y0 + t * dy))
    return dist < half_w


def _ext4_custom_motif(style, w, h, fg, bg, aspect=1.0):
    H, W = max(h, 1), max(w, 1)
    img = np.empty((H, W, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5) / W
    v = (yy + 0.5) / H

    if style == 'ext4_star_chart':
        # Deep midnight-black & ultramarine-cobalt cosmic wash with crisp white geometric constellation charts!
        neb = 0.5 + 0.5 * np.sin(u * 9.5 + 1.4 * np.cos(v * 7.2)) * np.cos(v * 8.5 - u * 5.0)
        cobalt_wash = (neb ** 2.2) * (0.35 + 0.65 * np.clip(1.0 - v * 0.7, 0.0, 1.0))
        img[:] = (
            np.asarray(C['ext4_cosmos_void'])[None, None, :] * (1.0 - 0.55 * cobalt_wash)[:, :, None]
            + np.asarray(C['ext4_cosmos_cobalt'])[None, None, :] * (0.72 * cobalt_wash)[:, :, None]
        )
        # Deterministic constellation graphs tiled cleanly across UV space
        constellations = [
            [(0.12, 0.18), (0.20, 0.28), (0.17, 0.42), (0.27, 0.49), (0.33, 0.36), (0.20, 0.28)],
            [(0.38, 0.14), (0.46, 0.24), (0.55, 0.21), (0.59, 0.34), (0.49, 0.41), (0.46, 0.24)],
            [(0.66, 0.16), (0.74, 0.29), (0.84, 0.25), (0.81, 0.40), (0.71, 0.46)],
            [(0.15, 0.58), (0.25, 0.66), (0.22, 0.79), (0.34, 0.84), (0.39, 0.71)],
            [(0.45, 0.55), (0.54, 0.64), (0.63, 0.59), (0.60, 0.74), (0.50, 0.82), (0.42, 0.73), (0.54, 0.64)],
            [(0.70, 0.57), (0.80, 0.65), (0.88, 0.60), (0.85, 0.77), (0.75, 0.85)],
        ]
        line_mask = np.zeros((H, W), dtype=bool)
        star_glow = np.zeros((H, W), dtype=np.float64)
        for poly in constellations:
            for k in range(len(poly) - 1):
                x0, y0 = poly[k]
                x1, y1 = poly[k + 1]
                line_mask |= _draw_segment_mask(u, v, x0, y0, x1, y1, 0.0042)
            for sx, sy in poly:
                d = np.hypot(u - sx, v - sy)
                star_glow = np.maximum(star_glow, np.exp(-d * 135.0))
        # Scattered background stars
        s_grid = (np.sin(u * 71.0 + v * 37.0) * np.cos(u * 43.0 - v * 83.0)) > 0.965
        img[line_mask] = C['ext4_pyre_white']
        img[:] = np.clip(img + star_glow[:, :, None] * np.asarray(C['ext4_pyre_white'])[None, None, :], 0.0, 1.0)
        img[s_grid] = C['ext4_pyre_white']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext4_umbra_bark':
        # Pitch-black oil-paint brushstroke monolith grain
        stroke = 0.75 + 0.25 * np.sin(u * 64.0 + 0.8 * np.sin(v * 18.0))
        img[:] = np.asarray(bg)[None, None, :] * stroke[:, :, None]
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext4_urchin_furrow':
        # Writhing black sleep-paralysis nightmare strands with faint dark-crimson undertones
        furrow = 0.5 + 0.5 * np.sin(u * 52.0 + 2.2 * np.sin(v * 19.0))
        img[:] = (
            np.asarray(C['ext4_urchin_black'])[None, None, :] * (0.7 + 0.5 * furrow)[:, :, None]
            + np.asarray(C['ext4_urchin_dread'])[None, None, :] * (0.06 * (furrow ** 4.0))[:, :, None]
        )
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def wave4_motif_scope():
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in EXT4_CUSTOM_MOTIFS:
            return _ext4_custom_motif(style, w, h, fg, bg, aspect=aspect)
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


def _mp(bg, fab, motif_name=None, fg=None, rep=None, grain=0.012):
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


def build_umbra_eye(prefix, center, normal_fwd, left_ax, up_ax, width, rigid_joint, sclera_p, iris_p, pupil_p):
    """Build a 3-layer staring golden-sclera + crimson-iris + black-pupil eye (Image 1)."""
    fn = np.asarray(normal_fwd, dtype=np.float64)
    fn = fn / max(float(np.linalg.norm(fn)), 1e-8)
    lx = np.asarray(left_ax, dtype=np.float64)
    lx = lx - fn * np.dot(lx, fn)
    lx = lx / max(float(np.linalg.norm(lx)), 1e-8)
    uz = np.cross(fn, lx)
    uz = uz / max(float(np.linalg.norm(uz)), 1e-8)

    scl_vfx = {'kind': 'emissive_blaze', 'color': '#ffbe3c', 'gain': 1.85, 'pulse': 0.14}
    irs_vfx = {'kind': 'emissive_blaze', 'color': '#ee1c18', 'gain': 2.05, 'pulse': 0.18}
    out = []
    # Almond golden sclera
    out.append(ellipsoid_part(
        prefix + '_sclera', center, (width, 0.012, width * 0.48), sclera_p, rigid_joint,
        axes=(lx, fn, uz), n=12, rows=7, vfx=scl_vfx
    ))
    # Blood-crimson iris
    out.append(ellipsoid_part(
        prefix + '_iris', center + fn * 0.006, (width * 0.44, 0.010, width * 0.42), iris_p, rigid_joint,
        axes=(lx, fn, uz), n=10, rows=6, vfx=irs_vfx
    ))
    # Jet-black slit pupil
    out.append(ellipsoid_part(
        prefix + '_pupil', center + fn * 0.011, (width * 0.16, 0.007, width * 0.28), pupil_p, rigid_joint,
        axes=(lx, fn, uz), n=8, rows=5
    ))
    return out


# ===============================================================================================================
# 1. OCULAR UMBRA — Many-Eyed Pitch-Black Shadow Monolith & Crow Swarm (Image 1)
# ===============================================================================================================
def _build_ocular_umbra(sex):
    entries = []
    ink_p    = _mp('ext4_void_ink', 'cloth.wool.fulled', 'ext4_umbra_bark', 'ext4_shadow_char', grain=0.01)
    char_p   = _mp('ext4_shadow_char', 'cloth.wool.fulled', grain=0.01)
    sclera_p = _mp('ext4_eye_gold', 'beads.glass', grain=0.0)
    iris_p   = _mp('ext4_eye_crimson', 'beads.glass', grain=0.0)
    pupil_p  = _mp('ext4_eye_pupil', 'stone.obsidian.pancake_flaked', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])
    void_black_vfx = {'kind': 'emissive_blaze', 'color': '#020104', 'gain': 0.03, 'pulse': 0.0}

    # --- 1A. HEAD: ext4_{s}_umbra_peaks (Twin Jagged Shadow-Spire Peaks & Staring Eyes) ---
    gid_h = f'ext4_{sex}_umbra_peaks'
    parts_h = []

    hc = np.array([0.0, float(a_hd[1]) - 0.005, float(a_hd[2]) + 0.088])
    # Tall pitch-black monolith head-obelisk merging into shoulders
    parts_h.append(ellipsoid_part(
        gid_h + '_monolith_cranium', hc + up_h * 0.025, (0.105, 0.105, 0.165), ink_p, 'Head',
        axes=(left_h, bk_h, up_h), n=18, rows=11, vfx=void_black_vfx
    ))
    # Twin jagged tall black spire-peaks splitting upward like Image 1's top silhouette!
    for sgn, tag, h_pk in ((-1.0, 'R', 0.285), (1.0, 'L', 0.255)):
        pk_pts = catmull_spline([
            hc + left_h * (sgn * 0.042) + up_h * 0.065,
            hc + left_h * (sgn * 0.056) + up_h * (0.55 * h_pk) + bk_h * 0.010,
            hc + left_h * (sgn * 0.030) + up_h * h_pk,
        ], 10)
        parts_h.append(sweep_tube(
            f'{gid_h}_spire_{tag}', pk_pts, np.linspace(0.048, 0.003, 10),
            ink_p, n=9, rigid_joint='Head', scale_xy=(0.82, 1.15), vfx=void_black_vfx
        ))
    # Radiating barbed shadow-tendrils around upper head
    for ti, (sx, sz, ln_t) in enumerate(((-1.0, 0.04, 0.17), (1.0, 0.07, 0.18), (-1.0, 0.14, 0.15), (1.0, 0.16, 0.14))):
        t0 = hc + left_h * (sx * 0.075) + up_h * sz
        t1 = t0 + left_h * (sx * ln_t) + up_h * 0.065 + bk_h * 0.015
        parts_h.append(sweep_tube(
            f'{gid_h}_head_barb_{ti}', [t0, 0.5 * (t0 + t1) + up_h * 0.015, t1], [0.012, 0.006, 0.0015],
            ink_p, n=6, rigid_joint='Head', vfx=void_black_vfx
        ))
    # 2 Staggered Staring Golden-Crimson Eyes on the upper monolith spire (Image 1!)
    parts_h.extend(build_umbra_eye(
        gid_h + '_eye_top', hc - bk_h * 0.102 + up_h * 0.085 - left_h * 0.008,
        -bk_h, left_h, up_h, 0.036, 'Head', sclera_p, iris_p, pupil_p
    ))
    parts_h.extend(build_umbra_eye(
        gid_h + '_eye_brow', hc - bk_h * 0.104 - up_h * 0.018 + left_h * 0.026,
        -bk_h, left_h, up_h, 0.029, 'Head', sclera_p, iris_p, pupil_p
    ))

    ent_h = assemble_garment(
        gid_h, 'Ocular Umbra Twin Shadow-Spires & Staring Eyes', 'head', parts_h,
        covers_hair=True, covers_face=True
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 1B. TORSO: ext4_{s}_umbra_monolith (Pitch-Black Shadow Monolith, 6 Staggered Eyes, Shadow-Hands & `shadow_swarm` Aura) ---
    gid_t = f'ext4_{sex}_umbra_monolith'
    parts_t = []

    mono_body = torso_tube(
        gid_t + '_void_slab', core.TOP + 0.030, core.WAIST - 0.025, ease=0.032,
        paint=ink_p, n=36, rows=14
    )
    tag_vfx(mono_body, void_black_vfx, no_conform=True)
    parts_t.append(mono_body)

    mono_slv = sleeves(gid_t + '_shadow_arms', 'elbow', 0.012, ink_p, ease_end=0.014, rows=8, n=16)
    tag_vfx(mono_slv, void_black_vfx, no_conform=True)
    parts_t.extend(mono_slv)

    # 6 Staggered Golden-Sclera & Crimson-Iris Eyes zig-zagging down the monolith torso (1:1 with Image 1!)
    z_top_t, z_bot_t = core.TOP - 0.015, core.WAIST + 0.015
    torso_eyes = [
        (-0.048, 0.84, 0.040, 'Spine2'),
        ( 0.062, 0.68, 0.038, 'Spine2'),
        (-0.042, 0.50, 0.042, 'Spine2'),
        ( 0.056, 0.34, 0.035, 'Spine1'),
        (-0.034, 0.18, 0.031, 'Spine1'),
        ( 0.038, 0.04, 0.028, 'Spine1'),
    ]
    for ei, (ex, u_z, ew, ej) in enumerate(torso_eyes):
        zv = z_bot_t + u_z * (z_top_t - z_bot_t)
        ec = chest_front(zv, 0.040, x=ex)
        n_dir = np.array([ex * 1.6, -1.0, 0.0])
        parts_t.extend(build_umbra_eye(
            f'{gid_t}_eye_{ei}', ec, n_dir, left_w, up_w, ew, ej, sclera_p, iris_p, pupil_p
        ))

    # Reaching black shadow-hands & arrow-barbed tendrils sprouting along both flanks of the monolith!
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        for bi, u_z in enumerate((0.82, 0.54, 0.24)):
            zv = z_bot_t + u_z * (z_top_t - z_bot_t)
            r0 = np.array([sgn * 0.155, 0.01, zv])
            r1 = np.array([sgn * 0.285, 0.03, zv + 0.025 * (1 - bi)])
            r2 = np.array([sgn * 0.375, 0.05, zv - 0.015 * bi])
            bj = 'Spine2' if bi < 2 else 'Spine1'
            parts_t.append(sweep_tube(
                f'{gid_t}_tendril_{tag}_{bi}', catmull_spline([r0, r1, r2], 8),
                [0.014, 0.008, 0.002], ink_p, n=6, rigid_joint=bj, vfx=void_black_vfx
            ))
            # Splayed 3-finger shadow-hand silhouette or barbed arrowhead tip!
            if bi == 1:
                for fi, f_ang in enumerate((-0.32, 0.0, 0.32)):
                    f_end = r1 + np.array([sgn * 0.095, 0.02, math.sin(f_ang) * 0.055])
                    parts_t.append(sweep_tube(
                        f'{gid_t}_shhand_{tag}_{fi}', [r1, 0.5 * (r1 + f_end), f_end],
                        [0.006, 0.004, 0.001], ink_p, n=5, rigid_joint=bj, vfx=void_black_vfx
                    ))

    ent_t = assemble_garment(
        gid_t, 'Ocular Umbra Many-Eyed Shadow Monolith', 'torso', parts_t,
        auras=[{'kind': 'shadow_swarm', 'bone': 'Spine1', 'offset': [0.0, 0.04, 0.0], 'scale': 1.42}]
    )
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 1C. BACK: ext4_{s}_umbra_flock (10 Kinetic Sculpted Pitch-Black Crow Silhouettes & Barbed Spears) ---
    gid_b = f'ext4_{sex}_umbra_flock'
    parts_b = []
    hub_u = np.array([0.0, 0.14, core.CHEST])
    for ci in range(10):
        ang = (ci / 10.0) * 2.0 * math.pi + 0.22
        rad_x = 0.28 + 0.10 * (ci % 3)
        rad_z = 0.34 + 0.08 * ((ci + 1) % 3)
        bc = hub_u + np.array([math.cos(ang) * rad_x, 0.05 + 0.03 * (ci % 2), math.sin(ang) * rad_z])
        kin_crow = {
            'bone': 'Spine2', 'motion': 'chorus_wave', 'speed': 2.2 + 0.2 * (ci % 3),
            'amp': 0.024, 'phase': ci * 0.68,
            'center_gl': bl_to_gl_pt(bc), 'axis_gl': [0.0, 0.0, 1.0],
        }
        # Swept V-wing crow silhouette
        w_dir = np.array([math.cos(ang), 0.15, math.sin(ang)])
        w_dir = w_dir / np.linalg.norm(w_dir)
        perp = np.cross(w_dir, np.array([0.0, 1.0, 0.0]))
        perp = perp / max(float(np.linalg.norm(perp)), 1e-6)
        wing_pts = [
            bc - perp * 0.085 - w_dir * 0.028,
            bc + w_dir * 0.018,
            bc + perp * 0.085 - w_dir * 0.028,
        ]
        parts_b.append(sweep_tube(
            f'{gid_b}_crow_wing_{ci}', catmull_spline(wing_pts, 7),
            [0.002, 0.016, 0.002], ink_p, n=6, rigid_joint='Spine2',
            scale_xy=(0.28, 1.45), vfx=dict(void_black_vfx, kinetic=kin_crow)
        ))
        parts_b.append(sweep_tube(
            f'{gid_b}_crow_body_{ci}', [bc - w_dir * 0.045, bc, bc + w_dir * 0.038],
            [0.008, 0.013, 0.003], char_p, n=6, rigid_joint='Spine2',
            vfx=dict(void_black_vfx, kinetic=kin_crow)
        ))

    entries.append(assemble_garment(gid_b, 'Ocular Umbra Darting Black Crow Flock', 'back', parts_b))

    # --- 1D. GLOVES: ext4_{s}_umbra_grasps (Elongated Pitch-Black Shadow-Hands & Claws) ---
    gid_g = f'ext4_{sex}_umbra_grasps'
    parts_g = []
    glv_um = full_gloves(gid_g, ink_p, ink_p, char_p, f0=0.16, ease=0.008)
    tag_vfx(glv_um, void_black_vfx, no_conform=True)
    parts_g.extend(glv_um)
    for sgn, side in ((1.0, 'Left'), (-1.0, 'Right')):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        side_v = np.cross(u_fa, np.array([0.0, 1.0, 0.0]))
        side_v = side_v / max(float(np.linalg.norm(side_v)), 1e-6)
        for fi, off_s in enumerate((-0.028, -0.010, 0.010, 0.028)):
            c0 = wr + u_fa * 0.082 + side_v * off_s
            c1 = c0 + u_fa * 0.075 + np.array([0.0, -0.018, -0.012])
            parts_g.append(sweep_tube(
                f'{gid_g}_claw_{side}_{fi}', [c0, 0.5 * (c0 + c1), c1], [0.007, 0.004, 0.001],
                ink_p, n=6, rigid_joint=side + 'Hand', vfx=void_black_vfx
            ))
    ent_g = assemble_garment(gid_g, 'Ocular Umbra Reaching Shadow-Claws', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 1E. LEGS: ext4_{s}_umbra_tatter (Seamless Unlit Pitch-Black Tapering Shadow Root + Lower Eyes) ---
    gid_l = f'ext4_{sex}_umbra_tatter'
    parts_l = []
    rows_u = 22
    zs_u = np.linspace(core.WAIST + 0.020, 0.04, rows_u)
    angs_u = np.linspace(0.0, 2.0 * math.pi, 32, endpoint=False)
    Q_col = []
    for kr, zv in enumerate(zs_u):
        ur = kr / (rows_u - 1)
        # Anatomical waist-ellipse cross-section tucked flush inside `mono_body` (`ease=0.032`) -> zero waist ledge!
        rad_x = (1.0 - ur) ** 0.76 * 0.142 + 0.024
        rad_y = (1.0 - ur) ** 0.76 * 0.106 + 0.022
        jag = 1.0 + 0.06 * ur * math.sin(ur * 5.0)
        Q_col.append([
            [math.sin(a) * rad_x * (1.0 + 0.07 * ur * math.sin(9.0 * a + ur * 4.0)) * jag,
             math.cos(a) * rad_y * (1.0 + 0.07 * ur * math.sin(9.0 * a + ur * 4.0)) * jag, zv]
            for a in angs_u
        ])
    col_vfx = {
        'kind': 'alpha_erosion', 'no_push': True, 'unlit': True,
        'y_top': 0.46, 'y_bot': 0.03,
        'edge_color': '#0c0204', 'smoke_color': '#020104', 'swirl': 0.45,
    }
    parts_l.append(_part_raw(gid_l + '_monolith_root', Q_col, True, ink_p, rigid_joint='Hips', vfx=col_vfx))

    # 4 Lower Staggered Golden-Crimson Eyes descending smoothly down the monolith root (Image 1!)
    lower_eyes = [
        (-0.026, 0.80, 0.026),
        ( 0.024, 0.58, 0.023),
        (-0.016, 0.36, 0.020),
        ( 0.008, 0.18, 0.017),
    ]
    for li, (lx_e, u_l, lw_e) in enumerate(lower_eyes):
        zv = 0.06 + u_l * (core.WAIST - 0.10)
        ur = 1.0 - u_l
        rad_fy = (1.0 - ur) ** 0.76 * 0.106 + 0.025
        ec = np.array([lx_e, -rad_fy, zv])
        parts_l.extend(build_umbra_eye(
            f'{gid_l}_low_eye_{li}', ec, fwd, left_w, up_w, lw_e, 'Hips', sclera_p, iris_p, pupil_p
        ))

    ent_l = assemble_garment(gid_l, 'Ocular Umbra Tapering Eye-Studded Shadow Root', 'legs', parts_l)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


# ===============================================================================================================
# 2. ASTRAL PYRE — Constellation-Void & Pure-White Flame Colossus (Image 2)
# ===============================================================================================================
def _build_astral_pyre(sex):
    entries = []
    star_p    = _mp('ext4_cosmos_void', 'cloth.silk', 'ext4_star_chart', 'ext4_pyre_white', grain=0.008)
    cobalt_p  = _mp('ext4_cosmos_cobalt', 'cloth.silk', grain=0.01)
    azure_p   = _mp('ext4_cosmos_azure', 'beads.glass', grain=0.0)
    white_p   = _mp('ext4_pyre_white', 'cloth.silk', grain=0.005)
    silver_p  = _mp('ext4_pyre_silver', 'cloth.silk', grain=0.008)
    hole_p    = _mp('ext4_hole_black', 'cloth.wool.fulled', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    white_blaze = {'kind': 'emissive_blaze', 'color': '#ffffff', 'gain': 1.06, 'pulse': 0.08}
    hole_vfx    = {'kind': 'emissive_blaze', 'color': '#010103', 'gain': 0.01, 'pulse': 0.0}
    const_body_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#02040e',
        'rim_color': '#1e4ee8',
        'accent_color': '#ffffff',
        'opacity': 0.99,
        'power': 2.5,
        'rim_gain': 0.55,
        'constellation': 2.0,
        'depth_write': True,
    }

    # --- 2A. HEAD: ext4_{s}_pyre_visage (Pure-White Flame-Shroud Head, Stark Black Vertical Oval Face & Curling Plumes) ---
    gid_h = f'ext4_{sex}_pyre_visage'
    parts_h = []
    hc = np.array([0.0, float(a_hd[1]) - 0.004, float(a_hd[2]) + 0.068])

    # Flared pure-white flame-cowl merging smoothly from shoulders up into a tapered flame apex
    rows_c = 12
    angs_c = np.linspace(0.0, 2.0 * math.pi, 26, endpoint=False)
    Q_cowl = []
    for kc in range(rows_c):
        uc = kc / (rows_c - 1)  # 0 = wide shoulder-neck base, 1 = flame crown apex
        rx = (1.0 - uc) ** 0.75 * 0.135 + 0.018
        ry = (1.0 - uc) ** 0.75 * 0.118 + 0.018
        zv = -0.095 + uc * 0.245
        Q_cowl.append([
            hc + left_h * (math.cos(a) * rx) + bk_h * (math.sin(a) * ry) + up_h * zv
            for a in angs_c
        ])
    parts_h.append(_part_raw(gid_h + '_white_cowl', Q_cowl, True, white_p, rigid_joint='Head', vfx=white_blaze))

    # Iconic Stark Pitch-Black Vertical Oval Void-Aperture Face (Image 2!)
    hole_c = hc - bk_h * 0.106 + up_h * 0.016
    parts_h.append(ellipsoid_part(
        gid_h + '_void_aperture', hole_c, (0.032, 0.020, 0.056), hole_p, 'Head',
        axes=(left_h, bk_h, up_h), n=16, rows=10, vfx=hole_vfx
    ))

    # 5 Tall S-Curling Pure-White Flame-Tendril Plumes rising from the crown!
    plume_cfgs = [
        ( 0.00,  0.34,  1.0),
        (-0.05,  0.26, -1.0),
        ( 0.06,  0.28,  1.0),
        (-0.09,  0.20,  1.0),
        ( 0.09,  0.22, -1.0),
    ]
    for pi, (px_o, ph_h, s_curl) in enumerate(plume_cfgs):
        p_base = hc + left_h * px_o + up_h * 0.115
        p_ctrl = [
            p_base,
            p_base + up_h * (0.35 * ph_h) + left_h * (s_curl * 0.055),
            p_base + up_h * (0.72 * ph_h) - left_h * (s_curl * 0.065) + bk_h * 0.025,
            p_base + up_h * ph_h + left_h * (s_curl * 0.045) + bk_h * 0.040,
        ]
        kin_pl = {
            'bone': 'Head', 'motion': 'chorus_wave', 'speed': 1.95, 'amp': 0.014,
            'phase': pi * 0.85, 'center_gl': bl_to_gl_pt(p_base), 'axis_gl': [0.0, 0.0, 1.0],
        }
        parts_h.append(sweep_tube(
            f'{gid_h}_crown_plume_{pi}', catmull_spline(p_ctrl, 12),
            np.linspace(0.026, 0.003, 12), white_p, n=8, rigid_joint='Head',
            scale_xy=(1.25, 0.45), vfx=dict(white_blaze, kinetic=kin_pl)
        ))

    ent_h = assemble_garment(
        gid_h, 'Astral Pyre White-Flame Visage & Void Aperture', 'head', parts_h,
        covers_hair=True, covers_face=True
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 2B. TORSO: ext4_{s}_pyre_constellation (Constellation Body, White-Flame Shoulder Mantle & `white_tendril_flame` Aura) ---
    gid_t = f'ext4_{sex}_pyre_constellation'
    parts_t = []

    star_torso = torso_tube(
        gid_t + '_star_body', core.TOP + 0.012, core.WAIST - 0.008, ease=0.018,
        paint=star_p, n=36, rows=15, layer=0
    )
    tag_vfx(star_torso, const_body_vfx, no_conform=True)
    parts_t.append(star_torso)

    star_slv = sleeves(gid_t + '_star_arms', 'elbow', 0.016, star_p, ease_end=0.020, rows=9, n=18)
    tag_vfx(star_slv, const_body_vfx, no_conform=True)
    parts_t.extend(star_slv)

    # Sculpted Jagged Pure-White Flame Shoulder Mantle draping across shoulders & upper chest (`layer=1`, +14mm clearance!)
    mantle = torso_tube(
        gid_t + '_white_mantle', core.TOP + 0.024, core.CHEST - 0.015, ease=0.034,
        paint=white_p, n=36, rows=8, jagged=0.048, layer=1
    )
    tag_vfx(mantle, white_blaze, no_conform=True)
    parts_t.append(mantle)

    # Broad white-flame deltoid shoulder caps & curling shoulder licks
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        sh = J(side + 'Arm')
        sh_pts = catmull_spline([
            np.array([sgn * 0.075, 0.0, core.TOP + 0.032]),
            sh + np.array([sgn * 0.038, 0.0, 0.042]),
            sh + np.array([sgn * 0.088, 0.015, -0.025]),
        ], 9)
        parts_t.append(sweep_tube(
            f'{gid_t}_sh_flame_{tag}', sh_pts, [0.036, 0.044, 0.014],
            white_p, n=10, rigid_joint='Spine2', scale_xy=(0.65, 1.35), vfx=white_blaze
        ))

    ent_t = assemble_garment(
        gid_t, 'Astral Pyre Constellation Body & White-Flame Mantle', 'torso', parts_t,
        auras=[{'kind': 'white_tendril_flame', 'bone': 'Spine2', 'offset': [0.0, 0.06, 0.0], 'gain': 1.28}]
    )
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 2C. BACK: ext4_{s}_pyre_plumes (8 Kalligraphic S-Curl Pure-White & Silver Flame Ribbons) ---
    gid_b = f'ext4_{sex}_pyre_plumes'
    parts_b = []
    for sgn, tag in ((1.0, 'L'), (-1.0, 'R')):
        sh = J(('Left' if sgn > 0 else 'Right') + 'Arm')
        for ri, (z_off, span_x, rise_z) in enumerate(((0.04, 0.28, 0.24), (-0.02, 0.34, 0.04), (-0.08, 0.30, -0.22), (-0.14, 0.24, -0.38))):
            p0 = sh + np.array([sgn * 0.04, 0.06, z_off])
            p1 = p0 + np.array([sgn * (0.55 * span_x), 0.08, 0.45 * rise_z + 0.06])
            p2 = p0 + np.array([sgn * span_x, 0.12, rise_z])
            p3 = p2 + np.array([-sgn * 0.055, 0.04, 0.075])  # signature painterly hook-curl!
            kin_r = {
                'bone': 'Spine2', 'motion': 'chorus_wave', 'speed': 1.75, 'amp': 0.016,
                'phase': ri * 0.9 + (0.0 if sgn > 0 else 1.4),
                'center_gl': bl_to_gl_pt(p0), 'axis_gl': [0.0, 0.0, 1.0],
            }
            parts_b.append(sweep_tube(
                f'{gid_b}_curl_{tag}_{ri}', catmull_spline([p0, p1, p2, p3], 12),
                np.linspace(0.024, 0.003, 12), white_p if ri < 2 else silver_p,
                n=8, rigid_joint='Spine2', scale_xy=(0.30, 1.45),
                vfx=dict(white_blaze, color='#ffffff' if ri < 2 else '#dce8ff', gain=1.65, kinetic=kin_r)
            ))

    entries.append(assemble_garment(gid_b, 'Astral Pyre Curling White-Flame Plumes', 'back', parts_b))

    # --- 2D. GLOVES: ext4_{s}_pyre_claws (Constellation Ultramarine Forearms & Hooked Astral Claws) ---
    gid_g = f'ext4_{sex}_pyre_claws'
    parts_g = []
    glv_pyre = full_gloves(gid_g, star_p, cobalt_p, azure_p, f0=0.14, ease=0.016)
    tag_vfx(glv_pyre, const_body_vfx, no_conform=True)
    parts_g.extend(glv_pyre)
    for sgn, side in ((1.0, 'Left'), (-1.0, 'Right')):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        side_v = np.cross(u_fa, np.array([0.0, 1.0, 0.0]))
        side_v = side_v / max(float(np.linalg.norm(side_v)), 1e-6)
        # Hooked blue-indigo cosmic claws
        for fi, off_s in enumerate((-0.028, -0.009, 0.009, 0.028)):
            c0 = wr + u_fa * 0.082 + side_v * off_s
            c1 = c0 + u_fa * 0.055 + np.array([-sgn * 0.018, -0.022, -0.010])
            parts_g.append(sweep_tube(
                f'{gid_g}_claw_{side}_{fi}', [c0, 0.5 * (c0 + c1) + u_fa * 0.012, c1],
                [0.010, 0.006, 0.0018], azure_p, n=6, rigid_joint=side + 'Hand',
                vfx={'kind': 'emissive_blaze', 'color': '#4c88ff', 'gain': 1.65, 'pulse': 0.14}
            ))
        # White-flame elbow curl
        ew0 = el + d_fa * 0.18 + np.array([sgn * 0.042, 0.032, 0.0])
        ew1 = ew0 + np.array([sgn * 0.065, 0.075, 0.065])
        parts_g.append(sweep_tube(
            f'{gid_g}_elbow_wisp_{side}', [ew0, 0.5 * (ew0 + ew1) + np.array([sgn * 0.02, 0.0, 0.02]), ew1],
            [0.016, 0.009, 0.002], white_p, n=7, rigid_joint=side + 'ForeArm', vfx=white_blaze
        ))
    ent_g = assemble_garment(gid_g, 'Astral Pyre Constellation Forearms & Hooked Claws', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # --- 2E. LEGS: ext4_{s}_pyre_legs (Constellation-Charted Midnight-Indigo & Cobalt Cosmic Legs) ---
    gid_l = f'ext4_{sex}_pyre_legs'
    parts_l = []
    trs = trousers(gid_l + '_star_legs', star_p, ease=0.010, cuff=core.ANKLE + 0.04, bag=0.004)
    tag_vfx(trs, const_body_vfx, no_conform=True)
    parts_l.extend(trs)
    ent_l = assemble_garment(gid_l, 'Astral Pyre Constellation Cosmic Legs', 'legs', parts_l, legged=True)
    hide_full_body(ent_l)
    entries.append(ent_l)

    # --- 2F. FEET: ext4_{s}_pyre_steps (Luminous Ultramarine-Cobalt & Starlit White Astral Feet) ---
    gid_f = f'ext4_{sex}_pyre_steps'
    parts_f = []
    bts = boots(gid_f, cobalt_p, azure_p, top=0.28, wraps=0, ease_top=0.012)
    tag_vfx(bts, {
        'kind': 'fresnel_ghost', 'core_color': '#0b2478', 'rim_color': '#5294ff',
        'accent_color': '#ffffff', 'opacity': 0.96, 'power': 1.7, 'rim_gain': 2.05, 'depth_write': True,
    }, no_conform=True)
    parts_f.extend(bts)
    ent_f = assemble_garment(gid_f, 'Astral Pyre Starlit Ultramarine Feet', 'feet', parts_f)
    entries.append(ent_f)
    return entries


# ===============================================================================================================
# 3. NIGHTMARE URCHIN — Sleep-Paralysis Urchin-Head Shadow Horror (Image 3 — Quality Pass)
# ===============================================================================================================
def _build_wicked_claw_hand(prefix, wrist_pt, dir_fwd, dir_spread, dir_hook, sgn, rigid_joint, paint_blk, vfx_blk, scale_h=1.0):
    """Sculpt a monstrous, skeletal 5-fingered nightmare hand with arched knuckles & crooked scythe-talons."""
    pts_out = []
    u_f = np.asarray(dir_fwd, dtype=np.float64)
    u_f = u_f / max(float(np.linalg.norm(u_f)), 1e-8)
    u_s = np.asarray(dir_spread, dtype=np.float64)
    u_s = u_s - u_f * np.dot(u_s, u_f)
    u_s = u_s / max(float(np.linalg.norm(u_s)), 1e-8)
    u_h = np.asarray(dir_hook, dtype=np.float64)
    u_h = u_h / max(float(np.linalg.norm(u_h)), 1e-8)

    # Flattened bony metacarpal palm fan
    palm_mid = wrist_pt + u_f * (0.068 * scale_h)
    pts_out.append(sweep_tube(
        f'{prefix}_palm', [wrist_pt - u_f * 0.008, palm_mid, wrist_pt + u_f * (0.095 * scale_h)],
        [0.022 * scale_h, 0.036 * scale_h, 0.032 * scale_h], paint_blk, n=8,
        rigid_joint=rigid_joint, scale_xy=(1.45, 0.42), ref_dir=u_s, vfx=vfx_blk
    ))

    # 4 Long, Crooked, Multi-Phalanx Scythe-Claw Fingers (Index, Middle, Ring, Pinky)
    finger_specs = [
        (-0.85, 0.92, -0.34),
        (-0.28, 1.08, -0.10),
        ( 0.30, 1.02,  0.14),
        ( 0.88, 0.84,  0.38),
    ]
    for fi, (sp_k, len_k, fan_ang) in enumerate(finger_specs):
        knuckle = wrist_pt + u_f * (0.088 * scale_h) + u_s * (sp_k * 0.038 * scale_h)
        f_dir = u_f * math.cos(fan_ang) + u_s * math.sin(fan_ang)
        f_dir = f_dir / max(float(np.linalg.norm(f_dir)), 1e-8)
        L = 0.215 * len_k * scale_h
        # High arched proximal phalanx -> sharp crooked middle joint -> inward-hooking scythe tip!
        j1 = knuckle + f_dir * (0.42 * L) - u_h * (0.18 * L)
        j2 = j1 + f_dir * (0.38 * L) + u_h * (0.26 * L)
        tip = j2 + f_dir * (0.16 * L) + u_h * (0.48 * L)
        pts_out.append(sweep_tube(
            f'{prefix}_finger_{fi}', catmull_spline([knuckle - u_f * 0.012, j1, j2, tip], 11),
            np.array([0.0115, 0.0105, 0.0095, 0.0088, 0.0082, 0.0072, 0.0058, 0.0044, 0.0030, 0.0018, 0.0007]) * scale_h,
            paint_blk, n=7, rigid_joint=rigid_joint, scale_xy=(0.75, 1.30), ref_dir=u_s, vfx=vfx_blk
        ))

    # Opposable Wicked Hooked Inner Thumb-Talon
    th_Side = -sgn  # inner medial side of hand
    th_root = wrist_pt + u_f * (0.038 * scale_h) + u_s * (th_Side * 0.036 * scale_h) + u_h * (0.010 * scale_h)
    th_mid  = th_root + (u_f * 0.68 + u_s * (th_Side * 0.62)) * (0.085 * scale_h) - u_h * (0.012 * scale_h)
    th_tip  = th_mid + (u_f * 0.45 - u_s * (th_Side * 0.35)) * (0.075 * scale_h) + u_h * (0.068 * scale_h)
    pts_out.append(sweep_tube(
        f'{prefix}_thumb', catmull_spline([th_root, th_mid, th_tip], 9),
        np.linspace(0.0115, 0.0008, 9) * scale_h, paint_blk, n=7,
        rigid_joint=rigid_joint, scale_xy=(0.78, 1.28), vfx=vfx_blk
    ))
    return pts_out


def _build_nightmare_urchin(sex):
    entries = []
    urchin_p = _mp('ext4_urchin_black', 'cloth.wool.fulled', 'ext4_urchin_furrow', 'ext4_urchin_dread', grain=0.012)
    sock_p   = _mp('ext4_urchin_socket', 'stone.obsidian.pancake_flaked', grain=0.0)
    tooth_p  = _mp('ext4_urchin_tooth', 'beads.glass', grain=0.0)
    pupil_p  = _mp('ext4_urchin_pupil', 'beads.glass', grain=0.0)

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    urchin_void_vfx = {'kind': 'emissive_blaze', 'color': '#030205', 'gain': 0.025, 'pulse': 0.0}
    dread_vfx = {
        'kind': 'fresnel_ghost',
        'core_color': '#020104',
        'rim_color': '#560812',
        'accent_color': '#140206',
        'opacity': 0.99,
        'power': 3.0,
        'rim_gain': 0.72,
        'depth_write': True,
    }

    # --- 3A. HEAD: ext4_{s}_urchin_head (Imposing Shadow-Orb, Cavernous Pinpoint Eyes, Ear-to-Ear Needle Smile & 36 3D Quills!) ---
    gid_h = f'ext4_{sex}_urchin_head'
    parts_h = []
    hc = np.array([0.0, float(a_hd[1]) - 0.010, float(a_hd[2]) + 0.098])

    # Imposing spherical pitch-black shadow-orb cranium (`0.146 m` radius matching Image 3's proportions!)
    parts_h.append(ellipsoid_part(
        gid_h + '_orb_head', hc, (0.146, 0.132, 0.144), urchin_p, 'Head',
        axes=(left_h, bk_h, up_h), n=24, rows=15, vfx=urchin_void_vfx
    ))

    # Two HUGE cavernous sunken pitch-black eye-hollows + razor-tiny glowing pink-white pinpoint pupils (Image 3!)
    pupil_vfx = {'kind': 'emissive_blaze', 'color': '#ffe0e4', 'gain': 3.10, 'pulse': 0.14}
    pupil_halo_vfx = {'kind': 'emissive_blaze', 'color': '#ff384c', 'gain': 1.85, 'pulse': 0.20}
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        eye_c = hc + left_h * (sgn * 0.048) - bk_h * 0.122 + up_h * 0.018
        # Furrowed orbital brow ridge around each huge eye cavity
        ridge_angs = np.linspace(0.0, 2.0 * math.pi, 16, endpoint=False)
        ridge_pts = [
            eye_c + left_h * (math.cos(a) * 0.046) + up_h * (math.sin(a) * 0.046) - bk_h * 0.004
            for a in list(ridge_angs) + [0.0]
        ]
        parts_h.append(sweep_tube(
            f'{gid_h}_orbital_ridge_{tag}', ridge_pts, 0.0075, urchin_p, n=6, rigid_joint='Head', vfx=urchin_void_vfx
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_socket_{tag}', eye_c, (0.043, 0.016, 0.043), sock_p, 'Head',
            axes=(left_h, bk_h, up_h), n=14, rows=8, vfx=urchin_void_vfx
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_pinpoint_halo_{tag}', eye_c - bk_h * 0.015, (0.0095, 0.005, 0.0095), tooth_p, 'Head',
            axes=(left_h, bk_h, up_h), n=8, rows=6, vfx=pupil_halo_vfx
        ))
        parts_h.append(ellipsoid_part(
            f'{gid_h}_pinpoint_{tag}', eye_c - bk_h * 0.019, (0.0052, 0.0045, 0.0052), pupil_p, 'Head',
            axes=(left_h, bk_h, up_h), n=8, rows=6, vfx=pupil_vfx
        ))

    # Iconic Wide Ear-to-Ear Upturned Crescent Smile of 29 Razor-Sharp Glowing Red-Salmon Needle-Fangs!
    # 1) Recessed dark blood-crimson mouth fissure curving across the lower face so teeth sit over an eerie red maw
    grin_ctrl = []
    for ug in np.linspace(-1.0, 1.0, 13):
        gx = ug * 0.114
        gz = -0.068 + 0.062 * (ug * ug)
        gy = -math.sqrt(max(0.003, 0.132 * 0.132 * (1.0 - (gx / 0.148) ** 2 - (gz / 0.146) ** 2))) - 0.002
        grin_ctrl.append(hc + left_h * gx + bk_h * gy + up_h * gz)
    parts_h.append(sweep_tube(
        gid_h + '_mouth_gash', grin_ctrl,
        [0.002, 0.009, 0.015, 0.019, 0.021, 0.022, 0.022, 0.022, 0.021, 0.019, 0.015, 0.009, 0.002],
        sock_p, n=7, rigid_joint='Head', scale_xy=(1.0, 0.35), ref_dir=bk_h,
        vfx={'kind': 'emissive_blaze', 'color': '#4e0610', 'gain': 0.85, 'pulse': 0.18}
    ))

    # 2) 29 Individual Splayed Razor-Sharp Needle-Teeth (hot salmon-pink centers + crimson tips, staggered heights!)
    tooth_hot_vfx = {'kind': 'emissive_blaze', 'color': '#ff7e7c', 'gain': 2.55, 'pulse': 0.18}
    tooth_red_vfx = {'kind': 'emissive_blaze', 'color': '#ff3644', 'gain': 2.25, 'pulse': 0.24}
    n_teeth = 29
    for ti in range(n_teeth):
        ut = (ti / float(n_teeth - 1)) * 2.0 - 1.0  # -1..+1 ear-to-ear
        tx = ut * 0.112
        tz_mid = -0.068 + 0.062 * (ut * ut)
        # Normal to the smile curve `dz/dx = 2 * 0.062 * ut / 0.112` -> radial splay like Image 3!
        slope = (2.0 * 0.062 * ut) / 0.112
        t_axis_2d = left_h * (-slope * 0.38) + up_h * 1.0
        t_axis_2d = t_axis_2d / np.linalg.norm(t_axis_2d)
        env = max(0.0, 1.0 - 0.78 * (ut * ut))
        jag = 1.15 if (ti % 2 == 0) else (0.76 if (ti % 3 == 0) else 0.92)
        th_half = (0.031 * env + 0.0045) * jag
        ty = -math.sqrt(max(0.003, 0.132 * 0.132 * (1.0 - (tx / 0.148) ** 2 - (tz_mid / 0.146) ** 2))) - 0.006
        c_mid = hc + left_h * tx + bk_h * ty + up_h * tz_mid
        t_top = c_mid + t_axis_2d * th_half + bk_h * 0.003
        t_bot = c_mid - t_axis_2d * th_half + bk_h * 0.003
        parts_h.append(sweep_tube(
            f'{gid_h}_tooth_{ti}', [t_top, c_mid - bk_h * 0.004, t_bot],
            [0.0006, 0.0024 if ti % 2 == 0 else 0.0019, 0.0006],
            pupil_p if ti % 2 == 0 else tooth_p, n=5, rigid_joint='Head',
            scale_xy=(0.48, 1.35), ref_dir=left_h,
            vfx=tooth_hot_vfx if ti % 2 == 0 else tooth_red_vfx
        ))

    # 36 Long, Jagged, Uneven 3D Pitch-Black Sea-Urchin Spines radiating in 3D from the orb!
    for si in range(36):
        ang = (si / 36.0) * 2.0 * math.pi
        z_tilt = 0.24 * math.sin(si * 2.7)
        r_dir = left_h * math.cos(ang) + up_h * math.sin(ang) + bk_h * z_tilt
        r_dir = r_dir / np.linalg.norm(r_dir)
        s_len = 0.24 + 0.22 * (((si * 0.618034) % 1.0) ** 0.75)
        p0 = hc + r_dir * 0.115
        p_mid = hc + r_dir * (0.115 + 0.48 * s_len) + up_h * (0.012 * math.cos(si * 1.9))
        p1 = hc + r_dir * (0.115 + s_len)
        parts_h.append(sweep_tube(
            f'{gid_h}_quill_{si}', [p0, p_mid, p1],
            [0.0125, 0.0052, 0.0007], urchin_p, n=6, rigid_joint='Head', vfx=urchin_void_vfx
        ))

    ent_h = assemble_garment(
        gid_h, 'Nightmare Urchin Spiked Shadow-Orb & Red Needle-Grin', 'head', parts_h,
        covers_hair=True, covers_face=True,
        auras=[{'kind': 'spiky_dark_array', 'bone': 'Head', 'offset': [0.0, 0.04, 0.0], 'scale': 1.04}]
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # --- 3B. TORSO: ext4_{s}_urchin_shroud (Gaunt Writhing Ribcage + Sinewy Twisted Upper Arms w/ Jagged Elbow Spurs!) ---
    gid_t = f'ext4_{sex}_urchin_shroud'
    parts_t = []
    u_trunk = torso_tube(
        gid_t + '_shadow_ribcage', core.TOP + 0.008, core.WAIST - 0.022, ease=-0.004, ease_bottom=-0.022,
        paint=urchin_p, n=32, rows=13
    )
    tag_vfx(u_trunk, dread_vfx, no_conform=True)
    parts_t.append(u_trunk)

    # Sculpted gangly, sinewy upper arms with jagged elbow-spurs & wispy black shadow-strands
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        sh, el = J(side + 'Arm'), J(side + 'ForeArm')
        d_up = el - sh
        hum_pts = catmull_spline([
            sh - d_up * 0.06,
            sh + d_up * 0.45 + np.array([sgn * 0.008, 0.010, 0.0]),
            el + d_up * 0.05,
        ], 10)
        parts_t.append(sweep_tube(
            f'{gid_t}_humerus_{tag}', hum_pts,
            [0.042, 0.030, 0.026, 0.024, 0.023, 0.024, 0.026, 0.028, 0.030, 0.022],
            urchin_p, n=9, rigid_joint=side + 'Arm', twist=0.85 * sgn, vfx=urchin_void_vfx
        ))
        # Jagged backward-sweeping shadow elbow spur + trailing wispy strand (Image 3!)
        spur_end = el + np.array([sgn * 0.022, 0.095, 0.025])
        parts_t.append(sweep_tube(
            f'{gid_t}_elbow_spur_{tag}', [el - d_up * 0.08, el + np.array([0.0, 0.035, 0.0]), spur_end],
            [0.016, 0.011, 0.0012], urchin_p, n=6, rigid_joint=side + 'Arm', vfx=urchin_void_vfx
        ))

    ent_t = assemble_garment(gid_t, 'Nightmare Urchin Gaunt Shadow-Tendril Shroud', 'torso', parts_t)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # --- 3C. BACK: ext4_{s}_urchin_stalkers (Asymmetrical Pair of Gangly Multi-Jointed 5-Clawed Nightmare Stalker Arms!) ---
    gid_b = f'ext4_{sex}_urchin_stalkers'
    parts_b = []
    stalker_poses = [
        # Left Stalker Arm: arches HIGH and wide above the shoulder with poised inward-curling talons (Image 3 right side!)
        ('L',  1.0, np.array([ 0.28, 0.06,  0.22]), np.array([ 0.48, -0.14,  0.04]),
         np.array([ 0.35, -0.82, -0.45]), np.array([0.0, 0.15, 0.98]), np.array([-0.82, -0.35, -0.45]), 0.0),
        # Right Stalker Arm: sweeps wide and low-forward with splayed predatory claws (Image 3 left side!)
        ('R', -1.0, np.array([-0.34, 0.08,  0.02]), np.array([-0.46, -0.20, -0.18]),
         np.array([-0.22, -0.88, -0.42]), np.array([0.85, 0.0, 0.52]), np.array([ 0.52, -0.25, -0.82]), 2.1),
    ]
    for tag, sgn, elb_off, wr_off, f_dir, sp_dir, hk_dir, ph in stalker_poses:
        sh = J(('Left' if sgn > 0 else 'Right') + 'Arm')
        root_a = sh + np.array([-sgn * 0.04, 0.09, 0.01])
        elb_a  = sh + elb_off
        wr_a   = sh + wr_off
        kin_st = {
            'bone': 'Spine2', 'motion': 'chorus_wave', 'speed': 1.35, 'amp': 0.022,
            'phase': ph, 'center_gl': bl_to_gl_pt(root_a), 'axis_gl': [1.0, 0.0, 0.0],
        }
        st_vfx = dict(urchin_void_vfx, kinetic=kin_st)
        # Upper stalker humerus
        parts_b.append(sweep_tube(
            f'{gid_b}_humerus_{tag}', catmull_spline([root_a, 0.5 * (root_a + elb_a) + np.array([0.0, 0.03, 0.04]), elb_a], 10),
            [0.034, 0.024, 0.022, 0.025, 0.028], urchin_p, n=8, rigid_joint='Spine2', twist=0.9 * sgn, vfx=st_vfx
        ))
        # Forearm + jagged elbow spur + 2 trailing wispy forearm tendrils
        parts_b.append(sweep_tube(
            f'{gid_b}_forearm_{tag}', catmull_spline([elb_a, 0.5 * (elb_a + wr_a) + np.array([sgn * 0.03, 0.02, 0.02]), wr_a], 10),
            [0.028, 0.025, 0.021, 0.018, 0.020], urchin_p, n=8, rigid_joint='Spine2', twist=-1.1 * sgn, vfx=st_vfx
        ))
        for wi, w_u in enumerate((0.15, 0.55)):
            wp0 = elb_a * (1.0 - w_u) + wr_a * w_u
            wp1 = wp0 + np.array([sgn * 0.055, 0.065, -0.085 - 0.03 * wi])
            parts_b.append(sweep_tube(
                f'{gid_b}_wisp_{tag}_{wi}', [wp0, 0.5 * (wp0 + wp1) + np.array([sgn * 0.02, 0.02, 0.0]), wp1],
                [0.011, 0.006, 0.0009], urchin_p, n=5, rigid_joint='Spine2', vfx=st_vfx
            ))
        # Full 5-fingered crooked scythe-claw hand!
        parts_b.extend(_build_wicked_claw_hand(
            f'{gid_b}_hand_{tag}', wr_a, f_dir, sp_dir, hk_dir, sgn, 'Spine2', urchin_p, st_vfx, scale_h=1.12
        ))

    entries.append(assemble_garment(gid_b, 'Nightmare Urchin Dorsal Shadow-Claw Stalker Arms', 'back', parts_b))

    # --- 3D. GLOVES: ext4_{s}_urchin_claws (Twisted Fibrous Forearms & Giant 5-Fingered Scythe-Claw Hands!) ---
    gid_g = f'ext4_{sex}_urchin_claws'
    parts_g = []
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        u_fa = d_fa / max(float(np.linalg.norm(d_fa)), 1e-6)
        # Twisted sinewy forearm with trailing wispy shadow-fur strands
        fa_pts = catmull_spline([
            el - u_fa * 0.015,
            el + d_fa * 0.45 + np.array([sgn * 0.008, 0.012, 0.0]),
            wr + u_fa * 0.010,
        ], 10)
        parts_g.append(sweep_tube(
            f'{gid_g}_forearm_{tag}', fa_pts,
            [0.029, 0.027, 0.024, 0.021, 0.020, 0.021, 0.022],
            urchin_p, n=9, rigid_joint=side + 'ForeArm', twist=-1.15 * sgn, vfx=urchin_void_vfx
        ))
        for wi, wu in enumerate((0.25, 0.62)):
            w0 = el + d_fa * wu + np.array([0.0, 0.015, 0.0])
            w1 = w0 + np.array([sgn * 0.035, 0.075, -0.065])
            parts_g.append(sweep_tube(
                f'{gid_g}_fa_wisp_{tag}_{wi}', [w0, 0.5 * (w0 + w1), w1],
                [0.010, 0.005, 0.0009], urchin_p, n=5, rigid_joint=side + 'ForeArm', vfx=urchin_void_vfx
            ))
        # Giant 5-fingered crooked scythe-claw hand rigged to `LeftHand` / `RightHand`!
        side_v = np.cross(u_fa, np.array([0.0, 1.0, 0.0]))
        side_v = side_v / max(float(np.linalg.norm(side_v)), 1e-6)
        hook_v = np.array([-sgn * 0.42, -0.82, -0.38])
        parts_g.extend(_build_wicked_claw_hand(
            f'{gid_g}_hand_{tag}', wr, u_fa, side_v, hook_v, sgn, side + 'Hand', urchin_p, urchin_void_vfx, scale_h=1.06
        ))

    ent_g = assemble_garment(gid_g, 'Nightmare Urchin Wicked Shadow-Talons', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    apply_custom_hide(ent_g, select_body_tris(('LeftForeArm', 'RightForeArm', 'LeftHand', 'RightHand'), weight_thresh=0.18, mode='any'))
    entries.append(ent_g)

    # --- 3E. LEGS: ext4_{s}_urchin_wisps (Seamless Unlit Void-Black Writhing Shadow-Hair Tendril Trail) ---
    gid_l = f'ext4_{sex}_urchin_wisps'
    parts_l = []
    rows_w = 18
    zs_w = np.linspace(core.WAIST + 0.018, 0.08, rows_w)
    angs_w = np.linspace(0.0, 2.0 * math.pi, 28, endpoint=False)
    Q_wisps = []
    for kw_i, zv in enumerate(zs_w):
        uw = kw_i / (rows_w - 1)
        rad_wx = (1.0 - uw) ** 0.85 * 0.112 + 0.018
        rad_wy = (1.0 - uw) ** 0.85 * 0.086 + 0.018
        Q_wisps.append([
            [math.sin(a) * rad_wx * (1.0 + 0.18 * uw * math.sin(7.0 * a + uw * 6.0)),
             math.cos(a) * rad_wy * (1.0 + 0.18 * uw * math.sin(7.0 * a + uw * 6.0)), zv]
            for a in angs_w
        ])
    wisp_vfx = {
        'kind': 'alpha_erosion', 'no_push': True, 'unlit': True,
        'y_top': 0.56, 'y_bot': 0.06,
        'edge_color': '#38040a', 'smoke_color': '#020104', 'swirl': 1.55,
    }
    parts_l.append(_part_raw(gid_l + '_shadow_funnel', Q_wisps, True, urchin_p, rigid_joint='Hips', vfx=wisp_vfx))

    for ti in range(10):
        a0 = (ti / 10.0) * 2.0 * math.pi
        t_pts = []
        for kt in range(14):
            ut = kt / 13.0
            zv = (core.WAIST - 0.010) * (1.0 - ut) + 0.05 * ut
            sw_a = a0 + 0.95 * math.sin(ut * math.pi * 1.8 + ti) * ut
            rad_tx = 0.116 * (1.0 - 0.55 * ut) + 0.022
            rad_ty = 0.090 * (1.0 - 0.55 * ut) + 0.022
            t_pts.append(np.array([math.sin(sw_a) * rad_tx, math.cos(sw_a) * rad_ty, zv]))
        parts_l.append(sweep_tube(
            f'{gid_l}_strand_{ti}', t_pts, np.linspace(0.016, 0.0022, 14),
            urchin_p, n=6, rigid_joint='Hips', cap_ends=False, vfx=wisp_vfx
        ))

    ent_l = assemble_garment(gid_l, 'Nightmare Urchin Writhing Shadow-Hair Tendril Trail', 'legs', parts_l)
    hide_full_body(ent_l)
    entries.append(ent_l)
    return entries


def build_wave4_kit():
    all_entries = []
    with wave4_motif_scope():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            for fn in (_build_ocular_umbra, _build_astral_pyre, _build_nightmare_urchin):
                b_ents = fn(sex)
                for e in b_ents:
                    e['_body'] = body_id
                all_entries.extend(b_ents)
    return all_entries


def main():
    t0 = time.time()
    entries = build_wave4_kit()
    outfits = {}
    for sex_key, s in (('male', 'm'), ('female', 'f')):
        outfits[sex_key] = {
            'ocular_umbra': {
                'head':   f'ext4_{s}_umbra_peaks',
                'torso':  f'ext4_{s}_umbra_monolith',
                'back':   f'ext4_{s}_umbra_flock',
                'gloves': f'ext4_{s}_umbra_grasps',
                'legs':   f'ext4_{s}_umbra_tatter',
                'feet':   None,
                'hair':   None,
                'beard':  None,
            },
            'astral_pyre': {
                'head':   f'ext4_{s}_pyre_visage',
                'torso':  f'ext4_{s}_pyre_constellation',
                'back':   f'ext4_{s}_pyre_plumes',
                'gloves': f'ext4_{s}_pyre_claws',
                'legs':   f'ext4_{s}_pyre_legs',
                'feet':   f'ext4_{s}_pyre_steps',
                'hair':   None,
                'beard':  None,
            },
            'nightmare_urchin': {
                'head':   f'ext4_{s}_urchin_head',
                'torso':  f'ext4_{s}_urchin_shroud',
                'back':   f'ext4_{s}_urchin_stalkers',
                'gloves': f'ext4_{s}_urchin_claws',
                'legs':   f'ext4_{s}_urchin_wisps',
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
            ['ocular_umbra', 0.06],
            ['astral_pyre', 0.06],
            ['nightmare_urchin', 0.06],
        ],
        'outfits': outfits,
    }
    manifest_path = CULTURES_DIR / 'extraplanar_wave4_manifest.json'
    manifest_path.write_bytes((json.dumps(manifest, indent=2) + '\n').encode('utf-8'))
    print(
        f'Compiled {len(entries)} Wave-4 Extraplanar pieces '
        f'({len(items_by_body["mpfb_male"])} M + {len(items_by_body["mpfb_female"])} F) '
        f'in {time.time() - t0:.1f}s -> {manifest_path.name}'
    )


if __name__ == '__main__':
    main()
