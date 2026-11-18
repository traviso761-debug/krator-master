"""Digitigrade legs and paws for the Coyote Men (biomes/outlands/PLAN.md section 6, kits/coyote/PLAN.md section 8):
built from the published MakeHuman pieces (base.glb, base.morph.bin) with no Blender, alongside tools/heads.py and
tools/tails.py.

Every normal-size MakeHuman skeleton (mpfb_male, mpfb_female) gets eight joints appended after Tail8 so no existing
joint index moves:
  LeftDigiThigh, LeftDigiShin, LeftDigiHock, LeftDigiPaw,
  RightDigiThigh, RightDigiShin, RightDigiHock, RightDigiPaw
bound at rest in the standing canid Z-pose (stifle forward, calcaneus/hock high and back at ~28.5% of hip height,
slanted metatarsus/pastern, four-toed cushioned paw flat on y = 0). At rest (no clip playing) the bones sit at their
bind rotations and morphed translations, so bone * inverseBind == Identity to < 1e-6; while a clip plays, 50-figure.js
digitigrade() (and kchar_figure.gd _digitigrade()) drives the chain from the clip's human leg tracks with stance hock
compression, push-off extension, swing tuck, ground-level paw roll and two-bone stifle IK.

    python3 tools/digitigrade.py [mpfb_male mpfb_female]
writes pieces/<body>/mod_legs_coyote.glb, .morph.bin and .gshapes.bin, refreshes base.gshapes.bin (skin cover regions),
and updates data/<body>/skeleton.json and kit.json in place (idempotent).
"""
import base64
import json
import math
import os
import struct
import sys

import numpy as np
from scipy.spatial import cKDTree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import glbio as G  # noqa: E402
import heads as HD  # noqa: E402
import make_mpfb as MM  # noqa: E402
import nonhuman as NH  # noqa: E402

SHADE = HD.SHADE
LEG_CELL = 0.0082
PAW_CELL = 0.0032
SIDES = ('Left', 'Right')
PARTS = ('DigiThigh', 'DigiShin', 'DigiHock', 'DigiPaw')
JOINTS = [sd + p for sd in SIDES for p in PARTS]
H_REF = 0.9536


def write_bytes(path, data):
    """Unlink first so a staged hardlink in a worktree never mutates its upstream file."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path):
        os.unlink(path)
    with open(path, 'wb') as f:
        f.write(data)


def sm(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def qinv(q):
    return [-q[0], -q[1], -q[2], q[3]]


def strip(kit, skel):
    """Remove any previously appended Digi* joints, their morph_joints rows, and mod_legs_coyote."""
    J = skel['joints']
    keep = [i for i, j in enumerate(J) if 'Digi' not in j['name']]
    assert keep == list(range(len(keep))), 'Digi joints must sit at the end of skeleton.json'
    gone = set(range(len(keep), len(J)))
    skel['joints'] = J[:len(keep)]
    mj = kit['morph']['morph_joints']
    for t in list(mj):
        mj[t] = [r for r in mj[t] if r[0] not in gone]
        if not mj[t]:
            del mj[t]


def bind_chain(W, byn):
    """Standing canid Z-pose joint world positions for Left and Right from the body's own bind skeleton."""
    out = {}
    for sd in SIDES:
        hip = W[byn[sd + 'UpLeg']][:3, 3].copy()
        ank = W[byn[sd + 'Foot']][:3, 3].copy()
        H = float(hip[1])
        thigh = hip.copy()
        shin = np.array([hip[0] + 0.42 * (ank[0] - hip[0]), 0.575 * H, hip[2] + 0.125 * H])
        hock = np.array([hip[0] + 0.88 * (ank[0] - hip[0]), 0.285 * H, ank[2] - 0.105 * H])
        paw = np.array([ank[0], 0.034 * H, ank[2] + 0.055 * H])
        out[sd] = {'DigiThigh': thigh, 'DigiShin': shin, 'DigiHock': hock, 'DigiPaw': paw, 'hip': hip, 'ank': ank, 'H': H}
    return out


def append_skeleton(skel, W, byn, chains):
    """Append the 8 Digi joints after Tail8 with identity world bind rotation."""
    J = skel['joints']
    hips_i = byn['Hips']
    hips_w = W[hips_i]
    Rh = hips_w[:3, :3] / np.linalg.norm(hips_w[:3, :3], axis=0)
    rh_inv = qinv(J[hips_i]['r'])
    assert J[hips_i]['parent'] < 0, 'Hips must be root'
    for sd in SIDES:
        c = chains[sd]
        prev_p = None
        for k, p in enumerate(PARTS):
            pos = c[p]
            if k == 0:
                t = Rh.T @ (pos - hips_w[:3, 3])
                r = [round(float(x), 6) for x in rh_inv]
                par = hips_i
            else:
                t = pos - prev_p
                r = [0.0, 0.0, 0.0, 1.0]
                par = len(J) - 1
            J.append({'name': sd + p, 'parent': par, 't': [round(float(x), 6) for x in t], 'r': r})
            prev_p = pos


def add_joint_morphs(kit, skel, chains, d_base, sole_vids):
    """Add morph_joints rows for all 8 Digi joints so paws stay on the ground and leg Z-proportions scale cleanly."""
    J = skel['joints']
    byn = {j['name']: i for i, j in enumerate(J)}
    dj, _ = NH.joint_delta_fn(kit, J)
    T = len(kit['morph']['targets'])
    y_sole = np.median(d_base[:, sole_vids, 1], axis=1) if len(sole_vids) else np.zeros(T)
    mj = kit['morph']['morph_joints']
    out = {}
    for sd in SIDES:
        c = chains[sd]
        hip, ank, H = c['hip'], c['ank'], c['H']
        du = dj(sd + 'UpLeg')
        df = dj(sd + 'Foot')
        sy = (du[:, 1] - y_sole) / max(H, 1e-6)
        for p in PARTS:
            pos = c[p]
            if p == 'DigiThigh':
                d = du.copy()
            else:
                uh = float(np.clip((hip[1] - pos[1]) / max(hip[1] - ank[1], 1e-6), 0.0, 1.0))
                base_z = (1.0 - uh) * hip[2] + uh * ank[2]
                dx = (1.0 - uh) * du[:, 0] + uh * df[:, 0]
                dy = y_sole + sy * pos[1]
                dz = (1.0 - uh) * du[:, 2] + uh * df[:, 2] + sy * (pos[2] - base_z)
                d = np.stack([dx, dy, dz], axis=1)
            idx = byn[sd + p]
            out[sd + p] = d
            for t in range(T):
                if np.abs(d[t]).max() > 1e-4:
                    mj.setdefault(str(t), []).append([idx, round(float(d[t, 0]), 5), round(float(d[t, 1]), 5), round(float(d[t, 2]), 5)])
    return out, y_sole


