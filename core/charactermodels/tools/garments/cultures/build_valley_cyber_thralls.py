"""Build the 3 Ancient's Valley Cyber-Thrall combined costume + cyberlimb archetypes (`yusar` culture)
for BOTH `mpfb_male` (`_m_`) and `mpfb_female` (`_f_`):

1. `valley_thrall_harvester` (Spliced Scavenger / Harvester Cyber-Thrall):
   - `head`:   `valley_{s}_harvester_head`
   - `torso`:  `valley_{s}_harvester_rig`
   - `back`:   `valley_{s}_harvester_tank`
   - `gloves`: `valley_{s}_harvester_claws`
   - `legs`:   `valley_{s}_harvester_trousers`
   - `feet`:   `valley_{s}_harvester_boots`

2. `valley_thrall_crusher` (Asymmetric Hulking Cyber-Brute / Crusher Thrall):
   - `head`:   `valley_{s}_crusher_helm`
   - `torso`:  `valley_{s}_crusher_harness`
   - `gloves`: `valley_{s}_crusher_pincer`
   - `legs`:   `valley_{s}_crusher_trousers`
   - `feet`:   `valley_{s}_crusher_stompers`

3. `valley_thrall_revenant` (Exhumed True-Heir / Skeletal Necro-Cyber Ghoul):
   - `head`:   `valley_{s}_revenant_skull`
   - `torso`:  `valley_{s}_revenant_chassis`
   - `gloves`: `valley_{s}_revenant_talons`
   - `legs`:   `valley_{s}_revenant_cyberlegs`
   - `feet`:   `valley_{s}_revenant_cyberfeet`

Writes `.glb` and `.morph.bin` files to `pieces/mpfb_male/` and `pieces/mpfb_female/`,
and outputs the manifest JSON to `tools/garments/cultures/valley_cyber_thralls_manifest.json`.
"""
import base64
import concurrent.futures
import json
import math
import os
import sys
import time
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[3]          # core/charactermodels
CULTURES_DIR = Path(__file__).resolve().parent      # tools/garments/cultures
if str(ROOT / 'tools') not in sys.path:
    sys.path.insert(0, str(ROOT / 'tools'))

import glbio
import make_mpfb
import garments as bio
from garments import core
from garments import (
    C, P, B, PN, Part, head_frame, horn, set_body, J,
    spine_at, first_hit, chest_front, ring_points, flap
)

# Custom palette colors in linear RGB
C.setdefault('putty', (0.58, 0.53, 0.46))
C.setdefault('corpseskin', (0.63, 0.60, 0.58))
C.setdefault('bloodglow', (0.95, 0.10, 0.08))
C.setdefault('bloodcore', (1.00, 0.36, 0.24))
C.setdefault('darkrust', (0.25, 0.11, 0.06))
C.setdefault('rustiron', (0.36, 0.18, 0.11))
C.setdefault('gunmetal', (0.19, 0.20, 0.22))
C.setdefault('darkalloy', (0.11, 0.12, 0.13))
C.setdefault('obsidian', (0.05, 0.05, 0.06))
C.setdefault('skullgrey', (0.21, 0.22, 0.24))
C.setdefault('eyewhite', (0.99, 0.99, 1.00))
C.setdefault('slategrey', (0.29, 0.32, 0.36))

_ORIG_MOTIF = bio.paint.motif

FULL_HEAD_HIDE_PARTS = [
    'Human.lips',
    'Human.ears',
    'Human.eyebrow001',
    'Human.eyebrow002',
    'Human.eyelashes01',
    'Human.eyelashes02',
    'Human.low-poly',
]


def _valley_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((h, w, 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = (xx + 0.5) / max(w, 1), (yy + 0.5) / max(h, 1)

    if style == 'harvester_stitched_dome':
        su = (u - 0.5) * 2.0
        seam1 = np.abs(su + 0.22 - 0.28 * v) < 0.020
        seam2 = np.abs(su - 0.18 + 0.22 * v) < 0.020
        ticks1 = (np.abs(su + 0.22 - 0.28 * v) < 0.058) & (np.abs(((v * 22.0) % 1.0) - 0.5) < 0.15)
        ticks2 = (np.abs(su - 0.18 + 0.22 * v) < 0.058) & (np.abs(((v * 20.0) % 1.0) - 0.5) < 0.15)
        grime = 0.88 + 0.12 * np.sin(u * 17.0 + v * 13.0) * np.cos(u * 9.0 - v * 19.0)
        img[:] = np.asarray(bg)[None, None, :] * grime[:, :, None]
        # Left cranial crimson ocular bleed & vertical red sensor scar
        red_dist = np.hypot((su - 0.26) * 1.25, (v - 0.52) * 1.45)
        red_glow = np.clip(1.0 - red_dist / 0.46, 0.0, 1.0) ** 1.45
        red_slit = (np.abs(su - 0.26) < 0.032) & (v > 0.22) & (v < 0.82)
        img[:] = img * (1.0 - 0.85 * red_glow[:, :, None]) + np.asarray(C['bloodglow'])[None, None, :] * (0.85 * red_glow[:, :, None])
        img[seam1 | seam2 | ticks1 | ticks2] = C['soot']
        img[red_slit] = C['bloodcore']
        return img

    elif style == 'crimson_vial':
        meniscus = v > 0.20
        core_glow = (v > 0.26) & (v < 0.90) & (np.abs((u - 0.5) * 2.0) < 0.52)
        img[~meniscus] = np.asarray(C['maroon']) * 0.55 + np.asarray(C['iron']) * 0.45
        img[meniscus] = C['bloodglow']
        img[core_glow] = C['bloodcore']
        grad = (0.84 + 0.18 * np.cos((u - 0.35) * 2.0 * math.pi))[:, :, None]
        img[:] = np.clip(img * grad, 0.0, 1.0)
        img[np.abs(v - 0.20) < 0.030] = C['eyewhite']
        return img

    elif style == 'rusted_scrap':
        plate_u = (u * 4.0) % 1.0
        plate_v = (v * 3.0) % 1.0
        seam = (plate_u < 0.045) | (plate_u > 0.955) | (plate_v < 0.05) | (plate_v > 0.95)
        riv_l = np.hypot((plate_u - 0.12) * 4.0, (plate_v - 0.16) * 3.0) < 0.12
        riv_r = np.hypot((plate_u - 0.88) * 4.0, (plate_v - 0.84) * 3.0) < 0.12
        rust_patch = (np.sin(u * 23.0 + v * 11.0) + 0.6 * np.cos(u * 13.0 - v * 29.0)) > 0.40
        img[rust_patch] = fg
        img[seam] = C['soot']
        img[riv_l | riv_r] = C['steel']
        return img

    elif style == 'harvester_quilt':
        rib = np.abs(((v * 16.0) % 1.0) - 0.5) > 0.36
        v_seam = (np.abs(u - 0.25) < 0.018) | (np.abs(u - 0.75) < 0.018)
        shade = 0.92 + 0.08 * np.sin(((v * 16.0) % 1.0) * math.pi)
        img[:] = np.asarray(bg)[None, None, :] * shade[:, :, None]
        img[rib | v_seam] = fg
        return img

    elif style == 'crusher_plate':
        seg_v = (v * 5.0) % 1.0
        seg_u = (u * 3.0) % 1.0
        bevel_hi = (seg_v > 0.06) & (seg_v < 0.16)
        seam = (seg_v < 0.06) | (seg_u < 0.035)
        riv = (np.hypot((seg_u - 0.12) * 3.0, (seg_v - 0.50) * 2.2) < 0.11) | (
            np.hypot((seg_u - 0.88) * 3.0, (seg_v - 0.50) * 2.2) < 0.11
        )
        img[bevel_hi] = fg
        img[seam] = C['obsidian']
        img[riv] = C['silver']
        return img

    elif style == 'crusher_servo_drum':
        su = (u - 0.5) * 2.0
        sv = (v - 0.5) * 2.0
        r = np.hypot(su, sv)
        ring_dark = (np.abs(r - 0.68) < 0.08) | (r > 0.90)
        slot_bar = (np.abs(sv) < 0.12) & (r < 0.48)
        img[r < 0.60] = fg
        img[ring_dark | slot_bar] = C['obsidian']
        return img

    elif style == 'revenant_skull_face':
        mu = (u - 0.5) * 2.0
        abs_u = np.abs(mu)
        eye_sock = np.hypot((abs_u - 0.28) * 2.2, (v - 0.38) * 2.8) < 0.35
        nasal = (v > 0.43) & (v < 0.65) & (abs_u < 0.13 * ((v - 0.39) / 0.25))
        maw = (v > 0.67) & (v < 0.94) & (abs_u < 0.35)
        teeth = (
            ((v > 0.64) & (v < 0.74)) | ((v > 0.86) & (v < 0.95))
        ) & (abs_u < 0.32) & (np.abs(((mu * 16.0) % 1.0) - 0.5) < 0.28)
        cheek_hi = (abs_u > 0.20) & (abs_u < 0.52) & (v > 0.45) & (v < 0.62)
        img[cheek_hi] = fg
        img[eye_sock | nasal | maw] = C['obsidian']
        img[teeth] = C['silver']
        return img

    elif style == 'revenant_ancient_plate':
        su = (u - 0.5) * 2.0
        r1 = np.hypot((su - 0.22) * 1.4, (v - 0.42) * 1.4)
        ring1 = (np.abs(r1 - 0.24) < 0.035) | (np.abs(r1 - 0.12) < 0.024)
        panel_cut = (np.abs(su + 0.30 * v) < 0.024) | (np.abs(v - 0.72) < 0.022)
        edge_hi = (np.abs(su + 0.30 * v - 0.04) < 0.018) | ((v > 0.06) & (v < 0.12))
        sheen = 0.88 + 0.18 * np.exp(-(((su - 0.10) / 0.46) ** 2))
        img[:] = np.clip(np.asarray(bg)[None, None, :] * sheen[:, :, None], 0.0, 1.0)
        img[edge_hi] = fg
        img[ring1 | panel_cut] = C['obsidian']
        return img

    elif style == 'revenant_rib_lames':
        # Asymmetric Revenant upper chest: right half synthetic dark deltoid/ribs, left half horizontal rib-lames
        su = (u - 0.5) * 2.0
        abs_u = np.abs(su)
        lame = (v * 5.0) % 1.0
        gap = (lame < 0.28) | (lame > 0.88)
        sternum = abs_u < 0.065
        hi_rib = (lame > 0.38) & (lame < 0.58) & (~sternum)
        img[hi_rib] = fg
        img[gap] = C['obsidian']
        img[sternum] = C['iron']
        return img

    return _ORIG_MOTIF(style, w, h, fg, bg, aspect=aspect)


bio.paint.motif = _valley_motif
bio.motif = _valley_motif


# ===============================================================================================================
# Shared Cybernetic & Costume Geometry Builders
# ===============================================================================================================
def _get_base_joint_names():
    bj, _ = glbio.read_glb(core.BASE_GLB.read_bytes())
    bskin = bj['skins'][0]
    return [bj['nodes'][k].get('name', '').split(':')[-1] for k in bskin['joints']]


def select_body_tris(joint_prefixes, weight_thresh=0.42, mode='mean', gl_pred=None):
    """Select indices of `core.BT` whose base-skin weights match `joint_prefixes` (and optional `gl_pred`)."""
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
    if gl_pred is not None:
        tri_ctr = core.BP_GL[core.BT].mean(axis=1)
        keep &= gl_pred(tri_ctr, core.BP_GL[core.BT])
    return np.nonzero(keep)[0]


def apply_custom_hide(entry, extra_tris, replace=False):
    """Merge or replace `entry['hide']` with `extra_tris` using `make_mpfb.bits`."""
    n_bt = len(core.BT)
    if (not replace) and entry.get('hide'):
        raw = np.unpackbits(np.frombuffer(base64.b64decode(entry['hide']), dtype=np.uint8), bitorder='little')[:n_bt]
        cur = np.nonzero(raw)[0]
        tris = np.unique(np.concatenate([cur, np.asarray(extra_tris, dtype=np.int32)]))
    else:
        tris = np.unique(np.asarray(extra_tris, dtype=np.int32))
    entry['hide'] = make_mpfb.bits(n_bt, tris)
    entry['hides'] = int(len(tris))
    entry['hide_by'] = 'cyber_custom'
    return entry


def assemble_garment(gid, label, slot, culture, parts, **kw):
    flat_parts = []
    for p in parts:
        if isinstance(p, (list, tuple)):
            flat_parts.extend(x for x in p if x is not None)
        elif p is not None:
            flat_parts.append(p)
    entry = bio.assemble_garment(gid, label, slot, culture, flat_parts, **kw)
    entry['type'] = 'important_npc'
    entry['culture'] = culture
    return entry


def _rigid_part(name, Q, closed, paint, rigid_joint, slot_hint='torso'):
    """Create a rigid mechanical Part immune to unintended auto-push/snap rules in `core.py`."""
    Q_arr = np.asarray(Q, dtype=np.float64)
    pt = Part(name, Q_arr, closed, ['body'] * len(Q_arr), paint, rigid_joint=rigid_joint)
    if slot_hint == 'torso':
        pt.role = 'armwear'     # skips trunk_tubes, Rule A (unless is_arm), Pass B1/B2, and Rule D
    elif slot_hint == 'back':
        pt.role = 'drape'       # skips Rule D_back snapping while preserving exact Spine2 coordinates
    elif slot_hint == 'legs':
        pt.role = 'accessory'   # skips Rule C radial push while keeping explicit rigid_joint
    elif slot_hint == 'feet':
        pt.role = 'shaft'       # skips auto-sole/foot_us distortion while clamping z >= 0.008
    return pt


def mech_tube(name, path, r0, r1, paint, n=10, rows=None, rigid_joint=None, slot_hint='torso', scale_xy=(1.0, 1.0), ref_dir=None):
    """Smooth or faceted 3D tube along `path` with optional elliptical `(sx, sy)` profile."""
    pts = [np.asarray(p, dtype=np.float64) for p in path]
    if rows is None:
        rows = max(4, len(pts) * 2)
    d_seg = [np.linalg.norm(pts[i + 1] - pts[i]) for i in range(len(pts) - 1)]
    cum = np.concatenate([[0.0], np.cumsum(d_seg)])
    total = max(float(cum[-1]), 1e-6)
    s_grid = np.linspace(0.0, total, rows)
    angs = np.linspace(0.0, 2.0 * math.pi, n, endpoint=False)

    Q = []
    for idx, s in enumerate(s_grid):
        u_t = idx / max(rows - 1, 1)
        k = int(np.clip(np.searchsorted(cum, s, side='right') - 1, 0, len(pts) - 2))
        seg_l = max(d_seg[k], 1e-8)
        alpha = (s - cum[k]) / seg_l
        c = pts[k] + (pts[k + 1] - pts[k]) * alpha
        tang = pts[min(k + 1, len(pts) - 1)] - pts[max(k, 0)]
        if np.linalg.norm(tang) < 1e-8:
            tang = pts[-1] - pts[0]
        tang = tang / max(np.linalg.norm(tang), 1e-8)
        rv = np.asarray(ref_dir, dtype=np.float64) if ref_dir is not None else (
            np.array([0.0, 1.0, 0.0]) if abs(tang[1]) < 0.88 else np.array([1.0, 0.0, 0.0])
        )
        u_ax = rv - tang * np.dot(rv, tang)
        if np.linalg.norm(u_ax) < 1e-6:
            rv2 = np.array([0.0, 0.0, 1.0]) if abs(tang[2]) < 0.88 else np.array([1.0, 0.0, 0.0])
            u_ax = rv2 - tang * np.dot(rv2, tang)
        u_ax = u_ax / max(np.linalg.norm(u_ax), 1e-8)
        v_ax = np.cross(tang, u_ax)
        v_ax = v_ax / max(np.linalg.norm(v_ax), 1e-8)

        r_cur = r0 * (1.0 - u_t) + r1 * u_t
        cap_scale = 0.16 if idx in (0, rows - 1) and rows >= 5 else 1.0
        rx = r_cur * scale_xy[0] * cap_scale
        ry = r_cur * scale_xy[1] * cap_scale
        Q.append([c + u_ax * (math.cos(a) * rx) + v_ax * (math.sin(a) * ry) for a in angs])
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint=slot_hint)


def _catmull_spline(ctrl_pts, n_samples):
    """Smooth Catmull-Rom 3D curve through `ctrl_pts` so scythes and cables sweep organically."""
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


def curved_blade(name, ctrl_pts, width_max, thick_max, edge_dir, paint, rigid_joint, rows=15, slot_hint='gloves'):
    """Sculpted Catmull-smooth 3D bladed scythe/sickle/jaw with sharp inner edge and beveled spine."""
    spine = _catmull_spline(ctrl_pts, rows)
    ed_hint = np.asarray(edge_dir, dtype=np.float64)
    ed_hint = ed_hint / max(np.linalg.norm(ed_hint), 1e-8)

    prof = [
        (0.65, 0.00),
        (0.28, -0.38),
        (-0.18, -0.50),
        (-0.44, -0.28),
        (-0.48, 0.00),
        (-0.44, 0.28),
        (-0.18, 0.50),
        (0.28, 0.38),
    ]
    Q = []
    for i in range(rows):
        u = i / max(rows - 1, 1)
        tang = spine[min(i + 1, rows - 1)] - spine[max(i - 1, 0)]
        tang = tang / max(np.linalg.norm(tang), 1e-8)
        e_ax = ed_hint - tang * np.dot(ed_hint, tang)
        if np.linalg.norm(e_ax) < 1e-5:
            e_ax = np.cross(tang, np.array([0.0, 0.0, 1.0]))
        e_ax = e_ax / max(np.linalg.norm(e_ax), 1e-8)
        s_ax = np.cross(tang, e_ax)
        s_ax = s_ax / max(np.linalg.norm(s_ax), 1e-8)

        if i == 0:
            w_u, th_u = width_max * 0.24, thick_max * 0.28
        elif i == rows - 1:
            w_u, th_u = width_max * 0.03, thick_max * 0.05
        else:
            belly = math.sin(math.pi * min(1.0, 0.16 + 0.84 * u)) ** 0.68
            tip_taper = (1.0 - u) ** 0.48
            w_u = width_max * (0.38 + 0.82 * belly) * tip_taper
            th_u = thick_max * (1.0 - 0.65 * u)
        Q.append([spine[i] + e_ax * (pe * w_u) + s_ax * (ps * th_u) for pe, ps in prof])
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint=slot_hint)


