"""The Extraplanar Entities Kit — Wave 3: The Neutrino Phantom (`neutrino_phantom`).

Compiles 10 bespoke procedural extraplanar pieces (`5` `mpfb_male` `ext3_m_neutrino_*` +
`5` `mpfb_female` `ext3_f_neutrino_*`, 100% M+F parity) for the **Neutrino Phantom**:
  - `head`:   `ext3_{s}_neutrino_cherenkov` (Headless Cherenkov Mach-Cone Halo, Weak-Boson Vertex Core & Orbiting Golden Super-Kamiokande PMT Sensor Rings)
  - `torso`:  `ext3_{s}_neutrino_shroud`    (Translucent Flavor-Oscillating Quantum Phase-Body, Deep-Detector Cherenkov Chest Chamber & Floating Rhodium-PMT Hex Lattice)
  - `back`:   `ext3_{s}_neutrino_rings`     (Triple Counter-Rotating v_e / v_mu / v_tau Flavor-Oscillation Gyroscopic Rings, Relativistic Track Spines & Cherenkov Scintillation Plume)
  - `gloves`: `ext3_{s}_neutrino_traces`    (Quantum-Phasing Forearms, Bubble-Chamber Helical Particle Tracks, Rhodium-Gold Cuffs & Cherenkov Phase-Talons)
  - `legs`:   `ext3_{s}_neutrino_wake`      (Legless Cherenkov Ionization-Wake Tail, 5 Helical Decay Streamers & Base Scintillation Emitter)

Paired with custom `neutrino_phase` WebGL & Godot 4 spatial shader mode (`src/75-extraplanar.js` &
`godot/krator/character/kchar_extraplanar.gdshader` `kx_mode = 7`).

Run standalone:
    python -u tools/garments/cultures/extraplanar_neutrino.py
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
from garments.types.limbs import sleeves, full_gloves

# ===============================================================================================================
# Scoped Palette Colors (Linear RGB, `ext3_` prefixed)
# ===============================================================================================================
EXT3_COLORS = {
    'ext3_tank_void':      (0.008, 0.018, 0.052),
    'ext3_abyss_cobalt':   (0.024, 0.075, 0.245),
    'ext3_cherenkov':      (0.140, 0.880, 1.000),
    'ext3_cherenkov_hot':  (0.760, 0.985, 1.000),
    'ext3_muon_blue':      (0.095, 0.340, 0.980),
    'ext3_tau_violet':     (0.560, 0.195, 0.980),
    'ext3_rhodium':        (0.720, 0.765, 0.835),
    'ext3_rhodium_dk':     (0.185, 0.215, 0.275),
    'ext3_pmt_gold':       (0.920, 0.695, 0.215),
    'ext3_pmt_amber':      (1.000, 0.835, 0.380),
}
for _k, _v in EXT3_COLORS.items():
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

EXT3_CUSTOM_MOTIFS = {
    'ext3_detector_hex',
    'ext3_cherenkov_wave',
    'ext3_flavor_disc',
}


def _ext3_custom_motif(style, w, h, fg, bg, aspect=1.0):
    img = np.empty((max(h, 1), max(w, 1), 3), dtype=np.float64)
    img[:] = bg
    yy, xx = np.mgrid[0:max(h, 1), 0:max(w, 1)]
    u = (xx + 0.5) / max(w, 1)
    v = (yy + 0.5) / max(h, 1)

    if style == 'ext3_detector_hex':
        # Super-Kamiokande photomultiplier array & rhodium-lined neutrino detector lattice
        su = (u * 10.0) % 1.0 - 0.5
        sv = (v * 6.0) % 1.0 - 0.5
        rad = np.hypot(su, sv)
        pmt_dome = rad < 0.24
        pmt_rim = (rad >= 0.24) & (rad < 0.33)
        grid = (np.abs(su) > 0.45) | (np.abs(sv) > 0.45)
        border = (v < 0.08) | (v > 0.92)
        img[:] = np.asarray(bg)[None, None, :] * (0.86 + 0.14 * np.cos(u * 20.0))[:, :, None]
        img[grid | border] = C['ext3_rhodium']
        img[pmt_rim] = fg
        img[pmt_dome] = 0.55 * np.asarray(C['ext3_pmt_amber']) + 0.45 * np.asarray(C['ext3_cherenkov'])
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext3_cherenkov_wave':
        # Deep-water Cherenkov interference fringes & relativistic ballistic tracks
        w1 = 0.5 + 0.5 * np.sin(u * 2.0 * math.pi * 6.0 + v * 14.0)
        w2 = 0.5 + 0.5 * np.cos(u * 2.0 * math.pi * 4.0 - v * 19.0)
        interf = w1 * w2
        track = (np.abs(((u * 13.0 + v * 0.4) % 1.0) - 0.5) < 0.028) & (v > 0.08) & (v < 0.92)
        img[:] = (
            np.asarray(bg)[None, None, :] * (0.65 + 0.55 * interf)[:, :, None]
            + np.asarray(fg)[None, None, :] * (0.32 * (interf ** 2.2))[:, :, None]
        )
        img[track] = C['ext3_cherenkov_hot']
        return np.clip(img, 0.0, 1.0)

    elif style == 'ext3_flavor_disc':
        # Neutrino flavor-oscillation plasma ring with brushed rhodium bevels & Cherenkov core track
        track = np.abs(v - 0.50)
        core_glow = track < 0.16
        rhod_bevel = (track >= 0.16) & (track < 0.34)
        beat = 0.70 + 0.30 * np.sin(u * 2.0 * math.pi * 9.0)
        img[:] = np.asarray(bg)[None, None, :] * beat[:, :, None]
        img[rhod_bevel] = C['ext3_rhodium']
        img[core_glow] = fg
        return np.clip(img, 0.0, 1.0)

    return np.clip(img, 0.0, 1.0)


@contextmanager
def neutrino_motif_scope():
    orig_motif = paint_mod.motif

    def _wrapped_motif(style, w, h, fg, bg, aspect=1.0):
        if style in EXT3_CUSTOM_MOTIFS:
            return _ext3_custom_motif(style, w, h, fg, bg, aspect=aspect)
        return orig_motif(style, w, h, fg, bg, aspect=aspect)

    paint_mod.motif = _wrapped_motif
    try:
        yield
    finally:
        paint_mod.motif = orig_motif


# ===============================================================================================================
# Coordinate Conversion, Body Hides & Geometry Helpers
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


def assemble_garment(gid, label, slot, parts, emitters=None, **kw):
    kw.setdefault('allow_floating', True)
    entry = _core_assemble(gid, label, slot, 'extraplanar', parts, **kw)
    entry['culture'] = 'extraplanar'
    if emitters:
        entry.setdefault('vfx', {})['emitters'] = emitters
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


def _mp(bg, fab, motif_name=None, fg=None, rep=None, grain=0.015):
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
    phis = np.linspace(-0.48 * math.pi, 0.48 * math.pi, rows)
    Q = []
    for ph in phis:
        cp, sp = math.cos(ph), math.sin(ph)
        Q.append([
            c + ax_x * (math.cos(a) * cp * rx) + ax_y * (math.sin(a) * cp * ry) + ax_z * (sp * rz)
            for a in angs
        ])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


def torus_ring(name, center, normal_dir, major_r, minor_rx, minor_ry, paint, rigid_joint,
               arc=(0.0, 2.0 * math.pi), n_major=36, n_minor=10, closed_loop=True, vfx=None):
    c = np.asarray(center, dtype=np.float64)
    n_ax = np.asarray(normal_dir, dtype=np.float64)
    n_ax = n_ax / max(float(np.linalg.norm(n_ax)), 1e-8)
    u_ax, v_ax = core.frame(n_ax)
    thetas = np.linspace(arc[0], arc[1], n_major, endpoint=not closed_loop)
    if closed_loop:
        thetas = np.append(thetas, thetas[0])
    phis = np.linspace(0.0, 2.0 * math.pi, n_minor, endpoint=False)
    Q = []
    for idx_t, th in enumerate(thetas):
        r_dir = u_ax * math.cos(th) + v_ax * math.sin(th)
        ring_c = c + r_dir * major_r
        taper = 1.0
        if not closed_loop:
            u_arc = idx_t / max(len(thetas) - 1, 1)
            taper = max(0.12, math.sin(math.pi * u_arc) ** 0.65)
        Q.append([
            ring_c + r_dir * (math.cos(ph) * minor_rx * taper) + n_ax * (math.sin(ph) * minor_ry * taper)
            for ph in phis
        ])
    return _part_raw(name, Q, True, paint, rigid_joint=rigid_joint, vfx=vfx)


# ===============================================================================================================
# THE NEUTRINO PHANTOM (`neutrino_phantom`)
# ===============================================================================================================
def _build_neutrino_phantom(sex):
    entries = []
    rhodium_p  = _mp('ext3_rhodium', 'metal.chrome', grain=0.01)
    rhod_dk_p  = _mp('ext3_rhodium_dk', 'metal.paktong.brushed', 'ext3_detector_hex', 'ext3_pmt_gold')
    pmt_gold_p = _mp('ext3_pmt_gold', 'metal.gold', grain=0.005)
    pmt_eye_p  = _mp('ext3_pmt_amber', 'beads.glass', grain=0.0)
    phase_p    = _mp('ext3_abyss_cobalt', 'cloth.silk', 'ext3_cherenkov_wave', 'ext3_cherenkov', grain=0.005)
    void_p     = _mp('ext3_tank_void', 'patterns/extraplanar/nebula-rift', grain=0.0)
    blaze_p    = _mp('ext3_cherenkov_hot', 'beads.glass', grain=0.0)
    disc_e_p   = _mp('ext3_abyss_cobalt', 'metal.chrome', 'ext3_flavor_disc', 'ext3_cherenkov')
    disc_mu_p  = _mp('ext3_tank_void', 'metal.chrome', 'ext3_flavor_disc', 'ext3_muon_blue')
    disc_tau_p = _mp('ext3_tank_void', 'metal.chrome', 'ext3_flavor_disc', 'ext3_tau_violet')

    a_hd, b_hd, up_h, bk_h, left_h = head_frame()
    fwd = np.array([0.0, -1.0, 0.0])
    up_w = np.array([0.0, 0.0, 1.0])
    left_w = np.array([1.0, 0.0, 0.0])

    neutrino_vfx = {
        'kind': 'neutrino_phase',
        'core_color': '#061538',
        'cherenkov_color': '#38f6ff',
        'muon_color': '#2068ff',
        'tau_color': '#b04cff',
        'opacity': 0.56,
        'power': 2.05,
        'rim_gain': 2.35,
    }

    # -----------------------------------------------------------------------------------------------------------
    # 1. HEAD: ext3_{s}_neutrino_cherenkov
    #    Headless Cherenkov Radiation Shock-Cone Halo, Weak-Boson Singularity & Orbiting Super-K Golden PMT Rings
    # -----------------------------------------------------------------------------------------------------------
    gid_h = f'ext3_{sex}_neutrino_cherenkov'
    parts_h = []

    nk = J('Neck')
    collar_z = float(nk[2]) + 0.004
    parts_h.append(torus_ring(
        gid_h + '_containment_collar', np.array([0.0, 0.004, collar_z]), up_w,
        0.084, 0.019, 0.013, rhod_dk_p, rigid_joint='Neck', n_major=30, n_minor=8
    ))
    # 6 golden Super-Kamiokande photomultiplier domes set around the neck containment ring
    for pi in range(6):
        ang_p = pi * (math.pi / 3.0) + (math.pi / 6.0)
        p_dir = np.array([math.sin(ang_p), -math.cos(ang_p), 0.0])
        pc = np.array([0.0, 0.004, collar_z]) + p_dir * 0.098 + np.array([0.0, 0.0, 0.004])
        parts_h.append(ellipsoid_part(
            f'{gid_h}_collar_pmt_{pi}', pc, (0.011, 0.011, 0.009), pmt_eye_p, 'Neck',
            n=10, rows=6,
            vfx={'kind': 'emissive_blaze', 'color': '#ffd86e', 'gain': 2.10, 'pulse': 0.16}
        ))

    head_c = np.array([0.0, float(a_hd[1]) - 0.004, float(a_hd[2]) + 0.112])
    head_gl = bl_to_gl_pt(head_c)

    # Weak-Boson (Z0) Reaction-Vertex Singularity Core
    kin_core = {'bone': 'Head', 'motion': 'bob', 'speed': 2.20, 'amp': 0.014, 'phase': 0.0, 'center_gl': head_gl}
    parts_h.append(ellipsoid_part(
        gid_h + '_vertex_core', head_c, (0.042, 0.042, 0.042), blaze_p, 'Head',
        n=18, rows=12,
        vfx={'kind': 'emissive_blaze', 'color': '#d8ffff', 'gain': 2.70, 'pulse': 0.24, 'kinetic': kin_core}
    ))
    # 6 crisp relativistic collision-vertex rays shooting out of the Z0 core
    ray_dirs = [
        np.array([ 0.00, -0.92,  0.39]),
        np.array([ 0.85,  0.22,  0.48]),
        np.array([-0.85,  0.22,  0.48]),
        np.array([ 0.56, -0.35, -0.75]),
        np.array([-0.56, -0.35, -0.75]),
        np.array([ 0.00,  0.42,  0.91]),
    ]
    for ri, rd in enumerate(ray_dirs):
        rd = rd / np.linalg.norm(rd)
        parts_h.append(sweep_tube(
            f'{gid_h}_vertex_ray_{ri}', [head_c + rd * 0.022, head_c + rd * 0.118],
            [0.007, 0.0012], blaze_p, n=6, rigid_joint='Head', cap_ends=False,
            vfx={'kind': 'emissive_blaze', 'color': '#78fbff', 'gain': 2.35, 'pulse': 0.20, 'kinetic': kin_core}
        ))

    # Hollow Sculpted Cherenkov 41-degree Mach-Cone Wavefront Crown (double-walled thin phase shell)
    cone_axis = np.array([0.0, 0.34, 0.94])
    cone_axis /= np.linalg.norm(cone_axis)
    cx_u, cx_v = core.frame(cone_axis)
    kin_cone = {
        'bone': 'Head', 'motion': 'orbit', 'speed': 1.35, 'amp': 0.010,
        'precess': 0.07, 'phase': 0.4,
        'center_gl': head_gl, 'axis_gl': bl_to_gl_dir(cone_axis),
    }
    n_c = 32
    angs_c = np.linspace(0.0, 2.0 * math.pi, n_c, endpoint=False)
    # Build closed thin shell around Cherenkov cone frustum (from apex near vertex core out to flared wake rim)
    cone_stations = [
        (-0.045, 0.024),
        ( 0.010, 0.078),
        ( 0.075, 0.142),
        ( 0.135, 0.198),
        ( 0.138, 0.190),
        ( 0.075, 0.134),
        ( 0.010, 0.071),
        (-0.042, 0.020),
    ]
    Q_cone = []
    for s_d, r_c in cone_stations:
        sc = head_c + cone_axis * s_d
        Q_cone.append([
            sc + (cx_u * math.cos(a) + cx_v * math.sin(a)) * (r_c * (1.0 + 0.06 * math.cos(6.0 * a)))
            for a in angs_c
        ])
    cone_vfx = dict(neutrino_vfx, opacity=0.46, rim_gain=2.65, kinetic=kin_cone)
    parts_h.append(_part_raw(gid_h + '_cherenkov_cone', Q_cone, True, phase_p, rigid_joint='Head', vfx=cone_vfx))

    # Two Counter-Rotating Orbiting Golden Super-Kamiokande PMT Sensor Rings around the Singularity
    pmt_ring_specs = [
        ('outer', 0.156, 0.009, 0.007, np.array([ 0.24, -0.88, 0.41]), -1.15, 0.09, 0.8, 10),
        ('inner', 0.108, 0.008, 0.006, np.array([-0.82, -0.34, 0.46]),  1.65, 0.08, 2.1, 6),
    ]
    for rname, maj_r, rx_m, ry_m, n_vec, spd, prec, ph, n_pmt in pmt_ring_specs:
        n_ax = n_vec / np.linalg.norm(n_vec)
        u_ax, v_ax = core.frame(n_ax)
        kin_r = {
            'bone': 'Head', 'motion': 'orbit', 'speed': spd, 'amp': 0.010,
            'precess': prec, 'phase': ph,
            'center_gl': head_gl, 'axis_gl': bl_to_gl_dir(n_ax),
        }
        parts_h.append(torus_ring(
            f'{gid_h}_pmt_ring_{rname}', head_c, n_ax, maj_r, rx_m, ry_m,
            rhodium_p, rigid_joint='Head', n_major=32, n_minor=7,
            vfx={'kind': 'standard', 'kinetic': kin_r}
        ))
        for ei in range(n_pmt):
            ang_e = (ei / float(n_pmt)) * 2.0 * math.pi
            r_dir = u_ax * math.cos(ang_e) + v_ax * math.sin(ang_e)
            ec = head_c + r_dir * maj_r
            parts_h.append(ellipsoid_part(
                f'{gid_h}_pmt_node_{rname}_{ei}', ec, (0.013, 0.013, 0.010), pmt_gold_p, 'Head',
                axes=(r_dir, n_ax, np.cross(r_dir, n_ax)), n=10, rows=6,
                vfx={'kind': 'emissive_blaze', 'color': '#ffd968', 'gain': 2.25, 'pulse': 0.22, 'kinetic': kin_r}
            ))

    head_emitters = [
        {
            'bone': 'Head',
            'offset': [0.0, 0.10, 0.0],
            'count': 26,
            'rate': 0.44,
            'size0': 0.065,
            'size1': 0.210,
            'drift': [0.0, 0.34, -0.08],
            'spread': 0.055,
            'opacity': 0.62,
            'ember_color': '#52f8ff',
            'core_color': '#051332',
            'mist_color': '#2b78c8',
        }
    ]
    ent_h = assemble_garment(
        gid_h, 'Neutrino Phantom Cherenkov Cone & PMT Singularity', 'head', parts_h,
        emitters=head_emitters, covers_hair=True, covers_face=True
    )
    ent_h['hide_parts'] = list(FULL_HEAD_HIDE_PARTS)
    apply_custom_hide(ent_h, select_body_tris(('Head', 'Neck'), weight_thresh=0.20, mode='any'))
    entries.append(ent_h)

    # -----------------------------------------------------------------------------------------------------------
    # 2. TORSO: ext3_{s}_neutrino_shroud
    #    Quantum Flavor-Oscillating Phase-Body, Deep Cherenkov Tank Rift & Floating Rhodium-PMT Lattice
    # -----------------------------------------------------------------------------------------------------------
    gid_t = f'ext3_{sex}_neutrino_shroud'
    parts_t = []

    # Translucent Neutrino-Phase torso phantom (stops cleanly at waist so zero overlap with wake!)
    phase_torso = torso_tube(
        gid_t + '_phase_body', core.TOP + 0.010, core.WAIST - 0.004, ease=0.007,
        paint=phase_p, n=36, rows=14
    )
    tag_vfx(phase_torso, neutrino_vfx, no_conform=True)
    parts_t.append(phase_torso)

    # Translucent Neutrino-Phase upper arms down to elbows
    phase_slv = sleeves(gid_t + '_phase_arms', 'elbow', 0.008, phase_p, ease_end=0.012, rows=9, n=18)
    tag_vfx(phase_slv, neutrino_vfx, no_conform=True)
    parts_t.extend(phase_slv)

    # Deep 3D View-Parallax Cherenkov Detector-Tank Portal recessed in sternum
    tank_c = chest_front(core.CHEST + 0.010, 0.020, x=0.0)
    tank_rift_vfx = {
        'kind': 'nebula_rift',
        'core_color': '#eaffff',
        'arm_color': '#38f6ff',
        'nebula_color': '#1854ff',
        'gold_color': '#ffd25a',
        'void_color': '#010615',
        'center_y': round(float(core.CHEST), 3),
        'galaxy_scale': 3.4,
    }
    parts_t.append(ellipsoid_part(
        gid_t + '_cherenkov_portal', tank_c, (0.082, 0.018, 0.105), void_p, 'Spine2',
        n=20, rows=12, vfx=tank_rift_vfx
    ))
    # Brushed rhodium-and-gold hexagonal detector bezel framing the chest Cherenkov portal
    parts_t.append(torus_ring(
        gid_t + '_portal_bezel', tank_c + np.array([0.0, -0.006, 0.0]), fwd,
        0.094, 0.012, 0.010, rhod_dk_p, rigid_joint='Spine2', n_major=6, n_minor=8
    ))

    # 3 Pairs of Floating Rhodium Magnetic-Containment Ribs arcing outside the phase torso
    rib_zs = [core.CHEST + 0.055, core.CHEST - 0.025, core.WAIST + 0.055]
    for ri_idx, rz in enumerate(rib_zs):
        w_scale = 1.0 - 0.10 * ri_idx
        for sgn, tag in ((1.0, 'L'), (-1.0, 'R')):
            rib_pts = catmull_spline([
                np.array([sgn * 0.098 * w_scale, -0.128 * w_scale, rz + 0.012]),
                np.array([sgn * 0.168 * w_scale, -0.020,           rz]),
                np.array([sgn * 0.115 * w_scale,  0.122 * w_scale, rz - 0.010]),
            ], 10)
            parts_t.append(sweep_tube(
                f'{gid_t}_mag_rib_{ri_idx}_{tag}', rib_pts, [0.009, 0.014, 0.009],
                rhodium_p if ri_idx != 1 else pmt_gold_p, n=8, rigid_joint='Spine2',
                scale_xy=(0.55, 1.35), ref_dir=up_w
            ))
            # Glowing Cherenkov tip-node on anterior end of each containment rib
            parts_t.append(ellipsoid_part(
                f'{gid_t}_rib_node_{ri_idx}_{tag}', rib_pts[0], (0.011, 0.011, 0.011), blaze_p, 'Spine2',
                n=8, rows=6, vfx={'kind': 'emissive_blaze', 'color': '#5cfaff', 'gain': 2.20, 'pulse': 0.22}
            ))

    # Floating Shoulder Wave-Guide Epaulette Arcs
    for sgn, side, tag in ((1.0, 'Left', 'L'), (-1.0, 'Right', 'R')):
        sh = J(side + 'Arm')
        arc_c = sh + np.array([sgn * 0.020, 0.0, 0.032])
        parts_t.append(torus_ring(
            f'{gid_t}_shoulder_arc_{tag}', arc_c, np.array([0.0, 1.0, 0.25 * sgn]),
            0.088, 0.011, 0.007, rhodium_p, rigid_joint='Spine2',
            arc=(-0.25 * math.pi, 1.15 * math.pi), n_major=18, n_minor=7, closed_loop=False
        ))

    ent_t = assemble_garment(gid_t, 'Neutrino Phantom Flavor-Phase Shroud & Detector Lattice', 'torso', parts_t)
    hide_full_body(ent_t)
    entries.append(ent_t)

    # -----------------------------------------------------------------------------------------------------------
    # 3. BACK: ext3_{s}_neutrino_rings
    #    Triple Flavor-Oscillation (v_e / v_mu / v_tau) Gyroscopic Wave-Rings & Relativistic Track Spines
    # -----------------------------------------------------------------------------------------------------------
    gid_b = f'ext3_{sex}_neutrino_rings'
    parts_b = []

    back_c = np.array([0.0, 0.165, core.CHEST + 0.035])
    back_gl = bl_to_gl_pt(back_c)

    # Three Counter-Rotating Neutrino Flavor-Oscillation Gyroscopic Rings (v_e Cyan, v_mu Cobalt, v_tau Violet)
    flavor_rings = [
        ('nu_e',   0.385, 0.015, 0.008, np.array([ 0.22, 0.88,  0.42]),  0.95, 0.10, 0.0, disc_e_p,   '#e8ffff', '#38f6ff', '#1658ff'),
        ('nu_mu',  0.325, 0.014, 0.007, np.array([-0.76, 0.46,  0.46]), -1.30, 0.12, 2.1, disc_mu_p,  '#cfe8ff', '#2878ff', '#5c34ff'),
        ('nu_tau', 0.268, 0.013, 0.007, np.array([ 0.64, 0.52, -0.56]),  1.68, 0.09, 4.2, disc_tau_p, '#f6dcff', '#b452ff', '#38f6ff'),
    ]
    for fname, maj_r, rx_m, ry_m, n_vec, spd, prec, ph, dp, c_in, c_mid, c_out in flavor_rings:
        n_ax = n_vec / np.linalg.norm(n_vec)
        u_ax, v_ax = core.frame(n_ax)
        kin_f = {
            'bone': 'Spine2', 'motion': 'orbit', 'speed': spd, 'amp': 0.016,
            'precess': prec, 'phase': ph,
            'center_gl': back_gl, 'axis_gl': bl_to_gl_dir(n_ax),
        }
        parts_b.append(torus_ring(
            f'{gid_b}_ring_{fname}', back_c, n_ax, maj_r, rx_m, ry_m, dp, rigid_joint='Spine2',
            n_major=42, n_minor=8,
            vfx={
                'kind': 'accretion_disc',
                'inner_color': c_in,
                'mid_color': c_mid,
                'outer_color': c_out,
                'kinetic': kin_f,
            }
        ))
        # 4 Golden PMT Phase-Nodes locked on each flavor ring
        for ni in range(4):
            ang_n = ni * (math.pi / 2.0)
            r_dir = u_ax * math.cos(ang_n) + v_ax * math.sin(ang_n)
            nc = back_c + r_dir * maj_r
            parts_b.append(ellipsoid_part(
                f'{gid_b}_node_{fname}_{ni}', nc, (0.016, 0.016, 0.012), pmt_gold_p, 'Spine2',
                n=10, rows=6,
                vfx={'kind': 'emissive_blaze', 'color': c_mid, 'gain': 2.30, 'pulse': 0.20, 'kinetic': kin_f}
            ))

    # 6 Relativistic Ballistic Vector-Track Spines fanning behind the shoulders
    for sgn, tag in ((1.0, 'L'), (-1.0, 'R')):
        for si, (sp_x, r_z, bk_y) in enumerate(((0.40, 0.44, 0.22), (0.50, 0.08, 0.24), (0.34, -0.34, 0.20))):
            p0 = back_c + np.array([sgn * 0.065, -0.015, 0.02 - 0.04 * si])
            p2 = p0 + np.array([sgn * sp_x, bk_y, r_z])
            p1 = 0.5 * (p0 + p2) + np.array([sgn * 0.03, 0.02, 0.02])
            pts_sp = catmull_spline([p0, p1, p2], 8)
            parts_b.append(sweep_tube(
                f'{gid_b}_track_spine_{tag}_{si}', pts_sp, np.linspace(0.011, 0.002, 8),
                blaze_p, n=6, rigid_joint='Spine2', cap_ends=False,
                vfx={'kind': 'emissive_blaze', 'color': '#64faff' if si != 2 else '#b468ff', 'gain': 2.15, 'pulse': 0.22}
            ))

    back_emitters = [
        {
            'bone': 'Spine2',
            'offset': [0.0, 0.06, -0.14],
            'count': 34,
            'rate': 0.36,
            'size0': 0.095,
            'size1': 0.310,
            'drift': [0.0, 0.48, -0.10],
            'spread': 0.075,
            'opacity': 0.58,
            'ember_color': '#3cf6ff',
            'core_color': '#040e28',
            'mist_color': '#3a62c8',
        }
    ]
    entries.append(assemble_garment(
        gid_b, 'Neutrino Phantom Triple Flavor-Oscillation Rings', 'back', parts_b, emitters=back_emitters
    ))

    # -----------------------------------------------------------------------------------------------------------
    # 4. GLOVES: ext3_{s}_neutrino_traces
    #    Quantum-Phasing Forearms, Bubble-Chamber Helical Particle Tracks & Cherenkov Phase-Talons
    # -----------------------------------------------------------------------------------------------------------
    gid_g = f'ext3_{sex}_neutrino_traces'
    parts_g = []

    glv = full_gloves(gid_g, phase_p, phase_p, phase_p, f0=0.14, ease=0.007)
    tag_vfx(glv, dict(neutrino_vfx, opacity=0.62, rim_gain=2.45), no_conform=True)
    parts_g.extend(glv)

    for sgn, side in ((1.0, 'Left'), (-1.0, 'Right')):
        el, wr = J(side + 'ForeArm'), J(side + 'Hand')
        d_fa = wr - el
        fa_len = max(float(np.linalg.norm(d_fa)), 1e-6)
        fa_u = d_fa / fa_len
        ax1, ax2 = core.frame(fa_u)

        # Rhodium & PMT-Gold containment wrist ring
        parts_g.append(torus_ring(
            f'{gid_g}_wrist_seal_{side}', el + d_fa * 0.78, d_fa,
            0.045, 0.008, 0.006, rhod_dk_p, rigid_joint=side + 'ForeArm', n_major=20, n_minor=6
        ))

        # Twin Helical Bubble-Chamber Particle-Track Spirals coiling cleanly outside the forearm
        for hi in range(2):
            ph0 = hi * math.pi
            h_pts = []
            for ks in range(16):
                us = ks / 15.0
                ang_h = ph0 + sgn * us * 2.4 * math.pi
                rad_h = 0.060 - 0.012 * us
                c_h = el + d_fa * (0.14 + 0.72 * us) + (ax1 * math.cos(ang_h) + ax2 * math.sin(ang_h)) * rad_h
                h_pts.append(c_h)
            parts_g.append(sweep_tube(
                f'{gid_g}_helix_{side}_{hi}', h_pts, np.linspace(0.006, 0.0025, 16),
                blaze_p, n=6, rigid_joint=side + 'ForeArm', cap_ends=False,
                vfx={'kind': 'emissive_blaze', 'color': '#4cf8ff' if hi == 0 else '#a85cff', 'gain': 2.25, 'pulse': 0.25}
            ))

        # Elongated Cherenkov Phase-Talons extending from fingertips
        for fname in ('Index', 'Middle', 'Ring', 'Pinky', 'Thumb'):
            j3 = f'{side}Hand{fname}3'
            j2 = f'{side}Hand{fname}2'
            p2, p3 = J(j2), J(j3)
            f_dir = p3 - p2
            fn = float(np.linalg.norm(f_dir))
            f_dir = f_dir / fn if fn > 1e-6 else fa_u
            claw_pts = [p3 - f_dir * 0.004, p3 + f_dir * 0.022, p3 + f_dir * 0.052]
            parts_g.append(sweep_tube(
                f'{gid_g}_talon_{side}_{fname}', claw_pts, [0.0085, 0.0055, 0.0012],
                blaze_p, n=6, rigid_joint=j3, cap_ends=False,
                vfx={'kind': 'emissive_blaze', 'color': '#6cfbff', 'gain': 2.20, 'pulse': 0.18}
            ))

    ent_g = assemble_garment(gid_g, 'Neutrino Phantom Helical Track Forearms & Phase-Talons', 'gloves', parts_g)
    ent_g['hide_parts'] = ['Human.fingernails']
    entries.append(ent_g)

    # -----------------------------------------------------------------------------------------------------------
    # 5. LEGS: ext3_{s}_neutrino_wake
    #    Legless Cherenkov Ionization-Wake Cone, 5 Helical Bubble-Chamber Streamers & Scintillation Emitter
    # -----------------------------------------------------------------------------------------------------------
    gid_l = f'ext3_{sex}_neutrino_wake'
    parts_l = []

    # Sculpted Rhodium-Gold Magnetic Waist Containment Girdle
    parts_l.append(torus_ring(
        gid_l + '_waist_seal', np.array([0.0, 0.008, core.WAIST + 0.006]), up_w,
        0.162, 0.016, 0.012, rhod_dk_p, rigid_joint='Hips', n_major=32, n_minor=8
    ))

    # Inner Translucent Neutrino-Phase Ionization Core Cone
    rows_w = 20
    zs_w = np.linspace(core.WAIST + 0.004, 0.07, rows_w)
    angs_w = np.linspace(0.0, 2.0 * math.pi, 30, endpoint=False)
    Q_core_wake = []
    Q_outer_wake = []
    for kw_i, zv in enumerate(zs_w):
        uw = kw_i / max(rows_w - 1, 1)
        cx = 0.022 * math.sin(uw * math.pi * 1.6) * uw
        cy = 0.068 * (uw ** 1.30)
        rad_in = (1.0 - uw) ** 0.95 * 0.142 + 0.016
        rad_out = (1.0 - uw) ** 0.85 * 0.165 + 0.026
        Q_core_wake.append([
            [
                cx + math.sin(a) * rad_in * (1.0 + 0.08 * math.cos(6.0 * a - uw * 4.0)),
                cy + math.cos(a) * rad_in * (1.0 + 0.08 * math.cos(6.0 * a - uw * 4.0)),
                zv,
            ]
            for a in angs_w
        ])
        Q_outer_wake.append([
            [
                cx + math.sin(a) * rad_out * (1.0 + 0.12 * math.cos(10.0 * a + uw * 5.0)),
                cy + math.cos(a) * rad_out * (1.0 + 0.12 * math.cos(10.0 * a + uw * 5.0)),
                zv,
            ]
            for a in angs_w
        ])

    parts_l.append(_part_raw(
        gid_l + '_phase_wake', Q_core_wake, True, phase_p, rigid_joint='Hips',
        vfx=dict(neutrino_vfx, opacity=0.52, rim_gain=2.30)
    ))

    wake_erosion_vfx = {
        'kind': 'alpha_erosion',
        'no_push': True,
        'y_top': 0.88,
        'y_bot': 0.06,
        'edge_color': '#3cf6ff',
        'smoke_color': '#071b46',
        'swirl': 1.65,
    }
    parts_l.append(_part_raw(
        gid_l + '_erosion_wake', Q_outer_wake, True, phase_p, rigid_joint='Hips',
        vfx=wake_erosion_vfx
    ))

    # 5 Helical Bubble-Chamber Particle-Decay Streamers coiling down the wake
    streamer_colors = ['#4cfaff', '#2c78ff', '#b458ff', '#4cfaff', '#ffd86e']
    for si in range(5):
        a0 = si * (2.0 * math.pi / 5.0)
        s_pts = []
        for kr in range(16):
            ur = kr / 15.0
            zv = (core.WAIST + 0.002) * (1.0 - ur) + 0.08 * ur
            ang_s = a0 + ur * 2.2
            rad_s = (1.0 - ur) ** 0.80 * 0.192 + 0.048
            cy_s = 0.068 * (ur ** 1.30)
            s_pts.append(np.array([math.sin(ang_s) * rad_s, cy_s + math.cos(ang_s) * rad_s, zv]))
        parts_l.append(sweep_tube(
            f'{gid_l}_decay_track_{si}', s_pts, np.linspace(0.012, 0.002, 16),
            blaze_p, n=6, rigid_joint='Hips', cap_ends=False,
            vfx={'kind': 'emissive_blaze', 'color': streamer_colors[si], 'gain': 2.15, 'pulse': 0.22}
        ))

    wake_emitters = [
        {
            'bone': 'Hips',
            'offset': [0.0, -0.58, -0.05],
            'count': 28,
            'rate': 0.42,
            'size0': 0.085,
            'size1': 0.265,
            'drift': [0.0, 0.36, -0.06],
            'spread': 0.068,
            'opacity': 0.56,
            'ember_color': '#38f6ff',
            'core_color': '#04102c',
            'mist_color': '#2064d8',
        }
    ]
    ent_l = assemble_garment(
        gid_l, 'Neutrino Phantom Cherenkov Ionization-Wake Tail', 'legs', parts_l, emitters=wake_emitters
    )
    hide_full_body(ent_l)
    entries.append(ent_l)

    return entries


def build_neutrino_phantom_kit():
    all_entries = []
    with neutrino_motif_scope():
        for sex, body_id in (('m', 'mpfb_male'), ('f', 'mpfb_female')):
            set_body(body_id)
            b_ents = _build_neutrino_phantom(sex)
            for e in b_ents:
                e['_body'] = body_id
            all_entries.extend(b_ents)
    return all_entries


def main():
    t0 = time.time()
    entries = build_neutrino_phantom_kit()
    outfits = {}
    for sex_key, s in (('male', 'm'), ('female', 'f')):
        outfits[sex_key] = {
            'neutrino_phantom': {
                'head':   f'ext3_{s}_neutrino_cherenkov',
                'torso':  f'ext3_{s}_neutrino_shroud',
                'back':   f'ext3_{s}_neutrino_rings',
                'gloves': f'ext3_{s}_neutrino_traces',
                'legs':   f'ext3_{s}_neutrino_wake',
                'feet':   None,
                'hair':   None,
                'beard':  None,
            }
        }
    items_by_body = {
        'mpfb_male':   [{k: v for k, v in e.items() if k != '_body'} for e in entries if e.get('_body') == 'mpfb_male'],
        'mpfb_female': [{k: v for k, v in e.items() if k != '_body'} for e in entries if e.get('_body') == 'mpfb_female'],
    }
    manifest = {
        'items': items_by_body,
        'tier': ['neutrino_phantom', 0.0667],
        'tier_label': 'Neutrino Phantom (Cherenkov Shock-Cone, PMT Array & Quantum Phase-Wake)',
        'outfits': outfits,
    }
    manifest_path = CULTURES_DIR / 'extraplanar_neutrino_manifest.json'
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    print(
        f'Compiled {len(entries)} Neutrino Phantom pieces '
        f'({len(items_by_body["mpfb_male"])} M + {len(items_by_body["mpfb_female"])} F) '
        f'in {time.time() - t0:.1f}s -> {manifest_path.name}'
    )


if __name__ == '__main__':
    main()