class LegSculpt:
    """SDF + paint for one side's coyote digitigrade leg in glTF bind space."""

    def __init__(self, sd, chain, BP, BT, BN, leg_mask):
        self.sd = sd
        self.sx = 1.0 if sd == 'Left' else -1.0
        self.c = chain
        self.H = chain['H']
        self.s = self.H / H_REF
        s = self.s
        self.p_thigh = chain['DigiThigh']
        self.p_shin = chain['DigiShin']
        self.p_hock = chain['DigiHock']
        self.p_paw = chain['DigiPaw']
        # Cut line at 24% down the human femur (cleanly below the groin cleft, inside shorts/kilts)
        knee_y = 0.542 * self.H
        self.y_cut = self.p_thigh[1] - 0.24 * (self.p_thigh[1] - knee_y)
        self.y_top = self.y_cut + 0.026 * s

        # Base thigh vertices on this side near the collar for exact surface continuity
        side_sel = np.nonzero(leg_mask & (BP[:, 0] * self.sx > 0.004) & (BP[:, 1] > self.y_cut - 0.14 * s) & (BP[:, 1] < self.y_top + 0.06 * s))[0]
        self.collar_P = BP[side_sel]
        self.collar_N = BN[side_sel]
        self.collar_tree = cKDTree(self.collar_P)

        # Anatomical landmarks for canid musculature, hock knob, pastern, and 4-toed oval paw
        self.p_ham_top = self.p_thigh + np.array([-0.008 * self.sx * s, -0.055 * s, -0.048 * s])
        self.p_ham_low = self.p_shin + 0.28 * (self.p_hock - self.p_shin) + np.array([-0.006 * self.sx * s, 0.015 * s, -0.036 * s])
        self.p_calf = self.p_shin + 0.26 * (self.p_hock - self.p_shin) + np.array([0.004 * self.sx * s, 0.0, -0.016 * s])
        self.p_calc = self.p_hock + np.array([0.0, 0.014 * s, -0.026 * s])      # calcaneus / Achilles heel point
        self.p_ach_up = self.p_shin + 0.42 * (self.p_hock - self.p_shin) + np.array([0.0, 0.0, -0.026 * s])
        self.p_dew = self.p_hock + 0.34 * (self.p_paw - self.p_hock) + np.array([-0.024 * self.sx * s, 0.004 * s, -0.004 * s])

        # 4 cushioned toes (digits II..V, middle two longer) + central metacarpal/metatarsal pad
        self.toes = []
        # offsets: (lateral_in_to_out, length, width, height, splay_rad)
        specs = [
            (-0.026, 0.062, 0.0135, 0.0165, -0.13),
            (-0.009, 0.078, 0.0145, 0.0185, -0.04),
            ( 0.009, 0.078, 0.0145, 0.0185,  0.04),
            ( 0.026, 0.060, 0.0135, 0.0160,  0.13),
        ]
        for lat, ln, wd, ht, ang in specs:
            lx = lat * self.sx * s
            ca, sa = math.cos(ang * self.sx), math.sin(ang * self.sx)
            a = np.array([self.p_paw[0] + lx * 0.78, 0.019 * s, self.p_paw[2] + 0.008 * s])
            b = np.array([self.p_paw[0] + lx + sa * ln * s, 0.0125 * s, self.p_paw[2] + 0.008 * s + ca * ln * s])
            self.toes.append((a, b, wd * s, ht * s, ang * self.sx))

        # Grooves between adjacent toes so digits read crisply
        self.clefts = []
        for k in range(3):
            a0, b0, _, _, _ = self.toes[k]
            a1, b1, _, _, _ = self.toes[k + 1]
            cm0 = 0.5 * (a0 + a1) + np.array([0.0, 0.004 * s, 0.014 * s])
            cm1 = 0.5 * (b0 + b1) + np.array([0.0, 0.002 * s, 0.006 * s])
            self.clefts.append((cm0, cm1))

    def sdf(self, P):
        s = self.s
        # 1. Thigh: broad sagittal sweep (femur core + posterior hamstring + quad belly)
        d = HD.round_cone(P, self.p_thigh + np.array([0.0, -0.02 * s, 0.008 * s]), self.p_shin, 0.078 * s, 0.052 * s)
        d_ham = HD.round_cone(P, self.p_ham_top, self.p_ham_low, 0.062 * s, 0.036 * s)
        d = HD.smin(d, d_ham, 0.028 * s)
        # Stifle / patella fullness
        d_stifle = HD.ellipsoid(P, self.p_shin + np.array([0.0, 0.006 * s, 0.010 * s]), (0.046 * s, 0.052 * s, 0.054 * s))
        d = HD.smin(d, d_stifle, 0.020 * s)

        # 2. Crus / gaskin + Achilles tendon + calcaneus hock point
        d_crus = HD.round_cone(P, self.p_shin, self.p_hock, 0.050 * s, 0.027 * s)
        d_gastroc = HD.ellipsoid(P, self.p_calf, (0.044 * s, 0.078 * s, 0.052 * s))
        d_crus = HD.smin(d_crus, d_gastroc, 0.022 * s)
        d_ach = HD.round_cone(P, self.p_ach_up, self.p_calc, 0.020 * s, 0.018 * s)
        d_hock = HD.ellipsoid(P, self.p_calc + np.array([0.0, -0.004 * s, 0.004 * s]), (0.023 * s, 0.028 * s, 0.026 * s))
        d = HD.smin(d, d_crus, 0.022 * s)
        d = HD.smin(d, d_ach, 0.014 * s)
        d = HD.smin(d, d_hock, 0.014 * s)
        # Subtle lateral tarsal hollow ahead of the Achilles tendon for crisp hock definition
        fossa_c = self.p_hock + np.array([0.022 * self.sx * s, 0.048 * s, -0.008 * s])
        fossa_in = self.p_hock + np.array([-0.022 * self.sx * s, 0.048 * s, -0.008 * s])
        d_fossa = np.minimum(
            HD.ellipsoid(P, fossa_c, (0.014 * s, 0.042 * s, 0.014 * s)),
            HD.ellipsoid(P, fossa_in, (0.014 * s, 0.042 * s, 0.014 * s)),
        )
        d = HD.smax(d, -d_fossa - 0.004 * s, 0.010 * s)

        # 3. Lean metatarsus / pastern + small medial dewclaw nub
        d_meta = HD.round_cone(P, self.p_hock, self.p_paw + np.array([0.0, 0.004 * s, 0.004 * s]), 0.027 * s, 0.026 * s)
        d_dew = HD.ellipsoid(P, self.p_dew, (0.009 * s, 0.013 * s, 0.010 * s))
        d_meta = HD.smin(d_meta, d_dew, 0.008 * s)
        d = HD.smin(d, d_meta, 0.016 * s)

        # 4. Cushioned 4-toed canid paw
        d_palm = HD.ellipsoid(P, self.p_paw + np.array([0.0, -0.004 * s, 0.012 * s]), (0.036 * s, 0.024 * s, 0.036 * s))
        d = HD.smin(d, d_palm, 0.016 * s)
        d_toes = np.full(len(P), 1e9)
        for a, b, wd, ht, _ in self.toes:
            # Slightly taller arch than width on each digit
            ab = b - a
            t = np.clip(((P - a) @ ab) / (ab @ ab), 0.0, 1.0)
            q = a + t[:, None] * ab
            dp = P - q
            r_w = wd * (1.05 - 0.18 * t)
            r_h = ht * (1.08 - 0.22 * t)
            dt = (np.sqrt((dp[:, 0] / r_w) ** 2 + (dp[:, 1] / r_h) ** 2 + (dp[:, 2] / r_w) ** 2) - 1.0) * np.minimum(r_w, r_h)
            d_toes = HD.smin(d_toes, dt, 0.006 * s)
        for cm0, cm1 in self.clefts:
            dc = HD.round_cone(P, cm0, cm1, 0.0055 * s, 0.0065 * s)
            d_toes = HD.smax(d_toes, -dc, 0.005 * s)
        d = HD.smin(d, d_toes, 0.012 * s)

        # Flatten plantar sole cleanly onto ground y = 0.000
        d = HD.smax(d, -P[:, 1], 0.0045 * s)

        # 5. Seamless blend into Human.body upper thigh at y_cut .. y_top
        blend = sm(self.y_cut - 0.085 * s, self.y_cut - 0.005 * s, P[:, 1])
        hi = np.nonzero(blend > 1e-4)[0]
        if len(hi):
            _, idx = self.collar_tree.query(P[hi])
            d_base_surf = ((P[hi] - self.collar_P[idx]) * self.collar_N[idx]).sum(1)
            # Tuck the top 1 cm rim 0.6 mm inside Human.body so the termination edge is completely invisible
            rim_tuck = 0.0006 * s * sm(self.y_top - 0.012 * s, self.y_top, P[hi, 1])
            d[hi] = d[hi] * (1.0 - blend[hi]) + (d_base_surf + rim_tuck) * blend[hi]

        # Cap cleanly at y_top
        d = HD.smax(d, P[:, 1] - self.y_top, 0.004 * s)
        return d

    def grad(self, P, eps=2e-4):
        g = np.stack([
            self.sdf(P + np.array([eps, 0.0, 0.0])) - self.sdf(P - np.array([eps, 0.0, 0.0])),
            self.sdf(P + np.array([0.0, eps, 0.0])) - self.sdf(P - np.array([0.0, eps, 0.0])),
            self.sdf(P + np.array([0.0, 0.0, eps])) - self.sdf(P - np.array([0.0, 0.0, eps])),
        ], axis=1)
        return g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12)

    def paint(self, V, N):
        """Vertex colour (COLOR_0) and fur (density, length) matching heads.py COYOTE and tails.py coyote_paint."""
        s = self.s
        n = len(V)
        col = np.full((n, 3), SHADE, dtype=float)
        # Relative coordinates along the leg
        u_y = np.clip((self.y_cut - V[:, 1]) / max(self.y_cut, 1e-6), 0.0, 1.0)
        # Outer (+sx) vs inner (-sx) facing
        outer = np.clip(N[:, 0] * self.sx, 0.0, 1.0)
        inner = np.clip(-N[:, 0] * self.sx, 0.0, 1.0)
        front = np.clip(N[:, 2], 0.0, 1.0)
        back = np.clip(-N[:, 2], 0.0, 1.0)

        # Fade markings in below the collar so V >= y_cut - 0.025*s matches body coat SHADE seamlessly
        below_collar = sm(0.02, 0.14, u_y)

        # Agouti darker saddle/guard shading on outer upper thigh & gaskin
        dark_flank = outer * (1.0 - sm(0.55, 0.80, u_y)) * below_collar
        col *= (1.0 - 0.14 * dark_flank)[:, None]

        # Warm rufous-buff tint on back of hock / lower crus (classic coyote hindleg warmth)
        hock_band = sm(0.45, 0.65, u_y) * (1.0 - sm(0.82, 0.95, u_y)) * (0.4 + 0.6 * back) * below_collar
        col = col * (1.0 - 0.28 * hock_band[:, None]) + np.array([0.78, 0.66, 0.52]) * (0.28 * hock_band[:, None])

        # Pale cream inner thigh, groin edge, front pastern, and tops of toes
        cream_inner = inner * (1.0 - sm(0.55, 0.80, u_y)) * 0.55 * below_collar
        cream_low = sm(0.76, 0.92, u_y) * (0.35 + 0.45 * front) * (1.0 - sm(0.0, 0.35, -N[:, 1])) * below_collar
        cream = np.clip(cream_inner + cream_low, 0.0, 0.65)
        col = col * (1.0 - cream[:, None]) + np.array([0.95, 0.91, 0.83]) * cream[:, None]

        # Fur density & length: bushy breeching on back of thigh, sleeker below hock, bare on plantar paw pads
        dens = np.full(n, 0.96, dtype=float)
        breech = back * (1.0 - sm(0.42, 0.68, u_y))
        ln = (0.78 + 0.22 * breech) * (1.0 - 0.48 * sm(0.52, 0.78, u_y)) * (1.0 - 0.32 * sm(0.84, 0.96, u_y))
        ln = np.clip(ln, 0.24, 1.0)

        # Plantar paw pads: bare dark charcoal-slate cushions on sole
        pad = sm(0.024 * s, 0.008 * s, V[:, 1]) * sm(0.10, 0.55, -N[:, 1])
        col = col * (1.0 - pad[:, None]) + np.array([0.085, 0.080, 0.078]) * pad[:, None]
        dens *= (1.0 - sm(0.15, 0.55, pad))
        ln *= (1.0 - sm(0.15, 0.55, pad))
        return np.clip(col, 0.0, 1.0), dens, ln

    def claws_mesh(self):
        """Four blunt non-retractile dark-horn canid claws at the tips of digits II..V."""
        s = self.s
        V, N, C, T = [], [], [], []
        rings, segs = 7, 10
        for a, b, wd, ht, ang in self.toes:
            ca, sa = math.cos(ang), math.sin(ang)
            fwd = np.array([sa, 0.0, ca])
            side = np.array([ca, 0.0, -sa])
            base_c = np.array([b[0], 0.0105 * s, b[2] - 0.003 * s])
            cl_len = 0.0165 * s
            r0_w, r0_h = 0.0038 * s, 0.0052 * s
            v0 = sum(len(x) for x in V)
            pts, nrms = [], []
            for i in range(rings):
                u = i / (rings - 1)
                # Gentle downward hook, blunt rounded tip, stays >= 2 mm above y = 0
                taper = max(0.14, (1.0 - u) ** 0.72)
                c = base_c + fwd * (u * cl_len) + np.array([0.0, -0.0055 * s * (u ** 1.6), 0.0])
                c[1] = max(c[1], 0.0028 * s + r0_h * taper * 0.5)
                tang = fwd + np.array([0.0, -0.0055 * 1.6 * max(u, 0.05) ** 0.6 / 0.0165, 0.0])
                tang /= np.linalg.norm(tang)
                up = np.cross(tang, side)
                up /= np.linalg.norm(up)
                if up[1] < 0:
                    up = -up
                for j in range(segs):
                    th = 2.0 * math.pi * j / segs
                    d = math.sin(th) * side * (r0_w * taper) + math.cos(th) * up * (r0_h * taper)
                    nrm = math.sin(th) * side / max(r0_w, 1e-6) + math.cos(th) * up / max(r0_h, 1e-6)
                    if i == rings - 1:
                        d *= 0.25
                        nrm = nrm * 0.35 + tang * 0.85
                    nrm /= np.linalg.norm(nrm)
                    pts.append(c + d)
                    nrms.append(nrm)
            tip_i = v0 + len(pts)
            pts.append(base_c + fwd * (cl_len * 1.03) + np.array([0.0, -0.0056 * s, 0.0]))
            pts[-1][1] = max(pts[-1][1], 0.003 * s)
            nrms.append(fwd)
            V.append(np.array(pts))
            N.append(np.array(nrms))
            # Dark horn keratin, slightly lighter warm grey-brown at the nail bed
            u_col = np.array([i / (rings - 1) for i in range(rings) for _ in range(segs)] + [1.0])
            cc = np.outer(1.0 - 0.45 * u_col, np.array([0.11, 0.095, 0.085])) + np.outer(0.45 * u_col, np.array([0.04, 0.038, 0.036]))
            C.append(cc)
            for i in range(rings - 1):
                for j in range(segs):
                    jn = (j + 1) % segs
                    p0 = v0 + i * segs + j
                    p1 = v0 + i * segs + jn
                    q0 = v0 + (i + 1) * segs + j
                    q1 = v0 + (i + 1) * segs + jn
                    T.append([p0, p1, q1])
                    T.append([p0, q1, q0])
            for j in range(segs):
                jn = (j + 1) % segs
                T.append([v0 + (rings - 1) * segs + j, v0 + (rings - 1) * segs + jn, tip_i])
        V = np.concatenate(V, axis=0)
        N = np.concatenate(N, axis=0)
        C = np.concatenate(C, axis=0)
        T = np.array(T, dtype=np.int32)
        fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]])
        flip = (fn * N[T].mean(1)).sum(1) < 0
        T[flip] = T[flip][:, ::-1]
        return V, N, C, T