def fluid_vial(name, top_pos, axis_dir, length, radius, vial_paint, cap_paint, rigid_joint, slot_hint='torso'):
    """Glowing glass canister/vial with top & bottom dark-iron end-caps."""
    top_p = np.asarray(top_pos, dtype=np.float64)
    ax = np.asarray(axis_dir, dtype=np.float64)
    ax = ax / max(np.linalg.norm(ax), 1e-8)
    bot_p = top_p + ax * length
    return [
        mech_tube(f'{name}_glass', [top_p + ax * (0.12 * length), top_p + ax * (0.88 * length)],
                  radius, radius * 0.98, vial_paint, n=12, rows=7, rigid_joint=rigid_joint, slot_hint=slot_hint),
        mech_tube(f'{name}_cap_hi', [top_p - ax * 0.004, top_p + ax * (0.20 * length)],
                  radius * 1.16, radius * 1.12, cap_paint, n=12, rows=5, rigid_joint=rigid_joint, slot_hint=slot_hint),
        mech_tube(f'{name}_cap_lo', [bot_p - ax * (0.18 * length), bot_p + ax * 0.010],
                  radius * 1.12, radius * 0.72, cap_paint, n=12, rows=5, rigid_joint=rigid_joint, slot_hint=slot_hint),
    ]


def piston_assembly(name, p_start, p_end, r_cyl, cyl_paint, rod_paint, rigid_joint, slot_hint='torso'):
    """Two-stage hydraulic cylinder + bright steel piston rod."""
    a = np.asarray(p_start, dtype=np.float64)
    b = np.asarray(p_end, dtype=np.float64)
    mid = a + (b - a) * 0.56
    return [
        mech_tube(f'{name}_cyl', [a, mid], r_cyl, r_cyl * 0.98, cyl_paint, n=10, rows=5, rigid_joint=rigid_joint, slot_hint=slot_hint),
        mech_tube(f'{name}_rod', [mid - (b - a) * 0.08, b], r_cyl * 0.58, r_cyl * 0.58, rod_paint, n=8, rows=5, rigid_joint=rigid_joint, slot_hint=slot_hint),
    ]


def arched_shell(name, center_spine, rad_x, rad_y, ang_lo, ang_hi, thick, paint, rigid_joint, cols=10, slot_hint='legs'):
    """Thickened 3D curved armor plate (closed cross-section so inside/edges have solid bevel thickness)."""
    pts = np.asarray(center_spine, dtype=np.float64)
    rows = len(pts)
    angs_outer = np.linspace(ang_lo, ang_hi, cols)
    angs_inner = angs_outer[::-1]
    Q = []
    for i in range(rows):
        c = pts[i]
        rx = rad_x[i] if hasattr(rad_x, '__len__') else rad_x
        ry = rad_y[i] if hasattr(rad_y, '__len__') else rad_y
        cap = 0.88 if i in (0, rows - 1) and rows >= 4 else 1.0
        ring = []
        for a in angs_outer:
            ring.append(c + np.array([math.sin(a) * (rx + thick) * cap, math.cos(a) * (ry + thick) * cap, 0.0]))
        for a in angs_inner:
            ring.append(c + np.array([math.sin(a) * rx * cap, math.cos(a) * ry * cap, 0.0]))
        Q.append(ring)
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint=slot_hint)


def torso_arc_plate(name, z_top, z_bot, ang_lo, ang_hi, ease, thick, paint, rigid_joint='Spine2', rows=8, cols=10):
    """Body-conforming 3D armored chest/back sector plate raycast directly onto the trunk BVH."""
    zs = np.linspace(z_top, z_bot, rows)
    angs_f = np.linspace(ang_lo, ang_hi, cols)
    angs_b = angs_f[::-1]
    x_ax, y_ax = np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])  # ang=0 is back (+y), pi is front (-y), +pi/2 is Left (+x)
    Q = []
    for i, z in enumerate(zs):
        cz = spine_at(min(z, core.TOP))
        outer_r = ring_points(cz, x_ax, y_ax, angs_f, ease + thick, rmin=0.06, rmax=0.25, bvh=core.BVH_T)
        inner_r = ring_points(cz, x_ax, y_ax, angs_b, ease, rmin=0.06, rmax=0.24, bvh=core.BVH_T)
        for p_pt in outer_r:
            p_pt[2] = z
        for p_pt in inner_r:
            p_pt[2] = z
        Q.append(list(outer_r) + list(inner_r))
    return _rigid_part(name, Q, True, paint, rigid_joint, slot_hint='torso')


def sleeve(name, side, paint, f0=0.0, f1=0.92, ease=0.020, flare=0.008, rows=12, n=22):
    a, e, h = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
    f0_eff = max(float(f0), 0.08)

    def pt_at(f):
        if f <= 0.5:
            return a + (e - a) * (f / 0.5)
        return e + (h - e) * ((f - 0.5) / 0.5)

    if f0_eff < 0.48 and f1 > 0.52:
        path = [pt_at(f0_eff), e, pt_at(f1)]
    else:
        path = [pt_at(f0_eff), pt_at(f1)]
    return bio.limb_tube(name, None, None, ease, paint, n=n, rows=rows,
                         ease_end=ease + flare, start_back=0.0, path=path, bvh=core.BVH_A, rmax=0.15)


def trousers(gid, paint, ankle_f=0.78, ease=0.022, bag=0.022, rows=16, n=26):
    out = [
        bio.torso_tube(f'{gid}_pelvis', core.WAIST + 0.01, core.CROTCH + 0.02, ease, paint,
                       n=36, rows=6, hull_from=core.WAIST)
    ]
    for s in ('Left', 'Right'):
        hip, knee, foot = J(s + 'UpLeg'), J(s + 'Leg'), J(s + 'Foot')
        ank = knee + (foot - knee) * ankle_f
        pt = bio.limb_tube(f'{gid}_{s}', None, None, ease, paint, n=n, rows=rows,
                           ease_end=max(0.014, ease * 0.78), start_back=0.03,
                           path=[hip, knee, ank], rmax=0.19)
        if bag > 0:
            for k in range(rows):
                u = k / max(rows - 1, 1)
                b_add = bag * (math.sin(math.pi * u) ** 1.2)
                c = pt.P[k].mean(axis=0)
                vecs = pt.P[k] - c
                vecs[:, 2] = 0.0
                norms = np.linalg.norm(vecs, axis=1, keepdims=True)
                dirs = vecs / np.maximum(norms, 1e-6)
                pt.P[k] = pt.P[k] + dirs * b_add
        out.append(pt)
    return out


def boot(name, side, paint, top_f=0.58, ease=0.019, rows=14, n=24, cuff=0.014, sole_paint=None):
    foot, toe, tip, knee = J(side + 'Foot'), J(side + 'ToeBase'), J(side + 'ToeBase', 'tail'), J(side + 'Leg')
    heel = np.array([foot[0], foot[1] + 0.05, 0.0])
    front = np.array([tip[0], tip[1] - 0.016, 0.0])
    axis = front - heel
    Q_sole = []
    for k in range(10):
        c = heel + axis * (k / 9.0)
        c[2] = 0.012
        w_s = 0.055 + 0.015 * math.sin(math.pi * min(1.0, k / 9.0 * 1.2))
        Q_sole.append([c + np.array([math.cos(an) * w_s, 0, math.sin(an) * 0.012])
                       for an in np.linspace(0, 2 * math.pi, 16, endpoint=False)])
    p_sole = Part(f'{name}_sole', np.array(Q_sole), True, ['body'] * 10, sole_paint or paint)

    shaft_frac = max(0.28, min(0.92, 1.0 - top_f))
    up_pt = foot + (knee - foot) * shaft_frac
    p_shaft = bio.limb_tube(f'{name}_shaft', up_pt, np.array([foot[0], foot[1], 0.036]),
                            ease + cuff, paint, n=n, rows=rows, ease_end=ease, rmax=0.15)

    hb = first_hit(np.array([foot[0], foot[1], 0.036]), np.array([0, 1.0, 0]), maxd=0.15) or 0.05
    fa = np.array([foot[0], foot[1] + hb - 0.008, 0.042])
    fb = np.array([tip[0], tip[1] - 0.018, 0.028])
    p_foot = bio.limb_tube(f'{name}_foot', fa, fb, max(0.016, ease * 0.88), paint,
                           n=18, rows=11, ease_end=max(0.016, ease * 0.90), rmax=0.102)
    for k in (0, -1):
        c = p_foot.P[k].mean(0)
        p_foot.P[k] = c + (p_foot.P[k] - c) * 0.3
    return [p_sole, p_shaft, p_foot]


def sculpted_cranium(name, paint, f_top=1.04, f_bot=-0.08, ease=0.008, rows=15, n=36):
    a, b, up, bk, left = head_frame()
    fs = np.linspace(f_top, f_bot, rows)
    angs = np.linspace(0, 2 * math.pi, n, endpoint=False)
    Q = []
    for f in fs:
        c = a + (b - a) * f
        dome_s = 1.0 if f <= 0.74 else max(0.06, math.cos(math.pi * 0.5 * min(1.0, (f - 0.74) / max(0.08, f_top - 0.74))) ** 0.80)
        neck_taper = 1.0 - 0.22 * max(0.0, (0.28 - f) / 0.38)
        rx = (0.098 + ease) * dome_s * neck_taper
        ry = (0.126 + ease) * dome_s * neck_taper
        Q.append([c + left * (math.sin(an) * rx) + bk * (math.cos(an) * ry - 0.005 * dome_s) for an in angs])
    return Part(name, np.array(Q), True, ['body'] * rows, paint, rigid_joint='Head')