class LizardLegSculpt:
    """SDF + scale paint + recurved talons for one side's saurian/theropod digitigrade leg (mod_legs_lizard, LORE 6.20)."""

    def __init__(self, sd, chain, BP, BT, BN, leg_mask):
        self.sd = sd
        self.sx = 1.0 if sd == 'Left' else -1.0
        self.c = chain
        self.H = chain['H']
        self.s = self.H / H_REF
        s = self.s
        self.paw_skin_r = 0.135 * s
        self.p_thigh = chain['DigiThigh']
        self.p_shin = chain['DigiShin']
        self.p_hock = chain['DigiHock']
        self.p_paw = chain['DigiPaw']
        knee_y = 0.542 * self.H
        self.y_cut = self.p_thigh[1] - 0.24 * (self.p_thigh[1] - knee_y)
        self.y_top = self.y_cut + 0.026 * s

        side_sel = np.nonzero(leg_mask & (BP[:, 0] * self.sx > 0.004) & (BP[:, 1] > self.y_cut - 0.14 * s) & (BP[:, 1] < self.y_top + 0.06 * s))[0]
        self.collar_P = BP[side_sel]
        self.collar_N = BN[side_sel]
        self.collar_tree = cKDTree(self.collar_P)

        # Powerful reptilian caudofemoralis sweep, monitor gastrocnemius, bony calcaneal heel spur, and sinewy tarso-metatarsus
        self.p_ham_top = self.p_thigh + np.array([-0.008 * self.sx * s, -0.050 * s, -0.058 * s])
        self.p_ham_low = self.p_shin + 0.34 * (self.p_hock - self.p_shin) + np.array([-0.005 * self.sx * s, 0.012 * s, -0.044 * s])
        self.p_calf = self.p_shin + 0.30 * (self.p_hock - self.p_shin) + np.array([0.004 * self.sx * s, 0.0, -0.018 * s])
        self.p_calc = self.p_hock + np.array([0.0, 0.010 * s, -0.036 * s])
        self.p_ach_up = self.p_shin + 0.44 * (self.p_hock - self.p_shin) + np.array([0.0, 0.0, -0.026 * s])

        # Backward-projecting theropod/raptor hallux (Digit I) behind and medial to the tarsal crown
        self.h_a = self.p_paw + np.array([-0.010 * self.sx * s, 0.028 * s, -0.010 * s])
        self.h_b = self.p_paw + np.array([-0.028 * self.sx * s, 0.011 * s, -0.064 * s])

        # Three long, lean, wide-splayed theropod/monitor digits (II, III, IV; zero mammal paw cushion!)
        self.toes = []
        specs = [
            (-0.014, 0.116, 0.0120, 0.0152, -0.64),
            ( 0.000, 0.144, 0.0134, 0.0172,  0.00),
            ( 0.014, 0.112, 0.0118, 0.0148,  0.64),
        ]
        for lat, ln, wd, ht, ang in specs:
            lx = lat * self.sx * s
            ca, sa = math.cos(ang * self.sx), math.sin(ang * self.sx)
            a = np.array([self.p_paw[0] + lx, 0.0170 * s, self.p_paw[2] + 0.004 * s])
            b = np.array([self.p_paw[0] + lx + sa * ln * s, 0.0108 * s, self.p_paw[2] + 0.004 * s + ca * ln * s])
            self.toes.append((a, b, wd * s, ht * s, ang * self.sx))

        # Exact angle-bisector V-clefts at the metatarsal fork so the 3 digits split cleanly without gouging toe shafts
        self.clefts = []
        for k in range(2):
            a0, _, _, _, ang0 = self.toes[k]
            a1, _, _, _, ang1 = self.toes[k + 1]
            mid_ang = 0.5 * (ang0 + ang1)
            dir_v = np.array([math.sin(mid_ang), 0.0, math.cos(mid_ang)])
            base_m = 0.5 * (a0 + a1)
            cm0 = base_m + dir_v * (0.005 * s) + np.array([0.0, -0.001 * s, 0.0])
            cm1 = base_m + dir_v * (0.036 * s) + np.array([0.0, -0.003 * s, 0.0])
            self.clefts.append((cm0, cm1))

    def sdf(self, P):
        s = self.s
        # 1. Thigh + broad reptilian caudofemoralis tail-pull musculature
        d = HD.round_cone(P, self.p_thigh + np.array([0.0, -0.02 * s, 0.008 * s]), self.p_shin, 0.080 * s, 0.053 * s)
        d_ham = HD.round_cone(P, self.p_ham_top, self.p_ham_low, 0.068 * s, 0.038 * s)
        d = HD.smin(d, d_ham, 0.030 * s)
        d_stifle = HD.ellipsoid(P, self.p_shin + np.array([0.0, 0.005 * s, 0.012 * s]), (0.046 * s, 0.050 * s, 0.055 * s))
        d = HD.smin(d, d_stifle, 0.018 * s)

        # 2. Crus + sharp angular calcaneal hock spur
        d_crus = HD.round_cone(P, self.p_shin, self.p_hock, 0.051 * s, 0.025 * s)
        d_gastroc = HD.ellipsoid(P, self.p_calf, (0.045 * s, 0.076 * s, 0.052 * s))
        d_crus = HD.smin(d_crus, d_gastroc, 0.020 * s)
        d_ach = HD.round_cone(P, self.p_ach_up, self.p_calc, 0.019 * s, 0.016 * s)
        d_hock = HD.ellipsoid(P, self.p_calc + np.array([0.0, -0.002 * s, -0.002 * s]), (0.021 * s, 0.025 * s, 0.028 * s))
        d = HD.smin(d, d_crus, 0.020 * s)
        d = HD.smin(d, d_ach, 0.012 * s)
        d = HD.smin(d, d_hock, 0.012 * s)

        # 3. Lean, sinewy reptilian tarso-metatarsus + compact bony knuckle fork + rear hallux (Digit I)
        d_meta = HD.round_cone(P, self.p_hock, self.p_paw + np.array([0.0, -0.002 * s, 0.002 * s]), 0.0235 * s, 0.0185 * s)
        d_fork = HD.ellipsoid(P, self.p_paw + np.array([0.0, -0.006 * s, 0.003 * s]), (0.021 * s, 0.0155 * s, 0.019 * s))
        d_meta = HD.smin(d_meta, d_fork, 0.008 * s)
        # Rear hallux with phalangeal swell
        hab = self.h_b - self.h_a
        ht_u = np.clip(((P - self.h_a) @ hab) / max(float(hab @ hab), 1e-12), 0.0, 1.0)
        hq = self.h_a + ht_u[:, None] * hab
        hr = (0.0110 * (1.0 - 0.24 * ht_u) * (1.0 + 0.12 * np.cos(2.0 * math.pi * 1.5 * ht_u))) * s
        d_hal = np.linalg.norm(P - hq, axis=1) - hr
        d_meta = HD.smin(d_meta, d_hal, 0.0065 * s)
        d = HD.smin(d, d_meta, 0.013 * s)

        # Transverse anterior tarsal scutes + posterior keeled tarsal ridge
        ant_band = sm(0.025 * s, 0.06 * s, P[:, 1]) * (1.0 - sm(0.36 * s, 0.46 * s, P[:, 1])) * sm(-0.005 * s, 0.022 * s, P[:, 2] - self.p_hock[2])
        d -= 0.0012 * s * ant_band * np.cos(P[:, 1] * (210.0 / max(s, 1e-4)))

        # 4. Three long, splayed, individually articulated theropod toes with dorsal scute ridges
        d_toes = np.full(len(P), 1e9)
        for a, b, wd, ht, _ in self.toes:
            ab = b - a
            L2 = float(ab @ ab)
            t = np.clip(((P - a) @ ab) / max(L2, 1e-12), 0.0, 1.0)
            q = a + t[:, None] * ab
            dp = P - q
            # Three distinct phalangeal knuckle swells + slight ungual bulb at tip
            knuckle = 1.0 + 0.15 * np.cos(2.0 * math.pi * 3.0 * t) + 0.09 * np.exp(-(((t - 0.94) / 0.08) ** 2))
            taper = 1.05 - 0.28 * t
            r_w = wd * taper * knuckle
            r_h = ht * taper * knuckle
            dt = (np.sqrt((dp[:, 0] / r_w) ** 2 + (dp[:, 1] / r_h) ** 2 + (dp[:, 2] / r_w) ** 2) - 1.0) * np.minimum(r_w, r_h)
            # Dorsal transverse scute armor plates along the top of each toe
            top_m = np.clip(dp[:, 1] / np.maximum(r_h, 1e-6), 0.0, 1.0) * sm(0.05, 0.18, t) * (1.0 - sm(0.88, 0.98, t))
            dt -= 0.0012 * s * top_m * np.cos(2.0 * math.pi * 7.5 * t)
            d_toes = HD.smin(d_toes, dt, 0.0035 * s)
        for cm0, cm1 in self.clefts:
            dc = HD.round_cone(P, cm0, cm1, 0.0048 * s, 0.0068 * s)
            d_toes = HD.smax(d_toes, -dc, 0.003 * s)
        d = HD.smin(d, d_toes, 0.007 * s)

        # Flatten plantar sole cleanly onto ground y = 0.000
        d = HD.smax(d, -P[:, 1], 0.0035 * s)

        # 5. Seamless blend into Human.body upper thigh at y_cut .. y_top
        blend = sm(self.y_cut - 0.085 * s, self.y_cut - 0.005 * s, P[:, 1])
        hi = np.nonzero(blend > 1e-4)[0]
        if len(hi):
            _, idx = self.collar_tree.query(P[hi])
            d_base_surf = ((P[hi] - self.collar_P[idx]) * self.collar_N[idx]).sum(1)
            rim_tuck = (-0.0005 + 0.0018 * sm(self.y_cut + 0.002 * s, self.y_top - 0.006 * s, P[hi, 1])) * s
            d[hi] = d[hi] * (1.0 - blend[hi]) + (d_base_surf + rim_tuck) * blend[hi]

        d = HD.smax(d, P[:, 1] - self.y_top, 0.004 * s)
        return d

    def paint(self, V, N):
        """Reptile COLOR_0 shade (1.0 at collar so Human.body + skin_detail matches seamlessly; monitor mottle & dark dorsal toe scutes below)."""
        s = self.s
        n = len(V)
        col = np.ones((n, 3), dtype=float)
        u_y = np.clip((self.y_cut - V[:, 1]) / max(self.y_cut, 1e-6), 0.0, 1.0)
        below_collar = sm(0.02, 0.16, u_y)

        outer = np.clip(N[:, 0] * self.sx, 0.0, 1.0)
        inner = np.clip(-N[:, 0] * self.sx, 0.0, 1.0)
        front = np.clip(N[:, 2], 0.0, 1.0)
        back = np.clip(-N[:, 2], 0.0, 1.0)
        up_n = np.clip(N[:, 1], 0.0, 1.0)

        # Monitor-lizard dorsal/lateral mottle
        vx, vy, vz = V[:, 0] / max(s, 1e-4), V[:, 1] / max(s, 1e-4), V[:, 2] / max(s, 1e-4)
        mottle = np.sin(vx * 52.0 + vy * 37.0) * np.cos(vz * 47.0 - vy * 29.0)
        dark = (0.11 * outer + 0.06 * back + 0.08 * np.clip(mottle, 0.0, 1.0)) * below_collar
        col *= (1.0 - dark)[:, None]

        # Darker armoured dorsal scutes along top of toes & anterior ankle, paler inner/ventral scales
        toe_scute = sm(0.86, 0.96, u_y) * up_n * below_collar
        col = col * (1.0 - 0.22 * toe_scute[:, None]) + np.array([0.66, 0.68, 0.52]) * (0.22 * toe_scute[:, None])

        pale = (0.10 * inner * (1.0 - sm(0.55, 0.80, u_y)) + 0.08 * front * sm(0.48, 0.78, u_y)) * below_collar
        col = col * (1.0 - pale[:, None]) + np.array([1.15, 1.13, 0.96]) * pale[:, None]

        # Tough leathery plantar digital pads
        pad = sm(0.018 * s, 0.005 * s, V[:, 1]) * sm(0.10, 0.55, -N[:, 1]) * below_collar
        col = col * (1.0 - pad[:, None]) + np.array([0.58, 0.56, 0.48]) * pad[:, None]
        zeros = np.zeros(n, dtype=float)
        return np.clip(col, 0.0, 1.25), zeros, zeros

    def claws_mesh(self):
        """Large, laterally compressed, sickle-curved theropod/monitor talons on digits II..IV + rear hallux I."""
        s = self.s
        V, N, C, T = [], [], [], []
        rings, segs = 10, 10
        talons = []
        lengths = [0.038 * s, 0.046 * s, 0.036 * s]
        heights = [0.0082 * s, 0.0096 * s, 0.0080 * s]
        widths = [0.0042 * s, 0.0048 * s, 0.0040 * s]
        for k, (a, b, wd, ht, ang) in enumerate(self.toes):
            ca, sa = math.cos(ang), math.sin(ang)
            fwd = np.array([sa, 0.0, ca])
            side = np.array([ca, 0.0, -sa])
            talons.append((np.array([b[0] - sa * 0.004 * s, 0.0135 * s, b[2] - ca * 0.004 * s]), fwd, side, lengths[k], widths[k], heights[k], 0.0125 * s))
        # Rear hallux talon curving backward and down
        hd = self.h_b - self.h_a
        hd_h = np.array([hd[0], 0.0, hd[2]])
        hd_h /= max(np.linalg.norm(hd_h), 1e-6)
        h_side = np.array([-hd_h[2], 0.0, hd_h[0]])
        talons.append((self.h_b + np.array([0.0, 0.001 * s, 0.0]), hd_h, h_side, 0.025 * s, 0.0034 * s, 0.0064 * s, 0.0095 * s))

        for base_c, fwd, side, cl_len, r0_w, r0_h, drop in talons:
            v0 = sum(len(x) for x in V)
            pts, nrms = [], []
            for i in range(rings):
                u = i / (rings - 1)
                taper = max(0.06, (1.0 - u) ** 0.88)
                # Arch slightly up out of the ungual sheath, then hook sharply downward like a raptor/monitor talon
                arch_y = 0.0042 * s * math.sin(math.pi * u) - drop * (u ** 1.85)
                c = base_c + fwd * (u * cl_len) + np.array([0.0, arch_y, 0.0])
                c[1] = max(c[1], 0.0022 * s + r0_h * taper * 0.45)
                dy_du = 0.0042 * s * math.pi * math.cos(math.pi * u) - drop * 1.85 * (max(u, 0.04) ** 0.85)
                tang = fwd * cl_len + np.array([0.0, dy_du, 0.0])
                tang /= np.linalg.norm(tang)
                up = np.cross(tang, side)
                up /= np.linalg.norm(up)
                if up[1] < 0:
                    up = -up
                for j in range(segs):
                    th = 2.0 * math.pi * j / segs
                    d = math.sin(th) * side * (r0_w * taper) + math.cos(th) * up * (r0_h * taper)
                    nrm = math.sin(th) * side / max(r0_w, 1e-6) + math.cos(th) * up / max(r0_h, 1e-6)
                    if i == rings - 1:
                        d *= 0.14
                        nrm = nrm * 0.20 + tang * 0.92
                    nrm /= np.linalg.norm(nrm)
                    pts.append(c + d)
                    nrms.append(nrm)
            tip_i = v0 + len(pts)
            pts.append(base_c + fwd * (cl_len * 1.04) + np.array([0.0, -drop * 1.02, 0.0]))
            pts[-1][1] = max(pts[-1][1], 0.0020 * s)
            nrms.append(fwd)
            V.append(np.array(pts))
            N.append(np.array(nrms))
            # Warm bone-keratin sheath base grading to dark horn tip so talons read clearly at distance
            u_col = np.array([i / (rings - 1) for i in range(rings) for _ in range(segs)] + [1.0])
            cc = np.outer(1.0 - 0.84 * (u_col ** 0.85), np.array([0.44, 0.39, 0.27])) + np.outer(0.84 * (u_col ** 0.85), np.array([0.06, 0.052, 0.042]))
            C.append(cc)
            for i in range(rings - 1):
                for j in range(segs):
                    jn = (j + 1) % segs
                    p0 = v0 + i * segs + j
                    p1 = v0 + i * segs + jn
                    q0 = v0 + (i + 1) * segs + j
                    q1 = v0 + (i + 1) * segs + jn
                    T.append([p0, p1, q1])
                    T.append([p0, q1, q0])
            for j in range(segs):
                jn = (j + 1) % segs
                T.append([v0 + (rings - 1) * segs + j, v0 + (rings - 1) * segs + jn, tip_i])
        V = np.concatenate(V, axis=0)
        N = np.concatenate(N, axis=0)
        C = np.concatenate(C, axis=0)
        T = np.array(T, dtype=np.int32)
        fn = np.cross(V[T[:, 1]] - V[T[:, 0]], V[T[:, 2]] - V[T[:, 0]])
        flip = (fn * N[T].mean(1)).sum(1) < 0
        T[flip] = T[flip][:, ::-1]
        return V, N, C, T


class FrogLegSculpt:
    """SDF + poison-dart pattern fields + webbed four-toed amphibian foot with bulbous digital pads (mod_legs_frog, LORE 6.22)."""

    def __init__(self, sd, chain, BP, BT, BN, leg_mask):
        self.sd = sd
        self.sx = 1.0 if sd == 'Left' else -1.0
        self.c = chain
        self.H = chain['H']
        self.s = self.H / H_REF
        s = self.s
        self.paw_skin_r = 0.145 * s
        self.p_thigh = chain['DigiThigh']
        self.p_shin = chain['DigiShin']
        self.p_hock = chain['DigiHock']
        self.p_paw = chain['DigiPaw']
        knee_y = 0.542 * self.H
        self.y_cut = self.p_thigh[1] - 0.24 * (self.p_thigh[1] - knee_y)
        self.y_top = self.y_cut + 0.026 * s

        side_sel = np.nonzero(leg_mask & (BP[:, 0] * self.sx > 0.004) & (BP[:, 1] > self.y_cut - 0.14 * s) & (BP[:, 1] < self.y_top + 0.06 * s))[0]
        self.collar_P = BP[side_sel]
        self.collar_N = BN[side_sel]
        self.collar_tree = cKDTree(self.collar_P)

        # Powerful jumping cruralis/semimembranosus thigh, plump gastrocnemius calf belly, and smooth elongated frog tarsus
        self.p_ham_top = self.p_thigh + np.array([-0.006 * self.sx * s, -0.048 * s, -0.056 * s])
        self.p_ham_low = self.p_shin + 0.30 * (self.p_hock - self.p_shin) + np.array([-0.004 * self.sx * s, 0.014 * s, -0.040 * s])
        self.p_calf = self.p_shin + 0.34 * (self.p_hock - self.p_shin) + np.array([0.005 * self.sx * s, 0.004 * s, -0.022 * s])
        self.p_calc = self.p_hock + np.array([0.0, 0.006 * s, -0.022 * s])
        self.p_ach_up = self.p_shin + 0.48 * (self.p_hock - self.p_shin) + np.array([0.0, 0.0, -0.020 * s])

        # Four asymmetrically graded amphibian toes (medial shortest -> 3rd longest -> lateral medium) fanned wide across ~80 deg,
        # each ending in a broad, cushioned tree-frog / bullfrog digital suction pad (zero claws!)
        self.toes = []
        specs = [
            (-0.015, 0.088, 0.0082, 0.0092, -0.74, (0.0126, 0.0078, 0.0138)),
            (-0.005, 0.122, 0.0088, 0.0098, -0.24, (0.0142, 0.0084, 0.0154)),
            ( 0.006, 0.152, 0.0094, 0.0105,  0.20, (0.0154, 0.0090, 0.0168)),
            ( 0.016, 0.118, 0.0086, 0.0096,  0.66, (0.0138, 0.0082, 0.0150)),
        ]
        for lat, ln, wd, ht, ang, pad_r in specs:
            lx = lat * self.sx * s
            ca, sa = math.cos(ang * self.sx), math.sin(ang * self.sx)
            a = np.array([self.p_paw[0] + lx, 0.0145 * s, self.p_paw[2] + 0.004 * s])
            b = np.array([self.p_paw[0] + lx + sa * ln * s, 0.0088 * s, self.p_paw[2] + 0.004 * s + ca * ln * s])
            fwd = np.array([sa, 0.0, ca])
            side = np.array([ca, 0.0, -sa])
            pr = tuple(x * s for x in pad_r)
            self.toes.append((a, b, wd * s, ht * s, fwd, side, pr))

        # Three taut scalloped interdigital web panels spanning 78% of each adjacent toe pair, stopping behind the bulbous pads
        self.webs = []
        for k in range(3):
            a0, b0, _, _, _, _, _ = self.toes[k]
            a1, b1, _, _, _, _, _ = self.toes[k + 1]
            o_xz = 0.5 * (a0[[0, 2]] + a1[[0, 2]])
            u_vec = (a0[[0, 2]] + 0.78 * (b0[[0, 2]] - a0[[0, 2]])) - o_xz
            v_vec = (a1[[0, 2]] + 0.78 * (b1[[0, 2]] - a1[[0, 2]])) - o_xz
            det = float(u_vec[0] * v_vec[1] - u_vec[1] * v_vec[0])
            if abs(det) < 1e-9:
                det = 1e-9 if det >= 0 else -1e-9
            self.webs.append((o_xz, u_vec, v_vec, det))

    def sdf(self, P):
        s = self.s
        # 1. Rounded powerful jumper thigh (cruralis + semimembranosus)
        d = HD.round_cone(P, self.p_thigh + np.array([0.0, -0.02 * s, 0.010 * s]), self.p_shin, 0.085 * s, 0.052 * s)
        d_ham = HD.round_cone(P, self.p_ham_top, self.p_ham_low, 0.072 * s, 0.036 * s)
        d = HD.smin(d, d_ham, 0.034 * s)
        d_stifle = HD.ellipsoid(P, self.p_shin + np.array([0.0, 0.004 * s, 0.012 * s]), (0.046 * s, 0.048 * s, 0.054 * s))
        d = HD.smin(d, d_stifle, 0.020 * s)

        # 2. Plump gastrocnemius calf belly tapering to a smooth amphibian ankle
        d_crus = HD.round_cone(P, self.p_shin, self.p_hock, 0.050 * s, 0.022 * s)
        d_gastroc = HD.ellipsoid(P, self.p_calf, (0.049 * s, 0.080 * s, 0.055 * s))
        d_crus = HD.smin(d_crus, d_gastroc, 0.024 * s)
        d_ach = HD.round_cone(P, self.p_ach_up, self.p_calc, 0.018 * s, 0.015 * s)
        d_hock = HD.ellipsoid(P, self.p_calc, (0.020 * s, 0.022 * s, 0.023 * s))
        d = HD.smin(d, d_crus, 0.022 * s)
        d = HD.smin(d, d_ach, 0.014 * s)
        d = HD.smin(d, d_hock, 0.014 * s)

        # 3. Slender elongated astragalus-calcaneum tarsus flattening into the plantar fan
        d_meta = HD.round_cone(P, self.p_hock, self.p_paw + np.array([0.0, -0.006 * s, 0.005 * s]), 0.0215 * s, 0.0165 * s)
        d_tars = HD.ellipsoid(P, self.p_paw + np.array([0.0, -0.012 * s, 0.014 * s]), (0.023 * s, 0.0125 * s, 0.024 * s))
        d_meta = HD.smin(d_meta, d_tars, 0.010 * s)
        d = HD.smin(d, d_meta, 0.014 * s)

        # 4. Four slender smooth digits + bulbous discoidal frog toe pads + taut scalloped webbing membranes
        d_foot = np.full(len(P), 1e9)
        for a, b, wd, ht, fwd, side, pr in self.toes:
            ab = b - a
            L2 = float(ab @ ab)
            t = np.clip(((P - a) @ ab) / max(L2, 1e-12), 0.0, 1.0)
            q = a + t[:, None] * ab
            dp = P - q
            knuckle = 1.0 + 0.08 * np.cos(2.0 * math.pi * 2.5 * t)
            taper = 1.04 - 0.30 * t
            r_w = wd * taper * knuckle
            r_h = ht * taper * knuckle
            dt = (np.sqrt((dp[:, 0] / r_w) ** 2 + (dp[:, 1] / r_h) ** 2 + (dp[:, 2] / r_w) ** 2) - 1.0) * np.minimum(r_w, r_h)
            # Bulbous adhesive tree-frog / bullfrog toe pad oriented along the toe's forward/transverse frame
            pc = b + fwd * (0.003 * s) + np.array([0.0, -0.0012 * s, 0.0])
            qp = P - pc
            px = (qp @ side) / pr[0]
            py = qp[:, 1] / pr[1]
            pz = (qp @ fwd) / pr[2]
            k0 = np.sqrt(px * px + py * py + pz * pz)
            k1 = np.sqrt((px / pr[0]) ** 2 + (py / pr[1]) ** 2 + (pz / pr[2]) ** 2)
            d_pad = k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)
            dt = HD.smin(dt, d_pad, 0.0045 * s)
            d_foot = HD.smin(d_foot, dt, 0.0035 * s)

        for o_xz, u_vec, v_vec, det in self.webs:
            qx = P[:, 0] - o_xz[0]
            qz = P[:, 2] - o_xz[1]
            u = (qx * v_vec[1] - qz * v_vec[0]) / det
            v = (u_vec[0] * qz - u_vec[1] * qx) / det
            uc = np.maximum(u, 0.0)
            vc = np.maximum(v, 0.0)
            r_sum = uc + vc
            s_mid = 4.0 * uc * vc / np.maximum(r_sum * r_sum, 1e-8)
            r_lim = 1.0 - 0.25 * s_mid
            sc_uv = np.minimum(1.0, r_lim / np.maximum(r_sum, 1e-8))
            uc *= sc_uv
            vc *= sc_uv
            rc = uc + vc
            wx = o_xz[0] + uc * u_vec[0] + vc * v_vec[0]
            wz = o_xz[1] + uc * u_vec[1] + vc * v_vec[1]
            wy = (0.0125 - 0.0055 * rc - 0.0018 * s_mid) * s
            rim = sm(r_lim - 0.14, r_lim, rc) * s_mid
            w_th = (0.0029 + 0.0008 * rim) * s
            dw = np.sqrt((P[:, 0] - wx) ** 2 + (P[:, 1] - wy) ** 2 + (P[:, 2] - wz) ** 2) - w_th
            d_foot = HD.smin(d_foot, dw, 0.0038 * s)

        d = HD.smin(d, d_foot, 0.0075 * s)

        # Flatten plantar sole & toe pads cleanly onto ground y = 0.000
        d = HD.smax(d, -P[:, 1], 0.0032 * s)

        # 5. Seamless blend into Human.body upper thigh at y_cut .. y_top
        blend = sm(self.y_cut - 0.085 * s, self.y_cut - 0.005 * s, P[:, 1])
        hi = np.nonzero(blend > 1e-4)[0]
        if len(hi):
            _, idx = self.collar_tree.query(P[hi])
            d_base_surf = ((P[hi] - self.collar_P[idx]) * self.collar_N[idx]).sum(1)
            rim_tuck = (-0.0005 + 0.0018 * sm(self.y_cut + 0.002 * s, self.y_top - 0.006 * s, P[hi, 1])) * s
            d[hi] = d[hi] * (1.0 - blend[hi]) + (d_base_surf + rim_tuck) * blend[hi]

        d = HD.smax(d, P[:, 1] - self.y_top, 0.004 * s)
        return d

    def paint_frog(self, V, N, nb):
        """Evaluate amphibian.pattern_fields(V) in body space (matching Human.body's body_mask across the collar seam),
        plus pale cream share (A) on inner thigh, webbing & plantar toe pads, and fine shade (UV2.x)."""
        import amphibian as AM
        import reptile as RP
        s = self.s
        n = len(V)
        pf = AM.pattern_fields(V)
        u_y = np.clip((self.y_cut - V[:, 1]) / max(self.y_cut, 1e-6), 0.0, 1.0)
        below_collar = sm(0.03, 0.18, u_y)

        inner = np.clip(-N[:, 0] * self.sx, 0.0, 1.0)
        down = np.clip(-N[:, 1], 0.0, 1.0)
        pale = 0.32 * inner * (1.0 - sm(0.58, 0.85, u_y)) * below_collar
        # Creamy pale plantar surface & bulbous toe pads + translucent-toned interdigital webs
        sole_pale = sm(0.016 * s, 0.004 * s, V[:, 1]) * sm(0.05, 0.55, down)
        pale = np.maximum(pale, 0.78 * sole_pale * below_collar)
        for _, b, _, _, fwd, _, pr in self.toes:
            pc = b + fwd * (0.003 * s)
            dp_n = np.linalg.norm((V - pc) / (max(pr) * 1.35), axis=1)
            pad_m = (1.0 - sm(0.65, 1.25, dp_n)) * (0.45 + 0.55 * down)
            pale = np.maximum(pale, 0.68 * pad_m * below_collar)
        for o_xz, u_vec, v_vec, det in self.webs:
            qx = V[:, 0] - o_xz[0]
            qz = V[:, 2] - o_xz[1]
            u = (qx * v_vec[1] - qz * v_vec[0]) / det
            v = (u_vec[0] * qz - u_vec[1] * qx) / det
            in_web = (u > 0.06) & (v > 0.06) & ((u + v) < 1.02) & (V[:, 1] < 0.020 * s)
            s_mid = np.where(in_web, 4.0 * np.maximum(u, 0.0) * np.maximum(v, 0.0) / np.maximum((u + v) ** 2, 1e-8), 0.0)
            pale = np.maximum(pale, 0.48 * np.clip(s_mid, 0.0, 1.0) * below_collar)

        shade = 1.0 + below_collar * ((0.94 + 0.12 * RP._noise(V, 0.008 * s, 17)) - 1.0)
        pale_s, shade_s = HD.soften(nb, np.clip(pale, 0.0, 1.0), np.clip(shade, 0.0, 1.15), times=2)
        C0 = np.concatenate([pf, np.clip(pale_s, 0.0, 1.0)[:, None]], axis=1)
        return C0, np.clip(shade_s, 0.0, 1.15), np.zeros(n, dtype=float)