# ===============================================================================================================
# 1. `valley_thrall_harvester` (Image 1 — Spliced Scavenger / Harvester Cyber-Thrall)
# ===============================================================================================================
def _build_harvester(sex, body_id):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    sc = (b[2] - a[2]) / 0.210
    entries = []

    rust_scrap_p = P('charcoal', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'rust'),
        B('top', 0.0, 0.03, 'solid', 'umber'),
    ], [
        PN(0.0, 1.0, 'rusted_scrap', 'rust', 'charcoal', 0.22),
    ], fabric='metal.iron')

    heavy_rust_p = P('rustiron', 0.04, [
        B('bottom', 0.0, 0.04, 'solid', 'darkrust'),
        B('top', 0.0, 0.03, 'solid', 'iron'),
    ], [
        PN(0.0, 1.0, 'rusted_scrap', 'rust', 'rustiron', 0.20),
    ], fabric='metal.iron')

    putty_p = P('putty', 0.04, [
        B('bottom', 0.0, 0.025, 'solid', 'umber'),
        B('top', 0.0, 0.025, 'solid', 'umber'),
    ], [
        PN(0.0, 1.0, 'fluted', 'umber', 'putty', 0.09),
    ], fabric='leather.buckskin')

    vial_p = P('bloodglow', 0.01, [
        B('top', 0.0, 0.015, 'solid', 'iron'),
        B('bottom', 0.0, 0.015, 'solid', 'darkrust'),
    ], [
        PN(0.0, 1.0, 'crimson_vial', 'bloodcore', 'bloodglow', 0.36),
    ], fabric='beads.glass')

    red_cable_p = P('bloodglow', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'steel'),
        B('top', 0.0, 0.02, 'solid', 'darkrust'),
    ], fabric='leather.cuir_bouilli')

    iron_dark_p = P('soot', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'iron'),
        B('bottom', 0.0, 0.02, 'solid', 'rust'),
    ], fabric='metal.iron')

    # --- HEAD: valley_{s}_harvester_head ---
    gid_h = f'valley_{sex}_harvester_head'
    parts_h = []

    dome_p = P('corpseskin', 0.03, [
        B('bottom', 0.0, 0.05, 'solid', 'soot'),
    ], [
        PN(0.0, 1.0, 'harvester_stitched_dome', 'soot', 'corpseskin', 0.30),
    ], fabric='leather.buckskin')
    parts_h.append(sculpted_cranium(gid_h + '_stitched_dome', dome_p, f_top=1.02, f_bot=0.14, ease=0.005, rows=14, n=36))
    parts_h.append(sculpted_cranium(gid_h + '_inner_maw', P('omaroon', 0.03, [B('bottom', 0.0, 0.06, 'solid', 'soot')], fabric='leather.cuir_bouilli'),
                                    f_top=0.45, f_bot=-0.24, ease=-0.010, rows=9, n=28))

    # Central rusted brow-strap & nasal bridge clamp
    brow_pts = [a + (b - a) * (1.02 - 0.56 * t) - bk * (0.04 + 0.095 * (t ** 0.65)) for t in np.linspace(0, 1, 6)]
    parts_h.append(mech_tube(gid_h + '_brow_strap', brow_pts, 0.012, 0.014, heavy_rust_p, n=8, rows=6, rigid_joint='Head', slot_hint='head'))

    # Asymmetric oculars: Left (+x) large blazing crimson glow lens; Right (-x) dark sunken iron ring
    eye_l = a + (b - a) * 0.49 + left * 0.036 - bk * 0.108
    eye_r = a + (b - a) * 0.49 - left * 0.036 - bk * 0.105
    parts_h.append(mech_tube(gid_h + '_eye_socket_L', [eye_l + bk * 0.012, eye_l - bk * 0.012], 0.025, 0.022, iron_dark_p,
                             n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_tube(gid_h + '_eye_glow_L', [eye_l + bk * 0.002, eye_l - bk * 0.020], 0.019, 0.016,
                             P('bloodcore', 0.0, [B('bottom', 0.0, 0.01, 'solid', 'eyewhite')], fabric='beads.glass'),
                             n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_tube(gid_h + '_eye_socket_R', [eye_r + bk * 0.012, eye_r - bk * 0.014], 0.023, 0.018, heavy_rust_p,
                             n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
    parts_h.append(mech_tube(gid_h + '_eye_void_R', [eye_r + bk * 0.004, eye_r - bk * 0.016], 0.014, 0.009,
                             P('obsidian', 0.0, fabric='metal.iron'), n=10, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))

    # Rusted Vertical-Barred Iron Jaw-Cage + Cheek Spikes
    for z_f, r_j, tag_j in ((0.35, 0.098, 'upper'), (-0.02, 0.090, 'lower')):
        jaw_arc = [
            a + (b - a) * z_f + left * (math.sin(ang) * r_j) - bk * (math.cos(ang) * (r_j + 0.032))
            for ang in np.linspace(-0.58 * math.pi, 0.58 * math.pi, 9)
        ]
        parts_h.append(mech_tube(f'{gid_h}_jaw_rim_{tag_j}', jaw_arc, 0.014, 0.014, heavy_rust_p,
                                 n=8, rows=9, rigid_joint='Head', slot_hint='head'))
    for idx_b, ang_b in enumerate(np.linspace(-0.46 * math.pi, 0.46 * math.pi, 7)):
        p_hi = a + (b - a) * 0.37 + left * (math.sin(ang_b) * 0.097) - bk * (math.cos(ang_b) * 0.128)
        p_lo = a + (b - a) * (-0.05) + left * (math.sin(ang_b) * 0.089) - bk * (math.cos(ang_b) * 0.120)
        parts_h.append(mech_tube(f'{gid_h}_jaw_bar_{idx_b}', [p_hi, p_lo], 0.0085, 0.0055, heavy_rust_p,
                                 n=6, rows=5, rigid_joint='Head', slot_hint='head'))

    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        ear_p = a + (b - a) * 0.48 + left * (sgn * 0.100) - bk * 0.010
        parts_h.append(mech_tube(f'{gid_h}_ear_hub_{tag}', [ear_p - left * (sgn * 0.012), ear_p + left * (sgn * 0.024)],
                                 0.028, 0.024, heavy_rust_p, n=12, rows=4, rigid_joint='Head', slot_hint='head'))
        sp_base = a + (b - a) * 0.27 + left * (sgn * 0.086) - bk * 0.090
        sp_tip = sp_base + left * (sgn * 0.088) - bk * 0.028 - up * 0.012
        parts_h.append(mech_tube(f'{gid_h}_cheek_spike_{tag}', [sp_base, sp_tip], 0.013, 0.002, heavy_rust_p,
                                 n=7, rows=5, rigid_joint='Head', slot_hint='head'))

    # High Topknot Bundle of Thick Dark Cables / Dreadlocks
    knot_c = a + (b - a) * 1.00 + bk * 0.012
    parts_h.append(mech_tube(gid_h + '_topknot_collar', [knot_c - up * 0.015, knot_c + up * 0.052],
                             0.042, 0.035, putty_p, n=14, rows=5, rigid_joint='Head', slot_hint='head'))
    dread_p = P('charcoal', 0.04, [
        B('bottom', 0.0, 0.03, 'solid', 'rust'),
    ], [
        PN(0.0, 1.0, 'stripes', 'soot', 'charcoal', 0.025),
    ], fabric='leather.buckskin')
    dread_specs = [
        (-0.02, 0.03, 0.22, 0.04, 0.15, 0.13, 0.15, 0.22, -0.15, 0.018),
        (0.01, 0.01, 0.25, 0.10, 0.14, 0.16, 0.26, 0.20, -0.13, 0.019),
        (0.04, 0.04, 0.20, 0.16, 0.16, 0.09, 0.36, 0.18, -0.17, 0.017),
        (-0.04, 0.05, 0.18, 0.02, 0.19, 0.06, 0.08, 0.25, -0.23, 0.018),
        (0.03, 0.07, 0.16, 0.19, 0.18, 0.03, 0.40, 0.14, -0.23, 0.016),
        (-0.06, 0.06, 0.15, -0.08, 0.19, 0.02, -0.12, 0.24, -0.21, 0.016),
        (0.06, 0.04, 0.14, 0.23, 0.13, -0.02, 0.44, 0.10, -0.28, 0.015),
        (0.00, 0.08, 0.17, 0.12, 0.21, 0.04, 0.30, 0.22, -0.26, 0.017),
        (-0.03, 0.09, 0.13, -0.02, 0.22, -0.02, 0.04, 0.26, -0.29, 0.016),
    ]
    for idx_d, (px1, py1, pz1, px2, py2, pz2, px3, py3, pz3, rd) in enumerate(dread_specs):
        d_pts = _catmull_spline([
            knot_c + up * 0.035 + left * (px1 * 0.25),
            knot_c + left * px1 + bk * py1 + up * pz1 * sc,
            knot_c + left * px2 + bk * py2 + up * pz2 * sc,
            knot_c + left * px3 + bk * py3 + up * pz3 * sc,
        ], 10)
        parts_h.append(mech_tube(f'{gid_h}_cable_dread_{idx_d}', d_pts, rd, rd * 0.65, dread_p,
                                 n=9, rows=10, rigid_joint='Head', slot_hint='head'))

    ent_h = assemble_garment(gid_h, "Ancient's Valley Harvester Stitched Dome & Rusted Jaw-Cage", 'head', 'yusar', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    entries.append(ent_h)

    # --- TORSO: valley_{s}_harvester_rig ---
    gid_t = f'valley_{sex}_harvester_rig'
    parts_t = []

    if sex == 'f':
        graft_p = P('corpseskin', 0.03, [
            B('top', 0.0, 0.018, 'solid', 'rustiron'),
            B('bottom', 0.0, 0.018, 'solid', 'rustiron'),
        ], [
            PN(0.0, 1.0, 'harvester_stitched_dome', 'soot', 'corpseskin', 0.22),
        ], fabric='leather.buckskin')
        parts_t.append(bio.torso_tube(gid_t + '_chest_graft', core.CHEST + 0.055, core.CHEST - 0.075, 0.012, graft_p,
                                      n=34, rows=7))

    # 1. Thick Off-White / Putty Pressurized Horseshoe Neck-Collar Bladder Ring
    sh_z = core.SHOULDER
    nk_c = spine_at(core.TOP - 0.01)
    bladder_pts = []
    u_angs = np.linspace(-0.78 * math.pi, 0.78 * math.pi, 15)
    for ua in u_angs:
        sx_u = math.sin(ua)
        cy_u = math.cos(ua)
        front_drop = max(0.0, -cy_u) * 0.120
        px_b = nk_c[0] + sx_u * 0.154
        py_b = nk_c[1] + cy_u * 0.128 - max(0.0, -cy_u) * 0.048
        pz_b = sh_z + 0.100 - front_drop
        bladder_pts.append(np.array([px_b, py_b, pz_b]))
    parts_t.append(mech_tube(gid_t + '_bladder_collar', bladder_pts, 0.058, 0.058, putty_p,
                             n=14, rows=16, rigid_joint='Spine2', slot_hint='torso', scale_xy=(0.95, 1.08)))
    for clamp_i in (0, 3, 7, 11, 14):
        cp_b = bladder_pts[clamp_i]
        tg_b = bladder_pts[min(clamp_i + 1, 14)] - bladder_pts[max(clamp_i - 1, 0)]
        tg_b = tg_b / max(np.linalg.norm(tg_b), 1e-8)
        r_cl = 0.045 if clamp_i in (0, 14) else 0.062
        parts_t.append(mech_tube(f'{gid_t}_bladder_clamp_{clamp_i}', [cp_b - tg_b * 0.012, cp_b + tg_b * 0.012],
                                 r_cl, r_cl, iron_dark_p, n=12, rows=4, rigid_joint='Spine2', slot_hint='torso'))

    hose_p = P('darkrust', 0.03, [], [PN(0.0, 1.0, 'stripes', 'soot', 'rustiron', 0.022)], fabric='metal.iron')
    hose_hi = [
        bladder_pts[1] + np.array([0.02, -0.02, -0.02]),
        chest_front(core.CHEST + 0.08, 0.028, x=-0.055),
        chest_front(core.CHEST + 0.07, 0.032, x=0.0),
        chest_front(core.CHEST + 0.08, 0.028, x=0.055),
        bladder_pts[-2] + np.array([-0.02, -0.02, -0.02]),
    ]
    hose_lo = [
        bladder_pts[0] + np.array([0.01, -0.02, -0.025]),
        chest_front(core.CHEST + 0.01, 0.030, x=-0.075),
        chest_front(core.CHEST - 0.02, 0.034, x=-0.010),
        chest_front(core.CHEST + 0.00, 0.030, x=0.070),
        bladder_pts[-1] + np.array([-0.01, -0.02, -0.025]),
    ]
    parts_t.append(mech_tube(gid_t + '_chest_hose_hi', hose_hi, 0.016, 0.016, iron_dark_p, n=10, rows=9, rigid_joint='Spine2', slot_hint='torso'))
    parts_t.append(mech_tube(gid_t + '_chest_hose_lo', hose_lo, 0.018, 0.018, hose_p, n=10, rows=9, rigid_joint='Spine2', slot_hint='torso'))

    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        rib_hose = [
            spine_at(core.CHEST - 0.02) + left * (sgn * 0.145) - bk * 0.05,
            chest_front(core.WAIST + 0.08, 0.024, x=sgn * 0.105),
            chest_front(core.WAIST + 0.03, 0.020, x=sgn * 0.058),
        ]
        parts_t.append(mech_tube(f'{gid_t}_rib_feed_{tag}', rib_hose, 0.012, 0.010, hose_p, n=8, rows=6, rigid_joint='Spine1', slot_hint='torso'))

    # 2. Broad Hulking Asymmetric Scrap Pauldrons + Upper-Arm Scrap Bracers (eliminating bare bicep skin gap!)
    for side_p, sgn_p in (('Right', -1.0), ('Left', 1.0)):
        sh_j, el_j = J(side_p + 'Arm'), J(side_p + 'ForeArm')
        d_ua = (el_j - sh_j) / max(np.linalg.norm(el_j - sh_j), 1e-8)
        # Upper-arm dark hydraulic sleeve/cuff from shoulder down to elbow
        parts_t.append(sleeve(f'{gid_t}_bicep_wrap_{side_p}', side_p, iron_dark_p, f0=0.08, f1=0.52, ease=0.014, flare=0.004, rows=8, n=18))
        # Large multi-layered domed/angular scrap shoulder carapace on `side_p + 'Arm'`
        angs_sh = np.linspace(0, 2 * math.pi, 22, endpoint=False)
        sh_rows = []
        for dz_s, rx_s, ry_s in (
            (0.095, 0.025, 0.025),
            (0.075, 0.115, 0.120),
            (0.025, 0.142, 0.145),
            (-0.045, 0.135, 0.138),
            (-0.115, 0.112, 0.115),
            (-0.150, 0.068, 0.072),
        ):
            c_sh = sh_j + left * (sgn_p * 0.032) + d_ua * max(0.0, -dz_s * 0.35) + up * dz_s
            sh_rows.append([c_sh + left * (math.sin(an) * rx_s) + bk * (math.cos(an) * ry_s) for an in angs_sh])
        parts_t.append(_rigid_part(f'{gid_t}_hulking_pauldron_{side_p}', sh_rows, True,
                                   rust_scrap_p if side_p == 'Right' else heavy_rust_p, side_p + 'Arm', slot_hint='torso'))

    # Right Shoulder (-x): Spiky rebar bolts + lower jagged rust shingle plates
    sh_r, el_r = J('RightArm'), J('RightForeArm')
    d_ua_r = (el_r - sh_r) / max(np.linalg.norm(el_r - sh_r), 1e-8)
    parts_t.append(mech_tube(gid_t + '_shingle_bicep_R', [sh_r + d_ua_r * 0.22 - left * 0.035, sh_r + d_ua_r * 0.62 - left * 0.030],
                             0.072, 0.056, heavy_rust_p, n=10, rows=6, rigid_joint='RightArm', slot_hint='torso', scale_xy=(0.75, 1.25)))
    for idx_s, (da, dz, ln_s) in enumerate((
        (-0.30, 0.065, 0.088),
        (0.08, 0.080, 0.095),
        (0.42, 0.058, 0.082),
        (-0.48, 0.015, 0.080),
        (0.00, 0.010, 0.092),
        (0.35, -0.035, 0.078),
    )):
        out_r = (-left * 0.84 + bk * math.sin(da) * 0.52 + up * (0.38 + dz * 3.8))
        out_r = out_r / np.linalg.norm(out_r)
        sb = sh_r + out_r * 0.095 + up * dz
        parts_t.append(mech_tube(f'{gid_t}_rebar_spike_R_{idx_s}', [sb, sb + out_r * ln_s], 0.010, 0.0025,
                                 heavy_rust_p, n=6, rows=4, rigid_joint='RightArm', slot_hint='torso'))

    # Left Shoulder (+x): Jutting angular rusted prow-plate + slate shoulder cap (matching Image 1's jutting left shoulder!)
    sh_l, el_l = J('LeftArm'), J('LeftForeArm')
    d_ua_l = (el_l - sh_l) / max(np.linalg.norm(el_l - sh_l), 1e-8)
    prow_l_pts = [
        sh_l + left * 0.055 - bk * 0.055 + up * 0.055,
        sh_l + left * 0.145 - bk * 0.042 + up * 0.005,
        sh_l + left * 0.215 - bk * 0.025 - up * 0.045,
    ]
    parts_t.append(mech_tube(gid_t + '_jutting_prow_L', prow_l_pts, 0.056, 0.024, heavy_rust_p,
                             n=8, rows=6, rigid_joint='LeftArm', slot_hint='torso', scale_xy=(0.65, 1.35)))
    parts_t.append(mech_tube(gid_t + '_slate_cap_L', [sh_l + left * 0.045 + up * 0.08, sh_l + left * 0.105 + up * 0.03],
                             0.052, 0.044, P('slategrey', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'soot')], fabric='metal.iron'),
                             n=10, rows=5, rigid_joint='LeftArm', slot_hint='torso'))

    # Dark corrugated shoulder harness tracks anchoring the bladder & back tank
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        track_pts = [
            spine_at(core.SHOULDER + 0.04) + left * (sgn * 0.135) + bk * 0.10,
            spine_at(core.SHOULDER + 0.06) + left * (sgn * 0.148) - bk * 0.02,
            chest_front(core.CHEST + 0.01, 0.038, x=sgn * 0.128),
        ]
        parts_t.append(mech_tube(f'{gid_t}_shoulder_track_{tag}', track_pts, 0.028, 0.025, iron_dark_p,
                                 n=8, rows=6, rigid_joint='Spine2', slot_hint='torso', scale_xy=(1.25, 0.45)))

    # 3. 6 Large Glowing Crimson Glass Fluid Canisters/Vials hung under both pauldrons
    vial_specs = [
        (-0.215, -0.068, core.CHEST - 0.01, -0.18, 0.125, 0.029, 'Spine2'),
        (-0.180, -0.102, core.CHEST - 0.09, -0.08, 0.135, 0.031, 'Spine2'),
        (-0.172, -0.088, core.WAIST + 0.03, -0.12, 0.125, 0.029, 'Spine1'),
        (0.195, -0.085, core.CHEST - 0.03, 0.14, 0.130, 0.030, 'Spine2'),
        (0.172, -0.105, core.CHEST - 0.12, 0.08, 0.132, 0.030, 'Spine1'),
        (0.220, -0.045, core.CHEST - 0.08, 0.18, 0.118, 0.026, 'Spine2'),
    ]
    for idx_v, (vx, vy, vz, tx, vlen, vrad, vjn) in enumerate(vial_specs):
        parts_t.extend(fluid_vial(f'{gid_t}_vial_{idx_v}', np.array([vx, vy, vz]), np.array([tx, -0.05, -1.0]),
                                  vlen, vrad, vial_p, iron_dark_p, vjn, slot_hint='torso'))

    # 4. Dense Fringe of Dangling Red IV/Power Cables & Syringe-Plugs flanking both sides
    cable_specs = [
        (-0.22, -0.05, core.CHEST - 0.03, -0.27, -0.07, core.WAIST - 0.04, -0.25, -0.06, core.CROTCH - 0.22, 0.0095),
        (-0.19, -0.09, core.CHEST - 0.08, -0.23, -0.10, core.WAIST - 0.08, -0.21, -0.08, core.CROTCH - 0.12, 0.0085),
        (-0.24, 0.02, core.CHEST - 0.03, -0.29, 0.01, core.WAIST - 0.05, -0.27, 0.00, core.CROTCH - 0.16, 0.0090),
        (-0.17, -0.06, core.WAIST + 0.04, -0.20, -0.08, core.CROTCH - 0.02, -0.18, -0.07, core.CROTCH - 0.18, 0.0075),
        (0.21, -0.06, core.CHEST - 0.04, 0.26, -0.08, core.WAIST - 0.05, 0.24, -0.06, core.CROTCH - 0.24, 0.0095),
        (0.18, -0.09, core.CHEST - 0.09, 0.22, -0.10, core.WAIST - 0.08, 0.20, -0.08, core.CROTCH - 0.13, 0.0085),
        (0.24, 0.02, core.CHEST - 0.04, 0.29, 0.01, core.WAIST - 0.04, 0.27, -0.01, core.CROTCH - 0.18, 0.0090),
        (0.23, -0.02, core.CHEST - 0.02, 0.31, -0.02, core.WAIST + 0.02, 0.32, -0.03, core.CROTCH - 0.06, 0.0080),
    ]
    needle_p = P('silver', 0.01, [B('top', 0.0, 0.02, 'solid', 'rustiron')], fabric='metal.iron')
    for idx_c, (x0, y0, z0, x1, y1, z1, x2, y2, z2, rc) in enumerate(cable_specs):
        c_pts = _catmull_spline([[x0, y0, z0], [x1, y1, z1], [x2, y2, z2]], 9)
        parts_t.append(mech_tube(f'{gid_t}_iv_cable_{idx_c}', c_pts, rc, rc * 0.85, red_cable_p,
                                 n=7, rows=9, rigid_joint='Spine1', slot_hint='torso'))
        p2 = np.array([x2, y2, z2])
        parts_t.append(mech_tube(f'{gid_t}_syringe_tip_{idx_c}', [p2 + up * 0.005, p2 - up * 0.062],
                                 rc * 1.55, 0.0018, needle_p, n=7, rows=5, rigid_joint='Spine1', slot_hint='torso'))

    # Tattered dark-rust rear/flank cape-strips hanging down to knee height
    shroud_p = P('umber', 0.05, [B('bottom', 0.0, 0.06, 'rays', 'soot', 'rust', 0.03)], fabric='cloth.weave.burlap')
    for sgn, tag in ((-1.0, 'R'), (0.0, 'C'), (1.0, 'L')):
        f_top = core.surface_out(spine_at(core.CHEST + 0.02) + left * (sgn * 0.105), bk, 0.012, bvh=core.BVH_T)
        p_tat = flap(f'{gid_t}_tatter_flank_{tag}', f_top, 0.13, 0.72, left * (sgn * 0.32) + bk * 0.94, shroud_p,
                     cols=5, rows=10, sway=0.02, push=False, rigid_joint='Spine1')
        p_tat.role = 'armwear'
        parts_t.append(p_tat)

    ent_t = assemble_garment(gid_t, "Ancient's Valley Harvester Bladder-Collar, Vials & Scrap Rig", 'torso', 'yusar', parts_t,
                             open_torso=True)
    # Hide Head face skin + BOTH full arms (`LeftArm`, `RightArm`, `ForeArm`, `Hand`) so zero bare bicep skin peeks out!
    hide_harv_t = np.unique(np.concatenate([
        select_body_tris(('Head',), weight_thresh=0.42, mode='mean'),
        select_body_tris(('LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand'),
                         weight_thresh=0.38, mode='mean'),
    ]))
    apply_custom_hide(ent_t, hide_harv_t, replace=True)
    entries.append(ent_t)

    # --- BACK: valley_{s}_harvester_tank ---
    gid_b = f'valley_{sex}_harvester_tank'
    parts_b = []
    tank_z = core.SHOULDER + 0.080
    tank_y = spine_at(tank_z)[1] + 0.155

    tank_body_p = P('rust', 0.04, [
        B('top', 0.0, 0.05, 'solid', 'darkrust'),
        B('bottom', 0.0, 0.05, 'solid', 'darkrust'),
    ], [
        PN(0.0, 1.0, 'rusted_scrap', 'umber', 'rust', 0.24),
    ], fabric='metal.bronze')

    p_tank_r = np.array([-0.285, tank_y, tank_z])
    p_tank_l = np.array([0.295, tank_y + 0.01, tank_z + 0.01])
    parts_b.append(mech_tube(gid_b + '_main_cylinder', [p_tank_r, p_tank_l], 0.090, 0.088, tank_body_p,
                             n=20, rows=10, rigid_joint='Spine2', slot_hint='back'))
    for idx_mb, xm in enumerate((-0.15, 0.0, 0.16)):
        cm = p_tank_r + (p_tank_l - p_tank_r) * ((xm + 0.285) / 0.58)
        parts_b.append(mech_tube(f'{gid_b}_strap_ring_{idx_mb}', [cm - left * 0.018, cm + left * 0.018],
                                 0.096, 0.096, iron_dark_p, n=18, rows=4, rigid_joint='Spine2', slot_hint='back'))
    parts_b.extend(fluid_vial(gid_b + '_right_gauge', p_tank_r + left * 0.01, -left, 0.135, 0.028,
                              vial_p, iron_dark_p, 'Spine2', slot_hint='back'))
    valve_base = np.array([-0.160, tank_y - 0.015, tank_z + 0.080])
    valve_top = valve_base + np.array([-0.020, -0.010, 0.125])
    parts_b.append(mech_tube(gid_b + '_valve_riser', [valve_base - up * 0.02, valve_top], 0.019, 0.015, putty_p,
                             n=10, rows=5, rigid_joint='Spine2', slot_hint='back'))
    wheel_p = P('bloodglow', 0.02, [B('top', 0.0, 0.01, 'solid', 'crimson')], fabric='metal.iron')
    wheel_n = 16
    wheel_ring = [
        valve_top + np.array([math.cos(an) * 0.062, math.sin(an) * 0.056, 0.014 * math.cos(an)])
        for an in np.linspace(0, 2 * math.pi, wheel_n + 1)
    ]
    parts_b.append(mech_tube(gid_b + '_handwheel_rim', wheel_ring, 0.0105, 0.0105, wheel_p,
                             n=8, rows=wheel_n + 1, rigid_joint='Spine2', slot_hint='back'))
    for sp_k in range(3):
        ang_sp = sp_k * math.pi / 3.0
        sp_vec = np.array([math.cos(ang_sp) * 0.060, math.sin(ang_sp) * 0.054, 0.014 * math.cos(ang_sp)])
        parts_b.append(mech_tube(f'{gid_b}_handwheel_spoke_{sp_k}', [valve_top - sp_vec, valve_top + sp_vec],
                                 0.0070, 0.0070, wheel_p, n=6, rows=4, rigid_joint='Spine2', slot_hint='back'))

    entries.append(assemble_garment(gid_b, "Ancient's Valley Harvester Pressurized Dorsal Tank & Red Valve", 'back', 'yusar', parts_b))

    # --- GLOVES: valley_{s}_harvester_claws (Dual Mantis/Scythe Cyberlimbs) ---
    gid_g = f'valley_{sex}_harvester_claws'
    parts_g = []
    scythe_blade_p = P('rustiron', 0.03, [
        B('top', 0.0, 0.05, 'solid', 'darkrust'),
        B('bottom', 0.0, 0.08, 'solid', 'bloodglow'),
    ], [
        PN(0.0, 1.0, 'rusted_scrap', 'bloodglow', 'rustiron', 0.28),
    ], fabric='metal.iron')

    for side, sgn in (('Left', 1.0), ('Right', -1.0)):
        sh_j, el_j, wr_j = J(side + 'Arm'), J(side + 'ForeArm'), J(side + 'Hand')
        d_ua = (el_j - sh_j) / max(np.linalg.norm(el_j - sh_j), 1e-8)
        d_fa = (wr_j - el_j) / max(np.linalg.norm(wr_j - el_j), 1e-8)
        out_lat = left * sgn
        inward = -out_lat
        fwd = -bk

        parts_g.append(mech_tube(f'{gid_g}_bicep_collar_{side}',
                                 [el_j - d_ua * 0.14, el_j + d_ua * 0.03],
                                 0.058, 0.054, rust_scrap_p, n=14, rows=5, rigid_joint=side + 'Arm', slot_hint='gloves'))
        parts_g.append(mech_tube(f'{gid_g}_forearm_core_{side}',
                                 [el_j - d_fa * 0.02, el_j + (wr_j - el_j) * 0.82],
                                 0.054, 0.040, heavy_rust_p, n=14, rows=8, rigid_joint=side + 'ForeArm', slot_hint='gloves'))
        parts_g.append(mech_tube(f'{gid_g}_forearm_guard_{side}',
                                 [el_j + (wr_j - el_j) * 0.18 + out_lat * 0.026 - bk * 0.010,
                                  el_j + (wr_j - el_j) * 0.76 + out_lat * 0.020 - bk * 0.010],
                                 0.048, 0.038, rust_scrap_p, n=10, rows=6, rigid_joint=side + 'ForeArm', slot_hint='gloves',
                                 scale_xy=(0.75, 1.30)))
        parts_g.extend(piston_assembly(f'{gid_g}_fa_piston_{side}',
                                       el_j + (wr_j - el_j) * 0.06 - bk * 0.046,
                                       el_j + (wr_j - el_j) * 0.88 - bk * 0.034,
                                       0.015, iron_dark_p, P('steel', 0.02, fabric='metal.iron'),
                                       side + 'ForeArm', slot_hint='gloves'))

        n_vials_fa = 2 if side == 'Right' else 1
        for kv in range(n_vials_fa):
            v_off_y = -0.028 + 0.052 * kv
            v_base = el_j + (wr_j - el_j) * 0.12 + out_lat * 0.048 + bk * v_off_y + up * 0.075
            parts_g.extend(fluid_vial(f'{gid_g}_fa_vial_{side}_{kv}', v_base, -up * 0.85 + d_fa * 0.45,
                                      0.098, 0.022, vial_p, iron_dark_p, side + 'ForeArm', slot_hint='gloves'))
        for ks, fs_pos in enumerate((0.32, 0.50, 0.68)):
            sp_o = el_j + (wr_j - el_j) * fs_pos + out_lat * 0.042
            parts_g.append(mech_tube(f'{gid_g}_fa_spike_{side}_{ks}',
                                     [sp_o, sp_o + out_lat * 0.078 + up * 0.015],
                                     0.008, 0.002, heavy_rust_p, n=6, rows=4, rigid_joint=side + 'ForeArm', slot_hint='gloves'))

        claw_hub = wr_j + d_fa * 0.075
        parts_g.append(mech_tube(f'{gid_g}_wrist_servo_{side}',
                                 [wr_j - d_fa * 0.045, claw_hub + d_fa * 0.02],
                                 0.028, 0.036, iron_dark_p, n=12, rows=5, rigid_joint=side + 'Hand', slot_hint='gloves'))

        # DRAMATIC MASSIVE 3-PRONGED SWEEPING BLOOD-RUSTED C-SCYTHE CLAWS!
        # Talon 1: Long dorsal/outer primary scythe arching out, down, and hooking sharply inward & forward!
        t1_pts = [
            claw_hub + out_lat * 0.020 + up * 0.012,
            claw_hub + d_fa * 0.105 + out_lat * 0.088 + fwd * 0.015,
            claw_hub + d_fa * 0.245 + out_lat * 0.068 - up * 0.035,
            claw_hub + d_fa * 0.345 - out_lat * 0.045 - up * 0.065 + fwd * 0.020,
            claw_hub + d_fa * 0.345 + inward * 0.185 - up * 0.025 + fwd * 0.045,
        ]
        parts_g.append(curved_blade(f'{gid_g}_scythe_main_{side}', t1_pts, 0.062, 0.020,
                                    inward * 0.80 - d_fa * 0.45, scythe_blade_p, side + 'Hand', rows=15))

        # Talon 2: Slightly shorter anterior/middle sweeping scythe splayed cleanly above/forward of Talon 1!
        t2_pts = [
            claw_hub + out_lat * 0.012 + fwd * 0.032 + up * 0.022,
            claw_hub + d_fa * 0.088 + out_lat * 0.055 + fwd * 0.068 + up * 0.015,
            claw_hub + d_fa * 0.195 + out_lat * 0.025 + fwd * 0.062 - up * 0.010,
            claw_hub + d_fa * 0.255 + inward * 0.075 + fwd * 0.042 - up * 0.015,
            claw_hub + d_fa * 0.240 + inward * 0.190 + fwd * 0.030 + up * 0.015,
        ]
        parts_g.append(curved_blade(f'{gid_g}_scythe_sec_{side}', t2_pts, 0.050, 0.017,
                                    inward * 0.80 - d_fa * 0.45, scythe_blade_p, side + 'Hand', rows=14))

        # Talon 3: Wicked opposing inner thumb-scythe curving inward then back outward toward the main talons!
        th_root = wr_j + d_fa * 0.020 + inward * 0.028 + fwd * 0.015 - up * 0.015
        t3_pts = [
            th_root,
            th_root + d_fa * 0.060 + inward * 0.092 + fwd * 0.022 - up * 0.020,
            th_root + d_fa * 0.150 + inward * 0.095 + fwd * 0.012 - up * 0.035,
            th_root + d_fa * 0.220 + inward * 0.020 + fwd * 0.005 - up * 0.020,
        ]
        parts_g.append(curved_blade(f'{gid_g}_scythe_thumb_{side}', t3_pts, 0.044, 0.016,
                                    out_lat * 0.85 + d_fa * 0.25, scythe_blade_p, side + 'Hand', rows=12))

    ent_g = assemble_garment(gid_g, "Ancient's Valley Harvester Dual Blood-Rusted Scythe Cyber-Claws", 'gloves', 'yusar', parts_g)
    hide_harv_g = select_body_tris(('LeftForeArm', 'LeftHand', 'RightForeArm', 'RightHand'), weight_thresh=0.32, mode='mean')
    apply_custom_hide(ent_g, hide_harv_g, replace=True)
    entries.append(ent_g)

    # --- LEGS: valley_{s}_harvester_trousers ---
    gid_l = f'valley_{sex}_harvester_trousers'
    trouser_p = P('slategrey', 0.04, [
        B('top', 0.0, 0.05, 'solid', 'charcoal'),
        B('bottom', 0.0, 0.16, 'stripes', 'putty', 'slategrey', 0.028),
    ], [
        PN(0.15, 0.85, 'harvester_quilt', 'charcoal', 'slategrey', 0.14),
    ], fabric='cloth.quilted.channel')
    parts_l = trousers(gid_l, trouser_p, ankle_f=0.78, ease=0.020, bag=0.018, rows=16, n=26)

    parts_l.append(bio.torso_tube(gid_l + '_belt', core.WAIST + 0.03, core.WAIST - 0.03, 0.032, iron_dark_p, n=36, rows=5, hull_from=core.WAIST + 0.03))
    groin_top = chest_front(core.WAIST - 0.01, 0.036)
    p_groin = flap(gid_l + '_groin_tasset', groin_top, 0.130, 0.34, np.array([0.0, -1.0, 0.0]),
                   heavy_rust_p, cols=5, rows=8, push=False, rigid_joint='Hips')
    p_groin.role = 'accessory'
    parts_l.append(p_groin)
    # Central iron belt ring clasp
    ring_pos = chest_front(core.WAIST + 0.005, 0.046)
    parts_l.append(mech_tube(gid_l + '_belt_ring', [ring_pos + bk * 0.008, ring_pos - bk * 0.015],
                             0.028, 0.025, heavy_rust_p, n=14, rows=4, rigid_joint='Hips', slot_hint='legs', ref_dir=up))

    hip_l = J('LeftUpLeg')
    pouch_c = hip_l + left * 0.098 + bk * 0.01 - up * 0.08
    parts_l.append(mech_tube(gid_l + '_hip_pouch_L', [pouch_c + up * 0.070, pouch_c - up * 0.070],
                             0.048, 0.044, P('charcoal', 0.03, [B('top', 0.0, 0.02, 'solid', 'iron')], fabric='leather.cuir_bouilli'),
                             n=10, rows=5, rigid_joint='LeftUpLeg', slot_hint='legs', scale_xy=(0.65, 1.15)))

    knee_dome_p = P('slategrey', 0.03, [B('bottom', 0.0, 0.02, 'solid', 'rust')],
                    [PN(0.0, 1.0, 'rusted_scrap', 'rust', 'slategrey', 0.20)], fabric='metal.iron')
    for s_leg, sgn_l in (('Left', 1.0), ('Right', -1.0)):
        kn_j = J(s_leg + 'Leg')
        kn_c = kn_j - bk * 0.064 + up * 0.012
        parts_l.append(mech_tube(f'{gid_l}_kneecap_{s_leg}', [kn_c + up * 0.058, kn_c - up * 0.058],
                                 0.060, 0.052, knee_dome_p, n=14, rows=6, rigid_joint=s_leg + 'Leg', slot_hint='legs',
                                 scale_xy=(0.98, 0.65)))

    # Right-Leg External Orthopedic / Exoskeleton Spike-Rod Brace (`RightLeg`)
    kn_r, ft_r = J('RightLeg'), J('RightFoot')
    rod_top = kn_r - left * 0.096 - bk * 0.010 + up * 0.030
    rod_bot = ft_r - left * 0.086 - bk * 0.008 + up * 0.055
    parts_l.append(mech_tube(gid_l + '_exo_rod_R', [rod_top, rod_bot], 0.012, 0.011, heavy_rust_p,
                             n=8, rows=8, rigid_joint='RightLeg', slot_hint='legs'))
    for idx_cl, f_sh in enumerate((0.18, 0.62)):
        c_sh = kn_r + (ft_r - kn_r) * f_sh
        r_sh = rod_top + (rod_bot - rod_top) * f_sh
        parts_l.append(mech_tube(f'{gid_l}_exo_strut_R_{idx_cl}', [c_sh - left * 0.042, r_sh - left * 0.010],
                                 0.015, 0.013, heavy_rust_p, n=8, rows=4, rigid_joint='RightLeg', slot_hint='legs'))
    for idx_sp, f_sp in enumerate((0.05, 0.22, 0.42, 0.78)):
        sp_p = rod_top + (rod_bot - rod_top) * f_sp
        parts_l.append(mech_tube(f'{gid_l}_exo_spike_R_{idx_sp}', [sp_p, sp_p - left * 0.052 + up * 0.014],
                                 0.008, 0.002, heavy_rust_p, n=6, rows=4, rigid_joint='RightLeg', slot_hint='legs'))

    entries.append(assemble_garment(gid_l, "Ancient's Valley Harvester Quilted Trousers & Right Spike-Brace", 'legs', 'yusar', parts_l, legged=True))

    # --- FEET: valley_{s}_harvester_boots ---
    gid_f = f'valley_{sex}_harvester_boots'
    parts_f = []
    boot_p = P('slategrey', 0.03, [
        B('top', 0.0, 0.04, 'solid', 'rustiron'),
        B('bottom', 0.0, 0.05, 'dentils', 'iron', 'soot', 0.03),
    ], [
        PN(0.15, 0.85, 'rusted_scrap', 'rustiron', 'slategrey', 0.20),
    ], fabric='metal.iron')
    sole_p = P('soot', 0.03, [B('top', 0.0, 0.015, 'dentils', 'steel', 'soot', 0.025)], fabric='metal.iron')

    for s_ft in ('Left', 'Right'):
        parts_f.extend(boot(f'{gid_f}_{s_ft}', s_ft, boot_p, top_f=0.62, ease=0.020, rows=14, n=24, cuff=0.016, sole_paint=sole_p))
        ft_j, tip_j = J(s_ft + 'Foot'), J(s_ft + 'ToeBase', 'tail')
        tc_a = np.array([tip_j[0], tip_j[1] + 0.035, 0.036])
        tc_b = np.array([tip_j[0], tip_j[1] - 0.022, 0.022])
        parts_f.append(mech_tube(f'{gid_f}_steeltip_{s_ft}', [tc_a, tc_b], 0.048, 0.038, iron_dark_p,
                                 n=12, rows=5, rigid_joint=s_ft + 'ToeBase', slot_hint='feet', scale_xy=(1.15, 0.55)))
        if s_ft == 'Right':
            ank_r = np.array([ft_j[0], ft_j[1], max(0.068, ft_j[2])])
            parts_f.append(mech_tube(f'{gid_f}_anklebrace_R', [ank_r + left * 0.055, ank_r - left * 0.080],
                                     0.025, 0.023, heavy_rust_p, n=10, rows=5, rigid_joint='RightFoot', slot_hint='feet'))
            for k_as, dz_as in enumerate((0.022, -0.016)):
                sp_a = ank_r - left * 0.072 + up * dz_as
                parts_f.append(mech_tube(f'{gid_f}_anklespike_R_{k_as}', [sp_a, sp_a - left * 0.064 + up * 0.016],
                                         0.0085, 0.002, heavy_rust_p, n=6, rows=4, rigid_joint='RightFoot', slot_hint='feet'))

    entries.append(assemble_garment(gid_f, "Ancient's Valley Harvester Cleated Steel-Toe Boots", 'feet', 'yusar', parts_f))
    return entries


# ===============================================================================================================
# 2. `valley_thrall_crusher` (Image 2 — Asymmetric Hulking Cyber-Brute / Crusher Thrall)
# ===============================================================================================================
def _build_crusher(sex, body_id):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    gunmetal_p = P('gunmetal', 0.03, [
        B('top', 0.0, 0.03, 'solid', 'steel'),
        B('bottom', 0.0, 0.03, 'solid', 'obsidian'),
    ], [
        PN(0.0, 1.0, 'crusher_plate', 'steel', 'gunmetal', 0.22),
    ], fabric='metal.iron')

    bright_steel_p = P('steel', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'silver'),
        B('bottom', 0.0, 0.02, 'solid', 'gunmetal'),
    ], [
        PN(0.0, 1.0, 'crusher_plate', 'silver', 'steel', 0.20),
    ], fabric='metal.iron')

    servo_drum_p = P('gunmetal', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'silver'),
        B('bottom', 0.0, 0.02, 'solid', 'obsidian'),
    ], [
        PN(0.0, 1.0, 'crusher_servo_drum', 'silver', 'gunmetal', 0.26),
    ], fabric='metal.iron')

    dark_carbon_p = P('obsidian', 0.03, [
        B('top', 0.0, 0.02, 'solid', 'gunmetal'),
    ], fabric='metal.iron')

    # --- HEAD: valley_{s}_crusher_helm ---
    gid_h = f'valley_{sex}_crusher_helm'
    parts_h = []

    angs_sk = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    cap_rows = []
    for f_h in np.linspace(1.03, 0.18, 12):
        c_h = a + (b - a) * f_h
        dome_s = 1.0 if f_h <= 0.75 else max(0.06, math.cos(math.pi * 0.5 * min(1.0, (f_h - 0.75) / 0.28)) ** 0.80)
        rx = 0.105 * dome_s
        ry = 0.133 * dome_s
        row_pts = []
        for an in angs_sk:
            sx_a, cy_a = math.sin(an), math.cos(an)
            front_lift = max(0.0, -cy_a) ** 1.4 * max(0.0, 0.62 - f_h)
            c_adj = c_h + up * ((b[2] - a[2]) * front_lift)
            row_pts.append(c_adj + left * (sx_a * rx) + bk * (cy_a * ry - 0.004 * dome_s))
        cap_rows.append(row_pts)
    parts_h.append(Part(gid_h + '_skullcap', np.array(cap_rows), True, ['body'] * len(cap_rows), gunmetal_p, rigid_joint='Head'))

    ridge_pts = [
        a + (b - a) * 0.62 - bk * 0.134,
        a + (b - a) * 0.84 - bk * 0.114,
        a + (b - a) * 1.04 - bk * 0.015,
        a + (b - a) * 0.88 + bk * 0.110,
        a + (b - a) * 0.45 + bk * 0.134,
    ]
    parts_h.append(mech_tube(gid_h + '_sagittal_ridge', ridge_pts, 0.015, 0.013, bright_steel_p,
                             n=8, rows=8, rigid_joint='Head', slot_hint='head'))
    crown_p = a + (b - a) * 1.03 - bk * 0.010
    parts_h.append(mech_tube(gid_h + '_crown_spike', [crown_p - up * 0.01, crown_p + up * 0.064],
                             0.018, 0.002, bright_steel_p, n=8, rows=5, rigid_joint='Head', slot_hint='head'))

    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        eh = a + (b - a) * 0.46 + left * (sgn * 0.106) - bk * 0.008
        parts_h.append(mech_tube(f'{gid_h}_ear_drum_{tag}', [eh - left * (sgn * 0.014), eh + left * (sgn * 0.024)],
                                 0.034, 0.029, servo_drum_p, n=14, rows=4, rigid_joint='Head', slot_hint='head'))
    chin_arc = [
        a + (b - a) * 0.44 - left * 0.104 - bk * 0.015,
        a + (b - a) * 0.18 - left * 0.094 - bk * 0.068,
        a + (b - a) * (-0.05) - left * 0.058 - bk * 0.114,
        a + (b - a) * (-0.08) - bk * 0.124,
        a + (b - a) * (-0.05) + left * 0.058 - bk * 0.114,
        a + (b - a) * 0.18 + left * 0.094 - bk * 0.068,
        a + (b - a) * 0.44 + left * 0.104 - bk * 0.015,
    ]
    parts_h.append(mech_tube(gid_h + '_chin_trap', chin_arc, 0.021, 0.021, gunmetal_p,
                             n=10, rows=11, rigid_joint='Head', slot_hint='head', scale_xy=(0.85, 1.35)))
    chin_front = a + (b - a) * (-0.07) - bk * 0.124
    parts_h.append(mech_tube(gid_h + '_chin_plate', [chin_front - left * 0.050, chin_front + left * 0.050],
                             0.028, 0.028, bright_steel_p, n=8, rows=5, rigid_joint='Head', slot_hint='head', scale_xy=(0.55, 1.25)))

    entries.append(assemble_garment(gid_h, "Ancient's Valley Crusher Spiked Skullcap & Bolted Chin-Trap", 'head', 'yusar', parts_h,
                                    covers_hair=True, covers_face=False))

    # --- TORSO: valley_{s}_crusher_harness ---
    gid_t = f'valley_{sex}_crusher_harness'
    parts_t = []

    if sex == 'f':
        parts_t.append(bio.torso_tube(gid_t + '_chest_strap_f', core.CHEST + 0.055, core.CHEST - 0.070, 0.014, gunmetal_p,
                                      n=34, rows=7))

    # 1. RIGHT SIDE (-x): Body-Hugging Contoured Right Pectoral/Rib/Scapula Socket Plate (NO back bulge!)
    # Angles on torso_arc_plate: 0 is back (+y), -pi/2 is Right (-x), -pi is front (-y)
    parts_t.append(torso_arc_plate(gid_t + '_right_socket_plate',
                                   core.TOP - 0.01, core.WAIST + 0.09,
                                   -0.86 * math.pi, -0.14 * math.pi,
                                   ease=0.014, thick=0.018, paint=gunmetal_p, rigid_joint='Spine2', rows=8, cols=12))
    # High trapezius steel bridge collar connecting right neck to the colossal pauldron (matching Image 2!)
    sh_r = J('RightArm')
    trap_bridge = [
        spine_at(core.TOP + 0.02) - left * 0.052 - bk * 0.01,
        0.5 * (spine_at(core.TOP + 0.02) + sh_r) - left * 0.02 + up * 0.065,
        sh_r - left * 0.02 + up * 0.085,
    ]
    parts_t.append(mech_tube(gid_t + '_right_trap_bridge', trap_bridge, 0.045, 0.056, bright_steel_p,
                             n=10, rows=6, rigid_joint='Spine2', slot_hint='torso', scale_xy=(0.75, 1.25)))

    # Colossal Multi-Tiered Domed Gunmetal Pauldron on `RightArm`
    angs_cp = np.linspace(0, 2 * math.pi, 28, endpoint=False)
    dome_ctr = sh_r - left * 0.032 + up * 0.055
    pauld_rows = []
    for dz_p, rx_p, ry_p in (
        (0.155, 0.022, 0.022),
        (0.135, 0.105, 0.112),
        (0.088, 0.152, 0.158),
        (0.030, 0.172, 0.175),
        (-0.028, 0.165, 0.168),
        (-0.082, 0.140, 0.148),
        (-0.100, 0.092, 0.098),
    ):
        c_p = dome_ctr + up * dz_p
        pauld_rows.append([c_p + left * (math.sin(an) * rx_p) + bk * (math.cos(an) * ry_p) for an in angs_cp])
    parts_t.append(_rigid_part(gid_t + '_colossal_pauldron_R', pauld_rows, True, gunmetal_p, 'RightArm', slot_hint='torso'))

    # Stepped outer steel arch-crest + 2 prominent rows of large conical steel spikes!
    rim_arc = [
        dome_ctr + up * (0.115 - 0.06 * abs(t)) - left * (0.145 - 0.03 * abs(t)) + bk * (t * 0.142)
        for t in np.linspace(-0.85, 0.85, 9)
    ]
    parts_t.append(mech_tube(gid_t + '_pauldron_tier_rim_R', rim_arc, 0.026, 0.026, bright_steel_p,
                             n=10, rows=9, rigid_joint='RightArm', slot_hint='torso'))
    for row_sp, (z_sp, r_sp, n_sp) in enumerate(((0.132, 0.102, 4), (0.095, 0.145, 4))):
        for k_sp, t_sp in enumerate(np.linspace(-0.55, 0.55, n_sp)):
            dir_sp = -left * 0.55 + up * 0.80 + bk * (t_sp * 0.46)
            dir_sp = dir_sp / np.linalg.norm(dir_sp)
            sp_b = dome_ctr + dir_sp * r_sp + up * (z_sp * 0.25)
            parts_t.append(mech_tube(f'{gid_t}_pauldron_spike_{row_sp}_{k_sp}', [sp_b, sp_b + dir_sp * 0.065],
                                     0.019, 0.0025, bright_steel_p, n=9, rows=5, rigid_joint='RightArm', slot_hint='torso'))

    # Prominent Circular Shoulder Servo-Drum with dark concentric slot on front-outer Right deltoid!
    drum_c = sh_r - left * 0.068 - bk * 0.096 - up * 0.002
    drum_ax = (-left * 0.45 - bk * 0.88)
    drum_ax = drum_ax / np.linalg.norm(drum_ax)
    parts_t.append(mech_tube(gid_t + '_shoulder_servo_drum_R', [drum_c - drum_ax * 0.028, drum_c + drum_ax * 0.036],
                             0.072, 0.065, servo_drum_p, n=20, rows=5, rigid_joint='RightArm', slot_hint='torso', ref_dir=up))

    # 3 Angled Hydraulic Pistons bridging right pectoral socket up into shoulder servo
    for idx_hp, (dx_p, dz_p) in enumerate(((-0.105, 0.03), (-0.130, -0.02), (-0.152, -0.06))):
        p_lo = chest_front(core.CHEST + dz_p, 0.032, x=dx_p)
        p_hi = sh_r + left * 0.012 - bk * 0.058 - up * (0.010 - idx_hp * 0.018)
        parts_t.extend(piston_assembly(f'{gid_t}_pec_piston_R_{idx_hp}', p_lo, p_hi, 0.015,
                                       dark_carbon_p, bright_steel_p, 'Spine2', slot_hint='torso'))

    # 2. LEFT SIDE (+x): Contoured Bolted Metal C-Harness framing the completely BARE muscular Left arm!
    parts_t.append(torso_arc_plate(gid_t + '_left_c_plate',
                                   core.SHOULDER + 0.04, core.CHEST - 0.06,
                                   0.42 * math.pi, 0.84 * math.pi,
                                   ease=0.014, thick=0.016, paint=bright_steel_p, rigid_joint='Spine2', rows=6, cols=8))
    sh_l = J('LeftArm')
    c_rim_pts = [
        spine_at(core.SHOULDER + 0.06) + left * 0.095 + bk * 0.085,
        sh_l - left * 0.010 + up * 0.062 - bk * 0.015,
        chest_front(core.CHEST + 0.055, 0.034, x=0.128),
        chest_front(core.CHEST - 0.040, 0.032, x=0.092),
        spine_at(core.CHEST - 0.05) + left * 0.155 + bk * 0.040,
    ]
    parts_t.append(mech_tube(gid_t + '_left_c_rim', c_rim_pts, 0.026, 0.022, bright_steel_p,
                             n=10, rows=9, rigid_joint='Spine2', slot_hint='torso'))
    for idx_lb, pt_lb in enumerate((c_rim_pts[1] + left * 0.02 - bk * 0.03, c_rim_pts[2] + left * 0.01 - bk * 0.018)):
        parts_t.append(mech_tube(f'{gid_t}_left_boss_{idx_lb}', [pt_lb + bk * 0.012, pt_lb - bk * 0.020],
                                 0.032, 0.027, servo_drum_p, n=14, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up))

    ent_t = assemble_garment(gid_t, "Ancient's Valley Crusher Spiked Right Pauldron & Asymmetric Harness", 'torso', 'yusar', parts_t,
                             open_torso=True)
    hide_crush_r = select_body_tris(('RightArm', 'RightForeArm', 'RightHand'), weight_thresh=0.36, mode='mean')
    apply_custom_hide(ent_t, hide_crush_r, replace=True)
    entries.append(ent_t)

    # --- GLOVES: valley_{s}_crusher_pincer ---
    gid_g = f'valley_{sex}_crusher_pincer'
    parts_g = []

    sh_r, el_r, wr_r = J('RightArm'), J('RightForeArm'), J('RightHand')
    d_ua_r = (el_r - sh_r) / max(np.linalg.norm(el_r - sh_r), 1e-8)
    d_fa_r = (wr_r - el_r) / max(np.linalg.norm(wr_r - el_r), 1e-8)

    parts_g.append(mech_tube(gid_g + '_ua_core_R', [sh_r + d_ua_r * 0.02, el_r + d_ua_r * 0.02],
                             0.060, 0.054, dark_carbon_p, n=14, rows=7, rigid_joint='RightArm', slot_hint='gloves'))
    parts_g.append(mech_tube(gid_g + '_ua_outer_plate_R',
                             [sh_r + d_ua_r * 0.08 - left * 0.036, el_r - d_ua_r * 0.02 - left * 0.030],
                             0.052, 0.045, gunmetal_p, n=10, rows=6, rigid_joint='RightArm', slot_hint='gloves', scale_xy=(0.75, 1.35)))
    for k_up, off_v in enumerate((-bk * 0.052 - left * 0.015, bk * 0.045 - left * 0.020)):
        parts_g.extend(piston_assembly(f'{gid_g}_ua_piston_R_{k_up}',
                                       sh_r + d_ua_r * 0.05 + off_v, el_r - d_ua_r * 0.02 + off_v,
                                       0.018, gunmetal_p, bright_steel_p, 'RightArm', slot_hint='gloves'))

    parts_g.append(mech_tube(gid_g + '_elbow_drum_R', [el_r - bk * 0.056, el_r + bk * 0.056],
                             0.058, 0.055, servo_drum_p, n=14, rows=4, rigid_joint='RightForeArm', slot_hint='gloves', ref_dir=left))
    parts_g.append(mech_tube(gid_g + '_fa_housing_R', [el_r - d_fa_r * 0.02, wr_r + d_fa_r * 0.04],
                             0.070, 0.062, gunmetal_p, n=16, rows=8, rigid_joint='RightForeArm', slot_hint='gloves'))
    parts_g.append(mech_tube(gid_g + '_fa_cowling_R',
                             [el_r - d_fa_r * 0.05 - left * 0.046, wr_r - d_fa_r * 0.03 - left * 0.040],
                             0.048, 0.040, bright_steel_p, n=10, rows=6, rigid_joint='RightForeArm', slot_hint='gloves', scale_xy=(0.70, 1.32)))
    for k_fp, off_f in enumerate((-bk * 0.058, bk * 0.052)):
        parts_g.extend(piston_assembly(f'{gid_g}_fa_piston_R_{k_fp}',
                                       el_r + d_fa_r * 0.04 + off_f, wr_r + off_f * 0.85,
                                       0.018, dark_carbon_p, bright_steel_p, 'RightForeArm', slot_hint='gloves'))

    # COLOSSAL 3-Jaw Industrial Hydraulic Crusher Claw (`RightHand`)!
    turret_c = wr_r + d_fa_r * 0.060
    for sgn_d, tag_d in ((-1.0, 'outer'), (1.0, 'inner')):
        d_piv = turret_c + left * (sgn_d * 0.062) - bk * 0.010
        parts_g.append(mech_tube(f'{gid_g}_jaw_pivot_{tag_d}', [d_piv - bk * 0.036, d_piv + bk * 0.036],
                                 0.048, 0.045, servo_drum_p, n=16, rows=4, rigid_joint='RightHand', slot_hint='gloves', ref_dir=left))

    # Central Grooved Steel Anvil / Pile-Bunker Ram Prong (`~0.42 m`!)
    ram_end = turret_c + d_fa_r * 0.415
    parts_g.append(mech_tube(gid_g + '_central_ram', [turret_c - d_fa_r * 0.02, ram_end],
                             0.032, 0.022, dark_carbon_p, n=8, rows=10, rigid_joint='RightHand', slot_hint='gloves', scale_xy=(0.82, 1.22)))
    parts_g.append(mech_tube(gid_g + '_ram_tip_teeth', [turret_c + d_fa_r * 0.24, ram_end + d_fa_r * 0.028],
                             0.026, 0.018, bright_steel_p, n=8, rows=6, rigid_joint='RightHand', slot_hint='gloves', scale_xy=(0.92, 1.28)))

    jaw_outer_pts = [
        turret_c - left * 0.062,
        turret_c + d_fa_r * 0.12 - left * 0.142 - bk * 0.010,
        turret_c + d_fa_r * 0.28 - left * 0.175 - bk * 0.014,
        turret_c + d_fa_r * 0.42 - left * 0.135 - bk * 0.012,
    ]
    jaw_inner_pts = [
        turret_c + left * 0.062,
        turret_c + d_fa_r * 0.12 + left * 0.118 - bk * 0.010,
        turret_c + d_fa_r * 0.28 + left * 0.145 - bk * 0.014,
        turret_c + d_fa_r * 0.42 + left * 0.105 - bk * 0.012,
    ]
    parts_g.append(curved_blade(gid_g + '_pincer_jaw_outer', jaw_outer_pts, 0.088, 0.038,
                                left, bright_steel_p, 'RightHand', rows=12))
    parts_g.append(curved_blade(gid_g + '_pincer_jaw_inner', jaw_inner_pts, 0.088, 0.038,
                                -left, bright_steel_p, 'RightHand', rows=12))
    # Serrated crushing teeth blocks along inner edges of both jaws
    for kt, ut in enumerate(np.linspace(0.28, 0.88, 6)):
        po_t = jaw_outer_pts[0] * (1 - ut) + jaw_outer_pts[-1] * ut - left * 0.035 * math.sin(math.pi * ut)
        pi_t = jaw_inner_pts[0] * (1 - ut) + jaw_inner_pts[-1] * ut + left * 0.030 * math.sin(math.pi * ut)
        parts_g.append(mech_tube(f'{gid_g}_tooth_out_{kt}', [po_t + left * 0.015, po_t + left * 0.048],
                                 0.014, 0.006, dark_carbon_p, n=6, rows=4, rigid_joint='RightHand', slot_hint='gloves'))
        parts_g.append(mech_tube(f'{gid_g}_tooth_in_{kt}', [pi_t - left * 0.015, pi_t - left * 0.048],
                                 0.014, 0.006, dark_carbon_p, n=6, rows=4, rigid_joint='RightHand', slot_hint='gloves'))

    # Left Wrist (+x): Heavy Riveted Iron Wrist-Shackle Cuff ONLY (bare organic left hand!)
    parts_g.append(sleeve(gid_g + '_shackle_cuff_Left', 'Left', gunmetal_p, f0=0.80, f1=0.96, ease=0.020, flare=0.005, rows=6, n=20))

    ent_g = assemble_garment(gid_g, "Ancient's Valley Crusher 3-Jaw Hydraulic Pincer & Left Shackle", 'gloves', 'yusar', parts_g)
    apply_custom_hide(ent_g, hide_crush_r, replace=True)
    entries.append(ent_g)

    # --- LEGS: valley_{s}_crusher_trousers ---
    gid_l = f'valley_{sex}_crusher_trousers'
    crush_trouser_p = P('charcoal', 0.04, [
        B('top', 0.0, 0.06, 'solid', 'gunmetal'),
        B('bottom', 0.0, 0.05, 'solid', 'obsidian'),
    ], [
        PN(0.18, 0.82, 'crusher_plate', 'iron', 'charcoal', 0.16),
    ], fabric='leather.cuir_bouilli')
    parts_l = trousers(gid_l, crush_trouser_p, ankle_f=0.76, ease=0.026, bag=0.028, rows=16, n=26)

    parts_l.append(bio.torso_tube(gid_l + '_heavy_belt', core.WAIST + 0.048, core.WAIST - 0.038, 0.038, bright_steel_p,
                                  n=40, rows=6, hull_from=core.WAIST + 0.048))
    b_pos = chest_front(core.WAIST + 0.005, 0.050)
    parts_l.append(mech_tube(gid_l + '_belt_boss', [b_pos + bk * 0.012, b_pos - bk * 0.026],
                             0.056, 0.048, servo_drum_p, n=18, rows=4, rigid_joint='Hips', slot_hint='legs', ref_dir=up))

    # Clean wrap-around segmented thigh & knee armor shells standing cleanly outside trouser bag
    for s_leg, sgn_l in (('Left', 1.0), ('Right', -1.0)):
        hip_j, kn_j = J(s_leg + 'UpLeg'), J(s_leg + 'Leg')
        th_spine = [hip_j + (kn_j - hip_j) * f for f in np.linspace(0.28, 0.84, 6)]
        a_lo = 0.45 * math.pi if sgn_l > 0 else -1.35 * math.pi
        a_hi = 1.35 * math.pi if sgn_l > 0 else -0.45 * math.pi
        parts_l.append(arched_shell(f'{gid_l}_thigh_plate_{s_leg}', th_spine,
                                    0.105, 0.112, a_lo, a_hi, 0.012, gunmetal_p, s_leg + 'UpLeg', cols=9, slot_hint='legs'))
        kn_spine = [kn_j + up * dz for dz in np.linspace(0.065, -0.065, 5)]
        parts_l.append(arched_shell(f'{gid_l}_knee_shell_{s_leg}', kn_spine,
                                    [0.072, 0.088, 0.092, 0.086, 0.070],
                                    [0.078, 0.094, 0.098, 0.092, 0.075],
                                    0.65 * math.pi if sgn_l > 0 else -1.35 * math.pi,
                                    1.35 * math.pi if sgn_l > 0 else -0.65 * math.pi,
                                    0.014, bright_steel_p, s_leg + 'Leg', cols=9, slot_hint='legs'))

    entries.append(assemble_garment(gid_l, "Ancient's Valley Crusher Boss-Belted Armored Work Trousers", 'legs', 'yusar', parts_l, legged=True))

    # --- FEET: valley_{s}_crusher_stompers ---
    gid_f = f'valley_{sex}_crusher_stompers'
    parts_f = []
    stomper_p = P('gunmetal', 0.03, [
        B('top', 0.0, 0.05, 'solid', 'steel'),
        B('bottom', 0.0, 0.06, 'dentils', 'steel', 'obsidian', 0.035),
    ], [
        PN(0.15, 0.85, 'crusher_plate', 'steel', 'gunmetal', 0.22),
    ], fabric='metal.iron')
    stomper_sole_p = P('obsidian', 0.03, [B('top', 0.0, 0.018, 'dentils', 'steel', 'obsidian', 0.03)], fabric='metal.iron')

    for s_ft in ('Left', 'Right'):
        parts_f.extend(boot(f'{gid_f}_{s_ft}', s_ft, stomper_p, top_f=0.52, ease=0.026, rows=15, n=26, cuff=0.022, sole_paint=stomper_sole_p))
        tip_j = J(s_ft + 'ToeBase', 'tail')
        tc_a = np.array([tip_j[0], tip_j[1] + 0.042, 0.042])
        tc_b = np.array([tip_j[0], tip_j[1] - 0.024, 0.024])
        parts_f.append(mech_tube(f'{gid_f}_stomper_cap_{s_ft}', [tc_a, tc_b], 0.056, 0.046, bright_steel_p,
                                 n=12, rows=5, rigid_joint=s_ft + 'ToeBase', slot_hint='feet', scale_xy=(1.22, 0.58)))

    entries.append(assemble_garment(gid_f, "Ancient's Valley Crusher Heavy Steel-Capped Stompers", 'feet', 'yusar', parts_f))
    return entries