def seg_proj(P, a, b):
    ab = b - a
    t = np.clip(((P - a) @ ab) / max(float(ab @ ab), 1e-12), 0.0, 1.0)
    d = np.linalg.norm(P - (a + t[:, None] * ab), axis=1)
    return d, t


def skin_leg(V, sculpt, skin_names, BP, BJ, BW, base_skin_names, collar_idx):
    """Compute smooth 4-bone (JOINTS_0, WEIGHTS_0) weights for vertices V on one side's digitigrade leg:
      - DigiThigh / DigiShin / DigiHock / DigiPaw blended smoothly across stifle, hock, and ankle joints;
      - Above y_cut - 0.055*s, blended into Human.body's own UpLeg/Hips weights so the collar moves identically with the hip."""
    sd = sculpt.sd
    s = sculpt.s
    smap = {nm: i for i, nm in enumerate(skin_names)}
    jt = smap[sd + 'DigiThigh']
    js = smap[sd + 'DigiShin']
    jh = smap[sd + 'DigiHock']
    jp = smap[sd + 'DigiPaw']

    d0, t0 = seg_proj(V, sculpt.p_thigh, sculpt.p_shin)
    d1, t1 = seg_proj(V, sculpt.p_shin, sculpt.p_hock)
    d2, t2 = seg_proj(V, sculpt.p_hock, sculpt.p_paw)
    # Paw region: forward/low around p_paw (wider radius on splayed saurian feet so toe tips & hallux stay 100% DigiPaw)
    paw_r = getattr(sculpt, 'paw_skin_r', 0.035 * s)
    d3 = np.maximum(0.0, np.linalg.norm(V - (sculpt.p_paw + np.array([0.0, 0.0, 0.035 * s])), axis=1) - paw_r)
    # Inverse-Gaussian proximity weights across the 4 segments for smooth skinning creases at stifle, hock, and wrist
    sig = 0.032 * s
    w0 = np.exp(-((d0 / sig) ** 2)) * (1.0 - sm(sculpt.p_shin[1] + 0.05 * s, sculpt.p_shin[1] - 0.10 * s, V[:, 1]))
    w1 = np.exp(-((d1 / sig) ** 2)) * sm(sculpt.p_shin[1] + 0.08 * s, sculpt.p_shin[1] - 0.06 * s, V[:, 1]) * (1.0 - sm(sculpt.p_hock[1] + 0.04 * s, sculpt.p_hock[1] - 0.08 * s, V[:, 1]))
    w2 = np.exp(-((d2 / sig) ** 2)) * sm(sculpt.p_hock[1] + 0.06 * s, sculpt.p_hock[1] - 0.05 * s, V[:, 1]) * (1.0 - sm(0.055 * s, 0.018 * s, V[:, 1]))
    w3 = (np.exp(-((d3 / max(0.045 * s, paw_r)) ** 2)) + 0.5) * sm(0.068 * s, 0.020 * s, V[:, 1])
    # Ensure positive total everywhere
    tot = w0 + w1 + w2 + w3
    bad = tot < 1e-8
    if bad.any():
        w0[bad] = 1.0
        tot[bad] = 1.0
    w0 /= tot; w1 /= tot; w2 /= tot; w3 /= tot

    # Collar blend into Human.body's own weights near y_cut
    c_blend = sm(sculpt.y_cut - 0.055 * s, sculpt.y_cut - 0.003 * s, V[:, 1])
    n = len(V)
    J_out = np.zeros((n, 4), dtype=np.uint16)
    W_out = np.zeros((n, 4), dtype=np.float32)
    for i in range(n):
        mix = {}
        dg_share = 1.0 - float(c_blend[i])
        if dg_share > 1e-5:
            for jid, ww in ((jt, w0[i]), (js, w1[i]), (jh, w2[i]), (jp, w3[i])):
                if ww * dg_share > 1e-5:
                    mix[jid] = mix.get(jid, 0.0) + float(ww * dg_share)
        if c_blend[i] > 1e-5:
            bi = int(collar_idx[i])
            btot = 0.0
            btemp = []
            for k in range(4):
                bw = float(BW[bi, k])
                if bw <= 1e-5:
                    continue
                bnm = base_skin_names[int(BJ[bi, k])]
                # Keep pelvic/upper-thigh base joints (Hips, LeftUpLeg, RightUpLeg) so collar matches unhidden base skin
                if bnm in smap:
                    btemp.append((smap[bnm], bw))
                    btot += bw
            if btot > 1e-5:
                for jid, bw in btemp:
                    mix[jid] = mix.get(jid, 0.0) + float(c_blend[i]) * (bw / btot)
            else:
                mix[jt] = mix.get(jt, 0.0) + float(c_blend[i])
        top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
        s_top = sum(v for _, v in top) or 1.0
        for k, (jid, ww) in enumerate(top):
            J_out[i, k] = jid
            W_out[i, k] = ww / s_top
    return J_out, W_out


def measure_girth_deltas(BP, BVID, d_base, W_skel, byn):
    """Measure per-target radial thickness change on the base thigh and calf so weight/muscle morphs thicken the canid leg."""
    T = d_base.shape[0]
    hip = W_skel[byn['LeftUpLeg']][:3, 3]
    knee = W_skel[byn['LeftLeg']][:3, 3]
    ank = W_skel[byn['LeftFoot']][:3, 3]
    d_th, t_th = seg_proj(BP, hip, knee)
    d_sh, t_sh = seg_proj(BP, knee, ank)
    sel_th = np.nonzero((BP[:, 0] > 0.01) & (t_th > 0.30) & (t_th < 0.75) & (d_th < 0.14))[0]
    sel_sh = np.nonzero((BP[:, 0] > 0.01) & (t_sh > 0.20) & (t_sh < 0.70) & (d_sh < 0.11))[0]
    r0_th = float(np.median(d_th[sel_th]))
    r0_sh = float(np.median(d_sh[sel_sh]))
    dr_th = np.zeros(T)
    dr_sh = np.zeros(T)
    return sel_th, sel_sh, r0_th, r0_sh, hip, knee, ank


def compute_piece_deltas(u_P, u_N, u_side, u_J, u_W, u_bvid, u_ycut, u_s, skin_names, d_joints_all, d_base, girth_info):
    """Per morph target and unique welded vertex of mod_legs_coyote:
      - exact weighted joint delta sum_k W_k * d_joint(J_k) so bones & mesh stay aligned under every height/proportion morph;
      - radial girth delta from weight/muscle/age morphs (tapering down to the lean hock & paw);
      - smooth blend to d_base[nearest_base_vid] at the upper-thigh collar so zero seam gap ever opens."""
    T = d_base.shape[0]
    N_u = len(u_P)
    D = np.zeros((T, N_u, 3), dtype=float)
    sel_th, sel_sh, r0_th, r0_sh, hip0, knee0, ank0 = girth_info

    # Precompute joint delta table aligned to skin_names
    dj_skin = np.stack([d_joints_all[nm] for nm in skin_names], axis=1)   # T x n_skin x 3

    # Weighted joint translation per unique vertex: (T, N_u, 3)
    for k in range(4):
        wk = u_W[:, k][None, :, None]
        D += wk * dj_skin[:, u_J[:, k], :]

    # Radial girth thickening/thinning from base thigh & calf morphs
    n_horiz = np.stack([u_N[:, 0], np.zeros(N_u), u_N[:, 2]], axis=1)
    n_len = np.linalg.norm(n_horiz, axis=1, keepdims=True)
    n_horiz = np.where(n_len > 1e-4, n_horiz / np.maximum(n_len, 1e-6), 0.0)
    u_y = np.clip((u_ycut - u_P[:, 1]) / np.maximum(u_ycut, 1e-6), 0.0, 1.0)
    # Taper girth strongly below the gaskin so the hock and pastern stay sinewy and paws stay crisp
    w_th_girth = (1.0 - sm(0.35, 0.65, u_y)) * sm(0.0, 0.12, u_y)
    w_sh_girth = sm(0.25, 0.50, u_y) * (1.0 - sm(0.58, 0.78, u_y)) * 0.75 + sm(0.58, 0.78, u_y) * 0.18

    BP_th, BVID_th = girth_info_bp = None, None   # computed per target below
    for t in range(T):
        du_l = d_joints_all['LeftUpLeg'][t]
        dk_l = d_joints_all['LeftLeg'][t]
        df_l = d_joints_all['LeftFoot'][t]
        # Measure radial change on base thigh & calf for target t
        if np.abs(d_base[t]).max() > 2e-4:
            p_th_t = girth_BP_cache['BP'][sel_th] + d_base[t, girth_BP_cache['BVID'][sel_th]]
            d1_th, _ = seg_proj(p_th_t, hip0 + du_l, knee0 + dk_l)
            dr_th = float(np.median(d1_th)) - r0_th

            p_sh_t = girth_BP_cache['BP'][sel_sh] + d_base[t, girth_BP_cache['BVID'][sel_sh]]
            d1_sh, _ = seg_proj(p_sh_t, knee0 + dk_l, ank0 + df_l)
            dr_sh = float(np.median(d1_sh)) - r0_sh

            dr = dr_th * w_th_girth + dr_sh * w_sh_girth
            D[t] += dr[:, None] * n_horiz

    # Exact collar blend at top of thigh: match Human.body vertex morph delta 1:1
    c_blend = sm(u_ycut - 0.055 * u_s, u_ycut - 0.003 * u_s, u_P[:, 1])
    hi = np.nonzero(c_blend > 1e-4)[0]
    if len(hi):
        cb = c_blend[hi][None, :, None]
        D[:, hi, :] = D[:, hi, :] * (1.0 - cb) + d_base[:, u_bvid[hi], :] * cb
    return D


girth_BP_cache = {}


def write_digi_glb(path, skin_names, J_skel, W_skel, byn, prims):
    """Write a digitigrade leg GLB with a single rooted joint tree under Hips (required by Godot's GLTF Skeleton3D importer)."""
    bin_, views, accs = bytearray(), [], []

    def add_view(raw, target=None):
        while len(bin_) % 4:
            bin_.append(0)
        views.append({'buffer': 0, 'byteOffset': len(bin_), 'byteLength': len(raw), **({'target': target} if target else {})})
        bin_.extend(raw)
        return len(views) - 1

    def add(arr, ctype, typ, target=None, minmax=False):
        arr = np.ascontiguousarray(arr)
        bv = add_view(arr.tobytes(), target)
        a = {'bufferView': bv, 'componentType': ctype, 'count': len(arr), 'type': typ}
        if minmax:
            a['min'] = arr.min(0).tolist()
            a['max'] = arr.max(0).tolist()
        accs.append(a)
        return len(accs) - 1

    images, textures = [], []

    def add_tex(pair):
        data, mime = pair
        images.append({'bufferView': add_view(data), 'mimeType': mime})
        textures.append({'source': len(images) - 1, 'sampler': 0})
        return len(textures) - 1

    meshes, mats = [], []
    for p in prims:
        attrs = {
            'POSITION': add(p['V'].astype(np.float32), 5126, 'VEC3', 34962, True),
            'NORMAL': add(p['N'].astype(np.float32), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add(p['U'].astype(np.float32), 5126, 'VEC2', 34962),
            'TEXCOORD_1': add(p['U2'].astype(np.float32), 5126, 'VEC2', 34962),
            'COLOR_0': add(p['C'].astype(np.float32), 5126, 'VEC4' if p['C'].shape[1] == 4 else 'VEC3', 34962),
            'JOINTS_0': add(p['J'].astype(np.uint16), 5123, 'VEC4', 34962),
            'WEIGHTS_0': add(p['W'].astype(np.float32), 5126, 'VEC4', 34962),
            '_VIDX': add(p['vid'].astype(np.float32).reshape(-1, 1), 5126, 'SCALAR', 34962),
        }
        idx = add(p['T'].astype(np.uint32).ravel(), 5125, 'SCALAR', 34963)
        pbr = {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0.0, 'roughnessFactor': p['rough']}
        if p.get('tex'):
            pbr['baseColorTexture'] = {'index': add_tex(p['tex'])}
        mat = {'name': p['mat'], 'pbrMetallicRoughness': pbr}
        if p.get('nrm'):
            mat['normalTexture'] = {'index': add_tex(p['nrm'])}
        mats.append(mat)
        meshes.append({'name': p['mesh_name'], 'primitives': [{'attributes': attrs, 'indices': idx, 'material': len(mats) - 1}]})

    ibms = []
    nodes = []
    smap = {nm: k for k, nm in enumerate(skin_names)}
    for nm in skin_names:
        ji = byn[nm]
        j = J_skel[ji]
        M = W_skel[ji]
        ibms.append(np.linalg.inv(M).T.astype(np.float32))
        nodes.append({'name': 'mixamorig:' + nm, 'translation': list(j['t']), 'rotation': list(j['r'])})
    for k, nm in enumerate(skin_names):
        par = J_skel[byn[nm]]['parent']
        if par >= 0:
            pnm = J_skel[par]['name']
            nodes[smap[pnm]].setdefault('children', []).append(k)
    ibm_acc = add(np.stack(ibms).astype(np.float32), 5126, 'MAT4')
    joint_nodes = list(range(len(nodes)))
    mesh_nodes = []
    for k, me in enumerate(meshes):
        nodes.append({'name': me['name'], 'mesh': k, 'skin': 0})
        mesh_nodes.append(len(nodes) - 1)

    js = {
        'asset': {'version': '2.0', 'generator': 'krator core/charactermodels/tools/digitigrade.py'},
        'scene': 0,
        'scenes': [{'nodes': [0] + mesh_nodes}],
        'nodes': nodes,
        'meshes': meshes,
        'materials': mats,
        'skins': [{'joints': joint_nodes, 'inverseBindMatrices': ibm_acc}],
        'accessors': accs,
        'bufferViews': views,
        'buffers': [{'byteLength': len(bin_)}],
    }
    if textures:
        js['samplers'] = [{}]
        js['images'] = images
        js['textures'] = textures
    jb = json.dumps(js, separators=(',', ':')).encode('utf-8')
    jb += b' ' * ((4 - len(jb) % 4) % 4)
    while len(bin_) % 4:
        bin_.append(0)
    glb = (
        struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(bin_))
        + struct.pack('<II', len(jb), 0x4E4F534A) + jb
        + struct.pack('<II', len(bin_), 0x004E4942) + bytes(bin_)
    )
    write_bytes(path, glb)