# ===============================================================================================================
# 3. `valley_thrall_revenant` (Image 3 — Exhumed True-Heir / Skeletal Necro-Cyber Ghoul)
# ===============================================================================================================
def _build_revenant(sex, body_id):
    set_body(body_id)
    a, b, up, bk, left = head_frame()
    entries = []

    ancient_alloy_p = P('gunmetal', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'obsidian'),
        B('bottom', 0.0, 0.02, 'solid', 'obsidian'),
    ], [
        PN(0.0, 1.0, 'revenant_ancient_plate', 'steel', 'gunmetal', 0.26),
    ], fabric='metal.iron')

    synth_flesh_p = P('darkalloy', 0.03, [
        B('bottom', 0.0, 0.03, 'solid', 'obsidian'),
    ], [
        PN(0.0, 1.0, 'fluted', 'gunmetal', 'darkalloy', 0.08),
    ], fabric='leather.cuir_bouilli')

    obsidian_mech_p = P('obsidian', 0.02, [
        B('top', 0.0, 0.015, 'solid', 'iron'),
        B('bottom', 0.0, 0.015, 'solid', 'iron'),
    ], fabric='metal.iron')

    # High-contrast steel + obsidian phalanx bands so the right 5-claw hand pops sharply against any background!
    steel_claw_p = P('steel', 0.02, [
        B('top', 0.0, 0.020, 'solid', 'obsidian'),
        B('bottom', 0.0, 0.025, 'solid', 'obsidian'),
    ], [
        PN(0.18, 0.82, 'crusher_plate', 'silver', 'gunmetal', 0.24),
    ], fabric='metal.iron')

    # --- HEAD: valley_{s}_revenant_skull ---
    gid_h = f'valley_{sex}_revenant_skull'
    parts_h = []

    skull_p = P('skullgrey', 0.02, [
        B('bottom', 0.0, 0.04, 'solid', 'obsidian'),
    ], [
        PN(0.0, 1.0, 'revenant_skull_face', 'steel', 'skullgrey', 0.30),
    ], fabric='metal.iron')

    angs_sk = np.linspace(0, 2 * math.pi, 36, endpoint=False)
    skull_rows = []
    for f_s in np.linspace(1.02, 0.16, 13):
        c_s = a + (b - a) * f_s
        dome_s = 1.0 if f_s <= 0.74 else max(0.06, math.cos(math.pi * 0.5 * min(1.0, (f_s - 0.74) / 0.28)) ** 0.80)
        cheek_bulge = 1.08 * math.exp(-(((f_s - 0.42) / 0.12) ** 2))
        maxilla_taper = 1.0 - 0.34 * max(0.0, (0.38 - f_s) / 0.22)
        rx = 0.094 * dome_s * maxilla_taper + 0.010 * cheek_bulge
        ry = 0.120 * dome_s * (1.0 - 0.18 * max(0.0, (0.36 - f_s) / 0.20))
        row_s = []
        for an in angs_sk:
            sx_a, cy_a = math.sin(an), math.cos(an)
            frontness = max(0.0, -cy_a)
            brow = 0.016 * math.exp(-(((f_s - 0.57) / 0.07) ** 2)) * (frontness ** 1.6)
            eye_pit = -0.024 * math.exp(-(((abs(sx_a) - 0.34) / 0.18) ** 2)) * math.exp(-(((f_s - 0.47) / 0.08) ** 2)) * frontness
            nasal_pit = -0.020 * math.exp(-((sx_a / 0.16) ** 2)) * math.exp(-(((f_s - 0.34) / 0.09) ** 2)) * (frontness ** 2)
            zygo = 0.014 * math.exp(-(((abs(sx_a) - 0.58) / 0.18) ** 2)) * math.exp(-(((f_s - 0.40) / 0.08) ** 2)) * frontness
            row_s.append(c_s + left * (sx_a * rx) + bk * (cy_a * ry - (brow + eye_pit + nasal_pit + zygo)))
        skull_rows.append(row_s)
    parts_h.append(Part(gid_h + '_cranium_maxilla', np.array(skull_rows), True, ['body'] * len(skull_rows), skull_p, rigid_joint='Head'))

    parts_h.append(mech_tube(gid_h + '_neck_spine', [a + (b - a) * 0.32 + bk * 0.01, a - (b - a) * 0.36 + bk * 0.015],
                             0.044, 0.048, obsidian_mech_p, n=14, rows=6, rigid_joint='Head', slot_hint='head'))
    jaw_drop_arc = [
        a + (b - a) * 0.34 - left * 0.072 - bk * 0.025,
        a + (b - a) * 0.08 - left * 0.056 - bk * 0.070,
        a + (b - a) * (-0.08) - left * 0.032 - bk * 0.100,
        a + (b - a) * (-0.12) - bk * 0.110,
        a + (b - a) * (-0.08) + left * 0.032 - bk * 0.100,
        a + (b - a) * 0.08 + left * 0.056 - bk * 0.070,
        a + (b - a) * 0.34 + left * 0.072 - bk * 0.025,
    ]
    parts_h.append(mech_tube(gid_h + '_gaping_mandible', jaw_drop_arc, 0.015, 0.015, skull_p,
                             n=9, rows=9, rigid_joint='Head', slot_hint='head', scale_xy=(0.80, 1.35)))
    fang_p = P('silver', 0.01, [B('top', 0.0, 0.02, 'solid', 'obsidian')], fabric='metal.iron')
    for k_f, sx_f in enumerate(np.linspace(-0.034, 0.034, 6)):
        zf_curve = 0.010 * (1.0 - (sx_f / 0.036) ** 2)
        up_root = a + (b - a) * 0.20 + left * sx_f - bk * (0.095 + zf_curve)
        lo_root = a + (b - a) * (-0.07) + left * (sx_f * 0.88) - bk * (0.094 + zf_curve)
        parts_h.append(mech_tube(f'{gid_h}_tooth_hi_{k_f}', [up_root, up_root - up * 0.024], 0.0044, 0.0012, fang_p,
                                 n=5, rows=4, rigid_joint='Head', slot_hint='head'))
        parts_h.append(mech_tube(f'{gid_h}_tooth_lo_{k_f}', [lo_root, lo_root + up * 0.024], 0.0042, 0.0012, fang_p,
                                 n=5, rows=4, rigid_joint='Head', slot_hint='head'))

    white_eye_p = P('eyewhite', 0.0, fabric='beads.glass')
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        oc = a + (b - a) * 0.47 + left * (sgn * 0.033) - bk * 0.096
        parts_h.append(mech_tube(f'{gid_h}_ocular_rim_{tag}', [oc + bk * 0.010, oc - bk * 0.008],
                                 0.022, 0.020, obsidian_mech_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))
        parts_h.append(mech_tube(f'{gid_h}_ocular_white_{tag}', [oc + bk * 0.002, oc - bk * 0.016],
                                 0.0165, 0.0145, white_eye_p, n=14, rows=4, rigid_joint='Head', slot_hint='head', ref_dir=up))

    imp_c = a + (b - a) * 0.78 + left * 0.068 - bk * 0.055
    imp_dir = (left * 0.68 - bk * 0.52 + up * 0.50)
    imp_dir = imp_dir / np.linalg.norm(imp_dir)
    parts_h.append(mech_tube(gid_h + '_temple_implant_L', [imp_c - imp_dir * 0.010, imp_c + imp_dir * 0.012],
                             0.036, 0.032, obsidian_mech_p, n=14, rows=4, rigid_joint='Head', slot_hint='head',
                             scale_xy=(0.75, 1.25), ref_dir=up))
    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        nc1 = _catmull_spline([
            a + (b - a) * 0.80 + left * (sgn * 0.082) + bk * 0.01,
            a + (b - a) * 0.62 + left * (sgn * 0.125) + bk * 0.02,
            a + (b - a) * 0.18 + left * (sgn * 0.092) + bk * 0.03,
            a - (b - a) * 0.25 + left * (sgn * 0.065) + bk * 0.02,
        ], 9)
        parts_h.append(mech_tube(f'{gid_h}_neural_cable_{tag}', nc1, 0.0070, 0.0070, obsidian_mech_p,
                                 n=7, rows=9, rigid_joint='Head', slot_hint='head'))

    ent_h = assemble_garment(gid_h, "Ancient's Valley Revenant Blazing-Eye Cyber-Skull", 'head', 'yusar', parts_h,
                             covers_hair=True, covers_face=True)
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    entries.append(ent_h)

    # --- TORSO: valley_{s}_revenant_chassis ---
    gid_t = f'valley_{sex}_revenant_chassis'
    parts_t = []

    rib_lame_p = P('gunmetal', 0.02, [
        B('top', 0.0, 0.02, 'solid', 'obsidian'),
        B('bottom', 0.0, 0.02, 'solid', 'obsidian'),
    ], [
        PN(0.0, 1.0, 'revenant_rib_lames', 'steel', 'gunmetal', 0.24),
    ], fabric='metal.iron')

    # 1. BROAD V-TAPERED UPPER THORACIC CHASSIS (`WAIST + 0.11` up to `TOP + 0.01` ONLY — stopping high above the waist so the abdomen below is 100% OPEN!)
    parts_t.append(bio.torso_tube(gid_t + '_upper_thorax', core.TOP + 0.01, core.WAIST + 0.11, -0.004, synth_flesh_p,
                                  n=38, rows=10))
    stern_pts = [chest_front(z_st, 0.008) for z_st in np.linspace(core.SHOULDER + 0.01, core.WAIST + 0.11, 5)]
    parts_t.append(mech_tube(gid_t + '_sternum', stern_pts, 0.022, 0.018, obsidian_mech_p,
                             n=8, rows=6, rigid_joint='Spine2', slot_hint='torso', scale_xy=(1.1, 0.55)))

    # 4 pairs of sculpted 3D horizontal dark-alloy rib-bars hugging the V-tapered upper ribcage!
    x_ax, y_ax = np.array([0.0, 1.0, 0.0]), np.array([1.0, 0.0, 0.0])
    for idx_rb, z_rb in enumerate(np.linspace(core.CHEST + 0.01, core.WAIST + 0.12, 4)):
        cz_r = spine_at(z_rb)
        for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
            angs_rib = np.linspace(0.20 * math.pi, 0.94 * math.pi, 8) * sgn
            rib_pts = ring_points(cz_r, x_ax, y_ax, angs_rib, 0.006, rmin=0.07, rmax=0.22, bvh=core.BVH_T)
            for p_rp in rib_pts:
                p_rp[2] = z_rb
            parts_t.append(mech_tube(f'{gid_t}_rib_bar_{idx_rb}_{tag}', rib_pts, 0.013, 0.011, rib_lame_p,
                                     n=8, rows=8, rigid_joint='Spine2', slot_hint='torso', scale_xy=(0.65, 1.25)))

    # Seamless Synthetic Right Deltoid Cap (`RightArm`) bridging smoothly from right clavicle/pecs!
    sh_r, el_r = J('RightArm'), J('RightForeArm')
    d_ua_r = (el_r - sh_r) / max(np.linalg.norm(el_r - sh_r), 1e-8)
    parts_t.append(mech_tube(gid_t + '_synth_shoulder_bridge_R',
                             [sh_r + left * 0.055 + up * 0.035, sh_r, sh_r + d_ua_r * 0.25],
                             0.070, 0.056, synth_flesh_p, n=16, rows=6, rigid_joint='RightArm', slot_hint='torso'))

    # Sleek Angular Ancient Dark-Alloy Left Pectoral Shield + Recessed Circular Locking Ring + Angular Left Pauldron!
    parts_t.append(torso_arc_plate(gid_t + '_ancient_pec_shield_L',
                                   core.TOP - 0.01, core.CHEST - 0.03,
                                   0.42 * math.pi, 0.98 * math.pi,
                                   ease=0.008, thick=0.018, paint=ancient_alloy_p, rigid_joint='Spine2', rows=7, cols=10))
    lock_c = chest_front(core.CHEST + 0.055, 0.030, x=0.068)
    parts_t.append(mech_tube(gid_t + '_pectoral_lock_ring_L', [lock_c + bk * 0.008, lock_c - bk * 0.016],
                             0.038, 0.034, obsidian_mech_p, n=18, rows=4, rigid_joint='Spine2', slot_hint='torso', ref_dir=up))

    sh_l = J('LeftArm')
    sh_l_rows = []
    angs_al = np.linspace(0, 2 * math.pi, 22, endpoint=False)
    for dz_l, rx_l, ry_l in (
        (0.105, 0.025, 0.025),
        (0.082, 0.105, 0.108),
        (0.025, 0.122, 0.125),
        (-0.045, 0.112, 0.115),
        (-0.115, 0.088, 0.092),
        (-0.140, 0.042, 0.045),
    ):
        c_al = sh_l + left * 0.008 + up * dz_l
        row_al = []
        for an in angs_al:
            cs, sn = math.cos(an), math.sin(an)
            wx = np.sign(sn) * (abs(sn) ** 0.58) * rx_l
            wy = np.sign(cs) * (abs(cs) ** 0.58) * ry_l
            row_al.append(c_al + left * wx + bk * wy)
        sh_l_rows.append(row_al)
    parts_t.append(_rigid_part(gid_t + '_ancient_pauldron_L', sh_l_rows, True, ancient_alloy_p, 'LeftArm', slot_hint='torso'))

    # 2. HOLLOWED-OUT LOWER TORSO / WAIST (`Spine1` -> `Spine` -> `Hips`) — TRUE OPEN NEGATIVE SPACE!
    sp2_j, sp1_j, sp0_j, hip_j = J('Spine2'), J('Spine1'), J('Spine'), J('Hips')
    spine_col_pts = [
        sp2_j + bk * 0.042 - up * 0.03,
        sp1_j + bk * 0.045,
        sp0_j + bk * 0.042,
        hip_j + bk * 0.032 - up * 0.04,
    ]
    parts_t.append(mech_tube(gid_t + '_exposed_spine', spine_col_pts, 0.034, 0.032, obsidian_mech_p,
                             n=12, rows=10, rigid_joint='Spine', slot_hint='torso'))
    for kz, z_v in enumerate(np.linspace(core.WAIST + 0.10, core.WAIST - 0.06, 5)):
        vc = spine_at(z_v) + bk * 0.040
        parts_t.append(mech_tube(f'{gid_t}_vertebra_ring_{kz}', [vc + up * 0.012, vc - up * 0.012],
                                 0.045, 0.043, ancient_alloy_p, n=12, rows=4, rigid_joint='Spine', slot_hint='torso'))

    pelv_pts = [
        hip_j + up * 0.040,
        hip_j - up * 0.035,
        hip_j - up * 0.105 + bk * 0.015,
    ]
    parts_t.append(mech_tube(gid_t + '_pelvic_core', pelv_pts, 0.078, 0.048, obsidian_mech_p,
                             n=14, rows=6, rigid_joint='Hips', slot_hint='torso', scale_xy=(1.22, 0.90)))

    for sgn, tag in ((-1.0, 'R'), (1.0, 'L')):
        vb_hi = spine_at(core.WAIST + 0.09) + left * (sgn * 0.104) - bk * 0.028
        vb_lo = hip_j + left * (sgn * 0.072) - bk * 0.024 + up * 0.015
        parts_t.append(mech_tube(f'{gid_t}_iliac_valve_{tag}', [vb_hi + up * 0.028, vb_hi - up * 0.038],
                                 0.038, 0.030, ancient_alloy_p, n=8, rows=5, rigid_joint='Spine1', slot_hint='torso'))
        parts_t.extend(piston_assembly(f'{gid_t}_abd_piston_outer_{tag}', vb_hi, vb_lo, 0.014,
                                       obsidian_mech_p, steel_claw_p, 'Spine', slot_hint='torso'))
        p_in_hi = spine_at(core.WAIST + 0.11) + left * (sgn * 0.050) - bk * 0.038
        p_in_lo = hip_j + left * (sgn * 0.036) - bk * 0.032 + up * 0.025
        parts_t.extend(piston_assembly(f'{gid_t}_abd_piston_inner_{tag}', p_in_hi, p_in_lo, 0.013,
                                       ancient_alloy_p, steel_claw_p, 'Spine', slot_hint='torso'))
        loop_pts = _catmull_spline([
            vb_hi + left * (sgn * 0.015),
            spine_at(core.WAIST + 0.01) + left * (sgn * 0.138) + bk * 0.01,
            hip_j + left * (sgn * 0.098) + bk * 0.01 - up * 0.02,
        ], 8)
        parts_t.append(mech_tube(f'{gid_t}_waist_cable_loop_{tag}', loop_pts, 0.0090, 0.0090, obsidian_mech_p,
                                 n=8, rows=8, rigid_joint='Spine', slot_hint='torso'))

    ent_t = assemble_garment(gid_t, "Ancient's Valley Revenant Skeletal Ribcage & Hollow Piston-Spine", 'torso', 'yusar', parts_t,
                             open_torso=True)
    hide_rev_t = select_body_tris(
        ('Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head',
         'LeftShoulder', 'RightShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand'),
        weight_thresh=0.35, mode='mean'
    )
    apply_custom_hide(ent_t, hide_rev_t, replace=True)
    entries.append(ent_t)

    # --- GLOVES: valley_{s}_revenant_talons ---
    gid_g = f'valley_{sex}_revenant_talons'
    parts_g = []

    # 1. LEFT ARM (+x): Open-Frame Ancient Robotic Arm + Angular Forearm Cowling + Twin Long Sweeping Sickle-Hooks!
    sh_l, el_l, wr_l = J('LeftArm'), J('LeftForeArm'), J('LeftHand')
    d_ua_l = (el_l - sh_l) / max(np.linalg.norm(el_l - sh_l), 1e-8)
    d_fa_l = (wr_l - el_l) / max(np.linalg.norm(wr_l - el_l), 1e-8)

    parts_g.append(mech_tube(gid_g + '_humerus_strut_L', [sh_l, el_l], 0.025, 0.023, ancient_alloy_p,
                             n=10, rows=6, rigid_joint='LeftArm', slot_hint='gloves'))
    parts_g.extend(piston_assembly(gid_g + '_humerus_piston_L',
                                   sh_l + d_ua_l * 0.04 - left * 0.026 - bk * 0.015,
                                   el_l - d_ua_l * 0.02 - left * 0.022 - bk * 0.015,
                                   0.012, obsidian_mech_p, steel_claw_p, 'LeftArm', slot_hint='gloves'))
    cable_ua_l = _catmull_spline([
        sh_l - left * 0.032 + bk * 0.015,
        0.5 * (sh_l + el_l) - left * 0.056 + bk * 0.025,
        el_l - left * 0.025 + bk * 0.020,
    ], 8)
    parts_g.append(mech_tube(gid_g + '_humerus_cable_L', cable_ua_l, 0.0080, 0.0080, obsidian_mech_p,
                             n=7, rows=8, rigid_joint='LeftArm', slot_hint='gloves'))

    parts_g.append(mech_tube(gid_g + '_fa_strut_L', [el_l, wr_l], 0.020, 0.017, obsidian_mech_p,
                             n=10, rows=6, rigid_joint='LeftForeArm', slot_hint='gloves'))
    cowling_pts = [
        el_l - d_fa_l * 0.08 + left * 0.038,
        el_l + (wr_l - el_l) * 0.30 + left * 0.050 - bk * 0.010,
        el_l + (wr_l - el_l) * 0.74 + left * 0.042 - bk * 0.008,
        wr_l + left * 0.024,
    ]
    parts_g.append(mech_tube(gid_g + '_fa_ancient_cowling_L', cowling_pts, 0.064, 0.032, ancient_alloy_p,
                             n=10, rows=8, rigid_joint='LeftForeArm', slot_hint='gloves', scale_xy=(0.75, 1.38)))

    servo_1 = wr_l + d_fa_l * 0.048
    servo_2 = wr_l + d_fa_l * 0.125
    parts_g.append(mech_tube(gid_g + '_wrist_link_L', [wr_l - d_fa_l * 0.02, servo_2 + d_fa_l * 0.02],
                             0.020, 0.018, obsidian_mech_p, n=10, rows=5, rigid_joint='LeftHand', slot_hint='gloves'))
    for idx_sv, sv_c in enumerate((servo_1, servo_2)):
        parts_g.append(mech_tube(f'{gid_g}_wrist_drum_L_{idx_sv}', [sv_c - bk * 0.022, sv_c + bk * 0.022],
                                 0.030, 0.028, ancient_alloy_p, n=14, rows=4, rigid_joint='LeftHand', slot_hint='gloves', ref_dir=left))

    # TWIN LARGE SWEEPING CURVED DARK-STEEL SICKLE-HOOK BLADES (matching Image 3!)
    sickle_p = P('obsidian', 0.02, [B('bottom', 0.0, 0.04, 'solid', 'steel')], fabric='metal.iron')
    sk1_pts = [
        servo_2 + d_fa_l * 0.01,
        servo_2 + d_fa_l * 0.105 + left * 0.018,
        servo_2 + d_fa_l * 0.215 - left * 0.055 - bk * 0.012,
        servo_2 + d_fa_l * 0.235 - left * 0.175 - bk * 0.020,
        servo_2 + d_fa_l * 0.145 - left * 0.265 - bk * 0.024,
    ]
    sk2_pts = [
        servo_2 + d_fa_l * 0.035,
        servo_2 + d_fa_l * 0.165 + left * 0.024,
        servo_2 + d_fa_l * 0.285 - left * 0.048 - bk * 0.010,
        servo_2 + d_fa_l * 0.315 - left * 0.165 - bk * 0.018,
        servo_2 + d_fa_l * 0.255 - left * 0.245 - bk * 0.020,
    ]
    parts_g.append(curved_blade(gid_g + '_sickle_upper_L', sk1_pts, 0.040, 0.014,
                                -left * 0.72 - d_fa_l * 0.68, sickle_p, 'LeftHand', rows=14))
    parts_g.append(curved_blade(gid_g + '_sickle_lower_L', sk2_pts, 0.042, 0.014,
                                -left * 0.72 - d_fa_l * 0.68, sickle_p, 'LeftHand', rows=14))

    # 2. RIGHT ARM (-x): Sinewy Dark-Charcoal Synthetic Arm + High-Contrast Steel/Obsidian 5-Claw Hand!
    sh_r, el_r, wr_r = J('RightArm'), J('RightForeArm'), J('RightHand')
    d_ua_r = (el_r - sh_r) / max(np.linalg.norm(el_r - sh_r), 1e-8)
    d_fa_r = (wr_r - el_r) / max(np.linalg.norm(wr_r - el_r), 1e-8)

    parts_g.append(mech_tube(gid_g + '_synth_deltoid_R', [sh_r - d_ua_r * 0.06, sh_r + d_ua_r * 0.44],
                             0.066, 0.054, synth_flesh_p, n=16, rows=6, rigid_joint='RightArm', slot_hint='gloves'))
    parts_g.append(sleeve(gid_g + '_synth_arm_Right', 'Right', synth_flesh_p, f0=0.08, f1=0.96, ease=0.005, flare=-0.004, rows=14, n=20))
    port_r = sh_r - left * 0.058 - bk * 0.015 + up * 0.020
    parts_g.append(mech_tube(gid_g + '_deltoid_port_R', [port_r + left * 0.010, port_r - left * 0.014],
                             0.024, 0.021, obsidian_mech_p, n=12, rows=4, rigid_joint='RightArm', slot_hint='gloves', scale_xy=(0.70, 1.25)))
    bicep_loop = _catmull_spline([
        sh_r + d_ua_r * 0.28 - left * 0.048 + bk * 0.015,
        el_r - d_ua_r * 0.05 - left * 0.078 + bk * 0.024,
        el_r + d_fa_r * 0.25 - left * 0.050 + bk * 0.012,
    ], 8)
    parts_g.append(mech_tube(gid_g + '_bicep_cable_R', bicep_loop, 0.0080, 0.0075, obsidian_mech_p,
                             n=7, rows=8, rigid_joint='RightArm', slot_hint='gloves'))

    idx1, mid1, rng1, pnk1 = J('RightHandIndex1'), J('RightHandMiddle1'), J('RightHandRing1'), J('RightHandPinky1')
    knuck_r = 0.25 * (idx1 + mid1 + rng1 + pnk1)
    parts_g.append(mech_tube(gid_g + '_claw_palm_R', [wr_r - d_fa_r * 0.02, knuck_r], 0.040, 0.046, steel_claw_p,
                             n=14, rows=5, rigid_joint='RightHand', slot_hint='gloves', scale_xy=(1.15, 0.58)))
    for fg, r_b in (('Thumb', 0.0125), ('Index', 0.0112), ('Middle', 0.0118), ('Ring', 0.0108), ('Pinky', 0.0096)):
        p1, p2, p3 = J(f'RightHand{fg}1'), J(f'RightHand{fg}2'), J(f'RightHand{fg}3')
        td = p3 - p2
        f_pts = [p1 - 0.18 * (p2 - p1), p1, p2, p3, p3 + 1.25 * td, p3 + 2.10 * td - bk * 0.010]
        f_rads = [r_b * 1.08, r_b, r_b * 0.96, r_b * 0.88, r_b * 0.58, 0.0020]
        f_joints = ['RightHand', f'RightHand{fg}1', f'RightHand{fg}2', f'RightHand{fg}3', f'RightHand{fg}3', f'RightHand{fg}3']
        angs_f = np.linspace(0, 2 * math.pi, 8, endpoint=False)
        f_rows = []
        for ir, (cp, rd) in enumerate(zip(f_pts, f_rads)):
            sd = f_pts[min(ir + 1, len(f_pts) - 1)] - f_pts[max(ir - 1, 0)]
            tv = sd / max(np.linalg.norm(sd), 1e-8)
            rv = np.array([0.0, 0.0, 1.0]) if abs(tv[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
            uv = np.cross(tv, rv)
            uv /= np.linalg.norm(uv) + 1e-12
            vv = np.cross(tv, uv)
            vv /= np.linalg.norm(vv) + 1e-12
            f_rows.append([cp + (uv * math.cos(an) + vv * math.sin(an)) * rd for an in angs_f])
        pt_f = Part(f'{gid_g}_claw_finger_R_{fg}', np.array(f_rows), True, ['helper-tights'] * len(f_rows), steel_claw_p)
        pt_f.row_joints = f_joints
        pt_f.is_arm = True
        parts_g.append(pt_f)

    ent_g = assemble_garment(gid_g, "Ancient's Valley Revenant Left Sickle-Hooks & Right Steel Claws", 'gloves', 'yusar', parts_g)
    hide_rev_g = select_body_tris(('LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand'),
                                  weight_thresh=0.35, mode='mean')
    apply_custom_hide(ent_g, hide_rev_g, replace=True)
    entries.append(ent_g)

    # --- LEGS: valley_{s}_revenant_cyberlegs (Open-Frame Skeletal Cyber-Legs with Truss Struts!) ---
    gid_l = f'valley_{sex}_revenant_cyberlegs'
    parts_l = []

    for s_leg, sgn_l in (('Left', 1.0), ('Right', -1.0)):
        hip_j, kn_j, ft_j = J(s_leg + 'UpLeg'), J(s_leg + 'Leg'), J(s_leg + 'Foot')
        d_th = (kn_j - hip_j) / max(np.linalg.norm(kn_j - hip_j), 1e-8)
        d_sh = (ft_j - kn_j) / max(np.linalg.norm(ft_j - kn_j), 1e-8)
        out_x = left * sgn_l

        # Hip socket yoke + diagonal inner-thigh hydraulic truss + outer hip cable loop (`s_leg + 'UpLeg'`)
        parts_l.append(mech_tube(f'{gid_l}_hip_ball_{s_leg}', [hip_j + up * 0.045 - out_x * 0.02, hip_j - up * 0.045],
                                 0.040, 0.036, obsidian_mech_p, n=12, rows=5, rigid_joint=s_leg + 'UpLeg', slot_hint='legs'))
        hip_cable = _catmull_spline([
            hip_j + out_x * 0.045 + up * 0.085,
            hip_j + out_x * 0.095 + up * 0.02 - bk * 0.01,
            hip_j + (kn_j - hip_j) * 0.26 + out_x * 0.055,
        ], 8)
        parts_l.append(mech_tube(f'{gid_l}_hip_cable_{s_leg}', hip_cable, 0.0090, 0.0085, obsidian_mech_p,
                                 n=7, rows=8, rigid_joint=s_leg + 'UpLeg', slot_hint='legs'))

        # Primary femur strut + diagonal inner-thigh stabilizer piston (forming an authentic open robotic truss!)
        parts_l.append(mech_tube(f'{gid_l}_femur_strut_{s_leg}', [hip_j, kn_j], 0.026, 0.022, obsidian_mech_p,
                                 n=10, rows=7, rigid_joint=s_leg + 'UpLeg', slot_hint='legs'))
        parts_l.extend(piston_assembly(f'{gid_l}_femur_truss_in_{s_leg}',
                                       hip_j - out_x * 0.048 - up * 0.035,
                                       hip_j + (kn_j - hip_j) * 0.52 - out_x * 0.012 - bk * 0.015,
                                       0.014, ancient_alloy_p, steel_claw_p, s_leg + 'UpLeg', slot_hint='legs'))
        parts_l.extend(piston_assembly(f'{gid_l}_femur_piston_{s_leg}',
                                       hip_j + d_th * 0.10 + out_x * 0.020 + bk * 0.034,
                                       kn_j - d_th * 0.04 + out_x * 0.015 + bk * 0.030,
                                       0.015, ancient_alloy_p, steel_claw_p, s_leg + 'UpLeg', slot_hint='legs'))

        # High-winged outer iliac & front-thigh swept Ancient armor carapace (`-0.12` above hip down to `0.92` at knee!)
        th_pts = [hip_j + (kn_j - hip_j) * f + out_x * 0.018 - bk * 0.014 for f in np.linspace(-0.12, 0.92, 8)]
        th_rx = [0.045, 0.082, 0.092, 0.088, 0.078, 0.065, 0.048, 0.032]
        th_ry = [0.048, 0.086, 0.096, 0.092, 0.082, 0.068, 0.052, 0.036]
        a_lo = 0.25 * math.pi if sgn_l > 0 else -1.35 * math.pi
        a_hi = 1.35 * math.pi if sgn_l > 0 else -0.25 * math.pi
        parts_l.append(arched_shell(f'{gid_l}_thigh_carapace_{s_leg}', th_pts, th_rx, th_ry,
                                    a_lo, a_hi, 0.015, ancient_alloy_p, s_leg + 'UpLeg', cols=9, slot_hint='legs'))

        # Angular mechanical knee hinge & overlapping knee-shield (`s_leg + 'Leg'`)
        parts_l.append(mech_tube(f'{gid_l}_knee_hinge_{s_leg}', [kn_j - out_x * 0.040, kn_j + out_x * 0.040],
                                 0.038, 0.036, obsidian_mech_p, n=12, rows=4, rigid_joint=s_leg + 'Leg', slot_hint='legs', ref_dir=bk))
        parts_l.append(mech_tube(f'{gid_l}_knee_pod_{s_leg}', [kn_j - bk * 0.050 + up * 0.052, kn_j - bk * 0.048 - up * 0.048],
                                 0.042, 0.032, ancient_alloy_p, n=10, rows=5, rigid_joint=s_leg + 'Leg', slot_hint='legs', scale_xy=(0.98, 0.72)))

        # Tibia strut + separate rear Achilles hydraulic rod + sharp blade-like shin carapace!
        parts_l.append(mech_tube(f'{gid_l}_tibia_strut_{s_leg}', [kn_j, ft_j], 0.022, 0.018, obsidian_mech_p,
                                 n=10, rows=7, rigid_joint=s_leg + 'Leg', slot_hint='legs'))
        parts_l.extend(piston_assembly(f'{gid_l}_achilles_rod_{s_leg}',
                                       kn_j + d_sh * 0.10 + bk * 0.054,
                                       ft_j - d_sh * 0.04 + bk * 0.046,
                                       0.012, obsidian_mech_p, steel_claw_p, s_leg + 'Leg', slot_hint='legs'))
        sh_pts = [kn_j + (ft_j - kn_j) * f + out_x * 0.010 - bk * 0.018 for f in np.linspace(0.04, 0.92, 7)]
        sh_rx = [0.038, 0.058, 0.064, 0.056, 0.046, 0.038, 0.028]
        sh_ry = [0.042, 0.064, 0.070, 0.062, 0.052, 0.042, 0.032]
        parts_l.append(arched_shell(f'{gid_l}_shin_blade_{s_leg}', sh_pts, sh_rx, sh_ry,
                                    a_lo, a_hi, 0.013, ancient_alloy_p, s_leg + 'Leg', cols=8, slot_hint='legs'))

    ent_l = assemble_garment(gid_l, "Ancient's Valley Revenant Open-Frame Skeletal Cyber-Legs", 'legs', 'yusar', parts_l, legged=True)
    hide_rev_l = select_body_tris(('LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'Hips'),
                                  weight_thresh=0.32, mode='mean')
    apply_custom_hide(ent_l, hide_rev_l, replace=True)
    entries.append(ent_l)

    # --- FEET: valley_{s}_revenant_cyberfeet (Split-Toe Mechanical Talons) ---
    gid_f = f'valley_{sex}_revenant_cyberfeet'
    parts_f = []

    for s_ft, sgn_f in (('Left', 1.0), ('Right', -1.0)):
        ft_j, toe_j, tip_j, kn_j = J(s_ft + 'Foot'), J(s_ft + 'ToeBase'), J(s_ft + 'ToeBase', 'tail'), J(s_ft + 'Leg')
        out_x = left * sgn_f

        ank_hi = ft_j + (kn_j - ft_j) * 0.18
        parts_f.append(mech_tube(f'{gid_f}_ankle_link_{s_ft}', [ank_hi, ft_j - up * 0.020],
                                 0.028, 0.032, obsidian_mech_p, n=12, rows=5, rigid_joint=s_ft + 'Foot', slot_hint='feet'))
        tars_a = np.array([ft_j[0], ft_j[1] + 0.038, max(0.056, ft_j[2] - 0.006)])
        tars_b = np.array([toe_j[0], toe_j[1] + 0.020, 0.036])
        parts_f.append(mech_tube(f'{gid_f}_tarsal_shell_{s_ft}', [tars_a, tars_b],
                                 0.044, 0.048, ancient_alloy_p, n=10, rows=5, rigid_joint=s_ft + 'Foot', slot_hint='feet',
                                 scale_xy=(1.15, 0.72)))
        heel_a = np.array([ft_j[0], ft_j[1] + 0.025, 0.042])
        heel_b = np.array([ft_j[0], ft_j[1] + 0.082, 0.014])
        parts_f.append(mech_tube(f'{gid_f}_heel_spur_{s_ft}', [heel_a, heel_b],
                                 0.026, 0.018, ancient_alloy_p, n=8, rows=5, rigid_joint=s_ft + 'Foot', slot_hint='feet',
                                 scale_xy=(1.18, 0.68)))

        for k_t, dx_toe in enumerate((-0.030 * sgn_f, 0.032 * sgn_f)):
            t_root = np.array([toe_j[0] + dx_toe * 0.65, toe_j[1] + 0.024, 0.034])
            t_knuck = np.array([toe_j[0] + dx_toe * 1.00, toe_j[1] - 0.026, 0.030])
            t_tip = np.array([tip_j[0] + dx_toe * 1.25, tip_j[1] - 0.048, 0.012])
            parts_f.append(mech_tube(f'{gid_f}_split_talon_{s_ft}_{k_t}', [t_root, t_knuck, t_tip],
                                     0.025, 0.008, ancient_alloy_p, n=8, rows=7, rigid_joint=s_ft + 'ToeBase', slot_hint='feet',
                                     scale_xy=(0.95, 0.75)))
            parts_f.append(mech_tube(f'{gid_f}_talon_joint_{s_ft}_{k_t}', [t_knuck - out_x * 0.014, t_knuck + out_x * 0.014],
                                     0.018, 0.018, obsidian_mech_p, n=10, rows=4, rigid_joint=s_ft + 'ToeBase', slot_hint='feet', ref_dir=up))

    ent_f = assemble_garment(gid_f, "Ancient's Valley Revenant Split-Toe Mechanical Talons", 'feet', 'yusar', parts_f)
    hide_rev_f = select_body_tris(('LeftFoot', 'LeftToe', 'RightFoot', 'RightToe'), weight_thresh=0.25, mode='any')
    y_ank_gl = float(core.RIG.jpos[core.RIG.J['LeftFoot']][1]) + 0.055
    ank_tris = np.nonzero((core.BP_GL[core.BT, 1] < y_ank_gl).all(axis=1))[0]
    apply_custom_hide(ent_f, np.unique(np.concatenate([hide_rev_f, ank_tris])), replace=True)
    ent_f['hide_parts'] = ['Human.toenails']
    entries.append(ent_f)
    return entries


# ===============================================================================================================
# Task Runner & Manifest Output
# ===============================================================================================================
TASKS = [
    (_build_harvester, 'm', 'mpfb_male'),
    (_build_harvester, 'f', 'mpfb_female'),
    (_build_crusher, 'm', 'mpfb_male'),
    (_build_crusher, 'f', 'mpfb_female'),
    (_build_revenant, 'm', 'mpfb_male'),
    (_build_revenant, 'f', 'mpfb_female'),
]


def _run_task(task):
    fn, sex, body_id = task
    return fn(sex, body_id)


def main():
    t0 = time.perf_counter()
    workers = min(6, os.cpu_count() or 4)
    kit_entries = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=workers) as ex:
        for res in ex.map(_run_task, TASKS):
            kit_entries.extend(res)

    social_types = [
        {
            'id': 'valley_thrall_harvester',
            'type': 'important_npc',
            'culture': 'yusar',
            'name': "Ancient's Valley Spliced Harvester Cyber-Thrall",
            'skin': ['#ded7d0', '#cfc6be'],
            'morph': {
                'muscle': [0.35, 0.65],
                'weight': [-0.25, 0.05],
                'height': [0.05, 0.35],
            },
            'outfit': {
                'male': {
                    'head': 'valley_m_harvester_head',
                    'torso': 'valley_m_harvester_rig',
                    'back': 'valley_m_harvester_tank',
                    'gloves': 'valley_m_harvester_claws',
                    'legs': 'valley_m_harvester_trousers',
                    'feet': 'valley_m_harvester_boots',
                },
                'female': {
                    'head': 'valley_f_harvester_head',
                    'torso': 'valley_f_harvester_rig',
                    'back': 'valley_f_harvester_tank',
                    'gloves': 'valley_f_harvester_claws',
                    'legs': 'valley_f_harvester_trousers',
                    'feet': 'valley_f_harvester_boots',
                },
            },
        },
        {
            'id': 'valley_thrall_crusher',
            'type': 'important_npc',
            'culture': 'yusar',
            'name': "Ancient's Valley Asymmetric Crusher Cyber-Brute",
            'scale': [1.10, 1.18],
            'morph': {
                'muscle': [0.85, 1.0],
                'weight': [0.55, 0.85],
                'height': [0.40, 0.80],
                'measure-neck-circ-decr-incr': [0.75, 1.0],
            },
            'outfit': {
                'male': {
                    'head': 'valley_m_crusher_helm',
                    'torso': 'valley_m_crusher_harness',
                    'gloves': 'valley_m_crusher_pincer',
                    'legs': 'valley_m_crusher_trousers',
                    'feet': 'valley_m_crusher_stompers',
                },
                'female': {
                    'head': 'valley_f_crusher_helm',
                    'torso': 'valley_f_crusher_harness',
                    'gloves': 'valley_f_crusher_pincer',
                    'legs': 'valley_f_crusher_trousers',
                    'feet': 'valley_f_crusher_stompers',
                },
            },
        },
        {
            'id': 'valley_thrall_revenant',
            'type': 'important_npc',
            'culture': 'yusar',
            'name': "Ancient's Valley Exhumed True-Heir Necro-Cyber Revenant",
            'morph': {
                'muscle': [0.25, 0.60],
                'weight': [-0.65, -0.35],
                'height': [0.25, 0.65],
            },
            'outfit': {
                'male': {
                    'head': 'valley_m_revenant_skull',
                    'torso': 'valley_m_revenant_chassis',
                    'gloves': 'valley_m_revenant_talons',
                    'legs': 'valley_m_revenant_cyberlegs',
                    'feet': 'valley_m_revenant_cyberfeet',
                },
                'female': {
                    'head': 'valley_f_revenant_skull',
                    'torso': 'valley_f_revenant_chassis',
                    'gloves': 'valley_f_revenant_talons',
                    'legs': 'valley_f_revenant_cyberlegs',
                    'feet': 'valley_f_revenant_cyberfeet',
                },
            },
        },
    ]

    manifest_path = CULTURES_DIR / 'valley_cyber_thralls_manifest.json'
    manifest_data = {
        'culture': 'yusar',
        'kit_entries': kit_entries,
        'social_types': social_types,
    }
    manifest_path.write_text(json.dumps(manifest_data, indent=2) + '\n', encoding='utf-8')
    dt = time.perf_counter() - t0
    print(f'Successfully built {len(kit_entries)} Ancient\'s Valley Cyber-Thrall pieces (male & female) in {dt:.2f}s.')
    print(f'Saved manifest to {manifest_path}')


if __name__ == '__main__':
    main()