def lizard_scale_maps(pieces):
    """Extract the exact scale albedo + normal map and roughness from mod_head_lizard.glb so leg scales match body skin_detail 1:1."""
    hpath = os.path.join(pieces, 'mod_head_lizard.glb')
    if os.path.exists(hpath):
        hj, hb = G.read_glb(open(hpath, 'rb').read())
        mat = next((m for m in hj.get('materials', []) if m.get('name') == 'Mod.head_lizard'), None)
        if mat:
            pbr = mat.get('pbrMetallicRoughness', {})
            rough = float(pbr.get('roughnessFactor', 0.55))
            tex, nrm = None, None
            if 'baseColorTexture' in pbr:
                im = hj['images'][hj['textures'][pbr['baseColorTexture']['index']]['source']]
                bv = hj['bufferViews'][im['bufferView']]
                tex = (bytes(hb[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']]), im.get('mimeType', 'image/png'))
            if 'normalTexture' in mat:
                im = hj['images'][hj['textures'][mat['normalTexture']['index']]['source']]
                bv = hj['bufferViews'][im['bufferView']]
                nrm = (bytes(hb[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']]), im.get('mimeType', 'image/jpeg'))
            if tex:
                return tex, nrm, rough
    import mods as MD
    import reptile as RP
    body_obj = MD.Body(os.path.join(pieces, 'base.glb'))
    sm_pair = RP.scale_map(MD.texture_mean(body_obj))
    if sm_pair:
        return sm_pair[0], sm_pair[1], 0.62
    return MD.scale_texture(MD.texture_mean(body_obj)), None, 0.55


def frog_skin_maps(pieces):
    """Extract the moist smooth skin albedo + normal map and roughness from mod_head_frog.glb so leg skin matches body & head 1:1."""
    fpath = os.path.join(pieces, 'mod_head_frog.glb')
    if os.path.exists(fpath):
        fj, fb = G.read_glb(open(fpath, 'rb').read())
        mat = next((m for m in fj.get('materials', []) if m.get('name') == 'Mod.head_frog'), None)
        if mat:
            pbr = mat.get('pbrMetallicRoughness', {})
            rough = float(pbr.get('roughnessFactor', 0.38))
            tex, nrm = None, None
            if 'baseColorTexture' in pbr:
                im = fj['images'][fj['textures'][pbr['baseColorTexture']['index']]['source']]
                bv = fj['bufferViews'][im['bufferView']]
                tex = (bytes(fb[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']]), im.get('mimeType', 'image/jpeg'))
            if 'normalTexture' in mat:
                im = fj['images'][fj['textures'][mat['normalTexture']['index']]['source']]
                bv = fj['bufferViews'][im['bufferView']]
                nrm = (bytes(fb[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']]), im.get('mimeType', 'image/jpeg'))
            if tex:
                return tex, nrm, rough
    import amphibian as AM
    import mods as MD
    import reptile as RP
    body_obj = MD.Body(os.path.join(pieces, 'base.glb'))
    sm_pair = RP.scale_map(MD.texture_mean(body_obj), library=AM.LIBRARY)
    if sm_pair:
        return sm_pair[0], sm_pair[1], 0.38
    return None, None, 0.38


def refresh_base_gshapes(pieces, kit):
    """Update base.gshapes.bin alone so Godot's skin region hider includes all digitigrade hide bitsets."""
    glb = os.path.join(pieces, 'base.glb')
    mbin = os.path.join(pieces, 'base.morph.bin')
    T = len(kit['morph']['targets'])
    ents = MM.unpack_morphs(open(mbin, 'rb').read())
    j, _ = G.read_glb(open(glb, 'rb').read())
    npz = {}
    for nd in j['nodes']:
        if 'mesh' in nd:
            mats = [j['materials'][p['material']]['name'] for p in j['meshes'][nd['mesh']]['primitives'] if 'material' in p]
            e = next((x for x in ents if x[0] == mats), None)
            if e is not None:
                npz['d_' + nd['name']] = MM.dense_morphs(e, T)
    key = lambda n: n if 'd_' + n in npz else None
    mat, BP, BT = MM.body_primitive(glb)
    items = kit['items']
    hid = [i for i, e in enumerate(items) if 'hide' in e]
    H = np.zeros((len(BT), len(hid)), bool)
    for k, i in enumerate(hid):
        H[:, k] = np.unpackbits(np.frombuffer(base64.b64decode(items[i]['hide']), np.uint8), bitorder='little')[:len(BT)].astype(bool)
    rows, tri_mask = np.unique(H, axis=0, return_inverse=True)
    cover = [[hid[k] for k in np.nonzero(r)[0]] for r in rows]
    out = MM.godot_shapes(glb, key, npz, tri_mask.reshape(-1), mat, cover)
    write_bytes(os.path.join(pieces, 'base.gshapes.bin'), out)
    # Keep mod_head_coyote.gshapes.bin as heads.py's clean empty GSH1 header (its meshes move rigidly on Head and carry blink in glTF)
    hglb = os.path.join(pieces, 'mod_head_coyote.glb')
    if os.path.exists(hglb):
        hdr = json.dumps({'meshes': {}}).encode('utf-8')
        write_bytes(os.path.join(pieces, 'mod_head_coyote.gshapes.bin'), b'GSH1' + struct.pack('<I', len(hdr)) + hdr)


def build_species_legs(
    species, body_name, pieces, kit, J, W, byn, chains, skin_names, BP, BT, BN, BVID, BJ, BW,
    base_skin_names, leg_mask, b_tree, d_base, d_joints_all, girth_info, hide_tris, hide_parts, digi_spec,
):
    """Sculpt, skin, pack GLB + KMR1 + GSH1, and register kit entry for 'coyote', 'lizard', or 'frog'."""
    is_lizard = species == 'lizard'
    is_frog = species == 'frog'
    mid = 'mod_legs_' + species
    sculpt_cls = FrogLegSculpt if is_frog else (LizardLegSculpt if is_lizard else LegSculpt)
    smap = {nm: i for i, nm in enumerate(skin_names)}
    uv_tile = 0.25 if is_frog else (0.085 if is_lizard else 1.0)
    sp_tex, sp_nrm, sp_rough = frog_skin_maps(pieces) if is_frog else (lizard_scale_maps(pieces) if is_lizard else (None, None, 0.88))

    leg_Vs, leg_Ts, leg_Us, leg_U2s, leg_Cs, leg_Ns, leg_Js, leg_Ws, leg_vids = [], [], [], [], [], [], [], [], []
    cl_Vs, cl_Ts, cl_Us, cl_U2s, cl_Cs, cl_Ns, cl_Js, cl_Ws, cl_vids = [], [], [], [], [], [], [], [], []
    u_P_list, u_N_list, u_J_list, u_W_list, u_bvid_list, u_ycut_list, u_s_list = [], [], [], [], [], [], []
    vid_offset = 0

    for k_sd, sd in enumerate(SIDES):
        sc = sculpt_cls(sd, chains[sd], BP, BT, BN, leg_mask)
        s = sc.s
        c = chains[sd]
        xs = [c['DigiThigh'][0], c['DigiShin'][0], c['DigiHock'][0], c['DigiPaw'][0]]
        zs = [c['DigiThigh'][2], c['DigiShin'][2], c['DigiHock'][2], c['DigiPaw'][2]]
        y_ankle_lo = 0.044 * s
        y_ankle_hi = 0.062 * s
        f_leg = lambda P, sc=sc, y0=y_ankle_lo, ss=s: HD.smax(sc.sdf(P), y0 - P[:, 1], 0.004 * ss)
        g_leg = lambda P, f=f_leg, e=2e-4: (lambda g: g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12))(
            np.stack([f(P + np.array(o)) - f(P - np.array(o)) for o in ((e, 0, 0), (0, e, 0), (0, 0, e))], 1)
        )
        f_paw = lambda P, sc=sc, y1=y_ankle_hi, ss=s: HD.smax(
            sc.sdf(P) + 0.0005 * ss * sm(y1 - 0.010 * ss, y1, P[:, 1]),
            P[:, 1] - y1,
            0.003 * ss,
        )
        g_paw = lambda P, f=f_paw, e=1.5e-4: (lambda g: g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-12))(
            np.stack([f(P + np.array(o)) - f(P - np.array(o)) for o in ((e, 0, 0), (0, e, 0), (0, 0, e))], 1)
        )
        paw_wx = 0.130 if is_frog else (0.125 if is_lizard else 0.065)
        paw_z0 = 0.075 if is_frog else (0.100 if is_lizard else 0.055)
        paw_z1 = 0.190 if is_frog else (0.180 if is_lizard else 0.115)
        paw_cell = (0.0028 if is_frog else (0.0034 if is_lizard else PAW_CELL)) * s
        parts_spec = [
            (f_leg, g_leg, np.array([min(xs) - 0.14 * s, y_ankle_lo - 0.015 * s, min(zs) - 0.08 * s]),
             np.array([max(xs) + 0.14 * s, sc.y_top + 0.02 * s, max(zs) + 0.12 * s]), LEG_CELL * s, 0.0),
            (f_paw, g_paw, np.array([c['DigiPaw'][0] - paw_wx * s, -0.012 * s, c['DigiPaw'][2] - paw_z0 * s]),
             np.array([c['DigiPaw'][0] + paw_wx * s, y_ankle_hi + 0.012 * s, c['DigiPaw'][2] + paw_z1 * s]), paw_cell, 60.0),
        ]
        for f_fn, g_fn, lo, hi, cell, u_off in parts_spec:
            V0, T0, N0, nb0 = HD.mesh_field(f_fn, g_fn, lo, hi, cell, smooth=2)
            if is_frog:
                C0, dens0, ln0 = sc.paint_frog(V0, N0, nb0)
            else:
                C0, dens0, ln0 = HD.soften(nb0, *sc.paint(V0, N0), times=2)

            _, near_bi = b_tree.query(V0)
            J0, W0 = skin_leg(V0, sc, skin_names, BP, BJ, BW, base_skin_names, near_bi)
            vids0 = np.arange(vid_offset, vid_offset + len(V0), dtype=np.int32)
            vid_offset += len(V0)

            u_P_list.append(V0)
            u_N_list.append(N0)
            u_J_list.append(J0)
            u_W_list.append(W0)
            u_bvid_list.append(BVID[near_bi])
            u_ycut_list.append(np.full(len(V0), sc.y_cut))
            u_s_list.append(np.full(len(V0), s))

            V_s, T_s, U_s, N_s, C_s, dens_s, ln_s, J_s, W_s, vid_s = HD.box_uv(
                V0, T0, N0, C0, dens0, ln0, J0, W0, vids0
            )
            if is_lizard or is_frog:
                U_s = U_s / uv_tile
            else:
                U_s[:, 0] += 200.0 * (k_sd + 1) + u_off
            v_base = sum(len(x) for x in leg_Vs)
            leg_Vs.append(V_s)
            leg_Ts.append(T_s + v_base)
            leg_Us.append(U_s)
            leg_U2s.append(np.stack([dens_s, ln_s], axis=1))
            leg_Cs.append(C_s)
            leg_Ns.append(N_s)
            leg_Js.append(J_s)
            leg_Ws.append(W_s)
            leg_vids.append(vid_s)

        if not is_frog:
            cV, cN, cC, cT = sc.claws_mesh()
            _, c_near_bi = b_tree.query(cV)
            cJ = np.zeros((len(cV), 4), dtype=np.uint16)
            cW = np.zeros((len(cV), 4), dtype=np.float32)
            cJ[:, 0] = smap[sd + 'DigiPaw']
            cW[:, 0] = 1.0
            cvids = np.arange(vid_offset, vid_offset + len(cV), dtype=np.int32)
            vid_offset += len(cV)

            u_P_list.append(cV)
            u_N_list.append(cN)
            u_J_list.append(cJ)
            u_W_list.append(cW)
            u_bvid_list.append(BVID[c_near_bi])
            u_ycut_list.append(np.full(len(cV), sc.y_cut))
            u_s_list.append(np.full(len(cV), s))

            cv_base = sum(len(x) for x in cl_Vs)
            cl_Vs.append(cV)
            cl_Ts.append(cT + cv_base)
            cl_Us.append(np.full((len(cV), 2), [0.5, 1e4]))
            cl_U2s.append(np.zeros((len(cV), 2)))
            cl_Cs.append(cC)
            cl_Ns.append(cN)
            cl_Js.append(cJ)
            cl_Ws.append(cW)
            cl_vids.append(cvids)

    leg_mat = 'Mod.%s_legs' % species
    prims = [
        {
            'mesh_name': mid,
            'mat': leg_mat,
            'rough': sp_rough,
            'tex': sp_tex,
            'nrm': sp_nrm,
            'V': np.concatenate(leg_Vs),
            'N': np.concatenate(leg_Ns),
            'U': np.concatenate(leg_Us),
            'U2': np.concatenate(leg_U2s),
            'C': np.concatenate(leg_Cs),
            'J': np.concatenate(leg_Js),
            'W': np.concatenate(leg_Ws),
            'T': np.concatenate(leg_Ts),
            'vid': np.concatenate(leg_vids),
        },
    ]
    if cl_Vs:
        prims.append({
            'mesh_name': mid + '_claws',
            'mat': 'Mod.%s_claws' % species,
            'rough': 0.30 if is_lizard else 0.32,
            'V': np.concatenate(cl_Vs),
            'N': np.concatenate(cl_Ns),
            'U': np.concatenate(cl_Us),
            'U2': np.concatenate(cl_U2s),
            'C': np.concatenate(cl_Cs),
            'J': np.concatenate(cl_Js),
            'W': np.concatenate(cl_Ws),
            'T': np.concatenate(cl_Ts),
            'vid': np.concatenate(cl_vids),
        })

    glb_path = os.path.join(pieces, mid + '.glb')
    write_digi_glb(glb_path, skin_names, J, W, byn, prims)

    D = compute_piece_deltas(
        np.concatenate(u_P_list),
        np.concatenate(u_N_list),
        None,
        np.concatenate(u_J_list),
        np.concatenate(u_W_list),
        np.concatenate(u_bvid_list),
        np.concatenate(u_ycut_list),
        np.concatenate(u_s_list),
        skin_names,
        d_joints_all,
        d_base,
        girth_info,
    )
    npz = {'d_' + mid: D}
    m_ents = MM.mesh_entries(glb_path, lambda n: mid)
    write_bytes(glb_path[:-4] + '.morph.bin', MM.pack_morphs(m_ents, npz))
    write_bytes(glb_path[:-4] + '.gshapes.bin', MM.godot_shapes(glb_path, lambda n: mid, npz))

    entry = {
        'id': mid,
        'name': 'Digitigrade legs (%s)' % species,
        'slot': 'mods',
        'glb': 'pieces/%s/%s.glb' % (body_name, mid),
        'group': 'legs',
        'kind': 'genetic' if (is_lizard or is_frog) else 'therian',
        'hide': HD.bits(kit['base_tris'], hide_tris),
        'hides': int(len(hide_tris)),
        'hide_parts': hide_parts,
        'replaces_feet': True,
        'digitigrade': digi_spec,
    }
    if is_lizard or is_frog:
        entry['test'] = True
        if is_frog:
            fg_head = next((it for it in kit['items'] if it['id'] == 'mod_head_frog'), None)
            if fg_head and 'pattern' in fg_head:
                entry['pattern'] = json.loads(json.dumps(fg_head['pattern']))
    else:
        entry['furred'] = True
        entry['fur'] = [[-1000.0, 1000.0, 'brush', 0, 0]]

    at = [i for i, it in enumerate(kit['items']) if it['id'] == mid]
    if at:
        kit['items'][at[0]] = entry
    else:
        kit['items'].append(entry)

    if is_frog:
        kit['tint']['roles']['Mod.frog_legs'] = 'pattern'
    elif is_lizard:
        kit['tint']['roles']['Mod.lizard_legs'] = 'skin'
    else:
        kit['tint']['roles']['Mod.coyote_legs'] = 'coat'
        kit['tint']['gain']['coat'] = round(kit['tint']['gain']['hair'] / SHADE, 4)
        for it in kit['items']:
            if it['id'] == 'mod_tail_coyote':
                it.pop('test', None)

    cl_v = len(prims[1]['V']) if len(prims) > 1 else 0
    cl_t = len(prims[1]['T']) if len(prims) > 1 else 0
    print(
        '%-12s %s: %d + %d verts, %d + %d tris, hides %d base tris, joints %d..%d, max delta %.3f m'
        % (
            body_name,
            mid,
            len(prims[0]['V']),
            cl_v,
            len(prims[0]['T']),
            cl_t,
            len(hide_tris),
            len(J) - 8,
            len(J) - 1,
            float(np.abs(D).max()),
        )
    )


def run(body_name, lizard_only=False, frog_only=False):
    pieces = os.path.join(ROOT, 'pieces', body_name)
    data = os.path.join(ROOT, 'data', body_name)
    kp = os.path.join(data, 'kit.json')
    sp = os.path.join(data, 'skeleton.json')
    kit = json.load(open(kp, encoding='utf-8'))
    skel = json.load(open(sp, encoding='utf-8'))

    strip(kit, skel)
    J = skel['joints']
    byn = {j['name']: i for i, j in enumerate(J)}
    W = NH.fk(J)

    b_js, b_bin = G.read_glb(open(os.path.join(pieces, 'base.glb'), 'rb').read())
    b_prim = next(p for m in b_js['meshes'] for p in m['primitives'] if b_js['materials'][p['material']]['name'] == 'Human.body')
    BP = G.accessor(b_js, b_bin, b_prim['attributes']['POSITION']).astype(float)
    BT = G.accessor(b_js, b_bin, b_prim['indices']).reshape(-1, 3).astype(int)
    BVID = np.rint(G.accessor(b_js, b_bin, b_prim['attributes']['_VIDX']).reshape(-1)).astype(int)
    BJ = G.accessor(b_js, b_bin, b_prim['attributes']['JOINTS_0']).astype(int)
    BW = G.accessor(b_js, b_bin, b_prim['attributes']['WEIGHTS_0']).astype(float)
    b_skin = b_js['skins'][0]
    base_skin_names = [G.short(b_js['nodes'][ni]['name']) for ni in b_skin['joints']]
    girth_BP_cache['BP'] = BP
    girth_BP_cache['BVID'] = BVID

    BN = np.zeros_like(BP)
    fn = np.cross(BP[BT[:, 1]] - BP[BT[:, 0]], BP[BT[:, 2]] - BP[BT[:, 0]])
    for k in range(3):
        np.add.at(BN, BT[:, k], fn)
    bn_vid = np.zeros((int(BVID.max()) + 1, 3))
    np.add.at(bn_vid, BVID, BN)
    BN = bn_vid[BVID]
    BN /= np.maximum(np.linalg.norm(BN, axis=1, keepdims=True), 1e-12)

    leg_set = {'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase'}
    low_set = {'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightLeg', 'RightFoot', 'RightToeBase'}
    leg_w = np.zeros(len(BP))
    low_w = np.zeros(len(BP))
    for k in range(4):
        nms = [base_skin_names[int(j)] for j in BJ[:, k]]
        leg_w += BW[:, k] * np.array([nm in leg_set for nm in nms])
        low_w += BW[:, k] * np.array([nm in low_set for nm in nms])
    leg_mask = leg_w > 0.25

    T_cnt = len(kit['morph']['targets'])
    ents = NH.read_kmr1(open(os.path.join(pieces, 'base.morph.bin'), 'rb').read())
    d_base = NH.dense(next(e for e in ents if 'Human.body' in e[0]), T_cnt)
    sole_vids = np.unique(BVID[BP[:, 1] < 0.005])

    chains = bind_chain(W, byn)
    append_skeleton(skel, W, byn, chains)
    J = skel['joints']
    byn = {j['name']: i for i, j in enumerate(J)}
    W = NH.fk(J)
    add_joint_morphs(kit, skel, chains, d_base, sole_vids)
    dj_fn, _ = NH.joint_delta_fn(kit, J)
    d_joints_all = {j['name']: dj_fn(j['name']) for j in J}

    skin_names = ['Hips', 'LeftUpLeg', 'RightUpLeg'] + JOINTS
    b_tree = cKDTree(BP)
    girth_info = measure_girth_deltas(BP, BVID, d_base, W, byn)

    y_cut_val = chains['Left']['DigiThigh'][1] - 0.24 * (chains['Left']['DigiThigh'][1] - 0.542 * chains['Left']['H'])
    tri_cent = BP[BT].mean(1)
    tri_leg_w = leg_w[BT].mean(1)
    tri_low_w = low_w[BT].mean(1)
    hide_tris = np.nonzero((tri_low_w > 0.15) | ((tri_leg_w > 0.45) & (tri_cent[:, 1] < y_cut_val)))[0]
    have_mats = {b_js['materials'][p['material']]['name'] for m in b_js['meshes'] for p in m['primitives'] if 'material' in p}
    hide_parts = [p for p in ('Human.toenails',) if p in have_mats]

    s0 = chains['Left']['H'] / H_REF
    digi_spec = {
        'sides': {sd: [sd + p for p in PARTS] for sd in SIDES},
        'radii': {
            'thigh': [round(0.082 * s0, 4), round(0.056 * s0, 4)],
            'shin': [round(0.054 * s0, 4), round(0.030 * s0, 4)],
            'meta': [round(0.030 * s0, 4), round(0.038 * s0, 4)],
        },
        'paw_ball_y': round(float(chains['Left']['DigiPaw'][1]), 4),
        'hock_y': round(float(chains['Left']['DigiHock'][1]), 4),
    }

    if frog_only:
        want_species = ['frog']
    elif lizard_only:
        want_species = ['lizard']
    else:
        want_species = ['coyote', 'lizard', 'frog'] if body_name in ('mpfb_male', 'mpfb_female') else ['lizard', 'frog']
    for sp_kind in want_species:
        build_species_legs(
            sp_kind, body_name, pieces, kit, J, W, byn, chains, skin_names, BP, BT, BN, BVID, BJ, BW,
            base_skin_names, leg_mask, b_tree, d_base, d_joints_all, girth_info, hide_tris, hide_parts, digi_spec,
        )

    with open(kp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(kit, f, indent=1)
    with open(sp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(skel, f, indent=1)

    refresh_base_gshapes(pieces, kit)


if __name__ == '__main__':
    lizard_only = '--lizard-only' in sys.argv[1:]
    frog_only = '--frog-only' in sys.argv[1:]
    bodies = [x for x in sys.argv[1:] if x.startswith('mpfb_')] or ['mpfb_male', 'mpfb_female', 'mpfb_giant']
    for bd in bodies:
        run(bd, lizard_only=lizard_only, frog_only=frog_only)
